import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { componentContracts } from '../../packages/component-contracts/dist/index.js';
import { CANONICAL_ADVERTISED_SCOPE } from './s184-m07-reconnect.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'artifacts/product-reality/sprint-185/m02');
const base = '8fd78b25';
const schemaDirectory = 'artifacts/product-reality/sprint-183/m04/saved-schema-store';
const schemas = [
  'cmos-messages-redesign', 'plan-form-dark', 'pt-shop-parts-entry-router-v1',
  'user-card-showcase', 'cmos-dashboard-redesign', 'the-academy-landing-v1',
];
const renderers = {
  DetailHeader: { name: 'renderDetailHeader', consumedProps: ['title', 'label', 'text', 'subtitle', 'sublabel', 'description', 'metadata', 'meta', 'level'] },
  CardHeader: { name: 'renderCardHeader', consumedProps: ['title', 'label', 'text', 'supporting', 'supportingText', 'subtitle', 'description', 'level'] },
  ColorSwatch: { name: 'renderColorSwatch', consumedProps: ['color', 'value', 'state', 'label'] },
  ColorizedBadge: { name: 'renderColorizedBadge', consumedProps: ['label', 'text', 'state', 'value', 'status', 'variant', 'tone', 'intent', 'color', 'hue', 'swatch'] },
  VizAreaPreview: { name: 'renderVizPreview', consumedProps: ['width', 'height'] },
};
const measurements = Object.fromEntries(Object.keys(renderers).map(id => [id, []]));
const operands = schemas.map(name => {
  const relativePath = `${schemaDirectory}/${name}.json`;
  const bytes = fs.readFileSync(path.join(root, relativePath));
  const saved = JSON.parse(bytes.toString());
  function walk(value, pointer) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach((child, index) => walk(child, `${pointer}/${index}`));
      return;
    }
    const record = value;
    if (typeof record.component === 'string' && measurements[record.component]) {
      measurements[record.component].push({ schema: name, pointer, nodeId: record.id, props: record.props ?? {}, bindings: record.bindings ?? {} });
    }
    Object.entries(record).forEach(([key, child]) => walk(child, `${pointer}/${key}`));
  }
  walk(saved.schema, '/schema');
  return { name, path: relativePath, sha256: createHash('sha256').update(bytes).digest('hex'), createdAt: saved.createdAt };
});
const rendererPath = 'packages/mcp-server/src/render/component-map.ts';
const rendererSource = fs.readFileSync(path.join(root, rendererPath), 'utf8');
const components = Object.entries(renderers).map(([id, renderer]) => {
  const start = rendererSource.indexOf(`function ${renderer.name}(`);
  if (start < 0) throw new Error(`Missing renderer ${renderer.name}`);
  const end = rendererSource.indexOf('\nfunction ', start + 1);
  const source = rendererSource.slice(start, end < 0 ? undefined : end);
  const contract = componentContracts[id];
  if (!contract) throw new Error(`Missing resulting contract ${id}`);
  return {
    componentId: id,
    schemaNodes: measurements[id],
    htmlReference: { path: rendererPath, symbol: renderer.name, line: rendererSource.slice(0, start).split('\n').length, sha256: createHash('sha256').update(source).digest('hex'), consumedProps: renderer.consumedProps },
    contract,
  };
});
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
fs.mkdirSync(output, { recursive: true });
const write = (name, value) => fs.writeFileSync(path.join(output, name), `${JSON.stringify(value, null, 2)}\n`);
write('contract-record.json', {
  mission: 's185-m02', baseCommit: git('rev-parse', base), operands, components,
  decisions: [
    'Props combine saved-schema operands with the existing HTML renderer aliases. field stays generic; fieldValueKind/acceptedFieldKinds are unchanged. Decision #1734 adds an explicit read-only DetailHeader field subscription to the existing local writer, preserving the measured onChange binding without a header event or extra state.',
    'as is a measured schema prop and explicitly selects a native heading in the new targets; the HTML helper itself only reads level and is unchanged.',
    'ColorizedBadge keeps the mission-pinned eleven props; the generic HTML helper also accepts intent as a variant alias, which was not measured on the target nodes and is not introduced into the new contract. emphasis is inherited from the governed Badge substrate.',
    'VizAreaPreview is a frame: renders no chart pixels; not visualization evidence.',
  ],
});
write('advertised-movers.json', {
  mission: 's185-m02', baseCommit: git('rev-parse', base), comparison: 'm01 head to m02 working tree',
  canonicalAdvertisedScope: CANONICAL_ADVERTISED_SCOPE,
  paths: git('diff', '--name-only', base, '--', ...CANONICAL_ADVERTISED_SCOPE).split('\n').filter(Boolean),
  purpose: 'Input to m05 only; m05 recomputes one sprint-wide advertised-surface diff.',
});
console.log(`Recorded ${components.length} contracts from ${operands.length} immutable saved schemas at ${output}`);
