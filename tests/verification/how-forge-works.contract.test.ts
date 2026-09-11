import { readFileSync, existsSync } from "node:fs";
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

  it("pins the source-writing brand seam and the explicitly bounded token consumers (s194)", () => {
    const descriptions = JSON.parse(read("packages/mcp-adapter/tool-descriptions.json"));
    expect(html).toContain("writes canonical brand source and runs both token-build stages");
    expect(html).toContain("leaves source writes in place");
    expect(html).toContain("requested-scope JSON and CSS");
    expect(html).toContain("legacy A/light TypeScript and Tailwind artifacts");
    expect(html).toContain("using built A/B light tokens");
    expect(descriptions["brand.apply"]).toContain("OODS-S019");
    expect(descriptions["brand.intake"]).toContain("delta consumable by brand.apply");
    expect(descriptions["tokens.build"]).not.toContain("inputs label");
    expect(descriptions["fidelity.preview"]).toContain("Unknown brands return OODS-BM-002");
    expect(read("packages/mcp-server/src/codegen/branded-mockup-emitter.ts")).not.toContain("const BRAND_TOKENS");
  });

  it("derives the registered tool counts and roster split from registry.json", () => {
    const registry = JSON.parse(
      read("packages/mcp-server/src/tools/registry.json"),
    ) as ToolRegistry;

    expect(registry.auto).toHaveLength(21);
    expect(registry.onDemand).toHaveLength(6);
    expect(html).toContain(
      "27 registered tools (21 auto + 6 on demand), as defined by",
    );
    expect(html).toContain(
      "packages/mcp-server/src/tools/registry.json</span>: 21 tools register by default and 6 more",
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

  it("states all registered chart SVG families and the actual certification scope", () => {
    const render = JSON.parse(read("packages/mcp-server/src/schemas/viz.render.input.json"));
    const certify = JSON.parse(read("packages/mcp-server/src/schemas/artifact.certify.input.json"));
    expect(render.properties.chartType.enum).toHaveLength(13);
    expect(html).toContain("server-rendered SVG for all 13 registered chart types");
    const dashboard = read("packages/mcp-server/src/tools/dashboard.render.html.ts");
    expect(dashboard).toContain("await renderVegaLiteToSvg(");
    expect(dashboard).toContain("await renderEChartsToSvg(");
    expect(html).not.toContain("the others appear as described placeholders");
    expect(certify.properties.brand.enum).toEqual(["A", "B"]);
    expect(certify.properties.brand.default).toBe("A");
    expect(certify.properties.theme.enum).toEqual(["light", "dark"]);
    expect(certify.properties.theme.default).toBe("light");
    expect(html).toContain("It accepts brand A or B and theme light or dark (defaults A/light)");
    expect(html).toContain("server-side high-contrast chart pixels are unsupported");
    expect(html).not.toContain("takes no brand input");
    expect(html).not.toContain("light theme, brand-independent");
    expect(html).not.toContain("Light theme only.");
  });

  it("Tool-Specs links resolve to existing grouped API pages", () => {
    const specs = read("docs/mcp/Tool-Specs.md");
    const links = [...specs.matchAll(/\]\((\.\.\/api\/[^)]+)\)/g)].map(match => match[1]);
    expect(links.length).toBeGreaterThan(10);
    for (const link of links) expect(existsSync(resolve(projectRoot, "docs/mcp", link.split("#")[0])), link).toBe(true);
    for (const family of ["map", "schema", "object"]) expect(links).toContain(`../api/${family}.md`);
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

    expect(uniqueCssVariables.size).toBe(916);
    expect(countTokenLeaves(brandBase)).toBe(44);
    expect(bridgedSlots).toHaveLength(41);
    expect(BRAND_CONTRAST_PAIRS).toHaveLength(57);
    expect(BRAND_CONTRAST_RULES).toHaveLength(228);

    expect(html).toContain("CSS custom properties (916 variables)");
    expect(html).toContain("44 leaves each");
    expect(html).toContain("re-assigns 41 shared theme slots");
    expect(html).toContain(
      "228 brand-contrast rules (57 text/icon pairs per brand per theme)",
    );
  });

  it("derives current Sprint 193 claims from the served ledger without approving the proposal", () => {
    const ledger = JSON.parse(read("packages/component-contracts/registry/component-capability-ledger.v1.json"));
    const counts = (surface: string, state: string) => ledger.rows.filter((row: { surfaces: Record<string, { state: string }> }) => row.surfaces[surface].state === state).length;
    expect(ledger.rows).toHaveLength(109);
    expect(counts("react", "implemented-evidence-complete")).toBe(109);
    expect(counts("vue", "implemented-evidence-complete")).toBe(109);
    expect(counts("html", "mapped")).toBe(109);
    expect(counts("accessibility", "verified")).toBe(109);
    expect(counts("theme", "verified")).toBe(109);
    expect(counts("interaction", "verified")).toBe(40);
    expect(counts("interaction", "not-applicable")).toBe(69);
    expect(counts("interaction", "unavailable")).toBe(0);
    expect(ledger.approvedRuntimeCensus).toBeNull();
    expect(html).toContain("109 React and 109 Vue implementations, 109 HTML mappings");
    expect(html).toContain("verified for 40 and explicitly not applicable for 69 static rows");
    expect(html).toContain("24 native, 84 recipe and 1 alias");
    expect(nearRoadmap).toContain("40 verified / 69 not-applicable");
    expect(nearRoadmap).toContain("Increment 12 — Sprint 193: Runtime at scale — CERTIFIED AND CLOSED");
    expect(counts("generatedConsumer", "implemented-evidence-complete")).toBe(66);
    expect(counts("generatedConsumer", "unavailable")).toBe(43);
    expect(nearRoadmap).toContain("66/109");
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
    expect(html).toContain("Derek accepted retaining all 109 obligations in decision #1788");
    expect(html).toContain("exactly 14 React and 14 Vue surface cells");
    expect(html).toContain("a separate independent review accepted");
    expect(html).toContain("promoted all 28");
    expect(html).toContain("does not approve the 98-row runtime census");
    expect(html).toContain("@oods/components-react</span> package");
    expect(html).toContain("@oods/components-vue</span>");
    expect(html).toContain("@oods/component-styles/css</span>");
    expect(html).toContain("OODS-N015</span> and no source payload");

    // Sprint 187's independent review closes the locked breadth scope without
    // changing the historical foundation authority or approving the old census.
    expect(nearRoadmap).toContain("Sprint 182: Product Reality Foundation — CLOSED 2026-09-04");
    expect(nearRoadmap).toContain("decision `#1662`");
    expect(normalizedNear).toContain("promoted by Derek (decision `#1663`)");
    expect(normalizedNear).toContain(
      "The 14-component nucleus is real in React and Vue with clean packed-consumer proof.",
    );
    expect(normalizedNear).toContain(
      "The historical `approvedRuntimeCensus` stays null while that old proposal is unapproved",
    );
    expect(nearRoadmap).toContain("The old 98-runtime split is not approved.");
    expect(nearRoadmap).toContain("Sprint 183: Runnable Generation");
    expect(normalizedNear).toContain(
      "installs, builds, renders, hydrates and passes interactions in clean React and Vue consumers",
    );
    expect(normalizedNear).toContain(
      "## Increment 6 — Sprint 187: Fresh Composition Coverage — CERTIFIED AND CLOSED",
    );
    expect(normalizedNear).toContain(
      "## Increment 7 — Sprint 188: Ship, then make the Subscription app whole — CERTIFIED AND CLOSED",
    );
    expect(nearRoadmap).not.toContain("Sprint 188 BUILT, REVIEW PENDING");
    expect(normalizedNear).toContain(
      "## Increment 8 — Sprint 189: Browser design loop — CERTIFIED AND CLOSED",
    );
    expect(nearRoadmap).not.toContain("Browser design loop — BUILT, REVIEW PENDING");
    expect(normalizedNear).toContain(
      "## Increment 9 — Sprint 190: Visualization public render — CERTIFIED AND CLOSED",
    );
    expect(nearRoadmap).not.toContain("Visualization public render — BUILT, REVIEW PENDING");
    expect(normalizedNear).toContain(
      "## Increment 10 — Sprint 191: Carry-forward pay-down — CERTIFIED AND CLOSED",
    );
    expect(nearRoadmap).not.toContain("Carry-forward pay-down — BUILT, REVIEW PENDING");
    expect(normalizedNear).toContain(
      "## Increment 11 — Sprint 192: Component truth — CERTIFIED AND CLOSED",
    );
    expect(nearRoadmap).not.toContain("Component truth — BUILT, REVIEW PENDING");
    expect(normalizedNear).toContain(
      "## Increment 12 — Sprint 193: Runtime at scale — CERTIFIED AND CLOSED",
    );
    expect(nearRoadmap).not.toContain("Runtime at scale — BUILT, REVIEW PENDING");
    expect(normalizedNear).toContain(
      "A build session records evidence and stops. A separate review session decides genuine close",
    );
    // Sprint 191 closes the maintenance implementation; delivery must stay pending.
    expect(normalizedNear).toContain("Sprint 191 m04 closes maintenance `#1318`–`#1322`");
    expect(normalizedNear).toContain("`#1315` remains pending");
    expect(nearRoadmap).not.toContain(
      "Both targets import nonexistent `@oods/components`",
    );
    expect(nearRoadmap).not.toContain(
      "Vue | Emitter fixtures exist; runtime implementations do not",
    );
    expect(nearRoadmap).not.toContain("begins\n`s182-m01`");
  });
});
