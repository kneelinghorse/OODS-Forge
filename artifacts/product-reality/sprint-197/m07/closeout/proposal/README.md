# Proposed scoped readiness refresh

Status: prepared and tested in scratch; not approved or applied. `builderSelfCertified:false`.

The second full capture at `02d811f71a4f188142783edf0f9ea189590876c1` fails the same readiness assertion in MCP and root-core. The corrective commit changed root `package.json` to declare the existing esbuild build dependency and select the DTCG lint roots. The Sprint 196 readiness generator fingerprints the complete manifest, so its retained facts now have stale provenance. This is introduced by Sprint 197; the pre-freeze checks missed it.

`readiness.patch` changes exactly four fields in `artifacts/product-reality/sprint-196/m06/release-readiness-facts.json`: `/root/manifestSha256`, `/inputs/33/bytes`, `/inputs/33/sha256`, and `/inputsSha256`. The generated facts retain all publication, licensing, package-shape, and CI claims. The decision packet is byte-identical. The proposed generated file is retained here as `proposed-release-readiness-facts.json`; it is not installed at its canonical path.

Verification in scratch:

- The unchanged generator writes the proposed output and passes its own `--check`.
- All 22 existing readiness tests pass, with zero failures or skips (`scoped-tests.json` and `.log`).
- All 60 facts inputs and the generator and test source match the captured checkout byte-for-byte (`input-identity.json`).
- The only changed output fields are the four above (`proposal.json`); canonical facts still have SHA-256 `8fbfcb74551f8370ed52d4b10ddc55526cceba48a8ab0074f3e67192c6819f67`.

The proposed exception is to regenerate these four metadata fields, retain both failed full captures, and validate the unchanged readiness tests plus bounded closeout accounting and audit contracts. Accounting must keep the two failed executions and their true execution head. Any supporting closeout changes must be restricted to this named exception, bind the exact before/after hashes and approval, and reject other post-capture input changes. This proposal does not authorize a third full capture or certify the sprint.

Why a decision is needed: the mission invokes decision #1833, which says an assertion failure requires a fix and a corrective full capture, with at most two full captures without a new decision. Both captures have run. The existing evidence-only review rule also rejects modifying this pre-existing generated facts input after capture. The scoped test receipt is diagnostic until the exception is accepted. See `../capture-protocol.json` for the exact decision and `scripts/product-reality/s185-suite-accounting.mjs` for enforcement.
