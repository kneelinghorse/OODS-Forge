# Forge — the remaining work, mapped to milestones

**Status:** planning input for Sprint 193 (session `PS-2026-09-11-001`, 2026-09-11). Measured at
`c098237f` (OODS-pro, the Sprint 192 merge; closure PR #97 is docs-only).
**Direction (Derek, 2026-09-11):** keep driving until Forge has the actual tools and capabilities it has
been saying it has. This document answers "what remains, in what order, and how do we know each piece
is done" across the whole advertised surface, not one sprint.

## 1. Where we are, in one table

The Product Reality Program (`cmos/foundational-docs/roadmap/product-reality-program.md`) has ten exit
criteria. This is their state at `c098237f`, measured, not recalled.

| # | Exit criterion | State at `c098237f` | What closes it |
|---|---|---|---|
| 1 | Every catalog row has an evidence-backed proposed classification, approved by Derek | Proposal complete (109/109: 24 native / 84 recipe / 1 alias, `component-reconciliation.proposed.v2.json`); **approval open** (#1438) | Derek's one decision |
| 2 | Runtime census derived from memberships | Blocked on 1 (`approvedRuntimeCensus` null) | Follows 1 mechanically (the ledger already exists) |
| 3 | Every native/recipe target resolves in clean packed consumers | **75/109** React and Vue, evidence-complete; 34 unavailable (25 `Viz*` controls + `ArchiveEvent`, `CancellationEvent`, `ColorStatePicker`, `CommunicationDetailPanel`, `GeoFieldMappingForm`, `GeoResolutionBadge`, `GeocodablePreview`, `StateTransitionEvent`, `StatusColorLegend`) | Sprint 193 wave |
| 4 | Every saved-schema node compiles and renders in both targets | Served store 16/16 (adopted User-form successor); original store's 15/16 is a retained historical negative | Done for the served store |
| 5 | `code.generate` emits no fictional import, alias, blank action or silent fallback | 77/77 schemas, 154/154 cells generate with zero V007/N016; the only typed gaps are N015 (the 34 rows) and N018 (HTML Tailwind, by design) | Sprint 193 wave closes N015 |
| 6 | Draft/build/release profiles enforced | Exists; release profile trusts caller-supplied evidence hashes without independent execution (`tool-descriptions.json`, code.generate) | Sprint 195 tool truth: release profile executes or names what it did not |
| 7 | Every chart type produces public pixels; census + Core Analytics Profile meet gates | 13/13 public SVG light/dark × A/B; 11/11 dashboard-drawn; **5 certified / 8 uncertified**; HC pixels deferred; no taxonomy, no Core Analytics Profile; chart placed in the generated app for `area` only | Sprint 194 (visualization breadth and certification) |
| 8 | One complete greenfield app usable in React and Vue | Subscription certified usable (#1844); Organization and User generate and pass gates but sit below the craft bar; **packed runtime proof 28/154 cells at one head** | Sprint 193 runtime at scale; craft review of the other two apps |
| 9 | External design-surface writes previewed/approved/idempotent | Not an approved claim; no adapter ratified | Derek's adapter decision, after Phase 1 |
| 10 | Docs and catalog claims derived from the same executable ledger | `catalog_list` and `docs/api` (28 files) are ledger/schema-derived with `--check`; `docs/components` (33 files) ungated; `Tool-Specs.md` count-gated only with dead links to retired per-action pages; `how-forge-works.html` carries three stale chart/certification sentences | Sprint 195/196 |

## 2. The gap the roadmap does not show: the advertised tools

Every increment so far has measured components, generation and charts. Nobody has measured the 21 tools
we advertise as tools. A read-only inventory at `c098237f` (contract specs, product-reality specs,
browser and packed-consumer receipts, and the code) gives this picture:

| Tool | Proof today | Honesty gap |
|---|---|---|
| `code_generate` | 34 product-reality specs, packed browser consumers, live bridge | Strongest surface. Release profile trusts caller hashes |
| `design_compose` | 11 product-reality specs, packed screenshots | "Natural-language intent" is keyword + synonym lookup; placeholder props injected |
| `pipeline` | 3 product-reality specs | Thin; duplicate option aliases with no precedence test |
| `viz_render` | s190/s191 matrices: 52 cells, byte-stable | ECharts path returns `spec: {}`; geo specs not self-contained; some range options silently ignored |
| `dashboard_render` | 4 × 11-panel dashboards byte-stable; portable E2E | `measureRef` inert; `comparison.basis` and anomaly narration deferred |
| `artifact_certify` | s190/s191; portable E2E positive + negative | 8 types `conformant:null`; a11y-equivalence permanently `unchecked` on that path; 3 types have zero accuracy rules |
| `catalog_list` | s192 ledger, served truthfully | None beyond the 34 unavailable rows |
| `design_preview` | s189 receipts | Needs `pnpm design:loop serve` running in this checkout; unusable over a remote bridge |
| `health` | Used by every closeout | `tokens.theme/brand` are env defaults, not observed state |
| `tokens_build` | Contract specs only | `brand`/`theme` label the payload, never filter it; three `copyFileSync` calls |
| `structuredData_fetch` | Contract specs only | `listVersions`/`version` throw `OODS-V201` in kind mode |
| `registry_snapshot` | Contract specs only | v1.4.0 fields are a stub round-trip no handler consumes |
| `repl` | 1 product-reality spec | Brand dropped silently on fragments; `apply` ignored on one branch |
| `object` | Contract specs only | Read-only by design; `action` key ignored by handlers |
| `schema` | Contract specs only; store contents pinned | `apply` accepted and ignored on all four actions |
| `map` | Contract specs only | **Mappings have no downstream consumer**: neither the composer nor codegen reads them (`how-forge-works.html:316`); v1.4.0 review ingress is a stub |
| `brand_apply` | Contract specs only | **Never writes token source**: `apply:true` writes an artifacts run directory; the "build" spawns `check:tokens` with `stdio:'ignore'` and swallows errors; emits literal `(no-op)` lines |
| `brand_intake` | Contract specs only | Validator only; `apply` forced false; the content-addressed operand is schema-valid but intentionally unresolved |
| `fidelity_preview` | Unit tests only | "Non-production" in its own schema; brand palette is a hard-coded hex table unrelated to `packages/tokens` |
| `viz_compose` | Registration-only contract spec | Deprecated, self-described "field-names-only placeholder", still one of the 21 |
| `review` | 3 unit tests; **no contract spec** | `patch` is a label, not a patch; `chain` accepts only 9 demo fixtures; nothing applies the result |

Three consequences:

- **The brand-authoring seam is broken at every joint.** Rendering brand is real and measured (tokens.css
  emits six scopes; charts, dashboards, component cells and app shells all move with brand and theme).
  But intake cannot apply, apply cannot write source, its build is a swallowed subprocess, and the branded
  fidelity emitter uses its own hex table. This is also the prerequisite for any Parts Town or Shopify
  brand leg.
- **The brownfield path the product contract promises does not exist yet.** `map` records mappings that
  nothing consumes.
- **The portable runtime exercises 4 of 21 tools.** The bundle omits the bridge and its E2E calls
  `health`, `dashboard_render`, `viz_render` and `artifact_certify` only; 17 tools are listed but never
  called. Nothing is published (all runtime packages private; no publish step in any workflow).

The six on-demand registry entries (`a11y.scan`, `diag.snapshot`, `billing.reviewKit`,
`billing.switchFixtures`, `release.verify`, `release.tag`) were not inventoried and join the same census.

## 3. Milestones — what "done" means, measurably

| Milestone | Definition of done (measured at one head, independently reviewed) | Sprint |
|---|---|---|
| **M1 Components real** | 109/109 rows implemented in React and Vue or carrying a typed gap; every implemented row has measured accessibility/theme/interaction cells; Derek's classification approved so the runtime census is non-null | 193 + Derek |
| **M2 Generation runs** | All 154 generation cells pass a packed runtime gate at one head (single-screen harness over 132 cells, workflow harness over 11 workflows); Organization and User reach Subscription's craft bar or carry ranked craft carries | 193 (harness + gate), craft in 195/196 |
| **M3 Tools truthful** | A generated tool-capability ledger over all 27 registry entries, served by `health`; every advertised tool has product-reality proof at the MCP boundary and is called by the portable E2E, or is narrowed/retired with a record; the brand seam runs end to end (intake → apply writes source with receipt → real build → pixels move in chart, app and component cells); `map` output consumed by composer/codegen or the brownfield claim narrowed; `viz_compose` retired; `review` given a contract and a real patch output or retired | 194 |
| **M4 Charts classified and certified** | Versioned taxonomy and Core Analytics Profile; 21 patterns promoted to recipe identities; each of 13 types certified or typed-uncertified with a stated architecture decision (ECharts compile leg or declared profile); HC palette decision; charts placeable beyond `area`; viz mutation bites | 195 |
| **M5 Release proof** | Bridge in the portable bundle; three reference apps exercised from the bundle; `docs/components`, Tool-Specs prose and `how-forge-works` chart/certification sentences generated from the ledgers with `--check`; doc and viz bites; gate-2 decision packet prepared | 196 |
| **M6 Adoption gates (Derek's)** | Classification approval (M1); design-surface adapter decision (MCP Apps `ui://` candidate from DT-R002); gate 2 (license, public publish, `.mcpb`); Shopify enterprise walk in its own repo; communicate-Forge onboarding | after M5, decided one at a time |

Parked and unchanged: Parts Town brand seed and mobile federation (until Derek unparks); `schema.ingest`
(#1649/#1652); HC chart pixels until M4's palette decision.

## 4. Sequence and why

```
193  Increment 12   M2 harness + gate, M1 wave (34 rows), tool-truth CENSUS (measure only)
194  Increment 13   M3 tools truthful (brand seam, map, review, viz_compose, portable E2E 27/27)
195  Increment 14   M4 charts classified and certified
196  Increment 15   M5 release proof (bridge in bundle, docs from ledgers, bites)
then M6            Derek's gates, one at a time
```

The change from the near.md sequence is one move: tool truth goes before visualization breadth. The
reason is Derek's criterion. Visualization breadth adds capability we have not claimed yet; the tool
gaps in section 2 are claims we make today. The tool-truth census runs in Sprint 193 as a measurement
mission so the 194 memo is grounded in a ledger, not this inventory. Nothing in 193 depends on it.

Every sprint keeps the program cadence: one locked memo, a fresh build session in an isolated worktree,
no per-mission captures, one five-suite capture at close, independent review, `builderSelfCertified:false`.

## 5. Sprint 193 — proposed slate (Increment 12, to lock)

Base `c098237f`; worktree `~/.codex/worktrees/s193/OODS-Forge`, branch `codex/sprint-193-runtime-at-scale`.

| Mission | Outcome | Exit |
|---|---|---|
| m01 Deliver + reconnect | Primary checkout fast-forwarded to `c098237f` (or the PR #97 merge; identical runtime bytes), rebuilt, `pm2` restarted; `/health.revision` proven; the prepared Sprint 193 reconnect sent to cmos-dashboard, forge-demos, aquex-mcp (`sprint-192/m07/reconnect-plan.json`, bodies byte-identical) | Three message ids recorded; next-step #1439 completed |
| m02 Single-screen runtime harness | One generic packed harness over all 66 single-screen schemas × React/Vue = 132 cells, one pack per sweep, typed gaps per cell, runs as a CI job and a capture-suite entry | 132/132 measured (pass or typed gap), never a union of historical receipts |
| m03 Workflow runtime harness | The Subscription/Organization/User harness parameterised for all 11 workflows × 2 = 22 cells; Invoice and Plan gain their first packed cell | 22/22 measured; runtime ratio served as a gated number (from 28 toward 154) |
| m04 The 9 non-viz rows | `ArchiveEvent`, `CancellationEvent`, `StateTransitionEvent`, `ColorStatePicker`, `StatusColorLegend`, `CommunicationDetailPanel`, `GeoFieldMappingForm`, `GeoResolutionBadge`, `GeocodablePreview` born measured on the Sprint 192 loops (contract v1.1, scenario triggers, axe, interaction, six theme cells), placed where their traits declare | React/Vue 84/109; N015 emitted for the 25 `Viz*` rows only |
| m05 The 25 `Viz*` control rows | Controls/summaries/previews implemented as recipes over existing primitives bound to `viz_render` intent fields; previews render the shared SVG renderer output; same proof loops | React/Vue 109/109 or typed gap per row with a reason |
| m06 Tool-truth census (measure only) | A generated `tool-capability-ledger.v1.json` over 27 registry entries: claim, proof tier (product-reality / contract / unit / none), portable-E2E called, honesty caveats with file:line; served by `health`; the three stale `how-forge-works` sentences and the Tool-Specs dead links fixed as docs-only; ledger census retained | Ledger reproduces section 2 at the head; zero product code changes in this mission |
| m07 Closeout | Ledger regenerated (component 109-row + tool), export refreshed, censuses, one five-suite capture under #1833, advertised diff from `c098237f`, reconnect prepared, near.md Increment 12 BUILT/REVIEW PENDING + this map's sequence recorded, PR, handoff | `builderSelfCertified:false` |

Descope ladder (in order, never past the never-cut line): m05 can ship the 25 `Viz*` rows as typed
gaps with reasons if the runtime harnesses consume the session; m03's Invoice/Plan cells can carry as
typed gaps. Never cut: m01, m02's gate in CI, m06's ledger, one capture, class-enumerated diffs, zero
hand-edited schemas.

## 6. What this asks of Derek

One direction call now: lock Sprint 193 on the slate above with tool truth moved ahead of visualization
breadth (section 4). Everything else in M6 is decided later, one at a time, with evidence in hand.
