# Sprint-137 Keystone Memo — Contrast-First: the DECLARED-INTENT contrast pillar

**Status:** RE-SCOPED after the grounding+critic pass (run `wf_28951690-fb6`, verdict *do-not-lock* on the original "by construction" thesis). Derek re-ratified 2026-07-03 = **declared-intent pillar only** (drop the palette lock). Ready to lock the slate.
**Direction:** contrast-first (#1006). **Scope:** the certify contrast pillar over the DECLARED OODS palette; NO palette lock, NO brand-inlining.
**Inputs:** research `cmos/research/s137-contrast-rules.md` (rule set) + grounding/critic `wf_28951690-fb6` (anchors verified against HEAD; the two structural corrections hand-confirmed by me).

---

## §0 — Thesis (corrected)
The s136 review found `conformant:true` is **false-clean on contrast** (no contrast signal in the output an agent reads). s137 closes that: certify grows a **contrast pillar** that certifies the **declared OODS viz-scale palette** (the colors Forge *intends*) against the canvas, per WCAG-normative + best-practice rules, and reports a per-pillar tri-state so a reader can never misread `conformant:true` as "contrast passed."

**Why declared-intent, not "by construction" (the critic's load-bearing catch, hand-verified):** Forge's cartesian charts **do not currently apply the OODS palette at all** — `prepareSpecForBrand` (`packages/viz-render/src/emitter.ts:80-90`) is a deliberate **identity no-op** (its own comment: *"m04 will apply them to the spec … Identity transform for now … the tokens do not alter the rendered output"*). The brand-token inlining that would paint marks in Forge's colors was a planned step that never shipped. So there is **no construction step to make contrast "true by construction"** — the compiled cartesian spec is colorless (which is exactly why #564 holds), and a naive renderer shows Vega defaults. certify therefore certifies the **declared/intended** palette with an explicit caveat that final rendered contrast depends on the client applying the token range+theme. (The deeper gap — *Forge doesn't render its own brand palette* — is logged as a separate future arc, §11.)

## §1 — Ratified calls
1. **Contrast-first** (#1006).
2. **Declared-intent pillar ONLY** (Derek 2026-07-03, post-critic). DROP the palette lock: the palette does **not** fail on the wired (light) theme — all six categorical slots pass role-C (info 4.96 / accent 7.30 / success 3.62 / warning 3.10 / critical 4.14 / neutral 5.60:1 vs canvas); the "failures" in the first draft were a **theme-blind dark pairing** (resolver is light-only) and a **role-B-exempt ramp stop**. So there is nothing to "lock."
3. **Metric by role** (§2) — no blanket 3:1.

## §2 — The contrast rule set (from research; pin verbatim)
| Role | Metric | Threshold | Authority |
|---|---|---|---|
| **(C) mark vs plot/panel background** | WCAG relative-luminance ratio (reuse `@oods/a11y-tools` `contrastRatio`) | **≥ 3:1** (marks required to understand) | **WCAG 1.4.11 NORMATIVE** |
| **(A) categorical series** | **CIEDE2000 (ΔE00)** min-pairwise, **min over normal + deuteran/protan/tritan** (Machado-2009) | **≥ 10 pass / 2–10 warn / < 2 fail** | best-practice (Palettailor/cols4all) |
| **(B) sequential/diverging** | perceptual uniformity (CAM16-UCS), 1/5 thresholds; **NOT** contrast ratio | gradient **WCAG-EXEMPT** (essential) | best-practice + exempt |
| **(C′) touching marks** (pie/stacked/treemap/choropleth/sankey) | — | **DEFERRED with the ECharts-primary arc** (needs faithful domain-order replication; not cartesian) | (normative when built) |

**WRONG for charts (do not build):** 3:1 luminance between non-touching categorical series; 3:1 between gradient stops; any gate on aesthetic/redundantly-labeled marks. CVD is deterministic (Machado-2009 one 3×3 matrix; pin type={deuteran,protan,tritan}, severity=100).

## §3 — The certify CONTRAST PILLAR (I/O contract)
**Additive output field** (`ArtifactCertifyOutput`, `artifact.certify.output.json` — `additionalProperties:false`, so declare it + regen `generated.ts`):
```
pillars?: {
  a11yEquivalence: 'pass' | 'fail' | 'unchecked';
  determinism:     'pass' | 'fail' | 'unchecked';
  contrast:        'pass' | 'fail' | 'unchecked' | 'exempt';
}
contrastNote?: string   // the declared-intent caveat when contrast is pass/fail
```
- `conformant` stays the a11y-equivalence verdict (unchanged — no breaking semantics flip). The contrast pillar reports alongside it. This closes the false-clean gap (review #1004 item 1).
- **How the pillar gets colors (self-contained; NOT via the a11y.scan/validate-contrast rules path):** resolve the **declared** viz-scale palette directly — `resolveTokenToColor` (`token-resolver.ts:23`) for each slot the chart consumes (categorical cardinality = distinct values of the color-encoding field in `data.values`; sequential/diverging from the scale kind). **Add an `rgb()→hex` bridge** (resolveTokenToColor returns `rgb(...)`; `a11y-tools` `contrastRatio`/`hexToRgb` consume hex only and throw otherwise). Checks the **wired (light) theme**; dark-theme contrast is OOS (resolver is theme-blind — §11).
- **Declared-intent caveat** in `contrastNote`: certify verifies the *intended* palette; final rendered contrast depends on the client applying the token range/theme.
- **Role detection** from the color-encoding/scale kind in the IR (nominal → role-A; quantitative sequential/diverging scale → role-B), not from the colors.
- **Deterministic:** pure fn of (IR + resolved tokens); no Date/random; CVD params pinned.
- **Sequential/diverging** → `contrast:'exempt'` + note pointing at Forge's generated data table (§9). Do not hard-fail on inter-stop contrast.

## §3a — Contrast tri-state mapping + calibration (pinned from the m01 build-time computation; verbatim)
The pillar is **tri-state pass/fail/exempt/unchecked** — there is **no `warn`**, so the research's three ΔE00 bands (≥10 pass / 2–10 warn / <2 fail) map onto pass/fail as follows. All numbers below were computed at m01 against HEAD (`resolveTokenToColor` → `normaliseColor` → `@oods/a11y-tools contrastRatio` for role-C; `colorjs.io` `deltaE('2000')` with Machado-2009 CVD sim @ severity 100 in **linear-RGB** space for role-A). **These are the ground truth the m02 tests assert against.**

- **Canvas reference (role-C background):** `--oods-sys-surface-canvas` → `rgb(252,252,253)` → `#FCFCFD`. (This exact token reproduces the §1 role-C numbers 4.96/7.30/3.62/3.10/4.14/5.60 — confirmed.)
- **Role-C (WCAG-normative):** any consumed categorical slot with `contrastRatio(slot, canvas) < 3:1` → pillar **`fail`**. All 6 default slots pass (3.10–7.30:1).
- **Role-A (best-practice, categorical ≥2 series):** `d(i,j) = min(ΔE00, ΔE00_deutan, ΔE00_protan, ΔE00_tritan)`; palette metric = `min over all pairs d(i,j)`.
  - `< 2` → pillar **`fail`** (genuinely indistinguishable).
  - `2 ≤ m < 10` → pillar **`pass`** + a distinguishability WARN in `contrastNote` (the research "warn" band folds into pass; it is a caution, not a normative failure — role-A is best-practice, not WCAG).
  - `≥ 10` → clean **`pass`** (no note).
- **CALIBRATION (the number the memo §1/§4 asserted but did not quantify):** the default OODS categorical palette's `min-pairwise d` is **8.57** (2–4 slots) / **7.25** (5–6 slots) — i.e. it sits in the **2–10 WARN band, NOT ≥10**. So "default Forge IR → contrast:pass" is TRUE, but as a **warn-band pass** (role-C passes + role-A ≥2), *not* a clean ≥10 pass. A deliberately low-contrast agent override (e.g. three near-identical greys, `min-pairwise ≈ 1.19`) lands in the `<2` FAIL band → `contrast:fail` even though those greys pass role-C vs canvas (3.85–4.37:1) — so **role-A is the load-bearing fail path for the m02 "config.tokens override → fail" test** (add a role-C near-white override test too, to exercise the normative path).
- **Machado application space = linear RGB** (the paper's space; DaltonLens convention: sRGB→linear → 3×3 matrix → linear→sRGB). Pin severity=100, types {deuteran, protan, tritan}. The matrix CONSTANTS are the "published reference values" the m02 unit test asserts (version-independent), plus a behavioral sanity check.

## §4 — Value / non-redundancy (answers the s136 "proof without a puller")
Unlike a11y-equivalence (builder-guaranteed → certify is redundant on Forge IR), **contrast is the FIRST pillar with real work on agent-supplied input**: an agent can override the palette/theme via `config.tokens` or hand-edit colors, and the contrast pillar catches a low-contrast custom palette that the builder never vetted. On default Forge IR it reports `contrast:pass` (the OODS light palette is contrast-safe) — which is the honest, useful "the intended palette is safe" signal, and closes the false-clean gap regardless.

## §5 — #564 / determinism (CONFIRMED sound by grounding, 8/8)
- The pillar is **purely additive to certify's OWN output** — it touches no other tool, no cartesian bytes. `viz.render`/`dashboard.render` goldens byte-unchanged.
- The render↔certify `contentHash` identity is untouched (both still `sha256(canonicalize(toVegaLiteSpec(spec)))`; grounding confirmed the compiled cartesian spec is colorless and `viz-scales.json` has zero cartesian consumers).
- Constraints held every mission: **#110** (no scorer), **#525** (MCP-only), **#564** (additive), determinism (pure, CVD pinned).

## §6 — Fold in: the live fall-through BUG-FIX (review #1004 item 2)
Verified live: a schema-valid IR with an unmodeled `marks[0].trait` (e.g. `MarkHeatmap`) returns opaque `status:error OODS-V127`, even though the tool advertises heatmap as certified. **Fix (critic-corrected):** a **POSITIVE cartesian-Vega trait allowlist** (MarkBar/MarkLine/MarkPoint/MarkArea/MarkRect) — a trait in neither the cartesian allowlist nor the ECharts-primary set → `coverage:'uncertified'` (not error, not silent). **Normalize the heatmap alias** (builder maps heatmap→MarkRect; `MarkRect` certifies, `MarkHeatmap` should normalize to it or be documented as uncertified — so the "heatmap certified" claim is honest). **Three-way regression test:** MarkBar→certified / MarkTreemap→uncertified / MarkHeatmap→honest verdict (not V127).

## §7 — Fold in: honesty-hygiene (review #1004 items 3-4)
- **6-file doc sweep** (definitive, from grounding): `docs/mcp/` Agent-Recipes/Bridge-API/Connections/Policy-Rules/Reliability/Tool-Specs. Companion: `Connections.md` stale counts 22/31 → 25.
- **Close feedback id 73** — bidirectional api-docs test (registered ↔ doc) + docs:api prune step; a doc-retirement grep-gate.

## §8 — Build notes / grounding corrections (discharge at build)
- **Reuse, don't reinvent:** `colorjs.io@0.5.2` (already a root + a11y-tools dep, imported at `a11y-tools/src/color.ts:1`) provides **CIEDE2000** (`color.deltaE(o,'2000')`) and **CAM16-UCS**. Do NOT hand-implement ΔE00; do NOT add chroma-js/culori. **Only Machado-2009 CVD is new code** (fixed 3×3 matrices per {deuteran,protan,tritan}@100; unit-test against published reference values).
- **`resolveTokenToColor` returns `rgb()` not hex** → add the rgb→hex bridge before the contrast call. It is **theme-blind (light-only)** → the pillar checks the light theme; dark is OOS.
- The stale-DTCG-artifact blocker (`validate-contrast` reads `oods-tokens-2026-03-06.json`) is **MOOT** for the declared-intent pillar — the pillar reads the palette directly via `resolveTokenToColor`, NOT through the `DEFAULT_CONTRAST_RULES`/`validate-contrast` path (that path was only for the dropped palette lock).

## §9 — Sequential alt-format
A sequential/diverging scale → `contrast:'exempt'` (WCAG essential-exception) + a note that Forge's generated accessible **data table** is the guarantee. Do not hard-fail; optional best-practice WARN via the 1/5 uniformity thresholds.

## §10 — Mission spine (declared-intent; strict Requires)
- **m01** — this keystone memo (NO code). *Deliverable: this file, ratified.*
- **m02** — **certify contrast pillar core** (the long pole): the `pillars` tri-state + `contrastNote` fields + the 3-role engine over the declared palette (reuse `contrastRatio` + `colorjs.io` ΔE00/CAM16; new Machado-2009 CVD; rgb→hex bridge; role detection from the IR; light-theme; declared-intent caveat), pure/deterministic + tests (default Forge IR → contrast:pass; a `config.tokens` low-contrast override → contrast:fail; sankey → exempt/unchecked).
- **m03** — **fold-in fixes**: the fall-through positive-allowlist guard + heatmap-alias normalization + three-way test; the 6-file doc sweep; feedback-73 bidirectional api-docs prune + doc-retirement grep-gate. *Independent; can parallel m02.*
- **m04** — **wire + closeout**: output-schema regen (`pillars`/`contrastNote`), `generated.ts`, docs:api, full cross-package gate (frozen-lockfile, ROOT typecheck, generate:check, `-r build`, mcp-server vitest + colocated goldens byte-unchanged, test:scale), two-layer bridge rebuild + pm2 restart + live verify. **Requires m02, m03.**

## §11 — Constraints + OUT OF SCOPE
Hold: #110, #525, #564 (additive), determinism (pure, CVD pinned).
**OUT OF SCOPE (frozen):**
- The **palette lock** (dropped — light theme passes).
- **Dark-theme contrast** (resolver is theme-blind — needs a theme-aware `resolveTokenToColor`).
- **Touching-mark contrast (role-C′)** + the **8 ECharts-primary types** (deferred with the breadth arc).
- **⭐ BRAND-FIDELITY (new, logged for a future arc):** *Forge's cartesian charts do not apply the OODS palette* — `prepareSpecForBrand` (`emitter.ts:80-90`) is an unimplemented identity seam (planned "m04" brand-token inlining). Making Forge render its own palette would be genuinely by-construction AND let contrast verify *displayed* colors — but it **breaks #564** (bakes color into the cartesian spec → hash + s134–136 determinism goldens regen). This is its own arc ("Forge renders its own brand"), NOT s137.
- Scorer/recommender change.

**Process note:** the sub-agent API is **improved but not reliably fixed** — this critic pass dropped 2 of 7 agents (incl. a critic) on connection errors. Keep the pre-flight + budget for hand-verification on any fan-out-heavy s137 step.
