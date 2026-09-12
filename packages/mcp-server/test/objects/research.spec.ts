import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { handle as generate } from '../../src/tools/code.generate.js';
import { typecheckWorkflow } from '../product-reality/workflow-typecheck.js';
import { describe, expect, it } from 'vitest';
import { handle as object } from '../../src/tools/object.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { loadObject } from '../../src/objects/object-loader.js';
import { wire } from '../helpers/wire-boundary.js';

const names = ['Project', 'Document', 'Chunk', 'Collection', 'Mission', 'Report', 'Evidence'];
describe('TraceLab research objects', () => {
  it('discovers all seven research records without replacing universal objects', async () => {
    const result = await object(wire('object', 'input', { action: 'list', domain: 'research' }));
    wire('object', 'output', result);
    expect((result as any).objects.map((entry: any) => entry.name).sort()).toEqual([...names].sort());
    expect((result as any).objects.every((entry: any) => entry.maturity === 'alpha')).toBe(true);
    expect(loadObject('Organization').object.domain).toBe('core.account');
  });
  it('never exposes a standalone Chunk screen', async () => {
    const result = await object({ action: 'show', name: 'Chunk' });
    expect(Object.keys((result as any).viewExtensions)).toEqual(['inline']);
    const unsupported = await compose({ object: 'Chunk', context: 'detail' });
    expect(unsupported.status).toBe('error');
    expect(unsupported.errors?.[0].message).toContain('inline');
    expect((await compose({ object: 'Chunk', context: 'inline' })).validation?.status).toBe('ok');
  });
  it('keeps evidence disposition separate from mission lifecycle state', () => {
    const evidence = loadObject('Evidence');
    expect(evidence.schema.disposition.validation?.enum).toEqual(['supporting', 'contradicting', 'rejected', 'background']);
    expect(evidence.traits.some(trait => trait.name.endsWith('/Stateful'))).toBe(false);
    expect(evidence.schema.owner_id.required).toBe(false);
    expect(evidence.schema.source_sighting_count.validation?.minimum).toBe(1);
  });
  it.each(names.filter(name => name !== 'Chunk'))('%s supports every declared single-screen context', async name => {
    for (const context of ['card', 'detail', 'form', 'inline', 'list', 'timeline'] as const) {
      const result = await compose(wire('design.compose', 'input', { object: name, context, options: { validate: true } }));
      wire('design.compose', 'output', result);
      expect(result.status).toBe('ok');
      expect(result.validation?.errors ?? [], name + '/' + context).toEqual([]);
      expect(result.validation?.status).toBe('ok');
      for (const framework of ['react', 'vue'] as const) {
        const generated = await generate({ schema: result.schema, framework, profile: 'build' });
        expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
      }
    }
  });
  it('Mission workflow preserves the API state set and never introduces billing cancellation', async () => {
    const result = await compose({ object: 'Mission', context: 'workflow' });
    expect(result.validation?.errors ?? []).toEqual([]);
    expect(result.schema.workflow?.data.idField).toBe('id');
    expect(result.schema.workflow?.data.lifecycleStates).toEqual(['draft', 'queued', 'in_progress', 'completed', 'blocked', 'cancelled', 'validation_failed']);
    expect(result.schema.workflow?.transitions.some(row => row.effect === 'pending_cancellation')).toBe(false);
  });
});

it('generated Mission cancellation stays terminal and both frameworks typecheck', async () => {
  const result = await compose({ object: 'Mission', context: 'workflow' });
  for (const framework of ['react', 'vue'] as const) {
    const generated = await generate({ schema: result.schema, framework, profile: 'build' });
    expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
    const artifact = generated.artifact!;
    const source = artifact.files.map(file => file.contents).join('\n');
    expect(source).not.toContain('Cancel subscription');
    expect(source).not.toContain('CancellationSummary');
    const compilation = typecheckWorkflow(artifact);
    expect(compilation.status, compilation.stdout + compilation.stderr).toBe(0);
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'research-store-'));
    try {
      for (const file of artifact.files.filter(file => /^src\/(store|sample-data|chart-assets)\.ts$/.test(file.path))) {
        const name = path.basename(file.path, '.ts');
        const contents = file.contents;
        fs.writeFileSync(path.join(directory, `${name}.js`), ts.transpileModule(contents, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
      }
      fs.mkdirSync(path.join(directory, 'node_modules/@oods'), { recursive: true });
      fs.symlinkSync(path.resolve(import.meta.dirname, '../../../component-contracts'), path.join(directory, 'node_modules/@oods/component-contracts'), 'junction');
      const { createStore } = createRequire(path.join(directory, 'entry.cjs'))('./store.js');
      const store = createStore();
      const cancelled = store.cancel('mission-002', '', '', true);
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancel_at_period_end).toBe(false);
      expect(cancelled.state_history.at(-1).to).toBe('cancelled');
      expect(() => store.cancel('mission-002', '', '', false)).toThrow(/current state/);
      expect(() => store.cancel('mission-004', '', '', false)).toThrow(/current state/);
    } finally { fs.rmSync(directory, { recursive: true, force: true }); }
  }
}, 90_000);

it.each(['Project', 'Document', 'Collection', 'Report', 'Evidence'])('%s workflows produce strict React and Vue applications', async name => {
  const result = await compose({ object: name, context: 'workflow' });
  expect(result.validation?.errors ?? []).toEqual([]);
  for (const framework of ['react', 'vue'] as const) {
    const generated = await generate({ schema: result.schema, framework, profile: 'build' });
    expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
    const compilation = typecheckWorkflow(generated.artifact!);
    expect(compilation.status, compilation.stdout + compilation.stderr).toBe(0);
  }
}, 90_000);
