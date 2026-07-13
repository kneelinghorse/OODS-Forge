# Sprint-153 Decision Memo — s152 corrective (F2 HIGH + F3/F4/F1 carries)

**SSOT for a fresh build session. Execute m02→m06 WITHOUT re-grounding.** Every defect below was confirmed RED at HEAD `a93477f` (the shipped s152 commit) via live probe during planning (grounding wf_35852ed7-95c, 4 reproduce-first grounders + synthesis; planning session PS-2026-07-12-007). This sprint is the CORRECTIVE for the s152 review (PS-2026-07-12-006, NOT_GENUINE_CLOSE) — mirrors the s149→s150 gate. **Discipline: SURGICAL, not a redesign** (s149's over-reach is what produced these). Reproduce-RED-in-isolation before each fix; assert the human-readable LABEL/output, not just object shape; run the FULL clean-rebuilt viz-core + mcp-server suite before completing any behavior-mover (m02/m03/m04); DIST-SANITY rebuild before the mcp-server suite; dual-path live-verify (bridge :4466 envelope key `input` NOT `args`, + aquex).

## Resolved forks (Derek-ratified 2026-07-12 via AskUserQuestion)
- **F2 = NARROW + REORDER** (Option C): drop `code`/`sku` from the identifier token set AND move the identifier check after the measure-name rescue. Fixes the 6 measure columns AND measure+id compounds (`revenue_per_id`). Golden-neutral for the reorder half.
- **F3 = line/area ONLY**: `computeTrend` on iff EVERY mark is line or area. `point` is EXCLUDED (would re-arm the phantom scatter+regression trend F3 killed).
- **F4 = Option A scorer gate** (auto-adopted, safe surgical default): the diverging-bar cardinality cap fires on all-positive data only.
- **F1 = CONSOLIDATE** (Option A): one viz-core per-package typecheck gate covering the F1 re-export AND the feedbackId-81 TS2352 sibling. Making the new CI check a REQUIRED branch-protection status = Derek repo-admin next-step, NOT a build action.

## Constraints ledger (hold every mission)
- **#564** — ZERO owned golden regen. The ONLY test churn is the F2 predicate-spec REWRITE (a test edit asserting an intended type-flip, not a `.snap`/`generated.ts`/`.oods`/`diagnostics.json` regen). No behavior-mover moves an mcp-server a11y-equivalence snapshot (pre-cleared: no mcp snapshot narrates a combo spec or the F2 defect field names; the changes are field-TYPE/trend-presence/score, not narrative LABEL wording — unlike s149 F6d).
- **#110** — certify UNTOUCHED (no carry edits certify/conformance).
- **#525** — no new MCP tool.
- **#115** — NO advertised-prose change (inferFieldType, computeTrend, and the scorer are all internal runtime; no `viz.render.input.json` / schema / docs:api edit). Every generator `--check` + `docs:api --check` is expected NO-OP.
- **Determinism** — no `Date`/`random`; no ordering nondeterminism.
- **a11y bar** — ADVANCES net (F2 restores correct measure typing; F3 restores a legitimate narrative finding). NO a11y predicate touched; NO value probe (`.some()`/`.every()` over data VALUES) introduced or tightened.

## Interactions (grounding-verified DISJOINT, parallel-safe; run strict-Requires linear anyway for corrective discipline)
- F2 → `builder/spec-builder.ts`; F3 → `a11y/data-analysis.ts`; F4 → `patterns/suggest-chart.ts` (+ `index.ts` comment); F1 → `package.json` + `ci.yml` + a spec + new spec. No two fixes touch the same file.
- One semantic path checked + cleared: F2 mutates the profiler (SchemaIntent) feeding the recommender (F4's domain) + golden-profiles. Grep-verified: golden-profiles carries NO id/code/sku/uuid/guid field name and no JSON golden infers the six defect columns → F2 type-flips cannot ripple into F4 scoring fixtures or the shared recommender snapshot.

---

## m01 — SSOT decision memo (Completed-at-creation)
This file. Carries the resolved forks, per-mission exact edits + golden inventory (every predicted churn cites its grep-verified asserting file, else zero-golden + new colocated test per the standing rule), boundary/compound test inventory, constraints ledger, closeout sweep.

## m02 — F2 numeric-measure misclassification (HIGH, first, TOP RISK)
**Defect (RED@HEAD):** `nameHintsIdentifier` (`spec-builder.ts:1114-1116`) matches bare `['id','ids','code','sku','uuid','guid']` at rule-(3) `:1038`, returning `'nominal'` BEFORE the rule-(3b) `nameHintsMeasure` rescue at `:1046`. (a) numeric MEASURES with `code`/`sku` tokens (`lines_of_code`, `code_coverage`, `code_complexity`, `sku_price`, `sku_revenue`) misclassify nominal → the measure silently becomes a dimension (dropped from recommender/gradient/narrative/table); (b) measure+identifier compounds (`revenue_per_sku`, `revenue_per_id`) demote because identifier precedes measure.
**Reproduce-RED (isolation):** probe `inferFieldType(name, ['1','2',...])` (or the exported profiler path) for the six columns → all `'nominal'` at HEAD. Assert `'quantitative'` after; assert `store_id`/`uuid`/`guid` stay `'nominal'`.
**Fix (two surgical edits inside `inferFieldType`):**
- EDIT 1 (NARROW), `:1116`: `['id','ids','code','sku','uuid','guid']` → `['id','ids','uuid','guid']`. Update the token-list comment `:1032` and the header comment `:1108-1113` to drop `code`/`sku` (comment-only).
- EDIT 2 (REORDER), `:1038-1048`: remove `nameHintsIdentifier` from the rule-(3) OR; add a new rule-(3c) block AFTER the rule-(3b) `nameHintsMeasure` rescue:
  ```
  if (nameHintsZip(name) || nameHintsCurrencyCode(name)) {   // (3) zip/currency — never measure-token'd, stay first
    return 'nominal';
  }
  if (nameHintsMeasure(name)) {                               // (3b) measure name wins
    return 'quantitative';
  }
  if (nameHintsIdentifier(name)) {                            // (3c) NEW — id/ids/uuid/guid, AFTER measure so revenue_per_id → quantitative
    return 'nominal';
  }
  ```
**Hard constraints:** no a11y predicate; the only `.some()` is over the token LITERAL array (never data VALUES); `numericView` null-tolerance untouched.
**Golden inventory:** MOVES — `packages/viz-core/test/data-analysis-predicates.spec.ts` (the identifier assertions ~`:310-319`, specifically the `product_code`/bare-`sku` cases ~`:317-318`). This is an INTENDED flip: numeric-string `product_code`/`sku` now type `quantitative` (= pre-s152 typing; a narrower fix, NOT a new regression). REWRITE the assertions + test titles to assert the flip — do NOT "restore green" by reverting the fix.
**New/boundary tests (assert the type + the human-readable narrative, not just shape):** the 6 measure columns → quantitative; compound `revenue_per_id`/`amount_per_uuid`/`revenue_per_sku` → quantitative (pins REORDER); `store_id`/`uuid`/`guid` → nominal preserved; a bare numeric-string `store_id` heatmap narrative falls back to the Y measure + table `isNumeric:false` (the #895 target still fixed).
**Risk:** HIGHEST. Profiler feeds the whole recommender/narrative/certify chain. Pre-cleared fixtures, but reproduce-RED MUST confirm all six flip + the three IDs stay nominal, and the FULL mcp-server suite MUST run before m02 completes (the s149 lesson: a profiler change surfaces where you didn't reason it would).

## m03 — F3 layered line/area lost trend (MED)
**Defect (RED@HEAD):** `computeTrend = bindings.mark === 'line' || bindings.mark === 'area'` (`data-analysis.ts:193`) gates on the COLLAPSED mark; `resolveMark` returns `'mixed'` for ≥2 distinct marks, so the committed `examples/viz/patterns-v2/layered-line-area.spec.json` (`MarkArea+MarkLine+MarkLine`) → `analyzeVizSpec(spec).trend===undefined` → the legitimate "Trend increasing" keyFinding s151 narrated is gone. All 3 committed pure line+area combos (`layered-line-area`, `facet-target-band`, `target-band-line`) are affected.
**Reproduce-RED (isolation):** load `layered-line-area.spec.json` → `analyzeVizSpec().trend===undefined` + `generateNarrativeSummary` keyFindings has NO "Trend ..." at HEAD. Assert `trend` defined + a "Trend" keyFinding present after.
**Fix (two surgical edits):**
- Add a MODULE-LOCAL helper after `isStripPlot` (~`:169`, before `analyzeVizSpec`):
  ```
  function isSequenceComposition(spec: NormalizedVizSpec): boolean {
    return spec.marks.length > 0 && spec.marks.every((mark) => {
      const normalized = normalizeMark(mark.trait);
      return normalized === 'line' || normalized === 'area';
    });
  }
  ```
- Replace `:193`: `computeTrend: bindings.mark === 'line' || bindings.mark === 'area',` → `computeTrend: isSequenceComposition(spec),`
- Do NOT touch the summary switch (`narrative-generator.ts:185-236` — 'mixed' still hits the default "covers/totaling" summary) or the correlation gate (`:194`).
**Behavior:** byte-identical for every single-mark and multi-SAME-mark spec (verified); changes ONLY pure line/area LAYERED combos false→true. Heterogeneous combos (bar+line, point+line, line+rect) stay false — any bar/point/rect mark fails `.every` → no phantom trend reintroduced (this is why `point` is excluded per the ratified fork).
**Golden inventory:** NONE moves (grep-verified: no test builds a mixed area+line spec, no snapshot contains a Trend finding). NEW colocated test REQUIRED (standing rule — no existing asserting golden): `packages/viz-core/test/data-analysis-mixed-line-area-trend-s153.spec.ts`.
**Boundary tests:** layered-line-area → "Trend" keyFinding RESTORED; single line/area → trend still on; bar/point/rect/strip/heatmap → still suppressed; bar+line combo → suppressed; **point+line combo → suppressed** (pins the line/area-only decision, guards against a future point re-inclusion).
**Risk:** LOW.

## m04 — F4 signed diverging-bar cardinality over-cap (MED)
**Defect (RED@HEAD):** the s152 `maxSeriesCardinality:12` on diverging-bar (`patterns/index.ts:468`) drops the `CARDINALITY_OVERFLOW_PENALTY` (−8) onto a SIGNED (`allowNegative`) >12-cat DENSE (≥200-row) comparison, flipping the confident pick to the CAPLESS `layered-line-area` (`:984`) and breaking the s152 "signed >12-cat still elects diverging-bar" guarantee (which was live-verified only NON-dense, where a +2 `density:'sparse'` match masked the cap). `evaluateCardinality` (`suggest-chart.ts:137-147`) is unconditional-on-sign; the sibling `evaluateDivergingFit` (`:167-169`) already all-positive-gates diverging demotion on `schema.allowNegative === false`.
**Reproduce-RED (isolation):** score a `{measures:1,dimensions:1,temporals:0,goal:'comparison',allowNegative:true,density:'dense',maxNominalCardinality:13}` intent → top.pattern.id !== `'diverging-bar'` (flips to layered-line-area) at HEAD. Assert top === `'diverging-bar'` after.
**Fix (one scorer edit, symmetric with `evaluateDivergingFit`):** in `evaluateCardinality`, after the early-return block (`:140-142`) and BEFORE `signals.push`:
  ```
  // s153 F4 corrective: the overflow cap on diverging-bar (the ONLY allowNegative pattern) was
  // meant to demote it on ALL-POSITIVE >12-cat floods only — where evaluateDivergingFit already
  // flags the "positive AND negative" contradiction. On genuinely SIGNED data the cap must not bite.
  if (pattern.heuristics.allowNegative && schema.allowNegative === true) {
    return 0;
  }
  ```
Also refresh the stale registry comment `index.ts:461-467` (the cap now bites all-positive only — the "signed still elects diverging-bar" line becomes true, not aspirational). Comment-only; no registry field change.
**Scope proof:** `pattern.heuristics.allowNegative` is true for diverging-bar ALONE (grep-verified) → zero blast radius beyond it.
**Golden inventory:** NONE moves (no JSON golden references diverging-bar; the signed golden-profiles fixture is card-4, cap never engages; the s152 F4 tests use `allowNegative=false` inputs, unaffected). ADD 3 dense signed tests to the existing s152 F4 describe in `packages/viz-core/test/spec-builder.spec.ts` + fix the stale `// 9.4 > 6.4` comment at `:944`. The s152 F4 "vacuously green" signed regression test becomes MEANINGFUL after this fix.
**Risk:** LOW.

## m05 — F1 barrel re-export red gate (LOW, land LAST)
**Defect (RED@HEAD, mutation-proved):** the s152 F1 re-exports (`Mark/DataSource/EncodingMap/Transform`, `normalized-viz-spec.ts:12-15`) have NO red gate — root CI `tsc --noEmit` (`ci.yml:130`) doesn't reach `packages/viz-core/src`, tsup strips types, vitest is runtime-only, viz-core has no `typecheck` script → deleting any re-export leaves all gates green.
**Fix (three additive touches + one new test):**
1. `packages/viz-core/package.json` scripts: add `"typecheck": "tsc --noEmit -p tsconfig.json"`. Reuse the existing tsconfig (`include:["src/**/*"]` already covers `.spec.ts`; `--noEmit` overrides declaration/outDir — nothing emitted, dist stays clean).
2. `.github/workflows/ci.yml`: in the existing `typecheck` job, add a step after `:131` — `pnpm --filter @oods/viz-core run typecheck`.
3. `packages/viz-core/src/adapters/echarts/oods-echarts-chrome-bake.spec.ts:162`: `} as SpatialSpec;` → `} as unknown as SpatialSpec;` (the feedbackId-81 sanctioned #822 double-cast — the SOLE pre-existing viz-core src error the gate surfaces; mutation-proved that after this edit `tsc --noEmit -p packages/viz-core/tsconfig.json` exits 0 empty). Runtime-identical.
4. NEW `packages/viz-core/src/spec/re-export-surface.example.spec.ts`: type-level `expectType`-style witnesses giving `DataSource`/`EncodingMap`/`Transform` teeth (else only `Mark` is gated). REQUIRED in this mission or 3 of 4 re-exports stay ungated.
**Golden inventory:** NONE (fully additive, test/CI-only; zero product source, zero golden, zero adapter/certify/schema change).
**Scope proof:** the gate surfaces EXACTLY ONE pre-existing error (feedbackId 81), no balloon.
**Derek next-step (repo-admin, NOT a build action):** make the new viz-core CI typecheck a REQUIRED branch-protection status check.
**Risk:** LOW.

## m06 — Consolidated closeout + DIST-SANITY + dual-path live-verify
Full standing gate sweep: `pnpm install --frozen-lockfile` → ROOT `pnpm typecheck` → **NEW** `pnpm --filter @oods/viz-core run typecheck` (F1 gate, expect exit 0 empty) → both generators `--check` (generate:schema-types, docs:api) + `tokens-validate` — **all expected NO-OP** → `pnpm -r build` → **DIST-SANITY rebuild** `pnpm --filter @oods/viz-core build` BEFORE the mcp-server suite (F2/F3/F4 change viz-core src consumed via DIST) → viz-core `vitest run tests/ --project core` (was 393, expect +~6: F2 rewrite+explicit, F3 +1 file, F4 +3) → mcp-server (3978, expect UNCHANGED) → test:scale (62) → root core (4631) → vendored-parity → dual-path live-verify (:4466 pm2 bridge restart + aquex, shipped dist).
**Behavior-movers requiring the FULL viz-core + mcp-server suite BEFORE mission-complete: m02, m03, m04** (all touch viz-core → mcp-server a11y-equivalence risk; no snapshot PREDICTED to move, but run it — the s149 F6d lesson). **m05 is test/CI-only** → no DIST rebuild / mcp-server behavior re-run; confirm root typecheck + `-r build` + the new gate stay green.
No #564 byte-movers (zero golden regen).

## Mission graph
m01 (Completed-at-creation) → m02 (F2) → m03 (F3) → m04 (F4) → m05 (F1, last) → m06 (closeout). Strict-Requires linear.
