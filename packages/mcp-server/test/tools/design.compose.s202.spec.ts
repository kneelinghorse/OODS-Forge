import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readVersion, resolveCompositionsDir } from '../../src/lib/composition-store.js';
import { handle as compose, swappableCandidates } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';

let storeRoot: string;
beforeEach(() => { storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-compose-s202-')); vi.stubEnv('MCP_SCHEMA_STORE_ROOT', storeRoot); vi.stubEnv('MCP_SCHEMA_STORE_DIR', 'schemas'); });
afterEach(() => { vi.unstubAllEnvs(); fs.rmSync(storeRoot, { recursive: true, force: true }); });

describe('the recorded slot candidates are the ones a swap can generate (s202-m01)', () => {
  it('drops a tab candidate code.generate refuses and keeps every other composer candidate, so every offered swap generates in both frameworks', async () => {
    const composed = await compose({ object: 'Subscription', context: 'detail' });
    expect(composed.status).toBe('ok');
    const record = await readVersion(resolveCompositionsDir(), composed.compositionId!, composed.version!);
    // The selector still ranks the Badge family for the status tab; the version offers only what generates.
    const status = composed.selections.find(selection => selection.selectedComponent === 'StatusBadge' && selection.slotName.startsWith('tab-'))!;
    expect(status, 'a status tab slot').toBeDefined();
    expect(status.candidates.map(candidate => candidate.name)).toEqual(['StatusBadge', 'Badge', 'ColorizedBadge']);
    expect(record.slots.find(slot => slot.slotName === status.slotName)!.candidates).toEqual(['StatusBadge']);
    expect(await swappableCandidates({ object: 'Subscription', context: 'detail' }, composed.schema!, status)).toEqual(['StatusBadge']);
    // The refusal is real: the same override composes a schema code.generate rejects with OODS-V007.
    const badge = await compose({ object: 'Subscription', context: 'detail', preferences: { componentOverrides: { [status.slotName]: 'Badge' } }, options: { transient: true } });
    const refused = await generate({ schema: badge.schema!, framework: 'react', profile: 'build' });
    expect(refused.status).toBe('error');
    expect(refused.errors?.map(error => error.code)).toContain('OODS-V007');
    // Every candidate the version offers on a tab slot generates in both frameworks.
    const tabs = record.slots.filter(slot => slot.slotName.startsWith('tab-') && (slot.candidates ?? []).length > 1);
    expect(tabs.length).toBeGreaterThan(0);
    for (const slot of tabs) {
      for (const candidate of slot.candidates!) {
        if (candidate === slot.selectedComponent) continue;
        const swapped = await compose({ object: 'Subscription', context: 'detail', preferences: { componentOverrides: { [slot.slotName]: candidate } }, options: { transient: true } });
        expect(swapped.status, `${slot.slotName} → ${candidate}`).toBe('ok');
        for (const framework of ['react', 'vue'] as const) {
          const generated = await generate({ schema: swapped.schema!, framework, profile: 'build' });
          expect(generated.status, `${slot.slotName} → ${candidate} (${framework}): ${JSON.stringify(generated.errors)}`).toBe('ok');
        }
      }
    }
  }, 120_000);
});

describe('a version\'s own order overrides never abort recording it (s202-m04)', () => {
  it('records a version whose field order some slot candidate cannot carry, and offers only the candidates a swap would compose', async () => {
    // With the header slot swapped to VizAreaPreview the status timeline moves into the body, so ordering the body's fields
    // names status; a candidate that no longer places status there is refused by that order. Recording used to fail with it.
    const preferences = { componentOverrides: { header: 'VizAreaPreview' }, fieldOrder: { 'detail-body-10': ['cancellation_reason_code', 'status'] } };
    const composed = await compose({ object: 'Subscription', context: 'detail', preferences });
    expect(composed.status).toBe('ok');
    const record = await readVersion(resolveCompositionsDir(), composed.compositionId!, composed.version!);
    const refusedByOrder: string[] = [];
    for (const selection of composed.selections) {
      const offered = record.slots.find(slot => slot.slotName === selection.slotName)?.candidates ?? [];
      const ranked = [...new Set([...selection.candidates.map(candidate => candidate.name), ...(selection.alternativeCandidates ?? []).map(candidate => candidate.name)])];
      for (const name of ranked) {
        if (name === selection.selectedComponent) continue;
        const outcome = await compose({ object: 'Subscription', context: 'detail', preferences: { ...preferences, componentOverrides: { ...preferences.componentOverrides, [selection.slotName]: name } }, options: { transient: true, validate: false } })
          .then(() => 'composed', (error: { opiCode?: string }) => error.opiCode ?? 'error');
        // A swap the version's own order refuses is never offered; every offered swap composes.
        if (outcome === 'OODS-V204') { refusedByOrder.push(`${selection.slotName} → ${name}`); expect(offered, `${selection.slotName} → ${name}`).not.toContain(name); }
        else if (offered.includes(name)) expect(outcome, `${selection.slotName} → ${name}`).toBe('composed');
      }
    }
    expect(refusedByOrder.length, 'the version carries a field order at least one candidate cannot').toBeGreaterThan(0);
  }, 180_000);
});
