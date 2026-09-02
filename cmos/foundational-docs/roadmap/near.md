# Near Roadmap

**Status:** Active — Forge serving horizon for the Shopify-selected direction
**Updated:** 2026-08-25
**Scope:** Next 1–3 Forge planning cycles; Shopify execution remains in its sibling repository
**Companion to:** [Roadmap index](README.md) · [Sprint-178 locked direction memo](../../planning/forge-s178-brand-storybook-viztwin-decision-memo.md)

> **⚠️ FROZEN HISTORY / CURRENT RESET — 2026-08-25; NL→viz arc REVERTED 2026-06-29.**
> The former sprint-144 horizon is a point-in-time record: dated facts are not silently rewritten
> (decision #679), and its detailed s96–s107 shapes now remain in Git/CMOS history rather than this
> live tier. The Shopify direction fired next step #1267, now complete, so decision #1542's “forward
> rewrite remains parked” clause is superseded. The NL→viz disposition is unchanged (decisions #973 and
> #1542): `viz.fromText`, the `@anthropic-ai/sdk` parser, the `nlviz/` module, and the uncommitted
> dimension registry (`dimensionRef` / `^gd.`) did not ship and are not roadmap scope. The surviving
> half is typed, structured `viz.render` intent: agents can send deterministic `goal`, named
> `measures`/`dimensions`, optional `chartFamily`, and optional governed `measureRef`. The free-text
> layer was reverted because it made an LLM parse English for the LLM agent that can emit that intent
> directly. The 13-type matrix, governed measures, dashboards, deterministic HTML export, and
> measure-aware accessibility narrative survived.

This file now answers one question: what Forge itself should do near-term while the Shopify proof
arc discovers what it needs. It does not import another repository's roadmap. Current mission state
comes from CMOS; this document supplies the direction and dependency gates behind that queue.

## Governing boundary — constraint #5 verbatim

> CONSUMER MODEL (Derek, 2026-06-18 — standing constraint, supersedes the s115 "consumer pull"
> framing): Forge's consumer is AGENTS using the Forge tools via MCP. That is who we build for. (1)
> There is NO external project that PULLs from Forge — do NOT frame any sprint, mission, or value case
> around "proving a consumer pull" or any other team adopting a Forge output. (2) Forge is NOT a
> hosted/SaaS service and there are NO current plans to be one; nothing should assume a
> deployed/reachable Forge endpoint. (3) There are NO plans to use Synthesis-Workbench with the
> viz/export work — do not assume a Workbench surface. (4) Headless integrations are welcome IN
> PRINCIPLE but are a SEPARATE initiative that must be discussed explicitly BEFORE any work — as must
> ANY dependency that would be created for a live production site. Capabilities ship for agent use
> first; cross-app/production wiring is its own decision, never an implied sprint goal. This is why
> s115's m06 (a cmos-dashboard cutover) was correctly dropped and why the "demand signal / pull"
> thesis behind it is retracted.

Source: active CMOS constraint #5, reaffirmed unchanged 2026-08-22.

## Direction selected: Forge serves the Shopify proof

Shopify is the selected enterprise-test target (decision #1532; planning session
PS-2026-08-25-002). The proof has a separate sibling project and owns its discovery and build
choices. Shopify's D1–D6 and sprint sequence remain in that sibling repository; Forge does not copy
those missions here or assume their outcome.

Forge's role is narrower:

1. answer discovery questions from verified repository and MCP evidence;
2. expose existing capabilities to the proof's agents through Forge's MCP tools;
3. send dated capability/status packets through `cmos_message` rather than creating a cross-repo
   dependency; and
4. charter a Forge build only after discovery identifies a Forge-owned gap and Derek approves that
   movement explicitly.

This is compatible with constraint #5: the Shopify sibling is not a project that pulls Forge
artifacts or requires a hosted Forge service. Its agents exercise Forge through the MCP boundary.

## Verified Forge surface available to discovery

The claims below were re-counted against the live tree on 2026-08-25. They are capability facts,
not promises about what Shopify will build.

| Surface               | Verified capability                                                                                                                                                                                                                                                                                                         | Source of truth                                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| MCP registry          | 20 auto-registered tools plus 6 on-demand tools                                                                                                                                                                                                                                                                             | `packages/mcp-server/src/tools/registry.json:2-30`                                                                                             |
| Visualization         | 13 `viz.render` types: 5 Cartesian (`bar`, `line`, `area`, `scatter`, `heatmap`) plus 8 explicit ECharts-primary types (`treemap`, `sunburst`, `sankey`, `force_graph`, `choropleth`, `bubble_map`, `flow_map`, `chord`)                                                                                                    | `packages/mcp-server/src/schemas/viz.render.input.json:272-275`                                                                                |
| Governed measures     | With `resolveMeasures` enabled, `dashboard.render` can resolve a known `measureRef` for KPI compute; chart-panel and structured-intent measure refs add governed narrative context without changing chart compute. Unknown refs fail loud on the enabled path.                                                              | `packages/mcp-server/src/schemas/dashboard.render.input.json:66-70,246-249`; `packages/mcp-server/src/schemas/viz.render.input.json:339-384`   |
| Dashboards and export | `dashboard.render` supports 11 of the 13 chart types (not `chord` or `flow_map`), deterministic auto-layout, KPI compute, cross-filter linking, optional brand/a11y output, and opt-in deterministic HTML. HTML renders Vega-Lite panels and KPI tiles; ECharts-primary panels remain accessibility-described placeholders. | `packages/mcp-server/src/schemas/dashboard.render.input.json:5-6,36-40,120-123`; `packages/mcp-server/src/tools/dashboard.render.html.ts:1-20` |
| Narrative             | Governed unit, threshold, and comparison context reaches the accessibility narrative when HTML or a11y output is requested; V141/V142 stop threshold value/direction drift.                                                                                                                                                 | `packages/mcp-server/src/tools/dashboard.render.ts:415-475,692-700`                                                                            |
| Multi-brand           | Brand A and Brand B each have base, dark, and high-contrast token cells; the generated bridge owns 41 semantic slots.                                                                                                                                                                                                       | `docs/theming/multi-brand.md:3,13-15`                                                                                                          |
| Mobile                | Crawl 1–3 and compile-truth are done. Further crawl items and the native walk remain gated on a named mobile/native use case; no walk is implied here.                                                                                                                                                                      | `cmos/planning/forge-open-arcs-ledger-2026-08.md:161-171`                                                                                      |

### Certification truth — keep the two quartets separate

Decision #977's strategic quartet is **accuracy, fidelity, contract-determinism, and
accessibility-by-construction**. It describes the flagship value thesis.

The `artifact.certify` response quartet is
`{a11yEquivalence, determinism, contrast, accuracy}`. It describes wire-level pillar results. These
are not aliases and must not be collapsed into one list.

Current certification posture (`packages/mcp-adapter/tool-descriptions.json:20`):

- the 5 Cartesian types are `coverage:'certified'`; their contrast is measured from the chart Forge
  actually renders, and a render—when performed—also participates in determinism through optional
  `renderHash`;
- the 8 ECharts-primary types are `coverage:'uncertified'` / `conformant:null`, but they do carry a
  real contrast verdict: the 5 categorical types are reconstruction-graded from the adapter palette
  and the 3 geo types are exempt under the existing sequential/continuous ruling; and
- ECharts render-grading implementation is not shipped. Sprint-178 produced a planning-grade
  feasibility record and a DRAFT charter only
  (`../../planning/forge-s178-m05-echarts-render-grading-feasibility.md` and
  `../../planning/forge-s179-echarts-render-grading-draft-charter.md`). Grounding, critique, lock,
  real CI, text-timing closure, and resource gates precede any implementation mission.

“Uncertified” does not erase that existing reconstruction verdict, and the ECharts planning park
must not be narrated as missing all certification behavior.

## Near-horizon Forge sequence

No Shopify D1–D6 item is a Forge mission. The near horizon uses three Forge-side gates:

### Gate A — serve discovery from shipped facts

Provide the Shopify sibling with a dated packet that names the current tool registry, exact
`viz.render → artifact.certify` path, dashboard/measure/narrative capabilities, brand A/B posture,
and known parks. Include source paths or a reproducible MCP transcript. Do not promise a hosted
endpoint, a Workbench surface, or consumer-specific production wiring.

**Exit:** the packet is sent by `cmos_message`, and every capability claim resolves to a current
source or live tool response.

**Evidence (2026-08-25):** info-push `9fdb345e-115c-4cd7-b9d3-2da8ba674537` was sent to
`cmos://derek/shopify-forge` with the current registry, visualization/certification, dashboard,
brand, mobile, and boundary facts above.

### Gate B — classify what discovery found

For each reported need, record exactly one disposition:

- already supported — point to the existing MCP path;
- consumer-owned — keep it in Shopify-Forge;
- Forge gap — cite the missing behavior and the smallest honest mover class; or
- not approved / no evidence — park it with a trigger.

**Exit:** a dated decision says whether Forge has a build to charter. “No Forge gap found” is a
valid outcome.

### Gate C — charter only an approved Forge gap

If Gate B identifies an approved Forge-owned gap, ground and critique a separate decision memo,
enumerate advertised and visual movement, seed Rule-9 carriers, and only then create missions. If it
does not, Forge creates no build merely to keep the arc busy.

**Exit:** either a locked Forge memo exists or the no-build disposition is explicit. The Shopify
sibling's execution sequence remains outside this file in both cases.

### Adoption arc — current gates and next rung

| Gate or rung | Current disposition |
| ------------ | ------------------- |
| Gate 1 — pinned private runtime | Chartered in the locked s181 memo: Forge builds a self-contained private bundle, pins it by commit and sha256, and hands it to named consumers to run themselves. Nothing is hosted or publicly published. |
| Gate 2 — public distribution | Deferred and explicitly Derek's: license choice, public npm/registry publishing, `.mcpb`, and OCI remain unapproved; npm is not assumed to be the adoption UX. |
| Schema-ingest walker + `schema.ingest` | Deferred together to s182; the grounded walker charter and advertised-tool rung remain in the s181 memo rather than entering s181 implementation. |

## Named parks that do not silently enter this horizon

| Park                                      | Trigger                                                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ECharts render-grading implementation     | The DRAFT s179 charter is independently grounded, critiqued, locked, and its true-CI/text/resource gates are accepted. |
| `src/viz` diverged-twin retirement rung 2 | A sprint declares VRT movement on the four parked React adapters, or a viz-craft goal makes the mover intentional.     |
| Mobile crawl 4–7 and native walk          | A named mobile-web/native use case is in view and the API commitment is approved.                                      |
| Parts Town token/delivery work            | The held client arc resumes with the required answers and a fresh Stage1 extraction.                                   |
| Narrated-correlation remediation          | A real agent consumer is demonstrably misled; resume from the recorded survivor fixtures, not a new hunt.              |

The open-arcs ledger owns the full park inventory and exact source trail:
[`forge-open-arcs-ledger-2026-08.md`](../../planning/forge-open-arcs-ledger-2026-08.md).

## Historical disposition

The s96–s107 mission shapes no longer occupy the active near-horizon file. They were not deleted
from history or rewritten to fit the Shopify direction:

- git retains the pre-rewrite 723-line file;
- CMOS retains their missions, decisions, and planning sessions;
- `cmos/reports/s96-*` through `cmos/reports/s105-*` retain the closeout reports that were written;
  git and CMOS retain the s106–s107 record; and
- the three 2026-05 foundational vision documents remain point-in-time context, each explicitly
  disclaimed from current sequencing.

That is decision #679's point-in-time convention applied without forcing historical sprint logs to
masquerade as a live roadmap.

## Success state for this horizon

This horizon is successful when:

1. Shopify-Forge can discover and exercise Forge's current agent-facing MCP capabilities from a
   dated, source-backed packet;
2. discovery produces an explicit already-supported, consumer-owned, Forge-gap, or parked
   disposition for each need;
3. no hosted-service, Workbench, external-pull, free-text parsing, or dimension-registry assumption
   enters a Forge mission implicitly;
4. any future Forge build begins from a separately approved and locked mover declaration; and
5. the current roadmap stays short because completed sprint history remains in git, CMOS, and
   closeout reports rather than accumulating here again.

Progress is measured by dependency clearance and evidence quality, not a calendar promise.
