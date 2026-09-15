import { describe, expect, it } from 'vitest';
import { svgCarriesTitle } from '@oods/component-contracts';
import { PLACED_CHART_NARROW_BREAKPOINT, PLACED_CHART_NARROW_OUTPUT, PLACED_CHART_OUTPUT, PLACED_CHART_SIZE, narrowChartPath, placedChartRequests, prepareChartAssets } from '../../src/codegen/chart-assets.js';
import { certifyPlacedCharts } from '../../src/lib/measurements.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { handle as render } from '../../src/tools/viz.render.js';
import type { UiSchema } from '../../src/schemas/generated.js';

const subscriptionDetail = async (): Promise<UiSchema> => {
  const composed = await compose({ object: 'Subscription', context: 'detail', options: { transient: true } });
  expect(composed.status).toBe('ok');
  return composed.schema!;
};
const painted = (svg: string, title: string) => svg.includes('role-title-text') || svgCarriesTitle(svg, title);

describe('placed charts name themselves in the figure heading and carry a narrow render (s202-m01)', () => {
  it('renders every placed chart without a painted title at the design size and at the narrow size', async () => {
    const schema = await subscriptionDetail();
    const requests = placedChartRequests(schema);
    expect(requests.length).toBeGreaterThan(0);
    for (const placed of requests) {
      expect(placed.request.output).toEqual(PLACED_CHART_OUTPUT);
      expect(placed.narrow.request.output).toEqual(PLACED_CHART_NARROW_OUTPUT);
      expect(placed.narrow.path).toBe(narrowChartPath(placed.path));
      expect(placed.narrow.request).toEqual({ ...placed.request, output: PLACED_CHART_NARROW_OUTPUT });
    }
    expect(PLACED_CHART_OUTPUT).toEqual({ svg: true, titlePlacement: 'figure', ...PLACED_CHART_SIZE });
    expect(PLACED_CHART_NARROW_OUTPUT).toEqual({ svg: true, titlePlacement: 'figure', width: 360, height: 220 });
    expect(PLACED_CHART_NARROW_BREAKPOINT).toBe(600);
    const prepared = await prepareChartAssets(schema);
    const node = prepared.schema.screens[0]!.children!.flatMap(function collect(child): typeof child[] { return [...(child.chart ? [child] : []), ...(child.children ?? []).flatMap(collect)]; })[0]!;
    const title = String(node.props!.title);
    expect(typeof node.props!.svg).toBe('string');
    expect(typeof node.props!.svgNarrow).toBe('string');
    expect(painted(node.props!.svg as string, title)).toBe(false);
    expect(painted(node.props!.svgNarrow as string, title)).toBe(false);
    expect(node.props!.svg as string).toMatch(/viewBox="0 0 730 410"/);
    expect(node.props!.svgNarrow as string).toMatch(/viewBox="0 0 370 230"/);
    // Both renders are files of the artifact, design size first, so the consumer carries the same bytes the figure shows.
    expect(prepared.files.map(file => file.path)).toEqual(requests.flatMap(placed => [placed.path, placed.narrow.path]));
    expect(prepared.files[0]!.contents).toBe(node.props!.svg);
    expect(prepared.files[1]!.contents).toBe(node.props!.svgNarrow);
  });

  it('viz.render paints the title unless output.titlePlacement is figure, and records the placement on the normalized spec so certify replays it', async () => {
    const schema = await subscriptionDetail();
    const placed = placedChartRequests(schema)[0]!;
    const title = String(placed.request.name);
    const { titlePlacement: _figure, ...chartOutput } = placed.request.output as Record<string, unknown> & { titlePlacement?: string };
    const inChart = await render({ ...placed.request, output: { ...chartOutput, includeNormalizedSpec: true } as never });
    const inFigure = await render({ ...placed.request, output: { ...placed.request.output, includeNormalizedSpec: true } });
    expect(inChart.status).toBe('ok');
    expect(inFigure.status).toBe('ok');
    expect(painted(inChart.svg!, title)).toBe(true);
    expect(painted(inFigure.svg!, title)).toBe(false);
    expect((inChart.normalizedSpec as { config?: { title?: unknown } }).config?.title).toBeUndefined();
    expect((inFigure.normalizedSpec as { config?: { title?: unknown } }).config?.title).toEqual({ placement: 'figure' });
    expect((inFigure.normalizedSpec as { name?: string }).name).toBe(title);
    expect(inFigure.svgHash).not.toBe(inChart.svgHash);
    // The a11y name survives: the figure's role img aria-label carries the title, and the spec keeps its name for A11Y-R-09.
    const certified = await certifyPlacedCharts(schema);
    expect(certified.map(chart => chart.path)).toEqual([placed.path]);
    expect(certified[0]!.svgHash).toBe(inFigure.svgHash);
    expect(certified[0]!.narrow.path).toBe(placed.narrow.path);
    expect(certified[0]!.narrow.certification.status).toBe(certified[0]!.certification.status);
    expect(certified[0]!.certification.conformant).toBe(true);
    expect(certified[0]!.narrow.certification.conformant).toBe(true);
  });

  it('emits svg and svgNarrow on the placed chart in React and Vue, with the figure heading owned by the component', async () => {
    const schema = await subscriptionDetail();
    for (const framework of ['react', 'vue'] as const) {
      const result = await generate({ schema, framework, profile: 'build' });
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      const code = result.artifact!.files.find(file => /GeneratedUI\.(tsx|vue)$/.test(file.path))!.contents;
      expect(code).toContain(framework === 'react' ? 'svgNarrow={svgNarrow ?? "<svg' : ':svgNarrow="svgNarrow ?? defaultChartSvgNarrow"');
      expect(code).toContain('title="Payment amounts"');
      // The artifact envelope orders files by path; both renders travel with the consumer.
      expect(result.artifact!.files.map(file => file.path).filter(path => path.endsWith('.svg'))).toEqual(['src/charts/payment-001.narrow.svg', 'src/charts/payment-001.svg']);
    }
  });
});
