import { describe, expect, it } from 'vitest';
import { toVegaLiteSpec } from './vega-lite-adapter.js';
import { buildVizSpecFromRows } from '../builder/spec-builder.js';
import { resolveCategoricalPalette } from '../tokens/categorical-palette.js';

// Mutation-guard for the brand-fidelity palette bake (sprint-138 m02), colocated with
// the adapter it guards (s143 m03; s138-review confirmed gap). The bake — a nominal color
// channel gets the fixed-6 OODS palette as scale.range (convertBinding), and a single-series
// chart gets categorical-01 as mark.color (createMark) — was previously tested ONLY
// downstream in mcp-server (certify's contentHash/consistency-lock specs run against
// viz-core's DIST). So disabling the bake in the source passed `pnpm --filter @oods/viz-core
// test` 315/315 and was caught only after a dist rebuild. These IMPORT THE SOURCE ADAPTER
// DIRECTLY (relative, not the @oods/viz-core barrel) so a src mutation fails HERE, at the
// viz-core unit level — the bake can never be silently removed again.
//
// Specs are built via buildVizSpecFromRows so the color binding carries trait
// 'EncodingColor' exactly as viz.render emits it (a plain {field} color would infer
// quantitative and never trigger the nominal bake — a hand-authored shortcut would test
// the wrong thing).

const ROWS = [
  { quarter: 'Q1', revenue: 100, region: 'North' },
  { quarter: 'Q2', revenue: 120, region: 'South' },
  { quarter: 'Q3', revenue: 90, region: 'East' },
];

// The fixed 6-slot OODS categorical viz-scale palette (default, no config.tokens override).
// The literal pin ALSO catches a token/palette drift; the resolveCategoricalPalette tie
// proves the baked bytes come from the SAME resolver certify grades.
const OODS_CATEGORICAL_6 = ['#3668D8', '#3F45BE', '#279669', '#B6892B', '#D94747', '#606676'];

describe('vega-lite-adapter — OODS categorical palette bake (s138 m02; mutation guard s143 m03)', () => {
  it('multi-series: a nominal color encoding bakes the fixed-6 OODS palette into encoding.color.scale.range', () => {
    const { spec } = buildVizSpecFromRows({
      rows: ROWS,
      chartType: 'bar',
      encodings: { x: { field: 'quarter' }, y: { field: 'revenue', aggregate: 'sum' }, color: { field: 'region' } },
    } as never);
    const compiled = toVegaLiteSpec(spec) as Record<string, unknown> & {
      encoding?: { color?: { type?: string; scale?: { range?: unknown } } };
    };

    // The bake landed on the color channel's scale.range as the OODS hex[] — NOT Vega's
    // default tableau10. Disabling the convertBinding color bake drops scale.range, so
    // this fails at the viz-core unit level (previously only mcp-server's dist run caught it).
    expect(compiled.encoding?.color?.type).toBe('nominal');
    expect(compiled.encoding?.color?.scale?.range).toEqual(OODS_CATEGORICAL_6);
    // Tie to the SHARED resolver both the adapter (bake) and certify-contrast (grade) call,
    // so "certified == rendered" holds by construction (categorical-palette.ts).
    expect(compiled.encoding?.color?.scale?.range).toEqual(resolveCategoricalPalette(spec));
  });

  it('single-series: NO color encoding bakes categorical-01 as mark.color', () => {
    const { spec } = buildVizSpecFromRows({
      rows: ROWS,
      chartType: 'bar',
      encodings: { x: { field: 'region' }, y: { field: 'revenue', aggregate: 'sum' } },
    } as never);
    const compiled = toVegaLiteSpec(spec) as Record<string, unknown> & {
      encoding?: { color?: unknown };
      mark?: { color?: unknown };
    };

    // A single-series chart renders ONE color; the adapter bakes categorical-01 as mark.color
    // so the render matches the slot certify grades. Disabling the createMark single-series
    // bake drops mark.color, so this fails here rather than silently downstream.
    expect(compiled.encoding?.color).toBeUndefined();
    expect(compiled.mark?.color).toBe(OODS_CATEGORICAL_6[0]);
    expect(compiled.mark?.color).toBe(resolveCategoricalPalette(spec)[0]);
  });

  it('a continuous (quantitative) color channel is a gradient — NOT baked (role-B exempt)', () => {
    // Locks the nominal/ordinal SCOPING of the bake: removing that guard would wrongly bake a
    // categorical range onto a sequential gradient. A linear color scale stays range-free.
    const { spec } = buildVizSpecFromRows({
      rows: ROWS,
      chartType: 'bar',
      encodings: {
        x: { field: 'region' },
        y: { field: 'revenue', aggregate: 'sum' },
        color: { field: 'revenue', scale: 'linear' },
      },
    } as never);
    const compiled = toVegaLiteSpec(spec) as Record<string, unknown> & {
      encoding?: { color?: { type?: string; scale?: { range?: unknown } } };
    };
    expect(compiled.encoding?.color?.type).toBe('quantitative');
    expect(compiled.encoding?.color?.scale?.range).toBeUndefined();
  });
});
