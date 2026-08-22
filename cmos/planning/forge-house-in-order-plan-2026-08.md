# Forge house-in-order plan — three corrective sprints (2026-08-22)

**Direction (Derek, 2026-08-22):** Parts Town is on hold; close the almost-closed arcs before they go stale; proceed regardless of effort. Source inventory: `forge-open-arcs-ledger-2026-08.md` (31 carries + the parks whose triggers are "a hygiene rider" rather than a consumer or PT).

**Estimate: 3 sprints** for the house-in-order carries (s175–s177), closing 8 arcs. The two direction arcs that follow — *communicate Forge / agent-native onboarding* (1–2 sprints) and the *enterprise-scale test* (its own arc, scoped with Meridian) — are additional and not part of this estimate. Sprint throughput basis: s172 = 7 missions, s173 = 5, s174 = 5; sizes are the ledger's.

## Sprint 175 — Correctives: the s174 review carries + the Dashboard-demos riders
Closes: **Governance gates**, **Certify breadth and a11y-equivalence**; Dashboard-demos to steady state.
| Mission | Items | Size |
|---|---|---|
| m01 Governance gate C1 + C2 | all three governance scripts stop deleting `packages/tokens/dist/tailwind/tokens.json` (enforce.mjs, triage.mjs, state-assessment.mjs); the "root build:tokens pipes" clause of #1227 does NOT reproduce (grounding 2026-08-22: package.json:71 is a plain node invocation at HEAD and in all history) and is closed with a dated note; closeout gains a gitignored-build-input row; s174 memo §8.1 corrects the 83/48 counterfactual with base/head SHAs; docs/tokens/governance.md:14 (`--base main`) and :21 truth-up ride here | S+S |
| m02 Governance controls C3 | state-assessment.mjs module refactor so its four new red paths get unit controls | M |
| m03 Certify C5 + C4 + C7 | expose (or stop advertising) not-applicable results with their absent precondition; the "cartesian-only" prose and three test titles; the dated correction to #1476 / equivalence-rules.ts:22-23 | M+S+S |
| m04 Certify hardening (#781) | graded-'unchecked' (engine fault on a colour-bearing unit) pulls conformant false; nothing-to-grade stays non-pulling (s139 lock); spans contrast + accuracy | M |
| m05 Dashboard-demos riders | computeKpi `count` over a non-numeric field fails loud (or counts rows) instead of silently 0; the "11-value authoritative enum" prose corrected across schema/types/d.ts; answer sent from their file | S+S |
| m06 Closeout | literal-invocation gate table, ledger update, decisions per mission, successCriteria carried on the closeout mission itself | S |

## Sprint 176 — Hygiene: CI, repo, closeout process, docs drift
Closes: **CI, repo and closeout hygiene**, **CMOS hygiene**, **Forge-Demos feedback**; PT brief corrected while parked.
| Mission | Items | Size |
|---|---|---|
| m01 Closeout process in the repo | the 17 standing rules plus the s175-recorded candidates (base-ref rule, rule C, worktree-base reaffirm, reconnect step, build-input row) written with ONE numbering — s175 records them unnumbered; completes next-step #1224 (rule C) when the list lands; closeout template: literal invocations, decisionCount ≥1, bridge status + /health at open, Aquex reconnect step after any schema change, vr-test named structurally non-local, worktree-base check, quality-bars criteria on the closeout mission's successCriteria | M |
| m02 Gate hygiene | C9 generator template emits `any` (verify against tracked d.ts); verify:brand-cascade + test:scale back in the sweep; p99 flake (sequential rule or fix); root `build` clean step safe for dist/pkg; five orphans | M |
| m03 Prose / doc sweep | sprint-numbered promises (transport.ts ×3, sod-policy-guide, configuration-guide addon-vitest, title-reorg attribution ×6, form.accessibility alias; governance.md `--base main` moved to s175 m01); docs/theming.md presets; viz-token-guide shim path; PT brief Ask 2 + §5; BUILD_STALE dead workaround in quality-bars:58 + learnings; Fork-R count-label cosmetic | M |
| m04 Agent-facing docs from the registry | agents.md, README (27 tools / five pillars → 19+6 / four), docs/mcp/Tool-Specs (22/9 → 19/6), Agent Recipes render→certify recipe; how-forge-works.html as the base | M |
| m05 Admin mission (exact commands) | REQUIRED branch-protection check for the viz-core re-export gate; untrack the two .oods/schemas files; delete/repoint the dead `main` branch and any remaining main-defaulting caller; restate the #678 park; roadmap/near.md rewrite | M |
| m06 Forge-Demos fixture hygiene | 14/42 mark-bearing fixtures invalid as whole Vega-Lite specs; 5 NVS-invalid labelled as certify fail-safe exercisers; trait-schema vocabulary | M |
| m07 Closeout | | S |

## Sprint 177 — Brand, Storybook, the viz twin
Closes: **Brand pipeline** (non-PT), **Storybook/VRT** semantic debt, **Viz flagship follow-ons** (twin).
| Mission | Items | Size |
|---|---|---|
| m01 Focus tokens → delete brand.css | three unbridged focus slots get real brand tokens; bridge; retire brand.css | M |
| m02 Brand design work | brand-A distinct status identity; status-on-panel grading (7 icon tokens); compressed interaction ramps; light-cell focus branding | M–L |
| m03 build:stories semantic errors | the 91 semantic (incl. explorer TimelinePage drift) + 47 mechanical; ratchet moves down | M |
| m04 viz twin | src/viz ~137-site rewire onto @oods/viz-core + shim deletion | L |
| m05 Closeout | | S |

## Stays parked (trigger-gated, not house-cleaning)
PT arc (all), Stage1 re-extract, Meridian D1 strain, mobile crawl 4–7 / native walk, narrated correlation, certify enforce-flip + accuracy-beyond-slice, map/annotation/interaction deferrals, layers.css theme layer, governance risk-model tuning, forced-colors zero-holder, ChartPanel 11→13, the OODS-knowledge MCP surface (communicate-Forge arc).
