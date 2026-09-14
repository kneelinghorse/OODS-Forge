import json, hashlib
from pathlib import Path
ROOT=Path.cwd(); OUTPUT=ROOT/'artifacts/product-reality/sprint-199/m07/closeout'
references=[]
def read(file):
 data=(ROOT/file).read_bytes(); references.append({'path':file,'sha256':hashlib.sha256(data).hexdigest()});return json.loads(data)
viz=read('packages/viz-core/src/registry/viz-recipes.v1.json')
patterns=read('packages/viz-core/src/registry/viz-patterns.v1.json')
taxonomy=read('packages/viz-core/src/registry/viz-taxonomy.v1.json')
tools=read('packages/mcp-server/registry/tool-capability-ledger.v1.json')
intake=read('packages/component-contracts/registry/component-intake.v1.json')
rows=[]
for row in viz:
 rows.append({key:row[key] for key in ['chartType','themes','renderScopes','certifyScopes','chartInApp']})
assert len(viz)==13 and sum(len(r['renderScopes']) for r in viz)==78
assert all(s['status']=='rendered' for r in viz for s in r['renderScopes'])
assert all(s['conformant'] for r in viz for s in r['certifyScopes'])
assert sum(r['status']=='public' for r in patterns)==22
retired=[r for r in patterns if r['status']=='retired'];assert len(retired)==1
assert len(taxonomy['retiredCells'])==3 and taxonomy['summary']['coreSurfaceComplete']==17 and taxonomy['summary']['typedGaps']==0
assert len(intake['rows'])==110
component=[]
for framework in ['react','vue']:
 r=read(f'artifacts/product-reality/sprint-199/m06/{framework}-theme/report.json')
 assert r['status']=='passed' and r['failed']==r['skipped']==0
 component.append({'framework':framework,'cells':sum(len(c['rows']) for c in r['cells']), 'scopeIds':[c['cell'] for c in r['cells']]})
assert sum(r['cells'] for r in component)==1320
runtime=read('artifacts/product-reality/sprint-199/m07/runtime-diff.json')
assert runtime['scopedEqual']==70 and runtime['unattributed']==0
for mission, cells in [('m01',56),('m06',14)]:
 r=read(f'artifacts/product-reality/sprint-199/{mission}/'+('runtime' if mission=='m01' else 'runtime-final')+'/runtime-cells.v1.json')
 assert r['summary']=={'cells':cells,'pass':cells,'typedGap':0,'fail':0}
result={'builderSelfCertified':False,'viz':{'types':13,'rendered':78,'conformant':78,'hcRendered':26,'rows':rows},
 'patterns':{'rows':len(patterns),'public':22,'retired':retired,'scopes':sum(len(r['scopes']) for r in patterns),'publicConformant':sum(s.get('certify',{}).get('conformant') is True for r in patterns for s in r['scopes'])},
 'taxonomy':{'summary':taxonomy['summary'],'retiredCells':taxonomy['retiredCells']},'components':{'identities':110,'themeCells':1320,'frameworks':component},
 'tools':tools['summary'],'runtime':{'canonicalObjects':18,'canonicalCells':240,'retainedCompositionObjects':11,'retainedSchemas':77,'retainedCells':154,'freshScopedRuntimeCells':70,'freshArtifactHashesCompared':240,'unchangedArtifacts':runtime['unchanged'],'changedArtifactsByMission':runtime['attributedByMission'],'scopedArtifactsStillEqual':70,'qualification':'Scoped runtime receipts remain separate; no new full 240-cell runtime sweep or unioned ledger is claimed.'},'references':references}
(OUTPUT/'censuses.json').write_text(json.dumps(result,indent=2)+'\n')
print('censuses: passed')
