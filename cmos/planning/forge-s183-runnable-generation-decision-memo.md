# Forge Sprint 183 — Runnable Generation

**Status:** LOCKED v2 — planning session `PS-2026-09-04-006`. v2 rewrote §5 after the saved-schema
store was measured: exactly one of 16 records is nucleus-complete, and the copy visible from the
sprint worktree is an s182-authored fixture shadowing the genuine six-month-old record.

**Program authority:** [Forge Product Reality Program](../foundational-docs/roadmap/product-reality-program.md), decision `#1652`

**Near-horizon authority:** [Near Roadmap](../foundational-docs/roadmap/near.md) — this sprint is Increment 2, "Runnable Generation"

**Planning baseline:** `ca8d84bbce165b656fd5cd83cc097c28fa774f19`

**Predecessor:** Sprint 182 — Product Reality Foundation, closed 2026-09-04. Reviewed by
`PS-2026-09-04-004` (decision `#1662`); `foundation-v1` promoted by Derek the same day (decision
`#1663`), 28 of 28 cells.

---

## 1. What this sprint is for

Sprint 182 made the components real. Sprint 183 makes the *output* real.

Today `code.generate` emits correct source that imports the correct packages, and it does so
deterministically. What it does not do is hand anyone something installable. It returns one source
string, one file extension, and a flat list of package names with no versions. A consumer holding
that response cannot install it, cannot know what it was checked against, and — if the design binds
any action — receives handlers whose bodies are empty.

This sprint closes those four gaps, and then proves the result by taking a schema that already
existed and running it all the way into working React and Vue applications.

The exit gate is the near roadmap's, unchanged: **a saved Forge schema installs, builds, renders,
hydrates, and passes interactions in clean React and Vue consumers.**

## 2. Measured starting point

Measured during this planning session against the Sprint-182 build at `ca8d84b`, by executing the
real emitter rather than reading it. These are the facts the sprint must move.

| Surface | Measured now | Obligation |
|---|---|---|
| Response payload | Single `code` string + one `fileExtension` | Versioned multi-file file-set artifact |
| Dependencies | Flat `imports` array, e.g. `["react","@oods/components-react","@oods/component-styles/css"]`, no versions | Exact manifest with versions and dependency kind |
| Determinism | Already byte-identical across repeated identical calls | Declared and hash-proven, not merely true by accident |
| Imports | Resolve to the real packages — the s182 win | Preserved; no regression to fictional imports |
| Actions | `binding-utils.ts:96` emits `const handleSave = () => { /* TODO: implement handleSave */ };` | Typed action protocol; no empty bodies |
| Validation | No profile on the wire | Explicit `draft` / `build` / `release` |
| Pipeline | `pipeline.ts:434` flattens to `output: codegenResult.code` | Carries the artifact, not a flattened string |
| Consumer proof | 8 checks per framework, but against a hand-authored nucleus showcase | Same checks against a real saved schema |

Two of these deserve emphasis because they change what the sprint must do.

**Determinism is already true.** Three identical calls produced identical content hashes. The sprint
does not need to build determinism; it needs to declare it, hash it, and put a discriminating gate
around it so a later change cannot silently break it.

**The consumer harness already renders, hydrates, and interacts.** Sprint 182's `m04` harness runs
fresh exact-tarball install, strict typecheck, production build, server render, mount, hydration,
shared CSS resolution, and an interaction path, under real isolation. Sprint 183 extends a working
harness. What is new is the *subject* — a real saved schema — and the fact that the interaction check
must now exercise behavior that genuinely works.

## 3. The load-bearing problem: an empty handler cannot pass an interaction test

The exit gate says interactions must **pass**. A generated handler whose body is
`/* TODO: implement */` does nothing, so any interaction assertion against it either fails or passes
vacuously. This is not a detail to discover during the build; it is the sprint's central design
question, and the memo answers it now.

Bindings split into two kinds, and they are treated differently:

- **Forge-owned behavior.** Tab selection, checkbox and field state, disclosure, local validation.
  Forge knows exactly what these mean, so it generates real working code for them, idiomatic to each
  framework. These are what the interaction proof exercises directly.
- **Domain actions.** Submit, navigate, delete, call an API. Forge cannot invent these and must not
  pretend to. They become **typed, declared, required injection points**: named in the artifact's
  action contract with parameter types, and surfaced to the consumer as something that must be
  supplied.

A required injection point is honest. A silent empty body is not. That is the whole distinction, and
it is why `generateHandlerStubs`' empty-body path is removed rather than decorated.

## 4. Locked scope

### 4.1 In scope

1. A versioned multi-file artifact envelope with per-file and artifact-level content hashes.
2. An exact dependency manifest — every runtime and peer dependency with a concrete version and a
   declared kind, containing no workspace alias and no repository path.
3. A typed action protocol replacing blank handler stubs, per §3.
4. Explicit `draft`, `build`, and `release` validation profiles, each response stating which ran and
   what it did **not** check.
5. A generalized saved-schema compiler, run against schemas that already exist in the repository.
6. The exit-gate consumer proof in both React and Vue.
7. Two named hygiene items: `#1316` and `#1317`.

### 4.2 Explicitly out of scope

No public npm publication, hosting, or registry work. No design-surface adapter — MCP Apps, Figma,
Penpot and a custom canvas all remain parked behind the program's adapter gate. No visualization
expansion or `schema.ingest`. No component breadth beyond the `foundation-v1` nucleus: a saved schema
that needs a fifteenth component produces a typed gap, it does not motivate implementing one here.
No change to the 109-row controlling denominator and no approval of the 98-row proposed runtime
census — both remain Derek's, untouched by this sprint.

Scope changes require Derek's approval plus a versioned memo revision and a CMOS amendment.

## 5. Anti-circularity: the exit-gate schema must pre-exist

The most tempting way to pass this sprint is to author a schema that happens to use exactly the
fourteen components that were just built, run it through, and call the gate met. That proves nothing,
because the input would have been chosen to fit the implementation.

This is not a hypothetical risk here. Planning measured the real store and found the trap already
set.

### 5.1 What the saved-schema store actually contains

The store lives at `packages/mcp-server/.oods/schemas/` and holds exactly 16 records. Walking every
node of all 16:

- **48 distinct component IDs** are used across the corpus.
- **12 of the 14** `foundation-v1` families appear. `Banner` and `Checkbox` are used by no saved
  schema; their justification is contract and scenario coverage, not saved-schema demand.
- **36 IDs fall outside the nucleus.** 35 of those are proposed `recipe` rows resolving only to HTML
  render functions, with React and Vue both `unavailable`; the exception is `TagInput`, proposed
  `native` with React `implemented-unverified`.
- **Exactly one of the 16 is nucleus-complete:** `tier1-acceptance-sub-detail.json`.

### 5.2 The trap: a shadowed fixture

That single nucleus-complete record exists in two different versions, and only one of them is real.

| | Tracked in the s182 worktree | The actual store record |
|---|---|---|
| `schemaRef` | `s182-tier1-bounded-foundation-v1` | `compose-7d860337` |
| `createdAt` | 2026-09-04 — the s182 build day | 2026-03-05 |
| tags | `["s182","bounded-foundation-v1"]` | none |

Sprint 182 wrote a same-named bounded fixture and committed it; because the store is gitignored, that
fixture is the *only* `.oods` schema visible from the sprint worktree. Compiling it and calling the
exit gate met would be exactly the circularity this section exists to prevent — an input authored to
fit the implementation, shadowing a genuine schema of the same name.

**The exit-gate schema is therefore the real `compose-7d860337` record, created 2026-03-05**, six
months before the nucleus was built. It is a good subject on the merits, not merely a permissible
one: 13 nodes over `Stack`, `Text`, `Card` and `Tabs`, carrying `Tabs` for Forge-owned interaction
and `onEdit`/`onDelete` bindings that are domain actions. It exercises both halves of §3's split.

### 5.3 The store is gitignored, so the corpus is not reproducible

`.gitignore:52` ignores `**/.oods/`. A reviewer cannot reproduce any claim about "the 16 saved
schemas" from the repository, and the corpus that survives into the worktree is a single
sprint-authored fixture. Any exit-gate statement about saved schemas is unverifiable until this is
fixed.

So `s183-m04` must **vendor the 16 records as tracked evidence** — content-hashed, with their real
`schemaRef` and timestamps preserved, and with the s182 replacement recorded as a distinct fixture
rather than allowed to shadow `compose-7d860337`.

### 5.4 Disposition rules

Every saved schema receives a recorded disposition — compiled, or typed gap naming the specific
missing component and target. None is silently skipped, and compiled and gapped outcomes are never
averaged into a single number. Fifteen of sixteen are expected to report typed gaps; that is the
honest result, not a failure to work around.

### 5.5 Component breadth stays out, and here is the measurement for later

Planning also measured what the cheapest unblock would cost, because that question will be asked:
adding `DetailHeader`, `SearchInput` and `PaginationBar` would make **five further pre-existing
schemas** fully reachable — `cmos-activity-redesign`, `cmos-messages-redesign`, `plan-form-dark`,
`pt-shop-parts-entry-router-v1`, and `user-inline-showcase`.

That is deliberately **not** in this sprint. The exit gate needs one genuinely pre-existing schema and
it has one. Widening the nucleus to raise a count is component-breadth work, which the program
sequences into a later increment. This measurement is recorded as the evidence that increment should
start from, ranked by blocking frequency: `SearchInput` 6, `DetailHeader` 6, `PaginationBar` 5,
`StatusBadge` 4, `AuditTimeline` 3, `StatusTimeline` 3.

## 6. Mission slate and dependency graph

```text
s183-m01 ──┬──> s183-m02 ──> s183-m04 ──┐
           │                             ├──> s183-m05 ──> s183-m06
           └──> s183-m03 ────────────────┘
```

| Mission | Name |
|---|---|
| `s183-m01` | Versioned file-set artifact and exact dependency manifest |
| `s183-m02` | Typed action protocol — end the blank handler stub |
| `s183-m03` | Draft, build, and release validation profiles |
| `s183-m04` | Generalized saved-schema compiler |
| `s183-m05` | Greenfield consumer proof — the exit gate |
| `s183-m06` | Closeout, review handoff, and named hygiene |

All edges are `Requires`, oriented dependent → prerequisite. Per-mission objectives, deliverables and
success criteria live in CMOS and are not duplicated here.

## 7. Gates that apply to every mission

These are the program's, restated because they bind this sprint:

- Claims come from executable evidence, never catalog prose.
- React and Vue are equal targets. Neither framework's bar is lowered to let the sprint close.
- Packed-consumer tests use no workspace alias, repository source import, pre-existing
  `node_modules`, or user registry configuration.
- An unsupported target fails with a typed gap. Warning-only fallback is not success.
- Every significant failure mode gets a negative test or mutation bite **capable of proving the gate
  discriminates**. A bite that cannot be shown to go red does not count.
- No success statement may omit a skipped, unrun, or environment-blocked check.
- A build session records evidence and stops. A separate review session decides genuine close.

## 8. Evidence discipline carried from the Sprint-182 review

Sprint 182's review found that the archived mutation patch could not be replayed — it did not apply,
and its selector did not match the shipped source. The control was real, but the stored instructions
for reproducing it were wrong, which is a defect in a handoff whose entire purpose is independent
replay.

Therefore, for this sprint: **every stored mutation patch must be applied from the artifact and
replayed at least once before closeout.** Writing the patch down is not evidence that it works.

Two further carries from Sprint 182 land in `s183-m06`:

- The `foundation-v1` approval mechanism is currently bespoke to
  `generate-s182-m05-closeout.mjs`. It is generalized so future predicates reuse one reviewer-record
  gate rather than re-implementing a one-way boolean. Self-promotion by the builder stays impossible,
  and the gate must be shown to discriminate in both directions.
- **R-02**: the `packageExport` evidence class for all 28 `foundation-v1` cells cites
  `packages/components-react/dist/index.d.ts` and `packages/components-vue/dist/index.d.ts`, which
  are untracked build output absent from a fresh clone. Resolve it, or record why it stands.

## 9. Maintenance disposition

Sprint 182 was locked to absorb none of `#1315`–`#1322`, and it absorbed none. Sprint 183 takes
exactly two, both consumer-visible one-liners:

- `#1316` — a stale note at `packages/mcp-server/src/lib/dtcg-intake/index.ts:777` ships on
  `brand.intake`'s wire calling `brand.intake` deferred.
- `#1317` — `docs/how-forge-works.html:379` still advertises a "25-tool roster"; the real count is 26.

`#1315` and `#1318`–`#1322` remain carried, unabsorbed, and named. `#1315` still owes the gate-1
bundle rebuild and the four exact-SHA re-vendor follow-ups. They must close before an integrated
public release; they do not hide inside generation missions.

## 10. Failure and change protocol

- If the measured saved-schema inventory differs materially from §5's assumptions, capture the exact
  evidence and resolve it under §5's two named outcomes before changing this memo.
- If one framework cannot meet the contract without changing the shared artifact contract, record the
  conflict. Do not lower one framework's gate silently.
- If a clean consumer requires a workspace path, repository source, existing install, user npm
  config, or undeclared dependency, the gate is failed.
- If the interaction proof cannot be shown to go red when the behavior is removed, it does not count
  as passing — a vacuous assertion is a failed gate, not a green one.
- If the work spans sessions, close only the active mission checkpoint and hand off exact state. The
  sprint stays Active.

## 11. Build handoff

The build session starts fresh from this locked memo. It reads `agents.md`, runs `cmos_review()`,
enters a clean isolated Sprint-183 worktree from the planning commit, and begins `s183-m01`. It does
not re-plan the sprint, and it does not build from the Sprint-182 memo.

Sprint 183 is left Active at the end of the build. A separate review session decides genuine close.
