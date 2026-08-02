# s166 m03 findings — ios-swift/compose token outputs on pinned SD 4.4.0

**Build session PS-2026-08-01-004, 2026-08-01.** Spike per the s166 memo: add `ios-swift` and
`compose` platform blocks to `packages/tokens` (config `style-dictionary.config.cjs`, no build-script
logic change beyond success-log lines) on the PINNED style-dictionary 4.4.0 (exact, from pnpm store;
sd-transforms 1.3.0), and prove or falsify the mobile memo's one unverified blocker: whether the
`tokens-studio` preprocessor coexists with SD's NATIVE transform groups.

## Verdict: the blocker is FALSIFIED — coexistence works; v5 is NOT needed

The global `preprocessors: ['tokens-studio']` + per-platform native `transformGroup: 'ios-swift'` /
`'compose'` build cleanly side-by-side with the existing css/ts/tailwind platforms. `pnpm` build
emits `dist/ios-swift/OodsTokens.swift` and `dist/compose/OodsTokens.kt`, **771 constants each**,
zero errors, ~6s. `--check` mode passes; root `tokens:validate` stays **322 EXACT** (the validated
DTCG set is untouched — platforms only add emission targets); `packages/tokens/dist` is gitignored,
so the artifacts are additive build outputs, zero golden moves (#564).

## What broke (output QUALITY — counted, with mechanisms)

The build is mechanically green but the emitted mobile code is NOT compilable as-is. Three concrete
gaps, all in SD's stock transforms meeting OODS's web-native token values:

1. **oklch colors pass through raw — 259/771 tokens in BOTH files.** SD 4.4.0's
   `color/UIColorSwift` and `color/composeColor` transforms convert hex/rgb-family only; the OODS
   palette is oklch-native, so `oklch(0.9417 0.0052 247.88)` lands verbatim as an invalid bare
   identifier. (Control: the 8 shadow colors whose sources are hex DID convert to proper
   `UIColor(red:…)` — the transform works when it recognizes the syntax.) Mobile-walk need: a
   custom oklch→sRGB transform registered ahead of the native groups (e.g. culori conversion), or
   pre-resolved sRGB fallbacks in the sources.

2. **Keyword/string values emit unquoted — ~135 tokens.** CSS system-color keywords from the
   Brand-A alias layer (`Canvas`, `CanvasText`, `Highlight`, `HighlightText`, `GrayText` — 120
   combined), stroke/text keywords (`solid`, `none`, `uppercase`), and font-family names (`DM
   Sans`) all emit as bare identifiers. These are WEB-ONLY values; a native emission needs either
   platform filters excluding web-only tokens or per-platform keyword mapping. The system-color
   aliases can never be mapped mechanically — they are a browser runtime feature.

3. **Dimension basis mismatch ×16 — 174 tokens.** SD's `size/swift/remToCGFloat` (and the compose
   analog) strips the unit and multiplies by 16, assuming rem-denominated sources. OODS dimensions
   are px-denominated (`12px` → `CGFloat(192.00)` / `192.00.dp`; verified against
   `src/tokens/base/border.json` ref.border.radius.md = 12px). Mobile-walk need: a px-basis size
   transform (drop the ×16) replacing the group's size transform.

## What the N×M brand×theme emission (mobile walk) additionally needs

- Platform `filter`s to scope each mobile file to mobile-relevant tokens (excludes the web-only
  keyword classes above at the same stroke).
- Per-brand/per-theme source sets → file-per-(brand,theme) outputs; SD's platform/file mechanism
  already supports this shape — no upgrade required.
- The three custom transforms above (oklch color, string quoting/mapping, px size basis) — all
  registerable via the existing `registerCustomTransforms` hook in `scripts/build.mjs`.

## Gate impact

- `tokens:validate` 322 EXACT (unchanged, verified post-build).
- `packages/tokens` build + `--check` green; css/ts/tailwind outputs byte-identical.
- No golden moves; new outputs are gitignored build artifacts.
