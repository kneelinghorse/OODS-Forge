# Recipe 2: Dashboard with Charts

Render real, data-bound chart specs with `viz.render`, then assemble them into a
dashboard layout. Each `viz.render` call returns a **compiled, renderable
Vega-Lite spec** (ECharts opt-in) with your data bound into `data.values` — a
consumer (e.g. Workbench) draws it; the server does not render HTML.

## Problem

You want a subscription analytics dashboard with a bar chart of monthly revenue
and a line chart of subscriber growth over time. You already have the rows
(query them from your warehouse, or hydrate them from the Subscription object's
fields) and want genuinely renderable chart specs back.

## Step 1: Render the bar chart (revenue)

Pass inline `rows` plus an explicit `chartType` + `encodings`. The handler binds
the data and compiles a Vega-Lite spec.

```json
// viz.render
{
  "rows": [
    { "month": "2024-01", "revenue": 120000, "status": "active" },
    { "month": "2024-02", "revenue": 128000, "status": "active" },
    { "month": "2024-03", "revenue": 131000, "status": "active" }
  ],
  "chartType": "bar",
  "encodings": {
    "x": "month",
    "y": { "field": "revenue", "aggregate": "sum" },
    "color": "status"
  }
}
```

**Expected output (abbreviated):**

```json
{
  "status": "ok",
  "mode": "explicit",
  "chartType": "bar",
  "spec": {
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
    "data": { "values": [{ "month": "2024-01", "revenue": 120000, "status": "active" }] },
    "mark": { "type": "bar" },
    "encoding": {
      "x": { "field": "month", "type": "ordinal" },
      "y": { "field": "revenue", "type": "quantitative", "aggregate": "sum" },
      "color": { "field": "status", "type": "nominal" }
    }
  },
  "a11yDescription": "Bar chart of sum of revenue by month, split by status.",
  "tokenCssRef": "tokens.build",
  "specRef": "viz-render-…",
  "output": { "compact": true },
  "warnings": []
}
```

The `spec` is the payload to render. It passes `vl.compile` + `vega.parse` (the
render-fidelity goldens prove this), so it is genuinely drawable, not just
schema-valid. By default the response is compact: token CSS is omitted and
returned as `tokenCssRef` — fetch it with `tokens.build`, or pass
`output.compact: false` to inline it.

## Step 2: Render the line chart (subscriber growth)

```json
// viz.render
{
  "rows": [
    { "month": "2024-01", "subscribers": 1840 },
    { "month": "2024-02", "subscribers": 2010 },
    { "month": "2024-03", "subscribers": 2230 }
  ],
  "chartType": "line",
  "encodings": {
    "x": { "field": "month", "scale": "temporal" },
    "y": "subscribers"
  }
}
```

**Expected output (abbreviated):**

```json
{
  "status": "ok",
  "mode": "explicit",
  "chartType": "line",
  "spec": {
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
    "data": { "values": [{ "month": "2024-01", "subscribers": 1840 }] },
    "mark": { "type": "line" },
    "encoding": {
      "x": { "field": "month", "type": "temporal", "scale": { "type": "time" } },
      "y": { "field": "subscribers", "type": "ordinal" }
    }
  },
  "a11yDescription": "Line chart of subscribers by month.",
  "tokenCssRef": "tokens.build",
  "specRef": "viz-render-…",
  "output": { "compact": true },
  "warnings": []
}
```

> **Tip — let the recommender choose:** omit `chartType` (and `encodings`) to
> enter *suggest mode*. `viz.render` infers field profiles from the rows, picks a
> chart type, and returns a `suggestion` (`{ patternId, score }`) plus
> `inferredFields` in `meta`.

## Step 3: Compose the dashboard shell

`viz.render` returns chart specs, not layout. Use `design.compose` to build the
dashboard shell (metric cards + chart panels) the charts drop into.

```json
// design.compose
{
  "intent": "analytics dashboard with subscription metrics",
  "object": "Subscription",
  "layout": "dashboard",
  "preferences": { "metricColumns": 4 }
}
```

**Expected output (abbreviated):**

```json
{
  "status": "ok",
  "layout": "dashboard",
  "schemaRef": "ref:dash-001",
  "selections": [
    { "slotName": "metric-0", "selectedComponent": "MetricCard" },
    { "slotName": "main-chart", "selectedComponent": "ChartPanel" },
    { "slotName": "secondary-chart", "selectedComponent": "ChartPanel" }
  ]
}
```

## Step 4: Render the dashboard

A consumer (Workbench, or your own app) renders each chart `spec` from Steps 1–2
into the `ChartPanel` slots of the dashboard shell from Step 3 — e.g. with
`vega-embed` on the client. The chart specs and the dashboard schema are
independent artifacts you assemble at the rendering layer.

## Key Takeaways

- `viz.render` returns a **real, renderable** Vega-Lite spec with your data bound
  into `data.values` — proven drawable via `vl.compile` + `vega.parse`.
- Provide exactly one of `rows` (inline, primary) or `datasetRef` (a cached
  dataset). Supply `chartType` + `encodings` for explicit mode, or omit
  `chartType` for recommender-driven suggest mode.
- Responses are compact by default (`tokenCssRef` instead of inlined token CSS);
  opt into ECharts with `output.echarts: true`.
- `viz.render` is spec-only (no SSR) — the consumer draws the chart and lays it
  into a `design.compose` dashboard shell.
