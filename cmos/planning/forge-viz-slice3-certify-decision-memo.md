# Forge Viz — Slice 3: `artifact.certify` (IR-first) + honesty-hygiene — Decision Memo

**Sprint:** 136 · **Status:** keystone (m01, NO CODE) · **Locked:** decision #998 (Derek-ratified 2026-07-02; roadmap review `PS-2026-07-02-001` → planning `PS-2026-07-02-002`) · **Critic pass:** decision #999 (3 amendments folded — read §3) · **North-star:** decision #977 · **Predecessors:** Slice 1 memo `cmos/planning/forge-viz-slice1-certify-at-emission-decision-memo.md` (its §8 first named certify), Slice 2 memo `cmos/planning/forge-viz-slice2-generation-path-enforcement-decision-memo.md` (its §8 re-sliced certify to s136)

This memo pins Slice 3 so **m02–m05 execute without re-grounding.** It is the contract a fresh build session reads. Every file:line anchor below was **re-verified by hand against live source this session** (the s136 planning workflow API was unstable — 6-scout + 3-fallback all stalled — so nothing here is scout-reported; §11 is the hand-confirmed anchor table). **Read §3 first — it is the one correction that flips the original mission notes: a `NormalizedVizSpec` has NO `chartType`; certify classifies ECharts-primary from `spec.marks[0].trait`.**

`cmos/templates/keystone-memo-template.md` does **not** exist — this memo mirrors the two predecessor memos' structure directly.

---

## 0. What this sprint adds (the thesis)

Slices 1–2 built **"generate accessibly"**: `viz.render` / `dashboard.render` now emit cartesian charts that are accessible-by-construction and deterministic-by-construction (default-ON `a11yEquivalence` gate + default-ON `contentHash`). That is the *generate* half.

Slice 3 builds the **other half — *certify***: an agent hands in a Forge `NormalizedVizSpec` **IR** and gets back a **conformance verdict + determinism proof + `contentHash`**. This closes **"generate AND certify."** It is a NEW, standalone, read-only MCP tool: `artifact.certify`.

Two things make this cheap and honest:

1. **Reuse, not rebuild.** certify reuses the *exact same* equivalence engine (`validateVizEquivalenceRules`), the *exact same* determinism transform (`toVegaLiteSpec` → `canonicalize` → `sha256`) that `viz.render` already runs. certify is a *reader* of the IR — it never re-recommends, re-encodes, or rebuilds (#110). For a Forge-generated IR, `certify(normalizedSpec).contentHash === viz.render(...).contentHash` **by construction** — the round-trip identity is the story: render → get `{normalizedSpec, contentHash}` → hand `normalizedSpec` to certify → get the SAME hash + a conformance verdict.
2. **Coverage-honest.** certify certifies only what an IR can prove for the **5 cartesian types** (bar/line/area/scatter/heatmap → `coverage:'certified'`). The **8 ECharts-primary types** (treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord) return a **distinct** verdict `coverage:'uncertified'` / `conformant:null` — NOT `conformant:false`, NOT an error. Honest about its own coverage boundary.

Slice 3 also does **honesty-hygiene** (m04): a certification product must not ship three tools that report pass regardless of input. `purity.audit` (`{violations:0}`), `vrt.run` (`{diffs:0}`), and `reviewKit.create` (placeholder text) are **retired**. `a11y.scan` is REAL (`evaluateContrastRules` over DTCG tokens) and **stays**.

---

## 1. The pinned calls (Derek-ratified 2026-07-02, #998)

| # | Call | Rationale |
|---|------|-----------|
| C1 | **NEW standalone `artifact.certify` tool, IR-first** | INPUT = a Forge `NormalizedVizSpec` IR. Not free-text React/HTML (that is parser-back-to-IR — OOS until the IR path is proven). |
| C2 | **Reuse `validateVizEquivalenceRules` VERBATIM, no throw** | Never `assertVizEquivalence` (it throws → would coerce to `OODS-V129`, losing per-rule codes). Partition by `rule.severity`, mirror `viz.render.ts:197-230`, preserve each `OODS-A11Y-<rule.id>` code. |
| C3 | **Coverage-honest 5-vs-8 split** | Cartesian → `coverage:'certified'` + real conformance. ECharts-primary → `coverage:'uncertified'` / `conformant:null` (distinct verdict, not a failure). |
| C4 | **CONTRAST DEFERRED** (premise-check on the frozen contract) | An IR carries only a theme *identifier* + a color *channel binding* — NO resolved mark colors (assigned at emit time in the adapters). `a11y.scan` already checks the token palette. certify claims ONLY what an IR can prove. Contrast = documented OPEN pillar (emit-then-contrast, a later sprint). See §7. |
| C5 | **Retire the 3 always-pass stub tools** | Full removal + every reference (§6). `a11y.scan` is real — leave it. |
| C6 | **Determinism: pure fn of the input IR** | No `Date`/random/UUID anywhere in the verdict. Same IR → byte-identical verdict + `contentHash`. |
| C7 | **Additive (#564)** | certify touches NO existing tool output. `viz.render` / `dashboard.render` goldens stay **byte-unchanged**. |

**Spine (strict `Requires` m01→m02→m03→m04→m05):** memo → certify core (long pole) → wire the new AUTO tool → retire the 3 stubs → full cross-package closeout + two-layer reconnect.

---

## 2. The certify I/O contract (FROZEN)

**INPUT** — a Forge `NormalizedVizSpec` IR. The tool boundary accepts a permissive `{ spec: object }` envelope (see §3 correction (b)) and the handler validates the IR authoritatively via `assertNormalizedVizSpec`.

**OUTPUT** — three branches, one output schema:

```jsonc
// CERTIFIED (cartesian): the real verdict
{ "status": "ok",
  "coverage": "certified",
  "conformant": true,                         // boolean: zero error-severity rule failures
  "findings": [                               // one per FAILING rule (empty when fully conformant)
    { "code": "OODS-A11Y-<rule.id>", "severity": "error"|"warn", "message": "..." }
  ],
  "determinism": { "stable": true, "contentHash": "<sha256-hex>" } }

// UNCERTIFIED (ECharts-primary): distinct, honest non-claim — NOT a failure
{ "status": "ok",
  "coverage": "uncertified",
  "conformant": null,                          // null, NOT false
  "findings": [],
  "notes": ["<type> is an ECharts-primary type; a11y-equivalence certification is cartesian-only (Vega path). Table + narrative are still generated but not equivalence-verified."] }
  // NO determinism block — no Vega compile exists for these types (toVegaLiteSpec has no mapping).

// ERROR (invalid IR): structured, never an uncaught throw
{ "status": "error",
  "errors": [ { "code": "OODS-V…", "message": "…" } ] }
```

- `conformant` type is `[boolean, null]`. `coverage` enum `['certified','uncertified']`. `findings[].severity` enum `['error','warn']` (the native `VizA11yRuleResult` severity — NOT remapped to `'warning'` like `viz.render` does for its `warnings[]`). `findings[].code` has **no pattern** so `OODS-A11Y-*` validates. `status` enum `['ok','error']`. Only `status` is `required`; per-branch fields are documented, not schema-enforced-conditional (mirrors `viz.render`'s optional `contentHash`).

---

## 3. ⚠️ The three corrections m02/m03/m04 MUST read (critic pass #999)

The original mission notes were written before the critic pass. These three amendments override them; they are hand-verified below and in §11.

**(a) Chart-type detection — a `NormalizedVizSpec` has NO `chartType`.** The original note said "`isEChartsPrimaryType(chartType)` … derive `chartType` from the IR." **Wrong.** `isEChartsPrimaryType(chartType: VizRenderInput['chartType'])` (`viz.render.ts:381`) keys off the *tool INPUT's* `chartType` string — a property `viz.render` receives but the IR does **not** have. The IR is `marks: [Mark, ...]` (`normalized-viz-spec.types.ts:69`) where `Mark.trait: string` holds e.g. `'MarkBar'` (`:101`). The 8 ECharts-primary types are identified by their **mark trait**, enumerated in `ECHARTS_PRIMARY` (`viz.render.ts:356`) as `.mark` values: `MarkTreemap`, `MarkSunburst`, `MarkSankey`, `MarkGraph`, `MarkChoropleth`, `MarkBubble`, `MarkFlow`, `MarkChord`.

> **m02 design (anti-drift):** LIFT the `ECHARTS_PRIMARY` table (currently a local `const` in `viz.render.ts:356`, not exported) + `EChartsPrimaryType` (`:347`) to a shared location (export from `@oods/viz-core` or a shared mcp-server util). `viz.render` keeps using `isEChartsPrimaryType(chartType)` for its input path. certify adds a SIBLING classifier — `isEChartsPrimaryMarkTrait(trait)` (or `isEChartsPrimarySpec(spec)`) — that derives the primary-mark-trait **set** from the SAME `ECHARTS_PRIMARY` values (`new Set(Object.values(ECHARTS_PRIMARY).map(c => c.mark))`) and tests `spec.marks[0].trait`. **ONE source-of-truth table, two entry points.** Drift = certify certifying a type `viz.render` treats as primary; sharing the table forecloses it.

**(b) Input schema — a cross-package `$ref` will NOT resolve.** The original note said "`$ref` or inline `normalized-viz-spec.schema.json`." `readSchema` (`index.ts:178`) loads a single file via `new URL(relativePath, import.meta.url)` + `JSON.parse` — there is **no multi-file `$ref` resolver** wired into the mcp-server AJV path. A cross-package `$ref` to `packages/viz-core/.../normalized-viz-spec.schema.json` would not resolve at input-validation time. **Decision:** `artifact.certify.input.json` is a **permissive boundary** — `{ "type": "object", "required": ["spec"], "properties": { "spec": { "type": "object", "additionalProperties": true } } }` — and the handler's `assertNormalizedVizSpec` (`normalized-viz-spec.ts:65`, AJV vs the runtime schema) is the **authoritative** validator. An invalid IR returns the structured `status:'error'` branch (§2), never an uncaught throw.

**(c) m04 removal blast radius is bigger than the original ref-list.** Beyond the mcp-server + policy + client-config refs, removing the 3 stubs also breaks: `tools/soak-runner/src/soak.ts` (a TS `ToolName` union + `TOOL_LIMITS` + invocations — **TS-breaking**), `packages/mcp-bridge/src/tool-surface.test.ts` (asserts `reviewKit.create` — must re-point to a surviving on-demand tool), `packages/mcp-bridge/src/config.ts`, `packages/mcp-adapter/tool-descriptions.json`, and `docs/`. Full list in §6. LEAVE `cmos/**` + one-off sprint scripts (history). `billing.reviewKit` is a **different, real** tool — do NOT touch it.

**Verified-safe (no special handling needed):** `validateVizEquivalenceRules` is crash-safe on arbitrary agent IRs (per-rule `try/catch`, `equivalence-rules.ts:42-61`). `toVegaLiteSpec` (`vega-lite-adapter.ts:84`) accepts a `NormalizedVizSpec` and is the pure determinism transform (throws `VegaLiteAdapterError` only if `marks` is empty). No mcp-server tool-count test exists.

---

## 4. m02 — certify core in a new tool file (the long pole)

Create `packages/mcp-server/src/tools/artifact.certify.ts` (handler only — wiring is m03). Mirror `viz.render`'s imports (`canonicalize, sha256` from `@oods/artifacts` at `viz.render.ts:47`; `toVegaLiteSpec`, `validateVizEquivalenceRules`, `assertNormalizedVizSpec` types from `@oods/viz-core`).

```
handle(input):
  1. spec = input.spec                                   // permissive boundary (§3b)
     try assertNormalizedVizSpec(spec)                   // normalized-viz-spec.ts:65
     catch → return { status:'error', errors:[{code:'OODS-V126'|…, message}] }   // structured, no rethrow

  2. TYPE ROUTING (§3a): if isEChartsPrimaryMarkTrait(spec.marks[0].trait):
       return { status:'ok', coverage:'uncertified', conformant:null, findings:[], notes:[…] }

  3. CARTESIAN conformance — MIRROR viz.render.ts:197-218 EXACTLY:
       const failures  = validateVizEquivalenceRules(spec).filter(r => !r.passed);   // :199
       const conformant = failures.every(r => r.severity !== 'error');                // zero error-sev
       const findings   = failures.map(r => ({ code:`OODS-A11Y-${r.id}`,              // :208/:215
                                               severity: r.severity,
                                               message: r.message ?? r.summary }));
       // NEVER assertVizEquivalence (equivalence-rules.ts:64 throws → loses codes)

  4. DETERMINISM — MIRROR viz.render.ts:185+324:
       const first  = canonicalize(toVegaLiteSpec(spec));
       const second = canonicalize(toVegaLiteSpec(spec));
       const stable = first === second;
       const contentHash = sha256(first);
       // pure fn of the IR — no Date/random/UUID (C6)

  5. return { status:'ok', coverage:'certified', conformant, findings,
              determinism:{ stable, contentHash } }
```

**Note the doubled literal:** rule ids are `A11Y-R-NN`, so the code prefix produces `OODS-A11Y-A11Y-R-12`. This is intentional and carried from `viz.render` (§11) — tests assert it verbatim.

**Scope fence:** no scorer/recommender/`autoAssignEncodings` change (#110) — certify READS the IR, never rebuilds/re-recommends. Do NOT add a `contrast` field (§7). Do NOT register the tool here (m03).

**Tests** — `packages/mcp-server/test/tools/artifact.certify.spec.ts` (root-included via `vitest.config.ts:5` `'test/**/*.spec.ts'`; NOT colocated → no `ci.yml`/guard touch). Cover:
1. Conformant cartesian IR → `conformant:true`, `coverage:'certified'`, `findings:[]`, `determinism.stable:true`, `contentHash` stable across two calls.
2. Non-conformant IR (an encoding field absent from the rows → R-12) → `conformant:false` + a finding coded `OODS-A11Y-A11Y-R-12` (the intentional doubled literal).
3. ECharts-primary IR (e.g. a `MarkSankey` spec) → `coverage:'uncertified'`, `conformant:null`.
4. Same-input `contentHash` equal; one-field mutation → different `contentHash`.

Verify against BUILT dist: `pnpm --filter @oods/viz-core build && pnpm --filter @oods/mcp-server build`, then `pnpm --filter @oods/mcp-server exec vitest run test/tools/artifact.certify.spec.ts`.

---

## 5. m03 — wire `artifact.certify` as a new AUTO tool (handler from m02 unchanged)

certify is a **core** capability agents should always see → **AUTO**, not onDemand.

1. **Schemas.** `packages/mcp-server/src/schemas/artifact.certify.input.json` = the permissive `{spec:object}` boundary (§3b). `artifact.certify.output.json` mirrors `viz.render.output.json`'s `$defs.issue` shape (`:239-251` — `{code:string (no pattern), severity, message}`) for `findings`, plus `status` enum `['ok','error']`, `conformant` type `[boolean,null]`, `coverage` enum `['certified','uncertified']`, `determinism{stable:boolean, contentHash:string}`, `notes?:string[]`, `errors?` (issue[]). `findings[].severity` enum `['error','warn']`. `required:['status']`.
2. **`index.ts` module map** — add exactly (pattern of `viz.render` at `index.ts:129-132`):
   ```ts
   'artifact.certify': {
     modulePath: './tools/artifact.certify.js',
     inputSchema: './schemas/artifact.certify.input.json',
     outputSchema: './schemas/artifact.certify.output.json',
   },
   ```
3. **`registry.json`** — add `'artifact.certify'` to `auto[]` (`:2-21`, 18 → 19).
4. **`registry.ts`** — add `'artifact.certify'` to `FALLBACK_REGISTRY.auto` (`:21-40`).
5. **`security/policy.json`** — add a **read-only** entry mirroring `viz.render` (`:240-249`): `{ "tool":"artifact.certify", "allow":["designer","maintainer"], "readOnly":true, "timeoutMs":30000, "ratePerMinute":60, "concurrency":4 }`. **No `writes`** — certify is pure verification (do NOT copy the stub blocks' `writes` key).
6. **`configs/agent/policy.json`** — add to `tools[]` mirroring `viz.render`'s entry: `{ "name":"artifact.certify", "description":"…", "modes":["dry-run"], "approval":"optional", "allow":["designer","maintainer"], "ratePerMinute":<n> }`. The bridge advertises `configs/agent/policy.json ∩ registry.json`.
7. **`generated.ts`** — `pnpm --filter @oods/schemas-tools generate` → confirm `generate:check` clean (a schema DESCRIPTION edit alone drifts `generated.ts` via JSDoc — see the closeout gate note).
8. **`docs:api`** — regenerate (a tool was added).

Confirm AJV validates a real handler output (`validateOutput` green) and the tool is dispatchable (the registry/e2e test picks it up): `pnpm --filter @oods/mcp-server exec vitest run`. Do NOT change the m02 handler logic.

---

## 6. m04 — honesty-hygiene: retire the 3 always-pass stub tools

**Ratified path: full removal-done-right.** Stub bodies confirmed always-pass, input-independent: `purity.audit.ts:19` → `{violations:0,files:[]}`; `vrt.run.ts:19` → `{diffs:0}`; `reviewKit.create.ts:19` → `'Review kit placeholder'`.

**Delete the tool files:** `packages/mcp-server/src/tools/{purity.audit.ts, vrt.run.ts, reviewKit.create.ts}`.
**Delete the shared test:** `packages/mcp-server/src/tools/__tests__/reviewKit.create.test.ts` (imports all 3 at `:5-7`, exercises them in one table at `:11-13` — no real coverage lost).

**Remove every reference (all hand-verified this session):**

| Layer | File | Refs |
|---|---|---|
| server module map | `packages/mcp-server/src/index.ts` | `:54-56` purity, `:59-61` vrt, `:64-66` reviewKit |
| server registry (json) | `packages/mcp-server/src/tools/registry.json` | `onDemand[]` `:24` reviewKit, `:28` purity, `:29` vrt |
| server registry (ts) | `packages/mcp-server/src/tools/registry.ts` | `:43` reviewKit, `:47` purity, `:48` vrt |
| server security | `packages/mcp-server/src/security/policy.json` | `:94` reviewKit, `:120` purity, `:133` vrt |
| agent/bridge policy | `configs/agent/policy.json` | name entries `:43` reviewKit, `:99` purity, `:112` vrt + reviewKit in approval-list arrays `:383`, `:412` |
| bridge default surface | `packages/mcp-bridge/src/config.ts` | `:106` purity, `:107` vrt, `:109` reviewKit |
| bridge surface test | `packages/mcp-bridge/src/tool-surface.test.ts` | `:18/:54/:64/:68` reviewKit assertions — **re-point to a surviving on-demand tool** (`diag.snapshot` stays onDemand); keep the test green (CI runs "mcp-bridge tool-surface test") |
| soak runner | `tools/soak-runner/src/soak.ts` | **TS-breaking:** `ToolName` union `:9`, `TOOL_LIMITS` `:105/:106`, invocations `:456/:458/:459/:462/:464/:465` |
| adapter descriptions | `packages/mcp-adapter/tool-descriptions.json` | `:12` reviewKit, `:16` purity, `:17` vrt |
| client configs | `configs/agents/claude.remote-mcp.json` | `:18` purity, `:19` vrt, `:21`+`:28` reviewKit |
| client configs | `configs/agents/cursor.stdio-mcp.json` | `:24` `MCP_EXTRA_TOOLS` help string (`vrt.run`) |
| client configs | `configs/agents/claude-desktop.stdio-mcp.json` | `:27` same help string |
| client configs | `configs/agents/openai.agents.json` | `:61` write-tools prose (drop `reviewKit.create` from the sentence; keep `brand.apply`/`billing.*`) |

**Docs.** `docs/api/*` (README table `:33/:37/:38` + the three dedicated pages `purity-audit.md`/`vrt-run.md`/`reviewKit-create.md`) are **regenerated by `docs:api`**. Hand-written `docs/mcp/*` prose also mentions them (`Tool-Specs.md`, `Bridge-API.md`, `Policy-Rules.md`, `Reliability.md`, `Connections.md`, `Agent Recipes — Quick Index.md`) — sweep these as a soft cleanup; they are **not** part of the hard grep-gate.

**No dedicated schemas to delete:** all 3 stubs use the shared `generic.input.json`/`generic.output.json` (confirmed `index.ts:56-57/:61-62/:66-67`), so removal does NOT change `generated.ts` — confirm `generate:check` stays clean.

**Hard gate (m04 SC#2):** `grep` for `purity.audit` / `vrt.run` / `reviewKit.create` across `packages/` + `configs/` + `security/` (excluding this memo + CMOS decisions) returns **zero**. Confirm `a11y.scan` remains registered + real. Full `pnpm --filter @oods/mcp-server exec vitest run` green; `docs:api` regen.

> **Documented fallback (critic #999, do NOT switch silently):** if the soak-runner TS-union removal + tool-surface.test rework balloons past a single mission's ceiling, the lighter honest alternative is to make the 3 stubs return an explicit `not-implemented` verdict (3 files, no ref churn). Both are honest. Full removal is the ratified default — flag to Derek before falling back.

---

## 7. CONTRAST — DEFERRED (Derek 2026-07-02), a documented OPEN pillar

certify does **not** claim contrast conformance, and adds no `contrast` field. **Why:** a `NormalizedVizSpec` carries only a **theme identifier** (`VizConfig.theme?: string`, `normalized-viz-spec.types.ts:313`) and a **color channel binding** (`EncodingMap.color?: TraitBinding`, `:120` — a *field→channel* mapping, `TraitBinding` at `:128`). It carries **NO resolved mark colors** — those are assigned at **emit time** inside the adapters. So an IR literally cannot prove per-mark contrast. Additionally, `a11y.scan` already checks the DTCG **token palette** (`evaluateContrastRules`), so a theme-level check here would duplicate it.

certify therefore claims **only what an IR can prove**: a11y-equivalence conformance + re-emit determinism + `contentHash`.

**The later path (its own sprint):** *emit-then-contrast* — resolve the actual per-mark colors via the adapter (the emit step), then run contrast over the resolved colors. That needs emit-time color resolution certify (IR-only) deliberately does not do.

---

## 8. m05 — closeout (full cross-package gate + two-layer reconnect)

**Closeout gate (repo root, per `forge-closeout-gate-sweep`):**
1. `pnpm install --frozen-lockfile`
2. **ROOT** `pnpm typecheck` (catches the `src/viz` shim consumers per-package `tsc` misses, incl. the lifted `ECHARTS_PRIMARY`/`isEChartsPrimaryType` export + the soak-runner `ToolName` union edit)
3. `pnpm --filter @oods/schemas-tools generate:check` clean (certify's new input/output schemas + JSDoc descriptions landed in m03; a description edit drifts `generated.ts` even with no type change)
4. `pnpm -r build` (viz-core → mcp-server → sdk, so the `src/viz` shim + dist agree)
5. Full `pnpm --filter @oods/mcp-server exec vitest run` (picks up `test/tools/artifact.certify.spec.ts`; the deleted stub test is gone) **+ the colocated golden step** (`ci.yml`, "Run colocated viz.render + dashboard.render goldens" — verbatim command incl. `ci-golden-list.guard.test.ts`) so `viz.render.fidelity` / `dashboard.render.fidelity` + the guard pass **UNCHANGED** (#564 — certify is additive) **+ the mcp-bridge tool-surface test** (reworked in m04)
6. `pnpm --filter @oods/mcp-server run test:scale` (self-relative determinism, stays green)
7. `docs:api` (the tool SET changed: +`artifact.certify`, −`purity.audit`/−`vrt.run`/−`reviewKit.create`)

**Advertised-set delta:** `auto` 18 → 19 (+`artifact.certify`); `onDemand` 9 → 6 (−3 stubs); **net 27 → 25.**

**Two-layer reconnect (mine — `pm2-bridge-restart-is-mine` + `aquex-hub-runtime`):** rebuild dist + `pm2 restart oods-forge-bridge`, then verify via `:4466` `/run`:
- a **conformant cartesian** IR → `{conformant:true, coverage:'certified', contentHash present}`
- a **sankey** IR → `{coverage:'uncertified', conformant:null}`
- a **non-conformant** IR → `conformant:false` + an `OODS-A11Y-*` code
- `purity.audit` / `vrt.run` / `reviewKit.create` → **tool-not-found**

Then an **aquex reconnect** (advertised-schema change; execution is fresh-per-call from dist — only the advertised schema is cached at connect-time).

**Constraints verified held:** #110 (no scorer/`autoAssignEncodings` change), #525 (MCP-only), #564 (`viz.render` + `dashboard.render` goldens byte-unchanged — certify additive), determinism (verdict pure). Send a `cmos_message` closeout to Derek (certify LIVE: generate-AND-certify now true on cartesian IR; 3 stubs retired; contrast deferred as a documented open pillar) + single-string `cmos_session` learnings capture.

---

## 9. s137 hand-off (FROZEN here)

**Next arc (ratified):** broaden a11y certification from the 5 cartesian types to the **8 currently-uncertified ECharts-primary types** (hierarchy/flow/network/spatial). Today those return `coverage:'uncertified'`; s137 gives them real conformance rules.

**FIRST step = RESEARCH** non-cartesian a11y rule semantics — what accessible-table + narrative equivalence *means* for hierarchy/flow/network/spatial charts (there is no axis-title analogue for a treemap). Run via **TraceLab project `ae1d1122-36de-4ef9-8bba-10efc60f6b4a`** OR in-session, and **CAPTURE the research report(s) as `.md` files under `cmos/research/`** (Derek's standing instruction).

**Explicitly OUT of s136:** free-text React/HTML certify (parser-back-to-IR); per-mark / emit-time contrast (§7); the 8 non-cartesian conformance rules (= s137). The NL→viz free-text + dimension-registry carry-forwards remain stashed/reverted (`stash@{0}`); not s136/s137 scope unless re-ratified.

---

## 10. Held constraints (every mission)

- **#564** additive floor: certify touches NO existing tool output; `viz.render` / `dashboard.render` goldens byte-unchanged; below-envelope determinism goldens byte-identical.
- **#110 / no scorer change:** certify READS the IR; no `suggestPatterns`/`scorePattern`/`toSchemaIntent`/`autoAssignEncodings` edit.
- **#525 MCP-only consumer:** no Workbench/external-pull/hosted assumptions.
- **Determinism:** no `Date`/random/UUID in the verdict — pure fn of the input IR.
- **Two-layer** (server security/policy.json ∩ agent policy.json) **+ full cross-package closeout** (m05).
- **Per-mission native-learning HARD capture** via single-string `cmos_session` capture (NOT the stripped `cmos_mission_transition` `decisions[]`).
- **pm2/bridge restart is mine** (m05), never handed to Derek.

---

## 11. Verified anchors (live source, this session — hand-confirmed, no scouts)

| Anchor | File:line | Note |
|---|---|---|
| `validateVizEquivalenceRules(spec):VizA11yRuleResult[]` | `packages/viz-core/src/a11y/equivalence-rules.ts:36` | ✓ reuse VERBATIM |
| `VizA11yRuleResult = {id,summary,severity:'error'\|'warn',passed,message?}` | `equivalence-rules.ts:9-15` | ✓ native severity `'error'\|'warn'` |
| per-rule `try/catch` (crash-safe on arbitrary IRs) | `equivalence-rules.ts:42-61` | ✓ safe on agent input |
| `assertVizEquivalence` throws (→ coerced to `OODS-V129`) | `equivalence-rules.ts:64-71` | ✓ **NEVER call** |
| conformance partition to MIRROR (filter `!passed` → by severity → `OODS-A11Y-${id}`) | `viz.render.ts:197-230` (filter `:199`, codes `:208`/`:215`) | ✓ |
| `assertNormalizedVizSpec(input):NormalizedVizSpec` (throws) | `packages/viz-core/src/spec/normalized-viz-spec.ts:65` | ✓ authoritative IR validator |
| non-throwing `validateNormalizedVizSpec` → `{valid,errors}` | `normalized-viz-spec.ts:52` | ✓ optional |
| `toVegaLiteSpec(spec:NormalizedVizSpec)` (pure; throws if no marks) | `packages/viz-core/src/adapters/vega-lite-adapter.ts:84` | ✓ determinism transform |
| `sha256` / `canonicalize` | `packages/artifacts/src/utils.ts:5` / `:30`, re-export `index.ts:6` | ✓ from `@oods/artifacts` |
| viz.render imports (`canonicalize,sha256` / viz-core fns) | `viz.render.ts:47` / `:32-33` | ✓ mirror |
| `contentHash = sha256(canonicalize(toVegaLiteSpec(built.spec)))` | `viz.render.ts:185` + `:324` | ✓ round-trip identity |
| IR `marks:[Mark,...Mark[]]` / `Mark.trait:string` (e.g. `'MarkBar'`) | `normalized-viz-spec.types.ts:69` / `:101` | ✓ **no `chartType` on IR** (§3a) |
| `ECHARTS_PRIMARY` (local, unexported) `.mark` = the 8 primary traits | `viz.render.ts:356` | ✓ LIFT to shared |
| `EChartsPrimaryType` (8 type strings) | `viz.render.ts:347` | ✓ |
| `isEChartsPrimaryType(chartType: VizRenderInput['chartType'])` | `viz.render.ts:381` | ✓ keys off INPUT, not IR (§3a) |
| IR `VizConfig.theme?:string` (theme identifier) | `normalized-viz-spec.types.ts:313` | ✓ contrast-deferred (§7) |
| IR `EncodingMap.color?:TraitBinding` (field→channel binding) | `normalized-viz-spec.types.ts:120` (`TraitBinding` `:128`) | ✓ no resolved color |
| `readSchema` single-file, no `$ref` resolver | `index.ts:178` | ✓ permissive input schema (§3b) |
| output `issue` `$def` (`code` no-pattern, `severity` enum) | `viz.render.output.json:239-251` | ✓ mirror for `findings` |
| `viz.render` module-map pattern | `index.ts:129-132` | ✓ certify pattern |
| `viz.render` read-only security entry (`readOnly:true`, no `writes`) | `security/policy.json:240-249` | ✓ certify template |
| `viz.render` agent-policy entry shape | `configs/agent/policy.json` `{name,description,modes:['dry-run'],approval:'optional',allow,ratePerMinute}` | ✓ |
| registry `auto[]` 18 / `onDemand[]` 9 | `registry.json:2-21` / `:22-32`; `registry.ts:21-40` / `:41-51` | ✓ delta 27→25 |
| new-spec test glob (root-included, non-colocated) | `vitest.config.ts:5` (`'test/**/*.spec.ts'`) | ✓ m02 spec |
| colocated golden CI step + tool-surface step | `.github/workflows/ci.yml` ("Run colocated…goldens" + "mcp-bridge tool-surface test") | ✓ m05 |
| stub bodies always-pass | `purity.audit.ts:19` / `vrt.run.ts:19` / `reviewKit.create.ts:19` | ✓ retire (§6) |
| shared stub test (imports all 3) | `src/tools/__tests__/reviewKit.create.test.ts:5-7,11-13` | ✓ delete |
| stubs use `generic` schemas (no dedicated → no `generated.ts` change) | `index.ts:56-57/:61-62/:66-67` | ✓ |
| soak-runner `ToolName` union + limits + invocations (TS-breaking) | `tools/soak-runner/src/soak.ts:9,105-106,456-465` | ✓ m04 (§3c) |
| tool-surface test asserts `reviewKit.create` | `packages/mcp-bridge/src/tool-surface.test.ts:18,54,64,68` | ✓ re-point (§6) |
| `a11y.scan` is REAL (`evaluateContrastRules` over DTCG tokens) | `index.ts:49-52`, `security/policy.json:107` | ✓ **LEAVE IT** |
| `billing.reviewKit` is a DIFFERENT real tool | `index.ts:84-88` | ✓ do NOT touch |
