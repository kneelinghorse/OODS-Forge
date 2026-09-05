# Near Roadmap

**Status:** ACTIVE — program decision `#1652`; Sprint-183 lock decision `#1664`

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

## Current measured state — Sprint 183 build handoff

| Claim area | Current evidence | Near-horizon obligation |
|---|---|---|
| Component catalog | 109 unique IDs; 98 runtime rows and 11 authoring-only rows remain a proposal, while 28 independently reviewed foundation cells are promoted | Derek approval of the full runtime census remains separate |
| React | The installable package exports the exact 14-component foundation nucleus; the saved-schema consumer passes the eight runnable gates | Independent review of the Sprint-183 handoff |
| Vue | The installable package exports the same 14-component nucleus without React, Radix, or RJSF runtime dependencies; the same eight consumer gates pass | Independent review at the same bar as React |
| Generation | Target-aware output is a versioned, content-addressed file set with exact dependencies, typed actions, and named validation profiles | Review the runnable contract and evidence before genuine close |
| Saved designs | All 16 records are vendored; genuine `compose-7d860337` compiles for React and Vue, while the other 15 report typed per-target gaps | Start later breadth work from the recorded unblock ranking, not a blended pass rate |
| Visualization | 13 admitted types; five complete the folded certified path | Close public render/certification gaps before widening claims |

Counts describe the named surface only. HTML evidence is not React or Vue evidence, a source emitter
is not a runtime package, and an admitted chart name is not rendered output.

## Increment 1 — Sprint 182: Product Reality Foundation — CLOSED 2026-09-04

Sprint 182 is complete, 7/7 missions, nothing descoped. It was reviewed independently by
`PS-2026-09-04-004` (decision `#1662`) with the evidence re-executed rather than read, and Derek
promoted `foundation-v1` the same day (decision `#1663`): all 28 cells — 14 components across React
and Vue — now satisfy the named profile.

Two facts from that close carry forward and shape Increment 2. The controlling obligation
denominator remains **109** and `approvedRuntimeCensus` remains **null**, so the 98-row runtime
census is still a proposal awaiting Derek. And promotion runs through a separate reviewer-approval
record that the closeout generator consumes, which keeps builder self-promotion structurally
impossible; that mechanism is generalized in Sprint 183.

Its build authority was
[forge-s182-product-reality-foundation-decision-memo.md](../../planning/forge-s182-product-reality-foundation-decision-memo.md).

It delivered:

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

## Increment 2 — Sprint 183: Runnable Generation — BUILT, REVIEW PENDING

Sprint 182's independent review is resolved, so this increment is numbered. Its build authority is
[forge-s183-runnable-generation-decision-memo.md](../../planning/forge-s183-runnable-generation-decision-memo.md),
locked by decision `#1664` at planning baseline `ca8d84bbce165b656fd5cd83cc097c28fa774f19`.

The build handoff delivers a versioned generated file-set artifact with exact dependencies,
deterministic content and render hashes, typed event/action bindings, and explicit `draft`, `build`,
and `release` validation profiles. The genuine pre-sprint `compose-7d860337` schema installs, builds,
renders, hydrates, resolves shared CSS, and passes discriminating interactions in clean React and Vue
consumers. These are builder evidence claims; a separate review session still decides genuine close.

Planning measured the starting point by executing the real emitter rather than reading it, and two
results shaped the scope. Emission is **already** byte-deterministic and imports **already** resolve
to the real packages, so the sprint declares and gates properties it does not need to build. But the
payload is still one source string with a versionless flat `imports` array, and a bound action really
does ship `const handleSave = () => { /* TODO: implement handleSave */ };` — an empty body that no
interaction test can pass. Ending that blank stub is the sprint's load-bearing problem, split into
Forge-owned behavior which is generated for real and domain actions which become typed, declared,
required injection points.

The exit-gate schema must be one that already existed in Forge's saved-schema store before the
sprint. Authoring a fresh schema that happens to use exactly the fourteen implemented components
would prove nothing.

This is deliberately separate from Sprint 182. Changing the code-generation contract while creating
two component libraries would make the first sprint too large to review honestly.

## Increment 3 — First Complete Greenfield Workflow

Number this sprint only after Sprint 183 receives independent review.

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

Sprint-181 follow-ups remain Forge-owned maintenance debt under decision `#1651`; they do not
masquerade as product-foundation work. Sprint 183 resolves consumer-visible defects `#1316` and
`#1317`. Items `#1315` and `#1318`–`#1322` remain explicitly carried and unabsorbed; they must close
before an integrated public release.

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

## Review handoff

The next fresh session is an independent Sprint-183 review. It reads `agents.md`, runs
`cmos_review()`, checks the locked Sprint-183 memo and the `s183-m06` evidence handoff, replays the
named controls from a clean worktree, and decides whether the sprint genuinely closes. It does not
infer approval from the builder's completed mission status, and it does not begin Increment 3 until
that separate decision exists.
