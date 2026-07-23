import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk({mark='bar', x, y, color, values, facet}) {
  const enc = { x, y };
  if (color) enc.color = color;
  const spec = {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
    data: { name: 'd', values },
    marks: [{ trait: mark==='bar'?'MarkBar':mark==='area'?'MarkArea':mark==='point'?'MarkPoint':'MarkLine', encodings: JSON.parse(JSON.stringify(enc)) }],
    encoding: JSON.parse(JSON.stringify(enc)),
    a11y: { description: 'x' },
  };
  if (facet) spec.layout = { trait: 'LayoutFacet', columns: { field: facet } };
  return spec;
}

function run(label, spec) {
  console.log('\n===== ' + label + ' =====');
  try {
    const ch = resolvePrimaryChannels(spec);
    console.log('channels:', JSON.stringify(ch));
    const nar = generateNarrativeSummary(spec);
    console.log('summary:', nar.summary);
    console.log('keyFindings:', JSON.stringify(nar.keyFindings, null, 0));
  } catch (e) { console.log('ERR', e.message); }
}

// C1: VERTICAL bar mis-shaped: x=year stamped quantitative (linear), y=revenue UNSTAMPED (raw numeric, no aggregate)
run('C1 x=year quant / y=revenue unstamped raw (vertical-intent)', mk({
  mark:'bar',
  x:{field:'year', trait:'EncodingX', type:'quantitative', scale:{type:'linear'}},
  y:{field:'revenue', trait:'EncodingY'},
  values:[{year:2020,revenue:100},{year:2021,revenue:250},{year:2022,revenue:400}],
}));

// C2: same but y stamped nominal explicitly
run('C2 x=year quant / y=region nominal', mk({
  mark:'bar',
  x:{field:'year', trait:'EncodingX', type:'quantitative', scale:{type:'linear'}},
  y:{field:'region', trait:'EncodingY', type:'nominal'},
  values:[{year:2020,region:'N'},{year:2021,region:'S'},{year:2022,region:'E'}],
}));

// C3: temporal-x with scale linear (divergence: arm sees quant via scale, renderer sees temporal via type)
run('C3 x=date type temporal + scale linear / y nominal', mk({
  mark:'bar',
  x:{field:'date', trait:'EncodingX', type:'temporal', scale:{type:'linear'}},
  y:{field:'region', trait:'EncodingY', type:'nominal'},
  values:[{date:1,region:'N'},{date:2,region:'S'},{date:3,region:'E'}],
}));

// C4: AREA horizontal raw
run('C4 area x=score quant / y=cat nominal', mk({
  mark:'area',
  x:{field:'score', trait:'EncodingX', type:'quantitative'},
  y:{field:'cat', trait:'EncodingY', type:'nominal'},
  values:[{score:10,cat:'A'},{score:40,cat:'B'},{score:22,cat:'C'}],
}));

// C5: STACKED raw horizontal bar - multiple x per y (color series)
run('C5 stacked: y=region nominal, x=value quant, color=seg', mk({
  mark:'bar',
  x:{field:'value', trait:'EncodingX', type:'quantitative'},
  y:{field:'region', trait:'EncodingY', type:'nominal'},
  color:{field:'seg', trait:'EncodingColor'},
  values:[{region:'N',seg:'a',value:10},{region:'N',seg:'b',value:15},{region:'S',seg:'a',value:20},{region:'S',seg:'b',value:5}],
}));

// C6: x=year quant, y unstamped, BUT y values are the codes and x is truly the category (year) - misfire check on total
run('C6 x=priceIndex quant / y=month unstamped-string', mk({
  mark:'bar',
  x:{field:'priceIndex', trait:'EncodingX', type:'quantitative'},
  y:{field:'month', trait:'EncodingY'},
  values:[{priceIndex:101,month:'Jan'},{priceIndex:103,month:'Feb'},{priceIndex:99,month:'Mar'}],
}));
