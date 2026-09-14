# Sprint 198 M04 — forms and deterministic sample data

**BUILT FOR REVIEW. `builderSelfCertified: false`.** Accepted implementation and packed-browser source: `5d3a2f4d3794fa03c3eeff8589f9b0cfc289679b`. Baseline source: `9739f122d1daa017ba1802f949a2b3d04cf4c167`, with unchanged component packages packed from `7bc0aebb`.

[Open the comparison gallery](index.html). It covers Organization, User, Subscription, Invoice and Plan forms/timelines in React and Vue at 390, 820 and 1440 CSS pixels, brand A/light. The extra Subscription/005 proof exercises populated cancellation controls. [Verification](verification.json) records **60 main views + 6 seeded-cancellation views**, zero browser errors, viewport overflow, visible-text differences, or control-value differences. Every measured required mark shares its label line.

## Changes and criterion mapping

[Item mapping](item-mapping.json) binds all 18 review items from #1832(3), #1881(7), and #1915(2)(3) to exact receipt lines in both frameworks and screenshot paths.

- Field titles become real controls; Invoice billing contact name is editable. Short names, codes and Collection state use single-line inputs. Timezone is a text value, period dates are dates, and datetime inputs use UTC datetime-local values. Existing billing amount/interval/reason ownership and the single Save remain verified.
- Descriptions remain help text. The generated app no longer overrides component label layout with a generic column rule. Required marks stay inline; checkboxes and labels share their center line. Supplemental identifiers use the available width.
- One producer, `workflowSampleData`, returns records and an attributable seed table. Workflow apps and standalone design-loop previews use that policy; explicit caller operands remain authoritative. Stable display names, reserved example domains/emails/URLs, record IDs, declared enums, and September periods replace placeholder strings. The historical consumer-contract model remains a test probe, not the design-loop preview seed source.
- Field metadata preserves authored defaults/examples and resolves trait parameter defaults/enums. Preference namespaces and schema version honor each object's declared parameters. Authable and Communicable examples are checked against the existing canonical role and messaging catalogs. Empty production catalog defaults remain unchanged. Preference documents are serialized into the editor; catalog names display while IDs remain values. Vue's omitted selections now match native React first-option selection.
- Invoice totals reconcile with authored line-item amounts; payment-history amounts follow the record price. Authored chart rows remain authoritative. Invoice timeline uses its declared creation timestamp; Plan uses its declared period date as **Period started**. Shared `recordCollectionEvents` supplies app and preview events and never fabricates a timestamp for a record lacking one.

[Seed tables](seeds/Organization/seed-table.json) exist for all **18 objects / 171 records** under `seeds/<Object>/seed-table.json`, including Chunk's supported inline context. Each entry contains record ID, field, value, and the producer rule. An exhaustive audit of all 170 records across the 17 timeline-capable objects found zero empty event projections.

## Subscription attribution and proof limits

[Pixel attribution](subscription-pixels.json) records 12 matching before/after form and timeline views. Changes are attributable to m04 names/prices/emails, resolved enum controls, inline required marks, field layout, and shared event projection. Artifact-file hashes and reasons are in [verification.json](verification.json). Nine of ten generated Subscription chart SVGs change because their record prices change; the first remains identical. The chart declarations and authored Invoice chart rows are unchanged. Stored IDs and the action contract remain stable.

The additional pending-cancellation proof retains `customer_request` in both frameworks, fills `2026-09-01T12:00`, and measures a zero-pixel checkbox/label center delta at all three widths. An active record's absent cancellation datetime remains empty. These are craft and data receipts; the full usable-flow retake and review certification belong to m05 and review respectively. Composite components retain their documented interaction contracts.

## Verification

- Focused MCP: **96/96** across form seeds, form/detail, detail craft, list craft and collections. After the final app label rule, the affected form-seed suite passed **29/29**, including strict generated Organization/User React/Vue compilation and HTML catalog labels.
- React components **635/635**; Vue components **620/620** after the mounted default-selection regression test; shared contracts **145/145**; styles **47/47** including browser/forced-color checks.
- Design-loop **15/15**; parsers and affected traits **49/49**. Root and MCP TypeScript checks pass. Generated schema check and full `docs:check` pass; docs and tool ledger are generated from accepted source anchors.
- No test skips in those accepted runs. Logs and command attribution are retained under `logs/` and [verification-commands.json](verification-commands.json).

Earlier captures remain under `before-catalog-label-fix/` and `before-label-selection-parity/`, excluded from acceptance. They exposed UUID labels/mobile overflow, required-mark stacking, and blank Vue default selections. Earlier tests also caught fixture assumptions about open User statuses, Plan's date type, User's schema version, and valid older payment-history dates. One overlapping list run timed out in Vue compilation and emitted a worker-update timeout; the isolated rerun passed all 23 tests, followed by the complete 96-test focused run. No timeout was raised and no failed run was relabeled green.

The primary checkout, shared services and other repositories were not changed. No delivery or consumer notification was performed.
