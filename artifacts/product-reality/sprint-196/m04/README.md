# s196-m04 — Published documentation from executable sources

The component generator emits 109 governed pages and their index from the
capability ledger, exported contracts, 109 shared scenarios and the selected
catalog. All 1,464 unique evidence references resolve. Thirty-one older Foundry
guides are retained under `docs/history/components/`; the Table and TagInput
guides are superseded by generated references. The case-only Table rename is
recorded in Git, including on a case-insensitive checkout.

Tool-Specs is generated from all 24 actual dispatcher schema pairs, verbatim
adapter descriptions, policies and ledgers. It covers 119 root input parameters
and 14 action branches. The retirement gate permits only the exact historical
table derived from the ledger, and still rejects callable retired references.

The claims generator maintains 76 marked spans and two package READMEs across
six documents. Source measurements correct the old trait count to 45, identify
12 object definitions with 11 unique names, enumerate 20 viz-category traits,
and measure the Product example at 18 nodes, 10 selected slots, eight tabs and
38 fields. It also replaces the obsolete ten-region list with the six canonical
regions and qualifies conceptual diagrams and illustrative examples. Font and
palette descriptions reflect actual shared families and scope/override behavior.

`pnpm docs:check` runs all six generated-document checks after their built inputs
are available. It checks API docs, taxonomy, pattern documentation, components,
Tool-Specs and narrative claims without remeasuring or rewriting evidence.

Proof scopes and exact outputs:

- `component-docs/`: generator, migration, 18 intent tests and strict types.
- `tool-specs/`: generator, 30 focused tests and strict types.
- `claims/`: all claim keys/bytes, source inventories and an isolated Product
  source mutation; 31 focused tests. Some scopes include existing doc contracts.
- `ci-integration/`: aggregate CI wiring, the retirement exception, actual
  compositor default behavior, and the nonvacuous runtime-bite selector.
- `docs-check.log`, `typecheck.log`, `tool-ledger-check.log`: final command gates.

Final combined verification passes 132 tests across 16 files: 76 root contracts
and 56 server contracts, with zero skipped. `root-contracts.json` and
`server-contracts.json` retain the per-test accounting. This combined run includes
the separate authored-source pins and the corrected runtime selector.

The broader preceding CI run `34677270788` passed both portable Node jobs and
the 42-cell release job. It failed root coverage on three stale CI carrier/path
expectations, and its separate host runtime job failed when a renamed test made
the emitter-bite selector execute zero assertions. Both failures are retained
under `ci-integration/`, with focused repairs. The runtime job is not relabeled
as passing: its actual cells passed, but the restored mutation proof did not
finish. The new selector regression executes one real assertion for both valid
and missing-mount reports, with filtered child siblings explicitly qualified.

The m03 archive metadata upload correction still requires confirmation from the
next normal hosted release job. This mission changes documentation and checks;
the full five-suite capture remains reserved for m07. `builderSelfCertified:false`.
