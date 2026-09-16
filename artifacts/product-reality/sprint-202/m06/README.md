# s202-m06 — Closeout, local only

Builder self-certified: **false**.

The heads, in order:

| Head | Commit | What it holds |
| --- | --- | --- |
| Implementation | `c374f090b` | m05's receipts: the last mission commit |
| Pre-freeze | `202805582` | The Sprint 202 modes in the tool-truth census and the chart gate, the roadmap row, the part A receipts |
| Part B1 | `99f3d501d` | The chart gate's receipts and the part B scripts; the frozen bundle was assembled here |
| Part B2 receipts | `56d54d8cc` | The E2E and the Linux proof, and the tool ledger bound to them |
| Capture | `74abd729f` | The two root-core pins m01 left behind, moved, and the retained red capture; the head the five-suite capture measured |
| Execution | tip of `codex/sprint-202-conversation-preview` | This README, the censuses and the handoff |

## Pre-freeze pass

`pre-freeze/part-a-status.txt` and `pre-freeze/part-b-status.txt` list every command with its exit code and window. Each command's log sits beside them.

### Part A

`run-part-a.sh` rebuilds nothing. It ran at `c374f090b` with the pre-freeze changes in the tree, which were then committed as `202805582`. All 29 gates exited 0.

- **Generators and ledgers:**
  - readiness `--check` on the Sprint 202 facts, regenerated first because the root and bridge `package.json` moved in m01–m03;
  - `docs:check`, `generate:check` and `s193-tool-truth --check`;
  - `--check` for `docs:api`, `docs:tools`, `docs:claims`, `render-license`, `third-party-notices` and `client-configs`;
  - the golden ledger `check` and the viz census `--check`;
  - the certified matrix `--check` in mode s201, since the matrix must not move.
- **Specs:**

  | Group | Tests |
  | --- | ---: |
  | Root verification (the near.md readers and the install path) | 112 |
  | Component packages (React and Vue port contracts, the Vue placed chart, the styles' container query) | 33 |
  | mcp-server near.md and ledger readers | 200 |
  | The Sprint 201 surface | 26 |
  | The Sprint 202 specs | 76 |
  | The reference host (the adapter's MCP Apps surface, the harness, the preview app, the acts, the shell landmarks) | 13 |
  | The bridge preview | 34 |
  | viz-core chart titles | 27 |

- **Adapter and build:** the adapter's install and protocol proofs (`test-s55-m04` 17/17, `test-s55-m05` 21/21, lifecycle, native errors), the assembly unit test, and root `typecheck`.

### Part B1

`run-part-b1.sh` runs alone because it rebuilds viz-core and viz-render. `pnpm viz:gate` ran into `pre-freeze/viz-gate/` at `202805582`, and all 11 commands exited 0 (`viz-gate/report.json`).

### Part B2

`run-part-b2.sh` ran at `99f3d501d`. Its logs went outside the worktree, because `--final` refuses a dirty tree. In order:
1. The server and bridge dists were rebuilt at the head, because a version records the server's own build stamp.
2. `portable:assemble --final` built the archive.
3. The E2E ran against the extraction.
4. The Linux container proof ran from the same archive.

The results:
- **The frozen bundle:** `forge-runtime.tar.gz`, 55,909,250 bytes, sha256 `d314933412f7504ef054a159355834b4432c0507cc0a640d1f20ada97f046dbe`, 315 packages, 20,947 payload entries, `dirty: false` (`portable-manifest.json`, `portable-archive.sha256`, `portable-assemble.log`).
- **`e2e-host.json`:** pass.
  - 19 tools: 19 executed, 0 typed; 30 calls in the first adapter process and 1 after the restart.
  - The negotiated client listed and read the shipped preview app (2,105,938 bytes, revision `87de86c9408e`). It also read `design_preview`'s modules, styles, record (head `99f3d501d`) and lineage through `resources/read`.
  - The restart client declared nothing and kept the text result.
  - The extraction tree was restored.
- **`linux/preview-proof.json`:** pass on linux-arm64 with Node v22.20.0, 20 of 20 checks. The archive's digest inside the container equals the local one (`linux/commands.log`).

### Binding the tool ledger

The ledger was then bound in mode `s202` to `pre-freeze/e2e-host.json` (receipt sha256 `67194d59f88763dc4786a8ecedc58b8a68cdeb9743e80352f8ee853f1ed4ef6d`): 24 rows, 19 auto, 19 executed from the archive, 0 typed. `docs/mcp/Tool-Specs.md` was regenerated.

Before that commit, these were green:
- `s193-tool-truth --check` and `docs:check`;
- the ledger's readers: tool-truth 31 (with the s202 block), tool-specs 19, portable-claims 11, the doc-retirement gate, the Sprint 194 and 195 closeout readers and the release-limit reader (5 files, 79 tests), and root forge-claims and how-forge-works (2 files, 26 tests).

## Five-suite capture (#1833)

One numbered run at the capture head `74abd729f`, through `capture-s185-m01-baseline.mjs`: install `--frozen-lockfile`, the token, package and publishable-package builds, then the five suites serially with `maxWorkers=1` and a 60 s test timeout. It ran 2026-09-15T23:17:03Z → 23:59:11Z. **Status: passed**, with all 14 cleanliness checkpoints clean.

The five counts, stated separately:

| Suite | Status | Passed | Failed | Skipped | Failed files | Uncollected |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| viz-core | passed | 1,546 | 0 | 0 | 0 | 0 |
| viz-render | passed | 72 | 0 | 0 | 0 | 0 |
| mcp-server | passed | 7,181 | 0 | 16 | 0 | 0 |
| root-core | passed | 7,565 | 0 | 16 | 0 | 0 |
| component-packages | passed | 1,485 | 0 | 0 | 0 | 0 |
| **Total** | **passed** | **17,849** | **0** | **32** | **0** | **0** |

The 32 skipped executions are the same 16 optional external Stage1 cases, collected by both the MCP and the root suite. The raw Vitest JSON per suite is under `capture/forge-s202-m06-head/run-1/`, the harness log in `capture/capture.log` and the accounting in `capture/head-accounting.json`.

**The first capture is retained beside it**, at `capture/attempt-1-56d54d8cc/`: 17,847 passed, 2 failed, 32 skipped, 2 failed files, 0 uncollected, every checkpoint clean. It failed on the two root-core expectations under **Pins moved in m06** below, which m01's producer change had left behind. Those pins moved at `74abd729f`, and this capture ran there.

## Censuses (`closeout/censuses.json`, `closeout/runtime-census.json`)

Measured at `74abd729f` by `closeout/census.mjs` and `closeout/runtime-census.ts`.

- **Runtime.** The canonical roster is 18 objects / 240 cells. The registry carries m01's re-sweep (240/240 pass, run `07270109-60fb-49ad-aea8-667036fa5e9b`, registry head `e3a66b108`), and 214 cells' generation hashes moved from the base, each attributed in the golden ledger. The generation census re-composed and re-generated every row at this head: **240 compared, 240 equal, 0 unequal**. The release ledger is 42 cells, written only by a bundle-mode sweep, and did not move.
- **Components.** 110 identities / 1,320 theme cells; Sprint 200 m02's measurement stands. No component identity changed this sprint. `packages/component-styles/src` changed in 1 file, the placed chart's figure, for the narrow render's container query (m01), carried by the m01 after receipts.
- **Viz.** 13 types / 78 render scopes / 23 patterns. No viz registry moved from the base: the recipes, patterns, taxonomy and classification registries and the certified matrix are byte-identical, and the pattern registry and the matrix are must-not-move pins.
- **Tools.** The ledger is in mode `s202`, bound to the frozen bundle's E2E: 24 rows, 19 auto with **19 executed from the archive and 0 typed**, 5 on-demand at contract tier.
- **Bundle.** 315 packages in the closure, 20,947 payload entries, the archive 55,909,250 bytes (sha256 `d3149334…`) at `99f3d501d`, `dirty: false`. The preview app resource inside it is 2,105,938 bytes at revision `87de86c9408e`.
- **Golden ledger.** 215 entries, all m01's.

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-202/golden-ledger.json` holds 215 entries, all appended by m01: 214 runtime-cell generation hashes and the registry head.
- m02–m06 moved no golden pin.
- The three must-not-move files are byte-identical to the base: the viz pattern registry, the certified matrix and the Sprint 196 package-shape baseline.
- `check` passed at every mission.
- The sealed Sprint 195–201 receipts are byte-identical to the base `04182b116`.

## Pins moved in m06

- **`packages/mcp-server/test/contracts/chart-gate.s199.spec.ts`:** the gate's receipt boundary is now Sprint 202. Sprint 201 joins the sealed sprints the gate refuses, and the escape cases name `sprint-202`.
- **`packages/mcp-server/test/contracts/tool-truth.s193.spec.ts`:** gains a mode `s202` block covering the frozen bundle's receipt, nothing typed and the MCP Apps section of the E2E. No existing expectation changed.

- **`tests/codegen/react-emitter.test.ts`:** a multi-screen standalone emission is one page, so its screens sit in the `<main data-oods-shell>` landmark named after the first screen, where the fragment used to be.
- **`tests/verification/generated-docs-ci.s196.test.ts`:** the pattern census observations that `docs:check` names are Sprint 202 m01's, where the test still named Sprint 199's.

The last two are m01's producer change catching up with the one suite part A does not run. The first capture found them, and it is retained as attempt 1.

## Advertised diff

`closeout/advertised-diff.json`: 12 commits from `04182b116` (planning 1, m01 2, m02 1, m03 1, m04 1, m05 2, m06 4), 4,846 changed paths, of which 4,653 belong to m01 — its before and after receipts, the placed-chart migration and the 240-cell re-sweep. 24 paths are advertised surface, each attributed to its commits:

- **The tool surface:** the `design.preview` input and output schemas, `viz.render`'s input schema, the error registry, the tool descriptions, the tool capability ledger and the runtime-cell registry.
- **The adapter's protocol surface:** `packages/mcp-adapter/index.js` and `packages/mcp-adapter/mcp-apps.js`.
- **Docs and claims:** `docs/api/design-preview.md`, `docs/api/viz-render.md`, `docs/api/README.md`, `docs/mcp/Tool-Specs.md`, `docs/runtime/install.md`, `docs/runtime/portable-runtime.md`, `README.md` and `CHANGELOG.md`.
- **The install path:** `scripts/runtime/client-configs.mjs` and the three `configs/agents/*.stdio-mcp.json` snippets.
- **Manifests and notices:** the root and bridge `package.json`, and `THIRD-PARTY-NOTICES.md`.

Paths by mission: planning 3 · m01 4,653 · m02 27 · m03 30 · m04 45 · m05 24 · m06 93.

## Roadmap

Only the top part of `cmos/foundational-docs/roadmap/near.md` changed:
- the §3 row D and the §7 Sprint 202 header read BUILT, REVIEW PENDING;
- a built paragraph gives the mission summary and the census counts.

The retained record below the divider is byte-identical, checked before part A, and the near.md-reading specs passed in part A.

## Handoff

`closeout/handoff.md` (`builderSelfCertified: false`) gives the heads, the receipts index, the verified scope, the test accounting and the carries. `closeout/pull-request.json` records PR #119 against `OODS-pro`.

Not done here, by rule: no release, tag, notices, PM2 restart or primary-checkout build. Delivery and the Claude Desktop and Cursor runs belong to the review.
