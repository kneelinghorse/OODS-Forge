import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { ECHARTS_OPERAND_CASES } from "./fixtures/s172-echarts-operands.js";
import {
  SSR_HEIGHT,
  SSR_WIDTH,
  STABLE_CHART_TYPES,
  buildProjectionProofOptions,
  buildProjectedOption,
  captureSequentialRenders,
  chartDataElements,
  renderProjectedOption,
  svgAttribute,
  type CanonicalChartType,
  type SequentialRenderCapture,
} from "./s179-echarts-render-harness.js";

type StableChartType = (typeof STABLE_CHART_TYPES)[number];

const EXPECTED_NORMALIZED_HASHES: Readonly<Record<StableChartType, string>> = {
  treemap: "bfa0ee12dc03bfc2b373db650cfbaeba8febf36f5e45974cbcc8f579ffc39694",
  sunburst: "9904c873c359129e58db2dcb745900f871ed0ac7a8bf12788682c2d539d0835a",
  sankey: "ea82ad48dcb7b533020a7f736508f52f165169e3252f8ec82ada9b8fb1f9803d",
  chord: "86db1949d8c7f39033d1da48a126609dd1c86cee7db8d749392726e514884594",
  choropleth:
    "f10cbd6bcacaf64d7562b90ad6ad0619edd9a09a7fcf3674401d8b76feebc55f",
  bubble_map:
    "481fc41a1264b63d4596db1787c6380af7ad5536f78af36eed54db33bfa4f55c",
  flow_map: "bab223b6a50ee581338bead62b54bd292be08a594b02ccca2c3b2ab1793b5e68",
};

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, "..", "..", "..");
const harnessUrl = new URL("./s179-echarts-render-harness.ts", import.meta.url)
  .href;
const FRESH_PROCESS_TIMEOUT_MS = 180_000;

interface SubprocessCapture {
  readonly pid: number;
  readonly hashes: Record<StableChartType, string>;
}

function packageVersion(packageJsonPath: string): string {
  return (
    JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version: string }
  ).version;
}

function captureInFreshProcess(): Promise<SubprocessCapture> {
  const marker = "__S179_CAPTURE__";
  const source = [
    `import { captureStableNormalizedHashes } from ${JSON.stringify(harnessUrl)};`,
    `const result = ${JSON.stringify(marker)} + JSON.stringify({ pid: process.pid, hashes: captureStableNormalizedHashes() });`,
    `process.stdout.write(result, () => process.exit(0));`,
  ].join("\n");

  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      ["--import", "tsx", "--input-type=module", "--eval", source],
      {
        cwd: repoRoot,
        env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
        encoding: "utf8",
        killSignal: "SIGTERM",
        maxBuffer: 1_048_576,
        timeout: FRESH_PROCESS_TIMEOUT_MS,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `Fresh ECharts capture failed (${error.message}). stderr:\n${stderr}`,
              { cause: error },
            ),
          );
          return;
        }
        const markerIndex = stdout.lastIndexOf(marker);
        if (markerIndex < 0) {
          reject(
            new Error(
              `Fresh ECharts capture omitted its result marker. stdout:\n${stdout}`,
            ),
          );
          return;
        }
        resolve(
          JSON.parse(
            stdout.slice(markerIndex + marker.length),
          ) as SubprocessCapture,
        );
      },
    );
  });
}

describe("s179 m01 — ECharts 6 SSR normalization baseline", () => {
  let sequential: Record<CanonicalChartType, SequentialRenderCapture>;

  beforeAll(() => {
    sequential = captureSequentialRenders();
  }, 90_000);

  it("pins the exact ECharts/ZRender renderer pair and 600x400 viewport", () => {
    const require = createRequire(import.meta.url);
    const echartsPackagePath = require.resolve("echarts/package.json");
    const zrenderPackagePath = createRequire(echartsPackagePath).resolve(
      "zrender/package.json",
    );

    expect(packageVersion(echartsPackagePath)).toBe("6.0.0");
    expect(packageVersion(zrenderPackagePath)).toBe("6.0.0");
    expect({ width: SSR_WIDTH, height: SSR_HEIGHT }).toEqual({
      width: 600,
      height: 400,
    });
  });

  it("removes allocator noise for seven families but preserves force-layout entropy", () => {
    const rawInequality: Record<string, boolean> = {};
    const stableFirstHashes: Partial<Record<StableChartType, string>> = {};

    for (const operand of ECHARTS_OPERAND_CASES) {
      const chartType = operand.chartType as CanonicalChartType;
      const capture = sequential[chartType];
      rawInequality[chartType] = capture.first.rawSvg !== capture.second.rawSvg;
    }
    expect(rawInequality).toEqual({
      treemap: true,
      sunburst: true,
      sankey: true,
      chord: true,
      force_graph: true,
      choropleth: true,
      bubble_map: true,
      flow_map: true,
    });

    for (const chartType of STABLE_CHART_TYPES) {
      const capture = sequential[chartType];
      // These seven renders differ only in ZRender allocator tokens, so the
      // baseline remap must recover byte identity without touching geometry.
      expect(capture.first.normalizedSvg).toBe(capture.second.normalizedSvg);
      expect(capture.second.normalizedHash).toBe(
        EXPECTED_NORMALIZED_HASHES[chartType],
      );
      stableFirstHashes[chartType] = capture.first.normalizedHash;
    }
    expect(stableFirstHashes).toEqual(EXPECTED_NORMALIZED_HASHES);

    // Force layout consumes runtime randomness; treating it as allocator noise
    // would hide a substantive geometry difference.
    expect(sequential.force_graph.first.normalizedSvg).not.toBe(
      sequential.force_graph.second.normalizedSvg,
    );
    expect(sequential.force_graph.first.normalizedHash).not.toBe(
      sequential.force_graph.second.normalizedHash,
    );
  });

  it(
    "reproduces every stable hash in two actual fresh Node processes",
    async () => {
      // Run the independent captures serially so a saturated full-suite worker
      // pool cannot make two renderer processes compete for the same CPU budget.
      const first = await captureInFreshProcess();
      const second = await captureInFreshProcess();

      expect(first.pid).not.toBe(process.pid);
      expect(second.pid).not.toBe(process.pid);
      expect(first.pid).not.toBe(second.pid);
      expect(first.hashes).toEqual(EXPECTED_NORMALIZED_HASHES);
      expect(second.hashes).toEqual(EXPECTED_NORMALIZED_HASHES);
    },
    FRESH_PROCESS_TIMEOUT_MS * 2 + 30_000,
  );

  it("renders the projected joined choropleth through geo.nameProperty with ramp paints and row indexes", () => {
    const operand = ECHARTS_OPERAND_CASES.find(
      (candidate) => candidate.chartType === "choropleth",
    );
    if (!operand) {
      throw new Error("Missing canonical choropleth operand.");
    }
    const option = buildProjectedOption(operand);
    const geo = option.geo as Record<string, unknown>;
    const series = (option.series as Array<Record<string, unknown>>)[0];

    // The canonical features deliberately have `region`/`state_name` but no
    // default `name`. This assertion distinguishes the served, JSON-safe option
    // from a raw-adapter-only fix: the join property must survive projection.
    expect(geo.nameProperty).toBe("region");
    expect(Object.hasOwn(series, "nameProperty")).toBe(false);

    const chartElements = chartDataElements(renderProjectedOption(option));
    expect(chartElements).toHaveLength(2);
    expect(
      chartElements.map((element) => svgAttribute(element, "fill")),
    ).toEqual(["rgb(0,55,119)", "rgb(223,237,252)"]);
    expect(
      chartElements.map((element) =>
        svgAttribute(element, "ecmeta_data_index"),
      ),
    ).toEqual(["0", "1"]);
  });

  it("distinguishes raw-only paint changes from changes to the projected render operand", () => {
    const operand = ECHARTS_OPERAND_CASES.find(
      (candidate) => candidate.chartType === "choropleth",
    );
    if (!operand) {
      throw new Error("Missing canonical choropleth operand.");
    }

    const { rawOption, projectedOption } = buildProjectionProofOptions(operand);
    const renderedPaints = (option: Record<string, unknown>): string[] =>
      chartDataElements(renderProjectedOption(option)).map(
        (element) => svgAttribute(element, "fill") ?? "",
      );
    const mutateRamp = (option: Record<string, unknown>): void => {
      const visualMap = option.visualMap as {
        inRange?: { color?: string[] };
      };
      if (!visualMap.inRange) {
        throw new Error("Canonical choropleth is missing visualMap.inRange.");
      }
      visualMap.inRange.color = ["#ff0000", "#00ff00"];
    };

    const baselinePaints = renderedPaints(projectedOption);
    mutateRamp(rawOption as unknown as Record<string, unknown>);
    expect(renderedPaints(projectedOption)).toEqual(baselinePaints);

    mutateRamp(projectedOption);
    expect(renderedPaints(projectedOption)).toEqual([
      "rgb(0,255,0)",
      "rgb(255,0,0)",
    ]);
    expect(renderedPaints(projectedOption)).not.toEqual(baselinePaints);
  });
});
