# s187-m04 lifecycle and financial ports

Build branch: `codex/sprint-187-fresh-composition`, starting from m03 `e1ea8ce6`.
Builder evidence only; Sprint 187 remains Active and `builderSelfCertified:false`.

The five families are ArchiveSummary, ArchivePill, CancellationForm, CancellationBadge and PriceCardMeta. Both framework roots have real contracts, scenarios, public declarations, styles and readiness references. ArchiveSummary associates archive flag/date/reason with description-list terms. PriceCardMeta retains model/interval inline terms. The badges preserve HTML's literal false/true scalar labels and status metadata, while omitted flags remain absent and authored labels/children take precedence. No archive, restore, cancellation or persistence action is claimed.

CancellationForm retains the HTML header, Reason Code select, Reason textarea, default reason choices and empty-choice placeholder. Native controls accept local edits and submission is prevented. Its parameter-name directives do not resolve into policy, reason-choice or deadline enforcement. The fresh consumer supplies `budget`, a non-first choice actually offered by the default HTML-compatible form, instead of a fabricated reason outside that select's options. This is consumer data only; the authentic schema and its parameter directives are unmodified.

CMOS #1801 records the explicit unbound dispositions: ArchiveSummary's restore/actor/metadata and policy directives, ArchivePill's date directive, PriceCardMeta's amount/currency/minor-unit directives, and CancellationForm's policy/choice/window parameter names have no matching implemented HTML term/action. They are documented in the public contract and consumed unbound, never invented as runtime props or credited as a workflow.

## Repairs and retained failures

`fresh-attempt-1.json` reached **66/66 schemas, 132/132 generation cells and 64 governed IDs**, but typed-value tests still failed in both targets. The authentic Subscription/card producer added field-description labels to ArchivePill and CancellationBadge, hiding the real false flags. `authentic-nodes-before.json` and `server-tests-attempt-1.log` retain those operands and failures. Composer and codegen now suppress automatic label enrichment for these two value badges; explicit authored labels remain intact (CMOS #1802). The tests render generated source against both false and true and separately guard authored-label precedence. No schema pruning or relaxed field validation is used.

Initial package tests expected no option for an empty allowedReasons list; the existing shared helper and HTML renderer intentionally emit one empty-valued `Select...` option. Tests now assert that precise behavior. The initial parity test dispatch fell through to a VizAreaPreview-only expectation for the five new names; it now routes these names while retaining the actual computed React/Vue comparison and zero declared differences. Original failures are retained.

`live-attempt-1` failed the first React detail cell's strict TypeScript gate after successful exact-tarball installation: ArchiveSummary received `archivedAt?: unknown`. The retained trait syntax is `datetime?`; the repository's object generator and `docs/universal-quintet.md` define `?` as nullable, distinct from optional property presence. The existing MCP field-type mapper now emits `string | null` without altering the source schema or required flag, and ArchiveSummary accepts null as an omitted date term (CMOS #1803). Tests cover nullable scalar/array/enum type mapping, real generated Subscription/detail with timestamp and null, and native component term omission. No cast-to-string or unknown-prop escape is used. All downstream gates/cells not reached by this failed attempt remain unproven in its receipt.

The ten export bites finished and restored before the nullable patch was applied. They retain their actual source bytes; the later rebuilt positive export/parity tests and packed rerun cover the updated timestamp contract. `mutation-attempt-1/mutation-manifest.json` records ten selected package reds, ten independent readiness reds, 270 unaffected green executions and 280 restored green executions, with byte-identical root restoration in every case.

## Verification commands and observations

```sh
pnpm --filter @oods/components-react exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/components-vue exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/component-contracts exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/component-styles exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/mcp-server exec vitest run test/product-reality/fresh-composition.s187.spec.ts test/product-reality/parity.s185.spec.ts test/product-reality/breadth-export-cells.s187.spec.ts src/compose/object-slot-filler.test.ts test/compose/object-slot-filler.spec.ts test/codegen/ --maxWorkers=2
pnpm exec tsx scripts/product-reality/s185-m04-live-consumers.ts --mission s187-m04 --fresh Subscription/detail,Subscription/form,Subscription/card --output artifacts/product-reality/sprint-187/m04/live-attempt-3
node scripts/product-reality/s185-m03-export-mutations.mjs --components ArchiveSummary,ArchivePill,CancellationForm,CancellationBadge,PriceCardMeta --spec test/product-reality/breadth-export-cells.s187.spec.ts --output artifacts/product-reality/sprint-187/m04/mutation-attempt-1 --mission s187-m04
```

- React `react-tests-final.log`: 15 files / 207 passed. Vue `vue-tests-final.log`: 14 files / 159 passed. Both typechecks pass in `*-typecheck-final.log`.
- `server-tests-attempt-2.log`: 15 files / 387 passed. It covers the affected composition/codegen pipeline, computed cross-framework parity, 28 independently named package export cells, and typed fresh rendering. After the supported reason-code consumer datum was added, `fresh-tests-final.log` passes all 26 fresh tests.
- `styles-tests-attempt-1.log`: 3 files / 33 passed, including actual A/B × light/dark/hc token sources. These are not visual-review or accessibility-maturity promotions.
- Sequential package builds and strict harness compilation pass (`harness-typecheck-final.log`). No source aliases or pre-existing dependencies are used by packed consumers.

No per-mission four-suite capture, shared-service restart, deployment or shared-store adoption is performed.

After nullable lowering, `server-tests-attempt-3.log` passes all 13 files / 361 tests, including all 28 positive export cells and 29 fresh tests. `fresh-attempt-3.json` remains 66/66 schemas, 132/132 cells, 64 governed IDs.

`live-attempt-2` passes both detail cells. React form passes its first seven gates, with correct initial reason/code values and exact action counts, but the added prevented-submit browser probe hits a harness serialization error: tsx injects `__name` for its local named arrow helper. The serialized browser callback now compares captured action-count JSON directly, with no closure helper; no consumer or gate assertion is weakened. The failed browser log and all reached cells are retained.

## Final mission result

`live-attempt-3/report.json` passes all six fresh cells: **46 passed gates, two card interaction N/A, zero failed, zero skipped**. Both framework form logs record initial `Consumer cancellation reason` / `budget`, local edits to `Local cancellation reason` / `no_longer_needed`, prevented submission and unchanged domain action counts. Numeric field updates preserve 7 then 0. Card logs observe literal false archive/cancellation values and the consumer billing interval visibly rendered. Detail logs verify archive terms from real consumer data. The strict harness check is retained as `harness-typecheck-attempt-3.log`.

`contracts-tests-final.log`: eight files / 101 passed. `baseline-fold-check.log`: 150 evidence-supported surface cells across 50 existing IDs, 600 resolved readiness reference occurrences, all 109 identities unchanged. The fold uses the final green m04 packed receipt and leaves unsupported maturity surfaces unverified. `fresh-final.json` records 66/66 schemas and 132/132 build-profile generation cells, 64 governed root IDs, against the full unchanged eleven-object/six-context population. These generation results are distinct from the six selected m04 runtime paths.
