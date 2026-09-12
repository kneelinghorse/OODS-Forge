# Sprint 195 final build evidence

State: **BUILT, REVIEW PENDING**; `builderSelfCertified:false`. Read [handoff.md](handoff.md) for the final measured scope, retained failures, documented limits and selected unsent reconnect plan. The earlier m07 README is an immutable pre-capture index.

- Implementation: B2 `39deb793a3161621b5a0893618f9d40201c22256`.
- Final five-suite capture: C2 `6e779776a7efa3b6e7b26a12966f0c4186dba1d6`; 16,383 passed, zero failed, 32 historical skipped executions.
- Successful bootstrap: C2 / `0d91cdf1f1e4dbfe43d8ba11f4b7de577133dd94`, retained in `bootstrap-2/`.
- Final producer/check/auditor: C2 / R1 `ca3444ac9976ac3de1a6007cf9913df739109944`, retained in `final-audit/`; all exited zero.
- Final audit: 28 criteria, 15 execution records, 1,664 frozen paths. Four criteria retain recorded qualifications.
- All seven selected CI jobs passed at C2, with actual checkout MC2 `62a07cd60c8dd016a5d32320470b016a9b7d0515`.

`claim-ledger.json`, `review-handoff.json` and `suite-accounting.json` are the actual final generated outputs. Their source manifest is frozen at R1. The later commit storing these outputs does not change the tested or audited heads. No implementation, test, configuration, token or golden changed after C2.

The first frozen audit at e812ecd is retained, failed, in `bootstrap/`. It caught a capitalization mismatch in otherwise correct generated reconnect prose. Decision 1949 and `reconnect/editorial-input.json` declare the separate amendment; original generated notices remain unchanged. Use `reconnect/notice-plan.json` as the selected prepared plan. All three notices remain unsent.

Raw producer logs retain handled Git baseline-absence diagnostics for newly added paths. The command receipts record the actual process exits; the initial auditor failure is separately retained and is never represented as a pass.
