import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { packFoundationPackages } from '../../../../scripts/product-reality/s182-m04-consumer-harness.mjs';
import { runAppConsumers } from '../../../../scripts/product-reality/s188-m03-app-consumers.js';
const base=path.resolve('artifacts/product-reality/sprint-191/m02');
// One unchanged foundation pack is installed independently by all six cells.
const packages=await packFoundationPackages(path.join(base,'packed'));
const reports=[];
for(const object of ['Organization','User','Subscription']) {
  const report=await runAppConsumers(path.join(base,'packed',object),'s191-m02',object,packages);
  reports.push(report);
  await fs.writeFile(path.join(base,'packed-report.json'),JSON.stringify({builderSelfCertified:false,reports},null,2)+'\n');
  assert(report.cells.every(cell=>(cell.gates as Array<{status:string}>).every(gate=>gate.status==='passed')),`${object} has a failed packed gate`);
}
assert.equal(reports.flatMap(report=>report.cells).length,6);
console.log('Six packed consumer cells passed all eight gates.');
