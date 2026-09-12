"""Bounded s195-style attribution of the UTC migration; historical bytes are immutable."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[2]
out = root / 'artifacts/product-reality/sprint-196/m05/golden-migration'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
parser.add_argument('--head', help='Exact implementation commit for tracked after-state bytes')
args = parser.parse_args()
read = lambda path: json.loads((root / path).read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
baseline = read(out.relative_to(root) / 'baseline.json')
if args.head:
    assert re.fullmatch(r'[a-f0-9]{40}', args.head), 'Expected exact implementation commit'
    assert subprocess.check_output(['git', 'cat-file', '-t', args.head], cwd=root, text=True).strip() == 'commit'
git_bytes = lambda head, path: subprocess.check_output(['git', 'show', f'{head}:{path}'], cwd=root)
after_bytes = lambda path: git_bytes(args.head, path) if args.head else (root / path).read_bytes()
reason = 's196-m05 UTC temporal scales, time units and adapter-generated parsing; host TZ no longer selects chart pixels'
snapshot_entries = lambda text: dict(re.findall(r'exports\[`(.*?)`\] = `(.*?)`;\n', text, re.S))
files, snapshots = [], []
for prior in baseline['trackedFiles']:
    path = prior['path']
    if path.startswith('artifacts/'):
        assert sha((root / path).read_bytes()) == prior['sha256'], f'Historical golden changed: {path}'
        continue
    now = after_bytes(path)
    if sha(now) == prior['sha256']:
        continue
    assert prior['class'] in ['snapshot', 'registry'], f'Undeclared golden class changed: {path}'
    # Host/release registries are refreshed in m07 and must not be silently rebaked here.
    assert path not in ['packages/mcp-server/registry/runtime-cells.v1.json', 'packages/mcp-server/registry/release-cells.v1.json'], f'Runtime ledger changed outside m07: {path}'
    files.append({'file': path, 'class': prior['class'], 'beforeSha256': prior['sha256'], 'afterSha256': sha(now), 'reason': reason})
    if prior['class'] == 'snapshot':
        old = snapshot_entries(git_bytes(baseline['beforeHead'], path).decode())
        new = snapshot_entries(now.decode())
        assert old.keys() == new.keys(), f'Snapshot identities changed: {path}'
        for identity in old:
            if old[identity] == new[identity]:
                continue
            # Existing composite dashboard snapshots carry temporal panels; their
            # independent non-temporal counterparts are checked in the matrix below.
            temporal = re.search(r'"type": "temporal"|"type": "time"|timeParse\(|month:|date:|timestamp:', old[identity])
            assert temporal, f'Non-temporal snapshot moved: {path}/{identity}'
            snapshots.append({'file': path, 'identity': identity, 'class': 'temporal-svg-or-html' if '<svg' in old[identity] else 'temporal-spec-or-option', 'beforeSha256': sha(old[identity].encode()), 'afterSha256': sha(new[identity].encode()), 'reason': reason})

current_matrix_path = str(out.relative_to(root) / 'matrix/matrix.json')
census_path = 'artifacts/product-reality/sprint-196/m05/viz/viz-observations.json'
patterns_path = 'artifacts/product-reality/sprint-196/m05/patterns/pattern-observations.json'
matrix, census, patterns = map(read, [current_matrix_path, census_path, patterns_path])
key = lambda kind, theme, brand: f'{kind}/{theme}/{brand}'
chart_hashes = {key(row['chartType'], row['theme'], row['brand']): row['svgHash'] for row in matrix['table']}
census_hashes = {key(row['chartType'], scope['theme'], scope['brand']): scope.get('svgHash') for row in census['observations'] for scope in row['scopes']}
dashboard_hashes = {key('dashboard', row['theme'], row['brand']): row['outputHtmlHash'] for row in matrix['dashboards']}
pattern_hashes = {key(row['id'], row['request']['theme'], row['request']['brand']): row['rendered'].get('svgHash') for row in patterns['cells']}
rows = []
def record(source, pointer, cls, identity, previous, current):
    if previous is None and current is None:
        return  # Retained typed HC deferral, never treated as a rendered cell.
    assert previous and current, f'Render disposition changed: {source}/{pointer}/{identity}'
    temporal = identity.split('/')[0] in ['line', 'area', 'pattern:viz:running-total-area', 'running-total-area', 'dashboard']
    current_epoch = '/sprint-195/m05/' in source
    changed = previous != current
    assert not (current_epoch and changed and not temporal), f'Non-temporal current-epoch pixels moved: {source}/{identity}'
    rows.append({'source': source, 'pointer': pointer, 'class': cls, 'identity': identity, 'temporal': temporal,
                 'beforeHash': previous, 'afterHash': current, 'status': 'superseded' if changed else 'unchanged',
                 'reason': reason if changed and temporal else 'Earlier epoch differences retain their original palette receipts; this migration does not change current non-temporal pixels.' if changed else 'Byte-identical current output.'})
for item in baseline['historicalMatrices']:
    source = item['path']
    assert sha((root / source).read_bytes()) == item['sha256'], f'Historical matrix changed: {source}'
    data = read(source)
    if not isinstance(data, dict):
        continue
    for index, row in enumerate(data.get('table', [])):
        identity = key(row['chartType'], row.get('theme', row.get('render', {}).get('theme', 'light')), row.get('brand', row.get('render', {}).get('brand', 'A')))
        record(source, f'/table/{index}', 'public-chart-matrix', identity, row['svgHash'], chart_hashes[identity])
    for index, row in enumerate(data.get('observations', [])):
        for scope_index, scope in enumerate(row['scopes']):
            identity = key(row['chartType'], scope['theme'], scope['brand'])
            record(source, f'/observations/{index}/scopes/{scope_index}', 'public-census', identity, scope.get('svgHash'), census_hashes[identity])
    for index, row in enumerate(data.get('dashboards', [data['dashboard']] if 'dashboard' in data else [])):
        identity = key('dashboard', row.get('theme', 'light'), row.get('brand', 'A'))
        pointer = f'/dashboards/{index}' if 'dashboards' in data else '/dashboard'
        record(source, pointer, 'dashboard-html', identity, row.get('outputHtmlHash', row.get('htmlHash')), dashboard_hashes[identity])
    for index, row in enumerate(data.get('cells', []) if isinstance(data.get('cells'), list) else []):
        if row.get('rendered', {}).get('svgHash'):
            identity = key(row['id'], row['request']['theme'], row['request']['brand'])
            record(source, f'/cells/{index}', 'public-pattern', identity, row['rendered']['svgHash'], pattern_hashes[identity])

inputs = [str(out.relative_to(root) / 'baseline.json'), current_matrix_path, census_path, patterns_path]
report = {'schemaVersion': 1, 'missionId': 's196-m05', 'builderSelfCertified': False, 'beforeHead': baseline['beforeHead'],
          **({'qualificationHead': args.head} if args.head else {}), 'historicalRawFilesUnchanged': True,
          'sourceHashes': [{'path': path, 'sha256': sha((root / path).read_bytes())} for path in inputs],
          'files': files, 'snapshotEntries': snapshots, 'matrixRows': rows,
          'summary': {'changedGoldenFiles': len(files), 'movedSnapshotEntries': len(snapshots), 'matrixRows': len(rows),
                      'currentEpochMovedRows': sum('/sprint-195/m05/' in row['source'] and row['status'] == 'superseded' for row in rows),
                      'classes': {cls: {'total': sum(row['class'] == cls for row in rows), 'superseded': sum(row['class'] == cls and row['status'] == 'superseded' for row in rows)} for cls in sorted({row['class'] for row in rows})}}}
text = json.dumps(report, indent=2) + '\n'
if args.check:
    assert (out / 'golden-attribution.json').read_text() == text, 'Temporal golden attribution is stale'
else:
    (out / 'golden-attribution.json').write_text(text)
print(json.dumps(report['summary']))
