/**
 * Concordance client environment-variable contract (sprint-97 F2/m03).
 *
 * Spec: cmos/foundational-docs/technical/concordance-integration.md §"Client Configuration"
 *
 * Auth hygiene rule (non-negotiable per concordance-integration.md):
 *   - CONCORDANCE_API_KEY is read at REQUEST time only, never at module-import
 *     time. No module-level cache survives between calls. No logging of the
 *     value. No error message echoing the value.
 *   - The bridge layer surfaces only the key id derived from a one-way hash,
 *     never the secret.
 */

const DEFAULT_HOSTED_BASE_URL = 'https://concordance-production.up.railway.app';
const DEFAULT_LOCAL_BASE_URL = 'http://localhost:8787';
const DEFAULT_TIMEOUT_BLOCKING_MS = 5000;
const DEFAULT_TIMEOUT_ADVISORY_MS = 2000;

export interface ConcordanceConfig {
  /** Base URL (no trailing slash). */
  baseUrl: string;
  /** Per-call timeout for blocking codegen-path calls. */
  timeoutMsBlocking: number;
  /** Per-call timeout for advisory operator-flow calls. */
  timeoutMsAdvisory: number;
  /** Optional override for the multi-tenancy workspace identifier. */
  workspace: string | null;
}

export const HOSTED_BASE_URL = DEFAULT_HOSTED_BASE_URL;
export const LOCAL_BASE_URL = DEFAULT_LOCAL_BASE_URL;

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Read the client config from process.env at call time. Always returns a fresh
 * snapshot; never caches the API key.
 */
export function readConfig(overrides: Partial<ConcordanceConfig> = {}): ConcordanceConfig {
  const baseUrlEnv = process.env.CONCORDANCE_BASE_URL;
  return {
    baseUrl: trimTrailingSlash(overrides.baseUrl ?? baseUrlEnv ?? DEFAULT_HOSTED_BASE_URL),
    timeoutMsBlocking: overrides.timeoutMsBlocking ?? parsePositiveInt(
      process.env.CONCORDANCE_TIMEOUT_MS_BLOCKING,
      DEFAULT_TIMEOUT_BLOCKING_MS,
    ),
    timeoutMsAdvisory: overrides.timeoutMsAdvisory ?? parsePositiveInt(
      process.env.CONCORDANCE_TIMEOUT_MS_ADVISORY,
      DEFAULT_TIMEOUT_ADVISORY_MS,
    ),
    workspace: overrides.workspace ?? process.env.CONCORDANCE_WORKSPACE ?? null,
  };
}

/**
 * Reads CONCORDANCE_API_KEY at call time. Returns null if absent. Callers MUST
 * NOT cache the result across calls.
 */
export function readApiKey(): string | null {
  const k = process.env.CONCORDANCE_API_KEY;
  return typeof k === 'string' && k.length > 0 ? k : null;
}

/** Whether the test-only schema_version override is set (triggers a warning). */
export function readSchemaVersionOverride(): string | null {
  const v = process.env.CONCORDANCE_SCHEMA_VERSION_OVERRIDE;
  return typeof v === 'string' && v.length > 0 ? v : null;
}
