import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const root='/Users/systemsystems/.codex/worktrees/s197/OODS-Forge', base='artifacts/product-reality/sprint-197/m07';
const {deriveSprint197Closeout}=await import(pathToFileURL(root+'/scripts/product-reality/s185-closeout.mjs'));
const {auditSprint197Closeout,auditPublicRuntimeBytes,auditSprintRange}=await import(pathToFileURL(root+'/scripts/product-reality/s185-audit-closeout.mjs'));
const manifest=JSON.parse(fs.readFileSync('/tmp/oods-s197-manifest-template.json'));
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(), A=manifest.implementationHead;
const publicGitEvidence=auditPublicRuntimeBytes({root,implementationHead:A,executionHead:head,sprintId:'sprint-197'});
const rangeGitEvidence=auditSprintRange({root,base:'bc12723e9b7a42a4790a98f5d2a0dc4a1f970b99',head,sprintId:'sprint-197'});
const hash=b=>createHash('sha256').update(b).digest('hex');
// Unit-test boundary: final accounting/CI metadata is synthetic because no second
// capture exists yet. Every runtime, theme, viz, schema, store and historical
// mission input is real. No generated claim is written or offered as proof.
const overrides=new Map();const set=(p,v)=>overrides.set(p,Buffer.from(JSON.stringify(v)));
const manifestPath=base+'/closeout/manifest.json';
set(manifestPath,manifest);
set(base+'/closeout/head-relations.json',{publicComparison:publicGitEvidence});
set(base+'/closeout/boundary.json',{messagesSent:0,reconnectPrepared:false,deliveryExecuted:false});
set(base+'/closeout/capture-inputs.json',{fixtureOnly:true});
set(base+'/ci/preflight-run.json',{headSha:head,status:'completed',conclusion:'success',fixtureOnly:true});
set(base+'/ci/verification.json',{pr:{baseRefName:'OODS-pro',url:'https://github.com/kneelinghorse/OODS-Forge/pull/107'},runs:[{headSha:head,conclusion:'success',receipt:{path:base+'/ci/preflight-run.json',sha256:hash(overrides.get(base+'/ci/preflight-run.json'))}}]});
for(const file of ['sprint-wide-movers.json','declared-movers.json','attribution.json','sprint-wide.patch'])overrides.set(base+'/movers/'+file,fs.readFileSync('/tmp/oods-s197-review/movers/'+file));
const attr=JSON.parse(overrides.get(base+'/movers/attribution.json'));attr.patch.path=base+'/movers/sprint-wide.patch';set(base+'/movers/attribution.json',attr);
overrides.set(base+'/five-suite-closeout/four-suite-baseline.json',fs.readFileSync('/tmp/oods-s197-final/five-suite-closeout/four-suite-baseline.json'));
const aggregate={path:base+'/five-suite-closeout/four-suite-baseline.json',sha256:hash(overrides.get(base+'/five-suite-closeout/four-suite-baseline.json'))};
const accounting={fixtureOnly:true,status:'passed',executionHead:head,reviewHead:head,headRelation:{changedEvidencePaths:[]},validationIssues:[],unattributedDeltas:[],comparisons:Array(5).fill({}),closeout:{aggregate,runs:[{suiteExecutionIds:Array(5).fill('unit-fixture')}]},references:[aggregate],executions:[]};
const readFrozen=p=>overrides.get(p)??fs.readFileSync(root+'/'+p);
const history=new Map();const readHistorical=(h,p)=>{let k=h+':'+p;if(!history.has(k))history.set(k,execFileSync('git',['show',k],{cwd:root,maxBuffer:128*1024*1024}));return history.get(k)};
const outputs=deriveSprint197Closeout({executionHead:head,reviewHead:head,manifest,readFrozen,readHistorical,suiteAccounting:accounting,publicHeadEquivalence:publicGitEvidence});
const report=auditSprint197Closeout({executionHead:head,reviewHead:head,manifestPath,readOutput:p=>Buffer.from(JSON.stringify(outputs[p])),readFrozen,readHistorical,gitEvidence:{ancestor:true,changes:[]},publicGitEvidence,rangeGitEvidence});
assert.equal(report.checkedCriteria,32);
let bites=0;
for(const p of [manifest.sources.sourceProof,manifest.sources.compatibility,manifest.sources.preFreeze]){
 const original=readFrozen(p);const obj=JSON.parse(original);
 if(p===manifest.sources.sourceProof)obj.references[0].sha256='0'.repeat(64);
 if(p===manifest.sources.compatibility)obj.changedLiveFiles=1;
 if(p===manifest.sources.preFreeze)obj.skipped=1;
 set(p,obj);
 assert.throws(()=>deriveSprint197Closeout({executionHead:head,reviewHead:head,manifest,readFrozen,readHistorical,suiteAccounting:accounting,publicHeadEquivalence:publicGitEvidence}));
 assert.throws(()=>auditSprint197Closeout({executionHead:head,reviewHead:head,manifestPath,readOutput:p=>Buffer.from(JSON.stringify(outputs[p])),readFrozen,readHistorical,gitEvidence:{ancestor:true,changes:[]},publicGitEvidence,rangeGitEvidence}));
 overrides.set(p,original);bites+=2;
}
console.log(JSON.stringify({status:'passed',fixtureOnly:true,syntheticBoundaries:['final accounting','final CI','review head metadata'],realHistoricalAndMeasurementInputs:true,criteria:32,negativeAssertions:bites,generatedClaimsWritten:false}));
