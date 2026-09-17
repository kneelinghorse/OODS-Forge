import { describe, expect, it } from 'vitest';
import { formatDateTime } from '@oods/component-contracts';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import {
  slotDateHelperSource,
  slotExcerptHelperSource,
  SLOT_DATE_HELPER,
  SLOT_EXCERPT_HELPER,
} from '../../src/codegen/binding-utils.js';

/**
 * s204-m02 (b) and (d).
 *
 * (b) A date bound through a slot printed its raw stored value — the Decision card read
 *     `2026-09-01T12:00:00.000Z` where its own detail read `Sep 1, 2026, 12:00 PM`. The s203 review
 *     ruled (#2180) that the builder was RIGHT to refuse the obvious fix: formatting through
 *     `formatReadOnlyValue` forces an `@oods/component-contracts` import into artifacts that declare
 *     no such dependency. The value is lowered at generate time instead.
 *
 * (d) Decision/card, the one screen Sprint 203 could not certify, showed a stored timestamp and a
 *     badge and nothing about the decision. It now carries a first-line excerpt of `decision_text` —
 *     the record's own words, not an invented title, because a CMOS decision has no title.
 *
 * The load-bearing assertion in both cases is the NEGATIVE one: the generated artifact must not have
 * gained a dependency.
 */

function evaluate(source: string, name: string): (value: unknown) => string {
  return new Function(`${source}\nreturn ${name};`)() as (value: unknown) => string;
}

describe('s204-m02 (b) — a slot-bound date reads as a date, and costs no dependency', () => {
  // The emitted copy exists only so the artifact imports nothing. That is worth doing only while the
  // copy and the contract agree; a copy that drifts is worse than the import it avoided.
  it('agrees with formatDateTime on every value, including the absent and the invalid', () => {
    const emitted = evaluate(slotDateHelperSource(false), SLOT_DATE_HELPER);
    const corpus: unknown[] = [
      '2026-09-01T12:00:00.000Z', '2026-01-31T23:59:59Z', '1970-01-01T00:00:00Z', '2026-09-01',
      '2026-12-25T06:05:00-05:00', 0, 1_757_000_000_000, new Date('2026-06-15T08:30:00Z'),
      '', null, undefined, 'not a date', 'NaN',
    ];
    for (const value of corpus) {
      expect(emitted(value), `disagreed on ${JSON.stringify(value)}`).toBe(formatDateTime(value as never));
    }
    // The case the defect was reported as: the detail's reading, now on the card too.
    expect(emitted('2026-09-01T12:00:00.000Z')).toBe('Sep 1, 2026, 12:00 PM');
  });

  it('pins the formatter UTC, so the same record reads the same on every host', () => {
    // Not a style preference: a generated artifact whose output moved with the developer's time zone
    // would make every screenshot receipt in this repo unreproducible.
    expect(slotDateHelperSource(false)).toContain("timeZone: 'UTC'");
  });

  for (const framework of ['react', 'vue'] as const) {
    // Article/dashboard rather than the Decision card the defect was REPORTED on: fixing (d) rebound
    // that card's heading away from `created_at`, so the card no longer has a slot-bound date to
    // format. The branch is live elsewhere, and this is where it is exercised.
    it(`formats a slot-bound date in ${framework} without importing anything to do it`, async () => {
      const composed = await compose({ object: 'Article', context: 'dashboard' });
      const generated = await generate({ schema: composed.schema, framework });

      expect(generated.errors ?? []).toEqual([]);
      // Defined in the module...
      expect(generated.code).toContain(`function ${SLOT_DATE_HELPER}(`);
      // ...and NOT imported. This is the whole constraint the review kept.
      expect(generated.code).not.toContain('@oods/component-contracts');
      expect(generated.imports ?? []).not.toContain('@oods/component-contracts');
    });
  }
});

describe('s204-m02 (d) — a card heading says what the record is', () => {
  it('binds the Decision card heading to the decision text, marked as an excerpt', async () => {
    const composed = await compose({ object: 'Decision', context: 'card' });
    const header = JSON.stringify(composed.schema);
    expect(header).toContain('"headingExcerpt":true');
    // The record's own words, not a timestamp and not an invented title.
    expect(header).toContain('"field":"decision_text"');
  });

  it('shows the first line only, and marks that something was cut', () => {
    const excerpt = evaluate(slotExcerptHelperSource(false), SLOT_EXCERPT_HELPER);
    const many = 'Lock Sprint 204 — observation against intent, and the capture made affordable, six serial missions from a base the bridge already serves.\nA second paragraph that must never reach a card heading.';

    const cut = excerpt(many);
    expect(cut.length).toBeLessThanOrEqual(121);
    expect(cut).not.toContain('\n');
    expect(cut).not.toContain('second paragraph');
    expect(cut.endsWith('…')).toBe(true);

    // A short decision is shown whole, with no ellipsis to suggest otherwise.
    expect(excerpt('Promotion freeze is void.')).toBe('Promotion freeze is void.');
    // Absent stays absent rather than becoming the word "null".
    expect(excerpt(null)).toBe('');
    expect(excerpt(undefined)).toBe('');
  });

  it('cuts the heading only — the same field still renders in full on the detail', async () => {
    // Sprint 203 m04 certified the 8,418-character decision reading in full at 390 in both
    // frameworks. An excerpt rule that leaked into the detail would silently revoke that.
    const detail = await compose({ object: 'Decision', context: 'detail' });
    expect(JSON.stringify(detail.schema)).not.toContain('"headingExcerpt":true');

    const generated = await generate({ schema: detail.schema, framework: 'react' });
    expect(generated.code).not.toContain(`${SLOT_EXCERPT_HELPER}(`);
  });
});
