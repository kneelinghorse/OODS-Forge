"""Plan palette golden attribution BEFORE updates; finalize measured after-state later."""
import argparse
import hashlib
import difflib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'artifacts/product-reality/sprint-197/m05'
BASE = json.loads((ROOT / 'artifacts/product-reality/sprint-197/m01/baseline.json').read_text())
PAINTS = json.loads((OUT / 'changed-token-paints.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
paint_only = lambda text: re.sub(r'#[0-9A-Fa-f]{3,8}\b|(?:rgb|rgba|oklch|hsl)\([^)]*\)|[a-f0-9]{64}', '<paint-or-hash>', text)
def registry_semantics(value):
    if isinstance(value, list): return [registry_semantics(item) for item in value]
    if isinstance(value, dict): return {key: registry_semantics(item) for key, item in value.items() if key not in ['svgHash', 'renderHash']}
    # m04 declares the HC map canvas. This one old fallback drops from the
    # unchanged typed-deferral message; no other error-text movement is allowed.
    if isinstance(value, str) and 'HC renderer emitted paints outside the declared' in value:
        return value.replace('#f2f2f2, ', '')
    return value
read_before = lambda path: subprocess.check_output(['git', 'show', f"{BASE['beforeHead']}:{path}"], cwd=ROOT)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--finalize', action='store_true')
parser.add_argument('--check', action='store_true')
parser.add_argument('--head', help='Qualify tracked after-state against an exact implementation commit')
args = parser.parse_args()
if args.head:
    assert re.fullmatch('[a-f0-9]{40}', args.head), 'Expected full commit SHA'

def after_bytes(path):
    return subprocess.check_output(['git', 'show', f'{args.head}:{path}'], cwd=ROOT) if args.head else (ROOT / path).read_bytes()

paint_map = {}
for token in PAINTS['tokens']:
    if token['beforeHex']:
        paint_map.setdefault(token['beforeHex'], []).append(token['id'])
# Source oklch literals are also matched without converting them through a different oracle.
for token in PAINTS['tokens']:
    paint_map.setdefault(token['before'].lower(), []).append(token['id'])

plan_path = OUT / 'golden-attribution.before.json'
if not args.finalize:
    assert not args.head, '--head applies to final qualification'
    identities = []
    for row in BASE['trackedFiles']:
        if row['class'] not in ['svg', 'snapshot', 'registry', 'certified-matrix', 'pinned-literal-source']:
            continue
        data = (ROOT / row['path']).read_bytes()
        assert sha(data) == row['sha256'], f"Golden changed before attribution: {row['path']}"
        text = data.decode(errors='replace').lower()
        literals = set(re.findall(r'#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|oklch\([^)]*\)', text))
        matches = sorted(literals & paint_map.keys())
        historical = row['path'].startswith('artifacts/')
        ids = [] if historical or row['class'] == 'svg' else sorted(set(token for value in matches for token in paint_map[value]))
        identities.append({ 'file': row['path'], 'class': row['class'], 'beforeSha256': row['sha256'],
            'policy': 'immutable-historical-input' if historical else 'review-palette-delta',
            'matchedBeforePaints': matches, 'changedTokenIds': ids,
            'indirectDependency': None if ids else 'Re-rendered scoped token bundle or palette epoch; no direct old paint literal matched. Any actual change requires final diff classification.',
            'afterSha256': None })
    result = {'schemaVersion': 1, 'missionId': 's197-m05', 'phase': 'before-update',
        'beforeHead': BASE['beforeHead'], 'paletteHead': PAINTS['afterPaletteHead'], 'builderSelfCertified': False,
        'changedPaintInputsSha256': sha((OUT / 'changed-token-paints.json').read_bytes()),
        'method': 'Exact old hex/oklch input matches to changed scoped tokens identify dependencies, not new output hashes. Historical files are immutable. All actual diffs require classification in the final attribution.',
        'changedTokenScopes': {f'{brand}/{theme}': [t['id'] for t in PAINTS['tokens'] if t['brand'] == brand and t['theme'] == theme] for brand in ['A', 'B'] for theme in ['light', 'dark', 'hc']},
        'registryTokenBinding': 'Each registry scope binds to changedTokenScopes[brand/theme]; shared palette and chrome participate in every rendered chart identity. Snapshot/test literal matches above are exact old-paint dependencies.',
        'identities': identities, 'registryPinsBefore': BASE['registryPins'], 'certifiedMatrixBefore': BASE['certifiedMatrix'],
        'summary': {'identities': len(identities), 'historicalImmutable': sum(x['policy'] == 'immutable-historical-input' for x in identities), 'withDirectPaintBindings': sum(bool(x['changedTokenIds']) for x in identities)}}
    payload = json.dumps(result, indent=2) + '\n'
    if args.check:
        assert plan_path.read_text() == payload, 'Before-update attribution differs'
    else:
        assert not plan_path.exists(), 'Before-update attribution is immutable; use --check'
        plan_path.write_text(payload)
        (OUT / 'golden-attribution.json').write_text(payload)
else:
    plan = json.loads(plan_path.read_text())
    assert sha((OUT / 'changed-token-paints.json').read_bytes()) == plan['changedPaintInputsSha256']
    addenda = sorted(OUT.glob('golden-attribution.addendum-*.json'))
    historical_matrices = list(BASE['historicalMatrices'])
    identities = list(plan['identities'])
    for path in addenda:
        addendum = json.loads(path.read_text())
        assert addendum['planSha256'] == sha(plan_path.read_bytes())
        identities.extend(addendum['identities'])
        for row in addendum.get('historicalMatrices', []):
            assert sha(read_before(row['path'])) == row['sha256'], 'Historical addendum is not Git-qualified'
            historical_matrices.append({**row, 'value': json.loads((ROOT / row['path']).read_text())})
    assert len({row['file'] for row in identities}) == len(identities), 'Duplicate attribution identity'
    # Discovered test pins require a before-update addendum; fail instead of
    # silently omitting a new literal pin from the after-state report.
    delta = subprocess.check_output(['git', 'diff', '--name-only', plan['paletteHead'], *([args.head] if args.head else [])], cwd=ROOT, text=True).splitlines()
    known = {row['file'] for row in identities}
    for path in delta:
        if path.endswith('.snap') or re.search(r'\.(spec|test)\.tsx?$', path):
            tracked_before = subprocess.run(['git', 'cat-file', '-e', f"{plan['paletteHead']}:{path}"], cwd=ROOT, capture_output=True).returncode == 0
            assert not tracked_before or path in known, f'Changed pin has no before-update attribution: {path}'
    changed, snapshots = [], []
    entries = lambda text: dict(re.findall(r'exports\[`(.*?)`\] = `(.*?)`;\n', text, re.S))
    for row in identities:
        now = after_bytes(row['file'])
        after_hash = sha(now)
        if row['policy'] == 'immutable-historical-input' or row['class'] == 'svg':
            assert after_hash == row['beforeSha256'], f"Historical input changed: {row['file']}"
        if after_hash == row['beforeSha256']:
            continue
        before = read_before(row['file'])
        changed.append({**row, 'afterSha256': after_hash,
            'reason': 's197 generated reference/light/dark/chart/HC palette, inherited shell scope, or regenerated palette epoch; authored data/structure must remain unchanged.'})
        if row['class'] == 'snapshot':
            old, new = entries(before.decode()), entries(now.decode())
            assert old.keys() == new.keys(), f"Snapshot identities changed: {row['file']}"
            for identity in old:
                if old[identity] != new[identity]:
                    assert paint_only(old[identity]) == paint_only(new[identity]), f'Non-palette snapshot delta: {row["file"]}/{identity}'
                    snapshots.append({'file': row['file'], 'identity': identity, 'beforeSha256': sha(old[identity].encode()), 'afterSha256': sha(new[identity].encode()), 'changedTokenIds': row.get('changedTokenIds', []), 'reason': 'Rendered scoped paint and palette-derived option/hash changes; force layout is seeded by the full projected option.'})
    # Every pin is read by its original JSON pointer; roster/order and all non-paint
    # registry fields remain frozen. Palette-derived HC errors may name a new paint.
    def pointer_value(value, pointer):
        for part in pointer.strip('/').split('/'):
            value = value[int(part)] if isinstance(value, list) else value[part]
        return value
    pins = []
    for registry in BASE['registryPins']:
        current = json.loads(after_bytes(registry['path']))
        previous = json.loads(read_before(registry['path']))
        assert registry_semantics(current) == registry_semantics(previous), 'Non-palette registry semantics changed'
        assert len(current) == len(previous), 'Registry roster changed'
        for old_row, new_row in zip(previous, current):
            allowed = ['renderScopes', 'notes'] if 'chartType' in old_row else ['scopes']
            assert {k: v for k, v in old_row.items() if k not in allowed} == {k: v for k, v in new_row.items() if k not in allowed}, 'Non-palette registry metadata changed'
            scopes = 'renderScopes' if 'chartType' in old_row else 'scopes'
            assert [(r['theme'], r['brand'], r['status']) for r in old_row[scopes]] == [(r['theme'], r['brand'], r['status']) for r in new_row[scopes]], 'Scope disposition changed'
        for entry in registry['entries']:
            value = pointer_value(current, entry['pointer'])
            parent = pointer_value(current, entry['pointer'].rsplit('/', 1)[0])
            pins.append({'file': registry['path'], 'pointer': entry['pointer'], 'beforeHash': entry['value'], 'afterHash': value,
                'changedTokenScope': f"{parent['brand']}/{parent['theme']}", 'reason': 'Measured scoped chart palette and chrome; registry regenerated from public calls.'})
    certified = json.loads(after_bytes(BASE['certifiedMatrix']['path']))
    for family, old_hash in BASE['certifiedMatrix']['normalizedSvgHashes'].items():
        pins.append({'file': BASE['certifiedMatrix']['path'], 'pointer': f'/normalizedSvgHashes/{family}', 'beforeHash': old_hash,
            'afterHash': certified['normalizedSvgHashes'][family], 'changedTokenScope': 'A/light', 'reason': 'Qualified renderer matrix regenerated with unchanged operands and authored custom paints.'})
    assert certified['tokenVersion'] == BASE['certifiedMatrix']['tokenVersion'], 'No package version bump is authorized'
    key = lambda kind, theme, brand: f'{kind}/{theme}/{brand}'
    matrix = json.loads((OUT / 'matrix/matrix.json').read_text())
    census = json.loads((OUT / 'viz/viz-observations.json').read_text())
    patterns = json.loads((OUT / 'patterns/pattern-observations.json').read_text())
    chart_hashes = {key(r['chartType'], r['theme'], r['brand']): r['svgHash'] for r in matrix['table']}
    census_hashes = {key(r['chartType'], c['theme'], c['brand']): c.get('svgHash') for r in census['observations'] for c in r['scopes']}
    dashboard_hashes = {key('dashboard', r['theme'], r['brand']): r['outputHtmlHash'] for r in matrix['dashboards']}
    pattern_hashes = {key(r['id'], r['request']['theme'], r['request']['brand']): r['rendered'].get('svgHash') for r in patterns['cells']}
    rows = []
    def record(source, pointer, cls, identity, previous, current):
        assert current or previous is None, f'Missing measured replacement: {source}/{identity}'
        rows.append({'source': source, 'pointer': pointer, 'class': cls, 'identity': identity, 'beforeHash': previous, 'afterHash': current,
            'changedTokenScope': '/'.join(reversed(identity.rsplit('/', 2)[1:])),
            'status': 'unchanged' if previous == current else 'superseded',
            'reason': 's197 generated palette and scoped chrome supersede the pixel/hash row; historical raw bytes, operand semantics and prior non-palette deltas remain recorded in their original receipts.'})
    for item in historical_matrices:
        source, data = item['path'], item['value']
        assert sha((ROOT / source).read_bytes()) == item['sha256'], f'Historical matrix changed: {source}'
        if not isinstance(data, dict): continue
        for index, row in enumerate(data.get('table', [])):
            identity = key(row['chartType'], row.get('theme', row.get('render', {}).get('theme', 'light')), row.get('brand', row.get('render', {}).get('brand', 'A')))
            record(source, f'/table/{index}', 'public-chart-matrix', identity, row['svgHash'], chart_hashes[identity])
        for index, row in enumerate(data.get('observations', [])):
            for scope_index, scope in enumerate(row['scopes']):
                identity = key(row['chartType'], scope['theme'], scope['brand'])
                record(source, f'/observations/{index}/scopes/{scope_index}', 'public-census', identity, scope.get('svgHash'), census_hashes[identity])
        for index, row in enumerate(data.get('dashboards', [data['dashboard']] if 'dashboard' in data else [])):
            identity = key('dashboard', row.get('theme', 'light'), row.get('brand', 'A'))
            record(source, f'/dashboards/{index}', 'dashboard-html', identity, row.get('outputHtmlHash', row.get('htmlHash')), dashboard_hashes[identity])
        for index, row in enumerate(data.get('cells', []) if isinstance(data.get('cells'), list) else []):
            if row.get('rendered', {}).get('svgHash'):
                identity = key(row['id'], row['request']['theme'], row['request']['brand'])
                record(source, f'/cells/{index}', 'public-pattern', identity, row['rendered']['svgHash'], pattern_hashes[identity])
    consumer = json.loads((OUT / 'consumers/migration.json').read_text())
    sample_path = consumer['samples']['source']
    old_sample = json.loads(read_before(sample_path))
    new_sample = json.loads(after_bytes(sample_path))
    assert old_sample.keys() == new_sample.keys() and old_sample['samples'].keys() == new_sample['samples'].keys()
    assert old_sample['rows'] == new_sample['rows'], 'Preview data changed'
    for name, old in old_sample['samples'].items():
        new = new_sample['samples'][name]
        assert {k: v for k, v in old.items() if k not in ['svg', 'svgHash']} == {k: v for k, v in new.items() if k not in ['svg', 'svgHash']}, 'Preview semantics changed'
        assert paint_only(old['svg']) == paint_only(new['svg']), 'Non-palette preview SVG delta'
        assert sha(new['svg'].encode()) == new['svgHash']
    source_diffs = []
    for row in changed:
        if row['class'] != 'pinned-literal-source': continue
        before = read_before(row['file']).decode().splitlines(keepends=True)
        current = after_bytes(row['file']).decode().splitlines(keepends=True)
        for tag, a, b, c, d in difflib.SequenceMatcher(a=before, b=current, autojunk=False).get_opcodes():
            if tag == 'equal': continue
            source_diffs.append({'file': row['file'], 'beforeLine': a + 1, 'afterLine': c + 1,
                'beforeSha256': sha(''.join(before[a:b]).encode()), 'afterSha256': sha(''.join(current[c:d]).encode()),
                'reason': row['reason'], 'changedTokenScopes': list(plan['changedTokenScopes'])})
    ledger_path = 'packages/mcp-server/registry/tool-capability-ledger.v1.json'
    old_ledger, new_ledger = json.loads(read_before(ledger_path)), json.loads(after_bytes(ledger_path))
    assert old_ledger['summary'] == new_ledger['summary'], 'Tool identities or evidence tiers changed'
    assert {k: v for k, v in old_ledger.items() if k != 'rows'} == {k: v for k, v in new_ledger.items() if k != 'rows'}, 'Tool census head or methodology changed'
    for old, new in zip(old_ledger['rows'], new_ledger['rows']):
        assert {k: v for k, v in old.items() if k not in ['testImports', 'receiptRefs']} == {k: v for k, v in new.items() if k not in ['testImports', 'receiptRefs']}, 'Advertised tool semantics changed'
    result = {'schemaVersion': 1, 'missionId': 's197-m05', 'phase': 'measured-after', 'builderSelfCertified': False,
        'beforeHead': BASE['beforeHead'], **({'qualificationHead': args.head} if args.head else {}),
        'planSha256': sha(plan_path.read_bytes()), 'changedPaintInputsSha256': plan['changedPaintInputsSha256'],
        'addendumHashes': [{'path': str(p.relative_to(ROOT)), 'sha256': sha(p.read_bytes())} for p in addenda],
        'changedTokenScopes': plan['changedTokenScopes'], 'files': changed, 'snapshotEntries': snapshots, 'registryAndCertifiedPins': pins, 'matrixRows': rows,
        'consumerEntries': consumer, 'sourceDiffs': source_diffs,
        'tokenVersion': {'before': BASE['certifiedMatrix']['tokenVersion'], 'after': certified['tokenVersion'], 'status': 'unchanged-package-version; palette epoch is pinned by source SHA and measured SVG hashes'},
        'supersededDecisions': [{'id': n, 'reason': 's197 generated palette replaces the prior palette values; scoped resolution, contrast floors, and historical evidence remain in force.'} for n in [1850, 1863, 1943]],
        'summary': {'changedFiles': len(changed), 'changedSnapshotFiles': sum(x['class'] == 'snapshot' for x in changed), 'changedSnapshotEntries': len(snapshots), 'historicalInputsUnchanged': True, 'registryAndCertifiedPins': len(pins), 'matrixRows': len(rows), 'supersededMatrixRows': sum(r['status'] == 'superseded' for r in rows)}}
    payload = json.dumps(result, indent=2) + '\n'
    if args.check: assert (OUT / 'golden-attribution.json').read_text() == payload, 'Final attribution is stale'
    else: (OUT / 'golden-attribution.json').write_text(payload)
print(json.dumps(result['summary']))
