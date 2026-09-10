# Forge Product Reality Program

**Status:** ACTIVE — product direction authorized by CMOS decision `#1652`; sprint architecture is
locked separately per increment

**Planning authority:** CMOS decision `#1652`, captured in untagged session `PS-2026-09-04-001`

**Baseline:** `ae560bc22969c1fd81336730be4330c9115fc316`

**Scope:** Multi-sprint program; sprint boundaries are set only after the preceding increment is independently reviewed

**Near-horizon companion:** [near.md](near.md)

## Why this program exists

Forge's documented capability claims outran the work a person could actually build with. The
immediate failure was not positioning. It was product reality: catalog names without installable
implementations, generated source with a fictional package import, chart paths that returned specs or
placeholders instead of public pixels, and maturity labels that did not name the surface they proved.

This program makes every retained claim executable. Research, semantic models, governance, and
certification remain valuable, but none substitutes for a usable artifact. Derek explicitly affirmed
the product outcomes: greenfield usefulness, real React and Vue components, a state-of-the-art
generation pipeline, broad real chart rendering, and selectable validation that becomes mandatory at
production boundaries. Package topology, increment order, and adapter mechanics below are planning
decisions or hypotheses, not retroactively attributed quotes.

The prior Shopify-serving near roadmap and the shelved Sprint-182 schema-ingest draft remain historical
inputs. They no longer control sequencing. The specific choice of MCP Apps, Figma, Penpot, or another
interactive surface is not ratified; it remains a later adapter decision after Forge can produce real
work.

## Product contract

OODS Foundry is the design system. Forge is the agent-facing composition, generation, rendering, and
assurance toolchain through which Derek and agents design and build with it. The repository boundary
does not reduce the product obligation.

For this recovery, the active, writable OODS-Forge repository is the canonical integration source for
the new package implementations and evidence. The `upstream` OODS-Foundry remote is a reference and
possible later public-release mirror; it is not a second tree that Sprint 182 edits in parallel. This
working ownership decision follows the measured repository state: the upstream tip is historical,
push is disabled, and the active source snapshot and product tooling live here. A later repository or
publication split requires an explicit migration decision and byte-level reconciliation.

Forge must support both paths:

1. **Greenfield:** generate and run a new interface using Forge-owned components, tokens, behavior,
   and artifacts without asking the user to implement missing pieces.
2. **Brownfield:** map or adapt the same semantic contracts into an existing system. This is additive,
   not the definition of the product.

React and Vue are equal product commitments. HTML, A2UI, design-tool, and other projections are
reported independently and may not be used as evidence for React or Vue.

## Non-negotiable truth rules

### A component is real only when

- its canonical identity, props, slots, events, token roles, states, and accessibility behavior are
  versioned;
- the named framework package exports a concrete implementation or an explicit, non-inflating alias
  to one concrete implementation;
- the implementation renders, responds to its required keyboard and pointer interactions, and works
  across the supported brand/theme cells;
- its shared scenario fixtures, accessibility checks, and package-level tests pass; and
- a clean consumer can install a packed Forge artifact and import it without a workspace alias,
  repository source path, or user-supplied replacement.

A recipe or composite is legitimate only when it resolves to real rendered behavior. An alias cannot
inflate the census, and a fallback cannot be called an implementation.

### Generated output is real only when

- every emitted import resolves to a Forge-owned artifact or an explicitly declared peer dependency;
- the requested target is checked before emission and an unavailable target fails with a typed error;
- a clean, isolated consumer can install, typecheck, build, render, and exercise the result;
- repeated identical inputs produce byte-identical governed outputs and hashes; and
- the output states which validation profile ran and what was not checked.

### A chart is real only when

- the named recipe resolves to a canonical capability vector and data contract;
- a named rendering surface returns visible pixels, not a placeholder;
- a normalized spec or engine configuration may count as a usable runtime artifact on its own ledger
  cell, but never as evidence that pixels were rendered;
- Dashboard, static output, React, and Vue support are reported separately;
- theme, accessibility, determinism, and accuracy evidence names the actual rendered operand; and
- an unsupported combination returns a typed gap naming the missing topology, mark, transform,
  interaction, or adapter.

### Maturity is surface-specific

There is no unqualified global `stable` status. The capability ledger reports evidence separately for
contract, HTML, React, Vue, generated-consumer, Dashboard, static render, accessibility, theme,
interaction, determinism, and certification surfaces. A summary status may be derived only from a
named release profile.

## Measured starting point

The following is the program baseline, measured at the commit above. Sprint 182 replaces these prose
figures with a generated, membership-bearing ledger.

| Surface | Measured state | Required correction |
|---|---|---|
| Component catalog | 109 unique rows; embedded `componentCount` is 101 | One canonical registry; count derived from membership |
| Static HTML | 98 renderer mappings; 11 fallback paths | Per-ID evidence; fallback never called stable |
| React | 12 catalog names exactly intersect the current root export surface; additional React code exists under a different taxonomy | Real `@oods/components-react` package and explicit reconciliation |
| Vue | Source emitter exists; runtime component package has 0 implementations | Real `@oods/components-vue` package |
| Code generation | React and Vue emit imports from nonexistent `@oods/components` | Target-aware imports, capability preflight, clean-consumer proof |
| Saved schemas | 16 saved schemas; all depend on `Stack` | Make the common dependency nucleus real first |
| Visualization | 13/13 public SVG in light/dark × A/B; 11/11 admitted types drawn; contrastPassed light/dark for 9 categorical types, [] for 4 exempt; 5 certified / 8 uncertified; area placed on Subscription/detail | Sprint 191 BUILT, REVIEW PENDING; HC pixels deferred (#1851); registry/census is the capability source |
| Dashboard HTML | 11/11 admitted types drawn through the shared SVG renderer; chord and flow_map excluded (#881) | Capability cells derive from viz-recipes.v1.json and its public-handler census |
| Code Connect | No connected component records | Remain explicitly empty until real connections exist |

### Existing inspectable surfaces and the missing loop

Forge is not starting from zero presentation code. The repository already contains a self-contained
Dashboard HTML path in `packages/mcp-server/src/tools/dashboard.render.html.ts`, the shared document
renderer in `packages/mcp-server/src/render/document.ts`, review/wireframe/branded-mockup/boxes-arrows
emitters under `packages/mcp-server/src/codegen/`, `fidelity.preview`, Storybook, and the local MCP
bridge on port 4466. These are useful render and inspection surfaces; none alone is the destination
product loop.

What is still missing is durable semantic work-in-progress state, live rerender after a human or agent
change, identity-preserving reconciliation of edits back into the object, assurance beside the exact
rendered operand, and approval/history. This gap inventory establishes the later adapter problem
without selecting Figma, Penpot, MCP Apps, a custom canvas, or any other surface now.

## Initial recovery architecture

The Sprint-182 package boundary is a reviewed execution choice, not a permanent product axiom:

- `@oods/component-contracts` — canonical component registry, target capabilities, props/slots/events,
  accessibility contracts, and shared scenarios;
- optional `@oods/component-core` — created only when framework-neutral normalization or behavior has
  two real consumers;
- `@oods/component-styles` — token-driven component CSS and brand/theme contracts;
- `@oods/components-react` — React implementations and public exports; and
- `@oods/components-vue` — Vue implementations and public exports.

The build must not create abstractions with no real consumer. Four package boundaries are required;
`component-core` is conditional and is not created as an empty placeholder. Shared logic moves there
only when React and Vue both exercise it. Framework lifecycle, refs, portals, focus, and event binding
remain framework-native.

Existing React implementations move or become compatibility shims around one canonical package
implementation; they are not copied into a second divergent tree. Vue receives idiomatic Vue 3
components and no React/Radix/RJSF dependency.

Local, Forge-owned packed artifacts are the first distribution proof. Public npm, registry, `.mcpb`,
OCI, licensing, and hosted delivery remain explicit later decisions. The already-claimed `@oods`
scope is not permission to publish.

## Validation profiles

Exploratory design must not be forced through production certification. The durable direction is
three explicit profiles rather than one ambiguous boolean:

- **draft** — structural validation and advisory findings; low-fidelity or incomplete work may
  continue with its gaps visible;
- **build** — target/package/props/slots/events checks; unresolved imports and silent fallbacks block;
- **release** — build checks plus real rendering, interaction, accessibility, theme, determinism,
  performance, and applicable certification gates.

The exact wire shape is decided in the codegen increment. Internally, validation scope, enforcement,
fallback policy, and target remain separate axes even if the public API offers named profiles.

## Destination vision

Forge's destination is an agent-native design-and-build system, not another chatbot embedded beside a
canvas and not a static report card. The shared semantic work-in-progress artifact is the source of
truth. An agent or human changes that artifact, a chosen code or design surface rerenders it, assurance
reports against the exact rendered operand, and approval/history preserve why it changed.

The intended loop is:

1. compose a real object or visualization from versioned traits, policies, data contracts, and tokens;
2. render the same semantic state through a runnable React, Vue, or approved design-surface adapter;
3. let Derek or an agent adjust content, layout, state, behavior, or data binding;
4. reconcile the proposed delta back into the canonical artifact with stable identities and history;
5. run advisory checks while exploring and the named enforced profile when producing a release
   artifact; and
6. emit installable code/runtime artifacts whose evidence and provenance travel with them.

Forge's differentiation is the governed round trip between semantic intent, real rendered work, and
production artifacts. Figma, Penpot, MCP Apps, or a local file-backed surface may participate, but none
defines the product and none is chosen by this vision. The first adapter is a later decision gate based
on capability, auth, cost, metering, write semantics, and the artifacts Forge can already produce.

## Program sequence

The sequence is dependency-driven. Only Sprint 182 is numbered here; later sprint numbers are assigned
after independent review of the preceding increment.

| Increment | Outcome | Exit gate |
|---|---|---|
| Direction and truth reset | This program, a rewritten near roadmap, corrected CMOS records, and a locked Sprint-182 memo | Product direction and surface uncertainty are recorded without invented ratification |
| Sprint 182 — component foundation | Reconcile the 109 current catalog claims; establish four required package foundations plus conditional shared core; implement the exact 14-component nucleus in React and Vue; add target-aware codegen and clean packed-consumer proof | After separate review, 14/14 React and 14/14 Vue cells satisfy the named `foundation-v1` profile; all other rows retain evidence-derived states; generated nucleus builds without aliases |
| Runnable generation | Versioned file-set artifact, exact dependency manifest, deterministic hashes, validation profiles, typed events, and the first saved-schema greenfield artifact | A saved Forge schema installs, builds, renders, hydrates, and passes interactions in clean React and Vue consumers |
| First complete greenfield workflow | High-use behavior nucleus and the Subscription list → detail → edit/cancel → timeline flow | The same semantic workflow is usable in both frameworks with loading, empty, error, and success states |
| Component breadth waves | Status/labels; search/filter/navigation; forms/editors; timelines; address/authz/preferences/communication; lifecycle/financial; visualization controls | Every reconciled native/recipe claim resolves truthfully in React and Vue; aliases and authoring-only rows do not inflate coverage |
| Current visualization closure | One recipe/artifact registry for the current 13; at least one public pixel path for each; truthful Dashboard/static/React/Vue/theme/a11y/certification cells | 13/13 current recipes render visible public output; the separately approved surface profile, not a blanket parity assumption, defines release closure |
| Visualization breadth | Existing 21 patterns promoted; versioned taxonomy and a ratified Core Analytics Profile spanning statistical, temporal, financial, hierarchy, network, flow, geo, and scientific families | 100% of the census classified; 100% of the core profile surface-complete; extension gaps typed |
| Design-surface adapter decision | Evaluate MCP Apps, Figma, Penpot, and local/file-backed options against runnable Forge artifacts | Derek selects, parks, or declines a first adapter with capability and cost evidence; a second adapter is required only if portability becomes an approved claim |
| Integrated release proof | Portable local distribution and reference applications exercise all retained claims | Every published claim is generated from current executable evidence; no false green survives mutation tests |

The table is dependency guidance, not a claim that every later row is already ratified. After runnable
generation, planning may pull current visualization closure or an adapter evaluation forward when it
creates the most useful next artifact. Component and visualization work may run in parallel only when
independent staffing exists; otherwise the critical path remains explicit and serial.

## Visualization destination

“Every chart known to man” is implemented as an extensible governed visualization compiler, not a
finite enum that will always be incomplete.

Every recognized chart name resolves to:

1. a named recipe or alias;
2. a capability vector covering data topology, marks, coordinate/layout, transforms, composition,
   interaction, output, and governance; and
3. either a governed artifact or a typed explanation of the missing primitive.

One `VizArtifact` envelope is the current architecture hypothesis for carrying normalized intent,
renderer specification, optional SVG,
theme/accessibility metadata, content/render hashes, and certification state. A recipe needs one
canonical rendering implementation; Forge does not duplicate every chart in every underlying engine
merely to raise a count.

## Design-surface boundary

MCP Apps, Figma, Penpot, and a file-backed/local surface remain candidates. No one of them is ratified
by this program. Forge does not build another general-purpose canvas before proving its own artifacts.

A future adapter must advertise its actual capabilities, authentication, seat requirements, rate
limits, and metering. Paid or usage-metered writes require an explicit user decision before execution.
Write-back semantics are decided with the adapter. The minimum gate is preview plus explicit approval,
stable identity, idempotency, history, and no silent rewrite of canonical Forge state.

TraceLab mission `76cf1b7b-55a4-4df4-80b6-5b53dd364b2f` remains evidence for the surface tradeoff,
with its `usable_with_warning` quality result retained. It informs the later adapter decision; it does
not define the product.

## Program exit criteria

The program does not close until all of the following are true:

1. Every one of the 109 starting catalog rows has an evidence-backed proposed classification
   (`native`, `recipe`, `alias`, `authoring-only`, `merged`, or `retired`), and Derek has explicitly
   approved the complete reconciliation artifact or each named amendment in CMOS before any
   classification changes the controlling denominator.
2. The approved runtime census is derived from those memberships rather than frozen prose. Every
   starting row has target-specific evidence and a truthful disposition; recipes and aliases name
   their resolution, and merges or retirements also carry compatibility treatment.
3. Every approved native or recipe target in the reconciled React/Vue census resolves and compiles in
   clean packed consumers; aliases do not inflate the denominator.
4. Every saved-schema node compiles and renders in both targets, or the schema has an explicitly
   approved retirement record.
5. `code.generate` emits no fictional import, workspace alias, repository path, blank action, or
   silent target fallback.
6. Draft work can proceed with disclosed gaps; build/release output cannot pass with an unresolved
   dependency or missing required evidence.
7. Every current chart type produces public pixels across its declared surfaces; the visualization
   census and Core Analytics Profile meet their published gates.
8. At least one complete greenfield application is generated and usable in React and Vue.
9. If an external design-surface write becomes an approved program claim, it is previewed, approved,
   idempotent, reconciled, and free of implicit cost.
10. Product documentation and catalog claims are derived from the same executable ledger that the
    release gates exercise.

“Usable” in these gates includes an independent responsive/craft review of the actual rendered
artifact. Screenshot stability alone cannot certify hierarchy, spacing, legibility, interaction
states, clipping, overflow, or task completion.

## Planning/build cadence

The program uses a repeating evidence loop:

1. A planning session reads the latest independent review, updates this program only if direction
   changed, and locks one bounded sprint memo.
2. A fresh build session enters a clean isolated sprint worktree from the locked planning commit,
   reads `agents.md`, runs `cmos_review`, starts the first queued mission, and builds only from the
   locked memo.
3. The build records exact evidence and stops without self-certifying.
4. A separate review session reruns the charter and either genuine-closes the sprint or returns
   concrete repairs.
5. Only after genuine close does the next planning session assign the next sprint number and mission
   slate.

If a sprint exceeds a single session, it remains open. Scope is not silently cut and incomplete work is
not renamed complete.

## Preserved obligations and explicit parks

- Sprint 191 m04 closes `#1318`–`#1322` with SR27, adapter-path checks, OODS-N013 descriptions,
  retaken DTCG/schema bites and the A --final pin. `#1315` remains pending until Sprint 192 sends the
  prepared final bundle re-pin notices after independent review. No delivery is inferred from assembly.
- The schema-ingest walker and `schema.ingest` draft remain historically shelved by `#1649`; active
  program decision `#1652` retains that result while superseding `#1649`'s incorrect surface claim.
- Public package publication remains gated on licensing and distribution decisions.
- HTML remains truthfully reported; whether it remains a production release target is decided before
  codegen closure. Until then it cannot substitute for React or Vue evidence.
- The design-surface choice is parked until runnable component and generation foundations exist.

## Preserved prior direction

- Agents using Forge through MCP remain the primary consumer path. This no longer means Forge may
  avoid producing runnable, human-inspectable artifacts for Derek.
- Typed structured visualization intent remains the supported input. The reverted free-text parser and
  uncommitted dimension registry do not re-enter scope without a new decision.
- The strategic assurance pillars remain accuracy, fidelity, contract-determinism, and
  accessibility-by-construction. They are distinct from any particular `artifact.certify` response
  fields and cannot substitute for rendered product capability.
- Local-first delivery is the recovery default. Hosting is permitted when justified and approved;
  public publication, licensing, and implicit paid external calls remain separate gates.
