import { toVegaLiteSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const rows = [];
const push = (x,y,g,k)=>{for(let i=0;i<k;i++)rows.push({x,y,seg:g});};
push(1,10,'A',1);push(2,-1,'A',100);push(3,0,'A',100);
push(4,30,'B',1);push(5,19,'B',100);push(6,20,'B',100);
const spec = {
  $schema:'https://oods.dev/viz-spec/v1', id:'corr-asym', name:'corr asym',
  data:{name:'c', values:rows},
  marks:[{trait:'MarkPoint', encodings:{
    x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    color:{field:'seg',trait:'EncodingColor'},
  }}],
  encoding:{
    x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    color:{field:'seg',trait:'EncodingColor'},
  },
  a11y:{description:'y over x'},
};
const vl = toVegaLiteSpec(spec);
console.log(JSON.stringify(vl.encoding, null, 2));
console.log("transform:", JSON.stringify(vl.transform));
console.log("mark:", JSON.stringify(vl.mark));
