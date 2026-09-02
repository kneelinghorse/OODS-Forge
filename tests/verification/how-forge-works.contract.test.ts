import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BRAND_CONTRAST_PAIRS, BRAND_CONTRAST_RULES } from "@oods/a11y-tools";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const read = (path: string) => readFileSync(resolve(projectRoot, path), "utf8");

function countTokenLeaves(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const object = node as Record<string, unknown>;
  if ("$value" in object) return 1;
  return Object.values(object).reduce(
    (count, child) => count + countTokenLeaves(child),
    0,
  );
}

interface ToolRegistry {
  auto: string[];
  onDemand: string[];
}

interface CertifyOutputSchema {
  properties: {
    pillars: {
      required: string[];
    };
  };
}

describe("how Forge works narrative truth", () => {
  const html = read("docs/how-forge-works.html");

  it("derives the registered tool counts and roster split from registry.json", () => {
    const registry = JSON.parse(
      read("packages/mcp-server/src/tools/registry.json"),
    ) as ToolRegistry;

    expect(registry.auto).toHaveLength(20);
    expect(registry.onDemand).toHaveLength(6);
    expect(html).toContain(
      "26 registered tools (20 auto + 6 on demand), as defined by",
    );
    expect(html).toContain(
      "packages/mcp-server/src/tools/registry.json</span>: 20 tools register by default and 6 more",
    );

    const onDemandRow = html.match(
      /<tr><td>On demand<\/td><td>(.*?)<\/td><\/tr>/,
    )?.[1];
    expect(onDemandRow).toBeDefined();
    for (const tool of registry.onDemand) {
      expect(onDemandRow).toContain(tool);
    }
    expect(onDemandRow).not.toContain("review (resolve, chain)");
    expect(html).toContain(
      "map (create, list, resolve, update, delete, apply) · review (resolve, chain)",
    );
  });

  it("names all four certification pillars, including accuracy", () => {
    const schema = JSON.parse(
      read("packages/mcp-server/src/schemas/artifact.certify.output.json"),
    ) as CertifyOutputSchema;

    expect(schema.properties.pillars.required).toEqual([
      "a11yEquivalence",
      "determinism",
      "contrast",
      "accuracy",
    ]);
    expect(html).toContain(
      "four core certification pillars are accessibility equivalence, determinism, contrast and accuracy",
    );
    expect(
      html.match(
        /<tr><td>(Accessibility equivalence|Determinism|Contrast|Accuracy)<\/td>/g,
      ),
    ).toHaveLength(4);
  });

  it("derives the published token, bridge, and brand-contrast counts", () => {
    const generatedCss = read("packages/tokens/dist/css/tokens.css");
    const uniqueCssVariables = new Set(
      [...generatedCss.matchAll(/(--[a-zA-Z0-9_-]+):/g)].map(
        (match) => match[1],
      ),
    );
    const brandBase = JSON.parse(
      read("packages/tokens/src/tokens/brands/A/base.json"),
    );
    const bridge = read("packages/tokens/scripts/brand-bridge.mjs");
    const bridgedSlots = [...bridge.matchAll(/tokenPath:\s*'([^']+)'/g)];

    expect(uniqueCssVariables.size).toBe(782);
    expect(countTokenLeaves(brandBase)).toBe(44);
    expect(bridgedSlots).toHaveLength(41);
    expect(BRAND_CONTRAST_PAIRS).toHaveLength(57);
    expect(BRAND_CONTRAST_RULES).toHaveLength(228);

    expect(html).toContain("CSS custom properties (782 variables)");
    expect(html).toContain("44 leaves each");
    expect(html).toContain("re-assigns 41 shared theme slots");
    expect(html).toContain(
      "228 brand-contrast rules (57 text/icon pairs per brand per theme)",
    );
  });

  it("records that the narrative base has been tracked since 4f64bcf", () => {
    const ledger = read("cmos/planning/forge-open-arcs-ledger-2026-08.md");

    expect(ledger).toContain(
      "docs/how-forge-works.html (tracked since 4f64bcf)",
    );
    expect(ledger).not.toContain("docs/how-forge-works.html (untracked)");
    expect(ledger).not.toContain(
      "docs/how-forge-works.html — untracked, Derek review owed",
    );
  });
});
