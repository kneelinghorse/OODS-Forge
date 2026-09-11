import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../../..');
const directory = 'artifacts/product-reality/sprint-195/m05/golden-migration';
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const json = (path: string) => JSON.parse(read(path));
const integration = resolve(root, 'artifacts/product-reality/sprint-195/m05/integration-results.json');
const recordedHead = existsSync(integration) ? JSON.parse(readFileSync(integration, 'utf8')).implementationHead : undefined;
const qualificationHead = typeof recordedHead === 'string' && /^[a-f0-9]{40}$/.test(recordedHead) ? recordedHead : undefined;
const readTracked = (path: string) => qualificationHead ? execFileSync('git', ['show', `${qualificationHead}:${path}`], { cwd: root, encoding: 'utf8' }) : read(path);
const sha = (bytes: string) => createHash('sha256').update(bytes).digest('hex');

describe('the s195 palette migration preserves historical evidence and accounts for every changed golden', () => {
  it('pins a pre-mutation baseline and attributes the complete current byte delta', () => {
    const baseline = json(`${directory}/baseline.json`);
    const receipt = json(`${directory}/golden-attribution.json`);
    expect(baseline.beforeHead).toBe('9c75a1dbb495ca26c16f2f75ce52095e72adb16e');
    expect(receipt.beforeHead).toBe(baseline.beforeHead);
    expect(receipt.historicalRawFilesUnchanged).toBe(true);
    expect(receipt.summary).toMatchObject({ previousMissionScopes: 52, previousMissionMovedScopes: 4 });
    for (const input of receipt.sourceHashes) expect(sha(read(input.path))).toBe(input.sha256);
    expect(() => execFileSync('python3', ['scripts/product-reality/s195-attribute-viz-goldens.py', '--check', ...(qualificationHead ? ['--head', qualificationHead] : [])], { cwd: root })).not.toThrow();
  });

  it('retains all tracked historical SVGs and all 190/191/193/194 matrix source bytes', () => {
    const baseline = json(`${directory}/baseline.json`);
    for (const row of baseline.trackedFiles.filter((row: any) => row.class === 'historical-svg')) expect(sha(read(row.path))).toBe(row.sha256);
    for (const row of baseline.historicalMatrices) expect(sha(read(row.path))).toBe(row.sha256);
    const receipt = json(`${directory}/golden-attribution.json`);
    for (const sprint of [190, 191, 193, 194]) expect(receipt.matrixRows.some((row: any) => row.source.includes(`sprint-${sprint}/`))).toBe(true);
    expect(receipt.matrixRows.every((row: any) => row.beforeHash && row.afterHash && row.reason)).toBe(true);
    expect(receipt.snapshotEntries.every((row: any) => row.beforeSha256 !== row.afterSha256 && row.reason)).toBe(true);
  });

  it('measures 78 scopes, preserves default light/A, and never promotes an HC failure into pixels', () => {
    const census = json('artifacts/product-reality/sprint-195/m05/viz/viz-observations.json');
    expect(census.observations).toHaveLength(13);
    const scopes = census.observations.flatMap((row: any) => row.scopes);
    expect(scopes).toHaveLength(78);
    expect(scopes.filter((scope: any) => scope.status === 'rendered')).toHaveLength(60);
    expect(scopes.filter((scope: any) => scope.status === 'typed-deferred')).toHaveLength(18);
    expect(scopes.filter((scope: any) => scope.conformant === true)).toHaveLength(56);
    expect(scopes.filter((scope: any) => scope.conformant === false)).toHaveLength(4);
    expect(census.registry.filter((row: any) => row.themes.hc).map((row: any) => row.chartType)).toEqual(['bar', 'line', 'area', 'scatter']);
    for (const row of census.observations) {
      expect(row.defaultEqualsLightA).toBe(true);
      const registered = census.registry.find((entry: any) => entry.chartType === row.chartType);
      for (const scope of row.scopes.filter((scope: any) => scope.theme === 'hc')) {
        if (scope.status === 'typed-deferred') {
          expect(scope.errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'OODS-V165' })]));
          expect(scope.svgHash).toBeUndefined();
          expect(registered.themes.hc).toBe(false);
        } else {
          expect(scope.svgHash).toMatch(/^[a-f0-9]{64}$/);
          expect(sha(scope.svg)).toBe(scope.svgHash);
          expect(scope.renderHash).toBe(scope.svgHash);
          expect(scope.pillars.contrast).toBe('exempt');
          expect(JSON.stringify(scope.contrast)).toContain('forced-colors');
        }
      }
    }
    expect(census.accuracyControls.map((row: any) => row.expectedCode)).toEqual(['OODS-V168', 'OODS-V171']);
    expect(census.observations.find((row: any) => row.chartType === 'bubble_map').scopes.filter((scope: any) => scope.status === 'rendered').every((scope: any) => scope.conformant === false)).toBe(true);
  });

  it('remeasures all 84 authored pattern cells while preserving every source hash and disposition', () => {
    const before = json(`${directory}/before/packages/viz-core/src/registry/viz-patterns.v1.json`);
    const after = JSON.parse(readTracked('packages/viz-core/src/registry/viz-patterns.v1.json'));
    const observations = json('artifacts/product-reality/sprint-195/m05/patterns/pattern-observations.json');
    expect(observations.cells).toHaveLength(84);
    expect(after).toHaveLength(21);
    expect(after.map(({ id, specPath, specSha256, publicSvg, status }: any) => ({ id, specPath, specSha256, publicSvg, status }))).toEqual(before.map(({ id, specPath, specSha256, publicSvg, status }: any) => ({ id, specPath, specSha256, publicSvg, status })));
  });
});
