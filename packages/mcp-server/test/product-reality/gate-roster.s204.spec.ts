import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * s204-m01. Moving a proof out of a default suite is how a proof becomes one nobody runs — the
 * Stage1 e2e fixtures are the standing example in this repo, skipped in every capture for sprints
 * because the run they read no longer existed. So the roster that names the on-demand gates is
 * held against the configs it describes: excluded where it claims to be excluded, included where
 * it claims to be included, and reachable by the one runner closeout calls.
 */

const root = path.resolve(import.meta.dirname, '../../../..');
const read = (relativePath: string) => readFileSync(path.join(root, relativePath), 'utf8');
const roster = JSON.parse(read('scripts/product-reality/on-demand-gates.json')) as {
  gates: Array<{
    id: string; specFile: string; config: string; command: string[];
    excludedFrom: string[]; proves: string; movesWhen: string;
  }>;
  notStandingGates: Array<{ id: string; config: string; reason: string }>;
};

describe('the on-demand gate roster is true (s204 m01)', () => {
  it('names at least the gate this mission moved, and every entry carries its reason', () => {
    expect(roster.gates.map(({ id }) => id)).toContain('runtime-gate-bites');
    for (const gate of roster.gates) {
      expect(gate.proves, gate.id).toBeTruthy();
      expect(gate.movesWhen, gate.id).toBeTruthy();
      expect(gate.command.length, gate.id).toBeGreaterThan(0);
    }
  });

  it('every rostered gate is excluded from the suites it claims to be excluded from', () => {
    for (const gate of roster.gates) {
      for (const configPath of gate.excludedFrom) {
        const config = read(configPath);
        const excluded = config.includes(gate.specFile.replace(/^packages\/mcp-server\//, ''))
          || config.includes(gate.specFile);
        expect(excluded, `${gate.id} is not excluded from ${configPath}`).toBe(true);
      }
    }
  });

  it('every rostered gate is included by its own config, so the command actually runs something', () => {
    for (const gate of roster.gates) {
      const config = read(gate.config);
      const relative = gate.specFile.replace(/^packages\/mcp-server\//, '');
      expect(config.includes(relative) || config.includes(gate.specFile), `${gate.config} does not include ${gate.specFile}`).toBe(true);
    }
  });

  it('every rostered command resolves to a script that exists', () => {
    const manifest = JSON.parse(read('packages/mcp-server/package.json')) as { scripts: Record<string, string> };
    for (const gate of roster.gates) {
      const runIndex = gate.command.indexOf('run');
      expect(runIndex, `${gate.id} command is not a pnpm run invocation`).toBeGreaterThan(-1);
      const scriptName = gate.command[runIndex + 1]!;
      expect(manifest.scripts[scriptName], `${gate.id} names a missing script ${scriptName}`).toBeTruthy();
      expect(manifest.scripts[scriptName]).toContain(path.basename(gate.config));
    }
  });

  it('the closeout runner runs the whole roster, not a hand-copied subset', () => {
    const runner = read('scripts/product-reality/run-on-demand-gates.mjs');
    // It must read the roster rather than list gates of its own, or the roster stops being the
    // single place a new on-demand gate has to be registered.
    expect(runner).toContain('on-demand-gates.json');
    expect(runner).toMatch(/roster\.gates/);
    for (const gate of roster.gates) expect(runner).not.toContain(gate.command.join(' '));
  });

  it('a config named as not a standing gate is not in the roster', () => {
    const rosterConfigs = new Set(roster.gates.map(({ config }) => config));
    for (const entry of roster.notStandingGates) {
      expect(rosterConfigs.has(entry.config), `${entry.id} is both rostered and declared not a gate`).toBe(false);
      expect(entry.reason).toBeTruthy();
    }
  });
});
