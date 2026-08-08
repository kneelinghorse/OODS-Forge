# artifact.certify

> Certify a Forge NormalizedVizSpec IR (the same IR viz.render emits as normalizedSpec), optionally with the chart's DATA. Returns a per-pillar tri-state summary (pillars:{a11yEquivalence,determinism,contrast,accuracy}) that disaggregates what was actually checked, plus — on the cartesian path — a folded conformance gate. Read-only: it reads the IR and the operand, never rebuilds or re-recommends.

TWO COVERAGE CLASSES. The 5 cartesian types (bar/line/area/scatter/heatmap) return coverage:'certified' with a conformant boolean. The 8 ECharts-primary types (treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord) return coverage:'uncertified' / conformant:null — a DISTINCT verdict, not a failure, and NOT a statement that nothing was checked. Read the pillars, not the coverage value.

THE OPTIONAL `data` OPERAND (s172). An ECharts-primary IR is metadata-only by design (data:{values:[]}, encoding:{}) — the chart's nodes, links, rows and geometry live in viz.render's data branch and never enter the IR. Pass that SAME branch as `data` (exactly one of hierarchy | sankey | chord | network | geo, matching the mark trait) and certify lights two more pillars for these types. Omit it and they stay 'unchecked' with a note naming the missing operand. `data` on a CARTESIAN spec is a structured error (OODS-V123): those certify from the IR alone, so it would be dead input.

DETERMINISM. Cartesian: two independent Vega-Lite compiles, byte-compared, hashed. ECharts-primary WITH `data`: two independent adapter emissions of the ECharts option, byte-compared, then hashed through viz.render's exact JSON projection — so certify's contentHash EQUALS viz.render's for the same (spec, data) pair given to both tools. Scope, stated: certify claims nothing about what the caller actually rendered; hash identity across processes assumes one installed @oods/tokens bundle version; and for force_graph the OPTION is deterministic while the rendered layout is runtime force physics with no baked seed.

ACCURACY. Cartesian: four declared reader-only structural rules over the IR + the compiled spec — non-zero bar baseline (OODS-V150), dual axis (V151), area-encodes-linear (V152), aggregation-hiding (V153). ECharts-primary WITH `data`: a per-type set over the operand — treemap/sunburst V154 (a node value area or angle cannot encode) and V155 (an explicit parent that is not the sum of its children); sankey V156 (negative or non-finite link value), V157 (a node height that is not the flow its links carry) and V158 (a duplicate directed flow); chord V156; choropleth V159 (a region matched to rows with CONFLICTING joined values). force_graph, bubble_map and flow_map offer NOTHING — a stated position, not a gap: their distortion candidates are adapter constants or are not authorable through the branch. No scorer, no corpus, no render step; the rules read, so the contentHash is unmoved by them.

READ accuracy:'pass' PRECISELY: none of the rules OFFERED for that chart type positively detected its distortion — not that the chart is accurate. accuracySummary.rulesEvaluated says how many actually resolved their operand. On the ECharts path 'pass' additionally requires rulesEvaluated > 0, so zero resolved rules reports 'unchecked' with a note saying whether the offered set was empty or a precondition was absent. findings[] therefore carries THREE families told apart by code: OODS-A11Y-<rule.id>, OODS-V150..V153, OODS-V154..V159. On the CARTESIAN path a firing rule pulls conformant false; on the uncertified path conformant STAYS null (no folded claim is made there), so read pillars.accuracy and findings[].

A11Y-EQUIVALENCE is the one pillar still 'unchecked' for these 8, and the reason is temporary rather than structural: the 16-rule equivalence engine has no per-rule not-applicable state, so a rule whose precondition is absent returns a pass indistinguishable from a meaningful one. Running it over the operand would flip existing 'unchecked' verdicts to 'fail' — a verdict migration deferred to a warn-first rollout.

CONTRAST reads the colour hexes Forge BAKED into the compiled cartesian spec (scale.range for multi-series, mark.color for single-series; honouring config.tokens overrides) and grades them against the light-theme canvas — role-C mark-vs-background WCAG 3:1 (normative) + role-A categorical CIEDE2000 distinguishability (min-over-CVD) — so a chart that baked no OODS palette can never certify contrast:'pass'. Since s141 the 8 ECharts-primary types carry a real contrast verdict too: 'pass' for the 5 categorical ones (their adapters' fixed OODS palette, reconstructed and graded) and 'exempt' for the 3 geo ones (sequential/continuous colour, WCAG gradient essential exception). An ordinal-categorical bubble_map colour range is still not graded — as of s172 that rests on the exempt-all-geo ruling alone, since the range is now reachable through `data`. contrastNote carries the rendered-contrast caveat (dark-theme unverified).

BRAND, STATED PLAINLY (s169): certify takes NO brand input, deliberately. Every operand it grades is brand-INVARIANT — the colour hexes baked into the compiled spec, graded against the light-theme `:root` canvas — so a brand could not change any verdict. Offering the field would be a false affordance. `data` is the counterpart case and the reason it IS offered: it genuinely changes verdicts. dashboard.render and repl render accept `brand`; certify does not, because for certify it would mean nothing.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `spec` | object | Yes |  | A Forge NormalizedVizSpec intermediate representation — the same IR viz.render emits as normalizedSpec. Validated authoritatively by the handler's assertNormalizedVizSpec. |
| `data` | object | No |  | OPTIONAL operand for the 8 ECharts-primary types (treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord): the SAME data branch viz.render takes, so certify re-emits the option the render path would emit for this (spec, data) pair. EXACTLY ONE branch, and it must be the branch the IR's mark trait requires (MarkTreemap/MarkSunburst -> hierarchy, MarkSankey -> sankey, MarkChord -> chord, MarkGraph -> network, MarkChoropleth/MarkBubble/MarkFlow -> geo); a mismatch is a structured error. Supplying `data` alongside a CARTESIAN IR (MarkBar/MarkLine/MarkPoint/MarkArea/MarkRect) or an unmodeled mark is also a structured error — those paths compile from the IR itself, so the operand would be dead input. Omitting `data` is always valid: the verdict is then the pre-s172 one with determinism and accuracy honestly 'unchecked' and a note saying why. |
| `data.hierarchy` | _ref_ | No |  |  |
| `data.sankey` | _ref_ | No |  |  |
| `data.chord` | _ref_ | No |  |  |
| `data.network` | _ref_ | No |  |  |
| `data.geo` | _ref_ | No |  |  |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` | Yes | Whether certification ran. 'error' means the input was not a valid NormalizedVizSpec IR. |
| `coverage` | `certified` \| `uncertified` | No | 'certified' for the 5 cartesian types (bar/line/area/scatter/heatmap) — carries a real folded conformance result. 'uncertified' for the 8 ECharts-primary types (treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord): there is no Vega-Lite compile, so no a11y-equivalence claim and therefore no folded gate. It does NOT mean nothing was checked. As of s141 contrast carries a real verdict on this path, and as of s172 determinism and accuracy do too whenever the `data` operand is supplied. Read the PILLARS, never the coverage value, to learn what ran. Absent on the error path. |
| `conformant` | boolean \| null | No | The folded conformance gate (s140/s170), CARTESIAN PATH ONLY: true iff a11y-equivalence has zero error-severity failures AND contrast is not 'fail' AND accuracy is not 'fail' AND determinism is stable — measured on the light theme (dark-theme contrast unverified). null on the uncertified path, and it STAYS null there even when an ECharts accuracy rule fires (s172): the uncertified path makes no folded claim, so an ECharts accuracy failure is read from pillars.accuracy and findings[], never from conformant. Absent on the error path. A contrast- or accuracy-driven false is explained by pillars + contrastNote + the OODS-V15x findings; a warn-severity a11y failure does not affect conformance. KNOWN HOLE, stated (#781): on the cartesian path an 'unchecked' pillar passes the rollup, and since s170 that hole spans two pillars (contrast and accuracy) rather than one. |
| `findings` | _ref_[] | No | One entry per FAILING rule (empty when nothing fired). As of s172 this carries THREE rule families, told apart by their code: a11y-equivalence rules (OODS-A11Y-<rule.id>), CARTESIAN accuracy rules (OODS-V150..V153) and ECHARTS-PRIMARY accuracy rules (OODS-V154..V159). It is no longer a11y-equivalence-only, and it is no longer empty on the uncertified path. |
| `accuracySummary` | object | No | How the accuracy pillar was reached. Present whenever the rules were RUN: on the certified path always, and on the uncertified path whenever the `data` operand was supplied (s172). Absent on the error path, and absent on an ECharts verdict with NO operand — that absence is the device distinguishing 'no operand' from 'operand present, nothing offered or nothing resolved', which reports {rulesEvaluated:0, failing:0} plus a note saying which. rulesEvaluated is the honest examined-count the contrast pillar lacks: a rule whose operand could not be resolved (rows behind a data url, an aggregate op outside the IR vocabulary, a choropleth join with no geometry) is NOT counted and says why in notes[], so silence can never be read as coverage. |
| `determinism` | object | No | Re-emit determinism proof. On the certified path: the Vega-Lite compile is byte-stable across two independent re-emits and its canonical form hashes to contentHash. On the uncertified (ECharts-primary) path it is present whenever the `data` operand was supplied (s172) and proves the same property of the emitted ECharts OPTION. Absent on the error path, and absent on an ECharts verdict with no operand. |
| `pillars` | object | No | Per-pillar tri-state summary (s137, extended s170 and s172). Present on both ok paths (absent on error). DISAGGREGATES which pillar drove the verdict, and on the uncertified path it is the ONLY place the real verdicts live (coverage stays 'uncertified' and conformant stays null there). a11yEquivalence mirrors the a11y-equivalence sub-result, NOT the folded conformant; determinism mirrors determinism.stable; contrast is the rendered-reality verdict over the colour bytes Forge baked; accuracy is the structural-rules verdict. |
| `contrastNote` | string | No | The rendered-contrast caveat for the contrast pillar (certify measures the categorical color bytes Forge baked into the compiled spec, on the light theme; dark-theme contrast is not verified) plus the role rationale when contrast is pass/fail/exempt (s137/s138). |
| `notes` | string[] | No | Human-readable notes, and on the ECharts-primary path they are load-bearing rather than decorative: they are what tells the two flavours of 'unchecked' apart. Carries the a11y-equivalence deferral reason, the operand-absent determinism and accuracy notes, the determinism scope clauses (same-(spec,data), the @oods/tokens bundle assumption, force_graph's option-vs-physics limit), the empty-offered-set explanation for the three types with no accuracy rule, and (s170) why a rule could not resolve its operand and therefore stayed silent. |
| `errors` | _ref_[] | No | Present and non-empty when status is 'error' (the input was not a valid NormalizedVizSpec IR). |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{
  "spec": {}
}
```
