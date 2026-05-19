/**
 * Q3 — Real-data E2E gate for the C5b Conflict Detail codegen surface (s101-m02).
 *
 * Inputs:
 *   1. UiSchema fixture: test/fixtures/ui/conflict-detail.ui-schema.json
 *      — single-item detail view with candidate-summary, existing-mapping,
 *        alternate-interpretations, remediation-hints, and trait-diff sections.
 *   2. Conflict-artifact fixture: test/fixtures/conflict-artifacts/conflict-detail-sample.json
 *      — 1 conflict item with full Stage1 candidate shape (alternate_interpretations[],
 *        existing_map_id), 3 remediation_hints across 3 distinct kinds, and a denormalized
 *        existingMappings[id] payload representing what the playground would resolve
 *        via map.list before rendering the detail UI (mission explicitly forbids
 *        map.list at codegen time).
 *
 * 9-output matrix (react/vue/html × inline/tokens/tailwind) with per-output
 * assertions:
 *   (a) candidate-summary section renders
 *   (b) existing-mapping section renders (gated on existingMapId presence in fixture)
 *   (c) trait-diff section emits rows for {added, removed, unchanged} groups
 *       with data-trait-diff-kind + data-trait-name on each pill
 *   (d) all remediation_hints render in confidence-desc order with data-hint-kind
 *       matching the artifact
 *   (e) verdict action bar matches m02 contract (4 buttons × verdict enum)
 *
 * Helper-extraction decision: m02 (review-queue Q3) and m03 (this spec) share
 * <40% assertion code per measurement (only verdict-count + tokens-var
 * regex + framework-idiom checks overlap, ~30 lines out of ~250 per spec).
 * Below the threshold, so helpers stay co-located and the spec is
 * self-contained. Documented in mission-complete decision capture.
 */

import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { handle as codeGenerate } from '../../src/tools/code.generate.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import type { ConflictArtifact, RemediationHint } from '../../src/tools/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_ROOT = path.resolve(__dirname, '../fixtures');

const uiSchema = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_ROOT, 'ui/conflict-detail.ui-schema.json'), 'utf8'),
) as UiSchema;
const artifact = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_ROOT, 'conflict-artifacts/conflict-detail-sample.json'), 'utf8'),
) as ConflictArtifact & {
  existingMappings?: Record<string, { id: string; externalSystem: string; oodsTraits: string[] }>;
};

const ITEM = artifact.conflicts[0];
const HINTS: RemediationHint[] = ITEM.remediation_hints ?? [];
const EXPECTED_HINT_KINDS_ORDERED = HINTS.map((h) => h.kind);
const EXPECTED_TRAIT_DIFF_KINDS = ['added', 'removed', 'unchanged'] as const;
const VERDICTS = ['accept', 'patch', 'defer', 'dismiss'] as const;

type Framework = 'react' | 'vue' | 'html';
type Styling = 'inline' | 'tokens' | 'tailwind';
const FRAMEWORKS: Framework[] = ['react', 'vue', 'html'];
const STYLINGS: Styling[] = ['inline', 'tokens', 'tailwind'];

interface DetailAssertions {
  hasCandidateSummary: boolean;
  hasExistingMapping: boolean;
  traitDiffKinds: Set<string>;
  traitDiffPillCount: number;
  hintKindsOrdered: string[];
  verdictCounts: Record<(typeof VERDICTS)[number], number>;
}

function makeStringAssertions(code: string): DetailAssertions {
  const hasCandidateSummary = /data-region=["']candidate-summary["']/.test(code);
  const hasExistingMapping = /data-region=["']existing-mapping["']/.test(code);
  const traitDiffKindMatches = code.match(/data-trait-diff-kind=["']([a-z]+)["']/g) ?? [];
  const traitDiffKinds = new Set(
    traitDiffKindMatches.map((m) => /data-trait-diff-kind=["']([a-z]+)["']/.exec(m)![1]),
  );
  // Pill count: trait-diff pills carry both data-trait-diff-kind AND data-trait-name.
  // Pattern is identical across emitters since props pass through verbatim.
  const traitDiffPillRegex =
    /data-role=["']trait-diff-pill["'][\s\S]*?data-trait-name=["']([A-Za-z]+)["']/g;
  const traitDiffPillCount = (code.match(traitDiffPillRegex) ?? []).length;
  // Hint order: scan in source order and extract data-hint-kind from the
  // wrapper Stack on each hint (not the inner Badge — the wrapper appears
  // first in document order and carries the same kind).
  const hintWrapperRegex =
    /data-role=["']remediation-hint["'][\s\S]*?data-hint-kind=["']([a-z_]+)["']/g;
  const hintKindsOrdered: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = hintWrapperRegex.exec(code)) !== null) {
    hintKindsOrdered.push(match[1]);
  }
  const verdictCounts = Object.fromEntries(
    VERDICTS.map((v) => [v, (code.match(new RegExp(`data-verdict=["']${v}["']`, 'g')) ?? []).length] as const),
  ) as DetailAssertions['verdictCounts'];

  return {
    hasCandidateSummary,
    hasExistingMapping,
    traitDiffKinds,
    traitDiffPillCount,
    hintKindsOrdered,
    verdictCounts,
  };
}

function makeJsdomAssertions(html: string): DetailAssertions {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const hasCandidateSummary = doc.querySelectorAll('[data-region="candidate-summary"]').length > 0;
  const hasExistingMapping = doc.querySelectorAll('[data-region="existing-mapping"]').length > 0;
  const traitDiffGroupNodes = Array.from(doc.querySelectorAll('[data-role="trait-diff-group"]'));
  const traitDiffKinds = new Set(
    traitDiffGroupNodes.map((n) => n.getAttribute('data-trait-diff-kind')!),
  );
  const traitDiffPillCount = doc.querySelectorAll('[data-role="trait-diff-pill"]').length;
  const hintWrapperNodes = Array.from(doc.querySelectorAll('[data-role="remediation-hint"]'));
  const hintKindsOrdered = hintWrapperNodes
    .map((n) => n.getAttribute('data-hint-kind'))
    .filter((v): v is string => !!v);
  const verdictCounts = Object.fromEntries(
    VERDICTS.map((v) => [v, doc.querySelectorAll(`[data-verdict="${v}"]`).length] as const),
  ) as DetailAssertions['verdictCounts'];
  return {
    hasCandidateSummary,
    hasExistingMapping,
    traitDiffKinds,
    traitDiffPillCount,
    hintKindsOrdered,
    verdictCounts,
  };
}

async function runCodegen(framework: Framework, styling: Styling) {
  return codeGenerate({
    framework,
    schema: uiSchema,
    options: { typescript: true, styling },
  });
}

// Sanity-check the fixtures are aligned with each other so we catch any drift
// at fixture-load time rather than chasing failures across 9 outputs.
describe('Q3 — C5b Conflict Detail codegen surface (9 outputs)', () => {
  describe('Sanity — fixtures align', () => {
    it('artifact fixture has exactly 1 conflict item with full Stage1 shape', () => {
      expect(artifact.conflicts.length).toBe(1);
      expect(ITEM.candidate.alternate_interpretations?.length ?? 0).toBeGreaterThanOrEqual(1);
      expect(HINTS.length).toBeGreaterThanOrEqual(3);
    });

    it('artifact fixture includes an existingMappings[id] payload for the conflict item', () => {
      const existing = (artifact as { existingMappings?: Record<string, unknown> }).existingMappings;
      expect(existing).toBeDefined();
      expect(existing?.[ITEM.existingMapId!]).toBeDefined();
    });

    it('remediation_hints are in confidence-desc order in the artifact (input invariant)', () => {
      const conf = HINTS.map((h) => h.confidence);
      const sorted = [...conf].sort((a, b) => b - a);
      expect(conf).toEqual(sorted);
    });

    it('hint kinds in artifact include at least 3 distinct values', () => {
      expect(new Set(EXPECTED_HINT_KINDS_ORDERED).size).toBeGreaterThanOrEqual(3);
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

        it(`(a) candidate-summary section renders`, async () => {
          const result = await runCodegen(framework, styling);
          const assertions =
            framework === 'html' ? makeJsdomAssertions(result.code) : makeStringAssertions(result.code);
          expect(assertions.hasCandidateSummary).toBe(true);
        });

        it(`(b) existing-mapping section renders when existingMapId present`, async () => {
          const result = await runCodegen(framework, styling);
          const assertions =
            framework === 'html' ? makeJsdomAssertions(result.code) : makeStringAssertions(result.code);
          expect(ITEM.existingMapId).toBeTruthy();
          expect(assertions.hasExistingMapping).toBe(true);
        });

        it(`(c) trait-diff section emits {added, removed, unchanged} groups with data-trait-* attrs`, async () => {
          const result = await runCodegen(framework, styling);
          const assertions =
            framework === 'html' ? makeJsdomAssertions(result.code) : makeStringAssertions(result.code);
          for (const kind of EXPECTED_TRAIT_DIFF_KINDS) {
            expect(assertions.traitDiffKinds).toContain(kind);
          }
          // Fixture has 2 added (Tabular, Selectable) + 1 removed (Listable) + 1 unchanged (Stateful) = 4 pills
          expect(assertions.traitDiffPillCount).toBe(4);
        });

        it(`(d) remediation_hints render in confidence-desc order with data-hint-kind`, async () => {
          const result = await runCodegen(framework, styling);
          const assertions =
            framework === 'html' ? makeJsdomAssertions(result.code) : makeStringAssertions(result.code);
          expect(assertions.hintKindsOrdered).toEqual(EXPECTED_HINT_KINDS_ORDERED);
        });

        it(`(e) verdict action bar emits 4 buttons matching m01 verdict enum`, async () => {
          const result = await runCodegen(framework, styling);
          const assertions =
            framework === 'html' ? makeJsdomAssertions(result.code) : makeStringAssertions(result.code);
          for (const verdict of VERDICTS) {
            expect(assertions.verdictCounts[verdict]).toBe(1);
          }
        });

        if (framework === 'react') {
          it('output uses functional/hooks idiom (no React.Component)', async () => {
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
          it('output is a parseable document with agent-callable verdict data-action attrs', async () => {
            const result = await runCodegen(framework, styling);
            const dom = new JSDOM(result.code);
            const doc = dom.window.document;
            expect(doc.documentElement.tagName.toLowerCase()).toBe('html');
            expect(doc.querySelectorAll('[data-action="review.triage"]').length).toBe(VERDICTS.length);
          });
        }

        if (styling === 'tokens') {
          it('output references design-token CSS variables (var(--ref-*) or var(--token-*))', async () => {
            const result = await runCodegen(framework, styling);
            expect(result.code).toMatch(/var\(--(ref|token)-/);
          });
        }

        if (styling === 'tailwind' && framework !== 'html') {
          // HTML emitter ignores the codegen `styling` option (delegates to
          // repl.render's token pipeline) — only react/vue surface tailwind classes.
          it('output references tailwind utility classes', async () => {
            const result = await runCodegen(framework, styling);
            expect(result.code).toMatch(/(className|class|:class)=/);
          });
        }
      });
    }
  }
});
