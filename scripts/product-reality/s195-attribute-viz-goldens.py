"""Bounded s191-style attribution of m05 palette goldens and superseded matrix rows."""
import argparse
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path

root = Path(os.environ.get('OODS_VIZ_CENSUS_ROOT', Path(__file__).resolve().parents[2]))
out = root / 'artifacts/product-reality/sprint-195/m05/golden-migration'
read = lambda path: json.loads((root / path).read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
baseline = read(out.relative_to(root) / 'baseline.json')
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
parser.add_argument('--head', help='Exact 40-character implementation commit for tracked after-state bytes')
args = parser.parse_args()
if args.head:
    assert re.fullmatch(r'[a-f0-9]{40}', args.head), '--head requires an exact 40-character commit'
    assert subprocess.check_output(['git', 'cat-file', '-t', args.head], cwd=root, text=True).strip() == 'commit'
changed = subprocess.check_output(['git', 'diff', '--name-only', '--diff-filter=M', baseline['beforeHead'], *([args.head] if args.head else [])], cwd=root, text=True).splitlines()
def tracked_bytes(path):
    return subprocess.check_output(['git', 'show', f'{args.head}:{path}'], cwd=root) if args.head else (root / path).read_bytes()
current_matrix = read(out.relative_to(root) / 'matrix/matrix.json')
current_census = read('artifacts/product-reality/sprint-195/m05/viz/viz-observations.json')
current_patterns = read('artifacts/product-reality/sprint-195/m05/patterns/pattern-observations.json')
key = lambda kind, theme, brand: f'{kind}/{theme}/{brand}'
chart_hashes = {key(row['chartType'], row['theme'], row['brand']): row['svgHash'] for row in current_matrix['table']}
census_hashes = {key(row['chartType'], scope['theme'], scope['brand']): scope.get('svgHash') for row in current_census['observations'] for scope in row['scopes']}
dashboard_hashes = {key('dashboard', row['theme'], row['brand']): row['outputHtmlHash'] for row in current_matrix['dashboards']}
pattern_hashes = {key(row['id'], row['request']['theme'], row['request']['brand']): row['rendered'].get('svgHash') for row in current_patterns['cells']}
reason = 's195-m05 categorical Role-A palette revision selected by measured CVD separation with Role-C preserved; inputs and renderer contract retained'
files, snapshots = [], []
snapshot_entries = lambda text: dict(re.findall(r'exports\[`(.*?)`\] = `(.*?)`;\n', text, re.S))
for prior in baseline['trackedFiles']:
    path = root / prior['path']
    if prior['path'].startswith('artifacts/'):
        assert sha(path.read_bytes()) == prior['sha256'], f'Historical golden mutated: {path}'
        continue
    if args.head and prior['path'] not in changed:
        continue
    now = tracked_bytes(prior['path'])
    if sha(now) == prior['sha256']:
        continue
    assert not prior['path'].startswith('artifacts/'), f'Historical golden mutated: {path}'
    cls = prior['class']
    why = reason if cls in ['snapshot', 'svg', 'token', 'certified-matrix'] else 's195-m05 public HC scope admission, measured pixel/certification metadata, or explicit palette migration assertions; historical raw fixtures remain unchanged'
    files.append({'file': prior['path'], 'class': cls, 'beforeSha256': prior['sha256'], 'afterSha256': sha(now), 'reason': why})
    if cls == 'snapshot':
        old = snapshot_entries((out / 'before' / prior['path']).read_text())
        new = snapshot_entries(now.decode())
        assert old.keys() == new.keys(), f'Unexpected snapshot identity change: {path}'
        for identity in old:
            if old[identity] != new[identity]:
                snapshots.append({'file': prior['path'], 'identity': identity, 'class': 'svg-or-html' if '<svg' in old[identity] else 'render-spec-or-option', 'beforeSha256': sha(old[identity].encode()), 'afterSha256': sha(new[identity].encode()), 'reason': reason})
# s191 attribution also records modified prose and colocated test pins from the fixed base.
known = {row['file'] for row in files}
for path in changed:
    if path in known or path.startswith('artifacts/'):
        continue
    cls = 'documentation' if path.startswith('docs/') or path.endswith('tool-descriptions.json') else 'test-or-fixture' if re.search(r'\.(spec|test)\.', path) else None
    if cls is None:
        continue
    previous = subprocess.check_output(['git', 'show', f"{baseline['beforeHead']}:{path}"], cwd=root)
    files.append({'file': path, 'class': cls, 'beforeSha256': sha(previous), 'afterSha256': sha(tracked_bytes(path)), 'reason': 's195-m05 documents measured Role-A separation and four public HC types/nine typed deferrals, or asserts that exact public contract; frozen historical records are unchanged'})
files.sort(key=lambda row: row['file'])
new_svg_evidence = [{'path': str(path.relative_to(root)), 'sha256': sha(path.read_bytes()), 'class': 'forced-colors-browser-proof' if '/browser/' in str(path) else 'remeasured-legacy-matrix', 'reason': 'New m05 evidence; no previous golden is overwritten.'} for path in sorted((out.parent).rglob('*.svg')) if '/before/' not in str(path)]
rows = []
def record(source, pointer, cls, identity, previous, current):
    assert current, f'No measured replacement for {source}/{pointer}/{identity}'
    rows.append({'source': source, 'pointer': pointer, 'class': cls, 'identity': identity, 'beforeHash': previous, 'afterHash': current, 'status': 'unchanged' if previous == current else 'superseded', 'reason': 'Current palette emits identical bytes for this cell.' if previous == current else ('s195-m05 palette epoch supersedes this historical row; prior historical deltas retain their original receipts. ' + reason)})
for item in baseline['historicalMatrices']:
    source, data = item['path'], item['value']
    assert sha((root / source).read_bytes()) == item['sha256'], f'Historical matrix changed: {source}'
    if not isinstance(data, dict):
        continue
    for index, row in enumerate(data.get('table', [])):
        theme = row.get('theme', row.get('render', {}).get('theme', 'light'))
        brand = row.get('brand', row.get('render', {}).get('brand', 'A'))
        identity = key(row['chartType'], theme, brand)
        record(source, f'/table/{index}', 'public-chart-matrix', identity, row['svgHash'], chart_hashes[identity])
    for index, row in enumerate(data.get('observations', [])):
        for scope_index, scope in enumerate(row['scopes']):
            identity = key(row['chartType'], scope['theme'], scope['brand'])
            record(source, f'/observations/{index}/scopes/{scope_index}', 'public-census', identity, scope['svgHash'], census_hashes[identity])
    dashboards = data.get('dashboards', [data['dashboard']] if 'dashboard' in data else [])
    for index, row in enumerate(dashboards):
        identity = key('dashboard', row.get('theme', 'light'), row.get('brand', 'A'))
        previous = row.get('outputHtmlHash', row.get('htmlHash'))
        assert previous, f'Missing dashboard hash: {source}'
        record(source, f'/dashboards/{index}', 'dashboard-html', identity, previous, dashboard_hashes[identity])
    for index, row in enumerate(data.get('cells', []) if isinstance(data.get('cells'), list) else []):
        if row.get('rendered', {}).get('svgHash'):
            identity = key(row['id'], row['request']['theme'], row['request']['brand'])
            record(source, f'/cells/{index}', 'public-pattern', identity, row['rendered']['svgHash'], pattern_hashes[identity])
old_certified = json.loads((out / 'before/packages/viz-render/certified-matrix.json').read_text())
new_certified = json.loads(tracked_bytes('packages/viz-render/certified-matrix.json'))
for family, previous in old_certified['normalizedSvgHashes'].items():
    record('packages/viz-render/certified-matrix.json', f'/normalizedSvgHashes/{family}', 'certified-render-matrix', family, previous, new_certified['normalizedSvgHashes'][family])
inputs = ['artifacts/product-reality/sprint-195/m05/viz/viz-observations.json', 'artifacts/product-reality/sprint-195/m05/patterns/pattern-observations.json', str(out.relative_to(root) / 'baseline.json'), str(out.relative_to(root) / 'matrix/matrix.json')]
report = {'schemaVersion': 1, 'missionId': 's195-m05', 'builderSelfCertified': False, 'beforeHead': baseline['beforeHead'], **({'qualificationHead': args.head} if args.head else {}), 'sourceHashes': [{'path': path, 'sha256': sha((root / path).read_bytes())} for path in inputs], 'historicalRawFilesUnchanged': True, 'files': files, 'snapshotEntries': snapshots, 'newSvgEvidence': new_svg_evidence, 'matrixRows': rows, 'summary': {'changedFiles': len(files), 'changedSnapshotFiles': sum(row['class'] == 'snapshot' for row in files), 'changedTestFiles': sum(row['class'] == 'test-or-fixture' for row in files), 'changedDocumentationFiles': sum(row['class'] == 'documentation' for row in files), 'newSvgEvidence': len(new_svg_evidence), 'movedSnapshotEntries': len(snapshots), 'matrixRows': len(rows), 'supersededMatrixRows': sum(row['status'] == 'superseded' for row in rows), 'previousMissionScopes': sum(row['source'] == 'artifacts/product-reality/sprint-195/m04/viz/viz-observations.json' for row in rows), 'previousMissionMovedScopes': sum(row['source'] == 'artifacts/product-reality/sprint-195/m04/viz/viz-observations.json' and row['status'] == 'superseded' for row in rows), 'classes': {cls: {'total': sum(row['class'] == cls for row in rows), 'superseded': sum(row['class'] == cls and row['status'] == 'superseded' for row in rows)} for cls in sorted(set(row['class'] for row in rows))}}}
text = json.dumps(report, indent=2) + '\n'
if args.check:
    assert (out / 'golden-attribution.json').read_text() == text, 'Golden attribution is stale'
else:
    (out / 'golden-attribution.json').write_text(text)
print(json.dumps(report['summary']))
