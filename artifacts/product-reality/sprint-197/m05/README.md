# s197-m05 — one attributed palette migration

Builder self-certified: **false**. Palette implementation head: `9f31f9d95`.
The immutable baseline is m01's Git-qualified `bc12723e9` inventory. The
`golden-attribution.before.json` plan and numbered before-update addenda bind
changed files to the 2,318 changed scoped token inputs in
`changed-token-paints.json`. Addenda record pins discovered outside the original
filename heuristic; they precede each newly discovered file's update.
The fourth addendum adds five unchanged, Git-qualified s196 matrix inputs that
the initial filename filter omitted; it changes no historical golden.

## Measured changes

- Six of the fourteen live snapshot files moved, with 27 changed entries. The
  other eight stayed byte-identical. Removing only literal paints and encoded
  hashes leaves all 27 entries identical: data, geometry, labels, interactions,
  and snapshot identities stay fixed. No existing standalone SVG was edited.
- The public census regenerated 60 recipe SVG pins and 32 pattern SVG pins.
  Its 78 chart scopes retain 60 rendered / 18 typed-deferred results; nine HC
  chart families remain deferred. Four existing nonconformant chart cells
  retain their accuracy disposition. All 84 pattern calls retain eight public
  and thirteen authoring-only identities, with 32 conformant public cells.
- Eight certified renderer hashes were regenerated from the same operands,
  including the independently authored custom paint/gradient controls.
  `@oods/tokens` remains version `0.1.0`; the palette epoch is identified by its
  source commit and measured hashes, not an invented package version bump.
- The historical supersession table contains 1,564 rows: 1,474 superseded and
  90 unchanged. Original s190–s196 raw records remain byte-identical.
- Additional literal consumer evidence uses the exact requests: six source
  preview SVGs, two portable dashboard HTML documents, and 25 generated SVG
  assets across seven retained code generation requests. Preview inputs stay
  fixed; prior palette and UTC proofs remain verified at their recorded epoch.

## Findings and decisions

The six-slot palette and neutral/status dashboard roles are shared by A and B.
Tests now verify explicit brand routing and retained scope attributes; equal
chart pixels are valid when the selected roles match. Brand-primary divergence
continues to be covered by the seed/brand seam tests.

The unchanged nested sunburst improves from the former failing descendant tint
to a measured Role-C minimum of **3.8435958442874267:1**. Its generated descendant
`#8F5B65` still participates in grading. Deliberate low-contrast projected-paint
mutations continue to exercise the failure path. We preserve the improvement
instead of changing the operand to recreate an old failure.

The force layout uses the entire projected option as its deterministic seed.
Palette changes therefore move its qualified hash even for unused slots; the
convergence and intervening-RNG tests remain. All snapshot geometry happens to
be unchanged in this migration.

The m04 HC map canvas declaration removes only `#f2f2f2` from the bubble/flow
renderer error paint lists. Codes, severity, deferral status and the remaining
error prose stay unchanged. The source-level HC census does not certify the
nine deferred pixel outputs.

Decisions **#1850, #1863 and #1943** are superseded for their prior palette
values by the generated s197 palette. Their scope-resolution and honest
contrast requirements remain. These choices are recorded at CMOS session
close, once, with this receipt as evidence.

## Reproduction and verification

Initial red logs, command arrays and exit codes are retained. Updates were
bounded to the failed snapshot specifications with `--coverage.enabled=false`.
One root-level MCP snapshot command selected no tests; its log is retained and
the package-scoped replacement executed all four specifications. An initial
pattern measurement using tsx's CommonJS eval failed before reading goldens;
the ESM invocation succeeded.

The full viz-core suite passed **1,511 tests** and viz-render passed **69 tests**,
with no skipped tests. The final MCP suite passed **6,855 tests**, with **16
skipped** because its optional adjacent Stage1 fixture artifacts are absent
(nine action-mapping and seven rollup cases). All 377 executed test files passed;
one file was wholly skipped. `mcp-final-run.json` records the exact command,
source hashes and zero source changes during its 787-second run. The first full
run remains a diagnostic with its failures and concurrent edit caveat retained.
`close-verifiers.json` records the five successful receipt checks below.
The generated API reference changes remove only the same HC map fallback
paint from retained typed-error prose; they do not widen any capability claim.

```sh
python3 scripts/product-reality/s197-attribute-palette-goldens.py --finalize --check
pnpm exec tsx scripts/product-reality/s195-pattern-census.ts --check
pnpm exec tsx scripts/product-reality/s195-qualify-viz-matrix.ts --mode s197 --check
pnpm exec tsx scripts/product-reality/s197-palette-consumer-goldens.ts
node scripts/product-reality/s193-tool-truth.mjs --check
```

After implementation is committed, qualify the attribution with `--head` and
that exact full commit SHA. This keeps later runtime/release census updates
from redefining the palette migration's after-state.
