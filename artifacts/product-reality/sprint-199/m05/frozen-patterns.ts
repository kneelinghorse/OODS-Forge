import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { handle as render } from '../../../../packages/mcp-server/src/tools/viz.render.js';
const registry=JSON.parse(execFileSync('git',['show','b7a96ab0f:packages/viz-core/src/registry/viz-patterns.v1.json'],{encoding:'utf8'}));
const rows=[];
for(const pattern of registry.filter((row:any)=>row.publicSvg)){
 const source=`examples/viz/patterns-v2/${pattern.id.split(':').at(-1)}.spec.json`;
 const old=execFileSync('git',['show',`b7a96ab0f:${source}`]);
 assert.deepEqual(readFileSync(source),old,'Original authored pattern source moved');
 for(const scope of pattern.scopes){
  const result=await render({pattern:pattern.id,brand:scope.brand,theme:scope.theme,output:{svg:true}});
  assert.equal(result.status,'ok');assert.equal(result.svgHash,scope.svgHash,pattern.id);
  rows.push({id:pattern.id,brand:scope.brand,theme:scope.theme,sourceHash:createHash('sha256').update(old).digest('hex'),svgHash:result.svgHash});
 }
}
const sealed=[195,196,197,198].map(n=>`artifacts/product-reality/sprint-${n}`);
assert.equal(execFileSync('git',['diff','b7a96ab0f','--name-only','--',...sealed],{encoding:'utf8'}),'');
assert.equal(execFileSync('git',['ls-files','--others','--exclude-standard','--',...sealed],{encoding:'utf8'}),'');
writeFileSync(new URL('./preservation.json',import.meta.url),JSON.stringify({baseline:'b7a96ab0f',sourceCount:8,scopeCount:rows.length,sealedUnchanged:sealed,rows},null,2)+'\n');
console.log('8 sources and 32 actual public SVGs match b7a96ab0f; sealed s195–s198 unchanged.');
