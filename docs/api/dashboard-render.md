# dashboard.render

> Render a composed metric-overview dashboard (KPI row + trend + breakdown + optional geo map) from a declarative DashboardSpec of shared datasets + panels. Composes each panel through the in-process viz engine with deterministic auto-layout, headless KPI compute, and cross-filter linking. Returns the resolved layout, per-panel compiled specs (Vega-Lite or ECharts, geo registration preserved), KPI values, a dashboard-level a11y block, and one specRef for pipeline reuse.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `schemaVersion` | any | Yes |  | IR version discriminant (V01 convention). A future template/shape change bumps to v0.2. |
| `id` | string | No |  | Stable identifier for the dashboard instance. |
| `title` | string | No |  | Human-friendly dashboard title surfaced in UI + narration. |
| `datasets` | _ref_[] | Yes |  | SEAM (a) cross-panel DATA-SHARING. Shared, named tabular datasets. Tabular chart panels and KPI panels reference one by `datasetId`; sharing a dataset is what makes cross-filter possible (panels filter the same dimensional space). |
| `panels` | _ref_[] | Yes |  | Heterogeneous panels: chart (any of the 11 viz.render chartTypes + its data branch) or kpi tiles. |
| `layout` | _ref_ | No |  |  |
| `links` | _ref_[] | No |  | Cross-filter wiring: a selection on a source panel filters a target panel. Declared in v1 (schema-frozen) so m04 adds only a reducer, not a schema change. |
| `crossFilter` | _ref_ | No |  |  |
| `onPanelError` | `placeholder` \| `omit` | No | `"placeholder"` | SEAM (b) partial-panel ERROR policy. 'placeholder' = render an a11y-described error panel in-place (default — don't void the dashboard); 'omit' = drop the failed panel from the layout. |
| `a11y` | _ref_ | Yes |  |  |
| `tokenCssRef` | string | No |  | SEAM (e) TOKEN strategy. One dashboard-level deferred token CSS reference (e.g. 'tokens.build'); tokens stay deferred to the consumer CSS bundle (viz.render compact posture). KPI threshold colors are NOT resolved inline. |
| `selection` | Record<string, _ref_> | No |  | Optional accumulated cross-filter SelectionState, keyed by sourceWidgetId (one active selection per source). When present, each panel's rows are cross-filtered (skip-self + AND-across-sources) before render/KPI compute; absent -> the unfiltered dashboard. |
| `output` | object | No |  | Optional render output controls (mirrors viz.render). |
| `output.compact` | boolean | No | `true` | When true, omit full token CSS and return a tokenCssRef instead. |
| `output.echarts` | boolean | No | `false` | When true, also include the ECharts option for tabular panels (ECharts-primary panels always include it). |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` | Yes | Whether the dashboard composed successfully (ok even when individual panels failed to a placeholder). |
| `schemaVersion` | string | No | Echoes the DashboardSpec IR version. |
| `panels` | _ref_[] | Yes | Per-panel compiled results, in declared panel order. A chart panel carries its compiled spec; a kpi panel carries computed values; a failed panel becomes an a11y-described error placeholder (onPanelError default). |
| `layout` | _ref_[] | No | The resolved abstract grid placements (m02), one per rendered panel. |
| `links` | object[] | No | The declared cross-filter links (echoed). The cross-filter resolver applies any active 'selection' to each panel before render. |
| `a11y` | _ref_ | No |  |
| `tokenCssRef` | string | No | Deferred token CSS reference when compact mode is on (use tokens.build). |
| `specRef` | string | No | One dashboard-level reference to the composed payload for pipeline reuse. |
| `specRefCreatedAt` | string | No |  |
| `specRefExpiresAt` | string | No |  |
| `output` | object | No | Echoes the normalized output controls. |
| `meta` | object | No |  |
| `errors` | _ref_[] | No |  |
| `warnings` | _ref_[] | Yes |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{
  "datasets": [],
  "panels": []
}
```
