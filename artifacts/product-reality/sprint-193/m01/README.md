# s193-m01 — Reviewed Sprint 192 delivery

Delivered `c098237f1a1d026df4f1ad5c0ca51b15ebab0f4d` from primary checkout
`5fdf8a182b12146cfe975f9878c4939f14776f9d`. Fetch confirmed origin/OODS-pro remained
at the PR #96 merge; PR #97 had not landed. The sprint worktree remains on its
prepared planning head `c2b143d4` before this delivery evidence commit.

Frozen install, build:tokens, build:packages, bridge build and pkg:build exited 0
(`build-results.json`). PM2 restart and save exited 0. Before/after/final observations
retain health, process identity, compiled-file hashes and all 17 saved-store hashes.
`verification.json` passed: delivered revision, 21 tools, manifest hash changed from
`acd4c89664fb5edd4cab80427c49139d80416a6805305f4cd2851d1a0869dc70` to
`7509e0524017f0f162788fbee510369f5b2c7a86f9d3bd408b48dfe7fb0b4fc3`, store bytes
unchanged, primary tracked checkout clean and its existing sprint-190/delivery folder untouched.

`bridge-proofs.ts` and its retained request/response files prove 109 catalog rows,
zero unverified cells, AuditSummaryCard/SortIndicator/TimelineEntryLabel implemented
with evidence in React/Vue, the A/dark line SVG hash equal to the Sprint 191 matrix,
and Subscription/workflow React's generated shell carrying dark theme. All assertions
passed. No full-suite capture was run: this delivery changes no implementation;
the locked plan requires one capture at sprint close.

The three prepared requests in sprint-192/m07/reconnect-plan.json were sent without
editing body, summary, type or target. Their SHA256 values and responses are in
send-01.json through send-03.json; send-readback.json compares the dashboard's stored
body/summary/type byte-for-byte. Message IDs:

- cmos-dashboard: `ef0c3aa2-f9a1-44b7-aa34-d4fcb41d226a`
- forge-demos: `45e6b826-a752-4e3c-a20f-32b0f7bf5573`
- aquex-mcp: `00a86b9e-885d-47f0-95b7-853dca2e6f50`

The initial first-send attempt and readback timed out; read-only TLS probes also
timed out. A subsequent sent-list read recovered and showed only the prior Sprint 191
messages (81 total), establishing that no new notice existed before retrying. The
three sends then succeeded and all readbacks matched. Failed attempts are retained;
no blind resend occurred. Next steps #1439 and #1441 are completed in CMOS.

`backup.json` identifies 855 compiled files and a private PM2 dump outside Git.
`bash rollback.sh --check` passed. Rollback was not executed. The recipe checks the
delivered head, checkout and store before changing anything, rebuilds the prior head,
restores its exact compiled bytes, restarts only the bridge and saves PM2. Process
environment values were never printed or retained in Git.

This evidence is committed separately to establish the served rollback boundary
before Sprint 193 runtime/component changes. Build-tracking session: PS-2026-09-11-002.
