import { describe, expect, it } from 'vitest';
import { listObjects } from '../../src/objects/object-loader.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { craftSays, recordFields, type Field } from './craft-says.js';

/**
 * s205-m01, learning #659 and next-step 1546: the craft bar measured only what a screen must NOT trip — no empty
 * box, no clipped text, no axe violation, no "Allowed transitions" row. A screen can pass all of that and still
 * say nothing about the record it shows. These are the POSITIVE assertions, one per context:
 *
 *   card    names the record, and states at least one distinguishing fact beside the name;
 *   list    each row names the record;
 *   detail  carries the record's primary text, in full.
 *
 * "The record's name" and "its primary text" are read from the OBJECT, not from the composer, so the bar cannot
 * agree with a composer that picked the wrong field:
 *   name          (the object's own fields before the ones its traits add) the field marked `text.label` — the registry's own statement of what names a
 *                 record; failing that, a field whose semantic type is the object's own name/title/number
 *                 (`billing.invoice.number`, `identity.user.name`); failing that, one called name/title/label or
 *                 <object>_name/_title/_number; failing that, the first required string that is not an
 *                 identifier, an enum or a date. (A bare "ends in name" rule picks Invoice's
 *                 billing_contact_name, which names a person, not the invoice.)
 *   primary text  the first declared field whose semantic type ends in text/body/content/description/summary;
 *                 failing that, the name.
 *
 * The failures are the measured residue on the Sprint 205 base. They are NOT fixed in m01 — they are folded into
 * m02's certification (the mission says so) — so they are pinned here as a ratchet: a screen that starts failing
 * fails this spec, and a screen that is fixed fails it too until it leaves the list. Receipt:
 * artifacts/product-reality/sprint-205/m01/craft-says.json.
 */

/**
 * Measured on the Sprint 205 base (c3847effa + m01's producer changes): 24 screens. m02 added the three Stage1
 * objects, whose lists and details passed and whose cards stated no fact beside the name; m03's provenance trait
 * gives those cards how and when the record was obtained, and all 9 pass. The 24 below are the m01 residue.
 */
const RESIDUE: string[] = [
  'Cluster/card: does not name the record (lead_title)',
  'Cluster/list: rows do not name the record (lead_title); rows bind label, description, updated_at, created_at',
  'Collection/card: does not name the record (name)',
  'Decision/list: rows do not name the record (decision_text); rows bind decision_id, updated_at, created_at, supersession_status',
  'Document/card: does not name the record (name)',
  'Evidence/card: does not name the record (claim)',
  'Evidence/list: rows do not name the record (claim); rows bind label, description, updated_at, created_at, owner_id, owner_type',
  'Invoice/card: states no fact beside the name',
  'Invoice/list: rows do not name the record (invoice_number); rows bind invoice_id, updated_at, created_at',
  'Invoice/detail: does not carry the primary text (invoice_number)',
  'Mission/card: does not name the record (title)',
  'Person/card: does not name the record (name)',
  'Plan/card: does not name the record (plan_name)',
  'Project/card: does not name the record (name)',
  'Report/card: does not name the record (title)',
  'Session/card: does not name the record (title)',
  'Sprint/card: does not name the record (title)',
  'Subscription/card: does not name the record (plan_name)',
  'Transaction/card: the object declares no field that names the record',
  'Transaction/list: the object declares no field that names the record',
  'Transaction/detail: the object declares no field that names the record',
  'Usage/card: does not name the record (provider)',
  'Usage/list: rows do not name the record (provider); rows bind usage_id, updated_at, created_at',
  'User/card: does not name the record (name)',
];

describe('the craft bar says what a screen must carry (s205-m01)', () => {
  it('names the record on every card and list row, and carries its primary text on every detail — or is named here', async () => {
    const { screens, refusedByDesign, failures } = await craftSays();
    expect(refusedByDesign).toEqual(['Chunk/card: OODS-V003', 'Chunk/list: OODS-V003', 'Chunk/detail: OODS-V003']);
    expect(screens, 'the sweep composed every other screen').toBe(3 * listObjects().length - refusedByDesign.length);
    expect(failures).toEqual(RESIDUE);
  }, 120_000);

  it('reads the record fields from the object\'s declarations, not from the composer\'s placement', async () => {
    const declared = async (object: string) => (await compose({ object, context: 'detail', options: { transient: true, validate: false } })).schema.objectSchema as Record<string, Field>;
    // Decision's primary text is its prose; Invoice is named by its number, not by the contact's name.
    expect(recordFields('Decision', await declared('Decision')).primaryText).toBe('decision_text');
    expect(recordFields('Invoice', await declared('Invoice')).name).toBe('invoice_number');
  });
});
