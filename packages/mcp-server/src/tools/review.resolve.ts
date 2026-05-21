/**
 * review.resolve — agent-callable C3 conflict-resolution MCP tool (sprint-103 m01).
 *
 * Consumed by orchestrating agents; no playground UI required. Resolves
 * low-confidence reconciliation conflicts in an Object Catalog manifest by
 * applying a policy bundle and producing per-entity decisions with an audit
 * trail.
 *
 * Per the s103-m01 mission-start audit (captured 2026-05-21 as a CMOS
 * decision), this tool reuses the D4 pure-function evaluator shape on a
 * distinct action space (accept|patch|defer|dismiss) over predicates that
 * read entity.oods.confidence_decomposition. The s99-m04 review-emitter
 * renders the same field as visual tiers for humans; this tool resolves
 * flagged items by policy for agents.
 *
 * Input variants (mirroring concordance.validate's two-way pattern):
 *   { manifest: <inline object>, policies, defaultAction? }
 *   { manifestPath: <project-relative path>, policies, defaultAction? }
 *
 * Path safety: absolute paths and parent-traversal (..) are rejected.
 */

import fs from 'node:fs';
import path from 'node:path';

import { ToolError } from '../errors/tool-error.js';
import {
  evaluatePolicies,
  validatePolicyBundle,
  type PolicyBundle,
  type PolicyDecision,
  type EvaluationResult,
} from '../codegen/review-policy.js';
import type { SemanticEntity } from '../object-catalog/types.js';

export interface ReviewResolveInputBase {
  policies: PolicyBundle;
  defaultAction?: PolicyDecision;
  projectRoot?: string;
}

export type ReviewResolveInput =
  | (ReviewResolveInputBase & {
      manifest: Record<string, unknown>;
      manifestPath?: undefined;
    })
  | (ReviewResolveInputBase & {
      manifest?: undefined;
      manifestPath: string;
    });

export interface AuditTrail {
  evaluatedAt: string;
  defaultAction: PolicyDecision;
  entityCount: number;
  policyBundle: PolicyBundle;
  matchedPolicyIds: string[];
}

export interface ReviewResolveOutput {
  resolutions: EvaluationResult[];
  auditTrail: AuditTrail;
  warnings: string[];
  diagnostics: {
    source: 'inline' | 'file';
    manifestPath: string | null;
  };
}

const PATH_TRAVERSAL_RE = /(^|[\\/])\.\.([\\/]|$)/;
const VALID_DECISIONS: ReadonlySet<PolicyDecision> = new Set<PolicyDecision>([
  'accept',
  'patch',
  'defer',
  'dismiss',
]);
const DEFAULT_ACTION: PolicyDecision = 'defer';

function resolveManifestPath(relPath: string, projectRoot?: string): string {
  const trimmed = relPath.trim();
  if (!trimmed) {
    throw new ToolError('OODS-RR-001', 'manifestPath must be a non-empty string', {
      manifestPath: relPath,
    });
  }
  if (path.isAbsolute(trimmed)) {
    throw new ToolError('OODS-RR-002', 'manifestPath must be relative, not absolute', {
      manifestPath: relPath,
    });
  }
  if (PATH_TRAVERSAL_RE.test(trimmed)) {
    throw new ToolError(
      'OODS-RR-003',
      'manifestPath must not contain parent-directory traversal (..)',
      { manifestPath: relPath },
    );
  }
  const root = projectRoot ? path.resolve(projectRoot) : process.cwd();
  const resolved = path.resolve(root, trimmed);
  const rel = path.relative(root, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new ToolError('OODS-RR-004', 'manifestPath escapes the project root after normalization', {
      manifestPath: relPath,
      projectRoot: root,
    });
  }
  if (!fs.existsSync(resolved)) {
    throw new ToolError('OODS-RR-005', `manifest file not found: ${trimmed}`, {
      manifestPath: relPath,
    });
  }
  return resolved;
}

function readManifestFromDisk(resolvedPath: string): Record<string, unknown> {
  let raw: string;
  try {
    raw = fs.readFileSync(resolvedPath, 'utf8');
  } catch (err) {
    throw new ToolError(
      'OODS-RR-006',
      `failed to read manifest file: ${(err as Error).message}`,
      { manifestPath: resolvedPath },
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new ToolError(
      'OODS-RR-007',
      `manifest file is not valid JSON: ${(err as Error).message}`,
      { manifestPath: resolvedPath },
    );
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ToolError('OODS-RR-008', 'manifest file must contain a JSON object at the root', {
      manifestPath: resolvedPath,
    });
  }
  return parsed as Record<string, unknown>;
}

function ensureEntities(manifest: Record<string, unknown>): SemanticEntity[] {
  const entities = (manifest as { entities?: unknown }).entities;
  if (!Array.isArray(entities)) {
    throw new ToolError('OODS-RR-009', "manifest.entities must be an array", {
      receivedType: typeof entities,
    });
  }
  return entities as SemanticEntity[];
}

export async function handle(input: ReviewResolveInput): Promise<ReviewResolveOutput> {
  if (!input || typeof input !== 'object') {
    throw new ToolError('OODS-RR-010', 'input must be an object');
  }

  if (!input.policies || typeof input.policies !== 'object' || Array.isArray(input.policies)) {
    throw new ToolError('OODS-RR-011', 'policies bundle is required and must be an object');
  }
  if (!Array.isArray((input.policies as PolicyBundle).policies)) {
    throw new ToolError('OODS-RR-012', 'policies.policies must be an array');
  }

  const defaultAction: PolicyDecision = input.defaultAction ?? DEFAULT_ACTION;
  if (!VALID_DECISIONS.has(defaultAction)) {
    throw new ToolError(
      'OODS-RR-013',
      `defaultAction must be one of accept|patch|defer|dismiss; received '${defaultAction}'`,
    );
  }

  // Runtime invariants beyond AJV reach (duplicate IDs, urn/pattern mutex).
  const bundleErrors = validatePolicyBundle(input.policies);
  if (bundleErrors !== null) {
    throw new ToolError('OODS-RR-014', 'policy bundle invariants violated', {
      errors: bundleErrors,
    });
  }

  let manifest: Record<string, unknown>;
  let source: 'inline' | 'file';
  let manifestPathResolved: string | null = null;

  if (input.manifest !== undefined) {
    if (typeof input.manifest !== 'object' || input.manifest === null || Array.isArray(input.manifest)) {
      throw new ToolError('OODS-RR-015', 'manifest must be an object');
    }
    manifest = input.manifest as Record<string, unknown>;
    source = 'inline';
  } else if (input.manifestPath !== undefined) {
    const resolved = resolveManifestPath(input.manifestPath, input.projectRoot);
    manifest = readManifestFromDisk(resolved);
    manifestPathResolved = path.relative(
      input.projectRoot ? path.resolve(input.projectRoot) : process.cwd(),
      resolved,
    );
    source = 'file';
  } else {
    throw new ToolError('OODS-RR-016', 'one of manifest or manifestPath is required');
  }

  const entities = ensureEntities(manifest);
  const resolutions: EvaluationResult[] = [];
  const matchedPolicyIds = new Set<string>();
  const warnings: string[] = [];

  for (const entity of entities) {
    if (typeof entity.urn !== 'string' || entity.urn.length === 0) {
      warnings.push(
        `Entity at index ${resolutions.length} is missing a urn; skipped.`,
      );
      continue;
    }
    const decomposition = entity.oods?.confidence_decomposition ?? null;
    const result = evaluatePolicies(
      { urn: entity.urn, confidenceDecomposition: decomposition },
      input.policies as PolicyBundle,
      defaultAction,
    );
    resolutions.push(result);
    if (result.policyId !== 'default') {
      matchedPolicyIds.add(result.policyId);
    }
  }

  const auditTrail: AuditTrail = {
    evaluatedAt: new Date().toISOString(),
    defaultAction,
    entityCount: resolutions.length,
    policyBundle: input.policies as PolicyBundle,
    matchedPolicyIds: Array.from(matchedPolicyIds).sort(),
  };

  return {
    resolutions,
    auditTrail,
    warnings,
    diagnostics: {
      source,
      manifestPath: manifestPathResolved,
    },
  };
}

