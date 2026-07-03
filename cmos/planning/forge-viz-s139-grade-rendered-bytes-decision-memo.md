# Sprint-139 Keystone Decision Memo — Certify Grades the Rendered Bytes

**Status:** LOCKED 2026-07-03 (planning `PS-2026-07-03-009`; Derek-ratified via AskUserQuestion — both forks answered with the recommended default). Grounded by `wf_b39c0409-d0f` (4 live-repo scouts + synthesist, 4/4 concur on Option A; probes rebuilt viz-core dist from HEAD 496c934). A fresh build session should execute this without re-grounding.

**Arc in one line:** Make `artifact.certify` grade the color hexes Forge **actually baked** into the compiled cartesian Vega-Lite spec — not a re-classification of the raw IR — so `contrast:'pass'` becomes **unreachable on any chart that didn't render the OODS palette**. This dissolves the s138-review "classifier-mismatch false-pass" (the reborn hollow), certify-OUTPUT-ONLY, #564-safe, no golden regen, render↔certify hash preserved.

---

## 1. The problem (s138-review lead carry-forward)

Sprint-138 baked the OODS categorical palette into the compiled cartesian spec so certify's contrast pillar grades rendered-reality. But the **bake gate** and the **grade gate** are two independent, *disagreeing* classifiers:

- **Bake gate** — `packages/viz-core/src/adapters/vega-lite-adapter.ts`: `convertBinding` (:277-285) bakes `definition.scale.range` **only** when `channel==='color' && inferFieldType(...) ∈ {nominal,ordinal} && palette.length>0`. `inferFieldType` (:384-439) **defaults an unqualified non-`EncodingColor` color binding to `'quantitative'`** (:438) → no `scale.range` baked.
- **Grade gate** — `packages/mcp-server/src/tools/certify-contrast.ts`: `colorRole` (:71-80) re-classifies the **same raw binding** and **defaults to `'categorical'`** (:79) → `evaluateContrastPillar` re-resolves `resolveCategoricalPalette(spec)` (:167) and grades the 6-slot OODS palette → `contrast:'pass'`.

**Confirmed live (HEAD 496c934):** a schema-valid IR with color binding `{field:'region', trait:'EncodingDetail'}` (or a typo `'EncodingColour'`, or bare `'Color'`, or `EncodingDetail+timeUnit`, `+aggregate`, or `EncodingSize`-on-color) compiles to `{"type":"quantitative"}` with **no baked `scale.range` and no `mark.color`**, yet certify returns `coverage:'certified'`, `conformant:true`, `contrast:'pass'`. That is the "certified ≠ rendered" hollow **reborn** on exactly certify's reason-to-exist surface (hand-authored agent IR; s136). The builder/`viz.render` path is IMMUNE (`spec-builder.ts:207` always emits `'EncodingColor'`) — this only bites IR fed directly to `artifact.certify`.

Root cause: `certified==baked` was guaranteed only *if the bake fires* — the shared resolver guarantees identical **hexes**, but a **second classifier** decides *whether* the bake fires, and it disagrees with the grader's default.

## 2. Decision — OPTION A: grade the compiled bytes (delete the grade-side classifier)

`evaluateContrastPillar` reads the color hexes off `toVegaLiteSpec`'s **output** (`scale.range` / `mark.color`) instead of re-classifying the raw IR and re-resolving the palette. This **deletes the grade-side classifier** (`colorRole` + `resolveCategoricalPalette` re-resolution) — there is no second classifier left to disagree, so `certified == rendered` **by definition** and the whole divergence *class* is structurally gone (not just today's default-mismatch).

**Rejected:**
- **Option B (unify the two classifiers)** — even the #564-safe flavor (make `colorRole` adopt the bake's quantitative default) stays **coupled**: certify still re-derives role from the binding and *assumes* the resolved palette was baked, so any future change to the bake **condition** (`vega-lite-adapter.ts:277-285`, which is more than the classifier) silently re-opens a certify/render gap. Also requires exporting the module-local `inferFieldType`. Kept only as a named fallback.
- **Option B2 (make the bake fire on these bindings)** — #564-BREAKING (moves rendered bytes → deliberate golden regen) AND semantically wrong (bakes a 6-slot categorical palette onto a binding the author left quantitative-over-a-string). Not a candidate.

## 3. The exact seam

**Two files, both in `mcp-server` (certify-output-only):**

### `packages/mcp-server/src/tools/artifact.certify.ts`
Today `:175-176` compiles **twice** and discards both objects into `canonicalize(...)`. Capture the first object and thread it into the grader:
```ts
const compiled = toVegaLiteSpec(certifySpec);            // capture (was inlined)
const first = canonicalize(compiled);
const second = canonicalize(toVegaLiteSpec(certifySpec)); // KEEP the 2nd compile — it IS the determinism proof (first===second). Do NOT "optimize" it away.
const stable = first === second;
const contentHash = sha256(first);                        // byte-identical to today
...
const pillar = evaluateContrastPillar(certifySpec, compiled); // NEW 2nd arg (:188)
```
The `try/catch → 'unchecked'` defensive wrapper (`:185-193`) stays. `contentHash` derives from an untouched `toVegaLiteSpec` → **render↔certify hash identity preserved**.

### `packages/mcp-server/src/tools/certify-contrast.ts`
New signature: `evaluateContrastPillar(spec: NormalizedVizSpec, compiled: VegaLiteAdapterSpec)`.
- `spec` is retained **only** for (a) the canvas token — `resolveSlotHex(CANVAS_TOKEN, overrideMap(spec))` (canvas is not in the compiled spec, so `config.tokens` canvas overrides still drive role-C), and (b) the **cardinality slice** — `distinctCount(spec.data?.values, colorField)`.
- Color hexes come from `compiled`. Handle **both compiled shapes** (`vega-lite-adapter.ts:133-147` emits `{mark,encoding}` OR `{layer:[{mark,encoding},…]}`):
```ts
const colorEnc = compiled.encoding?.color ?? compiled.layer?.[0]?.encoding?.color;
const mark     = compiled.mark            ?? compiled.layer?.[0]?.mark;
```

**Decision tree (grades RENDERED bytes):**
1. `colorEnc?.scale?.range` is a non-empty hex[] → **CATEGORICAL**: grade `range` **sliced to consumed cardinality** (role-C each vs canvas ≥3:1; role-A min-over-CVD ΔE00). *Invariant: keep the slice — see §5.*
2. else `mark?.color` is a resolved OODS hex (single-series, no `colorEnc`) → **SINGLE-SERIES CATEGORICAL**: role-C that one hex vs canvas; role-A N/A (needs ≥2 — the existing `slots.length>=2` guard).
3. else `colorEnc` exists but **no** `scale.range` and **no** `mark.color` → **EXEMPT** (role-B gradient / WCAG 1.4.11 essential exception). *This covers both the legit continuous scale AND the divergence/mistype case — see fork §4-A.*
4. else (no `colorEnc` AND no `mark.color`), or canvas unresolvable, or empty palette → **UNCHECKED** (honest, never a silent pass).

**Verdict table:**

| case | compiled color state | verdict | vs today |
|---|---|---|---|
| normal categorical (EncodingColor / explicit nominal-ordinal) | `scale.range=[hexes]` | **pass** (warn-band ΔE) | UNCHANGED (byte-identical hexes) |
| single-series (no color channel) | no colorEnc, `mark.color="#3668D8"` | **pass** | UNCHANGED |
| quantitative color (legit gradient) | colorEnc, no range | **exempt** | UNCHANGED |
| **divergence / no-bake** (EncodingDetail / typo / bare Color / +timeUnit / +aggregate / EncodingSize) | `{type:"quantitative"}`, no range | **exempt** | **FALSE `'pass'` DISSOLVED** |
| pathological (nominal type, empty palette → no range) | colorEnc, no range | **unchecked** | edge |
| no color enc AND no mark.color / canvas unresolvable | — | **unchecked** | edge |

**Governing rule:** *if the compiled spec baked NO OODS palette (no `scale.range`, no OODS `mark.color`) for a color-bearing chart, certify MUST NOT return `contrast:'pass'`.*

## 4. Ratified forks (Derek, AskUserQuestion 2026-07-03)

- **Fork A — no-bake divergence verdict = `'exempt'` (pure byte-reading).** The mis-typed binding really does render as a gradient (Vega renders `region` on a continuous scale), so `'exempt'` (WCAG contrast N/A) is honest-to-render and the false `'pass'` is gone either way. We do **not** re-import a compiled-vs-declared type cross-check to surface mistypes as a louder `'unchecked'` — that would drift back toward Option B's coupling. **Known documented limit:** the legit gradient (C) and the mis-typed categorical (D) are **byte-indistinguishable** in the compiled spec, so a categorical→gradient mistype is silently exempted; detecting *that* is a separate lint (an encoding-correctness concern, not contrast's job), a future candidate — NOT this arc.
- **Fork C — `conformant`-rollup stays a SEPARATE arc.** s139 keeps `conformant` a11yEquivalence-only (the s137-review C3 footgun — `if(conformant)` can still ship a `contrast:'fail'`/`'exempt'` chart — is NOT fixed here). Rolling contrast into `conformant` mutates a protected pillar's field semantics and is a policy/contract change deserving its own decision. Named follow-on candidate.
- **Fork B (single-series role-A) — no change.** One color → role-A N/A; role-C vs canvas still runs. Applied, not asked.
- **Fork D (double-compile) — keep the 2nd `toVegaLiteSpec` call.** It is the determinism proof; only capture the first object for reuse. Applied, not asked.

## 5. #564 verdict + behavior-preservation

**#564 = certify-OUTPUT-ONLY / additive / NO golden regen / hash preserved.** Edits live entirely in `mcp-server` (`artifact.certify.ts` + `certify-contrast.ts`); **zero** viz-core/viz-render source touched (no `inferFieldType`, no `convertBinding`, no bake, no `toVegaLiteSpec` change). `certify-contrast` cannot be imported by viz-core/viz-render (dependency direction) → structurally cannot move rendered bytes. `conformant`/`a11yEquivalence`/`determinism` pillars don't read contrast → untouched. No golden/fidelity JSON captures the contrast pillar. #525 held (no new tool; advertised set stays 25).

**Behavior-preserving for legit charts (proven):** the bake and the grade already share ONE resolver (`resolveCategoricalPalette`, `categorical-palette.ts:88`), so the hexes Option A reads off `scale.range` are **byte-identical** to what the grade computes today. Probe (viz-core dist, HEAD 496c934): legit nominal → baked `scale.range === resolveCategoricalPalette(spec)` (IDENTICAL); `config.tokens` slot-01 override → IDENTICAL; single-series → `mark.color === resolver[0]` (IDENTICAL). Only the divergence cases move.

**Load-bearing invariant:** keep grading the baked range **sliced to consumed cardinality** (`certify-contrast.ts:156-160`). The adapter always bakes the FULL 6-slot range (Vega recycles `domain[i]→range[i]`); grading all 6 instead of the sliced N would change role-A/role-C for low-cardinality legit charts (a failing slot 5/6 the chart never renders) — i.e. grading the full 6 is LESS rendered-accurate. Slice stays.

## 6. Mission spine (strict `Requires`; all #564-additive)

- **m01 — Keystone memo** (this file). *Requires: none.* Authored in the planning session; marked Completed at sprint creation.
- **m02 — Certify seam change.** Thread the compiled object in `artifact.certify.ts` (:175, :188); rewrite `evaluateContrastPillar` in `certify-contrast.ts` to the 2-arg signature + the §3 decision tree; governing rule "no baked palette → not `'pass'`"; drop the grade-side `colorRole`/re-resolution from the color-hex path (retain the data-cardinality + canvas reads). *Requires: m01.*
- **m03 — Regression tests** (#564-additive). Update `certify-contrast.spec.ts` (~10 call sites → 2-arg compiled input; the two single-series fixtures `mk({})`/`mk({tokens})` need x/y encodings added — else `toVegaLiteSpec` throws at `vega-lite-adapter.ts:163`) + `artifact.certify.spec.ts` end-to-end. New locks: (1) **divergence lock** — EncodingDetail / EncodingColour / bare Color / +timeUnit / +aggregate / EncodingSize → contrast NOT `'pass'` (expect `'exempt'`); (2) **legit categorical unchanged** (`'pass'` warn-band, same note); (3) **single-series** reads `mark.color`=cat-01 → unchanged; (4) **quantitative** → `'exempt'` unchanged; (5) **INVARIANCE lock** — a divergence IR's `conformant` / `a11yEquivalence` / `determinism` / `contentHash` are **byte-identical** to its `EncodingColor` twin (pins contrast-output-only). Assert `viz.render.fidelity` / `dashboard.render.fidelity` goldens untouched. *Requires: m02.*
- **m04 — Docs sweep + closeout + two-layer reconnect.** certify verdict-semantics docs (`docs/api/artifact-certify.md`, tool-descriptions, generated.ts if the schema description changes → regen via `@oods/schemas-tools` + `generate:check`); full local gate (frozen-lockfile, ROOT typecheck, `-r build`, mcp-server vitest + colocated goldens, test:scale, viz-core, viz-render); advertised set STILL 25. Rebuild dist + pm2 `oods-forge-bridge` restart (mine). LIVE-VERIFY on BOTH `:4466` AND aquex: divergence IR → `contrast:'exempt'` (was `'pass'`); legit categorical → `'pass'`; quantitative → `'exempt'`; single-series → `'pass'`; render↔certify contentHash identical at the UNCHANGED value; `conformant`/`a11yEquivalence`/`determinism` unchanged. *Requires: m03.*

## 7. Scope boundary (one clean slice)

**OUT (frozen):**
- **ECharts role-C′ breadth** — the 8 ECharts-primary types returning `contrast:'unchecked'` (s137-review C1 coverage-inversion). Separate arc; not part of dissolving the cartesian classifier-mismatch. (Prior grounding lives in decision 1024.)
- **`conformant`-rollup** (s137-review C3, fork C) — deferred; mutates a protected field.
- **dark-theme contrast** (resolver theme-blind) — frozen OOS.
- **Any bake / `inferFieldType` / rendered-byte change** (Option B2 / classifier-unification) — would break #564 + need a golden regen. s139 is certify-OUTPUT-ONLY.
- **Categorical-field-on-a-gradient mistype detection** (the C/D byte-indistinguishability) — documented known limit; a separate encoding-correctness lint, not contrast.

## 8. Refs
- s138 review PS-2026-07-03-008 (the classifier-mismatch finding); grounding `wf_27356113-742`.
- s139 grounding `wf_b39c0409-d0f` (4 scouts + synthesist; Option A 4/4).
- Constraints: #110, #525, #564 (additive), determinism, no new tool, render↔certify identity, `conformant`/`a11yEquivalence` unchanged.
- Lesson banked (s138): a shared resolver guarantees identical hexes only *where the bake fires* — when a second classifier decides *whether* it fires, "by construction" has a seam. Grade the emitted ground truth, not a re-derivation.
