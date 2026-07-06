# Sprint-146 Decision Memo — Palette-Hue Revision (F1 + F2)

**SSOT for the build session. Executes m02→m04 without re-grounding. NO code in m01 (this memo).**

## 0. Status / provenance
- **Ratified 2026-07-05** (Derek via AskUserQuestion; planning session `PS-2026-07-05-002`).
- **Grounded** by `wf_e2da41e2-6b6` (5 landing scouts → synthesist → adversarial critic vs HEAD `f762312`; verdict **AMEND-THEN-LOCK**, 0 blockers, 4 amendments folded below).
- **Source**: Meridian real-usage findings (inbox msg `258b6a7a`, 2026-07-05) — first real-data consumption of the s134–s143 certify arc. This sprint takes **F1 + F2**; F3/F4/F5/F6 are carried (§7).
- **Derek-locked forks**: (Q1) scope = **F1+F2 only**; (Q2) **re-space NOW, optimizer targets both surfaces**; (Q3) **re-chromatize slot-6** (give it a real hue).

## 1. Scope (Derek-locked)
- **THIS sprint = F1 (categorical palette re-space) + F2 (chroma-floor guardrail).** ONE theme = the long-deferred **palette-hue revision**, now that a real puller + an independent second measurement exist.
- **Honesty note on the puller**: F1's *warrant* is agent-first palette quality + closing certify's role-A **7.25 caution-pass** honesty gap. Meridian's F1 finding is strong *corroborating evidence* (an independent validator hitting the same pair) but their *named need* was F5 (ordinal+range). Do **not** oversell F1 as "the Meridian pull" — it stands on its own merits.
- **DEFERRED (carried, not dropped)**: F3+F4 (chord/ECharts input hygiene), F5 (ordinal+range color-scale schema — the Meridian *named* pull), F6a–d (export/narrative polish). Anchors in §7 so the future sprints start warm. "Fix all six" is honored across ~3 sprints, not crammed into one (the #1081 clean-completion discipline).

## 2. F1 — the palette re-space (mission m02)

### 2.1 What / where (verified at HEAD)
- The 6 categorical slots are **aliases to `sys.status.*.icon`** at `packages/tokens/src/viz-scales.json:108-139` (01=info, 02=accent, 03=success, 04=warning, 05=critical, 06=neutral). **DECOUPLE them**: replace the 6 alias `$value`s with **inline oklch** so the change is ISOLATED to the viz palette. (Editing the upstream `ref.color.*` primitives would move every status icon/banner system-wide = out of scope.)
- Current baked hexes (through `resolveTokenToColor`, `token-resolver.ts:27`): `#3668D8` `#3F45BE` `#279669` `#B6892B` `#D94747` `#606676`.
- **The failing pairs** (role-A min-pairwise CIEDE2000 over CVD, `certify-contrast.ts:123` `minPairwiseDeltaEOverCvd`, threshold `ROLE_A_CLEAN_DELTA_E=10` at :69): pair **4-5** (warning-amber vs critical-red) = **7.25**; pair **1-2** (info-blue vs accent-blue) = **8.57**. **BOTH < 10, BOTH must move.** (Meridian named only 1-2 — incomplete; the certify *floor* is the warm pair 4-5.)
- **Reorder-only is a non-fix**: min-pairwise is min over all 15 pairs (order-invariant); reordering only helps charts consuming <6 slots. Clearing ≥10 for all cardinalities **requires new hexes**.

### 2.2 The optimizer (the load-bearing feasibility work)
Run an **offline optimizer using the SAME math the grader uses** — `colorjs.io` `deltaE('2000')` + the Machado severity-100 matrices in `cvd-machado.ts:49` (`CVD_TYPES`). Produce 6 inline oklch hues meeting:
- **HARD role-A**: all 15 pairs, min over {normal + 3 CVD} ΔE00 **≥ 10**.
- **HARD role-C (light)**: every slot **≥ 3:1** contrast vs the light canvas `#FCFCFD` (WCAG 1.4.11).
- **HARD chroma**: every slot OKLCH chroma **≥ 0.045** — the margin above F2's `0.03` floor. This is the **ONE co-designed number** shared with F2's guardrail (critic amendment #1 — pin it here so F1's optimizer and F2's floor can't drift). Kills reads-as-gray and makes F2 a **zero-flip** guardrail. **Slot-6 re-chromatized to a real hue** (Q3).
- **AUDIT (record, do NOT gate)**: every slot's role-C vs the anticipated dark canvas `#101215` — see §2.3.
- **GUIDE (soft)**: minimal perceptual movement from the current hues (preserve OODS character); deterministic static oklch (no Date/random).

### 2.3 Dual-surface physics — get this right (Derek chose "target both")
- **role-A ΔE≥10 is SURFACE-INDEPENDENT** (a color-pair distance, canvas-agnostic). Re-spacing for ≥10 therefore fixes categorical distinguishability for **BOTH light and dark by construction** — this is the real dual-surface win of F1.
- **role-C (mark-vs-canvas ≥3:1) is SURFACE-DEPENDENT.** A single fixed palette physically **cannot** clear 3:1 on both a near-white (`#FCFCFD`) and a near-black (`#101215`) canvas for saturated mid-tones (a hue can't be both dark-enough-for-light and light-enough-for-dark). So **"target both surfaces" does NOT mean "one palette passes role-C on both"** (infeasible + would be a false claim). It means: **HARD light role-C now + CVD-robust hues now (automatic, holds on dark) + AUDIT the dark role-C** so the deferred dark-mode resolver only ever has to **lighten marks** (adjust lightness) — the hue/CVD work is done here, permanently, never re-hued.

### 2.4 #564 owned regen (breaking-palette-regen — the largest #564 surface of the six)
- Token edit → `pnpm --filter @oods/tokens build` (regenerates `dist/index.cjs` cssVariables — a gitignored build artifact).
- **Regen 4 palette goldens** (`vitest -u` after the tokens build): `golden-echarts-options.spec.ts.snap`, `viz.render.network-fidelity.test.ts.snap`, `viz.render.fidelity.test.ts.snap` (cartesian `scale.range`, ~20 hits), `dashboard.render.fidelity.test.ts.snap` (~6 palette hits **+ 2 pinned 64-hex contentHash literals, lines 55 & 520**). `viz.render.geo-fidelity` = **0 hits** (geo bakes no categorical → unchanged; PROVE it).
- **HAND-EDIT (not `-u`) the pinned test literals**: `vega-lite-adapter.spec.ts:31` `OODS_CATEGORICAL_6`; `packages/mcp-server/test/tools/artifact.certify.spec.ts` :412/:430 (**the 7.25 caution→clean-pass flip**), :510 `CERTIFY_PALETTE`, :541-543 role-C floor pins (`min.hex` was `#B6892B` / `min.ratio` ~3.10 — new floor slot + ratio). **AND `certify-contrast.spec.ts:59-66` is a FULL TEST FLIP** (critic amendment #2): drop `expect(contrastNote).toContain('Distinguishability caution')` + retitle — the caution string exists ONLY in the 2–10 warn band; a clean ≥10 pass returns the bare caveat. Path = `packages/mcp-server/test/tools/certify-contrast.spec.ts`.
- **NO edit to `certify-contrast.ts`**: role-A re-grades from `pass+caution` to **clean pass BY CONSTRUCTION** (the s137–s141 certified==rendered property).
- **Auto-tracks (no literal edit)**: the render↔certify contentHash identity (computed equality) — moves to a new value **in lockstep**, verdict unchanged.

## 3. F2 — chroma-floor "reads-as-gray" guardrail (mission m03, requires m02)
- File: `packages/mcp-server/src/tools/certify-contrast.ts`. Add `const ROLE_A_CHROMA_FLOOR = 0.03;` near :66-69 + `function chromaOf(hex){ return new Color(hex).oklch[1]; }` near `deltaE2000` (:118).
- Inside the SINGLE shared choke point `gradeCategorical` (:177-225), **after the role-C block (:201)**: `const gray = slots.filter(s => chromaOf(s.hex) < ROLE_A_CHROMA_FLOOR)`.
- **Land the FAIL-variant** (Derek chose re-chromatize, so this is safe): `gray.length > 0` → `contrast:'fail'` before the role-A distance check.
  - On the **default** palette this fires on **nothing** (m02 re-chromatized every slot ≥0.045) = a **permanent zero-flip guardrail** against any future low-chroma slot silently passing.
  - It **does** fire — correctly — on a **gray `config.tokens` override** an agent supplies (reads-as-gray → fail), same real independent value on agent input that the s137 low-contrast-override fail path has. That's F2's honest value: silent on the default, teeth on a bad override.
- **MUST land after m02.** A standalone fail-variant would flip today's gray slot-6 default (chroma 0.0264 < 0.03) to `contrast:'fail'` = verdict churn on the OLD palette + a mid-sprint retraction of the s141 ECharts-categorical `pass` contract.
- Add a `certify-contrast.spec.ts` case: a gray slot → fail; the re-chromatized palette → pass.
- **#564 = additive-validation** (certify read-only; zero rendered byte; contentHash untouched; fires on nothing post-F1). Chroma is a pure fn of the resolved hex → determinism holds.

## 4. Aesthetic autonomy (how the build session ships the palette)
- The build session runs the optimizer and **ships its output autonomously** (m02→m04, no mid-sprint Derek gate). The **a11y math is the HARD gate**; aesthetic-continuity (minimal movement, preserve OODS character) is the **soft guide**.
- **m04 MUST surface the final 6 hexes + a visual reference prominently** in the closeout / live-verify, so **Derek signs off on the aesthetics at sprint-review**. Re-tuning the hues later (re-run the optimizer with a different preference/seed) is **cheap and non-breaking-to-the-math** (identical golden-regen shape). So the aesthetic risk is bounded: the math ships correct now; the eye is Derek's at review. If Derek wants to eyeball candidate palettes *before* the goldens lock, say so and m02 pauses for a pick — otherwise it proceeds.

## 5. Mission spine (strict Requires m01→m04; mirrors s144/s145's clean 4/4 shape)
- **m01** keystone memo (THIS file; NO code; Completed-at-creation).
- **m02** F1 re-space (breaking-palette-regen; goldens RED until regenerated *within* m02; owns the atomic regen).
- **m03** F2 chroma-floor guardrail (requires m02).
- **m04** closeout (requires m03): **rebuild ORDER = `@oods/tokens` build → `@oods/viz-core` DIST rebuild → mcp-server vitest** (critic amendment #3 — viz-core's `token-resolver.ts` reads the `@oods/tokens` bundle, and the mcp-server suite resolves viz-core via DIST); full gate (frozen-lockfile, ROOT typecheck, `-r build`, all vitest, test:scale, generate:check, docs:api); **live-verify** on `:4466` + aquex (new palette renders; role-A now a **clean pass**; F2 silent on default; render↔certify contentHash moved in **lockstep**, verdict unchanged; **surface the 6 hexes + visual ref for Derek's sign-off**); manifest reconcile to the authoritative **25** (no new tool); pm2 `oods-forge-bridge` restart (mine); capture decisions + learnings; record the carried F3/F4/F5/F6 follow-ons + frozen OOS.

## 6. Constraints (held all sprint)
**#564** (deliberately own the palette regen — 4 snaps + 2 contentHashes + ~6 literals), **#525** (MCP-only, set stays 25, no new tool), **#110** (certify stays a READER — no threshold/scorer change; role-A re-grades by construction), **determinism** (static oklch, pure resolution, `test:scale` a===b), **#84** (categorical-palette `overrideMap` precedence untouched — caller `config.tokens` still wins per-slot), **#115** (agent-first: every agent's palette improves, no consumer API change).

## 7. Deferred findings — CARRIED with anchors (NOT this sprint)
- **F3 — chord/graph cardinality warn** (additive-validation, S): palette cycle at `chord-adapter.ts:171` / `graph-adapter.ts:292` (`palette[index % palette.length]`; width clamps to **6** via `scale-token-mapper.ts:162`). Emit **OODS-V143** warn in `renderEChartsPrimary`'s chord/force_graph branches (`viz.render.ts` ~386/389) when cardinality > 6. [F3b fold-to-"Other" alt = byte-moving, only if Derek wants never-cycle enforced in *bytes*. F3c instance-level grading = needs a certify INPUT-schema change = **frozen OOS**, same wall as geo bubble_map ordinal at `certify-contrast.ts:424-436`.]
- **F4a — chord broken-ref validation** (additive-validation, XS): call `validateSankeyInput(chord)` in the chord branch (`viz.render.ts:382-387` or top of `adaptChordToECharts`) — chord reuses the `SankeyInput` contract; sankey already validates (`sankey-adapter.ts:73`), chord doesn't. Broken ref → **OODS-V126** (hard error, consistent posture).
- **F4b — duplicate-link warn** (additive-validation, S): net-new dup detector (Set of `source|target` keys over `input.links`); **OODS-V143** soft-warn (a dup renders fine); register in `registry.ts` (V band ends at V142, :168).
- **F5 — ordinal+range color scale** (the Meridian NAMED pull; grader-FREE, strongest next candidate): **F5a** schema-widen (XS) — add `"ordinal"` to `TraitBinding.scale` enum (`normalized-viz-spec.schema.json:217-220`) + `range:{type:array,items:string}` to properties, in **both** twin schemas + `pnpm generate:schema-types`. **F5b** cartesian producer (S) — `vega-lite-adapter.ts` :292-300 prefer `binding.range ?? palette`; `mapScaleType` :468-478 add `ordinal`; `inferFieldType` :417-423 return `ordinal`. Certify CASE-1 reads `scale.range` type-agnostically (:259-275) → grader-free.
- **F6a — dashboard SVG grid-span** (byte-moving, XS): `dashboard.render.html.ts:369` `styleBlock` — append `.oods-chart svg{width:100%;height:auto;max-width:100%}` (SVG carries a viewBox → scales to fill), OR thread `w` into `buildPanelVizInput` for a real Vega width (S).
- **F6b — KPI trend on non-temporal** (byte-moving, S): `kpi.ts:199-206` `computeKpi` — gate the first-vs-last-row branch on `panel.periodField` (deliberately reverses the s113 additivity seam (i)).
- **F6c — heatmap gridline** (byte-moving, S): `oods-vega-config.ts:168` `axisY:{grid:true}` is unconditional → `const isMatrix = spec.marks.some(m=>m.trait==='MarkRect'); axisY:{grid: isMatrix?false:true}`. **Ordering note**: F6c churns `viz.render.fidelity.test.ts.snap` too — a *disjoint region* from F1's categorical hexes (the heatmap case bakes no categorical), so no collision this sprint, but when F6 runs, sequence it so it doesn't share a regen with a live palette change.
- **F6d — heatmap self-warn** (additive-validation preferred, S): `A11Y-R-11` at `equivalence-rules.ts:229-242` — add a `MarkRect` branch needing ≥1 finding (like R-13) not ≥2, OR emit a 2nd structural finding in `narrative-generator.ts` `buildKeyFindings:261-298` (byte-moving).
- **SEPARATE TRACK (registry/trait roadmap, not viz tools)**: the D1 strain ledger (9 strains + 4 candidate breaks) for when PT/HCM domain modeling starts.

## 8. Frozen OOS (walled, NOT pursued)
F3c instance-level ECharts collision grading (needs a certify INPUT-schema change — the geo-ordinal wall); the standing certify OOS (C3 non-cartesian a11y, C4 accuracy pillar, ECharts certify teeth, full dark-theme contrast); the #110-safe deterministic-accuracy slice (parked runner-up). **F1 is generate-side palette *source* + F2 is a read-only guardrail on the EXISTING contrast pillar → neither reopens the closed certify arc.**
