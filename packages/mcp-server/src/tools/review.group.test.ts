/**
 * review (grouped) parity tests.
 *
 * Verifies the action-parameter consolidation is a zero-functionality-loss
 * overlay on the per-action review family (resolve, chain):
 *
 *   1. PARITY (valid): a payload valid under the OLD per-action input schema is
 *      valid under the grouped schema once `action` is added.
 *   2. DEFAULTS: AJV useDefaults injects identical defaults under both the old
 *      per-action schema and the grouped schema (validators mutate in place).
 *   3. NEGATIVE: payloads invalid under the old schema (extra key / missing
 *      required / wrong-branch field / unknown action) are invalid under the
 *      grouped schema.
 *   4. OUTPUT PARITY: a result valid under an old per-action OUTPUT schema is
 *      valid under the grouped (anyOf) output schema.
 *   5. DISPATCH: the grouped handle routes each action to the right per-action
 *      handler (resolve exercised for real via inline manifest; chain asserted
 *      structurally + against the live fixture; unknown action throws).
 *
 * Schemas are loaded with fs.readFileSync to avoid JSON import-assertion
 * friction. Each schema is cloned and its $id stripped before compile() so the
 * shared getAjv() singleton never sees a duplicate-$id registration.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { getAjv } from '../lib/ajv.js';
import { handle as groupedHandle } from './review.js';
import { handle as resolveHandle } from './review.resolve.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCHEMAS_DIR = path.join(HERE, '../schemas');

function loadSchema(name: string): any {
  const raw = fs.readFileSync(path.join(SCHEMAS_DIR, name), 'utf8');
  return JSON.parse(raw);
}

/**
 * Compile a schema without registering its $id, so repeated compiles across the
 * shared AJV singleton never collide. (We never need the $id — these schemas
 * self-resolve via internal #/$defs refs only.)
 */
function compile(schema: any) {
  const ajv = getAjv();
  const clone = JSON.parse(JSON.stringify(schema));
  delete clone.$id;
  return ajv.compile(clone);
}

const groupedInput = loadSchema('review.input.json');
const groupedOutput = loadSchema('review.output.json');
const resolveInput = loadSchema('review.resolve.input.json');
const chainInput = loadSchema('review.chain.input.json');
const resolveOutput = loadSchema('review.resolve.output.json');
const chainOutput = loadSchema('review.chain.output.json');

const validateGroupedIn = compile(groupedInput);
const validateGroupedOut = compile(groupedOutput);
const validateResolveIn = compile(resolveInput);
const validateChainIn = compile(chainInput);
const validateResolveOut = compile(resolveOutput);
const validateChainOut = compile(chainOutput);

const POLICY_BUNDLE = {
  id: 'test-bundle',
  policies: [
    {
      id: 'defer-low-confidence',
      when: { kind: 'confidence_threshold', threshold: 0.7 },
      then: 'defer',
      reason: 'below 0.7 — needs review',
    },
  ],
};

// A minimal inline manifest with one low-confidence entity (mirrors the
// subscription-low-confidence fixture shape used by review.resolve tests).
const INLINE_MANIFEST = {
  manifest_version: '4.0',
  schema_version: '1.1.0',
  source: { agent: 'test', captured_at: '2026-06-09T00:00:00.000Z' },
  entities: [
    {
      urn: 'urn:proto:semantic:row-lowconf@1.0.0',
      element: { type: 'ui.surface.row', name: 'row' },
      semantics: { purpose: 'x', human_meaning: 'y' },
      oods: { confidence_decomposition: { total: 0.4, signals: [] } },
    },
  ],
};

describe('review (grouped) — input parity per action', () => {
  describe('action: resolve', () => {
    it('a valid resolve payload (inline manifest) validates under both old and grouped', () => {
      const perAction = { manifest: INLINE_MANIFEST, policies: POLICY_BUNDLE };
      const grouped = { action: 'resolve', ...perAction };
      expect(validateResolveIn(JSON.parse(JSON.stringify(perAction)))).toBe(true);
      expect(validateGroupedIn(JSON.parse(JSON.stringify(grouped)))).toBe(true);
    });

    it('a valid resolve payload (manifestPath variant) validates under both', () => {
      const perAction = {
        manifestPath: 'fixtures/manifest.json',
        projectRoot: '/tmp/whatever',
        policies: POLICY_BUNDLE,
      };
      const grouped = { action: 'resolve', ...perAction };
      expect(validateResolveIn(JSON.parse(JSON.stringify(perAction)))).toBe(true);
      expect(validateGroupedIn(JSON.parse(JSON.stringify(grouped)))).toBe(true);
    });

    it('AJV useDefaults behaves identically under both schemas (branch-local defaults preserved)', () => {
      // The only `default` in this family (matchUnknown=false) sits inside the
      // `predicate` oneOf. AJV (by design) does NOT apply defaults nested inside
      // oneOf branches, so it stays undefined here — the parity claim is that
      // the OLD per-action schema and the grouped schema produce the BYTE-FOR-BYTE
      // SAME post-validation object. The deepEqual below is the load-bearing check.
      const base = () => ({
        manifest: INLINE_MANIFEST,
        policies: {
          policies: [
            { id: 'p', when: { kind: 'confidence_threshold', threshold: 0.5 }, then: 'defer' },
          ],
        },
      });
      const perAction = base();
      const grouped = { action: 'resolve', ...base() };
      expect(validateResolveIn(perAction)).toBe(true);
      expect(validateGroupedIn(grouped)).toBe(true);
      // Strip the discriminator to compare bodies after default injection.
      const { action: _a, ...groupedBody } = grouped as any;
      expect(groupedBody).toEqual(perAction);
      // Identical handling of the oneOf-nested default under both schemas.
      expect((perAction.policies.policies[0].when as any).matchUnknown).toBe(
        (groupedBody.policies.policies[0].when as any).matchUnknown,
      );
    });

    it('rejects an extra/unknown key (additionalProperties:false) under grouped', () => {
      const bad = { action: 'resolve', manifest: INLINE_MANIFEST, policies: POLICY_BUNDLE, bogus: 1 };
      expect(validateResolveIn({ manifest: INLINE_MANIFEST, policies: POLICY_BUNDLE, bogus: 1 } as any)).toBe(false);
      expect(validateGroupedIn(bad)).toBe(false);
    });

    it('rejects missing required `policies` under grouped', () => {
      const bad = { action: 'resolve', manifest: INLINE_MANIFEST };
      expect(validateResolveIn({ manifest: INLINE_MANIFEST } as any)).toBe(false);
      expect(validateGroupedIn(bad)).toBe(false);
    });

    it('rejects the oneOf(manifest|manifestPath) violation (neither provided) under grouped', () => {
      const bad = { action: 'resolve', policies: POLICY_BUNDLE };
      expect(validateResolveIn({ policies: POLICY_BUNDLE } as any)).toBe(false);
      expect(validateGroupedIn(bad)).toBe(false);
    });

    it('rejects the oneOf violation (BOTH manifest and manifestPath) under grouped', () => {
      const both = { manifest: INLINE_MANIFEST, manifestPath: 'x.json', policies: POLICY_BUNDLE };
      expect(validateResolveIn({ ...both } as any)).toBe(false);
      expect(validateGroupedIn({ action: 'resolve', ...both })).toBe(false);
    });
  });

  describe('action: chain', () => {
    it('a valid chain payload validates under both old and grouped', () => {
      const perAction = { fixture: 'subscription-low-confidence', policies: POLICY_BUNDLE };
      const grouped = { action: 'chain', ...perAction };
      expect(validateChainIn(JSON.parse(JSON.stringify(perAction)))).toBe(true);
      expect(validateGroupedIn(JSON.parse(JSON.stringify(grouped)))).toBe(true);
    });

    it('a valid chain payload with options validates under both', () => {
      const perAction = {
        fixture: 'article',
        policies: POLICY_BUNDLE,
        options: { reviewThreshold: 0.6, lowestSignalsN: 5, evidenceGapThreshold: 0.4, defaultAction: 'accept' },
      };
      const grouped = { action: 'chain', ...perAction };
      expect(validateChainIn(JSON.parse(JSON.stringify(perAction)))).toBe(true);
      expect(validateGroupedIn(JSON.parse(JSON.stringify(grouped)))).toBe(true);
    });

    it('AJV useDefaults behaves identically under both schemas (byte-for-byte body parity)', () => {
      const base = () => ({
        fixture: 'article',
        policies: {
          policies: [
            { id: 'p', when: { kind: 'confidence_threshold', threshold: 0.5 }, then: 'defer' },
          ],
        },
      });
      const perAction = base();
      const grouped = { action: 'chain', ...base() };
      expect(validateChainIn(perAction)).toBe(true);
      expect(validateGroupedIn(grouped)).toBe(true);
      const { action: _a, ...groupedBody } = grouped as any;
      expect(groupedBody).toEqual(perAction);
    });

    it('rejects an extra key (options.additionalProperties:false) under grouped', () => {
      const badOpts = { fixture: 'article', policies: POLICY_BUNDLE, options: { bogus: 1 } };
      expect(validateChainIn({ ...badOpts } as any)).toBe(false);
      expect(validateGroupedIn({ action: 'chain', ...badOpts })).toBe(false);
    });

    it('rejects missing required `fixture` under grouped', () => {
      const bad = { policies: POLICY_BUNDLE };
      expect(validateChainIn({ ...bad } as any)).toBe(false);
      expect(validateGroupedIn({ action: 'chain', ...bad })).toBe(false);
    });

    it('rejects a resolve-only field (manifest) on a chain action under grouped', () => {
      // manifest is not a chain property; chain branch is additionalProperties:false.
      const bad = { action: 'chain', fixture: 'article', policies: POLICY_BUNDLE, manifest: INLINE_MANIFEST };
      expect(validateGroupedIn(bad)).toBe(false);
    });
  });

  describe('discriminator guards', () => {
    it('rejects a missing action', () => {
      expect(validateGroupedIn({ fixture: 'article', policies: POLICY_BUNDLE } as any)).toBe(false);
    });

    it('rejects an unknown action not in the enum', () => {
      expect(
        validateGroupedIn({ action: 'destroy', fixture: 'article', policies: POLICY_BUNDLE } as any),
      ).toBe(false);
    });
  });
});

describe('review (grouped) — output parity per action', () => {
  it('a valid resolve output validates under both old and grouped (anyOf)', () => {
    const out = {
      resolutions: [
        {
          urn: 'urn:x@1',
          decision: 'defer',
          reason: 'r',
          policyId: 'p',
          evaluatedScore: 0.4,
          evaluatedTier: 'low',
        },
      ],
      auditTrail: {
        evaluatedAt: '2026-06-09T00:00:00.000Z',
        defaultAction: 'defer',
        entityCount: 1,
        policyBundle: POLICY_BUNDLE,
        matchedPolicyIds: ['p'],
      },
      warnings: [],
      diagnostics: { source: 'inline', manifestPath: null },
    };
    expect(validateResolveOut(JSON.parse(JSON.stringify(out)))).toBe(true);
    expect(validateGroupedOut(JSON.parse(JSON.stringify(out)))).toBe(true);
  });

  it('a valid chain output validates under both old and grouped (anyOf)', () => {
    const out = {
      queue: { entries: [], summary: { flaggedCount: 0 } },
      resolutions: [{ urn: 'urn:x@1', decision: 'defer', reason: 'r', policyId: 'p' }],
      auditTrail: { evaluatedAt: '2026-06-09T00:00:00.000Z' },
      conflictDetails: [{ urn: 'urn:x@1', detail: {} }],
      summary: { entries: [] },
      diagnostics: {
        fixture: 'article',
        fixtureSource: 'allow-list',
        entityCount: 1,
        flaggedCount: 0,
      },
    };
    expect(validateChainOut(JSON.parse(JSON.stringify(out)))).toBe(true);
    expect(validateGroupedOut(JSON.parse(JSON.stringify(out)))).toBe(true);
  });
});

describe('review (grouped) — dispatch routing', () => {
  it('routes action:resolve to review.resolve.handle and returns the same payload', async () => {
    const direct = await resolveHandle({ manifest: INLINE_MANIFEST, policies: POLICY_BUNDLE } as any);
    const viaGroup = await groupedHandle({ action: 'resolve', manifest: INLINE_MANIFEST, policies: POLICY_BUNDLE });
    // evaluatedAt is a wall-clock timestamp; compare everything else.
    expect(viaGroup.resolutions).toEqual(direct.resolutions);
    expect(viaGroup.warnings).toEqual(direct.warnings);
    expect(viaGroup.diagnostics).toEqual(direct.diagnostics);
    expect(viaGroup.auditTrail.defaultAction).toEqual(direct.auditTrail.defaultAction);
    expect(viaGroup.auditTrail.entityCount).toEqual(direct.auditTrail.entityCount);
    expect(viaGroup.auditTrail.matchedPolicyIds).toEqual(direct.auditTrail.matchedPolicyIds);
    // And the grouped result satisfies the grouped output schema.
    expect(validateGroupedOut(JSON.parse(JSON.stringify(viaGroup)))).toBe(true);
  });

  it('routes action:chain to review.chain.handle (live server-resident fixture)', async () => {
    const out = await groupedHandle({ action: 'chain', fixture: 'subscription-low-confidence', policies: POLICY_BUNDLE });
    expect(out.diagnostics.fixture).toBe('subscription-low-confidence');
    expect(out.diagnostics.fixtureSource).toBe('allow-list');
    expect(Array.isArray(out.resolutions)).toBe(true);
    expect(out).toHaveProperty('queue');
    expect(out).toHaveProperty('summary');
    expect(validateGroupedOut(JSON.parse(JSON.stringify(out)))).toBe(true);
  });

  it('throws on an unknown action (defensive default branch)', async () => {
    await expect(groupedHandle({ action: 'destroy' } as any)).rejects.toThrow(/Unknown action: destroy/);
  });
});
