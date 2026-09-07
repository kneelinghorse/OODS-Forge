# Sprint 187 — PR #84 CI follow-up

Session `PS-2026-09-07-003`; decision #1811. The initial [PR #84](https://github.com/kneelinghorse/OODS-Forge/pull/84) CI run [34133038275](https://github.com/kneelinghorse/OODS-Forge/actions/runs/34133038275), at `083e82c1`, failed three jobs. The independent sprint review verified frozen local evidence but did not inspect that live CI run before closing the sprint. Remote PR acceptance must be established separately; the frozen review is not an all-CI-green claim.

## Causes and corrections

| Failed job | Observed failure | Correction |
|---|---|---|
| coverage | Two historical retention tests fail at `git ls-files` | Query only the audited sprint log paths, with NUL delimiters and explicit subprocess-error handling |
| viz-determinism | Its full server suite fails on the same two retention tests | Same correction; the visualization suites themselves were not the failing step |
| portable-runtime | Strict structured-data boundary expects 19 files; actual count is 21 | Account for the two approved September 7 component/token snapshots; keep exact equality and all other boundaries |

The whole-index query now emits more than 1 MiB. A local probe returned `ENOBUFS` even with exit status zero, explaining why status-only handling could miss the problem on Darwin. Scoping the query avoids unrelated repository growth; checking `error` prevents a subprocess failure from being accepted as a complete result. Git's explicit `:(glob)` syntax includes both top-level and nested logs.

The added regression builds a temporary Git index with 12,000 unrelated entries and more than 1 MiB of path output. Both auditors must still verify the tracked evidence log, then fail when that log is removed from the index while remaining on disk. The regression fails against the old code. The original missing/untracked assertions remain unchanged.

The only new assembly-boundary files are:

- `artifacts/structured-data/oods-components-2026-09-07.json`
- `artifacts/structured-data/oods-tokens-2026-09-07.json`

These are the accepted m05 refresh outputs already included in the original public diff. No file is excluded from packaging, and the clean-source, manifest, payload scan, archive determinism and extracted adapter E2E gates remain in place.

## Validation and provenance

The three affected spec files pass **21/21 tests, zero skips**, in both the server and root-core configurations. The local correction's first attempt omitted two top-level logs; the retained-file test caught that error, and the corrected explicit glob passes. The red regression deliberately selected one test and left six unrelated tests unselected; its skipped count is not a full-suite result.

[Failure and fix record](../../artifacts/product-reality/sprint-187/ci-followup/failure-and-fix.json) retains the original failed CI logs and local red/green receipts. Local portable-runtime validation is recorded alongside it. The local assembly is a development probe; the remote `portable-runtime` job performs the two clean `--final` assemblies, Linux determinism comparison and extracted adapter E2E.

The local development assembly passes with 245 third-party packages and 18,476 payload entries. The extracted adapter E2E passes: 20 exposed tools, nine calls across processes, successful rendering/certification and shutdown/restart, with the extracted tree unchanged. Its manifest correctly records `dirty:true` and Darwin `determinismCertified:false`; neither is presented as the clean Linux result.

The existing local review commit `da441f3e` and this correction are delivered on the same PR branch. Use the PR's checks for the pushed correction commit as the authoritative remote result; the original failed run remains historical evidence. No frozen m01–m06 receipt or original review measurement is overwritten or relabeled. Governed component/generation source is unchanged by this CI correction.
