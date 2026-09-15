# s201-m07 — closeout, local only

Builder self-certified: **false**. Implementation head `82f55f190` (the last product change, m06); pre-freeze head `c3d06b762` (the roadmap row and the part A receipts); chart gate at `4e372aeed`; the frozen bundle and its E2E at `37fc2351b` (receipts committed at `a6bd41b25`, the capture head); execution head = the tip of `codex/sprint-201-design-surface` that adds this README, the censuses and the handoff.

## Pre-freeze pass

`pre-freeze/part-a-status.txt` and `pre-freeze/part-b-status.txt` list every command with its exit code and window; each has its log beside it.

- Part A (rebuilds nothing, `run-part-a.sh`): readiness `--check` on the sprint-201 facts (moved from the sealed sprint-200 path when the root package gained `@oods/component-styles`); `docs:check`; `generate:check`; `render-license`, `third-party-notices` and `client-configs` `--check`; the golden ledger `check` (166 entries, 2 must-not-move verified); the viz census `--check` and the certified matrix `--check` in mode s201; the root verification specs; the ported-package contract specs; the near.md-reading and ledger specs; the s201 specs (design.preview, composition store, adapter host, craft list, payload mode, bridge preview, viz-core chart titles); the adapter install proof; the assembly unit test; root `typecheck`. The first pass found two producers to fix: the ported stylesheet had to mirror the paginator grid block (its contract spec asserts the two files carry one rules block), and the SBOM's esbuild-binary assertion now applies only to closures that ship esbuild (the unit test's synthetic lock has none). Every gate then exited 0.
- Part B (rebuilds dists, run alone): `pnpm viz:gate` into `pre-freeze/viz-gate/` (11/11); then `portable:assemble --final` and `portable:e2e` (`run-part-b2.sh`, logs written outside the worktree because `--final` refuses a dirty tree). The first two attempts are on the status file: one refused by an untracked script, one whose E2E found the version recording the m06 build revision because the server dist had not been rebuilt at the pre-freeze head; after `pnpm --filter @oods/mcp-server build` and the bridge build, the archive `c4c51dc2…` at `37fc2351b` assembled clean and its E2E passed: 19 tools executed, 0 typed, `design.preview` served from the adapter-started host.

## Five-suite capture (#1833)

One numbered run at the capture head `a6bd41b25`, `capture-s185-m01-baseline.mjs` (install `--frozen-lockfile`, token, package and publishable-package builds, then the five suites serially with `maxWorkers=1` and a 60 s test timeout), every cleanliness checkpoint clean, 2026-09-15T08:50:53Z → 09:11:18Z.

| Suite | Status | Passed | Failed | Skipped | Failed files | Uncollected |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| viz-core | passed | 1,546 | 0 | 0 | 0 | 0 |
| viz-render | passed | 72 | 0 | 0 | 0 | 0 |
| mcp-server | passed | 7,153 | 0 | 16 | 0 | 0 |
| root-core | passed | 7,535 | 0 | 16 | 0 | 0 |
| component-packages | passed | 1,484 | 0 | 0 | 0 | 0 |
| **Total** | **passed** | **17,790** | **0** | **32** | **0** | **0** |

Raw Vitest JSON per suite under `capture/forge-s201-m07-head/run-1/`, the harness log in `capture/capture.log`, the accounting (`s200-capture-accounting.mjs`) in `capture/head-accounting.json`. A four-suite attempt at the same head with `capture-s184-m07-suites.mjs` (not retained as a run) failed only on `tests/contracts/public-api.contract.test.ts`, which needs the publishable package the five-suite harness builds first.

## Censuses (`closeout/censuses.json`, `closeout/runtime-census.json`)

- Runtime: canonical roster 18 objects / 240 cells; the registry carries the m06 re-sweep (240/240 pass, run `379093ac…`); the generation census at the capture head re-composed and re-generated every row and found all 240 hashes equal; 160 cells moved from the base, attributed in the golden ledger. Release ledger 42 cells. Retained composition roster as recorded at Sprint 200 (11 objects / 77 schemas / 154 cells).
- Components: 110 identities / 1,320 theme cells (Sprint 200 m02's measurement stands; this sprint changed one stylesheet rule, carried by the m06 screenshots).
- Viz: 13 types / 78 rendered scopes; the recipes registry and the certified matrix moved once (sankey, force_graph); patterns, taxonomy and classification byte-identical to the base; certified epoch `071e412b…`.
- Tools: the ledger in mode s201 bound to `pre-freeze/e2e-host.json` (the frozen bundle's E2E at `37fc2351b`): 24 rows, 19 auto, 19 executed, 0 typed; OODS-N019 closed.
- Bundle: 315 packages in the closure (283 at v0.1.0), archive 55,521,681 bytes, sha256 `c4c51dc271b8fa3ec047d3570395622eabfce0d6debac231222eeedb099deffc`, 20,937 payload entries.

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-201/golden-ledger.json`: 166 entries, every pin moved once and attributed; 2 must-not-move files verified. `git diff --stat -- artifacts/product-reality/sprint-19[5-9] artifacts/product-reality/sprint-200` is empty at every commit of the sprint.

## Advertised diff

`closeout/advertised-diff.json`: 11 commits from `c02f3ddcb` (one planning, six mission, four closeout), 6,744 changed paths (6,556 of them m06's receipts), 33 advertised-surface paths attributed by commit.

## Roadmap

`cmos/foundational-docs/roadmap/near.md` top part only: the §3 row D and the §7 Sprint 201 header read BUILT, REVIEW PENDING with the mission summary and the census counts; the retained record below the divider is byte-identical; the near.md-reading specs passed after the edit (part A).

## Handoff

`closeout/handoff.md` (builderSelfCertified: false): the heads, the receipts index, the verified scope, the test accounting, the carries; `closeout/pull-request.json` records the PR against `OODS-pro`. No release, tag, notices, PM2 restart or primary-checkout build; delivery belongs to the reviewing session.
