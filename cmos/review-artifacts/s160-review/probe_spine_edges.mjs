// s160 adversarial review — drawn-cell-spine edge hunter probes
// Run: node probe_spine_edges.mjs  (read-only import of the built dist)
import { analyzeVizSpec, generateNarrativeSummary, toEChartsOption, toVegaLiteSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const B = (field, trait, extra = {}) => ({ field, trait, ...extra });

function show(name, spec, opts = {}) {
  console.log('\n================ ' + name + ' ================');
  const a = analyzeVizSpec(spec);
  console.log('analysis: max=', JSON.stringify(a.max), ' min=', JSON.stringify(a.min), ' total=', a.total, ' corr=', a.correlation, ' rowCount=', a.rowCount);
  const n = generateNarrativeSummary(spec);
  console.log('summary:', n.summary);
  console.log('keyFindings:', JSON.stringify(n.keyFindings, null, 1));
  if (opts.echarts) {
    const o = toEChartsOption(spec);
    const src = o.dataset[0]?.source;
    console.log('dataset[0].source:', JSON.stringify(src));
    console.log('visualMap min/max:', o.visualMap?.min, o.visualMap?.max);
    const derived = o.dataset.filter((d) => d.fromDatasetId !== undefined);
    console.log('derived panels:', derived.length);
    for (const p of derived) {
      const filters = p.transform ?? [];
      const matches = (src ?? []).filter((row) => filters.every((t) => row[t.config.field] === t.config.value));
      console.log('  panel', p.id, 'filters', JSON.stringify(filters.map(t=>t.config)), '→ matches', matches.length, JSON.stringify(matches.map(m=>m[spec.encoding.color?.field ?? 'v'])));
    }
    console.log('series count:', o.series.length, 'series datasetIds:', o.series.map(s=>s.datasetId));
  }
  return { a, n };
}

// ─── Probe A1: HORIZONTAL aggregated bar — aggregate on X, dimension on Y ───
// rows: team A hours 60+50, team B 40. DRAWN bars (Vega aggregates x): A=110, B=40.
const horizBar = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'hb', name: 'horizontal agg bar',
  data: { name: 'hb', values: [
    { team: 'A', hours: 60 }, { team: 'A', hours: 50 }, { team: 'B', hours: 40 },
  ]},
  marks: [{ trait: 'MarkBar', encodings: {
    x: B('hours', 'EncodingX', { scale: 'linear', aggregate: 'sum', type: 'quantitative' }),
    y: B('team', 'EncodingY', { scale: 'band' }),
  }}],
  encoding: {
    x: B('hours', 'EncodingX', { scale: 'linear', aggregate: 'sum', type: 'quantitative' }),
    y: B('team', 'EncodingY', { scale: 'band' }),
  },
  a11y: { description: 'hours by team' },
};
show('A1 horizontal aggregated bar (sum on x)', horizBar);
// What does Vega draw?
const vlH = toVegaLiteSpec(horizBar);
console.log('VL encoding:', JSON.stringify(vlH.encoding));

// ─── Probe A2: keep-control vertical aggregated bar ───
const vertBar = {
  ...horizBar, id: 'vb', name: 'vertical agg bar',
  marks: [{ trait: 'MarkBar', encodings: {
    x: B('team', 'EncodingX', { scale: 'band' }),
    y: B('hours', 'EncodingY', { scale: 'linear', aggregate: 'sum', type: 'quantitative' }),
  }}],
  encoding: {
    x: B('team', 'EncodingX', { scale: 'band' }),
    y: B('hours', 'EncodingY', { scale: 'linear', aggregate: 'sum', type: 'quantitative' }),
  },
};
show('A2 vertical aggregated bar keep-control (expect High A=110, Low B=40, total 150)', vertBar);

// ─── Probe B: heatmap with FACET + DETAIL + SIZE all bound ───
// hand-computed cells keyed (region,hour,site,sz,line):
//  (N,9,A,1,d1)=5  (N,9,A,2,d1)=7  (N,9,A,1,d2)=11  (N,9,B,1,d1)=13
// drop sz → 5+7 merge to 12; drop line → 5+11 merge; drop site → 5+13 merge.
const colorSum = B('temp', 'EncodingColor', { scale: 'linear', aggregate: 'sum' });
const fullHeat = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'fh', name: 'full spine heatmap',
  data: { name: 'fh', values: [
    { site: 'A', region: 'N', hour: '9', line: 'd1', sz: 1, temp: 5 },
    { site: 'A', region: 'N', hour: '9', line: 'd1', sz: 2, temp: 7 },
    { site: 'A', region: 'N', hour: '9', line: 'd2', sz: 1, temp: 11 },
    { site: 'B', region: 'N', hour: '9', line: 'd1', sz: 1, temp: 13 },
  ]},
  marks: [{ trait: 'MarkRect', encodings: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }),
    color: { ...colorSum }, detail: B('line', 'EncodingDetail'), size: B('sz', 'EncodingSize'),
  }}],
  encoding: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }),
    color: { ...colorSum }, detail: B('line', 'EncodingDetail'), size: B('sz', 'EncodingSize'),
  },
  layout: { trait: 'LayoutFacet', columns: { field: 'site' } },
  a11y: { description: 'temp' },
};
show('B facet+detail+size heatmap (expect cells 5,7,11,13; vm 5..13; narrative min 5 max 13 total 36)', fullHeat, { echarts: true });

// ─── Probe C: key-collision — facet value "a" + detail "b c" vs facet "a b" + detail "c" ───
// space-join would collide both to "a b c"; NUL join must keep 2 cells (20 and 30).
const collide = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'kc', name: 'collision heatmap',
  data: { name: 'kc', values: [
    { site: 'a', line: 'b c', region: 'N', hour: '9', temp: 20 },
    { site: 'a b', line: 'c', region: 'N', hour: '9', temp: 30 },
  ]},
  marks: [{ trait: 'MarkRect', encodings: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }),
    color: { ...colorSum }, detail: B('line', 'EncodingDetail'),
  }}],
  encoding: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }),
    color: { ...colorSum }, detail: B('line', 'EncodingDetail'),
  },
  layout: { trait: 'LayoutFacet', columns: { field: 'site' } },
  a11y: { description: 'temp' },
};
show('C key-collision (expect 2 cells 20,30; vm 20..30; NOT one merged 50-cell)', collide, { echarts: true });

// ─── Probe D: stacked aggregated bar keep-control (+ faceted variant) ───
// Q1: 10+20=30, Q2: 5+7=12 → High 30, Low 12, total 42.
const stacked = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'sb', name: 'stacked sum bar',
  data: { name: 'sb', values: [
    { quarter: 'Q1', team: 't1', hours: 10 }, { quarter: 'Q1', team: 't2', hours: 20 },
    { quarter: 'Q2', team: 't1', hours: 5 },  { quarter: 'Q2', team: 't2', hours: 7 },
  ]},
  marks: [{ trait: 'MarkBar', encodings: {
    x: B('quarter', 'EncodingX', { scale: 'band' }),
    y: B('hours', 'EncodingY', { scale: 'linear', aggregate: 'sum', type: 'quantitative' }),
    color: B('team', 'EncodingColor'),
  }}],
  encoding: {
    x: B('quarter', 'EncodingX', { scale: 'band' }),
    y: B('hours', 'EncodingY', { scale: 'linear', aggregate: 'sum', type: 'quantitative' }),
    color: B('team', 'EncodingColor'),
  },
  a11y: { description: 'hours' },
};
show('D stacked sum bar (expect High Q1=30, Low Q2=12, total 42)', stacked);

const stackedFacet = {
  ...stacked, id: 'sbf', name: 'faceted stacked sum bar',
  data: { name: 'sbf', values: [
    { site: 'A', quarter: 'Q1', team: 't1', hours: 10 }, { site: 'A', quarter: 'Q1', team: 't2', hours: 20 },
    { site: 'B', quarter: 'Q1', team: 't1', hours: 1 },  { site: 'B', quarter: 'Q1', team: 't2', hours: 2 },
  ]},
  layout: { trait: 'LayoutFacet', columns: { field: 'site' } },
};
// per (quarter,site) stack totals: (Q1,A)=30, (Q1,B)=3 → High 30, Low 3, total 33.
show('D2 faceted stacked sum bar (expect High 30, Low 3, total 33 — NOT pooled 33/33)', stackedFacet);

// ─── Probe E: NUMERIC-typed facet values — panel filters must still match ───
const numFacet = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'nf', name: 'numeric facet heatmap',
  data: { name: 'nf', values: [
    { site: 1, region: 'N', hour: '9', temp: 10 }, { site: 1, region: 'N', hour: '9', temp: 30 },
    { site: 2, region: 'N', hour: '9', temp: 54 }, { site: 2, region: 'N', hour: '9', temp: 94 },
  ]},
  marks: [{ trait: 'MarkRect', encodings: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }),
    color: { ...colorSum },
  }}],
  encoding: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }),
    color: { ...colorSum },
  },
  layout: { trait: 'LayoutFacet', columns: { field: 'site' } },
  a11y: { description: 'temp' },
};
// cells: (N,9,site1)=40, (N,9,site2)=148 → vm 40..148, narrative High 148 Low 40 total 188.
show('E numeric facet values (expect cells 40,148 carrying site:number; panels match non-empty)', numFacet, { echarts: true });

// ─── Probe F: facet LIMIT — 3 facet values, rows.limit=2 → only 2 panels rendered ───
const limited = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'lf', name: 'limited facet heatmap',
  data: { name: 'lf', values: [
    { site: 'A', region: 'N', hour: '9', temp: 10 },
    { site: 'B', region: 'N', hour: '9', temp: 30 },
    { site: 'C', region: 'N', hour: '9', temp: 94 },
  ]},
  marks: [{ trait: 'MarkRect', encodings: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }),
    color: { ...colorSum },
  }}],
  encoding: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }),
    color: { ...colorSum },
  },
  layout: { trait: 'LayoutFacet', columns: { field: 'site', limit: 2 } },
  a11y: { description: 'temp' },
};
// RENDERED panels: site A + site B only (limit 2) → drawn cells 10, 30. Narrative/vm see 10,30,94.
show('F facet limit=2 of 3 (drawn panels A,B → drawn max 30; does narrative/vm claim 94?)', limited, { echarts: true });

// maxPanels variant
const maxed = { ...limited, id: 'mf', layout: { trait: 'LayoutFacet', columns: { field: 'site' }, maxPanels: 2 } };
show('F2 maxPanels=2 of 3 (same question)', maxed, { echarts: true });

// ─── Probe G: locks — plain aggregated [x,y] heatmap + raw heatmap byte-identity ───
const plainAgg = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'pa', name: 'plain agg heatmap',
  data: { name: 'pa', values: [
    { region: 'N', hour: '9', temp: 88 }, { region: 'N', hour: '9', temp: 100 }, { region: 'S', hour: '9', temp: 412 },
  ]},
  marks: [{ trait: 'MarkRect', encodings: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }), color: { ...colorSum },
  }}],
  encoding: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }), color: { ...colorSum },
  },
  a11y: { description: 'temp' },
};
{
  const o = toEChartsOption(plainAgg);
  console.log('\n=== G plain agg heatmap lock: cells', JSON.stringify(o.dataset[0].source), 'keys', o.dataset[0].source.map(r=>Object.keys(r).sort().join(',')));
}
const rawHeat = JSON.parse(JSON.stringify(plainAgg));
delete rawHeat.marks[0].encodings.color.aggregate;
delete rawHeat.encoding.color.aggregate;
rawHeat.id = 'rh';
{
  const o = toEChartsOption(rawHeat);
  console.log('=== G2 raw (no aggregate) heatmap: dataset source IS raw values?', o.dataset[0].source === rawHeat.data.values, 'len', o.dataset[0].source.length);
}

// ─── Probe H: degenerate — count aggregate whose color.field === x.field ───
const degenerate = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'dg', name: 'count-of-x heatmap',
  data: { name: 'dg', values: [
    { hour: '9', day: 'Mon' }, { hour: '9', day: 'Mon' }, { hour: '10', day: 'Mon' },
  ]},
  marks: [{ trait: 'MarkRect', encodings: {
    x: B('hour', 'EncodingX', { scale: 'band' }), y: B('day', 'EncodingY', { scale: 'band' }),
    color: B('hour', 'EncodingColor', { aggregate: 'count' }),
  }}],
  encoding: {
    x: B('hour', 'EncodingX', { scale: 'band' }), y: B('day', 'EncodingY', { scale: 'band' }),
    color: B('hour', 'EncodingColor', { aggregate: 'count' }),
  },
  a11y: { description: 'counts' },
};
show('H degenerate count-of-x (drawn cells (9,Mon)=2,(10,Mon)=1 — what do cells/narrative say?)', degenerate, { echarts: true });
