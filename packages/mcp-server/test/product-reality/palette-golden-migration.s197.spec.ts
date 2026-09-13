import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

// Git-qualified evidence reads contend for disk in root coverage; keep the serial audit's budget.
vi.setConfig({ testTimeout: 60_000 });

const root = resolve(import.meta.dirname, '../../../..');
const directory = 'artifacts/product-reality/sprint-197/m05';
const read = (path: string) => readFileSync(resolve(root, path));
const json = (path: string) => JSON.parse(read(path).toString());
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const plan = json(`${directory}/golden-attribution.before.json`);
const receipt = json(`${directory}/golden-attribution.json`);
const blobs = new Map<string, Buffer>();
const at = (head: string, file: string): Buffer => {
  const key = `${head}:${file}`;
  if (!blobs.has(key)) blobs.set(key, execFileSync('git', ['show', key], { cwd: root, maxBuffer: 16 * 1024 * 1024 }));
  return blobs.get(key)!;
};
const after = (file: string) => receipt.qualificationHead ? at(receipt.qualificationHead, file) : read(file);
const pointer = (value: any, path: string) => path.slice(1).split('/').reduce((result, key) => result[key], value);
const entries = (bytes: Buffer) => new Map([...bytes.toString().matchAll(/exports\[`(.*?)`\] = `(.*?)`;\n/gs)].map(match => [match[1], match[2]]));
const withoutPaint = (value: string) => value.replace(/#[0-9A-Fa-f]{3,8}\b|(?:rgb|rgba|oklch|hsl)\([^)]*\)|[a-f0-9]{64}/g, '<paint-or-hash>');

describe('s197 attributes the one palette migration without rewriting historical evidence', () => {
  it('reproduces the report from its immutable plan, addenda and exact qualified source', () => {
    expect(receipt).toMatchObject({ missionId: 's197-m05', phase: 'measured-after', builderSelfCertified: false, beforeHead: 'bc12723e9b7a42a4790a98f5d2a0dc4a1f970b99' });
    expect(receipt.planSha256).toBe(sha(read(`${directory}/golden-attribution.before.json`)));
    expect(receipt.changedPaintInputsSha256).toBe(sha(read(`${directory}/changed-token-paints.json`)));
    for (const addendum of receipt.addendumHashes) expect(sha(read(addendum.path))).toBe(addendum.sha256);
    const args = ['scripts/product-reality/s197-attribute-palette-goldens.py', '--finalize', '--check', ...(receipt.qualificationHead ? ['--head', receipt.qualificationHead] : [])];
    expect(JSON.parse(execFileSync('python3', args, { cwd: root, encoding: 'utf8' }))).toEqual(receipt.summary);
  });

  it('ties every changed file to a before-update identity and both actual Git blobs', () => {
    const identities = [...plan.identities, ...receipt.addendumHashes.flatMap((row: any) => json(row.path).identities)];
    expect(new Set(identities.map(row => row.file)).size).toBe(identities.length);
    for (const row of receipt.files) {
      const prior = identities.find(candidate => candidate.file === row.file);
      expect(prior, row.file).toBeDefined();
      expect(sha(at(receipt.beforeHead, row.file)), row.file).toBe(prior.beforeSha256);
      expect(row.beforeSha256).toBe(prior.beforeSha256);
      expect(sha(after(row.file)), row.file).toBe(row.afterSha256);
      expect(prior.changedTokenIds?.length || prior.changedTokenScopes?.length || plan.registryTokenBinding).toBeTruthy();
    }
  });

  it('keeps snapshot data, geometry, labels and interactions unchanged across every moved identity', () => {
    const moved: any[] = [];
    for (const row of receipt.files.filter((row: any) => row.class === 'snapshot')) {
      const before = entries(at(receipt.beforeHead, row.file));
      const current = entries(after(row.file));
      expect([...current.keys()]).toEqual([...before.keys()]);
      for (const [identity, old] of before) {
        const value = current.get(identity)!;
        if (value === old) continue;
        expect(withoutPaint(value), `${row.file}/${identity}`).toBe(withoutPaint(old));
        moved.push({ file: row.file, identity, beforeSha256: sha(old), afterSha256: sha(value) });
      }
    }
    expect(moved).toHaveLength(27);
    expect(receipt.snapshotEntries.map(({ changedTokenIds, reason, ...row }: any) => row)).toEqual(moved);
    expect(receipt.summary.changedSnapshotFiles).toBe(6);
  });

  it('pins all 92 registry hashes and eight renderer hashes to measured after-state bytes and named token scopes', () => {
    expect(receipt.registryAndCertifiedPins).toHaveLength(100);
    for (const pin of receipt.registryAndCertifiedPins) {
      expect(pointer(JSON.parse(at(receipt.beforeHead, pin.file).toString()), pin.pointer)).toBe(pin.beforeHash);
      expect(pointer(JSON.parse(after(pin.file).toString()), pin.pointer)).toBe(pin.afterHash);
      expect(receipt.changedTokenScopes[pin.changedTokenScope].length).toBeGreaterThan(0);
    }
    expect(receipt.tokenVersion.before).toEqual(receipt.tokenVersion.after);
    expect(receipt.supersededDecisions.map((row: any) => row.id)).toEqual([1850, 1863, 1943]);
  });

  it('retains the 78 chart dispositions and 84 pattern scopes while moving only measured palette evidence', () => {
    const census = json(`${directory}/viz/viz-observations.json`);
    const patterns = json(`${directory}/patterns/pattern-observations.json`);
    const scopes = census.observations.flatMap((row: any) => row.scopes);
    expect(scopes).toHaveLength(78);
    expect(scopes.filter((row: any) => row.status === 'rendered')).toHaveLength(60);
    expect(scopes.filter((row: any) => row.status === 'typed-deferred')).toHaveLength(18);
    expect(patterns.cells).toHaveLength(84);
    expect(patterns.cells.filter((row: any) => row.rendered.status === 'ok')).toHaveLength(32);
    for (const cell of patterns.cells.filter((row: any) => row.rendered.status === 'ok')) {
      expect(sha(cell.rendered.svg)).toBe(cell.rendered.svgHash);
      expect(cell.repeatSvgHash).toBe(cell.rendered.svgHash);
      expect(cell.certified.determinism.renderHash).toBe(cell.rendered.svgHash);
    }
  });

  it('keeps every historical input and non-palette SVG byte-identical', () => {
    const immutable = plan.identities.filter((row: any) => row.policy === 'immutable-historical-input' || row.class === 'svg');
    expect(immutable.length).toBeGreaterThan(1500);
    for (const row of immutable) expect(sha(read(row.file)), row.file).toBe(row.beforeSha256);
    expect(receipt.matrixRows).toHaveLength(1564);
    expect(receipt.matrixRows.every((row: any) => row.reason.length > 0 && ['unchanged', 'superseded'].includes(row.status))).toBe(true);
  });

  it('binds every additional consumer pixel to its unchanged operand and previous palette/UTC evidence', () => {
    const consumer = receipt.consumerEntries;
    expect(consumer.samples.rows).toHaveLength(6);
    expect(consumer.dashboards).toHaveLength(2);
    expect(consumer.placements).toHaveLength(25);
    const oldSamples = JSON.parse(at(receipt.beforeHead, consumer.samples.source).toString());
    const currentSamples = JSON.parse(after(consumer.samples.source).toString());
    expect(sha(at(receipt.beforeHead, consumer.samples.source))).toBe(consumer.samples.beforeSha256);
    expect(sha(after(consumer.samples.source))).toBe(consumer.samples.afterSha256);
    for (const row of consumer.samples.rows) {
      const old = oldSamples.samples[row.id], current = currentSamples.samples[row.id];
      expect(current.input).toEqual(old.input);
      expect(sha(JSON.stringify(current.input))).toBe(row.inputSha256);
      expect(sha(old.svg)).toBe(row.beforeHash);
      expect(sha(current.svg)).toBe(row.afterHash);
      expect(withoutPaint(current.svg)).toBe(withoutPaint(old.svg));
    }
    for (const row of [...consumer.dashboards, ...consumer.placements]) {
      expect(sha(read(row.source))).toBe(row.sourceSha256);
      expect(read(row.source)).toEqual(at(receipt.beforeHead, row.source));
      const raw = read(`${directory}/consumers/${row.raw}`);
      expect(sha(raw)).toBe(row.afterHash.replace(/^sha256:/, ''));
    }
    const previous = json('artifacts/product-reality/sprint-196/m05/placement/chicago/measurements.json');
    for (const row of consumer.placements) {
      const old = previous.rows.find((entry: any) => entry.id === row.case);
      expect(sha(JSON.stringify(old.request))).toBe(row.requestSha256);
      expect(old.result.artifact.files.find((file: any) => file.path === row.path).contentHash).toBe(row.beforeHash);
      expect(row.sameOperand).toBe(true);
    }
  });
});
