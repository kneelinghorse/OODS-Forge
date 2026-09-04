#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '../..');
const runnerRelativePath = 'scripts/product-reality/capture-s182-m04-gates.mjs';
const gateRootRelative = 'artifacts/product-reality/sprint-182/gates';
const gateRoot = path.join(repositoryRoot, gateRootRelative);
const lockfileRelativePath = 'pnpm-lock.yaml';
const packedCarrier = 'packages/mcp-server/test/product-reality/packed-consumers.s182.spec.ts';
const packageVerifier = 'scripts/product-reality/verify-package-foundations.mjs';
const canonicalFiles = [
  'mutation.patch',
  'pre-green.log',
  'receipt.json',
  'restored-green.log',
  'selected-red.log',
];
const managedGates = ['B-11', 'B-12', 'B-13', 'B-14', 'B-15'];
const setupCommand = [
  'pnpm install --frozen-lockfile --ignore-scripts',
  'pnpm --filter @oods/component-contracts run build',
  'pnpm --filter @oods/component-styles run build',
  'pnpm --filter @oods/components-react run build',
  'pnpm --filter @oods/components-vue run build',
  'pnpm --filter @oods/mcp-server run build',
].join(' && ');

const b11Selector = 'B-11 returns exact OODS-N015 with no source for a known target that is not emission-eligible';
const b12Selector = 'B-12 installs and imports every required tarball and root export in isolation';
const b13Selector = 'B-13 resolves declared dependencies and shared CSS in a clean production build';
const b14Selector = 'B-14 emits byte-identical governed source and evidence on repeated runs';
const b15Selector = 'B-15 propagates OODS-N015 as a codegen-stage error without a successful payload';

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const canonicalJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const toPosix = (value) => value.split(path.sep).join('/');

function selectorCommand(file, selector) {
  return `pnpm --filter @oods/mcp-server exec vitest run ${file} -t '${selector}'`;
}

const b11Command = selectorCommand('src/tools/__tests__/code.generate.test.ts', b11Selector);
const b12Command = selectorCommand('test/product-reality/packed-consumers.s182.spec.ts', b12Selector);
const b13Command = selectorCommand('test/product-reality/packed-consumers.s182.spec.ts', b13Selector);
const b14Command = selectorCommand('src/tools/__tests__/code.generate.test.ts', b14Selector);
const b15Command = selectorCommand('src/tools/__tests__/pipeline.test.ts', b15Selector);

function mutateOnce(contents, before, after, label) {
  const first = contents.indexOf(before);
  if (first < 0 || contents.indexOf(before, first + before.length) >= 0) {
    throw new Error(`${label}: expected exactly one byte-for-byte mutation target.`);
  }
  return `${contents.slice(0, first)}${after}${contents.slice(first + before.length)}`;
}

const legs = [
  {
    gate: 'B-11',
    slug: 'b11-capability-preflight',
    bundleRelative: `${gateRootRelative}/B-11`,
    carrier: 'packages/mcp-server/src/tools/__tests__/code.generate.test.ts',
    selector: b11Selector,
    command: b11Command,
    mutationTarget: 'packages/mcp-server/src/tools/code.generate.ts',
    mutation: 'Replace the OODS-N015 target-capability early error with the former warning-only fallback and allow emitter execution.',
    requiredAndObservedRedFinding: 'The selected carrier receives an ok result with emitted source and OODS-N015 warnings instead of its exact error-only result.',
    mutate(contents) {
      return mutateOnce(
        contents,
        `    if (readinessErrors.length > 0) {\n      return {\n        status: 'error',\n        framework,\n        code: '',\n        fileExtension: '',\n        imports: [],\n        warnings: [],\n        errors: readinessErrors,\n        meta: {\n          nodeCount: meta.nodeCount,\n          componentCount: meta.componentCount,\n        },\n      };\n    }`,
        `    if (readinessErrors.length > 0) {\n      warnings.push(...readinessErrors);\n    }`,
        'B-11 capability preflight',
      );
    },
    restoreCommand: "pnpm --filter @oods/mcp-server run build && pnpm --filter @oods/mcp-server exec vitest run src/tools/__tests__/code.generate.test.ts -t 'B-11 returns exact OODS-N015 with no source for a known target that is not emission-eligible'",
    restoredBuildArtifacts: [
      'packages/mcp-server/dist/tools/code.generate.js',
      'packages/mcp-server/dist/tools/code.generate.js.map',
      'packages/mcp-server/dist/tools/code.generate.d.ts',
      'packages/mcp-server/dist/tools/code.generate.d.ts.map',
    ],
  },
  {
    gate: 'B-12',
    leg: 'missing-tarball',
    slug: 'b12-missing-tarball',
    bundleRelative: `${gateRootRelative}/B-12/missing-tarball`,
    carrier: packedCarrier,
    selector: b12Selector,
    command: b12Command,
    mutationTarget: 'scripts/product-reality/s182-m04-consumer-harness.mjs',
    mutation: 'Omit the @oods/components-react tarball from the isolated npm install operand after recording the submitted tarball set.',
    requiredAndObservedRedFinding: 'The isolated install/import carrier cannot resolve @oods/components-react.',
    redNeedles: ['@oods/components-react'],
    mutate(contents) {
      return mutateOnce(
        contents,
        'const installOperands = tarballs.map((record) => record.tarballPath);',
        "const installOperands = tarballs.filter((record) => record.name !== '@oods/components-react').map((record) => record.tarballPath);",
        'B-12 missing tarball',
      );
    },
    restoreVerifierRelative: `${gateRootRelative}/B-12/verifier-green`,
    restoreCommand: "node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/gates/B-12/verifier-green && pnpm --filter @oods/mcp-server exec vitest run test/product-reality/packed-consumers.s182.spec.ts -t 'B-12 installs and imports every required tarball and root export in isolation'",
  },
  {
    gate: 'B-12',
    leg: 'missing-root-export',
    slug: 'b12-missing-root-export',
    bundleRelative: `${gateRootRelative}/B-12/missing-root-export`,
    carrier: packedCarrier,
    selector: b12Selector,
    command: b12Command,
    mutationTarget: 'packages/components-react/package.json',
    mutation: 'Delete exports["."] from the React package before packing while retaining every other export and implementation.',
    requiredAndObservedRedFinding: 'The isolated root import of @oods/components-react fails because the packed manifest has no root export.',
    redNeedles: ['@oods/components-react'],
    mutate(contents) {
      return mutateOnce(
        contents,
        `    ".": {\n      "types": "./dist/index.d.ts",\n      "import": "./dist/index.js",\n      "require": "./dist/index.cjs"\n    },\n`,
        '',
        'B-12 missing root export',
      );
    },
    supportingVerifierRelative: `${gateRootRelative}/B-12/missing-root-export/verifier-red`,
    verifierFinding: {
      packageName: '@oods/components-react',
      checks: [{ name: 'missingRequiredExports', findings: [{ export: '.' }] }],
    },
    restoreVerifierRelative: `${gateRootRelative}/B-12/verifier-green`,
    restoreCommand: "node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/gates/B-12/verifier-green && pnpm --filter @oods/mcp-server exec vitest run test/product-reality/packed-consumers.s182.spec.ts -t 'B-12 installs and imports every required tarball and root export in isolation'",
  },
  {
    gate: 'B-13',
    leg: 'missing-dependency',
    slug: 'b13-missing-dependency',
    bundleRelative: `${gateRootRelative}/B-13/missing-dependency`,
    carrier: packedCarrier,
    selector: b13Selector,
    command: b13Command,
    mutationTarget: 'packages/components-react/package.json',
    mutation: 'Delete dependencies["@oods/component-styles"] from the React package before packing while retaining generated bare CSS imports.',
    requiredAndObservedRedFinding: 'The packed React manifest omits its required @oods/component-styles dependency.',
    redNeedles: ['packed manifest omits declared dependencies: @oods/component-styles'],
    mutate(contents) {
      return mutateOnce(
        contents,
        `    "@oods/component-contracts": "0.1.0",\n    "@oods/component-styles": "0.1.0"\n`,
        `    "@oods/component-contracts": "0.1.0"\n`,
        'B-13 missing dependency',
      );
    },
    supportingVerifierRelative: `${gateRootRelative}/B-13/missing-dependency/verifier-red`,
    verifierFinding: {
      packageName: '@oods/components-react',
      checks: [{
        name: 'missingRequiredDependencies',
        findings: [{ section: 'dependencies', packageName: '@oods/component-styles' }],
      }],
    },
    restoreVerifierRelative: `${gateRootRelative}/B-13/verifier-green`,
    restoreCommand: "node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/gates/B-13/verifier-green && pnpm --filter @oods/mcp-server exec vitest run test/product-reality/packed-consumers.s182.spec.ts -t 'B-13 resolves declared dependencies and shared CSS in a clean production build'",
  },
  {
    gate: 'B-13',
    leg: 'missing-css-export',
    slug: 'b13-missing-css-export',
    bundleRelative: `${gateRootRelative}/B-13/missing-css-export`,
    carrier: packedCarrier,
    selector: b13Selector,
    command: b13Command,
    mutationTarget: 'packages/component-styles/package.json',
    mutation: 'Delete exports["./css"] from the shared-style package before packing while retaining the generated consumer CSS import.',
    requiredAndObservedRedFinding: 'The fresh production consumer cannot resolve @oods/component-styles/css.',
    redNeedles: ['@oods/component-styles'],
    mutate(contents) {
      return mutateOnce(
        contents,
        `    "./css": {\n      "default": "./dist/components.css"\n    },\n`,
        '',
        'B-13 missing CSS export',
      );
    },
    supportingVerifierRelative: `${gateRootRelative}/B-13/missing-css-export/verifier-red`,
    verifierFinding: {
      packageName: '@oods/component-styles',
      checks: [{ name: 'missingRequiredExports', findings: [{ export: './css' }] }],
    },
    restoreVerifierRelative: `${gateRootRelative}/B-13/verifier-green`,
    restoreCommand: "node scripts/product-reality/verify-package-foundations.mjs --artifact-root artifacts/product-reality/sprint-182/gates/B-13/verifier-green && pnpm --filter @oods/mcp-server exec vitest run test/product-reality/packed-consumers.s182.spec.ts -t 'B-13 resolves declared dependencies and shared CSS in a clean production build'",
  },
  {
    gate: 'B-14',
    slug: 'b14-determinism',
    bundleRelative: `${gateRootRelative}/B-14`,
    carrier: 'packages/mcp-server/src/tools/__tests__/code.generate.test.ts',
    selector: b14Selector,
    command: b14Command,
    mutationTarget: 'packages/mcp-server/src/tools/code.generate.ts',
    mutation: 'Append a Math.random() invocation marker only to governed React source so identical inputs emit different bytes.',
    requiredAndObservedRedFinding: 'The selected carrier observes unequal repeated React source buffers for identical governed inputs.',
    mutate(contents) {
      return mutateOnce(
        contents,
        '    code: result.code,',
        "    code: framework === 'react' ? `${result.code}\\n// B-14 mutation ${Math.random()}` : result.code,",
        'B-14 nondeterministic source',
      );
    },
    restoreCommand: "pnpm --filter @oods/mcp-server run build && pnpm --filter @oods/mcp-server exec vitest run src/tools/__tests__/code.generate.test.ts -t 'B-14 emits byte-identical governed source and evidence on repeated runs'",
    restoredBuildArtifacts: [
      'packages/mcp-server/dist/tools/code.generate.js',
      'packages/mcp-server/dist/tools/code.generate.js.map',
      'packages/mcp-server/dist/tools/code.generate.d.ts',
      'packages/mcp-server/dist/tools/code.generate.d.ts.map',
    ],
  },
  {
    gate: 'B-15',
    slug: 'b15-pipeline-propagation',
    bundleRelative: `${gateRootRelative}/B-15`,
    carrier: 'packages/mcp-server/src/tools/__tests__/pipeline.test.ts',
    selector: b15Selector,
    command: b15Command,
    mutationTarget: 'packages/mcp-server/src/tools/pipeline.ts',
    mutation: 'Exclude a first-issue OODS-N015 result from the pipeline error branch so it continues through the successful code-payload path.',
    requiredAndObservedRedFinding: 'The selected carrier receives no codegen-stage OODS-N015 error because the result continued to a code payload.',
    mutate(contents) {
      return mutateOnce(
        contents,
        "  if (codegenResult.status !== 'ok') {",
        "  if (codegenResult.status !== 'ok' && codegenResult.errors?.[0]?.code !== 'OODS-N015') {",
        'B-15 swallowed typed error',
      );
    },
    restoreCommand: "pnpm --filter @oods/mcp-server run build && pnpm --filter @oods/mcp-server exec vitest run src/tools/__tests__/pipeline.test.ts -t 'B-15 propagates OODS-N015 as a codegen-stage error without a successful payload'",
    restoredBuildArtifacts: [
      'packages/mcp-server/dist/tools/pipeline.js',
      'packages/mcp-server/dist/tools/pipeline.js.map',
      'packages/mcp-server/dist/tools/pipeline.d.ts',
      'packages/mcp-server/dist/tools/pipeline.d.ts.map',
    ],
  },
];

function help() {
  return `Usage: node ${runnerRelativePath} --review-head <40-hex-commit>\n\n` +
    'Captures B-11 through B-15 in seven fresh detached worktrees. The primary checkout must\n' +
    'be clean, exactly at the supplied review commit, and contain no existing B-11…B-15 evidence.\n';
}

function parseArguments(argv) {
  if (argv.includes('--help') || argv.includes('-h')) return { help: true };
  if (argv.length !== 2 || argv[0] !== '--review-head') {
    throw new Error(`A single required --review-head <40-hex-commit> argument is required.\n${help()}`);
  }
  if (!/^[0-9a-f]{40}$/.test(argv[1])) {
    throw new Error('--review-head must be a full lowercase 40-hex commit SHA.');
  }
  return { help: false, reviewHead: argv[1] };
}

function run(command, args, cwd = repositoryRoot) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: '1',
      FORCE_COLOR: '0',
      NO_COLOR: '1',
    },
    maxBuffer: 256 * 1024 * 1024,
    timeout: 1_200_000,
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

function runLiteral(command, cwd) {
  const result = run('/bin/sh', ['-c', command], cwd);
  return { ...result, command };
}

function output(result) {
  return `${result.stdout}${result.stderr}`;
}

function requireExit(result, exitCode, label) {
  if (result.exitCode !== exitCode) {
    const transcript = output(result).slice(-12_000);
    throw new Error(`${label} exited ${result.exitCode}, expected ${exitCode}.\n${transcript}`);
  }
}

function redact(value, replacements) {
  let result = value;
  for (const [literal, replacement] of replacements) {
    result = result.split(literal).join(replacement);
  }
  return result;
}

function commandLog(result, replacements) {
  return [
    `$ ${result.command}`,
    `exitCode=${result.exitCode}`,
    `signal=${result.signal ?? ''}`,
    '',
    '[stdout]',
    redact(result.stdout, replacements),
    '[stderr]',
    redact(result.stderr, replacements),
    ...(result.error ? ['[spawn-error]', redact(result.error, replacements)] : []),
  ].join('\n').trimEnd() + '\n';
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '');
}

function parseVitestCounts(result, label) {
  const lines = stripAnsi(output(result)).split(/\r?\n/);
  const candidates = lines.filter((line) => /^\s*Tests\s+/.test(line));
  if (candidates.length !== 1) {
    throw new Error(`${label}: expected one Vitest Tests summary, found ${candidates.length}.`);
  }
  const line = candidates[0];
  const totalMatch = line.match(/\((\d+)\)\s*$/);
  if (!totalMatch) throw new Error(`${label}: cannot parse Vitest total from ${JSON.stringify(line)}.`);
  const count = (word) => Number(line.match(new RegExp(`(\\d+)\\s+${word}`))?.[1] ?? 0);
  const passed = count('passed');
  const failed = count('failed');
  const runnerReportedSkipped = count('skipped');
  const todo = count('todo');
  const total = Number(totalMatch[1]);
  if (passed + failed + runnerReportedSkipped + todo !== total) {
    throw new Error(`${label}: Vitest summary counts do not add to ${total}: ${JSON.stringify(line)}.`);
  }
  return {
    selected: passed + failed,
    passed,
    failed,
    selectedSkipped: 0,
    runnerFiltered: runnerReportedSkipped,
    runnerReportedSkipped,
    todo,
    total,
    exitCode: result.exitCode,
  };
}

function assertVitestPhase(result, expected, label, redNeedles = []) {
  const counts = parseVitestCounts(result, label);
  if (counts.selected !== 1
    || counts.passed !== expected.passed
    || counts.failed !== expected.failed
    || counts.selectedSkipped !== 0
    || counts.todo !== 0
    || counts.runnerReportedSkipped !== counts.total - 1
    || result.exitCode !== expected.exitCode) {
    throw new Error(`${label}: wrong selected/failed/skipped sequence: ${JSON.stringify(counts)}.`);
  }
  for (const needle of redNeedles) {
    if (!output(result).includes(needle)) {
      throw new Error(`${label}: RED output lacks ${JSON.stringify(needle)}.`);
    }
  }
  return counts;
}

function unifiedPatch(relativePath, before, after) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s182-m04-patch-'));
  try {
    const beforePath = path.join(temporary, 'before');
    const afterPath = path.join(temporary, 'after');
    fs.writeFileSync(beforePath, before);
    fs.writeFileSync(afterPath, after);
    const result = spawnSync('diff', ['-u', beforePath, afterPath], { encoding: 'utf8' });
    if (result.status !== 1) throw new Error(`Unable to create mutation patch for ${relativePath}.`);
    const hunkOffset = result.stdout.indexOf('@@');
    if (hunkOffset < 0) throw new Error(`Mutation patch for ${relativePath} has no hunk.`);
    return `diff --git a/${relativePath} b/${relativePath}\n` +
      `--- a/${relativePath}\n+++ b/${relativePath}\n${result.stdout.slice(hunkOffset)}`;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

async function readSha(filePath) {
  return sha256(await fsp.readFile(filePath));
}

async function assertAbsent(filePath, label) {
  try {
    await fsp.access(filePath);
    throw new Error(`${label} already exists: ${filePath}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(label)) throw error;
    if (!error || typeof error !== 'object' || error.code !== 'ENOENT') throw error;
  }
}

function assertVerifierSummary(report, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    if (report.summary?.[key] !== value) {
      throw new Error(`${label}: verifier summary ${key}=${JSON.stringify(report.summary?.[key])}, expected ${JSON.stringify(value)}.`);
    }
  }
  if (!Array.isArray(report.packages) || report.packages.length !== 4) {
    throw new Error(`${label}: verifier did not select exactly four package records.`);
  }
}

async function inspectVerifierRed(checkoutRoot, config) {
  const reportPath = path.join(checkoutRoot, config.supportingVerifierRelative, 'package-foundations/report.json');
  const report = JSON.parse(await fsp.readFile(reportPath, 'utf8'));
  assertVerifierSummary(report, {
    selected: 4,
    passed: 3,
    failed: 1,
    skipped: 0,
    status: 'failed',
  }, `${config.gate}/${config.leg} supporting RED`);
  for (const record of report.packages) {
    if (!Array.isArray(record.packs) || record.packs.length !== 2) {
      throw new Error(`${config.gate}/${config.leg}: ${record.expectedName} lacks two pack runs.`);
    }
    for (const packed of record.packs) {
      const nonempty = Object.entries(packed.checks ?? {})
        .filter(([, findings]) => Array.isArray(findings) && findings.length > 0)
        .map(([name, findings]) => ({ name, findings }));
      const expected = record.expectedName === config.verifierFinding.packageName
        ? config.verifierFinding.checks
        : [];
      if (canonicalJson(nonempty) !== canonicalJson(expected)) {
        throw new Error(
          `${config.gate}/${config.leg}: wrong verifier findings for ${record.expectedName} run ${packed.run}: ${JSON.stringify(nonempty)}.`,
        );
      }
    }
  }
  return {
    path: toPosix(path.relative(checkoutRoot, reportPath)),
    sha256: await readSha(reportPath),
    summary: report.summary,
    packageName: config.verifierFinding.packageName,
    checks: config.verifierFinding.checks,
  };
}

async function inspectVerifierGreen(checkoutRoot, relativeRoot, label) {
  const reportPath = path.join(checkoutRoot, relativeRoot, 'package-foundations/report.json');
  const report = JSON.parse(await fsp.readFile(reportPath, 'utf8'));
  assertVerifierSummary(report, {
    selected: 4,
    passed: 4,
    failed: 0,
    skipped: 0,
    status: 'passed',
  }, label);
  for (const record of report.packages) {
    if (record.passed !== true || record.deterministic !== true || record.packs?.length !== 2) {
      throw new Error(`${label}: ${record.expectedName} is not a deterministic two-pack pass.`);
    }
    for (const packed of record.packs) {
      const findings = Object.values(packed.checks ?? {}).flat();
      if (findings.length !== 0) {
        throw new Error(`${label}: ${record.expectedName} run ${packed.run} retains findings.`);
      }
    }
  }
  return {
    path: toPosix(path.relative(checkoutRoot, reportPath)),
    sha256: await readSha(reportPath),
    summary: report.summary,
  };
}

async function inventoryDirectory(root, relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  const files = [];
  async function walk(directory) {
    const entries = await fsp.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile()) {
        files.push({
          path: toPosix(path.relative(root, absolute)),
          sha256: await readSha(absolute),
        });
      } else {
        throw new Error(`Evidence contains a non-file/non-directory entry: ${absolute}`);
      }
    }
  }
  await walk(absoluteDirectory);
  return files;
}

async function treeDigest(directory) {
  const inventory = await inventoryDirectory(directory, '.');
  return { sha256: sha256(canonicalJson(inventory)), inventory };
}

async function verifierDigests(directory) {
  const complete = await treeDigest(directory);
  const deterministicInventory = complete.inventory.filter(
    (record) => !record.path.startsWith('package-foundations/logs/'),
  );
  return {
    complete,
    deterministicInventory,
    deterministicSha256: sha256(canonicalJson(deterministicInventory)),
  };
}

async function ensureCheckoutClean(checkoutRoot, label, includeUntracked = false) {
  const status = run(
    'git',
    ['status', '--porcelain=v1', includeUntracked ? '--untracked-files=all' : '--untracked-files=no'],
    checkoutRoot,
  );
  requireExit(status, 0, `${label} status`);
  if (status.stdout.trim()) {
    throw new Error(`${label} has disallowed changes:\n${status.stdout}`);
  }
}

async function validatePrimary(reviewHead) {
  const resolved = run('git', ['rev-parse', '--verify', `${reviewHead}^{commit}`]);
  requireExit(resolved, 0, 'review HEAD resolution');
  if (resolved.stdout.trim() !== reviewHead) {
    throw new Error(`--review-head resolved to ${resolved.stdout.trim()}, not ${reviewHead}.`);
  }
  const primaryHead = run('git', ['rev-parse', 'HEAD']);
  requireExit(primaryHead, 0, 'primary HEAD');
  if (primaryHead.stdout.trim() !== reviewHead) {
    throw new Error(`Primary checkout HEAD ${primaryHead.stdout.trim()} does not equal review HEAD ${reviewHead}.`);
  }
  await ensureCheckoutClean(repositoryRoot, 'Primary checkout', true);
  const committedRunner = run('git', ['show', `${reviewHead}:${runnerRelativePath}`]);
  requireExit(committedRunner, 0, 'committed capture runner lookup');
  const liveRunner = await fsp.readFile(path.join(repositoryRoot, runnerRelativePath), 'utf8');
  if (committedRunner.stdout !== liveRunner) {
    throw new Error('Running capture script bytes do not match the supplied review HEAD.');
  }
  for (const gate of managedGates) {
    await assertAbsent(path.join(gateRoot, gate), `Refusing to overwrite ${gate} evidence`);
  }
}

async function captureInCheckout(config, checkoutRoot, sessionRoot, reviewHead) {
  const checkoutHead = run('git', ['rev-parse', 'HEAD'], checkoutRoot);
  requireExit(checkoutHead, 0, `${config.slug} checkout HEAD`);
  if (checkoutHead.stdout.trim() !== reviewHead) {
    throw new Error(`${config.slug}: disposable checkout is not at review HEAD.`);
  }
  const branch = run('git', ['symbolic-ref', '-q', 'HEAD'], checkoutRoot);
  if (branch.exitCode === 0) throw new Error(`${config.slug}: disposable checkout is not detached.`);
  if (branch.exitCode !== 1) requireExit(branch, 1, `${config.slug} detached HEAD check`);
  await ensureCheckoutClean(checkoutRoot, `${config.slug} fresh checkout`, true);

  const setup = runLiteral(setupCommand, checkoutRoot);
  requireExit(setup, 0, `${config.slug} dependency/build setup`);
  await ensureCheckoutClean(checkoutRoot, `${config.slug} post-setup checkout`, true);

  const bundleRoot = path.join(checkoutRoot, config.bundleRelative);
  await assertAbsent(bundleRoot, `${config.slug} evidence bundle`);
  await fsp.mkdir(bundleRoot, { recursive: true });
  if (config.restoreVerifierRelative) {
    await assertAbsent(path.join(checkoutRoot, config.restoreVerifierRelative), `${config.slug} restored verifier destination`);
  }

  const carrierPath = path.join(checkoutRoot, config.carrier);
  const targetPath = path.join(checkoutRoot, config.mutationTarget);
  const lockfilePath = path.join(checkoutRoot, lockfileRelativePath);
  const carrierOriginal = await fsp.readFile(carrierPath);
  const targetOriginal = await fsp.readFile(targetPath, 'utf8');
  const carrierSha256 = sha256(carrierOriginal);
  const targetOriginalSha256 = sha256(targetOriginal);
  const lockfileSha256 = await readSha(lockfilePath);
  const replacements = [
    [checkoutRoot, '<disposable-checkout>'],
    [sessionRoot, '<capture-session>'],
  ];

  const pre = runLiteral(config.command, checkoutRoot);
  const preCounts = assertVitestPhase(pre, { passed: 1, failed: 0, exitCode: 0 }, `${config.slug} pre-mutation`);
  await fsp.writeFile(path.join(bundleRoot, 'pre-green.log'), commandLog(pre, replacements));

  const mutated = config.mutate(targetOriginal);
  if (mutated === targetOriginal) throw new Error(`${config.slug}: mutation made no byte change.`);
  const targetMutatedSha256 = sha256(mutated);
  await fsp.writeFile(
    path.join(bundleRoot, 'mutation.patch'),
    unifiedPatch(config.mutationTarget, targetOriginal, mutated),
  );

  let supportingVerifier = null;
  let supportingVerifierRun = null;
  let red;
  let redCounts;
  try {
    await fsp.writeFile(targetPath, mutated);
    const changed = run('git', ['diff', '--name-only'], checkoutRoot);
    requireExit(changed, 0, `${config.slug} mutation diff`);
    if (changed.stdout.trim() !== config.mutationTarget) {
      throw new Error(`${config.slug}: mutation changed unexpected tracked paths:\n${changed.stdout}`);
    }
    if (config.supportingVerifierRelative) {
      const supportingCommand = `node ${packageVerifier} --artifact-root ${config.supportingVerifierRelative}`;
      supportingVerifierRun = runLiteral(supportingCommand, checkoutRoot);
      requireExit(supportingVerifierRun, 1, `${config.slug} supporting verifier RED`);
      supportingVerifier = await inspectVerifierRed(checkoutRoot, config);
    }
    red = runLiteral(config.command, checkoutRoot);
    redCounts = assertVitestPhase(
      red,
      { passed: 0, failed: 1, exitCode: 1 },
      `${config.slug} selected RED`,
      config.redNeedles ?? [],
    );
    const redLog = [
      ...(supportingVerifierRun ? [commandLog(supportingVerifierRun, replacements).trimEnd(), ''] : []),
      commandLog(red, replacements),
    ].join('\n');
    await fsp.writeFile(path.join(bundleRoot, 'selected-red.log'), redLog);
  } finally {
    await fsp.writeFile(targetPath, targetOriginal);
  }

  if (await readSha(targetPath) !== targetOriginalSha256) {
    throw new Error(`${config.slug}: mutation target was not restored byte-identically before rebuild.`);
  }

  const restored = runLiteral(config.restoreCommand, checkoutRoot);
  requireExit(restored, 0, `${config.slug} literal restoration command`);
  const restoredCounts = assertVitestPhase(
    restored,
    { passed: 1, failed: 0, exitCode: 0 },
    `${config.slug} restored GREEN`,
  );
  await fsp.writeFile(path.join(bundleRoot, 'restored-green.log'), commandLog(restored, replacements));

  let restoredVerifier = null;
  if (config.restoreVerifierRelative) {
    restoredVerifier = await inspectVerifierGreen(
      checkoutRoot,
      config.restoreVerifierRelative,
      `${config.slug} restored package verifier`,
    );
  }
  if (await readSha(targetPath) !== targetOriginalSha256) {
    throw new Error(`${config.slug}: mutation target differs after restoration command.`);
  }
  if (await readSha(carrierPath) !== carrierSha256) {
    throw new Error(`${config.slug}: locked carrier differs after restoration command.`);
  }
  if (await readSha(lockfilePath) !== lockfileSha256) {
    throw new Error(`${config.slug}: pnpm-lock.yaml changed.`);
  }
  await ensureCheckoutClean(checkoutRoot, `${config.slug} restored checkout`);

  const restoredBuildArtifacts = [];
  for (const relativePath of config.restoredBuildArtifacts ?? []) {
    const absolutePath = path.join(checkoutRoot, relativePath);
    restoredBuildArtifacts.push({ path: relativePath, sha256: await readSha(absolutePath) });
  }

  const generatedArtifacts = await inventoryDirectory(checkoutRoot, config.bundleRelative);
  generatedArtifacts.push(...restoredBuildArtifacts);
  generatedArtifacts.sort((left, right) => left.path.localeCompare(right.path));

  const stagedBundle = path.join(sessionRoot, 'staged', config.bundleRelative);
  await fsp.mkdir(path.dirname(stagedBundle), { recursive: true });
  await fsp.cp(bundleRoot, stagedBundle, { recursive: true, errorOnExist: true, force: false });

  let greenCandidate = null;
  if (config.restoreVerifierRelative) {
    greenCandidate = path.join(sessionRoot, 'green-candidates', config.slug);
    await fsp.mkdir(path.dirname(greenCandidate), { recursive: true });
    await fsp.cp(path.join(checkoutRoot, config.restoreVerifierRelative), greenCandidate, {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  }

  const toolchain = {
    node: process.version,
    npm: run('npm', ['--version'], checkoutRoot).stdout.trim(),
    pnpm: run('pnpm', ['--version'], checkoutRoot).stdout.trim(),
    vitest: '3.2.4',
  };
  return {
    config,
    stagedBundle,
    greenCandidate,
    receipt: {
      schemaVersion: '1.0.0',
      mission: 's182-m04',
      bite: config.gate,
      ...(config.leg ? { leg: config.leg } : {}),
      reviewHead,
      carrier: {
        path: config.carrier,
        sha256: carrierSha256,
        selector: config.selector,
      },
      mutationTarget: {
        path: config.mutationTarget,
        originalSha256: targetOriginalSha256,
        mutatedSha256: targetMutatedSha256,
        restoredSha256: await readSha(targetPath),
      },
      command: config.command,
      mutation: config.mutation,
      requiredAndObservedRedFinding: config.requiredAndObservedRedFinding,
      mutationPatchSha256: await readSha(path.join(bundleRoot, 'mutation.patch')),
      sequence: {
        preMutation: preCounts,
        mutation: redCounts,
        restoration: restoredCounts,
      },
      supportingVerifier,
      restoreCommand: config.restoreCommand,
      restoredVerifier,
      restoration: {
        byteIdentical: true,
        mutationTargetSha256: await readSha(targetPath),
        carrierByteIdentical: true,
        carrierSha256: await readSha(carrierPath),
        lockfileUnchanged: true,
        lockfileSha256,
      },
      execution: {
        checkoutKind: 'fresh detached git worktree',
        setupCommand,
        setupExitCode: setup.exitCode,
        checkoutHead: reviewHead,
        detached: true,
        freshCheckoutCleanBeforeSetup: true,
        postSetupCheckoutClean: true,
        trackedCleanBeforeMutation: true,
        trackedCleanAfterRestoration: true,
        expectedVerifierArtifactsExcludedFromFinalCleanlinessCheck: Boolean(config.restoreVerifierRelative),
        worktreeRemovedBeforePublication: true,
      },
      toolchain,
      generatedArtifacts,
      canonicalGateDestination: `${config.bundleRelative}/`,
    },
  };
}

async function captureDisposable(config, sessionRoot, reviewHead) {
  const checkoutRoot = path.join(sessionRoot, 'checkouts', config.slug);
  await fsp.mkdir(path.dirname(checkoutRoot), { recursive: true });
  const add = run('git', ['worktree', 'add', '--detach', checkoutRoot, reviewHead]);
  requireExit(add, 0, `${config.slug} worktree creation`);

  let captured;
  let captureError;
  try {
    captured = await captureInCheckout(config, checkoutRoot, sessionRoot, reviewHead);
  } catch (error) {
    captureError = error;
  }

  const remove = run('git', ['worktree', 'remove', '--force', checkoutRoot]);
  const prune = run('git', ['worktree', 'prune']);
  let cleanupError = null;
  if (remove.exitCode !== 0) cleanupError = new Error(`${config.slug}: worktree removal failed.\n${output(remove)}`);
  else if (prune.exitCode !== 0) cleanupError = new Error(`${config.slug}: worktree prune failed.\n${output(prune)}`);
  else if (fs.existsSync(checkoutRoot)) cleanupError = new Error(`${config.slug}: worktree path remains after removal.`);

  if (captureError) {
    if (cleanupError) captureError.message += `\nCleanup also failed: ${cleanupError.message}`;
    throw captureError;
  }
  if (cleanupError) throw cleanupError;
  if (!captured) throw new Error(`${config.slug}: capture returned no result.`);

  await assertDirectBundle(captured, false);
  return captured;
}

async function assertDirectBundle(captured, includeReceipt) {
  const { config, stagedBundle } = captured;
  const entries = await fsp.readdir(stagedBundle, { withFileTypes: true });
  const directFiles = entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  const expectedFiles = includeReceipt
    ? canonicalFiles
    : canonicalFiles.filter((fileName) => fileName !== 'receipt.json');
  const expectedDirectories = config.supportingVerifierRelative ? ['verifier-red'] : [];
  const directDirectories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (canonicalJson(directFiles) !== canonicalJson(expectedFiles)
    || canonicalJson(directDirectories) !== canonicalJson(expectedDirectories)) {
    throw new Error(
      `${config.slug}: canonical bundle entries differ: files=${JSON.stringify(directFiles)}, directories=${JSON.stringify(directDirectories)}.`,
    );
  }
}

async function stageCanonicalGreen(captures, gate, sessionRoot) {
  const candidates = captures.filter((capture) => capture.config.gate === gate).map((capture) => capture.greenCandidate);
  if (candidates.length !== 2 || candidates.some((candidate) => !candidate)) {
    throw new Error(`${gate}: expected exactly two restored verifier candidates.`);
  }
  const [first, second] = await Promise.all(candidates.map((candidate) => verifierDigests(candidate)));
  if (canonicalJson(first.deterministicInventory) !== canonicalJson(second.deterministicInventory)) {
    throw new Error(`${gate}: deterministic restored verifier outputs differ across clean mutation legs.`);
  }
  const destination = path.join(sessionRoot, 'staged', gateRootRelative, gate, 'verifier-green');
  await fsp.cp(candidates[0], destination, { recursive: true, errorOnExist: true, force: false });
  const canonicalPrefix = `${gateRootRelative}/${gate}/verifier-green`;
  const canonicalInventory = first.complete.inventory.map((record) => ({
    path: `${canonicalPrefix}/${record.path}`,
    sha256: record.sha256,
  }));
  assertCanonicalVerifierInventory(canonicalInventory, gate);
  for (const capture of captures.filter((candidate) => candidate.config.gate === gate)) {
    capture.receipt.generatedArtifacts.push(...canonicalInventory);
    capture.receipt.generatedArtifacts.sort((left, right) => left.path.localeCompare(right.path));
    capture.receipt.restoredVerifier.canonicalVerifierGreen = {
      selectedAfterCrossLegComparison: true,
      completeTreeSha256: first.complete.sha256,
      deterministicTreeSha256: first.deterministicSha256,
      files: canonicalInventory.length,
    };
  }
  return {
    gate,
    deterministicSha256: first.deterministicSha256,
    canonicalTreeSha256: first.complete.sha256,
    files: first.complete.inventory.length,
    excludedFromDeterministicDigest: 'package-foundations/logs/**',
  };
}

function assertCanonicalVerifierInventory(inventory, gate) {
  const relative = inventory.map((record) => record.path.slice(`${gateRootRelative}/${gate}/verifier-green/`.length));
  const counts = {
    reports: relative.filter((filePath) => filePath === 'package-foundations/report.json').length,
    logs: relative.filter((filePath) => filePath.startsWith('package-foundations/logs/')).length,
    inventories: relative.filter((filePath) => filePath.startsWith('package-foundations/inventories/')).length,
    tarballs: relative.filter((filePath) => (
      filePath.startsWith('package-foundations/tarballs/') && filePath.endsWith('.tgz')
    )).length,
  };
  if (inventory.length !== 29
    || counts.reports !== 1
    || counts.logs !== 12
    || counts.inventories !== 8
    || counts.tarballs !== 8) {
    throw new Error(`${gate}: canonical verifier-green inventory is incomplete: ${JSON.stringify({ files: inventory.length, ...counts })}.`);
  }
}

async function finalizeReceipts(captures) {
  for (const captured of captures) {
    if (captured.config.restoreVerifierRelative) {
      const greenPrefix = `${captured.config.restoreVerifierRelative}/package-foundations/`;
      const greenArtifacts = captured.receipt.generatedArtifacts.filter((record) => (
        record.path.startsWith(greenPrefix)
      ));
      assertCanonicalVerifierInventory(greenArtifacts, captured.config.gate);
    }
    if (captured.config.supportingVerifierRelative) {
      const redPrefix = `${captured.config.supportingVerifierRelative}/package-foundations/`;
      const redArtifacts = captured.receipt.generatedArtifacts.filter((record) => (
        record.path.startsWith(redPrefix)
      ));
      if (redArtifacts.length !== 29
        || redArtifacts.filter((record) => record.path === `${redPrefix}report.json`).length !== 1) {
        throw new Error(
          `${captured.config.slug}: supporting verifier-red inventory is incomplete (${redArtifacts.length} files).`,
        );
      }
    }
    await fsp.writeFile(
      path.join(captured.stagedBundle, 'receipt.json'),
      canonicalJson(captured.receipt),
    );
    await assertDirectBundle(captured, true);
  }
}

async function publishStaged(sessionRoot) {
  const publishRoots = [];
  const publishedRoots = [];
  try {
    for (const gate of managedGates) {
      const source = path.join(sessionRoot, 'staged', gateRootRelative, gate);
      const temporary = path.join(gateRoot, `.s182-m04-capture-${process.pid}-${gate}`);
      await assertAbsent(temporary, `${gate} publication staging`);
      await assertAbsent(path.join(gateRoot, gate), `${gate} canonical destination`);
      await fsp.cp(source, temporary, { recursive: true, errorOnExist: true, force: false });
      publishRoots.push({ gate, temporary, destination: path.join(gateRoot, gate) });
    }
    for (const record of publishRoots) {
      await fsp.rename(record.temporary, record.destination);
      publishedRoots.push(record);
    }
  } catch (error) {
    for (const record of publishedRoots.reverse()) {
      if (fs.existsSync(record.destination)) await fsp.rename(record.destination, record.temporary);
    }
    for (const record of publishRoots) {
      if (fs.existsSync(record.temporary)) await fsp.rm(record.temporary, { recursive: true, force: true });
    }
    throw error;
  }
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(help());
    return;
  }
  await validatePrimary(args.reviewHead);
  const sessionRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'oods-s182-m04-gates-'));
  let published = false;
  try {
    const captures = [];
    for (const config of legs) {
      captures.push(await captureDisposable(config, sessionRoot, args.reviewHead));
    }
    const green = [
      await stageCanonicalGreen(captures, 'B-12', sessionRoot),
      await stageCanonicalGreen(captures, 'B-13', sessionRoot),
    ];
    await finalizeReceipts(captures);
    const receiptDigests = [];
    for (const config of legs) {
      const receiptPath = path.join(sessionRoot, 'staged', config.bundleRelative, 'receipt.json');
      receiptDigests.push({
        gate: config.gate,
        ...(config.leg ? { leg: config.leg } : {}),
        sha256: await readSha(receiptPath),
      });
    }
    await publishStaged(sessionRoot);
    published = true;
    process.stdout.write(`${canonicalJson({
      status: 'passed',
      reviewHead: args.reviewHead,
      disposableWorktrees: legs.length,
      receiptDigests,
      restoredVerifierTrees: green,
    })}\n`);
    process.stdout.write('PASS: B-11 through B-15 captured in seven removed clean detached worktrees.\n');
    process.stdout.write('The canonical *.log files are ignored by Git; stage them explicitly with git add -f.\n');
  } finally {
    if (published) await fsp.rm(sessionRoot, { recursive: true, force: true });
    else process.stderr.write(`Capture failed before publication; disposable diagnostics remain at ${sessionRoot}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`capture-s182-m04-gates: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
