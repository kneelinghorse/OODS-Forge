// dashboard.render HTML export composer (sprint-115 m03).
//
// Composes the metric-overview dashboard into ONE self-contained HTML document:
//   - Vega-Lite chart panels (trend/breakdown) -> inline SVG via @oods/viz-render;
//   - KPI tiles rendered from the computed KPI values + their a11y string;
//   - ECharts-primary panels (geo: empty `spec`, `echartsSpec` present) -> an
//     a11y-described PLACEHOLDER (NOT rendered in v1, per the m01 seam (c));
//   - failed panels -> the same a11y-described placeholder.
//
// Emitted ONLY when input output.html=true; the rest of the dashboard.render payload
// is untouched (opt-in additive, seam (e)). Output is deterministic: no timestamps,
// no random ids (the per-call specRef trio is NOT embedded), SVGs are byte-stable
// (@oods/viz-render). The visual grid follows the m02 resolved abstract layout while
// DOM order follows the dashboard a11y reading order, so screen-reader traversal is
// KPI-first independent of grid position.
//
// m04 enriches this: (1) inline resolved brand tokens (a `:root` custom-property
// block + threading them to the SVG emitter), and (2) a COMPUTED a11y narrative. m03
// emits an on-brand-by-construction-ready structure with token-var defaults so m04
// only injects the values.

import { renderVegaLiteToSvg, type VegaLiteSpec } from '@oods/viz-render';
import { resolveTokenToColor } from '@oods/viz-core';
import type { DashboardRenderOutput } from '../schemas/generated.js';

// Brand-token inlining (m04): map the export's CSS custom-property names to the OODS
// design-token names, resolved to concrete values via the existing token path so the
// HTML is on-brand STANDALONE (no dependency on an external token CSS bundle). Uses
// the default brand (brand-a) semantic tokens; a brand that defines chromatic status
// colors differentiates the +/- trend, while the a11y text always names the direction
// (so the export never relies on color alone). The compact JSON path is unchanged —
// this inlining is export-only.
const EXPORT_TOKEN_MAP: Readonly<Record<string, string>> = {
  '--oods-color-fg': '--oods-brand-a-text-primary',
  '--oods-color-muted': '--oods-brand-a-text-muted',
  '--oods-color-bg': '--oods-brand-a-surface-canvas',
  '--oods-color-panel-bg': '--oods-brand-a-surface-raised',
  '--oods-color-panel-border': '--oods-brand-a-border-subtle',
  '--oods-color-accent': '--oods-brand-a-text-primary',
  '--oods-color-positive': '--oods-brand-a-status-success-text',
  '--oods-color-negative': '--oods-brand-a-status-critical-text',
};

function resolveBrandTokens(): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [cssVar, tokenName] of Object.entries(EXPORT_TOKEN_MAP)) {
    const value = resolveTokenToColor(tokenName);
    if (value) {
      resolved[cssVar] = value;
    }
  }
  return resolved;
}

type PanelResult = DashboardRenderOutput['panels'][number];
type Placement = NonNullable<DashboardRenderOutput['layout']>[number];
type DashboardA11y = DashboardRenderOutput['a11y'];

export interface ComposeHtmlArgs {
  readonly title?: string;
  readonly panels: readonly PanelResult[];
  readonly layout: readonly Placement[];
  readonly a11y: DashboardA11y;
  /** Grid column count (input.layout.columns, default 12). */
  readonly columns: number;
  /**
   * Resolved brand tokens (CSS custom-property name -> value). Threaded to the SVG
   * emitter and inlined into the document in m04; undefined in m03.
   */
  readonly tokens?: Readonly<Record<string, string>>;
}

/** Render the opt-in self-contained HTML export for a composed dashboard. */
export async function composeDashboardHtml(args: ComposeHtmlArgs): Promise<string> {
  const { title, panels, layout, a11y, columns, tokens } = args;
  // m04: resolve the brand tokens once. Caller override wins; else the default brand.
  const resolvedTokens = tokens ?? resolveBrandTokens();

  const placementById = new Map<string, Placement>(layout.map((p) => [p.id, p]));
  const byId = new Map<string, PanelResult>(panels.map((p) => [p.id, p]));
  const order = a11y?.panelOrder?.length ? a11y.panelOrder : panels.map((p) => p.id);

  const cells: string[] = [];
  for (const id of order) {
    const panel = byId.get(id);
    if (!panel) {
      continue;
    }
    cells.push(await renderPanelCell(panel, placementById.get(id), resolvedTokens));
  }

  const docTitle = title ?? 'Dashboard';
  const ariaLabel = a11y?.ariaLabel ?? docTitle;

  const lines: string[] = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${esc(docTitle)}</title>`,
    `<style>${rootTokenBlock(resolvedTokens)}${styleBlock(columns)}</style>`,
    '</head>',
    '<body>',
    `<main class="oods-dashboard" role="region" aria-label="${esc(ariaLabel)}">`,
  ];
  if (title) {
    lines.push(`<h1 class="oods-dashboard-title">${esc(title)}</h1>`);
  }
  if (a11y?.description) {
    lines.push(`<p class="oods-dashboard-summary">${esc(a11y.description)}</p>`);
  }
  lines.push(...narrativeBlock(a11y));
  lines.push('<div class="oods-dashboard-grid">');
  lines.push(...cells);
  lines.push('</div>');
  lines.push('</main>');
  lines.push('</body>');
  lines.push('</html>');
  return lines.join('\n') + '\n';
}

async function renderPanelCell(
  panel: PanelResult,
  placement: Placement | undefined,
  tokens: Readonly<Record<string, string>> | undefined,
): Promise<string> {
  const style = placement ? ` style="${gridStyle(placement)}"` : '';

  if (panel.kind === 'kpi') {
    return kpiCell(panel, style);
  }
  if (panel.kind === 'error') {
    return placeholderCell(panel.title, panel.a11yDescription, style, 'error');
  }
  // chart panel: a non-empty `spec` is a Vega-Lite spec we can render to SVG.
  if (panel.spec && Object.keys(panel.spec).length > 0) {
    const svg = await renderVegaLiteToSvg(panel.spec as unknown as VegaLiteSpec, { tokens });
    return chartCell(panel.title, panel.a11yDescription, svg, style);
  }
  // ECharts-primary (geo): empty spec + echartsSpec -> a11y-described placeholder.
  return placeholderCell(panel.title, panel.a11yDescription, style, 'geo');
}

function kpiCell(panel: Extract<PanelResult, { kind: 'kpi' }>, style: string): string {
  const title = panel.title ?? '';
  const valueText = panel.formatted ?? String(panel.value);
  const trend = panel.trendDirection;
  const deltaText =
    panel.delta === null || panel.delta === undefined
      ? `(${trend})`
      : `${panel.delta >= 0 ? '+' : ''}${panel.delta} (${trend})`;
  const parts: string[] = [
    `<section class="oods-panel oods-kpi"${style}${ariaLabelAttr(title || panel.a11yDescription)}>`,
  ];
  if (title) {
    parts.push(`<h3 class="oods-kpi-title">${esc(title)}</h3>`);
  }
  parts.push(`<p class="oods-kpi-value">${esc(valueText)}</p>`);
  parts.push(`<p class="oods-kpi-delta oods-trend-${esc(trend)}">${esc(deltaText)}</p>`);
  if (panel.a11yDescription) {
    parts.push(`<p class="oods-visually-hidden">${esc(panel.a11yDescription)}</p>`);
  }
  parts.push('</section>');
  return parts.join('');
}

function chartCell(
  title: string | undefined,
  a11yDescription: string | undefined,
  svg: string,
  style: string,
): string {
  const parts: string[] = [
    `<figure class="oods-panel oods-chart" role="figure"${style}${ariaLabelAttr(a11yDescription ?? title)}>`,
  ];
  if (title) {
    parts.push(`<figcaption>${esc(title)}</figcaption>`);
  }
  parts.push(svg);
  parts.push('</figure>');
  return parts.join('');
}

function placeholderCell(
  title: string | undefined,
  a11yDescription: string | undefined,
  style: string,
  variant: 'geo' | 'error',
): string {
  const note = a11yDescription ?? (variant === 'geo' ? 'Map panel (not rendered in this export).' : 'Panel could not be rendered.');
  const parts: string[] = [
    `<section class="oods-panel oods-placeholder oods-placeholder-${variant}" role="img"${style}${ariaLabelAttr(note)}>`,
  ];
  if (title) {
    parts.push(`<h3 class="oods-placeholder-title">${esc(title)}</h3>`);
  }
  parts.push(`<p class="oods-placeholder-note">${esc(note)}</p>`);
  parts.push('</section>');
  return parts.join('');
}

function narrativeBlock(a11y: DashboardA11y): string[] {
  const narrative = a11y?.narrative;
  if (!narrative || (!narrative.summary && !(narrative.keyFindings && narrative.keyFindings.length))) {
    return [];
  }
  const lines: string[] = ['<section class="oods-dashboard-narrative" aria-label="Key findings">'];
  if (narrative.summary) {
    lines.push(`<p class="oods-narrative-summary">${esc(narrative.summary)}</p>`);
  }
  if (narrative.keyFindings && narrative.keyFindings.length) {
    lines.push('<ul class="oods-narrative-findings">');
    for (const finding of narrative.keyFindings) {
      lines.push(`<li>${esc(finding)}</li>`);
    }
    lines.push('</ul>');
  }
  lines.push('</section>');
  return lines;
}

function gridStyle(p: Placement): string {
  // CSS grid lines are 1-based; the resolved layout is 0-based (x/y >= 0).
  return `grid-column:${p.x + 1}/span ${p.w};grid-row:${p.y + 1}/span ${p.h}`;
}

function ariaLabelAttr(label: string | undefined): string {
  return label ? ` aria-label="${esc(label)}"` : '';
}

// Inline the resolved brand tokens as a :root custom-property block so the
// stylesheet's var(--oods-color-*, fallback) references resolve on-brand standalone.
function rootTokenBlock(tokens: Readonly<Record<string, string>>): string {
  const decls = Object.entries(tokens)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');
  return decls ? `:root{${decls}}` : '';
}

function styleBlock(columns: number): string {
  // Token-var defaults: m04 injects a `:root` custom-property block to drive these
  // on-brand; the fallbacks keep the export legible standalone in the meantime.
  return [
    `.oods-dashboard{font-family:var(--oods-font-sans,system-ui,-apple-system,sans-serif);color:var(--oods-color-fg,#1a1a1a);background:var(--oods-color-bg,#ffffff);margin:0;padding:16px}`,
    `.oods-dashboard-title{font-size:18px;margin:0 0 4px}`,
    `.oods-dashboard-summary{margin:0 0 12px;font-size:14px;color:var(--oods-color-muted,#555)}`,
    `.oods-dashboard-narrative{margin:0 0 12px;font-size:13px;color:var(--oods-color-muted,#555)}`,
    `.oods-dashboard-grid{display:grid;grid-template-columns:repeat(${columns},1fr);gap:12px}`,
    `.oods-panel{background:var(--oods-color-panel-bg,#ffffff);border:1px solid var(--oods-color-panel-border,#e2e2e2);border-radius:8px;padding:12px;box-sizing:border-box}`,
    `.oods-kpi-title{margin:0 0 4px;font-size:13px;color:var(--oods-color-muted,#555)}`,
    `.oods-kpi-value{margin:0;font-size:28px;font-weight:600;color:var(--oods-color-accent,#1a1a1a)}`,
    `.oods-kpi-delta{margin:4px 0 0;font-size:13px}`,
    `.oods-trend-increasing{color:var(--oods-color-positive,#1a7f37)}`,
    `.oods-trend-decreasing{color:var(--oods-color-negative,#b42318)}`,
    `.oods-trend-flat{color:var(--oods-color-muted,#555)}`,
    `.oods-chart figcaption{font-size:13px;color:var(--oods-color-muted,#555);margin-bottom:8px}`,
    `.oods-placeholder-title{margin:0 0 4px;font-size:13px}`,
    `.oods-placeholder-note{margin:0;font-size:13px;color:var(--oods-color-muted,#555)}`,
    `.oods-visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`,
  ].join('');
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c] as string);
}
