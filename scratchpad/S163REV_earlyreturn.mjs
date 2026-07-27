// ADVERSARIAL earlyreturn-lens reproduction against the FRESH dist @ HEAD ae6c0dc.
// Lens: the partitionFields.length===0 EARLY RETURN (deriveCorrelation :1425-1426) -> pooled narrated
// with NO direction gate. The DISCLOSED residual = "a Simpson carried ENTIRELY on quantitative retinal
// channel(s) (size and/or a quantitative color-ramp) with NO categorical/facet partition".
// GOAL: (1) prove the residual is REAL live (not a bluff), (2) hunt a LEAK beyond the disclosed boundary
// (a phantom WITH a categorical partition, or the fix failing to re-absorb a quant channel),
// (3) probe opacity/strokeWidth/multi-quant-retinal, (4) test the "shred to n=1" rationale.
import {
  analyzeVizSpec,
  generateNarrativeSummary,
  resolvePrimaryChannels,
} from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
// off-barrel diagnostics (correlationClassifierActualKey etc.) are NOT exported from the bundled
// barrel; hand-derive partitionFields instead: categorical (non-quantitative) color/detail/shape
// + facet fields, minus dim/measure. size + quant-color/quant-detail are SKIPPED (the disclosed gap).

function pearson(pairs){
  const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}
const mk=(enc,rows,id)=>({ $schema:'https://oods.dev/viz-spec/v1', id, name:id,
  data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} });

// hand-derive partitionFields the SUT would compute (categorical retinal + facet, minus dim/measure).
function handPartitionFields(enc, dim, measure){
  const out=[];
  for (const ch of ['color','shape','detail']){
    const b=enc[ch];
    if (!b || !b.field) continue;
    if (b.type==='quantitative') continue;          // bindingIsQuantitative -> skipped
    if (b.field===dim || b.field===measure) continue;
    if (!out.includes(b.field)) out.push(b.field);
  }
  return out; // facets not used in these fixtures
}

function report(label, spec, oracleGroups){
  const a=analyzeVizSpec(spec);
  const {summary,keyFindings}=generateNarrativeSummary(spec);
  console.log('\n================= '+label+' =================');
  const pf=handPartitionFields(spec.encoding,'x','y');
  console.log('hand partitionFields:', JSON.stringify(pf), pf.length===0?'-> EARLY RETURN (no gate)':'-> gate ACTIVE');
  console.log('SUT analysis.correlation:', a.correlation);
  const corrFinding = (keyFindings||[]).find(f=>/correlat/i.test(JSON.stringify(f)));
  console.log('SUT correlation keyFinding:', corrFinding?JSON.stringify(corrFinding):'(none)');
  if (/correlat/i.test(summary)) console.log('SUT summary mentions correlation:', summary);
  if (oracleGroups){
    for (const [gl,pairs] of Object.entries(oracleGroups)){
      console.log(`  hand-oracle group ${gl} pearson (DRAWN sub-cells):`, pearson(pairs)?.toFixed(4));
    }
  }
  return a.correlation;
}

// ---------- E1: SIZE-ONLY Simpson, 2 discrete size bands, each FALLS, pool RISES, y=avg (declared agg).
// No color/detail/facet -> partitionFields = [] -> EARLY RETURN. This is the disclosed residual.
{
  const rows=[];
  const push=(x,y,sz)=>rows.push({x,y,sz});
  // band sz=10 : x 1..3 falling ; band sz=20 : x 4..6 falling ; pooled over all 6 RISES
  push(1,120,10); push(2,90,10); push(3,60,10);
  push(4,220,20); push(5,190,20); push(6,160,20);
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
              size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  report('E1 size-only Simpson (disclosed residual)', mk(enc,rows,'e1'),
    { 'sz=10':[[1,120],[2,90],[3,60]], 'sz=20':[[4,220],[5,190],[6,160]] });
  console.log('  hand pooled over all 6 drawn cells:', pearson(rows.map(r=>[r.x,r.y]))?.toFixed(4), '<- what SUT narrates');
}

// ---------- E2: QUANTITATIVE COLOR-RAMP Simpson (color type:quantitative), 2 color bands each FALLS.
{
  const rows=[];
  const push=(x,y,c)=>rows.push({x,y,c});
  push(1,120,0.1); push(2,90,0.1); push(3,60,0.1);
  push(4,220,0.9); push(5,190,0.9); push(6,160,0.9);
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
              color:{field:'c',trait:'EncodingColor',type:'quantitative'} };
  report('E2 quant color-ramp Simpson (disclosed residual)', mk(enc,rows,'e2'),
    { 'c=.1':[[1,120],[2,90],[3,60]], 'c=.9':[[4,220],[5,190],[6,160]] });
}

// ---------- E3: MULTIPLE simultaneous quant retinal (size + quant color together).
{
  const rows=[];
  const push=(x,y,sz,c)=>rows.push({x,y,sz,c});
  push(1,120,10,0.1); push(2,90,10,0.1); push(3,60,10,0.1);
  push(4,220,20,0.9); push(5,190,20,0.9); push(6,160,20,0.9);
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
              size:{field:'sz',trait:'EncodingSize',type:'quantitative'},
              color:{field:'c',trait:'EncodingColor',type:'quantitative'} };
  report('E3 size+quant-color (multi quant retinal)', mk(enc,rows,'e3'));
}

// ---------- E4: opacity / strokeWidth probe — are they valid encoding channels at all?
{
  const rows=[{x:1,y:120,o:10},{x:2,y:90,o:10},{x:3,y:60,o:10},{x:4,y:220,o:20},{x:5,y:190,o:20},{x:6,y:160,o:20}];
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
              opacity:{field:'o',trait:'EncodingOpacity',type:'quantitative'} };
  const a=analyzeVizSpec(mk(enc,rows,'e4'));
  console.log('\n================= E4 opacity channel (not in EncodingMap) =================');
  console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(mk(enc,rows,'e4'))));
  console.log('SUT correlation:', a.correlation, '(opacity is NOT a modeled channel -> equals a no-retinal scatter)');
}

// ---------- CONTROL C1: same size Simpson but WITH a categorical color partition -> gate MUST fire (s163 fix).
{
  const rows=[];
  const push=(x,y,sz,seg)=>rows.push({x,y,sz,seg});
  push(1,120,10,'A'); push(2,90,10,'A'); push(3,60,10,'A');
  push(4,220,20,'B'); push(5,190,20,'B'); push(6,160,20,'B');
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
              size:{field:'sz',trait:'EncodingSize',type:'quantitative'},
              color:{field:'seg',trait:'EncodingColor'} };  // categorical
  const c=report('C1 size Simpson + CATEGORICAL color (gate active, s163 must suppress)', mk(enc,rows,'c1'));
  console.log('  EXPECT undefined (partition={seg}, grouping absorbs sz):', c===undefined?'SUPPRESSED (correct)':'NARRATED ***LEAK***');
}

// ---------- PROBE P1: the "shred to n=1" rationale — would partitioning by the BANDED size give n=1 groups?
// (rationale check only — we cannot force the SUT to partition by size; we hand-show the band has n=3.)
console.log('\n================= P1 rationale check =================');
console.log('E1 size band sz=10 has 3 x-points (n=3, NOT n=1); sz=20 has 3. The "shred to n=1" rationale');
console.log('holds only for CONTINUOUS all-distinct sizes; for BANDED repeated sizes the groups are n>1.');
