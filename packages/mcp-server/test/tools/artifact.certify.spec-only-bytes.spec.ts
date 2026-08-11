// THE SPLIT BYTE-COMPAT CONTROL. (s172 §1g; REBASED onto a fresh e5bf2f6 baseline in s173 m01.)
//
// s172 added an OPTIONAL `data` operand to artifact.certify. Every caller who does NOT
// send it must be unaffected — but s172 ALSO deliberately added operand-absent notes to
// the ECharts path, so a single "bytes are identical" control would have been one the
// sprint must violate. (That contradiction is exactly what the pre-lock critic rejected
// v1 of the s172 memo for, and it is the record-integrity failure mode that closed s170
// NOT_GENUINE.) So the control is SPLIT:
//
//   (i)  CARTESIAN {spec}-only responses are byte-identical end-to-sprint. No exception.
//   (ii) ECHARTS-PRIMARY {spec}-only responses move in `notes[]` and `contrastNote` ONLY,
//        and the movement is exactly the enumerated set below — every other key, including
//        the closed enums, `conformant`, `pillars` and the absence of `determinism`/
//        `accuracySummary`, is byte-identical.
//
// s173 REBASE (m01, sequenced FIRST, before any m01 source edit): the baseline fixture was
// RECAPTURED at pristine `e5bf2f6` — s172's final commit — in a detached worktree (see
// s172-spec-only-capture.mts for the literal command). Two consequences, both deliberate:
//
//   - The s172 declared movements are no longer "movement"; they are the baseline. Their
//     assertions are RETIRED here rather than left to rot: the pre-s172 fragments they
//     keyed on ('a11y-equivalence certification is cartesian-only', 'outside this metadata
//     IR, so it is not graded here') do not exist in an e5bf2f6 capture, so an unrebased
//     spec REDs on its own baseline. The s172 control is not thereby weakened — the diff
//     between the 95dd57d fixture and this one IS its declared set (two operand-absent
//     notes + the a11y reword + the geo contrastNote reword, cartesian untouched), so
//     re-capturing re-proved it before this sprint moved anything.
//   - s173's own declared movements are keyed against THIS baseline, below.
//
// The invariant the two sprints share: the cartesian half never moves, and the ECharts half
// moves only where a mission said, in writing, that it would.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildVizSpecFromRows } from '@oods/viz-core';
import { handle } from '../../src/tools/artifact.certify.js';
import { CARTESIAN_MARK_TRAITS, ECHARTS_MARK_TRAITS, SPEC_ONLY_CASES } from './s172-spec-only-cases.js';

const BASELINE_COMMIT = 'e5bf2f6';

const baseline = JSON.parse(
  readFileSync(new URL('./__fixtures__/s172-certify-spec-only-baseline.json', import.meta.url), 'utf8'),
) as Record<string, Record<string, unknown>>;

const cases = SPEC_ONLY_CASES(buildVizSpecFromRows);

/**
 * The ENUMERATED notes[] ADDITIONS on the ECharts {spec}-only path. Each entry is a
 * substring that must appear in exactly one ADDED note, and the added notes must be
 * exactly this many.
 *
 * s173 m01 adds NO notes — it rewords existing ones (below). The empty array is the
 * assertion: any new note on the {spec}-only path fails this control.
 */
const DECLARED_NOTE_ADDITIONS: readonly string[] = [];

/**
 * Notes present in the baseline whose TEXT is deliberately rewritten (same slot, same
 * count). Keyed by a stable substring of the baseline note; the value is a substring the
 * replacement must contain.
 */
const DECLARED_NOTE_REWORDS: ReadonlyArray<{ baselineContains: string; nowContains: string }> = [
  // s173 m01, defect 5(a) — the echartsA11yNote's blanket "determinism and accuracy ARE
  // checked" claim was false on two paths (no operand at all; an offered rule whose
  // precondition is absent). The reword states the real conditions.
  {
    baselineContains: 'determinism and accuracy ARE checked for these types when the `data` operand is supplied',
    nowContains: 'accuracy is evaluated only when the operand is supplied AND a rule offered for this chart type resolves it',
  },
];

/**
 * THE MOVEMENT THAT IS NOT IN notes[].
 *
 * ECHARTS_GEO_EXEMPT_NOTE is emitted as `contrastNote`, not as a note, so notes[] assertions
 * cannot bound it. It is declared and bounded separately: contrastNote may move on the 3 GEO
 * traits only, must still contain the retained clauses, and must be byte-identical on the
 * other 5.
 *
 * s173 m01, defect 5(c): the baseline says the geo DATA RANGE became "reachable". It did not
 * — what the operand exposes is the bubble_map colorField and the colorScale it renders on.
 * The reword names those instead; the s141 ruling clause it hangs on is unchanged and is
 * asserted to survive.
 */
const GEO_TRAITS: ReadonlySet<string> = new Set(['MarkChoropleth', 'MarkBubble', 'MarkFlow']);
const DECLARED_CONTRAST_NOTE_REWORD = {
  baselineContains: 'so the range is reachable',
  nowContains: 'so that colorField and the colorScale it renders on are reachable',
  // Clauses that must SURVIVE the reword — the verdict's actual rationale is unchanged.
  retains: ['WCAG 1.4.11 gradient essential exception', 'exempt-all-geo RULING rather than invisibility'],
};

describe(`artifact.certify — {spec}-only byte compatibility, cartesian half (baseline ${BASELINE_COMMIT})`, () => {
  it.each(CARTESIAN_MARK_TRAITS)(
    '%s: the {spec}-only response is BYTE-IDENTICAL to pristine HEAD e5bf2f6',
    async (trait) => {
      const out = await handle({ spec: cases[trait] });
      expect(JSON.stringify(out)).toBe(JSON.stringify(baseline[trait]));
    },
  );
});

describe(`artifact.certify — {spec}-only byte compatibility, ECharts half (baseline ${BASELINE_COMMIT})`, () => {
  it.each(ECHARTS_MARK_TRAITS)(
    '%s: every key EXCEPT notes[] and contrastNote is byte-identical to pristine HEAD e5bf2f6',
    async (trait) => {
      const out = (await handle({ spec: cases[trait] })) as Record<string, unknown>;
      const { notes: _outNotes, contrastNote: _outContrast, ...outRest } = out;
      const { notes: _baseNotes, contrastNote: _baseContrast, ...baseRest } = baseline[trait];
      expect(JSON.stringify(outRest)).toBe(JSON.stringify(baseRest));
    },
  );

  it.each(ECHARTS_MARK_TRAITS)(
    '%s: contrastNote moved ONLY on the geo traits, and only by the declared reword',
    async (trait) => {
      const out = (await handle({ spec: cases[trait] })) as { contrastNote?: string };
      const observed = out.contrastNote;
      const base = baseline[trait].contrastNote as string | undefined;

      if (!GEO_TRAITS.has(trait)) {
        // The 5 categorical types' contrastNote is untouched, byte for byte.
        expect(observed).toBe(base);
        return;
      }
      expect(base).toContain(DECLARED_CONTRAST_NOTE_REWORD.baselineContains);
      expect(observed).toContain(DECLARED_CONTRAST_NOTE_REWORD.nowContains);
      // The falsified clause is GONE, not merely joined by its replacement.
      expect(observed).not.toContain(DECLARED_CONTRAST_NOTE_REWORD.baselineContains);
      for (const retained of DECLARED_CONTRAST_NOTE_REWORD.retains) {
        expect(base).toContain(retained);
        expect(observed).toContain(retained);
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

  // The rebase itself is a claim about the fixture: it was captured at e5bf2f6, AFTER
  // s172 landed. If someone restores the 95dd57d fixture, the s172 movements reappear as
  // undeclared drift and every reword key below misses. Pin the two s172-era fragments
  // that MUST be in a post-s172 baseline, so the fixture's provenance is asserted, not
  // just documented in a comment.
  it('the baseline fixture is a post-s172 capture, not the retired 95dd57d one', () => {
    const sankeyNotes = baseline.MarkSankey.notes as string[];
    expect(sankeyNotes.some((note) => note.includes('Determinism is unchecked for MarkSankey'))).toBe(true);
    expect(sankeyNotes.some((note) => note.includes('Accuracy is unchecked for MarkSankey'))).toBe(true);
    expect(sankeyNotes.some((note) => note.includes('a11y-equivalence certification is cartesian-only'))).toBe(false);
  });
});
