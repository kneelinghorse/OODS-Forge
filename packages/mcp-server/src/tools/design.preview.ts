import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { ToolError } from '../errors/tool-error.js';
import type { DesignPreviewInputSchema, DesignPreviewOutputSchema } from '../schemas/generated.js';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const unavailable = () => new ToolError('OODS-N019', 'Design loop server not running in this checkout. Start it with pnpm design:loop serve.', { command: 'pnpm design:loop serve', cwd: root });

/** Reuse the runnable render leg; the tool never composes or mounts a second implementation. */
export async function handle(input: DesignPreviewInputSchema.DesignPreviewInput): Promise<DesignPreviewOutputSchema.DesignPreviewOutput> {
  try {
    const response = await fetch('http://127.0.0.1:4477/status', { signal: AbortSignal.timeout(2000) });
    const state = await response.json() as { running?: boolean };
    if (!response.ok || !state.running) throw unavailable();
  } catch { throw unavailable(); }

  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'oods-design-preview-'));
  const output = path.join(directory, 'receipt');
  const inputPath = path.join(directory, 'input.json');
  await fs.writeFile(inputPath, JSON.stringify({ compose: { object: input.object, context: input.context, ...(input.preferences ? { preferences: input.preferences } : {}) }, framework: input.framework ?? 'both', widths: input.widths ?? [390, 820, 1440], output }));
  try {
    await run(process.execPath, ['--import', 'tsx', 'scripts/design-loop/cli.ts', 'render', '--input', inputPath], { cwd: root, timeout: 120000, maxBuffer: 2_000_000 });
    const rendered = JSON.parse(await fs.readFile(path.join(output, 'render.json'), 'utf8')) as Omit<DesignPreviewOutputSchema.DesignPreviewOutput, 'status' | 'receiptPaths'>;
    return { status: 'ok', ...rendered, receiptPaths: rendered.receipts.map(receipt => path.join(String(receipt.output), 'receipt.json')) };
  } catch (error) {
    await fs.rm(directory, { recursive: true, force: true });
    // Preserve non-availability failures (composition, generation, browser, busy) as failures.
    throw error;
  }
}
