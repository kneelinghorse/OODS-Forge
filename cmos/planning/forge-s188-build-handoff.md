# Sprint 188 build handoff

Sprint 188 is locked and ready. CMOS has six serial missions: `s188-m01` is Current, `s188-m02`–`s188-m06` are Queued. No mission has started. Direction: decision #1814 (Derek, 2026-09-07). Lock: see the planning session `PS-2026-09-08-001` decisions.

**Build directory:** `/Users/systemsystems/.codex/worktrees/s188/OODS-Forge`

**Branch:** `codex/sprint-188-subscription-workflow` from `cd8ee986` (`OODS-pro` after PR #84 and PR #85 merged)

**Canonical CMOS projectRoot:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`

The primary checkout is clean at `7ad4dacb` on `Forge-expansion`, a strict ancestor of `cd8ee986`. It is the served bridge checkout and the CMOS database location. **Only `s188-m01` touches it** (fast-forward, rebuild, PM2 restart, store adoption); every other mission works in the build directory.

## Prompt for the fresh build session

```text
Build the locked Sprint 188 plan in /Users/systemsystems/.codex/worktrees/s188/OODS-Forge,
branch codex/sprint-188-subscription-workflow. Read agents.md and the locked
cmos/planning/forge-s188-subscription-workflow-decision-memo.md, then execute the six
CMOS missions serially from s188-m01 through s188-m06. Always pass
projectRoot="/Users/systemsystems/portfolio/Design-Tools/OODS-Forge" to CMOS tools.

Open with cmos_review, cmos_sprint(action="show", sprintId="sprint-188") and
cmos_decisions(action="list", sprintId="sprint-188"). Confirm the prepared branch and
clean worktree, start a build-tracking session, then start s188-m01. Do not re-plan the
accepted slate.

s188-m01 is delivery: it runs against the PRIMARY checkout
/Users/systemsystems/portfolio/Design-Tools/OODS-Forge (git merge --ff-only origin/OODS-pro,
rebuild, pm2 restart oods-forge-bridge, pm2 save), proves the served revision with the
three discriminating calls, adopts only the reviewed User-form successor with a hashed
backup, and sends the one combined reconnect to aquex-mcp and forge-demos. Never print
process environment values or .env contents.

s188-m02 through s188-m06 build in the worktree: the workflow context and application
emitters, the app proven live in both frameworks with 32 state observations and 24
screenshots, the eight Billable/Archivable rows implemented from their trait declarations
to the Sprint 185 bar, nucleus catalog truth, /health revision, then one fresh census,
one four-suite capture, the sprint-wide advertised diff and the review handoff.

Ship first, verify with the suites the change touches, one full capture at close.
Record tests, failures, decisions, actual counts and commit identities in CMOS. Stop with
a complete independent-review handoff; leave Sprint 188 Active and builderSelfCertified:false.
```

`build-tracking session` means `cmos_session(action="start", type="custom", title="Sprint 188 Build", sprintId="sprint-188", projectRoot=...)`. Use the mission lifecycle tool to start and complete each mission after inspecting its criteria.

## Prepared and checked

- Node `v24.6.0`, pnpm `9.12.2`; `pnpm install --frozen-lockfile`, `build:tokens`, `build:packages`, `pkg:build` all succeeded in the worktree (logs under [probe/setup](forge-s188-planning-probe/setup/)).
- The baseline census at `cd8ee986` reproduces the certified population; see [probe/README.md](forge-s188-planning-probe/README.md).
- The primary `.env` is reachable through an ignored symlink in the worktree; the canonical CMOS database stays in the primary checkout.
- The served PM2 process, store and rollout packet were observed during planning and are described in the memo's measured table; re-observe them at the start of m01.
- Descope ladder and never-cut list are in the memo §7. Mission order puts the application (m02–m03) before the new rows (m04–m05) on purpose.
