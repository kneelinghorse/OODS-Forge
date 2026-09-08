# s188-m05 — billing views, archive rows, discovery and revision

Implemented under decisions **1822 and 1825**. M04 completed at `8561d83c`; the approved M05 checkpoint is `fbeef211`. The original blocked report and failing evidence remain in `blocked-checkpoint.md`. Sprint 188 remains Active, `builderSelfCertified: false`, and usability requires independent review.

## Exact placement proof

The approved patch is applied without additional composer changes: `isTraitRecipe` preserves declared recipes during pattern grouping and permits a main-position recipe to use the first timeline entry when no normal route matches. The five new IDs extend the existing component-to-directive declaration. Parameter resolution and exclusion from generic selection retain decision 1822's behavior.

`resolved-census.json`, `resolved-schemas.json` and `billing-placement.s188.spec.ts` compare the entire schemas against the M04 head: **61/66 unchanged**, five changed schemas, **132/132 build generation cells green**, plus two green Subscription/workflow cells. Every delta is an exact assertion; no OODS-V007 remains.

| Object/context | Trait | Declared placement | Parameter / field attribution |
| --- | --- | --- | --- |
| Subscription/detail | financial/Billable | CycleProgressCard, slot-tab-0-4 | progress, period start/end and interval field directives |
| Subscription/detail | financial/Billable | PaymentTimeline, slot-tab-1-6 | last/next payment, status, method, amount and currency field directives |
| Subscription/timeline | financial/Billable | PaymentEventTimeline, slot-entry-0-4 | last/next payment, status, amount and currency field directives |
| Subscription/card | financial/Billable | BillingCardMeta, slot-footer-6 | minorUnitsParameter: minorUnits retained; minorUnits: 100 resolved |
| Subscription/list | lifecycle/Archivable | ArchivedRowOverlay, ve-items-13 | is_archived; grayed, showBadge/separateTab true, tabLabel Archived |
| Transaction/list | lifecycle/Archivable | ArchivedRowOverlay, ve-items-13 | same authored archive fields and presentation |

The receipt enumerates every full prop set and parameter. Workflow repeats the Subscription list/detail/timeline placements with source-context prefixes and is compared in full. Detail header allocator IDs shift 24–26 to 26–28; the former generic status-pattern children and generic second-tab metadata are replaced by the declared billing nodes. No other movement is permitted.

Both required negatives pass: Article's entire generic status-pattern Stack, metadata and field children remain identical to M04; an unroutable main-position Text extension leaves the timeline unchanged and emits the original unplaced warning. Product's six generic contexts select none of the five recipes. `resolved-placement-final.log`: 11 passing M04/M05 guards. `resolved-census-tests.log` includes the expanded workflow enumeration. Historical M04 tests pin both their renderer and parameter-resolution cohort; no frozen evidence is edited.

## Component and packed evidence

The five IDs have contracts, shared scenarios, prop-value contracts, HTML/React/Vue implementations and root exports, token styles and six-class readiness. PaymentTimeline and PaymentEventTimeline are distinct public IDs over one internal target primitive and common chronological value logic. Injected-clock cycle tests cover 40%, date-derived progress and ended periods; payments preserve chronology and declared missing terms; card money preserves minor units, zero and JPY/1; archived content is dimmed, badged and accessible while active children keep their semantics.

- `react-tests.log` and `vue-tests.log`: **83 passing tests each**, no skips.
- `parity.json`: **13 computed HTML/React/Vue cases**, empty allowlist, zero differences; `parity-tests.log`: 13 passing tests.
- `export-bites/mutation-manifest.json`: **10 physical root-export deletions**, selected cell red, other nine green, exact byte restoration. These component implementations and exports were unchanged during the approved placement resume.
- `styles-tests.log`: eight passing style contracts; `contract-tests.log`: 102 passing tests across eight files, including the frozen historical fold.
- `packed-consumers/report.json`: **eight fresh React/Vue consumers**, four Subscription contexts. **60 passed gates, four N/A interaction gates** for static timeline/card, zero failed/skipped. Clean exact tarball installs, strict types, builds, SSR, mount, hydration and CSS all pass. The detail/list interaction gates pass; required mounts retain React's initially absent inactive payment tab honestly.

## Generated application proof and craft

`app-consumers-final/report.json`: **16/16 gates, 18/18 flow checks, 32/32 state observations and 36 screenshots** at 390/820/1440. Generated code owns the application, actions, store and data; consumer-authored components/actions remain zero. The original edit/save/cancel/history sequence and M04 amount/interval persistence remain green. Real archive tabs are keyboard operated, show nine active records versus one archived record, retain the trait label, expose the archived record's accessible group name, and compute opacity 0.6. Actual cycle/payment roots are observed after detail-tab navigation and payment events after timeline navigation. Card has separate packed-consumer proof because workflow has no card screen.

`navigation-bite.json` preserves the isolated React navigation failure, byte-identical restoration and green unaffected Vue flow. The 36 screenshots include the original four contexts plus actual archived-list and payment-panel views. No measured base screen overflows the viewport.

The screenshot run exposed app CSS faults: the fixed-width sidebar compressed the mobile billing panel and covered its tab; shrinking tab labels and an in-flow overflow menu destabilized the tablet menu. The workflow stylesheet now stacks the sidebar on narrow screens, gives Tabs a shrinkable container, keeps labels at intrinsic width and positions the overflow menu over content. Both frameworks navigate these controls with ordinary clicks; no forced clicks or keyboard workaround masks pointer failures. `layout-diagnostic/` retains the targeted 36-image verification; final proof uses fresh complete artifacts. Earlier failed app runs are retained as `app-consumers/`, `app-consumers-layout-attempt/` and `app-consumers-overflow-attempt/`. `mobile-workflow-tests.log`: 11 passing tests including strict React/Vue app typing; `workflow-final-tests.log`: 13 passing workflow/archive-label tests.

Review carries remain explicit: duplicated source and application controls, the generic list's misleading No items, raw amount/interval fields beside billing controls, raw ISO timestamps, a narrow CancellationSummary value column, a wrapped archive badge, surplus detail tabs and empty timeline cards. These are not waived or called usable. M03's craft self-report remains relevant. Linux Playwright/Chromium and its exact image digest are retained in M04's browser receipt.

## Current discovery and build identity

`refresh-final.log` refreshes current structured data with this worktree as the explicit upstream source, retaining all 14 Storybook references. Named `oods-components-s188-m05.json` preserves this mission's export. `refresh-tests-verified.log`: **23 Python tests passed**. The earlier `refresh-tests-final.log` failed only because the live export had not yet been refreshed; that stale-export guard passes after regeneration. Current foundation projection promotes only the original 14 independently approved nucleus rows in React/Vue; unrelated and unapproved rows remain at baseline. Recipe consumer evidence also accepts hash-bound passing application receipts with actual visible mounts after navigation. This closes React's lazy PaymentTimeline mount without pretending it existed initially. Negative tests reject a failed app gate and a tampered receipt hash.

`catalog-health-final.json` records the rebuilt catalog: all 14 nucleus rows have both targets implemented-evidence-complete; all five recipes additionally have generated-consumer evidence. It records HTTP 200 from a temporary worktree bridge and matching server/bridge revision stamps containing the build commit and exact structured-data manifest SHA-256. Five frozen baseline/intake/reconciliation/foundation/closeout files match the M04 head byte for byte. `server-build-final.log` and `bridge-build-final.log` are green; the existing nine bridge tests cover stamped, unstamped, malformed and immutable revisions plus tool surface.

Runtime receipts honestly name the checkpoint HEAD used during their uncommitted implementation run; this commit closes those source and evidence changes. M06 repeats final proof at a frozen implementation head and records implementation, execution and evidence identities separately. The serving primary checkout, PM2 and saved stores were untouched in M05. `post-refresh-guards.log` records 25 passing census, historical-label and workflow guards after the refresh. No full-suite capture or deployment occurred here.
