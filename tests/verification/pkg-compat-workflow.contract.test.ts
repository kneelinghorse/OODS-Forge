import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load as parseYaml } from "js-yaml";
import { describe, expect, it } from "vitest";

interface WorkflowTrigger {
  paths?: string[];
}

interface PackageCompatibilityWorkflow {
  on?: {
    push?: WorkflowTrigger;
    pull_request?: WorkflowTrigger;
  };
}

describe("Package Compatibility workflow path contract", () => {
  const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
  const workflow = parseYaml(
    readFileSync(
      resolve(projectRoot, ".github/workflows/pkg-compat.yml"),
      "utf8",
    ),
  ) as PackageCompatibilityWorkflow;

  it.each(["push", "pull_request"] as const)(
    "runs for %s changes to the actual tsup configuration",
    (trigger) => {
      const paths = workflow.on?.[trigger]?.paths;

      expect(
        paths,
        `${trigger}.paths must remain an explicit packaging-input allowlist`,
      ).toBeDefined();
      expect(paths).toContain("tsup.config.mjs");
      expect(paths).not.toContain("tsup.config.ts");
    },
  );
});
