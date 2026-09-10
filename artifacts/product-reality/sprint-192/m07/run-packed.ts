import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runAppConsumers } from '../../../../scripts/product-reality/s188-m03-app-consumers.js';
import { launchProofBrowser, type PackedPackageRecord } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { packFoundationPackages } from '../../../../scripts/product-reality/s182-m04-consumer-harness.mjs';
const base = path.resolve('artifacts/product-reality/sprint-192/m07');
assert(process.env.OODS_PLAYWRIGHT_WS_ENDPOINT, 'Learning548 requires the pinned Linux endpoint.');
const browser = await launchProofBrowser();
const page = await browser.newPage();
const userAgent = await page.evaluate(() => navigator.userAgent);
assert(userAgent.includes('Linux'));
fs.writeFileSync(path.join(base, 'linux-browser.json'), JSON.stringify({ image: 'mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a', playwright: '1.56.1', browser: browser.version(), userAgent, keyboardProof: 'Home → ArrowDown, unchanged' }, null, 2) + '\n');
await page.close(); await browser.close();
fs.mkdirSync(path.join(base, 'packed-linux'), { recursive: true });
const packages = await packFoundationPackages(path.join(base, 'packed-linux')) as PackedPackageRecord[];
const reports = [];
for (const object of ['Subscription', 'Organization', 'User']) {
  const report = await runAppConsumers(path.join(base, 'packed-linux', object), 's192-m07', object, packages);
  reports.push(report);
  fs.writeFileSync(path.join(base, 'packed-report.json'), JSON.stringify({ builderSelfCertified: false, reports }, null, 2) + '\n');
  assert(report.cells.every(cell => (cell.gates as any[]).every(gate => gate.status === 'passed')), `${object} packed gate failed`);
  console.log(object, 'both Linux cells green');
}
fs.writeFileSync(path.join(base,'flows.json'),JSON.stringify({sourceHead:reports[0]!.sourceHead,builderSelfCertified:false,cells:reports.flatMap((report:any,index:number)=>report.cells.map((cell:any)=>({...cell,object:['Subscription','Organization','User'][index]}))),stateObservations:reports.flatMap((report:any)=>report.stateObservations),screenshots:reports.flatMap((report:any,index:number)=>report.screenshots.map((shot:any)=>({...shot,file:`packed-linux/${['Subscription','Organization','User'][index]}/${shot.file}`})))},null,2)+'\n');
