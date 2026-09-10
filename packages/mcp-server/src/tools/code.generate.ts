import { preflightCollections } from '../codegen/collection-emitter.js';
import { prepareChartAssets } from '../codegen/chart-assets.js';
import { loadComponentRegistry, validateSchema } from './repl.utils.js';
import { emit as emitHtml } from '../codegen/html-emitter.js';
import { emit as emitReact } from '../codegen/react-emitter.js';
import { emit as emitVue } from '../codegen/vue-emitter.js';
import type { UiSchema } from '../schemas/generated.js';
import type { CodeGenerateInput, CodeGenerateOutput } from './types.js';
import type { Emitter, CodegenOptions, CodegenIssue } from '../codegen/types.js';
import { resolveSchemaRef } from './schema-ref.js';
import { loadOodsrc } from '../lib/oodsrc.js';
import {
  isKnownComponentForCodegen,
  preflightTargetCapabilities,
} from '../codegen/target-readiness.js';
import { preflightCodegenSyntax } from '../codegen/syntax-preflight.js';
import { buildGeneratedArtifact } from '../codegen/artifact-envelope.js';
import { preflightTargetContracts } from '../codegen/target-contracts.js';
import { preflightNormalizationSafety } from '../codegen/normalization-safety.js';
import { preflightStateContract } from '../codegen/state-contract.js';
import { hasMappedRenderer } from '../render/component-map.js';
import {
  bindReleaseEvidence,
  createValidationReceipt,
  enforceValidationProfile,
  recordValidationChecks,
} from '../codegen/validation-profile.js';

const emitters: Record<string, Emitter> = {
  html: emitHtml,
  react: emitReact,
  vue: emitVue,
};

export type CodeGenerateDependencies = {
  targetCapabilityPreflight?: typeof preflightTargetCapabilities;
};

function countNodes(screens: UiSchema['screens']): number {
  let count = 0;
  const stack = [...screens];
  while (stack.length > 0) {
    const node = stack.pop()!;
    count += 1;
    if (node.children) {
      stack.push(...node.children);
    }
  }
  return count;
}

function collectComponents(screens: UiSchema['screens']): Set<string> {
  const components = new Set<string>();
  const stack = [...screens];
  while (stack.length > 0) {
    const node = stack.pop()!;
    components.add(node.component);
    if (node.children) {
      stack.push(...node.children);
    }
  }
  return components;
}

function preflightHtmlTarget(screens: UiSchema['screens']): CodegenIssue[] {
  const issues: CodegenIssue[] = [];
  const stack = [...screens].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!hasMappedRenderer(node.component)) {
      issues.push({
        code: 'OODS-N013',
        message: `Component ${node.component} has no mapped HTML renderer; fallback output is forbidden at build or release confidence.`,
        nodeId: node.id,
        component: node.component,
      });
    }
    if (node.children) stack.push(...node.children.slice().reverse());
  }
  return issues;
}

export async function handle(
  input: CodeGenerateInput,
  dependencies: CodeGenerateDependencies = {},
): Promise<CodeGenerateOutput> {
  const { framework } = input;
  const warnings: CodegenIssue[] = [];
  let validationReceipt = createValidationReceipt(input.profile, framework);
  let schema: UiSchema | undefined = input.schema;

  if (!schema && input.schemaRef) {
    const resolved = resolveSchemaRef(input.schemaRef);
    if (resolved.ok) {
      schema = resolved.schema;
    } else {
      return {
        status: 'error',
        framework,
        code: '',
        fileExtension: '',
        imports: [],
        warnings,
        validationReceipt,
        errors: [
          {
            code: resolved.reason === 'expired' ? 'OODS-N004' : 'OODS-N003',
            message:
              `schemaRef '${input.schemaRef}' is ${resolved.reason}. ` +
              'Run design.compose again to obtain a fresh schemaRef, or pass schema inline via the schema field.',
          },
        ],
      };
    }
  }

  if (!schema) {
    return {
      status: 'error',
      framework,
      code: '',
      fileExtension: '',
      imports: [],
      warnings,
      validationReceipt,
      errors: [
        {
          code: 'OODS-V009',
          message: 'schema is required for code generation. Provide schema or schemaRef.',
        },
      ],
    };
  }

  // Validate the input schema structurally
  const schemaErrors = validateSchema(schema);
  validationReceipt = recordValidationChecks(validationReceipt, 'schema-structure');
  if (schemaErrors.length > 0) {
    return {
      status: 'error',
      framework,
      code: '',
      fileExtension: '',
      imports: [],
      warnings: [],
      validationReceipt,
      errors: schemaErrors.map((issue) => ({
        code: issue.code,
        message: issue.message,
        nodeId: issue.nodeId,
        component: issue.component,
      })),
    };
  }

  // Check component registry for unknown components
  const registry = loadComponentRegistry();
  const allComponents = collectComponents(schema.screens);
  const unknownComponents = Array.from(allComponents)
    .filter((componentName) => (
      registry.names.size > 0
        ? !registry.names.has(componentName)
        : framework !== 'html' && !isKnownComponentForCodegen(componentName, registry.names)
    ))
    .sort();
  const meta: CodeGenerateOutput['meta'] = {
    nodeCount: countNodes(schema.screens),
    componentCount: allComponents.size,
    ...(unknownComponents.length > 0 ? { unknownComponents } : {}),
  };

  // Resolve emitter
  const emitter = emitters[framework];
  if (!emitter) {
    return {
      status: 'error',
      framework,
      code: '',
      fileExtension: '',
      imports: [],
      warnings,
      validationReceipt,
      meta,
      errors: [{ code: 'OODS-V005', message: `No emitter registered for framework '${framework}'` }],
    };
  }

  validationReceipt = recordValidationChecks(
    validationReceipt,
    'component-registry',
  );
  const registryIssues: CodegenIssue[] = unknownComponents.length > 0
    ? [{
      code: 'OODS-V119',
      message:
        `Schema contains unregistered component${unknownComponents.length === 1 ? '' : 's'}: `
        + `${unknownComponents.join(', ')}. Fix the schema or run repl.validate before code generation.`,
    }]
    : [];

  const readinessErrors = framework === 'html'
    ? preflightHtmlTarget(schema.screens)
    : (dependencies.targetCapabilityPreflight ?? preflightTargetCapabilities)(
      schema.screens,
      framework,
    );
  const stateContractIssues = preflightStateContract(schema.screens, framework);
  validationReceipt = recordValidationChecks(
    validationReceipt,
    'state-contract',
    'target-readiness',
  );
  const earlyContractIssues = [
    ...registryIssues,
    ...preflightCollections(schema.screens, schema.objectSchema),
    ...stateContractIssues,
    ...readinessErrors,
  ];
  if (earlyContractIssues.length > 0) {
    // Evaluate these together: registry, state-vocabulary, and target gaps are
    // independent. Returning after the first would conceal actionable issues.
    const profiled = enforceValidationProfile(
      validationReceipt,
      earlyContractIssues,
    );
    warnings.push(...profiled.warnings);
    if (profiled.errors.length > 0) {
      return {
        status: 'error',
        framework,
        code: '',
        fileExtension: '',
        imports: [],
        warnings,
        validationReceipt,
        errors: profiled.errors,
        meta,
      };
    }
  }

  // Build codegen options (.oodsrc fallbacks between explicit and hardcoded defaults)
  const rc = loadOodsrc();
  const options: CodegenOptions = {
    typescript: input.options?.typescript ?? rc.typescript ?? true,
    styling: input.options?.styling ?? rc.styling ?? 'tokens',
    theme: input.options?.theme ?? 'light',
    brand: input.options?.brand ?? 'A',
  };

  if (framework === 'html' && options.styling === 'tailwind') {
    const profiled = enforceValidationProfile(validationReceipt, [{
      code: 'OODS-N018',
      message: 'HTML Tailwind styling is unavailable; the HTML target emits document CSS. Use tokens or inline, or choose React or Vue for Tailwind output.',
    }]);
    warnings.push(...profiled.warnings);
    if (profiled.errors.length > 0) {
      return {
        status: 'error',
        framework,
        code: '',
        fileExtension: '',
        imports: [],
        warnings,
        validationReceipt,
        errors: profiled.errors,
        meta,
      };
    }
  }

  const normalizationErrors = preflightNormalizationSafety(schema.screens, framework);
  validationReceipt = recordValidationChecks(validationReceipt, 'normalization-fidelity');
  if (normalizationErrors.length > 0) {
    const profiled = enforceValidationProfile(validationReceipt, normalizationErrors);
    warnings.push(...profiled.warnings);
    if (profiled.errors.length > 0) {
      return {
        status: 'error',
        framework,
        code: '',
        fileExtension: '',
        imports: [],
        warnings,
        validationReceipt,
        errors: profiled.errors,
        meta,
      };
    }
  }

  if (framework === 'react' || framework === 'vue') {
    const syntaxErrors = preflightCodegenSyntax(schema, framework, options.styling);
    validationReceipt = recordValidationChecks(
      validationReceipt,
      'binding-contract',
      'events-contract',
    );
    if (syntaxErrors.length > 0) {
      return {
        status: 'error',
        framework,
        code: '',
        fileExtension: '',
        imports: [],
        warnings,
        validationReceipt,
        errors: syntaxErrors,
        meta: {
          nodeCount: meta.nodeCount,
          componentCount: meta.componentCount,
        },
      };
    }
  }

  const contractResult = preflightTargetContracts(schema, framework);
  // A display's onChange that names no writer is inert: the display renders
  // its field, and the binding is reported, never discarded silently.
  for (const inert of contractResult.inertSubscriptions) {
    warnings.push({
      code: 'OODS-V007',
      message: `Binding ${inert.component}.onChange to ${inert.handlerName} ${inert.reason}.`,
      nodeId: inert.nodeId,
      component: inert.component,
    });
  }
  validationReceipt = recordValidationChecks(
    validationReceipt,
    ...(framework === 'html' ? ['binding-contract' as const] : []),
    ...contractResult.checks,
  );
  if (framework === 'html' && contractResult.bindingSafetyIssues.length > 0) {
    return {
      status: 'error',
      framework,
      code: '',
      fileExtension: '',
      imports: [],
      warnings,
      validationReceipt,
      errors: contractResult.bindingSafetyIssues,
      meta,
    };
  }
  if (contractResult.issues.length > 0) {
    const profiled = enforceValidationProfile(validationReceipt, contractResult.issues);
    warnings.push(...profiled.warnings);
    if (profiled.errors.length > 0) {
      return {
        status: 'error',
        framework,
        code: '',
        fileExtension: '',
        imports: [],
        warnings,
        validationReceipt,
        errors: profiled.errors,
        meta,
      };
    }
  }

  // Dispatch to framework emitter
  let prepared: Awaited<ReturnType<typeof prepareChartAssets>>;
  try {
    prepared = await prepareChartAssets(schema, options);
  } catch (error) {
    return { status: 'error', framework, code: '', fileExtension: '', imports: [], warnings, validationReceipt, meta,
      errors: [{ code: 'OODS-N016', message: error instanceof Error ? error.message : String(error) }] };
  }
  const result = emitter(prepared.schema, options);
  if (prepared.files.length && result.status === 'ok') {
    result.files = [...(result.files ?? [{ path: framework === 'html' ? 'index.html' : `src/GeneratedUI${result.fileExtension}`, contents: result.code }]), ...prepared.files];
  }

  // Merge warnings
  const allWarnings = [...warnings, ...result.warnings];
  validationReceipt = recordValidationChecks(validationReceipt, 'fallback-policy');
  if (framework === 'html' && result.code.includes('data-oods-fallback="true"')) {
    const profiled = enforceValidationProfile(validationReceipt, [{
      code: 'OODS-N013',
      message: 'Generated HTML contains a component fallback marker and is not runnable at build or release confidence.',
    }]);
    allWarnings.push(...profiled.warnings);
    if (profiled.errors.length > 0) {
      return {
        status: 'error',
        framework: result.framework,
        code: '',
        fileExtension: '',
        imports: [],
        warnings: allWarnings,
        validationReceipt,
        errors: profiled.errors,
        meta,
      };
    }
  }

  if (result.status !== 'ok') {
    return {
      status: result.status,
      framework: result.framework,
      code: result.code,
      fileExtension: result.fileExtension,
      imports: result.imports,
      warnings: allWarnings,
      validationReceipt,
      ...(result.errors?.length ? { errors: result.errors } : {}),
      meta,
    };
  }

  let artifact: NonNullable<CodeGenerateOutput['artifact']>;
  try {
    artifact = buildGeneratedArtifact(result.files
      ? { framework: result.framework, imports: result.imports, actions: result.actions, files: result.files }
      : { framework: result.framework, imports: result.imports, actions: result.actions, code: result.code, fileExtension: result.fileExtension });
  } catch (error) {
    validationReceipt = recordValidationChecks(validationReceipt, 'dependency-closure');
    return {
      status: 'error',
      framework: result.framework,
      code: '',
      fileExtension: '',
      imports: [],
      warnings: allWarnings,
      validationReceipt,
      errors: [{
        code: 'OODS-N016',
        message: error instanceof Error ? error.message : String(error),
      }],
      meta,
    };
  }

  validationReceipt = recordValidationChecks(validationReceipt, 'dependency-closure');
  const evidenceResult = bindReleaseEvidence(
    validationReceipt,
    input.releaseEvidence,
    artifact.contentHash,
  );
  validationReceipt = evidenceResult.receipt;
  if (evidenceResult.errors.length > 0) {
    return {
      status: 'error',
      framework: result.framework,
      code: '',
      fileExtension: '',
      imports: [],
      warnings: allWarnings,
      validationReceipt,
      errors: evidenceResult.errors,
      meta,
    };
  }

  return {
    status: result.status,
    framework: result.framework,
    artifact,
    code: result.code,
    fileExtension: result.fileExtension,
    imports: result.imports,
    warnings: allWarnings,
    validationReceipt,
    ...(result.errors?.length ? { errors: result.errors } : {}),
    meta,
  };
}
