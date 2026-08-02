# Decision memo: Sprint-167 — de-collide the token graph + generate the brand bridge (ENGINE-FIRST)

> **Status:** v2, rewritten after a hardened-critic pass returned **DO_NOT_LOCK on all five lenses**
> (13 blockers, 26 majors — `wf_84f257b6-e01`). Ready to LOCK.
> **Grounded by** `wf_2d4e2305-af9` (6 area audits + churn verifiers, 17 agents). Every headline number and
> every load-bearing decision below was re-measured in the main loop, not taken from agent prose (rule 19).
> **Scope ratified by Derek 2026-08-02** — engine-first, no Parts Town seed, cut to four missions after the
> critic pass. FF#22 rides along.
> **Build from this memo, never from review prose (rule 9). Genuine-close review is a separate session; the
> build never self-certifies (rule 10).**

---

## 1. The finding

`packages/tokens/style-dictionary.config.cjs:9` globs `source: ['src/**/*.json']` — both brands, all three
themes, three preset files, and duplicate base files — into ONE flat Style Dictionary run emitting ONE `:root`
(`tokens.css:5`, closing `:777`). Style Dictionary deep-merges identical token paths; last writer wins.

**109 of 603 token paths are multiply-declared. They split two ways:**

- **88 are theme-spanning** — the brand × theme collapse. Glob order is `base → dark → hc`, so `hc` wins:

| `color.brand.A.surface.interactive.primary.default` | value |
|---|---|
| `brands/A/base.json:41` | `oklch(0.58 0.19 43)` |
| `brands/A/dark.json` | `oklch(0.72 0.16 183)` |
| `brands/A/hc.json` | `Highlight` |
| **shipped `tokens.css`** | **`Highlight`** |

  Brand A's light and dark literals reach **zero** of the five dist platforms. It reaches mobile:
  `dist/ios-swift/OodsTokens.swift` carries `brandASurfaceCanvas = Canvas`.

- **21 are duplicate-file pairs with genuinely different values**, and they are **LOAD-BEARING** (§3 D6).

The build's own `--check --verbose` prints `Token collisions detected (949)` and **exits 0**. That count is
Style Dictionary's own logger — `packages/tokens/scripts/build.mjs` contains **zero** occurrences of
"collision". There is no collision guard in this repo. m1 must **write** one.

**Correction to a prior s166 review claim of mine — stated precisely because a wrong correction is worse than
the original error.** I earlier attributed all 306 non-compiling Swift values to a missing quoting transform,
then over-corrected by attributing them to the collision. Measured:

| class | count | cause |
|---|---|---|
| forced-colors keywords (`Canvas`, `Highlight`, …) | **122** | collision winners — hc won |
| durations, easing tuples, font stacks (`0ms`, `0,0,1,1`, `DM Sans, …`) | **184** | genuine quoting/transform gap |

**Decision #1344's transform list STANDS.** The collision is an *additional*, independent defect explaining 122
of the 306. m4 records this correction; it does not supersede #1344.

**Why nobody noticed — four writers of the consumer layer, three of them hand-authored:**

1. The token build (collapsed, above).
2. `apps/explorer/src/styles/brand.css` — hand-authored, correct *structure*, drifted values
   (`brand.css:10` `oklch(0.56 0.19 45)` vs `brands/A/base.json:41` `oklch(0.58 0.19 43)`).
3. `apps/explorer/src/styles/layers.css` — re-declares **183** `--theme-*` at `:root` *after*
   `@import '@oods/tokens/css'` (`layers.css:1`).
4. An inline `[data-theme="dark"]` remap in the MCP render path (`document.ts:121`).

**And the brand namespace is DEAD.** Verified: the shipped CSS has **377** semantic declarations
(`--theme-*` 222, `--sys-*` 151, `--cmp-*` 4) and **zero** of them reference any brand variable. The 122
`--oods-color-brand-*` vars plus 40 `--oods-brand-*` aliases resolve only to each other. Nothing the MCP render
paints with reads a brand token.

> **This is the single most important fact in this memo.** Emitting `[data-brand]` blocks over
> `--oods-color-brand-*` would change **zero pixels**. The brand→semantic bridge is the deliverable (D8), not
> an implication of it.

---

## 2. Scope

**IN:** de-collide the graph (incl. the 21 and the typography leak), write a real collision guard, generate the
brand→semantic bridge for brands A and B, fix FF#22.

**OUT, deliberately:**

- **Brand enum widening + `brand.apply` path guard.** Pointless before the bridge exists. Carries its own
  regeneration sweep (Generator A + `docs:api --check` + `tools/token-lint/baseline.json`). **s168.**
  *Standing security note for s168:* `brand.apply.ts:160-163` does `path.join(BRAND_ROOT, brand, …)` then a
  bare `readFileSync` with no containment guard — the `enum:["A"]` is currently the only thing preventing an
  arbitrary-file read over MCP. **Guard first, widen second, RED-first the traversal case.**
- **MCP brand threading + certify honesty.** A second public contract widening; `artifact_certify` has no brand
  input at all and `artifact.certify.output.json:82` is `additionalProperties:false` with ajv output validation
  (`index.ts:279`), so a skin field needs schema work. **s168.**
- **Deleting `brand.css`.** It has two importers — `apps/explorer/src/stories/BrandA.stories.tsx:4` and
  `apps/explorer/src/styles/index.css:2` — and deleting it breaks `build-storybook`, a hard dependency of
  three CI jobs. Retirement is **s168**, gated on the bridge proving out.
- **Parts Town seeding.** XL and client-blocked: the 12 PT modes do not map onto light/dark/hc (`desktop` 13 /
  `tablet` 12 / `mweb` 1 are **breakpoints**, an axis Forge lacks; nothing maps to `hc`, so `brands/PT/hc.json`
  must be authored), plus a ~41-slot semantic mapping only PT's design team can supply, 13 collision decisions,
  4 unrepresentable Chrome Gradients, and font licensing. **s168+.**

---

## 3. Settled decisions — the build implements these, it does not re-litigate them

**D1 — Split via multiple Style Dictionary RUNS; token paths do NOT change.**
A platform entry cannot carry its own `source` in SD 4.4.0; only multiple runs work. Source *paths* stay
exactly as they are (`color.brand.A.surface.canvas` in every theme file), because renaming to encode theme
would change `brand_apply`'s RFC-6902 pointer shape — a public MCP contract asserted on at
`packages/mcp-server/test/contracts/brand.apply.patch.spec.ts:12,17,27`.
**Source ORDER within each run is load-bearing** — a wrong order hard-throws 19 circular-reference cycles.
Pin the order explicitly in the config and comment why.

**D2 — Bare `:root` = brand A, base theme.** Today `:root` accidentally means "hc, because it sorted last."

**D3 — Emit into `tokens.css`, one file.** `document.ts:20` (`TOKENS_CSS_PATH`) inlines exactly one path.
*Correction to v1's rationale:* this is not "every rendered document" — `repl.render` defaults `compact=true`
and omits tokens.css. The claim is scoped to the non-compact render path.

**D4 — Exclude `src/presets/**` by POSITIVE globs.** SD 4.4.0 has **no cross-pattern glob negation** — it calls
`globSync` once per pattern and concatenates, so `'!src/presets/**'` silently does nothing. Enumerate the
wanted directories positively. The three presets are 15-leaf deltas over `color.brand.A.*` read by no
production code (`grep -rn "preset"` finds only `packages/mcp-server/test/presets/brand-presets.spec.ts`,
which reads from `src/` directly).

**D5 — Goldens will move; that is chartered.** See §5.

**D6 — The 21 duplicate-file collisions: the LITERAL files are authoritative; the alias duplicates are removed.**
This reverses the intuitive call, and the evidence is why it must be settled here:

```
base/motion.json         motion.duration.fast      = {sys.motion.duration.fast}
base/system/motion.json  sys.motion.duration.fast  = {motion.duration.fast}     ← circular
tokens/motion.json       motion.duration.fast      = 120ms                       ← literal, wins today
```

The alias form is **circular**. The only thing breaking the cycle today is the literal winning the collision —
shipped CSS is `--oods-motion-duration-fast: 120ms`. **The collision is load-bearing.** De-colliding in favour
of the alias file reproduces the 19 cycles. Therefore: `tokens/motion.json` and `tokens/shadow.json` (literals)
are authoritative; the colliding leaves in `tokens/base/motion.json` and `tokens/base/shadow.json` are deleted.
**Required proof:** resolved values are byte-identical before and after for all 21 paths, recorded in the
closeout.

**D7 — Non-CSS platforms emit the A/base scope only this sprint.**
`ts`, `tailwind`, `ios-swift`, `compose` have no selector concept, and `dist/tailwind/tokens.json` is the single
upstream of the `@oods/tokens` flat `cssVariables` map — the operand for certify's contrast pillar
(`certify-contrast.ts:58,:353,:435`) and viz-core's chrome bake. Reshaping it is a one-way door and is **not**
this sprint. The flat key SET stays byte-identical; only VALUES change (122 of 771 corrected away from
forced-colors keywords). Per-scope non-CSS emission is s168.
**m1's success criterion is therefore:** CSS carries the matrix; the four non-CSS platforms carry the D2 default
and are proven to carry *base* values, not hc.

**D8 — The brand→semantic bridge is GENERATED. This is the sprint's core deliverable.**
Per brand × theme, the build emits a selector-scoped block assigning the **shared consumer layer** from that
brand's values — i.e. `--theme-*: <that brand's resolved value>`, the ~38–42 slots `brand.css` assigns by hand:

```css
[data-brand='A'][data-theme='dark'] { --theme-surface-canvas: <A dark canvas>; … }
```

Brand *token* values alone are inert (0 of 377 semantic declarations reference a brand var). The bridge, not
the `--oods-color-brand-*` namespace, is what makes `data-brand` mean anything.
**Source of the slot list:** the `--theme-*` names `brand.css` already enumerates. Authoring the per-brand
semantic mapping for A and B is *in* m2's scope and is why m2 is [L], not [M].

**D9 — Selector table, pinned. Specificity is load-bearing.**
`layers.css:1` imports the generated CSS then re-declares 183 `--theme-*` at `:root`. `:root` and
`[data-brand='A']` are both specificity (0,1,0), so on a tie **layers.css wins on source order** and would mask
a single-attribute bridge block. Therefore every emitted bridge block carries **two** attribute selectors:

| cell | selector | specificity |
|---|---|---|
| A / base | `:root` **and** `[data-brand='A'][data-theme='base']` | (0,1,0) / (0,2,0) |
| A / dark | `[data-brand='A'][data-theme='dark']` | (0,2,0) |
| A / hc | `[data-brand='A'][data-theme='hc']` | (0,2,0) |
| B / base | `[data-brand='B'][data-theme='base']` | (0,2,0) |
| B / dark | `[data-brand='B'][data-theme='dark']` | (0,2,0) |
| B / hc | `[data-brand='B'][data-theme='hc']` | (0,2,0) |

**Theme vocabulary:** the token tree is `base|dark|hc`; the MCP boundary is `light|dark|hc` and
`normalizeTheme` defaults to `light`. Emit **both** `[data-theme='base']` and `[data-theme='light']` for the
base row so a rendered document matches. A matrix keyed only on `base` would match zero MCP renders while a
file-text oracle stayed green.

**D10 — The `ref.typography.*` leak is fixed, not inherited.**
Six GLOBAL-namespace paths (`ref.typography.*`, incl. `families.sans = 'DM Sans, …'`) are declared inside
`brands/A/{base,dark,hc}.json` and in **no** brand-B file, so brand A's DM Sans currently wins globally over
`base/typography.json`'s Inter. Under a brand-scoped split those leaves become brand-A-scoped and **brand B
flips to Inter** — a second consumer-visible change. Decision: move the six `ref.typography.*` leaves OUT of
`brands/A/*` into the global base layer, preserving today's resolved value (DM Sans) for both brands. Font
*loading* remains out of scope; this is purely de-leaking a global from a brand file.

---

## 4. Mission slate

**DAG:** m1 → m2 → m4. m3 is an independent root. m4 requires all.

### m1 — De-collide the token source graph + write the collision guard [L]

- Restructure to multiple SD runs per D1/D4/D7, with source order pinned and commented.
- Apply D6 (delete the 21 colliding alias leaves) and D10 (de-leak `ref.typography.*`).
- **Write the collision guard** — it does not exist. Rules: a NEW pre-load pass over each scope's resolved file
  list that flags a duplicate token PATH whose `$value` differs; it **EXEMPTS the declared overlay chain**
  (`brands/<X>/base.json` → `brands/<X>/<theme>.json`) because that layering *is* the mechanism; it must fail
  on any residual non-brand duplicate. A guard that reds on "any intra-scope collision" can never go green —
  the prescribed layering itself produces collisions by design.
- **Wire the guard into the gate sweep** (§5). A guard nothing runs is not a guard.
- **RED-first oracle — R16/R13a compliant, NOT literal greps.** Generate an expectation table
  (brand × theme × token-path → source `$value`) derived from the six `brands/{A,B}/{base,dark,hc}.json` files,
  then assert per emitted scope block that every path carries **its own** scope's value AND that **no scope
  carries another scope's value**. Presence-of-literal cannot discriminate scope assignment.
- **Proof obligations:** brand A base resolves `oklch(0.58 0.19 43)` not `Highlight`; brand A dark
  `oklch(0.72 0.16 183)` reaches output at all (today it reaches none); the 21 D6 paths resolve byte-identically
  before/after; the four non-CSS platforms carry base values, not hc, with an unchanged key set.

### m2 — Generate the brand→semantic bridge for A and B [L]

- Author the per-brand semantic mapping (D8) and emit the six-cell matrix per D9.
- **Verification control must be discriminating (R13a).** A "shim first" step is NOT one: while `brand.css` and
  `layers.css` are loaded they mask the generated blocks, so "prove the generated output supersedes it" has no
  observable outcome. Instead: a test that loads **only** `packages/tokens/dist/css/tokens.css` and asserts each
  of the six cells resolves its expected `--theme-*` literal, plus a cross-cell assertion that no cell carries
  another's values.
- **Record the drift as data.** Author a diff of `brand.css`'s hand values vs the generated block and commit it
  as the catalogue of what the hand-authored copy got wrong (`brand.css:10` is one known instance). Do not
  silently "fix" drift without recording it.
- `brand.css` and `layers.css` are **not** deleted this sprint (§2). State explicitly in the closeout that they
  still win at runtime in the explorer app, so the bridge is proven at the CSS-artifact level, not yet at the
  app level.

### m3 — FF#22: stop the id leak into the Vega-Lite mark def [M] *(independent root)*

- `createMark` in `packages/viz-core/src/adapters/vega-lite-adapter.ts` spreads `mark.options` wholesale, so
  the OODS-only `id` key leaks out as `mark.id`. The emitted spec stamps
  `$schema https://vega.github.io/schema/vega-lite/v6.json`, whose `MarkDef` is `additionalProperties:false`
  with no `id` — so the id-keyed ordering pattern **the s166 docs now prescribe** emits a schema-invalid spec.
  Verified live: emitted mark `{"type":"point","id":"target","color":"#416CD9"}`; ordering works, so dropping
  ids to regain validity returns the consumer to the original FF#22 dead end.
- **Enumerate what legitimately flows through `options` into the mark def before filtering** — a naive strip
  breaks real passthrough. Filter OODS-only keys only.
- **RED-first:** AJV against the real `node_modules/vega-lite/build/vega-lite-schema.json`. Confirmed
  discriminating: with `id` → invalid, `id` stripped → valid.
- Claim ceiling: "the prescribed pattern now emits a schema-valid spec" — **not** "FF#22 is closed."
- Loop-closure to Forge-Demos at m4 (threads are respond-once; NEW info_push per the s159/s166 precedent).

### m4 — Closeout [S]

Named-invocation gate sweep (§5), the #1344 record correction (§1 — an addition, not a supersession), charter-diff
against this memo with deviations amended in the same change, consumer loop-closure, pm2 bridge restart if dist
changed.

---

## 5. Gates — NAMED invocations (rule 17)

Baselines re-measured 2026-08-01/02, not copied forward:

- viz-core `pnpm --filter @oods/viz-core exec vitest run` = **1205** / 61 files
- root `npx vitest run --project core` = **4651** / 428 files
- **root `npx vitest run --project guardrails`** — *NEW REQUIRED GATE.* It imports the BUILT token dist
  (`testing/a11y/contrast.spec.ts`) and is the most value-sensitive suite in the repo for this sprint. CI runs
  all four root projects in its coverage job; pinning only `core` misses it.
- mcp-server `pnpm --filter @oods/mcp-server run test` = **3978** (3962 + 16 skipped), AFTER dist rebuild
- scale `pnpm --filter @oods/mcp-server run test:scale` = **62**
- **`pnpm run tokens-validate` (HYPHEN, the composite)** — *corrected from v1.* The colon form
  `tokens:validate` is only the first of four legs; the composite is
  `tokens:validate && tokens:lint-semantic && tokens:guardrails --quiet --no-diagnostics && tokens:validate-viz`,
  and the unpinned legs include a token COLOR guardrail. v1 pinned two of four — exactly the mistake ci.yml
  warns about.
- **the new m1 collision guard** — pinned by its named invocation, must exit non-zero on a seeded duplicate
- root `pnpm typecheck` PASS · `pnpm --filter @oods/viz-core run typecheck` PASS (CI runs this separately at
  ci.yml:146; it reds independently and did so on the s166 PR) · `pnpm install --frozen-lockfile` clean
- Run suites **sequentially** — the mcp-server suite has a p99 timing budget that reds under starvation.

**CHARTERED GOLDEN EXCEPTION to #564.** `tokens.css` is inlined into non-compact MCP renders, and 122 of 771
flat token values change. Goldens **will** move. Corrections to v1's list:

- `packages/viz-render/test/__snapshots__/emitter.spec.ts.snap` will **NOT** move — viz-render has no
  `@oods/tokens` dependency and its 10 `font-family` values are literal `sans-serif`. Removed from the list.
- `dashboard.render.fidelity.test.ts.snap` **will** move, but driven by brand-token values, **not** `DM Sans`.
  v1's rationale would have mis-set expectations.
- Expect movement across the `packages/mcp-server/src/tools/__snapshots__/` fidelity goldens as a set, not the
  two named in v1.

**Requirement:** every moved golden gets a line-item diff review in the closeout stating what changed and why it
is correct. An unexplained move is stop-the-line, not a snapshot update.

**Human-gated CI (Derek's, not the build's):** `ci.yml:329-334` runs `tokens-governance` as a per-brand matrix
and hard-fails on nonzero status; brand token value changes are expected to trip it.

---

## 6. Honest-claim ceiling

At closeout this sprint may claim, and no more:

- The brand × theme matrix **resolves correctly in the emitted CSS artifact** for brands A and B, proven by a
  generated expectation table with cross-scope non-contamination assertions.
- The four non-CSS platforms carry the **base** default rather than forced-colors fallbacks, with an unchanged
  key set.
- A generated brand→semantic bridge exists for A and B **in `tokens.css`**.
- FF#22's prescribed pattern **emits a schema-valid Vega-Lite spec**.

It may **not** claim: that `data-brand` changes what an app renders (`brand.css`/`layers.css` still win at
runtime — s168), that brand reaches the MCP render path (not threaded — s168), that any certification is
brand-aware (certify has no brand input — s168), or anything about Parts Town, fonts, viz palettes, breakpoints,
or brand assets.

---

## 7. Risks

- **`:root` semantics change (D2) is consumer-visible.** Anything relying on the accidental hc default changes
  appearance. That is the fix, not a regression — state it plainly in the closeout.
- **D6 is a demolition step.** Deleting colliding leaves from `base/{motion,shadow}.json` while the alias form
  is circular means an ordering mistake produces cycles, not wrong values. The byte-identical proof is the guard.
- **Four writers, one consumer layer.** m1+m2 fix writer 1. Writers 2–4 remain and still win at runtime. Any
  claim that ignores this is an overclaim.
- **This sprint is demolition, not addition** — the first in this repo's recent history. Budget re-work time and
  prefer stopping at a proven m1 over a rushed m2.

---

## 8. Critic record (settled — do not re-litigate)

v1 was rejected on all five lenses. What changed: added D6–D10; corrected the collision arithmetic (88 + 21 =
109); removed a false claim that `build.mjs:167-204` is a collision guard (no guard exists); corrected the #1344
"mis-specified" over-correction to an additive finding; replaced m1's literal-grep oracle with a generated
expectation table; replaced m2's non-discriminating "shim first" control; pinned the selector/specificity/theme
vocabulary; scoped D3's inlining claim off the `repl.render` compact path; corrected the golden list in both
directions; pinned the composite `tokens-validate` and the `guardrails` project; cut brand-enum widening, MCP
threading, certify honesty, and `brand.css` deletion to s168.

---

## 9. Build record — gate sweep (m04)

Run **sequentially**, each by its named invocation, after `build:tokens` + `build:packages`.

| gate | baseline | measured | |
|---|---|---|---|
| `pnpm install --frozen-lockfile` | clean | clean | ✔ |
| `pnpm run tokens:collision-guard` *(new)* | — | 0 violations / 6 scopes, exit 0 | ✔ |
| `pnpm run tokens-validate` (composite) | green | green — 322 tokens, semantic lint, 32 viz checks | ✔ |
| `pnpm run check:tokens` | — | outputs up-to-date (assembly is idempotent) | ✔ |
| root `pnpm typecheck` | PASS | PASS | ✔ |
| `pnpm --filter @oods/viz-core run typecheck` | PASS | PASS | ✔ |
| `pnpm --filter @oods/viz-core exec vitest run` | 1205 / 61 files | **1205 / 61** exact | ✔ |
| root `npx vitest run --project core` | 4651 / 428 files | **4666 passed + 20 skipped = 4686 / 432 files** | ✔ |
| root `npx vitest run --project guardrails` | *new required* | 5 / 2 files | ✔ |
| `pnpm --filter @oods/mcp-server run test` | 3978 (3962+16) | **3978 (3962+16)** exact | ✔ |
| `pnpm --filter @oods/mcp-server run test:scale` | 62 | **62** exact | ✔ |

`core` reconciles exactly: 4651 baseline + 35 new tests (10 brand×theme oracle, 5 collision-guard bite-proof,
12 bridge, 8 FF#22) = 4686.

**Goldens moved: exactly one**, the one predicted.
`packages/mcp-server/src/tools/__snapshots__/dashboard.render.fidelity.test.ts.snap` — 1 line, confined to the
inlined `<style>:root{}` block; SVG panels, KPI, geo placeholder and narrative byte-identical. All 8 properties
come from `EXPORT_TOKEN_MAP` (`dashboard.render.html.ts:34-43`) and are brand A aliases now resolving to A/base
instead of hc: `fg` CanvasText→`rgb(24,35,60)`, `muted` GrayText→`rgb(80,88,105)`, `bg` Canvas→`rgb(253,243,222)`,
`panel-bg` Canvas→`rgb(245,232,206)`, `panel-border` CanvasText→`rgb(218,208,186)`, `accent` CanvasText→`rgb(24,35,60)`,
`positive` HighlightText→`rgb(24,94,67)`, `negative` HighlightText→`rgb(155,44,44)`. **It is a fix, not drift:**
`bg` and `panel-bg` were both `Canvas` (panels invisible against the page) and `positive`/`negative` were both
`HighlightText` (increasing and decreasing trends in the same colour) — the very differentiation
`dashboard.render.html.ts:30` says the brand is meant to supply.

**Stop-the-line condition held:** `packages/viz-render/test/__snapshots__/emitter.spec.ts.snap` did **not** move.

### Decision #1344 — additive correction, re-measured (not inherited)

The memo's §1 arithmetic **reproduces exactly**: 122 forced-colors keywords + 184 others
(108 durations + 54 easing tuples + 14 font stacks + 8 bare identifiers such as `solid`/`uppercase`) = 306.

Measured before → after on `dist/ios-swift/OodsTokens.swift`:

| class | before | after |
|---|---|---|
| forced-colors keywords | 122 | **0** |
| `oklch()` colours | 259 | **381** |
| durations / easing / font stacks / bare identifiers | 184 | 184 |
| **total non-compiling** | **565** | **565** |

**#1344's transform list STANDS** — its 184 are untouched and still need quoting transforms. Two things the
record should now also say: (1) the 122 became semantically *correct* but did not leave the non-compiling set —
they moved from one invalid class to another, because `oklch(...)` is not a Swift expression either; and (2) the
306 figure omitted 259 `oklch()` colour values that are equally non-compiling, so the true total is **565** and a
Swift **colour** transform is a gap wider than #1344 covers. Additive, not a supersession.

---

## 10. Charter-diff — deviations from this memo, with amendments

Four line items. Everything else was built as written.

**D1 — AMENDED. Both brands' `base.json` belong in the SHARED source layer, not per-scope.**
As written, a scope's sources were "shared-excluding-`brands/**`" + `brands/<X>/base.json` + `brands/<X>/<theme>.json`.
That configuration **hard-throws**. Probed directly on SD 4.4.0: *"Some token references (20) could not be found.
`brand.B.surface.canvas.$value` tries to reference `color.brand.B.surface.canvas`, which is not defined."*
Cause: `src/tokens/aliases/brand-B.json` is a **global** file referencing `{color.brand.B.*}`, so a run scoped to
one brand leaves 20 aliases dangling. Both brand bases now sit in the shared layer and a scope overlays only its
own theme file. The declared overlay chain `brands/<X>/base.json → brands/<X>/<theme>.json` is preserved exactly
and remains what the collision guard exempts.

**D6 — REFINED in execution.** `src/tokens/base/motion.json` was deleted **outright** (all 19 of its leaves were
exact-path duplicates of the literals in `src/tokens/motion.json`), but from `src/tokens/base/shadow.json` only
the `shadow.elevation.*` block was removed. `ref.shadow.color.subtle/strong` are declared nowhere else and had to
stay, or the flat key set changes and D7's byte-identical-key-set requirement breaks. 19 + 2 = the 21.

**D8 — SCOPED. The bridge covers 38 of the 41 slots `brand.css` assigns**, within the memo's own "~38–42" range.
`--theme-focus-ring-outer/-inner/-text` have **no brand token**; `brand.css` derives them by hand, `ring-outer`
via a `color-mix()` whose ratio is itself a design decision that varies per theme (55% light, 60% dark, flat
`Highlight` in hc). Generating them would mean the build **inventing design values that exist in no token file** —
growing the four-writers problem this sprint exists to shrink. They keep their `:root` neutral value; giving them
a brand source needs a **token**, not a generator heuristic. Recorded in code (`UNBRIDGED_SLOTS`) and in the
catalogue. The reverse gap (`accent.background/border/text` — brand tokens with no slot) is recorded alongside it.

**m3 — WIDENED. Two OODS-only keys leak into the Vega-Lite mark def, not one.** The memo named `id`
(1 occurrence). `curve` leaks identically and appears **7 times** across committed fixtures; it is a genuine
cross-renderer IR option (the ECharts adapter reads it to decide `smooth`; Vega-Lite's equivalent is
`interpolate`), so every line-chart fixture carrying it emitted a schema-invalid mark independently of FF#22.
Filtering only `id` would have satisfied the written criterion while leaving the real defect in place. Found by
enumerating `mark.options` keys across all 7,735 JSON specs and checking each against the real `MarkDef` property
list — which is precisely why the criterion demanded enumeration before filtering.

### Corrections to this memo's own numbers

- **§1 double-counts the brand namespace.** "The 122 `--oods-color-brand-*` vars plus 40 `--oods-brand-*` aliases"
  should read **82** `--oods-color-brand-*` literals + **40** `--oods-brand-*` aliases = **122** brand vars total.
  The separate D7 figure "122 of 771 flat values move off forced-colors keywords" is **correct** and was
  independently confirmed.
- **§1's "109 multiply-declared" was measured at 103** at build time. Both are right at their own moment: the
  difference is exactly the six `ref.typography.*` leaves D10 removed before the measurement.

### Inherited-oracle defects found and fixed (m1)

The m1 oracle was handed over "proven RED at HEAD, 8 failed / 1 passed". It was partly red for the wrong reasons,
and both defects had to be fixed before its green meant anything:

1. `cssVarFor()` lowercased the token path without splitting camelCase, so it asserted
   `--oods-color-brand-b-text-oninteractive` — a variable that has **never existed in any build** (SD's
   `name/kebab` emits `…-text-on-interactive`). No correct fix could have satisfied it.
2. `parseCssBlocks()` split each block body on `;` and then took the first `:`, which lands **inside the previous
   declaration's trailing `$description` comment** whenever that description contains a colon. The brand palettes
   are full of contrast ratios (`≥4.5:1`, `≥12:1`), so the declaration after every such comment was silently
   dropped — roughly 15% of every block, `:root` included. This is the dangerous one: a property the parser never
   saw can never be reported as contaminated, so it quietly weakened the cross-contamination control itself.

**Standing lesson: a test proven RED is not thereby proven CORRECT.** Verify it is red for the stated reason
before trusting its green.
