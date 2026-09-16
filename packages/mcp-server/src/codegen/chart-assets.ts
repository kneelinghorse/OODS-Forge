import type { CodegenOptions } from './types.js';
import { chartMatchesPreview, chartNodes } from './chart-declaration.js';
import { handle as render } from '../tools/viz.render.js';
import { assertStaticSvg } from '@oods/component-contracts';
import { canonicalize } from '@oods/artifacts';
import type { UiElement, UiSchema, VizRenderInput } from '../schemas/generated.js';
import { workflowSampleRecords } from './workflow-data-emitter.js';

/** Placed charts render at twice the former 360×200 so the detail card shows them at design size; the preview never scales an SVG above this width. */
export const PLACED_CHART_SIZE = { width: 720, height: 400 } as const;
/** The same chart at the narrow size the figure switches to below PLACED_CHART_NARROW_BREAKPOINT px, so axis text keeps its size on a phone column instead of scaling with the SVG. */
export const PLACED_CHART_NARROW_SIZE = { width: 360, height: 220 } as const;
/** Figure inline size (CSS px) at and below which the figure shows the narrow render (component-styles' container query). */
export const PLACED_CHART_NARROW_BREAKPOINT = 600;
/** Every placed chart renders without a painted title: the figure heading carries the chart's name (Sprint 202 m01). */
export const PLACED_CHART_OUTPUT = { svg: true, titlePlacement: 'figure', ...PLACED_CHART_SIZE } as const;
export const PLACED_CHART_NARROW_OUTPUT = { svg: true, titlePlacement: 'figure', ...PLACED_CHART_NARROW_SIZE } as const;

export interface PlacedChartRequest {
  index: number;
  path: string;
  recordId: string;
  source: string;
  request: VizRenderInput;
  /** The same request at the narrow size, rendered to `<path>.narrow.svg` and shown by the figure below the breakpoint. */
  narrow: { path: string; request: VizRenderInput };
}
export const narrowChartPath = (path: string): string => path.replace(/\.svg$/, '.narrow.svg');

/**
 * The viz.render requests behind every placed chart of a schema, one per sample record, with the
 * artifact path each renders to. Generation renders them; measurement re-renders the same request
 * with the normalized spec and certifies it, so what is certified is what was placed.
 */
export function placedChartRequests(input: UiSchema, options: Pick<CodegenOptions, 'theme' | 'brand'> = {}): PlacedChartRequest[] {
  if (!chartNodes(input.screens).length) return [];
  const schema = input;
  const nodes = chartNodes(schema.screens);
  for (const candidate of nodes) {
    if (!chartMatchesPreview(candidate)) throw new Error(`Chart type '${candidate.chart!.chartType}' does not match preview '${candidate.component}'.`);
  }
  const node = nodes[0]!;
  const chart = node.chart!;
  if (nodes.some(candidate => canonicalize(candidate.chart) !== canonicalize(chart)
    || candidate.props?.title !== node.props?.title || candidate.props?.description !== node.props?.description)) {
    throw new Error('Only one distinct chart declaration and presentation is supported per generated object.');
  }
  if (chart.source === 'payment-events') {
    for (const field of [...chart.dateFields, chart.amountField, chart.currencyField]) {
      if (!schema.objectSchema?.[field]) throw new Error(`Payment chart field '${field}' is absent from objectSchema.`);
    }
  } else {
    const field = schema.objectSchema?.[chart.dataField];
    if (!field) throw new Error(`Chart field '${chart.dataField}' is absent from objectSchema.`);
    if (field.type !== 'array' && !field.type.endsWith('[]')) throw new Error(`Chart field '${chart.dataField}' must be a declared array.`);
  }
  const theme = options.theme ?? schema.theme ?? 'light';
  if (theme !== 'light' && theme !== 'dark' && theme !== 'hc') throw new Error(`Payment chart theme '${theme}' is not supported.`);
  const records = workflowSampleRecords(schema);
  const requests: PlacedChartRequest[] = [];
  for (const [index, record] of records.entries()) {
    let request: VizRenderInput;
    if (chart.source === 'payment-events') {
      const history = record.payment_history as Array<{ at: string; amount: number }>;
      const rows = history.map(payment => ({ date: payment.at, amount: payment.amount / chart.minorUnits }))
        .sort((a, b) => a.date.localeCompare(b.date));
      if (rows.length < 4 || rows.some(row => !Number.isFinite(row.amount) || !Number.isFinite(Date.parse(row.date)))) {
        throw new Error('Payment chart requires a finite amount and valid payment dates.');
      }
      request = {
        chartType: chart.chartType,
        name: String(node.props?.title ?? 'Payment amounts'),
        description: `Recorded sample payments in ${String(record[chart.currencyField]).toUpperCase()}, shown in major currency units.`,
        theme,
        brand: options.brand ?? chart.brand ?? 'A',
        rows: [rows[0]!, ...rows.slice(1)],
        encodings: { x: { field: 'date', scale: 'temporal' }, y: { field: 'amount', aggregate: 'sum' } },
        output: { ...PLACED_CHART_OUTPUT },
      };
    } else if (chart.source === 'edge-array') {
      request = {
        chartType: 'force_graph', network: edgeArrayToNetwork(record[chart.dataField], chart.edges),
        name: String(node.props?.title ?? 'Connected relationships'),
        ...(typeof node.props?.description === 'string' ? { description: node.props.description } : {}),
        theme, brand: options.brand ?? chart.brand ?? 'A', output: { ...PLACED_CHART_OUTPUT },
      };
    } else {
      const rows = record[chart.dataField];
      if (!Array.isArray(rows) || !rows.length || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
        throw new Error(`Chart field '${chart.dataField}' requires non-empty object rows.`);
      }
      for (const binding of Object.values(chart.encodings)) {
        const field = typeof binding === 'string' ? binding : binding.field;
        if (rows.some(row => !Object.hasOwn(row, field))) throw new Error(`Chart encoding field '${field}' is missing from '${chart.dataField}' rows.`);
      }
      request = {
        chartType: chart.chartType,
        name: String(node.props?.title ?? `${chart.chartType} chart`),
        ...(typeof node.props?.description === 'string' ? { description: node.props.description } : {}),
        theme,
        brand: options.brand ?? chart.brand ?? 'A',
        rows: [rows[0]!, ...rows.slice(1)],
        encodings: chart.encodings,
        output: { ...PLACED_CHART_OUTPUT },
      };
    }
    const id = schema.workflow ? String(record[schema.workflow.data.idField]) : 'seed';
    const path = `src/charts/${chart.source === 'payment-events' ? 'payment' : chart.chartType}-${String(index + 1).padStart(3, '0')}.svg`;
    requests.push({ index, recordId: id, source: chart.source, path, request, narrow: { path: narrowChartPath(path), request: { ...request, output: { ...PLACED_CHART_NARROW_OUTPUT } } } });
  }
  return requests;
}

/**
 * Render once at generation time; emitted consumers need no chart runtime. Every placed chart is rendered
 * twice: at the design size and at the narrow size, both without a painted title (the figure heading names
 * the chart), so the figure shows legible axis text at every column width without scaling either SVG down.
 */
export async function prepareChartAssets(input: UiSchema, options: Pick<CodegenOptions, 'theme' | 'brand'> = {}): Promise<{
  schema: UiSchema;
  files: Array<{ path: string; contents: string }>;
}> {
  const requests = placedChartRequests(input, options);
  if (!requests.length) return { schema: input, files: [] };
  const schema = structuredClone(input);
  const nodes = chartNodes(schema.screens);
  const chart = nodes[0]!.chart!;
  const files: Array<{ path: string; contents: string }> = [];
  const byRecord: Record<string, string> = {};
  const narrowByRecord: Record<string, string> = {};
  const renderStatic = async (request: VizRenderInput): Promise<string> => {
    const result = await render(request);
    if (result.status !== 'ok' || !result.svg) throw new Error(`${chart.source === 'payment-events' ? 'Payment chart' : 'Chart'} render failed: ${JSON.stringify(result.errors)}`);
    return assertStaticSvg(result.svg);
  };
  for (const { index, recordId, path, request, narrow } of requests) {
    const svg = await renderStatic(request);
    const svgNarrow = await renderStatic(narrow.request);
    if (index === 0) for (const candidate of nodes) candidate.props = { ...candidate.props, svg, svgNarrow, ...PLACED_CHART_SIZE };
    byRecord[recordId] = svg;
    narrowByRecord[recordId] = svgNarrow;
    files.push({ path, contents: svg }, { path: narrow.path, contents: svgNarrow });
  }
  if (schema.workflow) {
    files.push({ path: 'src/chart-assets.ts', contents: `// Static public viz.render output, keyed by the seed record identity: the design-size render and the narrow render the figure shows below ${PLACED_CHART_NARROW_BREAKPOINT}px.\nexport const chartSvgByRecord: Readonly<Record<string, string>> = ${JSON.stringify(byRecord, null, 2)};\nexport const chartSvgNarrowByRecord: Readonly<Record<string, string>> = ${JSON.stringify(narrowByRecord, null, 2)};\n` });
  }
  return { schema, files };
}

/** Preserve authored direction/order; symmetric and repeated pairs share one link. */
export function edgeArrayToNetwork(rows: unknown, edges: Extract<NonNullable<UiElement['chart']>, { source: 'edge-array' }>['edges']): NonNullable<VizRenderInput['network']> {
  if (!Array.isArray(rows) || !rows.length) throw new Error('Graph requires non-empty edge-array rows.');
  const ids = new Set<string>();
  const seen = new Set<string>();
  const links: Array<{ source: string; target: string }> = [];
  const append = (source: string, target: string) => {
    const key = JSON.stringify([source, target]);
    if (!seen.has(key)) { seen.add(key); links.push({ source, target }); }
  };
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Graph requires object edge rows.');
    for (const field of [edges.source, edges.target]) {
      if (!Object.hasOwn(row, field) || typeof row[field] !== 'string' || !row[field].trim()) throw new Error(`Graph edge field '${field}' requires a non-empty string id.`);
    }
    if (edges.bidirectionalField && (!Object.hasOwn(row, edges.bidirectionalField) || typeof row[edges.bidirectionalField] !== 'boolean')) throw new Error(`Graph edge field '${edges.bidirectionalField}' requires a boolean.`);
    const source = row[edges.source], target = row[edges.target];
    ids.add(source); ids.add(target); append(source, target);
    if (edges.bidirectionalField && row[edges.bidirectionalField]) append(target, source);
  }
  const nodes = [...ids].sort().map(id => ({ id }));
  return { nodes: [nodes[0]!, ...nodes.slice(1)], links };
}
