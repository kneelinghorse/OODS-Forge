import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load as parseYaml } from "js-yaml";
import { describe, expect, it } from "vitest";

interface WorkflowStep {
  name?: string;
  run?: string;
}

interface WorkflowJob {
  if?: string;
  steps?: WorkflowStep[];
}

interface Workflow {
  on?: Record<string, unknown>;
  jobs?: Record<string, WorkflowJob>;
}

const PR_ONLY_GUARD = "${{ github.event_name == 'pull_request' }}";
const PR_BASE_EXPRESSION = "${{ github.event.pull_request.base.sha }}";

describe("CI token-governance event contract", () => {
  const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
  const workflow = parseYaml(
    readFileSync(resolve(projectRoot, ".github/workflows/ci.yml"), "utf8"),
  ) as Workflow;
  const governance = workflow.jobs?.["tokens-governance"];

  it("keeps push CI enabled while making the PR-context governance matrix PR-only", () => {
    expect(workflow.on).toHaveProperty("push");
    expect(workflow.on).toHaveProperty("pull_request");
    expect(workflow.jobs?.build?.if).not.toBe(PR_ONLY_GUARD);
    expect(
      governance,
      "ci.yml must retain the tokens-governance job",
    ).toBeDefined();
    expect(
      governance?.if,
      "a push event has no pull_request payload, so this job must be excluded at dispatch rather than run with empty PR inputs",
    ).toBe(PR_ONLY_GUARD);
  });

  it("keeps the governed diff tied to the PR base only behind that event guard", () => {
    const diffStep = governance?.steps?.find((step) =>
      step.name?.startsWith("Run tokens-governance diff"),
    );

    expect(
      diffStep,
      "tokens-governance must retain its matrix diff step",
    ).toBeDefined();
    expect(diffStep?.run).toContain(`--base "${PR_BASE_EXPRESSION}"`);
    expect(governance?.if).toBe(PR_ONLY_GUARD);
  });
});
