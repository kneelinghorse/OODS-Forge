"""Assemble final root and saved-store references from retained executions."""
import hashlib
import json
import pathlib
import re
import subprocess

root = pathlib.Path(__file__).resolve().parents[4]
b = pathlib.Path('artifacts/product-reality/sprint-187/m06')
def read(file): return json.loads((root / file).read_text())
def ref(file): return dict(path=str(file), sha256=hashlib.sha256((root / file).read_bytes()).hexdigest())
def write(file, data):
    assert not (root / file).exists(), f'Preserve previous evidence: {file}'
    (root / file).write_text(json.dumps(data, indent=2) + '\n')
def ids(text):
    return re.findall(r"'([^']+)'", re.search(r'export const NUCLEUS_COMPONENT_IDS = \[([\s\S]*?)\] as const', text).group(1))
types = 'packages/component-contracts/src/types.ts'
current = ids((root / types).read_text())
prior = ids(subprocess.check_output(['git', 'show', '21c7c319:' + types], cwd=root, text=True))
added = sorted(set(current) - set(prior))
assert len(current) == len(set(current)) == 64 and len(added) == 14
readiness = read(b / 'readiness.json'); positive = read(b / 'positive-exports.json')
assert readiness['status'] == 'passed' and readiness['totals']['resolved'] == readiness['totals']['references'] == 778
assert positive['success'] and positive['numPassedTests'] == 28 and positive['numFailedTests'] == positive['numPendingTests'] == 0
mutations = [pathlib.Path(f'artifacts/product-reality/sprint-187/m0{mission}/mutation-attempt-1/mutation-manifest.json') for mission in [2, 3, 4]]
cells = []
for file in mutations:
    for row in read(file)['mutants']:
        cell = row['selectedCell']; cells.append(cell)
        assert row['status'] == 'passed' and row['restoredByteIdentically'] and row['sourceSha256Before'] != row['sourceSha256Deleted']
        assert row['selectedRed']['packageRedCells'] == row['selectedRed']['readinessRedCells'] == [cell]
        assert all(obs['status'] == 'passed' for obs in row['restoredGreen']['observations'])
        for phase, code in [('selectedRed', 1), ('restoredGreen', 0)]:
            for target in ['packageRun', 'readinessRun']:
                assert row[phase][target]['exitCode'] == code
                ref(row[phase][target]['log'])
            ref(row[phase]['packageReport']); ref(row[phase]['readinessReport'])
assert sorted(cells) == sorted(f'{target}/{name}' for name in added for target in ['react', 'vue'])
write(b / 'root-evidence.json', dict(governedIds=sorted(current), addedIds=added,
    readiness=ref(b / 'readiness.json'), positiveExports=ref(b / 'positive-exports.json'), mutations=[ref(file) for file in mutations]))
historical_path = pathlib.Path('artifacts/product-reality/sprint-186/m05/reachability/report.json')
historical = read(historical_path); original = read(b / 'saved-original/report.json'); successor = read(b / 'saved-successor/report.json')
hashes = lambda report: {row['schema']: row['input']['sha256'] for row in report['rows']}
assert original['total'] == historical['total'] == 16 and original['reachable'] == historical['reachable'] == 15
assert hashes(original) == hashes(historical)
assert successor['total'] == successor['reachable'] == 16 and successor['generatedCells'] == 32
adoption_path = pathlib.Path('artifacts/product-reality/sprint-187/m05/delivery-final/recomposition.json')
adoption = read(adoption_path)
assert {row['schema'] + '.json': row['input']['sha256'] for row in successor['rows']} == {k:v for k,v in adoption['successorHashes'].items() if k != '_index.json'}
for report in [original, successor]:
    assert all(ref(row['input']['path'])['sha256'] == row['input']['sha256'] for row in report['rows'])
negative = next(row for row in historical['rows'] if not row['reachable'])
assert negative['schema'] == 'user-form-showcase'
references = [ref(historical_path), ref(adoption_path)]
for cell in negative['cells']:
    file = historical_path.parent / cell['response']['path']
    assert ref(file)['sha256'] == cell['response']['sha256']
    references.append(ref(file))
write(b / 'saved-compatibility.json', dict(originalInputsUnchanged=True, successorInputsUnchanged=True,
    historicalNegativeRetained=True, originalBaseline=15, successorBaseline=16,
    originalDeltaExplanation='No original-input improvement: all sixteen record hashes match the retained s186-m05 original-store census, and User-form remains the same negative. The distinct authentic m05 successor changes only User-form through compose/save/load; its sixteen exact hashes match the disposable adoption rehearsal.',
    originalMeasured=original['reachable'], successorMeasured=successor['reachable'], references=references))
print(json.dumps(dict(status='passed', rootIds=64, addedFamilies=14, exportBites=len(cells), readinessRefs=778,
    originalReachable=original['reachable'], successorReachable=successor['reachable'], originalInputsUnchanged=True, successorInputsUnchanged=True)))
