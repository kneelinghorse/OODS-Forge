import type { CodegenOptions } from './types.js';
import { chartNodes } from './chart-declaration.js';
import { handle as render } from '../tools/viz.render.js';
import { assertStaticSvg } from '@oods/component-contracts';
import type { UiSchema } from '../schemas/generated.js';
import { workflowSampleRecords } from './workflow-data-emitter.js';

/** Render once at generation time; emitted consumers need no chart runtime. */
export async function prepareChartAssets(input: UiSchema, options: Pick<CodegenOptions, 'theme' | 'brand'> = {}): Promise<{
  schema: UiSchema;
  files: Array<{ path: string; contents: string }>;
}> {
  if (!chartNodes(input.screens).length) return { schema: input, files: [] };
  const schema = structuredClone(input);
  const nodes = chartNodes(schema.screens);
  if (nodes.length !== 1 || nodes[0]!.component !== 'VizAreaPreview') {
    throw new Error('A payment chart declaration requires exactly one VizAreaPreview.');
  }
  const node = nodes[0]!;
  const chart = node.chart!;
  for (const field of [...chart.dateFields, chart.amountField, chart.currencyField]) {
    if (!schema.objectSchema?.[field]) throw new Error(`Payment chart field '${field}' is absent from objectSchema.`);
  }
  const theme = options.theme ?? schema.theme ?? 'light';
  if (theme !== 'light' && theme !== 'dark') throw new Error(`Payment chart theme '${theme}' is not supported.`);
  const records = workflowSampleRecords(schema);
  const files: Array<{ path: string; contents: string }> = [];
  const byRecord: Record<string, string> = {};
  for (const [index, record] of records.entries()) {
    const history = record.payment_history as Array<{ at: string; amount: number }>;
    const rows = history.map(payment => ({ date: payment.at, amount: payment.amount / chart.minorUnits }))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (rows.length < 4 || rows.some(row => !Number.isFinite(row.amount) || !Number.isFinite(Date.parse(row.date)))) {
      throw new Error('Payment chart requires a finite amount and valid payment dates.');
    }
    const result = await render({
      chartType: chart.chartType,
      name: String(node.props?.title ?? 'Payment amounts'),
      description: `Recorded sample payments in ${String(record[chart.currencyField]).toUpperCase()}, shown in major currency units.`,
      theme,
      brand: options.brand ?? chart.brand ?? 'A',
      rows: [rows[0]!, ...rows.slice(1)],
      encodings: { x: { field: 'date', scale: 'temporal' }, y: { field: 'amount', aggregate: 'sum' } },
      output: { svg: true, width: 360, height: 200 },
    });
    if (result.status !== 'ok' || !result.svg) throw new Error(`Payment chart render failed: ${JSON.stringify(result.errors)}`);
    const svg = assertStaticSvg(result.svg);
    if (index === 0) node.props = { ...node.props, svg, width: 360, height: 200 };
    const id = schema.workflow ? String(record[schema.workflow.data.idField]) : 'seed';
    byRecord[id] = svg;
    files.push({ path: `src/charts/payment-${String(index + 1).padStart(3, '0')}.svg`, contents: svg });
  }
  if (schema.workflow) {
    files.push({ path: 'src/chart-assets.ts', contents: `// Static public viz.render output, keyed by the seed record identity.\nexport const chartSvgByRecord: Readonly<Record<string, string>> = ${JSON.stringify(byRecord, null, 2)};\n` });
  }
  return { schema, files };
}
