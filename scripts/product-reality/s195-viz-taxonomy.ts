#!/usr/bin/env tsx
/** Derive taxonomy from the measured type registry, exact pattern bytes, and one authored table. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ajv2020 } from 'ajv/dist/2020.js';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const CLASSIFICATION_PATH = 'packages/viz-core/src/registry/viz-classification.v1.json';
export const TAXONOMY_PATH = 'packages/viz-core/src/registry/viz-taxonomy.v1.json';
export const DOC_PATH = 'docs/viz/taxonomy.md';
const REGISTRY_PATH = 'packages/viz-core/src/registry/viz-recipes.v1.json';
const PATTERN_DIRECTORY = 'examples/viz/patterns-v2';
const SCHEMA_PATH = 'packages/viz-core/src/registry/viz-classification.v1.schema.json';

type Assignment = { id: string; family: string; role: 'core' | 'extension'; coreCell: string | null };
type CellDefinition = { cell: string; definition: string; gapReason: string };
export type Classification = {
  schemaVersion: 1;
  families: Array<{ id: string; definition: string; coreCells: CellDefinition[] }>;
  assignments: Assignment[];
};
export type TaxonomyIdentity = Assignment & {
  kind: 'type' | 'pattern';
  publicSvg: boolean;
  specPath?: string;
  specSha256?: string;
};
export type TaxonomyCell = {
  family: string;
  cell: string;
  definition: string;
  status: 'surface-complete' | 'typed-gap';
  /** All primary assignments, including patterns without public proof. */
  identities: string[];
  reason?: string;
};
export type VizTaxonomy = {
  schemaVersion: 1;
  families: Array<{ id: string; definition: string }>;
  identities: TaxonomyIdentity[];
  coreCells: TaxonomyCell[];
  summary: { types: number; patterns: number; families: number; classified: number; coreCells: number; coreSurfaceComplete: number; typedGaps: number };
};
type PatternSource = { path: string; bytes: string };
type RegistryRow = { chartType: string; publicSvg: boolean };
export type TaxonomyInputs = { classification: Classification; registry: RegistryRow[]; patterns: PatternSource[] };
export const serialize = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
const read = (root: string, path: string): string => readFileSync(resolve(root, path), 'utf8');
const schema = JSON.parse(read(ROOT, SCHEMA_PATH));
const validateClassification = new Ajv2020({ strict: false, allErrors: true }).compile(schema);

export function readTaxonomyInputs(root = ROOT): TaxonomyInputs {
  return {
    classification: JSON.parse(read(root, CLASSIFICATION_PATH)),
    registry: JSON.parse(read(root, REGISTRY_PATH)),
    patterns: readdirSync(resolve(root, PATTERN_DIRECTORY)).filter(name => name.endsWith('.spec.json')).sort()
      .map(name => ({ path: `${PATTERN_DIRECTORY}/${name}`, bytes: read(root, `${PATTERN_DIRECTORY}/${name}`) })),
  };
}

/** A primary assignment cannot borrow public proof from another cell or a pattern's base type. */
export function deriveVizTaxonomy(inputs: TaxonomyInputs): VizTaxonomy {
  const { classification, registry, patterns } = inputs;
  assert(validateClassification(classification), `Invalid classification: ${JSON.stringify(validateClassification.errors)}`);
  const familyCells = new Map<string, Set<string>>();
  for (const family of classification.families) {
    assert(!familyCells.has(family.id), `Duplicate family: ${family.id}`);
    const cells = new Set(family.coreCells.map(row => row.cell));
    assert.equal(cells.size, family.coreCells.length, `Duplicate core cell: ${family.id}`);
    familyCells.set(family.id, cells);
  }

  const population = new Map<string, Omit<TaxonomyIdentity, keyof Assignment>>();
  for (const row of registry) {
    assert(typeof row.chartType === 'string' && row.chartType && typeof row.publicSvg === 'boolean', 'Invalid type registry row');
    assert(!population.has(row.chartType), `Duplicate registry identity: ${row.chartType}`);
    population.set(row.chartType, { kind: 'type', publicSvg: row.publicSvg });
  }
  for (const pattern of [...patterns].sort((left, right) => left.path.localeCompare(right.path))) {
    const spec = JSON.parse(pattern.bytes) as { id?: string };
    assert(typeof spec.id === 'string' && /^pattern:viz:[a-z0-9-]+$/.test(spec.id), `Invalid pattern identity: ${pattern.path}`);
    assert.equal(pattern.path, `${PATTERN_DIRECTORY}/${spec.id.slice('pattern:viz:'.length)}.spec.json`, `Pattern path differs from identity: ${spec.id}`);
    assert(!population.has(spec.id), `Duplicate registry identity: ${spec.id}`);
    // s195-m02: authoring specs have no public pattern registry or retained pixel proof.
    population.set(spec.id, { kind: 'pattern', publicSvg: false, specPath: pattern.path,
      specSha256: createHash('sha256').update(pattern.bytes).digest('hex') });
  }

  const assignments = new Map<string, Assignment>();
  for (const assignment of classification.assignments) {
    assert(population.has(assignment.id), `Unknown identity: ${assignment.id}`);
    assert(!assignments.has(assignment.id), `Duplicate assignment: ${assignment.id}`);
    const cells = familyCells.get(assignment.family);
    assert(cells, `Unknown family: ${assignment.family}`);
    assert(assignment.coreCell === null || cells.has(assignment.coreCell), `Unknown core cell: ${assignment.family}/${assignment.coreCell}`);
    assignments.set(assignment.id, assignment);
  }
  const missing = [...population.keys()].filter(id => !assignments.has(id));
  assert.equal(missing.length, 0, `Missing assignments: ${missing.join(', ')}`);
  const identities = [...population].map(([id, source]) => ({ ...assignments.get(id)!, ...source }));
  const families = classification.families.map(({ id, definition }) => ({ id, definition }));
  const coreCells = classification.families.flatMap(family => family.coreCells.map(cell => {
    const candidates = identities.filter(row => row.family === family.id && row.coreCell === cell.cell);
    const complete = candidates.some(row => row.publicSvg);
    return { family: family.id, cell: cell.cell, definition: cell.definition,
      status: complete ? 'surface-complete' as const : 'typed-gap' as const,
      identities: candidates.map(row => row.id), ...(!complete ? { reason: cell.gapReason } : {}) };
  }));
  return { schemaVersion: 1, families, identities, coreCells, summary: {
    types: identities.filter(row => row.kind === 'type').length,
    patterns: identities.filter(row => row.kind === 'pattern').length,
    families: families.length, classified: identities.length, coreCells: coreCells.length,
    coreSurfaceComplete: coreCells.filter(row => row.status === 'surface-complete').length,
    typedGaps: coreCells.filter(row => row.status === 'typed-gap').length,
  } };
}

export function renderTaxonomyDocs(taxonomy: VizTaxonomy): string {
  const { summary } = taxonomy;
  const lines = [
    '<!-- Generated by scripts/product-reality/s195-viz-taxonomy.ts. Do not edit. -->',
    '# Visualization taxonomy and Core Analytics Profile', '',
    `Version ${taxonomy.schemaVersion} classifies ${summary.classified} identities: ${summary.types} registered chart types and ${summary.patterns} pattern specifications in ${summary.families} families.`, '',
    `The Core Analytics Profile has ${summary.coreCells} named cells: ${summary.coreSurfaceComplete} surface-complete and ${summary.typedGaps} typed gaps.`, '',
    'Each identity has one primary family and at most one primary core cell. Core identities cover the basic profile; extensions add authoring, composition, interaction, or geographic capabilities. An extension may retain the core cell it elaborates.', '',
    'A cell is surface-complete only when an identity assigned to that exact family and cell has public SVG proof. The identity lists below include unproved pattern candidates; a pattern does not inherit proof from its base chart type. Surface-complete describes public pixels, not certification, every theme, dashboard placement, or interaction support.', '',
    '## Families', '', '| Family | Definition |', '| --- | --- |',
    ...taxonomy.families.map(row => `| ${row.id} | ${row.definition} |`), '',
    '## Core Analytics Profile', '', '| Family / cell | Definition | State | Assigned identities | Gap reason |', '| --- | --- | --- | --- | --- |',
    ...taxonomy.coreCells.map(row => `| ${row.family} / ${row.cell} | ${row.definition} | ${row.status} | ${row.identities.map(id => `\`${id}\``).join(', ') || 'None'} | ${row.reason ?? '—'} |`), '',
    '## Identity census', '', '| Identity | Kind | Family | Role | Primary core cell | Public SVG |', '| --- | --- | --- | --- | --- | --- |',
    ...taxonomy.identities.map(row => `| \`${row.id}\` | ${row.kind} | ${row.family} | ${row.role} | ${row.coreCell ?? '—'} | ${row.publicSvg ? 'yes' : 'no'} |`), '',
    '## Pattern source pins', '',
    'These hashes identify the exact authoring specifications included in the census; they are not public render receipts.', '',
    '| Identity | Specification | SHA-256 |', '| --- | --- | --- |',
    ...taxonomy.identities.filter(row => row.kind === 'pattern').map(row => `| \`${row.id}\` | \`${row.specPath}\` | \`${row.specSha256}\` |`), '',
    '## Regeneration', '',
    `Edit only \`${CLASSIFICATION_PATH}\` for family, role, primary-cell, definition, and typed-gap decisions. The type population and public SVG flags come from \`${REGISTRY_PATH}\`; pattern IDs and hashes come from the specification files.`, '',
    '```sh', 'pnpm exec tsx scripts/product-reality/s195-viz-taxonomy.ts', 'pnpm exec tsx scripts/product-reality/s195-viz-taxonomy.ts --check', '```', '',
    'The generator rejects unknown, duplicated, missing, or cross-family assignments. `--check` checks both the canonical JSON artifact and this document byte for byte. `OODS_VIZ_TAXONOMY_ROOT` or `--root <path>` selects another repository root.', '',
  ];
  return lines.join('\n');
}

export function generateTaxonomy({ root = ROOT, check = false }: { root?: string; check?: boolean } = {}): VizTaxonomy {
  const taxonomy = deriveVizTaxonomy(readTaxonomyInputs(root));
  const outputs: Array<[string, string]> = [[TAXONOMY_PATH, serialize(taxonomy)], [DOC_PATH, renderTaxonomyDocs(taxonomy)]];
  for (const [file, expected] of outputs) {
    const full = resolve(root, file);
    if (check) assert(existsSync(full) && readFileSync(full, 'utf8') === expected, `Generated taxonomy output is stale: ${file}`);
    else { mkdirSync(dirname(full), { recursive: true }); writeFileSync(full, expected); }
  }
  return taxonomy;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let root = process.env.OODS_VIZ_TAXONOMY_ROOT ?? ROOT;
  let check = false;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--check') check = true;
    else if (args[index] === '--root') { assert(args[index + 1], '--root requires a path'); root = resolve(args[++index]!); }
    else throw new Error(`Unknown argument: ${args[index]}`);
  }
  console.log(serialize(generateTaxonomy({ root, check }).summary).trimEnd());
}
