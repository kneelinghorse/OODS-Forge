import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchToolNames } from '../../apps/explorer/addons/storybook-addon-agent/bridge.js';

afterEach(() => vi.unstubAllGlobals());

describe('agent panel tool surface', () => {
  it('keeps supported live tools selectable when a stale bridge advertises retired options', async () => {
    const supported = ['a11y.scan', 'diag.snapshot', 'brand.apply', 'billing.reviewKit', 'billing.switchFixtures'];
    const retired = [['purity', 'audit'], ['vrt', 'run'], ['reviewKit', 'create']].map(parts => parts.join('.'));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      tools: [...supported, ...retired, 'unknown.tool'],
    }))));

    expect(await fetchToolNames()).toEqual(supported);
  });
});
