// Deterministic Vega-Lite -> SVG emitter (sprint-115 m02).
//
// Compiles a Vega-Lite spec to a Vega spec, instantiates a HEADLESS Vega view
// (renderer 'none' -> no DOM, no canvas, no jsdom), and returns the rendered SVG
// string. The string is BYTE-STABLE run-to-run and machine-to-machine (the m01
// determinism contract, seam (d)):
//   - text-metric measurement is pinned to Vega's arithmetic estimator
//     (`textMetrics.canvas(false)`), so glyph advance widths never depend on a
//     platform font or a native `canvas` module being present;
//   - Vega's auto-generated element ids (clip-path / gradient ids use a
//     PROCESS-GLOBAL counter -> `clip1`, `clip2`, ...) are normalized to stable,
//     first-appearance-ordered tokens so two renders of the same spec are identical
//     regardless of how many views were rendered before them in the process;
//   - hover + animation are inert under a one-shot headless `runAsync()` + `toSVG()`.
//
// This module deliberately holds NO dashboard knowledge. It renders one VL spec to
// one SVG. The dashboard.render wiring (composing panels into an HTML document) is
// m03; brand-token APPLICATION is m04 (the `tokens` option is threaded here so the
// emitter signature is stable, but is not yet applied — see `prepareSpecForBrand`).

import { compile } from 'vega-lite';
import type { TopLevelSpec } from 'vega-lite';
import { parse, View, textMetrics } from 'vega';

/** A compiled/authored Vega-Lite top-level spec (what `dashboard.render` carries on a panel's `spec`). */
export type VegaLiteSpec = TopLevelSpec;

export interface RenderVegaLiteToSvgOptions {
  /**
   * Resolved brand tokens (CSS custom-property name -> value) the export should be
   * rendered on-brand with. THREADED in m02 so the emitter signature is final;
   * token APPLICATION into the spec lands in m04 (`prepareSpecForBrand`).
   */
  readonly tokens?: Readonly<Record<string, string>>;
}

/**
 * Render a Vega-Lite spec to a deterministic, headless SVG string.
 *
 * @throws if the spec fails to compile or parse (the caller decides the fallback;
 *   `dashboard.render` emits an a11y-described error placeholder per seam (b)).
 */
export async function renderVegaLiteToSvg(
  spec: VegaLiteSpec,
  options: RenderVegaLiteToSvgOptions = {},
): Promise<string> {
  pinDeterministicTextMetrics();

  const branded = prepareSpecForBrand(spec, options.tokens);
  const compiled = compile(branded);
  const view = new View(parse(compiled.spec), { renderer: 'none' });
  // Silence Vega's logger so warnings never leak to stdout/stderr (and so output
  // is purely the SVG string). None = 0.
  view.logLevel(0);

  try {
    await view.runAsync();
    const svg = await view.toSVG();
    return normalizeAutoIds(svg);
  } finally {
    // Release the dataflow + any pending timers so repeated renders don't leak.
    view.finalize();
  }
}

/**
 * Pin Vega's text measurement to the arithmetic estimator (never the native
 * `canvas` path). Idempotent; cheap. Called per render so a determinism guarantee
 * holds even if something else in the process flipped the flag back on.
 */
function pinDeterministicTextMetrics(): void {
  textMetrics.canvas(false);
}

/**
 * SEAM for m04 (brand-token inlining). m02 threads the resolved tokens through
 * unchanged so the emitter signature is stable; m04 will apply them to the spec
 * (e.g. category palette, axis/label colors) here. Identity transform for now.
 */
function prepareSpecForBrand(
  spec: VegaLiteSpec,
  tokens: Readonly<Record<string, string>> | undefined,
): VegaLiteSpec {
  if (!tokens) {
    return spec;
  }
  // m04: map resolved tokens onto the spec's config/encodings. Until then the
  // tokens do not alter the rendered output.
  return spec;
}

/**
 * Normalize Vega's auto-generated element ids to stable, first-appearance-ordered
 * tokens. Vega assigns clip-path / gradient ids from a PROCESS-GLOBAL counter, so
 * the raw SVG for the same spec differs by how many views were rendered earlier in
 * the process (`clip1` vs `clip2`). Remapping every `id="..."` / `url(#...)` /
 * `clip-path="url(#...)"` reference by document order makes the output independent
 * of that counter while preserving the def<->ref linkage.
 *
 * Vega's SVG output emits `id` attributes ONLY for these auto-generated defs, so
 * normalizing all of them is safe (there are no author-meaningful ids to clobber).
 */
function normalizeAutoIds(svg: string): string {
  const order: string[] = [];
  const seen = new Set<string>();
  // Single document-order pass over both definitions (`id="X"`) and references
  // (`url(#X)`), so a reference that precedes its definition still maps stably.
  for (const match of svg.matchAll(/(?:\bid="|url\(#)([^")]+)/g)) {
    const id = match[1];
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }

  let out = svg;
  order.forEach((id, index) => {
    const stable = `oods-id-${index}`;
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`id="${escaped}"`, 'g'), `id="${stable}"`);
    out = out.replace(new RegExp(`url\\(#${escaped}\\)`, 'g'), `url(#${stable})`);
  });
  return out;
}
