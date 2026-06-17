# viz.render

> Render a real, data-bound visualization spec from inline rows (or a datasetRef). Supply chartType+encodings for explicit mode, or omit chartType for recommender-driven suggest mode. Returns a compiled Vega-Lite spec (ECharts opt-in via output.echarts) with a synthesized a11y description; compact by default with a specRef trio for pipeline reuse. Supports bar, line, area, scatter, heatmap.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dslVersion` | string | No |  | DSL version to use for this request. Defaults to the current version (1.0). |
| `rows` | object[] | No |  | Inline data rows — the primary data path. Bounded: a few hundred rows is the sweet spot. Each row is a flat object mapping field name to value. |
| `datasetRef` | string | No |  | Reference to a previously cached dataset (schemaRef-style TTL cache) to use instead of inline rows. Provide exactly one of 'rows' or 'datasetRef'. |
| `chartType` | `bar` \| `line` \| `area` \| `scatter` \| `heatmap` | No |  | Beachhead chart type (maps to a mark trait: bar->MarkBar, line->MarkLine, area->MarkArea, scatter->MarkPoint, heatmap->MarkRect). Omit to enter suggest mode (the recommender chooses from the inferred field profiles). |
| `encodings` | object | No |  | Channel -> field bindings. Required, with at least x and y, when chartType is supplied (explicit mode). |
| `encodings.x` | _ref_ | No |  |  |
| `encodings.y` | _ref_ | No |  |  |
| `encodings.color` | _ref_ | No |  |  |
| `encodings.size` | _ref_ | No |  |  |
| `encodings.shape` | _ref_ | No |  |  |
| `encodings.detail` | _ref_ | No |  |  |
| `id` | string | No |  | Optional stable identifier for the produced spec. |
| `name` | string | No |  | Optional human-friendly chart title. |
| `description` | string | No |  | Optional override for the synthesized accessibility description. When omitted, a non-empty description is generated from the encodings. |
| `output` | object | No |  | Optional render output controls. Omitting this object preserves compact, Vega-Lite-only behavior. |
| `output.compact` | boolean | No | `true` | When true, omit the full token CSS from the response and return a tokenCssRef instead (use tokens.build to fetch it). Mirrors repl.render; keeps MCP responses within result-size caps. |
| `output.echarts` | boolean | No | `false` | Opt in to ALSO compiling and returning an ECharts option (echartsSpec) alongside the default Vega-Lite spec. Decision 3: Vega-Lite is compact-default, ECharts is opt-in full. |
| `output.includeNormalizedSpec` | boolean | No | `false` | When true, also return the intermediate NormalizedVizSpec IR alongside the compiled renderer spec (useful for debugging and round-trip). |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` | Yes | Whether rendering succeeded. |
| `chartType` | string | No | Resolved chart type (bar, line, area, scatter, heatmap; empty on error). |
| `mode` | `explicit` \| `suggest` | No | Whether the chart type was supplied explicitly or chosen by the recommender. |
| `spec` | object | Yes | The compiled, renderable Vega-Lite spec — the primary payload a consumer renders. An empty object on error. |
| `echartsSpec` | object | No | The compiled ECharts option. Present only when output.echarts was requested (opt-in full path). |
| `normalizedSpec` | object | No | The intermediate NormalizedVizSpec IR. Present only when output.includeNormalizedSpec is true. |
| `a11yDescription` | string | No | The non-empty accessibility description carried by the spec (always synthesized when not provided). |
| `suggestion` | object | No | Present in suggest mode: the recommender pick that drove the chart type, with the data-aware rationale and runner-up alternatives. |
| `lowConfidence` | boolean | No | Suggest mode only: true when no pattern matched confidently — the chartType is a low-confidence fallback rather than a positive recommendation (the previously-silent bar default, now surfaced). |
| `specRef` | string | No | Temporary reference to the produced spec for pipeline reuse (mirrors viz.compose schemaRef). |
| `specRefCreatedAt` | string | No | ISO timestamp when the specRef was created. |
| `specRefExpiresAt` | string | No | ISO timestamp when the specRef expires. |
| `tokenCssRef` | string | No | Reference to the token CSS artifact when compact mode is enabled. Use tokens.build to obtain the full CSS. |
| `output` | object | No | Echoes the normalized output controls used by the renderer. |
| `errors` | _ref_[] | No | Fatal errors (present and non-empty when status is 'error'). |
| `warnings` | _ref_[] | Yes | Non-fatal issues encountered during rendering. |
| `meta` | object | No |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{}
```
