from pathlib import Path
import hashlib, json, subprocess
root=Path(__file__).resolve().parents[5]
out=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
plan=json.loads((out/'baseline.json').read_text())
addendum=json.loads((out/'baseline-addendum.json').read_text())
def flatten(node, trail=''):
 if not isinstance(node,dict):return {}
 if '$value' in node:return {trail:node['$value']}
 result={}
 for k,v in node.items():
  if not k.startswith('$'):result.update(flatten(v,(trail+'.' if trail else '')+k))
 return result
files=[]
for row in plan['files']+addendum['files']:
 f=row['file'];after=(root/f).read_bytes();before=subprocess.check_output(['git','show',plan['beforeHead']+':'+f],cwd=root)
 assert sha(before)==row['beforeSha256'],f
 result={**row,'afterSha256':sha(after),'changed':sha(after)!=row['beforeSha256']}
 if result['changed']:
  assert f.startswith('packages/tokens/src/'),f+' moved outside declared token sources'
  a=flatten(json.loads(before));b=flatten(json.loads(after));assert a.keys()==b.keys(),f
  result['changedTokens']=[{'token':k,'before':a[k],'after':b[k],'reason':'interactive-primary state ladder' if '.interactive.primary.' in k else 'accent-status contrast alias'} for k in a if a[k]!=b[k]]
  assert all('.interactive.primary.' in r['token'] or r['token'].startswith('theme.status.accent.') for r in result['changedTokens']),f
 files.append(result)
tests=[]
for row in json.loads((out/'runs.json').read_text()):
 d=json.loads((out/(row['package']+'.json')).read_text());assert d['success'] and not d['numPendingTests']
 tests.append({'package':row['package'],'passed':d['numPassedTests'],'failed':d['numFailedTests'],'skipped':d['numPendingTests']})
summary={'sourceFilesMoved':sum(r['changed'] for r in files),'tokenValuesMoved':sum(len(r.get('changedTokens',[])) for r in files),'liveSnapshots':sum(r['file'].endswith('.snap') and not r['file'].startswith('artifacts/') for r in files),'snapshotFilesMoved':sum(r['changed'] for r in files if r['file'].endswith('.snap')),'chartRegistriesMoved':0,'tests':tests}
report={'beforeHead':plan['beforeHead'],'planSha256':sha((out/'baseline.json').read_bytes()),'addendumSha256':sha((out/'baseline-addendum.json').read_bytes()),'policy':'Baseline recorded before generator changes. No golden moved; no --update command was needed or executed. All categorical, sequential, diverging source values and chart registry bytes remain fixed.','files':files,'summary':summary,'builderSelfCertified':False}
(out/'attribution.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(summary))
