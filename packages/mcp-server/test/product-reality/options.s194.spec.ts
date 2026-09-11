import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { handle as health } from '../../src/tools/health.js';
import { handle as dashboard } from '../../src/tools/dashboard.render.js';
import { handle as render } from '../../src/tools/viz.render.js';
import { handle as repl } from '../../src/tools/repl.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { handle as pipeline } from '../../src/tools/pipeline.js';
import { handle as preview } from '../../src/tools/design.preview.js';
import { SALES, CASES } from '../../src/tools/__fixtures__/cartesian-render.js';
import { ECHARTS_OPERAND_CASES, renderInputFor } from '../tools/s172-echarts-operands.js';
import { RELEASE_EVIDENCE_CLASSES } from '../../src/codegen/validation-profile.js';
import { wire, repositoryRoot } from '../helpers/wire-boundary.js';

const read = (file: string) => JSON.parse(fs.readFileSync(path.join(repositoryRoot, file), 'utf8'));
const sha = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
function retain(name: string, value: unknown) {
  if (!process.env.S194_OPTION_RECEIPTS) return;
  fs.mkdirSync(process.env.S194_OPTION_RECEIPTS, { recursive: true });
  fs.writeFileSync(path.join(process.env.S194_OPTION_RECEIPTS, name + '.json'), JSON.stringify(value, null, 2) + '\n');
}

describe('remaining options do what their public wire says (s194-m05)', () => {
  it('health reports actual built scopes and identifies configured defaults without implying a consumer', async () => {
    const saved = { brand: process.env.MCP_BRAND, theme: process.env.MCP_THEME };
    try {
      delete process.env.MCP_BRAND; delete process.env.MCP_THEME;
      const result = wire('health', 'output', await health(wire('health', 'input', {})));
      const built = read('packages/tokens/dist/css-variables-by-scope.json');
      expect(result.tokens.scopes).toEqual(Object.fromEntries(Object.entries(built).map(([brand, themes]) => [brand, Object.keys(themes as object).sort()])));
      expect(result.tokens.defaultScope).toEqual({ brand: 'A', theme: 'light', source: 'default' });
      process.env.MCP_BRAND = 'B'; process.env.MCP_THEME = 'dark';
      const configured = wire('health', 'output', await health({ includeChangelog: true, sinceVersion: '1.0' }));
      expect(configured.tokens.defaultScope).toEqual({ brand: 'B', theme: 'dark', source: 'env' });
      expect(configured.changelog?.length).toBeGreaterThan(0);
      process.env.MCP_THEME = 'unbuilt';
      expect((await health()).tokens.defaultScope).toEqual({ brand: 'A', theme: 'light', source: 'default' });
      retain('health', { result, configured });
    } finally {
      if (saved.brand === undefined) delete process.env.MCP_BRAND; else process.env.MCP_BRAND = saved.brand;
      if (saved.theme === undefined) delete process.env.MCP_THEME; else process.env.MCP_THEME = saved.theme;
    }
  });

  it('resolves governed KPI refs by default and preserves V130 unknown / V137 missing-field identities', async () => {
    const input = wire('dashboard.render', 'input', { schemaVersion: 'v0.1', datasets: [{ id: 'sales', rows: [{ revenue: 100 }, { revenue: 80 }] }], panels: [{ id: 'revenue', kind: 'kpi', datasetId: 'sales', measureRef: 'gm.revenue.total' }], a11y: { description: 'Governed revenue' } });
    const good = wire('dashboard.render', 'output', await dashboard(input as any));
    expect(good.panels[0]).toMatchObject({ kind: 'kpi', value: 180 });
    const unknownInput = { ...input, panels: [{ ...input.panels[0], measureRef: 'gm.no-such-measure' }] };
    const unknown = wire('dashboard.render', 'output', await dashboard(wire('dashboard.render', 'input', unknownInput) as any));
    expect(unknown.panels[0]).toMatchObject({ kind: 'error', error: { code: 'OODS-V130' } });
    const disabled = wire('dashboard.render', 'output', await dashboard({ ...input, resolveMeasures: false } as any));
    expect(disabled.panels[0]).toMatchObject({ kind: 'error', error: { code: 'OODS-V137' } });
    retain('measure-resolution', { input, good, unknown, disabled });
  });

  it('keeps both portable dashboard HTML identities and their repeats unchanged', async () => {
    const prior = read('artifacts/product-reality/sprint-193/m07/logs/portable-e2e.log').calls.dashboards;
    const rows = [];
    for (const [file, expected] of [['d3-preflight-dashboard.json', prior.twoPanelHtmlSha256], ['d3-four-panel-dashboard.json', prior.fourPanelHtmlSha256]]) {
      const input = wire('dashboard.render', 'input', read('packages/mcp-server/test/fixtures/portable-runtime/' + file));
      for (let repeat = 0; repeat < 2; repeat += 1) {
        const output = wire('dashboard.render', 'output', await dashboard(input));
        expect(sha(output.html!)).toBe(expected);
        rows.push({ file, repeat, htmlSha256: sha(output.html!) });
      }
    }
    retain('portable-dashboard-identities', rows);
  });

  it('omits the Vega placeholder for every primary ECharts sample without moving SVG bytes', async () => {
    const samples = read('packages/component-contracts/fixtures/viz-preview-samples.v1.json').samples;
    const rows = [];
    for (const [id, sample] of Object.entries(samples) as Array<[string, any]>) {
      const input = wire('viz.render', 'input', { ...sample.input, output: { ...sample.input.output, echarts: false } });
      const output = wire('viz.render', 'output', await render(input));
      expect(output.svgHash).toBe(sample.svgHash);
      expect(output.svg).toBe(sample.svg);
      if (output.meta?.renderer === 'echarts') {
        expect(output).not.toHaveProperty('spec');
        expect(output.echartsSpec).toBeDefined();
        expect(output.output).toMatchObject({ echarts: true, reason: 'echarts-primary-family' });
      } else expect(output.spec).toBeDefined();
      rows.push({ id, engine: output.meta?.renderer, svgHash: output.svgHash, specPresent: 'spec' in output, output: output.output });
    }
    retain('viz-output-identities', rows);
  }, 60_000);

  it('preserves the delivered Sprint 193 rendering of all thirteen historical operands and eleven panels', async () => {
    const prior = read('artifacts/product-reality/sprint-194/m05/delivered-baseline-render.json');
    expect(prior.sourceHead).toBe('1f69c957f4435a0a2f18b168b684de050f7a5f22');
    const inputs = [...CASES.map(({ chartType, encodings }) => ({ chartType, rows: [...SALES], encodings })), ...ECHARTS_OPERAND_CASES.map(renderInputFor)] as any[];
    const rows = [];
    for (const input of inputs) {
      const output = wire('viz.render', 'output', await render(wire('viz.render', 'input', { ...input, output: { ...input.output, svg: true, includeNormalizedSpec: true } })));
      expect(output.svgHash).toBe(prior.table.find((row: any) => row.chartType === input.chartType).svgHash);
      rows.push({ chartType: input.chartType, svgHash: output.svgHash });
    }
    const input = wire('dashboard.render', 'input', {
      schemaVersion: 'v0.1', datasets: [{ id: 'sales', rows: [...SALES] }],
      panels: inputs.filter(input => !['chord', 'flow_map'].includes(input.chartType)).map(({ rows, output, name, ...panel }) => ({ ...panel, id: panel.chartType, kind: 'chart', ...(rows ? { datasetId: 'sales' } : {}) })),
      a11y: { description: 'All eleven admitted dashboard chart types.' }, output: { html: true },
    });
    const output = wire('dashboard.render', 'output', await dashboard(input as any));
    expect(output.status).toBe('ok');
    expect(output.outputHtmlHash).toBe(prior.dashboard.outputHtmlHash);
    expect(output.html).toBe(fs.readFileSync(path.join(repositoryRoot, 'artifacts/product-reality/sprint-194/m05/delivered-baseline-dashboard.html'), 'utf8'));
    retain('delivered-render-identities', { rows, dashboard: { outputHtmlHash: output.outputHtmlHash } });
  }, 60_000);

  it('retains all 52 Sprint 193 brand/theme SVG identities', async () => {
    const prior = read('artifacts/product-reality/sprint-193/m07/proof-attempt-1/viz-observations.json').observations;
    const inputs = read('scripts/product-reality/s190-viz-operands.json');
    const rows = [];
    for (const input of inputs) for (const scope of prior.find((row: any) => row.chartType === input.chartType).scopes) {
      const output = wire('viz.render', 'output', await render(wire('viz.render', 'input', { ...input, brand: scope.brand, theme: scope.theme, output: { ...input.output, svg: true } })));
      expect(output.svgHash, `${input.chartType}/${scope.brand}/${scope.theme}`).toBe(scope.svgHash);
      rows.push({ chartType: input.chartType, brand: scope.brand, theme: scope.theme, svgHash: output.svgHash });
    }
    expect(rows).toHaveLength(52);
    retain('s193-scope-identities', rows);
  }, 60_000);

  it('diagnoses every ignored document-only option in fragments and describes validate.apply parity', async () => {
    const composed = await compose({ object: 'Subscription', context: 'detail' });
    const before = JSON.stringify(composed.schema);
    const input = wire('repl', 'input', { action: 'render', schema: composed.schema, apply: true, brand: 'B', output: { format: 'fragments', tokenOverlay: {}, skinOverlay: {} } });
    const output = wire('repl', 'output', await repl(input as any));
    expect(output.warnings?.filter((item: any) => item.code === 'OODS-W001')).toHaveLength(1);
    expect(output.warnings?.find((item: any) => item.code === 'OODS-W001')?.message).toContain('brand, output.tokenOverlay, output.skinOverlay');
    expect(JSON.stringify(composed.schema)).toBe(before);
    const validated = wire('repl', 'output', await repl(wire('repl', 'input', { action: 'validate', schema: composed.schema, apply: true }) as any));
    expect(validated.status).toBe('ok');
    expect(validated).not.toHaveProperty('html');
    retain('repl-limits', { output, validated });
  });

  it('discloses hash-only release evidence validation for generate and pipeline, including missing and mismatched cases', async () => {
    const composed = await compose({ object: 'Subscription', context: 'card' });
    const built = await generate({ schema: composed.schema, framework: 'react' });
    expect(built.status).toBe('ok');
    const hash = built.artifact!.contentHash;
    const evidence = Object.fromEntries(RELEASE_EVIDENCE_CLASSES.map(name => [name, { status: 'passed', reference: 'urn:synthetic:no-execution:' + name, artifactContentHash: hash }]));
    const missing = wire('code.generate', 'output', await generate(wire('code.generate', 'input', { schema: composed.schema, framework: 'react', profile: 'release' }) as any));
    expect(missing.errors?.some(item => item.code === 'OODS-V162' && item.message.includes('not re-executed'))).toBe(true);
    const accepted = wire('code.generate', 'output', await generate(wire('code.generate', 'input', { schema: composed.schema, framework: 'react', profile: 'release', releaseEvidence: evidence }) as any));
    expect(accepted.status).toBe('ok');
    expect(accepted.validationReceipt.evidenceVerification).toBe('hash-bound-not-re-executed');
    const mismatched = wire('code.generate', 'output', await generate({ schema: composed.schema, framework: 'react', profile: 'release', releaseEvidence: { ...evidence, rendered: { ...evidence.rendered, artifactContentHash: 'sha256:' + '0'.repeat(64) } } } as any));
    expect(mismatched.errors?.some(item => item.code === 'OODS-V163' && item.message.includes('not re-executed'))).toBe(true);
    const run = wire('pipeline', 'output', await pipeline(wire('pipeline', 'input', { object: 'Subscription', context: 'card', framework: 'react', profile: 'release' }) as any));
    expect(run.validationReceipt.evidenceVerification).toBe('hash-bound-not-re-executed');
    expect(run.validationReceipt.evidence.missing).toEqual([...RELEASE_EVIDENCE_CLASSES]);
    retain('release-evidence', { missing, accepted, mismatched, pipeline: run });
  });

  it('returns the documented typed dependency error with the local design loop absent', async () => {
    const running = await new Promise<boolean>(resolve => {
      const socket = net.createConnection({ host: '127.0.0.1', port: 4477 });
      socket.once('connect', () => { socket.destroy(); resolve(true); });
      socket.once('error', () => resolve(false));
    });
    expect(running, 'This negative dependency contract requires no design-loop server; it never stops an operator server.').toBe(false);
    const input = wire('design.preview', 'input', { object: 'Subscription', context: 'card' });
    await expect(preview(input as any)).rejects.toMatchObject({ opiCode: 'OODS-N019', message: expect.stringContaining('pnpm design:loop serve') });
    retain('design-preview-unavailable', { input, code: 'OODS-N019', localServerRunning: false });
  });
});
