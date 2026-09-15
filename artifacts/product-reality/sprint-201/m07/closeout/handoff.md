# Sprint 201 — built, review pending

Builder self-certified: **false**. Independent review and delivery remain separate; GitHub CI is off, so every gate below is a local command with its log in this tree.

Implementation head: `82f55f190` (the last product change, Sprint 201 m06). Pre-freeze head: `__PREFREEZE_HEAD__` (the roadmap row and the part A receipts). Part B receipts at `__PARTB_HEAD__` (the frozen bundle and its E2E). Capture head: `__CAPTURE_HEAD__`. Execution head: the tip of `codex/sprint-201-design-surface` that adds this handoff.

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

__VERIFIED_SCOPE__

## Test accounting

__CAPTURE__

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-201/golden-ledger.json`: __LEDGER__. `git diff --stat -- artifacts/product-reality/sprint-19[5-9] artifacts/product-reality/sprint-200` is empty at every commit of the sprint.

## Carries for the next sprint's m01

__CARRIES__

## Not done, by rule

No npm publish, no tag, no release, no consumer notices, no primary-checkout build or PM2 restart; the delivery (fast-forward the primary checkout, rebuild, PM2 restart, `/health`) belongs to the reviewing session. Sprint 202 (the preview inside the conversation as an MCP Apps resource) is planned separately.
