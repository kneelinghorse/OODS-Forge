// viz.fromText PASSTHROUGH-EQUIVALENCE golden (sprint-132 m03).
//
// viz.fromText is NON-deterministic at the tool level (it calls the LLM parser), so it
// is deliberately OUT of the viz-determinism colocated golden job (ci.yml:615) and named
// OUTSIDE the ci-golden-list guard regex /^(viz\.render|dashboard\.render)(\..*)?\.test\.ts$/.
// Its determinism story is PASSTHROUGH EQUIVALENCE: with a REPLAYED fixed intent, the
// chart payload is byte-identical to viz.render(sameIntent) — only the parse varies. The
// per-call specRef envelope (crypto.randomUUID + Date.now, schema-ref.ts) and the advisory
// `intent` echo are stripped before comparison, mirroring viz.render.intent.test.ts.
import { describe, expect, it } from 'vitest';
import type { VizRenderInput } from '../../src/schemas/generated.js';
import { handle as vizRenderHandle } from '../../src/tools/viz.render.js';
import { handle as vizFromTextHandle } from '../../src/tools/viz.fromText.js';
import { createReplayIntentProvider } from '../../src/nlviz/index.js';

// revenue+month → the governed gm.revenue.total (target 300, threshold 350).
const REVENUE_BY_MONTH = [
  { month: '2024-01', revenue: 380 },
  { month: '2024-02', revenue: 410 },
  { month: '2024-03', revenue: 395 },
  { month: '2024-04', revenue: 420 },
];

const UTTERANCE = 'show the monthly revenue trend versus target';
const FIXED_INTENT = {
  goal: 'trend',
  measures: [{ name: 'revenue' }],
  dimensions: [{ name: 'month' }],
  chartFamily: 'line',
  measureRef: 'gm.revenue.total',
};
const replay = () => createReplayIntentProvider(new Map<string, unknown>([[UTTERANCE, FIXED_INTENT]]));

// Strip the per-call specRef trio AND the advisory intent echo before a byte-identical
// comparison — mirrors the viz.render.intent.test.ts payload() helper.
function chartPayload(out: Record<string, unknown>): string {
  const { specRef: _r, specRefCreatedAt: _c, specRefExpiresAt: _e, intent: _i, ...rest } = out as Record<string, unknown>;
  return JSON.stringify(rest);
}

describe('viz.fromText passthrough equivalence (the LLM half is non-deterministic ONLY in the parse)', () => {
  it('render-given-a-replayed-fixed-intent is byte-identical to viz.render(sameIntent)', async () => {
    const fromText = await vizFromTextHandle(
      { text: UTTERANCE, rows: REVENUE_BY_MONTH, output: { includeA11y: true } } as never,
      { provider: replay() },
    );
    const direct = await vizRenderHandle(
      { intent: FIXED_INTENT, rows: REVENUE_BY_MONTH, output: { includeA11y: true } } as unknown as VizRenderInput,
    );
    expect(chartPayload(fromText as unknown as Record<string, unknown>)).toBe(
      chartPayload(direct as unknown as Record<string, unknown>),
    );
  });

  it('ECHOES the parsed intent (advisory) so the agent can re-run viz.render(intent)', async () => {
    const out = await vizFromTextHandle(
      { text: UTTERANCE, rows: REVENUE_BY_MONTH, output: { includeA11y: true } } as never,
      { provider: replay() },
    );
    expect(out.status).toBe('ok');
    expect(out.chartType).toBe('line');
    expect(out.intent).toEqual(FIXED_INTENT); // the normalized intent the deterministic render consumed
    // The governed narrative overlay rode through viz.render unchanged (measureRef = gm.revenue.total).
    const findings = (out as { a11y?: { narrative?: { keyFindings?: string[] } } }).a11y?.narrative?.keyFindings ?? [];
    expect(findings.some((f) => f.includes('vs target 300'))).toBe(true);
  });

  it('a thin-goal parse (zero measures) fails the viz.render AJV boundary loud, but still ECHOES the intent', async () => {
    const thinReplay = createReplayIntentProvider(
      new Map<string, unknown>([['just show distribution', { goal: 'distribution', measures: [], dimensions: [] }]]),
    );
    const out = await vizFromTextHandle(
      { text: 'just show distribution', rows: REVENUE_BY_MONTH } as never,
      { provider: thinReplay },
    );
    expect(out.status).toBe('error');
    expect((out.errors as Array<{ code: string }> | undefined)?.[0]?.code).toBe('OODS-V126');
    // Guarantee 1 held upstream: measures/dimensions are present-but-empty, never omitted.
    expect(out.intent).toEqual({ goal: 'distribution', measures: [], dimensions: [] });
  });
});
