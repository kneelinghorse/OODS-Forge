// Re-implement unaccountedTokens verbatim from the spec (lines 43-89) to test the escape claim.
const NUM_TOKEN = /\d{1,3}(?:,\d{3})+(?:\.\d+)?%?|\d+(?:\.\d+)?%?/g;
function numericTokens(text){ return text.match(NUM_TOKEN) ?? []; }
function unaccountedTokens(text, emissions, allowedStrings){
  const emissionBudget = new Map();
  for(const emission of emissions){ for(const token of numericTokens(emission.formatted)){ emissionBudget.set(token,(emissionBudget.get(token)??0)+1);} }
  const labelTokens = new Set();
  for(const source of allowedStrings){ if(source){ for(const token of numericTokens(source)){ labelTokens.add(token);} } }
  const violations=[];
  for(const token of numericTokens(text)){
    if(labelTokens.has(token)){ continue; }
    const remaining = emissionBudget.get(token) ?? 0;
    if(remaining>0){ emissionBudget.set(token, remaining-1); } else { violations.push(token); }
  }
  return violations;
}
console.log('WITH label 30 (escape?):', JSON.stringify(unaccountedTokens('Total value: 30. Peak reading 30 appeared untagged.', [{formatted:'30'}], ['30'])));
console.log('WITHOUT label (caught?): ', JSON.stringify(unaccountedTokens('Total value: 30. Peak reading 30 appeared untagged.', [{formatted:'30'}], [])));
