import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { load as yaml, dump } from 'js-yaml';
import { beforeAll, describe, expect, it } from 'vitest';
import { collectFacts, generateClaims, interpolate, parseArguments, renderDocuments, renderMarkedClaims, ROOT, TEMPLATE_PATH, type Facts, type Templates } from '../../scripts/docs/generate-forge-claims.js';

const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const templates = JSON.parse(read(TEMPLATE_PATH)) as Templates;
const documents = Object.fromEntries(Object.keys(templates).map(file => [file, read(file)]));
// A removal or a new unreviewed marker must not silently reduce the governed scope.
const CLAIM_KEYS: Record<string, string[]> = {
  'docs/how-forge-works.html': [
    'trait-nav', 'object-nav', 'tool-flow', 'trait-format', 'trait-states', 'trait-title', 'trait-roster', 'domain-traits',
    'product-fields', 'product-parameter-type', 'composer-semantics', 'product-contributions', 'object-title', 'object-roster',
    'object-homes', 'context-roster', 'region-roster', 'view-assembly', 'renderer-layouts', 'component-counts', 'token-outputs',
    'token-themes', 'token-brands', 'token-guards', 'generation-path', 'ui-schema-shape', 'compose-tool', 'validate-tool',
    'codegen-tool', 'schema-lifetime', 'product-screen', 'fidelity-and-datasets', 'portable-outcomes', 'viz-taxonomy',
    'viz-vocabulary', 'dashboard-vocabulary', 'certify-pillars', 'a11y-rule-count', 'determinism-scope', 'contrast-thresholds',
    'accuracy-rule-count', 'certify-scope', 'token-contrast', 'browser-viewports', 'operating-roster', 'tool-roster', 'safety-model',
    'generation-targets', 'native-token-scope', 'footer', 'reference-label', 'state-machine-cardinality', 'stateful-extension-example',
    'source-example-6', 'source-example-5', 'source-example-4', 'source-example-3', 'source-example-2', 'source-example-1',
    'release-evidence-limit', 'object-chart-runtime-limit',
  ],
  'docs/mcp/Connections.md': ['adapter-environment', 'adapter-features', 'fresh-install-count', 'bridge-default', 'smoke-tool-count', 'bridge-profile-3', 'bridge-port', 'bridge-api-url', 'smoke-defaults', 'smoke-timeout'],
  'docs/README.md': ['subscription-example', 'canonical-regions', 'context-inventory', 'token-architecture', 'quintet-example'],
  'README.md': ['tool-surface', 'schema-ttl'],
  'packages/mcp-server/README.md': ['$document'],
  'packages/mcp-bridge/README.md': ['$document'],
};

describe('generated Forge claims remain tied to their measured sources (s196)', () => {
  let facts: Facts;
  beforeAll(async () => { facts = await collectFacts(); });

  it('pins every claim key and the entire text of every marked span and generated README', () => {
    expect(Object.keys(templates).sort()).toEqual(Object.keys(CLAIM_KEYS).sort());
    for (const [file, keys] of Object.entries(CLAIM_KEYS)) expect(Object.keys(templates[file]).sort(), file).toEqual([...keys].sort());
    expect(renderDocuments(facts, templates, documents)).toEqual(documents);
  });

  it('detects an independently edited claim for every marker, including seemingly small count and roster edits', () => {
    for (const [file, claims] of Object.entries(templates)) {
      if ('$document' in claims) {
        expect(renderDocuments(facts, templates, { ...documents, [file]: `${documents[file]}\nUnmeasured claim.\n` })[file]).not.toEqual(`${documents[file]}\nUnmeasured claim.\n`);
        continue;
      }
      for (const key of Object.keys(claims)) {
        const marker = `<!-- forge-claim:${key} -->`;
        const changed = documents[file].replace(marker, `${marker}unmeasured `);
        expect(renderMarkedClaims(changed, claims, facts), `${file}:${key}`).not.toEqual(changed);
      }
    }
  });

  it('refuses removed, duplicated, unknown, mismatched and nested markers instead of dropping coverage', () => {
    const content = '<!-- forge-claim:count -->wrong<!-- /forge-claim:count -->';
    const claims = { count: '{{tools}}' };
    expect(() => renderMarkedClaims('', claims, facts)).toThrow('Missing claim marker');
    expect(() => renderMarkedClaims(content + content, claims, facts)).toThrow('Duplicate claim marker');
    expect(() => renderMarkedClaims(content.replaceAll('count', 'unknown'), claims, facts)).toThrow('Unknown claim marker');
    expect(() => renderMarkedClaims(content.replace('/forge-claim:count', '/forge-claim:other'), claims, facts)).toThrow('Missing claim marker');
    expect(() => renderMarkedClaims(content.replace('wrong', '<!-- forge-claim:count -->nested<!-- /forge-claim:count -->'), claims, facts)).toThrow('Malformed or nested');
    expect(() => interpolate('{{madeUpCounter}}', facts)).toThrow('Unknown claim fact');
  });

  it('distinguishes definitions from public identities and includes the formerly missing visualization traits', () => {
    expect(facts).toMatchObject({ traits: 46, vizTraits: 21, objectDefinitions: 19, objectNames: 18 });
    const html = documents['docs/how-forge-works.html'];
    for (const name of ['EncodingOpacity', 'EncodingShape', 'ScatterPlot', 'Geocodable', 'MarkGraph']) expect(String(facts.traitRows)).toContain(`<td>${name} `);
    expect(String(facts.objectRows)).toContain('objects/core/Subscription.object.yaml');
    expect(String(facts.objectRows)).toContain('domains/saas-billing/objects/Subscription.object.yaml');
    expect(html).toContain('19 object definitions / 18 unique names');
    expect(html).not.toContain('~100 catalogued components');
    expect(String(facts.traitRows).match(/<tr><td>/g)).toHaveLength(46);
    expect(String(facts.objectRows).match(/<tr><td>/g)).toHaveLength(19);
  });

  it('pins the Product example including its s198 read-only field summaries', () => {
    // This operand is intentionally fixed: changing its output changes the public tutorial.
    expect(facts).toMatchObject({ productNodes: 55, productSlots: 10, productTabs: 8, productFields: 38 });
    expect(documents['docs/how-forge-works.html']).toContain('55-node tree with 10 filled slots and 8 tabs expanded from Product\'s 38 fields');
    expect(documents['docs/how-forge-works.html']).not.toContain('31-node tree');
    expect(String(facts.productSlotRoster).split('; ')).toHaveLength(10);
    const example = yaml(String(facts.subscriptionExample)) as { traits: Array<{ name: string }> };
    const canonical = yaml(read('objects/core/Subscription.object.yaml')) as typeof example;
    expect(example.traits).toEqual(canonical.traits.map(({ name }) => ({ name })));
    expect(example.traits).toHaveLength(6);
  });

  it('derives portable outcomes from rows and keeps reference-app coverage separate', () => {
    const ledger = JSON.parse(read('packages/mcp-server/registry/tool-capability-ledger.v1.json'));
    const portable = ledger.rows.filter((row: { portableOutcome?: unknown }) => row.portableOutcome);
    expect(facts.portableTools).toBe(portable.length);
    expect(facts).toMatchObject({ portablePass: 17, portableTyped: 2, releaseCells: 42, releaseEqual: 42, scenarios: 110 });
    for (const file of ['docs/how-forge-works.html', 'packages/mcp-server/README.md', 'packages/mcp-bridge/README.md']) {
      expect(documents[file]).toContain('brand.apply (OODS-N020) and design.preview (OODS-N019)');
      expect(documents[file]).toContain('42');
      expect(documents[file]).not.toContain('loses the native error code');
      expect(documents[file]).not.toContain('readiness evidence files are omitted');
    }
    const changed = renderDocuments({ ...facts, portablePass: 16, portableTyped: 3, releaseCells: 40 }, templates, documents);
    expect(changed['docs/how-forge-works.html']).toContain('16 return the exercised result and 3 retain typed dependency limits');
    expect(changed['packages/mcp-server/README.md']).toContain('40 cells');
  });

  it('ties source numeric defaults to the generated operating instructions', () => {
    expect(facts).toMatchObject({ runtimePriority: 0, viewPriority: 50, tabletWidth: 768, phoneWidth: 375, bridgePort: 4466, bridgeTimeout: 120000, statefulDetailPriority: 40, ttlMinutes: 30 });
    const changed = renderDocuments({ ...facts, bridgePort: 4455, tabletWidth: 800, ttlMinutes: 45 }, templates, documents);
    expect(changed['docs/how-forge-works.html']).toContain('800px container');
    expect(changed['docs/mcp/Connections.md']).not.toContain('4466');
    expect(changed['packages/mcp-bridge/README.md']).toContain('127.0.0.1:4455');
    expect(changed['README.md']).toContain('last 45 minutes');
  });

  it('runs --check without rewriting any governed document', async () => {
    expect(await generateClaims(true)).toEqual([]);
    for (const file of Object.keys(documents)) expect(read(file)).toEqual(documents[file]);
  });

  it('rejects misspelled check switches and incomplete roots before a write mode can start', () => {
    expect(parseArguments(['--', '--check', '--root', ROOT])).toEqual({ check: true, root: ROOT });
    for (const args of [['--chek'], ['--root'], ['--root', '--check'], ['--root', ROOT, '--root', ROOT], ['unexpected']]) expect(() => parseArguments(args)).toThrow();
  });

  it('--root imports the target copy: mutating its Product source changes its generated field count only', () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-claims-source-'));
    try {
      for (const name of ['src', 'packages', 'scripts', 'traits', 'objects', 'domains', 'schemas', 'configs', 'docs', 'tools', '.storybook']) {
        fs.cpSync(path.join(ROOT, name), path.join(target, name), { recursive: true, filter: source => !source.split(path.sep).includes('node_modules') });
      }
      fs.cpSync(path.join(ROOT, 'artifacts/structured-data'), path.join(target, 'artifacts/structured-data'), { recursive: true });
      for (const name of ['package.json', 'tsconfig.json', 'README.md']) fs.copyFileSync(path.join(ROOT, name), path.join(target, name));
      fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(target, 'node_modules'), 'dir');
      const run = (...flags: string[]) => spawnSync(process.execPath, ['--import', 'tsx', path.join(ROOT, 'scripts/docs/generate-forge-claims.ts'), '--root', target, ...flags], { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
      const initial = run('--check');
      expect(initial.status, initial.stderr).toBe(0);
      const productPath = path.join(target, 'objects/core/Product.object.yaml');
      const product = yaml(fs.readFileSync(productPath, 'utf8')) as { schema: Record<string, unknown> };
      product.schema.claim_probe_field = { type: 'string', required: false };
      fs.writeFileSync(productPath, dump(product));
      const stale = run('--check');
      expect(stale.status, stale.stderr).toBe(1);
      expect(stale.stderr).toContain('Forge claims are stale:');
      const generated = run();
      expect(generated.status, generated.stderr).toBe(0);
      expect(fs.readFileSync(path.join(target, 'docs/how-forge-works.html'), 'utf8')).toContain('39 fields for Product');
      expect(read('docs/how-forge-works.html')).toContain('38 fields for Product');
      expect(read('objects/core/Product.object.yaml')).not.toContain('claim_probe_field');
      expect(run('--check').status).toBe(0);
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  }, 120000);
});
