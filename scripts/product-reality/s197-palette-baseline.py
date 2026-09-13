"""Freeze palette migration identities from bc12723e9 before any token value moves."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'artifacts/product-reality/sprint-197/m01'
BASE = 'bc12723e9b7a42a4790a98f5d2a0dc4a1f970b99'
sha = lambda value: hashlib.sha256(value).hexdigest()
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
rows = subprocess.check_output(['git', 'ls-tree', '-rz', BASE], cwd=ROOT).split(b'\0')
tracked = {}
for row in filter(None, rows):
    meta, name = row.split(b'\t', 1)
    tracked[name.decode()] = meta.split()[2].decode()

pin_files = {name for name in tracked if (name.startswith('packages/mcp-server/test/tools/')
             and 'certify' in name and name.endswith('.spec.ts'))
             or name == 'packages/viz-core/src/adapters/vega-lite-adapter.spec.ts'}
registry_files = {'packages/viz-core/src/registry/viz-recipes.v1.json',
                  'packages/viz-core/src/registry/viz-patterns.v1.json',
                  'packages/viz-render/certified-matrix.json'}
old_baseline = json.loads((ROOT / 'artifacts/product-reality/sprint-195/m05/golden-migration/baseline.json').read_text())
matrix_files = {row['path'] for row in old_baseline['historicalMatrices']}
matrix_files |= {name for name in tracked if re.match(r'artifacts/product-reality/sprint-(190|191|195)/', name)
                 and Path(name).name in ['matrix.json', 'viz-observations.json', 'pattern-observations.json']
                 and '/before/' not in name}

def file_class(name):
    if name.endswith('.svg'): return 'svg'
    if name.endswith('.snap'): return 'snapshot'
    if name in registry_files: return 'certified-matrix' if 'certified-matrix' in name else 'registry'
    if name.startswith(('packages/tokens/src/', 'packages/tokens/dist/', 'tokens/')): return 'token'
    if name in pin_files: return 'pinned-literal-source'
    if name in matrix_files: return 'historical-matrix'
    return None

selected = {name: file_class(name) for name in tracked if file_class(name)}
# One git process reads immutable blobs; the worktree cannot contaminate the baseline.
proc = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=ROOT, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
blobs = {}
for name in sorted(selected):
    proc.stdin.write((tracked[name] + '\n').encode()); proc.stdin.flush()
    head = proc.stdout.readline().decode().split()
    assert head[1] == 'blob', (name, head)
    blobs[name] = proc.stdout.read(int(head[2])); assert proc.stdout.read(1) == b'\n'
proc.stdin.close(); assert proc.wait() == 0

def pointers(node, suffix, trail=''):
    if isinstance(node, dict):
        for key, value in node.items():
            ptr = trail + '/' + key.replace('~', '~0').replace('/', '~1')
            if key == suffix: yield {'pointer': ptr, 'value': value}
            else: yield from pointers(value, suffix, ptr)
    elif isinstance(node, list):
        for i, value in enumerate(node): yield from pointers(value, suffix, trail + '/' + str(i))

files = [{'path': name, 'class': selected[name], 'gitBlob': tracked[name], 'sha256': sha(value), 'bytes': len(value)}
         for name, value in blobs.items()]
registries = [{'path': name, 'entries': list(pointers(json.loads(blobs[name]), 'svgHash'))}
              for name in sorted(registry_files) if 'certified-matrix' not in name]
cert_path = 'packages/viz-render/certified-matrix.json'
cert = json.loads(blobs[cert_path])
snapshot_entries = []
for name, value in blobs.items():
    if selected[name] != 'snapshot': continue
    for identity, text in re.findall(r'exports\[`(.*?)`\] = `(.*?)`;\n', value.decode(), re.S):
        snapshot_entries.append({'path': name, 'identity': identity, 'sha256': sha(text.encode())})
literals = []
for name in sorted(pin_files):
    for line, text in enumerate(blobs[name].decode().splitlines(), 1):
        if re.search(r'#[0-9a-fA-F]{6}\b|CERTIFY_PALETTE|OODS_CATEGORICAL_6|(?:ratio|toBeCloseTo|threshold|minimum).*\d', text):
            literals.append({'path': name, 'line': line, 'text': text, 'sha256': sha(text.encode())})
historical = [{'path': name, 'sha256': sha(blobs[name]), 'value': json.loads(blobs[name])} for name in sorted(matrix_files)]
counts = {cls: sum(row['class'] == cls for row in files) for cls in sorted(set(selected.values()))}
counts.update({'liveSnapshots': sum(row['class'] == 'snapshot' and not row['path'].startswith('artifacts/') for row in files),
               'recipeHashes': len(next(row['entries'] for row in registries if 'viz-recipes' in row['path'])),
               'patternHashes': len(next(row['entries'] for row in registries if 'viz-patterns' in row['path'])),
               'certifiedMatrixHashes': len(cert['normalizedSvgHashes']), 'literalLines': len(literals)})
report = {'schemaVersion': 1, 'missionId': 's197-m01', 'builderSelfCertified': False, 'beforeHead': BASE,
          'trackedFiles': files, 'registryPins': registries,
          'certifiedMatrix': {'path': cert_path, 'tokenVersion': cert['tokenVersion'], 'normalizedSvgHashes': cert['normalizedSvgHashes']},
          'snapshotEntries': snapshot_entries, 'pinnedLiterals': literals, 'historicalMatrices': historical, 'summary': counts}
text = json.dumps(report, indent=2) + '\n'
if args.check:
    assert (OUT / 'baseline.json').read_text() == text, 'Palette baseline differs from immutable base blobs'
else:
    assert not (OUT / 'baseline.json').exists(), 'Refusing to replace an existing baseline'
    (OUT / 'baseline.json').write_text(text)
    # Retain inputs needed by the bounded s195-style golden update, without copying SVG evidence twice.
    for name, value in blobs.items():
        if selected[name] in ['token', 'snapshot', 'registry', 'certified-matrix', 'pinned-literal-source']:
            dest = OUT / 'before' / name; dest.parent.mkdir(parents=True, exist_ok=True); dest.write_bytes(value)
print(json.dumps(counts, sort_keys=True))
