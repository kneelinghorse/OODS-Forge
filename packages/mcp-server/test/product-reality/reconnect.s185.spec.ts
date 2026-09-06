import { describe, expect, it } from 'vitest';
import { DESTINATIONS, requestHash, verifyDeliveries } from '../../../../scripts/product-reality/s185-reconnect.mjs';

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
