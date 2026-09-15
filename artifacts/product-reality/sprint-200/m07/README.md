# s200-m07 — closeout, local only

Builder self-certified: **false**. Implementation head `f8bef2a2b` (the last product change, m06); pre-freeze head `136e678bf` (the roadmap row and the part A receipts), part B receipts at `ea6180317`; execution head `the tip of `codex/sprint-200-available` that adds this file` (this closeout's capture, censuses and handoff). No product file changed after `f8bef2a2b`. No publish, no tag, no notices, no primary-checkout build.

## Pre-freeze pass

`pre-freeze/part-a-status.txt` and `pre-freeze/part-b-status.txt` list every command with its exit code and window; each has its log beside it.

- Part A (rebuilds nothing): readiness `--check` on the sprint-200 facts; `docs:check`; `render-license`, `third-party-notices` and `client-configs` `--check`; the golden ledger `check` (243 entries, 15 must-not-move verified); the root verification specs (license-shape.s200, release-publish-shape.s196, readme.s200, portable-runbook.s200, how-forge-works, s177 prose, forge-claims, agent-docs-registry, docs, gate2 packet, runtime-executable-boundary: 83 tests); the three alias specs; the near.md-reading and ledger specs in `@oods/mcp-server` (closeout.s190/s191/s196/s197, public-head-equivalence.s185, tool-truth, tool-specs generator, portable claims: 187 tests); the adapter contract test (21); the assembly unit test; `pnpm typecheck`. All exit 0.
- Part B (rebuilds dists, run alone): `pnpm viz:gate` into `pre-freeze/viz-gate/` (passed); then `portable:assemble --final` at `136e678bf` (the first attempt failed only because its log was being written inside the worktree, which `--final` refuses; the rerun wrote its logs outside and passed: archive sha256 `0d3e4ca76e57aacff9362e02f9bf7ea1287e7e972aab1e5e83f414047222d780`, manifest in `pre-freeze/portable-manifest.json`) and `portable:e2e` against its extraction (pass; 18 pass, 1 typed; tree restored). This bundle is the pre-freeze proof; the draft release stays the archive built at `723bc2195`, because nothing in the runtime changed after it (the two differ only in the ledger's recorded head and the receipts).

## Five-suite capture (#1833)

One numbered run at the capture head `ea6180317` (`ea6180317`, the pre-freeze receipts commit), serial files (`maxWorkers=1`), a 60 s test timeout, suites sequential, every one of the 14 cleanliness checkpoints clean, 2026-09-15T00:52:18.808Z → 2026-09-15T01:24:07.204Z. **Status: passed.** The five counts, stated separately: **17,738 passed assertions, 0 failed assertions, 32 skipped, 0 failed files, 0 uncollected files** (17,770 executions; the 32 skips are the same 16 optional Stage1 cases collected by both MCP and root). No isolated rerun was needed; no second attempt.

| Suite | Status | Passed | Failed | Skipped | Failed files | Uncollected |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| viz-core | passed | 1,542 | 0 | 0 | 0 | 0 |
| viz-render | passed | 72 | 0 | 0 | 0 | 0 |
| mcp-server | passed | 7,131 | 0 | 16 | 0 | 0 |
| root-core | passed | 7,511 | 0 | 16 | 0 | 0 |
| component-packages | passed | 1,482 | 0 | 0 | 0 | 0 |

Raw Vitest JSON per suite under `capture/forge-s200-m07-head/run-1/`, the harness log in `capture/capture.log`, the accounting in `capture/head-accounting.json`.

## Censuses (`closeout/censuses.json`, `closeout/runtime-census.json`)

- Components: 110 identities; the Sprint 200 m02 theme proof re-measured all 1,320 cells (6 scopes × 110 identities × 2 frameworks, every scope passed) after the chrome pass.
- Runtime: canonical roster 18 objects / 240 cells; the retained composition roster 11 objects / 77 schemas / 154 cells (unchanged from Sprint 199); the release ledger 42 cells over Organization, Subscription and User. The generation census re-composed and re-generated every registry row at the execution head: 240 rows compared, 240 equal, 0 unequal (`closeout/runtime-census.json`; no browser sweep, the generation layer only).
- Viz: 13 types / 78 rendered and conformant scopes (26 HC) unchanged since Sprint 199; the four viz registries hash-identical to the Sprint 199 census; no chart golden moved (golden ledger verified).
- Tools: the ledger has 24 rows (19 auto, 5 on-demand; 19 product-reality, 5 contract) in mode s200 bound to the E2E of the draft archive at `723bc2195`: 18 pass, 1 typed (`design.preview`, OODS-N019); OODS-N020 closed from the bundle.
- Manifests: 23 of 23 declare `PolyForm-Noncommercial-1.0.0`. LICENSE files: 6 of 6 rendered for the holder from the canonical text (sha256 `ffcca388…`).
- Rosters stated separately: canonical 18 objects (Article, Chunk, Collection, Document, Evidence, Invoice, Media, Mission, Organization, Plan, Product, Project, Relationship, Report, Subscription, Transaction, Usage, User); retained composition 11 objects.

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-200/golden-ledger.json`: 243 entries, every pin m02 moved attributed once, 15 must-not-move files verified. `git diff --stat -- artifacts/product-reality/sprint-19[5-9]` is empty at every commit of the sprint.

## Advertised diff

`closeout/advertised-diff.json`: 11 commits from `c344b773a` (one planning, ten mission commits), 5,363 changed paths (5,100 of them m02's chrome sheets, theme proof and runtime receipts), 48 advertised-surface paths (tool descriptions, schemas, registries, docs/api, Tool-Specs, tool and codegen sources, token and component sources, manifests) each attributed to its mission commits.

## Roadmap

`cmos/foundational-docs/roadmap/near.md` top part only: the §3 Sprint 200 row and the §6 header read BUILT, REVIEW PENDING with the counts and the draft release URL; the retained record below the divider is byte-identical; the near.md-reading specs passed after the edit (part A).

## Handoff

`closeout/handoff.md` (builderSelfCertified: false): the heads, the receipts index, the verified scope, the test accounting, the carries, and the two actions only Derek takes at the review: flip the repository public and confirm the license holder name; then the review publishes the draft release. The branch is pushed and the PR against `OODS-pro` is open; no CI runs.
