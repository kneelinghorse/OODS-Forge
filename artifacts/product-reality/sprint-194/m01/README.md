# s194-m01 — Sprint 193 delivery and independent CI budgets

Primary checkout delivered `1f69c957f4435a0a2f18b168b684de050f7a5f22` from
`c098237f1a1d026df4f1ad5c0ca51b15ebab0f4d`. `origin/OODS-pro` remained at PR #98;
PR #99 had not landed. Sprint worktree started clean at `06a42b77`.

Frozen install, token build, package builds, bridge build, pkg build, PM2 restart
and save all exited 0 (`build-results.json`). The before/after observations and
`verification.json` prove the delivered revision and 21 tools, the served runtime
ledger 154/154/0/0 at `871e5acf`, 27 tool ledger entries, all 17 saved-store hashes
unchanged, and the existing primary sprint-190/delivery folder byte-identical.
The structured-data manifest moved from `7509e0524017f0f162788fbee510369f5b2c7a86f9d3bd408b48dfe7fb0b4fc3`
to `993644cc01a5f150ea42d2882a953577a0066a6cecb3f74032e1877d6e4e620d`.

`bridge-proofs.ts` validates all 109 catalog rows in React and Vue as
implemented-evidence-complete with zero unverified cells, the A/dark line SVG
hash against the Sprint 191 matrix, and a Subscription/workflow React artifact
with a B/dark shell. Raw requests/responses and `behavior-summary.json` are retained.
The private rollback location is recorded in `backup.json`; all 855 prior
compiled-file hashes passed `rollback.sh --check`. Rollback was not executed.

The three requests in sprint-193/m07/reconnect-plan.json were sent byte-identical;
the request hashes and returned message IDs are in send-01.json through send-03.json.
Server readback verified body, summary and type (`send-readback.json`). IDs:

- cmos-dashboard: `d6872f32-9fea-4814-9a12-9419a1a37c45`
- forge-demos: `6ec928a3-480c-4955-99de-9f9177c4fd09`
- aquex-mcp: `dc149996-b40a-45a6-a04d-a30dfb8b292d`

`db8d24d2` splits CI into `coverage` and `product-reality-consumers`, each with
30 minutes and the same setup/pretest. `test:coverage` expands to the identical
four-command sequence at the base; no test, assertion, or test timeout changed
(`ci-split-verification.json`). The separate commit establishes the CI control
boundary before any tool behavior changes (CMOS decision #1917).

First branch CI: https://github.com/kneelinghorse/OODS-Forge/actions/runs/34611318976
at `db8d24d200c0ee888900359fb3a9f1c257206ca5`, explicitly dispatched because feature
branch pushes do not trigger CI before a PR exists. The consumer job passed in 16m58s (24 files, 314 tests, zero skipped). Root
coverage finished in 14m30s with 6512 passed, 3 failed, 16 skipped: two stale CI
carrier pins and one historical Sprint 193 proof comparing against current HEAD.
The corresponding pins are corrected without dropping their assertions; the
17 targeted tests now pass (pin-corrections-final.log). The initial local correction
attempt used an earlier, non-descendant negative control and failed the ancestry
guard; the final control uses the real later db8d24d2 changes and verifies their
detection. First-run logs and job metadata are retained. Corrected run
https://github.com/kneelinghorse/OODS-Forge/actions/runs/34613172617 completed its required split-job checks at `1763a1da5d7449b8a87ce48bc02e40ffc00b6ecd`. Both required jobs
passed under 20 minutes: coverage 14m20s (job 103308772348; 6515 passed, 16 existing skips),
product-reality-consumers 18m33s (job 103308772623). `ci-results.json` validates both
complete job durations including setup and build. The first run was not green;
its three missed pins were corrected and the failed attempts remain retained.
The dispatch also enabled the unchanged, opt-in ECharts resource soak: job
103302260594 failed its plateau lower-confidence-bound assertion (2101.844966 > 0,
s179 spec line 283). Its raw failure log is retained in ci-soak-failure.log; this
is separate from the split-job result and is not silently counted as passing.
The second dispatch reproduced the same failure at +1778.847992 B/window
(job 103308772170, ci-soak-attempt-2.log). The carrier remains unchanged and
parked per the standing checklist/decision #1606; no threshold was relaxed.

No five-suite capture was run. Build session: PS-2026-09-11-005.
