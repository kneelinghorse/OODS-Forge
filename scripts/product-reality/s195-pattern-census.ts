#!/usr/bin/env tsx
/** Exact public pattern calls produce the sibling registry; frozen observations reproduce its bytes. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIZ_PATTERN_SOURCES } from '@oods/viz-core';
import { canonicalPatternValue, validateVizPatternRegistry, type VizPatternCapability, type VizPatternScope } from '../../packages/viz-core/src/registry/viz-patterns.js';
import { getAjv } from '../../packages/mcp-server/src/lib/ajv.js';
import { handle as render } from '../../packages/mcp-server/src/tools/viz.render.js';
import { handle as certify } from '../../packages/mcp-server/src/tools/artifact.certify.js';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const PATTERN_REGISTRY_PATH = 'packages/viz-core/src/registry/viz-patterns.v1.json';
export const PATTERN_DOC_PATH = 'docs/viz/pattern-library-v2.md';
const CLASSIFICATION_PATH = 'packages/viz-core/src/registry/viz-classification.v1.json';
const TYPE_REGISTRY_PATH = 'packages/viz-core/src/registry/viz-recipes.v1.json';
const INPUT_SCHEMA_PATH = 'packages/mcp-server/src/schemas/viz.render.input.json';
const serialize = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const read = (root: string, file: string) => readFileSync(resolve(root, file), 'utf8');
type PatternRequest = { pattern: string; theme: 'light' | 'dark'; brand: 'A' | 'B'; output: { svg: true; includeNormalizedSpec: true; includeA11y: true } };
type PatternObservation = {
  id: string;
  request: PatternRequest;
  rendered: Awaited<ReturnType<typeof render>>;
  repeatSvgHash?: string;
  certified?: Awaited<ReturnType<typeof certify>>;
};
export type PatternCensusObservations = { schemaVersion: 1; inputSchemaSha256: string; cells: PatternObservation[] };

function sourceInputs(root: string) {
  const sources = VIZ_PATTERN_SOURCES.map(source => {
    const bytes = read(root, source.specPath);
    const spec = JSON.parse(bytes);
    assert.equal(spec.id, source.id, `${source.id}: bundled identity differs from authoring source`);
    assert.equal(sha256(bytes), source.specSha256, `${source.id}: bundled source SHA is stale`);
    assert.equal(canonicalPatternValue(spec), canonicalPatternValue(source.spec), `${source.id}: bundled spec differs from source bytes`);
    assert.equal(canonicalPatternValue(spec.portability), canonicalPatternValue(source.portability));
    return source;
  });
  const classification = JSON.parse(read(root, CLASSIFICATION_PATH)) as { assignments: Array<{ id: string; family: string }> };
  const recipes = JSON.parse(read(root, TYPE_REGISTRY_PATH)) as Array<{ chartType: string }>;
  return { sources, classification, recipes };
}

export async function measurePatternCensus({ root = ROOT }: { root?: string } = {}): Promise<PatternCensusObservations> {
  const { sources } = sourceInputs(root);
  const schemaBytes = read(root, INPUT_SCHEMA_PATH);
  const inputSchema = JSON.parse(schemaBytes);
  const ajv = getAjv();
  const validate = (inputSchema.$id && ajv.getSchema(inputSchema.$id)) || ajv.compile(inputSchema);
  const cells: PatternObservation[] = [];
  for (const source of sources) for (const theme of ['light', 'dark'] as const) for (const brand of ['A', 'B'] as const) {
    const request: PatternRequest = { pattern: source.id, theme, brand, output: { svg: true, includeNormalizedSpec: true, includeA11y: true } };
    const admitted = structuredClone(request);
    assert(validate(admitted), `${source.id}/${theme}/${brand}: input boundary rejected ${JSON.stringify(validate.errors)}`);
    const rendered = await render(admitted as Parameters<typeof render>[0]);
    const observation: PatternObservation = { id: source.id, request, rendered };
    if (rendered.status === 'ok') {
      assert(rendered.svg && rendered.svgHash && rendered.normalizedSpec, `${source.id}: success must include SVG and exact normalized operand`);
      assert.equal(sha256(rendered.svg), rendered.svgHash, `${source.id}: returned SVG hash differs from bytes`);
      const repeated = await render(structuredClone(admitted) as Parameters<typeof render>[0]);
      assert.equal(repeated.status, 'ok', `${source.id}: repeat failed`);
      assert.equal(repeated.svg, rendered.svg, `${source.id}: repeat changed SVG bytes`);
      observation.repeatSvgHash = repeated.svgHash;
      observation.certified = await certify({ spec: rendered.normalizedSpec, theme, brand });
      assert.equal(observation.certified.status, 'ok', `${source.id}: certification failed ${JSON.stringify(observation.certified.errors)}`);
    }
    cells.push(observation);
  }
  return { schemaVersion: 1, inputSchemaSha256: sha256(schemaBytes), cells };
}

export function derivePatternRegistry(observations: PatternCensusObservations, root = ROOT): VizPatternCapability[] {
  const { sources, classification, recipes } = sourceInputs(root);
  assert.equal(observations.schemaVersion, 1, 'Pattern census version differs');
  assert.equal(observations.inputSchemaSha256, sha256(read(root, INPUT_SCHEMA_PATH)), 'Pattern input schema changed after the census');
  assert.equal(observations.cells.length, sources.length * 4, 'Exact four-scope pattern census required');
  const expectedIds = new Set(sources.map(source => source.id));
  assert(observations.cells.every(cell => expectedIds.has(cell.id)), 'Unknown census identity');
  const rows = sources.map(source => {
    const cells = observations.cells.filter(cell => cell.id === source.id);
    const scopes = cells.map(cell => {
      const { request, rendered } = cell;
      assert.deepEqual(request, { pattern: source.id, theme: request.theme, brand: request.brand, output: { svg: true, includeNormalizedSpec: true, includeA11y: true } }, `${source.id}: census request differs from pattern-only boundary`);
      const common = { theme: request.theme, brand: request.brand };
      if (rendered.status === 'ok') {
        const grade = cell.certified;
        assert(rendered.svg && rendered.svgHash && rendered.normalizedSpec && grade?.status === 'ok' && grade.coverage && grade.pillars && grade.determinism, `${source.id}: incomplete rendered/certified observation`);
        assert.equal(sha256(rendered.svg), rendered.svgHash, `${source.id}: retained SVG bytes differ from hash`);
        assert.equal(cell.repeatSvgHash, rendered.svgHash, `${source.id}: retained repeat differs from SVG`);
        assert.equal(rendered.chartType, source.baseChartType, `${source.id}: base type differs from public output`);
        assert.equal(rendered.normalizedSpec.id, source.id, `${source.id}: normalized identity changed`);
        assert.equal(rendered.normalizedSpec.a11y.description, source.spec.a11y.description, `${source.id}: public description changed`);
        assert.equal(grade.determinism.renderHash, rendered.svgHash, `${source.id}: certify rendered a different operand`);
        return { ...common, status: 'public', svgHash: rendered.svgHash,
          normalizedSpecSha256: sha256(canonicalPatternValue(rendered.normalizedSpec)),
          a11yDescription: rendered.normalizedSpec.a11y.description,
          certify: { coverage: grade.coverage, conformant: grade.conformant!, pillars: grade.pillars,
            stable: grade.determinism.stable, renderHash: grade.determinism.renderHash! } } satisfies VizPatternScope;
      }
      assert.equal(rendered.status, 'error', `${source.id}: unrecognized render status`);
      assert(rendered.errors?.length && rendered.errors.every(error => ['OODS-V167', 'OODS-V174'].includes(error.code)), `${source.id}: unexpected failure is not an authoring-only disposition: ${JSON.stringify(rendered.errors)}`);
      return { ...common, status: rendered.errors[0].code === 'OODS-V174' ? 'retired' : 'authoring-only', errors: rendered.errors.map(({ code, message }) => ({ code, message })) } satisfies VizPatternScope;
    });
    const publicSvg = scopes.every(scope => scope.status === 'public');
    const reasons = [...new Set(scopes.flatMap(scope => 'errors' in scope ? scope.errors.map(error => error.message) : []))];
    const family = classification.assignments.find(assignment => assignment.id === source.id)?.family;
    assert(family, `${source.id}: missing classification`);
    return { id: source.id, family, baseChartType: source.baseChartType, specPath: source.specPath,
      specSha256: source.specSha256, portability: source.portability, publicSvg,
      status: publicSvg ? 'public' as const : scopes.every(scope => scope.status === 'retired') ? 'retired' as const : 'authoring-only' as const, ...(!publicSvg ? { reasons } : {}), scopes };
  });
  return validateVizPatternRegistry(rows, sources, classification.assignments, recipes.map(recipe => recipe.chartType));
}

export function renderPatternLibrary(rows: readonly VizPatternCapability[]): string {
  const publicRows = rows.filter(row => row.publicSvg);
  const scopes = publicRows.flatMap(row => row.scopes);
  const failed = scopes.filter(scope => scope.certify?.conformant === false).length;
  const cell = (value: string) => value.replaceAll('|', '\\|').replaceAll('\n', ' ');
  return [
    '<!-- Generated by scripts/product-reality/s195-pattern-census.ts. Do not edit. -->',
    '# Responsive Pattern Library v2', '',
    `${rows.length} exact authored pattern identities are registered: ${publicRows.length} produce public SVG and ${rows.filter(row => row.status === 'retired').length} are retired with reasons; ${rows.filter(row => row.status === 'authoring-only').length} remain authoring-only with measured reasons. The census calls every identity in light and dark for brands A and B (${rows.length * 4} cells).`, '',
    `Public cells retain their actual certification verdict: ${scopes.length - failed} conformant and ${failed} nonconformant. A public SVG is not a promise of certification or interactive behavior.`, '',
    '## Public use', '',
    'Pass the full identity to `viz.render`, for example `{ "pattern": "pattern:viz:simple-bar", "theme": "dark", "brand": "B", "output": { "svg": true, "includeNormalizedSpec": true } }`. The source supplies rows, encoding, title, description, and presentation. Explicit input fields that conflict with the pattern are rejected. Retired identities return OODS-V174 with their reason and supported alternative. Structurally unsupported authored scenes return OODS-V167. Static SVG shows the default selection state.', '',
    '## Catalog', '', '| Identity | Family | Base chart | Public path | Portability | Reason |', '| --- | --- | --- | --- | --- | --- |',
    ...rows.map(row => `| \`${row.id}\` | ${row.family} | ${row.baseChartType} | ${row.status} | ${cell(canonicalPatternValue(row.portability))} | ${row.reasons?.map(cell).join('; ') ?? '—'} |`), '',
    '## Exact source pins', '', '| Identity | Specification | SHA-256 |', '| --- | --- | --- |',
    ...rows.map(row => `| \`${row.id}\` | \`${row.specPath}\` | \`${row.specSha256}\` |`), '',
    '## Public SVG and certification receipts', '', '| Identity | Theme / brand | SVG SHA-256 | Coverage | Conformant | A11y / contrast / accuracy |', '| --- | --- | --- | --- | --- | --- |',
    ...publicRows.flatMap(row => row.scopes.map(scope => `| \`${row.id}\` | ${scope.theme} / ${scope.brand} | \`${scope.svgHash}\` | ${scope.certify!.coverage} | ${String(scope.certify!.conformant)} | ${scope.certify!.pillars.a11yEquivalence} / ${scope.certify!.pillars.contrast} / ${scope.certify!.pillars.accuracy} |`)), '',
    '## Authoring and regeneration', '',
    'The original specifications remain available to Storybook and the pattern recommender. The public path preserves supported static authoring semantics; layers, facets, stacking and secondary axes use the scene adapter. Transforms, named datasets, external data and unknown traits remain explicit structural limits.', '',
    '```sh', 'pnpm exec tsx scripts/product-reality/s195-pattern-sources.ts --check',
    'pnpm exec tsx scripts/product-reality/s195-pattern-census.ts --measure --observations <sprint-output>/pattern-observations.json',
    'pnpm exec tsx scripts/product-reality/s195-pattern-census.ts --check --observations <sprint-output>/pattern-observations.json', '```', '',
    '`--measure` runs the real public handler and certification before writing observations, registry, and documentation. `--check` derives the generated bytes from the retained observations and current source pins; the contract suite separately reruns the public calls to reject handler drift. `OODS_PATTERN_CENSUS_ROOT` or `--root <path>` selects a repository root; `--observations <path>` selects retained observations.', '',
  ].join('\n');
}

export function writePatternOutputs(observations: PatternCensusObservations, { root = ROOT, check = false }: { root?: string; check?: boolean } = {}): VizPatternCapability[] {
  const rows = derivePatternRegistry(observations, root);
  const outputs: Array<[string, string]> = [[PATTERN_REGISTRY_PATH, serialize(rows)], [PATTERN_DOC_PATH, renderPatternLibrary(rows)]];
  for (const [file, expected] of outputs) {
    const full = resolve(root, file);
    if (check) assert(existsSync(full) && readFileSync(full, 'utf8') === expected, `Generated pattern output is stale: ${file}`);
    else { mkdirSync(dirname(full), { recursive: true }); writeFileSync(full, expected); }
  }
  return rows;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let root = process.env.OODS_PATTERN_CENSUS_ROOT ?? ROOT;
  let observationsPath: string | undefined;
  let measure = false;
  let check = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--measure') measure = true;
    else if (arg === '--check') check = true;
    else if (arg === '--root' || arg === '--observations') {
      assert(args[index + 1], `${arg} requires a path`);
      if (arg === '--root') root = resolve(args[++index]!); else observationsPath = args[++index]!;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  assert(observationsPath, '--observations <path> is required; historical receipts have no implicit write target');
  assert(!(measure && check), '--measure and --check are separate operations');
  const observations = measure ? await measurePatternCensus({ root }) : JSON.parse(read(root, observationsPath));
  const rows = writePatternOutputs(observations, { root, check });
  if (measure) { const full = resolve(root, observationsPath); mkdirSync(dirname(full), { recursive: true }); writeFileSync(full, serialize(observations)); }
  console.log(serialize({ identities: rows.length, cells: observations.cells.length, public: rows.filter(row => row.publicSvg).length,
    authoringOnly: rows.filter(row => row.status === 'authoring-only').length, retired: rows.filter(row => row.status === 'retired').length, nonconformantCells: rows.flatMap(row => row.scopes).filter(scope => scope.certify?.conformant === false).length }).trimEnd());
}
