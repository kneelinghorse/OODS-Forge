import hashlib,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[4]
folder=Path(__file__).parent
baseline=json.loads(subprocess.check_output(['git','show','bb579fd8d:packages/mcp-server/registry/runtime-cells.v1.json'],cwd=root,text=True))
current=json.loads((folder/'runtime/runtime-cells.v1.json').read_text())
key=lambda r: (r['object'],r['context'],r['framework'])
old={key(row):row for row in baseline['rows']}
assert len(old)==240 and len(current['rows'])==240
assert current['summary']=={'cells':240,'pass':240,'typedGap':0,'fail':0},current['summary']
assert current['head']=='e307810dd719c31c1ad21d7eacfaac085def9518'
assert all(row['head']==current['head'] and row['runId']==current['runId'] for row in current['rows'])
changes=[]
for row in current['rows']:
    prior=old[key(row)]
    if prior['artifactHash']==row['artifactHash']:continue
    context=row['context']
    assert context in ['list','workflow','timeline'],('Unexpected artifact mover',key(row))
    reason='Shared list toolbar marker, string-status choices and primary label selection' if context in ['list','workflow'] else 'Primary label selection now recognizes label; the selector is shared by list and timeline'
    changes.append({'object':row['object'],'context':context,'framework':row['framework'],'before':prior['artifactHash'],'after':row['artifactHash'],'reason':reason})
result={'mission':'s198-m02','builderSelfCertified':False,'beforeHead':baseline['head'],'head':current['head'],'runId':current['runId'],'summary':current['summary'],'moved':len(changes),'unchanged':240-len(changes),'changes':changes,'packageChanges':'Shared component CSS and Vue fallback status presentation are separately SHA-bound in source-identity.json and each fresh tarball inventory; generated artifact hashes alone do not capture package bytes.'}
(folder/'runtime-attribution.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'cells':240,'moved':len(changes),'unchanged':240-len(changes)}))
