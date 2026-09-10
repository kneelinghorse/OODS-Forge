"""Verify delivery from retained public receipts and live, read-only identity."""
import sys
sys.dont_write_bytecode = True
import json
from observe import ROOT, OUT, hashes

def read(name): return json.loads((OUT / name).read_text())
def result(name): return read(name)['response']['result']
def nodes(value):
    if isinstance(value, dict):
        if 'component' in value: yield value
        for child in value.values(): yield from nodes(child)
    elif isinstance(value, list):
        for child in value: yield from nodes(child)

before = read('before.json'); after = read('after-restart.json')
target = read('merged-identity.json')['deliveredCommit']
assert after['head'] == target and after['porcelain'] == ''
assert after['pm2']['pid'] != before['pm2']['pid']
assert str(after['pm2']['pid']) in after['listener']
assert all(after['pm2'][key] == before['pm2'][key] for key in ['cwd', 'script'])
revision = after['health']['revision']
assert revision == {'commit': target, 'structuredDataManifestHash': 'sha256:' + read('structured-data-verification.json')['manifestSha256']}
for package in ['mcp-server', 'mcp-bridge']:
    assert json.loads((ROOT / f'packages/{package}/dist/build-revision.json').read_text()) == revision
assert after['health']['status'] == 'ok' and after['health']['toolset']['enabledCount'] == 21
tools = read('tools.json')['tools']
assert len(tools) == 21 and 'design_preview' in tools
preview = read('call-00-preview.json')
assert preview['httpStatus'] == 400 and preview['response']['error']['code'] == 'OODS-N019'

listing = list(nodes(result('call-04-list.json')['schema']))
collections = [node['collection'] for node in listing if 'collection' in node]
assert any(row['source'] == 'rows' and row['keyField'] == 'subscription_id' for row in collections)
controls = {node['collectionControl'] for node in listing if 'collectionControl' in node}
assert {'search', 'filter', 'page'} <= controls
assert all(node.get('collectionControl') == 'search' for node in listing if node['component'] == 'SearchInput')
workflow = result('call-01-workflow.json')['schema']
assert workflow['workflow'] and [screen['route'] for screen in workflow['screens']] == ['/', '/:id', '/:id/edit', '/:id/timeline']
artifacts = {}
for framework, extension in [('react', 'tsx'), ('vue', 'vue')]:
    generated = result('call-02-generate-' + framework + '.json')
    assert generated['status'] == 'ok'
    artifact = generated['artifact']; files = artifact['files']
    app = next(file for file in files if file['path'] == f'src/App.{extension}')
    assert all(banned not in app['contents'] for banned in ['workflow-records', 'workflow-toolbar', 'workflow-history'])
    artifacts[framework] = {'contentHash': artifact['contentHash'], 'root': app['path'], 'fileCount': len(files)}
labels = [node['props']['label'] for node in nodes(result('call-06-form.json')['schema']) if isinstance(node.get('props', {}).get('label'), str)]
assert labels and all(len(label) <= 40 and not label.endswith('.') for label in labels)
catalog = result('call-03-catalog.json'); assert not catalog['hasMore']
rows = {row['name']: row for row in catalog['components']}
foundation = json.loads((ROOT / 'packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json').read_text())
nucleus = sorted({cell['componentId'] for cell in foundation['foundationCells']}); assert len(nucleus) == 14
for name in nucleus:
    for framework in ['react', 'vue']:
        surface = rows[name]['productReality']['surfaces'][framework]
        assert surface['state'] == 'implemented-evidence-complete' and surface['evidence'], (name, framework)
store = hashes(ROOT / 'packages/mcp-server/.oods/schemas')
assert store == before['store'] == after['store'] and len(store) == 17
assert store['user-form-showcase.json'] == '69110ea71d69ab911b744d84df640280c35850501dfcbd180079cbd9533a7812'
assert result('call-05-saved-load.json')['version'] == 2
summary = {'status': 'passed', 'revision': revision, 'toolCount': len(tools), 'previewError': 'OODS-N019', 'collections': collections, 'collectionControls': sorted(controls), 'workflowArtifacts': artifacts, 'formLabels': labels, 'nucleusRows': nucleus, 'storeFilesUnchanged': 17, 'loadedVersion': 2, 'loadedRecordSha256': store['user-form-showcase.json'], 'rollback': 'validated, not executed'}
(OUT / 'store-hashes.json').write_text(json.dumps({'before': before['store'], 'after': store, 'unchangedFiles': 17, 'recordCount': 16}, indent=2) + '\n')
(OUT / 'revision-verification.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
