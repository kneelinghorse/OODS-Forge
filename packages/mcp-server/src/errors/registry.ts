/**
 * OODS Foundry Error Code Registry — v1
 *
 * Code format:
 *   OODS-V{NNN}  validation errors   (bad input, schema mismatch)
 *   OODS-N{NNN}  not-found errors     (missing entity, expired ref)
 *   OODS-C{NNN}  conflict errors      (duplicate, state clash)
 *   OODS-S{NNN}  server errors        (infrastructure, timeout)
 *   OODS-R{NNN}  rate-limit errors    (throttle, concurrency)
 *
 * Commitment: registered codes will not be renamed or reassigned
 * without a deprecation period of at least one minor version.
 */

import { randomUUID } from 'node:crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ErrorCategory =
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'server_error'
  | 'rate_limit';

export interface ErrorDefinition {
  code: string;
  category: ErrorCategory;
  message: string;
  retryable: boolean;
}

export interface StructuredError {
  code: string;
  category: ErrorCategory;
  message: string;
  retryable: boolean;
  details?: unknown;
  incidentId: string;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry: ReadonlyMap<string, ErrorDefinition> = new Map<string, ErrorDefinition>([

  ['OODS-W001', { code: 'OODS-W001', category: 'validation', message: 'Fragment output ignores document scope options', retryable: false }],
  ['OODS-W002', { code: 'OODS-W002', category: 'validation', message: 'Non-strict fragments reclassify unknown-component errors per node', retryable: false }],

  // ── Validation: Input & Schema ──────────────────────────────────────────
  ['OODS-V001', { code: 'OODS-V001', category: 'validation', message: 'Input validation failed', retryable: true }],
  ['OODS-V002', { code: 'OODS-V002', category: 'validation', message: 'Output validation failed', retryable: false }],
  ['OODS-V003', { code: 'OODS-V003', category: 'validation', message: 'Missing required field', retryable: true }],
  ['OODS-V004', { code: 'OODS-V004', category: 'validation', message: 'Invalid slug format', retryable: true }],
  ['OODS-V005', { code: 'OODS-V005', category: 'validation', message: 'Unknown framework', retryable: true }],
  ['OODS-V006', { code: 'OODS-V006', category: 'validation', message: 'Unknown component', retryable: true }],
  ['OODS-V007', { code: 'OODS-V007', category: 'validation', message: 'DSL schema validation failed', retryable: true }],
  ['OODS-V008', { code: 'OODS-V008', category: 'validation', message: 'Duplicate node ID', retryable: true }],
  ['OODS-V009', { code: 'OODS-V009', category: 'validation', message: 'Missing schema', retryable: true }],
  ['OODS-V010', { code: 'OODS-V010', category: 'validation', message: 'Missing base tree', retryable: true }],
  ['OODS-V011', { code: 'OODS-V011', category: 'validation', message: 'Missing patch', retryable: true }],
  ['OODS-V012', { code: 'OODS-V012', category: 'validation', message: 'Unsupported billing object', retryable: true }],
  ['OODS-V013', { code: 'OODS-V013', category: 'validation', message: 'Unknown fixture provider', retryable: true }],
  ['OODS-V014', { code: 'OODS-V014', category: 'validation', message: 'No fixture providers selected', retryable: true }],
  ['OODS-V015', { code: 'OODS-V015', category: 'validation', message: 'No packages resolved for release verification', retryable: true }],

  // ── Validation: Patch operations ────────────────────────────────────────
  ['OODS-V100', { code: 'OODS-V100', category: 'validation', message: 'Invalid JSON pointer', retryable: true }],
  ['OODS-V101', { code: 'OODS-V101', category: 'validation', message: 'Unsafe path segment', retryable: false }],
  ['OODS-V102', { code: 'OODS-V102', category: 'validation', message: 'Invalid patch operation', retryable: true }],
  ['OODS-V103', { code: 'OODS-V103', category: 'validation', message: 'Cannot patch document root', retryable: false }],
  ['OODS-V104', { code: 'OODS-V104', category: 'validation', message: 'Patch path not found', retryable: true }],
  ['OODS-V105', { code: 'OODS-V105', category: 'validation', message: 'Invalid array index', retryable: true }],
  ['OODS-V106', { code: 'OODS-V106', category: 'validation', message: 'Patch apply failed', retryable: false }],
  ['OODS-V107', { code: 'OODS-V107', category: 'validation', message: 'Invalid patch entry', retryable: true }],
  ['OODS-V108', { code: 'OODS-V108', category: 'validation', message: 'Node patch missing nodeId', retryable: true }],
  ['OODS-V109', { code: 'OODS-V109', category: 'validation', message: 'Empty patch array', retryable: true }],
  ['OODS-V110', { code: 'OODS-V110', category: 'validation', message: 'Invalid patch type', retryable: true }],
  ['OODS-V111', { code: 'OODS-V111', category: 'validation', message: 'Unsupported patch op', retryable: true }],
  ['OODS-V112', { code: 'OODS-V112', category: 'validation', message: 'Invalid remove target', retryable: true }],
  ['OODS-V113', { code: 'OODS-V113', category: 'validation', message: 'Unsafe key', retryable: false }],

  ['OODS-V114', { code: 'OODS-V114', category: 'validation', message: 'Mixed patch formats', retryable: true }],
  ['OODS-V115', { code: 'OODS-V115', category: 'validation', message: 'JSON Patch array required', retryable: true }],
  ['OODS-V116', { code: 'OODS-V116', category: 'validation', message: 'Low layout confidence', retryable: true }],
  ['OODS-V117', { code: 'OODS-V117', category: 'validation', message: 'Object composition warning', retryable: false }],
  ['OODS-V118', { code: 'OODS-V118', category: 'validation', message: 'Resolution warning', retryable: false }],
  ['OODS-V119', { code: 'OODS-V119', category: 'validation', message: 'Unknown components in schema', retryable: true }],

  // ── Validation: Viz ──────────────────────────────────────────────────
  ['OODS-V120', { code: 'OODS-V120', category: 'validation', message: 'Invalid chart type', retryable: true }],
  ['OODS-V121', { code: 'OODS-V121', category: 'validation', message: 'Missing viz traits', retryable: true }],
  ['OODS-V122', { code: 'OODS-V122', category: 'validation', message: 'No viz mark traits on object', retryable: true }],
  // viz.render data-source + compile failures (thrown via errorOut in viz.render.ts /
  // dashboard.render.ts but previously unregistered — createError silently degraded them to
  // server_error/non-retryable). V123-V126 are recoverable input problems (retryable); the
  // V127/V128/V129 compile/render failures are deterministic (retryable:false). All stay
  // category 'validation' to hold the V-prefix=category invariant (registry.test.ts:28-42)
  // and keep the thrown code strings byte-identical (no renumber to S-codes).
  ['OODS-V123', { code: 'OODS-V123', category: 'validation', message: 'Missing or invalid viz data source', retryable: true }],
  ['OODS-V124', { code: 'OODS-V124', category: 'validation', message: 'Dataset reference expired', retryable: true }],
  ['OODS-V125', { code: 'OODS-V125', category: 'validation', message: 'Dataset reference resolved to empty or non-array rows', retryable: true }],
  ['OODS-V126', { code: 'OODS-V126', category: 'validation', message: 'Invalid viz spec input', retryable: true }],
  ['OODS-V127', { code: 'OODS-V127', category: 'validation', message: 'Vega-Lite spec compilation failed', retryable: false }],
  ['OODS-V128', { code: 'OODS-V128', category: 'validation', message: 'ECharts option compilation failed', retryable: false }],
  ['OODS-V129', { code: 'OODS-V129', category: 'validation', message: 'Viz render failed', retryable: false }],
  ['OODS-V130', { code: 'OODS-V130', category: 'validation', message: 'Unresolved governed measure', retryable: false }],
  // Field-presence strict check (sprint-118 m05): a referenced field (KPI field/periodField,
  // chart encoding) absent from every row under the opt-in strictFields flag. Recoverable —
  // the agent can fix the field name and retry — so retryable:true.
  ['OODS-V131', { code: 'OODS-V131', category: 'validation', message: 'Referenced field absent from dataset', retryable: true }],
  // Governed-measure registry governance (sprint-118 m03), routed through the
  // dashboard.render onPanelError seam (NOT a thrown ToolError). V132: the registry
  // artifact failed AJV-validate-at-load (fail-closed, not a silent empty Map). V133:
  // a non-additive measure (additive:false) was asked for a `sum` rollup — a summed
  // ratio/price is meaningless. Both are config/governance failures (retryable:false).
  ['OODS-V132', { code: 'OODS-V132', category: 'validation', message: 'Malformed measure registry', retryable: false }],
  ['OODS-V133', { code: 'OODS-V133', category: 'validation', message: 'Non-additive measure rollup blocked', retryable: false }],
  // Geo-join surfacing (sprint-118 m06): a choropleth corridor whose join key has no matching
  // map feature — silently dropped today, surfaced under the strictFields flag. Recoverable
  // (the agent can fix the M49→ISO crosswalk and retry) — retryable:true.
  ['OODS-V134', { code: 'OODS-V134', category: 'validation', message: 'Geo join: corridor has no matching map feature', retryable: true }],
  // A11y contrast (sprint-118 m07): a resolved brand-token colour pair fails WCAG contrast,
  // surfaced under output.contrastScan. A V-code (NOT 'OODS-A001' — registry.test.ts:18 regex
  // /^OODS-[VNCSRR]\d{3}$/ + prefix=category have no 'A'). retryable:false (a brand-token config
  // issue, not a transient/recoverable input).
  ['OODS-V135', { code: 'OODS-V135', category: 'validation', message: 'Brand token pair fails WCAG contrast', retryable: false }],
  // Inline tokenOverlay value safety (sprint-121 m04): a token-overlay value containing CSS/HTML
  // metacharacters (< > { } ; @, comment sequences, control chars) that could break out of the
  // raw-emitted <style data-source="components"> sink (document.ts:220 has no escaping). Distinct
  // from V113 'Unsafe key' (key denylist) — this inspects VALUES. retryable:false (a malicious or
  // malformed value won't succeed on retry; the agent must supply a clean CSS color/length/number).
  ['OODS-V136', { code: 'OODS-V136', category: 'validation', message: 'Unsafe token-overlay value', retryable: false }],
  // Measure-registry DEPTH (sprint-122). Routed through the dashboard.render onPanelError seam
  // (NOT thrown). V137: a KPI panel resolved to NO field — measureRef-only with resolveMeasures
  // OFF (or the ref unresolved), so there is nothing to aggregate. Fail loud instead of a silent
  // value:0. Recoverable — the agent can supply a field or enable resolveMeasures — retryable:true.
  ['OODS-V137', { code: 'OODS-V137', category: 'validation', message: 'KPI panel has no resolvable field (measureRef unresolved)', retryable: true }],
  // V138 (sprint-122 m02): a governed measure declares an expectedGrain but the panel's actual
  // period data does not match it (or the panel has no periodField to check). A measure/data
  // governance mismatch — like V132/V133, not transiently recoverable — so retryable:false.
  ['OODS-V138', { code: 'OODS-V138', category: 'validation', message: 'Measure time-grain mismatch', retryable: false }],
  // V139 (sprint-122 m03): under the opt-in strictDatasets flag, a KPI panel references a datasetId
  // NOT present in datasets[] — lifted from the frozen-D6 silent value:0 to a fail-loud panel,
  // matching how chart panels already fail (V123). Recoverable (fix the datasetId) — retryable:true.
  ['OODS-V139', { code: 'OODS-V139', category: 'validation', message: 'KPI panel references unknown dataset', retryable: true }],
  // V140 (sprint-123 A1): a measured colour delta carries a logical leaf-path key (e.g.
  // 'color.brand.secondary') that the Forge-owned style library does not map to a --sys-/
  // --ref- skin var. A CLOSED-table config error (like V136/V132/V133/V135) — the key
  // can't become mapped on retry; the agent must use a registered key or the library must
  // add the mapping — so retryable:false.
  ['OODS-V140', { code: 'OODS-V140', category: 'validation', message: 'Unmapped style-library logical key', retryable: false }],
  // V141 (sprint-129 m03): MEASURE-NARRATIVE equivalence. Routed through the dashboard.render
  // onPanelError seam (NOT thrown), and fires ONLY when the measure narrative is surfaced
  // (wantHtml || wantA11y) AFTER a measure resolved (chains after V130/V132/V133/V137/V138/V139).
  // The narrative verbalizes the GOVERNED measure-context (the registry entry's defaultThreshold);
  // if the panel's RESOLVED threshold (measure-resolver output, author-overridable per D4) DIVERGES
  // from that governed value, the verbalized "threshold X breached" would misrepresent the threshold
  // the breach was computed against — a registry-vs-rendered drift, NOT a same-source value==value
  // tautology. Recoverable (align or drop the override, or don't surface the narrative) — retryable:true.
  ['OODS-V141', { code: 'OODS-V141', category: 'validation', message: 'Measure-narrative context drifts from the resolved governed measure', retryable: true }],
  // V142 (sprint-130 m04): broadens V141's threshold.VALUE-only check to threshold.DIRECTION.
  // resolveMeasurePanel replaces the WHOLE threshold object (panel.threshold ?? entry.defaultThreshold),
  // so an author override that keeps the value but flips the direction (e.g. {direction:'below',value:350}
  // over a governed {above,350}) leaves V141 silent (values equal) yet flips computeKpi's breach — while
  // the verbalized "threshold 350 breached" still describes the GOVERNED direction. A real registry-vs-
  // rendered drift (recoverable: align or drop the override, or don't surface the narrative) — retryable:true.
  ['OODS-V142', { code: 'OODS-V142', category: 'validation', message: 'Measure-narrative threshold direction drifts from the resolved governed measure', retryable: true }],
  // V143 (sprint-147 m03, F5): an explicit color `range` is SHORTER than the distinct
  // series count on a categorical color channel. Vega recycles domain[i]->range[i] mod
  // len, so two+ series silently share a color = ambiguous encoding (and a likely
  // certify role-A distinguishability fail). WARN, don't throw — the chart still renders;
  // the agent can lengthen the range or reduce the series. Recoverable — retryable:true.
  ['OODS-V143', { code: 'OODS-V143', category: 'validation', message: 'Color range is shorter than the number of series (colors will recycle)', retryable: true }],
  // V144 (sprint-147 m03, F5): a `range` entry is not a valid hex color. Belt-and-
  // suspenders to the schema `pattern` (the primary gate rejects non-hex at AJV); this
  // WARN defends the direct-handler path (tests/pipelines that bypass AJV) so a non-hex
  // range that would make certify's hexToRgb throw -> contrast 'unchecked' -> a silent
  // conformant:true is surfaced loudly instead. Recoverable (use hex) — retryable:true.
  ['OODS-V144', { code: 'OODS-V144', category: 'validation', message: 'Color range contains a non-hex color', retryable: true }],
  // V145 (sprint-147 m03, F5, Fork D): an explicit color `range` was supplied on an
  // ECharts-primary chart type (treemap/sunburst/sankey/force_graph/chord and the geo
  // types) that cannot consume a cartesian color range — its adapter would silently drop
  // it. FAIL-LOUD (never silently ignore an agent's declared range): the color range is
  // a cartesian-only capability (F5). A closed misuse — the type can't grow a color range
  // on retry (use a cartesian chartType) — so retryable:false.
  ['OODS-V145', { code: 'OODS-V145', category: 'validation', message: 'Color range is not supported on this chart type (cartesian color channel only)', retryable: false }],
  // V146 (sprint-148 m03, F3): a categorical ECharts-primary chart has MORE distinct
  // color groups than the 6-slot OODS palette, so the adapter's palette[i % 6] silently
  // repeats a color (CIEDE2000 = 0 between two arcs) — invisible to certify's s141
  // data-independent palette-constant grade. WARN across all 5 cycling types
  // (treemap/sunburst/sankey/force_graph/chord); the chart still renders. Recoverable
  // (reduce the categories, or accept indistinguishable groups) — retryable:true.
  ['OODS-V146', { code: 'OODS-V146', category: 'validation', message: 'Categorical palette recycles: more distinct color groups than the 6-slot OODS palette', retryable: true }],
  // V147 (sprint-148 m04, F4): a chord/force_graph link names a node that does not
  // exist in the node set. FAIL-LOUD (never build an option over a broken ref) —
  // unlike V145's closed misuse, a dangling ref is a FIXABLE input (add the node or
  // fix the link), so retryable:true (mirrors the V126/V131 posture, deliberately
  // unlike V145's retryable:false). sankey keeps its own throw -> V126 (out of F4).
  ['OODS-V147', { code: 'OODS-V147', category: 'validation', message: 'Link references a non-existent node', retryable: true }],
  // V148 (sprint-148 m04, F4): a chord/force_graph link duplicates an existing
  // directed (source,target) pair. ECharts double-counts the arc / corrupts the
  // stacked ribbon, so WARN (the chart still renders). Recoverable (merge the
  // duplicates) — retryable:true. chord is DIRECTED, so A->B and B->A are distinct.
  ['OODS-V148', { code: 'OODS-V148', category: 'validation', message: 'Duplicate link', retryable: true }],
  ['OODS-V149', { code: 'OODS-V149', category: 'validation', message: 'Delta addresses a different brand than the one being applied', retryable: true }],

  // ── Validation: artifact.certify ACCURACY rules (sprint-170, #818) ──────
  // The four declared structural rules of certify's accuracy pillar — the fourth #977
  // pillar. Unlike every other V-code here these are never THROWN: they are reported as
  // certify findings (severity 'error') and pull pillars.accuracy to 'fail'. They are
  // registered anyway because a code an agent reads must be a registered code, and because
  // the registry is where the commitment not to rename or reassign them lives.
  // Every one is retryable:true — each names a specific, fixable authoring choice.
  // V150: a bar communicates value by LENGTH from a baseline, so a value axis that is not a
  // linear zero-anchored scale draws lengths whose ratios are not the data's ratios. Three
  // distinct causes (zero:false, log, sqrt), each reported with its own wording — a sqrt
  // scale IS zero-anchored, so it is never described as a moved baseline.
  ['OODS-V150', { code: 'OODS-V150', category: 'validation', message: "A bar's value axis is not a linear zero-anchored scale", retryable: true }],
  // V151: two layers in ONE plot frame with independently-resolved positional scales — where
  // the series cross, converge or diverge is then an artifact of the two scales, not of the
  // data. LAYER scope only; facet- and concat-scope independence are separate panels.
  ['OODS-V151', { code: 'OODS-V151', category: 'validation', message: 'Layered marks resolve a positional scale independently (dual axis)', retryable: true }],
  // V152: the V150 predicate over an area mark. Ranged (x2/y2) band areas are excluded —
  // a band encodes two edge positions, not an extent measured from a baseline.
  ['OODS-V152', { code: 'OODS-V152', category: 'validation', message: "An area's value axis is not a linear zero-anchored scale", retryable: true }],
  // V153: an aggregation that actually MERGES rows (some group under the full group key
  // holds more than one row) while none of the declared text surfaces — the accessible
  // description, the chart title, the aggregated axis title — says so. The reader sees one
  // mark per group with no indication it stands for several rows. Identity aggregations
  // (one row per group) never fire.
  ['OODS-V153', { code: 'OODS-V153', category: 'validation', message: 'A row-collapsing aggregation is not disclosed on any declared text surface', retryable: true }],

  // ── Validation: artifact.certify ACCURACY rules, ECHARTS-PRIMARY (sprint-172) ──
  // The accuracy pillar widened from the 5 cartesian types to all 13. These six read the
  // certify `data` OPERAND (the same data branch viz.render takes) rather than a compiled
  // Vega-Lite spec, because an ECharts-primary IR is metadata-only and carries no data at
  // all. Like V150-V153 they are never THROWN: they are certify findings that pull
  // pillars.accuracy to 'fail'. Every one is retryable:true — each names a specific,
  // fixable authoring choice.
  //
  // SEVERITY, stated once for the family: a certify accuracy finding is ERROR-severity by
  // construction. That is a deliberate escalation over the render path's posture for the
  // same data — most visibly at V158, where F4 treats a duplicate directed link as a
  // WARNING for chord/force_graph and says nothing at all for sankey. The two tools answer
  // different questions: render asks "does this draw", certify asks "does the drawing mean
  // what the data says".
  //
  // V154: a treemap tile's area and a sunburst arc's angle are magnitudes. The adapters
  // copy the authored value straight into the option, so a negative or non-finite node
  // value is drawn as something that does not represent the number.
  ['OODS-V154', { code: 'OODS-V154', category: 'validation', message: 'A treemap/sunburst node value cannot be encoded as area or angle', retryable: true }],
  // V155: an EXPLICIT parent value that is not the sum of its children — the parent is
  // sized by the declaration while the children tile the space beneath it, so the
  // part-of-whole relationship shown is not the one in the data. Compared under a RELATIVE
  // 1e-9 tolerance: a parent of 0.3 over children 0.1 and 0.2 is correct data that exact
  // float equality would falsely flag.
  ['OODS-V155', { code: 'OODS-V155', category: 'validation', message: "An explicit treemap/sunburst parent value is not the sum of its children", retryable: true }],
  // V156: ribbon width is a magnitude. sankey's upstream validator rejects non-finite link
  // values (V126) but permits negatives; chord validates values not at all, so both
  // negative and non-finite chord values reach the option.
  ['OODS-V156', { code: 'OODS-V156', category: 'validation', message: 'A sankey/chord link value is negative or non-finite', retryable: true }],
  // V157: a sankey node's drawn height is not the flow its ribbons carry. Two causes — an
  // explicit node.value that overrides the computed max(incoming, outgoing), and an
  // INTERMEDIATE node (incoming>0 AND outgoing>0) whose two sides disagree. Sources and
  // sinks are endpoints, never leaks, and never fire. The rule reads the data BRANCH
  // because the option erases the provenance: a declared value and a computed one are the
  // same {name, value} pair once emitted.
  ['OODS-V157', { code: 'OODS-V157', category: 'validation', message: "A sankey node's height does not match the flow its links carry", retryable: true }],
  // V158: duplicate directed (source,target) pairs stack into one visually-merged ribbon,
  // so the width between those nodes is their SUM while each label describes one part. A
  // deliberate certify-side REOPEN of the s148 F4 sankey exclusion; viz.render is untouched.
  ['OODS-V158', { code: 'OODS-V158', category: 'validation', message: 'A sankey directed flow appears more than once', retryable: true }],
  // V159: a choropleth join that matches several rows to one region merges them
  // last-record-wins. Where those rows AGREE this is supported one-to-many behaviour and
  // the rule stays silent; where they CONFLICT on the joined value field the region's shade
  // is decided by input order rather than by the data.
  ['OODS-V159', { code: 'OODS-V159', category: 'validation', message: 'A choropleth region matched rows with conflicting joined values', retryable: true }],
  // V160 (sprint-175 m05, decision 11): a KPI numeric aggregate (sum/average/median/min/max/
  // latest) over a field that HAS values but none of them numeric. viz-core's computeKpi throws
  // KpiComputeError{reason:'no_numeric_cells'} instead of the pre-s175 silent value:0;
  // dashboard.render routes it through the onPanelError seam (placeholder/omit), like V137.
  // count/distinct never trip it (defined over any cell type); an absent field or an empty
  // row set keeps value:0.
  ['OODS-V160', { code: 'OODS-V160', category: 'validation', message: 'KPI numeric aggregate over a field with no numeric cells', retryable: true }],
  // V161 (sprint-176 m03a): the DEFAULT baked cartesian categorical palette is shorter
  // than the distinct series count, so Vega recycles domain[i]->range[i mod len] — two+
  // series share a colour (a ΔE00=0 pair certify's render-backed contrast pillar fails).
  // The default-palette twin of V143, which cannot be reused here: V143's registered and
  // emitted messages presuppose an AGENT-SUPPLIED range ("Provide at least N colors"),
  // while V161 fires precisely when the agent supplied none. Threshold is read from the
  // APPLIED compiled scale.range, never a hardcoded 6. WARN — the chart still renders.
  ['OODS-V161', { code: 'OODS-V161', category: 'validation', message: 'Baked categorical palette recycles: more distinct series than palette slots', retryable: true }],
  ['OODS-V162', { code: 'OODS-V162', category: 'validation', message: 'Required hash-bound release evidence is missing; references are not re-executed', retryable: true }],
  ['OODS-V163', { code: 'OODS-V163', category: 'validation', message: 'Release evidence artifact hash mismatch; references are not re-executed', retryable: true }],
  ['OODS-V164', { code: 'OODS-V164', category: 'validation', message: 'Unknown UI workflow state', retryable: true }],
  ['OODS-V165', { code: 'OODS-V165', category: 'validation', message: 'SVG rendering failed', retryable: true }],
  ['OODS-V166', { code: 'OODS-V166', category: 'validation', message: 'viz.render pattern conflicts with explicit data or source identity/presentation overrides', retryable: true }],
  ['OODS-V167', { code: 'OODS-V167', category: 'validation', message: 'viz.render pattern is authoring-only because its source structure is not supported by the public renderer', retryable: false }],

  // s195 m04 operand-profile accuracy findings; renderer behavior is unchanged.
  // V169 reports the public builder's default linear diameter; no size-scale override
  // is exposed. V170 uses emitted coordinates, not the unused bubble geo.join.
  // V172/V173 are directed: reciprocal flows/edges remain valid.
  ['OODS-V174', { code: 'OODS-V174', category: 'validation', message: 'viz.render: pattern retired; use the named supported alternative', retryable: false }],
  ['OODS-V175', { code: 'OODS-V175', category: 'validation', message: 'viz.render: static SVG shows the default selection state', retryable: false }],
  ['OODS-V168', { code: 'OODS-V168', category: 'validation', message: 'artifact.certify: bubble-map size is negative or non-finite', retryable: true }],
  ['OODS-V169', { code: 'OODS-V169', category: 'validation', message: 'artifact.certify: bubble-map magnitudes use radius rather than area scaling', retryable: true }],
  ['OODS-V170', { code: 'OODS-V170', category: 'validation', message: 'artifact.certify: overlapping bubble-map rows have conflicting encoded values', retryable: true }],
  ['OODS-V171', { code: 'OODS-V171', category: 'validation', message: 'artifact.certify: flow-map strength is negative or non-finite', retryable: true }],
  ['OODS-V172', { code: 'OODS-V172', category: 'validation', message: 'artifact.certify: a directed geographic flow appears more than once', retryable: true }],
  ['OODS-V173', { code: 'OODS-V173', category: 'validation', message: 'artifact.certify: a force-graph directed edge appears more than once', retryable: true }],

  // ── Validation: Brand/Map ───────────────────────────────────────────────
  ['OODS-V200', { code: 'OODS-V200', category: 'validation', message: 'Map validation failed', retryable: true }],
  ['OODS-V201', { code: 'OODS-V201', category: 'validation', message: 'map.apply input invalid', retryable: true }],
  ['OODS-V204', { code: 'OODS-V204', category: 'validation', message: 'Composition edit not applicable to this version', retryable: false }],
  ['OODS-V203', { code: 'OODS-V203', category: 'validation', message: 'Composition id or version is not well-formed', retryable: false }],
  ['OODS-V202', { code: 'OODS-V202', category: 'validation', message: 'structuredData.fetch input invalid', retryable: true }],

  // ── Not Found ───────────────────────────────────────────────────────────
  ['OODS-N001', { code: 'OODS-N001', category: 'not_found', message: 'Unknown tool', retryable: false }],
  ['OODS-N002', { code: 'OODS-N002', category: 'not_found', message: 'Schema not found', retryable: false }],
  ['OODS-N003', { code: 'OODS-N003', category: 'not_found', message: 'SchemaRef not found', retryable: true }],
  ['OODS-N004', { code: 'OODS-N004', category: 'not_found', message: 'SchemaRef expired', retryable: true }],
  ['OODS-N005', { code: 'OODS-N005', category: 'not_found', message: 'Object not found', retryable: false }],
  ['OODS-N006', { code: 'OODS-N006', category: 'not_found', message: 'Patch node not found', retryable: true }],
  ['OODS-N007', { code: 'OODS-N007', category: 'not_found', message: 'Artifact not found', retryable: false }],
  ['OODS-N008', { code: 'OODS-N008', category: 'not_found', message: 'Fixture object not found', retryable: false }],
  ['OODS-N009', { code: 'OODS-N009', category: 'not_found', message: 'Registry manifest missing', retryable: false }],
  ['OODS-N010', { code: 'OODS-N010', category: 'not_found', message: 'Registry unavailable', retryable: false }],
  ['OODS-N011', { code: 'OODS-N011', category: 'not_found', message: 'Token data missing', retryable: false }],
  ['OODS-N012', { code: 'OODS-N012', category: 'not_found', message: 'A11y token data missing', retryable: false }],
  ['OODS-N013', { code: 'OODS-N013', category: 'not_found', message: 'HTML renderer unavailable; fallback output is forbidden at build or release confidence', retryable: false }],
  ['OODS-N014', { code: 'OODS-N014', category: 'not_found', message: 'Registry snapshot payload missing', retryable: false }],
  ['OODS-N015', { code: 'OODS-N015', category: 'not_found', message: 'Component target unavailable', retryable: false }],
  ['OODS-N016', { code: 'OODS-N016', category: 'not_found', message: 'Generated artifact dependency closure is invalid', retryable: false }],
  ['OODS-N017', { code: 'OODS-N017', category: 'not_found', message: 'Generated artifact envelope missing', retryable: false }],
  ['OODS-N018', { code: 'OODS-N018', category: 'not_found', message: 'HTML Tailwind styling unavailable', retryable: false }],

  ['OODS-N022', { code: 'OODS-N022', category: 'not_found', message: 'Composition or version not found in the store', retryable: false }],
  ['OODS-N021', { code: 'OODS-N021', category: 'not_found', message: 'design.preview: no preview host is reachable; call through the HTTP bridge or the stdio adapter, or set OODS_PREVIEW_HOST_URL', retryable: true }],
  ['OODS-N020', { code: 'OODS-N020', category: 'not_found', message: 'brand.apply: canonical brand source is not shipped in this runtime', retryable: false }],

  // ── Conflict ────────────────────────────────────────────────────────────
  ['OODS-C001', { code: 'OODS-C001', category: 'conflict', message: 'Schema ref missing after compose', retryable: false }],
  ['OODS-C002', { code: 'OODS-C002', category: 'conflict', message: 'Tag already exists', retryable: false }],
  ['OODS-C003', { code: 'OODS-C003', category: 'conflict', message: 'Duplicate panel id', retryable: false }],

  // ── Server Error ────────────────────────────────────────────────────────
  ['OODS-S001', { code: 'OODS-S001', category: 'server_error', message: 'Policy denied', retryable: false }],
  ['OODS-S002', { code: 'OODS-S002', category: 'server_error', message: 'Execution timeout', retryable: true }],
  ['OODS-S003', { code: 'OODS-S003', category: 'server_error', message: 'Bad request', retryable: false }],
  ['OODS-S004', { code: 'OODS-S004', category: 'server_error', message: 'Object load failed', retryable: false }],
  ['OODS-S005', { code: 'OODS-S005', category: 'server_error', message: 'Catalog load failed', retryable: true }],
  ['OODS-S006', { code: 'OODS-S006', category: 'server_error', message: 'HTML render failed', retryable: false }],
  ['OODS-S007', { code: 'OODS-S007', category: 'server_error', message: 'Fragment render failed', retryable: false }],
  ['OODS-S008', { code: 'OODS-S008', category: 'server_error', message: 'Fixture load failed', retryable: false }],
  ['OODS-S009', { code: 'OODS-S009', category: 'server_error', message: 'Pipeline step failed', retryable: false }],
  ['OODS-S010', { code: 'OODS-S010', category: 'server_error', message: 'Compose step exception', retryable: false }],
  ['OODS-S011', { code: 'OODS-S011', category: 'server_error', message: 'Validate step exception', retryable: false }],
  ['OODS-S012', { code: 'OODS-S012', category: 'server_error', message: 'Render step exception', retryable: false }],
  ['OODS-S013', { code: 'OODS-S013', category: 'server_error', message: 'Codegen step exception', retryable: false }],
  ['OODS-S014', { code: 'OODS-S014', category: 'server_error', message: 'Save step exception', retryable: false }],
  ['OODS-S015', { code: 'OODS-S015', category: 'server_error', message: 'Path not allowed', retryable: false }],
  ['OODS-S016', { code: 'OODS-S016', category: 'server_error', message: 'Artifact filename empty', retryable: false }],
  ['OODS-S017', { code: 'OODS-S017', category: 'server_error', message: 'Artifact filename unsafe', retryable: false }],
  ['OODS-S018', { code: 'OODS-S018', category: 'server_error', message: 'Fixture provider mismatch', retryable: false }],

  ['OODS-S019', { code: 'OODS-S019', category: 'server_error', message: 'Token build failed; source writes remain in place', retryable: true }],

  // ── Rate Limit ──────────────────────────────────────────────────────────
  ['OODS-R001', { code: 'OODS-R001', category: 'rate_limit', message: 'Rate limit exceeded', retryable: true }],
  ['OODS-R002', { code: 'OODS-R002', category: 'rate_limit', message: 'Concurrency limit exceeded', retryable: true }],
]);

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getDefinition(code: string): ErrorDefinition | undefined {
  return registry.get(code);
}

export function isRetryable(code: string): boolean {
  return registry.get(code)?.retryable ?? false;
}

export function allCodes(): readonly ErrorDefinition[] {
  return [...registry.values()];
}

// ---------------------------------------------------------------------------
// Error factory
// ---------------------------------------------------------------------------

export function createError(code: string, context?: { message?: string; details?: unknown }): StructuredError {
  const def = registry.get(code);
  if (!def) {
    return {
      code,
      category: 'server_error',
      message: context?.message ?? `Unknown error code: ${code}`,
      retryable: false,
      details: context?.details,
      incidentId: randomUUID(),
    };
  }
  return {
    code: def.code,
    category: def.category,
    message: context?.message ?? def.message,
    retryable: def.retryable,
    details: context?.details,
    incidentId: randomUUID(),
  };
}

// ---------------------------------------------------------------------------
// Legacy bridge: maps old ERROR_CODES constants → new OODS codes
// ---------------------------------------------------------------------------

export const LEGACY_CODE_MAP: Record<string, string> = {
  SCHEMA_INPUT: 'OODS-V001',
  SCHEMA_OUTPUT: 'OODS-V002',
  UNKNOWN_TOOL: 'OODS-N001',
  POLICY_DENIED: 'OODS-S001',
  TIMEOUT: 'OODS-S002',
  BAD_REQUEST: 'OODS-S003',
  RATE_LIMIT: 'OODS-R001',
  CONCURRENCY: 'OODS-R002',
};
