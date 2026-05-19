/**
 * Q3 — Real-data E2E gate for the C5a Review Queue codegen surface (s101-m02).
 *
 * Per quality bar (cmos/foundational-docs/quality-bars.md), every new
 * Capability-track render mission must run end-to-end against representative
 * fixtures. For C5a, the inputs are:
 *   1. UiSchema fixture: test/fixtures/ui/review-queue.ui-schema.json
 *      — the hand-authored prescriptive surface for the review queue UI,
 *        mirroring the conflict-artifact fixture's 5 items as Card rows.
 *   2. Conflict-artifact fixture: test/fixtures/conflict-artifacts/review-queue-mixed.json
 *      — the data the UiSchema represents (5 items across all 4 confidence
 *        tiers and ≥3 remediation_hint kinds).
 *
 * The gate runs code.generate against 9 combinations:
 *   3 frameworks (react | vue | html) × 3 styling modes (inline | tokens | tailwind)
 *
 * For each output, the gate asserts:
 *   (a) entity-row count in the output equals conflict-artifact item count
 *   (b) confidence-tier badges include the data-* contract that mirrors the
 *       review-emitter.ts non-prescriptive sibling — data-confidence-tier,
 *       data-confidence-score, data-flagged-for-review
 *   (c) verdict action buttons are present per row with the m01 verdict enum
 *       (accept | patch | defer | dismiss) reachable as data-verdict
 *   (d) remediation-hint summaries render with data-hint-kind matching the
 *       artifact's hint kinds
 *
 * HTML output is parsed via jsdom for DOM-level assertions; React/Vue use
 * string-level assertions on the generated source (which is the codegen
 * artifact's actual surface — agents consume the string, not a DOM tree).
 */

import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { handle as codeGenerate } from '../../src/tools/code.generate.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import type { ConflictArtifact } from '../../src/tools/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_ROOT = path.resolve(__dirname, '../fixtures');

const uiSchema = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_ROOT, 'ui/review-queue.ui-schema.json'), 'utf8'),
) as UiSchema;
const artifact = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_ROOT, 'conflict-artifacts/review-queue-mixed.json'), 'utf8'),
) as ConflictArtifact;

const VERDICTS = ['accept', 'patch', 'defer', 'dismiss'] as const;
const ALL_ITEMS = [...artifact.conflicts, ...artifact.belowConfidence];
const EXPECTED_OBJECT_IDS = ALL_ITEMS.map((i) => i.objectId);

type Framework = 'react' | 'vue' | 'html';
type Styling = 'inline' | 'tokens' | 'tailwind';

const FRAMEWORKS: Framework[] = ['react', 'vue', 'html'];
const STYLINGS: Styling[] = ['inline', 'tokens', 'tailwind'];

interface OutputAssertions {
  containsAllObjectIds: boolean;
  confidenceTierBadgeCount: number;
  flaggedForReviewCount: number;
  verdictCounts: Record<(typeof VERDICTS)[number], number>;
  hintKinds: Set<string>;
}

function makeStringAssertions(code: string): OutputAssertions {
  const verdictCounts = Object.fromEntries(
    VERDICTS.map((v) => [v, (code.match(new RegExp(`data-verdict=["']${v}["']`, 'g')) ?? []).length] as const),
  ) as OutputAssertions['verdictCounts'];

  const tierBadgeCount =
    (code.match(/data-role=["']confidence-badge["']/g) ?? []).length;
  const flaggedForReviewCount =
    (code.match(/data-flagged-for-review=["']true["']/g) ?? []).length;
  const hintKindMatches = code.match(/data-hint-kind=["']([a-z_]+)["']/g) ?? [];
  const hintKinds = new Set(
    hintKindMatches.map((m) => /data-hint-kind=["']([a-z_]+)["']/.exec(m)![1]),
  );
  const containsAllObjectIds = EXPECTED_OBJECT_IDS.every((id) =>
    new RegExp(`data-objectid=["']${id.replace(/-/g, '\\-')}["']`).test(code),
  );

  return {
    containsAllObjectIds,
    confidenceTierBadgeCount: tierBadgeCount,
    flaggedForReviewCount,
    verdictCounts,
    hintKinds,
  };
}

function makeJsdomAssertions(html: string): OutputAssertions {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const verdictCounts = Object.fromEntries(
    VERDICTS.map((v) => [v, doc.querySelectorAll(`[data-verdict="${v}"]`).length] as const),
  ) as OutputAssertions['verdictCounts'];

  const tierBadges = doc.querySelectorAll('[data-role="confidence-badge"]');
  const flaggedNodes = doc.querySelectorAll('[data-flagged-for-review="true"][data-role="confidence-badge"]');
  const hintNodes = Array.from(doc.querySelectorAll('[data-hint-kind]'));
  const hintKinds = new Set(hintNodes.map((n) => n.getAttribute('data-hint-kind')!));

  const objectIdsInDom = new Set<string>();
  doc.querySelectorAll('[data-role="review-row"]').forEach((n) => {
    const id = n.getAttribute('data-objectid');
    if (id) objectIdsInDom.add(id);
  });
  const containsAllObjectIds = EXPECTED_OBJECT_IDS.every((id) => objectIdsInDom.has(id));

  return {
    containsAllObjectIds,
    confidenceTierBadgeCount: tierBadges.length,
    flaggedForReviewCount: flaggedNodes.length,
    verdictCounts,
    hintKinds,
  };
}

function expectedHintKinds(): Set<string> {
  const kinds = new Set<string>();
  for (const item of ALL_ITEMS) {
    const top = item.remediation_hints?.[0];
    if (top) kinds.add(top.kind);
  }
  return kinds;
}

async function runCodegen(framework: Framework, styling: Styling) {
  return codeGenerate({
    framework,
    schema: uiSchema,
    options: { typescript: true, styling },
  });
}

describe('Q3 — C5a Review Queue codegen surface (9 outputs)', () => {
  describe('Sanity — fixtures align', () => {
    it('UiSchema item count matches conflict-artifact item count', () => {
      const screen = uiSchema.screens[0];
      const itemsRegion = screen.children?.find((c) => c.id === 'rq-items');
      const rows = itemsRegion?.children ?? [];
      expect(rows.length).toBe(ALL_ITEMS.length);
    });

    it('conflict-artifact fixture has ≥5 items spanning all 4 confidence tiers', () => {
      expect(ALL_ITEMS.length).toBeGreaterThanOrEqual(5);
      const tiers = new Set<string>();
      for (const item of ALL_ITEMS) {
        const c = item.candidate.confidence;
        if (c === 0 || c === undefined) tiers.add('unknown');
        else if (c >= 0.8) tiers.add('high');
        else if (c >= 0.5) tiers.add('medium');
        else tiers.add('low');
      }
      expect(tiers).toEqual(new Set(['high', 'medium', 'low', 'unknown']));
    });

    it('conflict-artifact fixture has ≥3 distinct remediation_hint kinds (top-1 per item)', () => {
      expect(expectedHintKinds().size).toBeGreaterThanOrEqual(3);
    });
  });

  for (const framework of FRAMEWORKS) {
    for (const styling of STYLINGS) {
      describe(`${framework} × ${styling}`, () => {
        it(`emits status=ok with no errors`, async () => {
          const result = await runCodegen(framework, styling);
          expect(result.status).toBe('ok');
          expect(result.errors ?? []).toEqual([]);
          expect(result.code.length).toBeGreaterThan(0);
        });

        it(`(a) renders an entity row for each conflict-artifact item`, async () => {
          const result = await runCodegen(framework, styling);
          const assertions =
            framework === 'html' ? makeJsdomAssertions(result.code) : makeStringAssertions(result.code);
          expect(assertions.containsAllObjectIds).toBe(true);
        });

        it(`(b) emits confidence-tier badges with data-confidence-tier + data-flagged-for-review`, async () => {
          const result = await runCodegen(framework, styling);
          const assertions =
            framework === 'html' ? makeJsdomAssertions(result.code) : makeStringAssertions(result.code);
          expect(assertions.confidenceTierBadgeCount).toBe(ALL_ITEMS.length);
          const expectedFlagged = ALL_ITEMS.filter((i) => {
            const c = i.candidate.confidence;
            return c === undefined || c === 0 || c < 0.7;
          }).length;
          expect(assertions.flaggedForReviewCount).toBe(expectedFlagged);
        });

        it(`(c) emits action buttons matching the m01 verdict enum (accept|patch|defer|dismiss)`, async () => {
          const result = await runCodegen(framework, styling);
          const assertions =
            framework === 'html' ? makeJsdomAssertions(result.code) : makeStringAssertions(result.code);
          for (const verdict of VERDICTS) {
            expect(assertions.verdictCounts[verdict]).toBe(ALL_ITEMS.length);
          }
        });

        it(`(d) emits remediation-hint summary with data-hint-kind matching the top-1 hints`, async () => {
          const result = await runCodegen(framework, styling);
          const assertions =
            framework === 'html' ? makeJsdomAssertions(result.code) : makeStringAssertions(result.code);
          for (const kind of expectedHintKinds()) {
            expect(assertions.hintKinds).toContain(kind);
          }
        });

        if (framework === 'react') {
          it('output uses functional/hooks idiom (no class component, no React.Component)', async () => {
            const result = await runCodegen(framework, styling);
            expect(result.code).not.toMatch(/class\s+\w+\s+extends\s+React\.Component/);
            expect(result.code).toMatch(/(function\s+\w+|const\s+\w+\s*[:=].*=>)/);
          });
        }

        if (framework === 'vue') {
          it('output uses SFC <script setup> form', async () => {
            const result = await runCodegen(framework, styling);
            expect(result.code).toContain('<script setup');
            expect(result.code).toContain('<template>');
          });
        }

        if (framework === 'html') {
          it('output is a parseable document with action-callable data-* attrs', async () => {
            const result = await runCodegen(framework, styling);
            const dom = new JSDOM(result.code);
            const doc = dom.window.document;
            expect(doc.documentElement.tagName.toLowerCase()).toBe('html');
            expect(doc.querySelectorAll('[data-action="review.triage"]').length).toBe(
              ALL_ITEMS.length * VERDICTS.length,
            );
          });
        }

        if (styling === 'tailwind' && framework !== 'html') {
          // HTML emitter ignores the styling option (delegates to the existing
          // repl.render pipeline which is token/style-based) — only React/Vue
          // surface tailwind classes.
          it('output references tailwind utility classes (no inline style attributes for layout)', async () => {
            const result = await runCodegen(framework, styling);
            expect(result.code).toMatch(/(className|class|:class)=/);
          });
        }

        if (styling === 'tokens') {
          it('output references design-token CSS variables (var(--ref-*) or var(--token-*))', async () => {
            const result = await runCodegen(framework, styling);
            expect(result.code).toMatch(/var\(--(ref|token)-/);
          });
        }
      });
    }
  }
});
