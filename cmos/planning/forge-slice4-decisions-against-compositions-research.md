# Slice 4 research read — decisions with stated applicability, checked against a composition

Sprint 205 m05 · 2026-09-18 · a memo, not code · roadmap `near.md` §8 slice 4 ("research in 205, slice after")

**Question** (the Meridian vision's two-filters example): a decision states where it applies; Forge checks it
against a composition and reports relevance, conflict, exception or non-applicability. What is the smallest honest
version of that for Forge, and what comes first?

**Answer in one paragraph.** Almost nothing in Forge's own decision record states applicability today — 2 of 179
active decisions, both in prose. So the first slice is not conflict detection; it is making applicability
*expressible* and *evaluated* in the smallest form: a selector over Forge's own vocabulary (objects, contexts,
components, traits), carried with a decision the caller already supplies to the preview, evaluated against the
composition, and reported with an outcome vocabulary that says **not applicable** and **cannot determine** apart
from **relevant**. Conflict needs a second thing — a checkable expectation — and comes after. The outcome shape is
not Forge's invention: W3C's ACT/EARL already standardise it, and Forge's result-state trait (m03) already matches
it one-to-one.

## Sources

Every claim below cites one of these.

| id | what | how read |
| --- | --- | --- |
| **F1** | CMOS `strategic_decisions`, Forge's own store, 179 active rows | `sqlite3` read-only, 2026-09-18 |
| **F2** | `objects/delivery/Decision.object.yaml` and `artifacts/product-reality/sprint-203/m02/README.md` | direct read |
| **F3** | `packages/mcp-server/src/lib/preview-context.ts` (Sprint 203 m05 context panel) | direct read |
| **F4** | `artifacts/product-reality/sprint-204/m04/observation.json` — its `rules`, `nature`, `requiresHumanAdjudication` | direct read |
| **F5** | `catalog.list` output schema (`packages/mcp-server/src/schemas/catalog.list.output.json`) | direct read |
| **F6** | `traits/core/Assessable.trait.yaml` (s205-m03) | direct read |
| **T1** | TraceLab report **DP-DR-001** "Design decision records and design rationale: prior art, current tools, and what they keep" — document `d44bec3e-f665-439d-bc78-bc5385a4610d` (231 sources, 25 verified) | `tracelab_search` + `tracelab_document`, existing research |
| **T2** | TraceLab mission **FORGE-S205-SLICE4-001** (`6b068c47-253e-4f3f-a9cb-09c4bb764b02`, project OODS Foundry Research), report document `48113e87-2844-40fa-9b59-3d8d9e2ab70c`, report `252be247-4661-48ae-ad1e-123e97b97313` (142 sources, 21 verified) | created and submitted through `tracelab_mission` / `tracelab_mission_execution` for this memo; read with `tracelab_document` |

TraceLab was used only through its tool surface; nothing was written into its repository. Its tools answered this
time — Sprint 204 m03 had recorded `hub control request failed`.

## 1. What Forge's own record says

**Almost no decision states where it applies** (F1). Of 179 active decisions, 22 (12%) contain any scope wording at
all ("applies to", "only when", "unless", "out of scope", …). Read one by one, 20 of those scope *sprint work or
process* ("Revisit only if…", "out of scope for this sprint"). **Two state where a rule applies in a design:**
`#2206` (a workflow composition offers no slot swaps, because an override applies to all four screens) and `#1980`
(Chunk composes only inline). Both are prose. **0 of 179 are structured**: the table has no applicability column,
`category` is empty on all 179, `evidence` is set on 1, and 141 carry no sprint (F1). 123 are `oods-foundry-mcp`
decisions from the project's earlier name, 56 `forge`.

**The Decision object cannot carry applicability honestly** (F2). It was born from `strategic_decisions` and models
only what that table writes. A field or trait for applicability would render empty on every one of 1,933 records —
exactly what Sprint 203's rule forbids (a screen cannot show a field that has never been written).

**The context panel already puts decisions beside a composition** (F3), keyed by object name or URN, each item with
its source, id, query and fetched-at, supplied by the caller because Forge opens no other product's store. What it
cannot say: whether an item applies to *this* screen, or to only part of it. Every item keyed to the object is shown
the same way.

**The shape for disputable interpretation already exists** (F4). The observation record carries its `rules` in plain
language ("A screen belongs to a compared object when its resource segment is the object name or its plural") beside
its rows, `nature: evidence for review`, and `requiresHumanAdjudication: true` — Stage1's own flag for "never an
instruction". A reviewer can dispute a rule because it is written down next to what it produced.

**What catalog_list exposes to attach to** (F5): per component, `name`, `categories`, `tags`, `contexts`, `regions`,
`traits`, `status`, `maturity`, `productReality`. No field says why a component exists or where it must not be used.

## 2. What the outside evidence says

**Prior art keeps applicability as free text** (T1). ADR/MADR, QOC and design-system "decision records" record
context, options and consequences; MADR adds an optional *Confirmation* ("how compliance can be verified"). None of
the 2024–2026 design tools retrieved binds a decision to its applicability conditions and evidence as fields — a
scoped absence claim, bounded to the pages retrieved. The documented failure mode is capture cost: the producer pays,
a future consumer benefits, so records go stale (T1 §3.1, §8).

**Checking tools split applicability, outcome and exception — and only one family has honest outcomes** (T2):

| tool | applicability expressed as | says "not applicable" apart from "passed"? | exception carries reason / owner / expiry? |
| --- | --- | --- | --- |
| W3C ACT Rules 1.1 | a required applicability field; test targets derive from it | **yes** — `inapplicable`, `passed`, `failed`, `cantTell`, `untested` | no waiver model |
| W3C EARL 1.0 | assertion + test subject/criterion | **yes** — same five (+ `incomplete`) | no |
| Spectral | JSONPath `given`, `formats`, glob `overrides` | no — silence is ambiguous | `off` override; none of the three |
| Open Policy Agent | Rego predicates over JSON | only if the author builds it | author-defined |
| ArchUnit | fluent `that()` predicates | no (JUnit pass/fail) | freeze baseline; none of the three |
| Stylelint | globs, `overrides`, ignore files | no | disable comment with a reason only |

Three findings carry the design (T2 §5–6):
1. **Only ACT/EARL make non-applicability and "cannot tell" first-class.** Everything else reduces to pass/fail plus
   severity, where silence can mean passed, did not match, or switched off.
2. **No tool retrieved records a waiver with reason, owner and expiry together.**
3. **Mechanical checking stops early, by the checkers' own account**: an ACT rule passing means "no corresponding
   failures were detected", not conformance; full satisfaction needs a person (W3C "About ACT Rules", in T2 [7]).

**Convergence with this sprint.** Forge's `core/Assessable` (F6, authored in m03 before this research ran) is EARL's
outcome set under Forge's names: `violation`↔`failed`, `passed`↔`passed`, `needs_review`↔`cantTell`,
`not_applicable`↔`inapplicable`, `not_measured`↔`untested`. Two independent routes arrived at the same five, and the
result-family rule (never red, never green) already governs how they render.

## 3. The smallest honest form of applicability

**Applicability is a selector over Forge's own vocabulary, carried with the decision, evaluated against the
composition:**

```
appliesTo: { objects?: [name|URN], contexts?: [card|list|detail|form|timeline|inline|workflow],
             components?: [catalog name], traits?: [trait name] }      — all present keys must match
statement: the plain-language applicability, kept beside the selector for the human reader (ACT's required field)
```

Evaluated by walking the composition Forge already has (its object, context, placed components, composed traits).
Outcome per decision, in the Assessable/EARL family:

- **relevant** — every present key matches; the report names *what* matched (the node ids / components);
- **not applicable** — a key does not match (this composition is not what the decision is about);
- **cannot determine** — the selector names something Forge does not hold (a component or trait not in the
  registry), so Forge says so rather than guessing either way.

That is expressible for both real design decisions in the record today: `#2206` = `{ contexts: [workflow] }`;
`#1980` = `{ objects: [Chunk] }`.

**Where it lives — a record beside the composition, not a Decision field and not a trait.** CMOS is the system of
record and Forge never writes to it (roadmap §8); a Decision field or trait would render empty on every real record
(F2). So applicability travels **with the decision the caller supplies** — an optional `appliesTo` + `statement` on a
context item, carrying the same provenance every item already must (F3) — and, for Forge's own components and
recipes, in **a Forge-owned binding record** (decision source+id, the component or recipe, the selector, the
statement, when it was bound). If CMOS later stores applicability itself, the Decision object gains the field then,
born from use.

**What "attach decisions to recipes and components" means concretely** (§8's wording):
- `catalog_list` detail gains a `decisions` block per component or recipe, read from the Forge-owned binding record:
  source, id, title, statement, selector. "Why this exists, where it applies" — shown, never enforced.
- `design.preview`'s context panel shows each supplied decision with its outcome for *this* composition and what
  matched, in the neutral result family. Not-applicable items are shown as such (collapsed, not hidden): staleness and
  non-applicability are information (F3's own rule).

**What conflict detection would need beyond that.** Applicability says *where*; conflict needs *what must hold
there* — an **expectation** Forge can evaluate against the composition (ACT's "expectations"; MADR's
"Confirmation"). E.g. `#2206`'s expectation: "every slot in a workflow version has exactly one candidate" — checkable
against the stored version today. Then the report grows **conflicting** (expectation fails where applicable) and
**excepted** (a recorded exception covers it). Two more things conflict needs that nothing retrieved provides:
(1) an **exception record with reason, owner and expiry** (T2: no tool has all three), and (2) expectations that are
honest about their reach — most decisions are not mechanically checkable (T2 finding 3), so an expectation-less
decision stays at relevance and never gets a verdict.

## 4. What the existing shapes already settle

- **Never an instruction.** Stage1's `requires_human_adjudication` and Sprint 204's `nature: evidence for review`
  (F4) settle that an outcome is information a person judges. A conflict, when it exists, is shown beside the design;
  it never blocks a composition, edits it, or opens a task.
- **The rule is shown with the outcome.** The observation record's `rules` block (F4) is the precedent: a
  relevance outcome prints the selector and statement that produced it, so a reviewer can dispute the selector rather
  than the verdict.
- **Provenance on everything shown.** A decision carries source, id, query and fetched-at (F3); the binding record
  carries who bound it and when; the evaluation carries the composition version and when it ran (`core/Provenanced`).
- **Result family.** Relevant / not applicable / cannot determine render as Assessable's family — never red, never
  green (F6). Relevance is not a pass.

**Out of scope by name:** autonomous reconciliation; a universal approval queue or approve/reject; Forge writing
applicability (or anything) into CMOS; scoring decisions; any outcome that changes a composition.

## 5. Ranked candidates for Sprint 206

Grounded in the reads above; smallest first.

1. **Applicability on supplied decisions, evaluated in the preview.** Optional `appliesTo` + `statement` on
   `contextItems`; Forge evaluates each against the composition and stores the outcome (relevant / not applicable /
   cannot determine, with what matched) on the version; the panel shows it on both surfaces. Proven with the two real
   design decisions (`#2206` on a workflow version, `#1980` on Chunk) plus one decision that is not applicable to the
   screen shown. Cost: `preview-context.ts`, the panel renderer, one refusal for a malformed selector. *Nothing new
   is read from any store.*
2. **Decisions attached to components and recipes in `catalog_list`.** A Forge-owned binding record (decision
   source/id, component or recipe, selector, statement, bound-at), validated against the catalog so a binding naming a
   missing component fails its generator's `--check`; surfaced in `catalog_list` detail. Seed only with bindings a
   direct read supports — starting from the decisions that name a component (the F1 read found none that do so
   structurally; the first bindings are authored from the two above and from this sprint's own m02/m03 decisions).
3. **Expectations and conflict, for decisions that can carry one.** An optional machine-checkable expectation over
   the stored version, EARL outcomes (passed / failed / cantTell / inapplicable / untested) shown as evidence, plus
   the exception record with reason, owner and expiry. Only after 1 is proven on a real screen.

**Descope ladder for 206:** the conversation surface for the relevance panel falls back to the browser page; the
`catalog_list` binding (2) falls back to the preview evaluation (1) alone; (3) is never pulled into 206 if 1 is not
certified. **Never cut from (1):** "cannot determine" as its own outcome, the selector and statement printed with the
outcome, provenance on every item.

## 6. Open questions this memo does not settle

- Whether CMOS should grow an applicability column is CMOS's decision, not Forge's; Forge's design works either way.
- Whether decisions from the earlier project name (`oods-foundry-mcp`, 123 of 179 active) are in scope for binding;
  the F1 read suggests most are process decisions and would evaluate as not applicable to any screen.
