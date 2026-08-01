# s165 — PATH 1: render-truth separability for the narrated correlation

**Status:** LOCKED 2026-07-24. Derek ratified PATH 1 (direction) + two forks (§7). Amended per the hardened
pre-lock critic `wf_381797c9-7a5` (6 lenses, ALL returned BLOCK; 31 defects / 12 blockers; amendments A1–A12
folded below). **Build = a SEPARATE fresh session, RED-first. Genuine-close review = ANOTHER separate session.**
**Predecessor SSOT:** `forge-viz-s164-narrated-value-corrective5-decision-memo.md`
**Origin:** s164 genuine-close review PS-2026-07-24-002 / `wf_51c2c340-b08` (NOT_GENUINE_CLOSE, 10th consecutive).

> **THE CRITIC CAUGHT A WOULD-SHIP-A-PHANTOM IN THIS DRAFT (now 8-for-8).** The pre-amendment draft
> (a) did **not** kill survivors A and B, (b) manufactured an **11th phantom** via an edit it wrongly claimed was
> monotone, and (c) missed a **4th live survivor**. All three are corrected below. Nothing here is built yet.

---

## §1 The problem

Honesty property (rule 14, unchanged):

> A narrated correlation must not contradict the direction of **every visually-separable drawn sub-series**.

s164 correctly named this DIRECT property and its machinery is honest (41/41 proof spec, neuter→28 RED,
independently-sourced drift oracle). It still shipped phantoms because:

> s164 asserts the direct property over a **structurally-reconstructed** sub-series set — the proxy did not get
> eliminated, it **moved** from the *invariant* (s163) to the *enumeration of sub-series* (s164).

### The FOUR confirmed survivors (all live at HEAD 8297cc6, all main-loop reproduced)

| # | Sev | Mechanism | Narrates | Drawn band | Repro |
|---|-----|-----------|----------|-----------|-------|
| **A** | CRIT | `shape` on a layered/`"mixed"` mark. `shape` is the only retinal channel mark-gated by `markSplitsByRetina` in BOTH `seriesGroupingFields`(:393) and `correlationPartitionFields`(:1265); `resolveMark`(:701) collapses 2-mark specs to `"mixed"` → dropped from both gates. | `0.79` | two bands @ −1.0 | `S164GC_MAINLOOP_verify.mjs` |
| **B** | CRIT | Quantitative **color ramp** on a sum-**stacked** bar. Stacking drops `seriesGroupingFields` → `groupingFields=∅`; partition skips quantitative → `partitionFields=∅`. Both pool. | `1` | c-band @ −1.0 | `S164GC_MAINLOOP_verify2.mjs` |
| **C** | HIGH | Categorical partition **collinear with x** + quantitative `size` Simpson. Partition-prefixed scan → every group single-x → nothing votable → fallback narrates. Series shattered across partitions, never re-combined. | `0.26` | sz=1 band @ −1.0 | `S164GC_MAINLOOP_verify2.mjs` |
| **D** | CRIT | **Per-layer bindings.** `resolveBinding`(:804) returns the FIRST mark carrying a channel; `toVegaLiteSpec` compiles **one layer per mark**. `marks=[MarkLine{color:seg}, MarkPoint{color:grp}]` really draws BOTH — the layer-1 splitter is invisible to every gate. | `0.79` | two `grp` bands @ −1.0 | `S165_MAINLOOP_survivorD.mjs` |

**D was found by this critic pass and independently main-loop verified** (compiled layer colors = `["seg","grp"]`;
control with `grp` as sole color → `undefined`). Any closeout claiming a 3-survivor close would have been a
claim-scope failure on a 4-survivor class.

**A, B, D are COVERAGE failures; C is an ORDERING failure.** A coverage-only fix leaves C; an ordering-only fix
leaves A/B/D.

---

## §2 Design posture — direction of error

Runtime compile-and-inspect is REJECTED: `analyzeVizSpec` is pure spec→analysis, and **separability is
renderer-divergent** (Vega-Lite splits on `detail`; the ECharts adapter routes `detail` to tooltip only,
`echarts-adapter.ts:417-419`, and uses `colorBy:'data'`, :319). There is no single render truth.

Instead: a **fail-safe SUPERSET** of separable fields. It can only over-suppress (disclosed silence) and never
under-suppress (a phantom). Every error in s159→s164 fell toward narration; this inverts that.

> **RULE 15 (new, SCOPED per A4):** when a gate must reason about a property it cannot observe directly, derive a
> **fail-safe SUPERSET** and prove the direction of error. **Scope: the FIELD DERIVATION only.** Decision-level
> direction of error is *not* asserted — it is machine-proven by the §5 monotonicity oracle. *(The pre-amendment
> draft asserted it for the composed gate; the critic falsified that — see §3.2.)*

---

## §3 The fix

### §3.1 `separableFields` — the fail-safe superset (correlation gate ONLY)

Every field that COULD split drawn marks. Fail-safe: default separable.

| Source | Rule | vs today |
| --- | --- | --- |
| binding resolution | **union over `spec.encoding` ∪ EVERY `spec.marks[i].encodings`, per channel** — mirrors the adapter's per-layer merge. **NEVER `resolveBinding`** (A5). | **Kills D** |
| `color` | always — categorical **and** quantitative | **Kills B's partition-skip** |
| `shape` | **UNCONDITIONALLY separable** — no mark gate at all (A7) | **Kills A**; removes the only non-fail-safe rule, the `[MarkBar,MarkRect]` hole, and the oracle's unsound-xor-vacuous dilemma |
| `size`, `detail` | always | detail over-suppresses on ECharts = honest |
| facet rows/columns | always | panels |
| positional axes ≠ primary dimension, ≠ measure channel | always | second positional |
| stacking | **drops nothing** | **Kills B** |

Excludes the primary dimension and measure field. **Rejected:** the draft's `knownNormalizedMarks.some(...)` gate
— self-contradictory (`knownNormalizedMarks` filters `'unknown'`, so `.some()` is false for exactly the case the
same sentence called always-separable) and it broke the §4 oracle.

### §3.2 Composition — **UNION, never REPLACE** (A2/A3/A6; the single most important correction)

```
narrate  iff  G0 narrates
         AND  NOT G1_s164 (UNCHANGED: partition-prefixed, subsets of groupingFields, all 3 clauses, per-group guard)
         AND  NOT G1′     (NEW: unprefixed, subsets of separableFields, clauses (a)+(b) ONLY)
```

**Why not replace (the critic's blocker, 5 lenses, 4 fixtures):** clause (c)
(`suppresses = pooledSign!==0 && !sharesPooled`) is **negative evidence and therefore ANTI-monotone** — adding
bands can turn suppression OFF. Unprefixed, s164's deferred `S=∅` vote reappears as `S={seg}` (`|S|≥1`), escapes
the manufactured-vote guard (whose `subset.length===0` marker is purely *syntactic*), sets `sharesPooled=true`,
and disarms clause (c) → the shipped s164 RED-first fixture `rowsDisjointFlat` goes **`undefined` → narrates
0.894**. A disjunction of suppressors is monotone **by construction**, which is what the design actually needs.

**G1′ constraints:**
* clauses **(a) votes span >1 sign** and **(b) any vote = −pooledSign** ONLY. **No clause (c); G1′ votes never
  feed `sharesPooled`.** Clause (c) is an artifact detector calibrated to the value's own cell decomposition —
  it stays in the retained s164 arm.
* **Incoherent-band rule (A6):** in G1′ only, a band keyed by `S` whose members disagree on some field in
  `separableFields \ S` must have **≥3 distinct x AND pass the ρ=0.5 floor** to vote. This kills the manufactured
  cross-series n=2 votes that silenced honest bubble charts. A/B/C/D all have n≥3 opposing bands → unaffected.
  The n=2 unconditional-slope rule stays intact in the prefixed arm. **Disclosed (§6):** an n=2 cross-partition
  opposite is now un-votable in G1′ — an error toward narration, named not hidden.

### §3.2b The early return must move (A1) — *the defect that would have shipped A and B unchanged*

`deriveCorrelation:1662` `if (partitionFields.length===0 && groupingFields.length===0) return pooled;` runs
**before both gates** and is TRUE for A and B (both derivations empty). Re-gate to:

```ts
if (partitionFields.length === 0 && groupingFields.length === 0 && separableFields.length === 0) return pooled;
```

Verified behaviour-preserving for G0 on 42/42 shipped corpus specs (when `partitionFields=∅` then
`groupingFields === narratedValueCellKey`, so both empty together; the single-group re-projection pools the same
cells the value pools → `classes=[sign(pooled)]` → G0 narrates). **Rule 13b — classes newly falling through, to
be enumerated and fixture-pinned:** (a) shape on a non-splitting/collapsed mark, (b) a stacking aggregate with no
facet and no categorical retinal, (c) a quantitative-only retinal under stacking.

### §3.3 / §3.4 Unchanged

G0 (`narratableCorrelation` + `classifyCorrelationGroups`) stays byte-identical — **but `:1662` is not G0** and
must move per §3.2b. `drawnCellKeyFields` / `narratedValueCellKey` are **NOT touched**: the narrated VALUE and
#564 rendered bytes do not move; only the decision to *emit* gets stricter. (All 6 lenses confirmed: zero corpus
damage, zero byte movement, the guard twin inherits G1′ automatically via `expectedNarratableCorrelation`.)

### §3.5 Layered posture — **DEREK-RATIFIED: fail-safe suppress**

When the spec's marks bind **more than one distinct measure field**, or **any mark carries its own `from`
dataset**, the correlation gate **SUPPRESSES**. (`collectRows`:838 never even reads a second dataset's rows, so no
field-list derivation can cover this.) Two probes pinned as RED-first fixtures. No exception is carved into the
closeout claim.

### §3.6 Cost bounds (A10)

Measured on the draft: **4.4×** s164 at 20k rows; **2,184 ms** at 50k rows with a high-cardinality `detail`; and
the scan runs up to **4× per render**. Required: build drawn-cell buckets **once at the finest key and merge
upward** (no 2^k row-walks); **memoize** `deriveCorrelation` per `(spec, rows)` so `expectedNarratableCorrelation`
does not re-run it; cap `|separableFields|` with a deterministic argued order and **above the cap SUPPRESS
unconditionally** (dropping fields would be fail-safe in the *wrong* direction). Add a perf assertion at ≥10k rows
— the 1000-row scale tier cannot see this.

---

## §4 The independent-source oracle — honestly specified (A8)

`separableFields(spec) ⊇ compiledSplitFields(spec)`, where the right side is extracted by compiling through
`toVegaLiteSpec` (exported, same package).

* **Extractor = DENY-LIST** over compiled encoding channels (skip `x/y/x2/y2/tooltip/order/text/href/key`), pinned
  in the proof spec. An allow-list is blind to a new adapter channel (injected `strokeDash` → oracle GREEN).
* **DOMAIN pinned:** specs whose every mark trait is in `MARK_TRAIT_MAP`. `toVegaLiteSpec` **throws** on
  `MarkRule/MarkText/MarkArc/MarkGeoshape` (which `analyzeVizSpec` still narrates for) — the proof spec must
  **count and assert the skipped fixtures**, never swallow the throw.
* **Independence, honestly scoped:** the measure/dimension exclusion imports `resolvePrimaryChannels` and is
  therefore **shared** — the oracle asserts nothing about it. With §3.1's unconditional `shape`, the extractor
  stays ungated and shares no `markSplitsByRetina` derivation (that sharing would have been an s162-style
  tautology). The claim "a new splitting channel goes RED" is **deleted** — it is false under an allow-list and
  already a compile error via `CHANNEL_GROUPING_ROLE`'s exhaustive `Record`.
* **Disclosed vacuous pass:** an interaction with `bindTo:'visual' property:'color'` overwrites the compiled color
  encoding → the oracle passes vacuously.
* **Renderer coverage:** ONE renderer, and only the channel→field mapping. **ECharts coverage is ZERO, not
  partial** (no shape channel, `colorBy:'data'`, `detail`→tooltip) — the superset holds there a fortiori by
  argument, not by test.

The oracle validates the **superset relation**; it does **NOT** prove §3.2's decision logic. Correctness rests on
the RED-first fixtures + the §5 monotonicity oracle + the genuine-close review (rule-14 corollary 3).

---

## §5 Proof obligations (A11/A12)

**RED-first (`defined → undefined`):** A (`[line,point]`, `[point,bar]`, `[line,area]`) · B · C (+ variants: raw
measure, `detail` instead of `color`) · **D (per-layer color/detail/shape)** · §3.5 multi-measure + `from` probes.

**Keep-controls (must STAY narrating):** honest all-rise multi-series · single falling series · noisy honest rise
(r≈0.96) · continuous ramp · CASE3-FLAT · **`rowsWeakConsistentNoGrouping`** (the s164 "no ρ over-suppression"
test, currently 0.011) · an honest 3-series chart with every series r≈0.376 and nothing falling.

**STAYS-SUPPRESSED controls (new class):** `rowsDisjointFlat` (the fixture the draft would have reopened) · a
2-valued-partition twin · the guard-displacement instance · the full s162/s163/s164 suppression set.

**Monotonicity oracle (genuinely independent — one operand is the HEAD/dist decision, the other the new SUT):**
over corpus ∪ s162/s163/s164 fixtures ∪ a seeded random sweep, assert `s164_undefined ⇒ s165_undefined`. **Must be
proven to bite:** delete the retained s164 arm → `rowsDisjointFlat` RED.

**Reachability assert:** `correlationOppositionEvidence(spec).votes` is non-empty for each A/B RED-first fixture,
so the early-return short-circuit can never hide behind an `undefined`-vs-`undefined` pass.

**Mutation gate (each must bite):** (i) gate `shape` on any mark predicate → A fixtures **and** a `MarkBar+shape`
fixture RED · (ii) re-introduce the stacking drop → B RED · (iii) restore the partition prefix → C RED ·
(iv) neuter G1′ → the flip-set RED · (v) drop `color` from `separableFields` → §4 oracle RED · (vi) restore the
2-clause early return → A and B RED · (vii) revert per-layer union to `resolveBinding` → D RED.

**Call sites, line-item (A12):** `correlationGroupingFields` has FOUR consumers — `deriveCorrelation:1652` and
`correlationOppositionEvidence:1844` **take `separableFields`**; `correlationGroupDirections:1757` and
`correlationClassifierActualKey:1794` **keep `correlationGroupingFields`** (the s163 value-key fineness
invariant). Re-scope the s164 value-keyed decision oracle's claim to "the value-key axis only" and add a second
decision oracle keyed off `separableFields`, proven to bite when G1′ is neutered.

**Silencing gate — DEREK-RATIFIED (F1):** measure the newly-silenced rate on a bubble-chart corpus (categorical
color + quantitative size/detail) **with A5+A6 applied** — the combined corrections were never simulated. Pin the
number in §6.1. If it exceeds the ratified threshold, **fall back** to the narrow alternative for C only (keep the
s164 prefix but drop from it any partition field whose every group has <2 distinct dimension values; verified
C 0.262→suppressed, honest bubble chart still 0.056) **and re-scope §7's claim to that predicate's domain**.

**Gate baselines:** viz-core 1082 + owned delta / mcp-server 3978 / root core 4638 (named: `npx vitest run --project core`) / scale 62 / tokens 322 /
typecheck + frozen-lockfile clean / **ZERO owned golden (#564)**. Dual-path live (dist + bridge :4466 restart).

---

## §6 Disclosed residuals — MEASURED AT BUILD (state in the closeout; do NOT claim closed)

### §6.1 Over-suppression — the Derek-ratified silencing gate, MEASURED

Build session PS-2026-07-24-003. Measured with **A5 (per-layer union) + A6 (incoherent-band rule) applied**,
against HEAD 8297cc6 via a `cp`-swap of `data-analysis.ts` on the same machine. Reproduce with
`scratchpad/S165M4_bubblegen.ts` + `S165M4_record.mts` + `S165M4_audit.mts`.

| population (300 specs each) | HEAD narrated | s165 narrated | newly silenced | conditional rate |
| --- | --- | --- | --- | --- |
| **Bubble charts, realistic** (random band slopes ⇒ real Simpsons present) | 3 | 3 | **0** | **0.0%** |
| **Bubble charts, honest-by-construction** (every band slopes the same way) | 139 | 130 | **9** | **6.5%** (3.0% of population) |
| 400-spec structural sweep (all chart shapes) | 154 | 140 | **14** | **9.1%** (3.5% global) |

Against the draft's **7.0% global / 52–80% conditional on bubble charts** — an order of magnitude better;
A6 did the work it was added for. **FALLBACK NOT TAKEN**; the broad class fix ships. Caveat recorded: the
SSOT never pinned a NUMERIC threshold, so "exceeds the ratified threshold" was not mechanically decidable —
the measured numbers are pinned here and the retrospective ratification is Derek's.

**What the silencing actually is, audited:** all 14 newly-silenced sweep specs carry a genuinely opposing
drawn band (independent hand-audit off the rows). The 9 honest-bubble silencings do **NOT** have an opposing
*finest* band — in every sampled case the suppressor is an **INCOHERENT `{size}`-keyed band pooling across
the colour axis**, with n=3–5 distinct x and |r| = 0.52–0.86 (clearing ρ), voting against a near-zero pooled
r. A6 deliberately ADMITS such bands (it only blocks them below 3 distinct x). Whether "all the 12px bubbles"
is a *visually-separable drawn sub-series* under rule 14 is a **judgement**, and the fail-safe superset
posture deliberately resolves it toward silence. **Do not claim zero over-suppression.** Pinned as an
executable fixture (residual-1 test).

### §6.2–§6.6 (unchanged in kind, now pinned as fixtures)

2. **n=2 INCOHERENT opposites are un-votable in G1′** (A6's cost) — an error toward narration. Pinned.
3. **ρ=0.5 gray-zone** (bounded, unchanged). Pinned.
4. **Continuous-ramp** narrates; re-validated against both boundary fixtures. Pinned.
5. **Oracle scope:** Vega-Lite only, channel→field mapping only, **ECharts coverage ZERO**, one disclosed
   vacuous pass (`bindTo:'visual' property:'color'`). Additionally MEASURED: the corpus has **zero**
   out-of-domain fixtures, so the domain-skip machinery is **inert** — the gap (`analyzeVizSpec` narrates for
   MarkRule/MarkText/MarkArc/MarkGeoshape while `toVegaLiteSpec` throws) is proven only by dedicated
   fixtures, never by a corpus instance.
6. **Separability is renderer-divergent** — we deliberately take the union (most-separable) reading. Pinned.
7. **NEW (build):** `deriveCorrelation` is **NOT memoized**, contrary to §3.6. Keyed on the row arrays the
   cache is inert (every call site rebuilds them); keyed on the spec it is **unsound** — the drawn-value
   guard calls `expectedNarratableCorrelation` in production, so a spec-keyed cache makes
   `expected === analysis.correlation` true by construction and the guard's correlation arm **vacuous**.
   Cost is paid by bucket-once instead: measured **1.27–2.08×** s164 (10k–50k rows) vs the draft's 4.4×, and
   **383 ms** at 50k vs the draft's 2,184 ms.

### §6.8 Charter corrections found at build (recorded, not silently absorbed)

* **§3.2b named THREE fall-through classes; the shipped code has TWO.** Its (b) "a stacking aggregate with no
  facet and no categorical retinal" and (c) "a quantitative-only retinal under stacking" are the SAME set — a
  stacking aggregate with a CATEGORICAL retinal still partitions, so it never falls through (categorical
  `shape` being mechanism 1). Discharged by EXHAUSTION instead: 448 structural combinations enumerated, 46
  fall through, characterized exactly by an independently-written structural predicate.
* **§5's call-site line-item was written for the REJECTED replace design.** Under the shipped UNION design
  nothing takes `separableFields` *instead of* `correlationGroupingFields`. Verified map:
  `correlationGroupingFields` has **FIVE** consumers (`deriveCorrelation`, `correlationGroupDirections`,
  `correlationClassifierActualKey`, `correlationOppositionEvidence`, `correlationGateFields`) and
  `separableFields` has **THREE** (`deriveCorrelation`, `correlationSeparabilityEvidence`,
  `correlationGateFields`). `correlationOppositionEvidence` MUST keep grouping — it is the s164 arm's capture
  surface, and switching it would silently change what the s164 drift assert captures.
* **The corpus is 42 specs** under `examples/viz/**/*.spec.json`; the s159 sweep glob covers only 32
  (`patterns` + `patterns-v2`). Both numbers are now stated where used.

---

## §7 What is CLAIMED — generated from what actually runs

**Closed, with evidence:** the four confirmed s164 survivors (A shape-on-a-'mixed'-mark ×4 mark
combinations, B quantitative-colour-ramp-on-a-sum-stack, C collinear-categorical-partition-shatters-a-size-
Simpson ×3 variants, D per-layer bindings ×3 channels) go `defined → undefined`, each with a non-empty G1′
vote set (reachability), each live-reproduced at HEAD before any edit and re-verified through `dist`.

**Not claimed:** that the CLASS is closed beyond those four survivors plus the checked sets. What is actually
checked is: 42/42 corpus specs unmoved · a 400-spec monotonicity oracle against the recorded HEAD decision
(zero violations) · 448 structural combinations characterized for the early-return re-gate · 288 structural
combinations + 42 corpus specs for the compiled-superset relation · the s162/s163/s164 suppression set intact
· 10 keep-controls narrating.

**RULE 15 is scoped to the FIELD DERIVATION only.** The decision-level direction of error is **not asserted**
— it is machine-proven by the §5 monotonicity oracle (`s164_undefined ⇒ s165_undefined`, measured over 400
specs against a frozen HEAD measurement, proven to bite by deleting the retained s164 arm).

**The genuine-close review is a SEPARATE owed session. This build does not self-certify.**

---

## §7 Forks — RESOLVED

* **F1 over-suppression budget — RATIFIED:** broad class fix, **measure**, fall back to the narrow C-only fix if
  the measured rate exceeds the threshold (§5).
* **F2 layered multi-measure / own-dataset — RATIFIED:** **stay silent** (§3.5).
* **F3 separability posture:** fail-safe superset (critic-endorsed; all lenses failed to break the enumeration).
* **F4 `detail`:** stays always-separable (over-suppresses on ECharts = honest).
* **F5 G0:** unchanged (rule 13b) — except `:1662`, which is not G0.

## §7b BUILD RECORD — session PS-2026-07-24-003 (base HEAD 8297cc6)

**RED-first discipline:** all four survivors reproduced LIVE against a dist rebuilt from HEAD *before any
edit* — A `0.79`, B `1`, C `0.262`, D `0.79` (compiled layer colours `["seg","grp"]`).

### Charter-diff (line-item)

| chartered | shipped | status |
| --- | --- | --- |
| §3.1 `separableFields` per-layer union, unconditional `shape`, quant colour, stacking drops nothing | `bindingsUnion` + `separableFields` | ✅ |
| §3.2 G1′ union suppressor, clauses (a)/(b) only, no clause (c), A6 incoherent-band rule | `correlationSeparabilityEvidenceOf` | ✅ |
| §3.2b re-gate the `:1662` early return | 3-clause form | ✅ |
| §3.5 multi-measure / own-`from` layered suppression | `layeredCorrelationUnsupported` | ✅ |
| §3.6 bucket-once + merge upward | `finestSeparableBuckets` | ✅ |
| §3.6 cap → suppress unconditionally | `MAX_SEPARABLE_FIELDS = 8` | ✅ |
| §3.6 memoize `deriveCorrelation` | **NOT DONE — unsound; §6.7** | ⚠️ disclosed |
| §4 compiled-superset oracle, deny-list, pinned domain, counted skips | oracle spec | ✅ (skips inert — §6.5) |
| §5 monotonicity oracle vs HEAD, proven to bite | 400-spec sweep + recorded vector | ✅ |
| §5 four-consumer call-site pin | **map CORRECTED to 5+3 — §6.8** | ⚠️ corrected |
| §5 second decision oracle off `separableFields`, bites on neuter | claim-scope spec | ✅ |
| §5 silencing measured + pinned | §6.1 | ✅ |
| §5 mutation gate (i)–(vii) | all bite | ✅ |

### Mutation gate — every one bites

(i) shape mark-gate → 6 RED · (ii) stacking drop → 9 RED · (iii) restore the partition prefix → exactly the
C class RED · (iv) neuter G1′ → 28 RED · (v) drop colour → 8 RED (§4 oracle) · (vi) restore the 2-clause
early return → 8 RED · (vii) revert to `resolveBinding` → 10 RED · delete the retained s164 arm →
`rowsDisjointFlat` RED **and** the 400-spec monotonicity oracle RED · revert bucket-once → the cost
assertion RED · cap drops fields instead of suppressing → the cap test RED · neuter G1′ → the separability
decision oracle 6 RED. All restored via `cp`, byte-verified identical.

### Gate

viz-core **1082 → 1193** (+111 owned: 26 / 55 / 15 / 15) · mcp-server **3978 EXACT** (after a dist rebuild —
its vitest resolves `@oods/viz-core`→dist) · scale **62 EXACT** · tokens **322 EXACT** · root `pnpm typecheck`
**PASS** · `pnpm install --frozen-lockfile` clean · **ZERO owned golden** (#564: no snapshot/golden file
moved; `golden-echarts-options` + `golden-profiles` 21/21 GREEN).

Two baseline corrections, both measured not assumed:
* ~~**root core = 4658, not the memo's 4638.**~~ **CORRECTION RETRACTED 2026-08-01 (next-steps #1096/#1108):
  this bullet was itself the error.** The 4658/435 figure came from the root THREE-PROJECT UNION
  (`npx vitest run` = core + guardrails + jsdom project), not the named core invocation. Re-verified at
  HEAD 2ecd3ae: `npx vitest run --project core` = **4638 tests (4618 passed + 20 skipped) / 426 files
  (424 + 2 skipped)** — the §5 baseline of 4638 was correct all along. The +20/+9 delta is the other two
  root projects, not pre-existing drift. STANDING RULE: every pinned gate number must name its exact
  invocation; a bare "root core" count is not comparable across sessions.
* **viz-core package `tsc -p tsconfig.json` emits 2 errors** (TS18048 in the s164 proof spec) — verified
  PRE-EXISTING at HEAD by cp-swap. Root typecheck (the gate of record) is clean. s165 adds zero.

### Dual-path live

* **dist** (rebuilt from the shipped src, symbol-verified): A/B/C/D all `undefined`; the honest mixed+shape
  rising control still narrates `0.944`.
* **bridge :4466** (`pm2 restart oods-forge-bridge`, health `ok`, 19 tools): B and C and the single-mark
  A-variant all emit **no correlation finding**, while the A-variant HONEST control emits
  `"Correlation coefficient: 0.94"` and a plain single-series rise emits `"strong positive relationship"` +
  `0.99`. **Scope:** `viz.render` takes one `chartType`, so a LAYERED/multi-mark spec is not expressible
  through the bridge — survivors **A(mixed) and D are verified on the dist path only**.
  *(First bridge attempt was a FALSE PASS: `includeA11y` sits under `output`, and a top-level copy failed
  input validation, so the "no correlation finding" result was an error payload with nothing to match.
  Re-run correctly above.)*

**NOT SELF-CERTIFIED.** The adversarial genuine-close review is a separate owed session; sprint-COMPLETE is
Derek's call. Streak s154 G → … → s164 NG (10 consecutive); s165 verdict pending that review.

---

## §8 Sequencing

`m0` memo (this — COMPLETED at lock) → `m1` `separableFields` (per-layer union, unconditional shape, stacking
drops nothing) + the re-gated early return + §3.5 layered suppression → `m2` G1′ as a UNION suppressor (clauses
a/b only, incoherent-band rule) + RED-first A/B/C/D + the monotonicity oracle + mutation gate → `m3` the §4
compiled oracle + perf bounds → `m4` silencing measurement + claim re-scope + residuals + closeout.
**Requires-linear. Build = a SEPARATE fresh session, RED-first. Genuine-close review = ANOTHER separate session.
NO self-certification.**
