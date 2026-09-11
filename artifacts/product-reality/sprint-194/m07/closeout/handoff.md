# Sprint 194 review handoff — BUILT, REVIEW PENDING

All seven build missions are implemented. Sprint 194 stays Active; `builderSelfCertified:false` and `separateReviewRequired:true`. This packet requests independent review. It does not authorize candidate delivery, merging, certification, or sending the three prepared Sprint 195 notices.

## Frozen identities

| Identity | Commit |
| --- | --- |
| Delivered primary / sprint comparison base | `1f69c957f4435a0a2f18b168b684de050f7a5f22` |
| Public implementation and fresh runtime population | `71538162e839aec60dda6267a83f506906c1792e` |
| Final five-suite execution | `ceecd21fd51626ef7f20c25c6ac6753fee7f7238` |
| Frozen review inputs | `c9640348b90f0d66e8f68185f5e67af231465a2e` |

The public-path comparison from implementation to execution is empty. The later execution commit corrects two warning-family assertions and retains evidence. All changes from execution to review inputs are added capture, CI, or closeout evidence. Generated closeout outputs are committed afterward and name the frozen heads rather than borrowing the final artifact commit as an execution identity.

[PR #100](https://github.com/kneelinghorse/OODS-Forge/pull/100) targets `OODS-pro` from `codex/sprint-194-tools-truthful`. See [CI observations](../ci/observed.json) for exact run IDs, job IDs, source heads, and outcomes. CI evidence is attributed per run under CMOS decision 1933; no earlier execution is relabeled as the latest commit.

## What changed

Brand intake produces an accepted delta with an envelope hash; apply writes canonical source in the configured token root and captures the actual build exit, stdout and stderr. Native proof records changed chart, app-shell and component pixels. Token output respects the requested built brand/theme scope. Fidelity preview resolves built token colors.

The mapping tool is explicitly an external resolver; composition does not consume its output. Registry draft vocabulary round-trips without a consumption claim. Schema persistence exposes versions and schema references. `viz.compose`, `review`, and `release.verify` are retired under recorded decisions; both policy layers, registration, SDK and current API documentation agree on the resulting roster. The five remaining on-demand tools have real dry-run contracts.

Health reports built scopes and the actual tool/runtime summaries. Dashboard measure resolution defaults on; unknown measures retain V130, missing fields V137. ECharts-primary output omits the empty Vega spec. REPL fragments expose ignored options. Release evidence is hash-bound, not re-executed. Preview unavailability is explicit. The 212-property input audit has zero unresolved read sites.

## Proof and its limits

- Tool ledger: 24 entries, with all 19 advertised entries at product-reality tier and five on-demand entries at contract tier; zero unit-only or unproven entries. Each advertised entry has a portable call and only documented-limit caveats. This source proof tier is not a successful portable-execution verdict.
- Extracted bundle: 28 calls across all 19 advertised tools using 19 content-hashed recipes. Fourteen outcomes pass. The five documented limits are brand source omission (`brand.apply`), missing stripped token build inputs (`tokens.build` apply), message-only adapter forwarding of preview N019 (`design.preview`), and missing React/Vue readiness source inputs yielding N015 without code (`code.generate`, `pipeline`). Bundle state is restored byte-for-byte. No successful portable brand write or React/Vue generation is claimed.
- Fresh runtime: 154/154 cells pass, zero gaps or failures, from one tarball sweep and one implementation head. The pinned Linux Playwright browser covers 132 single screens and 22 workflows. The deliberate emitter regression fails and the restored source passes.
- Composition: 77/77 schemas and 154/154 generation cells, with zero normalized schema movement. No saved or composed schema was hand-edited. Original store reachability remains 15/16, successor 16/16, with all 17 primary store files unchanged. Visualization registry remains 13/13.
- Components: 109 React, Vue, HTML, accessibility and theme rows retain their original measured proof because component implementation, styles, canonical token source and the served component export are unchanged. Interaction proof is 40 applicable / 69 not applicable. The packet date is Sprint 194; the served component export date remains Sprint 193.
- Advertised diff: 108 public paths, including 55 canonical advertised paths, all attributed to their mission commits. No golden files were rebaked. Historical temporal SVG identities are compared under their captured America/Chicago timezone; the retained UTC control is not a determinism pass.
- Five suites: 15,589 passed assertions, zero failures, and 32 historical skipped assertions (16 MCP + 16 root): viz-core 1,397; viz-render 69; MCP 6,256; root 6,441; component packages 1,426. [Suite accounting](suite-accounting.json) independently derives counts, skipped identities and changes against Sprint 193 from raw reports. The first capture is retained with its two warning-registry assertion failures; the corrective capture exhausts the two-attempt allowance under decisions 1833 and 1932.
- CI: Seven required job successes are recorded: coverage, consumers, components, accessibility, portable and visualization at correction head ceecd21f (run 34630306346), plus the completed 154/154 runtime job at implementation head 71538162 (run 34625999301). The correction-head runtime repetition remains in progress at the frozen observation; it is not relabeled as passed. The optional ECharts resource-plateau soak failure is retained and remains unresolved; it is not described as flaky or as a passing gate.

The pre-freeze targeted checks passed 1,038 assertions with zero skips; the subsequent warning-registry correction passed 64 assertions with zero skips. Those passes are separate from the complete five-suite totals. Raw failed diagnostic runs remain in the packet.

## Review entry points

Start with [claim ledger](claim-ledger.json), [generated handoff](review-handoff.json), [suite accounting](suite-accounting.json), and [independent actual-output audit](independent-audit/audit.json). All 41 literal criteria are retained; ten are explicitly qualified by CMOS decisions rather than silently rewritten. These mechanical verifiers do not substitute for independent product review or craft approval.

The planning sources are [locked build handoff](../../../../../cmos/planning/forge-s194-build-handoff.md), [decision memo](../../../../../cmos/planning/forge-s194-tools-truthful-decision-memo.md), and [remaining-work phase map](../../../../../cmos/planning/forge-remaining-work-phase-map-2026-09.md). `near.md` records Increment 13 as BUILT, REVIEW PENDING. The next planned increments remain visualization breadth in Sprint 195 and release proof in Sprint 196.

The canonical primary bridge remains on reviewed `1f69c957`; candidate delivery belongs to the next approved delivery step. [Reconnect plan](../reconnect-plan.json) contains exactly three unsent notices for cmos-dashboard, forge-demos and aquex-mcp, with retirements, narrowed descriptions, ledger changes and portable limitations included.
