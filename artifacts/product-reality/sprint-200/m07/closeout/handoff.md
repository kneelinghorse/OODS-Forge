# Sprint 200 — built, review pending

Builder self-certified: **false**. Independent review and delivery remain separate; GitHub CI is off, so every gate below is a local command with its log in this tree.

Implementation head: `f8bef2a2bae3df74799643c3baf002c54e2253a6` (the last product change, Sprint 200 m06). Pre-freeze head: `136e678bf` (the roadmap row and the pre-freeze receipts). Execution head: `the tip of `codex/sprint-200-available` that adds this handoff; its parent `ea6180317` is the capture head` (this closeout's capture, censuses and handoff; no product file changes after `f8bef2a2b`). Draft release head: `723bc2195` (the archive's source commit; every product file at `f8bef2a2b` equals that head except the README, a test and receipts).

## The two actions only Derek takes at the review

1. Flip the repository `kneelinghorse/OODS-Forge` to public.
2. Confirm the license holder name (`configs/license/holder.json`: "Derek Niedringhaus", https://derekn.com; one line changes it everywhere through `node scripts/license/render-license.mjs`).

Then the review publishes the draft release `v0.1.0` (<https://github.com/kneelinghorse/OODS-Forge/releases/tag/untagged-22e97886042b6bc11e2a>, target `723bc2195`, archive sha256 `338dc780cf206df5082a1796bb44f696ec57b0c0b351841b6c3446c77b2f6aa9`, six assets, no tag until publish). The outside-individual ten-minute run after the flip is the Phase C exit measurement; it is not a Sprint 200 blocker (memo decision 11).

## Review these receipts

- [m01 capture and package safety](../../m01/README.md): the five-suite capture at the merged head and at the mission head, the consumer-install hardening, the five public-flagged packages made private under #2061.
- [m02 chrome pass](../../m02/README.md): before/after sheets, the 1,320-cell theme proof, the 240/240 runtime re-sweep, the three-layer hash attribution, the golden ledger.
- [m03 license and terms](../../m03/README.md): PolyForm Noncommercial 1.0.0 in six LICENSE files and 23 manifests from one holder source, COMMERCIAL.md with its one-line price, the agreement, the FAQ, the inbound grant, the license-shape spec.
- [m04 bundle and draft release](../../m04/README.md): THIRD-PARTY-NOTICES.md, the terms and the brand source in the archive, brand.apply from the bundle, the public runbook, the six alias exports retired, install.md from one template, the clean-HOME Claude Code proof, the draft release receipts (refreshed at m06).
- [m05 README and feedback path](../../m05/README.md): the newcomer README with generated counts, FEEDBACK.md, the issue templates, the rendered README.
- [m06 ten-minute proof](../../m06/README.md): three fresh-session runs (826 s, 665 s, 234 s install → see), the friction lists with the producer fix for each item, issues #113/#114/#115 filed through the template and closed with the fixes, the release refresh receipts, the Phase C exit note.
- [Pre-freeze pass](../pre-freeze/part-a-status.txt) and [part B](../pre-freeze/part-b-status.txt): every gate's log and exit code; [chart gate report](../pre-freeze/viz-gate/report.json); the frozen bundle's [manifest](../pre-freeze/portable-manifest.json) and [digest](../pre-freeze/portable-archive.sha256) with the E2E log.
- [Censuses](censuses.json), [runtime generation census](runtime-census.json), [advertised diff attributed by mission](advertised-diff.json), [golden ledger](../../golden-ledger.json).
- [Capture accounting](../capture/head-accounting.json) and the [raw five-suite capture](../capture/forge-s200-m07-head/four-suite-baseline.json).

## Verified scope

Manifests 23/23 on `PolyForm-Noncommercial-1.0.0`; LICENSE files 6/6 rendered for the holder from the canonical SPDX text; six alias exports gone; install steps for three clients from one template; the archive carries `LICENSE`, `COMMERCIAL.md`, `THIRD-PARTY-NOTICES.md` (283 packages) and the brand source; `brand.apply` executes from the bundle; the ledger's 24 rows (19 auto, 5 on-demand) bind to the E2E of the draft archive at `723bc2195` with one typed limit (`design.preview`, OODS-N019).

110 component identities and 1,320 framework/theme cells re-measured after the chrome pass (m02). Canonical runtime roster 18 objects / 240 cells; the generation census at the execution head re-generated every registry row and found all 240 hashes equal; retained composition roster 11 objects / 77 schemas / 154 cells, unchanged; the release ledger 42 cells over Organization, Subscription and User. Viz 13 types / 78 rendered and conformant scopes (26 HC), the four viz registries hash-identical to the Sprint 199 census, no chart golden moved; the golden ledger's 243 entries verified with every m02 pin moved once and 15 must-not-move files unchanged. Sealed Sprint 195–199 receipts byte-identical throughout.

The advertised diff from `c344b773a`: 11 commits (one planning, ten mission), 5,363 changed paths, 48 advertised-surface paths, each attributed to its mission commits (`closeout/advertised-diff.json`).

The ten-minute proof: three fresh-session runs from the draft release; the third completed install → compose → certify → generate → see in 234 s with every step passing first time; three issues filed through the template and closed with producer fixes; the outside-individual run after the flip is the Phase C exit measurement.

## Test accounting

One numbered run at the capture head `ea6180317` (`ea6180317`, the pre-freeze receipts commit), serial files (`maxWorkers=1`), a 60 s test timeout, suites sequential, every one of the 14 cleanliness checkpoints clean, 2026-09-15T00:52:18.808Z → 2026-09-15T01:24:07.204Z. **Status: passed.** The five counts, stated separately: **17,738 passed assertions, 0 failed assertions, 32 skipped, 0 failed files, 0 uncollected files** (17,770 executions; the 32 skips are the same 16 optional Stage1 cases collected by both MCP and root). No isolated rerun was needed; no second attempt.

| Suite | Status | Passed | Failed | Skipped | Failed files | Uncollected |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| viz-core | passed | 1,542 | 0 | 0 | 0 | 0 |
| viz-render | passed | 72 | 0 | 0 | 0 | 0 |
| mcp-server | passed | 7,131 | 0 | 16 | 0 | 0 |
| root-core | passed | 7,511 | 0 | 16 | 0 | 0 |
| component-packages | passed | 1,482 | 0 | 0 | 0 | 0 |

Raw Vitest JSON per suite under `capture/forge-s200-m07-head/run-1/`, the harness log in `capture/capture.log`, the accounting in `capture/head-accounting.json`.

## Carries for the next sprint's m01

- `design.preview` from the bundle (OODS-N019; Sprint 201's design surface).
- Craft residue recorded in m06: the preview document's placeholder convention and its `OODS Preview` title; the `header` slot of the Subscription detail screen resolving to `VizAreaPreview`; slot confidence versus candidate score sharing one name; the large `code.generate` and rendered-document payloads (an option to write the document to a file).
- The root Storybook does not load `@oods/component-styles/css`, so root stories of the re-exported primitives render without chrome (m02 residue).
- The outside-individual ten-minute run after the flip (the Phase C exit measurement).
- Stage1's license change is made from Stage1's repository.

## Not done, by rule

No npm publish, no `.mcpb`, no OCI image, no tag, no public flip by the builder, no consumer notices, no primary-checkout build; the delivery (fast-forward the primary checkout, rebuild, pm2 restart, /health) belongs to the reviewing session.
