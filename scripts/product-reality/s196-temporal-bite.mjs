#!/usr/bin/env node
/** Exclusive-window UTC-pin mutation; public probes retain every temporal cell. */
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { treeDigest } from '../runtime/manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const serialize = value => JSON.stringify(value, null, 2) + '\n';
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const PROBE = 'scripts/product-reality/s196-temporal-probe.ts';
const VIZ_REGISTRY = 'packages/viz-core/src/registry/viz-recipes.v1.json';
const PATTERN_REGISTRY = 'packages/viz-core/src/registry/viz-patterns.v1.json';
const OPERANDS = 'scripts/product-reality/s190-viz-operands.json';
const ADAPTERS = ['packages/viz-core/src/adapters/vega-lite-adapter.ts', 'packages/viz-core/src/adapters/echarts-adapter.ts'];
const build = ['--filter', '@oods/viz-core', 'run', 'build'];

function replaceOnce(source, before, after) {
  assert.equal(source.split(before).length, 2, `Expected exactly one UTC pin: ${before}`);
  return source.replace(before, after);
}
function disableUtc(source, file) {
  if (file.endsWith('/echarts-adapter.ts')) return replaceOnce(source,
    "useUTC: xAxis?.type === 'time' || yAxis?.type === 'time' ? true : undefined,",
    "useUTC: xAxis?.type === 'time' || yAxis?.type === 'time' ? false : undefined,");
  let changed = replaceOnce(source, "const scaleType = definition.type === 'temporal' ? 'utc' : mapScaleType(binding.scale);", "const scaleType = definition.type === 'temporal' ? 'time' : mapScaleType(binding.scale);");
  changed = replaceOnce(changed, 'definition.timeUnit = `utc${unit}`;', 'definition.timeUnit = unit;');
  changed = replaceOnce(changed, "if (scale === 'temporal') {\n    return 'utc';\n  }", "if (scale === 'temporal') {\n    return 'time';\n  }");
  return replaceOnce(changed, 'calculate: `utcParse(datum[', 'calculate: `timeParse(datum[');
}

async function main() {
  assert(process.argv.includes('--execute'), 'Requires --execute during the explicitly granted exclusive source/build window');
  const outputIndex = process.argv.indexOf('--out');
  const output = outputIndex < 0 ? path.join(root, 'artifacts/product-reality/sprint-196/m05/timezone-bite') : path.resolve(process.argv[outputIndex + 1]);
  assert(!fs.existsSync(output), 'Output exists; retain earlier runs and choose another --out');
  fs.mkdirSync(output, { recursive: true });
  const save = (relative, value) => {
    const file = path.join(output, relative); fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, typeof value === 'string' ? value : serialize(value));
  };
  const report = { schemaVersion: 1, missionId: 's196-m05', runId: randomUUID(), builderSelfCertified: false, status: 'running',
    startedAt: new Date().toISOString(), sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    dirty: execFileSync('git', ['status', '--porcelain', '-z'], { cwd: root }).length > 0,
    command: [process.execPath, ...process.argv.slice(1)], cwd: root, nodeVersion: process.version,
    methodology: 'Exact 16 temporal registry identities, public viz.render SVG bytes, opt-in JSON-projected ECharts options and renderer availability measured in independent processes with TZ=America/Chicago and TZ=UTC. Four Vega UTC pin sites and the ECharts useUTC pin are physically disabled, rebuilt, observed red, restored and rebuilt. No golden or registry changes occur during the bite.',
    commands: [], sources: [], inputs: [] };
  const persist = () => save('bite.json', report);
  const environment = timezone => ({ PATH: process.env.PATH ?? '', LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8', TZ: timezone, NODE_ENV: 'production', NO_COLOR: '1' });
  function run(name, commandArgs, timezone = 'UTC') {
    const startedAt = new Date().toISOString();
    const result = spawnSync('pnpm', commandArgs, { cwd: root, env: environment(timezone), encoding: 'utf8', timeout: 180000, maxBuffer: 32 * 1024 * 1024 });
    save(`${name}.stdout.log`, result.stdout ?? ''); save(`${name}.stderr.log`, result.stderr ?? '');
    const command = { name, command: ['pnpm', ...commandArgs], cwd: root, environment: environment(timezone), startedAt, completedAt: new Date().toISOString(), exitCode: result.status, signal: result.signal,
      ...(result.error ? { error: String(result.error) } : {}), stdout: `${name}.stdout.log`, stderr: `${name}.stderr.log`, stdoutSha256: hash(result.stdout ?? ''), stderrSha256: hash(result.stderr ?? '') };
    report.commands.push(command); persist();
    return { ...command, text: (result.stdout ?? '') + (result.stderr ?? '') };
  }
  const recipes = read(VIZ_REGISTRY), patterns = read(PATTERN_REGISTRY), operands = read(OPERANDS);
  const cells = [];
  for (const identity of ['line', 'area']) {
    const recipe = recipes.find(row => row.chartType === identity), operand = operands.find(row => row.chartType === identity);
    assert(recipe && operand); assert.equal(recipe.renderScopes.length, 6);
    for (const scope of recipe.renderScopes) {
      assert.equal(scope.status, 'rendered'); assert(scope.svgHash);
      cells.push({ id: `${identity}/${scope.theme}/${scope.brand}`, identity, registrySvgHash: scope.svgHash,
        request: { ...operand, theme: scope.theme, brand: scope.brand, output: { svg: true, includeNormalizedSpec: true, echarts: true } } });
    }
  }
  const pattern = patterns.find(row => row.id === 'pattern:viz:running-total-area');
  assert(pattern); assert.equal(pattern.scopes.length, 4);
  for (const scope of pattern.scopes) {
    assert.equal(scope.status, 'public');
    cells.push({ id: `running-total-area/${scope.theme}/${scope.brand}`, identity: pattern.id, registrySvgHash: scope.svgHash,
      request: { pattern: pattern.id, theme: scope.theme, brand: scope.brand, output: { svg: true, includeNormalizedSpec: true, includeA11y: true, echarts: true } } });
  }
  assert.equal(cells.length, 16); save('requests.json', { schemaVersion: 1, cells });
  report.requestsSha256 = hash(fs.readFileSync(path.join(output, 'requests.json')));
  for (const file of [VIZ_REGISTRY, PATTERN_REGISTRY, OPERANDS, pattern.specPath, PROBE]) {
    const bytes = fs.readFileSync(path.join(root, file)); const destination = `inputs/${file}`;
    save(destination, bytes.toString()); report.inputs.push({ source: file, path: destination, sha256: hash(bytes), bytes: bytes.length });
  }
  const originals = ADAPTERS.map(file => {
    const before = fs.readFileSync(path.join(root, file), 'utf8'), mutated = disableUtc(before, file), mode = fs.statSync(path.join(root, file)).mode & 0o777;
    assert.notEqual(before, mutated);
    save(`source-before/${file}`, before); save(`source-mutated/${file}`, mutated);
    report.sources.push({ file, mode, beforeSha256: hash(before), mutatedSha256: hash(mutated) });
    return { file, before, mutated, mode };
  });
  persist();
  async function phase(name, expectEqual, checkRegistry) {
    for (const [timezone, label] of [['America/Chicago', 'chicago'], ['UTC', 'utc']]) {
      const capture = run(`${name}-${label}`, ['exec', 'tsx', PROBE, '--requests', path.join(output, 'requests.json'), '--out', path.join(output, name, label)], timezone);
      assert.equal(capture.exitCode, 0, capture.text);
      const observation = JSON.parse(fs.readFileSync(path.join(output, name, label, 'observations.json'), 'utf8'));
      for (const cell of observation.cells) {
        const option = JSON.parse(fs.readFileSync(path.join(output, name, label, cell.directory, 'echarts-option.json'), 'utf8'));
        assert.equal(option.useUTC, expectEqual, `${name}/${cell.id}: physical ECharts pin must be reflected in the actual compiled option`);
      }
    }
    const compared = run(`${name}-compare`, ['exec', 'tsx', PROBE, '--compare', '--left', path.join(output, name, 'chicago/observations.json'), '--right', path.join(output, name, 'utc/observations.json'), '--out', path.join(output, name, 'comparison.json'), ...(checkRegistry ? ['--check-registry'] : [])]);
    const comparison = JSON.parse(fs.readFileSync(path.join(output, name, 'comparison.json'), 'utf8'));
    report[name] = comparison;
    if (expectEqual) { assert.equal(compared.exitCode, 0, compared.text); assert.equal(comparison.primaryEqual, 16); assert.equal(comparison.registryEqual, 16); }
    else { assert.equal(compared.exitCode, 1); assert.match(compared.text, /Cross-timezone SVG equality failed/); assert(comparison.primaryEqual < 16, 'Disabling UTC must change at least one actual public SVG across timezones'); }
    persist();
  }
  let failure;
  try {
    assert.equal(run('baseline-build', build).exitCode, 0);
    report.distBefore = await treeDigest(path.join(root, 'packages/viz-core/dist'));
    await phase('baseline', true, true);
    for (const item of originals) fs.writeFileSync(path.join(root, item.file), item.mutated);
    assert.equal(run('mutated-build', build).exitCode, 0);
    report.distMutated = await treeDigest(path.join(root, 'packages/viz-core/dist'));
    assert.notEqual(report.distMutated.sha256, report.distBefore.sha256);
    await phase('mutated', false, false);
  } catch (error) { failure = error; report.failure = error.stack ?? String(error); }
  finally {
    for (const item of originals) {
      const current = fs.readFileSync(path.join(root, item.file), 'utf8');
      assert(current === item.before || current === item.mutated, `Unexpected concurrent edit to ${item.file}; refusing to overwrite`);
      fs.writeFileSync(path.join(root, item.file), item.before); fs.chmodSync(path.join(root, item.file), item.mode);
      save(`source-restored/${item.file}`, fs.readFileSync(path.join(root, item.file), 'utf8'));
      report.sources.find(source => source.file === item.file).restoredSha256 = hash(fs.readFileSync(path.join(root, item.file)));
    }
    try {
      assert.equal(run('restored-build', build).exitCode, 0);
      report.distRestored = await treeDigest(path.join(root, 'packages/viz-core/dist'));
      if (report.distBefore) assert.deepEqual(report.distRestored, report.distBefore, 'Restored compiled dist bytes differ from baseline');
      await phase('restored', true, true);
      for (const input of report.inputs) assert.equal(hash(fs.readFileSync(path.join(root, input.source))), input.sha256, `Source input moved during exclusive bite: ${input.source}`);
    } catch (error) { failure ??= error; report.restoreFailure = error.stack ?? String(error); }
    report.status = failure ? 'failed' : 'passed';
    report.completedAt = new Date().toISOString();
    report.restoredByteIdentically = report.sources.every(source => source.beforeSha256 === source.restoredSha256)
      && report.distBefore?.sha256 === report.distRestored?.sha256;
    persist();
  }
  if (failure) throw failure;
  console.log(serialize({ status: report.status, temporalCells: 16, mutatedDifferent: report.mutated.different, restoredByteIdentically: report.restoredByteIdentically, report: path.join(output, 'bite.json') }));
}
main().catch(error => { console.error(error.stack ?? error); process.exitCode = 1; });
