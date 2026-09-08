# Forge Sprint 189 — Browser design loop: see it, fix it, reconcile it

**Status:** LOCKED — planning session `PS-2026-09-08-012`, 2026-09-08. Direction chosen by Derek after the Sprint 188 review: the browser design loop plus the Sprint 188 carries.
**Program authority:** [Product Reality Program](../foundational-docs/roadmap/product-reality-program.md) — "The intended loop" (compose, render the same semantic state through runnable React/Vue, adjust, reconcile, check, emit). Exit criterion 8 opened by Sprint 188; this sprint makes the first application usable.
**Predecessor:** Sprint 188, certified and closed by `PS-2026-09-08-011` (decisions `#1831` verdict, `#1832` ranked carries, `#1833` capture policy); PR #86, #87 and #88 merged into `OODS-pro`.
**Build base:** `f4cd1ba3cda3d1d52405582e425ecd6d19890b51` (`OODS-pro` after PR #88), public runtime bytes identical to the reviewed Sprint 188 implementation `d0cf5fe0` (PR #88 changed the roadmap and prose contract tests only).
**Per-mission detail lives in CMOS** (`s189-m01`–`s189-m06`). This memo carries scope, measured facts, settled decisions, the exit gate and the descope ladder.

## 1. What this sprint is

Three things, in this order:

**(a) Ship.** Put the reviewed Sprint 188 head on the live bridge. PM2 still serves `cd8ee986`: nobody using
Forge through the bridge can compose a workflow, generate an application or see the eight billing/archive
rows. Send the reconnect Sprint 188 m06 prepared and left unsent.

**(b) The loop.** The Sprint 188 review found the Subscription app operable but not usable by looking at 36
screenshots by hand. Every defect it found was invisible to 16 gates, 18 flows, 32 state observations and a
66/66 census. The program's own destination vision names the missing piece: render the same semantic state
through the real React and Vue artifacts, let an agent or Derek adjust, and reconcile the change back into the
canonical artifact. This sprint builds that loop as Forge-owned tooling an agent can run — compose, render in a
real browser in seconds, receive a machine-readable receipt (screenshots, layout measurements, accessibility
text, errors, hashes), adjust the producer, re-render, diff — and exposes it as a public tool.

**(c) The carries.** Use the loop to retire the seven ranked Sprint 188 craft carries (`#1832`) at the
producer: the list and timeline contexts become real collections and the generated application becomes the
composition itself instead of a second set of controls beside it; form labels are names with descriptions as
help; recipe-owned fields are not duplicated; the detail screen is read-only with honest tabs; components and
sample data stop lying (`Archived: false`, `Event 1`, `1 records`, `Next payment` equal to `Last payment`).

## 2. Measured starting point

Measured during planning at `f4cd1ba3` from the Sprint 188 frozen evidence, the built Sprint 188 worktree and
the live PM2 process. Facts, not estimates.

| Surface | Measured now |
|---|---|
| Served bridge | PM2 `oods-forge-bridge` PID 85319, cwd `packages/mcp-bridge` of the primary checkout, port 4466, health ok with 20 tools and **no revision field** (the field ships with this delivery). Primary checkout `Forge-expansion` at `cd8ee986`, clean, strict ancestor of `OODS-pro`. Store `packages/mcp-server/.oods/schemas`: 16 records + index at the Sprint 188 m01 post-adoption hashes (User form version 2). |
| Composed Subscription/list (12 nodes) | `list-toolbar`: `SearchInput` (unbound), `Select` on `cancel_at_period_end` labeled by its description, `BillingSummaryBadge` bound to the **screen's** amount/currency/interval. `list-items`: one `StatusBadge`, one `RelativeTimestamp`, one `ArchivedRowOverlay`, all bound to the screen's single-record props. `list-pagination`: `PaginationBar` (unbound). The schema declares no collection; `PageProps` are one record's 36 fields. |
| Generated workflow App | `workflow-emitter.ts` emits its own raw-HTML toolbar (`<input type="search">`, status `<select>`, sort), `<ul class="workflow-records">` with per-record `ArchivedRowOverlay`/`StatusBadge`, `Tabs` for archive views, a footer count, and `<ol class="workflow-history">` on the timeline screen — beside the composed screen, which renders once with one record's props. `AppState` = screen, uiState, id, draft, records, total, page, archived, error, notice, revision. |
| Composed Subscription/timeline (14 nodes) | Header `Text` bound to `amount` labeled "Recurring price expressed in minor units…"; five fixed `Card` entries: entry-0 holds `PaymentEventTimeline`, entries 1–4 are empty `Stack`s. |
| Composed Subscription/detail (26 nodes) | Header: `StatusTimeline`, `CancellationSummary`, `ArchiveSummary`. `Tabs` with eight panels: Billing (`CycleProgressCard`), Status & History (`PaymentTimeline`), Details (empty), Status (`StatusBadge` on payment_status), Dates & History (`Text` amount), Pricing (empty `Card`), Details 7 (empty), Pricing 8 (empty). Meta: `AuditTimeline`. The editable "Cancellation details" fieldset seen in the review is emitted by the workflow App, not composed. |
| Composed Subscription/form (29 nodes) | Every generic control is labeled by the field's description (sentences ending in periods). Trait recipes `StatusSelector`, `CancellationForm`, `BillingIntervalSelector`, `BillingAmountInput` are placed **and** the raw fields they own (`status`, `cancellation_reason`, `billing_interval`, `amount`) are also emitted as generic controls. `DatePicker` on `cancellation_requested_at` receives an ISO datetime and shows blank. One `Save` button composed; the App adds generic Change/Submit. |
| Components | `StatusTimeline` React port (`components-react/src/ported.tsx:342`) labels entries `Event ${index+1}` while `breadth.tsx`, the Vue ports and the HTML renderer use `Event` and a different label/state/reason order. `ArchiveSummary` (`breadth.tsx:1064`) renders `firstScalar(isArchived)` literally as `false` by decision `#1801`. `AuditTimeline` is declared by Timestampable (`traits/lifecycle/Timestampable.trait.yaml:87`) and Auditable; sample data never seeds it. |
| Compose inputs | `design.compose` accepts `object`, `context`, `layout`, `intent`, `preferences` {theme, metricColumns, fieldGroups, tabCount, tabLabels, componentOverrides}, `options` {validate, topN}. |
| Existing render surfaces | `fidelity.preview` (boxes-arrows / wireframe / review / branded-mockup HTML), `repl.render` (HTML), Storybook, the bridge. None renders the real React/Vue artifact in a browser. The Sprint 188 harness (`scripts/product-reality/s188-m03-app-consumers.ts`) does — pack, exact-tarball install, strict typecheck, vite build, SSR, browser gates, screenshots — in **94 s** for both frameworks (m06 receipt). Fresh census 1 s; prose tests 4 s. |
| Tests | Root `core` vitest project includes `packages/mcp-server/test/**` in parallel with ~530 files, `testTimeout` 20 s; `packages/mcp-server`'s own project runs the same specs with `fileParallelism:false`. Root-core's five slowest files are all product-reality git-range/census specs (archive-workflow.s188 62 s, workflow.s188 61 s, sprint-wide-movers.s185 53 s, public-head-equivalence.s185 48 s, fresh-composition.s187 40 s); the mover test timed out at 21.9 s in the Sprint 188 capture and ran in 1.1 s alone. The root config already excludes earlier heavy specs with retained attribution (s185/s186 recovery pattern). |
| Baseline census at `f4cd1ba3` | The planning probe ([forge-s189-planning-probe](forge-s189-planning-probe/README.md)) measures **75/77 schemas and 150/154 cells, 72 governed IDs**: the census now enumerates `workflow` for all 11 objects; the 66 single-screen schemas, 132 cells and Subscription/workflow 2/2 are green (the certified Sprint 188 population reproduces), while Organization/workflow and User/workflow compose but return the typed `OODS-N016` gap (no domain implementation) in both targets. Pre-existing at the build base; m06 reports the same population honestly. |
| Tooling | Node v24.6.0, pnpm 9.12.2, Playwright 1.56.1, Vite 6.4.1 (pinned in `PUBLIC_EXTERNAL_VERSIONS`). macOS native `<select>` popups are not driven by Playwright; real arrow-key proofs use the Linux Chromium browser server (`OODS_PLAYWRIGHT_WS_ENDPOINT`) as in Sprint 188 m04. |

## 3. Anti-circularity

Every screen stays the unmodified output of the public composer; the loop consumes the public `design.compose`
and `code.generate` handlers and a real browser, and contributes nothing but observations. "Adjust" changes the
producer — composer, emitters, components, sample data — or public compose preferences; it never edits a
composed or saved schema by hand. Every movement in the 66 fresh schemas is enumerated per schema by class
against the previous mission head (the `#1817`/`#1822`/`#1825` discipline); anything outside the declared
classes fails. Saved-store records are untouched. The generated application is proven by the same
packed-consumer harness as Sprint 188 with zero consumer-authored components or wiring.

## 4. Settled decisions (planning decides; the builder does not re-plan)

1. **Served checkout = the primary checkout, fast-forwarded** to `f4cd1ba3` with the Sprint 188 m01 packet
   shape (observe, ff-only, frozen install, ordered builds, manifest verification, `pm2 restart`, `pm2 save`,
   rollback recipe). No adoption this time. The Sprint 188 reconnect draft is **sent** in m01.
2. **Delivery proves the compiled revision by discriminating behavior**: `/health.revision` equals the stamped
   build commit and the checked-in manifest hash; `design.compose` Subscription/workflow returns four routed
   screens; `code.generate` of it emits an App root in both targets; `catalog_list` shows the nucleus real in Vue
   and the eight rows stable. Health alone is never proof.
3. **Capture policy `#1833` lands before any capture (m02).** The five git-range/census specs leave the root
   `core` project's collection and stay in the serial mcp-server project (documented exclusion, per-file
   attribution in suite accounting); git-range tests carry an explicit 60 s timeout. Retry rule: a lone
   wall-clock timeout with no assertion failure gets exactly one isolated rerun retained beside the original
   and is disclosed, never a full recapture; an assertion failure or a repeated timeout requires a fix and one
   corrective capture; at most two full captures per sprint without a new decision.
4. **The loop is Forge-owned runnable tooling first, a public tool second.** `scripts/design-loop/` (`serve`,
   `render`, `diff`, `status`) renders through the real React and Vue artifacts mounted in clean exact-tarball
   Vite consumers in a real browser — never through the server-side HTML renderer alone. `serve` pays the pack
   and install once and keeps dev servers up; `render` must complete in under 15 s per framework when warm.
   `design_preview` (m05) is the MCP face over the same runnable and returns a typed gap when the loop server
   is not running. `fidelity.preview` and `repl.render` are unchanged.
5. **Receipts are the unit of evidence.** A render receipt is JSON validated against
   `scripts/design-loop/receipt.schema.json`: compose inputs, schema hash, artifact hashes, screenshots at
   390/820/1440, layout measurements (document vs viewport width, boxes exceeding the viewport, per-glyph
   wrapping), an accessibility-tree text dump (role, name, value, DOM order) per width, page/console errors,
   timings. The m02 BEFORE set must mechanically contain the review's defects; the m06 AFTER set must show each
   `#1832` item resolved line by line or carried with a reason.
6. **Reconcile means the application is the composition.** The list context declares a collection
   (`rows`) with a row template (primary label, `StatusBadge`, `RelativeTimestamp`, `BillingSummaryBadge`),
   the trait-declared `ArchivedRowOverlay` wrapping the collection with Active/Archived tabs, toolbar controls
   bound to query/filter/sort and `PaginationBar` bound to page/pageSize/total. The timeline context declares an
   `events` collection (state history plus trait-declared payment events, chronological) rendered one entry per
   event, with a header of title plus formatted billing summary. Emitters iterate collections with typed
   `rows`/`events` props on single-screen artifacts; the workflow App binds the composed controls to the store
   and emits no parallel toolbar, rows or history. A declared screen action wired to a control is not also
   rendered as a generic button. This moves `repl.ui.schema.json` and generated types; m06 accounts for it.
7. **Labels are names; descriptions are help.** The visible label is the field's short name or a trait-declared
   label; the description renders as help text under the control in HTML, React and Vue. The "Field N" pin
   stays. A placed trait recipe that binds a field **owns** it: the generic control for that field is not
   emitted (`BillingAmountInput`→amount, `BillingIntervalSelector`→billing_interval, `CancellationForm`→
   cancellation_reason and reason code, `StatusSelector`→status).
8. **Detail is read-only.** Header extensions never render editable controls; the cancel affordance is the
   trait's `CancellationForm` shown on demand from "Cancel subscription". Tabs exist only for non-empty panels
   with content-derived, unnumbered, unique labels. `AuditTimeline` binds to the object's declared history
   source (state history for Timestampable objects) or is omitted; never "No events" beside a populated timeline.
9. **Booleans render Yes/No** in HTML, React and Vue for summary terms (`ArchiveSummary` first), superseding
   `#1801`'s literal false/true text for those terms and matching `#1790`'s boolean lowering. Pills keep their
   status text unless the loop shows them wrong.
10. **One shared date-time formatter** (en-US, UTC for proofs, injectable) is used by emitters and the
    timeline/summary components; ISO strings never reach the DOM as display text. Datetime fields lower to a
    control that shows the seeded value.
11. **Sample data tells a coherent story**: next payment due = last payment + interval; the current period
    brackets the seed date so active records show a mid-cycle percentage; ended records alone show 100%/0 days;
    uncancelled records carry no cancellation metadata; history and audit seeds agree with the status.
12. **Evidence bar and pace.** Per mission: loop receipts before and after in both frameworks, focused suites,
    class-enumerated census diff, flow-harness rerun where the app moved, computed cross-framework parity with an
    empty allowlist. One four-suite capture at m06 under `#1833`. No per-mission captures, no critic workflow, no
    new closeout framework.
13. **Delivery cadence:** each sprint's first mission delivers the previous sprint's reviewed, merged head. This
    sprint's code reaches the bridge in Sprint 190 m01; the m06 reconnect is prepared, not sent.

## 5. Missions (serial; each mission's gate is executable)

| Mission | Outcome | Gate |
|---|---|---|
| `s189-m01` Ship | Served bridge on `f4cd1ba3` with `/health.revision`; store byte-identical; Sprint 188 reconnect sent | Four discriminating calls pass on the served process; 17 store hashes unchanged; two message IDs recorded |
| `s189-m02` Render leg | `scripts/design-loop` serve/render/diff/status; `#1833` test handling; BEFORE receipts | Receipts for 5 screens × 2 frameworks reproduce the review's defects mechanically; warm re-render < 15 s and byte-identical; mutation bite; five specs out of root-core with attribution |
| `s189-m03` List and timeline as collections | Composition is the screen: rows/events collections, bound toolbar and pagination, App emits no parallel UI, formatted timestamps | Receipts free of the list/timeline defects in both frameworks; flow harness and 32 states green; census diff enumerated by class; parity empty |
| `s189-m04` Form and detail | Short labels + help text, recipe-owned fields, datetime lowering, single Save; read-only detail, honest tabs, AuditTimeline truth, Yes/No terms, 390 px summary grid | Receipts free of the form/detail defects; flow harness (edit/save, on-demand cancel) green; census diff enumerated by class; parity empty; value tests |
| `s189-m05` Component carries + design_preview | Archived badge, StatusTimeline parity, pluralization, sample-data realism; public `design_preview` tool | Receipts and parity for the component fixes; ten-record sample spec; tool receipt equals direct render receipt; typed gap when stopped |
| `s189-m06` Proof and handoff | Census 66/66 + 132/132 + workflow 2/2; one capture under `#1833`; AFTER receipts and the seven-item mapping; advertised diff from `f4cd1ba3`; reconnect prepared; review handoff | Claim ledger binds every criterion; `builderSelfCertified:false`; PR opened, CI observed |

Mission order puts the eyes (m02) before the fixes (m03–m05) on purpose: every fix is made by looking at a
receipt, and the BEFORE set exists before anything moves.

## 6. Exit gate

From the program authority: *"The same semantic workflow is usable in both frameworks with loading, empty,
error, and success states"* and criterion 8: *"At least one complete greenfield application is generated and
usable in React and Vue."* Sprint 188 met the first sentence mechanically and the review declined to certify
"usable". Sprint 189 exits when every one of the seven `#1832` items is resolved in the frozen-head AFTER receipts
in both frameworks or explicitly carried with a reason, the four states still pass on every screen, the census
movement is fully attributed, and the loop itself is proven (BEFORE receipts reproduce the review; warm
re-render under 15 s; diff names a mutation). **"Usable" is again decided by the independent review — this
time with the receipts in hand.** The sprint does not claim persistence, a backend, URL routing, permission or
confirmation primitives, responsive or accessibility maturity of the 72 families, or any design-surface adapter.

## 7. Descope ladder (declared now, in order)

1. Drop `design_preview` (the MCP tool); keep the runnable and carry the tool by name.
2. Drop sample-data realism (`#1832` item 7) with an explicit carry.
3. Limit detail tab work to removing empty panels; carry label dedupe.
4. Capture receipts at 390 and 1440 only; name 820 unproven.

**Never cut:** m01 in full; the render leg reproducing the BEFORE defects; list and timeline as collections in
both frameworks with the App emitting no parallel UI; the four states on every screen; class-enumerated census
diffs; zero consumer-authored wiring; the edit/save and on-demand cancel flows.

## 8. Out of scope, carried by name

URL routing and router adapters. Persistence and backends. Permission and confirmation primitives. Any external
design-surface adapter (Figma, Penpot, MCP Apps) — the loop is local, file-backed and browser-based and is not an
adapter decision. Visualization closure #1372. Alias retirement (#1382/#1385). Accessibility/theme/interaction
maturity cells. Maintenance #1315 and #1318–#1322. Parts Town. `TimelineEntryLabel`, `SortIndicator`,
`AuditSummaryCard`. Craft of the other ten objects beyond class-enumerated movement. Saved-store recomposition.

## 9. Build and review

Build fresh in `/Users/systemsystems/.codex/worktrees/s189/OODS-Forge`, branch `codex/sprint-189-browser-design-loop`
from `f4cd1ba3`, from this memo and the CMOS missions only. The builder records evidence and stops; the separate
review session decides close and inspects the BEFORE/AFTER receipts. Delivery in m01 touches the shared PM2
process from the primary checkout; everything else stays in the worktree.
