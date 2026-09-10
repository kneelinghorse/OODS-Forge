// Bounded Sprint 191 operand assembly for the existing S185 producer/auditor.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const base='artifacts/product-reality/sprint-191/m05';
const executionHead=process.argv[2];assert(/^[a-f0-9]{40}$/.test(executionHead));
const implementationHead=JSON.parse(fs.readFileSync(`${base}/component-census/report.json`,'utf8')).head;
const historical=[
 ['s191-m01','e7aa31e2',[
  ['token-proof.json','token-baseline.json'],['token-proof.json','viz-observations.json','golden-attribution.json'],
  ['matrix/matrix.json','matrix-attribution.json','certified-matrix-attribution.json'],['viz-census.json','viz-observations.json'],
  ['browser-proof.json','final-theme-codegen.log','schema-types-check.log'],['browser-proof.json'],
  ['mcp-focused-verified.log','viz-core-tests.log','viz-render-verified.log','final-theme-root.log','typecheck.log','golden-attribution.json'],
 ]],
 ['s191-m02','0babe4f5',[
  ['collection-tests-verified.log','initial-generation/Organization-react.json','initial-generation/Organization-vue.json','initial-generation/User-react.json','initial-generation/User-vue.json'],
  ['census-attribution.json','census/report.json'],['focused-tests-verified.log'],['packed-proof.json','packed-linux.log'],['browser-proof.json'],['focused-tests-verified.log','typecheck-final.log','final-regression.log'],
 ]],
 ['s191-m03','f6bc63a8',[
  ['browser-proof.json','verify-browser-final.log'],['browser-proof.json','verify-browser-final.log'],['packed-proof.json','packed-linux-final.log'],['root-focused-final.log'],['verification.json','mcp-regression-final.log','typecheck.log'],
 ]],
 ['s191-m04','291ae9ba',[
  ['verification.json','prose-tests.log'],['B-15/receipt.json','B-15/selected-red.log','B-15/restored-green.log'],['adapter-boundary/receipt.json','adapter-boundary/selected-red.log'],['B-04/receipt.json','B-05/receipt.json'],['verification.json','mcp-focused.log','docs-api-final.log'],['runtime-proof.json','re-pin-notice-plan.json','assemble-1.log','assemble-2.log'],['verification.json','typecheck.log'],
 ]],
];
const executions=[],bindings=[];
for(const [missionId,short,criteria] of historical) {
 const head=execFileSync('git',['rev-parse',short],{encoding:'utf8'}).trim(),directory=`artifacts/product-reality/sprint-191/${missionId.slice(-3)}`;
 const evidencePaths=[...new Set([`${directory}/README.md`,...criteria.flat().map(file=>`${directory}/${file}`)])];
 for(const file of evidencePaths) {assert(fs.existsSync(file),file);assert(fs.readFileSync(file).equals(execFileSync('git',['show',`${head}:${file}`],{maxBuffer:128*1024*1024})),file);}
 executions.push({id:missionId,head,historical:true,evidencePaths,role:'Mission-close evidence commit; producer and browser heads remain explicitly recorded inside the retained receipts.'});
 criteria.forEach((files,index)=>bindings.push({missionId,criterionIndex:index+1,executionIds:[missionId],evidencePaths:[`${directory}/README.md`,...files.map(file=>`${directory}/${file}`)]}));
}
const finalCriteria=[
 ['viz-census.json','viz-observations.json','matrix/matrix.json','contrast-table.json'],
 ['component-census/report.json','schema-movement.json','saved-original/report.json','saved-successor/report.json','saved-compatibility.json'],
 ['flows.json','packed-proof.json','receipt-reverification.json','browser-proof.json'],
 ['runtime-proof.json','re-pin-notice-plan.json'],
 ['four-suite-closeout/four-suite-baseline.json','golden-attribution.json'],
 ['movers/sprint-wide-movers.json','movers/declared-movers.json','reconnect-plan.json','deliveries.json'],
 ['prose.json','receipt-reverification.json'],['ci/observed.json','missions.json'],
];
const proofFiles=[...new Set(finalCriteria.filter((_,i)=>i!==4&&i!==7).flat().map(file=>`${base}/${file}`))];
executions.push({id:'s191-m05-frozen-proof',head:implementationHead,evidencePaths:proofFiles,historical:false,role:'Measured at implementationHead; immutable evidence retained by executionHead before the four-suite capture.'});
executions.push({id:'s191-m05-four-suites',head:executionHead,evidencePaths:[`${base}/four-suite-closeout/four-suite-baseline.json`,`${base}/golden-attribution.json`],historical:false,role:'One four-suite capture under1833; additive evidence descendants retain the actual execution head.'});
executions.push({id:'s191-m05-remote-ci',head:JSON.parse(fs.readFileSync(`${base}/ci/observed.json`,'utf8')).headRefOid,evidencePaths:[`${base}/ci/observed.json`],historical:false,role:'Observed remote PR run and job ids, not inferred from local tests.'});
finalCriteria.forEach((files,index)=>bindings.push({missionId:'s191-m05',criterionIndex:index+1,executionIds:[index===4?'s191-m05-four-suites':index===7?'s191-m05-remote-ci':'s191-m05-frozen-proof'],evidencePaths:files.map(file=>`${base}/${file}`)}));
assert.equal(bindings.length,33);
const sources={missions:`${base}/missions.json`,registry:'packages/viz-core/src/registry/viz-recipes.v1.json',vizCensus:`${base}/viz-census.json`,vizObservations:`${base}/viz-observations.json`,matrix:`${base}/matrix/matrix.json`,componentCensus:`${base}/component-census/report.json`,originalStore:`${base}/saved-original/report.json`,successorStore:`${base}/saved-successor/report.json`,compatibility:`${base}/saved-compatibility.json`,schemaMovement:`${base}/schema-movement.json`,flows:`${base}/flows.json`,browserReceipts:`${base}/receipt-reverification.json`,runtime:`${base}/runtime-proof.json`,repin:`${base}/re-pin-notice-plan.json`,noticePlan:`${base}/reconnect-plan.json`,movers:`${base}/movers/sprint-wide-movers.json`,ci:`${base}/ci/observed.json`,prose:`${base}/prose.json`,near:'cmos/foundational-docs/roadmap/near.md',program:'cmos/foundational-docs/roadmap/product-reality-program.md'};
const manifest={missionId:'s191-m05',implementationHead,executionHead,sources,executions,bindings,accounting:{capturePath:`${base}/four-suite-closeout/four-suite-baseline.json`}};
fs.mkdirSync(`${base}/closeout`,{recursive:true});fs.writeFileSync(`${base}/closeout/manifest.json`,JSON.stringify(manifest,null,2)+'\n');console.log('33 criteria bound to historical mission receipts and current executions.');
