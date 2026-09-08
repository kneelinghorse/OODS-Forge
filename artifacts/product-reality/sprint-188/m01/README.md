# s188-m01 — delivered merged Sprint 187 build

Completed delivery evidence; no product code changes. Primary `Forge-expansion` is clean at `cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076`. Evidence lives in the Sprint 188 worktree; the primary remains at the exact reviewed merged bytes.

## Served identity and build

- Before: checkout `7ad4dacba7ed41741ea176ef4c3ef15f8b049f6f`, PM2 PID 37668, restart count 8. The newer build handoff correctly names 7ad4dacb; the older memo's 8ce34907 checkout claim is stale. Its next commit only untracked rotated CMOS snapshots. [Read-only capture](before.json) includes selected PM2 fields, environment key names only, listener, health, all 17 store-file hashes and 794 prior compiled-file hashes.
- Fast-forward: `git merge --ff-only origin/OODS-pro`; clean before/after. [Merge log](fast-forward.log), [merged identity](merged-identity.json).
- All nine install/build commands exited 0: frozen install, tokens, contracts, styles, React, Vue, MCP server, bridge, package build. [Commands and logs](build-results.json). No full-suite capture was run for this code-free delivery.
- Checked-in manifest and all three artifacts equal `git show cd8ee986:<path>`. Their sizes and canonical ETags verify. [Manifest evidence](structured-data-verification.json). An initial raw-file-SHA/ETag assertion was invalid: ETags hash sorted JSON excluding top-level generatedAt; that check was corrected using the existing refresh implementation. Nothing was refreshed.
- Restart PID 84796; final post-adoption PID 85319; same cwd and script, listener on 127.0.0.1:4466, health ok/20 tools. `pm2 save` succeeded after each restart. [Final identity and built-file hashes](served-final.json).

## Public revision and load proof

[Revision verification](revision-verification.json) and [all call results](verification-summary.json) retain 17 successful HTTP responses, including two expected typed-negative generation results. Product/card, Subscription/card and standalone ArchivePill each generate artifacts at build profile in both frameworks. BillingAmountInput returns OODS-N015 in both. Catalog returns exactly 109 rows with obligationScope.decisionId 1788.

Factual probe correction, CMOS decision #1816: Product has no Archivable trait and its card contains PriceCardMeta, not ArchivePill. The first assertion expecting ArchivePill failed; its actual response remains in [call-02](call-02-product-card.json). The authentic Subscription/card supplies the ArchivePill discriminator; Product/card was still generated in both targets. No merged code or object definition was changed to satisfy the mistaken parenthetical.

Before delivery, schema/load returned HTTP 400 / RUN_ERROR, incident `2a71580b-f113-43e2-bd56-667e3227bee2` ([receipt](before-schema-load.json)). After rebuilding/restarting, the same tier1-acceptance-sub-detail load returns HTTP 200. Its record SHA256 is f842c3c61933caf7cf26af48e02b7a7de84c5f60fd49b8c03458821fdd55318b; generation from the loaded reference and the on-disk schema yields the same artifact hash. This proves operational resolution; the old process's underlying exception was not exposed and is not claimed diagnosed.

## Adoption and rollback

The precondition version-1 record SHA256 d25d9ce30988cd5e26b390a5b43ce005f2055b765b8bc3abadc263571a848bb2 and all other original hashes matched. PM2 was stopped, no listener remained, and the full store was rechecked and backed up before writes. The exact reviewed successor record and index were installed with fsync and atomic replacement while writers were quiesced.

[Adoption hashes](adoption.json) show all 15 other records and their index entries unchanged. The exact successor index also carries its reviewed envelope updatedAt; this metadata change is explicitly recorded. User-form v2 record SHA256 is 69110ea71d69ab911b744d84df640280c35850501dfcbd180079cbd9533a7812. Schema SHA256 is cffc0b3c6a2cc16abb536388a4f1f9fce9885e995ad567e980d202c3ff6dcd12. Public load returns version 2 and both generated artifacts equal the reviewed hashes ([verification](adoption-verification.json)).

Backup outside the store: `/Users/systemsystems/.codex/backups/forge-s188-m01-20260908T0256Z`. `schemas/` and `pre-adoption-schemas/` preserve the full original store; prior server/bridge dist files are retained under their original paths. `hashes.json` SHA256: `d2bda3753d26303f523f44c94d236ee360ba51f32f2bb6293e8c5159b0b4ecb7`. No environment values or .env contents are retained.

[Exact rollback commands](rollback.sh) restore the prior checkout/dependencies, saved compiled files and store, then restart/save PM2. `bash -n` and `bash rollback.sh --check` passed ([log](rollback-check.log)); the executable preflight verifies every backup hash, the prior commit, clean primary and no subsequent store edits. **Rollback was not executed.** It restores the previous build, including the known pre-existing load failure, not a repaired version of it.

## Combined reconnect

[Exact notice](reconnect-message.json), [delivered advertised diff](delivered-advertised-movers.json), [send receipts](reconnect-sent.json):

- aquex-mcp: `e4f09e39-8e51-4b41-b6fe-0f62f50138f4`
- forge-demos: `19dfe0ae-1c62-4905-a10e-a8f6b3735c95`

Both sends succeeded to the exact chartered addresses; acknowledgement remains pending. Dashboard Demos was not messaged (retired #1719). The notice carries the served commit, built-file hashes, combined Sprint 184–187 movers, obligationScope addition and actual adoption state. No public registry publication occurred.

CMOS carries #1374/#1379/#1384 and their delivery aggregate #1390 are closed on these receipts. Build-session handoff #1392 is also fulfilled. Sprint 188 remains Active; the builder does not self-certify.
