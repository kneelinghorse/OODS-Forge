# Sprint 179 M04 — family-aware ECharts paint semantics

**Mission:** `s179-m04`  
**Base:** `1be93f8e16fee2607682361bbd56e521fda3bcdb`  
**Local evidence date:** 2026-08-29  
**Status:** implementation and local qualification complete.

## Result

Operand-backed ECharts contrast now has an internal render-measured grading seam. It reads
visible carrier paints from normalized SVG and derives the semantic N-long category assignment
from the exact retained projected option. The API has no raw-option input, so a later raw emit
cannot influence the grade.

Role C and Role A are intentionally different inputs:

- Role C uses ordered-distinct paints from actual `ecmeta_ssr_type="chart"` geometry, including
  fills, strokes, and generated hierarchy tints.
- Role A uses the family semantic source: treemap/sunburst first-visible level, sankey/chord
  nodes, and sorted distinct non-empty force groups. Rendered path count and
  `ecmeta_data_index` never determine category cardinality.
- Both roles reuse the existing WCAG contrast, OKLCH chroma-floor, CIEDE2000, and Machado-CVD
  calculations from `certify-contrast.ts`; their independent results combine by worst verdict.
- Choropleth, bubble map, and flow map retain the standing geo exemption while their actual
  carrier paints remain available as render evidence.

The old reconstruction grader and all public `artifact.certify` response wiring remain untouched
in this mission. That path-scoped contract movement belongs to M05.

## Structural extraction contract

The SVG reader is a character-level start-tag/attribute parser. It selects only exact chart
metadata and does not search authored text or comments for tag-shaped strings. It canonicalizes
three/six-digit hex and integer `rgb(...)` to uppercase six-digit hex, retains first-rendered
order, and deduplicates paints only for Role C.

The extractor excludes `none`, `transparent`, invalid colors, hidden/zero-opacity channels,
zero-width strokes, unresolved `url(...)` paints, and option-known area/background/border/text
border chrome. Sankey link gradients are counted as unresolved auxiliary paint but do not poison
the readable solid-node result. A visible source color with nonzero opacity is retained without
claiming alpha-composited contrast. Pattern-only, missing-chart-metadata, and malformed SVG
evidence are `ungradeable`, never `unchecked` or pass.

Canonical family evidence:

| Family | Role-C paints | Semantic Role-A assignment | Verdict |
|---|---|---|---|
| treemap | `#416CD9`, `#3E44BE`, `#279669` | same three | pass |
| sunburst | `#416CD9`, `#3E44BE`, `#279669` | same three | pass |
| sankey | `#416CD9`, `#3E44BE`, `#279669` | same three | pass |
| chord | `#416CD9`, `#3E44BE`, `#279669` | same three | pass |
| force graph | `#416CD9`, `#3E44BE` | same two | pass |
| choropleth | `#003777`, `#DFEDFC` | not applicable | exempt |
| bubble map | `#003777`, `#DFEDFC` | not applicable | exempt |
| flow map | `#16558C` stroke | not applicable | exempt |

## Load-bearing discriminators

The dedicated nested sunburst renders the descendant tint `#809DE5`. Its Role-C ratio against
the fixed canvas `#FCFCFD` is exactly `2.6018134537251476:1`, so Role C honestly fails. Its
first-visible Role-A assignment remains `[#416CD9, #3E44BE]`, whose minimum normal/CVD distance
is valid. No color byte moved.

Every categorical family's eight-category fixture produces exactly:

```text
#416CD9, #3E44BE, #279669, #B78827, #CA4948, #993B00,
#416CD9, #3E44BE
```

The retained duplicates give Role A a real `minimumDeltaE = 0` failure. Repeated hierarchy
descendants, links, ribbons, or chart paths do not manufacture categories.

Physical bites:

- Collapsing Role C onto the semantic assignment made only the nested-sunburst discriminator red:
  the expected fail became pass. The split was restored.
- Deduplicating the N-long Role-A assignment made exactly all five wide categorical family rows
  red by removing slots seven and eight. Duplicate retention was restored.
- The initial Role-C skeleton failed all family and structural cases; the initial Role-A and
  combined modules failed collection before implementation. Final exact family matrices exercise
  treemap chrome, sunburst tint, sankey gradients, chord multiplicity, force fill/stroke with
  colliding indexes, all three geo exemptions, and flow's stroke-only carrier.
- A raw-only treemap paint mutation is inert. Moving the same paint through
  `projectEChartsOption` changes the rendered Role-C paints and fails contrast.

## Implementation inventory

Product:

- `packages/mcp-server/src/tools/certify-echarts-role-c.ts`
- `packages/mcp-server/src/tools/echarts-role-a-assignment.ts`
- `packages/mcp-server/src/tools/certify-echarts-render-contrast.ts`
- `packages/mcp-server/src/tools/certify-contrast.ts` — additive internal split-role math seams;
  legacy grader bytes unchanged.

Tests:

- `packages/mcp-server/test/tools/certify-echarts-role-c.spec.ts`
- `packages/mcp-server/test/tools/echarts-role-a-assignment.s179.spec.ts`
- `packages/mcp-server/test/tools/certify-echarts-render-contrast.s179.spec.ts`

No schema, generated type, policy, public response, snapshot, package manifest, lockfile,
viz-core, or viz-render file moved in M04.

## Verification

```text
focused M04 gate
  3/3 files, 43/43 tests, 0 skips

legacy byte/regression carriers
  7/7 files, 147/147 tests, 0 skips
  includes cartesian contrast, frozen ECharts caveat, spec-only bytes,
  artifact.certify, fault degradation, and projected-render truth

@oods/mcp-server build/typecheck
  green

full @oods/mcp-server
  217 files passed, 1 file skipped (218 total)
  4390 tests passed, 16 skipped (4406 total), 0 failures
  46.80 s Vitest duration; package configuration does not collect coverage

git diff --check
  green
```

The 16 skips are the pre-existing fixture-gated cross-project E2E cases: seven Stage1 rollup
fixtures and nine bridge-summary action mappings. No M04 test is skipped. No commit was created;
the sprint commit boundary remains Derek-owned.

## Decisions captured by this mission

1. Keep separate structural Role-C extraction, semantic Role-A assignment, and combined grading
   seams; none accepts a raw option or falls back to the reconstruction grader after rendering.
2. Exclude option-known chrome by canonical paint value because ECharts can materialize a border
   as tagged fill geometry; record the narrow caveat that an intentional carrier using the exact
   same paint is excluded too.
3. Treat opacity as a visibility gate only. Keep visible solid source colors and defer gradient
   sampling and alpha compositing until they have an explicit contract.
4. Make semantic assignment all-or-nothing: an unreadable or non-rendered required category paint
   yields `ungradeable` rather than grading a reduced subset.
