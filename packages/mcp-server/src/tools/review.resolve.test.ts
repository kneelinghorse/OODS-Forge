/**
 * review.resolve handler unit tests (sprint-103 m01).
 *
 * Covers:
 *   - Inline manifest + policy bundle → resolutions[] + auditTrail
 *   - manifestPath source path with project-relative + projectRoot
 *   - Path safety: absolute / parent-traversal / missing / corrupt JSON
 *   - Input contract: empty / missing policies / missing manifest source / bad defaultAction
 *   - Malformed-policy rejection: duplicate ids, urn+pattern overspecification
 *   - matchedPolicyIds aggregates only matched policy IDs (sorted, deduped)
 *   - Skipped entities without a urn appear in warnings, NOT resolutions
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import lowConfFixture from '../../test/fixtures/object-catalog/subscription-low-confidence.json' with { type: 'json' };
import userFixture from '../object-catalog/fixtures/user.json' with { type: 'json' };

import { handle, type ReviewResolveInput } from './review.resolve.js';
import { isToolError } from '../errors/tool-error.js';
import type { PolicyBundle } from '../codegen/review-policy.js';

const lowConfManifest = lowConfFixture as Record<string, unknown>;
const userManifest = userFixture as Record<string, unknown>;

const URN_SUB_LOW = 'urn:proto:semantic:subscription-summary-row-lowconf@1.0.0';

const POLICY_DEFER_LOWCONF: PolicyBundle = {
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

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'review-resolve-'));
});

afterEach(() => {
  if (tmpRoot && fs.existsSync(tmpRoot)) {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

describe('review.resolve — inline manifest happy path', () => {
  it('resolves the low-confidence subscription entity via the confidence_threshold policy', async () => {
    const out = await handle({
      manifest: lowConfManifest,
      policies: POLICY_DEFER_LOWCONF,
    });
    expect(out.resolutions).toHaveLength(1);
    const r = out.resolutions[0];
    expect(r.urn).toBe(URN_SUB_LOW);
    expect(r.decision).toBe('defer');
    expect(r.policyId).toBe('defer-low-confidence');
    expect(r.evaluatedScore).toBe(0.4);
    expect(r.evaluatedTier).toBe('low');
    expect(r.reason).toBe('below 0.7 — needs review');
  });

  it('falls through to defaultAction when no policy matches', async () => {
    // user fixture has high confidence, threshold policy won't match.
    const out = await handle({
      manifest: userManifest,
      policies: POLICY_DEFER_LOWCONF,
      defaultAction: 'accept',
    });
    expect(out.resolutions).toHaveLength(1);
    expect(out.resolutions[0].decision).toBe('accept');
    expect(out.resolutions[0].policyId).toBe('default');
  });

  it('produces an audit trail with evaluatedAt, defaultAction, entityCount, and matchedPolicyIds', async () => {
    const out = await handle({
      manifest: lowConfManifest,
      policies: POLICY_DEFER_LOWCONF,
    });
    expect(out.auditTrail.entityCount).toBe(1);
    expect(out.auditTrail.defaultAction).toBe('defer');
    expect(out.auditTrail.matchedPolicyIds).toEqual(['defer-low-confidence']);
    expect(typeof out.auditTrail.evaluatedAt).toBe('string');
    expect(Number.isNaN(Date.parse(out.auditTrail.evaluatedAt))).toBe(false);
    // Bundle is echoed verbatim for reproducibility.
    expect(out.auditTrail.policyBundle).toEqual(POLICY_DEFER_LOWCONF);
  });

  it("default defaultAction is 'defer' (no-match items surface for follow-up)", async () => {
    const out = await handle({
      manifest: userManifest,
      policies: POLICY_DEFER_LOWCONF,
    });
    expect(out.auditTrail.defaultAction).toBe('defer');
    expect(out.resolutions[0].decision).toBe('defer');
  });

  it('diagnostics.source=inline when manifest is provided directly', async () => {
    const out = await handle({
      manifest: lowConfManifest,
      policies: POLICY_DEFER_LOWCONF,
    });
    expect(out.diagnostics.source).toBe('inline');
    expect(out.diagnostics.manifestPath).toBeNull();
  });
});

describe('review.resolve — matchedPolicyIds aggregation', () => {
  it('only includes IDs of policies that actually matched', async () => {
    const bundle: PolicyBundle = {
      policies: [
        {
          id: 'unreachable',
          when: { kind: 'entity_urn_match', urn: 'urn:does-not-exist@0' },
          then: 'dismiss',
        },
        {
          id: 'will-match',
          when: { kind: 'confidence_threshold', threshold: 0.7 },
          then: 'defer',
        },
      ],
    };
    const out = await handle({ manifest: lowConfManifest, policies: bundle });
    expect(out.auditTrail.matchedPolicyIds).toEqual(['will-match']);
  });
});

describe('review.resolve — file-path source', () => {
  function writeFixture(name: string, payload: unknown): string {
    const filename = path.join(tmpRoot, name);
    fs.writeFileSync(filename, JSON.stringify(payload, null, 2), 'utf8');
    return name;
  }

  it('loads and resolves a manifest from a project-relative path', async () => {
    const relName = writeFixture('lowconf.json', lowConfManifest);
    const out = await handle({
      manifestPath: relName,
      projectRoot: tmpRoot,
      policies: POLICY_DEFER_LOWCONF,
    });
    expect(out.resolutions).toHaveLength(1);
    expect(out.diagnostics.source).toBe('file');
    expect(out.diagnostics.manifestPath).toBe('lowconf.json');
  });

  it('rejects absolute manifestPath (OODS-RR-002)', async () => {
    const abs = path.join(tmpRoot, 'whatever.json');
    fs.writeFileSync(abs, '{}', 'utf8');
    try {
      await handle({
        manifestPath: abs,
        projectRoot: tmpRoot,
        policies: POLICY_DEFER_LOWCONF,
      });
      expect.fail('should have rejected absolute path');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-002');
    }
  });

  it('rejects parent-traversal in manifestPath (OODS-RR-003)', async () => {
    try {
      await handle({
        manifestPath: '../etc/passwd',
        projectRoot: tmpRoot,
        policies: POLICY_DEFER_LOWCONF,
      });
      expect.fail('should have rejected parent traversal');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-003');
    }
  });

  it('rejects a manifestPath that does not exist on disk (OODS-RR-005)', async () => {
    try {
      await handle({
        manifestPath: 'missing.json',
        projectRoot: tmpRoot,
        policies: POLICY_DEFER_LOWCONF,
      });
      expect.fail('should have rejected missing file');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-005');
    }
  });

  it('rejects malformed JSON in manifestPath (OODS-RR-007)', async () => {
    fs.writeFileSync(path.join(tmpRoot, 'corrupt.json'), '{not json', 'utf8');
    try {
      await handle({
        manifestPath: 'corrupt.json',
        projectRoot: tmpRoot,
        policies: POLICY_DEFER_LOWCONF,
      });
      expect.fail('should have rejected malformed JSON');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-007');
    }
  });
});

describe('review.resolve — input contract guards', () => {
  it('rejects empty input (OODS-RR-010 or OODS-RR-011)', async () => {
    try {
      await handle({} as ReviewResolveInput);
      expect.fail('should have rejected empty input');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      // OODS-RR-011 because policies is missing first.
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-011');
    }
  });

  it('rejects missing policies (OODS-RR-011)', async () => {
    try {
      await handle({
        manifest: lowConfManifest,
      } as unknown as ReviewResolveInput);
      expect.fail('should have rejected missing policies');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-011');
    }
  });

  it('rejects policies whose policies field is not an array (OODS-RR-012)', async () => {
    try {
      await handle({
        manifest: lowConfManifest,
        policies: { policies: 'not-an-array' as unknown as never[] } as PolicyBundle,
      });
      expect.fail('should have rejected non-array policies');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-012');
    }
  });

  it('rejects bad defaultAction (OODS-RR-013)', async () => {
    try {
      await handle({
        manifest: lowConfManifest,
        policies: POLICY_DEFER_LOWCONF,
        defaultAction: 'lol' as never,
      });
      expect.fail('should have rejected bad defaultAction');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-013');
    }
  });

  it('rejects malformed policy bundle: duplicate IDs (OODS-RR-014)', async () => {
    try {
      await handle({
        manifest: lowConfManifest,
        policies: {
          policies: [
            { id: 'dup', when: { kind: 'confidence_threshold', threshold: 0.5 }, then: 'defer' },
            { id: 'dup', when: { kind: 'confidence_threshold', threshold: 0.3 }, then: 'dismiss' },
          ],
        },
      });
      expect.fail('should have rejected duplicate IDs');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-014');
      expect((err as { details: { errors: string[] } }).details.errors[0]).toMatch(/duplicate policy id 'dup'/);
    }
  });

  it('rejects malformed policy bundle: entity_urn_match with neither urn nor pattern (OODS-RR-014)', async () => {
    try {
      await handle({
        manifest: lowConfManifest,
        policies: {
          policies: [
            { id: 'bad', when: { kind: 'entity_urn_match' } as never, then: 'defer' },
          ],
        },
      });
      expect.fail('should have rejected under-specified URN predicate');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-014');
    }
  });

  it("rejects neither manifest nor manifestPath provided (OODS-RR-016)", async () => {
    try {
      await handle({ policies: POLICY_DEFER_LOWCONF } as unknown as ReviewResolveInput);
      expect.fail('should have rejected missing manifest source');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-016');
    }
  });

  it('rejects non-object manifest (OODS-RR-015)', async () => {
    try {
      await handle({
        manifest: 'not-an-object' as unknown as Record<string, unknown>,
        policies: POLICY_DEFER_LOWCONF,
      });
      expect.fail('should have rejected non-object manifest');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-015');
    }
  });
});

describe('review.resolve — entities without urn surface as warnings, not resolutions', () => {
  it('skips entries lacking a urn and notes them in warnings', async () => {
    const malformedManifest = {
      manifest_version: '4.0',
      schema_version: '1.1.0',
      source: { agent: 'test', captured_at: '2026-05-21T00:00:00.000Z' },
      entities: [
        {
          urn: 'urn:proto:semantic:good@1.0.0',
          element: { type: 'ui.surface.row', name: 'good' },
          semantics: { purpose: 'x', human_meaning: 'y' },
          oods: { confidence_decomposition: { total: 0.4, signals: [] } },
        },
        // Missing urn — should be skipped + appear in warnings.
        {
          element: { type: 'ui.surface.row', name: 'bad' },
          semantics: { purpose: 'x', human_meaning: 'y' },
        },
      ],
    };
    const out = await handle({
      manifest: malformedManifest,
      policies: POLICY_DEFER_LOWCONF,
    });
    expect(out.resolutions).toHaveLength(1);
    expect(out.warnings).toHaveLength(1);
    expect(out.warnings[0]).toMatch(/missing a urn/);
  });
});
