# s190-m05 — certification and the executable visualization registry

Implemented under #1850–#1856. Certification accepts `theme:light|dark` and `brand:A|B`, defaulting to CSS light/A. Its own render uses the same scope and shared renderer as `viz.render`. HC token exports remain available; HC pixels remain deferred (#1851).

## Measured public contracts

- [Census](viz-census.json) equals the exported `@oods/viz-core` `VIZ_RECIPES` registry after canonicalization: **13 public SVG types**, **11 dashboard types**, **5 certified / 8 uncertified**. Chord and flow_map are rejected by the dashboard panel schema under #881. Every ECharts-primary result retains `conformant:null`.
- [Observations](viz-observations.json) retain **52 public-render/certify hash identities**, **52 repeated SVG identities**, **13 omitted-vs-light/A identities**, and one contrast row for each measured theme/brand call. All **66** object/context compositions are inspected: only **Subscription/detail** declares an area chart. Schema guards measure HC rejection and dashboard exclusions before invoking accepted public handler inputs.
- Each `contrastResults` row names theme, brand, verdict, measurement boolean, evidence kind and rationale. The four scope calls retain four independent rows in the observations; one API call returns only its requested scope. Heatmap and the three geo families are exempt and never counted as canvas-ratio measurements. Spec-only ECharts reconstruction remains explicitly unmeasured. Unchecked/ungradeable results likewise make no successful measurement claim.
- Four cartesian accuracy rules (V150–V153) and six ECharts rules (V154–V159) remain unchanged. Additive `accuracyRules` reports the offered codes so the census can measure them through the public handler; `accuracySummary.rulesEvaluated` still counts resolved operands. No private modules are imported by the census; its exact import list is pinned by the contract test.
- [Registry mutation receipt](registry-bite.json): physically changed `bar.publicSvg` to false, contract exited **1**, restored original bytes, contract exited **0**. [Red log](registry-bite-red.log), [restored log](registry-bite-restored.log).

## Contrast findings and limitations

The sampled line, scatter and five categorical ECharts charts pass on light and fail on dark for both brands. Bar and area pass at all four scopes. The existing viz-scale palettes have no separate dark overrides: these are light palettes on dark canvases, with truthful failure results. The full spec-only categorical palette still fails light/A because slot04 is below 3:1 (#1852). The 3:1 threshold and palettes are unchanged.

ECharts Role C reads the canvas color from the retained projected option, including a supported canvas override; it grades the same background that is rendered. Spec-only calls have no retained option and grade scope defaults only. Touching-mark adjacency and geo categorical grading remain outside the standing coverage. Application placement remains the static sample-payment chart proven in m04; form edits do not regenerate its SVG.

## Verification and preserved evidence

- MCP visualization/certification group: **774/774**, **35 files**, no skips ([log](mcp-viz-final.log)). Includes the m02 shared-render mutation/one-sided divergence bite, scoped default-byte identity and invalid-scope checks, dark contrast failures, canvas override grading, the live registry/census test, all colocated viz/dashboard suites, and historical spec-only/operand-backed controls.
- Viz core: **1,397/1,397**, **68 files**, coverage floors pass ([log](core-tests.log)). Viz renderer: **69/69**, **6 files**, coverage floors pass ([log](render-tests.log)). No skips in either group.
- Core and MCP builds, root typecheck, generated schema freshness and API-doc freshness pass ([core build](core-build-final.log), [MCP build](mcp-build-final.log), [typecheck](root-typecheck-final.log), [schemas](schema-check.log), [docs](docs-check.log)). API coverage tables and parameter/coverage sentences derive from the registry.
- [Preservation receipt](preservation.json): all **15** m03 attributed golden files retain their exact m03 hashes; the flat export and generated CSS remain byte-identical. No pixel golden was regenerated in m05. Historical certify fixtures remain untouched; their tests bound declared scoped caveats/metadata, reuse m03 SVG receipts, and retain public cross-tool hash identity. Existing Role-A collision tests explicitly use the old canvas to isolate that business rule from the newly exposed Role-C failure.
- [Disclaimer grep](disclaimer-grep.json) reports zero superseded dark-unverified/light-only claims in `packages/mcp-server/src/tools`.

Earlier failures are retained: stale light/base-canvas and brand-absence assertions; old scoped caveat expectations; the initial census mistook stylesheet placeholder text for a panel, then omitted a required dashboard dataset; an invalid `dashboard` compose context was caught by typecheck and replaced with `inline`; a canvas exactly matching a category was correctly ungradeable because the chrome filter could not establish the complete assignment, and the override proof uses a distinct near-color instead. The final registry test independently pins 11 dashboard types, so the incorrect five-panel census could not pass. These were focused mission checks, not the m06 four-suite capture.

Sprint 190 remains Active and builderSelfCertified is false. The primary bridge remains the reviewed Sprint 189 runtime delivered in m01.

## Cartesian render identity by scope

| Type | Theme | Brand | Public SVG = certify render SHA-256 | Contrast |
| --- | --- | --- | --- | --- |
| bar | light | A | `ea214e684eb170265227dd09ea52f2851203b358e9117fa9568ad8aaebad9390` | pass |
| bar | dark | A | `a9e9f6dea07e78187fb3276e1c6a9d2a0e0cd4a84b134d33a9789ff64ed4b220` | pass |
| bar | light | B | `31cb7d98f8d3a1c91371a7f2a40adba0cf8c9130c9182865f1db353f16a0c1ee` | pass |
| bar | dark | B | `b6617735cda295635b795884cc6b6948faa7bf963a309789005e067b70bbfb14` | pass |
| line | light | A | `7d1f247d68556ad71f76b6a122bd41f7fa65484538f5dcd03c945c920970665d` | pass |
| line | dark | A | `b10a15b25548a5f021ec3b416615faaf84bd1a097d185204d3161f0e9c361307` | fail |
| line | light | B | `d4f39594a28adcfa035465db40b88afc223564842351d8bdbf3d920f922c5255` | pass |
| line | dark | B | `8e6c6bb44fbe09cfd5be15583496f60ae3779c7d4545d2bbaf5e044d1a8a0edf` | fail |
| area | light | A | `59b129d03ec8539b2ef844d810805ad3c3832ac6e943655d827ead67570ac58d` | pass |
| area | dark | A | `56779cb36f6a41cfff87eb09b405b7fa10d405969ba2c03052ec3b287dccb92a` | pass |
| area | light | B | `286e746d1b73952da8e8c4770b1e4176ba794e763b73efe185fe1ae98f00d85f` | pass |
| area | dark | B | `9a7814c1047cc880268853f4f11d7c72e1d4e8f2c53d79ac8ba5a6cd7374b681` | pass |
| scatter | light | A | `b178d992a718b885532e82e0e4738daf2b785776c777739b785511069a42964a` | pass |
| scatter | dark | A | `e8c9eade6957b1373c0af4ce29c18799ada900f31e8f07d0f697abc596667259` | fail |
| scatter | light | B | `f548a5516e53d8e0ab90a8087675bf691b375899b57a09a80787953ccc6d4b2f` | pass |
| scatter | dark | B | `c86adddc13f907edb1bc878ed6dcae1901c1efed0e8a9932a3cda7c3ecd579b5` | fail |
| heatmap | light | A | `20985758108c780293ec0760f5becd6eb2fd84ec186ce504937a6e4bc12d9784` | exempt |
| heatmap | dark | A | `8df74182e23889b1fc1bd688eee31ad043ff5089fa9cca8242094a5535eaf1cf` | exempt |
| heatmap | light | B | `55e4cfdc31ab5c640055150138771f8f22fa7fa770ec0a446e238dea90007065` | exempt |
| heatmap | dark | B | `f774da413884f7119e4d4984b08f244c8f19d1caa512ae09761d6af4d0bd9797` | exempt |
