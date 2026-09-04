# Near Roadmap

**Status:** ACTIVE — program decision `#1652`; Sprint-182 lock decision `#1653`

**Updated:** 2026-09-04

**Scope:** The next three independently reviewed increments

**Program authority:** [Forge Product Reality Program](product-reality-program.md)

## Direction

OODS Foundry and Forge must function as one usable design system and agent toolchain Derek can use to
build real work. Greenfield output is a first-class requirement. Mapping into an existing company
system remains valuable, but it cannot substitute for Forge-owned components, runtime artifacts, or
working generation.

The prior Shopify-serving roadmap and the schema-ingest version of Sprint 182 are retained in Git and
CMOS as history. They no longer control this queue. The current program does not ratify MCP Apps,
Figma, Penpot, or a custom canvas; surface selection follows runnable product foundations.

## Current measured gap

| Claim area | Current evidence | Near-horizon obligation |
|---|---|---|
| Component catalog | 109 canonical component claims; the proposed reconciliation partitions them into 98 runtime rows and 11 non-runtime rows, all pending Derek approval | Keep 109 as the controlling obligation denominator until Derek approves the proposal or a named amendment |
| React | Exactly 14 surface cells are `foundation-v1-candidate`; none is `foundation-v1` | Separate independent review decides whether the 14 candidates may be promoted |
| Vue | Exactly 14 surface cells are `foundation-v1-candidate`; none is `foundation-v1` | Separate independent review decides whether the 14 candidates may be promoted |
| Generation | React imports `@oods/components-react`, Vue imports `@oods/components-vue`, and both import `@oods/component-styles/css`; unavailable component/target pairs fail with typed `OODS-N015` | Preserve the real target-aware imports and typed failure through the runnable-generation increment |
| Saved designs | 16 schemas, all using `Stack` | Make their common primitive nucleus executable |
| Visualization | 13 admitted types; five complete the folded certified path | Close public render/certification gaps before widening claims |

Counts describe the named surface only. The 98/11 partition is a proposal, not an approved denominator
change; `foundation-v1-candidate` is review input, not `foundation-v1`. HTML evidence is not React or
Vue evidence, and an admitted chart name is not rendered output.

## Increment 1 — Sprint 182: Product Reality Foundation

Sprint 182 is the active first build increment. Its build authority is
[forge-s182-product-reality-foundation-decision-memo.md](../../planning/forge-s182-product-reality-foundation-decision-memo.md).

It delivers:

1. reconciliation proposals for all 109 current catalog claims and a surface-specific truth plane;
   the 109-row obligation denominator changes only after Derek approves the reconciliation artifact
   or a named amendment in CMOS;
2. required package foundations for contracts, styles, React, and Vue, with a core package created
   only if both frameworks consume real shared logic;
3. the exact 14-component primitive nucleus in both frameworks:
   `Badge`, `Banner`, `Button`, `Card`, `Checkbox`, `DatePicker`, `Grid`, `Input`, `Select`,
   `Stack`, `Table`, `Tabs`, `Text`, and `Textarea`;
4. the target/package foundation for code generation, with loud failure when the requested target is
   not `emissionEligible`; and
5. clean, isolated React and Vue consumers that install freshly packed local artifacts and compile,
   build, and render the generated nucleus.

The exact 14-component boundary is finite even if the implementation spans more than one build
session. Nothing is silently removed to make the sprint appear complete.

Current Sprint-182 evidence supports exactly 14 React and 14 Vue `foundation-v1-candidate` cells for
that nucleus. Candidate status remains pending a separate independent review; it does not pre-approve
either framework surface as `foundation-v1`. The 109-row reconciliation likewise remains a proposal:
98 runtime rows and 11 non-runtime rows, with Derek approval required before the controlling
denominator changes.

## Increment 2 — Runnable Generation

Number this sprint only after Sprint 182 receives independent genuine-close review.

It delivers a versioned generated file-set artifact with exact dependencies, deterministic content
and render hashes, typed event/action bindings, and explicit `draft`, `build`, and `release`
validation profiles. At least one saved Forge schema must install, build, render, hydrate, and pass
interactions in clean React and Vue consumers.

This is deliberately separate from Sprint 182. Changing the code-generation contract while creating
two component libraries would make the first sprint too large to review honestly.

## Increment 3 — First Complete Greenfield Workflow

Number this sprint only after the runnable-generation increment receives independent review.

It delivers the high-use components and behavior needed for a complete Subscription workflow:
list → detail → edit/cancel → timeline, including loading, empty, error, validation, confirmation,
success, and permission-aware states. The same semantic workflow must work in React and Vue without
consumer-authored replacement components.

The review of this increment determines whether component breadth, current visualization closure, or
an adapter evaluation creates the most useful next artifact. The longer program table is dependency
guidance, not a pre-ratified total order.

## Gates that apply to every increment

- Claims come from executable evidence, never catalog prose or research conclusions.
- React and Vue are equal targets; framework-specific behavior stays idiomatic.
- Packed-consumer tests use no workspace alias, repository source import, existing `node_modules`, or
  user registry configuration.
- An unsupported target fails with a typed gap; warning-only fallback is not success.
- Exploratory work may use advisory validation. Production/release artifacts must pass the declared
  enforced profile.
- Every significant failure mode receives a negative test or mutation bite capable of proving the
  gate is discriminating.
- Automated snapshots prove stability, not design quality; an independent review inspects responsive
  craft and interaction states before a greenfield artifact is called usable.
- A build session records evidence and stops. A separate review session decides genuine close.
- Public publishing, hosting, and paid external API use require explicit later decisions.

## Parallel obligations and parks

Sprint-181 follow-ups `#1315`–`#1322` remain Forge-owned maintenance debt under decision `#1651`;
they do not masquerade as Sprint-182 component work. Every planning/closeout session reviews their
status, and Sprint 182 closeout records an explicit disposition. They must close before an integrated
public release.

The following are parked until their named dependency is met:

- full remaining component breadth — after the first complete greenfield workflow;
- closure of all current visualization recipes — after component/generation foundations are stable,
  unless independent staffing permits parallel work;
- visualization breadth beyond the current 13 — after the public render and certification path is
  coherent;
- Figma, Penpot, MCP Apps, or another design-surface adapter — after Forge artifacts are runnable and
  the adapter's capabilities, costs, auth, and write semantics can be evaluated honestly;
- public package publication or hosted Forge delivery — after licensing, distribution, and operating
  cost decisions; and
- `schema.ingest` — historically shelved by `#1649`; decision `#1652` retains the shelving result
  while superseding its incorrect surface claim, so it has no place on the active critical path.

## Planning handoff

The next fresh session enters a clean isolated Sprint-182 worktree from the locked planning commit,
reads `agents.md`, runs `cmos_review()`, reads the program and the locked Sprint-182 memo, and begins
`s182-m01`. It does not re-plan the sprint from the old adoption memo or reuse the dirty planning
checkout.
