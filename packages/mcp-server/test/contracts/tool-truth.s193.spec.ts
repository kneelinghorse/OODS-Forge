import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { derivePortableExecution, deriveToolTruth, handlerImports, PORTABLE_RECEIPT_PATH, PORTABLE_RECEIPT_PATHS, serialize } from '../../../../scripts/product-reality/s193-tool-truth.mjs';
import { projectToolSummary } from '../../src/lib/tool-ledger.js';
import { handle as health } from '../../src/tools/health.js';
import { getAjv } from '../../src/lib/ajv.js';
import outputSchema from '../../src/schemas/health.output.json' with { type: 'json' };
const root = path.resolve(import.meta.dirname, '../../../..');
const file = path.join(root, 'packages/mcp-server/registry/tool-capability-ledger.v1.json');
const read = () => JSON.parse(fs.readFileSync(file, 'utf8'));
afterEach(() => vi.restoreAllMocks());

describe('tool truth derives claims without upgrading source references to runtime proof', () => {
  it('reproduces every byte from current source using the recorded census head', () => {
    const ledger = read();
    expect(serialize(deriveToolTruth({ root, head: ledger.head, mode: ledger.mode ?? 's193' }))).toBe(fs.readFileSync(file, 'utf8'));
    // s194-m06: all 19 advertised tools have boundary source proof and portable calls.
    expect(ledger.summary).toEqual({ entries: 24, auto: 19, onDemand: 5, byTier: { 'product-reality': 19, contract: 5, unit: 0, none: 0 }, autoByTier: { 'product-reality': 19, contract: 0, unit: 0, none: 0 }, onDemandByTier: { 'product-reality': 0, contract: 5, unit: 0, none: 0 }, portableE2E: 19 });
    expect(ledger.rows.filter((row: any) => row.portableE2E).map((row: any) => row.name).sort()).toEqual(read().rows.filter((row: any) => row.registration === 'auto').map((row: any) => row.name).sort());
    for (const row of ledger.rows) {
      expect(row.claimHash).toMatch(/^sha256:[0-9a-f]{64}$/); expect(row.inputSchemaHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      for (const ref of [...row.receiptRefs, ...row.caveats]) expect(fs.existsSync(path.join(root, ref.path ?? ref.file))).toBe(true);
      expect(row.receiptRefs.every((ref: any) => ref.verifiedReceipt === false)).toBe(true);
      // The active census cannot gain discovery references to its own changing closeout reports.
      expect(row.receiptRefs.some((ref: any) => ref.path.includes('/sprint-195/m07/'))).toBe(false);
      if (ledger.mode === 's196') expect(row.receiptRefs.some((ref: any) => ref.path.includes('/sprint-196/m07/'))).toBe(false);
      if (ledger.mode === 's200') expect(row.receiptRefs.some((ref: any) => /\/sprint-(?:196|200)\/m07\//.test(ref.path))).toBe(false);
      if (ledger.mode === 's201') expect(row.receiptRefs.some((ref: any) => /\/sprint-(?:196|200|201)\/m07\//.test(ref.path))).toBe(false);
      if (ledger.mode === 's202') expect(row.receiptRefs.some((ref: any) => /\/sprint-(?:196|200|201)\/m07\/|\/sprint-202\/m06\//.test(ref.path))).toBe(false);
      if (ledger.mode === 's203') expect(row.receiptRefs.some((ref: any) => /\/sprint-(?:196|200|201)\/m07\/|\/sprint-(?:202|203)\/m06\//.test(ref.path))).toBe(false);
    }
    if (ledger.mode === 's196') {
      const execution = derivePortableExecution(fs.readFileSync(path.join(root, PORTABLE_RECEIPT_PATH), 'utf8'), ledger.rows.filter((row: any) => row.registration === 'auto').map((row: any) => row.name));
      expect(ledger.portableExecution).toEqual(execution.proof);
      expect(ledger.rows.flatMap((row: any) => row.portableLimits).map((limit: any) => [limit.tool, limit.code])).toEqual([
        ['brand.apply', 'OODS-N020'], ['design.preview', 'OODS-N019'],
      ]);
    }
    if (ledger.mode === 's201') {
      // s201-m01 ships the preview host: design.preview executes from the archive and no advertised tool stays typed.
      const execution = derivePortableExecution(fs.readFileSync(path.join(root, PORTABLE_RECEIPT_PATHS.s201), 'utf8'), ledger.rows.filter((row: any) => row.registration === 'auto').map((row: any) => row.name), 's201');
      expect(ledger.portableExecution).toEqual(execution.proof);
      expect(ledger.portableExecution).toMatchObject({ path: 'artifacts/product-reality/sprint-201/m07/pre-freeze/e2e-host.json', tools: 19, pass: 19, typed: 0 });
      expect(ledger.rows.flatMap((row: any) => row.portableLimits)).toEqual([]);
      expect(ledger.rows.find((row: any) => row.name === 'design.preview').portableOutcome).toEqual({ outcome: 'pass', receiptSha256: execution.proof.sha256 });
      expect(execution.outcomes['design.preview']).toMatchObject({ outcome: 'pass' });
      expect(execution.outcomes['design.preview'].previewUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/preview\/cmp-[a-f0-9]{12}\/1\?framework=react&brand=A&theme=light$/);
      expect(Object.keys(execution.outcomes['design.preview'].compiled).sort()).toEqual(['react', 'vue']);
    }
    if (ledger.mode === 's202') {
      // s202-m05 adds the MCP Apps resources to the same E2E: the frozen archive still executes all 19 tools with none typed, the
      // negotiated client read the shipped preview app and the design_preview resources, and the restart client kept the text result.
      const bytes = fs.readFileSync(path.join(root, PORTABLE_RECEIPT_PATHS.s202), 'utf8');
      const execution = derivePortableExecution(bytes, ledger.rows.filter((row: any) => row.registration === 'auto').map((row: any) => row.name), 's202');
      expect(ledger.portableExecution).toEqual(execution.proof);
      expect(ledger.portableExecution).toMatchObject({ path: 'artifacts/product-reality/sprint-202/m06/pre-freeze/e2e-host.json', dirty: false, tools: 19, pass: 19, typed: 0 });
      expect(ledger.rows.flatMap((row: any) => row.portableLimits)).toEqual([]);
      expect(ledger.rows.find((row: any) => row.name === 'design.preview').portableOutcome).toEqual({ outcome: 'pass', receiptSha256: execution.proof.sha256 });
      const receipt = JSON.parse(bytes);
      expect(receipt.calls.mcpApps).toMatchObject({ protocolVersion: '2025-06-18', capabilities: { resources: {}, extensions: { 'io.modelcontextprotocol/ui': {} } }, app: { readEqualsShipped: true, listed: 1 }, preview: { structuredContentEqualsText: true, versions: { count: 1, accepted: null } } });
      expect(receipt.calls.mcpApps.negotiation).toMatch(/MCP Apps io\.modelcontextprotocol\/ui: negotiated .*preview app offered on design_preview/);
      expect(receipt.lifecycle.restart.negotiation).toMatch(/MCP Apps io\.modelcontextprotocol\/ui: not advertised; preview app kept as the text result/);
    }
    if (ledger.mode === 's203') {
      // s203 binds the same E2E to a bundle that now carries the five objects born from use: the frozen archive still
      // executes all 19 tools with none typed, and its own health reports 23 objects where Sprint 202's reported 18.
      const bytes = fs.readFileSync(path.join(root, PORTABLE_RECEIPT_PATHS.s203), 'utf8');
      const execution = derivePortableExecution(bytes, ledger.rows.filter((row: any) => row.registration === 'auto').map((row: any) => row.name), 's203');
      expect(ledger.portableExecution).toEqual(execution.proof);
      expect(ledger.portableExecution).toMatchObject({ path: 'artifacts/product-reality/sprint-203/m06/pre-freeze/e2e-host.json', dirty: false, tools: 19, pass: 19, typed: 0 });
      expect(ledger.rows.flatMap((row: any) => row.portableLimits)).toEqual([]);
      expect(ledger.rows.find((row: any) => row.name === 'design.preview').portableOutcome).toEqual({ outcome: 'pass', receiptSha256: execution.proof.sha256 });
      const receipt = JSON.parse(bytes);
      expect(receipt.calls.health.registry).toMatchObject({ objects: 23, components: 110, traits: 46 });
      expect(receipt.calls.mcpApps).toMatchObject({ protocolVersion: '2025-06-18', capabilities: { resources: {}, extensions: { 'io.modelcontextprotocol/ui': {} } }, app: { readEqualsShipped: true, listed: 1 }, preview: { structuredContentEqualsText: true, versions: { count: 1, accepted: null } } });
      expect(receipt.lifecycle.restart.negotiation).toMatch(/MCP Apps io\.modelcontextprotocol\/ui: not advertised; preview app kept as the text result/);
    }
    if (ledger.mode === 's200') {
      // s200-m04 ships the brand source in the bundle: brand.apply executes from the archive and only design.preview stays typed.
      const execution = derivePortableExecution(fs.readFileSync(path.join(root, PORTABLE_RECEIPT_PATHS.s200), 'utf8'), ledger.rows.filter((row: any) => row.registration === 'auto').map((row: any) => row.name), 's200');
      expect(ledger.portableExecution).toEqual(execution.proof);
      expect(ledger.portableExecution).toMatchObject({ path: 'artifacts/product-reality/sprint-200/m04/e2e-host.json', tools: 19, pass: 18, typed: 1 });
      expect(ledger.rows.flatMap((row: any) => row.portableLimits).map((limit: any) => [limit.tool, limit.code])).toEqual([['design.preview', 'OODS-N019']]);
      expect(ledger.rows.find((row: any) => row.name === 'brand.apply').portableOutcome).toEqual({ outcome: 'pass', receiptSha256: execution.proof.sha256 });
      expect(execution.outcomes['brand.apply']).toMatchObject({ outcome: 'pass', applied: { sourceWritten: false, build: null, brandSourceUnchanged: true } });
    }
  });
  it('ignores comments, type-only and schema-only imports but resolves nested and sibling handlers', () => {
    const imports = handlerImports('packages/mcp-server/test/contracts/probe.spec.ts', `
      // import { handle } from '../../src/tools/map.js';
      import type { Handle } from '../../src/tools/map.js';
      import { type Foo } from '../../src/tools/map.js';
      import schema from '../../src/schemas/map.input.json';
      import { handle } from '../../src/tools/schema/save.js';
      const render = await import('../../src/tools/viz.render.js');
    `, root, ['map', 'schema', 'viz.render']);
    expect(imports.map((ref: any) => ref.tool)).toEqual(['schema', 'viz.render']);
    expect(handlerImports('packages/mcp-server/src/tools/__tests__/probe.test.ts', "import { handle } from '../health.js';", root, ['health'])).toMatchObject([{ tool: 'health' }]);
  });
  it.each(['missing-row', 'edited-tier', 'edited-total', 'edited-claim'])('%s cannot be served as a valid census', mutation => {
    const ledger = read();
    if (mutation === 'missing-row') ledger.rows.pop();
    if (mutation === 'edited-tier') ledger.rows.find((row: any) => row.name === 'health').proofTier = 'none';
    if (mutation === 'edited-total') ledger.summary.byTier.none += 1;
    if (mutation === 'edited-claim') ledger.rows[0].advertisedClaim.description += ' New unsupported promise.';
    expect(() => projectToolSummary(ledger)).toThrow(/Tool ledger rejected/);
  });
  it.each(['coverage', 'caveat', 'source-tier'])('rejects coherent advertised %s regressions under the s194 contract', mutation => {
    const ledger = read(); const row = ledger.rows.find((row: any) => row.registration === 'auto');
    if (mutation === 'coverage') { row.portableE2E = false; ledger.summary.portableE2E -= 1; }
    if (mutation === 'caveat') row.caveats.push({ kind: 'inert-option' });
    if (mutation === 'source-tier') { row.testImports['product-reality'] = []; row.proofTier = row.testImports.contract.length ? 'contract' : row.testImports.unit.length ? 'unit' : 'none'; }
    expect(() => projectToolSummary(ledger)).toThrow(/Tool ledger rejected/);
  });
  it('serves the validated summary through health and its advertised output schema', async () => {
    const result = await health();
    expect(result.productReality.tools).toEqual(projectToolSummary(read()));
    const validate = getAjv().compile(outputSchema);
    expect(validate(result), JSON.stringify(validate.errors)).toBe(true);
  });
  it('a missing ledger degrades health with null tool counts instead of inventing zero proof', async () => {
    const original = fs.readFileSync;
    vi.spyOn(fs, 'readFileSync').mockImplementation(((file: any, ...args: any[]) => {
      if (String(file).endsWith('tool-capability-ledger.v1.json')) throw new Error('missing tool ledger');
      return (original as any)(file, ...args);
    }) as any);
    const result = await health();
    expect(result.status).toBe('degraded'); expect(result.productReality.tools).toBeNull();
    expect(result.warnings).toContain('tool proof unavailable: missing tool ledger');
  });
});

const advertised = () => read().rows.filter((row: any) => row.registration === 'auto').map((row: any) => row.name);
function portableReceipt() {
  const outcomes = Object.fromEntries(advertised().map((name: string) => [name, { outcome: 'pass' }])) as Record<string, any>;
  for (const [name, code] of [['brand.apply', 'OODS-N020'], ['design.preview', 'OODS-N019']]) {
    outcomes[name] = { outcome: 'typed', code, isError: true, retryable: name === 'design.preview', data: { dependency: name }, message: `${name}: dependency unavailable`, gap: `portable-${name}` };
  }
  return { status: 'pass', manifest: { commit: 'a'.repeat(40), dirty: false }, tools: { count: 19, names: advertised().map((name: string) => name.replaceAll('.', '_')) }, calls: { outcomes } };
}

function s196Ledger() {
  const ledger = read();
  const execution = derivePortableExecution(serialize(portableReceipt()), advertised());
  ledger.mode = 's196';
  ledger.portableExecution = execution.proof;
  for (const row of ledger.rows) {
    const outcome = execution.outcomes[row.name];
    row.portableLimits = [];
    if (!outcome) { delete row.portableOutcome; continue; }
    row.portableOutcome = { outcome: outcome.outcome, receiptSha256: execution.proof.sha256 };
    if (outcome.outcome === 'typed') {
      Object.assign(row.portableOutcome, { code: outcome.code, retryable: outcome.retryable });
      row.portableLimits.push({ tool: row.name, status: 'typed', kind: 'documented-limit', code: outcome.code, retryable: outcome.retryable,
        receipt: { path: execution.proof.path, sha256: execution.proof.sha256, bundleHead: execution.proof.bundleHead } });
    }
  }
  return ledger;
}

describe('s196 portable claims require executed and hash-bound outcomes', () => {
  it('derives 17 real successes and two typed dependencies while binding the exact receipt bytes', () => {
    const receipt = portableReceipt();
    const execution = derivePortableExecution(serialize(receipt), advertised());
    expect(execution.proof).toMatchObject({ path: PORTABLE_RECEIPT_PATH, bundleHead: receipt.manifest.commit, dirty: false, tools: 19, pass: 17, typed: 2 });
    expect(execution.proof.sha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(derivePortableExecution(JSON.stringify(receipt), advertised()).proof.sha256).not.toBe(execution.proof.sha256);
    expect(projectToolSummary(s196Ledger())).toEqual(projectToolSummary(read()));
  });

  it.each(['missing-tool', 'extra-tool', 'erased-code', 'promoted-gap', 'new-gap', 'missing-data', 'retryable-changed', 'wrong-roster', 'failed-receipt'])('cannot generate portable claims from a %s receipt', mutation => {
    const receipt = portableReceipt();
    const outcomes = receipt.calls.outcomes;
    if (mutation === 'missing-tool') delete outcomes.health;
    if (mutation === 'extra-tool') outcomes['release.tag'] = { outcome: 'pass' };
    if (mutation === 'erased-code') delete outcomes['brand.apply'].code;
    if (mutation === 'promoted-gap') outcomes['brand.apply'].outcome = 'pass';
    if (mutation === 'new-gap') outcomes['tokens.build'].outcome = 'typed';
    if (mutation === 'missing-data') delete outcomes['design.preview'].data;
    if (mutation === 'retryable-changed') outcomes['brand.apply'].retryable = true;
    if (mutation === 'wrong-roster') receipt.tools.names[0] = 'release_tag';
    if (mutation === 'failed-receipt') receipt.status = 'fail';
    expect(() => derivePortableExecution(serialize(receipt), advertised())).toThrow();
  });

  it.each(['missing-proof', 'missing-outcome', 'rebound-receipt', 'rebound-limit', 'missing-limit', 'wrong-code', 'promoted-gap', 'invented-limit', 'on-demand', 'bad-mode'])('health rejects %s claims instead of silently serving source proof as portable success', mutation => {
    const ledger = s196Ledger();
    const brand = ledger.rows.find((row: any) => row.name === 'brand.apply');
    if (mutation === 'missing-proof') delete ledger.portableExecution;
    if (mutation === 'missing-outcome') delete brand.portableOutcome;
    if (mutation === 'rebound-receipt') brand.portableOutcome.receiptSha256 = 'sha256:' + 'b'.repeat(64);
    if (mutation === 'rebound-limit') brand.portableLimits[0].receipt.bundleHead = 'b'.repeat(40);
    if (mutation === 'missing-limit') brand.portableLimits = [];
    if (mutation === 'wrong-code') brand.portableOutcome.code = 'OODS-N019';
    if (mutation === 'promoted-gap') { brand.portableOutcome = { outcome: 'pass', receiptSha256: ledger.portableExecution.sha256 }; brand.portableLimits = []; }
    if (mutation === 'invented-limit') ledger.rows.find((row: any) => row.name === 'tokens.build').portableLimits.push(brand.portableLimits[0]);
    if (mutation === 'on-demand') ledger.rows.find((row: any) => row.registration === 'on-demand').portableOutcome = { outcome: 'pass', receiptSha256: ledger.portableExecution.sha256 };
    if (mutation === 'bad-mode') ledger.mode = 'unverified';
    expect(() => projectToolSummary(ledger)).toThrow(/Tool ledger rejected/);
  });
});
