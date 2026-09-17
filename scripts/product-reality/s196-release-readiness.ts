#!/usr/bin/env tsx
/** Gate 2 facts are observations, not publication or licensing decisions. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const FACTS_PATH = 'artifacts/product-reality/sprint-204/readiness/release-readiness-facts.json';
export const BASELINE_PATH = 'artifacts/product-reality/sprint-196/m06/package-shapes-baseline.json';
export const PACKET_PATH = 'cmos/planning/forge-gate2-decision-packet.md';
export const START = '<!-- BEGIN GENERATED GATE2 FACTS -->';
export const END = '<!-- END GENERATED GATE2 FACTS -->';
const PORTABLE = 'artifacts/product-reality/sprint-196/m03/ci';
const RELEASE = 'artifacts/product-reality/sprint-196/m05/ci-followthrough';
const FIELDS = ['private', 'license', 'publishConfig', 'files', 'exports', 'bin', 'engines'] as const;
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const serialize = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
type Json = Record<string, any>;
type Input = { path: string; bytes: number; sha256: string };
export type PackageFacts = { path: string; name: string; version: string; fields: Json; licenseFiles: Input[]; manifestSha256: string };

function inside(root: string, relative: string): string {
  assert(!path.isAbsolute(relative) && !relative.split('/').includes('..'), `Not a repository-relative input: ${relative}`);
  return path.join(root, relative);
}
function patternsFrom(bytes: string): string[] {
  const document = yaml.load(bytes) as { packages?: unknown };
  assert(Array.isArray(document?.packages) && document.packages.every(item => typeof item === 'string'), 'Missing workspace patterns');
  for (const pattern of document.packages) assert(/^[\w.-]+(?:\/[\w.-]+)*(?:\/\*)?$/.test(pattern) && !pattern.split('/').includes('..'), `Unsupported workspace pattern: ${pattern}`);
  return document.packages;
}
function workspaceMatch(file: string, patterns: string[]): boolean {
  return patterns.some(pattern => new RegExp(`^${pattern.split('/').map(part => part === '*' ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/')}/package\\.json$`).test(file));
}
function packagePaths(root: string, patterns: string[]): string[] {
  const paths = new Set<string>();
  for (const pattern of patterns) {
    const dirs = pattern.endsWith('/*')
      ? fs.readdirSync(inside(root, pattern.slice(0, -2)), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => `${pattern.slice(0, -2)}/${entry.name}`)
      : [pattern];
    for (const directory of dirs) if (fs.existsSync(inside(root, `${directory}/package.json`))) paths.add(`${directory}/package.json`);
  }
  return ['package.json', ...[...paths].sort()];
}
function readPackage(root: string, relative: string): PackageFacts {
  const bytes = fs.readFileSync(inside(root, relative));
  const manifest = JSON.parse(bytes.toString());
  assert(typeof manifest.name === 'string' && typeof manifest.version === 'string', `Package identity missing: ${relative}`);
  const directory = path.posix.dirname(relative);
  const licenseFiles = fs.readdirSync(inside(root, directory), { withFileTypes: true })
    .filter(entry => entry.isFile() && /^licen[cs]e(?:[.-].+)?$/i.test(entry.name))
    .map(entry => {
      const file = path.posix.join(directory, entry.name), content = fs.readFileSync(inside(root, file));
      return { path: file, bytes: content.length, sha256: hash(content) };
    }).sort((a, b) => a.path.localeCompare(b.path));
  return { path: relative, name: manifest.name, version: manifest.version,
    fields: Object.fromEntries(FIELDS.filter(key => Object.hasOwn(manifest, key)).map(key => [key, manifest[key]])), licenseFiles, manifestSha256: hash(bytes) };
}

/** Includes the root first, then every package selected by pnpm-workspace.yaml. */
export function collectPackageFacts(root: string): PackageFacts[] {
  const patterns = patternsFrom(fs.readFileSync(inside(root, 'pnpm-workspace.yaml'), 'utf8'));
  const rows = packagePaths(root, patterns).map(file => readPackage(root, file));
  assert.equal(new Set(rows.map(row => row.name)).size, rows.length, 'Duplicate workspace package names');
  return rows;
}

/** One-time Git measurement; ordinary generation never consults live Git state. */
export function freezePackageBaseline(root: string, head: string): Json {
  assert.match(head, /^[a-f0-9]{40}$/, 'Baseline requires an exact full commit');
  const git = (args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const workspacePatterns = patternsFrom(git(['show', `${head}:pnpm-workspace.yaml`]));
  const files = git(['ls-tree', '-rz', '--name-only', head, '--', 'package.json', ...new Set(workspacePatterns.map(pattern => pattern.split('/')[0]))]).split('\0').filter(file => file === 'package.json' || workspaceMatch(file, workspacePatterns)).sort();
  const packages = files.map(file => {
    const bytes = git(['show', `${head}:${file}`]), manifest = JSON.parse(bytes);
    return { path: file, name: manifest.name, shape: Object.fromEntries(['private', 'publishConfig', 'license'].filter(key => Object.hasOwn(manifest, key)).map(key => [key, manifest[key]])), manifestSha256: hash(bytes) };
  });
  assert(packages.some(row => row.path === 'package.json'));
  const result = { schemaVersion: 1, sourceHead: head, workspacePatterns, packages };
  const output = inside(root, BASELINE_PATH); fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, serialize(result), { flag: 'wx' });
  return result;
}

function reader(root: string) {
  const inputs = new Map<string, Input>();
  const bytes = (relative: string): Buffer => {
    const content = fs.readFileSync(inside(root, relative));
    inputs.set(relative, { path: relative, bytes: content.length, sha256: hash(content) });
    return content;
  };
  return { bytes, json: (relative: string): Json => JSON.parse(bytes(relative).toString()),
    inputs: () => [...inputs.values()].sort((a, b) => a.path.localeCompare(b.path)) };
}
type Reader = ReturnType<typeof reader>;
function identity(read: Reader, base: string) {
  const source = read.json(`${base}/source-commit.remote.json`), merge = read.json(`${base}/merge-commit.remote.json`);
  assert.match(source.sha, /^[a-f0-9]{40}$/); assert.match(merge.sha, /^[a-f0-9]{40}$/);
  assert.notEqual(source.sha, merge.sha, 'Source and synthetic merge identities must remain distinct');
  assert.equal(source.tree.sha, merge.tree.sha, 'Remote source and synthetic merge trees differ');
  assert.equal(merge.parents[1]?.sha, source.sha, 'Source is not the synthetic merge second parent');
  return { sourceCommit: source.sha as string, executedMergeCommit: merge.sha as string, treeSha: source.tree.sha as string, treesIdentical: true };
}
function bundle(read: Reader, base: string, provenance: ReturnType<typeof identity>) {
  const manifestPath = `${base}/forge-runtime.manifest.json`, manifest = read.json(manifestPath);
  const sbom = read.json(`${base}/runtime-sbom-lite.json`);
  const sidecar = read.bytes(`${base}/forge-runtime.tar.gz.sha256`).toString().trim().split(/\s+/);
  assert.equal(manifest.schemaVersion, 'forge-runtime-manifest/v1'); assert.equal(manifest.dirty, false);
  assert.equal(manifest.commit, provenance.executedMergeCommit, 'Bundle does not identify the executed synthetic merge');
  assert.match(manifest.archive.sha256, /^[a-f0-9]{64}$/); assert(manifest.archive.byteSize > 0);
  assert.deepEqual(sidecar, [manifest.archive.sha256, manifest.archive.file], 'Archive sidecar differs from manifest');
  assert.equal(hash(read.bytes(`${base}/runtime-sbom-lite.json`)), manifest.sbomLite.sha256, 'SBOM bytes differ from manifest');
  assert.equal(sbom.packages.length, manifest.thirdPartyCount); assert.equal(sbom.summary.packageCount, manifest.thirdPartyCount);
  assert.equal(manifest.sbomLite.packageCount, manifest.thirdPartyCount);
  assert(Object.hasOwn(manifest.packageVersions, '@oods/mcp-bridge'), 'Bundle omits bridge');
  return { manifestPath, commit: manifest.commit as string, archive: manifest.archive, archiveBinaryRetained: false,
    payloadTreeSha256: manifest.payloadTreeSha256 as string, thirdPartyCount: manifest.thirdPartyCount as number,
    nodeFloor: manifest.nodeFloor as string, buildNodeMajor: manifest.ciNode as number,
    runtimePackages: manifest.packageVersions as Record<string, string>, bridgeIncluded: true,
    structuredDataManifestHash: manifest.structuredDataManifest.sha256 as string,
    determinismCertified: manifest.archivePacking.determinismCertified as boolean };
}
function canonical(value: any): any {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
function portableCell(read: Reader, zone: string, provenance: ReturnType<typeof identity>) {
  const directory = `${PORTABLE}/${zone}`, verification = read.json(`${directory}/verification.json`);
  // Hash-bind original retained evidence before deriving results from raw E2E/job data.
  for (const entry of verification.evidence) {
    const bytes = read.bytes(`${PORTABLE}/${entry.path}`);
    assert.equal(bytes.length, entry.bytes, `Evidence size changed: ${entry.path}`);
    assert.equal(hash(bytes), entry.sha256, `Evidence digest changed: ${entry.path}`);
  }
  const artifact = bundle(read, `${directory}/forge-runtime-out-1`, provenance);
  const e2e = read.json(`${directory}/portable-runtime-e2e.json`), job = read.json(`${directory}/job.json`);
  assert.equal(job.conclusion, 'success'); assert.equal(job.status, 'completed');
  assert(job.steps.every((step: Json) => step.conclusion === 'success'), 'Portable CI step did not succeed');
  assert.equal(e2e.status, 'pass'); assert.equal(e2e.manifest.commit, artifact.commit);
  assert.equal(e2e.manifest.payloadTreeSha256, artifact.payloadTreeSha256);
  assert.equal(e2e.manifest.thirdPartyCount, artifact.thirdPartyCount);
  assert.equal(e2e.nodeVersion, verification.nodeVersion); assert.equal(verification.sourceCommit, provenance.sourceCommit);
  assert.equal(verification.executedMergeCommit, provenance.executedMergeCommit);
  assert.equal(verification.archiveSha256, artifact.archive.sha256); assert.equal(verification.archiveBytes, artifact.archive.byteSize);
  assert.equal(job.databaseId, verification.jobId); assert.equal(e2e.tools.count, 19);
  const outcomes = Object.values(e2e.calls.outcomes) as Json[];
  assert.equal(outcomes.length, e2e.tools.count);
  const pass = outcomes.filter(row => row.outcome === 'pass').length, typed = outcomes.filter(row => row.outcome === 'typed').length;
  assert.equal(pass, 17); assert.equal(typed, 2);
  assert.equal(e2e.calls.outcomes['brand.apply'].code, 'OODS-N020'); assert.equal(e2e.calls.outcomes['design.preview'].code, 'OODS-N019');
  assert.equal(e2e.calls.totalAcrossProcesses, 30); assert.equal(e2e.calls.health.status, 'ok');
  assert.deepEqual(e2e.calls.health.warnings, []); assert.equal(e2e.calls.bridge.parity, true);
  assert.equal(e2e.calls.bridge.revision.commit, artifact.commit);
  assert.equal(e2e.calls.bridge.revision.structuredDataManifestHash, `sha256:${artifact.structuredDataManifestHash}`);
  assert.equal(e2e.calls.bridge.termination.code, 0); assert.equal(e2e.lifecycle.stdinClose.code, 0);
  assert.equal(e2e.lifecycle.restart.sigterm.code, 0); assert.equal(e2e.lifecycle.restart.sigterm.forcedKill, false);
  assert.equal(e2e.extractionTree.before, e2e.extractionTree.after); assert.equal(e2e.extractionTree.restoredAfterScopedWrites, true);
  const attestationPath = `${directory}/forge-runtime-work-1/payload/packages/mcp-server/dist/registry/readiness-attestation.v1.json`;
  const attestation = read.json(attestationPath), { sha256, ...payload } = attestation;
  assert.equal(hash(serialize(canonical(payload))), sha256, 'Attestation self-digest is invalid');
  assert.equal(attestation.sourceHead, artifact.commit);
  const targets = Object.fromEntries(Object.entries(attestation.targets).map(([target, value]) => {
    const rows = (value as Json).rows;
    assert(rows.length > 0 && new Set(rows.map((row: Json) => row.componentId)).size === rows.length);
    assert(rows.every((row: Json) => row.emissionEligible && row.references.every((ref: Json) => /^[a-f0-9]{64}$/.test(ref.sha256))));
    return [target, { rows: rows.length, emissionEligible: rows.filter((row: Json) => row.emissionEligible).length }];
  }));
  return { ...provenance, runId: verification.runId as number, jobId: job.databaseId as number, jobUrl: job.url as string,
    startedAt: job.startedAt as string, completedAt: job.completedAt as string, nodeVersion: e2e.nodeVersion as string,
    pass, typed, tools: e2e.tools.count as number, calls: e2e.calls.totalAcrossProcesses as number,
    typedCodes: { 'brand.apply': 'OODS-N020', 'design.preview': 'OODS-N019' },
    bridgeParity: true, cleanLifecycle: true, extractedTreeRestored: true, servedRelease: e2e.calls.health.release,
    bundle: artifact, attestation: { path: attestationPath, fileSha256: hash(read.bytes(attestationPath)), payloadSha256: sha256,
      sourceHead: attestation.sourceHead, shippedPackageFiles: attestation.shippedPackageHashes.length, targets,
      scope: 'Retained seal and its digest verified; original CI E2E exercised emitted artifacts. Shipped package bytes are not reverified here because the archive binary was not uploaded.' } };
}

export function collectReleaseReadiness(root: string) {
  const read = reader(root), packages = collectPackageFacts(root);
  read.bytes('pnpm-workspace.yaml');
  for (const row of packages) { read.bytes(row.path); for (const license of row.licenseFiles) read.bytes(license.path); }
  const baseline = read.json(BASELINE_PATH);
  const portableIdentity = identity(read, PORTABLE);
  const portable = ['node20', 'node24'].map(zone => portableCell(read, zone, portableIdentity));
  assert.equal(portable[0].nodeVersion, 'v20.11.1'); assert.match(portable[1].nodeVersion, /^v24\./);
  assert.deepEqual(portable[0].bundle.archive, portable[1].bundle.archive, 'Portable Node cells exercised different archives');
  const releaseIdentity = identity(read, RELEASE), releaseBundle = bundle(read, `${RELEASE}/release/archive`, releaseIdentity);
  const job = read.json(`${RELEASE}/release-job.json`), measurement = read.json(`${RELEASE}/release/release-cells.v1.json`);
  const bundleIdentity = read.json(`${RELEASE}/release/bundle-identity.json`), verification = read.json(`${RELEASE}/verification.json`);
  const releaseLog = read.bytes(`${RELEASE}/release-job.log`).toString();
  assert(releaseLog.includes(releaseBundle.archive.sha256) && releaseLog.includes(String(releaseBundle.archive.byteSize)), 'Hosted log does not corroborate archive bytes and digest');
  assert.equal(job.conclusion, 'success'); assert.equal(job.status, 'completed'); assert.equal(job.head_sha, releaseIdentity.sourceCommit);
  assert.equal(measurement.bundleHead, releaseBundle.commit); assert.equal(measurement.archiveSha256, releaseBundle.archive.sha256);
  assert.equal(bundleIdentity.bundleHead, releaseBundle.commit); assert.equal(bundleIdentity.archiveSha256, releaseBundle.archive.sha256);
  assert.equal(bundleIdentity.manifestVerified, true); assert.equal(bundleIdentity.payload.sha256, releaseBundle.payloadTreeSha256);
  assert.deepEqual(measurement.summary, { cells: 42, pass: 42, typedGap: 0, fail: 0 });
  const expectedCells = ['Organization', 'Subscription', 'User'].flatMap(object => ['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow'].flatMap(context => ['react', 'vue'].map(framework => `${object}/${context}/${framework}`)));
  assert.deepEqual(measurement.rows.map((row: Json) => `${row.object}/${row.context}/${row.framework}`).sort(), expectedCells.sort(), 'Release ledger membership changed');
  assert.equal(measurement.rows.length, 42); assert.equal(new Set(measurement.rows.map((row: Json) => `${row.object}/${row.context}/${row.framework}`)).size, 42);
  for (const row of measurement.rows) {
    assert.equal(row.bundleHead, releaseBundle.commit); assert.equal(row.archiveSha256, releaseBundle.archive.sha256);
    assert.equal(row.runId, measurement.runId); assert.equal(row.status, 'pass'); assert.equal(row.hashEqualToHost, true);
    assert.match(row.artifactHash, /^sha256:[a-f0-9]{64}$/); assert.equal(row.artifactHash, row.hostArtifactHash);
    assert(row.gates.length > 0 && row.gates.every((gate: Json) => gate.status === 'pass'));
  }
  assert.equal(verification.release.jobId, job.id); assert.deepEqual(verification.release.archive, releaseBundle.archive);
  assert.equal(verification.provenance.executedMergeCommit, releaseIdentity.executedMergeCommit);
  const inputs = read.inputs();
  return { schemaVersion: 1, builderSelfCertified: false, baselineHead: baseline.sourceHead as string,
    workspacePatterns: patternsFrom(read.bytes('pnpm-workspace.yaml').toString()), root: packages[0], workspaces: packages.slice(1),
    packageSummary: { workspaces: packages.length - 1, workspacePrivate: packages.slice(1).filter(row => row.fields.private === true).length,
      workspaceWithoutLicenseField: packages.slice(1).filter(row => !Object.hasOwn(row.fields, 'license')).length,
      workspacePublishConfig: packages.slice(1).filter(row => Object.hasOwn(row.fields, 'publishConfig')).length,
      workspaceLicenseFiles: packages.slice(1).flatMap(row => row.licenseFiles).length, rootLicenseFiles: packages[0].licenseFiles.length },
    evidenceScope: 'Historical retained CI evidence, predating the s196-m05 UTC implementation. These archives are not the current UTC runtime; current package metadata and recorded bundle identities are separate observations.',
    portable, release: { ...releaseIdentity, runId: job.run_id as number, jobId: job.id as number, jobUrl: job.html_url as string,
      completedAt: job.completed_at as string, bundle: releaseBundle, measuredRelease: { runId: measurement.runId, ...measurement.summary },
      scope: 'Original manifest, SBOM, sidecar, hosted identity and 42-row ledger retained. Detailed app receipts were independently verified in m05; this facts generator validates their retained metadata, not another runtime sweep.' },
    inputs, inputsSha256: hash(serialize(inputs)) };
}
export type ReleaseReadiness = ReturnType<typeof collectReleaseReadiness>;
const cell = (value: unknown) => value === undefined ? 'absent' : `\`${JSON.stringify(value).replace(/\|/g, '&#124;').replace(/`/g, '&#96;')}\``;
const link = (relative: string) => `[${relative}](../../${relative})`;
function packageTable(rows: PackageFacts[]): string {
  return ['| Package / manifest | Version | private | license field | LICENSE files (direct package directory) | publishConfig | files | exports |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |', ...rows.map(row => `| ${cell(row.name)} — ${link(row.path)} | ${cell(row.version)} | ${cell(row.fields.private)} | ${cell(row.fields.license)} | ${row.licenseFiles.map(file => link(file.path)).join(', ') || 'none'} | ${cell(row.fields.publishConfig)} | ${cell(row.fields.files)} | ${cell(row.fields.exports)} |`)].join('\n');
}
export function renderReleaseFacts(facts: ReleaseReadiness, factsPath = FACTS_PATH): string {
  const archiveRow = (label: string, item: ReleaseReadiness['portable'][number] | ReleaseReadiness['release']) =>
    `| ${label} | ${cell(item.sourceCommit)} | ${cell(item.executedMergeCommit)} | ${cell(item.bundle.archive.sha256)} | ${item.bundle.archive.byteSize} | ${item.bundle.thirdPartyCount} | ${cell(item.bundle.nodeFloor)} | ${Object.keys(item.bundle.runtimePackages).length}; bridge ${cell(item.bundle.runtimePackages['@oods/mcp-bridge'])} | ${link(item.bundle.manifestPath)} |`;
  return [START, 'Generated by `pnpm exec tsx scripts/product-reality/s196-release-readiness.ts`; verify with `--check`.',
    `Machine-readable facts and every source/proof digest: ${link(factsPath)}. Baseline package shapes: ${link(BASELINE_PATH)} at ${cell(facts.baselineHead)}.`,
    '**Current root package (separate from workspace packages)**', packageTable([facts.root]),
    `**Current workspace packages: ${facts.packageSummary.workspaces}**`, packageTable(facts.workspaces),
    `The workspace inventory contains ${facts.packageSummary.workspacePrivate} explicit private packages, ${facts.packageSummary.workspaceWithoutLicenseField} packages without a license field, ${facts.packageSummary.workspacePublishConfig} publishConfig fields and ${facts.packageSummary.workspaceLicenseFiles} direct LICENSE files. The root has ${facts.packageSummary.rootLicenseFiles} LICENSE file. An absent field is preserved as absent; a LICENSE file is not inferred from a package license field.`,
    '**Recorded archives and source identities**', facts.evidenceScope,
    ['| Proof | Source commit | Executed synthetic merge / manifest commit | Archive SHA-256 | Bytes | Third-party closure | Node floor | Runtime packages / bridge | Original manifest |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    archiveRow('m05 hosted release job', facts.release), archiveRow('m03 portable Node 20 / 24 jobs (same archive)', facts.portable[0])].join('\n'),
    'Remote Git responses establish equal source/merge trees and the source as the second merge parent for each proof. The archive binaries were not uploaded; sizes and hashes come from retained original manifests and sidecars, matched to executed payload identities. No archive identity is borrowed from another job.',
    `The m05 release job [${facts.release.jobId}](${facts.release.jobUrl}) retained ${facts.release.measuredRelease.pass}/${facts.release.measuredRelease.cells} passing app cells with zero typed gaps or failures. ${facts.release.scope}`,
    '**Actual portable CI cells**',
    ['| Node actually executed | Run / job | Completed (UTC) | Outcomes | Calls | Bridge parity / lifecycle / restoration |',
    '| --- | --- | --- | --- | --- | --- |',
    ...facts.portable.map(item => `| ${cell(item.nodeVersion)} | ${item.runId} / [${item.jobId}](${item.jobUrl}) | ${item.completedAt} | ${item.pass} executed, ${item.typed} typed (${cell(item.typedCodes)}) | ${item.calls} | passed / clean / byte-identical |`)].join('\n'),
    '**Portable readiness attestation retained with the m03 archive**',
    ...facts.portable.map(item => `${cell(item.nodeVersion)}: ${link(item.attestation.path)}; source ${cell(item.attestation.sourceHead)}, file SHA-256 ${cell(item.attestation.fileSha256)}, payload seal ${cell(item.attestation.payloadSha256)}, ${item.attestation.shippedPackageFiles} shipped package file hashes; targets ${cell(item.attestation.targets)}.`),
    facts.portable[0].attestation.scope,
    `The portable health response carries an earlier measured release ledger: ${cell(facts.portable[0].servedRelease)}. Its bundleHead/archiveSha256 identify that earlier sweep, separately from the archive executing the portable test.`, END].join('\n\n') + '\n';
}
export function generateReleaseReadiness(root: string, check = false, factsPath = FACTS_PATH): ReleaseReadiness {
  const relativeFactsPath = path.relative(root, inside(root, factsPath)).split(path.sep).join('/');
  assert(!/^artifacts\/product-reality\/sprint-19[5-9]\//.test(relativeFactsPath), 'Readiness output must not overwrite sealed Sprint 195–199 receipts');
  const facts = collectReleaseReadiness(root), packetFile = inside(root, PACKET_PATH), packet = fs.readFileSync(packetFile, 'utf8');
  assert.equal(packet.split(START).length, 2, 'Packet must contain exactly one facts start marker');
  assert.equal(packet.split(END).length, 2, 'Packet must contain exactly one facts end marker');
  const start = packet.indexOf(START), end = packet.indexOf(END) + END.length;
  assert(start < end - END.length, 'Packet facts markers are reversed');
  const updated = packet.slice(0, start) + renderReleaseFacts(facts, factsPath).trimEnd() + packet.slice(end);
  for (const [relative, bytes] of [[factsPath, serialize(facts)], [PACKET_PATH, updated]]) {
    const file = inside(root, relative);
    if (check) assert(fs.existsSync(file) && fs.readFileSync(file, 'utf8') === bytes, `Generated release readiness drift: ${relative}`);
    else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes); }
  }
  return facts;
}
export function parseReadinessArgs(args: string[]) {
  let root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), check = false, baseline: string | undefined, factsPath = FACTS_PATH;
  const seen = new Set<string>();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]; assert(!seen.has(arg), `Duplicate argument: ${arg}`); seen.add(arg);
    if (arg === '--check') check = true;
    else if (arg === '--root' || arg === '--freeze-baseline' || arg === '--facts') {
      const value = args[++i]; assert(value && !value.startsWith('--'), `Missing value for ${arg}`);
      if (arg === '--root') root = path.resolve(value); else if (arg === '--facts') factsPath = value; else baseline = value;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  assert(!(check && baseline), '--check cannot create a baseline');
  return { root, check, baseline, factsPath };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = parseReadinessArgs(process.argv.slice(2));
    if (args.baseline) { const result = freezePackageBaseline(args.root, args.baseline); console.log(`Recorded ${result.packages.length} package shapes at ${args.baseline}`); }
    else { const facts = generateReleaseReadiness(args.root, args.check, args.factsPath); console.log(`Release readiness ${args.check ? 'checked' : 'generated'}: root + ${facts.workspaces.length} workspaces; ${facts.portable.length} retained passing portable CI cells`); }
  } catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
}
