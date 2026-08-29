import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);
const outputSchema = JSON.parse(
  readFileSync(
    new URL(
      "packages/mcp-server/src/schemas/artifact.certify.output.json",
      root,
    ),
    "utf8",
  ),
) as {
  description: string;
  properties: Record<string, { description?: string }>;
};
const inputSchema = JSON.parse(
  readFileSync(
    new URL(
      "packages/mcp-server/src/schemas/artifact.certify.input.json",
      root,
    ),
    "utf8",
  ),
) as { description: string };
const adapterDescriptions = JSON.parse(
  readFileSync(
    new URL("packages/mcp-adapter/tool-descriptions.json", root),
    "utf8",
  ),
) as Record<string, string>;
const bridgePolicy = JSON.parse(
  readFileSync(new URL("configs/agent/policy.json", root), "utf8"),
) as { tools: Array<{ name: string; description?: string }> };

const policyDescription = bridgePolicy.tools.find(
  ({ name }) => name === "artifact.certify",
)?.description;

const advertised = [
  JSON.stringify(inputSchema),
  JSON.stringify(outputSchema),
  adapterDescriptions["artifact.certify"],
  policyDescription,
].join("\n");

describe("artifact.certify advertised ECharts render truth (s179 m05)", () => {
  it.each([
    "never carries renderHash",
    "no ECharts response ever carries renderHash",
    "no render, no renderHash, ever",
    "never a rendered picture",
    "RECONSTRUCTION-GRADED",
    "reconstruction-graded",
    "parked render rung",
    "runtime force physics",
    "no baked seed",
    "option-vs-physics limit",
  ])(
    "retires the superseded phrase %j from every advertised surface",
    (phrase) => {
      expect(advertised).not.toContain(phrase);
    },
  );

  it("advertises both hashes and the certified runtime-matrix identity", () => {
    expect(outputSchema.description).toContain(
      "contentHash identifies the projected ECharts option",
    );
    expect(outputSchema.description).toContain(
      "renderHash identifies the first normalized SVG",
    );
    expect(outputSchema.description).toContain(
      "packages/viz-render/certified-matrix.json",
    );
  });

  it("describes the brand-invariant ECharts paint source as the rendered projection", () => {
    expect(inputSchema.description).toContain(
      "data-backed ECharts paints come from the rendered projected option",
    );
    expect(inputSchema.description).toContain(
      "geo render evidence remains exempt with no canvas ratio",
    );
    expect(inputSchema.description).not.toContain(
      "colour hexes baked into the compiled spec",
    );
    expect(adapterDescriptions["artifact.certify"]).toContain(
      "geo render evidence remains exempt with no canvas ratio",
    );
    expect(outputSchema.properties.contrastNote.description).toContain(
      "no canvas ratio is graded",
    );
  });

  it("advertises render-measured ECharts contrast on the adapter and bridge surfaces", () => {
    for (const description of [
      adapterDescriptions["artifact.certify"],
      policyDescription,
    ]) {
      expect(description).toContain(
        "ECharts contrast is render-measured when `data` is supplied",
      );
      expect(description).toContain(
        "spec-only calls retain the reconstructed baked-palette verdict",
      );
    }
  });
});
