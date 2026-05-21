/**
 * C5 — Conflict-detail emitter (sprint-104 m03).
 *
 * Second of three C5 agent-readable structured artifact surfaces. Produces a
 * per-entity deep breakdown: full signals (not top-N), evidence gaps, entity
 * context (projection variants, brand overlay, schema.org URL). Sibling to
 * the s104-m02 review-queue artifact: the queue tells agents WHICH entities
 * need review; conflict-detail tells them WHY a specific one does.
 *
 * Composition surface:
 *   - review-queue (m02): list-level summary, top-N lowest signals per entry
 *   - conflict-detail (this): FULL signals + gaps + context per single entity
 *   - review.resolve (s103-m01): applies policy to resolve — this artifact is
 *     the pre-resolution exposition agents reason over before invoking policy
 *   - review-emitter (s99-m04): HTML render of the same data
 *
 * Reuses classifyTier / needsReview from review-emitter.js per the s99-m04
 * helper precedent. Reads entity.oods.confidence_decomposition and
 * entity.evidence_refs explicitly.
 *
 * Input contract: single SemanticEntity. Forge-internal callers walk
 * manifest.entities and drill in; agents driving from URN use
 * `manifest.entities.find(e => e.urn === urn)` themselves (trivial). The
 * (manifest, urn) tuple shape was considered and rejected at mission start
 * per Rule 2 — single-entity is the simpler shape.
 */

import type {
  EvidenceRef,
  OodsConfidenceDecomposition,
  OodsConfidenceSignal,
  SemanticEntity,
} from '../object-catalog/types.js';
import { classifyTier, needsReview, type ConfidenceTier } from './review-emitter.js';

// ---------------------------------------------------------------------------
// Output shape (mirror of conflict-detail.output.json — keep in sync; the
// Q3 AJV gate is the contract test for drift)
// ---------------------------------------------------------------------------

export type ConflictDetailFramework = 'conflict-detail';

export interface ConflictDetailSignal {
  name: string;
  score: number;
  hint?: string;
}

export type ConflictDetailGap =
  | {
      source: 'signal';
      name: string;
      score: number;
      threshold: number;
      hint?: string;
    }
  | { source: 'evidence_refs'; detail: string }
  | { source: 'confidence_decomposition'; detail: string };

export interface ConflictDetailElement {
  name: string;
  type: string;
  object?: string;
  action?: string;
}

export interface ConflictDetailContext {
  projectionVariants?: string[];
  brandOverlay?: string;
  schemaorg?: string;
}

export interface ConflictDetailSource {
  sourceManifest?: string;
}

export interface ConflictDetailArtifact {
  urn: string;
  tier: ConfidenceTier;
  score: number | null;
  flaggedForReview: boolean;
  element: ConflictDetailElement;
  signals: ConflictDetailSignal[];
  gaps: ConflictDetailGap[];
  context?: ConflictDetailContext;
  source?: ConflictDetailSource;
}

export interface ConflictDetailOptions {
  /** Threshold below which an entity is flaggedForReview (mirrors review-queue). Default 0.7. */
  reviewThreshold?: number;
  /**
   * Threshold at which a signal counts as an evidence gap. Default 0.5 —
   * matches the classifyTier 'low' boundary, so gaps and low-tier signals
   * are semantically aligned (a low-tier entity's signals below 0.5 all gap).
   */
  evidenceGapThreshold?: number;
  /** Identifier of the source manifest this entity came from. Optional; surfaced in `source` when set. */
  sourceManifestId?: string;
}

export interface ConflictDetailIssue {
  code: string;
  message: string;
  entity?: string;
}

export interface ConflictDetailResult {
  status: 'ok' | 'error';
  framework: ConflictDetailFramework;
  detail: ConflictDetailArtifact;
  /** Pretty-printed JSON serialization of `detail`; suitable for save-to-disk. */
  code: string;
  fileExtension: '.json';
  warnings: ConflictDetailIssue[];
  errors?: ConflictDetailIssue[];
  meta: {
    signalsRendered: number;
    gapsRendered: number;
    reviewThreshold: number;
    evidenceGapThreshold: number;
  };
}

const DEFAULT_REVIEW_THRESHOLD = 0.7;
const DEFAULT_EVIDENCE_GAP_THRESHOLD = 0.5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDecomposition(
  entity: SemanticEntity,
): OodsConfidenceDecomposition | null {
  return entity.oods?.confidence_decomposition ?? null;
}

function toSignal(signal: OodsConfidenceSignal): ConflictDetailSignal {
  const out: ConflictDetailSignal = {
    name: signal.name,
    score: signal.score,
  };
  if (signal.hint !== undefined) out.hint = signal.hint;
  return out;
}

function sortSignalsAscending(signals: ConflictDetailSignal[]): ConflictDetailSignal[] {
  return [...signals].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.name.localeCompare(b.name);
  });
}

function hasEvidenceRefs(
  refs: EvidenceRef[] | undefined,
): boolean {
  return Array.isArray(refs) && refs.length > 0;
}

// ---------------------------------------------------------------------------
// Gap detection
// ---------------------------------------------------------------------------

function detectGaps(
  entity: SemanticEntity,
  decomposition: OodsConfidenceDecomposition | null,
  evidenceGapThreshold: number,
): ConflictDetailGap[] {
  const gaps: ConflictDetailGap[] = [];

  // (d) Missing confidence_decomposition → single gap entry of that source.
  if (decomposition === null) {
    gaps.push({
      source: 'confidence_decomposition',
      detail: 'No confidence_decomposition emitted by source',
    });
  }

  // (b2) Missing or empty evidence_refs — orthogonal to decomposition.
  if (!hasEvidenceRefs(entity.evidence_refs)) {
    gaps.push({
      source: 'evidence_refs',
      detail: hasEvidenceRefs(entity.evidence_refs)
        ? 'evidence_refs present but empty'
        : 'evidence_refs absent or empty',
    });
  }

  // (b1) Signal-level gaps, ascending by score for stable order.
  if (decomposition !== null) {
    const lowSignals = decomposition.signals.filter(
      (s) => s.score < evidenceGapThreshold,
    );
    const sorted = [...lowSignals].sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.name.localeCompare(b.name);
    });
    for (const signal of sorted) {
      const gap: ConflictDetailGap = {
        source: 'signal',
        name: signal.name,
        score: signal.score,
        threshold: evidenceGapThreshold,
      };
      if (signal.hint !== undefined) gap.hint = signal.hint;
      gaps.push(gap);
    }
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// Context surfacing
// ---------------------------------------------------------------------------

function buildContext(entity: SemanticEntity): ConflictDetailContext | undefined {
  const ctx: ConflictDetailContext = {};

  const variants = entity.oods?.projection_variants;
  if (variants && variants.length > 0) {
    ctx.projectionVariants = variants.map((v) => v.surface);
  }

  const brand = entity.oods?.render?.brand_overlay;
  if (brand !== undefined) ctx.brandOverlay = brand;

  const schemaorg = entity.context?.['schemaorg'];
  if (typeof schemaorg === 'string') ctx.schemaorg = schemaorg;

  if (
    ctx.projectionVariants === undefined &&
    ctx.brandOverlay === undefined &&
    ctx.schemaorg === undefined
  ) {
    return undefined;
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function emit(
  entity: SemanticEntity,
  options: ConflictDetailOptions = {},
): ConflictDetailResult {
  const reviewThreshold = options.reviewThreshold ?? DEFAULT_REVIEW_THRESHOLD;
  const evidenceGapThreshold =
    options.evidenceGapThreshold ?? DEFAULT_EVIDENCE_GAP_THRESHOLD;

  const decomposition = getDecomposition(entity);
  const score = decomposition?.total ?? null;
  const tier = classifyTier(score);
  const flaggedForReview = needsReview(score, reviewThreshold);

  const signals: ConflictDetailSignal[] =
    decomposition === null
      ? []
      : sortSignalsAscending(decomposition.signals.map(toSignal));

  const gaps = detectGaps(entity, decomposition, evidenceGapThreshold);

  const element: ConflictDetailElement = {
    name: entity.element.name,
    type: entity.element.type,
  };
  if (entity.element.object !== undefined) element.object = entity.element.object;
  if (entity.element.action !== undefined) element.action = entity.element.action;

  const context = buildContext(entity);

  const detail: ConflictDetailArtifact = {
    urn: entity.urn,
    tier,
    score,
    flaggedForReview,
    element,
    signals,
    gaps,
  };
  if (context !== undefined) detail.context = context;
  if (options.sourceManifestId !== undefined) {
    detail.source = { sourceManifest: options.sourceManifestId };
  }

  return {
    status: 'ok',
    framework: 'conflict-detail',
    detail,
    code: JSON.stringify(detail, null, 2),
    fileExtension: '.json',
    warnings: [],
    meta: {
      signalsRendered: signals.length,
      gapsRendered: gaps.length,
      reviewThreshold,
      evidenceGapThreshold,
    },
  };
}
