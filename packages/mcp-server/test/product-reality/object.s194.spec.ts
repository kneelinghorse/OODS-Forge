import { expect, it } from 'vitest';
import { handle as object } from '../../src/tools/object.js';
import { wire, retain } from '../helpers/wire-boundary.js';

it('object discovers the real registry and exposes composed traits and context-filtered view extensions', async () => {
  const call = async (input: any): Promise<any> => { wire('object', 'input', input); const result = await object(input); wire('object', 'output', result); return result; };
  const listed = await call({ action: 'list' });
  // 18 through Sprint 202; Sprint 203 m02 adds three delivery objects born from CMOS's own record and
  // m03 two intelligence objects born from Hive's cohort.
  expect(listed.totalCount).toBe(23);
  const details = [];
  for (const entry of listed.objects) {
    const full = await call({ action: 'show', name: entry.name });
    expect(full.traits.length).toBeGreaterThan(0);
    expect(Object.keys(full.schema).length).toBeGreaterThan(0);
    expect(Object.values(full.viewExtensions).flat().length).toBeGreaterThan(0);
    const detail = await call({ action: 'show', name: entry.name, context: 'detail' });
    expect(detail.viewExtensions).toEqual(full.viewExtensions.detail ? { detail: full.viewExtensions.detail } : {});
    details.push({ name: full.name, traits: full.traits, viewExtensions: full.viewExtensions });
  }
  const subscription = listed.objects.find((entry: any) => entry.name === 'Subscription');
  const filtered = await call({ action: 'list', domain: subscription.domain });
  expect(filtered.objects.every((entry: any) => entry.domain === subscription.domain)).toBe(true);
  await expect(object({ action: 'show', name: 'Subscriptio' })).rejects.toMatchObject({ opiCode: 'OODS-N005' });
  retain('object', { listed, filtered, details });
});
