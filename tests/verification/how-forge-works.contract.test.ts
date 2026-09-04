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
  const nearRoadmap = read("cmos/foundational-docs/roadmap/near.md");

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

  it("keeps Sprint-182 product-reality claims evidence-scoped and review-gated", () => {
    const capabilityCloseout = JSON.parse(
      read(
        "packages/component-contracts/registry/component-capability-closeout.s182.v1.json",
      ),
    ) as {
      controllingObligationDenominator: number;
      approvedRuntimeCensus: null;
      independentReviewApproved: boolean;
      rows: Array<{
        proposedClassification: string;
        reconciliationState: string;
      }>;
      foundationCells: Array<{
        target: "react" | "vue";
        evaluation: { candidate: boolean; foundationV1: boolean };
      }>;
    };
    const nonRuntimeRows = capabilityCloseout.rows.filter(
      (row) => row.proposedClassification === "authoring-only",
    );
    const runtimeRows = capabilityCloseout.rows.filter(
      (row) => row.proposedClassification !== "authoring-only",
    );
    const reactReadiness = JSON.parse(
      read("packages/components-react/evidence/react-readiness.v1.json"),
    ) as { rows: unknown[] };
    const vueReadiness = JSON.parse(
      read("packages/components-vue/evidence/vue-readiness.v1.json"),
    ) as { rows: unknown[] };

    expect(capabilityCloseout.controllingObligationDenominator).toBe(109);
    expect(capabilityCloseout.rows).toHaveLength(109);
    expect(runtimeRows).toHaveLength(98);
    expect(nonRuntimeRows).toHaveLength(11);
    expect(
      capabilityCloseout.rows.every(
        (row) => row.reconciliationState === "proposed-awaiting-derek-approval",
      ),
    ).toBe(true);
    expect(capabilityCloseout.approvedRuntimeCensus).toBeNull();
    expect(capabilityCloseout.independentReviewApproved).toBe(false);
    expect(capabilityCloseout.foundationCells).toHaveLength(28);
    expect(
      capabilityCloseout.foundationCells.filter(
        (cell) => cell.target === "react" && cell.evaluation.candidate,
      ),
    ).toHaveLength(14);
    expect(
      capabilityCloseout.foundationCells.filter(
        (cell) => cell.target === "vue" && cell.evaluation.candidate,
      ),
    ).toHaveLength(14);
    expect(
      capabilityCloseout.foundationCells.every(
        (cell) => cell.evaluation.foundationV1 === false,
      ),
    ).toBe(true);
    expect(reactReadiness.rows).toHaveLength(14);
    expect(vueReadiness.rows).toHaveLength(14);

    expect(html).toContain("109 unique component claims");
    expect(html).toContain("98 as runtime component rows");
    expect(html).toContain("11 as non-runtime authoring-only rows");
    expect(html).toContain("All 109 remain pending Derek approval");
    expect(html).toContain("exactly 14 React and 14 Vue surface cells");
    expect(html).toContain("require a separate independent review");
    expect(html).toContain("@oods/components-react</span> package");
    expect(html).toContain("@oods/components-vue</span>");
    expect(html).toContain("@oods/component-styles/css</span>");
    expect(html).toContain("OODS-N015</span> and no source payload");

    expect(nearRoadmap).toContain("98 runtime rows and 11 non-runtime rows");
    expect(nearRoadmap).toContain("all pending Derek approval");
    expect(nearRoadmap).toContain(
      "exactly 14 React and 14 Vue `foundation-v1-candidate` cells",
    );
    expect(nearRoadmap).toContain("pending a separate independent review");
    expect(nearRoadmap).toContain("React imports `@oods/components-react`");
    expect(nearRoadmap).toContain("Vue imports `@oods/components-vue`");
    expect(nearRoadmap).toContain("both import `@oods/component-styles/css`");
    expect(nearRoadmap).toContain("typed `OODS-N015`");

    expect(html).toContain("The 25-tool roster comes from");
  });
});
