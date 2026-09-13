# Final-source CI findings

These findings are retained for independent review; they do not widen decision #2008. The source remains `542f9ee6bfceb96e61c5b2b44c241c9375a8596f`. All 281 measured product-source hashes still match the palette measurement head.

The a11y-contract CI job passed both 654-cell framework sweeps, all 29 HC browser tests, and all 264 computed-style checks plus nine focus identity checks. It then failed before `a11y:diff` could evaluate contrast: the existing parser required `base_token` on typed palette row 8.

The retained `diagnostic-parser.patch` is a scratch-only proposal. It keeps the six relative-color obligations, validates the six known palette types and their operands, names the separate palette gate, and rejects unknown types. Nine parser tests pass without skips. No proposed source or test file is applied to the worktree.

A fresh Storybook build of the fixed source, used by that scratch diagnostic, allows the full a11y diff to continue. It reports nine new violations: three contrast failures in the unbranded built token tree and six relative-state limits that still describe the prior palette. `a11y-diff.log` and `relative-checks.json` retain the actual results. This is a diagnostic failure, not a passing rerun of the shipped CI job. The three ratios are reported rounded to two decimals in `findings.json`.

The token-governance and guardrails-check jobs failed because the PR lacked the required `token-change:breaking` acknowledgement. The label is now attached. Both brand governance commands pass locally at the fixed source with that label, with zero orphans/leaks; their original failed CI jobs remain visible. This acknowledgement is not CODEOWNER review or sprint certification.

The independent review must resolve the parser, canonical-versus-legacy guardrail input mismatch, contrast failures, and stale state limits before certification or delivery. The review must also perform #2008's reader census and rerun the 22 readiness tests itself. No third full local capture is authorized. The scoped readiness correction, retained capture accounting, and this CI follow-through are distinct evidence.

Root coverage later finished with 7,301 passed, one timed-out test, and 16 skipped executions (7,318 total). The palette consumer-pixel evidence test exceeded its 20-second CI budget. One isolated local retry with unchanged source and the same 20-second limit passed all seven tests, with zero skips; the timed-out assertion took 9.37 seconds locally. The retry ran on the evidence-only descendant recorded in `coverage-timeout.json`; it diagnoses the CI timeout on a different host and never replaces the failed CI result.
