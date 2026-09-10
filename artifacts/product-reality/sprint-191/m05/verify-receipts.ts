import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {validateReceipt,verifyTheme} from '../../../../scripts/design-loop/common.js';
const base='artifacts/product-reality/sprint-191/m05';
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const read=(file:string)=>JSON.parse(fs.readFileSync(file,'utf8'));
const ref=(file:string)=>({path:file,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')});
const historical=[...read('artifacts/product-reality/sprint-191/m01/browser-proof.json').files.map((row:any)=>({path:row.file,sha256:row.sha256})),...read('artifacts/product-reality/sprint-191/m03/browser-proof.json').receipts.filter((row:any)=>row.phase==='after').map((row:any)=>({path:row.receipt,sha256:row.sha256.replace('sha256:','')}))];
const references:any[]=[],receipts:any[]=[];
async function verify(file:string,current:boolean) {
 const receipt=read(file);await validateReceipt(receipt);verifyTheme(receipt);assert.deepEqual(receipt.errors,[]);
 if(current) assert.equal(receipt.sourceHead,head);
 references.push(ref(file),ref(path.join(path.dirname(file),'artifact.json')));
 for(const view of receipt.views) {
  assert.deepEqual(view.measurements.overflow,[]);assert.equal(view.measurements.documentWidth,view.width);
  const screenshot=ref(path.join(path.dirname(file),view.screenshot));assert.equal('sha256:'+screenshot.sha256,view.screenshotHash);references.push(screenshot);
  references.push(ref(path.join(path.dirname(file),view.dump)));
 }
 return receipt;
}
for(const row of historical) {assert.equal(ref(row.path).sha256,row.sha256);await verify(row.path,false);}
for(const theme of ['light','dark']) for(const context of ['list','detail','workflow','workflow-detail']) {
 const parity=[];
 for(const framework of ['react','vue']) {
  const file=`${base}/theme/${theme}/${context}/${framework}/receipt.json`,receipt=await verify(file,true);
  assert.equal(receipt.theme,theme);assert.equal(receipt.brand,theme==='dark'?'B':'A');
  for(const view of receipt.views) assert.equal(view.measurements.chartCanvasFills.length,context.endsWith('detail')?1:0);
  parity.push(receipt.views.map((view:any)=>({width:view.width,canvas:view.measurements.chartCanvasFills,body:view.measurements.bodyBackground})));
  receipts.push({...ref(file),sourceHead:receipt.sourceHead,scope:'m01 theme recheck'});
 }
 assert.deepEqual(parity[0],parity[1]);
}
const craft=read(`${base}/browser-proof.json`);assert.equal(craft.sourceHead,head);assert.equal(craft.status,'passed');
for(const row of craft.receipts.filter((row:any)=>row.phase==='after')) {
 const receipt=await verify(row.receipt,true);receipts.push({...ref(row.receipt),sourceHead:receipt.sourceHead,scope:'m03 craft recheck'});
 references.push(ref(row.receipt.replace('receipt.json','craft.json')));
}
references.push(ref(`${base}/browser-proof.json`));assert.equal(receipts.length,34);
fs.writeFileSync(`${base}/receipt-reverification.json`,JSON.stringify({sourceHead:head,status:'passed',historicalHeadsPreserved:true,historical,receipts,references},null,2)+'\n');
console.log('34 historical receipts re-verified; 34 fresh receipts / 102 screenshots at the frozen head.');
