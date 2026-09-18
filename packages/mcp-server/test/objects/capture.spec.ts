import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { handle as object } from '../../src/tools/object.js';
import { getObjectFilePath, loadObject } from '../../src/objects/object-loader.js';
import { wire } from '../helpers/wire-boundary.js';
// @ts-expect-error — a plain .mjs receipt script, imported for its record mapping only.
import { PROVENANCE } from '../../../../artifacts/product-reality/sprint-205/m02/author-objects.mjs';

/**
 * Sprint 205 m02: Stage1's objects, born from a direct read of real runs.
 *
 * Stage1 asked for Run, Surface, Finding, Evidence, Artifact, Subject and Comparison. The fit read
 * (artifacts/product-reality/sprint-205/m02/fit-read.json) found that a run view needs three of those and
 * named the rest as not born. Every sample value these objects carry is a value a Stage1 run wrote, so the
 * screens proven here show real captures, not invented ones.
 */
const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const fit = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-205/m02/fit-read.json'), 'utf8'));
const names = ['Run', 'Finding', 'CapturedArtifact'];
const contexts = ['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow'] as const;

describe('Stage1 capture objects', () => {
  it('discovers Run, Finding and CapturedArtifact in the capture domain, alpha, without displacing anything', async () => {
    const result = await object(wire('object', 'input', { action: 'list', domain: 'capture' }));
    wire('object', 'output', result);
    const listed = (result as { objects: Array<{ name: string; maturity: string }> }).objects;
    expect(listed.map(entry => entry.name).sort()).toEqual([...names].sort());
    expect(listed.every(entry => entry.maturity === 'alpha')).toBe(true);
    for (const name of names) {
      expect(loadObject(name).object.domain).toMatch(/^capture\./);
      expect(loadObject(name).object.version).toBe('0.1.0');
      expect(getObjectFilePath(name)).toContain(`objects${path.sep}capture${path.sep}`);
    }
  });

  it('decides the Evidence collision on the registry\'s own rule: names are the key, so Stage1\'s object takes its own', () => {
    // The loader keys objects by name and keeps the FIRST file it finds for a name — a second Evidence would not
    // coexist, it would silently lose. TraceLab's Evidence stays exactly where it was.
    expect(loadObject('Evidence').object.domain).toBe('research.data');
    expect(getObjectFilePath('Evidence')).toContain(`objects${path.sep}research${path.sep}`);
    // Stage1's records are files under an attestation, and the object is named for that.
    expect(Object.keys(loadObject('CapturedArtifact').schema)).toEqual(expect.arrayContaining(['sha256', 'artifact_kind', 'path', 'provenance_at', 'provenance_method']));
    expect(fit.candidates.find((c: { name: string }) => c.name === 'Evidence')).toMatchObject({ born: true, bornAs: 'CapturedArtifact' });
  });

  it('names every candidate that is not born, with its reason', () => {
    const notBorn = fit.candidates.filter((c: { born: boolean }) => !c.born);
    expect(notBorn.map((c: { name: string }) => c.name).sort()).toEqual(['Artifact', 'Comparison', 'Subject', 'Surface']);
    for (const candidate of notBorn) expect(candidate.reason.length).toBeGreaterThan(40);
  });

  it('left no field of the run without a disposition', () => {
    for (const [source, read] of Object.entries(fit.sources as Record<string, { rows: Array<{ path: string; disposition: string | null }> }>)) {
      expect(read.rows.filter(row => !row.disposition).map(row => `${source}: ${row.path}`)).toEqual([]);
    }
  });

  it.each(names)('%s composes, validates and generates every context in both frameworks', async name => {
    for (const context of contexts) {
      const result = await compose(wire('design.compose', 'input', { object: name, context, options: { validate: true, transient: true } }));
      wire('design.compose', 'output', result);
      expect(result.status, `${name}/${context}`).toBe('ok');
      expect(result.validation?.errors ?? [], `${name}/${context}`).toEqual([]);
      for (const framework of ['react', 'vue'] as const) {
        const generated = await generate({ schema: result.schema, framework, profile: 'build' });
        expect(generated.status, `${name}/${context}/${framework}: ${JSON.stringify(generated.errors)}`).toBe('ok');
      }
    }
  }, 180_000);

  it('carries real records as its sample data, one real record per index', () => {
    // s205-m03: the provenance fields and the result state are derived from the same records by the author script.
    const records = {
      Run: fit.records.runs.map((run: Record<string, unknown>) => ({ ...run, ...PROVENANCE.Run(run) })),
      Finding: fit.records.findings.map((finding: Record<string, unknown>) => ({ ...finding, ...PROVENANCE.Finding(finding) })),
    } as Record<string, Array<Record<string, unknown>>>;
    for (const [name, rows] of Object.entries(records)) {
      const schema = loadObject(name).schema as Record<string, { examples?: unknown[] }>;
      for (const [field, entry] of Object.entries(schema)) {
        // Every field's examples are that field's values across the same real records, in the same order.
        expect(entry.examples, `${name}.${field}`).toEqual(rows.map(row => row[field]));
      }
    }
    // The six runs are every app-mode run on disk with an a11y report at 2.2.0 when the read was taken.
    expect(fit.records.runs).toHaveLength(6);
    expect(fit.records.findings).toHaveLength(6);
  });

  it('models what the run records and states what it does not', () => {
    const run = loadObject('Run');
    // Stage1 records auth.type "none" even for an authenticated capture (measured in Sprint 204): shown as recorded.
    expect(run.schema.auth_type.description).toMatch(/RECORDS/);
    // Absolute paths on the capturing machine never reach a screen.
    expect(Object.keys(run.schema)).not.toContain('evidence_dir');
    // unknown impact is its own bucket, never folded into minor.
    expect(Object.keys(run.schema)).toContain('unknown_count');
    expect(loadObject('Finding').schema.impact.validation?.enum).toEqual(['critical', 'serious', 'moderate', 'minor', 'unknown']);
    // Non-verdicts exist on this run only as page-level counts, so no finding is born from one (m03 reads this).
    expect(fit.measured.nonVerdictCounts).toEqual({ incomplete: 28, passes: 2029, inapplicable: 1531 });
    // Every artifact the index lists is attested by the manifest, and every attestation matches the bytes on disk.
    expect(fit.measured).toMatchObject({ artifacts: 27, artifactsAttested: 27, attestationsHolding: 27 });
    // The unstamped kinds are named, not hidden — and the run manifest itself carries no schema_version (m04 reads this).
    expect(fit.measured.artifactsWithoutSchemaVersion).toEqual(['entity_catalog.json', 'style_fingerprint.json', 'stylesheet_rules.json']);
    expect(fit.measured.manifestSchemaVersion).toBeNull();
  });
});
