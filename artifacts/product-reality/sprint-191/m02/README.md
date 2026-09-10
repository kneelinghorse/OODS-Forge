# s191-m02 — collection-backed workflow applications

**Implementation complete and verified.** Organization/workflow and User/workflow now generate typed applications and persist address edits in both React and Vue. This is builder evidence; `builderSelfCertified:false` remains in the packed reports. Sprint 191 remains Active for the remaining serial missions and independent review.

Build branch: `codex/sprint-191-paydown`. The implementation and receipts were produced over m01 commit `e7aa31e2` with m02 changes present. Artifact hashes bind the exact generated files; `verify-packed.ts` requires the final packed artifacts to match the fresh census. The m02 commit provides the required BEFORE baseline for m03. No primary checkout, PM2 runtime, saved schema store, or external consumer was changed; no messages were sent.

## What changed

- The workflow node walk captures collection editors. A missing `handleChange_<field>` action with a record parameter and a declared collection field generates an upsert keyed by the editor's default-role field. The ten existing action implementations remain unchanged; unknown scalar actions still return `OODS-N016`. Tests rename the collection and role field to prove this is not an object-name or `addresses` special-case action map, and verify append, replacement, metadata preservation, unsaved-edit discard, and Save persistence.
- Workflow composition carries the Addressable trait's declared roles and default role. Organization seeds `headquarters`; User seeds `home`. Each record has one canonical entry with country code, address lines, locality, administrative area, postal code, default marker, and timestamp. Upserts translate the editor's street/city/region fields into that canonical shape and preserve existing country/metadata.
- Internal workflow recipe bindings pass the selected entry to AddressEditor and the collection summary to AddressCollectionPanel. The standalone binding contract remains unchanged. Native scalar input capture ignores collection fields so it cannot replace an array with an individual address input value.
- Collection-bearing forms use a submit owner around the component forms without nesting an outer HTML form. Required string seeds are populated so an unrelated address edit can be saved. The title resolver recognizes the Labelled trait's `label`. An explicit supplemental-field array type prevents `never[]` in User, which has no supplemental fields.
- Browser verification exposed unresolved lifecycle directives on the new workflows: their Status filter had only “All states” and the form selector fell back to draft/active/inactive. Workflow emission resolves these from declared lifecycle states only when no field enum already supplies them, preserving Subscription's existing humanized enum options. The source schema is cloned before this lowering, and tests assert that generation does not mutate its input.
- The packed harness accepts an object, derives its title field and declared address/billing obligations, handles objects with no archive or cancellation feature, and checks address seed → edit → Save → detail readback → reopen. One unchanged foundation pack can be installed independently by all six cells. The fresh reachability gate now requires 77/77 and 154/154; historical audit paths accept either the retained, attributed two-gap capture or its empty successor. The old workflow-gap limitation is removed from the closeout writer.

## Census and protected contracts

`census/report.json` reports **77/77 schemas and 154/154 generation cells**. `census-attribution.json`, produced by `verify-census.ts`, compares against the retained Sprint 190 m06 census:

| Population | Result |
|---|---|
| Organization/workflow | Both frameworks: OODS-N016 → green |
| User/workflow | Both frameworks: OODS-N016 → green |
| Other schema status rows | Unchanged |
| 66 single-screen schemas / 132 framework artifacts | Every content hash unchanged |

`consumer-contract.s185.spec.ts` and `breadth-live-generation.s186.spec.ts` were not modified; all 19 and 117 tests passed. Both new objects generate twice with identical artifact envelopes and compile under strict TypeScript in both frameworks. The negative scalar-action test retains the typed N016 failure.

## Packed consumer proof

`packed-proof.json` validates the six final receipts, their artifact identities against the latest census, every screenshot hash, the retained navigation mutation/red/restore check for each object, and Subscription's historical gate and flow names. Full reports are under `packed/<Object>/report.json`; `packed-report.json` collects all three.

| Object | React | Vue | Flow rows per framework | States | Screenshots |
|---|---|---|---:|---:|---:|
| Organization | 8/8 gates | 8/8 gates | 6, including address readback | 32 | 24 |
| User | 8/8 gates | 8/8 gates | 6, including address readback | 32 | 24 |
| Subscription | 8/8 gates | 8/8 gates | 9, unchanged names/count | 32 | 36 |

All applicable collection controls also pass: typing through empty search results without losing focus, filtering actual seeded states, sort order, and pagination boundaries. Install isolation, strict compilation, production build, SSR, hydration root retention, shared CSS resolution, mount and interaction evidence are checked separately. Final browser error arrays are empty.

Verification attribution: the original harness selected a globally unique h1 and a named plan_name input. New object views contain their own heading and normal component controls, so the observer now scopes the workspace heading and uses the field's accessible label. The StatusBadge carries an icon in its text, so the collection filter expectation reads its actual `data-status`, not flattened text. Subscription's Home/ArrowDown interval sequence repeatedly left the native select at monthly in this browser; the harness now uses native selectOption input/change events, still requiring invalid-save rejection, yearly selection, and persisted readback. Gate names and counts are unchanged. Initial and repeated failure reports remain in the explicitly named `*-failure`/`*-initial` directories and probe JSON; they are not part of the final green totals.

## Design-loop proof

`browser-proof.json`, produced by `verify-browser.ts`, verifies **16 receipts and 48 screenshots**: Organization and User × list/detail/form/timeline × React/Vue × 390/820/1440, light/A. Every form shows the seeded `100 Main Street`, Springfield, IL, 62701 entry. All receipts have zero page/console errors and zero overflow; document widths equal their viewports. Computed control-value/canvas/viewport parity is empty, with an empty allowlist. Form screenshots were visually inspected.

This computed parity concerns data values, theme, viewport bounds and errors. It does not claim whole-page visual equality; the existing component/DOM craft work remains in m03. The packed flow proof separately visits the address detail panel and verifies the saved `42 Lake Road, Madison` value.

## Focused verification

| Check | Result | Receipt |
|---|---|---|
| Composer, emitters, workflow/data, product-reality, schema-ref contracts | 968 passed, 43 files | `focused-tests-verified.log` |
| Final collection/workflow/theme regression after preserving Subscription enum lowering | 20 passed, 3 files | `final-regression.log` |
| Root typecheck | Passed | `typecheck-final.log` |
| MCP build | Passed | `mcp-build-final.log` |
| Generated schema type drift | Passed | `schema-types-check.log` |
| Fresh census and exact hash attribution | Passed | `census-final.log`, `census-attribution.json` |
| Final packed and design-loop proof validators | Passed | `packed-proof.json`, `browser-proof.json` |

No skipped tests were reported by these executions. No full four-suite capture was run. Initial strict compilation exposed User's empty-array inference and was corrected. A later focused run overlapped npm pack hooks rebuilding component declarations and failed two compilation cells; the retained log identifies missing dist declarations, and the serialized rerun passes. Foundation packing now precedes consumer compilation checks.

The API generator also refreshed three stale chart-capability sentences in `docs/api/artifact-certify.md`, `dashboard-render.md`, and `viz-render.md` from the m01 registry. These are attributed documentation follow-ups to m01's measured light/dark contrast passes, with no new chart/token behavior or expanded exception.
