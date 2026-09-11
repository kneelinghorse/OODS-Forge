import json,collections,hashlib
from pathlib import Path
root=Path('artifacts/product-reality/sprint-193'); census=json.loads((root/'m04/component-census/report.json').read_text()); proposal=json.loads(Path('packages/component-contracts/registry/component-reconciliation.proposed.v2.json').read_text());classes={row['id']:row['proposedClassification'] for row in proposal['rows']}
def nodes(n):return [n]+[a for c in n.get('children',[]) for a in nodes(c)]
def normalize(schema):
 ids={n['id']:f'node-{i}' for i,n in enumerate(n for s in schema['screens'] for n in nodes(s))}
 def clean(v):
  if isinstance(v,dict):return {k:clean(x) for k,x in v.items()}
  if isinstance(v,list):return [clean(x) for x in v]
  if isinstance(v,str):return ids.get(v,v)
  return v
 return json.dumps(clean(schema),sort_keys=True,separators=(',',':'))
rows=[];unattributed=[]
for row in census['allRows']:
 obj=row['input']['object'];ctx=row['input']['context'];oldpath=root/'m03'/('workflows/'+obj+'/composition.json' if ctx=='workflow' else f'cells/{obj}/{ctx}/react/composition.json')
 old=json.loads(oldpath.read_text())['schema'];new=json.loads(Path(row['composition']['path']).read_text())['schema']
 a=collections.Counter(n['component'] for s in old['screens'] for n in nodes(s));b=collections.Counter(n['component'] for s in new['screens'] for n in nodes(s));changed=normalize(old)!=normalize(new)
 def items(counts):return [{'component':name,'count':count,'proposedClassification':classes[name]} for name,count in sorted(counts.items())]
 result={'input':row['input'],'before':str(oldpath),'after':row['composition']['path'],'beforeNormalizedHash':'sha256:'+hashlib.sha256(normalize(old).encode()).hexdigest(),'afterNormalizedHash':'sha256:'+hashlib.sha256(normalize(new).encode()).hexdigest(),'changed':changed,'added':items(b-a),'removed':items(a-b)}
 if changed and a==b:unattributed.append(row['input'])
 rows.append(result)
doc={'baselineHead':'909bf5427454af14f4b98d618daa81db4c873902','comparedHead':census['head'],'normalization':'Replace only generated UI node IDs and exact references with deterministic traversal indices; preserve all other schema content.','schemaCount':len(rows),'changedSchemas':sum(r['changed'] for r in rows),'changedRuntimeCells':sum(r['changed'] for r in rows)*2,'unattributedChanges':unattributed,'builderSelfCertified':False,'rows':rows}
(root/'m04/movement.json').write_text(json.dumps(doc,indent=2)+'\n');print({k:v for k,v in doc.items() if k not in ['rows','normalization']});assert not unattributed
