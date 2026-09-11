"""Current consumer coverage is universal over placing cells, not a union of successes."""
from __future__ import annotations

import copy
import sys
import unittest
from pathlib import Path

CMOS_ROOT = Path(__file__).resolve().parents[1]
if str(CMOS_ROOT) not in sys.path:
    sys.path.insert(0, str(CMOS_ROOT))

from scripts.refresh_structured_data import collect_objects, project_runtime_surfaces


class RuntimeProjectionTest(unittest.TestCase):
    def setUp(self) -> None:
        gates = ["generation", "fresh-exact-tarball-install", "strict-typecheck", "production-build",
                 "mount", "accessibility-tree", "screenshots", "context-states"]
        self.ledger = {
            "head": "current-head", "runId": "one-run", "packCount": 1,
            "browserImage": "mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a",
            "historicalReceiptsUnioned": False,
            "rows": [{"object": obj, "context": context, "framework": target,
                      "head": "current-head", "runId": "one-run", "artifactHash": "sha256:artifact",
                      "status": "pass", "components": ["Button"],
                      "gates": [{"name": gate, "status": "pass"} for gate in gates]}
                     for obj in sorted({row["name"] for row in collect_objects()[0]})
                     for context in ("card", "detail", "form", "inline", "list", "timeline")
                     for target in ("react", "vue")],
        }
        self.capabilities = {name: {"surfaces": {"generatedConsumer": {
            "state": "implemented-evidence-complete", "evidence": ["historical.json"]}}}
            for name in ("Button", "Unreached")}
        self.summarize()

    def summarize(self) -> None:
        rows = self.ledger["rows"]
        self.ledger["summary"] = {"cells": len(rows), "pass": sum(r["status"] == "pass" for r in rows),
                                  "typedGap": sum(r["status"] == "typed-gap" for r in rows),
                                  "fail": sum(r["status"] == "fail" for r in rows)}

    def project(self):
        return project_runtime_surfaces(self.capabilities, self.ledger, "current.json")

    def test_every_placing_cell_is_required_and_historical_claims_are_replaced(self):
        before = copy.deepcopy(self.capabilities)
        result = self.project()
        self.assertEqual(result["Button"]["surfaces"]["generatedConsumer"]["state"], "implemented-evidence-complete")
        self.assertEqual(len(result["Button"]["surfaces"]["generatedConsumer"]["evidence"]), 132)
        self.assertEqual(result["Unreached"]["surfaces"]["generatedConsumer"]["state"], "unavailable")
        self.assertNotIn("historical.json", str(result))
        self.assertEqual(before, self.capabilities)

    def test_one_failed_mount_overrides_131_passes(self):
        self.ledger["rows"][0]["status"] = "fail"
        self.ledger["rows"][0]["gates"][4]["status"] = "fail"
        self.summarize()
        self.assertEqual(self.project()["Button"]["surfaces"]["generatedConsumer"]["state"], "fail")

    def test_named_gap_is_never_a_pass_even_when_other_cells_pass(self):
        row = self.ledger["rows"][0]
        row.update(status="typed-gap", components=[], gap={"code": "OODS-N015", "components": ["Button"], "reason": "Button lacks target evidence"})
        self.summarize()
        cell = self.project()["Button"]["surfaces"]["generatedConsumer"]
        self.assertEqual(cell["state"], "unavailable")
        self.assertIn("Button", cell["reason"])

    def test_duplicate_missing_or_historical_cells_cannot_inflate_coverage(self):
        original = copy.deepcopy(self.ledger)
        for mutation in ("duplicate", "missing", "head", "run", "union", "summary", "pack", "browser"):
            self.ledger = copy.deepcopy(original)
            if mutation == "duplicate": self.ledger["rows"][-1] = copy.deepcopy(self.ledger["rows"][0])
            if mutation == "missing": self.ledger["rows"].pop()
            if mutation == "head": self.ledger["rows"][0]["head"] = "historical-head"
            if mutation == "run": self.ledger["rows"][0]["runId"] = "other-run"
            if mutation == "union": self.ledger["historicalReceiptsUnioned"] = True
            if mutation == "summary": self.ledger["summary"]["pass"] = 133
            if mutation == "pack": self.ledger["packCount"] = 2
            if mutation == "browser": self.ledger["browserImage"] = "local-browser"
            with self.subTest(mutation=mutation), self.assertRaises(ValueError): self.project()

    def test_passing_label_cannot_mask_missing_or_failed_gates(self):
        original = copy.deepcopy(self.ledger)
        for mutation in ("missing", "failed", "duplicate", "artifact"):
            self.ledger = copy.deepcopy(original)
            row = self.ledger["rows"][0]
            if mutation == "missing": row["gates"].pop()
            if mutation == "failed": row["gates"][4]["status"] = "fail"
            if mutation == "duplicate": row["gates"].append(copy.deepcopy(row["gates"][4]))
            if mutation == "artifact": row["artifactHash"] = None
            with self.subTest(mutation=mutation), self.assertRaisesRegex(ValueError, "required proof"): self.project()

    def test_workflow_population_must_include_both_targets_of_all_objects(self):
        workflows = [dict(copy.deepcopy(row), context="workflow") for row in self.ledger["rows"] if row["context"] == "card"]
        self.ledger["rows"].extend(workflows)
        self.summarize()
        self.assertEqual(len(self.project()["Button"]["surfaces"]["generatedConsumer"]["evidence"]), 154)
        self.ledger["rows"].pop()
        self.summarize()
        with self.assertRaisesRegex(ValueError, "complete distinct"): self.project()


if __name__ == "__main__":
    unittest.main()
