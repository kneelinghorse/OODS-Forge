import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(packageRoot, '../..');
const artifactArgument = process.argv.indexOf('--artifact-root');
const missionArgument = process.argv.indexOf('--mission');

if (artifactArgument < 0 || !process.argv[artifactArgument + 1]) {
  throw new Error('Usage: node test/packed-import.mjs --artifact-root <directory>');
}

const artifactRoot = resolve(repositoryRoot, process.argv[artifactArgument + 1]);
const mission = missionArgument >= 0 && process.argv[missionArgument + 1]
  ? process.argv[missionArgument + 1]
  : 's182-m03';
const tarballRoot = resolve(artifactRoot, 'tarballs');
const consumerRoot = mkdtempSync(join(tmpdir(), 'oods-vue-s182-m03-'));
const packageDirectories = [
  'packages/tokens',
  'packages/component-contracts',
  'packages/component-styles',
  'packages/components-vue',
];
function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: '1',
      FORCE_COLOR: '0',
      NO_COLOR: '1',
      NPM_CONFIG_USERCONFIG: '/dev/null',
      npm_config_audit: 'false',
      npm_config_fund: 'false',
      npm_config_package_lock: 'false',
    },
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    command: [command, ...args].join(' '),
    exitCode: result.status ?? 127,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    ...(result.error ? { error: result.error.message } : {}),
  };
}

function requireGreen(result) {
  if (result.exitCode !== 0) {
    throw new Error(`${result.command} failed (${result.exitCode})\n${result.stderr || result.stdout}`);
  }
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

mkdirSync(tarballRoot, { recursive: true });
const commands = [];

try {
  const tarballs = {};
  for (const directory of packageDirectories) {
    const result = run('npm', ['pack', resolve(repositoryRoot, directory), '--pack-destination', tarballRoot, '--json'], repositoryRoot);
    commands.push(result);
    requireGreen(result);
    const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, directory, 'package.json'), 'utf8'));
    const filename = `${manifest.name.replace(/^@/, '').replaceAll('/', '-')}-${manifest.version}.tgz`;
    const tarballPath = resolve(tarballRoot, filename);
    readFileSync(tarballPath);
    tarballs[manifest.name] = tarballPath;
  }

  const consumerManifest = {
    name: 'oods-vue-s182-m03-packed-consumer',
    version: '1.0.0',
    private: true,
    type: 'module',
    dependencies: {
      '@oods/component-contracts': `file:${tarballs['@oods/component-contracts']}`,
      '@oods/component-styles': `file:${tarballs['@oods/component-styles']}`,
      '@oods/components-vue': `file:${tarballs['@oods/components-vue']}`,
      '@oods/tokens': `file:${tarballs['@oods/tokens']}`,
      '@vue/server-renderer': '3.5.42',
      vue: '3.5.42',
    },
  };
  const consumerSource = `
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToString } from '@vue/server-renderer';
import { NUCLEUS_COMPONENT_IDS, evaluateEmissionEligibility } from '@oods/component-contracts';
import { createSSRApp, h } from 'vue';
import readiness from '@oods/components-vue/readiness' with { type: 'json' };
import * as components from '@oods/components-vue';

const canonicalIds = [...NUCLEUS_COMPONENT_IDS];
const consumerPackage = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
if (consumerPackage.dependencies?.['@vue/server-renderer'] !== '3.5.42') {
  throw new Error('Packed consumer must declare its direct @vue/server-renderer import.');
}
const require = createRequire(import.meta.url);
const commonJs = require('@oods/components-vue');
const runtimeIds = canonicalIds.filter((id) => id in components);
const commonJsIds = canonicalIds.filter((id) => id in commonJs);
if (JSON.stringify(runtimeIds) !== JSON.stringify(canonicalIds)) throw new Error('ESM canonical export mismatch.');
if (JSON.stringify(commonJsIds) !== JSON.stringify(canonicalIds)) throw new Error('CJS canonical export mismatch.');
const readinessIds = readiness.rows.map((row) => row.componentId);
const derivedReadiness = readiness.rows.map((row) => evaluateEmissionEligibility(row.evidence));
if (
  readiness.target !== 'vue'
  || JSON.stringify(readinessIds) !== JSON.stringify(canonicalIds)
  || derivedReadiness.some((result) => !result.emissionEligible || result.incomplete.length > 0)
  || readiness.rows.some((row) => !row.emissionEligible)
) {
  throw new Error('Packed readiness evidence is incomplete.');
}
const cssUrl = import.meta.resolve('@oods/component-styles/css');
const cssPath = fileURLToPath(cssUrl);
const css = readFileSync(cssPath, 'utf8');
if (!css.includes('@import "@oods/tokens/css"') || !css.includes("[data-oods-component='Tabs']")) {
  throw new Error('Packed shared CSS closure is incomplete.');
}
const repositoryRoot = ${JSON.stringify(repositoryRoot)};
for (const target of [import.meta.resolve('@oods/component-contracts'), import.meta.resolve('@oods/components-vue'), cssUrl, import.meta.resolve('@oods/components-vue/readiness')]) {
  const path = fileURLToPath(target);
  if (!path.startsWith(process.cwd())) throw new Error(\`Resolved outside isolated consumer: \${path}\`);
  if (path.startsWith(repositoryRoot + '/')) throw new Error(\`Resolved repository source: \${path}\`);
  if (path.includes('/OODs-Forge/') || path.includes('/OODS-Forge/')) throw new Error(\`Resolved repository source: \${path}\`);
}
const html = await renderToString(createSSRApp({
  render: () => h(components.Button, { content: 'Packed Vue import' }),
}));
if (!html.includes('data-oods-component="Button"') || !html.includes('type="button"')) {
  throw new Error('Packed SSR smoke did not render canonical Button semantics.');
}
process.stdout.write(JSON.stringify({
    status: 'passed',
    directServerRendererDependency: consumerPackage.dependencies['@vue/server-renderer'],
    readinessDerivedFromInstalledContracts: true,
    esmCanonicalExports: runtimeIds.length,
  cjsCanonicalExports: commonJsIds.length,
  readinessRows: readiness.rows.length,
  cssPath,
  ssrHtml: html,
}));
`;
  writeFileSync(resolve(consumerRoot, 'package.json'), `${JSON.stringify(consumerManifest, null, 2)}\n`);
  writeFileSync(resolve(consumerRoot, 'verify.mjs'), consumerSource.trimStart());
  writeFileSync(resolve(artifactRoot, 'consumer-package.json'), `${JSON.stringify(consumerManifest, null, 2)}\n`);
  writeFileSync(resolve(artifactRoot, 'consumer.mjs'), consumerSource.trimStart());

  const install = run('npm', ['install', '--ignore-scripts', '--package-lock=false', '--no-audit', '--no-fund'], consumerRoot);
  commands.push(install);
  requireGreen(install);
  const execute = run(process.execPath, ['verify.mjs'], consumerRoot);
  commands.push(execute);
  requireGreen(execute);
  const packedProof = JSON.parse(execute.stdout);

  const inventory = Object.entries(tarballs).map(([name, path]) => ({
    name,
    file: basename(path),
    path: path.slice(repositoryRoot.length + 1),
    bytes: readFileSync(path).byteLength,
    sha256: sha256(path),
  }));
  const report = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    mission,
    target: 'vue',
    status: 'passed',
    selected: 6,
    failed: 0,
    skipped: 0,
    isolatedConsumer: true,
    emptyNpmUserConfig: true,
    packageLockWritten: false,
    inventory,
    packedProof,
    commands: commands.map(({ command, exitCode }) => ({ command, exitCode })),
  };
  writeFileSync(resolve(artifactRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(resolve(artifactRoot, 'commands.log'), commands.map((result) => [
    `$ ${result.command}`,
    `exitCode=${result.exitCode}`,
    '[stdout]',
    result.stdout,
    '[stderr]',
    result.stderr,
  ].join('\n')).join('\n\n'));
  process.stdout.write(`Vue packed import: ${report.selected} passed, 0 failed, 0 skipped\n`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  writeFileSync(resolve(artifactRoot, 'report.json'), `${JSON.stringify({
    schemaVersion: '1.0.0',
    mission,
    target: 'vue',
    status: 'failed',
    selected: 1,
    failed: 1,
    skipped: 0,
    reason: message,
  }, null, 2)}\n`);
  throw error;
} finally {
  rmSync(consumerRoot, { recursive: true, force: true });
}
