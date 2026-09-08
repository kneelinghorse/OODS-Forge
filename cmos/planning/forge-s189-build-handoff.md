# Sprint 189 build handoff

Sprint 189 is locked and ready. CMOS has six serial missions: `s189-m01` is Current, `s189-m02`–`s189-m06` are Queued. No mission has started. Direction: Derek, 2026-09-08, after the Sprint 188 review (the browser design loop plus the Sprint 188 carries, decision #1832). Lock: decision #1834 (planning session `PS-2026-09-08-012`).

**Build directory:** `/Users/systemsystems/.codex/worktrees/s189/OODS-Forge`

**Branch:** `codex/sprint-189-browser-design-loop` from `f4cd1ba3` (`OODS-pro` after PR #86, #87 and #88 merged)

**Canonical CMOS projectRoot:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`

The primary checkout is clean at `cd8ee986` on `Forge-expansion`, a strict ancestor of `f4cd1ba3`. It is the served bridge checkout and the CMOS database location. **Only `s189-m01` touches it** (fast-forward, rebuild, PM2 restart, reconnect send); every other mission works in the build directory.

## Prompt for the fresh build session

```text
Build the locked Sprint 189 plan in /Users/systemsystems/.codex/worktrees/s189/OODS-Forge,
branch codex/sprint-189-browser-design-loop. Read agents.md and the locked
cmos/planning/forge-s189-browser-design-loop-decision-memo.md, then execute the six
CMOS missions serially from s189-m01 through s189-m06. Always pass
projectRoot="/Users/systemsystems/portfolio/Design-Tools/OODS-Forge" to CMOS tools.

Open with cmos_review, cmos_sprint(action="show", sprintId="sprint-189") and
cmos_decisions(action="list", sprintId="sprint-189"). Confirm the prepared branch and
clean worktree, start a build-tracking session, then start s189-m01. Do not re-plan the
accepted slate.

s189-m01 is delivery: it runs against the PRIMARY checkout
/Users/systemsystems/portfolio/Design-Tools/OODS-Forge (git merge --ff-only origin/OODS-pro
to f4cd1ba3, rebuild, pm2 restart oods-forge-bridge, pm2 save), proves the served revision
with /health.revision and the four discriminating calls, keeps the 16-record store
byte-identical, and sends the Sprint 188 reconnect draft to aquex-mcp and forge-demos.
Never print process environment values or .env contents.

s189-m02 through s189-m06 build in the worktree: first the #1833 test handling, then the
design loop (scripts/design-loop serve/render/diff/status with receipts that reproduce the
Sprint 188 review's defects), then list and timeline as collections with the generated App
becoming the composition, form and detail reconcile, component and sample-data carries plus
the design_preview tool, then one fresh census, one four-suite capture under #1833, the
before/after receipt mapping for the seven #1832 items, the advertised diff from f4cd1ba3
and the review handoff.

Every fix is made by looking at a receipt: render before, change the producer, render
after, diff. Never hand-edit a composed or saved schema; enumerate census movement per
schema by class. Ship first, verify with the suites the change touches, one full capture
at close. Record tests, failures, decisions, actual counts and commit identities in CMOS.
Stop with a complete independent-review handoff; leave Sprint 189 Active and
builderSelfCertified:false.
```

`build-tracking session` means `cmos_session(action="start", type="custom", title="Sprint 189 Build", sprintId="sprint-189", projectRoot=...)`. Use the mission lifecycle tool to start and complete each mission after inspecting its criteria.

## Prepared and checked

- Node `v24.6.0`, pnpm `9.12.2`; `pnpm install --frozen-lockfile`, `build:tokens`, `build:packages`, `pkg:build` all succeeded in the worktree (log under [probe/setup](forge-s189-planning-probe/setup/)).
- The baseline census at `f4cd1ba3` measures 75/77 schemas and 150/154 cells with 72 governed IDs: the certified Sprint 188 population (66/66, 132/132, Subscription/workflow 2/2) reproduces; Organization/workflow and User/workflow return the typed OODS-N016 gap, pre-existing. See [probe/README.md](forge-s189-planning-probe/README.md).
- The primary `.env` is reachable through an ignored symlink in the worktree; the canonical CMOS database stays in the primary checkout.
- The served PM2 process (PID 85319, checkout `cd8ee986`, 20 tools, no revision field) and the 16-record store were observed during planning; re-observe them at the start of m01.
- The Sprint 188 reconnect draft to send in m01 is `artifacts/product-reality/sprint-188/m06/final-proof-corrected/reconnect/notice-plan.json` (present in this worktree at `f4cd1ba3`).
- Composed trees measured at planning (memo §2): list 12 nodes, timeline 14 (four empty entries), detail 26 (four empty tab panels, numbered duplicate labels), form 29 (four recipe-owned fields duplicated as generic controls); the generated App emits its own toolbar, rows and history beside the composed screen.
- Descope ladder and never-cut list are in the memo §7. Mission order puts the eyes (m02) before the fixes (m03–m05) on purpose.
