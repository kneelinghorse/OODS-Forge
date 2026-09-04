# Sprint 182 Decision Memo — Product Reality Foundation

**Status:** LOCKED — 2026-09-03 local date, after independent planning and fidelity review

**Planning session:** `PS-2026-09-04-002`

**Program authority:** CMOS decision `#1652`

**Sprint-lock authority:** CMOS decision `#1653`

**State-machine amendment:** CMOS decision `#1654`

**Program:** [Forge Product Reality Program](../foundational-docs/roadmap/product-reality-program.md)

**Closeout source:** [Forge Closeout Checklist](../foundational-docs/closeout-checklist.md)

**Baseline:** `ae560bc22969c1fd81336730be4330c9115fc316`

**Sprint:** `sprint-182`

**Owner of product decisions:** Derek

**Build rule:** A fresh build session executes this memo from a clean, isolated sprint worktree; it
does not reinterpret the shelved adoption memo or reuse the dirty planning checkout

**Authority boundary:** Derek affirmed the product outcomes and authorized Sprint-182 planning. The
package topology, exact first nucleus, compatibility dispositions, and mission order are the
reviewed execution plan being locked here; they are not described as earlier Derek quotes.

## 1. Decision

Sprint 182 establishes the smallest foundation that makes Forge's component and code-generation
claims materially true:

1. one canonical component truth plane for the current 109 unique IDs;
2. installable Forge-owned package foundations for component contracts, shared behavior, styles,
   React, and Vue;
3. an exact 14-component primitive nucleus implemented in React and Vue;
4. target-aware code generation that imports those real packages and fails loudly for an unavailable
   component/target pair; and
5. clean packed-consumer evidence for both framework targets.

React and Vue are equal product targets. Greenfield use is first-class. Brownfield mapping is
additive. HTML evidence cannot certify either framework.

This is a finite but substantial sprint: exactly 109 starting claims reconciled, exactly 14 canonical
component families implemented per framework, four required local package boundaries plus one
conditional shared-core boundary, one 12-cell public
codegen option matrix, and one closeout. It may span multiple build sessions, but its acceptance
criteria do not shrink merely to fit a session. A scope change requires a new Derek-approved CMOS
decision and a versioned memo revision before implementation continues.

## 2. Why this boundary

The attractive larger cut — all 109 components in both frameworks, a new versioned generated-artifact
protocol, and a complete Subscription workflow — combines at least three independently risky systems.
It would make review shallow and encourage another round of claims backed by partial evidence.

Sprint 182 instead proves the substrate and the most reused dependency nucleus. Every one of the 16
saved schemas currently uses `Stack`; the selected 14 cover layout, content, actions, status,
fields, tabbed navigation, and basic tabular data. The next increment can then change the generation
contract against real packages rather than inventing an artifact shape around fictional imports.

The full code-generation envelope and first complete workflow are sequenced, not canceled. They are
the next two independently planned increments in the active near roadmap.

## 3. Baseline that the sprint must replace with generated evidence

At the pinned baseline:

- the structured component artifact contains 109 unique IDs while its embedded
  `stats.componentCount` says 101;
- the static HTML renderer maps 98 IDs and falls back for 11;
- 12 catalog names exactly match the current root React export surface, while other React code uses a
  different taxonomy;
- no Vue runtime component package exists;
- the React and Vue source emitters import nonexistent `@oods/components`;
- all 16 saved schemas depend on `Stack`; and
- Code Connect reports no connected component records.

These are census facts about specific surfaces, not a judgment that existing research, traits,
schemas, renderers, or governance work has no value.

## 4. Locked execution contracts

### 4.1 Canonical identity and maturity

The current 109 unique component IDs are starting claims that must each be reconciled. They are not
pre-declared to be 109 independent runtime primitives. Every row receives exactly one proposed
classification: `native`, `recipe`, `alias`, `authoring-only`, `merged`, or `retired`. Recipes and
aliases must name what they resolve to, and every proposed row must cite executable or source
evidence. Because every classification can change the runtime denominator, none becomes effective in
the approved census until Derek approves the complete reconciliation artifact or a named amendment in
CMOS. Until then, the 109-row starting obligation ledger remains the controlling denominator. The
exact 14 Sprint-182 IDs are locked as required native framework families and cannot be reclassified
inside the sprint without a new Derek-approved memo revision. Counts and React/Vue denominators are
derived from approved memberships, never separately maintained prose.

The ledger exposes evidence for at least:

- contract/metadata;
- static HTML rendering;
- React implementation;
- Vue implementation;
- clean generated-consumer use;
- accessibility;
- supported brand/theme cells; and
- interaction/state behavior where applicable.

An unqualified `stable` or `production` label is invalid. An alias names its canonical implementation
and does not increase the implemented count. A fallback is recorded as a fallback. Outside the
Sprint-182 nucleus, evidence-derived states such as `implemented-unverified`, `partial`, and
`unavailable` remain distinct; existing code is never erased merely because it is not certified here.

### 4.2 Repository and package boundary

The active OODS-Forge repository is the implementation and integration source for this recovery.
The historical, push-disabled `upstream` OODS-Foundry remote is a reference and possible later public
mirror, not a second implementation target. Sprint 182 updates `agents.md` and `README.md` atomically
with this ownership rule so later agents do not recreate the split. Moving the canonical source again
requires a separately approved migration and reconciliation plan.

Sprint 182 creates or establishes these locally packable package boundaries:

- `@oods/component-contracts` — canonical registry, target capabilities, props, slots, events,
  accessibility contracts, and shared scenarios;
- optional `@oods/component-core` — created only if behavior/normalization is genuinely consumed by
  both frameworks;
- `@oods/component-styles` — token-driven component CSS and brand/theme contracts;
- `@oods/components-react` — React implementations and exports; and
- `@oods/components-vue` — idiomatic Vue 3 implementations and exports.

The packages must build and pack locally. A packed artifact may not depend on `workspace:*`, a root
`src/` path, undeclared transitive dependency, or consumer Tailwind scanning. Adding Vue and its
build/test tooling necessarily moves the lockfile; that movement is declared scope, not a surprise.

Existing React implementations are moved behind, or re-exported from, one canonical implementation.
They are not copied into a second divergent tree. Existing import paths may receive documented
compatibility shims when needed.

Four packages are required. `component-core` is not created as an empty scaffold. `s182-m01` owns
`component-contracts`, the shared scenario fixtures, the complete initial
`component-styles` contract/CSS, and any target-neutral interfaces. `s182-m02` and `s182-m03` modify
only their framework packages and compatibility shims. A change to shared files discovered during a
framework mission blocks both framework branches; it never reopens completed `m01` because Completed
is terminal in CMOS. Capture the evidence and create the next narrowly scoped shared amendment mission
(`s182-m01a`, then `m01b`, if needed) with `Requires m01`. Every not-yet-completed affected downstream
mission gains a `Requires` edge to that amendment. If an affected framework mission is already
Completed, create a suffixed repair mission for that framework and make `m04` require it; do not
rewrite terminal history. A semantic, public-contract, or scope change also requires Derek approval
and a versioned memo/CMOS amendment before work resumes. If both packages require the same
target-neutral logic, the shared amendment creates `component-core` and both consume it; otherwise
the behavior remains framework-native. This preserves the parallel DAG without speculative
abstraction or overlapping ownership.

### 4.3 Exact primitive nucleus

The sprint implements exactly these 14 canonical IDs in both packages:

`Badge`, `Banner`, `Button`, `Card`, `Checkbox`, `DatePicker`, `Grid`, `Input`, `Select`, `Stack`,
`Table`, `Tabs`, `Text`, and `Textarea`.

The cross-framework contract is locked at the semantic level below. React and Vue expose idiomatic
bindings for the same semantics; existing framework-only escape hatches may remain documented
extensions but do not become parity requirements.

| ID | Minimum canonical semantics | Locked compatibility / implementation disposition |
|---|---|---|
| `Badge` | content; status/domain or explicit tone; subtle/solid emphasis; optional decorative icon | Inline noninteractive status label; existing React status registry remains the starting implementation |
| `Banner` | title/detail/content; status/domain or tone; emphasis; actions; optional dismiss event and label | Critical tone announces as `alert`; other tones as `status`; dismiss is a real button |
| `Button` | content; intent; size; disabled; activation; native button type | Defaults to `type="button"`; React `asChild` remains a compatibility extension, not a Vue parity requirement |
| `Card` | default content; elevated state; semantic/native attributes | One container primitive; no invented header/footer family in this sprint |
| `Checkbox` | stable id/label; checked/default state; required/disabled; help/validation; change/update event | Native checkbox semantics; indeterminate is recorded unsupported unless implemented and tested in both targets |
| `DatePicker` | Input field contract plus date value/default, min, max, and step | Native `type="date"` with ISO `YYYY-MM-DD` values; composes canonical `Input`; no custom calendar claim |
| `Grid` | content; columns or minimum-column width; gap; align/justify | Token/CSS-grid layout primitive; responsive behavior comes from its declared CSS contract |
| `Input` | stable id/label; type; value/default; placeholder; required/disabled/read-only; help/validation; input/change | Canonicalizes the existing React `TextField` implementation; `TextField` remains a non-counting compatibility alias to the same implementation |
| `Select` | stable id/label; value/default; required/disabled; option content; help/validation; change/update | Native select semantics in this nucleus; no custom combobox claim |
| `Stack` | content; row/column direction; gap; align; justify; wrap | Maps the saved schema's `stack` and `inline` layout modes to one flex-layout primitive |
| `Table` | caption, head, body, rows, header cells, data cells; density; optional selectable row activation | Semantic compound family; its named subparts are package exports but do not inflate the one canonical `Table` census row |
| `Tabs` | item id/label/panel/disabled; selected/default id; size; overflow label; change event; accessible label | Canonical public API remains item-driven; codegen normalizes UiSchema child panels into items; overflow helper/Popover is private package implementation, not a fifteenth public component |
| `Text` | content; semantic element; size; weight | Defaults to `span`; only safe supported intrinsic elements are emitted from governed schemas |
| `Textarea` | Input field contract plus rows and text value/default | Native textarea semantics with the same field metadata and validation contract |

Shared scenarios in `component-contracts` encode at least one nondegenerate state and event for each
row; a self-closing tag with no content or interaction cannot satisfy the scenario.

### 4.4 Named readiness predicates

The ledger distinguishes three states so code generation does not certify itself:

- `emissionEligible` is a preflight input produced by `m02` or `m03`. It requires the versioned
  contract plus a concrete target package implementation, export, public declaration, dependency
  closure, and passing framework-native scenario evidence. It does not require generated-consumer
  evidence and is not a release claim.
- `codegenUsable` is derived only after `m04` proves generation against the packed target artifacts.
- `foundation-v1` is derived only after the complete Sprint-182 evidence set below and separate
  review. Neither of the first two states implies it.

Sprint 182 defines the versioned ledger predicate `foundation-v1`. A component-target cell satisfies
it only when all of the following evidence is present:

1. reconciled canonical classification and versioned semantic contract;
2. concrete package export and public declarations with dependency closure;
3. shared nondegenerate scenario plus framework-native render, mount, and event evidence;
4. required semantics, keyboard/focus behavior, and automated accessibility checks;
5. visual-regression evidence for brand A and B across light, dark, and high-contrast cells, with no
   unresolved token or consumer source scan;
6. responsive evidence at phone, tablet, and desktop widths plus a separate review of spacing,
   hierarchy, legibility, focus/hover/disabled/error states, clipping, overflow, and table/form use;
7. SSR or framework-equivalent server render;
8. fresh packed-package import; and
9. Sprint-182 codegen evidence: source parse/compile and dependency resolution for all 12 public
   framework × styling × TypeScript option cells, plus fresh isolated install, strict typecheck,
   production build, SSR/render, mount/hydration, CSS resolution, and interactions for the default
   `tokens` + TypeScript React and Vue cells.

No skipped or environment-blocked check can derive `foundation-v1=true`. This is a narrow,
target-specific readiness state, not the later public `release` profile and not an unqualified
`production-ready` claim. The one-way transition is literal: `m02`/`m03` record
`implemented-evidence-complete` and `emissionEligible`; `m04` derives `codegenUsable`; `m05` derives
`foundation-v1-candidate`; only the separate independent review promotes a candidate to
`foundation-v1`.

### 4.5 Framework parity

Parity means the same semantic contracts, states, scenarios, tokens, and accessibility outcomes —
not byte-identical DOM or framework mimicry. React uses idiomatic controlled/uncontrolled props and
events. Vue uses idiomatic Vue 3 props, slots, events, and `modelValue` / `update:modelValue` where
appropriate, with no React, Radix, or RJSF runtime dependency.

### 4.6 Code-generation boundary

This sprint corrects target selection and imports. React output imports
`@oods/components-react`; Vue output imports `@oods/components-vue`; styles/tokens resolve from real,
declared Forge artifacts. A known component whose target cell is not `emissionEligible` returns the
new registry error `OODS-N015` (`not_found`, message `Component target unavailable`,
`retryable: false`) with no warning-only fallback. The existing output schema remains unchanged. The
exact failed response is `status: "error"`, the requested `framework`, `code: ""`,
`fileExtension: ""`, `imports: []`, and `warnings: []`; `meta` retains `nodeCount` and
`componentCount` and omits `unknownComponents`. `errors` contains one existing-shape issue per
affected node:

```json
{
  "code": "OODS-N015",
  "message": "Component <component> is not emission-eligible for <framework>; evidence state: <state>.",
  "nodeId": "<node-id>",
  "component": "<component>"
}
```

Affected-node errors are deterministically ordered by node traversal and component ID. This error is
distinct from the existing unknown-component failure: a known but unready row is not placed in
`meta.unknownComponents`. `pipeline` propagates `OODS-N015` as the codegen-stage error and never
returns a successful code payload for that request.

Sprint 182 proves only the target/package foundation of generation and labels it accordingly; it does
not claim the full generated artifact satisfies the program's future release definition. The existing
public output schema remains compatible. The versioned multi-file
artifact envelope, exact dependency manifest, validation-profile wire format, typed action protocol,
and generalized saved-schema compiler belong to the next increment.

## 5. Mission slate and dependency graph

```text
s182-m01 ──> s182-m02 ──┐
    │                    ├──> s182-m04 ──> s182-m05
    └──────> s182-m03 ──┘
```

All arrows mean “required by.” CMOS dependency rows use the literal orientation
`dependent -> prerequisite` with type `Requires`: `m02 -> m01`, `m03 -> m01`, `m04 -> m02`,
`m04 -> m03`, and `m05 -> m04`. `m02` and `m03` may proceed in parallel only after `m01` freezes
their shared files and gate manifest.

### s182-m01 — Canonical component truth plane and package foundations

**Objective:** Establish one deterministic registry and the required package boundaries so every later
implementation and claim resolves to the same identity and contracts.

**Acceptance criteria:**

1. A machine-readable intake registry contains exactly 109 unique, deterministically sorted starting
   IDs and derives its starting count as 109. A reconciliation artifact classifies every row as
   `native`, `recipe`, `alias`, `authoring-only`, `merged`, or `retired`; its derived runtime census is
   a separate proposed value. No classification changes the controlling 109-row denominator until
   Derek approves the complete reconciliation artifact or a named amendment in CMOS.
2. Every starting row reports separate metadata/HTML/React/Vue/generated-consumer capability using
   evidence-derived states. The selected 14 have complete v1 contracts; other rows retain truthful
   states such as `implemented-unverified`, `partial`, or `unavailable` rather than a blanket zero.
3. A generated baseline reproduces the measured surface membership, including HTML 98 mapped / 11
   fallback, 12 exact root React-name matches, zero Vue runtime implementations, and empty Code
   Connect records. If implementation reveals a counting bug, work stops for a memo/CMOS correction
   rather than rewriting history silently.
4. `catalog.list` exposes additive, target-specific evidence without breaking its current contract;
   any legacy global status is documented as HTML-only until removed by a versioned change.
5. Structured-data refresh derives identities from the canonical registry and cannot add or delete a
   component because a trait or prose string happened to resemble an ID.
6. `component-contracts` contains the locked 14-row semantic contracts and shared nondegenerate
   scenarios; stories/scenarios identify components with an explicit `oodsComponentId`, and prose
   matching is not accepted as connection evidence.
7. `component-styles` contains the complete token/CSS contract needed by both framework missions for
   all six brand/theme cells. Shared files and ownership boundaries are frozen before m02/m03 start.
8. The `foundation-v1` predicate is executable and can only be derived from the nine named evidence
   classes in §4.4.
9. The four required packages build and pack as foundations; `component-core` also builds and packs if
   the two-consumer condition created it. Packed manifests contain no workspace protocol, root-source
   dependency, or undeclared runtime import.
10. `agents.md` and `README.md` state the recovery ownership boundary consistently with §4.2.
11. `cmos/planning/forge-s182-foundation-gate-manifest.md` binds every B-01…B-15 bite in §6 to its
    test/fixture path, literal selector or mutation recipe, expected selected/failed count, required
    build/re-pin step, and evidence destination before framework implementation begins.
12. Negative tests fail when an ID is dropped or duplicated, the stale count `101` is restored, a
    surface is falsely promoted, a story relies on prose-only matching, or `foundation-v1` is derived
    with one evidence class absent.

**Evidence:** intake registry and reconciliation digests; approved census record; package manifests
and tarball inventories; shared contracts/scenarios/styles; gate manifest; targeted tests with
selected/failed counts; mutation table.

**Deliverables:** canonical intake registry and reconciliation ledger; four required package
foundations and an optional two-consumer core package; versioned 14-row contract/scenario/style
assets; `forge-s182-foundation-gate-manifest.md`; consistent ownership language in `agents.md` and
`README.md`.

### s182-m02 — React primitive package

**Objective:** Ship the exact 14-component nucleus as one real React package without duplicating the
existing component system.

**Acceptance criteria:**

1. `@oods/components-react` exports exactly one canonical implementation for each of the 14 IDs with
   public declarations and no false aliases.
2. Existing implementations are moved/re-exported or wrapped through the locked compatibility
   dispositions in §4.3; `Input` is canonical, `TextField` is its non-counting legacy alias,
   `DatePicker` composes `Input`, `Tabs` keeps its item API with private overflow/Popover machinery,
   and `Table` subparts remain one family. `Grid` and `Stack` are concrete implementations.
3. Shared scenarios cover layout, content, action, status, field, data, and navigation behavior.
4. Required semantics are proven, including labels/help/errors, required and disabled states,
   controlled events, `Button` defaulting safely to `type="button"`, Banner announcement behavior,
   native table semantics, and Tabs keyboard/focus behavior.
5. The package renders and produces owned visual-regression baselines in brand A and B across light,
   dark, and high-contrast modes using the frozen shared CSS/tokens without consumer source scanning.
6. Typecheck, unit/interaction, SSR or server-render, mount, accessibility, story/scenario, build,
   pack, and packed-import checks pass with no skipped gate represented as a pass.
7. Removing an export, token/CSS dependency, label/error association, keyboard binding, or declared
   package dependency makes a named negative test fail.
8. The mission does not alter frozen shared contracts/scenarios/styles silently and does not mark a
   global production state. It records all 14 React cells as `implemented-evidence-complete` and
   `emissionEligible` pending m04 clean-consumer/codegen evidence.

**Deliverables:** `@oods/components-react` source/types/exports; root compatibility shims; React
stories and scenario/interaction/a11y/VRT suites; locally packed tarball inventory and evidence.

### s182-m03 — Vue primitive package

**Objective:** Ship the same semantic nucleus as an idiomatic, independent Vue 3 package.

**Acceptance criteria:**

1. `@oods/components-vue` exports Vue implementations for the same exact 14 IDs with public types.
2. It declares Vue as a peer dependency and contains zero React/Radix/RJSF runtime dependency.
3. Props, slots, events, validation states, and shared scenarios match §4.3 while using idiomatic Vue
   semantics. Input/DatePicker, item-driven Tabs with private overflow machinery, and the Table family
   retain the same compatibility dispositions without importing React implementations.
4. Semantic DOM, keyboard/focus behavior, form labels/errors, table semantics, Banner announcements,
   and Tabs navigation meet the same outcome gates as React.
5. The same six brand/theme cells work through frozen `@oods/component-styles` and produce owned
   visual-regression baselines without consumer source scanning.
6. Typecheck, unit/interaction, SSR, mount, accessibility, scenario, build, pack, and packed-import
   checks pass with no skipped gate represented as a pass.
7. Removing an export, event emit, CSS dependency, keyboard binding, label/error association, or
   declared package dependency makes a named negative test fail.
8. The mission does not alter frozen shared contracts/scenarios/styles silently and does not mark a
   global production state. It records all 14 Vue cells as `implemented-evidence-complete` and
   `emissionEligible` pending m04 clean-consumer/codegen evidence.

**Deliverables:** `@oods/components-vue` source/types/exports; Vue scenario/interaction/a11y/VRT
suites; locally packed tarball inventory and evidence; parity report against the shared contracts.

### s182-m04 — Target-aware codegen and clean packed-consumer proof

**Objective:** Prove Forge can emit usable source for the implemented nucleus in isolated React and
Vue projects.

**Acceptance criteria:**

1. React and Vue generation import their actual framework package; emitted style/token imports and
   dependency declarations resolve to real packed artifacts.
2. Preflight checks every requested component/target pair against the ledger's `emissionEligible`
   evidence. A row without that state returns the exact `OODS-N015` response in §4.6; membership
   outside the 14 alone is not falsely equated with nonexistence. `codegenUsable` is derived only
   after this mission's consumer evidence passes.
3. The existing codegen response contract remains compatible for successful supported requests.
4. Temporary React and Vue consumers are created outside workspace resolution, install freshly
   packed local artifacts without npm authentication or user registry configuration, and begin with
   no reusable `node_modules`.
5. The public nucleus matrix covers every combination of framework (`react`, `vue`) × styling
   (`inline`, `tokens`, `tailwind`) × TypeScript flag (`true`, `false`): 12 option cells. Every cell
   passes source parse/compile and dependency checks; the default token+TypeScript React and Vue cells
   additionally pass the full clean install, strict typecheck, production build, SSR/render,
   mount/hydration, CSS resolution, and interaction path.
6. Each of the 14 IDs has a nondegenerate fixture exercising the §4.3 content/state/event contract;
   empty self-closing tags cannot satisfy the matrix. The saved
   `packages/mcp-server/.oods/schemas/tier1-acceptance-sub-detail.json` is also used as a bounded
   four-component (`Card`, `Stack`, `Tabs`, `Text`) compatibility proof; this is not represented as a
   generalized schema compiler.
7. The default token+TypeScript consumers render a `foundation-v1-showcase` screen using all 14
   families with working field/button/tab/row interactions. The closeout preserves inspectable local
   build artifacts and brand/theme screenshots at phone, tablet, and desktop widths; Sprint 182
   therefore ends with something Derek can run and see, not only package substrate.
8. Identical governed inputs generate byte-identical source and evidence metadata across repeated
   runs under the same toolchain.
9. All direct caller families are dispositioned explicitly: supported-nucleus `code.generate` and
   Tier-1 fixtures remain successful; HTML remains behaviorally unchanged and is regression-tested;
   `pipeline` propagates the codegen stage's typed error without returning a successful code payload;
   object/viz fixtures that request an unready component assert `OODS-N015` until that target becomes
   `emissionEligible`; golden/parity/token-injection fixtures are classified and updated by operand,
   never wholesale re-baselined.
10. `viz.compose`/Chart, object-codegen, schema-ref, Tier-1 Subscription, styling, JS/TS, and bridge E2E
   callers identified by repository search each appear in the migration ledger with old expectation,
   new expectation, and test path. No former success silently disappears.
11. Removing a tarball, package export, declared dependency, CSS entry, or target import makes the
   relevant clean-consumer gate fail. Restoring warning-only fallback for an unavailable target also
   fails a named test.
12. Passing evidence derives `codegenUsable` for the exact 14 React and 14 Vue target cells; it does
   not derive `foundation-v1-candidate` or `foundation-v1`.

**Deliverables:** target-capability preflight and real imports; caller/test migration ledger; 12-cell
codegen option matrix; isolated React/Vue consumer harnesses; runnable `foundation-v1-showcase`
builds/screenshots; deterministic output and mutation evidence.

### s182-m05 — Product-reality closeout and independent-review handoff

**Objective:** Reconcile every Sprint-182 claim to executable evidence and prepare a separate reviewer
to decide genuine close.

**Acceptance criteria:**

1. A gate table is generated from `cmos/foundational-docs/closeout-checklist.md`: one result for every
   current `CI-01`…`CI-15` row and every `L-01`…`L-09` row, with source-block hashes, all tokens
   instantiated, literal commands/environment, measured tree, pasted output, and every skip or
   platform limit disclosed. Heavy suites run in the canonical sequential order.
2. The intake ledger reports exactly 109 starting rows and a classification for every row. It derives
   the runtime census and reports React 14 / Vue 14 `foundation-v1-candidate` cells; all other cells
   retain their actual `implemented-unverified`, `partial`, `unavailable`, alias, recipe, or
   authoring-only evidence rather than a fabricated blanket state. Only the separate review promotes
   candidates to `foundation-v1`.
3. Tarball names/digests/inventories, clean-consumer logs, generated output hashes, accessibility and
   interaction results, and every mutation bite are assembled into one reproducible evidence index.
4. Catalog, documentation, and release-facing claims are regenerated from the ledger. No prose
   describes an unproved surface as stable, implemented, supported, or production-ready.
5. The final changed-path inventory is regenerated from the actual diff and reconciled to declared
   scope, including the expected lockfile movement and any pre-existing user changes.
6. `decisionCount >= 1` is verified for every non-descoped mission; suite-count deltas, snapshots,
   regenerated files, lockfile movement, and re-hashed artifacts are attributed to their owning
   mission. `CI-12` scale, `CI-09` brand cascade, root typecheck, frozen-lockfile install,
   `tests/contracts tests/viz`, and enum convergence remain explicit rows rather than inherited prose.
7. The closeout records the live disposition and owner for maintenance items `#1315`–`#1322`; none is
   silently completed, dropped, or absorbed into this sprint.
8. Any advertised schema/description/registry/policy movement triggers the canonical `L-06` rebuild,
   bridge restart/health check, and reconnect message; an empty diff records `NO R-d` with its output.
9. Build work starts and ends in a clean, isolated Sprint-182 worktree created from the locked
   planning commit. The separate planning checkout's pre-existing user changes are recorded but never
   admitted as dirt in the sprint checkout. All deliverables are committed before session
   completion, commits name the mission IDs, the sprint branch is pushed, and the final changed-path
   inventory is regenerated from the actual clean checkout and pushed tip.
10. The closeout queues the runnable-generation increment for the next planning session but does not
   assign or create its sprint before independent review.
11. The linked build `cmos_session` is completed with exact next steps before handoff; `MEMORY.md` and
   the Sprint-182 closeout report are updated with commit, branch, evidence index, skips, and open
   findings. The build session stops without marking the sprint complete. A separate review session
   reruns the charter below and either genuine-closes or returns repairs.

**Deliverables:** instantiated CI-01…CI-15/L-01…L-09 gate record; final capability ledger and claim
diff; artifact/digest evidence index; maintenance disposition; final changed-path inventory;
Sprint-182 closeout report; updated `MEMORY.md`; completed build-session record; pushed clean branch;
review handoff with no self-certification.

## 6. Test and evidence architecture

The implementation may choose the repo-conforming runner, but must preserve these layers:

| Layer | Required proof |
|---|---|
| Contract | registry schema, uniqueness, count derivation, target matrix, props/slots/events |
| Package | build, declarations, exports, dependency closure, tarball inventory, packed import |
| Behavior | shared scenarios plus framework-native interaction and focus tests |
| Visual system | brand A/B × light/dark/high-contrast, token/CSS resolution, no source scan |
| Accessibility | semantics, names/descriptions, errors, keyboard, focus, announcements |
| Generation | target preflight, real imports, deterministic output, typed failure |
| Consumer | fresh install, strict typecheck, production build, SSR/render, mount/hydration, interaction |
| Discrimination | one named negative or mutation bite for each material gate |

Each evidence row records the command/selector, selected count, failed count, skipped count, artifact
or log path, and digest where applicable. A denominator inferred from a whole suite is not a substitute
for the exact selected membership.

The following bite IDs are locked now; `m01` binds them to concrete carrier paths and literal
invocations in the gate manifest before implementation starts:

| Bite | Required discriminating mutation |
|---|---|
| `B-01` | Drop or duplicate one starting catalog ID; uniqueness/membership gate reds |
| `B-02` | Restore independent `componentCount: 101`; derived-count gate reds |
| `B-03` | Promote one surface with its evidence missing; capability and `foundation-v1` derivation red |
| `B-04` | Remove an explicit `oodsComponentId` and leave prose only; story linkage reds |
| `B-05` | Remove one React export or its declaration; exact nucleus/package gate reds |
| `B-06` | Break one React field label/error association; accessibility scenario reds |
| `B-07` | Remove one React Tabs keyboard binding; interaction scenario reds |
| `B-08` | Remove one Vue export or its declaration; exact nucleus/package gate reds |
| `B-09` | Remove one Vue `update:modelValue`/change emission; interaction scenario reds |
| `B-10` | Remove one Vue Tabs keyboard binding; interaction scenario reds |
| `B-11` | Request a component/target without `emissionEligible` and restore warning-only source emission; typed preflight gate reds |
| `B-12` | Remove one packed tarball/package export; isolated install or import reds |
| `B-13` | Remove a declared dependency or CSS export; clean production build/CSS resolution reds |
| `B-14` | Perturb repeated governed generation; byte/digest determinism reds |
| `B-15` | Swallow a codegen target error in `pipeline`; stage/error propagation gate reds |

A mutation that cannot change its named assertion is recorded as non-discriminating and repaired; it
is never counted as a pass.

## 7. Explicit non-goals

Sprint 182 does not include:

- implementing component families beyond the exact 14-component nucleus (the other 95 starting rows
  are reconciled and evidence-labelled, not blanket-declared nonexistent);
- the versioned code-generation file-set envelope or validation-profile wire contract;
- the complete Subscription workflow or its next high-use component wave;
- public npm/registry publication, GitHub release, `.mcpb`, OCI, or licensing resolution;
- hosting Forge or deploying a shared service;
- Figma, Penpot, MCP Apps, custom-canvas, or Synthesis Workbench implementation;
- `schema.ingest` or the shelved adoption-rung work;
- visualization renderer expansion, token-system redesign, or HTML-renderer redesign;
- consumer-specific external integration or validation; or
- folding Sprint-181 follow-ups `#1315`–`#1322` into component missions.

These exclusions define sequence, not a reversal of the product program.

## 8. Failure and change protocol

- If the census or package topology differs materially from the baseline, stop and capture the exact
  evidence before changing this memo.
- If one framework cannot meet the contract without changing the shared semantic contract, record the
  conflict; do not lower only one framework's gate silently.
- If a clean consumer requires a workspace path, root source, existing install, user npm config, or
  undeclared dependency, the gate is failed.
- If implementation requires changing the public codegen response shape, defer that change to the
  next increment unless Derek approves a versioned memo/CMOS amendment.
- If the work spans sessions, close only the active mission/session checkpoint and hand off exact
  state. The sprint stays Active.
- No success statement may omit a skipped, unrun, or environment-blocked check.

## 9. Independent review charter

The review session must start from `agents.md`, `cmos_review()`, this locked memo, the canonical
closeout checklist, the Sprint-182 gate manifest, and the final build
evidence. It independently verifies:

1. all 109 starting claims, their classifications, the approved runtime census, and surface counts
   from source;
2. four required packed artifact boundaries, any justified shared-core artifact, and their dependency
   closure;
3. exact 14-ID exports in both frameworks with no alias inflation;
4. semantic, interaction, accessibility, and six-cell theme evidence;
   the reviewer also inspects the responsive showcase at phone/tablet/desktop widths and records a
   craft verdict for spacing, hierarchy, legibility, interaction states, clipping, overflow, and
   table/form usability—snapshot stability alone is insufficient;
5. target-aware imports and typed unavailable-target behavior;
6. fresh React and Vue consumer installs and builds from the submitted tarballs;
7. deterministic generation and artifact digests;
8. every declared `B-01`…`B-15` mutation bite against the new control using the manifest's literal
   invocation and selected/failed counts;
9. ledger-to-documentation agreement; and
10. final diff scope, dirty-worktree attribution, skips, and unresolved findings.

Sprint 182 genuine-closes only if all ten review areas pass or a Derek-approved memo revision changes
the contract. The reviewer, not the build session, updates the sprint to Completed.

## 10. Build-session opener

The fresh build session should:

1. read `agents.md` and run `cmos_review()`;
2. create or enter a clean isolated Sprint-182 worktree from the locked planning commit, verify this
   memo is `LOCKED`, and record the separate planning checkout's dirty-worktree attribution without
   modifying it;
3. inspect exports, immediate consumers, generation code, catalog refresh, and test conventions before
   writing;
4. start `s182-m01`; and
5. checkpoint after each significant step with evidence, remaining work, and conflicts.

Do not use the shelved `forge-s182-adoption-rung2-decision-memo.md` as build authority.
