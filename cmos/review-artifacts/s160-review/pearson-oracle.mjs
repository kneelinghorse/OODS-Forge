// Independent Pearson oracle — NO import from the SUT. Recomputes every hand constant
// the s160 correlation tests rely on (F-SIMPSON, aggregate-complement, keep-controls, SIZED).
function pearsonRaw(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}
const r3 = (r) => (r === null ? null : Number(r.toFixed(3))); // pearson's 3-decimal contract

// 1. F-SIMPSON
const panels = {
  A: [[1, 10], [2, 9], [3, 8]],
  B: [[11, 20], [12, 19], [13, 18]],
  C: [[21, 30], [22, 29], [23, 28]],
};
for (const [name, pts] of Object.entries(panels)) {
  console.log(`panel ${name} r =`, pearsonRaw(pts.map(p => p[0]), pts.map(p => p[1])));
}
const all = Object.values(panels).flat();
const pooled = pearsonRaw(all.map(p => p[0]), all.map(p => p[1]));
console.log('F-SIMPSON pooled r =', pooled, '→ 3dec', r3(pooled));

// 2. aggregate-complement: cells (1,60)(2,70)(3,81) vs raw x=[1,2,2,3,3,3] y=[60,35,35,27,27,27]
console.log('agg cells r =', r3(pearsonRaw([1, 2, 3], [60, 70, 81])));
console.log('agg raw pooled r =', r3(pearsonRaw([1, 2, 2, 3, 3, 3], [60, 35, 35, 27, 27, 27])));

// 3. keep-control sign-consistent: A (1,10)(2,8)(3,6), B (1,20)(2,18)(3,16)
console.log('keep A r =', r3(pearsonRaw([1, 2, 3], [10, 8, 6])));
console.log('keep B r =', r3(pearsonRaw([1, 2, 3], [20, 18, 16])));
console.log('keep pooled r =', r3(pearsonRaw([1, 2, 3, 1, 2, 3], [10, 8, 6, 20, 18, 16])));

// 4. SIZED fixture: A rises (1,1)(2,2)(3,3), B falls (1,3)(2,2)(3,1) — pooled?
console.log('sized A r =', r3(pearsonRaw([1, 2, 3], [1, 2, 3])));
console.log('sized B r =', r3(pearsonRaw([1, 2, 3], [3, 2, 1])));
console.log('sized pooled r =', pearsonRaw([1, 2, 3, 1, 2, 3], [1, 2, 3, 3, 2, 1]));

// 5. vacuous keep-control pooled: (1,1)(2,2)(3,3)(4,4)(5,5)(6,6)
console.log('vacuous pooled r =', r3(pearsonRaw([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6])));

// 6. descendingScatter guard fixture: (1,3)(2,2)(3,1)
console.log('descending r =', r3(pearsonRaw([1, 2, 3], [3, 2, 1])));

// 7. m1 ∅-cell sums, both orders (hand check of the 0.3 constant, precision 5)
const vals = [1e9, -1e9, 0.1, 0.2];
console.log('row-order sum =', vals.reduce((a, b) => a + b, 0));
const sorted = [...vals].sort((a, b) => a - b);
console.log('ascending-sorted sum =', sorted.reduce((a, b) => a + b, 0));
const byAbs = [...vals].sort((a, b) => Math.abs(a) - Math.abs(b));
console.log('abs-sorted sum =', byAbs.reduce((a, b) => a + b, 0));
console.log('|0.30000007152557373 - 0.3| < 0.5e-5 ?', Math.abs(0.30000007152557373 - 0.3) < 0.5e-5);
