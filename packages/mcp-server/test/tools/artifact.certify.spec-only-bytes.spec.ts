// s172 §1g — THE SPLIT BYTE-COMPAT CONTROL.
//
// s172 adds an OPTIONAL `data` operand to artifact.certify. Every caller who does NOT
// send it must be unaffected — but the sprint ALSO deliberately adds operand-absent
// notes to the ECharts path, so a single "bytes are identical" control would be one the
// sprint must violate. (That contradiction is exactly what the pre-lock critic rejected
// v1 of the memo for, and it is the record-integrity failure mode that closed s170
// NOT_GENUINE.) So the control is SPLIT:
//
//   (i)  CARTESIAN {spec}-only responses are byte-identical end-to-sprint. No exception.
//   (ii) ECHARTS-PRIMARY {spec}-only responses move in `notes[]` ONLY, and the movement is
//        exactly the enumerated set below — every other key, including the closed enums,
//        `conformant`, `pillars` and the absence of `determinism`/`accuracySummary`, is
//        byte-identical.
//
// The baseline is not a restatement of the plan: __fixtures__/s172-certify-spec-only-
// baseline.json was produced by running THIS handler at pristine HEAD 95dd57d, before any
// s172 source change (see s172-spec-only-capture.mts for the exact command).

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildVizSpecFromRows } from '@oods/viz-core';
import { handle } from '../../src/tools/artifact.certify.js';
import { CARTESIAN_MARK_TRAITS, ECHARTS_MARK_TRAITS, SPEC_ONLY_CASES } from './s172-spec-only-cases.js';

const baseline = JSON.parse(
  readFileSync(new URL('./__fixtures__/s172-certify-spec-only-baseline.json', import.meta.url), 'utf8'),
) as Record<string, Record<string, unknown>>;

const cases = SPEC_ONLY_CASES(buildVizSpecFromRows);

/**
 * The ENUMERATED notes[] movement on the ECharts {spec}-only path. Each entry is a
 * substring that must appear in exactly one ADDED note, and the added notes must be
 * exactly this many. Missions add their entry here as they land; anything else moving in
 * notes[] fails this control.
 *
 *  - m02: the operand-absent determinism note
 *  - m03: the operand-absent accuracy note
 *  - m04: the reworded echartsA11yNote replaces the s136 wording IN PLACE (not an
 *         addition) — asserted separately by DECLARED_NOTE_REWORDS.
 */
const DECLARED_NOTE_ADDITIONS: readonly string[] = [
  // m02 — the operand-absent determinism note.
  'Determinism is unchecked for',
  // m03 — the operand-absent accuracy note.
  'Accuracy is unchecked for',
];

/**
 * Notes present in the baseline whose TEXT is deliberately rewritten (same slot, same
 * count). Keyed by a stable substring of the baseline note; the value is a substring the
 * replacement must contain.
 */
const DECLARED_NOTE_REWORDS: ReadonlyArray<{ baselineContains: string; nowContains: string }> = [
  // m04 — the echartsA11yNote reword. The old wording ("certification is cartesian-only")
  // read as a structural limit; the new one gives the real, temporary reason.
  {
    baselineContains: 'a11y-equivalence certification is cartesian-only',
    nowContains: 'no per-rule not-applicable state',
  },
];

/**
 * THE FOURTH DECLARED MOVEMENT, and it is NOT in notes[].
 *
 * Memo §1g enumerated the ECharts {spec}-only movement as three notes[] entries. Its own m04
 * charter ALSO mandates rewording ECHARTS_GEO_EXEMPT_NOTE — which is emitted as
 * `contrastNote`, not as a note. So §1g's enumeration was incomplete against the memo's own
 * mission list, discovered here at build time. The reword is kept (leaving it would ship a
 * note whose stated rationale s172 m01 had just falsified) and the movement is declared and
 * bounded instead of quietly widened: contrastNote may move on the 3 GEO traits only, must
 * still contain the retained clauses, and must be byte-identical on the other 5.
 */
const GEO_TRAITS: ReadonlySet<string> = new Set(['MarkChoropleth', 'MarkBubble', 'MarkFlow']);
const DECLARED_CONTRAST_NOTE_REWORD = {
  baselineContains: 'outside this metadata IR, so it is not graded here',
  nowContains: 'exempt-all-geo RULING rather than invisibility',
  // Clauses that must SURVIVE the reword — the verdict's actual rationale is unchanged.
  retains: ['WCAG 1.4.11 gradient essential exception'],
};

describe('artifact.certify — {spec}-only byte compatibility, cartesian half (s172 §1g)', () => {
  it.each(CARTESIAN_MARK_TRAITS)(
    '%s: the {spec}-only response is BYTE-IDENTICAL to pristine HEAD 95dd57d',
    async (trait) => {
      const out = await handle({ spec: cases[trait] });
      expect(JSON.stringify(out)).toBe(JSON.stringify(baseline[trait]));
    },
  );
});

describe('artifact.certify — {spec}-only byte compatibility, ECharts half (s172 §1g)', () => {
  it.each(ECHARTS_MARK_TRAITS)(
    '%s: every key EXCEPT notes[] and contrastNote is byte-identical to pristine HEAD 95dd57d',
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

describe('artifact.certify — the control can discriminate (s172 §1g)', () => {
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
});
