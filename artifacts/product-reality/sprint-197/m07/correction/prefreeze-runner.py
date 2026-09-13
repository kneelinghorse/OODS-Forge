from pathlib import Path
import subprocess,json,hashlib,datetime
root=Path('/Users/systemsystems/.codex/worktrees/s197/OODS-Forge'); out=root/'artifacts/product-reality/sprint-197/m07/pre-freeze';correction=root/'artifacts/product-reality/sprint-197/m07/correction'
source_head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
base=['pnpm','exec','vitest','run','--project=core','--maxWorkers=1','--no-file-parallelism','--testTimeout=60000','--coverage.enabled=false','--reporter=json']
focused=[r['name'].split('/OODS-Forge/')[-1] for r in json.load(open('/tmp/oods-s197-correction-focused.json'))['testResults']]
contracts=[r['name'].split('/OODS-Forge/')[-1] for r in json.load(open(out/'contracts.json'))['testResults']]
narrative=[r['name'].split('/OODS-Forge/')[-1] for r in json.load(open(out/'narrative.json'))['testResults']]
commands=[('corrected-integration','vitest',base+focused),('corrected-contracts','vitest',base+contracts),('corrected-narrative','vitest',base+narrative),('corrected-typecheck','command',['pnpm','typecheck']),('corrected-lint','command',['pnpm','lint:tokens']),('corrected-cascade','command',['pnpm','verify:brand-cascade']),('corrected-build','command',['pnpm','build']),('corrected-docs','command',['pnpm','docs:check']),('corrected-token-check','command',['pnpm','check:tokens'])]
report={'status':'running','skipped':0,'sourceHead':source_head,'sourceState':'Corrective working tree, exact path hashes in correction/after.json; clean full capture follows corrective commit.','reports':[]}
for name,kind,command in commands:
 raw=out/(name+'.json');log=out/(name+'.log')
 if kind=='vitest':command+=['--outputFile='+str(raw)]
 with log.open('w') as stream:result=subprocess.run(command,cwd=root,stdout=stream,stderr=subprocess.STDOUT)
 if kind=='command':raw.write_text(json.dumps({'command':command,'exitCode':result.returncode,'sourceHead':source_head,'log':{'path':str(log.relative_to(root)),'sha256':sha(log)}},indent=2)+'\n');failed=int(result.returncode!=0);skipped=0;passed=int(not failed)
 else:
  d=json.loads(raw.read_text());failed=d['numFailedTests']+(not d['success']);skipped=d['numPendingTests'];passed=d['numPassedTests']
 report['reports'].append({'name':name,'kind':kind,'path':str(raw.relative_to(root)),'sha256':sha(raw),'failed':failed,'skipped':skipped,'passed':passed})
 print(name,result.returncode,passed,failed,skipped,flush=True)
 if failed or skipped:
  report['status']='failed';(out/'corrective-report.json').write_text(json.dumps(report,indent=2)+'\n');raise SystemExit(1)
report['status']='passed';(out/'corrective-report.json').write_text(json.dumps(report,indent=2)+'\n')
