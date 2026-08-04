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

---

## Dated correction block — 2026-08-03 (s170 m03)

Two numbers in the body above were carried into later planning without being re-measured. Both
are re-derived here against HEAD, with the counting method stated, so a reader can reproduce
them. Where the original text exists it is struck through; where the corrected claim was never
written down here, it is added plainly rather than presented as a correction to something.

**Re-derivation command:** `pnpm --filter @oods/tokens run build`, then classify the constant
lines (`public static let ` / `val `) in `packages/tokens/dist/ios-swift/OodsTokens.swift` and
`packages/tokens/dist/compose/OodsTokens.kt`. `dist/` is gitignored, so this moves no golden.

### 1. Raw oklch passthroughs — ~~259/771~~ **381/771** (#1148)

Section "What broke", item 1 says ~~"oklch colors pass through raw — 259/771 tokens in BOTH
files"~~. The correct figure is **381/771**, in both files, re-measured at HEAD 2026-08-03. The
mechanism described in that item is unchanged and still accurate; only the count was wrong.
Total emitted constants are still **771** in each file.

### 2. Swift compilability — the "32/771" figure, and what it actually counts

This claim was never written in this note; it entered the record through later summaries and was
then disputed, because no counting method was recorded and a reviewer could not reproduce it.
**The method is recovered here.** Classifying all 771 emitted Swift constants by the shape of the
value to the right of `=` (comment stripped):

| emitted value shape | count | valid Swift expression? |
|---|---:|---|
| `oklch(...)` passthrough | 381 | no |
| `CGFloat(...)` dimension | 174 | yes — but ×16-wrong (item 3 of the body) |
| duration with unit (`180ms`) | 108 | no |
| comma list (easing curve / font stack) | 68 | no |
| bare numeric literal | 24 | yes |
| bare identifier / unquoted keyword (`solid`, `none`) | 8 | no |
| `UIColor(...)` converted colour | 8 | yes |
| **total** | **771** | |

So: **206/771** emitted constants are syntactically valid Swift expressions; **174** of those
carry the ×16 dimension-basis error, so they parse but are wrong; and **32/771** are both
syntactically valid and free of the ×16 error (8 `UIColor(...)` + 24 bare numerics). **32/771 is
therefore reproducible and correct — under the metric "parses AND is not ×16-affected."** It is
NOT the count of "lines that parse" (that is 206), and it is not a claim that those 32 values are
semantically right in every other respect — only that the two counted defect classes miss them.

None of this is an actual `swiftc`/`kotlinc` compile: it is a lexical classification of emitted
values. A real compile is a stronger check and is a mobile-walk item, not a claim made here.

### 3. Scope note

The body of this note was written at s166 (2026-08-01), before the s167 token-graph de-collision
restructured the Style Dictionary build into one dictionary per brand×theme cell. The
re-derivation above is at s170 HEAD. Total constants (771) and all three defect mechanisms are
unchanged across that restructure; the "~135 tokens" keyword/string estimate in item 2 of the
body was NOT re-derived and should be read against the table above (8 bare identifiers + 68 comma
lists = 76 by the classification used here) rather than carried forward as a measured figure.
