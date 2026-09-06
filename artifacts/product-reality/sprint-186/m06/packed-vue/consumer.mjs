import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToString } from '@vue/server-renderer';
import { NUCLEUS_COMPONENT_IDS, evaluateEmissionEligibility } from '@oods/component-contracts';
import { sharedScenarios } from '@oods/component-contracts';
import { createSSRApp, h } from 'vue';
import readiness from '@oods/components-vue/readiness' with { type: 'json' };
import * as components from '@oods/components-vue';
import * as compatibility from '@oods/components-vue/ported';

const canonicalIds = [...NUCLEUS_COMPONENT_IDS];
const consumerPackage = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
if (consumerPackage.dependencies?.['@vue/server-renderer'] !== '3.5.42') {
  throw new Error('Packed consumer must declare its direct @vue/server-renderer import.');
}
const require = createRequire(import.meta.url);
const commonJs = require('@oods/components-vue');
const compatibilityIds = ['AuditTimeline', 'CancellationSummary', 'PaginationBar', 'PriceBadge', 'RelativeTimestamp', 'SearchInput', 'StatusBadge', 'StatusTimeline'];
const commonJsRoot = require('@oods/components-vue');
const commonJsCompatibility = require('@oods/components-vue/ported');
const compatibilityProof = [];
for (const id of compatibilityIds) {
  const scenario = sharedScenarios.find(item => item.oodsComponentId === id);
  if (!scenario) throw new Error('Missing canonical scenario for compatibility family: ' + id);
  const rootMarkup = await renderToString(createSSRApp({ render: () => h(components[id], scenario.props) }));
  const aliasMarkup = await renderToString(createSSRApp({ render: () => h(compatibility[id], scenario.props) }));
  const result = { componentId: id, esmSame: components[id] === compatibility[id], cjsSame: commonJsRoot[id] === commonJsCompatibility[id], ssrSame: rootMarkup === aliasMarkup, rootMarkup, aliasMarkup };
  if (!result.esmSame || !result.cjsSame || !result.ssrSame || !rootMarkup.includes('data-oods-component="' + id + '"')) throw new Error('Compatibility alias changed ' + id);
  compatibilityProof.push(result);
}
const rootRuntimeIds = compatibilityIds.filter(id => id in components);
const aliasRuntimeIds = compatibilityIds.filter(id => id in compatibility);
const compatibilitySpecifiers = {
  root: fileURLToPath(import.meta.resolve('@oods/components-vue')),
  alias: fileURLToPath(import.meta.resolve('@oods/components-vue/ported')),
};
const compatibilityResolution = {
  runtimeSame: import.meta.resolve('@oods/components-vue') === import.meta.resolve('@oods/components-vue/ported'),
  readinessSame: import.meta.resolve('@oods/components-vue/readiness') === import.meta.resolve('@oods/components-vue/readiness-ported'),
  cssSame: import.meta.resolve('@oods/component-styles/css') === import.meta.resolve('@oods/component-styles/css-ported'),
};
if (Object.values(compatibilityResolution).some(value => value !== true)) throw new Error('Compatibility subpaths must resolve to the root artifacts.');
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
const repositoryRoot = "/Users/systemsystems/.codex/worktrees/s186/OODS-Forge";
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

const breadthIds = ['DetailHeader', 'CardHeader', 'ColorSwatch', 'ColorizedBadge', 'VizAreaPreview', 'ClassificationPanel', 'FilterPanel', 'PriceSummary', 'AddressCollectionPanel', 'MembershipPanel', 'PreferencePanel', 'TagManager', 'AddressSummaryBadge', 'MessageStatusBadge', 'PreferenceSummaryBadge', 'RoleBadgeList', 'TagPills', 'AddressValidationTimeline', 'AuditEvent', 'MembershipAuditTimeline', 'MessageEventTimeline', 'PreferenceTimeline', 'AddressEditor', 'PreferenceEditor', 'RoleAssignmentForm', 'StatusSelector', 'TagInput', 'TemplatePicker'];
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
  if (id === 'ClassificationPanel' && (!markup.includes('data-panel-type="classification"') || !markup.includes('<h3>Classification</h3>') || !markup.includes(String(scenario.props.summary).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')))) throw new Error('Packed ClassificationPanel lost heading/summary semantics.');
  if (id === 'FilterPanel' && (!markup.includes('aria-label="Filters"') || !markup.includes('data-filter-mode="batch"') || !markup.includes('<legend>Status</legend>') || !markup.includes('data-filter-apply'))) throw new Error('Packed FilterPanel lost region/legend/apply semantics.');
  if (['AddressCollectionPanel', 'MembershipPanel', 'PreferencePanel'].includes(id) && (!markup.includes('data-panel-type=') || !markup.includes('<h3>') || !markup.includes('data-panel-summary'))) throw new Error('Packed ' + id + ' lost heading/summary semantics.');
  if (['AddressSummaryBadge', 'MessageStatusBadge', 'PreferenceSummaryBadge'].includes(id) && (!markup.includes('data-badge-variant=') || !markup.includes('data-badge-status=') || !markup.includes('data-oods-badge-label'))) throw new Error('Packed ' + id + ' lost badge semantics.');
  if (id === 'RoleBadgeList' && (!markup.includes('data-badge-variant="session"') || !markup.includes('data-role-badge'))) throw new Error('Packed RoleBadgeList lost item semantics.');
  if (id === 'TagPills' && (!markup.includes('data-summary-type="tag-pills"') || !markup.includes('data-tag-pill') || !markup.includes('>+5<') || markup.includes('{{'))) throw new Error('Packed TagPills lost overflow substitution.');
  if (['AddressValidationTimeline', 'MembershipAuditTimeline', 'MessageEventTimeline', 'PreferenceTimeline'].includes(id) && (!markup.includes('role="log"') || !markup.includes('data-timeline-type=') || !markup.includes('data-timeline-events'))) throw new Error('Packed ' + id + ' lost log semantics.');
  if (id === 'AuditEvent' && (!markup.includes('data-event-type="audit"') || !markup.includes('<time') || !markup.includes('data-event-label'))) throw new Error('Packed AuditEvent lost article semantics.');
  if (id === 'TagManager' && (!markup.includes('data-form-type="tag-manager"') || !markup.includes('<h3>Tags</h3>') || !markup.includes('data-tag-item') || !markup.includes('name="newTag"'))) throw new Error('Packed TagManager lost list/add-control semantics.');
  if (id === 'PriceSummary' && (!markup.includes('data-summary-type="price"') || !markup.includes('<dt>Amount</dt>') || !markup.includes('<dd>' + scenario.props.amount + '</dd>'))) throw new Error('Packed PriceSummary lost term/value semantics.');
  if (id === 'AddressEditor' && (!markup.includes('data-form-type="address-editor"') || !markup.includes('<h3>Shipping address</h3>') || !markup.includes('name="street"') || !markup.includes('name="postalCode"'))) throw new Error('Packed AddressEditor lost form/input semantics.');
  if (id === 'PreferenceEditor' && (!markup.includes('data-form-type="preference-editor"') || !markup.includes('name="namespace"') || !markup.includes('<textarea') || !markup.includes('billing'))) throw new Error('Packed PreferenceEditor lost select/textarea semantics.');
  if (id === 'RoleAssignmentForm' && (!markup.includes('data-form-type="role-assignment"') || !markup.includes('name="role"') || !markup.includes('>Owner</option>') || !markup.includes('name="assignee"'))) throw new Error('Packed RoleAssignmentForm lost select/input semantics.');
  if (id === 'StatusSelector' && (!markup.includes('data-summary-type="status-selector"') || !markup.includes('name="status"') || !markup.includes('selected') || !markup.includes('>active</option>'))) throw new Error('Packed StatusSelector lost labelled select semantics.');
  if (id === 'TagInput' && (!markup.includes('data-form-type="tag-input"') || !markup.includes('<legend>Tags</legend>') || !markup.includes('name="tag"') || !markup.includes('placeholder="Add a tag"') || !markup.includes('data-tag-item'))) throw new Error('Packed TagInput lost fieldset/input/tag semantics.');
  if (id === 'TemplatePicker' && (!markup.includes('data-form-type="template-picker"') || !markup.includes('name="template"') || !markup.includes('>Welcome</option>') || !markup.includes('name="channel"'))) throw new Error('Packed TemplatePicker lost select semantics.');
  breadthProof.push({ componentId: id, markup });
}
const emptyPreview = await renderToString(createSSRApp({ render: () => h(components.VizAreaPreview) }));
if (!emptyPreview.includes('data-viz-preview-placeholder') || !emptyPreview.includes('Area preview (640 x 360)')) throw new Error('Packed empty preview placeholder missing.');

const resolvedSpecifiers = Object.fromEntries(['@oods/component-contracts', '@oods/components-vue', '@oods/components-vue/ported', '@oods/components-vue/readiness-ported', '@oods/component-styles/css-ported', '@oods/component-styles/css', '@oods/tokens/css', 'vue', '@vue/server-renderer'].map((specifier) => {
  const resolved = fileURLToPath(import.meta.resolve(specifier));
  if (!resolved.startsWith(process.cwd() + '/') || resolved.startsWith(repositoryRoot + '/')) throw new Error('Specifier escaped isolated consumer: ' + specifier);
  return [specifier, resolved];
}));
process.stdout.write(JSON.stringify({
    breadthProof, emptyPreview, resolvedSpecifiers, compatibilityProof, compatibilityResolution, rootRuntimeIds, aliasRuntimeIds, compatibilitySpecifiers,
    status: 'passed',
    directServerRendererDependency: consumerPackage.dependencies['@vue/server-renderer'],
    readinessDerivedFromInstalledContracts: true,
    esmCanonicalExports: runtimeIds.length,
  cjsCanonicalExports: commonJsIds.length,
  readinessRows: readiness.rows.length,
  cssPath,
  ssrHtml: html,
}));
