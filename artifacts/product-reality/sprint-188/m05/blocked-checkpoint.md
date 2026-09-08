# s188-m05 — implemented surfaces, placement-blocked checkpoint

**Mission 5 is not complete.** Mission 4 completed at `8561d83c` under decision 1822. Its two composer mechanisms are extended here only by adding five IDs to `compose/trait-recipes.json`; no further composer patch has been applied. The current mission expressly forbids further composer changes. Two additional placement faults prevent its required public workflow and fresh-screen proof.

## Implemented and verified

- CycleProgressCard, PaymentTimeline, PaymentEventTimeline, BillingCardMeta and ArchivedRowOverlay have contracts, shared scenarios, prop-value contracts, HTML/React/Vue implementations and governed root exports, token styles and six-class target readiness. The payment IDs remain distinct public components over one shared target primitive and common chronological value logic.
- Cycle values use explicit progress or date-derived progress against an injected `now`; an ended period overrides stale progress with 100% and zero remaining days. Missing values have named unavailable text. Payment dates display in UTC order; missing next/last values use `No payment scheduled` / `No previous payment`. The detail ID additionally renders the payment method. Card formatting preserves zero and integer minor units including JPY/1. Archived content is dimmed, badged and accessible; active children have no archive announcement or dimming.
- `react-tests.log` and `vue-tests.log`: **83 passing tests each**, no failures/skips. These include all 72 shared scenarios plus the coverage guard, seven focused value/chronology/archive tests and package contracts.
- `parity.json`: **13 computed HTML/React/Vue cases**, visible text, accessible names, progress, timestamps and archive attributes, empty difference allowlist, zero differences. `parity-tests.log`: 13 passing parity/type/export-cell tests.
- `export-bites/mutation-manifest.json`: **10 physical root-export deletions**, each with only the selected family/target cell red, other nine green, all ten restored, source byte-identical after restoration. Existing Sprint 185 runner, no replacement proof framework.
- `styles-tests.log`: eight passing style contract tests. The style inventory now includes all eight billing/archive rows; this also fixes the three M04 CSS rows missing from that inventory. Real data selectors consume shared token values.
- `contract-tests.log`: 102 passing tests in eight files, including the frozen historical fold. The baseline, intake, reconciliation, closeout and foundation records are unchanged.
- Discovery now projects the original **14 nucleus rows / 28 targets** only from the independently approved foundation-v1 cells and agreeing Sprint 182 closeout surfaces. Incomplete/unapproved evidence cannot promote a row, and unrelated rows retain their baseline state. Current recipe surfaces derive from current readiness as in M04. `refresh-tests.log`: **21 Python tests passed**. This checkpoint refresh does not claim packed generated-consumer evidence for the five new rows.
- Bridge `/health.revision` reads a build-time stamp with the git commit and exact structured-data manifest SHA-256. Both server and bridge builds generate the same stamp. A missing stamp leaves the typed optional field absent; a malformed stamp fails loudly. `bridge-tests.log`: **nine passing tests**, including four revision cases. `catalog-health-receipt.json` records HTTP 200 from a temporary worktree bridge, matching stamps, the 14 rebuilt catalog rows and five unchanged frozen-source hash pairs. The serving primary/PM2 bridge was not touched.
- The workflow emitter carries the authored archive label into governed Tabs and applies ArchivedRowOverlay to each actual record. `archive-workflow-fixture-tests.log`: **two strict React/Vue application typechecks** using an explicitly isolated fixture (the current valid list plus the prior valid M04 detail/form/timeline). This is not the public M05 workflow proof, and no full browser flow is claimed for it.

## Blocking proof

`baseline-schemas.json` captures the M04 head before changes. `current-schemas.json` captures all 66 current screens plus Subscription/workflow. `initial-generation.log` runs all 134 artifact cells: four fail, namely Subscription/detail and Subscription/workflow in both frameworks. The timeline artifacts generate, but omit their required PaymentEventTimeline. Therefore neither the artifact count alone nor the component tests satisfy the mission.

`billing-placement.s188.spec.ts` / `placement-guards.log` record **four passing and two failing tests**, with no skipped tests. Product's six generic contexts never select any of the five recipes. The 61 schemas outside the five declared changes remain identical. Subscription list/card placement tests pass. Detail and timeline placement obligations fail:

1. **CycleProgressCard is erased after explicit placement.** `applyPatternGroupWrappers` in `design.compose.ts` treats its tab slot as the detected status-timeline pattern, changes the node to Stack, retains the cycle's four field props and creates generic status children. The resulting Stack has unsupported progressField/periodStartField/periodEndField/intervalField props, so generation correctly fails OODS-V007. PaymentTimeline itself is placed correctly in the other detail tab.
2. **PaymentEventTimeline cannot find a timeline slot.** The trait declares the default main position. The timeline template supplies entry-N slots, but the existing position heuristic has no matching route. `placement-diagnostics.json` retains the public warnings/selections. Excluding recipes from generic selection does not repair this explicit placement path.

## Prepared patch, not applied

`proposed-trait-placement-preservation.patch` is a concrete two-site amendment that passes `git apply --check`:

- Do not overwrite a declared trait recipe during the later generic pattern-group pass.
- When a declared recipe in main position has no normal slot match, allow it to use the first entry-N timeline slot.

Both guards reuse the existing `isTraitRecipe` declaration. They would leave generic components' placement behavior unchanged. The patch has **not** been applied or functionally tested; the two red placement assertions are intentionally retained. These are additional composer behaviors beyond the explicit m04/m05 amendment, so user approval to amend that constraint is pending.

## Resume after the scope decision

If approved, apply the prepared patch; prove an exact per-schema census diff with every new placement attributed to object/context/trait/parameter; rerun the actual public workflow and strict app tests. Update the existing M03 browser observer to navigate the new governed archive Tabs (the old observer expects the former Archived/Show active toggle), assert actual archived-row opacity/accessibility and cycle/payment mounts, then run the full packed fresh and application proofs with the Linux Playwright endpoint. Refresh discovery with the passing consumer evidence and rebuild stamps at the mission head. Inspect screenshots and retain craft carries before completing M05. M06's final capture, frozen census, PR and independent-review packet remain queued.

No full-suite capture, final census claim, saved-store write, deployment or self-certification occurred here. Sprint remains Active.
