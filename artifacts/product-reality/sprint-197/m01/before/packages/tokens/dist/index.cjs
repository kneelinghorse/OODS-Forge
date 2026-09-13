'use strict';

const tokensJson = require('./tailwind/tokens.json');
const cssVariablesByScope = require('./css-variables-by-scope.json');

const tokens = tokensJson.tokens;
const flatTokens = tokensJson.flat;
const cssVariables = tokensJson.cssVariables;
const meta = tokensJson.meta ?? {};
const prefix = tokensJson.prefix ?? 'oods';

module.exports = {
  tokens,
  flatTokens,
  cssVariables,
  cssVariablesByScope,
  meta,
  prefix,
  default: { tokens, flatTokens, cssVariables, cssVariablesByScope, meta, prefix },
};
