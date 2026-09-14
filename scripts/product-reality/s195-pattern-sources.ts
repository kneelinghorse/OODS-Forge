#!/usr/bin/env tsx
/** Bundle exact authored pattern data inside viz-core; runtime never reads examples/. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chartPatterns } from '../../packages/viz-core/src/patterns/index.js';
import { assertNormalizedVizSpec } from '../../packages/viz-core/src/spec/normalized-viz-spec.js';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const PATTERN_DIRECTORY = 'examples/viz/patterns-v2';
export const PATTERN_SOURCES_PATH = 'packages/viz-core/src/patterns/viz-pattern-sources.v1.json';
export const serializePatternSources = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';

export function derivePatternSources(sources: ReadonlyArray<{ specPath: string; bytes: string }>) {
  const ids = new Set<string>();
  const paths = new Set<string>();
  return [...sources].sort((left, right) => left.specPath.localeCompare(right.specPath)).map(source => {
    const spec = assertNormalizedVizSpec(JSON.parse(source.bytes));
    assert(spec.id && /^pattern:viz:[a-z0-9-]+$/.test(spec.id), `Invalid pattern identity: ${source.specPath}`);
    assert.equal(source.specPath, `${PATTERN_DIRECTORY}/${spec.id.slice('pattern:viz:'.length)}.spec.json`, `Pattern path differs from identity: ${spec.id}`);
    assert(!ids.has(spec.id), `Duplicate pattern identity: ${spec.id}`);
    assert(!paths.has(source.specPath), `Duplicate pattern source: ${source.specPath}`);
    ids.add(spec.id);
    paths.add(source.specPath);
    // Recommender aliases may share an authored source. Explicit-only and retired
    // sources derive their Cartesian base from the first authored mark.
    const catalog = chartPatterns.filter(pattern => pattern.specPath === source.specPath);
    const markTypes: Record<string, string> = { MarkBar: 'bar', MarkLine: 'line', MarkArea: 'area', MarkPoint: 'scatter', MarkRect: 'heatmap' };
    const baseTypes = [...new Set(catalog.map(pattern => pattern.chartType))];
    assert(baseTypes.length <= 1, `Conflicting catalog base types: ${source.specPath}`);
    const baseChartType = baseTypes[0] ?? markTypes[spec.marks[0].trait];
    assert(baseChartType, `Pattern needs a supported Cartesian base mark: ${source.specPath}`);
    return { id: spec.id, specPath: source.specPath,
      specSha256: createHash('sha256').update(source.bytes).digest('hex'),
      baseChartType, portability: spec.portability, spec };
  });
}

export function generatePatternSources({ root = ROOT, check = false }: { root?: string; check?: boolean } = {}) {
  const sources = readdirSync(resolve(root, PATTERN_DIRECTORY)).filter(name => name.endsWith('.spec.json')).sort()
    .map(name => ({ specPath: `${PATTERN_DIRECTORY}/${name}`, bytes: readFileSync(resolve(root, PATTERN_DIRECTORY, name), 'utf8') }));
  const rows = derivePatternSources(sources);
  const expected = serializePatternSources(rows);
  const output = resolve(root, PATTERN_SOURCES_PATH);
  if (check) assert.equal(readFileSync(output, 'utf8'), expected, `Generated pattern sources are stale: ${PATTERN_SOURCES_PATH}`);
  else { mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, expected); }
  return rows;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let root = process.env.OODS_VIZ_PATTERN_SOURCE_ROOT ?? ROOT;
  let check = false;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--check') check = true;
    else if (args[index] === '--root') { assert(args[index + 1], '--root requires a path'); root = resolve(args[++index]!); }
    else throw new Error(`Unknown argument: ${args[index]}`);
  }
  console.log(JSON.stringify({ patterns: generatePatternSources({ root, check }).length, check }));
}
