#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  REPOSITORY_ROOT,
  canonicalJson,
  packFoundationPackages,
  sha256,
} from './s182-m04-consumer-harness.mjs';

export const PORTED_COMPONENT_IDS = Object.freeze([
  'AuditTimeline',
  'CancellationSummary',
  'PaginationBar',
  'PriceBadge',
  'RelativeTimestamp',
  'SearchInput',
  'StatusBadge',
  'StatusTimeline',
]);

const DEFAULT_ARTIFACT_ROOT = path.join(
  REPOSITORY_ROOT,
  'artifacts/product-reality/sprint-184/m04/packed-consumers',
);

const TARGETS = Object.freeze({
  react: {
    componentPackage: '@oods/components-react',
    publicDependencies: {
      react: '19.2.0',
      'react-dom': '19.2.0',
    },
  },
  vue: {
    componentPackage: '@oods/components-vue',
    publicDependencies: {
      vue: '3.5.42',
      '@vue/server-renderer': '3.5.42',
    },
  },
});

const LOCAL_PACKAGE_NAMES = Object.freeze([
  '@oods/tokens',
  '@oods/component-contracts',
  '@oods/component-styles',
]);

function commandResult(command, args, cwd, environment = {}) {
  const env = { ...process.env };
  for (const name of Object.keys(env)) {
    if (/(?:npm|node).*?(?:auth|password|token|username)/i.test(name)) delete env[name];
  }
  Object.assign(env, {
    CI: '1',
    FORCE_COLOR: '0',
    NO_COLOR: '1',
    ...environment,
  });
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 600_000,
  });
  return {
    command: [command, ...args].join(' '),
    exitCode: result.status ?? 127,
    signal: result.signal ?? null,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    ...(result.error ? { error: result.error.message } : {}),
  };
}

function requireGreen(result, label) {
  if (result.exitCode !== 0) {
    throw new Error(
      `${label} failed (${result.exitCode}${result.signal ? `, ${result.signal}` : ''})\n`
      + `${result.stderr || result.stdout || result.error || 'no command output'}`,
    );
  }
}

function redact(value, replacements) {
  let redacted = value;
  for (const [literal, replacement] of replacements) {
    redacted = redacted.split(literal).join(replacement);
  }
  return redacted;
}

async function writeCommandLog(filePath, result, replacements) {
  const contents = [
    `$ ${redact(result.command, replacements)}`,
    `exitCode=${result.exitCode}`,
    `signal=${result.signal ?? ''}`,
    '',
    '[stdout]',
    redact(result.stdout, replacements),
    '[stderr]',
    redact(result.stderr, replacements),
    ...(result.error ? ['[spawn-error]', redact(result.error, replacements)] : []),
  ].join('\n');
  await fsp.writeFile(filePath, `${contents.trimEnd()}\n`);
}

function findTarball(tarballs, packageName) {
  const record = tarballs.find((candidate) => candidate.name === packageName);
  if (!record) throw new Error(`Built tarball missing for ${packageName}.`);
  return record;
}

function consumerSource(framework) {
  const config = TARGETS[framework];
  const componentSpecifier = `${config.componentPackage}/ported`;
  const readinessSpecifier = `${config.componentPackage}/readiness-ported`;
  const frameworkImports = framework === 'react'
    ? `import React from 'react';\nimport { renderToString } from 'react-dom/server';`
    : `import { renderToString } from '@vue/server-renderer';\nimport { h } from 'vue';`;
  const renderExpression = framework === 'react'
    ? `renderToString(React.createElement(ported.PriceBadge, { amountCents: 2599, currency: 'USD' }))`
    : `await renderToString(h(ported.PriceBadge, { amountCents: 2599, currency: 'USD' }))`;

  return `
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PORTED_COMPONENT_IDS } from '@oods/component-contracts';
import * as ported from '${componentSpecifier}';
import readiness from '${readinessSpecifier}' with { type: 'json' };
${frameworkImports}

const expectedIds = ${JSON.stringify(PORTED_COMPONENT_IDS)};
const expectedRoot = realpathSync(process.env.OODS_EXPECTED_CONSUMER_ROOT);
const forbiddenRoot = realpathSync(process.env.OODS_FORBIDDEN_REPOSITORY_ROOT);
const require = createRequire(import.meta.url);

if (JSON.stringify(PORTED_COMPONENT_IDS) !== JSON.stringify(expectedIds)) {
  throw new Error('Installed ported ID union differs from the frozen eight.');
}
const runtimeIds = Object.keys(ported).sort();
if (JSON.stringify(runtimeIds) !== JSON.stringify(expectedIds)) {
  throw new Error('ESM ported export set differs: ' + JSON.stringify(runtimeIds));
}
const commonJsIds = Object.keys(require('${componentSpecifier}')).sort();
if (JSON.stringify(commonJsIds) !== JSON.stringify(expectedIds)) {
  throw new Error('CJS ported export set differs: ' + JSON.stringify(commonJsIds));
}
const readinessIds = readiness.rows.map((row) => row.componentId);
if (
  readiness.target !== '${framework}'
  || JSON.stringify(readinessIds) !== JSON.stringify(expectedIds)
  || readiness.rows.some((row) => row.emissionEligible !== true)
) {
  throw new Error('Ported readiness export is incomplete.');
}

const specifiers = [
  '@oods/component-contracts',
  '${componentSpecifier}',
  '${readinessSpecifier}',
  '@oods/component-styles/css-ported',
];
const resolutions = specifiers.map((specifier) => {
  const resolved = realpathSync(fileURLToPath(import.meta.resolve(specifier)));
  const consumerRelative = path.relative(expectedRoot, resolved);
  if (consumerRelative === '' || consumerRelative.startsWith('..') || path.isAbsolute(consumerRelative)) {
    throw new Error('Specifier resolved outside isolated consumer: ' + specifier + ' -> ' + resolved);
  }
  const repositoryRelative = path.relative(forbiddenRoot, resolved);
  if (repositoryRelative === '' || (!repositoryRelative.startsWith('..') && !path.isAbsolute(repositoryRelative))) {
    throw new Error('Specifier resolved under repository root: ' + specifier + ' -> ' + resolved);
  }
  return { specifier, consumerRelative: consumerRelative.split(path.sep).join('/') };
});

for (const packageName of ${JSON.stringify([...LOCAL_PACKAGE_NAMES, config.componentPackage])}) {
  const packageRoot = realpathSync(path.join(expectedRoot, 'node_modules', ...packageName.split('/')));
  if (lstatSync(path.join(expectedRoot, 'node_modules', ...packageName.split('/'))).isSymbolicLink()) {
    throw new Error('Installed local package is a symlink: ' + packageName);
  }
  const repositoryRelative = path.relative(forbiddenRoot, packageRoot);
  if (repositoryRelative === '' || (!repositoryRelative.startsWith('..') && !path.isAbsolute(repositoryRelative))) {
    throw new Error('Installed local package points into repository: ' + packageName);
  }
}

const cssPath = fileURLToPath(import.meta.resolve('@oods/component-styles/css-ported'));
const css = readFileSync(cssPath, 'utf8');
for (const componentId of expectedIds) {
  if (!css.includes("[data-oods-component='" + componentId + "']")) {
    throw new Error('Ported CSS omits ' + componentId + '.');
  }
}
if (!css.includes('@import "./statusables.css"')) {
  throw new Error('Ported CSS omits the packaged statusables dependency.');
}
readFileSync(path.join(path.dirname(cssPath), 'statusables.css'), 'utf8');

const html = ${renderExpression};
if (!html.includes('data-oods-component="PriceBadge"')) {
  throw new Error('Packed ${framework} SSR did not render PriceBadge.');
}
if (!html.includes('data-badge-variant="price"') || html.includes('data-badge-variant="usd"')) {
  throw new Error('Packed ${framework} PriceBadge lost its price marker.');
}

process.stdout.write(JSON.stringify({
  target: '${framework}',
  componentIds: expectedIds,
  runtimeIds,
  commonJsIds,
  readinessIds,
  cssBytes: Buffer.byteLength(css),
  cssComponentIds: expectedIds,
  resolutions,
  ssr: { componentId: 'PriceBadge', html },
}));
`.trimStart();
}

function isolatedNpmEnvironment(consumerRoot, userConfig, globalConfig) {
  return {
    NPM_CONFIG_USERCONFIG: userConfig,
    NPM_CONFIG_GLOBALCONFIG: globalConfig,
    npm_config_userconfig: userConfig,
    npm_config_globalconfig: globalConfig,
    npm_config_cache: path.join(consumerRoot, '.npm-cache'),
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_package_lock: 'false',
    npm_config_registry: 'https://registry.npmjs.org/',
    npm_config_update_notifier: 'false',
  };
}

async function runTargetConsumer({ artifactRoot, framework, tarballs }) {
  const config = TARGETS[framework];
  const outputRoot = path.join(artifactRoot, framework);
  const consumerRoot = await fsp.mkdtemp(path.join(os.tmpdir(), `oods-s184-m04-${framework}-`));
  const replacements = [
    [consumerRoot, '<consumer-root>'],
    [REPOSITORY_ROOT, '<repository-root>'],
  ];

  await fsp.mkdir(outputRoot, { recursive: true });
  try {
    if (fs.existsSync(path.join(consumerRoot, 'node_modules'))) {
      throw new Error(`${framework} consumer unexpectedly began with node_modules.`);
    }
    const localNames = [...LOCAL_PACKAGE_NAMES, config.componentPackage];
    const localTarballs = [];
    const localTarballDirectory = path.join(consumerRoot, 'tarballs');
    await fsp.mkdir(localTarballDirectory);
    for (const packageName of localNames) {
      const record = findTarball(tarballs, packageName);
      const destination = path.join(localTarballDirectory, path.basename(record.tarballPath));
      await fsp.copyFile(record.tarballPath, destination);
      const copied = await fsp.readFile(destination);
      if (sha256(copied) !== record.sha256) {
        throw new Error(`Copied tarball digest differs for ${packageName}.`);
      }
      localTarballs.push({
        name: packageName,
        file: `tarballs/${path.basename(destination)}`,
        bytes: copied.byteLength,
        sha256: record.sha256,
      });
    }

    const dependencies = Object.fromEntries([
      ...localTarballs.map(({ name, file }) => [name, `file:./${file}`]),
      ...Object.entries(config.publicDependencies),
    ]);
    const manifest = {
      name: `oods-s184-m04-${framework}-packed-consumer`,
      version: '1.0.0',
      private: true,
      type: 'module',
      dependencies,
    };
    const source = consumerSource(framework);
    if (source.includes(REPOSITORY_ROOT)) {
      throw new Error(`${framework} consumer source embeds the repository path.`);
    }
    const userConfig = path.join(consumerRoot, 'empty-user.npmrc');
    const globalConfig = path.join(consumerRoot, 'empty-global.npmrc');
    await fsp.writeFile(userConfig, '');
    await fsp.writeFile(globalConfig, '');
    await fsp.writeFile(path.join(consumerRoot, '.npmrc'), '');
    await fsp.writeFile(path.join(consumerRoot, 'package.json'), canonicalJson(manifest));
    await fsp.writeFile(path.join(consumerRoot, 'consumer.mjs'), source);
    await fsp.writeFile(path.join(outputRoot, 'consumer-package.json'), canonicalJson(manifest));
    await fsp.writeFile(path.join(outputRoot, 'consumer.mjs'), source);

    const npmEnvironment = isolatedNpmEnvironment(consumerRoot, userConfig, globalConfig);
    const install = commandResult(
      'npm',
      [
        'install', '--ignore-scripts', '--no-audit', '--no-fund',
        '--package-lock=false', '--userconfig', userConfig,
      ],
      consumerRoot,
      npmEnvironment,
    );
    await writeCommandLog(path.join(outputRoot, 'install.log'), install, replacements);
    requireGreen(install, `${framework} fresh tarball install`);

    const verify = commandResult(
      process.execPath,
      ['consumer.mjs'],
      consumerRoot,
      {
        ...npmEnvironment,
        OODS_EXPECTED_CONSUMER_ROOT: consumerRoot,
        OODS_FORBIDDEN_REPOSITORY_ROOT: REPOSITORY_ROOT,
      },
    );
    await writeCommandLog(path.join(outputRoot, 'verify.log'), verify, replacements);
    requireGreen(verify, `${framework} packed subpath verification`);
    const proof = JSON.parse(verify.stdout);

    const report = {
      schemaVersion: '1.0.0',
      mission: 's184-m04',
      target: framework,
      status: 'passed',
      selected: PORTED_COMPONENT_IDS.length,
      passed: PORTED_COMPONENT_IDS.length,
      failed: 0,
      skipped: 0,
      isolation: {
        outsidePnpmWorkspace: true,
        freshNodeModules: true,
        emptyVerifierOwnedNpmConfiguration: true,
        installScripts: false,
        localPackagesFromBuiltTarballsOnly: true,
        workspaceAliases: false,
        workspaceSymlinks: false,
        repositorySourceImports: false,
        allResolvedPathsOutsideRepository: true,
      },
      install: {
        localTarballs,
        publicDependencies: config.publicDependencies,
        packageLockWritten: false,
      },
      proof,
    };
    await fsp.writeFile(path.join(outputRoot, 'report.json'), canonicalJson(report));
    return report;
  } finally {
    await fsp.rm(consumerRoot, { recursive: true, force: true });
  }
}

export async function runS184M04PackedConsumers(artifactRoot = DEFAULT_ARTIFACT_ROOT) {
  const resolvedArtifactRoot = path.resolve(artifactRoot);
  await fsp.mkdir(resolvedArtifactRoot, { recursive: true });
  const tarballs = await packFoundationPackages(resolvedArtifactRoot);
  const targetReports = [];
  for (const framework of Object.keys(TARGETS)) {
    targetReports.push(await runTargetConsumer({
      artifactRoot: resolvedArtifactRoot,
      framework,
      tarballs,
    }));
  }

  const components = PORTED_COMPONENT_IDS.map((componentId) => ({
    componentId,
    anchor: `#${componentId}`,
    generatedConsumer: {
      react: 'passed',
      vue: 'passed',
    },
    state: 'implemented-evidence-complete',
  }));
  const report = {
    schemaVersion: '1.0.0',
    mission: 's184-m04',
    kind: 'ported-subpath-packed-consumer-proof',
    status: 'passed',
    selected: 16,
    passed: 16,
    failed: 0,
    skipped: 0,
    targetCount: targetReports.length,
    componentCount: components.length,
    surfaceCellCount: components.length * targetReports.length,
    requiredSubpaths: {
      react: [
        '@oods/components-react/ported',
        '@oods/components-react/readiness-ported',
        '@oods/component-styles/css-ported',
      ],
      vue: [
        '@oods/components-vue/ported',
        '@oods/components-vue/readiness-ported',
        '@oods/component-styles/css-ported',
      ],
    },
    components,
    targets: Object.fromEntries(targetReports.map((target) => [target.target, {
      status: target.status,
      selected: target.selected,
      passed: target.passed,
      isolation: target.isolation,
      resolvedSpecifiers: target.proof.resolutions,
      serverRenderedComponent: target.proof.ssr.componentId,
      report: `${target.target}/report.json`,
    }])),
    overlayReference: 'artifacts/product-reality/sprint-184/m04/packed-consumers/report.json',
    submittedPackages: tarballs.map(({ name, artifactPath, bytes, sha256: digest }) => ({
      name,
      artifactPath,
      bytes,
      sha256: digest,
    })),
  };
  await fsp.writeFile(path.join(resolvedArtifactRoot, 'report.json'), canonicalJson(report));
  return { report, targetReports };
}

function cliArtifactRoot() {
  const index = process.argv.indexOf('--artifact-root');
  if (index < 0) return DEFAULT_ARTIFACT_ROOT;
  const value = process.argv[index + 1];
  if (!value) throw new Error('--artifact-root requires a directory.');
  return path.resolve(process.cwd(), value);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (invokedPath === import.meta.url) {
  const { report } = await runS184M04PackedConsumers(cliArtifactRoot());
  process.stdout.write(
    `Sprint 184 m04 packed consumers: ${report.passed} passed, ${report.failed} failed, ${report.skipped} skipped\n`,
  );
}
