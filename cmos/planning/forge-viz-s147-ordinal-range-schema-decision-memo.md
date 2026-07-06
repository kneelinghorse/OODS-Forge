# Sprint-147 Keystone Decision Memo — Explicit color `range` on the cartesian color channel (Meridian F5)

**Status:** LOCKED 2026-07-06 (Derek-ratified via AskUserQuestion; planning session PS-2026-07-06-002).
**SSOT:** this file. A fresh build session runs m02→m04 from here without re-grounding.
**Grounding:** workflow `wf_58cd4718-acd` (5 live-repo scouts → synthesist → adversarial critic vs HEAD `9e6c75f`). Critic verdict **AMEND-THEN-LOCK, 0 blockers, all anchors zero-drift**; 4 amendments folded below.
**Puller:** Meridian, named external consumer, inbox msg `258b6a7a` finding **F5** — first real-data consumption of the certify arc hit this gap: *"we needed a 2-color binary presence scale (implied / not implied) and had no path: encodings.color.scale accepts only a scale-type string, no range, no ordinal in the enum."*

---

## §1 — Scope (the honest reframe)

Meridian described F5 as "ordinal + range." The live code says **two of those three words are already shipped**, so the sprint is narrower and sharper than the label:

- **`type: "ordinal"` already exists** on the color binding ([viz.render.input.json:542-546](../../packages/mcp-server/src/schemas/viz.render.input.json)) and already fires the s138 OODS palette bake ([vega-lite-adapter.ts:292-300](../../packages/viz-core/src/adapters/vega-lite-adapter.ts), condition includes `definition.type === 'ordinal'`). Verified against HEAD.
- The genuinely **net-new, Meridian-pulled capability is the explicit color `range` array** on the cartesian color channel.

**THE SPRINT = add an explicit `range: string[]` (hex colors) to the cartesian color encoding, so an agent can override the baked OODS palette with its own scale (e.g. a 2-color presence scale). Additive; certify grades the supplied range by construction; no new tool.**

### Decided defaults (not forks — engineering calls stated for the record)

- **D-i — reuse `type:"ordinal"`, do NOT add a `scale:"ordinal"` enum value.** The positional `scale` enum (`linear/temporal/log/sqrt/band/point`) stays untouched. Adding `ordinal` there would additionally require a new `mapScaleType` branch ([vega-lite-adapter.ts:468-478](../../packages/viz-core/src/adapters/vega-lite-adapter.ts), currently returns `undefined` for `'ordinal'`) for zero consumer benefit — `type:"ordinal"` already drives the bake. Meridian's "no ordinal in the enum" is satisfied by the `type` field, not the `scale` field.
- **D-ii — `range` goes on a COLOR-ONLY binding def, NOT the shared `encodingBinding`, and NOT a `scale→object` union.** (Critic primary amendment — see §5.) The shared `encodingBinding` is `$ref`'d by x/y/color/size/shape/detail; putting `range` there would let it validate on five non-color channels and be silently dropped by the adapter (which only reads `binding.range` at `channel==='color'`). A color-only def makes non-color misuse a schema-level rejection (a clean AJV error), mirroring the geo precedent (`spatial-spec.schema.json` scopes range to the color context). A `scale→object` union was rejected by all 5 scouts: it ripples a discriminated type through 3 generated mirrors + 5 `binding.scale===` sites for no gain.
- **D-iii — hex-only item pattern** `^#(?:[0-9a-fA-F]{3}){1,2}$` (matches a11y-tools `isHexColor`, [contrast.ts:60-62](../../packages/a11y-tools/src/contrast.ts)). Load-bearing for #110: a non-hex entry makes certify's `hexToRgb` throw → contrast degrades to `'unchecked'` → `conformant:true` ships silently (Scout D's sharpest correctness risk). The schema pattern is the belt; V144 (§4) is the suspenders.

---

## §2 — The four Derek forks (LOCKED)

| Fork | Question | **Decision** | Consequence |
|---|---|---|---|
| **A** | Add `scale:"ordinal"` enum value, or does `type:"ordinal"` suffice? | **`type:"ordinal"` suffices** (= D-i). Range-only. | No `scale` enum change, no `mapScaleType` branch. |
| **B** | A 2-color presence scale usually uses gray/light for "absent," which certify's chroma-floor + role-C will grade `contrast:'fail'` → `conformant:false`. | **Honest-fail.** certify stays a pure reader; a gray "absent" slot truthfully fails — it is *exactly* the "reads as gray" condition Meridian asked us to catch in **F2** (the s146 chroma floor). Agents get a clear verdict + guidance to use a chromatic (≥-floor) "absent" color. | **Zero certify source edits. #110 held.** No presence-exemption / role-B path built. |
| **C** | Also apply range to the 3 geo types (choropleth/bubble_map/flow_map)? | **Cartesian-only. Geo OUT.** certify is geo-exempt ([artifact.certify.ts:125-135](../../packages/mcp-server/src/tools/artifact.certify.ts), `ECHARTS_GEO_EXEMPT_TRAITS`, in-code comment: the geo range "is invisible to certify"). Shipping a geo range = rendered-but-ungraded = the "moves the hollow more than closes it" failure the memory warns against. | Geo adapters are already range-ready ([spatial.ts:51](../../packages/viz-core/src/adapters/spatial.ts)) but stay unwired. See §6 OOS. |
| **D** | When a range is supplied on a type that can't consume it (the 5 self-contained ECharts-primary types: treemap/sunburst/sankey/force_graph/chord), silent-ignore / warn / fail? | **Fail-loud OODS-V error.** Reject with a clear code + message (Meridian's praised "listed allowed enums" failure-UX bar). Never silently render a chart that ignored the agent's range. | Broadened per critic amendment 2 to the general rule "range on any surface that does not consume it" — the non-color-channel half is handled structurally by D-ii; this fork governs the ECharts-primary-type half. See V145 (§4). |

---

## §3 — Mission spine (strict Requires m01←m02←m03←m04)

### m01 — Keystone decision memo *(this file; completed-at-creation, NO CODE)*
Ratifies §1 defaults + §2 forks + §4 codes + §5 constraints + §6 OOS. **DONE at creation.** Requires: none.

### m02 — Schema widening + compile step-aside *(the additive core)*
Land `range` end-to-end through the minimal file set, then make the bake step aside when a range is supplied.

1. **Input schema** — [viz.render.input.json](../../packages/mcp-server/src/schemas/viz.render.input.json): introduce a **color-only binding def** (e.g. `colorEncodingBinding` = the object variant of `encodingBinding` **+** a `range` property), and point the **color channel `$ref` only** at it (x/y/size/shape/detail keep `encodingBinding` unchanged). `range` = `{ "type":"array", "items": {"type":"string","pattern":"^#(?:[0-9a-fA-F]{3}){1,2}$"}, "minItems": 2 }`. Keep `additionalProperties:false`.
2. **IR twins in lockstep** — add `range` to `TraitBinding` in BOTH byte-identical copies: [schemas/viz/normalized-viz-spec.schema.json](../../schemas/viz/normalized-viz-spec.schema.json) (`TraitBinding` ~:173-256, `scale` :217-220, `additionalProperties:false` :255) AND the vendored [packages/viz-core/src/spec/normalized-viz-spec.schema.json](../../packages/viz-core/src/spec/normalized-viz-spec.schema.json). Guarded by [vendored-schema-parity.spec.ts:14-25](../../packages/viz-core/test/vendored-schema-parity.spec.ts) (byte-identity, no build-time sync — hand-edit both identically).
3. **Regenerate, never hand-edit** the two generated TS twins: `pnpm generate:schema-types` → [normalized-viz-spec.types.ts](../../packages/viz-core/src/spec/normalized-viz-spec.types.ts) `TraitBinding` (~:128); the schemas-tools generator → [generated.ts](../../packages/mcp-server/src/schemas/generated.ts) `EncodingBinding` (~:6586). Both are `--check`-gated in CI. **JSDoc trap:** any `description` string you add must be identical across both schema copies or parity/regen goes red.
4. **Builder** — [spec-builder.ts](../../packages/viz-core/src/builder/spec-builder.ts): add `range?: string[]` to `EncodingInput` (:55-67) and add `...(value.range ? { range: value.range } : {})` to the `normalizeEncodings` copy block (:966-976). **This is a per-field ALLOWLIST copy** (it does not copy `legend`) — a missing line silently drops `range` = a types-clean hollow ship. Verify the range survives into the IR.
5. **The #564 compile seam** — [vega-lite-adapter.ts:292-300](../../packages/viz-core/src/adapters/vega-lite-adapter.ts): add `!binding.range` to the **bake CONDITION** and a sibling write for the range case. **CRITIC AMENDMENT 3 (byte-identity is load-bearing):** the no-range branch MUST stay the VERBATIM `definition.scale = { ...existingScale, range: [...palette] }` (:298-299) — do NOT restructure into a ternary that could reorder the `scale` object's keys. The fidelity golden snapshots the raw spec object and vitest's pretty-format preserves insertion order, so a key reorder churns the **3 existing baked-range goldens at [viz.render.fidelity.test.ts.snap](../../packages/mcp-server/src/tools/__snapshots__/) lines 458 / 593 / 733** even though the canonicalized contentHash is unaffected. Those 3 entries are the explicit protect-targets. Scope the range write to `channel==='color'`.

**m02 EXIT PROOF (#564):** run the fidelity suites (viz.render.fidelity, network-fidelity, geo-fidelity, dashboard.render.fidelity) + viz-core golden-echarts/golden-profiles + viz-render emitter + the `test/scale` determinism suites → assert **ZERO snap churn**. Add exactly ONE net-new *with-range* golden fixture (new snap entry; existing entries untouched). Requires: m01.

### m03 — Validation teeth + certify-pin *(independent grading proof + failure-UX)*
1. **New validation codes** onto `warnings[]` / the OODS-V error path (§4). Warn-don't-throw for the ambiguous-but-renderable cases (matches the V134 strictFields posture, stays #564-silent on default); **fail-loud OODS-V error** (V145) for range-on-an-ECharts-primary-type per Fork D ([viz.render.ts:71](../../packages/mcp-server/src/tools/viz.render.ts) OODS-V path; the `buildEChartsPrimarySpec` hardcodes `encoding:{}` at :533 and the `allOf` if/then at ~:399 never forbids `encodings`, so a range on a treemap validates + drops silently today — this is the hole to close).
2. **Certify-pin tests** (all additive; no snapshots; NO certify source edit — proves #110 + Fork B). In [certify-contrast.spec.ts](../../packages/mcp-server/test/tools/certify-contrast.spec.ts) (mk/grade helpers ~:25-47): chromatic 2-color range → **PASS**; gray 2-color range → **contrast FAIL** (chroma floor, certify-contrast.ts:220); low-contrast-vs-canvas range → **role-C FAIL** (:205). **CRITIC AMENDMENT 4:** each pin MUST use **2-distinct-value sample data** so `slotCount` reaches 2 and role-A actually grades — certify slices the graded slots to `distinctCount` ([certify-contrast.ts:301](../../packages/mcp-server/src/tools/certify-contrast.ts)), so a binary range whose sample rows all carry the "present" value grades only `color[0]` and can PASS even with a gray "absent" slot. Harmless + render-accurate, but §5 (Fork B honest-fail) must not be over-claimed: real-world under-cardinality can mask the gray-absent fail. State this caveat in the memo (done here) and encode it in the test data.
3. **Cross-tool hash lockstep** — in [artifact.certify.spec.ts](../../packages/mcp-server/test/tools/artifact.certify.spec.ts) (~:276-312): agent range → `render.contentHash === certify.contentHash` (both hash the same compiled bytes; trivially holds, but pin it).
4. **Failure-UX bar** — the new AJV/OODS-V error strings meet Meridian's praised standard ([errors.ts:57](../../packages/mcp-server/src/security/errors.ts) enum message / :81 additionalProperties message list the allowed values). Requires: m02.

### m04 — Closeout + live-verify
Full local gate ([forge-closeout-gate-sweep] discipline, **including the newly-added root-vitest `tests/` lane** per the s146 review): `pnpm install --frozen-lockfile`, ROOT `pnpm typecheck`, `generate:check` + `generate:schema-types --check` + `docs:api --check` (ci.yml:55/58/61), `pnpm -r build`, viz-core + mcp-server + `test:scale` + `vendored-schema-parity` + `pnpm exec vitest run tests/ --project core` all green.
**Advertise the capability (#115, CRITICAL):** update [tool-descriptions.json](../../packages/mcp-adapter/tool-descriptions.json) viz.render prose (~:18) to name the `range` field — because [sanitize-schema.js:23-47](../../packages/mcp-adapter/) stubs the `$ref` and flattens the `oneOf` to the bare-string variant, so NONE of the object fields (incl. `range`) are machine-discoverable on the wire; discoverability rides entirely on the description string + AJV error text.
**Two-layer reconnect:** rebuild `@oods/viz-core` dist THEN mcp-server dist (vitest/runtime resolve viz-core → DIST), restart pm2 `oods-forge-bridge` (mine). **Live-verify via the :4466 bridge POST /run** (NOT a stale aquex session — advertised schema is connect-time-cached, execution is fresh): a supplied 2-color range renders in `scale.range`; a chromatic range certifies `pass`; a gray range certifies `contrast:'fail'` + `conformant:false`; a range on a treemap fails loud (V145); render↔certify contentHash identical. Confirm the manifest stays **25** (`registry.snapshot` + `fidelity.preview`, no new tool). Requires: m03.

---

## §4 — OODS-V code assignments (free block V143-V145; V142 is highest used, [registry.ts:168](../../packages/mcp-server/src/errors/registry.ts))

- **V143 — range-shorter-than-cardinality (WARN, retryable).** Vega natively recycles `domain[i]→range[i]` mod len, so a range shorter than the distinct series count silently cycles = ambiguous encoding (and a likely certify role-A fail). Warn, don't throw.
- **V144 — invalid-color-in-range (belt-and-suspenders to the schema `pattern`).** Surfaces a clear message if a non-hex entry slips through.
- **V145 — range-on-a-surface-that-cannot-consume-it (FAIL-LOUD, Fork D).** Range supplied on one of the 5 self-contained ECharts-primary types (treemap/sunburst/sankey/force_graph/chord). *(Range on a non-color channel is prevented structurally by the color-only def, D-ii, and yields a plain AJV `additionalProperties` error — no V-code needed.)* Also surface range-on-a-continuous-color-scale (a range on a `quantitative`/`temporal` color channel is dropped by the bake condition today) — WARN or FAIL per the build session's read of the same "never silently drop" principle; default WARN (renderable, just gradient-ignored).

---

## §5 — Constraints held (with proof obligation)

- **#564 (additive, byte-identical default)** — range reaches output ONLY through the `if (value.range)` builder copy and the `!binding.range` bake guard; field absent ⇒ identical `[...palette]` write. **Proof:** m02 exit — zero snap churn across all fidelity + determinism suites; the 3 baked-range goldens (snap 458/593/733) are the tripwire that catches a forgotten guard (a forgotten guard silently clobbers the agent range with the palette — the #1 correctness trap).
- **#110 (certify stays a reader)** — Fork B = honest-fail ⇒ **zero certify source edits**. certify reads `scale.range` off the compiled unit (certify-contrast.ts:287-303) and grades role-C → chroma-floor → role-A on the raw hexes. The hex-only schema pattern (D-iii) is load-bearing here: it stops `hexToRgb` throwing → contrast degrading to `'unchecked'` → a garbage-format range shipping `conformant:true`. **Proof:** certify-pin tests pass with NO certify source change.
- **#525 (MCP set stays 25)** — no new tool; viz.render widened in place. **Proof:** tool count = 25 at m04.
- **Determinism** — a static supplied range is pure input; `canonicalize` sorts object KEYS but preserves ARRAY order, so `scale.range` order = agent input order, reproducibly. **Proof:** `viz-determinism.spec.ts` byte-identical at 100/500/1000 rows.
- **#115 (agent-first)** — the advertised schema flattens the field off the wire, so discoverability rides on tool-descriptions.json prose (m04) + AJV/OODS-V error text meeting Meridian's failure-UX bar (m03).
- **#1081 (one theme)** — F5 = cartesian color range only; everything in §6 is fenced out.

---

## §6 — Out of scope (fenced to hold the theme + 4-mission shape)

- **Dashboard parity** — dashboard.render duplicates its own `EncodingBinding` (dashboard.render.input.json :554/:584) + dashboard-spec IR twin + generated dashboard.types.ts (:71). +5 files, second generator surface, no named pull. *(dashboard.render.ts:910/919 forwards encodings verbatim, so range would "just work" IF these were widened — deliberate carry.)*
- **geo.colorRange** (Fork C = OUT) — adapters ready (spatial.ts:51, echarts-bubble-adapter.ts:166, echarts-choropleth-adapter.ts:135) but certify is geo-blind; would need an explicit "ungraded" honesty note if ever shipped.
- **`scale:"ordinal"` enum value + mapScaleType branch** (Fork A = OUT — `type:"ordinal"` suffices).
- **`scale→object` union** (D-ii = OUT — sibling `range` on a color-only def instead).
- **certify presence-exemption / role-B path** (Fork B = OUT — honest-fail).
- **Real range support on the ECharts-primary types** (per-adapter plumbing into their `FALLBACK_PALETTE`) — OUT; m03 only rejects/warns (V145).
- **ECharts-cartesian (`output.echarts` colorBy) range parity** — separate renderer, does not bake `scale.range`.
- **certify slot-label cosmetic** — certify-contrast.ts:302 labels custom hexes with `categoricalToken(i+1)` (OODS token names the agent never supplied); does not affect any verdict; one-line follow-on, not a sprint requirement.
- **CATEGORICAL_SLOTS=6 slice cap** — ranges >6 graded on first 6 only; documented, harmless for the binary case.
- **viz.compose / code.generate / fidelity.preview** — no `encodings.color` surface.

---

## §7 — Carried forward (Meridian F-series remainder, still walled)

F1+F2 shipped (s146 palette + chroma floor). **F3+F4 = chord correctness** (cardinality/cycling guard at the ECharts adapters + link node-ref/duplicate-link validation with an OODS-V code) — next candidates after F5. **F6a-d = export/theme seams** (dashboard output.html SVG grid-span sizing; suppress trendDirection when no periodField; drop axisY.grid on MarkRect heatmaps; the default heatmap narrative that trips its own A11Y-R-11 warn). **D1 strain ledger** = registry/trait roadmap input, parked against PT/HCM domain modeling, separate track.
