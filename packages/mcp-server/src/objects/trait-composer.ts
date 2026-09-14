/**
 * Trait composition engine.
 * Given an object definition, merges trait schemas, view_extensions, semantics, and tokens
 * into a unified ComposedObject.
 */

import { loadTrait } from './trait-loader.js';
import type {
  FieldDefinition,
  ObjectDefinition,
  SemanticMapping,
  TraitDefinition,
  TraitReference,
  ViewExtension,
} from './types.js';

// ---- Composition output types ----

export interface ResolvedTrait {
  ref: TraitReference;
  definition: TraitDefinition;
}

export interface ComposedObject {
  /** Original object header */
  object: ObjectDefinition['object'];
  /** Resolved trait references with their full definitions */
  traits: ResolvedTrait[];
  /** Merged field schema: object fields override trait fields */
  schema: Record<string, FieldDefinition>;
  /** Merged semantic mappings: object overrides traits */
  semantics: Record<string, SemanticMapping>;
  /** Collected and priority-sorted view_extensions per context */
  viewExtensions: Record<string, ViewExtension[]>;
  /** Combined token map: object tokens override trait tokens */
  tokens: Record<string, unknown>;
  /** Collision/warning messages produced during composition */
  warnings: string[];
}

/** Internal type for tracking priority resolution order */
interface RankedExtension {
  extension: ViewExtension;
  traitOrder: number;
}

const BOUND_MARK_PREVIEWS: Readonly<Record<string, { chartType: string; component: string }>> = {
  MarkArea: { chartType: 'area', component: 'VizAreaPreview' },
  MarkBar: { chartType: 'bar', component: 'VizMarkPreview' },
  MarkLine: { chartType: 'line', component: 'VizLinePreview' },
  MarkGraph: { chartType: 'force_graph', component: 'VizGraphPreview' },
  MarkPoint: { chartType: 'scatter', component: 'VizPointPreview' },
  MarkRect: { chartType: 'heatmap', component: 'VizHeatmapPreview' },
};

/**
 * Compose an object definition by resolving all its traits.
 * Merges schemas (field collision = last-trait-wins + warning),
 * collects view_extensions (priority-sorted per context),
 * and combines token maps (object overrides traits).
 */
export function composeObject(objectDef: ObjectDefinition): ComposedObject {
  const warnings: string[] = [];
  const schema: Record<string, FieldDefinition> = {};
  const semantics: Record<string, SemanticMapping> = {};
  const extensionsByContext: Record<string, RankedExtension[]> = {};
  const tokens: Record<string, unknown> = {};
  const resolvedTraits: ResolvedTrait[] = [];

  // 1. Process each trait in declaration order
  const traits = objectDef.traits ?? [];
  for (let traitOrder = 0; traitOrder < traits.length; traitOrder++) {
    const ref = traits[traitOrder];
    let traitDef: TraitDefinition;
    try {
      traitDef = loadTrait(ref.name);
    } catch (err) {
      warnings.push(
        `Failed to load trait "${ref.name}": ${(err as Error).message}`,
      );
      continue;
    }

    // A bound chart projects existing domain fields. Mark controls belong only
    // to unbound visualization objects, never to their host's form or schema.
    if (traitDef.trait.name.startsWith('Mark') && ref.parameters?.chart) {
      const preview = BOUND_MARK_PREVIEWS[traitDef.trait.name];
      if (!preview) throw new Error(`Bound chart trait "${traitDef.trait.name}" has no supported preview projection.`);
      const chart = ref.parameters.chart;
      if (typeof chart !== 'object' || Array.isArray(chart) || !('chartType' in chart) || chart.chartType !== preview.chartType) {
        throw new Error(`Bound chart trait "${traitDef.trait.name}" requires chartType "${preview.chartType}".`);
      }
      const parameters = {
        ...Object.fromEntries(traitDef.parameters.filter(parameter => parameter.default !== undefined).map(parameter => [parameter.name, parameter.default])),
        ...ref.parameters,
      };
      const contexts = traitDef.view_extensions?.dashboard ? ['detail', 'dashboard'] : ['detail'];
      traitDef = {
        ...traitDef,
        schema: {},
        semantics: {},
        dependencies: [],
        view_extensions: Object.fromEntries(contexts.map(context => [context, [{
          component: preview.component, position: 'top', priority: 55, props: {
            chart: structuredClone(chart),
            ...(parameters.title !== undefined ? { title: parameters.title } : {}),
            ...(parameters.description !== undefined ? { description: parameters.description } : {}),
          },
        }]])),
      };
    }
    // A job's cancellation is an event, not a scheduled billing-period summary.
    const lifecycleStates = traits.find(trait => trait.name.split('/').pop() === 'Stateful')?.parameters?.states;
    if (traitDef.trait.name === 'Cancellable' && Array.isArray(lifecycleStates) && lifecycleStates.includes('cancelled') && !lifecycleStates.includes('pending_cancellation')) {
      traitDef = { ...traitDef, view_extensions: { ...traitDef.view_extensions, detail: [{
        component: 'CancellationEvent', position: 'top', props: {
          title: 'Cancellation', timestampField: 'cancellation_requested_at',
          labelField: 'cancellation_reason', codeField: 'cancellation_reason_code',
        },
      }] } };
    }
    resolvedTraits.push({ ref, definition: traitDef });

    // Merge trait schema fields (collision = last-trait-wins with warning)
    for (const [field, fieldDef] of Object.entries(traitDef.schema)) {
      if (field in schema) {
        warnings.push(
          `Field collision: "${field}" from trait "${traitDef.trait.name}" overrides prior trait definition`,
        );
      }
      schema[field] = fieldDef;
    }

    // Merge trait semantic mappings
    for (const [field, mapping] of Object.entries(traitDef.semantics)) {
      semantics[field] = mapping;
    }

    // Collect view_extensions with trait order for priority resolution
    for (const [context, extensions] of Object.entries(
      traitDef.view_extensions ?? {},
    )) {
      if (!extensionsByContext[context]) {
        extensionsByContext[context] = [];
      }
      for (const ext of extensions) {
        extensionsByContext[context].push({
          extension: ext,
          traitOrder,
        });
      }
    }

    // Merge trait tokens (later traits override earlier)
    for (const [key, value] of Object.entries(traitDef.tokens ?? {})) {
      tokens[key] = value;
    }
  }

  // 2. Overlay object's own schema fields (override trait fields)
  for (const [field, fieldDef] of Object.entries(objectDef.schema ?? {})) {
    if (field in schema) {
      warnings.push(
        `Field collision: "${field}" in object schema overrides trait definition`,
      );
    }
    schema[field] = fieldDef;
  }

  // 3. Overlay object semantic mappings
  for (const [field, mapping] of Object.entries(objectDef.semantics ?? {})) {
    semantics[field] = mapping;
  }

  // 4. Overlay object tokens (final override)
  for (const [key, value] of Object.entries(objectDef.tokens ?? {})) {
    tokens[key] = value;
  }

  // 5. Resolve view_extension priorities per context
  //    Higher priority first; same priority → earlier trait declaration order first
  const viewExtensions: Record<string, ViewExtension[]> = {};
  for (const [context, ranked] of Object.entries(extensionsByContext)) {
    if (objectDef.metadata?.supportedContexts && !objectDef.metadata.supportedContexts.includes(context)) continue;
    ranked.sort((a, b) => {
      const pA = a.extension.priority ?? 0;
      const pB = b.extension.priority ?? 0;
      if (pB !== pA) return pB - pA; // higher priority first
      return a.traitOrder - b.traitOrder; // earlier trait first on tie
    });
    viewExtensions[context] = ranked.map((r) => r.extension);
  }

  return {
    object: objectDef.object,
    traits: resolvedTraits,
    schema,
    semantics,
    viewExtensions,
    tokens,
    warnings,
  };
}
