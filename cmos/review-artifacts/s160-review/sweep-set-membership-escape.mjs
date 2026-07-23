// Repro: the provenance sweep's unaccountedTokens is SET-membership over the union of all
// emission tokens — verbatim re-implementation of the test helper from
// packages/viz-core/test/narrated-value-provenance-sweep-s160.spec.ts (lines 38-67), no SUT import.
// Two properties:
//  (1) an UNTAGGED raw interpolation whose token equals ANY tagged emission's token escapes
//      (only the LABEL-numeral collision class is disclosed in memo section 7, not this sibling);
//  (2) an EMPTY narrative yields zero violations — the corpus arm asserts no minimum
//      token/emission count, so a hollowed corpus narrative passes silently.
const NUM_TOKEN = /\d[\d,]*(?:\.\d+)?%?/g;
const numericTokens = (text) => text.match(NUM_TOKEN) ?? [];
function unaccountedTokens(text, emissions, allowedStrings) {
  const allowed = new Set();
  for (const emission of emissions) for (const t of numericTokens(emission.formatted)) allowed.add(t);
  for (const s of allowedStrings) if (s) for (const t of numericTokens(s)) allowed.add(t);
  return numericTokens(text).filter((t) => !allowed.has(t));
}

// (1) tagged Total emission "30"; a raw untagged `${x}` also prints 30 elsewhere in the text:
const emissions = [{ kind: 'total', value: 30, formatted: '30' }];
const text = 'Total value: 30. Raw phantom mean 30 appeared untagged.';
console.log('escape (expected [] = the raw duplicate token is NOT caught):',
  unaccountedTokens(text, emissions, []));

// (2) empty narrative — zero emissions, zero tokens, zero violations, test green:
console.log('empty-extraction silent pass (expected []):', unaccountedTokens('', [], []));

// control — a raw token NOT colliding with any emission IS caught:
console.log('control (expected ["42.5"]):',
  unaccountedTokens('phantom mean 42.5', emissions, []));
