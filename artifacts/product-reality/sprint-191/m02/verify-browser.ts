import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { validateReceipt, verifyTheme } from '../../../../scripts/design-loop/common.js';
const base='artifacts/product-reality/sprint-191/m02';
const hash=(bytes:string|Buffer)=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
const receipts=[],parity=[];
for(const object of ['Organization','User']) for(const context of ['list','detail','form','timeline']) {
  const observations=[];
  for(const framework of ['react','vue']) {
    const file=`${base}/browser/${object}/${context}/${framework}/receipt.json`;
    const receipt=JSON.parse(fs.readFileSync(file,'utf8'));await validateReceipt(receipt);verifyTheme(receipt);
    assert.equal(receipt.theme,'light');assert.equal(receipt.brand,'A');assert.deepEqual(receipt.errors,[]);
    assert.deepEqual(receipt.views.map((view:any)=>view.width),[390,820,1440]);
    for(const view of receipt.views) {
      assert.deepEqual(view.measurements.overflow,[]);assert.equal(view.measurements.documentWidth,view.width);
      assert.equal(hash(fs.readFileSync(path.join(path.dirname(file),view.screenshot))),view.screenshotHash);
      if(context==='form') {
        for(const [name,value] of Object.entries({Street:'100 Main Street',City:'Springfield',Region:'IL','Postal Code':'62701'})) {
          assert.equal(view.values.find((entry:any)=>entry.name===name)?.value,value,`${object}/${framework}/${view.width} seeded ${name}`);
        }
      }
    }
    observations.push(receipt.views.map((view:any)=>({width:view.width,bodyBackground:view.measurements.bodyBackground,chartCanvasFills:view.measurements.chartCanvasFills,overflow:view.measurements.overflow,values:view.values.map(({name,value,checked}:any)=>({name,value,checked}))})));
    receipts.push({object,context,framework,file,sha256:hash(fs.readFileSync(file)),artifactHash:receipt.artifactContentHash,sourceHead:receipt.sourceHead});
  }
  assert.deepEqual(observations[0],observations[1],`${object}/${context} computed control/canvas/layout parity`);
  parity.push({object,context,differences:[]});
}
const report={status:'passed',receipts:receipts.length,screenshots:receipts.length*3,errors:0,overflow:0,allowlist:[],parity,files:receipts,scope:'Computed form-control values, canvas colors, viewport bounds and errors. DOM/visual craft differences remain assigned to m03; no claim of whole-page visual equality.'};
fs.writeFileSync(`${base}/browser-proof.json`,JSON.stringify(report,null,2)+'\n');
console.log('16 receipts / 48 screenshots; seeded addresses visible; zero errors, overflow or computed control/canvas/layout parity differences.');
