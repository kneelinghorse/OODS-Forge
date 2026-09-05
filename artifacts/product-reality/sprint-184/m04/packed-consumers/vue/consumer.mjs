import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PORTED_COMPONENT_IDS } from '@oods/component-contracts';
import * as ported from '@oods/components-vue/ported';
import readiness from '@oods/components-vue/readiness-ported' with { type: 'json' };
import { renderToString } from '@vue/server-renderer';
import { h } from 'vue';

const expectedIds = ["AuditTimeline","CancellationSummary","PaginationBar","PriceBadge","RelativeTimestamp","SearchInput","StatusBadge","StatusTimeline"];
const expectedRoot = realpathSync(process.env.OODS_EXPECTED_CONSUMER_ROOT);
const forbiddenRoot = realpathSync(process.env.OODS_FORBIDDEN_REPOSITORY_ROOT);
const require = createRequire(import.meta.url);

if (JSON.stringify(PORTED_COMPONENT_IDS) !== JSON.stringify(expectedIds)) {
  throw new Error('Installed ported ID union differs from the frozen eight.');
}
const runtimeIds = Object.keys(ported).sort();
if (JSON.stringify(runtimeIds) !== JSON.stringify(expectedIds)) {
  throw new Error('ESM ported export set differs: ' + JSON.stringify(runtimeIds));
}
const commonJsIds = Object.keys(require('@oods/components-vue/ported')).sort();
if (JSON.stringify(commonJsIds) !== JSON.stringify(expectedIds)) {
  throw new Error('CJS ported export set differs: ' + JSON.stringify(commonJsIds));
}
const readinessIds = readiness.rows.map((row) => row.componentId);
if (
  readiness.target !== 'vue'
  || JSON.stringify(readinessIds) !== JSON.stringify(expectedIds)
  || readiness.rows.some((row) => row.emissionEligible !== true)
) {
  throw new Error('Ported readiness export is incomplete.');
}

const specifiers = [
  '@oods/component-contracts',
  '@oods/components-vue/ported',
  '@oods/components-vue/readiness-ported',
  '@oods/component-styles/css-ported',
];
const resolutions = specifiers.map((specifier) => {
  const resolved = realpathSync(fileURLToPath(import.meta.resolve(specifier)));
  const consumerRelative = path.relative(expectedRoot, resolved);
  if (consumerRelative === '' || consumerRelative.startsWith('..') || path.isAbsolute(consumerRelative)) {
    throw new Error('Specifier resolved outside isolated consumer: ' + specifier + ' -> ' + resolved);
  }
  const repositoryRelative = path.relative(forbiddenRoot, resolved);
  if (repositoryRelative === '' || (!repositoryRelative.startsWith('..') && !path.isAbsolute(repositoryRelative))) {
    throw new Error('Specifier resolved under repository root: ' + specifier + ' -> ' + resolved);
  }
  return { specifier, consumerRelative: consumerRelative.split(path.sep).join('/') };
});

for (const packageName of ["@oods/tokens","@oods/component-contracts","@oods/component-styles","@oods/components-vue"]) {
  const packageRoot = realpathSync(path.join(expectedRoot, 'node_modules', ...packageName.split('/')));
  if (lstatSync(path.join(expectedRoot, 'node_modules', ...packageName.split('/'))).isSymbolicLink()) {
    throw new Error('Installed local package is a symlink: ' + packageName);
  }
  const repositoryRelative = path.relative(forbiddenRoot, packageRoot);
  if (repositoryRelative === '' || (!repositoryRelative.startsWith('..') && !path.isAbsolute(repositoryRelative))) {
    throw new Error('Installed local package points into repository: ' + packageName);
  }
}

const cssPath = fileURLToPath(import.meta.resolve('@oods/component-styles/css-ported'));
const css = readFileSync(cssPath, 'utf8');
for (const componentId of expectedIds) {
  if (!css.includes("[data-oods-component='" + componentId + "']")) {
    throw new Error('Ported CSS omits ' + componentId + '.');
  }
}
if (!css.includes('@import "./statusables.css"')) {
  throw new Error('Ported CSS omits the packaged statusables dependency.');
}
readFileSync(path.join(path.dirname(cssPath), 'statusables.css'), 'utf8');

const html = await renderToString(h(ported.PriceBadge, { amountCents: 2599, currency: 'USD' }));
if (!html.includes('data-oods-component="PriceBadge"')) {
  throw new Error('Packed vue SSR did not render PriceBadge.');
}
if (!html.includes('data-badge-variant="price"') || html.includes('data-badge-variant="usd"')) {
  throw new Error('Packed vue PriceBadge lost its price marker.');
}

process.stdout.write(JSON.stringify({
  target: 'vue',
  componentIds: expectedIds,
  runtimeIds,
  commonJsIds,
  readinessIds,
  cssBytes: Buffer.byteLength(css),
  cssComponentIds: expectedIds,
  resolutions,
  ssr: { componentId: 'PriceBadge', html },
}));
