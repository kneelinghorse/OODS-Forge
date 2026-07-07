import { describe, expect, it } from 'vitest';
import { toVegaLiteSpec } from './vega-lite-adapter.js';
import { buildVizSpecFromRows } from '../builder/spec-builder.js';
import { resolveCategoricalPalette } from '../tokens/categorical-palette.js';
import { resolveOodsVegaConfig } from '../tokens/oods-vega-config.js';

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
const OODS_CATEGORICAL_6 = ['#416CD9', '#3E44BE', '#279669', '#B78827', '#CA4948', '#993B00'];

describe('vega-lite-adapter — OODS categorical palette bake (s138 m02; mutation guard s143 m03)', () => {
  it('multi-series: a nominal color encoding bakes the fixed-6 OODS palette into encoding.color.scale.range', () => {
    const { spec } = buildVizSpecFromRows({
      rows: ROWS,
      chartType: 'bar',
      encodings: { x: { field: 'quarter' }, y: { field: 'revenue', aggregate: 'sum' }, color: { field: 'region' } },
    } as never);
    const compiled = toVegaLiteSpec(spec) as unknown as {
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

  it('s149 #853a: an EMPTY range:[] on a nominal color channel still bakes the palette (no dead-zone)', () => {
    // Pre-#853a the bake guard was `!binding.range`, which stepped aside for an empty
    // `range: []` too, while the F5 range-write guard (length>0) also skipped it — so
    // NEITHER write fired and the OODS palette was silently dropped. The length-based
    // `!binding.range?.length` guard bakes on empty-range, so the categorical channel
    // still gets its colors. Fails here (scale.range undefined) if the guard regresses.
    const { spec } = buildVizSpecFromRows({
      rows: ROWS,
      chartType: 'bar',
      encodings: { x: { field: 'quarter' }, y: { field: 'revenue', aggregate: 'sum' }, color: { field: 'region', range: [] } },
    } as never);
    const compiled = toVegaLiteSpec(spec) as unknown as {
      encoding?: { color?: { type?: string; scale?: { range?: unknown } } };
    };
    expect(compiled.encoding?.color?.type).toBe('nominal');
    expect(compiled.encoding?.color?.scale?.range).toEqual(OODS_CATEGORICAL_6);
  });

  it('single-series: NO color encoding bakes categorical-01 as mark.color', () => {
    const { spec } = buildVizSpecFromRows({
      rows: ROWS,
      chartType: 'bar',
      encodings: { x: { field: 'region' }, y: { field: 'revenue', aggregate: 'sum' } },
    } as never);
    const compiled = toVegaLiteSpec(spec) as unknown as {
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
    const compiled = toVegaLiteSpec(spec) as unknown as {
      encoding?: { color?: { type?: string; scale?: { range?: unknown } } };
    };
    expect(compiled.encoding?.color?.type).toBe('quantitative');
    expect(compiled.encoding?.color?.scale?.range).toBeUndefined();
  });
});

// Mutation-guard for the OODS chrome config bake (sprint-144 m02), colocated with the
// adapter it guards (mirrors the s138/s143 palette guard above). The chrome bake attaches
// the OODS-tokened Vega `config` theme — background/axes/gridlines/typography/legend/view —
// at the toVegaLiteSpec seam. Like the palette bake it was otherwise tested ONLY downstream
// in mcp-server against viz-core's DIST (the fidelity snapshots), so disabling the bake in
// SOURCE would pass `pnpm --filter @oods/viz-core test` and be caught only after a dist
// rebuild. This imports the SOURCE adapter + resolver DIRECTLY (relative, not the
// @oods/viz-core barrel) so a src mutation fails HERE, at the viz-core unit level.
describe('vega-lite-adapter — OODS chrome config bake (s144 m02; mutation guard s144 m03)', () => {
  it('a cartesian spec carries the OODS chrome config (background/axis/font/gridlines/view)', () => {
    const { spec } = buildVizSpecFromRows({
      rows: ROWS,
      chartType: 'bar',
      encodings: { x: { field: 'quarter' }, y: { field: 'revenue', aggregate: 'sum' } },
    } as never);
    const compiled = toVegaLiteSpec(spec) as unknown as {
      config?: {
        background?: string;
        font?: string;
        title?: { color?: string; fontSize?: number; fontWeight?: number; anchor?: string };
        axis?: { titleColor?: string; labelColor?: string; gridColor?: string; domainColor?: string; tickColor?: string };
        axisX?: { grid?: boolean };
        axisY?: { grid?: boolean };
        legend?: { titleColor?: string; labelColor?: string };
        view?: { stroke?: unknown };
        mark?: unknown;
        range?: unknown;
      };
    };

    // Background = the surface-canvas the render sits on (also the canvas certify grades against).
    expect(compiled.config?.background).toBe('#FCFCFD');
    // Typography = the OODS DM Sans stack, nested-quote artifact normalized.
    expect(compiled.config?.font).toBe("'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif");
    // Title chrome (left-anchored heading-lg).
    expect(compiled.config?.title?.color).toBe('#2D313A');
    expect(compiled.config?.title?.fontSize).toBe(24);
    expect(compiled.config?.title?.fontWeight).toBe(600);
    expect(compiled.config?.title?.anchor).toBe('start');
    // Axis chrome: text-primary titles, text-neutral labels, subtle H-grid, neutral domain/ticks.
    expect(compiled.config?.axis?.titleColor).toBe('#2D313A');
    expect(compiled.config?.axis?.labelColor).toBe('#494E5A');
    expect(compiled.config?.axis?.gridColor).toBe('#E9ECEF');
    expect(compiled.config?.axis?.domainColor).toBe('#D5DAE4');
    expect(compiled.config?.axis?.tickColor).toBe('#D5DAE4');
    // Gridlines are horizontal-only (Y grid on, X grid off) — regardless of orientation.
    expect(compiled.config?.axisX?.grid).toBe(false);
    expect(compiled.config?.axisY?.grid).toBe(true);
    // Legend chrome + the grey plot box killed.
    expect(compiled.config?.legend?.titleColor).toBe('#2D313A');
    expect(compiled.config?.legend?.labelColor).toBe('#494E5A');
    expect(compiled.config?.view?.stroke).toBeNull();

    // The whole config block is exactly the shared resolver's output (single source).
    expect(compiled.config).toEqual(resolveOodsVegaConfig(spec));
  });

  it('chrome-only guardrail: the bake emits NO series-color surface (config.mark / config.range)', () => {
    // certify reads encoding/mark-level color, NOT config — a config-level series color would
    // be graded-invisible yet render-visible (a render/certify drift hole). The default cartesian
    // bake (no caller config.mark) must therefore carry neither config.mark nor config.range.
    const { spec } = buildVizSpecFromRows({
      rows: ROWS,
      chartType: 'bar',
      encodings: { x: { field: 'quarter' }, y: { field: 'revenue', aggregate: 'sum' }, color: { field: 'region' } },
    } as never);
    const compiled = toVegaLiteSpec(spec) as unknown as { config?: { mark?: unknown; range?: unknown } };
    expect(compiled.config?.mark).toBeUndefined();
    expect(compiled.config?.range).toBeUndefined();
  });

  it("backward-compat (#84): a caller's config.mark survives the merge alongside the chrome", () => {
    // The chrome config carries no `mark` key; a caller mark is spread LAST so it wins its own
    // key with zero collision. The chrome (background) must remain present under the merge.
    const { spec } = buildVizSpecFromRows({
      rows: ROWS,
      chartType: 'bar',
      encodings: { x: { field: 'quarter' }, y: { field: 'revenue', aggregate: 'sum' } },
    } as never);
    const withMark = { ...spec, config: { ...spec.config, mark: { tooltip: true } } };
    const compiled = toVegaLiteSpec(withMark) as unknown as {
      config?: { mark?: { tooltip?: boolean }; background?: string };
    };
    expect(compiled.config?.mark?.tooltip).toBe(true);
    expect(compiled.config?.background).toBe('#FCFCFD');
  });
});
