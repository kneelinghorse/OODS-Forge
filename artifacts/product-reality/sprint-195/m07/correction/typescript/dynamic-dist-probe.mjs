import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const root='/Users/systemsystems/.codex/worktrees/s195/OODS-Forge';const out='/tmp/oods-s195-ci/typescript-fix';const rows=[];
for(const name of ['s195-certify-profile-receipt.ts','s195-hc-built-receipt.ts','s195-qualify-viz-matrix.ts','s195-viz-matrix.ts']) {
 const sourcePath=`scripts/product-reality/${name}`;
 const source=fs.readFileSync(path.join(root,sourcePath),'utf8');
 const before=fs.readFileSync(path.join(out,name+'.before'),'utf8');
 const original=[...before.matchAll(/import \{ ([^{}]+) \} from ['"]([^'"]+\/dist\/[^'"]+)['"]; /g)];
 const oldPaths=[...before.matchAll(/from ['"]([^'"]+\/dist\/[^'"]+)['"]/g)].map(m=>m[1]);
 const after=[...source.matchAll(/const \{ ([^{}]+) \} = await import\(new URL\('([^']+)', import.meta.url\).href\) as typeof import\('([^']+)'\);/g)];
 assert.deepEqual(after.map(m=>m[2]),oldPaths);
 for(const match of after) {
  const [,bindings,specifier,typeSource]=match;
  assert.equal(typeSource,specifier.replace('/dist/','/src/'));
  const url=new URL(specifier,pathToFileURL(path.join(root,sourcePath)));
  const namespace=await import(url.href);
  for(const binding of bindings.split(',')) {
   const exported=binding.trim().split(':')[0].trim();
   assert.equal(typeof namespace[exported],'function');
   rows.push({source:sourcePath,runtimeModule:path.relative(root,url.pathname),sourceTypeModule:path.normalize(path.join(path.dirname(sourcePath),typeSource)),exported,callable:true,compiledFileSha256:createHash('sha256').update(fs.readFileSync(url)).digest('hex')});
  }
 }
}
assert.equal(rows.length,9);
fs.writeFileSync(path.join(out,'dynamic-dist-probe.json'),JSON.stringify({status:'passed',method:'Import exact original compiled module URLs and inspect actual callable exports; never invoke historical receipt scripts.',rows},null,2)+'\n');
console.log(JSON.stringify({status:'passed',compiledExportBindings:rows.length}));
