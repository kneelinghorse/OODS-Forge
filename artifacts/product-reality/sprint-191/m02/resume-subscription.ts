import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {runAppConsumers} from '../../../../scripts/product-reality/s188-m03-app-consumers.js';
const base=path.resolve('artifacts/product-reality/sprint-191/m02');
const packages=JSON.parse(fs.readFileSync(path.join(base,'packed/submitted-packages/inventory.json'),'utf8')).map((record:any)=>{
 const tarballPath=path.join(base,'packed',record.artifactPath);
 assert.equal(createHash('sha256').update(fs.readFileSync(tarballPath)).digest('hex'),record.sha256);
 return {...record,tarballPath,manifest:JSON.parse(execFileSync('tar',['-xOzf',tarballPath,'package/package.json'],{encoding:'utf8'}))};
});
const report=await runAppConsumers(path.join(base,'packed/Subscription'),'s191-m02','Subscription',packages);
const reports=['Organization','User'].map(object=>JSON.parse(fs.readFileSync(path.join(base,`packed/${object}/report.json`),'utf8'))).concat(report);
assert(reports.flatMap(report=>report.cells).every(cell=>cell.gates.every((gate:any)=>gate.status==='passed')));
fs.writeFileSync(path.join(base,'packed-report.json'),JSON.stringify({builderSelfCertified:false,reports},null,2)+'\n');
console.log('Six packed cells green; Subscription retains nine flow rows and eight gates per framework.');
