import { afterEach, describe, expect, it, vi } from 'vitest';
import { sha256 } from '@oods/artifacts';
import { resolveTokenToColor } from '@oods/viz-core';
import { toHex } from '../../../viz-core/src/tokens/categorical-palette.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import * as viz from '../../src/tools/viz.render.js';
import { chartNodes } from '../../src/codegen/chart-declaration.js';
import { typecheckWorkflow } from './workflow-typecheck.js';
import type { UiSchema } from '../../src/schemas/generated.js';

vi.setConfig({ testTimeout: 60_000 });
afterEach(() => vi.restoreAllMocks());

describe('Subscription payment chart is an actual public render', () => {
  it.each(['html', 'react', 'vue'] as const)('rejects an active SVG at the %s build boundary', async framework => {
    const result = await generate({ framework, profile: 'build', schema: { version: '2026.02', screens: [{ id: 'chart', component: 'VizAreaPreview', props: { svg: '<svg><script>bad()</script></svg>' } }] } });
    expect(result.status).toBe('error');
    expect(result.artifact).toBeUndefined();
    expect(JSON.stringify(result.errors)).toContain('self-contained');
  });
  it('declares one read-only detail projection without mark fields or controls in other contexts', async () => {
    for (const context of ['detail', 'list', 'form', 'timeline', 'card', 'inline'] as const) {
      const result = await compose({ object: 'Subscription', context });
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      const charts = chartNodes(result.schema.screens);
      expect(charts).toHaveLength(context === 'detail' ? 1 : 0);
      expect(Object.keys(result.schema.objectSchema ?? {}).filter(field => field.startsWith('viz_'))).toEqual([]);
      if (context === 'detail') expect(charts[0]!.chart).toEqual({ chartType: 'area', source: 'payment-events', dateFields: ['last_payment_at', 'next_payment_due_at'], amountField: 'amount', minorUnits: 100, currencyField: 'currency' });
    }
  });

  it.each(['react', 'vue'] as const)('emits repeatable, strictly typed %s workflow assets keyed by seed identity', async framework => {
    const rendered = vi.spyOn(viz, 'handle');
    const { schema } = await compose({ object: 'Subscription', context: 'workflow', preferences: { theme: 'dark', brand: 'B' } });
    expect(chartNodes(schema.screens)).toHaveLength(1);
    const first = await generate({ schema, framework, profile: 'build', options: { theme: 'dark', brand: 'B' } });
    expect(first.status, JSON.stringify(first.errors)).toBe('ok');
    expect(rendered).toHaveBeenCalledTimes(schema.workflow!.data.sampleCount);
    const requests = rendered.mock.calls.map(([input]) => input);
    // s191-m03 B7: a recorded payment series replaces the two identical scheduled samples.
    expect(requests[2]).toMatchObject({ chartType: 'area', name: 'Payment amounts', theme: 'dark', brand: 'B', rows: [{ date: '2026-06-01T12:00:00.000Z', amount: 45.6 }, { date: '2026-07-01T12:00:00.000Z', amount: 62.7 }, { date: '2026-08-01T12:00:00.000Z', amount: 51.3 }, { date: '2026-09-01T12:00:00.000Z', amount: 57 }] });
    for (const request of requests) {
      expect(request.rows).toHaveLength(4);
      expect(new Set(request.rows!.map(row => row.amount)).size).toBeGreaterThanOrEqual(3);
    }
    const files = first.artifact!.files;
    const assets = files.filter(file => file.path.endsWith('.svg'));
    expect(assets).toHaveLength(schema.workflow!.data.sampleCount);
    const canvas = toHex(resolveTokenToColor('--sys-surface-canvas', { theme: 'dark', brand: 'B' })!);
    for (const asset of assets) {
      expect(asset.contentHash).toBe(`sha256:${sha256(asset.contents)}`);
      expect(asset.contents).toContain('role="graphics-object"');
      expect(asset.contents.toLowerCase()).toContain(canvas!.toLowerCase());
    }
    const store = files.find(file => file.path === 'src/store.ts')!.contents;
    expect(store).toContain('svg: chartSvgByRecord[String(record[idField])]');
    const screen = files.find(file => file.path.startsWith('src/screens/Detail.'))!.contents;
    expect(screen).toContain('svg?: string;');
    expect(screen).toContain('svg ??');
    expect(files.find(file => file.path === 'src/chart-assets.ts')!.contents).toContain('subscription-003');
    const checked = typecheckWorkflow(first.artifact!);
    expect(checked.status, checked.stdout + checked.stderr).toBe(0);
    const second = await generate({ schema, framework, profile: 'build', options: { theme: 'dark', brand: 'B' } });
    expect(second.artifact).toEqual(first.artifact);
  });

  it.each(['html', 'react', 'vue'] as const)('single detail %s has a hashed seed asset and unchanged public SVG bytes', async framework => {
    const rendered = vi.spyOn(viz, 'handle');
    const { schema } = await compose({ object: 'Subscription', context: 'detail' });
    // HTML chart embedding is independently supported; full detail Tabs have an existing HTML normalization gate.
    if (framework === 'html') { const charts = chartNodes(schema.screens); schema.screens = [charts[0]!, ...charts.slice(1)]; }
    const result = await generate({ schema, framework, profile: 'build' });
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    expect(rendered).toHaveBeenCalledTimes(1);
    const publicOutput = await rendered.mock.results[0]!.value;
    const asset = result.artifact!.files.find(file => file.path.endsWith('.svg'))!;
    expect(asset.contents).toBe(publicOutput.svg);
    if (framework === 'html') expect(result.code).toContain(asset.contents);
    else {
      expect(result.code).toContain('svg?: string;');
      const config = JSON.stringify({ compilerOptions: { strict: true, target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', skipLibCheck: true, esModuleInterop: true, lib: ['ES2022', 'DOM'], types: ['node'] }, include: ['src/**/*'] });
      const checked = typecheckWorkflow({ ...result.artifact!, files: [...result.artifact!.files, { path: 'tsconfig.json', contents: config, contentHash: `sha256:${sha256(config)}` }] });
      expect(checked.status, checked.stdout + checked.stderr).toBe(0);
    }
    expect((await generate({ schema, framework, profile: 'build' })).artifact).toEqual(result.artifact);
  });

  it('fails loudly for missing fields or a public renderer failure, without a placeholder artifact', async () => {
    const { schema } = await compose({ object: 'Subscription', context: 'detail' });
    const broken = structuredClone(schema) as UiSchema;
    const chart = chartNodes(broken.screens)[0]!.chart!;
    if (chart.source !== 'payment-events') throw new Error('Expected the legacy payment projection');
    chart.amountField = 'nonexistent';
    const invalid = await generate({ schema: broken, framework: 'react', profile: 'build' });
    expect(invalid.status).toBe('error');
    expect(invalid.errors?.[0]?.message).toContain('nonexistent');
    vi.spyOn(viz, 'handle').mockResolvedValue({ status: 'error', errors: [{ code: 'OODS-V165', message: 'Injected render failure' }] } as Awaited<ReturnType<typeof viz.handle>>);
    const failed = await generate({ schema, framework: 'vue', profile: 'build' });
    expect(failed.status).toBe('error');
    expect(failed.artifact).toBeUndefined();
    expect(failed.errors?.[0]?.message).toContain('Injected render failure');
  });
});
