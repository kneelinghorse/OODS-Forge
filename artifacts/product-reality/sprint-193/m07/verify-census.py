import json, collections, hashlib, subprocess
from pathlib import Path
base=Path('artifacts/product-reality/sprint-193/m07')
read=lambda file:json.loads(Path(file).read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
census=read(base/'component-census/report.json'); before=read('artifacts/product-reality/sprint-192/m07/component-census/report.json')
classes={r['id']:r['proposedClassification'] for r in read('packages/component-contracts/registry/component-reconciliation.proposed.v2.json')['rows']}
def nodes(n): return [n]+[v for c in n.get('children',[]) for v in nodes(c)]
def normalized(schema):
 ids={n['id']:f'node-{i}' for i,n in enumerate(n for s in schema['screens'] for n in nodes(s))}
 def clean(v):
  if isinstance(v,dict): return {k:clean(x) for k,x in v.items()}
  if isinstance(v,list): return [clean(x) for x in v]
  return ids.get(v,v) if isinstance(v,str) else v
 return json.dumps(clean(schema),sort_keys=True,separators=(',',':')).encode()
assert census['greenTotalSchemas']==77 and census['greenTotalCells']==154
attributions=read(base/'schema-attributions.json');rows=[]
for row in census['allRows']:
 old=next(r for r in before['allRows'] if r['input']==row['input']);a=read(old['composition']['path'])['schema'];b=read(row['composition']['path'])['schema'];key=row['input']['object']+'/'+row['input']['context']
 assert all(not c['errors'] for c in row['cells'])
 if normalized(a)==normalized(b): assert key not in attributions;continue
 attribution=attributions[key];assert attribution['reason'] and attribution['class']
 assert sha(normalized(a))==attribution['beforeNormalizedHash'] and sha(normalized(b))==attribution['afterNormalizedHash'],key
 ac=collections.Counter(n['component'] for s in a['screens'] for n in nodes(s));bc=collections.Counter(n['component'] for s in b['screens'] for n in nodes(s))
 items=lambda counter:[{'component':k,'count':v,'proposedClassification':classes[k]} for k,v in sorted(counter.items())]
 rows.append({'input':row['input'],'before':old['composition']['path'],'after':row['composition']['path'],**attribution,'added':items(bc-ac),'removed':items(ac-bc)})
assert len(rows)==len(attributions)
movement={'head':census['head'],'baseline':'c098237f1a1d026df4f1ad5c0ca51b15ebab0f4d','baselineReceiptHead':before['head'],'changedSchemas':len(rows),'unchangedSchemas':77-len(rows),'changedRuntimeCells':len(rows)*2,'classes':dict(collections.Counter(r['class'] for r in rows)),'rows':rows,'unattributedChanges':[],'normalization':'Only generated UI node IDs and exact references become deterministic traversal indices; every other schema byte participates. Component classes are proposals, not approvals.'}
(base/'schema-movement.json').write_text(json.dumps(movement,indent=2)+'\n')
original=read(base/'saved-original/report.json');successor=read(base/'saved-successor/report.json');hashes=lambda r:{v['schema']+'.json':v['input']['sha256'] for v in r['rows']}
assert hashes(original)==hashes(read('artifacts/product-reality/sprint-186/m05/reachability/report.json'))
adoption=read('artifacts/product-reality/sprint-188/m01/adoption.json');assert hashes(successor)=={k:v for k,v in adoption['after'].items() if k!='_index.json'}
assert original['reachable']==15 and successor['reachable']==16
live=Path('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/.oods/schemas');actual={p.name:sha(p.read_bytes()) for p in sorted(live.glob('*.json'))};assert actual==adoption['after']
(base/'saved-compatibility.json').write_text(json.dumps({'sourceHead':census['head'],'originalInputsUnchanged':True,'successorInputsUnchanged':True,'liveStoreFiles':17,'changedLiveFiles':0,'liveStore':{'path':str(live),'hashes':actual},'readOnly':True},indent=2)+'\n')
print(f'77 schemas/154 generation cells; {len(rows)} attributed changes; original15/16, successor16/16,17 unchanged live hashes.')
