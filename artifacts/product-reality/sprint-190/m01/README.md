# s190-m01 — Reviewed Sprint 189 delivered

The primary `Forge-expansion` checkout is clean at `f19a654cfaad3632c9dcf9a3ee53d9b0d5532e63`, the PR #91 merge containing review closure `c3a68d5f`. PM2 serves that rebuilt commit at `127.0.0.1:4466`. Product source and the saved store were not modified by delivery. Evidence lives in the s190 worktree.

## Identity and build

- [Before](before.json): clean `f4cd1ba3`, PID 3704, 20 tools, 17 saved-store hashes matching the preceding delivery, 825 compiled-file hashes. The planning memo said 21 tools; the live observation supersedes that count. Only environment key names were retained.
- [Fast-forward](fast-forward.log) and [merged identity](merged-identity.json): `git merge --ff-only origin/OODS-pro`; PR #91 is included; clean before and after.
- [Build results](build-results.json): all five ordered commands exited 0: frozen install, `build:tokens`, topological `build:packages`, bridge build and `pkg:build`. Logs are in `build/01.log`–`05.log`. No full-suite capture was run for this code-free delivery.
- [Manifest verification](structured-data-verification.json): manifest and all three artifact files equal `git show` at the delivered head, including sizes and producer ETags. Nothing was refreshed. Verification uses the producer's Python JSON canonicalization with `generatedAt` removed.
- [After restart](after-restart.json) and [final observation](served-final.json): PID 31993, unchanged cwd/script, 4466 listener, 21 tools. `/health.revision`, both build stamps and the checked-in manifest hash agree. All 843 compiled-file hashes are retained. [Restart](pm2-restart.log) and [PM2 save](pm2-save.log) exited 0.

## Public behavior and store

[verify.py](verify.py) computes [revision-verification.json](revision-verification.json) from retained requests/responses:

1. [Stopped preview](call-00-preview.json): HTTP 400 with typed `OODS-N019`; [tools](tools.json) lists `design_preview` among 21 tools.
2. [Subscription list](call-04-list.json): rows collection keyed by `subscription_id`; bound search, filter and page collection controls; no unbound SearchInput.
3. [Workflow compose](call-01-workflow.json) and [React](call-02-generate-react.json)/[Vue](call-02-generate-vue.json) build generation: all four routes; `src/App.tsx` / `src/App.vue`, 15/16 files, with none of the three retired workflow wrapper names in either App root.
4. [Form](call-06-form.json): all eight labels have at most 40 characters and no trailing period.
5. [Catalog](call-03-catalog.json): all 14 named nucleus rows have evidence and `implemented-evidence-complete` in React and Vue.

[Store table](store-hashes.json): 16 records plus index, all 17 hashes identical before, after restart and after probes. [Public load](call-05-saved-load.json) returns HTTP 200, version 2. The saved successor record hash remains `69110ea71d69ab911b744d84df640280c35850501dfcbd180079cbd9533a7812`.

## Reconnect and rollback

[Delivered notice](reconnect-message.json) derives from the Sprint 189 prepared draft and includes the served commit, eight compiled hashes, full-hash receipt and all advertised/public movers. [Both sends](reconnect-sent.json) succeeded from `cmos://derek/forge`:

- aquex-mcp: `7fe9e0be-8191-4302-b583-0c7e0fcafcbb`
- forge-demos: `3e4f65ca-65f5-4782-aa45-89082b552679`

Acknowledgements are pending. Prefix warnings resolve to the exact authorized target addresses. No other project was messaged. CMOS next-step #1415 is complete, with these message IDs retained as evidence in the mission completion.

[Backup](backup.json) holds all 825 prior compiled files outside the repository. [Rollback](rollback.sh) has a default read-only check, validates the previous commit and backup hashes, clean delivered checkout, store hashes and tools; execution stops the bridge, detaches at `f4cd1ba3`, rebuilds, restores the exact previous server/bridge bytes, restarts and saves. Syntax validation and [rollback preflight](rollback-check.log) passed. Rollback was not executed.

Local verifier corrections: the first ETag attempt removed the wrong metadata key; the second used JavaScript number serialization and disagreed with the Python producer for token data. Both were corrected to the producer algorithm without changing artifacts. The behavior verifier initially read artifact `content` instead of `contents`; corrected before its successful run. No product assertion failed, no delivery was repeated, and no test suite was skipped silently.
