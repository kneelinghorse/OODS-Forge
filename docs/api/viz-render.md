# viz.render

> Render a real, data-bound visualization spec from inline rows (or a datasetRef). Supply chartType+encodings for explicit mode, or omit chartType for recommender-driven suggest mode. Returns a compiled Vega-Lite spec (ECharts opt-in via output.echarts) with a synthesized a11y description; compact by default with a specRef trio for pipeline reuse. Supports bar, line, area, scatter, heatmap.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dslVersion` | string | No |  | DSL version to use for this request. Defaults to the current version (1.0). |
| `rows` | object[] | No |  | Inline data rows — the primary data path. Bounded: a few hundred rows is the sweet spot. Each row is a flat object mapping field name to value. |
| `datasetRef` | string | No |  | Reference to a previously cached dataset (schemaRef-style TTL cache) to use instead of inline rows. Provide exactly one of 'rows' or 'datasetRef'. |
| `hierarchy` | any | No |  | Hierarchy data for chartType 'treemap' or 'sunburst' (explicit-only) — used INSTEAD of rows/datasetRef + x/y encodings. A discriminated union on 'type': 'adjacency_list' (flat nodes linked by parentId; a node whose parent is missing becomes its own root) or 'nested' (a single root node with children). |
| `sankey` | object | No |  | Flow data for chartType 'sankey' (explicit-only) — used INSTEAD of rows/datasetRef + x/y encodings. Nodes plus value-weighted links; every link MUST carry a numeric 'value' (the link width IS the flow magnitude) and reference existing node names. |
| `sankey.nodes` | object[] | Yes |  | Flow nodes. Each carries a unique 'name'; an optional numeric 'value' overrides the computed throughput. |
| `sankey.links` | object[] | Yes |  | Directed, value-weighted flows between nodes. |
| `network` | object | No |  | Network data for chartType 'force_graph' (explicit-only) — used INSTEAD of rows/datasetRef + x/y encodings. Nodes (each with a unique 'id'; an optional 'group' drives category colour) and directed links (optional numeric 'value'). |
| `network.nodes` | object[] | Yes |  | Graph nodes. Each carries a unique 'id'; optional 'group' (category) and 'value' (sizing). |
| `network.links` | object[] | Yes |  | Directed edges between nodes (an empty array is allowed for an all-isolated-nodes graph). |
| `geo` | object | No |  | Geo data for chartType 'choropleth', 'bubble_map', or 'flow_map' (explicit-only) — used INSTEAD of rows/datasetRef + x/y encodings. Carries INLINE geometry (a GeoJSON FeatureCollection in 'geojson', or a TopoJSON Topology in 'topojson' + 'topoObjectName'), an optional 'join' that merges tabular 'rows' into features by key, and the per-type encoding: 'valueField' colours regions for choropleth; 'longitudeField'/'latitudeField' (+ optional 'sizeField'/'colorField') place points for bubble_map; 'originLongitudeField'/'originLatitudeField'/'destinationLongitudeField'/'destinationLatitudeField' (+ optional 'strengthField'/'curvature') draw origin→destination ARCS for flow_map. Geometry is supplied INLINE — it is never fetched over the network. NOTE: geo specs are NOT self-contained (unlike treemap/sankey): the resolved FeatureCollection rides back on echartsSpec.__registration and the client re-registers the map by name before rendering. Geometry payloads can be large (a world atlas is ~100KB) — prefer a pre-simplified TopoJSON. |
| `geo.geojson` | object | No |  | Inline GeoJSON FeatureCollection (type:'FeatureCollection', features:[...]). Required for choropleth (the regions); optional base map for bubble_map. |
| `geo.topojson` | object | No |  | Inline TopoJSON Topology (type:'Topology'); converted to a GeoJSON FeatureCollection. Set 'topoObjectName' when the topology holds more than one object. |
| `geo.topoObjectName` | string | No |  | Which TopoJSON object to extract (defaults to the sole object when there is exactly one). |
| `geo.rows` | object[] | No |  | Tabular records: for choropleth, the values joined into features (paired with 'join'); for bubble_map, the points to plot. |
| `geo.join` | object | No |  | Choropleth join: merge each row into the feature whose 'featureProperty' equals the row's 'dataKey' value. |
| `geo.valueField` | string | No |  | Choropleth: the numeric field — in feature properties, or merged in via 'join' — whose value colours each region. Required for choropleth. |
| `geo.longitudeField` | string | No |  | Bubble map: the row field holding longitude. Required for bubble_map. |
| `geo.latitudeField` | string | No |  | Bubble map: the row field holding latitude. Required for bubble_map. |
| `geo.sizeField` | string | No |  | Bubble map: optional row field driving bubble size. |
| `geo.colorField` | string | No |  | Bubble map: optional row field driving bubble colour. |
| `geo.colorScale` | `linear` \| `quantize` \| `quantile` \| `threshold` \| `ordinal` | No |  | Optional colour scale (defaults to a continuous linear ramp). 'ordinal' paints discrete per-category colours. |
| `geo.originLongitudeField` | string | No |  | Flow map: the row field holding the ORIGIN longitude. Required for flow_map. |
| `geo.originLatitudeField` | string | No |  | Flow map: the row field holding the ORIGIN latitude. Required for flow_map. |
| `geo.destinationLongitudeField` | string | No |  | Flow map: the row field holding the DESTINATION longitude. Required for flow_map. |
| `geo.destinationLatitudeField` | string | No |  | Flow map: the row field holding the DESTINATION latitude. Required for flow_map. |
| `geo.strengthField` | string | No |  | Flow map: optional numeric row field whose magnitude drives each arc's line width (via a continuous visualMap). |
| `geo.curvature` | number | No |  | Flow map: optional arc curveness (0 = straight, ~0.3 default). Bends each origin→destination line into an arc. |
| `chartType` | `bar` \| `line` \| `area` \| `scatter` \| `heatmap` \| `treemap` \| `sunburst` \| `sankey` \| `force_graph` \| `choropleth` \| `bubble_map` \| `flow_map` | No |  | Chart type. The tabular marks (bar->MarkBar, line->MarkLine, area->MarkArea, scatter->MarkPoint, heatmap->MarkRect) bind inline rows/datasetRef with x/y encodings. The hierarchy/flow/network/geo charts are explicit-only and return an ECharts option as the primary spec (no Vega-Lite equivalent): 'treemap' and 'sunburst' take the 'hierarchy' data branch; 'sankey' takes the 'sankey' data branch (nodes + value-weighted links); 'force_graph' takes the 'network' data branch (nodes + links); 'choropleth', 'bubble_map', and 'flow_map' take the 'geo' data branch (inline geometry + per-type encoding — flow_map draws origin→destination arcs). Omit chartType to enter suggest mode (the recommender chooses a tabular type from the inferred field profiles). |
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
| `strictFields` | boolean | No | `false` | Field/key-presence STRICT switch (sprint-118 m05/m06). When true, a referenced data key that does not resolve is surfaced in `warnings` instead of a silent confident-wrong result: (m05) an explicit tabular chart whose encoding references a field ABSENT from every (non-empty) row → OODS-V131; (m06) a choropleth corridor whose join key has NO matching map feature → OODS-V134 (per unmatched corridor). DEFAULT false keeps today's behavior byte-identical (the geo silent-drop preserved). The dashboard.render strict check (its own `strictFields`) escalates V131 to an error panel via `onPanelError`. |
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
