import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
const base=import.meta.dirname, output=path.join(base,'gallery');fs.mkdirSync(output,{recursive:true});
const cells=JSON.parse(fs.readFileSync(path.join(base,'patterns/pattern-observations.json'))).cells;
const old=new Set(['simple-bar','stacked-bar','stacked-100-bar','diverging-bar','running-total-area','correlation-scatter','time-grid-heatmap','correlation-matrix']);
const esc=x=>x.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const figures=[];const browser=await chromium.connect(process.env.OODS_PLAYWRIGHT_WS_ENDPOINT);const screenshots=[];
assert.equal(browser.version(),'141.0.7390.37');
try {
 for(const cell of cells){
  const name=cell.id.split(':').at(-1), scope=`${cell.request.theme}-${cell.request.brand}`,file=`${name}-${scope}.svg`;
  if(cell.rendered.status!=='ok')continue;
  const svg=cell.rendered.svg;assert(!svg.includes('[object Object]'));
  fs.writeFileSync(path.join(output,file),svg);
  figures.push(`<figure data-scope="${scope}"><figcaption>${esc(name)} · ${scope} · conformant</figcaption><a href="gallery/${file}"><img alt="${esc(cell.rendered.a11yDescription)}" src="gallery/${file}"></a></figure>`);
  if(!old.has(name)&&scope==='light-A') {
   const page=await browser.newPage({viewport:{width:1440,height:1000}});
   await page.setContent(`<style>body{margin:0;padding:16px;background:white}svg{width:100%;height:auto;max-height:968px}</style>${svg}`);
   await page.screenshot({path:path.join(output,`${name}.png`)});await page.close();
   screenshots.push({id:cell.id,file:`gallery/${name}.png`,svgSha256:createHash('sha256').update(svg).digest('hex')});
  }
 }
}finally{await browser.close();}
const retired=cells.filter(c=>c.rendered.status==='error'&&c.request.theme==='light'&&c.request.brand==='A').map(c=>`<li>${esc(c.id)}: ${esc(c.rendered.errors[0].message)}</li>`).join('');
fs.writeFileSync(path.join(base,'index.html'),`<!doctype html><meta charset="utf-8"><title>Sprint 199 pattern gallery</title><style>body{font:16px system-ui;margin:32px;color:#172127;background:#f3f5f6}h1{font-size:28px}select{font:inherit;padding:6px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(450px,1fr));gap:24px}figure{margin:0;background:white;padding:16px;border-radius:8px}figcaption{font-weight:600;margin-bottom:12px}img{width:100%;height:380px;object-fit:contain}figure[hidden]{display:none}</style><h1>22 public patterns · 88 conformant scopes</h1><p>All SVGs below are exact public-handler output. Click to inspect full size. Static images show the default selection state.</p><label>Scope <select id="scope">${['light-A','light-B','dark-A','dark-B'].map(s=>`<option>${s}</option>`).join('')}</select></label><main>${figures.join('')}</main><h2>Retired</h2><ul>${retired}</ul><p>Builder self-certification: false. Independent review pending.</p><script>function filter(){document.querySelectorAll('figure').forEach(f=>f.hidden=f.dataset.scope!==scope.value)}scope.onchange=filter;filter();</script>`);
fs.writeFileSync(path.join(base,'gallery-receipt.json'),JSON.stringify({browser:'Chromium 141.0.7390.37',svgCells:figures.length,screenshots,builderSelfCertified:false},null,2)+'\n');
