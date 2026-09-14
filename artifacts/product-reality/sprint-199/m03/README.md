# Sprint 199 m03 — public scenes and Core Analytics Profile

The final pattern census has 23 identities: 22 public, one retired, zero authoring-only. All 88 public light/dark × A/B cells certify conformant. The generated taxonomy has 13 types, 23 patterns, 36 identities, 17 surface-complete active core cells, zero typed gaps and three retired cells with reasons. The health boundary verifies the same population.

`index.html` is the complete four-scope SVG gallery. `gallery-receipt.json` binds fourteen new public-pattern screenshots to exact public SVG hashes and Chromium 141.0.7390.37. These are static default-selection images, not interactive behavior certification.

## Implementation

- Scene translation preserves authored layers, layout, interactions and secondary axes, adds missing x/y/color titles and validates the resolved IR. The eight original public patterns keep the explicit builder/presentation path. Their eight source hashes and 32 SVG hashes remain unchanged.
- Layered selections are declared only on the first layer. Empty visual selections do not paint every mark as selected. Static selection state is disclosed as OODS-V175.
- Wrapped facets apply declared limits/maxPanels to real rows and divide the declared width and height across panels. Sparkline-grid uses twelve panels in three columns, a single series paint and overlap-aware axis labels.
- Linked-brush-scatter returns OODS-V174 with its keyboard limitation and correlation-scatter alternative. Its served registry row is retired; the cohort recommender points to correlation-scatter. Facet-target-band renders and certifies in all four scopes, so it is public.
- Waterfall uses sequential y/y2 ranges and step-kind colors. Histogram uses supplied binStart/binEnd frequencies, vertical bars and a zero count baseline. The actual SVG height ratios match the frequency ratios. V150 still evaluates the numeric bin-start axis: a compiled x.scale.zero=false mutation fires the rule. No new accuracy rule or exemption was added.
- Candlestick, box and contour retire through explicit classification records because the required wick/whisker/contour geometries are absent. Their reasons are checked for completeness and disjointness from active cells and are published in the taxonomy docs and health summary.

## Proofs and corrections

`patterns/pattern-observations.json` is the final 92-cell census; four cells are typed retirements. `timezone/comparison.json` proves all 88 public SVGs byte-identical across UTC/Chicago and the four retirement responses equal. Historical Sprint 195–198 receipts are untouched.

`focused-core-final.log` and `pattern-boundary-final.log` cover scene preservation, bounded facets, missing structural operands, retirement/conflict boundaries, real pixels and certification. The six-suite focused MCP run initially had two stale-input failures in the Sprint 195 audit; `historical-audit-final.log` passes after pinning its historical taxonomy/classification/source/schema reads while its current tool-proof case explicitly reads current bytes. `gate-verified/report.json` retains the final per-change chart gate result. The earlier gate logs retain stale corpus-count failures and one stale observation-path failure; the corresponding contracts were corrected.

Visual QA found that a conformant pre-binned histogram initially rendered equal-height range ticks. `probe-patterns/histogram.svg` and `gallery-before-geometry/histogram.png` preserve that false green. Explicit vertical orientation plus a zero baseline fixes it; the new test checks real SVG bar-height ratios and common bottoms. The grid's initial per-panel height was also too tall; the final mapper divides the total height across the four rows. Earlier probes, censuses and timezone results remain under `*-initial` and `*-before-geometry` directories.

The six faceted/concatenated patterns use Vega-Lite as preferredRenderer. `renderer-preference-evidence.json` retains their ECharts panel filter operands: filters have no dimension, and repeated-field facets do not preserve wrapping. These metadata decisions are completed here before new normalized hashes are pinned, so m04 cannot move them a second time. Sparkline-grid also removes its redundant color. Other source semantics are unchanged.

The first chart gate exposed three additional corpus-count files (42→44 fixtures, 21→23 sources). `golden-plan-extension.log` reconstructs their before-values from immutable b7a96ab0f in additionalBeforePlan; the original beforePlan is unchanged. The source generator now permits explicit-only authored patterns with a supported Cartesian base mark, while aliases, duplicate IDs, malformed IR and unsupported marks still fail. `focused-core-gate-fixes.log` passes 143/143 intent checks.

Builder self-certification: false. Review remains independent.
