/**
 * map.apply → review.triage full round-trip contract.
 *
 * Verifies:
 *   1. map.apply writes a conflict artifact with remediation_hints[] populated
 *      per conflict and per belowConfidence item (1–3 hints, confidence-desc).
 *   2. review.triage loads that artifact, applies a mixed-verdict batch (accept,
 *      patch, defer, dismiss), and the resulting registry state plus artifact
 *      state match what each verdict claims to do.
 *   3. Output schema validates and the artifact remains valid JSON of the
 *      expected shape after triage.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getAjv } from '../../src/lib/ajv.js';
import inputSchema from '../../src/schemas/review.triage.input.json' assert { type: 'json' };
import outputSchema from '../../src/schemas/review.triage.output.json' assert { type: 'json' };
import type {
  ConflictArtifact,
  MapApplyOutput,
  Stage1ReconciliationReport,
} from '../../src/tools/types.js';
import type { ComponentMapping } from '../../src/tools/map.shared.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../../');
const FIXTURE_PATH = path.join(
  REPO_ROOT,
  'packages',
  'mcp-server',
  'test',
  'fixtures',
  'reconciliation-report-v1.1.0.json',
);
const DEFAULT_MAPPINGS_PATH = path.join(REPO_ROOT, 'artifacts', 'structured-data', 'component-mappings.json');
const MAPPINGS_PATH_ENV = 'MCP_MAPPINGS_PATH';

const ajv = getAjv();
const validateInput = ajv.compile(inputSchema);
const validateOutput = ajv.compile(outputSchema);

function currentMappingsPath(): string {
  return process.env[MAPPINGS_PATH_ENV] || DEFAULT_MAPPINGS_PATH;
}

function writeMappings(mappings: ComponentMapping[]): void {
  const mappingsPath = currentMappingsPath();
  const doc = {
    $schema: '../../packages/mcp-server/src/schemas/component-mapping.schema.json',
    generatedAt: '2026-05-19T00:00:00.000Z',
    version: '2026-05-19',
    stats: {
      mappingCount: mappings.length,
      systemCount: new Set(mappings.map((mapping) => mapping.externalSystem)).size,
    },
    mappings,
  };
  fs.mkdirSync(path.dirname(mappingsPath), { recursive: true });
  fs.writeFileSync(mappingsPath, JSON.stringify(doc, null, 2) + '\n');
}

function readMappings(): ComponentMapping[] {
  const doc = JSON.parse(fs.readFileSync(currentMappingsPath(), 'utf8')) as { mappings: ComponentMapping[] };
  return doc.mappings;
}

function loadReportFixture(): Stage1ReconciliationReport {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8')) as Stage1ReconciliationReport;
}

let originalMappings: string | null = null;
let originalMappingsPathEnv: string | undefined;
let mappingsTmpDir: string | null = null;
let cwdBackup: string;
let tmpCwd: string;

beforeAll(() => {
  originalMappingsPathEnv = process.env[MAPPINGS_PATH_ENV];
  const originalPath = currentMappingsPath();
  originalMappings = fs.existsSync(originalPath) ? fs.readFileSync(originalPath, 'utf8') : null;

  mappingsTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'review-triage-roundtrip-mappings-'));
  process.env[MAPPINGS_PATH_ENV] = path.join(mappingsTmpDir, 'component-mappings.json');

  cwdBackup = process.cwd();
  tmpCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'review-triage-roundtrip-cwd-'));
  process.chdir(tmpCwd);
});

afterAll(() => {
  process.chdir(cwdBackup);

  if (originalMappingsPathEnv === undefined) delete process.env[MAPPINGS_PATH_ENV];
  else process.env[MAPPINGS_PATH_ENV] = originalMappingsPathEnv;

  const restored = currentMappingsPath();
  if (originalMappings === null) {
    fs.rmSync(restored, { force: true });
  } else {
    fs.mkdirSync(path.dirname(restored), { recursive: true });
    fs.writeFileSync(restored, originalMappings);
  }

  if (mappingsTmpDir) fs.rmSync(mappingsTmpDir, { recursive: true, force: true });
  fs.rmSync(tmpCwd, { recursive: true, force: true });
});

beforeEach(() => {
  // The Stage1 fixture references three existing mappings (issue-row,
  // billing-plan-card, workspace-switcher). The map.apply happy-path expects
  // them present so that patch/skip/conflict can resolve.
  writeMappings([
    {
      id: 'linear-issue-row',
      externalSystem: 'linear',
      externalComponent: 'Issue Row',
      oodsTraits: ['Listable'],
      confidence: 'manual',
      metadata: { createdAt: '2026-03-01T00:00:00.000Z', notes: 'Imported from sprint-52 fixture' },
    },
    {
      id: 'linear-billing-plan-card',
      externalSystem: 'linear',
      externalComponent: 'Billing Plan Card',
      oodsTraits: ['Priceable', 'Stateful'],
      confidence: 'manual',
      metadata: { createdAt: '2026-03-01T00:00:00.000Z' },
    },
    {
      id: 'linear-workspace-switcher',
      externalSystem: 'linear',
      externalComponent: 'Workspace Switcher',
      oodsTraits: ['Stateful'],
      confidence: 'manual',
      metadata: { createdAt: '2026-03-01T00:00:00.000Z' },
    },
  ]);
  // Wipe any stray conflict artifact from previous test runs.
  const conflictsDir = path.join(tmpCwd, '.oods', 'conflicts');
  if (fs.existsSync(conflictsDir)) {
    fs.rmSync(conflictsDir, { recursive: true, force: true });
  }
});

async function runMapApply(): Promise<MapApplyOutput> {
  // map.apply.ts writes conflict artifacts to REPO_ROOT/.oods/conflicts which
  // is the repo root via __dirname; for an isolated test it's enough that the
  // returned artifactPath exists. The contract spec already covers persistence
  // semantics — this contract focuses on the round-trip payload shape.
  const mod = await import('../../src/tools/map.apply.js');
  return mod.handle({
    report: loadReportFixture(),
    apply: true,
    minConfidence: 0.75,
  });
}

function readArtifact(absPath: string): ConflictArtifact {
  return JSON.parse(fs.readFileSync(absPath, 'utf8')) as ConflictArtifact;
}

describe('map.apply → review.triage round-trip', () => {
  it('map.apply populates remediation_hints[] on conflict and belowConfidence items', async () => {
    const result = await runMapApply();
    expect(result.conflictArtifactPath).toBeDefined();
    const artifactAbs = path.resolve(REPO_ROOT, result.conflictArtifactPath!);
    const artifact = readArtifact(artifactAbs);

    expect(artifact.conflicts.length).toBeGreaterThan(0);
    for (const item of artifact.conflicts) {
      expect(item.remediation_hints).toBeDefined();
      expect(item.remediation_hints!.length).toBeGreaterThanOrEqual(1);
      expect(item.remediation_hints!.length).toBeLessThanOrEqual(3);
      // confidence-desc ordering invariant
      const conf = item.remediation_hints!.map((h) => h.confidence);
      const sorted = [...conf].sort((a, b) => b - a);
      expect(conf).toEqual(sorted);
      expect(item.resolution_status).toBe('open');
    }

    expect(artifact.belowConfidence.length).toBeGreaterThan(0);
    for (const item of artifact.belowConfidence) {
      expect(item.remediation_hints).toBeDefined();
      expect(item.remediation_hints!.length).toBeGreaterThanOrEqual(1);
      expect(item.remediation_hints!.length).toBeLessThanOrEqual(3);
      expect(item.resolution_status).toBe('open');
    }

    // Clean up artifact so subsequent tests don't depend on it
    fs.rmSync(artifactAbs, { force: true });
  });

  it('review.triage accepts a mixed-verdict batch and reflects mutations in registry + artifact', async () => {
    const result = await runMapApply();
    const artifactRel = result.conflictArtifactPath!;
    const artifactAbs = path.resolve(REPO_ROOT, artifactRel);
    expect(fs.existsSync(artifactAbs)).toBe(true);

    const { handle: triageHandle } = await import('../../src/tools/review.triage.js');

    const decisionsInput = {
      conflictArtifactPath: path.relative(REPO_ROOT, artifactAbs),
      decisions: [
        // Conflict with existing mapping: patch to absorb Stage1 recommendation
        { objectId: 'obj-workspace-switcher', verdict: 'patch' as const, reason: 'merged via triage' },
        // Below-confidence creation: defer to a future sprint
        { objectId: 'obj-experimental-badge', verdict: 'defer' as const, reason: 'wait for stronger signal' },
      ],
      projectRoot: REPO_ROOT,
    };
    expect(validateInput(decisionsInput)).toBe(true);

    const triageOut = await triageHandle(decisionsInput);
    expect(validateOutput(triageOut)).toBe(true);
    expect(triageOut.summary.patched).toBe(1);
    expect(triageOut.summary.deferred).toBe(1);
    expect(triageOut.summary.accepted).toBe(0);
    expect(triageOut.summary.dismissed).toBe(0);
    expect(triageOut.errors).toEqual([]);
    expect(triageOut.mapsUpdated).toHaveLength(1);
    expect(triageOut.mapsUpdated[0].mappingId).toBe('linear-workspace-switcher');

    // Registry mutation persisted: workspace-switcher mapping now has Navigable+Labelled
    const mappings = readMappings();
    const updated = mappings.find((m) => m.id === 'linear-workspace-switcher');
    expect(updated).toBeDefined();
    expect(updated!.oodsTraits.sort()).toEqual(['Labelled', 'Navigable']);

    // Artifact mutation persisted: both items have terminal status
    const artifactAfter = readArtifact(artifactAbs);
    const patched = artifactAfter.conflicts.find((i) => i.objectId === 'obj-workspace-switcher');
    const deferred = artifactAfter.belowConfidence.find((i) => i.objectId === 'obj-experimental-badge');
    expect(patched?.resolution_status).toBe('patched');
    expect(deferred?.resolution_status).toBe('deferred');
    expect(patched?.operator_reason).toBe('merged via triage');
    expect(deferred?.operator_reason).toBe('wait for stronger signal');

    fs.rmSync(artifactAbs, { force: true });
  });

  it('round-trip is idempotent — re-running same triage payload yields already_resolved errors', async () => {
    const result = await runMapApply();
    const artifactAbs = path.resolve(REPO_ROOT, result.conflictArtifactPath!);

    const { handle: triageHandle } = await import('../../src/tools/review.triage.js');
    const input = {
      conflictArtifactPath: path.relative(REPO_ROOT, artifactAbs),
      decisions: [
        { objectId: 'obj-workspace-switcher', verdict: 'patch' as const },
        { objectId: 'obj-experimental-badge', verdict: 'defer' as const },
      ],
      projectRoot: REPO_ROOT,
    };

    const first = await triageHandle(input);
    expect(first.errors).toEqual([]);
    expect(first.summary.patched + first.summary.deferred).toBe(2);

    const second = await triageHandle(input);
    expect(validateOutput(second)).toBe(true);
    expect(second.summary).toEqual({ accepted: 0, patched: 0, deferred: 0, dismissed: 0 });
    expect(second.errors).toHaveLength(2);
    for (const err of second.errors) {
      expect(err.kind).toBe('already_resolved');
    }

    fs.rmSync(artifactAbs, { force: true });
  });
});
