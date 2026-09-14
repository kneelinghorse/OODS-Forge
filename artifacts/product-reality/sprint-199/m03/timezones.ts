import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { measurePatternCensus } from '../../../../scripts/product-reality/s195-pattern-census.js';
const args=process.argv.slice(2);
if(args[0]==='compare') {
 const left=JSON.parse(readFileSync(args[1],'utf8')),right=JSON.parse(readFileSync(args[2],'utf8'));
 assert.equal(left.timezone,'UTC');assert.equal(right.timezone,'America/Chicago');assert.equal(left.cells.length,92);assert.equal(right.cells.length,92);
 const rows=left.cells.map((cell:any,index:number)=>{
  const other=right.cells[index];assert.deepEqual(cell.request,other.request);
  assert.equal(cell.rendered.status,other.rendered.status);assert.deepEqual(cell.rendered.errors,other.rendered.errors);
  if(cell.rendered.status==='ok') {assert.equal(cell.rendered.svg,other.rendered.svg);assert.deepEqual(cell.rendered.normalizedSpec,other.rendered.normalizedSpec);assert.equal(cell.certified.conformant,true);assert.equal(other.certified.conformant,true);}
  return {id:cell.id,theme:cell.request.theme,brand:cell.request.brand,status:cell.rendered.status,svgEqual:cell.rendered.status==='ok'?true:null,svgHash:cell.rendered.svgHash};
 });
 writeFileSync(args[3],JSON.stringify({status:'passed',cells:rows.length,svgEqual:rows.filter((r:any)=>r.svgEqual).length,retired:rows.filter((r:any)=>!r.svgEqual).length,rows},null,2)+'\n');
} else {
 assert(['UTC','America/Chicago'].includes(process.env.TZ??''));const output=resolve(args[0]);mkdirSync(dirname(output),{recursive:true});
 const census=await measurePatternCensus();writeFileSync(output,JSON.stringify({...census,timezone:process.env.TZ},null,2)+'\n');
}
