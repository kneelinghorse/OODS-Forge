import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  assertS185Differential,
  assertS185HeaderCells,
  assertS185HydrationBite,
  deleteDetailHeaderImplementation,
  observeS185HeaderCells,
  type HeaderObservation,
} from '../../../../scripts/product-reality/s185-m04-controls.js';
import { GATE_NAMES } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
let baseline: HeaderObservation[];
beforeAll(async () => { baseline = await observeS185HeaderCells(); });

function expectedHeaderRed(framework: 'react' | 'vue'): HeaderObservation[] {
  return baseline.map(cell => cell.framework === framework && cell.headerNodes.length > 0 ? {
    ...cell, status: 'red', errorCodes: ['OODS-N015'], errorComponents: ['DetailHeader'],
    artifactNonempty: false, sourceBytes: 0,
  } : { ...cell });
}

function differential() {
  const snapshot = (react: string) => ({
    live: { sha256: react, cells: [
      { schema: 'plan-form-dark', framework: 'react', sourceSha256: react },
      { schema: 'plan-form-dark', framework: 'vue', sourceSha256: 'vue-original' },
    ] }, legacy: { snapshotSha256: 'frozen-s183' },
  });
  return { preGreen: snapshot('react-original'), selectedRed: snapshot('react-mutated'), restoredGreen: snapshot('react-original') };
}

function hydrationBite() {
  return {
    status: 'detected', expectedFailedGate: 'hydration', observedFailedGates: ['hydration'],
    gates: GATE_NAMES.map(name => ({ name, status: name === 'hydration' ? 'failed' : name === 'interaction-evidence' ? 'unproven' : 'passed' })),
    mutation: { gate: 'hydration', operations: [{ replacementCount: 1, beforeSha256: 'before', afterSha256: 'after' }] },
  };
}

describe('Sprint 185 m04 controls verify their intended failure boundary', () => {
  it('observes all twelve current live build cells without any readiness injection', () => {
    expect(() => assertS185HeaderCells(baseline, null)).not.toThrow();
    expect(baseline.filter(cell => cell.headerNodes.length)).toHaveLength(10);
    expect(baseline.filter(cell => !cell.headerNodes.length).map(cell => cell.schema)).toEqual(['user-card-showcase', 'user-card-showcase']);
  });

  for (const framework of ['react', 'vue'] as const) {
    it(`${framework} removes the complete DetailHeader body and preserves the other four implementations`, () => {
      const suffix = framework === 'react' ? 'tsx' : 'ts';
      const source = readFileSync(path.join(root, `packages/components-${framework}/src/breadth.${suffix}`), 'utf8');
      const changed = deleteDetailHeaderImplementation(source, framework);
      expect(changed.replacementCount).toBe(1);
      expect(changed.removed).toContain('data-oods-component');
      expect(changed.source).not.toContain('export const DetailHeader');
      expect(changed.source).not.toContain('DetailHeader.displayName');
      if (framework === 'react') expect(changed.source).not.toContain('DetailHeaderProps');
      expect(changed.source.slice(changed.source.indexOf('export const CardHeader')))
        .toBe(source.slice(source.indexOf('export const CardHeader')));
      const parsed = ts.createSourceFile(`breadth.${suffix}`, changed.source, ts.ScriptTarget.Latest, true,
        framework === 'react' ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      expect((parsed as unknown as { parseDiagnostics: unknown[] }).parseDiagnostics).toEqual([]);
      expect(() => deleteDetailHeaderImplementation(changed.source, framework)).toThrow(/exactly one/);
      expect(() => deleteDetailHeaderImplementation(`${source}\n${changed.removed}`, framework)).toThrow(/exactly one/);
    });

    it(`${framework} accepts exactly five measured selected-target reds and seven unaffected greens`, () => {
      const cells = expectedHeaderRed(framework);
      expect(() => assertS185HeaderCells(cells, framework)).not.toThrow();
      expect(cells.filter(cell => cell.status === 'red')).toHaveLength(5);
      expect(cells.filter(cell => cell.status === 'green')).toHaveLength(7);
    });

    it(`${framework} cannot claim discrimination while the implementation deletion stays green`, () => {
      expect(() => assertS185HeaderCells(baseline, framework)).toThrow(/wrong side/);
    });
  }

  it('rejects a counterpart-target red even when all five selected cells failed', () => {
    const cells = expectedHeaderRed('react');
    cells.find(cell => cell.framework === 'vue')!.status = 'red';
    expect(() => assertS185HeaderCells(cells, 'react')).toThrow(/wrong side/);
  });

  it('keeps user-card green because its saved input contains CardHeader but no DetailHeader', () => {
    const cells = expectedHeaderRed('vue');
    cells.find(cell => cell.schema === 'user-card-showcase' && cell.framework === 'vue')!.status = 'red';
    expect(() => assertS185HeaderCells(cells, 'vue')).toThrow(/wrong side/);
  });

  it('rejects a wrong red gate, an artifact on the red side, and a missing green artifact', () => {
    const wrongGate = expectedHeaderRed('react');
    wrongGate.find(cell => cell.status === 'red')!.errorCodes = ['OODS-V007'];
    expect(() => assertS185HeaderCells(wrongGate, 'react')).toThrow(/wrong failed gate/);
    const emitted = expectedHeaderRed('react');
    emitted.find(cell => cell.status === 'red')!.artifactNonempty = true;
    expect(() => assertS185HeaderCells(emitted, 'react')).toThrow();
    const empty = structuredClone(baseline); empty[0]!.artifactNonempty = false;
    expect(() => assertS185HeaderCells(empty, null)).toThrow();
  });

  it('rejects a duplicated cell and input substitutions instead of trusting the headline', () => {
    expect(() => assertS185HeaderCells([...baseline.slice(1), baseline[1]!], null)).toThrow(/twelve unique/);
    const cells = structuredClone(baseline); cells[0]!.schemaSha256 = 'changed-schema';
    expect(() => assertS185HeaderCells(cells, null)).toThrow(/immutable input/);
  });

  it('requires the current React emitter to move while Vue and the frozen s183 loader stay inert', () => {
    expect(() => assertS185Differential(differential())).not.toThrow();
    const dead = differential(); dead.selectedRed.live.sha256 = dead.preGreen.live.sha256;
    expect(() => assertS185Differential(dead)).toThrow(/did not respond/);
    const leaked = differential(); leaked.selectedRed.live.cells[1]!.sourceSha256 = 'changed';
    expect(() => assertS185Differential(leaked)).toThrow(/leaked into Vue/);
    const legacy = differential(); legacy.selectedRed.legacy.snapshotSha256 = 'moved';
    expect(() => assertS185Differential(legacy)).toThrow(/Frozen Sprint 183/);
    const unrestored = differential(); unrestored.restoredGreen.live.sha256 = 'unrestored';
    expect(() => assertS185Differential(unrestored)).toThrow(/failed to restore/);
  });

  it('requires a unique hydration failure after install, typecheck, build, SSR and mount passed', () => {
    expect(() => assertS185HydrationBite(hydrationBite())).not.toThrow();
    const wrong = hydrationBite(); wrong.observedFailedGates = ['mount'];
    expect(() => assertS185HydrationBite(wrong)).toThrow(/named gate/);
    const early = hydrationBite(); early.gates.find(gate => gate.name === 'mount')!.status = 'unproven';
    expect(() => assertS185HydrationBite(early)).toThrow(/must precede/);
    const noChange = hydrationBite(); noChange.mutation.operations[0]!.afterSha256 = 'before';
    expect(() => assertS185HydrationBite(noChange)).toThrow();
    const falseHeadline = hydrationBite(); falseHeadline.gates.find(gate => gate.name === 'hydration')!.status = 'passed';
    expect(() => assertS185HydrationBite(falseHeadline)).toThrow(/Actual gate rows/);
  });
});
