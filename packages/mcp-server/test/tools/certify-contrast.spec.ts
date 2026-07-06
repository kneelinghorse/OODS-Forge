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

type ColorInput = { field?: string; type?: string; scale?: string; trait?: string; range?: string[] };

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
    // The rendered-contrast caveat (s138/s140 C2 reword), no longer the declared-intent one.
    expect(out.contrastNote).toContain('baked into the compiled spec');
  });

  it('the re-spaced OODS categorical palette (6 series) -> clean pass, at/above the >=10 target (s146 F1, memo §3a)', () => {
    // min-pairwise ΔE00 (min-over-CVD) for the s146-respaced 6-slot palette is ~10.60 — a
    // CLEAN pass at/above the >=10 best-practice target, so NO distinguishability caution
    // rides along (the pre-s146 palette sat at ~7.25 in the 2-10 warn band).
    const out = grade(
      mk({ color: { field: 'series', type: 'nominal' }, values: seriesRows(['a', 'b', 'c', 'd', 'e', 'f']) }),
    );
    expect(out.contrast).toBe('pass');
    expect(out.contrastNote).not.toContain('Distinguishability caution');
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
  it('a chromatic-but-near-identical config.tokens override -> fail on role-A ΔE (<2), even though role-C + the F2 chroma floor pass', () => {
    // Three near-identical muted blues: each has REAL chroma (~0.10, above the s146 F2 gray
    // floor) and passes role-C (~4.5:1), so the failure is PURELY categorical
    // indistinguishability (min-pairwise ΔE00-over-CVD < 2) — the role-A ΔE path, kept
    // distinct from the F2 chroma-floor path (which greys hit first). Baked into scale.range,
    // sliced to the 3 consumed slots. (Pre-s146 this used pure greys, but F2 now catches those
    // on the chroma floor before the ΔE check — see the chroma-floor block below.)
    const out = grade(
      mk({
        color: { field: 'series', type: 'nominal' },
        values: seriesRows(['a', 'b', 'c']),
        tokens: {
          '--oods-viz-scale-categorical-01': '#6A6FB0',
          '--oods-viz-scale-categorical-02': '#6B70B1',
          '--oods-viz-scale-categorical-03': '#6C71B2',
        },
      }),
    );
    expect(out.contrast).toBe('fail');
    expect(out.contrastNote).toContain('CIEDE2000'); // the ΔE-distance message, NOT the chroma floor
  });
});

describe('certify-contrast — role-A chroma floor (s146 F2 "reads-as-gray" guardrail)', () => {
  it('a low-chroma (reads-as-gray) config.tokens override -> fail on the chroma floor, before the ΔE check', () => {
    // Three near-gray overrides (OKLCH chroma ~0, below the 0.03 floor): each passes role-C
    // vs the canvas, but a gray "palette" is not a real categorical scale, so F2 fails it
    // BEFORE the ΔE distinguishability check. F2's honest value: silent on the default palette,
    // teeth on a bad override (same posture as the s137 low-contrast override fail path).
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
    expect(out.contrastNote).toContain('chroma');
    expect(out.contrastNote).toContain('reads as gray');
  });

  it('the re-chromatized default palette is ABOVE the chroma floor -> the guardrail fires on nothing (zero-flip)', () => {
    // Every s146 F1 slot is chroma >= 0.045 (the co-designed margin above the 0.03 floor), so
    // F2 never fires on the DEFAULT palette — a permanent zero-flip guardrail. The verdict is
    // the clean role-A pass, unchanged by F2.
    const out = grade(
      mk({ color: { field: 'series', type: 'nominal' }, values: seriesRows(['a', 'b', 'c', 'd', 'e', 'f']) }),
    );
    expect(out.contrast).toBe('pass');
    expect(out.contrastNote).not.toContain('chroma-floor');
  });
});

// ── s147 F5: certify grades an EXPLICIT agent color range BY CONSTRUCTION ──────────────
// The Meridian F5 pull adds encodings.color.range (hex[]) that the m02 adapter bakes into
// scale.range INSTEAD OF the OODS palette. certify reads scale.range off the compiled bytes
// exactly as it reads the baked palette — so it grades an agent-supplied range with ZERO
// certify source edits (#110). This is the Fork B "honest-fail" proof: a gray/low-contrast
// "absent" slot in a presence scale truthfully fails, guiding the agent to a chromatic one.
//
// CRITIC AMENDMENT 4: each pin uses 2 DISTINCT-value rows so slotCount reaches 2 and role-A
// actually grades BOTH range slots — certify slices graded slots to distinctCount
// (certify-contrast.ts:301), so a binary range whose sample rows all carry one value would
// grade only color[0] and could PASS even with a bad second slot.
describe('certify-contrast — F5 explicit agent color range (sprint-147, honest-fail, no certify edit)', () => {
  it('a chromatic 2-color agent range -> PASS (certify grades the supplied range, not the OODS palette)', () => {
    const out = grade(
      mk({
        color: { field: 'series', type: 'nominal', range: ['#1F6FEB', '#D1242F'] },
        values: seriesRows(['present', 'absent']),
      }),
    );
    expect(out.contrast).toBe('pass');
  });

  it('a GRAY 2-color agent range -> contrast FAIL on the chroma floor (Fork B: a gray "absent" slot reads as gray)', () => {
    // The exact Meridian F2 condition: a 2-color presence scale that uses gray for "absent"
    // truthfully fails — certify catches it with zero presence-exemption built.
    const out = grade(
      mk({
        color: { field: 'series', type: 'nominal', range: ['#1F6FEB', '#808080'] },
        values: seriesRows(['present', 'absent']),
      }),
    );
    expect(out.contrast).toBe('fail');
    expect(out.contrastNote).toContain('chroma');
    expect(out.contrastNote).toContain('reads as gray');
  });

  it('a low-contrast-vs-canvas 2-color agent range -> role-C FAIL (a near-white "absent" slot is invisible on the panel)', () => {
    const out = grade(
      mk({
        color: { field: 'series', type: 'nominal', range: ['#1F6FEB', '#F6F6F6'] },
        values: seriesRows(['present', 'absent']),
      }),
    );
    expect(out.contrast).toBe('fail');
    expect(out.contrastNote).toContain('Role-C');
  });

  it('under-cardinality caveat (critic amendment 4): 1 distinct value masks the gray-absent fail -> PASS on color[0] only', () => {
    // Same gray range as the fail case above, but every row carries the SAME value, so the
    // graded slot count collapses to 1 and only the chromatic color[0] is graded. This is
    // render-accurate (the chart only draws one series) but documents that real-world
    // under-cardinality can hide a gray "absent" slot — the honest-fail is not over-claimed.
    const out = grade(
      mk({
        color: { field: 'series', type: 'nominal', range: ['#1F6FEB', '#808080'] },
        values: seriesRows(['present', 'present']),
      }),
    );
    expect(out.contrast).toBe('pass');
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

// ── s140 [A] multi-mark UNION grading ─────────────────────────────────────────────────
// The engine now walks EVERY rendered unit (all layers, the facet spec, every concat
// section) and combines them worst-verdict (fail>unchecked>pass>exempt). This closes the
// s139-review C1 false-'pass' (a poisoned non-first layer masked by a passing first
// layer) + the companion color-mark-not-first false-'unchecked'. Author decorative
// mark.color (a reference/annotation line ≠ the OODS categorical-01 slot) is a NEUTRAL
// skip, never a contrast fail (the Derek CASE-2 fork "grade OODS series colors only").

type MultiMarkInput = { trait: string; color?: ColorInput; optionColor?: string };

/**
 * A multi-mark / faceted / concat NormalizedVizSpec-shaped fixture. `optionColor`
 * becomes mark.options.color (author decoration); `color` becomes that mark's OWN
 * encodings.color (so only that layer carries it). Enough fields for toVegaLiteSpec to
 * compile + the engine to grade the emitted bytes.
 */
function mkMulti(opts: {
  marks: MultiMarkInput[];
  values?: Array<Record<string, unknown>>;
  tokens?: Record<string, string | number>;
  layout?: Record<string, unknown>;
}): NormalizedVizSpec {
  const spec: Record<string, unknown> = {
    marks: opts.marks.map((m) => ({
      trait: m.trait,
      ...(m.optionColor ? { options: { color: m.optionColor } } : {}),
      ...(m.color
        ? { encodings: { color: { field: m.color.field ?? 'region', trait: 'EncodingColor', ...m.color } } }
        : {}),
    })),
    encoding: {
      x: { field: 'x', trait: 'EncodingX' },
      y: { field: 'y', trait: 'EncodingY' },
    },
    data: { values: opts.values ?? [] },
    a11y: { description: 'multi-mark contrast fixture' },
    ...(opts.layout ? { layout: opts.layout } : {}),
  };
  if (opts.tokens) spec.config = { tokens: opts.tokens };
  return spec as unknown as NormalizedVizSpec;
}

const regionRows = (labels: string[]) => labels.map((r) => ({ x: 'q', y: 1, region: r, value: 1 }));

describe('certify-contrast — s140 multi-mark union grading', () => {
  it('C1 repro: a passing decorative mark.color on the first layer + a role-C-failing color palette on a later layer -> fail (was a false pass)', () => {
    // marks[0] = a black reference line (options.color '#000000', passes role-C on its
    // own); marks[1] = a color-encoded points layer whose baked scale.range is poisoned
    // near-white by a config.tokens override (< 3:1 vs the canvas). Pre-s140 the engine
    // read ONLY layer[0] (the line) and returned 'pass', masking the real role-C failure.
    // Now it grades BOTH units and the point layer's role-C fail wins the union.
    const out = grade(
      mkMulti({
        marks: [
          { trait: 'MarkLine', optionColor: '#000000' },
          { trait: 'MarkPoint', color: { field: 'region', type: 'nominal' } },
        ],
        values: regionRows(['n', 's', 'e']),
        tokens: {
          '--oods-viz-scale-categorical-01': '#F8F8F8',
          '--oods-viz-scale-categorical-02': '#F6F6F6',
          '--oods-viz-scale-categorical-03': '#F4F4F4',
        },
      }),
    );
    expect(out.contrast).toBe('fail');
    expect(out.contrastNote).toContain('Role-C');
  });

  it('companion regression: the color-bearing mark is NOT the first layer -> pass (was a false unchecked)', () => {
    // marks[0] is a colorless line (CASE 4 -> neutral skip, not 'unchecked'); marks[1]
    // carries the default OODS palette (role-C pass, role-A a clean >=10 pass post-s146). Pre-s140
    // the engine read layer[0] (colorless) and returned 'unchecked'; now the colorless
    // unit is skipped and the color-encoded sibling drives the verdict.
    const out = grade(
      mkMulti({
        marks: [
          { trait: 'MarkLine' },
          { trait: 'MarkPoint', color: { field: 'region', type: 'nominal' } },
        ],
        values: regionRows(['n', 's', 'e']),
      }),
    );
    expect(out.contrast).toBe('pass');
  });

  it('a faint author annotation line + a passing color-encoded data layer -> pass (the decoration is skipped, not failed)', () => {
    // A grey reference line (options.color '#CCCCCC' ≠ the OODS categorical-01 slot) is
    // chrome, so the CASE-2 fork skips it; only the OODS-palette data layer is graded.
    const out = grade(
      mkMulti({
        marks: [
          { trait: 'MarkLine', optionColor: '#CCCCCC' },
          { trait: 'MarkPoint', color: { field: 'region', type: 'nominal' } },
        ],
        values: regionRows(['n', 's', 'e']),
      }),
    );
    expect(out.contrast).toBe('pass');
  });

  it('a gradient (exempt) layer + a categorical (pass) layer -> pass — a graded categorical dominates a gradient', () => {
    const out = grade(
      mkMulti({
        marks: [
          { trait: 'MarkLine', color: { field: 'value', type: 'quantitative' } },
          { trait: 'MarkPoint', color: { field: 'region', type: 'nominal' } },
        ],
        values: regionRows(['n', 's', 'e']),
      }),
    );
    expect(out.contrast).toBe('pass');
  });

  it('facet-of-layer: the walker descends facet.spec.layer and grades every unit', () => {
    // A faceted 2-mark chart compiles to {facet, spec:{layer:[bar(color), line(colorless)]}}.
    // The colored bar is graded (pass), the colorless line is skipped — proving the walker
    // reaches units nested under the facet spec's layer array, not just the top level.
    const out = grade(
      mkMulti({
        marks: [
          { trait: 'MarkBar', color: { field: 'region', type: 'nominal' } },
          { trait: 'MarkLine' },
        ],
        values: regionRows(['n', 's', 'e']),
        layout: { trait: 'LayoutFacet', columns: { field: 'region' } },
      }),
    );
    expect(out.contrast).toBe('pass');
  });

  it('concat: the walker grades every section (both hconcat units), not just the first', () => {
    // A 2-section horizontal concat clones the color-encoded primitive into each section;
    // both units carry the default OODS palette -> both grade -> union pass (no crash,
    // every section reached).
    const out = grade(
      mkMulti({
        marks: [{ trait: 'MarkBar', color: { field: 'region', type: 'nominal' } }],
        values: regionRows(['n', 's', 'e']),
        layout: {
          trait: 'LayoutConcat',
          direction: 'horizontal',
          sections: [{ id: 'left' }, { id: 'right' }],
        },
      }),
    );
    expect(out.contrast).toBe('pass');
  });
});
