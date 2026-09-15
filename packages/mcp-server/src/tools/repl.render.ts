import {
  applyPatch,
  buildPreview,
  buildPreviewSummary,
  loadComponentRegistry,
  summarizeMeta,
  validateComponents,
  validateSchema,
} from './repl.utils.js';
import { getCssForComponents } from '../render/css-extractor.js';
import { renderDocument } from '../render/document.js';
import { resolveTokenOverlay, resolveSkinOverlay } from '../render/brand-overlay.js';
import { loadStyleLibrary } from '../render/style-library.js';
import { renderFragmentsWithErrors, renderTree } from '../render/tree-renderer.js';
import type {
  ReplIssue,
  ReplJsonPatchOperation,
  ReplRenderFormat,
  ReplRenderInput,
  ReplRenderOutput,
  ReplValidationMeta,
  UiElement,
  UiSchema,
} from '../schemas/generated.js';
import { resolveSchemaRef } from './schema-ref.js';

function asWarnings(issues: ReplIssue[]): ReplIssue[] {
  return issues.map((entry) => ({ ...entry, severity: entry.severity ?? 'warning' }));
}

function cloneTree(tree: UiSchema | undefined): UiSchema | undefined {
  return tree ? structuredClone(tree) : undefined;
}

function normalizeOutputFormat(input: ReplRenderInput): ReplRenderFormat {
  return input.output?.format === 'fragments' ? 'fragments' : 'document';
}

function normalizeStrict(input: ReplRenderInput): boolean {
  return input.output?.strict ?? false;
}

function normalizeCompact(input: ReplRenderInput): boolean {
  // Default compact=true: omit the ~79KB token CSS so MCP responses stay within
  // result-size caps (Workbench signal). Kept in lock-step with the schema
  // default (repl.render.input.json / repl.input.json) so the bridge transport
  // and a direct handler import produce identical output — the transparency
  // invariant the bridge/e2e parity tests guard. Opt back into full token CSS
  // with output.compact=false (or fetch it via the tokenCssRef + tokens.build).
  return input.output?.compact ?? true;
}

function normalizeIncludeCss(input: ReplRenderInput): boolean {
  return input.output?.includeCss ?? true;
}

function normalizeTokenOverlay(input: ReplRenderInput): Record<string, unknown> | undefined {
  const overlay = input.output?.tokenOverlay;
  return overlay && typeof overlay === 'object' && !Array.isArray(overlay)
    ? (overlay as Record<string, unknown>)
    : undefined;
}

function normalizeSkinOverlay(input: ReplRenderInput): Record<string, unknown> | undefined {
  const overlay = input.output?.skinOverlay;
  return overlay && typeof overlay === 'object' && !Array.isArray(overlay)
    ? (overlay as Record<string, unknown>)
    : undefined;
}

function toComponentCssRef(componentName: string): string {
  return `cmp.${componentName.trim().toLowerCase()}.base`;
}

function normalizeShowConfidence(input: ReplRenderInput): boolean {
  return input.output?.showConfidence === true;
}

function normalizeConfidenceThreshold(input: ReplRenderInput): number {
  const raw = input.output?.confidenceThreshold;
  if (typeof raw === 'number' && raw >= 0 && raw <= 1) return raw;
  return 0.5;
}

/**
 * Strip confidence metadata from all nodes in the tree.
 * Used when showConfidence is not enabled to preserve backward compat.
 */
function stripConfidence(schema: UiSchema): void {
  const walk = (el: UiElement): void => {
    if (el.meta) {
      delete el.meta.confidence;
      delete el.meta.confidenceLevel;
    }
    el.children?.forEach(walk);
  };
  schema.screens.forEach(walk);
}

/**
 * Apply low-confidence CSS class to nodes below the threshold.
 * Adds 'oods-low-confidence' to the node's existing className prop.
 */
function applyLowConfidenceClass(schema: UiSchema, threshold: number): void {
  const walk = (el: UiElement): void => {
    if (el.meta?.confidence !== undefined && el.meta.confidence < threshold) {
      el.props = el.props ?? {};
      const existing = typeof el.props.className === 'string' ? el.props.className : '';
      el.props.className = existing ? `${existing} oods-low-confidence` : 'oods-low-confidence';
    }
    el.children?.forEach(walk);
  };
  schema.screens.forEach(walk);
}

function toFragmentRenderIssue(nodeId: string, component: string, message: string): ReplIssue {
  return {
    code: 'OODS-S007',
    message: `Fragment render failed for node '${nodeId}': ${message}`,
    path: `/fragments/${nodeId}`,
    component,
  };
}

export async function handle(input: ReplRenderInput): Promise<ReplRenderOutput> {
  const mode = input.mode ?? 'full';
  const registry = loadComponentRegistry();
  const errors: ReplIssue[] = [];
  const warnings: ReplIssue[] = asWarnings(registry.warnings);

  let workingTree: UiSchema | undefined = undefined;
  let normalizedPatch: ReplJsonPatchOperation[] | undefined;
  let appliedPatch = false;
  let meta: ReplValidationMeta | undefined;

  let documentTitle: string | undefined;
  if (mode === 'full') {
    if (input.schema) {
      workingTree = cloneTree(input.schema);
    } else if (input.schemaRef) {
      const resolved = resolveSchemaRef(input.schemaRef);
      if (resolved.ok) {
        workingTree = resolved.schema;
        documentTitle = resolved.record.label;
      } else {
        const code = resolved.reason === 'expired' ? 'OODS-N004' : 'OODS-N003';
        errors.push({
          code,
          message: `schemaRef '${input.schemaRef}' is ${resolved.reason}.`,
          hint: 'schemaRefs live in the server process that issued them, so a restarted client does not know earlier refs. Run design.compose again in this session for a fresh schemaRef, pass the schema inline via the schema field, or keep one across sessions with schema.save and schema.load.',
        });
      }
    } else {
      errors.push({ code: 'OODS-V009', message: 'schema is required when mode=full' });
    }
  } else {
    workingTree = cloneTree(input.baseTree);
    if (!workingTree) {
      errors.push({ code: 'OODS-V010', message: 'baseTree is required when mode=patch' });
    }
    if (workingTree && input.patch) {
      const patchResult = applyPatch(workingTree, input.patch);
      workingTree = patchResult.tree;
      normalizedPatch = patchResult.normalized.length ? patchResult.normalized : undefined;
      errors.push(...patchResult.issues);
      appliedPatch = true;
    }
  }

  if (workingTree) {
    errors.push(...validateSchema(workingTree));
    errors.push(...validateComponents(workingTree, registry));
    meta = summarizeMeta(workingTree, registry);
  }

  const format = normalizeOutputFormat(input);
  const strict = normalizeStrict(input);
  const compact = normalizeCompact(input);
  if (format === 'fragments') {
    const ignored = [input.brand !== undefined ? 'brand' : '', input.output?.tokenOverlay !== undefined ? 'output.tokenOverlay' : '', input.output?.skinOverlay !== undefined ? 'output.skinOverlay' : ''].filter(Boolean);
    if (ignored.length) warnings.push({ code: 'OODS-W001', message: `Fragment output ignores ${ignored.join(', ')}; use document format to apply these options.` });
  }

  // In non-strict fragment mode, UNKNOWN_COMPONENT errors should not block the
  // entire render. They are deferred and reported as per-node errors after
  // rendering, so known components still produce fragments.
  let deferredUnknownErrors: ReplIssue[] = [];
  if (input.apply === true && format === 'fragments' && !strict) {
    deferredUnknownErrors = errors.filter((e) => e.code === 'OODS-V006');
    if (deferredUnknownErrors.length > 0) {
      const remaining = errors.filter((e) => e.code !== 'OODS-V006');
      errors.length = 0;
      errors.push(...remaining);
      warnings.push({ code: 'OODS-W002', message: `Non-strict fragment output reclassifies ${deferredUnknownErrors.length} OODS-V006 issue(s) as per-node errors; known fragments may still render.` });
    }
  }

  let status: ReplRenderOutput['status'] = errors.length ? 'error' : 'ok';
  const dslVersion = workingTree?.version ?? input.schema?.version ?? '0.0.0';

  const preview = workingTree ? buildPreview(workingTree, input.researchContext) : undefined;
  if (preview && warnings.length) {
    const warningNotes = warnings.map((entry) => entry.message);
    preview.notes = preview.notes ? [...preview.notes, ...warningNotes] : warningNotes;
  }

  const output: ReplRenderOutput = {
    status,
    mode,
    dslVersion,
    registryVersion: registry.version,
    errors,
    warnings,
    preview,
  };

  const includeTree = input.options?.includeTree ?? true;
  if (workingTree && includeTree) {
    output.renderedTree = workingTree;
  }
  if (normalizedPatch) {
    output.normalizedPatch = normalizedPatch as ReplRenderOutput['normalizedPatch'];
  }
  if (appliedPatch) {
    output.appliedPatch = true;
  }
  if (meta) {
    output.meta = meta;
  }

  if (input.apply === true && status === 'ok' && workingTree) {
    // Confidence affordance: opt-in gate
    const showConfidence = normalizeShowConfidence(input);
    if (showConfidence) {
      applyLowConfidenceClass(workingTree, normalizeConfidenceThreshold(input));
    } else {
      stripConfidence(workingTree);
    }

    if (format === 'fragments') {
      const includeCss = compact ? false : normalizeIncludeCss(input);
      const { fragments: fragmentMap, errors: fragmentErrors } = renderFragmentsWithErrors(workingTree);

      // Per-node isolation: remove fallback fragments for unknown top-level
      // components and report them as per-node UNKNOWN_COMPONENT errors.
      if (deferredUnknownErrors.length > 0) {
        for (const screen of workingTree.screens) {
          const children = Array.isArray(screen.children) ? screen.children : [];
          for (const node of children) {
            if (registry.names.size > 0 && !registry.names.has(node.component)) {
              fragmentMap.delete(node.id);
              output.errors.push({
                code: 'OODS-V006',
                message: `Component '${node.component}' is not in the OODS registry`,
                path: `/fragments/${node.id}`,
                component: node.component,
                nodeId: node.id,
              });
            }
          }
        }
      }

      if (fragmentErrors.length > 0) {
        const mapped = fragmentErrors.map((entry) => toFragmentRenderIssue(entry.nodeId, entry.component, entry.message));
        output.errors.push(...mapped);
      }

      const hasFragmentFailures = fragmentErrors.length > 0 || deferredUnknownErrors.length > 0;
      if (strict && hasFragmentFailures) {
        status = 'error';
      }

      if (!strict || !hasFragmentFailures) {
        const components = Array.from(fragmentMap.values()).map((entry) => entry.component);
        const cssPayload = getCssForComponents(components, includeCss);
        const includesTokensCss = cssPayload.cssRefs.includes('css.tokens');
        const fragments: NonNullable<ReplRenderOutput['fragments']> = {};

        for (const [nodeId, fragment] of fragmentMap.entries()) {
          const cssRefs = ['css.base'];
          if (includesTokensCss) {
            cssRefs.push('css.tokens');
          }
          const componentRef = toComponentCssRef(fragment.component);
          if (cssPayload.css[componentRef]) {
            cssRefs.push(componentRef);
          }

          fragments[nodeId] = {
            nodeId: fragment.nodeId,
            component: fragment.component,
            html: fragment.html,
            cssRefs,
          };
        }

        if (Object.keys(fragments).length > 0) {
          output.fragments = fragments;
          output.css = cssPayload.css;
        }
      }

      if (!strict && hasFragmentFailures && fragmentMap.size > 0) {
        status = 'ok';
      } else if (hasFragmentFailures && fragmentMap.size === 0) {
        status = 'error';
      }
    } else {
      // Document path only (apply===true is already guaranteed by the guard above). An inline
      // tokenOverlay (--oods- token path) and/or skinOverlay (--sys-/--ref- colour skin) each
      // resolve to a sanitized scoped :root{} block; they are CONCATENATED and appended to the
      // component CSS so both overrides reach the same DOM vars the components consume. The two
      // blocks share no var names (--oods- vs --sys-/--ref-) and emitRootBlock's first-wins `seen`
      // Set is per-call, so they never cross-contaminate. Absent/empty both => no componentCss
      // passed => byte-identical to the prior document output; tokenOverlay-only collapses to the
      // single overlayBlock exactly as before. The fragments branch and the echoed output.output
      // assembly are never touched.
      const screenHtml = renderTree(workingTree);
      const overlay = normalizeTokenOverlay(input);
      const overlayBlock = overlay ? resolveTokenOverlay(overlay) : '';
      const skin = normalizeSkinOverlay(input);
      const skinBlock = skin ? resolveSkinOverlay(skin, loadStyleLibrary()) : '';
      const combined = [overlayBlock, skinBlock].filter(Boolean).join('\n');
      output.html = renderDocument({
        screenHtml,
        schema: workingTree,
        compact,
        // The document is titled after what it shows (the composed object and context, or the
        // screen's own title); "OODS Preview" remains only for an untitled inline schema.
        ...(documentTitle ? { title: documentTitle } : {}),
        // s169 m04 — brand. `renderDocument` already accepted and escaped `brand`; only
        // this plumbing was missing. Passed ONLY when supplied, so `normalizeBrand`'s
        // 'default' fallback (and every byte of the existing document) is untouched
        // otherwise. Deliberately NOT defaulted to 'A': `data-brand="default"` matches no
        // generated block, which is the correct meaning of "no brand requested".
        ...(input.brand ? { brand: input.brand } : {}),
        ...(combined ? { componentCss: combined } : {}),
      });
    }

    if (compact) {
      output.tokenCssRef = 'tokens.build';
    }

    output.output = { format, strict, ...(compact ? { compact } : {}) };
  }

  output.status = status;
  if (output.preview) {
    const errorCount = output.status === 'error' ? output.errors.length : 0;
    output.preview.summary = buildPreviewSummary((output.preview.screens ?? []).length, errorCount);
  }

  return output;
}
