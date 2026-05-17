/**
 * ConcordanceClient — HTTP wrapper around the documented Concordance endpoints
 * (sprint-97 F2/m03; retry surface added sprint-99 I3/m02).
 *
 * Spec: cmos/foundational-docs/technical/concordance-integration.md
 *
 * Design rules (enforced):
 *   - API key is read FROM process.env at request time, NEVER cached, NEVER
 *     written to a log line, NEVER included in an error message.
 *   - Every request captures x-request-id + concordance-schema-version headers
 *     into a diagnostics object that rides on the success result AND on every
 *     thrown structured error.
 *   - 401/403/422 are mapped to typed error classes per
 *     concordance-integration.md §"Auth Error Mapping" — 422 preserves
 *     detail.errors[] verbatim for downstream surfacing.
 *   - Bounded exp-backoff retry on 429/5xx is wired ONLY into
 *     validateManifestRemote() for v0.1 (sprint-99 m02). Broader rollout
 *     (submitManifest, getEntity, batch operations) is gated on usage signals
 *     — see retry.ts header.
 */

import {
  ConcordanceAuthError,
  ConcordanceError,
  ConcordancePermissionError,
  ConcordanceValidationError,
  type ConcordanceDiagnostics,
} from './errors.js';
import { readApiKey, readConfig, type ConcordanceConfig } from './config.js';
import {
  DEFAULT_RETRY_POLICY,
  computeRetryDelay,
  defaultClock,
  defaultRetryLogger,
  exceedsBudget,
  isRetryableStatus,
  type RetryClock,
  type RetryLogger,
  type RetryPolicy,
} from './retry.js';

export type FetchFn = typeof fetch;

export interface ConcordanceClientOptions {
  /** Override the base URL (otherwise read from CONCORDANCE_BASE_URL). */
  baseUrl?: string;
  /** Override the per-call timeout (advisory by default). */
  timeoutMs?: number;
  /** Inject a fetch implementation. Default: globalThis.fetch (Node 20+). */
  fetch?: FetchFn;
  /**
   * Override the retry policy applied to validateManifestRemote() (sprint-99
   * I3). Other endpoints currently never retry regardless of this value.
   */
  retryPolicy?: RetryPolicy;
  /**
   * Inject a clock for test-time control of now()/sleep(). Default: real
   * Date.now() + setTimeout.
   */
  clock?: RetryClock;
  /** Override the rng used by exp-backoff jitter. Default: Math.random. */
  rng?: () => number;
  /**
   * Override the per-retry logger sink. Default: console.info. The default
   * matches the I1-smoke diagnostic verbosity so retry events appear in the
   * same operational stream.
   */
  retryLogger?: RetryLogger;
}

export interface ConcordanceResult<T> {
  data: T;
  diagnostics: ConcordanceDiagnostics;
  /** Non-fatal notes (e.g. version-policy drift on a probe). */
  warnings: string[];
}

export interface HealthResponse {
  status: string;
  version?: string;
  entities?: number;
  relationships?: number;
}

export interface VersionResponse {
  service_version: string;
  schema_version: string;
  recipe_versions: Record<string, string>;
  current_sprint_id: string;
  build_hash: string | null;
}

export interface ManifestIngestResponse {
  ingested_entities?: number;
  [extra: string]: unknown;
}

interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
  authenticated: boolean;
  timeoutMs?: number;
  /**
   * When set, this request is retry-eligible: 429 and 5xx responses trigger
   * bounded exp-backoff per the policy. Undefined = single-attempt (existing
   * behavior for all non-validate endpoints).
   */
  retry?: RetryPolicy;
}

function emptyDiagnostics(): ConcordanceDiagnostics {
  return { requestId: null, schemaVersion: null, status: null, durationMs: null };
}

function captureDiagnostics(headers: Headers, status: number, durationMs: number): ConcordanceDiagnostics {
  return {
    requestId: headers.get('x-request-id'),
    schemaVersion: headers.get('concordance-schema-version'),
    status,
    durationMs,
  };
}

export class ConcordanceClient {
  private readonly config: ConcordanceConfig;
  private readonly fetchImpl: FetchFn;
  private readonly retryPolicy: RetryPolicy;
  private readonly clock: RetryClock;
  private readonly rng: () => number;
  private readonly retryLogger: RetryLogger;

  constructor(options: ConcordanceClientOptions = {}) {
    this.config = readConfig({ baseUrl: options.baseUrl });
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.retryPolicy = options.retryPolicy ?? DEFAULT_RETRY_POLICY;
    this.clock = options.clock ?? defaultClock;
    this.rng = options.rng ?? Math.random;
    this.retryLogger = options.retryLogger ?? defaultRetryLogger;
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  // ── Unauthenticated probes ────────────────────────────────────────────────

  health(): Promise<ConcordanceResult<HealthResponse>> {
    return this.request<HealthResponse>({ method: 'GET', path: '/health', authenticated: false });
  }

  version(): Promise<ConcordanceResult<VersionResponse>> {
    return this.request<VersionResponse>({ method: 'GET', path: '/version', authenticated: false });
  }

  openapi(): Promise<ConcordanceResult<{ info?: { version?: string }; paths?: Record<string, unknown> }>> {
    return this.request({ method: 'GET', path: '/openapi.json', authenticated: false });
  }

  // For /docs and /redoc Concordance returns HTML; we just want to confirm
  // 200-ness, not parse the body. Returned `data` is the raw text.
  async docs(): Promise<ConcordanceResult<string>> {
    return this.requestText({ method: 'GET', path: '/docs', authenticated: false });
  }

  async redoc(): Promise<ConcordanceResult<string>> {
    return this.requestText({ method: 'GET', path: '/redoc', authenticated: false });
  }

  // ── Authenticated endpoints ───────────────────────────────────────────────

  validateManifestRemote(payload: unknown): Promise<ConcordanceResult<unknown>> {
    return this.request<unknown>({
      method: 'POST',
      path: '/manifests/validate',
      body: payload,
      authenticated: true,
      timeoutMs: this.config.timeoutMsBlocking,
      retry: this.retryPolicy,
    });
  }

  submitManifest(payload: unknown): Promise<ConcordanceResult<ManifestIngestResponse>> {
    // Retry surface (sprint-99 m02) extended to submitManifest in m03: the G3
    // multi-fixture round-trip POSTs 4 manifests in sequence under live load,
    // so Railway rate-limit absorption is now a real usage signal — not a
    // future hypothetical. Manifest submission is idempotent (re-posting the
    // same fixture upserts on URN), so a retry after a 429 is safe.
    return this.request<ManifestIngestResponse>({
      method: 'POST',
      path: '/manifests',
      body: payload,
      authenticated: true,
      timeoutMs: this.config.timeoutMsBlocking,
      retry: this.retryPolicy,
    });
  }

  getEntity(urn: string): Promise<ConcordanceResult<unknown>> {
    // Retry surface (sprint-99 m02) extended to getEntity in m03: the G3
    // multi-fixture round-trip issues N separate /entities/{urn} GETs per
    // multi-entity manifest. GETs are pure reads (idempotent by construction),
    // so 429/5xx retries are safe and the multi-entity test surface is the
    // first time burst-read behavior is exercised against Railway.
    const encoded = encodeURIComponent(urn);
    return this.request<unknown>({
      method: 'GET',
      path: `/entities/${encoded}`,
      authenticated: true,
      timeoutMs: this.config.timeoutMsBlocking,
      retry: this.retryPolicy,
    });
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  private buildHeaders(authenticated: boolean): Headers {
    const headers = new Headers();
    headers.set('accept', 'application/json');
    if (authenticated) {
      const key = readApiKey();
      if (!key) {
        // Surface the missing-key state via a structured error before the
        // network call so no request leaves the host with a bad header.
        throw new ConcordanceAuthError('missing');
      }
      headers.set('authorization', `Bearer ${key}`);
    }
    return headers;
  }

  private async request<T>(opts: RequestOptions): Promise<ConcordanceResult<T>> {
    return this.executeRequest<T>(opts, async (response) => {
      const text = await response.text();
      if (text.length === 0) return null as unknown as T;
      return JSON.parse(text) as T;
    });
  }

  private async requestText(opts: RequestOptions): Promise<ConcordanceResult<string>> {
    return this.executeRequest<string>(opts, (response) => response.text());
  }

  private async executeRequest<T>(
    opts: RequestOptions,
    parseBody: (response: Response) => Promise<T>,
  ): Promise<ConcordanceResult<T>> {
    const url = `${this.config.baseUrl}${opts.path}`;
    const headers = this.buildHeaders(opts.authenticated);
    const requestInit = (): RequestInit => {
      // Rebuild init per attempt so AbortController + headers are fresh.
      // Body is stable across retries; we re-stringify only on the first build.
      const h = new Headers(headers);
      if (opts.body !== undefined) {
        h.set('content-type', 'application/json');
        return { method: opts.method, headers: h, body: JSON.stringify(opts.body) };
      }
      return { method: opts.method, headers: h };
    };

    const timeoutMs = opts.timeoutMs ?? this.config.timeoutMsAdvisory;
    const retryPolicy = opts.retry;
    const overallStart = this.clock.now();
    // Budget for retry math == the per-call blocking timeout. The mission spec
    // calls this "remaining CONCORDANCE_TIMEOUT_MS_BLOCKING budget."
    const budgetMs = timeoutMs;

    let attempt = 0; // 0 = initial call; 1..maxRetries = retries
    let cumulativeSleepMs = 0;

    // Single-shot execution of one HTTP attempt. Returns either a successful
    // ConcordanceResult, or a "retry-decision" object the loop inspects.
    type AttemptOutcome =
      | { kind: 'success'; result: ConcordanceResult<T> }
      | { kind: 'mapped-error'; error: ConcordanceError; status: number; retryAfter: string | null }
      | { kind: 'network-error'; error: ConcordanceError };

    const runOnce = async (): Promise<AttemptOutcome> => {
      const init = requestInit();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      init.signal = controller.signal;

      const started = this.clock.now();
      let response: Response;
      try {
        response = await this.fetchImpl(url, init);
      } catch (err) {
        clearTimeout(timer);
        const e = new ConcordanceError(`Concordance request failed: ${(err as Error).message}`);
        e.diagnostics = emptyDiagnostics();
        e.diagnostics.durationMs = this.clock.now() - started;
        return { kind: 'network-error', error: e };
      }
      clearTimeout(timer);

      const durationMs = this.clock.now() - started;
      const diagnostics = captureDiagnostics(response.headers, response.status, durationMs);

      if (response.ok) {
        const data = await parseBody(response);
        return { kind: 'success', result: { data, diagnostics, warnings: [] } };
      }

      // Capture body text BEFORE error mapping so 422 detail.errors[] survives,
      // and capture Retry-After BEFORE re-reading is impossible.
      const retryAfter = response.headers.get('retry-after');
      const errorText = await response.text();
      const error = await this.mapErrorResponse(response.status, errorText, diagnostics);
      return { kind: 'mapped-error', error, status: response.status, retryAfter };
    };

    let lastError: ConcordanceError | null = null;
    // Loop bound: max (1 + maxRetries) attempts when retry is enabled; otherwise 1.
    const maxAttempts = retryPolicy ? 1 + retryPolicy.maxRetries : 1;

    while (attempt < maxAttempts) {
      const outcome = await runOnce();

      if (outcome.kind === 'success') {
        return outcome.result;
      }

      if (outcome.kind === 'network-error') {
        // Network failures are not retried by v0.1 scope (see retry.ts header).
        throw outcome.error;
      }

      lastError = outcome.error;

      // Decide whether to retry.
      if (!retryPolicy) {
        throw outcome.error;
      }
      if (!isRetryableStatus(outcome.status)) {
        throw outcome.error;
      }
      if (attempt + 1 >= maxAttempts) {
        // No more retries left; surface the final mapped error.
        throw outcome.error;
      }

      // Compute next delay: Retry-After overrides exp-backoff.
      const { delayMs, retryAfterUsed } = computeRetryDelay(
        attempt + 1,
        outcome.retryAfter,
        retryPolicy,
        this.clock,
        this.rng,
      );

      // Budget guard: if the planned delay would push us past the call budget
      // or past the cumulative-sleep cap, abort the retry chain.
      const elapsedMs = this.clock.now() - overallStart;
      if (
        exceedsBudget(
          delayMs,
          elapsedMs,
          cumulativeSleepMs,
          budgetMs,
          retryPolicy.totalWaitCapMs,
        )
      ) {
        throw outcome.error;
      }

      // Log BEFORE sleep so a stuck retry chain is observable in tailed logs.
      this.retryLogger({
        attempt: attempt + 1,
        delayMs,
        status: outcome.status,
        requestId: outcome.error.diagnostics?.requestId ?? null,
        retryAfterUsed,
      });

      await this.clock.sleep(delayMs);
      cumulativeSleepMs += delayMs;
      attempt += 1;
    }

    // Unreachable in well-formed retry math (loop above always throws or
    // returns), but TypeScript needs a terminal throw.
    throw lastError ?? new ConcordanceError('retry loop terminated without outcome');
  }

  private async mapErrorResponse(
    status: number,
    bodyText: string,
    diagnostics: ConcordanceDiagnostics,
  ): Promise<ConcordanceError> {
    let parsed: { detail?: { code?: string; errors?: unknown[]; message?: string } } | null = null;
    try {
      parsed = bodyText.length > 0 ? JSON.parse(bodyText) : null;
    } catch {
      parsed = null;
    }
    const detail = parsed?.detail;

    let err: ConcordanceError;
    if (status === 401) {
      const reason = detail?.code === 'invalid_authorization' ? 'invalid' : 'missing';
      err = new ConcordanceAuthError(reason);
    } else if (status === 403) {
      err = new ConcordancePermissionError(this.config.workspace);
    } else if (status === 422) {
      err = new ConcordanceValidationError(
        detail?.message ?? 'request body failed schema validation',
        Array.isArray(detail?.errors) ? (detail.errors as unknown[]) : [],
      );
    } else {
      err = new ConcordanceError(`Concordance request failed with status ${status}`);
    }
    err.diagnostics = diagnostics;
    return err;
  }
}
