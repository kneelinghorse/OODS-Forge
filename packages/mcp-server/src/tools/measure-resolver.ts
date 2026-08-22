// Governed-measure resolver (sprint-117, Phase-3 resolution).
//
// Expands a KpiPanel's `measureRef` into its authoritative compute inputs by
// looking the reference up in the governed-measure registry. Pure + sync:
// returns a NEW panel (no mutation). Lives in the mcp-server (OUT of viz-core) so
// computeKpi/kpi.ts stays catalog-free — the resolver runs at the spec-ingestion
// boundary BEFORE compute, gated behind dashboard.render's `resolveMeasures` flag.
// (kpi.ts itself is not frozen: sprint-175 m05 changed its cell-type semantics.)
//
// D4 PRECEDENCE: the registry's entityField/aggregate OVERRIDE the author's
// field/aggregate (a governed measure is authoritative; field stays AJV-required
// as an inert echo). The AUTHOR wins for comparison/threshold (?? fill only when
// the panel omits them), mirroring the author-override precedent in
// dashboard.render.ts. The unresolvable case (no registry entry) is owned by
// s117-m03 (OODS-V130); here a miss returns the panel UNCHANGED so the wiring is
// crash-safe before m03 layers the hard-error branch on top.

import type { KpiPanel } from '@oods/viz-core';
import type { MeasureEntry } from './measure-registry.js';

export function resolveMeasurePanel(panel: KpiPanel, registry: Map<string, MeasureEntry>): KpiPanel {
  const entry = panel.measureRef ? registry.get(panel.measureRef) : undefined;
  if (!entry) {
    return panel;
  }
  return {
    ...panel,
    field: entry.entityField,
    aggregate: entry.aggregate,
    comparison: panel.comparison ?? entry.defaultComparison,
    threshold: panel.threshold ?? entry.defaultThreshold,
  };
}
