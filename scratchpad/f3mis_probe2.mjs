import { generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function mk(x,y,values,mark='bar'){const enc={x,y};return {$schema:'https://oods.dev/viz-spec/v1',id:'p',name:'p',data:{name:'d',values},marks:[{trait:mark==='bar'?'MarkBar':'MarkArea',encodings:JSON.parse(JSON.stringify(enc))}],encoding:JSON.parse(JSON.stringify(enc)),a11y:{description:'x'}};}
function run(l,s){console.log('\n=='+l);const ch=resolvePrimaryChannels(s);console.log('ch',JSON.stringify(ch));const n=generateNarrativeSummary(s);console.log('sum',n.summary);console.log('kf',JSON.stringify(n.keyFindings));}

// x=nominal field but with scale linear (arm fires via scale), y unstamped real measure
run('x=cat scale linear / y=sales unstamped', mk(
 {field:'cat',trait:'EncodingX',scale:{type:'linear'}},
 {field:'sales',trait:'EncodingY'},
 [{cat:'A',sales:100},{cat:'B',sales:300},{cat:'C',sales:50}]));

// classic vertical bar: x nominal (no scale), y quant measure -> must be measure=y
run('CTRL vertical: x=month nominal / y=sales quant', mk(
 {field:'month',trait:'EncodingX',type:'nominal'},
 {field:'sales',trait:'EncodingY',type:'quantitative'},
 [{month:'Jan',sales:100},{month:'Feb',sales:300},{month:'Mar',sales:50}]));

// raw horizontal bar that should emit a TOTAL - check total honesty against drawn bar lengths
run('total-check: x=amount quant / y=dept nominal', mk(
 {field:'amount',trait:'EncodingX',type:'quantitative'},
 {field:'dept',trait:'EncodingY',type:'nominal'},
 [{dept:'Eng',amount:40},{dept:'Sales',amount:25},{dept:'Ops',amount:15}]));
