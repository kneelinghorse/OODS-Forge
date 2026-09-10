// Sprint-specific operands for the existing closeout producer and independent auditor.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const base='artifacts/product-reality/sprint-192/m07';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const executionHead=process.argv[2];assert(/^[a-f0-9]{40}$/.test(executionHead));
const checkInputs=process.argv.includes('--check-inputs');
const implementationHead=checkInputs?executionHead:read(`${base}/component-proof.json`).head;
const missionCriteria=[
 [1,[['verification.json','before.json','after-restart.json','pm2-restart.log','pm2-save.log'],['verification.json','final.json'],['behavior-summary.json','viz-line.json','viz-scatter.json','viz-treemap.json','generate-react.json','generate-vue.json'],['send-plan.json','send-readback.json',...Array.from({length:6},(_,i)=>`send-0${i+1}.json`)],['next-step-1315.json','backup.json','rollback-check.log'],['verification.json','fast-forward.log']]],
 [2,[['ci-corrected-run.json','ci-components-corrected-green.log','component-packages-corrected.json'],['baseline-census.json','token-resolution-before.json','token-resolution-after.json'],['deletion-bite.json','deletion-bite.log','deletion-bite-restore.log'],['token-additive-attribution.json'],['before-card-summary.json','after-card-summary.json','design-loop-before.log','design-loop-after.log'],['component-packages-base.log','components-vue-base.log','component-packages-corrected.json','token-contract.log']]],
 [3,[['contracts-green.log','measured-evidence.json'],['measured-evidence.json','component-packages-final.json'],['measured-evidence.json','component-packages-final.json'],['mutation-bites.json','react-arrowright-bite.log','vue-arrowright-bite.log','react-axe-count-bite.log','vue-axe-count-bite.log'],['measured-evidence.json'],['ci-run.json','ci-components-green.log','component-packages-final.json','typecheck-final.log']]],
 [4,[['measured-evidence.json','react/report.json','vue/report.json'],['measured-evidence.json','react/report.json','vue/report.json'],['measured-evidence.json'],['ci-run.json','ci-a11y-final.log','ci-packages-final.log'],['measured-evidence.json'],['theme-bites.json','react-theme-bite.log','vue-theme-bite.log','integration-focused-final.log','typecheck-integration.log']]],
 [5,[['component-packages-green.json'],['react-measured.json','vue-measured.json','ci-theme/react/report.json','ci-theme/vue/report.json'],['component-census-final/report.json','census-diff.json','final-census-verification.json'],['packed-verification.json','packed-complete/trait-recipes/report.json','packed-complete/timelines/report.json'],['packed-verification.json'],['ci-final-run.json','component-packages-green.json','typecheck-flow.log']]],
 [6,[['catalog-list-dist.json','catalog-verification.json'],['catalog-verification.json','refresh-green.log'],['catalog-verification.json','contracts-green.log'],['classification-changes.json','contracts-green.log'],['prose-green.log','server-focused-green.json'],['server-focused-green.json','contracts-green.log','python-green.log','prose-green.log','typecheck-first.log']]],
];
const bindings=[],executions=[];
for(const [number,criteria] of missionCriteria) {
 const missionId=`s192-m0${number}`,directory=`artifacts/product-reality/sprint-192/m0${number}`;
 const head=execFileSync('git',['log','-1','--format=%H','--',directory],{encoding:'utf8'}).trim();
 const evidencePaths=[...new Set([`${directory}/README.md`,...criteria.flat().map(file=>`${directory}/${file}`)])];
 for(const file of evidencePaths) {assert(fs.existsSync(file),file);assert(fs.readFileSync(file).equals(execFileSync('git',['show',`${head}:${file}`],{maxBuffer:128*1024*1024})),file);}
 executions.push({id:missionId,head,historical:true,evidencePaths,role:'Mission-close evidence commit; actual build/browser/CI heads are retained inside original receipts.'});
 criteria.forEach((files,i)=>bindings.push({missionId,criterionIndex:i+1,executionIds:[missionId],evidencePaths:[`${directory}/README.md`,...files.map(file=>`${directory}/${file}`)]}));
}
if(checkInputs){console.log(`Verified ${executions.length} mission input packets and ${bindings.length} historical criteria.`);process.exit(0);}
// m05 explicitly assigns its published catalog criterion to the later m06 refresh.
const dependent=bindings.find(row=>row.missionId==='s192-m05'&&row.criterionIndex===1);dependent.executionIds.push('s192-m06');dependent.evidencePaths.push('artifacts/product-reality/sprint-192/m06/catalog-verification.json');
const finalCriteria=[
 ['component-proof.json','component-ledger.json','token-resolution.json','react-measured.json','vue-measured.json','react-theme/report.json','vue-theme/report.json'],
 ['component-census/report.json','schema-movement.json','saved-original/report.json','saved-successor/report.json','saved-compatibility.json','flows.json'],
 ['viz-census.json','viz-observations.json','matrix/matrix.json','matrix-parity.json'],
 ['five-suite-closeout/four-suite-baseline.json','golden-attribution.json'],
 ['movers/sprint-wide-movers.json','movers/declared-movers.json','reconnect-plan.json'],
 ['prose.json','prose.log','component-proof.json'],
 ['ci/observed.json','missions.json'],
];
const groups=[['frozen-proof',implementationHead,finalCriteria.filter((_,i)=>![3,6].includes(i)).flat()],['five-suites',executionHead,finalCriteria[3]],['remote-ci',read(`${base}/ci/observed.json`).headRefOid,finalCriteria[6]]];
for(const [name,head,files] of groups) executions.push({id:`s192-m07-${name}`,head,historical:false,evidencePaths:[...new Set(files.map(file=>`${base}/${file}`))],role:name==='five-suites'?'Actual five-suite execution at executionHead, original failure/timeout receipts retained.':name==='remote-ci'?'Observed PR run/job identities; evidence-only head changes are not relabeled.':'Fresh frozen implementation measurements, with underlying commands and source heads retained.'});
finalCriteria.forEach((files,i)=>bindings.push({missionId:'s192-m07',criterionIndex:i+1,executionIds:[`s192-m07-${i===3?'five-suites':i===6?'remote-ci':'frozen-proof'}`],evidencePaths:files.map(file=>`${base}/${file}`)}));
const sources={missions:`${base}/missions.json`,componentProof:`${base}/component-proof.json`,componentLedger:`${base}/component-ledger.json`,componentExport:'artifacts/structured-data/oods-components-2026-09-10.json',tokens:`${base}/token-resolution.json`,reactTheme:`${base}/react-theme/report.json`,vueTheme:`${base}/vue-theme/report.json`,reactMeasured:`${base}/react-measured.json`,vueMeasured:`${base}/vue-measured.json`,componentCensus:`${base}/component-census/report.json`,originalStore:`${base}/saved-original/report.json`,successorStore:`${base}/saved-successor/report.json`,compatibility:`${base}/saved-compatibility.json`,schemaMovement:`${base}/schema-movement.json`,flows:`${base}/flows.json`,registry:'packages/viz-core/src/registry/viz-recipes.v1.json',vizCensus:`${base}/viz-census.json`,matrix:`${base}/matrix/matrix.json`,previousMatrix:'artifacts/product-reality/sprint-191/m05/matrix/matrix.json',noticePlan:`${base}/reconnect-plan.json`,movers:`${base}/movers/sprint-wide-movers.json`,ci:`${base}/ci/observed.json`,prose:`${base}/prose.json`,near:'cmos/foundational-docs/roadmap/near.md'};
const manifest={missionId:'s192-m07',implementationHead,executionHead,sources,executions,bindings,accounting:{capturePath:`${base}/five-suite-closeout/four-suite-baseline.json`,...(fs.existsSync(`${base}/closeout/timeout-rerun.json`)?{timeoutRerun:`${base}/closeout/timeout-rerun.json`}:{})}};
assert.equal(bindings.length,43);for(const file of [...Object.values(sources),...executions.flatMap(row=>row.evidencePaths)])assert(fs.existsSync(file),file);
fs.mkdirSync(`${base}/closeout`,{recursive:true});fs.writeFileSync(`${base}/closeout/manifest.json`,JSON.stringify(manifest,null,2)+'\n');console.log(`Bound ${bindings.length} literal criteria to ${executions.length} executions.`);
