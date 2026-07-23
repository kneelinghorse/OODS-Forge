// s160 adversarial review — parent-defect re-kill S4 (s159 LOW survivor, ∅-cell Total nulled):
// no-dimension MarkBar y-only sum over [1e9, -1e9, 0.1, 0.2] — the honest Total must NARRATE
// (pre-s160 the guard's row-order sum diverged from the analysis stableSum → totalPhantom →
// the honest Total was silently nulled and the narrative degraded to "4 rows analysed.").
//
// HAND ORACLE (independent — explicit IEEE-754 arithmetic, never the SUT's stableSum):
//   stable (ascending) order: -1e9, 0.1, 0.2, 1e9
//   ((((-1e9) + 0.1) + 0.2) + 1e9)  — computed inline below as the expected constant (~0.3;
//   the true real-number sum is 0.3, fp gives ≈0.30000007152557373; display rounds to "0.3").
//   Extrema stay HONESTLY SILENT: raw 1e9 / -1e9 are drawn on NO mark (the chart draws ONE bar
//   ≈0.3) — pinned INTENDED behavior per memo §2-m1.
const path = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.cjs';
const { generateNarrativeSummary } = require(path);

const failures = [];
function check(name, cond, detail) {
  if (!cond) failures.push(`${name}: ${detail}`);
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${name}${cond ? '' : ' :: ' + detail}`);
}

function noDimBarSpec(values) {
  const encoding = { y: { field: 'value', trait: 'EncodingY', aggregate: 'sum' } };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'nodim', name: 'nodim',
    data: { name: 'nd', values: values.map((value) => ({ value })) },
    marks: [{ trait: 'MarkBar', encodings: { ...encoding } }],
    encoding,
    a11y: { description: 'a single summed bar' },
  };
}

// independent hand constant — explicit ascending-order chained addition
const HAND_STABLE = (((-1e9) + 0.1) + 0.2) + 1e9;
console.log('hand-computed stable-order constant:', HAND_STABLE);
check('oracle sanity: hand constant is ~0.3 (|Δ| < 1e-6)', Math.abs(HAND_STABLE - 0.3) < 1e-6, String(HAND_STABLE));

const res = generateNarrativeSummary(noDimBarSpec([1e9, -1e9, 0.1, 0.2]));
console.log('summary:', res.summary);
console.log('keyFindings:', JSON.stringify(res.keyFindings));
console.log('analysis.total:', res.analysis.total, 'max:', JSON.stringify(res.analysis.max), 'min:', JSON.stringify(res.analysis.min));

// 1) the honest Total NARRATES (not nulled)
check('S4: analysis.total is defined (was silently nulled at s159 HEAD)', res.analysis.total !== undefined,
  `total=${res.analysis.total}`);
check('S4: analysis.total ≈ 0.3 against the HAND constant (|Δ| ≤ 1e-12)',
  res.analysis.total !== undefined && Math.abs(res.analysis.total - HAND_STABLE) <= 1e-12,
  `total=${res.analysis.total} hand=${HAND_STABLE}`);
const totalFinding = res.keyFindings.find((f) => /^Total /.test(f));
check('S4: "Total …:" keyFinding present', totalFinding !== undefined, JSON.stringify(res.keyFindings));
check('S4: Total keyFinding displays 0.3', totalFinding !== undefined && /0[.,]3\b/.test(totalFinding),
  String(totalFinding));

// 2) extrema HONESTLY SILENT (1e9 / -1e9 are on no drawn mark; pinned intended)
check('S4: analysis.max undefined', res.analysis.max === undefined, JSON.stringify(res.analysis.max));
check('S4: analysis.min undefined', res.analysis.min === undefined, JSON.stringify(res.analysis.min));
check('S4: no High/Low keyFindings', !res.keyFindings.some((f) => /^(High|Low) /.test(f)),
  JSON.stringify(res.keyFindings));
check('S4: narrative does NOT degrade to the bare "rows analysed." fallback',
  !res.keyFindings.some((f) => /rows analysed\./.test(f)), JSON.stringify(res.keyFindings));
check('S4: no phantom 1e9 narration', !/1,?000,?000,?000|1e\+?9/i.test([res.summary, ...res.keyFindings].join(' | ')),
  [res.summary, ...res.keyFindings].join(' | '));

// 3) keep-control: [1,2,3] → Total 6 still narrates
const ctl = generateNarrativeSummary(noDimBarSpec([1, 2, 3]));
check('S4 control: [1,2,3] total = 6', ctl.analysis.total === 6, `total=${ctl.analysis.total}`);
check('S4 control: Total keyFinding shows 6', ctl.keyFindings.some((f) => /^Total .*6/.test(f)),
  JSON.stringify(ctl.keyFindings));

console.log(failures.length === 0 ? '\nS4 RE-KILL CONFIRMED (all checks pass)' : `\nS4 SURVIVOR ALIVE / WEAKENED: ${failures.length} failure(s)`);
process.exit(failures.length === 0 ? 0 : 1);
