# s197-m04 — Chart palette and declared HC scope

The generator now owns all 26 viz color names (six categorical, nine sequential,
eleven diverging), brand dark overrides and HC declarations. Its default `--check`
covers 14 files. Every public semantic name remains frozen; dark/HC add declarations
of existing viz names only. Brand base retains its existing slot-05 override, generated
from the shared light value, so global brand-base merging cannot choose a palette.

The authored wheel has six hues at 17.5 + 60n degrees. Their closest seed-hue distance
from either brand primary or the accent is 12.5 degrees. Lightness/chroma parameters
were selected by a bounded deterministic search, then measured from the rebuilt
scoped exports with certify's actual Role-A and Role-C functions. `development/` retains
the search parameters/results; the generator never runs the search or reads its output.

Verified:

- Minimum pairwise CIEDE2000 over normal vision and all three Machado simulations:
  **16.540957 light; 20.105820 dark**, identical for A/B. Both exceed target 12; no
  ceiling exception or caution was taken. `categorical-measurements.json` retains
  every pair, slot, canvas ratio, post-hex chroma and seed-hue distance.
- **24/24 Role-C checks pass** at 3:1. All categorical source and quantized paints
  have chroma ≥.045; all source colors are in sRGB gamut.
- Sequential steps have descending L at ΔL=.1 and an interior chroma peak. Dark has
  its own L/chroma set. Diverging wings share L and the smaller in-gamut C at each
  mirrored pair; this prevents gamut mapping from breaking chroma symmetry.
- Full `tokens-validate`, `check:tokens`, generator `--check`, generator/validator
  strict TypeScript and viz-core TypeScript pass. The CSV color gate passes all
  **454** checks; viz validation passes all **232**, including dark shape and coverage.
- **106 tests pass, none skipped**, including CVD/contrast, dark-only mutation,
  generator/schema/key freeze, collision boundaries, scoped CSS/JS exports, HC
  compile boundary and the source brand contrast/provenance suites. The five HC
  tests were rerun after expanding the census to compound component shadow paints.
- Existing golden/registry/certification files: **1,580 unchanged**, verified against
  m01 baseline hashes. No snapshots, registry pins or certified matrix were updated.

HC decisions and evidence:

All six categorical slots explicitly use CanvasText; numeric gradients use declared
achromatic literals. Brand surfaces/text/focus retain CSS system-color semantics.
This declares the scope, not category distinction or forced-colors pixel conformance.
The existing SVG guard remains intact; renderer-created defaults, interpolation,
compositing and the nine deferred chart families still need Sprint 199's pixel pass.

`hc-scope-census.json` compiles all 13 public chart operands for A/B with `svg:false`:
**336 compiled chart paint roles, 230 component paint roles, zero undeclared values,
zero rendered SVGs**. It includes contextual axis, grid, label, tooltip, legend and
focus mappings, direct and compound component paints, and an explicit treatment of
Sankey's `gradient` instruction as derived from endpoint paints, not a literal color.
Tooltip interaction and HC numeric contrast are not claimed.

The initial census caught two legacy defaults (eight affected brand/type cells):
ECharts treemap's emphasis shadow and geo base-map #f2f2f2 fallback. Their HC branches
now use the existing declared canvas token. Light/dark behavior is unchanged, proven
by the boundary tests. The initial red census is retained under `development/`.

The build filter and collision policy now admit only the exact 26 canonical scale
names through shared → identical brand bases → one dark/HC scope. Reversed,
cross-brand, mixed-theme and invented-slot chains still fail. Both CSS emission and
non-CSS exports are tested so declaring dark scales cannot silently leave CSS light.

`builderSelfCertified:false`; independent visual review remains pending.
