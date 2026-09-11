import fs from 'node:fs';
import { VIZ_CONTROL_IDS, VIZ_SUMMARY_IDS, VIZ_PREVIEW_TYPES, VIZ_CONTROL_TITLES, defaultVizIntent, vizControlFields, editVizIntent } from '../../../../packages/component-contracts/src/viz-controls.js';
const previewSamples = JSON.parse(fs.readFileSync('packages/component-contracts/fixtures/viz-preview-samples.v1.json', 'utf8'));
const ids = [...VIZ_CONTROL_IDS, ...VIZ_SUMMARY_IDS, ...Object.keys(VIZ_PREVIEW_TYPES)].sort();
const contracts: Record<string, unknown> = {}; const behaviors: Record<string, unknown> = {}; const scenarios: unknown[] = [];
for (const id of ids) {
  const interactive = (VIZ_CONTROL_IDS as readonly string[]).includes(id);
  const preview = Object.hasOwn(VIZ_PREVIEW_TYPES, id);
  const badge = id.endsWith('Badge');
  const props = preview ? ['svg', 'title', 'description', 'width', 'height'] : ['title', 'value', 'channel', ...(interactive ? ['disabled'] : [])];
  contracts[id] = { id, version: '1.1.0', props, slots: preview ? ['default'] : [], events: interactive ? ['change'] : [], states: preview ? ['unbound', 'rendered'] : interactive ? ['bound', 'editing', 'invalid', 'disabled'] : ['unbound', 'bound'], tokenRoles: interactive ? ['input.background', 'input.border', 'input.text', 'input.focus', 'field.message'] : ['surface.panel', 'text.body'], accessibility: [interactive ? 'Native labelled controls expose focus and invalid-edit feedback; successful edits emit a typed viz.render input fragment.' : preview ? 'Static shared-renderer SVG is preserved inside a named image figure; absence is explicitly disclosed.' : 'Visible text renders the authored input fragment without implying an executed chart.'], compatibility: preview ? `Recipe over VizAreaPreview's static SVG mechanism. ${id} uses the existing ${VIZ_PREVIEW_TYPES[id as keyof typeof VIZ_PREVIEW_TYPES]} renderer; this is no new chart family. No pixels are invented when svg is absent.` : interactive ? `${VIZ_CONTROL_TITLES[id as typeof VIZ_CONTROL_IDS[number]]}: controls the public Cartesian viz.render fragment, not the legacy HTML placeholder's unimplemented styling fields. The consumer supplies rows and calls the renderer. Opacity uses six bounded presets; fields/colors/scale/chart type preserve sibling input bindings. No consumer action is executed by this component.` : 'Read-only recipe renders the same Cartesian viz.render input fragment. Missing bindings remain disclosed; renderer defaults are not fabricated as authored values.' };
  if (interactive) {
    const controlId = id as typeof VIZ_CONTROL_IDS[number]; const value = defaultVizIntent(controlId); const first = vizControlFields(controlId)[0]!;
    const target = `${first.type === 'select' ? 'select' : 'input'}[name="${first.key}"]`;
    const next = first.type === 'select' ? first.key === 'opacity' ? '0.4' : 'area' : String((value.encodings as any)[first.key.split('.')[0]].field) + 'x';
    const changed = editVizIntent(value, first, next).value;
    if (!changed) throw new Error(`Missing change ${id}`);
    const event = [{ trigger: 'keyboard', target, key: 'Tab', effect: { kind: 'focus' } }, first.type === 'select' ? { trigger: 'pointer', target, action: 'select', value: next, effect: { kind: 'event', value: changed } } : { trigger: 'keyboard', target, key: 'x', effect: { kind: 'event', value: changed } }];
    behaviors[id] = { role: first.type === 'select' ? 'combobox' : 'textbox', name: { strategy: 'label', target }, keyboard: { Tab: 'Focus the labelled chart input', ...(first.type === 'select' ? {} : { x: 'Edit the declared field name' }) }, interaction: 'interactive', event };
    scenarios.push({ id, oodsComponentId: id, props: { value }, slots: {}, initialState: value, renderExpectation: { name: 'change', trigger: first.type === 'select' ? `choose ${next}` : 'append x to the first field', expected: JSON.stringify(changed) }, assertions: ['emitted payload is a typed public input fragment', 'untouched sibling bindings are preserved', 'labels name native controls'] });
  } else {
    behaviors[id] = { role: preview ? 'img' : badge ? 'none' : 'region', name: { strategy: badge ? 'none' : 'aria-label', target: `[data-oods-component="${id}"]` }, keyboard: {}, interaction: 'none', event: [], interactionReason: `${id} displays an authored chart input or rendered static SVG and owns no focusable control or consumer action.` };
    const sample = previewSamples.samples[id];
    const props = preview ? { svg: sample.svg, title: sample.input.name, description: sample.input.description, width: 360, height: 200 } : { value: defaultVizIntent(id as typeof VIZ_SUMMARY_IDS[number]) };
    scenarios.push({ id, oodsComponentId: id, props, slots: {}, initialState: { authored: true }, renderExpectation: { name: 'render', trigger: 'mount the authored fragment or shared-renderer SVG', expected: preview ? `SVG bytes hash ${sample.svgHash}` : JSON.stringify(props.value) }, assertions: preview ? ['static SVG bytes are preserved', 'figure is named', 'sample is generated by public viz.render'] : ['authored binding values remain readable', 'no interactive chart action is implied'] });
  }
}
function insert(file: string, anchor: string, text: string) { const source = fs.readFileSync(file, 'utf8'); if (!source.includes(anchor)) throw new Error(file); fs.writeFileSync(file, source.replace(anchor, anchor + '\n' + text)); }
const entries = (object: Record<string, unknown>) => Object.entries(object).map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`).join('\n');
insert('packages/component-contracts/src/contracts.ts', 'const authoredContracts: Readonly<Record<NucleusComponentId, ComponentContract>> = {', entries(contracts));
insert('packages/component-contracts/src/behaviors.ts', 'export const componentBehaviors = {', entries(behaviors));
insert('packages/component-contracts/src/scenarios.ts', "const authoredScenarios: readonly Omit<SharedScenario, 'interaction' | 'interactionReason' | 'event'>[] = [", scenarios.map(value => `  ${JSON.stringify(value)},`).join('\n'));
const typeFile = 'packages/component-contracts/src/types.ts'; const types = fs.readFileSync(typeFile, 'utf8');
fs.writeFileSync(typeFile, types.replace(/export const NUCLEUS_COMPONENT_IDS = \[([\s\S]*?)\] as const;/, (_, body) => `export const NUCLEUS_COMPONENT_IDS = [\n${[...body.matchAll(/'([^']+)'/g)].map((match: RegExpMatchArray) => match[1]).concat(ids).sort().map((id: string) => `  '${id}',`).join('\n')}\n] as const;`));
const summary = { controls: VIZ_CONTROL_IDS, summaries: VIZ_SUMMARY_IDS, previews: VIZ_PREVIEW_TYPES };
fs.writeFileSync('artifacts/product-reality/sprint-193/m05/authored-roots.json', JSON.stringify(summary, null, 2) + '\n');
