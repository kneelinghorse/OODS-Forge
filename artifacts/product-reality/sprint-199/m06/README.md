# Sprint 199 m06 — Relationship graph placement

Relationship 1.1.0 declares an optional neighborhood edge array and a detail-only MarkGraph trait. Its generated detail and workflow views place one VizGraphPreview in React and Vue. The title **Example connected relationships** and description identify the data as synthetic. Evidence, Mission and Organization receive no graph placement.

The edge-array source validates every declared field, sorts distinct string node IDs, preserves directed link row order, adds a reverse link only for a true boolean flag, and deduplicates directed pairs. It adds no group or value. Generated SVG assets are exact public viz.render output, with the accessible name on the wrapper. Repeated generation produces equal artifacts.

The shared passive SVG validator now admits only ECharts' bounded text font declarations and renderer-local hover paint rules. Scripts, arbitrary selectors/styles, imports and external references remain rejected. This changes validation only, preserving public SVG bytes. The preview fixture is generated from Relationship's actual declaration; all six existing fixture SVGs remain unchanged.

## Evidence

- `placement/`: public compose/generate requests and results, exact network operands, asset hashes and React/Vue typechecks for detail and workflow. `placement-fifth.log`: 16/16 tests passed.
- `graph-browser/report.json`: 12/12 framework × brand/theme cells passed with exact mounted public SVG, visible marks/labels and named wrappers, including forced colors. Chromium 141.0.7390.37, Playwright 1.56.1 Linux image.
- `react-measured.json`, `vue-measured.json`: 494/494 tests each; zero pending tests. Scenario, interaction, accessibility and server rendering proof.
- `react-theme/report.json`, `vue-theme/report.json`: 660/660 root cells each, 1,320 total; zero failures or skips. These measure all 110 current component identities.
- `apps/relationship/`: one fresh package set; both generated workflows passed all eight packed gates. Twelve graph screenshots cover detail navigation and saved-record persistence at 390, 820 and 1440 pixels. Mounted SVG remains equal to the selected record's asset.
- `runtime-final/`: all 14 Relationship runtime cells passed, with before/after artifact hashes attributed against b7a96ab0f. Both detail frameworks additionally execute six actual chart theme scopes. The earlier `runtime/` failure is retained.
- `readiness-refs.json`: 1,330/1,330 physical evidence references resolved across 220 framework rows.
- `intake-tests-final.log`: three Python tests verify preserved baseline identities and fail-closed new evidence. `registry-boundary.log`: two root trait projection tests. `contracts.log`: 40 contract/validator tests. `root-final.log`: 36 registry/documentation tests.
- `census/`: 13 chart types, 78 rendered and conformant declared census operands, 10 composed declarations across four placed chart types. The seven remaining ECharts families each name their missing object operand.
- `gate-final/`: all 11 local chart gate steps passed in 126,867 ms; 2,664 tests passed, zero skipped. Command logs and timings are retained. The one full five-suite capture belongs to m07.

## Qualifications and retained corrections

Decision #2054 corrects the mission arithmetic: detail and workflow count separately, so the new placement adds two declarations (8→10). The explicitly requested new component adds one obligation (109→110), with 12 extra theme/framework cells (1,308→1,320). The historical 109-row baseline and sealed Sprint 195–198 receipts are unchanged. Current catalog and readiness additions have their own evidence; no historical proof was invented for the new identity.

Decision #2055 records the ungrouped Relationship operand's certification limit. Accuracy, determinism and accessibility equivalence pass. Light/dark categorical contrast is **ungradeable: missing-semantic-metadata**, so those example operands are not conformant; HC contrast is exempt and those operands are conformant. The browser independently verifies visible marks and labels. This does not change the 13-type census, whose declared operands include categorical metadata. No group was invented to manufacture a verdict.

Initial logs preserve missing module imports, tuple typing, unpublished catalog/readiness, rejected native CSS, an incomplete theme harness roster and the old Cartesian-only conformance assumption. Subsequent named logs resolve each. The initial `gate/` passed eight steps, then failed the stale generated Tool-Specs table; two steps were not run. Regenerating that table resolved the final gate. The small fixed graph can have crowded labels at narrow widths; these are static SVG examples, with no interactive graph exploration claimed. Independent visual/usability review remains pending.

Execution base: b5b1294e9523cdaa436d0c8f52352146dcf4545a plus the retained m06 working changes. The mission commit records the final implementation and receipts. Runtime artifacts were measured before their new generatedConsumer evidence was promoted into the catalog; existing 109 capability rows remain unchanged.

Builder self-certification: false. No primary-checkout build, hosted CI, delivery or external message was performed.
