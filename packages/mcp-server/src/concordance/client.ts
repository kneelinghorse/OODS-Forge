/**
 * ConcordanceClient — HTTP wrapper around the documented Concordance endpoints
 * (sprint-97 F2/m03).
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
 *   - No retry logic in this mission's surface; 429/5xx retries land in F2/I3.
 */

import {
  ConcordanceAuthError,
  ConcordanceError,
  ConcordancePermissionError,
  ConcordanceValidationError,
  type ConcordanceDiagnostics,
} from './errors.js';
import { readApiKey, readConfig, type ConcordanceConfig } from './config.js';

export type FetchFn = typeof fetch;

export interface ConcordanceClientOptions {
  /** Override the base URL (otherwise read from CONCORDANCE_BASE_URL). */
  baseUrl?: string;
  /** Override the per-call timeout (advisory by default). */
  timeoutMs?: number;
  /** Inject a fetch implementation. Default: globalThis.fetch (Node 20+). */
  fetch?: FetchFn;
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

  constructor(options: ConcordanceClientOptions = {}) {
    this.config = readConfig({ baseUrl: options.baseUrl });
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
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
    });
  }

  submitManifest(payload: unknown): Promise<ConcordanceResult<ManifestIngestResponse>> {
    return this.request<ManifestIngestResponse>({
      method: 'POST',
      path: '/manifests',
      body: payload,
      authenticated: true,
      timeoutMs: this.config.timeoutMsBlocking,
    });
  }

  getEntity(urn: string): Promise<ConcordanceResult<unknown>> {
    const encoded = encodeURIComponent(urn);
    return this.request<unknown>({
      method: 'GET',
      path: `/entities/${encoded}`,
      authenticated: true,
      timeoutMs: this.config.timeoutMsBlocking,
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
    let init: RequestInit;
    if (opts.body !== undefined) {
      headers.set('content-type', 'application/json');
      init = { method: opts.method, headers, body: JSON.stringify(opts.body) };
    } else {
      init = { method: opts.method, headers };
    }

    const timeoutMs = opts.timeoutMs ?? this.config.timeoutMsAdvisory;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    init.signal = controller.signal;

    const started = Date.now();
    let response: Response;
    try {
      response = await this.fetchImpl(url, init);
    } catch (err) {
      clearTimeout(timer);
      const e = new ConcordanceError(`Concordance request failed: ${(err as Error).message}`);
      e.diagnostics = emptyDiagnostics();
      e.diagnostics.durationMs = Date.now() - started;
      throw e;
    }
    clearTimeout(timer);

    const durationMs = Date.now() - started;
    const diagnostics = captureDiagnostics(response.headers, response.status, durationMs);

    if (!response.ok) {
      // Capture body text BEFORE error mapping so 422 detail.errors[] is available.
      const errorText = await response.text();
      throw await this.mapErrorResponse(response.status, errorText, diagnostics);
    }

    const data = await parseBody(response);
    return { data, diagnostics, warnings: [] };
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
