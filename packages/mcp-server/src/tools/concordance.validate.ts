/**
 * concordance.validate — agent-callable MCP tool wrapping the F2 validator.
 *
 * Per derek 2026-05-16 (decision #431), this tool surface is the FIRST place
 * the F2 validateManifest() function (sprint-97 m02) is exposed to agents.
 * It is deliberately confidence-gated: agents must explicitly call this tool
 * to validate a manifest — validation is NOT auto-baked into the compose /
 * render / codegen pipeline. Pipeline auto-integration is deferred to a
 * future sprint once tool usage and the hosted Concordance service hold up.
 *
 * Input variants:
 *   { manifest: <inline object> }                    — validate an inline payload
 *   { manifestPath: <project-relative path> }        — load + validate from disk
 *
 * Path safety: absolute paths and parent-traversal (..) are rejected.
 *
 * Error mapping follows the F2 convention (AJV-native error shape with
 * instancePath/keyword/params/message preserved) for Pydantic detail.errors[]
 * parity with the hosted Concordance service.
 *
 * Major schema_version mismatches (ConcordanceVersionError) are reported as
 * structured errors in the response by default; pass throwOnVersionError=true
 * to surface them as tool errors instead.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ErrorObject } from 'ajv';

import { validateManifest } from '../concordance/validator.js';
import {
  FORGE_SCHEMA_VERSION_PIN,
  compareSchemaVersion,
} from '../concordance/version-policy.js';
import { ConcordanceVersionError } from '../concordance/errors.js';
import { ToolError } from '../errors/tool-error.js';

export type ConcordanceValidateInput =
  | {
      manifest: Record<string, unknown>;
      manifestPath?: undefined;
      projectRoot?: string;
      throwOnVersionError?: boolean;
    }
  | {
      manifest?: undefined;
      manifestPath: string;
      projectRoot?: string;
      throwOnVersionError?: boolean;
    };

export interface ConcordanceValidateError {
  keyword: string;
  instancePath: string;
  schemaPath?: string;
  params?: Record<string, unknown>;
  message: string;
  [extra: string]: unknown;
}

export type VersionPolicyOutcome = 'exact' | 'patch' | 'minor' | 'major' | 'absent';

export interface ConcordanceValidateOutput {
  valid: boolean;
  errors: ConcordanceValidateError[];
  warnings: string[];
  schemaVersion: string | null;
  versionPolicy: VersionPolicyOutcome;
  diagnostics: {
    expectedSchemaVersion: string;
    source: 'inline' | 'file';
    manifestPath: string | null;
    entityCount: number;
  };
}

const PATH_TRAVERSAL_RE = /(^|[\\/])\.\.([\\/]|$)/;

function resolveManifestPath(relPath: string, projectRoot?: string): string {
  const trimmed = relPath.trim();
  if (!trimmed) {
    throw new ToolError('OODS-CV-001', 'manifestPath must be a non-empty string', {
      manifestPath: relPath,
    });
  }
  if (path.isAbsolute(trimmed)) {
    throw new ToolError('OODS-CV-002', 'manifestPath must be relative, not absolute', {
      manifestPath: relPath,
    });
  }
  if (PATH_TRAVERSAL_RE.test(trimmed)) {
    throw new ToolError('OODS-CV-003', 'manifestPath must not contain parent-directory traversal (..)', {
      manifestPath: relPath,
    });
  }
  const root = projectRoot ? path.resolve(projectRoot) : process.cwd();
  const resolved = path.resolve(root, trimmed);
  const rel = path.relative(root, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new ToolError('OODS-CV-004', 'manifestPath escapes the project root after normalization', {
      manifestPath: relPath,
      projectRoot: root,
    });
  }
  if (!fs.existsSync(resolved)) {
    throw new ToolError('OODS-CV-005', `manifest file not found: ${trimmed}`, {
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
    throw new ToolError('OODS-CV-006', `failed to read manifest file: ${(err as Error).message}`, {
      manifestPath: resolvedPath,
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new ToolError('OODS-CV-007', `manifest file is not valid JSON: ${(err as Error).message}`, {
      manifestPath: resolvedPath,
    });
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ToolError('OODS-CV-008', 'manifest file must contain a JSON object at the root', {
      manifestPath: resolvedPath,
    });
  }
  return parsed as Record<string, unknown>;
}

function normalizeAjvError(e: ErrorObject): ConcordanceValidateError {
  return {
    keyword: e.keyword,
    instancePath: e.instancePath,
    schemaPath: e.schemaPath,
    params: (e.params as Record<string, unknown>) ?? {},
    message: e.message ?? '',
  };
}

function determineVersionOutcome(observed: string | null): VersionPolicyOutcome {
  if (observed === null) return 'absent';
  try {
    return compareSchemaVersion(observed, FORGE_SCHEMA_VERSION_PIN).kind;
  } catch {
    // Non-semver observed values surface as 'absent' for the policy field;
    // the AJV validator already records a schema_version-type error.
    return 'absent';
  }
}

function countEntities(manifest: Record<string, unknown>): number {
  const entities = (manifest as { entities?: unknown }).entities;
  return Array.isArray(entities) ? entities.length : 0;
}

export async function handle(input: ConcordanceValidateInput): Promise<ConcordanceValidateOutput> {
  if (!input || typeof input !== 'object') {
    throw new ToolError('OODS-CV-009', 'input must be an object');
  }

  let manifest: Record<string, unknown>;
  let source: 'inline' | 'file';
  let manifestPathResolved: string | null = null;

  if (input.manifest !== undefined) {
    if (typeof input.manifest !== 'object' || input.manifest === null || Array.isArray(input.manifest)) {
      throw new ToolError('OODS-CV-010', 'manifest must be an object');
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
    throw new ToolError('OODS-CV-011', 'one of manifest or manifestPath is required');
  }

  const observedVersion =
    typeof (manifest as { schema_version?: unknown }).schema_version === 'string'
      ? ((manifest as { schema_version: string }).schema_version)
      : null;
  const versionPolicy = determineVersionOutcome(observedVersion);

  try {
    const result = validateManifest(manifest);
    return {
      valid: result.valid,
      errors: result.errors.map(normalizeAjvError),
      warnings: result.warnings,
      schemaVersion: observedVersion,
      versionPolicy,
      diagnostics: {
        expectedSchemaVersion: FORGE_SCHEMA_VERSION_PIN,
        source,
        manifestPath: manifestPathResolved,
        entityCount: countEntities(manifest),
      },
    };
  } catch (err) {
    if (err instanceof ConcordanceVersionError) {
      if (input.throwOnVersionError) {
        throw new ToolError(
          'OODS-CV-012',
          err.message,
          {
            expectedSchemaVersion: err.expected,
            observedSchemaVersion: err.observed,
          },
        );
      }
      return {
        valid: false,
        errors: [
          {
            keyword: 'schema_version',
            instancePath: '/schema_version',
            schemaPath: '#/properties/schema_version',
            params: { expected: err.expected, observed: err.observed },
            message: err.message,
          },
        ],
        warnings: [],
        schemaVersion: observedVersion,
        versionPolicy: 'major',
        diagnostics: {
          expectedSchemaVersion: FORGE_SCHEMA_VERSION_PIN,
          source,
          manifestPath: manifestPathResolved,
          entityCount: countEntities(manifest),
        },
      };
    }
    throw err;
  }
}
