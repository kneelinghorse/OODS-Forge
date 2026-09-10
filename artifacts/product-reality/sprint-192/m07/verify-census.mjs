import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base='artifacts/product-reality/sprint-192/m07';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const after=read(`${base}/component-census/report.json`);
const before=read('artifacts/product-reality/sprint-191/m05/component-census/report.json');
const m05=read('artifacts/product-reality/sprint-192/m05/component-census-final/report.json');
const known=read('artifacts/product-reality/sprint-192/m05/census-diff.json');
const key=row=>`${row.input.object}/${row.input.context}`;
const changed=[];
assert.equal(after.greenTotalSchemas,77);assert.equal(after.greenTotalCells,154);
for(const row of after.allRows) {
 const old=before.allRows.find(prior=>key(prior)===key(row)),reviewed=m05.allRows.find(prior=>key(prior)===key(row));assert(old&&reviewed);
 const schema=read(row.composition.path).schema;
 assert.deepEqual(schema,read(reviewed.composition.path).schema,`${key(row)} moved beyond m05`);
 assert(row.cells.every(cell=>cell.errors.length===0));
 if(JSON.stringify(schema)!==JSON.stringify(read(old.composition.path).schema)) {
  const attribution=known.rows.find(prior=>key(prior)===key(row));assert(attribution,`unattributed schema ${key(row)}`);
  changed.push({...attribution,beforeSha256:hash(JSON.stringify(read(old.composition.path).schema)),afterSha256:hash(JSON.stringify(schema))});
 }
}
assert.equal(changed.length,14);
const classes=Object.fromEntries([...new Set(changed.map(row=>row.class))].map(name=>[name,changed.filter(row=>row.class===name).length]));
fs.writeFileSync(`${base}/schema-movement.json`,JSON.stringify({head:after.head,baseline:before.head,changedSchemas:changed.length,unchangedSchemas:77-changed.length,classes,rows:changed,unattributedChanges:[]},null,2)+'\n');
const original=read(`${base}/saved-original/report.json`),successor=read(`${base}/saved-successor/report.json`);
const hashes=report=>Object.fromEntries(report.rows.map(row=>[row.schema+'.json',row.input.sha256]));
assert.deepEqual(hashes(original),hashes(read('artifacts/product-reality/sprint-186/m05/reachability/report.json')));
const adoption=read('artifacts/product-reality/sprint-188/m01/adoption.json');assert.deepEqual(hashes(successor),Object.fromEntries(Object.entries(adoption.after).filter(([file])=>file!=='_index.json')));
assert.equal(original.reachable,15);assert.equal(successor.reachable,16);
const liveRoot='/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/.oods/schemas';
const live=Object.fromEntries(fs.readdirSync(liveRoot).filter(file=>file.endsWith('.json')).sort().map(file=>[file,hash(fs.readFileSync(path.join(liveRoot,file)))]));assert.deepEqual(live,adoption.after);
fs.writeFileSync(`${base}/saved-compatibility.json`,JSON.stringify({sourceHead:after.head,originalInputsUnchanged:true,successorInputsUnchanged:true,liveStoreFiles:Object.keys(live).length,changedLiveFiles:0,liveStore:{path:liveRoot,hashes:live},readOnly:true},null,2)+'\n');
console.log('77/77 schemas,154/154 generation cells;14 attributed schema movements; original15/16,successor16/16,17 unchanged live hashes.');
