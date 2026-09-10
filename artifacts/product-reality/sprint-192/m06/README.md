# Sprint 192 m06 — evidence-derived discovery

Built, independent review pending. Decision #1889. No classification approval or external message is implied.

The same refresh invocation generates the current capability ledger and `2026-09-10` structured export. `catalog-proof.mjs` calls the built `dist/tools/catalog.list.js` handler and compares all nine surfaces for all 109 rows against the export, built package API and ledger. `catalog-list-dist.json` retains the actual response; `catalog-verification.json` binds the bytes. Historical baseline copies equal the original 5fdf8a18 bytes; the legacy API name `componentCapabilityBaseline` and `getBaselineCapability` now read the generated ledger. The original baseline remains for frozen historical replay.

| Surface | Measured state |
|---|---|
| React / Vue | 75 implemented, 34 unavailable per framework |
| HTML | 109 mapped |
| Contract | 75 versioned, 34 metadata-only |
| Generated consumer | 61 evidence-complete, 48 unavailable; not a 154-cell runtime claim |
| Accessibility / theme | 75 verified, 34 unavailable with reasons |
| Interaction | 24 verified, 51 static not-applicable with reasons, 34 unavailable with reasons |

Projection reads each readiness class, actual named passing assertions, complete six-scope reports, screenshot hashes and referenced files. Missing assertions, missing theme rows, incomplete emission readiness, contradictory interaction classifications, altered screenshot hashes, missing obligations or invented approval all fail the tests. No governed cell says unverified. Theme proof is the m05 Linux 900-cell receipt; independent review and broader runtime maturity are separate obligations.

The assembler's date-filename regex is unchanged. Two structured data files are added (`oods-components-2026-09-10.json`, `oods-tokens-2026-09-10.json`); existing historical files stay frozen, while manifest and code-connect timestamp select the new export. The runtime/planning schemas remain byte-identical and accept the pending classification state. The only new provenance allowlist entry is the exact proposal-v2 JSON path; executable CMOS paths and developer paths remain forbidden. Schema-derived types and API docs were regenerated.

The narrative, Tool-Specs and roadmap now state the ledger-derived values; 41 traits is unchanged. The CI carrier gains its sixteenth job, component-packages, without altering root-core's project set. Its membership assertion compares exact sets while keeping historical carrier row IDs stable. The frozen Sprint 187 surface fold now imports the historical file explicitly, preserving all its old assertions. Sprint 185 readiness checks retain exact original six-class evidence and additionally check the three new classes. The Sprint 184 current-contract pin now recognizes all 75 v1.1 contracts while its historical records remain frozen.

## Verification and retained failures

- `python-green.log`: 26 tests and 15 subtests passed. `python-first.log` and `python-second.log` retain failures: the old snapshot comparison overlooked the reviewed Sprint 190 MarkArea chart declaration and Subscription placement; the correction asserts exactly those additions before comparing every remaining historical byte-level value. The ETag pin reflects those inputs and the explicit pending scope. `refresh-first.log` retains the missing local jsonschema dependency; an isolated `/tmp/oods-s192-python` environment supplied PyYAML/jsonschema/pytest. No global Python changes.
- `contracts-green.log`: 133 tests passed, zero failed/skipped. The initial new test caught missing resolution objects on the 15 historical native rows; all rows now have explicit resolutions. `contracts-first.log` retains the failure.
- `server-focused-green.json`: 624 tests passed, zero failed/skipped. `server-focused.json` retains five failures from the old 106/3 HTML status pin and stale runtime schema. The current 109/0 pin and identical planning/runtime schema pass, including structured-data validation and portable discovery.
- `prose-green.log`: 14 tests passed, zero failed/skipped; the initial carrier-order failure remains in `prose-first.log`.
- `typecheck-first.log`: root TypeScript passed. Both schema generators and API docs completed. No full-suite capture ran in this mission.

## Prepared approval request — not sent

Derek: review `component-reconciliation.proposed.v2.json`, which retains every one of the 109 obligations and proposes **24 native, 84 recipe and 1 alias**. Each row links evidence, a resolution and compatibility note; 75 have governed implementation and 34 remain implementation-pending. Recipe primitives identify the existing HTML root where appropriate, without pretending that an HTML renderer establishes React/Vue implementation. TimelineEntryLabel explicitly resolves to InlineLabel; PaymentEventTimeline retains its public ID and aliases PaymentTimeline. Please decide the classification proposal separately from implementation coverage and independent sprint certification. `approvedRuntimeCensus` remains null until that decision; this prepared text does not submit or decide it.

Every class change from v1 is below (all were authoring-only):

- ArchivedRowOverlay: authoring-only → native.
- AuditSummaryCard: authoring-only → native.
- BillingAmountInput: authoring-only → native.
- BillingCardMeta: authoring-only → native.
- BillingIntervalSelector: authoring-only → native.
- BillingSummaryBadge: authoring-only → native.
- CycleProgressCard: authoring-only → native.
- PaymentEventTimeline: authoring-only → alias.
- PaymentTimeline: authoring-only → native.
- SortIndicator: authoring-only → native.
- TimelineEntryLabel: authoring-only → recipe.
