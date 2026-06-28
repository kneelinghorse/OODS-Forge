# viz.fromText

> Render a governed chart from a FREE-TEXT request — the LLM half of NL→viz. A Claude parser (running above the deterministic tool boundary) maps your plain-language utterance + the data columns into a structured intent {goal, measures[], dimensions[], chartFamily?, measureRef?}, routes that intent through viz.render (which validates + renders it deterministically), and ECHOES the parsed intent back under `intent` so you can re-run viz.render(intent) to reproduce the chart byte-for-byte. Input: { text (required), rows (required v0.1), output? }. Output is the viz.render result (status, spec, chartType, a11y, suggestion, specRef) plus the advisory `intent` echo. The parse is the only non-deterministic step; a thin-goal request (no plottable measure) fails loud (OODS-V126) while still echoing what was parsed.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes |  | The natural-language chart request (e.g. 'show the trend of export value over the years'). |
| `rows` | object[] | Yes |  | Inline data rows — REQUIRED for v0.1. The parser reads the column names from these rows, and viz.render embeds data.values from them. Each row is a flat object mapping field name to value. |
| `datasetRef` | string | No |  | RESERVED (v0.1): rows-less / datasetRef-only requests are deferred — the parser needs inline rows to read the columns. Provide `rows`. |
| `output` | object | No |  | Optional render output controls, passed through to viz.render. Omitting this object preserves compact, Vega-Lite-only behavior. |
| `output.compact` | boolean | No | `true` | When true, omit the full token CSS from the response and return a tokenCssRef instead (use tokens.build to fetch it). |
| `output.echarts` | boolean | No | `false` | Opt in to ALSO compiling and returning an ECharts option (echartsSpec) alongside the default Vega-Lite spec. |
| `output.includeNormalizedSpec` | boolean | No | `false` | When true, also return the intermediate NormalizedVizSpec IR alongside the compiled renderer spec. |
| `output.includeA11y` | boolean | No | `false` | When true, also return a STRUCTURED two-part text alternative (accessible data table + narrative summary), and — when the parsed intent carries a governed measureRef — the governed narrative clause ('vs target …', 'unit …'). DEFAULT false keeps the wire compact. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` | Yes | Whether rendering succeeded (from viz.render). |
| `spec` | object | Yes | The compiled, renderable Vega-Lite spec (from viz.render). An empty object on error. |
| `warnings` | object[] | Yes | Non-fatal issues encountered during rendering (from viz.render). |
| `intent` | object | Yes | ADVISORY echo of the parsed structured intent. Pass this to viz.render to reproduce the chart deterministically. The parse is the only non-deterministic step. |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{
  "text": "<text>",
  "rows": []
}
```
