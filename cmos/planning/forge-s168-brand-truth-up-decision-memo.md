# Sprint-168 decision memo — brand pipeline truth-up + the FF#22 corrective

**Status:** **v2, post-critic.** SSOT for the s168 build session.
**Planning session:** PS-2026-08-02-003. **Grounding:** wf_73d3fe93-f3a (8 agents). **Critic:** wf_0a70b4b5-887 (5 lenses).
**v1 was REJECTED** by the hardened critic on 4 of 5 lenses — 27 blockers / 45 majors. v2 disposes of every blocker in §6.
**Predecessor:** sprint-167 CLOSED 2026-08-02, review verdict PARTIAL GENUINE CLOSE 3 of 4 (PS-2026-08-02-002).
**Standing rule 9:** the build session works from THIS FILE ONLY — never planning prose, review prose, or CMOS notes.
**Standing rule 10:** genuine-close review is a SEPARATE session. The build never self-certifies.

---

## §0 — Derek's ratified decisions (2026-08-02)

1. **Brand A dark is ORANGE.** `brand.css`'s hand-authored palette is correct; `brands/A/dark.json`'s teal is wrong and gets corrected.
2. **Contrast failures are fixed at the TOKEN VALUE** — not by relaxing a threshold or editing a description to match a bad colour.
3. **Brand A's status ramp is a TOKEN GAP.** See §1 F4 — the measurement changes the SHAPE of the fix, not the ruling.
4. **brand.apply: guard AND widen** to A|B.

**Checked, because v1's critic alleged a conflict between (1) and (2): there is NONE.** All 17 measurable text/icon pairs in the ratified orange dark palette PASS WCAG AA — `text.primary` on canvas 14.887, on raised 13.099, `text.secondary` 10.491, `text.muted` 7.059, `text.accent` 8.871, `text.onInteractive` 5.392, `text.inverse` 14.325, and all 10 status pairs 5.504–9.164. **Zero pairs where orange fails and teal passes.** Adopting the ratified palette costs no accessibility.

---

## §1 — Findings that set the sprint (main-loop verified; corrections from the critic folded in)

### F1 — THE CASCADE, per selector shape

Bundle order: `apps/explorer/src/styles/index.css:1` → `layers.css`, whose line 1 imports the generated `@oods/tokens/css`; `index.css:2` → `brand.css`. Generated CSS FIRST, `brand.css` LAST.

**v1 named the wrong competitor for the base row and the critic caught it.** `brand.css:2` `[data-brand='A']` declares only `--brandA-*` PRIMITIVES. The `--theme-*` light mapping lives at **`brand.css:51`** under `:where([data-brand='A']:not([data-theme]), [data-brand='A'][data-theme='light'])` — and **`:where()` contributes ZERO specificity**, so that block is **(0,0,0)**, not (0,1,0). Brand B is the same shape at `:259`.

| cell | generated bridge | brand.css competitor | winner |
|---|---|---|---|
| base / light | **(0,2,0)** | `:where(...)` at `:51` / `:259` — **(0,0,0)** | **BRIDGE**, by a wider margin than v1 claimed |
| dark | **(0,2,0)** | `[data-brand='A'][data-theme='dark']` `:104` — **(0,2,0)** | **brand.css** (tie → later source) |
| hc | **(0,2,0)** | `[data-brand='A'][data-theme='hc']` `:157` — **(0,2,0)** | **brand.css** (tie → later source) |

- 2 of 6 cells reach the runtime; 4 remain masked. `layers.css` `:root` **(0,1,0)** never masks the bridge.
- **The "unreviewed brand-dark redesign is live" alarm is FALSE** — brand.css dark still wins; nothing changed visually.
- **The real defect is the TIE.** dark and hc are decided by import order at equal specificity; reordering `index.css:1-2` flips four cells with zero test failures. Deleting `brand.css` removes the tie.
- **SCOPE LIMIT, disclosed:** this was measured from the `index.css` graph. `globals.css` and `.storybook/preview.ts` are separate import graphs and **m05 must re-verify the order in each** before relying on this table.

### F2 — A REAL A11Y DEFECT: the brand cells are ungraded, and there are FOUR failures

`packages/a11y-tools/src/rules.ts` `DEFAULT_CONTRAST_RULES` contains **zero** occurrences of `brand`. Six brand×theme cells resolve on five platforms and nothing grades them.

**MEASUREMENT PATH IS PART OF THE FINDING.** `a11y-tools/src/color.ts` `normaliseColor` converts non-hex through colorjs.io to **sRGB hex** before `contrastRatio` runs; out-of-gamut brand `oklch()` values **clip**, changing the ratio. The guardrail clips, so **clipped numbers govern**.

Swept all 34 resolvable pairs across A and B through `resolveColorSample → normaliseColor → contrastRatio`: **30 pass, 4 FAIL, 0 unresolvable.**

| pair (base scope) | sRGB hex | measured | required |
|---|---|---|---|
| A `text.on-interactive` on `surface.interactive.primary.default` | `#F7F5EE` / `#D04500` | **4.2465** | 4.5 |
| B `text.accent` on `surface.canvas` | `#0077B5` / `#EBF7FD` | **4.4717** | 4.5 |
| B `text.on-interactive` on `surface.interactive.primary.default` | `#F7F9FA` / `#0093D0` | **3.2683** | 4.5 |
| B `status.warning.icon` on `status.warning.surface` | — | **2.9966** | 3.0 |

Two tokens additionally **assert a ratio they miss**: A claims "(4.9:1)", B claims "(≥4.7:1)". That description is the evidence the s167 drift catalogue used to rule the generated side correct — the s167 review's "overclaim" finding is fully substantiated.

**Rule-19 correction, recorded because it changes the sprint.** I re-measured directly in oklch and "corrected" a grounding agent down to two failures. **The agent was right; I was wrong** — it used the repo's path. → standing rule §5.13.

**A SECOND GRADER EXISTS.** The critic found `scanBrandContrast` in the tree, which v1 never mentioned. m04 must reconcile with it rather than adding a third grader.

### F3 — THE FF#22 LEAK: 14 keys reach the mark def

s167 enumerated the **corpus**. The declared surface is `schemas/traits/mark-*.parameters.schema.json` — closed per-trait vocabularies, `additionalProperties:false`, never consulted.

- **12 leak and invalidate by NAME:** `name`, `stack`, `areaStyle`, `lineStyle`, `itemStyle`, `symbolSize`, `title`, `orientation`, `bandPadding`, `stacking`, `join`, `enableMarkers`
- **2 leak and invalidate by VALUE:** `baseline` on area (enum), `baseline` on bar (type)
- **1 leaks, passes ajv, still WRONG:** `fill:'solid'|'hollow'` — `fill` IS a real MarkDef property accepting arbitrary strings as Color, so **an allowlist will NOT catch it either**. Needs a value check.
- `tension` is genuinely fine.

**DERIVATION CAVEAT (critic):** only 5 of the 14 come from committed fixtures; the rest were derived by pushing the declared trait vocabulary through the adapter. **Consequence: a fixture-corpus sweep cannot exercise 12 of the 14.** m02 needs synthetic per-trait probes, not only the corpus sweep.

**Why the s167 oracle could never have caught it:** `tests/viz/mark-options-schema-validity-s167.test.ts:59` filters errors with `/^\/layer\/\d+\/mark/` — LAYERED specs only. All 4 offending fixtures are **unit** specs at `/mark`.

**Translations:**
- `curve` → `MarkDef.interpolate` (OODS enum is a literal subset).
- `baseline` → `encoding.<quantitative>.scale.zero`. **`'zero'`→true, `'min'`→false, AND the NUMBER `0`** — two of the four committed occurrences are numeric `baseline: 0` on MarkBar, which v1's table did not cover.
- **This translation cannot live in the mark-def region** — `encoding` is built elsewhere in the adapter. v1's "edits confined to `:208-229`" was false.

### F4 — THE STATUS RAMP: the gap is PROVENANCE, not colour

| slot group | A vs B ΔE2000 |
|---|---|
| `surface.interactive.primary.default` | **60.19** |
| `text.accent` | **54.04** |
| `surface.raised` / `surface.canvas` | **17.92** / **14.22** |
| **all 20 status slots** | **mean 1.68, max 5.65, 10 of 20 BELOW the JND** |

Brand B's status ramp is **not meaningfully branded either** — the reference palette with 0–10° hue nudges. Inventing 20 distinct status colours for A would create a divergence existing nowhere else and would be the build inventing design intent. **The defect is that A's values are byte-identical shared literals**, so the slot is not brand-owned. A genuinely distinct status identity is a **design exercise, not a sprint task**.

### F5 — Inherited numbers that DO NOT reproduce

| claim | measured |
|---|---|
| "layers.css re-declares **183** `--theme-*` at `:root`" | **`grep -c` counts 183 LINES containing the string, including `var()` REFERENCES.** Actual declarations: **57 at `:root`**, 57 at `html[data-theme='dark']`, 115 total. The agent's 57 was right. **v1's "it's an oklch hue transcription" explanation was itself WRONG** — corrected here rather than shipped into a source comment. |
| "brand.css has **two** importers" | **3** (`index.css:2`, `globals.css:2`, `BrandA.stories.tsx:4`) + a test-fixture reader |
| "build-storybook is a hard dep of **three** CI jobs" | **2**; only **1** blocks a PR |
| "**7,735** JSON specs swept" | **460** committed `.json`; the mark-bearing count is **contested (42 claimed, duplication-inflated)** — m02 must re-derive it and state the definition |
| "only **32 of 771** valid Swift" | **206** by compile-validity |
| "**259** raw oklch in ios-swift" | **381** — and `forge-s166-m03-...findings.md:23` is NOT flagged stale; it will mislead the s170+ mobile walk |

### F6 — brand.apply security, precisely scoped

`brand.apply.ts:160-164` — `path.join(BRAND_ROOT, brand, theme + '.json')` then a bare `readFileSync`. The **same file** uses `withinAllowed` correctly at `:429` and `:505`.

**NOT exploitable over MCP today.** All three transports funnel through `index.ts:257` where ajv rejects before `handle()`. Verified: `{brand:'B'}`, `{brand:'../../../../../../etc'}`, `{brand:'A/../B'}` all REJECT. It **is** reachable by direct handler import — how `security.model.spec.ts:3` calls it. Framing: **close the hole before widening**.

Two secondary sinks a naive widening misses: `:519` (brand in an output FILENAME; `ensureAllowed` checks `artifactsBase`, not `runDir`) and `:317` (brand interpolated raw into a CSS variable name).

**`themes[]` has been unreachable since s85** — handler reads it, wire schema is `additionalProperties:false` without it.

---

## §2 — The slate

**DAG: m01, m02 independent roots · m03 → m04 → m05 · m03 → m06 · m07 requires all.**
v1 declared m05 independent; the critic proved it is not — its expected tables are functions of m03's token values.

| id | mission | size |
|---|---|---|
| m01 | brand.apply containment guard + widen the enum to A\|B | M |
| m02 | FF#22 corrective — allowlist + translation table + RED-first, shape-agnostic oracle | M |
| m03 | Brand palette truth-up — dark→orange, 4 contrast fixes, description audit, status provenance | L |
| m04 | Brand contrast GRADING — a brand rule set with its own plumbing | M |
| m05 | Retire `brand.css` — kill the source-order tie | M |
| m06 | Control hardening + the first rendered-surface proof | M |
| m07 | Closeout | S |

v1 sized m03 as [M] (it is five workstreams → **L**), m05 as [S] (focus slots + docs + 3 import graphs → **M**), and m06 as [S] (four control rewrites + a browser proof → **M**). Corrected.

---

## §3 — Mission charters

### m01 [M] — brand.apply containment guard + enum widening

1. **Allowlist DERIVED** from `fs.readdirSync(BRAND_ROOT, {withFileTypes:true})` filtered to directories; reject `''`, `'.'`, `'..'` explicitly. Widening then stays schema-only.
2. **Containment as defence-in-depth** — `withinAllowed(BRAND_ROOT, file)` per `structuredData.fetch.ts:134-135`. Reuse `OODS-S015`. **No `realpath`** (zero in the repo); disclose the symlink gap.
   **The containment layer MUST be independently red-able** (critic, rule 13a): with the allowlist in place no input can reach it, so add a **direct unit test on the containment helper itself**, not only end-to-end handler tests. A layer no test can turn red is not a layer.
3. **Both secondary sinks closed** — validate the brand id BEFORE `:519` and `:317`.
4. **Widening is repo-wide, not one file.** `brand.apply.input.json` AND **`tokens.build.input.json`** (also `enum:["A"]`). Then: the CI generator sweep (`generate:check`, `ci.yml:55` → `generated.ts`), the hand-maintained `tools/types.ts:73`, the dist schema copy, `tool-descriptions.json`, `panel.tsx:531`, **and `pnpm -w run docs:api -- --check`, which regenerates `docs/api/*.md` and goes RED on an un-regenerated enum** — v1 omitted this and it is a CI gate.
5. **BITE PROOF, two levels.** Handler level in `security.model.spec.ts` (already bypasses ajv): RED-first on `'../../../../../../etc'`, `'A/../B'`, `'..'`, `''`, `'.'`, `'A/'`, asserting the **error code**. Positive cases `'A'` and `'B'`. Schema level in `schema.contract.spec.ts`: assert the enum exists and rejects an unknown brand — today **zero of six** brand.apply test files assert it.
6. `themes[]` resolved — wired in or removed. State which.
7. **Consumer loop-closure REQUIRED** (critic): this changes a public MCP input schema. Fold into m07's outreach.

**Claim ceiling.** "The read is contained and the enum is enforced at both boundaries." NOT "brand.apply is secure" — the symlink gap remains, disclosed.

### m02 [M] — FF#22 corrective

1. **ALLOWLIST derived from the real `MarkDef` property list, with a TRANSLATION TABLE in front.** **Derive it in the TEST, not the adapter** — the adapter must carry a static list so a vega-lite bump cannot silently change runtime behaviour, and the test asserts the static list still matches the schema. v1 was self-contradictory on this; the split above is the ruling.
2. **Translations:** `curve` → `interpolate`; `baseline` → `encoding.<quantitative>.scale.zero` covering **`'zero'` → true, `'min'` → false, and the NUMBER `0`** (2 of 4 committed occurrences, MarkBar). **This edit lives in the encoding-construction region, not the mark-def region.**
3. **RED-FIRST IS MANDATORY** (critic BLOCKER — v1 had none, in the mission replacing the oracle that let a broken fix ship). Every one of: the 4 currently-invalid fixtures, and a synthetic probe per leaking key, must be proven RED against HEAD **and red for the STATED reason** (assert the specific error path/keyword, not merely `valid === false`).
4. **PASSTHROUGH-SURVIVAL CONTROL** (critic: v1's criteria were satisfiable by `{type:'line'}`). Assert the 4 genuine passthrough keys (`strokeWidth`, `opacity`, `fillOpacity`, `strokeDash`) plus `tension` **survive with their values** on every trait that declares them. Without this the allowlist is degenerate in the drop direction.
5. **`fill:'solid'|'hollow'` needs a VALUE control, not the allowlist** — `fill` IS a MarkDef property, so the allowlist passes it through and ajv accepts it. Add an explicit check that emitted `fill` is a colour, or translate/deny it. State which.
6. **Coverage is SYNTHETIC + CORPUS.** The corpus exercises only 5 of 14 keys; add a per-trait synthetic probe for every declared option key. **Re-derive the mark-bearing fixture count and state the definition** — "42" is contested and duplication-inflated (`patterns/` and `patterns-v2/` are byte-identical twins).
7. **Oracle is SHAPE-AGNOSTIC** — compile `{...schema, $ref:'#/definitions/MarkDef'}` and validate each emitted mark def standalone. The `/^\/layer\/\d+\/mark/` filter must go.
8. **Do NOT enforce trait parameter schemas.** (v1's "6 of 17 violate" is wrong by ~3×; re-measure if cited.) Separate mission.
9. **Predicted movement:** `vega-lite-adapter.ts` mark-def region AND the encoding region; the s167 test file. Zero snapshots contain `baseline` (all 8 `.snap` checked) — **re-verify before claiming it.**

**Claim ceiling.** "No OODS-only key reaches the emitted mark def, every declared trait option is covered by a probe, and every committed mark-bearing fixture emits a schema-valid mark def." NOT "FF#22 is closed." NOT "the emitted spec is valid" — ~14 fixtures are invalid for unrelated facet/repeat reasons: **recorded, not fixed.**

### m03 [L] — Brand palette truth-up

1. **`brands/A/dark.json` corrected to the ratified ORANGE**, sourced from `brand.css:104-156`. 18 of 38 slots move. §0 confirms this costs no accessibility.
   **THE 3 ACCENT SLOTS HAVE NO SOURCE** (critic): brand A dark has 41 leaves but only 38 map to `--theme-*`, and brand.css assigns no accent slots — so `accent.background`/`accent.border`/`accent.text` have no ratified value. **Decide and record**: keep the existing teal accents, derive from the orange ramp, or leave and disclose. Do not silently keep teal accents inside an orange palette.
2. **All FOUR AA failures fixed at the token value**, verified **through the repo's evaluator path** (§1 F2). Target **≥4.6 / ≥3.1**, not exactly at threshold — three of the four sit within 0.04 of the line.
3. **`$description` ratio audit across all six brand files**, every numeric claim verified through the same path, and each stated as the **sRGB-clipped** ratio.
4. **Status provenance, NOT invented colour.** Brand A's 20 status slots get brand-owned literals nudged toward hue **43**, matching brand B's precedent. Every value holds its current contrast or better.
   **DISCRIMINATING CONTROL REQUIRED** (critic: "hold contrast or better" is satisfied by changing nothing): assert that **no brand A status literal is byte-equal to the reference palette value it currently copies** — that is the actual property being fixed. **State which themes are covered** (base only, or base+dark), because m06's expected table depends on it.
5. **UPDATE THE TWO s167 CONTROL TESTS THIS MISSION TURNS RED** (critic BLOCKER, unpredicted in v1): `tests/tokens/brand-theme-matrix.test.ts:219-220` hard-pins `expect(baseValue).toBe('oklch(0.58 0.19 43)')` and `expect(darkValue).toBe('oklch(0.72 0.16 183)')` as seeded-contamination anchors. m03 changes both. Re-anchor them to values derived from source, not literals — a pin that must be hand-edited whenever a token changes is a maintenance trap.

**Claim ceiling.** "Brand A's dark palette matches the ratified design, all four measured failures pass with margin, and every numeric ratio claimed in a brand `$description` is measured true." NOT "the brand palettes are accessible" — grading is m04, hc is exempt, and only text/icon-on-surface pairs are covered.

### m04 [M] — Brand contrast grading

**Requires m03.**

1. **DO NOT EXTEND `DEFAULT_CONTRAST_RULES`** (critic BLOCKER, independently verified). It is shared by three consumers across **two token sources**: `testing/a11y/contrast.spec.ts` reads `flatTokens` from `@oods/tokens` (**122 brand keys present**), while `a11y.scan.ts` and `a11y/validate-contrast.ts` read `artifacts/structured-data/oods-tokens-2026-03-06.json` (**zero brand keys**, layers `[reference, theme, system, component, view]`). Adding brand rules to the shared constant makes `resolveFlatToken` throw → `passed:false` → **permanently red for those two consumers, and it breaks a committed mcp-server contract test asserting zero issues against a brand-free fixture.**
   **Ship a SEPARATE exported `BRAND_CONTRAST_RULES`**, evaluated only against a brand-bearing token map. State explicitly what `a11y.scan` does and does not now grade.
2. **RULE STRINGS MUST MATCH `normalizeTokenExpression`** (critic BLOCKER, hit live during planning). `token.ts:4-12` lowercases and maps `.`/`/` → `-`, so `brand.A.text.onInteractive` normalises to `brand-a-text-oninteractive` — **a key that does not exist**. The real flat key is `color-brand-a-text-on-interactive`. A rule set using the natural dotted form is red for the WRONG reason. Pin the exact key strings and assert each resolves before asserting any ratio.
3. **Rules GENERATED per cell from the bridge's slot map**, not hand-listed, so a new bridged slot arrives with a rule attached.
4. **hc EXEMPT with a stated rationale** — both hc cells resolve to CSS system colours and cannot be numerically graded. Explicit, not silent.
5. **RED-first with a control-of-the-control**: exactly the 4 named failures RED **by name** before m03's fix, the other N−4 PASS in the same run (proving they resolve rather than throw — the evaluator returns `passed:false` on any exception), and 0 failures after.
6. **Reconcile with the existing second grader** (`scanBrandContrast`) rather than adding a third. State the division of responsibility.

**Claim ceiling.** "Every graded brand×theme cell passes its threshold, and the grading runs in CI." NOT "brand output is accessible" — hc exempt, pair set bounded and enumerated.

### m05 [M] — Retire brand.css

**Requires m04.**

1. **Re-point `tests/tokens/brand-semantic-bridge.test.ts:27` FIRST** — it reads `brand.css` as the 41-slot contract; deleting first turns the s167 proof red.
2. **THE 3 FOCUS SLOTS ARE A BLOCKER, NOT A DEFERRAL** (critic). `brand.css` is the **only** source of brand-distinct focus values, in all six cells (`:99-101`, `:152-154`, `:204-206`). v1's criterion asked only that "no slot goes undefined" — **definedness is not preservation**. Either land the focus TOKEN here or accept and record a real visual regression. §4's deferral of this item is **withdrawn**.
3. **Relocate the forced-colors block** at `:417-421`. v1 claimed "nothing else declares `forced-color-adjust: none`" — **the critic says that is false**; verify before relying on it.
4. **Re-verify the cascade in ALL THREE import graphs** — `index.css`, `globals.css`, `.storybook/preview.ts`. F1 measured only the first.
5. **Remove 3 import lines**; confirm the `--brandA-*`/`--brandB-*` primitives have no live consumer — note the "lint fixture" is `BrandBleed.canary.tsx`, a real story, not a string.
6. **Update the docs** that say brand mapping lives in brand.css, and the generator header comments citing it as the slot source.
7. **`a11y-contract` is NOT a sufficient safety net** (critic: it names 6 stories, none brand-relevant). Do not lean on it; assert the palette directly.
8. **DO NOT touch `layers.css`.** 57 `:root` + 57 dark slots, ~42 `--cmp-*` blocks, the `--theme-dark-*` fallback chain, and `scripts/quality/contrast-audit.mjs:10` consumes it.
9. **Fix the wrong comment** at `style-dictionary.config.cjs:106-109` — it carries the bogus 183 and compares against a single-attribute selector the bridge never emits. **Write the corrected rationale from §1 F5, not v1's false "oklch hue" story.**
10. **Dispose of `artifacts/tokens/brand-css-drift-s167.md`** — after this it compares against a deleted file and contains numbers this memo corrects. Supersede or annotate it.

**Claim ceiling.** "The duplicate hand-authored brand layer is gone, the source-order tie is removed, and all six cells now resolve from the generated pipeline." NOT "the hand-authored theme layer is retired" — `layers.css` (57+57) and `apps/explorer/src/styles/tokens.css` (**106**, and its header says auto-generated — verify before calling it hand-authored) remain, ~110+ slots across 2 files.

### m06 [M] — Control hardening + rendered-surface proof

**Requires m03** (both expected tables are functions of m03's token values).

1. **(a) `:root` value-audited in full** — union of A/base's 41 and B/base's 41 = 82; assert every entry; assert no dark/hc value appears. **NOTE:** v1's extra assertion "`:root` carries no dark/hc value for any of the 82" becomes a FALSE POSITIVE after m03 if any base and dark value coincide — derive it, do not hard-code.
2. **(b) Build the two oracles that DISCRIMINATE** — containment (a `[data-brand='A']` block declares zero `--oods-color-brand-b-*`) and corresponding-slot. **The `otherBrand` loop is VACUOUS** (A/B key sets disjoint, intersection 0 of 41) — do not build it. Hard limit: A and B are byte-identical on all 41 hc slots, so only containment covers hc.
3. **(c) Collision-guard cross-brand seed** — must EDIT an already-loaded file (`sourceForScope` names `brands/{A,B}/base.json` literally; a new file under `brands/B/` is never loaded and the test would be vacuously green). Restore in a `finally`.
4. **(d) The no-op test compares RESOLVED values.** Use `dist/tailwind/tokens.json`'s `cssVariables` (771 keys, **verified zero `var(`**), mapping `--theme-x` → `--oods-theme-x`. **Verified twice by independent routes: A/base 19 same / 19 differ, all five other cells 38/38 differ.** The critic disputed this having compared declaration TEXT — the vacuous comparison this criterion exists to replace. **After m03's status re-authoring the 19 becomes ~0** — derive the table from source, never hard-code it, and state the m03 dependency.
5. **RENDERED-SURFACE PROOF — the mission's real deliverable, and it must be discriminating.** One computed-style assertion in a browser on a real surface. Constraints: (i) **only base/light is meaningful before m05** — dark/hc would confirm brand.css, not the bridge; (ii) pick slots where the bridge and brand.css genuinely DIVERGE, or the assertion passes either way; (iii) assert the resolved computed value, not the declaration. Use the existing storybook/a11y-contract browser infrastructure.
6. **Delete the stale comment** at `brand-theme-matrix.test.ts:75-76` (`ref.typography.*` leak claim — measured: 0 non-`color.brand.*` leaves in every brand file).

**Claim ceiling.** "The controls discriminate, and one brand×theme cell is confirmed to resolve correctly in a real browser." NOT "the brand pipeline is proven end-to-end."

### m07 [S] — Closeout

Full gate sweep by NAMED invocation, sequential (rule 17). Line-item charter-diff; deviations amend this memo in the same change. Per-golden line-item review under the chartered #564 exception. **Consumer loop-closure for BOTH m01 (public MCP schema change) and m02.** Restart the pm2 bridge if dist changed. **NOT self-certified.**

| gate | invocation | baseline |
|---|---|---|
| viz-core | `pnpm --filter @oods/viz-core exec vitest run` | 1205 / 61 |
| root core | `npx vitest run --project core` | 4666 + 20 skipped = 4686 / 432 |
| guardrails | `npx vitest run --project guardrails` | 5 / 2 |
| mcp-server | `pnpm --filter @oods/mcp-server run test` (after `build:packages`) | 3962 + 16 skipped = 3978 |
| scale | `pnpm --filter @oods/mcp-server run test:scale` | 62 |
| tokens | `pnpm run tokens-validate` (HYPHEN composite) | green, 322 tokens |
| collision guard | `pnpm run tokens:collision-guard` | 0 / 6 scopes |
| idempotence | `pnpm run check:tokens` | up-to-date |
| typecheck | root `pnpm typecheck` AND `pnpm --filter @oods/viz-core run typecheck` | PASS |
| lockfile | `pnpm install --frozen-lockfile` | clean |
| **lint (v1 OMITTED THIS)** | `pnpm run lint:tokens` + repo lint | green — `tools/token-lint` runs over `packages/tokens/src`, which m03 edits |
| **docs API** | `pnpm -w run docs:api -- --check` | green — m01's enum widening reds it unless regenerated |

**Predicted blast radius — enumerate, do not under-call.** v1 predicted one file; the critic showed the real list is larger. At minimum: `dashboard.render.fidelity.test.ts.snap` (**two goldens — the HTML export AND an a11yContrast block**), the two s167 control tests m03 re-anchors, and anything consuming brand token values. **Enumerate fully before starting; an unpredicted golden move stops the line.** STOP THE LINE if `packages/viz-render/test/__snapshots__/emitter.spec.ts.snap` moves.

---

## §4 — Explicitly deferred

- **PT seed.** PT ships **light-only** (zero PT-branded tokens vary by theme) while Forge's contract needs base+dark+hc; the Figma carries **56 leaves of other people's tokens** (17 Apple UI-kit). Six of the 38 bridge slots have no PT source. **A client conversation, not engineering.**
- **Breakpoint axis.** [S] plumbing post-s167, but the payload is **12 number tokens**, desktop vs tablet differing in ONE. Not worth an axis yet.
- **MCP brand threading.** v1's reason ("compact strips tokens.css") was called **false and self-serving** by the critic and is withdrawn as stated. Deferred instead because it depends on m04/m05 landing first — the bridge must be the sole source before threading brand means anything.
- **`layers.css` + `apps/explorer/src/styles/tokens.css`.** ~110+ slots across 2 files; contrast-gate data source. Its own arc.
- **Swift colour transform** — 381 non-compiling `oklch()`; wider than #1344. **Also correct `forge-s166-m03-...findings.md:23`** (259 → 381), which is unflagged and will mislead the mobile walk.
- **The ~14 facet/repeat-invalid fixtures** — recorded by m02, not fixed.
- **Trait-parameter-schema enforcement** — separate mission.
- **A genuinely distinct status identity for brand A** — a design exercise (§1 F4).

---

## §5 — Standing rules in force

1. **Rule 9** — build from THIS memo only. 2. **Rule 10** — review is a separate session.
3. **Rule 13a/18** — a control that cannot discriminate is not a control.
4. **Rule 16 + its VALUE-axis twin** — a name-set oracle certifies an enumeration.
5. **Rule 17** — pin every gate baseline to its exact invocation.
6. **Rule 19 (+ qualifier)** — re-measure disagreements in the main loop, **using the same operand and path as the disputed claim**; otherwise the main loop confidently overrules a correct agent. Happened this session.
7. **Denylists derive from the SURFACE, not the CORPUS.**
8. **When the artifact is a CASCADE, the operand is the RESOLVED value.**
9. **Point the guard at the defect's OWN home.**
10. **Re-measure inherited numbers at planning time** — nine stale figures across three sessions.
11. **Line-item charter-diff at mission-complete.** 12. **Guard-ships-its-bite-proof.**
13. **Measure through the ENFORCING oracle's own path** (new, s168) — a more faithful measurement taken outside the gate is the WRONG number.
14. **A rationale is a claim and needs measuring too** (new, s168) — v1 shipped a confident-but-false explanation for the 183, and nearly shipped it into a source comment. Explanations get verified like numbers.

---

## §6 — Critic record

**v1 → REJECT on 4 of 5 lenses; 27 blockers / 45 majors / 22 minors** (wf_0a70b4b5-887).

**Blockers accepted and fixed in v2:** the shared-`DEFAULT_CONTRAST_RULES` breakage (→ m04 c1, independently verified); rule-string normalisation (→ m04 c2, hit live); 4 contrast failures not 2 (→ §1 F2); the 183 explanation was false (→ §1 F5, §5.14); m02 had no RED-first (→ m02 c3); numeric `baseline: 0` uncovered (→ m02 c2); allowlist degenerate in the drop direction (→ m02 c4); `fill` not caught by an allowlist (→ m02 c5); corpus cannot exercise 12 of 14 keys (→ m02 c6); m05/m06 not independent of m03 (→ §2 DAG); m03 turns two s167 controls red (→ m03 c5); the 3 accent slots have no ratified source (→ m03 c1); focus slots are a blocker not a deferral (→ m05 c2, §4 withdrawn); `docs:api --check` and `lint:tokens` missing from gates (→ m07); `tokens.build.input.json` also pins the enum (→ m01 c4); m04 (was m03) sizing, m05/m06 sizing (→ §2); `:where()` zero specificity (→ §1 F1); single import graph (→ §1 F1 scope limit, m05 c4); m04 had no claim ceiling (→ added); the second grader (→ m04 c6); MCP-threading deferral reason false (→ §4).

**Findings REFUTED by main-loop re-measurement, recorded so they are not re-raised:**
- *"m05(d)'s 18–19/38 table does not reproduce."* It reproduces exactly — verified twice by independent routes (var-chain resolution and the `cssVariables` map): A/base **19 same / 19 differ**, all other cells **38 differ**. The critic compared declaration TEXT, which is the vacuous comparison the criterion exists to replace.
- *"The ratified orange dark palette fails AA on two pairs that pass today."* Zero conflicts across all 17 measurable pairs (§0).
- *"183 is not a transcription error."* Half right: 183 IS a real `grep -c` output — of LINES containing `--theme-`, including `var()` references. Declarations are 57 at `:root`. Both v1's figure and v1's explanation were wrong; the corrected account is in §1 F5.

**Not yet re-verified, flagged for the build session to confirm before relying on:** the contested mark-bearing fixture count; "6 of 17 marks violate trait schemas"; whether `forced-color-adjust: none` is declared elsewhere; whether `apps/explorer/src/styles/tokens.css` is generated or hand-authored.

---

## §7 — Build record (line-item charter-diff, rule 11)

### m01 — brand.apply containment guard + enum widening — **SHIPPED**

**Charter items, line by line.**

| # | charter item | disposition |
|---|---|---|
| 1 | allowlist DERIVED from `readdirSync(BRAND_ROOT,{withFileTypes:true})`, directories only, `''`/`'.'`/`'..'` rejected explicitly | **DONE** — `listAllowedBrands()` + `assertBrandAllowed()`. Widening a third brand is now a schema edit plus a directory; this file needs no second edit. |
| 2 | containment as defence-in-depth, reuse `OODS-S015`, no `realpath`, symlink gap disclosed, **independently red-able** | **DONE** — `resolveBrandThemeFile()` exported and directly unit-tested. Symlink gap disclosed in the source comment AND in `docs/mcp/Brand-Apply.md`. |
| 3 | both secondary sinks closed (`:519` filename, `:317` CSS variable) | **DONE** — validation runs at the top of `handle()`, so both sinks receive an already-validated id. |
| 4 | widening is repo-wide across six surfaces + `docs:api --check` | **DONE**, and the surface list was **larger than the charter's six** — see deviations. |
| 5 | bite proof at two levels, asserting the **error code** | **DONE** — 13 handler-level + 3 schema-level tests. |
| 6 | `themes[]` resolved — wired in or removed, state which | **REMOVED.** See ruling below. |
| 7 | consumer loop-closure required | **CARRIED to m07** as chartered. |

**RED-first measurement against HEAD (recorded because it is sharper than §1 F6).** F6 framed the defect as an unguarded `readFileSync`. Measured at the handler, it was worse than that: `'A/../B'` and `'A/'` were both **ACCEPTED**, silently loading a brand other than the one named and writing a transcript under it. `'../../../../../../etc'`, `'..'`, `''` and `'.'` surfaced as a raw `ENOENT`, and a numeric brand as a raw `TypeError`. **Zero guarded rejections existed.** F6's "NOT exploitable over MCP today" still holds — ajv at `index.ts:257` rejects all six before `handle()`.

**Two codes, one per layer — deliberate.** Allowlist rejects with `OODS-V001` (the same code ajv emits for an enum violation, so both boundaries agree); containment rejects with `OODS-S015` (matching this file's existing usage at `:430`/`:506`). A test that sees `S015` therefore knows it hit containment and not the allowlist — which is what makes the layers separately observable.

**Mutation proof (rule 12, guard-ships-its-bite-proof), both directions:**
- Delete the `withinAllowed` call → **exactly the 3 containment tests red**, all 7 allowlist tests green.
- Bypass `assertBrandAllowed` at the handler → **exactly the 7 allowlist tests red**, all 3 containment tests green.

Neither layer can be removed silently, and neither test can pass on the other's behalf.

**Why the allowlist cannot be replaced by containment alone.** `path.join()` collapses `''`, `'.'` and `'A/'` to *legal, readable* paths inside `BRAND_ROOT`. Containment is blind to all three; only an exact-name match rejects them.

**`themes[]` RULING — REMOVED, not wired in.** Unreachable over MCP since s85 (`additionalProperties:false` without it), zero consumers anywhere in `src/`, `test/`, `tools/` or the SDK, and `activeThemes` was already `THEMES` on every reachable path. Wiring it in would have added public MCP surface with no puller — the re-circularity this project has ruled against — and would have had to resolve a latent inconsistency first (the apply loop at `:518` writes **all three** themes regardless of scoping). Removed from `types.ts` and from the handler; `activeThemes` collapses to `THEMES`. `BrandApplyInput` is re-exported through `public-types.ts:121` → `packages/sdk`, so the removal propagates to the SDK type automatically; no SDK edit needed and nothing referenced the field.

**DEVIATION — the widening surface is larger than charter item 4 named.** The charter listed six surfaces. A four-lens sweep (wf_d92bc5d4-e64) plus main-loop verification of every hit found **five more**, each independently confirmed before editing:

1. `packages/mcp-server/src/schemas/style-library-contribution.schema.json:34` — a **partner-facing** schema description asserting "brand.apply enumerates ['A'] today". Corrected.
2. `docs/mcp/Brand-Apply.md:9` — "currently only Brand A is supported". Corrected, plus the guard's two layers and the symlink gap documented.
3. `docs/cookbook/03-multi-brand-theming.md:50,91` — a recipe **headed "Apply Brand B overlay" that passes `brand:'A'`**, teaching an agent that a B change is made through the A slot. Corrected to `'B'`.
4. `docs/cookbook/03-multi-brand-theming.md:97` — "Now the token output reflects Brand B's green palette" after a `brand:'A'` build. Rewritten to the truth (the build emits every cell; `brand` labels the payload).
5. `packages/mcp-adapter/tool-descriptions.json` — "Build design tokens for a brand and theme". Corrected: **verified** that `tokens.build` runs the whole build and copies `dist/tailwind/tokens.json` wholesale, stamping only `meta.brand`/`meta.theme`. Widening its enum opens **no new sink** — `brand` reaches no path there — but it would have created a false affordance the moment `B` became legal.

**MEASURED HAZARD, disclosed not fixed.** The three shipped presets in `packages/tokens/src/presets/` address `color.brand.A.*` literally. Applying one with `brand:'B'` now succeeds and merges a `color.brand.A` subtree **into brand B's files** — measured through the handler: 6 changes, **zero** under `color.brand.B.*`. Re-namespacing the preset payloads is a content decision outside m01's charter, so the hazard is disclosed in `docs/theming.md` rather than silently shipped. **Carry candidate.**

**Not changed, deliberately:** `packages/mcp-adapter/sanitize-schema.test.js:348` — a self-contained inline literal in a test named "fully sanitizes a brand.apply-like schema". It never imports the real schema and asserts nothing about the brand enum.

**Gates run for m01** (full sweep is m07's): `pnpm --filter @oods/mcp-server run test` **3978 passed + 16 skipped** (baseline 3962 + 16; **+16 owned delta**, exactly the 16 tests added) · root `pnpm typecheck` PASS · `pnpm --filter @oods/schemas-tools run generate:check` clean · `pnpm -w run docs:api -- --check` "26 files checked, no orphans" · `pnpm run generate:schema-types -- --check` unchanged · eslint on all changed files adds **zero** findings (the 3 pre-existing `panel.tsx` errors and 1 pre-existing `brand.apply.ts` warning are byte-identical at HEAD).

**Repo-wide brand-id sink audit (ran because widening a brand enum is only safe if you know where brand ids go).** Every sink main-loop verified:

- **`brand.apply.ts` CSS-comment sink** — the brand is interpolated into a comment written to `variables.css`; a brand containing `*/` would break out of it. **Now closed** by the same allowlist, and it was not in the charter's two-sink list. Third sink, closed.
- **`render/document.ts:264`** — the audit flagged a free-form `brand` (no enum anywhere, `normalizeBrand` defaults to `'default'`) reaching an HTML attribute. **REFUTED on re-measurement:** it is `escapeHtml()`-wrapped at the sink, on both the `<html>` and `<body>` emissions. Free-form but escaped. No action.
- **`tools/stage1-dtcg/cli.ts:47-48` — the one genuinely unguarded fs sink in the tree.** `--name <basename>` flows into `join(outDir, fileName)` → `writeFileSync` with no validation and no containment. **NOT fixed here, deliberately:** it is a different tool (the PT brand-seed writer), off the MCP wire, and both `--out` and `--name` are operator-supplied on a local CLI, so no privilege boundary is crossed. Notably the segment that *does* come from foreign data — `slug`, from Figma mode names — is already slugified at `adapter.ts:96-102`. **CARRY:** a two-line basename check closes it.
- `style-dictionary.config.cjs`, `brand-bridge.mjs`, `tokens-governance`, `gov/triage.mjs`, `lint/brand-bleed.ts`, `ci.yml` — all reached only from frozen `BRAND_SCOPES` lists, an `'A'|'B'` type, or a `[A-Za-z]+` regex class. No action.
- `tokens.build.ts` — **negative result recorded so it is not re-audited:** the brand never reaches a path; it is written only into the JSON `meta` block.

**Claim ceiling held.** "The read is contained and the enum is enforced at both boundaries." NOT "brand.apply is secure" — the symlink gap remains, disclosed in source and in the tool doc.

---

### m02 — FF#22 corrective — **SHIPPED**

**Charter items, line by line.**

| # | charter item | disposition |
|---|---|---|
| 1 | allowlist from the real MarkDef list; **adapter static, test derives** | **DONE** — `MARK_DEF_PROPERTIES` (88 names) in the adapter; the test re-derives from the installed schema and asserts equality. |
| 2 | translations `curve`→`interpolate`, `baseline`→`scale.zero` incl. numeric `0`, in the **encoding region** | **DONE** — `translateMarkOption` (mark-def region) and `applyBaselineToEncoding` (encoding region). |
| 3 | RED-first, **red for the stated reason** | **DONE** — per-key error path + keyword recorded below. |
| 4 | passthrough-survival control | **DONE** — per trait, asserting values not just presence. |
| 5 | `fill` needs a VALUE control — state which | **TRANSLATED**, see below. |
| 6 | synthetic + corpus; re-derive the fixture count and state the definition | **DONE** — 42, definition stated, duplication measured. |
| 7 | oracle shape-agnostic; the `/^\/layer\/\d+\/mark/` filter must go | **DONE** — filter deleted. |
| 8 | filter stays OUTPUT-only | **DONE** — plus an explicit IR-immutability test. |
| 9 | do NOT enforce trait parameter schemas | **NOT DONE, deliberately** — and now measured, see below. |
| 10 | predicted movement stated precisely | **EXACT** — mark-def region, encoding region, the s167 test file. Nothing else moved. |

**RED-FIRST, per key, as a standalone MarkDef against the pre-fix adapter.** Not `valid === false` — the actual path and keyword:

| key | pre-fix result |
|---|---|
| `orientation`, `bandPadding`, `stacking`, `join`, `enableMarkers` | `/` **additionalProperties** |
| `baseline: 'zero'` | `/baseline` **enum/const** (TextBaseline) |
| `baseline: 0` | `/baseline` **type** |
| `fill: 'hollow'` | **VALID** — and wrong |
| `curve` | already stripped by s167's denylist (dropped, not translated) |
| `opacity`, `tension`, `cornerRadius`, `strokeWidth`, `shape`, `size` | valid — genuine passthrough |

Corpus, same run: **42 mark-bearing fixtures → 4 invalid mark defs → 0 after the fix.**

**`fill` RULING — TRANSLATED, not denied and not colour-checked.** `fill:'solid'|'hollow'` becomes `filled: true|false`, which is the exact Vega-Lite spelling of what the OODS point vocabulary means. Denying would have discarded real design intent; a colour check would not have restored it. **Disclosed limit:** a `fill` carrying some *other* non-colour string still passes through, because separating a CSS named colour from garbage needs a colour table this adapter has no business owning. The control asserts the emitted mark def never carries the OODS vocabulary; it does not assert every `fill` is a colour.

**CHANNEL CHOICE for `baseline`, stated because it is a judgement call.** `y` if quantitative, else `x`, else nothing emitted; a caller-declared `scale.zero` always wins. `orientation` — the only other signal about which axis is the measure — is itself an OODS-only key with no MarkDef target, so it cannot be relied on.

**MUTATION PROOF.** Restoring s167's two-key denylist reds **exactly 11** of the 40 tests — the six declared-surface keys, all three translations, and the corpus sweep — while **all 29 s167 keep-greens stay green**. That is the precise shape of the original defect: s167's denylist was *insufficient*, not *wrong*, and its own oracle could not see the difference.

**RE-DERIVED NUMBERS (the memo's "not yet re-verified" list, partly discharged here).**

- **The mark-bearing fixture count is 42**, and the contested "duplication-inflated" charge is **CORRECT**: only **31 are distinct by content**; `examples/viz/patterns/` and `patterns-v2/` hold **11 byte-identical twins**. **DEFINITION** (now pinned in the test): a `.json` file under the repo whose top-level object has a `marks` array containing an entry whose `trait` starts with `Mark`. Only **12** of the 42 carry `mark.options` at all, between them **7** distinct keys.
- **The enumeration method does not change the answer** — a filesystem walk and `git ls-files` produce the *identical* 42, zero differences either way. The test uses the walk so it carries no external-process dependency (no other test in this repo shells out to git). The two differ enormously at the `.json` level (**7,908** walked vs **460** tracked), which is the gap behind the inherited "7,735 specs swept" figure: that sweep counted untracked files.
- **THE 14-KEY LEAK SET IS CONFIRMED**, and its derivation is now reproducible as a **union of three surfaces**, which is why no single-source derivation found it: the declared trait vocabulary (14 unique keys, 6 invalid by name), the committed corpus (7 keys, 3 invalid), and the read-sets of the *other* consumers (ECharts adapter `id`/`name`/`stack`/`areaStyle`/`lineStyle`/`itemStyle`/`symbolSize`/`curve`; React views `title`/`id`). Union of non-MarkDef keys = **areaStyle, bandPadding, curve, enableMarkers, id, itemStyle, join, lineStyle, name, orientation, stack, stacking, symbolSize, title** — 14, of which s167's denylist already covered 2, leaving the memo's 12.
- **"6 of 17 marks violate trait schemas" — the memo's "wrong by ~3×" note is itself WRONG.** Measured: **47** committed mark entries, **17** carry `options`, and **exactly 6 of those 17** violate their own trait parameter schema. The original figure was right; the ~3× came from comparing 6/47 against 6/17. Violations are `id` (1), `baseline` (2), `fillOpacity` (2), `strokeDash` (1) — and note **`fillOpacity` and `strokeDash` are genuine, valid Vega-Lite passthrough that the trait schemas simply do not declare.** Enforcing trait parameter schemas today would red six fixtures that emit perfectly valid Vega-Lite. That is now a measured reason for the deferral, not a hunch.
- **"Zero snapshots contain `baseline`" — RE-VERIFIED and widened.** There are **16** `.snap` files, not 8; all 16 contain zero occurrences of `baseline`, `curve` or `interpolate`. After the change, **no snapshot moved**.

**DEFERRED, now with a measured size.** **14** of the 42 mark-bearing fixtures remain invalid as WHOLE SPECS: 3 fail at `/params/0` (additionalProperties), 11 at `/` (required). **The inherited attribution of that bucket to "facet/repeat" did NOT reproduce** and is not carried forward.

**Gates for m02:** viz-core `pnpm --filter @oods/viz-core exec vitest run` **1205 / 61 — baseline exact, zero delta** (the new tests live in the root `core` project) · root `npx vitest run --project core` **4714 passed + 20 skipped / 432 files** (baseline 4666 + 20; **+48 = m01's 16 + m02's 32**, exact) · guardrails **5 / 2** exact · mcp-server **3978 + 16 skipped** after `build:packages` · root and viz-core typecheck PASS · eslint on both changed files: **zero findings** · **`packages/viz-render/test/__snapshots__/emitter.spec.ts.snap` did not move** (the stop-the-line condition).

**Claim ceiling held.** "No OODS-only key reaches the emitted mark def, every declared trait option is covered by a probe, and every committed mark-bearing fixture emits a schema-valid mark def." NOT "FF#22 is closed." NOT "the emitted spec is valid."

---

### m03 — Brand palette truth-up — **SHIPPED**

Every number below was measured **through the repo's own evaluator path** (`normaliseColor` → colorjs.io → sRGB hex, which CLIPS → `contrastRatio`), per standing rule 13.

**§0 IS WRONG, AND IT IS THE MOST IMPORTANT FINDING IN THIS MISSION.**

§0 states: *"All 17 measurable text/icon pairs in the ratified orange dark palette PASS WCAG AA… **Zero pairs where orange fails and teal passes.** Adopting the ratified palette costs no accessibility."* It records a critic lens alleging a conflict between Derek's palette ruling and his contrast ruling, and marks that allegation REFUTED.

**Measured after transcribing the ratified palette, the conflict is REAL:**

| A/dark pair | teal (before) | ratified orange | needed |
|---|---|---|---|
| `text.onInteractive` on `surface.interactive.primary.hover` | passed | **4.4090** | 4.5 |
| `text.onInteractive` on `surface.interactive.primary.pressed` | passed | **3.5942** | 4.5 |

The refutation was measured over an incomplete pair set: §0 checks `text.onInteractive` against the **default** interactive surface (5.392) and never against **hover** or **pressed**. The cause is structural, not a typo — the ratified orange ramp **brightens** on interaction (L 0.52 → 0.57 → 0.62) against a near-white foreground, so contrast **falls** as the user interacts. The outgoing teal ramp paired near-BLACK text (L 0.12) with brightening surfaces, so it rose. **A brightening ramp and a near-white foreground cannot both hold — the ratified palette contains a genuine AA defect.** Derek's two rulings resolve it without conflict: keep orange (ruling 1), fix it at the token value (ruling 2).

**SEVEN failures fixed, not the chartered four.** All four named in §1 F2 reproduced to four decimal places. Three more were found by sweeping **base AND dark** (§1 F2's 34-pair sweep is base-only):

| # | cell / pair | before | after | what moved |
|---|---|---|---|---|
| 1 | A/base `text.onInteractive` on interactive.default | 4.2465 | **4.6136** | background, ΔL −0.02 |
| 2 | B/base `text.accent` on canvas | 4.4717 | **4.6498** | foreground, ΔL −0.01 |
| 3 | B/base `text.onInteractive` on interactive.default | 3.2683 | **4.6437** | background, ΔL −0.085 |
| 4 | B/base `status.warning.icon` on warning.surface | 2.9966 | **3.1127** | foreground, ΔL −0.01 |
| 5 | **A/dark** `text.onInteractive` on interactive.**hover** | 4.4090 | **≥4.6** | background, ΔL −0.03 |
| 6 | **A/dark** `text.onInteractive` on interactive.**pressed** | 3.5942 | **≥4.6** | background, ΔL −0.06 |
| 7 | **B/dark** `text.onInteractive` on interactive.**pressed** | 4.0434 | **≥4.6** | background, ΔL −0.035 |

Backgrounds moved in six of seven: with a near-white foreground already at L 0.97, there is no foreground headroom left. **Final state: all six cells, 88 resolvable pairs, ZERO failures.**

**DISCLOSED SIDE EFFECT — three interaction ramps are now compressed.** Fixing only the failing token (the minimal-scope choice) narrows the perceptual step between states: A/dark to L 0.52 → 0.54 → 0.56, B/base default lands at 0.535 against a hover of 0.52, B/dark pressed at 0.525 against a hover of 0.51. Every state still resolves and orders correctly, but the *feel* of the pressed step is reduced. Re-spacing those three ramps is a **design** decision, not a contrast fix, so it is disclosed rather than taken. **CARRY.**

**THE 3 ACCENT SLOTS — DERIVED, and the rule is inherited rather than invented.** `brand.css` assigns no accent slots, so they have no ratified value. Rather than pick colours, I read the relationship the **outgoing teal palette itself** used and preserved it: `accent.border` == `surface.interactive.primary.default` and `accent.text` == `text.accent` (in teal, both pairs were byte-identical), and `accent.background` == canvas + ΔL 0.08 at the accent hue (teal: canvas 0.14 → accent.bg 0.22). Applied to orange: `0.52 0.2 45`, `0.79 0.17 45`, `0.26 0.09 45`. Teal accents inside an orange palette were never an option.

**STATUS PROVENANCE — the defect was worse in A than §1 F4 implies, and B/base is not affected at all.** Measured byte-equality against every non-brand token in the tree:

| cell | status literals that are byte-copies of a reference value |
|---|---|
| **A/base** | **19 of 20** (from `base/reference/color.status.json`) |
| **A/dark** | **20 of 20** (from `themes/dark/status.json`) |
| B/base | **0 of 20** — fully brand-owned already |
| B/dark | 5 of 20 |

F4 argued from ΔE ("brand B's ramp is not meaningfully branded either"). By **provenance** — the property the charter actually names — B/base already owns all 20 and brand A owned almost none. **Both A cells re-authored**: each status hue nudged toward the brand hue 43 along the shortest arc, capped at 8°, with L and C left byte-identical so contrast is preserved by construction and then re-measured to prove it. **Result: A/base 0/20 copies, A/dark 0/20 copies, and zero contrast regressions.** **THEMES COVERED: base AND dark** (m06's expected divergence table depends on this answer). hc is untouched — it resolves to CSS system colours. NOT taken: a genuinely distinct status identity for brand A, which remains a design exercise.

**$description AUDIT — shipped as a TEST, not a one-time sweep.** 19 numeric ratio claims across the four non-hc cells. `testing/a11y/brand-description-truth.spec.ts` parses every `N:1` claim out of all six brand files, maps it to the pair it is about, and measures through the evaluator. It **immediately caught three false claims** — the two §1 F2 named (`A/base text.onInteractive` "(4.9:1)", `B/base text.onInteractive` "(≥4.7:1)") **and one this mission had just written**: a description saying "measured 4.65:1" for a pair measuring 4.6498. **Ratios are now FLOORED to 2dp, never rounded.** The test fails on an unmapped claim rather than skipping it, so a new token cannot arrive with an ungraded assertion.

**THE DISABLED PAIR — description corrected, colour deliberately NOT.** Six descriptions across three cells claimed "≥3:1" for `text.disabled` on `surface.disabled` and measured 1.7620 / 1.8811 / 2.5945. **WCAG 1.4.3 exempts inactive components from any contrast requirement, and the low contrast IS the disabled affordance** — raising it to 3:1 would invent a requirement WCAG does not impose and erase the signal. Derek's ruling covers *contrast failures*; a WCAG-exempt pair is not one. So the **description** was the defect: each now states the measured, sRGB-clipped ratio and the exemption.

**A THIRD hard-pinned control the memo did not predict.** m03 c5 named `brand-theme-matrix.test.ts:219-220`. `brand-semantic-bridge.test.ts:216-217` pinned two more literals and went red for a reason unrelated to what it tests. **Both re-anchored the same way**: derive the premise the seed actually needs (both cells resolve, and they disagree) instead of pinning values. A pin that must be hand-edited whenever a token changes is a maintenance trap — and hand-editing it is indistinguishable from silencing it. Swept afterwards: **zero** hard-pinned `oklch(` literals remain in any test.

**GOLDEN MOVEMENT — exactly one, predicted, and explained line-item.** `dashboard.render.fidelity.test.ts.snap`, HTML export golden, **two values**: `--oods-color-positive` rgb(24,94,67) → rgb(36,93,60) and `--oods-color-negative` rgb(155,44,44) → rgb(155,47,26). Provenance traced to `dashboard.render.html.ts:41-42`, which maps them to `brand-a-status-success-text` and `brand-a-status-critical-text` — hues 163.04 → 155.04 and 24.94 → 32.94, exactly the ±8° nudge. **Accessibility consequence measured, not assumed:** both still clear their 4.5 rule on panel-bg (6.3641 → 6.3992 and 6.2058 → 6.1510), which is why the second golden in that file (the `a11yContrast` block) did **not** move.

**hc EXEMPTION VERIFIED, not assumed:** both hc cells return **0 resolvable pairs** — every value is a CSS system colour. Pinned as a test.

**Gates for m03:** guardrails **8 / 3** (baseline 5 / 2; **+3 owned**, the one new file) · root core **4714 + 20 skipped** (unchanged — the new test is in `guardrails`) · mcp-server **3978 + 16 skipped** · `pnpm run tokens-validate` green, 32 viz checks · `pnpm run tokens:collision-guard` **0 violations / 6 scopes** · `pnpm run check:tokens` up-to-date · `pnpm run lint:tokens` adds **zero** findings (the one WARN is in `aliases/brand-B.json`, untouched, and reproduces with these changes stashed) · **`emitter.spec.ts.snap` did not move.**

**Claim ceiling held.** "Brand A's dark palette matches the ratified design, all measured failures pass with margin, and every numeric ratio claimed in a brand `$description` is measured true." NOT "the brand palettes are accessible" — grading is m04, hc is exempt, and only text/icon-on-surface pairs are covered.

---

### m04 — Brand contrast GRADING — **SHIPPED**

**`DEFAULT_CONTRAST_RULES` is byte-untouched** (`git diff` on `rules.ts` is empty). `BRAND_CONTRAST_RULES` ships beside it in a new `packages/a11y-tools/src/brand-rules.ts`, evaluated only against a brand-bearing map. The two consumers reading the brand-free structured-data artifact are unaffected — the full mcp-server suite, including the contract test asserting zero issues against that fixture, is **3978 + 16 skipped**, unchanged.

**THE TOKEN-MAP PLUMBING IS NOT `flatTokens`, and that is a correction to the charter's premise.** m04 c1 describes `flatTokens` as the brand-bearing source ("122 brand keys present"). It is — but **MEASURED: zero of those 122 are dark or hc.** They are 82 `color-brand-*` plus 40 legacy `brand-*` keys, *all of them the base cell*. Grading through `flatTokens` could only ever have covered base while looking complete — half the graded surface silently unmeasured. Each cell's map is therefore built from that cell's own token source, which is the only artifact holding all six. (Also verified, because two key families invite a divergence trap: the legacy `brand-a-*` and full `color-brand-a-*` entries **agree** on every slot checked.)

**Rules are GENERATED, and coverage is enforced.** 27 pair templates declared once, expanded across 2 brands × 2 graded themes = **108 rules**. A separate test parses the bridge's own `SEMANTIC_BRIDGE` slot map and asserts every bridged slot is either named by a rule or explicitly declared role-free (the backdrop scrim, the decorative borders, and the WCAG-exempt disabled pair). A newly bridged slot arrives graded or reds the build — the s167 failure mode (slot present in the artifact, named by no rule) cannot recur silently.

**Key strings pinned, and the resolve-check is separate from the ratio check.** `evaluate.ts` returns `passed: false` on *any* exception, so a rule with a wrong key looks exactly like a contrast failure. `brandFlatKey()` builds the flat form (`text.onInteractive` → `color-brand-a-text-on-interactive`), and a dedicated test asserts **every** rule's foreground and background RESOLVE before any ratio is asserted. The natural dotted form would have normalised to `brand-a-text-oninteractive`, which does not exist.

**RED-first — and the run corrects the memo again.** Evaluated against the pre-m03 tokens at `e5f2172`, the same rule set names **FIVE** failures, not four: the four in §1 F2 plus `brand-b-dark-on-interactive-pressed`, which §1 F2 missed because its 34-pair sweep is base-only. The other 103 rules **PASS in that same run**, which is what proves they were wired and resolving rather than absent or throwing. This runs every time, not recorded once.

**The two A/dark failures are NOT in the RED-first list, and that is the point.** At `e5f2172` A/dark was still teal, and teal *passed* hover and pressed. Those two exist only *after* the orange transcription — which is the §0 correction, now pinned as its own test: it reconstructs the ratified `brand.css` ramp directly and asserts `default` passes while `hover` and `pressed` **fail**, plus that the ratio falls monotonically as the ramp brightens. A future "transcribe brand.css faithfully" pass cannot silently restore the defect.

**hc EXEMPT — and the exemption's premise is asserted, not declared.** `BRAND_GRADED_THEMES = ['base','dark']`, with `BRAND_HC_EXEMPTION_REASON` carried next to the data. The test runs brand rules against an hc cell and asserts **every** resulting ratio is non-finite — so if hc ever stopped resolving to CSS system colours, the exemption reds instead of quietly under-grading.

**scanBrandContrast RECONCILED, not replaced.** Division of responsibility written into the source: `scanBrandContrast` is a **render-time** check on the four pairs the HTML export actually paints, over already-resolved hexes, brand A base only. `BRAND_CONTRAST_RULES` is a **build-time** check on the token SOURCE across every graded cell. They overlap on brand A base and answer different questions. No third grader was added.

**MUTATION PROOF.** Reverting `B/base surface.interactive.primary.default` to its pre-m03 value reds **exactly one** rule by name (`brand-b-base-on-interactive-default: 3.27 < 4.5`) while the resolve-check and hc tests stay green — so the red is a real ratio, not a resolution error. It **also** reds `brand-description-truth` independently, because that token's description now claims ≥4.64: two graders, different angles, same regression.

**Gates for m04:** guardrails **14 / 4** (baseline 5 / 2; **+9 owned across m03+m04**) · root core **4714 + 20 skipped** unchanged · mcp-server **3978 + 16 skipped** unchanged · root typecheck PASS · eslint on all three new/changed files: **zero** findings.

**Claim ceiling held.** "Every graded brand × theme cell passes its threshold, and the grading runs in CI." NOT "brand output is accessible" — hc is exempt, and the pair set is bounded and enumerated (27 templates, listed in `BRAND_CONTRAST_PAIRS`).

---

### m05 — Retire `brand.css` — **SHIPPED AS A REDUCTION, NOT A DELETION** (Derek-ratified deviation)

**THE DEVIATION, AND WHY IT WAS PUT TO DEREK.** The charter's deliverable was "brand.css deleted + 3 import lines removed", with the focus slots as a stated BLOCKER offering two ways out: land the focus token, or accept and record a visual regression. Measurement surfaced a **third option that dominates both**, and because the alternatives ship a user-visible consequence, it was a Derek call. **He chose reduce-not-delete.**

The measurements that produced the option:
- `brand.css` declares **41** distinct `--theme-*` slots: **38 bridged** + the **3 focus slots** the bridge's own `UNBRIDGED_SLOTS` already records as having no brand token.
- **`layers.css:64-67` and `:155-158` DO define all three focus slots**, as the shared NEUTRAL ring. So deleting `brand.css` would **not break** focus — it would silently **DE-BRAND** it in all six cells. "Definedness is not preservation" was right, and this is the precise shape of what would have been lost.
- `brand.css` also declares **76** `--brandX-*` primitives, and `BrandBleed.canary.tsx` reads two of them (`--brandB-surface-canvas`, `--brandB-text-primary`) — a **real story**, exactly as the charter warned, so deletion breaks it too.

**A tie needs two declarations of the same property.** Stripping the 38 bridged slots removes the overlap, so the tie dies by construction while the residue survives. **228 declarations removed (38 slots × 6 cells); 18 kept (3 focus slots × 6 cells).** The file went from ~430 lines to 153 and still parses clean (postcss: 9 rules, 97 declarations).

**Every claim in the mission's claim ceiling is met:** the duplicate hand-authored brand layer is gone, the source-order tie is removed, and all six cells resolve their 38 bridged slots from the generated pipeline. Only the *file deletion* is not done.

**Charter items:**

| # | item | disposition |
|---|---|---|
| 1 | re-point `brand-semantic-bridge.test.ts:27` FIRST | **DONE, and it was load-bearing** — see below. |
| 2 | focus slots are a BLOCKER | **RESOLVED** by the reduction; brand-tinted focus preserved in all six cells. |
| 3 | relocate the forced-colors block; **verify** the "nothing else declares `forced-color-adjust: none`" claim | **THE CRITIC WAS RIGHT — the claim is FALSE.** It is declared in at least **six** other stylesheets (`toast-portal.css`, `statusables.css` ×3, `table.css`, `empty-state.css`). Relocation was never the simple lift-and-shift the claim implied; the block **stays** with the residue and the correction is written into the file header. |
| 4 | re-verify the cascade in ALL THREE import graphs | **DONE**, and the invariant is now global: with zero bridged slots declared in `brand.css`, **no import order in any graph can change which side supplies them**. Pinned as a test across all three. |
| 5 | remove 3 import lines; check the primitives have no live consumer | **NOT DONE** — the imports stay because the residue is real, and the primitives **do** have a live consumer (the canary). |
| 6 | update the docs | **DONE** — `docs/theming/multi-brand.md`, `docs/themes/brand-a/README.md` (×2), `docs/themes/brand-b/README.md`. Zero stale references remain. |
| 7 | do not lean on `a11y-contract` | **Not leaned on** — the palette is asserted directly. |
| 8 | do NOT touch `layers.css` | **Untouched.** |
| 9 | fix the wrong comment at `style-dictionary.config.cjs:106-109` | **DONE, and its replacement figure was itself re-measured** — see below. |
| 10 | dispose of `brand-css-drift-s167.md` | **SUPERSEDED** with a banner. |

**THE RE-POINT WAS LOAD-BEARING, not bookkeeping.** `brand-semantic-bridge.test.ts` read the 41-slot contract *out of brand.css*. Reducing the file first would have silently shrunk a 41-slot contract to a 3-slot one **while staying green**. The list is now frozen in `tests/tokens/__fixtures__/brand-css-slot-contract.json`, captured immediately before the reduction. Stated trade: it no longer self-updates, so adding a bridged slot now requires touching the fixture — a deliberate act rather than silence, which is the property the test existed to protect.

**RULE 14 AGAIN — the replacement rationale needed measuring too.** The config comment carried "183" and justified the two-attribute decision against a single-attribute selector the generator never emits. Both corrected. **183 reproduces exactly** as a `grep -c` of LINES containing `--theme-` (including `var()` references). But the memo's replacement figure — "57 + 57 = 115 declarations" — is **also wrong**: measured per block, it is 57 at `:root`, 57 at `html[data-theme='dark']`, **and 2 more inside an `@supports (color: oklch(from white l c h))` block — 116**. The corrected comment states 116 and deliberately keeps the moving count out of the load-bearing prose, since pinning it there is how it went stale.

**MUTATION PROOF.** Re-adding a single bridged slot (`--theme-surface-canvas` to the A/dark block) reds **4 of the 5** tie tests, naming the slot; the residue test correctly stays green.

**Gates for m05:** root core **4719 + 20 skipped / 433 files** (was 4714 / 432; **+5 owned**, the one new test file) · guardrails **14 / 4** unchanged · mcp-server **3978 + 16 skipped** unchanged · `tokens:collision-guard` **0 / 6 scopes** · `check:tokens` up-to-date · root typecheck PASS · eslint **clean** (the one warning it surfaced — a now-unused `BRAND_CSS` constant — was removed) · reduced CSS parses clean under postcss.

**Claim ceiling, ADJUSTED to what shipped.** "The duplicated hand-authored brand layer is gone, the source-order tie is removed, and all six cells resolve their 38 bridged slots from the generated pipeline." NOT "brand.css is retired" — it survives as a 3-slot residue, and retiring it needs real focus tokens. NOT "the hand-authored theme layer is retired" — `layers.css` (116 declarations) and `apps/explorer/src/styles/tokens.css` remain, as chartered.

---

### m06 — Control hardening + the first rendered-surface proof — **SHIPPED, all six items**

**THE RENDERED-SURFACE PROOF — and m05 made it far stronger than chartered.** The charter asked for **ONE** computed-style assertion, on **base/light only**, because "dark/hc would confirm brand.css rather than the bridge". **m05 dissolved that constraint**: `brand.css` now declares zero bridged slots, so the bridge is the sole source in *every* cell. The proof therefore covers **all six cells — 228 computed-style assertions in real Chromium**, and every one passes.

`scripts/quality/brand-cascade-browser-proof.mjs` paints two probes per slot: one `background-color: var(--theme-<slot>)` through the whole cascade, one set to the literal the brand token source declares. Both are read with `getComputedStyle`, so **the browser converts both sides** — no oklch→rgb rounding question arises. CSS is injected in the real `index.css` order (generated → `layers.css` → `brand.css`), and that order is **asserted, not assumed**: the script throws if `layers.css` stops importing `@oods/tokens/css` or if `index.css` reorders. An unresolved variable paints `rgba(0,0,0,0)` and is treated as a **failure**, so a missing slot cannot pass by looking transparent.

**It can go red — proven.** `BRAND_CASCADE_PROOF_SELFTEST=1` injects a masking declaration last, exactly as a regressed stylesheet loading after the bridge would. The proof then exits **1**, naming `A/dark --theme-surface-canvas` and both painted values; the normal run exits **0**. Wired as `pnpm run verify:brand-cascade` and added to the **a11y-contract** CI job, which already installs Chromium — no new tooling, as chartered.

**(a) `:root` audited in full: 82 of 82.** Previously 1 of 82 was value-checked, and `:root` is where the s167 defect lived. The union is **DERIVED** (A/base's 41 + B/base's 41, disjoint key sets) rather than hard-coded, and `:root` is additionally asserted to declare no brand variable *outside* that union. The charter's caution was real: a blanket "no dark value appears in `:root`" check would be a **false positive**, because A/base and A/dark now coincide on one slot. What is asserted instead is the only thing that means anything — where base and dark/hc genuinely *differ*, `:root` must carry base's value.

**(b) The two discriminating oracles built; the vacuous one measured and NOT built.** CONTAINMENT (key-based: an `[data-brand='A']` block declares zero `--oods-color-brand-b-*`) and CORRESPONDING-SLOT (value-based: strip the brand segment; A must not carry B's value for the same slot). Both carry seeded discrimination proofs with control-of-the-control. The `otherBrand` loop is **asserted vacuous**, not merely asserted-to-be: the two brands' key sets are proven **disjoint (0 of 41 intersect, in all three themes)**, so it could never report anything. **HARD LIMIT pinned as a test:** A and B are byte-identical on all 41 hc slots, so no value-keyed brand-axis control can ever discriminate the hc row — only containment covers it. The test fails loudly if that ever stops being true, so the limit gets re-stated rather than silently deleted.

**(c) The collision-guard cross-brand seed — the chartered gap, closed and proven.** Deleting `new Set(brands).size === 1` from `isDeclaredOverlayChain` left **all five** existing bite-proof tests GREEN. The seed had to **EDIT an already-loaded file** (`sourceForScope` names `brands/{A,B}/base.json` literally, so a new file under `brands/B/` is never loaded and the test would be vacuously green) — brand B's `base.json` now also declares one of brand A's paths, and the collision is asserted **reported**. Restored in a `finally`, since the sandbox is shared via `beforeAll`. **MUTATION PROOF:** removing the narrow clause reds **only** the new test; the other five stay green — which is exactly the gap it was written to close.

**(d) The no-op control compares RESOLVED values, table DERIVED — and it corrected me.** Its first draft expected only A/base to agree with `:root` and went red on B/base. **The expectation was wrong, not the CSS.** The memo describes `:root` as "brand A + base" (D2), but MEASURED it carries the **UNION of both brands' base values** — these variables are brand-*namespaced*, so they cannot collide. Derived table, logged rather than pinned: A/base 0/41 differ · A/dark **40/41** · A/hc 41/41 · B/base 0/41 · B/dark 41/41 · B/hc 41/41. That A/dark 40/41 is the coincidence the charter warned about.

**(f) The stale comment deleted, and the claim it made verified FALSE first.** `brand-theme-matrix.test.ts:75-76` claimed `ref.typography.*` leaks out of `brands/A`. **Measured: every one of the six brand files has 41 leaves and ZERO non-`color.brand.*` leaves.** Memo-to-memo inheritance of exactly the kind this sprint corrects.

**Gates for m06:** root core **4729 + 20 skipped** (was 4719; **+10 owned** = 8 new control tests + the no-op control + the cross-brand seed) · guardrails **14 / 4** unchanged · browser proof **228 assertions, 6 cells, exit 0** (self-test exit 1) · eslint clean on all three changed files.

**Claim ceiling held.** "The controls discriminate, and the brand cascade is confirmed to resolve correctly in a real browser." The charter's ceiling said *one cell*; this covers six, because m05 removed the reason to stop at one. Still NOT "the brand pipeline is proven end-to-end" — this proves the CSS cascade resolves, not that any component renders correctly.

---

### m07 — Closeout — **SHIPPED**

**BLAST RADIUS, ENUMERATED BEFORE THE SWEEP — and the prediction held exactly.** 35 modified + 7 new paths. **Exactly ONE golden moved**, the one predicted: `dashboard.render.fidelity.test.ts.snap`. **STOP-THE-LINE CLEAR:** `packages/viz-render/test/__snapshots__/emitter.spec.ts.snap` did not move.

**GATE SWEEP — every gate by NAMED invocation, run SEQUENTIALLY.**

| # | gate | invocation | baseline | actual | delta |
|---|---|---|---|---|---|
| 1 | lockfile | `pnpm install --frozen-lockfile` | clean | **clean** | — |
| 2 | packages | `pnpm run build:packages` | — | **Done** | — |
| 3 | viz-core | `pnpm --filter @oods/viz-core exec vitest run` | 1205 / 61 | **1205 / 61** | **0, exact** |
| 4 | root core | `npx vitest run --project core` | 4666 + 20 skip / 432 | **4729 + 20 skip / 434** | **+63 owned, +2 files** |
| 5 | guardrails | `npx vitest run --project guardrails` | 5 / 2 | **14 / 4** | **+9 owned, +2 files** |
| 6 | mcp-server | `pnpm --filter @oods/mcp-server run test` | 3962 + 16 skip | **3978 + 16 skip** | **+16 owned** |
| 7 | scale | `pnpm --filter @oods/mcp-server run test:scale` | 62 | **62** | **0, exact** |
| 8 | tokens | `pnpm run tokens-validate` (HYPHEN composite) | green | **green, 32 viz checks** | — |
| 9 | collision guard | `pnpm run tokens:collision-guard` | 0 / 6 scopes | **0 / 6 scopes** | — |
| 10 | idempotence | `pnpm run check:tokens` | up-to-date | **up-to-date** | — |
| 11 | lint | `pnpm run lint:tokens` | green | **green, 0 new** | — |
| 12 | typecheck | root `pnpm typecheck` | PASS | **PASS** | — |
| 13 | typecheck | `pnpm --filter @oods/viz-core run typecheck` | PASS | **PASS** | — |
| 14 | docs API | `pnpm -w run docs:api -- --check` | green | **26 files, no orphans** | — |
| 15 | generator A | `pnpm --filter @oods/schemas-tools run generate:check` | green | **exit 0** | — |
| 16 | generator B | `pnpm run generate:schema-types -- --check` | green | **unchanged** | — |
| 17 | **NEW** browser proof | `pnpm run verify:brand-cascade` | — | **228 assertions / 6 cells, exit 0** | new gate |

**EVERY DELTA RECONCILES TO A NAMED MISSION — no unexplained test appeared or vanished.**
Root core **+63** = m01 16 + m02 32 + m05 5 + m06 10. Guardrails **+9** = m03 3 + m04 6. mcp-server **+16** = m01's 16 (the same tests, counted again by the core project). viz-core and scale moved by **zero**.

**PER-GOLDEN LINE-ITEM REVIEW (#564 exception).** One golden, two values:

| | before | after | provenance |
|---|---|---|---|
| `--oods-color-positive` | `rgb(24, 94, 67)` | `rgb(36, 93, 60)` | `dashboard.render.html.ts:41` → `brand-a-status-success-text`, hue **163.04 → 155.04** |
| `--oods-color-negative` | `rgb(155, 44, 44)` | `rgb(155, 47, 26)` | `dashboard.render.html.ts:42` → `brand-a-status-critical-text`, hue **24.94 → 32.94** |

Both are exactly the ±8° nudge toward the brand hue from m03's status re-authoring — no other component of either colour moved. **Correct because:** the change is the mission's chartered work, the provenance is traced to a named mapping, and the accessibility consequence was measured rather than assumed (both still clear their 4.5 rule on panel-bg: 6.3641 → 6.3992 and 6.2058 → 6.1510). That is why the **second** golden in the same file — the `a11yContrast` block — did **not** move.

**CONSUMER LOOP-CLOSURE — SENT.** `info_push` to `cmos://derek/forge-demos` covering **both** surface changes: m01's public MCP schema change (brand enum A → A|B, the new typed rejections, and the measured preset foot-gun the widening creates) and m02's emitted-spec shape change (`curve` → `interpolate`, `baseline` → `encoding.scale.zero`, `fill` → `filled`, and the explicit statement that the IR is unchanged). It references the FF#22 arc so the s167 correction and this corrective read as one story.

**VERIFIED LIVE ON THE BRIDGE**, not merely rebuilt: `pm2 oods-forge-bridge` restarted, health `{"status":"ok","bridge":"ready"}`, and over the real transport `brand:"B"` now succeeds while `brand:"C"` returns `OODS-V001 — field 'brand' must be one of: A, B`.

**THE MEMO'S "NOT YET RE-VERIFIED" LIST — ALL FOUR RESOLVED.**

| claim | verdict |
|---|---|
| the contested mark-bearing fixture count | **42 CONFIRMED**, definition pinned in the test; the duplication charge is also correct — only **31 distinct**, 11 byte-identical twins (m02) |
| "6 of 17 marks violate trait schemas" | **THE ORIGINAL FIGURE WAS RIGHT; the memo's "wrong by ~3×" note is itself wrong.** 47 mark entries, 17 carry options, exactly 6 of those 17 violate. And 2 of the 6 violate on `fillOpacity`/`strokeDash` — genuine valid Vega-Lite the trait schemas simply do not declare (m02) |
| is `forced-color-adjust: none` declared elsewhere | **YES — the critic was right, the memo's claim is FALSE.** At least six other stylesheets (m05) |
| is `apps/explorer/src/styles/tokens.css` generated or hand-authored | **UNRESOLVED — the one item not discharged.** It was never on any mission's path: m05 was explicitly barred from `layers.css`, and this file sits in the same deferred arc. **CARRIES.** |

**CARRY LIST for the next planning session** — each measured, none speculative:
1. **Preset payloads are brand-A-namespaced** — applying one with `brand:"B"` writes an A subtree into B. Disclosed in `docs/theming.md`, not fixed (m01).
2. **`tools/stage1-dtcg/cli.ts:47-48`** — the one genuinely unguarded fs sink in the tree; `--name` → `join` → `writeFileSync`, no validation. Two lines close it (m01).
3. **Three interaction ramps are now compressed** by the minimal-scope contrast fixes; re-spacing is a design decision (m03).
4. **14 of 42 fixtures remain invalid as WHOLE specs** — 3 at `/params/0`, 11 at `/` required. The inherited "facet/repeat" attribution did NOT reproduce (m02).
5. **Trait-parameter-schema enforcement** — now with a measured reason to widen the vocabularies FIRST (m02).
6. **Real focus tokens** — the only thing standing between the `brand.css` residue and full deletion (m05).
7. **`apps/explorer/src/styles/tokens.css` provenance** — the unresolved memo item above.

**NOT SELF-CERTIFIED.** The genuine-close review is a separate session and is Derek's (standing rule 10).
