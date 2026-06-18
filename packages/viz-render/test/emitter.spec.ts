import { describe, expect, it } from 'vitest';
import { renderVegaLiteToSvg, type VegaLiteSpec } from '@oods/viz-render';

// A fixed line spec (the dashboard "trend" panel shape): tabular data, line mark.
const TREND_SPEC: VegaLiteSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  data: {
    values: [
      { month: 'Jan', revenue: 100 },
      { month: 'Feb', revenue: 140 },
      { month: 'Mar', revenue: 120 },
      { month: 'Apr', revenue: 175 },
    ],
  },
  mark: 'line',
  encoding: {
    x: { field: 'month', type: 'ordinal' },
    y: { field: 'revenue', type: 'quantitative' },
  },
  width: 300,
  height: 200,
};

// A fixed bar spec (the dashboard "breakdown" panel shape): categorical bars.
const BREAKDOWN_SPEC: VegaLiteSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  data: {
    values: [
      { region: 'North', sales: 30 },
      { region: 'South', sales: 55 },
      { region: 'East', sales: 43 },
      { region: 'West', sales: 21 },
    ],
  },
  mark: 'bar',
  encoding: {
    x: { field: 'region', type: 'nominal' },
    y: { field: 'sales', type: 'quantitative' },
  },
  width: 300,
  height: 200,
};

describe('renderVegaLiteToSvg', () => {
  it('renders a Vega-Lite spec to an SVG string (headless, no DOM)', async () => {
    const svg = await renderVegaLiteToSvg(TREND_SPEC);
    // The emitter MUST produce real SVG markup, not a spec echo — this is the whole
    // point of the package (the moat: output that becomes pixels).
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
    // Path marks for the line series are present (rendered geometry, not just axes).
    expect(svg).toContain('class="mark-line');
  });

  it('is byte-stable across repeated renders (determinism contract, seam d)', async () => {
    // Render the SAME spec twice. Because Vega's clip/gradient id counter is
    // PROCESS-GLOBAL, an un-normalized emitter would differ run-to-run; this asserts
    // the normalization holds the byte-for-byte guarantee.
    const a = await renderVegaLiteToSvg(TREND_SPEC);
    const b = await renderVegaLiteToSvg(TREND_SPEC);
    expect(a).toBe(b);
  });

  it('stays byte-stable even when other renders bump the global id counter in between', async () => {
    // This is the regression that motivates id normalization: render an unrelated
    // spec between two renders of the target so Vega's global counter advances.
    const first = await renderVegaLiteToSvg(BREAKDOWN_SPEC);
    await renderVegaLiteToSvg(TREND_SPEC); // bump the counter with a different spec
    const second = await renderVegaLiteToSvg(BREAKDOWN_SPEC);
    expect(first).toBe(second);
  });

  it('normalizes Vega auto-generated ids to stable oods-id-* tokens', async () => {
    // A spec that forces a clip-path id (axis-clipped area), proving the raw global
    // counter value never leaks into the output.
    const clipped: VegaLiteSpec = {
      ...BREAKDOWN_SPEC,
      mark: { type: 'area', clip: true },
    };
    const svg = await renderVegaLiteToSvg(clipped);
    // No raw `clipNNN` ids; any id present is a normalized token.
    expect(svg).not.toMatch(/id="clip\d+"/);
    for (const m of svg.matchAll(/\bid="([^"]+)"/g)) {
      expect(m[1]).toMatch(/^oods-id-\d+$/);
    }
  });

  it('preserves accessibility roles emitted by Vega in the SVG', async () => {
    // The export must carry a11y affordances by construction (the moat). Vega emits
    // ARIA roles on the scenegraph; they must survive id normalization.
    const svg = await renderVegaLiteToSvg(TREND_SPEC);
    expect(svg).toContain('role="graphics-object"');
    expect(svg).toContain('aria-roledescription');
  });

  it('threads brand tokens without changing output in m02 (applied in m04)', async () => {
    // The tokens option is the m04 seam: accepted now, not yet applied. Passing
    // tokens must NOT alter the rendered bytes this sprint-mission.
    const withoutTokens = await renderVegaLiteToSvg(TREND_SPEC);
    const withTokens = await renderVegaLiteToSvg(TREND_SPEC, {
      tokens: { '--oods-color-accent': '#3366cc', '--oods-color-fg': '#111111' },
    });
    expect(withTokens).toBe(withoutTokens);
  });

  it('matches the committed byte-stable SVG golden (fixed spec + dataset)', async () => {
    // The net-new RENDERED-OUTPUT golden (sprint-115 m05): pins the emitter's SVG
    // string for a fixed VL spec + inline dataset. Any drift in the compile/render
    // path or the determinism pins (text metrics / id normalization) must update a
    // committed snapshot. Byte-stable cross-machine: the text-width estimator is
    // arithmetic (font-independent) and vega is lockfile-pinned.
    const svg = await renderVegaLiteToSvg(TREND_SPEC);
    expect(svg).toMatchSnapshot();
  });

  it('rejects a spec that cannot be compiled', async () => {
    // A structurally invalid spec must throw, so dashboard.render can fall back to
    // an a11y-described placeholder rather than emit broken markup.
    const broken = { mark: 'not-a-real-mark', encoding: {} } as unknown as VegaLiteSpec;
    await expect(renderVegaLiteToSvg(broken)).rejects.toBeDefined();
  });
});
