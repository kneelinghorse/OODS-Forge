import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CLASSIFICATION_PATH, DOC_PATH, ROOT, TAXONOMY_PATH,
  deriveVizTaxonomy, generateTaxonomy, readTaxonomyInputs, renderTaxonomyDocs, serialize,
} from '../../../../scripts/product-reality/s195-viz-taxonomy.js';

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
const read = (file: string) => readFileSync(join(ROOT, file), 'utf8');
const freshRoot = () => {
  const root = mkdtempSync(join(tmpdir(), 'oods-viz-taxonomy-'));
  roots.push(root);
  for (const file of [CLASSIFICATION_PATH, 'packages/viz-core/src/registry/viz-recipes.v1.json', 'examples/viz/patterns-v2']) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    cpSync(join(ROOT, file), join(root, file), { recursive: true });
  }
  return root;
};

describe('generated visualization taxonomy preserves the exact census and primary-cell proof (s195 m02)', () => {
  it('classifies each of the 13 measured types and 21 exact pattern identities once', () => {
    const inputs = readTaxonomyInputs();
    const taxonomy = deriveVizTaxonomy(inputs);
    const population = [...inputs.registry.map(row => row.chartType), ...inputs.patterns.map(row => JSON.parse(row.bytes).id)].sort();
    expect(taxonomy.identities.map(row => row.id).sort()).toEqual(population);
    expect(new Set(taxonomy.identities.map(row => row.id)).size).toBe(34);
    expect(taxonomy.families.map(row => row.id)).toEqual(['statistical', 'temporal', 'financial', 'hierarchy', 'network', 'flow', 'geo', 'scientific']);
    expect(taxonomy.summary).toEqual({ types: 13, patterns: 21, families: 8, classified: 34, coreCells: 20, coreSurfaceComplete: 11, typedGaps: 9 });
    for (const row of taxonomy.identities) {
      expect(['core', 'extension']).toContain(row.role);
      expect(taxonomy.families.some(family => family.id === row.family)).toBe(true);
      if (row.role === 'core') expect(row.coreCell).not.toBeNull();
    }
  });

  it.each(['unknown-identity', 'unknown-family', 'duplicate-assignment', 'missing-assignment', 'cross-family-cell', 'duplicate-family', 'duplicate-cell', 'core-without-cell', 'unknown-role'])(
    'rejects %s so an authored table cannot silently change the denominator or meaning', mutation => {
      const inputs = readTaxonomyInputs();
      const { assignments, families } = inputs.classification;
      const messages: Record<string, RegExp> = {
        'unknown-identity': /Unknown identity/, 'unknown-family': /Unknown family/, 'duplicate-assignment': /Duplicate assignment/,
        'missing-assignment': /Missing assignments/, 'cross-family-cell': /Unknown core cell/, 'duplicate-family': /Duplicate family/,
        'duplicate-cell': /Duplicate core cell/, 'core-without-cell': /Invalid classification/, 'unknown-role': /Invalid classification/,
      };
      if (mutation === 'unknown-identity') assignments[0]!.id = 'invented-chart';
      if (mutation === 'unknown-family') assignments[0]!.family = 'invented-family';
      if (mutation === 'duplicate-assignment') assignments.push({ ...assignments[0]! });
      if (mutation === 'missing-assignment') assignments.pop();
      if (mutation === 'cross-family-cell') assignments[0]!.coreCell = 'choropleth';
      if (mutation === 'duplicate-family') families[1]!.id = families[0]!.id;
      if (mutation === 'duplicate-cell') families[0]!.coreCells.push({ ...families[0]!.coreCells[0]! });
      if (mutation === 'core-without-cell') assignments[0]!.coreCell = null;
      if (mutation === 'unknown-role') (assignments[0] as any).role = 'certified';
      expect(() => deriveVizTaxonomy(inputs)).toThrow(messages[mutation]);
    },
  );

  it('requires exact same-cell public backing and never promotes authoring patterns from their base type', () => {
    const taxonomy = deriveVizTaxonomy(readTaxonomyInputs());
    for (const cell of taxonomy.coreCells) {
      const assigned = taxonomy.identities.filter(row => row.family === cell.family && row.coreCell === cell.cell);
      expect(cell.identities).toEqual(assigned.map(row => row.id));
      expect(cell.status === 'surface-complete').toBe(assigned.some(row => row.publicSvg));
      if (cell.status === 'typed-gap') expect(cell.reason).toMatch(/\S/);
      else expect(cell.reason).toBeUndefined();
    }
    expect(taxonomy.identities.filter(row => row.kind === 'pattern').every(row => !row.publicSvg)).toBe(true);
    expect(taxonomy.coreCells.find(row => row.family === 'temporal' && row.cell === 'multi-series')?.status).toBe('typed-gap');
    expect(taxonomy.identities.find(row => row.id === 'line')).toMatchObject({ publicSvg: true, coreCell: 'trend' });
    expect(taxonomy.identities.find(row => row.id === 'heatmap')).toMatchObject({ publicSvg: true, role: 'extension', coreCell: null });
    expect(taxonomy.coreCells.find(row => row.family === 'statistical' && row.cell === 'distribution')?.status).toBe('typed-gap');
  });

  it('removes completion when its only public registry proof disappears, despite unproved same-cell patterns', () => {
    const inputs = readTaxonomyInputs();
    inputs.registry.find(row => row.chartType === 'bar')!.publicSvg = false;
    const taxonomy = deriveVizTaxonomy(inputs);
    expect(taxonomy.coreCells.find(row => row.family === 'statistical' && row.cell === 'comparison')).toMatchObject({ status: 'typed-gap', reason: expect.stringMatching(/\S/) });
    expect(taxonomy.summary).toMatchObject({ classified: 34, coreSurfaceComplete: 10, typedGaps: 10 });
  });

  it('names every deferred financial and scientific cell with a concrete reason', () => {
    const taxonomy = deriveVizTaxonomy(readTaxonomyInputs());
    const cells = taxonomy.coreCells.filter(row => ['financial', 'scientific'].includes(row.family));
    expect(cells.map(row => `${row.family}/${row.cell}`)).toEqual(['financial/candlestick', 'financial/waterfall', 'scientific/box', 'scientific/histogram', 'scientific/contour']);
    for (const cell of cells) expect(cell).toMatchObject({ status: 'typed-gap', identities: [], reason: expect.stringContaining('No registered') });
  });

  it('pins the raw bytes and exact source ID of each pattern, including the linked-brush identity', () => {
    const inputs = readTaxonomyInputs();
    const taxonomy = deriveVizTaxonomy(inputs);
    for (const source of inputs.patterns) {
      const id = JSON.parse(source.bytes).id;
      expect(taxonomy.identities.find(row => row.id === id)).toMatchObject({ kind: 'pattern', specPath: source.path, specSha256: createHash('sha256').update(source.bytes).digest('hex') });
    }
    expect(taxonomy.identities.some(row => row.id === 'pattern:viz:linked-brush-scatter')).toBe(true);
    expect(taxonomy.identities.some(row => row.id === 'pattern:viz:cohort-scatter')).toBe(false);
    const source = inputs.patterns[0]!;
    const original = taxonomy.identities.find(row => row.specPath === source.path)!.specSha256;
    source.bytes += '\n';
    expect(deriveVizTaxonomy(inputs).identities.find(row => row.specPath === source.path)!.specSha256).not.toBe(original);
  });

  it.each(['duplicate-type', 'duplicate-pattern', 'pattern-id-path-mismatch'])('rejects %s in identity sources instead of hiding it through assignment lookup', mutation => {
    const inputs = readTaxonomyInputs();
    if (mutation === 'duplicate-type') inputs.registry.push({ ...inputs.registry[0]! });
    if (mutation === 'duplicate-pattern') inputs.patterns.push({ ...inputs.patterns[0]! });
    if (mutation === 'pattern-id-path-mismatch') inputs.patterns[0]!.bytes = JSON.stringify({ ...JSON.parse(inputs.patterns[0]!.bytes), id: 'pattern:viz:invented-pattern' });
    expect(() => deriveVizTaxonomy(inputs)).toThrow(/Duplicate registry identity|Pattern path differs from identity/);
  });

  it('reproduces canonical JSON and documentation byte for byte through --check', () => {
    const taxonomy = deriveVizTaxonomy(readTaxonomyInputs());
    expect(serialize(taxonomy)).toBe(read(TAXONOMY_PATH));
    expect(renderTaxonomyDocs(taxonomy)).toBe(read(DOC_PATH));
    const output = execFileSync(process.execPath, ['--import', 'tsx', 'scripts/product-reality/s195-viz-taxonomy.ts', '--check'], { cwd: ROOT, encoding: 'utf8' });
    expect(JSON.parse(output)).toEqual(taxonomy.summary);
  });

  it.each([TAXONOMY_PATH, DOC_PATH])('fails --check for a hand-edited output: %s', file => {
    const root = freshRoot();
    generateTaxonomy({ root });
    writeFileSync(join(root, file), readFileSync(join(root, file), 'utf8') + ' ');
    expect(() => generateTaxonomy({ root, check: true })).toThrow(`Generated taxonomy output is stale: ${file}`);
  });

  it('fails --check when a pattern source changes until the retained source pin is regenerated', () => {
    const root = freshRoot();
    generateTaxonomy({ root });
    const source = join(root, readTaxonomyInputs(root).patterns[0]!.path);
    writeFileSync(source, readFileSync(source, 'utf8') + '\n');
    expect(() => generateTaxonomy({ root, check: true })).toThrow(`Generated taxonomy output is stale: ${TAXONOMY_PATH}`);
    generateTaxonomy({ root });
    expect(() => generateTaxonomy({ root, check: true })).not.toThrow();
  });
});
