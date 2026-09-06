import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildNotices, DESTINATIONS, requestHash, verifyDeliveries } from '../../../../scripts/product-reality/s185-reconnect.mjs';

function fixture() {
  const notices = DESTINATIONS.map((targetAddress: string) => {
    const request = { type: 'info_push', targetAddress, summary: 'Combined consumer changes', body: 'Exact reviewed request body.' };
    return { request, requestSha256: requestHash(request) };
  });
  return { plan: { notices, retired: { targetAddress: 'cmos://derek/dashboard-demos', messageId: null } },
    deliveries: notices.map(({ request, requestSha256 }: { request: { targetAddress: string }; requestSha256: string }, index: number) => ({
      targetAddress: request.targetAddress, requestSha256, status: 'sent', messageId: `00000000-0000-4000-8000-00000000000${index + 1}`,
    })) };
}

describe('Combined reconnect requires real unique deliveries of the exact reviewed requests', () => {
  it('prepares the 23 new families separately from the eight root promotions and names the alias horizon without sending', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 's186-reconnect-fixture-'));
    const git = (...args: string[]) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'user.name=Notice Fixture',
      '-c', 'user.email=notice@example.invalid', ...args], { cwd: root, encoding: 'utf8' }).trim();
    const put = (file: string, value: unknown) => {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), typeof value === 'string' ? value : JSON.stringify(value));
    };
    const types = 'packages/component-contracts/src/types.ts';
    const array = (name: string, ids: string[]) => `export const ${name} = [${ids.map(id => `'${id}'`).join(',')}] as const;`;
    const previous = Array.from({ length: 19 }, (_, i) => `Original${i}`);
    const promoted = Array.from({ length: 8 }, (_, i) => `Promoted${i}`);
    const added = Array.from({ length: 23 }, (_, i) => `Added${i}`).sort();
    const nucleus = [...previous, ...promoted, ...added].sort();
    try {
      git('init', '--quiet');
      put(types, `${array('NUCLEUS_COMPONENT_IDS', previous)}\n${array('PORTED_COMPONENT_IDS', promoted)}`);
      git('add', '.'); git('commit', '--quiet', '-m', 'Synthetic previous surface'); const base = git('rev-parse', 'HEAD');
      put(types, array('NUCLEUS_COMPONENT_IDS', nucleus));
      put('packages/component-styles/src/index.ts', array('COMPONENT_STYLE_IDS', nucleus));
      put('packages/component-styles/package.json', { exports: { './css-ported': { default: './dist/components.css' } } });
      for (const framework of ['react', 'vue']) {
        put(`packages/components-${framework}/evidence/${framework}-readiness.v1.json`, { rows: nucleus.map(componentId => ({ componentId, emissionEligible: true })) });
        put(`packages/components-${framework}/package.json`, { exports: { './ported': {}, './readiness-ported': {} } });
      }
      const censusPath = 'frozen/successor-census.json';
      put(censusPath, { total: 16, reachable: 16, generatedCells: 32, schemaStore: 'disclosed-successor-store',
        rows: Array.from({ length: 16 }, () => ({ reachable: true, cells: ['react', 'vue'].map(framework => ({ framework, status: 'ok', artifactPresent: true })) })) });
      git('add', '.'); git('commit', '--quiet', '-m', 'Synthetic unified surface'); const head = git('rev-parse', 'HEAD');
      const plan = buildNotices({ missionId: 's186-m06', status: 'passed', s186: { base, head, canonicalPaths: [], supplementalRuntimePaths: [] } }, root, { censusPath });
      expect(plan).toMatchObject({ addedNucleus: added, formerPorted: promoted, nucleusCount: nucleus.length, aliasHorizon: 'sprint-187' });
      expect(plan.notices.map((row: any) => row.request.targetAddress)).toEqual(DESTINATIONS);
      for (const notice of plan.notices) {
        expect(notice.request.body).toContain('their one-sprint retirement horizon is Sprint 187');
        expect(notice.request.body).toContain('disclosed-successor-store');
        expect(notice.request.body).toContain('No live bridge rebuild/restart was performed');
        expect(notice.request.body).toContain('supersedes the earlier Sprint 186 notice');
        expect(notice.request.body).toContain('the two original sent requests remain retained');
        expect(notice.requestSha256).toBe(requestHash(notice.request));
        expect(notice).not.toHaveProperty('messageId');
      }
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it('accepts two distinct active destination receipts and no retired send', () => {
    const { plan, deliveries } = fixture();
    expect(verifyDeliveries(plan, deliveries)).toMatchObject({ status: 'passed', successfulDeliveries: 2 });
  });
  it.each(['', 'pending', 'not-sent'])('rejects an absent or invented message id: %s', (id) => {
    const { plan, deliveries } = fixture(); deliveries[0].messageId = id;
    expect(() => verifyDeliveries(plan, deliveries)).toThrow('real message id');
  });
  it('rejects reuse of one receipt for two destinations', () => {
    const { plan, deliveries } = fixture(); deliveries[1].messageId = deliveries[0].messageId;
    expect(() => verifyDeliveries(plan, deliveries)).toThrow('unique');
  });
  it('rejects missing coverage and duplicate destinations', () => {
    const { plan, deliveries } = fixture();
    expect(() => verifyDeliveries(plan, deliveries.slice(0, 1))).toThrow('Exactly two');
    deliveries[1].targetAddress = deliveries[0].targetAddress;
    expect(() => verifyDeliveries(plan, deliveries)).toThrow('coverage');
  });
  it('rejects a changed request body even with retained successful receipt ids', () => {
    const { plan, deliveries } = fixture(); plan.notices[0].request.body += ' altered';
    expect(() => verifyDeliveries(plan, deliveries)).toThrow('request hash changed');
  });
  it('rejects a receipt for a different request or a claimed retired delivery', () => {
    const { plan, deliveries } = fixture(); deliveries[0].requestSha256 = 'f'.repeat(64);
    expect(() => verifyDeliveries(plan, deliveries)).toThrow('Delivered request differs');
    const second = fixture(); second.plan.retired.messageId = second.deliveries[0].messageId as never;
    expect(() => verifyDeliveries(second.plan, second.deliveries)).toThrow('Retired');
  });
});
