#!/usr/bin/env node
/**
 * s205-m02 — the fit read: which objects a run view needs, read from one real Stage1 run.
 *
 * The shape Sprint 203 m02/m03 set for CMOS and Hive: every field path the run carries, in the sources a run
 * view reads, gets a disposition — the object and field it becomes, the trait that carries it, or "not
 * modelled" with the reason. The script FAILS its own output if any path is left without one.
 *
 * Read-only. Nothing is written into Stage1's repository; the run is read from its path.
 *
 *   node artifacts/product-reality/sprint-205/m02/fit-read.mjs [runDir]
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const RUN = process.argv[2] ?? path.join(os.homedir(), 'portfolio/Design-Tools/Stage1/out/stage1/uswds-designsystem/6e435ce7-eaab-46b4-be6b-cea9b80defa6');
const read = file => JSON.parse(fs.readFileSync(path.join(RUN, file), 'utf8'));
const manifest = read('manifest.json');
const a11y = read('artifacts/a11y_report.json');
const index = read('artifacts/report-index.json');
const pageEvidence = a11y.pages.map(page => ({ page, evidence: read(page.evidence_ref) }));

/** Every leaf path of a value, arrays as `[]` and the manifest's hash map keyed generically. */
function paths(value, prefix = '') {
  if (Array.isArray(value)) return value.length ? [...new Set(value.flatMap(item => paths(item, `${prefix}[]`)))] : [`${prefix}[]`];
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    return keys.length ? [...new Set(keys.flatMap(key => paths(value[key], prefix ? `${prefix}.${key}` : key)))] : [prefix];
  }
  return [prefix];
}

const born = (object, field, note) => ({ disposition: 'born', object, field, ...(note ? { note } : {}) });
const trait = (object, name, note) => ({ disposition: 'trait', object, trait: name, ...(note ? { note } : {}) });
const derived = (object, field, note) => ({ disposition: 'derived', object, field, note });
const not = reason => ({ disposition: 'not-modelled', reason });

/** Ordered: the first matching rule decides. */
const RULES = {
  'manifest.json': [
    [/^run_id$/, born('Run', 'run_id')],
    [/^mode$/, born('Run', 'mode', 'app on this run; the capture mode Stage1 ran in')],
    [/^project_id$/, born('Run', 'project_id')],
    [/^targets\[\]\.name$/, born('Run', 'target_name', 'one target per run on every run read; Subject is not born (see candidates)')],
    [/^targets\[\]\.url$/, born('Run', 'target_url')],
    [/^auth\.type$/, born('Run', 'auth_type', 'as RECORDED: Sprint 204 measured "none" on an authenticated capture, so the screen shows what the manifest says and never infers')],
    [/^auth\.redaction\./, not('Redaction config of the capture; no screen this sprint shows it, and on this run it is {applied:false, rules:[]}')],
    [/^environment\.timestamp$/, born('Run', 'captured_at')],
    [/^environment\.stage$/, not('Stage1\'s own deployment stage ("dev"), not a fact about the captured product')],
    [/^passes\[\]\.(id|status)$/, derived('Run', 'pass_count / passes_failed', '30 passes, all ok on this run; the run shows the counts, and the pass roster is the manifest itself')],
    [/^passes\[\]\.(version|cache_key|ms|optional)$/, not('Per-pass engine bookkeeping; the run view states how many passes ran and how many failed, not each one\'s cache key')],
    [/^hashes\./, born('CapturedArtifact', 'sha256', 'the attestation: manifest.hashes[path] beside the artifact it attests')],
    [/^evidence_retention\.retained$/, born('Run', 'evidence_retained')],
    [/^evidence_retention\.reason$/, not('"retained_by_default" on this run; one value, no screen needs it')],
    [/^outputs\./, not('Absolute paths on the capturing machine; a screen must not show a builder\'s home directory')],
    [/^inputs\.perf\./, not('Performance inputs belong to perf_report 1.0.0, which is not admitted this sprint (no screen needs it)')],
    [/^inputs\.(routes|web_crawl)\./, derived('Run', 'page_count', 'the run states how many pages it read; the route list is the a11y pages')],
    [/^inputs\./, not('Pointers from each pass to its artifact; the artifact roster comes from report-index, which is what CapturedArtifact is born from')],
  ],
  'artifacts/a11y_report.json': [
    [/^(kind|version|schema_version)$/, not('Envelope; schema_version is what structuredData.fetch pins (m04), not a field a screen shows')],
    [/^generated_at$/, not('When the report was assembled; the Run carries when the capture happened')],
    [/^url$/, derived('Run', 'target_url', 'equals targets[0].url')],
    [/^pages\[\]\.(route|url|evidence_ref)$/, born('Finding', 'route / page_url / evidence_ref', 'each finding names the page it was found on and the evidence file it came from')],
    [/^pages\[\]\.violation_count$/, derived('Run', 'finding_count', 'sum over pages = 6 on this run')],
    [/^pages\[\]\.by_severity\./, derived('Run', 'critical_count … unknown_count', 'per-severity counts for the run')],
    [/^violations_detail\[\]\./, not('A per-RULE rollup across pages (6 rules here). The run view\'s grain is a rule failing on a page, read from the page evidence, which carries the same rule with its page, engine and time; the rollup would show one finding twice')],
    [/^rollup\.violation_count$/, born('Run', 'finding_count')],
    [/^rollup\.by_severity\./, born('Run', 'critical_count / serious_count / moderate_count / minor_count / unknown_count', 'unknown is its own bucket, never folded into minor')],
    [/^rollup\.accessibility_score/, not('A score. Result state and findings are not scored in Forge (the lock: never red, green or scored); the score is Stage1\'s, and m03 decides how a non-verdict renders')],
    [/^evidence\.a11y_manifest_path$/, not('The evidence index; each finding carries its own evidence_ref')],
  ],
  'artifacts/report-index.json': [
    [/^artifacts\[\]\.type$/, born('CapturedArtifact', 'artifact_kind')],
    [/^artifacts\[\]\.path$/, born('CapturedArtifact', 'path')],
    [/^artifacts\[\]\.description$/, born('CapturedArtifact', 'description')],
    [/^artifacts\[\]\.metadata\.bytes$/, born('CapturedArtifact', 'bytes')],
    [/^artifacts\[\]\.metadata\.modified_at$/, born('CapturedArtifact', 'written_at')],
    [/^run_id$/, born('CapturedArtifact', 'run_id')],
    [/^targets\[\]\./, not('Per-target artifact grouping; one target per run read, so it repeats the roster')],
    [/^(kind|version|schema_version|generated_at)$/, not('Envelope; pinned by structuredData.fetch in m04')],
  ],
  'evidence/a11y/<page>.json': [
    [/^violations\[\]$/, derived('Finding', '(none)', 'a page with no violations: 36 of 40 pages; it yields no finding, and the run\'s page_count still counts it')],
    [/^violations\[\]\.id$/, born('Finding', 'rule_id')],
    [/^violations\[\]\.impact$/, born('Finding', 'impact', 'axe impact: critical, serious, moderate, minor — and Stage1 keeps an unknown bucket')],
    [/^violations\[\]\.help$/, born('Finding', 'title', 'the rule\'s one-line statement names the finding (text.label)')],
    [/^violations\[\]\.description$/, born('Finding', 'description')],
    [/^violations\[\]\.help_url$/, born('Finding', 'help_url')],
    [/^violations\[\]\.tags\[\]$/, born('Finding', 'criteria')],
    [/^violations\[\]\.node_count$/, born('Finding', 'node_count')],
    [/^violations\[\]\.selectors\[\]$/, born('Finding', 'selectors')],
    [/^timestamp$/, born('Finding', 'observed_at')],
    [/^test_engine\.(name|version)$/, born('Finding', 'engine', 'axe-core 4.11.0 — which engine said so is part of the record')],
    [/^url$/, born('Finding', 'page_url')],
    [/^violation_count$/, derived('Finding', '(one row per violation)', 'the page\'s count equals its violations[] length')],
    [/^(incomplete|passes|inapplicable)_count$/, not('NON-VERDICTS AS COUNTS ONLY: this run emits the incomplete (needs review), passing and inapplicable results as page-level counts — 28 / 2,029 / 1,531 — never as items. A finding born from a needs-review result cannot exist until Stage1 emits the items; m03\'s result state is authored against that measured fact')],
    [/^test_runner\./, not('"axe"; the engine name and version are kept, the runner label adds nothing')],
    [/^test_environment\./, not('User agent and window of the capture browser (1280×720); not a fact about a finding a person acts on')],
  ],
};

function dispose(source, fieldPaths) {
  return fieldPaths.sort().map(fieldPath => {
    const rule = RULES[source].find(([pattern]) => pattern.test(fieldPath));
    return { path: fieldPath, ...(rule ? rule[1] : { disposition: null }) };
  });
}

const manifestPaths = paths({ ...manifest, hashes: { '<artifact path>': '' } });
const evidencePaths = [...new Set(pageEvidence.flatMap(({ evidence }) => paths(evidence)))];
const sources = {
  'manifest.json': dispose('manifest.json', manifestPaths),
  'artifacts/a11y_report.json': dispose('artifacts/a11y_report.json', paths(a11y)),
  'artifacts/report-index.json': dispose('artifacts/report-index.json', paths(index)),
  'evidence/a11y/<page>.json': dispose('evidence/a11y/<page>.json', evidencePaths),
};
const unplaced = Object.entries(sources).flatMap(([source, rows]) => rows.filter(row => !row.disposition).map(row => `${source}: ${row.path}`));
assert.deepEqual(unplaced, [], `fields left without a disposition:\n${unplaced.join('\n')}`);

/* ---------------- the real records the screens are proven on ---------------- */

const severity = a11y.rollup.by_severity;
const run = {
  run_id: manifest.run_id, project_id: manifest.project_id, mode: manifest.mode,
  target_name: manifest.targets[0].name, target_url: manifest.targets[0].url, auth_type: manifest.auth.type,
  captured_at: manifest.environment.timestamp, evidence_retained: manifest.evidence_retention.retained,
  pass_count: manifest.passes.length, passes_failed: manifest.passes.filter(pass => pass.status !== 'ok').length,
  page_count: a11y.pages.length, artifact_count: index.artifacts.length, finding_count: a11y.rollup.violation_count,
  critical_count: severity.critical, serious_count: severity.serious, moderate_count: severity.moderate, minor_count: severity.minor, unknown_count: severity.unknown,
};
/** Every real run on disk that a run list can show: app-mode, with a manifest and an a11y_report at 2.2.0. */
const STAGE1_OUT = path.resolve(RUN, '../../..');
const runRecord = dir => {
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const report = JSON.parse(fs.readFileSync(path.join(dir, 'artifacts/a11y_report.json'), 'utf8'));
  const roster = JSON.parse(fs.readFileSync(path.join(dir, 'artifacts/report-index.json'), 'utf8'));
  const s = report.rollup.by_severity;
  return {
    run_id: m.run_id, project_id: m.project_id, mode: m.mode, target_name: m.targets[0].name, target_url: m.targets[0].url, auth_type: m.auth.type,
    captured_at: m.environment.timestamp, evidence_retained: m.evidence_retention?.retained ?? null, pass_count: m.passes.length,
    passes_failed: m.passes.filter(pass => pass.status !== 'ok').length, page_count: report.pages.length, artifact_count: roster.artifacts.length,
    finding_count: report.rollup.violation_count, critical_count: s.critical, serious_count: s.serious, moderate_count: s.moderate, minor_count: s.minor, unknown_count: s.unknown,
  };
};
const runs = fs.readdirSync(path.join(STAGE1_OUT, 'stage1')).flatMap(suite => {
  const suiteDir = path.join(STAGE1_OUT, 'stage1', suite);
  return fs.statSync(suiteDir).isDirectory() ? fs.readdirSync(suiteDir).map(id => path.join(suiteDir, id)) : [];
}).filter(dir => {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    const report = JSON.parse(fs.readFileSync(path.join(dir, 'artifacts/a11y_report.json'), 'utf8'));
    return m.mode === 'app' && report.schema_version === '2.2.0' && fs.existsSync(path.join(dir, 'artifacts/report-index.json'));
  } catch { return false; }
}).map(runRecord).sort((a, b) => b.captured_at.localeCompare(a.captured_at));

const findings = pageEvidence.flatMap(({ page, evidence }) => evidence.violations.map(violation => ({
  finding_id: `${page.route}#${violation.id}`, run_id: manifest.run_id, rule_id: violation.id, title: violation.help,
  description: violation.description, impact: violation.impact, help_url: violation.help_url, criteria: violation.tags,
  node_count: violation.node_count, selectors: violation.selectors, route: page.route, page_url: page.url,
  evidence_ref: page.evidence_ref, engine: `${evidence.test_engine.name} ${evidence.test_engine.version}`, observed_at: evidence.timestamp,
})));
const sha = file => createHash('sha256').update(fs.readFileSync(path.join(RUN, file))).digest('hex');
const artifacts = index.artifacts.map(entry => {
  const key = `artifacts/${entry.path}`;
  let schemaVersion = null;
  try { schemaVersion = read(key).schema_version ?? null; } catch { schemaVersion = null; }
  const attested = manifest.hashes[key] ?? null;
  return {
    artifact_id: `${manifest.run_id}:${entry.path}`, run_id: manifest.run_id, path: entry.path, artifact_kind: entry.type,
    description: entry.description, bytes: entry.metadata?.bytes ?? null, written_at: entry.metadata?.modified_at ?? null,
    schema_version: schemaVersion, sha256: attested, attestation_holds: attested ? attested === sha(key) : null,
  };
});

/* ---------------- the candidates Stage1 named, and which are born ---------------- */

const candidates = [
  { name: 'Run', born: true, reason: 'The run list and run detail need it: one record per capture, from the manifest and the a11y rollup.' },
  { name: 'Finding', born: true, reason: 'The finding list and finding detail need it: one rule failing on one page, from the page evidence (6 on this run).' },
  { name: 'Evidence', born: true, bornAs: 'CapturedArtifact', reason: 'What Stage1 calls evidence is, in its records, a file the run wrote — a kind, a path, bytes, a written-at and a sha256 the manifest attests. The run detail needs its artifact roster. Named for what it is; see the naming decision.' },
  { name: 'Artifact', born: false, reason: 'The same records as the above. Stage1 lists Evidence and Artifact separately, but on disk both are report-index entries under one manifest hash map; one object, not two.' },
  { name: 'Surface', born: false, reason: 'No screen this sprint shows a page on its own. Each finding names its route, page url and evidence file; the run states its page count (40). Born when a page screen is needed.' },
  { name: 'Subject', born: false, reason: 'Every run read carries exactly one target ({name, url}); on the run it is two fields. A Subject object is warranted only when a screen compares runs of one subject over time.' },
  { name: 'Comparison', born: false, reason: 'No two-run screen this sprint. Forge\'s comparison of a run with its own composition is Sprint 204\'s observation record, which already exists and is not an object.' },
];

const report = {
  builderSelfCertified: false,
  run: path.relative(os.homedir(), RUN),
  readAt: new Date().toISOString(),
  sources: Object.fromEntries(Object.entries(sources).map(([source, rows]) => [source, {
    fields: rows.length,
    byDisposition: rows.reduce((counts, row) => ({ ...counts, [row.disposition]: (counts[row.disposition] ?? 0) + 1 }), {}),
    rows,
  }])),
  measured: {
    pages: a11y.pages.length, pagesWithFindings: a11y.pages.filter(page => page.violation_count).length, findings: findings.length,
    nonVerdictCounts: { incomplete: pageEvidence.reduce((n, { evidence }) => n + evidence.incomplete_count, 0), passes: pageEvidence.reduce((n, { evidence }) => n + evidence.passes_count, 0), inapplicable: pageEvidence.reduce((n, { evidence }) => n + evidence.inapplicable_count, 0) },
    artifacts: artifacts.length, artifactsAttested: artifacts.filter(a => a.sha256).length, attestationsHolding: artifacts.filter(a => a.attestation_holds).length,
    artifactsWithoutSchemaVersion: artifacts.filter(a => !a.schema_version).map(a => a.path),
    manifestSchemaVersion: manifest.schema_version ?? null,
    runsOnDiskReadable: runs.length,
  },
  candidates,
  records: { run, runs, findings, artifacts },
};
const out = path.join(import.meta.dirname, 'fit-read.json');
fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report.measured, sources: Object.fromEntries(Object.entries(report.sources).map(([k, v]) => [k, v.byDisposition])) }, null, 1));
