// MAIN-LOOP probe 5 — LayoutConcat section filters.
// spec.layout LayoutConcat carries `sections[].filters` (SectionFilter{field,operator,value}) — "dashboard
// sections that reference filtered variants of the normalized spec". Each section renders its own PANEL
// over its own row subset, so the section field splits the drawn marks exactly the way a FACET does.
// facetFields() (:314) returns [] for anything that is not LayoutFacet, so separableFields never sees it.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// Two regions; EACH falls; the between-region offset makes the pool rise.
const rows = [
  { x: 1, y: 30, region: 'EMEA' }, { x: 2, y: 20, region: 'EMEA' }, { x: 3, y: 10, region: 'EMEA' },
  { x: 4, y: 130, region: 'APAC' }, { x: 5, y: 120, region: 'APAC' }, { x: 6, y: 110, region: 'APAC' },
];
console.log('  drawn panel EMEA r =', pearson(rows.slice(0, 3).map((r) => [r.x, r.y])).toFixed(3));
console.log('  drawn panel APAC r =', pearson(rows.slice(3).map((r) => [r.x, r.y])).toFixed(3));
console.log('  pooled            r =', pearson(rows.map((r) => [r.x, r.y])).toFixed(3));

const X = { field: 'x', trait: 'EncodingX', type: 'quantitative' };
const Y = { field: 'y', trait: 'EncodingY', type: 'quantitative' };
const enc = { x: X, y: Y };
const base = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values: rows },
  marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'y over x' },
};

const concat = {
  ...base,
  layout: {
    trait: 'LayoutConcat', direction: 'horizontal',
    sections: [
      { id: 'emea', title: 'EMEA', filters: [{ field: 'region', operator: '==', value: 'EMEA' }] },
      { id: 'apac', title: 'APAC', filters: [{ field: 'region', operator: '==', value: 'APAC' }] },
    ],
  },
};
// DISCRIMINATING CONTROL: the same two panels expressed as a real FACET, which facetFields() DOES see.
const faceted = {
  ...base,
  layout: { trait: 'LayoutFacet', columns: { field: 'region' } },
};

function run(label, s) {
  const a = analyzeVizSpec(s);
  const n = generateNarrativeSummary(s);
  const kf = (n.keyFindings ?? []).filter((k) => /correlat/i.test(JSON.stringify(k)));
  console.log(`\n${label}`);
  console.log('  correlation:', a.correlation, a.correlation === undefined ? 'SUPPRESSED' : `NARRATED ${JSON.stringify(kf)}`);
  if (a.correlation !== undefined) console.log('  summary    :', n.summary);
  return a.correlation;
}

const rC = run('A. LayoutConcat with per-section filters (2 drawn panels, BOTH fall)', concat);
const rF = run('B. CONTROL same two panels as a LayoutFacet (facetFields sees it)', faceted);
const rP = run('C. CONTROL no layout at all (one panel, all 6 rows drawn together)', base);

console.log('\n#### VERDICT ####');
console.log('  concat  :', rC === undefined ? 'suppressed' : `NARRATED ${rC}`);
console.log('  facet   :', rF === undefined ? 'SUPPRESSED' : `narrated ${rF}`);
console.log('  no-layout:', rP === undefined ? 'suppressed' : `narrated ${rP}`);
if (rC !== undefined && rF === undefined) {
  console.log('  >>> CONFIRMED: the SAME two panels suppress as a facet and narrate as concat sections.');
}
