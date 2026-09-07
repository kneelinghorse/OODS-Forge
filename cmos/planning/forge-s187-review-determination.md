# Forge Sprint 187 — Reviewer's Determination

**Determination:** CERTIFIED for the locked Fresh Composition Coverage scope. CLOSED.
**Review session:** `PS-2026-09-07-002`, independent Codex review, 2026-09-07.
**Decisions:** #1809 (certification), #1810 (next planning and retained obligations).
**Remote CI qualification:** The initial PR #84 run failed three jobs. This review did not inspect that live run before closing; frozen local certification is not remote PR acceptance. See [the CI follow-up](forge-s187-ci-followup.md) for the failures, correction and validation boundary.
**Reviewed heads:** implementation `a9c02b7d`, frozen suite execution `867c130e`, frozen review inputs `a429e9d4`, delivered evidence `083e82c1`; sprint base `21c7c319`.

All six missions are complete and all seven literal closeout criteria are independently supported. No unresolved finding blocks certification of the locked scope. Deployment and the broader product obligations below remain separate work.

## Verified outcome

| Measure | Verified result |
|---|---|
| Fresh public composition | 11 objects × 6 contexts; 66/66 schemas, 132/132 React/Vue build-generation cells |
| Governed roots | 64 unique IDs, including 14 new families |
| Selected packed consumers | 14 locked paths × 2 frameworks; 28 cells |
| Consumer gates | 218 passed, 6 explicit interaction N/A, 0 failed, 0 skipped |
| New-family observations | All 14 appear in retained browser mount observations; typed-value probes pass |
| Original historical store | 15/16 schemas, 30/32 generation cells; User form remains a negative |
| Authentic successor store | 16/16 schemas, 32/32 generation cells |
| Saved-input identity | All 16 record hashes in each store match the final build evidence |
| Obligation scope | All 109 identities, historical classifications and reconciliation states retained |
| Independent output audit | 7 criteria, 30 executions, 900 frozen paths; passed |

Generation covers all 66 paths; packed runtime proof covers the locked 14. The six N/A gates are the React/Vue interaction gates for Transaction/timeline, Organization/card and Subscription/card, each with no interactive element declared. They are excluded from the passed count.

Browser evidence uses a 1920×1080 viewport and a 112rem fresh-consumer container. It proves selected desktop hydration and local controls, not responsive overflow behavior. Search typing/clear, numeric updates, false values and cancellation reason/code edits are evidenced within their stated scope. Cancellation submission is prevented; cancellation, save, persistence and application filtering are not claimed.

## Independent verification

1. Rebuilt `@oods/component-contracts` and `@oods/mcp-server` at `083e82c1`, then reran the existing fresh-composition census. Every default `{object, context}` input generates in both frameworks. The object/context identity set matches planning exactly; row ordering is immaterial. [Fresh census](../../artifacts/product-reality/sprint-187/review/fresh-census.json), [comparison](../../artifacts/product-reality/sprint-187/review/generation-comparison.json).
2. Reran the existing reachability tool against the original s183 store and the authentic m05 recomposed store. Results remain 15/16 and 16/16, with unchanged input hashes. [Original](../../artifacts/product-reality/sprint-187/review/saved-original/report.json), [successor](../../artifacts/product-reality/sprint-187/review/saved-successor/report.json).
3. Read all 28 individual consumer reports, verified their hashes against the combined report and compared their browser observations to the raw browser logs. All eight named gates remain present per cell, referenced logs exist, mount/hydration succeed, runtime errors are empty, and bound-value/required-mount probes pass. All 14 added families are observed. This review inspected the retained packed-consumer runs; it did not repeat them. [Receipt inspection](../../artifacts/product-reality/sprint-187/review/receipt-inspection.json).
4. Re-derived the existing closeout with `--check`, the frozen heads, the recorded attributions and the retained **raw** auditor input. Every generated output is byte-identical. Separately executed `s185-audit-closeout.mjs` against the actual retained outputs: seven criteria, 30 executions and 900 frozen paths pass. [Re-derivation](../../artifacts/product-reality/sprint-187/review/rederive-raw-audit.log), [audit](../../artifacts/product-reality/sprint-187/review/output-audit/audit.json).
5. Inspected the composition/lowering changes and public disclosure. The audit verifies five canonical and 38 public paths across the complete sprint range, public implementation/execution byte equivalence, readiness references, 28 export-removal bites and restored positives. The diff from execution `867c130e` to delivered evidence `083e82c1` contains no non-artifact changes. Both bridge/server policy files are unchanged from the sprint base.
6. Queried the rebuilt local catalog: 109 rows, accepted retain-all decision #1788 and null old runtime-census approval. ArchivePill is governed; ArchiveEvent is HTML-stable but React/Vue-unavailable; BillingAmountInput is planned/unavailable. The latter's historical authoring-only classification is explicitly unapproved. This is a local handler measurement; the m05 packet separately retains public HTTP and isolated adoption/rollback evidence. [Discovery](../../artifacts/product-reality/sprint-187/review/discovery.json).
7. Compared all 109 baseline identities/classifications/reconciliation states with `21c7c319`. They match. The 14 added families' accessibility, theme and interaction maturity cells remain unverified. Inspected the eleven-row dispositions and alias assessment; neither proposed merge retires an obligation.

The first review re-derivation invocation supplied normalized `closeout/final-output-audit.json`, whose stdout is a file reference, to an option expecting the raw auditor result with stdout text. It correctly failed before verification. The retained raw input is `m06/closeout-audit-attempt-1/audit.json`; the corrected invocation passes. [Failed review invocation](../../artifacts/product-reality/sprint-187/review/rederive.log) remains retained. This was a reviewer invocation error, not a product or evidence failure.

Reproduce the successful check from the s187 worktree:

```sh
node scripts/product-reality/s185-closeout.mjs \
  --manifest artifacts/product-reality/sprint-187/m06/closeout-inputs/manifest.json \
  --execution-head 867c130e42db11a964ab6e3df661518301f1e04d \
  --review-head a429e9d4fd95c5c3d5143668ddd6be08a3d8be08 \
  --attributions artifacts/product-reality/sprint-187/m06/four-suite-closeout/attributions.json \
  --final-audit artifacts/product-reality/sprint-187/m06/closeout-audit-attempt-1/audit.json \
  --check
```

## Frozen suite evidence

These counts were independently computed from raw assertion results at `867c130e`. The review did not rerun the four suites.

| Suite | Passed | Failed | Skipped | Pass delta vs s186 |
|---|---:|---:|---:|---:|
| viz-core | 1390 | 0 | 0 | 0 |
| viz-render | 64 | 0 | 0 | 0 |
| mcp-server | 5866 | 0 | 16 | +126 |
| root-core | 6146 | 0 | 16 | +97 |

The same 16 test identities are skipped in both overlapping server/root runs and in the s186 comparator: nine action-mapping cases and seven Stage1-rollup cases. They are not 32 distinct skips or credited passes. File-attributed accounting has no closeout failures, unattributed deltas or validation issues.

The failed first capture at `2a7bb93e` remains retained: server 5841 passed / 22 failed / 16 skipped; root 6127 passed / 17 failed / 16 skipped. The recovery repaired actual bundled-schema drift and updated obsolete readiness expectations while retaining the original operands, historical negatives and unchanged timing gate. The earlier `adab89f9` proof is historical. Decision #1808 and the final `a9c02b7d` evidence supersede the earlier final-head claim; learning #515 is marked superseded and #518 records the correction.

## Learnings and carry-forward

Learnings #516–#518 record the useful distinctions: complete default composition plus typed packed-consumer proof; surface-specific discovery and packaged public validation; frozen identity and raw-versus-normalized audit provenance. Decisions #1809–#1810 record certification and next planning boundaries.

- Prepare the next scoped delivery step from the reviewed m05 rollout/adoption packet. Deployment, verified loaded revision, authentic User-form adoption and the two prepared reconnect notices remain under #1374/#1379/#1384. No service restart, shared-store migration, publishing or outbound notice occurred in this review.
- Retain `/ported`, `/readiness-ported` and `/css-ported` under #1382/#1385. The assessment is done; migration evidence and an explicit compatibility decision are still needed for retirement.
- Plan from all 109 obligations. Of the eleven disputed rows, nine retain implementation dispositions and two propose explicit alias/merge reviews. No eleven extra ports, merge or denominator reduction is authorized here.
- Keep accessibility/theme/interaction maturity and responsive behavior unverified until their own evidence exists. The complete greenfield workflow remains partial.
- Preserve visualization public-render closure #1372, maintenance #1315/#1318–#1322, Parts Town work, and publication/adapters as named obligations. Historical aggregate carry lists do not discharge them.

No new sprint slate is created by this review. The primary checkout's unrelated changes are outside the review commit; all review artifacts are retained on `codex/sprint-187-fresh-composition`.

## CMOS milestone

The review session completed at `2026-09-07T14:45:35.906Z` with three learnings and two decisions. Review next-step #1388 is complete; carry-forward rows #1389–#1391 preserve next planning, delivery and remaining obligations.

Sprint 187 closed through the standard lifecycle at `2026-09-07T14:45:37.404Z`, with six completed missions and no blocked, skipped, open or parked missions. The lifecycle archived 22 active sprint decisions and nine active learnings; superseded records remain historical. Pre-close database snapshot: `snapshot-20260907T144536922Z-8f5f`; post-close database snapshot: `snapshot-20260907T144537447Z-8b6e`.

The requested master-context snapshot used source **Sprint 187 completed** and session `PS-2026-09-07-002`. CMOS deduplicated unchanged content to snapshot **2162**, created at `2026-09-07T14:45:36.750Z`, hash `6be35e3cbdec41bb`; the explicit milestone call did not create another row. Sprint focus now records certification and the retained carries.
