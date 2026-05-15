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
