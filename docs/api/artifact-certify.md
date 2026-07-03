# artifact.certify

> Certify a Forge NormalizedVizSpec IR (the same IR viz.render emits as normalizedSpec). Returns an a11y-equivalence conformance verdict, a re-emit determinism proof, and a contentHash. Read-only — reads the IR, never rebuilds or re-recommends. Certification is cartesian-only (bar/line/area/scatter/heatmap → coverage:'certified' + conformant boolean + findings coded OODS-A11Y-<rule.id>); the 8 ECharts-primary types (treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord) return coverage:'uncertified'/conformant:null — a distinct verdict, not a failure. The contentHash matches viz.render's for the same IR, so an agent can round-trip render → certify.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `spec` | object | Yes |  | A Forge NormalizedVizSpec intermediate representation — the same IR viz.render emits as normalizedSpec. Validated authoritatively by the handler's assertNormalizedVizSpec. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` | Yes | Whether certification ran. 'error' means the input was not a valid NormalizedVizSpec IR. |
| `coverage` | `certified` \| `uncertified` | No | 'certified' for the 5 cartesian types (bar/line/area/scatter/heatmap) — carries a real conformance result. 'uncertified' for the 8 ECharts-primary types (treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord) — a11y-equivalence certification is cartesian-only (the Vega-Lite path). Absent on the error path. |
| `conformant` | boolean \| null | No | Certified path: true iff zero error-severity equivalence rules fail (warn-severity failures do not affect conformance). null on the uncertified path (no claim is made). Absent on the error path. |
| `findings` | _ref_[] | No | One entry per FAILING equivalence rule (empty when fully conformant, and empty on the uncertified path). |
| `determinism` | object | No | Re-emit determinism proof (certified path only): the Vega-Lite compile is byte-stable across two independent re-emits and its canonical form hashes to contentHash. Absent on the uncertified + error paths. |
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
