import { describe, expect, it } from 'vitest';
import { toVegaLiteSpec, type NormalizedVizSpec } from '@oods/viz-core';
import { evaluateContrastPillar } from '../../src/tools/certify-contrast.js';

// certify contrast pillar engine (s137 m02; s138 m03 rendered-reality; s139 m02 grade the
// emitted bytes) — the 3-role contrast verdict over the OODS viz-scale palette Forge BAKES
// into the compiled spec. As of s139 the engine reads the color hexes off the COMPILED
// Vega-Lite spec (scale.range / mark.color) — passed in as the 2nd arg — instead of
// re-classifying the raw IR. These tests exercise the engine directly (the handler owns IR
// validation); each compiles the fixture via toVegaLiteSpec and grades the result, pinning
// the memo §3/§3a tri-state mapping:
//   role-C mark-vs-canvas WCAG 3:1 fail  -> 'fail'
//   role-A categorical CIEDE2000 min-over-CVD  <2 fail / 2-10 pass+warn / >=10 pass
//   role-B (no baked palette: gradient OR divergence) -> 'exempt'

type ColorInput = { field?: string; type?: string; scale?: string; trait?: string };

/**
 * Minimal NormalizedVizSpec-shaped input carrying only the fields the engine + the
 * toVegaLiteSpec compile read. x/y encodings + a11y.description are REQUIRED (s139): the
 * engine now compiles the spec, and toVegaLiteSpec throws without an encoding or an
 * a11y.description. A `color` opt adds a color channel; otherwise the chart is
 * single-series and the adapter bakes categorical-01 as mark.color.
 */
function mk(opts: {
  color?: ColorInput;
  values?: Array<Record<string, unknown>>;
  tokens?: Record<string, string | number>;
}): NormalizedVizSpec {
  const spec: Record<string, unknown> = {
    marks: [{ trait: 'MarkBar' }],
    encoding: {
      x: { field: 'x', trait: 'EncodingX' },
      y: { field: 'y', trait: 'EncodingY' },
      ...(opts.color
        ? { color: { field: opts.color.field ?? 'series', trait: 'EncodingColor', ...opts.color } }
        : {}),
    },
    data: { values: opts.values ?? [] },
    a11y: { description: 'contrast engine fixture' },
  };
  if (opts.tokens) spec.config = { tokens: opts.tokens };
  return spec as unknown as NormalizedVizSpec;
}

/** Compile the fixture and grade the emitted bytes — the s139 2-arg call shape. */
const grade = (spec: NormalizedVizSpec) => evaluateContrastPillar(spec, toVegaLiteSpec(spec));

const seriesRows = (labels: string[]) => labels.map((s) => ({ x: 'q', y: 1, series: s }));

describe('certify-contrast — role-C (WCAG mark-vs-canvas) + default palette', () => {
  it('a single-series chart (no color encoding) -> pass on categorical-01 (baked mark.color) vs the canvas', () => {
    const out = grade(mk({}));
    expect(out.contrast).toBe('pass');
    // The rendered-contrast caveat (s138), no longer the declared-intent one.
    expect(out.contrastNote).toContain('bakes into the compiled spec');
  });

  it('the default OODS categorical palette (6 series) -> pass, in the 2-10 warn band (memo §3a)', () => {
    // min-pairwise ΔE00 (min-over-CVD) for the 6-slot palette is ~7.25 — a pass, but
    // below the >=10 clean-pass target, so a distinguishability caution rides along.
    const out = grade(
      mk({ color: { field: 'series', type: 'nominal' }, values: seriesRows(['a', 'b', 'c', 'd', 'e', 'f']) }),
    );
    expect(out.contrast).toBe('pass');
    expect(out.contrastNote).toContain('Distinguishability caution');
  });

  it('a near-white config.tokens override on the consumed slot -> role-C fail (WCAG-normative path)', () => {
    // #F8F8F8 baked into mark.color vs the ~#FCFCFD canvas is < 3:1 — the mark is
    // invisible on the panel. Single-series: the override rides categorical-01 -> mark.color.
    const out = grade(mk({ tokens: { '--oods-viz-scale-categorical-01': '#F8F8F8' } }));
    expect(out.contrast).toBe('fail');
    expect(out.contrastNote).toContain('Role-C');
  });
});

describe('certify-contrast — role-A (categorical distinguishability, min-over-CVD)', () => {
  it('a low-contrast config.tokens override (near-identical greys) -> fail on role-A (<2), even though role-C passes', () => {
    // The three greys each pass role-C vs the canvas (3.85-4.37:1) — the failure is
    // purely categorical indistinguishability (min-pairwise ΔE00-over-CVD ~1.19 < 2).
    // Baked into scale.range and sliced to the 3 consumed slots.
    const out = grade(
      mk({
        color: { field: 'series', type: 'nominal' },
        values: seriesRows(['a', 'b', 'c']),
        tokens: {
          '--oods-viz-scale-categorical-01': '#777777',
          '--oods-viz-scale-categorical-02': '#7A7A7A',
          '--oods-viz-scale-categorical-03': '#808080',
        },
      }),
    );
    expect(out.contrast).toBe('fail');
    expect(out.contrastNote).toContain('Role-A');
  });
});

describe('certify-contrast — role-B (no baked palette) is WCAG-exempt', () => {
  it('a quantitative color encoding (baked NO range) -> exempt (gradient essential exception)', () => {
    const out = grade(mk({ color: { field: 'value', type: 'quantitative' } }));
    expect(out.contrast).toBe('exempt');
    expect(out.contrastNote).toContain('exception');
  });

  it('a linear-scaled color encoding -> exempt', () => {
    const out = grade(mk({ color: { field: 'value', scale: 'linear' } }));
    expect(out.contrast).toBe('exempt');
  });

  it('a divergence binding (color trait EncodingDetail, compiled quantitative, no baked range) -> exempt, NEVER a false pass', () => {
    // The reborn-hollow case (s138 review): the bake gate leaves this quantitative, so the
    // compiled spec bakes no range — grading the emitted bytes yields 'exempt', dissolving
    // the old false 'pass' from the deleted grade-side classifier.
    const out = grade(mk({ color: { field: 'series', trait: 'EncodingDetail', type: undefined } }));
    expect(out.contrast).toBe('exempt');
  });
});

describe('certify-contrast — honesty + determinism', () => {
  it('an unresolvable canvas (non-color override on the canvas token) -> unchecked, never a silent pass', () => {
    // The palette always resolves (the six OODS tokens are always available), so the
    // honest 'unchecked' path is reached via an unresolvable CANVAS reference.
    const out = grade(mk({ tokens: { '--oods-sys-surface-canvas': 'not-a-color' } }));
    expect(out.contrast).toBe('unchecked');
    expect(out.contrastNote).toContain('Could not resolve');
  });

  it('a non-color override on a palette slot is IGNORED — the slot renders the OODS default, which certify grades (rendered-reality)', () => {
    // Under s138 the adapter bakes the OODS default when an override is not a color, so
    // the chart still renders a real color and certify grades exactly that (categorical-01
    // baked into mark.color vs the canvas -> pass) — never a silent 'unchecked'.
    const out = grade(mk({ tokens: { '--oods-viz-scale-categorical-01': 'not-a-color' } }));
    expect(out.contrast).toBe('pass');
  });

  it('is a pure function of the IR — identical verdict across repeated calls', () => {
    const spec = mk({ color: { field: 'series', type: 'nominal' }, values: seriesRows(['a', 'b', 'c']) });
    const a = grade(spec);
    const b = grade(spec);
    expect(a).toEqual(b);
  });
});
