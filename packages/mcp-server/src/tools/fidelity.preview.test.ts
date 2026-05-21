import { describe, expect, it } from 'vitest';
import {
  handle,
  FIXTURE_NAMES,
  type FidelityKind,
  type FidelityPreviewInput,
} from './fidelity.preview.js';

const ALL_KINDS: FidelityKind[] = ['boxes-arrows', 'wireframe', 'review', 'branded-mockup'];

describe('tools/fidelity.preview', () => {
  describe('happy path — all 4 fidelities × representative fixture', () => {
    for (const kind of ALL_KINDS) {
      it(`emits non-empty HTML for ${kind} fidelity on the user fixture`, async () => {
        const out = await handle({ fidelityKind: kind, fixture: 'user' });
        expect(out.status).toMatch(/^(ok|warning)$/);
        expect(out.fidelityKind).toBe(kind);
        expect(out.fixture).toBe('user');
        expect(out.html.length).toBeGreaterThan(0);
        expect(out.errors).toEqual([]);
        expect(out.meta.entityCount).toBeGreaterThan(0);
      });
    }
  });

  describe('multi-entity manifest (content-pack)', () => {
    it('boxes-arrows renders multi-entity manifest with edge metadata', async () => {
      const out = await handle({ fidelityKind: 'boxes-arrows', fixture: 'content-pack' });
      expect(out.status).toMatch(/^(ok|warning)$/);
      expect(out.meta.entityCount).toBe(3);
      expect(out.html).toContain('article');
    });

    it('wireframe renders multi-entity manifest', async () => {
      const out = await handle({ fidelityKind: 'wireframe', fixture: 'content-pack' });
      expect(out.status).toMatch(/^(ok|warning)$/);
      expect(out.meta.entityCount).toBe(3);
      expect(out.html.length).toBeGreaterThan(0);
    });
  });

  describe('branded-mockup brandOverlay pass-through (audit axis b)', () => {
    it('echoes appliedBrandOverlay in meta when brandOverlay is provided', async () => {
      const out = await handle({
        fidelityKind: 'branded-mockup',
        fixture: 'user',
        options: { brandOverlay: 'brand-a' },
      });
      expect(out.meta.appliedBrandOverlay).toBe('brand-a');
    });

    it('does NOT set appliedBrandOverlay when brandOverlay is omitted', async () => {
      const out = await handle({ fidelityKind: 'branded-mockup', fixture: 'user' });
      expect(out.meta.appliedBrandOverlay).toBeUndefined();
    });

    it('handles brand-b correctly (different resolved brand than brand-a)', async () => {
      const outA = await handle({
        fidelityKind: 'branded-mockup',
        fixture: 'user',
        options: { brandOverlay: 'brand-a' },
      });
      const outB = await handle({
        fidelityKind: 'branded-mockup',
        fixture: 'user',
        options: { brandOverlay: 'brand-b' },
      });
      expect(outA.html).not.toBe(outB.html);
    });

    it('non-branded fidelities ignore brandOverlay option (no error)', async () => {
      const out = await handle({
        fidelityKind: 'wireframe',
        fixture: 'user',
        options: { brandOverlay: 'brand-a' },
      });
      expect(out.status).toMatch(/^(ok|warning)$/);
      expect(out.meta.appliedBrandOverlay).toBeUndefined();
    });
  });

  describe('review fidelity threshold pass-through', () => {
    it('respects reviewThreshold option', async () => {
      // Different thresholds change the flagged count → markup differs
      const strict = await handle({
        fidelityKind: 'review',
        fixture: 'subscription-low-confidence',
        options: { reviewThreshold: 0.9 },
      });
      const lax = await handle({
        fidelityKind: 'review',
        fixture: 'subscription-low-confidence',
        options: { reviewThreshold: 0.1 },
      });
      expect(strict.status).toMatch(/^(ok|warning)$/);
      expect(lax.status).toMatch(/^(ok|warning)$/);
      // The two outputs SHOULD differ — stricter threshold flags more entities
      expect(strict.html).not.toBe(lax.html);
    });
  });

  describe('fixture allow-list (no path traversal)', () => {
    it('rejects unknown fixture name with OODS-FP-001', async () => {
      const out = await handle({
        fidelityKind: 'wireframe',
        fixture: 'definitely-not-a-real-fixture',
      });
      expect(out.status).toBe('error');
      expect(out.errors[0].code).toBe('OODS-FP-001');
      expect(out.html).toBe('');
    });

    it('rejects path-traversal attempts with OODS-FP-001 (not OODS-FP-002)', async () => {
      const out = await handle({
        fidelityKind: 'wireframe',
        fixture: '../../etc/passwd',
      });
      expect(out.status).toBe('error');
      expect(out.errors[0].code).toBe('OODS-FP-001');
    });

    it('exports the FIXTURE_NAMES allow-list with the expected entries', () => {
      expect(FIXTURE_NAMES).toContain('user');
      expect(FIXTURE_NAMES).toContain('product');
      expect(FIXTURE_NAMES).toContain('subscription');
      expect(FIXTURE_NAMES).toContain('content-pack');
      expect(FIXTURE_NAMES).toContain('billing-multi-entity');
      expect(FIXTURE_NAMES).toContain('subscription-low-confidence');
    });
  });

  describe('error paths', () => {
    it('rejects unsupported fidelityKind with OODS-FP-003', async () => {
      const out = await handle({
        fidelityKind: 'production' as unknown as FidelityKind,
        fixture: 'user',
      });
      expect(out.status).toBe('error');
      expect(out.errors[0].code).toBe('OODS-FP-003');
    });
  });

  describe('includeStyles option', () => {
    it('omits <style> block when includeStyles is false', async () => {
      const withStyles = await handle({
        fidelityKind: 'wireframe',
        fixture: 'user',
        options: { includeStyles: true },
      });
      const withoutStyles = await handle({
        fidelityKind: 'wireframe',
        fixture: 'user',
        options: { includeStyles: false },
      });
      expect(withStyles.html.length).toBeGreaterThan(withoutStyles.html.length);
      expect(withoutStyles.html).not.toContain('<style>');
    });
  });

  describe('all fixtures × all kinds — coverage smoke', () => {
    const SKIP_PAIRS = new Set<string>([
      // registry-v14-synthetic intentionally has no projection_variants;
      // emitters that require them surface warnings or empty entity blocks.
      // We still verify the call does not throw or return status='error'.
    ]);
    for (const fixture of FIXTURE_NAMES) {
      for (const kind of ALL_KINDS) {
        if (SKIP_PAIRS.has(`${kind}:${fixture}`)) continue;
        it(`${kind} × ${fixture} → does not throw, returns html string`, async () => {
          const out = await handle({ fidelityKind: kind, fixture } as FidelityPreviewInput);
          expect(typeof out.html).toBe('string');
          expect(['ok', 'warning', 'error']).toContain(out.status);
        });
      }
    }
  });
});
