import { readFileSync } from "node:fs";
import { load as parseYaml } from "js-yaml";
import { describe, expect, it } from "vitest";

const workflow = parseYaml(readFileSync(".github/workflows/ci.yml", "utf8")) as {
  jobs: Record<string, { steps: Array<{ run?: string; uses?: string; if?: string; env?: Record<string, string>; with?: Record<string, string> }> }>;
};
const steps = workflow.jobs["runtime-cells"].steps;
const output = "artifacts/product-reality/sprint-195/m07-ci";

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
});
