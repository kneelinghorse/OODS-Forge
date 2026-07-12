# Forge — Geo-SVG-Export Scoping Memo (Roadmap-A)
## "The map rendering we requested" — scope, seam, and honest size

**Status:** SCOPING ONLY (no build). Produced by Sprint-151 m07 to honor Derek's "don't lose the map asks" flag and to make the map roadmap durable (it lived only in the CMOS inbox as FD-numbers).
**Verdict:** **DEFER** — roadmap-seating, not a scheduled build. There is **no active map puller** today (Demo 02 parked; Demo 03 "The Design DNA of the Web" is fully cartesian). This memo scopes the work so the next map consumer can unpark it without re-grounding.
**Grounded:** all load-bearing paths re-verified live at HEAD `31332a3` (Sprint-151 build session, 2026-07-12).

---

## 1. What "map rendering" actually means here

Forge already **models** geo (choropleth / bubble_map / flow_map): `viz.render` / `dashboard.render` accept spatial specs, run the ECharts-spatial adapters, and emit a **native a11y** description + table for them. What is **missing** is the **rendered SVG** in the exported `output.html` — a geo panel currently ships as an **a11y-described placeholder**, not a drawn map.

This is a **deliberate, frozen** scope line, not a bug:

- **Seam (c) — SINGLE-RENDERER SCOPE** (`cmos/planning/forge-viz-phase2.6-export-frozen-seams.md:48-58`): v1 renders **Vega-Lite panels to SVG only**. The dashboard output schema already splits the two payloads — `spec` = compiled Vega-Lite (tabular: KPI/trend/breakdown, `dashboard.render.output.json:85`) vs `echartsSpec` = ECharts-primary (geo/hierarchy/network, `:86`).
- The HTML emitter honors that split explicitly: ECharts-primary panels (geo: empty `spec`, `echartsSpec` present) → an **a11y-described PLACEHOLDER** (`packages/mcp-server/src/tools/dashboard.render.html.ts:6-8`; "NOT rendered in v1, per the m01 seam (c)"). Failed panels take the same placeholder path.
- **Frozen since s115** (phase-2.6): "one renderer (VL→SVG); geo is an a11y-described placeholder; no PNG, no second renderer" (`forge-viz-phase2.6-export-scoping-memo.md:51,90`). The deferred boundary already names "ECharts-primary rendered output (geo/sankey SVG)" as held.

So the honest one-liner: **Forge certifies and describes geo; it does not yet DRAW geo into the export.**

---

## 2. The seam — where a geo SVG renderer plugs in

The export pipeline lives in `@oods/viz-render` (`packages/viz-render`), the package that owns the `vega`/`vega-lite` runtime deps — deliberately kept OUT of `viz-core` so spec-only importers stay lightweight (`forge-viz-phase2.6-export-scoping-memo.md:52`; `viz-core/package.json` runtime deps stay `@oods/tokens`/`ajv`/`ajv-formats`/`topojson-client`).

The plug-in point is the panel-render branch that today emits the placeholder:

- **Today:** `dashboard.render.html.ts` routes a panel by which payload is populated — VL `spec` → SVG emitter; `echartsSpec` present + empty `spec` → placeholder.
- **The seam:** a second renderer, `echartsSpec → SVG`, invoked on that same branch instead of the placeholder. It must be a **server-safe, headless SVG** path (no browser/canvas) so byte-determinism and the "no headless-browser rasterization" freeze both hold.

Two candidate implementations (a real build must pick one after grounding):
1. **ECharts SSR string renderer** (echarts' own `renderToSVGString` on the node build) — closest to the already-emitted `echartsSpec`, but pulls ECharts into the render runtime and its SVG output must be proven deterministic + a11y-annotatable (role="img" + the existing computed narrative threaded in, mirroring the VL→SVG emitter).
2. **A dedicated geo → SVG projector** (project the GeoJSON/topojson with `d3-geo`-class math to path `d`s, style from the baked itemStyle bytes certify already grades) — heavier to build but keeps the render math in Forge's control and reuses `topojson-client` (already a viz-core dep) + the certify-graded colors.

Either way the **certify contract is unchanged**: certify already grades the ECharts-primary `echartsSpec` bytes (s134–s143 arc); drawing them changes nothing about the verdict, only whether a human sees the map.

---

## 3. Honest size: **L**

Not a one-sprint additive change. The cost drivers:
- A **second renderer** in `@oods/viz-render` (the whole point of Seam (c) was to avoid exactly this in v1) — new runtime dep, new determinism surface, new golden family for geo SVG output.
- **a11y-equivalence for the drawn map** must match the already-shipped native geo narrative/table (the text-vs-render family that cost s149/s150 — a drawn map whose SVG says something the a11y table doesn't is the same hollow-certified trap).
- **Projection correctness** (antimeridian, winding, holes — see FD#12 below) becomes load-bearing the moment pixels are drawn, where today it is consumer-side.

**Recommendation:** schedule only when a **named map puller** exists (a consumer that renders geo through `dashboard.render` and needs the SVG, not just the a11y description). Until then this stays roadmap-seated. Do NOT build it speculatively — it would be the anti-circular "build-the-consumer-in-sprint" shape the arc has explicitly avoided.

---

## 4. Refiled deferred map asks (durable record)

These lived only in the Forge CMOS inbox as FD-numbers / prose. Recorded here + via `cmos_feedback` so they survive inbox rotation.

### FD#13 — per-layer spatial `from` scoping (latent bug, NOT MCP-reachable)
A multi-layer `SpatialSpec` layer can carry a `from` reference that never resolves (phantom scatter/arcs) — the spatial analogue of item #16's `Mark.from`. **KEEP SEPARATE from #16** (Sprint-151 decision): `Mark.from` rides `NormalizedVizSpec`, is already wired in the cartesian adapters, and is MCP-reachable → built in s151. `SpatialLayer.from` rides the separate `SpatialSpec` that sits beside the IR, is never wired, and is **not MCP-reachable** (the single-layer geo MCP branches gate it). Blockers before it is load-bearing: (1) a referent-design pick — named-datasets map (mirror #16's shape) vs a discriminator column; (2) a multi-layer geo MCP **input schema**. When built, **mirror #16's `datasets`-map shape** for consumer consistency but keep it self-contained in `echarts-spatial-adapter.ts` + `spatial.ts` (shared *pattern*, never shared *code*). Gating decision (Derek): does a multi-layer geo MCP input schema get roadmapped? FD#13 rides on that.

### FD#12 — antimeridian split (cheap plumbing, ship-a-broken-map risk)
Opt-in `options.splitAntimeridian` on `registerGeoJson`'s existing options bag, crossing-guarded early-return (#564 zero-churn when off). The trap: a **correct general split** (MultiPolygon / holes / re-closing / winding) is **M–L** and a wrong split ships a visibly broken map — **worse** than the consumer's working `stripAntimeridianRings`. So: keep antimeridian **consumer-side** for now; add ONE sentence to the geo-branch schema description noting antimeridian is currently consumer-handled and the split is a **future opt-in** (so the next consumer doesn't re-probe guessed option names). No puller (Demo 02 parked).

### Roadmap-D/E — advertised-but-stubbed geo layers (#115 / #110 honesty exposure)
`heatmap` / `contour` LayeredOverlay layers and the `tile` basemap are **advertised in the public trait schema but stubbed** (`docs/traits/layered-overlay.md` — "Rendering: … (future)" on Boundaries/contour; Tile/Custom listed as base layers). This is the exact **advertised-but-no-op** class Meridian flags: an agent reads the trait as capable, gets nothing. **Decision to force when a map consumer unparks:** *reject-loud or implement* — either the schema/description says "declared, not yet rendered" (honest #115) or the layer actually draws. Until then, flag it here so it is not silently trusted.

### #17 — MarkText / MarkRule annotation marks (consumer nice-to-have, off critical path)
Honest scope **L**, park as ONE entry with the a11y-surfacing as the advertising gate: (A) vega-lite `MARK_TRAIT_MAP` + `text` channel; (B) an ECharts `markPoint`/`markLine` **component** branch (no series equivalent — a component-not-series divergence); (C) **the load-bearing part** — a11y-equivalence **surfacing** of the annotation text (any "annotations in the certified plane" #115 claim is hollow until the annotation text is in the a11y table; advertising after only (A) ships the text-vs-render divergence that cost s149/s150); (D) certify untouched (#110 holds — annotation-secondary specs route on their cartesian primary). Consumer ships annotations as adjacent HTML chrome today, so this is genuinely off the critical path.

---

## 5. Doc-drift note (SSOT §6 — verify-then-correct, low-risk)

Forge-Demos FYI: several circulating "capability names" are **source-module paths, not public exports**. Actual public exports (verify before quoting in #115 prose): `resolveCategoricalPalette` / `resolveOodsEchartsChrome` / `resolveOodsVegaConfig`; `analyzeSankey` / `analyzeHierarchy` / `analyzeNetwork` / `analyzeSpatial` (with `AnalysisTableInput` / `AnalysisNarrativeInput` overloads); `MeasureNarrativeContext` uses `thresholdValue` (not `threshold`); `VIZ_CATEGORICAL_SCALE` is declared in the `.d.ts` but **not exported**. Low-risk, doc-only — fold into a future docs sweep, do not gate anything on it.

---

## 6. What this memo does NOT authorize

No product-code change this sprint. No new renderer, no antimeridian build, no annotation build, no stubbed-layer implementation. This is the durable **map roadmap** — it converts inbox FD-numbers into a record a future map puller can execute against. **Build gate for every item above: a named consumer that actually needs the drawn/annotated/split output**, not a speculative capability.

**Provenance:** Sprint-151 m07 (SSOT `cmos/planning/forge-viz-s151-demo03-completeness-decision-memo.md` §2 m07 + §5). Fenced-seam citations re-verified live at HEAD 31332a3.
