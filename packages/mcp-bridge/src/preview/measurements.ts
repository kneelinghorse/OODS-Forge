import { escapeHtml } from './page.js';
import type { CompositionVersion, PreviewBrand, PreviewFramework, PreviewTheme } from './store.js';

export const SCOPES = ['A/light', 'A/dark', 'A/hc', 'B/light', 'B/dark', 'B/hc'] as const;
export type Scope = typeof SCOPES[number];

/** What the running page posts back after axe-core ran for one framework, brand and theme. */
export interface AxeResult {
  engine: { name: string; version: string };
  ranAt: string;
  url: string;
  framework: PreviewFramework;
  brand: PreviewBrand;
  theme: PreviewTheme;
  violations: Array<{ id: string; impact: string | null; help: string; helpUrl: string; tags: string[]; nodes: number; targets: string[] }>;
  passes: number;
  incomplete: number;
  inapplicable: number;
}

type Validation = { profile?: string; checks?: Array<{ name?: string; status?: string } | string>; notChecked?: string[]; axes?: unknown };
type Chart = { path: string; chartType: string; name: string; theme: string; brand: string; certification: { status: string; coverage: string | null; conformant: boolean | null; pillars: Record<string, { status?: string } | string | boolean> | null; findings: unknown[] } };

const checkName = (check: { name?: string } | string) => typeof check === 'string' ? check : check.name ?? '?';

/** Validate the posted axe body before it is stored; only its shape, never its verdicts. */
export function parseAxeResult(body: unknown): AxeResult | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const raw = body as Record<string, unknown>;
  const framework = raw.framework, brand = raw.brand, theme = raw.theme;
  if (framework !== 'react' && framework !== 'vue') return undefined;
  if (brand !== 'A' && brand !== 'B') return undefined;
  if (theme !== 'light' && theme !== 'dark' && theme !== 'hc') return undefined;
  const engine = raw.engine as { name?: unknown; version?: unknown } | undefined;
  if (!engine || typeof engine.name !== 'string' || typeof engine.version !== 'string') return undefined;
  if (!Array.isArray(raw.violations)) return undefined;
  for (const key of ['passes', 'incomplete', 'inapplicable']) if (!Number.isInteger(raw[key]) || (raw[key] as number) < 0) return undefined;
  const violations = raw.violations.map(violation => {
    const item = violation as Record<string, unknown>;
    if (typeof item.id !== 'string') throw new Error('violation without an id');
    return { id: item.id, impact: typeof item.impact === 'string' ? item.impact : null, help: String(item.help ?? ''), helpUrl: String(item.helpUrl ?? ''), tags: Array.isArray(item.tags) ? item.tags.map(String) : [], nodes: Number.isInteger(item.nodes) ? item.nodes as number : 0, targets: Array.isArray(item.targets) ? item.targets.slice(0, 5).map(String) : [] };
  });
  return { engine: { name: engine.name, version: engine.version }, ranAt: typeof raw.ranAt === 'string' ? raw.ranAt : new Date().toISOString(), url: String(raw.url ?? ''), framework, brand, theme, violations, passes: raw.passes as number, incomplete: raw.incomplete as number, inapplicable: raw.inapplicable as number };
}

/**
 * The measurement panel of one version: the generation receipt per framework (checks that ran and
 * notChecked), artifact.certify for every placed chart, and axe-core per framework and scope run
 * inside the running page. Every measurement the version does not carry is named as not run.
 */
export function renderMeasurementPanel(record: CompositionVersion): string {
  const measurements = record.measurements ?? {};
  const validation = (measurements.validation as Record<string, Validation> | undefined) ?? {};
  const charts = (measurements.charts as Chart[] | undefined);
  const axe = (measurements.axe as Record<string, Record<string, AxeResult>> | undefined) ?? {};
  const frameworks = (['react', 'vue'] as PreviewFramework[]).filter(framework => record.artifacts[framework]);
  const sections: string[] = [];

  const validationRows = frameworks.map(framework => {
    const receipt = validation[framework];
    if (!receipt) return `<li data-oods-not-measured="validation:${framework}"><strong>${framework}</strong>: generation receipt not stored (not run).</li>`;
    const ran = (receipt.checks ?? []).map(checkName);
    const not = receipt.notChecked ?? [];
    return `<li data-oods-measured="validation:${framework}"><strong>${framework}</strong> · profile <code>${escapeHtml(String(receipt.profile ?? '?'))}</code> · ${ran.length} checks ran (${ran.map(escapeHtml).join(', ') || 'none'}) · ${not.length} not checked (${not.map(escapeHtml).join(', ') || 'none'}).</li>`;
  });
  sections.push(`<h4>Generation receipt (code.generate)</h4><ul>${validationRows.join('') || '<li data-oods-not-measured="validation">No framework generated yet (not run).</li>'}</ul>`);

  if (charts === undefined) sections.push('<h4>Placed charts (artifact.certify)</h4><ul><li data-oods-not-measured="charts">Placed charts not certified (not run).</li></ul>');
  else if (charts.length === 0) sections.push('<h4>Placed charts (artifact.certify)</h4><ul><li data-oods-measured="charts:none">No chart is placed on this version; nothing to certify.</li></ul>');
  else sections.push(`<h4>Placed charts (artifact.certify) <span class="count">${charts.length}</span></h4><ul>${charts.map(chart => {
    const pillars = chart.certification.pillars ? Object.entries(chart.certification.pillars).map(([pillar, value]) => `${escapeHtml(pillar)}=${escapeHtml(typeof value === 'object' && value ? String(value.status ?? JSON.stringify(value)) : String(value))}`).join(' ') : 'no pillars';
    const verdict = chart.certification.conformant === true ? 'conformant' : chart.certification.conformant === false ? 'not conformant' : 'not on the certified path (conformant null)';
    return `<li data-oods-measured="chart:${escapeHtml(chart.path)}"><code>${escapeHtml(chart.path)}</code> · ${escapeHtml(chart.chartType)} · ${escapeHtml(chart.brand)}/${escapeHtml(chart.theme)} · <strong>${verdict}</strong> · coverage ${escapeHtml(String(chart.certification.coverage ?? 'null'))} · ${pillars} · ${chart.certification.findings.length} findings.</li>`;
  }).join('')}</ul>`);

  const axeRows: string[] = [];
  for (const framework of frameworks) for (const scope of SCOPES) {
    const result = axe[framework]?.[scope];
    if (!result) { axeRows.push(`<li data-oods-not-measured="axe:${framework}:${scope}"><strong>${framework}</strong> ${scope}: axe not run.</li>`); continue; }
    const violations = result.violations.length ? result.violations.map(violation => `<code>${escapeHtml(violation.id)}</code> (${escapeHtml(violation.impact ?? 'n/a')}, ${violation.nodes} nodes)`).join(', ') : 'none';
    axeRows.push(`<li data-oods-measured="axe:${framework}:${scope}"><strong>${framework}</strong> ${scope} · ${escapeHtml(result.engine.name)} ${escapeHtml(result.engine.version)} · ${result.violations.length} violations (${violations}) · ${result.passes} passes · ${result.incomplete} incomplete · ${result.inapplicable} inapplicable · ran ${escapeHtml(result.ranAt)}.</li>`);
  }
  sections.push(`<h4>Accessibility in the running page (axe-core)</h4><ul>${axeRows.join('') || '<li data-oods-not-measured="axe">No framework generated yet (not run).</li>'}</ul>`);

  const notRun = sections.join('').match(/data-oods-not-measured="/g)?.length ?? 0;
  return `<section data-oods-measurements="${escapeHtml(record.compositionId)}@${record.version}" data-oods-not-measured-count="${notRun}"><h3>Measurements · v${record.version}</h3>${sections.join('')}</section>`;
}

/** Store one axe result on the version: measurements.axe[framework][brand/theme]. */
export function withAxeResult(record: CompositionVersion, result: AxeResult): CompositionVersion {
  const axe = { ...((record.measurements?.axe as Record<string, Record<string, AxeResult>> | undefined) ?? {}) };
  axe[result.framework] = { ...(axe[result.framework] ?? {}), [`${result.brand}/${result.theme}`]: result };
  return { ...record, measurements: { ...(record.measurements ?? {}), axe } };
}
