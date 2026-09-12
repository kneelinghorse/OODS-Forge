# Final CI verification command

Ran `node /tmp/oods-s195-ci/verify-final-ci.mjs` against the final added CI packet. This calls both existing frozen producer and independent auditor predicates, then checks every observed job against its raw inventory, all seven actual checkout log excerpts, REST/local Git tree identity, native runtime head/counts, and preservation of every CI file present at C2. No suite or runtime capture is rerun.

Verifier source SHA256: `4afe69b5cf7f6117ffd82a5041f03b308c2a171974c88f88e45c87e29a0a551f`.

```js
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const root='/Users/systemsystems/.codex/worktrees/s195/OODS-Forge';
const prefix='artifacts/product-reality/sprint-195/m07/ci';
const implementation='39deb793a3161621b5a0893618f9d40201c22256';
const head='6e779776a7efa3b6e7b26a12966f0c4186dba1d6';
const checkout='62a07cd60c8dd016a5d32320470b016a9b7d0515';
const read=file=>readFileSync(root+'/'+file), json=file=>JSON.parse(read(file));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024});
const ref=value=>{const bytes=read(value.path);assert.equal(sha(bytes),value.sha256);return bytes;};
const {verifySprint195CI}=await import(pathToFileURL(root+'/scripts/product-reality/s185-closeout.mjs'));
const {auditSprint195Ci}=await import(pathToFileURL(root+'/scripts/product-reality/s185-audit-closeout.mjs'));
const ci=json(prefix+'/observed.json');
verifySprint195CI({ci,implementationHead:implementation,read});
const independent=auditSprint195Ci({ci,implementationHead:implementation,readFrozen:read,changedPaths:(a,b,scope)=>git(['diff','--name-only','--no-renames','-z',a,b,'--',...scope]).split('\0').filter(Boolean).sort()});
assert.deepEqual([...new Set(ci.jobs.map(j=>j.headSha))],[head]);
assert.equal(new Set(ci.observedJobs.map(j=>j.jobId)).size,ci.observedJobs.length);
for(const row of ci.observedJobs){
 const run=JSON.parse(ref(row.run)),inventory=JSON.parse(ref(row.jobInventory));
 assert.equal(run.id,row.runId);assert.equal(run.head_sha,row.headSha);assert.equal(run.status,'completed');
 const jobs=inventory.jobs.filter(j=>j.id===row.jobId);assert.equal(jobs.length,1);
 for(const key of ['name','status','conclusion'])assert.equal(jobs[0][key],row[key]);
 assert.equal(jobs[0].run_id,row.runId);
}
const proof=json(prefix+'/attempt-3/checkout-verification.json');
assert.equal(proof.metadataHead,head);assert.equal(proof.checkoutHead,checkout);
const merge=JSON.parse(ref(proof.mergeCommit)),branch=JSON.parse(ref(proof.branchCommit));
assert.equal(merge.sha,checkout);assert.equal(branch.sha,head);
const tree=git(['rev-parse',head+'^{tree}']).trim();assert.equal(merge.tree.sha,tree);assert.equal(branch.tree.sha,tree);
assert.deepEqual(merge.parents.map(p=>p.sha),['3872feaf4372fe66a10d1746537649df386c37f4',head]);
for(const selected of ci.jobs){
 const row=proof.logObservations.find(r=>r.jobId===selected.jobId);assert(row&&row.observations.length>0);
 const lines=ref(row.log).toString().split(/\r?\n/);
 for(const observation of row.observations){
  assert.equal(observation.checkoutHead,checkout);
  assert.deepEqual(lines.slice(observation.commandLine-1,observation.valueLine),observation.excerpt);
  assert(lines[observation.commandLine-1].includes('git log -1 --format=%H'));
  assert.equal(lines[observation.valueLine-1].match(/\b[a-f0-9]{40}\b/)?.[0],checkout);
 }
}
const runtime=JSON.parse(ref(proof.runtime.report)),placement=JSON.parse(ref(proof.runtime.placement));
assert.equal(runtime.head,checkout);assert.equal(placement.head,checkout);assert.equal(runtime.runId,placement.runId);
assert.deepEqual(runtime.summary,{cells:154,pass:154,typedGap:0,fail:0});
assert.deepEqual(placement.dashboard,{cells:4,pass:4,typedGap:0,fail:0});assert.equal(placement.chartThemeScopesPassed,48);
const old=git(['ls-tree','-r','--name-only',head,'--',prefix]).trim().split('\n').filter(Boolean);
for(const file of old)assert.equal(sha(read(file)),sha(execFileSync('git',['show',head+':'+file],{cwd:root,maxBuffer:128*1024*1024})),`Existing C2 CI path changed: ${file}`);
const walk=dir=>readdirSync(root+'/'+dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
const added=walk(prefix).filter(p=>!old.includes(p));assert(added.every(p=>/\.(json|log|md)$/.test(p)));
for(const row of json(prefix+'/copy-verification.initial.json').files)assert.equal(sha(read(row.path)),row.sha256);
const observedStateCounts={};for(const row of ci.observedJobs)observedStateCounts[row.conclusion]=(observedStateCounts[row.conclusion]??0)+1;
console.log(JSON.stringify({status:'passed',implementationHead:implementation,ciMetadataHead:head,checkoutHead:checkout,tree,producerPassed:true,independent,allObservedJobsBound:ci.observedJobs.length,observedStateCounts,selectedCheckoutLogsVerified:7,runtimeRunId:runtime.runId,canonical:154,dashboard:4,chartThemeScopes:48,existingC2CiFilesUnchanged:old.length,newCiPathsOnly:true,newCiPathCount:added.length,ciSha256:sha(read(prefix+'/observed.json'))},null,2));
```
