# Sprint 201 — built, review pending

Builder self-certified: **false**. Independent review and delivery remain separate; GitHub CI is off, so every gate below is a local command with its log in this tree.

Implementation head: `82f55f190` (the last product change, Sprint 201 m06). Pre-freeze head: `c3d06b762` (the roadmap row and the part A receipts). Part B: the chart gate at `4e372aeed`, the frozen bundle and its E2E at `37fc2351b`, their receipts committed at `a6bd41b25`. Capture head: `a6bd41b25`. Execution head: the tip of `codex/sprint-201-design-surface` that adds this handoff.

## What was built

Every composition Forge produces opens in a browser as the generated React or Vue app actually running, served by the bridge and from the extracted bundle, at one URL per composition version, in either brand and any theme, with its measurements beside it; two versions side by side with what changed; edits in that view written back as new versions with lineage; and the residual craft list closed.

- [m01 the running-app preview from the bundle](../../m01/README.md): the preview host in `packages/mcp-bridge` (request-time esbuild and `@vue/compiler-sfc`, prebuilt runtimes), the adapter's lazy host, `design.preview` from the extracted archive (OODS-N019 retired for OODS-N021), the closure with the four esbuild binaries, the E2E from the archive 19 / 19 / 0.
- [m02 compositions with versions and lineage](../../m02/README.md): the composition store beside the schema store, `compositionId`/`version` on every `design.compose`, one URL per version with the lineage panel, brand, theme and width controls.
- [m03 side by side and what-changed](../../m03/README.md): `/compare`, the structural diff, `design.preview action:"compare"`.
- [m04 measurement beside the render](../../m04/README.md): the validation receipt, `artifact.certify` per placed chart and axe-core per framework, brand and theme, stored on the version and named on the panel.
- [m05 editing that writes back](../../m05/README.md): the four operations from the page and from `design.preview action:"edit"`, the override surface (region order, field order, seed), new versions with parent and operation.
- [m06 the craft list closed](../../m06/README.md): every `#2046` item, the sankey and Relationship graph titles, the root Storybook chrome and `payloadMode: "file"`, fixed at the producer with before/after receipts in both frameworks at 390/820/1440, one 240-cell runtime re-sweep and every moved chart pin attributed.

## Review these receipts

- [Pre-freeze part A](../pre-freeze/part-a-status.txt) and [part B](../pre-freeze/part-b-status.txt): every gate's log and exit code; [chart gate report](../pre-freeze/viz-gate/report.json); the frozen bundle's [manifest](../pre-freeze/portable-manifest.json), [digest](../pre-freeze/portable-archive.sha256) and [E2E log](../pre-freeze/portable-e2e.log).
- [Censuses](censuses.json), [runtime generation census](runtime-census.json), [advertised diff attributed by mission](advertised-diff.json), [golden ledger](../../golden-ledger.json).
- [Capture accounting](../capture/head-accounting.json) and the [raw five-suite capture](../capture/forge-s201-m07-head/).

## Verified scope

The frozen bundle `forge-runtime.tar.gz` at `37fc2351b`: sha256 `c4c51dc271b8fa3ec047d3570395622eabfce0d6debac231222eeedb099deffc`, 55,521,681 bytes, 315 packages in the production closure (the four esbuild binaries, `@vue/compiler-sfc`, react, react-dom, vue and axe-core added this sprint), 20,937 payload entries, terms and brand source aboard; the extracted-runtime E2E passed with all 19 advertised tools executed and 0 typed limits (`design.preview` compiled a Subscription detail composition to React and Vue through the adapter-started host on 127.0.0.1; the version recorded the bundle head). The tool ledger is in mode `s201`, bound to that E2E receipt (`pre-freeze/e2e-host.json`): 24 rows, 19 auto, 19 executed from the archive, 0 typed (OODS-N019 and OODS-N020 closed).

Canonical runtime roster 18 objects / 240 cells re-swept once in m06 (240/240 pass; 160 cells' generation hashes moved from the base, attributed); the generation census at the capture head re-composed and re-generated every registry row and found all 240 hashes equal. 110 component identities, 1,320 theme cells (Sprint 200 m02's measurement stands; this sprint changed one stylesheet rule, carried by the m06 screenshots). Viz 13 types / 78 rendered scopes; the recipes registry and the certified matrix moved once (sankey and force_graph, the two chart titles) with the pattern registry, taxonomy and classification byte-identical to the base.

The advertised diff from `c02f3ddcb`: 11 commits (one planning, six mission, four closeout), 6,744 changed paths (6,556 of them m06's before/after captures, runtime sweep and chart receipts), 33 advertised-surface paths (schemas, tool descriptions, registries, error registry, docs), each attributed to its commits (`closeout/advertised-diff.json`).

## Test accounting

One numbered run at the capture head `a6bd41b25` (the part B receipts commit), serial files (`maxWorkers=1`), a 60 s test timeout, suites sequential, every cleanliness checkpoint clean, 2026-09-15T08:50:53.705Z → 2026-09-15T09:11:18.600Z. **Status: passed.** The five counts stated separately:

| Suite | Status | Passed | Failed | Skipped | Failed files | Uncollected |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| viz-core | passed | 1,546 | 0 | 0 | 0 | 0 |
| viz-render | passed | 72 | 0 | 0 | 0 | 0 |
| mcp-server | passed | 7,153 | 0 | 16 | 0 | 0 |
| root-core | passed | 7,535 | 0 | 16 | 0 | 0 |
| component-packages | passed | 1,484 | 0 | 0 | 0 | 0 |
| **Total** | **passed** | **17,790** | **0** | **32** | **0** | **0** |

The 32 skipped executions are the same 16 optional external Stage1 cases collected by both MCP and root. Raw Vitest JSON per suite under `capture/forge-s201-m07-head/run-1/`, the harness log in `capture/capture.log`, the accounting in `capture/head-accounting.json`. An earlier four-suite attempt at the same head (not retained as a run) failed only on `tests/contracts/public-api.contract.test.ts`, which needs the publishable package the five-suite harness builds in its setup step.

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-201/golden-ledger.json`: 166 entries, every pin that moved this sprint attributed once (160 runtime cells and the sweep head in m06; the viz-recipes registry, the certified matrix, the preview-samples fixture, the ECharts option goldens and the network-fidelity golden for the two chart titles), 2 must-not-move files verified; the certified matrix moved from must-not-move to may-move-once in m06 with the decision recorded in CMOS. `git diff --stat -- artifacts/product-reality/sprint-19[5-9] artifacts/product-reality/sprint-200` is empty at every commit of the sprint.

## Carries for the next sprint's m01

- The placed Subscription area chart keeps its title inside the public SVG at 720×400 and scales to the column; at 390px its axis text is small. Moving placed-chart titles into the figure heading is a `chart-assets` change (m06 not-done note).
- axe-core findings the running pages report (landmark-one-main, page-has-heading-one, region) are stored per version and shown on the panel; they are measurements of the generated shell, not fixed this sprint (m04 note).
- Overriding a tab slot to `Card` composes a schema `code.generate` refuses with OODS-V007 (composer quirk noted in m03); the swap edit offers only the composer's own candidates, so the page never reaches it.
- Sprint 202: the same preview inside Claude and Cursor as an MCP Apps `ui://` resource (planned separately).
- Delivery of this head to the served bridge (fast-forward, install, build, PM2 restart, `/health`) belongs to the reviewing session, as does the near.md closure paragraph.

## Not done, by rule

No npm publish, no tag, no release, no consumer notices, no primary-checkout build or PM2 restart; the delivery (fast-forward the primary checkout, rebuild, PM2 restart, `/health`) belongs to the reviewing session. Sprint 202 (the preview inside the conversation as an MCP Apps resource) is planned separately.
