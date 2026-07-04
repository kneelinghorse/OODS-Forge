# Sprint-144 keystone memo — Cartesian chart-chrome OODS theme (GENERATE side)

**Status:** LOCKED 2026-07-04 (Derek). Planning session PS-2026-07-04-010.
**Grounding:** workflow `wf_13c5ff6f-704` (4 code-scouts → synthesist → adversarial critic vs HEAD a1b6846; verdict **amend-then-accept, zero blockers**, all 5 amendments folded below).
**Prior art (reuse, do not re-derive):** s138 brand-fidelity palette bake (commit `496c934`) — same seam, same `#564` owned-golden-regen discipline, same render↔certify contentHash-at-new-value.

This memo is the single source of truth. A build session executes m02→m04 without re-grounding.

---

## 1. Premise + value

The just-closed s134→s143 certify arc left the render path **color-only + chrome-bare**: cartesian charts bake the OODS categorical *series palette* (s138) but render **stock Vega-Lite chrome** — default axes, gridlines, typography, background, and a grey view box. This arc bakes a full OODS-tokened Vega `config` theme so generated cartesian charts read as *OODS-designed*, not *OODS marks on stock Vega*.

- **Agent-first / #115-clean.** It modifies the bytes existing `viz.render` / `viz.compose` / `dashboard.render` callers already receive over MCP. No new input field, no new tool, zero adoption required — every live caller gets better output on the next call. This is the structural inverse of the reverted NL→viz anti-pattern (which added an input surface with no puller). Same posture as the accepted s138 palette bake.
- **Real pull.** Meridian signal #1: Forge-Demos is held by Derek on *craft* ("not visually satisfying yet"), S4 UNHCR as the standing manual proving ground.
- **Bonus (honest framing — amendment #5):** `config.background = #FCFCFD` makes the render background equal the canvas certify already grades series against (certify's `CANVAS_TOKEN` is a hardcoded `#FCFCFD` constant that never read the render bg). This is a **cosmetic render↔certify surface alignment**, not a grading fix — mathematically no contrast-verdict flips.

## 2. The seam

`resolveOodsVegaConfig(spec)` — a new **pure** resolver in viz-core — resolves once at `packages/viz-core/src/adapters/vega-lite-adapter.ts:95` (the only level where `spec.config.tokens` is in scope; same one-shot point the palette resolver uses) and attaches top-level at `:129`. Config is a top-level Vega-Lite block, so — unlike the palette — it needs **no** `convertBinding`/`createMark` threading (structurally simpler than s138).

**Merge, don't overwrite (backward-compat #84).** Today `:129` is `config: markConfig` (`spec.config?.mark` or `undefined`). The bake becomes:
```
config: { ...oodsConfig, ...(spec.config?.mark ? { mark: spec.config.mark } : {}) }
```
Caller `mark` spread **last** so it wins its key; OODS chrome keys (font/background/title/axis/legend/view) have no caller counterpart (`VizConfig` = only theme/tokens/layout/mark, `normalized-viz-spec.types.ts:309`), so zero collision. Baked config becomes unconditionally present (was conditional) — correct and additive. Layer/facet/concat unaffected: config stays top-level on the outer spec and applies to all nested views.

**`prepareSpecForBrand` stays a no-op** (`viz-render/src/emitter.ts:80-90`, off the certify/hash path). The theme MUST be baked in `toVegaLiteSpec` to reach certify's contentHash — and must **NOT** be applied in `renderVegaLiteToSvg` (that would churn the emitter golden + double-theme the dashboard HTML export).

## 3. Token map (verified live vs `@oods/tokens`, light-only)

Reuse the palette bake's chain: `resolveTokenToColor` → `toHex` (`categorical-palette.ts:55-76`). Type tokens resolve through the same call (pass-through for non-oklch strings).

| Vega `config` surface | OODS token | Light value | Contrast on #FCFCFD |
|---|---|---|---|
| `background` | `--oods-sys-surface-canvas` | `#FCFCFD` | — (Derek-lock: FILL) |
| `title` color / `font` / anchor | `--oods-sys-text-primary` `#2D313A` / DM Sans / **left** | `#2D313A`, 24px, w600 | 12.71:1 ✓ |
| `axis.titleColor` | `--oods-sys-text-primary` | `#2D313A` | 12.71:1 ✓ (dodges slate-hue collision) |
| `axis.labelColor` | **`--oods-sys-text-neutral`** | `#494E5A` | **8.13:1 ✓ (Derek-lock)** |
| `axis.gridColor` (H-only) | `--oods-sys-border-subtle` | `#E9ECEF` | non-text |
| `axis.domainColor` + `tickColor` | `--oods-sys-border-neutral` | `#D5DAE4` | non-text |
| `legend` label/title | `text-neutral` / `text-primary` | — | ✓ |
| `font` (global) | `--oods-ref-typography-families-sans` | DM Sans stack | — |
| `view.stroke` | literal `null` | — | kills grey box |

**Type normalizers (pure, deterministic):** font-size resolves as `"24px"` → strip to number `24`; font-family carries a nested-quote artifact (`'"Helvetica Neue"'`) → normalize deterministically. Consider a thin `resolveTokenValue` wrapper reading the **same** `cssVariables` source (preserve the single-source guarantee); no new token may be invented (that would be a token-source change outside the additive bake).

**Chrome-only guardrail (correctness):** `resolveOodsVegaConfig` must **NOT** emit `config.mark.fill/color` or `config.range.category`. Those are series-color surfaces; certify reads encoding/mark-level, not config, so a config-level series color would be **graded-invisible yet render-visible = a render/certify drift hole**. The series palette stays solely in the s138 `scale.range`/`mark.color` bake.

## 4. The a11y-of-chrome gate (net-new correctness)

Chrome **text** contrast is graded by **neither** pillar (contrast pillar = series marks only, role-C ≥3:1; equivalence engine reads no color). So accessible chrome is a **by-construction** guarantee that this arc must self-enforce. Verified WCAG 1.4.3 on #FCFCFD: `text-primary` 12.71:1 ✓, `text-neutral` 8.13:1 ✓, `text-muted` 4.56:1 (razor-thin), `text-disabled` 1.85:1 **FAIL — never for text**. Non-text chrome (gridlines/axis lines) has no text requirement (WCAG 1.4.11 applies to meaningful graphical objects, not decorative gridlines).

**m03 mandatory tripwire:** a colocated unit test asserting **every baked chrome text token ≥ 4.5:1 on #FCFCFD**. Axis labels ship on `text-neutral` (8.13:1) so the default is not parked on the razor's edge.

## 5. `#564` golden discipline (owned, bounded)

The config bake deliberately churns the compiled cartesian bytes → an **owned** regen of exactly **two** snaps; **six** must stay byte-identical.

**CHURN (2):** `packages/mcp-server/src/tools/__snapshots__/viz.render.fidelity.test.ts.snap` (all 6 entries gain a top-level `config`); `dashboard.render.fidelity.test.ts.snap` (moves 3 ways: inlined cartesian panel specs, the literal dashboard `contentHash` at snap `:55`/`:446`, and the HTML-export rendered SVG chrome). Heatmap (MarkRect) is on the Vega-Lite path → regens, stays contrast `exempt`.

**MUST STAY BYTE-IDENTICAL (6, all off `toVegaLiteSpec`):** `viz.render.network-fidelity`, `viz.render.geo-fidelity`, `golden-echarts-options`, `viz-render/emitter.spec`, `golden-profiles`, `dashboard-layout`. (a11y-equivalence emission specs assert the IR upstream of the bake — untouched.)

**Regen procedure (reuse s138):**
- **STEP 0 (load-bearing):** `pnpm --filter @oods/viz-core build` FIRST — mcp-server vitest resolves `@oods/viz-core`→dist, so `-u` before the rebuild bakes stale bytes.
- **STEP 1:** `pnpm --filter @oods/mcp-server exec vitest run src/tools/viz.render.fidelity.test.ts src/tools/dashboard.render.fidelity.test.ts -u`.
- **STEP 2 prove-unchanged:** re-run the full colocated list WITHOUT `-u` (network/geo pass) + `pnpm --filter @oods/viz-core test` + `pnpm --filter @oods/viz-render test`; then `git diff --name-only -- '*.snap'` lists **exactly the 2 cartesian snaps**; `generate:check` clean.
- **STEP 3 determinism:** `pnpm --filter @oods/mcp-server run test:scale`.

**Render↔certify contentHash cross-test needs NO edit** (amendment #3): it asserts tool-to-tool equality — `expect(certified.determinism?.contentHash).toBe(rendered.contentHash)` (`artifact.certify.spec.ts:~298/310`), not a pinned literal. Both hash `sha256(canonicalize(toVegaLiteSpec(sameIR)))`, so they move to the same NEW value together. The only literal hash that regenerates is the dashboard one inside the churning snap (auto-captured by STEP 1).

## 6. Determinism

`resolveOodsVegaConfig` must emit a stable, literal-ordered, **array-free** scalar object (the chrome rubric has no arrays). `canonicalize` deep-sorts object keys, neutralizing key-order for both the hash and certify's `first===second` proof. Guard with `test:scale` + a colocated **bake-fires mutation guard** (mirror the s143 `vega-lite-adapter.spec.ts`): assert the compiled cartesian spec carries the OODS `config` (background/axis/font) so disabling the bake fails at the viz-core unit level, not only downstream.

## 7. Mission spine (strict `Requires` m01→m04)

- **m01 — Keystone memo [NO CODE].** *Requires: —.* This document, ratified + Derek-locked. Completed at creation.
- **m02 — `resolveOodsVegaConfig()` + bake + merge.** *Requires: m01.* Pure resolver (§3 chain + type-normalizers); merge at `:129` (§2); chrome-only guardrail (§3). Light-only. **Expected: `viz.render.fidelity` + `dashboard.render.fidelity` snapshots go RED until m03 — mirrors s138 m02; do NOT edit the resolver in response to those snapshot failures** (amendment #2). Render↔certify cross-test stays GREEN throughout.
- **m03 — Golden regen + prove-unchanged + a11y-of-chrome tripwire + determinism.** *Requires: m02.* §5 STEP 0→3 (owned regen of exactly the 2 snaps, prove the 6 byte-identical, `generate:check` clean); §4 mandatory a11y-of-chrome tripwire; §6 bake-fires mutation guard; `test:scale`; confirm render↔certify cross-test green at the new value with no edit.
- **m04 — Cross-package closeout + two-layer reconnect + cheap cleanups.** *Requires: m03.* Closeout gate sweep: `pnpm install --frozen-lockfile` + **ROOT** `pnpm typecheck` + `-r build` + all package suites + `generate:check`/`generate:schema-types --check`/`docs:api --check`. Rebuild viz-core dist so the aquex adapter serves themed bytes on the next call (execution fresh-per-call; **no advertised-schema change** so no re-advertise); restart pm2 `oods-forge-bridge` (mine). **Fold cleanups:** (a) **tool-manifest reconciliation** — `tool-descriptions.json` is **24** at HEAD (missing `fidelity.preview`) vs `registry.json`'s authoritative **25**; add `fidelity.preview` (+ `registry.snapshot` to `policy.json`) so the manifest matches 25 — the arc adds NO tool (amendment #1: the invariant is "no new tool," not "already 25"); (b) **register/roadmap reconciliation** — `docs/api/README.md` + `near.md` still describe NL→viz/certify as in-flight; reconcile to arc-close reality. Live-verify on :4466 AND aquex: a cartesian chart returns an OODS-themed `config`; series colors + certify verdicts unchanged; render↔certify contentHash identical at the new value; ECharts/geo output byte-unchanged.

## 8. OOS / DEFERRED (explicit)

- **Dark-mode / theme-aware resolver — DEFERRED.** `resolveTokenToColor` stays light-only. *Captured architecture (do not re-derive):* dark values live under a **parallel** namespace `--oods-theme-dark-*` (111 keys), **partial coverage** — `--oods-theme-dark-border-default` and `-border-neutral` are **UNDEFINED** (only subtle/strong exist dark). A future `resolveTokenToColor(theme)` lift must handle these gaps with a fallback; it is NOT a clean namespace swap.
- **ECharts chrome — DEFERRED.** Hardcoded greys at `treemap-adapter.ts:24-28`; separate adapter path; those goldens stay byte-identical.
- **Palette-hue revision — DEFERRED.** The 6 categorical hues are unchanged; this arc themes **chrome, not hues.** (The gold `#B6892B` 3.10:1 / green `#279669` 3.62:1 near-WCAG-floor headroom concern rides with the deferred hue revision.)

## 9. Derek-lock resolutions (2026-07-04)

Background = **FILL** (`#FCFCFD`); axis labels = **`text-neutral` #494E5A** (a11y-safe, 8.13:1 — semantically a repurposed `{theme.status.neutral.text}` token, accepted); axis titles = **`text-primary`** (dodges slate-hue collision); title anchor = **left**, size = **24px** (heading-lg); axis lines = keep muted **`border-neutral` #D5DAE4**; gridlines = **horizontal-only** at **`border-subtle` #E9ECEF**; font = **DM Sans** UI stack (not the Cormorant display serif).

**Constraints held:** `#564` (owned cartesian regen, bounded to 2 snaps), `#525` (no new tool; manifest reconciled to the authoritative 25), `#110` (certify untouched — generate-side arc), determinism (pure/array-free), `#115` (agent-first), `#84` (caller `config.mark` preserved).
