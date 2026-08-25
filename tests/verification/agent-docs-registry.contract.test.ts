import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const read = (path: string) => readFileSync(resolve(projectRoot, path), "utf8");

interface ToolRegistry {
  auto: string[];
  onDemand: string[];
}

const registry = JSON.parse(
  read("packages/mcp-server/src/tools/registry.json"),
) as ToolRegistry;

describe("agent-facing MCP docs follow the live registry", () => {
  it("publishes the exact registry roster in README and agents guidance", () => {
    const readme = read("README.md");
    const agents = read("agents.md");
    const total = registry.auto.length + registry.onDemand.length;
    const retired = [
      ["reviewKit", "create"].join("."),
      ["purity", "audit"].join("."),
      ["vrt", "run"].join("."),
    ];
    const retiredReplOperations = ["render", "validate"].map(
      (operation) => `repl.${operation}`,
    );

    expect(readme).toContain(`## MCP tool surface (${total} tools)`);
    expect(readme).toContain(
      `**Auto-registered (${registry.auto.length} tools)**`,
    );
    expect(readme).toContain(
      `**On-demand (${registry.onDemand.length} tools)**`,
    );
    expect(agents).toContain(
      `Auto-registered (${registry.auto.length} tools):`,
    );
    expect(agents).toContain(`On-demand (${registry.onDemand.length} tools):`);

    const readmeAuto = readme.slice(
      readme.indexOf("**Auto-registered"),
      readme.indexOf("**On-demand"),
    );
    const readmeOnDemand = readme.slice(
      readme.indexOf("**On-demand"),
      readme.indexOf("## Repo layout"),
    );
    const agentsAuto = agents.slice(
      agents.indexOf("Auto-registered"),
      agents.indexOf("On-demand"),
    );
    const agentsOnDemand = agents.slice(
      agents.indexOf("On-demand"),
      agents.indexOf("Enable on-demand tools"),
    );

    for (const name of registry.auto) {
      expect(readmeAuto, `README auto roster must include ${name}`).toContain(
        `\`${name}\``,
      );
      expect(agentsAuto, `agents auto roster must include ${name}`).toContain(
        `\`${name}\``,
      );
    }
    for (const name of registry.onDemand) {
      expect(
        readmeOnDemand,
        `README on-demand roster must include ${name}`,
      ).toContain(`\`${name}\``);
      expect(
        agentsOnDemand,
        `agents on-demand roster must include ${name}`,
      ).toContain(`\`${name}\``);
    }

    for (const document of [readme, agents]) {
      for (const name of retired) expect(document).not.toContain(name);
      for (const name of retiredReplOperations) {
        expect(document).not.toContain(name);
      }
      expect(document).toContain("packages/mcp-server/src/tools/registry.json");
    }
  });

  it("states the four flagship capability pillars, including accuracy", () => {
    const readme = read("README.md");
    const capabilityBlock = readme.slice(
      readme.indexOf("## Four capability pillars"),
      readme.indexOf("## Two repos, two roles"),
    );

    expect(capabilityBlock).toContain("### 1) Accuracy");
    expect(capabilityBlock).toContain("### 2) Fidelity");
    expect(capabilityBlock).toContain("### 3) Contract-determinism");
    expect(capabilityBlock).toContain("### 4) Accessibility-by-construction");
    expect(capabilityBlock.match(/^### \d\)/gm)).toHaveLength(4);
  });

  it("derives both registration totals from registry.json", () => {
    const specs = read("docs/mcp/Tool-Specs.md");
    const registryPath = "packages/mcp-server/src/tools/registry.json";

    expect(specs).toContain(
      `Auto tools are registered by default (${registry.auto.length} at the time of writing). On-demand tools are only registered when enabled (${registry.onDemand.length} at the time of writing).`,
    );
    expect(specs).toContain(
      `## Auto tool contracts (${registry.auto.length} registry entries)`,
    );
    expect(specs).toContain(
      `The ${registry.auto.length} default entries come from \`${registryPath}\`.`,
    );
    expect(specs).toContain(
      `## On-demand tool contracts (${registry.onDemand.length} registry entries)`,
    );
    expect(specs).toContain(
      `The ${registry.onDemand.length} on-demand entries come from \`${registryPath}\`.`,
    );
    expect(specs).not.toContain(`Auto tool contracts (${19 + 3} tools)`);
    expect(specs).not.toContain("remaining 11 default tools");
    expect(specs).not.toContain(
      `On-demand tool contracts (${registry.onDemand.length + 3} tools)`,
    );
  });

  it("uses live grouped names for validation and the render-to-certify handoff", () => {
    const recipes = read("docs/mcp/Agent Recipes — Quick Index.md");
    const registered = new Set([...registry.auto, ...registry.onDemand]);

    for (const name of [
      "a11y.scan",
      "repl",
      "viz.render",
      "artifact.certify",
    ]) {
      expect(registered.has(name), `${name} must be registered`).toBe(true);
    }

    expect(recipes).not.toContain(["repl", "validate"].join("."));
    expect(recipes).toContain('repl { "action": "validate"');
    expect(recipes).toContain('"output": { "includeNormalizedSpec": true }');
    expect(recipes).toContain(
      "Copy the returned normalizedSpec object into spec",
    );
    expect(recipes).toContain('artifact.certify { "spec": { ... } }');
    expect(recipes).toContain(
      "`artifact.certify.contentHash` equals `viz.render.contentHash`",
    );

    const render = recipes.indexOf("viz.render {");
    const certify = recipes.indexOf("artifact.certify {");
    expect(render).toBeGreaterThanOrEqual(0);
    expect(certify).toBeGreaterThan(render);
  });

  it("has balanced markdown fences without an outer document fence", () => {
    const recipes = read("docs/mcp/Agent Recipes — Quick Index.md");
    const nonEmptyLines = recipes.split("\n").filter((line) => line.trim());
    const fences = recipes.match(/^(?:> )?```/gm) ?? [];

    expect(nonEmptyLines[0]).toBe("# Agent Recipes — Quick Index");
    expect(nonEmptyLines.at(-1)).not.toMatch(/^```/);
    expect(fences).toHaveLength(14);
  });
});
