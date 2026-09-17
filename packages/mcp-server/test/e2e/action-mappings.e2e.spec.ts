/**
 * RETIRED in s204-m03, with its reason, and replaced by a check that says when to bring it back.
 *
 * WHAT IT WAS. A real-data gate over Stage1's `bridge_summary.json` — 12 tests reading
 * `action_mappings` and `actions` from two named runs (linear-app 5e3a5dbf, stripe-com 09145d03) under
 * `Stage1/out/oods-s89-ready/`, asserting that Forge's entity resolver mapped real Stage1
 * targetEntity ids onto OODS objects, that unresolvable ones were retained as `meta.unresolvedEntity`
 * (Path B, Sprint 89), that the post-S40 ORCA role vocabulary was covered by `orca-role-mapper`, and
 * that real action instances merged into per-slot actions.
 *
 * WHY IT IS RETIRED RATHER THAN RE-POINTED. The artifact is gone. Measured in s204-m03, not assumed:
 *
 *   - `bridge_summary.json` exists in NO run under `Stage1/out/` — zero files.
 *   - The string `bridge_summary` appears in NO TypeScript source file in the Stage1 repository.
 *
 * So Stage1 removed the emitter, not just the two runs. Its sibling gate, `stage1-rollups.e2e.spec.ts`,
 * WAS re-pointed in the same mission, because the artifacts it reads — identity_graph,
 * capability_rollup, object_rollup — are still emitted by every run. There is nothing to re-point
 * this one at.
 *
 * WHAT STILL COVERS THE LOGIC. The Forge-side behaviour this exercised has unit coverage that does not
 * depend on Stage1 being on disk: `src/tools/entity-resolver.test.ts`, `src/compose/orca-role-mapper.test.ts`
 * and `test/product-reality/b2-legacy-inputs.s184.spec.ts`. What is genuinely lost is the real-data
 * assurance — that those resolvers hold up against ids a live capture actually produced — and that
 * loss is the honest cost of the artifact disappearing.
 *
 * WHY THIS FILE STILL EXISTS. Deleting it would delete the knowledge of why. The check below fails the
 * day Stage1 emits `bridge_summary.json` again, which is the day this gate should be rebuilt rather
 * than rediscovered. It is the same reasoning as the sibling gate: the original silently skipped for
 * sprints via `it.runIf`, and a skip that means "the data moved" is indistinguishable from one that
 * means "you do not have the data". Neither file skips silently any more.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Walk up rather than counting `..`, because sprints build inside `.worktrees/<sprint>/`. */
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

function findFiles(root: string, name: string, limit = 5): string[] {
  const hits: string[] = [];
  const walk = (dir: string, depth: number): void => {
    if (hits.length >= limit || depth > 6) return;
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (hits.length >= limit) return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.name === name) hits.push(full);
    }
  };
  walk(root, 0);
  return hits;
}

const STAGE1_ROOT = findStage1();

describe('Stage1 action-mappings gate — RETIRED in s204-m03 (bridge_summary.json no longer emitted)', () => {
  it.runIf(STAGE1_ROOT !== null)('confirms the artifact is still absent, and says to restore this gate if it returns', () => {
    const found = findFiles(path.join(STAGE1_ROOT!, 'out'), 'bridge_summary.json');
    expect(
      found,
      'Stage1 is emitting bridge_summary.json again. The retirement reason no longer holds: restore the '
      + 'real-data action-mappings gate from git history (its last full version is in the commit that '
      + 'preceded s204-m03) and re-point it at these runs.',
    ).toEqual([]);
  });

  it('records what the retirement costs, so it is not mistaken for coverage', () => {
    // Not a behavioural assertion — a pointer, kept executable so the names cannot rot silently.
    const covering = [
      'src/tools/entity-resolver.test.ts',
      'src/compose/orca-role-mapper.test.ts',
      'test/product-reality/b2-legacy-inputs.s184.spec.ts',
    ];
    const serverRoot = path.resolve(__dirname, '../..');
    for (const file of covering) {
      expect(fs.existsSync(path.join(serverRoot, file)), `${file} was named as covering the retired gate's logic, and is gone`).toBe(true);
    }
  });
});
