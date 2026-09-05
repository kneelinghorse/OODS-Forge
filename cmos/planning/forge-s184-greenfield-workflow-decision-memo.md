# Forge Sprint 184 — First Greenfield Workflow + Sprint 183 Remediation

**Status:** LOCKED — planning session `PS-2026-09-05-003`, 2026-09-05.
**Program authority:** [Product Reality Program](../foundational-docs/roadmap/product-reality-program.md) — Increment 3.
**Predecessor:** Sprint 183, reviewed by `PS-2026-09-05-001`, determination **DO NOT CLOSE** (decision `#1689`).
**Per-mission detail lives in CMOS**, not here. This memo carries scope, the exit gate, the settled
decisions, and the descope ladder.

## 1. What this sprint is

Two things, both of them because Derek said both belong in it:

**(a) Increment 3** — the Subscription workflow made real in React and Vue, against saved schemas
that already existed. **(b) Remediation of the Sprint 183 review** — blockers B1 and B2, carries
C1–C15, and the reconnect notices two vendored consumers never got.

## 2. Measured starting point

Executed during planning against the real emitter at `ab0d712d`. These are facts, not estimates.

| Surface | Measured now |
|---|---|
| Subscription generation | **All six contexts fail at the default profile in both frameworks — `codeLen=0` in every one of 12 runs.** This sprint does not extend a working pipeline. |
| Component gap | Exactly 8 ids block the two schemas, identical for React and Vue: StatusBadge, PriceBadge, StatusTimeline, AuditTimeline, CancellationSummary, SearchInput, PaginationBar, RelativeTimestamp. All 8 have executing HTML renderers (128 LOC / 9 functions) and sit in the 109-row baseline. This is a port. |
| Contract gap | Porting is necessary but **not sufficient**: after pruning every non-nucleus node both schemas still fail with 6 fatal `OODS-V007` on nucleus components. |
| `timeline` step | Needs **zero** new components and still fails — `Prop "label" is not in the canonical Text contract`. Forge's composer emits a prop Forge's contract rejects. |
| States | Of the exit gate's seven, exactly **one** (validation) exists, on 5 of 14 components. `uiElement` is `additionalProperties:false` with zero occurrences of `state`. The props escape hatch is closed — `props.loading` is a hard build error. |
| Emission gate | **Enforces nothing.** A readiness row naming an export that does not exist returns `emissionEligible:true`; StatusBadge was unblocked live with zero implementations written. |
| Evidence retention | `git check-ignore` on a hypothetical `sprint-184/m01/foo.log` already returns `.gitignore:34`. This sprint would lose its own logs. |

## 3. Anti-circularity

The subjects pre-exist by six months: `subscription-list-dark` (`compose-bc4ef63a`) and
`subscription-detail-dark` (`compose-a710f0a9`), both 2026-03-15, with
`tier1-acceptance-sub-detail` (`compose-7d860337`, 2026-03-05, anchored to git object `6c93e644`)
as the green control. **The saved schemas are never edited.** Where a schema and a contract
disagree, the contract moves.

## 4. Settled decisions

- **#1693** — the six off-contract facts resolve **per prop kind**. `Select.placeholder` and
  `Text.label` are render props: widen the contract *and* the React/Vue prop types, and render them.
  `Stack.patternComponent` + `Stack.fields` are a **composition directive** and get **implemented** —
  widening alone is accept-and-discard, which is a silent lossy normalization and therefore fatal at
  build under `#1673`. The two binding-kind failures are validator fixes with rendering criteria.
- **#1692** — the eight ship as a **separate non-nucleus union** on new package subpaths.
  `foundation-v1` stays at 14 components / 28 cells and its bound promotion record is untouched.
  Promotion of the eight is a later, separate reviewer event.
- **The capability baseline is not edited.** A separate overlay carries the eight components' surface
  truth. Proven by execution: flipping one non-nucleus cell makes `--check-promotion` throw
  *"Generated promotion projection is stale"*, and the only repair rewrites the bound record its own
  `integrityRule` forbids. A stale-looking baseline is a known, disclosed consequence; reconciling it
  is Derek's.
- **The Sprint-183 screen-scope rule is deliberately reversed.** Both emitters currently skip
  screen-scoped bindings, and both exit-gate schemas declare all bindings on the screen root — which
  is why the measured binding-marker count is zero and why Sprint 183's interaction proof could only
  ever be harness-authored. Screen-level declared actions now get generated call sites. This changes
  a documented decision, on purpose, with its reason recorded.

## 5. Exit gate

From the program authority, verbatim: *"The same semantic workflow is usable in both frameworks with
loading, empty, error, and success states."* From the near roadmap: *"The same semantic workflow must
work in React and Vue without consumer-authored replacement components."*

**Sprint 184 discharges this PARTIALLY and must say so in those words.** It ships the
**list → detail** half with loading, empty, error and success. `edit/cancel` and `timeline` are out —
no pre-existing Subscription schema carries them, and authoring one would be the circularity the
increment exists to avoid. Confirmation and permission-aware are out — no primitive exists in the
109-row baseline. The claim is never restated as the full-flow gate met.

## 6. Descope ladder

Declared at lock, not improvised. Every rung preserves a two-step workflow.

1. **Cut the `loading` state.** Ship empty, error, success — Banner already compiles at build on both
   targets at critical, success and neutral. Loading has no rendering today.
2. **Substitute the detail operand.** Fall back to `tier1-acceptance-sub-detail`, which compiles green
   today with zero ported components. Cuts the detail *subject*, not the detail *step*.
3. **Port the eight as-is** without fixing the two measured recipe defects (PriceBadge's currency
   variant collision, CancellationSummary stringifying a boolean), disclosed as carried.
4. **Reduce m06's bites** from all eight gates × 2 targets to hydration, interaction-evidence and
   server-render × 2, with the remaining five declared unproven by name.
5. **Reduce C7/C8/C9** from enforced tooling fixes to recorded disclosures.

**Never cut:** m01 in full — without it the sprint's own evidence is silently discarded, proven at
HEAD today. m02's ref-resolving emission gate — without it any component can be declared eligible
with nothing behind it. No list-tranche component — cutting one drops a whole screen.

## 7. Out of scope

Publication, hosting, registry. Any design-surface adapter. Visualization breadth. `schema.ingest`.
Movement of the 109-row denominator. Approval of the 98-row runtime census. Promotion of the eight
into `foundation-v1`. `#1315` and `#1318`–`#1322` stay carried and named, unabsorbed.

## 8. Planning honesty

This slate went through grounding by execution, three candidate slates, three judges, and three
critic passes. The first two critic rounds each found real defects — a fix aimed at a symbol that
could not carry it, a baseline edit that breaks the bound promotion chain, and a contract widening
that would have been accept-and-discard. The third round was stopped before it returned; its input
decisions are folded in above. **No critic has returned ACCEPT on this slate.** The known-open
concerns are recorded in `dereks-calls` below rather than presented as settled.

## 9. Open, and Derek's

- **What Sprint 184 builds from.** `Forge-expansion` at `8ce34907` is not viable — Increment 3 depends
  on Sprint 183's generation work. Fast-forwarding to `ab0d712d` is clean (direct ancestor, no merge
  commit) and fixes three closeout rows that are structurally broken from a worktree, at the cost of
  moving uncertified work onto the working branch.
- **Whether a surface-cell edit counts as denominator movement.** The overlay routes around this for
  one sprint without answering it.
- **The freeze needs a sanctioned forward path.** Sprint 182's promotion freeze was built to stop a
  builder rewriting history. It now also blocks component breadth: every future breadth sprint will
  hit it. That is a question about the machinery, not about this sprint.
