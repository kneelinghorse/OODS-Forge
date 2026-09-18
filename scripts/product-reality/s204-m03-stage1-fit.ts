/**
 * s204-m03 — the fit read: what Stage1 emits, against what Forge can actually read.
 *
 * Produced BEFORE any comparison is built, in the shape s203-m02 and m03 used. For every artifact
 * Stage1 writes for a target, this states one of three things and nothing vaguer:
 *
 *   readable-today     Forge's structuredData.fetch accepts the kind AND the file's schema_version,
 *                      proven by CALLING it and recording what came back — not by comparing strings.
 *   corresponds        Forge's registry holds an object, trait or component concept the artifact is
 *                      about, but Forge has no reader for the artifact itself.
 *   not-comparable     with the reason typed.
 *
 *   pnpm exec tsx scripts/product-reality/s204-m03-stage1-fit.ts --run <run-or-target-dir> [--out <dir>]
 *
 * It FAILS (exit 1) when Stage1 emits a kind this table does not mention. A fit read that silently
 * ignores a new artifact is how a contract drifts without anyone noticing, which is the whole reason
 * the mission asked for it before the comparison rather than after.
 *
 * Forge reads a Stage1 run from a filesystem path and opens no other product's store. Nothing is
 * written into the Stage1 or TraceLab repositories: the only output is under artifacts/ in this repo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { handle as fetchHandle } from '../../packages/mcp-server/src/tools/structuredData.fetch.js';

const root = path.resolve(import.meta.dirname, '../..');
const arg = (name: string, fallback?: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const runArg = arg('run');
if (!runArg) throw new Error('--run <run-or-target-dir> is required');
const out = path.resolve(root, arg('out', 'artifacts/product-reality/sprint-204/m03')!);
fs.mkdirSync(out, { recursive: true });

/* ------------------------------------------------------------------ */
/*  Where the artifacts are                                            */
/* ------------------------------------------------------------------ */

/**
 * A run directory holds `artifacts/targets/<target>/` and `artifacts/aggregate/`; the older layout the
 * retired e2e fixtures used pointed straight at a directory of rollups. Accept either, and say which
 * was found, because the two layouts are exactly what the unexercised seam got wrong.
 */
function resolveTargets(input: string): { layout: string; runDir: string; targets: Array<{ name: string; dir: string }>; aggregateDir?: string } {
  const abs = path.resolve(input);
  const artifacts = fs.existsSync(path.join(abs, 'artifacts')) ? path.join(abs, 'artifacts') : abs;
  const targetsDir = path.join(artifacts, 'targets');
  if (fs.existsSync(targetsDir)) {
    const targets = fs.readdirSync(targetsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => ({ name: entry.name, dir: path.join(targetsDir, entry.name) }));
    const aggregateDir = path.join(artifacts, 'aggregate');
    return { layout: 'suite-run (artifacts/targets/<target>)', runDir: abs, targets, ...(fs.existsSync(aggregateDir) ? { aggregateDir } : {}) };
  }
  // No `targets/` means a single-target run — what `stage1 inspect app` produces, and the shape the
  // retired fixtures used. The artifacts still live under `artifacts/` when that directory exists;
  // scanning the run root instead finds only `manifest.json` and reports a near-empty fit read.
  return { layout: 'single-target run (artifacts/)', runDir: abs, targets: [{ name: path.basename(abs), dir: artifacts }] };
}

/* ------------------------------------------------------------------ */
/*  The table                                                          */
/* ------------------------------------------------------------------ */

type Verdict = 'readable-today' | 'corresponds' | 'not-comparable';
type Entry = { verdict: Verdict; note: string; forge?: string };

/**
 * One row per artifact kind Stage1 emits for a target. `readable-today` is a CLAIM this script then
 * checks by calling structuredData.fetch; the other two are judgements with their reason attached.
 *
 * `corresponds` means Forge's registry holds the concept, not that anything reads the file. It is the
 * column that says where a later mission could go; `not-comparable` says why one should not bother.
 */
const TABLE: Record<string, Entry> = {
  // The four kinds structuredData.fetch declares.
  identity_graph: { verdict: 'readable-today', note: 'accepted kind; schema_version checked below', forge: 'structuredData.fetch(kind: identity_graph)' },
  capability_rollup: { verdict: 'readable-today', note: 'accepted kind; schema_version checked below', forge: 'structuredData.fetch(kind: capability_rollup)' },
  object_rollup: { verdict: 'readable-today', note: 'accepted kind; schema_version checked below', forge: 'structuredData.fetch(kind: object_rollup)' },
  drift_report: { verdict: 'readable-today', note: 'accepted kind; schema_version checked below', forge: 'structuredData.fetch(kind: drift_report)' },

  // Concepts Forge's registry holds, with no reader for the artifact.
  ia_outline: { verdict: 'corresponds', note: 'the observed page hierarchy of a site; Forge composes a screen per object and context, so the comparable unit is a screen, not a route tree', forge: 'design.compose contexts' },
  component_signatures: { verdict: 'corresponds', note: 'observed recurring element shapes; Forge holds 110 canonical component contracts that name the same kind of thing from the other direction', forge: '@oods/component-contracts' },
  component_clusters: { verdict: 'corresponds', note: 'observed components grouped by similarity; the registry equivalent is the component catalog, which is authored rather than inferred', forge: 'catalog.list' },
  composition_patterns: { verdict: 'corresponds', note: 'observed layout regularities; Forge has authored pattern rules in compose/field-patterns.ts, which is the same idea authored rather than observed', forge: 'compose/field-patterns' },
  entity_catalog: { verdict: 'corresponds', note: 'the entities a site appears to be about; this is the nearest thing to a Forge object and is the natural seam for a later mission', forge: 'objects/ registry' },
  implicit_object_model: { verdict: 'corresponds', note: 'objects inferred from the surface; the same seam as entity_catalog and the one the comparison in m04 works from', forge: 'objects/ registry' },
  identity_candidates: { verdict: 'corresponds', note: 'proposed identities before they are graphed; Forge takes the graphed form, not the candidates', forge: 'structuredData.fetch(kind: identity_graph)' },
  theming: { verdict: 'corresponds', note: 'observed theme variables; Forge builds DTCG tokens through Style Dictionary, and s81 fixed the token seam on the Stage1 side', forge: 'tokens.build' },
  'token-guess': { verdict: 'corresponds', note: 'inferred token values; the authored equivalent is the token pipeline, and a guess is not evidence against an authored token', forge: 'packages/tokens' },
  a11y_report: { verdict: 'corresponds', note: 'observed axe findings; Forge runs axe over its own generated screens, so both sides measure the same rules against different artifacts', forge: 'artifact.certify, a11y.scan' },
  breakpoints: { verdict: 'corresponds', note: 'observed responsive breakpoints; Forge measures its screens at 390, 820 and 1440 by receipt convention rather than declaring breakpoints', forge: 'the 390/820/1440 receipt widths' },
  ui_manifest: { verdict: 'corresponds', note: 'a draft UI manifest; drafts are proposals and Phase E rules out consuming proposals automatically', forge: 'design.compose' },
  review_queue: { verdict: 'corresponds', note: "Stage1's own review surface; near.md rules out a universal proposal-and-approval queue by name, so Forge does not consume it", forge: '(deliberately none)' },
  overlay_messaging: { verdict: 'corresponds', note: 'observed overlays (drawer, modal, message mount) and conditional copy; Forge composes overlay surfaces only as Banner and ArchivedRowOverlay, so the concept exists on both sides but at very different coverage — the observed side has drawers and modals Forge composes nothing for', forge: 'Banner, ArchivedRowOverlay' },

  // Nothing in Forge to compare against, with the reason.
  app_profile: { verdict: 'not-comparable', note: 'describes the captured application as a deployment — framework, hosting, routing. Forge composes screens from objects and has no notion of a deployed app' },
  baseline_metrics: { verdict: 'not-comparable', note: 'runtime page metrics of a live site; Forge generates artifacts and never serves the thing being measured' },
  perf_report: { verdict: 'not-comparable', note: 'load and interaction performance of a live site; same reason as baseline_metrics' },
  surface_snapshot: { verdict: 'not-comparable', note: 'the raw captured DOM surface; it is the input the other artifacts are derived from, not a comparable' },
  stylesheet_rules: { verdict: 'not-comparable', note: 'raw CSS rules as authored by the observed site; Forge emits token-scoped CSS and a rule-level diff would compare two unrelated authoring styles' },
  style_fingerprint: { verdict: 'not-comparable', note: 'a similarity hash for matching sites to each other, which is a Stage1-internal concern' },
  manifest: { verdict: 'not-comparable', note: 'the run manifest: what Stage1 captured and when. Provenance, which m04 reads, not a comparable' },
  'report-index': { verdict: 'not-comparable', note: "an index of Stage1's own generated reports" },
  reconciliation_report: { verdict: 'not-comparable', note: 'the output of the semantic reconciliation Stage1 SHELVED after confident errors; near.md rules it out by name, so Forge must not read it even though it exists' },
  orca_candidates: { verdict: 'not-comparable', note: 'a Stage1 research surface with no Forge counterpart' },
};

const ACCEPTED: Record<string, string[]> = {
  identity_graph: ['1.1.0', '1.2.0'],
  capability_rollup: ['1.1.0', '1.2.0'],
  object_rollup: ['1.0.0', '1.1.0'],
  drift_report: ['1.0.0'],
};

/** `ui_manifest.drafts.json` and friends carry a suffix; the kind is what precedes the first dot. */
const kindOf = (file: string) => file.replace(/\.json$/, '').replace(/\.drafts$/, '');

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

const resolved = resolveTargets(runArg);
console.log(`[s204-m03] ${resolved.layout}: ${resolved.targets.length} target(s) under ${resolved.runDir}`);

type Row = {
  target: string; artifact: string; kind: string; bytes: number;
  schemaVersion: string | null; verdict: Verdict; note: string; forge?: string;
  accepted?: string[]; fetch?: { ok: boolean; code?: string; message?: string; meta?: unknown };
};

const rows: Row[] = [];
const unmapped: string[] = [];

for (const target of resolved.targets) {
  const files = fs.readdirSync(target.dir).filter(name => name.endsWith('.json')).sort();
  for (const file of files) {
    const kind = kindOf(file);
    const entry = TABLE[kind];
    if (!entry) { unmapped.push(`${target.name}/${file}`); continue; }
    const full = path.join(target.dir, file);
    let schemaVersion: string | null = null;
    try {
      const payload = JSON.parse(fs.readFileSync(full, 'utf8')) as Record<string, unknown>;
      schemaVersion = typeof payload.schema_version === 'string' ? payload.schema_version : null;
    } catch { schemaVersion = null; }
    const row: Row = {
      target: target.name, artifact: file, kind, bytes: fs.statSync(full).size,
      schemaVersion, verdict: entry.verdict, note: entry.note, ...(entry.forge ? { forge: entry.forge } : {}),
    };
    // A "readable-today" claim is CHECKED, by calling the tool the claim names.
    if (entry.verdict === 'readable-today') {
      row.accepted = ACCEPTED[kind];
      try {
        const result = await fetchHandle({ kind: kind as 'identity_graph', runPath: target.dir });
        row.fetch = { ok: true, meta: (result as { meta?: unknown }).meta };
      } catch (error) {
        const typed = error as { code?: string; opiCode?: string; message?: string };
        row.fetch = { ok: false, code: typed.code ?? typed.opiCode ?? 'unknown', message: (typed.message ?? String(error)).slice(0, 300) };
        // The claim did not hold. Say so in the verdict rather than leaving a green word beside a red result.
        row.verdict = 'not-comparable';
        row.note = `declared an accepted kind, but Forge REFUSED this file: ${row.fetch.message}`;
      }
    }
    rows.push(row);
  }
}

/* ------------------------------------------------------------------ */
/*  Report                                                             */
/* ------------------------------------------------------------------ */

const byVerdict = (verdict: Verdict) => [...new Set(rows.filter(row => row.verdict === verdict).map(row => row.kind))].sort();
const perTarget = resolved.targets.map(target => ({
  target: target.name,
  artifacts: rows.filter(row => row.target === target.name).length,
  readable: rows.filter(row => row.target === target.name && row.verdict === 'readable-today').length,
}));
const refused = rows.filter(row => row.fetch && !row.fetch.ok);

const report = {
  kind: 's204-m03 Stage1 fit read',
  run: resolved.runDir, layout: resolved.layout,
  targets: perTarget,
  kindsSeen: [...new Set(rows.map(row => row.kind))].sort(),
  verdicts: {
    'readable-today': byVerdict('readable-today'),
    corresponds: byVerdict('corresponds'),
    'not-comparable': byVerdict('not-comparable'),
  },
  acceptedContract: ACCEPTED,
  refusals: refused.map(row => ({ target: row.target, kind: row.kind, schemaVersion: row.schemaVersion, accepted: row.accepted, code: row.fetch!.code, message: row.fetch!.message })),
  ...(resolved.aggregateDir ? { aggregateFiles: fs.readdirSync(resolved.aggregateDir).sort() } : {}),
  rows,
};
fs.writeFileSync(path.join(out, 'stage1-fit.json'), JSON.stringify(report, null, 2) + '\n');

console.log(`[s204-m03] ${rows.length} artifacts across ${resolved.targets.length} target(s), ${report.kindsSeen.length} distinct kinds`);
for (const verdict of ['readable-today', 'corresponds', 'not-comparable'] as const) {
  console.log(`  ${verdict.padEnd(16)} ${report.verdicts[verdict].length} kinds: ${report.verdicts[verdict].join(', ')}`);
}
if (refused.length) {
  console.log(`[s204-m03] ${refused.length} artifact(s) declared readable and REFUSED:`);
  for (const row of refused) console.log(`  ${row.target}/${row.artifact} schema_version ${row.schemaVersion} — accepted ${row.accepted?.join(', ')} — ${row.fetch!.code}`);
}
if (unmapped.length) {
  console.error(`[s204-m03] ${unmapped.length} artifact(s) this fit read does not mention: ${unmapped.join(', ')}`);
  console.error('A fit read that ignores an artifact is how a contract drifts unnoticed. Add a row to TABLE.');
  process.exitCode = 1;
}
console.log(`[s204-m03] wrote ${path.join(out, 'stage1-fit.json')}`);
