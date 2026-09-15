# Changelog

All notable changes to OODS Foundry MCP are documented here. This project uses sprint-based development. Each entry summarizes the sprint's key deliverables.

## Sprint 200 — Available to individuals (in progress)

- **BREAKING: the `/ported`, `/readiness-ported` and `/css-ported` subpaths are gone.** `@oods/components-react`, `@oods/components-vue` and `@oods/component-styles` no longer export the Sprint 186 compatibility aliases; the former eight families ship only through the package roots, `./readiness` and `./css`, which resolved to the same bytes since Sprint 186 m06. Resolving a retired subpath now fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`; change the import to the root subpath. No migration window: no external consumer exists (#2062).
- **The runtime bundle carries its terms and its brand source.** `forge-runtime.tar.gz` now ships `LICENSE`, `COMMERCIAL.md` and a generated `THIRD-PARTY-NOTICES.md` (`scripts/runtime/third-party-notices.mjs --check`, one entry per package of the production closure with its declared license and shipped license text) at the archive root, recorded in the manifest and asserted by the E2E. `packages/tokens/src/tokens/brands` ships too, so `brand.apply` previews from the extracted archive instead of returning `OODS-N020`; from the bundle `apply=true` emits the review kit without writing source or rebuilding and the receipt records both steps as skipped. `docs/runtime/portable-runtime.md` is the public contract for the bundle and `docs/runtime/install.md` (generated with the three client configs by `scripts/runtime/client-configs.mjs --check`) is the install path for Claude Desktop, Claude Code and Cursor.
- **License: PolyForm Noncommercial 1.0.0 replaces MIT.** The root LICENSE and the five package LICENSE files carry the SPDX text verbatim with the Required Notice naming the holder, rendered from `configs/license/holder.json` by `scripts/license/render-license.mjs --check`; all 23 manifests declare `PolyForm-Noncommercial-1.0.0`, the root repository URL names `kneelinghorse/OODS-Forge`, and the packed `dist/pkg` manifest inherits the id and ships the terms files. Noncommercial use by individuals, nonprofits and governments needs nothing more; any commercial purpose, including use inside a company, needs the commercial license described in `COMMERCIAL.md` (one-page agreement in `docs/legal/`, edges in `docs/LICENSE-FAQ.md`). Contributions come under the inbound grant in `CONTRIBUTING.md`; both PR templates carry the required checkbox. The public OODS-Foundry snapshot stays MIT for those who fetched it; nothing here is MIT from this commit on.

## Sprint 181 — Preview-only brand intake and portable runtime Gate 1 (a signalled advertised contract change)

- **`brand.intake` is the twentieth auto-registered tool.** It validates inline DTCG documents or content-addressed references and returns an explicit preview-only receipt with accepted count and membership. The s181 contract is read-only: `apply` is fixed to `false`, `persisted`, `applied`, and `brand_created` are all false, no files are written, consumer-local paths are rejected, and references without a Forge content store return the typed `unresolved-content-reference` outcome.
- **`dashboard.render` rejects duplicate panel IDs before rendering.** The call now fails with `OODS-C003` instead of allowing last-writer-wins identity contamination. The advertised panel-ID descriptions say IDs must be unique, and the stale OODS-V001/V126 sentence has been removed; distinct-ID output hashes are unchanged.
- **Gate 1 gains a private, self-contained portable runtime bundle.** The stdio adapter and native server ship with their required runtime data, a freshness manifest, SBOM-lite, root LICENSE, boundary checks, extracted-runtime E2E coverage, and GNU-tar pack-twice determinism. This is a named-consumer handoff, not a public npm, MCP registry, GitHub release, `.mcpb`, OCI, or hosted Forge surface.
- **Consumers must RECONNECT and re-vendor after this ships.** The default tool count moves 19→20, all-tools mode moves 25→26, and adapter `serverInfo.version` now reflects its package version (0.2.0 instead of 0.1.0). Existing exact tool-list and server-version pins must move to the post-commit SHA.

## Sprint 180 — Dashboard identity reaches the wire (a signalled advertised contract change)

- **`dashboard.render` panels now expose the identity already computed by `viz.render`.** Every successful chart panel carries `contentHash`; callers may set the call-level `output.includeNormalizedSpec` flag to receive each panel's `normalizedSpec`. These fields are attached after the dashboard's `{panels, layout}` hash projection, so the dashboard `contentHash` remains stable while a panel hash stays equal to the matching standalone `viz.render` call. The emitted normalized spec round-trips through `artifact.certify` with content-hash parity (cartesian as `{spec}`, ECharts-primary with its required `data` operand).
- **HTML exports gain `outputHtmlHash`.** When `output.html` is requested, the response hashes the exact composed HTML bytes. Panel `contentHash` is brand-invariant; `outputHtmlHash` is brand-variant because brand styling is applied during SVG emission. ECharts-primary dashboard panels remain placeholders, and the existing compact `tokenCssRef` contract is unchanged.
- **Consumers must RECONNECT after this ships.** The advertised `dashboard.render` input/output schemas and description changed. Tool execution is fresh per call, but connector-cached contracts remain stale until reconnect; vendored consumers must also re-vendor from the post-commit pin.

## Sprint 179 — ECharts certification grades the rendered chart (a signalled advertised contract change)

- **Operand-backed ECharts contrast is now RENDER-MEASURED.** `artifact.certify` renders the retained projected ECharts option through a lazy, process-wide serialized SSR worker and grades the visible SVG carriers separately from their semantic category-to-paint assignment. Treemap, sunburst, sankey, force graph, and chord receive the combined worst Role-C/Role-A verdict; palette-recycling duplicates remain in the Role-A assignment. Choropleth, bubble map, and flow map retain their contrast exemption while still carrying render evidence. The current default sunburst descendant tint honestly fails Role C at 2.60:1; no color bytes were changed to hide that result. Calls without the ECharts `data` operand keep the prior reconstructed baked-palette verdict and caveat.
- **ECharts determinism gains the OPTIONAL `determinism.renderHash`.** The first normalized SVG supplies the hash and a second independently emitted option and render proves it; `stable` now requires both projected-option and rendered-SVG equality. A typed first-render fault omits `renderHash` and makes `stable:false`; a bubble map without inline geometry keeps only the option proof and names the no-server-map limitation. `contentHash` remains projected-option identity, and cross-process render-hash claims are bounded by `packages/viz-render/certified-matrix.json` and its reviewed hash epoch.
- **Joined choropleths now tell ECharts which feature property is the region key.** The direct MCP adapter emits `geo.nameProperty` only when a join exists, so region-keyed rows receive their intended ramp paints and data indexes. Seven of eight canonical projected-option hashes stay fixed; the joined choropleth hash and the three declared adapter/geo/dashboard snapshots move. The no-join path, the multi-layer spatial adapter, and the browser `src/viz` twin are unchanged.
- **Two advertised-surface truth fixes ride the same schema regeneration.** `brand.apply` now describes its actual RFC-6902 `add`/`remove`/`replace` subset instead of implying all operations, and `dashboard.render` honors an input `tokenCssRef` in compact output/export references instead of silently replacing it with `tokens.build`.
- **Consumers must RECONNECT after this ships.** The advertised `artifact.certify`, `brand.apply`, and `dashboard.render` descriptions changed. Tool execution is fresh per call, but connector-cached schemas and descriptions remain stale until reconnect; vendored consumers must also re-vendor from the post-commit pin.

## Sprint 176 — certify grades the render, not the intent (a signalled breaking contract change)

- **The contrast pillar is RENDER-MEASURED on the five cartesian types.** `artifact.certify` now renders the compiled spec through `@oods/viz-render` and grades the SERIES-TO-PAINT ASSIGNMENT the data marks actually carry — duplicates retained — so a recycled palette (more consumed series than baked hexes) fails as a ΔE00=0 role-A pair. **Charts that certified `conformant:true` yesterday can red today — correctly**: the driving defect was a 10-series chart with four colliding series pairs at the pixel level certifying conformant with zero findings. Unit classification still reads the compiled bytes ('exempt' for gradient scales is decided before any render; author-decorative colors stay chrome, skipped never failed). The old cardinality slice (which capped grading at 6 distinct slots) is deleted — agent-supplied color ranges longer than 6 are now fully graded. The 8 ECharts-primary types are unchanged: reconstruction-graded from baked constants, byte-frozen caveats, render-grading is an explicitly parked later rung.
- **Determinism gains a render half (cartesian): the OPTIONAL `determinism.renderHash`.** `stable` now also requires two independent renders of the compiled spec to hash identically; the first render is the contrast grade's own, the second is the proof. `renderHash` is present exactly when the rendered-grading path rendered; **no ECharts response ever carries it**. `contentHash` is untouched — the render never feeds it, render↔certify hash identity holds.
- **New warning OODS-V161 (viz.render, cartesian):** the DEFAULT baked categorical palette warns on recycling — 10 series over the six-hex baked range now emits a count+threshold warning instead of `warnings:[]`. Fires only when no explicit `colorRange` was supplied (an explicit range remains V143 territory). Read-only: `contentHash`/`specRef` unmoved.
- **Accuracy no-subject honesty:** a spec that declares no aggregation still passes the aggregation-hiding rule, but the pass now says so in `notes[]` ("…the aggregation-hiding pass has no subject"). Verdicts, pillars, `conformant` and `rulesEvaluated` are byte-unmoved.
- The `tokens-governance` CLI entry guard now realpath-resolves, so a symlinked (bin-shim) invocation runs instead of silently no-opping. CI: pushes to the working branches now trigger the workflow, and a new job step runs the FULL `@oods/mcp-server` suite (58 colocated files previously never ran in CI).
- **Aquex consumers must RECONNECT after this ships:** the advertised `artifact.certify` schema and tool description moved twice over — the contrast description is render-backed and path-scoped (5 cartesian render-measured / 8 ECharts reconstruction-graded), and the determinism object gained the optional `renderHash` (execution is fresh per call; only the advertised schema is connect-time cached).

## Sprint 175 — artifact.certify: 'ungradeable' (a scoped contract change, signalled)

- **`pillars.contrast` and `pillars.accuracy` gain the value `'ungradeable'`** — "grading was ATTEMPTED on a unit or rule set it was given and failed for a reason outside the spec" (an unresolvable canvas token, or an evaluator fault). `'unchecked'` now means ONLY "nothing was attempted or nothing was gradeable" (no colour-bearing unit, no `data` operand, or every offered rule's precondition absent). Two closed enums widen: contrast is `pass|fail|ungradeable|unchecked|exempt`, accuracy is `pass|fail|ungradeable|unchecked`. An exhaustive consumer switch must handle the new value.
- **The folded `conformant` gate tightens (cartesian path):** `conformant = a11yConformant && contrast ∉ {fail, ungradeable} && accuracy ∉ {fail, ungradeable} && stable`. A monotonic tightening — some inputs move true→false (an agent-poisoned canvas token, a faulted grader or rules engine), none move false→true. `'unchecked'` and `'exempt'` still leave conformant a11y-driven (the s139 lock). ECharts-primary `conformant` stays `null` on every path. Closes next-step #781 (graded-'unchecked' vs nothing-to-grade).
- The contrast-engine catches now write a `contrastNote` naming the fault (closes decision #1446 (4)); the accuracy catches keep their "…N rules were offered." note with the pillar word updated. `contentHash` is unmoved by any pillar.
- **`artifact.certify` gains the optional top-level `a11yNotApplicable[]` channel** (an advertised output-schema change): one `{rule, preconditionAbsent}` entry per warn-first a11y-equivalence rule whose declared precondition was absent — present (as `[]` if none) exactly when the engine ran to completion, i.e. the ECharts-primary path with the `data` operand; absent on `{spec}`-only calls, on the cartesian path, on error, and when the engine faulted. A not-applicable rule never enters `findings[]`.
- **`computeKpi` numeric aggregates now THROW on a no-numeric-cells field (new error code OODS-V160)** instead of silently reporting `value: 0` — the defect Dashboard-demos reported (FD#1). The six numeric aggregates (sum/average/median/min/max/latest) over a field that has values but no numeric ones throw `KpiComputeError{reason:'no_numeric_cells'}`; `count`/`distinct` never trip it; an absent field or empty row set keeps `value: 0`. `dashboard.render` catches it through the `onPanelError` seam (placeholder/omit). **Consumers vendoring `@oods/viz-core` and calling `computeKpi` bare must add a catch before re-vendoring.**
- `dashboard.render`'s input schema descriptions moved (`dashboard.render.input.json`): advertised-text corrections riding the same release — reconnect refreshes them.
- Aquex consumers must RECONNECT after this ships: the advertised `artifact.certify` output schema changed (execution is fresh per call; only the advertised schema is connect-time cached).

## Sprint 52 — Mapping, Onboarding & Versioned Data

- **map.create / map.list / map.resolve** — Three MCP tools for mapping external components to OODS traits. JSON Schema (Draft 2020-12) with 4 coercion strategies. Seed file with Material UI mappings.
- **Versioned structuredData.fetch** — `version` (YYYY-MM-DD) and `listVersions` parameters. Exact + nearest-available resolution with warnings. Backward compatible.
- 47 new tests (mapping contracts, versioning contracts, bridge E2E). 572 total tests.

## Sprint 51 — Composition Tool v1 (design.compose)

- **design.compose** — Template-based composition tool. 4 layout templates (dashboard, form, detail, list). Deterministic component selection engine with 13 intent mappings and 7 scoring dimensions.
- Intent parsing, layout auto-detection, slot filling, auto-validation pipeline.
- 44 integration contract tests. 525+ tests across the MCP server.

## Sprint 50 — Code Export (code.generate)

- **code.generate** — Validated UiSchema to framework-specific code. React/TSX and Vue SFC emitters. Leverages catalog metadata (propSchema, slots) and Code Connect infrastructure.
- HTML emitter for standalone output. Styling options: inline styles or design-token CSS variables.

## Sprint 49 — A11y in the Validation Loop

- **Token-to-color resolution** — `tokenColorResolver` resolves DTCG alias chains (sys -> theme -> ref -> hex).
- **repl.validate** — `checkA11y` flag runs 18 WCAG contrast rules alongside structural validation. Failures surfaced as `A11Y_CONTRAST` warnings with ratio, level, and fix hints.
- **a11y.scan** — Upgraded from placeholder to full implementation. Structured contrast report with per-rule results and aggregate summary.
- 20 contract tests, 3 E2E bridge tests.

## Sprint 48 — Pipeline Hardening & Test Coverage

- **XSS audit** — 2 vulnerabilities fixed in `tree-renderer.ts`. Shared `escapeHtml()` utility. 51 XSS test vectors.
- **Fragment mode edge cases** — 48 tests for deeply nested trees, empty/null children, mixed valid/invalid nodes.
- **Composition error enrichment** — `traitPath` and `impactedTraits` fields added to validation issues.
- 62 new contract tests expanding boundary and renderer coverage.

## Sprint 47 — Registry Gap Fixes & Workbench Unblock

- **Per-node error isolation** — `UNKNOWN_COMPONENT` errors no longer block entire render in non-strict fragment mode.
- **Grid component** — 84th registry component with CSS Grid layout support.
- Workbench S44 fixture (11 components) verified end-to-end through the MCP bridge.

## Sprint 46 — Fragment Render API

- **Fragment output mode** for `repl.render` — per-component HTML fragments instead of monolithic documents.
- Per-component CSS extraction with `cssRefs`. Output format discriminator (backward-compatible).
- Error isolation and strict mode. 8 technical missions delivered.

## Sprint 45 — Full Component Renderer Coverage

- HTML renderers for all 73 registry components + 10 basic components added to registry.
- End-to-end verification with Synthesis Workbench and Stage1 payloads.

## Sprint 44 — HTML Render & Bridge Unblock

- **repl.render** — Real HTML rendering with `html` field in output. Self-contained documents with inlined token CSS.
- Bridge `apply` mode and `structuredData.fetch` unblocked. Component mapper, tree walker, layout resolver.

## Sprint 43 — Refresh Pipeline & Adopter Experience

- Structured data refresh pipeline with npm entry points.
- Automated code snippet generation from upstream Storybook stories.
- CI templates for adopters.

## v0.1.0 — 2025-10-21

### Features
- Scaffolded internal packaging pipeline with provenance metadata, Storybook compatibility, and sample app smoke tests (mission B16.5).
