/**
 * Bounded exponential-backoff retry surface for ConcordanceClient (sprint-99 I3).
 *
 * Spec: cmos/foundational-docs/technical/concordance-integration.md
 *       (sprint-97 m03 explicitly deferred retry to "F2/I3")
 *
 * Scope (v0.2, sprint-99 m03):
 *   - Applied to the three hot-path endpoints that exercise Railway under
 *     burst load: validateManifestRemote() (m02), submitManifest() (m03), and
 *     getEntity() (m03). The G3 multi-fixture round-trip is the usage signal
 *     that promoted submit + getEntity from "future rollout" (m02 v0.1) to
 *     "covered now" (m03). The unauthenticated probes (health, version, docs,
 *     redoc, openapi) remain single-shot — they're cheap, infrequent, and not
 *     on any user-facing hot path.
 *   - Retries on HTTP 429 (rate-limited) and 5xx (server error) responses.
 *   - 4xx other than 429 surface immediately (treated as caller error).
 *   - Network failures (pre-response) surface immediately. The mission scope
 *     is "absorb backend rate-limit + transient 5xx," not "mask connectivity
 *     loss."
 *
 * Policy defaults:
 *   - maxRetries        : 3   (so up to 4 total attempts)
 *   - baseDelayMs       : 500
 *   - maxDelayPerRetryMs: 4000
 *   - totalWaitCapMs    : 8000 (cap on cumulative sleep across all retries)
 *
 * Retry-After header (RFC 7231 §7.1.3) is honored when present on a 429/503
 * response and OVERRIDES the computed backoff for that attempt. Both
 * delta-seconds (e.g. "120") and HTTP-date forms are parsed.
 *
 * Budget guard:
 *   The retry chain is bounded by the caller's overall blocking timeout
 *   (CONCORDANCE_TIMEOUT_MS_BLOCKING). Before each sleep, the helper checks
 *   that the planned delay fits within (budgetMs - elapsedSinceStart); if it
 *   does not, the retry chain aborts and the original error is surfaced. This
 *   prevents retry math from extending past the user-visible deadline.
 *
 * Test injection:
 *   computeBackoffDelay() takes an optional rng for deterministic tests.
 *   defaultClock can be replaced via the public RetryClock interface.
 */

export interface RetryPolicy {
  /** Maximum number of retry attempts after the initial call. 3 means up to 4 total HTTP attempts. */
  maxRetries: number;
  /** Base delay (ms) for attempt 1; doubled per retry up to maxDelayPerRetryMs. */
  baseDelayMs: number;
  /** Per-retry delay ceiling (ms) before jitter is applied. */
  maxDelayPerRetryMs: number;
  /** Cumulative sleep cap (ms) across all retries; once exceeded, retry chain aborts. */
  totalWaitCapMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayPerRetryMs: 4000,
  totalWaitCapMs: 8000,
};

export interface RetryClock {
  now(): number;
  sleep(ms: number): Promise<void>;
}

export const defaultClock: RetryClock = {
  now: () => Date.now(),
  sleep: (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    }),
};

export interface RetryLogEvent {
  /** Attempt number being retried, 1-indexed. (attempt 1 = first retry, after initial call.) */
  attempt: number;
  /** Delay (ms) the helper just slept before the retry. */
  delayMs: number;
  /** HTTP status from the previous attempt that triggered this retry. */
  status: number;
  /** x-request-id from the previous attempt, if present. */
  requestId: string | null;
  /** Whether the delay came from a Retry-After header (true) or exp-backoff (false). */
  retryAfterUsed: boolean;
}

export type RetryLogger = (event: RetryLogEvent) => void;

/**
 * Default logger writes to console.info at the same verbosity as the existing
 * I1 smoke diagnostic prints. Production deployments can swap this for a
 * structured-logger sink without touching the retry orchestration.
 */
export const defaultRetryLogger: RetryLogger = (event) => {
  // eslint-disable-next-line no-console
  console.info(
    `[concordance retry] attempt=${event.attempt} delay_ms=${event.delayMs} status=${event.status} request_id=${event.requestId ?? 'unknown'} retry_after=${event.retryAfterUsed}`,
  );
};

/**
 * Whether a status code is eligible for retry under the policy. Per the
 * mission scope: 429 is the load-bearing path (rate-limit absorption), 5xx is
 * the resilience path (transient backend hiccups). All other 4xx are caller
 * errors and MUST surface immediately.
 */
export function isRetryableStatus(status: number): boolean {
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  return false;
}

/**
 * Full-jitter exponential backoff (Brooker-style):
 *   delay = random(0, min(base * 2^(attempt-1), maxDelayPerRetryMs))
 *
 * Full jitter (vs equal-jitter or decorrelated) is the simplest choice and is
 * fine here because the cap + budget guard keep worst-case wait bounded.
 *
 * attempt is 1-indexed (attempt 1 = first retry after the initial call).
 */
export function computeBackoffDelay(
  attempt: number,
  policy: RetryPolicy,
  rng: () => number = Math.random,
): number {
  if (attempt < 1) return 0;
  const expDelay = policy.baseDelayMs * Math.pow(2, attempt - 1);
  const capped = Math.min(expDelay, policy.maxDelayPerRetryMs);
  // Math.floor(random * capped) keeps the delay an integer; the floor is fine
  // because capped is already small (<= maxDelayPerRetryMs) so we don't
  // introduce a meaningful skew.
  return Math.floor(rng() * capped);
}

/**
 * Parse a Retry-After header value into milliseconds. Returns null if absent or
 * unparseable. Honors both forms specified by RFC 7231 §7.1.3:
 *   - delta-seconds : an integer count of seconds (e.g. "120")
 *   - HTTP-date     : an IMF-fixdate (e.g. "Wed, 21 Oct 2015 07:28:00 GMT")
 *
 * For the HTTP-date form, the returned ms is relative to `now`. Negative or
 * past dates clamp to 0 (retry immediately).
 *
 * nowMs is injectable so tests can pin the comparison point without freezing
 * the system clock.
 */
export function parseRetryAfterMs(
  headerValue: string | null | undefined,
  nowMs: number = Date.now(),
): number | null {
  if (typeof headerValue !== 'string') return null;
  const trimmed = headerValue.trim();
  if (trimmed.length === 0) return null;

  // delta-seconds form: integer-only string
  if (/^\d+$/.test(trimmed)) {
    return Number.parseInt(trimmed, 10) * 1000;
  }

  // HTTP-date form: best-effort Date.parse, but only if the value contains at
  // least one alpha character (weekday/month name). Date.parse is lenient enough
  // to coerce dotted-decimal numerics like "12.5" into a date, which we don't
  // want — those should fall through to null.
  if (!/[A-Za-z]/.test(trimmed)) return null;

  const dateMs = Date.parse(trimmed);
  if (Number.isFinite(dateMs)) {
    return Math.max(0, dateMs - nowMs);
  }
  return null;
}

/**
 * Compute the next retry delay. Retry-After (when present and parseable) wins;
 * otherwise full-jitter exp-backoff. The returned object records which source
 * the delay came from so the logger and tests can distinguish.
 */
export function computeRetryDelay(
  attempt: number,
  retryAfterHeader: string | null | undefined,
  policy: RetryPolicy,
  clock: RetryClock,
  rng: () => number = Math.random,
): { delayMs: number; retryAfterUsed: boolean } {
  const fromHeader = parseRetryAfterMs(retryAfterHeader, clock.now());
  if (fromHeader !== null) {
    return { delayMs: fromHeader, retryAfterUsed: true };
  }
  return {
    delayMs: computeBackoffDelay(attempt, policy, rng),
    retryAfterUsed: false,
  };
}

/**
 * Budget guard: would sleeping for `delayMs` exceed the caller's overall
 * blocking budget? Returns true when the retry MUST be aborted (delay would
 * push the elapsed past budgetMs).
 *
 * Defensive on edge case: also returns true when the cumulative sleep across
 * retries would exceed totalWaitCapMs (the policy-level cap; usually less
 * restrictive than the budget but applies independently).
 */
export function exceedsBudget(
  delayMs: number,
  elapsedMs: number,
  cumulativeSleepMs: number,
  budgetMs: number,
  totalWaitCapMs: number,
): boolean {
  if (elapsedMs + delayMs > budgetMs) return true;
  if (cumulativeSleepMs + delayMs > totalWaitCapMs) return true;
  return false;
}
