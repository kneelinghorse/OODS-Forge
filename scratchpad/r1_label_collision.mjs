// Verbatim re-implementation of numericTokens + unaccountedTokens from
// narrated-value-provenance-sweep-s160.spec.ts lines 43-89
const NUM_TOKEN = /\d{1,3}(?:,\d{3})+(?:\.\d+)?%?|\d+(?:\.\d+)?%?/g;
function numericTokens(text){ return text.match(NUM_TOKEN) ?? []; }
function unaccountedTokens(text, emissions, allowedStrings){
  const emissionBudget = new Map();
  for (const e of emissions) for (const t of numericTokens(e.formatted)) emissionBudget.set(t,(emissionBudget.get(t)??0)+1);
  const labelTokens = new Set();
  for (const s of allowedStrings) if (s) for (const t of numericTokens(s)) labelTokens.add(t);
  const violations = [];
  for (const t of numericTokens(text)){
    if (labelTokens.has(t)) { continue; }
    const rem = emissionBudget.get(t) ?? 0;
    if (rem>0) emissionBudget.set(t, rem-1); else violations.push(t);
  }
  return violations;
}
const seed = 'Total value: 30. Peak reading 30 appeared untagged.';
console.log('B2 seed, label=["30"]     ->', JSON.stringify(unaccountedTokens(seed,[{formatted:'30'}],['30'])));
console.log('B2 seed, no label         ->', JSON.stringify(unaccountedTokens(seed,[{formatted:'30'}],[])));
console.log('B2 canonical spec test    ->', JSON.stringify(unaccountedTokens(seed,[{formatted:'30'}],[])),'(the shipped :159 test asserts ["30"])');
