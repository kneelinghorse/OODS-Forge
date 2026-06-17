// Geo colour resolution (sprint-112 m01).
//
// The src/ geo adapters emit `var(--token, #hex)` colour strings that rely on the
// browser CSS cascade. The headless ECharts canvas cannot use the cascade, so —
// exactly as the s111 network/hierarchy adapters do — geo colours must be RESOLVED
// to concrete rgb/hex before they enter the option.
//
// This is the single chokepoint that routes every geo colour through the SHARED
// token-resolver (no duplicated oklch→rgb block lives here — resolveTokenToColor
// owns that). The inline hex inside each `var(...)` expression is preserved as the
// per-colour fallback, mirroring the s111 FALLBACK_PALETTE convention.

import { resolveTokenToColor } from '../echarts/token-resolver.js';

const VAR_EXPR = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/;

/**
 * Resolve a colour to a concrete (rgb/hex) value for the headless canvas. Accepts
 * a `var(--token, #fallback)` expression, a bare `--token`, or an already-concrete
 * colour (returned unchanged — the function is idempotent, so it is safe to apply
 * more than once). Returns the inline fallback (or the original string) when the
 * token is absent from @oods/tokens.
 */
export function resolveColor(value: string): string {
  const varMatch = value.match(VAR_EXPR);
  if (varMatch) {
    const [, token, fallback] = varMatch;
    return resolveTokenToColor(token) ?? fallback?.trim() ?? value;
  }
  if (value.startsWith('--')) {
    return resolveTokenToColor(value) ?? value;
  }
  return value;
}
