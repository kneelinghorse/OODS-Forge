# Sprint 196 m01 delivery and preflight

The primary bridge serves `91c1f5f2bbf2027cbc6768ef04c880f191671c73`, the
merged Sprint 195 closure PR #102. Its tree is identical to certified closure
`1d100e20` (`baf7909b2a6c5bcccd60162568515273a60ae7a6`). The Sprint 196
implementation remains isolated in `codex/sprint-196-release-proof`.

## Delivery evidence

- `build-results.json` and the corresponding logs retain successful checkout,
  frozen install, token/package/bridge builds, and `pkg:build`.
- `before.json`, `after-restart.json`, and `final.json` retain the revision,
  process metadata without environment values, built-file hashes, and all 17
  saved-store file hashes. The store and structured-data manifest hash are
  unchanged. The primary's pre-existing untracked Sprint 190 delivery directory
  is unchanged.
- `backup.json` names the private rollback backup outside Git. `rollback.sh`
  defaults to a read-only preflight; its successful check is retained in
  `rollback-check.log`. The backup contains 851 prior compiled files and a
  private PM2 dump; the dump is not included in these receipts.
- `bridge-proofs.ts`, `bridge-proofs.log`, the wire request/response receipts,
  and `behavior-summary.json` prove the served revision, 19 advertised tools,
  tool ledger 24/19, runtime 154/154 at `39deb793`, viz classification counts,
  109 complete React and Vue catalog rows, exact line/pattern/HC hashes,
  declared HC paints, treemap operand certification, and byte-identical
  Invoice/detail React bar SVG against the Sprint 195 placement golden.

## Mission state

Delivery, live behavior, and the closeout path replay passed. The updated
auditor checked 28 literal criteria, 15 executions, and 1,664 frozen paths at
execution `6e779776` / review `ca3444ac`. The unchanged producer's `--check`
preserved all three canonical output hashes. The old auditor reproduced the
Unicode failure; `path/verification.json` retains both executions and the
command-local patch representation detail. The five focused contract files
passed 92 tests with zero skips.

Implementation is frozen at `6e66d3f7` in draft PR #103. The hosted
`portable-runtime` job passed, including the explicit fixture proof (one test,
zero skips). Run `34674083968`, job `103500676755`, and its raw log are retained
under `ci/`; the remaining workflow jobs were still running at this checkpoint.
The user authorized the three notices on 2026-09-12. Exactly three were sent;
`notices-delivered.json` retains request hashes, message IDs and server readbacks
whose bodies match the frozen plan byte-for-byte. All mission criteria passed.
Sprint 196 remains uncertified; `builderSelfCertified:false`.

The CI discovery premise in planning was too strong: existing root and package
globs already include `portable-fixtures.s194.spec.ts`. The new explicit step
in the portable-runtime job makes that proof directly visible before bundle
assembly. Local and hosted proof each passed one test with zero skips; see
`ci/github-verification.json` and `ci/README.md`.
