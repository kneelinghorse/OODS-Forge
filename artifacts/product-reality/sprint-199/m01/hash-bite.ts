import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ROOT, PATTERN_REGISTRY_PATH, writePatternOutputs } from '../../../../scripts/product-reality/s195-pattern-census.js';
const output = join(ROOT, 'artifacts/product-reality/sprint-199/m01/hash-bite');
const scratch = mkdtempSync(join(tmpdir(), 's199-svg-hash-bite-'));
const observationPath = 'artifacts/product-reality/sprint-197/m05/patterns/pattern-observations.json';
const sha = (text: string) => createHash('sha256').update(text).digest('hex');
mkdirSync(output, { recursive: true });
try {
  for (const file of ['packages/viz-core/src/registry/viz-classification.v1.json', 'packages/viz-core/src/registry/viz-recipes.v1.json', 'examples/viz/patterns-v2', 'packages/mcp-server/src/schemas/viz.render.input.json', observationPath]) {
    mkdirSync(dirname(join(scratch, file)), { recursive: true });
    cpSync(join(ROOT, file), join(scratch, file), { recursive: true });
  }
  writePatternOutputs(JSON.parse(readFileSync(join(ROOT, observationPath), 'utf8')), { root: scratch });
  const original = readFileSync(join(scratch, PATTERN_REGISTRY_PATH), 'utf8');
  const rows = JSON.parse(original);
  const row = rows.find((row: { publicSvg: boolean }) => row.publicSvg);
  const before = row.scopes[0].svgHash;
  row.scopes[0].svgHash = '0'.repeat(64);
  writeFileSync(join(scratch, PATTERN_REGISTRY_PATH), JSON.stringify(rows, null, 2) + '\n');
  const command = ['pnpm', 'docs:check'];
  const run = (label: string) => {
    const result = spawnSync(command[0]!, command.slice(1), { cwd: ROOT, env: { ...process.env, OODS_PATTERN_CENSUS_ROOT: scratch }, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    const log = (result.stdout ?? '') + (result.stderr ?? '');
    writeFileSync(join(output, label + '.log'), log);
    return { exitCode: result.status, log: label + '.log', logSha256: sha(log) };
  };
  const red = run('red');
  assert.notEqual(red.exitCode, 0);
  assert.match(readFileSync(join(output, 'red.log'), 'utf8'), /Generated pattern output is stale/);
  writeFileSync(join(scratch, PATTERN_REGISTRY_PATH), original);
  const green = run('restored');
  assert.equal(green.exitCode, 0);
  assert.equal(readFileSync(join(scratch, PATTERN_REGISTRY_PATH), 'utf8'), original);
  writeFileSync(join(output, 'receipt.json'), JSON.stringify({ gateCommand: command, gateStep: 'docs', file: PATTERN_REGISTRY_PATH, identity: row.id, before, mutation: '0'.repeat(64), restoredSha256: sha(original), red, green, liveRegistryUnchanged: readFileSync(join(ROOT, PATTERN_REGISTRY_PATH), 'utf8') === original, builderSelfCertified: false }, null, 2) + '\n');
} finally { rmSync(scratch, { recursive: true, force: true }); }
