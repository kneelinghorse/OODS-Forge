/**
 * The run view (s205-m04): a Stage1 run's real records, read ONLY through structuredData.fetch's admitted run-view
 * kinds, shaped as the capture objects' records (objects/capture/Run, Finding, CapturedArtifact).
 *
 * Forge reads a run from disk and never calls Stage1; every file used is under the run manifest's sha256
 * attestation (structuredData.fetch refuses one that is not). Nothing here proposes, applies or queues anything: a
 * person reads the view and decides outside Forge.
 *
 * Refusals write nothing, and are thrown before any version is composed or touched:
 *   OODS-V212  the path is not a Stage1 run — no run manifest, or one without the shape a run view reads
 *   OODS-V213  an artifact the view needs is outside the admitted contract — its version, its kind, or its
 *              attestation
 *   OODS-V214  the run does not match the composition — the object is not a capture object, or the version
 *              already shows a run of a different target
 */
import { ToolError } from '../errors/tool-error.js';
import { handle as fetchStructured } from '../tools/structuredData.fetch.js';

export const RUN_VIEW_OBJECTS = ['Run', 'Finding', 'CapturedArtifact'] as const;
export type RunViewObject = (typeof RUN_VIEW_OBJECTS)[number];
type Row = Record<string, unknown>;

export type RunView = {
  runId: string;
  target: string;
  runPath: string;
  records: Record<RunViewObject, Row[]>;
  coverage: { findings: number; pages: number; pagesWithFindings: number; evidenceRefs: number; artifacts: number; attestedFiles: number; readMs: number };
  kinds: Record<string, string>;
};

/** What a version stores about the run it shows. */
export type StoredRunView = Omit<RunView, 'records'> & { readAt: string };

async function fetchKind(kind: 'run_manifest' | 'a11y_report' | 'report_index' | 'a11y_evidence', runPath: string) {
  try {
    return await fetchStructured({ kind, runPath });
  } catch (error) {
    if (error instanceof ToolError && error.opiCode === 'OODS-N007') {
      const message = error.message;
      if (kind === 'run_manifest' && /No Stage1 run manifest|does not have the shape/.test(message)) {
        throw new ToolError('OODS-V212', `design.preview: ${runPath} is not one Stage1 run a run view can read — ${message} Nothing was written.`, { runPath, kind, reason: message });
      }
      throw new ToolError('OODS-V213', `design.preview: the run's ${kind} is outside the admitted contract — ${message} Nothing was written.`, { runPath, kind, reason: message, detail: error.details ?? null });
    }
    throw error;
  }
}

export async function readRunView(runPath: string): Promise<RunView> {
  const started = performance.now();
  const manifestRead = await fetchKind('run_manifest', runPath);
  const manifest = manifestRead.payload as Record<string, any>;
  const a11y = (await fetchKind('a11y_report', runPath)).payload as Record<string, any>;
  const index = (await fetchKind('report_index', runPath)).payload as Record<string, any>;
  const evidenceRead = await fetchKind('a11y_evidence', runPath);
  const evidence = evidenceRead.payload as { pages: Array<{ route: string; url: string; evidencePath: string; evidence: Record<string, any> }> };

  const target = manifest.targets[0] as { name: string; url: string };
  const severity = a11y.rollup?.by_severity ?? {};
  const run: Row = {
    run_id: manifest.run_id, target_name: target.name, target_url: target.url, mode: manifest.mode, auth_type: manifest.auth?.type ?? null,
    page_count: a11y.pages.length, finding_count: a11y.rollup?.violation_count ?? 0,
    critical_count: severity.critical ?? 0, serious_count: severity.serious ?? 0, moderate_count: severity.moderate ?? 0, minor_count: severity.minor ?? 0, unknown_count: severity.unknown ?? 0,
    pass_count: manifest.passes.length, passes_failed: manifest.passes.filter((pass: { status: string }) => pass.status !== 'ok').length,
    artifact_count: index.artifacts.length, evidence_retained: manifest.evidence_retention?.retained ?? null,
    provenance_source: 'Stage1', provenance_record: manifest.project_id, provenance_locator: 'manifest.json',
    provenance_method: `Stage1 ${manifest.mode} capture, ${manifest.passes.length} passes`, provenance_at: manifest.environment.timestamp,
  };
  const findings: Row[] = evidence.pages.flatMap(page => (page.evidence.violations ?? []).map((violation: Record<string, any>) => ({
    finding_id: `${page.route}#${violation.id}`, title: violation.help, description: violation.description, impact: violation.impact ?? 'unknown',
    rule_id: violation.id, route: page.route, page_url: page.url, node_count: violation.node_count, selectors: violation.selectors, criteria: violation.tags,
    help_url: violation.help_url, provenance_source: 'Stage1', provenance_record: manifest.run_id, provenance_locator: page.evidencePath,
    provenance_method: `${page.evidence.test_engine?.name} ${page.evidence.test_engine?.version}`, provenance_at: page.evidence.timestamp,
    // Stage1 writes the other axe answers only as page counts, so every item it writes is a violation (s205-m02 fit read).
    result_state: 'violation',
  })));
  const artifacts: Row[] = index.artifacts.map((entry: Record<string, any>) => ({
    artifact_id: `${manifest.run_id}:${entry.path}`, path: entry.path, artifact_kind: entry.type, description: entry.description,
    sha256: manifest.hashes[`artifacts/${entry.path}`] ?? null, bytes: entry.metadata?.bytes ?? null,
    provenance_source: 'Stage1', provenance_record: manifest.run_id, provenance_locator: `artifacts/${entry.path}`,
    provenance_method: manifest.hashes[`artifacts/${entry.path}`] ? 'sha256 attested by the run manifest' : 'not attested by the run manifest',
    provenance_at: entry.metadata?.modified_at ?? manifest.environment.timestamp,
  }));
  return {
    runId: manifest.run_id, target: target.name, runPath,
    records: { Run: [run], Finding: findings, CapturedArtifact: artifacts },
    coverage: {
      findings: findings.length, pages: evidence.pages.length, pagesWithFindings: evidence.pages.filter(page => (page.evidence.violations ?? []).length).length,
      evidenceRefs: new Set(findings.map(finding => finding.provenance_locator)).size, artifacts: artifacts.length,
      attestedFiles: Number((evidenceRead.meta as { attestedFiles?: number } | undefined)?.attestedFiles ?? 0), readMs: Math.round(performance.now() - started),
    },
    kinds: { run_manifest: manifestRead.schemaVersion!, a11y_report: a11y.schema_version, report_index: index.schema_version, a11y_evidence: evidenceRead.schemaVersion! },
  };
}

/** OODS-V214: the run must match the composition it is shown in. */
export function assertRunMatches(object: string, view: RunView, bound: StoredRunView | undefined): void {
  if (!(RUN_VIEW_OBJECTS as readonly string[]).includes(object)) {
    throw new ToolError('OODS-V214', `design.preview: this composition shows ${JSON.stringify(object || null)}, and a run view shows only ${RUN_VIEW_OBJECTS.join(', ')}. Nothing was written.`, { object: object || null, runId: view.runId });
  }
  if (bound && bound.target !== view.target) {
    throw new ToolError('OODS-V214', `design.preview: this version shows run ${bound.runId} of ${bound.target}; ${view.runId} is a run of ${view.target}. A version's records never change subject underneath it — compose a new one. Nothing was written.`, { bound: { runId: bound.runId, target: bound.target }, requested: { runId: view.runId, target: view.target } });
  }
}
