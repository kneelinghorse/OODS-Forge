"""Bounded Sprint 195 census verifier: Sprint 196 changes rendering, not composition."""
import collections
import hashlib
import json
from pathlib import Path

base = Path('artifacts/product-reality/sprint-196/m07')
read = lambda file: json.loads(Path(file).read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
before = read('artifacts/product-reality/sprint-195/m07/component-census/report.json')
after = read(base / 'component-census/report.json')
classes = {row['id']: row['proposedClassification'] for row in read('packages/component-contracts/registry/component-reconciliation.proposed.v2.json')['rows']}

def nodes(node):
    return [node] + [child for item in node.get('children', []) for child in nodes(item)]

def normalized(schema):
    ids = {node['id']: f'node-{index}' for index, node in enumerate(node for screen in schema['screens'] for node in nodes(screen))}
    def clean(value):
        if isinstance(value, dict): return {key: clean(item) for key, item in value.items()}
        if isinstance(value, list): return [clean(item) for item in value]
        return ids.get(value, value) if isinstance(value, str) else value
    return json.dumps(clean(schema), sort_keys=True, separators=(',', ':')).encode()

assert after['greenTotalSchemas'] == 77 and after['greenTotalCells'] == 154
assert len(after['allRows']) == len(before['allRows']) == 77
key = lambda row: (row['input']['object'], row['input']['context'])
old_rows = {key(row): row for row in before['allRows']}
assert len(old_rows) == 77 and set(old_rows) == {key(row) for row in after['allRows']}
observed = []
for row in after['allRows']:
    old = old_rows[key(row)]
    for item in [old, row]:
        assert sha(Path(item['composition']['path']).read_bytes()) == item['composition']['sha256']
    left, right = read(old['composition']['path'])['schema'], read(row['composition']['path'])['schema']
    assert normalized(left) == normalized(right), f'Undeclared composed-schema movement: {key(row)}'
    assert {cell['framework'] for cell in row['cells']} == {'react', 'vue'}
    for cell in row['cells']:
        assert cell['status'] == 'ok' and cell['artifactPresent'] and not cell['errors']
        assert sha(Path(cell['response']['path']).read_bytes()) == cell['response']['sha256']
    counts = collections.Counter(node['component'] for screen in right['screens'] for node in nodes(screen))
    observed.append({'input': row['input'], 'before': old['composition'], 'after': row['composition'],
                     'beforeNormalizedHash': sha(normalized(left)), 'afterNormalizedHash': sha(normalized(right)),
                     'components': [{'component': name, 'count': count, 'proposedClassification': classes[name]} for name, count in sorted(counts.items())],
                     'class': 'unchanged-composed-schema', 'added': [], 'removed': []})
result = {'baselineHead': before['head'], 'head': after['head'], 'executionHead': after['head'],
          'changedSchemas': 0, 'unchangedSchemas': 77, 'generationCells': 154, 'passedGenerationCells': 154,
          'classes': {}, 'objectsGainingCharts': [], 'rows': [], 'allRows': observed, 'unattributedChanges': [],
          'normalization': 'Generated node IDs and exact references become traversal indices. All other composed-schema bytes participate. UTC generated artifact changes are separately bound by the m05 golden migration and m07 runtime proof.'}
(base / 'schema-movement.json').write_text(json.dumps(result, indent=2) + '\n')
original = read(base / 'saved-original/report.json'); successor = read(base / 'saved-successor/report.json')
hashes = lambda report: {row['schema'] + '.json': row['input']['sha256'] for row in report['rows']}
assert hashes(original) == hashes(read('artifacts/product-reality/sprint-186/m05/reachability/report.json'))
adoption = read('artifacts/product-reality/sprint-188/m01/adoption.json')
assert hashes(successor) == {name: value for name, value in adoption['after'].items() if name != '_index.json'}
assert original['reachable'] == 15 and successor['reachable'] == 16
live = Path('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/.oods/schemas')
actual = {file.name: sha(file.read_bytes()) for file in sorted(live.glob('*.json'))}
assert actual == adoption['after'] and len(actual) == 17
(base / 'saved-compatibility.json').write_text(json.dumps({'sourceHead': after['head'], 'originalInputsUnchanged': True, 'successorInputsUnchanged': True,
    'liveStoreFiles': 17, 'changedLiveFiles': 0, 'liveStore': {'path': str(live), 'hashes': actual}, 'readOnly': True}, indent=2) + '\n')
print('77 unchanged composed schemas, 154 generation cells; original15/16, successor16/16;17 unchanged live store hashes.')
