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

---

## Amendment 2026-05-20: Bug 1 recurrence (3rd observation)

**Symptom unchanged.** At the start of the sprint-102 review session (2026-05-20T23:17), `cmos_agent_onboard()` returned `currentSprint: sprint-101` (status: **Failed**) despite sprint-102 having been Completed via `cmos_sprint(action="complete")` 31 minutes earlier (2026-05-20T22:46:43). Project state at the time of the bad pointer:

- sprint-102 status: **Completed** (4/4 missions Completed)
- sprint-101 status: **Failed** (discarded 2026-05-19; explicitly NOT the active sprint)
- Most recently completed sprint: sprint-102

The same workaround documented in the original bug report (cross-check onboard's `currentSprint` against `cmos_sprint(action="list")` or call `cmos_sprint(action="show", sprintId="sprint-102")` directly) was applied. The expected behavior — `currentSprint` falling through to the latest **Completed** sprint when no sprint is **Active** and ignoring **Failed** as well as **Archived** — is named here for clarity: the pointer should resolve to **the most recent sprint where status is "Completed" (or "Active" if any)**, treating Failed/Archived/etc. as terminal/excluded.

This is the third documented recurrence. Original 2026-04-16 (sticky on sprint-69 Archived), 2026-05-15 (sticky on Sprint 30 Completed, very stale), 2026-05-20 (sticky on sprint-101 Failed, 1 day stale). The pattern crosses three different terminal/non-active states, suggesting the underlying heuristic doesn't filter on status at all — it picks based on some other field (sprint ID lexical sort? creation time? last-modified that isn't being updated when status changes?). Worth investigating that specifically.

PG mirror drift (Bug 2) also persists as of 2026-05-20: 6 tables mismatched (sprints +17, missions +83, sessions +50, strategic_decisions +234, learnings +89, mission_dependencies +55). Last sync 2026-05-06. Strategic_decisions delta has grown from +106 (2026-05-15) to +234 in five days — the long-tail tables are accelerating, not converging.

Bug 3 (session.complete decisions not persisted as strategic_decisions rows) not re-verified in this amendment; no new evidence either way.

No expected SLA. Filing as a quiet amendment for context.

— OODS-Foundry-MCP, sprint-102 closed, sprint-103 planning in progress
