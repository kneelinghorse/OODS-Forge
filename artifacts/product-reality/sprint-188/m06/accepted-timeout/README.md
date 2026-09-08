# Sprint 188 M06 — accepted closeout and review handoff

BUILT, REVIEW PENDING. All 39 literal M01–M06 criteria are bound and passed the independent output audit. Sprint 188 remains Active, `builderSelfCertified:false`, `separateReviewRequired:true`. Usability and sprint certification remain for independent review.

This is the current entry point after decision **1830**. The earlier M06 README, `closeout/`, blocked submission, failed audit and both four-suite captures remain historical evidence unchanged. Current generated outputs are in [closeout-accepted](../closeout-accepted/review-handoff.json).

| Boundary | Actual commit |
| --- | --- |
| Sprint base | `cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076` |
| Corrected implementation and final app/census proof | `d0cf5fe0e040047cb0f566e6d57e825834fc8632` |
| Clean corrective four-suite execution | `3f0e9d136e12b81a8ee459b43d1c1fc4aa3c617e` |
| Untouched corrective capture evidence | `db63108da2a8b384119c17783702156db9767b23` |
| Submitted timeout proposal | `0f6891e3b4a8decb0626d49dbf6fa870bb712276` |
| Final frozen audit inputs and checker | `f19f8c4988dd335c16e1789e744d18d1fc0ddd90` |

The final input revision includes three bounded changes to the reused accounting/auditor scripts and one new approval regression spec. Captured runtime and original test sources remain unchanged. Executions retain their real source revisions and hashes, including earlier worktree inputs; the four-suite capture is not represented as having executed the later checker code.

The [ledger](../closeout-accepted/claim-ledger.json) binds six M06 criteria and 33 retained prior criteria. The [actual-output audit](../closeout-accepted/final-output-audit.json) independently checked **39 criteria, 26 executions and 1,201 frozen paths**. [Eight mutation controls](audit-controls-result.json) rejected altered claims, omitted historical criteria, relabeled executions, forged craft hashes, builder certification, a hidden failed count, a changed approval and a removed sprint-review follow-up. Restoring the original outputs passed again; no frozen evidence was mutated.

The [final supplemental regressions](commands/approval-tests-final.json) passed **124 tests**, including 44 scoped approval and saved-form checks. Root `pnpm typecheck` passed after the checker changes. [Integrity verification](final-integrity.json) confirms all **34 raw files** from both captures still match their external originals byte for byte, public runtime bytes are unchanged since the corrective execution, and the captured mover spec is unchanged.

| Corrective suite | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| viz-core | 1,390 | 0 | 0 |
| viz-render | 64 | 0 | 0 |
| mcp-server | 5,942 | 0 | 16 |
| root-core | 6,205 | **1** | 16 |

The failure remains an observed root mover-test timeout: 21,855 ms against a 20,000 ms limit. Decision 1830 accepts exactly this observation, supported by the unchanged seven-test isolated retry (7/7 passed; affected test about 1,094 ms), the passing server observation and named CI evidence. The [accounting](../closeout-accepted/suite-accounting.json) retains the failed count and every per-file delta; its passed status means valid accounting under the amended criterion, not zero test failures. The 16 skipped identities are the same pre-existing identities as Sprint 187. No other failure is excepted, and no third four-suite capture was run.

The corrected proof in [final-proof-corrected](../final-proof-corrected/fresh-census/report.json) records 66/66 schemas, 132/132 screen generation cells and two successful Subscription workflow cells. The original saved store is 15/16 with its exact known User-form errors retained; the successor is 16/16, and all 17 live adoption hashes are unchanged. The [app report](../final-proof-corrected/app-consumers/report.json) records 16 gates, 18 flows, 32 state observations and 36 screenshots across React and Vue. Layout measurements cover the 24 base screenshots; the 12 archive/payment screenshots have visual receipts without layout measurements. Review all screenshots and the [craft carries](../carries-corrected.json), including duplicate controls, raw fields/dates, empty cards/tabs, cancellation wrapping and archive badge wrapping. The 47 prose tests in 12 files passed at the corrected implementation head. The sprint-wide diff enumerates 9 canonical and 62 public paths.

[PR #86](https://github.com/kneelinghorse/OODS-Forge/pull/86) was merged by the user at 2026-09-08 19:48:00 UTC as `33a20d0e55079be394451dad33f699b0682c680d`, before these final audit changes were pushed. Its [CI run 34260143331](https://github.com/kneelinghorse/OODS-Forge/actions/runs/34260143331) completed successfully at proposal head `0f6891e3`: 15 jobs succeeded and the opt-in ECharts soak job was skipped. This CI observation predates the final audit changes. A follow-up PR on the same source branch carries this packet; its current CI observation belongs in that PR and the CMOS completion record. The earlier successful run 34256102496 remains the frozen CI input supporting decision 1830. Neither run is a claim that later commits have already passed remote CI.

The Sprint 189 [reconnect draft](../final-proof-corrected/reconnect/notice-plan.json) remains prepared and unsent. M01 delivery and its sent notices remain their original retained facts. No M06 delivery is inferred from the PR merge.

Sprint review must address timeout budgets, root-suite file concurrency, repeated Git-history scans and the capture/retry policy for next sprint, using the retained 21.855-second timeout and 1.094-second unchanged isolated retry. CMOS session `PS-2026-09-08-010` records this follow-up. Decision 1830 is an exact exception, not a standing waiver.
