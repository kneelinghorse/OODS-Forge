# Sprint 190 build handoff

Sprint 190 is locked and ready. CMOS has six serial missions: `s190-m01` is Current, `s190-m02`–`s190-m06` are Queued with a Requires chain. No mission has started. Direction: Derek, 2026-09-09, after the Sprint 189 review (visualization public-render closure, #1372, the program's "Current visualization closure" increment). Lock: planning session `PS-2026-09-09-003`.

**Build directory:** `/Users/systemsystems/.codex/worktrees/s190/OODS-Forge`

**Branch:** `codex/sprint-190-viz-public-render` from `c3a68d5f` (`OODS-pro` `513dcbba` after PR #90, plus the Sprint 189 review-closure commit that is PR #91)

**Canonical CMOS projectRoot:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`

The primary checkout is clean at `f4cd1ba3` on `Forge-expansion`, the served bridge checkout and the CMOS database location. **Only `s190-m01` touches it** (fast-forward to `origin/OODS-pro`, rebuild, PM2 restart, reconnect send); every other mission works in the build directory.

## Prompt for the fresh build session

```text
Build the locked Sprint 190 plan in /Users/systemsystems/.codex/worktrees/s190/OODS-Forge,
branch codex/sprint-190-viz-public-render. Read agents.md and the locked
cmos/planning/forge-s190-viz-public-render-decision-memo.md, then execute the six CMOS
missions serially from s190-m01 through s190-m06. Always pass
projectRoot="/Users/systemsystems/portfolio/Design-Tools/OODS-Forge" to CMOS tools.

Open with cmos_review, cmos_sprint(action="show", sprintId="sprint-190") and
cmos_decisions(action="list", sprintId="sprint-190"). Confirm the prepared branch and
clean worktree, start a build-tracking session, then start s190-m01. Do not re-plan the
accepted slate.

s190-m01 is delivery: it runs against the PRIMARY checkout
/Users/systemsystems/portfolio/Design-Tools/OODS-Forge (git merge --ff-only origin/OODS-pro,
rebuild in the order the mission lists including @oods/tokens, @oods/viz-core and
@oods/viz-render, pm2 restart oods-forge-bridge, pm2 save), proves the served revision with
/health.revision and the five discriminating calls, keeps the 16-record store
byte-identical, sends the Sprint 189 reconnect draft to aquex-mcp and forge-demos, and
completes next-step #1415. Never print process environment values or .env contents.

s190-m02 through s190-m06 build in the worktree: first public pixels (viz.render
output.svg for all 13 types through the one shared renderer, dashboard HTML 11/11 drawn,
svgHash equal to certify's renderHash), then theme and brand from the token scopes with the
renderer's tokens option finally applied, then the chart in the generated application
(VizAreaPreview renders server-rendered SVG in HTML, React and Vue; Subscription/detail
places an area chart over payment events; design-loop receipts prove it), then certify
taking the same scope with contrast per theme and the executable visualization registry
plus census, then one four-suite capture under #1833, the 13-type matrix, the advertised
diff from c3a68d5f, the prepared reconnect and the review handoff.

Every golden that moves is replaced in the mission that moves it, with the reason, before
any capture. Never widen a certification claim: the 8 ECharts-primary types gain pixels and
stay uncertified. Never hand-edit a composed or saved schema; enumerate census movement per
schema by class. Ship first, verify with the suites the change touches, one full capture at
close. Record tests, failures, decisions, actual counts and commit identities in CMOS. Stop
with a complete independent-review handoff; leave Sprint 190 Active and
builderSelfCertified:false.
```

`build-tracking session` means `cmos_session(action="start", type="custom", title="Sprint 190 Build", sprintId="sprint-190", projectRoot=...)`. Use the mission lifecycle tool to start and complete each mission after inspecting its criteria.

## Prepared and checked

- Node `v24.6.0`, pnpm `9.12.2`; `pnpm install --frozen-lockfile` and the ordered package builds succeeded in the worktree (log under [probe/setup](forge-s190-planning-probe/setup/build.log)). The first two passes failed (`@oods/viz-core` without `@oods/tokens` built; `@oods/mcp-server` without `@oods/a11y-tools`, `@oods/release-utils` and `@oods/artifacts`); the pass that succeeded is `pnpm run build:tokens`, `pnpm run build:packages` (topological, the same script CI's build job uses), then `@oods/mcp-bridge` and `pkg:build`. The m01 criteria name that order.
- The primary `.env` is reachable through an ignored symlink in the worktree; the canonical CMOS database stays in the primary checkout.
- The served PM2 process (`/health.revision` = `f4cd1ba3`, 21 auto tools with `design_preview`, 6 on-demand) and the 16-record store were observed during planning; re-observe them at the start of m01.
- The Sprint 189 reconnect draft to send in m01 is `artifacts/product-reality/sprint-189/m06/corrective-proof/reconnect/notice-plan.json` (present in this worktree at `c3a68d5f`; targets aquex-mcp and forge-demos).
- Measured starting point is memo §2: `viz.render` returns specs only; dashboard HTML draws 5 of 11 and placeholders 6; `@oods/viz-render` renders both engines and its `tokens` option is a pinned no-op (`test/emitter.spec.ts:103-111`) with an un-themed golden; the token resolver is theme-blind over a flat map while `tokens.css` already emits the six brand × theme scopes; certify renders its own leg at intrinsic size; `VizAreaPreview` is a placeholder in three renderers and no object can place it; the generated app has no chart runtime.
- Descope ladder and never-cut list are in memo §7. Mission order puts pixels (m02) before theme (m03) and both before the chart in the app (m04) on purpose.
