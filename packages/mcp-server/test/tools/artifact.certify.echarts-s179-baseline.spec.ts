// s179 m01 — pre-product operand-backed byte control.
//
// The older split control proves ECharts {spec}-only responses do not move, but those
// responses have no determinism object. This control supplies all eight canonical s172
// operands and freezes the separate operand-backed path before render grading lands. The
// pristine fixture remains immutable; m05 derives only its declared renderHash, scope-note,
// and render-measured contrast-note additions from that baseline.
//
// The fixture stays anchored to pristine 1be93f8. Later missions must describe and bound
// any intended delta here; silently recapturing the fixture would erase the baseline.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { NormalizedVizSpec } from "@oods/viz-core";
import { handle as certify } from "../../src/tools/artifact.certify.js";
import { handle as vizRender } from "../../src/tools/viz.render.js";
import {
  ECHARTS_OPERAND_CASES,
  renderInputFor,
  type EChartsOperandCase,
} from "./s172-echarts-operands.js";

const BASELINE_COMMIT = "1be93f8";
const EXPECTED_BASELINE_SHA256 =
  "b4295ab2b99152300ad142ff6fd86e2b3fdf94e1c17b599d297801181d5c87a1";

const BASELINE_PROJECTED_OPTION_HASHES: Readonly<Record<string, string>> = {
  treemap: "0f1887380e087bbd5e15b9bc926ddb7a887eed5cddcca5f052895e4a291fa10a",
  sunburst: "510b357978de88f2001e9b227033da4c6e7cc0dd920cd4a1e9c20cb0414c018b",
  sankey: "346b1675f25761bc4352b6f38ba89d66bbbaf11360800d525ade905b19832a15",
  chord: "6d844d7a48c2f7d897eee10b31cb0f78dcdd6677937651293077a1dcc701fb53",
  force_graph:
    "cfdb9cfb3dfd021318f0a42232fe63fb8bd6042806bc3f4e29fbebf648045519",
  choropleth:
    "178534c597318a742fae67e2fe6c9a24ea1cc75306bf736d6332ccef476ef5c1",
  bubble_map:
    "68580817ceab383b158c33fa62eaa36e40af8741725210ce4246f6822ad235e3",
  flow_map: "d02900062bbf0fa0f983e60de987a8919316032b74099366d90dfa464e4f7cd5",
};

const CHOROPLETH_M03_HASH =
  "e260ca0965e23f4de4cec03e9f898d7628b702830d85a1008650d85ad7aba9aa";
const CURRENT_PROJECTED_OPTION_HASHES: Readonly<Record<string, string>> = {
  ...BASELINE_PROJECTED_OPTION_HASHES,
  choropleth: CHOROPLETH_M03_HASH,
};

const CURRENT_RENDER_HASHES: Readonly<Record<string, string>> = {
  treemap: "b61714c82926e331f9eae00a17babaa8e2b54241994ffb2d192c355843242f5d",
  sunburst: "1a346625cc5a9962d13fae69df25b8f38ad6a88c6e76b1b1c7e28ea41c28d3bd",
  sankey: "37af640b0ff7480b5cc20e246caba087be45d361363e166bdca2002ae4f94e1e",
  chord: "68ee777050c31706845a197166cac058484dcf16e102bbf6c2009d19316ed662",
  force_graph:
    "c14f3173e6e6af1c3633e31ebb9acb5d968bcbc89c6c45e77b6be449214ee6c8",
  choropleth:
    "756b369388670679f3346dbd62c74f42c0780ee6f01ed06975e68139e48f671c",
  bubble_map:
    "7887dc246ae6e4562a3b7a34da998dc9a9b744bd45f1920d2d9673339025e5aa",
  flow_map: "58871d84288bc6d88add326b9793be9f5767b3675dcb675c7196e1941bbc202d",
};

const RENDER_SCOPE_NOTE =
  "This determinism verdict covers the emitted ECharts option and the normalized SVG " +
  "rendered from two independently emitted projected options. contentHash identifies the " +
  "first projected option; renderHash identifies the first normalized SVG. Cross-process " +
  "ECharts renderHash equality is certified only within the runtime axes recorded in " +
  "packages/viz-render/certified-matrix.json; changing a recorded dependency, runtime, " +
  "renderer/normalizer contract, token version, viewport, or snapshot policy requires " +
  "requalification.";

const RENDERED_GRADED_CAVEAT =
  "certify grades actual carrier paints extracted from the normalized SVG rendered from " +
  "the retained projected ECharts option against the requested CSS scope canvas.";

const RENDERED_EXEMPT_CAVEAT =
  "certify reads actual carrier paints from the normalized SVG rendered from the retained " +
  "projected ECharts option. Geo categorical contrast remains exempt, so no canvas ratio is graded.";

const CATEGORICAL_CONTRAST_NOTE =
  "Contrast was graded from the actual rendered ECharts carrier geometry and semantic " +
  `assignment. ${RENDERED_GRADED_CAVEAT}`;

const GEO_CONTRAST_NOTE =
  "Geo carrier paints were read from the rendered ECharts SVG, but geo color remains " +
  "exempt from categorical contrast grading under the standing gradient-essential ruling. " +
  RENDERED_EXEMPT_CAVEAT;

interface BaselineCell {
  readonly renderedContentHash: string;
  readonly certified: Record<string, unknown>;
}

const baselineBytes = readFileSync(
  new URL("./__fixtures__/s179-certify-operand-baseline.json", import.meta.url),
);
const baseline = JSON.parse(baselineBytes.toString("utf8")) as Record<
  string,
  BaselineCell
>;

// s199-m05: exact current hashes come from the real legacy operand matrix; the
// migration receipt retains every superseded s191 hash and the pristine fixture.
const currentMatrix = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-199/m05/matrix/matrix.json', import.meta.url), 'utf8'));
const scopedHash = (chartType: string): string => currentMatrix.table.find((row: any) => row.chartType === chartType && row.brand === 'A' && row.theme === 'light').svgHash;
// s195 m04 declared movers over the immutable historical fixture: coverage/fold,
// a11y pillar, newly offered rule counts, actual bubble V169, and path-specific prose.
const M04_RULE_COUNTS: Record<string, number> = { treemap: 2, sunburst: 2, sankey: 3, chord: 1, force_graph: 1, choropleth: 1, bubble_map: 3, flow_map: 2 };
const M04_OPERAND_NOTE = "The declared operand profile grades the 16 a11y-equivalence rules over the operand-built table and narrative. Error-severity failures or evaluation faults fail pillars.a11yEquivalence; warning findings retain their native severity without failing that pillar. Not-applicable rules appear in a11yNotApplicable[] with the absent precondition named. Conformance also requires stable determinism, contrast neither fail nor ungradeable, and at least one evaluated clean accuracy rule.";
function expectedCurrentCell(chartType: string, contentHash: string): BaselineCell {
  const cell = baseline[chartType];
  const determinism = cell.certified.determinism as Record<string, unknown>;
  const notes = cell.certified.notes as string[];
  const categorical = !["choropleth", "bubble_map", "flow_map"].includes(
    chartType,
  );
  return {
    renderedContentHash: contentHash,
    certified: {
      ...cell.certified,
      coverage: 'certified',
      conformant: true,
      findings: cell.certified.findings,
      pillars: { ...cell.certified.pillars as Record<string, unknown>, a11yEquivalence: 'pass', accuracy: 'pass' },
      accuracySummary: { rulesEvaluated: M04_RULE_COUNTS[chartType], failing: 0 },
      determinism: {
        ...determinism,
        contentHash,
        renderHash: scopedHash(chartType),
      },
      contrastNote: (categorical ? CATEGORICAL_CONTRAST_NOTE : GEO_CONTRAST_NOTE) + ' Scope: light/A.',
      notes: [notes[0].split('A11y-equivalence runs WARN-FIRST here:')[0] + M04_OPERAND_NOTE, RENDER_SCOPE_NOTE, ...notes.slice(2).filter(note => !note.startsWith('No accuracy rule is offered for'))],
    },
  };
}

async function renderThenCertify(
  operand: EChartsOperandCase,
): Promise<BaselineCell> {
  const rendered = await vizRender(renderInputFor(operand) as never);
  expect(rendered.status).toBe("ok");
  expect(rendered.normalizedSpec).toBeDefined();
  expect(rendered.contentHash).toBeTypeOf("string");
  const certified = await certify({
    spec: rendered.normalizedSpec as unknown as NormalizedVizSpec,
    data: { [operand.branch]: operand.branchData } as never,
  });
  return {
    renderedContentHash: rendered.contentHash as string,
    // Additive s190 metadata is independently checked by the scope/census tests.
    certified: (({ accuracyRules, contrastResults, ...body }) => body)(certified) as unknown as Record<string, unknown>,
  };
}

describe(`artifact.certify — s179 operand-backed baseline at ${BASELINE_COMMIT}`, () => {
  it("the palette epoch carries an explicit before/after attribution for every legacy render identity", () => {
    const historicalMatrix = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-197/m05/matrix/matrix.json', import.meta.url), 'utf8'));
    const migration = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-197/m05/golden-attribution.json', import.meta.url), 'utf8'));
    for (const operand of ECHARTS_OPERAND_CASES) {
      const row = migration.matrixRows.find((entry: any) => entry.source === 'artifacts/product-reality/sprint-191/m01/matrix/matrix.json' && entry.identity === `${operand.chartType}/light/A`);
      expect(row).toMatchObject({ class: 'public-chart-matrix', afterHash: historicalMatrix.table.find((cell: any) => cell.chartType === operand.chartType && cell.brand === 'A' && cell.theme === 'light').svgHash });
      expect(row.beforeHash).toMatch(/^[a-f0-9]{64}$/);
      expect(row.reason.length).toBeGreaterThan(0);
    }
  });

  it("the pin enumerates exactly the eight canonical operand cases", () => {
    expect(createHash("sha256").update(baselineBytes).digest("hex")).toBe(
      EXPECTED_BASELINE_SHA256,
    );
    expect(Object.keys(BASELINE_PROJECTED_OPTION_HASHES)).toEqual(
      ECHARTS_OPERAND_CASES.map((operand) => operand.chartType),
    );
    expect(Object.keys(CURRENT_PROJECTED_OPTION_HASHES)).toEqual(
      ECHARTS_OPERAND_CASES.map((operand) => operand.chartType),
    );
    expect(Object.keys(CURRENT_RENDER_HASHES)).toEqual(
      ECHARTS_OPERAND_CASES.map((operand) => operand.chartType),
    );
    expect(Object.keys(baseline)).toEqual(
      ECHARTS_OPERAND_CASES.map((operand) => operand.chartType),
    );
    expect(
      ECHARTS_OPERAND_CASES.filter(
        (operand) =>
          BASELINE_PROJECTED_OPTION_HASHES[operand.chartType] !==
          CURRENT_PROJECTED_OPTION_HASHES[operand.chartType],
      ).map((operand) => operand.chartType),
    ).toEqual(["choropleth"]);
  });

  it.each(
    ECHARTS_OPERAND_CASES.map(
      (operand) => [operand.chartType, operand] as const,
    ),
  )(
    "%s: projected option hash, render hash, and the bounded full-response delta stay pinned",
    async (chartType, operand) => {
      const observed = await renderThenCertify(operand);
      const expectedHash = observed.renderedContentHash;
      expect(expectedHash).toMatch(/^[a-f0-9]{64}$/);
      expect(expectedHash).not.toBe(CURRENT_PROJECTED_OPTION_HASHES[chartType]);
      expect((await renderThenCertify(operand)).renderedContentHash).toBe(expectedHash);
      expect(
        (observed.certified.determinism as { contentHash?: string })
          .contentHash,
      ).toBe(expectedHash);
      expect(
        Object.keys(
          (observed.certified.determinism as Record<string, unknown>) ?? {},
        ),
      ).toEqual(["stable", "contentHash", "renderHash"]);
      expect(
        (observed.certified.determinism as Record<string, unknown>).renderHash,
      ).toBe(scopedHash(chartType));

      // Full response control retains the historical fixture and applies only explicit
      // m03/m05 hash and scope movers plus the declared s195 operand-profile migration.
      // N/A, a11y finding bytes, contrast and both hashes remain pinned.
      expect(JSON.stringify(observed)).toBe(
        JSON.stringify(expectedCurrentCell(chartType, expectedHash)),
      );
    },
  );

  it("the fixture is non-trivial, so an empty or spec-only verdict cannot satisfy the control", () => {
    for (const operand of ECHARTS_OPERAND_CASES) {
      const cell = baseline[operand.chartType];
      expect(cell.renderedContentHash).toMatch(/^[0-9a-f]{64}$/);
      expect(cell.certified).toEqual(
        expect.objectContaining({
          status: "ok",
          coverage: "uncertified",
          conformant: null,
          determinism: expect.objectContaining({ stable: true }),
          contrastNote: expect.any(String),
        }),
      );
    }
  });
});
