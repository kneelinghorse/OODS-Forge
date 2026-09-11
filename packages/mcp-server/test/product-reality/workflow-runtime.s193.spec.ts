import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Ajv from 'ajv';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handle as health } from '../../src/tools/health.js';
import { handle as catalog } from '../../src/tools/catalog.list.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { OBJECTS, CONTEXTS, FRAMEWORKS, BROWSER_IMAGE, readRuntimeSummary, summarize, validateRuntimeLedger, type RuntimeLedger } from '../../src/lib/runtime-ledger.js';
import { workflowEditProbe, expectedWorkflowFlow } from '../../../../scripts/product-reality/s188-m03-app-consumers.js';

const root = path.resolve(import.meta.dirname, '../../../..');
const temporary: string[] = [];
afterEach(() => { vi.unstubAllEnvs(); temporary.splice(0).forEach(dir => fs.rmSync(dir, { recursive: true, force: true })); });
function fixture(): RuntimeLedger {
  const rows = OBJECTS.flatMap(object => [...CONTEXTS, 'workflow' as const].flatMap(context => FRAMEWORKS.map(framework => ({
    object, context, framework, head: 'measured-head', runId: 'current-run', status: 'pass' as const,
    components: ['Stack'], artifactHash: 'sha256:artifact', report: `${object}/${context}/${framework}.json`,
    gates: ['generation', 'fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'mount', 'accessibility-tree', 'screenshots', 'context-states', ...(context === 'workflow' ? ['server-render', 'hydration', 'shared-css-resolution', 'interaction-evidence'] : [])].map(name => ({ name, status: 'pass' as const,
      ...(name === 'context-states' && context === 'workflow' ? { detail: { observations: ['list', 'detail', 'form', 'timeline'].flatMap(screen => ['loading', 'empty', 'error', 'success'].map(state => ({ screen, state }))) } } : {}),
    })),
  }))));
  return { schemaVersion: '1.0.0', head: 'measured-head', runId: 'current-run', historicalReceiptsUnioned: false, packCount: 1, browserImage: BROWSER_IMAGE, rows, summary: summarize(rows) };
}
function installFixture(ledger: RuntimeLedger) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-runtime-health-')); temporary.push(dir);
  const file = path.join(dir, 'runtime.json'); fs.writeFileSync(file, JSON.stringify(ledger));
  vi.stubEnv('MCP_RUNTIME_CELLS_PATH', file);
}

describe('current workflow runtime accountability', () => {
  it('health and catalog serve the same measured 154-cell ratio without approving classifications', async () => {
    installFixture(fixture());
    expect(readRuntimeSummary()).toEqual({ cells: 154, pass: 154, typedGap: 0, fail: 0, head: 'measured-head' });
    const result = await health({});
    expect(result.productReality.runtime).toEqual(readRuntimeSummary());
    const validate = new Ajv({ strict: false }).compile(JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/src/schemas/health.output.json'), 'utf8')));
    expect(validate(result), JSON.stringify(validate.errors)).toBe(true);
    const listed = await catalog({});
    expect(listed.obligationScope?.runtimeEvidence).toContain('154/154 generated cells pass packed runtime gates at measured-head');
    expect(listed.obligationScope?.approvedRuntimeCensus).toBeNull();
  });
  it('missing, failed, duplicated, or historical cells cannot be served as a healthy ratio', async () => {
    for (const mutation of ['missing', 'duplicate', 'failed', 'old-run', 'summary', 'workflow-states', 'hydration']) {
      const ledger = fixture();
      if (mutation === 'missing') ledger.rows.pop();
      if (mutation === 'duplicate') ledger.rows[1] = structuredClone(ledger.rows[0]!);
      if (mutation === 'failed') ledger.rows[0]!.gates[4]!.status = 'fail';
      if (mutation === 'old-run') ledger.rows[0]!.runId = 'old-run';
      if (mutation === 'summary') ledger.summary.pass = 153;
      const workflow = ledger.rows.find(row => row.context === 'workflow')!;
      if (mutation === 'workflow-states') workflow.gates.find(gate => gate.name === 'context-states')!.detail = { observations: [] };
      if (mutation === 'hydration') workflow.gates = workflow.gates.filter(gate => gate.name !== 'hydration');
      installFixture(ledger);
      expect(() => readRuntimeSummary(), mutation).toThrow();
      const result = await health({});
      expect(result.status).toBe('degraded'); expect(result.productReality.runtime).toBeNull();
      expect(result.warnings?.some(warning => warning.includes('runtime proof unavailable'))).toBe(true);
    }
  });
  it.each(OBJECTS)('%s persistence probe targets a declared editable field, never a read-only ID', async object => {
    const result = await compose({ object, context: 'workflow' });
    expect(result.status).toBe('ok');
    const probe = workflowEditProbe(result.schema);
    expect(probe.field).not.toBe(result.schema.workflow!.data.idField);
    if (object === 'Invoice') {
      expect(probe.field).toBe('invoice_number');
      expect(expectedWorkflowFlow(result.schema)).toContain('save-record-field');
    }
    if (object === 'Plan') expect(probe.field).toBe('plan_name');
  });
  it('the retained complete population proves every workflow state and retains design-loop inspection images', async () => {
    const file = process.env.OODS_RUNTIME_REPORT ?? path.join(root, 'artifacts/product-reality/sprint-193/m03/runtime-cells.v1.json');
    const ledger = JSON.parse(fs.readFileSync(file, 'utf8')) as RuntimeLedger;
    expect(validateRuntimeLedger(ledger, true)).toEqual([]);
    expect(ledger.rows).toHaveLength(154);
    expect(ledger.rows.filter(row => row.context === 'workflow')).toHaveLength(22);
    vi.stubEnv('MCP_RUNTIME_CELLS_PATH', file);
    expect((await health({})).productReality.runtime).toEqual({ ...ledger.summary, head: ledger.head });
    const output = path.dirname(file);
    for (const row of ledger.rows) expect(JSON.parse(fs.readFileSync(path.join(output, row.report), 'utf8'))).toEqual(row);
    for (const object of OBJECTS) {
      const report = JSON.parse(fs.readFileSync(path.join(output, `workflows/${object}/report.json`), 'utf8'));
      expect(report.builderSelfCertified).toBe(false);
      expect(report.sourceHead).toBe(ledger.head);
      for (const framework of FRAMEWORKS) {
        const states = report.stateObservations.filter((row: any) => row.framework === framework);
        expect(states.map((row: any) => `${row.screen}/${row.state}`).sort()).toEqual(['list', 'detail', 'form', 'timeline'].flatMap(context => ['loading', 'empty', 'error', 'success'].map(state => `${context}/${state}`)).sort());
        for (const context of ['list', 'detail', 'form', 'timeline']) for (const width of [390, 1440]) {
          const image = report.screenshots.find((row: any) => row.framework === framework && row.screen === context && row.width === width);
          expect(image).toBeDefined();
          expect(fs.statSync(path.join(output, `workflows/${object}`, image.file)).size).toBeGreaterThan(0);
        }
      }
    }
  });
});
