# Additive Sprint 184 review dispositions — Sprint 185 m05

This note supplements the Sprint 184 record. The historical Sprint 183/184 artifacts and their status fields remain unchanged. Machine-readable dispositions and source hashes are in [s184-additive-review-record.json](s184-additive-review-record.json). These files do not complete CMOS next steps by themselves.

## #1364 — B2 repoint fields

[b2-repoint-disposition.v2.json](b2-repoint-disposition.v2.json) adds a list-valued `changedField` per invocation, with before/after operands keyed by field. Its `comparisonFields` list drives source rederivation across intent, context, framework, profile and save; object expressions and future field names require no closed-union extension. The original [v1 disposition](../../../sprint-184/m07/b2-repoint-disposition.json) remains the historical record.

The wider comparison found a real omitted axis in commit `3993c2b6dbe875ec8ea202c803b5e52bfda59be6`: `actions-stripe-vocabulary` changed both context (`detail` → `card`) and framework (absent → `html`). The denominator is **13 invocation repoints, 14 changed axes**. The old intent/context-only loop concealed the second axis. The original reason remains recorded as historical text; the additive record explicitly discloses the target-selection change. Current typed outcomes remain separately measured in [the m04 B2 disposition](../../m04/b2/remeasurement-disposition.json).

`scripts/product-reality/s185-review-carries.ts` reads the pinned parent/commit source with the list. Both the retained B2 source-selector test and the new review-carry spec use this rederivation. The new spec tests the real omitted framework axis plus simultaneous context/framework/profile/save changes, a future field, and ambiguous-input failures. The first run rejected strict v1 equality when it discovered the extra axis; [the retained failure](rederivation-first-missing-axis.log) explains that adjustment rather than concealing it. Historical pipelines were not rerun for this representation correction.

## #1365 — C13 identity and C5 output dispositions

**C13 identity pre-existence is anchored** by commit `9cd02da94bd342e269a1d68faa7a9a82c8c2f6f1`, committed **2026-03-15T19:13:31-05:00**, at tracked path `packages/mcp-server/.oods/schemas/_index.json`. The exact blob is retained as [c13-index-9cd02da9.json](c13-index-9cd02da9.json). Its identities match the vendored saved-store records:

| Name | Schema reference | Exact createdAt |
| --- | --- | --- |
| subscription-detail-dark | compose-a710f0a9 | 2026-03-15T22:31:17.484Z |
| subscription-list-dark | compose-bc4ef63a | 2026-03-15T22:31:17.525Z |

This proves identity pre-existence. It does not prove the schema bodies' byte pre-existence; no pre-sprint body git object is cited.

**C5 has the explicit disposition “historical, output never captured”** for all four inherited `s183-m05` controls in the `s183-m06/mutation-replay` aggregate: React and Vue tabs-selection removal, and React and Vue inert `handleEdit`. Each replay directory retains only `report.json`; serialized browser observations and original m05 build/patch logs are not captured replay execution output. This does not claim the controls never ran. They were not rerun in Sprint 185, and they count as zero current red-control proofs. The fifth, s182 contrast replay has pre-green/selected-red/restored-green logs and is excluded from this disposition. Fresh Sprint 185 controls remain separate evidence.

## #1366 — Increment 3 is PARTIAL

**Increment 3 is PARTIAL.** The four workflow states—loading, empty, error and success—were proved on the schema built in memory by `schemaFor(states)` in `scripts/product-reality/s184-m05-state-evidence.ts`. The real saved Subscription list/detail schemas were proved state-neutral by m06. No single artifact demonstrates the program sentence that the same semantic Subscription workflow is usable in both frameworks with all four states. Edit/cancel and timeline remain outside that saved-schema proof. The additive machine record sets `combinedExitGateDemonstrated: false` and links both separate subjects. The historical m06 closeout's scoped `passed` value is not promoted to a met Increment-3 claim.

## Named work retained outside this correction

The captured CMOS statuses remain **pending**, and this note completes none of them: #1315 exact-commit gate-1 reissue/four follow-ups; #1318 final-diff mover discipline; #1319 B15 manifest re-pin recipe; #1320 adapter flat-runtime boundary; #1321 C7 denominator remeasurement; #1322 local CI-15 `--final` and dead OODS-N013 cleanup. Applying mover discipline in Sprint 185 does not silently absorb the older maintenance item.

Consumer feedback #1371 (structured-data refresh and surface-specific catalog labels) remains parked for maintenance after Sprint 185. #1372 (the dashboard consumer's requested themed server SVG path) remains parked for visualization closure. Their consumer measurements are reported evidence, not reproductions performed by this note.

Stage1 consumer report items **6 and 7** were already forwarded as message `42a335bd-a2cb-4a84-8b53-157d8dd2a204` at **2026-09-05T21:25:40.146Z**, Forge → Stage1, current status pending. The [retained exact message](stage1-forward-source.json) covers doubled token-delta segments and archived-run parse failures mislabeled “not found.” Forge has not reproduced them; no resend was performed. These item numbers are consumer report items, not CMOS next-step IDs.

## Reproduction scope

From the s185 worktree root:

```sh
pnpm --filter @oods/mcp-server exec tsx ../../scripts/product-reality/s185-review-carries.ts
pnpm --filter @oods/mcp-server exec vitest run test/product-reality/review-carries.s185.spec.ts
pnpm --filter @oods/mcp-server exec vitest run test/product-reality/b2-legacy-inputs.s184.spec.ts -t 'binds all 13 retained repoints'
```

The third command deliberately selects the source-selector/rederivation test and does not claim to rerun the historical pipeline cases. Raw output is retained alongside this note. The generator uses saved CMOS/message evidence and local git/file reads; it performs no database operation, message send, runtime package edit, build, or historical mutation replay.
