import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { VIZ_PATTERN_SOURCES, VIZ_RECIPES } from '@oods/viz-core';
import { canonicalPatternValue, validateVizPatternRegistry, type VizPatternCapability } from '../../../viz-core/src/registry/viz-patterns.js';
import {
  ROOT, PATTERN_DOC_PATH, PATTERN_REGISTRY_PATH,
  derivePatternRegistry, measurePatternCensus, renderPatternLibrary, writePatternOutputs, type PatternCensusObservations,
} from '../../../../scripts/product-reality/s195-pattern-census.js';

const read = (file: string) => readFileSync(join(ROOT, file), 'utf8');
const rows = (): VizPatternCapability[] => JSON.parse(read(PATTERN_REGISTRY_PATH));
/** Re-measured in Sprint 202 m01 when viz.render gained output.titlePlacement; the registry reproduced byte-for-byte. */
const PATTERN_OBSERVATIONS_PATH = 'artifacts/product-reality/sprint-202/m01/patterns/pattern-observations.json';
const observations = (): PatternCensusObservations => JSON.parse(read(PATTERN_OBSERVATIONS_PATH));
const classification = () => JSON.parse(read('packages/viz-core/src/registry/viz-classification.v1.json'));
const validate = (value: unknown) => validateVizPatternRegistry(value, VIZ_PATTERN_SOURCES, classification().assignments, VIZ_RECIPES.map(recipe => recipe.chartType));
const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
const freshRoot = () => {
  const root = mkdtempSync(join(tmpdir(), 'oods-pattern-census-'));
  roots.push(root);
  for (const file of ['packages/viz-core/src/registry/viz-classification.v1.json', 'packages/viz-core/src/registry/viz-recipes.v1.json', 'examples/viz/patterns-v2', 'packages/mcp-server/src/schemas/viz.render.input.json']) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    cpSync(join(ROOT, file), join(root, file), { recursive: true });
  }
  return root;
};

describe('the generated pattern registry retains exact source identity and public pixel evidence (s195 m03)', () => {
  it('contains exactly 23 classified source identities and four measured scopes per identity', () => {
    const registry = rows();
    expect(validate(registry)).toEqual(registry);
    expect(registry).toHaveLength(23);
    expect(registry.map(row => row.id)).toEqual(VIZ_PATTERN_SOURCES.map(source => source.id));
    expect(registry.flatMap(row => row.scopes)).toHaveLength(92);
    expect(registry.filter(row => row.publicSvg)).toHaveLength(22);
    expect(registry.filter(row => row.status === 'retired')).toHaveLength(1);
    for (const row of registry) {
      expect(row.family).toBe(classification().assignments.find((entry: any) => entry.id === row.id).family);
      expect(row.specSha256).toBe(createHash('sha256').update(read(row.specPath)).digest('hex'));
      expect(row.baseChartType).toBe(VIZ_PATTERN_SOURCES.find(source => source.id === row.id)!.baseChartType);
    }
  });

  it('remeasures all supported scopes and every authoring-only rejection through the real handlers', async () => {
    const current = derivePatternRegistry(await measurePatternCensus());
    expect(canonicalPatternValue(current)).toBe(canonicalPatternValue(rows()));
  }, 120_000);

  it('reproduces registry and documentation from frozen observations with --check', () => {
    expect(JSON.stringify(derivePatternRegistry(observations()), null, 2) + '\n').toBe(read(PATTERN_REGISTRY_PATH));
    expect(renderPatternLibrary(rows())).toBe(read(PATTERN_DOC_PATH));
    const result = execFileSync(process.execPath, ['--import', 'tsx', 'scripts/product-reality/s195-pattern-census.ts', '--check', '--observations', PATTERN_OBSERVATIONS_PATH], { cwd: ROOT, encoding: 'utf8' });
    expect(JSON.parse(result)).toMatchObject({ identities: 23, cells: 92, public: 22, authoringOnly: 0, retired: 1 });
  });

  it.each(['missing-row', 'duplicate-row', 'source-hash', 'family', 'known-but-wrong-base-type', 'scope', 'missing-pixels', 'missing-normalized-hash', 'invented-public-status', 'different-certify-operand'])(
    'rejects %s before health can advertise the pattern proof', mutation => {
      const registry = rows();
      const publicRow = registry.find(row => row.publicSvg)!;
      if (mutation === 'missing-row') registry.pop();
      if (mutation === 'duplicate-row') registry[0] = structuredClone(registry[1]!);
      if (mutation === 'source-hash') registry[0]!.specSha256 = '0'.repeat(64);
      if (mutation === 'family') registry[0]!.family = 'scientific';
      if (mutation === 'known-but-wrong-base-type') publicRow.baseChartType = publicRow.baseChartType === 'bar' ? 'line' : 'bar';
      if (mutation === 'scope') publicRow.scopes[0]!.theme = publicRow.scopes[2]!.theme;
      if (mutation === 'missing-pixels') delete publicRow.scopes[0]!.svgHash;
      if (mutation === 'missing-normalized-hash') delete publicRow.scopes[0]!.normalizedSpecSha256;
      if (mutation === 'invented-public-status') registry.find(row => !row.publicSvg)!.publicSvg = true;
      if (mutation === 'different-certify-operand') publicRow.scopes[0]!.certify!.renderHash = '0'.repeat(64);
      expect(() => validate(registry)).toThrow('Viz pattern registry rejected:');
    },
  );

  it('retains an actual false certification verdict rather than tuning it to the public SVG flag', () => {
    const retained = observations();
    const cell = retained.cells.find(row => row.certified?.status === 'ok')!;
    cell.certified = { ...cell.certified!, conformant: false, pillars: { ...cell.certified!.pillars!, a11yEquivalence: 'fail' } };
    const row = derivePatternRegistry(retained).find(row => row.id === cell.id)!;
    expect(row.publicSvg).toBe(true);
    expect(row.scopes.find(scope => scope.theme === cell.request.theme && scope.brand === cell.request.brand)!.certify!.conformant).toBe(false);
  });

  it('rejects unrelated render failures instead of reclassifying them as authoring-only', () => {
    const retained = observations();
    const cell = retained.cells.find(row => row.rendered.status === 'error')!;
    cell.rendered.errors![0]!.code = 'OODS-V101';
    expect(() => derivePatternRegistry(retained)).toThrow('unexpected failure is not an authoring-only disposition');
  });

  it.each([PATTERN_REGISTRY_PATH, PATTERN_DOC_PATH])('rejects hand-edited generated bytes at %s', file => {
    const root = freshRoot();
    writePatternOutputs(observations(), { root });
    writeFileSync(join(root, file), readFileSync(join(root, file), 'utf8') + '\n');
    expect(() => writePatternOutputs(observations(), { root, check: true })).toThrow(`Generated pattern output is stale: ${file}`);
  });

  it('makes a byte-only pattern source mutation red even when its parsed JSON still matches', () => {
    const root = freshRoot();
    writePatternOutputs(observations(), { root });
    const file = join(root, VIZ_PATTERN_SOURCES[0]!.specPath);
    writeFileSync(file, readFileSync(file, 'utf8') + '\n');
    expect(() => writePatternOutputs(observations(), { root, check: true })).toThrow('bundled source SHA is stale');
  });

  it('binds the retained proof to its schema and normalized presentation, not only the chart type', () => {
    const wrongSchema = observations();
    wrongSchema.inputSchemaSha256 = '0'.repeat(64);
    expect(() => derivePatternRegistry(wrongSchema)).toThrow('Pattern input schema changed after the census');
    const changedPresentation = observations();
    const cell = changedPresentation.cells.find(row => row.rendered.status === 'ok')!;
    cell.rendered.normalizedSpec!.config!.layout!.width = 123;
    expect(canonicalPatternValue(derivePatternRegistry(changedPresentation))).not.toBe(canonicalPatternValue(rows()));
  });
});
