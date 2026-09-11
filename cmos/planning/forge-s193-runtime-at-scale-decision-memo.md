# Sprint 193 — Runtime at scale, the 34 missing rows, and the tool-truth census — LOCKED

**Status:** LOCKED 2026-09-11 (planning session `PS-2026-09-11-001`). Increment 12 of the Product
Reality Program. Base `c098237f` (OODS-pro, the Sprint 192 merge of PR #96; the review closure PR #97
is docs-only and merges whenever). Branch `codex/sprint-193-runtime-at-scale`, worktree
`~/.codex/worktrees/s193/OODS-Forge`.
**Direction (Derek, 2026-09-11):** keep driving until Forge has the actual tools and capabilities it
says it has; plan by milestones. The phase map is
[forge-remaining-work-phase-map-2026-09.md](forge-remaining-work-phase-map-2026-09.md) (decision
`#1893`). Sprint 193 is its first sprint; it carries milestones M1 (components real), M2 (generation
runs) and the measurement that grounds M3 (tools truthful).

## 1. What this sprint is for, in one sentence

Every generated cell runs and is measured at one head, every catalog row is implemented or typed, and
the 27 advertised tools get a served ledger of what is proven about them.

## 2. Measured base (`c098237f`)

| Surface | Measured | Source |
|---|---|---|
| Catalog | 109 rows; React/Vue **75/109** implemented-evidence-complete; 34 unavailable = 25 `Viz*` + `ArchiveEvent`, `CancellationEvent`, `ColorStatePicker`, `CommunicationDetailPanel`, `GeoFieldMappingForm`, `GeoResolutionBadge`, `GeocodablePreview`, `StateTransitionEvent`, `StatusColorLegend`; HTML 109/109; accessibility/theme 75 verified; interaction 24 verified / 51 static N/A; generated-consumer 61/109 | `packages/component-contracts/registry/component-capability-ledger.v1.json` |
| Classification | proposal v2 complete, 24 native / 84 recipe / 1 alias; `approvedRuntimeCensus` null; Derek's decision open (#1438) | `component-reconciliation.proposed.v2.json` |
| Generation | 11 objects × 7 contexts = 77 schemas; 66 single-screen → 132/132 cells; 11 workflows → 22/22; zero V007/N016; N015 for the 34 rows only | `artifacts/product-reality/sprint-192/m07/census-corrected.log`, `component-census/` |
| Runtime proof | **28/154** cells packed at one head (14 workflow, 10 timeline, 4 fixture; Sprint 192 m05); Invoice and Plan never packed; historical Sprint 187 receipts retained, never unioned | `sprint-192/m07/flows.json`, `packed-report.json` |
| Delivery | bridge serves `5fdf8a18`; Sprint 193 reconnect prepared unsent (cmos-dashboard, forge-demos, aquex-mcp) | `sprint-192/m07/reconnect-plan.json` |
| Tools | 21 auto + 6 on-demand registry entries; product-reality handler imports: code.generate 34, design.compose 11, pipeline 3, viz.render 1, repl.render 1, others 0; `viz_compose` a deprecated placeholder; `review` without a contract spec; portable E2E calls 4/21 | `packages/mcp-server/src/tools/registry.json`, `test/product-reality/`, `scripts/runtime/e2e.mjs` |
| Docs | `how-forge-works.html` :321/:335/:374 false since Sprint 190 (placeholders, "no brand input", "light theme, brand-independent"); `Tool-Specs.md` :1192-1211 links to non-existent `../api/*` pages; `docs/components` (33) ungated | agent-docs and how-forge-works contract tests |
| Visualization | 13/13 public SVG light/dark × A/B; 11/11 dashboard-drawn; 5 certified / 8 uncertified; `area` the only in-app chart | `packages/viz-core/src/registry/viz-recipes.v1.json` |

## 3. Missions (serial; exact criteria in CMOS)

| Mission | Outcome | Exit |
|---|---|---|
| m01 Deliver + reconnect | Primary checkout to `c098237f` (or the #97 merge), rebuilt, pm2 restarted; health/hashes/catalog proven through the bridge; three prepared notices sent byte-identical | ids recorded; #1439 completed |
| m02 Single-screen runtime harness | `scripts/product-reality/s193-runtime-cells.ts`: compose → generate → one pack per sweep → clean install → mount in the pinned Linux browser → gates per cell; `runtime-cells.v1.json` 132 rows; CI job; contract spec; bite | 132/132 pass or typed gap, zero fail |
| m03 Workflow harness × 11 | the workflow harness parameterised for all 11 objects, 22 cells, four states per screen; Invoice and Plan first cells; ledger 154 rows; `health.productReality.runtime` served and pinned; design-loop receipts | 22/22 measured; ratio served |
| m04 Nine non-viz rows | implemented as their proposed class on the Sprint 192 loops; placement by declared trait (bounded fixture where no public object declares it); N015 only for `Viz*` | React/Vue 84/109 |
| m05 25 `Viz*` rows | previews on the VizAreaPreview mechanism; controls/legends as form recipes over the intent fragment; summaries/badges read-only; same loops | 109/109 or typed gap (min 5 previews + 12 controls) |
| m06 Tool-truth census | `s193-tool-truth.mjs` → `tool-capability-ledger.v1.json` (27 rows: claim hash, measured tier, receipts, portable-E2E flag, structured caveats file:line); `health.productReality.tools`; docs-only fixes; Sprint 194 candidates listed, not decided | ledger reproduces byte-for-byte; zero tool behaviour change |
| m07 Closeout | ledgers regenerated, export refreshed, censuses, one five-suite capture (#1833), advertised diff from `c098237f`, reconnect prepared, near.md Increment 12 BUILT/REVIEW PENDING, PR, handoff | `builderSelfCertified:false` |

## 4. Settled decisions the builder does not reopen

1. **Runtime proof is a ledger, not prose.** `runtime-cells.v1.json` is the only source of the 154-cell
   ratio; historical receipts are never unioned into it; `health` serves the summary.
2. **One pack per sweep.** Tarballs are built once per harness run; every cell installs from them under
   the Sprint 185 isolation gates. A cell that cannot be installed from tarballs is a fail, not a skip.
3. **Typed gap, never silent.** A cell placing an unimplemented row records `OODS-N015` with the row
   names; a row not reached in m05 records a typed gap with the blocker. "Unavailable" without a reason
   does not exist after this sprint.
4. **Born measured.** New rows enter through the Sprint 192 loops (contract v1.1, scenario triggers,
   axe, interaction, six theme cells, readiness). No allowlist bypass, no new harness.
5. **Placement truth.** No public object is given an undeclared trait. Where none declares the trait
   (Auditable, Sortable, visualization traits), placement is proven on a bounded real-trait fixture and
   the README says so (#1888 pattern).
6. **m06 measures, Sprint 194 fixes.** The tool ledger changes no tool behaviour, schema or description.
   Its README proposes per-tool dispositions (make real / narrow / retire) for the Sprint 194 memo.
7. **Classification stays Derek's.** `approvedRuntimeCensus` stays null all sprint; implementing the 34
   rows changes evidence cells, not the obligation denominator (#1726, #1788).
8. **Verifiers pin the recorded head.** Retained verifiers record the implementation head and compare
   the product-path diff, never `git rev-parse HEAD` equality (learning #565).
9. **Pace rule.** No per-mission captures, no critic, no new closeout apparatus. One five-suite capture
   at close under #1833.

## 5. Sequence change recorded for the roadmap

The phase map moves tool truth ahead of visualization breadth: Sprint 194 = Increment 13 tools truthful
(brand seam end to end, `map` consumed or narrowed, `review` real or retired, `viz_compose` retired,
portable E2E over every advertised tool); Sprint 195 = Increment 14 visualization breadth and
certification; Sprint 196 = Increment 15 integrated release proof. The reason is Derek's criterion: the
tool gaps are claims Forge makes today; chart breadth is capability not yet claimed. m07 writes this
into near.md's next-increments table.

## 6. Descope ladder and never-cut

Ladder, in order: (a) m05 ships unreached `Viz*` rows as typed gaps with blockers (floor: 5 previews +
12 controls implemented); (b) m03's Invoice and Plan cells carry as typed gaps with the named blocker;
(c) m03's design-loop receipts reduce to 390 only. Never cut: m01's delivery and three sends; m02's
harness in CI with its bite; m06's ledger served by `health`; one capture; class-enumerated diffs;
zero hand-edited schemas.

## 7. Exit

- `runtime-cells.v1.json` covers 154 cells at one head, zero fail, ratio served by `health`.
- React/Vue 109/109 implemented or typed gap per row; N015 emitted only for typed-gap rows.
- `tool-capability-ledger.v1.json` 27 rows, byte-reproducible, served by `health`; the three stale
  narrative sentences and the dead links fixed.
- One green five-suite capture; advertised diff attributed; reconnect prepared; near.md Increment 12
  BUILT, REVIEW PENDING; closed only by the independent review.

## 8. Build notes

Worktree prepared during planning: `pnpm install --frozen-lockfile`, `build:tokens`, `build:packages`
exit 0 at `c098237f`; `.env` symlinked to the primary checkout. Node v24.6.0, pnpm 9.12.2. Native
select keyboard proofs and the packed browser cells need the pinned Linux Playwright image (learnings
#548, #557). `@oods/viz-render test` rebuilds its own dist (learning #546): never in parallel with
suites that consume it. Reuse `s188-m03-app-consumers.ts`, `s185-reachability.mjs`,
`s190-viz-census.ts`, `s185-sprint-wide-movers.mjs`, `s185-closeout.mjs`, `s185-audit-closeout.mjs`,
`s185-reconnect.mjs` with bounded s193 modes.
