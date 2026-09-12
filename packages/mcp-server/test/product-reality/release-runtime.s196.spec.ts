import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAjv } from '../../src/lib/ajv.js';
import { validateGeneratedArtifact } from '../../src/codegen/artifact-envelope.js';
import { BROWSER_IMAGE, summarize, type RuntimeLedger } from '../../src/lib/runtime-ledger.js';
import { projectReleaseSummary, readReleaseSummary, RELEASE_OBJECTS, validateReleaseLedger, type ReleaseLedger } from '../../src/lib/release-ledger.js';
import { handle as health } from '../../src/tools/health.js';
import { repositoryRoot as root, wire } from '../helpers/wire-boundary.js';

const canonicalPath = path.join(root, 'packages/mcp-server/registry/release-cells.v1.json');
const historical = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-195/m07/runtime/runtime-cells.v1.json'), 'utf8')) as RuntimeLedger;

/** Test-only fixtures reuse measured gate shapes; no fabricated ledger reaches registry/. */
function fixture(): ReleaseLedger {
  const bundleHead = historical.head;
  const archiveSha256 = 'a'.repeat(64);
  const rows = structuredClone(historical.rows.filter(row => (RELEASE_OBJECTS as readonly string[]).includes(row.object))).map(row => ({
    ...row, bundleHead, archiveSha256, hostArtifactHash: row.artifactHash, hashEqualToHost: true,
  }));
  return { schemaVersion: '1.0.0', bundleHead, archiveSha256, runId: historical.runId,
    historicalReceiptsUnioned: false, packCount: 1, browserImage: BROWSER_IMAGE, rows, summary: summarize(rows) };
}

const mutations: Array<[string, (ledger: ReleaseLedger) => void]> = [
  ['missing cell with recomputed total', value => { value.rows.pop(); value.summary = summarize(value.rows); }],
  ['duplicate cell', value => { value.rows[1] = structuredClone(value.rows[0]); }],
  ['unmeasured object', value => { value.rows[0].object = 'Invoice'; }],
  ['mixed host head', value => { value.rows[0].head = 'b'.repeat(40); }],
  ['mixed run', value => { value.rows[0].runId = 'older-run'; }],
  ['mixed bundle head', value => { value.rows[0].bundleHead = 'b'.repeat(40); }],
  ['mixed archive', value => { value.rows[0].archiveSha256 = 'b'.repeat(64); }],
  ['malformed bundle head', value => { value.bundleHead = 'main'; }],
  ['malformed archive hash', value => { value.archiveSha256 = 'unmeasured'; }],
  ['host artifact drift', value => { value.rows[0].hostArtifactHash = 'sha256:' + 'b'.repeat(64); }],
  ['unproved artifact equality', value => { value.rows[0].hashEqualToHost = false; }],
  ['invented artifact hash', value => { value.rows[0].artifactHash = value.rows[0].hostArtifactHash = 'sha256:invented'; }],
  ['generation gate rebound', value => { value.rows[0].artifactHash = value.rows[0].hostArtifactHash = 'sha256:' + 'b'.repeat(64); }],
  ['missing production build', value => { value.rows[0].gates = value.rows[0].gates.filter(gate => gate.name !== 'production-build'); }],
  ['failed mount', value => { value.rows[0].gates.find(gate => gate.name === 'mount')!.status = 'fail'; }],
  ['wrong browser', value => { value.browserImage = 'local-browser'; }],
  ['repacked dependencies', value => { value.packCount = 2; }],
  ['historical receipts union', value => { (value as any).historicalReceiptsUnioned = true; }],
  ['invented summary', value => { value.summary.pass -= 1; }],
  ['failed cell', value => { value.rows[0].status = 'fail'; value.summary = summarize(value.rows); }],
];

describe('s196 release runtime proof at the health wire boundary', () => {
  let temporary: string;
  let operand: string;
  beforeEach(() => {
    temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s196-release-proof-'));
    operand = path.join(temporary, 'release-cells.v1.json');
    fs.writeFileSync(operand, JSON.stringify(fixture()));
    vi.stubEnv('MCP_RELEASE_CELLS_PATH', operand);
    vi.stubEnv('MCP_SCHEMA_STORE_ROOT', temporary);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(temporary, { recursive: true, force: true });
  });

  it('serves only the measured finite population with archive identity and host artifact parity', async () => {
    const ledger = fixture();
    expect(validateReleaseLedger(ledger)).toEqual([]);
    const result = wire('health', 'output', await health(wire('health', 'input', {})));
    expect(result.productReality.release).toEqual({ bundleHead: ledger.bundleHead, archiveSha256: ledger.archiveSha256,
      apps: ['Organization', 'Subscription', 'User'], frameworks: ['react', 'vue'], cells: 42, pass: 42, typedGap: 0, fail: 0 });
    expect(result.productReality.release).toEqual(projectReleaseSummary(ledger));
    expect(result.productReality.release).toEqual(readReleaseSummary());
    expect(result.warnings ?? []).not.toEqual(expect.arrayContaining([expect.stringContaining('release proof unavailable')]));
  });

  it.each(mutations)('refuses %s instead of advertising a release pass count', async (_name, change) => {
    const ledger = fixture(); change(ledger);
    expect(validateReleaseLedger(ledger).length).toBeGreaterThan(0);
    expect(() => projectReleaseSummary(ledger)).toThrow('Release ledger rejected:');
    fs.writeFileSync(operand, JSON.stringify(ledger));
    const result = wire('health', 'output', await health({}));
    expect(result.status).toBe('degraded');
    expect(result.productReality.release).toBeNull();
    expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('release proof unavailable')]));
  });

  it.each(['missing', 'malformed'])('exposes %s release proof as null, never a fabricated zero', async kind => {
    if (kind === 'missing') fs.rmSync(operand);
    else fs.writeFileSync(operand, '{broken');
    const result = wire('health', 'output', await health({}));
    expect(result.status).toBe('degraded');
    expect(result.productReality.release).toBeNull();
    expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('release proof unavailable')]));
  });

  it('permits only explicitly unavailable Vue carries and never claims nonexistent hash equality', () => {
    const ledger = fixture();
    const row = ledger.rows.find(value => value.object === 'Organization' && value.framework === 'vue')!;
    row.status = 'typed-gap'; row.artifactHash = row.hostArtifactHash = null; row.hashEqualToHost = false;
    row.gap = { code: 'OODS-N015', components: ['Text'], reason: 'Named Vue dependency unavailable; carry retained.' };
    ledger.summary = summarize(ledger.rows);
    expect(validateReleaseLedger(ledger)).toEqual([]);
    row.hashEqualToHost = true;
    expect(validateReleaseLedger(ledger)).toContain(`${row.object}/${row.context}/${row.framework} must not claim artifact equality without generation`);
    row.hashEqualToHost = false; row.framework = 'react';
    expect(validateReleaseLedger(ledger).some(issue => issue.includes('cannot be carried'))).toBe(true);
    row.framework = 'vue'; row.object = 'Subscription';
    expect(validateReleaseLedger(ledger).some(issue => issue.includes('cannot be carried'))).toBe(true);
    row.object = 'Organization'; row.gap.code = 'BUILD_FAILED';
    expect(validateReleaseLedger(ledger).some(issue => issue.includes('untyped gap'))).toBe(true);
  });

  it('requires the full release schema projection or explicit null on the public wire', async () => {
    const result = await health({});
    const validate = getAjv().compile(JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/src/schemas/health.output.json'), 'utf8')));
    for (const field of Object.keys(result.productReality.release!)) {
      const incomplete = structuredClone(result) as any;
      delete incomplete.productReality.release[field];
      expect(validate(incomplete), `${field} is required`).toBe(false);
    }
    for (const [field, value] of [['bundleHead', 'main'], ['archiveSha256', 'not-a-hash'], ['apps', ['Invoice']], ['frameworks', ['react']], ['cells', 41], ['pass', -1], ['typedGap', -1], ['fail', 1]]) {
      const invalid = structuredClone(result) as any;
      invalid.productReality.release[field as string] = value;
      expect(validate(invalid), `${field} must retain its declared boundary`).toBe(false);
    }
    const missing = structuredClone(result) as any; delete missing.productReality.release;
    expect(validate(missing)).toBe(false);
    expect(validate({ ...result, productReality: { ...result.productReality, release: null } })).toBe(true);
  });
});

describe('s196 actual extracted-bundle release sweep', () => {
  it('retains all 42 measured cells, generation hashes and browser artifacts from the same run', () => {
    const output = process.env.OODS_RELEASE_REPORT ?? canonicalPath;
    const ledger = JSON.parse(fs.readFileSync(output, 'utf8')) as ReleaseLedger;
    expect(validateReleaseLedger(ledger)).toEqual([]);
    expect(ledger.rows).toHaveLength(42);
    expect(ledger.summary.fail).toBe(0);
    expect(ledger.summary.pass + ledger.summary.typedGap).toBe(42);
    if (!process.env.OODS_RELEASE_REPORT) expect(ledger.receiptRoot).toBeTruthy();
    const receiptRoot = process.env.OODS_RELEASE_REPORT ? path.dirname(output) : path.resolve(root, ledger.receiptRoot!);
    for (const row of ledger.rows) {
      const retained = JSON.parse(fs.readFileSync(path.join(receiptRoot, row.report), 'utf8'));
      expect(retained).toMatchObject({ artifactHash: row.artifactHash, head: row.head, runId: row.runId, status: row.status });
      if (row.status !== 'pass') continue;
      expect(row.hashEqualToHost).toBe(true);
      expect(row.hostArtifactHash).toBe(row.artifactHash);
      expect(row.gates.find(gate => gate.name === 'generation')!.detail).toMatchObject({ artifactHash: row.artifactHash });
      // Read both retained generation responses and recompute their file/envelope
      // hashes. A ledger boolean alone cannot prove that emitted bytes were equal.
      const parityRoot = row.context === 'workflow'
        ? path.join(receiptRoot, 'workflows', row.object, 'parity')
        : path.join(receiptRoot, 'cells', row.object, row.context, row.framework, 'parity');
      const comparisons = JSON.parse(fs.readFileSync(path.join(parityRoot, 'generation-comparisons.json'), 'utf8')) as Array<{
        framework: string; bundleHead: string; hostArtifactHash: string; bundleArtifactHash: string;
        hashEqualToHost: boolean; hostResponse: string; bundleResponse: string;
      }>;
      const comparison = comparisons.find(value => value.framework === row.framework)!;
      expect(comparison).toMatchObject({ bundleHead: ledger.bundleHead, hostArtifactHash: row.hostArtifactHash,
        bundleArtifactHash: row.artifactHash, hashEqualToHost: true });
      const host = JSON.parse(fs.readFileSync(path.join(parityRoot, comparison.hostResponse), 'utf8'));
      const bundle = JSON.parse(fs.readFileSync(path.join(parityRoot, comparison.bundleResponse), 'utf8'));
      for (const response of [host, bundle]) {
        expect(response).toMatchObject({ status: 'ok', framework: row.framework });
        expect(validateGeneratedArtifact(response.artifact)).toEqual([]);
      }
      expect(host.artifact.contentHash).toBe(row.hostArtifactHash);
      expect(bundle.artifact.contentHash).toBe(row.artifactHash);
      expect(bundle.artifact.contentHash).toBe(host.artifact.contentHash);
      const screenshots = row.gates.find(gate => gate.name === 'screenshots')!.detail as Array<{ width: number; path: string }>;
      expect(screenshots.map(image => image.width)).toEqual([390, 1440]);
      for (const image of screenshots) expect(fs.statSync(path.join(receiptRoot, image.path)).size).toBeGreaterThan(0);
      const tree = row.gates.find(gate => gate.name === 'accessibility-tree')!.detail as { path: string };
      expect(fs.readFileSync(path.join(receiptRoot, tree.path), 'utf8').trim().length).toBeGreaterThan(0);
    }
  });
});
