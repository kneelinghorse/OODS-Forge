import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const OBJECTS = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'] as const;
export const CONTEXTS = ['card', 'detail', 'form', 'inline', 'list', 'timeline'] as const;
export const FRAMEWORKS = ['react', 'vue'] as const;
export const BROWSER_IMAGE = 'mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a';
export type Context = typeof CONTEXTS[number];
export type Framework = typeof FRAMEWORKS[number];
export type Gate = { name: string; status: 'pass' | 'fail'; detail?: unknown; reason?: string };
export type RuntimeCell = {
  object: string; context: Context | 'workflow'; framework: Framework; head: string; runId: string;
  status: 'pass' | 'typed-gap' | 'fail'; gates: Gate[]; artifactHash: string | null;
  components: string[]; gap?: { code: string; components: string[]; reason: string };
  report: string;
};
export type RuntimeLedger = {
  schemaVersion: '1.0.0'; head: string; runId: string; historicalReceiptsUnioned: false;
  packCount: number; browserImage: string; rows: RuntimeCell[];
  summary: { cells: number; pass: number; typedGap: number; fail: number };
};
const identity = (row: Pick<RuntimeCell, 'object' | 'context' | 'framework'>) => `${row.object}/${row.context}/${row.framework}`;

/** A missing, duplicate, failed, or older cell cannot inflate the runtime ratio. */
export function validateRuntimeLedger(ledger: RuntimeLedger, workflows = false): string[] {
  const issues: string[] = [];
  const contexts = workflows ? [...CONTEXTS, 'workflow'] : CONTEXTS;
  const expected = OBJECTS.flatMap(object => contexts.flatMap(context => FRAMEWORKS.map(framework => `${object}/${context}/${framework}`))).sort();
  if (JSON.stringify(ledger.rows.map(identity).sort()) !== JSON.stringify(expected)) issues.push(`population must contain exactly ${expected.length} distinct current cells`);
  if (!ledger.head || !ledger.runId || ledger.historicalReceiptsUnioned !== false || ledger.rows.some(row => row.head !== ledger.head || row.runId !== ledger.runId)) issues.push('historical or mixed-run receipts are forbidden');
  if (ledger.packCount !== 1) issues.push('exactly one package pack sweep is required');
  if (ledger.browserImage !== BROWSER_IMAGE) issues.push('the pinned Linux browser image is required');
  for (const row of ledger.rows) {
    if (row.status === 'fail') issues.push(`${identity(row)} failed`);
    else if (row.status === 'typed-gap') {
      if (row.gap?.code !== 'OODS-N015' || !row.gap.components.length || !row.gap.reason) issues.push(`${identity(row)} has an untyped gap`);
    } else if (row.status !== 'pass' || !row.artifactHash || !row.gates.length || row.gates.some(gate => gate.status !== 'pass')) issues.push(`${identity(row)} lacks passing proof`);
    if (row.status === 'pass') {
      for (const name of ['generation', 'fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'mount', 'accessibility-tree', 'screenshots', 'context-states',
        ...(row.context === 'workflow' ? ['server-render', 'hydration', 'shared-css-resolution', 'interaction-evidence'] : [])]) {
        if (row.gates.filter(gate => gate.name === name && gate.status === 'pass').length !== 1) issues.push(`${identity(row)} lacks ${name}`);
      }
      if (row.context === 'workflow') {
        const detail = row.gates.find(gate => gate.name === 'context-states')?.detail as { observations?: Array<{ screen: string; state: string }> } | undefined;
        const states = detail?.observations?.map(value => `${value.screen}/${value.state}`).sort();
        const expectedStates = ['list', 'detail', 'form', 'timeline'].flatMap(screen => ['loading', 'empty', 'error', 'success'].map(state => `${screen}/${state}`)).sort();
        if (JSON.stringify(states) !== JSON.stringify(expectedStates)) issues.push(`${identity(row)} lacks the sixteen declared workflow states`);
      }
    }
  }
  const summary = summarize(ledger.rows);
  if (JSON.stringify(summary) !== JSON.stringify(ledger.summary)) issues.push('summary differs from the measured rows');
  return issues;
}
export function summarize(rows: RuntimeCell[]): RuntimeLedger['summary'] {
  return { cells: rows.length, pass: rows.filter(row => row.status === 'pass').length, typedGap: rows.filter(row => row.status === 'typed-gap').length, fail: rows.filter(row => row.status === 'fail').length };
}

export type RuntimeSummary = RuntimeLedger['summary'] & { head: string };
export function readRuntimeSummary(): RuntimeSummary {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
  const file = process.env.MCP_RUNTIME_CELLS_PATH ?? path.join(root, 'artifacts/product-reality/sprint-193/m03/runtime-cells.v1.json');
  const ledger = JSON.parse(fs.readFileSync(file, 'utf8')) as RuntimeLedger;
  const issues = validateRuntimeLedger(ledger, true);
  if (issues.length) throw new Error(`Runtime ledger rejected: ${issues.join('; ')}`);
  return { ...summarize(ledger.rows), head: ledger.head };
}
