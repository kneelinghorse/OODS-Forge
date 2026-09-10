import fs from 'node:fs';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { observeFlow } from '../../../../scripts/product-reality/s188-m03-app-consumers.js';
const object=process.argv[2] ?? 'Organization';
const browser=await launchProofBrowser();
try {for (const [framework,port] of [['react',4478],['vue',4479]] as const) {const page=await browser.newPage(); const rows=await observeFlow(page,`http://127.0.0.1:${port}`,false,object,object==='Organization'?'label':'name'); fs.writeFileSync(`artifacts/product-reality/sprint-191/m02/probe-${object}-${framework}.json`,JSON.stringify(rows,null,2)); console.log(framework,rows.map(row=>[row.name,row.status,row.error]));await page.close();}}finally{await browser.close();}
