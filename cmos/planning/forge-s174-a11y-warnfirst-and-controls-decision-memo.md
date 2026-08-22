# Forge s174 — a11y-equivalence warn-first rollout + control correctives (pre-PT pause)

**Status: v2 LOCKED 2026-08-11.** Planning PS-2026-08-11-002. Grounding wf_0ac8f648-46e (6 lenses, anchors at HEAD `1a42515`). **Critic wf_a5042683-614 REJECTED v1 on 4 of 5 lenses (4 blockers / 14 majors / ~20 minors) — all disposed in §6.** The three verdict-deciding claims were re-measured in the main loop (rule 19): PR #72 is MERGED into OODS-pro (2026-08-11T02:04:15Z — the "PR needs token-change:breaking" carry is RETIRED); echarts-determinism.spec.ts:92 + echarts-accuracy.spec.ts:50 pin `findings` `[]` on data-backed calls; ci.yml:378 runs state-assessment `--tokens` in the guardrails job under a depth-1 checkout.

**Derek direction 2026-08-11:** proceed with the promised a11y-equivalence work plus the review-surfaced correctives; PT is parked (Syndy meeting pending this week); **land and pause** — s174 ends clean so the PT direction can take over without dangling state. Build in a FRESH session from this memo ONLY (rule 9); review separate (rule 10). All 17 standing rules apply; gate rows carry LITERAL invocations, env vars included, at FINAL HEAD post-commit (rules 14–16).

---

## §1 Ground truth and decisions

### 1a. The promise (m01 spine)

Shipped prose promises BY NAME a warn-first a11y-equivalence rollout **in s174**: artifact.certify.ts:238 + comments :229/:236, artifact.certify.output.json:96, generated.ts:563 (dated); tool-descriptions.json:20, configs/agent/policy.json:228, docs/api/artifact-certify.md:15, docs/api/README.md:33 (undated); stale comment echarts-determinism.spec.ts:99 ("deferred to s173"); stale count comment tests/viz/a11y-equivalence.test.ts:44 ("all 15" — engine has 16). The engine: packages/viz-core/src/a11y/equivalence-rules.ts, 16 rules A11Y-R-01..R-16 (RULES array :73–328). `VizA11yRuleResult` = `{id, summary, severity:'error'|'warn', passed:boolean, message?}` (:9–15) — binary passed, no not-applicable state. Zero ECharts types run any rule: `pillars.a11yEquivalence:'unchecked'` hardcoded (artifact.certify.ts:277–282). Precondition claims verified: table 'unavailable' on empty values (table-generator.ts:118–122) → R-03 fails metadata-only IRs; R-09 fails unnamed IRs (:202–214). s134→s135 shape: viz.render.ts:380–419 (s134 forced-severity soft-warn → s135 partition by table severity). Operand plumbing exists module-private: `analyzeEChartsPrimary` (viz.render.ts:815–831). Enum vocabulary: pillar `['pass','fail','unchecked']`, finding severity `['error','warn']` with the shipped sentence "The rule's intrinsic severity (native VizA11yRuleResult severity — not remapped)" at output.json:164–170 / generated.ts:599.

**Decisions (m01):**

1. **Operand gating** — warn-first runs ONLY when the `data` operand is supplied (positive precondition, rule 1). {spec}-only ECharts responses move in notes[] ONLY, inside clause (ii) via DECLARED_NOTE_REWORDS; clause (i) cartesian byte-identity holds end-to-sprint, no exception.
2. **Severity semantics — NATIVE, no remap (critic B4, Branch B).** Findings surface at each rule's INTRINSIC severity (R-09 emits 'error'-severity findings); nothing blocks and no verdict moves — that is what makes it warn-first. The shipped "not remapped" sentence (output.json:170) stays TRUE and untouched. The s134 forced-severity remap is explicitly NOT repeated.
3. **Pillar vocabulary — NO enum change.** `pillars.a11yEquivalence` stays `'unchecked'` on every path all sprint. The verdict flip (enforce) is referenced **undated** (rule candidate C).
4. **Result shape — `passed: boolean` SURVIVES.** Tri-state is carried by a NEW optional field (`notApplicable: true` + `preconditionAbsent: '<named>'`) on results whose declared positive precondition is absent; such results keep `passed: true`. This keeps every existing `.passed` pin byte-stable: viz-a11y-equivalence-emission.spec.ts:96–98 (error rules pass on fixtures lacking their preconditions — verified: R-01/R-02/R-06/R-10 preconditions ABSENT on its default bar), tests/viz/a11y-equivalence.test.ts:46/:62 (root core, via the src/viz shim which re-exports viz-core SOURCE), and the viz-core data-analysis specs (heatmap-f6d:128/:138/:166, faceted-s154:149/:222, phantom-f3:116) are ALL chartered NON-movers. A rule is not-applicable ONLY on a declared absent precondition, never judgment.
5. **The 16×8 applicability matrix is a PINNED OUTPUT** derived from per-rule declared preconditions; the pin test lives in **viz-core's own suite** (aliases to src — a cell flip discriminates without the dist-staleness trap; §5). The build records the initial grid in its mission decision; review flips one cell to prove discrimination.
6. **Engine entry point + extraction** — a new exported entry accepting an operand-derived context; `analyzeEChartsPrimary` EXTRACTED to shared code one level above both callers. **Standing rule B applies by name**: the two callers' argument guarding is compared and tested, and the mcp-server fidelity snaps (viz.render.network-fidelity, viz.render.geo-fidelity, etc.) are the extraction's NAMED byte-stability control, not incidental census rows.
7. **Cartesian non-movement, corrected justification**: not-applicable is excluded from BOTH partitions (warn and block) in viz.render/dashboard folds, so only genuine failures reach the wire; existing `.passed` consumers see unchanged booleans (decision 4). Proven by the emission specs + clause (i), not argued.
8. **The pin ledger, corrected (critic B1 — v1 had it wrong in both directions):**
   - Must-NOT-move guards (they prove decisions 1+3): artifact.certify.spec.ts:486/:649/:215 and echarts-determinism.spec.ts:94 — all assert `a11yEquivalence:'unchecked'`, which never changes this sprint. They move at ENFORCE, undated.
   - **DECLARED movers**: echarts-determinism.spec.ts:92 and echarts-accuracy.spec.ts:50 — both pin `findings` `[]` across all 8 data-supplied operand cases, and warn-first makes findings NON-empty (verified: A11Y-R-14 fires on all 8 — operand tables have >2 columns and the certify-path IR has no `portability.tableColumnOrder`; R-08 fires where fixture descriptions are <25 chars). Replacement assertions pin the EXACT expected finding set per type from the applicability matrix — a declared tightening, never `.toBeDefined()` loosening.
   - The build AUDITS every other data-backed ECharts response pin (notes[]/deep-equals) and declares each mover with its replacement before editing — the audit list is a mission deliverable.
9. **The warn families are enumerated so the build reads them as designed, not regression**: R-14 (no tableColumnOrder) on all 8 types; R-08 (description <25 chars) where fixtures are terse; R-09 (unnamed IR) on unnamed specs. The note frames: warnings enumerate what enforcement will require.
10. **The reworded echartsA11yNote names the operand gate** (critic M-pc.2; chartered wording, Branch-B adjusted): "<trait> is an ECharts-primary mark. A11y-equivalence runs WARN-FIRST here: when the `data` operand is supplied, the 16-rule equivalence engine evaluates over the operand-built table and narrative, each rule reporting pass, fail, or not-applicable with its absent precondition named; failures surface in findings[] at their native severity and do not move the pillar. Without the operand there is nothing to evaluate and no a11y findings appear. pillars.a11yEquivalence stays 'unchecked' in both cases; the verdict flip to pass/fail is a future enforce step, not scheduled here. The accessible table and narrative are generated on the data-backed path." The stale "still generated" claim does not survive unexamined.
11. **All promise carriers rewritten** (loose grep patterns — the carriers phrase the promise three ways): the seven shipped carriers + the two stale comments. **EXEMPT: `__fixtures__/s172-certify-spec-only-baseline.json`** (critic B3) — the byte-control baseline is NOT rewritten and NOT rebased; the {spec}-only note movement is declared in DECLARED_NOTE_REWORDS (which key on the baseline text). Every no-surviving-promise sweep in this memo is scoped to SHIPPED surfaces, excluding test fixtures/baselines. Advertised schema prose moves → aquex consumers reconnect; two-layer note ships.
12. viz-core REBUILT before the mcp-server suite runs (dist resolution), and before ANY §5 pin re-check.

### 1b. Governance un-vacuating + provenance (m02)

Vacuous-gate mechanics (all reproduced): state-assessment.mjs:1321 passes no refs → index.ts:252 defaults `baseRef:'main'` → unresolvable in a PR checkout (only origin/main exists) → subprocess exits 1 with NO report → state-assessment stays GREEN (rationale-only; sole nonzero exit is main().catch) → enforce.mjs passes on zero reports. PR_LABELS never consulted. `main` is dead (frozen sprint-95); PRs target OODS-pro. **state-assessment has TWO CI callers** (critic B2): token-governance.yml (fetch-depth 0) AND ci.yml:378 guardrails job `--guardrails --tokens` under a DEPTH-1 checkout where no base ref can ever resolve.

**Decisions (m02):**

1. **Refs**: token-governance.yml computes `TOKEN_GOV_BASE_REF=$(git merge-base origin/$GITHUB_BASE_REF HEAD)` (equals the base tip on GitHub merge commits while the base has not advanced; merge-base chosen precisely because it stays correct when it has). **The guardrails job gets the SAME treatment**: `fetch-depth: 0` added to its checkout + the same env threading — both CI callers measure the PR delta; 13 jobs stay 13.
2. **Fail-closed, scoped to provided refs**: when TOKEN_GOV_BASE_REF is set, a brand diff exiting nonzero OR a missing brand report forces status RED and a NONZERO exit. When refs are genuinely absent (push-to-main runs), the tokens leg reports a NAMED SKIP — visible in the report and log, never silent green pretending to have diffed.
3. enforce.mjs errors on **fewer than 2** brand reports (not just zero — the label check lives inside the per-report loop).
4. index.ts:252 loses the `'main'` default: explicit `--base`, else `origin/OODS-pro`, else THROW naming the flag. `main` appears nowhere as a default. docs/runbooks/change-tokens-safely.md:20 (`--base main`) is swept in the same change.
5. **Step order** (critic M-gov.2): the Collect-PR-labels step (switched to the LIVE API query, `labeled` trigger kept) moves ABOVE the assessment step; the assessment env receives PR_LABELS, threaded into the diff invocation so subprocess exit agrees with enforce. **package.json:139 `state:token-breaking` is rewritten in step** — it sets `CMOS_TOKEN_LABELS`, which NOTHING reads (grep 0); it sets PR_LABELS after m02 and its restored purpose lands in the discrimination proof.
6. **Bite, stated retrospectively** (critic M-gov.1 + M-pc.3): PR #72 MERGED before this memo. Counterfactually verified with the real tool at HEAD: the un-vacuated gate would have found the full branch-vs-OODS-pro delta — highRisk 83 (A) + 48 (B), which INCLUDES s173's +5/brand — and enforce exits 1 without `token-change:breaking`, 0 with it (measured on the real reports). The label was present; delivery would have been correct. **The s174 PR expects highRisk 0 and no label** (§4: nothing touches packages/tokens/src). The stale "PR needs token-change:breaking" memory carry is retired.
7. **goldens 287/13 RESOLVED, row re-annotated, NOT retired**: the "Run colocated viz.render + dashboard.render goldens" step (ci.yml:687, historically cited :659), 13 named files / 287 tests, reproduced VERBATIM at HEAD (after the chartered viz-core rebuild — the first attempt's 1 stale-dist failure re-proved decision 1a.12). The row names the STEP, never frozen counts. CMOS decision closes carry #1219.
8. Dead `main` branch delete/repoint — flagged to Derek, not chartered.

### 1c. Desktop VRT truth-up (m03)

Measured: the desktop chromium project reds ALL FOUR spec files — 15 failed / 4 did-not-run of 19. The s173 "one desktop VRT spec" disclosure understated (only the form spec had been run); the s173 memo gains a dated correction block + CMOS decision. form.accessibility.spec.ts:3 and toast.spec.ts:3 hard-code story IDs extinct since the 2025-12-03 title reorg — both proven one-line fixes. brand-a.spec.ts targets eight extinct `BrandA/*` titles AND is a screenshot spec with zero baselines. layout.visual.spec.ts: 9 × missing-snapshot, zero baselines ever. No CI job runs any desktop VRT project.

**Decisions (m03):**

1. form+toast resolve through the story index (`resolveStoryId`, **testkits/vrt/stories/utils/storybook.ts:44**). **Corrected rationale** (critic — brand-a already used resolveStoryId and rotted anyway): index resolution makes the failure LOUD AND NAMED and survives ID-scheme changes; it does not prevent title rot. Multi-title aliases (the resolver already accepts string[]) are used where a known former title exists.
2. **The fixed specs get an automated runner**: form+toast (assertion-only, baseline-free) ride the a11y-contract job's existing static-server leg alongside vrt:mobile (the s173-m04 ride-the-job precedent; 13 jobs stay 13). Without this, nothing automated would ever run the desktop project again.
3. **RETIRE brand-a.spec.ts + layout.visual.spec.ts** with recorded CMOS decisions (extinct targets / zero baselines / red-by-design; the s173-DECLINED screenshot-corpus fork STANDS and is cited, not reopened). **The retirement's full carrier sweep is chartered** (grep-the-claim on `vrt:layouts` and the spec names): package.json:99 script entry removed, pipeline:push (package.json:135) updated, scripts/viz/best-practices.mjs:146 + docs/viz/best-practices.md:44 + docs/viz/performance-optimization.md:25 rewritten.
4. **The forced-colors gap is RECORDED, accepted, findable** (critic M-disp.1): after both retirements NO running control compares any pixel under forced-colors (survivors verified insufficient: storycap.hc output has no diff consumer; Chromatic has 2 forced-colors stories behind a token-gated continue-on-error job; e2e/overlays.accessibility.spec.ts is the same cannot-run class — no config covers e2e/). Successor work is deliberately NOT chartered in the pause sprint; revisit with the PT/HC direction. §4 carries it.
5. Closeout gate: desktop chromium project green end-to-end — **and if the "m03 retirements" descope rung fires, the gate is RESTATED as "form+toast green under `--project=chromium`" with the literal invocation** (the full-project gate is unachievable with never-green specs still present).

### 1d. Type-truth + vacuous suite (m04)

build:stories = `tsc -p tsconfig.stories.json` (noEmit), ZERO automated consumers, the ONLY type lens over stories/** and apps/explorer/**. At HEAD: exit 2, exactly 268 errors / 56 files; 177 mechanical (130 TS2503 JSX-namespace from @types/react 19 + 47 unused-symbol), 91 semantic in ~12 files (real drift: ContextKind grew; classification fixtures lack `metadata`; ~12 real explorer TimelinePage errors). The `storybook` vitest project matches ZERO files (absolute-pattern globs; the `./`-remap never fires); ci.yml's coverage job runs it vacuously green and never installs browsers; corpus = 118 story files / 402 exports / zero play functions.

**Decisions (m04):**

1. **Ratchet, exact-pin with forced lowering** (critic M-disp.3): the script REDs when the count EXCEEDS the pin **and** REDs with "lower the pin to N" when the count DROPS below it — headroom cannot accumulate; the pin only ever moves down and every move is a commit. Equal-count error swaps are UNDETECTABLE by a count ratchet and that property is stated as accepted. Baseline re-measured at build HEAD (268 at 1a42515; re-measure, never copy). Wired as a step appended to the EXISTING typecheck CI job (13 jobs stay 13). Discrimination chartered both directions: injected error REDs; removed error REDs with the lower-the-pin message.
2. **Descopable sub-item**: the 130-item JSX-namespace mechanical sweep (annotations render nothing — capture-safe by construction), pin lowered to the re-measured count. The 91 semantic errors stay PARKED (fixture edits can move captures).
3. **The storybook vitest project is FULLY removed, with its own control** (critic minors made the set explicit): vitest.config.ts project block + storybookTest plugin import, storybook.config.ts:56 addon entry, the @storybook/addon-vitest devDependency, and .storybook/vitest.setup.ts — all in one declared change. Verified pre-conditions: the addon ships NO preview export and all three storycap harnesses shoot /iframe.html only, so captures cannot move — **proven in-mission by a build-storybook index.json parity check pre/post**, not asserted. Suite counts move ZERO (the project contributes 0 files — `vitest list --project=storybook` exits 0 with none; a clean control). Rationale recorded: vacuous CI green, zero play functions, render coverage lives in build-storybook/Chromatic/a11y; re-adding later re-pays CI browser wiring. The fix-and-burn-in alternative is DECLINED for s174 (fork F1 to Derek: revisit when interaction testing is chartered deliberately).

### 1e. Explorer DetailPage — OUT (premise, not execution)

Zero live consumers (no route, no story; sole importer is a smoke spec NO vitest project matches — it never runs), untouched since the initial commit, hand-rolled CSS with pre-existing malformed rules (index.css:353–359). Converting it polishes a dead demo. OUT of s174; revisit with an explorer consumer (plausibly PT). The orphaned smoke spec + broken CSS are recorded here, findable.

---

## §2 Mission slate

DAG: m01 root · m02, m03, m04 independent · m05 requires all non-descoped. Descope order: m04.2 (JSX sweep) → m03 retirements (fixes + runner stay; gate restates per §1c.5) → m04 → m03 → m02. **m01 NON-descopable — it is the shipped promise.**

- **m01 [L] a11y-equivalence warn-first rollout** — §1a decisions 1–12. Deliverables: tri-state-via-new-field engine (passed survives); operand-context entry + rule-B-proven extraction with the fidelity snaps as named control; ECharts certify path warn-first on data; 16×8 matrix pin in viz-core; corrected-ledger pin work incl. the data-backed findings-pin audit; carriers rewritten with fixture exemption; regen + docs; declared clause-(ii) rewords; reconnect note.
- **m02 [S] governance un-vacuating + provenance** — §1b decisions 1–8. Deliverables: refs + fail-closed-when-refs + named-skip; both CI callers fixed; step reorder + live labels + state:token-breaking rewrite; no-main default + runbook sweep; RED/GREEN discrimination proof by literal invocation (real reports, PR_LABELS unset/set — measured exit 1/0 already reproduced by the critic); 287/13 row re-annotated + carry #1219 closed.
- **m03 [S] desktop VRT truth-up** — §1c decisions 1–5. Deliverables: form+toast green via index resolution + CI runner; two retirements with full carrier sweep + recorded decisions; forced-colors gap recorded; s173 record correction appended + decision; desktop chromium gate (or its restated descope form) by literal invocation.
- **m04 [S/M] type-truth + vacuous suite** — §1d decisions 1–3. Deliverables: exact-pin ratchet + CI step + two-direction discrimination; full storybook-project removal with index.json parity control; (descopable) JSX sweep with lowered pin.
- **m05 [S] closeout** — gate table by literal invocation at FINAL HEAD post-commit (rule 16: base SHA beside the governance row); suite finals from observed runs only (rule 15), m01's corrected mover set reconciled per file; snap census zero-movement outside declared movers; **diagnostics.json quoted WITH run count; a11y-report.json reverted if only nondeterministic metadata moved; `git status --porcelain` empty at every gate row** (the three s173 items restored verbatim — critic M-comp.4); shipped-surface prose sweeps recorded (fixture-exempt); served-path rebuild + pm2 restart oods-forge-bridge (mine) + aquex reconnect note; charter-diff line-item every mission; decisionCount ≥1 per mission. NOT self-certified; review separate.

## §3 Standing-rule candidate (Derek ratification)

**C. Shipped prose never carries a sprint-numbered promise.** Forward work is referenced undated in shipped surfaces; dates live in memos and CMOS. Evidence: the s173→s174 date correction shipping in output.json:96 exists only because the promise was dated. Scope note (critic): the a11y set is the ONLY sprint-numbered forward promise in shipped surfaces today; the same disease exists as stale MISSION-numbered forward refs ("deferred to m03" ×3 in dashboard.render.input.json:411/:483/:511 + mirrors, "Phase 2" in viz.render.output.json:5) — parked in §4 as a follow-up sweep, not silently absorbed into m01.

## §4 Declines and dispositions (recorded)

- DetailPage conversion — OUT (§1e, premise).
- Play-function interaction testing — NOT chartered (fork F1 to Derek).
- Committed screenshot corpus — the s173 decline STANDS; m03 cites it.
- **Forced-colors pixel comparison — accepted ZERO-holder gap after m03's retirements** (§1c.4); revisit with the PT/HC direction.
- build:stories semantic fix-forward (91 errors) — PARKED behind the ratchet; TimelinePage app errors invisible-to-green until then.
- Mission/phase-numbered stale forward refs in shipped schema prose — follow-up sweep, parked (§3).
- Dead `main` branch delete/repoint — Derek-domain flag.
- PT arc — PAUSED pending Syndy; nothing in s174 touches packages/tokens/src (un-vacuated governance expects highRisk 0, no label, on the s174 PR).
- Stale memory carry "PR needs token-change:breaking" — RETIRED (PR #72 merged with the label present).

## §5 Review charter (separate session)

Re-run every gate by literal invocation at the review's own HEAD, **rebuilding viz-core before any pin re-check** (a stale dist shows false-GREEN discrimination). Specifically: flip one matrix cell in viz-core → its own-suite pin REDs (then revert); inject one TS error → ratchet REDs; delete one existing error → ratchet REDs with lower-the-pin (then revert both); enforce.mjs on the real two-brand reports with PR_LABELS unset (exit 1) and set (exit 0), literal invocations; the guardrails job and token-governance workflow both produce brand reports on the s174 PR (highRisk 0, no skip); desktop chromium gate in its chartered or restated form; storybook-removal: `vitest list` project census unchanged minus the removed project AND the build-storybook index.json parity check reproduced; clause (i) cartesian byte-identity held; {spec}-only movements equal the DECLARED_NOTE_REWORDS set exactly; shipped-surface claim-greps return only dated corrections (fixture exempt); warn-first proven LIVE on :4466 — a data-backed certify call shows findings at INTRINSIC severity with pillar 'unchecked', and a {spec}-only call shows the operand-gate note with zero a11y findings; per-mission decisionCount ≥1.

## §6 Critic dispositions (wf_a5042683-614: 4 REJECT / 1 ACCEPT)

**Blockers, all fixed in v2:** B1 pin-ledger-wrong-both-directions (blast-radius + completeness + promise-coherence convergent) → §1a.8 corrected ledger: :486/:649/:215/:94 reclassified must-NOT-move; determinism:92 + accuracy:50 declared movers with matrix-derived replacement assertions; `.passed`-shape pins (emission spec, root shim test, viz-core data-analysis) preserved by keeping `passed` (§1a.4). B2 guardrails-job-permanent-red → §1b.1/2: both callers threaded, fail-closed scoped to provided refs, named SKIP otherwise. B3 sweep-hits-byte-fixture → §1a.11 fixture exemption + shipped-surface scoping. B4 severity-straddle → §1a.2 native severities, no remap; output.json:170 stays true untouched.

**Majors, disposed:** four v1 "movers" were non-movers (→ §1a.8) · emission-spec preconditions absent on its fixture, decision-6 justification false (→ §1a.4/7 corrected) · severity-remap-vs-shipped-sentence (→ §1a.2) · bite magnitude 83A/48B not +5, and PR #72 merged so the bite is counterfactual (→ §1b.6, measured) · step-order dependency (→ §1b.5) · state:token-breaking dead env var (→ §1b.5) · forced-colors zero-holder gap (→ §1c.4, §4) · vrt:layouts stranded carriers (→ §1c.3 sweep) · ratchet headroom/swap-masking (→ §1d.1 exact-pin + stated acceptance) · index-resolution rationale false + no automated runner post-m03 (→ §1c.1/2) · descope rung vs unachievable gate (→ §1c.5) · m05 dropped three s173 closeout items (→ §2 m05 restored verbatim).

**Minors adopted where load-bearing:** rule-table span :73–328 · warn families enumerated (§1a.9) · loose grep patterns (§1a.11) · enforce <2 reports (§1b.3) · runbook `--base main` sweep (§1b.4) · merge-base caveat (§1b.1) · resolver path corrected to testkits/vrt/stories/utils/storybook.ts (§1c.1) · "all 15 rules" stale comment into m01's sweep (§1a) · rule B by name + fidelity snaps as named control (§1a.6) · addon-removal set made explicit + parity control (§1d.3) · §5 viz-core-rebuild note + matrix pin placed in viz-core (§1a.5, §5) · note wording chartered incl. the "still generated" correction (§1a.10) · e2e/overlays.accessibility.spec.ts recorded in the §1c.4/§4 gap note. **Critic verifications banked**: 287/13 true at ci.yml:687 (reproduced, rebuild-dependent) · 13 jobs stay 13 · coverage job needs no edit for the removal · setup-file orphaning inert · vrt:fallback/vrt:mobile/state-assessment --vr-fallback untouched by the retirements · rule candidate C consistent with all shipped prose.

---

## §7 Closeout (m05, 2026-08-11)

**5/5 missions built. Nothing descoped — the m04.2 JSX sweep, first rung of the descope order, landed too.** Every row below is a LITERAL invocation with its env vars, run at **final HEAD `0e251e5`, post-commit** (rule 16). `git status --porcelain` was empty at every row except where a row's own run writes a tracked artifact, which is named in that row.

### Reference SHAs

| what | sha |
| --- | --- |
| final HEAD (this sprint's commit) | `0e251e5c810ea062cd9e2f2273a36559aebc6b9c` |
| base — `git merge-base origin/OODS-pro HEAD` | `1a425155597d0a8833a19acdfccd25a9c8d6387e` |
| `origin/OODS-pro` at closeout | `09be34f11a2bfa4f04c16fca49bfff4f131079db` |

### Gate table

| # | gate | literal invocation | result |
| --- | --- | --- | --- |
| 1 | lockfile | `pnpm install --frozen-lockfile` | exit 0 |
| 2 | root types | `pnpm run typecheck` | exit 0 |
| 3 | lint | `pnpm run lint` | exit 0 |
| 4 | viz-core build | `pnpm --filter @oods/viz-core run build` | exit 0 |
| 5 | viz-core suite | `pnpm --filter @oods/viz-core exec vitest run` | **65 files / 1361 tests**, exit 0 |
| 6 | viz-core re-export gate | `pnpm --filter @oods/viz-core run typecheck` | exit 0 |
| 7 | mcp-server suite | `pnpm --filter @oods/mcp-server exec vitest run` | **206 files (1 skipped) / 4273 tests — 4257 passed, 16 skipped**, exit 0 |
| 8 | root core | `pnpm exec vitest run --project core` | 452 files (1 skipped) / 5105 — 5088 passed, 16 skipped, **1 FAILED (pre-existing, §7.4)** |
| 9 | root a11y | `pnpm exec vitest run --project a11y` | 7 files / 17 tests, exit 0 |
| 10 | root guardrails | `pnpm exec vitest run --project guardrails` | 5 files / 24 tests, exit 0 |
| 11 | build:stories ratchet | `node scripts/quality/build-stories-ratchet.mjs` | "holds at the pin: 138 type errors", exit 0 |
| 12 | tokens | `pnpm run tokens-validate` | exit 0 |
| 13 | diagnostics schema | `pnpm run validate:diagnostics` | exit 0 |
| 14 | colocated goldens (ci.yml step "Run colocated viz.render + dashboard.render goldens") | the step's 13-file vitest invocation, verbatim | **13 files / 287 tests**, exit 0 |
| 15 | package compat | `pnpm run build:tokens && pnpm run pkg:compat` | "pkg:compat checks passed", exit 0 |
| 16 | storybook + capture parity | `pnpm run build-storybook`, then sha256 of `storybook-static/index.json` | `19e6c52f60aed2f67840e6ba12a3cb9faa736893ef226dd23ef5dc8b19f1120f`, 454 entries — **byte-identical to the pre-m04 capture** |
| 17 | VRT mobile | `STORYBOOK_EXTERNAL=1 STORYBOOK_URL=http://127.0.0.1:6099 pnpm run vrt:mobile` | 18 passed, exit 0 |
| 18 | VRT desktop (m03's chartered gate, unrestated) | `STORYBOOK_EXTERNAL=1 STORYBOOK_URL=http://127.0.0.1:6099 pnpm run vrt:desktop` | 2 passed, exit 0 |
| 19 | a11y contract | `pnpm run a11y:diff` | "No new accessibility guardrail, contrast, or contract violations detected", exit 0 |
| 20 | governance, refs supplied, NO label | `env -u PR_LABELS TOKEN_GOV_BASE_REF=1a42515… node scripts/state-assessment.mjs --tokens` | **GREEN, highRisk 0, no skip**, exit 0 — writes `diagnostics.json` |
| 21 | enforcement over those reports | `env -u PR_LABELS node scripts/gov/enforce.mjs` | "Token governance enforcement passed", exit 0 |

Gate 20/21 together are the s174 PR prediction, confirmed: **highRisk 0 on both brands, `token-change:breaking` NOT required, and no skip** — nothing in this sprint touches `packages/tokens/src`. `diagnostics.json` is quoted WITH its run count: `governance.totals.runs = 20`, `lastRun` GREEN / highRisk 0 / requiresBreakingLabel false, brands A and B both 0/0/0.

`tools/a11y/reports/a11y-report.json` moved during gate 19 and was **REVERTED**: a `-U0` diff filtered for `generatedAt`, the ephemeral `127.0.0.1:<port>` URLs and `durationMs` left ZERO remaining lines, so only nondeterministic metadata had changed.

### §7.1 Live proof on the served path

`pnpm --filter @oods/mcp-server run build` + `pnpm --filter @oods/mcp-bridge run build`, then `pm2 restart oods-forge-bridge` (mine, not Derek's) — `/health` returns `{"status":"ok","bridge":"ready","toolset":{"mode":"default","enabledCount":19}}`. Warn-first proven LIVE through `POST :4466/run`, both directions:

- **data-backed** MarkSankey certify → `pillars {a11yEquivalence:'unchecked', determinism:'pass', contrast:'pass', accuracy:'pass'}`, findings `OODS-A11Y-A11Y-R-08 (error)`, `OODS-A11Y-A11Y-R-09 (error)`, `OODS-A11Y-A11Y-R-14 (warn)`, `conformant: null`, `coverage: 'uncertified'`. Native severities, pillar unmoved, nothing blocked.
- **{spec}-only** same IR → zero `OODS-A11Y-*` findings and the reworded note present, opening `MarkSankey is an ECharts-primary mark. A11y-equivalence runs WARN-FIRST here: when the \`data\` operand is supplied…`.

**ACTION FOR AQUEX CONSUMERS: RECONNECT.** m01 moved the advertised schema prose in both policy layers (`configs/agent/policy.json` and `packages/mcp-adapter/tool-descriptions.json`) plus `artifact.certify.output.json`. Tool EXECUTION is fresh per call, so the new findings arrive immediately; the DESCRIPTION and input schema are what your connector cached at connect time.

### §7.2 Declared movement, reconciled per file

| file | declared as | outcome |
| --- | --- | --- |
| `echarts-determinism.spec.ts:92` | MOVER | replaced with the exact matrix-derived set per type |
| `echarts-accuracy.spec.ts:50` | MOVER | split into accuracy-only `[]` + exact a11y set + total length |
| `artifact.certify.spec.ts:220 / :486 / :649` | must-NOT-move | UNMOVED, green |
| `echarts-determinism.spec.ts:94` (`a11yEquivalence:'unchecked'`) | must-NOT-move | UNMOVED, green |
| `viz-a11y-equivalence-emission.spec.ts:96–98`, `tests/viz/a11y-equivalence.test.ts:46/:62`, viz-core data-analysis specs | `.passed` non-movers | UNMOVED — `passed` stays a boolean by design |
| `__fixtures__/s172-certify-spec-only-baseline.json` | EXEMPT | not rewritten, not rebased; its note movement is a DECLARED REWORD |
| all `*.snap` | zero movement | **14 files / 61 entries, `git status` shows 0 snapshot changes** |
| `storybook-static/index.json` | zero movement | byte-identical (gate 16) |

Clause (i) cartesian byte-identity held end-to-sprint (`artifact.certify.spec-only-bytes.spec.ts` green inside gate 7). `DECLARED_NOTE_ADDITIONS` stayed empty; the single `DECLARED_NOTE_REWORDS` entry keys the unchanged e5bf2f6 baseline text and now points at `A11y-equivalence runs WARN-FIRST here`.

### §7.3 Charter diff, per mission

- **m01** — built as chartered, all 12 decisions. ONE correction to the charter, measured: §1a.9 said "R-14 fires on all 8 types"; true for the pinned fixtures, but the property is FIXTURE-dependent (it needs >2 table columns), so viz-core's own matrix fixture has force_graph at not-applicable. Recorded in the matrix comments and the mission decision.
- **m02** — built as chartered, all 8 decisions, plus ONE addition the charter's enumeration missed: `scripts/gov/triage.mjs` was a third `main`-defaulting caller (both a `?? 'main'` and an `origin/main` last-resort candidate) and was fixed in the same change. One chartered message had to be re-derived from measurement: decision 4's own fallback means "no ref supplied" no longer implies "nothing was diffed", so the named skip distinguishes the two cases instead of asserting the stronger one.
- **m03** — built as chartered, all 5 decisions, in the gate's CHARTERED form (no descope restatement needed: after the retirements the chromium project IS the two fixed specs). Two carriers found by the sweep and deliberately LEFT with reasons recorded (`examples/viz/.../notes.md` past-tense evidence; `scripts/diag/collect-sprint09.ts` try/catch, unwired).
- **m04** — built as chartered, all 3 decisions, and the DESCOPABLE sub-item was NOT descoped: the JSX sweep landed and the pin moved 268 → 138 in the same change.
- **m05** — this record. The three restored s173 items are all present: `diagnostics.json` quoted with its run count, `a11y-report.json` reverted after confirming only nondeterministic metadata moved, `git status --porcelain` empty at every gate row.

**decisionCount ≥1 per mission, VERIFIED: 3 / 3 / 3 / 3 (m01–m04) plus m05's, 13+ sprint decisions recorded.**

### §7.4 Pre-existing red, carried NOT fixed

`tests/contracts/public-api.contract.test.ts > do not expose explicit \`any\` types` fails in the root `core` project. It greps every `.d.ts` under `dist/` and hits exactly three lines in `dist/pkg/index.d.ts` — the Communicable trait helper signatures emitted by `src/generators/templates/object-interface.ts:181`. That template is untouched by s174, and every file under `dist/` is dated 2026-08-10 20:58, before this build session opened, so **no s174 edit is an input to that assertion**. Fixing it is a generator-template change with its own blast radius; recorded as a carry rather than absorbed into a land-and-pause sprint.

### §7.5 Not self-certified

Per rule 10 this record is the BUILD's account of itself. The review charter in §5 stands unmodified and is owed a separate session; the one addition worth making there is that §5's live-warn-first item was ALSO run here (§7.1) and should be re-run independently rather than read from this record.

## §8 Dated corrections (2026-08-22)

Appended during s175 (memo `cmos/planning/forge-s175-correctives-decision-memo.md` §1a.6, decision 5). The text above is NOT rewritten — each sub-block explains a figure or a claim as it was made, it does not replace it. One block, three owners: **§8.1** (C2) is s175 m01's; **§8.2** (C7) is added by s175 m03; **§8.3** (the §7 omissions) by s175 m06.

### 8.1 C2 — the 83/48 counterfactual is a `main`-based delta, not branch-vs-OODS-pro (s175 m01)

**What this memo says** (the defect is review learning #427, next-step #1228)**.** `:44` (§1b.6) states that the un-vacuated gate "would have found the full branch-vs-OODS-pro delta — highRisk 83 (A) + 48 (B), which INCLUDES s173's +5/brand", and `:110` (§6) banks the critic's "bite magnitude 83A/48B not +5". The figures are real measurements; the base ref the sentence names is not the one that produced them.

**Why.** At memo time the CLI defaulted `baseRef` to `main` (`tools/tokens-governance/index.ts:159-164` — the default s174 m02 then removed; today an explicit `--base` wins, else `origin/OODS-pro`, never `main`). Local `main` = `5ec84cad61d2c7e21f0026ba78e94e8a56cecc2a` (2026-04-18, frozen at sprint-95). So 83/48 is the s174 branch measured against a tree nobody has merged into for ~80 sprints. Against the refs the sentence names, the same tool gives **5/5** (PR #71 merge `f939f5f`, the five `sys.breakpoint.*` adds from s173) and **0/0** (`origin/OODS-pro` tip `4e7e131`, the PR #73 merge). The 83/48, 5/5 and 0/0 figures are all kept — each is correct for its refs — which is exactly the point of standing-rule candidate R-a (s175 memo §3): *a counterfactual or delta magnitude is recorded with its base-ref SHA, its head-ref SHA and the literal command; a figure without its refs is not a measurement.*

**Re-measured 2026-08-22** on the real tool at HEAD `852be47a2d138014b6dec1d4427b259e65fe4add` (working tree; the diff reads every ref, HEAD included, through git, so dist state is irrelevant). Literal command per row, `<out>` a scratch path:

```
pnpm run tokens:governance -- diff --brand <A|B> --base <base> --head <head> --json <out>
```

| base (SHA) | head (SHA) | brand | highRisk | added / removed / modified | requiresBreakingLabel | exit |
|---|---|---|---|---|---|---|
| `main` (`5ec84cad61d2c7e21f0026ba78e94e8a56cecc2a`) | `1a42515` (`1a425155597d0a8833a19acdfccd25a9c8d6387e`) | A | **83** | 30 / 39 / 70 | true | 1 |
| `main` (`5ec84cad61d2c7e21f0026ba78e94e8a56cecc2a`) | `1a42515` (`1a425155597d0a8833a19acdfccd25a9c8d6387e`) | B | **48** | 30 / 39 / 16 | true | 1 |
| `main` (`5ec84cad61d2c7e21f0026ba78e94e8a56cecc2a`) | `852be47` (`852be47a2d138014b6dec1d4427b259e65fe4add`) | A | **83** | 30 / 39 / 70 | true | 1 |
| `main` (`5ec84cad61d2c7e21f0026ba78e94e8a56cecc2a`) | `852be47` (`852be47a2d138014b6dec1d4427b259e65fe4add`) | B | **48** | 30 / 39 / 16 | true | 1 |
| `f939f5f` (`f939f5fde3cf47ba54279df776318e589f8ca2e3`) | `1a42515` (`1a425155597d0a8833a19acdfccd25a9c8d6387e`) | A | **5** | 5 / 0 / 0 | true | 1 |
| `f939f5f` (`f939f5fde3cf47ba54279df776318e589f8ca2e3`) | `1a42515` (`1a425155597d0a8833a19acdfccd25a9c8d6387e`) | B | **5** | 5 / 0 / 0 | true | 1 |
| `f939f5f` (`f939f5fde3cf47ba54279df776318e589f8ca2e3`) | `852be47` (`852be47a2d138014b6dec1d4427b259e65fe4add`) | A | **5** | 5 / 0 / 0 | true | 1 |
| `f939f5f` (`f939f5fde3cf47ba54279df776318e589f8ca2e3`) | `852be47` (`852be47a2d138014b6dec1d4427b259e65fe4add`) | B | **5** | 5 / 0 / 0 | true | 1 |
| `origin/OODS-pro` (`4e7e131784427077b3df9e5b69f374392a1beca2`) | `852be47` (`852be47a2d138014b6dec1d4427b259e65fe4add`) | A | **0** | 0 / 0 / 0 | false | 0 |
| `origin/OODS-pro` (`4e7e131784427077b3df9e5b69f374392a1beca2`) | `852be47` (`852be47a2d138014b6dec1d4427b259e65fe4add`) | B | **0** | 0 / 0 / 0 | false | 0 |

(exit 1 = the CLI's "high-risk without `token-change:breaking`" posture, as documented in `docs/tokens/governance.md`; the two `1a42515` and `852be47` heads are identical because no `packages/tokens/src` file moved between them.)

**Reading of `:44` after this correction.** "The un-vacuated gate would have found 83/48" is true only for a PR targeting `main`; PR #72 targeted `OODS-pro`, where the un-vacuated gate would have found 5/5 (against the then-tip `f939f5f`) — still high-risk, still label-gated, and the label was present, so the delivery conclusion at `:44` ("delivery would have been correct") is unchanged. The "which INCLUDES s173's +5/brand" clause is the only piece that survives literally: 5/5 IS the whole branch-vs-OODS-pro delta.

**Pipe-clause correction riding here (next-step #1227, learning #426).** The s174 review's second cause — "root `build:tokens` is `node packages/tokens/scripts/build.mjs | pnpm --filter @oods/* run build`, a PIPE" — does not reproduce: `package.json:71` is `"build:tokens": "node packages/tokens/scripts/build.mjs"`, and `git log -G'build:tokens".*\|' -- package.json` and `git log -G'build\.mjs \|' -- package.json` both return **0** commits across the file's 63 — a pipe never existed in the root script (`-S` hits cannot show that; `-G` can). No root script contains a shell pipe (the only `|` is `pipeline:push`'s `||`). The only `rimraf dist` is `packages/tokens/package.json:23`, `&&`-chained. Learning #426 is archived; s175 m01 records a dated learning superseding that clause. No build-sequencing change was made.


### 8.2 Certify carries C4 / C5 / C7 — closed by s175 m03 (2026-08-22)

**C5 (the not-applicable promise had no wire channel).** The echartsA11yNote (§1a.10) promised each rule "reporting pass, fail, or not-applicable with its absent precondition named"; the engine produced exactly that (decision 4) and `artifact.certify.ts` dropped it — NA results carry `passed:true` by design and the emission loop's `if (rule.passed) continue` could not tell them from a meaningful pass; the output schema (`additionalProperties:false`) had no field that could carry one. Reproduced at 852be47 for all 8 ECharts-primary types with the s172 operand fixture: 9–10 NA results per type in the engine, zero on the wire. Closed by an additive, schema-declared top-level `a11yNotApplicable: [{rule, preconditionAbsent}]` (memo s175 §1c decision 7) present exactly when the warn-first engine ran (ECharts-primary + `data`), absent on the {spec}-only and cartesian paths and when the engine threw. Cartesian NA exposure is OUT (decision 8 — it would move clause-(i) bytes). Controls: RED 16/88 on a scratch copy with the old loop, GREEN 88/88; schema withheld → data-operand 6 / echarts-accuracy 14 / echarts-determinism 8 / warn-first 33 red, contrast-fault + accuracy-fault green; spec-only-bytes 32/32 with zero note additions and one declared reword; viz-core MATRIX byte-unchanged, 14/14; live on :4466 the MarkSankey operand case returns 10 entries (each precondition named), the no-data call has no key. The expectations are FIXTURE-derived and engine-cross-checked, not matrix-copied: force_graph's R-14 fires on the certify fixture (9 NA) while it is n/a in viz-core's.

**C4 (a cartesian-only claim the promise sweep missed).** `echarts-primary.ts:76` still said "the a11y-equivalence path is still cartesian-only" — false for certify since s172 and falsified by this sprint's own m01. Corrected: certify evaluates the 16 rules warn-first on ECharts-primary with the operand; only the render-side GATE (`viz.render.ts:254` short-circuits before it) and the certified verdict remain cartesian. The three render-gate test titles now name the RENDER-SIDE GATE scope. Residue recorded with reasons in the s175 m03 decision (certify.ts:549 coverage sentence, registry.ts:185, the spec-only-bytes baseline keys, expectations.ts:29, data-analysis.ts:69).

**C7 (R-05 / R-12 provenance).** Decision #1476 and the `equivalence-rules.ts:21-23` comment claimed all eleven declared preconditions were pre-existing guards. `git show 0e251e5` shows R-05's `if (!x && !y)` and R-12's `boundFields === 0` as pure `+` hunks (grep -c = 1 and 1, matching `-` lines = 0): s174 m01 ADDED those two; the other nine were one-line `pass()→notApplicable()` swaps. The non-mover conclusion stands (both implicit passes already returned `passed:true`). Corrected by a dated s175 decision citing #1476 and 0e251e5, and by amending the comment (comment only; hunk `@@ -19,8 +19,12 @@`, nothing in `:115-375` moves).

Next-steps #1230, #1231, #1233 closed with m03. The s174 §7.2 declared-movement census is unchanged by this: the three carries were defects of this sprint's record, not of its byte ledger.

### 8.3 Closeout omissions — test:scale and verify:brand-cascade (m06, 2026-08-22)

The §7 gate table (21 rows) neither ran nor recorded two criteria of `cmos/foundational-docs/quality-bars.md` that are closeout-LOAD-BEARING: `pnpm --filter @oods/mcp-server run test:scale` (the scale-determinism suite, 4 files / 62 tests; decision #678 made it a closeout criterion after the sprint-105/106/107 streak) and `node scripts/quality/brand-cascade-browser-proof.mjs` (= `verify:brand-cascade`, the s168 m06 rendered-surface proof; 246 computed-style assertions across 6 brand×theme cells). Both were absent from the s172, s173 and s174 tables (grep over the three memos: zero hits). The root cause, found at the s174 review: the quality-bars criteria are supposed to live in the closeout mission's successCriteria, and the closeout missions of s172–s174 carried successCriteria = null, so nothing enumerated them. Corrected in s175: the two rows are restored to the gate table (memo §1f.2) and s175-m06 carries literal successCriteria. This block corrects the record; it does not change any s174 verdict (both suites were green at the s174 HEAD when re-run by the s175 grounding on 2026-08-22, and the s174 review had already noted the dropped rows).
