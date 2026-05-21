/**
 * C5 — Review-queue emitter (sprint-104 m02).
 *
 * First of three C5 agent-readable structured artifact surfaces. Produces a
 * JSON queue: one entry per manifest entity, summarizing its confidence tier
 * + top-N lowest sub-signals, plus per-tier counts and a flagged-for-review
 * count. The queue is INPUT to s103-m01 review.resolve — agents take the
 * queue, apply a PolicyBundle, and get back resolutions.
 *
 * Consumed by orchestrating agents; composable with review.resolve as input
 * to policy evaluation. NOT a human UI — that is the s99-m04 review-emitter
 * (HTML render of confidence tiers). The C5 reframing (decision #512, commit
 * db3b3b0, 2026-05-20) drops the human-operator framing: C5 surfaces are
 * structured agent-readable artifacts.
 *
 * Reuses classifyTier / needsReview / lowestSignals from review-emitter.js —
 * the same helpers that drive the human-facing review banner and breakdown.
 * Reads entity.oods.confidence_decomposition explicitly (mirrors
 * review-emitter and review-policy data dependency).
 *
 * Output AJV-validated against src/schemas/review-queue.output.json in the
 * Q3 E2E gate. Output schema is closed (additionalProperties:false at every
 * level) so silent schema drift cannot land.
 */

import type {
  ObjectCatalogManifest,
  OodsConfidenceDecomposition,
  OodsConfidenceSignal,
  SemanticEntity,
} from '../object-catalog/types.js';
import {
  classifyTier,
  lowestSignals,
  needsReview,
  type ConfidenceTier,
} from './review-emitter.js';

// ---------------------------------------------------------------------------
// Output shape (mirror of review-queue.output.json — keep in sync; the AJV
// Q3 gate is the contract test for drift)
// ---------------------------------------------------------------------------

export type ReviewQueueFramework = 'review-queue';

export interface ReviewQueueSignal {
  name: string;
  score: number;
  hint?: string;
}

export interface ReviewQueueEntry {
  urn: string;
  tier: ConfidenceTier;
  score: number | null;
  flaggedForReview: boolean;
  lowestSignals: ReviewQueueSignal[];
  elementName: string;
  elementType: string;
}

export interface ReviewQueueTierCounts {
  high: number;
  medium: number;
  low: number;
  unknown: number;
}

export interface ReviewQueueSummary {
  entitiesTotal: number;
  entitiesIncluded: number;
  flaggedCount: number;
  tierCounts: ReviewQueueTierCounts;
  reviewThreshold: number;
  lowestSignalsN: number;
  flaggedOnly: boolean;
}

export interface ReviewQueueSource {
  sourceManifest: string;
  agent?: string;
  stage?: string;
  capturedAt?: string;
  catalogVersion?: string;
}

export interface ReviewQueueArtifact {
  entries: ReviewQueueEntry[];
  summary: ReviewQueueSummary;
  source: ReviewQueueSource;
}

export interface ReviewQueueOptions {
  /** Threshold below which an entity is flaggedForReview (mirrors review-emitter). Default 0.7. */
  reviewThreshold?: number;
  /** Top-N selector for lowestSignals per entry. Default 3. Floor 0, ceiling signals.length. */
  lowestSignalsN?: number;
  /** When true, filter entries[] to flagged-for-review only. tierCounts + flaggedCount remain ALL-entity figures. Default false. */
  flaggedOnly?: boolean;
  /** Override the source.sourceManifest identifier. Default: manifest.source.agent or 'unknown'. */
  sourceManifestId?: string;
}

export interface ReviewQueueIssue {
  code: string;
  message: string;
  entity?: string;
}

export interface ReviewQueueResult {
  status: 'ok' | 'error';
  framework: ReviewQueueFramework;
  queue: ReviewQueueArtifact;
  /** Pretty-printed JSON serialization of `queue`; suitable for save-to-disk. */
  code: string;
  fileExtension: '.json';
  warnings: ReviewQueueIssue[];
  errors?: ReviewQueueIssue[];
  meta: {
    entitiesRendered: number;
    flaggedCount: number;
    reviewThreshold: number;
    catalogVersion?: string;
    sourceAgent?: string;
  };
}

const DEFAULT_REVIEW_THRESHOLD = 0.7;
const DEFAULT_LOWEST_SIGNALS_N = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDecomposition(
  entity: SemanticEntity,
): OodsConfidenceDecomposition | null {
  return entity.oods?.confidence_decomposition ?? null;
}

function toQueueSignal(signal: OodsConfidenceSignal): ReviewQueueSignal {
  const out: ReviewQueueSignal = {
    name: signal.name,
    score: signal.score,
  };
  if (signal.hint !== undefined) out.hint = signal.hint;
  return out;
}

function clampLowestSignalsN(
  requested: number | undefined,
  signalsLen: number,
): number {
  if (requested === undefined) return Math.min(DEFAULT_LOWEST_SIGNALS_N, signalsLen);
  if (requested <= 0) return 0;
  return Math.min(requested, signalsLen);
}

/**
 * Sort key: entries sorted by score ascending so the lowest-confidence items
 * lead. Null scores (unknown tier) sort BEFORE all numeric scores — they
 * deserve the loudest attention since the source agent emitted no confidence
 * signal at all.
 *
 * Stable for ties: secondary key is the entity's urn (lexicographic) so the
 * gate output is deterministic.
 */
function compareEntries(a: ReviewQueueEntry, b: ReviewQueueEntry): number {
  const aScore = a.score;
  const bScore = b.score;
  if (aScore === null && bScore === null) return a.urn.localeCompare(b.urn);
  if (aScore === null) return -1;
  if (bScore === null) return 1;
  if (aScore !== bScore) return aScore - bScore;
  return a.urn.localeCompare(b.urn);
}

// ---------------------------------------------------------------------------
// Per-entity projection
// ---------------------------------------------------------------------------

function buildEntry(
  entity: SemanticEntity,
  reviewThreshold: number,
  lowestSignalsRequested: number | undefined,
): ReviewQueueEntry {
  const decomposition = getDecomposition(entity);
  const score = decomposition?.total ?? null;
  const tier = classifyTier(score);
  const flaggedForReview = needsReview(score, reviewThreshold);

  const lowest =
    decomposition === null
      ? []
      : lowestSignals(
          decomposition.signals,
          clampLowestSignalsN(lowestSignalsRequested, decomposition.signals.length),
        ).map(toQueueSignal);

  return {
    urn: entity.urn,
    tier,
    score,
    flaggedForReview,
    lowestSignals: lowest,
    elementName: entity.element.name,
    elementType: entity.element.type,
  };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function emit(
  manifest: ObjectCatalogManifest,
  options: ReviewQueueOptions = {},
): ReviewQueueResult {
  const reviewThreshold = options.reviewThreshold ?? DEFAULT_REVIEW_THRESHOLD;
  const flaggedOnly = options.flaggedOnly ?? false;
  const lowestSignalsRequested = options.lowestSignalsN;

  const allEntries: ReviewQueueEntry[] = manifest.entities.map((entity) =>
    buildEntry(entity, reviewThreshold, lowestSignalsRequested),
  );

  // Tier counts + flagged count computed across ALL entities — surface-level
  // metrics are population-based, not filtered-population-based. See the
  // mission-start audit axis (c) for the rationale.
  const tierCounts: ReviewQueueTierCounts = {
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
  };
  let flaggedCount = 0;
  for (const entry of allEntries) {
    tierCounts[entry.tier] += 1;
    if (entry.flaggedForReview) flaggedCount += 1;
  }

  const filtered = flaggedOnly
    ? allEntries.filter((e) => e.flaggedForReview)
    : allEntries;

  const sorted = [...filtered].sort(compareEntries);

  const sourceManifestId =
    options.sourceManifestId ?? manifest.source?.agent ?? 'unknown';

  const source: ReviewQueueSource = { sourceManifest: sourceManifestId };
  if (manifest.source?.agent !== undefined) source.agent = manifest.source.agent;
  if (manifest.source?.stage !== undefined) source.stage = manifest.source.stage;
  if (manifest.source?.captured_at !== undefined)
    source.capturedAt = manifest.source.captured_at;
  if (manifest.source?.oods_catalog_version !== undefined)
    source.catalogVersion = manifest.source.oods_catalog_version;

  const effectiveLowestN =
    lowestSignalsRequested === undefined
      ? DEFAULT_LOWEST_SIGNALS_N
      : Math.max(0, lowestSignalsRequested);

  const queue: ReviewQueueArtifact = {
    entries: sorted,
    summary: {
      entitiesTotal: manifest.entities.length,
      entitiesIncluded: sorted.length,
      flaggedCount,
      tierCounts,
      reviewThreshold,
      lowestSignalsN: effectiveLowestN,
      flaggedOnly,
    },
    source,
  };

  return {
    status: 'ok',
    framework: 'review-queue',
    queue,
    code: JSON.stringify(queue, null, 2),
    fileExtension: '.json',
    warnings: [],
    meta: {
      entitiesRendered: sorted.length,
      flaggedCount,
      reviewThreshold,
      catalogVersion: manifest.source?.oods_catalog_version,
      sourceAgent: manifest.source?.agent,
    },
  };
}
