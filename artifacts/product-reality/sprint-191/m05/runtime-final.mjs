// Final-head mode of the existing assembler + manifest verifier + E2E sequence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const base=path.resolve('artifacts/product-reality/sprint-191/m05');
const {source,root,head}=JSON.parse(fs.readFileSync(path.join(base,'runtime-location.json'),'utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');
const ref=file=>({path:path.relative(process.cwd(),file),sha256:hash(fs.readFileSync(file))});
const references=[];
const run=(command,args,log)=>{
 const result=spawnSync(command,args,{cwd:source,encoding:'utf8',maxBuffer:128*1024*1024,env:{...process.env,GNU_TAR:'/opt/homebrew/bin/gtar'}});
 const file=path.join(base,log);fs.writeFileSync(file,(result.stdout??'')+(result.stderr??''));references.push(ref(file));
 assert.equal(result.status,0,log);return {command:[command,...args],exitCode:result.status,log:ref(file)};
};
const clean=()=>{assert.equal(spawnSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).stdout.trim(),head);assert.equal(spawnSync('git',['status','--porcelain=v1'],{cwd:source,encoding:'utf8'}).stdout,'');};
clean();const assemblies=[];
for(const index of [1,2]) {assemblies.push(run(process.execPath,[path.join(source,'scripts/runtime/assemble.mjs'),'--out-dir',path.join(root,`out-${index}`),'--work-dir',path.join(root,`work-${index}`),'--final'],`runtime-assemble-${index}.log`));clean();console.log(`Final assembly ${index} passed.`);}
const first=path.join(root,'out-1');
const manifest=JSON.parse(fs.readFileSync(path.join(first,'forge-runtime.manifest.json'),'utf8'));
assert.equal(manifest.commit,head);assert.equal(manifest.dirty,false);assert.equal(manifest.archivePacking.determinismCertified,true);
const archiveSha256=hash(fs.readFileSync(path.join(first,'forge-runtime.tar.gz'))),secondArchiveSha256=hash(fs.readFileSync(path.join(root,'out-2/forge-runtime.tar.gz')));
assert.equal(archiveSha256,secondArchiveSha256);assert.equal(fs.readFileSync(path.join(first,'forge-runtime.tar.gz.sha256'),'utf8'),fs.readFileSync(path.join(root,'out-2/forge-runtime.tar.gz.sha256'),'utf8'));
const extracted=path.join(root,'extracted');fs.mkdirSync(extracted);run('/opt/homebrew/bin/gtar',['-xzf',path.join(first,'forge-runtime.tar.gz'),'-C',extracted],'runtime-extract.log');
const {verifyEmbeddedManifest}=await import(pathToFileURL(path.join(source,'scripts/runtime/manifest.mjs')).href);await verifyEmbeddedManifest(extracted);
const e2e=run(process.execPath,[path.join(source,'scripts/runtime/e2e.mjs'),'--extract-dir',extracted,'--repo-root',source],'runtime-e2e.log');clean();
const durable=path.resolve('artifacts/current-state/2026-09-10/portable-runtime/m05');fs.mkdirSync(durable,{recursive:true});
for(const file of ['forge-runtime.tar.gz','forge-runtime.tar.gz.sha256','forge-runtime.manifest.json','runtime-sbom-lite.json']) {const target=path.join(durable,file);fs.copyFileSync(path.join(first,file),target);references.push(ref(target));}
fs.writeFileSync(path.join(base,'runtime-proof.json'),JSON.stringify({status:'passed',head,sourceClean:true,reproducible:true,assemblies,archiveSha256,secondArchiveSha256,manifest,e2e,references,builderSelfCertified:false},null,2)+'\n');
fs.writeFileSync(path.join(base,'re-pin-notice-plan.json'),JSON.stringify({status:'prepared-unsent',sent:false,implementationHead:head,archiveSha256,payloadTreeSha256:manifest.payloadTreeSha256,deliverySprint:'sprint-192',targets:['aquex-mcp','forge-demos','shopify-forge'],draft:`After independent review, re-pin the portable Forge runtime to ${head}. Archive SHA256 ${archiveSha256}; payload SHA256 ${manifest.payloadTreeSha256}. The manifest is clean and GNU-tar deterministic; two --final assemblies match and native E2E passes. This notice is prepared only; #1315 closes after actual delivery.`,references},null,2)+'\n');
console.log(`Final runtime ${head}: equal archives ${archiveSha256}, E2E passed; notices prepared-unsent.`);
