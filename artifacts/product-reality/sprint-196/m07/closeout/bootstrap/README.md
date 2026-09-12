# Sprint 196 provisional bootstrap sequence

Status: prepared, not executed. This directory is staged outside the checkout while the full capture and final archive hold is active. No full producer, producer --check or independent auditor run is claimed here. Nothing here completes m07 or certifies the build.

## Authority and unchanged inputs

CMOS decision 1976 permits only the provisional m07 criterion 2 qualification needed for the first real CLI checks. It complements active decision 1975. The newly fetched MCP snapshot has seven unchanged missions and 26 literal criteria; its only new decision is 1976. The old B snapshot remains byte-identical at SHA256 56abb21ab083f7e5de650a1d7ba74d30b32150410b9d26ffd1fa622d547a19e8. snapshot-verification.json retains the MCP call inventory and both hashes; mcp-snapshot-raw.json retains the complete tool results.

A = 794084bf34dabab4d8218ccb2a32e2ec81f10d51 is the actual runtime/release/census measurement head. B = 63efd098cc1def448014a1da09d64394dd3dfaf7 is the actual five-suite capture and clean final archive head. C0, C1 and D remain unknown until their commits exist.

## Required sequence

1. Wait for the actual B capture, clean B final archive and both E2Es, successful fresh CI with raw job/merge identities, movers/attribution at B, and the parent's explicit release of both checkout write holds. The source inventory currently records 34 files present in B, two files staged outside the checkout and eight future source files. These are preparation observations, not final check results.
2. Complete the bootstrap manifest from the existing 44-source table and the 26 literal bindings. Only m07/2 receives the exact documented-limit binding and preparation execution in sequence-plan.json, citing 1976. Its evidence is this truthful pending qualification plus the new MCP snapshot and snapshot-verification receipt. No pre-freeze or unit-test result is offered as the missing CLI execution. Every other binding requires actual evidence before generation.
3. Import new evidence paths and freeze bootstrap inputs at C0. Preserve the existing B files. The bootstrap manifest path is artifacts/product-reality/sprint-196/m07/closeout/bootstrap/manifest.json.
4. Run the existing producer, its --check, then the independent auditor against the actual produced output at execution B and review C0. Run under default Git configuration, without a core.quotePath override. Retain exact argv, cwd, times, exit codes, logs, output hashes and actual execution/review identities. Label all provisional outputs nonfinal. The producer headline counts decision-qualified rows as proven; the explicit m07/2 qualification and this status must remain visible when presenting its output.
5. Preserve the bootstrap manifest, qualification and successful command receipts unchanged. If retaining provisional generated outputs in Git, place the entire output tree under closeout/bootstrap/output-tree; do not occupy the final standard claim-ledger/review-handoff paths.
6. Create the distinct final manifest at artifacts/product-reality/sprint-196/m07/closeout/manifest.json. Remove disposition, decisionIds and qualification from m07/2 and bind the actual successful B/C0 producer --check and independent audit receipts. Freeze these final inputs at C1. The original 1976 snapshot may remain a source, but its bootstrap qualification is no longer applied.
7. Run producer/write, producer --check and independent auditor at execution B and review C1 into a separate final output root. Check all 26 final rows are proven with no bootstrap qualification. Any failure remains a failure to resolve; no receipt is replaced with a synthetic pass.
8. Add final outputs and successful final command receipts in D. The generated handoff continues to bind input review C1 and evidenceCommit C1. Record D separately as the output delivery commit; do not rewrite the generated content to refer to its own containing commit. M07 can complete only after the actual final checks pass.

## Exact command forms, not yet run

Replace C0 only after that real commit exists. ROOT is the sprint worktree. OUT is /tmp/forge-s196-closeout-staging-63efd098/bootstrap-output. MANIFEST is the bootstrap path above.

    node scripts/product-reality/s185-closeout.mjs --root ROOT --execution-head 63efd098cc1def448014a1da09d64394dd3dfaf7 --review-head C0 --manifest MANIFEST --output OUT
    node scripts/product-reality/s185-closeout.mjs --root ROOT --execution-head 63efd098cc1def448014a1da09d64394dd3dfaf7 --review-head C0 --manifest MANIFEST --output OUT --check
    node scripts/product-reality/s185-audit-closeout.mjs --root ROOT --execution-head 63efd098cc1def448014a1da09d64394dd3dfaf7 --review-head C0 --manifest MANIFEST --artifacts-root OUT --output /tmp/forge-s196-closeout-staging-63efd098/bootstrap-audit

The final commands use real C1, the distinct final manifest, /tmp/forge-s196-closeout-staging-63efd098/final-output and /tmp/forge-s196-closeout-staging-63efd098/final-audit.

The auditor writes audit.json and audit.log itself. Producer stdout/stderr must be retained separately from its generated artifacts; an execution receipt must record the real exit status, not infer it from a log phrase.

## Add-only boundary

All proposed imports belong under existing allowed m07 closeout, five-suite-closeout, ci, movers, final-archive or the two exact E2E JSON paths. No source, test, helper, registry or existing B artifact changes are permitted. No further capture, publication, delivery or reconnect message send is authorized.

