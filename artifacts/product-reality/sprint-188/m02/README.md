# s188-m02 — workflow composition and application emitters

Implemented under the amended criteria in CMOS decision **1817**. Public
`design.compose({object:'Subscription', context:'workflow'})` and React/Vue
`code.generate({schema, framework, profile:'build'})` produce complete typed
application artifacts. Browser execution and craft inspection belong to m03;
this receipt makes no usability certification.

## Verified gates

| Gate | Execution evidence |
|---|---|
| Public workflow schema: list `/`, detail `/:id`, form `/:id/edit`, timeline `/:id/timeline`; trait-derived transitions | [Composition receipt](workflow-compose.json), public input/output AJV checks and source-tree equality in `workflow.s188.spec.ts` |
| Four canonical states per screen in both targets | 16 branches in the schema; branch-count and state-contract tests, including invalid-state control |
| Complete applications with closed imports and action contracts | [React generation](react-generation.json): 14 files; [Vue generation](vue-generation.json): 15 files. Exact emitted sources are in `generated-react/` and `generated-vue/`. Missing local-import and disconnected Cancel/Timeline controls fail the artifact guard |
| Strict compilation against freshly built OODS packages | [React](typecheck-react-attemptfinal.log), [Vue](typecheck-vue-attemptfinal.log); both exit 0, TypeScript 5.9.3 and vue-tsc 3.3.11, strict=true and skipLibCheck=false. Repeated from fresh temp consumers in the final tests |
| Existing 66 compositions / 132 build cells | [Frozen cd8ee986 baseline](baseline-schemas.json), [enumerated differences](schema-differences.json): **24 labels across 11 forms, 14 added bindings**. The test reverses only those allowed additions and compares every serialized schema byte |
| Trait source for new actions | Cancellable adds Cancel to Subscription/Transaction detail and form (4 bindings); Timestampable adds View timeline to ten objects' detail (10 bindings). Plan carries neither and receives neither; each added call site forwards through its named action and passes the guard |
| Deterministic data and runnable store | Ten records cover all eight lifecycle states, both billing intervals, all declared payment statuses and one archived record. Tests execute search/status/sort/page, copy-isolated reads, save, cancel metadata/history and invalid transitions, archive/restore, latency, empty mode, failure/retry and controller navigation |
| Saved stores untouched | [Store verification](saved-store-verification.json): all 16 served records plus index exactly match m01's post-adoption hashes |
| Schema/types/docs/policies | Input enums, shared UiSchema workflow contract, generated embedded types, pipeline/.oodsrc context, Tool-Specs and both policy layers updated. Role, rate and write permissions remain unchanged |

## Test and build receipts

- [Final mission checks](mission-final-tests.log): **3 files, 39 tests passed, zero skips**, including strict compilation, public contracts, 66/132 regression and artifact guard.
- [Action and emitter regression](workflow-tests-final.log): **6 files, 97 tests passed, zero skips**. Includes legacy typed-action negative controls, runnable artifacts, labels and field wiring. Together with the 26 artifact guard tests this covers **7 distinct suites / 123 distinct tests**; repeated tests are not counted again.
- [Server build](build-workflow-final.log), [React package build](build-components-react.log), [Vue package build](build-components-vue.log), [type generation](generate-types-final.log): completed successfully.
- [React strict red control](typecheck-react-attempt1.log): the first application used a union of differently typed screen components; strict compilation rejected it. Explicit typed screen branches fixed it. No `any` cast or disabled strict check was substituted.
- Earlier build/test logs and [label red control](label-red-control.json) are retained. Early label tests exposed that normalization generated Field N from anonymous `meta.label` slots rather than literal schema labels. The final test covers both origins.

## Implementation decisions

The assembler invokes the ordinary public composer four times, prefixes node IDs,
hoists each source root's existing bindings onto its workflow screen, and wraps the
unchanged source tree in a success branch alongside loading/empty/error branches.
It does not invent Cancel or Timeline actions.

The ordinary emitters generate each screen. One shared typed action declaration
combines their provenance; every screen retains its executable forwarding and
local-state handler markers. The application supplies these actions. Existing
marker guards remain intact, and the artifact guard additionally closes relative
imports. The generated application supplies record lists, lifecycle history and
required scalar editors absent from the composed form, using object field
metadata. No consumer-written component, navigation handler or store is needed.

Workflow output explicitly requires TypeScript. The generated package provides
`dev`, `build` and `typecheck` scripts. OODS packages can be installed from reviewed
local tarballs; m03 will exercise that installation and run the app. Navigation
is local state, storage is in-memory, and latency/empty/error modes are generated
application features. No URL router, backend or persistent store is claimed.

This commit separates the application contract from the subsequent packed browser
proof and eight component implementations, so later integration failures can be
bisected to that boundary. The live primary remains the delivered cd8ee986 build.
