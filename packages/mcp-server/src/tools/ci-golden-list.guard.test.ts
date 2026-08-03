import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';

// CI golden-list scope guard (sprint-123, rider #461). Colocated golden tests under
// packages/mcp-server/src/tools/ run in CI ONLY via the by-name vitest list in
// .github/workflows/ci.yml (the root vitest projects exclude src/tools/**), so a NEW colocated
// golden that is not appended to that list SILENTLY never runs. This trap has dropped a colocated
// test from CI twice (decision #781). This guard converts the manual 'remember to append'
// convention into an enforced gate: it enumerates the on-disk viz.render.*/dashboard.render.*
// goldens and asserts each is named in the ci.yml run string.
//
// SCOPE: the viz.render.*/dashboard.render.*/repl.render.* subset. The other colocated tools tests
// (coercion, entity-resolver, map.group, review.*, schema*, structuredData.fetch.rollup,
// fidelity.preview, this guard, ...) are LEGITIMATELY absent from the list — an 'all *.test.ts'
// guard would falsely red.
//
// s169 m04 WIDENED THIS TO repl.render.*, after walking straight into the blind spot it left.
// `repl.render.skin-mapping.test.ts` was in the ci.yml list but OUTSIDE the guard's regex, so the
// convention it enforces did not actually cover the repl render goldens — and the new
// `repl.render.brand.test.ts` would have been dropped from CI with every local run green. Both
// repl.render goldens are named in the list already, so widening goes green immediately; its value
// is entirely in the NEXT one.
//
// SELF-EXCLUSION: this file is named ci-golden-list.guard.test.ts so it is OUT of its own scan
// regex (no self-reference paradox). It IS itself appended to the ci.yml list by name, because an
// unrun guard is the exact failure mode it exists to prevent (critic A1).

const here = path.dirname(fileURLToPath(import.meta.url));
// src/tools -> src -> mcp-server -> packages -> repo root.
const CI_YAML_PATH = path.resolve(here, '../../../../.github/workflows/ci.yml');

// WIDENED regex (critic C5/A2): the optional '(\..*)?' segment catches the two BASE goldens
// viz.render.test.ts + dashboard.render.test.ts that the naive /\..*\.test\.ts$/ silently skips.
const SCOPED_GOLDEN = /^(viz\.render|dashboard\.render|repl\.render)(\..*)?\.test\.ts$/;
// The marker that identifies the colocated-goldens run step (fail loud if the command shape moves).
const COLOCATED_RUN_MARKER = 'exec vitest run src/tools/viz.render';

interface CiWorkflow {
  jobs?: Record<string, { steps?: Array<{ name?: string; run?: string }> }>;
}

function colocatedRunString(): string {
  const doc = parseYaml(fs.readFileSync(CI_YAML_PATH, 'utf8')) as CiWorkflow;
  const steps = Object.values(doc.jobs ?? {}).flatMap((job) => job.steps ?? []);
  const step = steps.find((s) => typeof s.run === 'string' && s.run.includes(COLOCATED_RUN_MARKER));
  // Fail LOUD on a null match — never silently pass if the step was renamed/restructured away.
  expect(
    step,
    `Could not find the colocated viz.render/dashboard.render goldens step in ci.yml (marker "${COLOCATED_RUN_MARKER}"). The command shape changed — update this guard.`,
  ).toBeDefined();
  return (step as { run: string }).run;
}

describe('ci.yml colocated golden-list scope guard (rider #461)', () => {
  it('names every on-disk viz.render.*/dashboard.render.* colocated golden in ci.yml', () => {
    const runString = colocatedRunString();

    const scoped = fs
      .readdirSync(here)
      .filter((name) => SCOPED_GOLDEN.test(name))
      .sort();

    // Fail loud if the enumeration found nothing — a zero-match would make this guard vacuously
    // green (wrong dir / broken regex), which is the silent-pass this guard is meant to forbid.
    expect(scoped.length, 'no scoped viz.render/dashboard.render goldens found on disk').toBeGreaterThan(0);

    for (const basename of scoped) {
      expect(
        runString,
        `colocated golden ${basename} is NOT named in the ci.yml colocated-goldens run string — it would silently never run in CI. Append "src/tools/${basename}" to that step.`,
      ).toContain(`src/tools/${basename}`);
    }
  });

  it('includes the two BASE goldens the naive regex would drop (widened-regex proof)', () => {
    const scoped = fs.readdirSync(here).filter((name) => SCOPED_GOLDEN.test(name));
    // These two have NO middle segment; the widened '(\..*)?' is what keeps them in scope.
    expect(scoped).toContain('viz.render.test.ts');
    expect(scoped).toContain('dashboard.render.test.ts');
  });
});
