// THE SPLIT BYTE-COMPAT CONTROL. (s172 §1g; rebased e5bf2f6 in s173 m01, 4f64bcf
// in s176 m01, 86d50ed in s177 m02, and 1be93f8 in s179 m01.)
//
// s172 added an OPTIONAL `data` operand to artifact.certify. Every caller who does NOT
// send it must be unaffected — but s172 ALSO deliberately added operand-absent notes to
// the ECharts path, so a single "bytes are identical" control would have been one the
// sprint must violate. (That contradiction is exactly what the pre-lock critic rejected
// v1 of the s172 memo for, and it is the record-integrity failure mode that closed s170
// NOT_GENUINE.) So the control is SPLIT, and as of s177 (memo §1b, following s176
// §1a D8 and the s140 [B] signalled-change precedent) BOTH halves carry the same invariant:
//
//   (i)  CARTESIAN {spec}-only responses move ONLY where a mission said, in writing,
//        they would — the declared set below; byte-identical wherever nothing is
//        declared. s176 m01/m02 declared cartesian movement for the render-backed contrast
//        caveat and determinism.renderHash; the s177 rebase makes those bytes the baseline
//        and restores the empty declared set below.
//   (ii) ECHARTS-PRIMARY {spec}-only responses move in `notes[]` and `contrastNote` ONLY,
//        and the movement is exactly the enumerated set below — every other key, including
//        the closed enums, `conformant`, `pillars` and the absence of `determinism`/
//        `accuracySummary`, is byte-identical. s179 declares ZERO ECharts movement.
//
// s179 REBASE (m01, sequenced FIRST, before any product edit): the baseline fixture was
// RECAPTURED at pristine `1be93f8e16fee2607682361bbd56e521fda3bcdb` — s178's final
// commit and s179's starting tree — in a detached worktree whose full HEAD was verified
// before the probe. Its SHA-256 is
// `da68a40aa71c99a7b2d67b3e3bca9a206297da1b5108c532788f231ff65364a3`, byte-identical
// to the retired 86d50ed fixture as expected: s177 and s178 declared no movement on this
// path. All five declaration slots below remain empty/null for the whole sprint.
//
// The invariant the sprints share: each half moves only where a mission said, in
// writing, that it would.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildVizSpecFromRows } from '@oods/viz-core';
import { handle } from '../../src/tools/artifact.certify.js';
import { CARTESIAN_MARK_TRAITS, ECHARTS_MARK_TRAITS, SPEC_ONLY_CASES } from './s172-spec-only-cases.js';

const BASELINE_COMMIT = '1be93f8';

const baseline = JSON.parse(
  readFileSync(new URL('./__fixtures__/s172-certify-spec-only-baseline.json', import.meta.url), 'utf8'),
) as Record<string, Record<string, unknown>>;

const cases = SPEC_ONLY_CASES(buildVizSpecFromRows);

/**
 * The ENUMERATED notes[] ADDITIONS on the ECharts {spec}-only path. Each entry is a
 * substring that must appear in exactly one ADDED note, and the added notes must be
 * exactly this many.
 *
 * s179 adds NO ECharts notes. The
 * empty array is the assertion: any new note on the {spec}-only path fails this control.
 */
const DECLARED_NOTE_ADDITIONS: readonly string[] = [];

/**
 * Notes present in the baseline whose TEXT is deliberately rewritten (same slot, same
 * count). Keyed by a stable substring of the baseline note; the value is a substring the
 * replacement must contain.
 *
 * s179 declares NO ECharts note rewords. The s174/s175 entries (both keyed on the
 * e5bf2f6 baseline's "determinism and accuracy ARE checked" fragment) are RETIRED by the
 * 4f64bcf rebase — their movement is now the baseline itself. Retirement here was NOT
 * suite-forced (both entries pass vacuously against the fresh baseline: the old key
 * matches nothing and both replacement fragments live in the baseline's own note); it is
 * done by hand per the header doctrine.
 */
const DECLARED_NOTE_REWORDS: ReadonlyArray<{ baselineContains: string; nowContains: string }> = [];

/**
 * THE MOVEMENT THAT IS NOT IN notes[].
 *
 * ECHARTS_GEO_EXEMPT_NOTE is emitted as `contrastNote`, not as a note, so notes[]
 * assertions cannot bound it. s179 declares NO contrastNote movement on ANY ECharts
 * trait: the s173 5(c) geo reword is baseline now (its assertion is retired — unlike the
 * note rewords, the recapture FORCED this one: the old baselineContains key is absent
 * from a 4f64bcf capture), and the m01 caveat fork (memo §1a D11) freezes the ECharts
 * caveat constants byte-for-byte for the no-operand/spec-only lifetime. Render-backed
 * wording is path-scoped to operand-backed calls, outside this control by construction.
 */
const DECLARED_ECHARTS_CONTRAST_NOTE_REWORD: {
  geoTraits: ReadonlySet<string>;
  baselineContains: string;
  nowContains: string;
  retains: readonly string[];
} | null = null;

/**
 * THE CARTESIAN DECLARED SET (introduced in s176, per the clause-(i) rewrite above).
 *
 * null = nothing declared = the cartesian half is byte-identical, full-object. A mission
 * that moves cartesian {spec}-only bytes must declare it HERE, in the same edit as the
 * source change — never after the fact. The s179 rebase retains the post-s176 baseline,
 * so s179 starts with no cartesian contrastNote movement.
 */
const DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD: {
  baselineContains: string;
  nowContains: string;
} | null = null;

/**
 * The s179 rebase retains s176 m02's OPTIONAL cartesian renderHash additions in the
 * baseline. Empty array =
 * nothing declared = the full determinism object is byte-identical.
 */
const DECLARED_CARTESIAN_DETERMINISM_ADDITIONS: readonly string[] = [];

describe(`artifact.certify — {spec}-only byte compatibility, cartesian half (baseline ${BASELINE_COMMIT})`, () => {
  it.each(CARTESIAN_MARK_TRAITS)(
    `%s: the {spec}-only response moves only by the declared set vs pristine HEAD ${BASELINE_COMMIT}`,
    async (trait) => {
      const out = (await handle({ spec: cases[trait] })) as Record<string, unknown>;
      if (
        DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD === null &&
        DECLARED_CARTESIAN_DETERMINISM_ADDITIONS.length === 0
      ) {
        // Nothing declared: the old absolute clause (i) — byte-identical, full-object.
        expect(JSON.stringify(out)).toBe(JSON.stringify(baseline[trait]));
        return;
      }
      // Declared movement only: everything EXCEPT contrastNote and determinism is
      // byte-identical; each declared mover is then bounded exactly.
      const { contrastNote: outContrast, determinism: outDet, ...outRest } = out as {
        contrastNote?: string;
        determinism?: Record<string, unknown>;
      } & Record<string, unknown>;
      const { contrastNote: baseContrast, determinism: baseDet, ...baseRest } = baseline[trait] as {
        contrastNote?: string;
        determinism?: Record<string, unknown>;
      } & Record<string, unknown>;
      expect(JSON.stringify(outRest)).toBe(JSON.stringify(baseRest));

      // A declared caveat reword: old fragment gone, new fragment present.
      if (DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD === null) {
        expect(outContrast).toBe(baseContrast);
      } else {
        expect(baseContrast).toContain(DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD.baselineContains);
        expect(outContrast).toContain(DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD.nowContains);
        expect(outContrast).not.toContain(DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD.baselineContains);
      }

      // Declared determinism additions: baseline keys byte-identical (contentHash unmoved —
      // the render never feeds it; stable unmoved), plus EXACTLY the declared new keys.
      expect(Object.keys(outDet ?? {}).sort()).toEqual(
        [...Object.keys(baseDet ?? {}), ...DECLARED_CARTESIAN_DETERMINISM_ADDITIONS].sort(),
      );
      for (const key of Object.keys(baseDet ?? {})) {
        expect(JSON.stringify(outDet?.[key])).toBe(JSON.stringify(baseDet?.[key]));
      }
      for (const added of DECLARED_CARTESIAN_DETERMINISM_ADDITIONS) {
        expect(outDet?.[added]).toMatch(/^[0-9a-f]{64}$/);
      }
    },
  );
});

describe(`artifact.certify — {spec}-only byte compatibility, ECharts half (baseline ${BASELINE_COMMIT})`, () => {
  it.each(ECHARTS_MARK_TRAITS)(
    `%s: every key EXCEPT notes[] and contrastNote is byte-identical to pristine HEAD ${BASELINE_COMMIT}`,
    async (trait) => {
      const out = (await handle({ spec: cases[trait] })) as Record<string, unknown>;
      const { notes: _outNotes, contrastNote: _outContrast, ...outRest } = out;
      const { notes: _baseNotes, contrastNote: _baseContrast, ...baseRest } = baseline[trait];
      expect(JSON.stringify(outRest)).toBe(JSON.stringify(baseRest));
    },
  );

  it.each(ECHARTS_MARK_TRAITS)(
    '%s: contrastNote is byte-identical (s179 declares zero ECharts contrastNote movement)',
    async (trait) => {
      const out = (await handle({ spec: cases[trait] })) as { contrastNote?: string };
      const base = baseline[trait].contrastNote as string | undefined;
      if (DECLARED_ECHARTS_CONTRAST_NOTE_REWORD === null) {
        // Nothing declared: byte-identity for all 8 — the D11 fork's handler-level tripwire.
        expect(out.contrastNote).toBe(base);
        return;
      }
      const decl = DECLARED_ECHARTS_CONTRAST_NOTE_REWORD;
      if (!decl.geoTraits.has(trait)) {
        expect(out.contrastNote).toBe(base);
        return;
      }
      expect(base).toContain(decl.baselineContains);
      expect(out.contrastNote).toContain(decl.nowContains);
      expect(out.contrastNote).not.toContain(decl.baselineContains);
      for (const retained of decl.retains) {
        expect(base).toContain(retained);
        expect(out.contrastNote).toContain(retained);
      }
    },
  );

  it.each(ECHARTS_MARK_TRAITS)(
    '%s: notes[] moved by EXACTLY the declared set and nothing more',
    async (trait) => {
      const out = (await handle({ spec: cases[trait] })) as { notes?: string[] };
      const observed = out.notes ?? [];
      const base = (baseline[trait].notes as string[] | undefined) ?? [];

      // Count: the baseline notes, each still present (possibly reworded), plus exactly
      // the declared additions.
      expect(observed).toHaveLength(base.length + DECLARED_NOTE_ADDITIONS.length);

      // Every baseline note survives verbatim UNLESS it is a declared reword.
      const rewordKeys = DECLARED_NOTE_REWORDS.map((r) => r.baselineContains);
      for (const note of base) {
        if (rewordKeys.some((key) => note.includes(key))) {
          // A reworded note must not survive verbatim — otherwise the "reword" is a no-op
          // the control would silently accept.
          expect(observed).not.toContain(note);
          continue;
        }
        expect(observed).toContain(note);
      }
      for (const reword of DECLARED_NOTE_REWORDS) {
        const replaced = observed.filter((note) => note.includes(reword.nowContains));
        expect(replaced).toHaveLength(1);
      }
      for (const addition of DECLARED_NOTE_ADDITIONS) {
        const added = observed.filter((note) => note.includes(addition));
        expect(added).toHaveLength(1);
      }
    },
  );
});

describe('artifact.certify — the control can discriminate', () => {
  // Rule 13a: a control that cannot fail is not a control. A one-character mutation of
  // the baseline must red the cartesian half — proving the comparison is byte-level and
  // not a shape check that passes on anything.
  it('a single mutated byte in the baseline reds the cartesian comparison', async () => {
    const out = await handle({ spec: cases.MarkBar });
    const mutated = JSON.parse(JSON.stringify(baseline.MarkBar)) as {
      determinism?: { contentHash?: string };
    };
    const hash = mutated.determinism?.contentHash ?? '';
    mutated.determinism = { ...mutated.determinism, contentHash: `0${hash.slice(1)}` } as never;
    expect(JSON.stringify(out)).not.toBe(JSON.stringify(mutated));
  });

  // And the ECharts half must not be satisfiable by an empty response: the rest-of-object
  // comparison has real content to compare.
  it('the ECharts rest-of-object comparison is over a non-trivial verdict', () => {
    const base = baseline.MarkSankey;
    expect(Object.keys(base)).toEqual(
      expect.arrayContaining(['status', 'coverage', 'conformant', 'findings', 'pillars']),
    );
    expect((base.notes as string[]).length).toBeGreaterThan(0);
  });

  // The 1be93f8 recapture is intentionally byte-identical to 86d50ed, so content cannot
  // distinguish those two commits. The detached-worktree command, verified full SHA and
  // fixture SHA-256 are recorded in the header and the m01 baseline record. These bytes
  // still distinguish the post-s176 baseline from retired 4f64bcf in both directions.
  it('the 1be93f8 recapture retains the post-s176 bytes, not retired 4f64bcf', () => {
    expect(BASELINE_COMMIT).toBe('1be93f8');
    for (const trait of CARTESIAN_MARK_TRAITS) {
      const cartesian = baseline[trait] as {
        contrastNote?: string;
        determinism?: { renderHash?: string };
      };
      expect(cartesian.determinism?.renderHash).toMatch(/^[0-9a-f]{64}$/);
      expect(cartesian.contrastNote).toContain(
        'certify grades the series-to-paint assignment of the rendered chart',
      );
      expect(cartesian.contrastNote).not.toContain(
        'certify measures the categorical color bytes Forge baked into the compiled spec',
      );
    }

    for (const trait of ECHARTS_MARK_TRAITS) {
      const echarts = baseline[trait] as { determinism?: { renderHash?: string } };
      expect(echarts.determinism).toBeUndefined();
    }
  });
});
