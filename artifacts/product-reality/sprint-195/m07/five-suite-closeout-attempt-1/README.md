# Sprint 195 full capture — attempt 1

This complete five-suite run executed at `54def3aa88683d81f1f942558a24715c064021e9` and exited 1. It is failed evidence, not the selected final capture. All four setup commands succeeded. All five suites ran with their unchanged default commands and coverage.

Results: 16,414 assertions total; 16,365 passed, 17 failed, 32 skipped, 0 todo. Six root-core failures overlap MCP failures, leaving 11 unique failed tests. Each suite retained clean before/after status, and the outer execution receipt confirms unchanged C and a clean worktree after the runner exited.

The actual output root was `/tmp/oods-s195-capture-C/five-suite-closeout`; raw references retain that basename. `attempt-binding.json` supplies `originalReferenceRoot: "five-suite-closeout"` for accounting after relocation. No raw JSON, log, path, or receipt was rewritten. `copy-verification.json` records every copied raw file's size and SHA-256, verified after copying. The outer command and log also retain their actual original locations.

`assertion-inventory.json` indexes every failure and skipped assertion against the raw Vitest reports. A second capture has not been started.
