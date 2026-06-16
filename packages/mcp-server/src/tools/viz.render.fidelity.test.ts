// viz.render render-fidelity goldens (sprint-109 m06).
//
// The other viz.render tests prove the output is AJV-valid and that the embedded
// NormalizedVizSpec IR validates. That is necessary but NOT sufficient for the
// Phase-0 success outcome ("a genuinely renderable, data-bound Vega-Lite spec"):
// an AJV-valid Vega-Lite spec can still fail to compile or parse. This suite
// closes that gap by mirroring the spatial visual-regression test
// (tests/viz/adapters/spatial/vega-lite-visual-regression.test.ts): it takes the
// viz.render-produced spec for each beachhead chart type and runs the REAL
// Vega-Lite -> Vega -> View pipeline (vl.compile + vega.parse + new vega.View),
// asserting (a) the spec actually DRAWS data marks to SVG and (b) the input rows
// survive end-to-end in data.values. The 5 produced specs are snapshotted as
// goldens so any drift in the engine -> handler -> renderer payload is caught.

import * as vega from 'vega';
import * as vl from 'vega-lite';
import { describe, expect, it } from 'vitest';
import type { VizRenderInput } from '../schemas/generated.js';
import { handle } from './viz.render.js';

// Rich enough to exercise all five beachhead charts: two dimensions
// (region nominal, quarter ISO-temporal) and two measures (revenue, units).
const SALES = [
  { region: 'North', quarter: '2024-01', revenue: 120000, units: 340 },
  { region: 'South', quarter: '2024-01', revenue: 135000, units: 410 },
  { region: 'North', quarter: '2024-02', revenue: 128000, units: 360 },
  { region: 'South', quarter: '2024-02', revenue: 142000, units: 430 },
  { region: 'North', quarter: '2024-03', revenue: 131000, units: 372 },
  { region: 'South', quarter: '2024-03', revenue: 150000, units: 455 },
] as const;

interface FidelityCase {
  readonly chartType: NonNullable<VizRenderInput['chartType']>;
  readonly encodings: Record<string, unknown>;
  // The Vega mark type the chart compiles to. Used to assert the rendered SVG
  // actually drew data marks of the right kind, not just an empty <svg> shell.
  readonly svgMark: 'rect' | 'line' | 'area' | 'symbol';
}

// Per-chart encodings chosen so each compiles to a meaningful, drawable chart:
// bar (categorical x + measure y), line/area (temporal x + measure y), scatter
// (two measures), heatmap (two dimensions + a quantitative color).
const CASES: readonly FidelityCase[] = [
  {
    chartType: 'bar',
    svgMark: 'rect',
    encodings: { x: { field: 'region', scale: 'band' }, y: { field: 'revenue', aggregate: 'sum' } },
  },
  {
    chartType: 'line',
    svgMark: 'line',
    encodings: {
      x: { field: 'quarter', scale: 'temporal' },
      y: { field: 'revenue', aggregate: 'sum' },
      color: { field: 'region' },
    },
  },
  {
    chartType: 'area',
    svgMark: 'area',
    encodings: { x: { field: 'quarter', scale: 'temporal' }, y: { field: 'revenue', aggregate: 'sum' } },
  },
  {
    chartType: 'scatter',
    svgMark: 'symbol',
    encodings: {
      x: { field: 'revenue', scale: 'linear' },
      y: { field: 'units', scale: 'linear' },
      color: { field: 'region' },
    },
  },
  {
    chartType: 'heatmap',
    svgMark: 'rect',
    encodings: {
      x: { field: 'region', scale: 'band' },
      y: { field: 'quarter', scale: 'band' },
      color: { field: 'revenue', scale: 'linear' },
    },
  },
];

const render = (input: Record<string, unknown>) => handle(input as unknown as VizRenderInput);

// Drive the full Vega-Lite -> Vega -> View pipeline and return the rendered SVG.
// Renders a DEEP CLONE on purpose: vega.parse + View tag every datum with a
// process-global Symbol(vega_id) by mutating data.values IN PLACE. Cloning first
// keeps the handler's spec (and thus the snapshot) pristine and free of
// allocation-order-dependent ids. Throws if the spec cannot be compiled or
// parsed — exactly the failure this suite is meant to catch.
async function renderSvg(spec: vl.TopLevelSpec): Promise<string> {
  const { spec: compiled } = vl.compile(structuredClone(spec) as vl.TopLevelSpec);
  const view = new vega.View(vega.parse(compiled), { renderer: 'none' });
  return view.toSVG();
}

// Vega's SVG renderer wraps each mark set in
//   <g class="mark-<type> role-mark marks"> …one geometry element per datum… </g>
// A degenerate render (empty data, wrong field, no encoding) still emits the
// <svg> shell plus axes but an EMPTY mark group. Asserting the group exists AND
// carries a geometry child is what makes "renderable" mean "the data drew",
// rather than merely "the View instantiated without throwing".
function assertDrewMarks(svg: string, markType: FidelityCase['svgMark']): void {
  const group = svg.match(new RegExp(`<g class="mark-${markType} role-mark[^"]*"[^>]*>(.*?)</g>`, 's'));
  expect(group, `rendered SVG is missing a mark-${markType} group`).toBeTruthy();
  expect(group?.[1], `mark-${markType} group drew no data geometry`).toMatch(/<(path|line|rect|symbol)\b/);
}

describe('viz.render render fidelity (renderable, not just AJV-valid)', () => {
  it.each(CASES)(
    '$chartType: viz.render produces a spec that compiles, parses, draws, and keeps its data',
    async ({ chartType, encodings, svgMark }) => {
      const out = await render({ rows: SALES, chartType, encodings });
      expect(out.status).toBe('ok');
      expect(out.chartType).toBe(chartType);

      const spec = out.spec as unknown as vl.TopLevelSpec;

      // Data-bound: the input rows survive end-to-end, byte-equal.
      const values = (spec as Record<string, any>).data?.values;
      expect(values).toHaveLength(SALES.length);
      expect(values).toEqual(SALES.map((row) => ({ ...row })));

      // Golden: lock the pristine handler payload. Snapshot BEFORE rendering so
      // the golden reflects the emitted spec, not vega's runtime-mutated copy.
      expect(spec).toMatchSnapshot();

      // Renderable: the real renderer pipeline actually draws the data marks.
      const svg = await renderSvg(spec);
      expect(svg).toContain('<svg');
      assertDrewMarks(svg, svgMark);
    },
  );
});
