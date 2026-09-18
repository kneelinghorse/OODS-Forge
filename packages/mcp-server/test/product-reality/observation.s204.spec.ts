import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolError } from '../../src/errors/tool-error.js';
import { getDefinition } from '../../src/errors/registry.js';
import { computeObservation, runObservation, screenOf, type ObservationRecord } from '../../src/lib/observation.js';

/**
 * Sprint 204 m04: what Stage1 observed on TraceLab's live frontend, set beside what Forge composes from
 * the same objects, as a typed record a person reviews.
 *
 * What these tests hold, and why each matters:
 *  - the four categories are typed separately and a disagreement names its axis, because an
 *    undifferentiated drift count tells a reviewer nothing about what to look at;
 *  - every row says where BOTH sides came from, including what was searched when a side is empty,
 *    because an absence that cannot say where it looked could mean "nothing" or "not asked";
 *  - the record is evidence and carries no instruction, because near.md §8 rules out autonomous
 *    reconciliation and Stage1 marks its own mappings as needing a person;
 *  - every refusal writes nothing at all, because a half-written comparison is worse than none;
 *  - computing a comparison records no composition and opens no other product's store.
 */
const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const RUN_ID = 'd0a43821-5730-4bf3-8b40-20f6fcb6b69c';
const RETAINED = path.join(root, 'artifacts/product-reality/sprint-204/m04/observation.json');

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
const REAL_RUN = STAGE1 ? path.join(STAGE1, 'out/stage1/tracelab-production-infer', RUN_ID) : null;

const SYNTHETIC_ID = '11111111-2222-4333-8444-555555555555';
const MISSION = '/missions/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const ROUTES = ['/', '/admin/users', '/missions', MISSION, '/missions/new', '/reports'];

/** A minimal Stage1 run: the manifest and the two rollups the comparison reads, nothing else. */
function syntheticRun(dir: string, overrides: { rollupVersion?: string; rollupRunId?: string } = {}): string {
  const run = path.join(dir, SYNTHETIC_ID);
  fs.mkdirSync(path.join(run, 'artifacts'), { recursive: true });
  const target = { id: SYNTHETIC_ID, url: 'https://app.example.test/' };
  fs.writeFileSync(path.join(run, 'manifest.json'), JSON.stringify({ run_id: SYNTHETIC_ID, mode: 'app', targets: [{ name: 'synthetic', url: target.url }], passes: [] }));
  fs.writeFileSync(path.join(run, 'artifacts/identity_graph.json'), JSON.stringify({
    kind: 'identity_graph', schema_version: '1.2.0', run_id: SYNTHETIC_ID, target,
    nodes: [{ canonical_id: 'canonical:entity:mission', canonical_label: 'Mission', identity_class: 'entity', member_candidates: [{ attributes: { source_endpoints: ['/missions', MISSION, '/missions/new'] } }] }],
  }));
  const variant = (routes: string[]) => [{ id: 'v', surface: 'desktop', metadata: { routes } }];
  fs.writeFileSync(path.join(run, 'artifacts/object_rollup.json'), JSON.stringify({
    kind: 'object_rollup', schema_version: overrides.rollupVersion ?? '1.2.0', run_id: overrides.rollupRunId ?? SYNTHETIC_ID, target,
    requires_human_adjudication: true,
    objects: [
      // On every route: chrome. It carries input and data-bound, and must be attributed to no screen.
      { canonical_id: 'canonical:object:shell', canonical_label: 'Shell', oods_traits: ['input', 'data-bound'], projection_variants: variant(ROUTES), reconciliation: { action: 'create', gated: true } },
      { canonical_id: 'canonical:object:list', canonical_label: 'List', oods_traits: ['data-bound'], projection_variants: variant(['/missions']), reconciliation: { action: 'create', gated: true } },
      { canonical_id: 'canonical:object:form', canonical_label: 'Form', oods_traits: ['input'], projection_variants: variant(['/missions/new', '/reports']), reconciliation: { action: 'create', gated: true } },
    ],
  }));
  return run;
}

const INSTRUCTION_KEY = /^(action|actions|apply|applied|proposal|proposals|propose|patch|write|writes|fix|recommend|recommendation|reconcile|reconciliation|suggest|suggestion|todo)$/i;
function instructionKeys(value: unknown, at = '$'): string[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => instructionKeys(item, `${at}[${index}]`));
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [...(INSTRUCTION_KEY.test(key) ? [`${at}.${key}`] : []), ...instructionKeys(child, `${at}.${key}`)]);
}

let scratch: string;
let storeRoot: string;
beforeEach(() => {
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-observation-'));
  storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-observation-store-'));
  vi.stubEnv('MCP_SCHEMA_STORE_ROOT', storeRoot);
  vi.stubEnv('MCP_SCHEMA_STORE_DIR', 'schemas');
});
afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(scratch, { recursive: true, force: true });
  fs.rmSync(storeRoot, { recursive: true, force: true });
});

async function refusal(promise: Promise<unknown>): Promise<ToolError> {
  const error = await promise.then(() => undefined, (caught: unknown) => caught);
  expect(error).toBeInstanceOf(ToolError);
  return error as ToolError;
}

describe('observation against intent (s204-m04)', () => {
  it('reads a route as the screen it is an instance of', () => {
    expect(screenOf('/missions')).toMatchObject({ key: '/missions', shape: 'list' });
    expect(screenOf(MISSION)).toMatchObject({ key: '/missions/:id', shape: 'detail' });
    expect(screenOf('/missions/new')).toMatchObject({ key: '/missions/new', shape: 'form' });
    expect(screenOf('/admin/users').shape).toBe('other');
    expect(screenOf('/').shape).toBe('other');
  });

  it('types the four categories separately, names the axis of every disagreement, and attributes chrome to no screen', async () => {
    const record = await computeObservation({ runPath: syntheticRun(scratch), objects: ['Mission', 'Report'] });
    const byId = new Map(record.rows.map(row => [row.id, row]));

    expect(record.scale.byCategory['observed-only']).toBeGreaterThan(0);
    expect(record.scale.byCategory['composed-only']).toBeGreaterThan(0);
    expect(record.scale.byCategory.agreeing).toBeGreaterThan(0);
    expect(record.scale.byCategory.disagreeing).toBeGreaterThan(0);
    for (const row of record.rows.filter(r => r.category === 'disagreeing')) expect(['entity', 'input', 'data-bound']).toContain(row.axis);
    for (const row of record.rows.filter(r => r.category === 'observed-only' || r.category === 'composed-only')) expect(row.axis).toBe('screen');

    // The admin screen and the home screen have no compared object.
    expect(byId.get('observed-only:screen:/admin/users')?.forge).toMatchObject({ object: null, found: 0 });
    // Stage1 named Mission; it saw /reports but named no Report entity.
    expect(byId.get('agreeing:entity:Mission:list')).toBeDefined();
    expect(byId.get('disagreeing:entity:Report:list')).toBeDefined();
    // Chrome carries input on every route. Were it attributed, Mission's list would "agree" on input.
    expect(byId.get('disagreeing:input:Mission:list')?.observed).toMatch(/no input-bearing component/);
    expect(byId.get('agreeing:input:Report:list')?.stage1.pointers).toEqual(['/objects/2']);
    expect(byId.get('agreeing:data-bound:Mission:list')?.stage1.pointers).toEqual(['/objects/1']);
    // A timeline has no route shape, so it is always composed-only.
    expect(byId.get('composed-only:screen:Mission:timeline')?.stage1.found).toBe(0);
  });

  it('gives every row both provenances, and an empty side says what it searched', async () => {
    const record = await computeObservation({ runPath: syntheticRun(scratch), objects: ['Mission', 'Report'] });
    expect(record.scale.withheldForProvenance).toBe(0);
    for (const row of record.rows) {
      expect(row.stage1).toMatchObject({ runId: SYNTHETIC_ID, target: 'https://app.example.test/' });
      expect(['identity_graph', 'object_rollup']).toContain(row.stage1.artifactKind);
      expect(row.stage1.readPath).toMatch(/artifacts\/(identity_graph|object_rollup)\.json$/);
      expect(row.forge.searched.length).toBeGreaterThan(0);
      if (row.category !== 'observed-only') {
        expect(row.forge.urn).toMatch(/^urn:oods:object:(Mission|Report)@/);
        expect(row.forge.context).toBeTruthy();
        expect(row.forge.schemaDigest).toMatch(/^[0-9a-f]{64}$/);
      }
    }
  });

  it('is evidence, not an instruction: no row carries an action, a proposal or a write, and Stage1\'s own "create" is not copied', async () => {
    const record = await computeObservation({ runPath: syntheticRun(scratch), objects: ['Mission', 'Report'] });
    expect(record.nature).toBe('evidence-for-review');
    expect(record.requiresHumanAdjudication).toBe(true);
    expect(instructionKeys(record)).toEqual([]);
    expect(JSON.stringify(record.rows)).not.toContain('"create"');
  });

  it('records no composition while composing the Forge side', async () => {
    await computeObservation({ runPath: syntheticRun(scratch), objects: ['Mission', 'Report'] });
    expect(fs.readdirSync(storeRoot)).toEqual([]);
  });

  describe('refusals are typed, registered, and write nothing at all', () => {
    const out = () => path.join(scratch, 'out/observation.json');

    it('OODS-V208 for a directory that is not a Stage1 run, and for artifacts from another run', async () => {
      const empty = path.join(scratch, 'not-a-run');
      fs.mkdirSync(empty);
      expect((await refusal(runObservation({ runPath: empty }, out()))).opiCode).toBe('OODS-V208');
      expect((await refusal(runObservation({ runPath: path.join(scratch, 'absent') }, out()))).opiCode).toBe('OODS-V208');
      const mixed = syntheticRun(scratch, { rollupRunId: '99999999-2222-4333-8444-555555555555' });
      expect((await refusal(runObservation({ runPath: mixed, objects: ['Mission'] }, out()))).opiCode).toBe('OODS-V208');
      expect(fs.existsSync(path.dirname(out()))).toBe(false);
    });

    it('OODS-V209 for an artifact whose schema_version is outside the accepted set', async () => {
      const run = syntheticRun(scratch, { rollupVersion: '9.0.0' });
      const error = await refusal(runObservation({ runPath: run, objects: ['Mission'] }, out()));
      expect(error.opiCode).toBe('OODS-V209');
      expect(error.details).toMatchObject({ kind: 'object_rollup', schemaVersion: '9.0.0' });
      expect(fs.existsSync(path.dirname(out()))).toBe(false);
    });

    it('OODS-V210 for an object the registry does not hold', async () => {
      const error = await refusal(runObservation({ runPath: syntheticRun(scratch), objects: ['Mission', 'Nonexistent'] }, out()));
      expect(error.opiCode).toBe('OODS-V210');
      expect(error.details).toMatchObject({ unknown: ['Nonexistent'] });
      expect(fs.existsSync(path.dirname(out()))).toBe(false);
    });

    it('never writes into the run it read', async () => {
      const run = syntheticRun(scratch);
      const before = fs.readdirSync(run, { recursive: true }).sort();
      expect((await refusal(runObservation({ runPath: run, objects: ['Mission'] }, path.join(run, 'artifacts/observation.json')))).opiCode).toBe('OODS-V208');
      expect(fs.readdirSync(run, { recursive: true }).sort()).toEqual(before);
    });

    it('registers each code, so the tool surface reports a refusal rather than a server error', () => {
      for (const code of ['OODS-V208', 'OODS-V209', 'OODS-V210']) expect(getDefinition(code)).toMatchObject({ code, category: 'validation' });
    });
  });

  it('the closure, extended: the comparison reaches Stage1 only through structuredData.fetch and opens nothing else', () => {
    const files = [
      path.join(root, 'packages/mcp-server/src/lib/observation.ts'),
      path.join(root, 'scripts/product-reality/s204-m04-observation.ts'),
    ];
    const code = (source: string): string => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    // The Sprint 203 closure pattern, plus anything that reaches over a network or spawns a process.
    const forbidden = /require\(['"](?:better-)?sqlite3|from ['"](?:better-)?sqlite3|cmos\.sqlite|hive_overview|tracelab_search|aquex|from ['"]node:(?:http|https|net|child_process)['"]|\bfetch\(|XMLHttpRequest|WebSocket/;
    for (const file of files) expect(forbidden.test(code(fs.readFileSync(file, 'utf8'))), path.relative(root, file)).toBe(false);
    // The one file read the comparison makes directly is the run's manifest; every artifact goes through the contract.
    const source = code(fs.readFileSync(files[0], 'utf8'));
    expect(source.match(/readFileSync\(([^)]*)\)/g)).toEqual(["readFileSync(manifestPath, 'utf8')"]);
    expect(source).toContain("from '../tools/structuredData.fetch.js'");
  });

  describe('the real capture (TraceLab production, run d0a43821)', () => {
    it('finds the run whenever Stage1 is checked out here', () => {
      if (!STAGE1) return; // the one honest skip: not the machine the capture lives on
      expect(fs.existsSync(REAL_RUN!), `Stage1 is at ${STAGE1} but run ${RUN_ID} is gone`).toBe(true);
    });

    it.runIf(Boolean(REAL_RUN && fs.existsSync(REAL_RUN)))('recomputes exactly the retained record, at the scale it states', async () => {
      const retained = JSON.parse(fs.readFileSync(RETAINED, 'utf8')) as ObservationRecord;
      const record = await computeObservation({ runPath: REAL_RUN! });
      expect(record.rows).toEqual(retained.rows);
      expect({ ...record.scale, wallMs: 0 }).toEqual({ ...retained.scale, wallMs: 0 });
      expect(record.scale).toMatchObject({ targets: 1, observedRoutes: 25, observedScreens: 15, composedScreens: 28, pairedScreens: 10, rows: 49 });
      expect(record.stage1.reads.map(read => `${read.kind}@${read.schemaVersion}`)).toEqual(['identity_graph@1.2.0', 'object_rollup@1.2.0']);
    });
  });

  it('the retained record holds every rule on its own, wherever it is read', () => {
    const retained = JSON.parse(fs.readFileSync(RETAINED, 'utf8')) as ObservationRecord;
    expect(retained.stage1.runId).toBe(RUN_ID);
    expect(retained.nature).toBe('evidence-for-review');
    expect(instructionKeys(retained)).toEqual([]);
    expect(retained.scale.rows).toBe(retained.rows.length);
    for (const category of ['observed-only', 'composed-only', 'agreeing', 'disagreeing'] as const) {
      expect(retained.rows.filter(row => row.category === category).length).toBe(retained.scale.byCategory[category]);
    }
    for (const row of retained.rows) {
      expect(row.stage1.runId).toBe(RUN_ID);
      expect(row.stage1.readPath).toBeTruthy();
      expect(row.forge.searched).toBeTruthy();
    }
  });
});
