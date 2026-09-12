# Explicit timezone for historical pixel fixtures

The three complete existing test files now pass all **47 cases, 0 failed, 0 skipped** with an external `TZ=UTC`. Their hooks set the historical America/Chicago fixture timezone, verify its effective Intl zone and local07:00 date behavior, and restore/assert the previous timezone afterward. All exact SVG/registry assertions remain unchanged. Non-Vitest imports retain their original text and line numbers.

Two harnesses were exercised:

- Root core with V8 coverage instrumentation:47cases passed; **command exit1** solely from the unchanged global coverage floors on this narrow selection. Raw errors and coverage summary remain retained. This is not a full coverage pass.
- Normal package-native MCP configuration:47cases passed; **command exit0**. No thresholds, exclusions, filters, production, schemas, registries or goldens changed.

The actual B2 CI coverage failure is retained in `initial-ci/`, including the complete raw job log (SHA25611b83a0b…), exact failure-line references and the independent sixteen-cell registry timezone comparison. The full job had five failures; this slice owns four assertions across these three files, while the separate numeric-ratio guard repair has its own owner.

Our independent built-handler Subscription HC probe changed only TZ across child processes with byte-identical current requests. UTC exactly reproduced CI hash `e53138dd…`; America/Chicago exactly reproduced retained m05 hash `d77a6921…`. Both SVGs have86nodes;27nodes differ across27attributes (geometry plus axis aria times), while paints and XML text nodes remain unchanged. The full hashes, raw SVGs and actual invocation locations are retained in `independent-probe/`. Historical temporal pixel equality never implied cross-timezone determinism.

`before.json`, `before/`, and `verification.json` bind the three source changes, every raw result and unchanged global config/registry hashes. Checks executed at B2 HEAD with uncommitted test-only changes; no result is assigned to a future capture or commit. Full corrective CI and the final allowed five-suite capture remain pending.

The second natural B2 CI MCP job103472755602 also failed only the same four timezone assertions (6576passed/4failed/16skipped); its complete raw log and lines1742–1852 are now retained in `initial-ci/`. No additional failure class was inferred or hidden.
