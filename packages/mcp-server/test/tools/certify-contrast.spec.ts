import { describe, expect, it } from 'vitest';
import type { NormalizedVizSpec } from '@oods/viz-core';
import { evaluateContrastPillar } from '../../src/tools/certify-contrast.js';

// certify contrast pillar engine (s137 m02; s138 m03 rendered-reality) — the 3-role
// contrast verdict over the OODS viz-scale palette Forge BAKES into the compiled spec.
// These tests exercise the engine directly (it reads the IR's color channel + data +
// config.tokens via the SHARED resolveCategoricalPalette; it never validates the IR —
// that is the handler's job), pinning the memo §3a tri-state mapping:
//   role-C mark-vs-canvas WCAG 3:1 fail  -> 'fail'
//   role-A categorical CIEDE2000 min-over-CVD  <2 fail / 2-10 pass+warn / >=10 pass
//   role-B sequential/diverging gradient -> 'exempt'

type ColorInput = { field?: string; type?: string; scale?: string };

/** Minimal NormalizedVizSpec-shaped input carrying only the fields the engine reads. */
function mk(opts: {
  color?: ColorInput;
  values?: Array<Record<string, unknown>>;
  tokens?: Record<string, string | number>;
}): NormalizedVizSpec {
  const spec: Record<string, unknown> = {
    marks: [{ trait: 'MarkBar' }],
    encoding: opts.color
      ? { color: { field: opts.color.field ?? 'series', trait: 'EncodingColor', ...opts.color } }
      : {},
    data: { values: opts.values ?? [] },
  };
  if (opts.tokens) spec.config = { tokens: opts.tokens };
  return spec as unknown as NormalizedVizSpec;
}

const seriesRows = (labels: string[]) => labels.map((s) => ({ series: s, y: 1 }));

describe('certify-contrast — role-C (WCAG mark-vs-canvas) + default palette', () => {
  it('a single-series chart (no color encoding) -> pass on categorical-01 vs the canvas', () => {
    const out = evaluateContrastPillar(mk({}));
    expect(out.contrast).toBe('pass');
    // The rendered-contrast caveat (s138), no longer the declared-intent one.
    expect(out.contrastNote).toContain('bakes into the compiled spec');
  });

  it('the default OODS categorical palette (6 series) -> pass, in the 2-10 warn band (memo §3a)', () => {
    // min-pairwise ΔE00 (min-over-CVD) for the 6-slot palette is ~7.25 — a pass, but
    // below the >=10 clean-pass target, so a distinguishability caution rides along.
    const out = evaluateContrastPillar(
      mk({ color: { field: 'series', type: 'nominal' }, values: seriesRows(['a', 'b', 'c', 'd', 'e', 'f']) }),
    );
    expect(out.contrast).toBe('pass');
    expect(out.contrastNote).toContain('Distinguishability caution');
  });

  it('a near-white config.tokens override on the consumed slot -> role-C fail (WCAG-normative path)', () => {
    // #F8F8F8 vs the ~#FCFCFD canvas is < 3:1 — the mark is invisible on the panel.
    const out = evaluateContrastPillar(mk({ tokens: { '--oods-viz-scale-categorical-01': '#F8F8F8' } }));
    expect(out.contrast).toBe('fail');
    expect(out.contrastNote).toContain('Role-C');
  });
});

describe('certify-contrast — role-A (categorical distinguishability, min-over-CVD)', () => {
  it('a low-contrast config.tokens override (near-identical greys) -> fail on role-A (<2), even though role-C passes', () => {
    // The three greys each pass role-C vs the canvas (3.85-4.37:1) — the failure is
    // purely categorical indistinguishability (min-pairwise ΔE00-over-CVD ~1.19 < 2).
    const out = evaluateContrastPillar(
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

describe('certify-contrast — role-B (sequential/diverging) is WCAG-exempt', () => {
  it('a quantitative color encoding -> exempt (gradient essential exception)', () => {
    const out = evaluateContrastPillar(mk({ color: { field: 'value', type: 'quantitative' } }));
    expect(out.contrast).toBe('exempt');
    expect(out.contrastNote).toContain('exception');
  });

  it('a linear-scaled color encoding -> exempt', () => {
    const out = evaluateContrastPillar(mk({ color: { field: 'value', scale: 'linear' } }));
    expect(out.contrast).toBe('exempt');
  });
});

describe('certify-contrast — honesty + determinism', () => {
  it('an unresolvable canvas (non-color override on the canvas token) -> unchecked, never a silent pass', () => {
    // The palette always resolves (the six OODS tokens are always available), so the
    // honest 'unchecked' path is reached via an unresolvable CANVAS reference.
    const out = evaluateContrastPillar(mk({ tokens: { '--oods-sys-surface-canvas': 'not-a-color' } }));
    expect(out.contrast).toBe('unchecked');
    expect(out.contrastNote).toContain('Could not resolve');
  });

  it('a non-color override on a palette slot is IGNORED — the slot renders the OODS default, which certify grades (rendered-reality)', () => {
    // Under s138 the adapter bakes the OODS default when an override is not a color, so
    // the chart still renders a real color and certify grades exactly that (categorical-01
    // vs the canvas -> pass) — never a silent 'unchecked' for a chart that does render.
    const out = evaluateContrastPillar(mk({ tokens: { '--oods-viz-scale-categorical-01': 'not-a-color' } }));
    expect(out.contrast).toBe('pass');
  });

  it('is a pure function of the IR — identical verdict across repeated calls', () => {
    const spec = mk({ color: { field: 'series', type: 'nominal' }, values: seriesRows(['a', 'b', 'c']) });
    const a = evaluateContrastPillar(spec);
    const b = evaluateContrastPillar(spec);
    expect(a).toEqual(b);
  });
});
