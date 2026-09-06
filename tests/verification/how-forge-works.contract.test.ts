import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BRAND_CONTRAST_PAIRS, BRAND_CONTRAST_RULES } from "@oods/a11y-tools";
import { NUCLEUS_COMPONENT_IDS } from "@oods/component-contracts";

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
  const normalizedNear = nearRoadmap.replace(/\s+/g, " ");

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
    expect(html).toContain(
      `The ${registry.auto.length + registry.onDemand.length}-tool roster comes from`,
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
        componentId: string;
        target: "react" | "vue";
        evaluation: { candidate: boolean; foundationV1: boolean };
      }>;
    };
    const promotedFoundation = JSON.parse(
      read(
        "packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json",
      ),
    ) as typeof capabilityCloseout;
    const nonRuntimeRows = capabilityCloseout.rows.filter(
      (row) => row.proposedClassification === "authoring-only",
    );
    const runtimeRows = capabilityCloseout.rows.filter(
      (row) => row.proposedClassification !== "authoring-only",
    );
    const reactReadiness = JSON.parse(
      read("packages/components-react/evidence/react-readiness.v1.json"),
    ) as { rows: Array<{ componentId: string }> };
    const vueReadiness = JSON.parse(
      read("packages/components-vue/evidence/vue-readiness.v1.json"),
    ) as { rows: Array<{ componentId: string }> };

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
    expect(promotedFoundation.approvedRuntimeCensus).toBeNull();
    expect(promotedFoundation.independentReviewApproved).toBe(true);
    expect(promotedFoundation.foundationCells).toHaveLength(28);
    expect(
      promotedFoundation.foundationCells.every(
        (cell) => cell.evaluation.foundationV1 === true,
      ),
    ).toBe(true);
    // The approved Sprint-182 membership remains historical evidence. Current
    // readiness follows the live nucleus, whose expansion is not an approval
    // of additional Sprint-182 foundation cells or the runtime census.
    for (const [target, readiness] of [
      ["react", reactReadiness],
      ["vue", vueReadiness],
    ] as const) {
      const approvedIds = promotedFoundation.foundationCells
        .filter((cell) => cell.target === target)
        .map((cell) => cell.componentId);
      const currentIds = readiness.rows.map((row) => row.componentId).sort();

      expect(approvedIds).toHaveLength(14);
      expect(new Set(approvedIds).size).toBe(approvedIds.length);
      expect(currentIds).toEqual([...NUCLEUS_COMPONENT_IDS].sort());
      expect(currentIds).toEqual(expect.arrayContaining(approvedIds));
    }

    expect(html).toContain("109 unique component claims");
    expect(html).toContain("98 as runtime component rows");
    expect(html).toContain("11 as non-runtime authoring-only rows");
    expect(html).toContain("All 109 remain pending Derek approval");
    expect(html).toContain("exactly 14 React and 14 Vue surface cells");
    expect(html).toContain("a separate independent review accepted");
    expect(html).toContain("promoted all 28");
    expect(html).toContain("does not approve the 98-row runtime census");
    expect(html).toContain("@oods/components-react</span> package");
    expect(html).toContain("@oods/components-vue</span>");
    expect(html).toContain("@oods/component-styles/css</span>");
    expect(html).toContain("OODS-N015</span> and no source payload");

    // Sprint 186: retain the historical foundation authority while the current
    // breadth build remains pending independent review (rule #1690).
    expect(nearRoadmap).toContain("Sprint 182: Product Reality Foundation — CLOSED 2026-09-04");
    expect(nearRoadmap).toContain("decision `#1662`");
    expect(normalizedNear).toContain("promoted by Derek (decision `#1663`)");
    expect(normalizedNear).toContain(
      "The 14-component nucleus is real in React and Vue with clean packed-consumer proof.",
    );
    expect(normalizedNear).toContain(
      "`approvedRuntimeCensus` stops being null and the 109 denominator can move (`#1331`)",
    );
    expect(nearRoadmap).toContain("98-row proposed runtime census");
    expect(nearRoadmap).toContain("Versioned artifacts, typed actions and behavioral local-state validation");
    expect(normalizedNear).toContain(
      "installs, builds, renders, hydrates and passes interactions in clean React and Vue consumers",
    );
    expect(normalizedNear).toContain(
      "## Increment 5 — Sprint 186: Component Breadth Wave 2 — BUILT, REVIEW PENDING",
    );
    expect(normalizedNear).toContain(
      "A build session records evidence and stops. A separate review session decides genuine close",
    );
    expect(normalizedNear).toContain("`#1315` and `#1318`–`#1322` remain Forge-owned maintenance debt");
    expect(nearRoadmap).not.toContain(
      "Both targets import nonexistent `@oods/components`",
    );
    expect(nearRoadmap).not.toContain(
      "Vue | Emitter fixtures exist; runtime implementations do not",
    );
    expect(nearRoadmap).not.toContain("begins\n`s182-m01`");
  });
});
