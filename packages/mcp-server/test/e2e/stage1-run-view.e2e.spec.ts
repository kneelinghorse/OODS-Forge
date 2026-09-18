/**
 * s205-m04: the run-view kinds admitted to structuredData.fetch, gated the way s204-m03 gates the rollups.
 *
 * The admission is deliberate and narrow (decided at the Sprint 205 lock, #2205): a11y_report 2.2.0,
 * report_index 1.0.0, a11y_evidence 1.1.0 (the evidence manifest's own `version`; every per-page file checked
 * against the run manifest's sha256 attestation) and run_manifest, which Stage1 stamps with no version and is
 * therefore pinned by its shape. Each kind carries:
 *
 *   - a NEGATIVE test on a copy of a real run, built in a temp directory (nothing is ever written into Stage1):
 *     a version outside the pin is refused, so a Stage1 bump lands as a refusal and never as a silent parse;
 *   - a DISCOVERING gate over every real run on disk: it reads each kind from every run that carries it, fails
 *     when Stage1 is checked out but no run can be read, and skips only on a machine with no Stage1 checkout.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { handle as fetchHandle, RUN_VIEW_ADMITTED } from '../../src/tools/structuredData.fetch.js';

function findStage1(): string | null {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 10; depth += 1) {
    const candidate = path.join(dir, 'Stage1');
    if (fs.existsSync(path.join(candidate, 'out/stage1'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
const STAGE1 = findStage1();
const stage1Present = STAGE1 !== null;
/** Every run directory (out/stage1/<suite>/<uuid>) with a manifest and an a11y report. */
const runs: string[] = STAGE1 ? fs.readdirSync(path.join(STAGE1, 'out/stage1')).flatMap(suite => {
  const suiteDir = path.join(STAGE1, 'out/stage1', suite);
  return fs.statSync(suiteDir).isDirectory() ? fs.readdirSync(suiteDir).map(id => path.join(suiteDir, id)) : [];
}).filter(dir => fs.existsSync(path.join(dir, 'manifest.json')) && fs.existsSync(path.join(dir, 'artifacts/a11y_report.json'))) : [];
const REFERENCE = runs.find(dir => dir.endsWith('6e435ce7-eaab-46b4-be6b-cea9b80defa6'));

const temps: string[] = [];
afterEach(() => { for (const dir of temps.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); });
const sha = (file: string) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

/** A copy of the reference run in a temp dir, with `edit` applied and the manifest's attestation re-signed. */
function mutatedCopy(edit: (dir: string) => void): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-run-view-'));
  temps.push(dir);
  for (const relative of ['manifest.json', 'artifacts/a11y_report.json', 'artifacts/report-index.json', 'evidence/a11y']) {
    fs.cpSync(path.join(REFERENCE!, relative), path.join(dir, relative), { recursive: true });
  }
  edit(dir);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  for (const key of Object.keys(manifest.hashes)) if (fs.existsSync(path.join(dir, key))) manifest.hashes[key] = sha(path.join(dir, key));
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return dir;
}
const rewrite = (dir: string, file: string, change: (json: Record<string, any>) => void) => {
  const full = path.join(dir, file);
  const json = JSON.parse(fs.readFileSync(full, 'utf8'));
  change(json);
  fs.writeFileSync(full, JSON.stringify(json, null, 2));
};

describe('Stage1 run-view kinds (s205-m04)', () => {
  it('admits exactly the pinned versions, and nothing else', () => {
    expect(RUN_VIEW_ADMITTED).toEqual({ a11y_report: ['2.2.0'], report_index: ['1.0.0'], a11y_evidence: ['1.1.0'], run_manifest: ['unversioned (shape-pinned)'] });
  });

  it('finds the reference run whenever Stage1 is checked out here', () => {
    if (!stage1Present) return; // the one honest skip: no Stage1 checkout on this machine
    expect(REFERENCE, 'Stage1 is checked out but run 6e435ce7 is gone').toBeDefined();
  });

  describe('negative: a version outside the pin is refused, never silently parsed', () => {
    it.runIf(Boolean(REFERENCE))('a11y_report at 2.3.0', async () => {
      const dir = mutatedCopy(copy => rewrite(copy, 'artifacts/a11y_report.json', json => { json.schema_version = '2.3.0'; }));
      await expect(fetchHandle({ kind: 'a11y_report', runPath: dir })).rejects.toMatchObject({ opiCode: 'OODS-N007', message: expect.stringContaining('Unsupported schema_version "2.3.0"') });
    });
    it.runIf(Boolean(REFERENCE))('report_index at 1.1.0', async () => {
      const dir = mutatedCopy(copy => rewrite(copy, 'artifacts/report-index.json', json => { json.schema_version = '1.1.0'; }));
      await expect(fetchHandle({ kind: 'report_index', runPath: dir })).rejects.toMatchObject({ opiCode: 'OODS-N007', message: expect.stringContaining('Unsupported schema_version "1.1.0"') });
    });
    it.runIf(Boolean(REFERENCE))('a11y_evidence at 1.2.0', async () => {
      const dir = mutatedCopy(copy => rewrite(copy, 'evidence/a11y/a11y_manifest.json', json => { json.version = '1.2.0'; }));
      await expect(fetchHandle({ kind: 'a11y_evidence', runPath: dir })).rejects.toMatchObject({ opiCode: 'OODS-N007', message: expect.stringContaining('Unsupported version "1.2.0"') });
    });
    it.runIf(Boolean(REFERENCE))('run_manifest once Stage1 stamps it, and without the shape the run view reads', async () => {
      const stamped = mutatedCopy(copy => rewrite(copy, 'manifest.json', json => { json.schema_version = '1.0.0'; }));
      await expect(fetchHandle({ kind: 'run_manifest', runPath: stamped })).rejects.toMatchObject({ opiCode: 'OODS-N007', message: expect.stringContaining('shape-pinned') });
      const shapeless = mutatedCopy(copy => rewrite(copy, 'manifest.json', json => { delete json.targets; }));
      await expect(fetchHandle({ kind: 'run_manifest', runPath: shapeless })).rejects.toMatchObject({ opiCode: 'OODS-N007', message: expect.stringContaining('targets') });
    });
    it.runIf(Boolean(REFERENCE))('an evidence file whose bytes differ from its attestation', async () => {
      const dir = mutatedCopy(() => {});
      // Tamper AFTER the re-signing: the manifest now attests bytes the file no longer has.
      fs.appendFileSync(path.join(dir, 'evidence/a11y/root.json'), ' ');
      await expect(fetchHandle({ kind: 'a11y_evidence', runPath: dir })).rejects.toMatchObject({ opiCode: 'OODS-N007', message: expect.stringContaining('attestation') });
    });
  });

  describe('discovering gate: every real run that carries a kind reads through it', () => {
    it.runIf(stage1Present)('reads all four kinds from every app run on disk with the a11y report at 2.2.0', async () => {
      const readable: string[] = [];
      for (const run of runs) {
        const report = JSON.parse(fs.readFileSync(path.join(run, 'artifacts/a11y_report.json'), 'utf8'));
        if (report.schema_version !== '2.2.0' || !fs.existsSync(path.join(run, 'artifacts/report-index.json')) || !fs.existsSync(path.join(run, 'evidence/a11y/a11y_manifest.json'))) continue;
        for (const kind of ['run_manifest', 'a11y_report', 'report_index', 'a11y_evidence'] as const) {
          const read = await fetchHandle({ kind, runPath: run, includePayload: false });
          expect(read.schemaValidated, `${kind} @ ${path.basename(run)}`).toBe(true);
        }
        readable.push(path.basename(run));
      }
      // FAILS, rather than skips, when Stage1 is here but no run can feed a run view.
      expect(readable.length, 'Stage1 is checked out but no run carries the admitted run-view kinds').toBeGreaterThan(0);
      expect(readable).toContain('6e435ce7-eaab-46b4-be6b-cea9b80defa6');
    }, 120_000);
  });
});
