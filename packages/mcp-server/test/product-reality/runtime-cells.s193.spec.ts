import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { BROWSER_IMAGE, FRAMEWORKS, OBJECTS, summarize, validateRuntimeLedger, type RuntimeLedger } from '../../../../scripts/product-reality/s193-runtime-cells.js';

import { contextsForObject } from '../../src/lib/runtime-ledger.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
function population(): RuntimeLedger {
  const rows = OBJECTS.flatMap(object => contextsForObject(object).flatMap(context => FRAMEWORKS.map(framework => ({
    object, context, framework, head: 'one-measured-head', runId: 'one-sweep',
    status: 'pass' as const, artifactHash: 'sha256:artifact', components: ['Stack'], report: `${object}/${context}/${framework}.json`,
    gates: ['generation', 'fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'mount', 'accessibility-tree', 'screenshots', 'context-states'].map(name => ({ name, status: 'pass' as const })),
  }))));
  return { schemaVersion: '1.0.0', head: 'one-measured-head', runId: 'one-sweep', historicalReceiptsUnioned: false, packCount: 1, browserImage: BROWSER_IMAGE, rows, summary: summarize(rows) };
}

describe('s193 runtime population accountability', () => {
  it('requires all 206 distinct object/context/framework identities', () => {
    const ledger = population();
    expect(ledger.rows).toHaveLength(206);
    expect(validateRuntimeLedger(ledger)).toEqual([]);
    ledger.rows[1] = structuredClone(ledger.rows[0]!);
    expect(validateRuntimeLedger(ledger)).toContain('population must contain exactly 206 distinct current cells');
  });
  it('never substitutes historical or same-head earlier-run receipts for current execution', () => {
    const ledger = population(); ledger.rows[0]!.runId = 'old-sweep';
    expect(validateRuntimeLedger(ledger)).toContain('historical or mixed-run receipts are forbidden');
    ledger.rows[0]!.runId = ledger.runId; ledger.rows[0]!.head = 'old-head';
    expect(validateRuntimeLedger(ledger)).toContain('historical or mixed-run receipts are forbidden');
  });
  it('a missing mount makes the cell and ledger red even when the summary claims success', () => {
    const ledger = population();
    ledger.rows[0]!.gates.find(gate => gate.name === 'mount')!.status = 'fail';
    expect(validateRuntimeLedger(ledger)).toContain('Article/card/react lacks passing proof');
    ledger.rows[0]!.status = 'fail';
    expect(validateRuntimeLedger(ledger)).toContain('Article/card/react failed');
    expect(validateRuntimeLedger(ledger)).toContain('summary differs from the measured rows');
  });
  it('accepts only named N015 gaps, never general build errors relabeled as gaps', () => {
    const ledger = population(); const row = ledger.rows[0]!;
    row.status = 'typed-gap'; row.gap = { code: 'OODS-N015', components: ['VizLinePreview'], reason: 'No runtime export' };
    ledger.summary = summarize(ledger.rows);
    expect(validateRuntimeLedger(ledger)).toEqual([]);
    row.gap.code = 'BUILD_FAILED';
    expect(validateRuntimeLedger(ledger)).toContain('Article/card/react has an untyped gap');
  });
  it('cannot omit screenshots, state gates, or build gates and still claim a pass', () => {
    for (const name of ['screenshots', 'context-states', 'production-build']) {
      const ledger = population(); ledger.rows[0]!.gates = ledger.rows[0]!.gates.filter(gate => gate.name !== name);
      expect(validateRuntimeLedger(ledger)).toContain(`Article/card/react lacks ${name}`);
    }
  });
  it('requires one pack and the pinned Linux browser', () => {
    const ledger = population(); ledger.packCount = 2; ledger.browserImage = 'host-chromium';
    expect(validateRuntimeLedger(ledger)).toEqual(expect.arrayContaining(['exactly one package pack sweep is required', 'the pinned Linux browser image is required']));
  });
  // emitterBite selects this phrase; keep it stable so its real red report runs.
  it('the retained current sweep has all passing or explicitly unavailable cells with retained receipt provenance', () => {
    // s196 separates the current canonical ledger from its sweep's artifact directory.
    // A CI-scoped report still resolves local evidence beside its supplied report file.
    const output = process.env.OODS_RUNTIME_REPORT ?? path.join(root, 'packages/mcp-server/registry/runtime-cells.v1.json');
    const ledger = JSON.parse(fs.readFileSync(output, 'utf8')) as RuntimeLedger;
    expect(validateRuntimeLedger(ledger, ledger.rows.some(row => row.context === 'workflow'))).toEqual([]);
    if (!process.env.OODS_RUNTIME_REPORT) expect(ledger.receiptRoot).toBeTruthy();
    const receiptRoot = process.env.OODS_RUNTIME_REPORT ? path.dirname(output) : path.resolve(root, ledger.receiptRoot!);
    const bite = JSON.parse(fs.readFileSync(path.join(receiptRoot, 'emitter-bite.json'), 'utf8'));
    expect(bite.red.status).toBe('fail');
    expect(bite.redSpecExitCode).not.toBe(0);
    expect(bite.red.gates.filter((gate: { status: string }) => gate.status === 'fail').map((gate: { name: string }) => gate.name)).toEqual(['mount']);
    expect(bite.ledgerIssues).toContain(`${bite.red.object}/card/react failed`);
    expect(bite.restored.status).toBe('pass');
    expect(bite.sourceRestoredByteIdentical).toBe(true);
    expect(bite.restoredHash).toBe(bite.beforeHash);
    expect(bite.mutatedHash).not.toBe(bite.beforeHash);
    for (const row of ledger.rows.filter(row => row.status === 'pass')) {
      const screenshot = row.gates.find(gate => gate.name === 'screenshots')!.detail as Array<{ width: number; path: string }>;
      expect(screenshot.map(image => image.width)).toEqual([390, 1440]);
      for (const image of screenshot) expect(fs.statSync(path.join(receiptRoot, image.path)).size).toBeGreaterThan(0);
      const tree = row.gates.find(gate => gate.name === 'accessibility-tree')!.detail as { path: string };
      expect(fs.readFileSync(path.join(receiptRoot, tree.path), 'utf8').trim().length).toBeGreaterThan(0);
    }
  });
});
