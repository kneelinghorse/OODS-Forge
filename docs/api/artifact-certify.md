# artifact.certify

> Certify a Forge NormalizedVizSpec IR (the same IR viz.render emits as normalizedSpec). Returns a folded conformance verdict (conformant now rolls up a11y-equivalence + contrast + determinism, measured on the light theme), a re-emit determinism proof, a contentHash, and a per-pillar tri-state summary (pillars:{a11yEquivalence,determinism,contrast}) that DISAGGREGATES which pillar drove the verdict — so a reader can see WHY conformant is false (an a11y error vs a contrast fail). The contrast pillar READS the color hexes Forge BAKED into the compiled cartesian spec (scale.range for multi-series, mark.color for single-series; honoring config.tokens overrides) and grades them against the light-theme canvas — role-C mark-vs-background WCAG 3:1 (normative) + role-A categorical CIEDE2000 distinguishability (min-over-CVD) — so a chart that baked no OODS palette can never certify contrast:'pass'. A color channel with no baked palette (a gradient scale, or a divergent/mistyped binding) is 'exempt'; contrastNote carries the rendered-contrast caveat (dark-theme unverified). So contrast reflects the bytes Forge renders, not a declared intent. Read-only — reads the IR, never rebuilds or re-recommends. Certification is cartesian-only (bar/line/area/scatter/heatmap → coverage:'certified' + conformant boolean + findings coded OODS-A11Y-<rule.id>); the 8 ECharts-primary types (treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord) return coverage:'uncertified'/conformant:null — a distinct verdict, not a failure. As of s141 the contrast pillar carries a REAL verdict for these 8 too (coverage STAYS 'uncertified'): 'pass' for the 5 categorical types (the fixed OODS categorical palette their adapters bake, reconstructed + graded role-C + role-A) and 'exempt' for the 3 geo types (sequential/continuous color, WCAG gradient exception) — so coverage:'uncertified' no longer implies contrast:'unchecked'. These 8 ECharts verdicts are palette-level CONSTANTS (invariant to the specific chart), distinct from the per-chart, override-aware cartesian grade. As of s142 certify ACCEPTS the encoding:{} IR viz.render emits for these 8 types, so it returns the contrast verdict instead of OODS-V126. The contentHash round-trip is cartesian-only: for a cartesian IR certify's contentHash matches viz.render's for the same IR, so an agent can round-trip render → certify and match; the 8 ECharts-primary types emit no contentHash (no Vega compile), so no hash parity is claimed for them.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `spec` | object | Yes |  | A Forge NormalizedVizSpec intermediate representation — the same IR viz.render emits as normalizedSpec. Validated authoritatively by the handler's assertNormalizedVizSpec. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` | Yes | Whether certification ran. 'error' means the input was not a valid NormalizedVizSpec IR. |
| `coverage` | `certified` \| `uncertified` | No | 'certified' for the 5 cartesian types (bar/line/area/scatter/heatmap) — carries a real conformance result. 'uncertified' for the 8 ECharts-primary types (treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord) — a11y-equivalence certification is cartesian-only (the Vega-Lite path). NOTE (s141): coverage:'uncertified' now carries a REAL pillars.contrast verdict ('pass' for the 5 categorical ECharts types, 'exempt' for the 3 geo types) — it is no longer contrast:'unchecked'. Absent on the error path. |
| `conformant` | boolean \| null | No | The folded conformance gate (s140): true iff a11y-equivalence has zero error-severity failures AND contrast is not 'fail' AND determinism is stable — measured on the light theme (dark-theme contrast unverified). null on the uncertified path (no claim is made). Absent on the error path. A contrast-driven false is explained by pillars.contrast + contrastNote (findings stays a11y-equivalence-only); a warn-severity a11y failure does not affect conformance. |
| `findings` | _ref_[] | No | One entry per FAILING equivalence rule (empty when fully conformant, and empty on the uncertified path). |
| `determinism` | object | No | Re-emit determinism proof (certified path only): the Vega-Lite compile is byte-stable across two independent re-emits and its canonical form hashes to contentHash. Absent on the uncertified + error paths. |
| `pillars` | object | No | Per-pillar tri-state summary (s137). Present on both ok paths (absent on error). DISAGGREGATES which pillar drove the folded `conformant` gate (s140): a11yEquivalence mirrors the a11y-equivalence sub-result (NOT the folded conformant); determinism mirrors `determinism.stable`; contrast is the rendered-reality verdict — it grades the categorical color bytes Forge baked into the compiled spec (scale.range / mark.color), so no baked palette can never read as 'pass'. A reader can always see WHY conformant is false (an a11y error vs a contrast fail). |
| `contrastNote` | string | No | The rendered-contrast caveat for the contrast pillar (certify measures the categorical color bytes Forge baked into the compiled spec, on the light theme; dark-theme contrast is not verified) plus the role rationale when contrast is pass/fail/exempt (s137/s138). |
| `notes` | string[] | No | Human-readable notes — e.g. the uncertified-coverage rationale for an ECharts-primary type. |
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
