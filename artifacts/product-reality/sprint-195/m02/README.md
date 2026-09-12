# s195-m02 — Versioned visualization taxonomy and portable health

Implementation is frozen at `ffcdc29ef225d28e54f094e2b430b707f85d1167`.
The authored classification table assigns all 13 registered types and 21 exact
pattern identities once across eight families. Its generated taxonomy and docs
report 20 Core Analytics Profile cells: 11 surface-complete and nine typed gaps.
Every gap has a reason; financial candlestick/waterfall and scientific
box/histogram/contour are explicitly absent.

CMOS decision #1938 fixes the evidence rule: one primary family/cell per identity,
with completion only from a public identity in that same cell. Authoring patterns
cannot inherit their base chart's proof. Generic heatmap is an extension, and
area/cumulative assumes already accumulated caller values. Classification is the
only human family table; registry rows and generated taxonomy were not hand-edited.

The generated taxonomy and its classification authority ship together in server
dist. Host health, staged dist-only native health, and staged MCP adapter health
return the same seven counts. Invalid assignments, false summaries, unsupported
pattern proof and missing files degrade health with null visualization counts.
The additive output schema was produced by s195-health-viz-schema.ts; existing
generated types and API docs were regenerated. The narrative sentence is pinned
to the generated identity population.

Taxonomy checks: 21/21 contract tests, artifact/docs --check and isolated strict
NodeNext typecheck pass. Health checks: 24/24 wire tests, four existing unit tests,
and 10 portable-boundary tests pass. Narrative: 13/13 tests pass. No tests were
skipped. Receipts are in taxonomy/ and health/ with raw-log availability disclosed.
The tool ledger is regenerated at the frozen implementation head; the remaining
options and ledger regression results are recorded in integration-results.json.
No full-suite capture or full portable E2E campaign was run here; the staged
native/adapter tests prove this mission's portable health boundary, and the
existing portable E2E assertion now includes the visualization summary.

Primary PM2 remains on certified Sprint 194 delivery `5b25c3c9`; this mission
changed only the sprint worktree. Builder certification remains false, and
independent sprint review remains separate.
