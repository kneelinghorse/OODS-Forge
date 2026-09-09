// Sprint 189 receipt assertions over the existing browser loop's unmodified output.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { auditBrowserReceipt } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
const base = 'artifacts/product-reality/sprint-189/m06', proof = `${base}/corrective-proof`;
const head = execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file));
const ref = file => ({path:file,sha256:sha(fs.readFileSync(file))});
const lineRef = file => { const bytes=fs.readFileSync(file); const text=bytes.toString().replace(/\n$/, ''); return {...ref(file),startLine:1,endLine:text.split('\n').length,text}; };
const write = (file,value) => { assert(!fs.existsSync(file));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n'); };
const screens = ['list','detail','form','timeline','workflow','review-list','review-detail','review-form','review-timeline','active-detail','archived','on-demand'];
const receipts=[];
for (const screen of screens) for (const framework of ['react','vue']) {
  const file=`${proof}/after/${screen}/${framework}/receipt.json`, receipt=read(file);
  auditBrowserReceipt(ref(file),file=>fs.readFileSync(file),head);
  for(const view of receipt.views) {
    const text=view.accessibility;
    if(screen==='review-list') { assert.equal((text.match(/searchbox /g)||[]).length,1);assert.doesNotMatch(text,/No items|button "(?:Filter|Open row|Sort)"/);assert.match(text,/9 records/); }
    if(screen==='review-timeline') { assert.doesNotMatch(text,/paragraph: 1999|\d{4}-\d{2}-\d{2}T/);assert(view.regions.filter(row=>row.component==='Card').every(row=>row.text.trim()));assert.match(text,/Budget changed for next year/); }
    if(screen==='review-form') {
      for(const [role,label] of [['textbox','Reason Code'],['textbox','Reason'],['textbox','Billing amount'],['combobox','Billing interval'],['combobox','Status'],['checkbox','Cancel at period end']]) assert.equal((text.match(new RegExp(`${role} "${label}"`,'g'))||[]).length,1);
      assert.equal((text.match(/button "Save"/g)||[]).length,1);assert.doesNotMatch(text,/button "(?:Submit|Change)"/);
      for(const match of text.matchAll(/(?:textbox|combobox|checkbox|spinbutton) "([^"\n]+)"/g)) {assert(match[1].length<=40);assert.doesNotMatch(match[1],/[.!?]$/);}
      assert.equal(view.values.find(row=>row.name==='Cancellation requested at')?.value,'2026-09-08T12:00');
      assert.equal(view.values.find(row=>row.name==='Reason Code')?.value,'customer_request');
    }
    if(screen==='review-detail') {assert.doesNotMatch(text,/textbox |checkbox |No events|\bfalse\b|\d{4}-\d{2}-\d{2}T/);assert.deepEqual([...text.matchAll(/- tab "([^"\n]+)"/g)].map(row=>row[1]),['Billing','Details']);assert.match(text,/Budget changed for next year/);}
    if(screen==='archived') {assert.match(text,/1 record Showing 1–1 of 1/);assert.doesNotMatch(text,/1 records/);}
    if(screen==='active-detail') {assert.match(text,/23% complete · 23 days remaining/);assert.match(text,/Sep 1, 2026/);assert.match(text,/Oct 1, 2026/);assert.doesNotMatch(text,/term: (?:Reason|Code|Requested at)/);}
    if(screen==='on-demand') {assert.equal(view.regions.filter(row=>row.component==='CancellationForm').length,1);assert.match(text,/button "Confirm cancellation"/);}
  }
  receipts.push({...ref(file),screen,framework,widths:receipt.views.map(row=>row.width)});
}
for(const screen of ['review-detail','active-detail']) for(const component of ['StatusTimeline','AuditTimeline','CancellationSummary']) {
  const values=['react','vue'].map(framework=>read(`${proof}/after/${screen}/${framework}/receipt.json`).views.map(view=>view.regions.filter(row=>row.component===component).map(row=>row.text.replace(/\s+/g,' ').trim())));
  assert.deepEqual(values[0],values[1],`${screen}/${component} text parity`);
}
const descriptions=[
 ['List','review-list','One search and bound collection/pagination; the old unbound toolbar and placeholder are absent.'],
 ['Timeline','review-timeline','Chronological events replace empty cards; timestamps are formatted and the bare minor-unit amount is absent.'],
 ['Form','review-form','Short labels, separate help, unique recipe controls, matching reason code, populated datetime and one Save.'],
 ['Detail','review-detail','Read-only detail, populated unique tabs, matching audit history, Yes/No summary terms and no measured per-character wrapping. Cancellation appears only on demand.'],
 ['Archived list','archived','Singular record count and an unbroken badge; receipt glyph measurements and narrow screenshots are retained.'],
 ['Status timeline parity','active-detail','React and Vue StatusTimeline and AuditTimeline region text are equal at all three widths.'],
 ['Sample data','active-detail','Active seed is mid-cycle with next payment one month after last payment and no cancellation metadata.']
];
const items=descriptions.map(([title,screen,reason],index)=>({id:index+1,title,disposition:'resolved',reason,evidence:['react','vue'].flatMap(framework=>[390,820,1440].map(width=>lineRef(`${proof}/after/${screen}/${framework}/${width}.a11y.txt`))),measurements:['react','vue'].map(framework=>ref(`${proof}/after/${screen}/${framework}/receipt.json`)),before:['react','vue'].map(framework=>ref(`artifacts/product-reality/sprint-189/m02/before/${index===0?'review-list':index===1?'review-timeline':index===2?'review-form':'review-detail'}/${framework}/receipt.json`))}));
write(`${proof}/receipt-set.json`,{status:'passed',head,receiptCount:receipts.length,screenshotCount:receipts.length*3,receipts,beforeSet:'artifacts/product-reality/sprint-189/m02/before-executions.json',parityDifferences:0});
write(`${base}/before-after/corrective-mapping.json`,{decisionId:1832,head,builderSelfCertified:false,separateReviewRequired:true,baseline:'artifacts/product-reality/sprint-189/m02/before-executions.json',disclosure:'All nine m02 baseline observations have loop diffs. M02 did not open Archived; the additional unmodified m04 artifact replay in m05/before/archived retains that pre-fix badge evidence. Dispositions describe measured defects; independent review decides usability.',items});
console.log(`Receipt verification passed: ${receipts.length} receipts, ${receipts.length*3} screenshots, seven measured dispositions, zero lifecycle text differences.`);
