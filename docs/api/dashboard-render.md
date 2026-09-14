# dashboard.render

> Render a composed metric-overview dashboard (KPI row + trend + breakdown + optional geo map) from a declarative DashboardSpec of shared datasets + panels. Composes each panel through the in-process viz engine with deterministic auto-layout, headless KPI compute, and cross-filter linking. Returns the resolved layout, per-panel compiled specs (Vega-Lite or ECharts, geo registration preserved), KPI values, a dashboard-level a11y block, and one specRef for pipeline reuse.

PANEL IDENTITY. Every successful chart panel returns the contentHash produced by its in-process viz.render call; it therefore matches a standalone viz.render call with the identical spec and data. Set the call-level output.includeNormalizedSpec flag to also return each successful chart panel's NormalizedVizSpec. That IR can be passed to artifact.certify as {spec} alone for a cartesian chart, or as {spec,data} with exactly the matching hierarchy, sankey, chord, network, or geo branch for an ECharts-primary chart. These per-panel identity fields are attached after the dashboard's canonical {panels,layout} projection is cached and hashed, so they do not feed the dashboard contentHash.

HTML IDENTITY. When output.html=true, outputHtmlHash is SHA-256 over the exact returned HTML bytes. It is evidence of deterministic output for that call and runtime, not part of the ECharts certified-matrix/renderHash epoch. All 11 admitted chart panel types draw server-rendered SVG in light, dark and HC; both HC brand scopes have forced-colors browser proof. Chord and flow_map stay excluded from dashboards (#881). output.contrastScan is a four-pair brand-token preflight, not whole-document WCAG certification. HC scans return zero numerically graded pairs with a forced-colors explanation.

BRAND. Pass brand:'A'|'B' to select the palette used by both the tokens inlined into output.html and the four-pair contrast preflight; omit it for the previous behavior. Per-panel contentHash and dashboard contentHash are brand-invariant because brand applies at HTML/SVG emission time, while outputHtmlHash is brand-variant.

SCOPE. theme (light|dark|hc, default light) and brand (A|B, default A) resolve the generated CSS token scopes for chart pixels. Omission equals explicit light/A. Scope changes chart content and SVG hashes. HC emits the scope declarations verbatim, including Canvas/CanvasText; computed paints are verified under forced-colors browser emulation. All 13 chart types have measured HC SVG and forced-colors browser proof for both brands. HC heatmaps use nine declared quantized steps with symbol legends; numeric geo color uses declared piecewise steps. The paint guard still returns OODS-V165 if a renderer substitutes an undeclared paint. No server-side system-color hex palette is invented. Series retain the light palette where tokens declare no theme-specific palette. HTML sets data-theme and data-brand on the document. Governed measureRef resolution defaults to true: KPI refs bind field/aggregate, chart refs decorate narrative only. Unknown refs produce OODS-V130; missing resolved fields produce OODS-V137 through the panel error policy. Explicit resolveMeasures:false opts out of ref resolution; inputs without refs retain their rendered bytes.

**Registration:** auto

## Measured visualization coverage

Derived from `packages/viz-core/src/registry/viz-recipes.v1.json`, checked against the public-handler census.

Public SVG: 13/13. Dashboard SVG panels: 11/13. Certification coverage: 13 certified / 0 uncertified; uncertified results keep conformant:null.

Measured scope verdicts: 78 conformant / 0 nonconformant / 0 uncertified. Types with a nonconformant scope: none.

Theme parameters: light (13/13), dark (13/13) and hc (13/13 with measured SVGs; 0/13 typed-deferred). HC emits declared scope paints verbatim and contrast is forced-colors exempt; actual render failures still fail determinism. Brand parameters: A, B. Default scope is light/A.

Contrast measurement records actual categorical canvas grades, including failures; exemptions and unchecked results do not count as measured passes. The four Cartesian accuracy rules remain a closed set (V150–V153). ECharts offered rules: OODS-V154, OODS-V155, OODS-V156, OODS-V157, OODS-V158, OODS-V159, OODS-V168, OODS-V169, OODS-V170, OODS-V171, OODS-V172, OODS-V173; applicability and evaluated counts depend on the data operand.

Certification describes profile coverage. Conformant / declared counts only passing verdicts across all six declared scopes; a deferred or retired scope is not a passing verdict. ECharts Cartesian line/bar/area calls are spec-only and uncertified.

| Type | Engine | Dashboard | Certification | Light A | Light B | Dark A | Dark B | HC A | HC B | Conformant / declared | Contrast measured | Application | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| bar | vega-lite | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | light, dark | placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Categorical contrast passes both brands in: light, dark. Composed chart declarations: Invoice/detail, Invoice/workflow, Invoice/layout:dashboard. This census observes placement; generated React/Vue runtime proof is retained separately. Edited form data does not regenerate the static sample SVG. |
| line | vega-lite | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | light, dark | placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Categorical contrast passes both brands in: light, dark. Composed chart declarations: Usage/detail, Usage/workflow, Usage/layout:dashboard. This census observes placement; generated React/Vue runtime proof is retained separately. Edited form data does not regenerate the static sample SVG. |
| area | vega-lite | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | light, dark | placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Categorical contrast passes both brands in: light, dark. Composed chart declarations: Subscription/detail, Subscription/workflow. This census observes placement; generated React/Vue runtime proof is retained separately. Edited form data does not regenerate the static sample SVG. |
| scatter | vega-lite | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | light, dark | not-placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Categorical contrast passes both brands in: light, dark. Not placed: no public object binds this chart type through a canonical Mark chart declaration; standalone authoring preview support is separate. |
| heatmap | vega-lite | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | none (exempt) | not-placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Contrast verdict unchecked; no categorical canvas-ratio measurement claimed. Not placed: no public object binds this chart type through a canonical Mark chart declaration; standalone authoring preview support is separate. |
| treemap | echarts | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | light, dark | not-placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Categorical contrast passes both brands in: light, dark. Not placed: treemap requires a hierarchy array; no public object declares one. |
| sunburst | echarts | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | light, dark | not-placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Categorical contrast passes both brands in: light, dark. Not placed: sunburst requires a hierarchy array; no public object declares one. |
| sankey | echarts | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | light, dark | not-placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Categorical contrast passes both brands in: light, dark. Not placed: sankey requires numeric link values; Relationship neighborhood edges do not declare them. |
| chord | echarts | excluded (#881) | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | light, dark | not-placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Categorical contrast passes both brands in: light, dark. Dashboard exclusion (#881): the public panel schema does not admit this type. Not placed: chord requires numeric link values; Relationship neighborhood edges do not declare them. |
| force_graph | echarts | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | light, dark | placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Categorical contrast passes both brands in: light, dark. Composed chart declarations: Relationship/detail, Relationship/workflow. This census observes placement; generated React/Vue runtime proof is retained separately. Edited form data does not regenerate the static sample SVG. |
| choropleth | echarts | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | none (exempt) | not-placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Contrast verdict exempt; no categorical canvas-ratio measurement claimed. Not placed: choropleth requires inline geometry and matched region values; no public object declares that operand. |
| bubble_map | echarts | true | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | none (exempt) | not-placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Contrast verdict exempt; no categorical canvas-ratio measurement claimed. Not placed: bubble_map requires inline geometry and size-bound point values; no public object declares that operand. |
| flow_map | echarts | excluded (#881) | certified | rendered | rendered | rendered | rendered | rendered | rendered | 6/6 | none (exempt) | not-placed | HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence. Dashboard exclusion (#881): the public panel schema does not admit this type. Contrast verdict exempt; no categorical canvas-ratio measurement claimed. Not placed: flow_map requires inline geometry and origin/destination flows; no public object declares that operand. |

- HC paints are emitted from the declared token scope; contrast is forced-colors exempt and requires browser evidence.
- Categorical contrast passes both brands in: light, dark.
- Composed chart declarations: Invoice/detail, Invoice/workflow, Invoice/layout:dashboard. This census observes placement; generated React/Vue runtime proof is retained separately. Edited form data does not regenerate the static sample SVG.
- Composed chart declarations: Usage/detail, Usage/workflow, Usage/layout:dashboard. This census observes placement; generated React/Vue runtime proof is retained separately. Edited form data does not regenerate the static sample SVG.
- Composed chart declarations: Subscription/detail, Subscription/workflow. This census observes placement; generated React/Vue runtime proof is retained separately. Edited form data does not regenerate the static sample SVG.
- Not placed: no public object binds this chart type through a canonical Mark chart declaration; standalone authoring preview support is separate.
- Contrast verdict unchecked; no categorical canvas-ratio measurement claimed.
- Not placed: treemap requires a hierarchy array; no public object declares one.
- Not placed: sunburst requires a hierarchy array; no public object declares one.
- Not placed: sankey requires numeric link values; Relationship neighborhood edges do not declare them.
- Dashboard exclusion (#881): the public panel schema does not admit this type.
- Not placed: chord requires numeric link values; Relationship neighborhood edges do not declare them.
- Composed chart declarations: Relationship/detail, Relationship/workflow. This census observes placement; generated React/Vue runtime proof is retained separately. Edited form data does not regenerate the static sample SVG.
- Contrast verdict exempt; no categorical canvas-ratio measurement claimed.
- Not placed: choropleth requires inline geometry and matched region values; no public object declares that operand.
- Not placed: bubble_map requires inline geometry and size-bound point values; no public object declares that operand.
- Not placed: flow_map requires inline geometry and origin/destination flows; no public object declares that operand.

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `theme` | `light` \| `dark` \| `hc` | No | `"light"` | CSS token theme for chart pixels, default light. HC emits the declared scope colors verbatim, including CSS system colors; their computed paints require a forced-colors browser. A renderer that substitutes undeclared paints is typed-deferred instead of returning misleading HC pixels. No server-side system-color hex palette is invented. |
| `schemaVersion` | any | Yes |  | IR version discriminant (V01 convention). A future template/shape change bumps to v0.2. |
| `id` | string | No |  | Stable identifier for the dashboard instance. |
| `title` | string | No |  | Human-friendly dashboard title surfaced in UI + narration. |
| `datasets` | _ref_[] | Yes |  | SEAM (a) cross-panel DATA-SHARING. Shared, named tabular datasets. Tabular chart panels and KPI panels reference one by `datasetId`; sharing a dataset is what makes cross-filter possible (panels filter the same dimensional space). |
| `panels` | _ref_[] | Yes |  | Heterogeneous panels: chart (11 of the 13 viz.render chartTypes; chord and flow_map are viz.render-only, decision #881 — plus its data branch) or kpi tiles. |
| `layout` | _ref_ | No |  |  |
| `links` | _ref_[] | No |  | Cross-filter wiring: a selection on a source panel filters a target panel. Declared in v1 (schema-frozen) so m04 adds only a reducer, not a schema change. |
| `crossFilter` | _ref_ | No |  |  |
| `onPanelError` | `placeholder` \| `omit` | No | `"placeholder"` | SEAM (b) partial-panel ERROR policy. 'placeholder' = render an a11y-described error panel in-place (default — don't void the dashboard); 'omit' = drop the failed panel from the layout. |
| `resolveMeasures` | boolean | No | `true` | Phase-3 governed-measure RESOLUTION switch (sprint-117). When true, a KPI panel carrying a `measureRef` has it resolved against the governed-measure registry BEFORE compute: the registry's entityField/aggregate OVERRIDE the author's field/aggregate, and any default comparison/threshold fills only where the author omitted them. An unknown measureRef under this flag becomes an a11y-described error panel (OODS-V130) routed through `onPanelError`, NOT a silent value. DEFAULT true resolves supplied refs. Explicit false opts out of reference resolution; measureRef-only KPI panels then fail OODS-V137 because no field resolves. Inputs without refs retain their rendered bytes. A render-call control (like `selection`/`output`), so it lives only on the tool input — NOT in the DashboardSpec IR; it never reaches computeKpi (resolution is strictly input-side and is never echoed onto output panels). |
| `strictFields` | boolean | No | `false` | Field-presence STRICT switch (sprint-118 m05). When true, a referenced field absent from EVERY resolved (non-empty) row is surfaced as OODS-V131 at the ingestion boundary instead of a silent value:0 / confident-wrong spec: a KPI panel's field (+ periodField) and a tabular chart panel's encoding fields (x/y/color/size/shape/detail) must each be a key in >=1 row, else the panel is routed through `onPanelError` (placeholder = a11y-described error panel; omit = warning + drop). DEFAULT false keeps the legacy silent-empty behavior byte-identical. Scoped to field-presence ONLY — the frozen-D6 missing-datasetId silent-empty path (empty rows) is unchanged. A render-call control (like resolveMeasures); never reaches computeKpi. |
| `strictDatasets` | boolean | No | `false` | Unknown-datasetId STRICT switch (sprint-122 m03). When true, a KPI panel whose datasetId is NOT present in datasets[] fails through onPanelError (OODS-V139). A KNOWN dataset that filters/cross-filters to zero rows STILL renders value:0 (unchanged). Does NOT affect chart panels (their missing-datasetId path keeps OODS-V123). Default false = the legacy frozen-D6 silent-empty behavior, byte-identical. |
| `a11yEquivalence` | boolean | No | `true` | A11y equivalence CERTIFY-AT-EMISSION switch (sprint-134 m03; gate sprint-135 m04). DEFAULT ON. Each cartesian chart panel's emission is checked against the accessible-equivalence engine: an error-severity failure makes an error panel (first per-rule OODS-A11Y-<rule.id> code), warn-severity failures fold into the dashboard `warnings` as OODS-A11Y-<rule.id> prefixed with the originating panel id. Default builder output is conformant-BY-CONSTRUCTION (sprint-135 m02); set false to opt out for agent-supplied non-conformant panels. Scoped to cartesian chart panels (ECharts-primary/geo panels are excluded). |
| `a11y` | _ref_ | Yes |  |  |
| `tokenCssRef` | string | No |  | SEAM (e) TOKEN strategy. One dashboard-level deferred token CSS reference (e.g. 'tokens.build'); tokens stay deferred to the consumer CSS bundle (viz.render compact posture). When supplied, this exact reference is returned in compact output. KPI threshold colors are NOT resolved inline. |
| `brand` | `A` \| `B` | No |  | CSS token brand for the dashboard document and chart pixels; defaults to A. The contrast scan grades the same scoped document tokens. |
| `selection` | Record<string, _ref_> | No |  | Optional accumulated cross-filter SelectionState, keyed by sourceWidgetId (one active selection per source). When present, each panel's rows are cross-filtered (skip-self + AND-across-sources) before render/KPI compute; absent -> the unfiltered dashboard. |
| `output` | object | No |  | Optional render output controls (mirrors viz.render). |
| `output.compact` | boolean | No | `true` | When true, omit full token CSS and return a tokenCssRef instead. |
| `output.echarts` | boolean | No | `false` | When true, also include the ECharts option for tabular panels (ECharts-primary panels always include it). |
| `output.includeNormalizedSpec` | boolean | No | `false` | When true, also return each successfully rendered chart panel's intermediate NormalizedVizSpec IR on panels[].normalizedSpec. This is one call-level opt-in mirroring viz.render; KPI and error panels are unchanged, and the emitted IR sits outside the dashboard contentHash projection. |
| `output.html` | boolean | No | `false` | Opt-in render-to-SVG export (sprint-115). When true, additionally emit a self-contained HTML document on the output `html` field: Vega-Lite panels (trend/breakdown) rendered to inline SVG via @oods/viz-render, KPI tiles, and normalized inline SVG for all six admitted ECharts-primary panel types. Absent/false leaves the output byte-identical to the compact/echarts payload. |
| `output.dataTable` | boolean | No | `false` | A11y completeness (sprint-118 m07). When true AND output.html is set, append a screen-reader-only data-table inside each tabular chart <figure> whose cells equal the charted rows (the chart's encoding columns). DEFAULT false keeps the HTML byte-identical. |
| `output.contrastScan` | boolean | No | `false` | A11y completeness (sprint-118 m07). When true, run the four-pair token contrast preflight over the export's ALREADY-RESOLVED brand-token colour pairs (no filesystem read) and push OODS-V135 warnings for any pair below its WCAG threshold. This is a token preflight, not whole-dashboard WCAG certification. DEFAULT false emits nothing. |
| `output.dataQualityField` | string | No |  | A11y completeness (sprint-118 m07). When set (e.g. 'flag') AND output.dataTable is on, tally that column's data-quality codes (FAOSTAT E=estimated / I=imputed / X=external / blank=official) into a <caption> footnote per data-table. Pure presentation over a parameter — no Forge-side fetch. |
| `output.includeA11y` | boolean | No | `false` | When true, attach a STRUCTURED two-part text alternative (accessible data table + narrative summary) to each chart panel result (panels[].a11y), derived from the SAME data source the panel renders from (Forge-Demos FD#10) — for cartesian and non-cartesian panels alike. DEFAULT false keeps the wire byte-identical (panels carry only a11yDescription). |

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
| `html` | string | No | Opt-in self-contained dashboard HTML with scoped chart SVG, KPI tiles and error placeholders. Light/dark renders all admitted chart types. HC chart rendering preserves declared token colors; unsupported renderer paints become typed error panels under the existing placeholder/omit policy. |
| `specRef` | string | No | One dashboard-level reference to the composed payload for pipeline reuse. |
| `specRefCreatedAt` | string | No |  |
| `specRefExpiresAt` | string | No |  |
| `contentHash` | string | No | Deterministic SHA-256 (hex) over the canonicalized composed payload ({panels, layout}) — the content IDENTITY of exactly what specRef caches. Unlike specRef (a random, expiring cache handle), contentHash is stable: same input yields the same hash. panels[].contentHash, panels[].normalizedSpec, and outputHtmlHash are attached after this hash is computed and sit OUTSIDE the hashed projection. Default-on; omitted only on error outputs (sprint-134 m02). |
| `outputHtmlHash` | string | No | SHA-256 over the exact returned HTML bytes. Successful panels contain scoped SVG; failed panels follow the declared placeholder/omit policy, including measured HC render deferrals. This per-call identity is distinct from a certified runtime-matrix renderHashEpoch claim. |
| `output` | object | No | Echoes the normalized output controls. |
| `meta` | object | No |  |
| `errors` | _ref_[] | No |  |
| `warnings` | _ref_[] | Yes |  |
| `a11yContrast` | _ref_ | No |  |

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
