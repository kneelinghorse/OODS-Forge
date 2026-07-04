# Sprint-145 Keystone Memo — ECharts chrome parity (GENERATE-side viz-craft)

**Status:** LOCKED 2026-07-04 (Derek-ratified, planning PS-2026-07-04-013). Single source of truth. The build session executes m02→m04 from this memo without re-grounding.

**Grounded by:** wf_fbc19c24-0d0 (4 code-scouts → synthesist → adversarial critic vs HEAD a1b6846-ish; verdict AMEND-THEN-ACCEPT, anti-circularity CLEAN, all critic amendments folded below). The seam scout failed its structured output but left no hole — the critic + inventory scout resolved the seam. The label-on-tile blocker was resolved by a real-palette WCAG sweep + Derek-lock.

---

## 1. Direction + anti-circularity

s145 = the SECOND viz-craft/GENERATE-side sprint after the s134→s143 certify close and the s144 cartesian-chrome beachhead. **Theme the chrome of the 8 ECharts-primary chart types** (treemap / sunburst / sankey / chord / force_graph + geo choropleth / bubble_map / flow_map) so they read as OODS-designed, exactly as s144 did for the 5 cartesian Vega types. This is the MIRROR IMAGE of s144: now the ECharts goldens are the owned-regen set and the cartesian goldens must stay byte-identical.

**Anti-circularity: CLEAN (critic-verified vs HEAD).** The 8 adapters already hardcode chrome on the live `viz.render` path today (treemap-adapter.ts:24-28 etc.). Swapping raw hex for a pure `resolveOodsEchartsChrome(spec)` threaded per-site means every `viz.render`/`dashboard.render` caller of the 8 types gets themed bytes automatically — **zero new input, no new consumer** (#115 held). No new MCP tool (#525, set stays 25). certify provably cannot see chrome bytes (artifact.certify.ts routes ECharts-primary to `echartsCategoricalVerdict`/`echartsGeoExemptVerdict`, which reconstruct the SERIES palette and never read label/border/background/textStyle), so the verdict cannot move (#110 held). Same antidote pattern as s144.

## 2. The seam (the ONE structural divergence from s144)

**SHARED pure resolver + PER-ADAPTER application.** Add a new pure module `packages/viz-core/src/tokens/oods-echarts-chrome.ts` exporting `resolveOodsEchartsChrome(spec)` — mirror of `resolveOodsVegaConfig` (oods-vega-config.ts:136): same `@oods/tokens` source, same `overrideMap(spec.config?.tokens)` precedence (#84), colors via `resolveTokenToColor` (echarts/token-resolver.ts:23), returning a scalar / array-free object `{background, tileBorder, emphasisBorder, labelOnCanvas, onTileLabelMechanism, surfaceFill, visualMapLabel, title}`.

**CRITICAL difference from cartesian:** Vega has ONE top-level `config` block merged once at vega-lite-adapter.ts:129-132. ECharts has NO single chrome block — chrome is threaded by **DIRECT ASSIGNMENT at construction time inside each of the 8 adapters**, at the exact constant sites, replacing the raw-hex module consts. Consequences (critic-confirmed):
- There is **no deep-vs-shallow merge hazard** and no risk of clobbering series `itemStyle` — #84 rides the token layer (`spec.config.tokens`), NOT an ECharts-option merge. State this explicitly; it is why the 8-site divergence from s144's single merge is safe.
- Map by **USAGE SITE, not by const name**: treemap `SURFACE_COLOR` is a fill (L54); sunburst `SURFACE_COLOR` is a ring-separator border (L56). Same name, different role.
- **Do NOT** build a generic option-walking post-processor (fragile, mis-maps by name).
- **Do NOT** edit `echarts/token-resolver.ts` — it is shared with the cartesian resolver; any edit churns the s144 cartesian goldens. Add ECharts chrome as a NEW pure module only.
- Group-B geo already routes chrome through `resolveColor` at `spatial/geo-token-color.ts:24` onto the LEGACY `--sys-*` namespace. Re-point those onto the unified `--oods-sys-*` tokens. **NOTE (critic):** the re-point is HEX-NEUTRAL by itself — token-resolver.ts:30 already maps `--sys-*`→`--oods-sys-*` via the `--oods-` fallback, so the resolved hex does not move. Geo golden churn comes from the net-new `backgroundColor` + the baked visualMap-label, NOT from the re-point. Do not imply otherwise.

## 3. Token map (light; Derek-locked)

TEXT surfaces are graded ≥4.5:1 on the baked `#FCFCFD`. Non-text surfaces are exempt.

| Chrome surface | Today | → OODS token | Hex | Note |
|---|---|---|---|---|
| **NET-NEW** top-level `backgroundColor` (all 8) | absent | surface-canvas | **#FCFCFD** | Derek ADD — sets the a11y reference surface; load-bearing, not cosmetic |
| group-A tile/node/arc region-border | `#e0e0e0` | **border-neutral** | **#D5DAE4** | **Derek-lock**: neutral (visible separators, mirrors s144 domain/tick). Geo borders stay subtle → coherent group-A-neutral / geo-subtle split |
| emphasis / hover border | `#666666` | text-neutral | #494E5A | interim (non-text, no gate); border-strong token = follow-on |
| **on-CANVAS** label text — sankey node (L23), chord arc (L38), graph node (graph L27), treemap breadcrumb (L57) | `#333333` | **text-primary** | **#2D313A** | 12.71:1 on #FCFCFD — TEXT, GRADED |
| **on-TILE** label — treemap node (L62) + upperLabel header (L67), sunburst arc (L51) | `#333333`/`#1a1a1a` | **legibility mechanism** | — | **Derek-lock** (§5). NOT a fixed token — the sweep proves every fixed color fails |
| treemap breadcrumb surface FILL (L54) | `#ffffff` | surface-canvas | #FCFCFD | non-text |
| sunburst ring-separator (SURFACE_COLOR as border, by-usage, L56) | `#ffffff` | surface-canvas | #FCFCFD | non-text; map by USE not name |
| chart `title.textStyle.color` (group-A) | ECharts-default (ungraded) | **BAKE** text-primary | #2D313A | Derek BAKE — else hollow (escapes tripwire) |
| geo visualMap numeric-tick label | ECharts-default (ungraded) | **BAKE** text-neutral | #494E5A | 8.13:1 — Derek BAKE |
| graph legend text (generateGraphLegend, graph-adapter.ts:329) | `{show,data}` only | bake text-neutral | #494E5A | fold into governed-text set |
| geo region FILL (choropleth L82 / bubble L84 / flow L81) | `var(--sys-surface-strong,#f2f2f2)` | surface-strong (LEAVE) | #F2F2F2 | non-text; maps read better on a base distinct from canvas |
| geo region BORDER | `var(--sys-border-subtle,#e0e0e0)` | border-subtle | #E9ECEF | non-text (the geo-subtle half of the split) |
| geo emphasis fill (choropleth L86) | `var(--sys-surface-raised,#dbeafe)` | surface-raised | #DBEAFE | non-text |
| tooltip chrome | ECharts-default / CSS-class | **DEFER** | — | mirror s144 no-tooltip-theme; follow-on |
| decorative emphasis shadow (treemap L81) | `rgba(0,0,0,0.05)` | LEAVE | — | sub-threshold alpha, decorative |

**SERIES-COLOR GUARDRAIL — NEVER theme as chrome:** `FALLBACK_PALETTE` (treemap-adapter.ts:19), `itemStyle.color`, `lineStyle.color` (chord:118 / graph:164 / sankey:113), geo visualMap/bubble/flow sequential ranges (`echarts-visualmap-generator.ts:10`). These are certify-graded (s141 role-C′); a token leak here would be graded-invisible / render-visible drift.

## 4. Real-palette label-on-tile sweep (the load-bearing a11y datum)

Treemap/sunburst labels render ON the categorical SERIES tile/arc color, not on the canvas. WCAG of the two candidate fixed label colors on the REAL OODS categorical palette (from `viz-scales.json:108` → `sys.status.*.icon`):

| Tile hue | text-primary #2D313A | white #FFFFFF | any fixed color ≥4.5:1? |
|---|---|---|---|
| blue #3668D8 | 2.56 ✗ | 5.09 ✓ | white only |
| indigo #3F45BE | 1.74 ✗ | 7.48 ✓ | white only |
| green #279669 | 3.51 ✗ | 3.71 ✗ | **neither** |
| gold #B6892B | 4.10 ✗ | 3.18 ✗ | **neither** |
| red #D94747 | 3.07 ✗ | 4.25 ✗ | **neither** |
| slate #606676 | 2.27 ✗ | 5.74 ✓ | white only |

`text-primary` fails on all 6; white fails on green/gold/red. **No single fixed label color is legible on-tile.** This kills the plan's original "text-primary is darkest = safest on tiles" rationale (struck per critic).

## 5. On-tile label mechanism (Derek-locked = "legible mechanism")

Bake fixed OODS text tokens ONLY where labels sit on the canvas (sankey / chord / graph node labels, treemap breadcrumb, title, visualMap). For treemap/sunburst **on-tile** labels (node label, treemap upperLabel header, sunburst arc label), use a **legibility mechanism settled at m02 build** so they are genuinely readable regardless of tile hue. Two acceptable mechanisms (m02 picks the simpler that holds determinism):
- **(preferred) token-driven text halo** — `label.textBorderColor` = surface-canvas #FCFCFD + `textBorderWidth` ~2 around a text-primary #2D313A label, so text stays legible on any tile; deterministic, token-driven, scalar.
- **per-tile luminance pick** — compute black/white per tile from the resolved series color; deterministic but more logic.

On-tile labels are therefore **genuinely covered**, not excused. The a11y tripwire (§6) asserts the mechanism is present for on-tile surfaces (e.g. `textBorderColor` set + `textBorderWidth > 0`), and grades the canvas-text tokens directly.

## 6. Net-new ECharts a11y-of-chrome gate

certify grades ECharts SERIES colors ONLY (s141); ECharts chrome text is graded by NEITHER pillar → accessible chrome is a by-construction guarantee this arc self-enforces.

- **New file** `packages/viz-core/src/tokens/oods-echarts-chrome.spec.ts` — self-contained inline sRGB WCAG `luminance`/`contrastRatio` copied verbatim from `oods-vega-config.spec.ts:19-33` (deliberately independent of certify's `@oods/a11y-tools` grader), importing the SOURCE resolver directly so a token regression fails at the viz-core unit level BEFORE any dist rebuild.
- Grades every BAKED chrome-text-vs-canvas surface ≥4.5:1 on #FCFCFD: on-canvas label (text-primary 12.71), breadcrumb, title (12.71), visualMap-label (text-neutral 8.13), graph legend (8.13). Include the never-`#6F7482` (text-muted 4.56 razor-thin) / never-`#B8BCC6` (text-disabled 1.85 fail) guard + ratio pins (text-primary 12.71, text-neutral 8.13).
- Asserts the on-tile **mechanism** is present (textBorderColor set / textBorderWidth>0) for treemap/sunburst on-tile labels.
- **HOLLOW-CLAIM enforcement (critic):** the bake-fires mutation guard MUST specifically cover `title.textStyle.color` AND `visualMap.textStyle.color` (not just backgroundColor + label.color) — these are ECharts-default today and most likely to be silently un-wired yet still pass a tripwire that only sees baked values.
- **Bake-fires mutation guard** (mirror s144 `compiled.config` deepEquals): assert each adapter's emitted `option` actually carries the resolver's chrome values (`option.backgroundColor === resolver.background`, series `label.color === resolver.labelOnCanvas`, etc.) so a silent un-wire fails loud.

## 7. #564 owned golden regen scope

**CHURN (owned regen — the ECharts set):**
- `packages/viz-core/test/__snapshots__/golden-echarts-options.spec.ts.snap` — 8 entries (treemap nested + adjacency, sunburst, sankey, force_graph, chord, choropleth, bubble_map)
- `packages/mcp-server/src/tools/__snapshots__/viz.render.network-fidelity.test.ts.snap` — 5 (treemap, sunburst, sankey, chord, force_graph)
- `packages/mcp-server/src/tools/__snapshots__/viz.render.geo-fidelity.test.ts.snap` — 3 (choropleth, bubble_map, flow_map)
- `packages/mcp-server/src/tools/__snapshots__/dashboard.render.fidelity.test.ts.snap` — **CONFIRMED churn** (critic): embeds a themed choropleth (chartType at :334, borderColor #E9ECEF at :426); the net-new backgroundColor + baked visualMap textStyle move it. NOT conditional.
- render↔certify contentHash for the 8 ECharts types moves in LOCKSTEP to its new value; verdict unchanged (tool-to-tool equality, mirror s144 — cross-test needs no edit).

**MUST STAY BYTE-IDENTICAL (prove it — the mirror-image invariant):**
- `viz.render.fidelity.test.ts.snap` — the s144 CARTESIAN owned set
- `packages/viz-render/test/__snapshots__/emitter.spec.ts.snap`
- `oods-vega-config.ts` + `oods-vega-config.spec.ts` — untouched
- `echarts/token-resolver.ts` — ZERO edits (shared resolver)
- `artifact.certify.ts` — #110 untouched, verdict unchanged

## 8. Mission spine (strict Requires m01→m04)

- **m01 — Keystone memo [NO CODE, completed-at-creation].** This file. Locks the seam, token map, on-tile mechanism, a11y gate, #564 scope, Derek-locks, and folded critic amendments.
- **m02 — `resolveOodsEchartsChrome` + bake + thread (goldens RED until m03).** Add the pure resolver at `oods-echarts-chrome.ts` (mirror oods-vega-config.ts:136); thread per-adapter at the constant sites — treemap-adapter.ts:24-28 (+ top-level backgroundColor), sunburst L24-27 (ring-separator by-usage → surface-canvas), sankey L23/L24, chord L38/L39, graph L27 (+ govern legend L329); implement the on-tile legibility mechanism (§5); re-point geo (choropleth L16-18, bubble L27-28, flow L24-25) onto unified `--oods-sys-*`; BAKE title + geo visualMap labels. DO NOT edit token-resolver.ts. Chrome-only guardrail (§3). Goldens expected RED.
- **m03 — Owned ECharts golden regen + a11y tripwire + mutation guard + test:scale.** Regen ONLY the 4 ECharts churn snaps (§7); PROVE the cartesian + emitter goldens byte-identical. Add `oods-echarts-chrome.spec.ts` tripwire (§6) + bake-fires mutation guard (title/visualMap specifically). `test:scale` determinism (pure/array-free). Move any render↔certify contentHash pin in lockstep.
- **m04 — Cross-package closeout + pm2 restart + aquex live-verify + changelog.** Full gate sweep (per forge-closeout-gate-sweep: `pnpm install --frozen-lockfile` + ROOT `pnpm typecheck` + `-r build` + full vitest + goldens + test:scale + viz-core + viz-render + generate:check + docs:api --check). REBUILD @oods/viz-core dist (mcp-server vitest resolves → dist). pm2 restart `oods-forge-bridge` (mine). Live-verify on :4466 + aquex a group-A type (treemap) + group-B (choropleth): themed chrome present (backgroundColor #FCFCFD, on-canvas label #2D313A), SERIES color unchanged, certify verdict UNCHANGED, contentHash moved render↔certify in lockstep. Changelog signal on the GENERATE side (viz.render schema-desc, per s144). Capture follow-ons.

## 9. Constraints (must hold)

#525 (no new tool, set 25) · #110 (certify untouched — generate-side) · determinism (pure / array-free resolver + test:scale) · #115 (agent-first — every viz.render caller of the 8 types gets themed bytes automatically) · #84 (caller `spec.config.tokens` overrides preserved) · #564 (owned bounded regen — the 4 ECharts snaps churn deliberately; the s144 cartesian + emitter goldens stay byte-identical).

## 10. Deferred-but-captured follow-ons

Tooltip chrome (group-A ECharts-default / group-B CSS-class at spatial-tooltip-config.ts:112) · dark-mode/theme-aware resolver (resolveTokenToColor is theme-blind; dark-theme chrome contrast stays OOS) · a `border-strong`/interactive mid-gray token (emphasis border is on text-neutral as interim) · palette-hue revision (still parked from s143).

## 11. Critic amendments folded (wf_fbc19c24-0d0)

1. Struck the "text-primary safest on dark tiles" claim — resolved by the §4 sweep + Derek's "legible mechanism" lock (§5).
2. Dashboard snap = CONFIRMED churn, not conditional (§7).
3. Geo re-point is hex-neutral by itself; churn comes from backgroundColor + visualMap-label bake (§2).
4. Corrected geo anchors to `spatial/echarts-choropleth-adapter.ts:16-18`, `echarts-bubble-adapter.ts:27-28`, `echarts-flow-line-adapter.ts:24-25`, chokepoint `spatial/geo-token-color.ts:24` (all HEAD-verified).
5. Line-anchor drift corrected: sankey LABEL L23 / BORDER L24; chord LABEL L38 / BORDER L39; graph lineStyle guardrail L164 (all HEAD-verified).
6. Seam clarification: direct-assignment per-adapter, no deep-merge hazard, #84 rides the token layer (§2).
7. Tripwire + mutation guard MUST specifically cover `title.textStyle.color` + `visualMap.textStyle.color` (§6).
