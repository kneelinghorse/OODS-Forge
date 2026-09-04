#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { builtinModules } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, '../..');

const foundations = [
  {
    name: '@oods/component-contracts',
    directory: 'packages/component-contracts',
    requiredExports: ['.', './package.json', './registry/capabilities', './registry/intake', './registry/reconciliation'],
  },
  {
    name: '@oods/component-styles',
    directory: 'packages/component-styles',
    requiredExports: ['.', './css', './package.json'],
    requiredDependencies: { dependencies: ['@oods/tokens'] },
  },
  {
    name: '@oods/components-react',
    directory: 'packages/components-react',
    requiredExports: ['.', './package.json'],
    requiredDependencies: {
      dependencies: ['@oods/component-contracts', '@oods/component-styles'],
      peerDependencies: ['react', 'react-dom'],
    },
  },
  {
    name: '@oods/components-vue',
    directory: 'packages/components-vue',
    requiredExports: ['.', './package.json'],
    requiredDependencies: {
      dependencies: ['@oods/component-contracts', '@oods/component-styles'],
      peerDependencies: ['vue'],
    },
  },
];

const textExtensions = new Set([
  '.cjs', '.css', '.cts', '.d.ts', '.d.cts', '.d.mts', '.js', '.json', '.map', '.mjs', '.mts', '.ts',
]);
const importExtensions = ['.js', '.cjs', '.mjs', '.json', '.css', '.d.ts', '.d.cts', '.d.mts'];
const nodeBuiltins = new Set(
  builtinModules.flatMap((name) => {
    const unprefixed = name.replace(/^node:/, '').split('/')[0];
    return [name, unprefixed, `node:${unprefixed}`];
  }),
);

const help = `Usage:
  node scripts/product-reality/verify-package-foundations.mjs --artifact-root <directory>

Builds and packs these four packages twice, then inspects the packed bytes:
  @oods/component-contracts
  @oods/component-styles
  @oods/components-react
  @oods/components-vue

The caller must supply a fresh artifact root. Results are written beneath:
  <directory>/package-foundations/report.json

The command exits non-zero when a build or pack fails, the two tarballs differ,
an export target is absent/invalid, a workspace:/file:/link: protocol leaks,
a packed runtime import escapes to repository source, or a bare import is not
declared by the packed manifest.
`;

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function isWithin(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function parseArguments(argv) {
  if (argv.includes('--help') || argv.includes('-h')) return { showHelp: true };

  let artifactRoot;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--artifact-root') {
      artifactRoot = argv[index + 1];
      index += 1;
      continue;
    }
    if (argument.startsWith('--artifact-root=')) {
      artifactRoot = argument.slice('--artifact-root='.length);
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!artifactRoot) throw new Error('Missing required --artifact-root <directory>.');
  return { showHelp: false, artifactRoot: path.resolve(process.cwd(), artifactRoot) };
}

function run(command, args, cwd, environment = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: '1',
      FORCE_COLOR: '0',
      NO_COLOR: '1',
      ...environment,
    },
    maxBuffer: 64 * 1024 * 1024,
  });

  return {
    exitCode: result.status ?? 127,
    signal: result.signal ?? null,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    ...(result.error ? { error: result.error.message } : {}),
  };
}

function writeCommandLog(filePath, displayCommand, result) {
  const sections = [
    `$ ${displayCommand}`,
    `exitCode=${result.exitCode}`,
    `signal=${result.signal ?? ''}`,
    '',
    '[stdout]',
    result.stdout,
    '[stderr]',
    result.stderr,
  ];
  if (result.error) sections.push('[spawn-error]', result.error);
  fs.writeFileSync(filePath, `${sections.join('\n').trimEnd()}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function packageSlug(packageName) {
  return packageName.replace(/^@/, '').replaceAll('/', '-');
}

function extractTarEntry(tarballPath, entry) {
  const result = spawnSync('tar', ['-xOzf', tarballPath, entry], {
    cwd: repoRoot,
    encoding: null,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Unable to read ${entry} from ${path.basename(tarballPath)}: ${String(result.stderr ?? '')}`);
  }
  return result.stdout;
}

function listTarEntries(tarballPath) {
  const result = run('tar', ['-tzf', tarballPath], repoRoot);
  if (result.exitCode !== 0) {
    throw new Error(`Unable to list ${path.basename(tarballPath)}: ${result.stderr || result.stdout}`);
  }
  return [...new Set(result.stdout.split(/\r?\n/).filter(Boolean))].sort(compareCodePoint);
}

function fileExtension(filePath) {
  for (const extension of [...textExtensions].sort((a, b) => b.length - a.length)) {
    if (filePath.endsWith(extension)) return extension;
  }
  return path.posix.extname(filePath);
}

function isTextEntry(filePath, contents) {
  return textExtensions.has(fileExtension(filePath)) && !contents.includes(0);
}

function collectProtocolFindings(contents, filePath) {
  const findings = [];
  const pattern = /\b(workspace|file|link):/gi;
  for (const match of contents.matchAll(pattern)) {
    findings.push({ file: filePath, protocol: `${match[1].toLowerCase()}:`, offset: match.index });
  }
  return findings;
}

function collectImportSpecifiers(contents, filePath) {
  if (filePath.endsWith('.map')) return [];
  const matches = [];
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?[^'";]*?\sfrom\s*["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
    /@import\s+(?:url\(\s*)?["']([^"']+)["']/g,
    /\breference\s+types=["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of contents.matchAll(pattern)) matches.push(match[1]);
  }
  return [...new Set(matches)].sort(compareCodePoint);
}

function barePackageName(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/');
  return specifier.split('/')[0];
}

function isBareSpecifier(specifier) {
  return !specifier.startsWith('.')
    && !specifier.startsWith('/')
    && !specifier.startsWith('#')
    && !/^[a-z][a-z+.-]*:/i.test(specifier);
}

function importTargetExists(inventoryPaths, importingFile, specifier) {
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(importingFile), specifier));
  const candidates = new Set([resolved]);
  for (const extension of importExtensions) candidates.add(`${resolved}${extension}`);
  for (const extension of importExtensions) candidates.add(path.posix.join(resolved, `index${extension}`));
  return [...candidates].some((candidate) => inventoryPaths.has(candidate));
}

function scanImports(textFiles, inventoryPaths, manifest) {
  const dependencies = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
  ]);
  const undeclaredBareImports = [];
  const sourcePathLeaks = [];
  const unresolvedRelativeImports = [];

  for (const [filePath, contents] of textFiles) {
    if (!['.js', '.cjs', '.mjs', '.d.ts', '.d.cts', '.d.mts', '.css'].includes(fileExtension(filePath))) continue;
    for (const specifier of collectImportSpecifiers(contents, filePath)) {
      if (specifier.startsWith('.')) {
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(filePath), specifier));
        if (resolved === '..' || resolved.startsWith('../') || !resolved.startsWith('package/')) {
          sourcePathLeaks.push({ file: filePath, specifier, reason: 'relative import escapes the packed package' });
        } else if (!importTargetExists(inventoryPaths, filePath, specifier)) {
          unresolvedRelativeImports.push({ file: filePath, specifier });
          if (resolved.startsWith('package/src/')) {
            sourcePathLeaks.push({ file: filePath, specifier, reason: 'runtime import resolves to unpacked package source' });
          }
        }
        continue;
      }

      if (specifier.startsWith('/') || /^[A-Za-z]:[\\/]/.test(specifier)) {
        sourcePathLeaks.push({ file: filePath, specifier, reason: 'absolute import path' });
        continue;
      }
      if (/^(?:src|packages|apps|cmos|scripts)\//.test(specifier) || specifier.startsWith('@/') || specifier.startsWith('~/')) {
        sourcePathLeaks.push({ file: filePath, specifier, reason: 'repository/source alias import' });
        continue;
      }
      if (!isBareSpecifier(specifier)) continue;

      const packageName = barePackageName(specifier);
      if (packageName === manifest.name || nodeBuiltins.has(specifier) || nodeBuiltins.has(packageName)) continue;
      if (!dependencies.has(packageName)) undeclaredBareImports.push({ file: filePath, specifier, packageName });
    }
  }

  return {
    sourcePathLeaks: dedupeAndSort(sourcePathLeaks),
    undeclaredBareImports: dedupeAndSort(undeclaredBareImports),
    unresolvedRelativeImports: dedupeAndSort(unresolvedRelativeImports),
  };
}

function collectAbsolutePathLeaks(textFiles) {
  const findings = [];
  const escapedRepoRoot = repoRoot.replaceAll('\\', '\\\\');
  const broadAbsoluteSource = /(?:\/Users|\/home|\/workspace|\/workspaces|[A-Za-z]:[\\/])[^\n\r"'`]*(?:[\\/](?:src|packages|apps|cmos|scripts)[\\/])[^\n\r"'`]*/g;
  for (const [filePath, contents] of textFiles) {
    if (contents.includes(repoRoot) || contents.includes(escapedRepoRoot)) {
      findings.push({ file: filePath, reason: 'absolute repository root' });
    }
    for (const match of contents.matchAll(broadAbsoluteSource)) {
      findings.push({ file: filePath, reason: 'absolute repository/source path', value: match[0] });
    }
  }
  return dedupeAndSort(findings);
}

function gatherStringLeaves(value, pointer = '') {
  if (typeof value === 'string') return [{ pointer, target: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => gatherStringLeaves(item, `${pointer}/${index}`));
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]) => gatherStringLeaves(item, `${pointer}/${key}`));
}

function wildcardMatches(inventoryPaths, candidate) {
  const escaped = candidate.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  const pattern = new RegExp(`^${escaped}$`);
  return [...inventoryPaths].some((entry) => pattern.test(entry));
}

function exportTargetExists(inventoryPaths, target) {
  const packedPath = path.posix.normalize(path.posix.join('package', target.slice(2)));
  return target.includes('*') ? wildcardMatches(inventoryPaths, packedPath) : inventoryPaths.has(packedPath);
}

function scanEntryPoints(manifest, inventoryPaths, foundation) {
  const invalidExportTargets = [];
  const missingExportTargets = [];
  for (const leaf of gatherStringLeaves(manifest.exports, '/exports')) {
    if (!leaf.target.startsWith('./')) {
      invalidExportTargets.push({ ...leaf, reason: 'package export targets must be ./-relative' });
    } else if (!exportTargetExists(inventoryPaths, leaf.target)) {
      missingExportTargets.push(leaf);
    }
  }

  const missingLegacyEntryPoints = [];
  for (const field of ['main', 'module', 'types']) {
    const target = manifest[field];
    if (typeof target !== 'string') continue;
    if (!target.startsWith('./')) {
      invalidExportTargets.push({ pointer: `/${field}`, target, reason: 'entry point must be ./-relative' });
    } else if (!exportTargetExists(inventoryPaths, target)) {
      missingLegacyEntryPoints.push({ field, target });
    }
  }

  const missingRequiredExports = foundation.requiredExports
    .filter((exportName) => !manifest.exports || !Object.prototype.hasOwnProperty.call(manifest.exports, exportName))
    .map((exportName) => ({ export: exportName }));

  const missingRequiredDependencies = [];
  for (const [section, packageNames] of Object.entries(foundation.requiredDependencies ?? {})) {
    for (const packageName of packageNames) {
      if (typeof manifest[section]?.[packageName] !== 'string') {
        missingRequiredDependencies.push({ section, packageName });
      }
    }
  }

  return {
    invalidExportTargets: dedupeAndSort(invalidExportTargets),
    missingExportTargets: dedupeAndSort(missingExportTargets),
    missingLegacyEntryPoints: dedupeAndSort(missingLegacyEntryPoints),
    missingRequiredExports: dedupeAndSort(missingRequiredExports),
    missingRequiredDependencies: dedupeAndSort(missingRequiredDependencies),
  };
}

function dedupeAndSort(values) {
  const byValue = new Map(values.map((value) => [JSON.stringify(value), value]));
  return [...byValue.values()].sort((left, right) => compareCodePoint(JSON.stringify(left), JSON.stringify(right)));
}

function inspectTarball(tarballPath, foundation) {
  const rawEntries = listTarEntries(tarballPath);
  const unsafeArchiveEntries = rawEntries
    .filter((entry) => path.posix.isAbsolute(entry) || entry === '..' || entry.startsWith('../') || entry.includes('/../'))
    .map((entry) => ({ entry }));
  const fileEntries = rawEntries.filter((entry) => !entry.endsWith('/'));
  const inventory = [];
  const textFiles = new Map();

  for (const entry of fileEntries) {
    const contents = extractTarEntry(tarballPath, entry);
    inventory.push({ path: entry, bytes: contents.byteLength, sha256: sha256(contents) });
    if (isTextEntry(entry, contents)) textFiles.set(entry, contents.toString('utf8'));
  }
  inventory.sort((left, right) => compareCodePoint(left.path, right.path));
  const inventoryPaths = new Set(inventory.map((item) => item.path));

  const manifestEntry = 'package/package.json';
  if (!textFiles.has(manifestEntry)) throw new Error('Packed archive does not contain package/package.json.');
  const manifest = JSON.parse(textFiles.get(manifestEntry));

  const protocolFindings = [];
  for (const [filePath, contents] of textFiles) protocolFindings.push(...collectProtocolFindings(contents, filePath));

  return {
    manifest,
    inventory,
    inventorySha256: sha256(canonicalJson(inventory)),
    checks: {
      protocolFindings: dedupeAndSort(protocolFindings),
      absolutePathLeaks: collectAbsolutePathLeaks(textFiles),
      unsafeArchiveEntries: dedupeAndSort(unsafeArchiveEntries),
      ...scanImports(textFiles, inventoryPaths, manifest),
      ...scanEntryPoints(manifest, inventoryPaths, foundation),
    },
  };
}

function checkCount(checks) {
  return Object.values(checks).reduce((total, findings) => total + findings.length, 0);
}

function locatePackedTarball(packDirectory, commandResult) {
  let npmFilename;
  const stdout = commandResult.stdout.trim();
  for (let index = 0; index < stdout.length; index += 1) {
    if (stdout[index] !== '[') continue;
    try {
      const payload = JSON.parse(stdout.slice(index));
      if (Array.isArray(payload) && typeof payload[0]?.filename === 'string') {
        npmFilename = payload[0].filename;
        break;
      }
    } catch {
      // npm lifecycle output may precede its final JSON payload.
    }
  }

  const tarballs = fs.readdirSync(packDirectory).filter((entry) => entry.endsWith('.tgz')).sort(compareCodePoint);
  if (npmFilename && tarballs.includes(npmFilename)) return path.join(packDirectory, npmFilename);
  if (tarballs.length === 1) return path.join(packDirectory, tarballs[0]);
  throw new Error(`Expected one packed tarball, found ${tarballs.length}.`);
}

function packOnce(record, runNumber, paths, npmEnvironment) {
  const slug = packageSlug(record.expectedName);
  const packDirectory = path.join(paths.tarballs, `run-${runNumber}`, slug);
  fs.mkdirSync(packDirectory, { recursive: true });
  const displayCommand = `npm pack --json --pack-destination <artifact-root>/package-foundations/tarballs/run-${runNumber}/${slug}`;
  const result = run('npm', ['pack', '--json', '--pack-destination', packDirectory], record.absoluteDirectory, npmEnvironment);
  const logPath = path.join(paths.logs, `${slug}-pack-run-${runNumber}.log`);
  writeCommandLog(logPath, displayCommand, result);

  const packRecord = {
    run: runNumber,
    command: displayCommand,
    exitCode: result.exitCode,
    log: toPosix(path.relative(paths.outputRoot, logPath)),
  };
  if (result.exitCode !== 0) return packRecord;

  try {
    const tarballPath = locatePackedTarball(packDirectory, result);
    const inspection = inspectTarball(tarballPath, record.foundation);
    const packageIdentityFindings = [];
    if (inspection.manifest.name !== record.expectedName) {
      packageIdentityFindings.push({ field: 'name', expected: record.expectedName, actual: inspection.manifest.name ?? null });
    }
    if (inspection.manifest.version !== record.sourceManifest?.version) {
      packageIdentityFindings.push({
        field: 'version',
        expected: record.sourceManifest?.version ?? null,
        actual: inspection.manifest.version ?? null,
      });
    }
    const checks = {
      ...inspection.checks,
      packageIdentityFindings: dedupeAndSort(packageIdentityFindings),
    };
    const inventoryPath = path.join(paths.inventories, `${slug}-run-${runNumber}.json`);
    fs.writeFileSync(inventoryPath, canonicalJson(inspection.inventory));
    return {
      ...packRecord,
      tarball: toPosix(path.relative(paths.outputRoot, tarballPath)),
      tarballBytes: fs.statSync(tarballPath).size,
      tarballSha256: sha256(fs.readFileSync(tarballPath)),
      inventory: inspection.inventory,
      inventorySha256: inspection.inventorySha256,
      inventoryArtifact: toPosix(path.relative(paths.outputRoot, inventoryPath)),
      packedManifest: inspection.manifest,
      checks,
      findingCount: checkCount(checks),
    };
  } catch (error) {
    return { ...packRecord, inspectionError: error instanceof Error ? error.message : String(error) };
  }
}

function prepareRecord(foundation) {
  const absoluteDirectory = path.join(repoRoot, foundation.directory);
  const manifestPath = path.join(absoluteDirectory, 'package.json');
  const record = {
    expectedName: foundation.name,
    packageDirectory: foundation.directory,
    absoluteDirectory,
    foundation,
  };

  try {
    const sourceManifestBytes = fs.readFileSync(manifestPath);
    return {
      ...record,
      sourceManifest: JSON.parse(sourceManifestBytes.toString('utf8')),
      sourceManifestSha256: sha256(sourceManifestBytes),
    };
  } catch (error) {
    return { ...record, sourceManifestError: error instanceof Error ? error.message : String(error) };
  }
}

function packagePassed(record) {
  if (record.sourceManifestError || record.sourceManifest?.name !== record.expectedName) return false;
  if (record.build?.exitCode !== 0 || record.packs?.length !== 2) return false;
  const [first, second] = record.packs;
  if (first.exitCode !== 0 || second.exitCode !== 0 || first.inspectionError || second.inspectionError) return false;
  if (first.packedManifest?.name !== record.expectedName || second.packedManifest?.name !== record.expectedName) return false;
  if (first.packedManifest?.version !== record.sourceManifest?.version
    || second.packedManifest?.version !== record.sourceManifest?.version) return false;
  if (first.tarballSha256 !== second.tarballSha256 || first.inventorySha256 !== second.inventorySha256) return false;
  return first.findingCount === 0 && second.findingCount === 0;
}

function stripInternalFields(record) {
  const { absoluteDirectory: _absoluteDirectory, foundation: _foundation, ...publicRecord } = record;
  return publicRecord;
}

function main() {
  let args;
  try {
    args = parseArguments(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n\n${help}`);
    process.exitCode = 2;
    return;
  }

  if (args.showHelp) {
    process.stdout.write(help);
    return;
  }

  const outputRoot = path.join(args.artifactRoot, 'package-foundations');
  for (const foundation of foundations) {
    const packageDirectory = path.join(repoRoot, foundation.directory);
    if (isWithin(packageDirectory, outputRoot)) {
      throw new Error(`Artifact output may not be placed inside ${foundation.directory}.`);
    }
  }

  fs.mkdirSync(args.artifactRoot, { recursive: true });
  try {
    fs.mkdirSync(outputRoot);
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'EEXIST') {
      throw new Error(`Refusing to overwrite existing artifact directory: ${outputRoot}`);
    }
    throw error;
  }

  const paths = {
    outputRoot,
    logs: path.join(outputRoot, 'logs'),
    tarballs: path.join(outputRoot, 'tarballs'),
    inventories: path.join(outputRoot, 'inventories'),
  };
  fs.mkdirSync(paths.logs);
  fs.mkdirSync(paths.tarballs);
  fs.mkdirSync(paths.inventories);
  const emptyNpmConfig = path.join(outputRoot, 'empty.npmrc');
  fs.writeFileSync(emptyNpmConfig, '');
  const npmEnvironment = {
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_update_notifier: 'false',
    npm_config_userconfig: emptyNpmConfig,
  };

  const records = foundations.map(prepareRecord);
  for (const record of records) {
    const slug = packageSlug(record.expectedName);
    const displayCommand = 'pnpm run build';
    const result = record.sourceManifestError
      ? { exitCode: 127, signal: null, stdout: '', stderr: record.sourceManifestError }
      : run('pnpm', ['run', 'build'], record.absoluteDirectory);
    const logPath = path.join(paths.logs, `${slug}-build.log`);
    writeCommandLog(logPath, displayCommand, result);
    record.build = {
      command: displayCommand,
      cwd: record.packageDirectory,
      exitCode: result.exitCode,
      log: toPosix(path.relative(paths.outputRoot, logPath)),
    };
  }

  for (const record of records) {
    record.packs = record.build.exitCode === 0
      ? [packOnce(record, 1, paths, npmEnvironment), packOnce(record, 2, paths, npmEnvironment)]
      : [];
    record.deterministic = record.packs.length === 2
      && Boolean(record.packs[0].tarballSha256)
      && record.packs[0].tarballSha256 === record.packs[1].tarballSha256
      && record.packs[0].inventorySha256 === record.packs[1].inventorySha256;
    record.passed = packagePassed(record);
  }

  const publicRecords = records.map(stripInternalFields);
  const passed = publicRecords.filter((record) => record.passed).length;
  const report = {
    schemaVersion: '1.0.0',
    verifier: 'scripts/product-reality/verify-package-foundations.mjs',
    artifactRoot: 'package-foundations',
    policy: {
      packageCount: foundations.length,
      packRunsPerPackage: 2,
      forbiddenProtocols: ['workspace:', 'file:', 'link:'],
      userNpmConfiguration: 'disabled via an empty verifier-owned npmrc',
    },
    packages: publicRecords,
    summary: {
      selected: foundations.length,
      passed,
      failed: foundations.length - passed,
      skipped: 0,
      status: passed === foundations.length ? 'passed' : 'failed',
    },
  };
  const reportPath = path.join(outputRoot, 'report.json');
  fs.writeFileSync(reportPath, canonicalJson(report));
  fs.rmSync(emptyNpmConfig);

  process.stdout.write(`${report.summary.status.toUpperCase()}: ${passed}/${foundations.length} package foundations verified.\n`);
  process.stdout.write(`${reportPath}\n`);
  if (report.summary.status !== 'passed') process.exitCode = 1;
}

try {
  main();
} catch (error) {
  process.stderr.write(`verify-package-foundations: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
