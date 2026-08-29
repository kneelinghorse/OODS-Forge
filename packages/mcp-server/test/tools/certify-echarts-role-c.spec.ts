import { describe, expect, it } from "vitest";
import { renderEChartsToSvg } from "@oods/viz-render";
import { extractEChartsRoleCPaints } from "../../src/tools/certify-echarts-role-c.js";
import { handle as vizRender } from "../../src/tools/viz.render.js";
import {
  ECHARTS_OPERAND_CASES,
  HIERARCHY_BRANCH,
  renderInputFor,
  type EChartsOperandCase,
} from "./s172-echarts-operands.js";

interface RenderCarrier {
  readonly option: Record<string, unknown>;
  readonly svg: string;
}

const EXPECTED_ROLE_C: Readonly<
  Record<
    string,
    {
      readonly paints: readonly string[];
      readonly chartElements: number;
      readonly unresolved: number;
    }
  >
> = {
  treemap: {
    paints: ["#416CD9", "#3E44BE", "#279669"],
    chartElements: 8,
    unresolved: 0,
  },
  sunburst: {
    paints: ["#416CD9", "#3E44BE", "#279669"],
    chartElements: 4,
    unresolved: 0,
  },
  sankey: {
    paints: ["#416CD9", "#3E44BE", "#279669"],
    chartElements: 5,
    unresolved: 2,
  },
  chord: {
    paints: ["#416CD9", "#3E44BE", "#279669"],
    chartElements: 6,
    unresolved: 0,
  },
  force_graph: {
    paints: ["#416CD9", "#3E44BE"],
    chartElements: 5,
    unresolved: 0,
  },
  choropleth: {
    paints: ["#003777", "#DFEDFC"],
    chartElements: 2,
    unresolved: 0,
  },
  bubble_map: {
    paints: ["#003777", "#DFEDFC"],
    chartElements: 2,
    unresolved: 0,
  },
  flow_map: {
    paints: ["#16558C"],
    chartElements: 2,
    unresolved: 0,
  },
};

const DEEP_SUNBURST: EChartsOperandCase = {
  ...ECHARTS_OPERAND_CASES.find(({ chartType }) => chartType === "sunburst")!,
  branchData: {
    ...HIERARCHY_BRANCH,
    data: {
      ...HIERARCHY_BRANCH.data,
      children: HIERARCHY_BRANCH.data.children.map((child) => ({
        ...child,
        children: [
          { name: `${child.name} detail 1`, value: child.value / 2 },
          { name: `${child.name} detail 2`, value: child.value / 2 },
        ],
      })),
    },
  },
};

async function servedCarrier(
  operand: EChartsOperandCase,
): Promise<RenderCarrier> {
  const rendered = await vizRender(renderInputFor(operand) as never);
  expect(rendered.status).toBe("ok");
  const option = rendered.echartsSpec as unknown as Record<string, unknown>;
  expect(option).toBeDefined();
  return { option, svg: await renderEChartsToSvg(option) };
}

describe.sequential("ECharts Role-C structural paint extraction", () => {
  it.each(ECHARTS_OPERAND_CASES)(
    "$chartType: extracts only visible chart carriers from the exact served option",
    async (operand) => {
      const { option, svg } = await servedCarrier(operand);
      const expected = EXPECTED_ROLE_C[operand.chartType];

      expect(extractEChartsRoleCPaints(svg, option)).toEqual({
        status: "ok",
        roleCPaints: expected.paints,
        chartElementCount: expected.chartElements,
        unresolvedPaintCount: expected.unresolved,
      });
    },
    30_000,
  );

  it("keeps the generated sunburst descendant tint in Role C", async () => {
    const { option, svg } = await servedCarrier(DEEP_SUNBURST);
    const extracted = extractEChartsRoleCPaints(svg, option);

    expect(extracted.status).toBe("ok");
    expect(extracted.roleCPaints).toEqual([
      "#416CD9",
      "#809DE5",
      "#3E44BE",
      "#279669",
    ]);
  });

  it("does not collapse node and edge carriers that reuse ecmeta_data_index", () => {
    const svg =
      "<svg>" +
      '<path ecmeta_ssr_type="chart" ecmeta_data_index="0" fill="none" stroke="#416cd9"></path>' +
      '<path ecmeta_ssr_type="chart" ecmeta_data_index="0" fill="rgb(62, 68, 190)"></path>' +
      "</svg>";

    expect(extractEChartsRoleCPaints(svg, {})).toMatchObject({
      status: "ok",
      roleCPaints: ["#416CD9", "#3E44BE"],
      chartElementCount: 2,
    });
  });

  it("uses structural metadata, not authored text or legend metadata, and canonicalizes colors", () => {
    const svg =
      "<svg>" +
      '<!-- <path ecmeta_ssr_type="chart" fill="#ff00ff"></path> -->' +
      '<text>&lt;path ecmeta_ssr_type="chart" fill="#00ffff"&gt;</text>' +
      '<path ecmeta_ssr_type="legend" fill="#ffff00"></path>' +
      '<path ecmeta_ssr_type="chart" fill="#abc" stroke="RGB(1, 2, 3)"></path>' +
      "</svg>";

    expect(extractEChartsRoleCPaints(svg, {})).toEqual({
      status: "ok",
      roleCPaints: ["#AABBCC", "#010203"],
      chartElementCount: 1,
      unresolvedPaintCount: 0,
    });
  });

  it("explicitly removes option-known canvas, area, and border chrome", () => {
    const option = {
      backgroundColor: "#fcfcfd",
      geo: {
        itemStyle: { areaColor: "#f2f2f2", borderColor: "rgb(233, 236, 239)" },
      },
      series: [{ itemStyle: { borderColor: "#d5dae4" } }],
    };
    const svg =
      "<svg>" +
      '<path ecmeta_ssr_type="chart" fill="#FCFCFD"></path>' +
      '<path ecmeta_ssr_type="chart" fill="#f2f2f2" stroke="rgb(233,236,239)"></path>' +
      '<path ecmeta_ssr_type="chart" fill="#D5DAE4"></path>' +
      '<path ecmeta_ssr_type="chart" fill="rgb(65,108,217)"></path>' +
      "</svg>";

    expect(extractEChartsRoleCPaints(svg, option)).toMatchObject({
      status: "ok",
      roleCPaints: ["#416CD9"],
    });
  });

  it("keeps a solid carrier beside an unresolved pattern and reports the ignored pattern", () => {
    const svg =
      '<svg><path ecmeta_ssr_type="chart" fill="url(#pattern)" stroke="#416cd9"></path></svg>';

    expect(extractEChartsRoleCPaints(svg, {})).toEqual({
      status: "ok",
      roleCPaints: ["#416CD9"],
      chartElementCount: 1,
      unresolvedPaintCount: 1,
    });
  });

  it("uses opacity only as a visibility gate and does not claim alpha compositing", () => {
    const svg =
      "<svg>" +
      '<path ecmeta_ssr_type="chart" fill="#416cd9" fill-opacity="0.5"></path>' +
      '<path ecmeta_ssr_type="chart" fill="#ff00ff" fill-opacity="0"></path>' +
      '<path ecmeta_ssr_type="chart" fill="none" stroke="#00ffff" stroke-opacity="0"></path>' +
      '<path ecmeta_ssr_type="chart" fill="#ffff00" display="none"></path>' +
      "</svg>";

    expect(extractEChartsRoleCPaints(svg, {})).toEqual({
      status: "ok",
      roleCPaints: ["#416CD9"],
      chartElementCount: 4,
      unresolvedPaintCount: 0,
    });
  });

  it("reports pattern-only and invalid/transparent-only carriers as ungradeable", () => {
    expect(
      extractEChartsRoleCPaints(
        '<svg><path ecmeta_ssr_type="chart" fill="url(#pattern)" stroke="none"></path></svg>',
        {},
      ),
    ).toEqual({
      status: "ungradeable",
      roleCPaints: [],
      chartElementCount: 1,
      unresolvedPaintCount: 1,
      reason: "NO_SOLID_CARRIER_PAINTS",
    });

    expect(
      extractEChartsRoleCPaints(
        "<svg>" +
          '<path ecmeta_ssr_type="chart" fill="transparent"></path>' +
          '<path ecmeta_ssr_type="chart" fill="banana" stroke="#ffffff" stroke-width="0"></path>' +
          "</svg>",
        {},
      ),
    ).toEqual({
      status: "ungradeable",
      roleCPaints: [],
      chartElementCount: 2,
      unresolvedPaintCount: 0,
      reason: "NO_SOLID_CARRIER_PAINTS",
    });
  });

  it("reports missing or malformed chart metadata as ungradeable", () => {
    expect(
      extractEChartsRoleCPaints('<svg><path fill="#416cd9"></path></svg>', {}),
    ).toEqual({
      status: "ungradeable",
      roleCPaints: [],
      chartElementCount: 0,
      unresolvedPaintCount: 0,
      reason: "NO_CHART_ELEMENTS",
    });

    expect(
      extractEChartsRoleCPaints(
        '<svg><path ecmeta_ssr_type="chart" fill="#416cd9></path></svg>',
        {},
      ),
    ).toEqual({
      status: "ungradeable",
      roleCPaints: [],
      chartElementCount: 0,
      unresolvedPaintCount: 0,
      reason: "MALFORMED_SVG",
    });
  });
});
