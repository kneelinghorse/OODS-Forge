import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const receipt = 'artifacts/product-reality/sprint-197/m01';
const read = (file: string) => JSON.parse(readFileSync(path.join(receipt, file), 'utf8'));
const sha = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

describe('before-palette evidence is bound to the immutable base', () => {
  it('recomputes every tracked identity, snapshot entry, hash pin and literal from Git blobs', () => {
    expect(() => execFileSync('python3', ['scripts/product-reality/s197-palette-baseline.py', '--check'])).not.toThrow();
  });
  it('retains the exact baseline bytes needed for the single golden migration', () => {
    const baseline = read('baseline.json');
    for (const row of baseline.trackedFiles) {
      if (!['token', 'snapshot', 'registry', 'certified-matrix', 'pinned-literal-source'].includes(row.class)) continue;
      expect(sha(readFileSync(path.join(receipt, 'before', row.path))), row.path).toBe(row.sha256);
    }
    expect(baseline.builderSelfCertified).toBe(false);
  });
  it('retains all generated exports and six actual scoped token maps', () => {
    const baseline = read('export-baseline.json');
    for (const row of baseline.generatedExports) {
      expect(sha(readFileSync(path.join(receipt, 'before', row.path))), row.path).toBe(row.sha256);
    }
    const scopes = read('before/cssVariablesByScope.json');
    expect(Object.keys(scopes)).toEqual(['A', 'B']);
    for (const brand of ['A', 'B']) expect(Object.keys(scopes[brand])).toEqual(['light', 'dark', 'hc']);
  });
  it('records real failing gates, with per-check counts and unchanged source hashes', () => {
    const commands = read('before/commands.json');
    const baseline = read('baseline.json');
    const sources = new Map(baseline.trackedFiles.filter((row: { class: string }) => row.class === 'token')
      .map((row: { path: string; sha256: string }) => [row.path, row.sha256]));
    expect(commands.unchangedTokenSources).toHaveLength(sources.size);
    for (const row of commands.unchangedTokenSources) expect(row.sha256).toBe(sources.get(row.path));
    for (const command of commands.commands) {
      expect(command.exitCode).toBe(1);
      expect(Object.values(command.summary).some((row: any) => row.failed > 0)).toBe(true);
    }
  });
});
