# Closeout evidence plan at frozen A

Status: preparation only. A is `794084bf34dabab4d8218ccb2a32e2ec81f10d51`; B and C do not yet exist. This plan never marks future runtime, capture, archive, CI or closeout verification as passed.

`manifest-source-plan.json` gives the exact 44 source keys consumed by the bounded producer, with no missing or extra keys. Existing source bytes are hashed as observations, while missing measurements remain pending. In particular, observing today's `near.md` does not satisfy the new exact Increment 15 heading requirement.

`criterion-bindings-plan.json` contains all 26 literal criteria. Its six historical execution records bind 56 selected files to their actual immutable receipt commits: m01 d0ae4bdf, m02 decba77c, m03 d1661992, m04 944f4dda, m05 8fd3d04d, and m06 2bae454a. Each record explicitly calls its head a **receipt commit**, while the raw files preserve their separate execution and implementation heads, including dirty states. The m07 criteria remain pending and identify the required future receipts.

`manifest-shape-audit.json` records the read-only checks performed during preparation. The retained mission verifier passes; the newly retained m07 visualization and pattern operands pass both existing closeout predicates; all 211 component input paths match the historical source keyset; the 56 historical binding files are byte-identical at their declared receipt commits. This did not render charts, run browser consumers or rebuild packages.

## Required before B and the full capture

These inputs must be complete and committed in B, because adding or editing their bare m07 paths after capture is not permitted:

- Runtime154, dashboard4, placement48 and emitted mutation/restore evidence under `runtime/`, including the exact canonical runtime ledger bytes.
- Release42 raw bundle/host operands, requests, reports, packages and validations under `release-runtime/`, including the exact canonical release ledger bytes. Both measured ledger heads remain A.
- Measurement archive metadata under `measurement-archive/`, recording clean A and its original archive SHA.
- Current component census, saved-original/saved-successor reports, schema-movement, saved-compatibility, viz and pattern census outputs, and `census-execution/` command receipts. These currently exist and their actual command receipts record A.
- `component-retention.json`, `component-proof.json`, `component-ledger.json`, `catalog-list-dist.json`, `health-dist.json`, `tool-proof.json`, and `taxonomy-census.json` from the current served component verifier after the two canonical ledgers exist.
- `golden-attribution.json`, the carried and checked m05 qualification produced by the existing accounting contract; it is not a new golden measurement.
- Existing `missions.json`, `mission-evidence.json`, pre-freeze receipts, this preparation evidence, and the source verifier helpers.
- Root-authored `m07/README.md`, the exact current roadmap heading and Gate2 link, and `m07/prose.json` with the actual static prose-check exit code. Root `README.md` stays unchanged.

## Required after B

The final envelope belongs at `closeout/manifest.json`; the actual A→B relation belongs at `closeout/head-relations.json`. Their B hashes cannot be invented before B exists. `closeout/` also holds prepared reconnect, provisional command receipts, and final derived outputs. The reconnect notice remains unsent and records candidate B plus measurement A.

The single five-suite capture runs at B and is imported under `five-suite-closeout/`. Final archive assembly also uses B before capture output import, with its metadata and E2E logs under `final-archive/`. Only `m07/e2e-node20.json` and `m07/e2e-node24.json` are admitted as bare post-B E2E files. Fresh CI evidence under `ci/` must retain the actual job/merge heads and prove source equivalence to B; historical CI cannot replace it.

Movers and line attribution under `movers/` cover the full base-to-B public range. The independent inventory includes both rename endpoints and excludes tests; its patch uses exact literal public paths. Existing authored `.py` helpers are not post-capture evidence exceptions.

For criterion m07/2, use the existing bounded two-stage closeout procedure: run a provisional derivation, producer `--check`, and independent audit against their actual frozen review0 head; retain successful command receipts under `closeout/bootstrap/`; then bind them in the final manifest. Do not use the final claim ledger as evidence for itself, relabel a review0 run as final C, or claim the pending commands already passed.

`manifest-source-plan.json` proposes `ci/verification.json` as the CI source and uses the root-confirmed `m07/prose.json` for prose. The final producer accepts repository-relative source paths through the source map, so changing a pending filename does not require a source change; it must still respect the admitted post-capture path rules.
