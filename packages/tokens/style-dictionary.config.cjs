/**
 * Style Dictionary configuration for the @oods/tokens package.
 * The heavy lifting (custom formats, expand config, run orchestration) happens
 * inside scripts/build.mjs.
 *
 * -------------------------------------------------------------------------
 * s167 m01 — this is NO LONGER a single flat run.
 * -------------------------------------------------------------------------
 * Until s167 this file declared `source: ['src/**\/*.json']`, which globbed both
 * brands, all three themes, three preset files and duplicate base files into ONE
 * Style Dictionary run emitting ONE `:root`. Style Dictionary deep-merges
 * identical token paths and the last writer wins, so `brands/A/hc.json` (last
 * alphabetically) won every brand slot: brand A shipped the forced-colors
 * keywords `Highlight`/`Canvas` as its colours on all five platforms while its
 * light and dark literals reached none of them.
 *
 * The fix (memo SS3 D1) is multiple RUNS — a platform entry cannot carry its own
 * `source` in Style Dictionary 4.4.0, so scoping has to happen at the dictionary
 * level. `scripts/build.mjs` instantiates one dictionary per brand x theme scope
 * from `sourceForScope()` below.
 *
 * Token PATHS deliberately do NOT change (`color.brand.A.surface.canvas` is still
 * spelled that way in every theme file). Encoding the theme into the path would
 * change `brand_apply`'s RFC-6902 pointer shape, which is a public MCP contract
 * asserted at packages/mcp-server/test/contracts/brand.apply.patch.spec.ts:12,17,27.
 */
const prefix = 'oods';

/**
 * The shared layer: every scope loads exactly these files, in exactly this order.
 *
 * ORDER IS LOAD-BEARING — do not sort, reorder, or collapse these patterns.
 * Precedence runs top to bottom (later files win a merge), and the layering is:
 *
 *   1. `src/*.json`               viz scales/sizing — standalone namespaces
 *   2. `src/tokens/*.json`        motion + shadow LITERALS. These are authoritative
 *                                 (memo SS3 D6). Their former duplicates in
 *                                 `base/motion.json` / `base/shadow.json` declared the
 *                                 same 21 paths as ALIASES back into `sys.motion.*` /
 *                                 `ref.shadow.*`, which alias back down again — a cycle
 *                                 that only stayed unbroken because the literal won the
 *                                 collision. s167 deleted the alias copies; keeping the
 *                                 literals ahead of the `base/**` layer preserves the
 *                                 resolution order that produced today's values.
 *   3. `src/tokens/base/**`       reference + system layers (`ref.*`, `sys.*`)
 *   4. `src/tokens/themes/**`     the SEMANTIC layer. Already namespaced (`theme.dark.*`),
 *                                 which is why it never participated in the collapse —
 *                                 it stays global rather than becoming per-scope.
 *   5. `src/tokens/aliases/*`     `brand.A.*` / `brand.B.*` aliases
 *   6. `src/tokens/component/*`   `cmp.*`
 *   7. both brands' `base.json`   see BRAND BASE FILES below
 *
 * PATTERNS MUST BE POSITIVE (memo SS3 D4). Style Dictionary 4.4.0 calls `globSync`
 * once per pattern and concatenates the results; it does NOT apply cross-pattern
 * negation, so a `'!src/presets/**'` entry silently does nothing. `src/presets/**`
 * is therefore excluded by simply never naming it — the three presets are BRAND-RELATIVE
 * palette deltas (15, 15 and 21 leaves; the "15-leaf" this comment used to claim was true
 * of two of the three and wrong about `dark-minimal.json`) that no production code reads.
 * As of s169 m05 they carry NO `color.brand.<X>` wrapper at all: the caller wraps a preset
 * for whichever brand it is applying to, which is why one payload now serves any brand.
 *
 * BRAND BASE FILES — why BOTH brands' `base.json` sit in the shared layer:
 * `src/tokens/aliases/brand-B.json` references `{color.brand.B.*}` and is itself a
 * global file, so a run that loaded only brand A's sources would leave those aliases
 * unresolvable. Both brand bases are loaded everywhere; a scope then overlays only
 * its own theme file on top. Brand A's base doubling as the bare-`:root` default is
 * memo SS3 D2 — before s167 `:root` accidentally meant "hc, because it sorted last".
 */
const SHARED_SOURCE = Object.freeze([
  'src/*.json',
  'src/tokens/*.json',
  'src/tokens/base/**/*.json',
  'src/tokens/themes/**/*.json',
  'src/tokens/aliases/*.json',
  'src/tokens/component/*.json',
  'src/tokens/brands/A/base.json',
  'src/tokens/brands/B/base.json',
]);

/** The six emitted cells. Order fixes the order of the blocks in tokens.css. */
const BRAND_SCOPES = Object.freeze([
  Object.freeze({ brand: 'A', theme: 'base' }),
  Object.freeze({ brand: 'A', theme: 'dark' }),
  Object.freeze({ brand: 'A', theme: 'hc' }),
  Object.freeze({ brand: 'B', theme: 'base' }),
  Object.freeze({ brand: 'B', theme: 'dark' }),
  Object.freeze({ brand: 'B', theme: 'hc' }),
]);

/** memo SS3 D2 — bare `:root`, and the four non-CSS platforms (D7), are this cell. */
const DEFAULT_SCOPE = BRAND_SCOPES[0];

/**
 * The declared overlay chain for one cell: shared layer, then that brand's theme file.
 * `base` needs no overlay — brands/<X>/base.json is already in the shared layer.
 */
function sourceForScope(scope) {
  const source = [...SHARED_SOURCE];
  if (scope.theme !== 'base') {
    source.push(`src/tokens/brands/${scope.brand}/${scope.theme}.json`);
  }
  return source;
}

/**
 * memo SS3 D9 — the pinned selector table. Specificity is load-bearing.
 *
 * `apps/explorer/src/styles/layers.css:1` imports the generated CSS and then
 * re-declares `--theme-*` custom properties at `:root`. `:root` and a single
 * `[data-brand='A']` are both specificity (0,1,0), so on a tie layers.css wins on
 * source order and would mask a single-attribute block. Every emitted scope block
 * therefore carries TWO attribute selectors, i.e. (0,2,0).
 *
 * s168 m05 CORRECTION, twice over. The figure here used to read "183", and the
 * justification compared against a SINGLE-attribute selector this generator never
 * emits — so the comment argued for the two-attribute decision against a shape that
 * does not exist. Both are fixed. `grep -c` counts 183 LINES containing the string
 * `--theme-`, which includes `var()` REFERENCES; actual DECLARATIONS are 57 at
 * `:root`, 57 at `html[data-theme='dark']` and 2 more inside an
 * `@supports (color: oklch(from white l c h))` block — 116 in total, not the 115 the
 * sprint memo carried, which overlooked the `@supports` pair. The number is left out
 * of the prose above deliberately: it is a moving count with no load-bearing role,
 * and pinning it in a comment is how it went stale in the first place.
 *
 * THEME VOCABULARY: the token tree spells the default theme `base`, but the MCP
 * boundary spells it `light` and `normalizeTheme` defaults to `light`. The base row
 * emits BOTH so a rendered document actually matches — a matrix keyed only on `base`
 * would match zero MCP renders while a file-text oracle stayed green.
 */
function selectorsForScope(scope) {
  const themeKeys = scope.theme === 'base' ? ['base', 'light'] : [scope.theme];
  return themeKeys.map((theme) => `[data-brand='${scope.brand}'][data-theme='${theme}']`);
}

/** True for the brand-namespace literals a scope block is responsible for emitting. */
function isBrandToken(token, brand) {
  const path = token?.path;
  return Array.isArray(path) && path[0] === 'color' && path[1] === 'brand' && path[2] === brand;
}

module.exports = {
  prefix,
  preprocessors: ['tokens-studio'],
  expand: {},
  log: {
    warnings: 'warn',
    verbosity: 'info',
  },
  /**
   * Consumed by scripts/build.mjs, stripped before the object is handed to
   * Style Dictionary. `source` is intentionally absent from this export: there is
   * no single source list any more, only `sourceForScope(scope)`.
   */
  oodsScoping: {
    SHARED_SOURCE,
    BRAND_SCOPES,
    DEFAULT_SCOPE,
    sourceForScope,
    selectorsForScope,
    isBrandToken,
  },
  platforms: {
    // memo SS3 D7 — the four non-CSS platforms have no selector concept, and
    // dist/tailwind/tokens.json is the single upstream of the @oods/tokens flat
    // `cssVariables` map (certify's contrast pillar, viz-core's chrome bake).
    // Reshaping it is a one-way door, so this sprint they emit the DEFAULT_SCOPE
    // only: the flat key SET stays byte-identical, and only VALUES move off the
    // forced-colors keywords. Per-scope non-CSS emission is s168.
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab', 'name/css-prefix'],
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            selector: ':root',
            outputReferences: true,
          },
        },
      ],
    },
    ts: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      buildPath: 'dist/ts/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'typescript/tokens',
          options: {
            prefix,
            banner: true,
          },
        },
      ],
    },
    tailwind: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      buildPath: 'dist/tailwind/',
      files: [
        {
          destination: 'tokens.json',
          format: 'tailwind/tokens',
          options: {
            prefix,
            indent: 2,
          },
        },
      ],
    },
    // s166 m03 mobile-platform spike: SD's NATIVE ios-swift/compose transform groups on
    // the same tokens-studio-preprocessed sources — proving the preprocessor and native
    // groups coexist on pinned SD 4.4.0 (the mobile front's one unverified blocker).
    'ios-swift': {
      transformGroup: 'ios-swift',
      buildPath: 'dist/ios-swift/',
      files: [
        {
          destination: 'OodsTokens.swift',
          format: 'ios-swift/class.swift',
          options: {
            className: 'OodsTokens',
          },
        },
      ],
    },
    compose: {
      transformGroup: 'compose',
      buildPath: 'dist/compose/',
      files: [
        {
          destination: 'OodsTokens.kt',
          format: 'compose/object',
          options: {
            className: 'OodsTokens',
            packageName: 'com.oods.tokens',
          },
        },
      ],
    },
  },
};
