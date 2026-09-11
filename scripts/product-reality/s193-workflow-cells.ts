import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { runAppConsumers } from './s188-m03-app-consumers.js';
import { schemaNodes } from './s185-m04-consumer-contract.js';
import { FRAMEWORKS, type RuntimeCell } from '../../packages/mcp-server/src/lib/runtime-ledger.js';
import type { PackedPackageRecord } from './s184-m06-live-consumers.js';
import type { UiSchema } from '../../packages/mcp-server/src/schemas/generated.js';

/** Keep the established workflow/SSR/navigation proof, and expose its cells in the runtime ledger. */
export async function runWorkflowCells(output: string, object: string, head: string, runId: string, tarballs: PackedPackageRecord[]): Promise<RuntimeCell[]> {
  const relative = `workflows/${object}`;
  const workflowRoot = path.join(output, relative);
  let report: Awaited<ReturnType<typeof runAppConsumers>> | undefined;
  let failure: string | undefined;
  try { report = await runAppConsumers(workflowRoot, 's193-m03', object, tarballs); }
  catch (error) { failure = error instanceof Error ? error.stack : String(error); }
  const composition = JSON.parse(await fs.readFile(path.join(workflowRoot, 'composition.json'), 'utf8').catch(() => '{"schema":{"screens":[]}}')) as { schema: UiSchema };
  const components = [...new Set(schemaNodes(composition.schema).map(node => node.component))].sort();
  const cells: RuntimeCell[] = [];
  for (const framework of FRAMEWORKS) {
    const cell: RuntimeCell = { object, context: 'workflow', framework, head, runId, status: 'fail', artifactHash: null,
      components, gates: [], report: `cells/${object}/workflow/${framework}/receipt.json` };
    const source = report?.cells.find(row => row.framework === framework);
    const generated = JSON.parse(await fs.readFile(path.join(workflowRoot, `${framework}-generation.json`), 'utf8').catch(() => '{}'));
    if (generated.status !== 'ok' && generated.errors?.length && generated.errors.every((error: any) => error.code === 'OODS-N015' && error.component)) {
      cell.status = 'typed-gap';
      cell.gap = { code: 'OODS-N015', components: [...new Set<string>(generated.errors.map((error: any) => error.component))].sort(), reason: generated.errors.map((error: any) => error.message).join('; ') };
    } else if (source) {
      cell.artifactHash = source.artifactHash as string;
      const gates = source.gates as Array<{ name: string; status: string; detail?: unknown; error?: string }>;
      cell.gates.push({ name: 'generation', status: 'pass', detail: { artifactHash: cell.artifactHash, response: `${relative}/${framework}-generation.json` } });
      cell.gates.push(...gates.map(gate => ({ name: gate.name, status: gate.status === 'passed' ? 'pass' as const : 'fail' as const,
        detail: { report: `${relative}/${framework}/receipt.json`, observation: gate.detail }, ...(gate.error ? { reason: gate.error } : {}) })));
      try {
        assert(gates.every(gate => gate.status === 'passed'), 'Every established workflow gate must pass');
        const tree = `${relative}/${source.accessibilityTree}`;
        assert((await fs.readFile(path.join(output, tree), 'utf8')).trim().length > 0);
        cell.gates.push({ name: 'accessibility-tree', status: 'pass', detail: { path: tree } });
        const states = report!.stateObservations.filter(row => row.framework === framework);
        assert.equal(states.length, 16);
        assert.deepEqual(states.map(row => `${row.screen}/${row.state}`).sort(), ['list', 'detail', 'form', 'timeline'].flatMap(screen => ['loading', 'empty', 'error', 'success'].map(state => `${screen}/${state}`)).sort());
        cell.gates.push({ name: 'context-states', status: 'pass', detail: { observations: states, flow: source.flow } });
        const images = report!.screenshots.filter(row => row.framework === framework && row.screen === 'list' && [390, 1440].includes(row.width as number));
        assert.deepEqual(images.map(row => row.width), [390, 1440]);
        cell.gates.push({ name: 'screenshots', status: 'pass', detail: images.map(row => ({ width: row.width, path: `${relative}/${row.file}`, hash: row.sha256 })) });
        assert(!failure, failure);
        cell.status = 'pass';
      } catch (error) { cell.gates.push({ name: 'workflow-proof', status: 'fail', reason: String(error) }); }
    } else cell.gates.push({ name: 'workflow-proof', status: 'fail', reason: failure ?? 'Workflow returned no receipt' });
    const file = path.join(output, cell.report);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(cell, null, 2) + '\n');
    cells.push(cell);
  }
  return cells;
}
