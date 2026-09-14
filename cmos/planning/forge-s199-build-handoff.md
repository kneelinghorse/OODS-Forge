# Sprint 199 build handoff — Charts, finished (Phase A2)

Memo: `cmos/planning/forge-s199-charts-decision-memo.md` (LOCKED 2026-09-14). CMOS: `sprint-199`, missions `s199-m01` … `s199-m07`, serial. Worktree `~/.codex/worktrees/s199/OODS-Forge`, branch `codex/sprint-199-charts`, already created and built at planning. Base `b7a96ab0f` on `OODS-pro` (the live bridge serves it). Roadmap: `cmos/foundational-docs/roadmap/near.md` §3, §4, §10, §11.

## Fresh-session prompt

```
You are building Sprint 199 for Forge: charts, finished (Phase A2 of the 2026-09 roadmap), with the three Sprint 198 carries fixed first.
Open CMOS with cmos_review(), then cmos_sprint(action="show", sprintId="sprint-199") and cmos_mission(action="show") for each mission before starting it.
Read, in order: cmos/planning/forge-s199-charts-decision-memo.md (measured base §2, settled decisions §3, missions §4, movers §5, descope §6, never-cut), cmos/planning/forge-s199-build-handoff.md, cmos/foundational-docs/roadmap/near.md §3, §4 (Sprint 199) and §11, artifacts/product-reality/sprint-197/m05/README.md (golden-migration procedure).
First act: cd ~/.codex/worktrees/s199/OODS-Forge; confirm git log -1 is the planning commit on codex/sprint-199-charts and git status is clean; df -h /System/Volumes/Data. The worktree was installed and built at planning (pnpm install --frozen-lockfile, build:tokens, build:packages); rebuild only if dist is stale.
Work only in that worktree. Never build, test-write or edit in the primary checkout /Users/systemsystems/portfolio/Design-Tools/OODS-Forge: it serves the live bridge. Do not touch PM2 or any other repository.
GitHub CI is OFF and stays off. Never wait for, enable or rely on a workflow. Every gate is a local command; m01 adds pnpm viz:gate, the per-change chart gate. .github/workflows/ci.yml is still read by two guard tests, so keep it consistent when you add goldens or generators.
Missions are serial: start each with cmos_mission(action="update", status="In Progress") and a [Started] note; complete with a [Completed] note stating heads, counts and receipts; record decisions with decisions[] on session completion (never also as captures). If a criterion contradicts the mission order, say so in the note and continue with the scoped gate.
Rules in force: fix at the producer, never in generated output; generated registries and docs only through their generators (--check after); every pin moves at most once and is appended to artifacts/product-reality/sprint-199/golden-ledger.json with file, pin, before, after, mission and reason; never write into sealed artifacts/product-reality/sprint-195..198 receipts (pass explicit sprint-199 output paths); rebuild @oods/viz-core before any mcp-server proof; narrow viz-core runs use --coverage.enabled=false; boundary specs for every schema change; declared HC paints only, never a loosened guard without naming it; the 8 existing public pattern hashes do not move; one five-suite capture at close under #1833; no consumer notices, ever; builderSelfCertified:false. At close push the branch and open the PR against OODS-pro; no CI will run.
Receipts under artifacts/product-reality/sprint-199/<mission>/.
```

## What is true at the base (do not re-derive; measure only if you suspect drift)

- **Bridge:** `/health` revision `b7a96ab0f`, 19 tools; runtime ledger 240/240 across 18 objects; health viz summary 13 types / 21 patterns / 34 identities / 20 core cells / 13 surface-complete / 7 typed gaps.
- **Sprint 198 carry code:**
  - address seed order `packages/mcp-server/src/codegen/workflow-data-emitter.ts:34` (enum) before `:41-43` (address role);
  - required-string fallback `:63`;
  - generated save `codegen/workflow-emitter.ts:94-100`;
  - flow assertion `scripts/product-reality/s188-m03-app-consumers.ts:223-242` (match at `:237`);
  - list filter choice `compose/collections.ts:61-65`;
  - timeline header `compose/collections.ts:89-92`;
  - research spec override `packages/mcp-server/test/objects/research.spec.ts:122-128`.
- **Defect receipts:** `artifacts/product-reality/sprint-198/m05/accepted/{organization,user}/craft/{react,vue}/address-save-persists/` and `m07/runtime/workflows/{Evidence,Mission}/screenshots/`.
- **Packed-app harness** (the Sprint 198 m05 pattern): `pnpm exec tsx artifacts/product-reality/sprint-198/m05/capture-apps.ts <out> <Object>`; copy it under `artifacts/product-reality/sprint-199/m01/` rather than writing into the Sprint 198 folder.
- **Runtime cells:** `scripts/product-reality/s193-runtime-cells.ts` accepts `--workflow`/`--cell`/`--filter`, so re-sweep only the objects whose output changed and attribute artifact hashes.
- **Chart pipeline:**
  - `@oods/viz-core` exports `dist` only, so `viz.render`, the census scripts and every mcp-server test see a source change only after `pnpm --filter @oods/viz-core build`;
  - viz-core vitest enforces a coverage floor with `all:true` (`packages/viz-core/vitest.config.ts:29-40`).
- **Generators with `--check`:**
  - `s190-viz-census.ts` (`--write-registry` is the only registry write);
  - `s195-pattern-census.ts` (`--measure` writes observations; default path is hard-coded to `sprint-197/m05` at `:17`, fix that first);
  - `s195-viz-taxonomy.ts`, `s195-pattern-sources.ts`, `s195-pattern-input-schema.ts`, `s195-health-viz-schema.ts`, `s195-chart-declaration-schema.ts`;
  - `s195-qualify-viz-matrix.ts` (`--mode s197` only at `:120-143`);
  - `docs:api`, `docs:check`, `s193-tool-truth.mjs`.
- **Gate commands the readers measured:**
  - viz-core full suite about 6–50 s, viz-render 7–21 s;
  - the 15 named goldens at `ci.yml:961` about 20 s;
  - `test:scale` 6.5 s;
  - the viz contract specs are seconds each: `viz-recipes.s190` 5–7 s, `chart-placement-codegen.s195` 16–27 s, the census re-measure in `viz-pattern-registry.s195` has a 120 s budget.
  - The full mcp-server suite (about 13–18 min) and root-core (about 10 min) stay out of the gate and run once at close.
- **Soak:** `pnpm --filter @oods/mcp-server run test:echarts-soak` (18–30 s; needs `@oods/viz-render` dist and `--expose-gc`, which the script supplies).
- **Cross-timezone probe:** `TZ=UTC pnpm exec tsx scripts/product-reality/s196-temporal-probe.ts --requests artifacts/product-reality/sprint-196/m05/timezone-bite/requests.json --out <dirA>`, the same under `TZ=America/Chicago --out <dirB>`, then `--compare --left <dirB>/observations.json --right <dirA>/observations.json --out <file> --check-registry` (16/16).
- **HC proof harness:** `scripts/product-reality/component-theme-proof.mjs:145-229` (`runVizThemeProof`); `scripts/product-reality/s195-hc-browser.ts` covers bar and line and writes into `sprint-195/m05/browser`, so make an s199 copy. `scripts/product-reality/s197-hc-scope.ts:86` writes into `sprint-197/m04`; do not rerun it in place.
- **Populations:**
  - canonical runtime: 18 objects / 240 cells;
  - retained composition comparison: 11 objects / 77 schemas / 154 cells (state both, never call the retained roster the full census);
  - component cells 1,308; viz 13 types / 78 scopes; patterns 21 rows / 84 census cells; tool ledger 24 rows.

## Mission objectives (mirrors CMOS; CMOS is the record)

### s199-m01 — The Sprint 198 carries, the local chart gate, sprint-parametric migration
- **Address save:** one role per record in the seed; Save replaces the displayed entry.
- **Evidence filter:** binds its classification field.
- **Mission header:** shows the title, with no placeholder seeds.
- **Gate:** `pnpm viz:gate`, timed at the base and bitten.
- **Migration scripts:** census `--observations` required, matrix `--mode s199`, attribution copy for sprint-199.
- **Golden ledger:** started with the before-plan.

Exit: replacement assertions green; re-taken checkpoints for the three carries (React/Vue × 390/820/1440); runtime cells for Organization, User, Evidence and Mission re-swept and attributed; `viz:gate` green with its wall time recorded.

### s199-m02 — Decide and document
ScaleTemporal `timezone` removed (0.3.0, breaking, decision supersedes `#1969`); the `#1971` limit in the public `viz.render` description and the cookbook fixed; the strict soak assertion retired with measurements retained (decision supersedes `#1946`); the 13-type table extended with per-scope state, conformant count and per-row reasons.

Exit: trait test rejects `timezone`; cross-timezone probe 16/16; soak 3/3 locally with receipt; table generation fails on a scope without a code (bite).

### s199-m03 — Patterns and the Core Analytics Profile
The scene path, the layered-params fix and facet wrap/limit. Twelve patterns go public; linked-brush-scatter retires; facet-target-band is decided at measurement. Waterfall and histogram are added as patterns. `retiredCells` is added, retiring candlestick, box and contour. Health, docs and the tool description are regenerated, and the Sprint 195 closeout verifiers are pinned to their historical head.

Exit: taxonomy 17 surface-complete / 0 typed gaps / 3 retired, served; every pattern public or retired with a reason; the 8 existing public hashes unchanged; temporal patterns pass the cross-timezone check.

### s199-m04 — ECharts accuracy and fidelity
- **Bubble map:** area scaling, and V169 measures the drawn sizes (mutation-proven).
- **ECharts band:** stacked pair.
- **Fidelity:** a per-renderer assertion in the keystone gate, with `preferredRenderer` corrections recorded.

Exit: bubble_map four scopes conformant in the registry; the band spec and the fidelity check red at base, green after; every moved pin ledgered.

### s199-m05 — High contrast for the nine types
Shared HC chrome helper, per-type fixes, discrete HC numeric steps, chord decided, light/dark defect fixes and heatmap's ramp, s199 forced-colours browser proof (26 cells plus the dashboard) with a reviewer `index.html`, registry and HC prose regenerated.

Exit: nine rows `hc:true` or chord HC-retired with its reason; 18 HC scopes rendered; zero `illegal color` warnings; light/dark hashes unchanged except ledgered fixes.

### s199-m06 — The force graph placed on Relationship
MarkGraph trait, VizGraphPreview in React and Vue, the `edge-array` source and transformation, Relationship's synthetic neighborhood field with a boundary spec, a placement codegen spec, the census note rewrite for the other seven types, Relationship's runtime cells.

Exit: one placed graph with its asset byte-equal to public `viz.render` in React and Vue; placement inventory 9 declarations / 4 placed types.

### s199-m07 — Closeout, local only
- **Pre-freeze:** `viz:gate`, readiness `--check`, registry integrity, narrative and link tests, `docs:check`.
- **Capture:** one five-suite run under `#1833`.
- **Censuses:** viz, patterns, taxonomy, runtime cells for changed objects, component 1,308, tool ledger.
- **Ledger:** golden ledger verified and sealed receipts byte-identical; the advertised diff from `b7a96ab0f` attributed by mission.
- **Roadmap:** `near.md` top part to BUILT, REVIEW PENDING.
- **Hand-off:** push and open the PR; `m07/closeout/handoff.md`.

No claim ledger, no machine audit, no notices.

## Hazards and recipes

- **Sealed receipts.** Several scripts default to sealed Sprint 195–197 output paths: pattern census, qualify-viz-matrix, s195-hc-browser, s197-hc-scope. Run none of them without an explicit sprint-199 output path. Check with `git diff --stat -- artifacts/product-reality/sprint-19[5-8]` (must be empty).
- **Sprint 195 closeout verifiers.** `closeout-audit.s195.spec.ts` and `closeout-producer.s195.spec.ts` read the live taxonomy and pin 34/13/7. Pin their taxonomy and classification reads to the historical head, as the same spec already does for viz-patterns and viz-recipes (`closeout-audit.s195.spec.ts:15`).
- **Guards that read `ci.yml`.** Adding a colocated `viz.render.*` or `dashboard.render.*` golden requires naming it at `ci.yml:961`, or `ci-golden-list.guard.test.ts` goes red.
- **Hover conditions in static SVG.** A Vega-Lite condition with an empty selection may paint the active value for every mark (`vega-lite-adapter.ts:621-627`). Check the SVG, and declare it in the pattern warning.
- **Scope of the fidelity check.** It may go red on more than y2 (the ECharts series encoding has no shape branch). Size the work from the first red run; never add an allowlist.
- **HC colour parsing.** ECharts and d3-color cannot parse `oklch()`; continuous HC interpolation can never produce declared paints. Category identity in HC is carried by labels, borders and geometry, not hue. Say so.
- **Graph accessibility.** The force_graph SVG has no role or aria-label of its own. Assert the preview wrapper's accessible name by renderer; do not copy the Vega-only `role="graphics-object"` assertion.
- **Graph determinism.** The force layout is outside the adapter's determinism scope (`graph-adapter.ts:6-11`), but repeat-equality holds today; the codegen second-generation equality check catches drift.
- **Timezone-sensitive pins.** Seven of the thirteen patterns are temporal. New temporal hash pins need the cross-timezone probe before any cross-host claim.
- **`stackStrategy`.** `stackStrategy: 'all'` exists in ECharts 6.0.0. Confirm `@oods/viz-render` resolves the same ECharts version before relying on it for pixels.
- **Readiness facts.** Any root `package.json` edit (the `viz:gate` script) stales the Sprint 196 readiness facts. Regenerate them with the unchanged generator before the freeze, record the diff, and keep `s196-release-readiness.ts --check` in the pre-freeze pass (`#2008`).
- **Suite scheduling.** Root-core goes red under parallel scheduling. Run suites serially; git-range specs need the 60 s budget (`#1833`). macOS has no `timeout`.
- **Roadmap edits.** `near.md` is read by the `closeout.s190`/`s191`/`s196`/`s197` specs, `public-head-equivalence.s185.spec.ts` and the `tests/verification` prose contracts. Edit only the top part, and rerun them after any roadmap edit.
- **Out of bounds.** Do not send messages to any project. Do not merge `codex/sprint-198-closeout-evidence`.
