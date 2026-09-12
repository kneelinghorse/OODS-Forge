import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  generateToolSpecs, loadToolSpecSources, parseDispatchSchemas, parseToolSpecsArgs, renderSchema, renderToolSpecs, renderRetiredTools,
  TOOL_SPECS_PATH, type Schema,
} from '../../../../scripts/docs/generate-tool-specs.js';

const root = path.resolve(import.meta.dirname, '../../../..');
const sources = loadToolSpecSources(root);
const names = [...sources.registry.auto, ...sources.registry.onDemand];
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');
const document = read(TOOL_SPECS_PATH);
const temporary: string[] = [];
afterEach(() => { for (const directory of temporary.splice(0)) fs.rmSync(directory, { recursive: true, force: true }); });
function fixture(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-tool-specs-'));
  temporary.push(directory);
  for (const relative of [
    'packages/mcp-server/src/index.ts', 'packages/mcp-server/src/tools/registry.json',
    'packages/mcp-server/src/schemas', 'packages/mcp-server/src/security/policy.json',
    'packages/mcp-adapter/tool-descriptions.json', 'packages/mcp-server/registry/tool-capability-ledger.v1.json',
    'packages/component-contracts/registry/component-capability-ledger.v1.json', TOOL_SPECS_PATH,
  ]) {
    fs.mkdirSync(path.dirname(path.join(directory, relative)), { recursive: true });
    fs.cpSync(path.join(root, relative), path.join(directory, relative), { recursive: true });
  }
  return directory;
}
function section(tool: string): string {
  return document.split(`### \`${tool}\``)[1]!.split('\n### ')[0];
}

describe('Tool-Specs generated from dispatched contracts (s196 m04)', () => {
  it('keeps the exact live roster, gated count sentences and resolving grouped API links', () => {
    expect([...document.matchAll(/^### `([^`]+)`$/gm)].map(match => match[1])).toEqual(names);
    expect(names).toHaveLength(24);
    for (const sentence of [
      `Auto tools are registered by default (${sources.registry.auto.length} at the time of writing). On-demand tools are only registered when enabled (${sources.registry.onDemand.length} at the time of writing).`,
      `## Auto tool contracts (${sources.registry.auto.length} registry entries)`,
      `The ${sources.registry.auto.length} default entries come from \`packages/mcp-server/src/tools/registry.json\`.`,
      `## On-demand tool contracts (${sources.registry.onDemand.length} registry entries)`,
      `The ${sources.registry.onDemand.length} on-demand entries come from \`packages/mcp-server/src/tools/registry.json\`.`,
    ]) expect(document).toContain(sentence);
    const links = [...document.matchAll(/\]\((\.\.\/api\/[^)]+)\)/g)].map(match => match[1]);
    expect(links.length).toBeGreaterThan(10);
    for (const target of links) expect(fs.existsSync(path.resolve(root, 'docs/mcp', target)), target).toBe(true);
    for (const family of ['map', 'schema', 'object', 'repl']) expect(links).toContain(`../api/${family}.md`);
  });

  it('includes every adapter description verbatim and every one of the 119 actual root input properties', () => {
    let inputs = 0;
    for (const name of names) {
      const body = section(name);
      expect(body).toContain(sources.descriptions[name]);
      for (const direction of ['input', 'output'] as const) {
        const file = sources.dispatch[name][direction];
        const schema = sources.schemas[file];
        const contract = body.split(`#### ${direction === 'input' ? 'Input' : 'Output'} contract`)[1].split('\n#### ')[0];
        expect(contract).toContain(`](../../${file})`);
        for (const property of Object.keys(schema.properties ?? {})) {
          expect(contract, `${name} ${direction} ${property}`).toContain(`| \`${property}\` |`);
          if (direction === 'input') inputs++;
        }
      }
    }
    expect(inputs).toBe(119); // The handoff's 118 was stale; dispatch measurement is the denominator.
    expect(document).toContain('119 root input parameters');
    expect(sources.dispatch['diag.snapshot'].input).toBe('packages/mcp-server/src/schemas/generic.input.json');
    expect(sources.dispatch['tokens.build'].output).toBe('packages/mcp-server/src/schemas/generic.output.json');
  });

  it('expands every grouped action body and union output, including referenced map output fields', () => {
    for (const name of ['map', 'schema', 'object', 'repl']) {
      const input = sources.schemas[sources.dispatch[name].input];
      for (const branch of input.allOf!) {
        const action = branch.if!.properties!.action.const;
        const body = section(name).split(`action: \`"${action}"\``)[1];
        expect(body, `${name}/${action}`).toBeDefined();
        for (const property of Object.keys(branch.then!.properties!)) expect(body.split('\n#### Output')[0]).toContain(`| \`${property}\` |`);
      }
      const output = sources.schemas[sources.dispatch[name].output];
      output.anyOf!.forEach((branch, index) => {
        const body = section(name).split(`##### Output anyOf[${index}]`)[1];
        expect(body).toBeDefined();
        const resolved = branch.$ref
          ? (output.$defs as Record<string, Schema>)[branch.$ref.split('/').at(-1)!]
          : branch.type === 'array' ? branch.items! : branch;
        for (const property of Object.keys(resolved.properties ?? {})) expect(body).toContain(`| \`${property}\` |`);
      });
    }
    expect(section('schema')).toContain('This response is a bare array. Item fields:');
    expect(section('map')).toContain('| `conflictArtifactPath` |');
    expect(section('repl')).toContain('"mode":{"const":"patch"}');
    expect(section('repl')).toContain('Required keys in this branch: `"patch"`, `"baseTree"`.');
  });

  it('does not call alternative parameters unconditionally required', () => {
    const schema: Schema = {
      type: 'object', properties: { action: { type: 'string' }, inline: { type: 'object' }, reference: { type: 'string' } },
      required: ['action'], oneOf: [{ required: ['inline'], not: { required: ['reference'] } }, { required: ['reference'], not: { required: ['inline'] } }],
    };
    const rendered = renderSchema(schema, 'test.json', { 'test.json': schema }, 'Input');
    expect(rendered).toContain('| `inline` | object | No |');
    expect(rendered).toContain('| `reference` | string | No |');
    expect(rendered).toContain('| `action` | string | Yes |');
    expect(rendered).toContain('oneOf: exactly one branch must match.');
    expect(rendered).toContain('Must not match: `{"required":["reference"]}`.');
    expect(section('design.compose')).toContain('| `intent` | string | No |');
    expect(section('design.compose')).toContain('anyOf: at least one branch must match.');
  });

  it('binds proof scope, portable codes and current surface counts to their ledgers', () => {
    expect(document).toContain(sources.ledger.methodology.proofTier);
    expect(document).toContain(sources.ledger.portableExecution.sha256);
    expect(document).toContain('17 pass and 2 typed dependency outcomes');
    expect(document).toContain('dirty=`true`');
    for (const row of sources.ledger.rows) {
      const body = section(row.name);
      expect(body).toContain(`Proof tier: \`"${row.proofTier}"\``);
      for (const limit of row.portableLimits) {
        expect(body).toContain(limit.blocker);
        expect(body).toContain(limit.code);
        expect(body).toContain(`retryable=\`${limit.retryable}\``);
      }
      for (const caveat of row.caveats) expect(body).toContain(caveat.reason);
    }
    for (const retired of sources.ledger.retired) expect(document).toContain(retired.reason);
    expect(document.split('<!-- tool-retirements:start -->\n')[1].split('\n<!-- tool-retirements:end -->')[0]).toBe(renderRetiredTools(sources.ledger.retired));
    expect(document).toContain('| `"react"` | `"implemented-evidence-complete"` | 109 |');
    expect(document).toContain('| `"vue"` | `"implemented-evidence-complete"` | 109 |');
    expect(document).toContain('approvedRuntimeCensus=`null`');
    expect(document).not.toContain('75 React/Vue implementations');
  });

  it.each([
    ['root property', (copy: typeof sources) => { copy.schemas[copy.dispatch['diag.snapshot'].input].properties!.newCallerOption = { type: 'boolean', description: 'A newly supported caller option' }; }],
    ['action property', (copy: typeof sources) => { copy.schemas[copy.dispatch.map.input].allOf![0].then!.properties!.newActionOption = { type: 'string' }; }],
    ['union output', (copy: typeof sources) => { copy.schemas[copy.dispatch.object.output].anyOf![0].properties!.newResponseField = { type: 'integer' }; }],
    ['description', (copy: typeof sources) => { copy.descriptions.health += ' New advertised health behavior.'; }],
    ['portable limit', (copy: typeof sources) => { copy.ledger.rows.find(row => row.name === 'brand.apply')!.portableLimits[0].code = 'OODS-N999'; }],
    ['proof tier', (copy: typeof sources) => { copy.ledger.rows[0].proofTier = 'none'; }],
    ['retired tool', (copy: typeof sources) => { copy.ledger.retired.push({ name: 'retired.fixture', reason: 'Retirement must change the published roster.', decisionIds: [9999] }); }],
    ['surface count', (copy: typeof sources) => { copy.components.rows[0].surfaces.react.state = 'unavailable'; }],
  ] as const)('changes the generated contract when %s truth changes', (_name, mutate) => {
    const copy = structuredClone(sources);
    mutate(copy);
    expect(renderToolSpecs(copy)).not.toBe(document);
  });

  it('reads actual dispatcher mappings despite quotes, comments and property order; rejects opaque mappings', () => {
    const parsed = parseDispatchSchemas('const toolSpecs = { "fixture": { /* source mapping */ outputSchema: "./schemas/generic.output.json", modulePath: "./tools/fixture.js", inputSchema: "./schemas/generic.input.json" } };');
    expect(parsed.fixture).toEqual({ input: 'packages/mcp-server/src/schemas/generic.input.json', output: 'packages/mcp-server/src/schemas/generic.output.json' });
    expect(() => parseDispatchSchemas('const toolSpecs = loadTools();')).toThrow('literal object');
    expect(() => parseDispatchSchemas('const toolSpecs = { ...other };')).toThrow('Nonliteral tool mapping');
    const copy = structuredClone(sources);
    copy.dispatch['tokens.build'].output = 'packages/mcp-server/src/schemas/health.output.json';
    expect(renderToolSpecs(copy).split('### `tokens.build`')[1].split('\n### ')[0]).toContain('| `productReality` |');
  });

  it('fails loudly for missing source contracts instead of silently omitting a tool', () => {
    for (const mutate of [
      (copy: typeof sources) => { delete copy.dispatch.health; },
      (copy: typeof sources) => { delete copy.descriptions.health; },
      (copy: typeof sources) => { delete copy.schemas[copy.dispatch.health.output]; },
      (copy: typeof sources) => { copy.ledger.rows.pop(); },
    ]) {
      const copy = structuredClone(sources); mutate(copy);
      expect(() => renderToolSpecs(copy)).toThrow();
    }
    expect(() => renderSchema({ $ref: '#/$defs/missing' }, 'test.json', { 'test.json': {} }, 'Output')).toThrow('Unresolved schema reference');
  });

  it('checks freshness without writes and detects description drift until regeneration', () => {
    const directory = fixture();
    const doc = path.join(directory, TOOL_SPECS_PATH);
    const before = fs.readFileSync(doc, 'utf8');
    generateToolSpecs(directory, true);
    const descriptionPath = path.join(directory, 'packages/mcp-adapter/tool-descriptions.json');
    const descriptions = JSON.parse(fs.readFileSync(descriptionPath, 'utf8'));
    descriptions.health += ' Caller-visible mutation.';
    fs.writeFileSync(descriptionPath, JSON.stringify(descriptions));
    expect(() => generateToolSpecs(directory, true)).toThrow('is stale');
    expect(fs.readFileSync(doc, 'utf8')).toBe(before);
    generateToolSpecs(directory);
    expect(fs.readFileSync(doc, 'utf8')).toContain('Caller-visible mutation.');
    generateToolSpecs(directory, true);
  });

  it('retains authored usage notes but rejects notes orphaned by retirement', () => {
    const directory = fixture();
    const notes = path.join(directory, 'docs/mcp/tool-notes');
    fs.mkdirSync(notes, { recursive: true });
    fs.writeFileSync(path.join(notes, 'health.md'), 'Use this check before a design session.\n');
    expect(renderToolSpecs(loadToolSpecSources(directory))).toContain('Use this check before a design session.');
    fs.writeFileSync(path.join(notes, 'retired.fixture.md'), 'Stale tool instructions.\n');
    expect(() => loadToolSpecSources(directory)).toThrow('Orphan tool note');
  });

  it('supports an isolated repository root and rejects ambiguous CLI arguments', () => {
    expect(parseToolSpecsArgs(['--', '--check', '--root', '/tmp/isolated-forge'])).toEqual({ root: '/tmp/isolated-forge', check: true });
    expect(() => parseToolSpecsArgs(['--root'])).toThrow('requires a repository path');
    expect(() => parseToolSpecsArgs(['--root', '--check'])).toThrow('requires a repository path');
    expect(() => parseToolSpecsArgs(['--chek'])).toThrow('Unknown argument');
  });

  it('is byte-for-byte fresh from current source without timestamps or current-HEAD substitutions', () => {
    expect(renderToolSpecs(sources)).toBe(document);
    generateToolSpecs(root, true);
  });
});
