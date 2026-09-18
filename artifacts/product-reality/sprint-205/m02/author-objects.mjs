#!/usr/bin/env node
/**
 * s205-m02 — writes objects/capture/{Run,Finding,CapturedArtifact}.object.yaml from the fit read.
 *
 * The objects are authored here, by hand, field by field; what this script adds is the EXAMPLES, copied from the
 * real records in fit-read.json so that every sample value a screen shows is a value a Stage1 run wrote. Each
 * object's example lists are the same length (one real record per index), so the composer's sample record N is
 * real record N, never a blend of two. Re-run after fit-read.mjs; it is deterministic.
 *
 *   node artifacts/product-reality/sprint-205/m02/author-objects.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = path.resolve(import.meta.dirname, '../../../..');
const fit = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'fit-read.json'), 'utf8'));
const READ = 'artifacts/product-reality/sprint-205/m02/fit-read.json';
const LIST_TRAITS = placeholder => [
  { name: 'behavioral/Searchable', parameters: { placeholder } },
  { name: 'behavioral/Filterable' },
  { name: 'behavioral/Pageable', parameters: { defaultPageSize: 20, pageSizeOptions: [10, 20, 50] } },
];

/** A field whose examples are the real records' values, in record order. */
const field = (records, key, spec) => ({ ...spec, examples: records.map(record => record[key]) });
const semantics = (domain, fields, label) => Object.fromEntries(Object.keys(fields).map(key => [key,
  key === label ? { semantic_type: 'text.label', token_mapping: 'tokenMap(text.label.*)' } : { semantic_type: `${domain}.${key}`, token_mapping: 'tokenMap(text.body.*)' }]));
const metadata = born => ({ maturity: 'alpha', owners: ['Forge'], references: [READ], changelog: [{ version: '0.1.0', date: '2026-09-18', description: born }] });

/* ------------------------------------------------------------------ Run */
const runs = fit.records.runs;
const count = (key, description) => field(runs, key, { type: 'integer', required: true, description, validation: { minimum: 0 } });
const runSchema = {
  run_id: field(runs, 'run_id', { type: 'string', required: true, description: 'The capture\'s own id, a uuid Stage1 assigns; the directory name under out/stage1/<suite>/.' }),
  target_name: field(runs, 'target_name', { type: 'string', required: true, description: 'What was captured, as the run names it (targets[0].name). Every run read carries exactly one target, so the subject is two fields here rather than an object of its own.' }),
  target_url: field(runs, 'target_url', { type: 'string', required: true, description: 'Where the capture started (targets[0].url).' }),
  captured_at: field(runs, 'captured_at', { type: 'datetime', required: true, description: 'When the capture ran (environment.timestamp).', validation: { format: 'date-time' } }),
  project_id: field(runs, 'project_id', { type: 'string', required: true, description: 'Stage1\'s project slug for the capture.' }),
  mode: field(runs, 'mode', { type: 'string', required: true, description: 'The capture mode. Every run a run view reads is app; suite runs aggregate targets and carry no a11y report of their own.', validation: { enum: ['app', 'suite'] } }),
  auth_type: field(runs, 'auth_type', { type: 'string', required: true, description: 'The authentication the manifest RECORDS. Shown as recorded, never inferred: Sprint 204 measured "none" on a capture that was authenticated, which is Stage1\'s to correct.' }),
  page_count: count('page_count', 'How many pages the accessibility pass read.'),
  finding_count: count('finding_count', 'How many rule failures the run found across its pages (a11y rollup.violation_count).'),
  critical_count: count('critical_count', 'Findings of critical impact.'),
  serious_count: count('serious_count', 'Findings of serious impact.'),
  moderate_count: count('moderate_count', 'Findings of moderate impact.'),
  minor_count: count('minor_count', 'Findings of minor impact.'),
  unknown_count: count('unknown_count', 'Findings whose impact the engine did not state. Its own bucket: never folded into minor.'),
  pass_count: count('pass_count', 'How many capture passes ran.'),
  passes_failed: count('passes_failed', 'How many of those passes did not finish ok.'),
  artifact_count: count('artifact_count', 'How many artifacts the run\'s index lists.'),
  evidence_retained: field(runs, 'evidence_retained', { type: 'boolean', required: false, description: 'Whether the run kept its evidence directory (evidence_retention.retained).' }),
};
const run = {
  object: { name: 'Run', version: '0.1.0', domain: 'capture.run',
    description: 'One Stage1 capture of one product: when it ran, what it read, and what it found. Born from the manifest, a11y report and artifact index of real runs (fit read: 6 app-mode runs on disk with an a11y report at 2.2.0); every field this object does not model is stated in the m02 fit read.',
    tags: ['capture', 'stage1', 'run'] },
  traits: LIST_TRAITS('Search runs'),
  schema: runSchema, semantics: semantics('capture.run', runSchema, 'target_name'),
  metadata: metadata('Born from 6 real Stage1 runs; sample records are those runs.'),
};

/* ------------------------------------------------------------------ Finding */
const findings = fit.records.findings;
const findingSchema = {
  finding_id: field(findings, 'finding_id', { type: 'string', required: true, description: 'The page route and the rule, "<route>#<rule_id>": one rule failing on one page is one finding.' }),
  title: field(findings, 'title', { type: 'string', required: true, description: 'The rule\'s one-line statement of what must hold (axe `help`), which names the finding.' }),
  description: field(findings, 'description', { type: 'string', required: true, description: 'What the rule checks, in the engine\'s words.' }),
  impact: field(findings, 'impact', { type: 'string', required: true, description: 'The engine\'s impact for the rule. Stage1 keeps an unknown bucket beside axe\'s four.', validation: { enum: ['critical', 'serious', 'moderate', 'minor', 'unknown'] } }),
  rule_id: field(findings, 'rule_id', { type: 'string', required: true, description: 'The engine\'s rule id.' }),
  route: field(findings, 'route', { type: 'string', required: true, description: 'The page the finding is on, as a route.' }),
  page_url: field(findings, 'page_url', { type: 'string', required: true, description: 'The page\'s full URL.' }),
  node_count: field(findings, 'node_count', { type: 'integer', required: true, description: 'How many elements on the page fail the rule.', validation: { minimum: 1 } }),
  selectors: field(findings, 'selectors', { type: 'string[]', required: true, description: 'The failing elements, as the engine\'s selectors.' }),
  criteria: field(findings, 'criteria', { type: 'string[]', required: false, description: 'The rule\'s tags: WCAG criteria, best-practice and the standards it maps to.' }),
  help_url: field(findings, 'help_url', { type: 'string', required: false, description: 'The engine\'s page for the rule.' }),
  engine: field(findings, 'engine', { type: 'string', required: true, description: 'Which engine, at which version, said so (axe-core 4.11.0 on this run).' }),
  observed_at: field(findings, 'observed_at', { type: 'datetime', required: true, description: 'When the engine read the page.', validation: { format: 'date-time' } }),
  evidence_ref: field(findings, 'evidence_ref', { type: 'string', required: true, description: 'The evidence file under the run the finding was read from.' }),
  run_id: field(findings, 'run_id', { type: 'string', required: true, description: 'The run that found it.' }),
};
const finding = {
  object: { name: 'Finding', version: '0.1.0', domain: 'capture.finding',
    description: 'One accessibility rule failing on one captured page, with the engine that said so and the evidence file it came from. Born from the per-page axe evidence of Stage1 run 6e435ce7 (6 findings on 4 of 40 pages). This run emits needs-review, passing and inapplicable results only as page-level counts, so every finding here is a violation; the m02 fit read states it.',
    tags: ['capture', 'stage1', 'finding', 'accessibility'] },
  traits: LIST_TRAITS('Search findings'),
  schema: findingSchema, semantics: semantics('capture.finding', findingSchema, 'title'),
  metadata: metadata('Born from the 6 findings of Stage1 run 6e435ce7; sample records are those findings.'),
};

/* ------------------------------------------------------------------ CapturedArtifact */
// Six artifacts that carry every field (the index lists itself without a size, and three kinds carry no
// schema_version); the unstamped ones are named in the fit read, not hidden.
const artifacts = fit.records.artifacts.filter(a => a.bytes !== null && a.schema_version !== null)
  .filter(a => ['a11y_report', 'report_index', 'object_rollup', 'identity_graph', 'drift_report', 'perf_report', 'surface_snapshot', 'capability_rollup'].includes(a.artifact_kind)).slice(0, 6);
const artifactSchema = {
  artifact_id: field(artifacts, 'artifact_id', { type: 'string', required: true, description: 'The run id and the path, "<run_id>:<path>".' }),
  path: field(artifacts, 'path', { type: 'string', required: true, description: 'The file under the run\'s artifacts/ directory, which names the artifact.' }),
  artifact_kind: field(artifacts, 'artifact_kind', { type: 'string', required: true, description: 'What kind of artifact it is, as the run\'s index types it.' }),
  description: field(artifacts, 'description', { type: 'string', required: true, description: 'What the artifact holds, in the index\'s words.' }),
  sha256: field(artifacts, 'sha256', { type: 'string', required: true, description: 'The digest the run manifest attests for this file (manifest.hashes). All 27 on run 6e435ce7 match the bytes on disk.' }),
  schema_version: field(artifacts, 'schema_version', { type: 'string', required: false, description: 'The artifact\'s own schema_version. Absent on entity_catalog, style_fingerprint and stylesheet_rules, which Stage1 does not stamp.' }),
  bytes: field(artifacts, 'bytes', { type: 'integer', required: false, description: 'Its size. The index lists itself without one.', validation: { minimum: 0 } }),
  written_at: field(artifacts, 'written_at', { type: 'datetime', required: false, description: 'When the run wrote it.', validation: { format: 'date-time' } }),
  run_id: field(artifacts, 'run_id', { type: 'string', required: true, description: 'The run that wrote it.' }),
};
const capturedArtifact = {
  object: { name: 'CapturedArtifact', version: '0.1.0', domain: 'capture.artifact',
    description: 'A file a Stage1 run wrote, under the run\'s own attestation: its kind, path, size, when it was written and the sha256 the manifest records for it. What Stage1 calls its evidence. Not named Evidence: the registry keys objects by name and Evidence is TraceLab\'s (research.data); see the m02 naming decision.',
    tags: ['capture', 'stage1', 'artifact', 'attestation'] },
  traits: LIST_TRAITS('Search artifacts'),
  schema: artifactSchema, semantics: semantics('capture.artifact', artifactSchema, 'path'),
  metadata: metadata('Born from the 27-artifact index of Stage1 run 6e435ce7; sample records are six of them.'),
};

const out = path.join(root, 'objects/capture');
fs.mkdirSync(out, { recursive: true });
for (const [name, doc] of [['Run', run], ['Finding', finding], ['CapturedArtifact', capturedArtifact]]) {
  fs.writeFileSync(path.join(out, `${name}.object.yaml`), yaml.dump(doc, { lineWidth: 110, noRefs: true }));
}
console.log(JSON.stringify({ Run: runs.length, Finding: findings.length, CapturedArtifact: artifacts.length }));
