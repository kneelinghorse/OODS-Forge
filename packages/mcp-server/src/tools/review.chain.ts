/**
 * review.chain — C5 chain composition MCP tool (sprint-105 m04).
 *
 * Bundles the four C5-reframed surfaces into a single agent-callable tool:
 *   1. review-queue   (s104-m02 emitter)
 *   2. review.resolve (s103-m01 tool — policy evaluator)
 *   3. conflict-detail (s104-m03 emitter, one per flagged entry)
 *   4. apply-summary  (s104-m04 emitter)
 *
 * Primary consumer is the playground "Reconcile" view (s105-m04). Orchestrating
 * agents wanting the discrete steps can still call review.resolve directly;
 * this tool is the convenience composite that closes the C5 chain demo gap.
 *
 * Input: { fixture, policies, options? } — fixture name resolved against the
 * server-resident FIXTURE_PATHS allow-list exported from fidelity.preview;
 * policy bundle validated via review-policy's validatePolicyBundle.
 *
 * Output: all four artifacts in one payload, AJV-validated against their
 * respective schemas via the standard output-schema gate.
 *
 * Per the s105-m04 mission-start audit (decision captured in CMOS BEFORE any
 * code, Rule 1 n=11), the single-tool composite was chosen over three
 * separate tools per Rule 2 (Simplicity First). If real-world usage signal
 * later shows agents need queue/summary alone, three-tool decomposition is
 * an additive follow-on.
 */

import fs from 'node:fs';

import { ToolError } from '../errors/tool-error.js';
import { FIXTURE_PATHS } from './fidelity.preview.js';
import { handle as reviewResolve, type AuditTrail } from './review.resolve.js';
import {
  emit as emitQueue,
  type ReviewQueueArtifact,
  type ReviewQueueResult,
} from '../codegen/review-queue-emitter.js';
import {
  emit as emitConflictDetail,
  type ConflictDetailArtifact,
} from '../codegen/conflict-detail-emitter.js';
import {
  emit as emitApplySummary,
  type ApplySummaryArtifact,
} from '../codegen/apply-summary-emitter.js';
import type {
  EvaluationResult,
  PolicyBundle,
  PolicyDecision,
} from '../codegen/review-policy.js';
import type {
  ObjectCatalogManifest,
  SemanticEntity,
} from '../object-catalog/types.js';

export interface ReviewChainOptions {
  reviewThreshold?: number;
  lowestSignalsN?: number;
  evidenceGapThreshold?: number;
  defaultAction?: PolicyDecision;
}

export interface ReviewChainInput {
  fixture: string;
  policies: PolicyBundle;
  options?: ReviewChainOptions;
}

export interface ReviewChainConflictDetailEntry {
  urn: string;
  detail: ConflictDetailArtifact;
}

export interface ReviewChainDiagnostics {
  fixture: string;
  fixtureSource: 'allow-list';
  policyBundleId?: string;
  entityCount: number;
  flaggedCount: number;
}

export interface ReviewChainOutput {
  queue: ReviewQueueArtifact;
  resolutions: EvaluationResult[];
  auditTrail: AuditTrail;
  conflictDetails: ReviewChainConflictDetailEntry[];
  summary: ApplySummaryArtifact;
  diagnostics: ReviewChainDiagnostics;
}

function loadManifest(fixture: string): ObjectCatalogManifest {
  const filePath = FIXTURE_PATHS[fixture];
  if (!filePath) {
    throw new ToolError(
      'OODS-RC-001',
      `Unknown fixture '${fixture}'. Allowed: ${Object.keys(FIXTURE_PATHS).join(', ')}`,
      { fixture },
    );
  }
  if (!fs.existsSync(filePath)) {
    throw new ToolError('OODS-RC-002', `Fixture file missing on disk: ${filePath}`, {
      fixture,
      filePath,
    });
  }
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new ToolError('OODS-RC-003', `Failed to read fixture: ${(err as Error).message}`, {
      fixture,
      filePath,
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new ToolError('OODS-RC-004', `Fixture is not valid JSON: ${(err as Error).message}`, {
      fixture,
      filePath,
    });
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ToolError('OODS-RC-005', 'Fixture must be a JSON object', { fixture });
  }
  const manifest = parsed as Record<string, unknown>;
  if (!Array.isArray((manifest as { entities?: unknown }).entities)) {
    throw new ToolError(
      'OODS-RC-006',
      `Fixture '${fixture}' is not a valid ObjectCatalogManifest (missing entities[])`,
      { fixture },
    );
  }
  return manifest as unknown as ObjectCatalogManifest;
}

export async function handle(input: ReviewChainInput): Promise<ReviewChainOutput> {
  if (!input || typeof input !== 'object') {
    throw new ToolError('OODS-RC-010', 'input must be an object');
  }
  if (typeof input.fixture !== 'string' || input.fixture.length === 0) {
    throw new ToolError('OODS-RC-011', 'fixture must be a non-empty string');
  }
  if (!input.policies || typeof input.policies !== 'object') {
    throw new ToolError('OODS-RC-012', 'policies bundle is required');
  }

  const opts: ReviewChainOptions = input.options ?? {};
  const manifest = loadManifest(input.fixture);

  // Step 1: review-queue (list-level summary)
  const queueResult: ReviewQueueResult = emitQueue(manifest, {
    reviewThreshold: opts.reviewThreshold,
    lowestSignalsN: opts.lowestSignalsN,
  });

  // Step 2: review.resolve (policy evaluation). Bundle/decision validation is
  // performed inside the tool — re-thrown ToolError fields surface to callers
  // unchanged so the playground can distinguish OODS-RC-* (chain wrapper) from
  // OODS-RR-* (resolve internals).
  const resolveOut = await reviewResolve({
    manifest: manifest as unknown as Record<string, unknown>,
    policies: input.policies,
    ...(opts.defaultAction ? { defaultAction: opts.defaultAction } : {}),
  });

  // Step 3: conflict-detail per flagged entry. Walks queue.entries flagged set
  // so the per-entity drill is sourced from the same flagging rule the queue
  // applied — no second classification path.
  const flaggedUrns = new Set(
    queueResult.queue.entries.filter((e) => e.flaggedForReview).map((e) => e.urn),
  );
  const entityIndex = new Map<string, SemanticEntity>();
  for (const entity of manifest.entities) {
    entityIndex.set(entity.urn, entity);
  }
  const conflictDetails: ReviewChainConflictDetailEntry[] = [];
  for (const urn of flaggedUrns) {
    const entity = entityIndex.get(urn);
    if (!entity) continue;
    const detail = emitConflictDetail(entity, {
      reviewThreshold: opts.reviewThreshold,
      evidenceGapThreshold: opts.evidenceGapThreshold,
    });
    conflictDetails.push({ urn, detail: detail.detail });
  }

  // Step 4: apply-summary closes the chain.
  const summaryResult = emitApplySummary(
    resolveOut.resolutions,
    resolveOut.auditTrail,
    manifest,
  );

  const diagnostics: ReviewChainDiagnostics = {
    fixture: input.fixture,
    fixtureSource: 'allow-list',
    entityCount: manifest.entities.length,
    flaggedCount: queueResult.queue.summary.flaggedCount,
  };
  if (input.policies.id !== undefined) {
    diagnostics.policyBundleId = input.policies.id;
  }

  return {
    queue: queueResult.queue,
    resolutions: resolveOut.resolutions,
    auditTrail: resolveOut.auditTrail,
    conflictDetails,
    summary: summaryResult.summary,
    diagnostics,
  };
}
