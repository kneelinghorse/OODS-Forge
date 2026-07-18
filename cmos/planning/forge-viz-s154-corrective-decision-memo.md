# Sprint-154 — Corrective Decision Memo (SSOT)

**Corrective for the s153 review (NOT_GENUINE_CLOSE, PS-2026-07-17-001).** Mirrors
s149→s150 and s152→s153. A fresh build session executes m02→m04 from this memo
without re-grounding, then m05 closes out.

- **Grounding:** already satisfied at HEAD `1342ab2` by the review itself
  (`wf_3b9948dc-648`) + the design-vet workflow (`wf_22ccdc02-906`, 3 designs ×
  3 adversarial attackers + synthesist, all live-probed at HEAD). Every confirmed
  finding carries a live probe at this HEAD; the two HIGHs were hand-confirmed via
  audited probes. Do **not** re-ground — reproduce-RED-in-isolation per mission.
- **Root cause being corrected (3rd occurrence: s150→s152→s153):** boundary
  enumeration was *unidirectional* and *single-dimension*. This memo enumerates
  every fix **bidirectionally** (both head-positions of each hint-class compound)
  and **multi-dimensionally** (every input dimension the gate reads).
- Line anchors below are the design agents' live reads at HEAD; **grep-verify each
  at build** (they can drift) — the reproduce-RED step re-establishes them anyway.

## Baselines (corrected — the s153 m06 "393/+~6" was wrong on both count and delta)

| Suite | Baseline | How to check |
|---|---|---|
| viz-core | **435** tests / 37 files | LIVE at HEAD: `cd packages/viz-core && pnpm exec vitest run` |
| root core | 4631 | `pnpm exec vitest run --project core` UNFILTERED at repo root — cite review record, do NOT re-run mid-mission |
| mcp-server standalone | 3978 | cite review record — do NOT re-run mid-mission |
| test:scale | 62 | cite review record |

Predicted delta from **435** (reconcile exactly at m05, attributing per-mission —
the un-reconciled-m06 lesson): F2 +14–20, F3 +12–16, F4 +1 → **~465–470**.

## Constraints (every mission)

- **#564** ZERO owned-golden movement — declared, grep-backed per mission below.
- **#110 / #525 / #115 / determinism** untouched. No advertised-prose or schema
  change (both generators + `docs:api --check` expected NO-OP).
- **Surgical** (Rule 3): minimum diff, no adjacent refactors.
- Assert the human-readable **LABEL/summary string** wherever the defect is a label,
  not just the analysis object.
- Behavior-movers (m02/m03) run the **full clean-rebuilt viz-core + mcp-server**
  suite before mission-complete (the s149 F6d lesson); **DIST-SANITY rebuild before
  the mcp-server suite**; dual-path live-verify at m05 (bridge :4466 envelope key
  `input`, aquex, shipped-dist import).

## Derek-ratified forks (AskUserQuestion 2026-07-17)

1. **Fixture conformance debt = LEAVE + DOCUMENT + dedicated mission.** SIX committed
   `examples/viz/patterns-v2/` fixtures fail `assertNormalizedVizSpec` at HEAD
   (pre-existing, not s153): `facet-target-band` + `target-band-line` (the `y2` band
   key — `additionalProperties:false` on `marks[].encodings`), `correlation-matrix`
   + `diverging-bar` (color/scale enum), `drilldown-stacked-bar` (interactions/rule),
   `linked-brush-scatter` (interactions/select). `y2` is a **half-landed band
   feature** — the vega-lite adapter renders it (`vega-lite-adapter.ts` CHANNEL_ORDER
   `x2`/`y2`; `:270` normalizes `y2→y`) and `Patterns.stories.tsx` renders both band
   fixtures via an `as NormalizedVizSpec` cast bypassing validation — only the schema
   never admitted it. No example-validation CI gate exists, so it is latent
   (status-quo-green) until a consumer loads one of these `specPath`s through
   `viz.render`. **s154 does NOT touch fixtures or schema.** A separate
   fixture-conformance/band mission adds `y2`/`x2` to the schema properly
   (`generate:schema-types` + docs). → **deferred mission below.**
2. **Concat phantom = DEFER + dedicated mission.** `focus-context-line.spec.json`
   (a committed demo, LayoutConcat, single MarkLine over 3 region sections) ships a
   sign-inverted `Trend decreasing: -33.3%` — the same false-a11y-label class as the
   F3 HIGH but via LayoutConcat, not facets. Pre-existing (present at `a93477f`). NOT
   cleanly detectable (a concat can legitimately be one series at two zoom levels, so
   a naive gate would false-suppress). **The F3 fix is deliberately facet-only.** s154
   knowingly ships this ONE fixture with a false narrative, pinned as a documented
   residual, until the → **deferred concat mission below.**

---

## m02 — F2 [HIGH+MED]: head-noun arbitration (`packages/viz-core/src/builder/spec-builder.ts`)

**The original "identifier-must-be-the-HEAD-token" design was BROKEN by all 3
attackers** (it mis-typed `id_number`/`customer_id_number`/`tax_id_number`/
`user_id_fk`/`order_id_pk`/`store_id_key` as measures — resurrecting #895 — because
their head is `number`/`fk`/`pk`; and the `id_count`-vs-`id_number` collision is
inexpressible in any token-*ordering* model). **Adopted the convergent replacement:**

### Rule — ANYWHERE-hint + HEAD-NOUN-ESCAPE

The review proved no ordering of unordered token-bags is correct in both directions;
head **position** is the missing axis. Concretely, inside `inferFieldType`'s numeric
branch (~:1030–1056), keep the hint helpers `nameHintsZip` / `nameHintsIdentifier` /
`nameHintsMeasure` / `nameHintsCurrencyCode` **checking ANYWHERE** (`.some`, unchanged),
and add:

- `headToken(name)` = the **last** token from the existing `fieldNameTokens` **after
  stripping trailing all-digit tokens** (so `store_id_2024`/`user_id_2` keep head `id`).
- `AGGREGATE_HEADS = {count, counts, sum, avg, average, mean, median, min, max, score}`
  (NOTE: `total` is already in the measure set — do **not** duplicate. `rate`/`ratio`
  intentionally excluded — no confirmed cell; if the build adds either, enumerate one
  live cell for it.)
- **New branch placed BEFORE the rule-(3b) `nameHintsMeasure` rescue:** if
  `nameHintsZip(name) || nameHintsIdentifier(name)`, the field stays **nominal**
  UNLESS it *escapes* — `tokens include 'per'` **OR** `headToken ∈ AGGREGATE_HEADS`
  **OR** `headToken` is a measure-set token. If it escapes, fall through to the
  measure rescue / value rules.
- **Fix the 3 false comments** (~:1031–1033 "ordering is moot" — provably false since
  `postal_revenue` has `revenue`; ~:1045–1056; ~:1116–1127). Delete the old s153
  rule-(3c) block. The tokenizer, measure set, currency-code rule, ordinal rule (4),
  and temporal rules (1)/(2) are **untouched**. ~one atomic edit.

This splits every collision (all live-probed; 80-cell matrix, **0 mismatches**,
`scratchpad/f2-synth-verify.ts`):

| Input class | HEAD (wrong) | s154 | verdict |
|---|---|---|---|
| `sales_id`,`total_id`,`amount_id`,`price_id`,`cost_id`,`value_id`,`qty_id`,`order_total_id`,`sales_uuid`,`revenue_guid` | quant | **nominal** (id hint, no escape) | fixes HIGH |
| `id_number`,`id_no`,`id_num`,`customer_id_number`,`tax_id_number`,`user_id_fk`,`order_id_pk`,`parent_id_ref`,`store_id_key`,`record_id_seq` | quant (#895) | **nominal** (id hint, non-measure head) | fixes (attacker class) |
| `id_count`,`uuid_count`,`guid_score`,`ids_sum`,`user_id_count` | nominal | **quant** (aggregate head escapes) | fixes MED |
| `revenue_per_id`,`amount_per_uuid`,`revenue_per_sku`,`revenue_per_customer_id`,`sales_per_store_id` | (per) | **quant** (`per` escapes) | unchanged/fixes |
| `store_id`,`user_id_session_id`, bare `id`/`ids`/`uuid`/`guid` | nominal | **nominal** | unchanged |
| `postal_area_code`,`zip_region_code`,`zip_income`,`fips_population` | zip→quant / mixed | **nominal** unless measure/aggregate head (`postal_revenue`→quant) | fixes MED zip class |
| `lines_of_code`,`code_coverage`,`sku_price`,`sku_revenue`,`product_code`,`sku` | quant | **quant** (code/sku not in id/zip sets) | MUST-NOT re-demote — holds |
| `zip` (golden-profiles field),`zip_code`,`postal_code`,`fips` | nominal | **nominal** (zip head, no escape) | golden cell cannot move |

**Residuals (accepted, documented — not folded silently):** `revenue_by_id`→nominal
(`by` is NOT a rate marker — it is dominantly a grouper; `group_by_id` under a `by`
marker would become a new sum-the-group-ids #895; returns to `a93477f` parity, and a
caller-declared `scale`/`aggregate` always wins via the `buildExplicit` contract at
~:444). `zip_income`/`fips_population`→nominal (conservative; `income`/`population` in
no measure/aggregate set — full zip-stat typing needs a stat-noun set + its own
enumeration). camelCase (`salesId`→`['salesid']`, never hint-visible in ANY version) —
**deferred**, pre-existing, needs its own sprint (upgrading `fieldNameTokens` changes
the input surface of all five hint helpers at once).

**Tests** (all in `packages/viz-core/test/data-analysis-predicates.spec.ts`, new
`s154 F2 — head-noun arbitration` describe; assert type/role **AND** the label):
RED-at-HEAD — the 10 `sales_id`-class columns → nominal; heatmap `color=sales_id`
summary does NOT match `/totaling [\d,]+ Sales id/i` and keyFindings has no
`/^Total Sales id/i` (mirror of the live `Total Sales id: 6,021`); `id_count`/
`uuid_count`/`guid_score`/`ids_sum` → quant; `postal_revenue` → quant. **The
collision pinned explicitly** (`id_count` Q + `id_number` N in the same test). One
cell per AGGREGATE_HEADS member. GREEN-pins — `store_id`/`user_id_fk`/`postal_area_code`
nominal, `revenue_per_id`/`revenue_per_customer_id` quant, `lines_of_code`/`sku_price`/
`product_code`/`sku` quant, digit-suffix `store_id_2024`→nominal / `sales_2024`→quant.
Each RED reproduced RED **in isolation** at HEAD before the fix.

**Goldens: ZERO** (declared). Repo-wide grep of every moving field name across
`packages/`/`examples/`/`tests/`/`src/` (`*.ts,*.tsx,*.json,*.snap`) returns zero
committed refs; `golden-profiles.spec.ts.snap` contains only standalone `zip` (head
token → stays nominal). mcp-server reads viz-core via dist → DIST-SANITY rebuild
before its suite; no mcp-server fixture uses a moving name (same grep). 3978 unchanged.

---

## m03 — F3 [HIGH+MED]: faceted gate + unknown-mark reconciliation (Variant A) + fallthrough hardening

**HELD under all 3 attackers.** Three coordinated, disjoint edits.

### File A — `packages/viz-core/src/a11y/data-analysis.ts`

1. Add ONE shared derivation (the s150 share-the-derivation recipe):
   `knownNormalizedMarks(spec) = spec.marks.map(m => normalizeMark(m.trait)).filter(m => m !== 'unknown')`.
2. `resolveMark` (~:221) reuses it — **byte-identical** to HEAD's inline filter, just
   DRY so the two derivations can never desync again.
3. `isSequenceComposition` (~:181) becomes **Variant A**: `const known =
   knownNormalizedMarks(spec); return known.length > 0 && known.every(m => m==='line'
   || m==='area')`. This is the unknown-mark reconciliation — `line+rect`
   (`MarkRect→'unknown'`, filtered) becomes a line-composition consistent with
   `resolveMark`(=`'line'`), restoring the s152-correct trend and removing the desync
   that produced the HEAD lie. (Variant B — keep strict `.every`, harden only the
   fallthrough — REJECTED: it leaves a `'line'`-labelled chart trendless, the exact
   inconsistency the recipe forbids; and any future non-sequence mark added to
   `normalizeMark` re-tightens BOTH automatically under A.)
4. Add the layout gate and apply it as the OUTER AND in `analyzeVizSpec` (~:216):
   `isFacetedLayout(spec) = spec.layout?.trait === 'LayoutFacet'`;
   `computeTrend: !isFacetedLayout(spec) && isSequenceComposition(spec)`. One boolean
   reading one schema field. `LayoutFacet` guarantees the flat `spec.data.values` walk
   concatenates panels → first→last is a guaranteed cross-panel phantom.
   `rows` / `columns` / `rows+columns` (matrix) / `wrap` are all LayoutFacet
   sub-shapes (probe-confirmed one predicate covers all three). **LayoutLayer /
   LayoutConcat deliberately NOT gated** (per fork 2).

### File B — `packages/viz-core/src/a11y/narrative-generator.ts`, case `'line'` (~:186–201)

Fallthrough hardening. When `first && last` but `analysis.trend === undefined`, do NOT
emit the directional ternary (which renders the false `remains relatively flat`); emit
an **order-invariant range sentence** guarded by `min && max`:
`${chartLabel} shows ${measureLabel ?? 'values'} ranging from ${fmt(min.value)}
(${min.label}) to ${fmt(max.value)} (${max.label}).` Keep the directional branch for
the trend-defined case unchanged. **Recommended polish (include):** `min === max` →
"holds steady at …" (avoids "ranging from 5 to 5"). Under Variant A, `mark==='line'`
with `trend===undefined` is reachable ONLY via a faceted line spec, so the range
sentence is what keeps faceted-line honest and keeps A11Y-R-10 green (non-empty
summary) without an affirmative falsehood.

**Matrix** (live-probed HEAD vs proposed twin; RED-at-HEAD anchors are committed,
schema-valid fixtures):

| Cell | HEAD | s154 | verdict |
|---|---|---|---|
| `facet-small-multiples-line.spec.json` (LayoutFacet, MarkLine, 12 rows) | `Trend decreasing: -33.1%` | undefined + range sentence | RED-anchor (HIGH) |
| `sparkline-grid.spec.json` (LayoutFacet, MarkLine, 1152 rows/12 metrics) | `Trend increasing: 733.1%` phantom | undefined + range sentence | RED-anchor (HIGH) |
| synthetic 3-panel facet, each rising but global first>last | `Trend decreasing` (sign-inverted) | undefined + row-reversal invariance | RED (sign proof) |
| `line+rect` non-faceted, monotone | undefined → `remains relatively flat` (lie) | directional trend (matches `resolveMark`='line') | RED-anchor (MED) |
| `area+line` faceted | `Trend decreasing` phantom | undefined (facet gate) | fixes (s153-specific) |
| `layered-line-area.spec.json` (LayoutLayer) | `Trend increasing: 2.3%` | **UNCHANGED** | MUST-NOT-move |
| `bar+line`, `line+point` (non-faceted) | undefined | **UNCHANGED** | point-exclusion holds |
| `area+line`, 3-layer (non-faceted) | trend present (s153 restore) | **UNCHANGED** | MUST-NOT-move |
| single MarkRect heatmap | undefined | **UNCHANGED** | correlation gate untouched |
| `focus-context-line.spec.json` (LayoutConcat) | `Trend decreasing: -33.3%` | **UNCHANGED** (concat not gated) | residual (fork 2) |

**Tests:** new `packages/viz-core/test/data-analysis-faceted-and-unknown-mark-trend-s154.spec.ts`,
assert LABEL strings. Layout gate: committed `facet-small-multiples-line` +
`sparkline-grid` anchors (RED-at-HEAD), synthetic sign-inversion + row-reversal
invariance, all three facet shapes (rows/columns/matrix). Reconciliation:
`line+rect`/`line+rule`/`line+heatmap` regain the directional trend; `area+rect`
matches `mark==='line'` parity; single-rect + heatmap-alone stay undefined. Must-not-move
controls in-file: non-faceted single line still trends; `layered-line-area` still
`Trend increasing: 2.3%`; `bar+line`/`line+point` undefined. Certify R-10/R-11/R-13/R-15
pass. Because the two `y2` band fixtures are unloadable (fork 1), the faceted test
inputs are built **inline** (LayoutFacet + `[MarkArea,MarkLine]` + rising multi-group
data, no `y2`, no authored `a11y.narrative`) — decoupled from the fixture fork.

**Goldens: ZERO** (declared). The only committed golden referencing the moving
fixtures is `golden-profiles.spec.ts.snap`, which stores them ONLY as pattern-registry
IDs in the recommendation `ranking` (a `inferFieldProfile → toSchemaIntent →
suggestPatterns` path that NEVER calls `analyzeVizSpec`/`generateNarrativeSummary` —
disjoint from the trend gate). Grep for `declines from|rises from|ranging from|remains
relatively flat|Trend inc` on any faceted spec: none.

---

## m04 — LOW [F4 comment scope + boundary + enumeration test]

`packages/viz-core/src/patterns/index.ts` (`diverging-bar` heuristics block, ~:468–471)
**COMMENT-ONLY** + one additive test. The attacker caught the s153 review's *proposed*
replacement also over-claiming.

- **Scope the false universal.** The corrected comment must NOT say "a >12-cat SIGNED
  comparison ALWAYS elects diverging-bar" unqualified — that is false for off-shape
  cases: 3+ dims → `facet-small-multiples-line`, 2+ measures → `linked-brush-scatter`
  (both via a gate-INDEPENDENT `RANGE_MISMATCH`, since diverging-bar declares
  measures `{min:1,max:1}` / dims `{min:1,max:2}` at ~:455). Scope the claim to
  diverging-bar's **count-shape** (measures 1, dims 1–2).
- **Fix the off-by-one.** Density boundary at `spec-builder.ts:605` is
  `rows.length <= 30` → `sparse = 1..30 INCLUSIVE`, `mid = 31..199`, `dense = 200+`.
  The comment must state this exactly. Live-probed s152 flip margins for a signed
  >12-cat comparison (diverging-bar minus 8 vs capless layered-line-area at 8.00):
  sparse **+1.4** (held), mid **-0.6** (flipped), dense **-1.6** (flipped) — so the
  cap held only in the sparse regime, NOT "non-dense".
- **Additive test** (`spec-builder.spec.ts`, +1 → 436 viz-core baseline): the existing
  F4 tests cover sparse (block b) and dense (blocks e/f/g) but NOT mid — the exact cell
  s152/s153 skipped. Add a `~100`-row signed >12-cat comparison: assert `density`
  undefined (mid), `allowNegative` true, `rank(...)[0].pattern.id === 'diverging-bar'`
  AND `score(diverging-bar) > score(layered-line-area)`. Off-shape guards: 1-measure/
  3-dim → `facet-small-multiples-line`, 2-measure/1-dim → `linked-brush-scatter` (both
  NOT diverging-bar) — makes the scoped comment executable.

**Goldens: ZERO** — comment + docs + new test; `golden-profiles.spec.ts.snap` stores
`{chartType,id,score}` tuples from `suggestPatterns`, not comment text or fixture bytes.

---

## m05 — Closeout

No new behavior. Standing sweep: `pnpm install --frozen-lockfile`; root `pnpm
typecheck`; the viz-core re-export typecheck gate **with the `@oods/tokens` build
step** (the s153 CI-fix); both generators + `docs:api --check` NO-OP (#115);
`tokens-validate`; `pnpm -r build`; **DIST-SANITY rebuild before the mcp-server
suite**. Full viz-core (**~465–470**, reconciled from 435 with per-mission delta
attributed) + mcp-server (3978) + `pnpm exec vitest run --project core` (4631,
UNFILTERED, #564 zero golden moved) + `test:scale` (62). **Dual-path live-verify:**
bridge :4466 (key `input`) `color=sales_id` → no `Total Sales id` sum + `colorType`
nominal, faceted line → no sign-inverted Trend; aquex same; shipped-dist
`inferFieldProfile` spot-check `sales_id`(N)/`id_number`(N)/`id_count`(Q)/
`postal_revenue`(Q) + `analyzeVizSpec` faceted → undefined. **Restart pm2
`oods-forge-bridge` (mine).** Confirm no existing case was rewritten (bar prose +
`revenue_by_id`). Do NOT self-declare a genuine-streak position — review is a separate
adversarial session.

---

## Deferred missions (out of s154 scope, per the ratified forks)

- **Fixture-conformance / band mission (fork 1):** add `y2`/`x2` to
  `normalized-viz-spec.schema.json` (EncodingMap properties + channel enum) + the
  generated dashboard-spec source, re-run `generate:schema-types` + docs; then all six
  `patterns-v2` fixtures pass `assertNormalizedVizSpec`, and the F3 spec can
  assert-load `facet-target-band`/`target-band-line`/`layered-line-area` directly. A
  GENERATE-side feature.
- **Concat-phantom mission (fork 2):** detect and suppress (or per-partition compute)
  the cross-partition trend on LayoutConcat specs (`focus-context-line`), without
  false-suppressing legitimate focus+context concats. Needs its own bidirectional
  enumeration.
- **camelCase tokenization (F2 residual):** upgrade `fieldNameTokens` to split
  camelCase, re-enumerating all five hint helpers.
- **zip-stat typing (F2 residual):** a stat-noun set so `zip_income`/`fips_population`
  type quantitative.
