# Forge Sprint 190 — Visualization public-render closure: pixels, theme, truth

**Status:** LOCKED — planning session `PS-2026-09-09-003`, 2026-09-09. Direction chosen by Derek after the Sprint 189 review: visualization public-render closure (#1372), which was always next on his list.
**Program authority:** [Product Reality Program](../foundational-docs/roadmap/product-reality-program.md) — increment "Current visualization closure": *one recipe/artifact registry for the current 13; at least one public pixel path for each; truthful Dashboard/static/React/Vue/theme/a11y/certification cells*; exit gate *13/13 current recipes render visible public output*; program exit criterion 7.
**Predecessor:** Sprint 189, certified and closed by `PS-2026-09-09-002` (decisions `#1844` verdict, `#1845` residual craft, `#1846` CI finding); PR #90 merged, review-closure commit `c3a68d5f` = PR #91.
**Build base:** `c3a68d5f` (`OODS-pro` `513dcbba` plus the Sprint 189 review closure). Public runtime bytes identical to the reviewed Sprint 189 implementation `ab7a4631`; the closure commit moved the roadmap, prose contract tests and `scripts/pkg/compat.ts` only.
**Per-mission detail lives in CMOS** (`s190-m01`–`s190-m06`). This memo carries scope, measured facts, settled decisions, the exit gate and the descope ladder.

## 1. What this sprint is

Three things, in this order:

**(a) Ship.** Put the reviewed Sprint 189 head on the live bridge. PM2 serves `f4cd1ba3`: nobody using Forge
through the bridge has the collections, the reconciled form and detail, or `design_preview`. Send the reconnect
Sprint 189 m06 prepared and left unsent.

**(b) Pixels and theme.** Forge admits 13 chart types and returns a spec for each; it returns pixels for none of
them through `viz.render`, draws 5 of 11 panel types in dashboard HTML and prints a placeholder for the other 6,
and renders every chart in one light chrome while its own token build already emits six brand × theme scopes.
The consumer who evaluated Forge with numbers (cmos-dashboard, sprint 52) kept Chart.js for exactly those three
reasons and named what it wants: a server-side SVG path with a theme parameter. The renderer already exists
(`@oods/viz-render` renders Vega-Lite and ECharts to deterministic SVG and certify uses both legs); it is not on
the public surface, and its tokens option is a pinned no-op. This sprint puts it on the surface, applies the
tokens, and makes theme and brand parameters of `viz.render`, `dashboard.render` and `artifact.certify`.

**(c) Truth.** One executable registry of the 13 recipes with cells for spec, public SVG, dashboard drawing,
themes, accessibility description, accuracy rules, certification coverage and chart-in-app — measured by a
census that calls the public handlers, pinned by a contract test, and the source of the roadmap tables. And the
program's own park, "a preview frame is not a chart": `VizAreaPreview` becomes a real chart in HTML, React and
Vue, placed by the composer on one object, proven by the design loop's receipts.

## 2. Measured starting point

Measured during planning at `c3a68d5f` from the source, the Sprint 189 evidence and the live PM2 process.

| Surface | Measured now |
|---|---|
| Served bridge | PM2 `oods-forge-bridge` at port 4466, `/health.revision` = `f4cd1ba3` (the Sprint 188 head delivered by Sprint 189 m01). Registry: 21 auto tools (`design_preview` included) and 6 on-demand. Store: 16 records + index, 17 live hashes at the Sprint 188 adoption baseline. |
| `viz.render` | Input `output` = `compact` (default true), `echarts`, `includeNormalizedSpec`, `includeA11y` (`schemas/viz.render.input.json:315-340`). No `theme`, `format`, `svg`, `width` or `height`. Output = compiled Vega-Lite `spec` (or JSON-projected ECharts option), `contentHash`, `specRef*`, `a11yDescription`; zero occurrences of `svg`/`html`/`png` in `tools/viz.render.ts`. The 13 admitted types are the `chartType` enum at `viz.render.input.json:274`; the ECharts-primary partition is `tools/echarts-primary.ts:27-52`. |
| `dashboard.render` | 11 panel chart types (chord and flow_map excluded by `#881`). `output.html` renders the 5 cartesian panels through `renderVegaLiteToSvg` (`dashboard.render.html.ts:282-293`) and sends the 6 ECharts-primary (treemap, sunburst, sankey, force_graph, choropleth, bubble_map) to `placeholderCell(..., 'geo')` (`:295-296`, `:383-399`): a `<section role="img">` with a note, no image. `docs/api/dashboard-render.md:9` says so. `brand: 'A'|'B'` exists; no theme axis. |
| `@oods/viz-render` | `renderVegaLiteToSvg` (headless Vega, `renderer:'none'`, text metrics arithmetic, ids normalized — `emitter.ts:53-141`) and `renderEChartsToSvg` (worker SSR, `normalizeEChartsSvg`). Deps `vega ^6.2`, `vega-lite ^6.4.1`, `echarts ^6`. Wired into `dashboard.render.html.ts:292` and `artifact.certify.ts:486/529/905`, not into `viz.render`. The `tokens` option is threaded and **not applied** (`emitter.ts:110-112`), pinned by `test/emitter.spec.ts:103-111` (`withTokens === withoutTokens`). The one committed SVG golden (`emitter.spec.ts:113-121`) renders a raw spec with Vega defaults (`fill="white"`, `#4c78a8`, `sans-serif`) — un-themed. `certified-matrix.json:24-33` pins normalized-SVG hashes for the 8 ECharts-primary types. |
| Theme | `packages/viz-core/src/tokens/oods-vega-config.ts:16-18` and `oods-echarts-chrome.ts:26`: "Light-only (resolveTokenToColor is theme-blind; memo §8 defers the theme-aware lift)". `token-resolver.ts:16-21` reads a single flat `tokensBundle.cssVariables` map from `@oods/tokens`. `packages/tokens/dist/css/tokens.css` already emits scopes `[data-brand='A'|'B']` × `[data-theme='base'|'light'|'dark'|'hc']`; `@oods/component-styles` declares the six brand × theme cells (`SUPPORTED_COMPONENT_THEME_CELLS`). Only `viz.compose` (deprecated) has a `theme` string, and it sets a `data-theme` attribute on a scaffold. Dark-theme contrast is disclaimed as unverified at `certify-contrast.ts:43/123/131` and `artifact.certify.ts:180/400-416/952`. |
| Certification | `artifact.certify` input = `spec` + optional `data`; no theme, brand or bytes. Its render leg is its own: `renderHash = sha256(renderVegaLiteToSvg(compiled))` at intrinsic size (`artifact.certify.ts:900-912`); `determinism.renderHash` is optional output. Coverage: 5 cartesian `certified` with boolean `conformant`; 8 ECharts-primary `uncertified`/`conformant:null`. Accuracy rules V150–V153 (cartesian, closed set by design) and V154–V159 (ECharts hierarchy/flow/geo); none for force_graph, bubble_map, flow_map. Contrast is render-measured for the 5 cartesian on the light canvas only. |
| `VizAreaPreview` | A placeholder div in all three renderers: React `components-react/src/breadth.tsx:159-180`, Vue `components-vue/src/breadth.ts:158-179`, HTML `render/component-map.ts:1494-1511` ("Area preview (640 x 360)"). Declared only by `traits/viz/mark-area.trait.ts:158-170` as a `detail` view extension (top, priority 55). No compose template or `design.compose.ts` mentions it; no shipped object under `objects/` or `domains/*/objects/` declares a `viz/*` trait. It cannot reach a screen today. |
| Generated app | `scripts/design-loop` and the React/Vue emitters contain no vega, vega-embed or echarts; the generated app is static markup plus the store. A server-rendered SVG embeds without any client runtime. |
| Tokens JS bundle | `@oods/tokens` exports a flat `cssVariables` map (used by viz-core and vendored by dashboard-demos at `852be47`) and the scoped CSS; no per-scope JS export. |
| Tests | viz-core: `pnpm --filter @oods/viz-core test` (the ONLY gate for `packages/viz-core/src/**/*.spec.ts`, `ci.yml:768-776`). viz-render: `pnpm --filter @oods/viz-render test` (build is load-bearing). mcp-server colocated viz goldens: the 14-file list guarded by `src/tools/ci-golden-list.guard.test.ts` (`ci.yml:782`). Root `vitest.config.ts:20` aliases `@oods/viz-core` to src and has no `@oods/viz-render` alias. Capture policy `#1833` in force. |
| Consumers | cmos-dashboard (asked: themed server-side SVG; declined Forge charts for the three measured reasons). dashboard-demos (vendors `@oods/viz-core` + `@oods/tokens` dist at `852be47`; asked why panels admit 11 of 13 — `#881`). forge-demos and aquex-mcp (live MCP). |

## 3. Anti-circularity

Every pixel on the public surface comes from one shared renderer module reached through the public handlers;
`artifact.certify`'s render leg and `viz.render`'s SVG leg call the same functions, so the render↔certify hash
identity is structural and a mutation bite proves it (change one chrome token: both hashes move together). The
registry is not written by hand: the census executes the public handlers for every admitted type, theme and
brand and the contract test pins the registry to what the census measured. Goldens that move are replaced with a
stated reason in the same mission, never regenerated silently; the un-themed golden is retired by name. Coverage
claims do not widen: the 8 ECharts-primary types gain public pixels and stay `uncertified`. The chart in the
generated app is placed by the composer from a trait declaration and rendered at generation time through the
public `viz.render` leg; the design loop observes it in a real browser with zero consumer-authored wiring.

## 4. Settled decisions (planning decides; the builder does not re-plan)

1. **Served checkout = the primary checkout, fast-forwarded** to `origin/OODS-pro` at m01 start (the PR #91
   merge if merged, else `513dcbba`; both carry the Sprint 189 runtime bytes `ab7a4631` — record which) with the
   Sprint 189 m01 packet shape (observe, ff-only, frozen install, ordered builds including `@oods/tokens`,
   manifest verification, `pm2 restart`, `pm2 save`, rollback recipe). The Sprint 189 reconnect draft is **sent**
   in m01 and next-step `#1415` is completed.
2. **Delivery proves the compiled revision by discriminating behavior**: `/health.revision` equals the stamped
   commit; the tool count is 21 with `design_preview` listed and its stopped-loop call returns the typed
   `OODS-N019`; `design_compose` Subscription/list carries the rows collection with bound query/filter/page
   operands; `code_generate` Subscription/workflow emits App roots in both targets with no `workflow-records`,
   `workflow-toolbar` or `workflow-history`; Subscription/form labels are short names. Health alone is never proof.
3. **Public pixels through one path.** `viz.render` gains `output.svg` (default false), optional `output.width`
   and `output.height`, and returns `svg`, `svgHash` (sha256 hex of the returned bytes), `svgBytes`, `svgRef`
   (mirrors `specRef`) and a `render` echo `{engine:'vega-lite'|'echarts', width, height, theme, brand}`. The 5
   cartesian types render through `renderVegaLiteToSvg`; the 8 ECharts-primary through `renderEChartsToSvg` with
   `normalizeEChartsSvg` applied before hashing, so `svgHash` is a normalized-structure hash for those 8 and a raw
   byte hash for the 5 (documented). At default dimensions the cartesian `svgHash` equals `artifact.certify`'s
   `determinism.renderHash` for the same normalized spec — certify renders `compiled` at intrinsic size, so
   `viz.render`'s default is intrinsic size too; caller `width`/`height` change the hash and the docs say so. A
   renderer failure is a typed `OODS-V1xx` error, never a silent spec-only success. `compact` is unchanged; `svg`
   is included only when requested. `dashboard.render` `output.html` draws the 6 ECharts-primary panels through
   the same ECharts leg at the panel's span dimensions; `placeholderCell` survives only for `error` panels.
4. **Theme and brand are parameters, resolved from the token scopes.** `@oods/tokens` exports
   `cssVariablesByScope[brand][theme]` (brand `A|B`, theme `light|dark|hc`, `base` folded in as the fallback
   layer) generated from the same Style Dictionary build that emits the six CSS scopes; the flat `cssVariables`
   export stays byte-identical (dist hash compared) so vendored consumers and goldens are unaffected.
   `resolveTokenToColor`, `resolveTokenValue`, `buildOodsVegaConfig` and the ECharts chrome bake take a scope; the
   default scope `{brand:'A', theme:'light'}` is byte-identical to today's output (goldens prove it). The
   `@oods/viz-render` `tokens` option is **applied** to Vega-Lite config (canvas, text, axis, grid, font); the
   `withTokens === withoutTokens` pin at `emitter.spec.ts:103-111` is replaced by a test that tokens change the
   chrome bytes, and the un-themed golden is replaced by a light-scope golden with the reason recorded.
   `viz.render`, `dashboard.render` and `artifact.certify` accept `theme` (default `light`) and `brand` (default
   `A`); dashboard HTML sets `data-theme`/`data-brand` on the document so component chrome and chart pixels agree.
   Series palettes follow the theme where the tokens declare a themed categorical palette; where they do not, the
   registry says "light palette on {theme} canvas" and m05's contrast measurement decides whether that is
   conformant. Nothing invents a dark palette.
5. **The chart in the app.** `VizAreaPreview` keeps its ID (nucleus catalog, `COMPONENT_STYLE_IDS`) and gains
   `svg`, `title` and `description` props: with `svg` it renders the server-rendered markup inline inside
   `<figure role="img" aria-label>` (the renderer's own ARIA preserved) in the HTML renderer, React and Vue;
   without `svg` the placeholder stays. Subscription declares the existing `viz/MarkArea` trait; the view-extension
   collector places `VizAreaPreview` on Subscription/detail (top, priority 55) bound to a chart declaration
   `{chartType:'area', x: payment date, y: amount in major units}` over the object's payment events.
   `code.generate` resolves the declaration through the public `viz.render` SVG leg at generation time (theme
   from `preferences.theme`, default light) and embeds the SVG as a static per-file-hashed asset; the workflow
   app embeds one SVG per seeded record and selects by id; single-screen detail artifacts expose `svg` as a typed
   prop and embed the seed-rendered SVG as the default. No client chart runtime is added. Census movement is
   enumerated by class (h) chart placement and touches only objects that declare a viz trait.
6. **Certification takes the same scope and measures contrast per theme.** `artifact.certify` gains `theme` and
   `brand`; its render leg renders at that scope; contrast is measured on light and dark (and hc when m03 ships
   it) for the 5 cartesian types; the "dark-theme contrast is not verified" disclaimers are retired or made
   precise. Coverage stays 5 `certified` / 8 `uncertified`; the accuracy rule sets V150–V153 and V154–V159 are
   unchanged and the closed-set statement stands.
7. **One registry, one census.** `packages/viz-core/src/registry/viz-recipes.v1.json`: one row per admitted type
   with cells `{specEngine, publicSvg, dashboardDrawn, themes:{light,dark,hc}, brands, a11yDescription,
   accuracyRules[], certifyCoverage, chartInApp, notes}`. `scripts/product-reality/s190-viz-census.ts` measures
   every cell by calling the public handlers and writes the census; a contract test asserts the registry equals
   the census output; `docs/api/viz-render.md`, `dashboard-render.md`, `artifact-certify.md` and the roadmap tables
   are written from the registry in m06. The dashboard-demos "11 of 13" question is answered by a registry note
   citing `#881`.
8. **Capture policy `#1833` applies unchanged.** One four-suite capture at m06; a lone timeout gets one isolated
   rerun; an assertion failure gets a fix and at most one corrective capture. Goldens moved by m02–m04 (dashboard
   HTML, viz-render SVG, ECharts hash matrix) are updated in the mission that moves them with per-file
   attribution, before the capture — learning `#543`.
9. **Evidence bar and pace.** Per mission: the focused suites the change touches, the 13-type render matrix where
   pixels moved, class-enumerated census diff where composition moved, design-loop receipts where the app moved,
   computed parity with an empty allowlist. No per-mission captures, no critic workflow, no new closeout
   apparatus; reuse the Sprint 185–189 closeout producer, auditor, suite accounting and movers with bounded s190
   modes.
10. **Delivery cadence:** each sprint's first mission delivers the previous sprint's reviewed, merged head. This
    sprint's code reaches the bridge in Sprint 191 m01; the m06 reconnect (cmos-dashboard, dashboard-demos with
    the frozen SHA, forge-demos, aquex-mcp) is prepared, not sent.

## 5. Missions (serial; each mission's gate is executable)

| Mission | Outcome | Gate |
|---|---|---|
| `s190-m01` Ship | Served bridge on the merged Sprint 189 head; store byte-identical; Sprint 189 reconnect sent; `#1415` closed | Five discriminating calls pass on the served process; 17 store hashes unchanged; two message IDs recorded |
| `s190-m02` Public pixels | `viz.render output.svg` for all 13 types; dashboard HTML 11/11 drawn; `svgHash` = certify `renderHash` at defaults | 13-type matrix returns SVG, byte-stable across two calls; hash identity proven for the 5; renderer-throw bite yields a typed error; goldens updated with attribution |
| `s190-m03` Theme and brand | `cssVariablesByScope`; scope-aware resolvers and chrome; tokens applied in the renderer; `theme`/`brand` on `viz.render` and `dashboard.render` | 13 × 3 × 2 = 78 SVGs byte-stable; canvas fill per scope verified mechanically for every type; default scope byte-identical to today; flat `cssVariables` hash unchanged |
| `s190-m04` The chart in the app | `VizAreaPreview` renders SVG in HTML/React/Vue; Subscription/detail places an area chart; generation embeds it | Design-loop receipts at 390/820/1440 in both frameworks contain the figure and `graphics-object` roles and show the chart; parity empty; flow harness green; census 66/66 with class (h) movement only |
| `s190-m05` Certify and registry | `theme`/`brand` on certify; contrast per theme; render↔certify identity across scopes; registry + census + contract test | Identity proven for 5 × 3 themes; contrast rows per theme retained; registry equals census; disclaimers retired or precise |
| `s190-m06` Proof and handoff | Viz census 13/13 × themes; component census 66/66 + workflow 2/2; one capture under `#1833`; advertised diff from `c3a68d5f`; reconnect prepared; near.md Increment 9; PR | Claim ledger binds every criterion; `builderSelfCertified:false`; CI observed with run ids |

Pixels (m02) come before theme (m03) so the theme proof is a diff of real bytes; both come before the chart in
the app (m04) so the app embeds the public path, not a private one.

## 6. Exit gate

From the program authority: *"13/13 current recipes render visible public output"* and exit criterion 7, *"Every
current chart type produces public pixels across its declared surfaces."* Sprint 190 exits when every one of the
13 admitted types returns server-rendered SVG from `viz.render` in light and dark (hc unless descoped) for both
brands, byte-stable, with the cartesian hashes identical to certify's; dashboard HTML draws 11/11; the registry
equals the census; the chart is on the Subscription detail screen in HTML, React and Vue with design-loop
receipts; the component census movement is fully attributed; and one capture under `#1833` is green. **Whether
the surface is "closed" is decided by the independent review with the registry, the 78-SVG matrix and the
receipts in hand.** The sprint does not claim visualization breadth beyond 13, PNG output, client-side
interaction, chord or flow_map panels in dashboards, or certification of the 8 ECharts-primary types.

## 7. Descope ladder (declared now, in order)

1. Drop the `hc` theme (keep light and dark); carry hc by name with the token scope already exported.
2. Drop brand `B` for viz pixels (keep `A`); the parameter stays, `B` returns a typed gap.
3. Limit m04 to HTML plus one framework only if the second framework's embed is blocked by a real tooling gap;
   record the gap and carry parity — never silently.
4. Drop the roadmap-table derivation from the registry (keep the registry, census and contract test).

**Never cut:** m01 in full; SVG for all 13 types on `viz.render`; 11/11 drawn in dashboard HTML; `theme` light
and dark on `viz.render` and `dashboard.render`; the render↔certify hash identity; the census and its contract
test; class-enumerated census diffs; zero consumer-authored wiring; one capture under `#1833`.

## 8. Out of scope, carried by name

Visualization breadth beyond the current 13 and the Core Analytics Profile. PNG or raster output. Client-side
chart runtimes (vega-embed, echarts) in generated apps; interaction, tooltips and cross-filter inside SVG.
`viz.compose` (deprecated, unchanged). Chord and flow_map as dashboard panels (`#881`). Geo map breadth (`#1166`).
Certifying the 8 ECharts-primary types or adding accuracy rules. Runtime beyond the locked paths and Subscription
(Organization/User workflow `OODS-N016`). Accessibility/theme/interaction maturity of the component families.
Alias retirement (`#1382`/`#1385`). Maintenance `#1315` and `#1318`–`#1322`. The `#1845` residual craft items,
except where a mission's receipt happens to touch them. Parts Town and Shopify.

## 9. Build and review

Build fresh in `/Users/systemsystems/.codex/worktrees/s190/OODS-Forge`, branch `codex/sprint-190-viz-public-render`
from `c3a68d5f`, from this memo and the CMOS missions only. The builder records evidence and stops; the separate
review session decides close and inspects the registry, the SVG matrix and the receipts. Delivery in m01 touches
the shared PM2 process from the primary checkout; everything else stays in the worktree.
