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
  treemap: "b61714c82926e331f9eae00a17babaa8e2b54241994ffb2d192c355843242f5d",
  sunburst: "20789b8d568b656c4e6b5c870277f2569f12bfd0beda586f8549ba0d04169c9f",
  sankey: "c5e34d1e0fca1ab3d4711a8a5e6ca56e6f1df3033a80e09c6590ddcea89aca9a",
  chord: "68ee777050c31706845a197166cac058484dcf16e102bbf6c2009d19316ed662",
  choropleth:
    "756b369388670679f3346dbd62c74f42c0780ee6f01ed06975e68139e48f671c",
  bubble_map:
    "68b19232a5c6f32770760065f21f706e94c3f609e211d0b04b454dcb4db0a75a",
  flow_map: "58871d84288bc6d88add326b9793be9f5767b3675dcb675c7196e1941bbc202d",
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
