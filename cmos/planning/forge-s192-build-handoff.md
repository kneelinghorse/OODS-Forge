# Sprint 192 build handoff

Sprint 192 is locked and ready. CMOS has seven serial missions: `s192-m01` is Current, `s192-m02`–`s192-m07` are Queued with a Requires chain. No mission has started. Direction: Derek, 2026-09-10, after the Sprint 191 review ("revisit the roadmap, keep reducing overall debt including components and capabilities, build for quality and scalability"). Lock: planning session `PS-2026-09-10-009`.

**Build directory:** `/Users/systemsystems/.codex/worktrees/s192/OODS-Forge`

**Branch:** `codex/sprint-192-component-truth` from `5fdf8a18` (`OODS-pro`, the Sprint 191 merge of PR #94)

**Canonical CMOS projectRoot:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`

The primary checkout is the served bridge checkout (PM2 `/health.revision` = `d3a99d39`, the Sprint 190 head) and the CMOS database location. **Only `s192-m01` touches it**, to deliver the reviewed Sprint 191 head and send the six prepared messages; every other mission stays in the worktree.

## Prompt for the fresh build session

```text
Build the locked Sprint 192 plan in /Users/systemsystems/.codex/worktrees/s192/OODS-Forge,
branch codex/sprint-192-component-truth. Read agents.md and the locked
cmos/planning/forge-s192-component-truth-decision-memo.md, then execute the seven CMOS
missions serially from s192-m01 through s192-m07. Always pass
projectRoot="/Users/systemsystems/portfolio/Design-Tools/OODS-Forge" to CMOS tools.

Open with cmos_review, cmos_sprint(action="show", sprintId="sprint-192") and
cmos_decisions(action="list", sprintId="sprint-192"). Confirm the prepared branch and
clean worktree (if origin/OODS-pro has moved because PR #95 merged, merge it into the
branch first and record the head; it moves no runtime bytes), start a build-tracking
session, then start s192-m01. Do not re-plan the accepted slate. Never print process
environment values or .env contents. Never send a CMOS message except the six prepared
messages that s192-m01 sends exactly as prepared.

s192-m01 delivery: from the PRIMARY checkout fast-forward to origin/OODS-pro, frozen install,
build:tokens, build:packages, bridge build, pkg:build, pm2 restart oods-forge-bridge + save;
prove /health.revision, 21 tools, 17 store hashes, viz_render dark hashes and a dark
code_generate through the bridge; then send the prepared reconnect (cmos-dashboard,
forge-demos, aquex-mcp) and the #1315 re-pin notices (aquex-mcp, forge-demos, shopify-forge)
from artifacts/product-reality/sprint-191/m05/reconnect-plan.json and re-pin-notice-plan.json,
record the message ids, complete next-step #1315. Receipts in the sprint worktree under
artifacts/product-reality/sprint-192/m01/.

s192-m02 proof in the gate + token resolution: the four component package suites
(component-contracts, component-styles, components-react, components-vue) run in CI and as a
fifth capture suite "component-packages" in capture-s185-m01-baseline.mjs (root-core's project
set unchanged); a11y-contract also runs both packages' test:visual and the styles browser
spec. Token-resolution census + contract test over every var(--x) in the component CSS
against cssVariablesByScope for all six scopes: unresolved colour roles 0, reachable
system-colour fallbacks outside forced-colors 0, --sys-focus-ring defined; the seven drifted
--sys-* names re-pointed; the --cmp-* names authored as semantic aliases in
packages/tokens/src/tokens/component/*.json (no per-scope emission change); bite = delete one
cmp declaration; dark design-loop receipts show Card backgrounds equal to the scope token.

s192-m03 accessibility + interaction 72/72 in both frameworks: contract v1.1 role/name/keyboard
for all 72; scenario events as lists with keyboard/pointer triggers, static roots
interaction:'none' with a reason; React axe loop unfiltered (72/72), the same loop in Vue
(72/72); interactions executed from the scenarios; keyboard bite (Tabs ArrowRight) red in both;
readiness documents gain accessibility and interaction classes for 72/72.

s192-m04 theme 72/72 x 6 cells x 2: visual-evidence.mjs canonical ids = NUCLEUS_COMPONENT_IDS,
cells from SUPPORTED_COMPONENT_THEME_CELLS, computed contrast (4.5:1 text, 3:1 UI in
light/dark; hc visible under forced colours) and token-resolution assertions, screenshots
retained, run in the a11y-contract job; readiness gains visualThemes for 72/72.

s192-m05 the last three disputed rows: AuditSummaryCard, SortIndicator, TimelineEntryLabel in
the HTML renderer map (fallback 3 -> 0), React and Vue with contract v1.1, scenario, axe,
interaction and theme cells, readiness 75/75, packed gates for the placed cells, census
movement enumerated by class; the four Invoice OODS-V007 warnings cleared at the composer.

s192-m06 the ledger tells the truth: refresh_structured_data.py projects the new evidence
classes (verified / not-applicable / fail for implemented rows, unavailable with reason for
the rest; no 'unverified' on governed rows); a generated component-capability-ledger.v1.json
replaces the stale baseline as the ./registry/capabilities export (old file retained under a
historical path); the structured-data export refreshed with a date version tag so the built
catalog_list serves it; component-reconciliation.proposed.v2.json for all 109 rows with
evidence refs (PaymentEventTimeline = alias of PaymentTimeline, TimelineEntryLabel = recipe,
approvedRuntimeCensus stays null; the CMOS approval request for Derek is prepared, not sent);
docs/how-forge-works.html + its contract test, docs/mcp/Tool-Specs.md counts and the
catalog.list.spec 'unverified' pin move in this mission.

s192-m07 proof and handoff: component ledger census (75/109 React+Vue, 109/109 HTML,
accessibility/interaction/theme measured 75/75 x 2), fresh composition 77/77 + 154/154 with
class-enumerated movement, saved stores, workflow 6/6, viz registry unchanged, one FIVE-suite
capture under #1833, advertised diff from 5fdf8a18, reconnect prepared naming the catalog_list
surface change, near.md Increment 11 at BUILT, REVIEW PENDING with the measured-state table
updated from the ledger, a PR to OODS-pro with CI observed, and the review handoff with
builderSelfCertified:false.

Every golden that moves is replaced in the mission that moves it, with the reason, before any
capture. Never widen a claim: approvedRuntimeCensus stays null, the 34 unimplemented rows stay
unavailable, the visualization registry is untouched. Never hand-edit a composed or saved
schema; enumerate census movement per schema by class. Ship first, verify with the suites the
change touches, one full capture at close. Record tests, failures, decisions, actual counts and
commit identities in CMOS. Stop with a complete independent-review handoff; leave Sprint 192
Active and builderSelfCertified:false.
```

`build-tracking session` means `cmos_session(action="start", type="custom", title="Sprint 192 Build", sprintId="sprint-192", projectRoot=...)`. Use the mission lifecycle tool to start and complete each mission after inspecting its criteria.

## Prepared and checked

- Worktree created from `origin/OODS-pro` at `5fdf8a18`; `pnpm install --frozen-lockfile`, `pnpm run build:tokens` and `pnpm run build:packages` succeeded (exit 0); `git status --porcelain` empty before the planning commit. The primary `.env` is reachable through the ignored `.env` symlink; the canonical CMOS database stays in the primary checkout.
- Node `v24.6.0`, pnpm `9.12.2`. Build order that works: `build:tokens`, then `build:packages` (topological), then `@oods/mcp-bridge` and `pkg:build` when a bridge is needed. `@oods/viz-render test` rebuilds its own dist (learning #546): never run it in parallel with suites that consume that dist. Native select keyboard proofs need the pinned Linux Playwright image (learning #548, re-confirmed #557).
- Where the measured facts live: the memo's section 2 table names every file and line. Key ones: `packages/component-contracts/src/types.ts:12-85` (the 72 ids), `src/contracts.ts` (72 prose accessibility arrays), `src/scenarios.ts` (72 scenarios, 16 with events), `packages/components-react/test/accessibility.spec.tsx:30-46` (the per-scenario axe loop to unfilter and port), `packages/components-{react,vue}/test/visual-evidence.mjs:12-15` (the 14 canonical ids to widen), `packages/component-styles/src/components.css:158-164` (Card), `:1165` (focus ring), `vitest.config.ts:78-131` (root projects), `.github/workflows/ci.yml:441-539` (a11y-contract), `scripts/product-reality/capture-s185-m01-baseline.mjs:64-89` (suites), `cmos/scripts/refresh_structured_data.py:833-987` (ledger projection), `scripts/refresh-data.mjs` (`--version-tag`), `scripts/runtime/assemble.mjs:544` (export filename regex), `packages/mcp-server/test/contracts/catalog.list.spec.ts:130-133` (the `unverified` pin), `artifacts/product-reality/sprint-187/m05/eleven-row-census-disposition.md` (the disputed rows).
- The token-resolution census used during planning is the reference for m02's numbers: 174 referenced, 42 token-defined, 52 local, 80 unresolved, 26 system-colour fallbacks, 7 drifted `--sys-*` names, 1 reference with no fallback (`--sys-focus-ring`). The mission's script must reproduce these at the base before it changes anything.
- Closeout tooling to reuse with bounded s192 modes: `s185-reachability.mjs`, `s188-m03-app-consumers.ts`, `s190-viz-census.ts`, `s185-sprint-wide-movers.mjs`, `s185-closeout.mjs`, `s185-audit-closeout.mjs` (`--execution-head`/`--review-head`; default output under `artifacts/product-reality/sprint-185/m05/closeout-independent-audit/`), `s185-reconnect.mjs`, the design loop (`scripts/design-loop`, theme/brand since Sprint 191).
- Settled decisions the builder does not reopen are memo section 5; the descope ladder and never-cut list are section 8. Mission order (deliver → gate and tokens → a11y/interaction → theme → three rows → ledger → closeout) is deliberate: the gate exists before the evidence that must run in it, the rows are born measured, and the ledger is regenerated once.
