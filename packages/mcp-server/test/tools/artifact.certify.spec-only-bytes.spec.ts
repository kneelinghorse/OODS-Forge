// THE SPLIT BYTE-COMPAT CONTROL. (s172 §1g; rebased e5bf2f6 in s173 m01; REBASED onto a
// fresh 4f64bcf baseline in s176 m01.)
//
// s172 added an OPTIONAL `data` operand to artifact.certify. Every caller who does NOT
// send it must be unaffected — but s172 ALSO deliberately added operand-absent notes to
// the ECharts path, so a single "bytes are identical" control would have been one the
// sprint must violate. (That contradiction is exactly what the pre-lock critic rejected
// v1 of the s172 memo for, and it is the record-integrity failure mode that closed s170
// NOT_GENUINE.) So the control is SPLIT, and as of s176 (memo §1a D8, the s140 [B]
// signalled-change precedent) BOTH halves carry the same invariant form:
//
//   (i)  CARTESIAN {spec}-only responses move ONLY where a mission said, in writing,
//        they would — the declared set below; byte-identical wherever nothing is
//        declared. (Until s176 this clause read "byte-identical end-to-sprint. No
//        exception." s176 m01/m02 are the first missions to declare cartesian movement:
//        render-backed contrast rewords the caveat, render-backed determinism adds
//        renderHash. An empty declared set below restores the old absolute reading.)
//   (ii) ECHARTS-PRIMARY {spec}-only responses move in `notes[]` and `contrastNote` ONLY,
//        and the movement is exactly the enumerated set below — every other key, including
//        the closed enums, `conformant`, `pillars` and the absence of `determinism`/
//        `accuracySummary`, is byte-identical. s176 declares ZERO ECharts movement: the
//        render-grading rung is parked (memo §3), and the m01 caveat FORK (D11) exists
//        precisely so the cartesian reword cannot leak here.
//
// s176 REBASE (m01, sequenced FIRST, before any m01 source edit — the s173 precedent):
// the baseline fixture was RECAPTURED at pristine `4f64bcf` — s175's final commit — in a
// detached worktree (see s172-spec-only-capture.mts for the literal command). The
// s173/s174/s175 declared movements are no longer "movement"; they are the baseline, and
// their assertions are RETIRED here rather than left to rot. The recapture re-proved the
// declared set before this sprint moved anything: the fresh capture differs from the
// e5bf2f6 fixture in EXACTLY 11 strings — the reworded echartsA11yNote (one note slot in
// each of the 8 ECharts traits: s174 warn-first + the s175 a11yNotApplicable[] channel)
// and the reworded geo contrastNote (3 geo traits, s173 5(c)) — cartesian byte-identical.
// Two of the three retirements would NOT have been forced by the suite (both note-reword
// entries go silently vacuous against the fresh baseline); leaving them is exactly the
// rot the doctrine above forbids.
//
// The invariant the sprints share: each half moves only where a mission said, in
// writing, that it would.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildVizSpecFromRows } from '@oods/viz-core';
import { handle } from '../../src/tools/artifact.certify.js';
import { CARTESIAN_MARK_TRAITS, ECHARTS_MARK_TRAITS, SPEC_ONLY_CASES } from './s172-spec-only-cases.js';

const BASELINE_COMMIT = '4f64bcf';

const baseline = JSON.parse(
  readFileSync(new URL('./__fixtures__/s172-certify-spec-only-baseline.json', import.meta.url), 'utf8'),
) as Record<string, Record<string, unknown>>;

const cases = SPEC_ONLY_CASES(buildVizSpecFromRows);

/**
 * The ENUMERATED notes[] ADDITIONS on the ECharts {spec}-only path. Each entry is a
 * substring that must appear in exactly one ADDED note, and the added notes must be
 * exactly this many.
 *
 * s176 adds NO ECharts notes (the ECharts render-grading rung is parked, memo §3). The
 * empty array is the assertion: any new note on the {spec}-only path fails this control.
 */
const DECLARED_NOTE_ADDITIONS: readonly string[] = [];

/**
 * Notes present in the baseline whose TEXT is deliberately rewritten (same slot, same
 * count). Keyed by a stable substring of the baseline note; the value is a substring the
 * replacement must contain.
 *
 * s176 declares NO ECharts note rewords. The s174/s175 entries (both keyed on the
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
 * assertions cannot bound it. s176 declares NO contrastNote movement on ANY ECharts
 * trait: the s173 5(c) geo reword is baseline now (its assertion is retired — unlike the
 * note rewords, the recapture FORCED this one: the old baselineContains key is absent
 * from a 4f64bcf capture), and the m01 caveat fork (memo §1a D11) freezes the ECharts
 * caveat constants byte-for-byte until the parked ECharts render-grading rung. The
 * declared movement is therefore byte-identity for all 8, asserted below.
 */
const DECLARED_ECHARTS_CONTRAST_NOTE_REWORD: {
  geoTraits: ReadonlySet<string>;
  baselineContains: string;
  nowContains: string;
  retains: readonly string[];
} | null = null;

/**
 * THE CARTESIAN DECLARED SET (new in s176, per the clause-(i) rewrite above).
 *
 * null = nothing declared = the cartesian half is byte-identical, full-object. A mission
 * that moves cartesian {spec}-only bytes must declare it HERE, in the same edit as the
 * source change — never after the fact. s176 m01 (render-backed contrast caveat reword)
 * and m02 (determinism.renderHash) are the chartered movers.
 *
 * m01's declared movement: the contrast pillar grades the rendered series-to-paint
 * assignment now, so the caveat sentence ending every cartesian contrastNote says so
 * (memo §1a D11 — the caveat FORK: the ECharts half's caveat is byte-frozen, asserted
 * below and unit-pinned in certify-contrast.echarts-caveat-pin.spec.ts). All five
 * baseline traits certify 'pass' before and after — the ≤6-series verdicts are declared
 * NON-movers; only the note's caveat text moves.
 */
const DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD: {
  baselineContains: string;
  nowContains: string;
} | null = {
  baselineContains: 'certify measures the categorical color bytes Forge baked into the compiled spec',
  nowContains: 'certify grades the series-to-paint assignment of the rendered chart',
};

/**
 * m02's declared movement: the determinism object gains the OPTIONAL renderHash key on
 * the cartesian rendered-grading path (all five baseline traits classify as series
 * units, so all five gain it). stable and contentHash must be byte-identical to the
 * baseline — the render never feeds contentHash — and renderHash must be a 64-hex
 * sha256. Empty array = nothing declared = the determinism object is byte-identical.
 */
const DECLARED_CARTESIAN_DETERMINISM_ADDITIONS: readonly string[] = ['renderHash'];

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

      // The m01 caveat reword: old fragment gone, new fragment present.
      if (DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD === null) {
        expect(outContrast).toBe(baseContrast);
      } else {
        expect(baseContrast).toContain(DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD.baselineContains);
        expect(outContrast).toContain(DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD.nowContains);
        expect(outContrast).not.toContain(DECLARED_CARTESIAN_CONTRAST_NOTE_REWORD.baselineContains);
      }

      // The m02 determinism addition: baseline keys byte-identical (contentHash unmoved —
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
    '%s: contrastNote is byte-identical (s176 declares zero ECharts contrastNote movement)',
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

  // The rebase itself is a claim about the fixture: it was captured at 4f64bcf, AFTER
  // s175 landed. If someone restores the e5bf2f6 fixture, the s173–s175 movements
  // reappear as undeclared drift. Pin fragments that exist ONLY in a post-s175 capture
  // (positive keys) and fragments that exist ONLY in the retired e5bf2f6 one (negative
  // keys), so the fixture's provenance is asserted, not just documented in a comment.
  // (The s173-era keys — the operand-absent determinism/accuracy notes — hold in BOTH
  // captures and no longer discriminate; they are dropped, not kept as dead weight.)
  it('the baseline fixture is a post-s175 capture, not the retired e5bf2f6 one', () => {
    const sankeyNotes = baseline.MarkSankey.notes as string[];
    // s174 m01: the warn-first a11y note (replaced the deferral wording wholesale).
    expect(sankeyNotes.some((note) => note.includes('A11y-equivalence runs WARN-FIRST here'))).toBe(true);
    // s175 m03: the a11yNotApplicable[] channel the note now names.
    expect(
      sankeyNotes.some((note) =>
        note.includes('not-applicable rules in a11yNotApplicable[] with the absent precondition named'),
      ),
    ).toBe(true);
    // The e5bf2f6 baseline's a11y note said this; a post-s175 capture must not.
    expect(
      sankeyNotes.some((note) =>
        note.includes('determinism and accuracy ARE checked for these types when the `data` operand is supplied'),
      ),
    ).toBe(false);

    const geoNote = baseline.MarkChoropleth.contrastNote as string;
    // s173 5(c): the corrected geo wording + the palette-out-of-reach clause.
    expect(geoNote).toContain('so that colorField and the colorScale it renders on are reachable');
    expect(geoNote).toContain('The palette itself stays out of reach either way');
    // The e5bf2f6 fixture's falsified clause must be gone.
    expect(geoNote).not.toContain('so the range is reachable');
    // The s141 ruling rationale survives every reword (the retired reword's `retains`
    // clauses, re-pinned here so the rationale stays asserted after the retirement).
    expect(geoNote).toContain('WCAG 1.4.11 gradient essential exception');
    expect(geoNote).toContain('exempt-all-geo RULING rather than invisibility');
  });
});
