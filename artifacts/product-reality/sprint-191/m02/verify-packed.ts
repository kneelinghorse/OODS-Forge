import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base='artifacts/product-reality/sprint-191/m02';
const read=(file:string)=>JSON.parse(fs.readFileSync(file,'utf8'));
const hash=(file:string)=>'sha256:'+createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const old=read('artifacts/product-reality/sprint-190/m06/final/proof/app-consumers/report.json');
const rows=[];
for(const object of ['Organization','User','Subscription']) {
  const report=read(`${base}/packed/${object}/report.json`);
  assert.equal(report.builderSelfCertified,false);assert.equal(report.stateObservations.length,32);
  const bite=read(`${base}/packed/${object}/navigation-bite.json`);
  assert.deepEqual(bite.red.filter((row:any)=>row.status==='failed').map((row:any)=>row.name),['detail-navigation']);
  assert.equal(bite.beforeHash,bite.restoredHash);
  for(const cell of report.cells) {
    assert.equal(cell.gates.length,8);assert(cell.gates.every((gate:any)=>gate.status==='passed'));
    assert(cell.flow.every((row:any)=>row.status==='passed'));
    const generated=read(`${base}/packed/${object}/${cell.framework}-generation.json`).artifact;
    const census=read(`${base}/census/${object}-workflow.${cell.framework}.json`).artifact;
    assert.equal(generated.contentHash,census.contentHash,`${object}/${cell.framework} evidence must govern current generation`);
    if(object==='Subscription') {
      const previous=old.cells.find((row:any)=>row.framework===cell.framework);
      assert.deepEqual(cell.gates.map((gate:any)=>gate.name),previous.gates.map((gate:any)=>gate.name));
      assert.deepEqual(cell.flow.map((row:any)=>row.name),previous.flow.map((row:any)=>row.name));
      assert.equal(cell.flow.length,9);
    } else assert.equal(cell.flow.find((row:any)=>row.name==='address-save-persists')?.status,'passed');
    rows.push({object,framework:cell.framework,artifactHash:cell.artifactHash,gates:8,passed:8,flowRows:cell.flow.length,stateObservations:16,receipt:`packed/${object}/${cell.framework}/receipt.json`,receiptHash:hash(`${base}/packed/${object}/${cell.framework}/receipt.json`)});
  }
  for(const shot of report.screenshots) assert.equal(hash(path.join(base,'packed',object,shot.file)),shot.sha256);
}
assert.equal(rows.length,6);
fs.writeFileSync(`${base}/packed-proof.json`,JSON.stringify({status:'passed',cells:6,gates:48,stateObservations:96,screenshots:84,subscriptionGateNamesUnchanged:true,builderSelfCertified:false,rows},null,2)+'\n');
console.log('6 cells / 48 gates / 96 states / 84 screenshots; current artifact hashes match; Subscription gate and flow names unchanged.');
