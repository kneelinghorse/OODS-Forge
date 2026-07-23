const NUM_TOKEN = /\d{1,3}(?:,\d{3})+(?:\.\d+)?%?|\d+(?:\.\d+)?%?/g;
function numericTokens(text){ return text.match(NUM_TOKEN) ?? []; }
function unaccountedTokens(text, emissions, allowedStrings){
  const emissionBudget = new Map();
  for (const e of emissions) for (const t of numericTokens(e.formatted)) emissionBudget.set(t,(emissionBudget.get(t)??0)+1);
  const labelTokens = new Set();
  for (const s of allowedStrings) if (s) for (const t of numericTokens(s)) labelTokens.add(t);
  const violations=[];
  for (const t of numericTokens(text)){
    if (labelTokens.has(t)){ continue; }
    const rem = emissionBudget.get(t) ?? 0;
    if (rem>0) emissionBudget.set(t, rem-1); else violations.push(t);
  }
  return violations;
}
// B2 seed WITHOUT colliding label (the chartered fix target):
console.log('B2 no-label  :', JSON.stringify(unaccountedTokens('Total value: 30. Peak reading 30 appeared untagged.', [{formatted:'30'}], [])));
// candidate: SAME but with label '30'
console.log('with label 30:', JSON.stringify(unaccountedTokens('Total value: 30. Peak reading 30 appeared untagged.', [{formatted:'30'}], ['30'])));
// candidate control: no label
console.log('ctrl no label:', JSON.stringify(unaccountedTokens('Total value: 30. Peak reading 30 appeared untagged.', [{formatted:'30'}], ['30'].slice(0,0))));
