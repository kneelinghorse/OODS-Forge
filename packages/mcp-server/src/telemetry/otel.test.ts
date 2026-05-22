import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SpanStatusCode } from '@opentelemetry/api';
import {
  installOtelTestProvider,
  type InstalledOtelTestProvider,
} from '../../test/helpers/otel-test-provider.js';
import {
  getTracer,
  initTelemetry,
  isTelemetryActive,
  recordAjvFailure,
  recordSpanError,
  resetTelemetryForTesting,
  shutdownTelemetry,
  startToolSpan,
  _envVarNames,
} from './otel.js';

describe('telemetry/otel', () => {
  describe('no-op posture when env var unset', () => {
    let savedEndpoint: string | undefined;

    beforeEach(() => {
      savedEndpoint = process.env[_envVarNames.endpoint];
      delete process.env[_envVarNames.endpoint];
      resetTelemetryForTesting();
    });

    afterEach(async () => {
      await shutdownTelemetry();
      if (savedEndpoint === undefined) {
        delete process.env[_envVarNames.endpoint];
      } else {
        process.env[_envVarNames.endpoint] = savedEndpoint;
      }
    });

    it('initTelemetry returns enabled=false when OODS_OTLP_ENDPOINT is unset', async () => {
      const result = await initTelemetry();
      expect(result.enabled).toBe(false);
      expect(result.endpoint).toBeNull();
      expect(isTelemetryActive()).toBe(false);
    });

    it('initTelemetry returns enabled=false when OODS_OTLP_ENDPOINT is empty string', async () => {
      const result = await initTelemetry({ env: { OODS_OTLP_ENDPOINT: '' } });
      expect(result.enabled).toBe(false);
    });

    it('startToolSpan + getTracer still work (no-op tracer) without active telemetry', () => {
      const span = startToolSpan({ toolName: 'design.compose', requestId: 'req-1' });
      // Verify the API contract holds — span object exists and supports .end()
      expect(span).toBeDefined();
      expect(typeof span.end).toBe('function');
      expect(() => {
        span.setAttribute('oods.test', 'ok');
        span.end();
      }).not.toThrow();
    });

    it('getTracer returns a no-op tracer (calls do not throw, do not export spans)', () => {
      const tracer = getTracer();
      const span = tracer.startSpan('test.span');
      span.setAttribute('foo', 'bar');
      span.end();
      // No assertion on exported spans — no provider is registered, so nothing is exported.
      // The point is that the no-op API surface does not throw.
      expect(true).toBe(true);
    });
  });

  describe('span emission with InMemorySpanExporter', () => {
    let testProvider: InstalledOtelTestProvider;

    beforeEach(() => {
      testProvider = installOtelTestProvider();
    });

    afterEach(async () => {
      await testProvider.uninstall();
    });

    it('startToolSpan creates a span with rpc.* + oods.* attributes', () => {
      const span = startToolSpan({
        toolName: 'design.compose',
        role: 'designer',
        requestId: 'req-42',
      });
      span.end();

      const spans = testProvider.getFinishedSpans();
      expect(spans).toHaveLength(1);
      const exported = spans[0];

      // Span name follows convention
      expect(exported.name).toBe('forge.tool.design.compose');

      // RPC semconv attributes
      expect(exported.attributes['rpc.system']).toBe('oods-forge');
      expect(exported.attributes['rpc.service']).toBe('mcp-server');
      expect(exported.attributes['rpc.method']).toBe('design.compose');

      // Custom oods.* attributes
      expect(exported.attributes['oods.role']).toBe('designer');
      expect(exported.attributes['oods.request_id']).toBe('req-42');
    });

    it('startToolSpan omits role/requestId attrs when not provided', () => {
      const span = startToolSpan({ toolName: 'health' });
      span.end();

      const exported = testProvider.getFinishedSpans()[0];
      expect(exported.attributes['oods.role']).toBeUndefined();
      expect(exported.attributes['oods.request_id']).toBeUndefined();
    });

    it('emits the 5 named span kinds (compose, validate, render, codegen, map.apply)', () => {
      const targets = [
        { tool: 'design.compose', expectedName: 'forge.tool.design.compose' },
        { tool: 'repl.validate', expectedName: 'forge.tool.repl.validate' },
        { tool: 'repl.render', expectedName: 'forge.tool.repl.render' },
        { tool: 'code.generate', expectedName: 'forge.tool.code.generate' },
        { tool: 'map.apply', expectedName: 'forge.tool.map.apply' },
      ];

      for (const t of targets) {
        const span = startToolSpan({ toolName: t.tool });
        span.end();
      }

      const exported = testProvider.getFinishedSpans();
      expect(exported.map((s) => s.name)).toEqual(targets.map((t) => t.expectedName));
    });

    it('recordSpanError marks the span ERROR and records the exception', () => {
      const span = startToolSpan({ toolName: 'map.apply' });
      const error = new Error('boom');
      recordSpanError(span, error, 'SOME_CODE');
      span.end();

      const exported = testProvider.getFinishedSpans()[0];
      expect(exported.status.code).toBe(SpanStatusCode.ERROR);
      expect(exported.status.message).toBe('boom');
      expect(exported.attributes['oods.error_code']).toBe('SOME_CODE');
      expect(exported.events.some((e) => e.name === 'exception')).toBe(true);
    });

    it('recordSpanError handles non-Error throws (string)', () => {
      const span = startToolSpan({ toolName: 'health' });
      recordSpanError(span, 'plain string failure');
      span.end();

      const exported = testProvider.getFinishedSpans()[0];
      expect(exported.status.code).toBe(SpanStatusCode.ERROR);
      expect(exported.status.message).toBe('plain string failure');
      // No exception event for non-Error throws — only setStatus
      expect(exported.events.some((e) => e.name === 'exception')).toBe(false);
    });

    it('recordAjvFailure encodes layer + error count + status', () => {
      const span = startToolSpan({ toolName: 'repl.validate' });
      recordAjvFailure(span, 'input', 3);
      span.end();

      const exported = testProvider.getFinishedSpans()[0];
      expect(exported.attributes['oods.ajv_failed']).toBe(true);
      expect(exported.attributes['oods.ajv_layer']).toBe('input');
      expect(exported.attributes['oods.ajv_error_count']).toBe(3);
      expect(exported.status.code).toBe(SpanStatusCode.ERROR);
    });

    it('recordAjvFailure distinguishes input vs output layer', () => {
      const span1 = startToolSpan({ toolName: 'repl.validate' });
      recordAjvFailure(span1, 'input', 1);
      span1.end();

      const span2 = startToolSpan({ toolName: 'design.compose' });
      recordAjvFailure(span2, 'output', 2);
      span2.end();

      const exported = testProvider.getFinishedSpans();
      expect(exported[0].attributes['oods.ajv_layer']).toBe('input');
      expect(exported[1].attributes['oods.ajv_layer']).toBe('output');
    });

    it('span kind is SERVER', () => {
      const span = startToolSpan({ toolName: 'health' });
      span.end();

      // SpanKind.SERVER === 1 in OTel JS
      expect(testProvider.getFinishedSpans()[0].kind).toBe(1);
    });
  });

  describe('initTelemetry idempotency + endpoint handling', () => {
    let savedEndpoint: string | undefined;
    let savedOtelServiceName: string | undefined;

    beforeEach(() => {
      savedEndpoint = process.env[_envVarNames.endpoint];
      savedOtelServiceName = process.env.OTEL_SERVICE_NAME;
      resetTelemetryForTesting();
    });

    afterEach(async () => {
      await shutdownTelemetry();
      resetTelemetryForTesting();
      if (savedEndpoint === undefined) {
        delete process.env[_envVarNames.endpoint];
      } else {
        process.env[_envVarNames.endpoint] = savedEndpoint;
      }
      if (savedOtelServiceName === undefined) {
        delete process.env.OTEL_SERVICE_NAME;
      } else {
        process.env.OTEL_SERVICE_NAME = savedOtelServiceName;
      }
    });

    it('calling initTelemetry twice returns the same state (idempotent)', async () => {
      const first = await initTelemetry({ env: {} });
      const second = await initTelemetry({ env: { OODS_OTLP_ENDPOINT: 'http://example/v1/traces' } });
      // Second call is a no-op because already initialized
      expect(second.enabled).toBe(first.enabled);
      expect(second.endpoint).toBe(first.endpoint);
    });

    it('sets OTEL_SERVICE_NAME to default when unset and endpoint provided', async () => {
      delete process.env.OTEL_SERVICE_NAME;
      await initTelemetry({
        env: { OODS_OTLP_ENDPOINT: 'http://localhost:4318/v1/traces' },
      });
      expect(process.env.OTEL_SERVICE_NAME).toBe('oods-forge-mcp-server');
    });

    it('does not override existing OTEL_SERVICE_NAME', async () => {
      process.env.OTEL_SERVICE_NAME = 'user-set-name';
      await initTelemetry({
        env: { OODS_OTLP_ENDPOINT: 'http://localhost:4318/v1/traces' },
      });
      expect(process.env.OTEL_SERVICE_NAME).toBe('user-set-name');
    });

    it('honors OODS_OTLP_SERVICE_NAME override when OTEL_SERVICE_NAME unset', async () => {
      delete process.env.OTEL_SERVICE_NAME;
      await initTelemetry({
        env: {
          OODS_OTLP_ENDPOINT: 'http://localhost:4318/v1/traces',
          OODS_OTLP_SERVICE_NAME: 'custom-forge-name',
        },
      });
      expect(process.env.OTEL_SERVICE_NAME).toBe('custom-forge-name');
    });
  });
});
