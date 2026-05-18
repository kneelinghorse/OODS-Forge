/**
 * Unit tests for ConcordanceClient (sprint-97 F2/m03).
 *
 * Network-free. Uses an injected fetch stub to exercise error-mapping,
 * diagnostics capture, and auth-hygiene rules.
 *
 * Network-dependent gates (T2 local round-trip, T3 hosted probes) live in
 * integration.test.ts.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConcordanceClient } from './client.js';
import {
  ConcordanceAuthError,
  ConcordanceError,
  ConcordancePermissionError,
  ConcordanceValidationError,
} from './errors.js';

const BASE = 'https://concordance-test.local';
const REQ_ID = '11111111-2222-3333-4444-555555555555';

function stubResponse(
  body: string | object,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  const bodyText = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(bodyText, {
    status: init.status ?? 200,
    headers: {
      'content-type': 'application/json',
      'x-request-id': REQ_ID,
      'concordance-schema-version': '1.1.0',
      ...(init.headers ?? {}),
    },
  });
}

afterEach(() => {
  delete process.env.CONCORDANCE_API_KEY;
});

describe('ConcordanceClient — unauthenticated probes', () => {
  it('GET /health returns data + diagnostics with x-request-id and concordance-schema-version', async () => {
    const fetchStub = vi.fn().mockResolvedValue(
      stubResponse({ status: 'ok', version: '0.0.1', entities: 0, relationships: 0 }),
    );
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    const result = await client.health();
    expect(result.data.status).toBe('ok');
    expect(result.diagnostics.requestId).toBe(REQ_ID);
    expect(result.diagnostics.schemaVersion).toBe('1.1.0');
    expect(result.diagnostics.status).toBe(200);
    expect(fetchStub).toHaveBeenCalledOnce();
    const [calledUrl, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe(`${BASE}/health`);
    expect(new Headers(init.headers).get('authorization')).toBeNull();
  });

  it('GET /version parses body shape', async () => {
    const fetchStub = vi.fn().mockResolvedValue(
      stubResponse({
        service_version: '0.0.1',
        schema_version: '1.1.0',
        recipe_versions: { semantic_location: '1.0.0' },
        current_sprint_id: 'sprint-13',
        build_hash: null,
      }),
    );
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    const result = await client.version();
    expect(result.data.schema_version).toBe('1.1.0');
    expect(result.data.current_sprint_id).toBe('sprint-13');
  });

  it('GET /docs returns raw text body', async () => {
    const fetchStub = vi.fn().mockResolvedValue(
      new Response('<html>swagger</html>', {
        status: 200,
        headers: {
          'content-type': 'text/html',
          'x-request-id': REQ_ID,
          'concordance-schema-version': '1.1.0',
        },
      }),
    );
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    const result = await client.docs();
    expect(result.data).toContain('<html>');
    expect(result.diagnostics.status).toBe(200);
  });
});

describe('ConcordanceClient — auth hygiene', () => {
  it('throws ConcordanceAuthError(missing) before the network when key is absent', async () => {
    const fetchStub = vi.fn();
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    await expect(client.submitManifest({ x: 1 })).rejects.toBeInstanceOf(ConcordanceAuthError);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it('reads CONCORDANCE_API_KEY from process.env at request time (never caches)', async () => {
    let captured: string | null = null;
    const fetchStub = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
      captured = new Headers(init.headers).get('authorization');
      return stubResponse({ ingested_entities: 0 });
    });
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    process.env.CONCORDANCE_API_KEY = 'key-A';
    await client.submitManifest({ x: 1 });
    expect(captured).toBe('Bearer key-A');
    // Swap the env key and ensure the next call reads the new value.
    process.env.CONCORDANCE_API_KEY = 'key-B';
    await client.submitManifest({ x: 1 });
    expect(captured).toBe('Bearer key-B');
  });

  it('never includes the API key in error messages', async () => {
    const fetchStub = vi.fn().mockResolvedValue(
      stubResponse(
        { detail: { code: 'missing_authorization', message: 'Authorization header required' } },
        { status: 401 },
      ),
    );
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    process.env.CONCORDANCE_API_KEY = 'super-secret-key-must-not-appear-anywhere';
    try {
      await client.submitManifest({ x: 1 });
      throw new Error('expected ConcordanceAuthError');
    } catch (err) {
      expect(err).toBeInstanceOf(ConcordanceAuthError);
      expect((err as Error).message).not.toContain('super-secret-key-must-not-appear-anywhere');
    }
  });
});

describe('ConcordanceClient — HTTP error mapping', () => {
  it('401 missing_authorization → ConcordanceAuthError(missing)', async () => {
    const fetchStub = vi.fn().mockResolvedValue(
      stubResponse(
        { detail: { code: 'missing_authorization', message: 'Authorization header required' } },
        { status: 401 },
      ),
    );
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    process.env.CONCORDANCE_API_KEY = 'k';
    try {
      await client.submitManifest({ x: 1 });
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ConcordanceAuthError);
      expect((err as ConcordanceAuthError).reason).toBe('missing');
      expect((err as ConcordanceAuthError).diagnostics?.requestId).toBe(REQ_ID);
      expect((err as ConcordanceAuthError).diagnostics?.schemaVersion).toBe('1.1.0');
    }
  });

  it('401 invalid_authorization → ConcordanceAuthError(invalid)', async () => {
    const fetchStub = vi.fn().mockResolvedValue(
      stubResponse(
        { detail: { code: 'invalid_authorization', message: 'Bearer token not recognized' } },
        { status: 401 },
      ),
    );
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    process.env.CONCORDANCE_API_KEY = 'k';
    try {
      await client.submitManifest({ x: 1 });
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ConcordanceAuthError);
      expect((err as ConcordanceAuthError).reason).toBe('invalid');
    }
  });

  it('403 → ConcordancePermissionError', async () => {
    const fetchStub = vi.fn().mockResolvedValue(
      stubResponse({ detail: { code: 'forbidden', message: 'workspace mismatch' } }, { status: 403 }),
    );
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    process.env.CONCORDANCE_API_KEY = 'k';
    await expect(client.submitManifest({ x: 1 })).rejects.toBeInstanceOf(ConcordancePermissionError);
  });

  it('422 → ConcordanceValidationError preserving detail.errors[]', async () => {
    const validationBody = {
      detail: {
        errors: [
          {
            entity_urn: null,
            field_path: 'SemanticManifest.manifest_version',
            code: 'schema.parse',
            severity: 'error',
            message: 'Field required',
            details: { pydantic_type: 'missing' },
          },
          {
            entity_urn: null,
            field_path: 'SemanticManifest.entities',
            code: 'schema.parse',
            severity: 'error',
            message: 'Field required',
          },
        ],
        warnings: [],
        message: 'request body failed schema validation',
      },
    };
    const fetchStub = vi.fn().mockResolvedValue(stubResponse(validationBody, { status: 422 }));
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    process.env.CONCORDANCE_API_KEY = 'k';
    try {
      await client.validateManifestRemote({});
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ConcordanceValidationError);
      const ve = err as ConcordanceValidationError;
      expect(ve.detailErrors).toHaveLength(2);
      expect((ve.detailErrors[0] as { field_path: string }).field_path).toBe(
        'SemanticManifest.manifest_version',
      );
      expect(ve.diagnostics?.requestId).toBe(REQ_ID);
      expect(ve.diagnostics?.status).toBe(422);
    }
  });

  it('5xx → ConcordanceError carrying status diagnostic', async () => {
    const fetchStub = vi.fn().mockResolvedValue(
      stubResponse({ detail: 'internal error' }, { status: 500 }),
    );
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    try {
      await client.health();
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ConcordanceError);
      expect((err as ConcordanceError).diagnostics?.status).toBe(500);
    }
  });

  it('network failure → ConcordanceError without status', async () => {
    const fetchStub = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    try {
      await client.health();
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ConcordanceError);
      expect((err as ConcordanceError).diagnostics?.status).toBe(null);
    }
  });
});

describe('ConcordanceClient — getEntity URL encoding', () => {
  it('encodes the URN safely for the URL path', async () => {
    const fetchStub = vi.fn().mockResolvedValue(stubResponse({ urn: 'x' }));
    const client = new ConcordanceClient({ baseUrl: BASE, fetch: fetchStub });
    process.env.CONCORDANCE_API_KEY = 'k';
    await client.getEntity('urn:proto:semantic:user-profile-card@1.0.0');
    const calledUrl = (fetchStub.mock.calls[0] as [string])[0];
    expect(calledUrl).toBe(
      `${BASE}/entities/urn%3Aproto%3Asemantic%3Auser-profile-card%401.0.0`,
    );
  });
});

// ── Retry surface (sprint-99 I3/m02) ───────────────────────────────────────
// All retry tests inject a fake clock so sleep() is synchronous (no real
// timers); rng=0.5 makes exp-backoff delays deterministic; the spy-logger
// captures every retry event for direct assertion.

interface FakeClockOptions {
  startMs?: number;
  /** Set to true to NOT advance time on each now() call. Default: advance by 1ms per call. */
  freeze?: boolean;
}

function makeFakeClock(opts: FakeClockOptions = {}) {
  let current = opts.startMs ?? 0;
  const sleepCalls: number[] = [];
  return {
    clock: {
      now: () => (opts.freeze ? current : (current += 1)),
      sleep: async (ms: number) => {
        sleepCalls.push(ms);
        current += ms;
      },
    },
    sleepCalls,
    advance: (ms: number) => {
      current += ms;
    },
    setNow: (ms: number) => {
      current = ms;
    },
  };
}

function retryableErrorResponse(status: number, retryAfter?: string): Response {
  return new Response(JSON.stringify({ detail: `simulated ${status}` }), {
    status,
    headers: {
      'content-type': 'application/json',
      'x-request-id': REQ_ID,
      'concordance-schema-version': '1.1.0',
      ...(retryAfter ? { 'retry-after': retryAfter } : {}),
    },
  });
}

describe('ConcordanceClient — retry surface (429 path)', () => {
  it('429 → retry → 200: succeeds and exposes diagnostics from the successful call', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValueOnce(retryableErrorResponse(429))
      .mockResolvedValueOnce(stubResponse({ ingested_entities: 1 }));
    const { clock, sleepCalls } = makeFakeClock();
    const logger = vi.fn();

    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.5,
      retryLogger: logger,
    });
    process.env.CONCORDANCE_API_KEY = 'k';
    const result = await client.validateManifestRemote({ entities: [] });

    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(sleepCalls).toHaveLength(1);
    // attempt 1 retry: 500 * 2^0 * 0.5 = 250 (floored)
    expect(sleepCalls[0]).toBe(250);
    expect(result.diagnostics.status).toBe(200);
    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger.mock.calls[0][0]).toMatchObject({
      attempt: 1,
      status: 429,
      delayMs: 250,
      retryAfterUsed: false,
    });
  });

  it('429 → 429 → 429 → 429: surfaces final error after maxRetries (3) exhausted', async () => {
    // Build a fresh Response per call so .text() can be read on each one
    // (Response bodies are single-use).
    const fetchStub = vi.fn().mockImplementation(async () => retryableErrorResponse(429));
    const { clock, sleepCalls } = makeFakeClock();
    const logger = vi.fn();

    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.5,
      retryLogger: logger,
    });
    process.env.CONCORDANCE_API_KEY = 'k';

    await expect(client.validateManifestRemote({ entities: [] })).rejects.toMatchObject({
      diagnostics: { status: 429 },
    });
    // 1 initial + 3 retries = 4 fetch calls.
    expect(fetchStub).toHaveBeenCalledTimes(4);
    // 3 sleeps (between each retry).
    expect(sleepCalls).toHaveLength(3);
    expect(logger).toHaveBeenCalledTimes(3);
  });
});

describe('ConcordanceClient — retry surface (5xx path)', () => {
  it('503 → retry → 200: succeeds', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValueOnce(retryableErrorResponse(503))
      .mockResolvedValueOnce(stubResponse({ ingested_entities: 1 }));
    const { clock, sleepCalls } = makeFakeClock();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.5,
      retryLogger: vi.fn(),
    });
    process.env.CONCORDANCE_API_KEY = 'k';
    const result = await client.validateManifestRemote({ entities: [] });

    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(sleepCalls).toHaveLength(1);
    expect(result.diagnostics.status).toBe(200);
  });

  it('500 → 500 → 500 → 500: surfaces final error after maxRetries exhausted', async () => {
    const fetchStub = vi.fn().mockImplementation(async () => retryableErrorResponse(500));
    const { clock, sleepCalls } = makeFakeClock();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.5,
      retryLogger: vi.fn(),
    });
    process.env.CONCORDANCE_API_KEY = 'k';

    await expect(client.validateManifestRemote({ entities: [] })).rejects.toMatchObject({
      diagnostics: { status: 500 },
    });
    expect(fetchStub).toHaveBeenCalledTimes(4);
    expect(sleepCalls).toHaveLength(3);
  });
});

describe('ConcordanceClient — Retry-After header overrides exp-backoff', () => {
  it('429 with Retry-After: 2 → waits 2000ms on retry', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValueOnce(retryableErrorResponse(429, '2'))
      .mockResolvedValueOnce(stubResponse({ ingested_entities: 1 }));
    const { clock, sleepCalls } = makeFakeClock();
    const logger = vi.fn();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.999999, // would yield ~499ms backoff; header overrides
      retryLogger: logger,
    });
    process.env.CONCORDANCE_API_KEY = 'k';

    await client.validateManifestRemote({ entities: [] });

    expect(sleepCalls).toEqual([2000]);
    expect(logger.mock.calls[0][0]).toMatchObject({
      delayMs: 2000,
      retryAfterUsed: true,
    });
  });

  it('503 with Retry-After: 1 → waits 1000ms on retry', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValueOnce(retryableErrorResponse(503, '1'))
      .mockResolvedValueOnce(stubResponse({ ingested_entities: 1 }));
    const { clock, sleepCalls } = makeFakeClock();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.999999,
      retryLogger: vi.fn(),
    });
    process.env.CONCORDANCE_API_KEY = 'k';

    await client.validateManifestRemote({ entities: [] });
    expect(sleepCalls).toEqual([1000]);
  });
});

describe('ConcordanceClient — no retry on 4xx (non-429)', () => {
  // One assertion per non-retryable 4xx code per success-criteria spec.
  for (const status of [400, 401, 403, 404, 422]) {
    it(`${status} surfaces immediately without retry attempts`, async () => {
      const body =
        status === 401
          ? { detail: { code: 'invalid_authorization', message: 'unauthorized' } }
          : status === 422
            ? { detail: { errors: [], message: 'validation failed' } }
            : { detail: `simulated ${status}` };
      const fetchStub = vi.fn().mockResolvedValue(stubResponse(body, { status }));
      const { clock, sleepCalls } = makeFakeClock();
      const logger = vi.fn();
      const client = new ConcordanceClient({
        baseUrl: BASE,
        fetch: fetchStub,
        clock,
        rng: () => 0.5,
        retryLogger: logger,
      });
      process.env.CONCORDANCE_API_KEY = 'k';

      await expect(client.validateManifestRemote({ entities: [] })).rejects.toBeInstanceOf(
        ConcordanceError,
      );
      // No retries: exactly one fetch, no sleeps, no retry-logger events.
      expect(fetchStub).toHaveBeenCalledTimes(1);
      expect(sleepCalls).toHaveLength(0);
      expect(logger).not.toHaveBeenCalled();
    });
  }
});

describe('ConcordanceClient — budget guard', () => {
  it('aborts retry chain when remaining timeout budget is less than next backoff delay', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValueOnce(retryableErrorResponse(429))
      .mockResolvedValueOnce(stubResponse({ ingested_entities: 1 }));
    const { clock, sleepCalls } = makeFakeClock({ startMs: 0 });
    const logger = vi.fn();

    // budgetMs = timeoutMsBlocking. Set it low enough that the post-call
    // elapsedMs already exceeds it before any sleep would fit.
    process.env.CONCORDANCE_TIMEOUT_MS_BLOCKING = '50';
    process.env.CONCORDANCE_API_KEY = 'k';

    // Make every clock.now() call advance time aggressively so elapsedMs
    // surges past 50ms after the first failed attempt.
    const aggressiveClock = {
      now: vi.fn(() => {
        const base = 1000;
        // Each successive call returns a much larger value, simulating long fetch latency.
        aggressiveClock.advance += 60;
        return base + aggressiveClock.advance;
      }),
      advance: 0,
      sleep: clock.sleep,
    };

    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock: { now: aggressiveClock.now, sleep: aggressiveClock.sleep },
      rng: () => 0.999999, // would otherwise want a ~500ms delay
      retryLogger: logger,
    });

    await expect(client.validateManifestRemote({ entities: [] })).rejects.toMatchObject({
      diagnostics: { status: 429 },
    });
    // First call happened, no sleep occurred, no retry was performed.
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(sleepCalls).toHaveLength(0);
    expect(logger).not.toHaveBeenCalled();

    delete process.env.CONCORDANCE_TIMEOUT_MS_BLOCKING;
  });
});

describe('ConcordanceClient — retry logging', () => {
  it('emits per-attempt info with attempt, delayMs, status, requestId, retryAfterUsed', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValueOnce(retryableErrorResponse(429))
      .mockResolvedValueOnce(retryableErrorResponse(503))
      .mockResolvedValueOnce(stubResponse({ ingested_entities: 1 }));
    const { clock } = makeFakeClock();
    const logger = vi.fn();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.5,
      retryLogger: logger,
    });
    process.env.CONCORDANCE_API_KEY = 'k';
    await client.validateManifestRemote({ entities: [] });

    expect(logger).toHaveBeenCalledTimes(2);
    expect(logger.mock.calls[0][0]).toEqual({
      attempt: 1,
      delayMs: 250, // 500 * 2^0 * 0.5
      status: 429,
      requestId: REQ_ID,
      retryAfterUsed: false,
    });
    expect(logger.mock.calls[1][0]).toEqual({
      attempt: 2,
      delayMs: 500, // 500 * 2^1 * 0.5
      status: 503,
      requestId: REQ_ID,
      retryAfterUsed: false,
    });
  });
});

describe('ConcordanceClient — retry covers hot-path endpoints (sprint-99 m03)', () => {
  // m02 wired retry into validateManifestRemote only. m03 extended it to
  // submitManifest + getEntity because the G3 multi-fixture round-trip is
  // the first real usage signal for those endpoints under Railway burst load.
  // These tests pin the broader coverage so a future regression that drops a
  // `retry: this.retryPolicy` from either endpoint fails loudly.

  it('submitManifest retries on 503: 503 → 200 succeeds with one sleep + one logger event', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValueOnce(retryableErrorResponse(503))
      .mockResolvedValueOnce(stubResponse({ ingested_entities: 1 }));
    const { clock, sleepCalls } = makeFakeClock();
    const logger = vi.fn();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.5,
      retryLogger: logger,
    });
    process.env.CONCORDANCE_API_KEY = 'k';

    const result = await client.submitManifest({ entities: [] });
    expect(result.diagnostics.status).toBe(200);
    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(sleepCalls).toEqual([250]);
    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger.mock.calls[0][0]).toMatchObject({ attempt: 1, status: 503 });
  });

  it('getEntity retries on 429: 429 → 200 succeeds with one sleep + one logger event', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValueOnce(retryableErrorResponse(429))
      .mockResolvedValueOnce(stubResponse({ urn: 'urn:proto:semantic:x@1.0.0' }));
    const { clock, sleepCalls } = makeFakeClock();
    const logger = vi.fn();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.5,
      retryLogger: logger,
    });
    process.env.CONCORDANCE_API_KEY = 'k';

    const result = await client.getEntity('urn:proto:semantic:x@1.0.0');
    expect(result.diagnostics.status).toBe(200);
    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(sleepCalls).toEqual([250]);
    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger.mock.calls[0][0]).toMatchObject({ attempt: 1, status: 429 });
  });

  it('getEntity exhausts retries on persistent 503: 1 + 3 attempts, 3 sleeps', async () => {
    // Hot-path mock for G3: confirms a multi-entity GET sequence absorbs
    // transient backend hiccups up to the policy cap and then surfaces.
    const fetchStub = vi.fn().mockImplementation(async () => retryableErrorResponse(503));
    const { clock, sleepCalls } = makeFakeClock();
    const logger = vi.fn();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      rng: () => 0.5,
      retryLogger: logger,
    });
    process.env.CONCORDANCE_API_KEY = 'k';

    await expect(client.getEntity('urn:proto:semantic:x@1.0.0')).rejects.toMatchObject({
      diagnostics: { status: 503 },
    });
    expect(fetchStub).toHaveBeenCalledTimes(4);
    expect(sleepCalls).toHaveLength(3);
    expect(logger).toHaveBeenCalledTimes(3);
  });

  it('health() (unauthenticated probe) does NOT retry: out of hot-path scope', async () => {
    // Unauthenticated probes are cheap, infrequent, and not on any user
    // hot path. Keeping them single-shot avoids re-polling Railway during
    // probe failures and keeps the test posture tight.
    const fetchStub = vi.fn().mockResolvedValue(retryableErrorResponse(503));
    const { clock, sleepCalls } = makeFakeClock();
    const logger = vi.fn();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      retryLogger: logger,
    });

    await expect(client.health()).rejects.toBeInstanceOf(ConcordanceError);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(sleepCalls).toHaveLength(0);
    expect(logger).not.toHaveBeenCalled();
  });
});

describe('ConcordanceClient — success path is transparent', () => {
  it('validateManifestRemote 200 first try: 0 sleeps, 0 retry-log events', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValue(stubResponse({ valid: true, errors: [], warnings: [] }));
    const { clock, sleepCalls } = makeFakeClock();
    const logger = vi.fn();
    const client = new ConcordanceClient({
      baseUrl: BASE,
      fetch: fetchStub,
      clock,
      retryLogger: logger,
    });
    process.env.CONCORDANCE_API_KEY = 'k';
    const result = await client.validateManifestRemote({ entities: [] });

    expect(result.diagnostics.status).toBe(200);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(sleepCalls).toHaveLength(0);
    expect(logger).not.toHaveBeenCalled();
  });
});
