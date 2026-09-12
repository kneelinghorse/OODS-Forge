import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { renderEChartsToSvg } from "../../packages/viz-render/dist/index.js";
import {
  ECHARTS_OPERAND_CASES,
  type EChartsOperandCase,
} from "../../packages/viz-core/test/fixtures/s172-echarts-operands.js";
import { buildProjectedOption } from "../../packages/viz-core/test/s179-echarts-render-harness.js";

const root = resolve(process.env.OODS_VIZ_CENSUS_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "../.."));

const MATRIX_FAMILIES = [
  "treemap",
  "sunburst",
  "sankey",
  "chord",
  "force_graph",
  "choropleth",
  "bubble_map",
  "flow_map",
] as const;

type MatrixFamily = (typeof MATRIX_FAMILIES)[number];

const TEXT_CARRIERS = {
  ascii: "ASCII label",
  cjk: "漢字標籤",
  combining: "Cafe\u0301 combining",
  emoji: "Emoji 🧭📊",
  long: "A deliberately long label that must be truncated by the fixed snapshot policy",
} as const;

const sha256 = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

function canonicalOperand(family: MatrixFamily): EChartsOperandCase {
  const operand = ECHARTS_OPERAND_CASES.find(
    ({ chartType }) => chartType === family,
  );
  if (!operand) {
    throw new Error(`Missing canonical ${family} operand.`);
  }
  return operand;
}

function matrixOption(family: MatrixFamily): Record<string, unknown> {
  const option = buildProjectedOption(canonicalOperand(family));
  option.title = [
    { text: TEXT_CARRIERS.ascii, left: 8, top: 4 },
    { text: TEXT_CARRIERS.cjk, left: 110, top: 4 },
    { text: TEXT_CARRIERS.combining, left: 190, top: 4 },
    { text: TEXT_CARRIERS.emoji, left: 330, top: 4 },
    {
      text: TEXT_CARRIERS.long,
      left: 430,
      top: 4,
      textStyle: {
        width: 120,
        overflow: "truncate",
        ellipsis: "…",
      },
    },
  ];

  if (family === "sunburst") {
    const series = (option.series as Array<Record<string, unknown>>)[0];
    series.itemStyle = {
      ...(series.itemStyle as Record<string, unknown> | undefined),
      color: {
        type: "linear",
        x: 0,
        y: 0,
        x2: 1,
        y2: 1,
        colorStops: [
          { offset: 0, color: "#416CD9" },
          { offset: 1, color: "#D94F70" },
        ],
      },
      shadowBlur: 7,
      shadowColor: "rgba(17,24,39,0.6)",
      decal: {
        symbol: "rect",
        symbolSize: 0.7,
        dashArrayX: [4, 2],
        dashArrayY: [3, 2],
        color: "rgba(255,255,255,0.35)",
      },
    };
  }

  return option;
}


function epochPayload(matrix: any): string {
  return [
    `echarts=${matrix.resolvedDependencies.echarts}`,
    `zrender=${matrix.resolvedDependencies.zrender}`,
    `rendererNormalizerContractVersion=${matrix.rendererNormalizerContractVersion}`,
    `tokenVersion=${matrix.tokenVersion.package}@${matrix.tokenVersion.version}`,
    `dimensions=${matrix.dimensions.width}x${matrix.dimensions.height}`,
    `snapshot.renderer=${matrix.snapshotPolicy.renderer}`,
    `snapshot.ssr=${String(matrix.snapshotPolicy.ssr)}`,
    `snapshot.useViewBox=${String(matrix.snapshotPolicy.useViewBox)}`,
    `snapshot.rootAnimation=${String(matrix.snapshotPolicy.rootAnimation)}`,
    `snapshot.forceLayoutAnimation=${String(matrix.snapshotPolicy.forceLayoutAnimation)}`,
    `snapshot.forceSeedVersion=${matrix.snapshotPolicy.forceSeedVersion}`,
    ...Object.entries(matrix.normalizedSvgHashes)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([family, hash]) => `normalizedSvg.${family}=${hash}`),
  ].join("\n");
}

const matrixPath = resolve(root, 'packages/viz-render/certified-matrix.json');
const matrix = JSON.parse(readFileSync(matrixPath, 'utf8'));
const changes = [];
for (const family of MATRIX_FAMILIES) {
 const option = matrixOption(family), first = await renderEChartsToSvg(option), second = await renderEChartsToSvg(option);
 assert.equal(first, second);
 const next = sha256(first), previous = matrix.normalizedSvgHashes[family];
 if (previous !== next) changes.push({ family, before: previous, after: next, reason: 's195-m05 measured Role-A categorical palette revision; normalized-SVG contract and inputs unchanged' });
 matrix.normalizedSvgHashes[family] = next;
}
matrix.renderHashEpoch = 'sha256:' + sha256(epochPayload(matrix));
if (process.argv.includes('--check')) {
 assert.equal(changes.length, 0, 'Measured certified SVG hashes differ from the qualified matrix');
} else {
writeFileSync(matrixPath, JSON.stringify(matrix,null,2)+'\n');
writeFileSync(resolve(root, 'artifacts/product-reality/sprint-195/m05/golden-migration/certified-matrix-attribution.json'), JSON.stringify({changes,renderHashEpoch:matrix.renderHashEpoch},null,2)+'\n');
}
console.log(JSON.stringify({families:8,changes,check:process.argv.includes('--check')}));
