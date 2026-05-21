/**
 * C5 — Apply-summary emitter (sprint-104 m04).
 *
 * Third and final C5 agent-readable structured artifact surface. Closes C5
 * fully when shipped alongside m02 review-queue + m03 conflict-detail.
 *
 * Captures the post-review.resolve decision state per entity: which entities
 * had which decisions applied (accept/patch/defer/dismiss), aggregate counts
 * per decision, count of default-action-used entries, and an audit trail
 * echo. Agents persist the apply-summary as a transcript for replay, audit,
 * or hand-off to other agents.
 *
 * C5 chain composition:
 *   review-queue (m02)    — list-level summary of items needing review
 *   review.resolve (s103) — applies policy bundle, produces resolutions
 *   apply-summary (this)  — structured delta + audit trail for the apply step
 *
 * Input contract: three explicit args — resolutions + auditTrail (from
 * review.resolve) + source manifest (for element.name/type mirror). Wrapping
 * into a single object would obscure the review.resolve dependency; three
 * args keep the chain composition unambiguous.
 *
 * Output schema closure (additionalProperties:false at every level) is the
 * contract test for drift — any new emitter field without a matching schema
 * update fails the Q3 AJV gate.
 */

import type {
  EvaluationResult,
  PolicyDecision,
} from './review-policy.js';
import type {
  AuditTrail,
} from '../tools/review.resolve.js';
import type {
  ObjectCatalogManifest,
  SemanticEntity,
} from '../object-catalog/types.js';
import type { ConfidenceTier } from './review-emitter.js';

// ---------------------------------------------------------------------------
// Output shape (mirror of apply-summary.output.json — keep in sync; Q3 AJV
// gate is the contract test)
// ---------------------------------------------------------------------------

export type ApplySummaryFramework = 'apply-summary';

export interface ApplySummaryEntry {
  urn: string;
  decision: PolicyDecision;
  reason: string;
  policyId: string;
  evaluatedScore: number | null;
  evaluatedTier: ConfidenceTier;
  elementName: string;
  elementType: string;
}

export interface ApplySummaryDecisionCounts {
  accept: number;
  patch: number;
  defer: number;
  dismiss: number;
}

export interface ApplySummaryAggregates {
  entriesTotal: number;
  decisionCounts: ApplySummaryDecisionCounts;
  defaultActionUsed: number;
  matchedPolicyIds: string[];
}

export interface ApplySummaryAuditTrail {
  evaluatedAt: string;
  defaultAction: PolicyDecision;
  entityCount: number;
  policyBundleId?: string;
  matchedPolicyIds: string[];
}

export interface ApplySummarySource {
  sourceManifest?: string;
  manifestPath?: string;
}

export interface ApplySummaryArtifact {
  entries: ApplySummaryEntry[];
  summary: ApplySummaryAggregates;
  auditTrail: ApplySummaryAuditTrail;
  source?: ApplySummarySource;
}

export interface ApplySummaryOptions {
  /** Override the source.sourceManifest identifier. Default: manifest.source.agent or 'unknown'. */
  sourceManifestId?: string;
  /** Manifest path echo (mirror of review.resolve diagnostics.manifestPath). Surfaced in source.manifestPath when set. */
  manifestPath?: string;
}

export interface ApplySummaryIssue {
  code: string;
  message: string;
  entity?: string;
}

export interface ApplySummaryResult {
  status: 'ok' | 'error';
  framework: ApplySummaryFramework;
  summary: ApplySummaryArtifact;
  /** Pretty-printed JSON serialization of `summary`. */
  code: string;
  fileExtension: '.json';
  warnings: ApplySummaryIssue[];
  errors?: ApplySummaryIssue[];
  meta: {
    entriesRendered: number;
    defaultActionUsed: number;
    distinctMatchedPolicies: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildEntityIndex(manifest: ObjectCatalogManifest): Map<string, SemanticEntity> {
  const index = new Map<string, SemanticEntity>();
  for (const entity of manifest.entities) {
    index.set(entity.urn, entity);
  }
  return index;
}

const ZERO_COUNTS: ApplySummaryDecisionCounts = {
  accept: 0,
  patch: 0,
  defer: 0,
  dismiss: 0,
};

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function emit(
  resolutions: ReadonlyArray<EvaluationResult>,
  auditTrail: AuditTrail,
  manifest: ObjectCatalogManifest,
  options: ApplySummaryOptions = {},
): ApplySummaryResult {
  const entityIndex = buildEntityIndex(manifest);
  const warnings: ApplySummaryIssue[] = [];

  const entries: ApplySummaryEntry[] = resolutions.map((resolution) => {
    const entity = entityIndex.get(resolution.urn);
    if (!entity) {
      // Defensive — review.resolve and the manifest should always be in sync,
      // but if a caller passes mismatched inputs the harness fail-louds.
      warnings.push({
        code: 'OODS-AS-001',
        message: `Resolution refers to urn "${resolution.urn}" which is not present in the source manifest`,
        entity: resolution.urn,
      });
    }
    return {
      urn: resolution.urn,
      decision: resolution.decision,
      reason: resolution.reason,
      policyId: resolution.policyId,
      evaluatedScore: resolution.evaluatedScore,
      evaluatedTier: resolution.evaluatedTier,
      elementName: entity?.element.name ?? '',
      elementType: entity?.element.type ?? '',
    };
  });

  // Aggregate decision counts via a fresh object (avoid sharing the ZERO_COUNTS reference).
  const decisionCounts: ApplySummaryDecisionCounts = { ...ZERO_COUNTS };
  let defaultActionUsed = 0;
  for (const entry of entries) {
    decisionCounts[entry.decision] += 1;
    if (entry.policyId === 'default') defaultActionUsed += 1;
  }

  const aggregates: ApplySummaryAggregates = {
    entriesTotal: entries.length,
    decisionCounts,
    defaultActionUsed,
    matchedPolicyIds: [...auditTrail.matchedPolicyIds],
  };

  const echoedAuditTrail: ApplySummaryAuditTrail = {
    evaluatedAt: auditTrail.evaluatedAt,
    defaultAction: auditTrail.defaultAction,
    entityCount: auditTrail.entityCount,
    matchedPolicyIds: [...auditTrail.matchedPolicyIds],
  };
  if (auditTrail.policyBundle.id !== undefined) {
    echoedAuditTrail.policyBundleId = auditTrail.policyBundle.id;
  }

  const sourceManifestId =
    options.sourceManifestId ?? manifest.source?.agent ?? 'unknown';

  const source: ApplySummarySource = {};
  if (sourceManifestId) source.sourceManifest = sourceManifestId;
  if (options.manifestPath !== undefined) source.manifestPath = options.manifestPath;

  const artifact: ApplySummaryArtifact = {
    entries,
    summary: aggregates,
    auditTrail: echoedAuditTrail,
  };
  if (source.sourceManifest !== undefined || source.manifestPath !== undefined) {
    artifact.source = source;
  }

  return {
    status: 'ok',
    framework: 'apply-summary',
    summary: artifact,
    code: JSON.stringify(artifact, null, 2),
    fileExtension: '.json',
    warnings,
    meta: {
      entriesRendered: entries.length,
      defaultActionUsed,
      distinctMatchedPolicies: auditTrail.matchedPolicyIds.length,
    },
  };
}
