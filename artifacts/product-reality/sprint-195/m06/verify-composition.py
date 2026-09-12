"""Bounded adaptation of the Sprint 194 composition movement verifier."""
import collections
import copy
import hashlib
import json
from pathlib import Path

base = Path('artifacts/product-reality/sprint-195/m06')
read = lambda file: json.loads(Path(file).read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
before = read(base / 'before-composition/report.json')
after = read(base / 'final-composition/report.json')
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

def without_new_chart(schema, mark):
    clone = copy.deepcopy(schema)
    def strip(node):
        children = node.get('children', [])
        if any(child.get('chart', {}).get('source') == 'record-array' for child in children):
            assert node['component'] == 'Stack' and node.get('meta', {}).get('intent') == 'slot:header'
            assert len(children) == 2 and children[0]['component'] == 'DetailHeader'
            return {**children[0], 'id': node['id'], 'meta': node['meta']}
        if children: node['children'] = [strip(child) for child in children]
        return node
    clone['screens'] = [strip(screen) for screen in clone['screens']]
    if 'workflow' in clone:
        traits = clone['workflow']['data']['traits']
        assert traits.count(mark) == 1
        traits.remove(mark)
    return clone

assert after['greenTotalSchemas'] == 77 and after['greenTotalCells'] == 154
expected = {(obj, context) for obj in ['Invoice', 'Usage'] for context in ['detail', 'workflow']}
rows = []
for row in after['allRows']:
    old = next(item for item in before['allRows'] if item['input'] == row['input'])
    left, right = read(old['composition']['path'])['schema'], read(row['composition']['path'])['schema']
    key = (row['input']['object'], row['input']['context'])
    assert all(not cell['errors'] for cell in row['cells'])
    if normalized(left) == normalized(right):
        assert key not in expected
        continue
    assert key in expected, f'Unattributed schema change: {key}'
    component, mark = ('VizMarkPreview', 'viz/MarkBar') if key[0] == 'Invoice' else ('VizLinePreview', 'viz/MarkLine')
    left_counts = collections.Counter(node['component'] for screen in left['screens'] for node in nodes(screen))
    right_counts = collections.Counter(node['component'] for screen in right['screens'] for node in nodes(screen))
    assert dict(right_counts - left_counts) == {'Stack': 1, component: 1}
    assert not left_counts - right_counts
    assert normalized(left) == normalized(without_new_chart(right, mark)), f'Non-chart schema movement: {key}'
    rows.append({'input': row['input'], 'before': old['composition']['path'], 'after': row['composition']['path'],
                 'class': 'bound-domain-chart', 'missionId': 's195-m06',
                 'reason': 'Adds the authored record-array chart beside the retained record header; workflow trait provenance includes its mark.',
                 'beforeNormalizedHash': sha(normalized(left)), 'afterNormalizedHash': sha(normalized(right)),
                 'added': [{'component': name, 'count': count, 'proposedClassification': classes[name]} for name, count in sorted((right_counts-left_counts).items())],
                 'removed': [], 'allOtherSchemaContentPreserved': True})
assert len(rows) == len(expected)
result = {'baselineHead': before['head'], 'executionHead': after['head'], 'sourceState': 'worktree',
          'changedSchemas': len(rows), 'unchangedSchemas': 77-len(rows), 'generationCells': 154, 'passedGenerationCells': 154,
          'objectsGainingCharts': ['Invoice', 'Usage'], 'rows': rows, 'unattributedChanges': [],
          'normalization': 'Generated node IDs and exact references become traversal indices. All other bytes participate. A second comparison removes only the specified new chart/header stack and added workflow mark; it proves the remaining schema is unchanged.'}
(base / 'schema-movement.json').write_text(json.dumps(result, indent=2) + '\n')
print('77 compositions / 154 generation cells; exactly 4 chart additions; 73 unchanged schemas; no removed components or other schema movement.')
