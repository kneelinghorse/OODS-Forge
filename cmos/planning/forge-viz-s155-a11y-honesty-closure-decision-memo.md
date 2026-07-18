# Sprint-155 — a11y-Narrative-Honesty FULL CLOSURE (SSOT Decision Memo)

**Ratified 2026-07-18 (planning PS-2026-07-18-001, Derek AskUserQuestion).** This sprint ends the
s150→s154 a11y-narrative treadmill *structurally*. It folds the two open forks (fork-2 concat,
fork-4 color-group) + the s154-review MED residuals (`id_max`-class Total) + the pre-existing #910
phantom-row-order class into ONE invariant and ONE machine-enumerated test method.

**Sequencing (ratified):** Meridian Gate 5 runs FIRST in a fresh isolated session (independent, no
code dependency — see §7). s155 executes AFTER. The band-schema fork (fork-1) is a SEPARATE later
sprint (§8). This memo lets the s155 build session run without re-grounding.

Grounded by 5-lens live-code fan-out (wf_f42f2dfe-d60 + wf_2de28d8a-221). Every file:line below is a
grounding read — **grep-verify at build** (they drift); reproduce-RED re-establishes them anyway.

---

## 1. The problem (why 4 correctives did not converge)

It is a **MODEL problem in a process costume.** Both recurring families emit a confident interpretive
*claim* wired directly to a best-effort *guess*, so a wrong guess produces a FALSE claim, not silence:

- **Trend family** — `computeTrend = !isFacetedLayout(spec) && isSequenceComposition(spec)`
  (`data-analysis.ts:237`). `isFacetedLayout` enumerates only `LayoutFacet` (`:206-208`). `analysis.trend`
  is a pure `dataPoints.at(0)` vs `.at(-1)` read over the FLAT concatenated walk (`:72-73,80`). Any
  series-concatenation surface the enumeration did not name — `LayoutConcat` (fork-2), color-grouped
  multi-series (fork-4) — slips the gate and emits a sign-inverted phantom.
- **Total family** — `Total X` fires for any non-`point` mark whose measure field yields numeric points
  (`narrative-generator.ts:310-312`); the measure-ness signal is the name-guessed type from
  `inferFieldType` (`spec-builder.ts:1015`). Every #895 recurrence (`sales_id`→"Total Sales id", now
  `id_max`/`id_min`/`id_median`→"Total Id max") is a field the name-heuristic mistyped as additive.

The response every sprint was *more enumeration* ("bidirectional × multi-dimensional"). It failed 4×
(s150 line 94, s152 line 106, s153 line 108, s154 line 114 of the flagship memory) because the input
space {name-token × head-position × mark × layout × density × normalization × series-multiplicity} is
**combinatorially open** — a negative enumeration is false on every cell it forgot. Tightening review a
5th time yields a 5th surface.

---

## 2. The invariant (the exit)

> **CLAIM-ON-POSITIVE-EVIDENCE.** A narrative may assert an interpretive claim (a directional Trend,
> an additive Total, a correlation, a measure label) only when the claim's precondition is *positively
> provable from the spec's declared structure*. When the precondition is not provable, omit the claim
> and fall back to an order-invariant, aggregation-free statement. No claim is emitted on a
> classification guess that would render the claim false if the guess is wrong.

Load-bearing shift: today's gates are NEGATIVE enumerations (`!isFacetedLayout`, the id/zip denylist +
escape hatch). Flip them to POSITIVE preconditions. A negative enumeration is false on every cell it
forgot; a positive precondition is safe on every cell it never saw. **That is what ends fork-5/6.**

Two instantiations:
1. **Trend** — precondition `seriesCount(spec) === 1` AND `isSequenceComposition` (marks ∈ {line,area}).
   Not provably single-series ⇒ omit ⇒ the existing s154 range sentence (`narrative-generator.ts:203-214`).
2. **Total** — precondition the measure field is *provably additive*: its name is on a positive
   additive allowlist OR the caller declared `aggregate:'sum'`/`'count'`. Not provable ⇒ omit the Total
   (High/Low/mean still emit → A11Y-R rules stay green).

---

## 3. Missions (strict-linear Requires chain)

### m01 — keystone memo [S, no code, Completed-at-creation]
This file. Ratifies the invariant + both instantiations + the property-harness design + the build-time
decisions in §5. m02→m05 execute from it without re-grounding; m05 reconciles + closes out.

### m02 — property-test harness, RED-FIRST [L] — the load-bearing deliverable
Ship a **deterministic bounded-exhaustive** generator + 3 properties as colocated viz-core specs, wired
into the CI viz-core lane (`ci.yml` runs `pnpm --filter @oods/viz-core test`). **RED at HEAD** first —
they must reproduce fork-2 (`focus-context-line`), fork-4 (color multi-series), and `id_max`→"Total Id max"
BEFORE any fix. Oracles are computed **independently of the code under test** (else tautology) — standalone
test-side functions reading spec structure / a static allowlist, NEVER calling the analyzer.
- **(i) SINGLE-SERIES-TREND (subsumes row-permutation).** Generator: {mark: bar,line,area,point,rect} ×
  {layout: none, facet, concat(2-3 sections), layer, color-grouped} × {seriesCount: 1,3} × row payloads.
  Oracle `expectedSeriesCount(spec)`: `LayoutFacet`→product of distinct `rows/columns.field` values;
  `LayoutConcat`→`sections.length`; nominal `encoding.color` on a repeating line/area mark→distinct color
  values; else 1. Assert: a directional token (`"Trend increasing|decreasing"|" rises "|" declines "`)
  present ⇒ `expectedSeriesCount===1`. Metamorphic leg: reverse `data.values`, regenerate; direction token
  unchanged or absent.
- **(ii) NO-UNPROVEN-SUM.** Oracle `isProvablyAdditive(fieldName, callerAggregate)` = positive allowlist +
  `aggregate:'sum'/'count'`. Assert: `"Total <label>"` present ⇒ `isProvablyAdditive`. Name bank
  {revenue,sales,amount,price | sales_id,store_id,id_count,id_max,id_median,zip,postal_revenue,sku_price,lines_of_code}.
- **(iii) CARTESIAN COMPOSITE.** (i)∧(ii)∧(no directional trend on any non-sequence mark) over the full
  bounded product {name-token × mark × layout × colorCard ∈ {0,1,2,5,13} × density ∈ {sparse,mid,dense}},
  one live narrative per cell incl. supposed-unchanged. This IS the machine replacement for the hand-built
  matrix — if every enumerated cell satisfies a *positive-precondition* invariant, no unseen cell can lie.
- **Tech:** hand-rolled deterministic Cartesian enumeration, **NO new dependency** (`fast-check` is NOT
  installed; frozen-lockfile discipline). Exhaustive over a finite space > seeded fuzz. Keep per-dimension
  sets small (product multiplies fast; stay in the lane time budget).

### m03 — Trend family fail-safe [M]
Replace `!isFacetedLayout(spec)` at `data-analysis.ts:237` with the single-series invariant. Add
`seriesGroupingField(spec)` = `resolveBinding(spec,'color')?.field ?? resolveBinding(spec,'detail')?.field`
(reads top-level THEN `marks[].encodings`, `resolveBinding` at `:308-320`), and `isMultiSeriesComposition(spec, rows)`
= `isFacetedLayout(spec) || (f ? new Set(rows.map(r=>r[f]).filter(v=>v!=null)).size > 1 : false)`; gate =
`!isMultiSeriesComposition(spec, rows) && isSequenceComposition(spec)` (`rows` already collected at `:212`; do
NOT reuse `analysis.colorCategories` — not computed yet). Folds facet + concat (fork-2) + color-group (fork-4)
under ONE data-grounded gate; concat is folded VIA the color arm (focus-context-line carries color=region,
3 distinct) so NO concat-structural clause is needed — which resolves the s154 "a legit single-series concat
would be false-suppressed" worry (a real single-series concat has 0/1-distinct color → not suppressed).
Omission path already exists (`narrative-generator.ts:203-214`); the mark-agnostic Trend keyFinding
(`:300-305`) is suppressed via `computeTrend` for area/mixed too. Update the fork-2 residual pin
(`data-analysis-faceted-and-unknown-mark-trend-s154.spec.ts:203-206`, currently asserts the concat phantom)
to the fixed output — inspect the re-baseline, never blind `-u`.

### m04 — Total family fail-safe [M]
Gate the "Total X" emission (`narrative-generator.ts:310-312`) AND the default-branch "totaling" summary
(`:243-246`) on a positive `isProvablyAdditive` predicate — `analysis.measureField` (the raw field NAME)
is already carried to both sites. A Total emits ONLY when the name is affirmatively additive OR the binding
declares `aggregate:'sum'/'count'`; else silence. `inferFieldType` and all RENDER typing UNTOUCHED (the fix
is at the CLAIM layer, not the guess — flipping the type default to nominal would break render: age/temperature/
population would get band axes = false CHARTS, see §6). Enabler: extract the module-local name-hint helpers
(`nameHintsMeasure/Identifier/Zip`, `AGGREGATE_HEADS`, `MEASURE_NAME_TOKENS`, `fieldNameTokens`, `headToken` —
grep-confirmed none exported) into a shared `src/analysis/field-name-hints` module consumed by BOTH spec-builder
and the a11y layer (the s150 share-the-derivation recipe). Closes `id_max`/`sales_id`-class permanently — a
future type-inference regression cannot resurrect a false Total on a non-additive name.

### m05 — closeout [S]
Standing sweep (§6). Reconcile viz-core count from 462 per-mission. Confirm no existing case rewritten. pm2
`oods-forge-bridge` restart (mine). Do NOT self-declare a genuine-streak position — review is separate.

---

## 4. Zero-golden (#564)
Property specs are new colocated tests (zero golden). m03/m04 move the narrative on the *deferred fork
fixtures* (focus-context-line's `-33.3%` phantom) — that change is INTENDED (closing fork-2); confirm no
OWNED golden asserts the old phantom before flipping. `golden-profiles.spec.ts.snap` stores the moving
fixtures ONLY as pattern-registry IDs via `suggestPatterns` (never `analyzeVizSpec`) — disjoint from the
trend/Total path. Grep `/Total /`, `/-33.3%/`, `/declines from/`, `/ranging from/` across
packages/examples/tests before declaring zero-golden. No mcp-server test asserts a narrative Trend/Total on
a colored/focus-context line (grep-confirmed) — DIST-SANITY rebuild before the mcp-server suite anyway.

## 5. Build-time decisions (recommendations; ratify literals in build)
- **Sort-by-X (Risk 1, a genuine latent bug):** `analysis.trend` reads first/last in ARRAY order, never
  sorts by the X binding (`data-analysis.ts:72-73`). The row-permutation property flags even a *legit*
  single-series line. RECOMMENDED: canonicalize — sort `dataPoints` by the X binding before first/last (the
  honest fail-safe; a real behavior change to legit lines — check owned goldens). Alternative: scope the
  reversal assertion to `seriesCount>1` (smaller blast radius, leaves single lines order-dependent). **Pick
  in build; RECOMMEND sort-by-X.**
- **Total policy:** positive additive allowlist (the genuine invariant, RECOMMENDED) vs merely narrowing
  `AGGREGATE_HEADS` to {count,counts} (minimal, stays on the treadmill). RECOMMEND allowlist at the claim site.
- **Where the Total fix lands:** narrative-output gate (satisfies the invariant, safest for #564, RECOMMENDED)
  vs profiler root `inferFieldType` (fixes render+narrative+table together but reopens token arbitration).
  RECOMMEND narrative-site; leave render typing alone.
- **detail channel in m03:** include (conservative, only ever SUPPRESSES genuine multi-series) with ONE
  synthetic enumerated cell, OR ship color+facet only. RECOMMEND include-with-synthetic-cell.
- **Additive allowlist membership:** the one enumerable judgment the fail-safe rests on. Conservative start:
  {revenue, sales, cost, amount, quantity, count, sum, total, spend, volume, units, subtotal}. Enumerate each
  member with one live cell, both head-positions. Accept the documented less-rich cost: unnamed-but-additive
  (population, votes) + camelCase (salesRevenue) lose their "Total" — silence, never a lie.

## 6. Constraints (every mission)
- **#564** zero owned-golden — declared, grep-backed per mission.
- **#110 / #525 / #115 / determinism** untouched. No advertised-prose or schema change (both generators +
  `docs:api --check` NO-OP). No new tool (set stays 25).
- **Surgical** (Rule 3). Assert the human-readable LABEL string.
- Behavior-movers (m03/m04) run the full clean-rebuilt viz-core + mcp-server suite before complete;
  **DIST-SANITY rebuild before the mcp-server suite**; dual-path live-verify at m05 (bridge :4466 key
  `input`, aquex, shipped-dist import). CLOSEOUT = frozen-lockfile + root typecheck + viz-core re-export
  typecheck gate (WITH @oods/tokens build) + both generators & docs:api --check NO-OP + tokens-validate +
  -r build + DIST-SANITY + full viz-core+mcp-server + `vitest run --project core` UNFILTERED + test:scale.
- Baselines: viz-core **462**, mcp-server **3978**, root core **4631**, test:scale **62**.

## 7. Meridian Gate 5 — the immediate next session (independent, unblocked)
Registry modeling of the parts-commerce vertical (objects/traits/view extensions + a receipt with SHA +
sources + exposure disclosure). Touches NONE of spec-builder/data-analysis/narrative — confirmed independent,
NOT blocked on any fork. Operational: FRESH isolated session; only Meridian input = backlog_request
**msg 8d05f544** (read it IN that session, not before — keep planning uncontaminated); MUST NOT open
**msg 30f3b851** (frozen observations — reading voids the study); the 7/16 acceptance session already read
30f3b851 → that exposure MUST be RESTATED in the receipt. Confirm msg 8d05f544 is retrievable before kickoff.
See [[meridian-gate5-parts-commerce]]. No deadline pressure — sequencing over speed.

## 8. Band-schema fork (fork-1) — its own later sprint (s156-class)
SEPARATE GENERATE-side debt; 3 root causes + a keystone gate (latent, no live consumer today):
- **M1 [S] BUILD y2/x2 band schema** — add `x2`/`y2` to `EncodingMap.properties` + `TraitBinding.channel`
  enum in BOTH schema copies (`schemas/viz/…` SSOT + `packages/viz-core/src/spec/…` runtime, byte-identical
  by convention) + `generate:schema-types`. Adapter already renders it (`vega-lite-adapter.ts:11,270`). Fixes
  facet-target-band, target-band-line.
- **M2 [M] BUILD diverging color scale** — add `"diverging"` to the `scale` enum + teach the adapter to emit
  a diverging color scale (range = resolved `--viz-scale-diverging-*` tokens, `domainMid:0`) instead of
  dropping it. Tokens + pattern docs already assume it (`scale-token-mapper.ts:14-113`, `patterns/index.ts:889-895`).
  On the color-craft arc. Only golden-exposing mission. Fixes correlation-matrix, diverging-bar.
- **M3 [S] FIX interaction fixtures (prune, not build)** — drop the stray `else` from drilldown-stacked-bar's
  tooltip rule; rewrite linked-brush-scatter's interval select to `"encodings":["x","y"]` (remove `fields`).
  Contract is correct; do NOT loosen it.
- **M4 [S] KEYSTONE: CI example-validation gate** — colocated test globbing ALL `examples/viz/**/*.spec.json`
  asserting `validateNormalizedVizSpec(...).valid`; + a schema-copy identity-assert. Converts latent rot to
  RED-at-PR. Merges atomically with M1-M3 (goes green only once they land). Decide glob scope (also the v1
  `examples/viz/patterns/` twins carry the same defects).

---

## Deferred beyond s155/s156 (residuals, documented)
- **camelCase tokenization** (F2 residual): `fieldNameTokens` splits on non-alnum only, so `salesId`→`['salesid']`,
  hint-invisible. The false-claim half is subsumed by m04 (never summed); the render-type mis-guess is not.
- **zip-stat typing** (F2 residual): `zip_income`/`fips_population` stay nominal (no false Total; render-type
  less-rich only).
- **Per-series honest trend (Design B)** — compute a direction per color group, emit only if all groups agree.
  Strictly richer a11y than the fail-safe range sentence; re-introduces a confident-claim surface + new prose +
  its own enumeration. A future ENRICHMENT once the fail-safe floor is proven closed.
- **Caller-declared measure ROLE authoritative** — `IntentField.type` is currently RESERVED/ignored
  (`spec-builder.ts:157-161`); making a declared measure role win would let declared-intent callers skip the
  name guess entirely (the same "declare, don't guess" principle). Orthogonal enrichment.
