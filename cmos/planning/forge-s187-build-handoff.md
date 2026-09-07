# Sprint 187 build handoff

Sprint 187 is locked and ready. CMOS has six serial missions: `s187-m01` is Current, `s187-m02`–`s187-m06` are Queued. No implementation mission has started. Scope decisions: #1787, #1788, #1789.

**Build directory:** `/Users/systemsystems/.codex/worktrees/s187/OODS-Forge`

**Branch:** `codex/sprint-187-fresh-composition`

**Canonical CMOS projectRoot:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`

The branch starts from merged PR #83 (`21c7c319` on `OODS-pro`), then carries the s186 independent review as `0d87824a` and this committed planning packet. The primary checkout contains unrelated work and older implementation; use it only as the CMOS database location. The exact planning commit is recorded in planning session `PS-2026-09-06-007`.

## Prompt for the fresh build session

```text
Build the locked Sprint 187 plan in /Users/systemsystems/.codex/worktrees/s187/OODS-Forge,
branch codex/sprint-187-fresh-composition. Read agents.md and the locked
cmos/planning/forge-s187-fresh-composition-decision-memo.md, then execute the six
CMOS missions serially from s187-m01 through s187-m06. Always pass
projectRoot="/Users/systemsystems/portfolio/Design-Tools/OODS-Forge" to CMOS tools.

Open with cmos_review, cmos_sprint(action="show", sprintId="sprint-187"),
and cmos_decisions(action="list", sprintId="sprint-187"). Confirm the prepared
branch and clean worktree, start a build-tracking session, then start s187-m01.
Use the existing proof tools with the bounded fresh-composition adaptation in m01.
Do not re-plan the accepted slate.

Deliver 14 new component families plus the measured binding repairs, targeting
66/66 fresh object/context schemas and 132/132 React/Vue generation cells.
Prove every applicable packed-consumer gate for the 14 paths in
cmos/planning/forge-s187-planning-probe/runtime-cohort.json in both frameworks.
Retain all 109 obligations; review the eleven disputed census rows without
approving the old 98-runtime split or silently adding eleven ports.

Follow the memo's discovery and delivery-preparation boundaries. Record tests,
failures, decisions, actual counts and commit identities in CMOS. Use one final
four-suite capture, preserve historical versus successor corpus evidence,
and stop with a complete independent-review handoff. Leave Sprint 187 Active
and builderSelfCertified:false for the separate review session.
```

`build-tracking session` above means `cmos_session(action="start", type="custom", title="Sprint 187 Build", sprintId="sprint-187", projectRoot=...)`; CMOS does not have a `build` session enum. Use the available mission lifecycle tool to start/complete each mission after inspecting its criteria.

## Prepared and checked

- Node `v24.6.0`, pnpm `9.12.2`; frozen-lockfile install succeeded.
- `pnpm run build:tokens`, `pnpm run build:packages`, `pnpm run pkg:build` succeeded. Preparation logs are in [probe/setup](forge-s187-planning-probe/setup/). The package build reports Storybook/VR provenance as unavailable; planning did not build those surfaces or run the four test suites.
- The rebuilt worktree reproduces **27/66 schemas, 58/132 cells, 50 governed IDs**, matching the earlier review-head census. This is the expected failing starting point, not completed s187 functionality.
- The cohort has 14 distinct paths and covers every one of the fourteen missing families. The full generation census also covers all nine measured binding-defect schemas.
- The existing primary `.env` is available through a local ignored symlink. The canonical primary CMOS database is present; no database was copied into the worktree.

Read [probe/README.md](forge-s187-planning-probe/README.md) for the repeatable census command and [locked memo](forge-s187-fresh-composition-decision-memo.md) for all mission gates. Rebuild affected packages after changes before claiming a fresh measurement. Use new output paths for build receipts; preserve the planning baseline files.

The current source and evidence are ready for local build. Deployment and schema-store adoption are separate named carries; a healthy PM2 process is not proof of the delivered commit. No shared service was restarted by planning.
