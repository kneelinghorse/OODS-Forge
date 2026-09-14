import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { handle as render } from '../../src/tools/viz.render.js';
import { CASES, SALES } from '../../src/tools/__fixtures__/cartesian-render.js';
import { wire, repositoryRoot } from '../helpers/wire-boundary.js';

const read = (file: string) => readFileSync(resolve(repositoryRoot, file), 'utf8');

describe('published temporal rendering claims describe the public handler (s196 m05)', () => {
  it.each(['line', 'area'])('%s temporal axes implement the documented UTC policy in both engines', async chartType => {
    const fixture = CASES.find(row => row.chartType === chartType)!;
    const result = wire('viz.render', 'output', await render(wire('viz.render', 'input', {
      chartType: fixture.chartType, rows: [...SALES], encodings: fixture.encodings,
      output: { echarts: true, includeNormalizedSpec: true },
    })));
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    expect(result.spec?.encoding?.x).toMatchObject({ type: 'temporal', scale: { type: 'utc' } });
    expect(result.echartsSpec).toMatchObject({ useUTC: true });
    const description = JSON.parse(read('packages/mcp-adapter/tool-descriptions.json'))['viz.render'];
    expect(description).toContain('Temporal axes render in UTC in both Vega-Lite and ECharts');
    expect(description).toContain('independent of the host TZ');
    expect(description).toContain('caller-authored expressions retain their own semantics');
    expect(description).toContain('ScaleTemporal declares no timezone parameter');
    expect(description).toContain('en-US');
    expect(description).toContain('ECHARTS_UNSUPPORTED_OPTION');
    expect(description).toContain('treemap, sunburst, sankey, chord, graph, map, scatter, and lines');
    expect(description).toContain('Cartesian line/bar/area output remains spec-only and uncertified');
    expect(read('docs/mcp/Tool-Specs.md')).toContain(description);
    const html = read('docs/how-forge-works.html');
    const claim = html.match(/<!-- forge-claim:viz-vocabulary -->([\s\S]*?)<!-- \/forge-claim:viz-vocabulary -->/)?.[1];
    expect(claim).toContain('Temporal axes and adapter-generated formatted date parsing use UTC');
    expect(claim).toContain('ScaleTemporal declares no timezone parameter');
    expect(claim).toContain('numeric tooltips use en-US');
  });
});
