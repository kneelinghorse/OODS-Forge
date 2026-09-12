import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { sha256 } from '@oods/artifacts';
import { handle as generate } from '../../src/tools/code.generate.js';
import { repositoryRoot, wire } from '../helpers/wire-boundary.js';
import type { CodeGenerateInput, CodeGenerateOutput } from '../../src/tools/types.js';

const ROOT = path.join(repositoryRoot, 'artifacts/product-reality/sprint-196/m05/placement');
const read = (file: string) => fs.readFileSync(file, 'utf8');
const hash = (value: string) => `sha256:${sha256(value)}`;
type Asset = { path: string; contents: string; contentHash: string };
type MigrationRow = { case: string; object: string; framework: string; context: string; brand: string; theme: string; source: string; sourceSha256: string; requestSha256: string; sameOperand: boolean; crossTimezoneEqual: boolean; changed: boolean; beforeHash: string; afterHash: string; path: string; chicagoRaw: string; utcRaw: string };
type Measurement = { timezone: string; rows: Array<{ id: string; request: CodeGenerateInput; result: CodeGenerateOutput; source: string; sourceSha256: string; requestSha256: string }> };
const migration = JSON.parse(read(path.join(ROOT, 'migration.json'))) as { rows: MigrationRow[]; counts: Record<string, number>; controls: Array<{ id: string; beforeHash: string; afterHash: string; unchanged: boolean }>; controlsSourceSha256: string };
const chicago = JSON.parse(read(path.join(ROOT, 'chicago/measurements.json'))) as Measurement;
const utc = JSON.parse(read(path.join(ROOT, 'utc/measurements.json'))) as Measurement;

describe('temporal placement migration preserves operands and historical proof (s196)', () => {
  it('qualifies every original request and source fixture against unchanged pre-UTC Git bytes', () => {
    const audit = JSON.parse(read(path.join(ROOT, 'source-fixture-audit.json')));
    expect(audit.beforeHead).toBe('944f4dda5f784e266310978b31f65b3d452e6387');
    expect(audit.literalSvgFiles).toEqual(['packages/component-contracts/fixtures/viz-preview-samples.v1.json']);
    expect(audit.unchangedSources.map((row: { path: string }) => row.path)).toEqual([
      ...chicago.rows.map(row => row.source),
      'packages/component-contracts/fixtures/viz-preview-samples.v1.json',
      'packages/mcp-server/test/tools/__fixtures__/s172-certify-spec-only-baseline.json',
      'packages/mcp-server/test/tools/s172-spec-only-cases.ts',
    ]);
    for (const row of audit.unchangedSources) {
      const original = execFileSync('git', ['show', `${audit.beforeHead}:${row.path}`], { cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
      expect(hash(original), row.path).toBe(row.beforeSha256);
      expect(read(path.join(repositoryRoot, row.path)), row.path).toBe(original);
      expect(row.currentSha256).toBe(row.beforeSha256);
      expect(row.unchanged).toBe(true);
    }
    expect(audit.dispositions.flatMap((row: { paths: string[] }) => row.paths).sort()).toEqual(audit.sourceGoldenCandidates);
  });

  it('covers the exact seven retained requests and every generated SVG asset', () => {
    expect(chicago.timezone).toBe('America/Chicago'); expect(utc.timezone).toBe('UTC');
    expect(chicago.rows.map(row => row.id)).toEqual(['Usage-detail-html', 'Usage-detail-react', 'Usage-detail-vue', 'Usage-workflow-react', 'Usage-workflow-vue', 'Subscription-detail-react', 'Subscription-detail-vue']);
    expect(migration.counts).toEqual({ requests: 7, temporalAssets: 25, changed: 25, crossTimezoneEqual: 25, unchangedNominalControls: 6 });
    expect(migration.rows).toHaveLength(25);
    expect(new Set(migration.rows.map(row => `${row.case}/${row.path}`)).size).toBe(25);
  });

  it('binds both raw timezone outputs to their original source bytes and changed temporal hashes', () => {
    for (const row of migration.rows) {
      const historicalBytes = read(path.join(repositoryRoot, row.source));
      const previous = JSON.parse(historicalBytes) as { request: CodeGenerateInput; result: { artifact: { files: Asset[] } } };
      const asset = previous.result.artifact.files.find(file => file.path === row.path)!;
      expect(hash(historicalBytes)).toBe(row.sourceSha256);
      expect(hash(JSON.stringify(previous.request))).toBe(row.requestSha256);
      expect(hash(asset.contents)).toBe(row.beforeHash);
      const left = read(path.join(ROOT, row.chicagoRaw)), right = read(path.join(ROOT, row.utcRaw));
      expect(left).toBe(right);
      expect(hash(left)).toBe(row.afterHash);
      expect(left).not.toBe(asset.contents);
      expect(row).toMatchObject({ sameOperand: true, crossTimezoneEqual: true, changed: true });
    }
  });

  it('compares complete generated artifacts under both zones using untouched historical requests', () => {
    for (const [index, row] of chicago.rows.entries()) {
      const previous = JSON.parse(read(path.join(repositoryRoot, row.source)));
      expect(row.request).toEqual(previous.request);
      expect(utc.rows[index].request).toEqual(previous.request);
      expect(row.result.artifact).toEqual(utc.rows[index].result.artifact);
      expect(row.result.status).toBe('ok');
    }
  });

  it('keeps the source JSON preview fixture outside the temporal migration because all six inputs are non-temporal', () => {
    const file = path.join(repositoryRoot, 'packages/component-contracts/fixtures/viz-preview-samples.v1.json');
    const bytes = read(file);
    const samples = JSON.parse(bytes).samples as Record<string, { svg: string; input: { chartType: string; encodings: Record<string, { type?: string; scale?: string }> } }>;
    expect(hash(bytes)).toBe(migration.controlsSourceSha256);
    expect(Object.keys(samples)).toHaveLength(6);
    expect(migration.controls.map(row => row.id)).toEqual(Object.keys(samples));
    for (const control of migration.controls) {
      const sample = samples[control.id];
      expect(control.beforeHash).toBe(hash(sample.svg));
      expect(control.afterHash).toBe(control.beforeHash);
      expect(control.unchanged).toBe(true);
      for (const binding of Object.values(sample.input.encodings)) {
        expect(binding.type).not.toBe('temporal'); expect(binding.scale).not.toBe('temporal');
      }
    }
    expect(samples.VizLinePreview.input.encodings.x.type).toBe('nominal');
    expect(samples.VizAreaPreview.input.encodings.x.type).toBe('nominal');
  });

  it.each(chicago.rows.filter(row => row.id.startsWith('Usage-')))('fresh $id generation matches the qualified UTC assets', async row => {
    const request = wire('code.generate', 'input', structuredClone(row.request));
    const result = wire('code.generate', 'output', await generate(request));
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    // This regression protects temporal SVG bytes, not unrelated workflow controls.
    // Complete historical artifacts remain compared across timezones above.
    const assets = (artifact: NonNullable<CodeGenerateOutput['artifact']>) => artifact.files.filter(file => file.path.endsWith('.svg'));
    expect(assets(result.artifact!)).not.toHaveLength(0);
    expect(assets(result.artifact!)).toEqual(assets(row.result.artifact!));
  }, 60000);
});
