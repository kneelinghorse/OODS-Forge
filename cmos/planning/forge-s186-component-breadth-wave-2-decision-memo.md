# Forge Sprint 186 — Component Breadth Wave 2: every saved design reachable

**Status:** LOCKED 2026-09-06 (planning session `PS-2026-09-06-003`). Derek confirmed the purpose in one sentence before this memo was written.
**Build base:** `5aa53b3a` — the Sprint 185 review head, tip of `codex/sprint-185-component-breadth-wave-1`.
**Worktree:** `~/.codex/worktrees/s186/OODS-Forge`, branch `codex/sprint-186-component-breadth-wave-2`, prepared by planning (install, tokens, packages, pkg:build).
**Predecessor:** [forge-s185-component-breadth-wave-1-decision-memo.md](forge-s185-component-breadth-wave-1-decision-memo.md) and its [review determination](forge-s185-review-determination.md). Everything in this sprint is the Sprint 185 pattern applied again, at four to five times the count, with the ceremony removed.

---

## 0. Purpose, in Derek's words

> Sprint 186 makes every saved design in the store generate and pass the consumer gates in both frameworks by porting the remaining 23 components and folding the ported set into the root, with the closeout cut to what already exists.

Derek's pace rule, verbatim in spirit: *appreciable progress every sprint, not a little work and a lot of measuring.* We are not serving production consumers or a million live users. The system is being rejected because it does not have usable parts, and we have claimed those parts for months. Every sprint now exists to close that gap. That does not license risky code — the per-component evidence bar from Wave 1 stays — it removes the measuring around the code.

**Exit gate.** 16 of 16 saved schemas in the vendored store generate green in React and Vue from live `code.generate`, and every applicable packed-consumer gate passes for the five newly reachable schemas in both frameworks. Governed components go from 27 in two unions to 50 in one.

## 1. Measured starting point (at `5aa53b3a`)

The reachability census (`cmos/planning/forge-s185-planning-probe/reachability-census.mjs`, re-run by planning with Wave 1 governed) leaves five schemas unreachable, blocked by exactly 23 components. Every one of the 23 already has an executing HTML renderer in `packages/mcp-server/src/render/component-map.ts` and a recipe row in the 109-row capability baseline with react/vue `unavailable`. None has React or Vue code anywhere in the tree.

| Schema (created) | Nodes | Missing | Interaction present |
|---|---|---|---|
| test-tagged-schema (2026-03-05) | 10 | ClassificationPanel, FilterPanel, PriceSummary | Tabs |
| user-detail-showcase (2026-03-16) | 10 | AddressCollectionPanel, MembershipPanel, PreferencePanel, TagManager | Tabs |
| user-list-showcase (2026-03-16) | 12 | AddressSummaryBadge, MessageStatusBadge, PreferenceSummaryBadge, RoleBadgeList, TagPills | Button, PaginationBar |
| user-timeline-showcase (2026-03-16) | 10 | AddressValidationTimeline, AuditEvent, MembershipAuditTimeline, MessageEventTimeline, PreferenceTimeline | Tabs |
| user-form-showcase (2026-03-16) | 12 | AddressEditor, PreferenceEditor, RoleAssignmentForm, StatusSelector, TagInput, TemplatePicker | `onChange` bindings on StatusSelector, TagInput, AddressEditor; Button; 16 binding keys |

**The props these schemas put on the 23 nodes are almost entirely recipe directives**, measured by walking the saved schemas:

| Component | Directives on the node (measured) |
|---|---|
| PriceSummary | amountField, currencyField, modelField, intervalField, taxBehaviorField |
| ClassificationPanel | categoriesField, tagsField, metadataField, modeParameter |
| FilterPanel | field, activeField, modeParameter, collapsibleParameter |
| TagManager | field, allowCustomParameter, allowListParameter, maxTagsParameter, moderationParameter |
| MembershipPanel | membershipsField, hierarchyField, roleField, permissionField |
| AddressCollectionPanel | field, roleField, defaultRoleField, roleParameter |
| PreferencePanel | preferencesField, metadataField, namespaceField |
| StatusSelector | field, optionsParameter, initialParameter, allowedTransitionsField, requireReasonParameter (+ onChange binding) |
| TagInput | field, maxTagsParameter, allowCustomParameter, allowListParameter, minLengthParameter, maxLengthParameter (+ onChange binding) |
| AddressEditor | field, roleParameter, allowDynamicParameter, defaultRoleField, label (+ onChange binding) |
| PreferenceEditor | namespacesField, documentField, registryNamespaceParameter |
| RoleAssignmentForm | availableRolesField, membershipField, defaultRoleParameter |
| TemplatePicker | templatesField, channelsField |
| MessageStatusBadge | statusesField |
| AddressSummaryBadge | field, label |
| PreferenceSummaryBadge | namespacesField, versionField |
| RoleBadgeList | rolesField, fallbackRoleParameter |
| TagPills | field, maxVisible, overflowLabel, label |
| AuditEvent | typeField, timestampField, timezoneParameter |
| AddressValidationTimeline | field |
| PreferenceTimeline | metadataField |
| MembershipAuditTimeline | field |
| MessageEventTimeline | messagesField, statusesField |

This is the CardHeader situation from Sprint 185 (decision #1738), 23 times over. Codegen lowers directives through `RECIPE_FIELD_TARGETS` (directive → runtime prop, per component) and `RECIPE_PARAMETER_PROPS` (consumed parameters) in `packages/mcp-server/src/codegen/binding-utils.ts` (around line 850–990), and `CROSS_TARGET_PROP_EXTENSIONS` in `target-contracts.ts` keeps directives out of the public prop set. `field` is already generic. **Every one of the 23 needs its directive map written from the HTML renderer's consumed keys** (for example PriceSummary reads `amount/currency/model/interval`; TagPills reads `tags/value/maxVisible/overflowLabel`; StatusSelector reads `options/states/value/status`). A directive whose target the HTML renderer does not read (`taxBehaviorField`, `moderationParameter`, and similar) is consumed and left unbound, and that is disclosed in the contract record, not invented into a prop.

Planning does not claim "pure port" this time. Wave 1 proved that inference wrong three times. The builder measures each schema's cells first and repairs what the measurement shows.

## 2. The port pattern (Sprint 185, reused as is)

Per component, in this order, all in the same commit per mission:

1. **Contract** in `packages/component-contracts/src/contracts.ts` at version `1.0.0`; id appended to `NUCLEUS_COMPONENT_IDS` in `types.ts`; a shared scenario in `scenarios.ts`. Props come from the HTML renderer's consumed keys plus what the schema puts on the node — never invented.
2. **Prop-value contract** entry in `packages/mcp-server/src/codegen/target-contracts.ts` (`PROP_VALUE_CONTRACTS`), the directive map in `binding-utils.ts`, and a `CROSS_TARGET_PROP_EXTENSIONS` entry when a directive must not leak as a public prop. Record totality on the three maps is what makes an unimplemented id fail for the right reason (Sprint 185 m01).
3. **Styles** in `packages/component-styles/src/components.css` + `COMPONENT_STYLE_IDS` in `index.ts`, token-driven across the six brand/theme cells.
4. **React** in `packages/components-react/src/breadth.tsx` (root export via `index.ts`, types in `types.ts`); **Vue** in `packages/components-vue/src/breadth.ts` (same). Idiomatic per framework; no React/Radix/RJSF dependency in Vue. Parity is a computed comparison in `packages/mcp-server/test/product-reality/parity.s185.spec.ts` (extend it), never two independent passes.
5. **Readiness rows** in `packages/components-react/evidence/react-readiness.v1.json` and `packages/components-vue/evidence/vue-readiness.v1.json`, six evidence classes resolving, checked by `scripts/product-reality/verify-readiness-refs.mjs`.
6. **Live proof** through `scripts/product-reality/s185-m04-live-consumers.ts` / `s185-m04-execute.ts`, extended to the schema list of this sprint. The harness derives the interaction from the schema (first Tabs → tab switch; first action → its control; first field → typed input reflected in state; none → `not-applicable`, excluded from the pass count and named). Reuse `s185-m03-export-mutations.mjs` for the delete-export bite per component and framework.

Evidence per mission is the existing package suites plus the product-reality specs the mission touches, and its schema's two live cell reports. **No four-suite capture per mission** (decision #1732 stands). Mission evidence lives under `artifacts/product-reality/sprint-186/mNN/` and is written by the existing build-record scripts, not new ones.

## 3. Missions

Serial DAG m01 → m02 → m03 → m04 → m05 → m06. Smallest cluster first so the first fully reachable schema lands within the first hour; the interactive form last. Each schema mission has the same gate: **its schema's React and Vue cells pass every applicable packed-consumer gate from live generation at profile=build, and each of its components has a red delete-export bite in both frameworks.**

### m01 — test-tagged-schema: ClassificationPanel, FilterPanel, PriceSummary (3) · 16/16 starts at 12/16

Measure first: run `code.generate` for `test-tagged-schema` at profile=build on react and vue and retain the response; the expected red is OODS-N015 on exactly these three ids. Port the three. PriceSummary already has a summary-section HTML pattern (`renderSummarySection`) and a sibling directive map for PriceBadge to copy from. Interaction: Tabs. Gate as above; reachability census re-run and retained showing 12/16.

### m02 — user-detail-showcase: AddressCollectionPanel, MembershipPanel, PreferencePanel, TagManager (4) · 13/16

Panels are read-mostly containers over object fields (memberships, hierarchy edges, role/permission catalogs, preference documents). TagManager carries a form container in HTML (`renderFormContainer`, form type `tag-manager`); the schema binds nothing on it here, so it ports as a presentational list plus add-control with no wired action; that is stated in its contract. Interaction: Tabs.

### m03 — user-list-showcase: AddressSummaryBadge, MessageStatusBadge, PreferenceSummaryBadge, RoleBadgeList, TagPills (5) · 14/16

All five are badge-family presentational components over the existing Badge primitive (as ColorizedBadge was in Wave 1; the Badge tone-precedence rule from #1736 applies). TagPills carries `maxVisible` and `overflowLabel` with the `{{ tag_count }}` template that the HTML renderer already substitutes; the React and Vue versions substitute the same way. Interaction: the schema's Button and PaginationBar; the harness picks the first declared action.

### m04 — user-timeline-showcase: AddressValidationTimeline, AuditEvent, MembershipAuditTimeline, MessageEventTimeline, PreferenceTimeline (5) · 15/16

Timeline-family components over the existing timeline containers (`renderTimelineContainer`, `renderEventArticle`); the ported AuditTimeline and StatusTimeline are the reference implementations in React and Vue. Interaction: Tabs.

### m05 — user-form-showcase: AddressEditor, PreferenceEditor, RoleAssignmentForm, StatusSelector, TagInput, TemplatePicker (6) · 16/16

The only cluster with real interactions. StatusSelector, TagInput and AddressEditor carry `onChange` bindings to local handlers, so the owned-state protocol from #1742 applies and the harness's typed-input gate is live for this schema. StatusSelector is a select over `optionsParameter` with `allowedTransitionsField`; TagInput is a controlled input plus list; AddressEditor is a four-field form. The other three are pickers and forms over catalogs. Expect this mission to surface a binding-contract correction the way plan-form-dark did in Wave 1 (#1734); repair it inside the mission, test the generated code and the mounted update, and record the decision. Gate as above, and the reachability census retained showing **16/16**.

### m06 — one union, closeout with what exists

1. **Fold** `PORTED_COMPONENT_IDS` into `NUCLEUS_COMPONENT_IDS` (decision #1729's trigger is met: this sprint already moves the root export surface). Root export becomes additive for the eight; the `/ported`, `/readiness-ported` and `/css-ported` subpaths stay as aliases this sprint so no consumer breaks on the import path; their retirement is named in the reconnect with a one-sprint horizon. Every site that reads `PORTED_COMPONENT_IDS` (emitters, the s184 tests, `s185-reconnect.mjs`, the mutation matrix) is repointed or retired with a stated reason; nucleus-size assertions stay derived, never literal.
2. **Baseline surface cells** for the 23 (react/vue/generatedConsumer from readiness evidence) via `scripts/product-reality/s185-baseline-surfaces.mjs`; 109 rows, identity untouched, `approvedRuntimeCensus` still null (#1726).
3. **One sprint-wide advertised diff** via `s185-sprint-wide-movers.mjs` over `5aa53b3a..<implementation head>`, canonical and public scope (#1740).
4. **One reconnect** via `s185-reconnect.mjs` to `cmos://derek/aquex-mcp` and `cmos://derek/forge-demos`: 23 new root families, the union fold, subpath alias horizon, any emitter behavior movers, and the deployment line (the served bridge is a different checkout).
5. **One four-suite capture** at a clean frozen head via `capture-s185-m01-baseline.mjs --sprint sprint-186 --mission s186-m06 --label closeout --runs 1`, compared against the Sprint 185 closeout receipts, deltas attributed by file with `s185-suite-accounting.mjs`. A failed first attempt is retained under its own name, never relabeled (#1743).
6. **Claim ledger and handoff** via `s185-closeout.mjs` and `s185-audit-closeout.mjs` unchanged, `builderSelfCertified:false`. Sprint stays Active; the review session closes it.

**Not in m06:** no new scripts, no new spec families, no review-carry apparatus (Sprint 185's carries were discharged; this sprint has none inherited), no bridge deploy from the worktree.

## 4. What is cut, and what is not

Cut: per-mission four-suite captures · any new closeout tooling · critic and grounding workflows (the census is the grounding) · Parts Town, visualization closure, structured-data refresh (#1371), catalog status labels — all parked by name, unchanged.

Kept, per component: TypeScript totality · package typecheck and tests · the packed-consumer proof from exact tarballs · computed cross-framework parity · a red delete-export bite in both frameworks · token-driven styles across six cells · readiness rows that resolve. Kept, per schema: the live cells at profile=build through the packed consumers. This is the bar Wave 1 met; it is not lowered.

## 5. Descope ladder (declared, not expected)

If the sprint runs out of time: m06 step 1 (the union fold) is cut first and re-parked with #1729's trigger re-armed. Then m05 (the six form components) is cut and carried as Wave 3, with 15/16 recorded honestly. m01–m04 and m06 steps 2–6 are never cut. Nothing is descoped silently; a cut is a decision with a reason.

## 6. Decisions captured at lock

Recorded in CMOS from planning session `PS-2026-09-06-003`, tagged sprint-186: the scope and base, the per-schema mission shape, the directive-lowering rule, the union fold with subpath aliases, and the ceremony cut. Numbers are in the sprint's decision list.

## 7. Handoff

The next fresh session is the Sprint 186 build. It reads `agents.md`, runs `cmos_review()`, reads this memo, confirms the worktree at `~/.codex/worktrees/s186/OODS-Forge` is at `5aa53b3a` with a clean porcelain and built packages, and starts `s186-m01` by measuring the schema's cells. It does not re-plan, does not build from the Sprint 185 memo, and does not touch the primary checkout. It records evidence and stops; a separate review session decides genuine close, scoped to what could flip the determination.
