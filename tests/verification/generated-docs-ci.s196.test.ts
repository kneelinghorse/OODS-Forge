import { readFileSync } from "node:fs";
import { load as parseYaml } from "js-yaml";
import { describe, expect, it } from "vitest";

const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts as Record<string, string>;
const workflow = parseYaml(readFileSync(".github/workflows/ci.yml", "utf8")) as {
  jobs: Record<string, { steps: Array<{ name?: string; run?: string }> }>;
};

describe("generated documentation cannot silently lose its CI gate", () => {
  it("checks all six generated surfaces without regenerating their evidence", () => {
    const commands = scripts["docs:check"].split(" && ").map(command =>
      command.replace(/pnpm run (docs:[a-z]+) --/, (_match, script: string) => scripts[script]),
    );
    const generators = [
      "scripts/docs/generate-api-reference.ts",
      "scripts/product-reality/s195-viz-taxonomy.ts",
      "scripts/product-reality/s195-pattern-census.ts",
      "scripts/docs/generate-component-docs.ts",
      "scripts/docs/generate-tool-specs.ts",
      "scripts/docs/generate-forge-claims.ts",
    ];
    expect(commands).toEqual(generators.map(generator => `tsx ${generator} --check${generator.endsWith("s195-pattern-census.ts") ? " --observations artifacts/product-reality/sprint-199/m03/patterns/pattern-observations.json" : ""}`));
    expect(scripts["docs:check"]).not.toContain("--measure");
  });

  it("runs the aggregate gate once after its token and package inputs are built", () => {
    const steps = workflow.jobs.build.steps;
    const gates = steps.filter(step => step.run?.includes("docs:check"));
    expect(gates).toHaveLength(1);
    expect(gates[0].name).toContain("docs:check");
    expect(gates[0].run).toBe("pnpm -w run docs:check");
    const gate = steps.indexOf(gates[0]);
    for (const prerequisite of ["pnpm run build:tokens", "pnpm run build:packages"]) {
      const index = steps.findIndex(step => step.run === prerequisite);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(gate);
    }
  });
});
