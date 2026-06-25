# Quality Bars

**Status:** Active
**Date:** 2026-05-10
**Companion to:** [overview.md](overview.md)

The conventions enforced continuously across OODS-Forge work. These are non-negotiable — load-bearing because being wrong is the only thing that costs time.

Carried forward from sprints 90–95 plus what Position B/C scope demands. Each convention has a *why* anchored in a specific past failure mode or future requirement.

---

## Test & Validation

### Real-data E2E gates for every output surface
- **Rule:** No surface ships green on synthetic-only fixtures. Every emitter, every catalog contract, every fidelity rung carries at least one external-shape fixture in its E2E gate.
- **Why:** Sprint 80 lesson — internal scoring drifts from real consumer shape. The bridge/config integration bugs that fired only under E2E validation would have stayed hidden under synthetic-only testing.
- **Application:** every C-track mission and every I-track integration ships with an E2E gate using real artifacts (Stage1 reruns, concordance manifests, A2UI catalogs from real consuming hosts).

### Bidirectional integration tests for every Catalog contract surface
- **Rule:** For every contract surface where Forge reads OR writes (concordance manifest ingestion, semantic-federation policy evaluation, Stage1 reconciliation, agent-vitals telemetry), the test suite covers the reverse direction.
- **Why:** the bidirectional MCP claim depends on this. One-way tests prove half the surface.
- **Application:** F2 (concordance ingestion) tests round-trip; I2 (semantic-federation) tests policy evaluation with both grant and deny paths; I3 (agent-vitals) tests both event emission and event consumption.

### Pre-registered schema shapes ahead of partner emitter readiness
- **Rule:** When a partner organ (concordance, semantic-federation, Stage1) is about to emit a new shape, OODS-Forge pre-registers the receiver shape (input schemas, contract tests, regenerated types, contract-doc updates) BEFORE the partner ships. Zero behavior change at our layer until partner flips on.
- **Why:** Sprint 91 v1.4.0 contract-gate pattern. Pre-registering shapes beats retrofitting under pressure.
- **Application:** F2 should land contract gates against Concordance wire `1.1.0` before authenticated writes; future Stage1/Concordance contract bumps follow the same pattern.

---

## Sprint Conventions

### +1 closeout mission every sprint
- **Rule:** Every sprint includes a final mission named "closeout" with concrete deliverables: commit verification, branch push, counterparty ack (if cross-project), session capture+complete, MEMORY.md update, closeout report.
- **Why:** Sprints 90–91 retro-split failure mode. Floating "commit per-mission" policy didn't change behavior; trackable closeout mission did. Validated 4 consecutive sprints (s92–s95) zero retro-splits.
- **Application:** every sprint plan reserves the +1 slot. The closeout must explicitly `cmos_session complete` the linked **build** session (with summary + nextSteps) as a distinct step — completing the *sprint* (`cmos_sprint complete`) does NOT complete the active build session. (s110 closed the sprint but left build session PS-2026-06-16-004 active, which blocked the next session-start until it was completed retroactively during the s110 review.)

### N≤5 mission posture (with N=3 flex)
- **Rule:** Default sprint shape is 4–5 missions including closeout. Flex to N=3 occasionally to validate posture flexibility.
- **Why:** validated through sprints 92–95. Quality-first cadence held; scope inflation remains the named anti-pattern. Sprint 95's N=3 test confirmed the posture is genuinely flexible rather than a fixed shape.
- **Application:** sprint planning starts at N≤5; expansion past 5 requires explicit rationale.

### End-of-sprint commit boundary inside the +1 closeout mission
- **Rule:** Each sprint commits its full set of deliverables inside the closeout mission. The closeout commit message enumerates the mission IDs (`s97-m01, s97-m02, …`) so post-hoc bisection by mission scope is still possible. `git status` must be clean at session.complete time. Per-mission mid-sprint commits are still welcome when they're natural, but they're not required.
- **Why:** The earlier sprint-91 decision #309 ("per-mission commits at mission-complete time") was retired by decision #408 after failing across 5 consecutive sprints (s90–s96) with no enforcement mechanism. Closeout-as-boundary is what actually held; closeout integrity is what matters for foundation/spec/contract sprints, not per-mission integrity. Bisection-by-mission is preserved via the enumerated commit message rather than via per-mission commits.
- **Application:** every sprint's closeout mission has three explicit success criteria: (a) all sprint deliverables committed before session completes, (b) commit message lists mission IDs covered, (c) git status clean at session.complete time. First formal run was sprint-97 m05.
- **Future tightening:** if a code-heavy sprint demands per-mission bisection later, per-mission discipline can be reintroduced with a different rule scoped only to code-producing missions (not foundation/spec/contract work).

### Scale-determinism (Q1) verified green at sprint close
- **Rule:** Every sprint closeout verifies the scale-determinism suite (`pnpm --filter @oods/mcp-server run test:scale`) green at 100/500/1000 — the Q1 mission-graph release gate (V2 axis #7, decision #614). This sprint-close/#408 boundary is the load-bearing gate; the standalone `scale-determinism` CI job runs it per-PR for early signal.
- **Why:** The 3-sprint reproducibility streak (s105=1/3 baseline, s106=2/3, s107=3/3) completed per #614, flipping the gate from "prove it's reproducible" to "keep it reproducible." Determinism regressions in `map.apply` are silent and only surface at scale; the closeout check is what holds the property sprint-over-sprint instead of letting it drift. Resolved at s107-retro (PS-2026-06-10-004) as a closeout criterion rather than a CI aggregator gate job — `ci.yml` has no release-gate job; the #408 closeout boundary is the gate.
- **Application:** the closeout mission's success criteria add (d) `test:scale` green at 100/500/1000 before session.complete. First formal run: the s107-retro pass.

### Build-freshness at closeout (advisory-only since #471)
- **Rule:** Rebuild the dists of the packages actually changed this sprint as the operator-rollout step (so the live bridge/adapter picks up the change). Build-freshness is **ADVISORY-ONLY**: `forceComplete` is a server-side no-op (#471), so build-freshness **never blocks closeout** and there is **no `forceComplete`-with-reason ceremony** to perform. The cmos build-freshness probe still reports BUILD_STALE `dist-missing` at every closeout because this repo builds bare-`tsc` → `dist/src/**`, a layout the probe does not recognize (the perennially-flagged files are unchanged `src/viz` re-export shims from the s109 extraction); treat that signal as informational, not a gate.
- **Why:** BUILD_STALE recurred at s109/s110/s111 exactly as #696a predicted, so re-deciding `forceComplete` every closeout was waste — and #471 confirmed `forceComplete` no longer does anything server-side. The only real action is the dist rebuild itself; the advisory BUILD_STALE flag can be ignored.
- **Permanent fix (open, NOT a Forge repo mission):** teach the cmos build-freshness probe the `dist/src/**` layout, or exclude the shim dir — a CMOS-MCP-side change (next-step #400). Until then, treat the signal as advisory.
- **Application:** the closeout mission's success criteria add (e) changed-package dists rebuilt (operator rollout) — no `forceComplete` ceremony.

### Frozen-lockfile install + root typecheck at closeout (#740)
- **Rule:** Every sprint closeout runs `pnpm install --frozen-lockfile` (CI's install mode) and the ROOT `pnpm typecheck` (`tsc --noEmit` over `src/**`) before session.complete — IN ADDITION to the per-package `tsc` + package suites. Mandatory whenever a sprint edits any `package.json` dependency OR widens a shared `@oods/viz-core` type.
- **Why:** s111 closed "green" locally yet CI went RED on push with two failures the per-package gates structurally could not see (#740): (i) `ERR_PNPM_OUTDATED_LOCKFILE` — a new type-only devDependency was added to a package without regenerating `pnpm-lock.yaml`, so CI's `--frozen-lockfile` install failed before any build/test ran, taking down ALL jobs (fix 692a27b); (ii) `TS2739` in `src/viz/patterns/scaffold-generator.ts` — widening viz-core's `ChartType` union propagates into `src/` via the `src/viz/patterns` re-export shim, breaking three exhaustive `Record<ChartType>` maps that ONLY the root typecheck (not per-package `tsc`) covers (fix cb1a545). The per-package gates are necessary but NOT sufficient. (s112 m01 hit the exact same `ChartType`-widening coupling and fixed it in-mission because this gate was run.)
- **Application:** the closeout mission's success criteria add (f) `pnpm install --frozen-lockfile` succeeds (lockfile in sync) and (g) root `pnpm typecheck` exits 0.

### Contract + viz test scope green at closeout (#419)
- **Rule:** Every sprint closeout runs the root contract + viz test scope (`pnpm vitest run tests/contracts tests/viz`, the narrow fast form) GREEN before session.complete — IN ADDITION to the per-package suites + colocated goldens.
- **Why:** the `tests/contracts/schema-types.contract.test.ts` drift guard structurally lives outside both the per-package suites and the colocated `src/tools/**` goldens (the root core/coverage vitest projects exclude `tests/**`), so it can sit RED unnoticed — which it did across part of the viz arc. It is DOUBLY load-bearing on any sprint that regenerates a routed type: s114 regenerates the very `dashboard.types.ts` that contract test guards. Pairs with the viz `all:true` coverage floor, which a newly-exported-but-untested symbol can silently dip.
- **Application:** the closeout mission's success criteria add (h) `pnpm vitest run tests/contracts tests/viz` exits 0 before session.complete. First formal run: s114 m06.

### Closed-union widen: the seven-site mechanical sweep (#879)
- **Rule:** Adding a value to the `ChartType` closed union (a new chart type) requires touching **seven** exhaustive sites in the SAME diff, or the build breaks at a site the type-surface widen silently de-totalized. The sites:
  1. `ChartType` union — `packages/viz-core/src/patterns/index.ts`
  2. `CHART_TYPE_MARK` (the `Record<ChartType,string>` mark map) — `packages/viz-core/src/builder/spec-builder.ts`
  3. `CHART_TYPE_LABEL` (the `Record<ChartType,string>` label map) — same file
  4. `chartMarkByType` shim map — `src/viz/patterns/scaffold-generator.ts`
  5. `layoutFrameByChartType` shim map — same file
  6. `componentByChartType` shim map — same file
  7. the `viz.render.ts` cluster (counts as one site, ~5 sub-edits) — `packages/mcp-server/src/tools/viz.render.ts`: the `EChartsPrimaryType` union, the `EChartsPrimaryConfig.dataBranch` union **literal**, the `ECHARTS_PRIMARY` `Record<EChartsPrimaryType,…>` map, the `isEChartsPrimaryType` guard, and the `renderEChartsPrimary` dispatch arm. (A new explicit-only type ALSO needs its adapter + barrel export + schema branch/enum/oneOf/allOf + `generated.ts` regen + tests — those are the "new type" additions, distinct from this union-widen sweep.)
- **Grep recipe:** `grep -rn "'flow_map'\|\"flow_map\"" packages/viz-core/src packages/mcp-server/src src/viz` (substitute any already-complete member) enumerates every site that must gain the new member — run it BEFORE locking the edit list so no exhaustive map is missed.
- **Two-layer typecheck backstop (NOT one):** the ROOT `pnpm typecheck` (`tsc` over `src/**`) catches sites 1–6 — sites 4–6 are reached because `src/viz/patterns/index.ts` RE-EXPORTS the viz-core `ChartType`, so the shim `Record<ChartType>` maps de-totalize in `src/`. But the root tsconfig `include` is `src/**` ONLY, so it does **NOT** cover site 7 (`packages/mcp-server`). Site 7 (notably the `dataBranch` union literal) is caught by the mcp-server `build` (`tsc -p tsconfig.json`) — its colocated vitest only type-STRIPS (esbuild), so vitest passing does NOT prove site 7 type-checks. Run BOTH root typecheck AND the mcp-server `tsc` build.
- **Why:** s118 and s119 each shipped the type widen but MISSED the 3 `src/viz` shim maps (#878/#879) — caught only by the root typecheck backstop, twice. The `dataBranch` union literal at `viz.render.ts` is the additional sub-site even a 4-critic enumeration folded silently (s120). The maps are total `Record<ChartType>` by design (exhaustiveness over the closed union), so a missed entry is a hard `TS2739`, not a soft warning — which is the point: the type system enforces the sweep IF every layer is actually compiled.
- **Application:** any sprint widening `ChartType` enumerates these 7 sites in the mission spec via the grep recipe, and the closeout runs BOTH typecheck layers (root + mcp-server `tsc`). First codified: s120 m03 (chord, the 7th explicit-only type).

### Canonical enum convergence: the 4-layer hidden-source-of-truth sweep (#s127-m03)
- **Rule:** Adding, removing, or renaming a member of a canonical enum requires sweeping FOUR layers in the same diff AND grepping the WHOLE repo — including the related enums of SIBLING objects, not just the mission-anchored file. The four layers, ordered by how the drift hides:
  1. **Authoritative model** — the ONE source of truth for the set. Viz: the `traits/viz/*.trait.ts` parameter `validation.enum`. Billing subscription state: the `SUBSCRIPTION_STATES` const in `src/domain/billing/states.ts`. An object field: the inline `validation.enum` in the object YAML (e.g. `objects/core/Organization.object.yaml` `billing_status`). Converge + guard this first.
  2. **JSON-schema mirror, WHERE ONE EXISTS** — viz traits mirror their parameter enums into `schemas/traits/<name>.parameters.schema.json`; this is the ONE uniform surface, enforced byte-identical by `pnpm run lint:enum-convergence`. Billing/status enums have NO such mirror, so they are NOT covered by that lint and instead need an m01-style guard test.
  3. **Exhaustive `Record<Enum,…>` shims** — total maps keyed on the union (`Record<SubscriptionState,…>` in `state-guards.ts`; the seven `Record<ChartType,…>` sites). A missed member is a hard `TS2739` — but ONLY if the layer actually compiles: the ROOT `pnpm typecheck` covers `src/**`, the per-package `tsc` build covers `packages/**`; vitest/esbuild only type-STRIPS, so a passing suite does NOT prove these compile.
  4. **String-typed behavior consumers + presentation-tolerance aliases** — logic gated on a literal value (`status === 'delinquent'`), status/token maps, and DELIBERATELY-retained legacy aliases (`withStatusBadge`, the saas-billing token map). These are string-keyed, so neither typecheck nor schema catches them — only a TEST does. Decide explicitly, per value, whether to converge or retain as a documented tolerance alias.
- **The sibling-object miss class:** when a sprint sweeps a value out of one object, the stale copy hides on the related-but-SEPARATE enum of a sibling object. s126 converged `Subscription.status` but left `Organization.billing_status` (a coarser account-health vocabulary) carrying the retired `delinquent`, because the closeout grep was subscription-scoped and never looked at the sibling. The pre-flight grep MUST be repo-wide (`grep -rni "<retired-value>"`) and explicitly include sibling objects' enums, classifying every hit as authoritative / mirror / shim / tolerance.
- **Why:** s126's mission anchors undercounted blast radius (~70 touched files vs 4 anchored) and the sibling miss escaped to the s126 review. The four layers fail at DIFFERENT gates (lint, two typecheck layers, tests); no single gate is sufficient. The deterministic viz-trait↔mirror lint makes layer 2 non-recurring for the one surface with a uniform mirror; the checklist + guard test cover the layers that have none.
- **Application:** the closeout mission's success criteria add (i) `pnpm run lint:enum-convergence` exits 0 (the viz trait↔schema-mirror byte-identity gate). Any canonical-enum change follows [enum-convergence-checklist.md](enum-convergence-checklist.md). First codified: s127 m03 — the `delinquent`→`unpaid` `Organization.billing_status` reconcile (s127-m01) is the worked example.

---

## Decision Conventions

### Decision memos before implementation for D1–D5
- **Rule:** For decisions where being wrong costs 5+ sessions of rework, a research-shaped mission produces a 1-page memo before any implementation begins.
- **Why:** Memo costs 1 session; rework costs 5–15. Math is settled.
- **Application:** D1 memo before F1 (Object Catalog spec); D2 memo before C1 (boxes-and-arrows render); D3 memo before I1 (concordance integration); D4 memo before I2 (semantic-federation integration). D5 deferred.

### New decision points get added to the register as they emerge
- **Rule:** If during the work a new fork emerges where being wrong is expensive, it goes in [decision-points.md](decision-points.md) as Dn before the implementation that depends on it.
- **Why:** The current register reflects what was visible at one planning conversation. New visibility surfaces new forks.

---

## Schema & Contract Conventions

### Additive-only versioning for stable contracts
- **Rule:** Once a contract surface (Object Catalog, concordance ingestion, Stage1 reconciliation, semantic-federation policy interface) reaches v1.0, schema changes are additive only. Removals require new version numbers.
- **Why:** External integrators rely on stable shapes. Breaking changes force coordination overhead that compounds across the stack.
- **Application:** F1 (Object Catalog spec) starts at catalog version `1.0.0`; breaking changes after that require a major version.

### Schemas reject unsupported versions gracefully
- **Rule:** If Forge receives a contract version it doesn't support, it returns a clear, machine-readable error. Not a parse failure. Not silent degradation.
- **Why:** lessons from Stage1 v1.4.0 → v1.5.0 → v1.6.0 → v1.7.0 — graceful degradation across version bumps was load-bearing for keeping both sides shippable.
- **Application:** ingestion endpoints (concordance manifests, Stage1 reports) check version field and return structured errors on mismatch.

### Cross-project messaging uses CMOS as the channel
- **Rule:** State updates, contract version announcements, and ack handshakes between aquex organs use `cmos_message` rather than ad-hoc files or external channels.
- **Why:** CMOS is the audit trail. Out-of-band coordination loses provenance.
- **Application:** every cross-project handshake (Stage1 ack, concordance schema announcements, semantic-federation policy publishes) goes through CMOS.

---

## Planning Conventions

### Sessions, not calendar
- **Rule:** Pacing tradeoffs are framed as "this adds N sessions to the path," not "this delays delivery by W weeks." Quality and scalability are the constraints.
- **Why:** Calendar dates don't bind for OODS-Forge. The unit of progress is sessions; quality is what determines whether they're productive.
- **Application:** sprint planning, decision memo authoring, integration coordination — all framed in sessions and dependencies.

### Track sequencing: Foundation → Capability → Integration → Quality
- **Rule:** Foundation missions (F1–F3) get session priority. Capability missions parallel after Foundation. Integration missions gated on partner readiness. Quality missions continuous.
- **Why:** F1 is the spine; everything keys off it. Out-of-order work risks rework when F1 stabilizes.
- **Application:** sprint-96 plans start with F1-supporting missions (D1 memo, F3 framing draft); subsequent sprints layer Capability and Integration.

---

## Communication Conventions

### Decision memos are public artifacts (within the team)
- **Rule:** D1–Dn memos live in [decisions/](decisions/) and are referenced from CMOS missions. Not stuffed in session notes.
- **Why:** future sessions need to discover the rationale; CMOS messages and session notes get pruned.
- **Application:** decision memos commit alongside implementation; missions cite them; CMOS records reference them.

### Public-facing claims (e.g. "writable Object Catalog MCP") are sourced
- **Rule:** Claims that show up in product positioning are anchored in concrete artifacts (a tool spec, a doc, a fixture, a comparable product list).
- **Why:** Position B/C imply external readers; sloppy claims dilute the wedge.
- **Application:** F3 (bidirectional MCP framing) ships with a concrete public-facing doc that an external integrator can read once and implement against, with claims scoped to catalog/reconciliation writability.

---

## What This Document Does Not Specify

- The exact testing framework or CI configuration (lives in repo conventions, not foundational docs).
- Per-language code style rules (lives in linter configs).
- The specific text or format of CMOS messages (covered by CMOS tier guide).

These quality bars apply *across* implementation choices. The implementation choices themselves are a separate layer.

---

*Authored 2026-05-10. Each rule has an antecedent in named past work; new rules require the same grounding before they get added.*
