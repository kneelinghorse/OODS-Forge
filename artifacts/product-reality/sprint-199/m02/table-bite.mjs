import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
const root=process.cwd(), out=resolve(import.meta.dirname,'table-bite');
const registry='packages/viz-core/src/registry/viz-recipes.v1.json';
const scratch=mkdtempSync(join(tmpdir(),'s199-table-bite-'));
mkdirSync(out,{recursive:true});
try {
  for(const file of [registry,'packages/mcp-server/src/schemas','packages/mcp-server/src/tools/registry.json','packages/mcp-adapter/tool-descriptions.json']) {
    mkdirSync(dirname(join(scratch,file)),{recursive:true}); cpSync(join(root,file),join(scratch,file),{recursive:true});
  }
  const file=join(scratch,registry), original=readFileSync(file,'utf8'), rows=JSON.parse(original);
  const row=rows.find(row=>row.renderScopes.some(scope=>scope.status==='typed-deferred'));
  const scope=row.renderScopes.find(scope=>scope.status==='typed-deferred');
  const code=scope.errors[0].code; delete scope.errors[0].code;
  writeFileSync(file,JSON.stringify(rows,null,2)+'\n');
  const run=()=>spawnSync(process.execPath,['--import','tsx','scripts/docs/generate-api-reference.ts'],{cwd:root,encoding:'utf8',env:{...process.env,OODS_API_DOCS_ROOT:scratch}});
  const red=run(); writeFileSync(join(out,'red.log'),red.stdout+red.stderr);
  assert.notEqual(red.status,0); assert.match(red.stderr,/deferred scope requires an error code/);
  writeFileSync(file,original); const green=run();writeFileSync(join(out,'green.log'),green.stdout+green.stderr);assert.equal(green.status,0);
  writeFileSync(join(out,'receipt.json'),JSON.stringify({status:'passed',mutation:{chartType:row.chartType,theme:scope.theme,brand:scope.brand,removedCode:code},redExit:red.status,restoredExit:green.status,liveRegistryUnchanged:readFileSync(join(root,registry),'utf8')===original},null,2)+'\n');
} finally {rmSync(scratch,{recursive:true,force:true});}
