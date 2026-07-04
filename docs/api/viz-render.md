# viz.render

> Render a real, data-bound visualization spec from inline rows (or a datasetRef). Three input modes: supply chartType+encodings for explicit mode; omit chartType for recommender-driven suggest mode; OR supply a structured `intent` {goal, measures[], dimensions[], chartFamily?, measureRef?} (instead of chartType/encodings — the deterministic half of NL→viz) where the named fields drive encoding, the goal+data drive the recommender pick, an optional chartFamily post-filters it, and an optional governed measureRef lights the measure narrative under output.includeA11y. Returns a compiled Vega-Lite spec (ECharts opt-in via output.echarts) with a synthesized a11y description; compact by default with a specRef trio for pipeline reuse. Supports 13 chart types: 5 tabular (bar, line, area, scatter, heatmap) in suggest/explicit/intent mode, plus 8 explicit-only (treemap, sunburst, sankey, force_graph, chord, choropleth, bubble_map, flow_map).

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
| `chord` | object | No |  | Chord data for chartType 'chord' (explicit-only) — used INSTEAD of rows/datasetRef + x/y encodings. A native ECharts ribbon diagram: a ring of category arcs connected by weighted ribbons. Sankey-shaped — nodes plus value-weighted links; every link MUST carry a numeric 'value' (the ribbon width IS the flow magnitude) and reference existing node names. |
| `chord.nodes` | object[] | Yes |  | Ring arcs. Each carries a unique 'name'. |
| `chord.links` | object[] | Yes |  | Directed, value-weighted ribbons between ring arcs (matched to arcs by name). |
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
| `chartType` | `bar` \| `line` \| `area` \| `scatter` \| `heatmap` \| `treemap` \| `sunburst` \| `sankey` \| `force_graph` \| `choropleth` \| `bubble_map` \| `flow_map` \| `chord` | No |  | Chart type. The tabular marks (bar->MarkBar, line->MarkLine, area->MarkArea, scatter->MarkPoint, heatmap->MarkRect) bind inline rows/datasetRef with x/y encodings. The hierarchy/flow/network/geo charts are explicit-only and return an ECharts option as the primary spec (no Vega-Lite equivalent): 'treemap' and 'sunburst' take the 'hierarchy' data branch; 'sankey' takes the 'sankey' data branch (nodes + value-weighted links); 'force_graph' takes the 'network' data branch (nodes + links); 'choropleth', 'bubble_map', and 'flow_map' take the 'geo' data branch (inline geometry + per-type encoding — flow_map draws origin→destination arcs); 'chord' takes the 'chord' data branch (sankey-shaped nodes + value-weighted links — a ring of category arcs joined by ribbons whose width is the value). Omit chartType to enter suggest mode (the recommender chooses a tabular type from the inferred field profiles). |
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
| `a11yEquivalence` | boolean | No | `true` | A11y equivalence CERTIFY-AT-EMISSION switch (sprint-134 m03; gate sprint-135 m04). DEFAULT ON. The cartesian (Vega-Lite) emission is checked against the accessible-equivalence engine (validateVizEquivalenceRules): error-severity rules BLOCK (status:'error' with per-rule OODS-A11Y-<rule.id> codes in `errors`), warn-severity failures surface in `warnings` as OODS-A11Y-<rule.id>. Default builder output is conformant-BY-CONSTRUCTION (sprint-135 m02), so generated specs pass; set false to opt out for agent-supplied non-conformant specs. Scoped to the cartesian path (the ECharts-primary scaffold has empty data and would spuriously fail data-equivalence rules). |
| `output` | object | No |  | Optional render output controls. Omitting this object preserves compact, Vega-Lite-only behavior. |
| `output.compact` | boolean | No | `true` | When true, omit the full token CSS from the response and return a tokenCssRef instead (use tokens.build to fetch it). Mirrors repl.render; keeps MCP responses within result-size caps. |
| `output.echarts` | boolean | No | `false` | Opt in to ALSO compiling and returning an ECharts option (echartsSpec) alongside the default Vega-Lite spec. Decision 3: Vega-Lite is compact-default, ECharts is opt-in full. |
| `output.includeNormalizedSpec` | boolean | No | `false` | When true, also return the intermediate NormalizedVizSpec IR alongside the compiled renderer spec (useful for debugging and round-trip). |
| `output.includeA11y` | boolean | No | `false` | When true, also return a STRUCTURED two-part text alternative (accessible data table + narrative summary) derived from the SAME data source the chart renders from — for every chart type, cartesian and non-cartesian alike (Forge-Demos FD#10). DEFAULT false keeps the wire byte-identical (only a11yDescription). |
| `intent` | object | No |  | STRUCTURED (typed, NOT free-text) visualization intent — the deterministic half of the NL→viz hand-off (sprint-131). Supply it INSTEAD of chartType/encodings (mutually exclusive with chartType): the named measures/dimensions drive ENCODING, `goal` + the data drive the recommender's chartType pick, an optional `chartFamily` post-filters that pick, and an optional governed `measureRef` lights the governed-measure narrative overlay (only when output.includeA11y=true). Requires `rows` (or a `datasetRef`). |
| `intent.goal` | `comparison` \| `trend` \| `composition` \| `part-to-whole` \| `relationship` \| `intensity` \| `distribution` | Yes |  | The analytical goal that steers the recommender (the live 7-value goal vocabulary). |
| `intent.measures` | object[] | Yes |  | Named measure fields (the metrics to plot). Each name MUST exist among the data rows' fields. `type` is RESERVED in v0.1 (field types infer from the data). |
| `intent.dimensions` | object[] | Yes |  | Named dimension fields (the breakdowns/axes); may be empty (e.g. a two-measure scatter). Each name MUST exist among the data rows' fields. `type` is RESERVED in v0.1 (field types infer from the data). |
| `intent.chartFamily` | `bar` \| `line` \| `area` \| `scatter` \| `heatmap` | No |  | Optional preferred chart family. Post-filters the recommender ranking (NOT a scorer term) to this family, flagged lowConfidence when it was not the recommender's top pick. Constrained to the 5 TABULAR marks — the 8 explicit-only types are not recommender-rankable. |
| `intent.measureRef` | string | No |  | Optional governed-measure reference (e.g. 'gm.revenue.total'). NARRATIVE-ONLY: it does NOT drive encoding. When set, its resolved measure context decorates the chart's a11y narrative ('unit …', 'vs target …') — but only when output.includeA11y=true. An unknown reference is a hard error (OODS-V130). |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` | Yes | Whether rendering succeeded. |
| `chartType` | string | No | Resolved chart type (bar, line, area, scatter, heatmap; empty on error). |
| `mode` | `explicit` \| `suggest` | No | Whether the chart type was supplied explicitly or chosen by the recommender. |
| `spec` | object | Yes | The compiled, renderable Vega-Lite spec — the primary payload a consumer renders. An empty object on error. As of sprint-144 the cartesian family also carries a baked OODS `config` chrome theme (background, axes/gridlines, typography, legend, view box) alongside the sprint-138 series-color bake, so a generated chart reads as OODS-designed on the light theme; this moved the cartesian render↔certify contentHash to a new value in lockstep (an owned #564 regen) and left the ECharts-primary types byte-unchanged (separate adapter). |
| `echartsSpec` | object | No | The compiled ECharts option. Present only when output.echarts was requested (opt-in full path). As of sprint-145 the 8 ECharts-primary types (treemap/sunburst/sankey/chord/force_graph + geo choropleth/bubble_map/flow_map) also carry a baked OODS chrome theme (background, tile/node/arc borders, on-canvas + on-tile labels, breadcrumb/ring surfaces, geo visualMap labels, and the chart title) — the mirror of the sprint-144 cartesian chrome — so a generated chart reads as OODS-designed on the light theme; this moved the ECharts render↔certify contentHash to a new value in lockstep (an owned #564 regen) and left the cartesian family byte-unchanged. Series colors (categorical/sequential) are untouched — only chrome is themed. |
| `normalizedSpec` | object | No | The intermediate NormalizedVizSpec IR. Present only when output.includeNormalizedSpec is true. |
| `a11yDescription` | string | No | The non-empty accessibility description carried by the spec (always synthesized when not provided). |
| `a11y` | object | No | Structured two-part text alternative (accessible data table + narrative summary) derived from the SAME data source the chart renders from (Forge-Demos FD#10). Present only when output.includeA11y is true (additive; default-off keeps the wire byte-identical). An agent reads this to verify/iterate its own chart without re-deriving the data. |
| `suggestion` | object | No | Present in suggest mode: the recommender pick that drove the chart type, with the data-aware rationale and runner-up alternatives. |
| `lowConfidence` | boolean | No | Suggest mode only: true when no pattern matched confidently — the chartType is a low-confidence fallback rather than a positive recommendation (the previously-silent bar default, now surfaced). |
| `specRef` | string | No | Temporary reference to the produced spec for pipeline reuse (mirrors viz.compose schemaRef). |
| `specRefCreatedAt` | string | No | ISO timestamp when the specRef was created. |
| `specRefExpiresAt` | string | No | ISO timestamp when the specRef expires. |
| `contentHash` | string | No | Deterministic SHA-256 (hex) over the canonicalized primary payload (the Vega-Lite spec, or the JSON-projected ECharts option for ECharts-primary types) — the content IDENTITY of exactly what specRef caches. Unlike specRef (a random, expiring cache handle), contentHash is stable across calls: the same input yields the same hash. Default-on; omitted only on error outputs (sprint-134 m02). |
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
