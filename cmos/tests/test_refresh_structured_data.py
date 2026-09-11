from __future__ import annotations

import json
import copy
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

CMOS_ROOT = Path(__file__).resolve().parents[1]
if str(CMOS_ROOT) not in sys.path:
    sys.path.insert(0, str(CMOS_ROOT))

from scripts.refresh_structured_data import (  # noqa: E402
    COMPONENT_CAPABILITY_PATH,
    DEFAULT_BASELINE_COMPONENTS_PATH,
    DEFAULT_BASELINE_TOKENS_PATH,
    OUTPUT_DIR,
    assert_canonical_component_membership,
    collect_traits,
    compute_etag,
    ensure_basic_components,
    generate_code_connect_payload,
    generate_structured_payloads,
    load_component_capabilities,
    load_component_intake,
    parse_args,
    project_trait_recipe_surfaces,
    project_measured_surfaces,
    project_foundation_surfaces,
    refresh_structured_data,
)

EXPECTED_GENERATED_AT = "2026-09-04T00:00:00Z"
CLOSEOUT_COMPONENT_CAPABILITY_PATH = (
    CMOS_ROOT.parent
    / "packages"
    / "component-contracts"
    / "registry"
    / "component-capability-closeout.s182.v1.json"
)


class RefreshStructuredDataTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.components_payload, cls.tokens_payload = generate_structured_payloads(
            generated_at=EXPECTED_GENERATED_AT,
            component_capabilities_path=CLOSEOUT_COMPONENT_CAPABILITY_PATH,
        )

    def test_current_measurements_preserve_every_obligation_and_do_not_approve_classes(self) -> None:
        baseline = {row["id"]: row for row in json.loads(COMPONENT_CAPABILITY_PATH.read_text())["rows"]}
        projected = project_measured_surfaces(baseline)
        self.assertEqual(set(projected), set(baseline))
        for surface in ("accessibility", "theme"):
            self.assertEqual(sum(row["surfaces"][surface]["state"] == "verified" for row in projected.values()), 75)
            self.assertEqual(sum(row["surfaces"][surface]["state"] == "unavailable" for row in projected.values()), 34)
        self.assertEqual(sum(row["surfaces"]["interaction"]["state"] == "verified" for row in projected.values()), 24)
        self.assertEqual(sum(row["surfaces"]["interaction"]["state"] == "not-applicable" for row in projected.values()), 51)
        for row in projected.values():
            self.assertEqual(row["reconciliationState"], "proposed-awaiting-derek-approval")
            for surface in ("accessibility", "theme", "interaction"):
                cell = row["surfaces"][surface]
                self.assertNotEqual(cell["state"], "unverified")
                if cell["state"] in ("not-applicable", "unavailable"):
                    self.assertTrue(cell["reason"])
        self.assertEqual(projected["PaymentEventTimeline"]["proposedClassification"], "alias")
        self.assertEqual(baseline["PaymentEventTimeline"]["proposedClassification"], "authoring-only")

    def test_measurement_flags_cannot_mask_missing_assertions_scopes_or_readiness(self) -> None:
        from scripts import refresh_structured_data as refresh
        original = refresh.load_json
        baseline = {row["id"]: row for row in json.loads(COMPONENT_CAPABILITY_PATH.read_text())["rows"]}
        for mutation, surface in (("axe", "accessibility"), ("theme", "theme"), ("readiness", "accessibility"), ("interaction", "interaction")):
            def incomplete(path):
                document = original(path)
                name = str(path)
                if mutation == "axe" and name.endswith("m05/react-measured.json"):
                    for file in document["testResults"]:
                        file["assertionResults"] = [test for test in file["assertionResults"] if "for the Button shared scenario" not in test["fullName"]]
                if mutation == "theme" and name.endswith("ci-theme/react/report.json"):
                    document["cells"][0]["rows"] = [row for row in document["cells"][0]["rows"] if row["componentId"] != "Button"]
                if name.endswith("components-react/evidence/react-readiness.v1.json"):
                    row = next(row for row in document["rows"] if row["componentId"] == "Button")
                    if mutation == "readiness":
                        row["evidence"]["frameworkScenario"]["status"] = "missing"
                    if mutation == "interaction":
                        row["evidence"]["interaction"]["classification"] = "not-applicable"
                        row["evidence"]["interaction"]["reason"] = "Wrongly declared static"
                return document
            with self.subTest(mutation=mutation), patch("scripts.refresh_structured_data.load_json", side_effect=incomplete):
                self.assertEqual(project_measured_surfaces(baseline)["Button"]["surfaces"][surface]["state"], "fail")

    def test_theme_receipts_and_pending_approval_are_integrity_boundaries(self) -> None:
        from scripts import refresh_structured_data as refresh
        original = refresh.load_json
        baseline = {row["id"]: row for row in json.loads(COMPONENT_CAPABILITY_PATH.read_text())["rows"]}
        for mutation, message in (("hash", "hash mismatch"), ("approval", "without approval"), ("membership", "all obligations")):
            def corrupt(path):
                document = original(path)
                if mutation == "hash" and str(path).endswith("ci-theme/react/report.json"):
                    document["cells"][0]["screenshotSha256"] = "0" * 64
                if str(path).endswith("component-reconciliation.proposed.v2.json"):
                    if mutation == "approval":
                        document["approvedRuntimeCensus"] = 109
                    elif mutation == "membership":
                        document["rows"].pop()
                return document
            with self.subTest(mutation=mutation), patch("scripts.refresh_structured_data.load_json", side_effect=corrupt):
                with self.assertRaisesRegex(ValueError, message):
                    project_measured_surfaces(baseline)

    def test_foundation_projection_promotes_only_the_reviewed_14_target_pairs(self) -> None:
        frozen = COMPONENT_CAPABILITY_PATH.read_bytes()
        baseline = {row["id"]: row for row in json.loads(frozen)["rows"]}
        projected = project_foundation_surfaces(baseline)
        changed = [(component, target) for component in baseline for target in ("react", "vue")
                   if projected[component]["surfaces"][target] != baseline[component]["surfaces"][target]]
        self.assertEqual(len(changed), 28)
        self.assertEqual(len({component for component, _ in changed}), 14)
        for component, target in changed:
            self.assertEqual(projected[component]["surfaces"][target]["state"], "implemented-evidence-complete")
            self.assertTrue(any("foundation-v1" in ref for ref in projected[component]["surfaces"][target]["evidence"]))
        for component in ("Button", "Stack", "Grid", "Input"):
            self.assertTrue(all((component, target) in changed for target in ("react", "vue")))
        self.assertEqual(projected["ColorStatePicker"], baseline["ColorStatePicker"])
        self.assertEqual(COMPONENT_CAPABILITY_PATH.read_bytes(), frozen)

    def test_unapproved_foundation_cannot_promote_current_discovery(self) -> None:
        from scripts import refresh_structured_data as refresh
        original = refresh.load_json
        def unapproved(path):
            document = original(path)
            if str(path).endswith("component-capability-foundation-v1.s182.v1.json"):
                document["independentReviewApproved"] = False
            return document
        baseline = {row["id"]: row for row in json.loads(COMPONENT_CAPABILITY_PATH.read_text())["rows"]}
        with patch("scripts.refresh_structured_data.load_json", side_effect=unapproved):
            self.assertEqual(project_foundation_surfaces(baseline), baseline)

    def test_current_recipe_projection_preserves_frozen_evidence_and_unrelated_rows(self) -> None:
        frozen = COMPONENT_CAPABILITY_PATH.read_bytes()
        baseline = {row["id"]: row for row in json.loads(frozen)["rows"]}
        projected = project_trait_recipe_surfaces(baseline)
        self.assertEqual(COMPONENT_CAPABILITY_PATH.read_bytes(), frozen)
        self.assertEqual(baseline, {row["id"]: row for row in json.loads(frozen)["rows"]})
        for component in ("BillingAmountInput", "BillingIntervalSelector", "BillingSummaryBadge"):
            for target in ("react", "vue"):
                surface = projected[component]["surfaces"][target]
                self.assertEqual(surface["state"], "implemented-evidence-complete")
                self.assertIn(f"#{component}", surface["evidence"][0])
            self.assertEqual(projected[component]["surfaces"]["html"]["state"], "mapped")
        self.assertEqual(projected["Button"], baseline["Button"])
        self.assertEqual(projected["ColorStatePicker"], baseline["ColorStatePicker"])

    def test_recipe_projection_does_not_promote_incomplete_readiness(self) -> None:
        from scripts import refresh_structured_data as refresh
        original = refresh.load_json
        def incomplete(path):
            document = original(path)
            if str(path).endswith("components-vue/evidence/vue-readiness.v1.json"):
                row = next(row for row in document["rows"] if row["componentId"] == "BillingAmountInput")
                row["evidence"]["frameworkScenario"]["status"] = "missing"
            return document
        baseline = {row["id"]: row for row in json.loads(COMPONENT_CAPABILITY_PATH.read_text())["rows"]}
        with patch("scripts.refresh_structured_data.load_json", side_effect=incomplete):
            projected = project_trait_recipe_surfaces(baseline)
        self.assertEqual(projected["BillingAmountInput"]["surfaces"]["vue"], baseline["BillingAmountInput"]["surfaces"]["vue"])
        self.assertEqual(projected["BillingAmountInput"]["surfaces"]["html"]["state"], "fallback")

    def test_lazy_payment_mount_requires_a_passing_hash_bound_application_receipt(self) -> None:
        from scripts import refresh_structured_data as refresh
        original = refresh.load_json
        baseline = {row["id"]: row for row in json.loads(COMPONENT_CAPABILITY_PATH.read_text())["rows"]}
        projected = project_trait_recipe_surfaces(baseline)
        surface = projected["PaymentTimeline"]["surfaces"]["generatedConsumer"]
        self.assertEqual(surface["state"], "implemented-evidence-complete")
        self.assertTrue(any("app-consumers-final/react/receipt.json" in ref for ref in surface["evidence"]))
        def failed_app(path):
            document = original(path)
            if str(path).endswith("app-consumers-final/react/receipt.json"):
                document["gates"][-1]["status"] = "failed"
            return document
        with patch("scripts.refresh_structured_data.load_json", side_effect=failed_app):
            rejected = project_trait_recipe_surfaces(baseline)
        self.assertEqual(rejected["PaymentTimeline"]["surfaces"]["generatedConsumer"], baseline["PaymentTimeline"]["surfaces"]["generatedConsumer"])

    def test_recipe_application_hash_mismatch_fails_loudly(self) -> None:
        from scripts import refresh_structured_data as refresh
        original = refresh.load_json
        def wrong_hash(path):
            document = original(path)
            if str(path).endswith("app-consumers-final/report.json"):
                document["cellReports"][0]["sha256"] = "0" * 64
            return document
        baseline = {row["id"]: row for row in json.loads(COMPONENT_CAPABILITY_PATH.read_text())["rows"]}
        with patch("scripts.refresh_structured_data.load_json", side_effect=wrong_hash):
            with self.assertRaisesRegex(ValueError, "Recipe application evidence hash mismatch"):
                project_trait_recipe_surfaces(baseline)

    def test_current_scope_retains_obligations_without_approving_historical_exclusions(self) -> None:
        scope = self.components_payload["obligationScope"]
        self.assertEqual(scope["decisionId"], 1788)
        self.assertEqual(scope["disposition"], "retain-all-obligations")
        self.assertEqual(scope["controllingObligationDenominator"], len(self.components_payload["components"]))
        self.assertEqual(scope["controllingObligationDenominator"], 109)
        self.assertIsNone(scope["approvedRuntimeCensus"])
        self.assertEqual(scope["classificationStatus"], "proposed-awaiting-derek-approval")
        original = json.loads((CMOS_ROOT.parent / "packages/component-contracts/registry/component-reconciliation.proposed.v1.json").read_text())
        self.assertIsNone(original["approvedRuntimeCensus"])

    def test_scope_cannot_silently_shrink_the_intake(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            scope_path = Path(tmp) / "scope.json"
            scope_path.write_text(json.dumps({**self.components_payload["obligationScope"], "controllingObligationDenominator": 98}))
            with patch("scripts.refresh_structured_data.COMPONENT_OBLIGATION_SCOPE_PATH", scope_path):
                with self.assertRaisesRegex(ValueError, "must retain exact canonical intake membership"):
                    generate_structured_payloads()

    def test_defaults_target_planning_directory(self) -> None:
        self.assertEqual(OUTPUT_DIR, CMOS_ROOT / "planning")
        self.assertEqual(
            COMPONENT_CAPABILITY_PATH,
            CMOS_ROOT.parent
            / "packages"
            / "component-contracts"
            / "registry"
            / "component-capability-baseline.v1.json",
        )
        self.assertEqual(DEFAULT_BASELINE_COMPONENTS_PATH, OUTPUT_DIR / "oods-components.json")
        self.assertEqual(DEFAULT_BASELINE_TOKENS_PATH, OUTPUT_DIR / "oods-tokens.json")

    def test_component_capabilities_cli_defaults_and_accepts_override(self) -> None:
        with patch.object(sys, "argv", ["refresh_structured_data.py"]):
            self.assertIsNone(parse_args().component_capabilities)

        override = Path("reviewed-component-capabilities.json")
        with patch.object(
            sys,
            "argv",
            ["refresh_structured_data.py", "--component-capabilities", str(override)],
        ):
            self.assertEqual(parse_args().component_capabilities, override)

    def test_generate_payloads_read_explicit_component_capabilities_path(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            capabilities_path = Path(temp_dir) / "component-capabilities.json"
            capabilities_path.write_text(json.dumps({"rows": []}), encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "must exactly match canonical intake membership"):
                generate_structured_payloads(
                    generated_at=EXPECTED_GENERATED_AT,
                    component_capabilities_path=capabilities_path,
                )

    def test_component_intake_requires_exact_sorted_109_membership(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            intake_path = Path(temp_dir) / "component-intake.v1.json"
            ids = [f"Component{index:03d}" for index in range(109)]

            def write_intake(row_ids: list[str], denominator: int = 109) -> None:
                intake_path.write_text(
                    json.dumps(
                        {
                            "controllingObligationDenominator": denominator,
                            "rows": [{"id": component_id} for component_id in row_ids],
                        }
                    ),
                    encoding="utf-8",
                )

            with patch("scripts.refresh_structured_data.COMPONENT_INTAKE_PATH", intake_path):
                write_intake(ids)
                self.assertEqual([row["id"] for row in load_component_intake()], ids)

                invalid_cases = (
                    ("missing", ids[:-1], 109, "exactly 109 unique"),
                    ("duplicate", [*ids[:-1], ids[0]], 109, "exactly 109 unique"),
                    ("unsorted", [ids[1], ids[0], *ids[2:]], 109, "deterministically sorted"),
                    ("independent-count", ids, 101, "denominator must be derived"),
                )
                for name, row_ids, denominator, message in invalid_cases:
                    with self.subTest(name=name):
                        write_intake(row_ids, denominator)
                        with self.assertRaisesRegex(ValueError, message):
                            load_component_intake()

    def test_component_capabilities_require_unique_exact_intake_membership(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            capabilities_path = Path(temp_dir) / "component-capability-baseline.v1.json"

            def write_capabilities(ids: list[str]) -> None:
                capabilities_path.write_text(
                    json.dumps({"rows": [{"id": component_id} for component_id in ids]}),
                    encoding="utf-8",
                )

            with patch("scripts.refresh_structured_data.COMPONENT_CAPABILITY_PATH", capabilities_path):
                write_capabilities(["Alpha", "Beta"])
                self.assertEqual(set(load_component_capabilities({"Alpha", "Beta"})), {"Alpha", "Beta"})

                write_capabilities(["Alpha", "Alpha", "Beta"])
                with self.assertRaisesRegex(ValueError, "must be unique"):
                    load_component_capabilities({"Alpha", "Beta"})

                write_capabilities(["Alpha", "Gamma"])
                with self.assertRaisesRegex(ValueError, "must exactly match"):
                    load_component_capabilities({"Alpha", "Beta"})

    def test_collect_traits_rejects_component_outside_canonical_intake(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            trait_path = repo_root / "traits" / "Rogue.trait.yaml"
            trait_path.parent.mkdir(parents=True)
            trait_path.write_text(
                "\n".join(
                    [
                        "trait:",
                        "  name: Rogue",
                        "  category: core",
                        "view_extensions:",
                        "  detail:",
                        "    - component: RogueComponent",
                        "",
                    ]
                ),
                encoding="utf-8",
            )

            with patch("scripts.refresh_structured_data.REPO_ROOT", repo_root):
                with self.assertRaisesRegex(ValueError, "RogueComponent"):
                    collect_traits({"KnownComponent"})

    def test_basic_and_final_components_cannot_escape_canonical_intake(self) -> None:
        component_index: dict[str, dict[str, object]] = {}
        definitions = ({"id": "KnownComponent"}, {"id": "RogueComponent"})
        with patch("scripts.refresh_structured_data.BASIC_COMPONENT_DEFINITIONS", definitions):
            with self.assertRaisesRegex(ValueError, "RogueComponent"):
                ensure_basic_components(component_index, {"KnownComponent"})
        self.assertEqual(component_index, {})

        invalid_outputs = (
            ("missing", [{"id": "Alpha"}]),
            ("extra", [{"id": "Alpha"}, {"id": "Beta"}, {"id": "RogueComponent"}]),
            ("duplicate", [{"id": "Alpha"}, {"id": "Alpha"}, {"id": "Beta"}]),
            ("unsorted", [{"id": "Beta"}, {"id": "Alpha"}]),
        )
        for name, components in invalid_outputs:
            with self.subTest(name=name):
                with self.assertRaisesRegex(ValueError, "must exactly match"):
                    assert_canonical_component_membership(components, {"Alpha", "Beta"})

    def test_emitted_component_ids_equal_canonical_intake(self) -> None:
        intake_ids = [row["id"] for row in load_component_intake()]
        emitted_ids = [component["id"] for component in self.components_payload["components"]]
        self.assertEqual(emitted_ids, intake_ids)
        self.assertEqual(self.components_payload["stats"]["componentCount"], len(intake_ids))
        self.assertEqual(len(intake_ids), 109)

    def test_structured_payloads_match_snapshot(self) -> None:
        # Preserve the frozen s182 target; a routine refresh replaces the live planning export.
        frozen_dir = CMOS_ROOT.parent / "artifacts/structured-data"
        expected_components = json.loads((frozen_dir / "oods-components-2026-09-04.json").read_text())
        expected_tokens = json.loads((frozen_dir / "oods-tokens-2026-09-04.json").read_text())
        historical_projection = copy.deepcopy({key: value for key, value in self.components_payload.items() if key != "obligationScope"})
        # Sprint 190 placed the real area chart on Subscription/detail. Preserve
        # the frozen s182 comparison after checking exactly those later inputs.
        area = next(row for row in historical_projection["traits"] if row["name"] == "MarkArea")
        chart = next(row for row in area["parameters"] if row["name"] == "chart")
        self.assertEqual(chart["type"], "object")
        self.assertEqual(area["objects"], ["Subscription"])
        area["parameters"].remove(chart)
        area["objects"] = []
        subscription = next(row for row in historical_projection["objects"] if row["source"] == "objects/core/Subscription.object.yaml")
        placement = next(row for row in subscription["traits"] if row["reference"] == "viz/MarkArea")
        self.assertEqual(placement["parameters"]["chart"]["source"], "payment-events")
        subscription["traits"].remove(placement)
        # Sprint 193 uses the existing read-only TagSummary in detail. Check that
        # deliberate movement before projecting back to the frozen s182 inputs.
        taggable = next(row for row in historical_projection["traits"] if row["name"] == "Taggable")
        detail = next(row for row in taggable["viewExtensions"] if row["context"] == "detail")
        self.assertEqual(detail["component"], "TagSummary")
        self.assertEqual(detail["props"], {"field": "tags", "countField": "tag_count"})
        taggable["viewExtensions"] = next(row for row in expected_components["traits"] if row["name"] == "Taggable")["viewExtensions"]
        for component_id, fields in (("TagManager", ("traitUsages", "sourceFiles")), ("TagSummary", ("contexts", "traitUsages"))):
            current = next(row for row in historical_projection["components"] if row["id"] == component_id)
            frozen = next(row for row in expected_components["components"] if row["id"] == component_id)
            for field in fields:
                current[field] = frozen[field]
        self.assertEqual(historical_projection, expected_components)
        self.assertEqual(self.tokens_payload, expected_tokens)

    def test_live_refresh_matches_current_capabilities_and_recorded_timestamp(self) -> None:
        expected_components = json.loads(DEFAULT_BASELINE_COMPONENTS_PATH.read_text())
        expected_tokens = json.loads(DEFAULT_BASELINE_TOKENS_PATH.read_text())
        current_components, current_tokens = generate_structured_payloads(generated_at=expected_components["generatedAt"])
        self.assertEqual(current_components, expected_components)
        self.assertEqual(current_tokens, expected_tokens)

    def test_etags_are_stable(self) -> None:
        self.assertEqual(
            compute_etag(self.components_payload),
            "a362fcacd769c545459946f8f34824b233396094a17f9b0390d6db0aab1f725a",
        )
        self.assertEqual(
            compute_etag(self.tokens_payload),
            "59379746c9db9480858fa6b5abb309442d30addaaa7282452891614bd6b8529e",
        )

    def test_refresh_writes_outputs_and_manifest(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            tmp_path = Path(temp_dir)
            upstream_dir = tmp_path / "upstream" / "stories" / "components"
            upstream_dir.mkdir(parents=True, exist_ok=True)
            (upstream_dir / "TagInput.stories.tsx").write_text(
                "\n".join(
                    [
                        "import { TagInput } from '@oods/foundry';",
                        "",
                        "export default {",
                        "  title: 'Components/TagInput',",
                        "  parameters: { oodsComponentId: 'TagInput' },",
                        "};",
                        "",
                        "const yaml = `view_extensions:",
                        "  demo:",
                        "    - component: TagInput",
                        "      props:",
                        "        foo: bar",
                        "`;",
                        "",
                    ]
                ),
                encoding="utf-8",
            )
            (upstream_dir / "Button.stories.tsx").write_text(
                "\n".join(
                    [
                        "import { Button } from '@oods/foundry';",
                        "",
                        "export default {",
                        "  title: 'Components/Button',",
                        "  parameters: { oodsComponentId: 'Button' },",
                        "};",
                        "",
                        "const yaml = `view_extensions:",
                        "  demo:",
                        "    - component: Button",
                        "      props:",
                        "        label: OK",
                        "`;",
                        "",
                    ]
                ),
                encoding="utf-8",
            )
            (upstream_dir / "Primitives.stories.tsx").write_text(
                "\n".join(
                    [
                        "export default {",
                        "  title: 'Components/Primitives',",
                        "  parameters: { oodsComponentIds: ['Card', 'Text', 'Stack'] },",
                        "};",
                        "",
                        "const yaml = `view_extensions:",
                        "  demo:",
                        "    - component: Card",
                        "      props:",
                        "        variant: default",
                        "    - component: Text",
                        "      props:",
                        "        content: Hello",
                        "    - component: Stack",
                        "      props:",
                        "        gap: 2",
                        "`;",
                        "",
                    ]
                ),
                encoding="utf-8",
            )
            result = refresh_structured_data(
                output_dir=tmp_path,
                baseline_components_path=DEFAULT_BASELINE_COMPONENTS_PATH,
                baseline_tokens_path=DEFAULT_BASELINE_TOKENS_PATH,
                generated_at=EXPECTED_GENERATED_AT,
                artifact_dir=tmp_path / "artifacts",
                version_tag="test-run",
                upstream_stories_dir=tmp_path / "upstream" / "stories",
            )

            self.assertTrue(result.components.path.exists())
            self.assertTrue(result.tokens.path.exists())
            self.assertTrue(result.code_connect and result.code_connect.path.exists())
            self.assertTrue(result.delta_path and result.delta_path.exists())
            self.assertTrue(result.manifest_path and result.manifest_path.exists())

            delta_contents = result.delta_path.read_text()
            self.assertIn("Structured Data Delta", delta_contents)
            self.assertIn("## Catalogue Stats", delta_contents)
            self.assertIn("## Token Stats", delta_contents)

            manifest = json.loads(result.manifest_path.read_text())
            self.assertEqual(manifest["version"], "test-run")
            self.assertEqual(manifest["artifacts"][0]["etag"], result.components.etag)
            self.assertEqual(manifest["artifacts"][1]["etag"], result.tokens.etag)
            self.assertEqual(manifest["artifacts"][2]["etag"], result.code_connect.etag)
            self.assertEqual(manifest["artifacts"][2]["file"], "code-connect.json")

            code_connect = json.loads(result.code_connect.path.read_text())
            self.assertIn("TagInput", code_connect.get("components", {}))
            self.assertIn("Button", code_connect.get("components", {}))
            self.assertIn("Card", code_connect.get("components", {}))
            self.assertIn("Text", code_connect.get("components", {}))
            self.assertIn("Stack", code_connect.get("components", {}))
            self.assertEqual(
                code_connect["components"]["TagInput"][0]["path"],
                "stories/components/TagInput.stories.tsx",
            )
            self.assertIn("view_extensions:", code_connect["components"]["TagInput"][0]["snippet"])
            self.assertNotIn("import { TagInput", code_connect["components"]["TagInput"][0]["snippet"])

    def test_version_tag_auto_defaults_to_run_date(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            tmp_path = Path(temp_dir)
            result = refresh_structured_data(
                output_dir=tmp_path,
                baseline_components_path=DEFAULT_BASELINE_COMPONENTS_PATH,
                baseline_tokens_path=DEFAULT_BASELINE_TOKENS_PATH,
                generated_at=EXPECTED_GENERATED_AT,
                artifact_dir=tmp_path / "artifacts",
                version_tag="auto",
            )

            manifest = json.loads(result.manifest_path.read_text())
            expected_version = EXPECTED_GENERATED_AT.split("T")[0]
            self.assertEqual(manifest["version"], expected_version)
            self.assertEqual(manifest["artifacts"][0]["file"], f"oods-components-{expected_version}.json")
            self.assertEqual(manifest["artifacts"][1]["file"], f"oods-tokens-{expected_version}.json")
            self.assertEqual(manifest["artifacts"][2]["file"], "code-connect.json")

    def test_code_connect_import_tier(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            tmp_path = Path(temp_dir)
            stories_dir = tmp_path / "upstream" / "stories"
            story_file = stories_dir / "components" / "Example.stories.tsx"
            story_file.parent.mkdir(parents=True, exist_ok=True)
            story_file.write_text(
                "\n".join(
                    [
                        "import { TagInput } from '@oods/foundry';",
                        "",
                        "export default {",
                        "  title: 'Components/TagInput',",
                        "  parameters: { oodsComponentId: 'TagInput' },",
                        "};",
                        "",
                        "export function Demo() {",
                        "  return <TagInput />;",
                        "}",
                        "",
                    ]
                ),
                encoding="utf-8",
            )

            payload = generate_code_connect_payload(
                component_names=["TagInput"],
                stories_dir=stories_dir,
                generated_at=EXPECTED_GENERATED_AT,
            )

            refs = payload.get("components", {}).get("TagInput", [])
            self.assertTrue(refs)
            self.assertIn("import { TagInput } from '@oods/foundry';", refs[0]["snippet"])
            self.assertIn("export function Example()", refs[0]["snippet"])

    def test_code_connect_requires_explicit_oods_component_id(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            tmp_path = Path(temp_dir)
            stories_dir = tmp_path / "upstream" / "stories"
            story_file = stories_dir / "components" / "Example.stories.tsx"
            story_file.parent.mkdir(parents=True, exist_ok=True)
            story_file.write_text(
                "\n".join(
                    [
                        "import { TagInput } from '@oods/foundry';",
                        "",
                        "const arbitraryObject = {",
                        "  parameters: { oodsComponentId: 'TagInput' },",
                        "};",
                        "const prose = \"parameters.oodsComponentId is 'TagInput'\";",
                        "",
                        "export default {",
                        "  title: 'Components/TagInput',",
                        "  parameters: { docs: { description: { component: prose } } },",
                        "};",
                        "// parameters: { oodsComponentId: 'TagInput' }",
                        "// TagInput appears in prose and JSX but has no real default-meta identity field.",
                        "export const Demo = () => <TagInput />;",
                        "",
                    ]
                ),
                encoding="utf-8",
            )

            payload = generate_code_connect_payload(
                component_names=["TagInput"],
                stories_dir=stories_dir,
                generated_at=EXPECTED_GENERATED_AT,
            )

            refs = payload.get("components", {}).get("TagInput", [])
            self.assertEqual(refs, [])

            story_file.write_text(
                "\n".join(
                    [
                        "import { TagInput } from '@oods/foundry';",
                        "",
                        "const prose = 'TagInput component story';",
                        "// TagInput remains in prose after the explicit metadata mutation.",
                        "const meta = {",
                        "  title: 'Components/TagInput',",
                        "  parameters: { oodsComponentId: 'TagInput' },",
                        "};",
                        "export default meta;",
                        "export const Demo = () => <TagInput />;",
                        "",
                    ]
                ),
                encoding="utf-8",
            )

            explicit_payload = generate_code_connect_payload(
                component_names=["TagInput"],
                stories_dir=stories_dir,
                generated_at=EXPECTED_GENERATED_AT,
            )
            explicit_refs = explicit_payload.get("components", {}).get("TagInput", [])
            self.assertTrue(explicit_refs)
            self.assertIn("TagInput", explicit_refs[0]["snippet"])


if __name__ == "__main__":  # pragma: no cover
    unittest.main()
