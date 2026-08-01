// s166 m04 — CLI wrapper for the Stage1 fig_local_tokens → DTCG adapter.
//
//   pnpm exec tsx tools/stage1-dtcg/cli.ts <input.tokens.json> --out <dir> [--name <basename>]
//
// Writes <name>.base.json, <name>.mode.<slug>.json per Figma mode, and
// <name>.coverage.json (the mapping coverage report). Reads the Stage1 artifact
// in place — nothing is written into Stage1's repo.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { convertFigLocalTokens, type FigLocalTokensFile } from './adapter.js';

function parseArgs(argv: readonly string[]): { input: string; out: string; name: string } {
  const positional: string[] = [];
  let out = '';
  let name = 'tokens';
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out') {
      out = argv[++i] ?? '';
    } else if (arg === '--name') {
      name = argv[++i] ?? name;
    } else {
      positional.push(arg);
    }
  }
  if (positional.length !== 1 || out === '') {
    console.error('Usage: tsx tools/stage1-dtcg/cli.ts <input.tokens.json> --out <dir> [--name <basename>]');
    process.exit(2);
  }
  return { input: positional[0], out, name };
}

const { input, out, name } = parseArgs(process.argv.slice(2));

const inputPath = resolve(input);
const outDir = resolve(out);
const file = JSON.parse(readFileSync(inputPath, 'utf8')) as FigLocalTokensFile;
const { base, modes, report } = convertFigLocalTokens(file);

mkdirSync(outDir, { recursive: true });

const SCHEMA = 'https://design-tokens.org/dtcg/schema.json';
const written: string[] = [];

function writeJson(fileName: string, data: unknown): void {
  const target = join(outDir, fileName);
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  written.push(fileName);
}

writeJson(`${name}.base.json`, { $schema: SCHEMA, ...base });
for (const [slug, overlay] of Object.entries(modes)) {
  writeJson(`${name}.mode.${slug}.json`, { $schema: SCHEMA, ...overlay });
}
writeJson(`${name}.coverage.json`, report);

console.log(`Converted ${report.converted}/${report.inScope} in-scope tokens (${report.source.totalTokens} total in source).`);
console.log(`Unresolved: ${report.unresolved.count} · collisions (first-wins): ${report.collisions.length} · identical duplicates merged: ${report.identicalDuplicatesMerged}`);
console.log(`Skipped by kind: ${JSON.stringify(report.skippedByKind)}`);
console.log(`Mode sets: ${JSON.stringify(report.modeSets)}`);
for (const fileName of written) {
  console.log(`  → ${join(out, fileName)}`);
}
