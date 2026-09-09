# s189-m03 — list and timeline collections

Implementation is frozen at `a818a61efaee46c206b65031f8c698baba3b564a`. The generated App supplies store operands and actions to composed screens; it emits no parallel toolbar, record list, or history. Rows, events, and collection query are typed screen props, separate from the object record schema (CMOS decision #1836). Collection refresh preserves the search control and focus through empty results.

## Browser evidence

[Receipt verification](receipt-verification.json) validates 14 AFTER receipts and 42 screenshot hashes, at 390/820/1440 in React and Vue. The public workflow, post-edit/cancel list and timeline, empty standalone screens, and populated standalone screens all render from unmodified public output. [Inputs](inputs/) record the browser steps. [Standalone model provenance](standalone-model.json) comes from the generated store and sample data, not a hand-edited schema.

The list has one Search, one short Status filter, one sort selector, Active/Archived tabs, nine real rows, and one PaginationBar showing nine records / Page 1 of 1. Each row carries StatusBadge, RelativeTimestamp, BillingSummaryBadge, and ArchivedRowOverlay. The active overlay deliberately uses `display: contents`; [DOM verification](wrapper-verification.json) checks nine wrappers around visible records separately from rectangle measurements. The timeline has one nonempty Card per chronological event, two trait-declared payment entries, and a title plus formatted billing summary. Empty standalone collections use the existing Banner. No checked view overflows its viewport.

[Computed parity](parity.json) has zero visible-text or accessible-name differences across both review screens and all three widths, with an empty allowlist. Whitespace is collapsed; case and glyphs remain significant. Accessible names are extracted in DOM order from the native tree; anonymous structural roles are not claimed identical. [BEFORE/AFTER diffs](diffs/) compare the m02 receipts with these AFTER observations. The two known React nested-form console errors during the review setup remain recorded for m04 (learning #536); no receipt error is suppressed.

## Real application checks

[Final packed consumers](app-consumers-final/) pass all eight gates per framework: isolated exact-tarball install, strict typecheck, production build, SSR, mount, hydration, shared CSS, and interaction evidence. Both artifacts have zero consumer-authored components or actions. The Linux Chromium proof passes 18 flow rows and 32 state observations. Four additional collection checks per framework prove typing through empty results without losing focus, clearing back to nine rows, filtering the real active record, sort order, and correct disabled pagination boundaries.

The [navigation bite](app-consumers-final/navigation-bite.json) changes only the generated React row action: `detail-navigation` becomes the sole failed row, the preceding sample/archive check remains green, and byte restoration restores all nine React flow rows. The unaffected Vue flow remains green.

## Census and checks

[Per-schema census diff](census-diff.json) passes: 66/66 single screens, 132/132 target cells, Subscription/workflow 2/2, and 72 governed IDs. The wider population remains 75/77 schemas and 150/154 cells; Organization/workflow and User/workflow retain their pre-existing typed OODS-N016 gaps. All 33 changed schemas are classified by JSON pointer as list collection/control bindings or chronological event collection/header changes. The 62 changed artifact cells belong to list, timeline, or their workflow screens. Shared timestamp formatting is a runtime lowering, without extra schema movement. [All 17 saved-store hashes](store-hashes.json) remain unchanged.

Focused verification, retained under [test logs](test-logs/): collection/workflow/archive integration 25/25; generic emitters plus the earlier collection iteration 73/73; React component scenarios 18/18; Vue component scenarios 18/18; loop 9/9. The final focused integration run has no skipped tests. MCP and loop TypeScript checks and generated-schema check pass. This mission performs no full-suite capture.

Development failures are retained, including Vue string escaping and repeated IDs, a generated React key narrowing error, archive assertions tied to the removed App presentation, and macOS native-select keyboard limitations. One focused attempt raced a prepack build and skipped 11 workflow tests after setup failed; it is not a passing run. The subsequent serial 25-test run and final packed consumers pass. Learning #537 records the build/packing concurrency constraint. Earlier iteration receipts and consumer runs remain separately named; `after/` and `app-consumers-final/` are the frozen evidence.

Form/detail usability, the nested form, cancellation presentation, and sample-data realism remain assigned to m04/m05. This packet is evidence for independent review, not a usability certification. Sprint 189 remains Active.
