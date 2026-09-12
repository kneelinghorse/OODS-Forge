import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../../..');
const directory = 'artifacts/product-reality/sprint-196/m05/golden-migration';
const censusPath = 'artifacts/product-reality/sprint-196/m05/viz/viz-observations.json';
const patternsPath = 'artifacts/product-reality/sprint-196/m05/patterns/pattern-observations.json';
const previous = 'artifacts/product-reality/sprint-195/m05';
const read = (path: string) => readFileSync(resolve(root, path));
const json = (path: string) => JSON.parse(read(path).toString());
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const identity = (name: string, row: any) => `${name}/${row.theme}/${row.brand}`;
const temporal = (name: string) => ['line', 'area', 'pattern:viz:running-total-area', 'running-total-area', 'dashboard'].includes(name);
const snapshots = (bytes: Buffer) => new Map([...bytes.toString().matchAll(/exports\[`(.*?)`\] = `(.*?)`;\n/gs)].map(match => [match[1], match[2]]));
const withoutPixelHashes = (value: unknown): unknown => JSON.parse(JSON.stringify(value, (key, item) => ['svgHash', 'renderHash'].includes(key) ? undefined : item));
const disposition = (row: any) => ({ status: row.status, coverage: row.coverage, conformant: row.conformant, accuracyRules: row.accuracyRules, accuracySummary: row.accuracySummary, pillars: row.pillars, errors: row.errors });

// One batch verifies the actual pre-mutation blobs, rather than accepting a
// self-consistent rewritten baseline. No checkout or shared dist mutation occurs.
function trackedAt(head: string, paths: string[]): Map<string, Buffer> {
  const unique = [...new Set(paths)];
  const output = execFileSync('git', ['cat-file', '--batch'], { cwd: root, input: unique.map(path => `${head}:${path}\n`).join(''), maxBuffer: 64 * 1024 * 1024 });
  let offset = 0;
  return new Map(unique.map(path => {
    const end = output.indexOf(10, offset);
    const header = output.subarray(offset, end).toString();
    const match = header.match(/^[a-f0-9]+ blob (\d+)$/);
    if (!match) throw new Error(`Missing qualification blob ${head}:${path}: ${header}`);
    const size = Number(match[1]);
    const bytes = output.subarray(end + 1, end + 1 + size);
    offset = end + 1 + size + 1;
    return [path, bytes];
  }));
}

let baseline: any;
let receipt: any;
let before: Map<string, Buffer>;
let after: Map<string, Buffer>;
beforeAll(() => {
  baseline = json(`${directory}/baseline.json`);
  receipt = json(`${directory}/golden-attribution.json`);
  before = trackedAt(baseline.beforeHead, [...baseline.trackedFiles, ...baseline.historicalMatrices].map(row => row.path));
  const trackedPaths = baseline.trackedFiles.filter((row: any) => !row.path.startsWith('artifacts/')).map((row: any) => row.path);
  // Precommit qualification may use the working tree. Once recorded, the exact
  // m05 commit is mandatory: later m07 runtime/release ledger refreshes are valid.
  if (receipt.qualificationHead !== undefined) {
    expect(receipt.qualificationHead).toMatch(/^[a-f0-9]{40}$/);
    expect(execFileSync('git', ['cat-file', '-t', receipt.qualificationHead], { cwd: root, encoding: 'utf8' }).trim()).toBe('commit');
    after = trackedAt(receipt.qualificationHead, trackedPaths);
  } else {
    after = new Map(trackedPaths.map((path: string) => [path, read(path)]));
  }
});

describe('the s196 UTC migration preserves its recorded qualification and historical evidence', () => {
  it('pins every baseline hash to the clean pre-mutation commit and retains all historical bytes', () => {
    expect(baseline).toMatchObject({ missionId: 's196-m05', beforeHead: '944f4dda5f784e266310978b31f65b3d452e6387', beforeSourceDirty: false, builderSelfCertified: false });
    expect(baseline.trackedFiles).toHaveLength(1140);
    expect(baseline.historicalMatrices).toHaveLength(32);
    expect(new Set(baseline.trackedFiles.map((row: any) => row.path)).size).toBe(1140);
    for (const row of [...baseline.trackedFiles, ...baseline.historicalMatrices]) {
      expect(sha(before.get(row.path)!), row.path).toBe(row.sha256);
      if (row.bytes !== undefined) expect(before.get(row.path)!.length, row.path).toBe(row.bytes);
      if (row.path.startsWith('artifacts/')) expect(sha(read(row.path)), row.path).toBe(row.sha256);
    }
    expect(receipt).toMatchObject({ missionId: 's196-m05', beforeHead: baseline.beforeHead, builderSelfCertified: false, historicalRawFilesUnchanged: true });
  });

  it('attributes the complete tracked delta and every changed snapshot entry, preserving all other goldens', () => {
    const files: any[] = [];
    const entries: any[] = [];
    for (const row of baseline.trackedFiles.filter((item: any) => !item.path.startsWith('artifacts/'))) {
      const current = after.get(row.path)!;
      if (sha(current) === row.sha256) continue;
      expect(['snapshot', 'registry'], row.path).toContain(row.class);
      expect(row.path).not.toMatch(/mcp-server\/registry\/(runtime|release)-cells/);
      files.push({ file: row.path, class: row.class, beforeSha256: row.sha256, afterSha256: sha(current) });
      if (row.class !== 'snapshot') continue;
      const oldEntries = snapshots(before.get(row.path)!);
      const newEntries = snapshots(current);
      expect([...newEntries.keys()], row.path).toEqual([...oldEntries.keys()]);
      for (const [name, bytes] of oldEntries) {
        if (bytes === newEntries.get(name)) continue;
        expect(bytes, `${row.path}/${name}`).toMatch(/"type": "temporal"|"type": "time"|timeParse\(|month:|date:|timestamp:/);
        entries.push({ file: row.path, identity: name, beforeSha256: sha(bytes), afterSha256: sha(newEntries.get(name)!) });
      }
    }
    expect(files.length).toBeGreaterThan(0);
    expect(entries.length).toBeGreaterThan(0);
    expect(receipt.files.map(({ reason: _reason, ...row }: any) => row)).toEqual(files);
    expect(receipt.snapshotEntries.map(({ reason: _reason, class: _class, ...row }: any) => row)).toEqual(entries);
    expect([...receipt.files, ...receipt.snapshotEntries].every((row: any) => row.reason?.includes('UTC'))).toBe(true);
    expect(receipt.summary).toMatchObject({ changedGoldenFiles: files.length, movedSnapshotEntries: entries.length });
  });

  it('moves only temporal current-epoch chart/dashboard rows and verifies the retained rendered files', () => {
    const matrix = json(`${directory}/matrix/matrix.json`);
    const old = json(`${previous}/golden-migration/matrix/matrix.json`);
    expect(matrix.table).toHaveLength(52);
    expect(matrix.dashboards).toHaveLength(4);
    expect(matrix.table.map((row: any) => identity(row.chartType, row))).toEqual(old.table.map((row: any) => identity(row.chartType, row)));
    for (const row of matrix.table) {
      const prior = old.table.find((item: any) => identity(item.chartType, item) === identity(row.chartType, row));
      const bytes = read(`${directory}/matrix/${row.file}`);
      expect(sha(bytes)).toBe(row.svgHash);
      expect(bytes.length).toBe(row.svgBytes);
      expect(row.secondHash).toBe(row.svgHash);
      expect(row.canvas).toBe(prior.canvas);
      expect(row.expectedCanvas).toBe(prior.expectedCanvas);
      if (!temporal(row.chartType)) expect(row.svgHash, identity(row.chartType, row)).toBe(prior.svgHash);
    }
    for (const row of matrix.dashboards) {
      const prior = old.dashboards.find((item: any) => identity('dashboard', item) === identity('dashboard', row));
      expect(sha(read(`${directory}/matrix/${row.file}`))).toBe(row.outputHtmlHash);
      expect(row.secondHash).toBe(row.outputHtmlHash);
      expect(row.svgCount).toBe(prior.svgCount);
      expect(row.canvasChecks).toEqual(prior.canvasChecks);
    }
  });

  it('preserves all 78 visualization dispositions and every non-temporal scope hash', () => {
    const census = json(censusPath);
    const old = json(`${previous}/viz/viz-observations.json`);
    expect(census.observations.map((row: any) => row.chartType)).toEqual(old.observations.map((row: any) => row.chartType));
    const scopes = census.observations.flatMap((row: any) => row.scopes);
    expect(scopes).toHaveLength(78);
    expect(scopes.filter((row: any) => row.status === 'rendered')).toHaveLength(60);
    expect(scopes.filter((row: any) => row.status === 'typed-deferred')).toHaveLength(18);
    // s195/m06 expanded placement discovery after the palette receipt. The
    // immediate pre-UTC registry, not that earlier census, owns current metadata.
    expect(census.placementCompositions).toBe(88);
    expect(census.placements).toHaveLength(8);
    expect(census.accuracyControls).toEqual(old.accuracyControls);
    expect(census.registry).toEqual(JSON.parse(after.get('packages/viz-core/src/registry/viz-recipes.v1.json')!.toString()));
    expect(withoutPixelHashes(census.registry)).toEqual(withoutPixelHashes(JSON.parse(before.get('packages/viz-core/src/registry/viz-recipes.v1.json')!.toString())));
    for (const row of census.observations) {
      const prior = old.observations.find((item: any) => item.chartType === row.chartType);
      expect(row.defaultEqualsLightA).toBe(true);
      expect(row.scopes.map((scope: any) => identity(row.chartType, scope))).toEqual(prior.scopes.map((scope: any) => identity(row.chartType, scope)));
      for (const scope of row.scopes) {
        const previousScope = prior.scopes.find((item: any) => identity(row.chartType, item) === identity(row.chartType, scope));
        expect(disposition(scope), identity(row.chartType, scope)).toEqual(disposition(previousScope));
        if (scope.status === 'typed-deferred') {
          expect(scope.svgHash).toBeUndefined();
          expect(scope.svg).toBeUndefined();
        } else {
          expect(sha(scope.svg)).toBe(scope.svgHash);
          expect(scope.renderHash).toBe(scope.svgHash);
          if (!temporal(row.chartType)) expect(scope.svgHash).toBe(previousScope.svgHash);
        }
      }
    }
  });

  it('preserves all 84 pattern dispositions, source identities, and non-temporal pixels', () => {
    const patterns = json(patternsPath);
    const old = json(`${previous}/patterns/pattern-observations.json`);
    expect(patterns.cells).toHaveLength(84);
    expect(patterns.cells.map((row: any) => identity(row.id, row.request))).toEqual(old.cells.map((row: any) => identity(row.id, row.request)));
    expect(patterns.inputSchemaSha256).toBe(old.inputSchemaSha256);
    const registryPath = 'packages/viz-core/src/registry/viz-patterns.v1.json';
    expect(withoutPixelHashes(JSON.parse(after.get(registryPath)!.toString()))).toEqual(withoutPixelHashes(JSON.parse(before.get(registryPath)!.toString())));
    for (const [index, cell] of patterns.cells.entries()) {
      const prior = old.cells[index];
      expect(cell.request).toEqual(prior.request);
      expect(cell.rendered.status).toBe(prior.rendered.status);
      expect(disposition(cell.certified ?? {})).toEqual(disposition(prior.certified ?? {}));
      if (!prior.rendered.svgHash) {
        expect(cell.rendered.errors).toEqual(prior.rendered.errors);
        expect(cell.rendered.svgHash).toBeUndefined();
        expect(cell.rendered.svg).toBeUndefined();
      } else {
        expect(sha(cell.rendered.svg)).toBe(cell.rendered.svgHash);
        expect(cell.repeatSvgHash).toBe(cell.rendered.svgHash);
        if (!temporal(cell.id)) expect(cell.rendered.svgHash, identity(cell.id, cell.request)).toBe(prior.rendered.svgHash);
      }
    }
  });

  it('binds every attributed matrix row to its actual before/after operand and regenerates with the recorded head', () => {
    const matrix = json(`${directory}/matrix/matrix.json`);
    const census = json(censusPath);
    const patterns = json(patternsPath);
    const expectedInputs = [`${directory}/baseline.json`, `${directory}/matrix/matrix.json`, censusPath, patternsPath];
    expect(receipt.sourceHashes.map((row: any) => row.path)).toEqual(expectedInputs);
    for (const row of receipt.sourceHashes) expect(sha(read(row.path))).toBe(row.sha256);
    const sources = new Map(baseline.historicalMatrices.map((row: any) => [row.path, json(row.path)]));
    const expectedPointers: string[] = [];
    for (const [source, data] of sources as Map<string, any>) {
      if (Array.isArray(data)) continue;
      for (const [index] of (data.table ?? []).entries()) expectedPointers.push(`${source}/table/${index}`);
      for (const [index, row] of (data.observations ?? []).entries()) {
        for (const [scopeIndex, scope] of row.scopes.entries()) if (scope.svgHash) expectedPointers.push(`${source}/observations/${index}/scopes/${scopeIndex}`);
      }
      for (const [index] of (data.dashboards ?? []).entries()) expectedPointers.push(`${source}/dashboards/${index}`);
      if (data.dashboard) expectedPointers.push(`${source}/dashboard`);
      for (const [index, cell] of (Array.isArray(data.cells) ? data.cells : []).entries()) if (cell.rendered?.svgHash) expectedPointers.push(`${source}/cells/${index}`);
    }
    expect(receipt.matrixRows.map((row: any) => `${row.source}${row.pointer}`).sort()).toEqual(expectedPointers.sort());
    for (const row of receipt.matrixRows) {
      let operand: any = sources.get(row.source);
      for (const segment of row.pointer.slice(1).split('/')) operand = operand?.[segment];
      expect(operand, `${row.source}${row.pointer}`).toBeDefined();
      expect(row.beforeHash).toBe(row.class === 'public-pattern' ? operand.rendered.svgHash : operand.svgHash ?? operand.outputHtmlHash ?? operand.htmlHash);
      let current: string | undefined;
      if (row.class === 'public-chart-matrix') current = matrix.table.find((item: any) => identity(item.chartType, item) === row.identity)?.svgHash;
      if (row.class === 'dashboard-html') current = matrix.dashboards.find((item: any) => identity('dashboard', item) === row.identity)?.outputHtmlHash;
      if (row.class === 'public-census') current = census.observations.flatMap((item: any) => item.scopes.map((scope: any) => ({ ...scope, chartType: item.chartType }))).find((item: any) => identity(item.chartType, item) === row.identity)?.svgHash;
      if (row.class === 'public-pattern') current = patterns.cells.find((item: any) => identity(item.id, item.request) === row.identity)?.rendered.svgHash;
      expect(row.afterHash, row.identity).toBe(current);
      expect(row.temporal).toBe(temporal(row.identity.split('/')[0]));
      expect(row.status).toBe(row.beforeHash === current ? 'unchanged' : 'superseded');
      if (row.source.startsWith(`${previous}/`) && row.status === 'superseded') expect(row.temporal, row.identity).toBe(true);
    }
    expect(receipt.summary).toMatchObject({ changedGoldenFiles: 4, movedSnapshotEntries: 5, matrixRows: 1050, currentEpochMovedRows: 28 });
    expect(receipt.summary.matrixRows).toBe(receipt.matrixRows.length);
    expect(receipt.summary.currentEpochMovedRows).toBe(receipt.matrixRows.filter((row: any) => row.source.startsWith(`${previous}/`) && row.status === 'superseded').length);
    expect(() => execFileSync('python3', ['scripts/product-reality/s196-attribute-temporal-goldens.py', '--check', ...(receipt.qualificationHead ? ['--head', receipt.qualificationHead] : [])], { cwd: root, maxBuffer: 8 * 1024 * 1024 })).not.toThrow();
  });
});
