import tokensJson from './tailwind/tokens.json' with { type: 'json' };
import cssVariablesByScope from './css-variables-by-scope.json' with { type: 'json' };
const source = tokensJson ?? {};
const tokens = source.tokens ?? {};
const flatTokens = source.flat ?? {};
const cssVariables = source.cssVariables ?? {};
const meta = source.meta ?? {};
const prefix = source.prefix ?? 'oods';

export { tokens, flatTokens, cssVariables, cssVariablesByScope, meta, prefix };
export default { tokens, flatTokens, cssVariables, cssVariablesByScope, meta, prefix };
