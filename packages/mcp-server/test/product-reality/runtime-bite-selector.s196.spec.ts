import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { summarize, type RuntimeLedger } from '../../../../scripts/product-reality/s193-runtime-cells.js';

const root = path.resolve(import.meta.dirname, '../../../..');

describe('the emitter bite executes its retained-report assertion', () => {
  it('selects one real test that accepts current evidence and rejects a missing mount', () => {
    const source = fs.readFileSync(path.join(root, 'scripts/product-reality/s193-runtime-cells.ts'), 'utf8');
    const selector = source.match(/'runtime-cells\.s193\.spec\.ts', '-t', '([^']+)'/)
      ?? source.match(/'test\/product-reality\/runtime-cells\.s193\.spec\.ts', '-t', '([^']+)'/);
    expect(selector, 'the actual emitter-bite test selector must be visible').not.toBeNull();
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-runtime-selector-'));
    try {
      const ledger = JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/registry/runtime-cells.v1.json'), 'utf8')) as RuntimeLedger;
      const row = ledger.rows.find(cell => cell.context === 'card' && cell.framework === 'react' && cell.status === 'pass')!;
      row.status = 'fail';
      row.gates.find(gate => gate.name === 'mount')!.status = 'fail';
      ledger.summary = summarize(ledger.rows);
      const rejected = path.join(temporary, 'rejected.json');
      fs.writeFileSync(rejected, JSON.stringify(ledger));
      for (const [name, report] of [['current', undefined], ['missing-mount', rejected]] as const) {
        const output = path.join(temporary, `${name}.json`);
        const env = { ...process.env };
        delete env.OODS_RUNTIME_REPORT;
        if (report) env.OODS_RUNTIME_REPORT = report;
        const result = spawnSync('pnpm', ['--filter', '@oods/mcp-server', 'exec', 'vitest', 'run', 'test/product-reality/runtime-cells.s193.spec.ts', '-t', selector![1], '--reporter=json', `--outputFile=${output}`], {
          cwd: root, env, encoding: 'utf8', timeout: 20_000, maxBuffer: 4 * 1024 * 1024,
        });
        expect(result.error).toBeUndefined();
        const execution = JSON.parse(fs.readFileSync(output, 'utf8'));
        // Filtered siblings are intentional. A renamed selector runs zero real
        // assertions and must fail here, before another expensive browser sweep.
        expect(execution.numPassedTests + execution.numFailedTests).toBe(1);
        expect(execution.numPassedTests).toBe(report ? 0 : 1);
        expect(execution.numFailedTests).toBe(report ? 1 : 0);
        if (report) {
          expect(result.status).not.toBe(0);
          expect(JSON.stringify(execution)).toContain(`${row.object}/card/react failed`);
        } else expect(result.status).toBe(0);
      }
    } finally {
      fs.rmSync(temporary, { recursive: true, force: true });
    }
  }, 45_000);
});
