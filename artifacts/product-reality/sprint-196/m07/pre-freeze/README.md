# Sprint 196 pre-freeze verification

`report.json` binds the final source and named passing test reports. This is selected verifier work, not a full five-suite capture. `native-verification.json` preserves all initial diagnostics and their corrective executions; `../preparation/closeout-verification.json` binds the final amended closeout source and 95-test regression.

Original failures remain explicit: missing dist/pkg, a receipt copy accidentally entering the unchanged42-fixture source corpus, stale generated ScaleTemporal/Tool-Specs outputs, the targeted viz command applying a whole-package coverage threshold, and historical tests reading the later UTC registry. Corrected whole-file runs and generation checks resolve them. Reports overlap and are not added into a fabricated test total. Full-capture configuration and thresholds are unchanged.

The final closeout regression additionally checks exact canonical/snapshot equality, both rename endpoints, non-test patch scope, native portable errors, original42-cell release receipts, and exact roadmap/packet labels. All final named reports have zero failures and zero skips. Current runtime/release proof and the single full capture are later steps with their own actual heads.
