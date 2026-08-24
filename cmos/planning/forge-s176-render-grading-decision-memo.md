# Forge s176 — certify grades the render, not the intent

**Status: LOCKED v1 (2026-08-24).** Grounding + critic: `wf_5752f679-823` (5 grounding lenses, 3 critic lenses, lock adjudicator) — **ACCEPT**. 13 grounding amendments, 11 blockers / 15 majors / 16 minors merged into 16 folds, ALL applied below. Planning session PS-2026-08-23-002.

**Derek direction 2026-08-24:** "Grade what actually renders, not what was intended. Just as you suggest." The chartered house-in-order s176 (prose sweep, agent-facing docs, admin mission, Forge-Demos fixtures) is **pushed back** until other priorities are in place — it queues, it does not die. The eight ECharts-primary types are agreed as a **later rung, named honestly**: this sprint grades the five cartesian-Vega types on their real render; ECharts stays at no verdict with an explicit park + trigger. The forced block rides the sprint. PT stays on hold; nothing below is a Derek decision beyond the direction already given.

## §0 The defect this sprint exists to close (measured, not asserted)

Executed 2026-08-23/24 on the live :4466 bridge at HEAD `4f64bcf`, PS-2026-08-23-002:

1. A 10-series bar chart built through Forge's own `viz.render` (`rows` with `series` S01..S10, `color:{field:'series'}`) compiles with a **six-hex baked categorical range** (`#416CD9 #3E44BE #279669 #B78827 #CA4948 #993B00`) and **no domain** — Vega recycles: series 7–10 repeat colours 1–4. `viz.render` emitted `warnings: []`.
2. `artifact.certify` over that IR returned `coverage:'certified'`, `conformant:true`, all four pillars `'pass'`, `findings:[]`.
3. Rendering the same compiled spec through the repo's own `@oods/viz-render` dist (`renderVegaLiteToSvg`) and counting fills: colours 1–4 carry 4 marks each, colours 5–6 carry 2 each — **exactly four colliding series pairs at the pixel level**.

Forge generated the chart, chose the palette, exhausted it, and certified its own output conformant with zero findings.

**Mechanism, precisely.** Certify's contrast pillar already owns real distinguishability machinery — role-A pairwise CIEDE2000, min over normal + deuteran/protan/tritan CVD, with a fail floor (`certify-contrast.ts` `minPairwiseDeltaEOverCvd`, `ROLE_A_FAIL_DELTA_E`). The ten-series chart passes because of **what is graded**, not how: `certify-contrast.ts:314` slices the graded set to `Math.min(Math.max(n,1), Math.min(range.length, CATEGORICAL_SLOTS))` with `CATEGORICAL_SLOTS = 6` — six *distinct* palette hexes, mutually distinguishable by construction. The recycled *assignment* (slot 7 = hex 1, ΔE00 = 0) never reaches the grader. The slice's own comment calls itself "load-bearing" and "MORE rendered-accurate" — the ten-series measurement proves the opposite. The repo has known the class: `viz.render.ts:155-161` (the V146 never-cycle comment) says palette recycling is "invisible to certify's s141 data-independent palette-constant grade" — but that warning exists **only on the ECharts path**; the cartesian F5 warning (`viz.render.ts:364-373`) fires only when the *agent supplies* an explicit `colorRange`, so the default baked palette can never warn.

**The claim to retire:** `artifact.certify.ts:632-634` — "grades the color hexes the adapter BAKED into the compiled spec … so certified == rendered by construction." False when consumed cardinality exceeds the palette. The output schema already promises contrast is "the rendered-reality verdict"; this sprint makes that sentence true.

## §1 Ground truth and decisions

### 1a. m01 — Render-backed contrast [XL]

**Thesis:** the contrast pillar's graded object becomes the rendered series-to-paint assignment, so a colour collision cannot be invisible to it.

Decisions:

1. **D1 — the render happens inside certify's cartesian path.** `artifact.certify.ts` holds `compiled = toVegaLiteSpec(certifySpec)` at **:626** and calls `evaluateContrastPillar(certifySpec, compiled)` at **:642** (imported at :54). Grounded: `evaluateContrastPillar` has **exactly one production caller** (that line); two test files reach the export by name — widening its signature to async/render-fed is local. m01 renders `compiled` via `renderVegaLiteToSvg` (`@oods/viz-render` — already a workspace dep of mcp-server at `package.json:37`, already used in production by `dashboard.render.html.ts`, already CI-covered with an SVG golden at `ci.yml:733`) and feeds the rendered paint assignment into grading. `handle` is async end-to-end; the await is legal.
2. **D2 — the graded object is the rendered SERIES-TO-PAINT ASSIGNMENT, never a deduplicated fill set.** `n` = consumed cardinality of the color field from the IR's inline data (the same read m03a performs); assignment = the paint each consumed series actually renders, **duplicates RETAINED** across series before pairwise grading — consumed cardinality > distinct rendered paints proves a recycled ΔE00=0 pair even where per-mark series attribution is unavailable in the SVG. **Paint channel per mark type:** fill for bar/area/rect, **stroke for line/point** (or fill∪stroke per mark) — line and scatter paint series colour as stroke, and their `'pass'` verdicts on ≤6-series charts are declared NON-movers. **Extraction selector mandated:** groups whose class contains `role-mark` with no `role-axis`/`role-legend`/`role-title` ancestor; `role-frame` and `role-scope` are STRUCTURAL and whitelisted (a filter treating them as chrome returns zero data marks — reproduced in the grounding probe); legend exclusion is REQUIRED, not optional. **Both naive readings are rejected in writing:** a deduped distinct-paint set can never contain the recycled pair (it rebuilds the §0 defect — ten series render only six distinct hexes); a raw per-mark fill multiset lets an author decoration painted in a palette hex fake a ΔE00=0 collision and break the s139 lock — non-series marks stay outside the assignment even when their paint coincides with a palette hex.
3. **D3 — collisions fail through the EXISTING role-A branch.** A recycled pair has ΔE00 = 0 < `ROLE_A_FAIL_DELTA_E` → `contrast:'fail'` with the existing role-A note naming the value. **No new verdict semantics, no new enum value, no new threshold** — verified mathematically by the critic: assignment duplicates introduce only ΔE00=0 pairs, which hit the existing fail floor; the 2–10 caution band is untouched.
4. **D4 — the slice dies.** `certify-contrast.ts:314` + `CATEGORICAL_SLOTS` are deleted, not widened.
5. **D5 — the CASE-2 fork generalises to the render; CASE-3 is preserved by compile-time classification.** A rendered data-mark paint that matches the OODS resolved palette (override-aware, the shared resolver) is graded; one that does not is author chrome → NEUTRAL skip, never a fail (the Derek-ratified "grade OODS series colors only" fork). **The CASE-3 exemption is classified from the COMPILED SPEC before any rendered-paint logic runs** — a color channel with no baked categorical `scale.range` (continuous/default scale) returns `'exempt'` with `EXEMPT_NOTE` exactly as today; rendered-paint palette-matching applies only to units that baked a categorical range or a slot-1 `mark.color`. **The canonical quantitative-color heatmap is a named NON-mover control** — its rendered fills are interpolated `rgb()` ramp values, none OODS; fed to the palette-match fold they would silently move `'exempt'`→`'unchecked'`. Must-not-move pins: `certify-contrast.spec.ts:202/:208/:216`, `artifact.certify.spec.ts:191/:419/:445`.
6. **D6 — verdict edges keep s175 m04 semantics, stated precisely.** Render throws or produces no readable mark groups → `'ungradeable'` + note naming the fault. **No GRADEABLE series paints after the D5 fork** (all data-mark paints non-palette, or no data marks at all) → `'unchecked'` — the decorative #000000 bars ARE colour-bearing; it is the fork, not colour-presence, that decides. **The render call executes inside certify's existing try at `artifact.certify.ts:641-648`** (or an equivalent catch degrading to `'ungradeable'` + fault note at `status:'ok'`) — a render throw must never escape to `status:'error'`; `contrast-fault.spec.ts`'s armed pins (:68-80) are the tripwire. **Tri-state invariants that must NOT move:** the decorative + decorative-poisoned trio (contrast `'unchecked'`, `conformant:true`, pairwise plain/poisoned byte-equality — the poison provably never reaches the render; `resolveChromeColor` falls back on malformed overrides) and poisoned-canvas (`'ungradeable'`, `conformant:false`). The `unchecked-tristate.spec.ts:98` note text ("No color encoding or mark color") is the ONLY declared tristate reword; the tristate spec doubles as the chrome-extraction tripwire in both directions.
7. **D7 — `contentHash` does not move.** It stays `sha256(canonicalize(compiled))` over the untouched compile — render↔certify hash identity with `viz.render` is a shipped invariant. The render feeds grading (and m02), never the hash.
8. **D8 — a SIGNALLED BREAKING CONTRACT CHANGE, per the s140 [B] precedent (#1042), exactly as s175 m04 was.** Charts that certify conformant today can red tomorrow — correctly. The s172/s173 split byte-compat control's clause (i) ("CARTESIAN {spec}-only responses are byte-identical end-to-sprint. No exception.") is **rewritten this sprint**; the control's invariant becomes the s173 form: *moves only where a mission said, in writing, it would.* **Coverage-expansion mover class, declared:** agent-supplied `colorRange`s longer than 6 slots become fully graded (the deleted slice previously capped grading at 6) — same thresholds, wider truth.
9. **D9 — baseline rebase sequenced FIRST, the s173 m01 precedent, retirements ENUMERATED.** Before any source edit: recapture `__fixtures__/s172-certify-spec-only-baseline.json` at pristine `4f64bcf` in a detached worktree via the existing `s172-spec-only-capture.mts` literal command. Concrete retirements in `artifact.certify.spec-only-bytes.spec.ts`: `BASELINE_COMMIT` `'e5bf2f6'`→`'4f64bcf'` (:39 + three describe titles); BOTH `DECLARED_NOTE_REWORDS` entries (:62-82 — keyed on e5bf2f6-era fragments absent from a 4f64bcf baseline, so :161-174 red on the fresh capture); `DECLARED_CONTRAST_NOTE_REWORD` (:97-103 — :138 reds because the s173 reword is already in the new baseline); the provenance test (:212-217) re-keyed to post-s175 fragments. **Survivors that stay:** mutation-discrimination (:187-195) and the shape check (:199-205).
10. **D10 — RED-first proof.** The §0 ten-series case as a committed spec — RED at HEAD (asserts `conformant:false` + `pillars.contrast:'fail'` + a role-A ΔE00=0 finding; HEAD returns conformant:true), GREEN after; the assertion shape read off existing certify output pins, never assumed (the s175 m05 lesson). Controls: a 6-series chart (no recycling) stays `pass` byte-stable in every pillar; the s175 tri-state specs re-anchored per D6. **Mutant (restated post-D2): cap the graded assignment to its distinct paints — the slice's behaviour re-expressed — → the ten-series test reds again.**
11. **D11 — the caveat FORK.** `RENDERED_CONTRAST_CAVEAT` (`certify-contrast.ts:82-84`) is a shared constant threaded into all 8 ECharts contrastNotes (`gradeCategorical` appends at :206/:217/:232-234/:245-246/:253-258, reused at :450-454; `ECHARTS_GEO_EXEMPT_NOTE` ends with it at :484). Decision: **fork the caveat** — the cartesian path gets the new render-backed sentence; the ECharts paths get their own constant, **byte-identical to today's text, with a test pinning the ECharts constant unchanged**. §4's "ECharts path: zero movement this sprint" stays true under the fork. Land the ECharts byte-identity pin WITH the D9 rebase, before any source edit.
12. **Touches (declared movers, complete):** `certify-contrast.ts` · `artifact.certify.ts` · `artifact.certify.output.json` (contrast description prose; retire the stale "per-pillar tri-state summary" phrase while the file is open) · **`test/tools/certify-contrast.spec.ts` — whole-file rewrite** (the sync 2-arg grade helper at :47 becomes async/render-fed; ~20 result reads become await; :56 pins the retired prose) · `artifact.certify.spec.ts:153-157` ("baked into the compiled spec" prose pin) · `unchecked-tristate.spec.ts:98` (declared reword) · **`packages/mcp-adapter/tool-descriptions.json`** — the connect-time advertised text ("READS the color hexes Forge BAKED", determinism as compile-only) is falsified by m01/m02 AND is the source `docs/api` is generated from (`generate-api-reference.ts:4/:15/:17`; CI staleness gate `ci.yml:61`) — **sequence its edit BEFORE the docs/api regen** · `configs/agent/policy.json:227-228` (same falsified semantics, read by `scripts/agent/approval.ts:70`) · the spec-only baseline + its spec · new test file(s). **Every reworded contrast/determinism description path-scopes its claims: five cartesian traits render-measured, eight ECharts traits reconstruction-graded from baked constants.**

### 1b. m02 — Render-backed determinism [M] — requires m01

Today (`artifact.certify.ts:620-630`): determinism = `canonicalize(toVegaLiteSpec(spec))` twice, string-equal — a **compile** proof; the fold comment at **:683-684** concedes "`stable` is inert (a pure compile is always byte-stable)". m02 makes the pillar falsifiable:

1. Determinism = the existing compile proof **AND** double-render byte-equality: `sha256(renderVegaLiteToSvg(compiled))` twice, equal. `renderVegaLiteToSvg` pins text metrics and normalises auto-IDs precisely so this holds (`emitter.ts:1-15`) — **confirmed empirically by the grounding probe: byte-stable across all five traits**.
2. **New output field, conditions pinned:** `renderHash` is declared **OPTIONAL** in `artifact.certify.output.json` (the determinism object is CLOSED — `required` stays `['stable','contentHash']`, `additionalProperties:false` at :100) and is emitted on the **cartesian path ONLY**. Tripwires that it never leaks: the rebased clause-(ii) ECharts control and the rest-of-object test (`spec-only-bytes` :115-123). An advertised-schema move — reconnect note rides closeout (R-d).
3. The :683-684 "stable is inert" comment dies. The `stable` fold clause becomes load-bearing.
4. **Proof:** seam mutant perturbs one render → the pillar reds on `stable` and consequently `conformant`; reverted green. The render is computed ONCE for m01's grading and reused for one of m02's two hashes — the second render IS the proof, mirroring the "KEEP the second toVegaLiteSpec call" discipline at :623-625.
5. **Cost, measured:** 4–6ms per render steady-state across all five traits (first-ever call ~35ms one-time vega-lite warm-up; worst single render 15ms), so both renders add ~8–12ms — comfortably inside the 30s security-policy timeout. The review charter checks these numbers.

### 1c. m03 — Truth-in-reporting riders [S+S]

(a) **Cartesian never-cycle warning — code and placement grounded.** New warning code **OODS-V161**, registered in `packages/mcp-server/src/errors/registry.ts` (registry contiguous V100–V160; **V143 NOT reused** — its registered and emitted messages presuppose an agent-supplied range); message mirrors V146's count+threshold shape (`viz.render.ts:215-222`, threshold read from the applied palette, not hardcoded 6); placement: the cartesian try block after the :360 compile, reading the compiled `scale.range` exactly as F5's :370-371 does, merged at :431. Read-only on the spec; `contentHash`/`specRef` unmoved. RED-first: the §0 ten-series `viz.render` call must warn (HEAD: `warnings:[]`). No existing viz.render test breaks (the only exact-equality warnings pin, `viz.render.test.ts:177`, is on an unreachable error path).

(b) **Accuracy no-subject honesty — SCOPED NARROWLY, invariant precise.** Ground truth: `scale-rules.ts:22-23` defines `UNREADABLE_COMPILED_NOTE`; the honest `evaluated:false` returns are `scale-rules.ts:60` and `dual-axis-rule.ts:68`. `dual-axis-rule.ts:73-74` returns `evaluated:true` on zero-independent-scales — a genuine evaluation, **stays**. `aggregation-rule.ts:278-281` reports `evaluated:true` on zero-declared-aggregations — the no-subject case. **Invariant: `accuracy` stays `'pass'`; `conformant` and every pillar tri-state unmoved; only `rulesEvaluated` and `notes[]` may move, and only on zero-declared-aggregation specs.** Option A (rulesEvaluated 4→3 on aggregate-free specs) moves `accuracy-rules-s170.spec.ts:677` (toBe(4) over an aggregate-free barSpec), :684 (the 1 IS the zero-aggregation rule → 0), :788 (42-fixture corpus sweep pinning exactly 4) — a documented-semantics change (`index.ts:81-85` says the rule DID resolve its operand). Option B moves `notes[]` only and requires the `types.ts:29-35` doc-comment edit. The committed mcp-server pins are safe (all declare `aggregate:'sum'`). **The comment-only fallback disposition stands:** if at build time neither option is cleanly defensible, the disposition is a comment + memo note, not a code change.

### 1d. m04 — Forced block [M]

1. **Dashboard-demos message** (completes #1249): the exact fix SHA `4f64bcf` — c2682346 said "above 852be47" and **all four** of their pin sites read `852be47` (`VENDOR.md:7`, `FORGE-FEEDBACK.md:10`, `ENGINE-NOTES.md:7`, plus the code-level `ENGINE_PIN='852be47'` at `apps/dashboard-00-shell/src/data.ts:82` — the message names all four so their re-vendor updates the constant too) — **plus the throw warning**: the same commit makes the six numeric aggregates over a values-but-no-numeric-cells field **throw `KpiComputeError`** where they returned 0 (`kpi.ts:155`, exported on the viz-core dist they vendor — 0 occurrences in their vendored index.js vs 4 at HEAD); the catch seam lives only in un-vendored `dashboard.render.ts:493`; their bare callers are `forge.ts:95` and `scripts/verify-engine.ts:62`. Re-vendor without a catch = uncaught throw. The message says so with their own file:line.
2. **CHANGELOG s175 extension** (completes #1248): m03's `a11yNotApplicable` channel + m05's FD#1/OODS-V160 + the moved `dashboard.render.input.json` descriptions.
3. **Realpath entry-guard fold** into `tools/tokens-governance/index.ts:1417-1424` (completes #1250) with the symlinked-invocation control (decision #1506's carried edge — grounding confirmed the guard there still lacks the realpath comparison).
4. **CI trigger:** `ci.yml:9-10` push `branches: [ main ]` → add the working branches (measured 2026-08-24: PR #74 gated `4f64bcf`; the gap is only the no-open-PR window).
5. **CI coverage:** a job running the FULL mcp-server suite — 72 colocated `*.test.ts` under `src/`, ci.yml names 14, **58 files never run in CI**; runtime **~20s (measured 20.41s vitest duration at 4f64bcf, 2026-08-24; 208 files / 4315 tests, suite fully green at HEAD — which also de-risks the new job)**. The colocated-goldens step stays.
6. **C9 generator template** (completes #1235/#1251): the `any`s are literal helper signatures in `src/generators/templates/object-interface.ts`; fix and verify against **tracked** `generated/objects/*.d.ts`, not the dist-dependent test.
7. **Record hygiene** (completes #1252): the s175 memo's three corrections (10 new test files not 4; six non-s175 files in `4f64bcf`; "grep 0 repo-wide" scoped to shipped surfaces).
8. **PT brief two-claim correction** (completes #1242).
9. **Method rule recorded** (completes #1253): every mutation batch runs an unmutated baseline first, green with non-zero test count.

### 1e. m05 — Closeout [S]

The s175 §7 form: literal-invocation gate table at final HEAD (or the tree named, standing rule A), census against a correctly-labelled zero, declared movers enumerated per file — the spec-only baseline + spec, `certify-contrast.ts` + spec (whole-file), `artifact.certify.ts` + spec pins, `unchecked-tristate.spec.ts:98`, `artifact.certify.output.json`, `tool-descriptions.json` (before regen), `policy.json:227-228`, `generated.ts` + `docs/api` once, CHANGELOG, `ci.yml`, `errors/registry.ts` — non-movers by sha (the heatmap CASE-3 control, the line/point ≤6-series passes, the ECharts caveat constant, the s172 clause-(ii) set), the m01 RED-first + mutant pastes, R-d reconnect (rebuild, pm2 restart, /health, reconnect note covering m01+m02's advertised moves), ledger + CMOS closure, decisionCount ≥ 1 per mission, literal successCriteria on this mission itself. Not self-certified; Sprint-COMPLETE is Derek's.

## §2 Mission slate

| # | Mission | Size | Requires |
|---|---|---|---|
| m01 | Render-backed contrast (D9 rebase + D11 caveat-fork pin sequenced first) | **XL** | — |
| m02 | Render-backed determinism | M | m01 |
| m03 | Truth-in-reporting riders (V161 cartesian cycle warn; aggregation honesty) | S+S | — |
| m04 | Forced block | M | — |
| m05 | Closeout | S | all |

Serialization: m01 → m02 in one tree (both regen `generated.ts`/`docs/api`; regen once at m02, tool-descriptions edited before it). m03/m04 parallel-safe as amended (m03 touches `viz.render.ts`, `errors/registry.ts`, viz-core accuracy + tests; m04 touches no certify files). **Descope order: m03b → m03a → m02 — EXPECTED-live given m01 XL, not theoretical.** m01 and m04 are non-descopable — m01 is the sprint; m04 is forced.

## §3 Parks, with triggers

- **ECharts render-grading** (the eight ECharts-primary types stay `conformant:null`): trigger = a headless-ECharts feasibility spike, its own planning item. Under the D11 fork, the frozen ECharts caveat constant, `ECHARTS_CATEGORICAL_CAVEAT`'s now-stale "cardinality-sliced" phrase (:432-437), and the `evaluateEChartsCategoricalContrast` doc comment (:445-446) **intentionally retain the old wording until this rung, with a code comment saying so.**
- **House-in-order 2-of-3** (prose sweep, agent-facing docs, admin mission, Forge-Demos fixtures, standing-rules numbering #1224, dead-main #1225, C6 #1232, C8 #1234): pushed back per Derek 2026-08-24; queued as the next hygiene sprint candidate.
- **Dark-theme contrast, PT arc, and all prior parks:** unchanged.

## §4 Declines and dispositions (recorded)

1. Declaring the ECharts contrastNote reword as an enumerated s176 movement — declined in favour of the D11 fork: preserves the zero-movement line and the clause-(ii) byte freeze, and avoids ECharts movement with no ECharts mission to own it.
2. Splitting the D9 baseline rebase into its own mission — declined; m01 re-marked XL instead, keeping the rebase-first sequencing inside m01 where its provenance assertion lives.
3. m03b Option C (widening `AccuracyRuleOutcome` to a true tri-state) — declined as rider over-reach; Options A/B with the comment-only fallback cover the honesty goal.
4. A dedicated 'collision' verdict enum — declined; the role-A finding note carries the specifics.
5. Perceptual near-collision threshold work — declined; D3's no-new-threshold claim verified mathematically.
6. Hashing the render into `contentHash` — declined; breaks render↔certify hash identity (D7).
7. Grading every rendered fill without the palette-match fork — declined; author chrome would fail the CASE-2 fork and fake collisions (D2's rejected multiset reading).

## §5 Review charter (separate session, rule 10)

Re-run every §7 row at the review's own HEAD post-commit. Discrimination proofs in an isolated worktree, base verified (R-c), **unmutated baseline first** (the #1253 rule): the cap-to-distinct-paints mutant → the ten-series test reds; the m02 render-perturb mutant → `stable` reds; m03a's gate reverted → the ten-series viz.render warn test reds. Live re-POSTs on :4466: the §0 ten-series case must return `conformant:false` + `contrast:'fail'` with the ΔE00=0 note; the 6-series control must pass; the s175 poisoned-canvas, decorative trio, and sankey-operand cases re-POSTed for non-regression; the quantitative-heatmap CASE-3 control must still return `'exempt'`. Verify: the baseline rebase provenance assertion; the ECharts caveat constant byte-identical with its pin green; `renderHash` absent from every ECharts response; latency within the §1b.5 numbers; `generated.ts`/`docs/api` moved once with tool-descriptions edited before the regen; the reconnect note names both advertised moves; the Dashboard-demos message in the sent tab naming all four pin sites and the throw.

### §5a Risk register (the build session watches these)

1. **Chrome-extraction leakage, both directions:** treating `role-frame`/`role-scope` as chrome false-empties EVERY chart (reproduced); leaking axis/legend/text paints flips the decorative tri-state case from `'unchecked'` to graded and breaks the s139 lock — the tristate spec is the tripwire both ways.
2. **A partial caveat fork moves ECharts bytes mid-build** — `RENDERED_CONTRAST_CAVEAT` is appended at six-plus sites inside `gradeCategorical`, which the ECharts path shares; land the ECharts byte-identity pin with the D9 rebase, before any source edit.
3. **Fault-path and schema placement:** a render call outside the :641-648 try converts render faults to `status:'error'` (`contrast-fault` :68 reds, D6 violated); a `renderHash` that is required rather than optional, or that leaks onto the ECharts path, reds every `validateOutput` call and the rest-of-object control.

## §6 Critic dispositions

Grounding (5 lenses): 13 of ~60 claims REFUTED/AMENDED — all folded (the D2 rewrite, the caveat-fork discovery, the CASE-3 preservation, the declared-mover additions incl. `tool-descriptions.json`→docs/api generation order, the D9 retirement enumeration, the m03 anchor sweep, the measured latency/runtime figures, the fourth Dashboard-demos pin site). Critic panel (contract-integrity, feasibility-sizing, locks-and-forks): 11 blockers / 15 majors / 16 minors merged by the adjudicator into 16 folds — ALL applied above; verdict **ACCEPT**. Notable: the feasibility lens re-marked m01 XL and made the descope ladder expected-live; the locks lens verified D3's no-new-threshold claim mathematically and confirmed the decorative-poisoned byte-equality survives because the poison never reaches the render. Declines recorded in §4.

## §7 Closeout (m05, build-time, 2026-08-24)

**5/5 missions built. NOTHING descoped** — the expected-live descope ladder (m03b → m03a → m02) was never entered: m01's XL landed on the first implementation pass with all 26 rewritten engine tests green.

### Reference SHAs and the tree these rows measured

| what | sha |
| --- | --- |
| HEAD | `4f64bcf371d303833ed6dda10e9d76445c9480e2` (s175's final commit — s176's chartered base, exactly) |

⚠️ **Standing rule A applied; this row names the tree it actually measured.** Every gate below ran on the **WORKING TREE at HEAD `4f64bcf` plus s176's 35 modified tracked files and 4 new untracked test files** (plus this untracked memo) — *not* post-commit, because the commit boundary is Derek's. The review re-runs the table at the real final HEAD once the commit exists. `git status --porcelain` is therefore NOT empty at any row; the 35 + 4 files ARE the sprint.

### §7.1 Gate table — every row a literal invocation, run sequentially

| # | gate | literal invocation | result |
| --- | --- | --- | --- |
| 1 | lockfile | `pnpm install --frozen-lockfile` | exit 0 |
| 2 | root types | `pnpm run typecheck` | exit 0 |
| 3 | lint | `pnpm run lint` | exit 0 |
| 4 | tokens build | `pnpm run build:tokens` | exit 0 |
| 5 | viz-core build | `pnpm --filter @oods/viz-core run build` | exit 0 |
| 6 | viz-core suite | `pnpm --filter @oods/viz-core exec vitest run` | **65 files / 1377 tests**, exit 0 (s175: 65/1376 → **+1**, m03b) |
| 7 | viz-core re-export gate | `pnpm --filter @oods/viz-core run typecheck` | exit 0 |
| 8 | mcp-server suite | `pnpm --filter @oods/mcp-server exec vitest run` | **211 passed + 1 skipped (212 files) / 4334 passed + 16 skipped (4350)**, exit 0 (s175: 4331 total → **+19**) |
| 9 | root core | `pnpm exec vitest run --project core` | 462 passed + 1 skipped + **1 FAILED** (464 files) / 5185 passed + 16 skipped + 1 failed (5202); the single failure is the carried §7.4 red (s175: 5185 total → **+17**) |
| 10 | root a11y | `pnpm exec vitest run --project a11y` | exit 0 |
| 11 | root guardrails | `pnpm exec vitest run --project guardrails` | exit 0 |
| 12 | build:stories ratchet | `node scripts/quality/build-stories-ratchet.mjs` | "build:stories holds at the pin: 138 type errors.", exit 0 |
| 13 | generated.ts fresh | `pnpm --filter @oods/schemas-tools run generate:check` | exit 0 |
| 14 | docs/api fresh | `pnpm -w run docs:api -- --check` | "✔ docs/api is fresh (26 files checked, no orphans)." |
| 15 | Generator B fresh | `pnpm run generate:schema-types -- --check` | "• index.ts — unchanged", exit 0 |
| 16 | viz-render suite | `pnpm --filter @oods/viz-render test` | 1 file / 11 tests, exit 0 |
| 17 | mcp-bridge suite | `pnpm --filter @oods/mcp-bridge test` | 1 file / 5 tests, exit 0 |
| 18 | enum + token + tenancy | `pnpm run lint:enum-convergence` · `pnpm run lint:enum-to-token` · `pnpm run tokens:collision-guard` · `pnpm tenancy:check` | all exit 0 |
| 19 | scale determinism | `pnpm --filter @oods/mcp-server run test:scale` | 4 files / 62 tests, exit 0 |
| 20 | contracts + viz | `pnpm vitest run tests/contracts tests/viz` | exit 1 with **exactly** the one carried failure (1 failed / 45 passed files; 1 failed / 389 passed tests — s175: 44/387; the +1 file / +2 tests are m04's entry-guard control) |
| 21 | re-hash | `shasum -a 256` over the five token-dist files + the s172 fixture + `storybook-static/index.json` | five token artifacts **match s175 §7.2 exactly** (`tailwind/tokens.json 6fe6ae4e…`, `ts/tokens.ts 843640f9…`, `css/tokens.css 8e4070e7…`, `compose/OodsTokens.kt 73e3dc97…`, `ios-swift/OodsTokens.swift 4e0acf71…`); the s172 fixture **moved as DECLARED** (D9 rebase): `eaf7b4e9… → 7149b7ad…`; `storybook-static/index.json` unchanged `19e6c52f…`, 454 entries |
| 22 | snapshot census | `find … -name '*.snap' \| wc -l` + the `exports[` count | **14 files / 61 entries**, `git status --porcelain -- '*.snap'` EMPTY |
| 23 | ci.yml job coverage | the jobs-list one-liner | **13 jobs, unchanged** (m04 added a STEP — the full mcp-server suite — inside the existing viz-determinism-adjacent job, and widened the push trigger; no job added or removed) |
| 24 | decisionCount per mission | `sqlite3 cmos/db/cmos.sqlite "SELECT mission_id, COUNT(*) FROM strategic_decisions …"` | s176-m01 **5** · m02 **2** · m03 **2** · m04 **2** — all ≥ 1 (m05's land with this record) |
| 25 | served path (R-d) | mcp-server + mcp-bridge build → `pm2 restart oods-forge-bridge` → `curl :4466/health` | `{"status":"ok","bridge":"ready","toolset":{"mode":"default","enabledCount":19,"registrySource":"dist/tools/registry.json"}}` |
| 26 | live §0 case | `POST :4466/run` viz.render (10-series bar) → its `normalizedSpec` → `POST` artifact.certify | viz.render `warnings: ['OODS-V161']` (4f64bcf, measured: `[]`) · certify `conformant:false`, `contrast:'fail'`, contrastNote `"Role-A fail: min-pairwise CIEDE2000 (min over normal + deuteran/protan/tritan CVD) = 0.00 < 2 — …"`, `renderHash` present (4f64bcf, measured: conformant:true, all pillars pass, findings:[]) |
| 27 | live 6-series control | same pair with 6 series | viz.render `warnings: []` · certify `conformant:true`, pillars all `'pass'` |

**The two non-zero exits are the SAME single pre-existing failure** (rows 9 and 20), named in §7.4.

### §7.2 Declared movement, reconciled per file

**MOVERS (35 modified + 4 new), every one chartered:** m01/m02 (§1a.12, §1b) — `certify-contrast.ts` (caveat fork, slice deleted, classification + extraction + assignment, async render) · `artifact.certify.ts` (await in the :641-648 try, render proof, comment retirements) · `artifact.certify.output.json` (render-backed contrast prose path-scoped, optional `renderHash` in the closed determinism object, "per-pillar tri-state summary" retired) · `test/tools/certify-contrast.spec.ts` (whole-file rewrite: async 2-arg helper, real rows, +4 s176 tests) · `artifact.certify.spec.ts` (:157 reword only) · `artifact.certify.unchecked-tristate.spec.ts` (:98 reword only — the ONLY tristate movement) · `artifact.certify.spec-only-bytes.spec.ts` (D9 rebase + the clause-(i) rewrite: declared-mover form, m01 caveat reword + m02 renderHash addition declared) · `__fixtures__/s172-certify-spec-only-baseline.json` (fresh 4f64bcf capture — diff vs e5bf2f6 fixture = EXACTLY the 11 s173–s175 declared strings, cartesian byte-identical, re-proving the prior control) · `s172-spec-only-capture.mts` (header retarget) · `tool-descriptions.json` (edited BEFORE the regen) · `policy.json` (:227-228 entry) · `generated.ts` + `docs/api/{README,artifact-certify}.md` (regenerated once for m01+m02 combined) · NEW `artifact.certify.ten-series-collision.spec.ts`, `certify-contrast.echarts-caveat-pin.spec.ts`, `artifact.certify.render-determinism.spec.ts`. m03 (§1c) — `viz.render.ts` + `errors/registry.ts` (V161) · `viz.render.test.ts` (+4) · `aggregation-rule.ts` + `types.ts` + `accuracy-rules-s170.spec.ts` (Option B: :678/:685 the complete committed-pin movement). m04 (§1d) — `CHANGELOG.md` (s175 extension + the s176 entry with the reconnect note) · `ci.yml` (push branches + full-suite step) · `tools/tokens-governance/index.ts` (realpath fold) + NEW `tests/contracts/tokens-governance-entry-guard.spec.ts` · `src/generators/templates/object-interface.ts` (3 any→unknown) + the 8 tracked `generated/objects/*.d.ts` (regen; carries a DECLARED stale-generation catch-up — the committed files predated trait additions) + `examples/objects/product-with-categories.ts` (3 newly-required fields) · `forge-s175-correctives-decision-memo.md` (§9 dated corrections) · `forge-pt-client-brief-2026-08.md` (two dated corrections in place). **Nothing moved that is not on this list.**

**NON-MOVERS, verified:** the five token-dist artifacts by sha (row 21) · `storybook-static/index.json` by sha · 14/61 snapshots, zero movement · the ECharts caveat constants byte-identical (the D11 unit pin green through the whole build + clause-(ii) handler-level byte-identity with ZERO declared ECharts movement) · the CASE-3 exempt pins (`artifact.certify.spec.ts` :191/:419/:445 untouched; the engine-spec exempt block asserts the same 'exempt' + byte-frozen `EXEMPT_NOTE`) · the line/point ≤6-series passes (all five baseline traits still `contrast:'pass'`) · the s175 tri-state invariants (decorative trio byte-equality, poisoned-canvas 'ungradeable'/false) · `contentHash` on every path (D7 tests + tristate expectedHash pins + the render-determinism inequality test).

**CENSUS against a correctly-labelled zero.** s175 finals: mcp-server **4331** total (4315 + 16), core **5185** total (5168 + 16 + 1 failed), viz-core **1376**. s176 finals: mcp-server **4350** (+19), core **5202** (+17), viz-core **1377** (+1). Reconciles exactly: m01 adds 10 (4 ten-series + 2 caveat-pin + 4 engine-rewrite) and m02 adds 5, all in `packages/mcp-server/test/**` which BOTH runs glob (+15 each); m03a adds 4 in `src/tools/viz.render.test.ts`, mcp-server run only (+4 → 19 ✓); m04 adds 2 in root `tests/contracts/`, core only (+2 → 17 ✓); m03b adds 1 in viz-core (+1 ✓).

### §7.3 RED-first + mutant record (each against a green non-zero baseline first, the #1253 rule)

- **m01 RED-first:** the committed ten-series spec observed RED at HEAD — `expected 'pass' to be 'fail'` on `pillars.contrast` (conformant:true reproduced by the suite itself); GREEN after the implementation, first pass.
- **m01 mutant** (cap the graded assignment to its distinct paints — the dead slice re-expressed): EXACTLY the two ten-series collision tests red (handler + engine level), 28 others green; reverted green.
- **m02 mutant** (perturb one render: `sha256(svg2 + ' ')`): `stable` reds and consequently `conformant` — 4 reds across the rendered-graded specs; reverted green.
- **m03a RED-first:** the ten-series viz.render test asserted one OODS-V161 and FAILED pre-edit (`warnings:[]`); green after. **Gate-revert mutant** (`&& false`): exactly that test red (1/113); restored green.
- **m04 control mutant** (entry guard back to lexical compare): exactly the symlinked-invocation leg red; restored green.

### §7.4 Pre-existing red, carried NOT fixed

`tests/contracts/public-api.contract.test.ts > do not expose explicit any types` — the single failure in rows 9 and 20, pre-existing, GREEN in CI (dist/ gitignored). Per #1251 the C9 fix targeted the TEMPLATE + the tracked `generated/objects/*.d.ts` (grep `': any'` over them: **0**, was 6); the local red sits on a stale `dist/pkg/index.d.ts` that the next `pkg:build` regenerates.

### §7.5 R-d reconnect

mcp-server + mcp-bridge rebuilt; `pm2 restart oods-forge-bridge`; `/health` pasted in row 25. **Reconnect note (CHANGELOG Sprint-176 entry, verbatim intent):** the advertised `artifact.certify` surface moved twice over — the contrast description is render-backed and path-scoped (5 cartesian render-measured / 8 ECharts reconstruction-graded), and the determinism object gained the OPTIONAL `renderHash` — so connect-time-cached schemas/descriptions are stale until reconnect; execution is fresh per call.

### §7.6 Stated omissions

**build-storybook, the VRT pair, and the a11y contract were NOT run.** Verified rather than asserted: the full s176 change set (the 35 + 4 files above) contains zero `.stories.`, `.storybook/` or `.css` files (grep over `git status --porcelain`: 0). `storybook-static/index.json` unchanged by sha — as previously built, not freshly reproduced. The review runs the pair at the real final HEAD. **Also not run post-commit: the whole table** — the commit does not exist yet.

### §7.7 Not self-certified

Per rule 10 the review is a separate session; §5 is its charter (worktree discrimination proofs with unmutated baselines first, the live re-POSTs including the quantitative CASE-3 exempt control and the s175 tri-state cases, latency vs §1b.5 — build-time measured: render alone median 7.7ms steady on the ten-series compiled spec, first call 51.9ms; whole handler median 31.3ms / p95 54.4ms over 20 runs). **Sprint-COMPLETE and the commit boundary are Derek's** — this closeout records the tree and stops.
