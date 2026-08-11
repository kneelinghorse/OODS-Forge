# Sprint-172 — certify-breadth 5→13: real determinism + accuracy for the ECharts-primary types

**Status: v2 LOCKED 2026-08-08.** Planning PS-2026-08-08-003. Grounding wf_fbd830f6-8a7 (6 lenses, anchors at HEAD `95dd57d`). **Critic wf_7ae1a20f-5d5 REJECTED v1 on 3 of 5 lenses (3 blockers — one shared root defect — / 14 majors / 20 minors) — all disposed in §6; the four load-bearing grounding claims plus the two verdict-deciding critic claims were re-measured in the main loop (rule 19).** Derek ratified (AskUserQuestion ×1, 4 forks): **operand path = OPTIONAL data-branch input on artifact.certify** · **pillar scope = determinism + accuracy (a11y-equivalence DEFERRED, §1d)** · **riders = B/dark re-author AND bubble_map symbolSize fix** · **critical.icon = family-coherent ±1, stated deviation from the 8° formula**. The mobile multi-brand rider was floated pre-grounding and WITHDRAWN by grounding (§4). Crawl 1–3 stays QUEUED for the PT-seed pairing; PT silence noted 2026-08-08 — **decouple trigger: still silent at s172 close → crawl 1–3 runs solo in s173**.

Build in a FRESH session from this memo ONLY (rule 9); review is a separate session (rule 10). Rule 15: every recorded verification output is a PASTE of a command actually run at final HEAD. New standing closeout item (s171 review): **every non-descoped mission ends with ≥1 CMOS decision, verified by decisionCount at closeout.** Carried method rule (s171, #1442 extension): fault injection into any value-transform/emission path keys on a specific literal operand and fires unconditionally — no one-shot flags.

---

## §0 What this sprint is

s141/s142 gave all 13 chart types a real contrast verdict; s170 opened the accuracy pillar for the 5 cartesian types. The remaining honest gap: for the 8 ECharts-primary types (treemap, sunburst, sankey, force_graph, chord, choropleth, bubble_map, flow_map), `pillars.determinism` and `pillars.accuracy` are `'unchecked'` — not because nothing is checkable, but because **certify cannot see the operand**: its input is `{spec}` only and the ECharts IR is metadata-only by ratified design (`data:{values:[]}`, `encoding:{}`; the chart data lives in the viz.render tool-input branch, never in the IR — viz.render.ts:791-808, main-loop re-verified). s172 builds the ratified operand path — an **optional `data` input** — and lights both pillars honestly on it: a re-emit determinism proof with byte-for-byte contentHash parity against viz.render **for the same (spec, data)**, and type-specific accuracy rules over real operands. Coverage stays `'uncertified'` and conformant stays `null` (the s141 "Design A" template — zero closed-enum changes). Riders: the B/dark status re-author (ratchet 5→0) and the bubble_map symbolSize defect fix.

## §1 Grounded facts (wf_fbd830f6-8a7 + critic corrections; anchors at HEAD `95dd57d`)

### 1a. The certify surface

- Routing: certify classifies from `spec.marks[0].trait` (after MarkHeatmap→MarkRect aliasing); ECharts-primary via `isEChartsPrimaryMarkTrait` → uncertified branch (artifact.certify.ts:145, :257-286). The 8-type table is the ONE shared constant `ECHARTS_PRIMARY` (echarts-primary.ts:26-49) — but the categorical/geo partition (:151-169) and `CARTESIAN_VEGA_TRAITS` (:126-138) are hand-mirrored local copies, and the partition ALSO lives in normalized-viz-spec.schema.json's if/then — **which itself exists as two byte-identical physical copies (schemas/viz/ + packages/viz-core/src/spec/), so the partition lives in FOUR places**. Any breadth edit keeps all of them in step or ships a lying contract.
- Today's {spec}-only ECharts verdict (main-loop re-verified at :190-198): `coverage:'uncertified'`, `conformant:null`, `findings:[]`, pillars `{a11yEquivalence:'unchecked', determinism:'unchecked', contrast:<real>, accuracy:'unchecked'}`, **`notes:[echartsA11yNote(trait)]` and nothing else** — so any operand-absent note or note rewording IS a byte change to the {spec}-only response. The byte-compat control is therefore SPLIT (§1g).
- Cartesian determinism, exactly: `first = canonicalize(toVegaLiteSpec(spec))`, second compile IS the proof, `stable = (first===second)`, `contentHash = sha256(first)` (artifact.certify.ts:311-337). The same compiled object feeds contrast + accuracy — the honesty property to replicate.
- Schema looseness that matters: `determinism` and `accuracySummary` are OPTIONAL output properties whose "certified path only" restriction lives ONLY in prose — emitting them on the uncertified path VALIDATES against AJV today (artifact.certify.output.json:28-59). What locks the current shape is the spec's deep-equal tests (artifact.certify.spec.ts:91-97, :215-220) — rewritten deliberately, not loosened. Closed enums that must NOT change: coverage 2-value, conformant [boolean,null], pillar values. `finding.code` has NO pattern constraint — new codes validate with zero schema-shape change.
- Output is AJV-validated on the wire per call (index.ts:124-128, :279-286); generated.ts is generated; the handler hand-duplicates the shape as local TS interfaces (artifact.certify.ts:71-119) that move in step.
- Tool-description promises that DIE this sprint (tool-descriptions.json:20): "the 8 have no Vega compile, so they emit NEITHER"; "the contentHash round-trip is cartesian-only"; "OODS-V150..V153"/"four rules" (also in generated.ts prose :256/:272/:284/:318/:337). Rewritten in step, docs/api regenerated.
- certify takes NO brand (s169 — brand cannot change any verdict; false affordance). **The data branch is NOT that case: it genuinely changes verdicts — it is the operand, not an affordance.** The input-schema description gains that counterpart statement beside the retained brand-refusal prose (main-loop verified: artifact.certify.input.json is `{spec}` required + additionalProperties:false — m01 lands exactly there).

### 1b. The 8 adapters (viz-core) — emission is deterministic, re-emission is feasible

- All 8 are pure exported functions of `(spec, data)` (echarts/ + spatial/ under packages/viz-core/src/adapters/). Zero Math.random/Date/env on the emission path.
- viz.render's ECharts contentHash ALREADY EXISTS: `sha256(canonicalize(echartsOption))` over the JSON-PROJECTED option — `JSON.parse(JSON.stringify(raw))` drops tooltip formatter closures (+ bubble symbolSize fn), then `__joinDiagnostics` deleted, `__registration` KEPT, hash computed over the same object specRef caches (viz.render.ts:683-690, :767-770 — main-loop re-verified). **A certify re-emit proof replays this projection exactly or it can never match.**
- The private geo surface is **viz.render.ts:819-959** (GeoInputError class, resolveFeatureCollection, renderGeoOption for all three types, DEFAULT_GEO_DIMENSIONS) — the m01 extraction reshapes its signature off `VizRenderInput` to `(idOrName, chartType, geoBranch, description)` so certify can drive it from the IR + branch. The sankey validators are importable TODAY (`validateSankeyInput`/`SankeyValidationError`, sankey-utils.ts:27/:40 via the viz-core barrel); **chord has NO value validation at all** (buildLinks passes values verbatim, chord-adapter.ts:177-182) — render-side F4 covers dangling/duplicate refs only.
- force_graph bakes NO layout seed — the OPTION is deterministic, the rendered layout is runtime physics (graph-adapter.ts:6, :152). Determinism wording is option-scoped with render-nondeterminism stated.
- chord is the only fully JSON-safe raw option; the other 7 carry droppable closures — hash the projection, never the raw return.
- **Tokens-bundle caveat (carried into deliverables, not floated):** palette/chrome resolution reads the installed @oods/tokens bundle at module load (token-resolver.ts:16) — hash identity across processes assumes one bundle version. This is a named clause in the m02 determinism note AND the m04 schema prose.

### 1c. Accuracy rule engine + the chartered rules

- Cartesian rule interface: `evaluate(IR, compiled)` pure, tri-state outcome; `rulesEvaluated` counts resolved rules only (accuracy/types.ts:29-54, index.ts:66-99). The four cartesian rules NEVER run on ECharts inputs (V153 would pass vacuously; V150-152 unresolvable — a meaningless 1/4 'pass').
- **The branch operand cannot reach `evaluate(spec, compiled)` — m03 explicitly charters the engine seam:** a new ECharts-side rule type + `evaluateEChartsAccuracyRules(spec, data)` per-type evaluator, with the cartesian `ACCURACY_RULES` + its interface UNTOUCHED (the s170 pins stand). The index.ts closed-set ratification comment ("each decidable from the IR + the compiled spec alone. Adding a fifth is a scope decision, not a code change") is REWRITTEN with the new scope chain: this memo's Derek-ratified pillar fork IS the scope decision; the premise widens to per-type operands.
- Codes: V154–V199 free, no V16x exists; next occupied block V200 (registry.ts:219-236). New entries V154–V159 + rationale comments land in registry.ts (declared §3 mover). **Certify-side accuracy findings are error-severity by construction — including V158, where render deliberately only warns (V148-class) on the same data; the escalation is stated in the rule comment + closeout decision.**
- **The six rules (operands all in the data branch; anchors verified):**
  - **V154** treemap/sunburst negative or non-finite node value — passes verbatim into the option; area/angle cannot encode it (hierarchy-utils.ts:27-84).
  - **V155** treemap/sunburst non-additive explicit parent — parent.value ≠ Σ children ONLY where a parent HAS an explicit value, compared under a chartered **relative epsilon (1e-9)** with a RED/GREEN pair at the tolerance boundary (float sums must not false-positive on legitimate decimal data).
  - **V156** sankey/chord negative link value — sankey validation is finite-only (sankey-utils.ts:42-48); **chord validates nothing on values, so negative AND non-finite chord values pass** (chord-adapter.ts:177-182).
  - **V157** sankey explicit node.value overriding computed flow (ribbons don't tile the node; sankey-utils.ts:106-126 — provenance is erased in the OPTION, which is exactly why the rule reads the BRANCH); intermediate-node conservation ONLY where in>0 AND out>0; same 1e-9 relative epsilon, tolerance-boundary RED/GREEN.
  - **V158** sankey duplicate directed links (deliberate REOPEN of the s148 V148 sankey exclusion, certify-side only, render untouched — stated in the rule comment and the closeout decision; error-severity escalation stated per above).
  - **V159** choropleth join-conflict — fires ONLY when a multi-matched feature's records carry **CONFLICTING values for the joined valueField** (the rendered value is then silently last-record-wins arbitrary, geo-data-joiner.ts:104-113); benign multiplicity (agreeing/duplicate records) does NOT fire — the joiner's own comment documents one-to-many as supported, and `__joinedRecords` rides the served bytes on multi-match (available to the rule author).
  - **force_graph: NO rule — honest.** Its distortion candidates are adapter constants, not authoring choices. With data + an empty offered set: `accuracySummary {rulesEvaluated:0, failing:0}` + a note naming the empty set. Without data: NO accuracySummary + the operand-absent note. **The two 'unchecked' flavors are distinguished by exactly these devices.**
  - Choropleth ramp distortion NOT chartered — corrected reason: **not authorable through the tool-input geo branch** (the shared SpatialSpec construction never sets a domain; the visualmap generator WOULD honor one at the adapter layer — echarts-visualmap-generator.ts:38-42 — but the branch cannot express it).
- s170 proof pattern per rule: synthetic RED + minimal one-property GREEN twin, mutation gate proving evaluate() fires, discriminating checks via module-internal predicates, schema-valid fixtures, keyed unconditional fault injection.

### 1d. A11y-equivalence — DEFERRED, with the reason on the record

The engine (16 rules) has NO per-rule not-applicable state — a rule whose precondition is absent returns pass(), indistinguishable from a meaningful pass (equivalence-rules.ts:9-73). Run on a metadata-only ECharts IR: R-03 hard-errors on the missing table, ~12 rules pass trivially, R-09 fails any unnamed IR. A data-backed run would flip existing `'unchecked'` verdicts to `'fail'` — a verdict migration needing its own deliberate rollout (s134→s135 warn-first precedent). Deferred to the s173 candidate list; the echartsA11yNote rewording (m04) states this reason — never "cartesian-only" as if structural.

### 1e. Rider — B/dark re-author (S)

- The 5 copies: `status.critical.icon` oklch(0.79 0.13 24) · `status.neutral.surface` oklch(0.32 0.02 260) · `.border` oklch(0.41 0.025 260) · `.text` oklch(0.86 0.02 260) · `.icon` oklch(0.74 0.02 260) (B/dark.json:208-230 vs themes/dark/status.json:205-247).
- Method (s168 m03 precedent): hue nudged toward brand hue 232, ≤8°, L/C byte-identical, then re-measured. Neutrals: 260→252 (B's own info hue; text 4.5:1 / icon 3:1 preserved by construction, then evaluator-proven). **critical.icon: Derek-ratified family-coherent ±1 → hue 23** (family sits at ~24; the formula's 16 breaks coherence; deviation stated here).
- Sweep EVERY candidate string against BOTH theme-layer value sets pre-commit (byteCopies compares whole-set, status-provenance.spec.ts:60-66).
- Spec change: delete `B_DARK_RATCHET` + ratchet test, un-filter B/dark into the zero-copies loop, REWRITE the header narrative (:15-19). **Guardrails total UNCHANGED at 24/5** — the ratchet test is replaced 1-for-1 by the un-filtered case; movement is test identity + assertions, not count.
- Contrast constraints: critical.icon vs critical.surface oklch(0.31 0.12 24) ≥3:1 · neutral.text vs new surface ≥4.5:1 · neutral.icon vs new surface ≥3:1; border role-free (brand-rules.ts:127-130). Measured through the enforcing oracle's own sRGB-clipped path (**the s168 measure-through-the-enforcing-oracle rule — cited by name, not number**). $descriptions stay RATIO-FREE (PAIR_FOR_CLAIM has no entries for these slots).
- Blast radius, verified: ONLY `dist/css/tokens.css` moves (two B-dark blocks, 5 declarations each); mobile files carry zero occurrences (grep 0); snaps zero matches; matrix/bridge/census oracles generated-from-source and auto-track. Governance: 2 high + 3 medium → **PR needs `token-change:breaking`** (Derek applies). The A78/B41 figures are branch-vs-main snapshots, NOT this change's counts.

### 1f. Rider — bubble_map symbolSize defect (S/M)

Served bubble_map options have NO size encoding: the adapter bakes `symbolSize` as a function closure and viz.render's JSON projection drops it — the declared size scale is silently lost over the wire (main-loop re-verified: buildSizeFunction closure at echarts-bubble-adapter.ts:93-123). Fix = per-datum numeric symbolSize in the data items (same [6,28] range and linear/sqrt/log math, JSON-safe, closure eliminated).

- **Target file, exactly: `packages/viz-core/src/adapters/spatial/echarts-bubble-adapter.ts`.** The repo carries a SECOND full implementation at `src/viz/adapters/spatial/echarts-bubble-adapter.ts` (main-loop verified) — **deliberately UNTOUCHED**: its closure works in-browser; the defect is wire-serialization-only. Its root-core snap (`tests/viz/adapters/spatial/__snapshots__/echarts-visual-regression.test.ts.snap`, pinning `"symbolSize": "[function]"`) is a declared NON-mover. The viz-core file's port-parity header comment is REWRITTEN to record the deliberate divergence.
- **Declared .snap movement, both files named:** mcp-server `viz.render.geo-fidelity.test.ts.snap` (bubble_map entries) + viz-core `golden-echarts-options.spec.ts.snap` (the bubble_map JSON-safe golden — currently the artifact documenting the dropped closure). Regen diff-reviewed + decision-recorded. Other bubble-touching suites are verified non-movers (live equalities/structural assertions, no pinned shapes).
- New tests, placement named: the served-option RED-first control (pre-fix: served option lacks symbolSize — the defect reproduced; post-fix: per-datum sizes match the scale math computed in-test) lands in **mcp-server test/tools**; the per-datum scale-math unit half in **viz-core**.
- m02's parity tests are LIVE cross-tool equalities (no pinned hashes), so this rider's hash movement cannot stale them regardless of build order.

### 1g. Controls

- **Byte-compat, SPLIT (disposes the critic's shared blocker):** (i) **cartesian {spec}-only calls byte-identical end-to-sprint**; (ii) **ECharts {spec}-only calls move in `notes[]` ONLY** — the enumerated, declared movement is exactly: the m02 operand-absent determinism note, the m03 operand-absent accuracy note, and the m04-reworded echartsA11yNote; enums/shape/pillars/conformant byte-stable; the review asserts the diff is exactly the enumerated rewordings and NOTHING more. m01's own done-bar runs the FULL-byte replay (m01 changes nothing on the no-data path); that control retires when m02 lands the declared notes movement.
- **Web SHAs, split:** ts `f452d2e79a757c5d…` + tailwind `f7b25e3dda727624…` byte-identical at closeout; css is a DECLARED mover confined to the two B-dark blocks; mobile files byte-identical.
- Suite baselines (s171 finals): root core 4826+16/441 · guardrails 24/5 (**unchanged by m05**, §1e) · mcp-server 4036+16/199 · coverage 4865+16/453 · viz-core 1286/62 · scale 62/4. Snap census 14/61 — movement = the two named m06 bubble_map goldens ONLY.
- Served-path: certify + viz.render + viz-core adapters move → rebuild + pm2 restart oods-forge-bridge; **the aquex ADVERTISED schema is connect-time cached — the input-schema change requires the reconnect note to consumers** (execution fresh-per-call).

## §2 Mission slate — DAG: m01 → {m02, m03} → m04 · m05 root · m06 root · m07 requires all non-descoped

**Descope order:** m06 first, then m05, then m03's V159, then m03 entirely. **m04 is NON-descopable** — m02 alone already falsifies the published "emit NEITHER"/"cartesian-only contentHash" claims; if m03 descopes, m04 degrades to the determinism-only sweep (requires m02 alone) and the V154–V159/per-type prose defers with the descope decision. **m01 + m02 + m04 ARE the sprint.**

### m01 [M] — the operand path: optional `data` input + the shared extraction

1. Input schema gains OPTIONAL `data`: the viz.render branch shapes (hierarchy | sankey | network | geo | chord), one branch at most, additionalProperties:false preserved. **The branch $defs are a DECLARED mirrored copy of viz.render.input.json's (cross-schema $ref unresolvable in this AJV setup — the file's own header pattern) with a source-naming comment as the keep-in-step mechanism.** `{spec}`-only calls: FULL-byte replay control at m01 close (retires per §1g when m02 lands).
2. **The geo extraction lives HERE (not m02):** viz.render.ts:819-959 (GeoInputError, resolveFeatureCollection, renderGeoOption, DEFAULT_GEO_DIMENSIONS) → a shared exported module, signature reshaped off VizRenderInput to `(idOrName, chartType, geoBranch, description)`; viz.render behavior byte-identical (its goldens prove it). Alongside: the F4 dangling-ref check (V147, chord+force_graph keying) extracted the same way so certify's operand path REJECTS what render rejects — a structured error, not a throw. Duplicate-link warns (V148-class) are NOT replayed at certify: sankey duplicates become m03's V158; chord/force_graph duplicates stay render-side warns (stated).
3. Branch validation reuses: `validateSankeyInput`/`SankeyValidationError` (importable today) + the extracted geo guards + the extracted V147 check → structured OODS-V126-class errors mirroring viz.render.ts:773-785. No re-typed validation logic anywhere.
4. Branch↔trait mismatch → structured error. `data` on a CARTESIAN spec → structured error (dead input = false affordance). Unmodeled-trait + data → the same structured error as cartesian+data.
5. Handler TS interfaces + input JSON schema + generated.ts move in step; assertNormalizedVizSpec untouched. The input description gains the operand-not-affordance statement beside the retained s169 brand-refusal prose.

### m02 [M] — determinism pillar for the 8 (requires m01)

1. certify re-emits via the SAME adapter calls (geo via the m01-extracted shared builder), replays the SAME JSON projection + `__joinDiagnostics` strip (+`__registration` kept), then: `first = canonicalize(projected)`, second re-emit IS the proof, `stable`, `contentHash = sha256(first)`.
2. With `data`: pillars.determinism real + determinism block + contentHash on the uncertified path (deep-equal locks rewritten deliberately). Without `data`: `'unchecked'` + the operand-absent note — **a DECLARED notes[] movement per §1g**.
3. **The determinism note carries both scoping clauses:** force_graph option-scope (render layout is physics, not covered) AND the tokens-bundle clause (hash identity assumes one installed @oods/tokens bundle version).
4. **Parity, live cross-tool, same-(spec,data):** for each of the 8 types, a test renders via viz.render and certifies the SAME (spec, data) — `certify.contentHash === render.contentHash` computed in-test (s136 pattern, no pinned hashes).
5. RED-first mutations, per-type honest: (i) delete `__registration` from the replayed projection — bites choropleth/flow_map always and bubble_map with geometry; (ii) skip the `__joinDiagnostics` strip on an unmatched-join choropleth fixture — bites choropleth specifically (the strip is a no-op for the other geo types; a strip-mutation cannot red them and is not claimed to).

### m03 [M] — accuracy rules for the 8 (requires m01)

1. **The engine seam, chartered:** new ECharts-side rule type + `evaluateEChartsAccuracyRules(spec, data)` with per-type offered sets; cartesian `ACCURACY_RULES` + `evaluate(spec, compiled)` UNTOUCHED (s170 pins stand); the index.ts closed-set ratification comment rewritten with the new scope chain (§1c). `accuracySummary.rulesEvaluated` = resolved rules from the type's offered set.
2. V154–V159 per §1c — tolerances, conflict-only V159, severity-escalation statement, and the V158 reopen all as chartered there. Registry entries + rationale comments (declared §3 mover).
3. Without `data`: accuracy `'unchecked'` + the operand-absent accuracy note (**declared notes[] movement, §1g**); never a vacuous pass. force_graph-with-data: `accuracySummary {rulesEvaluated:0, failing:0}` + empty-offered-set note.
4. Each rule ships the s170 proof pattern (§1c last bullet), fault injection keyed + unconditional.

### m04 [S/M] — contract truth sweep (requires m02 + m03-if-not-descoped; NON-descopable)

Every promise surface rewritten in step: input+output JSON schema prose · generated.ts regen (schemas-tools + generate:check) · tool-descriptions.json (the "emit NEITHER"/"cartesian-only contentHash"/"four rules" claims → per-type truth) · docs/api regen --check · echartsA11yNote reworded per §1d (**declared notes[] movement**) · **ECHARTS_GEO_EXEMPT_NOTE + the artifact.certify.ts:163-169 geo-exempt comment reworded: the non-grading rationale becomes the s141 exempt-all-geo RATIFICATION, not operand invisibility — m01 removes the invisibility** · the spec deep-equal locks rewritten to the new shapes · **the determinism/contentHash prose for the 8 states parity holds ONLY for the same (spec, data) supplied to both tools — certify claims nothing about what the caller actually rendered** · the tokens-bundle clause (§1b) · two-layer reconnect note for the aquex advertised schema.

### m05 [S] — rider: B/dark re-author (independent root)

Per §1e. Neutrals 260→252 at byte-identical L/C; critical.icon 24→23 (family-coherent, ratified). Candidate-string sweep vs both theme layers PASTED pre-commit. Ratchet spec → zero-copies for all four cells + header narrative rewritten (guardrails total unchanged 24/5). Evaluator-run contrast proof pasted (4.5/3.0/3.0). Descriptions ratio-free. PR carries `token-change:breaking` (Derek applies; label-gated diff run pasted).

### m06 [S/M] — rider: bubble_map symbolSize fix (independent root; descopes FIRST)

Per §1f. Target `packages/viz-core/src/adapters/spatial/echarts-bubble-adapter.ts` ONLY; the src/viz twin untouched + its snap a declared non-mover + the port-parity header rewritten. Per-datum numeric symbolSize (same [6,28] + linear/sqrt/log math, JSON-safe). Both named goldens regen'd, diff-reviewed, decision-recorded. RED-first served-option control (mcp-server) + scale-math unit test (viz-core).

### m07 [S] — closeout (requires all non-descoped)

Gate table by LITERAL invocation, env vars included. Controls per §1g: split byte-compat (cartesian identical; ECharts notes[]-only diff asserted equal to the enumerated declared movement) · ts+tailwind SHAs byte-identical · css diff confined to the two B-dark blocks · mobile files byte-identical · snap movement = the two named m06 goldens only. Served-path: rebuild + pm2 restart oods-forge-bridge + aquex reconnect note. Charter-diff line-item EVERY mission; **decisionCount ≥1 per mission verified**; suite totals from final observed runs only (rule 15). NOT self-certified; review charter §5.

## §3 Predicted movement (exhaustive; finals at closeout per rule 15)

- m01: artifact.certify.ts + artifact.certify.input.json (mirrored branch $defs) + generated.ts + handler interfaces + the NEW shared geo/link-integrity module + viz.render.ts (import swap, behavior byte-identical) + new mcp-server test/tools files. **mcp-server totals move; root core does NOT** (no root-core test consumes these surfaces).
- m02: certify determinism path + deep-equal lock rewrites + parity tests (mcp-server) — mcp-server totals move.
- m03: viz-core accuracy/ (new ECharts rule modules + evaluator + rewritten ratification comment; types union untouched on the cartesian side) + **packages/mcp-server/src/errors/registry.ts (V154–V159 entries)** + viz-core + mcp-server test files — both suites' totals move.
- m04: tool-descriptions.json + docs/api ×2 + both schema prose + generated.ts + spec deep-equal rewrites.
- m05: brands/B/dark.json (5 values) + status-provenance.spec.ts + dist/css (declared, confined). **Guardrails totals UNCHANGED 24/5.**
- m06: packages/viz-core echarts-bubble-adapter.ts + the two named .snap files + 1 mcp-server test + 1 viz-core test. src/viz twin + its root-core snap: declared NON-movers.
- m07: diagnostics.json counter delta (declared).

## §4 Deferred / declined (explicit)

**Mobile multi-brand×theme emission — WITHDRAWN by grounding**: B-base byte-identical to default (breadth theater); un-bridged cells inert; hc cells cannot compile; per-cell API shape is a consumer-API commitment with no mobile consumer (the s171 easing-deferral ground). Revisit with the mobile walk's consumer. · **A11y-equivalence breadth** → s173 candidate with the §1d migration plan. · Crawl 1–3 — QUEUED for the PT seed; **decouple trigger: PT still silent at s172 close → solo in s173**. · Typed easing emission (unchanged). · **#781** — declined 3×; the 8 keep `conformant:null` so no rollup exists on their path — #781 remains a cartesian-path hole, unchanged by this sprint. · bubble_map ordinal-categorical contrast grading — **the s141 exempt-all-geo ruling STANDS, now resting on the ratification alone: m01 removes the operand-invisibility half of its recorded rationale (m04 rewords the note + comment accordingly)**. · force_graph layout seed (option-vs-physics, §1b). · certify.native — s166/s171 feasibility datum stands; gated on the mobile walk's consumer. · PT seed + client conversation (Derek-gated).

## §5 Review charter (rule 10)

Reproduce: the SPLIT byte-compat control (cartesian {spec}-only byte-identical; ECharts {spec}-only diff exactly the three enumerated notes[] movements and nothing more) · live cross-tool hash parity for all 8 types on BOTH serving paths (:4466 AND aquex, same-(spec,data)) · each new V15x rule's RED/GREEN incl. the two tolerance-boundary pairs + one mutation spot-reproduced per family · the B/dark candidate sweep + evaluator ratios re-measured · the m06 served-option control + the src/viz twin's snap verified UNMOVED · §1g SHA/diff-confinement controls re-derived after the review's own rebuild · per-mission decisionCount · zero info_push unless chartered · rule-15 paste audit.

## §6 Critic dispositions (wf_7ae1a20f-5d5: 3 blockers / 14 majors / 20 minors — v1 REJECTED 3-of-5)

**B1 (shared across 3 lenses)** byte-compat vs chartered notes[] movement unsatisfiable → SPLIT control (§1g): cartesian byte-identical; ECharts {spec}-only moves in notes[] only, enumerated + declared; m01's full-byte replay retires at m02; §5 asserts the exact diff. Majors: geo validators private at m01 time → extraction MOVED into m01 (step 2), anchor corrected :819-959, signature reshaped off VizRenderInput; engine interface cannot reach the branch operand → `evaluateEChartsAccuracyRules(spec, data)` chartered + ratification-comment rewrite (m03.1); m02 mutation RED unsatisfiable for 2/3 geo types → two mutations, per-type honest (m02.5); V159 fires on benign multiplicity → conflict-only firing chartered; V155/V157 float false-positives → 1e-9 relative epsilon + tolerance-boundary RED/GREEN; same-(spec,data) scoping absent from shipped wording → m04 line item; tokens-bundle caveat floated not chartered → m02 note + m04 prose; TWO bubble adapters + undeclared root-core snap → target named, twin dispositioned untouched, snap declared non-mover, port-parity header rewrite chartered; guardrails count-delta arithmetic false → corrected to unchanged 24/5 (1-for-1 replacement); root core not a mover for m01-m03 → dropped; registry.ts missing from §3 → added; ECHARTS_GEO_EXEMPT_NOTE rationale falsified by m01 → m04 sweep + §4 ruling-rests-on-ratification clause. Minors: chord validates nothing (V156 wording); choropleth-ramp declined reason re-anchored to the SpatialSpec builder; both m06 snap files named + non-mover suites stated; V159 __joinedRecords clause; m04 dependency 'm02 + m03-if-not-descoped' + NON-descopable + determinism-only degradation; V147 divergence resolved by extracting the check (m01.2) with V148-class warns stated non-replayed; branch-$defs mirrored copy declared with keep-in-step comment; #781 wording corrected (no rollup on the 8's path); operand-absent note wording + empty-set accuracySummary both specified; V158 severity escalation stated; partition FOUR places (schema file ×2 physical copies); s168 oracle-path rule cited by name; certify.native deferral reason added.

## §7 — Post-review corrections (2026-08-10, written in s173 m01; review session PS-2026-08-08-004)

The genuine-close review of s172 (verdict: **PARTIAL GENUINE CLOSE**, decision #1462) confirmed
six defects. Two of them are corrections to the RECORD this memo and its closeout shipped, and
the s168 §8 precedent applies: **the text above is left exactly as written; the corrections of
record are here.** Each was re-verified in s173 m01 before this block was written (rule 14).

| claim, as shipped | measured |
|---|---|
| Gate row **G21** (s172 closeout): tokens-governance `highRisk` **119, UNCHANGED, not moved by s172** | **121 at final HEAD** (78 brand A + 43 brand B). The row is not wrong about the tool — it is wrong about the TREE: `tokens:governance` resolves `--head` through a git ref, so a row run before the sprint commit existed measured the parent commit. m05's own decision **#1457** already recorded the **+2/+3**, so the closeout contradicted a decision from inside the same sprint. |
| m01: the lift of `renderGeoOption` into `echarts-geo-option.ts` is "**behaviour byte-identical; its goldens prove it**" | **False, and the goldens could not have proven it.** The lift changed the signature from a whole `VizRenderInput` to a `{id, name}` record, and viz.render's new call site guarded that record with a truthiness spread where the pre-lift code used `??`. For `id: ''` — admissible on both schemas, neither has `minLength` — viz.render therefore stopped passing the id at all and emitted `map-viz:<type>` where the pre-lift code emitted the deriveMapName fallback. No geo golden supplies an `id`, so the golden set was silent on the one input that moved. This is the same defect as review finding 1 (the cross-tool parity break) seen from the render side. |

Both are fixed in **s173 m01**, not merely recorded:

- The G21 lesson is now **standing rule A** — *a gate whose operand is a git REF cannot run
  before the commit exists; "at final HEAD" means after the commit, or the row names the tree
  it actually measured.* s173 m05 runs the governance row post-commit and records
  `git rev-parse main` beside the paste, from the corrected baseline of **121**.
- The lift lesson is now **standing rule B** — *when a private function is LIFTED to a shared
  module, compare the CALLERS' argument guarding, not just the function body.* The one-line fix
  (viz.render passes `id` unconditionally) ships with
  `packages/mcp-server/test/tools/artifact.certify.geo-id-parity.spec.ts`, which enumerates the
  three values an optional identity can take — absent, `''`, truthy — across all three geo
  types on both handlers, and carries the pre-fix guard as a live mutant.

The other four defects were product/prose rather than record, and are fixed in the same mission:
V159's sparse-row false positive (presence-filter + a GREEN/RED pair), the self-contradicting
`echartsA11yNote`, the `emptyOfferedSetNote` impossibility claim, the "range is reachable"
contrastNote, and the missing two-layer reconnect note (now in `tool-descriptions.json`,
`configs/agent/policy.json` and the regenerated `docs/api`).
