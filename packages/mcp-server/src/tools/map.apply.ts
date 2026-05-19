/**
 * map.apply MCP tool handler.
 * Routes Stage1 reconciliation verdicts into create/patch/skip/conflict flows.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ToolError } from '../errors/tool-error.js';
import { handle as createHandle } from './map.create.js';
import { handle as updateHandle } from './map.update.js';
import {
  computeMappingsEtag,
  generateMappingId,
  loadMappings,
  slugify,
  type ComponentMapping,
} from './map.shared.js';
import type {
  ConflictArtifactItem,
  MapApplyConflict,
  MapApplyInput,
  MapApplyOutput,
  MapApplyQueued,
  MapApplyRoute,
  MapCreateInput,
  MapUpdateInput,
  RemediationHint,
  Stage1AlternateInterpretation,
  Stage1CandidateDiff,
  Stage1CandidateObject,
  Stage1ReconciliationReport,
} from './types.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../../');

type ConflictArtifactEntry = ConflictArtifactItem;

type PatchPlan = {
  updates: MapUpdateInput['updates'];
  hasChanges: boolean;
};

export async function handle(input: MapApplyInput): Promise<MapApplyOutput> {
  const report = loadReport(input);
  const externalSystem = deriveExternalSystem(report);
  const applied: MapApplyRoute[] = [];
  const skipped: MapApplyRoute[] = [];
  const queued: MapApplyQueued[] = [];
  const conflicted: MapApplyConflict[] = [];
  const errors: MapApplyOutput['errors'] = [];
  const diff = {
    create: 0,
    patch: 0,
    skip: 0,
    conflict: 0,
    queued: 0,
    changedFields: new Set<string>(),
    addedTraits: new Set<string>(),
    removedTraits: new Set<string>(),
  };

  const minConfidence = input.minConfidence ?? 0.75;
  const apply = input.apply === true;
  const artifactEntries: { conflicts: ConflictArtifactEntry[]; belowConfidence: ConflictArtifactEntry[] } = {
    conflicts: [],
    belowConfidence: [],
  };

  for (const candidate of report.candidate_objects) {
    const reason = candidate.verdict_reasoning ?? candidate.reasoning;

    if (candidate.confidence < minConfidence) {
      const hints = buildRemediationHints(candidate, 'belowConfidence', minConfidence);
      queued.push({
        objectId: candidate.object_id,
        name: candidate.name,
        action: candidate.action,
        confidence: candidate.confidence,
        threshold: minConfidence,
        queueReason: 'below_confidence',
        recommendedOodsTraits: candidate.recommended_oods_traits,
        ...(candidate.existing_map_id ? { existingMapId: candidate.existing_map_id } : {}),
        reason,
        ...(candidate.diff ? { diff: candidate.diff } : {}),
        ...(hints.length > 0 ? { remediation_hints: hints } : {}),
      });
      artifactEntries.belowConfidence.push({
        objectId: candidate.object_id,
        name: candidate.name,
        action: candidate.action,
        confidence: candidate.confidence,
        ...(candidate.existing_map_id ? { existingMapId: candidate.existing_map_id } : {}),
        reason,
        candidate,
        remediation_hints: hints,
        resolution_status: 'open',
      });
      diff.queued += 1;
      captureDiff(candidate.diff, diff);
      continue;
    }

    switch (candidate.action) {
      case 'create': {
        const outcome = await routeCreate(candidate, externalSystem, apply);
        if ('error' in outcome) {
          errors.push(outcome.error);
          continue;
        }
        applied.push(outcome.route);
        diff.create += 1;
        captureDiff(candidate.diff, diff);
        break;
      }
      case 'patch': {
        const outcome = await routePatch(candidate, externalSystem, apply);
        if ('error' in outcome) {
          errors.push(outcome.error);
          continue;
        }
        applied.push(outcome.route);
        diff.patch += 1;
        captureDiff(candidate.diff, diff);
        break;
      }
      case 'skip': {
        const mapping = findExistingMapping(externalSystem, candidate);
        skipped.push({
          objectId: candidate.object_id,
          name: candidate.name,
          action: 'skip',
          confidence: candidate.confidence,
          recommendedOodsTraits: candidate.recommended_oods_traits,
          ...(candidate.existing_map_id ? { existingMapId: candidate.existing_map_id } : {}),
          ...(mapping ? { mappingId: mapping.id } : {}),
          reason,
          persisted: false,
          ...(candidate.diff ? { diff: candidate.diff } : {}),
        });
        diff.skip += 1;
        captureDiff(candidate.diff, diff);
        break;
      }
      case 'conflict': {
        const hints = buildRemediationHints(candidate, 'conflict', minConfidence);
        conflicted.push({
          objectId: candidate.object_id,
          name: candidate.name,
          action: 'conflict',
          confidence: candidate.confidence,
          ...(candidate.existing_map_id ? { existingMapId: candidate.existing_map_id } : {}),
          reason,
          ...(hints.length > 0 ? { remediation_hints: hints } : {}),
        });
        artifactEntries.conflicts.push({
          objectId: candidate.object_id,
          name: candidate.name,
          action: candidate.action,
          confidence: candidate.confidence,
          ...(candidate.existing_map_id ? { existingMapId: candidate.existing_map_id } : {}),
          reason,
          candidate,
          remediation_hints: hints,
          resolution_status: 'open',
        });
        diff.conflict += 1;
        captureDiff(candidate.diff, diff);
        break;
      }
    }
  }

  const artifactPath =
    artifactEntries.conflicts.length > 0 || artifactEntries.belowConfidence.length > 0
      ? buildConflictArtifactPath(report)
      : undefined;

  if (apply && artifactPath) {
    writeConflictArtifact(artifactPath, report, minConfidence, artifactEntries);
  }

  const finalDoc = loadMappings();
  return {
    applied,
    skipped,
    queued,
    conflicted,
    errors,
    diff: {
      create: diff.create,
      patch: diff.patch,
      skip: diff.skip,
      conflict: diff.conflict,
      queued: diff.queued,
      changedFields: Array.from(diff.changedFields),
      addedTraits: Array.from(diff.addedTraits),
      removedTraits: Array.from(diff.removedTraits),
    },
    ...(artifactPath ? { conflictArtifactPath: artifactPath } : {}),
    etag: computeMappingsEtag(finalDoc),
  };
}

function loadReport(input: MapApplyInput): Stage1ReconciliationReport {
  if ((input.report ? 1 : 0) + (input.reportPath ? 1 : 0) !== 1) {
    throw new ToolError('OODS-V201', 'map.apply requires exactly one of report or reportPath.', {
      reportProvided: Boolean(input.report),
      reportPathProvided: Boolean(input.reportPath),
    });
  }

  if (input.report) return input.report;

  const reportPath = path.isAbsolute(input.reportPath!) ? input.reportPath! : path.resolve(REPO_ROOT, input.reportPath!);
  return JSON.parse(fs.readFileSync(reportPath, 'utf8')) as Stage1ReconciliationReport;
}

function deriveExternalSystem(report: Stage1ReconciliationReport): string {
  if (report.target.url) {
    try {
      const hostname = new URL(report.target.url).hostname.replace(/^www\./, '');
      const pieces = hostname.split('.');
      if (pieces.length > 1) {
        return pieces.slice(0, -1).join('-');
      }
      return hostname;
    } catch {
      // Fall through to target id.
    }
  }

  return slugify(report.target.id);
}

async function routeCreate(
  candidate: Stage1CandidateObject,
  externalSystem: string,
  apply: boolean,
): Promise<{ route: MapApplyRoute } | { error: MapApplyOutput['errors'][number] }> {
  const existing = findExistingMapping(externalSystem, candidate);
  const mappingId = generateMappingId(externalSystem, candidate.name);
  const reason = candidate.verdict_reasoning ?? candidate.reasoning;

  if (existing) {
    if (sameTraitSet(existing.oodsTraits, candidate.recommended_oods_traits)) {
      return {
        route: {
          objectId: candidate.object_id,
          name: candidate.name,
          action: 'create',
          confidence: candidate.confidence,
          recommendedOodsTraits: candidate.recommended_oods_traits,
          existingMapId: existing.id,
          mappingId: existing.id,
          reason,
          persisted: false,
        },
      };
    }

    return {
      error: {
        objectId: candidate.object_id,
        name: candidate.name,
        action: candidate.action,
        message: `Create verdict collided with existing mapping '${existing.id}' that does not match the recommended trait set.`,
      },
    };
  }

  const result = await createHandle({
    apply,
    externalSystem,
    externalComponent: candidate.name,
    oodsTraits: candidate.recommended_oods_traits,
    confidence: 'auto',
    metadata: {
      author: 'stage1-reconciliation',
      notes: reason,
    },
    ...(candidate.projection_variants && candidate.projection_variants.length > 0
      ? { projection_variants: candidate.projection_variants }
      : {}),
  } satisfies MapCreateInput);

  if (result.status === 'error') {
    return {
      error: {
        objectId: candidate.object_id,
        name: candidate.name,
        action: candidate.action,
        message: result.errors?.message ?? 'map.create failed while applying reconciliation report.',
        ...(result.errors ? { details: result.errors } : {}),
      },
    };
  }

  return {
    route: {
      objectId: candidate.object_id,
      name: candidate.name,
      action: 'create',
      confidence: candidate.confidence,
      recommendedOodsTraits: candidate.recommended_oods_traits,
      mappingId,
      reason,
      persisted: apply,
    },
  };
}

async function routePatch(
  candidate: Stage1CandidateObject,
  externalSystem: string,
  apply: boolean,
): Promise<{ route: MapApplyRoute } | { error: MapApplyOutput['errors'][number] }> {
  const reason = candidate.verdict_reasoning ?? candidate.reasoning;
  const existing = findExistingMapping(externalSystem, candidate);

  if (!existing) {
    return {
      error: {
        objectId: candidate.object_id,
        name: candidate.name,
        action: candidate.action,
        message: `Patch verdict could not find existing mapping '${candidate.existing_map_id ?? candidate.name}'.`,
      },
    };
  }

  const plan = buildPatchPlan(candidate, existing);
  if (!plan.hasChanges) {
    return {
      route: {
        objectId: candidate.object_id,
        name: candidate.name,
        action: 'patch',
        confidence: candidate.confidence,
        recommendedOodsTraits: candidate.recommended_oods_traits,
        existingMapId: existing.id,
        mappingId: existing.id,
        reason,
        persisted: false,
        ...(candidate.diff ? { diff: candidate.diff } : {}),
      },
    };
  }

  if (apply) {
    const result = await updateHandle({
      id: existing.id,
      updates: plan.updates,
    } satisfies MapUpdateInput);

    if (result.status === 'error') {
      return {
        error: {
          objectId: candidate.object_id,
          name: candidate.name,
          action: candidate.action,
          message: result.message ?? `map.update failed while applying patch for '${existing.id}'.`,
        },
      };
    }
  }

  return {
    route: {
      objectId: candidate.object_id,
      name: candidate.name,
      action: 'patch',
      confidence: candidate.confidence,
      recommendedOodsTraits: candidate.recommended_oods_traits,
      existingMapId: existing.id,
      mappingId: existing.id,
      reason,
      persisted: apply,
      ...(candidate.diff ? { diff: candidate.diff } : {}),
    },
  };
}

function buildPatchPlan(candidate: Stage1CandidateObject, existing: ComponentMapping): PatchPlan {
  const updates: MapUpdateInput['updates'] = {};

  if (!sameTraitSet(existing.oodsTraits, candidate.recommended_oods_traits)) {
    updates.oodsTraits = candidate.recommended_oods_traits;
  }

  const noteChange = candidate.diff?.changed_fields.find((entry) => entry.field === 'metadata.notes');
  if (typeof noteChange?.to === 'string' && noteChange.to !== existing.metadata?.notes) {
    updates.notes = noteChange.to;
  }

  if (candidate.projection_variants !== undefined) {
    if (!sameProjectionVariants(existing.projection_variants, candidate.projection_variants)) {
      updates.projection_variants = candidate.projection_variants;
    }
  }

  const hasChanges = Object.keys(updates).length > 0;
  return { updates, hasChanges };
}

function sameProjectionVariants(
  left: ComponentMapping['projection_variants'],
  right: Stage1CandidateObject['projection_variants'],
): boolean {
  const a = left ?? [];
  const b = right ?? [];
  if (a.length !== b.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

function findExistingMapping(externalSystem: string, candidate: Stage1CandidateObject): ComponentMapping | undefined {
  const doc = loadMappings();
  if (candidate.existing_map_id) {
    const byId = doc.mappings.find((mapping) => mapping.id === candidate.existing_map_id);
    if (byId) return byId;
  }

  return doc.mappings.find(
    (mapping) =>
      mapping.externalSystem.toLowerCase() === externalSystem.toLowerCase() &&
      mapping.externalComponent.toLowerCase() === candidate.name.toLowerCase(),
  );
}

function sameTraitSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const a = [...left].sort();
  const b = [...right].sort();
  return a.every((value, index) => value === b[index]);
}

function captureDiff(
  candidateDiff: Stage1CandidateDiff | undefined,
  diff: {
    changedFields: Set<string>;
    addedTraits: Set<string>;
    removedTraits: Set<string>;
  },
): void {
  if (!candidateDiff) return;
  for (const field of candidateDiff.changed_fields) {
    diff.changedFields.add(field.field);
  }
  for (const trait of candidateDiff.added_traits) {
    diff.addedTraits.add(trait);
  }
  for (const trait of candidateDiff.removed_traits) {
    diff.removedTraits.add(trait);
  }
}

function buildConflictArtifactPath(report: Stage1ReconciliationReport): string {
  const timestamp = report.generated_at.replace(/:/g, '-');
  const runId = slugify(report.target.id);
  return path.join('.oods', 'conflicts', `${timestamp}-${runId}.json`);
}

/**
 * Derive machine-readable remediation hints for an operator triage workflow.
 *
 * Hints are NOT auto-applied — they are recommendations that the review.triage
 * tool surfaces to a human operator (or downstream UI like C5a/C5b). Each hint
 * carries its own confidence so the UI can rank them. 1–3 hints per item,
 * ordered by confidence desc.
 *
 * The kinds we emit map onto operator verdicts: use_alternate_interpretation
 * suggests `patch` against an alternate role; merge_with_existing suggests
 * `patch` against the existing_map_id; reject_low_confidence suggests `defer`
 * or `dismiss`; manual_patch suggests `patch` with operator overrides; split
 * suggests escalating to multi-mapping work outside this tool's surface.
 */
export function buildRemediationHints(
  candidate: Stage1CandidateObject,
  bucket: 'conflict' | 'belowConfidence',
  minConfidence: number,
): RemediationHint[] {
  const hints: RemediationHint[] = [];

  const alternates = candidate.alternate_interpretations ?? [];
  alternates.forEach((alt, index) => {
    const normalized = normalizeAlternate(alt);
    if (!normalized) return;
    hints.push({
      kind: 'use_alternate_interpretation',
      confidence: normalized.score,
      reasoning: `Stage1 surfaced alternate role '${normalized.role}': ${normalized.reasoning}`,
      refs: { alternateInterpretationIndex: index },
    });
  });

  if (candidate.existing_map_id) {
    if (bucket === 'conflict') {
      hints.push({
        kind: 'merge_with_existing',
        confidence: Math.min(0.85, candidate.confidence + 0.05),
        reasoning: `Patch existing mapping '${candidate.existing_map_id}' with the recommended trait set rather than creating a duplicate.`,
        refs: { existingMapId: candidate.existing_map_id },
      });
    } else if (bucket === 'belowConfidence') {
      hints.push({
        kind: 'manual_patch',
        confidence: Math.max(0.4, candidate.confidence),
        reasoning: `Confidence ${candidate.confidence.toFixed(2)} is below the ${minConfidence.toFixed(2)} threshold; review the diff against '${candidate.existing_map_id}' and patch manually if the change is correct.`,
        refs: { existingMapId: candidate.existing_map_id },
      });
    }
  }

  if (bucket === 'belowConfidence' && candidate.confidence < minConfidence - 0.15) {
    hints.push({
      kind: 'reject_low_confidence',
      confidence: 1 - candidate.confidence,
      reasoning: `Confidence ${candidate.confidence.toFixed(2)} is well below the ${minConfidence.toFixed(2)} threshold; consider deferring until Stage1 produces stronger evidence.`,
    });
  }

  if (hints.length === 0) {
    // Always guarantee at least one hint per item so consumers don't need to
    // branch on emptiness — fall back to a generic manual-patch suggestion.
    hints.push({
      kind: 'manual_patch',
      confidence: Math.max(0.3, candidate.confidence * 0.5),
      reasoning:
        bucket === 'conflict'
          ? 'No alternate interpretations or existing mapping references available; operator should manually review trait set and patch or accept.'
          : 'Confidence below threshold and no alternate signals available; operator should manually review evidence before accepting.',
    });
  }

  hints.sort((a, b) => b.confidence - a.confidence);
  return hints.slice(0, 3);
}

function normalizeAlternate(
  alt: Stage1AlternateInterpretation,
): { role: string; score: number; reasoning: string } | null {
  if (typeof alt === 'string') {
    return { role: alt, score: 0.5, reasoning: `Alternate role label '${alt}' surfaced by Stage1.` };
  }
  if (alt && typeof alt === 'object') {
    return { role: alt.role, score: alt.score, reasoning: alt.reasoning };
  }
  return null;
}

function writeConflictArtifact(
  relativePath: string,
  report: Stage1ReconciliationReport,
  minConfidence: number,
  entries: { conflicts: ConflictArtifactEntry[]; belowConfidence: ConflictArtifactEntry[] },
): void {
  const absolutePath = path.resolve(REPO_ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(
    absolutePath,
    JSON.stringify(
      {
        kind: 'map.apply.conflicts',
        schemaVersion: report.schema_version,
        generatedAt: report.generated_at,
        target: report.target,
        minConfidence,
        reconciliationSummary: report.reconciliation_summary ?? null,
        conflicts: entries.conflicts,
        belowConfidence: entries.belowConfidence,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
}
