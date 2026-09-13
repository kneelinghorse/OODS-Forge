/**
 * s169 m02 — WHO IS ALLOWED TO DECLARE A BRIDGED SLOT, AND AT WHAT WEIGHT.
 *
 * ── WHAT THIS EXISTS TO PREVENT ──
 * s167's defect was a specificity TIE: `brand.css` and the generated bridge both declared
 * the same `--theme-*` slots at (0,2,0), so which one won was decided by import order, and
 * reordering two lines in `index.css` flipped four brand × theme cells with ZERO test
 * failures. s168 m05 removed the overlap and s178 retired `brand.css` completely. But
 * absence of that named file alone cannot stop a THIRD writer —
 * a new stylesheet, a component sheet, a CSS-in-JS template — from declaring a bridged slot
 * at brand-block weight and recreating the tie somewhere nobody was looking.
 *
 * This is the file-agnostic version of that invariant: a repo-wide census of every place a
 * bridged slot is declared, with the selector's specificity, and the rule that
 * **(0,2,0)-or-higher belongs exclusively to the generated bridge**.
 *
 * ── THE SOURCES, AND WHY THEY ARE THESE THREE ──
 *   1. every PRESENT tracked authored `.css` file (`git ls-files '*.css'`) — index-only, so a
 *      shallow CI checkout cannot silently shrink the universe the way a history-reading test
 *      would; immutable packed-consumer build evidence is asserted present but excluded because
 *      it is a derived copy of the generated bridge, not a shipped source/build input;
 *   2. `packages/tokens/dist/css/tokens.css` — the generated artifact, which is gitignored
 *      and therefore invisible to (1), yet is the one writer that legitimately declares at
 *      (0,2,0);
 *   3. the `DARK_THEME_OVERRIDES` template literal inside
 *      `packages/mcp-server/src/render/document.ts` — CSS that ships inside rendered HTML
 *      alongside the bridge's own output, so it is a real declarer even though it lives in
 *      a `.ts` file.
 *
 * ── TWO PARSING TRAPS, BOTH HIT LIVE ──
 *   • A block's header runs back to the previous `}`, so the FIRST block of a file that
 *     begins with `@import` has a header of `@import '…';\n\n:root`. Reading that as an
 *     at-rule silently DROPPED all 38 of `layers.css`'s `:root` declarations during
 *     grounding. The header is the text after the last `;`.
 *   • A global backtick regex over `document.ts` mis-pairs across the file's other template
 *     literals and captured ZERO declarations. The literal is sliced by `indexOf` from its
 *     declaration and walked to the matching closing backtick.
 * Both are why the census below pins exact COUNTS: a parser that quietly stops seeing a
 * source would otherwise look identical to a clean repo.
 *
 * ── WHAT IT DOES NOT CHECK ──
 * SPECIFICITY ONLY. It says nothing about whether two writers agree on a VALUE — that is
 * `brand-root-and-containment.test.ts`'s job, and conflating them would produce a test that
 * fails for two unrelated reasons with one message.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- build tooling, no type declarations
import { SEMANTIC_BRIDGE } from '../../packages/tokens/scripts/brand-bridge.mjs';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DIST_CSS = 'packages/tokens/dist/css/tokens.css';
const DOCUMENT_TS = 'packages/mcp-server/src/render/document.ts';
const IMMUTABLE_DERIVED_EVIDENCE_CSS: ReadonlySet<string> = new Set([
  // S197 retained pre-palette build; never loaded by the live explorer cascade.
  'artifacts/product-reality/sprint-197/m01/before/packages/tokens/dist/css/tokens.css',
  // Byte-retained pre-fix inventory, never a shipped source or build input (#1884).
  'artifacts/product-reality/sprint-192/m02/token-before/css/tokens.css',
  'artifacts/product-reality/sprint-182/m04/generated-consumers/consumers/react/build/client/assets/index-DhRF-SdH.css',
  'artifacts/product-reality/sprint-182/m04/generated-consumers/consumers/vue/build/client/assets/index-DhRF-SdH.css',
]);

const BRIDGED_SLOTS: ReadonlySet<string> = new Set(
  (SEMANTIC_BRIDGE as readonly { slot: string }[]).map((entry) => entry.slot),
);

interface Declaration {
  readonly selector: string;
  readonly atContext: string;
  readonly property: string;
}

/**
 * Brace-aware walk. Tracks at-rule nesting so `@supports { :root { … } }` is attributed to
 * `:root` *inside* `@supports`, not to a selector called `@supports`.
 */
function parseBridgedDeclarations(css: string): Declaration[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out: Declaration[] = [];
  const stack: Array<{ at: string | null; selector: string | null }> = [];
  let buffer = '';

  for (const character of stripped) {
    if (character === '{') {
      // See the header trap in the file comment: everything after the last `;` is the
      // header; the `@import`/`@charset` statements before it are not part of it.
      const header = buffer.slice(buffer.lastIndexOf(';') + 1).trim();
      buffer = '';
      stack.push(header.startsWith('@') ? { at: header, selector: null } : { at: null, selector: header });
    } else if (character === '}') {
      const closed = stack.pop();
      if (closed?.selector != null && buffer.trim()) {
        const atContext = stack
          .map((frame) => frame.at)
          .filter((at): at is string => at !== null)
          .join(' ');
        for (const line of buffer.split(';')) {
          const separator = line.indexOf(':');
          if (separator < 0) continue;
          const property = line.slice(0, separator).trim();
          if (BRIDGED_SLOTS.has(property)) {
            out.push({ selector: closed.selector, atContext, property });
          }
        }
      }
      buffer = '';
    } else {
      buffer += character;
    }
  }
  return out;
}

/**
 * Rewrite the functional pseudo-classes whose specificity is NOT their own.
 *
 * `:where(…)` contributes ZERO by definition; `:not(…)`, `:is(…)` and `:has(…)` contribute
 * the specificity of their ARGUMENT. Both are handled by balanced-paren scanning, NOT by a
 * regex — and that distinction is not theoretical. The first version of this used
 * `/:where\([^)]*\)/g`, which stops at the first `)` it meets on a nested `:not(` and can
 * silently over-count the selector. The last assertion remains the parser regression pin.
 *
 * Approximation stated: for a multi-argument `:is()`/`:not()` CSS takes the MOST specific
 * argument, while inlining the contents counts them all. No selector in this repo's census
 * uses that form; if one appears, this needs sharpening rather than trusting.
 */
function rewriteFunctionalPseudoClasses(selector: string): string {
  const NAMES = [':where(', ':not(', ':is(', ':has('];
  let result = selector;
  for (;;) {
    let index = -1;
    let name = '';
    for (const candidate of NAMES) {
      const at = result.indexOf(candidate);
      if (at >= 0 && (index < 0 || at < index)) {
        index = at;
        name = candidate;
      }
    }
    if (index < 0) return result;

    let depth = 0;
    let close = -1;
    for (let i = index + name.length - 1; i < result.length; i += 1) {
      if (result[i] === '(') depth += 1;
      else if (result[i] === ')') {
        depth -= 1;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (close < 0) return result.slice(0, index); // unbalanced: drop the remainder rather than miscount
    const inner = result.slice(index + name.length, close);
    result = result.slice(0, index) + (name === ':where(' ? '' : inner) + result.slice(close + 1);
  }
}

/** CSS specificity as [ids, classes/attributes/pseudo-classes, elements]. */
function specificityOf(selector: string): [number, number, number] {
  const normalised = rewriteFunctionalPseudoClasses(selector);
  const ids = (normalised.match(/#[\w-]+/g) ?? []).length;
  const classesAndAttributes = (normalised.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g) ?? []).length;
  const elements = (normalised.match(/(^|[\s>+~(,])[a-zA-Z][\w-]*/g) ?? []).length;
  return [ids, classesAndAttributes, elements];
}

const atLeastBrandBlockWeight = ([ids, classes]: [number, number, number]): boolean => ids > 0 || classes >= 2;

interface CensusRow {
  readonly file: string;
  readonly selector: string;
  readonly atContext: string;
  readonly specificity: string;
  readonly count: number;
}

/** One row per (file, selector, at-context), because that is what a NEW DECLARER looks like. */
function censusOf(sources: ReadonlyArray<readonly [string, string]>): CensusRow[] {
  const tally = new Map<string, CensusRow>();
  for (const [file, css] of sources) {
    for (const declaration of parseBridgedDeclarations(css)) {
      // Quote style is normalised so `[data-theme="dark"]` and `[data-theme='dark']` are
      // one row: they are the same selector, and the HTML renderer writes the other form.
      for (const single of declaration.selector.split(',').map((part) => part.trim().replace(/"/g, "'"))) {
        if (!single) continue;
        const key = `${file} :: ${single} :: ${declaration.atContext}`;
        const existing = tally.get(key);
        if (existing) tally.set(key, { ...existing, count: existing.count + 1 });
        else {
          tally.set(key, {
            file,
            selector: single,
            atContext: declaration.atContext,
            specificity: `(${specificityOf(single).join(',')})`,
            count: 1,
          });
        }
      }
    }
  }
  return [...tally.values()].sort((a, b) =>
    `${a.file}${a.selector}${a.atContext}`.localeCompare(`${b.file}${b.selector}${b.atContext}`),
  );
}

/** THE ORACLE: who declares a bridged slot at brand-block weight without being the bridge? */
const GENERATED_BRIDGE_SELECTOR = /^\[data-brand='[AB]'\]\[data-theme='(base|light|dark|hc)'\]$/;
function findOutOfBridgeDeclarations(rows: readonly CensusRow[]): string[] {
  return rows
    .filter(
      (row) =>
        atLeastBrandBlockWeight(specificityOf(row.selector)) &&
        !(row.file === DIST_CSS && GENERATED_BRIDGE_SELECTOR.test(row.selector)),
    )
    .map((row) => `${row.file} :: ${row.selector} :: ${row.specificity} :: ${row.count} declaration(s)`);
}

/**
 * The `DARK_THEME_OVERRIDES` literal, sliced by `indexOf` and walked to its closing
 * backtick. NOT a global regex — see the second parsing trap in the file comment.
 */
function darkThemeOverridesCss(): string {
  const source = fs.readFileSync(path.join(REPO_ROOT, DOCUMENT_TS), 'utf8');
  const anchor = source.indexOf('const DARK_THEME_OVERRIDES = `');
  expect(anchor, `${DOCUMENT_TS} no longer declares DARK_THEME_OVERRIDES as a template literal`).toBeGreaterThan(-1);
  const start = source.indexOf('`', anchor) + 1;
  const end = source.indexOf('`', start);
  expect(end, 'DARK_THEME_OVERRIDES has no closing backtick').toBeGreaterThan(start);
  return source.slice(start, end);
}

function repoSources(): Array<readonly [string, string]> {
  const tracked = execFileSync('git', ['ls-files', '*.css'], { cwd: REPO_ROOT, encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean)
    // A guard must run in the same deletion-bearing worktree that CI will commit. `git
    // ls-files` still lists an index entry deleted from the worktree until that commit.
    .filter((file) => fs.existsSync(path.join(REPO_ROOT, file)));
  expect(
    tracked.filter((file) => IMMUTABLE_DERIVED_EVIDENCE_CSS.has(file)).sort(),
    'the exact committed M04 build-evidence CSS boundary changed',
  ).toEqual([...IMMUTABLE_DERIVED_EVIDENCE_CSS].sort());
  const authoredTracked = tracked.filter((file) => !IMMUTABLE_DERIVED_EVIDENCE_CSS.has(file));
  return [
    ...authoredTracked.map((file) => [file, fs.readFileSync(path.join(REPO_ROOT, file), 'utf8')] as const),
    [DIST_CSS, fs.readFileSync(path.join(REPO_ROOT, DIST_CSS), 'utf8')] as const,
    [`${DOCUMENT_TS} (DARK_THEME_OVERRIDES)`, darkThemeOverridesCss()] as const,
  ];
}

/**
 * THE EXACT CENSUS. Pinned as a table rather than a count so that BOTH failure directions
 * surface: a new declarer appears as an extra row, and a parser regression appears as a
 * missing row or a shrunken count. A bare "no offenders" assertion would pass in both.
 *
 * `apps/explorer/src/styles/tokens.css` is 40, not 41, BY DESIGN: its remaining twin is
 * `--theme-text-on_interactive`, an underscore twin of `--theme-text-on-interactive`. It is
 * a different custom property, not a typo to "fix" — changing it is a behaviour change.
 */
const EXPECTED_CENSUS: ReadonlyArray<[string, string, string, string, number]> = [
  ['apps/explorer/src/styles/layers.css', ':root', '', '(0,1,0)', 41],
  ['apps/explorer/src/styles/layers.css', ':root', '@supports (color: oklch(from white l c h))', '(0,1,0)', 2],
  ['apps/explorer/src/styles/layers.css', "html[data-theme='dark']", '', '(0,1,1)', 41],
  ['apps/explorer/src/styles/tokens.css', ':root', '', '(0,1,0)', 40],
  [`${DOCUMENT_TS} (DARK_THEME_OVERRIDES)`, "[data-theme='dark']", '', '(0,1,0)', 41],
  [DIST_CSS, ':root', '', '(0,1,0)', 41],
  [DIST_CSS, "[data-brand='A'][data-theme='base']", '', '(0,2,0)', 41],
  [DIST_CSS, "[data-brand='A'][data-theme='dark']", '', '(0,2,0)', 41],
  [DIST_CSS, "[data-brand='A'][data-theme='hc']", '', '(0,2,0)', 41],
  [DIST_CSS, "[data-brand='A'][data-theme='light']", '', '(0,2,0)', 41],
  [DIST_CSS, "[data-brand='B'][data-theme='base']", '', '(0,2,0)', 41],
  [DIST_CSS, "[data-brand='B'][data-theme='dark']", '', '(0,2,0)', 41],
  [DIST_CSS, "[data-brand='B'][data-theme='hc']", '', '(0,2,0)', 41],
  [DIST_CSS, "[data-brand='B'][data-theme='light']", '', '(0,2,0)', 41],
];

describe('s169 m02 — repo-wide bridged-slot specificity census', () => {
  const rows = censusOf(repoSources());

  it('(a) only the generated bridge declares a bridged slot at (0,2,0) or higher', () => {
    const offenders = findOutOfBridgeDeclarations(rows);
    expect(
      offenders,
      'these declare a bridged slot at brand-block weight without being the generated bridge, ' +
        'which is how the s167 import-order tie was possible:\n  ' + offenders.join('\n  '),
    ).toEqual([]);
  });

  it('(b) the census is EXACTLY these 14 rows — a new declarer and a parser regression both show', () => {
    const actual = rows.map((row) => [row.file, row.selector, row.atContext, row.specificity, row.count]);
    expect(actual).toEqual(
      [...EXPECTED_CENSUS].sort((a, b) => `${a[0]}${a[1]}${a[2]}`.localeCompare(`${b[0]}${b[1]}${b[2]}`)),
    );
    // Named separately so a count drift reads as a count drift rather than a diff of 14 tuples.
    expect(rows.length, 'the number of distinct (file, selector, at-context) declarers changed').toBe(14);
  });

  it('(c) the oracle is discriminating — a seeded (0,2,0) declaration outside the bridge is reported', () => {
    const SEED_FILE = 'scratch/rogue-theme.css';
    const seeded = censusOf([
      ...repoSources(),
      [SEED_FILE, ".rogue[data-theme='dark'] { --theme-surface-canvas: rgb(1, 2, 3); }"] as const,
    ]);
    expect(findOutOfBridgeDeclarations(seeded)).toEqual([
      `${SEED_FILE} :: .rogue[data-theme='dark'] :: (0,2,0) :: 1 declaration(s)`,
    ]);
    // Control of the control: unseeded is clean, so the seed is what moved it.
    expect(findOutOfBridgeDeclarations(rows)).toEqual([]);
  });

  it('(c) a seed that copies the bridge SELECTOR but not its file is still reported', () => {
    // The allowance is file AND selector, never selector alone — otherwise any stylesheet
    // could re-enter the tie simply by naming the same block.
    const seeded = censusOf([
      ...repoSources(),
      ['apps/explorer/src/styles/rogue.css', "[data-brand='A'][data-theme='dark'] { --theme-text-primary: red; }"] as const,
    ]);
    expect(findOutOfBridgeDeclarations(seeded)).toEqual([
      "apps/explorer/src/styles/rogue.css :: [data-brand='A'][data-theme='dark'] :: (0,2,0) :: 1 declaration(s)",
    ]);
  });

  it(':where() contributes zero specificity even with a nested :not()', () => {
    // This exact nested shape defeated the first regex-based specificity parser. Keep the
    // parser bite even though the legacy stylesheet that exposed it is now retired.
    expect(specificityOf(":where([data-brand='A']:not([data-theme]), [data-brand='A'][data-theme='light'])")).toEqual([0, 0, 0]);
    // ...and the same selector WITHOUT the :where() wrapper is what it would become.
    expect(specificityOf("[data-brand='A']:not([data-theme])")).toEqual([0, 2, 0]);
    expect(specificityOf("[data-brand='A'][data-theme='dark']")).toEqual([0, 2, 0]);
    expect(specificityOf("html[data-theme='dark']")).toEqual([0, 1, 1]);
    expect(specificityOf(':root')).toEqual([0, 1, 0]);
  });
});
