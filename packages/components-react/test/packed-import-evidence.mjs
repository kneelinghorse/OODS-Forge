import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(packageRoot, '../..');
const artifactArgument = process.argv.indexOf('--artifact-root');
const missionArgument = process.argv.indexOf('--mission');
const mission = missionArgument >= 0 ? process.argv[missionArgument + 1] : 's182-m02';

if (artifactArgument < 0 || !process.argv[artifactArgument + 1]) {
  throw new Error('Usage: node test/packed-import-evidence.mjs --artifact-root <directory>');
}

const artifactRoot = resolve(repositoryRoot, process.argv[artifactArgument + 1]);
const outputRoot = resolve(artifactRoot, 'packed-import');
const tarballRoot = resolve(outputRoot, 'tarballs');

function run(command, args, cwd = repositoryRoot, env = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed (${result.status ?? result.signal}):\n${result.stdout}\n${result.stderr}`
    );
  }
  return { stdout: result.stdout, stderr: result.stderr };
}

const sha256 = content => createHash('sha256').update(content).digest('hex');

await mkdir(tarballRoot, { recursive: true });
const tempRoot = await mkdtemp(resolve(tmpdir(), 'oods-react-packed-'));
let report;

try {
  const packages = [
    '@oods/tokens',
    '@oods/component-contracts',
    '@oods/component-styles',
    '@oods/components-react',
  ];
  const tarballs = [];
  for (const packageName of packages) {
    const packed = run('pnpm', [
      '--filter', packageName, 'exec', 'pnpm', 'pack', '--pack-destination', tarballRoot,
    ]);
    const tarball = packed.stdout.trim().split(/\r?\n/).at(-1);
    if (!tarball?.endsWith('.tgz')) throw new Error(`No tarball path returned for ${packageName}.`);
    tarballs.push(resolve(tarball));
  }

  const npmConfig = resolve(tempRoot, 'empty.npmrc');
  await writeFile(npmConfig, '');
  await writeFile(
    resolve(tempRoot, 'package.json'),
    `${JSON.stringify({ name: 'oods-react-packed-consumer', private: true, type: 'module' }, null, 2)}\n`
  );

  const install = run(
    'npm',
    [
      'install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false',
      '--userconfig', npmConfig,
      ...tarballs,
      'react@19.2.0',
      'react-dom@19.2.0',
    ],
    tempRoot,
    { ...process.env, npm_config_cache: resolve(tempRoot, 'npm-cache') }
  );

  const consumerSource = `
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { NUCLEUS_COMPONENT_IDS } from '@oods/component-contracts';
import { sharedScenarios } from '@oods/component-contracts';
import * as components from '@oods/components-react';
import { getStatusPresentation } from '@oods/components-react/status';
import * as tableFamily from '@oods/components-react/table';

// Nucleus membership comes from the packed @oods/component-contracts tarball,
// resolved per specifier and rejected if it resolves under the repository root.
const repositoryRoot = ${JSON.stringify(repositoryRoot)};
const contractsPath = fileURLToPath(import.meta.resolve('@oods/component-contracts'));
if (!contractsPath.startsWith(process.cwd())) throw new Error('Contracts resolved outside the isolated consumer: ' + contractsPath);
if (contractsPath.startsWith(repositoryRoot + '/')) throw new Error('Contracts resolved to repository source: ' + contractsPath);
const resolvedSpecifiers = Object.fromEntries(['@oods/component-contracts', '@oods/components-react', '@oods/components-react/status', '@oods/components-react/table', '@oods/component-styles/css', '@oods/tokens/css', 'react', 'react-dom/server'].map((specifier) => {
  const resolved = fileURLToPath(import.meta.resolve(specifier));
  if (!resolved.startsWith(process.cwd() + '/') || resolved.startsWith(repositoryRoot + '/')) throw new Error('Specifier escaped isolated consumer: ' + specifier);
  return [specifier, resolved];
}));
const canonicalIds = [...NUCLEUS_COMPONENT_IDS];
const runtimeKeys = Object.keys(components).sort();
if (JSON.stringify(runtimeKeys) !== JSON.stringify([...canonicalIds].sort())) {
  throw new Error('Packed ESM runtime export set differs: ' + JSON.stringify(runtimeKeys));
}
const html = renderToString(React.createElement(components.Button, null, 'Packed action'));
if (!html.includes('type="button"') || !html.includes('Packed action')) throw new Error('Packed SSR failed.');

const breadthIds = ['DetailHeader', 'CardHeader', 'ColorSwatch', 'ColorizedBadge', 'VizAreaPreview'];
const breadthProof = [];
for (const id of breadthIds) {
  const scenario = sharedScenarios.find((item) => item.oodsComponentId === id);
  if (!scenario) throw new Error('Missing installed shared scenario: ' + id);
  const markup = renderToString(React.createElement(components[id], scenario.props, scenario.slots.default));
  if (!markup.includes('data-oods-component="' + id + '"')) throw new Error('Missing packed marker: ' + id);
  if (id === 'DetailHeader' && (!markup.includes('<h1') || !markup.includes(scenario.props.title) || !markup.includes(scenario.props.subtitle) || !markup.includes(scenario.props.metadata))) throw new Error('Packed DetailHeader lost heading/text semantics.');
  if (id === 'CardHeader' && (!markup.includes('<h3') || !markup.includes(scenario.props.supportingText))) throw new Error('Packed CardHeader lost heading/supporting text.');
  if (id === 'ColorSwatch' && (!markup.includes('data-oods-swatch-chip') || !markup.includes(scenario.props.label) || !markup.includes('--oods-swatch-color') || !markup.includes('data-swatch-color="' + scenario.props.color + '"'))) throw new Error('Packed ColorSwatch lost label/chip semantics.');
  if (id === 'ColorizedBadge' && (!markup.includes('data-oods-badge-marker') || !markup.includes(scenario.props.label) || !markup.includes('data-badge-color="' + scenario.props.color + '"'))) throw new Error('Packed ColorizedBadge lost color/text semantics.');
  if (id === 'VizAreaPreview' && (!markup.includes('data-viz-preview-type="area"') || !markup.includes('data-viz-width="640"') || !markup.includes('data-viz-height="360"') || !markup.includes(String(scenario.slots.default)) || markup.includes('data-viz-preview-placeholder'))) throw new Error('Packed preview lost frame/slot semantics.');
  breadthProof.push({ componentId: id, markup });
}
const emptyPreview = renderToString(React.createElement(components.VizAreaPreview));
if (!emptyPreview.includes('data-viz-preview-placeholder') || !emptyPreview.replace(/<!--.*?-->/g, '').includes('Area preview (640 x 360)')) throw new Error('Packed empty preview placeholder missing.');

const presentation = getStatusPresentation('subscription', 'past_due');
if (presentation.tone !== 'critical' || presentation.label !== 'Past Due') throw new Error('Packed status registry failed.');
const tableKeys = Object.keys(tableFamily).sort();
const expectedTableKeys = ['Table', 'TableBody', 'TableCaption', 'TableCell', 'TableHead', 'TableHeaderCell', 'TableRow'].sort();
if (JSON.stringify(tableKeys) !== JSON.stringify(expectedTableKeys)) throw new Error('Packed Table family differs: ' + JSON.stringify(tableKeys));
const readiness = JSON.parse(readFileSync(fileURLToPath(import.meta.resolve('@oods/components-react/readiness')), 'utf8'));
if (JSON.stringify(readiness.rows.map((row) => row.componentId)) !== JSON.stringify(canonicalIds) || readiness.rows.some((row) => row.emissionEligible !== true)) throw new Error('Packed readiness failed.');
const css = readFileSync(fileURLToPath(import.meta.resolve('@oods/component-styles/css')), 'utf8');
if (!css.includes("[data-oods-component='Tabs']") || !css.includes('@oods/tokens/css')) throw new Error('Packed CSS export failed.');
const require = createRequire(import.meta.url);
const commonJsKeys = Object.keys(require('@oods/components-react')).sort();
if (JSON.stringify(commonJsKeys) !== JSON.stringify(runtimeKeys)) throw new Error('Packed CJS export set differs.');
process.stdout.write(JSON.stringify({ canonicalIds, contractsPath, resolvedSpecifiers, breadthProof, emptyPreview, runtimeKeys, html, status: presentation.label, tableKeys, readinessRows: readiness.rows.length, cssBytes: Buffer.byteLength(css), commonJsKeys }));
`;
  await writeFile(resolve(tempRoot, 'verify.mjs'), consumerSource);
  await writeFile(resolve(outputRoot, 'consumer.mjs'), consumerSource);
  const verification = run('node', ['verify.mjs'], tempRoot);
  const proof = JSON.parse(verification.stdout);

  const tarballEvidence = [];
  for (const tarball of tarballs) {
    const bytes = await readFile(tarball);
    tarballEvidence.push({
      name: tarball.split('/').at(-1),
      bytes: bytes.length,
      sha256: sha256(bytes),
    });
  }
  const reactManifestText = run(
    'tar',
    ['-xOf', tarballs.at(-1), 'package/package.json']
  ).stdout;
  if (/\b(?:workspace|file|link):/i.test(reactManifestText)) {
    throw new Error('Packed React manifest contains a forbidden local dependency protocol.');
  }

  report = {
    schemaVersion: '1.0.0',
    mission,
    target: 'react',
    status: 'passed',
    selected: 1,
    failed: 0,
    skipped: 0,
    isolation: {
      freshNodeModules: true,
      emptyNpmConfig: true,
      installScripts: false,
      repositorySourceImports: false,
    },
    tarballs: tarballEvidence,
    proof,
    installStdout: install.stdout.trim(),
  };
} catch (error) {
  report = {
    schemaVersion: '1.0.0',
    mission,
    target: 'react',
    status: 'failed',
    selected: 1,
    failed: 1,
    skipped: 0,
    reason: error instanceof Error ? error.message : String(error),
  };
  throw error;
} finally {
  await mkdir(outputRoot, { recursive: true });
  await writeFile(resolve(outputRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await rm(tempRoot, { recursive: true, force: true });
}

process.stdout.write(`React packed import: ${report.selected} passed, ${report.failed} failed, ${report.skipped} skipped\n`);
