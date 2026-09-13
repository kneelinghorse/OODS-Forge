"""Sprint 197 retained-roster comparison: palette and generated paint move; composed schemas remain unchanged."""
import collections
import hashlib
import json
from pathlib import Path

base = Path('artifacts/product-reality/sprint-197/m07')
read = lambda file: json.loads(Path(file).read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
before = read('artifacts/product-reality/sprint-196/m07/component-census/report.json')
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
    return json.dumps(clean(schema), sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()

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
          'normalization': 'Generated node IDs and exact references become traversal indices. All other composed-schema bytes participate. The explicit original eleven-object roster is the retained comparison; current eighteen-object support is separately measured by runtime240. Palette changes are separately bound by m05 goldens and m07 runtime proof.'}
(base / 'schema-movement.json').write_text(json.dumps(result, indent=2) + '\n')
original = read(base / 'saved-original/report.json'); successor = read(base / 'saved-successor/report.json')
hashes = lambda report: {row['schema'] + '.json': row['input']['sha256'] for row in report['rows']}
assert hashes(original) == hashes(read('artifacts/product-reality/sprint-186/m05/reachability/report.json'))
adoption = read('artifacts/product-reality/sprint-188/m01/adoption.json')
assert hashes(successor) == {name: value for name, value in adoption['after'].items() if name != '_index.json'}
assert original['reachable'] == 15 and successor['reachable'] == 16
live = Path('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/.oods/schemas')
actual = {file.name: sha(file.read_bytes()) for file in sorted(live.glob('*.json'))}
cohort = Path('artifacts/product-reality/sprint-187/m05/delivery-final/recomposed-store')
cohort_hashes = {file.name: sha(file.read_bytes()) for file in sorted(cohort.glob('*.json'))}
assert cohort_hashes == adoption['after'] and len(cohort_hashes) == 17
before = read(base / 'preparation/live-store-before.json')
assert actual == before['hashes'] and len(actual) == 37
index = read(live / '_index.json'); old_index = read(cohort / '_index.json')
by_name = {row['name']: row for row in index['schemas']}
assert all(by_name.get(row['name']) == row for row in old_index['schemas'])
assert all(actual[name] == value for name, value in cohort_hashes.items() if name != '_index.json')
(base / 'saved-compatibility.json').write_text(json.dumps({'sourceHead': after['head'], 'originalInputsUnchanged': True, 'successorInputsUnchanged': True,
    'cohortFiles': 17, 'changedCohortFiles': 0, 'cohortStore': {'path': str(cohort), 'hashes': cohort_hashes},
    'liveStoreFiles': 37, 'changedLiveFiles': 0, 'liveStore': {'path': str(live), 'hashes': actual}, 'readOnly': True,
    'snapshotRoot': str(base / 'saved-live-snapshot'), 'primaryBaseline': 'preparation/live-store-before.json', 'originalLiveSchemaFilesUnchanged': 16, 'originalIndexEntriesUnchanged': 16,
    'preExistingIndexExpansion': {'updatedAt': index['updatedAt'], 'additionalSchemas': sorted(set(actual) - set(cohort_hashes)),
      'beforeSha256': cohort_hashes['_index.json'], 'currentSha256': actual['_index.json'],
      'qualification': 'The live index grew on 2026-09-12 before Sprint197; its raw hash differs from the Sprint196 receipt. The fixed17-file cohort and sixteen original live schema files remain byte-identical; all original index entries are unchanged. The current37-file live store is read-only and hash-compared before/after this closeout.'}}, indent=2) + '\n')
print('77 unchanged composed schemas,154 generation cells;17 archived cohort files;37 current live files unchanged during closeout.')
