/**
 * Unit tests for the bounded exp-backoff retry helper (sprint-99 I3/m02).
 *
 * Pure functions only — no fetch, no client. End-to-end retry behavior is
 * exercised against the client in client.test.ts.
 */

import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_RETRY_POLICY,
  computeBackoffDelay,
  computeRetryDelay,
  defaultClock,
  exceedsBudget,
  isRetryableStatus,
  parseRetryAfterMs,
  type RetryPolicy,
} from './retry.js';

describe('isRetryableStatus', () => {
  it('returns true for 429', () => {
    expect(isRetryableStatus(429)).toBe(true);
  });

  it('returns true for all 5xx codes', () => {
    for (const status of [500, 501, 502, 503, 504, 505, 599]) {
      expect(isRetryableStatus(status)).toBe(true);
    }
  });

  it('returns false for non-retryable 4xx codes (caller errors)', () => {
    for (const status of [400, 401, 403, 404, 405, 408, 410, 415, 418, 422, 428]) {
      expect(isRetryableStatus(status)).toBe(false);
    }
  });

  it('returns false for 2xx and 3xx codes', () => {
    for (const status of [200, 201, 204, 301, 302, 304]) {
      expect(isRetryableStatus(status)).toBe(false);
    }
  });

  it('returns false for 600+ (out-of-spec) codes', () => {
    expect(isRetryableStatus(600)).toBe(false);
    expect(isRetryableStatus(999)).toBe(false);
  });
});

describe('parseRetryAfterMs', () => {
  it('parses delta-seconds form (integer string) into ms', () => {
    expect(parseRetryAfterMs('0')).toBe(0);
    expect(parseRetryAfterMs('1')).toBe(1000);
    expect(parseRetryAfterMs('120')).toBe(120000);
    expect(parseRetryAfterMs('  5  ')).toBe(5000);
  });

  it('parses HTTP-date form relative to nowMs', () => {
    const now = Date.parse('2026-05-17T00:00:00Z');
    expect(parseRetryAfterMs('Sun, 17 May 2026 00:00:05 GMT', now)).toBe(5000);
    expect(parseRetryAfterMs('Sun, 17 May 2026 00:02:00 GMT', now)).toBe(120000);
  });

  it('clamps past HTTP-dates to 0', () => {
    const now = Date.parse('2026-05-17T00:00:00Z');
    expect(parseRetryAfterMs('Sat, 16 May 2026 23:59:00 GMT', now)).toBe(0);
  });

  it('returns null for absent / empty / malformed inputs', () => {
    expect(parseRetryAfterMs(null)).toBeNull();
    expect(parseRetryAfterMs(undefined)).toBeNull();
    expect(parseRetryAfterMs('')).toBeNull();
    expect(parseRetryAfterMs('   ')).toBeNull();
    expect(parseRetryAfterMs('not-a-date')).toBeNull();
    expect(parseRetryAfterMs('12.5')).toBeNull(); // not integer-only
  });
});

describe('computeBackoffDelay', () => {
  const policy: RetryPolicy = {
    maxRetries: 3,
    baseDelayMs: 500,
    maxDelayPerRetryMs: 4000,
    totalWaitCapMs: 8000,
  };

  it('returns 0 for invalid attempt < 1', () => {
    expect(computeBackoffDelay(0, policy, () => 1)).toBe(0);
    expect(computeBackoffDelay(-1, policy, () => 1)).toBe(0);
  });

  it('uses full-jitter exp-backoff: max possible = baseDelay * 2^(attempt-1)', () => {
    // rng=1 puts the delay at the ceiling (Math.floor of (1 * capped) = capped).
    expect(computeBackoffDelay(1, policy, () => 0.999999)).toBe(499);
    expect(computeBackoffDelay(2, policy, () => 0.999999)).toBe(999);
    expect(computeBackoffDelay(3, policy, () => 0.999999)).toBe(1999);
  });

  it('clamps per-retry delay to maxDelayPerRetryMs', () => {
    // attempt 5 would be 500 * 2^4 = 8000, exceeds cap=4000 → uses cap.
    expect(computeBackoffDelay(5, policy, () => 0.999999)).toBe(3999);
    // attempt 10 would be 500 * 512 = 256000, still capped to 4000.
    expect(computeBackoffDelay(10, policy, () => 0.999999)).toBe(3999);
  });

  it('returns 0 when rng returns 0 (full-jitter floor)', () => {
    expect(computeBackoffDelay(1, policy, () => 0)).toBe(0);
    expect(computeBackoffDelay(3, policy, () => 0)).toBe(0);
  });
});

describe('computeRetryDelay', () => {
  const policy = DEFAULT_RETRY_POLICY;

  it('honors Retry-After header (delta-seconds) and reports retryAfterUsed=true', () => {
    const r = computeRetryDelay(1, '2', policy, defaultClock, () => 0.5);
    expect(r.delayMs).toBe(2000);
    expect(r.retryAfterUsed).toBe(true);
  });

  it('honors Retry-After HTTP-date relative to clock.now()', () => {
    const nowMs = Date.parse('2026-05-17T00:00:00Z');
    const clock = { now: () => nowMs, sleep: vi.fn().mockResolvedValue(undefined) };
    const r = computeRetryDelay(
      1,
      'Sun, 17 May 2026 00:00:03 GMT',
      policy,
      clock,
      () => 0.5,
    );
    expect(r.delayMs).toBe(3000);
    expect(r.retryAfterUsed).toBe(true);
  });

  it('falls back to exp-backoff when Retry-After is absent', () => {
    const r = computeRetryDelay(1, null, policy, defaultClock, () => 0.999999);
    expect(r.delayMs).toBe(499); // 500 * 1 - 1 (floor)
    expect(r.retryAfterUsed).toBe(false);
  });

  it('falls back to exp-backoff when Retry-After is malformed', () => {
    const r = computeRetryDelay(2, 'not-a-date', policy, defaultClock, () => 0.999999);
    expect(r.delayMs).toBe(999); // 500 * 2 - 1
    expect(r.retryAfterUsed).toBe(false);
  });
});

describe('exceedsBudget', () => {
  it('returns true when delay + elapsed > budget', () => {
    expect(exceedsBudget(2000, 4000, 0, 5000, 8000)).toBe(true);
    expect(exceedsBudget(1, 4999, 0, 5000, 8000)).toBe(false);
    expect(exceedsBudget(2, 4999, 0, 5000, 8000)).toBe(true);
  });

  it('returns true when cumulative sleep + delay > totalWaitCap', () => {
    expect(exceedsBudget(1000, 0, 7500, 60000, 8000)).toBe(true);
    expect(exceedsBudget(500, 0, 7500, 60000, 8000)).toBe(false);
  });

  it('returns false when both constraints satisfied', () => {
    expect(exceedsBudget(500, 1000, 0, 5000, 8000)).toBe(false);
  });
});
