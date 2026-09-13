# M01 CI gate accepted after merge

PR #108 merged at `bb579fd8de9df1494c16e3e7b0f69ed1789f0518` on 2026-09-13. Its tree equals the tested source head `a9a734edd9546cb2c861b08de193cea221993e2f` (empty git diff).

CI run [34782207325](https://github.com/kneelinghorse/OODS-Forge/actions/runs/34782207325) completed successfully: all five required jobs (a11y-contract, coverage, governance A/B, guardrails-check) passed. Twenty jobs passed; the existing optional echarts-render-soak job was skipped. Coverage: 647 files passed, one optional file skipped; 7,319 tests passed, zero failed, 16 optional Stage1 tests skipped (7,335 total). Job IDs, full results and raw coverage output are in `ci/acceptance.json`, `ci/accepted-run-34782207325.json`, and `ci/coverage-a9a734edd.log`.

The earlier pause and failing-run receipts remain historical evidence. This receipt resolves their pending CI gate; it does not change their results. A separate postmerge run does not replace this source-head attribution.

The isolated build branch was fast-forwarded to the verified merge commit before m02. The original advertised sprint diff remains based on `2ea59fe9c`. Primary checkout and services were untouched. Craft will continue on the same branch and require a new PR for the remainder because #108 is merged.

`builderSelfCertified: false`. M01 implementation and local verification are detailed in `README.md`; application craft certification remains with review.
