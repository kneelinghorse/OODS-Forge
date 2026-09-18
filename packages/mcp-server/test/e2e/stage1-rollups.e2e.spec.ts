/**
 * Real-data gate for Stage1 rollups, re-pointed in s204-m03.
 *
 * WHAT THIS GATE IS FOR, and why it failed at it. The original (s94-m04) asserted hard-coded counts
 * against two named Stage1 runs — linear-app and stripe-com, Stage1's Sprint 46 live reruns — at
 * `Stage1/out/sprint-46-live-rerun/...`. Its stated purpose was "to catch live drift early". That
 * directory no longer exists, the fixtures resolved to nothing, and `it.runIf` turned the whole file
 * into a silent skip: 16 of the 16 tests skipped in every capture for sprints, and nobody saw it
 * because a skip is not a failure.
 *
 * Meanwhile the exact drift it existed to catch HAPPENED. Stage1 now emits `object_rollup` at
 * schema_version 1.2.0; `structuredData.fetch` accepts 1.0.0 and 1.1.0, so Forge refuses to read it
 * (OODS-N007). Forge advertises four readable Stage1 kinds and can currently read three. A working
 * gate would have said so at the moment it happened.
 *
 * WHAT CHANGED. Two things, and the second matters more than the first.
 *
 * 1. Runs are DISCOVERED rather than named. Any target under `Stage1/out/stage1/<suite>/<run>/
 *    artifacts/targets/<target>/` carrying all three rollups is a fixture. A run that is deleted or
 *    re-captured no longer strands the gate, which is what happened here.
 *
 * 2. A missing fixture FAILS instead of skipping, whenever Stage1 is present. The skip remains for
 *    the one honest case — no adjacent Stage1 checkout, so this is not that machine — and that case
 *    alone. "The data moved" and "you do not have the data" had the same outcome before, and that is
 *    precisely how a gate rots in place.
 *
 * Assertions are about the CONTRACT rather than about one site's node count, because a count copied
 * from a particular capture is what tied the old gate to runs that then disappeared.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { handle as fetchHandle } from '../../src/tools/structuredData.fetch.js';
import { normalizeCapabilities } from '../../src/stage1/capability-normalizer.js';
import type { Stage1CapabilityRollup, Stage1IdentityGraph, Stage1ObjectRollup } from '../../src/tools/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The adjacent Stage1 checkout. Forge reads it from a filesystem path and writes nothing into it.
 *
 * Found by walking UP rather than by a fixed number of `..` segments, because this repo builds every
 * sprint inside `.worktrees/<sprint>/` (AGENTS.md rule 5b) — two levels deeper than the primary
 * checkout, so a hard-coded `../../../../../Stage1` resolves to `.worktrees/Stage1` and finds
 * nothing. That is not a hypothetical: the first version of this file did exactly that and quietly
 * took the "no Stage1 here" branch, which is the same silent-skip failure this rewrite exists to end.
 */
function findStage1(): string | null {
  let dir = __dirname;
  for (let depth = 0; depth < 10; depth += 1) {
    const candidate = path.join(dir, 'Stage1');
    if (fs.existsSync(path.join(candidate, 'out/stage1'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const STAGE1_ROOT = findStage1();
const STAGE1_RUNS = STAGE1_ROOT ? path.join(STAGE1_ROOT, 'out/stage1') : null;

/**
 * What structuredData.fetch declares it accepts. Restated here so a silent widening is visible in the
 * diff — which is how the s204-m03 widening of object_rollup to 1.2.0 had to be made deliberately,
 * in this file, rather than only in the tool.
 */
const ACCEPTED: Record<string, string[]> = {
  identity_graph: ['1.1.0', '1.2.0'],
  capability_rollup: ['1.1.0', '1.2.0'],
  object_rollup: ['1.0.0', '1.1.0', '1.2.0'],
};
const ROLLUP_KINDS = Object.keys(ACCEPTED) as Array<keyof typeof ACCEPTED>;

type Target = { suite: string; run: string; target: string; runPath: string };

function discoverTargets(): Target[] {
  if (!STAGE1_RUNS || !fs.existsSync(STAGE1_RUNS)) return [];
  const found: Target[] = [];
  for (const suite of fs.readdirSync(STAGE1_RUNS)) {
    const suiteDir = path.join(STAGE1_RUNS, suite);
    if (!fs.statSync(suiteDir).isDirectory()) continue;
    for (const run of fs.readdirSync(suiteDir)) {
      const targetsDir = path.join(suiteDir, run, 'artifacts/targets');
      if (!fs.existsSync(targetsDir)) continue;
      for (const target of fs.readdirSync(targetsDir)) {
        const runPath = path.join(targetsDir, target);
        if (ROLLUP_KINDS.every(kind => fs.existsSync(path.join(runPath, `${kind}.json`)))) {
          found.push({ suite, run, target, runPath });
        }
      }
    }
  }
  return found.sort((a, b) => a.runPath.localeCompare(b.runPath));
}

const stage1Present = STAGE1_ROOT !== null;
const targets = discoverTargets();
const schemaVersionOf = (runPath: string, kind: string): string | null => {
  try {
    const payload = JSON.parse(fs.readFileSync(path.join(runPath, `${kind}.json`), 'utf8')) as { schema_version?: unknown };
    return typeof payload.schema_version === 'string' ? payload.schema_version : null;
  } catch { return null; }
};

describe('Stage1 rollups real-data gate (discovered runs, s204-m03)', () => {
  it('finds real Stage1 runs to gate against, or says which of the two reasons applies', () => {
    if (!stage1Present) {
      // The one honest skip: no adjacent Stage1 checkout. Not a rotted fixture.
      expect(targets).toEqual([]);
      return;
    }
    expect(STAGE1_RUNS).toBeTruthy();
    // Stage1 IS here. Having no usable run is now a failure, because that is the state this gate sat
    // in — silently — while the drift it existed to catch went by.
    expect(targets.length, `Stage1 is checked out at ${STAGE1_ROOT} but no run under out/stage1 carries all of ${ROLLUP_KINDS.join(', ')}`).toBeGreaterThan(0);
  });

  it.runIf(stage1Present && targets.length > 0)('reads every rollup Forge accepts, and refuses the rest with a typed, explained error', async () => {
    const readable: string[] = [];
    const refused: Array<{ target: string; kind: string; schemaVersion: string | null; code: string }> = [];
    for (const target of targets) {
      for (const kind of ROLLUP_KINDS) {
        const schemaVersion = schemaVersionOf(target.runPath, kind);
        try {
          const result = await fetchHandle({ kind: kind as 'identity_graph', runPath: target.runPath });
          expect(result.kind).toBe(kind);
          expect(result.schemaValidated).toBe(true);
          expect(result.payload).toBeDefined();
          // A file Forge read must have carried a version Forge declares. If this ever fails, the
          // allow-list and the validator disagree, which is worse than a refusal.
          expect(ACCEPTED[kind], `${target.target}/${kind} parsed at ${schemaVersion}`).toContain(schemaVersion);
          readable.push(`${target.target}/${kind}`);
        } catch (error) {
          // ToolError exposes its code as `opiCode`; `code` is undefined on it.
          const typed = error as { opiCode?: string; message?: string };
          // A refusal is acceptable ONLY in the typed, explained form. A crash is not.
          expect(typed.opiCode, `${target.target}/${kind}: ${typed.message}`).toBe('OODS-N007');
          expect(typed.message).toContain('schema_version');
          expect(ACCEPTED[kind]).not.toContain(schemaVersion);
          refused.push({ target: target.target, kind, schemaVersion, code: typed.opiCode! });
        }
      }
    }
    expect(readable.length, 'no rollup on disk is readable at all').toBeGreaterThan(0);
    // Every refusal names a version outside the allow-list; nothing is refused for a reason Forge
    // cannot explain to a caller.
    for (const entry of refused) expect(ACCEPTED[entry.kind]).not.toContain(entry.schemaVersion);
  }, 120_000);

  /**
   * The drift the silent skip hid — now CLOSED, and asserted from the other side.
   *
   * This previously asserted that every object_rollup on disk was OUTSIDE the accepted contract, as
   * a pin that would fail the day someone widened the allow-list. s204-m03 widened it, on measured
   * evidence: every object_rollup on disk is 1.2.0 (there is no 1.1.0 anywhere), and a real 1.2.0
   * payload byte-identical except for its version string already parsed under the same validator
   * with all 84 objects intact. The list was the only thing refusing it.
   *
   * So the assertion inverts rather than disappears: object_rollup must now be READABLE, and the
   * `requires_human_adjudication` flag that 1.2.0 adds must survive the read, because that flag is
   * the reason the widening was safe to make.
   */
  it.runIf(stage1Present && targets.length > 0)('reads object_rollup at the version Stage1 actually emits, flag intact (s204-m03)', async () => {
    const versions = [...new Set(targets.map(target => schemaVersionOf(target.runPath, 'object_rollup')).filter(Boolean))];
    expect(versions.length, 'every discovered run should carry an object_rollup version').toBeGreaterThan(0);
    for (const version of versions) expect(ACCEPTED.object_rollup, `object_rollup ${version} is on disk but not accepted`).toContain(version);

    let read = 0;
    let flagged = 0;
    for (const target of targets) {
      const result = await fetchHandle({ kind: 'object_rollup', runPath: target.runPath });
      expect(result.schemaValidated).toBe(true);
      const payload = result.payload as Stage1ObjectRollup;
      expect(Array.isArray(payload.objects)).toBe(true);
      read += 1;
      // Optional by design (absent on 1.0.0/1.1.0), but where Stage1 sets it, Forge must see it.
      if (payload.requires_human_adjudication !== undefined) {
        expect(typeof payload.requires_human_adjudication).toBe('boolean');
        flagged += 1;
      }
    }
    expect(read, 'no object_rollup was readable').toBeGreaterThan(0);
    expect(flagged, 'Stage1 emits requires_human_adjudication at 1.2.0; none survived the read').toBeGreaterThan(0);
  }, 120_000);

  it.runIf(stage1Present && targets.length > 0)('returns byte-identical payloads for repeated reads of the same artifact', async () => {
    const target = targets[0]!;
    for (const kind of ROLLUP_KINDS) {
      let first: unknown;
      try { first = await fetchHandle({ kind: kind as 'identity_graph', runPath: target.runPath }); } catch { continue; }
      const second = await fetchHandle({ kind: kind as 'identity_graph', runPath: target.runPath });
      expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    }
  }, 60_000);

  it.runIf(stage1Present && targets.length > 0)('drives the capability normalizer through the tool contract, and shows what the object_rollup refusal costs', async () => {
    /**
     * `normalizeCapabilities` takes { capabilityRollup, objectRollup?, identityGraph? } and builds its
     * evidence index from objectRollup. Until s204-m03 that input could not be supplied THROUGH THE
     * TOOL CONTRACT at all, because Forge refused object_rollup at 1.2.0, so the normalizer ran with
     * an empty evidence index and capability evidence never reached Forge. Widening the allow-list
     * closed that: every input now arrives through structuredData.fetch, which is what this asserts.
     */
    let normalizedAny = false;
    let objectRollupAvailable = false;
    for (const target of targets) {
      let capabilityRollup: Stage1CapabilityRollup;
      try { capabilityRollup = (await fetchHandle({ kind: 'capability_rollup', runPath: target.runPath })).payload as Stage1CapabilityRollup; } catch { continue; }
      let identityGraph: Stage1IdentityGraph | undefined;
      try { identityGraph = (await fetchHandle({ kind: 'identity_graph', runPath: target.runPath })).payload as Stage1IdentityGraph; } catch { identityGraph = undefined; }
      let objectRollup: Stage1ObjectRollup | undefined;
      try { objectRollup = (await fetchHandle({ kind: 'object_rollup', runPath: target.runPath })).payload as Stage1ObjectRollup; objectRollupAvailable = true; } catch { objectRollup = undefined; }

      const normalized = normalizeCapabilities({ capabilityRollup, ...(objectRollup ? { objectRollup } : {}), ...(identityGraph ? { identityGraph } : {}) });
      expect(Array.isArray(normalized)).toBe(true);
      expect(normalized.length).toBe((capabilityRollup.capabilities ?? []).length);
      for (const capability of normalized) {
        // The s94-m02 unwrap: confidence arrives either as a number or wrapped in a
        // ConfidenceDecomposition, and every caller downstream must see one shape.
        if (capability.confidence !== undefined) expect(typeof capability.confidence).toBe('number');
      }
      normalizedAny = true;
    }
    expect(normalizedAny, 'no capability_rollup was readable to normalize').toBe(true);
    // The whole point of the widening: evidence reaches the normalizer through the tool contract.
    expect(objectRollupAvailable, 'object_rollup is no longer readable — the s204-m03 widening regressed').toBe(true);
  }, 120_000);

  it.runIf(stage1Present && targets.length > 0)('reads identity graphs whose nodes carry the fields the composer relies on', async () => {
    let checked = 0;
    for (const target of targets) {
      let graph: Stage1IdentityGraph;
      try { graph = (await fetchHandle({ kind: 'identity_graph', runPath: target.runPath })).payload as Stage1IdentityGraph; } catch { continue; }
      expect(Array.isArray(graph.nodes)).toBe(true);
      // Stage1 identity nodes are keyed by `canonical_id`, not `id` — measured against the real artifact.
      for (const node of graph.nodes ?? []) expect(typeof (node as { canonical_id?: unknown }).canonical_id).toBe('string');
      checked += 1;
    }
    expect(checked, 'no identity_graph was readable').toBeGreaterThan(0);
  }, 120_000);

  it('refuses a directory that is not a Stage1 run, without reading anything else', async () => {
    // The closure this slice depends on: a bad path is a typed refusal, never a crawl.
    await expect(fetchHandle({ kind: 'identity_graph', runPath: path.join(__dirname, 'does-not-exist-s204-m03') }))
      .rejects.toMatchObject({ opiCode: expect.stringMatching(/^OODS-/) });
  });
});

/** Exported for the m03 receipt, so the README's count of gated targets comes from the gate itself. */
export const gatedTargets = targets.map(target => `${target.suite}/${target.run.slice(0, 8)}/${target.target}`);
