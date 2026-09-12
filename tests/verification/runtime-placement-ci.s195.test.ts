import { readFileSync } from "node:fs";
import { load as parseYaml } from "js-yaml";
import { describe, expect, it } from "vitest";

const workflow = parseYaml(readFileSync(".github/workflows/ci.yml", "utf8")) as {
  jobs: Record<string, { steps: Array<{ run?: string; uses?: string; if?: string; env?: Record<string, string>; with?: Record<string, string> }> }>;
};
const steps = workflow.jobs["runtime-cells"].steps;
const output = "artifacts/product-reality/sprint-196/runtime-ci";

describe("Sprint 195 runtime placement CI population", () => {
  it("measures chart dashboards in the same sweep as all canonical workflows", () => {
    const sweeps = steps.filter(step => step.run?.includes("scripts/product-reality/s193-runtime-cells.ts"));
    expect(sweeps).toHaveLength(1);
    expect(sweeps[0].run).toContain(`${output} --workflows --dashboard-objects=Invoice,Usage`);
    expect(sweeps[0].run).not.toContain("/m07/runtime");
  });

  it("checks all 48 placement themes and retains fresh receipts even on failure", () => {
    const gate = steps.find(step => step.env?.OODS_RUNTIME_REPORT);
    expect(gate?.env?.OODS_RUNTIME_REPORT).toBe(`\${{ github.workspace }}/${output}/runtime-cells.v1.json`);
    expect(gate?.run).toContain("test/product-reality/runtime-cells.s193.spec.ts test/product-reality/workflow-runtime.s193.spec.ts");
    expect(gate?.run).toContain(`artifacts/product-reality/sprint-195/m06/verify-runtime.ts ${output}`);
    const upload = steps.find(step => step.uses === "actions/upload-artifact@v4");
    expect(upload?.if).toBe("always()");
    expect(upload?.with?.path).toBe(output);
  });

  it("retains a separately measured release sweep and its original archive metadata", () => {
    const releaseSteps = workflow.jobs["release-runtime"].steps;
    const releaseOutput = "artifacts/product-reality/sprint-196/release-ci";
    const assemble = releaseSteps.findIndex(step => step.run?.includes("scripts/runtime/assemble.mjs"));
    const sweep = releaseSteps.findIndex(step => step.run?.includes("scripts/product-reality/s193-runtime-cells.ts"));
    expect(assemble).toBeGreaterThanOrEqual(0);
    expect(sweep).toBeGreaterThan(assemble);
    expect(releaseSteps[assemble].run).toContain("--final");
    expect(releaseSteps[sweep].run).toContain(releaseOutput);
    expect(releaseSteps[sweep].run).toContain('--bundle-dir "$RUNNER_TEMP/release-runtime-extracted"');
    expect(releaseSteps[sweep].run).toContain('--bundle-archive "$RUNNER_TEMP/release-runtime-out/forge-runtime.tar.gz"');
    const gate = releaseSteps.find(step => step.env?.OODS_RELEASE_REPORT);
    expect(gate?.env?.OODS_RELEASE_REPORT).toBe(`\${{ github.workspace }}/${releaseOutput}/release-cells.v1.json`);
    expect(gate?.run).toContain("test/product-reality/release-runtime.s196.spec.ts");
    // runner.temp paths can disappear from a container upload. Copy originals
    // inside the retained sweep, so a reviewer receives the archive identity.
    for (const file of ["forge-runtime.manifest.json", "runtime-sbom-lite.json", "forge-runtime.tar.gz.sha256"]) {
      expect(releaseSteps[assemble].run).toContain(`$RUNNER_TEMP/release-runtime-out/${file}`);
    }
    expect(releaseSteps[assemble].run).toContain(`${releaseOutput}/archive/`);
    const upload = releaseSteps.find(step => step.uses === "actions/upload-artifact@v4");
    expect(upload?.if).toBe("always()");
    expect(upload?.with?.path).toBe(releaseOutput);
  });
});
