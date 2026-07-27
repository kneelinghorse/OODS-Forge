# Sprint-164 — Narrated-Value Corrective #5 — RATIFIED SSOT Decision Memo (LOCKED 2026-07-23)

> Status: **LOCKED.** Corrective for the s163 genuine-close review NOT_GENUINE_CLOSE (PS-2026-07-23-008). Design validated across THREE adversarial pre-lock critics (v1 `wf_53fc592f-529`, v2 `wf_5f62816a-a85`, v3 `wf_cccdfd93-3d3`): v2 PROVED the magnitude-floor approach infeasible; v3 confirmed the DIMENSIONLESS foundation and hand-corrected the spec (all 5 v3 blockers + 6 amendments folded below). **Derek ratified (2026-07-23, AskUserQuestion ×3):** the honesty rule = **"silent on ANY real opposite"** (dimensionless; supersedes the infeasible noise-floor answer); and the close-out path = **lock the validated design + hand to a fresh build session, RED-first against the enumerated fixture set, with the genuine-close review as the backstop.** §10 correctness is validated by the FIXTURES + the genuine-close reviewer, NOT by the rule-14 assert alone (§3, honest scoping). Two edge-case honesty calls are flagged for in-build confirmation (§11).

---

## §0 — Why

s163 proved a structural PROXY (cell-key fineness) not the direct drawn-marks property → phantom (9th miss). v2 proved a MAGNITUDE proxy (Δ/range) is ALSO a proxy and UNBOUNDED (the between-group separation that creates the Simpson inflates the yardstick). The direct property is **DIMENSIONLESS**: does a visually-separable drawn sub-series genuinely correlate opposite the narrated direction (its own |pearson|, bounded [0,1], scale-invariant). s164 asserts THAT (rule 14).

## §1 — Grounded defects (live at `ae6c0dc`; 3 reproduced + 5 critic-surfaced members of the same class)

`classifyGroupDirection` ([data-analysis.ts:1498](../../packages/viz-core/src/a11y/data-analysis.ts#L1498)) POOLS each partition group's cells into one direction (never decomposing by `groupingFields`; `correlationPartitionFields` :1262 skips quantitative). All narrate a defined correlation over drawn sub-series that fall.

1. **Bubble, discrete quant size** → 0.17; `scratchpad/S163REV_skeptic_detail.mjs`.
2. **Quant detail MarkLine/avg** (n=2 bands) → 0.889; `scratchpad/S163REV_detail_agg.mjs`.
3. **Bubble color+size** → 0.889; `scratchpad/S163REV_detail_size_generalization.mjs`.
4. **Continuous quant size, between-partition** — s163 ALREADY suppresses this (keep-control, not a new phantom); `scratchpad/S164CRIT_fallback_regression.mjs`.
5. **Grouping, NO categorical partition** — size-only, bands r=−1 n=3 → early-return narrates 0.93; `scratchpad/S164CRIT_claimscope.mjs`.
6. **Strong-separation Simpson** — bands r=−1 far apart; magnitude narrates, dimensionless catches; `caseA` (`S164V2_magfloor.mjs`).
7. **Two grouping axes** — finest shreds, middle `(seg,size)` bands r=−1; `scratchpad/S164V2_cascade_middle.mjs`.
8. **Pooled sign ≈ 0** — one band rises, one falls, pooled 0 → old sign test blind; `CASE6`.
9. **Nested-Simpson H1** — coarse falling band, finer slices rise: RED under "coarsest-S", GREEN under "collect-every" (v3 blocker-1). Build fixture.

## §2 — Missions (m0 memo done-at-lock; DAG m0→m1→m2; Requires-linear)

- **m0 — this memo** (COMPLETED at lock).
- **m1 — the direction gate (§10): dimensionless "any real opposite" + full-lattice COLLECT-EVERY + contradiction-first G1.** RED-first (→ `undefined`, the s164 change flips these vs s163): defects 1–3 (`S163REV_*`), 5 (`S164CRIT_claimscope`), 6 (`caseA`), 7 (`S164V2_cascade_middle`), 8 (`CASE6`), 9 (nested-Simpson H1), + the disjoint-x all-flat fixture (§10 clause-3). **Keep-suppressed non-regression control (GREEN/undefined in BOTH shipped AND reverted states — s163 already suppresses it):** defect 4 (`S164CRIT_fallback_regression`). **Keep-controls → NARRATE:** all-rise; `CASE3-FLAT` (rise + one exactly-Δ=0 band); an **n≥3** weakly-scattered opposing band `|r|<ρ` with no finer axis splitting it to n=2; genuine continuous ramp (narrates via G1's no-opposition path, §10 residual-2); honest rise with **NO local opposite at ANY granularity** (no n=2 down-pair, no `|r|≥ρ` down-band). Proof spec `correlation-drawn-mark-direction-s164.spec.ts` + the rule-14 assert (§3) + a **mutation gate** proving the "coarser-skip" (coarsest-S) variant flips CASE6/skeptic_detail/claimscope back to RED, and the n=2-Δ-gate variant is rejected.
- **m2 — claim re-scope (§4/§7) + rule 14 + THREE disclosed residuals + closeout.** CHARTER-DIFF, baselines, dual-path (dist + :4466), pm2 restart.

## §3 — Rule-14 assert (honestly scoped — v3 blockers 3 & 4)

- **Operand (a) = EXPLICIT full-lattice independent oracle:** enumerate subsets S of `narratedValueCellKey(spec)`'s fields (= `drawnCellKeyFields` minus dim, sourced DIRECTLY), key each drawn sub-series by S, take the coarsest S reaching n≥2, apply the SAME dimensionless opposition rule vs `pooledSign`. **MUST NOT import/call `classifyCorrelationGroups`, `correlationGroupingFields` (:1288), or `correlationClassifierActualKey` (:1545)** (charter-diff pin). Operand (b) = the SUT decision.
- **HONEST SCOPE (disclosed, §7/§8):** this oracle validates **SUT-matches-§10** (call-site drift; independent code path, shared `drawnCellKeyFields` SOURCE only) — it does **NOT** validate **§10-correctness**, which rests on the RED-first FIXTURES + the genuine-close REVIEWER as the explicit residual (an independent full-lattice oracle that fully checked §10 would re-encode §10 = the rule-13a tautology; we deliberately do not).
- **Bite-reversion (pinned, RED set corrected):** at the `classifyCorrelationGroups`/`deriveCorrelation` CALL SITE, swap the new per-sub-series vote for the OLD pooled `classifyGroupDirection`; assert goes **RED on defects 1–3, 5, 6 (caseA), 7 (cascade_middle), 8 (CASE6)**; **defect 4 stays GREEN/undefined in both states** (s163 already suppresses it — it is a non-regression control, NOT a bite fixture).
- **Stacking is OUTSIDE the assert's checked set** (`drawnCellKeyFields` drops color under stacking :451-455), covered by the F5 G0/contradiction-first regression pin (`S164CRIT_multiaxis_stacking.mjs`); §7 enumerates it separately as pin-covered-not-assert-covered.

## §4 — Honest claim ceiling (pre-written; m2 may not exceed it)

Direct property (Derek-ratified "silent on any real opposite", dimensionless): **honest iff NO visually-separable drawn sub-series — at ANY granularity `(P∪S)`, `S⊆groupingFields`, where it reaches n≥2 (§10 COLLECT-EVERY) — GENUINELY opposes `pooledSign`, where "genuinely opposes" = `sign(slope)===−pooledSign` AND (n≥3 with `|pearson|≥ρ`, OR n=2 non-flat).**

**Closed for (each Simpson entry qualified `(opposing bands |r|≥ρ, or any n=2 opposing pair)`):** {non-aggregate cartesian; declared-aggregate; quant-grouping Simpson with a categorical partition (discrete/continuous, 1 or ≥2 axes); quant-grouping Simpson with NO partition; strong-separation Simpson; nested Simpson; pooled-sign≈0}.

**THREE disclosed residuals:**
1. **Dimensionless ρ gray-zone (BOUNDED, n≥3 only).** An **n≥3** sub-series opposing with `|pearson|<ρ` narrates — bounded [0,ρ), scale-invariant (does NOT grow with separation; the v2 τ residual was unbounded). **At n=2 the |r| gray-zone does NOT apply** (|r|=1 degenerate): any non-flat n=2 sub-series votes its slope unconditionally.
2. **Truly-continuous all-distinct ramp** narrates via G1's no-opposition path (the whole-chart S=∅ series is votable and agrees pooledSign, finer S shred → E={pooledSign}). "Fallback" (§10) is only the degenerate <2-distinct-x-everywhere case.
3. **Over-suppression under the strict rule (fail-safe-to-silence, CORRECT-by-ratification, NOT bounded).** Any chart with a genuine n=2 opposing pair OR an n≥3 `|r|≥ρ` opposing sub-series at ANY of the 2^k grouping granularities is SILENCED — the count grows 2^k with grouping axes. Per Derek this SUPPRESS is correct; disclosed as a first-class product consequence (an honest overall rise containing local 2-point dips gets no correlation sentence; the narrative still describes ranges/highs/lows). Do NOT reintroduce a magnitude/Δ gate on the n=2 branch (the infeasible v2 τ).

**F8 dispositions:** geo/non-cartesian → not emitted, N/A; n=2 slope-sign → COVERED (n=2 always votes; fixture defect-2); dashboard-narrative KPI path vs a Simpson → DISCLOSED out-of-scope.

Correlation remains ONE mechanism; guard arm derivation-shared, bites call-site drift only.

## §5 — Standing rules (s163 §5 rules 1–13b VERBATIM + NEW rule 14)

- Rules 1–13b carried verbatim.
- **NEW rule 14 (Derek-authorized 2026-07-23).** A narrated-value honesty fix must assert a **DIRECT property over the DRAWN MARKS**, not a structural PROXY (cell key, partition set, **or a magnitude/range proxy** — proven UNBOUNDED at v2). The honest signal for "does a viewer see an opposing trend" is **dimensionless** (the sub-series' own correlation strength), scale-invariant. Corollary 1: a pre-lock critic must check the DIRECTION vote AND the fallback/early-return/granularity, per channel. Corollary 2 (monotonicity): documented structural expectation, **NOT a bite-proven assert** (the G0∨G1 form is a by-construction tautology; G0 re-projects over groupingFields so a discrete axis can flip a class sign via the s162 count-weight inversion; not counted toward §7 closure). Corollary 3 (v3): when an independent assert CANNOT validate correctness without re-encoding the SUT (tautology), scope it to drift-detection and name the FIXTURES + genuine-close REVIEW as the explicit correctness residual — do not overstate the assert's bite.

## §6 — Charter-diff amendments (line-item — SHIPPED, base HEAD `ae6c0dc`)

Every pin grep-verified at mission-complete (§5.1). All in [data-analysis.ts](../../packages/viz-core/src/a11y/data-analysis.ts):

- **`CORRELATION_OPPOSITION_RHO = 0.5`** (:1405) — the dimensionless floor (LOCKED). NEW.
- **`subsetsOf<T>`** (:1409) — the powerset for the full-lattice scan. NEW.
- **`classifyDrawnSeriesDirection`** (:1427) — the G1 vote: same finite-filter + n<2/vertical→`unknown` + n=2 covariance-slope as `classifyGroupDirection`, but the n≥3 vote is gated on `|pearson| ≥ ρ`. NEW.
- **`drawnSubSeries`** (:1462) — the per-`(dim ∪ S)` drawn cells, RE-DERIVING the sub key (`projectAggregatedRows` strips it) so cells bucket into sub-series; identity (raw rows) with no declared aggregate. NEW.
- **`correlationOppositionEvidenceOf`** (:1542) — the G1 gate: per-partition COLLECT-EVERY over every `S ⊆ groupingFields`; manufactured-vote guard admits the `S=∅` band only when the group has NO votable finer band; contradiction-first decision. NO-OP (`suppresses=false`) when `groupingFields=[]`. NEW.
- **`deriveCorrelation`** rewire — the early-return narrowed to `partitionFields=[] ∧ groupingFields=[]` (:1662); the decision composes `g0Narrates && !g1Suppresses` (:1689). The G0 path (`correlationPartitionFields` / `correlationGroupingFields` / `classifyCorrelationGroups` / `narratableCorrelation`) is UNCHANGED.
- **`correlationOppositionEvidence`** (export, :1816) — the off-barrel drift-assert surface. Grep-verified ABSENT from [a11y/index.ts](../../packages/viz-core/src/a11y/index.ts) (relative-import proof only, not public API).
- **Proof spec** [correlation-drawn-mark-direction-s164.spec.ts](../../packages/viz-core/src/a11y/correlation-drawn-mark-direction-s164.spec.ts) — 41 tests.
- **§3 operand-(a) charter-diff pin HELD:** the spec imports ONLY `narratedValueCellKey` (the value source) + `correlationOppositionEvidence` (the SUT surface); it imports NEITHER `classifyCorrelationGroups`, `correlationGroupingFields`, NOR `correlationClassifierActualKey`. Operand (a) [oracle] and operand (b) [SUT] therefore share only the `drawnCellKeyFields` SOURCE, never the classifier grouping.

**Deviation from §3 wording (surfaced, not silent — Rule 7):** §3's operand-(a) prose says "take the coarsest S reaching n≥2." That is the READING v3 blocker-1 REJECTED (coarsest-S ships the nested-Simpson phantom); it is stale from before §10 locked COLLECT-EVERY. The shipped oracle uses COLLECT-EVERY per §10 and is scoped to the DIRECT rule-14 property (does an independent value-keyed full-lattice scan find a real dimensionless opposite). Reconcile §3's prose with §10 in the next revision.

## §7 — Closeout GENERATED from the honestly-scoped assert + fixtures + review (within §4)

m2 generates the closure clause from: the INDEPENDENT drift assert's checked set (SUT-matches-§10) ∪ the RED-first fixture results (§10-correctness evidence) ∪ the THREE bounded/disclosed §4 residuals ∪ the F8 dispositions ∪ the SEPARATELY-enumerated F5 stacking pin. It states the direct property, names all three residuals, and uses NO cell-key/partition-set/magnitude phrasing. It does NOT claim the rule-14 assert proves §10-correctness (it proves drift only).

## §8 — Critic history + resolutions

- **v1 (3 blockers)** → superseded.
- **v2 (τ infeasible; binary cascade; pooled-0)** → RESOLVED: dimensionless |r|≥ρ; full-lattice COLLECT-EVERY; contradiction-first G1.
- **v3 blocker-1 (coarsest-S ships phantom)** → RESOLVED: §10/§4 specify COLLECT-EVERY (union over all P and all S, no coarser-ancestor skip); nested-Simpson H1 + coarser-skip mutation gate.
- **v3 blocker-2 (all-flat-offset disjoint-x)** → RESOLVED: §10 clause-3 generalized (below); disjoint-x fixture RED-first; false "G0 blind-spot-free" claim dropped.
- **v3 blocker-3 (assert can't validate correctness without tautology)** → RESOLVED: §3 honest scoping (drift-only; fixtures+review = correctness residual).
- **v3 blocker-4 (defect-4 reversion false)** → RESOLVED: defect-4 reclassified as keep-suppressed non-regression control (§2-m1, §3).
- **v3 blocker-5 (clause-3 dead + over-suppress no-grouping)** → RESOLVED: G1 is a NO-OP when `groupingFields=[]` (defer to unchanged G0); clause-3 flatness epsilon `|r|<0.05` (≪ρ); §8 F3 updated.
- **F5 stacking → CLEAN + PINNED** (`correlationGroupingFields=∅` under stacking :1296).
- **F3 → CLEAN** (G0 = the ENTIRE `narratableCorrelation` :1388-1396, UNCHANGED; no-grouping byte-identical to s163 because G1 no-ops when `groupingFields=[]`).

## §9 — Handoff

Build in a SEPARATE fresh session, RED-first from the fixtures (§2 m1). Genuine-close review is ANOTHER separate session and is the correctness backstop (§3). Baselines: viz-core **1041** + delta / mcp 3978 / root 4638 / scale 62 / tokens 322. #818 stays GATED on a GENUINE close.

## §10 — Direction-gate algorithm (LOCKED)

`pooledSign = sign(pooled pearson over all drawn cells)` (narrated value; unchanged; may be 0). Suppress iff EITHER:

**(G0) — the ENTIRE existing `narratableCorrelation`, UNCHANGED** (contradiction-first Set>1 :1388-1390 + Simpson-reversal + all-flat pooled-0 :1391-1396). **G1 is a NO-OP when `groupingFields=[]`** → no-grouping specs are byte-identical to s163.

**(G1) — DIMENSIONLESS "any real opposite", contradiction-first, full-lattice COLLECT-EVERY** (active only when `groupingFields≠[]`): for each categorical partition group P (or the whole chart as one group when `partitionFields=[]`):
  - **COLLECT-EVERY:** for EVERY subset `S ⊆ groupingFields`, key sub-series by `(P∪S)`; collect the vote of EVERY `(P∪S)`-keyed sub-series with **n≥2 distinct x** into `E` (union over ALL P and ALL S — **no coarser-ancestor skip**; finest-backoff exists ONLY to avoid n=1 shredding, never to skip a votable coarser band).
  - **Opposition (dimensionless):** a votable sub-series OPPOSES iff `sign(slope)===−pooledSign` AND (**n≥3:** `|pearson|≥ρ`; **n=2:** non-flat, votes its slope unconditionally). Flat (n≥3 `|r|<ρ`, or exactly Δ=0) → direction 0.
  - **MANUFACTURED-VOTE GUARD (v3 blocker-2):** the `S=∅` whole-group over-x aggregate of a group that SPANS MULTIPLE grouping bands does NOT cast a between-band-offset vote; between-band-offset votes are sourced from `|S|≥1` keyed bands only.
  - **Contradiction-first decision:** suppress if `Set(non-flat votes in E).size > 1` OR any `e === −pooledSign` OR (**pooledSign≠0 AND no `|S|≥1` band at the finest votable granularity genuinely shares pooledSign** — the all-flat-offset / disjoint-x artifact; generalized from the dead "Set(E)={0}" clause). Blind-spot-free at `pooledSign=0` (two opposite bands → `Set>1` → suppress).

**Early-return:** pooled narrates ONLY when `partitionFields=[]` AND `groupingFields=[]`.

**Fallback:** the degenerate `<2-distinct-x-everywhere` case only (a continuous ramp narrates via the G1 no-opposition path, §4 residual-2 — NOT the fallback).

**ρ (dimensionless, LOCKED window ~0.3–0.6, pinned value ρ=0.5):** two-sided — a visible stepped/cliff opposing band `|r|≈0.65` MUST suppress (ceiling ρ≤~0.6); a scattered opposing band `|r|≈0.3` MUST narrate (floor ρ>~0.3). ρ=0.5 is a **conservative separator with a KNOWN, disclosed, bounded [0,ρ) n≥3 gray-zone** (§4 residual-1); the build pins it with the two-sided fixtures (`S164V3_rho_grayzone.mjs` cliff-band + scatter-band) and may adopt a principled anchor (r² variance floor / per-n significance) if one proves cleaner.

**Monotonicity:** documented expectation only, NOT a proven assert (§5 rule 14 corollary 2).

## §11 — Flagged for in-build confirmation (Derek-aware; resolve in build, surface at review)

1. **All-flat-offset disjoint-x** (§10 manufactured-vote guard): resolved as SUPPRESS (no drawn band actually trends the narrated direction, so "strong positive" would be manufactured from between-band offset). Consistent with rule 14 (no drawn sub-series shows the narrated trend), though there is no OPPOSITE per se — flagged because it extends "silent on any real opposite" to "silent when no drawn band shows the trend either." Confirm at review.
2. **ρ = 0.5 exact value** (§10): a conservative separator with a bounded n≥3 [0,ρ) gray-zone; the build proves the window with the two-sided fixtures. If a principled statistical anchor is cleaner, adopt it. Confirm the gray-zone is acceptable at review.
3. **Over-suppression consequence (§4 residual-3):** the strict rule silences any chart with a local n=2 dip or `|r|≥ρ` down-band, growing 2^k with grouping axes. Ratified as correct (fail-safe-to-silence), but a real product cost — if in-practice silencing is too aggressive, revisiting the n=2 handling is a FUTURE tuning (NOT via the infeasible magnitude gate).

---

## §12 — BUILD SHIPPED (m1) + the GENERATED closeout (m2). NOT self-certified.

**m1 shipped 2026-07-23** (§6 line-items). The direction gate now decides `narrate iff (G0 narrates) AND (G1 narrates)` = "suppress iff EITHER" (§10). **G0** is the UNCHANGED s163 per-partition-group gate; **G1** is the new dimensionless full-lattice decomposition. G1 no-ops when there is no grouping axis, so a no-grouping chart is byte-identical to s163.

### §11 resolutions (confirmed in build; surface at review)
1. **All-flat-offset disjoint-x → SUPPRESS: CONFIRMED.** Fixture `disjoint-x all-flat` (two flat bands at disjoint x, pooled rises) → `undefined` via clause-3 (`pooledSign≠0 ∧ no admitted band shares the pooled trend`). The manufactured-vote guard admits `S=∅` ONLY when the group has no votable finer band — the same guard that lets a continuous ramp (all finer bands shred to n=1) keep its `S=∅` vote and NARRATE (residual-2). This is the ONLY reading that satisfies both ratified outcomes; the literal "spans multiple bands" reading would have mis-suppressed the ramp.
2. **ρ = 0.5 window: PINNED two-sided.** Fixture `ρ cliff` — a `[100×5,0]` opposing band `|pearson| = 0.655 ≥ ρ` → SUPPRESS. Fixture `ρ scatter` — an opposing band `|pearson| ≈ 0.3 < ρ` → NARRATE. The n≥3 `[0,ρ)` gray-zone is bounded and disclosed (residual-1).
3. **Over-suppression cost: CONFIRMED, ratified.** Fixture `F4c` (honest rise + one thin dipping slice) → `undefined`; the `n=2 opposing band` fixture proves a single n=2 down-pair amid a sharing band silences the whole coefficient. Disclosed product cost (residual-3), NOT a bug.

### §7 — Closeout clause (GENERATED; states the direct property; no cell-key / partition-set / magnitude phrasing)

A narrated correlation is **honest iff no visually-separable drawn sub-series genuinely opposes the pooled direction** — where a sub-series is any `(categorical-partition ∪ grouping-subset)`-keyed set of drawn marks reaching ≥2 distinct x at ANY grouping granularity, and "genuinely opposes" is **dimensionless** (n≥3: its own `|pearson| ≥ ρ`; n=2: its slope sign). This is the DIRECT drawn-marks property (Rule 14), not a structural or magnitude proxy.

**Closed** (each qualified `(opposing bands |r|≥ρ, or any n=2 opposing pair)`): the within-partition Simpson on a QUANTITATIVE grouping axis — bubble size, a color ramp, a quantitative detail (defects 1–3); a quantitative-grouping Simpson with NO categorical partition (defect 5); a strong-separation Simpson (defect 6, incl. shallow perfect-fall bands a magnitude floor would miss); a nested Simpson whose coarse falling band's finer slices rise (defect 9, needs COLLECT-EVERY); a pooled-sign≈0 chart with opposing bands (defect 8); a two-quant-axis Simpson; and the all-flat-offset/disjoint-x artifact. The between-partition Simpson, stacking Simpson, and declared-aggregate raw-vs-drawn phantom stay closed via the UNCHANGED G0 (defect 4, F5 — proven non-regressed).

**Evidence of correctness** = the 41 RED-first FIXTURES (every defect → `undefined`; every keep-control → defined) + the genuine-close REVIEW (a SEPARATE owed session). The rule-14 DRIFT assert validates SUT-matches-§10 (call-site drift) ONLY — it does NOT prove §10-correctness (that would re-encode §10 = the rule-13a tautology, deliberately avoided, §3).

**THREE disclosed residuals:** (1) the bounded n≥3 `[0,ρ)` gray-zone — a scattered opposing band below the floor narrates; scale-invariant, does NOT grow with separation. (2) a truly-continuous all-distinct ramp narrates via G1's no-opposition path (its finer bands shred to n=1, its whole-chart series is the genuine drawn signal). (3) over-suppression / fail-safe-to-silence — any chart with a genuine n=2 opposing pair or an n≥3 `|r|≥ρ` opposing band at ANY of the 2^k granularities is silenced (Derek-ratified correct, disclosed product cost).

**F8 dispositions:** geo/non-cartesian → not emitted (N/A); n=2 slope-sign → COVERED (n=2 always votes; fixtures `defect2`, `n=2 opposing band`); dashboard-KPI path vs a Simpson → out-of-scope. **F5 stacking → CLEAN + PINNED** (`groupingFields=∅` under stacking → G1 no-ops; G0 suppresses; fixture `F5`).

### Gate — GREEN + EXACT
viz-core **1082** (1041 + 41 owned) · mcp-server 3978 · root core 4638 · scale 62 · tokens 322 · viz-core + root typecheck PASS · `pnpm install --frozen-lockfile` clean · ZERO owned golden (#564).

**Mutation gate** (cp-restore, §5): (A) neuter G1 → 21 RED (bite-reversion; defect-4/F5/keep-controls stay GREEN). (B) coarsest-S (`subsets=[[]]`) → 25 RED incl CASE6 / skeptic_detail / claimscope / **nested-Simpson** (COLLECT-EVERY proven required). (C) an n=2 Δ-magnitude gate → the `n=2 opposing band` fixture RED (the infeasible v2 τ on the n=2 branch is REJECTED). All restored → 41/41.

**Dual-path LIVE:** dist-import — a control narrates `0.998` "strong positive relationship"; every defect is `undefined` ("plots … averaging"). Bridge `:4466` — restarted on the rebuilt dist (`pm2 oods-forge-bridge`), a defect `viz_render(includeA11y)` emits no relationship claim.

**NOT self-certified.** The adversarial genuine-close review is a SEPARATE owed session; #818 accuracy BUILD stays GATED on a GENUINE close. Streak s154 G → … → s163 NG → **s164 ?**.
