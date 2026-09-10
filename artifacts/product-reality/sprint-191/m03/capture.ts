import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {render} from '../../../../scripts/design-loop/render.js';
import {applySteps} from '../../../../scripts/design-loop/observe.js';
import {launchProofBrowser} from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const phase=process.argv[2] ?? 'before';
if(!['before','after'].includes(phase)) throw new Error('Expected before or after');
const base=path.resolve('artifacts/product-reality/sprint-191/m03');
const scenarios=['list','detail','form','timeline','workflow','archived','review-detail','review-form','review-timeline'];
const browser=await launchProofBrowser();
try { for(const scenario of scenarios) {
 const input=JSON.parse(fs.readFileSync(path.join(base,'inputs',scenario+'.json'),'utf8'));input.output=path.join(base,phase,scenario);
 const result=await render(input);
 for(const [framework,port] of [['react',4478],['vue',4479]] as const) {
  const receipt=result.receipts.find((row:any)=>row.framework===framework) as any;
  const page=await browser.newPage({viewport:{width:input.widths[0],height:1000},locale:'en-US',timezoneId:'UTC'});
  await page.addInitScript('globalThis.__name = (value) => value;');
  await page.clock.setFixedTime(new Date('2026-09-08T12:00:00.000Z'));
  await page.goto(`http://127.0.0.1:${port}`,{waitUntil:'networkidle'});
  if(input.compose.context==='workflow') await page.locator('[data-oods-workflow][data-ui-state="success"]').waitFor();
  await applySteps(page,input.steps ?? [],Date.parse('2026-09-08T12:00:00.000Z'));
  const views=[];
  for(const width of input.widths) {
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);
   views.push({width,...await page.evaluate(()=>{
    const visible=(element:Element)=>element.getClientRects().length>0 && getComputedStyle(element).visibility!=='hidden';
    const box=(element:Element)=>{const rect=element.getBoundingClientRect();return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height};};
    const select=(query:string)=>Array.from(document.querySelectorAll(query)).filter(visible);
    const rows=select('.oods-collection-row').map(row=>({id:row.getAttribute('data-record-id'),box:box(row),className:row.className,children:Array.from(row.children).filter(visible).map(child=>({component:child.getAttribute('data-oods-component'),text:child.textContent?.trim(),box:box(child),centerY:child.getBoundingClientRect().top+child.getBoundingClientRect().height/2}))}));
    const archive=select('.oods-archived-row[data-archived="true"]').map(row=>{const badge=row.querySelector('.oods-archive-badge');return {box:box(row),cardBorderWidths:[getComputedStyle(row).borderTopWidth,getComputedStyle(row).borderRightWidth,getComputedStyle(row).borderBottomWidth,getComputedStyle(row).borderLeftWidth].map(Number.parseFloat),badge:badge?box(badge):null,badgeInside:badge?box(badge).left>=box(row).left && box(badge).right<=box(row).right && box(badge).top>=box(row).top && box(badge).bottom<=box(row).bottom:null};});
    const charts=select('figure[data-viz-rendered="true"]').map(figure=>{const area=figure.querySelector('path[aria-roledescription="area mark"]');const polygon=[...(area?.getAttribute('d')??'').matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map(match=>({x:Number(match[1]),y:Number(match[2])}));const points=polygon.slice(0,polygon.length/2);return {captions:select('figure[data-viz-rendered="true"] figcaption').map(node=>node.textContent),svgTitles:Array.from(figure.querySelectorAll('.role-title-text text')).map(node=>node.textContent),points,distinctUpperY:new Set(points.map(point=>point.y)).size};});
    return {rows,archive,charts,pagination:select('.oods-pagination-bar li').map(node=>({text:node.textContent,listStyle:getComputedStyle(node).listStyleType})),histories:select('[data-oods-component="StatusTimeline"], [data-oods-component="AuditTimeline"]').map(node=>({component:node.getAttribute('data-oods-component'),labels:Array.from(node.querySelectorAll('[data-timeline-label="true"], .oods-timeline__label')).map(label=>label.textContent),text:(node as HTMLElement).innerText})),amountHelp:select('[data-oods-component="BillingAmountInput"] .oods-field-help').map(node=>node.textContent),userAgent:navigator.userAgent};
   })});
  }
  fs.writeFileSync(path.join(input.output,framework,'craft.json'),JSON.stringify({phase,scenario,framework,sourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),artifactHash:receipt.artifactContentHash,views},null,2)+'\n');
  await page.close();
 }
 console.log(phase,scenario,'captured');
}}finally{await browser.close();}
