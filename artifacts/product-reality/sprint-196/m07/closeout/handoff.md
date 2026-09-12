# Sprint 196 — BUILT, REVIEW PENDING

All seven implementation missions are built and verified; independent review remains required. `builderSelfCertified:false`. The release proof now exercises consumer code from the portable archive, carries the bridge and readiness inputs, checks published claims against executable sources, and renders temporal charts in UTC.

[Draft PR #103](https://github.com/kneelinghorse/OODS-Forge/pull/103) targets `OODS-pro`. The [Gate-2 packet](../../../../../cmos/planning/forge-gate2-decision-packet.md) is prepared for Derek. Publication, candidate delivery, classification and application craft approval remain pending.

## Frozen identities

| Role | Exact commit |
| --- | --- |
| Certified advertised-diff base | `1d100e20bcc0911031192406625357638adecbe5` |
| Delivered primary, tree equal to certified base | `91c1f5f2bbf2027cbc6768ef04c880f191671c73` |
| Implementation and runtime/release measurement A | `794084bf34dabab4d8218ccb2a32e2ec81f10d51` |
| Ledger carry, five-suite capture and final archives B | `63efd098cc1def448014a1da09d64394dd3dfaf7` |
| Preliminary accounting review | `751fe32ed3e50c9af32fc7feb74ce5edb1bb4dd9` |
| First real closeout check inputs C0 | `816f0698cfb16a3db3d0afff8986f64042e5a56e` |
| Final closeout input review C1 | `0c98d6e81bd44c29c58a4fe027587751b042e915` |
| Hosted CI actual checkout | `43b5f5b041319f02a93c4988661d263c40856822` |

Only the two canonical runtime/release ledgers and the explicit `near.md` update changed public inputs from A to B. Post-B commits add admitted evidence only. [Head relations](head-relations.json) and [final delivery verification](delivery-verification.json) retain that distinction. The output commit containing this handoff is separate from C1; outputs do not claim to have tested their own future commit.

## Closeout verification

The final producer, producer `--check`, and independent auditor passed with execution B and input review C1. [Final command receipts](final-execution.json), [claim ledger](claim-ledger.json), [review handoff](review-handoff.json), [suite accounting](suite-accounting.json), and [audit output](audit/audit.json) retain exact commands, hashes and outcomes. All 26 literal mission criteria are bound; no criterion remains unproven. The auditor is an independent implementation of the verification rules; this pass does not replace the separately required reviewer.

Decision 1976 allowed only a provisional first-check bootstrap for m07 criterion 2. [Original bootstrap](bootstrap/manifest.json) and its actual command receipts remain immutable. The final manifest removes that provisional qualification and binds those successful receipts. Decision 1975 governs A → B → evidence ordering; it supersedes the older preparation plan's nonexistent A-hosted-CI step. No A hosted CI is claimed.

## Test and runtime evidence

The [single five-suite capture](../five-suite-closeout/four-suite-baseline.json) passed on its first attempt, with zero retries and zero failures. These suites overlap; counts must not be summed into a distinct-test total.

| Suite | Passed | Skipped |
| --- | ---: | ---: |
| viz-core | 1,511 | 0 |
| viz-render | 69 | 0 |
| MCP | 6,804 | 16 |
| root-core | 7,086 | 16 |
| component packages | 1,434 | 0 |

The exact 16 skipped identities in MCP and root are unchanged versus the actual Sprint 195 capture at `6e779776a7efa3b6e7b26a12966f0c4186dba1d6`. Formal accounting retains additions and removals separately: 59 file/suite population changes across 36 unique files, zero unattributed changes. The advertised implementation diff has 270 paths and 782 hunks with zero unattributed paths or lineage exceptions; [mover verification](../movers/actual-attribution-verification.json) records the literal scope, including `packages/mcp-adapter/test-s196-native-errors.js` under the frozen filename filter.

At A, [canonical runtime](../runtime/verification.json) passed 154/154, with separate dashboard 4/4 and chart-theme 48/48 populations. [Extracted release](../release-runtime/verification.json) passed 42/42: Organization, Subscription and User × seven contexts × React/Vue. All 42 generated artifacts match the host artifact hashes for the exact retained requests. Runtime and release gates passed 21 and 26 tests respectively, without skips. Negative emitter checks and restoration receipts are retained.

Current censuses retain 77 compositions/154 generation results, 78 visualization rows, 84 pattern cells, 34 taxonomy identities, 109 governed components and 19 advertised product-reality tools. The historical component theme/axe evidence retains its original Sprint 195 execution identity; source retention was rechecked, with no new component gallery claim. All 17 primary saved-store hashes remain unchanged.

The [pre-freeze record](../pre-freeze/report.json) and its qualification files preserve initial failures, corrected reruns and exact execution scopes. Raw generated-source/log whitespace is retained verbatim; source-only whitespace checks passed. This handoff does not claim that every raw evidence file passes `git diff --check`.

## Archives and hosted CI

The original A measurement archive is 32,480,913 bytes, SHA-256 `4dba1e35f383e0463822f35def30f090a9cc9c800aa080196882fa4903b96885`. Two clean B assemblies are byte-identical at 32,480,913 bytes, SHA-256 `4eaf71866905c828775799a819ce2735500b2d0f77c45f21d7ba0806f2cca128`. [Final archive verification](../final-archive/verification.json), original detached manifests, embedded attestations and SBOMs preserve the relationships. The final B archive serves the measured A release identity; no self-referential archive hash is invented.

Local Node 20.11.1 and 24.6.0 E2Es passed, each executing 17 advertised tools with two explicit typed dependencies: `brand.apply` OODS-N020 and `design.preview` OODS-N019. They include bridge health/tool/run parity and extraction lifecycle checks. The archive contains 13 runtime packages and a 283-package third-party closure. Original binaries are retained outside Git under `/Users/systemsystems/.codex/artifacts/forge/sprint-196/measurement-794084bf/` and `/Users/systemsystems/.codex/artifacts/forge/sprint-196/final-63efd098/`.

[Hosted CI run 34685313203](https://github.com/kneelinghorse/OODS-Forge/actions/runs/34685313203) succeeded. Its [full inventory](../ci/jobs-final.json) records 20 successful jobs and one optional soak skipped. All nine required proof jobs passed. `vr-test` reports job success, but its absent Chromatic token caused the visual-regression steps to be skipped; there was no checkout or visual-regression execution for that job.

The API source head is B. Nineteen actual checkout logs name merge `43b5f5b0…`; [independent Git/log verification](ci-checkout-verification.json) proves its complete tree equals B and preserves the other two jobs' non-execution qualifications. CI coverage passed 7,132 tests with 16 skips; its command and population differ from local root-core 7,086, and neither run is relabeled. Hosted runtime passed 154/154 + dashboard 4/4 + chart-theme 48/48; release passed 42/42. CI Node 20.11.1 and 24.20.0 E2Es passed. The original CI archives have their own hashes and sizes; cross-job and local/CI identities are not claimed equal. Full downloaded artifacts remain in the durable paths recorded by [CI verification](../ci/verification.json).

## Delivery, notices and remaining decisions

M01 delivered the certified Sprint 195 tree and sent exactly the [three authorized notices](../../m01/notices-delivered.json), retaining request bytes and readback receipts. [Primary retention](primary-retention.json) confirms that source and all 17 saved-store files remain unchanged. Sprint 196 delivery is pending. Its [three reconnect notices](reconnect/notice-plan.json) are prepared unsent, with candidate B and measurement A named explicitly.

The [generated review handoff](review-handoff.json) preserves outstanding rendering and certification limits: classification/craft approval; authoring-only patterns and typed profile gaps; nine chart HC deferrals; ECharts matching-operand requirements and the measured bubble-accuracy failure; Tabs normalization limits; and strict-soak retention certification. Gate 2 remains proposed, with active constraint 7 and archived constraint 5 unchanged. Only root `private:true` was authorized as publish-shape hygiene; no release was published or tagged.

To reproduce the closeout, use the commands and exact B/C1 inputs in [final command receipts](final-execution.json). The final evidence-only push may trigger another CI run; the bound full green run remains the original B run, with post-B source equivalence recorded separately.
