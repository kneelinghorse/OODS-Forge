import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerPreviewHost } from '../../../mcp-bridge/src/preview/host.js';
import { resolveCompositionsDir } from '../../src/lib/composition-store.js';
import { getDefinition } from '../../src/errors/registry.js';
import { ToolError } from '../../src/errors/tool-error.js';
import { handle as preview } from '../../src/tools/design.preview.js';

/**
 * Sprint 205 m01, a Sprint 204 carry (#2204): OODS-V206 and OODS-V207 — Sprint 203's context refusals — were
 * thrown but never registered, and `createError` degrades an unregistered code to `server_error` with an
 * incident id. At the tool surface a caller's malformed context item therefore read as a fault in Forge,
 * retryable: false, category server_error — the one answer that tells an agent to stop rather than fix its input.
 *
 * The boundary is `ToolError.toStructured()`: it is exactly what the server's dispatch sends (src/index.ts).
 * The sweep below holds the general rule, so a refusal added later (this sprint's continue from OODS-V211)
 * cannot ship unregistered either.
 */
const src = path.resolve(fileURLToPath(import.meta.url), '../../../src');
const root = path.resolve(src, '../../..');
const FIXTURE = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-203/m05/context-fixture.json'), 'utf8')) as {
  items: Array<Record<string, string>>;
};
let storeRoot: string;
const servers: FastifyInstance[] = [];
/** The refusal is checked after the host is resolved (OODS-N021 without one), so the spec serves one, as s203's does. */
async function host(): Promise<string> {
  const server = Fastify();
  servers.push(server);
  await registerPreviewHost(server, { compositionsDir: resolveCompositionsDir(), runtimeDir: path.join(root, 'packages/mcp-bridge/dist/preview-runtime') });
  await server.listen({ port: 0, host: '127.0.0.1' });
  const address = server.server.address();
  return `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
}
beforeEach(() => { storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-refusals-')); vi.stubEnv('MCP_SCHEMA_STORE_ROOT', storeRoot); vi.stubEnv('MCP_SCHEMA_STORE_DIR', 'schemas'); vi.stubEnv('OODS_PREVIEW_HOST_URL', ''); });
afterEach(async () => { vi.unstubAllEnvs(); for (const server of servers.splice(0)) await server.close(); fs.rmSync(storeRoot, { recursive: true, force: true }); });

async function boundary(call: Promise<unknown>) {
  const error = await call.then(() => undefined, (thrown: unknown) => thrown);
  expect(error).toBeInstanceOf(ToolError);
  return (error as ToolError).toStructured();
}

describe('refusals reach the tool boundary as themselves (s205-m01)', () => {
  it('OODS-V206: a context item that cannot say where it came from is a validation refusal, not a server fault', async () => {
    const { query: _dropped, ...noQuery } = FIXTURE.items[0]!;
    const structured = await boundary(preview({ object: 'Decision', context: 'detail', contextItems: [noQuery as never] }, { previewHostUrl: await host() }));
    expect(structured).toMatchObject({ code: 'OODS-V206', category: 'validation', retryable: false });
    expect(structured.message).toMatch(/query is required/);
  }, 120_000);

  it('OODS-V207: an item keyed to another object is a validation refusal, not a server fault', async () => {
    const structured = await boundary(preview({ object: 'Decision', context: 'detail', contextItems: [{ ...FIXTURE.items[0]!, object: 'Subscription' } as never] }, { previewHostUrl: await host() }));
    expect(structured).toMatchObject({ code: 'OODS-V207', category: 'validation', retryable: false });
  }, 120_000);

  it('every OODS code the server throws is registered, so none degrades to server_error', () => {
    const walk = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true })
      .flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : entry.name.endsWith('.ts') ? [path.join(directory, entry.name)] : []);
    const thrown = new Map<string, string>();
    for (const file of walk(src)) {
      for (const match of fs.readFileSync(file, 'utf8').matchAll(/(?:ToolError|ContextRefusal)\(\s*'(OODS-[A-Z]\d+)'/g)) thrown.set(match[1]!, path.relative(src, file));
    }
    // A scan that found nothing would pass vacuously; Sprint 205's base throws 41 distinct codes.
    expect(thrown.size).toBeGreaterThanOrEqual(41);
    expect([...thrown].filter(([code]) => !getDefinition(code))).toEqual([]);
  });
});
