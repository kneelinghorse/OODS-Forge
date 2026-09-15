import { placedChartRequests } from '../codegen/chart-assets.js';
import type { CodegenOptions } from '../codegen/types.js';
import type { UiSchema, VizRenderInput } from '../schemas/generated.js';
import { handle as certify } from '../tools/artifact.certify.js';
import { handle as render } from '../tools/viz.render.js';

/** What artifact.certify said about one placed chart, keyed by the artifact path it renders to. */
export interface PlacedChartCertification {
  path: string;
  chartType: string;
  source: string;
  name: string;
  theme: string;
  brand: string;
  contentHash: string;
  svgHash: string;
  certification: { status: string; coverage: string | null; conformant: boolean | null; pillars: unknown; findings: unknown[]; determinism: unknown; accuracySummary: unknown; notes: unknown[]; contrastNote: string | null };
  certifiedAt: string;
}

/**
 * Certify every placed chart of a schema: re-render each generation request with its normalized
 * spec and run artifact.certify on it with the same theme, brand and data operand. The result is
 * exactly what the two tools return for the same inputs; nothing is summarised away except bulk.
 */
export async function certifyPlacedCharts(schema: UiSchema, options: Pick<CodegenOptions, 'theme' | 'brand'> = {}): Promise<PlacedChartCertification[]> {
  const results: PlacedChartCertification[] = [];
  for (const placed of placedChartRequests(schema, options)) {
    const request: VizRenderInput = { ...placed.request, output: { ...placed.request.output, svg: true, includeNormalizedSpec: true } };
    const rendered = await render(request);
    if (rendered.status !== 'ok' || !rendered.normalizedSpec) throw new Error(`Placed chart render failed for ${placed.path}: ${JSON.stringify(rendered.errors)}`);
    const data = 'network' in placed.request && placed.request.network ? { network: placed.request.network } : undefined;
    const certified = await certify({ spec: rendered.normalizedSpec as never, theme: request.theme as never, brand: request.brand as never, ...(data ? { data: data as never } : {}) });
    results.push({
      path: placed.path, chartType: String(request.chartType), source: placed.source, name: String(request.name ?? ''), theme: String(request.theme), brand: String(request.brand),
      contentHash: String(rendered.contentHash ?? ''), svgHash: String(rendered.svgHash ?? ''),
      certification: { status: String(certified.status), coverage: (certified.coverage as string | undefined) ?? null, conformant: (certified.conformant as boolean | null | undefined) ?? null, pillars: certified.pillars ?? null, findings: (certified.findings as unknown[] | undefined) ?? [], determinism: certified.determinism ?? null, accuracySummary: certified.accuracySummary ?? null, notes: (certified.notes as unknown[] | undefined) ?? [], contrastNote: (certified.contrastNote as string | undefined) ?? null },
      certifiedAt: new Date().toISOString(),
    });
  }
  return results;
}
