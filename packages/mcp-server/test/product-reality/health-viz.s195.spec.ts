import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAjv } from '../../src/lib/ajv.js';
import { projectVizSummary, readVizSummary, type VizTaxonomy } from '../../src/lib/viz-taxonomy.js';
import { handle as health } from '../../src/tools/health.js';
import { repositoryRoot, wire } from '../helpers/wire-boundary.js';

const source = path.join(repositoryRoot, 'packages/viz-core/src/registry');
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(source, name), 'utf8'));
const expected = { types: 13, patterns: 21, families: 8, classified: 34, coreCells: 20, coreSurfaceComplete: 13, typedGaps: 7 };
const classification = () => read('viz-classification.v1.json');
const taxonomy = (): VizTaxonomy => read('viz-taxonomy.v1.json');
const patterns = () => read('viz-patterns.v1.json');
const mutate: Array<[string, (value: VizTaxonomy) => void]> = [
  ['unsupported version', value => { (value as any).schemaVersion = 2; }],
  ['duplicate identity', value => { value.identities[0] = structuredClone(value.identities[1]); }],
  ['missing identity with recomputed total', value => { value.identities.pop(); value.summary.classified -= 1; value.summary.patterns -= 1; }],
  ['invented identity', value => { value.identities[0].id = 'invented-chart'; }],
  ['wrong family', value => { value.identities[0].family = 'scientific'; }],
  ['wrong role', value => { value.identities.find(identity => identity.role === 'core')!.role = 'extension'; }],
  ['wrong identity kind', value => { value.identities[0].kind = 'pattern'; }],
  ['missing pattern provenance', value => { delete value.identities.find(identity => identity.kind === 'pattern')!.specSha256; }],
  ['missing family', value => { value.families.pop(); value.summary.families -= 1; }],
  ['invented family definition', value => { value.families[0].definition = 'Invented definition.'; }],
  ['duplicate core cell', value => { value.coreCells[0] = structuredClone(value.coreCells[1]); }],
  ['missing gap with recomputed total', value => { value.coreCells.splice(value.coreCells.findIndex(cell => cell.status === 'typed-gap'), 1); value.summary.coreCells -= 1; value.summary.typedGaps -= 1; }],
  ['wrong family backing', value => { value.coreCells.find(cell => cell.status === 'surface-complete')!.identities = ['flow_map']; }],
  ['gap without reason', value => { delete value.coreCells.find(cell => cell.status === 'typed-gap')!.reason; }],
  ['fabricated gap reason', value => { value.coreCells.find(cell => cell.status === 'typed-gap')!.reason = 'Unrecorded excuse.'; }],
  ['unsupported complete cell with recomputed summary', value => { const gap = value.coreCells.find(cell => cell.status === 'typed-gap')!; gap.status = 'surface-complete'; delete gap.reason; value.summary.coreSurfaceComplete += 1; value.summary.typedGaps -= 1; }],
  ['authoring pattern promoted to pixels', value => { value.identities.find(identity => identity.kind === 'pattern' && !identity.publicSvg)!.publicSvg = true; }],
  ['false measured type proof', value => { value.identities.find(identity => identity.kind === 'type')!.publicSvg = false; }],
  ['invented summary', value => { value.summary.classified = 99; }],
];

describe('health visualization taxonomy wire boundary (s195-m02)', () => {
  let temporary = '';
  let operand = '';
  beforeEach(() => {
    temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-health-viz-'));
    operand = path.join(temporary, 'viz-taxonomy.v1.json');
    fs.writeFileSync(operand, JSON.stringify(taxonomy()));
    vi.stubEnv('MCP_SCHEMA_STORE_ROOT', temporary);
    vi.stubEnv('MCP_VIZ_TAXONOMY_PATH', operand);
    vi.stubEnv('MCP_VIZ_CLASSIFICATION_PATH', path.join(source, 'viz-classification.v1.json'));
    vi.stubEnv('MCP_VIZ_PATTERN_REGISTRY_PATH', path.join(source, 'viz-patterns.v1.json'));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(temporary, { recursive: true, force: true });
  });

  it('serves the classified population and measured Core Profile through the real health handler', async () => {
    const result = wire('health', 'output', await health(wire('health', 'input', {})));
    expect(result.productReality.viz).toEqual(expected);
    expect(result.productReality.viz).toEqual(projectVizSummary(taxonomy(), classification(), patterns()));
    expect(result.productReality.viz).toEqual(readVizSummary());
    expect(result.warnings ?? []).not.toEqual(expect.arrayContaining([expect.stringContaining('viz taxonomy unavailable')]));
  });

  it.each(mutate)('does not advertise a count for %s', async (_name, change) => {
    const invalid = taxonomy();
    change(invalid);
    expect(() => projectVizSummary(invalid, classification(), patterns())).toThrow('Viz taxonomy rejected:');
    fs.writeFileSync(operand, JSON.stringify(invalid));
    const result = wire('health', 'output', await health(wire('health', 'input', {})));
    expect(result.status).toBe('degraded');
    expect(result.productReality.viz).toBeNull();
    expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('viz taxonomy unavailable')]));
  });

  it.each(['missing taxonomy', 'malformed taxonomy', 'missing classification', 'missing pattern registry'])('reports %s as unavailable without inventing zero counts', async scenario => {
    if (scenario === 'missing taxonomy') fs.rmSync(operand);
    else if (scenario === 'malformed taxonomy') fs.writeFileSync(operand, '{not json');
    else if (scenario === 'missing classification') vi.stubEnv('MCP_VIZ_CLASSIFICATION_PATH', path.join(temporary, 'absent-classification.json'));
    else vi.stubEnv('MCP_VIZ_PATTERN_REGISTRY_PATH', path.join(temporary, 'absent-pattern-registry.json'));
    const result = wire('health', 'output', await health(wire('health', 'input', {})));
    expect(result.status).toBe('degraded');
    expect(result.productReality.viz).toBeNull();
    expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('viz taxonomy unavailable')]));
  });

  it.each(['known-but-wrong base type', 'stale source hash', 'missing scope'])('does not advertise pattern counts from %s in the measured sibling registry', async mutation => {
    const invalid = patterns();
    if (mutation === 'known-but-wrong base type') invalid[0].baseChartType = invalid[0].baseChartType === 'bar' ? 'line' : 'bar';
    if (mutation === 'stale source hash') invalid[0].specSha256 = '0'.repeat(64);
    if (mutation === 'missing scope') invalid[0].scopes.pop();
    expect(() => projectVizSummary(taxonomy(), classification(), invalid)).toThrow('Viz taxonomy rejected:');
    const corrupted = path.join(temporary, 'corrupt-patterns.json');
    fs.writeFileSync(corrupted, JSON.stringify(invalid));
    vi.stubEnv('MCP_VIZ_PATTERN_REGISTRY_PATH', corrupted);
    const result = wire('health', 'output', await health(wire('health', 'input', {})));
    expect(result.status).toBe('degraded');
    expect(result.productReality.viz).toBeNull();
    expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('viz taxonomy unavailable')]));
  });

  it('requires all seven nonnegative census fields or explicit null at the output boundary', async () => {
    const result = await health({});
    const schema = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'packages/mcp-server/src/schemas/health.output.json'), 'utf8'));
    const validate = getAjv().compile(schema);
    for (const field of Object.keys(expected)) {
      const incomplete = structuredClone(result) as any;
      delete incomplete.productReality.viz[field];
      expect(validate(incomplete), `${field} must not silently disappear`).toBe(false);
      const negative = structuredClone(result) as any;
      negative.productReality.viz[field] = -1;
      expect(validate(negative), `${field} cannot be negative`).toBe(false);
    }
    const absent = structuredClone(result) as any;
    delete absent.productReality.viz;
    expect(validate(absent)).toBe(false);
    expect(validate({ ...result, productReality: { ...result.productReality, viz: null } })).toBe(true);
  });
});
