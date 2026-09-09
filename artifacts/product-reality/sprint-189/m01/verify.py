import sys
sys.dont_write_bytecode = True
import hashlib,json
from pathlib import Path
from observe import ROOT, OUT, hashes, sha
from public_probes import call

def read(name):return json.loads((OUT/name).read_text())
def result(name):return read(name)['response']['result']
before=read('before.json');after=read('after-restart.json');target='f4cd1ba3cda3d1d52405582e425ecd6d19890b51'
assert after['head']==target and after['porcelain']==''
assert after['pm2']['pid']!=before['pm2']['pid'] and str(after['pm2']['pid']) in after['listener']
assert all(after['pm2'][k]==before['pm2'][k] for k in ['cwd','script'])
revision=after['health']['revision'];manifest=read('structured-data-verification.json')
assert revision=={'commit':target,'structuredDataManifestHash':'sha256:'+manifest['manifestSha256']}
for package in ['mcp-server','mcp-bridge']:
 assert json.loads((ROOT/f'packages/{package}/dist/build-revision.json').read_text())==revision
assert after['health']['status']=='ok' and after['health']['toolset']['enabledCount']==20
workflow=result('call-01-workflow.json')['schema'];routes=[s['route'] for s in workflow['screens']]
assert routes==['/','/:id','/:id/edit','/:id/timeline'] and workflow['workflow']
artifacts={}
for framework,extension in [('react','tsx'),('vue','vue')]:
 generated=result('call-02-generate-'+framework+'.json');artifact=generated['artifact']
 assert generated['status']=='ok' and f'src/App.{extension}' in [f['path'] for f in artifact['files']]
 artifacts[framework]={'contentHash':artifact['contentHash'],'root':f'src/App.{extension}','files':len(artifact['files'])}
catalog=result('call-03-catalog.json');assert not catalog['hasMore'];rows={r['name']:r for r in catalog['components']}
foundation=json.loads((ROOT/'packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json').read_text())
nucleus=sorted(set(c['componentId'] for c in foundation['foundationCells']));assert len(nucleus)==14
recipes=sorted(json.loads((ROOT/'packages/mcp-server/src/compose/trait-recipes.json').read_text()));assert len(recipes)==8
for name in set(nucleus+recipes):
 for framework in ['react','vue']:
  surface=rows[name]['productReality']['surfaces'][framework]
  assert surface['state']=='implemented-evidence-complete' and surface['evidence'],(name,framework)
for name in recipes:assert rows[name]['status']=='stable',name

def nodes(node):
 if isinstance(node,dict):
  if 'component' in node:yield node['component']
  for v in node.values():yield from nodes(v)
 elif isinstance(node,list):
  for v in node:yield from nodes(v)
components=list(nodes(result('call-04-list.json')['schema']))
assert all(c in components for c in ['BillingSummaryBadge','ArchivedRowOverlay'])
store=hashes(ROOT/'packages/mcp-server/.oods/schemas');assert store==before['store']==after['store'] and len(store)==17
assert store['user-form-showcase.json']=='69110ea71d69ab911b744d84df640280c35850501dfcbd180079cbd9533a7812'
loaded=result('call-05-saved-load.json');assert loaded['version']==2
record=json.loads((ROOT/'packages/mcp-server/.oods/schemas/user-form-showcase.json').read_text())
print('Saved record keys',list(record))
# The public load returns a reference, so compare reference generation with exact disk schema generation.
loaded_artifacts={}
for framework in ['react','vue']:
 ref=call('call-06-loaded-'+framework,'code_generate',{'schemaRef':loaded['schemaRef'],'framework':framework,'profile':'build'})
 disk=call('call-07-disk-'+framework,'code_generate',{'schema':record['schema'],'framework':framework,'profile':'build'})
 assert ref['status']==disk['status']=='ok'
 assert ref['artifact']['contentHash']==disk['artifact']['contentHash']
 loaded_artifacts[framework]=ref['artifact']['contentHash']
assert hashes(ROOT/'packages/mcp-server/.oods/schemas')==store
(OUT/'store-hashes.json').write_text(json.dumps({'before':before['store'],'after':store,'unchangedFiles':17,'recordCount':16},indent=2)+'\n')
summary={'status':'passed','revision':revision,'routes':routes,'workflowArtifacts':artifacts,'catalogCount':catalog['totalCount'],'nucleusRows':nucleus,'stableRecipeRows':recipes,'listComponents':components,'storeFilesUnchanged':17,'loadedVersion':2,'loadedRecordSha256':store['user-form-showcase.json'],'loadedArtifactHashesMatchDisk':loaded_artifacts,'rollback':'validated, not executed'}
(OUT/'revision-verification.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2))
