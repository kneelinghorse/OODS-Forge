# s190-m03 — scoped public chart pixels

Implemented under amendments #1850, #1851 and #1852. The default is the generated CSS light/A scope. Omitting both parameters produces exactly the same SVG bytes as explicit light/A. The legacy flat export and generated CSS remain byte-identical for vendored consumers.

## Scope and retained proofs

- `@oods/tokens` exports all six `cssVariablesByScope[brand][theme]` maps in ESM/CJS and their types, resolving the actual root/base/scoped CSS cascade and semantic brand bridge.
- Pure scope arguments reach color/value resolution, Vega chrome and categorical/diverging ranges, ECharts chrome/palettes, and geo colors/ranges. No mutable global scope.
- The shared Vega emitter applies resolved canonical chrome tokens to canvas, text, axes, grid and typography, on a clone. Series encoding/color is preserved. Dashboard charts already carry scoped compiled chrome; document aliases are inlined separately.
- Public `viz.render` and `dashboard.render` accept A/B and light/dark. SVG echo and HTML `data-theme`/`data-brand` describe the requested scope. Input enums reject invalid scopes.
- The [matrix](matrix.json) retains **52/52** public SVGs, two-run byte identities, **52 canvas checks**, and **13 omitted-vs-explicit identities**. Four dashboard exports each draw **11/11** SVG panels with scoped canvases, matching document attributes and repeatable exact HTML hashes.
- [All flat-vs-light/A differences](flat-vs-light-A.json): **129 changed values**, zero added/removed keys. [Before](token-before.json) and [after](token-after.json) prove identical flat-export SHA-256 `0cc0e991e94d1fed98fe04a1ec4e18b1d9efdfa8835bd7eaa43782eb5b66f968` and CSS SHA-256 `2afb1e72954af57c22bd8b279dc8d82306238c8a1ed4717191e7d51953ac2485`.

## Golden migration, before matrix capture

[Per-file attribution](golden-attribution.json) lists **12 changed files and 3 unchanged files**, with before/after hashes and the specific tokens responsible. Six snapshot files (27 entries), three literal chrome pins, two ECharts hash pins and the certified hash matrix moved. Each snapshot file was regenerated once in m03 before `capture.ts` ran; no golden was changed to satisfy the matrix. The required document scope attributes are the only HTML structure delta. The renderer's formerly unthemed fixture now explicitly receives light/A tokens; its default Vega series color remains unchanged.

The immutable historical certify byte fixture is retained. Its control admits only the scope-induced cartesian hashes and the measured ECharts categorical Role-C verdict/prefix; all other response bytes stay pinned.

## Explicit gaps and findings

**HC pixels deferred, token scopes retained (#1851).** Both HC scopes resolve to `Canvas`/`CanvasText`, which require the user's system palette. The memo's first descope rung applies: light/dark × A/B ships (52 cells); no concrete HC palette is invented.

**Light/A categorical contrast failure (#1852).** The unchanged categorical slot 04 falls below 3:1 against the corrected `#FDF3DE` canvas. The existing certification rule reports a failure. Palette and thresholds stay unchanged; m05 measures conformance across the supported scopes. Single-series slot 01 still passes. Chrome text at light/A measures primary 14.17:1 and neutral 7.60:1.

For every admitted type (bar, line, area, scatter, heatmap, treemap, sunburst, sankey, chord, force_graph, choropleth, bubble_map, flow_map), tokens declare no separate dark categorical/sequential/diverging viz-scale palette: **light palette on dark canvas**. User-supplied ranges keep precedence. This is a palette disclosure, not a conformance claim.

## Verification

- Token scope/CSS bridge tests: **41/41**, four files ([log](token-tests-corrected.log)).
- Viz core: **1,397/1,397**, 68 files; coverage thresholds pass ([log](viz-core-verified.log)).
- Viz renderer: **69/69**, six files; 91.18% lines/statements, 84.43% branches, 91.11% functions, all thresholds pass ([log](viz-render-final.log)).
- MCP focused group: **407 tests**, 19 files, including all 15 colocated CI files and the affected certify controls ([final log](mcp-final.log)).
- Root typecheck, MCP build, generated schema freshness and API-doc freshness pass ([typecheck](root-typecheck-final.log), [build](mcp-build.log), [schemas](schema-check-final.log), [docs](docs-check-final.log)).
- [Matrix producer](capture.ts) first verifies every attributed golden hash, then writes public-handler SVGs/HTML and repeated identities ([run](matrix-run.log)).

Earlier failures are retained: missing token entry build, the withdrawn base-map default premise, expected pre-migration golden failures, Vega font-weight type constraint, duplicate AJV schema registration in a test, stale default-contrast assertions, and incorrect check-script names. The two single-file golden-update commands passed their tests and wrote their snapshots but exited nonzero on whole-package coverage floors; subsequent full package runs above pass those floors. These are focused mission checks, **not** the m06 four-suite capture. No tests were skipped in the passing groups.

Sprint 190 remains Active; builderSelfCertified is false. M04–m06 continue unchanged. Served runtime remains the reviewed Sprint 189 head delivered in m01.

## Public SVG hashes

| Type | Brand | Theme | SHA-256 |
| --- | --- | --- | --- |
| bar | A | light | `ea214e684eb170265227dd09ea52f2851203b358e9117fa9568ad8aaebad9390` |
| bar | A | dark | `a9e9f6dea07e78187fb3276e1c6a9d2a0e0cd4a84b134d33a9789ff64ed4b220` |
| bar | B | light | `31cb7d98f8d3a1c91371a7f2a40adba0cf8c9130c9182865f1db353f16a0c1ee` |
| bar | B | dark | `b6617735cda295635b795884cc6b6948faa7bf963a309789005e067b70bbfb14` |
| line | A | light | `7d1f247d68556ad71f76b6a122bd41f7fa65484538f5dcd03c945c920970665d` |
| line | A | dark | `b10a15b25548a5f021ec3b416615faaf84bd1a097d185204d3161f0e9c361307` |
| line | B | light | `d4f39594a28adcfa035465db40b88afc223564842351d8bdbf3d920f922c5255` |
| line | B | dark | `8e6c6bb44fbe09cfd5be15583496f60ae3779c7d4545d2bbaf5e044d1a8a0edf` |
| area | A | light | `59b129d03ec8539b2ef844d810805ad3c3832ac6e943655d827ead67570ac58d` |
| area | A | dark | `56779cb36f6a41cfff87eb09b405b7fa10d405969ba2c03052ec3b287dccb92a` |
| area | B | light | `286e746d1b73952da8e8c4770b1e4176ba794e763b73efe185fe1ae98f00d85f` |
| area | B | dark | `9a7814c1047cc880268853f4f11d7c72e1d4e8f2c53d79ac8ba5a6cd7374b681` |
| scatter | A | light | `b178d992a718b885532e82e0e4738daf2b785776c777739b785511069a42964a` |
| scatter | A | dark | `e8c9eade6957b1373c0af4ce29c18799ada900f31e8f07d0f697abc596667259` |
| scatter | B | light | `f548a5516e53d8e0ab90a8087675bf691b375899b57a09a80787953ccc6d4b2f` |
| scatter | B | dark | `c86adddc13f907edb1bc878ed6dcae1901c1efed0e8a9932a3cda7c3ecd579b5` |
| heatmap | A | light | `20985758108c780293ec0760f5becd6eb2fd84ec186ce504937a6e4bc12d9784` |
| heatmap | A | dark | `8df74182e23889b1fc1bd688eee31ad043ff5089fa9cca8242094a5535eaf1cf` |
| heatmap | B | light | `55e4cfdc31ab5c640055150138771f8f22fa7fa770ec0a446e238dea90007065` |
| heatmap | B | dark | `f774da413884f7119e4d4984b08f244c8f19d1caa512ae09761d6af4d0bd9797` |
| treemap | A | light | `bfa0ee12dc03bfc2b373db650cfbaeba8febf36f5e45974cbcc8f579ffc39694` |
| treemap | A | dark | `f25e9bde3b8c6625b6d7aa26ca47ab84c6744a39a406eb6f9463b158cc49a4c2` |
| treemap | B | light | `1c4485882624efe7622013be79904df3b62ff36cf0aa5739cc16605404d007ea` |
| treemap | B | dark | `b2566a5088fae43b383e849d88f80aad699b760a9a4228a249ad5b6f9ec93a75` |
| sunburst | A | light | `1e11ede54a3a7ec940bf33c52afd0ed706cd90d630be56b51a445a6d5c163198` |
| sunburst | A | dark | `e48b7f212d1c284382fe7deb1f3b5f891e59652c9b2658d829e0dc0bf4aa14ab` |
| sunburst | B | light | `6c56443a85fda087036534edaec89c550bf80abd3d6814e2624998d96e7ee5ab` |
| sunburst | B | dark | `2ab180c7b62a36a905ec740ba64f5e98fb3b93dacfefe94d4ce8d7e4300b4add` |
| sankey | A | light | `69af693c36db665aea16fe9bed8700c782f1f5723921f8cca2bbdd1a0da7f77e` |
| sankey | A | dark | `d3461dbbde8e8358d20a4dcfa959ad4752747c468a39668cd6b3905155084d11` |
| sankey | B | light | `be3f66ee69f0762c6259fce67043a3c00c3310d7ba60f4d50f8df41c754900ca` |
| sankey | B | dark | `430d041f0296dd833163b761b26d36d15fb02f216ca741fbf6caefb3633230ee` |
| chord | A | light | `86db1949d8c7f39033d1da48a126609dd1c86cee7db8d749392726e514884594` |
| chord | A | dark | `f02ab62a7b51fc7132ec3ebc2133c1b52334a2d38336e4c3860cbedac0d58dd3` |
| chord | B | light | `9b4da70c24ca9560f6904838741b2d633281922238d887fd2da086d16ba2d44e` |
| chord | B | dark | `fdf7ca6bbb9b99f99b526c67ff91718fee6c96a61c680257d090e1a2da55f74e` |
| force_graph | A | light | `b0fcf364daaf84abf4c3ab2839a75ec80ea2e85a8ff0ecdab592369cbe210590` |
| force_graph | A | dark | `4c6c9c0fd2bbc73fb7625e80c100991099b13e357c12232ab711f370e5a2601c` |
| force_graph | B | light | `90be7f5e9363b8cecfb7fc5311852277383224961b0542d29beb9a448c2c07e9` |
| force_graph | B | dark | `35e83a72cce68bf7536df53500060de3c846e4cee64bd36a3722d2be2154850b` |
| choropleth | A | light | `f10cbd6bcacaf64d7562b90ad6ad0619edd9a09a7fcf3674401d8b76feebc55f` |
| choropleth | A | dark | `42a612f641076222cc2f6d0d8ae566e0caa956561640d6684dfc0490274931e8` |
| choropleth | B | light | `18a1ac143683c214e6713bc5f290469146b8b504cc59f2cc22e2402a3660d9b5` |
| choropleth | B | dark | `d2bcc732d15dadaa08e2ab8eb3dd3ad3314bd882c954389ecbc9b5f73f1f0be4` |
| bubble_map | A | light | `17678763c8329b675b33b4e70bcd514bdff09a93427b02db4c70d748b1af14bc` |
| bubble_map | A | dark | `692ffd199aa2480152327ed616050f87721ff66737aa49ac4fcb046b50cbe2b9` |
| bubble_map | B | light | `bf9a83e122e1ce43090e64ba2f49946ec089c8f62aca245fd66f539b357b552d` |
| bubble_map | B | dark | `a854399dbd6a830311a7e2782bc1f51ac1ff3a5a0560b36424ae6834f214bc06` |
| flow_map | A | light | `bab223b6a50ee581338bead62b54bd292be08a594b02ccca2c3b2ab1793b5e68` |
| flow_map | A | dark | `9aa399caba73b318a44f506fc869304971abd943a2fb09192003189df6f54cc0` |
| flow_map | B | light | `ccac56d3d128e26c20a533c7fca6d30635fcef46342d3316c32d04a006ce9c0e` |
| flow_map | B | dark | `8ff52ac2905cbce3ab5ee73c755ac9078bfb9c3518c759180b484204a818ed3c` |
