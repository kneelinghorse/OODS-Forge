// Mutate only in-memory copies of the final outputs; retain all frozen evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { auditFinalCloseout, auditPublicRuntimeBytes, auditSprintRange } from '../../../../../scripts/product-reality/s185-audit-closeout.mjs';
const [executionHead, reviewHead, output] = process.argv.slice(2);
const root = process.cwd(); const base = 'artifacts/product-reality/sprint-188/m06';
const git = args => execFileSync('git', args, {cwd:root, maxBuffer:128*1024*1024});
const cache = new Map();
const historical = (head, file) => { const key = `${head}:${file}`; if (!cache.has(key)) cache.set(key,git(['show',key])); return cache.get(key); };
const readFrozen = file => historical(reviewHead,file);
const manifestPath = `${base}/accepted-timeout/manifest-final.json`;
const manifest = JSON.parse(readFrozen(manifestPath));
const implementationHead = JSON.parse(readFrozen(manifest.sources.noticePlan)).implementationHead;
const changes = git(['diff','--name-status','--no-renames',`${executionHead}..${reviewHead}`]).toString().trim().split('\n').filter(Boolean).map(line => {const [status,path]=line.split('\t');return {status,path};});
const args = {executionHead,reviewHead,manifestPath,readFrozen,readHistorical:historical,gitEvidence:{ancestor:true,changes},
  publicGitEvidence:auditPublicRuntimeBytes({root,implementationHead,executionHead,sprintId:'sprint-188'}),
  rangeGitEvidence:auditSprintRange({root,base:'cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076',head:implementationHead,sprintId:'sprint-188'})};
const originals = Object.fromEntries(['claim-ledger','suite-accounting','review-handoff','evidence-index'].map(name => [`${base}/closeout-accepted/${name}.json`,fs.readFileSync(`${base}/closeout-accepted/${name}.json`)]));
const baseline = auditFinalCloseout({...args,readOutput:file=>originals[file]}); assert.equal(baseline.checkedCriteria,39);
const controls = [
  ['literal-criterion','claim-ledger', value=>{value.claims[0].criterion='Altered claim';}],
  ['historical-criterion-omitted','claim-ledger', value=>{value.priorClaims.pop();}],
  ['execution-head-relabeled','claim-ledger', value=>{value.executions[0].measuredHead='0'.repeat(40);}],
  ['craft-hash-forged','review-handoff', value=>{value.craft.sha256='0'.repeat(64);}],
  ['builder-certification','review-handoff', value=>{value.builderSelfCertified=true;}],
  ['suite-failure-hidden','suite-accounting', value=>{value.executions.find(row=>row.cohort==='closeout' && row.suite==='root-core').counts.failed=0;}],
  ['approval-decision-changed','suite-accounting', value=>{value.timeoutAcceptance.decisionId=0;}],
  ['review-follow-up-removed','review-handoff', value=>{value.timeoutAcceptance.sprintReview.nextSprintAdjustmentRequired=false;}],
];
const receipts = [];
for (const [id,name,mutate] of controls) {
  const file = `${base}/closeout-accepted/${name}.json`; const value=JSON.parse(originals[file]); mutate(value);
  const modified={...originals,[file]:Buffer.from(JSON.stringify(value))};
  const indexPath=`${base}/closeout-accepted/evidence-index.json`; const index=JSON.parse(originals[indexPath]);
  for(const ref of index.generatedOutputs) if(modified[ref.path]) {ref.sha256=createHash('sha256').update(modified[ref.path]).digest('hex');ref.bytes=modified[ref.path].length;}
  modified[indexPath]=Buffer.from(JSON.stringify(index));
  let rejected=''; try {auditFinalCloseout({...args,readOutput:target=>modified[target]});} catch(error) {rejected=error.message;}
  assert(rejected,`Auditor accepted ${id}`); receipts.push({id,status:'rejected-as-required',reason:rejected});
}
assert.equal(auditFinalCloseout({...args,readOutput:file=>originals[file]}).status,'passed');
assert(!fs.existsSync(output));fs.writeFileSync(output,JSON.stringify({status:'passed',executionHead,reviewHead,baseline:39,controls:receipts,restored:'passed',evidenceMutated:false},null,2)+'\n');
console.log(`Independent auditor controls passed: ${receipts.length} rejected mutations and restored 39-criterion audit.`);
