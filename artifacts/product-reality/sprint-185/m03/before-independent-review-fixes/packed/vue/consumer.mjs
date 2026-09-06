import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToString } from '@vue/server-renderer';
import { NUCLEUS_COMPONENT_IDS, evaluateEmissionEligibility } from '@oods/component-contracts';
import { sharedScenarios } from '@oods/component-contracts';
import { createSSRApp, h } from 'vue';
import readiness from '@oods/components-vue/readiness' with { type: 'json' };
import * as components from '@oods/components-vue';

const canonicalIds = [...NUCLEUS_COMPONENT_IDS];
const consumerPackage = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
if (consumerPackage.dependencies?.['@vue/server-renderer'] !== '3.5.42') {
  throw new Error('Packed consumer must declare its direct @vue/server-renderer import.');
}
const require = createRequire(import.meta.url);
const commonJs = require('@oods/components-vue');
const runtimeIds = canonicalIds.filter((id) => id in components);
const commonJsIds = canonicalIds.filter((id) => id in commonJs);
if (JSON.stringify(runtimeIds) !== JSON.stringify(canonicalIds)) throw new Error('ESM canonical export mismatch.');
if (JSON.stringify(commonJsIds) !== JSON.stringify(canonicalIds)) throw new Error('CJS canonical export mismatch.');
const readinessIds = readiness.rows.map((row) => row.componentId);
const derivedReadiness = readiness.rows.map((row) => evaluateEmissionEligibility(row.evidence));
if (
  readiness.target !== 'vue'
  || JSON.stringify(readinessIds) !== JSON.stringify(canonicalIds)
  || derivedReadiness.some((result) => !result.emissionEligible || result.incomplete.length > 0)
  || readiness.rows.some((row) => !row.emissionEligible)
) {
  throw new Error('Packed readiness evidence is incomplete.');
}
const cssUrl = import.meta.resolve('@oods/component-styles/css');
const cssPath = fileURLToPath(cssUrl);
const css = readFileSync(cssPath, 'utf8');
if (!css.includes('@import "@oods/tokens/css"') || !css.includes("[data-oods-component='Tabs']")) {
  throw new Error('Packed shared CSS closure is incomplete.');
}
const repositoryRoot = "/Users/systemsystems/.codex/worktrees/s185/OODS-Forge";
for (const target of [import.meta.resolve('@oods/component-contracts'), import.meta.resolve('@oods/components-vue'), cssUrl, import.meta.resolve('@oods/components-vue/readiness')]) {
  const path = fileURLToPath(target);
  if (!path.startsWith(process.cwd())) throw new Error(`Resolved outside isolated consumer: ${path}`);
  if (path.startsWith(repositoryRoot + '/')) throw new Error(`Resolved repository source: ${path}`);
  if (path.includes('/OODs-Forge/') || path.includes('/OODS-Forge/')) throw new Error(`Resolved repository source: ${path}`);
}
const html = await renderToString(createSSRApp({
  render: () => h(components.Button, { content: 'Packed Vue import' }),
}));
if (!html.includes('data-oods-component="Button"') || !html.includes('type="button"')) {
  throw new Error('Packed SSR smoke did not render canonical Button semantics.');
}

const breadthIds = ['DetailHeader', 'CardHeader', 'ColorSwatch', 'ColorizedBadge', 'VizAreaPreview'];
const breadthProof = [];
for (const id of breadthIds) {
  const scenario = sharedScenarios.find((item) => item.oodsComponentId === id);
  if (!scenario) throw new Error('Missing installed shared scenario: ' + id);
  const markup = await renderToString(createSSRApp({ render: () => h(components[id], scenario.props, scenario.slots.default === undefined ? undefined : { default: () => String(scenario.slots.default) }) }));
  if (!markup.includes('data-oods-component="' + id + '"')) throw new Error('Missing packed marker: ' + id);
  if (id === 'DetailHeader' && (!markup.includes('<h1') || !markup.includes(scenario.props.title) || !markup.includes(scenario.props.subtitle) || !markup.includes(scenario.props.metadata))) throw new Error('Packed DetailHeader lost heading/text semantics.');
  if (id === 'CardHeader' && (!markup.includes('<h3') || !markup.includes(scenario.props.supportingText))) throw new Error('Packed CardHeader lost heading/supporting text.');
  if (id === 'ColorSwatch' && (!markup.includes('data-oods-swatch-chip') || !markup.includes(scenario.props.label) || !markup.includes('--oods-swatch-color') || !markup.includes('data-swatch-color="' + scenario.props.color + '"'))) throw new Error('Packed ColorSwatch lost label/chip semantics.');
  if (id === 'ColorizedBadge' && (!markup.includes('data-oods-badge-marker') || !markup.includes(scenario.props.label) || !markup.includes('data-badge-color="' + scenario.props.color + '"'))) throw new Error('Packed ColorizedBadge lost color/text semantics.');
  if (id === 'VizAreaPreview' && (!markup.includes('data-viz-preview-type="area"') || !markup.includes('data-viz-width="640"') || !markup.includes('data-viz-height="360"') || !markup.includes(String(scenario.slots.default)) || markup.includes('data-viz-preview-placeholder'))) throw new Error('Packed preview lost frame/slot semantics.');
  breadthProof.push({ componentId: id, markup });
}
const emptyPreview = await renderToString(createSSRApp({ render: () => h(components.VizAreaPreview) }));
if (!emptyPreview.includes('data-viz-preview-placeholder') || !emptyPreview.includes('Area preview (640 x 360)')) throw new Error('Packed empty preview placeholder missing.');

const resolvedSpecifiers = Object.fromEntries(['@oods/component-contracts', '@oods/components-vue', '@oods/component-styles/css', '@oods/tokens/css', 'vue', '@vue/server-renderer'].map((specifier) => {
  const resolved = fileURLToPath(import.meta.resolve(specifier));
  if (!resolved.startsWith(process.cwd() + '/') || resolved.startsWith(repositoryRoot + '/')) throw new Error('Specifier escaped isolated consumer: ' + specifier);
  return [specifier, resolved];
}));
process.stdout.write(JSON.stringify({
    breadthProof, emptyPreview, resolvedSpecifiers,
    status: 'passed',
    directServerRendererDependency: consumerPackage.dependencies['@vue/server-renderer'],
    readinessDerivedFromInstalledContracts: true,
    esmCanonicalExports: runtimeIds.length,
  cjsCanonicalExports: commonJsIds.length,
  readinessRows: readiness.rows.length,
  cssPath,
  ssrHtml: html,
}));
