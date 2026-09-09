import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { handle as compose } from '../../../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../../../packages/mcp-server/src/tools/code.generate.js';
const output = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(output, '../../../..');
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'oods-s189-collection-model-'));
try {
  const composition = await compose({ object: 'Subscription', context: 'workflow' });
  const generated = await generate({ schema: composition.schema, framework: 'react', profile: 'build' });
  if (generated.status !== 'ok' || !generated.artifact) throw new Error(JSON.stringify(generated.errors));
  for (const file of generated.artifact.files.filter(file => /src\/(store|sample-data)\.ts$/.test(file.path))) {
    await fs.writeFile(path.join(temporary, path.basename(file.path).replace('.ts', '.js')), ts.transpileModule(file.contents, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText);
  }
  await fs.mkdir(path.join(temporary, 'node_modules/@oods'), { recursive: true });
  await fs.symlink(path.join(root, 'packages/component-contracts'), path.join(temporary, 'node_modules/@oods/component-contracts'));
  const storeModule = createRequire(path.join(temporary, 'observe.cjs'))('./store.js');
  const store = storeModule.createStore({ now: () => '2026-09-08T12:00:00.000Z' });
  const record = store.get('subscription-003');
  const rows = store.list();
  const model = { ...storeModule.screenProps(record), rows: rows.records.map(storeModule.screenProps), events: storeModule.collectionEvents(record), collectionQuery: { page: rows.page, pageSize: rows.pageSize, total: rows.total } };
  await fs.writeFile(path.join(output, 'standalone-model.json'), JSON.stringify({ source: 'Unmodified generated workflow store; active list plus subscription-003 in the initial seed state.', artifactHash: generated.artifact.contentHash, model }, null, 2) + '\n');
  for (const context of ['list', 'timeline'] as const) {
    await fs.writeFile(path.join(output, 'inputs', `populated-${context}.json`), JSON.stringify({ compose: { object: 'Subscription', context }, framework: 'both', model, output: path.join(output, 'after', `populated-${context}`) }, null, 2) + '\n');
  }
} finally { await fs.rm(temporary, { recursive: true, force: true }); }
