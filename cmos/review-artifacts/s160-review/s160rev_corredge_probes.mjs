// s160 adversarial review — correlation-gate edge probes (correlation-gate edge hunter lens)
// Imports the built dist READ-ONLY. Every expected r is computed by the inline hand-oracle
// below (independent arithmetic — NOT the SUT's pearson; it never touches @oods/viz-core code).
import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// ---- independent hand-oracle Pearson (plain formula, written here from the definition) ----
function handR(pairs) {
  const n = pairs.length;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (const [x, y] of pairs) {
    num += (x - mx) * (y - my);
    dx2 += (x - mx) ** 2;
    dy2 += (y - my) ** 2;
  }
  const den = Math.sqrt(dx2 * dy2);
  return den === 0 ? null : num / den;
}

function scatterSpec({ rows, mark = 'MarkPoint', colorField, facetRowField }) {
  const encoding = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  };
  if (colorField) encoding.color = { field: colorField, trait: 'EncodingColor' };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'corr-probe',
    name: 'corr probe',
    data: { name: 'c', values: rows },
    marks: [{ trait: mark, encodings: { ...encoding } }],
    encoding,
    ...(facetRowField ? { layout: { trait: 'LayoutFacet', rows: { field: facetRowField } } } : {}),
    a11y: { description: 'y over x' },
  };
}

function report(name, spec, expectation) {
  const analysis = analyzeVizSpec(spec);
  const { summary, keyFindings } = generateNarrativeSummary(spec);
  console.log(`\n=== ${name} ===`);
  console.log('expectation:', expectation);
  console.log('analysis.correlation =', analysis.correlation);
  console.log('summary =', summary);
  console.log('keyFindings =', JSON.stringify(keyFindings));
  return { analysis, summary, keyFindings };
}

// ─────────────────────────────────────────────────────────────────────────────
// P1 — MIXED computability: ONE computable group agreeing with pooled sign +
// THREE n=2 groups each with a genuinely NEGATIVE within-group slope.
// Hand oracle: group A r = +0.982 (computable, positive);
// B/C/D n=2 (non-computable) each falling (110→109, 220→219, 330→329);
// pooled hand r ≈ +0.998. Predicate sees groupRs=[+0.982] → common sign +1 ==
// pooled +1 → NARRATES "strong positive" while 6 of 9 drawn points live in
// falling series. NOT the disclosed all-small-groups vacuous-pass (branch not taken).
// ─────────────────────────────────────────────────────────────────────────────
const p1rows = [
  { x: 1, y: 1, segment: 'A' },
  { x: 2, y: 3, segment: 'A' },
  { x: 3, y: 4, segment: 'A' },
  { x: 10, y: 110, segment: 'B' },
  { x: 11, y: 109, segment: 'B' },
  { x: 20, y: 220, segment: 'C' },
  { x: 21, y: 219, segment: 'C' },
  { x: 30, y: 330, segment: 'D' },
  { x: 31, y: 329, segment: 'D' },
];
console.log('P1 hand pooled r =', handR(p1rows.map((r) => [r.x, r.y])).toFixed(4));
console.log('P1 hand group-A r =', handR(p1rows.filter((r) => r.segment === 'A').map((r) => [r.x, r.y])).toFixed(4));
const p1 = report(
  'P1 MIXED computability (color-series)',
  scatterSpec({ rows: p1rows, colorField: 'segment' }),
  'charter-honest outcome = suppressed OR disclosed; SUT is predicted to NARRATE (undisclosed escape)'
);
// faceted twin
report('P1b MIXED computability (faceted)', scatterSpec({ rows: p1rows, facetRowField: 'segment' }), 'same');

// ─────────────────────────────────────────────────────────────────────────────
// P2 — ALL-FLAT (zero-variance) groups: three color series, each CONSTANT y
// (10/10/10, 20/20/20, 30/30/30), levels rising with x. Hand pooled r:
// Σdxdy=180, Σdx²=60, Σdy²=600 → r = 180/√36000 = 0.9487 → "strong positive".
// Every per-group pearson = null (denominator 0) → groupRs=[] → VACUOUS-PASS →
// narrates, though the shipped comment pins "groups all flat while pooled is
// directional → SUPPRESS (every panel shows no relationship)". n=3 groups — NOT
// the disclosed small-group (all-n<3) escape.
// ─────────────────────────────────────────────────────────────────────────────
const p2rows = [
  { x: 1, y: 10, segment: 'A' },
  { x: 2, y: 10, segment: 'A' },
  { x: 3, y: 10, segment: 'A' },
  { x: 4, y: 20, segment: 'B' },
  { x: 5, y: 20, segment: 'B' },
  { x: 6, y: 20, segment: 'B' },
  { x: 7, y: 30, segment: 'C' },
  { x: 8, y: 30, segment: 'C' },
  { x: 9, y: 30, segment: 'C' },
];
console.log('\nP2 hand pooled r =', handR(p2rows.map((r) => [r.x, r.y])).toFixed(4));
report(
  'P2 ALL-FLAT zero-variance groups (color-series)',
  scatterSpec({ rows: p2rows, colorField: 'segment' }),
  'pinned intent says flat-groups+directional-pooled → SUPPRESS; predicted to NARRATE via zero-variance vacuation'
);
report('P2b ALL-FLAT zero-variance groups (faceted)', scatterSpec({ rows: p2rows, facetRowField: 'segment' }), 'same');

// ─────────────────────────────────────────────────────────────────────────────
// P3 — facet AND color simultaneously: partition must be the UNION (panel × series).
// Every (panel,series) cell r = −1 exactly; a series MERGED across panels is
// strongly positive; pooled positive. Wrong (merged) partition → narrate; correct
// union → suppress. Hand: S1 merged r = handR below.
// ─────────────────────────────────────────────────────────────────────────────
const p3rows = [
  { x: 1, y: 10, panel: 'P1', s: 'S1' },
  { x: 2, y: 9, panel: 'P1', s: 'S1' },
  { x: 3, y: 8, panel: 'P1', s: 'S1' },
  { x: 11, y: 20, panel: 'P2', s: 'S1' },
  { x: 12, y: 19, panel: 'P2', s: 'S1' },
  { x: 13, y: 18, panel: 'P2', s: 'S1' },
  { x: 1, y: 11, panel: 'P1', s: 'S2' },
  { x: 2, y: 10, panel: 'P1', s: 'S2' },
  { x: 3, y: 9, panel: 'P1', s: 'S2' },
  { x: 11, y: 21, panel: 'P2', s: 'S2' },
  { x: 12, y: 20, panel: 'P2', s: 'S2' },
  { x: 13, y: 19, panel: 'P2', s: 'S2' },
];
console.log('\nP3 hand pooled r =', handR(p3rows.map((r) => [r.x, r.y])).toFixed(4));
console.log('P3 hand S1-merged-across-panels r =', handR(p3rows.filter((r) => r.s === 'S1').map((r) => [r.x, r.y])).toFixed(4));
console.log('P3 hand (P1,S1) r =', handR(p3rows.filter((r) => r.s === 'S1' && r.panel === 'P1').map((r) => [r.x, r.y])).toFixed(4));
{
  const spec = scatterSpec({ rows: p3rows, colorField: 's', facetRowField: 'panel' });
  report('P3 facet×color union', spec, 'must SUPPRESS (per-(panel,series) r=−1 vs pooled +)');
}

// ─────────────────────────────────────────────────────────────────────────────
// P4 — computable r EXACTLY 0 beside positive groups: over-suppression check
// group Z: (1,1)(2,2)(3,1) → hand r = 0 exactly. group A r=+1. pooled positive.
// signs {0,+1} → no common sign → suppress (fail-safe direction; predicate-consistent).
// ─────────────────────────────────────────────────────────────────────────────
const p4rows = [
  { x: 1, y: 1, segment: 'Z' },
  { x: 2, y: 2, segment: 'Z' },
  { x: 3, y: 1, segment: 'Z' },
  { x: 4, y: 4, segment: 'A' },
  { x: 5, y: 5, segment: 'A' },
  { x: 6, y: 6, segment: 'A' },
];
console.log('\nP4 hand group-Z r =', String(handR(p4rows.filter((r) => r.segment === 'Z').map((r) => [r.x, r.y]))));
console.log('P4 hand pooled r =', handR(p4rows.map((r) => [r.x, r.y])).toFixed(4));
report('P4 exact-zero computable group + positive group', scatterSpec({ rows: p4rows, colorField: 'segment' }),
  'predicate: signs {0,+1} → suppress (fail-safe). Check no NaN / no narrate.');

// ─────────────────────────────────────────────────────────────────────────────
// P5 — constant-y group beside a computable agreeing group (NaN-leak check +
// zero-signal-beside-strong-positive from the role): group F constant y (null,
// excluded) + group A r=+1, pooled positive → narrates beside a genuinely flat
// series. groupRs=[+1] — NOT vacuous branch.
// ─────────────────────────────────────────────────────────────────────────────
const p5rows = [
  { x: 1, y: 1, segment: 'A' },
  { x: 2, y: 2, segment: 'A' },
  { x: 3, y: 3, segment: 'A' },
  { x: 10, y: 50, segment: 'F' },
  { x: 11, y: 50, segment: 'F' },
  { x: 12, y: 50, segment: 'F' },
];
console.log('\nP5 hand pooled r =', handR(p5rows.map((r) => [r.x, r.y])).toFixed(4));
report('P5 constant-y group beside agreeing computable group', scatterSpec({ rows: p5rows, colorField: 'segment' }),
  'no NaN; predicted NARRATES (flat group invisible to the gate)');

// ─────────────────────────────────────────────────────────────────────────────
// P6 — negative-zero display: pooled true r tiny negative → toFixed(3) → −0.
// signOf(−0)=0 → sign-neutral narrates. What string does the narrative emit?
// Need pooled tiny-negative with NO partition fields (no color/facet) so it
// narrates unconditionally. Fixture: near-symmetric cloud, r ≈ −0.0002.
// ─────────────────────────────────────────────────────────────────────────────
const p6rows = [
  { x: 1, y: 1 },
  { x: 2, y: 5 },
  { x: 3, y: 1.0006 },
  { x: 4, y: 5 },
  { x: 5, y: 1 },
];
console.log('\nP6 hand pooled r =', String(handR(p6rows.map((r) => [r.x, r.y]))));
report('P6 negative-zero rounding', scatterSpec({ rows: p6rows }), 'cosmetic: does it say "Correlation coefficient: -0"?');
