"""Sprint 199 adaptation of s197-attribute-palette-goldens.py: plan, attribute once, verify.

The palette is frozen. Attribute actual chart identity/scope pins and snapshot
entries instead of binding every change to a palette input. Historical blobs are
read from Git; nothing writes into an older sprint's receipts.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = 'b7a96ab0f'
DEFAULT_OUT = 'artifacts/product-reality/sprint-199/golden-ledger.json'
sha = lambda data: hashlib.sha256(data).hexdigest()
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

def pins(data, file):
    if data is None:
        return {}
    text = data.decode()
    result = {}
    if file.endswith('.json'):
        def visit(value, path=''):
            if isinstance(value, dict):
                for key, child in value.items():
                    pointer = path + '/' + str(key).replace('~', '~0').replace('/', '~1')
                    if (path.endswith('/summary') and isinstance(child, (int, float))) or re.search(r'(?:hash|sha256)$', key, re.I) or (isinstance(child, str) and re.fullmatch(r'(?:sha256:)?[a-f0-9]{64}', child)):
                        result[pointer] = child
                    else:
                        visit(child, pointer)
            elif isinstance(value, list):
                for i, child in enumerate(value):
                    identity = child.get('id', child.get('chartType')) if isinstance(child, dict) else None
                    if isinstance(child, dict) and 'theme' in child and 'brand' in child:
                        identity = str(child['theme']) + ':' + str(child['brand'])
                    visit(child, path + '/' + str(identity if identity is not None else i))
        visit(json.loads(text))
    elif file.endswith('.snap'):
        for name, snapshot in re.findall(r'exports\[`([^`]+)`\] = `([\s\S]*?)`;\n', text):
            result['snapshot/' + name] = sha(snapshot.encode())
    else:
        for index, literal in enumerate(re.findall(r'(?<![a-f0-9])(?:sha256:)?[a-f0-9]{64}(?![a-f0-9])', text)):
            result[f'literal/{index}'] = literal
        # The named count assertions are semantic pins, unlike incidental line numbers.
        for expression, assertion, number in re.findall(r'(expect\([^\n]+?)\.(toHaveLength|toBe)\((\d+)\)', text):
            result[f'count/{expression}.{assertion}'] = int(number)
    return result

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--out', default=DEFAULT_OUT)
parser.add_argument('--plan', action='store_true')
parser.add_argument('--record', action='store_true')
parser.add_argument('--extend-plan', action='store_true')
parser.add_argument('--file', action='append', default=[])
parser.add_argument('--check', action='store_true')
parser.add_argument('--finalize', action='store_true')
parser.add_argument('--mission')
parser.add_argument('--reason')
args = parser.parse_args()
out = (ROOT / args.out).resolve()
assert out.is_relative_to(ROOT / 'artifacts/product-reality/sprint-199'), 'Output must stay under sprint-199'
assert sum([args.plan, args.extend_plan, args.record, args.check or args.finalize]) == 1, 'Choose --plan, --record, or --check/--finalize'

if args.plan:
    assert not out.exists(), 'The before-plan is immutable'
    names = git('ls-tree', '-r', '--name-only', BASE).decode().splitlines()
    selected = [name for name in names if (
        name.startswith('packages/viz-core/src/registry/viz-') or
        name.startswith('packages/') and ('__snapshots__/' in name or name.endswith(('certified-matrix.json', 'viz-preview-samples.v1.json'))) or
        name.startswith('packages/mcp-server/test/') and any(part in name for part in ['viz-taxonomy.s195', 'viz-pattern-registry.s195', 'viz-patterns.s195', 'health-viz.s195', 'high-contrast.s195', 'viz-recipes.s190', 'artifact.certify.echarts-s179-baseline']) or
        name in ['packages/viz-core/src/patterns/translate-pattern.spec.ts', 'packages/viz-core/test/s179-echarts-render-baseline.spec.ts', 'packages/viz-core/test/s179-echarts-operands-parity.spec.ts', 'packages/viz-render/test/echarts-render-worker.spec.ts', 'tests/verification/how-forge-works.contract.test.ts']
    )]
    before = []
    for name in sorted(selected):
        data = git('show', f'{BASE}:{name}')
        before.append({'file': name, 'beforeSha256': sha(data), 'pins': pins(data, name)})
    ledger = {'schemaVersion': 1, 'sprint': 'sprint-199', 'beforeHead': git('rev-parse', BASE).decode().strip(),
              'builderSelfCertified': False, 'policy': 'Each pin moves at most once. Eight existing public pattern SVG hashes and all sealed sprint-195..198 receipts stay unchanged.',
              'beforePlan': before, 'entries': []}
elif args.extend_plan:
    ledger = json.loads(out.read_text())
    assert args.file and args.reason, '--file and --reason required'
    existing = {row['file'] for row in ledger['beforePlan'] + ledger.get('additionalBeforePlan', [])}
    for name in sorted(set(args.file)):
        assert name not in existing, f'File already planned: {name}'
        data = git('show', f'{BASE}:{name}')
        ledger.setdefault('additionalBeforePlan', []).append({'file': name, 'beforeSha256': sha(data), 'pins': pins(data, name), 'reason': args.reason, 'source': f'{BASE}:{name}'})
else:
    ledger = json.loads(out.read_text())
    identities = [(row['file'], row['pin']) for row in ledger['entries']]
    assert len(identities) == len(set(identities)), 'A pin was attributed twice'
    attributed = dict(zip(identities, ledger['entries']))
    if args.record:
        assert re.fullmatch(r's199-m0[1-7]', args.mission or '') and args.reason, '--mission and --reason required'
    changes = []
    for plan in ledger['beforePlan'] + ledger.get('additionalBeforePlan', []):
        file = ROOT / plan['file']
        current = pins(file.read_bytes() if file.exists() else None, plan['file'])
        for pin in sorted(set(plan['pins']) | set(current)):
            before, after = plan['pins'].get(pin), current.get(pin)
            key = (plan['file'], pin)
            if key in attributed:
                assert attributed[key]['before'] == before and attributed[key]['after'] == after, f'Pin moved again: {key}'
            elif before != after:
                row = {'file': plan['file'], 'pin': pin, 'before': before, 'after': after, 'mission': args.mission, 'reason': args.reason}
                changes.append(row)
                if args.record:
                    ledger['entries'].append(row)
    if not args.record:
        assert not changes, f'Unattributed pins: {changes}'
    original_patterns = json.loads(git('show', f'{BASE}:packages/viz-core/src/registry/viz-patterns.v1.json'))
    current_patterns = json.loads((ROOT / 'packages/viz-core/src/registry/viz-patterns.v1.json').read_text())
    for original in [row for row in original_patterns if row['publicSvg']]:
        current = next(row for row in current_patterns if row['id'] == original['id'])
        assert [scope.get('svgHash') for scope in original['scopes']] == [scope.get('svgHash') for scope in current['scopes']], f'Frozen public pattern moved: {original["id"]}'
    sealed = [f'artifacts/product-reality/sprint-{sprint}' for sprint in range(195, 199)]
    assert not git('diff', BASE, '--name-only', '--', *sealed).strip(), 'Sealed receipts changed'
    assert not git('ls-files', '--others', '--exclude-standard', '--', *sealed).strip(), 'New file in sealed receipts'
    if args.finalize:
        ledger['verifiedHead'] = git('rev-parse', 'HEAD').decode().strip()
        ledger['verifiedEntries'] = len(ledger['entries'])
if args.plan or args.extend_plan or args.record or args.finalize:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(ledger, indent=2) + '\n')
print(json.dumps({'filesPlanned': len(ledger['beforePlan'] + ledger.get('additionalBeforePlan', [])), 'pinsPlanned': sum(len(row['pins']) for row in ledger['beforePlan'] + ledger.get('additionalBeforePlan', [])), 'attributed': len(ledger['entries']), 'checked': args.check or args.finalize}))
