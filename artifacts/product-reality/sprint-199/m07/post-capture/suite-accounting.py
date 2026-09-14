"""Account one retained five-suite capture, including exact skipped identities."""
from pathlib import Path
import argparse,datetime,json
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--capture',type=Path,required=True)
parser.add_argument('--previous-accounting',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args(); ROOT=args.capture.resolve()
record=json.loads((ROOT/'four-suite-baseline.json').read_text())
previous=json.loads(args.previous_accounting.read_text())
rows=[];failures=[];skips=[];failed_files=[]
for suite in record['runs'][0]['suites']:
 report=json.loads((ROOT/'run-1'/f"{suite['suite']}.vitest.json").read_text())
 rows.append({'suite':suite['suite'],'status':suite['status'],'exitCode':suite['exitCode'],'counts':suite['vitest']['tests'],'durationMs':suite['durationMs'],'cleanBefore':suite['cleanBefore']['clean'],'cleanAfter':suite['cleanAfter']['clean']})
 for file in report['testResults']:
  if file['status']=='failed': failed_files.append({'suite':suite['suite'],'file':file['name'].split('/OODS-Forge/',1)[-1],'message':file.get('message',''),'rawLog':f"five-suite-corrective/run-1/{suite['suite']}.log"})
  for test in file['assertionResults']:
   row={'suite':suite['suite'],'file':file['name'].split('/OODS-Forge/',1)[-1],'test':test['fullName'],'status':test['status']}
   if test['status']=='failed': failures.append({**row,'messages':test.get('failureMessages',[])})
   elif test['status'] in ['pending','skipped','disabled','todo']:skips.append(row)
assert {r['suite'] for r in rows}=={'viz-core','viz-render','mcp-server','root-core','component-packages'}
key=lambda r:(r['suite'],r['file'],r['test'])
prior={key(r) for r in previous['skips']};current={key(r) for r in skips}
checks=[record['cleanBeforeSetup'],record['cleanAfterSetup']]
for run in record['runs']:
 checks.extend([run['cleanBefore'],run['cleanAfter']])
 for suite in run['suites']: checks.extend([suite['cleanBefore'],suite['cleanAfter']])
start=record['setup'][0]['startedAt']; end=record['runs'][-1]['suites'][-1]['endedAt']
result={'executionHead':record['measuredHead'],'captureStatus':record['status'],'suites':rows,
 **{k:sum(r['counts'][k] for r in rows) for k in ['total','passed','failed','skipped','todo']},
 'startedAt':start,'endedAt':end,'elapsedSeconds':(datetime.datetime.fromisoformat(end.replace('Z','+00:00'))-datetime.datetime.fromisoformat(start.replace('Z','+00:00'))).total_seconds(),
 'cleanlinessCheckpoints':len(checks),'allCheckpointsClean':all(c['clean'] for c in checks),
 'failedTestFiles':failed_files,'failedTestFileCount':len(failed_files),'failures':failures,'skips':skips,'distinctSkippedTests':len({(r['file'],r['test']) for r in skips}),
 'skipReason':previous['skipReason'],'additionalSkipDisposition':'Extra skips in saved-schema-consumers.s183 are unexecuted assertions after Vue beforeAll failed to load @rollup/rollup-darwin-arm64; raw failed status retained, isolated supplement allowed by CMOS #2057.','skipComparison':{'previousExecutionHead':previous['executionHead'],'added':sorted(current-prior),'removed':sorted(prior-current)},
 'builderSelfCertified':False}
args.output.write_text(json.dumps(result,indent=2)+'\n')
print({k:result[k] for k in ['executionHead','captureStatus','passed','failed','skipped','todo','distinctSkippedTests','allCheckpointsClean','elapsedSeconds']})
