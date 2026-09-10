# Sprint 192 m07 — final proof and independent-review handoff

Build status: **m07 BLOCKED ON DERIVATION-FREEZE APPROVAL; REVIEW PENDING**. Sprint 192 remains Active. The builder does not certify the sprint; `builderSelfCertified:false` and `separateReviewRequired:true`. Classification approval remains pending and `approvedRuntimeCensus` remains null. This packet prepares the Sprint 193 reconnect; it sends no messages.

## Frozen heads and retained corrections

- Original implementation: `eda5fd2f4313624027edad2e7df34c393e6fdd72`; original execution: `8d9cd90692b9aa4d9e1c9ef5e25c7ab8b0ad1f6b`. Their proof bytes remain in Git at the original execution commit.
- Corrected implementation: `c2f9c338ad9e33a961441482a3cf3b4f78895e21`. The portable runtime's exact structured-data boundary is 29 after the two new dated exports; it previously asserted 27. The clean local final assembly and hosted portable-runtime job passed after that correction.
- Corrective five-suite execution: `fb56910b2364982a4913a5229798ba06f324370d`. All component, schema, workflow, token and visualization proof was rerun at the corrected implementation. `corrected-public-equality.json` records the unchanged public bytes through the test/receipt correction commit; final producer and auditor recheck the full execution range.
- PR #95 merged at `1985346c`; merging it into this branch changed no tree bytes because its five planning/review files were already present. See `reconciliation.json`.
- Original full capture: `five-suite-closeout-attempt-1/`. Its five-suite counts were 1397/0/0, 69/0/0, 6132/2/16, 6319/3/16 and 1099/0/0 (passed/failed/skipped, in suite order). Nothing is replaced by isolated greens.
- Capture assertion corrections retain the exact SortIndicator structured callback in the finite binding vocabulary and update the nucleus invariant to the current derived membership expression. The original Sprint 185 inventory remains unchanged. The focused three-file run passed all 25 tests.
- The initial object-registry performance assertion and Vue compiler timeout passed individual diagnostic reruns with their existing limits. Those filtered diagnostics selected one test each and reported 2 and 11 unselected tests. They do not substitute for the full corrective capture. Root-core's project set and timing thresholds are unchanged.

The token governance label `token-change:breaking` acknowledges the protected semantic-role and focus-token changes. Initial missing-label failures are retained; code-owner review is still required. Earlier CI runs were superseded by later pushes, and their cancelled jobs are not reported as green.

## Measured product state

| Surface | Observed result |
| --- | --- |
| React / Vue implementations | 75/109 each; 34 unavailable with reasons |
| HTML renderer map | 109/109 mapped |
| Accessibility | 75 governed roots pass axe per framework |
| Interaction | 24 verified; 51 explicitly static/not-applicable per framework |
| Theme | 75 × 6 scopes × 2 frameworks = 900 root cells; 12 screenshots; zero failed or skipped cells |
| Component CSS colour resolution | Zero unresolved colour roles and zero reachable system-colour fallbacks in all six scopes |
| Fresh composition / generation | 77/77 schemas and 154/154 generation cells; zero OODS-V007 |
| Schema movement from Sprint 191 | 10 declared timeline recipes and 4 display-header event removals; 63 unchanged schemas |
| Saved stores | Original 15/16, successor 16/16; 17 live-store hashes unchanged |
| Packed workflow proof | Subscription, Organization and User × React/Vue: six cells, 48 passed gates, 84 screenshots |
| Visualization | Registry 13 public / 11 dashboard-drawn, unchanged; all 52 SVG hashes and four dashboard hashes equal Sprint 191 |
| Advertised change set | Three canonical paths and 56 public paths from `5fdf8a18`; checked against the original declaration |

The packed workflow proof uses the pinned Linux Playwright browser and unchanged Home → ArrowDown native-select interaction. Generation of 154 cells is not a claim that all 154 have runtime proof. The m04 criterion's “864 per framework” was an arithmetic typo: 72 × 6 is 432 per framework / 864 combined; the final 75-root population is 450 per framework / 900 combined.

The #1884 baseline and all red base logs are retained in m02: 191 referenced / 45 token-defined / 57 local / 89 unresolved, seven missing sys names and six unguarded names. The actual resolver measured 61 distinct reachable system-colour fallback names per scope at the base. The syntactic estimate 26 is not reused. All six unguarded names are defined after the fix; cmp tokens are authored as semantic aliases. BEFORE/AFTER design-loop receipts and the deletion bite remain in m02.

## Review boundaries

Thirty-three modified test/fixture expectation files are attributed in `golden-attribution.json`. The unchanged state-contract test derives its cases from the sorted nucleus, so the three added components also shift index-selected state names; the explicit source attribution is in `closeout/attributions.json`.

Eight ECharts types remain uncertified; high-contrast chart pixels remain deferred. The optional dispatch-only ECharts soak failed on the unchanged `5fdf8a18` control as well as the sprint branch; the original logs remain in m02. The existing PR workflow condition skips that optional soak. No threshold or skip policy was changed to hide it.

The sole corrective capture completed at fb56910b with these actual counts:

| Suite | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| viz-core | 1,397 | 0 | 0 |
| viz-render | 69 | 0 | 0 |
| mcp-server | 6,134 | 0 | 16 |
| root-core | 6,322 | 0 | 16 |
| component-packages | 1,099 | 0 | 0 |

The repeated MCP/root skips are the same 16 distinct Sprint 191 identities. No third capture ran.

The receipt-reader correction and its separate derivation identity are awaiting the explicit freeze exception requested in this build session. Its proposal is closeout/receipt-reader-proposal.json. Thirty-eight focused regression tests and typecheck passed. The proposal covers three closeout derivation files, including the strict boolean census check. The accounting preflight rederived 14 retained suite receipts with zero unattributed deltas or issues, using the proposed uncommitted readers; it is diagnostic, not the final frozen-head handoff. CI coverage/determinism and the final claim ledger/audit remain pending.
