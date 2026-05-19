/**
 * review.triage — agent-callable MCP tool implementing the C3 operator
 * workflow surface (sprint-101 m01).
 *
 * Loads a conflict artifact written by map.apply.ts at .oods/conflicts/{...}.json,
 * accepts a list of operator decisions per item, mutates the artifact in place
 * with resolution_status + resolved_at + resolved_by + operator_reason, and
 * routes accept/patch verdicts through the existing map.create / map.update
 * infrastructure. Defer and dismiss are local-only — they update artifact
 * state without touching the mapping registry.
 *
 * Path safety mirrors concordance.validate.ts: absolute paths, parent-traversal,
 * project-root escape, missing files, and malformed JSON are all rejected up
 * front before any mutation runs.
 *
 * Idempotency: re-running with the same decision payload is a no-op. Already-
 * resolved items surface as errors[] entries with kind='already_resolved'.
 *
 * Atomicity: per-decision map.* failures are non-fatal. The artifact's resolution
 * state for items whose map.* call failed is NOT updated to a terminal state —
 * the item stays 'open' so a retry can pick it up. Other decisions in the same
 * batch are unaffected.
 */

import fs from 'node:fs';
import path from 'node:path';

import { ToolError } from '../errors/tool-error.js';
import { handle as createHandle } from './map.create.js';
import { handle as updateHandle } from './map.update.js';
import type {
  ConflictArtifact,
  ConflictArtifactItem,
  MapCreateInput,
  MapUpdateInput,
  ReviewTriageDecision,
  ReviewTriageError,
  ReviewTriageInput,
  ReviewTriageMapCreatedRef,
  ReviewTriageMapRemovedRef,
  ReviewTriageMapUpdatedRef,
  ReviewTriageOutput,
  ReviewTriageVerdict,
} from './types.js';

const PATH_TRAVERSAL_RE = /(^|[\\/])\.\.([\\/]|$)/;
const TERMINAL_STATUSES = new Set<ConflictArtifactItem['resolution_status']>([
  'accepted',
  'patched',
  'deferred',
  'dismissed',
]);

function resolveArtifactPath(relPath: string, projectRoot?: string): string {
  if (typeof relPath !== 'string' || relPath.trim().length === 0) {
    throw new ToolError('OODS-RT-001', 'conflictArtifactPath must be a non-empty string', {
      conflictArtifactPath: relPath,
    });
  }
  const trimmed = relPath.trim();
  if (path.isAbsolute(trimmed)) {
    throw new ToolError('OODS-RT-002', 'conflictArtifactPath must be relative, not absolute', {
      conflictArtifactPath: relPath,
    });
  }
  if (PATH_TRAVERSAL_RE.test(trimmed)) {
    throw new ToolError(
      'OODS-RT-003',
      'conflictArtifactPath must not contain parent-directory traversal (..)',
      { conflictArtifactPath: relPath },
    );
  }
  const root = projectRoot ? path.resolve(projectRoot) : process.cwd();
  const resolved = path.resolve(root, trimmed);
  const rel = path.relative(root, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new ToolError(
      'OODS-RT-004',
      'conflictArtifactPath escapes the project root after normalization',
      { conflictArtifactPath: relPath, projectRoot: root },
    );
  }
  if (!fs.existsSync(resolved)) {
    throw new ToolError('OODS-RT-005', `conflict artifact not found: ${trimmed}`, {
      conflictArtifactPath: relPath,
    });
  }
  return resolved;
}

function readArtifact(absolutePath: string): ConflictArtifact {
  let raw: string;
  try {
    raw = fs.readFileSync(absolutePath, 'utf8');
  } catch (err) {
    throw new ToolError('OODS-RT-006', `failed to read conflict artifact: ${(err as Error).message}`, {
      conflictArtifactPath: absolutePath,
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new ToolError(
      'OODS-RT-007',
      `conflict artifact is not valid JSON: ${(err as Error).message}`,
      { conflictArtifactPath: absolutePath },
    );
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    (parsed as { kind?: unknown }).kind !== 'map.apply.conflicts'
  ) {
    throw new ToolError(
      'OODS-RT-008',
      'conflict artifact is missing the expected kind="map.apply.conflicts" header',
      { conflictArtifactPath: absolutePath },
    );
  }
  return parsed as ConflictArtifact;
}

function writeArtifact(absolutePath: string, artifact: ConflictArtifact): void {
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, JSON.stringify(artifact, null, 2) + '\n', 'utf8');
}

function findItem(
  artifact: ConflictArtifact,
  objectId: string,
): { item: ConflictArtifactItem; bucket: 'conflicts' | 'belowConfidence' } | null {
  const c = artifact.conflicts.find((i) => i.objectId === objectId);
  if (c) return { item: c, bucket: 'conflicts' };
  const b = artifact.belowConfidence.find((i) => i.objectId === objectId);
  if (b) return { item: b, bucket: 'belowConfidence' };
  return null;
}

function isValidVerdict(value: unknown): value is ReviewTriageVerdict {
  return value === 'accept' || value === 'patch' || value === 'defer' || value === 'dismiss';
}

function deriveExternalSystemFromTargetId(targetId: string): string {
  // Mirrors map.apply.ts deriveExternalSystem for filesystem-only artifacts:
  // when target.url is unavailable, slugify(target.id) becomes the system key.
  return targetId
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function deriveExternalSystem(artifact: ConflictArtifact): string {
  if (artifact.target.url) {
    try {
      const hostname = new URL(artifact.target.url).hostname.replace(/^www\./, '');
      const pieces = hostname.split('.');
      if (pieces.length > 1) return pieces.slice(0, -1).join('-');
      return hostname;
    } catch {
      // fall through
    }
  }
  return deriveExternalSystemFromTargetId(artifact.target.id);
}

function nowIso(): string {
  return new Date().toISOString();
}

async function handleAccept(
  item: ConflictArtifactItem,
  decision: ReviewTriageDecision,
  externalSystem: string,
  apply: boolean,
): Promise<{ created?: ReviewTriageMapCreatedRef; error?: ReviewTriageError }> {
  const traits = item.candidate.recommended_oods_traits ?? [];
  if (traits.length === 0) {
    return {
      error: {
        objectId: decision.objectId,
        verdict: 'accept',
        kind: 'missing_recommended_traits',
        message: `accept verdict requires candidate.recommended_oods_traits but it is empty for '${decision.objectId}'.`,
      },
    };
  }
  const projectionVariants = item.candidate.projection_variants;
  const createInput: MapCreateInput = {
    apply,
    externalSystem,
    externalComponent: item.candidate.name ?? item.name,
    oodsTraits: traits,
    confidence: 'auto',
    metadata: {
      author: 'review.triage',
      notes:
        decision.reason ??
        item.candidate.verdict_reasoning ??
        item.candidate.reasoning ??
        `Accepted via review.triage at ${nowIso()}`,
    },
    ...(projectionVariants && projectionVariants.length > 0
      ? { projection_variants: projectionVariants }
      : {}),
  };
  const result = await createHandle(createInput);
  if (result.status === 'error') {
    return {
      error: {
        objectId: decision.objectId,
        verdict: 'accept',
        kind: 'map_call_failed',
        message:
          result.errors?.message ?? `map.create failed for '${decision.objectId}'.`,
      },
    };
  }
  const mappingId =
    typeof (result.mapping as { id?: unknown }).id === 'string'
      ? ((result.mapping as { id: string }).id)
      : `${externalSystem}-${(item.candidate.name ?? item.name).toLowerCase()}`;
  return { created: { objectId: decision.objectId, mappingId } };
}

async function handlePatch(
  item: ConflictArtifactItem,
  decision: ReviewTriageDecision,
  externalSystem: string,
): Promise<{ updated?: ReviewTriageMapUpdatedRef; error?: ReviewTriageError }> {
  const existingMapId =
    item.existingMapId ??
    item.candidate.existing_map_id ??
    null;
  if (!existingMapId) {
    return {
      error: {
        objectId: decision.objectId,
        verdict: 'patch',
        kind: 'missing_existing_mapping',
        message: `patch verdict for '${decision.objectId}' requires an existingMapId on the conflict item, none found.`,
      },
    };
  }

  const traits = item.candidate.recommended_oods_traits ?? [];
  const updates: MapUpdateInput['updates'] = {};
  if (traits.length > 0) updates.oodsTraits = traits;
  if (item.candidate.projection_variants !== undefined) {
    updates.projection_variants = item.candidate.projection_variants;
  }
  if (decision.patchOverrides) {
    Object.assign(updates, decision.patchOverrides);
  }
  if (decision.reason) {
    updates.notes = decision.reason;
  }
  // Defensive: external system from artifact is informational only — map.update
  // resolves by id, so we don't need to forward it.
  void externalSystem;

  if (Object.keys(updates).length === 0) {
    return {
      error: {
        objectId: decision.objectId,
        verdict: 'patch',
        kind: 'map_call_failed',
        message: `patch verdict for '${decision.objectId}' produced no update payload (no traits, no projection_variants, no overrides, no reason).`,
      },
    };
  }

  const result = await updateHandle({ id: existingMapId, updates } satisfies MapUpdateInput);
  if (result.status === 'error') {
    return {
      error: {
        objectId: decision.objectId,
        verdict: 'patch',
        kind: 'map_call_failed',
        message: result.message ?? `map.update failed for '${existingMapId}'.`,
      },
    };
  }
  return {
    updated: {
      objectId: decision.objectId,
      mappingId: existingMapId,
      changes: result.changes ?? [],
    },
  };
}

async function handleDismiss(
  item: ConflictArtifactItem,
  decision: ReviewTriageDecision,
): Promise<{ removed?: ReviewTriageMapRemovedRef; error?: ReviewTriageError }> {
  // dismiss does NOT call map.delete by default — it only marks the conflict
  // item as dismissed. If the item had an existing_map_id and the operator
  // explicitly opts in via patchOverrides.remove_mapping (kept implicit for now
  // and out of v1 scope), we'd route to map.delete here. For sprint-101 m01,
  // dismiss is local-only per the mission spec ("does NOT call map.*").
  void item;
  void decision;
  return {};
}

export async function handle(input: ReviewTriageInput): Promise<ReviewTriageOutput> {
  if (!input || typeof input !== 'object') {
    throw new ToolError('OODS-RT-009', 'review.triage input must be an object');
  }
  if (!Array.isArray(input.decisions)) {
    throw new ToolError('OODS-RT-010', 'review.triage input.decisions must be an array', {
      decisions: input.decisions,
    });
  }

  const absolutePath = resolveArtifactPath(input.conflictArtifactPath, input.projectRoot);
  const artifact = readArtifact(absolutePath);
  const externalSystem = deriveExternalSystem(artifact);
  const apply = input.apply !== false; // default true — review.triage exists to persist decisions.

  const errors: ReviewTriageError[] = [];
  const mapsCreated: ReviewTriageMapCreatedRef[] = [];
  const mapsUpdated: ReviewTriageMapUpdatedRef[] = [];
  const mapsRemoved: ReviewTriageMapRemovedRef[] = [];
  let accepted = 0;
  let patched = 0;
  let deferred = 0;
  let dismissed = 0;
  let mutated = false;

  for (const decision of input.decisions) {
    if (!decision || typeof decision !== 'object' || typeof decision.objectId !== 'string') {
      errors.push({
        objectId: typeof decision?.objectId === 'string' ? decision.objectId : '<unknown>',
        kind: 'item_not_found',
        message: 'decision must be an object with a string objectId',
      });
      continue;
    }

    if (!isValidVerdict(decision.verdict)) {
      errors.push({
        objectId: decision.objectId,
        kind: 'invalid_verdict',
        message: `verdict must be one of accept|patch|defer|dismiss, received '${String(decision.verdict)}'`,
      });
      continue;
    }

    const found = findItem(artifact, decision.objectId);
    if (!found) {
      errors.push({
        objectId: decision.objectId,
        verdict: decision.verdict,
        kind: 'item_not_found',
        message: `no conflict/belowConfidence item with objectId='${decision.objectId}' in artifact`,
      });
      continue;
    }

    const { item } = found;
    if (item.resolution_status && TERMINAL_STATUSES.has(item.resolution_status)) {
      errors.push({
        objectId: decision.objectId,
        verdict: decision.verdict,
        kind: 'already_resolved',
        message: `item '${decision.objectId}' already resolved as '${item.resolution_status}' at ${item.resolved_at ?? 'unknown time'}`,
      });
      continue;
    }

    const timestamp = nowIso();
    const resolvedBy = decision.resolvedBy ?? 'review.triage';

    switch (decision.verdict) {
      case 'accept': {
        const outcome = await handleAccept(item, decision, externalSystem, apply);
        if (outcome.error) {
          errors.push(outcome.error);
          break;
        }
        if (outcome.created) mapsCreated.push(outcome.created);
        item.resolution_status = 'accepted';
        item.resolved_at = timestamp;
        item.resolved_by = resolvedBy;
        if (decision.reason !== undefined) item.operator_reason = decision.reason;
        accepted += 1;
        mutated = true;
        break;
      }
      case 'patch': {
        const outcome = await handlePatch(item, decision, externalSystem);
        if (outcome.error) {
          errors.push(outcome.error);
          break;
        }
        if (outcome.updated) mapsUpdated.push(outcome.updated);
        item.resolution_status = 'patched';
        item.resolved_at = timestamp;
        item.resolved_by = resolvedBy;
        if (decision.reason !== undefined) item.operator_reason = decision.reason;
        patched += 1;
        mutated = true;
        break;
      }
      case 'defer': {
        item.resolution_status = 'deferred';
        item.resolved_at = timestamp;
        item.resolved_by = resolvedBy;
        if (decision.reason !== undefined) item.operator_reason = decision.reason;
        deferred += 1;
        mutated = true;
        break;
      }
      case 'dismiss': {
        const outcome = await handleDismiss(item, decision);
        if (outcome.error) {
          errors.push(outcome.error);
          break;
        }
        if (outcome.removed) mapsRemoved.push(outcome.removed);
        item.resolution_status = 'dismissed';
        item.resolved_at = timestamp;
        item.resolved_by = resolvedBy;
        if (decision.reason !== undefined) item.operator_reason = decision.reason;
        dismissed += 1;
        mutated = true;
        break;
      }
    }
  }

  if (mutated) {
    writeArtifact(absolutePath, artifact);
  }

  const projectRoot = input.projectRoot ? path.resolve(input.projectRoot) : process.cwd();
  const artifactRelative = path.relative(projectRoot, absolutePath);

  return {
    summary: { accepted, patched, deferred, dismissed },
    artifact: artifactRelative,
    mapsCreated,
    mapsUpdated,
    mapsRemoved,
    errors,
  };
}
