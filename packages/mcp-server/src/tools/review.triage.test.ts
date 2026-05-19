/**
 * review.triage unit tests.
 *
 * Coverage:
 *   - input shape: malformed input rejected, decisions[] non-array rejected
 *   - path safety: absolute paths, parent-traversal, project-escape, missing files, malformed JSON rejected
 *   - artifact shape: non-object / missing kind header rejected
 *   - each verdict (accept, patch, defer, dismiss) updates artifact and returns expected mutations
 *   - idempotency: re-running with same payload returns already_resolved errors
 *   - item-not-found surfaces as non-fatal error
 *   - invalid verdict surfaces as non-fatal error
 *   - atomicity: one map.* failure does not roll back other decisions in same batch
 *   - dismiss does not call map.delete (local-only)
 *   - defer does not call map.* (local-only)
 *   - remediation_hints[] population helper tested via map.apply.ts indirectly (see contract test);
 *     here we just verify hints are preserved on the artifact after triage.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { handle } from './review.triage.js';
import { isToolError } from '../errors/tool-error.js';
import { MAPPINGS_PATH_ENV } from './map.shared.js';
import type { ConflictArtifact, ReviewTriageInput } from './types.js';

const FIXTURE_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../test/fixtures/conflict-artifacts',
);

let tmpRoot: string;
let mappingsTmpDir: string;
let originalMappingsPathEnv: string | undefined;

function loadFixture(name: string): ConflictArtifact {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8')) as ConflictArtifact;
}

function writeArtifactInto(root: string, relPath: string, artifact: ConflictArtifact): string {
  const abs = path.resolve(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(artifact, null, 2) + '\n', 'utf8');
  return relPath;
}

function readArtifactFrom(root: string, relPath: string): ConflictArtifact {
  return JSON.parse(fs.readFileSync(path.resolve(root, relPath), 'utf8')) as ConflictArtifact;
}

function seedMappings(mappings: unknown[]): void {
  const mappingsPath = process.env[MAPPINGS_PATH_ENV]!;
  fs.mkdirSync(path.dirname(mappingsPath), { recursive: true });
  fs.writeFileSync(
    mappingsPath,
    JSON.stringify(
      {
        $schema: '../../packages/mcp-server/src/schemas/component-mapping.schema.json',
        generatedAt: '2026-05-19T00:00:00.000Z',
        version: '2026-05-19',
        stats: { mappingCount: mappings.length, systemCount: 1 },
        mappings,
      },
      null,
      2,
    ) + '\n',
  );
}

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'review-triage-'));
  mappingsTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'review-triage-mappings-'));
  originalMappingsPathEnv = process.env[MAPPINGS_PATH_ENV];
  process.env[MAPPINGS_PATH_ENV] = path.join(mappingsTmpDir, 'component-mappings.json');
  seedMappings([]);
});

afterEach(() => {
  if (tmpRoot) fs.rmSync(tmpRoot, { recursive: true, force: true });
  if (mappingsTmpDir) fs.rmSync(mappingsTmpDir, { recursive: true, force: true });
  if (originalMappingsPathEnv === undefined) delete process.env[MAPPINGS_PATH_ENV];
  else process.env[MAPPINGS_PATH_ENV] = originalMappingsPathEnv;
});

describe('review.triage — input validation', () => {
  it('throws ToolError when input is not an object', async () => {
    let caught: unknown;
    try {
      await handle(null as unknown as ReviewTriageInput);
    } catch (err) {
      caught = err;
    }
    expect(isToolError(caught)).toBe(true);
  });

  it('throws ToolError when decisions is not an array', async () => {
    let caught: unknown;
    try {
      await handle({
        conflictArtifactPath: 'x.json',
        decisions: 'oops' as unknown as ReviewTriageInput['decisions'],
        projectRoot: tmpRoot,
      });
    } catch (err) {
      caught = err;
    }
    expect(isToolError(caught)).toBe(true);
  });
});

describe('review.triage — path safety', () => {
  const baseFixture = (): ConflictArtifact => loadFixture('linear-mixed-conflicts.json');

  it('rejects absolute conflictArtifactPath', async () => {
    let caught: unknown;
    try {
      await handle({
        conflictArtifactPath: '/etc/passwd',
        decisions: [],
        projectRoot: tmpRoot,
      });
    } catch (err) {
      caught = err;
    }
    expect(isToolError(caught)).toBe(true);
  });

  it('rejects parent-traversal in conflictArtifactPath', async () => {
    let caught: unknown;
    try {
      await handle({
        conflictArtifactPath: '../secret.json',
        decisions: [],
        projectRoot: tmpRoot,
      });
    } catch (err) {
      caught = err;
    }
    expect(isToolError(caught)).toBe(true);
  });

  it('rejects missing artifact file', async () => {
    let caught: unknown;
    try {
      await handle({
        conflictArtifactPath: 'does-not-exist.json',
        decisions: [],
        projectRoot: tmpRoot,
      });
    } catch (err) {
      caught = err;
    }
    expect(isToolError(caught)).toBe(true);
  });

  it('rejects artifact that is not valid JSON', async () => {
    const rel = path.join('.oods', 'conflicts', 'corrupt.json');
    const abs = path.resolve(tmpRoot, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, '{ not valid json', 'utf8');
    let caught: unknown;
    try {
      await handle({ conflictArtifactPath: rel, decisions: [], projectRoot: tmpRoot });
    } catch (err) {
      caught = err;
    }
    expect(isToolError(caught)).toBe(true);
  });

  it('rejects artifact missing the kind="map.apply.conflicts" header', async () => {
    const rel = path.join('.oods', 'conflicts', 'wrong-kind.json');
    const abs = path.resolve(tmpRoot, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, JSON.stringify({ kind: 'something-else' }), 'utf8');
    let caught: unknown;
    try {
      await handle({ conflictArtifactPath: rel, decisions: [], projectRoot: tmpRoot });
    } catch (err) {
      caught = err;
    }
    expect(isToolError(caught)).toBe(true);
  });

  it('loads a valid artifact when projectRoot is supplied', async () => {
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', baseFixture());
    const out = await handle({ conflictArtifactPath: rel, decisions: [], projectRoot: tmpRoot });
    expect(out.summary).toEqual({ accepted: 0, patched: 0, deferred: 0, dismissed: 0 });
    expect(out.errors).toEqual([]);
  });
});

describe('review.triage — verdict: accept', () => {
  it('accept creates a mapping via map.create and marks item accepted', async () => {
    seedMappings([]);
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [
        { objectId: 'obj-experimental-badge', verdict: 'accept', reason: 'looks correct', resolvedBy: 'derek' },
      ],
      projectRoot: tmpRoot,
    });
    expect(out.summary.accepted).toBe(1);
    expect(out.errors).toEqual([]);
    expect(out.mapsCreated).toHaveLength(1);
    expect(out.mapsCreated[0].objectId).toBe('obj-experimental-badge');

    const updated = readArtifactFrom(tmpRoot, rel);
    const item = updated.belowConfidence.find((i) => i.objectId === 'obj-experimental-badge')!;
    expect(item.resolution_status).toBe('accepted');
    expect(item.resolved_by).toBe('derek');
    expect(item.operator_reason).toBe('looks correct');
    expect(item.resolved_at).toBeTruthy();
    expect(item.remediation_hints).toBeDefined();
    expect(item.remediation_hints!.length).toBeGreaterThan(0);
  });

  it('accept fails with missing_recommended_traits when traits[] is empty', async () => {
    const fixture = loadFixture('linear-mixed-conflicts.json');
    fixture.conflicts[0].candidate.recommended_oods_traits = [];
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/empty-traits.json', fixture);
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [{ objectId: fixture.conflicts[0].objectId, verdict: 'accept' }],
      projectRoot: tmpRoot,
    });
    expect(out.summary.accepted).toBe(0);
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0].kind).toBe('missing_recommended_traits');
  });
});

describe('review.triage — verdict: patch', () => {
  it('patch updates an existing mapping and marks item patched', async () => {
    seedMappings([
      {
        id: 'linear-workspace-switcher',
        externalSystem: 'linear',
        externalComponent: 'Workspace Switcher',
        oodsTraits: ['Stateful'],
        confidence: 'manual',
        metadata: { createdAt: '2026-03-01T00:00:00.000Z' },
      },
    ]);
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [
        { objectId: 'obj-workspace-switcher', verdict: 'patch', reason: 'patching traits' },
      ],
      projectRoot: tmpRoot,
    });
    expect(out.summary.patched).toBe(1);
    expect(out.errors).toEqual([]);
    expect(out.mapsUpdated).toHaveLength(1);
    expect(out.mapsUpdated[0].mappingId).toBe('linear-workspace-switcher');
    expect(out.mapsUpdated[0].changes).toContain('oodsTraits');

    const updated = readArtifactFrom(tmpRoot, rel);
    const item = updated.conflicts.find((i) => i.objectId === 'obj-workspace-switcher')!;
    expect(item.resolution_status).toBe('patched');
    expect(item.operator_reason).toBe('patching traits');
  });

  it('patch with patchOverrides merges overrides on top of recommended traits', async () => {
    seedMappings([
      {
        id: 'linear-workspace-switcher',
        externalSystem: 'linear',
        externalComponent: 'Workspace Switcher',
        oodsTraits: ['Stateful'],
        confidence: 'manual',
        metadata: { createdAt: '2026-03-01T00:00:00.000Z' },
      },
    ]);
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [
        {
          objectId: 'obj-workspace-switcher',
          verdict: 'patch',
          patchOverrides: { confidence: 'manual', oodsTraits: ['Navigable', 'Labelled', 'Stateful'] },
        },
      ],
      projectRoot: tmpRoot,
    });
    expect(out.summary.patched).toBe(1);
    expect(out.mapsUpdated[0].changes).toEqual(expect.arrayContaining(['oodsTraits']));
  });

  it('patch fails with missing_existing_mapping when item has no existingMapId', async () => {
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [{ objectId: 'obj-command-menu', verdict: 'patch' }],
      projectRoot: tmpRoot,
    });
    expect(out.summary.patched).toBe(0);
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0].kind).toBe('missing_existing_mapping');
  });

  it('patch fails non-fatally with map_call_failed when target mapping is missing in registry', async () => {
    // belowConfidence item has no existing_map_id by default, but conflict
    // 'obj-workspace-switcher' lists existingMapId='linear-workspace-switcher'.
    // Seed without that mapping to force a 'no mapping found' failure from map.update.
    seedMappings([]);
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [{ objectId: 'obj-workspace-switcher', verdict: 'patch', reason: 'should fail' }],
      projectRoot: tmpRoot,
    });
    expect(out.summary.patched).toBe(0);
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0].kind).toBe('map_call_failed');

    // The item must remain 'open' so a retry can succeed once the mapping exists.
    const updated = readArtifactFrom(tmpRoot, rel);
    const item = updated.conflicts.find((i) => i.objectId === 'obj-workspace-switcher')!;
    expect(item.resolution_status).toBe('open');
  });
});

describe('review.triage — verdict: defer and dismiss', () => {
  it('defer marks item deferred without calling map.*', async () => {
    seedMappings([]);
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [{ objectId: 'obj-experimental-badge', verdict: 'defer', reason: 'low confidence' }],
      projectRoot: tmpRoot,
    });
    expect(out.summary.deferred).toBe(1);
    expect(out.mapsCreated).toEqual([]);
    expect(out.mapsUpdated).toEqual([]);
    expect(out.mapsRemoved).toEqual([]);

    const updated = readArtifactFrom(tmpRoot, rel);
    const item = updated.belowConfidence.find((i) => i.objectId === 'obj-experimental-badge')!;
    expect(item.resolution_status).toBe('deferred');
    expect(item.operator_reason).toBe('low confidence');
  });

  it('dismiss marks item dismissed without calling map.*', async () => {
    seedMappings([
      {
        id: 'linear-workspace-switcher',
        externalSystem: 'linear',
        externalComponent: 'Workspace Switcher',
        oodsTraits: ['Stateful'],
        confidence: 'manual',
      },
    ]);
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [{ objectId: 'obj-workspace-switcher', verdict: 'dismiss' }],
      projectRoot: tmpRoot,
    });
    expect(out.summary.dismissed).toBe(1);
    expect(out.mapsRemoved).toEqual([]);

    const updated = readArtifactFrom(tmpRoot, rel);
    const item = updated.conflicts.find((i) => i.objectId === 'obj-workspace-switcher')!;
    expect(item.resolution_status).toBe('dismissed');

    // The existing mapping must NOT have been deleted.
    const mappingsRaw = JSON.parse(fs.readFileSync(process.env[MAPPINGS_PATH_ENV]!, 'utf8')) as {
      mappings: Array<{ id: string }>;
    };
    expect(mappingsRaw.mappings.find((m) => m.id === 'linear-workspace-switcher')).toBeDefined();
  });
});

describe('review.triage — idempotency + batched decisions', () => {
  it('re-running same payload returns already_resolved errors and does not double-create', async () => {
    seedMappings([]);
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const input: ReviewTriageInput = {
      conflictArtifactPath: rel,
      decisions: [{ objectId: 'obj-experimental-badge', verdict: 'accept' }],
      projectRoot: tmpRoot,
    };
    const first = await handle(input);
    expect(first.summary.accepted).toBe(1);
    expect(first.errors).toEqual([]);

    const second = await handle(input);
    expect(second.summary.accepted).toBe(0);
    expect(second.errors).toHaveLength(1);
    expect(second.errors[0].kind).toBe('already_resolved');
  });

  it('item-not-found surfaces as non-fatal error', async () => {
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [{ objectId: 'no-such-object', verdict: 'accept' }],
      projectRoot: tmpRoot,
    });
    expect(out.summary).toEqual({ accepted: 0, patched: 0, deferred: 0, dismissed: 0 });
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0].kind).toBe('item_not_found');
  });

  it('invalid verdict surfaces as non-fatal error', async () => {
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [
        { objectId: 'obj-experimental-badge', verdict: 'nonsense' as unknown as 'accept' },
      ],
      projectRoot: tmpRoot,
    });
    expect(out.summary).toEqual({ accepted: 0, patched: 0, deferred: 0, dismissed: 0 });
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0].kind).toBe('invalid_verdict');
  });

  it('atomicity: one decision failure does not block subsequent decisions in same batch', async () => {
    seedMappings([]);
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [
        // obj-command-menu is a conflict with no existing_map_id → patch fails missing_existing_mapping
        { objectId: 'obj-command-menu', verdict: 'patch' },
        // obj-experimental-badge accept should still succeed
        { objectId: 'obj-experimental-badge', verdict: 'accept', reason: 'good signal' },
      ],
      projectRoot: tmpRoot,
    });
    expect(out.summary.accepted).toBe(1);
    expect(out.summary.patched).toBe(0);
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0].kind).toBe('missing_existing_mapping');
    expect(out.mapsCreated).toHaveLength(1);
  });

  it('multiple defer/dismiss verdicts batch cleanly', async () => {
    seedMappings([
      {
        id: 'linear-workspace-switcher',
        externalSystem: 'linear',
        externalComponent: 'Workspace Switcher',
        oodsTraits: ['Stateful'],
        confidence: 'manual',
      },
    ]);
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', loadFixture('linear-mixed-conflicts.json'));
    const out = await handle({
      conflictArtifactPath: rel,
      decisions: [
        { objectId: 'obj-workspace-switcher', verdict: 'dismiss' },
        { objectId: 'obj-experimental-badge', verdict: 'defer' },
      ],
      projectRoot: tmpRoot,
    });
    expect(out.summary).toEqual({ accepted: 0, patched: 0, deferred: 1, dismissed: 1 });
    expect(out.errors).toEqual([]);
  });

  it('preserves remediation_hints[] on the artifact after triage', async () => {
    seedMappings([]);
    const before = loadFixture('linear-mixed-conflicts.json');
    const hintsBefore = before.belowConfidence[0].remediation_hints;
    const rel = writeArtifactInto(tmpRoot, '.oods/conflicts/sample.json', before);
    await handle({
      conflictArtifactPath: rel,
      decisions: [{ objectId: 'obj-experimental-badge', verdict: 'defer' }],
      projectRoot: tmpRoot,
    });
    const after = readArtifactFrom(tmpRoot, rel);
    expect(after.belowConfidence[0].remediation_hints).toEqual(hintsBefore);
  });
});
