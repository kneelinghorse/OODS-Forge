#!/usr/bin/env tsx
/** Live capability measurements. Product imports are ONLY the four public handlers.
 * Operands are retained copies of the existing fidelity cases, not registry expectations.
 * Invalid HC/dashboard requests are tested at their public JSON-schema boundary first.
 */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import { handle as render } from '../../packages/mcp-server/src/tools/viz.render.js';
import { handle as dashboard } from '../../packages/mcp-server/src/tools/dashboard.render.js';
import { handle as certify } from '../../packages/mcp-server/src/tools/artifact.certify.js';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = (file: string) => JSON.parse(readFileSync(resolve(root, file), 'utf8'));
export const censusInputs: Parameters<typeof render>[0][] = readJson('scripts/product-reality/s190-viz-operands.json');
const ajv = new Ajv({ strict: false, allErrors: true });
const renderSchema = readJson('packages/mcp-server/src/schemas/viz.render.input.json');
const validRender = ajv.compile(renderSchema);
const validDashboard = ajv.compile(readJson('packages/mcp-server/src/schemas/dashboard.render.input.json'));
export function canonical(value: unknown): string {
  const sort = (item: any): any => Array.isArray(item) ? item.map(sort) : item && typeof item === 'object'
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, sort(item[key])])) : item;
  return JSON.stringify(sort(value));
}

export async function measureVizCensus() {
  assert.deepEqual(censusInputs.map(input => input.chartType).sort(), [...renderSchema.properties.chartType.enum].sort());
  const placements: Array<{ object: string; context: string; chartType: string }> = [];
  const walk = (node: any, object: string, context: string) => {
    if (!node || typeof node !== 'object') return;
    if (node.chart?.chartType) placements.push({ object, context, chartType: node.chart.chartType });
    for (const value of Object.values(node)) if (typeof value === 'object') walk(value, object, context);
  };
  for (const object of ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User']) {
    for (const context of ['detail', 'list', 'form', 'timeline', 'card', 'inline'] as const) {
      const out = await compose({ object, context });
      assert.equal(out.status, 'ok', `${object}/${context}: ${JSON.stringify(out.errors)}`);
      walk(out.schema, object, context);
    }
  }
  const observations: any[] = [], registry: any[] = [];
  for (const input of censusInputs) {
    const request = { ...input, output: { ...input.output, svg: true, includeNormalizedSpec: true } };
    const defaultRender = await render(request);
    assert.equal(defaultRender.status, 'ok', JSON.stringify(defaultRender.errors));
    const scopes: any[] = [];
    for (const brand of ['A', 'B'] as const) for (const theme of ['light', 'dark'] as const) {
      assert(validRender({ ...request, theme, brand }));
      const rendered = await render({ ...request, theme, brand });
      const repeated = await render({ ...request, theme, brand });
      assert.equal(rendered.status, 'ok', JSON.stringify(rendered.errors));
      assert.equal(rendered.svg, repeated.svg, `${input.chartType}/${theme}/${brand} repeat`);
      if (theme === 'light' && brand === 'A') assert.equal(rendered.svg, defaultRender.svg, 'omitted scope equals light/A');
      const data = Object.fromEntries(['hierarchy', 'sankey', 'chord', 'network', 'geo'].filter(key => key in input).map(key => [key, (input as any)[key]]));
      const grade = await certify({ spec: rendered.normalizedSpec!, theme, brand, ...(Object.keys(data).length ? { data } : {}) });
      assert.equal(grade.status, 'ok', JSON.stringify(grade.errors));
      assert.equal(grade.determinism?.renderHash, rendered.svgHash, `${input.chartType}/${theme}/${brand} certify identity`);
      scopes.push({ theme, brand, svgHash: rendered.svgHash, renderHash: grade.determinism?.renderHash, repeated: true,
        render: rendered.render, a11yDescription: !!rendered.normalizedSpec?.a11y?.description,
        coverage: grade.coverage, conformant: grade.conformant, accuracyRules: grade.accuracyRules,
        accuracySummary: grade.accuracySummary, contrast: grade.contrastResults![0] });
    }
    const { output: _output, rows, name, ...panelInput } = input;
    const dashboardRequest = { schemaVersion: 'v0.1', datasets: [{ id: 'data', rows: rows ?? censusInputs[0]!.rows! }],
      panels: [{ ...panelInput, ...(name ? { title: name } : {}), id: 'chart', kind: 'chart', ...(rows ? { datasetId: 'data' } : {}) }],
      output: { html: true }, a11y: { description: 'Single-panel visualization capability probe.' } };
    const dashboardAdmitted = !!validDashboard(dashboardRequest);
    const dashboardErrors = dashboardAdmitted ? [] : structuredClone(validDashboard.errors);
    if (!dashboardAdmitted) assert(dashboardErrors?.some(error => error.instancePath === '/panels/0/chartType' && error.keyword === 'enum'), JSON.stringify(dashboardErrors));
    const panel = dashboardAdmitted ? await dashboard(dashboardRequest as Parameters<typeof dashboard>[0]) : undefined;
    const drawn = panel?.status === 'ok' && /<svg\b/.test(panel.html ?? '') && !/class="[^"]*oods-placeholder/.test(panel.html ?? '');
    if (dashboardAdmitted) assert(drawn, `${input.chartType} admitted dashboard must draw`);
    const hcAdmitted = !!validRender({ ...request, theme: 'hc' });
    assert.equal(hcAdmitted, false, 'HC pixels deferred under #1851; remeasure if admitted');
    const places = placements.filter(place => place.chartType === input.chartType);
    const measured = (['light', 'dark'] as const).filter(theme => scopes.filter(scope => scope.theme === theme).every(scope => scope.contrast.measured));
    const notes = ['HC pixels deferred (#1851); HC token scopes retained.', 'Light palette on dark canvas; no separate dark viz-scale token overrides.'];
    if (!dashboardAdmitted) notes.push('Dashboard exclusion (#881): the public panel schema does not admit this type.');
    if (!measured.length) notes.push(`Contrast verdict ${scopes[0].contrast.verdict}; no categorical canvas-ratio measurement claimed.`);
    if (places.length) notes.push(`Static sample chart placement: ${places.map(place => `${place.object}/${place.context}`).join(', ')}; edited form data does not regenerate SVG.`);
    const first = scopes[0];
    registry.push({ chartType: input.chartType, specEngine: first.render.engine, publicSvg: scopes.every(scope => !!scope.svgHash),
      dashboardDrawn: drawn ? true : 'excluded (#881)', themes: { light: scopes.filter(scope => scope.theme === 'light').every(scope => !!scope.svgHash), dark: scopes.filter(scope => scope.theme === 'dark').every(scope => !!scope.svgHash), hc: hcAdmitted },
      brands: ['A', 'B'].filter(brand => scopes.filter(scope => scope.brand === brand).every(scope => !!scope.svgHash)),
      a11yDescription: scopes.every(scope => scope.a11yDescription), accuracyRules: first.accuracyRules,
      certifyCoverage: first.coverage, contrastMeasured: measured, chartInApp: places.length ? 'placed' : 'not-placed', notes });
    observations.push({ chartType: input.chartType, defaultEqualsLightA: true, scopes, dashboardAdmitted, dashboardErrors, dashboardDrawn: drawn, placements: places, hcAdmitted });
  }
  return { registry, observations, placementCompositions: 66, placements };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = resolve(process.argv[2] ?? 'artifacts/product-reality/sprint-190/m05');
  const result = await measureVizCensus();
  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, 'viz-census.json'), JSON.stringify(result.registry, null, 2) + '\n');
  writeFileSync(resolve(output, 'viz-observations.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ rows: result.registry.length, scopeIdentities: result.observations.reduce((n, row) => n + row.scopes.length, 0), placements: result.placements }));
}
