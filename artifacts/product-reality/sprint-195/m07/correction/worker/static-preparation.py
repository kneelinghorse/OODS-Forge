from pathlib import Path
import hashlib, json, re, subprocess, difflib, xml.etree.ElementTree as ET

ROOT = Path('/Users/systemsystems/.codex/worktrees/s195/OODS-Forge')
OUT = Path('/tmp/oods-s195-worker-hash')
OUT.mkdir(exist_ok=True)
sha = lambda b: hashlib.sha256(b).hexdigest()
heads = {
    'before': '9c75a1dbb495ca26c16f2f75ce52095e72adb16e',
    'qualification': '52b0da991705c4c565987bc9faf7738ba00d885e',
    'implementationB': 'e375f4c2db9fe9644caba87690b91b8ddd71e207',
    'captureC': '54def3aa88683d81f1f942558a24715c064021e9',
}
receipt_head = '3c8a7a5664f811b9168028d63684502ac956f657'
def git_bytes(head, file):
    return subprocess.check_output(['git', 'show', f'{head}:{file}'], cwd=ROOT)

before_path = 'artifacts/product-reality/sprint-192/m07/matrix/svg/force_graph-A-light.svg'
after_path = 'artifacts/product-reality/sprint-195/m05/golden-migration/matrix/svg/force_graph-A-light.svg'
before = (ROOT / before_path).read_bytes()
after = (ROOT / after_path).read_bytes()
assert sha(before) == '3b947d90250a98838aad801be4f98ea8e5095528618296083b8644075ff6a331'
assert sha(after) == 'df5261688594d5f845960170d643c35518954198cda607a598e069beed7e53df'
assert before == git_bytes(heads['before'], before_path)
assert after == git_bytes(receipt_head, after_path)
(OUT / 'before.svg').write_bytes(before)
(OUT / 'after.svg').write_bytes(after)
(OUT / 'svg.diff').write_text(''.join(difflib.unified_diff(before.decode().splitlines(True), after.decode().splitlines(True), fromfile=before_path, tofile=after_path)))

a, b = ET.fromstring(before), ET.fromstring(after)
changes = []
for index, (left, right) in enumerate(zip(a.iter(), b.iter())):
    assert left.tag == right.tag and left.text == right.text and left.tail == right.tail
    for key in set(left.attrib) | set(right.attrib):
        if left.get(key) != right.get(key):
            changes.append({'element': index, 'tag': left.tag.split('}')[-1], 'attribute': key, 'before': left.get(key), 'after': right.get(key)})
assert len(list(a.iter())) == len(list(b.iter()))
assert len(changes) == 8 and all(row['attribute'] in ['d', 'transform'] for row in changes)

paths = [
    'packages/viz-render/src/echarts-worker-runtime.ts',
    'packages/viz-render/src/echarts-worker-protocol.ts',
    'packages/viz-render/src/echarts-svg-normalizer.ts',
    'packages/viz-core/src/adapters/echarts/graph-adapter.ts',
    'packages/viz-core/test/s179-echarts-render-harness.ts',
    'packages/viz-core/test/fixtures/s172-echarts-operands.ts',
    'packages/viz-render/test/echarts-render-worker.spec.ts',
]
source_bindings = []
for file in paths:
    hashes = {name: sha(git_bytes(head, file)) for name, head in heads.items()}
    assert len(set(hashes.values())) == 1
    source_bindings.append({'path': file, 'hashes': hashes, 'unchanged': True})

snapshot_path = 'packages/viz-core/test/__snapshots__/golden-echarts-options.spec.ts.snap'
def force_block(value):
    return re.search(r'exports\[`[^`]* > force_graph \(network\):[^`]*`\] = `\n(.*?)\n`;', value.decode(), re.S).group(1)
old_option = force_block(git_bytes(heads['before'], snapshot_path))
new_option = force_block(git_bytes(heads['qualification'], snapshot_path))
assert old_option.count('rgb(202, 73, 72)') == 1
assert old_option.replace('rgb(202, 73, 72)', 'rgb(202, 73, 73)') == new_option
(OUT / 'qualified-force-option.diff').write_text(''.join(difflib.unified_diff(old_option.splitlines(True), new_option.splitlines(True), fromfile=f"{heads['before']}:{snapshot_path}", tofile=f"{heads['qualification']}:{snapshot_path}")))

receipt_path = 'artifacts/product-reality/sprint-195/m05/golden-migration/golden-attribution.json'
receipt_bytes = (ROOT / receipt_path).read_bytes()
assert receipt_bytes == git_bytes(receipt_head, receipt_path)
receipt = json.loads(receipt_bytes)
row = next(r for r in receipt['matrixRows'] if r['source'] == 'artifacts/product-reality/sprint-195/m04/viz/viz-observations.json' and r['identity'] == 'force_graph/light/A')
assert row['beforeHash'] == sha(before) and row['afterHash'] == sha(after) and row['status'] == 'superseded'
assert receipt['qualificationHead'] == heads['qualification']
scope_path = 'artifacts/product-reality/sprint-195/m05/viz/viz-observations.json'
scope_bytes = (ROOT / scope_path).read_bytes()
assert scope_bytes == git_bytes(receipt_head, scope_path)
scope = next(r for r in json.loads(scope_bytes)['observations'] if r['chartType'] == 'force_graph')
scope = next(s for s in scope['scopes'] if s['brand'] == 'A' and s['theme'] == 'light')
assert scope['svg'].encode() == after and scope['repeated'] is True

test_path = paths[-1]
original_test = (ROOT / test_path).read_text()
old_comment = '''// The synchronous, layoutAnimation:false snapshot under oods-echarts-lcg-v1.
// A same-seed immediate first frame hashes to
// fa27909961c5ab8acab6769e9ffb15a61227e47ce0b21ac754394b17cbf6a40c instead,
// so this pin bites removal of convergence policy, not merely seeded equality.
// s191 light slot 04 changes categorical paint only; force geometry remains deterministic.
const CONVERGED_CANONICAL_FORCE_HASH =
  "3b947d90250a98838aad801be4f98ea8e5095528618296083b8644075ff6a331";'''
new_comment = '''// The synchronous, layoutAnimation:false snapshot under oods-echarts-lcg-v1.
// The full projected option seeds the force layout. s195-m05's light slot 05
// palette change therefore changed geometry, even though that color is unused
// by this operand. This exact replacement hash is retained in the qualified m05
// force_graph/A/light matrix; keep the convergence and intervening-RNG assertions.
const CONVERGED_CANONICAL_FORCE_HASH =
  "df5261688594d5f845960170d643c35518954198cda607a598e069beed7e53df";'''
assert old_comment in original_test
proposed = original_test.replace(old_comment, new_comment)
(OUT / 'worker-pin.patch').write_text(''.join(difflib.unified_diff(original_test.splitlines(True), proposed.splitlines(True), fromfile='a/' + test_path, tofile='b/' + test_path)))

report = {
    'status': 'static-evidence-verified', 'runtimeCausalProbe': 'pending capture exit and root authorization',
    'heads': heads, 'historicalReceiptHead': receipt_head,
    'beforeSvg': {'path': before_path, 'sha256': sha(before), 'bytes': len(before)},
    'afterSvg': {'path': after_path, 'sha256': sha(after), 'bytes': len(after)},
    'geometryUnchanged': False, 'paintStylesAndTextUnchanged': True, 'changedSvgAttributes': changes,
    'unchangedSourceBindings': source_bindings,
    'qualifiedOptionDelta': {'path': snapshot_path, 'changes': 1, 'field': 'color[4]', 'before': 'rgb(202, 73, 72)', 'after': 'rgb(202, 73, 73)', 'scopeLimitation': 'This adapter golden uses its own service operand. The proposed causal probe uses the exact worker s172 operand retained in m04 boundary input.'},
    'historicalAttribution': {'path': receipt_path, 'sha256': sha(receipt_bytes), 'row': row},
    'historicalPublicRender': {'path': scope_path, 'sha256': sha(scope_bytes), 'repeated': True, 'svgMatchesMatrixBytes': True},
    'causalMechanism': 'Graph adapter emits all six colors; worker canonicalizes the entire projected option and hashes seed version plus NUL plus canonical bytes. Color[4] is unused by the two categories but changes the seed. Source seed/convergence/normalization and exact data fixture are byte-identical at all four heads.',
    'publicEquivalence': {'testPath': test_path, 'excludedByExistingTestRules': True, 'producer': 'scripts/product-reality/s185-closeout.mjs:41', 'independentAuditor': 'scripts/product-reality/s185-audit-closeout.mjs:64', 'captureReviewLimitation': 'Correction must precede the actual new capture head. Capture-to-review permits only evidence additions. Later public script fixes discovered by CI independently require a fresh implementation/runtime head.'},
    'workspaceWrites': False, 'testsOrBuildsExecuted': False,
}
(OUT / 'static-verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'status': report['status'], 'output': str(OUT), 'geometryChanges': len(changes), 'sourceBindingsUnchanged': len(source_bindings), 'qualifiedMigration': row['status'], 'causalExecution': 'pending'}, indent=2))
