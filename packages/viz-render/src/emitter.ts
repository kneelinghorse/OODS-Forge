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
import { createFirstAppearanceRemap } from './first-appearance-remap.js';

/** A compiled/authored Vega-Lite top-level spec (what `dashboard.render` carries on a panel's `spec`). */
export type VegaLiteSpec = TopLevelSpec;

export interface RenderVegaLiteToSvgOptions {
  /**
   * Resolved brand tokens (CSS custom-property name -> value) the export should be
   * rendered on-brand with. THREADED in m02 so the emitter signature is final;
   * token APPLICATION into the spec lands in m04 (`prepareSpecForBrand`).
   */
  readonly tokens?: Readonly<Record<string, string>>;
  /**
   * s149 F6a (Approach B): override the compiled SVG's width/height so a caller (the
   * dashboard export) can size a chart panel to its grid span instead of keeping
   * Vega's intrinsic step-based (narrow, tall) size. Applied with `autosize:'fit'`
   * on an emitter-side clone — the passed spec is never mutated. BOTH undefined =
   * identity: every non-dashboard caller renders byte-for-byte as before.
   */
  readonly width?: number;
  readonly height?: number;
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

  const branded = prepareSpecForBrand(spec, options);
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
 * SEAM for m04 (brand-token inlining) + the s149 F6a span-derived sizing. m02 threads
 * the resolved tokens through unchanged (m04 will apply them to the spec's
 * config/encodings here). s149 F6a applies caller-supplied width/height so a dashboard
 * panel fills its grid span. Both operate on a CLONE — the passed spec object (the
 * dashboard's panelResults[i].spec, which is canonicalized for contentHash/specRef) is
 * never mutated. With no tokens and no dims this is the identity transform.
 */
function prepareSpecForBrand(
  spec: VegaLiteSpec,
  options: RenderVegaLiteToSvgOptions,
): VegaLiteSpec {
  const { width, height } = options;
  // s149 F6a: size the SVG to a target box. autosize:'fit' makes the WHOLE chart —
  // axes + legend included — fit width×height, so a 6/12 panel renders wide-and-short
  // (filling its span) rather than at Vega's intrinsic narrow-tall step width. The
  // spread is the emitter-side clone; the caller's spec stays untouched.
  if (width !== undefined || height !== undefined) {
    return {
      ...(spec as unknown as Record<string, unknown>),
      ...(width !== undefined ? { width } : {}),
      ...(height !== undefined ? { height } : {}),
      autosize: 'fit',
    } as unknown as VegaLiteSpec;
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
  // Single document-order pass over both definitions (`id="X"`) and references
  // (`url(#X)`), so a reference that precedes its definition still maps stably.
  const replacements = createFirstAppearanceRemap(
    [...svg.matchAll(/(?:\bid="|url\(#)([^")]+)/g)].map((match) => match[1]),
    (index) => `oods-id-${index}`,
  );

  let out = svg;
  replacements.forEach((stable, id) => {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`id="${escaped}"`, 'g'), `id="${stable}"`);
    out = out.replace(new RegExp(`url\\(#${escaped}\\)`, 'g'), `url(#${stable})`);
  });
  return out;
}
