// S165 PRE-LOCK CRITIC — lens does-it-kill-ABC, part 3:
// blast radius. Under s164, a spec with a CATEGORICAL partition and groupingFields=∅ leaves G1 a NO-OP
// (`groupingFields.length===0 → suppresses:false`) — the decision is G0's `classifyGroupDirection`,
// which is UNGATED by ρ. The proposal feeds `separableFields` (which CONTAINS the partition fields) as
// the scan input, so G1' becomes ACTIVE on that entire corpus, now voting through the ρ=0.5 floor.
// Consequence: every series scattered below ρ votes FLAT → votes=[] → clause (c) → SUPPRESS.
import { analyzeVizSpec, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { readFileSync } from 'node:fs';
const src = readFileSync('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/scratchpad/S165CRIT_does_it_kill_ABC.mjs', 'utf8');
const body = src.split('// ───────────────────────── fixtures')[0].split("dist/index.js';")[1];
const { decide } = new Function('analyzeVizSpec', 'resolvePrimaryChannels', `${body}\nreturn { decide };`)(analyzeVizSpec, resolvePrimaryChannels);

const mk = (id, marks, enc, values) => ({ $schema: 'https://oods.dev/viz-spec/v1', id, name: id, data: { name: 'd', values }, marks: marks.map((t) => ({ trait: t, encodings: enc })), encoding: enc, a11y: { description: 'y over x' } });
function pear(xs, ys) { const n = xs.length; const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let nu = 0, dx = 0, dy = 0; for (let i = 0; i < n; i++) { nu += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; } return Number((nu / Math.sqrt(dx * dy)).toFixed(3)); }

// K4: three HONEST, mildly-positive scattered series. Every series r is BELOW ρ=0.5; pooled is positive.
// No Simpson: not one series falls.
const scatter = [0, 6, 1, 8, 3]; // r = 0.376 over x=1..5 — honest positive drift, below ρ
const seriesY = {
  p: scatter.map((v) => 10 + v),
  q: scatter.map((v) => 20 + v),
  r: scatter.map((v) => 30 + v),
};
const K4_rows = [];
for (const seg of Object.keys(seriesY)) for (let i = 0; i < 5; i++) K4_rows.push({ x: i + 1, y: seriesY[seg][i], seg });
const K4_enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  color: { field: 'seg', trait: 'EncodingColor' },
};
const K4 = mk('K4', ['MarkPoint'], K4_enc, K4_rows);

console.log('K4 — honest 3-series, every series scattered BELOW the ρ=0.5 opposition floor, none falls');
for (const seg of Object.keys(seriesY)) console.log(`   series ${seg}: r = ${pear([1, 2, 3, 4, 5], seriesY[seg])}   (|r| < ρ=0.5 → votes FLAT under classifyDrawnSeriesDirection)`);
console.log(`   pooled over all 15 marks: r = ${pear(K4_rows.map((r) => r.x), K4_rows.map((r) => r.y))}`);

const tS = [], tP = [];
const s = decide(K4, 'shipped', tS);
const p = decide(K4, 'draft-amended-early-return', tP);
console.log(`\n   dist analyzeVizSpec.correlation = ${analyzeVizSpec(K4).correlation}`);
console.log(`   partition=${JSON.stringify(s.partitionFields)} grouping=${JSON.stringify(s.groupingFields)} separable=${JSON.stringify(p.separableFields)}`);
console.log(`\n   SHIPPED  -> ${s.r === undefined ? 'SUPPRESSED' : 'NARRATES ' + s.r}`);
console.log(`      ${s.why}`);
console.log(`\n   PROPOSAL -> ${p.r === undefined ? 'SUPPRESSED' : 'NARRATES ' + p.r}`);
console.log(`      ${p.why}`);
for (const t of tP) console.log(`      ${t}`);
console.log(`\n   >>> ${s.r !== undefined && p.r === undefined ? '!!! NEW OVER-SUPPRESSION on an HONEST chart (no falling band anywhere) — a keep-control class the memo does not budget' : 'no change'}`);

// K5: the same shape but only 2 series and a facet — to show it is not a one-off.
const K5_rows = [];
for (const seg of ['p', 'q']) for (let i = 0; i < 5; i++) K5_rows.push({ x: i + 1, y: seriesY[seg][i], seg });
const K5 = mk('K5', ['MarkLine'], K4_enc, K5_rows);
const s5 = decide(K5, 'shipped'), p5 = decide(K5, 'draft-amended-early-return');
console.log(`\nK5 (2-series line, same scatter): dist=${analyzeVizSpec(K5).correlation}  SHIPPED=${s5.r}  PROPOSAL=${p5.r}`);
console.log(`      ${p5.why}`);
