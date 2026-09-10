import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base='artifacts/product-reality/sprint-191/m05';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const before=read('artifacts/product-reality/sprint-190/m06/final/proof/component-census/report.json'),after=read(`${base}/component-census/report.json`);
const key=row=>`${row.input.object}/${row.input.context}`;
const changes=[],statusChanges=[];
assert.equal(after.greenTotalSchemas,77);assert.equal(after.greenTotalCells,154);
for(const row of after.allRows) {
 const old=before.allRows.find(prior=>key(prior)===key(row));assert(old);
 if(old.green!==row.green) statusChanges.push(key(row));
 for(const cell of row.cells) {
  const previous=old.cells.find(candidate=>candidate.framework===cell.framework);
  const first=read(previous.response.path).artifact,last=read(cell.response.path).artifact;
  if(first?.contentHash===last?.contentHash) continue;
  const files=last.files.filter(file=>!first?.files.some(old=>old.path===file.path&&old.contentHash===file.contentHash)).map(file=>({file:file.path,beforeSha256:first?.files.find(old=>old.path===file.path)?.contentHash??null,afterSha256:file.contentHash}));
  changes.push({schema:key(row),framework:cell.framework,beforeArtifact:first?.contentHash??null,afterArtifact:last.contentHash,files});
 }
}
assert.deepEqual(statusChanges.sort(),['Organization/workflow','User/workflow']);
const workflowCells=after.allRows.filter(row=>row.input.context==='workflow'&&['Subscription','Organization','User'].includes(row.input.object)).flatMap(row=>row.cells).filter(row=>row.status==='ok').length;assert.equal(workflowCells,6);
const original=read(`${base}/saved-original/report.json`),successor=read(`${base}/saved-successor/report.json`);
const hashes=report=>Object.fromEntries(report.rows.map(row=>[row.schema+'.json',row.input.sha256]));
assert.deepEqual(hashes(original),hashes(read('artifacts/product-reality/sprint-186/m05/reachability/report.json')));
const adoption=read('artifacts/product-reality/sprint-188/m01/adoption.json');assert.deepEqual(hashes(successor),Object.fromEntries(Object.entries(adoption.after).filter(([file])=>file!=='_index.json')));
assert.equal(original.reachable,15);assert.equal(successor.reachable,16);
const liveRoot='/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/.oods/schemas';
const live=Object.fromEntries(fs.readdirSync(liveRoot).filter(file=>file.endsWith('.json')).sort().map(file=>[file,hash(fs.readFileSync(path.join(liveRoot,file)))]));assert.deepEqual(live,adoption.after);
fs.writeFileSync(`${base}/saved-compatibility.json`,JSON.stringify({sourceHead:after.head,originalInputsUnchanged:true,successorInputsUnchanged:true,liveStoreFiles:Object.keys(live).length,changedLiveFiles:0,liveStore:{path:liveRoot,hashes:live},readOnly:true},null,2)+'\n');
fs.writeFileSync(`${base}/schema-movement-observed.json`,JSON.stringify({head:after.head,statusChanges,workflowCells,changes},null,2)+'\n');
console.log(`77/77,154/154; workflows ${workflowCells}/6; ${changes.length} changed framework artifacts for attribution; original15/16, successor16/16, 17 live hashes unchanged.`);
