/**
 * s204-m04 — the difference computed, retained beside its output.
 *
 *   pnpm exec tsx scripts/product-reality/s204-m04-observation.ts \
 *     --run ~/portfolio/Design-Tools/Stage1/out/stage1/tracelab-production-infer/d0a43821-5730-4bf3-8b40-20f6fcb6b69c \
 *     [--out artifacts/product-reality/sprint-204/m04/observation.json] [--objects Mission,Project]
 *
 * Reads the run with structuredData.fetch, composes the compared objects transiently, and writes one
 * record. On a refusal it prints the typed code and exits 2 having written nothing.
 */
import path from 'node:path';
import { ToolError } from '../../packages/mcp-server/src/errors/tool-error.js';
import { runObservation } from '../../packages/mcp-server/src/lib/observation.js';

const root = path.resolve(import.meta.dirname, '../..');
const arg = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const run = arg('run');
if (!run) {
  console.error('--run <stage1 run directory> is required');
  process.exit(1);
}
const out = path.resolve(root, arg('out') ?? 'artifacts/product-reality/sprint-204/m04/observation.json');
const objects = arg('objects')?.split(',').map(name => name.trim()).filter(Boolean);

try {
  const record = await runObservation({ runPath: run, objects }, out);
  console.log(JSON.stringify({ out: path.relative(root, out), runId: record.stage1.runId, scale: record.scale }, null, 2));
} catch (error) {
  if (error instanceof ToolError) {
    console.error(JSON.stringify({ refused: error.opiCode, message: error.message, details: error.details }, null, 2));
    process.exit(2);
  }
  throw error;
}
