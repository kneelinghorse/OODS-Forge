# Sprint 182 M04 mutation evidence

Date: 2026-09-04
Mission: `s182-m04`
Review head: `e9915292c108b686d57623bc9bcfb84621a0ce23`
Result: passed

## Protocol

`scripts/product-reality/capture-s182-m04-gates.mjs` required the primary checkout to be clean and exactly at the 40-hex review head. Each mutation leg used a new detached worktree, a frozen install and dependency-first build, the manifest's literal selector, one discriminating mutation, byte restoration, the literal restore command, lockfile and carrier hash checks, and final tracked cleanliness. All seven worktrees were removed before the all-or-nothing publication step.

Each primary evidence leaf contains exactly `mutation.patch`, `pre-green.log`, `selected-red.log`, `restored-green.log`, and `receipt.json`. B-12 and B-13 additionally retain their required verifier-red trees and one canonical 29-file verifier-green tree per gate.

## Results

| Bite / leg | Pre | Mutated | Restored | Selected skips in all phases | Receipt SHA-256 |
| --- | --- | --- | --- | --- | --- |
| B-11 | 1 passed / 0 failed | 0 passed / 1 failed | 1 passed / 0 failed | 0 | `5b4d2da0b9cdc9ba395089bd88b10fafe96ed51ef3a2f025474763a4501f8604` |
| B-12 missing tarball | 1 / 0 | 0 / 1 | 1 / 0 | 0 | `27ab73e70058477322e237ff1d67b6ea9e1cba2dd9d5724dee21d56765301939` |
| B-12 missing root export | 1 / 0 | 0 / 1 | 1 / 0 | 0 | `6df590ec848caaab904b71dd5da938a5b820f989a7f18d0dacf19e73fe8486ff` |
| B-13 missing dependency | 1 / 0 | 0 / 1 | 1 / 0 | 0 | `85dea5afcf30286a0cffcccfe0e3c5d1a8c0980925dbb05530d17c09f1f1111d` |
| B-13 missing CSS export | 1 / 0 | 0 / 1 | 1 / 0 | 0 | `9d7952199edf8ca766650dc798a724cb6ec155646e491f77f6a1147fd40e0b07` |
| B-14 | 1 / 0 | 0 / 1 | 1 / 0 | 0 | `241b6b0b5f7073153b78c05c7d0769f0d493265d3a2d4acc5b6581380faad819` |
| B-15 | 1 / 0 | 0 / 1 | 1 / 0 | 0 | `819d7979aa3620cf93d240c0b0661d9db71cf9f07c5504e347648ecc362da512` |

Observed red conditions were specific to the locked control:

- B-11 restored warning-only emission and violated the exact empty-source `OODS-N015` contract.
- B-12 omitted the React tarball or its packed root export, breaking isolated install/import.
- B-13 removed the React shared-style dependency or the shared CSS export, breaking package verification and the clean production consumer.
- B-14 added invocation-varying emitted bytes, breaking repeated source/evidence determinism.
- B-15 swallowed the codegen-stage target error, breaking stage/error propagation.

## Package verifier evidence

The B-12 missing-root-export verifier-red run selected 4, passed 3, failed 1, skipped 0, and reported the exact missing root export. Both B-13 verifier-red runs selected 4, passed 3, failed 1, skipped 0, and reported the exact missing dependency/bare import or missing CSS export.

The restored B-12 and B-13 reports are byte-identical at `7bdf90c996d565f177e947f36a64a2eeb498c8b5cea9ac725f6ba2bb469cc4cb`, each with selected 4 / passed 4 / failed 0 / skipped 0. Their deterministic tree digest, excluding inherently variable package logs, is `279b53e5b4e50d2f74829333b3bcf9d92b35792e8fc9fa62b158f1784507a72c`. Each receipt inventories the complete selected 29-file canonical verifier-green tree; supporting verifier-red inventories are retained in the corresponding receipts.

Evidence roots:

- `artifacts/product-reality/sprint-182/gates/B-11/`
- `artifacts/product-reality/sprint-182/gates/B-12/`
- `artifacts/product-reality/sprint-182/gates/B-13/`
- `artifacts/product-reality/sprint-182/gates/B-14/`
- `artifacts/product-reality/sprint-182/gates/B-15/`
