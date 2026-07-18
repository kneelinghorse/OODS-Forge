# Sprint-155 m05 — Adversarial-Verification Residuals (documented carries)

**Context.** m05 closeout ran an ultracode adversarial-verification workflow (6 diverse lenses,
wf_3431a50d-c88) probing the a11y-narrative-honesty closure for surfaces the property harness did
not enumerate. 24 candidate violations were verified live against the built dist. Derek ratified
"full closure now" (AskUserQuestion 2026-07-18): fix all three invariant-violating classes + extend
the harness, document the safe-direction residuals below.

## FIXED in m05 (folded into m03/m04, machine-proven by the extended harness)

1. **Over-claim Total via qualifier** — `avg_revenue` / `median_sales` / `unit_cost` /
   `running_total` / `percent_of_total` / `ytd_total` / `average_order_count` emitted a false
   "Total" because the HEAD noun (revenue/sales/cost/total) is additive while the aggregate/rate/
   cumulative qualifier was ignored. FIX: `NON_ADDITIVE_QUALIFIERS` token denylist in
   `isProvablyAdditive` (field-name-hints.ts). Property (ii) name bank extended.
2. **Over-claim Total via declared aggregate** — a caller-declared `aggregate:'average'|'median'|
   'min'|'max'|'distinct'` still totalled (only `sum`/`count` short-circuited). FIX: declared
   aggregate is AUTHORITATIVE — non-additive aggregates force non-additive; `sum`/`count` never sum
   an identifier/zip (#895 guard). Property (iv) new.
3. **Residual phantom Trend via grouping undercount** — a 2-series line where one series carried
   `color=null` (dropped from the distinct count → undercounted to 1), or a real `detail` grouping
   shadowed by a constant `color` (the old `color ?? detail` short-circuit). FIX:
   `isMultiSeriesComposition` now counts null as its own bucket and consults BOTH color and detail.
   Property (v) new.
4. **Sort-by-X lexical misorder (s155-introduced REGRESSION)** — `v9`/`v10`, non-zero-padded ISO
   months (`2021-8`), sprint labels narrated the WRONG direction (rising → "declining"). FIX:
   `compareCells` uses a natural-order (chunk-wise numeric) comparator — a TOTAL order, so it also
   closes the theoretical intransitive-comparator non-determinism. Property (vi) new.

## DOCUMENTED RESIDUALS (not fixed — safe-direction / inherent / contrived)

- **Under-total (false negative, SAFE)** — `profit`, `orders`, `votes`, `population`,
  `impressions`, `clicks`, `units_sold` ('sold' head), `revenue_usd` (currency-suffix head) lose
  their Total. This is the memo §5 "documented less-rich cost": silence, never a false sum.
  Enrichment path = broaden `ADDITIVE_MEASURE_HEADS` (Derek's call) or strip currency suffixes in
  `headToken`. Deferred as a value judgment on the false-NEGATIVE side.
- **Undeclared grouping (B5)** — a genuinely multi-series line whose grouping field is bound to NO
  encoding channel (or a typo color field absent from the rows → 0 distinct) reads as single-series
  and keeps a trend. INHERENT: with no positive structural evidence of multiplicity, the analyzer
  cannot know. The honest limit of CLAIM-ON-POSITIVE-EVIDENCE.
- **Conflicting color bindings (B6)** — a top-level constant `color` shadowing a DIFFERENT
  mark-level `color` field (resolveBinding returns top-level first). Contrived/malformed:
  buildVizSpecFromRows and every shipped fixture bind color at exactly one level.
- **Duplicate-X extreme (C1)** — a single series with a duplicate X value at the min/max flips its
  trend under row reversal (the tie is broken by storage order). INHERENT: which of two equal-X rows
  is "last" is genuinely ambiguous. A well-formed ordered series has unique X.
- **Null-X row (C4)** — a null X cell sorts to the front (String(null) → ''), letting an outlier
  dominate first→last. Malformed input (a null on the ordered axis).
- **Mixed-mark empty summary** — gating the default-branch "totaling" summary can leave a
  mixed/unknown-mark spec with an empty summary when its measure is non-additive AND it carries no
  `a11y.description`. Real assembleSpec specs always carry a description (R-08), so this only bites
  hand-authored description-less specs; the a11y narrative still emits High/Low/Trend findings. A
  richer order-invariant range fallback for the default branch is a deferred a11y enrichment.
- **camelCase tokenization** (pre-existing, memo Deferred) — `salesId`/`avgRevenue` tokenize as one
  token; the false-Total half is now also covered by the qualifier denylist only when the qualifier
  is a separate token. camelCase measure names remain a render-typing residual.

## Meta

The adversarial verification found gaps in the harness's ENUMERATION (it had not covered qualifier
names, declared aggregates, null-color, detail grouping, non-padded-label X). Closing the code gaps
AND extending the machine-enumerated proof is the sprint methodology working as intended — a
positive-precondition invariant proven over a bounded space, not a hand matrix. The DOCUMENTED
residuals are all either fail-safe-to-silence (false negatives) or genuinely malformed/ambiguous
input, consistent with the invariant.
