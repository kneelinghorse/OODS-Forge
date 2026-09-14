# Sprint 200 build handoff — Available to individuals (Phase C)

Memo: `cmos/planning/forge-s200-available-decision-memo.md` (LOCKED 2026-09-14). CMOS: `sprint-200`, missions `s200-m01` … `s200-m07`, serial. Worktree `~/.codex/worktrees/s200/OODS-Forge`, branch `codex/sprint-200-available`, created, installed and built at planning. Base `c344b773a` on `OODS-pro` (the live bridge serves it). Roadmap: `cmos/foundational-docs/roadmap/near.md` §3, §6, §6a, §10, §11.

## Fresh-session prompt

```
You are building Sprint 200 for Forge: available to individuals (Phase C of the 2026-09 roadmap) — the chrome pass, PolyForm Noncommercial in the repo, a public-shaped bundle on a draft GitHub Release, a newcomer README and a feedback path proven in ten minutes, with the Sprint 199 capture carry closed first.
Open CMOS with cmos_review(), then cmos_sprint(action="show", sprintId="sprint-200") and cmos_mission(action="show") for each mission before starting it.
Read, in order: cmos/planning/forge-s200-available-decision-memo.md (measured base §2, settled decisions §3, missions §4, movers §5, descope §6, never-cut), cmos/planning/forge-s200-build-handoff.md, cmos/foundational-docs/roadmap/near.md §3, §6, §6a and §11, artifacts/product-reality/sprint-197/m06/README.md (before/after sheet pattern), artifacts/product-reality/sprint-199/m07/closeout/handoff.md (the capture accounting shape).
First act: cd ~/.codex/worktrees/s200/OODS-Forge; confirm git log -1 is the planning commit on codex/sprint-200-available and git status is clean; df -h /System/Volumes/Data. The worktree was installed and built at planning (pnpm install --frozen-lockfile, build:tokens, build:packages); rebuild only if dist is stale.
Work only in that worktree. Never build, test-write or edit in the primary checkout /Users/systemsystems/portfolio/Design-Tools/OODS-Forge: it serves the live bridge. Do not touch PM2, other repositories, or Stage1.
GitHub CI is OFF and stays off. Never wait for, enable or rely on a workflow. Every gate is a local command; the five-suite capture is the CI stand-in and m01 takes one first.
Missions are serial: start each with cmos_mission(action="update", status="In Progress") and a [Started] note; complete with a [Completed] note stating heads, counts and receipts; record decisions with decisions[] on session completion (never also as captures). If a criterion contradicts the mission order, say so in the note and continue with the scoped gate.
Rules in force: fix at the producer, never in generated output; generated files (LICENSE files, install.md, notices, readiness facts, docs, registries) only through their generators with --check after; every pin moves at most once and is appended to artifacts/product-reality/sprint-200/golden-ledger.json with file, pin, before, after, mission and reason; never write into sealed artifacts/product-reality/sprint-195..199 receipts (git diff --stat under them must be empty at close); the viz registries, certified matrix and snapshots must not move; no npm publish, no tag, no public flip, no consumer messages; builderSelfCertified:false in every handoff.
The license holder is Derek Niedringhaus (https://derekn.com) from configs/license/holder.json only; the approved manifest transitions are decision #2061 (cite it in every approval entry).
Receipts under artifacts/product-reality/sprint-200/<mission>/.
```

## What is true at the base (do not re-derive; measure only if you suspect drift)

- **Bridge:** `/health` revision `c344b773a`, 19 tools; health viz summary 13 types / 23 patterns (22 public + 1 retired) / profile 17 complete, 0 gaps, 3 retired; runtime 240 cells over 18 objects; component cells 1,320 over 110 identities; tool ledger 24 rows.
- **Capture:** the Sprint 199 corrective capture receipts are `artifacts/product-reality/sprint-199/m07/five-suite-corrective/` and `m07/post-capture/{suite-accounting,disposition}.json`; the capture owner script writes `four-suite-baseline.json` (the name is legacy; it holds five suites). Read counts from the raw vitest JSON, and state passed / failed assertions / skipped / failed files / uncollected files separately.
- **Consumer install failure:** `saved-schema-consumers.s183.spec.ts` beforeAll ran an isolated npm install of the packed Vue consumer; `@rollup/rollup-darwin-arm64` was absent (npm optional-dependency behaviour). The s188/s191 packed-app harnesses install Vue consumers the same way.
- **Manifests:** 23 files; the five public-flagged packages and their `publishConfig` lines are in memo §2; `scripts/pkg/build.ts:231-241` copies the root LICENSE and inherits the license id into `dist/pkg/package.json`.
- **Guard:** `tests/verification/release-publish-shape.s196.test.ts`; approvals JSON block at `cmos/planning/forge-gate2-decision-packet.md:93-106` (one `#1952` entry today); the baseline `artifacts/product-reality/sprint-196/m06/package-shapes-baseline.json` is sealed — never edit it; add entries, cite `#2061`, and write the literal `#2061` once in the packet prose so the guard finds it.
- **Readiness:** `scripts/product-reality/s196-release-readiness.ts --facts <path>` (`:277-279`), sealed-path refusal at `:257`; the packet's generated block is rewritten by the same run. Any root `package.json` edit stales the facts (`#2008`); regenerate before the freeze and keep `--check` in the pre-freeze pass.
- **Bundle:** `pnpm portable:assemble` → `scripts/runtime/assemble.mjs` (memo §2 line refs); `pnpm portable:e2e` → `scripts/runtime/e2e.mjs`; the manifest of shipped packages is `scripts/runtime/manifest.mjs:18-32`; `PACKAGE_RUNTIME_DIRECTORIES` at `assemble.mjs:33-37` is where extra source subtrees (the tokens inputs for `brand.apply`) are declared.
- **brand.apply:** the N020 check is a directory existence test at `packages/mcp-server/src/tools/brand.apply.ts:53-64` on `packages/tokens/src/tokens/brands`; measure which other `packages/tokens/src` subtrees its two build stages read before deciding what to ship.
- **Aliases:** the six `exports` entries and every asserting spec are listed in memo §2; the s184 product-reality specs are historical — change their imports, not their receipts.
- **Install docs:** `docs/mcp/Connections.md` (Claude Desktop, Cursor; no Claude Code), `configs/agents/*.stdio-mcp.json`, `packages/mcp-adapter/test-s55-m05.js:58-121`. Entry point `packages/mcp-adapter/index.js`; env `MCP_TOOLSET`, `MCP_ROLE`.
- **Chrome:** every file:line the pass touches is in memo §2 (tokens, `components.css`, `presentational.tsx`, `primitives.ts`, `layout.tsx`, APP_CSS at `workflow-emitter.ts:301-334`, `chart-assets.ts:57-89`, `components.css:307-308`, the seven focus sites). The palette generator's `--check` does not cover geometry; the tokens build `--check` regenerates dist CSS from the JSON.
- **Gates the readers measured:** theme proof `scripts/product-reality/component-theme-proof.mjs` (1,320 cells); `pnpm test:axe` (light and dark), `pnpm test:contrast`; `pnpm viz:gate` (about 2 minutes, 11 steps); runtime cells `scripts/product-reality/s193-runtime-cells.ts` (`--workflow`/`--cell` for scoped sweeps; a full 240 sweep for m02); the near.md-reading specs (`closeout.s190/s191/s196/s197/s198`, `public-head-equivalence.s185`, `tests/verification/{how-forge-works,s177-prose-carriers}.contract.test.ts`).
- **Populations:** canonical runtime 18 objects / 240 cells; retained composition comparison 11 objects / 77 schemas / 154 cells (state both); component cells 1,320; viz 13 types / 78 scopes; patterns 23 rows; tool ledger 24; manifests 23; LICENSE files 6.

## Mission objectives (mirrors CMOS; CMOS is the record)

### s200-m01 — Capture, harness, private:true
- One five-suite capture at the merged head, then at the m01 head; five counts stated separately; every failed file attributed.
- The consumer-install retry for the missing optional native package, with a unit case; applied to every isolated Vue consumer install.
- The five packages `private: true`, `publishConfig` removed, ten `#2061` approvals; the s196 baseline byte-identical.
- Readiness facts under `artifacts/product-reality/sprint-200/readiness/`; sprint-199 added to the sealed-path refusal; `--check` green.

### s200-m02 — The chrome pass
- Token links (radius, shadow, spacing roles → reference scales), `stack-lg/xl`, `focus-offset`; type-scale values unchanged; a geometry contract spec.
- `components.css` and `components-ported.css` on the roles with one fallback per variable and one focus rule.
- Button/Card/Text identical in React and Vue from the roles; no raw Tailwind palette; a parity spec.
- APP_CSS on the token font stack, type scale, spacing, radius, card shadow, 2px/2px focus.
- Placed charts at 720×400, capped at rendered width; the caption/title duplication resolved; placement spec updated.
- Before/after sheets (Subscription, Organization, Relationship; React and Vue; light and dark; 390/820/1440; plus a component sheet) at `artifacts/product-reality/sprint-200/m02/sheets/index.html`.
- One migration: the 240 runtime hashes attributed; theme proof 1,320 with zero Role-C failures; `test:axe` and `test:contrast` green; viz registries, certified matrix and snapshots asserted byte-identical; the ledger started.

### s200-m03 — License and terms
- `configs/license/holder.json` + `scripts/license/render-license.mjs --check`; six LICENSE files with the SPDX text and the rendered Required Notice; the canonical sha256 recorded.
- 23 manifests with the SPDX id; 22 approvals citing `#2061`; the root `repository` URL; `scripts/pkg/build.ts` copying the terms files, with a unit case.
- README LICENSING section and the OODS-Foundry MIT statement; the three MIT references replaced; CHANGELOG.
- CONTRIBUTING inbound grant; both PR templates' checkbox; COMMERCIAL.md with the starting price; `docs/legal/commercial-license-agreement.md`; `docs/LICENSE-FAQ.md`; SECURITY.md.
- `tests/verification/license-shape.s200.test.ts` with its bite receipt.

### s200-m04 — Bundle, notices, brand source, aliases, install, draft release
- `scripts/runtime/third-party-notices.mjs --check` → `THIRD-PARTY-NOTICES.md`; the archive carries LICENSE, COMMERCIAL.md and the notices; the E2E asserts them.
- The tokens source subtrees `brand.apply` reads shipped; N020 closed from the bundle; `portable:e2e` calls `brand.apply` from the extracted archive; ledger, tool description, docs, claims and runbook line regenerated.
- Runbook rewritten for a public source-available release, with a contract spec on the absent words.
- Six alias exports removed; specs, packed-import scripts, envelope list and readiness evidence updated; CHANGELOG.
- `scripts/runtime/client-configs.mjs --check` → `docs/runtime/install.md` (Claude Desktop, Claude Code, Cursor); Connections.md as the contributor path; the clean-HOME Claude Code proof (`claude mcp add`, `claude mcp get forge`, stdio tools/list of 19).
- `gh release create v0.1.0 --draft --target <frozen head>` with the six assets; receipt with URL and sha256s.

### s200-m05 — Onboarding
- README rewritten for a newcomer (what Forge is; object, trait, context with examples; what it generates and what certify means; the ten-minute first run from the release; LICENSING; feedback; contributor path; how-forge-works link); counts from the generated claims templates; title "OODS Forge".
- FEEDBACK.md; `bug-report.yml` reworded, `did-not-read-right.yml` new, `feature-request.yml` kept, `adoption-support.yml` removed, `config.yml`.
- `tests/verification/readme.s200.test.ts`; prose-contract pins updated; docs:check green; a rendered-README receipt.

### s200-m06 — The ten-minute proof
- A fresh subagent session with only the release assets (downloaded for it), README and install.md, in a clean HOME and an empty scratch project: verify, extract, `claude mcp add`, compose, certify, generate, see; per-step timings and verbatim friction; one issue through the template.
- Friction fixed at the producer; a second fresh run under ten minutes; both transcripts under `artifacts/product-reality/sprint-200/m06/`.
- N019 (`design.preview`) stated honestly in the first run; the Phase C exit note for the post-flip outside-individual run.

### s200-m07 — Closeout, local only
- Freeze; pre-freeze pass (viz:gate, readiness `--check` on sprint-200 facts, docs:check, the license/publish-shape/readme/runbook/alias specs, render-license/notices/client-configs `--check`, `portable:assemble` + `portable:e2e`, the near.md-reading specs).
- One five-suite capture under `#1833` with the five counts.
- Censuses (component 1,320 re-measured; runtime cells re-swept; viz 13/78 unchanged; ledger 24 with N020 closed; manifests 23; LICENSE files 6; rosters stated separately); golden ledger verified; sealed receipts untouched; advertised diff attributed.
- `near.md` top part only: §3 row and §6 header to BUILT, REVIEW PENDING with counts; near.md-reading specs rerun.
- Push, PR against `OODS-pro`, `artifacts/product-reality/sprint-200/m07/closeout/handoff.md` with `builderSelfCertified:false`, the draft release URL and Derek's two review actions.

## Hazards and recipes

- **The guard's decision reference.** `release-publish-shape.s196.test.ts:49` requires `#2061` to appear in `forge-gate2-decision-packet.md` outside the JSON block; add one prose line beside the block. Each changed field needs exactly one entry; an unused or duplicate entry fails the guard.
- **Readiness facts stale on any manifest edit.** m01, m03 and m04 each change manifests; regenerate the sprint-200 facts after each and keep `--check` in every gate pass. The packet's generated block is rewritten by the same command — commit both.
- **Sealed receipts.** `artifacts/product-reality/sprint-195..199` never change; scripts that default into them must get explicit sprint-200 paths (`s196-release-readiness.ts --facts`, the theme proof, runtime-cell sweeps, any migration script). Check `git diff --stat -- artifacts/product-reality/sprint-19[5-9]` before every commit.
- **Chart goldens must not move.** The chrome pass changes consumption, not the type-scale values; `oods-vega-config.ts` and the viz registries stay untouched. Assert the 78 + 88 + 8 hashes and the 14 snapshots byte-identical in the ledger before claiming m02.
- **Runtime hashes move as one block.** Any APP_CSS byte changes all 240 `artifactHash` rows; do the full re-sweep once at the end of m02, not per edit, and attribute every row to m02 in the ledger. Runtime cells for objects with placed charts (Invoice, Usage, Subscription, Relationship) also move with the 720×400 re-render.
- **Framework parity.** The Vue Card emits only `oods-card`; the React Card carries Tailwind chrome. Make React match Vue through `components.css`, not Vue match React.
- **Focus in forced colours.** The HC theme paints focus with `Highlight`/`CanvasText`; the one focus rule must keep those fallbacks so the 1,320-cell theme proof and the HC browser proof stay green.
- **Draft release on a private repo.** `gh release create --draft` works without a tag; assets attach with `gh release upload`. The draft URL needs an authenticated viewer; for m06 download the assets with `gh release download --pattern` into the fresh session's directory rather than handing it the URL.
- **`claude mcp add` in a clean HOME.** Use `HOME=<tmp>` and a scratch project directory so the user's own Claude Code config is untouched; `claude mcp get forge` prints the resolved command; the stdio proof is an `initialize` + `tools/list` JSON-RPC exchange with `node <dir>/packages/mcp-adapter/index.js`.
- **PolyForm text.** Take it from the SPDX license-list-data raw URL in memo §2, record its sha256, and render only the Required Notice line; never paraphrase the license.
- **Codegen must not emit the aliases.** `prop-binding.spec.ts:160-161`, `object-codegen-pipeline.spec.ts:86` and `schema-ref.workflow.spec.ts:58` already assert that; keep them green when removing `artifact-envelope.ts:46,57`.
- **Suite scheduling.** Root-core goes red under parallel scheduling; run suites serially; git-range specs need the 60 s budget (`#1833`). macOS has no `timeout`. viz-core narrow runs use `--coverage.enabled=false`.
- **Roadmap edits.** `near.md` is read by the closeout specs and the prose contracts. Edit only the top part, and rerun them after any edit.
- **Out of bounds.** No messages to any project. No npm publish. No public flip. No Stage1 changes. Do not merge `codex/sprint-198-closeout-evidence`.
