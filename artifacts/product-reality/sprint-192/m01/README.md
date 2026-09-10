# s192-m01 — Reviewed Sprint 191 delivery

Delivered `5fdf8a182b12146cfe975f9878c4939f14776f9d` (PR #94 merge) from primary checkout `d3a99d39f4a9d6072bcda77de1935b5da0b71c95`. Fetch showed PR #95 had not merged. Sprint worktree remains based on that reviewed merge, at planning commit `6baedfa0`. Build session `PS-2026-09-10-010`; decision #1883 records delivery and the two preparation/API discrepancies below.

## Execution and checks

- Before observation: 2026-09-10T16:54:22Z, PID 11390. Frozen install, `build:tokens`, `build:packages`, bridge build and `pkg:build` each exited 0. Literal commands and their outputs are retained in `fast-forward.log`, `install.log`, `build-tokens.log`, `build-packages.log`, `build-bridge.log`, `pkg-build.log`.
- PM2 restart and save exited 0 (`pm2-restart.log`, `pm2-save.log`). After observation: 16:55:15Z, PID 1443; final observation: 16:57:13Z. `before.json`, `after-restart.json`, `final.json` retain health, process identity, compiled hashes and all 17 saved-store hashes.
- `/health.revision.commit` equals the delivered commit and reports 21 tools. PM2 cwd and script are unchanged. All 17 live store hashes match before, after restart and after behavior probes. The primary tracked tree is clean; its pre-existing untracked `sprint-190/delivery/` is unchanged and untouched.
- `bridge-proofs.ts` calls the live bridge, retaining every request and response before asserting. `viz_render` A/dark line, scatter and treemap hashes equal their Sprint 191 m05 matrix rows. `code_generate` on an authentic Subscription/workflow composition, both React and Vue, emits `data-theme="dark" data-brand="B"` in `index.html`. `bridge-proofs.log` and `behavior-summary.json`: 3/3 charts and 2/2 frameworks pass. No source file was edited in the primary checkout.
- `verification.json` records the combined delivery checks. This mission adds only this evidence directory in the sprint worktree; no full-suite capture is appropriate for a delivery with no source changes.

## Six sends, verified by readback

`send-plan.json` binds requests to the Sprint 191 source plans. `send-01.json`–`send-06.json` retain requests, SHA256 and tool responses. `send-readback.json` proves body, summary and type equal the actual stored messages.

| Kind | Target | Message ID |
| --- | --- | --- |
| Reconnect | cmos-dashboard | ce5b0d02-a8b6-4534-a20e-26daa44b7f6c |
| Reconnect | forge-demos | 3b08f4cf-8c05-4195-9729-0fb7b376619a |
| Reconnect | aquex-mcp | 88cf1889-0025-4a9a-b12b-d4d970772ff1 |
| Re-pin | aquex-mcp | af0db158-96ad-4004-a6b9-3dbd39513f21 |
| Re-pin | forge-demos | b9ad383b-a1d8-4039-995d-a38931afe3c3 |
| Re-pin | shopify-forge | 031d201a-c4b9-4844-abbe-a8b6c33b7497 |

Exactly these six messages were sent. They retain the prepared wording, including its historical “prepared/pending” phrasing; the delivery receipts record the later actual state. The three reconnect request objects and prepared hashes match exactly. **Preparation discrepancy:** `re-pin-notice-plan.json` has a `draft` and targets, but no request objects or request hashes, contrary to the criterion's description. Delivery added only `info_push` type and a descriptive summary; the body is byte-identical to `draft`. Derived request hashes are explicitly distinguished from original prepared hashes. No original plan was rewritten.

Next-step #1315 was completed at 16:57:03Z (`next-step-1315.json`, confirmed by completed-state readback). **API discrepancy:** `cmos_context(next_steps=complete)` has no reason field; the message IDs and closure reason are therefore retained in decision #1883 and these receipts. Recipient slug-prefix warnings resolved to the exact prepared addresses and intended project IDs; no target was substituted.

## Rollback

`backup.json` identifies a private backup outside Git: 855 compiled files, their hash manifest, and the pre-delivery PM2 dump (mode 0600; environment values never printed or committed). `rollback.sh --check` passed (`rollback-check.log`); rollback was not executed. `rollback.sh --execute` stops only this bridge, detaches at the previous commit, runs the same build sequence, restores exact previous server/bridge bytes, restarts and saves. It checks current commit, worktree and store hashes before changing anything and never mutates the schema store. The saved PM2 dump remains available at the recorded backup path for manual process-definition recovery if needed.

This delivery is committed separately because it establishes the served rollback boundary before component source changes.
