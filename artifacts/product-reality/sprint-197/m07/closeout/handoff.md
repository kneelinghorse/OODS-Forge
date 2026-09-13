# Sprint 197 review handoff

`builderSelfCertified: false` · Sprint remains Active · Independent review and certification required.

The requested #2008 readiness correction is implemented and its exact facts hash is `ba27bb2e7d5c9a6b9278b916d69ac593608bfe971a769a927d3af39cf2218c1d`. The decision packet remains byte-identical (`e7279d225d7e9fee64d14c6695f7b32e83f04107a19ce7e656e457c8802957c3`). The before hash is `8fbfcb74551f8370ed52d4b10ddc55526cceba48a8ab0074f3e67192c6819f67`. Only `/root/manifestSha256`, `/inputs/33/bytes`, `/inputs/33/sha256`, and `/inputsSha256` changed; the generator and readiness test stayed unchanged. No third full local capture ran.

**Review is blocked by the retained accessibility findings.** Completing the builder's closeout is not a green CI claim, sprint certification, or delivery authorization. The parser, built-versus-legacy token input mismatch, three contrast failures, and six stale state limits require review and a bounded correction before merge or delivery. The palette and these validators remain frozen under #2008.

| Identity | Commit |
| --- | --- |
| Locked build base | `bc12723e9b7a42a4790a98f5d2a0dc4a1f970b99` |
| Palette/runtime measurement | `a71ea114e344f3559e0780697f5a0817fe6f981e` |
| First full capture | `c5246c3f721ea49761e4a5c5eecbbd4df0b10279` |
| Corrective full capture / execution head | `02d811f71a4f188142783edf0f9ea189590876c1` |
| Fixed source / #2008 scoped verification | `542f9ee6bfceb96e61c5b2b44c241c9375a8596f` |
| Frozen review-input head | `67feb783b7cc188df33a942d3608050d19fe5b06` |

The fixed-source CI merge commit is `a998b94b2ddfc5a9562044a5253dddff232825e2`; its tree `3956bb290509122d7b56567f592d493db230b03c` is identical to the fixed source. Later commits contain only closeout evidence updates. Pushing the final evidence commit may start another CI run; any such run is separate from the completed fixed-source run and is not represented as completed here. PR [107](https://github.com/kneelinghorse/OODS-Forge/pull/107) remains draft against `OODS-pro`.

The generator produces coherent primary/accent/status/neutral ramps, a separate dark palette, mechanically derived Brand B, dark chart sequences, and an explicit HC paint scope while retaining semantic names. Role-A minima are 16.540957 light and 20.105820 dark; all 24 chart Role-C cases and the 52-cell matrix pass. These scoped chart/brand results do not establish universal contrast compliance in the unbranded built token tree.

The palette proof retains 240 runtime cells, 1,308 component theme cells, 114 accessibility tests per framework (109 shared scenarios), 78 chart scopes and 84 pattern cells, 77 unchanged normalized compositions, and 180 screenshots / 90 comparison pairs. All 281 measured product-source hashes still match the palette measurement head. The final advertised source diff has 122 public paths and 5,281 changed JSON fields, with zero unattributed paths. The four-field readiness artifact change is separately bound by #2008.

## Capture and scoped validation

Both raw full captures remain byte-for-byte, with failed status and actual heads. The first retains 15 root-core assertion failures corrected before the second. The second remains:

| Suite | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| viz-core | 1,511 | 0 | 0 |
| viz-render | 69 | 0 | 0 |
| mcp-server | 6,884 | 1 | 16 |
| root-core | 7,222 | 1 | 16 |
| component-packages | 1,436 | 0 | 0 |

Both second-capture failures are the same generated-readiness assertion. Accounting classifies them `introduced-generated-provenance-drift`, binds decision #2008, before/after facts hashes, and the fixed source, and preserves the failed executions. Its passing status means valid accounting, not blanket suite greenness. The 32 skipped executions are 16 unique optional Stage 1 fixture tests counted in both MCP and root-core.

At the fixed source, MCP and root-core each passed 114 scoped tests with no failures or skips: 22 readiness tests, 35 closeout.s196 tests, and 57 closeout.s197 tests. `docs:check` passed. The final producer generation, `--check`, and independent actual-output audit all passed. The independent auditor checked 32 literal criteria, 9 execution records, and 1872 frozen paths. Receipts live beside this handoff and under `exception-2008/`.

## CI and required review actions

[Fixed-source CI 34766250034](https://github.com/kneelinghorse/OODS-Forge/actions/runs/34766250034) completed with **15 successful jobs, 5 failed jobs, and 1 skipped job**. The runtime sweep, full MCP/viz job, build, typecheck, lint, component packages, token validation, portable runtimes, consumers and release runtime passed. The full MCP suite recorded 6,917 passed and 16 skipped. The five failed jobs are coverage, a11y-contract, guardrails-check, and tokens-governance for A and B. Their per-run causes and diagnostics remain in `../ci/verification.json` and `../ci/fixed-run-disposition.json`. The optional echarts-render-soak job was skipped.

The fixed-source a11y-contract job passed both 654-cell framework proofs, 29 HC browser tests, 264 computed-style assertions and nine focus identities, then stopped because its parser expected `base_token` on a new typed palette row. A scratch-only parser proposal passes nine parser tests; running the full diagnostic diff against a fresh Storybook build then exposes three contrast failures: accent text 3.59:1 (required 4.5), accent icon 2.31:1 (required 3), and primary on-interactive 4.48:1 (required 4.5), plus six stale relative-state rules. Ratios are rounded as reported. The separate token guardrail CLI reads its six relative-color rows from legacy `tokens/`, whereas the accessibility CLI reads the built token tree. The palette checks use canonical package sources. This input disagreement must be resolved explicitly; no thresholds or baselines were weakened here.

Root coverage recorded 7,301 passes, one 20-second timeout, and 16 skips. A single local isolated retry with unchanged source and the same 20-second budget passed all seven tests; the timed-out assertion took 9.37 seconds locally. The different-host diagnostic does not replace the failed CI execution. The governance acknowledgement label is attached and both brand governance commands pass locally with it; any original missing-label CI failures remain retained.

Read `ci-findings/README.md`, `ci-findings/findings.json`, `ci/verification.json`, and the raw logs before certification. Per #2008, the independent reviewer must re-derive the readiness reader census outside retained artifacts and rerun the 22 readiness tests itself. The three closeout tools independently bind the approved metadata scope, capture bytes and hashes; their passing audit does not accept the separate accessibility defects.

## Boundaries and carried limitations

The 17-file historical saved cohort is unchanged. The live primary store already held 37 files and 20 additional TraceLab schemas before this build; the original sixteen schema/index entries and the complete 37-file pre-build cohort are preserved.

The TraceLab re-pin was prepared and tested in a throwaway copy. Its m06 receipt remains tied to `97fd25c359dc4a164b0a9ea3f9da21e0bb0bf70d`; TraceLab later advanced independently to `b43c0605594c4246f1161196ffc5751f19b7d7d9` with other working changes. The two pre-existing dirty report hashes accepted for m06 remain unchanged. The original receipt is not a claim that the newer consumer checkout is unchanged. No consumer checkout was edited.

Nine HC chart types retain typed-deferred pixel proof for Sprint 199; this sprint establishes the paint-role census. Existing chart accuracy/pattern gaps remain explicit. The optional type/spacing/radius/elevation/focus pass was deferred under the memo's first descope rung. Independent visual judgment is pending.

No reconnect was prepared, no consumer message was sent, and the primary checkout, PM2, and live runtime were not updated. Delivery belongs to the reviewing session after certification. Sprint 198 planning should add the readiness generator `--check` to pre-freeze verification, per #2008; this sprint does not change that workflow.

Reproduce the frozen closeout with the producer and auditor using execution head `02d811f71a4f188142783edf0f9ea189590876c1`, review head `67feb783b7cc188df33a942d3608050d19fe5b06`, and manifest `artifacts/product-reality/sprint-197/m07/closeout/manifest.json`. Keep the actual capture head distinct from fixed source and review-input identities.
