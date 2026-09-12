# Final carry archive at B

Both final archives were assembled and verified at clean `63efd098cc1def448014a1da09d64394dd3dfaf7` after the single five-suite capture and before importing its outputs. Their bytes, detached manifests, SBOMs and checksum sidecars match. SHA256 `4eaf71866905c828775799a819ce2735500b2d0f77c45f21d7ba0806f2cca128`; 32,480,913 bytes.

Separate extractions passed E2E under Node24.6.0 and exact Node20.11.1: 30 calls, 17 passing tools and two explicit typed limits, bridge parity, clean shutdown/restart and unchanged extracted payload. Source-bound readiness covers 109 React and 109 Vue entries. Original JSON receipts are `../e2e-node24.json` and `../e2e-node20.json`.

The final archive serves the measured release from implementation A `794084bf34dabab4d8218ccb2a32e2ec81f10d51`, archive SHA `4dba1e35f383e0463822f35def30f090a9cc9c800aa080196882fa4903b96885`. It does not relabel that release as a measurement of B. Original `/tmp` locations and durable same-byte copies at `/Users/systemsystems/.codex/artifacts/forge/sprint-196/final-63efd098/` are bound in `archive-verification.json`. No archive binary is imported into Git.
