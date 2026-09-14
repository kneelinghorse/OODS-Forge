"""One isolated diagnostic run under CMOS #2057; never replaces the full capture."""
from pathlib import Path
import argparse,datetime,hashlib,json,os,subprocess,time
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--workspace',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args();root=args.workspace.resolve();out=args.output.resolve();out.mkdir(parents=True,exist_ok=True)
assert not (out/'result.json').exists(),'Preserve the previous attempt; do not overwrite it.'
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
assert head=='d28add31bc7726a153c7e6062ff408acdb41aa3b'
status=lambda: subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all'],cwd=root,text=True).splitlines()
before=status();assert not before,before
report=out/'vitest.json'
cmd=['pnpm','--filter','@oods/mcp-server','exec','vitest','run','test/product-reality/saved-schema-consumers.s183.spec.ts','--testTimeout=60000','--maxWorkers=1','--no-file-parallelism','--reporter=default','--reporter=json',f'--outputFile={report}']
started=datetime.datetime.now(datetime.timezone.utc).isoformat();clock=time.monotonic()
with (out/'run.log').open('w') as log:
 r=subprocess.run(cmd,cwd=root,env={**os.environ,'CI':'1','FORCE_COLOR':'0','NO_COLOR':'1'},stdout=log,stderr=subprocess.STDOUT)
after=status();v=json.loads(report.read_text()) if report.exists() else {}
result={'decision':2057,'kind':'isolated-consumer-installation-diagnostic','executionHead':head,'command':cmd,'exitCode':r.returncode,'startedAt':started,'endedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durationSeconds':time.monotonic()-clock,'cleanBefore':not before,'cleanAfter':not after,'statusBefore':before,'statusAfter':after,'tests':{k:v.get(k) for k in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests','numTodoTests']},'vitestSuccess':v.get('success'),'logSha256':hashlib.sha256((out/'run.log').read_bytes()).hexdigest(),'qualification':'Diagnostic only. The full corrective capture remains failed with its original skipped assertions and installation error.','builderSelfCertified':False}
(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
assert not after,after
raise SystemExit(r.returncode)
