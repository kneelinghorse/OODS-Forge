import fs from 'node:fs';
import path from 'node:path';
import {launchProofBrowser,withStaticServer} from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import {observeFlow} from '../../../../scripts/product-reality/s188-m03-app-consumers.js';
const browser=await launchProofBrowser();try{for(const fw of ['react','vue']){const receipt=JSON.parse(fs.readFileSync(`artifacts/product-reality/sprint-191/m02/packed/Subscription/${fw}/receipt.json`,'utf8'));const page=await browser.newPage();const flow=await withStaticServer(path.join(receipt.consumerRoot,'dist'),url=>observeFlow(page,url,true));fs.writeFileSync(`artifacts/product-reality/sprint-191/m02/subscription-${fw}-recheck.json`,JSON.stringify(flow,null,2));console.log(fw,flow.map(row=>[row.name,row.status,row.error]));await page.close();}}finally{await browser.close();}
