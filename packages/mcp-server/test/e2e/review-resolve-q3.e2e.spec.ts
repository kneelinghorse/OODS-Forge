/**
 * Q3 — Real-data E2E gate for the C3-reframed review.resolve tool (sprint-103 m01).
 *
 * Per quality bar (cmos/foundational-docs/quality-bars.md), every new
 * Capability-track surface must run end-to-end against:
 *   1. the three internal sprint-97 Object Catalog fixtures (user / product /
 *      subscription) covering informational / action-shaped / relationships
 *      variants,
 *   2. at least one independently-sourced multi-entity fixture
 *      (billing-multi-entity), AND
 *   3. for review.resolve specifically: the synthetic low-confidence fixture
 *      (subscription-low-confidence.json) — the only LOW-tier surface in the
 *      fixture set, where the threshold policy MUST match.
 *
 * Each tool output is AJV-validated against `review.resolve.output.json` (the
 * registered MCP output schema) so the wire contract is exercised on every
 * fixture. Behavior assertions cover:
 *   - threshold policy matches the low-confidence subscription
 *   - threshold policy does NOT match high-confidence product
 *   - no-confidence-decomposition entities (user / subscription) fall to defaultAction
 *   - multi-entity manifest produces one resolution per entity, each independently evaluated
 *   - the policyId='default' path is exercised (entities not matched by any policy)
 *   - matchedPolicyIds aggregates only IDs of policies that matched ≥1 entity
 */

import { describe, expect, it, beforeAll } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - subpath import for draft-2020-12 support (matches lib/ajv.ts pattern)
import Ajv2020Import from 'ajv/dist/2020.js';
import addFormatsImport from 'ajv-formats';
import type { ValidateFunction } from 'ajv';

import userFixture from '../../src/object-catalog/fixtures/user.json' with { type: 'json' };
import productFixture from '../../src/object-catalog/fixtures/product.json' with { type: 'json' };
import subscriptionFixture from '../../src/object-catalog/fixtures/subscription.json' with { type: 'json' };
import billingFixture from '../fixtures/object-catalog/billing-multi-entity.json' with { type: 'json' };
import lowConfFixture from '../fixtures/object-catalog/subscription-low-confidence.json' with { type: 'json' };

import { handle } from '../../src/tools/review.resolve.js';
import type { PolicyBundle } from '../../src/codegen/review-policy.js';

const Ajv2020: any = (Ajv2020Import as any).default ?? Ajv2020Import;
const addFormats: any = (addFormatsImport as any).default ?? addFormatsImport;

const URN_SUB_LOW = 'urn:proto:semantic:subscription-summary-row-lowconf@1.0.0';
const URN_PRODUCT = 'urn:proto:semantic:product-detail-card@1.0.0';

type GateFixture = readonly [name: string, manifest: Record<string, unknown>, expectedEntityCount: number];

const fixtures: ReadonlyArray<GateFixture> = [
  ['user (internal — informational, no confidence_decomposition)', userFixture as Record<string, unknown>, 1],
  ['product (internal — action-shaped, high confidence)', productFixture as Record<string, unknown>, 1],
  ['subscription (internal — relationships.edges, no confidence)', subscriptionFixture as Record<string, unknown>, 1],
  ['billing (external — multi-entity)', billingFixture as Record<string, unknown>, 3],
  ['subscription-low-confidence (synthetic — LOW tier)', lowConfFixture as Record<string, unknown>, 1],
];

let validateOutput: ValidateFunction;

beforeAll(() => {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputSchemaPath = path.resolve(
    __dirname,
    '../../src/schemas/review.resolve.output.json',
  );
  const outputSchema = JSON.parse(fs.readFileSync(outputSchemaPath, 'utf8'));
  validateOutput = ajv.compile(outputSchema);
});

const POLICY_BUNDLE: PolicyBundle = {
  id: 'q3-test-bundle',
  policies: [
    {
      id: 'defer-below-0_7',
      when: { kind: 'confidence_threshold', threshold: 0.7 },
      then: 'defer',
      reason: 'below 0.7 — needs review',
    },
    {
      id: 'dismiss-weak-evidence',
      when: { kind: 'signal_type_floor', signal: 'evidence_chain', floor: 0.4 },
      then: 'dismiss',
      reason: 'evidence_chain below 0.4 — likely spurious',
    },
  ],
};

describe('Q3 — review.resolve real-data E2E gate', () => {
  describe.each(fixtures)('%s', (_name, manifest, expectedEntityCount) => {
    it('emits a result that validates against review.resolve.output.json', async () => {
      const out = await handle({
        manifest,
        policies: POLICY_BUNDLE,
        defaultAction: 'accept',
      });
      const ok = validateOutput(out);
      if (!ok) {
        // eslint-disable-next-line no-console
        console.error(JSON.stringify(validateOutput.errors, null, 2));
      }
      expect(ok).toBe(true);
    });

    it('produces one resolution per manifest entity', async () => {
      const out = await handle({
        manifest,
        policies: POLICY_BUNDLE,
        defaultAction: 'accept',
      });
      expect(out.resolutions).toHaveLength(expectedEntityCount);
      expect(out.auditTrail.entityCount).toBe(expectedEntityCount);
    });

    it('audit trail evaluatedAt is a parseable ISO timestamp', async () => {
      const out = await handle({
        manifest,
        policies: POLICY_BUNDLE,
        defaultAction: 'accept',
      });
      expect(Number.isNaN(Date.parse(out.auditTrail.evaluatedAt))).toBe(false);
    });

    it('audit trail echoes the policy bundle verbatim for reproducibility', async () => {
      const out = await handle({
        manifest,
        policies: POLICY_BUNDLE,
        defaultAction: 'accept',
      });
      expect(out.auditTrail.policyBundle).toEqual(POLICY_BUNDLE);
    });
  });
});

describe('Q3 — review.resolve behavior assertions across the fixture set', () => {
  it('LOW-conf subscription matches the confidence_threshold policy (defer)', async () => {
    const out = await handle({
      manifest: lowConfFixture as Record<string, unknown>,
      policies: POLICY_BUNDLE,
      defaultAction: 'accept',
    });
    const r = out.resolutions.find((x) => x.urn === URN_SUB_LOW);
    expect(r).toBeDefined();
    expect(r!.decision).toBe('defer');
    expect(r!.policyId).toBe('defer-below-0_7');
    expect(r!.evaluatedTier).toBe('low');
    expect(out.auditTrail.matchedPolicyIds).toContain('defer-below-0_7');
  });

  it('HIGH-conf product falls to defaultAction (no policy matches)', async () => {
    const out = await handle({
      manifest: productFixture as Record<string, unknown>,
      policies: POLICY_BUNDLE,
      defaultAction: 'accept',
    });
    const r = out.resolutions.find((x) => x.urn === URN_PRODUCT);
    expect(r).toBeDefined();
    expect(r!.decision).toBe('accept');
    expect(r!.policyId).toBe('default');
    expect(r!.evaluatedTier).toBe('high');
    // Neither policy matched on this fixture.
    expect(out.auditTrail.matchedPolicyIds).toEqual([]);
  });

  it('Entities lacking confidence_decomposition fall to defaultAction (no threshold match)', async () => {
    const out = await handle({
      manifest: userFixture as Record<string, unknown>,
      policies: POLICY_BUNDLE,
      defaultAction: 'accept',
    });
    expect(out.resolutions[0].evaluatedScore).toBeNull();
    expect(out.resolutions[0].evaluatedTier).toBe('unknown');
    expect(out.resolutions[0].policyId).toBe('default');
    expect(out.resolutions[0].decision).toBe('accept');
  });

  it('Multi-entity billing manifest produces independent per-entity resolutions', async () => {
    const out = await handle({
      manifest: billingFixture as Record<string, unknown>,
      policies: POLICY_BUNDLE,
      defaultAction: 'accept',
    });
    // 3 distinct URNs, 3 distinct resolutions.
    const urns = out.resolutions.map((r) => r.urn);
    expect(new Set(urns).size).toBe(3);
  });

  it('signal_type_floor policy is exercised when the named signal is present below floor (synthetic fixture; threshold also matches but precedes)', async () => {
    // The low-conf fixture has evidence_chain=0.41 (above the 0.4 floor) so the
    // signal_type_floor policy does NOT match — proving floor strictness. We
    // mutate the bundle order to put the signal policy first AND raise the
    // floor so it DOES match, exercising the signal predicate end-to-end.
    const bundle: PolicyBundle = {
      policies: [
        {
          id: 'signal-first',
          when: { kind: 'signal_type_floor', signal: 'evidence_chain', floor: 0.5 },
          then: 'dismiss',
          reason: 'evidence_chain below 0.5',
        },
        POLICY_BUNDLE.policies[0],
      ],
    };
    const out = await handle({
      manifest: lowConfFixture as Record<string, unknown>,
      policies: bundle,
      defaultAction: 'accept',
    });
    expect(out.resolutions[0].policyId).toBe('signal-first');
    expect(out.resolutions[0].decision).toBe('dismiss');
  });
});
