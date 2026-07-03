# Sprint-138 Keystone Memo — Brand-Fidelity: Forge bakes its own OODS palette into the cartesian spec

**Status:** Ratified 2026-07-03 (Derek, planning session `PS-2026-07-03-006` — path + both forks approved via AskUserQuestion).
**Grounded + critic-verified:** workflow `wf_826052a8-991` (6 live-repo scouts → synthesist → adversarial critic; verdict **amend-then-lock**; both blockers + all amendments folded).
**North-star (#977):** Forge = the engine that GENERATES AND CERTIFIES accessible, deterministic, governed output for agents.
**This arc closes:** the s137-review **C1/C2 relocated-hollow** — certify's contrast pillar today certifies a *declared* palette the cartesian render provably never applies. Brand-fidelity makes contrast a verdict about what Forge *actually renders*.

> This memo is the authoritative build-session reference. A fresh session should be able to execute m02–m06 from this file + the mission anchors without re-grounding.

---

## 1. The one-line arc

Bake Forge's OODS categorical viz-scale palette into the **compiled cartesian Vega-Lite spec** (the shared `toVegaLiteSpec` path), so a default cartesian chart renders OODS colors by construction and certify's s137 contrast pillar flips from **declared-intent** to **rendered-reality** — at the deliberate, planned cost of a **non-additive #564 golden regen for cartesian color only**.

---

## 2. The load-bearing reframe (F1) — the seam is the ADAPTER, not the emitter

The s137 review and decision #1009 named `prepareSpecForBrand` (`packages/viz-render/src/emitter.ts:80-90`, an unimplemented identity no-op) as the seam. **Grounding proved that seam cannot deliver the arc's goal**, and Derek ratified the retarget.

**Why the emitter seam fails (code-unanimous, 6/6 scouts):**
- `viz.render` **never calls the emitter.** It returns `toVegaLiteSpec(built.spec)` directly (`viz.render.ts:191`) and hashes *that* (`contentHash = sha256(canonicalize(spec))`, `:330`).
- `certify` also hashes `canonicalize(toVegaLiteSpec(certifySpec))` (`artifact.certify.ts:171-174`).
- `renderVegaLiteToSvg` (which runs `prepareSpecForBrand`) has **one caller**: `dashboard.render.html.ts:202` — server-side dashboard SVG only, and it runs **downstream of the hash**.
- So baking in the emitter would recolor *only* dashboard SVG and leave `viz.render`'s returned spec, **both content-hashes**, and the **contrast pillar** untouched → arc goal silently unmet.

**The correct seam: `toVegaLiteSpec` / `convertBinding`** (`packages/viz-core/src/adapters/vega-lite-adapter.ts:213-252`, today sets only `scale.type` at `:235-236`). Because **both** `viz.render` and `certify` compile through `toVegaLiteSpec`, baking there moves both hashes **identically** — the s136 **render↔certify round-trip identity is PRESERVED at a NEW value**. `prepareSpecForBrand` stays a no-op.

---

## 3. The theming verdict (resolved from code — refutes the frozen-arc worry)

The arc was frozen partly on "baking breaks #564 **and theming**." Grounding settled the theming half: **client-side theme-swap on cartesian is aspirational / non-functional — baking loses nothing real.**

- The compiled cartesian VL spec carries a color *encoding* but **no palette** — nominal color is `{field, type:'nominal'}` with no `scale`; quantitative is `{scale:{type:'linear'}}`. No `scale.range`, no `scheme`.
- `getVizScaleTokens` (the palette accessor) is imported **only** by the ECharts adapters, **never** by `vega-lite-adapter`.
- `config.tokens` flows only into `usermeta.oods.tokens` metadata, never into the color scale.
- Vega emits color as a literal SVG **presentation attribute** (`fill="#4c78a8"` = Vega's default tableau10), which **CSS `var()` cannot restyle**; ECharts canvas can't cascade either (`token-resolver.ts:3-4`). So a default cartesian chart provably renders tableau10, **not** OODS.
- `tokenCssRef='tokens.build'` (`viz.render.ts:296`) is a compact-mode string pointer with **no recoloring code** behind it.

**Consequence:** there is nothing for a token stylesheet to swap. The mark palette is **theme-agnostic** (single oklch set; zero dark viz-scale keys), so baking `scale.range` is **theme-independent for marks** — only canvas + chrome are theme-sensitive (→ chrome OOS, §5.F4).

---

## 4. Ratified calls

| # | Decision | Value |
|---|----------|-------|
| **F1** | Bake seam | `toVegaLiteSpec`/`convertBinding` adapter — **NOT** `prepareSpecForBrand`. *(Derek: retarget.)* |
| **F2** | When it fires | **Default-bake, IR-only** — resolve the OODS palette from the static `@oods/tokens` bundle whenever a color encoding exists; no external `tokens` input; certify sees the same default. |
| **Single-series** | No-color charts | **Also bake mark-level `mark.color = categorical-01` hex** when there is no color encoding. *(Derek-approved; critic blocker-1 fix — see §6.)* |
| **F3** | Consistency | **One shared pure `resolveCategoricalPalette(spec) → hex[]`** called by both the adapter (to bake) and `certify-contrast` (to grade) → rendered == certified **by construction** + a consistency lock test. |
| **F4** | Scope | **Marks-only.** Axis/label/grid/legend/title chrome is **OOS** (theme-sensitive; the pillar has no axis/text-contrast role). |
| **F5** | >6-series | **Dissolved** (critic). Bake the **fixed full 6-slot range** — do NOT slice to `distinctCount` (`convertBinding` can't see data/`config.tokens`). Vega ordinal `domain[i]→range[i]` recycling gives ">6 → cycle-6" for free and matches certify's cap-at-6 **as a set**. |
| **Color form** | Canonical | **HEX**, not `rgb()`. The inverted tripwire asserts `'3668D8'`; `resolveTokenToColor` returns `rgb()` → the shared helper **must normalise to hex before baking**. |
| **F6** | Runner-up | ECharts role-C′ = **optional if-capacity m05.** *(Derek: "if not we'll do that next.")* |

---

## 5. #564 — deliberately broken for CARTESIAN COLOR ONLY (planned, not smuggled)

`scale.range` / `mark.color` bytes change → `viz.render.fidelity` + `dashboard.render.fidelity` snaps regen + the render↔certify `contentHash` moves to a **new shared value**. This is a **planned non-additive regen**, owned by m04 — not additive.

**Invariants that MUST hold (any other drift = a bug):**
- Every **non-color** byte stays byte-stable: `usermeta`, encodings, scale domains, sort, the a11y block, axis structure.
- `conformant` / `a11yEquivalence` verdicts **UNCHANGED** — the equivalence engine reads the color **encoding field**, never `scale.range` (`equivalence-rules.ts:79-85`).
- **Non-cartesian goldens byte-IDENTICAL** — ECharts network/geo/echarts-options, a11y, profiler/layout (separate adapter path). Drift = the bake leaked out of cartesian scope.
- **Suggest/scorer goldens unchanged** (#110).
- **render↔certify identity preserved at the new value** — because both hash the shared `toVegaLiteSpec` output; feed certify `viz.render`'s **returned `normalizedSpec`**, not a re-built IR.

---

## 6. The critic's catch — single-series (blocker-1, mitigated)

The color bake only fires when a **color encoding** exists (multi-series). A **single-series** chart (one bar/line — plausibly the common case) has no color channel → `convertBinding` never bakes a range → Vega renders its default `#4c78a8`, **yet certify still grades OODS categorical-01 `#3668D8` at slot 01** (`certify-contrast.ts:152-160`). The mismatch is **silent** — both pass role-C vs `#FCFCFD`, no golden/test reds — so the hollow-center would **survive for single-series**.

**Fix (Derek-approved):** add a second bake — when there is no color encoding, set mark-level `mark.color = categorical-01` hex on the compiled cartesian spec, so single-series renders exactly what certify grades. Add a single-series test asserting the compiled spec carries the OODS-01 mark color (the multi-series SVG-fill test would miss it). This is what makes the "rendered-reality" headline **honest across the board**, not just for multi-series.

*(Critic blocker-2 is already folded into m02: resolve the palette ONCE at `toVegaLiteSpec` top-level where `config.tokens` is visible, thread the resolved `hex[]` into `convertBinding` — do not attempt data/token access inside `convertBinding`'s `(channel, binding)` signature.)*

---

## 7. Spine (strict Requires m01→m02→m03→m04; m06 requires all; m05 optional after m04)

- **m01 — Keystone memo (this file). NO code.** ✅ authored this planning session.
- **m02 — Bake core.** Shared `resolveCategoricalPalette(spec)→hex[]` (reuse `getVizScaleTokens('categorical',{count:6})` + `resolveTokenToColor` + `config.tokens` precedence; normalise rgb→hex). Resolve once at `toVegaLiteSpec` top-level, thread into `convertBinding`. Multi-series → `definition.scale.range` = fixed 6-slot hex[]. Single-series → `mark.color` = categorical-01 hex. Pure/deterministic (no Map/Set insertion order). Leave `prepareSpecForBrand` a no-op. **Exit does NOT require a green suite** — fidelity snaps + the s137 colorless tripwire are expected RED until m03/m04.
- **m03 — Certify reconcile + tripwire invert.** Point `certify-contrast` at the shared helper (certified == baked). Reword `DECLARED_INTENT_CAVEAT` (drop the "client applies the token range" clause; keep the light-theme/theme-blind clause). **Hand-edit** (not `-u`) the #564 colorless tripwire (`artifact.certify.spec.ts:152-162`) to assert OODS `scale.range`/hex ARE present. New cross-tool test: `viz.render.contentHash === artifact.certify.contentHash` on `viz.render`'s **returned normalizedSpec** at the new baked value.
- **m04 — Planned golden regen + prove-unchanged + determinism.** Regen (`-u`) `viz.render.fidelity` + `dashboard.render.fidelity`. Prove byte-unchanged: network/geo fidelity, echarts-options, golden-profiles, dashboard-layout, a11y-equivalence-emission, base `viz.render.test.ts`, `emitter.spec.ts` raw-fixture. Prove determinism: `test:scale` (a===b). Diff-review dashboard SVG (only mark fills moved; inlined `<style>` byte-identical). Verify all hash invariants at the new value.
- **m05 — [OPTIONAL if-capacity] ECharts role-C′ runner-up.** Grade the 5 categorical ECharts-primary types (treemap/sunburst/sankey/graph/chord) over the fixed OODS palette they bake — mark-vs-canvas role-C + role-A only; 3 geo → role-B exempt. NO emit-then-read, NO adjacency. certify output grows only; zero ECharts golden regen. Closes the C1 inversion. Drop cleanly if capacity is short.
- **m06 — Closeout.** Full local gate (frozen-lockfile, ROOT typecheck, `-r build`, all tests, `test:scale`, `generated.ts` regen via `@oods/schemas-tools` + `generate:check`, `docs:api`). Advertised set still 25 (no new tool). pm2 restart `oods-forge-bridge`. Two-layer reconnect live-verify on :4466 AND aquex (default→scale.range+`pass`; single-series→OODS-01 mark.color; grey override→`fail` while conformant true; render↔certify hash identical at new value). Document the planned #564 regen + flag any frozen-SHA consumer of the OLD cartesian hash (Derek's domain).

---

## 8. Golden regen checklist (m04)

0. Confirm bake site = `toVegaLiteSpec`/`convertBinding`, not `prepareSpecForBrand`.
1. **Hand-edit** (not `-u`): invert the #564 tripwire (`artifact.certify.spec.ts:~152-162`) to assert `"range"` + resolved OODS hex present; reword `certify-contrast.spec.ts:38` off `'DECLARED'`.
2. **Regen** (`vitest -u`): `viz.render.fidelity` + `dashboard.render.fidelity`. Do NOT `-u` `emitter.spec.ts` blindly (raw-fixture, unchanged under adapter-only bake).
3. **Prove-unchanged** (no `-u`, must stay green): network-fidelity, geo-fidelity, golden-echarts-options, golden-profiles, dashboard-layout, both a11y-equivalence-emission specs, base `viz.render.test.ts`.
4. **Prove-determinism:** `test:scale` (viz-determinism a===b) — the tripwire for nondeterministic palette ordering a single-render snap misses.
5. **Diff-review** `dashboard.render.fidelity` by eye: only SVG mark `<path>`/`<rect>` fills moved (`#4c78a8` → OODS hex); inlined `<style>` block byte-identical.
6. **Hash invariants** at the new value: render↔certify equal; certify first===second (stable); on==off additivity; heatmap→MarkRect alias identity; `config.tokens` same→same / diff→diff while `conformant`/`a11yEquivalence` unchanged.
7. Full CI parity: ci.yml:614-615 colocated list + `ci-golden-list.guard` (no new golden FILE → no ci.yml edit).
8. Regen `generated.ts` via `@oods/schemas-tools` + `generate:check` clean; advertised set still 25.

---

## 9. Out of scope (frozen)

- **Dark-theme contrast** (theme-aware resolver). Marks bake theme-independently; only canvas/chrome are theme-sensitive. Separate future arc.
- **Axis/label/grid/legend/title CHROME baking** — theme-sensitive + the pillar has no axis/text-contrast role.
- **Touching-mark adjacency role-C′** (neighbor-vs-neighbor ≥3:1, border-mediated) — new logic; deferred even if m05 is taken (m05 = mark-vs-canvas + role-A only).
- **True emit-then-read of ECharts baked itemStyle** — infeasible from certify's metadata-only IR; needs an input-schema change (own sub-arc).
- **Sequential/diverging contrast verdict** — stays role-B WCAG-exempt; baking the heatmap ramp is fidelity-only, doesn't move the verdict.
- **Client-side runtime theme-swap for cartesian marks** — foreclosed (resolved hex only renders; `var()` doesn't resolve in Vega SVG attributes / ECharts canvas).
- **Extending the OODS categorical token set beyond 6** — a `@oods/tokens` change; >6 cycles the 6.

---

## 10. Constraints (held every mission)

#110 (no scorer term — suggest goldens byte-unchanged) · #525 (MCP-only) · #564 (deliberately broken cartesian-color-only = planned regen; all else byte-stable) · determinism (pure resolver, stable ordering; `test:scale` is the tripwire) · `conformant`/`a11yEquivalence` unchanged · one shared resolver for bake+grade · hex canonical form · render↔certify identity at a new value (feed certify `viz.render`'s returned normalizedSpec) · no new tool (25) · per-mission single-string `cmos_session` capture · two-layer + full cross-package closeout · pm2 restart + reconnect.

---

## 11. Open risk for Derek's domain

No test pins a **literal** `viz.render` cartesian `contentHash` (all relational), so a wrong new hash is invisible to CI. If any out-of-repo reproducibility consumer (Meridian-style frozen-SHA) pinned the OLD cartesian hash, the bake breaks it silently. **m06 flags this for Derek** — it is not a build blocker.

---

## 12. Refs

grounding+critic `wf_826052a8-991` · s137 review `PS-2026-07-03-005` (#1018) · `cmos/planning/forge-viz-s137-contrast-first-decision-memo.md` §11 (brand-fidelity frozen as its own arc) · decision #1009 (emitter-seam finding — now reframed to the adapter seam).
