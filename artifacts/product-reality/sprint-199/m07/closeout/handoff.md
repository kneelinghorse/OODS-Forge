# Sprint 199 — built, review pending

Builder self-certified: **false**. Independent review and delivery remain separate.

Implementation head: `65d1f0a70de517d9e581e7c9b90ba5d08c0035c4`. Corrective execution head: `d28add31bc7726a153c7e6062ff408acdb41aa3b`; its only change after implementation is the final golden verification record. Post-capture test-only head: `c28e50e3bf3b16e9a043bb2a8a0ab2b95708dba6`; its only changes after implementation are the recovered test contract and golden accounting. Initial execution head: `49005987e329d54933fa16f744ef52989cbffed8`. Working branch: `codex/sprint-199-charts`. The requested comparison base is `b7a96ab0f`; PR base `OODS-pro` advanced to `6ec3c73e079584a02b2fc17bcd4a21651bf0714e` only by merging this branch's planning commit in PR #110. No additional implementation was reconciled or delivered.

## Review these receipts

- [m01 carry retakes](../../m01/index.html): 36 screenshots covering address replacement, Evidence filtering and Mission identity; [56 scoped runtime cells](../../m01/runtime/runtime-cells.v1.json).
- [m02 decisions and probes](../../m02/README.md): removed timezone metadata, exact timezone equality, documented spec-only Cartesian limit, and bounded soak measurements.
- [m03 public pattern gallery](../../m03/index.html): 22 public patterns, one retired; all 88 public light/dark scope operands conformant. [Profile and retirement details](../../m03/README.md).
- [m04 real-engine accuracy proof](../../m04/README.md): area-scaled bubbles, drawn-size mutation checks, actual ECharts filter/stack behavior and per-renderer fidelity. Its intentionally failed pre-migration gate closes through m05 under #2052.
- [m05 forced-colors gallery](../../m05/browser-approved/index.html): 26 chart cells plus two dashboards, 28 browser cases; all 13 types have HC pixels. [m05 evidence and qualifications](../../m05/README.md).
- [m06 graph placement](../../m06/README.md): exact public SVG assets in both frameworks, directed edge transformation and explicit synthetic data. The final shared-style correction is in [m07 graph retakes](../graph-correction/index.html): 24 screenshots, 12 graph scope checks, fresh packed apps and [14 runtime cells](../graph-correction/runtime-final/runtime-cells.v1.json).
- [Final censuses](censuses.json), [runtime hash attribution](../runtime-diff.json), [340-path source diff attribution](advertised-diff.json), [full source patch](advertised.patch), [corrective failure attribution](../corrective/failure-attribution.json), [final preflight](../pre-freeze-corrective/report.json), and [golden ledger](../../golden-ledger.json), and [final preservation checks](../post-capture/frozen-inputs.json).

## Verified scope

13 chart types, 78 rendered/conformant declared census operands, including 26 HC scopes; 23 pattern rows (22 public and one retired with its reason), 88 conformant public pattern scopes; Core Analytics Profile 17 complete, zero typed gaps, three retired with reasons. Placement is 10 declarations across four types, counting detail and workflow separately (#2054).

110 current components and 1,320 framework/theme cells; 494 measured tests per framework for the corrected graph proof. Every original 109 capability row is unchanged. The new graph row references its own current evidence. Tool ledger: 24 rows, 19 automatic and five on-demand.

Canonical runtime roster: 18 objects/240 cells. Retained composition comparison: 11 objects/77 schemas/154 cells. The fresh scoped sweeps cover Organization, User, Evidence, Mission and Relationship, 70 cells. Re-generating all 240 artifact hashes from the actual b7 baseline yields 190 unchanged, 36 changes reproduced by m01's three producer files and 14 by m06; no unattributed differences. All 70 scoped hashes still match; the graph's 14 hashes also match its final shared-style retakes. This does not claim a new full 240-cell runtime sweep or merge historical rows into a new ledger.

The advertised source comparison covers all 340 changed paths, including 12 canonical tool-contract paths, with every modifying commit attributed by mission. Tests, generators, structured exports, planning source and chart examples are included; only this sprint's retained receipts and planning DB backups are excluded from that source inventory.

All 311 moved golden pins are attributed once across 54 planned files; none moved twice. The original eight public pattern sources and 32 SVG hashes remain equal to b7a96ab0f. Sealed Sprint 195–198 receipts are unchanged. Only the requested two top lines of near.md changed during build: the Sprint 199 row and header; its retained record is byte-identical.

## Test accounting

The corrective full capture is **failed**, with **17,583 passed assertions, zero failed assertions, 36 skipped assertions and two failed test files**. One root file failed collection, so its tests are absent from these capture totals. This is not a green full-suite result.

| Suite | Status | Passed | Skipped | Failed test files |
|---|---|---:|---:|---:|
| viz-core | passed | 1,542 | 0 | 0 |
| viz-render | passed | 72 | 0 | 0 |
| mcp-server | failed | 7,106 | 20 | 1 |
| root-core | failed | 7,393 | 16 | 1 |
| component-packages | passed | 1,470 | 0 | 0 |

The serial capture took 1575.762 seconds including setup. All 14 worktree checkpoints were clean. [Raw capture](../five-suite-corrective/four-suite-baseline.json), [exact accounting](../post-capture/suite-accounting.json), and [failure dispositions plus initial accounting addendum](../post-capture/disposition.json).

The 32 expected skips are the same 16 optional Stage1 cases counted in MCP and root. Four extra MCP assertions were unexecuted because the Vue consumer install lacked `@rollup/rollup-darwin-arm64`. The exact unchanged consumer test then passed **4/4** in one isolated diagnostic at `d28add31b` (#2057); [receipt](../post-capture/consumer-supplement/result.json). The raw failure and extra skips are retained.

The root collection failure came from the old Vega-Lite mark-option oracle encountering MarkGraph. The test-only reconciliation explicitly verifies Graph’s closed edge-array placement scope, restores the 44-source corpus, and preserves exact raw whole-spec exceptions. The entire recovered file passed **76/76**, zero skips, from clean head `c28e50e3b` (#2058/#2059); [receipt](../post-capture/mark-options-receipt.json). Runtime code is unchanged. These supplemental results do not replace either failed full capture or get added to its totals.

The first capture remains failed, with 17,560 passes, 27 failed executions across 17 distinct tests and 32 skipped executions, plus the now-explicit zero-test root collection failure. The first assertion-only attribution omitted that collection failure; the additive disposition above corrects the accounting. All cleanliness checkpoints passed. The failure attribution records implementation gaps (graph style/ordering and bridge certification prose), plus stale current-census, area/facet and historical-epoch assertions. All were corrected and verified before the second freeze. The corrective capture exposed the collection error alongside a separate consumer installation failure; their dispositions and supplements are recorded above. No third capture was run. The legacy filename `four-suite-baseline.json` is emitted by the established capture owner; the actual record contains all five suites.

Final preflight passed readiness, registry, roadmap/prose contracts and all 11 viz:gate steps, with 2,664 chart-gate tests and zero skips in 132,844 ms. Failed intermediate logs remain labeled as failures. These focused counts overlap the full suites and are not added to them.

## Carries and limits

- Independent visual/usability review is pending. Organization/User address-save defects are fixed and retaken; neither app is self-certified usable here.
- The ungrouped synthetic Relationship graph is contrast-ungradeable in light/dark due to missing categorical metadata (#2055); accuracy, accessibility equivalence and determinism pass. HC contrast is exempt. No group was invented. The small static graph has crowded labels and duplicate surrounding titles; no interactive graph exploration is claimed.
- Cartesian ECharts line/bar/area SSR stays spec-only and uncertified. Pattern HC is outside this sprint. Static selections disclose OODS-V175; linked-brush-scatter is explicitly retired with OODS-V174. Candlestick, box and contour remain explicit profile retirements. The seven unplaced ECharts families retain specific missing-operand reasons.
- Raw `toVegaLiteSpec` whole-spec validity remains qualified: 28 of 44 source fixtures validate directly; 16 have exact executable annotations. Histogram and waterfall inherit the secondary-channel `type` defect on x2/y2 (#2059). Their measured public render/conformance receipts remain unchanged; no whole-spec-validity claim is made.
- Soak diagnostics do not establish retention certification. Hard resource limits remain; only the one-sided statistical lower bound was retired (#2050).
- The historical Python exporter suite has three baseline failures (old snapshot, ETag and s193 runtime population). Its current historical 109-row fixture stops before running against the new graph intake. The three current graph exporter/evidence tests pass. Legacy fixture maintenance and runtime-export population reconciliation remain a carry; no guard or historical hash was weakened.
- Existing application craft carries remain: field-name chips, internal form fields, saves not updating history, duplicate Role fields, doubled empty states, narrow paginator split, lowercase filter options, and Subscription's payment-chart/tab/billing-cycle issues. The chrome/packaging pass, design.preview work, TraceLab palette re-pin, classification approval and the design-surface phase remain separate.

## Integration

Build branch `codex/sprint-199-charts`; requested base `OODS-pro`. Publication metadata will be added after the evidence commit is pushed.

All seven hosted workflows were confirmed `disabled_manually` (the repository-level Actions permission remains enabled, while every workflow stays disabled); no workflow was enabled, invoked or awaited. No primary-checkout edit/build, PM2 restart, merge, deployment, reconnect or consumer message was performed. The reviewing session owns acceptance, any primary fast-forward, rebuild, bridge restart and health verification. The Sprint 198 closeout-evidence branch and other repositories were untouched. The task's browser container was cleaned up after proof completion; the Sprint 199 worktree is retained.
