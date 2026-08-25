# s178 m05 findings — ECharts render-grading feasibility

**Build session, 2026-08-25. Status: CONDITIONAL GO for a shipping sprint.** The measured fixtures
for all eight ECharts-primary families rendered through ECharts 6.0.0 to canvas-free SVG with no
browser or native canvas. The seven measured non-force fixtures were byte-stable after an
ECharts-specific generated-token normalization. Default `force_graph` was not: a deterministic
force snapshot requires a scoped seeded random source plus synchronous convergence. The spike also
found four release-blocking truths that a shipping sprint must close rather than conceal:

1. zrender's no-canvas text widths are platform-font-independent, but a wall-clock branch controls
   an ASCII width-map cache used by truncation and wrapping. Cross-host equality was measured, not
   source-proven for pathological load.
2. supported circular force initialization is deterministic for the representative fixture but
   can still create coincident nodes and re-enter `Math.random` for valid inputs;
3. the representative joined choropleth option omits `nameProperty`; ECharts therefore paints the
   default map color instead of the joined value ramp. Render-grading that option today would
   faithfully expose the defect, not certify the intended choropleth; and
4. ECharts retains registered maps in module-global storage with no unregister operation, so
   caller-derived map names would create unbounded registry growth even if renders are serialized.

No product, advertised-surface, D11, test, package, source, or configuration bytes moved in this
mission. Probes ran from standard input or `/tmp`; only this findings record and the separate DRAFT
s179 charter are repository deliverables.

## Scope and evidence discipline

The probe used the live package-entry adapters from `packages/viz-core/dist/index.js`, ECharts and
zrender 6.0.0, and a fresh chart per render:

```ts
echarts.init(null, null, {
  renderer: "svg",
  ssr: true,
  width: 600,
  height: 400,
});
chart.setOption(option);
chart.renderToSVGString({ useViewBox: true });
```

Every chart was disposed. Geo probes called `echarts.registerMap` from the option's
`__registration` carrier before `setOption`. The local host was Darwin 25.3/arm64, Node 24.6.0,
V8 13.6.233.10-node.24. The already-local Docker image `the-academy-web:railway`, image
`sha256:62ddd2e22a559a15cdf7cc50c269e5358302748802453d64fe90b9a26db81506`, supplied Alpine
Linux 3.23.4/arm64, Node 22.22.2, V8 12.4.254.21-node.39. The repository was mounted read-only;
the run used no pull or install. Linux/x86 and a real CI worker remain s179 evidence, not a claim
of this spike.

Evidence labels in this record mean:

- **MEASURED** — observed from the installed 6.0.0 packages on the named hosts.
- **SOURCE-PROVEN** — follows from cited installed or repository source.
- **DEFERRED GATE** — must become a red/green carrier in s179 before shipping.

## 1. Determinism across all eight families

Two fresh charts in one process produced unequal raw SVG for every family because zrender owns
process-global painter and CSS-class counters. A first-appearance remap of every generated token
matching `zr\d+-(?:cls-\d+|ani-\d+|[sgpc]\d+)` made seven families equal. Default force geometry
remained genuinely unequal and was not normalized away.

| Family                         | Raw fresh-chart equality | Normalized SHA-256 on Darwin and Linux                             | Finding                   |
| ------------------------------ | -----------------------: | ------------------------------------------------------------------ | ------------------------- |
| `treemap`                      |                       no | `bca27bace18d94ff8af9dfe2ffe8c514c6a7708d06bc4e2d5612c1ba08982267` | stable                    |
| `sunburst`                     |                       no | `fb72835f8be455b96925d0bf04c5c9170b1c3ce21f54064c421f3399fc06013a` | stable                    |
| `sankey`                       |                       no | `daddd998f8e855b0329546eb9a24885ae6051e24685a1a341c51e0ff35542e24` | stable                    |
| `chord`                        |                       no | `41fcfb44bb3ca6a163fdedae1116f6b1da2e96638aacc76f5238d0b2bdf72097` | stable                    |
| `force_graph`, adapter default |                       no | Darwin and Linux differed                                          | substantive random layout |
| `choropleth`                   |                       no | `1a83a87044f7385343d5b380f04b06cf6e17137abec8bb7a165fcc3f18b7250d` | stable after registration |
| `bubble_map`                   |                       no | `f8cabfebb06fb775bf6102ac9b42a9ee2a043a05f70c874aa888337478439786` | stable after registration |
| `flow_map`                     |                       no | `a6430ccebbea3b3ff35ce4d96e6c73a07784bc99473ddcd32c7bbc9d1a6354fc` | stable after registration |

The seven non-force hashes matched byte-for-byte across both OS/Node/V8 combinations. A second
text-bearing treemap fixture (`Quarterly revenue — 東京`, 640×360, animation disabled) corroborated
the result: first and second raw sequential hashes differed, while all four Darwin/Linux ×
first/second normalized outputs were 3,195 bytes with SHA-256
`a72848098f4e59c8dea8fac191c0320b81304fdee924b65abca9671962772ec8`.

This is a feasibility sweep, not the final soak: two repetitions per host, arm64 on both hosts, and
no real CI worker.

### The complete moving-token contract

**SOURCE-PROVEN.** The generated namespace is broader than the planning example's
`zr{N}-cls-{M}`:

- painter prefix `zrN`: zrender `lib/svg/Painter.js:7-16`;
- global CSS class `zrN-cls-M`: `lib/svg/cssClassId.js:1-4`, consumed by emphasis and animation;
- animation `zrN-ani-M`: `lib/svg/cssAnimation.js:56-59`;
- shadow filter `zrN-sM`: `lib/svg/graphic.js:265-299`;
- gradient `zrN-gM`: `lib/svg/graphic.js:343-353`;
- image/SVG pattern `zrN-pM`: `lib/svg/graphic.js:455-466`;
- clip path `zrN-cM`: `lib/svg/graphic.js:468-479`.

They appear in `class` and `id` attributes, `url(#...)` references (`fill`, `stroke`, `filter`,
`clip-path`), CSS selectors, `@keyframes`, and `animation` declarations. Rich synthetic options
exercised shadow/gradient/animation and image pattern; both became stable under the same remap.
ECharts' public `renderToSVGString` exposes only `useViewBox`, while zrender enables CSS animation
and emphasis in `Painter.renderToString` (`Painter.js:90-98`; ECharts
`lib/core/echarts.js:525-535`), so normalization cannot be avoided through the public call.

**Decision for s179:** create an ECharts-specific token discoverer plus a small shared
first-appearance remap primitive. Do not widen Vega's private `normalizeAutoIds` into a global
regular-expression replacement. Discovery must be limited to the structural contexts above, then
replace exact discovered tokens and all their structural references. A blind global replacement
could rewrite author text that merely resembles a zrender token. The carrier must prove sequential
same-process equality after normalization, fresh-process/cross-host equality, idempotence,
definition/reference integrity, rich-option coverage, and that `ecmeta_*` plus substantive geometry
remain byte-exact.

## 2. Text metrics: font-independent, with one timing caveat

**SOURCE-PROVEN.** In pure Node, zrender does not consult installed platform fonts:

- `node_modules/.pnpm/zrender@6.0.0/node_modules/zrender/src/core/platform.ts:16-50`
  contains a baked common-ASCII width-ratio table.
- `platform.ts:52-93` attempts a DOM canvas only when `document` exists. Without it, mono text is
  `fontSize × text.length`; other text sums the baked ratios. Each unknown UTF-16 code unit
  contributes one full `fontSize`, so an astral emoji normally contributes twice. Family, weight,
  and style do not reach a platform font.
- `src/contain/text.ts:26-47,97-105,180-188` caches the arithmetic measurements and derives line
  height from the arithmetic width of `国`.

That explains the measured Darwin/Linux equality, including ASCII, an em dash, and CJK. It is also
an approximation—especially for CJK, emoji, and combining sequences—not typographic fidelity.

**The caveat:** `src/contain/text.ts:57-95` measures ASCII-map construction with `new Date()`.
One build over 16 ms, or repeated builds over 2 ms, can disable later per-character maps and fall
back to the measured width of `a`; truncation and wrapping consume that path in
`src/graphic/helper/parseText.ts`. No probe triggered it, but source analysis means absolute
whole-pipeline determinism is not yet proved under pathological load or many fonts. Merely replacing
`platformApi.measureText` does not remove the wall-clock branch.

**DEFERRED GATE:** s179 must remove or neutralize the elapsed-time decision (or force and assert
width-map construction independent of elapsed time), or source-prove that every governed option
avoids the dependent truncate/wrap path and hold that claim with stress tests. Serialization or
isolation alone does not control `new Date()` and is not closure. In a fresh renderer worker before
ECharts/zrender import, an ambient-DOM poison carrier must prove
`document.createElement('canvas')`/native measurement is never invoked; an uncached-font
truncate/wrap carrier must force the >16 ms/repeated >2 ms path. If neither proof exists,
cross-machine `renderHash` must not ship. A normal-load Linux hash is corroboration, not a
substitute.

## 3. Force strategy and convergence semantics

The adapter emits `layout:'force'` and `force.layoutAnimation:true`
(`packages/viz-core/src/adapters/echarts/graph-adapter.ts:129-159`). ECharts initializes every node
without a valid point using two `Math.random` calls and uses two more for coincident-node repulsion
(`echarts/lib/chart/graph/forceHelper.js:76-84,154-163`). The four-node fixture consumed exactly
eight calls.

`ssr:true` is not convergence. The force stage makes one step, GraphView makes another, then
schedules 16 ms iterations while `layoutAnimation:true`
(`forceLayout.js:151-154`; `GraphView.js:209-220`). The representative default-friction fixture
reached `<0.01` after exactly 510 steps. With one seed, normalized snapshots at t=0, 40 ms, and
160 ms had three different hashes. An immediate SSR string is the second-step frame, not the
settled graph; 510 is not a general convergence count.

| Candidate                                                                                     | Measurement                                                                                                                                                                                                 | Disposition                                                        |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Patch server-realm global `Math.random` with LCG                                              | first-frame and converged hashes stable cross-host; patch is process-global                                                                                                                                 | reject in the shared MCP realm                                     |
| Precompute x/y and use `layout:'none'`                                                        | zero RNG, stable                                                                                                                                                                                            | reject: replaces force semantics with a Forge-owned static layout  |
| Precompute unique x/y, keep force                                                             | zero RNG unless points coincide; converged stable                                                                                                                                                           | not general: callers need not supply safe positions                |
| Public random/seed hook                                                                       | none exists in ECharts 6.0.0                                                                                                                                                                                | unavailable                                                        |
| Supported `force.initLayout:'circular'` + `layoutAnimation:false`                             | representative fixture consumed zero RNG and converged to cross-host hash `eddf305d69924a658cf39ade4130cd23a2d81b686b7f9556c81b02e32f7c46a6`; a valid `[0,0,1]` value fixture consumed two calls and varied | reject as a universal seed policy                                  |
| Seeded LCG inside a dedicated serialized render worker + `layoutAnimation:false` on the clone | preserves ECharts force semantics and scopes the global patch to the worker realm; the seeded converged fixture was cross-host stable                                                                       | **recommended s179 strategy, subject to worker/adversarial gates** |

Circular initialization is only an optimization, not a determinism proof. ECharts advances its
circular angle using node values; zero-valued or otherwise degenerate inputs can coincide, and
`forceHelper` then calls `Math.random` during repulsion. A three-node `[0,0,1]` fixture consumed two
random calls and three fresh renders differed. Symmetric, duplicate-position, isolated-node, and
degenerate-value graphs must therefore be adversarial release carriers.

The recommended strategy is a lazily created, then long-lived ECharts render worker that serializes
render jobs, derives an explicitly versioned LCG seed from the canonical projected option, patches
only that worker realm's `Math.random` inside a synchronous `try/finally`, applies
`layoutAnimation:false` on the render clone, renders the converged graph, and restores the hook.
This keeps the real ECharts force algorithm while preventing concurrent MCP requests from seeing
the patch. It is a design conclusion from the spike, not implementation evidence: s179 must prove
worker ESM/CJS loading, restoration on every fault, four-way request isolation, adversarial zero
cross-talk, and two independent render equality before it can ship. The served option and its
`contentHash` remain unchanged.

The render contract must say “deterministic converged force snapshot,” not merely “SSR.” Advisory
local medians for the measured circular-init fixture versus the current first frame were 34.2/11.1 ms at
25 nodes, 197.8/27.1 ms at 100 nodes, and 959.6/68.3 ms at 250 nodes. s179 needs an explicit input
size and latency budget.

## 4. Series-to-paint extraction

### Stable structural seam

**SOURCE-PROVEN.** ECharts attaches series index, data index, data type, and
`ssrType='chart'` to datum elements and their children
(`echarts/lib/util/innerStore.js:46-63`). Its SSR getter serializes only series index, data index,
and SSR type (`echarts/lib/core/echarts.js:236-248`); zrender prefixes them with `ecmeta_`
(`zrender/src/svg/core.ts:11`, `src/svg/graphic.ts:80-88`). Consequently:

- select geometry with `ecmeta_ssr_type="chart"`; never infer data marks from tag names or zrender
  CSS classes;
- exclude `ecmeta_ssr_type="legend"` and untagged text/chrome;
- do not treat `ecmeta_data_index` as a unique datum key. Sankey, graph, and chord nodes and edges
  reuse indexes because the stored `dataType` is not serialized.

Every tagged geometry element in the eight-family corpus was `<path>`; no tagged text appeared.
This corroborates the earlier s166 decision that tag-specific scraping is not a valid seam.

### Measured family contract

| Family      |                   Semantic categorical `n` | Measured chart geometry                                   | Role-A source                                        |
| ----------- | -----------------------------------------: | --------------------------------------------------------- | ---------------------------------------------------- |
| treemap     |    first visible level = 3 (8 total nodes) | 14 paths; structural + paint paths may share an index     | first-visible item colors                            |
| sunburst    |    first visible level = 3 (8 total nodes) | 8 paths; descendants include ECharts-derived tints        | first-visible item colors                            |
| sankey      |                                    4 nodes | 3 gradient link paths + 4 solid node paths                | node colors only                                     |
| chord       |                                    3 nodes | 3 ribbon paths + 3 arc paths                              | arc/node colors only                                 |
| force graph | 3 distinct non-empty groups across 4 nodes | 3 stroked edges + 4 filled nodes; 6 legend paths excluded | sorted categories                                    |
| choropleth  |                              Role-B/exempt | one filled path per joined region when the join is fixed  | no categorical assignment                            |
| bubble map  |     Role-B/exempt under the current ruling | one filled path per point; ordinal paints are visible     | no categorical assignment unless separately unparked |
| flow map    |                              Role-B/exempt | one stroke-only path per row                              | no categorical assignment                            |

The existing semantic counts already live in `packages/mcp-server/src/tools/viz.render.ts:175-207`:
treemap/sunburst count the first visible hierarchy level, sankey/chord count nodes, and force counts
sorted distinct non-empty categories. A wide `n=8` probe for each of the five categorical families
rendered the exact semantic assignment `[slot1..slot6,slot1,slot2]`, six distinct paints with two
real recycled pairs. SVG path count or total hierarchy-node count would therefore be false `n`.

### Role C and Role A must be separate

One list cannot truthfully feed the current `gradeCategorical` fold:

- **Role C** must see every visible solid categorical-carrier geometry paint after family-aware
  chrome removal, including generated hierarchy tints.
- **Role A** must see semantic categories in their governed assignment order, retaining duplicates
  only when the palette actually recycles. Repeated descendants, edges, or ribbons in the same
  category are not new categories and must not manufacture a ΔE00=0 failure.

Measured proof: sunburst generated child tint `#809DE5` is only 2.601813:1 against the
`#FCFCFD` canvas, while its base slot `#416CD9` is 4.685005:1. Palette-only Role A input would miss
the real Role-C failure; a raw per-path multiset would invent Role-A collisions within one group.

**Decision for s179:** return two inputs from the ECharts extractor:

1. `roleCPaints`: normalized visible solid fills/strokes, including hierarchy-derived colors, with
   option-known chrome/borders removed;
2. `roleAAssignment`: the n-long semantic assignment derived from the projected option/operand,
   filtered to paints the chart actually realized and preserving real modulo recycling.

Reuse the existing WCAG and CIEDE2000/CVD math, but split its inputs. Do not reuse Vega's
role-class scanner or its `renderedAssignment` unchanged. Ignore `none`, `transparent`, literal
keywords such as `source`/`target`, and unresolved `url(...)`; canonicalize CSS rgb/hex/case.
A categorical carrier that renders only an unresolved pattern must be `ungradeable`, never silently
passed. Current adapters emit no patterns/decal.

Sankey link gradients are auxiliary source→target links, not new Role-A categories, and remain
excluded from Role C in v1: their measured `fill-opacity="0.5"` means grading bare stops would ignore
alpha compositing and the interpolation continuum. Grading those links requires a separately
approved sampling/compositing contract. Geo gradients remain under the existing Role-B
essential-exception ruling. The measured sunburst Role-C failure must become an expected honest
verdict; a color remediation is a separate declared visual mover, not something to fold into the
grader.

## 5. Geo registration and the choropleth blocker

`registerGeoJson` is intentionally pure and returns `{name,geoJson}` without loading ECharts
(`packages/viz-core/src/adapters/spatial/echarts-geo-registration.ts:1-22,60-72`). The MCP JSON
projection deliberately retains that carrier
(`packages/mcp-server/src/tools/certify-echarts-emit.ts:88-99`). The renderer contract is:

1. clone the projected option;
2. read and delete `__registration` from the render clone;
3. synchronously `echarts.registerMap(name, geoJson)` immediately before `setOption`;
4. render and dispose in `finally`.

**SOURCE-PROVEN global-state constraint:** `echarts/lib/coord/geo/geoSourceManager.js:47,79-100`
retains registered maps in module-global storage and exposes no unregister operation; chart
disposal does not clear it. Serialization prevents races but not unbounded retention. The v1
renderer must therefore use one fixed internal map alias on its serialized render clone, rewrite
the clone's `geo.map`/series map references to that alias, and replace the registered geometry for
each job—or prove another bounded-registry design. A 1,000-render soak over 1,000 unique caller map
ids and FeatureCollections must show a bounded registry and memory plateau. The registration bite
must cover both a fresh worker missing its first registration and a warmed worker that skips
per-job replacement before rendering a conflicting FeatureCollection; the latter must detect stale
geometry/paint/hash rather than silently reusing the retained alias.

Without registration, each fresh-process choropleth, bubble, and flow probe logged “Map ... not
exists” and threw while reading `regions`. With registration they emitted 3, 3, and 2 chart paths.
The registration name matched `option.geo.map`; choropleth also matched `series[0].map`.

Input truth differs by family (`echarts-geo-option.ts:81-186` and
`viz.render.input.json:448-495`): choropleth and flow require inline geometry; bubble permits rows +
longitude/latitude without geometry because a client may own a pre-registered external base map.
The server must not fetch one. A bubble operand without `__registration` therefore keeps its
option-only proof but gets no renderHash; any attempted render grade is honestly `ungradeable`
unless a separately scoped map resolver is supplied.

### Blocking joined-choropleth defect

The representative operand's features use `{region,state_name}` and its join names
`featureProperty:'region'` (`test/tools/s172-echarts-operands.ts:10-25,86-92`). The adapter uses that
property to build series data names but emits no `geo.nameProperty`
(`echarts-choropleth-adapter.ts:121-160`). Measured SSR then rendered only default `#5070dd` paths
with `ecmeta_data_index="-1"`, not the value ramp. An isolated four-way check proved that
`geo.nameProperty:'region'` alone produced indexed regions and the true interpolated fills;
`series.nameProperty` alone did not, because the series uses `geoIndex:0`.

This must be fixed in the emitted option before choropleth render grading. Renderer-only injection
would grade different bytes than consumers receive and violate the governing “grade what actually
renders” rule. The option/contentHash/goldens are declared movers in s179.

The current geo ruling still exempts ordinal bubble even though the operand is readable
(`certify-contrast.ts:668-690`). The technical extractor works, but changing that ruling requires a
separate governance decision. Its first default ordinal paint measured only 2.240896:1 against the
canvas, so un-parking it would produce a real Role-C failure, not a prose-only change.

## 6. Package placement and measured cost

The existing package boundary answers placement:

- `@oods/viz-render` explicitly owns headless rendering (`packages/viz-render/package.json:4`);
- `@oods/mcp-server` already depends on it (`packages/mcp-server/package.json:32-38`);
- `@oods/viz-core` keeps ECharts dev-only and its runtime dependencies unchanged
  (`packages/viz-core/package.json:29-40`).

**Decision for s179:** add `echarts` as a direct runtime dependency of `@oods/viz-render`; keep
zrender transitive; keep mcp-server's package edge unchanged; keep viz-core a zero-runtime option
transformer. Lazily create the render worker on the first renderable ECharts call; inside that
worker, lazy-import and modularly register the eight charts plus required components/renderers. The
server imports enabled tools at startup, so a static import or eagerly spawned worker would charge
every process even when no ECharts render occurs.

Measured advisory cost on this Mac:

- installed unpacked footprint: ECharts 59,488 KiB + zrender 5,076 KiB = 63.05 MiB;
- their `lib/**/*.js`: 4.36 MiB;
- incremental monorepo install in this checkout: zero additional download because the root already
  resolves 6.0.0; a filtered or published viz-render deployment still gains the 63.05 MiB unpacked
  ECharts + zrender runtime;
- after existing viz-render was already resident, incremental ECharts first-use load through the
  public modular entrypoints: median 551.4 ms, +51.7 MiB RSS, +10.8 MiB heap (five fresh processes);
- full ECharts import: median 621.5 ms, +73.5 MiB RSS;
- treemap after load: 41.1 ms median first render, 3.0 ms warm median, 4.7 ms warm p95;
- 101 renders retained about +22.5 MiB RSS/+3.54 MiB heap;
- one 1,001-render run ended +172.9 MiB RSS/+9.56 MiB heap after forced GC.

The last result does not prove a leak—allocator retention can dominate RSS—but it is not a plateau
proof. s179 must carry a 1,000-render post-warmup heap/RSS trend gate and always dispose in
`finally`. Because viz-render's tsup config externalizes node modules with
`skipNodeModulesBundle:true`, public ECharts aggregator modules are still evaluated; modular
registration narrows installers but does not prove a small tree-shaken artifact. Cold load and
force convergence need separate budgets, and the built ESM/CJS package—including worker startup
and transfer—must be remeasured.

## 7. Integration seam and response contract

`certify-echarts-emit.ts:53-145` already does the correct option work: replay the live adapter,
project through the exact MCP JSON boundary, strip only `__joinDiagnostics`, preserve
`__registration`, canonicalize twice, and hash. s179 should retain the first and second **projected
objects** in addition to their canonical strings, render the first for grading/hash, and
independently emit + render the second for the proof.

The projected object—not the pre-wire raw object—is load-bearing. It is what `viz.render` serves
and what `contentHash` identifies. Rendering raw adapter closures would grade bytes the consumer did
not receive. The older emitter comment that names a bubble `symbolSize` function is stale relative
to the s172 adapter, which now evaluates symbol size per datum
(`echarts-bubble-adapter.ts:197-237`); dropped tooltip functions do not paint. If a future
paint-affecting function is lost at projection, the served option must be repaired instead of
silently grading raw bytes.

The shipping contract proposed in the draft charter is:

- `contentHash` remains the canonical projected-option identity and keeps cross-tool parity;
- `renderHash` is SHA-256 of normalized SVG, present exactly when an ECharts render occurred;
- `stable` folds projected-option equality and, when rendered, independent normalized-SVG equality;
- five categorical families become render-measured with split Role C/Role A inputs;
- three geo families retain the ratified exemption, while inline-geometry fixtures still prove
  renderer determinism and actual marks;
- `coverage:'uncertified'` and `conformant:null` remain until a separate a11y-enforcement decision;
- spec-only ECharts calls remain byte-frozen; no operand means no render;
- a render/parse fault is never a pass and never erases a valid option identity.

Cross-process `renderHash` equality is guaranteed only within the release's recorded certified
runtime matrix: resolved ECharts/zrender versions, supported Node/V8 and OS/architecture
combinations, renderer/normalizer contract version, token version, dimensions, and snapshot policy.
The schema/tool prose and response notes must expose that boundary. Expanding or changing any axis
requires requalification; a dependency, token, renderer-contract, dimension, or policy change is a
deliberate hash epoch with fixture review.

This is an advertised-response/prose movement when it ships. D11 and all generated/API surfaces
were read-only here; s179 must deliberately replace the frozen caveat and send the reconnect notice
in the same shipping sprint.

## 8. Remaining s179 gates

The implementation sprint is authorized only after its locked plan carries all of these:

1. real CI Linux confirmation (plus x86 if that is the deployment architecture), not this local
   container alone;
2. a closed text timing contract, including ambient-canvas poison and a forced slow-timer/truncation
   carrier;
3. the choropleth `nameProperty` repair before its render grade;
4. ECharts-specific structural normalization with rich shadow/gradient/pattern/clip bites;
5. a worker-scoped seeded RNG + synchronous force convergence, adversarial graph carriers, and
   size/latency caps;
6. family-specific extraction and separate Role-C/Role-A inputs;
7. explicit geo registration, a bounded fixed-alias map registry, and honest no-map behavior;
8. lazy worker/package loading, four-way concurrency isolation, worker-side heap/map evidence, and
   a 1,000-render memory plateau;
9. option/contentHash parity plus double-render `renderHash` controls;
10. D11 replacement, schema/tool-description/docs regeneration, clause controls, and reconnect.

The companion `forge-s179-echarts-render-grading-draft-charter.md` turns those findings into a
mission DAG. It is deliberately DRAFT: true CI, the text timing closure, and the memory plateau are
shipping evidence, not facts this feasibility spike can pre-certify.

## 9. Mission-boundary verification

The final audit re-ran the pre-change sentinels after both planning files were formatted:

- `git diff --binary -- . ':(exclude)cmos/planning'` retained SHA-256
  `ebe5cc72e17ce53f4951a342843101a88410c7bf1771389af52f466b0841113c`;
- the narrower `git diff --binary -- packages src` retained SHA-256
  `cafaeed311b168448087fb43fbc6c24b8ee0378192d04a32ad2ee456354a99e1`;
- frozen D11 source retained SHA-256
  `18654787d1fbcf736da3c7f06b0ff2afd0a4aa010132119985dbec1591adb412` and its pin spec retained
  `d38e7c45a581b0e313dd2704cef9a9e9eb447a1065ed2fe3c840808768adf286`;
- `pnpm --filter @oods/mcp-server exec vitest run
test/tools/certify-contrast.echarts-caveat-pin.spec.ts` passed 1 file / 2 tests with zero skips;
- Prettier check and `git diff --check` passed.

Those equal pre/post hashes prove that m05 moved no non-planning tracked diff, no package/source
diff, and no D11 bytes. Its only repository additions are this feasibility record and the companion
DRAFT charter; all executable probes stayed on standard input or under `/tmp`.
