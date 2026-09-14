"""Current additions preserve historical obligations and require their own proof."""
import copy
import json
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'cmos'))
from scripts import refresh_structured_data as refresh


class GraphIntakeTest(unittest.TestCase):
    def test_current_intake_adds_only_the_explicit_graph_identity(self):
        baseline = json.loads(subprocess.check_output(['git', 'show', 'b7a96ab0f:packages/component-contracts/registry/component-intake.v1.json'], cwd=ROOT))
        current = refresh.load_component_intake()
        self.assertEqual([row for row in current if row['id'] != 'VizGraphPreview'], baseline['rows'])
        self.assertEqual(len(current), 110)
        capabilities = refresh.load_component_capabilities({row['id'] for row in current})
        self.assertEqual(set(capabilities), {row['id'] for row in current})
        frozen = refresh.COMPONENT_CAPABILITY_PATH.read_bytes()
        self.assertEqual(frozen, subprocess.check_output(['git', 'show', 'b7a96ab0f:packages/component-contracts/registry/component-capability-baseline.v1.json'], cwd=ROOT))

    def test_default_additions_cannot_drop_or_duplicate_an_obligation(self):
        original = refresh.load_json
        ids = {row['id'] for row in refresh.load_component_intake()}
        for mutation in ['missing', 'duplicate']:
            def corrupt(path):
                value = original(path)
                if str(path).endswith('component-capability-additions.v1.json'):
                    value['rows'] = [] if mutation == 'missing' else value['rows'] * 2
                return value
            with self.subTest(mutation=mutation), patch.object(refresh, 'load_json', side_effect=corrupt):
                with self.assertRaisesRegex(ValueError, 'must exactly match|must be unique'):
                    refresh.load_component_capabilities(ids)

    def test_graph_measurements_are_current_and_fail_without_their_actual_assertions(self):
        original = refresh.load_json
        graph = original(ROOT / 'packages/component-contracts/registry/component-capability-additions.v1.json')['rows'][0]
        readiness = original(ROOT / 'packages/components-react/evidence/react-readiness.v1.json')
        proof_root = next(row for row in readiness['rows'] if row['componentId'] == 'VizGraphPreview')['measurementRoot']
        self.assertEqual(proof_root, 'artifacts/product-reality/sprint-199/m07/graph-correction')
        projected = refresh.project_measured_surfaces({'VizGraphPreview': graph})['VizGraphPreview']
        self.assertEqual(projected['surfaces']['theme']['state'], 'verified')
        self.assertEqual(projected['surfaces']['accessibility']['state'], 'verified')
        self.assertEqual(projected['surfaces']['interaction']['state'], 'not-applicable')
        for surface in ['theme', 'accessibility']:
            refs = projected['surfaces'][surface]['evidence']
            self.assertTrue(any(proof_root in ref for ref in refs))
            self.assertFalse(any('sprint-193' in ref for ref in refs))
        for mutation, surface in [('axe', 'accessibility'), ('theme', 'theme'), ('readiness', 'theme')]:
            def corrupt(path):
                value = copy.deepcopy(original(path))
                if mutation == 'axe' and str(path).endswith(f'{proof_root}/react-measured.json'):
                    for file in value['testResults']:
                        file['assertionResults'] = [test for test in file['assertionResults'] if 'VizGraphPreview' not in test['fullName']]
                if mutation == 'theme' and str(path).endswith(f'{proof_root}/react-theme/report.json'):
                    value['cells'][0]['rows'] = [row for row in value['cells'][0]['rows'] if row['componentId'] != 'VizGraphPreview']
                if mutation == 'readiness' and str(path).endswith('components-react/evidence/react-readiness.v1.json'):
                    next(row for row in value['rows'] if row['componentId'] == 'VizGraphPreview')['evidence']['frameworkScenario']['status'] = 'missing'
                return value
            with self.subTest(mutation=mutation), patch.object(refresh, 'load_json', side_effect=corrupt):
                self.assertEqual(refresh.project_measured_surfaces({'VizGraphPreview': graph})['VizGraphPreview']['surfaces'][surface]['state'], 'fail')


if __name__ == '__main__':
    unittest.main()
