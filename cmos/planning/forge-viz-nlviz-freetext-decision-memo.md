# Forge Viz — NL→viz FREE-TEXT half: `viz.fromText` (Claude parser above the deterministic boundary) + nvBench-style accuracy gate Decision Memo

| | |
|---|---|
| **Decision** | s132-m01 keystone (captured at mission close) |
| **Sprint** | sprint-132 |
| **Root mission** | s132-m01 |
| **Date** | 2026-06-28 (authored); Derek-locked at planning 2026-06-26 |
| **Status** | **RATIFIED** — Derek-locked at planning (decision #965, via AskUserQuestion); grounded by `wf_61cf1556-d00` (6 live-repo scopes + synthesis + adversarial critic, verdict **READY_WITH_CORRECTIONS / high** — 1 blocker + 4 amendments baked in). **RE-GROUNDED at m01 build by `wf_a14249bc-957`** (6 live-repo scopes against HEAD `0f17e8b`; every pinned anchor re-verified — drift + caveats carried in §6). |
| **Origin** | Phase-3 DEPTH → DIFFERENTIATOR. Predecessor: `forge-viz-nlviz-decision-memo.md` (s131, decision #961) shipped the NL→viz hand-off's **deterministic CORE** — a typed `StructuredIntent` → recommender-chosen, governed-narrated chart through `viz.render`, byte-deterministic. **This memo opens the deferred SECOND half of that hand-off — the genuinely greenfield free-text / LLM half** — by shipping `viz.fromText`: a free-text utterance → a Claude parser ABOVE the tool boundary emits the FROZEN s131 `StructuredIntent` → routed through the UNCHANGED, byte-deterministic `viz.render` → a governed chart, made measurable by an nvBench-style accuracy gate. |

**Companion docs:** `forge-viz-nlviz-decision-memo.md` (s131 — the deterministic core this rides; the frozen `StructuredIntent` contract is its §2); `forge-viz-flagship-strategy.md` §3/§4/§5/§6 (moat thesis + next frontier); `cmos/research/DSV-045-results(1).md` ("LLM emits structured intent, never a raw spec; render stays deterministic" — the split this sprint realizes end-to-end); `near.md`:49-58.

---

## 0. What this sprint adds (the thesis)

s131 shipped the NL→viz hand-off's **deterministic core**: an agent calls `viz.render` with a typed `StructuredIntent { goal, measures[], dimensions[], chartFamily?, measureRef? }` + `rows`, and gets back a recommender-chosen, governed-narrated chart — byte-deterministic, zero output-schema change. The contract was built to be the **stable shape an NL parser emits**, not a throwaway.

s132 opens the **second half — the free-text / LLM half** (the split DSV-045 prescribes: *"LLM emits structured intent, never a raw spec; render stays deterministic"*). The slice:

> An agent calls a NEW MCP tool `viz.fromText` with a free-text `text` utterance + `rows`. A thin **Claude provider** (Anthropic `@anthropic-ai/sdk`, model `claude-opus-4-8`) running **ABOVE the tool boundary** parses the utterance into the EXACT frozen s131 `StructuredIntent` via structured tool-use output. `viz.fromText` routes that intent through the **UNCHANGED** `viz.render` AJV+render path and returns the render result PLUS an **ECHO of the parsed intent** (advisory — so the agent can re-run `viz.render(intent)` deterministically). The non-determinism is contained to the PARSE and made measurable by an **nvBench-style accuracy gate**.

The moat pillar at stake (strategy §1): **"governed + explainable BY CONSTRUCTION, deterministic by default."** The discipline that keeps it honest: **the LLM lives strictly ABOVE the tool boundary.** `viz.render`'s `handle()` NEVER calls an LLM (VERIFIED `viz.render.ts:53-288`, `index.ts:223-318`, §6) and stays byte-deterministic. `viz.fromText` IS non-deterministic at the tool level (it calls the parser) — so its tests do NOT join the byte-identical viz-determinism golden job; its determinism story is a **passthrough-equivalence** proof (parse replayed to a fixed intent → output byte-identical to `viz.render(sameIntent)`).

**Depth-not-breadth held — 3 greenfield strands only.** The parser + provider (m02), the `viz.fromText` tool (m03), the eval gate (m04). The dimension registry is DEFERRED to s133 with its full spec frozen here (§9) so s133 needs no re-grounding. See §8 OOS.

---

## 1. The pinned calls (Derek-ratified 2026-06-26)

| Call | Decision | Where |
|---|---|---|
| **PROVIDER = Anthropic `@anthropic-ai/sdk`, model `claude-opus-4-8`** | The bare model id, NO date suffix — current Opus per house policy. The exact SDK call shape (client construction, tool-use / structured-output request) is confirmed via the **`claude-api` skill at m02 build time, NOT from memory.** `ANTHROPIC_API_KEY` via the EXISTING `load-env.ts` dotenv pattern (VERIFIED `load-env.ts:1-9`). | §3 |
| **MCP SURFACE = SHIP `viz.fromText` as a NEW registered MCP tool** | s132's ONE consumer-observable MCP delta. NOT agent-layer-only (which ships zero MCP surface = the paper-drift the flagship-reanchor memory warns against, and the reason s131 chose Option B). Registered ONCE in `registry.json` + `index.ts` toolSpecs ⇒ AJV input validation + policy + telemetry for free, both serving paths (aquex adapter + `:4466` bridge). | §4 |
| **BOUNDARY = the LLM lives strictly ABOVE the tool boundary** | `viz.render`'s `handle()` never calls an LLM (VERIFIED §6) and stays byte-deterministic; the parser PRODUCES the frozen `StructuredIntent` and routes it through the UNCHANGED `viz.render` (no render-path change, no scorer-term change). `viz.fromText` ECHOES the parsed intent so the parse is ADVISORY — re-runnable deterministically by the agent. | §2, §4 |
| **DIMENSION REGISTRY = DEFER to s133** | FREEZE the full spec + the `OODS-V143` error-code reservation in THIS memo (§9) so s133 executes without re-grounding. Keeps s132 to 3 greenfield strands (DEPTH-NOT-BREADTH). | §9 |
| **EVAL GATE = chartType-accuracy over ~few-dozen labeled NL→intent pairs** | FAOSTAT data side reused (the s118 fixture); the labeled NL side net-new authored. Over the 5 tabular marks + thin-goal negatives. START **REPORT-ONLY** (schema-validity = the DSV-045 >5%-invalid alarm); flip to a blocking threshold once a baseline stabilizes (Derek picks the number then). Offline fixture-replay default + opt-in live, in a NEW CI job. | §5 |
| **AMBIGUITY POSTURE = SINGLE-CALL DETERMINISTIC** | The parser emits ONE top intent and reuses `viz.render`'s EXISTING `alternatives[]` channel (VERIFIED `viz.render.ts:228-230`). No multi-turn, no new ambiguity field — ratified decision #961, CARRIED, not re-litigated. | §4 |

---

## 2. The boundary discipline + the FROZEN `StructuredIntent` contract

**The contract does NOT change this sprint.** The parser emits the EXACT s131 `StructuredIntent`; `viz.render` is byte-unchanged. The shape (FROZEN, VERIFIED at HEAD `0f17e8b`, `spec-builder.ts:173-184`, exported via `export * from './builder/spec-builder.js'` at `src/index.ts`):

```ts
export interface StructuredIntent {
  readonly goal: IntentGoal;                                          // the LIVE 7-value union
  readonly measures: ReadonlyArray<IntentField>;                      // IntentField = { name: string; type?: FieldType }  (spec-builder.ts:151-154)
  readonly dimensions: ReadonlyArray<IntentField>;
  readonly chartFamily?: IntentChartFamily;                           // 5 tabular marks ONLY (spec-builder.ts:163)
  readonly measureRef?: string;                                       // ^gm\.  (governed overlay)
}
```

- **`goal` = the LIVE 7-value `IntentGoal` union** (VERIFIED `patterns/index.ts:26-33`): `comparison | trend | composition | part-to-whole | relationship | intensity | distribution`. The parser MUST constrain its output to exactly these 7.
- **`chartFamily` = the 5 TABULAR marks ONLY** (VERIFIED `IntentChartFamily`, `spec-builder.ts:163`, AJV-enforced `viz.render.input.json:373`): `'bar' | 'line' | 'area' | 'scatter' | 'heatmap'`. The 8 explicit-only types (`treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord`) are AJV-rejected — the parser must never emit them.
- **`measureRef` constrained to `^gm\.`** (VERIFIED `viz.render.input.json:378`). There are **FIVE** governed measures (VERIFIED at s131 m01 — the original "4" was a re-grounding correction; do NOT regress it): `gm.revenue.total`, `gm.revenue.latest`, `gm.revenue.distinct`, `gm.export.value.total`, `gm.export.unit_price`. The parser may emit a `measureRef` **ONLY** for one of these governed entries (§3 guarantee 2). Full governed-attribute table: see `forge-viz-nlviz-decision-memo.md` §2 (the FROZEN authority).

**THE PARSER'S THREE NON-NEGOTIABLE GUARANTEES (critic-verified acceptance assertions, §6):**

1. **ALWAYS emit `dimensions:[]` — never omit.** `buildFromIntent` spreads `intent.dimensions` raw (VERIFIED `spec-builder.ts:336`: `const namedFields = [...intent.measures, ...intent.dimensions];`) — a missing `dimensions` array throws a TypeError before any AJV/governance check. (`measures` is spread identically on the same line — emit `measures:[]` too, never omit.)
2. **`measureRef` ONLY for a KNOWN governed `gm.*` entry.** An unknown `measureRef` is a HARD `OODS-V130` regardless of `includeA11y` (VERIFIED `viz.render.ts:141-148`: `registry.get(...)` then `if (!entry) → errorOut('OODS-V130', …)`, gated only on `measureRef` PRESENCE, not on `includeA11y`). A hallucinated `gm.*` ref = a hard fail, not a degraded render. The parser omits `measureRef` rather than guess.
3. **Route EXCLUSIVELY through the `viz.render` AJV boundary — never call `buildFromIntent` raw.** The intent is validated by `viz.render.input.json` (the 7-goal enum, 5-mark family, `^gm\.` pattern) BEFORE it reaches the builder. The parser is above the boundary; the boundary is the contract enforcer.

---

## 3. The Claude provider + free-text→`StructuredIntent` parser (m02) — enabling

A NET-NEW (greenfield — ZERO LLM SDK exists in the repo today, VERIFIED §6) thin module that sits ABOVE `viz.render`. **Enabling — no MCP delta alone** (the delta is m03's `viz.fromText`). Both m03's tool and m04's eval harness import it.

### 3.1 Dependency — the frozen-install ordering (HARD success criterion)

`@anthropic-ai/sdk` is added to `packages/mcp-server/package.json` (deps block VERIFIED `:31-46`; not present today). **Ordering — in THIS sequence, BEFORE any CI run** (all 12+ CI jobs + local closeout go red on a stale lockfile):

1. non-frozen `pnpm install` to add `@anthropic-ai/sdk` to `packages/mcp-server`;
2. **commit the `pnpm-lock.yaml` delta**;
3. verify `pnpm install --frozen-lockfile` passes locally.

### 3.2 Provider module

A thin Claude provider: default model `claude-opus-4-8` (bare id, no date suffix). **Confirm the exact SDK call shape via the `claude-api` skill at build time, NOT from memory** — client construction + the tool-use / structured-output request that forces the typed shape. `ANTHROPIC_API_KEY` is read from `process.env` after the existing `load-env.ts` dotenv load (VERIFIED `load-env.ts:1-9` — a single `loadEnv({ path: <root>/.env })` at startup; `dotenv ^17.4.2` already a dep). Two modes:

- **Offline fixture-replay (DEFAULT test path):** recorded provider outputs, deterministic, cheap. **MUST NOT require `ANTHROPIC_API_KEY`** so it runs in secret-less PR CI (the m04 eval test runs here under the `core` project — §5).
- **Opt-in live mode:** real provider call, for scheduled/labeled accuracy runs.

### 3.3 The parser

`parse(text, rows) → StructuredIntent`. Use Claude **tool-use / structured output** so the model emits the typed shape, NOT free prose. The parser enforces the §2 three guarantees at its own boundary (always `dimensions:[]`/`measures:[]`; `measureRef` only for a governed `gm.*`; `goal` ∈ the 7, `chartFamily` ∈ the 5) AND routes the result EXCLUSIVELY through `viz.render`'s AJV boundary. **ZERO viz-core change.**

**UNIT TESTS:** parser emits well-formed `StructuredIntent` (`dimensions:[]`/`measures:[]` always present; `goal`/`chartFamily` in-enum; `measureRef` only for `gm.*`); offline fixture-replay determinism; live mode opt-in. Native-learning capture (single-string `cmos_session`) is a HARD gate.

---

## 4. `viz.fromText` — the new MCP tool (m03) — the consumer-observable delta (the long pole)

### 4.1 Registration

Add `viz.fromText` to `packages/mcp-server/src/tools/registry.json` + the `index.ts` toolSpecs (the dispatch block VERIFIED `index.ts:223-318`) — ONE registration ⇒ AJV input validation + policy + telemetry for free, both serving paths (aquex adapter + `:4466` bridge). Two-layer tool policy applies (agents.md): register in BOTH `configs/agent/policy.json` AND `packages/mcp-server/src/security/policy.json`, or enforcement/visibility diverge.

### 4.2 Input schema

A new `packages/mcp-server/src/schemas/viz.fromText.input.json`, `additionalProperties:false`:

```jsonc
{
  "text":   "string  (REQUIRED — the free-text utterance)",
  "rows":   "array   (REQUIRED v0.1 — assembleSpec embeds data.values; a rows-less intent renders an empty chart)",
  "datasetRef": "string (optional)",
  "output": "object (optional — passthrough to viz.render: includeA11y, compact, echarts …)"
}
```

`rows` is REQUIRED for v0.1 — same constraint as `buildFromIntent` (rows-less / `datasetRef`-only is an s131-carried deferral, §8).

### 4.3 Handler

`handle()` → `parse(text, rows)` (m02) → `StructuredIntent` → route that intent through the **EXISTING** `viz.render` intent branch (the s131 path that calls `buildFromIntent` THROUGH the AJV boundary — **NEVER call `buildFromIntent` raw**). Return the `viz.render` result PLUS an **ECHO of the parsed intent** as an advisory output field, so the agent can re-run `viz.render(intent)` deterministically. **NO change to `viz.render` itself; NO scorer-term change.** The single-call ambiguity posture (#961) is satisfied by reusing `viz.render`'s existing `alternatives[]` (VERIFIED `viz.render.ts:228-230`) — no new field.

### 4.4 Determinism story (critic-pinned)

`viz.fromText` is **NON-deterministic at the tool level** (it calls the LLM parser). Therefore:

- Its tests MUST NOT be named to match the ci-golden-list guard regex `/^(viz\.render|dashboard\.render)(\..*)?\.test\.ts$/` (VERIFIED `ci-golden-list.guard.test.ts:30`) and MUST NOT be added to the viz-determinism colocated golden run-string (VERIFIED `ci.yml:615`).
- Its ONLY determinism golden is a **PASSTHROUGH-EQUIVALENCE** proof: `viz.fromText` with a **REPLAYED fixed intent** produces output byte-identical to `viz.render(sameIntent)` — render-given-a-fixed-intent is deterministic; only the parse varies.
- **BUILD NOTE (§6 caveat):** `viz.render`'s CHART payload is deterministic, but the trailing **`specRef` envelope is non-deterministic BY DESIGN** (`schema-ref.ts:39/43/65` mints a `crypto.randomUUID` id + `Date.now()` timestamps AFTER the deterministic compute). The passthrough-equivalence golden must reuse whatever specRef normalization the existing `viz.render` determinism goldens already apply — confirm the approach against `viz.render.intent.test.ts` / the determinism harness when authoring the golden. Do NOT assert raw-output byte-equality without that normalization.

### 4.5 Codegen + docs

Re-run Generator A (`generate:check`) so `generated.ts` gains the `viz.fromText` input type + `docs:api --check` + update `packages/mcp-adapter/tool-descriptions.json` so the agent sees `viz.fromText`. `generate:check` stays GREEN.

After landing: rebuild viz-core + mcp-server dist two-layer, restart `pm2 oods-forge-bridge`. **AQUEX gotcha (bit s130-m03):** the new `viz.fromText` tool is invisible to the aquex advertised-schema cache until RECONNECT — verify it live via DIRECT dist invocation or `:4466` POST `/run`, NOT the connect-time-cached aquex tool.

---

## 5. The nvBench-style accuracy eval gate (m04) — the governance surface for the LLM half

The gate that makes the non-deterministic parser measurable. **No consumer MCP delta.**

1. **NEW FILE, NOT a rewire (THE BLOCKER).** Do NOT rewire the existing `src/tools/viz.render.intent.test.ts` in place — it is enumerated in the viz-determinism colocated golden run-string (VERIFIED `ci.yml:615`) and matched by the guard regex, so an in-place parse-driven rewire would inject a non-deterministic LLM call into a byte-identical determinism gate. The existing skeleton stays as the deterministic acceptance check. Author the accuracy assertion in a **NEW file** named OUTSIDE `/^(viz\.render|dashboard\.render)/`, e.g. `packages/mcp-server/test/nlviz-accuracy.eval.test.ts`.
2. **FILE PLACEMENT (§6 drift — corrected from the lock text).** The file MUST live under `packages/mcp-server/test/**` as `*.test.ts`/`*.spec.ts` so the **ROOT `vitest.config.ts` `'core'` project** picks it up (VERIFIED ROOT `vitest.config.ts:109` `name:'core'`, include `:110-118`, mcp-server globs `test/**` at `:115-116` — there is NO `src/tools/**` entry; a colocated `src/tools` test is silently un-run by `core`). **NOTE the lock text's `vitest.config.ts:113-121` anchor was wrong** — `packages/mcp-server/vitest.config.ts` is 21 lines with no `'core'` project; the sole `'core'` project is in the ROOT config.
3. **NEW CI JOB + EXPLICIT RUN-STRING (AMENDMENT).** Add a NEW accuracy-threshold CI job whose run-string EXPLICITLY names the eval test; it is the seam where the report-only→blocking flip lands later and where the opt-in LIVE mode is triggered (scheduled/labeled). The test MUST NOT be appended to the determinism colocated run-string (`ci.yml:615`). (Under `core` it runs offline/fixture-replay on every PR for the cheap schema-validity floor; the new job is the accuracy-threshold governance surface.)
4. **CORPUS.** ~few-dozen labeled NL→intent pairs — data side reused from the s118 FAOSTAT fixture (`faostat-tradeflow.fixture.ts` per the sprint anchor; confirm the exact path at build); the labeled NL side net-new authored. Scope to the 5 tabular marks + thin-goal negatives (intensity/distribution with insufficient fields fail-loud, not chart). Structure as the utterance→expected-intent→expected-chartType table s133 extends.
5. **METRIC + GATING.** Assert `parse(utterance) → intent → chartType === expectedChartType`. Two metrics: **chartType-accuracy (PRIMARY)** + **schema-validity (the DSV-045 >5%-invalid ALARM)**. **START REPORT-ONLY** — compute + log/emit accuracy, do NOT fail the build on an accuracy drop (so the `core` run does not red on a regression); the eventual hard threshold + the schema-validity floor land when a baseline stabilizes (Derek picks the number). Offline fixture-replay default (deterministic, cheap, secret-less PR CI) + opt-in live mode.

No schema change (tests + fixtures + a CI job only). Native-learning capture is a HARD gate.

---

## 6. Re-grounded anchors (VERIFIED against HEAD `0f17e8b` — `wf_a14249bc-957`)

The planning-lock text pinned several anchors that have shifted or were imprecise. **m02–m05 follow THIS table, not the raw lock text.** (1 DRIFT, the rest CONFIRMED-with-offset or framing nits.)

| # | Lock / pinned anchor | Live repo HEAD `0f17e8b` (USE THIS) |
|---|---|---|
| 1 | `viz.render` `handle()` at `viz.render.ts:53-274` | `53-288` (grew ~14 lines via the s130 `includeA11y` governed-measure prepend `:245-265` + the `specRef`/catch block `:266-288`). Same code; offset only. |
| 2 | `index.ts` dispatch `:222-318` | `223-318` (line 222 is a leading comment; `reg.handle(input)` at `:282`). |
| 3 | `StructuredIntent` shape `spec-builder.ts:151-194` | Interface at `:173-184`; `IntentField` at `:151-154`. Shape + the 7-goal/5-mark enums INTACT. |
| 4 | `dimensions` raw spread `spec-builder.ts:336` | EXACT: `const namedFields = [...intent.measures, ...intent.dimensions];`. **`measures` spread identically — a missing `measures` array throws the same TypeError.** Emit BOTH as `[]`. |
| 5 | unknown `measureRef` → `OODS-V130` `viz.render.ts:141-148` | EXACT. Block `:130-148`, fires whenever `measureRef` is present, gated on PRESENCE not `includeA11y`. |
| 6 | next-free error code = `OODS-V143`; "V140/V141/V142 are s130 codes" | **`OODS-V143` CONFIRMED next-free** (`registry.ts`: viz band V120–V142, header `:90`, V142 last `:168`; V143–V199 free; V200+ = Map band `:171`). **Framing fix:** only **V142** is the s130 measure-narrative code — V141 is s129 m03, V140 is s123 A1 (style-library key). |
| 7 | guard regex `ci-golden-list.guard.test.ts:30-69` | EXACT at `:30`: `/^(viz\.render\|dashboard\.render)(\..*)?\.test\.ts$/`. |
| 8 | viz-determinism run-string `ci.yml:615` | EXACT — 12 `*.test.ts` files incl. `src/tools/viz.render.intent.test.ts` (the s131 skeleton — do NOT rewire) + `ci-golden-list.guard.test.ts`. |
| 9 | **DRIFT** — `'core'` vitest project at `packages/mcp-server/vitest.config.ts:113-121` | **WRONG path.** `packages/mcp-server/vitest.config.ts` is 21 lines, NO `'core'` project. The sole `'core'` project is in the **ROOT `vitest.config.ts:109`** (include `:110-118`; mcp-server globs `test/**/*.test.ts` `:115` + `*.spec.ts` `:116`; **no `src/tools/**`**). m04's eval test → `packages/mcp-server/test/**`. |
| 10 | `load-env.ts:1-40` for `ANTHROPIC_API_KEY` | File is **9 lines** (`packages/mcp-server/src/load-env.ts:1-9`): one `loadEnv({ path: <root>/.env })` at startup. `dotenv ^17.4.2` already a dep (`package.json:42`). |
| 11 | `alternatives[]` at `viz.render.ts:219-232` | Emission at `:228-230` (block `219-232`); engine type `spec-builder.ts:143`, built `:391`, emitted `:421`. |
| 12 | `@anthropic-ai/sdk` target = `packages/mcp-server/package.json` | EXISTS; deps block `:31-46`; SDK NOT present today (greenfield). |
| 13 | ZERO LLM SDK today | CONFIRMED — no `@anthropic-ai`/`openai`/`@google/genai`/etc. as a dep or import anywhere. Incidental: `configs/agent/policy.json:404-405` has an `"openai.agents"` **access-control IDENTITY** (not an SDK, not a dep). |
| 14 | governed measures count | **FIVE** (`gm.revenue.total`, `gm.revenue.latest`, `gm.revenue.distinct`, `gm.export.value.total`, `gm.export.unit_price`) — the parser's `measureRef` may target ONLY these. Do NOT hardcode a 4-element set. |
| 15 | **CAVEAT** — `viz.render` byte-determinism | The CHART payload is deterministic; the trailing **`specRef` envelope is non-deterministic by design** (`schema-ref.ts:39/43/65`: `crypto.randomUUID` + `Date.now`). m03's passthrough-equivalence golden must reuse the existing determinism golden's specRef normalization (§4.4). |

---

## 7. Process gates + held constraints (every mission)

- **#525** — sole consumer is an agent over MCP/JSON: `viz.fromText` serves that consumer; the LLM is above the boundary, NEVER inside `viz.render`.
- **#564 additive default-off floor** — the s131 both-direction goldens + `viz.render` treemap/sankey + `dashboard.render` KPI + fidelity snaps stay byte-identical (`viz.fromText` is additive — it does not touch `viz.render`). `viz.fromText`'s tests stay OUT of the viz-determinism job.
- **NO scorer-term change** — the parser + eval are above-the-boundary / post-filter only (protects the s110 recommender goldens).
- **FROZEN structured-intent contract** — the parser emits the EXACT s131 `StructuredIntent` (§2); NO viz-core render-path change.
- **Single-call ambiguity posture (#961)** — ONE top intent + `viz.render`'s existing `alternatives[]`; no multi-turn, no new ambiguity field. Carried, not re-litigated.
- **Per-mission native-learning HARD capture** — single-string `cmos_session` capture (NOT `cmos_mission_transition` `decisions[]`, which gets stripped).
- **Two-layer + full cross-package closeout** — `pnpm install --frozen-lockfile` (absorbs `@anthropic-ai/sdk`) + ROOT `pnpm typecheck` + two-layer build + Generator A `generate:check` + Generator B `generate:schema-types --check` + `docs:api --check` + a11y-contract + viz-determinism + the NEW accuracy job (report-only).
- **Bridge rebuild + `pm2 oods-forge-bridge` restart + RECONNECT** — `viz.fromText` is invisible to the aquex advertised-schema cache until reconnect; verify via direct dist / `:4466`, NOT the cached aquex tool (the s130-m03 gotcha).

---

## 8. What m01 ships + OOS + the s133 hand-off

**m01 ships (this mission):**

- **This memo** — pins the PROVIDER/SURFACE/BOUNDARY/EVAL calls + the `viz.fromText` contract + the re-grounded anchors (§6) + the frozen s133 dimension-registry spec (§9) before m02–m04 build.
- **Native-learning capture** (HARD gate) — single-string `cmos_session` capture of the memo ratification + each pinned call.

**m01 makes NO code change** — all source edits land in m02/m03/m04.

**OUT OF SCOPE this sprint (frozen here, wired into m05 success criteria so it is not author-recall-dependent):**

- (a) the **dimension registry / `dimensionRef` channel** — DEFERRED to s133, full spec frozen in §9; `X by Y` grounds ONLY as a caller-supplied NAMED FIELD with zero governed vocabulary this sprint;
- (b) **multi-turn / stepwise NL clarification** — DSV-045's multi-turn lean does NOT reopen the ratified single-call posture (#961);
- (c) a **true nvBench-scale corpus** (~25k pairs) — s132 ships ~few-dozen labeled pairs;
- (d) **encoding-driving `dimensionRef`** (the s133 registry is resolution narrative/governance-only for the smallest slice);
- (e) **`measureRole:'dimension'` reuse as the registry** — forbidden by the s131 memo; it is a governance classifier, not a dimension vocabulary;
- (f) the **utterance→`measureRef` synonym matcher** (s131 carry-forward deferral);
- (g) **rows-less / "shape-only" intent** (v0.1 REQUIRES `rows`; s131 carry-forward deferral).

---

## 9. S133 HARD HAND-OFF — the minimal DIMENSION REGISTRY (spec FROZEN here)

Frozen at m01 so s133 executes WITHOUT re-grounding. The minimal dimension registry — a parallel `dimensionRef` channel BESIDE the s131 named-field channel, NOT a redesign; the `StructuredIntent` contract SURVIVES additively (mirrors how s116→s117 added the governed-measure registry):

- **Data + schema:** `dimension-registry.json` + `dimension-registry.schema.json` keyed `^gd\.` with entries `{ id, displayName, field, grain, synonyms }`.
- **Loader:** `loadDimensionRegistry()` CLONING the measure-registry loader (cross-dir / fresh-Ajv2020 / memoized / fail-closed — the `measure-registry.ts` pattern) with a NEW error code **`OODS-V143`** (VERIFIED next-free, §6 #6 — register it in the viz band after V142, ~`registry.ts:169`).
- **Codegen safety:** add BOTH files to `NON_SCHEMA_DATA_FILES` (Generator A's skip-list — the s117 `measure-registry.json` precedent, so they don't throw "Unable to determine root type" in `generate:check`).
- **Additive schema:** an ADDITIVE default-off `dimensionRef` field on `viz.render.input.json` + the hand-written `StructuredIntent` + a regenerated `generated.ts`.
- **Resolution = narrative/governance-only for the smallest slice.** Synonym→canonical resolution stays in the **PARSER**, NEVER in the deterministic resolver (the deterministic side only resolves a known `^gd\.` ref → its `field`).
- **The #564 golden:** prove a `dimensionRef` resolving to field `'region'` yields a `chartType` byte-identical to a raw `dimensions:[{name:'region'}]` intent (additivity proof — the registry is a vocabulary layer, not an encoding change).
- **Eval-gate FLIP:** s133 (or whenever a baseline stabilizes) flips the m04 accuracy gate from report-only to a blocking threshold (Derek picks the number).

**Refs:** grounding `wf_61cf1556-d00` (planning) + `wf_a14249bc-957` (m01 re-grounding, the §6 anchors); decision #965 (s132 lock) + #961 (s131 lock, the frozen contract + single-call posture); `forge-viz-nlviz-decision-memo.md` (s131 keystone — the deterministic core); `forge-viz-flagship-strategy.md` §3/§4/§5/§6; `cmos/research/DSV-045-results(1).md`; `near.md`:49-58.
