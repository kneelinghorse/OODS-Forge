# Sprint 199 m02 — temporal contract, SSR boundary, soak and coverage table

ScaleTemporal 0.3.0 removes the unused timezone parameter, field, semantics and bindings as a breaking trait change. Rendering remains UTC. Generated schema types, public descriptions and documentation were refreshed. The `viz.render` public description names the eight supported ECharts SSR series and `ECHARTS_UNSUPPORTED_OPTION`; Cartesian line/bar/area options remain spec-only and uncertified.

The soak retains hard resource ceilings, disposal/fault cleanup, map bounds, concurrency and latency assertions. Its one-sided confidence bound is now diagnostic. `soak-final.log` contains 3/3 passing cases, all 21 resource samples, fitted trends and zero surviving charts/jobs. `soak.log` is the first passing run; a second run followed correction of the producer's stale threshold-description text. Neither run establishes retention certification.

The generated 13-type table has all six scope states, typed deferred codes or retirement reasons, passing/declared verdict counts and row reasons. `table-bite.mjs` runs the actual generator in an isolated fixture: removing bubble_map/light/A's code fails; restoring it passes. Both logs and the receipt are retained under `table-bite/`.

## Verification

- `root-contracts-final.log`: 32/32 tests (trait rejection, coverage table, generated claims and checklist).
- `mcp-contracts-final.log`: 15/15 tests (public temporal/SSR contract and soak classifier safety failures).
- `timezone/current-comparison.json`: 16/16 actual primary SVG bytes, registry hashes and ECharts options equal across UTC and America/Chicago. ECharts line SSR stays explicitly unavailable in both zones.
- `golden-check.log`: 342 planned pins, zero moves; sealed Sprint 195–198 paths unchanged.
- `gate/report.json`: local 11-step chart gate result and every command's raw log.

## Input corrections and retained failures

The handoff's Sprint 196 request fixture embeds pre-Sprint 197 SVG pins. Its initial comparison correctly reports 16/16 cross-timezone matches but 0/16 historical-pin matches. `timezone/requests.current.json` preserves every request operand and updates only the expected hash by identity/theme/brand from the live registries. `pin-provenance.json` records both hashes and request digests. Historical requests and receipts are unchanged.

The structured-data export was stale at 12 objects; current source contains 19 (including its abstract base). Regeneration necessarily includes current object/trait metadata. Both its historical 193 runtime fixture and current runtime ledger fail the export's complete-population check; no runtime projection was weakened. `component-capabilities-input.json` preserves all 109 existing productReality records exactly, and `refresh-components.py` passes them through the export's supported explicit capability input. No capability evidence or runtime verdict changed. A future full export/runtime alignment remains a separate existing concern.

Initial usage failures for `generate:types` are retained: this trait's owning generator is `generate:schema-types`, which removed only the timezone field from its tracked generated type. Initial contract failures exposed a missing checklist runtime-fingerprint command and a stale soak expectation; both were fixed and final focused logs are green. Receipt files preserve original output, including blank lines.

Builder self-certification: false. This is implementation evidence for independent review.
