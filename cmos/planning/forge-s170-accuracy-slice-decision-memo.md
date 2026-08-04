# Sprint-170 decision memo — the #818 accuracy slice + PT client brief + s169 hygiene

**Version: v2 — LOCKED SSOT for the s170 build.** Planning session PS-2026-08-03-006. Grounding: wf_0306438e-37d (5 agents). Critic: wf_84d1df17-fdd (5 lenses) — **v1 REJECTED on 2 of 5 lenses (movement, process): 2 blockers, 9 majors, ~12 minors; v2 disposes of every one in §6B.** Two lens disagreements were re-measured in the main loop per rule 19: the repo-wide snapshot census is **14 .snap files / 61 entries** (one lens said 8/36, another 15/61 — both off), and **artifact.certify IS served on the :4466 bridge** (proven by a live call returning a handler-level OODS-V126, not a tool-not-allowed error — the grounding had read only the in-code FALLBACK policy; the live allowlist is configs/agent/policy.json).

Direction ratified by Derek 2026-08-03: spine = #818 accuracy slice; riders = PT client brief + s169 hygiene basket; **declined** = #781, #1129. Build in a FRESH session from this memo ONLY (rule 9). Review is a SEPARATE session (rule 10). Baselines at HEAD `d0b66fd` (clean, s169 GENUINE 6/6): viz-core **1205/61** · root core **4776+20/438** · guardrails **15/4** · mcp-server **4011+16/196** · scale **62** · coverage **4806+20/449** · browser proof **246**.

**Descope order, declared up front:** if the slate overruns, m03 descopes first, then m04 (both Derek's call at build time). m01 + m02 ARE the sprint.

---

## §1 What this sprint is

Open the EMPTY fourth pillar of #977. `artifact.certify` gains an **accuracy** pillar of exactly FOUR deterministic, reader-only structural rules — **non-zero bar baseline · dual-axis · area-encodes-linear · aggregation-hiding** — scope ratified verbatim and unchanged from #818/#1071 (2026-07-04) through #1112 to the s170 ratification. No scorer, no corpus, no ML, no render step.

**The #110 boundary (recovered by grounding; the numbered record was condensed away, the operative clauses survive in ~38 citing decisions):**
1. **No scorer/recommender-term change.** The sprint-110 suggest-chart scorer goldens stay byte-identical; the intent path stays mode `suggest`.
2. **certify is a PURE READER of the handed NormalizedVizSpec IR.** Never rebuilds, never re-renders, never reads emitted bytes. The rules read the IR + the compiled Vega-Lite spec certify already produces on the certified path — nothing else. (Reading the IR directly for a predicate is explicitly permitted by this clause.)
3. **Never edit certify to make something pass.** Honest-fail is a feature.

The full accuracy pillar would need the "#110-scorer-lift governance decision + a benchmark corpus that does not exist" (#1068). This slice needs neither.

## §2 Grounded facts (G1–G12, as amended by the critic)

- **G1 — the pillar structure exists and is CLOSED.** `pillars:{a11yEquivalence,determinism,contrast}` (artifact.certify.ts:60-64); `additionalProperties:false` at top level (output schema :82) AND pillars (:65), `required` pins all three keys (:47); per-pillar enums, so a 3-state accuracy key is expressible without touching contrast's 4-state enum. The server AJV-validates every result at runtime (index.ts:279-286) — **an accuracy field without the same-commit schema edit bricks every certify call.** The finding shape is ALSO closed: `$defs/finding` = `{code, severity:'error'|'warn', message}`, additionalProperties:false.
- **G2 — every rule is NON-VACUOUS, probe-proven.** Each defect is expressible in a schema-valid IR, survives compilation, and certifies `conformant:true` at HEAD. R1: `mark.options.baseline:'min'` → `scale.zero:false` on MarkBar; `scale:'log'` compiles through. R2: LayoutLayer + `sharedScales.y:'independent'` → compiled top-level `resolve:{scale:{y:'independent'}}` — the IR spelling is unique, but the COMPILED spelling is NOT: LayoutFacet and LayoutConcat emit the byte-identical top-level resolve node (verified on sparkline-grid + focus-context-line), distinguishable only by sibling keys. R3: area + `scale:'log'` compiles through (and `baseline:'min'` applies to areas too). R4: both IR spellings pass raw.
- **G3 — reachability split.** The production builder can produce R3 (log-scale bars/areas pass viz.render's input schema) and R4 (**a caller description override ERASES the synthesized "sum of" disclosure — live generation-path leak; the compiled axis title stays the bare field name**). `baseline:'min'` and dual-axis enter only as hand-authored IR — exactly certify's contract (arbitrary-IR reader, artifact.certify.ts:35-38).
- **G4 — the rules live in viz-core; the reuse needs ONE declared export edit.** The aggregation machinery is real and ALL PURE, but of the four named functions only `drawnCellKeyFields`:427 is exported — `keyFor`:493, `reduceAggregate`:859, `projectAggregatedRows`:947 are module-private (keyFor's own comment: "MODULE-LOCAL (the a11y barrel is `export *`)"). m01 therefore includes a **declared minimal export addition in data-analysis.ts** (declared in §7). Grep-verified consequence check at build: the drawn-value-guard absence tests (drawn-value-guard.spec.ts:167-176) pin only the guard trio's absence from the @oods/viz-core PACKAGE barrel and stay green; the a11y sub-barrel is `export *`, so the build must verify no surface-pinning test asserts these three names' absence before choosing direct `export` over an internal re-export module. **Do NOT extend `equivalence-rules.ts` RULES** — it drives viz.render's certify-at-emission blocking gate; extending it would red Forge's own generation on legitimate log-scale charts.
- **G5 — 'unchecked' semantics + the known rollup hole.** Rollup (:307): `a11yConformant && contrast !== 'fail' && stable`; `contrast:'unchecked'` silently passes (#781, self-documented at errors/registry.ts:178). Derek declined fixing it. Accuracy **mirrors contrast** (`fail` pulls conformant false; `unchecked` passes) — parity, stated plainly: #781 now spans two pillars, backlog. The new pillar does NOT inherit the missing examined-count: `rulesEvaluated` ships day one (decision #1412).
- **G6 — every RED fixture is synthetic; the corpus supplies guards.** 469 committed .json, 42 with marks, zero trip any rule. **5 of the 42 are schema-invalid at HEAD** and can never produce the compiled operand: `before-after/accessibility-tighten/{before,after}.spec.json`, `before-after/facet-small-multiples/after.spec.json`, `before-after/renderer-density-upgrade/{before,after}.spec.json` — named so the build does NOT "fix" them (fixture edits are outside §7). False-positive guards that must stay green, by name: the 3 y2 range-band fixtures (target-band-line ×2, facet-target-band) · sparkline-grid (LayoutFacet independent-y) · focus-context-line (LayoutConcat independent-y) · facet-small-multiples/after (sharedScales.**color**:'independent' — non-positional, and also one of the 5 invalid, so it exercises the fail-safe branch) · the diverging bars (they carry `mark.options.baseline:0`, which compiles ZERO-ANCHORED — that is why they are green, not "zero inside the domain") · all 13 committed aggregate bindings (every one identity — 1 row per full group key).
- **G7 — facet/layout changes each rule's operand.** Facet-/concat-scope independent-y is LEGITIMATE; only LAYER-scope independence is dual-axis. R4's group key includes facet fields (facet-layout.spec.json: 2 groups of 4 blind vs 8 of 1 full-key).
- **G8 — R4's predicate is collapse + non-disclosure, never keyword-only.** 6–7 committed files would false-red under a title-keyword predicate (count depends on surface set); ZERO under the collapse predicate (all 13 bindings identity — executed). Fires iff the aggregation actually COLLAPSES rows AND no declared text surface discloses it.
- **G9 — spec-level operands suffice AND are required.** Rule-16 scoping: shipped claims are phrased as **compiled-spec structural properties**; #110 forbids rendering. Render-level witnesses appear only in the fixture harness where spec→render divergence is possible.
- **G10 — zero golden movement is achievable.** Repo-wide census (main-loop measured): **14 .snap / 61 entries**; the mcp-server subset is 4/19; none contain certify/pillars/conformant. `contentHash` hashes the untouched compiled IR — the evaluator must not mutate operands, pinned by a hash-identity test. Verified by the critic: **no existing inline test spec flips under the new rollup** (builder-synthesized descriptions always disclose the aggregate op — spec-builder.ts:886).
- **G11 — the CI colocation trap.** New certify tests go in `packages/mcp-server/test/tools/` (the existing artifact.certify.spec.ts home, in both the mcp suite and root core) — never colocated under src/tools/.
- **G12 (CORRECTED) — certify IS served on the :4466 bridge.** Proven by a live call (handler-level OODS-V126 back through POST /run). The live allowlist is `configs/agent/policy.json` — whose certify description ALSO advertises the three-pillar rollup and is therefore a MOVER (§7). m05's rebuild + pm2 restart covers m02 as well as m04.1, and the live verify includes a certify probe over :4466 expecting the accuracy pillar. The aquex adapter is the second path; its ADVERTISED schema is connect-cached (execution fresh per call) — verify execution output, don't wait on the advertisement.

## §3 Mission charters

### m01 [L] — the four accuracy rules, in viz-core, proven RED-first

1. New module `packages/viz-core/src/accuracy/` exporting via the package barrel ONLY: `ACCURACY_RULES` (4 rules: id, registered code, summary) and `evaluateAccuracyRules(spec, compiled)` → `{ findings: [{ruleId, code, message}], rulesEvaluated: 4 }`. Pure; mutates nothing. Internals import the aggregation machinery by relative path, enabled by the **declared data-analysis.ts export addition** (G4): export `keyFor`, `reduceAggregate`, `projectAggregatedRows` — after grep-verifying no surface-pinning test asserts their absence (if one does, use an internal re-export module instead; either way the movement is declared). The guard trio's off-barrel status and its asserting tests stay byte-untouched.
2. **R1 non-zero-bar-baseline:** fires when a MarkBar's measure-axis compiled scale is **not a linear zero-anchored scale** — `zero:false` OR `type ∈ {log, sqrt}` — with **per-cause message text**: log = no zero exists on a log scale; sqrt = zero-anchored but bar length is not proportional to value; zero:false = the baseline was moved. (Vega-Lite zero-defaults sqrt to TRUE — a sqrt bar is zero-anchored, and the finding must say what is actually wrong, never "non-zero baseline" for sqrt.) Diverging bars with `baseline:0` compile zero-anchored and stay green.
3. **R2 dual-axis:** fires on independent POSITIONAL scale resolution at LAYER scope only. Layer scope means: the resolve node whose sibling key is `layer` — facet emits the byte-identical node beside `facet`/`spec`, concat beside `vconcat`/`hconcat`/`concat` (G2). Equivalently the evaluator MAY read the IR (`layout.trait==='LayoutLayer' && sharedScales.x|y === 'independent'`) — permitted by #110 clause 2. `sharedScales.color:'independent'` is NON-positional and never fires (guard: facet-small-multiples/after).
4. **R3 area-encodes-linear:** the R1 predicate applied to MarkArea, **excluding y2-ranged areas** (a band encodes edge positions, not area-from-zero; the 3 committed band fixtures are the guards). The exclusion is stated in the rule summary.
5. **R4 aggregation-hiding:** fires iff a declared aggregation (either IR spelling) actually collapses rows (group-by full key INCLUDING facet fields; any group n>1 over the datasets carried in the IR) AND none of the declared text surfaces — a11y description, chart title, the aggregated channel's compiled axis title — discloses the operation. The disclosure table is a **typed exhaustive record over the IR's own aggregate enum** (`Record<NonNullable<TraitBinding['aggregate']>, readonly string[]>`) so a missing op is a TYPECHECK failure — surface-derived, never corpus-derived (rule 7b). Declared aliasing: `mean` is disclosed by "average" (and vice versa). A transform-spelled op OUTSIDE the binding enum: fail-safe SILENT + a note in the pillar output — positive-precondition (we cannot positively detect non-disclosure of an op we hold no vocabulary for). Identity aggregation → silent. Data by url/reference (schema-valid, rows absent): collapse half unevaluable → silent (see §4 ceiling).
6. **Fixtures:** per rule one RED + one minimal GREEN twin, twin shapes declared: R1 twin = same bar, linear zero-anchored · R2 twin = same layers, `sharedScales` shared · R3 twin = same area, linear zero-anchored (and a y2-band twin stays green by the exclusion) · R4 twin = same spec with the disclosure present in the description. R3+R4 REDs produced by the PRODUCTION builder (buildVizSpecFromRows); R1+R2 REDs hand-authored schema-valid IR. All REDs pass `assertNormalizedVizSpec` (a schema-invalid RED proves nothing).
7. **Controls:** (a) corpus sweep — all 42 mark-bearing committed fixtures evaluate to ZERO findings, count asserted at 42; the 5 schema-invalid fixtures (G6, named) take the unresolvable-input branch (compiled absent → zero findings by fail-safe) and still count toward 42; sweep liveness comes from the per-rule REDs, not the sweep itself; (b) mutation gate per rule in the same change — gutting rule *i* reds exactly its own RED test; (c) discriminating checks: the R2 guards (sparkline-grid, focus-context-line) red a scope-blind mutant, the R4 facet fixture pair (2×4 vs 8×1) reds a facet-blind mutant.
8. Facet/layer axis: every rule exercised under a faceted and a layered variant.
9. Movement: viz-core grows one module + tests + the data-analysis export edit; declared at build. `equivalence-rules.ts`, narrative code, both adapters: **byte-untouched**.

### m02 [M] — certify wiring: the atomic EIGHT-file movement

1. `pillars` gains `accuracy` (required, `pass|fail|unchecked` — per-pillar enum, contrast's untouched). Certified path always evaluates, wrapped like contrast's :288-296 (throw → `unchecked` + note); uncertified path → `unchecked`.
2. Output gains `accuracySummary: { rulesEvaluated, failing }`. Rule findings map into the EXISTING closed `$defs/finding` shape — `{code, severity:'error', message}` (severity 'error' for all four; ruleId is conveyed by the registered code) — appended to top-level `findings[]`. The output-schema and handler descriptions that currently assert findings[] is a11y-equivalence-only are truth-updated in the same commit (they live inside movers already in the set).
3. Rollup: `a11yConformant && contrast !== 'fail' && accuracy !== 'fail' && stable` — contrast-parity (G5), #781-spans-two-pillars noted in the handler comment and here.
4. **The EIGHT movers land in ONE commit:** output schema · handler (CertifyPillars, output interface, all three pillar-construction sites :159/:196/:315-319, rollup :307, the stale comments) · **errors/registry.ts** (4 new registered codes, one per rule) · test/tools/artifact.certify.spec.ts (the 3 exact pillar toEquals :154/:219/:647 + new accuracy-path tests) · schemas/generated.ts (regenerated) · docs/api via `pnpm -w run docs:api` · packages/mcp-adapter/tool-descriptions.json (advertises the pillar list → four) · **configs/agent/policy.json** (its certify description advertises the three-pillar rollup — the live bridge allowlist file, G12).
5. End-to-end tests (test/tools/, G11): each rule's RED IR through the real handler → `pillars.accuracy:'fail'` + the registered code in findings + `conformant:false` **+ validateOutput green on the fail path** (the closed finding schema must admit the new findings); clean spec → `pass` + `rulesEvaluated:4`; uncertified path → `unchecked`; hash-identity pin (contentHash byte-identical before/after evaluation).
6. Live verify: one certify call over the **:4466 bridge** (G12) after m05's rebuild+restart, expecting `pillars.accuracy`; one execution through the aquex adapter (advertised-schema lag noted, execution fresh); direct dist harness for the RED path.

### m03 [S] — PT client brief + findings-note truth-up

1. `cmos/planning/forge-pt-client-brief-2026-08.md` — ONE document for Derek's PT conversation: Q1–Q9 each with current state and what its answer unblocks; the changed blocker (PT ships light-only; the Figma carries foreign token leaves incl. Apple UI-kit — **the 56/17 figures are agent-reported from s168 grounding and the brief must mark their provenance or re-derive them from the committed extraction**); the 13 first-wins collisions itemized from `artifacts/tokens/partstown/partstown.coverage.json` (the s166-m04 coverage artifact — full path stated, rule 9); the asks (fresh Figma export — committed extraction is 2026-07-27; the upstream library behind the 4 unresolved Chrome-Gradient-family tokens; Figma tier confirmation). **Done-bar: the document exists, every number evidence-cited or provenance-marked, and Derek reviews it BEFORE any client use. No client contact from the build session.**
2. Dated correction block in `cmos/planning/forge-s166-m03-mobile-token-platforms-findings.md` (strikethrough where the original text exists; plain addition where it does not — the critic found one target phrase absent from the note): 381 raw oklch not 259 (#1148) · the Swift-compilability figure **re-derived at build with its counting method stated** — the prior "32/771" is disputed (critic could not reproduce it; candidate honest forms: lines that parse · values correct · values compiling-but-×16-wrong) — the correction block must say what it counted (#1127).

### m04 [S] — s169 hygiene basket

1. `toGradableHex` (packages/mcp-server/src/tools/dashboard.render.html.ts:117): `rgba()` with alpha ≠ 1 → null (skipped, never graded-as-opaque). Unit test with a translucent palette; `gradedPairs` stays 4 on both brands (all six pair tokens measured opaque) — no golden movement. **Source movement declared in §7.**
2. Scratchpad: add `scratchpad/` to .gitignore + `git rm -r --cached scratchpad/`, **excluding any file a committed test/doc cites as provenance** (grep tracked files for `scratchpad/` references at build; the critic found three such citations — those stay tracked, the rest of the 214 drop from the index; files stay on disk).
3. s169 memo dated corrections (originals visible): diagnostics.json reads runs 7 / cumulative 354 (354 = 3×118 proves the four-blind-runs claim); brand B's governance count 41→41 UNCHANGED at committed HEAD — only brand A grew 77→78.
4. LICENSE files (MIT, matching package.json) for @oods/viz-core and @oods/viz-render.
5. FF#22 order fixture made discriminating (#1126): order `['actual','target','baseline']` over declaration `[baseline,actual,target]` — first-entry-only yields `['actual','baseline','target']`; assert the divergence. (Current fixture verified still degenerate this session.)
6. #951: remove the tautological `expect(DIMS3).toHaveLength(3)` + dead constant (packages/viz-core/test/spec-builder.spec.ts:1041/:1060).

### m05 [S] — closeout

- Full §6 gate table, sequential, by **literal invocation, env vars included**.
- Line-item charter-diff for EVERY mission; named artifacts machine-verified.
- Per-golden review: predicted **ZERO .snap movement repo-wide** (14 files / 61 entries baseline). Declared non-snap movements per §7; anything else stops the line and amends this memo in the same change.
- Consumer loop-closure: `info_push` to cmos://derek/forge-demos — certify's accuracy pillar (additive; absent-input behaviour unchanged; `unchecked` on the ECharts path). Sent AFTER m02 is built.
- Rebuild + `pm2 restart oods-forge-bridge` (covers m02 AND m04.1 — both ship bridge-served surfaces, G12) + live re-verify: certify accuracy pillar over :4466 · `gradedPairs: 4` · a translucent-token probe. Mine, never Derek's.
- NOT self-certified. Review in a separate session.

**DAG:** m01 → m02 → m05; m03, m04 independent roots → m05.

## §4 Claim ceiling

- "artifact.certify evaluates an accuracy pillar of exactly four declared structural rules over the compiled spec + IR" — the enumerated list, never "output is accurate."
- `accuracy:'pass'` means: **none of the four declared distortions was POSITIVELY detected**, with `rulesEvaluated` reporting how many rules ran. Stated limits: R4's collapse half is unevaluable on url/reference-only data (schema-valid without rows) — such specs pass by fail-safe silence, and the pillar note says so; R4's disclosure half is lexical over declared text surfaces.
- Scope: the certified (Vega-Lite-modeled) path; the uncertified path reports `unchecked`.
- The rollup inherits contrast's `unchecked`-passes shape by deliberate parity; #781 spans two pillars, backlog.
- No render-level claims (#110). Compiled-spec properties are claimed as compiled-spec properties (G9).

## §5 Standing rules applied

1 (#1228) positive-precondition → rules fire only on positive detection; unresolvable input = silence (incl. the 5 invalid corpus fixtures and url-data R4). 2 claims-from-coverage → §4 names only exercised axes. 3 facet axis → m01.8 + G7 operand changes. 7b surface-not-corpus → R4's typed-record table over the IR enum. 13a → per-rule mutation gates + the two discriminating-mutant checks. 16 → G9 scoping. 17 → §6 literal invocations (the s169 lesson: `BRAND_CASCADE_PROOF_SELFTEST=1`, not shorthand). Guard-ships-its-bite-proof → same-change gates. Shared-function-not-transcription → the declared export edit, never re-typing. Charter-diff every mission → m05. Rules 9/10 → fresh build session; separate review.

## §6 Gate table (sequential, literal invocations)

| # | gate | invocation | expected |
|---|---|---|---|
| 1 | install | `pnpm install --frozen-lockfile` | clean |
| 2 | build | `pnpm run build:packages` | pass |
| 3 | viz-core | `pnpm --filter @oods/viz-core exec vitest run` | 1205/61 + m01/m04.6 movement, exact reconcile |
| 4 | root core | `npx vitest run --project core` | 4776+20/438 + additions, exact reconcile |
| 5 | guardrails | `npx vitest run --project guardrails` | 15/4 unchanged |
| 6 | mcp-server | `pnpm --filter @oods/mcp-server run test` | 4011+16/196 + m02/m04.1 additions, exact reconcile |
| 7 | scale | `pnpm --filter @oods/mcp-server run test:scale` | 62 exact |
| 8 | tokens composite | `pnpm run tokens-validate` | pass, 32 viz checks |
| 9 | collision guard | `pnpm run tokens:collision-guard` | 0 non-exempt / 6 scopes |
| 10 | token build | `pnpm run check:tokens` | up-to-date |
| 11 | lints | `pnpm run lint:tokens` · `pnpm run lint` · `pnpm run lint:enum-convergence` · `pnpm run lint:enum-to-token` · `pnpm run lint:audit-log` · `pnpm run lint:brand-bleed` | all six pass |
| 12 | root typecheck | `pnpm run typecheck` | pass |
| 13 | viz-core typecheck | `pnpm --filter @oods/viz-core run typecheck` | pass |
| 14 | docs | `pnpm -w run docs:api -- --check` | fresh incl. regenerated artifact-certify.md |
| 15 | schemas-tools | `pnpm --filter @oods/schemas-tools run generate:check` | pass |
| 16 | schema types | `pnpm run generate:schema-types -- --check` | unchanged after m02's regeneration |
| 17 | browser proof | `pnpm run verify:brand-cascade` then `BRAND_CASCADE_PROOF_SELFTEST=1 pnpm run verify:brand-cascade` | 246 exit 0; self-test exit 1 |
| 18 | governance | `pnpm run tokens:governance -- diff --brand A --base $(git merge-base HEAD OODS-pro) --head $(git rev-parse HEAD) --labels token-change:breaking` and the same with `--brand B` | s170 touches no token source: A high=78 / B high=41 unchanged; exit 0 with label |
| 19 | ci golden list | the exact ci.yml:659 invocation (13 named files) | 287 + m04.1 additions, exact reconcile |
| 20 | coverage | `pnpm run test:coverage` | passes; RED-first proofs run by name |
| 21 | a11y diff | `pnpm run a11y:diff` | no new violations |
| 22 | remaining CI legs | `pnpm --filter @oods/viz-render test` · `pnpm --filter @oods/mcp-bridge test` · `pnpm run tenancy:check` · `node scripts/validate-diagnostics-schema.mjs` · `node scripts/state-assessment.mjs --guardrails --tokens` (exit 0; verdict may be RED on pre-existing token history) · `pnpm run build` · `pnpm run build-storybook` | all pass |

## §7 Declared movements & the zero-golden prediction

**ZERO .snap movement predicted, repo-wide (14 files / 61 entries).** Declared non-snap movements, exhaustively:
- **m01:** packages/viz-core/src/accuracy/ (new) + its tests + synthetic fixtures + the **data-analysis.ts export edit** (or internal re-export module).
- **m02, atomic:** artifact.certify.output.json · artifact.certify.ts · **errors/registry.ts** · test/tools/artifact.certify.spec.ts · schemas/generated.ts · docs/api (artifact-certify.md + README) · mcp-adapter/tool-descriptions.json · **configs/agent/policy.json**.
- **m03:** the PT brief (new) · the s166-m03 findings-note correction block.
- **m04:** **dashboard.render.html.ts** + its test · .gitignore + the scratchpad index removals (214 minus provenance-cited exclusions) · two LICENSE files · the s169 memo correction block · layout-layer-order-id-keying-s166.spec.ts · spec-builder.spec.ts.
- **m05:** the memo's own §6B/§8 amendments if deviations occur.

Anything else stops the line and amends this memo in the same change.

## §7B Build deviations — m01 (amended at build, 2026-08-03)

Four deviations from the m01 charter, each declared here in the same change that made it. Movement stayed inside §7: `packages/viz-core/src/accuracy/` (5 new files) + `packages/viz-core/test/accuracy-rules-s170.spec.ts` + the data-analysis.ts export edit + one barrel line in `packages/viz-core/src/index.ts`. `equivalence-rules.ts`, the narrative code, both adapters and the a11y allow-list barrel are byte-untouched, verified per-file.

1. **ONE export, not three.** The charter declared exporting `keyFor`, `reduceAggregate` and `projectAggregatedRows` from data-analysis.ts. Only `keyFor` is exported. R4's predicate is group CARDINALITY (does any group under the full key hold more than one row) — it needs the shared key BUILDER, but no reduction and no projection, so the other two have no consumer and exporting them would widen the module surface for nothing (rule 2). The reuse the charter was protecting is intact and is the one that matters: re-typing the NUL join is the s159 defect, and here it would UNDER-count groups, i.e. invent a collapse.
2. **G4's premise about the barrel was stale, in the safe direction.** G4 quoted `keyFor`'s own comment saying "the a11y barrel is `export *`". It has been an EXPLICIT allow-list since s159 m4, so a module export is not a public-API move at all — the same status `drawnCellKeyFields` already has. The grep the charter mandated found no surface-pinning test asserting any of the three names' absence (the only absence pins are the guard trio's, untouched). A shipped test now pins `keyFor` and every accuracy internal OFF the public barrel, so this stays true by gate rather than by comment.
3. **`evaluateAccuracyRules` returns `notes`, and takes an optional `rules`.** The charter sketched the return as `{findings, rulesEvaluated}`, but its own R4 clause requires a note for an out-of-vocabulary transform op and §4 requires one for url-only data — those strings can only come from the evaluator, so `notes: string[]` is part of the result. `rulesEvaluated` counts the rules that RESOLVED their operand rather than the rules offered (4 on a certified spec with inline rows; 3 when R4 is unevaluable; 1 when no compiled spec is available), so silence can never read as coverage. The optional third `rules` parameter is what the per-rule mutation gates swap — the guard ships its own bite proof.
4. **R1/R3's value axis is derived compiled-locally.** The charter says "measure-axis". The adapter's own baseline-target derivation (y-if-quantitative, else x) is module-private and m01.9 pins the adapter byte-untouched, so the rules instead take every quantitative positional channel of a bar/area view, excluding `bin:true` axes. That is a SUPERSET of the adapter's choice, so a `baseline:'min'` defect — which the adapter writes onto exactly one of those channels — can never be missed by reading the wrong axis. R3's ranged exclusion is implemented on `x2` OR `y2` rather than `y2` alone; the extra case is an exclusion, i.e. the fail-safe direction.

**TWO UNDECLARED MOVEMENTS, both caught by the per-golden review, disposed of DIFFERENTLY — and the difference is the point. Both are run artifacts that a gate rewrites; the question is whether the rewrite carries information.**

- **`tools/a11y/reports/a11y-report.json` — REVERTED.** Gate 21 (`pnpm run a11y:diff`) rewrites it on every run. The entire 47-line diff was `generatedAt`, ephemeral localhost port numbers, and per-story `durationMs`; a normalized compare with those three fields stripped is byte-identical to HEAD. Keeping it would put timestamp and port noise in the sprint diff and imply an accessibility change that did not happen — so it is reverted, and gate 21's own verdict ("no new violations") is the evidence instead.
- **`diagnostics.json` — KEPT and declared.**

**UNDECLARED MOVEMENT, kept rather than reverted: `diagnostics.json`.** §7 predicted no movement for it and should have. It is a CUMULATIVE RUN LOG that `scripts/state-assessment.mjs` appends to, and gate 22e runs that script — so executing the gate table necessarily moves it (`runs 7 → 9`, `totals.highRisk 354 → 592`, `lastRun.highRisk 118 → 119` as brand A goes 77 → 78). Reverting it would make the committed state disagree with the gates that were actually run, so it is kept, declared here, and the s169 correction block was rewritten to quote the file WITH its run count and to show the reconciliation both ways (`4×0 + 3×118 = 354`; `4×0 + 3×118 + 2×119 = 592`). Any future sprint whose gate table includes gate 22e must declare this file as a mover.

**m01 evidence (all reproduced at build):** corpus 42 fixtures, exactly the 5 named schema-invalid ones, ZERO findings across all 42 · 13 committed aggregate bindings all identity · facet-layout is 8 groups of 1 under the full key and 2 groups of 4 facet-blind (G7 exact) · every rule destructively gutted in turn, each redding only its own rule's tests · viz-core 1205/61 → 1285/62 (+80 tests, +1 file), root core 4776+20/438 unchanged, guardrails 15/4 unchanged, mcp-server 4011+16/196 unchanged.

## §6B Critic disposition (v1 → v2)

**Blockers (2):** B1 (process lens) G4 falsely claimed the three aggregation functions importable — they are module-private; v2 declares the export edit as a movement and charters the surface-pinning grep first. B2 (movement lens) §7 omitted errors/registry.ts and dashboard.render.html.ts while calling itself exhaustive — v2 lists both; m02 is an eight-file atomic set (+ configs/agent/policy.json).
**Majors (9), all folded:** G12 inverted (certify IS bridge-served — main-loop proven; live-verify + pm2 scope corrected) · configs/agent/policy.json is a mover · R2's compiled-spelling ambiguity → sibling-key/IR-read discriminator specified · 5 schema-invalid corpus fixtures → named, fail-safe branch, still count to 42 · R1's sqrt rationale false → predicate restated with per-cause messages · R4 table → typed exhaustive record + aliasing + out-of-enum behaviour · gate 11 → four lints named literally · m03's "32/771" not reproducible → re-derive with stated metric · m02 finding shape → mapped into the closed `$defs/finding` + description truth-ups + fail-path validateOutput.
**Minors folded:** snap census 14/61 (main-loop; both lenses corrected) · G8 count 6–7 · R3 y2-band exclusion · §4 "positively detected" + url-data limit · diverging-bar guard causal wording · third guard fixture (color-independence) · twin shapes declared · m03 provenance marks + full artifact path + done-bar · m04.2 provenance-cited exclusions · descope order declared.

## §8 Deferred / not-doing (explicit)

#781 graded-unchecked (declined; now spans two pillars — first offer at s171 planning) · #1129 sandbox re-plant (declined) · mobile crawl 1–3 (expected s171, paired with the PT seed when client answers land) · PT seed (client conversation is the gate) · status-on-panel grading + brand-A status identity (Derek design ruling) · light-focus branding · full brand.css deletion (#1142) · #1158 status-provenance control (verified still missing; s171 candidate) · Swift colour transform (mobile walk) · breakpoint axis (rides with the seed) · #982 y2/x2 ECharts bands · certify-breadth 5→13 research memo (queued after accuracy, #1264).

---

## §8B Closeout record — s170 m05 (2026-08-03)

**NOT self-certified.** The genuine-close review is a separate session (rule 10).

### Gate table — all 22, sequential, by literal invocation

| # | gate | result |
|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | clean |
| 2 | `pnpm run build:packages` | pass |
| 3 | viz-core | **1286 / 62** (baseline 1205/61; +80 m01, +1 m04.5) |
| 4 | root core | **4795 + 20 skipped / 439** (baseline 4776+20/438; +12 m02, +7 m04.1) |
| 5 | guardrails | **15 / 4** unchanged |
| 6 | mcp-server | **4030 + 16 skipped / 197** (baseline 4011+16/196; +12 m02, +7 m04.1) |
| 7 | scale | **62** exact |
| 8 | `pnpm run tokens-validate` | pass, **32** viz checks |
| 9 | `pnpm run tokens:collision-guard` | **0 non-exempt / 6 scopes** |
| 10 | `pnpm run check:tokens` | up-to-date |
| 11 | six lints, each named literally | all six exit 0 |
| 12 | root `pnpm run typecheck` | pass |
| 13 | viz-core typecheck | pass |
| 14 | `pnpm -w run docs:api -- --check` | fresh, 26 files, no orphans |
| 15 | `@oods/schemas-tools generate:check` | pass |
| 16 | `pnpm run generate:schema-types -- --check` | unchanged |
| 17 | `pnpm run verify:brand-cascade` then `BRAND_CASCADE_PROOF_SELFTEST=1 …` | **246** assertions, exit 0; self-test exit **1** |
| 18 | governance, both brands | **A high=78 / B high=41**, both exit 0 with the label |
| 19 | the exact ci.yml:659 13-file invocation | **287 / 13** |
| 20 | `pnpm run test:coverage` | **4825 + 20 skipped / 450**, exit 0 |
| 21 | `pnpm run a11y:diff` | no new violations |
| 22 | viz-render **11/1** · mcp-bridge **5/1** · tenancy:check 0 · diagnostics-schema 0 · `state-assessment --guardrails --tokens` exit 0 (verdict RED on pre-existing token history, as predicted) · `build` 0 · `build-storybook` 0 | all pass |

**Test movement reconciles EXACTLY to named missions, with no unexplained delta:**
viz-core +80 (m01's proof suite) +1 (m04.5's new discriminating case) · mcp-server +12 (m02's accuracy e2e) +7 (m04.1's alpha guard) · root core +12 +7 (the same mcp-server `test/**` specs seen through the root project) · guardrails, scale, gate-19 golden list, viz-render, mcp-bridge all UNCHANGED.

**Gate 19 deviation, declared:** §6 predicted "287 + m04.1 additions". It is **287, unchanged**, because m04.1's spec went to `packages/mcp-server/test/tools/` rather than colocated under `src/tools/`. That is deliberate and strictly better: the colocated CI list runs only in the mcp-server suite, while `test/**` runs in BOTH that suite and the root `core` project. The guard gained a second runner instead of joining the golden list.

### Per-golden review

**ZERO `.snap` movement repo-wide.** Census re-measured at HEAD: **14 files / 61 entries** — exactly the §7 baseline, and not one is modified. Predicted and observed agree.

### Live verification (after rebuild + `pm2 restart oods-forge-bridge`)

Both serving paths, both directions:
- **:4466 bridge** — clean cartesian IR → `pillars.accuracy:'pass'`, `accuracySummary {rulesEvaluated:4, failing:0}`, `conformant:true`. The R1 red (`baseline:'min'`) → `accuracy:'fail'` + `OODS-V150` + `conformant:false`, **while `a11yEquivalence` and `contrast` both stay `'pass'`** — the disaggregation working as designed.
- **aquex adapter** — the same red returns the four-pillar verdict with `OODS-V150`. Its ADVERTISED description still lists three pillars (connect-time cached, as G12 predicted); **execution is fresh**. Reconnecting refreshes the advertisement.
- **m04.1, both bridge and dist** — `a11yContrast.summary.gradedPairs: 4` on brand A and brand B over :4466 (no golden movement), and a dist-level translucent probe confirms the guard is live in the built artifact: opaque graded, `rgba(...,1)` graded, alpha 0.1 and 0.4 skipped.

### Consumer loop-closure

`info_push` sent to `cmos://derek/forge-demos` AFTER m02 was built — additive change, ECharts path unchecked, the `findings[]`-is-no-longer-a11y-only note, and the advertised-schema caching caveat. Adoption is theirs.
