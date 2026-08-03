# Sprint-169 decision memo — corrective close-out + brand threading

**Status:** **v2, post-critic.** SSOT for the s169 build session.
**Planning session:** PS-2026-08-03-004. **Grounding:** wf_719df97b-b67 (5 agents). **Critic:** wf_6fc82d07-44c (5 lenses).
**v1 was REJECTED on all 5 lenses** — 2 distinct blockers (each found independently by 4–5 lenses), 8 distinct majors, ~12 minors. v2 disposes of every one; the record is §6B.
**Predecessor:** sprint-168 CLOSED 2026-08-03 (commit `00ae5b3`); review verdict **PARTIAL GENUINE CLOSE 5 of 7** (PS-2026-08-03-001/-002/-003). m04 and m06 were NOT closed — this sprint closes them, then makes the brand pipeline reachable over the wire.
**Standing rule 9:** the build session works from THIS FILE ONLY. **Standing rule 10:** genuine-close review is a separate session; the build never self-certifies.

---

## §0 — Derek's ratified decisions (2026-08-03)

1. **The "fix contrast at the TOKEN VALUE" ruling EXTENDS to the three newly-graded AA failures** (A/base `text.accent` on `surface.subtle` 4.27 · B/base `text.accent` on `surface.raised` 4.26 · B/base `text.accent` on `surface.subtle` 3.80). Fix the tokens — not the thresholds, not the pair set.
2. **#818 accuracy slice HELD for s170+.** s169 stays on the brand arc.
3. **Preset re-namespacing is IN**, folded into the hygiene basket (m05).
4. **Parked stays parked:** compressed interaction ramps · distinct status identity for A · full brand.css deletion / real focus tokens · PT seed (client conversation) · Swift colour transform (mobile walk) · layers.css + explorer tokens.css arc · breakpoint axis.

---

## §1 — Findings that set the sprint (review + grounding, all measured; critic corrections folded)

### F1 — m06's oracles are never executed by their own proofs
`tests/tokens/brand-root-and-containment.test.ts`: `findContainmentBreaches` (:98) and `findCorrespondingSlotLeaks` (:119) are zero-arg closures over the module-level `blocks` (:94). The seeded proofs (:203-215, :217-229) build seeded maps and never pass them to an oracle. **`return []` in either body leaves all 9 tests green.** A parameterised re-wire was **verified end-to-end in scratch**: 9/9 green at HEAD, and the `return []` mutant reds exactly the two seeded-proof tests (2 failed / 7 passed). Scratch artifacts for the build session: `scratchpad/s169-m02/{head-mutated,rewired,rewired-mutated}.test.ts`, `extended-browser-proof.mjs`, `tie-invariant-repo-wide.mjs`.

### F2 — the m04 grading surface is sparse; the defensible widening is the GRID, not everything
Full candidate sweep through the repo's own evaluator (57 templates × 4 cells at HEAD): **exactly 10 failures** — the 3 ratified `text.accent` pairs (raw 4dp: 4.2714 / 4.2616 / 3.7956) plus **7 status-ICON-on-panel candidates** (2.32–2.90 vs 3:1). All 30 status-TEXT-on-panel candidates pass; all dark-cell candidates pass. **Status-on-panel is NOT a painted pairing** — chips/banners/toasts bind status fg to the status surface (`layers.css:296-307`, `:494-534`); the sole non-status use is a decorative `aria-hidden` bar (`DeliveryHealthWidget.tsx:75-85`). Grading it would import 7 UNRATIFIED icon-token moves. The grid-only widening (+5 templates → **27 / 108**) fails at HEAD on exactly the three ratified pairs and nothing else.

Ratified fixes, **verified through the evaluator with zero regressions across the full 27×4 surface**: A/base `text.accent` `oklch(0.52 0.17 45)` → **`oklch(0.495 0.17 45)`** (subtle 4.7287, margin 0.2287; canvas rises to 5.9195) · B/base `text.accent` `oklch(0.53 0.14 238)` → **`oklch(0.48 0.14 238)`** (raised 5.2489, subtle 4.6749, margin 0.1749; canvas rises to 5.7271). Deliberately NOT A=0.500 — that is **numerically identical L** to A `accent.text` `oklch(0.5 0.17 45)` (0.5 == 0.500; not byte-identical — the strings differ) and invites de-dup confusion. (`accent.text` and `text.accent` are distinct tokens in every cell; no equality relationship exists.)

**The existing e5f2172 RED-first proof skips in CI today, and any new proof would inherit the same skip**: the coverage job (the only CI runner of the guardrails project, via `test:coverage` at ci.yml:560) checks out at depth 1, `git show e5f2172:…` fails, and the skip-branch passes proving nothing. `brand-contrast.spec.ts` is the repo's **only history-reading (`git show <sha>`) test**, and `e5f2172`/`00ae5b3` are branch commits a squash-merge can orphan — `fetch-depth: 0` fixes today's skip but not the durable one.

### F3 — tokens-governance: the collapse is repo-wide and the divergence is a dist fast-path
Root cause of HEAD-vs-SHA (grounded, reproduced): `tryLoadDistPayload` (index.ts:359-380) special-cases the LITERAL string `'HEAD'` (:360) and reads the workspace `packages/tokens/dist/tailwind/tokens.json`; for any other ref it runs `git show <ref>:…dist…` which **always fails** (dist/ is gitignored, never tracked) and silently falls back to sources. So `--head HEAD` diffs **dist-vs-sources** (235 of the 312 "modified" rows are `{ref}` alias strings vs resolved literals) while `--head <sha>` diffs sources-vs-sources. **The review's "Δ312 / 232 changed values" framing does not survive: 232 was a coincidence** (dist-only added paths), and CI never saw Δ312 — CI passes SHAs for both refs (ci.yml:290-296). The CI-visible harm is exclusively the Δ0 collapse.

The collapse is **much broader than the brand trios**: 1140 (file,path) leaf pairs → 727 unique paths → **413 shadowed pairs across 280 collided paths**. Root `tokens/base.json` shadows `base/reference/*` (39), `tokens/semantic/system.json` shadows `base/system/*` (53), `tokens/theme.json` shadows BOTH `themes/dark/*` and `themes/theme0/*` (53 each), presets collide with brands/A (21). **The fix is FILE-scoped keys.** A corrected gate over `e5f2172^→00ae5b3` reports brand A **+5/−39/Δ63** (brand-cell Δ62) and brand B Δ5 (cell Δ4). **Of the 39 removals, exactly 18 are duplicate-removed** (the brands/A `ref.typography.*` dedups — path AND identical value survive elsewhere at head); **the other 21** (base/motion.json 19, base/shadow.json 2 — both files deleted in the range) carried alias-string values that survive NOWHERE at head (the surviving files hold resolved literals under the same paths, and root `tokens/` is excluded from the m03 universe anyway) — they classify as **plain removals**. Test coverage of the tool today: **zero**, and the tool is an unexported CLI script with top-level `await main()`.

### F4 — threading: the surface is TWO tools, and the real honesty defect is a dead scan
Verified at HEAD: `normalizeBrand` defaults every render to `'default'` (document.ts:213-215); no render input schema accepts `brand` (all `additionalProperties:false`, so old clients are unaffected by adding it); the built `tokens.css` already ships 8 `[data-brand='A']` + 8 `[data-brand='B']` blocks, and `data-brand="default"` matches none — threading activates real committed CSS with zero new build machinery. `renderDocument` **already accepts and escapes `input.brand`** (tested with 'A' at document.test.ts:28-29) — only the MCP plumbing is missing. Brand-B token parity **exists**: 20 `--oods-brand-a-*` and 20 `--oods-brand-b-*` with identical name sets. The override seams **already exist**: `ComposeHtmlArgs.tokens` (html.ts:124, fallback :139) and `scanBrandContrast(tokensOverride)` (:77-78); the call sites (dashboard.render.ts:713, :657) pass nothing.

**The tool list is exactly `dashboard.render` + `repl` render** (repl duplicates the render input schema in TWO files). `viz.render` is brand-invariant end-to-end. `tokens.build` brand is a meta label (s168 negative result). `artifact.certify` grades a chart IR against **brand-invariant `:root` tokens** — **a brand input cannot change any verdict and would be a false affordance; certify gets NO brand field**, it gets an honesty sentence. `fidelity.preview` already HAS a brand input (`options.brandOverlay`) driving a hand-hexed palette **disconnected from @oods/tokens** — recorded, deferred.

**MEASURED HONESTY DEFECT:** the shipped `output.contrastScan` **grades zero pairs in production**. `contrastRatio` throws on the `rgb(r, g, b)` strings `resolveTokenToColor` emits; the try/catch at html.ts:88-93 silently skips every pair. Proven: `scanBrandContrast()` → `[]`; an all-**hex** deliberately-failing palette → 4 findings (**so a hex failing-palette test is GREEN at HEAD and proves nothing**); the same failing palette in **rgb() form** → `[]` (**only the rgb() form reds first**). When actually graded, brand-A pairs measure 5.89–14.17 and brand-B 6.27–15.46 — all genuinely pass. **The values `resolveBrandTokens` returns are ALSO inlined into the HTML export in rgb() form and pinned by the sprint-115 golden** (snap line 19: `--oods-color-fg:rgb(24, 35, 60)…`) — so the normalisation fix must live INSIDE the scan, never inside `resolveBrandTokens`.

### F5 — the browser proof and the tie invariant are narrower than their prose — and one m05 rationale is FALSE at HEAD
The proof injects **3 sheets** (generated CSS + layers.css + brand.css) — only 2 of index.css's 4 imports; **motion.css, hc.css, AND explorer tokens.css are all omitted** — and its order guard checks indices 0–1 only. Measured: the extended six-sheet proof **passes 228/228 in both injection orders** (explorer tokens.css declares 37 bridged slots only at `:root` (0,1,0); the 38th is an underscore twin `--theme-text-on_interactive`, a different name by design; hc.css and motion.css declare zero) — an honesty/coverage fix, not a wrong green. Repo-wide census at HEAD: after comma-selector splitting, declarations of the 38 bridged slots exist in exactly **14 (file :: selector :: at-context) rows** — layers.css `:root` (38), layers @supports `:root` (2), layers `html[data-theme='dark']` (38), explorer tokens.css `:root` (37), dist `:root` (38), the 8 bridge selector arms (38 each), and **`document.ts` DARK_THEME_OVERRIDES** at `[data-theme="dark"]` (38, embedded into rendered HTML alongside the bridge CSS); **declarations at ≥(0,2,0) outside the generated bridge: 0**.

**Focus slots, measured in Chromium at HEAD:** light cells resolve all three focus slots to the NEUTRAL theme0 values, **identical for brands A and B** (brand.css's light `:where()` block is (0,0,0) and loses to `:root` (0,1,0)). Dark cells ARE branded; hc cells are keyword-identical. **The claim "deleting brand.css would de-brand focus in all six cells" is FALSE at HEAD and lives in THREE places**: brand.css's header (:23-28), the bridge's UNBRIDGED_SLOTS rationale, and `tests/tokens/brand-css-no-tie.test.ts:25`. m02 corrects all three and asserts the measured split; branding light focus would be a behaviour change and is NOT chartered.

### F6 — hygiene, each verified
Presets: 3 files, all nested under `color.brand.A.*` (15/15/21 leaves), consumed by **no runtime code** — `brand.apply.ts` has ZERO preset references; the graft vector is brand.apply's free-form delta (deepMerge at document root, no namespace guard). · Stage1 sink **confirmed by execution**: `--name '../../escaped'` wrote files two directories above `--out`. · The three translations (orientation→`orient`, enableMarkers→`point`, join→`strokeJoin`) have **exact vocabulary matches** in vega-lite 6.4.1, and implementing them reds **ZERO existing tests** (measured). · The `['y','x']`→`['y']` mutation at adapter :242 is undetected today; a flipped-channel probe discriminates (verified). · Primitives: **69 of 76 are dead**, 7 live; 26 drift from source (25 dead + 1 live: `--brandB-text-accent` 0.54 vs token 0.53); the count pin is `brand-css-no-tie.test.ts:114`. · The four historical `$description` claims sit at A/dark.json:47, :52, B/base.json:42, B/dark.json:52; current measured ratios 4.9911 / 4.6004 / 4.6437 / 4.6942 (safe quote floors 4.99 / **4.60** / 4.64 / 4.69). A/base `status.warning.icon` = 3.0005 raw, no disclosure. · Cookbook `data-brand="b"` at 03-multi-brand-theming.md:99. · The four m04 hard-pinned oklch literals (brand-contrast.spec.ts:194-198): hover 0.57 / pressed 0.62 exist nowhere else in tracked source **outside the historical drift record `artifacts/tokens/brand-css-drift-s167.md:102-103`** — they pin deleted history by design.

---

## §2 — The slate (Derek-ratified shape)

**DAG: m01, m02, m03 independent roots · m04 requires m01 (SOFT — no file or value dependency, parallel-safe; the edge is thematic ordering only and the build may reorder without a deviation record) · m05 requires m01 (HARD — m05's survivor-tie test asserts against post-m01 token values, and both edit brand.css/brand-css-no-tie.test.ts) · m06 requires all.**

| id | mission | size |
|---|---|---|
| m01 | m04-corrective — brand contrast grading made TRUE | M |
| m02 | m06-corrective — controls made REAL | M |
| m03 | tokens-governance truth-up | M |
| m04 | MCP brand threading + render-honesty fix | M |
| m05 | hygiene basket | S |
| m06 | closeout — mandatory per-mission charter-diff | S |

---

## §3 — Mission charters

### m01 [M] — brand contrast grading made TRUE

1. **Widen `BRAND_CONTRAST_PAIRS` by exactly the 5 grid templates** — `text-secondary-on-raised`, `text-secondary-on-subtle`, `text-muted-on-raised`, `text-accent-on-raised`, `text-accent-on-subtle` → **27 templates / 108 rules**. Do NOT add status-on-panel; record the exclusion in the brand-rules.ts comment block the way `text.disabled`'s is, citing the chip/banner/toast binding (`layers.css:296-307`, `:494-534`) and the decorative exception (`DeliveryHealthWidget.tsx:81`).
2. **Token moves (§0.1, verified zero-regression):** A/base `text.accent` → `oklch(0.495 0.17 45)`; B/base `text.accent` → `oklch(0.48 0.14 238)`. ΔL only. NOT 0.500 for A (numerically identical L to `accent.text`).
3. **Update the two live brand.css primitives in the same commit**: `--brandA-text-accent` (brand.css:58) and `--brandB-text-accent` (:131) to the new values (B is ALREADY drifted 0.01 at HEAD; leaving it widens the drift to 0.06 on the ungraded focus color-mix). No test pins the focus values today — m05 adds the survivor-tie test.
4. **resolveColorSample switch** at brand-contrast.spec.ts:106-107 (mechanical; export exists; cannot throw on current cells).
5. **RED-first goes VENDORED, and the skip path dies.** Vendor the pre-m03 (`e5f2172`) and pre-m01 (`00ae5b3`) brand cells as fixtures — 8 small JSON files (2 brands × 2 graded themes × 2 revisions), generated mechanically via `git show`, **provenance recorded in a top-level `"$source"` key** (e.g. `"$source": "e5f2172:packages/tokens/src/tokens/brands/A/base.json"` — `cellTokenMap`'s walker ignores non-`$value` keys; **JSON admits no comments**, so a header comment would break `JSON.parse`). Delete the null-skip branch entirely. Rationale over `fetch-depth: 0`: the coverage job is the only runner of this spec and is depth-1 today; this spec is the repo's only **history-reading** (`git show <sha>`) test — m02's new census uses index-only `git ls-files`, which shallow checkouts do not break; and branch commits are mortal to squash-merge GC. Trade stated: fixtures freeze bytes that history rewrites can orphan from auditability.
6. **The EXISTING e5f2172 RED-first list grows 5 → 8** in the same commit as the template widening (add `brand-a-base-text-accent-on-subtle`, `brand-b-base-text-accent-on-raised`, `brand-b-base-text-accent-on-subtle`; measured pre-m03 values 4.2714 / 4.0983 / 3.6502). Count assertions auto-scale via `BRAND_CONTRAST_PAIRS.length`. **The NEW proof** against the 00ae5b3 snapshot must name exactly the 3 ratified ids with the remaining 105 passing in the same run.
7. **$descriptions**: B/base `text.accent` → "Measured ≥5.72:1 on canvas (sRGB-clipped)". Any numeric claim MUST be about the canvas pair — `PAIR_FOR_CLAIM['text.accent']` maps ALL text.accent claims to canvas (brand-description-truth.spec.ts:75).
8. **Build order**: token JSONs → `pnpm --filter @oods/a11y-tools build` (root vitest resolves the package to dist) → guardrails. Forbid drive-by warning-token edits (A/base `status.warning.icon` sits at 3.0005 raw).

**Predicted movement:** guardrails 14 → ~15-16 tests, same 4 files. Dashboard fidelity goldens do NOT move (no `text.accent` in EXPORT_TOKEN_MAP or any snap — grep 0). collision-guard / check:tokens / tokens:guardrails are measured no-ops. tokens-governance emits a diff but no contrast finding (`accent` fails its last-segment predicate at index.ts:1150 — recorded, not fixed here).

**Claim ceiling.** "The grid is the declared graded surface, every graded pair passes (fixed pairs with ≥0.1 margin), and both RED-first proofs run everywhere including CI." NOT "brand output is accessible" — status-on-panel excluded and documented, hc exempt, pair set bounded.

### m02 [M] — controls made REAL

1. **Oracle re-wire (verified in scratch):** `findContainmentBreaches(cssBlocks: Map<string, Map<string,string>>)` / same for `findCorrespondingSlotLeaks`; rename ONLY the three reads inside the two oracles (**:102, :124, :125**) — the four test-side `blocks.get` reads (**:153, :179, :258, :262**) stay; real-artifact tests pass `blocks`.
2. **Seeded proofs THROUGH the oracles**, asserting the exact report strings (verified verbatim): containment → `"[data-brand='A'][data-theme='dark'] declares --oods-color-brand-b-surface-canvas, which belongs to brand B"`; corresponding-slot → `` `A/base --oods-color-brand-a-surface-canvas carries brand B's value for slot surface-canvas ("${bValue}")` ``. Keep the unseeded-[] controls and the :223 aValue≠bValue precondition. **Mutation proof:** `return []` at the top of either oracle reds exactly that oracle's seeded test (measured: 2 failed / 7 passed with both gutted).
3. **Browser proof: derive SHEETS from the parsed import list** — generated CSS first, then every index.css import in order, then explorer tokens.css LAST (worst case for `:root` masking; green-at-last covers every real position). Keep the @import-strip and the layers-imports-generated guard. **Order guard asserts the FULL list** `['layers.css','brand.css','motion.css','hc.css']`; because SHEETS derives from it, guard and injection cannot diverge. Bridged-slot assertion count stays **228** (verified six sheets, both orders; selftest still exits 1).
4. **Focus-slot assertion group (+18 = 246 total): assert the MEASURED split** — light: A/base == B/base == neutral; dark: cascade == brand.css's literals per brand (two-probe pattern); hc: A == B. **Correct the FALSE "de-brand focus in all six cells" claim in all THREE homes in the same change**: brand.css header (:23-28), the bridge's UNBRIDGED_SLOTS rationale, and `tests/tokens/brand-css-no-tie.test.ts:19-29`. Branding light focus is NOT this mission.
5. **Repo-wide specificity census — NEW test `tests/tokens/bridged-slot-specificity-census.test.ts`**: sources = `git ls-files '*.css'` (tracked only) + `packages/tokens/dist/css/tokens.css` + the `DARK_THEME_OVERRIDES` template literal sliced from `document.ts` (indexOf + backtick walk — a global backtick regex mis-pairs and captured 0 declarations in grounding). Parse brace-aware; take each block header as the text after the last `;` (**the @import trap silently dropped layers.css's 38 `:root` declarations in grounding until handled**); split comma selectors; normalise quote style; `:where()` = 0, `:root` = (0,1,0). **Assertions:** (a) every declaration of a bridged slot at specificity **≥ (0,2,0)** is in the generated dist CSS with selector matching `^\[data-brand='[AB]'\]\[data-theme='(base|light|dark|hc)'\]$`; (b) **pin the exact 14-row census** (layers `:root` 38 · layers @supports `:root` 2 · layers `html[data-theme='dark']` 38 · explorer tokens.css `:root` 37 · dist `:root` 38 · 8 bridge arms × 38 · document.ts `[data-theme="dark"]` 38) so a new declarer AND a parser regression both surface as census diffs; (c) seed-prove: a scratch (0,2,0) declaration outside the bridge must be reported. Explorer tokens.css is 37 by design (the underscore twin) — do not "fix" it. The census asserts SPECIFICITY only, never cross-writer value equality.

**Predicted movement:** brand-root-and-containment stays 9 tests (stricter internals); census file is new; proof console line moves 228→246 (no consumer greps the literal — verified). CI's `verify:brand-cascade` (ci.yml:439) must stay exit 0 with the selftest still exit 1.

**Claim ceiling.** "The oracles discriminate with mutation proofs, the proof covers every sheet in the real graphs, and the census pins every declarer of every bridged slot." NOT "the brand pipeline is proven end-to-end", and NOT "light focus is branded" — it is not, and the sprint records that truthfully.

### m03 [M] — tokens-governance truth-up

1. **Delete the dist fast-path entirely** (`tryLoadDistPayload`, `buildFlatTokenMapFromDist`, `approximateSourceHint`, `TOKEN_DIST_PATH` — index.ts:138, 350-414, 809-827). Dead in CI, single-cell by construction, value-incompatible. This alone kills the HEAD-vs-SHA divergence.
2. **Every ref through git, including 'HEAD'** — drop the workspace special-cases (:417-419, :589-593). Trade disclosed: uncommitted local edits become invisible to a local run; local becomes byte-identical to CI.
3. **FILE-scoped map keys** — `${state.filePath}::${entry.path}` at :500. **Constraint:** `entry.path`/`entry.key`/`cssVariable` stay UNSCOPED (`buildSearchStrings` :1032-1041 greps the codebase for them). Dedupe orphan/leak findings by path.
4. **Contrast grouping cell-scoped** — group key `${sourceFile}::${prefix}` (today :1075 groups by dot-prefix only).
5. **Align the universe with the build:** exclude `packages/tokens/src/presets/**` and the repo-root `tokens/` directory from discovery (the build reads neither). Prefix exclusion is sufficient.
6. **`duplicate-removed` classification:** a removed entry whose path AND identical value survive in another file at head is its own low-risk kind. **Expected split on the acceptance range: exactly 18 of the 39 removals classify duplicate-removed** (the brands/A ref.typography dedups); **the other 21** (base/motion.json 19 + base/shadow.json 2, alias values surviving nowhere) **classify as plain removals** — a classifier reporting 39/39 or 21/39 is wrong, and the build must not "fix" it toward either.
7. **RED-first unit tests on the pure functions** — which requires making them testable: **export** `collectDtcgTokens`, `computeTokenDiff`, `filterTokensForBrand`, the new duplicate-removed classifier, and the contrast grouping; **move the top-level `await main()` behind an entry guard** (`if (import.meta.url === pathToFileURL(process.argv[1]).href)`) so importing the module does not execute the CLI (byte-identical CLI behaviour); **tests live at `tests/tokens-governance/*.test.ts`** so the root `core` project (glob `tests/**`) runs them in CI. Cover: file-scoped keying (two fixtures sharing a path → two entries), diff on composite keys, cell-scoped contrast grouping, duplicate-removed vs plain-removed (one fixture pair per class).
8. **Risk rules stay BYTE-UNTOUCHED.** Disclose loudly: a truthful gate now actually demands the `token-change:breaking` label on token-touching PRs — **including THIS sprint's own PR**: m01's two `text.*` modifications are 'text'-segment tokens → high risk → `requiresBreakingLabel` → the enforce step (ci.yml:338-343) reds without the label. **That is the gate working, not a defect.** m06 records the expected `requiresBreakingLabel=true` via the CI-shaped invocation; applying the label to the PR is Derek's step, named in the closeout handoff.

**Acceptance (measured targets):** `pnpm run tokens:governance -- diff --brand A --base e5f2172^ --head 00ae5b3` flips **Δ0 → +5/−39/Δ63** (with exactly **18** of the 39 classified duplicate-removed; brand-cell Δ62 must appear regardless of the universe choice); brand B Δ5 (cell Δ4). `--head HEAD` and `--head <HEAD-sha>` byte-identical on a clean tree.

**Claim ceiling.** "The gate sees per-file token changes, local and CI take the same path, and the s168 range is re-reported truthfully." NOT "the governance risk model is right" — risk rules untouched, label workflow now live.

### m04 [M] — MCP brand threading + render-honesty fix

**Requires m01 (SOFT — no file/value dependency; parallel-safe).**

1. **Scope: `dashboard.render` + `repl` render. Nothing else.** `artifact.certify` gets NO brand field — brand cannot change any verdict (brand-invariant `:root` operands); add the one-sentence honesty note to its description/docs. viz.render / design.compose / code.generate / tokens.build / brand.apply need nothing. `fidelity.preview.brandOverlay` recorded and DEFERRED.
2. **Input field:** optional `brand`, `enum: ["A","B"]`, **NO default**, in `dashboard.render.input.json` AND both `repl.render.input.json` + the duplicated render branch in `repl.input.json` (add brand-bearing parity payloads to repl.group.test.ts — the payload-level parity test won't catch a one-sided edit). Absent ⇒ byte-identical today's output. **Do NOT default repl's brand to 'A'** (document.test.ts:12-14 pins 'default', correctly). Emit uppercase 'A'/'B' exactly.
3. **dashboard.render plumbing:** parameterise `EXPORT_TOKEN_MAP` by brand suffix (20-name parity verified); resolve ONCE in the handler; pass the same map through the EXISTING seams — `tokens` at dashboard.render.ts:713 and `tokensOverride` at :657. Echo `brand` in `output.output` only-when-supplied (the additive-spread pattern); add optional `brand` to `dashboard.render.output.json`'s output block.
4. **FIX THE DEAD SCAN — first-class deliverable, with the seam named.** Normalise **INSIDE `scanBrandContrast`** (per-pair, before `contrastRatio` — the certify-contrast.ts:119 pattern), **NEVER inside `resolveBrandTokens`**: the resolved map is also inlined into the HTML export in rgb() form and pinned by the sprint-115 golden (snap line 19) — normalising at the source moves that golden. **RED-first must use a deliberately failing palette written in the `rgb(r, g, b)` form `resolveTokenToColor` actually emits** (a hex failing palette is GREEN at HEAD and proves nothing), passed via `tokensOverride`. **Add a graded-pairs count to the a11yContrast summary AND a default-path assertion `graded === CONTRAST_PAIRS.length (4)` through the production `resolveBrandTokens` path** — the count must be asserted, not merely emitted, or a future format drift silently skips again.
5. **THE ONE CHARTERED GOLDEN MOVEMENT (#564 exception, declared here):** adding `gradedPairs` to the a11yContrast summary moves, by exactly one added field, (a) the a11yContrast block snapshot in `dashboard.render.fidelity.test.ts` (:210 toMatchSnapshot; expected new bytes `{findings: [], summary: {failing: 0, gradedPairs: 4}}`), (b) the strict toEqual at :209, (c) the two summary toEquals at `dashboard.render.test.ts:566` and `:568`, and (d) the `$defs/a11yContrast` summary block in `dashboard.render.output.json` (additionalProperties:false). **Update all five in the same commit as the scan fix. Any OTHER snap diff sprint-wide stops the line.**
6. **repl plumbing:** thread `input.brand` into the `renderDocument` call (repl.render.ts:318, document format only; fragments ignore it — say so in the schema description). `renderDocument` needs zero changes.
7. **File sweep:** dashboard.render → input.json, output.json, `generated.ts` (schemas-tools generate), dashboard.render.ts, dashboard.render.html.ts (including its stale header comment :27-33), **dashboard.render.fidelity.test.ts + its `__snapshots__` .snap + dashboard.render.test.ts** (the chartered golden movement), docs/api (docs:api regen), **`packages/mcp-adapter/tool-descriptions.json`** (NOT in mcp-server — the only sweep file in another package). repl → repl.render.input.json, repl.input.json, generated.ts, repl.render.ts, docs/api, tool-descriptions.json. NOT touched: tools/types.ts, panel.tsx, public-types.ts. Budget a four-lens sweep for stale "brand-a only" prose.
8. **Closeout half:** rebuild mcp-server, **pm2 restart oods-forge-bridge (mine)**, live-verify over :4466 — `brand:'B'` accepted on dashboard.render, absent-brand output byte-identical, `brand:'C'` rejected OODS-V001 — then `info_push` to `cmos://derek/forge-demos` (public MCP schema change; s168 precedent).

**Predicted movement: ZERO goldens EXCEPT the one declared in item 5.** All other verification held in grounding: the fidelity `:root` snap byte-matches current brand-A resolution; output-echo defaults are pinned and preserved by the spread; gates `generate:check`, `docs:api -- --check`, `generate:schema-types -- --check`, root typecheck, the exact ci.yml:659 colocated-golden invocation.

**Claim ceiling.** "An agent can request brand A or B on dashboard HTML exports and repl documents; the contrast scan actually grades what it claims to grade, and asserts HOW MANY pairs it graded; absent-brand output is byte-identical except the declared summary field." NOT "Forge is brand-aware everywhere."

### m05 [S] — hygiene basket

**Requires m01 (HARD — the survivor-tie test asserts against post-m01 token values; both edit brand.css and brand-css-no-tie.test.ts).**

1. **Presets re-keyed BRAND-RELATIVE** (strip the `color.brand.A` wrapper; document that the applier wraps as `{color:{brand:{<brand>: preset}}}`). Do NOT duplicate per brand; do NOT add a preset-loading path to brand.apply (none exists). **Rewrite `brand-presets.spec.ts` in the same change** (~18 assertions address `preset.color.brand.A`; assert brand-relative shape + deep-mergeability against BOTH brands). **Add the delta-namespace guard in brand.apply's alias path**: reject deltas addressing `color.brand.<X>` where X ≠ the input brand (new OODS-V code, RED-first with the measured cross-brand graft). **This is a public MCP behaviour change — m06's loop-closure covers it alongside m04's schema change.** Fix the style-dictionary.config.cjs comment ("15-leaf deltas" — dark-minimal is 21).
2. **Stage1 sink**: containment at the `writeJson` choke point — reject when `dirname(target) !== outDir` (exit 2, the CLI's usage-error convention). Covers all three writes. Slugs already safe.
3. **Translate all three mark options** (exact vocab matches): `orientation`→`orient`, `enableMarkers`→`point`, `join`→`strokeJoin`, value-guarded exactly like `curve`; out-of-vocab drops. Movement is ADDITIVE ONLY (measured); new translate + out-of-vocab tests mirroring the curve pair; adapter comment updates; the orient caveat (Vega-Lite ignores explicit orient on stacked charts — value-faithful, not layout-swapping). Do not touch the `MARK_DEF_PROPERTIES` text block (a regex-derivation test reads it).
4. **`else x` baseline control**: flipped-channel probe — assert `encoding.x.scale.zero === true` AND `encoding.x.scale.type === 'linear'` (merge, not replace) AND y has no `scale.zero`. Verified green at HEAD, red under the `['y']` mutation.
5. **Primitives**: delete all **69 dead**; keep the 7 live; move the count pin at brand-css-no-tie.test.ts:114 from 76 → 7 in the same commit (canary pins :117-119 stay). **Add the survivor-tie test**: each remaining `--brand<X>-<path>` value equals the corresponding path's `$value` in `brands/<X>/base.json` — the test that would have caught the 0.54 drift. (m01 already fixed the two text-accent values; B focus visuals shift with it — no snapshot pins them, measured.)
6. **$description rewrites** (current-fact only; quote AT OR BELOW the measured floor): A/dark hover → 4.99:1 · A/dark pressed → **4.60:1** · B/base default → 4.64:1 · B/dark pressed → 4.69:1. Keep the ΔL rationale prose; drop the ratified/previous numbers (history lives in brand-contrast.spec.ts:193-220). Add the A/base `status.warning.icon` zero-margin disclosure ("measured 3.0005:1 — clears the 3:1 non-text minimum with almost zero margin").
7. **Cookbook** `data-brand="b"` → `"B"`. **Frozen literals stay in place** (brand-contrast.spec.ts:194-198) with a comment: values are the s168-ratified brand.css dark ramp whose source m05 deleted; frozen BY DESIGN; a disclosed exception to the no-hard-pinned-oklch rule; cross-reference `artifacts/tokens/brand-css-drift-s167.md:102-103` (the only other tracked home of those values) and the s168 memo §8 note.
8. **Land the s168 memo §8 corrections table** — with ONE amendment first: its closing "reported Δ0 for this sprint's 232 changed values" sentence must be corrected per §6.2 (the 232 was the added-row count of the broken dist-vs-source run; the corrected source-level report is +5/−39/Δ63). Land the rest as verified.

**Claim ceiling.** "Each item exactly as measured; the behaviour changes are: m01's knock-on, the B-focus shift from fixing the live drift, **the brand.apply cross-brand-delta rejection (new public OODS-V code)**, **the Stage1 out-of-dir exit 2**, and **the three newly-translated mark options** — each disclosed here and nowhere silently."

### m06 [S] — closeout

Full gate sweep by NAMED invocation, sequential. **Line-item charter-diff for EVERY mission — all six, no exceptions.** Per-golden review under the #564 exception — **prediction: ZERO golden movement sprint-wide EXCEPT the ONE declared in m04.5** (the a11yContrast summary field); any other movement stops the line. **Consumer loop-closure covers BOTH m04's public schema change AND m05's brand.apply cross-brand-delta rejection**; pm2 bridge restart + live verify (mine). **Governance label handoff:** run the CI-shaped invocation (`--base $(git merge-base HEAD OODS-pro) --head <HEAD sha> --labels token-change:breaking`), record the expected `requiresBreakingLabel=true` (m01's text.* moves are high-risk by the untouched rules — the gate working); applying the label to the PR is Derek's step, named in the handoff. Deviations amend THIS memo in the same change. NOT self-certified.

| # | gate | invocation | baseline → expected after s169 |
|---|---|---|---|
| 1 | lockfile | `pnpm install --frozen-lockfile` | clean |
| 2 | packages | `pnpm run build:packages` | — |
| 3 | viz-core | `pnpm --filter @oods/viz-core exec vitest run` | 1205/61 → +m05's additive viz tests, reconciled per mission |
| 4 | root core | `npx vitest run --project core` | 4729+20/434 → + m02 census + m03 governance tests + m05 additions, reconciled per mission |
| 5 | guardrails | `npx vitest run --project guardrails` | 14/4 → 15-16/4 after m01 |
| 6 | mcp-server | `pnpm --filter @oods/mcp-server run test` (after build:packages) | 3978+16 → + m04/m05 additions, reconciled |
| 7 | scale | `pnpm --filter @oods/mcp-server run test:scale` | 62, exact |
| 8 | tokens | `pnpm run tokens-validate` (HYPHEN composite) | green, 32 viz checks |
| 9 | collision guard | `pnpm run tokens:collision-guard` | 0 / 6 scopes |
| 10 | idempotence | `pnpm run check:tokens` | up-to-date |
| 11 | lint | `pnpm run lint:tokens` + repo `pnpm run lint` + the four specialty lints (`lint:enum-convergence`, `lint:enum-to-token`, `lint:audit-log`, `lint:brand-bleed`) | green |
| 12 | typecheck | root `pnpm typecheck` | PASS |
| 13 | typecheck | `pnpm --filter @oods/viz-core run typecheck` | PASS |
| 14 | docs API | `pnpm -w run docs:api -- --check` | fresh, no orphans |
| 15 | generator A | `pnpm --filter @oods/schemas-tools run generate:check` | exit 0 |
| 16 | generator B | `pnpm run generate:schema-types -- --check` | unchanged |
| 17 | browser proof | `pnpm run verify:brand-cascade` (+ SELFTEST=1 exits 1) | 228/6 → **246/6 after m02** |
| 18 | **NEW** governance acceptance | `pnpm run tokens:governance -- diff --brand A --base e5f2172^ --head 00ae5b3` | post-m03: **+5/−39/Δ63, 18 duplicate-removed** (was Δ0); HEAD-vs-SHA byte-identical |
| 19 | colocated goldens | the exact ci.yml:659 invocation | 12 files pass; only the m04.5 declared movement |
| 20 | coverage leg | `pnpm run test:coverage` | passes — **this is where the m01 vendored-fixture proofs execute in CI**; verify they RUN (not skip) |
| 21 | a11y contract | `pnpm run a11y:diff` (rebuilds tokens first) | no new violations; report churn is timestamps only |
| 22 | remaining CI legs | `pnpm --filter @oods/viz-render test` · `pnpm --filter @oods/mcp-bridge test` · `pnpm tenancy:check` · `node scripts/validate-diagnostics-schema.mjs` · `pnpm run build` · `pnpm run build-storybook` · `node scripts/state-assessment.mjs --guardrails --tokens` | green — every remaining blocking `run:` line of ci.yml, executed as written |

---

## §4 — Explicitly deferred (measured reasons)

- **Status-on-panel grading** — 7 real icon failures exist but the pairing is unpainted and fixing them means unratified icon-token moves. Needs a Derek ruling + design pass.
- **`fidelity.preview.brandOverlay` unification** — hand-hex palettes disconnected from @oods/tokens; its own small mission.
- **Branding light-cell focus** — a behaviour change; currently light focus is neutral and m02 pins that truthfully.
- **Governance risk-model tuning** — m03 deliberately isolates the keying fix.
- **tokens-governance contrast predicate** (`accent` excluded at :1150) — recorded in m01, not fixed.
- Standing parked list per §0.4.

---

## §5 — Standing rules in force

Rules 1–14 as recorded in the s168 memo §5, plus three new (each paid for in the s168 review):

15. **BLAST RADIUS BEFORE SEVERITY:** a finding is not a finding until its consumers are enumerated. Zero consumers = dead code, not a defect.
16. **Rule 13 SHARPENED — the enforcing caller's EXACT ARGUMENTS:** `--head HEAD` vs the CI job's SHA gave opposite verdicts on identical content.
17. **Count auditor results and refuter verdicts separately** before quoting an adversarial total.

---

## §6 — Grounding corrections record (planning premises refuted by measurement; not to be re-raised)

1. *"Scope the governance map key by brand×theme"* — TOO NARROW: 413 shadowed pairs at HEAD, brand trios only 82. File-scoped keys subsume brand×theme.
2. *"The gate reported Δ0 for 232 changed values"* — 232 was a coincidence (dist-only added paths in the broken HEAD run). Corrected gate: Δ63 / Δ5. CI never saw Δ312.
3. *"brand.apply's preset path"* — does not exist; presets are consumed by no runtime code; the graft vector is the free-form delta.
4. *"Translating the three options reds the s167 drop assertions"* — FALSE; movement is additive only.
5. *"25 dead primitives"* — 69 dead; 25 is dead-AND-drifted. Pin moves 76 → 7.
6. *"artifact.certify needs a brand input"* — it must NOT get one; the honesty deliverable moved to the dead contrastScan fix (a real measured defect).
7. *"accent.text == text.accent relationship"* — no such relationship in any cell.
8. *"brand.css supplies branded focus in light cells"* — FALSE at HEAD, in three homes (brand.css header, UNBRIDGED_SLOTS, brand-css-no-tie.test.ts:25); m02 corrects all three.

## §6B — Critic record (wf_6fc82d07-44c; v1 REJECTED on 5/5 lenses)

**Blockers accepted and fixed in v2:** the m04 graded-pairs count vs ZERO-golden contradiction (found by all five lenses — the a11yContrast summary is snapshot-pinned AND strict-toEqual-pinned in the gate-19 invocation; → m04.5 declares the one movement and enumerates all five artifacts to update) · the "39/39 duplicate-removed" premise (measured 18/39; the other 21 carried alias values surviving nowhere; → F3, m03.6, acceptance).
**Majors accepted:** census is 14 rows, not 13 (comma-split of dist's combined base,light selectors; → F5, m02.5) · m05's ceiling omitted three of its own behaviour changes and m06's loop-closure omitted the brand.apply guard (→ m05 ceiling, m06) · m03's unit tests were un-runnable as chartered (no exports, top-level `await main()`, no project glob; → m03.7 charters exports + entry guard + `tests/tokens-governance/`) · the gate table missed eleven blocking CI legs incl. test:coverage — the only CI runner of the proofs m01 re-wires (→ gates 20-22) · the s169 PR itself trips the now-real breaking-label gate (→ m03.8 + m06 handoff) · normalising inside `resolveBrandTokens` would move the sprint-115 HTML golden — the seam is scan-side only (→ m04.4) · a hex failing palette is green at HEAD — RED-first must use the rgb() form, and the graded count must be ASSERTED on the production path (→ m04.4).
**Minors folded:** fixture provenance via `"$source"` key (JSON has no comments) · `packages/mcp-adapter/tool-descriptions.json` full path · "numerically identical L", not byte-identical · one existing RED-first proof today, not two · m01.5 rationale reworded to "history-reading test" (m02's census is index-only) · third "de-brand" home chartered (m02.4) · the frozen literals also live in `artifacts/tokens/brand-css-drift-s167.md:102-103` · m05.8 lands §8 with its 232-sentence corrected · gate baselines annotated with expected post-sprint values · m04→m01 edge marked SOFT/parallel-safe · m02.1 blocks.get sites corrected (:102/:124/:125 oracle-internal; :153/:179/:258/:262 test-side).

---

## §7 — Build record (line-item charter-diff, rule 11 — filled by the build session, one table per mission, no exceptions)

### m01 — brand contrast grading made TRUE

Every measured number in §1 F2 reproduced **before** any edit (probe through the repo's own evaluator against the built `@oods/a11y-tools`): widened grid at HEAD = 108 graded / 3 failures at 4.2714 · 4.2616 · 3.7956; the ratified moves clear to 4.7287 · 5.2489 · 4.6749 with canvas rising to 5.9195 / 5.7271 and zero regressions across all 108; the `e5f2172` sweep yields 8 ids; the `00ae5b3` sweep yields exactly 3 with 105 passing; A/base `status.warning.icon` = 3.0005.

| # | chartered | shipped | diff |
|---|---|---|---|
| 1 | +5 grid templates → 27/108; status-on-panel exclusion documented with the `layers.css` + `DeliveryHealthWidget` citations | `BRAND_CONTRAST_PAIRS` = 27, rules = 108. Templates inserted in grid order (4 text roles × 3 panels contiguous) rather than appended. Two comment blocks added: the grid is now declared AS a grid, and the status-on-panel exclusion cites `layers.css:296-307`, `:494-534` and `DeliveryHealthWidget.tsx:81`, with the 7 icon failures (2.32–2.90 vs 3:1) and the 30 passing status-TEXT candidates both recorded | **as chartered** (ordering is cosmetic; ids and count unchanged) |
| 2 | A/base `text.accent` → `oklch(0.495 0.17 45)`; B/base → `oklch(0.48 0.14 238)` | both applied, ΔL only | **as chartered** |
| 3 | `brand.css:58` and `:131` updated in the same commit | `--brandA-text-accent` → `oklch(0.495 0.17 45)`; `--brandB-text-accent` → `oklch(0.48 0.14 238)` (closing the pre-existing 0.01 B drift rather than widening it to 0.06) | **as chartered** |
| 4 | `resolveColorSample` at brand-contrast.spec.ts:106-107 | switched, `resolveFlatToken` import dropped; comment records WHY (the evaluator's path is resolve **plus** `normaliseColor`, so the map-lookup-only control did not cover conversion) | **as chartered** |
| 5 | vendored fixtures with `$source`; skip path deleted | 8 files at `testing/a11y/__fixtures__/brand-cells/{e5f2172,00ae5b3}/{A,B}-{base,dark}.json`, generated mechanically via `git show`; **verified value-identical to the git sources for all 8** (the only byte difference is `\uXXXX` escapes vs literal UTF-8 in 2 of 8 descriptions — parsed values match exactly). Skip branch deleted; `$source` is **asserted**, not merely present | **as chartered, plus** a provenance assertion the charter did not require |
| 6 | e5f2172 list 5→8; new 00ae5b3 proof naming exactly 3 with 105 passing | both shipped; counts auto-scale via `BRAND_CONTRAST_PAIRS.length`; the new proof additionally pins the literal 105 | **as chartered** |
| 7 | B/base `text.accent` `$description` → canvas claim | B rewritten to "Measured ≥5.72:1 on canvas (sRGB-clipped)" + ΔL rationale | **DEVIATION — see below** |
| 8 | build order token JSONs → a11y-tools build → guardrails; no warning-token edits | followed; A/base `status.warning.icon` untouched at 3.0005 | **as chartered** |

**Deviation (item 7).** The charter named only B's `$description`. **A/base `text.accent`'s was also rewritten** — prose only, no ratio — because its value moved and the file's own convention (e.g. `surface.interactive.primary.default`) is that a moved token records its ΔL rationale. A silently-moved value with a stale description is the exact drift `brand-description-truth.spec.ts` exists to catch.

**A trap avoided, recorded because the first draft walked into it.** Both rewrites initially quoted the *subtle* and *raised* ratios (4.27 / 4.26 / 3.80). `PAIR_FOR_CLAIM['text.accent']` maps **every** `text.accent` claim to the **canvas** pair, so those numbers would have been graded against canvas (5.92 / 5.73) and **passed — while being about a different surface**. True by accident is the failure mode that spec exists to prevent, so the non-canvas numbers were removed and both descriptions now say in prose why no other ratio is quoted.

**Movement vs prediction.** Predicted "guardrails 14 → ~15-16 tests, same 4 files"; **actual 14 → 15, same 4 files**. Predicted no-ops all held, run and confirmed: `build:tokens` ✓, `check:tokens` up-to-date ✓, `tokens:collision-guard` 0 collisions / 6 scopes ✓, `tokens-validate` green with 32 viz checks ✓, `tests/tokens` 67/67 ✓. `text.accent` appears in **zero** mcp-server snapshots or `EXPORT_TOKEN_MAP` (grep 0) — no golden moved. No tracked file pins the old literals.

**Mutation proofs run (all three discriminate, all restored):** removing one vendored fixture → hard ENOENT failure (the old code would have *skipped and passed*); tampering one `$source` → named provenance failure; reverting the A token move alone → reds exactly `brand-a-base-text-accent-on-subtle: 4.27 < 4.5`, one assertion, nothing else.

### m02 — controls made REAL

| # | chartered | shipped | diff |
|---|---|---|---|
| 1 | both oracles take `cssBlocks`; rename ONLY the three oracle-internal reads (:102, :124, :125); the four test-side reads stay | exactly those three renamed; `:153`, `:179`, `:258`, `:262` untouched; real-artifact tests pass `blocks` | **as chartered** |
| 2 | seeded proofs THROUGH the oracles asserting the exact report strings; keep the unseeded-`[]` controls and the aValue≠bValue precondition; `return []` reds exactly the two seeded tests | both proofs routed through the real functions; both report strings asserted verbatim; both `[]` controls kept; precondition kept. **Mutation: both oracles gutted → 2 failed / 7 passed**, and the two reds are exactly the two seeded proofs | **as chartered, measured** |
| 3 | SHEETS derived from the parsed import list; explorer tokens.css LAST; order guard asserts the FULL list; bridged count stays 228 | `SHEETS` is built from `importOrder`, so guard and injection are the same object; six sheets inject in real order; bridged assertions 228 in both orders | **as chartered** |
| 4 | focus group +18 → 246; assert the measured split; correct the FALSE de-brand claim in all THREE homes | 18 focus assertions (6 cells × 3 slots, two-probe), **total 246, exit 0, SELFTEST exit 1**. Claim corrected in brand.css's header, the bridge's `UNBRIDGED_SLOTS` rationale (block + all three `reason` strings), and `brand-css-no-tie.test.ts` | **as chartered, plus two additions — see below** |
| 5 | new `bridged-slot-specificity-census.test.ts`; ≥(0,2,0) only in the bridge; exact 14-row census; seed-proof | shipped, 5 tests. All three sources wired (tracked `.css` via `git ls-files`, dist CSS, `DARK_THEME_OVERRIDES` via indexOf+backtick walk). **The 14-row census reproduces exactly**, `document.ts` included | **as chartered, plus a second seed** |

**Additions beyond the charter (each disclosed, none silent).**
1. **The browser proof's SELFTEST now injects TWO masks**, one per assertion group. With only the original bridged-slot mask, a green self-test vouched for nothing about the 18 new focus assertions.
2. **A structural guard on brand.css's `:where()` wrapper** — see the correction below for why it was necessary.
3. **A second census seed**: a rogue file copying the bridge's SELECTOR is still reported. The allowance is file **and** selector; selector alone would let any stylesheet re-enter the tie by naming the same block.

**CORRECTION TO F5's STATED REASON (measured; the conclusion stands, the mechanism was incomplete).** F5 says light focus is neutral because brand.css's light block is `:where()` → (0,0,0) and loses to `:root` → (0,1,0). Measured per attribute state, there are **two different reasons** and only one is the one F5 names:

| state | brand.css light block | why light focus is neutral |
|---|---|---|
| `data-brand=A`, no `data-theme` | MATCHES | `:where()` = (0,0,0) loses to `:root`. **F5's reason, confirmed** — unwrap it and focus goes branded |
| `data-brand=A`, `data-theme='light'` | MATCHES | same |
| `data-brand=A`, `data-theme='base'` | **does NOT match at all** (its selector names `:not([data-theme])` and `[data-theme='light']`) | specificity never enters into it |

**The browser proof probes the third state**, because `THEMES` is the set of cells the bridge generates. So the 6 light-cell focus assertions are honest but narrow — they could not catch an unwrapped `:where()`. That gap is now covered by a **structural guard**: brand.css's light blocks must still be `:where()`-wrapped, and unwrapping brand A's reds the proof with a message naming all three documents that would go stale. **Mutation-verified**: unwrapped → exit 1; at HEAD → exit 0. Measured branded values when unwrapped: A `oklch(0.495 0.17 45)`, B `oklch(0.48 0.14 238)` — m01's new values, confirming the primitive edit is live on that path.

**A defect this mission's own control caught, in this mission's own code.** `specificityOf` first used `/:where\([^)]*\)/g`. On brand.css's real light selector — `:where([data-brand='A']:not([data-theme]), …)` — that regex stops at the `)` **inside** the nested `:not(`, leaves the tail, and scores **(0,2,0)**: it would have flagged as a tie-offender the very block whose zero specificity this sprint's light-focus record rests on. Replaced with a balanced-paren scan that also handles `:not()`/`:is()`/`:has()` (argument specificity), with the multi-argument approximation stated in the code. The last test in the file is the regression pin. *The same latent bug exists in the grounding scratch `tie-invariant-repo-wide.mjs:69`; it never mattered there because brand.css declares no bridged slot.*

**Movement vs prediction.** Predicted "brand-root-and-containment stays 9 tests; census file is new; proof 228→246; `verify:brand-cascade` exit 0 with SELFTEST exit 1" — **all four exact**. `tests/tokens` 67 → 72 tests / 8 → 9 files, the +5 entirely the new census file. Guardrails unchanged at 15. `check:tokens` still up-to-date after the bridge comment edit. **No consumer greps the `228` literal** (re-verified across `.github/`, `scripts/`, `package.json`).

**Mutation proofs run (five, all discriminating, all restored):** both oracles gutted → 2 failed / 7 passed · census oracle gutted → both seed proofs red · the `@import` header trap reintroduced → the 14-row census pin reds (the trap surfaces as a census diff, exactly as designed) · the global-backtick regex substituted for indexOf+walk → census pin reds (measured: that regex captures ONE match containing **zero** `--theme-` declarations, while indexOf+walk captures the real 3583-char literal with 52) · brand.css's `:where()` unwrapped → browser proof exit 1.

### m03 — tokens-governance truth-up

| # | chartered | shipped | diff |
|---|---|---|---|
| 1 | delete the dist fast-path (`tryLoadDistPayload`, `buildFlatTokenMapFromDist`, `approximateSourceHint`, `TOKEN_DIST_PATH`) | all four deleted, plus the now-orphaned `FlatTokenRawEntry` and `loadJsonFromGit` (its only caller was the fast-path) | **as chartered** |
| 2 | every ref through git, `'HEAD'` included; drop the workspace special-cases | `loadFlatTokens` is one path; `listSourceFilesFromWorkspace`, `walkWorkspaceDirectory` and `readSourceFile`'s HEAD branch deleted. Trade recorded in the file header | **as chartered** |
| 3 | FILE-scoped keys; `path`/`key`/`cssVariable` stay UNSCOPED; dedupe orphan/leak by path | `scopedTokenKey(filePath, path)`; identity fields untouched (asserted by a test that names the grep constraint); both finders dedupe with an explicit comment | **as chartered** |
| 4 | contrast grouping cell-scoped | group key is `${sourceFile}::${prefix}`; `changedPaths` → `changedKeys`, also scoped, so a change in one cell can no longer mark a same-named token in another | **as chartered, plus** the `changedKeys` scoping the charter did not name but which the group key alone would not have fixed |
| 5 | exclude `src/presets/**` and root `tokens/` | `SOURCE_DIRECTORIES` = `['packages/tokens/src']`, `EXCLUDED_SOURCE_PREFIXES` = presets; both routed through one exported `isGovernedSourceFile` so the CLI and the tests cannot disagree | **as chartered** |
| 6 | duplicate-removed classification; exactly 18 of 39 on the acceptance range | `classifyRemoval` requires path + identical value + a DIFFERENT file. **Measured 18 / 21 on the range, both brands** | **as chartered, measured** |
| 7 | export the pure functions; entry guard; tests at `tests/tokens-governance/` | exported `loadFlatTokens`, `collectDtcgTokens`, `computeTokenDiff`, `filterTokensForBrand`, `classifyRemoval`, `computeContrastDeltas`, `scopedTokenKey`, `isGovernedSourceFile`. Entry guard via `import.meta.url` vs `process.argv[1]`. **14 tests**, running in the root `core` project | **as chartered** |
| 8 | risk rules BYTE-UNTOUCHED; disclose that the s169 PR itself will demand the label | verified: the only diff lines naming `determineRisk`/`determineNamespace` are two new **comments**; the rule bodies are byte-identical. Disclosure is in the file header AND reproduced live below | **as chartered** |

**Acceptance, reproduced exactly:**

| measure | target | actual |
|---|---|---|
| brand A `e5f2172^ → 00ae5b3` | +5 / −39 / **Δ63** | **+5 / −39 / Δ63** |
| ...of which duplicate-removed | **18** of 39 | **18** (21 plain) |
| brand A **brand-cell** modified | Δ62 | **62** |
| brand B | Δ5, cell Δ4 | **Δ5, cell 4** |
| `--head HEAD` vs `--head <HEAD sha>` | byte-identical | **IDENTICAL** |
| pre-change baseline | Δ0 | **Δ0**, confirmed before any edit |

The HEAD-vs-SHA run was made on a **dirty** tree (m01's and m02's edits uncommitted) and was identical anyway — which is the disclosed trade demonstrated rather than asserted: local runs now see committed history only, exactly as CI does.

**A charter violation I made and reverted.** I first exported `determineRisk` and `determineNamespace` for symmetry. No test needed them, and item 8 says the risk rules stay byte-untouched — an added `export` keyword is a byte. Both reverted before close.

**One chartered deletion initially missed:** `approximateSourceHint` survived the first pass and was only caught by lint. Deleted; acceptance re-verified unchanged afterwards.

**Left alone deliberately:** `STATUS_MAP_PATH` is an unused constant that lints as a warning — **pre-existing at HEAD** (verified by stashing), not chartered, not mine to remove.

**Movement:** `tests/tokens-governance/` is new (14 tests); `tests/tokens` + governance together 86/10 files; guardrails unchanged at 15. Lint on the touched files: **0 errors**, 1 pre-existing warning. The tool is not in the root tsconfig program, so root typecheck is unaffected (a pre-existing `$description` narrowing complaint under ad-hoc stricter flags exists at HEAD too and was left alone).

**Mutation proofs run (four, all discriminating, all restored):** unscoped map keys → **6 of 14 red** · dot-prefix-only contrast grouping → 1 red · `classifyRemoval` ignoring value equality → 1 red · `classifyRemoval` ignoring the different-file requirement → 1 red.

**LIVE DISCLOSURE FOR THE PR (m06 hands this to Derek).** With the gate now truthful, `--labels ""` exits **1** and `--labels token-change:breaking` exits **0** on the same range. The CI-shaped invocation against `$(git merge-base HEAD OODS-pro)` reports `high=77` and therefore `requiresBreakingLabel=true`. **That is the gate working, not a defect** — m01's `text.accent` moves are high-risk under the untouched rules. Applying the label to the PR is Derek's step.

### m04 — MCP brand threading + render-honesty fix

**F4 reproduced before any edit, exactly:** `resolveTokenToColor` emits `rgb(24, 35, 60)`-form strings · production `scanBrandContrast()` returns **`[]`** · a **hex** failing palette returns 4 findings (so a hex RED-first is GREEN at HEAD and proves nothing) · the **same** failing palette in `rgb()` form returns `[]` · `contrastRatio` throws `Unsupported colour format "rgb(119, 119, 119)"`.

| # | chartered | shipped | diff |
|---|---|---|---|
| 1 | scope = `dashboard.render` + `repl` render, nothing else; certify gets NO brand, only an honesty note | exactly those two. Honesty note added in **two** places: `packages/mcp-adapter/tool-descriptions.json` and `artifact.certify.input.json`'s own description (so it reaches `docs/api` too) | **as chartered, plus** the schema-side copy |
| 2 | optional `brand`, enum A/B, NO default, in all THREE schema files; repl default stays `'default'`; uppercase exactly | all three; `data-brand="default"` preserved and pinned by a test; enum rejects `'a'`, `'C'`, `''`, numbers, null | **as chartered** |
| 3 | parameterise `EXPORT_TOKEN_MAP` by suffix; resolve ONCE; pass through the two existing seams; echo only-when-supplied | `exportTokenMap(brand)` + `resolveBrandTokens(brand)`; resolved once into `exportTokens` and passed to BOTH `tokens` (:713 seam) and the scan; additive-spread echo | **as chartered** |
| 4 | fix the dead scan INSIDE `scanBrandContrast`; rgb()-form RED-first; ASSERT `graded === CONTRAST_PAIRS.length` on the production path | `toGradableHex` normalises per-pair, scan-side only. **The sprint-115 golden's rgb() `:root` line is untouched** — confirming the seam choice. RED-first uses the rgb() form; the production-path assertion runs for **both** brands | **as chartered** |
| 5 | ONE golden movement, five artifacts updated together | all five: the .snap (**+1 line, verified by diff**), fidelity `toEqual`, both `dashboard.render.test.ts` summary `toEquals`, and the output schema `$defs`. **`git diff -- '*.snap'` across the whole repo = 1 file, 1 insertion** | **as chartered** |
| 6 | thread `input.brand` into `renderDocument` (document only; fragments ignore it) | done, spread-guarded. A test asserts fragments are **byte-identical** with and without a brand, so "ignored" is measured rather than asserted | **as chartered** |
| 7 | file sweep incl. `packages/mcp-adapter/tool-descriptions.json`, docs:api regen, four-lens stale-prose sweep | all swept; `generated.ts` regenerated (twice — the certify edit landed after the first run and `generate:check` caught it); four-lens sweep found **no** surviving "brand-a only" prose | **as chartered, plus TWO CI additions — see below** |
| 8 | rebuild, pm2 restart (mine), live-verify over :4466, `info_push` to forge-demos | all done; six live checks below | **as chartered** |

**TWO ADDITIONS BEYOND THE CHARTER, both about a control that would not have run.**
`repl.render.brand.test.ts` is a **colocated** test under `src/tools/`, and the root vitest projects do not glob that directory — colocated tests run in CI only via the by-name list in `ci.yml`. There is a guard for exactly this (`ci-golden-list.guard.test.ts`, written after the trap dropped a test from CI **twice**), but its regex covered `viz.render.*` and `dashboard.render.*` only. **`repl.render.*` was in its blind spot** — including the already-listed `repl.render.skin-mapping.test.ts`. So: (1) the new file was appended to the ci.yml list, and (2) the guard's regex was widened to `repl.render` too. Both existing repl goldens are already listed, so the widening goes green immediately; its value is entirely in the next one. **Mutation-verified**: removing the new file from ci.yml reds the guard with a message naming it.

**Live verification over :4466 after `pnpm run build:packages` + `pm2 restart oods-forge-bridge` (all six pass):**

| check | result |
|---|---|
| `dashboard.render` `brand:"B"` | 200 · `output.brand "B"` · `--oods-color-fg rgb(21, 29, 45)` · `a11yContrast.summary {failing: 0, gradedPairs: 4}` |
| `dashboard.render` no brand | 200 · no echo · `--oods-color-fg rgb(24, 35, 60)` · differs from B |
| absent vs explicit `"A"` | **byte-identical** apart from the echo |
| `dashboard.render` `brand:"C"` | 400 **OODS-V001** — "field 'brand' must be one of: A, B" |
| `repl` render `brand:"B"` | 200 · `<html lang="en" data-theme="light" data-brand="B">` |
| `repl` render `brand:"C"` | 400 **OODS-V001** |

Two live-harness facts worth recording for the next session: the bridge body field is `input` (not `args`), and `repl.render` is **not** bridge-exposed — the grouped `repl` with `action: "render"` is, and its document path still requires `apply: true`.

**Movement:** mcp-server **3978+16 → 3997+16**, and the **+19 reconciles exactly**: 7 new in `dashboard.render.test.ts`, 6 in the new `repl.render.brand.test.ts`, 6 in `repl.group.test.ts` (2 brand-bearing parity payloads × 2 parity describes, plus 2 new negative tests). Gate 19's exact invocation: **13 files / 287 tests green**. `docs:api --check` fresh (26 files, no orphans); both generators clean; mcp-server `tsc --noEmit` clean.

**Mutation proofs run (two, both discriminating, both restored):** dropping `brand` from `repl.input.json`'s render branch only → **4 parity tests red** (the pre-existing parity payloads all omit `brand` and could not have caught a one-sided edit; the two brand-bearing payloads are what catch it) · removing the new colocated test from ci.yml → the golden-list guard reds by name.

**A SEQUENCING RISK I TOOK ON, DISCLOSED.** The `info_push` was sent as ONE message covering both m04's schema change and **m05's brand.apply cross-brand-delta rejection**, per m06's loop-closure charter — but it was sent *before* m05 was built. The message describes that guard as shipped. **m05 must ship it, or this message needs a correction.** Recorded here so the obligation cannot be lost between missions. → **DISCHARGED in m05 item 1: the guard shipped as OODS-V149 with 7 tests green. The message is accurate as sent.**

### m05 — hygiene basket

| # | chartered | shipped | diff |
|---|---|---|---|
| 1 | presets brand-relative + spec rewrite + brand.apply delta-namespace guard (new OODS-V, RED-first) + config comment | **The graft was reproduced first**: `dark-minimal.json` applied to brand **B** planned `/color/brand/A: {…}` as an ADDITION in B's `base`/`dark`/`hc`, under the summary "Updated 3 token values for brand B". Guard shipped as **OODS-V149** (registered), rejecting both directions and theme-nested wrappers; presets re-keyed (top level is now `surface`/`text`/`border`/`accent`); spec rewritten to assert the ABSENCE of a wrapper and deep-mergeability into BOTH brands; config comment corrected | **as chartered** |
| 2 | Stage1 `--name` containment at the `writeJson` choke, exit 2, RED-first | **Escape reproduced by execution**: `--name '../../escaped'` wrote `/tmp/escaped.base.json` + `.coverage.json` two dirs above `--out`, exit 0, printing the escaped paths as success. Guard at the choke point covers all three writes; 5 tests drive the real CLI as a subprocess | **as chartered** |
| 3 | translate `orientation`→`orient`, `enableMarkers`→`point`, `join`→`strokeJoin`, value-guarded; additive only | all three, verified against the **installed** vega-lite 6.4.1 schema: `Orientation` and `StrokeJoin` are exact matches for the OODS trait enums. **viz-core 1205/61 unchanged — zero existing tests red**, exactly as §6.4 predicted | **as chartered** |
| 4 | flipped-channel probe: `x.scale.zero === true` AND `type === 'linear'` (merge) AND y has no `scale.zero` | shipped with an explicit premise assertion (x really is quantitative). **Mutation `['y','x']`→`['y']` reds exactly this one test** | **as chartered** |
| 5 | delete 69 dead primitives, pin 76→7, survivor-tie test | census reproduced **exactly 69 dead / 7 live**; pin moved to 7 and made a floor AND ceiling; canary pins kept; six focus-aliased survivors additionally pinned. **The tie catches the historical drift**: re-introducing `--brandB-text-accent: 0.54` reds it by name | **as chartered** |
| 6 | four `$description` rewrites at-or-below the floors + warning-icon disclosure | all five measured through the evaluator first (4.9911 / 4.6004 / 4.6437 / 4.6942 / 3.0005) and quoted at 4.99 / 4.60 / 4.64 / 4.69; the historical "the ratified 0.57 measured 4.41:1"-style numbers dropped | **as chartered** |
| 7 | cookbook `b`→`B`; frozen-literals comment with the drift-record cross-reference | both; the cookbook also gained a sentence on case-sensitivity, since the typo's whole hazard is that a lowercase value matches nothing and silently falls through to `:root` | **as chartered, plus** the case-sensitivity note |
| 8 | land s168 §8 with the 232-sentence corrected | the sentence's "232 changed values" is REMOVED, with the corrected +5/−39/Δ63 (18 duplicate-removed) recorded and the reason (a dist-vs-source run CI never takes) explained. Both carries in that paragraph marked **dispositioned**, not merely inherited | **as chartered** |

**A comment my OWN item 3 made stale, caught and fixed.** `applyBaselineToEncoding`'s rationale justified its channel choice partly on `orientation` being "an OODS-only key with no MarkDef target, so it cannot be relied on here". Item 3 gave `orientation` a target. The channel choice is unchanged and still correct (quantitative-ness is the direct signal, and `orient` is advisory — Vega-Lite ignores it on stacked charts), but the stale half of the rationale is removed rather than left to read as a live constraint.

**A gate that went red for a benign reason, diagnosed rather than suppressed.** `pnpm run lint:tokens` failed after the preset re-key. The token-lint baseline is keyed on `ruleId + file + token-path`, and re-keying MOVED the paths — so the pre-existing camelCase `onInteractive` debt (baselined in s125, and present at **13 addresses repo-wide** including every brand source file) surfaced as new at its new address. Fixed by **hand-editing the three moved entries** and dropping three now-nonexistent `color.brand.A` wrapper entries — deliberately NOT `--write-baseline`, which would have swept in anything else that happened to be failing. Net: 64 → 61 entries, and no new suppression.

**Movement:** viz-core **1205/61, unchanged**. mcp-server **3997+16 → 4011+16** (+14 = 7 cross-brand-delta, +7 net in the rewritten presets spec). Root core **4729+20/434 → 4776+20/438** (+47 across the sprint; +4 files). Guardrails 15. Browser proof 246, exit 0. All token gates and **all six lints pass** (`lint:tokens`, the four specialty lints, and the repo `lint`); the one remaining eslint warning in `brand.apply.ts` (`structured` unused) is **pre-existing**, verified by stashing.

**Mutation proofs run (three, all discriminating, all restored):** `['y','x']`→`['y']` → the flipped-channel probe reds alone · `--brandB-text-accent` set back to `0.54` → the survivor tie reds naming both values · the cross-brand graft, before and after the guard → planned an A-subtree into B, now OODS-V149.

### m06 — closeout

**All 22 gates run SEQUENTIALLY, by the named invocation, all green.**

| # | gate | baseline → expected | actual |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | clean | **PASS** |
| 2 | `pnpm run build:packages` | — | **PASS** |
| 3 | `pnpm --filter @oods/viz-core exec vitest run` | 1205/61 + m05 additive | **1205 / 61 — unchanged** |
| 4 | `npx vitest run --project core` | 4729+20/434 + additions | **4776 + 20 skipped / 438 files** |
| 5 | `npx vitest run --project guardrails` | 14/4 → 15-16/4 | **15 / 4** |
| 6 | `pnpm --filter @oods/mcp-server run test` | 3978+16 + additions | **4011 + 16 skipped / 196** |
| 7 | `pnpm --filter @oods/mcp-server run test:scale` | 62, exact | **62** |
| 8 | `pnpm run tokens-validate` | green, 32 viz checks | **PASS, 32 checks** |
| 9 | `pnpm run tokens:collision-guard` | 0 / 6 scopes | **0 non-exempt / 6 scopes** |
| 10 | `pnpm run check:tokens` | up-to-date | **up-to-date** |
| 11 | `lint:tokens` + repo `lint` + the four specialty lints | green | **all six PASS** |
| 12 | root `pnpm typecheck` | PASS | **PASS** |
| 13 | `pnpm --filter @oods/viz-core run typecheck` | PASS | **PASS** |
| 14 | `pnpm -w run docs:api -- --check` | fresh, no orphans | **fresh, 26 files, no orphans** |
| 15 | `pnpm --filter @oods/schemas-tools run generate:check` | exit 0 | **PASS** |
| 16 | `pnpm run generate:schema-types -- --check` | unchanged | **PASS** |
| 17 | `pnpm run verify:brand-cascade` (+ SELFTEST=1 exits 1) | 228/6 → **246/6** | **246, exit 0; SELFTEST exit 1** |
| 18 | governance acceptance | Δ0 → **+5/−39/Δ63, 18 dup-removed**; HEAD≡SHA | **exact; HEAD vs SHA IDENTICAL** |
| 19 | the exact ci.yml:659 invocation | 12 files → 13; only the m04.5 movement | **13 files / 287 tests** |
| 20 | `pnpm run test:coverage` | passes; the vendored proofs must RUN | **4806+20 / 449; both RED-first proofs run BY NAME** |
| 21 | `pnpm run a11y:diff` | no new violations | **"No new accessibility guardrail, contrast, or contract violations detected."** |
| 22 | the remaining blocking CI legs | green | **viz-render 11 · mcp-bridge 5 · tenancy:check · diagnostics-schema · state-assessment · `build` · `build-storybook` — all PASS** |

**PER-GOLDEN REVIEW — the sprint-wide prediction HELD.** `git status` + `git diff --stat` over `*.snap` across the entire repo: **ONE file changed, ONE line inserted** — `dashboard.render.fidelity.test.ts.snap` gaining `"gradedPairs": 4`, exactly the movement declared in m04.5. No other golden moved anywhere. Stop-the-line clear.

**GATE 20 — the proofs genuinely execute.** `test:coverage` runs `brand-contrast.spec.ts` with 7 tests, and both RED-first proofs were confirmed **by name** in verbose output, not merely by count. The stronger structural evidence: the spec now contains **zero** references to `execFileSync`, `child_process` or `git show` outside comments explaining their removal — so the shallow-checkout skip that made this proof vacuous in CI is not merely fixed, it is unreachable.

**CHARTER-DIFF: all six missions, no exceptions** (s168 did 3 of 7, and that is where the unshipped control hid). Tables above for m01–m05; this one for m06. Every artifact those tables NAME was then **machine-verified to exist** — 24 checks by grep/test, not from memory. One initially flagged (`tryLoadDistPayload` still matching in `tokens-governance/index.ts`) and was confirmed **comment-only** by stripping comments and re-counting: all four deleted symbols occur 0 times in executable code.

**CONSUMER LOOP-CLOSURE — both public changes, one message, verified live.** `info_push` sent to `cmos://derek/forge-demos` covering m04's schema change AND m05's `brand.apply` guard. After the FINAL `build:packages` + `pm2 restart oods-forge-bridge` (m05 changed `brand.apply` after m04's restart, so the earlier verification was re-run), all of it re-checked over `:4466`:

| live check | result |
|---|---|
| `dashboard.render` `brand:"B"` | 200 · `output.brand "B"` |
| absent brand vs explicit `"A"` | **byte-identical** except the echo |
| `dashboard.render` `brand:"C"` | 400 **OODS-V001** |
| `repl` render `brand:"B"` / `"C"` | 200 with `data-brand="B"` / 400 **OODS-V001** |
| `brand.apply` A-delta into brand B | 400 **OODS-V149** |
| `brand.apply` B-delta into brand B | 200, no error |

**GOVERNANCE LABEL HANDOFF — DEREK'S STEP.** The CI-shaped invocation, run for both brands:

```
pnpm run tokens:governance -- diff --brand <A|B> \
  --base $(git merge-base HEAD OODS-pro) --head $(git rev-parse HEAD) \
  --labels token-change:breaking
```

**Result: `requiresBreakingLabel = true`.** Brand A reports `high=77`, brand B `high=41`; **exit 1 WITHOUT the label and exit 0 WITH it**, for both brands. **This is the gate working, not a defect** — it is the first time it has been able to see token changes at all. **Applying the `token-change:breaking` label to the PR is Derek's step.**

*Stated precisely, because the number will move:* that run reads `HEAD` (`00ae5b3`), and **this sprint's own token edits are uncommitted**, so they are not in it — the m03 trade is that the tool now sees committed history only, exactly as CI does. Once s169 is committed the same invocation will include m01's two `text.accent` modifications, which are `'text'`-segment tokens and therefore `foreground/background impact` → **high** under the byte-untouched rules (`determineRisk`, the `affectsForeground` branch). The label requirement is unchanged either way; only the counts grow.

**TWO TRACKED ARTIFACTS MOVED THAT ARE NOT SOURCE — both inspected rather than waved through.**

1. **`tools/a11y/reports/a11y-report.json`** — churn is ephemeral Storybook **port numbers** and **`durationMs`** only. Zero violation rows changed. (The memo predicted "timestamps only"; the precise content is ports and durations, which is the same class of run-to-run scenery.)

2. **`diagnostics.json` — a REAL change, and the best single piece of evidence that m03 did something.** `tokens.governance.totals` moved `runs: 4 → 5` and **`highRisk: 0 → 118`**, with `lastRun.status: GREEN → RED` and `requiresBreakingLabel: true`. It is written by gate 22's `state-assessment.mjs --guardrails --tokens`, which runs the governance diff for BOTH brands and sums their high-risk counts (77 + 41 = 118). **The four prior runs all recorded `highRisk: 0` — that is the blind gate's signature**, four consecutive "nothing to see here" verdicts on token changes it could not perceive. The fifth is the first truthful one.

   The `RED` is the assessment *reporting* that protected token changes require the `token-change:breaking` label; it is **not a gate failure**, and this was checked rather than assumed: `state-assessment.mjs --guardrails --tokens` still **exits 0** (re-run explicitly for the exit code, and the script's exit is not gated on the label). That same run also shows the governance contrast findings keyed `packages/tokens/src/tokens/brands/A/base.json::color.brand.A.status.*` — m03's **cell-scoped grouping, live in the real CI-shaped invocation**, not just in unit tests.

**Scratch NOT part of the deliverable** (`scratchpad/s169-m02/` grounding artifacts predating this session, plus `s169-m04-live-verify.mjs` and `s169-m05-primitive-census.mjs`, which are reproduction scripts for the live-verify and the 69/7 census). Keeping or dropping them at commit time is Derek's call.

**NOT SELF-CERTIFIED.** The genuine-close review is a separate session (standing rule 10).
