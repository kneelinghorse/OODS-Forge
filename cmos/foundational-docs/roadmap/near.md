# Forge Roadmap — the phases after the Product Reality Program

**Status:** ACTIVE. Written 2026-09-12 in planning session `PS-2026-09-13-002`, after the Sprint 196 review closed Increment 15 (decision `#1977`) and Derek's direction reset (decision `#1979`). This document replaces the near roadmap. Updated 2026-09-13 by the Sprint 197 review (`PS-2026-09-13-010`): Sprint 197 certified and closed (`#2009`), Sprint 198 locked. Updated 2026-09-14 by the Sprint 198 review and closeout (`PS-2026-09-14-001`, `PS-2026-09-14-002`): Sprint 198 closed with carries (`#2046`), GitHub CI turned off, Sprint 199 locked. Updated 2026-09-14 by the Sprint 199 review (`PS-2026-09-14-005`): Sprint 199 certified and closed (`#2060`), Organization and User certified usable, the bridge serves `c344b773a`. Sprint 200 locked the same day by planning session `PS-2026-09-14-006` (`#2061` approves the manifest transitions). Updated 2026-09-15 by the Sprint 200 review (`PS-2026-09-15-001`): Sprint 200 certified and closed (`#2087`), the repository public, release `v0.1.0` published, the bridge serves `1827a069b`; the same evening the license holder was corrected to System Systems LLC and the commercial price and agreement withdrawn (`#2088`), and Sprint 201 was locked by planning session `PS-2026-09-15-003` (`#2089`). Updated 2026-09-15 by the Sprint 201 review (`PS-2026-09-15-004`): Sprint 201 certified and closed (`#2112`), the bridge serves `04182b116` with the preview host running; Sprint 202 locked the same day by planning session `PS-2026-09-15-005` (`#2113`). Updated 2026-09-15 by the Sprint 202 review (`PS-2026-09-16-001`): Sprint 202 certified and closed (`#2150`), the preview runs inside the conversation as an MCP Apps resource from the adapter and the bundle, and the bridge serves `a5d1ba084`; Sprint 203 was locked the same day by planning session `PS-2026-09-16-002` (`#2151`), opening Phase E. Every remaining item from that roadmap is placed in section 10; the roadmap it replaces is retained verbatim below the divider at the end of this file because several closeout checks read it.

**Live bridge:** serves `a5d1ba084` (OODS-pro after PR #119, Sprint 202 the preview inside the conversation) since 2026-09-16 00:27Z, 19 tools, the preview host running (`/preview/status`, runtime 20 files), the preview app built at revision `87de86c9408e` (2,105,938 bytes), runtime ledger 240 cells across 18 objects (all 240 re-swept at the Sprint 202 m01 head, 214 generation hashes moved once and attributed).

**Inputs:** Derek's words on 2026-09-12 (below), the Sprint 196 review and its carries, the remaining-work phase map of 2026-09-11, the Meridian design-platform vision v0.2 (a directional work in progress, not a plan) and the article "Design systems were already broken", the state of TraceLab (Sprint 50, redesign), Stage1 (Sprint 81 complete, awaiting close) and CMOS (3.0.0).

---

## 1. Where we are, in plain words

**What works today.** Forge is a design-system engine an agent drives over MCP. It has 110 components implemented in React and Vue, each measured for accessibility, theme and interaction in both frameworks. It has 18 objects (the original 11, plus the seven research objects TraceLab needed this week: Project, Document, Collection, Mission, Report, Evidence, Chunk) and seven contexts; every object composes into list, detail, form, timeline, card, dashboard and workflow screens, and all 240 generated screens build and run from the portable bundle in both frameworks. All 19 tools are proven at the MCP boundary and called from the bundle. Thirteen chart types render public SVG in light, dark and high contrast for both brands, and all 78 declared chart scopes are conformant; 22 chart patterns are public and the Core Analytics Profile is complete (17 cells, three retired with stated reasons). Component docs, tool specs and public claims are generated from ledgers and fail a check when they drift. A browser design loop exists and runs locally. Three reference apps (Subscription, Organization, User) generate, build and run from the release bundle. Since Sprint 197 (closed 2026-09-13) the palette is generated from seeds: coherent ramps, a dark theme designed as its own set, chart colors whose weakest pair sits at ΔE00 16.5 light and 20.1 dark under color-vision simulation, and a decided high-contrast paint scope, with every semantic token name unchanged. Since Sprint 198 (closed 2026-09-14) the list, detail, form and timeline screens of every object read as designed output with plausible sample data, and the CI failures Sprint 197 left are fixed. Since Sprint 200 (closed 2026-09-15) the type scale, spacing, radius, elevation and focus ring come from one token set across components and the generated shell, and Forge is available to individuals: the repository is public under PolyForm Noncommercial 1.0.0 with Derek Niedringhaus as holder, release `v0.1.0` carries the runtime bundle with install steps for Claude Desktop, Claude Code and Cursor, and the README explains Forge to a newcomer.

**What does not work, or is not good.**

- Subscription, Organization and User are certified usable (Organization and User by the Sprint 199 review, after the address save was fixed to replace the address shown and retaken in both frameworks). The residual craft list still stands: field-name chips on list cards, internal form fields (label, placeholder, tag count), saves that do not update history, duplicate Role fields, doubled empty states, the narrow paginator split, lowercase filter options, Subscription's payment-chart, tab and billing-cycle issues, the placed Relationship graph's oversized duplicate title and crowded labels, and the sankey title overlapping its node column. It carries to the next craft pass.
- GitHub CI is off (2026-09-14: out of credits, runs over an hour). Every gate is a local command; `pnpm viz:gate` runs the chart gate in about two minutes, and one five-suite capture at sprint close stands in for CI (Sprint 200's capture at `ea6180317` passed: 17,738 assertions, 0 failed, 32 skipped, 0 failed files). TraceLab still ships on the old palette until it applies the prepared re-pin.
- Chart limits that remain by decision: ECharts line, bar and area server-side rendering is spec-only and uncertified; patterns have no high-contrast pixels; the Relationship graph's light and dark categorical contrast is ungradeable because its edge array declares no group; static SVG shows a pattern's default selection state; raw Vega-Lite whole-spec validity is qualified for 16 of 44 fixtures (histogram and waterfall inherit the secondary-channel type defect).
- Brand authoring works from the bundle since Sprint 200 (the brand source ships in the archive). Since Sprint 201 the browser preview is the generated app running, served by the bridge and by the adapter-started host from the extracted bundle, so `design.preview` executes from the archive with no typed limit (OODS-N019 closed, `#2112`).
- The brownfield path is narrowed: `map` records mappings that nothing downstream consumes.
- Available, not yet used by anyone else. Since 2026-09-15 the repository is public and release `v0.1.0` is published with install steps for three clients; a fresh session reached install → see in 234 s. No outside individual has run it yet; that first run is the Phase C exit measurement and is recorded when it happens.
- There is no design surface beyond the local loop. Derek's ask from 2026-09-02 stands: see design work in the browser, iterate, move things, compare, collaborate.

**What Derek can do with it today.** Through Claude or aquex, compose any of the 18 objects into any of the seven contexts, generate React or Vue, certify the output, render charts and dashboards, apply brand and theme, preview locally, and pull the tokens and Tailwind plugin into his own apps (TraceLab does this from vendored tarballs pinned to a Forge head).

## 2. What this roadmap is for

Derek, 2026-09-12, in substance:

- Finish the work left on the last roadmap.
- Packaging is a phase. Make Forge and Stage1 available: not open source, not commercializable by anyone else, Derek keeps the right to charge a company; open to individuals so they can prove the tools out and give feedback.
- Leverage TraceLab, CMOS and Stage1 where they are useful; they are evolving too.
- Look at the design-platform ideas (Meridian `design-platform/VISION.md`, the Substack piece) and see what resonates, what makes sense, what is possible. That vision is directional, not final.
- The core system needs a designerly pass: colors more harmonious, dark theme fixed, data viz too. Borrowing palettes from great systems is fine.
- Be frugal with usage this week.

## 3. The phases and the sprint order

| Phase | Sprint | What ships | Done when |
|---|---|---|---|
| **B. Look like a design system** | 197 — **CERTIFIED AND CLOSED 2026-09-13** (`#2009`; [memo](../../planning/forge-s197-palette-decision-memo.md), [handoff](../../planning/forge-s197-build-handoff.md), CMOS `sprint-197`, missions m01–m07) | A new palette for Brand A and the dark theme, a decided high-contrast paint scope, re-derived chart colors, Brand B rebuilt by the same method; type/spacing/radius pass if it fits | Side-by-side renders of the Subscription and Organization screens and three TraceLab pages, light and dark, look better to an independent reviewer; every color gate green; the TraceLab re-pin prepared and verified |
| **A1. Finish: application craft** | 198 — **CLOSED WITH CARRIES 2026-09-14** (`#2046`; [memo](../../planning/forge-s198-craft-decision-memo.md), [handoff](../../planning/forge-s198-build-handoff.md), CMOS `sprint-198`, missions m01–m07) | The Sprint 197 CI carries closed first (the a11y-contract parser, three system-scope contrast pairs, six interaction-state rows, one token provenance for every gate, the migration-spec timeout); then the composer templates fixed so Organization and User reach Subscription's bar; the TraceLab research objects compose at that bar | Every CI job green at the PR head; Organization and User certified usable in React and Vue; a TraceLab Evidence and Mission screen composes without hand edits |
| **A2. Finish: charts** | 199 — **CERTIFIED AND CLOSED 2026-09-14** (`#2060`; [memo](../../planning/forge-s199-charts-decision-memo.md), [handoff](../../planning/forge-s199-build-handoff.md), CMOS `sprint-199`, missions m01–m07) | The Sprint 198 carries first (address save, Evidence filter, Mission header) with a local chart gate; then the seven typed chart gaps and 13 authoring-only patterns born or retired; bubble-map fixed; high-contrast pixels rendered on the palette from 197; ECharts object placement authored; the soak and timezone carries decided | 20/20 core chart cells surface-complete or retired with reasons; 78/78 scopes rendered or retired with a measured reason; certification breadth stated in one table; every check local |
| **C. Available to individuals** | 200 — **CERTIFIED AND CLOSED 2026-09-15** (`#2087`; [memo](../../planning/forge-s200-available-decision-memo.md), [handoff](../../planning/forge-s200-build-handoff.md), CMOS `sprint-200`, missions m01–m07) | The Sprint 199 capture carry closed first; the chrome pass; license and contributor terms in the repo with Derek as holder; brand source and third-party notices in the bundle, the export aliases retired; a draft GitHub Release of the bundle with install steps for Claude Desktop, Claude Code and Cursor; a README that explains Forge to a newcomer; feedback path; a fresh-session ten-minute proof | A person with the link installs the bundle in Claude Desktop, Claude Code or Cursor in under ten minutes and files feedback |
| **D. See the work** | 201 — **CERTIFIED AND CLOSED 2026-09-15** (`#2112`; [memo](../../planning/forge-s201-design-surface-decision-memo.md), [handoff](../../planning/forge-s201-build-handoff.md), CMOS `sprint-201`, missions m01–m07) · 202 — **CERTIFIED AND CLOSED 2026-09-15** (`#2150`; [memo](../../planning/forge-s202-conversation-preview-decision-memo.md), [handoff](../../planning/forge-s202-build-handoff.md), CMOS `sprint-202`, missions m01–m06) | The generated app running in the browser, served by the bridge and from the bundle, one URL per composition version with lineage, brand and theme switches, two versions side by side with what changed, measurements beside the render, edits written back as new versions, and the residual craft list closed (201); the same preview inside Claude and Cursor as an MCP Apps resource (202) | Every composition opens as the running app from the served bridge and from the extracted bundle; two versions compare with a what-changed list; an edit in the view produces a new version with lineage; every `#2046` item and the two chart titles are fixed |
| **E. Toward the design platform** | 203 — **BUILT, REVIEW PENDING 2026-09-16** (`#2151`; [memo](../../planning/forge-s203-objects-and-context-decision-memo.md), [handoff](../../planning/forge-s203-build-handoff.md), CMOS `sprint-203`, missions m01–m06) · 204+ | Forge's slices of the vision: objects born from use and context beside the design (203, §8 slices 1 and 2), then observation against intent with Stage1 (204–205) and decisions checked against compositions (research 205) | Each slice proven on Derek's own products first: every object arrives with the screen that needed it, certified usable |
| **F. Enterprise walk and parks** | later | Shopify-Forge in its own repo when Derek pulls it forward; Parts Town and mobile stay parked | Derek's call |

Why the palette goes first: it is the most visible improvement one sprint can make, TraceLab's redesign (its Sprint 50) is consuming the palette right now, and the chart sprint needs the high-contrast and dark chart palettes decided before it can render the deferred scopes and migrate goldens once instead of twice. Craft and charts follow; then packaging, because releasing to individuals before the apps look and read well would collect feedback about problems we already know.

Sprint numbers after 199 shift if a sprint splits. Each sprint is locked in its own short memo before build.

## 4. Phase A — finish what the last roadmap started

### Sprint 198 — Application craft — CLOSED WITH CARRIES 2026-09-14 (`#2046`)

Closed 2026-09-14 by review `PS-2026-09-14-001` and closeout `PS-2026-09-14-002`. PR #109 merged at `b7a96ab0f` (tree identical to implementation `2b095b157`); CI run 34803731947 at that head was green on every job before GitHub CI was turned off; the five-suite capture at `45cfea986` passed 17,504 executions with 0 failures; runtime 240/240 and component cells 1,308; no threshold loosened and no chart golden moved. The bridge serves `b7a96ab0f`. The builder's closeout evidence (censuses, capture, handoff) is on branch `codex/sprint-198-closeout-evidence`, not merged. Not certified, carried to Sprint 199 m01: saving an edited address on Organization and User adds a second address with a role the person never chose instead of replacing the one shown, so Organization and User are not certified usable; Evidence's only list filter binds a field that is the same on every record; Mission's timeline header reads "Label" from placeholder seeds. Craft carries for a later pass: field-name chips on list rows, internal fields in forms, saves not updating history, duplicate Role fields on User, doubled empty states, the 390 paginator split, lowercase filter options, and Subscription detail's payment chart, tab order and billing-cycle contradiction.

Locked memo: [forge-s198-craft-decision-memo.md](../../planning/forge-s198-craft-decision-memo.md); build handoff: [forge-s198-build-handoff.md](../../planning/forge-s198-build-handoff.md); CMOS `sprint-198`, seven serial missions. Base `2ea59fe9` on `OODS-pro` (the Sprint 197 merge; the bridge serves it since 2026-09-13; no delivery mission). m01 makes CI green before any craft work: the Sprint 197 carries named in §5 and in decision `#2009`. Then m02 list screens, m03 detail and timeline screens with the Tabs limit, m04 forms and sample data, m05 Organization and User certified usable in both frameworks plus the release-profile check, m06 TraceLab Evidence and Mission composed and inspected at the same bar (the deferred chrome pass only if room remains), m07 closeout. Status moves to BUILT, REVIEW PENDING at the m07 closeout and to CERTIFIED AND CLOSED after independent review.

The Product Reality Program's eighth exit criterion asks for one complete greenfield app usable in React and Vue. Subscription is certified usable (`#1844`). Organization and User are not, and the reasons are composer and template defects, not component defects. The ranked lists from the Sprint 188, 191 and 193 reviews (`#1832`, `#1881`, `#1915`) are the work:

- List screens: the unwired source-template header block (second search, stretched status pill, dead Filter/Sort buttons, wrong paginator), the 390px row that truncates the Sort select, empty-state seeding.
- Detail and timeline screens: raw ISO timestamps, unlabeled minor-unit amounts, `Archived: false` literals, raw lifecycle words on timeline entries, empty card shells, duplicated tabs, unthemed recipe surfaces (CancellationSummary, Billing/Details) that ignore the surface and border tokens.
- Forms: field descriptions used as labels, duplicated raw fields beside formatted ones, blank date inputs for seeded datetimes, framework-inconsistent seeds.
- Sample data: seeds that make sense (payments related to price, periods that are not 100% complete on day one), composite editors (Preference Editor, Role Assignment, Template Picker) seeded.
- Tabs normalization in the full Invoice and Usage detail HTML (the pre-existing OODS-V007 limit).
- The release profile: confirm it executes its own evidence rather than trusting caller-supplied hashes (exit criterion 6); fix if not. Small.

Also in this sprint: compose TraceLab's Evidence (list, detail, timeline) and Mission (detail, workflow) through Forge and inspect them at the same bar. TraceLab's own screens are built in TraceLab; Forge's job is that its objects compose well enough to be worth using. This is the first time a real screen Derek wants is composed from objects a real project asked for.

Exit: Organization and User certified usable in both frameworks by independent review of the screenshots; the TraceLab compositions inspected; the ranked lists closed or carried with a reason each.

### Sprint 199 — Charts, finished — CERTIFIED AND CLOSED 2026-09-14 (`#2060`) — 13 types / 78 conformant scopes; 22 public + 1 retired patterns; 17 surface-complete / 0 typed gaps / 3 retired; 10 declarations / 4 placed types; 110 components / 1,320 theme cells (#2054)

Closed 2026-09-14 by review `PS-2026-09-14-005` (`#2060`). PR #111 merged at `c344b773a`, tree identical to the reviewed head `9cbd1700a` (implementation `65d1f0a70`, corrective execution `d28add31b`, test-only `c28e50e3b`); the bridge serves `c344b773a` since 16:29Z with 19 tools, and the live health tool reports the profile at 17 / 0 / 3. The reviewer inspected the m01 address retakes in both frameworks (one address, the edited street present, the seeded street gone, and the flow check now asserts replacement), the Evidence filter on disposition, the Mission header, the forced-colours screenshots for all nine formerly deferred types plus the Brand B HC dashboard, and the Relationship graph placement. Certified: 13 types / 78 conformant scopes with 26 in high contrast; 22 public and 1 retired patterns with 88 conformant scopes; Core Analytics Profile 17 complete / 0 typed gaps / 3 retired; 10 placement declarations / 4 placed types; 110 components / 1,320 theme cells; 311 golden pins each moved once with the sealed Sprint 195–198 receipts byte-identical; `#1969` and `#1946` superseded (`#2049`, `#2050`). Organization and User are certified usable (exit criterion 8). Not green: both full five-suite captures are recorded as failed and stay so (corrective: 17,583 passed, 0 failed assertions, 36 skipped, two failed files — an isolated Vue consumer install missing its native rollup package, and a MarkGraph collection error fixed test-only at `c28e50e3b`, 76/76); the review accepts the attribution without calling the capture green. Carry to Sprint 200 m01, before packaging work: one five-suite capture at `c344b773a`, green or every failure attributed, with the consumer install hardened. Carries with no m01 obligation: the residual craft list (`#2046`) plus the placed graph's oversized duplicate title and crowded labels and the sankey title overlapping its node column in every theme; raw Vega-Lite whole-spec validity (28/44 direct, 16 annotated, `#2059`); the historical Python exporter fixture; pattern HC; ECharts cartesian server-side rendering spec-only; the Relationship graph's light/dark contrast ungradeable (`#2055`); the TraceLab re-pin in its own repo.

Locked memo: [forge-s199-charts-decision-memo.md](../../planning/forge-s199-charts-decision-memo.md); build handoff: [forge-s199-build-handoff.md](../../planning/forge-s199-build-handoff.md); CMOS `sprint-199`, seven serial missions on `codex/sprint-199-charts` from `b7a96ab0f`. m01 fixes the three Sprint 198 carries and adds a local chart gate; m02 removes the unused ScaleTemporal timezone field, retires the strict soak assertion with its measurements kept, and builds the one certification table; m03 publishes the authoring-only patterns and settles the Core Analytics Profile (waterfall and histogram built as patterns; candlestick, box and contour retired with reasons); m04 fixes bubble-map sizing, the ECharts band and adds the per-renderer fidelity check; m05 renders high-contrast pixels for the nine types; m06 places the force graph on Relationship; m07 closes out locally. GitHub CI is off; every gate is local.

Everything the visualization reviews carried (`#1860`, `#1881`, `#1951`, `#1978`), on the palette from Sprint 197:

- The seven typed core-profile gaps: each becomes a rendering chart type or is retired from the Core Analytics Profile with a reason.
- The 13 authoring-only patterns: public pixels or retirement, each with a reason.
- High-contrast pixels for the nine deferred types, on the decided HC palette (closes `#1851`).
- Bubble map: radius scaling fixed so the four nonconformant scopes pass the accuracy rule.
- ECharts object placement (`#1944`): an authored mark and preview, and the edge-fields-to-network contract, so graph types can be placed in generated apps like bar and line are.
- ECharts dual-axis band rendering and a per-renderer fidelity assertion (next-step 982).
- ScaleTemporal timezone: either the renderer consumes it as a declared schema change or the field leaves the authoring schema (`#1969`). The ECharts server-side line limitation stays documented (`#1971`).
- The strict soak (`#1946`): fix the heap slope or retire the strict variant with the measurement retained. Decide, do not carry again.

Exit: one table of the 13 types × certification state with no `deferred` cells left unexplained; goldens migrated once; certification of the ECharts path stated honestly (spec-only stays uncertified).

## 5. Phase B — make it look like a design system

### Sprint 197 — Palette and the dark theme — CERTIFIED AND CLOSED 2026-09-13 (`#2009`)

The generated palette preserves every semantic token name. Brand A uses coherent primary, accent, neutral and status ramps; Brand B derives from the same seeds with its own primary hue. Dark uses a low-chroma canvas and five even elevation steps, with its own text and chart scales. Generated React/Vue shells honor the requested theme. The HC census declares all renderer and component paint roles; pixels for the nine deferred chart types remain Sprint 199 work.

Measured categorical Role-A ΔE00 minima are **16.540957 light / 20.105820 dark** across normal vision and the three Machado simulations, above the target 12. **24/24 categorical Role-C checks pass** at 3:1 or better. The **52-cell** light/dark matrix has **zero Role-C failures**. The single m05 golden migration attributes 31 changed pin/golden files and 100 registry/matrix hashes; historical matrix receipts remain intact.

[The comparison gallery](../../../artifacts/product-reality/sprint-197/m06/side-by-side/index.html) contains **180 screenshots / 90 before-and-after pairs**: 72 Forge pairs across six screens, both brands, light/dark and 390/820/1440; 18 TraceLab pairs across three pages, light/dark and the same widths. The TraceLab re-pin is prepared and verified in an isolated copy. Its source checkout has zero added changes, under the user-accepted scoped gate. Independent visual judgment was done by the review (`PS-2026-09-13-010`, decision `#2009`) from the sheets: the beige light canvas and the muddy-brown dark canvas are gone, surfaces are neutral, the accent reads as one deliberate hue, and TraceLab reads as a designed product in both themes. Verdict: better; it reads as a designed system. Two observations, not blockers: Brand B screens without a primary surface are indistinguishable from Brand A (neutral, accent and status roles are shared by design), and categorical slot 01 reads heavy as a 390 px area fill.

The seven-mission build follows the [locked memo](../../planning/forge-s197-palette-decision-memo.md) and [build handoff](../../planning/forge-s197-build-handoff.md), from base `bc12723e9`; PR #107 merged into `OODS-pro` at `2ea59fe9` and was delivered to the primary checkout and the bridge on 2026-09-13. The optional type/spacing/radius/elevation/focus pass is deferred under memo rung 1: Sprint 198 takes it if room remains, otherwise it becomes Sprint 200's first half and packaging moves one sprint. Derek merged with two CI jobs red and placed the fixes in Sprint 198; carried by name into its m01 (`#2009`): the a11y-contract job cannot parse the typed guardrail rows; with the parser patched, three system-scope pairs fail contrast (accent text 3.59 of 4.5, accent icon 2.31 of 3, text on the primary interactive surface 4.48 of 4.5) and six interaction-state rows fail (dark hover and pressed at ΔL 0.01 and 0.02 where 0.08–0.12 and 0.12–0.15 are required; light hover and pressed chroma steps outside their ranges); the guardrail CLI reads the legacy `tokens/` tree while the a11y CLI reads the built tree and the palette checks read `packages/tokens/src`; the palette-golden-migration spec timed out at the 20-second default; the readiness generator `--check` joins the pre-freeze verifier pass; the token-change label is attached at PR open. No reconnect or consumer notice was prepared or sent.

### 5a. Palette assessment (from the 2026-09-12 research read)

Measured defects in the current tokens:

- Primary ramp: hue 225.69 at step 100, 274.55 at steps 300–700; lightness steps of 0.253 / 0.040 / 0.100 / 0.100 / 0.040; chroma dips at 500 instead of peaking mid-ramp; steps 200, 800, 900 absent.
- `ref.color.accent` is pure aliasing of primary (100/300/400/500 equal primary 100/500/600/700); there is no second hue in the reference layer.
- Neutrals sit on hues 286, 248, 248, 264, 268, 269, 270, 269, 268, 266 with a chroma curve that peaks at step 700 and falls, so dark text reads warmer than the borders above it.
- Status families drift inside themselves: critical 20.8 / 27.0 / 32.9 / 32.4, warning 82.1 / 79.9 / 74.2 / 73.7, success 159.9 / 157.3 / 155.0 / 153.3. A banner's surface, border, text and icon are four hues.
- Brand A light canvas oklch(0.967 0.03 86) and subtle oklch(0.893 0.048 86): a saturated beige under text at hue 265.
- Brand A dark canvas oklch(0.18 0.05 45), raised 0.24, subtle 0.30, all at chroma 0.05–0.06: muddy brown, coarse elevation.
- Brand B: surfaces 230, interactive 232, focus and accent text 238, accent 240, info 252/254. Brand and "info" are indistinguishable.
- Chart categorical slots 01 (hue 265) and 02 (274) are both blue; slot 06 (hue 47) collides with Brand A's brand orange (43–45). Role-A pairwise ΔE00 minimum 9.88 light / 9.95 dark against the clean line of 10 (`certify-contrast.ts:92`); passes with a caution.
- Dark overrides exist only for the categorical slots; sequential and diverging have no dark set. Sequential step 09 oklch(0.14 0.15 250) is out of sRGB gamut. Diverging pairs hue 210 against 25 with asymmetric chroma under a gate that checks lightness only.
- `tools/a11y/guardrails/relative-color.csv` has six rows, all interactive hover/pressed deltas. Nothing gates ramp monotonicity, per-family hue consistency or neutral drift.

Reference systems worth borrowing from (licenses verified 2026-09-12):

| System | License | Borrow for |
|---|---|---|
| Radix Colors | MIT | Neutral scales with 12 steps that each have a job; separately tuned dark scales |
| GitHub Primer primitives | MIT | Dark and dark-dimmed as designed sets; one hue per status family |
| IBM Carbon | Apache-2.0 | Data viz: categorical, sequential and diverging palettes tested for color-vision deficiency |
| Tailwind CSS v4 default palette | MIT | Already oklch; lightness and chroma curves per step |
| Material color utilities | Apache-2.0 | The generator method: a full tonal ramp from one seed with contrast guarantees |
| Open Props | MIT | How few hues a system needs; adaptive light/dark |
| Atlassian design tokens | Apache-2.0 | Semantic naming closest to ours; check our frozen names cover the real surface set |
| Shopify Polaris | Modified MIT with a Shopify brand clause | Study the warm admin neutral stack; do not copy values |

Blast radius: reference JSON (brand, neutral, status), both brands' base/dark/hc, the theme0 and dark theme aliases, `viz-scales.json`, the guardrail CSV and the two validator scripts, pinned svgHash values in the viz recipe and pattern registries (60 + 32), the certified matrix (8), 14 snapshot files, and hand-pinned literals in the certify and Vega-Lite adapter specs. Gates that re-measure: `tokens-validate`, `check:tokens`, certify contrast, the 52-cell contrast matrix, `docs:check`, one capture, and TraceLab's literal-color gate plus a visual pass after re-pinning. TraceLab sets both `data-theme` and the Tailwind dark class from one bootstrap script, so the new dark set reaches it through the existing scope; no new semantic name may be added without a matching entry in its Tailwind config, which is why this sprint adds none.

## 6. Phase C — available to individuals

### Sprint 200 — License, release shape, onboarding — CERTIFIED AND CLOSED 2026-09-15 (`#2087`)

Closed 2026-09-15 by review `PS-2026-09-15-001` (`#2087`). PR #116 merged at `1827a069b`, tree identical to the reviewed head `9a00fbf75` (implementation `f8bef2a2b`, capture head `ea6180317`, execution `58b100687`); the bridge serves `1827a069b` with 19 tools. Derek flipped `kneelinghorse/OODS-Forge` to public and confirmed the holder (`configs/license/holder.json`: Derek Niedringhaus, https://derekn.com); the review then published release `v0.1.0` at <https://github.com/kneelinghorse/OODS-Forge/releases/tag/v0.1.0> (tag at `723bc2195`, the archive's source commit; six assets; the archive re-downloaded and its sha256 `338dc780…6aa9` re-verified; `LICENSE`, `COMMERCIAL.md` with the price of record and `THIRD-PARTY-NOTICES.md` inside, holder rendered). Verified on the merged tree: 23 manifests on `PolyForm-Noncommercial-1.0.0`, 6 LICENSE files naming the holder, the six alias exports gone, `COMMERCIAL.md`, `CONTRIBUTING.md`, `FEEDBACK.md` and `THIRD-PARTY-NOTICES.md` at the root with the newcomer README. Green: one five-suite capture at `ea6180317`, 17,738 passed / 0 failed / 32 skipped / 0 failed files / 0 uncollected, so the Sprint 199 capture carry is closed; the chrome pass re-measured 110 components / 1,320 theme cells and moved the 240 runtime hashes once; the third fresh-session run reached install → see in 234 s. Carries to Sprint 201 m01: `design.preview` from the bundle (OODS-N019, Sprint 201's own subject); the m06 craft residue (the preview document's placeholder convention and `OODS Preview` title, the Subscription detail `header` slot resolving to `VizAreaPreview`, slot confidence and candidate score sharing one name, the large `code.generate` and rendered-document payloads); the root Storybook not loading `@oods/component-styles/css`; Stage1's license change from Stage1's repository. The outside-individual ten-minute run is the Phase C exit measurement, recorded when it happens (memo decision 11). No npm publish, no `.mcpb`, no OCI image, no consumer notices.

**Corrected the same evening at Derek's direction.** The holder is his company, System Systems LLC (https://aquex.ai), not his name; the starting price, the paid evaluation and the one-page agreement were my additions from the planning memo, not his terms, and are removed. `COMMERCIAL.md` is contact-only with terms agreed case by case, `docs/legal/` is gone, and the license-shape spec asserts that shape. Branch `codex/license-holder-llc` (PR against `OODS-pro`) carries it; release `v0.1.0` was re-cut from its head `bf18f49a7` with the corrected terms inside the archive (portable E2E pass, 19 tools). PolyForm Noncommercial stays: it is the standard license for the terms Derek set on 2026-09-12; a typical open-source license would allow the commercial use he excluded.

**Built 2026-09-15** on `codex/sprint-200-available` (implementation head `f8bef2a2b`, PR against `OODS-pro` pending review; builder self-certified: false). Counts at the build head: 23 manifests on `PolyForm-Noncommercial-1.0.0` and 6 LICENSE files rendered from `configs/license/holder.json`; 6 alias exports removed (`/ported`, `/readiness-ported`, `/css-ported`); install steps for 3 clients (Claude Desktop, Claude Code, Cursor) from one template; the runtime bundle with `THIRD-PARTY-NOTICES.md`, the terms and the brand source, `brand.apply` executing from the archive (18 of 19 tools pass the portable E2E; `design.preview` stays the one typed limit); a DRAFT GitHub Release `v0.1.0` at <https://github.com/kneelinghorse/OODS-Forge/releases/tag/untagged-22e97886042b6bc11e2a> (target `723bc2195`, archive sha256 `338dc780…6aa9`, no tag, unpublished); the newcomer README, `FEEDBACK.md` and the issue templates; three fresh-session ten-minute runs, the third at 234 s install → see with every step passing first time, three issues filed through the template and closed with producer fixes. The two actions only Derek takes at the review: flip the repository public and confirm the license holder name; then the review publishes the draft release.

Locked memo: [forge-s200-available-decision-memo.md](../../planning/forge-s200-available-decision-memo.md); build handoff: [forge-s200-build-handoff.md](../../planning/forge-s200-build-handoff.md); CMOS `sprint-200`, seven serial missions on `codex/sprint-200-available` from `c344b773a` (the Sprint 199 merge; the bridge serves it). m01 takes one five-suite capture at the merged head, hardens the consumer-install harness and sets the five public-flagged packages private (`#2061`); m02 is the chrome pass (type scale, spacing, radius, elevation and focus on tokens, component styles and the generated shell, with before/after sheets and one attributed runtime-hash migration); m03 puts PolyForm Noncommercial 1.0.0 in every LICENSE and manifest with Derek Niedringhaus as holder from one source file, and adds the inbound grant, COMMERCIAL, the agreement and the FAQ; m04 makes the bundle public-shaped (third-party notices, brand source so `brand.apply` works from the archive, the export aliases retired, install steps for Claude Desktop, Claude Code and Cursor from one template, a draft GitHub Release); m05 rewrites the README for a newcomer and adds the feedback path; m06 proves the ten-minute first run with a fresh session from the draft release; m07 closes out locally. The outside-individual measurement follows Derek's public flip and is recorded as the Phase C exit when it happens.

Derek's terms, turned into decisions (not questions):

- **License: PolyForm Noncommercial 1.0.0** (SPDX `PolyForm-Noncommercial-1.0.0`) for Forge and for Stage1. Individuals, students, hobbyists, nonprofits and governments may run, modify and share it for free; any commercial purpose, including a company using it internally, needs a license from Derek, sold separately at his price. It is source-available, not open source, never converts to open source, and leaves Derek every other right. The alternatives and why each was rejected are in 6a. Stage1's change is done from Stage1's repo.
- **Contributions.** The noncommercial license alone does not let Derek sell a commercial license that contains someone else's patch. A one-paragraph inbound grant in CONTRIBUTING (perpetual, irrevocable, sublicensable license to the contribution under any terms) plus a required checkbox in the PR template, in place before the repo goes public. A signed CLA only if someone lands substantial code.
- **Repo changes.** Root LICENSE replaced with the PolyForm text, with Derek's real name or entity as the license holder (the current file names "Design System Team", which muddies the ownership chain and the right to sell); every one of the 22 manifests set to the SPDX identifier, including the generator that writes the packed `dist/pkg/package.json`; the ten manifests that currently say MIT flipped; the five packages with a public publish flag (`@oods/tokens`, `@oods/tw-variants`, `@oods/a11y-tools`, `@oods/viz-core`, `@oods/viz-render`) set `private:true` until Derek wants them on a registry; a plain-English LICENSING paragraph in the README (GitHub's license detector will show "Other" for PolyForm, so the README must say it); a COMMERCIAL file with how to reach Derek; a third-party notices file in the bundle, since PolyForm covers only Derek's code; a short FAQ for the fuzzy edge (a freelancer evaluating for client work is arguably commercial); "open source" wording removed from README and CHANGELOG.
- **What was already MIT.** The public OODS-Foundry repository (last pushed 2026-03-01) has no LICENSE file but its package manifest declares MIT; anyone who fetched those commits keeps a perpetual MIT grant to that snapshot, and Derek cannot revoke it. New work in OODS-Forge has no such exposure once the current MIT LICENSE and manifests are closed. Stated plainly in the README, no legal theater.
- **The commercial product.** PolyForm reserves the right to sell but does not create the product. Withdrawn 2026-09-15: no published price and no agreement text; a company that asks emails the contact in COMMERCIAL.md and terms are agreed case by case.
- **Distribution shape.** The repository becomes public as source-available. The existing portable bundle (13 runtime packages, bridge included, hash-bound readiness attestation, built by `scripts/runtime/assemble.mjs` and proven in Sprint 196) is attached to a GitHub Release with install steps for Claude Desktop, Claude Code and Cursor over stdio. Its runbook still frames it as a private bundle for named consumers; that framing and any consumer gating go, and the bundle carries the LICENSE and third-party notices. No npm publishing (npm signals open reuse and a publish is irreversible). A `.mcpb` one-click bundle is the natural second step once individuals ask; no OCI image. Clone-and-build stays documented as the contributor path, not the user path.
- **Brand source in the bundle.** Ship the token sources so `brand.apply` works from the bundle and the typed limit closes.
- **Alias retirement.** The `/ported` and `/readiness-ported` export aliases go; no external migration exists to wait for.
- **Onboarding.** This is the long-standing "communicate Forge" desire, now with a reason: a README that says what an object, a trait and a context are in plain words, what Forge generates and certifies, and a ten-minute first run (install, compose one screen, certify it, see it). `docs/how-forge-works.html` stays as the deep explanation.
- **Feedback path.** GitHub Issues with two templates (bug, "this did not read right") and a FEEDBACK file that says what kind of feedback helps.

The one action only Derek can take: flipping the repository to public and confirming the license holder's name. Both taken 2026-09-15 at the review; the release followed.

Exit: a person who is not Derek installs the release from the link, composes and certifies one screen in under ten minutes, and files feedback. Measured with one outside individual before the sprint is called done.

### 6a. License findings (from the 2026-09-12 research read, verified against the license texts)

Why PolyForm Noncommercial fits Derek's three requirements: it grants every normal use (run, modify, redistribute) for noncommercial purposes, so individuals can prove the tools out; commercial use is simply outside the grant, so nobody else can commercialize; the license holder keeps every other right, so paid commercial licenses stay available; it is lawyer-drafted, plain-language and SPDX-registered, so package tooling accepts it; and it has no conversion clause.

Rejected, one line each:

| License | Why not |
|---|---|
| PolyForm Strict | Forbids distributing changes or new works; individuals could not fork or patch |
| Prosperity Public License 3.0 | Close, but gives commercial users a free 30-day trial and exemptions Derek did not ask for |
| Business Source License 1.1 | Requires a change date (at most four years) after which it becomes open source |
| Functional Source License | Converts to Apache or MIT after two years and allows most commercial use meanwhile |
| Elastic License 2.0 | Permits ordinary commercial and internal business use; only bars managed-service resale |
| Sustainable Use License (n8n) | Explicitly allows internal business use by companies |
| Commons Clause | A rider, not a license; "substantially derives value" is ambiguous and it only bars selling |
| CC BY-NC 4.0 | Creative Commons recommends against it for software; no source or patent terms |

Risks, plainly: "noncommercial" has fuzzy edges (answer with a FAQ, not amendments); some companies ban non-OSI dependencies and registries will not carry it, so contribution volume stays low; the MIT snapshot in OODS-Foundry is out for good; enforcement is Derek's alone and the deterrent is the text, not litigation; a careless publish from any of the five public-flagged packages would put MIT-labeled code on a registry permanently, which is why `private:true` lands first.

Sources: polyformproject.org (Noncommercial and Strict 1.0.0), spdx.org (PolyForm-Noncommercial-1.0.0), prosperitylicense.com 3.0.0, fsl.software, commonsclause.com, the Creative Commons software FAQ, github.com/modelcontextprotocol/mcpb, the OODS-Foundry repository metadata and manifest, and this repo's LICENSE, `package.json` and `docs/runtime/portable-runtime.md`.

## 7. Phase D — see the work

Derek's direction from 2026-09-02 is the whole of this phase: see design work in progress in the browser, iterate, move things, adjust, collaborate. Two sprints.

### Sprint 201 — The design loop becomes the surface — CERTIFIED AND CLOSED 2026-09-15 (`#2112`)

Closed 2026-09-15 by review `PS-2026-09-15-004` (`#2112`). PR #118 merged at `04182b116`, tree identical to the reviewed head `16a24ca4a` (implementation `82f55f190`, capture head `a6bd41b25`, the frozen bundle at `37fc2351b`); the bridge serves `04182b116` with 19 tools and the preview host running. Verified on the merged tree: the five raw Vitest files recount to 17,790 passed / 0 failed / 32 skipped / 0 failed files / 0 uncollected; every pre-freeze gate exit 0 and the chart gate 11/11; the frozen archive `c4c51dc2…` (55,521,681 bytes, 315 packages) and its E2E executing all 19 advertised tools from the extracted bundle with 0 typed limits, so OODS-N019 is closed and the tool ledger reads 24 / 19 executed / 0 typed; the sealed Sprint 195–200 receipts byte-identical across the branch; the golden ledger's 166 entries with the certified matrix moved once and attributed; the m06 after-verification for Subscription, Organization and User with zero errors and zero React/Vue mismatches at 390/820/1440, its screenshots inspected, and the chart-title measurements (the sankey title clears the chart in six scopes, no graph label overlaps). Delivered by the review: the primary checkout fast-forwarded, rebuilt (the bridge build emits `dist/preview-runtime`) and restarted. Proven live on the served bridge: `design.compose` recorded a version at `04182b116`; `design.preview` compiled both frameworks and the lineage page, the bare app and the module all answered with one certified chart and every unrun axe scope named; `action:"edit"` wrote a seed version and a reorder-region version with parent 1; `action:"compare"` reported exactly one difference and a self-compare identical; `action:"versions"` listed the lineage; a non-candidate swap was refused with OODS-V204; `viz.render` sankey hashes equal the m06 receipts in three scopes. Carries to Sprint 202 m01 (`#2111`): the placed area chart's in-SVG title at 390px (a chart-assets change), the three axe findings on the generated shell (landmark-one-main, page-has-heading-one, region), the tab-slot-to-Card OODS-V007 composer quirk, per-scope chart re-generation on a brand or theme switch; the `#2059` chart-pass items stay on their next-step. No release, tag, publish or consumer notices.

Built 2026-09-15 on `codex/sprint-201-design-surface` from `c02f3ddcb`, builder self-certified false; the review and the delivery are separate. m01 the preview host in the bridge (request-time esbuild and `@vue/compiler-sfc`, prebuilt runtimes, the adapter starting it lazily; `design.preview` from the extracted archive, OODS-N019 retired for OODS-N021; closure 283 → 315 with four esbuild binaries); m02 durable compositions with versions and lineage (`.oods/compositions`, one URL per version, brand, theme and width controls, OODS-N022); m03 `/compare` with the structural what-changed and `design.preview action:"compare"`; m04 the validation receipt, `artifact.certify` for placed charts and axe-core stored per version and named beside the render; m05 the four edits (reorder region, swap slot, reorder fields, seed) from the page and from `design.preview action:"edit"` writing new versions with parent and operation; m06 every `#2046` item, the sankey and Relationship graph titles, the root Storybook chrome and `payloadMode: "file"` fixed at the producer with before/after receipts in both frameworks at 390/820/1440, one 240-cell runtime re-sweep and the chart pins moved once (the certified matrix re-qualified and attributed). Censuses at the closeout: runtime 18 objects / 240 cells re-swept; components 110 / 1,320; viz 13 types / 78 scopes; tool ledger 24 rows (19 executed from the archive, 0 typed limits). The five-suite capture and the handoff are in `artifacts/product-reality/sprint-201/m07/`.

Locked memo: [forge-s201-design-surface-decision-memo.md](../../planning/forge-s201-design-surface-decision-memo.md); build handoff: [forge-s201-build-handoff.md](../../planning/forge-s201-build-handoff.md); CMOS `sprint-201`, seven serial missions on `codex/sprint-201-design-surface` from `c02f3ddcb` (the Sprint 200 merge plus the license correction, PR #117). Derek's terms: the preview is the generated app actually running, not server-rendered HTML; editing is in; bundle users get the preview from the adapter; the craft list is fixed inside the sprint; nothing staged. m01 puts a preview host in the bridge that compiles the generated artifact at request time (esbuild, `@vue/compiler-sfc`) and serves it with prebuilt host runtimes, started lazily by the stdio adapter, so `design.preview` works from the extracted archive and OODS-N019 closes; m02 makes compositions durable with versions and lineage, one URL per version, brand, theme and width controls; m03 puts two versions side by side with a what-changed panel; m04 shows the validation receipt, placed-chart certification and axe results beside the render; m05 adds the four edits (reorder region, swap slot component, reorder fields, change seed) that write back as new versions; m06 closes every `#2046` craft item, the Relationship graph title and labels, the sankey title overlap, the root Storybook chrome and the payload-to-file option; m07 closes out locally.

The original paragraph, kept for the record: the local design loop (`scripts/design-loop`, `design.preview`) becomes a first-class surface: bundled and served by the bridge (closing the typed limit from the bundle), one URL per composition, brand and theme toggles, two alternatives side by side, a "what changed" view between variants, and the certification report beside the render. Edits made in the preview (reorder a region, swap a component, change a seed) round-trip into the composition rather than living in the browser only. Every preview keeps its lineage: which composition it came from, at which head.

### Sprint 202 — The preview inside the conversation — CERTIFIED AND CLOSED 2026-09-15 (`#2150`)

Closed 2026-09-15 by review `PS-2026-09-16-001` (`#2150`). PR #119 merged at `a5d1ba084`, tree byte-identical to the reviewed head `e276ea916` (implementation `c374f090b`, capture head `74abd729f`, the frozen bundle at `99f3d501d`); the bridge serves `a5d1ba084` with 19 tools and the preview host running. Verified on the merged tree: the five raw Vitest files recount to 17,849 passed / 0 failed / 32 skipped / 0 failed files / 0 uncollected; every pre-freeze gate exit 0 (30 in part A, the chart gate and the bundle in part B); the frozen archive `d3149334…` (55,909,250 bytes, 315 packages) and its E2E executing all 19 advertised tools from the extracted bundle at 0 typed limits, with the pinned Linux container proof 20 of 20 on linux-arm64; the sealed Sprint 195–201 receipts and the viz pattern registry, certified matrix and recipes byte-identical to the base; the golden ledger’s 215 entries verified against the registry (214 moved runtime hashes present, no superseded hash surviving); the m01 before-and-after receipts showing the smallest axis label at 390px moving 4.68px → 9.24px with the title out of the SVG, the three shell findings at zero, the swap-candidate list narrowed to what re-composes, and a brand or theme switch mounting the chart generated for that scope. Delivered by the review: the primary fast-forwarded, installed, rebuilt and restarted — the preview app rebuilt in the fresh checkout to the same revision `87de86c9408e` at 2,105,938 bytes as the frozen bundle. Proven live at the delivered head with an independent probe: a client negotiating `io.modelcontextprotocol/ui` gets `resources` and the extension advertised, 19 tools, `_meta.ui.resourceUri` on `design_preview` alone and exactly one listed resource, the app read back with no reference to the localhost host inside it; a client declaring nothing gets no `_meta.ui` and the unchanged text result; stdout stayed JSON-only in both. The exit criterion ran end to end through that client: the preview opened with `structuredContent` at head `a5d1ba084`, the composition module read through `resources/read`, an edit wrote version 2 with parent 1, compare reported one difference, `action:"accept"` saved `accepted.json` with the head, schema hash and measurements, `action:"versions"` showed the acceptance, and re-accepting the standing version was refused with OODS-V205. Carries to Sprint 203 m01: the Claude Desktop and Cursor renders, which are Derek’s runs and are not claimed here; axe-core inside the conversation view (descope rung 1); `heading-order` on the StatusTimeline title; and the adapter’s description verb check at 15/16, which the review confirmed fails the same way at the Sprint 201 base. No release, tag, publish or consumer notices.

Built 2026-09-15 on `codex/sprint-202-conversation-preview` from `04182b116`, builder self-certified false; the review, the delivery and the Claude Desktop and Cursor runs are separate. m01 closed the Sprint 201 carries at the producer: placed charts name themselves in the figure heading and carry a narrow render shown at 600px or less of figure width (the smallest axis label at 390px went from 4.68px to 9.24px), the generated shell is a page with one `main` and one `h1` (the three axe findings at zero in React and Vue, light and dark; `heading-order` on the timeline title typed for the next carry list), the composer offers only swap candidates that re-compose and pass the target contracts in both frameworks, and a brand or theme switch mounts the placed chart generated and certified for that scope; one 240-cell runtime re-sweep (240/240, 214 hashes moved and attributed). m02 the stdio adapter speaks MCP Apps: `resources` and the `io.modelcontextprotocol/ui` negotiation read from the raw initialize, `_meta.ui.resourceUri` on `design_preview` only for a client that negotiated it, `structuredContent` beside the unchanged text, the revisioned `ui://oods-forge/preview/<revision>/app.html` and the composition module, style, record and lineage resources through an `iife` compile, and the client and the negotiation named on stderr; a reference host on the SDK's `app-bridge` in Chromium under the spec's default CSP is the local gate. m03 the preview app: one self-contained HTML resource with the runtime inlined that mounts the running React or Vue app from the tool result, with the page's lineage and measurement panels, framework, brand, theme and width switches, the host's theme and container width, and fullscreen when the width needs it. m04 the acts from the conversation: the four edits, two versions side by side with what changed, `design.preview action:"accept"` writing `accepted.json` with the measurements snapshot and supersession (OODS-V205 for the standing or an ungenerated version) and shown on the app and the browser page, the accepted summary through `ui/update-model-context`, and request changes as `ui/message`. m05 the install path in Claude Desktop (Developer Mode, Reload MCP Configuration) and Cursor beside any hub entry, and the archive's E2E and a Linux container proof exercising the preview app and its resources with the extension negotiated. Censuses at the closeout: runtime 18 objects / 240 cells re-swept; components 110 / 1,320; viz 13 types / 78 scopes with the pattern registry and the certified matrix unmoved; tool ledger 24 rows (19 executed from the archive, 0 typed limits). The five-suite capture and the handoff are in `artifacts/product-reality/sprint-202/m06/`; the Claude Desktop and Cursor receipts go in `artifacts/product-reality/sprint-202/m05/hosts/` when Derek runs them.

Locked memo: [forge-s202-conversation-preview-decision-memo.md](../../planning/forge-s202-conversation-preview-decision-memo.md); build handoff: [forge-s202-build-handoff.md](../../planning/forge-s202-build-handoff.md); CMOS `sprint-202`, six serial missions on `codex/sprint-202-conversation-preview` from `04182b116` (the Sprint 201 merge, served by the bridge). Derek, 2026-09-15: proceed with 202; research in session or through TraceLab. The read was done in session and recorded as TraceLab evidence: MCP Apps is the official extension (spec 2026-01-26; `ui://` resources with the MIME type `text/html;profile=mcp-app`, `_meta.ui.resourceUri` on the tool, bilateral `io.modelcontextprotocol/ui` negotiation, a postMessage dialect, the tool result's `structuredContent` pushed to the app); the host's default CSP allows inline scripts only, no `blob:`, `data:` or `eval` and no network; Claude (web and desktop) and Cursor 2.6 render apps, Claude Code does not; Claude Desktop renders apps from a local stdio server with Developer Mode on and caches resources by URI; the current `ext-apps` SDK (2.0) needs the MCP SDK 2.0 line the adapter is not on, so 1.7.5 is used only in the built app and the harness. Settled: the app is one self-contained HTML resource built at package build with the runtime inlined, the compiled artifact read through `resources/read` and injected as inline script (an `iife` compile mode bound to the runtime globals), never a reference to the localhost host from inside the sandbox; the adapter implements `resources` and the negotiation with the SDK it has and sets `_meta.ui.resourceUri` only when negotiated, with `structuredContent` beside the unchanged text; versioned resource URIs; a reference host on the SDK's `app-bridge` in Chromium under the default CSP is the local gate; the app is the same surface as the browser page (lineage, measurements, brand, theme, width); `action:"accept"` records the accepted version with its certification and "request changes" is a message into the conversation; the direct install path in Claude Desktop and Cursor is documented and the archive's E2E exercises the resources; the Claude Desktop and Cursor renders are recorded when Derek runs them. m01 closes the Sprint 201 carries (placed-chart titles into the figure heading, the three axe shell findings, the tab-slot candidate list, per-scope chart rendering on a switch); m02 the adapter speaks MCP Apps with the reference-host harness; m03 the preview app; m04 edits, compare, accept and request changes from the conversation; m05 from the bundle into Claude Desktop and Cursor; m06 closeout. Descope ladder: axe inside the conversation view, fullscreen, per-scope chart re-generation, the Cursor render. Out of scope by name: aquex pass-through, the bridge as an MCP endpoint or host, Claude Code rendering, context beside the design (Sprint 203).

The original paragraph, kept for the record: the same preview as an MCP Apps `ui://` resource so it appears inside Claude and Cursor next to the tool call (the candidate from the 2026-08-31 landscape read, DT-R002). Accept, request changes, and compare live from the conversation. Figma remains parked: its agent path is gated and priced, and nothing here depends on it.

Exit: Derek composes a screen, previews it in the conversation, compares two alternatives, and accepts one, with the accepted composition and its certification saved.

## 8. Phase E — toward the design platform: what Forge owns

The Meridian vision v0.2 describes a platform that keeps a useful, inspectable understanding of a product: objects and behaviors, evidence, commitments, working possibilities, and how the software behaves. Read against what exists, this is what resonates for Forge, what makes sense, and what is possible now.

**What resonates and is already Forge's.**

- *Objects connect design to the business.* This is Forge's founding idea and it is real: traits like Cancellable and Billable carry business semantics into every screen. The vision's claim that a subscription's states, obligations and permitted actions shape the interface is exactly how the composer works.
- *Working possibilities with lineage.* Compositions are durable semantic work in progress, not disposable renders. Phase D gives them lineage and comparison.
- *A design environment entered from several directions.* An agent conversation, a browser preview, and (later) a canvas are entry points into the same compositions.

**What makes sense as Forge's next slices, in order, each proven on Derek's own products first.**

1. *Objects born from use (Sprint 203).* TraceLab's seven research objects came from a real need and landed in one PR. Do the same for Derek's other products as they redesign: cmos-dashboard's decisions, missions, sprints and sessions; Hive's people, articles and cohorts. The registry grows because a real screen needed it, never speculatively.
2. *Context beside the design (Sprint 203–204).* When a composition is previewed, show the CMOS decisions and TraceLab evidence about that object next to it, pulled live through the tools that already exist (`cmos_context` search, `tracelab_search`), keyed on the object name and Forge URN. This is the vision's central promise in its smallest honest form: less work reconstructing context. It is also the first cross-tool join and needs no binding table yet.
3. *Observation against intent (Sprint 204–205).* Stage1 captures TraceLab's live frontend; Forge composes the same screens from the same objects; the difference is presented as evidence for review. This is the loop the article describes, run on Derek's own product with three of his own tools. Stage1's Sprint 81 already fixed the token seam between the two engines.
4. *Decisions checked against compositions (research in 205, slice after).* The article's two-filters example: a decision with stated applicability, checked against a composition, reporting relevance, conflict, exception or non-applicability. Start by attaching decisions to recipes and components ("why this exists, where it applies") and surfacing them in `catalog_list` and the preview. Conflict detection comes only after applicability is expressible.

**What is possible but not Forge's to build.** Sustained upkeep and small-model routing belong to CMOS and Hive. The identity binding table (`node_id` across Figma keys, code identifiers and runtime anchors) waits until a second surface adapter exists; Forge URNs are enough while the surfaces are Forge and Stage1. Hosting a multi-tenant platform is not on the table. CMOS stays the system of record for decisions; Forge reads it.

**What does not resonate.** Autonomous semantic reconciliation (Stage1 shelved it after confident errors, and nothing has changed). A universal proposal-and-approval queue for every difference. Vendor-absence as a foundation.

### Sprint 203 — Objects born from use and context beside the design — BUILT, REVIEW PENDING 2026-09-16

Locked memo: [forge-s203-objects-and-context-decision-memo.md](../../planning/forge-s203-objects-and-context-decision-memo.md); build handoff: [forge-s203-build-handoff.md](../../planning/forge-s203-build-handoff.md); CMOS `sprint-203`, six serial missions on `codex/sprint-203-objects-and-context` from `a5d1ba084` (the Sprint 202 merge, served by the bridge). Derek, 2026-09-15: "lets lock s203 and the missions needed to get the work complete." Slices 1 and 2 together; the read was done in session by direct measurement, and no research mission was needed (slice 4 remains the one place one is warranted). Measured at the lock: Forge holds 18 objects / 240 runtime cells across 7 contexts and 21 non-viz traits in 8 families; Derek's CMOS store holds 1,927 decisions, 185 sprints, 498 sessions and 1,076 missions, and its `missions` table is close to a subset of the existing `research/Mission`; Hive is a read-only surface with **no screens at all** — 740 people rows, 307 active across 331 feeds, 427 articles in 14 days, 26 multi-person clusters; and Forge has no code path into any of those stores, `structuredData.fetch` reading only local datasets and a Stage1 run directory by filesystem path. Settled: objects are born from the live record and **no object lands without the screen that needed it**, composed and certified in the same mission; reuse is proven by a fit read before anything is authored, every field mapped to a reused object, a reused trait, a new trait or a stated reason for not modelling it; supersession (a decision replaced by a later decision) is the one genuinely new trait, and it is the same shape Forge already uses for composition versions and `accepted.json`; Hive's article question is settled by a measured field comparison rather than by preference; **context enters through the caller and Forge reaches into no other product's store**, because a direct reader would couple the bundle to CMOS 3.0.0's schema and break it for everyone who is not Derek; context is provenanced and durable or it is not shown, with the source, the query and the fetched-at on every item, staleness marked and an honest empty state; one `renderContext` serves the browser page and the conversation app. m01 closes the Sprint 202 carries; m02 the CMOS objects; m03 the Hive objects; m04 the new screens certified usable at the bar Organization and User were held to; m05 context beside the design; m06 closeout. Descope ladder: Hive's Cluster, the Session object, the context panel inside the conversation app, staleness marking. Out of scope by name: Forge reading CMOS, TraceLab or Hive directly and the aquex pass-through; writing into any other project's repo and every consumer notice; Stage1 observation against intent (slice 3); decisions checked against compositions (slice 4); the identity binding table; Figma.

Exit: the objects Derek's own products are made of exist in Forge, each with a screen certified usable, and a previewed composition shows the decisions and evidence about that object beside it.

**Built 2026-09-16, review pending.** Six serial missions on `codex/sprint-203-objects-and-context` from `a5d1ba084`. Measured, not claimed: the registry moves **18 → 23 objects** and **46 → 47 traits**, and the runtime roster **240 → 310 cells, 310 passing, 0 typed gaps**, swept once in the pinned Linux container with every added cell attributed in the golden ledger (70 born, 64 existing hashes moved, 176 unmoved). The lock's own premises did not survive measurement and the receipts say so: CMOS's `missions` table is **not** close to a subset of `research/Mission` — `Dropped` and `Deferred` are outside its state set, none of the 1,082 CMOS ids is uuid-shaped where it declares `uuid`, two required TraceLab pipeline fields have no CMOS value, and 41 of its 53 fields would render empty — so no CMOS mission object was authored and `Sprint.mission_count` carries what the screens need. Three of the four Hive reuses the lock named were refused the same way, on live values: `core/User` needs a uuid identity, a required `primary_email` Hive holds for nobody among 740 people, and a role that is an enum of account roles; `core/Relationship` needs uuid endpoints and five required fields a co-talker pair derived per window does not have, and expresses strength as one string where two independent counts disagree; `content/Article` requires `slug`, `author_id`, `content_type` and `body_markdown` that an ingested signal identified by url, attributed to a cohort person and sometimes paywalled cannot fill. `lifecycle/Stateful` for Hive's `tracking_status` is the one that held. `lifecycle/Supersedable` is the one new trait, authored once and serving both CMOS's forward pointer and Forge's own composition acceptances, which record the same lineage from the opposite end. Context enters through the caller and Forge opens no store of anyone else's — a spec asserts that closure over every source file in the server. The Sprint 202 carries closed: `heading-order` was recorded as one node and measured as **98 findings across 85 screens in both frameworks**, fixed in all three renderers; the adapter's verb check reached 16/16 with both the stale verb list and four noun-phrase descriptions corrected; axe inside the conversation view is a re-typed descope with the measurement behind it — a subtree run drops nine document-level rules including the three Sprint 202 m01 closed, and a document run reports the app's own chrome as the design's. **34 of 35 new screens are certified usable** across 1,260 measured width and scope cells with zero axe violations, zero console errors and the real 8,418-character decision reading in full at 390; `Decision/card` is not, because a CMOS decision has no title and the card says nothing about the decision. Three further defects are measured and left typed rather than fixed, each because the fix would disturb a screen an earlier sprint certified. Derek's Claude Desktop and Cursor runs remain his and are not claimed.

Phase E is scheduled loosely on purpose. Each slice is locked only when the previous one is proven on a real screen, and the sprint count is a guess. The research read for slice 4 is the one place a TraceLab mission is warranted.

## 9. Phase F — enterprise walk and the parks

- **Shopify-Forge** (its own repo, Sprint 0 done 2026-08-25). The enterprise walk resumes when Derek pulls it forward; it depends on the brand seam from the bundle (Phase C) and benefits from the design surface (Phase D). Not scheduled here.
- **Parts Town brand seed and mobile federation.** Parked until Derek unparks; their next-steps are carried with no target.
- **Narrated correlation certification.** Parked (`#1335`); resumes only on a real case where an agent is misled.
- **`schema.ingest`.** Shelved (`#1652`).

## 10. Remaining-work ledger from the last roadmap

Every open item from the near roadmap, its carries and the phase map, and where it lands. Nothing is dropped silently.

| Item | Source | Lands |
|---|---|---|
| Application craft: ranked list/detail/form/timeline/sample-data defects | `#1832`, `#1881`, `#1845`, `#1915` | Sprint 198 — closed; the residual craft list (`#2046`, plus the placed graph's title and labels and the sankey title overlap, `#2060`) was closed by Sprint 201 m06 (`#2112`) |
| Organization and User certified usable | exit criterion 8 | Sprint 199 — certified usable by the review (`#2060`) |
| Tabs normalization limit in full Invoice/Usage detail HTML (OODS-V007) | `#1951`, `#1978` | Sprint 198 — typed limit with an owner |
| Release profile executes its own evidence | exit criterion 6, phase map | Sprint 198 — claim narrowed to "format-checked and hash-bound, not re-executed" |
| TraceLab research objects compose at the craft bar | TraceLab UX-1, PR #105 | Sprint 198 — composed; Evidence filter and Mission header fixed in Sprint 199 m01 (`#2060`) |
| Palette: dark categorical set, Role-A separation, tooltip chrome, border-strong token, hue revision | `#1860`, `#1881`, next-step 831 | Sprint 197 — closed (`#2009`) |
| Sprint 197 residue: a11y-contract parser, three system-scope contrast pairs, six interaction-state guardrail rows, one token provenance for every gate, palette-golden-migration spec timeout, readiness `--check` in the verifier pass, token-change label at PR open | `#2009` | Sprint 198 m01 — closed |
| Type scale, spacing, radius, elevation and focus-ring pass on component chrome and the app shell | Sprint 197 memo rung 1, deferred | Sprint 200 m02 — closed (`#2087`) |
| High-contrast chart pixels (nine types, 18 scopes) | `#1851`, `#1951` | Paint scope decided in 197 (closed); rendered in Sprint 199 m05 — closed, 26 HC scopes conformant (`#2060`) |
| Seven typed core-profile chart gaps; 13 authoring-only patterns | `#1951`, `#1978` | Sprint 199 m03 — closed: 17 complete / 0 gaps / 3 retired; 22 public + 1 retired patterns (`#2060`) |
| Bubble-map radius scaling (four scopes) | `#1951` | Sprint 199 m04 — closed, four scopes conformant by measured area (`#2060`) |
| ECharts object placement | `#1944` | Sprint 199 m06 — closed: the force graph placed on Relationship; the other seven ECharts types not placed with their own reasons (`#2060`) |
| ECharts dual-axis band rendering, per-renderer fidelity assertion | next-step 982 | Sprint 199 m04 — closed (`#2060`) |
| ScaleTemporal timezone metadata | `#1969` | Sprint 199 m02 — closed, field removed at trait 0.3.0 (`#2049`) |
| ECharts server-side line rendering limitation | `#1971` | Documented limit, stays; written into the public `viz.render` description in Sprint 199 m02 — done (`#2060`) |
| Strict soak heap slope | `#1442`, `#1946` | Sprint 199 m02 — closed, strict assertion retired with measurements kept (`#2050`) |
| Five-suite capture green at the merged head; the isolated consumer-install harness hardened | `#2060` | Sprint 200 m01 — closed green at `ea6180317`: 17,738 / 0 failed / 32 skipped / 0 failed files (`#2087`) |
| Raw Vega-Lite whole-spec validity (16 annotated fixtures, x2/y2 type defect); historical Python exporter fixture | `#2059`, `#2060` | Next chart pass (the sankey title overlap and the placed graph title and labels closed in Sprint 201 m06, `#2112`) |
| `brand.apply` typed limit from the bundle (no brand source) | OODS-N020, `#1978` | Sprint 200 m04 — closed, brand source in the archive (`#2087`) |
| `design.preview` typed limit from the bundle (local server) | OODS-N019, `#1978` | Closed in Sprint 201 (`#2112`): m01 the preview from the bundle and the Sprint 200 residue, m06 the root Storybook chrome and the payload-to-file option |
| Alias retirement (`/ported`, `/readiness-ported`, `/css-ported`) | `#1382`, `#1385` | Sprint 200 m04 — closed (`#2087`) |
| Public publication, licensing, distribution, installer, "communicate Forge" onboarding | parks, gate-2 packet, strategic direction | Sprint 200 m03–m06 — closed: repository public, `v0.1.0` published (`#1983`, `#2061`, `#2087`); the outside-individual run is the Phase C exit, pending |
| Design-surface adapter (MCP Apps, Figma, Penpot, canvas) | parks, DT-R002 | Sprint 201 (the served preview, closed `#2112`) then 202 (MCP Apps, closed `#2150`); Figma parked |
| Objects born from use; context beside the design | `#1985`, §8 slices 1–2 | Sprint 203 — locked `#2151`: CMOS Decision/Sprint/Session and Hive Person/Cluster with their screens, and the context panel on the preview |
| Brownfield `map` consumption | phase map | Phase E slice 3; the claim stays narrowed until then |
| Classification approval, `approvedRuntimeCensus` | `#1438` | Closed as an agenda item by `#1979`; labels stay proposed; nothing depends on it |
| Nine disputed catalog rows, two alias/merge proposals | `#1421`, `#1881` | Implementation closed by 109/109 in Sprint 193; the labeling question closes with the line above |
| Accessibility/theme/interaction maturity beyond measurement | `#1881`, roadmap parks | Interaction states closed in Sprint 198 m01; chrome and focus closed in Sprint 200 m02 (`#2087`) |
| CI-14 power floor re-ratification | next-step 1300 | Dropped 2026-09-14: GitHub CI is off, so the trigger cannot fire |
| Parts Town: brand seed, collisions, stage1 re-extraction, PT questions, easing emission, strain ledger | next-steps 881, 1122, 1123, 1128, 1149, 1189, 1196, 1213, 1262 | Parked, carried with no target |
| Shopify-Forge enterprise walk | strategic direction | Phase F, Derek's pull |
| Consumer reconnect notices, gate-2 decision packet | `#1979` | Removed; never again |
| Derek's git housekeeping (branch protection, dead `main`, tracked scratch files) | next-steps 1150, 1225 | Not roadmap work; dropped from the list |

The Product Reality Program's ten exit criteria, for the record: 1–2 (classification) closed as not needed; 3, 4, 5, 10 met; 6 closed in Sprint 198 through the narrowed claim; 7 completed in Sprints 197 and 199; 8 met in Sprint 199 (Organization and User certified usable, `#2060`); 9 (design-surface writes) is Phase D.

## 11. How sprints run from here

- One short locked memo per sprint: what ships, what proves it, the descope ladder. No decision packets.
- Build in an isolated worktree on a `codex/sprint-NNN-*` branch, PR into `OODS-pro`; the primary checkout is the served bridge checkout, rebuilt and restarted by the agent after each merge.
- Ship first, verify with the suites the change touches, one full capture at sprint close. No per-mission baselines.
- GitHub CI is off (2026-09-14). Every gate is a local command that runs in minutes; nothing waits on a hosted workflow.
- Independent review in a separate session; it opens by saying where we are in plain words: what works, what does not, what Derek can do with it today. The review always closes the sprint: what it cannot certify becomes a named carry for the next sprint's first mission, and no missions are added to a sprint under review.
- No consumer notices, ever. TraceLab, cmos-dashboard, forge-demos and aquex-mcp are Derek's projects.
- Next work comes from this roadmap or Derek's own list, never from lists created during a session. Residue found at review is recorded and folded into the next sprint that touches the surface.
- Research runs on non-Fable agents when usage is tight.

---

# Retained record — Product Reality Program near roadmap, Increments 1–15 (Sprints 182–196)

*Retained verbatim on 2026-09-12 when the roadmap above replaced it. It is the measured history of the program and the source several closeout checks read; it is not the active plan. Its sprint-scoped numbers (for example 154/154 runtime cells) describe the heads named in each section.*


**Status:** ACTIVE — program decision `#1652`; Sprint 186 certified by `#1785`; Sprint 187 independently certified and closed by `#1809`; carries preserved by `#1810`; Sprint 188 independently certified and closed by `#1831`; craft carries preserved by `#1832`; capture policy `#1833`; Sprint 189 independently certified and closed by `#1844`; residual craft carries `#1845`; Sprint 190 independently certified and closed by `#1859`; residual visualization carries `#1860`; Sprint 191 independently certified and closed by `#1880`; residual carries `#1881`; Sprint 192 independently certified and closed by `#1891`; residual carries `#1892`; Sprint 193 independently certified and closed by `#1914`; residual craft carries `#1915`; Sprint 194 independently certified and closed by `#1934`; residual carries `#1935`; Sprint 195 independently certified and closed by `#1950`; residual carries `#1951`; Sprint 196 independently certified and closed by `#1977`; residual carries `#1978`

**Updated:** 2026-09-12 — Sprint 196 review session `PS-2026-09-12-005` (decision `#1977`); Increment 15 CERTIFIED AND CLOSED; residual carries are preserved by `#1978`. Sprint 195 remains independently certified and closed (`#1950`); its residual carries `#1951` are preserved where Sprint 196 did not resolve them. Classification approval remains Derek's (`#1438`); `approvedRuntimeCensus:null`.

**Sprint 188:** CERTIFIED AND CLOSED. Build base `cd8ee986`; Mission 1 delivered that merged head and the authentic User-form successor. Missions 2–5 built the generated React/Vue Subscription workflow and eight declared billing/archive recipes. Mission 6 froze the final proof and handed off. Review `PS-2026-09-08-011` (decision `#1831`) inspected all 36 frozen-head screenshots in both frameworks: the workflow runs end to end with all four states and criterion 8 is opened; usable is not certified, and the ranked craft carries are preserved by `#1832`. See [Increment 7](#increment-7--sprint-188-ship-then-make-the-subscription-app-whole--certified-and-closed).

**Sprint 189:** CERTIFIED AND CLOSED. Build base `f4cd1ba3`; Mission 1 delivered that merged head to the live bridge and sent the Sprint 188 reconnect. Missions 2–5 built the browser design loop (`scripts/design-loop`, public `design.preview`) and used it to retire all seven `#1832` carries at the producer. Mission 6 froze the final proof and handed off. Review `PS-2026-09-09-002` (decision `#1844`) inspected the 24 frozen-head receipts and 72 screenshots in both frameworks: every `#1832` item is resolved by exact receipt lines and criterion 8 is certified for the Subscription app; the residual craft list is `#1845`. See [Increment 8](#increment-8--sprint-189-browser-design-loop--certified-and-closed).

**Sprint 190:** CERTIFIED AND CLOSED. Build base `c3a68d5f`; Mission 1 delivered the merged Sprint 189 head `f19a654c` to the live bridge and sent the Sprint 189 reconnect. Missions 2–5 put the shared renderer on the public surface: `viz.render` returns SVG for all 13 types, dashboard HTML draws 11/11 admitted types, theme and brand resolve from the token scopes, `artifact.certify` grades the requested scope, VizAreaPreview renders a real chart on Subscription/detail, and one measured registry equals its public-handler census. Mission 6 froze the final proof and handed off. Review `PS-2026-09-10-001` (decision `#1859`) re-ran the registry contract test and the independent auditor at the frozen head and inspected the 52-cell matrix, contrast rows and browser receipts; the residual visualization carries are `#1860`. See [Increment 9](#increment-9--sprint-190-visualization-public-render--certified-and-closed).

**Sprint 191:** CERTIFIED AND CLOSED. Build base `d3a99d39`; no delivery mission, because the bridge already served that head. Mission 1 put a measured dark categorical palette into the A/B token scopes, repaired light slot 04, added the registry `contrastPassed` cell and gave `code.generate` theme/brand options so the generated app takes its theme. Mission 2 closed OODS-N016 generically so the Organization and User workflows generate (77/77, 154/154) with six packed cells green. Mission 3 retired the seven `#1845`/chart craft items and `#1274` at the producer with BEFORE/AFTER receipts. Mission 4 closed maintenance `#1318`–`#1322` on receipts and rebuilt the `#1315` bundle clean. Mission 5 froze the final proof and handed off. Review `PS-2026-09-10-008` (decision `#1880`) recomputed all 24 palette cells from the built CSS, re-ran the independent auditor and the contract specs at the head and inspected the dark and AFTER screenshots in both frameworks; the residual carries are `#1881`. See [Increment 10](#increment-10--sprint-191-carry-forward-pay-down--certified-and-closed).

**Sprint 192:** CERTIFIED AND CLOSED. Build base `5fdf8a18`; Mission 1 delivered that merged head to the live bridge and sent the six prepared notices, closing `#1315`. Mission 2 put the four component packages into CI and a fifth capture suite and repaired the token contract (zero unresolved colour roles, zero system-colour fallbacks in six scopes, 106 `cmp` semantic aliases). Missions 3–4 measured accessibility, interaction and six theme scopes for every governed root in React and Vue inside the CI job. Mission 5 implemented AuditSummaryCard, SortIndicator and TimelineEntryLabel on that proof and cleared the Invoice V007 warnings. Mission 6 regenerated the ledger from evidence, refreshed the served export and completed the 109-row classification proposal. Mission 7 froze the final proof and handed off. Review `PS-2026-09-10-013` (decision `#1891`) re-ran the token resolver, the composition census and the retained component verifier at the merged head, read the served export and the five capture receipts, and confirmed the hash-bound `#1890` derivation exception; the residual carries are `#1892`. See [Increment 11](#increment-11--sprint-192-component-truth--certified-and-closed).

**Sprint 193:** CERTIFIED AND CLOSED. Build base `c098237f`; Mission 1 delivered that merged head to the live bridge and sent the three prepared notices, closing `#1439`. Mission 2 built the generic packed runtime harness and measured all 132 single-screen cells from one pack, with a CI job, a contract spec and a real emitter-removal bite. Mission 3 ran all 11 workflows in both frameworks (22 cells, 16 state observations each; Invoice and Plan for the first time) and put `productReality.runtime` on health. Missions 4–5 implemented the 34 missing roots (nine non-viz recipes, 25 Viz recipes bound to `viz.render` intent) on the Sprint 192 proof, reaching 109/109 React and Vue. Mission 6 derived the 27-entry tool-capability ledger served by health and fixed the stale narrative. Mission 7 froze the final proof and handed off. Review `PS-2026-09-11-003` (decision `#1914`) read the 154-row runtime ledger, the served catalog and health outputs, the passing five-suite accounting and the independent audit at execution head `8858a575`, and inspected the Invoice and Plan workflow receipts in React; runtime and component evidence are certified, application craft is not, and the ranked craft carries are `#1915`. PR #98 merged into `OODS-pro` at `1f69c957`. See [Increment 12](#increment-12--sprint-193-runtime-at-scale--certified-and-closed).

**Sprint 194:** CERTIFIED AND CLOSED. Build base `1f69c957`; Mission 1 delivered that merged head to the live bridge, sent the three prepared notices and split the coverage CI job into two budgeted jobs. Mission 2 made the brand seam real: intake emits a consumable delta, `brand.apply` writes canonical brand source under an operator-only root and runs the real token build with captured exit, `tokens.build` returns the requested scope, and chart, app-shell and component pixels move from one source edit. Mission 3 narrowed `map` to an external resolver and proved map, registry.snapshot, schema, object and structuredData.fetch at the wire. Mission 4 retired `viz.compose`, `review` and `release.verify` with decisions `#1922`/`#1923` and gave the five remaining on-demand tools real dry-run contracts. Mission 5 resolved every inert option (212 input properties, zero unresolved). Mission 6 gave all 19 advertised tools real-handler boundary proof and extended the portable E2E to 28 calls over all 19 tools with five documented limits (`#1927`–`#1929`). Mission 7 froze the final proof and handed off. Review `PS-2026-09-11-006` (decision `#1934`) read the ledger and registry files directly, reran the independent auditor (41 criteria, 8 executions, 776 frozen paths) and the producer check, confirmed the served bridge and the corrected CI run `34630306346`, and found two docs-only drifts fixed in the closure commit; tool truthfulness and the host-side brand seam are certified, portable brand writes and React/Vue generation from the Gate-1 bundle are not, and the carries are `#1935`. See [Increment 13](#increment-13--sprint-194-tools-truthful--certified-and-closed).

**Sprint 195:** CERTIFIED AND CLOSED. Build base `5b25c3c9`; Mission 1 delivered that certified head to the live bridge, sent the three prepared notices and widened the retirement gate to every retired name. Mission 2 generated the versioned taxonomy and Core Analytics Profile (34/34 identities in eight families; 13 of 20 core cells surface-complete, seven typed) and served it on `health.productReality.viz`. Mission 3 promoted the 21 patterns to registry identities behind a public `viz.render` `pattern` input (8 public, 13 authoring-only with typed reasons). Mission 4 implemented the declared operand certification profile so all 13 types are certified on that path, with new accuracy rules for bubble_map, flow_map and force_graph (V168–V173). Mission 5 revised the categorical palette to Role-A ≥ 10 with all 24 Role-C checks intact and admitted `hc` with verbatim scope paints (four types render, nine typed-deferred). Mission 6 generalised chart placement to every bound Mark trait, placed Invoice bar and Usage line with real SVG, ran three visualization bites and bounded the soak. Mission 7 froze the final proof and handed off. Review `PS-2026-09-12-001` (decision `#1950`) measured the registries, ledger, generators, contract specs, raw capture totals, producer check, auditor rerun, bridge and CI directly; carries are preserved by `#1951`. See [Increment 14](#increment-14--sprint-195-visualization-breadth-and-certification--certified-and-closed).

**Sprint 196:** CERTIFIED AND CLOSED. Build base `1d100e20`; Mission 1 delivered the tree-identical PR #102 merge `91c1f5f2` to the live bridge, sent the three prepared notices and made every closeout path derivation NUL-delimited. Mission 2 put the bridge into the portable bundle as the thirteenth runtime package with a strict policy, an assembly-time revision stamp, a hash-bound readiness attestation, declarations kept by the pruner, structured native errors through the adapter and a typed brand-source code, so 17 of 19 advertised tools execute from the bundle with two typed limits. Mission 3 generated, built and ran Subscription, Organization and User from the extracted bundle (42/42 cells, every artifact hash equal to the host) and moved the runtime ledger to its canonical registry path. Mission 4 generated docs/components (109 + index), Tool-Specs, the how-forge-works claim spans, Connections and two package READMEs with `--check` under one `docs:check` CI step. Mission 5 pinned temporal rendering to UTC in both adapters with a receipted golden migration and proved the doc, bundle and timezone bites red then green. Mission 6 prepared the Gate-2 packet from generated facts with root `private:true` as the only publish-shape change. Mission 7 froze the final proof and handed off. Review `PS-2026-09-12-005` (decision `#1977`) read the ledgers and archive digests directly, reran the producer, its check and the independent auditor under default git config (26 criteria, 13 executions, 1613 frozen paths), ran `docs:check`, a live doc bite and the live cross-timezone probe (16/16 cells equal), and confirmed the merged head `114a268e` tree-identical to `f703ceda` with CI green; the residual carries are `#1978`. See [Increment 15](#increment-15--sprint-196-release-proof--certified-and-closed).

**PR integration:** PR #84's initial CI run failed three jobs after the frozen local proof. [CI follow-up](../../planning/forge-s187-ci-followup.md), session `PS-2026-09-07-003` / decision #1811, records the correction; remote acceptance is determined by the checks on the corrected PR head. PR #84 and PR #85 subsequently merged into `OODS-pro` at `cd8ee986`. Sprint 188 merged through PR #86 (`33a20d0e`) and PR #87 (`ed0d5750`); remote CI on the frozen head `7fc3c9e0` passed all three workflows before the review.

**Scope:** The next increments — Increment 12 (Sprint 193, certified and closed), Increment 13 (Sprint 194, certified and closed), Increment 14 (Sprint 195, certified and closed) and Increment 15 (Sprint 196, release proof, certified and closed); after Increment 15 the phase map hands to M6, Derek's gates decided one at a time from the [Gate-2 packet](../../planning/forge-gate2-decision-packet.md); the whole remaining map is [the phase map](../../planning/forge-remaining-work-phase-map-2026-09.md) (`#1893`); see [Program position](#program-position-and-the-next-three-increments)

**Program authority:** [Forge Product Reality Program](product-reality-program.md)

## Direction

OODS Foundry and Forge must function as one usable design system and agent toolchain Derek can use to
build real work. Greenfield output is a first-class requirement. Mapping into an existing company
system remains valuable, but it cannot substitute for Forge-owned components, runtime artifacts, or
working generation.

Two direction decisions from 2026-09-05 govern this queue. The Sprint 182 promotion freeze is void
(`#1722`): it was self-imposed, nothing outside our own scripts depends on it, and it is never cited
as a constraint again — new components go straight into the nucleus. The binding constraint on the
program is component breadth (`#1723`), so the increments after Runnable Generation are breadth waves
ordered by how many pre-existing saved schemas each wave makes reachable. Sprint 186 reached the
disclosed successor corpus's 16/16 boundary. The next locked breadth metric is fresh composition
through the existing public object/context inputs; saved-corpus success does not establish that coverage.

The current program does not ratify MCP Apps, Figma, Penpot, or a custom canvas; surface selection
follows runnable product foundations.

## Current measured state — Sprint 196, 2026-09-12; CERTIFIED AND CLOSED (`#1977`)

| Claim area | Current evidence | Remaining obligation |
|---|---|---|
| Component catalog | **109/109** governed React and Vue roots, **109/109** HTML mappings and versioned contracts. The `2026-09-11-s193-m07` export equals the regenerated component ledger | All109 classifications await Derek; `approvedRuntimeCensus:null`. Proposed native/recipe/alias labels are not approved |
| Component maturity | Accessibility/theme **109 verified** each; interaction **40 verified / 69 not-applicable**, with reasons. Six scopes ×109 roots ×2 frameworks = **1308 measured cells** | Component theme proof does not certify automatic recoloring of supplied SVG or application craft |
| Runtime coverage | **154/154 pass**, zero typed gaps/failures: 11 objects ×7 contexts ×2 frameworks, one pack/run at frozen implementation `794084bf`. Invoice/Usage dashboard layouts add **4/4** separately scoped cells; their detail/dashboard charts add **48/48** brand/theme checks. The canonical population places **68/109** component identities | The remaining 41 identities are not placed by those public schemas. Separate real-trait fixtures and component proofs remain separate; runtime does not imply application craft approval |
| Fresh composition | **77/77 schemas and 154/154 generation cells**; 77 unchanged composed schemas versus the Sprint 195 census, with class-enumerated input and component identities. The four earlier Invoice/Usage chart placements remain intact | Eight chart declarations across 88 context/layout requests cover area, bar and line. Declaration coverage and runtime proof remain distinct |
| Saved designs | Original15/16 retained as a historical negative; adopted successor16/16;17 live-store hashes unchanged | No saved source mutated by the census |
| Tool truth | **24 entries**:19 auto +5 on-demand. Source-test tiers **19 product-reality /5 contract /0 unit /0 none**; all19 advertised tools called by the portable E2E | Boundary execution receipts retained. Portable outcomes:17 pass and2 typed limits (`brand.apply` OODS-N020 and `design.preview` OODS-N019); source proof does not imply portable success. Three retired entries retain decisions. |
| Delivery and discovery | Sprint 196 m01 delivered **91c1f5f2**, tree-identical to certified closure **1d100e20**, to primary PM2 and sent exactly three byte-identical notices. Built catalog and health expose component/runtime/tool/viz ledgers; candidate portable health also exposes `productReality.release` | The Sprint 196 candidate is certified (`#1977`; PR #103 merged into `OODS-pro` at `114a268e`, tree-identical to `f703ceda`) and not yet delivered: the live bridge serves `91c1f5f2` until the next sprint's first mission delivers the certified head and sends the three prepared notices for cmos-dashboard, forge-demos and aquex-mcp; the m01 notices are already sent |
| Visualization | **34/34 identities** classified into eight families; 20 core cells: **13 surface-complete /7 typed gaps**. The 21 patterns have **8 public /13 authoring-only** identities. Thirteen chart types yield **60 rendered /18 typed HC-deferred** scopes out of 78. All 13 types have a declared certification path; 56 rendered scopes conform and four bubble-map scopes remain nonconformant. Palette Role-A minima exceed 10 with all 24 Role-C checks passing | HC contrast is typed forced-colors exemption, not a numerical contrast measurement. Spec-only ECharts stays uncertified/null. ECharts object placement carries under #1944; bar/line are placed. Full Invoice/Usage detail HTML retains Tabs OODS-V007; chart-node HTML carries real SVG. Sprint 196 uses UTC temporal scales, time units, parsing and ECharts axes; the retained timezone bite proves identical baseline/restored output under America/Chicago and UTC. The fresh 78-scope and 84-pattern censuses reproduce the canonical registries; the golden migration retains its original qualification head |
| Release proof | The portable artifact contains **13 runtime packages**, including the bridge, policy and hash-bound readiness attestation. The three reference apps pass **42/42 extracted-bundle cells** at `794084bf`, with every generated artifact equal to its matching host operand. The host runtime is **154/154**, plus separate dashboard4 and chart-theme48 proof | The final closeout records the one five-suite campaign, every skip/delta, original archive identities and actual CI heads. Independently certified by review `PS-2026-09-12-005` (`#1977`); historical builder receipts retain `builderSelfCertified:false`. Gate-2 publication and installer choices are proposed, with no publication or new candidate delivery. Strict soak retains its statistical failure as `OODS-SOAK-1442` under #1946 |

The Sprint 187 evidence below is retained as this table's historical baseline.

The exact runtime and saved-store hashes are in
[the m06 evidence packet](../../../artifacts/product-reality/sprint-187/m06/README.md).
Final four-suite counts, skipped tests and file-attributed deltas belong to its retained capture and
claim ledger. The baseline comparator is s186 execution `740e8405`, never a relabeled run. The initial clean `2a7bb93e` capture failed22 server and17 root assertions; its raw evidence remains retained. Corrected bundled discovery schema and contract expectations are verified at the new implementation. The corrected capture and output audit record the final build gates and were verified during independent review.

Independent review re-derived all seven criteria byte-for-byte and reran the separate output audit:
30 executions and 900 frozen paths pass. Rebuilt fresh and saved censuses reproduce the table above.
Raw suite counts are 1390 / 64 / 5866 / 6146 passed, zero failed, with the identical 16 existing skips
in the overlapping server/root runs. The review inspected retained browser and suite receipts rather
than repeating those full runs. See [the review determination](../../planning/forge-s187-review-determination.md).
CMOS closed Sprint 187 on 2026-09-07; learnings #516–#518 and carry-forward #1389–#1391 retain the
review lessons, delivery work and explicit product limits. Master-context milestone snapshot: 2162.

Counts describe the named surface only. HTML evidence is not React or Vue evidence, a source emitter
is not a runtime package, an admitted chart name is not rendered output, and a preview frame is not a
chart.

## Program position and the next three increments

Sprint 193 closes the implementation gap left after Increment 11: every one of109obligations now resolves in both governed frameworks and has measured maturity cells. The public runtime population is154/154 at one recorded head; its66placed component identities remain separate from the109implemented roots. The tool ledger exposes the remaining advertised-claim work. Classification approval, application craft inspection, visualization breadth, the design-surface choice and integrated release proof remain open.

| Increment | Sprint | Outcome | Exit |
|---|---|---|---|
| 11 — Component truth | 192, CERTIFIED AND CLOSED (`#1891`) | Proof in the gate; token-resolution contract; accessibility, interaction and theme measured 75/75 in both frameworks; the three disputed rows; the ledger regenerated and served; the 109-row classification proposal | Every governed root has measured cells from suites that run in CI; `catalog_list` serves them; Derek's approval is the only open step to a non-null runtime census |
| 12 — Runtime at scale, the 34 rows, the tool-truth census | 193, CERTIFIED AND CLOSED | The generic single-screen harness over all 132 single-screen cells (one pack per sweep) and the workflow harness over all 11 workflows, so runtime-proven cells become a gated ratio served by `health` at154/154 with zero typed gaps; the 9 remaining non-viz rows and the 25 `Viz*` control rows implemented on the Sprint 192 machinery; a generated tool-capability ledger over the 27 registry entries served by `health` (measure only) | Runtime coverage is a gate, not prose; React and Vue implement109/109 with measured maturity cells; every advertised tool has a measured proof tier |
| 13 — Tools truthful | 194, CERTIFIED AND CLOSED (`#1934`) | Every advertised tool proven at the MCP boundary and called by the portable E2E, or narrowed/retired with a record: the brand seam end to end (intake → apply writes source with receipt → real build → pixels move), `map` output consumed by composer/codegen or the brownfield claim narrowed, `viz_compose` retired, `review` given a contract and a real patch output or retired, inert options and swallowed errors removed | 24-row ledger: 19 advertised at product-reality tier with portable calls, 5 on-demand contracts, 3 retired with decisions; zero advertised claim without executable evidence; five portable limits typed |
| 14 — Visualization breadth and certification | 195, CERTIFIED AND CLOSED (`#1950`) | Versioned taxonomy/Core Analytics Profile; 21 pattern identities; measured operand certification, canonical palette revision, forced-colors proof, bar/line placements and real mutation checks | 34/34 classified; 13/20 core cells surface-complete and seven typed gaps with reasons. ECharts placement and measured HC failures remain explicit; carries preserved by `#1951` |
| 15 — Integrated release proof | 196, CERTIFIED AND CLOSED (`#1977`) | The bridge is in the portable bundle; Subscription, Organization and User run from extracted packages; component/tool/narrative docs are generated or pinned with `--check`; doc, bundle and timezone mutations fail then pass after restoration; Gate-2 options are prepared | 13 runtime packages in the bundle with the bridge and the attestation; 42/42 reference-app cells from the bundle equal to the host; 19/19 advertised tools product-reality with two typed portable limits; six generated doc surfaces under `docs:check`; temporal rendering byte-identical across timezones; carries preserved by `#1978` |

Re-sequenced 2026-09-11 by the phase map (`#1893`): tool truth moves ahead of visualization breadth because the tool gaps are claims Forge makes today, while chart breadth is capability not yet claimed. The design-surface adapter decision remains Derek's gate and can be taken after Increment 12 without displacing the sequence. Sprint numbers after 193 are assigned only after each preceding increment's independent review.

## Increment 1 — Sprint 182: Product Reality Foundation — CLOSED 2026-09-04

Reviewed by `PS-2026-09-04-004` (decision `#1662`); `foundation-v1` promoted by Derek (decision
`#1663`). The 14-component nucleus is real in React and Vue with clean packed-consumer proof. Its build
authority was
[forge-s182-product-reality-foundation-decision-memo.md](../../planning/forge-s182-product-reality-foundation-decision-memo.md).

## Increment 2 — Sprint 183: Runnable Generation — CLOSED 2026-09-05

Built by `PS-2026-09-04-007` at frozen head `9a4202fe` and independently reviewed by `PS-2026-09-05-001`
(decision `#1689`, determination in
[forge-s183-review-determination.md](../../planning/forge-s183-review-determination.md)). The exit gate
was genuinely met: the six-month-old schema `compose-7d860337` installs, builds, renders, hydrates and
passes interactions in clean React and Vue consumers. Two record defects blocked certification — a
`passed` claim that five archived mutation patches could not support, and an undisclosed loss of HTML
generation for Forge's own detail template absorbed by repointing tests. Both were repaired in
`s184-m07`, and the sprint was closed on 2026-09-05.

## Increment 3 — Sprint 184: First Greenfield Workflow — CLOSED 2026-09-05, PARTIAL BY DESIGN

Built from `ab0d712d` and reviewed by `PS-2026-09-05-004`; closed by Derek the same day. Its build
authority was
[forge-s184-greenfield-workflow-decision-memo.md](../../planning/forge-s184-greenfield-workflow-decision-memo.md).

It ported the eight components the two March-2026 Subscription schemas needed, resolved six
off-contract facts by moving contracts rather than schemas, added the workflow state axis to the
schema language and both emitters, reversed the screen-scope binding rule so generated call sites
exist, replaced the textual stub guard with a forwarding check, and proved the list → detail slice
from live generation in both frameworks.

**Increment 3 is recorded as partial, in those words.** The four workflow states are proven on a
schema the sprint's own script builds; the real Subscription schemas are proven state-neutral. No
single artifact demonstrates the program sentence "the same semantic workflow is usable in both
frameworks with loading, empty, error, and success states." Edit/cancel and timeline have no
pre-existing schema, and authoring one would be the circularity the increment exists to avoid. The
review also found that the sprint's per-mission mover accounting missed five consumer-relevant
advertised movers, including the nucleus Table's zero-row output; that notice is owed and is sent in
Sprint 185.

## Increment 4 — Sprint 185: Component Breadth Wave 1

Numbered because Sprint 184 is independently reviewed and closed. Its build authority is
[forge-s185-component-breadth-wave-1-decision-memo.md](../../planning/forge-s185-component-breadth-wave-1-decision-memo.md),
locked by decision `#1724` at build base `1118f436`.

It adds **DetailHeader, CardHeader, ColorSwatch, ColorizedBadge and VizAreaPreview** to the nucleus as
real React and Vue components and proves them by running the six pre-existing saved schemas they block
through live generation and the consumer gates in both frameworks. Reachable saved schemas go from
5/16 to 11/16.

Planning measured twelve target cells failing with `OODS-N015` on those five IDs and twelve green
pruned controls. It incorrectly inferred a pure port; the build found the hidden defects described
below. The sprint also retired the voided literal nucleus freeze. VizAreaPreview ships honestly as a
sized preview frame, not a chart (`#1727`).

**Built and independently reviewed 2026-09-06; CERTIFIED and CLOSED** (review session
`PS-2026-09-06-002`, determination in
[forge-s185-review-determination.md](../../planning/forge-s185-review-determination.md)). The exit
gate held from live generation: 124 of 124 applicable gates over 16 framework cells, four interaction
rows not applicable and excluded; reachability 11/16; every live nucleus pin derived. The "pure port"
inference did not survive the build — three contract defects were found and repaired in-sprint
(`#1734`, `#1736`, `#1738`). Four-suite closeout at `f8d15098` was green with zero failures.

## Increment 5 — Sprint 186: Component Breadth Wave 2 — CERTIFIED AND CLOSED

Locked 2026-09-06 on Derek's confirmation. Build authority was
[forge-s186-component-breadth-wave-2-decision-memo.md](../../planning/forge-s186-component-breadth-wave-2-decision-memo.md)
at build base `5aa53b3a`. The starting census showed the remaining five unreachable schemas blocked by
exactly 23 components, all with executing HTML renderers. Six missions, one per schema in
smallest-cluster-first order (test-tagged 3, user-detail 4, user-list 5, user-timeline 5, user-form 6)
and a sixth that folded the eight ported families into the root. Existing Sprint 185 tooling was
reused with explicit narrow adaptations (#1780), rather than literal unchanged execution.

Independent review `PS-2026-09-06-006` closed the sprint under decision #1785. Governed components
grew 27 → 50; the five newly reachable schemas passed 80/80 applicable consumer gates in both
frameworks. **The 16/16 result applies to the authentic recomposed successor store.** The original
historical corpus remains 15/16 on five invalid User-form field bindings per framework. Decisions
#1776–#1779 record the scope adjustment; the program's original-input obligation is not silently
removed. See [review determination](../../planning/forge-s186-review-determination.md).

Pace rule from Derek, in force from this sprint on: appreciable progress every sprint, not a little work
and a lot of measuring. No per-mission four-suite captures, no new closeout apparatus, no critic
workflow. The per-component evidence bar from Wave 1 is unchanged.

## Increment 6 — Sprint 187: Fresh Composition Coverage — CERTIFIED AND CLOSED

**LOCKED** by decisions `#1787`–`#1789`, planning session `PS-2026-09-06-007`.
The [decision memo](../../planning/forge-s187-fresh-composition-decision-memo.md) is the build authority.
The fourteen component families, binding repairs, discovery refresh and delivery preparation are
implemented. The serial mission evidence is retained under `artifacts/product-reality/sprint-187/`.
The final census at `a9c02b7d` improves the planning baseline from 27/66 schemas and 58/132 cells to
**66/66 and 132/132**. All 28 selected consumer cells pass their applicable gates (218 pass,
6 explicitly N/A, zero failures/skips). No schemas were pruned or hand-authored as fresh inputs.

| Delivered work | Evidence boundary |
|---|---|
| LabelCell, InlineLabel, FormLabelGroup, ClassificationBadge, ClassificationEditor | Real React/Vue roots, contracts, styles and local native classification controls; no persistence |
| OwnerBadge, OwnershipSummary, OwnershipMeta, TagSummary | Owner/role metadata, zero counts, tags and documented children precedence |
| ArchiveSummary, ArchivePill, CancellationForm, CancellationBadge, PriceCardMeta | False badges, nullable archive timestamp, price model/interval and local cancellation controls; no cancellation workflow |
| Composition and binding repairs | StatusTimeline.label, numeric zero, boolean false, local query updates, optional card actions and nullable datetime; original Product/detail B2 operand measured separately |
| Discovery/census/aliases/delivery | Retain109 explained in live discovery; eleven dispositions recorded; aliases retained because migration is unproven; isolated delivery rehearsal and rollback complete |

The existing s185/s186 proof tools received named, bounded s187 adaptations. No new closeout
framework or per-mission four-suite capture was introduced. The source capability fold is unchanged
from the evidence-backed m04 result:150 surface cells on 50 existing IDs and 600 references, with all 109
identities retained. Final m06 runtime evidence supplements those retained proofs.

After this increment, the strongest follow-on candidates are the still-partial **complete greenfield
workflow** and **current visualization public-render closure**. Neither is automatically numbered or
locked here. The green 66-schema generation matrix does not prove navigation, edit/cancel, state
transitions, responsive craft, remaining catalog breadth, or chart pixels.

## Increment 7 — Sprint 188: Ship, then make the Subscription app whole — CERTIFIED AND CLOSED

The build follows decisions `#1814`/`#1815` and amendments `#1817`, `#1822` and `#1825`. The [decision memo](../../planning/forge-s188-subscription-workflow-decision-memo.md) and amended CMOS criteria control scope. The [M05 packet](../../../artifacts/product-reality/sprint-188/m05/README.md) records the component and application evidence; the [M06 handoff](../../../artifacts/product-reality/sprint-188/m06/accepted-timeout/README.md) records the final implementation, execution and evidence heads. Sprint 188 is **Completed**, independently certified by review `PS-2026-09-08-011` and decision `#1831`. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled.

**Delivered:** Mission 1 fast-forwarded the primary checkout to merged `cd8ee986`, rebuilt and restarted PM2, repaired served schema loading, and adopted only the authentic User-form successor with hashed backup/rollback. Seventeen HTTP probes and two retained N015 negatives verified the served result. The authorized combined reconnect was sent once to aquex-mcp and forge-demos. The new workflow implementation awaits the next reviewed delivery.

**Built:** public `context:'workflow'` produces a runnable Subscription application in both frameworks: generated navigation, typed local store, ten deterministic records, edit/save/cancel/history, archive views and loading/empty/error/success on list/detail/form/timeline. The M05 proof passes 16 gates, 18 flow checks and 32 state observations with 36 screenshots at 390/820/1440, including payment and archived views. The final M06 proof repeats at its frozen implementation head.

All eight declared rows are implemented: BillingSummaryBadge, BillingAmountInput, BillingIntervalSelector, CycleProgressCard, PaymentTimeline, PaymentEventTimeline, BillingCardMeta and ArchivedRowOverlay. Composition uses three mechanisms keyed on the declared recipe set: resolved parameters, extension-only selection and placement preservation. Generic grouping and unplaced-extension behavior are regression-pinned. M04 and M05 census changes are exactly attributed against their prior heads; the current baseline is 66/66 schemas and 132/132 screen generation cells plus Subscription/workflow's two cells. Current catalog discovery restores the original 14 nucleus rows from independently approved foundation evidence; frozen baseline/intake/reconciliation records remain unchanged. `/health.revision` exposes the build commit and structured-data manifest hash from a build-time stamp.

| Mission | Outcome |
|---|---|
| m01 | Delivery, adoption, reconnect from the primary checkout; no code change |
| m02 | `context:'workflow'`, application emitters in React and Vue, real field labels |
| m03 | The app live in both frameworks: full flow, four states on four screens, screenshots |
| m04 | BillingSummaryBadge, BillingAmountInput, BillingIntervalSelector |
| m05 | CycleProgressCard, PaymentTimeline, PaymentEventTimeline, BillingCardMeta, ArchivedRowOverlay; nucleus catalog truth; `/health` revision |
| m06 | Census 66/66 plus `Subscription/workflow`, one four-suite capture, sprint-wide advertised diff, review handoff |

Exit: the program sentence — *the same semantic workflow is usable in both frameworks with loading, empty,
error, and success states* — met for Subscription, and criterion 8 opened with one application. **"Usable" is
decided by the independent review's responsive/craft inspection, not by the build.** The sprint does not claim
persistence, a backend, URL routing, confirmation or permission primitives, or maturity of the 64 families.
Descope ladder and never-cut list are in the memo. After this increment, the strongest follow-on candidates are
the **browser design loop** (compose, render live, adjust, reconcile) and **current visualization public-render
closure** (#1372); neither is numbered or locked here.

**Review verdict (`PS-2026-09-08-011`, decision `#1831`):** all 36 screenshots at 390/820/1440 in both frameworks
were inspected. The application is operable end to end and the eight declared rows render real values, but the
composed source screens carry template defects — an unwired list header block with a `No items` paginator above
nine records, four empty timeline cards, description-as-label form fields with duplicated controls, an editable
cancellation fieldset and `Archived: false` on the detail screen, raw ISO timestamps — so usable is not certified.
The ranked carries are decision `#1832` and are the target list for the browser design loop candidate. Capture and
timeout handling for Sprint 189 is decision `#1833`.

## Gates that apply to every increment

- Claims come from executable evidence, never catalog prose or research conclusions.
- React and Vue are equal targets; framework-specific behavior stays idiomatic.
- Packed-consumer tests use no workspace alias, repository source import, existing `node_modules`, or
  user registry configuration.
- An unsupported target fails with a typed gap; warning-only fallback is not success.
- Exploratory work may use advisory validation. Production/release artifacts must pass the declared
  enforced profile.
- Every significant failure mode receives a negative test or mutation bite capable of proving the
  gate is discriminating, and a bite for a behavioral promise removes the behavior, not a string.
- A pre-existing test whose input changes during a sprint carries a stated reason in the closeout.
- A claim quantified with "every" is measured against the full tracked population at the review head.
- Advertised-surface movement is computed once, sprint-wide, from the final diff — never assembled
  from per-mission scopes.
- Automated snapshots prove stability, not design quality; an independent review inspects responsive
  craft and interaction states before a greenfield artifact is called usable.
- A build session records evidence and stops. A separate review session decides genuine close, and
  scopes its verification to findings that could flip the determination.
- Public publishing, hosting, and paid external API use require explicit later decisions.

## Parallel obligations and parks

Sprint 191 m04 closes maintenance `#1318`–`#1322`: SR27 requires the full sprint advertised diff,
runtime scans include native adapter JavaScript, OODS-N013 keeps its unavailable-target category with
matching descriptions, historical DTCG and repinned-schema bites are retaken, and the A --final pin
is confirmed. `#1315` remains pending: the reproducible bundle and exact re-pin notices are prepared
for Sprint 192 delivery after review, with zero sends. Evidence: `artifacts/product-reality/sprint-191/m04/README.md`.

Derek resolved the census choice (#1331) by accepting the recommendation to **retain all 109
obligations** (#1788). The old 98-runtime split is not approved. Its generator assigns `authoring-only`
when a root React export or HTML renderer is absent, although the excluded traits describe runtime
behavior. Missing implementation cannot by itself remove an obligation. Sprint 187 m05 reviewed
those eleven rows with trait/caller evidence: nine retain implementation work and two alias/merge
proposals need product decisions. No runtime intent was excluded because code was missing.
The historical `approvedRuntimeCensus` stays null while that old proposal is unapproved; live discovery
must explain the accepted retain-109 ruling. Surface-cell evidence updates do not move scope (#1726).

The following are parked until their named dependency is met:

- the eight-family root fold is complete; `/ported`, `/readiness-ported` and `/css-ported` alias
  retirement was reviewed in Sprint 187 (#1382/#1385); retain aliases while external migration is unproven;
- closure of all current visualization recipes, and making VizAreaPreview a real chart — after
  component breadth, unless independent staffing permits parallel work;
- visualization breadth beyond the current 13 — after the public render and certification path is
  coherent;
- Figma, Penpot, MCP Apps, or another design-surface adapter — after Forge artifacts are runnable and
  the adapter's capabilities, costs, auth, and write semantics can be evaluated honestly;
- public package publication or hosted Forge delivery — after licensing, distribution, and operating
  cost decisions; and
- `schema.ingest` — historically shelved by `#1649`; decision `#1652` retains the shelving result
  while superseding its incorrect surface claim.

## Independent review and remaining delivery

Read [the m06 evidence packet](../../../artifacts/product-reality/sprint-187/m06/README.md) and its
claim-ledger/review-handoff JSON. The build is in
`/Users/systemsystems/.codex/worktrees/s187/OODS-Forge`, branch
`codex/sprint-187-fresh-composition`; actual public implementation `a9c02b7dadeef56690be82e05fe8b02f54beff9f`.
The ledger separately names the actual four-suite execution and frozen evidence/review commits;
public-byte equivalence must hold between implementation and execution. Canonical CMOS remains in
the primary checkout, whose unrelated dirty work was not reset or used as implementation source.

Sprint 187 is **Completed**, independently certified by review `PS-2026-09-07-002` and decision
`#1809`. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled.
Delivery #1374/#1379/#1384 was completed by Sprint 188 m01 at merged `cd8ee986`, with the authorized
PM2 restart, exact User-form adoption and combined reconnect. That delivery does not deploy Sprint 188's
new workflow. Alias retirement and unverified maturity remain open. Maintenance #1315/#1318–#1322
remains named and unabsorbed before integrated public release. PR83 CI follow-up #1386 was resolved;
its ECharts soak skip remains disclosed.

The historical Sprint 189 delivery draft was sent by Sprint 189 m01 after reviewed `f4cd1ba3` was delivered.
The Sprint 189 review (`#1844`) inspected the AFTER receipts and screenshots: the duplicate source/application
controls, raw timestamps, narrow summary terms, wrapped archive badge and surplus empty cards are gone, and the
Subscription app is certified usable; the residual craft list is `#1845`. Sprint 190 m01 delivered that merged head
(`f19a654c`). The Sprint 190 review (`#1859`) closed the visualization public-render surface. Decision `#1861`
records that merged head `d3a99d39` was already delivered and the reconnect sent to cmos-dashboard,
forge-demos and aquex-mcp before this build; archived dashboard-demos is excluded.
The Sprint 191 review (`#1880`) certified the carry-forward pay-down and closed the sprint; the residual carries
are `#1881`. PR #94 merged into `OODS-pro` at `5fdf8a18`. Sprint 192 m01 delivers that merged head to the bridge,
sends the prepared reconnect to cmos-dashboard, forge-demos and aquex-mcp, and sends the `#1315` re-pin notices to
aquex-mcp, forge-demos and shopify-forge, which closes `#1315`.
The Sprint 192 review (`#1891`) certified component truth and closed the sprint; the residual carries are `#1892`.
PR #96 merged into `OODS-pro` at `c098237f`. Sprint 193 m01 delivers that merged head to the bridge and sends the
prepared Sprint 193 reconnect to cmos-dashboard, forge-demos and aquex-mcp.


## Increment 8 — Sprint 189: Browser design loop — CERTIFIED AND CLOSED

Sprint 189 is **Completed**, independently certified by review `PS-2026-09-09-002` and decision `#1844`. It was built under decisions #1832–#1834. Mission 1 delivered reviewed `f4cd1ba3` from the primary checkout, rebuilt and restarted PM2, verified its build-stamped revision and sent the prepared reconnect to aquex-mcp and forge-demos. All 17 served-store hashes stayed unchanged.

The build worktree now has a persistent exact-tarball React/Vue preview loop with screenshots, accessibility text, layout measurements and source hashes. Composed list and timeline contexts own their collections and controls. Forms use short labels with help, one owner per field and native Save; detail is read-only with cancellation on demand and populated, uniquely labeled tabs. Summary values, timestamps, archived badges and deterministic billing seeds are reconciled. The public `design.preview` tool uses the same loop and reports OODS-N019 when it is stopped. The served primary bridge still has the delivered Sprint 188 implementation; the Sprint 189 preview tool is proven on the worktree bridge.

The final packet retains the 77-schema census with the 66/66 and 132/132 single-screen population plus Subscription/workflow 2/2. The wider generation result remains 75/77 and 150/154, with the existing User/workflow and Organization/workflow gaps disclosed. Saved-corpus results remain separate: original 15/16, successor 16/16. The final four-suite capture follows #1833; exact counts and all failures/skips belong to its raw receipts and file-attributed accounting.

[The Sprint 189 handoff](../../../artifacts/product-reality/sprint-189/m06/README.md) binds the frozen implementation, execution and evidence commits, the BEFORE/AFTER browser receipts and all seven craft dispositions. The Sprint 190 reconnect is prepared and remains unsent. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled. This build does not certify accessibility, theme maturity or every object/context at runtime.

**Review verdict (`PS-2026-09-09-002`, decision `#1844`):** all 24 receipts and 72 screenshots at 390/820/1440 in both
frameworks were inspected against the seven-item `#1832` mapping. Every Sprint 188 defect is resolved by exact receipt
lines: one bound search, filter, sort and paginator over nine real rows with Active/Archived tabs; a chronological
timeline with formatted timestamps and a formatted billing header; short form labels with help text, one owner per
field, seeded datetime and reason code, one Save; a read-only detail with cancellation on demand, populated unique
tabs, history-bound audit entries and Yes/No summary terms; an unbroken archived badge with `1 record`; identical
StatusTimeline text across HTML, React and Vue; mid-cycle seeds. Zero page or console errors, zero overflow, zero
React/Vue lifecycle text differences. A person can list, search, filter, open, edit, save, cancel and read the
timeline in both frameworks at all three widths, so criterion 8 is certified for the Subscription app. Six residual
craft items found by the screenshot pass (Vue Search label wrap and pagination bullets at 390 px, raw event codes
and a duplicated two-entry history on detail, a wide-badge row wrap at 1440 px, the minor-units help text beside a
major-units amount, the Vue archived badge outside its row card) are ranked in `#1845`; none blocks usability. The
four-suite capture followed `#1833`: the first capture failed on 26 stale schema-shape assertions, one corrective
capture passed with zero failures and zero timeouts. The Package Compatibility CI failure on PR #90 was a
pre-existing workflow gap (the compat runner never built `@oods/component-contracts` before Storybook and had not run
since those imports landed); the review closure commit adds that build step to `scripts/pkg/compat.ts`, mirroring the
a11y-contract job, with public runtime bytes unchanged.

## Increment 9 — Sprint 190: Visualization public render — CERTIFIED AND CLOSED

Sprint 190 is **Completed**, independently certified by review `PS-2026-09-10-001` and decision `#1859`. It was built under decisions #1847–#1858. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled. The measured [visualization registry](../../../packages/viz-core/src/registry/viz-recipes.v1.json) reports 13/13 public SVG in light/dark × A/B; 5 certified / 8 uncertified; area placed on Subscription/detail. Dashboard HTML draws 11/11 admitted types; chord and flow_map remain excluded under #881. The public-tool census, two-run 52-SVG matrix, component and saved-store census, packed application flows and light/dark browser receipts are retained in the [m06 packet](../../../artifacts/product-reality/sprint-190/m06/README.md). The [handoff](../../../artifacts/product-reality/sprint-190/m06/closeout/review-handoff.json) binds the frozen implementation `502e9bf7`, execution `81fb1a96` and evidence `b5b80d9d` commits; PR #92 merged into `OODS-pro` at `d3a99d39`.

The default uses CSS light/A. The flat token export remains byte-identical; m03 contains the one-time golden migration and every flat-versus-light/A token difference (#1850). HC token scopes remain exported while HC pixels are deferred (#1851). Certification grades the requested scope and retains failures: the existing light categorical palettes on dark canvases can fail contrast. Heatmap and geo exemptions make no categorical canvas-ratio claim. Eight ECharts-primary types retain `conformant:null`.

Subscription/detail includes a static sample-payment SVG above the timeline in HTML, React and Vue; workflow records each receive a seeded SVG. Editing the form does not regenerate the chart. This placement changes only Subscription/detail in the 66-schema population. The wider 77-schema population retains the Organization/User workflow OODS-N016 gaps. Generation coverage does not imply full runtime coverage for every context.

Mission 1 delivered the reviewed Sprint 189 head and its authorized reconnects. Decision `#1861` records later delivery of the merged Sprint 190 head `d3a99d39` and the sent reconnects to cmos-dashboard, forge-demos and aquex-mcp; archived dashboard-demos is excluded. Sprint 191 was certified by `#1880` and merged at `5fdf8a18`; the Sprint 192 reconnect and re-pin notice plans remain prepared-unsent until Sprint 192 m01 sends them.

**Review verdict (`PS-2026-09-10-001`, decision `#1859`):** the registry-equals-census contract test and the Sprint 190
prose tests were re-run at the frozen head (12/12), and the independent closeout auditor was re-run from a fresh
invocation: 37/37 criteria, 13 executions, 296 frozen paths. The retained scope observations hold 52/52
`svgHash == renderHash` identities across 13 types × light/dark × A/B, every one repeated byte-stable; dashboard HTML
draws 11/11 admitted types with chord and flow_map excluded under #881 and answered in the registry notes. The light
React 1440 and dark Vue 390 screenshots show the payment area chart as a named figure above Status Timeline with the
dark scope applied to the chart pixels and no overflow. The corrective four-suite capture is zero failures (viz-core
1397, viz-render 69, mcp-server 6091, root 6265) with the same 16 skip identities as Sprint 189; PR CI, pkg-compat and
Token Governance all succeeded. The program exit gate, 13/13 current recipes rendering visible public output with
truthful cells, is met, so the visualization public-render surface is closed. The truthful residue is ranked in `#1860`
and none of it blocks closure: 14 dark-scope contrast failures (line, scatter, treemap, sunburst, sankey, chord,
force_graph × A/B) because the light categorical palette is drawn on the dark canvas, so certified line and scatter
report `conformant:false` for dark; HC pixels deferred (#1851); the generated app shell stays light under
`theme:'dark'` while chart pixels follow the scope; the constant seeded payments draw the area chart as a flat block
under a duplicated title; eight ECharts-primary types remain uncertified with `conformant:null`.


## Increment 10 — Sprint 191: Carry-forward pay-down — CERTIFIED AND CLOSED

Sprint 191 is **Completed**, independently certified by review `PS-2026-09-10-008` and decision `#1880`. Build base
`d3a99d39`; authority `#1862`; built under decisions #1863–#1879. The
[handoff](../../../artifacts/product-reality/sprint-191/m05/closeout/review-handoff.json) binds the frozen
implementation `be5d2b30`, execution `e8027e64` and review-input `dc0f4789` commits; PR #94 merged into `OODS-pro` at
`5fdf8a18`. Historical builder receipts retain `builderSelfCertified:false` and `separateReviewRequired:true`; they
are not relabeled.

The nine categorical chart types report `contrastPassed: [light, dark]` across brands A/B; the four
exempt types retain `[]`. Role-C canvas contrast passes while Role-A cautions remain visible. HC pixels
are deferred and eight ECharts types remain uncertified. The generated shell carries theme and brand.
Derek accepted exactly three changed light workflow shell files per framework on 2026-09-10; m01's
README attributes the exception and preserves the before/after hashes.

Organization and User join Subscription for **6/6** packed workflow cells. The fresh population is
**77/77 schemas and 154/154 cells**, including **66/66 and 132/132** single-screen generation.
The original saved store remains **15/16**, the authentic successor **16/16**, and all **17** live store
hashes remain unchanged. Generation counts do not assert full runtime coverage for every schema.

Craft repairs cover search and pagination parity, human-readable history, genuine audit ownership,
archive badge containment, billing alignment, amount units and recorded-payment charts. Payment SVGs
represent recorded samples and do not regenerate on form edits. The m01 dark and m03 BEFORE/AFTER
receipts remain historical; m05 re-verifies the current implementation and retains the complete hashes.

Maintenance `#1318`–`#1322` is complete. `#1315` bundle re-pin delivery remains pending. Reconnect
notices for cmos-dashboard, forge-demos and aquex-mcp, plus re-pin notices for aquex-mcp, forge-demos
and shopify-forge, remain **prepared-unsent** for Sprint 192. Final proof includes one four-suite
capture under `#1833`, the 52-cell matrix rendered twice, registry-derived censuses, the reproducible
portable bundle, Git-derived advertised movers and the independent output audit.

**Review verdict (`PS-2026-09-10-008`, decision `#1880`):** the six categorical slots were recomputed from the built
`tokens.css` (oklch → sRGB → WCAG) for A/B × light/dark: 24/24 cells at or above 3:1 (minima 3.00 A/light slot 04,
3.03 B/light slot 04, 3.16 B/dark slot 02), paints identical to the builder's token proof; the retained contrast table
holds 52 scope observations, 36 pass / 16 exempt / 0 fail, and the 52-cell matrix plus four dashboards are byte-stable
across two renders. The independent auditor was re-run from a fresh invocation, 33/33 criteria, 8 executions, 864
frozen paths; the s190/s191 closeout, theme and collections specs (22/22) and the root prose and runtime-boundary
tests (18/18) pass at the head. The census is 77/77 and 154/154 with exactly Organization/workflow and User/workflow
changing status, 34 attributed and 0 unattributed artifact changes; the packed apps pass 6 cells and 48 gates. The
dark Vue 390 detail and dark React 1440 list screenshots show the shell, chrome and chart on the dark/B canvas; the
AFTER Vue 390 list, Vue 1440 detail, Vue 390 archived and Organization React 390 form screenshots show the search
label unwrapped, no pagination bullets, humanized history with one timeline, a four-point payment series under one
title, the archived badge inside its card and a seeded address entry. The corrective four-suite capture is zero
failures (viz-core 1397, viz-render 69, mcp-server 6110, root 6301, the same 16 skip identities) and the merge-head
CI run is green. Maintenance `#1318`–`#1322` close on their receipts, so the carry-forward pay-down is complete and
Sprint 191 is closed. The truthful residue is ranked in `#1881` and none of it blocks closure: HC pixels deferred
(#1851); eight ECharts-primary types uncertified; the Role-A pairwise minimum just under the clean target; two recipe
surfaces (CancellationSummary and the Billing tab panel) unthemed against the canvas; the standalone list context
truncating its Sort select at 390 and carrying no rows; raw lifecycle words on timeline entries and sample payment
amounts unrelated to the record price; Organization and User workflows generated and gate-green but below
Subscription's craft bar.

## Increment 11 — Sprint 192: Component truth — CERTIFIED AND CLOSED

Sprint 192 is **Completed**, independently certified by review `PS-2026-09-10-013` and decision `#1891`. Build base
`5fdf8a18`; authority `#1882` and baseline correction `#1884`; built under decisions #1883–#1890. The
[handoff](../../../artifacts/product-reality/sprint-192/m07/closeout/review-handoff.json) binds the corrected
implementation `c2f9c338`, execution `fb56910b` and review-input `b078ac6e` commits; PR #96 merged into `OODS-pro` at
`c098237f`. Historical builder receipts retain `builderSelfCertified:false` and `separateReviewRequired:true`; they
are not relabeled.

Seven serial missions deliver the reviewed Sprint 191
head and its six notices, put the four component packages in CI and a fifth capture suite, measure
accessibility/interaction and six theme scopes, implement AuditSummaryCard, SortIndicator and
TimelineEntryLabel, and regenerate the catalog from evidence. Current coverage is 75 React/Vue
implementations and 109 HTML mappings; the other 34 implementations remain obligations. The
proposal is 24 native / 84 recipe / 1 alias with all 109 classifications awaiting Derek and
`approvedRuntimeCensus:null`. The historical foundation-v1 authority remains separate.

The base diagnostic retains 191 / 45 / 57 / 89, seven missing system names, six unguarded names,
and 61 reachable system-colour names under the real per-scope resolver. The repaired token contract
has zero unresolved colour roles and zero reachable system-colour fallbacks outside forced-colors.
The final packet is [Sprint 192 m07](../../../artifacts/product-reality/sprint-192/m07/README.md).
Fresh generation (77 schemas / 154 cells), packed runtime observations and independent certification
remain distinct claims. Derek's classification decision remains open and `approvedRuntimeCensus` stays null; the
Sprint 193 reconnect is prepared unsent until Sprint 193 m01 delivers `c098237f`.

**Review verdict (`PS-2026-09-10-013`, decision `#1891`):** re-measured at the merged head, the served `2026-09-10`
export and the built `catalog_list` carry zero `unverified` cells (174 verified / 218 unavailable / 51 not-applicable)
and zero HTML fallbacks; the retained verifier, re-run with the corrected implementation head pinned and writes
disabled, proves built catalog = export = ledger for 109/109 rows, 75 passed axe scenarios and 450 passed theme
root-cells per framework with matching screenshot hashes; the token resolver re-run live reports zero unresolved colour
roles and zero reachable system-colour fallbacks in all six scopes with all six formerly unguarded names defined; the
composition census re-run live is 77/77 and 154/154 with 14 attributed movements and 17 unchanged live-store hashes;
the v2 proposal holds 109 rows (24 native / 84 recipe / 1 alias) with `approvedRuntimeCensus` null; `ci.yml` runs the
four package suites and both six-cell visual harnesses; suite accounting passed with zero unattributed deltas; all
five capture receipts exit zero (1397 / 69 / 6134 / 6322 / 1099 passed, 0 failed, the same 16 skips); the independent
audit passed at `fb56910b`; the `#1890` derivation exception is hash-bound and only its three scripts changed after
the execution head outside evidence paths; remote CI is green at the execution head, the final head and the merge
commit. Every `#1882` exit criterion is met, so component truth is certified and Sprint 192 is closed. The truthful
residue is ranked in `#1892` and none of it blocks closure: 34 rows unimplemented in React/Vue (Sprint 193); Derek's
classification decision; runtime at scale (154 cells at one head, Invoice and Plan without a packed cell); the optional
ECharts render soak red on the unchanged base control (learning #561); Auditable/Sortable placements proven on bounded
real-trait fixtures; interaction claims for 51 static roots resting on declared reasons; the `#1881` visualization
residue (Sprint 194); delivery of `c098237f` and the prepared reconnect by Sprint 193 m01; hand-written
`docs/components` and Tool-Specs counts (Increment 14).

## Increment 12 — Sprint 193: Runtime at scale — CERTIFIED AND CLOSED

Sprint 193 is **Completed**, independently certified by review `PS-2026-09-11-003` and decision `#1914`. Build base
`c098237f`; lock `#1894`; built under decisions #1895–#1913 (the third five-suite capture was permitted by `#1911`, the CI
budget correction by `#1912` and the one coverage-job rerun by `#1913`). The
[handoff](../../../artifacts/product-reality/sprint-193/m07/closeout/review-handoff.json) binds implementation `871e5acf`,
execution `8858a575` and review-input `236b3fe9`; PR #98 merged into `OODS-pro` at `1f69c957`. The review verified the
154-row runtime ledger, the served catalog (109/109 React and Vue) and health projections, the passing suite accounting and
the independent audit directly, and inspected the new Invoice and Plan workflow receipts. Certified: runtime and component
evidence. Not certified: classification (`#1438`, `approvedRuntimeCensus:null`) and application craft; the ranked craft
carries are `#1915`. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled.

Build base: `c098237f`. The generic harness measures all 132single-screen cells and22workflow cells from one package sweep, with strict typechecking, builds, mounted components, accessibility trees, screenshots and declared states. All11workflows include the four observed states for each screen. The final runtime receipt is `artifacts/product-reality/sprint-193/m07/runtime/runtime-cells.v1.json`; the measured head is recorded in that receipt and verified through the product-path diff on later evidence commits.

All34missing roots are implemented on the existing component proof: nine non-viz recipes and25Viz recipes. The composer follows actual trait declarations. Read-only tags, lifecycle events, communication panels and explicit list states account for the30public-schema changes; new visualization authoring placements are bounded real-trait fixtures. Controls emit a validated Cartesian intent fragment, preserving siblings and rejecting invalid edits; previews preserve real renderer SVG. This build makes no craft or classification approval.

The tool census measures27registry entries and serves its source-test tiers through health. Auto tiers are7/11/3/0, not the planning shorthand9/10/2; on-demand tiers are0/1/1/4. The remaining legacy viz.compose reserved-attribute error, inert options, brand behavior and review fixture limitations remain named Sprint 194 candidates, not silently repaired by the census.

The [m07 packet](../../../artifacts/product-reality/sprint-193/m07/README.md) retains the one five-suite campaign, class-enumerated movement, saved-store and visualization censuses, advertised diff from c098237f, prepared unsent reconnect and PR/CI observations. Its closeout producer and independent auditor bind all 36literal criteria. `builderSelfCertified:false`; the sprint stays Active until separate independent review. The phase sequence remains Increment 13/Sprint 194 tools truthful, Increment 14/Sprint 195 visualization breadth, Increment 15/Sprint 196 integrated release proof (`#1893`).

## Increment 13 — Sprint 194: Tools truthful — CERTIFIED AND CLOSED

Sprint 194 is **Completed**, independently certified by review `PS-2026-09-11-006` and decision `#1934`. Build base
`1f69c957`; lock `#1916`; built under decisions #1917–#1933 (the corrective five-suite capture by `#1932`, the per-run CI
attribution by `#1933`). The [handoff](../../../artifacts/product-reality/sprint-194/m07/closeout/review-handoff.json)
binds implementation `71538162`, execution `ceecd21f` and review-input `c9640348`; PR #100 targets `OODS-pro`. The review
measured the ledger and registry files directly (24 rows: 19 advertised product-reality with portable calls, 5 on-demand
contracts, 3 retired), reran the independent auditor and the producer check, confirmed the bridge on `1f69c957` and the
corrected CI run `34630306346` green on every required job, and fixed two docs-only drifts (retired names in the issue
template; the stale delivery row). Certified: tool truthfulness at the MCP boundary and the host-side brand seam. Not
certified: portable brand writes and React/Vue generation from the Gate-1 bundle (five documented limits, `#1927`–`#1929`),
classification (`#1438`), application craft (`#1915`), the optional soak (`#1442`); carries are `#1935`. Historical builder
receipts retain `builderSelfCertified:false`; they are not relabeled.

Build base: `1f69c957`. The live tool roster is19 advertised and5 on-demand; three registrations were retired with decision records. Every advertised tool has a real-handler JSON/AJV boundary proof and a content-pinned extracted-bundle call. The portable E2E makes28 calls over19 tools, with14 passing outcomes and5 documented limits (brand source, token export inputs, preview error transport, and React/Vue readiness inputs for code.generate/pipeline). Host brand source writes, captured builds and chart/app pixels are proven separately. Map claims are narrowed to the external resolver. Input options and error/receipt descriptions match the implemented boundary.

The final packet is `artifacts/product-reality/sprint-194/m07/closeout/review-handoff.json`. Its actual execution heads, fresh154-cell runtime,77-schema/154-cell composition census, unchanged13-recipe registry, saved-store comparisons, per-tool proof and CI receipts are retained for independent review. Component implementation bytes and the109-row component export remain unchanged. Classification approval stays pending; `approvedRuntimeCensus:null`.

At the Sprint 194 build handoff, the sprint remained **Active** and `builderSelfCertified:false`, the bridge served `1f69c957`, and the three Sprint 195 notices were prepared unsent. Review subsequently certified and closed Sprint 194; Sprint 195 m01 delivered `5b25c3c9` and sent those notices. These historical builder receipts are not relabeled.

## Increment 14 — Sprint 195: Visualization breadth and certification — CERTIFIED AND CLOSED

Sprint 195 is **Completed**, independently certified by review `PS-2026-09-12-001` and decision `#1950`. Build base
`5b25c3c9`; lock `#1936`; built under decisions #1937–#1949 (the two-capture sequence by `#1948`, the notice amendment by
`#1949`). The [handoff](../../../artifacts/product-reality/sprint-195/m07/closeout/handoff.md) binds implementation
`39deb793`, tool census `a0c10f8b`, execution `6e779776` and review `ca3444ac`; PR #101 merged into `OODS-pro` at
`5e08a9a2`. The review measured the registries directly (34/34 taxonomy, 21 pattern rows with recomputed sha pins, 13 types
certified on the operand path with 56 of 60 scopes conformant), reran every s195 generator with `--check` and the seven
registry and gate contract specs (126/126), summed the raw capture JSON (16,383 / 0 / 32), reran the producer check (28/28)
and the independent auditor (28 criteria, 15 executions, 1,664 frozen paths), and confirmed the bridge on `5b25c3c9`, the
three sent Sprint 194 notices and CI run `34666835243` green on every required job. Certified: the taxonomy and Core
Analytics Profile, the pattern identities, the operand certification profile, the palette revision, `hc` admission, the
general placement rule with bar and line placed, the five bites. Not certified: application craft (`#1915`), classification
(`#1438`), release proof (Increment 15). Two review findings are carries in `#1951`: temporal SVG hashes are
host-timezone-bound (line, area and running-total-area reproduce only under America/Chicago), and the closeout mover
derivation depends on `core.quotepath`. The GitHub merge of `OODS-pro` into the sprint branch (`17cff257`) duplicated
twelve stale lines of this file through a criss-cross merge; the closure commit restores the reviewed text. Historical
builder receipts retain `builderSelfCertified:false`; they are not relabeled.

Built under the [locked decision memo](../../planning/forge-s195-visualization-breadth-decision-memo.md) in session `PS-2026-09-11-008`. The [m07 handoff](../../../artifacts/product-reality/sprint-195/m07/closeout/handoff.md) binds the actual implementation, execution and evidence heads, the five-suite accounting, all 28 literal mission criteria and observed CI. Sprint 195 was built with `builderSelfCertified:false`; the independent review above closed it.

The taxonomy classifies 34 identities across eight families. Its 20 core cells contain 13 surface-complete cells and seven typed gaps, including financial and scientific cells. Eight of 21 patterns have public pixels in all four light/dark brand scopes; thirteen preserve explicit authoring-only reasons. Operand certification grades the ECharts a11y, contrast, determinism and accuracy pillars; spec-only calls remain uncertified with `conformant:null`. Measured bubble-map failures remain failures.

The canonical categorical hue revision reaches Role-A minima 10.0176 light and 10.2364 dark with all 24 Role-C checks passing. HC preserves declared scope paints and CSS system colors: bar, line, area and scatter render; the other nine types retain measured typed failures. Forced-colors browser evidence is separate from numerical contrast, which is explicitly exempt on HC. The [m05 golden receipt](../../../artifacts/product-reality/sprint-195/m05/integration-results.json) retains the original migration qualification head and before/after evidence.

Invoice now places a bar chart from line-item amounts in minor units, and Usage places a line chart from explicitly labeled synthetic API-call samples. The 77-schema comparison records four additions and 73 unchanged schemas, preserving record headers. The same runtime sweep proves 154 standard cells, four dashboard cells and 48 placement theme checks. ECharts object placement carries under #1944 pending an authored mark/preview and a domain-data contract; full detail HTML still reports the existing Tabs normalization limit. The three visualization mutations fail then pass after exact restoration. The soak investigation retains its strict statistical failure as a bounded observation under #1946; it does not certify retention.

At the Sprint 195 closeout, notices for cmos-dashboard, forge-demos and aquex-mcp were prepared and unsent. Sprint 196 m01 subsequently sent those exact three notices and delivered the certified closure. Classification approval and application craft remain open; the later portable and release proof is recorded in Increment 15 below.

## Increment 15 — Sprint 196: Release proof — CERTIFIED AND CLOSED

The [locked decision memo](../../planning/forge-s196-release-proof-decision-memo.md) and serial CMOS missions govern this build. The [m07 measurement packet](../../../artifacts/product-reality/sprint-196/m07/README.md) records frozen implementation `794084bf34dabab4d8218ccb2a32e2ec81f10d51`. The later ledger-carry/capture/archive commit and review-evidence commits keep their own identities under decision `#1975`; measurements are never relabeled. `builderSelfCertified:false`.

Mission 1 delivered primary `91c1f5f2`, tree-identical to certified `1d100e20`, preserved all17 saved-store hashes and sent the three authorized notices. The portable artifact now carries13 runtime packages including the bridge, both tool-policy layers' required payload, stamped revision and the hash-bound readiness attestation. React/Vue generation, pipeline and `tokens.build` execute from the extracted bundle. Portable outcomes are17 executed tools and2 typed limits: `brand.apply` OODS-N020 and `design.preview` OODS-N019; the adapter preserves structured native errors.

The frozen host sweep passes154 canonical cells,4 separate dashboard cells and48 chart-theme scopes. The extracted measurement artifact passes42 reference-app cells (Organization, Subscription and User; seven contexts; React and Vue), with raw same-request artifact equality against the host. Canonical runtime and release ledgers carry these original observations. The final proof-carry archive serves the measurement archive's release identity; it does not claim to contain its own archive hash.

Generated component documentation covers109 roots plus the index, with31 legacy guides retained in history. Tool-Specs and the public numeric/roster claims use scripted checks. The doc, bundle and timezone mutation receipts preserve every failure and byte-identical restoration. UTC temporal rendering replaces the Chicago-only reproduction limit while retaining the exact golden migration heads and before/after evidence. The fresh census retains77 unchanged composed schemas,154 generation cells,78 visualization scopes,84 pattern cells and34 classified identities. Historical component theme/accessibility proof is retained against211 unchanged source inputs.

The [Gate-2 decision packet](../../planning/forge-gate2-decision-packet.md) presents all seven decisions with measured facts, options and consequences. Root `private:true` is the separately authorized hygiene change (`#1952`); the publication/installer decisions remain proposed. Active constraint7 remains unchanged; archived constraint5 is historical. Nothing is published, tagged or registered by this build.

The closeout adds the one five-suite campaign under `#1833`, exact delta/skip accounting, fresh per-job CI attribution, advertised diff from `1d100e20`, prepared-unsent candidate reconnect and the independent-review handoff. Full execution results belong to those retained closeout records; this roadmap does not substitute for their gates. Classification approval, application craft and the recorded visualization/soak limits remain separate obligations.

Sprint 196 is **Completed**, independently certified by review `PS-2026-09-12-005` and decision `#1977`. The review read the tool (24 entries; 19 advertised at product-reality; portable 17 executed + 2 typed), runtime (154/154 at `794084bf`) and release (42/42, all 42 host-equal) ledgers directly; verified both archive digests on disk (measurement `4dba1e35…`, final `4eaf7186…`, 32,480,913 bytes each); reran the closeout producer, its `--check` and the independent auditor under default git config at execution `63efd098` / review `0c98d6e8` (exit 0; 26 literal criteria, 13 executions, 1613 frozen paths; outputs byte-identical to the committed claim ledger, review handoff and suite accounting); ran `docs:check` over the six generated surfaces, a live hand edit of the component index (red, then restored green) and the live cross-timezone probe (16/16 temporal cells byte-identical under UTC and America/Chicago and equal to the registry); ran the release-readiness facts check; and confirmed PR #103 merged into `OODS-pro` at `114a268e` tree-identical to `f703ceda` with CI run `34687617274` green. Release proof is certified; application craft (`#1915`), classification (`#1438`) and the Gate-2 items remain separate obligations; the residual carries are `#1978`. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled.
