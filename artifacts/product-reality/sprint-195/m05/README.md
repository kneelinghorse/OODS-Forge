# s195-m05 — Palette separation and high-contrast rendering

The deterministic hue search moved light categorical slot 05 from 23.89° to
23.81° and dark slot 04 from 80.37° to 80.41°. Both brands now measure minimum
CIEDE2000 separation 10.0175619523 in light and 10.2363931628 in dark across
normal vision and the three CVD simulations. All 24 mark-to-canvas contrast and
chroma checks pass. Only four canonical categorical entries changed; the two
base files gain one declaration each (44 to 45 leaves). Resolved token identity
counts and all noncategorical values stay unchanged. The real token build,
search grid, exact source/map hashes and old-palette caution control are retained
in palette/. Decisions #1941 and #1942 document the narrow build precedence
exception needed because both brand base files load into every scope.

The public viz.render, dashboard.render and artifact.certify theme boundaries
now admit hc. Their immediate caller code.generate admits hc for application
shells and generated chart assets as required for the actual React/Vue proof.
HC paint resolution preserves the scope declarations, including Canvas and
CanvasText, verbatim. A common SVG check rejects actual renderer substitutions.
The census records 78 scopes: 60 rendered and 18 typed HC failures. Bar, line,
area and scatter have HC SVGs; heatmap and the eight ECharts families retain
measured OODS-V165 paint failures. Specs remain available without requesting SVG.
No server-side system-colour hex replacement was introduced.

HC certification returns contrast exempt, measured false and reason forced-colors.
Accuracy, accessibility and determinism still run; an HC render failure fails
stability and conformance. The 60 rendered census scopes contain 56 conformant
results and four existing bubble-map false results. Built public-boundary proof
in hc/ also certifies all 26 HC scopes, including the failed render cases, and
checks dashboard and generated-asset parity against source handlers. Its build
revision is the pre-commit 9c75a1db revision, with the pending m05 source changes;
it is not claimed as execution at a later commit hash.

The existing component theme harness now supports chart specimens. All ten
forced-colors browser cells pass: both brands for standalone bar and line,
dashboard HTML, and public generated Subscription/detail in React and Vue.
Browser report.json retains computed paints, visible marks and labels, resolved
system foreground/canvas, zero browser errors, screenshots and image hashes.
The Vue A screenshot was visually inspected. The harness uses the existing
consumer model and generated source without editing the generated UI or SVG.
These are chart visibility checks, not whole-application accessibility approval.
Initial harness failures (missing workspace CSS alias and then a shared Vite
optimizer cache) remain in separate logs/report; isolated per-consumer caches
passed. Learning #584 records the cache and raw-input validation lessons.

Golden migration retains before/after hashes and reasons for all changed
snapshot entries and superseded historical matrix rows. Historical raw receipts
and SVGs remain byte-identical. Relative to m04, only the four force-graph SVG
scopes change; the other 48 chart SVGs and all 32 public pattern SVGs remain
unchanged. The 84-cell pattern census retains eight public and thirteen
authoring-only identities with unchanged authored source hashes. The taxonomy
still reports 13 complete Core Analytics Profile cells and seven typed gaps.
The migration accounts for 14 entries in three snapshot files and 910 matrix rows, 231 superseded across retained epochs. One certified force-graph hash moves. See golden-migration/golden-attribution.json for exact file, entry and row counts; tracked after-state bytes are qualified at implementation commit 52b0da99 (learning #585), while historical raw evidence remains hash-checked.

Schema and registry changes come from generators. Descriptions, API pages,
Tool-Specs and the how-forge-works narrative disclose the measured HC split;
docs/prose-migration.json records their exact changes. Test counts and the final
implementation/ledger attribution are in integration-results.json and the
subdirectory READMEs. All successful checks report zero skipped tests. Scoped
snapshot commands that initially inherited whole-package coverage thresholds
are retained and rerun with targeted coverage disabled; global thresholds are
unchanged. The one full-suite campaign remains reserved for m07.

Primary PM2 remains on delivered Sprint 194. No reconnect notices were sent.
Builder certification remains false; independent review is still required.
