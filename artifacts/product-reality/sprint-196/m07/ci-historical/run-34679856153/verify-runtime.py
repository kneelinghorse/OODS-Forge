from pathlib import Path
import json,hashlib,re,subprocess,shutil
from datetime import datetime,timezone
root=Path('/Users/systemsystems/.codex/worktrees/s196/OODS-Forge')
p=Path('/tmp/forge-s196-ci-34679856153-runtime')
out=Path(__file__).resolve().parent
read=lambda path:json.loads(path.read_text())
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
run=read(Path('/tmp/forge-s196-ci-34679856153-run-final.json'))
job=read(Path('/tmp/forge-s196-ci-34679856153-runtime-job.json'))
artifacts=read(Path('/tmp/forge-s196-ci-34679856153-artifacts-final.json'))
artifact=next(x for x in artifacts['artifacts'] if x['name']=='runtime-cells')
assert run['status']=='completed' and run['conclusion']=='success'
assert job['status']=='completed' and job['conclusion']=='success'
assert all(s['conclusion']=='success' for s in job['steps'])
assert run['headSha']=='944f4dda5f784e266310978b31f65b3d452e6387'
ledger=read(p/'runtime-cells.v1.json');dash=read(p/'layouts/dashboard/runtime-cells.v1.json');placement=read(p/'placement-verification.json');bite=read(p/'emitter-bite.json');red_spec=read(p/'bite/red-contract-spec.json')
assert ledger['summary']=={'cells':154,'pass':154,'typedGap':0,'fail':0}
assert len(ledger['rows'])==154 and len({(r['object'],r['context'],r['framework']) for r in ledger['rows']})==154
assert dash['summary']=={'cells':4,'pass':4,'typedGap':0,'fail':0} and len(dash['rows'])==4
assert read(p/'validation.json')=={'issues':[]}
assert read(p/'layouts/dashboard/validation.json')=={'issues':[],'reusedSweepTarballs':True}
assert ledger['head']==dash['head']==placement['head']=='d8b6b052d2a1ac896279005ba62b9384b9f22c01'
assert ledger['runId']==dash['runId']==placement['runId']
for report,report_root in [(ledger,p),(dash,p/'layouts/dashboard')]:
    assert report['packCount']==1 and report['historicalReceiptsUnioned'] is False
    for row in report['rows']:
        assert row['head']==report['head'] and row['runId']==report['runId'] and row['status']=='pass'
        assert all(g['status']=='pass' for g in row['gates'])
        assert read(report_root/row['report'])==row
assert placement['canonical']==ledger['summary'] and placement['dashboard']==dash['summary']
assert placement['chartThemeScopes']==placement['chartThemeScopesPassed']==len(placement['proof'])==48
for row in placement['proof']:
    assert row['matchesPublicSvg'] is True and row['conformant'] is True and row['failures']==row['skipped']==0
assert bite['sourceRestoredByteIdentical'] is True and bite['reusedSweepTarballs'] is True
source_bytes=subprocess.check_output(['git','show',f"{run['headSha']}:{bite['source']}"],cwd=root)
assert bite['beforeHash']==bite['restoredHash']=='sha256:'+hashlib.sha256(source_bytes).hexdigest()
assert bite['mutatedHash']!=bite['beforeHash']
assert bite['red']['status']=='fail' and bite['restored']['status']=='pass'
assert [g['name'] for g in bite['red']['gates'] if g['status']!='pass']==['mount']
assert all(g['status']=='pass' for g in bite['restored']['gates'])
assert read(p/'bite/red/cells/Article/card/react/receipt.json')==bite['red']
assert read(p/'bite/restored/cells/Article/card/react/receipt.json')==bite['restored']
canonical=next(row for row in ledger['rows'] if (row['object'],row['context'],row['framework'])==('Article','card','react'))
assert bite['restored']['artifactHash']==canonical['artifactHash']
assert bite['ledgerIssues']==['Article/card/react failed']
assert bite['redSpecExitCode']==red_spec['exitCode']==1
assert red_spec['command'].endswith('-t the retained current sweep')
assert '1 failed | 6 skipped (7)' in red_spec['stdout']
assert 'the retained current sweep has all passing or explicitly unavailable cells with retained receipt provenance' in red_spec['stdout']
assert 'Article/card/react failed' in red_spec['stderr']
log=Path('/tmp/forge-s196-ci-34679856153-runtime-job.log').read_text();clean=re.sub(r'\x1b\[[0-9;]*m','',log)
assert re.search(r'Tests\s+21 passed\s+\(21\)',clean)
selected=['runtime-cells.v1.json','validation.json','browser.json','placement-verification.json','layouts/dashboard/validation.json','layouts/dashboard/runtime-cells.v1.json','emitter-bite.json','bite/red-contract-spec.json','bite/red/cells/Article/card/react/receipt.json','bite/restored/cells/Article/card/react/receipt.json']
inventory=[]
for name in selected:
    target=out/'runtime'/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p/name,target);assert sha(target)==sha(p/name);inventory.append({'path':f'runtime/{name}','sha256':sha(target),'bytes':target.stat().st_size})
for source_name,target_name in [('run-final','run-final.json'),('runtime-job','runtime-job.json'),('artifacts-final','artifacts-final.json')]:
    shutil.copyfile(Path(f'/tmp/forge-s196-ci-34679856153-{source_name}.json'),out/target_name)
shutil.copyfile('/tmp/forge-s196-ci-34679856153-runtime-job.log',out/'runtime-job.log')
v={'verifiedAt':datetime.now(timezone.utc).isoformat(),'scope':'Later hosted runtime result, retained after m05 evidence was frozen; no historical m05 receipt changed.','builderSelfCertified':False,'runId':run['databaseId'],'runUrl':run['url'],'sourceHead':run['headSha'],'executedMergeCommit':ledger['head'],'workflowConclusion':run['conclusion'],'jobConclusions':{'success':sum(j['conclusion']=='success' for j in run['jobs']),'skipped':[j['name'] for j in run['jobs'] if j['conclusion']=='skipped']},'runtime':{'jobId':job['id'],'jobUrl':job['html_url'],'startedAt':job['started_at'],'completedAt':job['completed_at'],'conclusion':job['conclusion'],'artifact':artifact,'summary':ledger['summary'],'dashboard':dash['summary'],'chartThemeScopesPassed':48,'runId':ledger['runId'],'packCount':1,'allRowsAndReportsMatch':True,'hostedContractTests':{'passed':21,'skipped':0}},'selectorBite':{'operation':bite['operation'],'source':bite['source'],'beforeHash':bite['beforeHash'],'mutatedHash':bite['mutatedHash'],'restoredHash':bite['restoredHash'],'sourceRestoredByteIdentical':True,'redCell':'Article/card/react','redFailedGate':'mount','redSpecExecutedAssertions':1,'redSpecFailedAssertions':1,'filteredSiblingTests':6,'redSpecExitCode':1,'restoredCellStatus':'pass','restoredGatesPassed':len(bite['restored']['gates']),'restoredArtifactEqualsCanonical':True,'limitation':'There is no separate restored selector stdout. The retained restored cell is green and the subsequent full runtime/workflow contract gate passed21/21.'},'selectedOriginalEvidence':inventory,'rawArtifactRoot':str(p),'retention':'Original selected receipts copied byte-for-byte under this temp proof directory. Raw158-cell tree remains in downloaded GitHub artifact and temp directory. Root decides next mission or closeout destination.'}
(out/'verification.json').write_text(json.dumps(v,indent=2)+'\n')
print(json.dumps({'workflow':'success','successfulJobs':v['jobConclusions']['success'],'skippedJobs':v['jobConclusions']['skipped'],'runtime':ledger['summary'],'dashboard':dash['summary'],'chartThemeScopes':48,'redAssertions':1,'filteredSiblingTests':6,'restored':'pass','contractTests':21,'artifactId':artifact['id']}))
