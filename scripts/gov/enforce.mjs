#!/usr/bin/env node

import { promises as fs, realpathSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const DEFAULT_GOVERNANCE_DIR = 'artifacts/state/governance';
const DEFAULT_TOKENS_PATH = 'artifacts/state/tokens.json';
const DEFAULT_POLICY_PATH = 'configs/policies/token-namespaces.json';
const BREAKING_LABEL = 'token-change:breaking';

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const policy = await loadPolicy(options.policyPath);
  const tokensSummary = await loadJson(resolvePath(options.tokensPath));
  const reports = await loadGovernanceReports(resolvePath(options.governanceDir));

  const errors = [];
  const warnings = [];

  const labels = resolveLabels(options.labels);

  const floorError = assertReportFloor(reports, options.governanceDir);
  if (floorError) {
    errors.push(floorError);
  }

  for (const report of reports) {
    const brand = report.brand ?? report.data?.brand ?? report.file;
    const summary = report.data?.summary ?? {};
    const highRisk = Number(summary.highRisk ?? 0);
    const requiresBreaking = Boolean(report.data?.requiresBreakingLabel);

    if (highRisk > 0 && requiresBreaking && !labels.includes(BREAKING_LABEL)) {
      errors.push(
        `Brand ${brand} has ${highRisk} high-risk token changes but PR lacks label "${BREAKING_LABEL}".`
      );
    }

    const protectedIssues = evaluateProtectedCoverage(report.data, policy.protectedNamespaces);
    errors.push(...protectedIssues.errors.map((message) => `Brand ${brand}: ${message}`));
    warnings.push(...protectedIssues.warnings.map((message) => `Brand ${brand}: ${message}`));
  }

  const literalViolations = Array.isArray(tokensSummary?.purityViolations)
    ? tokensSummary.purityViolations.length
    : 0;
  if (literalViolations > 0) {
    errors.push(`Detected ${literalViolations} CSS color literals; replace with semantic tokens before merging.`);
  }

  if (errors.length > 0) {
    console.error('Token governance enforcement failed:');
    for (const message of errors) {
      console.error(`  • ${message}`);
    }
    if (warnings.length > 0) {
      console.warn('\nWarnings:');
      for (const message of warnings) {
        console.warn(`  • ${message}`);
      }
    }
    process.exitCode = 1;
    return;
  }

  console.log('Token governance enforcement passed.');
  if (warnings.length > 0) {
    console.warn('Warnings:');
    for (const message of warnings) {
      console.warn(`  • ${message}`);
    }
  }
}

/**
 * s174 m02 — the label check lives INSIDE the per-report loop, so zero reports (or one)
 * means the loop simply does not run and enforcement "passes" having examined nothing.
 * That is exactly how the gate was vacuous: the upstream diff wrote no reports and this
 * reported success. Both brands must be present or there is nothing to enforce over.
 *
 * s175 m02 — extracted so the floor has a unit control (memo §1b U3).
 *
 * @returns {string | null} the error to record, or null when the floor is satisfied.
 */
export function assertReportFloor(reports, governanceDir) {
  const EXPECTED_BRAND_REPORTS = 2;
  if (reports.length < EXPECTED_BRAND_REPORTS) {
    return `Expected ${EXPECTED_BRAND_REPORTS} brand governance reports (A and B) in ${governanceDir}; found ${reports.length}${
      reports.length > 0 ? ` (${reports.map((report) => report.brand).join(', ')})` : ''
    }. Enforcement over a missing report is a silent pass, so this is an error, not a warning.`;
  }
  return null;
}

function parseArgs(argv) {
  const options = {
    governanceDir: DEFAULT_GOVERNANCE_DIR,
    tokensPath: DEFAULT_TOKENS_PATH,
    policyPath: DEFAULT_POLICY_PATH,
    labels: [],
    help: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--governanceDir':
        options.governanceDir = expectValue(argv, ++i, '--governanceDir');
        break;
      case '--tokens':
        options.tokensPath = expectValue(argv, ++i, '--tokens');
        break;
      case '--policy':
        options.policyPath = expectValue(argv, ++i, '--policy');
        break;
      case '--labels':
        options.labels = expectValue(argv, ++i, '--labels')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown argument: ${arg}`);
        }
    }
  }

  return options;
}

export function resolveLabels(explicitLabels) {
  let labels = explicitLabels;
  if (!labels.length && typeof process.env.PR_LABELS === 'string') {
    labels = process.env.PR_LABELS.split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return labels.map((label) => label.toLowerCase());
}

function expectValue(argv, index, flag) {
  const value = argv[index];
  if (!value) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function printHelp() {
  console.log(
    [
      'Usage: node scripts/gov/enforce.mjs [options]',
      '',
      'Options:',
      `  --governanceDir <dir>   Governance report directory (default: ${DEFAULT_GOVERNANCE_DIR})`,
      `  --tokens <file>         Tokens summary JSON (default: ${DEFAULT_TOKENS_PATH})`,
      `  --policy <file>         Namespace policy (default: ${DEFAULT_POLICY_PATH})`,
      '  --labels <list>         Comma-separated PR labels',
      '  --help, -h              Show this message'
    ].join('\n')
  );
}

async function loadPolicy(policyPath) {
  const absolute = resolvePath(policyPath);
  const raw = await fs.readFile(absolute, 'utf8');
  const json = JSON.parse(raw);
  return {
    protectedNamespaces: toLowerCaseArray(json?.protected?.namespaces)
  };
}

export async function loadGovernanceReports(directory) {
  const reports = [];
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }
    const file = path.join(directory, entry.name);
    const raw = await fs.readFile(file, 'utf8');
    try {
      const json = JSON.parse(raw);
      reports.push({ file, brand: json.brand ?? entry.name, data: json });
    } catch (error) {
      throw new Error(`Failed to parse ${file}: ${(error && error.message) || error}`);
    }
  }

  return reports;
}

function evaluateProtectedCoverage(report, protectedNamespaces) {
  const errors = [];
  const warnings = [];

  if (!report) {
    return { errors, warnings };
  }

  const protectedSet = new Set(protectedNamespaces);
  if (protectedSet.size === 0) {
    return { errors, warnings };
  }

  const allChanges = collectChanges(report.changes);
  const codeowners = Array.isArray(report.codeowners) ? report.codeowners : [];

  for (const change of allChanges) {
    const namespace = String(change.namespace ?? '').toLowerCase();
    if (!protectedSet.has(namespace)) {
      continue;
    }
    const matchingEntry = codeowners.find(
      (entry) =>
        entry.path === change.path &&
        (!change.sourceHint || entry.sourceHint === change.sourceHint)
    );
    if (!matchingEntry) {
      errors.push(
        `Protected namespace change "${change.path}" lacks CODEOWNERS coverage.`
      );
      continue;
    }
    if (!matchingEntry.covered) {
      errors.push(
        `Protected namespace change "${change.path}" is not covered by CODEOWNERS (pattern ${matchingEntry.matchingOwner ?? 'n/a'}).`
      );
    }
  }

  return { errors, warnings };
}

function collectChanges(changes) {
  if (!changes) {
    return [];
  }
  const lists = [];
  if (Array.isArray(changes.added)) {
    lists.push(...changes.added);
  }
  if (Array.isArray(changes.removed)) {
    lists.push(...changes.removed);
  }
  if (Array.isArray(changes.modified)) {
    lists.push(...changes.modified);
  }
  return lists;
}

async function loadJson(filePath) {
  try {
    const raw = await fs.readFile(resolvePath(filePath), 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

function resolvePath(targetPath) {
  if (!targetPath) {
    return repoRoot;
  }
  if (path.isAbsolute(targetPath)) {
    return targetPath;
  }
  return path.join(repoRoot, targetPath);
}

function toLowerCaseArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .map((value) => String(value ?? '').toLowerCase())
    .filter(Boolean);
}

/**
 * ENTRY GUARD (s175 m02, the s169 m03 shape from tools/tokens-governance/index.ts:1410-1424).
 * This used to be a bare top-level `await main()`, which meant `import`ing the module RAN
 * THE CLI — every check, empty argv, writing the tracked diagnostics.json — so none of the
 * red paths above could be unit-tested. CLI behaviour is byte-identical: invoked as a
 * script, `process.argv[1]` is this file and `main()` runs exactly as before.
 *
 * One deliberate difference from the precedent: both sides are compared as REAL paths. Node
 * realpath's the main module's `import.meta.url` but leaves `process.argv[1]` as typed, so a
 * script invoked through a symlinked path (macOS's /var → /private/var tmpdir, where the
 * m01 subprocess control copies these scripts) would otherwise exit 0 having run nothing —
 * a silent pass from a governance gate, the exact failure class these controls exist for.
 */
function resolveInvocationPath(targetPath) {
  try {
    return realpathSync(targetPath);
  } catch {
    return path.resolve(targetPath);
  }
}

const invokedPath = process.argv[1];
const isDirectInvocation =
  typeof invokedPath === 'string' &&
  resolveInvocationPath(fileURLToPath(import.meta.url)) === resolveInvocationPath(invokedPath);

if (isDirectInvocation || pathToFileURL(invokedPath ?? '').href === import.meta.url) {
  main().catch((error) => {
    console.error(`enforce failed: ${(error && error.message) || error}`);
    process.exitCode = 1;
  });
}
