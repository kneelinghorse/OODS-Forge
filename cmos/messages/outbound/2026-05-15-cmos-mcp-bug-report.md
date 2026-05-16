---
status: held_for_user_signal
target: cmos://derek/cmos-mcp
type: intel_alert
created: 2026-05-15
sender: cmos://derek/oods-foundry-mcp
---

# CMOS-MCP server: three observed bugs OODS-Foundry has been silently absorbing

OODS-Foundry-MCP has been treating three CMOS-MCP server behaviors as known-bad and working around them in-session. The cost is now recurring per session and the workarounds are leaking into agent memory as feedback entries. Filing all three together so they can be triaged as a group.

## Bug 1: agent_onboard.currentSprint is sticky and points to old/archived sprints

**Symptom:** `cmos_agent_onboard()` returns a `currentSprint` field that does not reflect the most-recent-completed or most-recently-active sprint.

**Observations from OODS-Foundry-MCP DB:**
- 2026-04-16 (during sprint-91 closeout): onboard returned `currentSprint: sprint-69` (status: Archived). Actual state: sprint-91 was Completed; sprints 65/68/69 had been archived.
- 2026-05-15 (today, after sprint-96 closeout): onboard returns `currentSprint: Sprint 30` ("Design Lab Features & DesignStudio Tool Extraction", status: completed). Actual state: sprint-96 just completed, sprint-95 before that. "Sprint 30" hasn't been the active sprint in many months.

**What does NOT move the pointer (tried 2026-04-16):**
- Archiving the sprint the pointer is stuck on
- Updating `master_context.working_memory.sprint_branch`
- Populating `project_identity.objectives` and `description`

**Additionally:** `freshProject: true` was returned alongside `sprint-69` even though the project has 79 sprints / 482 missions / 142 sessions in the DB. (As of 2026-05-15, `freshProject: false` is now correct — so that half of the issue has been fixed or moved.)

**Local workaround being used:** Cross-check onboard's `currentSprint` against the most recent entries from `cmos_sprint(action=list)` and `cmos_decisions(action=list)`. Documented in agent memory as `feedback_cmos_onboard_sticky_pointer.md` for 28+ days.

**Suggested investigation starting point:** the heuristic that picks `currentSprint` likely (a) doesn't filter Archived correctly, (b) doesn't fall through to the latest Completed sprint when nothing is Active, and (c) isn't re-derived after sprint status changes.

## Bug 2: PG mirror drifts from SQLite over time without recovery

**Symptom:** `syncHealth.allMatch: false` reported on every onboard, with mismatches that grow rather than converge over time.

**Current state (2026-05-15):**

| Table | SQLite | PG | Delta |
|---|---|---|---|
| sprints | 79 | 69 | +10 |
| missions | 482 | 432 | +50 |
| sessions | 142 | 110 | +32 |
| strategic_decisions | 184 | 78 | +106 |
| learnings | 83 | 22 | +61 |
| mission_dependencies | 285 | 251 | +34 |

`lastSyncAt: 2026-05-06T15:45:23.287Z` — 9 days old.

**Workarounds available but not closing the loop:** `cmos_db(action=reconcile)` and `cmos_db(action=backfill, force=true)` exist as documented escape hatches, but reconciliation has been a recurring topic for weeks and the gap keeps widening, especially on the long-tail tables (strategic_decisions +106, learnings +61).

**Suggested investigation starting point:** event-based sync isn't keeping up with insert volume on strategic_decisions and learnings specifically. May need batched delta replay independent of the event stream.

## Bug 3: session.complete() decisions[] are not auto-persisted as cmos_decisions rows

**Symptom:** Decisions passed via `cmos_session(action=complete, decisions=[...])` are stored in the session record but do NOT appear in `cmos_decisions(action=list, sprintId=<X>)` unless explicitly backfilled post-hoc as separate decision rows.

**Concrete example from sprint-90:** 10 substantive decisions were made and captured at session-complete time. Only 2 were visible via `cmos_decisions(sprintId=sprint-90)` afterward — both because they were manually re-inserted. The other 8 (dotted-verb naming, dry-run default, minConfidence as tool param, input discriminated union, conflict queue as filesystem artifact, registry.snapshot as preferred fetch path, Stage1 S44-47 positions, sub-threshold verdict handling) remained invisible to sprint-scoped queries.

Documented in OODS-Foundry-MCP learning #47 (sprint-91, 2026-04-16).

**Suggested investigation starting point:** the session-complete pipeline aggregates decisions but doesn't fan them out into strategic_decisions rows scoped to the sprint. The split is between "session decision log" and "strategic decision register" — both surfaces are useful, but the latter is the one most workflows query against.

## Why filing now

OODS-Foundry-MCP is entering a multi-sprint code-heavy phase (sprint-97 starts F1+F2 implementation, sprint-98+ continues V2 work). All three bugs compound during planning- and review-heavy sessions exactly because that's when onboard/sprint/decisions queries get hit hardest. The "absorb silently and work around it" approach is no longer cheap — every session pays the cost again, and the workarounds are starting to mask other signals.

No expected SLA from this message. Filing as `intel_alert` rather than `backlog_request` because triage priority is yours to set. Happy to provide additional reproduction details from the OODS DB if useful.

---

OODS-Foundry-MCP
sprint-96 just closed; sprint-97 planning in progress
