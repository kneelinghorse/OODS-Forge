# Sprint 193 build handoff

Sprint 193 is locked and ready. CMOS has seven serial missions: `s193-m01` is Current, `s193-m02`–`s193-m07` are Queued with a Requires chain. No mission has started. Direction: Derek, 2026-09-11, after the Sprint 192 review ("keep driving until we have the actual tools and capabilities we've been saying we have"). Lock: planning session `PS-2026-09-11-001`; phase map decision `#1893`.

**Build directory:** `/Users/systemsystems/.codex/worktrees/s193/OODS-Forge`

**Branch:** `codex/sprint-193-runtime-at-scale` from `c098237f` (`OODS-pro`, the Sprint 192 merge of PR #96)

**Canonical CMOS projectRoot:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`

The primary checkout is the served bridge checkout (PM2 `/health.revision` = `5fdf8a18`, the Sprint 191 head) and the CMOS database location. **Only `s193-m01` touches it**, to deliver the reviewed Sprint 192 head and send the three prepared notices; every other mission stays in the worktree.

## Prompt for the fresh build session

```text
Build the locked Sprint 193 plan in /Users/systemsystems/.codex/worktrees/s193/OODS-Forge,
branch codex/sprint-193-runtime-at-scale. Read agents.md, the locked
cmos/planning/forge-s193-runtime-at-scale-decision-memo.md and the phase map
cmos/planning/forge-remaining-work-phase-map-2026-09.md, then execute the seven CMOS
missions serially from s193-m01 through s193-m07. Always pass
projectRoot="/Users/systemsystems/portfolio/Design-Tools/OODS-Forge" to CMOS tools.

Open with cmos_review, cmos_sprint(action="show", sprintId="sprint-193") and
cmos_decisions(action="list", sprintId="sprint-193"). Confirm the prepared branch and clean
worktree (if origin/OODS-pro has moved because PR #97 merged, merge it into the branch first and
record the head; it moves no runtime bytes), start a build-tracking session, then start s193-m01.
Do not re-plan the accepted slate. Never print process environment values or .env contents. Never
send a CMOS message except the three prepared notices that s193-m01 sends exactly as prepared.

s193-m01 delivery: from the PRIMARY checkout fast-forward to origin/OODS-pro, frozen install,
build:tokens, build:packages, bridge build, pkg:build, pm2 restart oods-forge-bridge + save; prove
/health.revision, 21 tools, 17 store hashes, the structured-data manifest hash before/after,
catalog_list serving zero 'unverified' cells and the three new rows, a dark viz_render hash and a
dark code_generate shell through the bridge; then send the prepared reconnect (cmos-dashboard,
forge-demos, aquex-mcp) from artifacts/product-reality/sprint-192/m07/reconnect-plan.json
byte-identical, record the message ids, complete next-step #1439. Receipts under
artifacts/product-reality/sprint-193/m01/.

s193-m02 single-screen runtime harness: scripts/product-reality/s193-runtime-cells.ts composes and
generates every one of the 66 single-screen schemas in React and Vue, packs tarballs once per sweep,
installs each cell in a clean consumer under the Sprint 185 isolation gates, mounts it in the pinned
Linux Playwright browser and records gates (install/build, mount without console errors, a11y tree,
390/1440 screenshots, the context's declared states); runtime-cells.v1.json with exactly 132 rows
pass|typed-gap (OODS-N015 rows named) and zero fail; a CI job; a contract spec pinning 132 rows and
rejecting fail or historical unions; bite = one removed emitted screen component goes red.

s193-m03 workflow harness: the Subscription/Organization/User harness parameterised for all 11
workflows × React/Vue = 22 cells with four states per screen; Invoice and Plan get their first
packed cell; the ledger reaches 154 rows at one head; health serves productReality.runtime
{cells, pass, typedGap, fail, head} pinned by a contract spec; one design-loop receipt per newly
running workflow (390/1440 × both frameworks); no craft claim by the builder.

s193-m04 the nine non-viz rows (ArchiveEvent, CancellationEvent, StateTransitionEvent,
ColorStatePicker, StatusColorLegend, CommunicationDetailPanel, GeoFieldMappingForm,
GeoResolutionBadge, GeocodablePreview): implemented as their proposed class in React and Vue on the
Sprint 192 loops (contract v1.1, executable scenario, axe, interaction, six theme cells, readiness
84/84); placement by declared trait or on a bounded real-trait fixture, said so; census movement by
class; a fresh reachability census emits N015 for exactly the 25 Viz* rows.

s193-m05 the 25 Viz* rows: previews (Heatmap/Line/Mark/Point/Scatter) on the VizAreaPreview
mechanism with svgHash equal to viz_render's; controls and legends as form recipes over
Input/Select/Checkbox/ColorSwatch whose value is the viz_render intent fragment, emitting a typed
change event; summaries/badges read-only; same loops; React/Vue 109/109 or a typed gap per unreached
row (floor: 5 previews + 12 controls).

s193-m06 tool-truth census (measure only): scripts/product-reality/s193-tool-truth.mjs derives
packages/mcp-server/registry/tool-capability-ledger.v1.json over the 27 registry entries (claim hash,
proof tier measured from test imports, receipt refs, portable-E2E flag, structured caveats with
file:line); health serves productReality.tools; a contract spec pins the tier counts and
byte-reproducibility; docs-only fixes to how-forge-works.html (the three stale chart/certification
sentences) and Tool-Specs.md dead links with a link-check spec; Sprint 194 candidates per tool
listed in the README as proposed. No tool behaviour, schema or description changes.

s193-m07 proof and handoff: ledgers regenerated (component 109, runtime 154, tool 27), export
refreshed with a date tag, censuses (composition 77/77 + 154/154 with class-enumerated movement,
saved stores, viz registry 13/13 unchanged), one FIVE-suite capture under #1833, advertised diff
from c098237f, reconnect prepared naming the health additions and new rows, near.md Increment 12 at
BUILT, REVIEW PENDING with the measured-state table from the ledgers and the phase-map sequence
(194 tools truthful, 195 viz breadth, 196 release proof), a PR to OODS-pro with CI observed, and the
review handoff with builderSelfCertified:false. Verifiers pin the recorded implementation head and
compare the product-path diff, never git rev-parse HEAD equality (learning #565).

Every golden that moves is replaced in the mission that moves it, with the reason, before any
capture. Never widen a claim: approvedRuntimeCensus stays null, unreached rows are typed gaps with
blockers, historical receipts are never unioned. Never hand-edit a composed or saved schema. Ship
first, verify with the suites the change touches, one full capture at close. Record tests, failures,
decisions, actual counts and commit identities in CMOS. Stop with a complete independent-review
handoff; leave Sprint 193 Active and builderSelfCertified:false.
```

`build-tracking session` means `cmos_session(action="start", type="custom", title="Sprint 193 Build", sprintId="sprint-193", projectRoot=...)`. Use the mission lifecycle tool to start and complete each mission after inspecting its criteria.

## Prepared and checked

- Worktree created from `origin/OODS-pro` at `c098237f`; `pnpm install --frozen-lockfile`, `pnpm run build:tokens` and `pnpm run build:packages` succeeded (exit 0); `git status --porcelain` empty before the planning commit. The primary `.env` is reachable through the ignored `.env` symlink; the canonical CMOS database stays in the primary checkout.
- Node `v24.6.0`, pnpm `9.12.2`. Build order that works: `build:tokens`, then `build:packages`, then `@oods/mcp-bridge` and `pkg:build` when a bridge is needed. `@oods/viz-render test` rebuilds its own dist (learning #546): never in parallel with suites that consume it. Packed browser cells and native select keyboard proofs need the pinned Linux Playwright image (learnings #548, #557).
- Where the measured facts live: memo section 2. Key ones: `packages/component-contracts/registry/component-capability-ledger.v1.json` (the 34 unavailable rows and their reasons), `artifacts/product-reality/sprint-192/m07/component-census/` (the 77 compositions and 154 generation cells), `sprint-192/m07/flows.json` and `packed-report.json` (the 28 packed cells), `scripts/product-reality/s188-m03-app-consumers.ts` (the workflow harness to generalise), `packages/mcp-server/src/tools/registry.json` and `packages/mcp-adapter/tool-descriptions.json` (the 27 entries and their advertised claims), `scripts/runtime/e2e.mjs` (the four tools the portable E2E calls), `docs/how-forge-works.html:321,335,374` and `docs/mcp/Tool-Specs.md:1192-1211` (the stale narrative).
- Closeout tooling to reuse with bounded s193 modes: `s185-reachability.mjs`, `s188-m03-app-consumers.ts`, `s190-viz-census.ts`, `s185-sprint-wide-movers.mjs`, `s185-closeout.mjs`, `s185-audit-closeout.mjs`, `s185-reconnect.mjs`, the design loop (`scripts/design-loop`).
- Settled decisions the builder does not reopen are memo section 4; the descope ladder and never-cut list are section 6. Mission order (deliver → single-screen harness → workflow harness → nine rows → 25 rows → tool census → closeout) is deliberate: the harness exists before the rows that must run in it, the rows are born measured, and the tool ledger is derived once at the end of the implementation.
