# Sprint 201 build handoff — See the work (Phase D)

Memo: `cmos/planning/forge-s201-design-surface-decision-memo.md` (LOCKED 2026-09-15). CMOS: `sprint-201`, missions `s201-m01` … `s201-m07`, serial. Worktree `~/.codex/worktrees/s201/OODS-Forge`, branch `codex/sprint-201-design-surface`, created, installed and built at planning. Base `c02f3ddcb` (`codex/license-holder-llc`: the Sprint 200 merge plus the license-holder correction, PR #117). Roadmap: `cmos/foundational-docs/roadmap/near.md` §3, §7, §10, §11.

## Fresh-session prompt

```
You are building Sprint 201 for Forge: the design loop becomes the surface (Phase D of the 2026-09 roadmap). Every composition opens in a browser as the generated React or Vue app actually running, served by the bridge and from the extracted bundle, at one URL per composition version, in either brand and any theme, with its measurements beside it; two versions side by side with what changed; edits in that view written back into the composition as new versions with lineage; and the residual craft list on Subscription, Organization, User and the two chart titles fixed. Nothing here is a demo or a stub: a mission is done when the capability works from the served bridge and from the extracted bundle and its tests fail without it.
Open CMOS with cmos_review(), then cmos_sprint(action="show", sprintId="sprint-201") and cmos_mission(action="show") for each mission before starting it.
Read, in order: cmos/planning/forge-s201-design-surface-decision-memo.md (measured base §2, settled decisions §3, missions §4, movers §5, descope §6, never-cut), cmos/planning/forge-s201-build-handoff.md, cmos/foundational-docs/roadmap/near.md §3, §7 and §11, scripts/design-loop/README.md and serve.ts (the mount wiring to reuse), scripts/runtime/e2e.mjs (how the bundle's bridge and adapter are proven), artifacts/product-reality/sprint-200/m07/closeout/handoff.md (the capture accounting shape).
First act: cd ~/.codex/worktrees/s201/OODS-Forge; confirm git log -1 is the planning commit on codex/sprint-201-design-surface and git status is clean; df -h /System/Volumes/Data. The worktree was installed and built at planning; rebuild only if dist is stale.
Work only in that worktree. Never build, test-write or edit in the primary checkout /Users/systemsystems/portfolio/Design-Tools/OODS-Forge: it serves the live bridge. Do not touch PM2, other repositories, or Stage1.
GitHub CI is OFF and stays off. Every gate is a local command; the five-suite capture at close is the CI stand-in.
Missions are serial: start each with cmos_mission_transition(action="start") and a [Started] note; complete with a [Completed] note stating heads, counts and receipts; record decisions with decisions[] on completion. If a criterion contradicts the mission order, say so in the note and continue with the scoped gate.
Rules in force: fix at the producer, never in generated output; generated files (registry, schemas, docs, notices, SBOM, install.md) only through their generators with --check after; every pin moves at most once and is appended to artifacts/product-reality/sprint-201/golden-ledger.json with file, pin, before, after, mission and reason; never write into sealed artifacts/product-reality/sprint-195..200 receipts; the viz registries and certified matrix must not move; no npm publish, no tag, no release, no consumer messages; no invented legal, commercial or brand content; builderSelfCertified:false in every handoff.
Receipts under artifacts/product-reality/sprint-201/<mission>/.
```

## What is true at the base (do not re-derive; measure only if you suspect drift)

- **Bridge:** `/health` on the served checkout reports `1827a069b`, 19 tools; the base adds only the license correction. Entry `packages/mcp-bridge/dist/server.js`; the E2E starts it from the archive (`scripts/runtime/e2e.mjs:637-676`) with `x-bridge-token`.
- **Design loop:** `scripts/design-loop/{serve,render,observe,diff,status,common,cli}.ts`; controller 4477, Vite 4478/4479; `consumerEntries` (`serve.ts:25-40`) is the mount wiring to reuse in the served host; receipts schema `receipt.schema.json`; `diff.ts:5-22` the receipt comparison.
- **`design.preview`:** `packages/mcp-server/src/tools/design.preview.ts` (N019 at `:12`, status probe `:17-20`, `tsx` shell-out `:27`); schemas `src/schemas/design.preview.{input,output}.json`; ledger `packages/mcp-server/src/lib/tool-ledger.ts:17` and `test/contracts/tool-truth.s193.spec.ts:41` (19 / 18 / 1 → 19 / 19 / 0 with a new receipt path under sprint-201).
- **Compose:** `design.compose` input `{intent, object, context, layout, preferences, options}`, `preferences.componentOverrides` slot → component; output `schemaRef` with TTL; per-slot `candidates` with `confidence` and `confidenceLevel`. Saved-schema store root `.oods/schemas` (`health.ts:160-168`, env `MCP_SCHEMA_STORE_ROOT`, `MCP_SCHEMA_STORE_DIR`); put the composition store beside it.
- **Generate:** `code.generate` output carries `artifact` (files, actions), `validationReceipt` (`notChecked` included), `meta`; emitters under `packages/mcp-server/src/codegen/`; the artifact envelope validator `codegen/artifact-envelope.ts`.
- **Bundle:** `scripts/runtime/manifest.mjs:18-32` lists the 13 shipped packages; `assemble.mjs` copies `package.json` + `dist/` plus `PACKAGE_RUNTIME_DIRECTORIES` (`:33-37`) and the tracked boundary (`:416-448`); the closure is the production dependency closure (283 packages at `v0.1.0`; none of esbuild, `@vue/compiler-sfc`, react, react-dom, vue). `scripts/runtime/third-party-notices.mjs --check` and `sbom-lite.mjs` regenerate the notices and SBOM. `--final` refuses any dirty tree: write logs outside the worktree. `portable:e2e --extract-dir <dir> --repo-root <worktree>`.
- **Adapter:** `packages/mcp-adapter/index.js` (stdio; spawns the native server from `dist`; no HTTP). The lazy preview host start goes here; it must not change the 19-tool `tools/list` or the `initialize` exchange the install proof asserts (`packages/mcp-adapter/test-s55-m05.js`, `scripts/product-reality/s200-claude-code-proof.mjs`).
- **Craft checkpoints:** the s188/s191 packed-app harnesses and `scripts/product-reality/s193-runtime-cells.ts` (`--workflow`/`--cell`); Sprint 199 m01 retakes (`artifacts/product-reality/sprint-199/m01/`) show the retake shape; `#2046` and `#2060` list every item; the graph and sankey titles come from `packages/viz-core` recipes and the placed-chart size in `codegen/chart-assets.ts`.
- **Gates:** `pnpm viz:gate` (~2 min); theme proof `scripts/product-reality/component-theme-proof.mjs` (1,320 cells); `pnpm test:axe`, `pnpm test:contrast`; runtime cells full sweep for m06; the near.md-reading specs (`closeout.s190/s191/s196/s197`, `public-head-equivalence.s185`, `tests/verification/{how-forge-works,s177-prose-carriers}.contract.test.ts`, `readme.s200`, `portable-runbook.s200`, `license-shape.s200`).
- **Populations:** runtime 18 / 240; component 110 / 1,320; viz 13 / 78; tool ledger 24; capture at `ea6180317` 17,738 / 0 / 32 / 0 failed files.

## Mission objectives (mirrors CMOS; CMOS is the record)

### s201-m01 — The running-app preview from the bundle
- Preview host in `packages/mcp-bridge` (`/preview/<compositionId>/<version>` for now keyed by schemaRef until m02): request-time compile of the generated artifact with esbuild and `@vue/compiler-sfc`; prebuilt host runtimes (react, react-dom, vue, foundation `dist`, component-styles CSS, token CSS) built at package build time and shipped; the page mounts as `consumerEntries` does.
- The adapter starts the host lazily on 127.0.0.1 and `design.preview` returns `{previewUrl, framework, brand, theme, ...}` from the extracted archive; N019 removed from the tool, the registry row, the ledger and the docs.
- The closure additions with their platform binaries; notices and SBOM regenerated; `install.md` states the platform matrix; `portable:assemble` + `portable:e2e` prove `design.preview` from the archive (19 / 19 / 0).
- The preview residue fixed: placeholder convention and title, the Subscription detail `header` slot, the confidence and score names. Tests: a bridge route spec that compiles and serves a generated React and a generated Vue artifact; an adapter spec for the lazy start; the E2E assertion.

### s201-m02 — Compositions with versions and lineage
- The composition store; `design.compose` returns `compositionId` and `version`; one URL per version; lineage panel (composition, version, parent, operation, head); brand, theme and width controls; both frameworks. Tests: store round-trip, URL resolution, lineage content, brand/theme re-mount asserted in the page.

### s201-m03 — Side by side and what-changed
- `/compare/...`: both apps; the what-changed panel (regions, slots, props, field order, seed, artifact hashes); both measurement panels; `design.preview action:"compare"`. Tests: a structural diff spec with known edits; an unchanged pair reports zero differences.

### s201-m04 — Measurement beside the render
- validationReceipt, placed-chart `artifact.certify`, axe-core in the page for the current brand/theme, stored per version; the panel names what was and was not measured. Tests: the stored measurement equals what the tools return; axe results present for light and dark; nothing claimed when a measurement did not run.

### s201-m05 — Editing that writes back
- The four operations (reorder region, swap slot component from the composer's candidates, reorder fields, change seed) from the page and from `design.preview action:"edit"`; the override surface extended (region order, field order, seed) in the compose input schema; each edit a new version with parent and operation; re-compose + re-generate; registry, ledger, docs regenerated. Tests: each operation produces the expected schema change and a new version; the schema is never mutated in place; an invalid operation is refused with a typed error.

### s201-m06 — The craft list closed
- Before receipts for every checkpoint; every `#2046` item, the Relationship graph title/labels, the sankey title overlap, the root Storybook chrome, the payload-to-file option, fixed at the producer; after receipts and screenshots in both frameworks at 390/820/1440; runtime hashes moved once in the ledger; the viz registries unchanged unless a chart recipe changes, in which case the moved pins are attributed.

### s201-m07 — Closeout, local only
- Pre-freeze gates; `portable:assemble --final` + `portable:e2e`; one five-suite capture with five counts; censuses; the golden ledger verified; `near.md` top part to BUILT / REVIEW PENDING; push; PR against `OODS-pro`; handoff with `builderSelfCertified:false`.

## Hazards and recipes

- **esbuild binaries.** esbuild resolves its platform package at install; the bundle must carry `@esbuild/darwin-arm64`, `darwin-x64`, `linux-x64`, `linux-arm64` and the assembler's boundary must allow them; the SBOM and notices count moves. Verify the archive on this machine and in the pinned Linux container (`forge-s197-playwright`).
- **Vue SFC compile.** `@vue/compiler-sfc` needs the template compiled to render functions and the style block emitted; generated SFCs use `<script setup lang="ts">`, so esbuild transforms the script part.
- **Host runtime identity.** One React and one Vue runtime per page; the generated module must import react/vue from the host's prebuilt copies (import map or esbuild `external` + alias), or hooks and reactivity break.
- **Adapter lazy start.** The stdio adapter must keep stdout for JSON-RPC; the host logs to stderr; the port is chosen free and reported in the tool result; the host exits with the adapter.
- **Composition store paths.** Reject unsafe ids; the store lives under the schema store root and is never inside the archive.
- **Sealed receipts.** `artifacts/product-reality/sprint-195..200` never change; `git diff --stat` under them must be empty at every commit.
- **`--final` assembly refuses a dirty tree.** Commit first, write logs outside the worktree, then assemble.
- **Capture cleanliness.** The capture harness needs a clean tree at every checkpoint; commit receipts before the capture.
- **Suite scheduling.** Serial suites; git-range specs need the 60 s budget (`#1833`); macOS has no `timeout`; viz-core narrow runs use `--coverage.enabled=false`.
- **Roadmap edits.** Only the top part of `near.md`; rerun the near.md-reading specs after any edit.
- **Out of bounds.** No messages to any project. No publish, tag or release. No Stage1 changes. No content Derek did not state (holder, contact, prices, terms).
