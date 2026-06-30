# Forge Viz — Phase 3 (Semantic Grounding) Scoping & Decision Memo

> ⚠️ **2026-06-29 — partial revert downstream.** The s116/s117 governed-MEASURE substrate this memo authorized in shape was **KEPT & shipped**. The downstream NL→viz arc was **REVERTED** (commit `a0e876e`, decision #973): `viz.fromText` + the Claude parser + the `nlviz-accuracy` gate removed; the s133 dimension registry stashed. Only the deterministic s131 `intent` mode on `viz.render` survives. Flagship goal being revisited (decision #974).

> **⏩ SHIPPED — updated 2026-06-19 at the sprint-120 review.** The two-sprint beachhead this memo authorized *in shape* has landed: the inert `KpiPanel.measureRef` descriptor in **sprint-116** (`263ff07`) and the governed-measure registry + flag-gated mcp-server resolver in **sprint-117** (`d03b08e`). Real code, not stubs: `measure-registry.json` (5 `gm.*` measures), `measure-resolver.ts` (`resolveMeasurePanel` at `dashboard.render.ts:185`), `resolveMeasures` flag (default-off, fail-closed; `V130`/`V132`/`V133`). The "FUTURE sprint" / "SUBSEQUENT, gated resolution sprint" framing below is the original point-in-time recommendation, retained for record. **Still unbuilt — the Phase-3 differentiator: NL→viz + narrative/insight *over measures*** (the a11y narrative shipped in s115 is over *raw data*, not measures). Tracked on [../foundational-docs/roadmap/near.md](../foundational-docs/roadmap/near.md).

| | |
|---|---|
| **Sprint** | sprint-115 |
| **Mission** | s115-m08 |
| **Date** | 2026-06-18 |
| **Status** | **SHIPPED** — ratified-by-build (s116 descriptor `263ff07` + s117 registry/resolver `d03b08e`); see banner above |

**Companion docs:** `forge-viz-flagship-strategy.md` §4 (roadmap) + §5 (open questions) + §6 (sizing) and `forge-viz-phase2.6-export-scoping-memo.md` (the export-seam precedent this memo's additivity discipline mirrors). *Anchoring note: the strategy's §5 is a flat numbered list (items 1–5, lines 98–102); this memo writes "§5.N" to mean item N of that list — §5.1 = item 1 (data source, line 98), §5.4 = item 4 (scope of BI, line 101) — consistent with the doc's own "§5.1–5.3" shorthand at `forge-viz-flagship-strategy.md:108`.*

---

## 0. Purpose and boundary

Phase 3 is the "semantic grounding" C-bet: *an agent turns semantically-typed data into a meaningful, branded, accessible dashboard deterministically.* The s115 grounding established Phase 3 is **not** sprint-ready, because the substrate it depends on — a governed-measure layer — does not exist (`forge-viz-flagship-strategy.md:7`, `:84-85`). The strategy doc itself prescribes the remedy: "a scoping/decision-memo mission first (resolve §5.1–5.3), then Phase 0 as the first build sprint" (`forge-viz-flagship-strategy.md:108`).

This memo discharges that mission. It resolves the two open strategy questions (data-source/catalog binding and scope-of-BI), pins down what a "measure" is in Forge, specifies where a governed-measure model would live and how a measure would resolve, and recommends a single bounded first beachhead.

**This memo does NOT authorize the Phase-3 build.** The s115 deferred boundary holds: the build is gated on ratification of this memo. Nothing here is this-sprint implementation work. There are **no schema edits in this mission** — every "would add" below is a future-sprint proposal pending ratification.

---

## 1. §5.1 — Data-source / catalog-binding contract

### 1.1 What is true today (verified)

`dashboard.render` ingests **inline rows only.** There is no data ref, no catalog lookup, no fetch:

- The only data entry point is the required top-level `datasets[]` array, each `Dataset` carrying its own inline `rows[]` (`dashboard.render.input.json:8-13`, `:28-35`).
- `Dataset` is an `id` + inline-`rows` envelope and nothing else — there is **no** `ref`/`source`/`catalogId`/`query` field anywhere on it (`dashboard.render.input.json:104-128`).
- Ingestion is a single in-memory `Map` built straight from inline rows, with no transformation or resolution step: `const datasetRows = new Map<string, Row[]>(); for (const dataset of input.datasets) { datasetRows.set(dataset.id, dataset.rows as Row[]); }` (`dashboard.render.ts:46-49`).
- A panel binds by id reference into that Map (`datasetRows.get(panel.datasetId)`), not inline-rows-per-panel; the frozen seam (a) explicitly states this is the design (`dashboard.render.ts:64`, `:274`, `dashboard.render.input.json:7`).
- The KPI "measure" path today is: `KpiPanel` requires `field` (a raw column name) + an `aggregate` enum, resolved against the shared rows and reduced by `computeKpi` (`dashboard.render.input.json:356-386`, `kpi.ts:189-193`). The number is **computed at render time** from in-spec rows — it is never precomputed, and `computeKpi` reads **zero** catalog (`kpi.ts:1-7` — "pure compute … renderer-AGNOSTIC … no catalog").

So the binding question is genuinely open precisely because *no ingestion indirection exists yet* (`forge-viz-flagship-strategy.md:41`, `:52`).

### 1.2 The three options framed by the strategy

This memo reframes the strategy's three ingestion options (`forge-viz-flagship-strategy.md:98` — "inline rows? a data ref? a Stage1/catalog-backed dataset?") in measure-binding terms: (i) an **inline measure descriptor** that travels with the spec (maps to *inline rows*; zero catalog read), (ii) a **catalog lookup** where a `measureRef` resolves against a catalog (maps to a *catalog-backed dataset*), (iii) a **new data-source contract** — a data ref / lazy or streamed dataset access (maps to *a data ref*). The (i)/(ii)/(iii) taxonomy below is this memo's recasting, not the strategy's verbatim wording.

### 1.3 RECOMMENDATION

**RECOMMENDATION: Adopt (i) — the inline measure descriptor — as the Phase-3 floor, and architect (ii) catalog lookup as a strictly-additive resolution step layered above it later. Reject (iii) a new data-source contract for the Phase-3 beachhead.**

Rationale:

- **(i) is the only option that is additive-clean against the frozen seam.** A measure descriptor that travels in the spec changes nothing about how rows enter the engine: the `datasets[].rows` inline contract stays intact, the `datasetRows` Map (`dashboard.render.ts:46-49`) is untouched, `filterRows` (`dashboard.render.ts:54-55`) and `computeKpi` (`kpi.ts:189-191`) keep reading `panel.field`/`panel.aggregate`. The descriptor is a self-contained provenance/identity tag in the spec. This is byte-for-byte the same additivity move already proven by `periodField` (v0.2, `dashboard.render.input.json:387-391`; `dashboard.types.ts:319`) and by the `KpiComparison.field` RESERVED/"Unread in v1" pattern (`dashboard.types.ts:341-343`).
- **(ii) is the right *eventual* shape but cannot land first**, because the catalog it would resolve against does not exist (see §3). It must be designed as a resolver that expands `measureRef → field + aggregate` *before* `computeKpi` runs, keeping viz-core's pure compute path catalog-free. The natural home is `dashboard.render.ts` in mcp-server (which already owns the boundary between spec ingestion and the viz-core compute), not viz-core. Because the registry it resolves against does not yet exist, **(ii) is added in a later, gated sprint — not the first Phase-3 build sprint** (see §3.3, §4).
- **(iii) is over-scoped and seam-breaking for Phase 3.** A data ref / lazy access would touch `filterRows`, `computeKpi`, and the viz.render row-passing path (the grounding's own caution), and it conflicts with the in-process, deterministic row contract that the whole dashboard fidelity-test suite is baked against. Defer it indefinitely; it is a Phase-4+ scaling concern, not a semantic-grounding concern.

**Additivity implication.** Option (i) keeps `schemaVersion` const `'v0.1'` (no discriminant bump), does not re-bake any KPI golden, and introduces no external read. When (ii) is added in a later sprint, the resolver expands `measureRef` into the *same* `field`+`aggregate` the engine already consumes — so even the catalog-resolved future does not re-freeze the seam. **Resolution must materialize to inline rows / inline field+aggregate at the mcp-server boundary; it must not push laziness or fetching down into viz-core.**

**Unresolved-ref policy (must be decided at build time).** Today there is **no validation that a panel's `datasetId` exists in `datasets[]`**: an unknown `datasetId` silently falls through to `?? []` and yields an empty result (`dashboard.render.ts:64`, `:274`). This is what "legacy silent-empty behavior" means below — it applies to the *existing* `datasetId`-not-found path as well as the raw-`field` path. When `measureRef` resolution lands (in the later resolution sprint, §4), the team must decide whether an unresolved `measureRef` hard-errors or continues yielding empty (matching the current silent behavior). **RECOMMENDATION: hard-error on an unresolvable `measureRef`** (a governed measure that cannot be found is a provenance failure, not an empty result), while leaving the legacy raw-`field` / missing-`datasetId` silent-empty behavior unchanged for back-compat.

---

## 2. §5.4 — Scope of "BI" + the definition of "measure"

### 2.1 The three scope options

The strategy frames decision-centric analytics dashboards vs an embedded chart API vs an exploratory tool, and directs us to **pick one** beachhead (`forge-viz-flagship-strategy.md:101`).

### 2.2 RECOMMENDATION

**RECOMMENDATION: Decision-centric. Forge's BI scope is decision-centric analytics dashboards (KPIs + anomalies + actions), not an embedded chart API and not an exploratory tool.**

Rationale — this is not a fresh choice; it is a *continuation*:

- "Decision-centric" is already the strategy's named target: "KPIs + anomalies + actions, not chart dumps" (`forge-viz-flagship-strategy.md:65`), and Phase 2 already operationalized it as "an agent composes a coherent linked multi-chart dashboard, not one chart" (`forge-viz-flagship-strategy.md:82`).
- Phase 2 **shipped** the decision-centric metric-overview template (the KPI-row + trend + breakdown + optional geo, with cross-filtering, per sprint-113). The KPI tile — `field` + `aggregate` + optional `comparison`/`threshold` + `periodField` — *is* the decision-centric primitive (`dashboard.render.input.json:356-406`, `kpi.ts:189-242`). Choosing decision-centric means Phase 3 *grounds the substrate the shipped template already consumes*, rather than opening a new product surface.
- An **embedded chart API** is the per-chart `viz.render` engine, which already exists and is intentionally left unchanged. An **exploratory tool** edges into the frontier the strategy explicitly defers ("autonomous agentic exploration … are **frontier**", `forge-viz-flagship-strategy.md:67`). Neither is the beachhead.

### 2.3 Definition of "measure" in Forge

The strategy sharply distinguishes the **Object Catalog** (entity/trait *typing*) from a **metrics layer** (governed measures/dimensions): the catalog is "data with *meaning* (typed entities, traits, roles, relationships), not bare columns" (`forge-viz-flagship-strategy.md:20`), and "'semantic catalog' ≠ 'metrics layer' … not governed measures/dimensions" (`forge-viz-flagship-strategy.md:7`). Grounded generation requires a "semantic model (defined metrics/dimensions/joins)" (`forge-viz-flagship-strategy.md:64`).

**RECOMMENDATION — Forge's definition of a measure:**

> A **measure** is a *named, governed metric*: a tuple of (a) an **entity field** it aggregates, (b) an **aggregation** (`sum|count|average|median|min|max|distinct|latest`), and (c) a **role/semantics** descriptor (display name, unit/format, default comparison/threshold intent, and a governance/provenance identity). A measure is reusable and defined *once*, separate from any single dashboard.

This is deliberately the KPI tile's compute inputs (`field` + `aggregate`, `dashboard.types.ts:315`/`:323`) *promoted into a named, shareable entity.* What the KpiPanel has today is exactly the *anonymous, inline* form of a measure: it carries field-ref + aggregation **intent** but has no name, no role, and no shared registry (grounding §4). A "measure" is that same tuple, named and governed.

Note the existing `PatternField.role: 'measure' | 'dimension'` in `patterns/` (`patterns/index.ts:32-38`, `pattern-field-helpers.ts:14-34`) is a **chart-recommendation classifier**, NOT a governance role, and is disconnected from the dashboard/KPI compute path. It must not be conflated with the governed-measure "role." Reconciling these vocabularies (or keeping them deliberately separate) is a build-sprint design task.

---

## 3. Governed-measure data model — does it exist? where would it live?

### 3.1 Verdict: it does NOT exist today (verified)

The grounding confirms it structurally:

- `catalog.list` is a **component/trait + Code-Connect/Storybook catalog**, not a metrics layer. Its dataset top-level keys are `components/traits/objects/domains/patterns` with `stats` counting `componentCount:101, traitCount:41, objectCount:12` — **no `measures`, `dimensions`, `metrics`, or `aggregations` key** (`artifacts/structured-data/oods-components-2026-03-06.json`; `catalog.list.ts:643-645`).
- Its filters are component-taxonomy axes only — `category/trait/context/status` (`catalog.list.ts:654-668`); there is no filter by metric/dimension/measure.
- The closest thing to "fields" is `propSchema`, which is **component-prop typing** derived from trait `usage.props`, not data measures (`catalog.list.ts:547-563`, `types.ts:370-381`). Trait-usage `field` values (e.g. `{field:'addresses'}`) are entity/trait binding hints, not governed measures.
- The output envelope's `stats` block "counts components and traits — never measures/dimensions" (`types.ts:383-401`).
- In viz-core, **no governed-measure descriptor exists**; `grep catalog` across `dashboard/` and `spec/` returns nothing (grounding §4). The only "measure" notion is the recommendation heuristic `PatternField.role`.

This corroborates the strategy at `forge-viz-flagship-strategy.md:7` and the source correction (DSV-045-results §10b: the Object Catalog "is not yet a metrics/semantic layer (no governed measures/dimensions/joins/aggregations)"). The "governed-measure substrate does not exist" claim is **SUPPORTED by the code, and is structural to the tool**, not just an artifact of the current 2026-03-06 dataset snapshot.

### 3.2 Where measures would live (specification, not implementation)

A governed measure must live in a layer **separate from** both the component catalog (which has no path to surface measures) and viz-core's pure compute path (which must stay catalog-free, `kpi.ts:1-7`). The model:

- **Storage / authoring:** a governed-measure registry keyed by measure name, each entry = `{ name, entityField, aggregate, role, displayName?, unit/format?, defaultComparison?, defaultThreshold?, provenance }`. This is a *new* substrate; it should NOT be bolted onto the components dataset (whose transform/types have no slot for it). Whether it is a standalone artifact, a new section in the Object Catalog, or an imported semantic model (Cube/Malloy/dbt MetricFlow/LookML — the strategy's named route, `forge-viz-flagship-strategy.md:7`, `:64`) is a **build-sprint decision deferred by this memo.** *Default lean (non-binding, to remove one variable from the future sprint): a standalone artifact first, with the importer route kept as a later option once a handful of measures prove the resolver shape.*
- **Resolution:** a resolver in **mcp-server** (at `dashboard.render.ts`, the spec-ingestion boundary) that, given a `measureRef`, expands it to `field` + `aggregate` (+ default comparison/threshold) **before** calling `computeKpi`. This keeps viz-core's deterministic, catalog-free compute path intact (`kpi.ts:189-191`).
- **Binding:** a measure resolves against the rows of the `datasetId` the panel already names — the resolved `field`/`aggregate` are applied to the same shared inline rows the engine reads today (§1.1). No new data-fetch path is introduced.

The registry's binding **contract** (§1.3) and its **resolver location** (mcp-server boundary) are decided here; its **storage backend** is the legitimate downstream choice deferred above. The registry is therefore **authorized in shape** by this memo but **built in the resolution sprint, not the first build sprint** (see §3.3 and §4).

### 3.3 The minimal additive `measureRef`-descriptor path (the floor) — and what the first sprint contains

The natural attachment point is **`KpiPanel`, as a new OPTIONAL sibling to `field`** — the exact slot `periodField` already occupies (`dashboard.types.ts:319`; schema KpiPanel block `dashboard-spec.schema.json:166-194`). Mechanics of the floor:

- Add an optional `measureRef` to `KpiPanel`, **not required**. Keep `field` + `aggregate` as the authoritative compute inputs.
- In v1 the descriptor is a **pure provenance/identity tag, UNREAD by `computeKpi`** — exactly like `KpiComparison.field` ("Unread in v1", `dashboard.types.ts:341-343` / `dashboard-spec.schema.json:202`).
- Result: `schemaVersion` stays const `'v0.1'` (no discriminant bump — same rule as `periodField`); existing KPI goldens do not re-bake (compute is byte-identical because it still reads `panel.field`/`panel.aggregate`, `kpi.ts:189-191`); **no catalog/registry lookup is introduced.**

**Scope of the FIRST Phase-3 build sprint (explicit): the inert `measureRef` descriptor ONLY.** No registry, no resolver — those are the *next* sprint. The descriptor lands alone, inert, with zero catalog read and no engine change. A **later, gated sprint** then adds the registry substrate (§3.2) and the resolver (`measureRef → field+aggregate`, behind a flag) **without re-freezing the seam.** This is the §1.3 sequencing made concrete: descriptor first, resolution later.

**Shape decision — RECOMMENDATION: `measureRef` is a bare string (a registry key / provenance tag), not an inline `{name, field, aggregate, role}` object.** A bare string is the maximally-inert floor with zero compute impact; an inline object would duplicate `field`/`aggregate` and invite drift between the descriptor and the authoritative compute inputs.

**Frozen-seam discipline (must honor).** The schema $comment seam (v) declares additive opt-ins "no discriminant bump" and lists **role binding, template registry, and the general composer as explicit NON-GOALS** held for a later sprint (`dashboard-spec.schema.json:7`). The `measureRef` *descriptor* (inert tag) respects this; full role/catalog *binding* is out of scope per those frozen non-goals. Any future schema change also goes through the vendored-copy gate: edit `dashboard-spec.schema.json`, re-run `pnpm generate:schema-types`, re-sync the byte-identical `dashboard.types.ts` copy, and re-export from `dashboard-spec.ts:6-28` (this is the same hand-synced parity discipline documented for the export seams in `forge-viz-phase2.6-export-scoping-memo.md`).

---

## 4. Bounded first Phase-3 beachhead (for a FUTURE sprint)

**RECOMMENDATION: The first Phase-3 build sprint ships the inline `KpiPanel.measureRef` *descriptor* ONLY — a bare string, UNREAD by compute, with ZERO catalog/registry read and no engine change. The governed-measure registry and its mcp-server resolver are authorized in shape by this memo but built in a SUBSEQUENT, gated resolution sprint — not the first sprint.**

This honors the critic's floor exactly and matches §1.3/§3.3:

- **First sprint = the additive-only minimum: the inert `KpiPanel.measureRef` descriptor with ZERO catalog read** (§3.3). It lands alone, inert, with no engine change and no new substrate.
- **The catalog-resolved version requires the substrate decided first** — which is precisely *this memo's* job to authorize in shape (the registry contract, §1.3, and resolver location, §3.2) and a *later build sprint's* job to implement. That resolution sprint adds: (1) a first, deliberately-small governed-measure registry (a handful of measures over an existing demo dataset, in whatever storage form §3.2 settles), and (2) the mcp-server resolver that expands `measureRef → field+aggregate` before `computeKpi`, behind a flag, hard-erroring on unresolved refs (§1.3). The descriptor remains inert in the default render path until that resolver ships and is enabled.

What both Phase-3 sprints explicitly **exclude** (held for later phases): NL→viz, narrative/insight generation over measures, the general dashboard composer, template registry, and role binding (the frozen non-goals, `dashboard-spec.schema.json:7`); and any data-source-contract / lazy-fetch work (§1.3 option iii). This keeps the beachhead inside the "achievable" band and out of the "frontier" band the strategy draws (`forge-viz-flagship-strategy.md:67`).

**Sequencing note (from the strategy, not re-litigated here):** the strategy already states Phase 0 (reconnect + B40 + data contract) is the first build sprint and is "a meaty sprint" (`forge-viz-flagship-strategy.md:108`), and that semantic grounding is Phase 3 (`forge-viz-flagship-strategy.md:84-85`). This memo does not reorder that; it makes Phase 3 *ready to be scheduled* once its predecessors land.

---

## 5. Decision summary

| # | Question | RECOMMENDATION |
|---|----------|----------------|
| §5.1 | How does a measure bind to data? | **(i) Inline measure descriptor** as the floor (ships first, inert, zero catalog read); **(ii) catalog lookup** added in a *later* gated sprint as a mcp-server resolver that materializes to inline `field`+`aggregate` at the boundary; **reject (iii)** a new data-source contract. Hard-error on unresolved `measureRef` once resolution lands. |
| §5.4 | Scope of BI? | **Decision-centric** (KPIs + anomalies + actions) — continuation of the Phase-2 metric-overview template, not embedded API, not exploratory. |
| — | What is a "measure"? | A **named, governed metric** = entityField + aggregation + role/semantics; the KPI tile's `field`+`aggregate` promoted into a named, shareable entity. |
| §3 | Does a governed-measure model exist? | **No** (verified — `catalog.list` is a component/trait catalog; viz-core compute is catalog-free). Measures live in a **new registry** (storage backend deferred; standalone-artifact lean) resolved by a **mcp-server resolver**, keeping viz-core pure. |
| §4 | First Phase-3 beachhead | **Inert `KpiPanel.measureRef` descriptor ONLY** (bare string, zero catalog read, no engine change). Registry + gated mcp-server resolver are **authorized in shape but built in a subsequent resolution sprint**. No NL/insight/composer; no new data-source contract. |

**Status: SHIPPED — ratified-by-build (s116 + s117, 2026-06-19).** This memo authorized the *registry data-model shape*, the *binding contract + resolver location*, and the *two-sprint beachhead boundary* above (descriptor-only first, registry+resolver second) — all now built and merged. The original wording ("does not authorize the Phase-3 build, which remains gated on this ratification") is the point-in-time framing; in practice the build proceeded directly across s116→s117. The remaining Phase-3 work (NL→viz + narrative over measures) is unbuilt and tracked on the near roadmap.

---

## 6. Open items deferred

- **Registry storage backend** (standalone artifact vs new Object-Catalog section vs imported Cube/Malloy/dbt-MetricFlow/LookML semantic model) — deferred to the resolution sprint (§3.2); a non-binding standalone-artifact-first lean is stated to remove one variable.
- **`measureRef` vs `PatternField.role` vocabulary reconciliation** — keep separate or unify; build-sprint design task (§2.3).
- **Critique note (a finding declined, not complied with):** one shouldFix proposed that the first build sprint ship the descriptor *plus* the small registry *plus* the gated resolver as a single coupled beachhead. This memo declines that coupling: it overshoots the additive-only floor (§3.3) and the strategy's own substrate-first discipline, and it contradicts §1.3's "(ii) cannot land first." The registry and resolver are authorized in shape here but deferred to a subsequent gated sprint — adding them to sprint one would be scope creep, not a missing decision.
