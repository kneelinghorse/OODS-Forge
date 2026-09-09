// Bounded s190 adaptation of the retained s189 input checker; s185 owns closeout/audit.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const base='artifacts/product-reality/sprint-190/m06'+(process.argv.includes('--corrective')?'/corrective':''),proof=`${base}/proof`;
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const ref=file=>({path:file,sha256:sha(fs.readFileSync(file))});
const write=(file,value)=>{assert(!fs.existsSync(file),`Evidence exists: ${file}`);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');};
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(process.argv[2]==='compatibility') {
  const original=read(`${proof}/saved-original/report.json`),successor=read(`${proof}/saved-successor/report.json`);
  const oldPath='artifacts/product-reality/sprint-186/m05/reachability/report.json',adoptionPath='artifacts/product-reality/sprint-188/m01/adoption.json';
  const hashes=report=>Object.fromEntries(report.rows.map(row=>[row.schema+'.json',row.input.sha256]));
  assert.deepEqual(hashes(original),hashes(read(oldPath)));const adoption=read(adoptionPath);
  assert.deepEqual(hashes(successor),Object.fromEntries(Object.entries(adoption.after).filter(([file])=>file!=='_index.json')));
  assert.equal(original.reachable,15);assert.equal(successor.reachable,16);
  const liveRoot='/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/.oods/schemas';
  const live=Object.fromEntries(fs.readdirSync(liveRoot).filter(file=>file.endsWith('.json')).sort().map(file=>[file,sha(fs.readFileSync(path.join(liveRoot,file)))]));
  assert.deepEqual(live,adoption.after);
  write(`${proof}/saved-compatibility.json`,{sourceHead:head,originalInputsUnchanged:true,successorInputsUnchanged:true,liveStoreFiles:Object.keys(live).length,changedLiveFiles:0,liveStore:{path:liveRoot,hashes:live},references:[ref(oldPath),ref(adoptionPath)],readOnly:true});
} else if(process.argv[2]==='census') {
  const historical='artifacts/product-reality/sprint-189/m06/corrective-proof/wide-census.json';
  assert(fs.readFileSync(historical).equals(execFileSync('git',['show',`c3a68d5f:${historical}`],{maxBuffer:64*1024*1024})));
  const baseline=read(historical),current=read(`${proof}/component-census/report.json`);
  const rows=current.allRows.map(row=>{
    const before=baseline.rows.find(candidate=>candidate.input.object===row.input.object && candidate.input.context===row.input.context);assert(before);
    const after=read(row.composition.path).schema;const changed=JSON.stringify(before.schema)!==JSON.stringify(after);
    return {input:row.input,changed,beforeHash:sha(JSON.stringify(before.schema)),afterHash:sha(JSON.stringify(after)),composition:row.composition,changes:changed?[{class:'h',mission:'s190-m04',reason:'Bound payment-area chart placement in Subscription/detail; workflow contains that detail screen.'}]:[]};
  });
  const changedSchemas=rows.filter(row=>row.changed && row.input.context!=='workflow').map(row=>`${row.input.object}/${row.input.context}`);
  assert.deepEqual(changedSchemas,['Subscription/detail']);
  assert(rows.filter(row=>row.changed).every(row=>row.input.object==='Subscription' && ['detail','workflow'].includes(row.input.context)));
  write(`${proof}/schema-movement.json`,{head,base:'c3a68d5f',class:'h',changedSchemas,unchangedDefaultSchemas:65,fullPopulationChanged:rows.filter(row=>row.changed).map(row=>`${row.input.object}/${row.input.context}`),baseline:ref(historical),rows});
} else if(process.argv[2]==='browser') {
  const receipts=[];
  for(const theme of ['light','dark']) for(const framework of ['react','vue']) {
    const file=`${base}/after/${theme}/${framework}/receipt.json`;const receipt=read(file);assert.equal(receipt.sourceHead,head);assert.deepEqual(receipt.errors,[]);
    receipts.push({...ref(file),theme,framework});
  }
  write(`${proof}/browser-receipts.json`,{sourceHead:head,receipts,comparisons:['light','dark'].map(theme=>ref(`${base}/after/${theme}/browser-comparison.json`))});
} else if(process.argv[2]==='handoff') {
  const movers=read(`${proof}/movers/sprint-wide-movers.json`);assert.equal(movers.status,'passed');assert.equal(movers.s190.head,head);
  const draft=`PREPARED ONLY — Sprint 191 m01 delivery; no send or primary restart in s190-m06.\nFrozen implementation: ${head}\nVendored consumers dashboard-demos and forge-demos must build/vendor this SHA after review.\n\nviz.render now returns SVG for all13 types through the shared renderer; dashboard.render draws all11 admitted types. Chord and flow_map remain excluded from dashboard panels under #881 (see VIZ_RECIPES registry), while their direct viz.render SVG is available. theme light|dark and brand A|B select scoped CSS values; default is light/A. HC tokens are exported but HC pixels are deferred. The flat cssVariables export remains byte-identical.\n\nartifact.certify takes the same scope, retains a per-call contrastResults row and names accuracyRules. Several dark categorical charts fail contrast: keep the actual result. Coverage remains5 certified/8 uncertified with conformant:null on the latter. Subscription/detail places a static sample-payment SVG in HTML, React and Vue. Workflow records receive seeded SVGs; editing payment form values does not regenerate them.\n\nRegistry: packages/viz-core/src/registry/viz-recipes.v1.json\nAll changed advertised/public paths from ${movers.s190.base}..${head}:\n${movers.s190.publicPaths.join('\n')}\n\nReconnect after the reviewed delivery so clients receive updated descriptions and schemas.\n`;
  write(`${proof}/reconnect/notice-plan.json`,{status:'prepared-unsent',sent:false,deliverySprint:'sprint-191',implementationHead:head,targets:['cmos-dashboard','dashboard-demos','forge-demos','aquex-mcp'],vendoredConsumers:['dashboard-demos','forge-demos'],draft});
  write(`${proof}/reconnect/deliveries.json`,[]);
} else throw new Error('Use compatibility, census, browser or handoff.');
console.log(`${process.argv[2]} passed at ${head}`);
