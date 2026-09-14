"""Add the declared graph identity without rewriting the historical 109-row baseline.

--evidence requires the independent framework/visual receipts before promoting
readiness. Existing rows come from the immutable m05 head and remain unchanged.
"""
import argparse
import copy
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = 'b5b1294e9523cdaa436d0c8f52352146dcf4545a'
REGISTRY = 'packages/component-contracts/registry'
PROOF = 'artifacts/product-reality/sprint-199/m06'
ID = 'VizGraphPreview'


def read(name):
    return json.loads((ROOT / name).read_text())


def before(name):
    return json.loads(subprocess.check_output(['git', 'show', f'{BASE}:{name}'], cwd=ROOT))


def write(name, value):
    (ROOT / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')


def append(name, row):
    value = before(f'{REGISTRY}/{name}')
    assert ID not in {item['id'] for item in value['rows']}
    value['rows'] = sorted([*value['rows'], row], key=lambda item: item['id'])
    value['controllingObligationDenominator'] = len(value['rows'])
    if 'proposedRuntimeCensus' in value:
        value['proposedRuntimeCensus'] = len(value['rows'])
    write(f'{REGISTRY}/{name}', value)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--evidence', action='store_true')
    args = parser.parse_args()
    append('component-intake.v1.json', {
        'id': ID, 'displayName': ID,
        'baselineMetadata': {'categories': ['viz.mark'], 'tags': ['graph', 'mark', 'network', 'viz'], 'contexts': ['detail'], 'regions': ['detail']},
        'intakeEvidence': ['traits/viz/mark-graph.trait.yaml', 'objects/core/Relationship.object.yaml'],
        'addedBy': 's199-m06; decision #2054',
    })
    append('component-reconciliation.proposed.v2.json', {
        'id': ID, 'proposedClassification': 'recipe',
        'proposedResolution': {'surface': 'html', 'implementation': 'renderVizGraphPreview', 'source': 'packages/mcp-server/src/render/component-map.ts', 'primitive': 'html:figure', 'primitiveBasis': 'Named wrapper embeds the exact public force_graph SVG.'},
        'approvalState': 'pending-derek-approval',
        'evidence': ['traits/viz/mark-graph.trait.yaml', 'packages/component-contracts/src/contracts.ts#VizGraphPreview'],
        'implementationStatus': 'implemented',
        'compatibilityNote': 'New identity explicitly requested by s199-m06; classification remains a proposal independently of measured surfaces.',
    })
    scope = before(f'{REGISTRY}/component-obligation-scope.v1.json')
    scope.update(controllingObligationDenominator=110, decisionId=2054)
    write(f'{REGISTRY}/component-obligation-scope.v1.json', scope)
    row = {'id': ID, 'proposedClassification': 'recipe', 'reconciliationState': 'proposed-awaiting-derek-approval', 'surfaces': {
        'contract': {'state': 'versioned-v1', 'evidence': ['packages/component-contracts/src/contracts.ts#VizGraphPreview']},
        'metadata': {'state': 'available', 'evidence': ['traits/viz/mark-graph.trait.yaml']},
        'html': {'state': 'mapped', 'evidence': ['packages/mcp-server/src/render/component-map.ts#renderVizGraphPreview']},
        **{surface: {'state': 'unavailable', 'evidence': [], 'reason': 'Current graph evidence has not yet been captured.'} for surface in ['react', 'vue', 'generatedConsumer', 'accessibility', 'theme', 'interaction']},
    }}
    write(f'{REGISTRY}/component-capability-additions.v1.json', {'schemaVersion': '1.0.0', 'kind': 'component-capability-additions', 'decisionId': 2054, 'rows': [row]})
    if args.evidence:
        for target in ['react', 'vue']:
            measured = read(f'{PROOF}/{target}-measured.json')
            assert measured['success'] and measured['numFailedTests'] == measured['numPendingTests'] == 0
            theme = read(f'{PROOF}/{target}-theme/report.json')
            assert theme['status'] == 'passed' and theme['failed'] == theme['skipped'] == 0
            assert len(theme['cells']) == 6 and all(any(r['componentId'] == ID for r in cell['rows']) for cell in theme['cells'])
            readiness_path = f'packages/components-{target}/evidence/{target}-readiness.v1.json'
            readiness = before(readiness_path)
            template = next(item for item in readiness['rows'] if item['componentId'] == 'VizLinePreview')
            new = json.loads(json.dumps(template).replace('VizLinePreview', ID))
            new['measurementRoot'] = PROOF
            for kind, evidence in new['evidence'].items():
                if kind == 'visualThemes':
                    evidence['refs'] = [f'{PROOF}/{target}-theme/report.json#{ID}']
                elif kind in ['accessibility', 'interaction']:
                    evidence['refs'] = [f'{PROOF}/{target}-measured.json#{ID}']
            readiness['rows'] = sorted([*readiness['rows'], new], key=lambda item: item['componentId'])
            write(readiness_path, readiness)
        sys.path.insert(0, str(ROOT / 'cmos/scripts'))
        from refresh_structured_data import project_measured_surfaces
        row = project_measured_surfaces({ID: row})[ID]
        for target in ['react', 'vue']:
            assert row['surfaces'][target]['state'] == 'implemented-evidence-complete'
        for surface in ['accessibility', 'theme']:
            assert row['surfaces'][surface]['state'] == 'verified'
        assert row['surfaces']['interaction']['state'] == 'not-applicable'
        runtime_path = f'{PROOF}/runtime-final/runtime-cells.v1.json'
        if (ROOT / runtime_path).exists():
            runtime = read(runtime_path)
            assert read(f'{PROOF}/runtime-final/validation.json')['issues'] == []
            assert runtime['summary'] == {'cells': 14, 'pass': 14, 'typedGap': 0, 'fail': 0}
            placed = [(index, cell) for index, cell in enumerate(runtime['rows']) if ID in cell['components']]
            assert {(cell['object'], cell['context'], cell['framework']) for _, cell in placed} == {
                ('Relationship', context, target) for context in ['detail', 'workflow'] for target in ['react', 'vue']
            }
            for _, cell in placed:
                assert read(f"{PROOF}/runtime-final/{cell['report']}") == cell
            row['surfaces']['generatedConsumer'] = {
                'state': 'implemented-evidence-complete',
                'evidence': [f'{runtime_path}#/rows/{index}' for index, _ in placed],
            }
    write(f'{REGISTRY}/component-capability-additions.v1.json', {'schemaVersion': '1.0.0', 'kind': 'component-capability-additions', 'decisionId': 2054, 'rows': [row]})
    ledger = before(f'{REGISTRY}/component-capability-ledger.v1.json')
    ledger['rows'] = sorted([*ledger['rows'], row], key=lambda item: item['id'])
    ledger['controllingObligationDenominator'] = len(ledger['rows'])
    write(f'{REGISTRY}/component-capability-ledger.v1.json', ledger)
    # The existing current runtime ledger cannot pass the full-population export
    # guard. Preserve the 109 retained rows via the supported explicit operand.
    write(f'{PROOF}/component-capabilities-input.json', {'rows': ledger['rows']})
    sys.path.insert(0, str(ROOT / 'cmos/scripts'))
    from refresh_structured_data import refresh_structured_data
    refresh_structured_data(
        generated_at='2026-09-14T00:00:00Z',
        component_capabilities_path=ROOT / PROOF / 'component-capabilities-input.json',
        artifact_dir=ROOT / 'artifacts/structured-data',
        version_tag='2026-09-14-s199-m06',
        include_delta=False,
    )
    print(json.dumps({'identities': len(ledger['rows']), 'graphEvidencePromoted': args.evidence, 'preservedBaselineHead': BASE}))


if __name__ == '__main__':
    main()
