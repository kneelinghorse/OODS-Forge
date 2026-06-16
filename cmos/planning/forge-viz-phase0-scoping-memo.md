# OODS Forge — Viz Phase 0 Scoping / Decision Memo

**Status:** Decision memo (resolves strategy §5.1–5.3; for Derek to ratify)
**Date:** 2026-06-16 · follows [forge-viz-flagship-strategy.md](forge-viz-flagship-strategy.md) §6 ("scoping/decision-memo mission first, then Phase 0")
**Grounded in:** direct reads of the live tree (2026-06-16) — `src/viz/` (69 files), `packages/mcp-server/src/{tools,schemas,compose}`, root + package `tsconfig`/`package.json`, and the verified [DSV-045 report](../research/DSV-045-results%281%29.md) §10b. Every claim below carries a file:line anchor.

This memo resolves the three Phase-0 design decisions the strategy flagged as blockers. It does **not** re-open the thesis, the phasing, or §5.4 (BI beachhead) / §5.5 (B40 + dormancy) — those are tracked separately.

---

## TL;DR — the three decisions

| # | Decision | Recommendation | Why (one line) |
|---|---|---|---|
| 1 | **Data contract** (§5.1) | **Inline rows as the primary contract, + an optional `datasetRef` reusing the existing schemaRef cache** for large/reused data | Matches how every sibling tool already works (self-contained payload); the cache machinery already exists; defer external data-source ingestion to Phase 1+ |
| 2 | **One engine or two** (§5.2) | **Extract a headless `@oods/viz-core` workspace package; MCP server consumes it like `@oods/a11y-tools`** | A real build/runtime boundary blocks direct import; `@oods/*` workspace packages are the established sharing convention; the core is already pure TS so extraction is mechanical |
| 3 | **Output contract** (§5.3) | **Spec-only output (Vega-Lite primary, ECharts opt-in), mirroring `repl.render`'s compact/full + ref pattern; no server-side render in Phase 0** | The engine produces specs, not pixels — there is no SSR path today; spec is small, portable, and the consumer (Workbench/browser) already renders |

The three interlock into one Phase-0 tool shape (§"How they interlock").

---

## Decision 1 — Data contract (§5.1): where do the rows come from?

**The question.** `viz.compose` today takes field *names*, not rows. To render a real chart the tool needs the actual data. Inline rows? An opaque data ref? A Stage1/catalog-backed dataset?

**Grounded findings.**
- Current `viz.compose` input (`packages/mcp-server/src/schemas/viz.compose.input.json`) accepts `chartType`, `object`, `traits`, and `dataBindings` whose values are **field-name strings** — no row payload. `viz.compose.ts:293` hardcodes a placeholder `data` field definition (a schema stub, not real rows).
- **No existing tool passes tabular rows.** `repl.render` / `repl.validate` / `design.compose` / `pipeline` all take an inline component **schema** *or* a cached **`schemaRef`** (30-min TTL). The reference-with-TTL cache is the strongest local precedent for "don't re-send a big payload across pipeline stages."
- **No existing row-data source to lean on.** `structuredData.fetch` returns catalog/registry **metadata** (component/trait/token counts), not rows (`structuredData.fetch.ts:238–259`). Stage1 artifacts are design-evidence (component candidates, prop inference) — not datasets (`docs/integration/stage1-oods-contract.md`). The Object Catalog carries **typing**, not records (`objects/core/*.object.yaml`). Billing fixtures are single representative objects, not row arrays.
- **Size pressure is real but unquantified.** There is no published hard cap in source; the constraint is an external MCP transport limit that ~79KB of token CSS "blew" (`repl.render.ts:42–48`), which is what forced the compact-default flip. So inline rows must be **bounded**.

**Recommendation.** Two-tier, phased:
1. **Primary (Phase 0): inline rows.** Add a `data: { rows: [...] }` (or `values: [...]`) field to the viz tool. This is lowest-friction for the agent's *first* call, self-contained (matches every other tool's "send me the payload" shape), and is exactly what the normalized spec already carries internally (`examples/viz/*.spec.json` embed `data.values[]`). **Bound it** — start with a documented cap (~a few hundred rows / low-tens-of-KB) and reject above it with a pointer to the ref path.
2. **Escape hatch (Phase 0, cheap): `datasetRef`.** For larger or reused data, accept an opaque `datasetRef` that reuses the **existing schemaRef-style cache** (same TTL machinery) — populated by a small `data.put`-style call or by an upstream pipeline stage. This keeps big payloads out of the per-call result and gives pipeline reuse for free.

**Explicitly defer:** Stage1-backed, structuredData-backed, and Object-Catalog-backed dataset ingestion. Those are *data-source* integrations that belong to Phase 1+ (data-aware intelligence), not the Phase-0 reconnect. Phase 0 only needs "rows arrive somehow"; inline + ref covers it with zero new infrastructure.

---

## Decision 2 — One engine or two (§5.2): import `src/viz`, or extract a headless core?

**The question.** The real engine lives at repo-root `src/viz` (React/TS design-system context). The MCP server is headless. Does the server import `src/viz` directly, or do we extract a headless core?

**Grounded findings (this is where the surface answer is wrong).**
- The headless layers are genuinely pure TS: **60 of 69** non-test `src/viz` files have no React/DOM imports. Only **9** are React-coupled and would stay behind: the six `src/viz/hooks/*`, `src/viz/contexts/dashboard-spatial-context.tsx`, and `src/viz/patterns/scaffold-generator.ts` (emits React source as strings). The spec IR (`spec/normalized-viz-spec.ts`), both adapters (`adapters/{vega-lite,echarts}-adapter.ts`), the recommender (`patterns/suggest-chart.ts` + scorers), interaction reducers, a11y, transforms, validation, encoding, resolver are all headless. `runtime/vega-embed-loader.ts` is browser-only but a *dynamic* import, so it doesn't eagerly load.
- **But a direct import is blocked by the build/runtime model — not by React.** The MCP server builds with plain `tsc` (`packages/mcp-server/tsconfig.json`: `"rootDir": "src"`, `"include": ["src/**/*"]`) and runs `node dist/index.js` (`start` script). A `tsc` build will not compile files outside its `rootDir`, and `node dist` does **not** resolve the `@/*` tsconfig alias at runtime. The alias only works for typecheck/IDE and the `tsx`-based `dev` script — **not** for the shipped build.
- **The repo already has the right pattern, and the server already uses it.** There are **zero** `@/` cross-root imports in `packages/mcp-server/src`. The server shares code exclusively via `@oods/*` **workspace packages** — `@oods/a11y-tools` (7), `@oods/artifacts` (3), `@oods/release-utils` (2), `@oods/components` (2). Root tsconfig maps `@oods/*` → `packages/*/src`, and at runtime pnpm symlinks each package's built `dist` into `node_modules`. `@oods/a11y-tools` is the template to mirror: `type: module`, tsup dual ESM/CJS build, an `exports` map, its own `build`/`test`.

**Recommendation.** **Extract `@oods/viz-core` as a new workspace package** containing the ~60 headless files (spec IR · both adapters · recommender + scorers · interaction reducers · a11y · transforms · validation · encoding · resolver), shaped exactly like `@oods/a11y-tools` (tsup dual-build + `exports` map). The React layer — `hooks/`, `contexts/*.tsx`, `scaffold-generator.ts`, and `src/components/viz/*` — **stays in repo-root `src/viz`** and *also* consumes `@oods/viz-core` (the design system and the MCP server become two consumers of one core). The MCP server adds `@oods/viz-core` as a workspace dependency, identical to how it already pulls `@oods/a11y-tools`.

**Why not "direct import" (the cheaper-sounding option):** it cannot `tsc`-build (`rootDir: src`) and cannot resolve at `node dist` runtime; adopting it would mean changing the server's build system to a bundler that inlines repo-root `src/` — itself a non-trivial decision that *diverges* from the established `@oods/*` convention (Rule 11). Extraction is both convention-matching and the technically-correct answer. **This confirms strategy §5.2's instinct** ("likely extract… as a server-usable core") and corrects the surface read that "the alias resolves today, so just import it."

**Cost note:** extraction is mechanical (move 60 pure-TS files + a `package.json`/`tsup.config` + `exports`, repoint the design-system imports at `@oods/viz-core`) — no React surgery inside the core. It is real work (60 files, ~12K LOC of the ~14.2K total move), but it is *move + rewire*, not *rewrite*. This is the bulk of Phase-0 effort and should be sized as such.

---

## Decision 3 — Output contract (§5.3): spec, rendered HTML/SVG, or both?

**The question.** Does the agent get back a Vega-Lite/ECharts **spec**, a rendered **HTML/SVG**, or both (à la `repl.render`'s compact/full)?

**Grounded findings.**
- **The engine is spec-centric and has no server-side render path.** `adapters/vega-lite-adapter.ts:84` (`toVegaLiteSpec`) and `adapters/echarts-adapter.ts` (`toEChartsSpec`) produce JSON spec objects. Actual rendering is **browser-only** via `vega-embed` (`runtime/vega-embed-loader.ts` dynamically imports it and needs a DOM element). There is **no** `renderToString`/`toSVG`/SSR anywhere in `src/viz`. `renderer-selector.ts:34` only *chooses* a renderer; it does not render.
- **The precedent to mirror is `repl.render`'s compact/full.** Compact (now default, `repl.render.input.json:71`) returns the artifact but **omits the ~79KB token CSS**, handing back `tokenCssRef: "tokens.build"` instead; full (`compact:false`) inlines everything and is ~1.67× larger (`repl.render.ts:42–48`, `repl.render.compact.spec.ts:78`). The lesson the repo just paid for: **don't inline big blobs by default.**
- Current `viz.compose` returns a **UiSchema component tree** (`VizMarkPreview` + `VizMarkControls`, `schemaRef`, `slots`, `meta`) — a placeholder scaffold, not a chart spec and not pixels (`viz.compose.ts:70–89`).

**Recommendation.** **Spec-only in Phase 0**, structured to mirror `repl.render`:
- **Compact (default):** return the **compiled Vega-Lite spec** (the engine's primary target; `renderer-selector` picks Vega-Lite vs ECharts) plus the normalized spec and `warnings`/`meta`. Small, portable, well under any transport cap. The consumer — Workbench, a browser, or any MCP client with a renderer — renders it. This is what makes the chart "real": a genuinely data-bound, renderable spec instead of today's placeholder.
- **Full (opt-in, `compact:false`):** additionally return the **ECharts spec** (and later, if/when an SSR path exists, a rendered artifact). ECharts is opt-in because dual specs roughly double the payload for the same chart.
- **Defer server-side SVG/HTML rendering entirely.** There is no SSR path today; building one (headless browser or a Node Vega renderer) is its own lift and would reintroduce exactly the size-cap pain the compact flip just fixed. "Forge returns a renderable spec; the consumer renders" is the honest, low-risk Phase-0 contract.

**One genuine sub-fork for Derek (output *envelope*):** the existing `viz.compose` returns a Forge-native **UiSchema** (consistent with `design.compose`/`repl`), whereas the engine's real output is a **chart spec**. Two ways to reconcile:
- **(A) Spec is the payload** — the tool returns the compiled spec directly (cleanest for "agent gets a chart"). *Recommended.*
- **(B) Spec wrapped in a UiSchema slot** — keep emitting a UiSchema whose chart slot carries the spec, so charts compose into Forge dashboards/views the same way other components do (better for Phase 2 dashboard composition, slightly heavier now).
I recommend **(A) for Phase 0** with the spec as the primary field, and revisit the UiSchema wrapper when Phase 2 (dashboard composition) actually needs it — don't pay for the wrapper before there's a dashboard to slot it into.

---

## How they interlock — the Phase-0 tool shape

The three decisions compose into a single concrete tool. Recommended shape (a new tool rather than mutating the placeholder):

```
viz.render(                         // new verb, parallels repl.render
  intent?,                          // NL/goal — feeds the recommender (suggest-chart)
  chartType? / encodings?,          // optional explicit override
  data: { rows: [...] } | datasetRef,   // Decision 1: inline (bounded) or cached ref
  output?: { compact: true }        // Decision 3: compact = Vega-Lite spec; full adds ECharts
)
  → imports @oods/viz-core          // Decision 2: the extracted headless engine
  → rows + intent → suggest-chart → NormalizedVizSpec → vega-lite/echarts adapter
  → returns: { spec (vega-lite), normalizedSpec, warnings, meta,
               echartsSpec? (full only), specRef (schemaRef-style cache) }
```

- **Decision 2** supplies the engine (`@oods/viz-core`), **Decision 1** supplies the data, **Decision 3** supplies the return envelope.
- Keep/deprecate the legacy placeholder `viz.compose` separately (it's referenced by `pipeline` and `docs/api/viz-compose.md`) — a `viz.compose` rewrite vs a new `viz.render` is a small naming sub-decision, noted below.
- **Two-policy reminder** (per `agents.md` §"Tool policy"): any new bridge-exposed tool must be registered in **both** `configs/agent/policy.json` and `packages/mcp-server/src/security/policy.json`, or enforcement/visibility diverges.

---

## Corrections this grounding forced

- **To the strategy doc (§5.2):** its hedge "*does the MCP tool import `src/viz` directly, or do we extract a headless core?*" resolves firmly to **extract** — not because of React coupling (the core is 60/69 pure TS) but because of the server's `tsc rootDir:src` + `node dist` build/runtime model and the zero-`@/`-imports / all-`@oods/*` convention. Strategy's parenthetical instinct was right; this memo removes the hedge.
- **To the DSV-045 report (§4 / §10b):** confirms §10b's verified column — the report's aspirational `recommend_charts`/`optimize_spec`/`nl_to_spec` signatures don't exist; Phase 0 is the reconnect. Adds the build-boundary detail the report couldn't see (Forge is private to it).
- **To the first capability read:** the "direct import resolves today, ~1–2 hrs" conclusion is **incorrect for the shipped build** — it holds only for typecheck and the `tsx dev` path, not `tsc` build / `node dist` runtime. The honest Phase-0 cost is dominated by the `@oods/viz-core` extraction.

## Out of scope (tracked elsewhere, not resolved here)

- **§5.4 BI beachhead** (decision-centric analytics vs embedded chart API vs exploratory) — a product-scope call, not a data/engine/output-contract call; defer to a Phase-2 framing.
- **§5.5 B40 + dormancy debt** — confirm the live state of the B40 hierarchy-render blocker and the spec→component gap as a Phase-0 *implementation* task, before estimating the sprint.

## Decisions for Derek to ratify

1. **Data contract:** inline rows (bounded) as primary + `datasetRef` escape hatch on the existing cache. **[recommend yes]**
2. **Engine:** extract `@oods/viz-core` workspace package (mirror `@oods/a11y-tools`); React layer stays in `src/viz` and consumes the core. **[recommend yes]**
3. **Output:** spec-only, Vega-Lite default / ECharts opt-in, compact-full mirror of `repl.render`; no SSR in Phase 0. **[recommend yes]**
4. **Envelope sub-fork:** spec-as-payload (A) now, UiSchema wrapper (B) deferred to Phase 2. **[recommend A]**
5. **Naming:** new `viz.render` tool vs rewrite `viz.compose` in place. **[recommend new `viz.render`; deprecate the placeholder]**

Once ratified, Phase 0 is sized as: **`@oods/viz-core` extraction (the bulk)** → `viz.render` wired to it (data-in → spec-out) → B40 + spec→component confirmation → two-layer policy registration.
