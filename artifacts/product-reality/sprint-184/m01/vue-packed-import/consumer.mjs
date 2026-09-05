import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToString } from '@vue/server-renderer';
import { NUCLEUS_COMPONENT_IDS, evaluateEmissionEligibility } from '@oods/component-contracts';
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
for (const target of [import.meta.resolve('@oods/components-vue'), cssUrl, import.meta.resolve('@oods/components-vue/readiness')]) {
  const path = fileURLToPath(target);
  if (!path.startsWith(process.cwd())) throw new Error(`Resolved outside isolated consumer: ${path}`);
  if (path.includes('/OODs-Forge/') || path.includes('/OODS-Forge/')) throw new Error(`Resolved repository source: ${path}`);
}
const html = await renderToString(createSSRApp({
  render: () => h(components.Button, { content: 'Packed Vue import' }),
}));
if (!html.includes('data-oods-component="Button"') || !html.includes('type="button"')) {
  throw new Error('Packed SSR smoke did not render canonical Button semantics.');
}
process.stdout.write(JSON.stringify({
    status: 'passed',
    directServerRendererDependency: consumerPackage.dependencies['@vue/server-renderer'],
    readinessDerivedFromInstalledContracts: true,
    esmCanonicalExports: runtimeIds.length,
  cjsCanonicalExports: commonJsIds.length,
  readinessRows: readiness.rows.length,
  cssPath,
  ssrHtml: html,
}));
