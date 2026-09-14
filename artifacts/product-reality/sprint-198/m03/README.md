# Sprint 198 M03 — detail and timeline craft

Built for review. `builderSelfCertified: false`. Accepted source: `7bc0aebbcd241b2fda9b9c87649e25efa4ea14b3`; baseline: `8762d3768c97294e763270a271df647a85ab98af` (component bytes unchanged from m02's accepted e307810dd build).

[Open the comparison sheet](index.html). [Per-item receipt lines](item-mapping.json). [Verification](verification.json) covers 132 views: Organization, User, Subscription, Invoice and Plan × React/Vue × detail/timeline × light/dark × 390/820/1440, including both Subscription detail tabs. All pass: no page/console errors, viewport overflow, editable read controls, empty Cards, duplicate tab names, raw date/boolean/lifecycle values, or React/Vue visible-text differences. No usable certification or delivery is claimed.

## Item mapping

| Review item | Producer result | Receipt |
| --- | --- | --- |
| #1832 (2) | Declared read fields format UTC dates and boolean answers; plain money uses the record currency and explicit storage divisor. Existing ArchiveSummary already rendered actual booleans as Yes/No at this baseline; retained and tested. | `verification.json` and each `after/{Organization,User,Subscription}/{react,vue}/craft.json`: visibleText, editable fields and screenshot at each width. |
| #1832 (4) | One group per tab name; no empty Card scaffolding; editors removed throughout read trees. A removed metadata column no longer consumes half the detail width. | Same craft receipts: tabs, emptyCards, editable, headings; `detail-craft.s198.spec.ts` covers every detail-capable object and repeated reconciliation. |
| #1881 (4) | Card and CancellationSummary retain component aliases with semantic surface/text/border fallbacks. Measured recipe colors equal the actual sys-token probes in both themes. The frozen historical ported CSS block remains intact. | Same craft receipts: tokens and surfaces. All 132 views compare computed styles against token probes. |
| #1881 (6) | Lifecycle words are humanized, authored titles retain actual from/to states, timestamps/actor/reason remain intact, redundant record-label prefixes are removed from event cards. Payment and chart data remain related to the same unchanged record amount. | `after/Subscription/{react,vue}/craft.json`, `verification.json` file attribution, `subscription-pixels.json`. |
| #1915 (1) | Invoice has an invoice-identity heading with labelled contact/amount fields. Plan has named record fields and formatted amounts. Plain amounts use the governed BillingSummaryBadge `showInterval:false` option; recurring-price defaults remain unchanged. | `after/{Invoice,Plan}/{react,vue}/craft.json`; generator and both package tests prove the explicit storage divisor and existing default behavior. |
| Tabs OODS-V007 | Static HTML panel trees retain content/layout and keyboard navigation. Full Invoice/Usage HTML still refuses domain actions explicitly because static HTML has no action runtime. Owner: Forge code-generation maintainers. | `html/{Invoice,Usage}.json`, `html/proof.json`, generated tool ledger `code.generate` row and generated docs. Six HTML keyboard/content captures pass. |

Read-only summaries add object-specific scalar fields, identifiers, money and audit dates; richer trait recipes own their remaining fields. UI hints and trait schema bookkeeping are not promoted into read fields. Seed plausibility and composite editor options are m04's work; no `sample-data.ts`, store, lifecycle logic, list/form screen, action implementation or chart SVG was changed here.

## Attribution and capture boundaries

`verification.json` records per-file SHA-256 changes in all ten compared workflow artifacts. Changes are limited to Detail, Organization Timeline, and the application's node-to-field dispatch map. Removing that map line leaves application code byte-identical. List, Form, App shell, store, samples, actions and light chart SVG files remain byte-identical. Package behavior changes are separately identified in `source-identity.json`.

`subscription-pixels.json` measures all 18 matching light Subscription views, including changed overlap pixels, dimensions and height deltas. Detail changes come from full-width layout, labelled summaries and readable lifecycle words; timeline changes expose the authored event title and actual state. Subscription's 10 light SVG assets per framework are unchanged. Dark AFTER assets are generated for dark, with measured chart canvas `#101215`; light is `#F9FAFC`.

The initial BEFORE dark images switched only the root theme of a light-generated artifact. They are retained as theme-switch stress evidence, **not** a dark-chart equivalence baseline. Pixel attribution therefore uses matching light views. The accepted AFTER set uses separate light/dark generation; no accepted view is taken from an earlier attempt.

Earlier diagnostic passes are retained in `initial-layout-pass/`, `before-money-display-correction/`, `before-empty-text-parity/`, and `before-authored-transition-preservation/`. They are not acceptance evidence. The last pass exposed the importance of retaining from/to state even when an event has an authored title.

## Validation

- MCP targeted regression: 207/207 across eight files, no skips; after the final authored-state preservation change, the affected 24 detail/strict compilation tests and 142 shared-contract tests passed again.
- React package: 633/633; Vue package: 617/617, no skips. The last shared event change is covered by the contract suite and final browser comparison.
- Component styles: 47/47, including 29 browser HC checks and token-resolution mutation probes. No chart goldens or color thresholds changed.
- Root TypeScript and the MCP package's own TypeScript configuration passed after the final source change.
- The tool ledger and docs are generated; `docs:check` is a required final check recorded in `verification-commands.json`.

Raw logs are in `logs/`. Early failures found missing generated dependency metadata, stale validation expectations, a frozen CSS-block invariant, an overly broad summary assertion, and the absent `collections.s188.spec.ts` filename in an initial command. The actual `collections.s189.spec.ts` suite was run and passed (12 cases), then included in the 207-case pass. No test timeout was increased and no test was silently skipped.

`capture.ts`, `html-proof.ts`, `verify.py`, `pixels.py`, and `index.py` reproduce the screen/HTML/measurement reports. The preview uses local Chromium with fixed `2026-09-08T12:00:00Z`, en-US and UTC for matching image comparisons; m07 owns the final pinned-Linux runtime census. Source work is confined to the isolated s198 worktree. Primary checkout, managed services and consumer repositories are untouched.
