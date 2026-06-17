// Shared ECharts token resolution (sprint-111 m01).
//
// ECharts' canvas renderer cannot use the CSS cascade, so it needs RESOLVED
// colours (rgb/hex), not `var(--token)` references. This module resolves an OODS
// design token to a concrete colour string, converting oklch() token values to
// sRGB. It is the SINGLE home for the ~70-LOC token-resolution block that was
// byte-identical across all four network/hierarchy ECharts adapters
// (treemap/sankey/sunburst/graph) — extracted here so the ported adapters import
// one implementation instead of re-duplicating it.
//
// Scope note: only the token→colour RESOLUTION is shared. Each adapter keeps its
// own FALLBACK_PALETTE + buildPalette (they differ — treemap uses an 8-colour
// fallback, the flow/network adapters a 9-colour one — and pick a per-type
// `count`), so the palette is intentionally NOT centralised here.

import tokensBundle from '@oods/tokens';

// ECharts needs resolved colors, not CSS variables (canvas renderer can't use CSS cascade)
// Token resolution map from @oods/tokens bundle
const CSS_VARIABLE_MAP: Record<string, string> =
  (tokensBundle?.cssVariables as Record<string, string>) ?? {};

export function resolveTokenToColor(token: string): string | undefined {
  const normalized = normalizeTokenName(token);
  const value = lookupTokenValue(normalized);
  if (value) {
    return formatColorValue(value);
  }
  // Try with --oods- prefix fallback
  const prefixed = normalized.startsWith('--oods-') ? undefined : `--oods-${normalized.slice(2)}`;
  if (!prefixed) {
    return undefined;
  }
  const fallback = lookupTokenValue(prefixed);
  return fallback ? formatColorValue(fallback) : undefined;
}

function normalizeTokenName(name: string): string {
  return name.startsWith('--') ? name : `--${name}`;
}

function lookupTokenValue(name: string): string | undefined {
  return CSS_VARIABLE_MAP[name];
}

function formatColorValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.toLowerCase().startsWith('oklch(')) {
    return convertOklchToRgb(trimmed) ?? trimmed;
  }
  return trimmed;
}

function convertOklchToRgb(input: string): string | undefined {
  const match = input
    .replace(/deg/gi, '')
    .replace(/\s+/g, ' ')
    .match(/oklch\(\s*([0-9.+-]+%?)\s+([0-9.+-]+)\s+([0-9.+-]+)\s*\)/i);

  if (!match) return undefined;

  const [, lRaw, cRaw, hRaw] = match;
  const l = lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
  const c = parseFloat(cRaw);
  const h = parseFloat(hRaw);

  if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h)) {
    return undefined;
  }

  const hr = (h * Math.PI) / 180;
  const a = Math.cos(hr) * c;
  const b = Math.sin(hr) * c;

  const l1 = l + 0.3963377774 * a + 0.2158037573 * b;
  const m1 = l - 0.1055613458 * a - 0.0638541728 * b;
  const s1 = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l1 ** 3;
  const m3 = m1 ** 3;
  const s3 = s1 ** 3;

  const linearToSrgb = (v: number): number => {
    if (v <= 0) return 0;
    if (v >= 1) return 1;
    return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  };

  const clamp = (ch: number): number => Math.round(Math.min(255, Math.max(0, ch * 255)));

  const rLinear = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLinear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLinear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return `rgb(${clamp(linearToSrgb(rLinear))}, ${clamp(linearToSrgb(gLinear))}, ${clamp(linearToSrgb(bLinear))})`;
}
