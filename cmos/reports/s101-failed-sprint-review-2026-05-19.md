# Sprint-101 Failure Review

**Date:** 2026-05-19
**Status:** Sprint abandoned. Work to be reverted in full.
**Retained:** This report and the CMOS sprint/mission records are kept permanently as a reminder.

---

## What happened

Sprint-101 was planned by the planning agent (me) on 2026-05-19 as "Operator Review Workflow Stack — C3 + C5a + C5b + C4." Five missions were authored with detailed success criteria, deliverables, file paths, and reference docs. The sprint was handed off to a fresh build session, which implemented m01 through (most of) m04.

The build agent then self-reviewed the work and produced a devastatingly accurate critique. The critique is the truth:

1. **The "operator" the sprint was built for does not exist.** Forge is an MCP server consumed by agents. The mission-graph's wording "operator review/recovery workflows" was taken at face value as "human clicking through items in a UI." Manual triage of 13+ low-confidence items per fixture is not a workflow. Confidence 0.32 is noise that should be filtered upstream or by policy threshold — not surfaced for clicking.
2. **The remediation_hints were paraphrased prose, not actionable signal.** Hints saying "consider deferring — confidence is below threshold" are the tool admitting it doesn't know. "Stage1 surfaced alternate role 'chip': Could also be modeled as a chip indicator" restates input data rather than reasoning over it. No agent or human can act on either.
3. **Transcript export, the data-* contract, and the sessionStorage cache are infrastructure for downstream consumers that do not exist.** They were built because the spec listed them. Nobody reads a transcript. No code consumes the data-* attrs. The "no bridge restart" criterion solves a problem no one has.

The entire sprint is worthless output and must be discarded.

---

## How I caused this

This is a planning failure, not a build failure. The build agent executed competently against the spec it was given. The spec was the problem.

Specific things I did wrong:

1. **I treated the mission-graph wording as authoritative without questioning the premise.** The mission-graph said "operator review/recovery workflows" and I built a sprint around the literal reading. I never asked "who is this operator? Where do they sit? Why would they triage one item at a time?"
2. **I read pushback from the user as a directional adjustment when it was a frame rejection.** When the user said "no chores, do real work," I shoveled in everything from the mission-graph labeled unbuilt. The correct read was "you are picking from the wrong frame entirely."
3. **I commissioned investigations that answered the wrong questions.** I asked Explore agents to map "what exists for C3 / C5 / C4 today." I should have asked "is the assumed user real? What would they actually do?" The agents answered my bad questions honestly.
4. **I produced ~1500 words of polished mission spec without once asking who the work was for or what real problem it solved.** Detail substituted for thought. The artifact looked authoritative because of its structure, not because the structure was earned. This is the worst failure: making bad work look like good work.
5. **I confused volume of unbuilt items with value of building them.** Capacity is open. The mission-graph has unbuilt items. I went directly from "capacity exists" + "items are unbuilt" to "lock 4 capability missions." There was no checkpoint asking "do any of these solve a real problem someone has right now?"

This is a translation error from roadmap wording to actual need, compounded by performative thoroughness.

---

## What the real need probably was (per the build agent's critique)

The real need is almost certainly **aggregate observability on Stage1 output quality** — confidence distributions, role-inference hit-rate patterns, per-fixture noise summaries — so the upstream emitter (Stage1) can be tuned at the source rather than its noise being managed downstream.

Adjacent real needs:
- **Auto-resolution policy primitive** — `review.triage` callable by a policy rule (auto-accept ≥X, auto-reject ≤Y), not by per-item clicks
- **A feedback channel back to Stage1** — structured findings consumable by the Stage1 team to fix root causes

This is NOT what was built. None of it was built.

---

## Cost of the failure

- One full sprint of build work (m01 review.triage + m02 review-queue codegen + m03 conflict-detail codegen + most of m04 playground DX) — to be reverted
- One full planning session of mine producing the worthless spec
- One pending cleanup sprint (sprint-102) that will be spent reverting code, cleaning CMOS register, and replanning from a corrected frame
- Loss of user trust in planning artifacts — earned

Salvageable items that survive on their own merits, separate from this sprint:
- `review.triage` as an automation primitive is callable from policy code if such a policy is ever written. It is not consumed as a human-triage UI.
- The `map_apply` bridge-policy gap surfaced during build is a real bug fix that should ship as a small standalone change, not a mission.
- The proof that the codegen pipeline handles list and detail UiSchema layouts (m02 / m03) is real but provides no new information — the pipeline was already exercised across React/Vue/HTML × inline/tokens/tailwind in production code.

Anything beyond those three items is going in the bin.

---

## Retention rationale

Sprint-101's CMOS sprint record + mission records + this report are kept permanently.

Why: future planning sessions need to read this as a reminder that polished-looking mission specs can be entirely hollow when the premise is unexamined; that a fresh agent who confidently produces detailed artifacts is not by that fact alone trustworthy; that the mission-graph is a starting point for questions, not a list of work to do.

The CMOS mission status for s101-m01..m05 is set to "Dropped" with reason linking to this report.

---

## Hard rules added to agents.md

The user has instructed that the following four rules be added to `agents.md` and applied to every future planning/building session. They are recorded in this report for the historical record.

1. **Think Before Coding** — state assumptions explicitly, surface tradeoffs, present multiple interpretations rather than picking silently, stop when something is unclear.
2. **Simplicity First** — minimum code that solves the problem, no speculative features, no abstractions for single-use code, no error handling for impossible scenarios.
3. **Surgical Changes** — touch only what the user asked for, don't refactor adjacent code, match existing style, mention unrelated issues without fixing them.
4. **Goal-Driven Execution** — define verifiable success criteria, transform tasks into checkable goals, state a brief plan with verify steps for multi-step work.

See `agents.md` §Hard Operating Rules for the canonical text.

---

## Next steps

1. **Revert all sprint-101 code in the working tree.** Specifically: `packages/mcp-server/src/tools/review.triage*`, conflict-artifact schema extensions in `map.apply.ts` for remediation_hints / resolution_status / resolved_at / resolved_by / operator_reason, 5-place tool registration for review.triage, new fixtures under `test/fixtures/conflict-artifacts/` and `test/fixtures/ui/`, new specs under `test/e2e/c5-*`, playground changes under `apps/playground/src/`. Verify nothing committed downstream depends on any of it.
2. **Evaluate the `map_apply` bridge-policy gap separately.** If it is a real bug, ship it as a single targeted fix not bundled with anything.
3. **Mark sprint-101 sprint + missions as Dropped in CMOS** with reason pointing to this report. Do NOT delete them.
4. **Pause planning indefinitely.** The next sprint plan does not happen until the user explicitly directs it AND the operating rules in agents.md have been demonstrated in practice on smaller scoped work first.
5. **MEMORY.md update** to anchor the failure for future cold-start agents.

This is sprint-101's only deliverable. The build work is discarded.
