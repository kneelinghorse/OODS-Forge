import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base=import.meta.dirname, output=path.join(base,'gallery');fs.mkdirSync(output,{recursive:true});
const rows=JSON.parse(fs.readFileSync(path.join(base,'census/viz-observations.json'))).observations;
const images=[];
for(const cell of rows.find(row=>row.chartType==='bubble_map').scopes.filter(cell=>cell.status==='rendered')){
 images.push({id:`bubble-${cell.theme}-${cell.brand}`,label:`bubble_map ${cell.theme}/${cell.brand} · conformant, 3 accuracy rules`,svg:cell.svg});
}
for(const scale of ['area','linear','sqrt']){
 const proof=JSON.parse(fs.readFileSync(path.join(base,`area/${scale}.json`)));
 images.push({id:`size-${scale}`,label:`Actual adapter scale: ${scale} · ${proof.grade.conformant?'conformant':'V169 detected distortion'}`,svg:proof.drawn.svg});
}
for(const trait of ['MarkArea','MarkBar'])for(const axis of ['x','y'])images.push({id:`${trait}-${axis}`,label:`${trait} ${axis}2 · direct ECharts 6 proof (uncertified)`,svg:fs.readFileSync(path.join(base,`bands/${trait}-${axis}.svg`),'utf8')});
const browser=await chromium.connect(process.env.OODS_PLAYWRIGHT_WS_ENDPOINT);assert.equal(browser.version(),'141.0.7390.37');
try{for(const entry of images){
 fs.writeFileSync(path.join(output,entry.id+'.svg'),entry.svg);
 const page=await browser.newPage({viewport:{width:1000,height:620}});
 await page.setContent(`<style>body{margin:0;background:#fff;font:16px system-ui}header{padding:12px}svg{width:100%;height:540px}</style><header>${entry.label}</header>${entry.svg}`);
 await page.screenshot({path:path.join(output,entry.id+'.png')});await page.close();
}}finally{await browser.close();}
fs.writeFileSync(path.join(base,'index.html'),`<!doctype html><meta charset="utf-8"><title>Sprint 199 bubble and band proof</title><style>body{font:16px system-ui;margin:28px;background:#edf0f3;color:#17212b}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(480px,1fr));gap:20px}figure{margin:0;background:white;padding:12px}img{width:100%}</style><h1>Bubble areas and ranged bands</h1><p>The first four cells are public conformant scopes. Scale mutations reproduce the two rejected distortions. Bands use ECharts directly; public Cartesian ECharts remains spec-only and uncertified.</p><main>${images.map(entry=>`<figure><figcaption>${entry.label}</figcaption><a href="gallery/${entry.id}.svg"><img alt="${entry.label}" src="gallery/${entry.id}.png"></a></figure>`).join('')}</main><p>Chromium 141.0.7390.37. Builder self-certification: false.</p>`);
console.log(JSON.stringify({screenshots:images.length,browser:'141.0.7390.37',builderSelfCertified:false}));
