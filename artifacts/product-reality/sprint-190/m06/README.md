# s190-m06 — Final proof and review handoff

Build complete; independent review remains pending. Sprint 190 stays **Active**, `builderSelfCertified:false`, `separateReviewRequired:true`. [Draft PR #92](https://github.com/kneelinghorse/OODS-Forge/pull/92) targets OODS-pro. The primary bridge still serves the reviewed Sprint 189 runtime delivered in m01; Sprint 190 has not been deployed.

## Frozen identities

- Final implementation: `502e9bf7459fa850afd33d9fb6a36e89ae696fa1`.
- Clean corrective test execution: `81fb1a965ab3afd1cf918b45c6ca6aad1639f509`. Only final proof evidence was added after the implementation commit.
- Frozen input/evidence commit: `b5b80d9d01e1f1de1fe05d10f77e6efc08c3fcdb`. It adds capture, CI and binding inputs without changing executable inputs or earlier evidence.
- This README and generated output/audit receipts are subsequent evidence additions. Their containing commit does not relabel any execution.

[Claim ledger](closeout/claim-ledger.json) binds all **37 literal m01–m06 criteria** to retained executions and hashed paths. [Independent actual-output audit](closeout/independent-audit/audit.json) passed: 37 criteria, 13 execution records, 296 frozen paths. This machine audit is builder evidence; a separate reviewer decides sprint closure.

## Final public and consumer proof

- [Viz census](final/proof/viz/viz-census.json) equals the exported 13-row registry. [Scope observations](final/proof/viz/viz-observations.json) retain all 52 public-render/certify identities. Coverage remains 5 certified / 8 uncertified; the latter retain `conformant:null`.
- [Matrix](final/matrix/matrix.json): 52 SVGs rendered twice, exact repeated hashes and scoped canvases, 13 omitted-vs-explicit light/A identities, and four repeated dashboards drawing all 11 admitted types. Chord and flow_map remain excluded from dashboard panels under #881.
- [Component census](final/proof/component-census/report.json): 66/66 schemas, 132/132 default framework cells, Subscription/workflow 2/2. Wider population: 75/77 schemas and 150/154 cells; Organization/User workflow retain OODS-N016. [Per-schema movement](final/proof/schema-movement.json) lists only Subscription/detail plus its assembled workflow, class (h).
- [Saved compatibility](final/proof/saved-compatibility.json): original 15/16 and successor 16/16; source store bytes and all 17 live hashes unchanged.
- [Fresh packed consumers](final/proof/app-consumers/report.json): 16 gates, 18 flows, 32 state observations, 36 screenshots. [Browser receipts](final/proof/browser-receipts.json): 12 light/dark React/Vue views at 390/820/1440, actual graphics-object accessibility, no errors/overflow, zero parity differences. Final light desktop React and dark mobile Vue screenshots were visually inspected. Dark scope applies to chart pixels; the existing shell stays light.
- [Prose](final/proof/prose.json): 63 tests in 13 files passed, no skips. [Preservation](final/proof/preservation.json): all 15 m03 golden file hashes and the flat/CSS hashes remain unchanged.

## One initial and one corrective full capture

[Final four-suite capture](four-suite-closeout/four-suite-baseline.json) and [suite accounting](closeout/suite-accounting.json):

| Executed suite | Passed | Failed | Skipped executions |
| --- | ---: | ---: | ---: |
| viz-core | 1397 | 0 | 0 |
| viz-render | 69 | 0 | 0 |
| mcp-server | 6091 | 0 | 16 |
| root-core | 6265 | 0 | 16 |

The same **16 unique external-fixture skip identities** run in MCP and root: **32 skipped executions**, with exact per-suite identity equality to Sprint 189 verified by the independent auditor. These are per-suite execution counts, not a sum of unique tests. No skipped test is counted as passing. The schema-driven MarkArea.chart assertion is attributed to the root parameter schema addition; the unchanged test file expands from 49 to 50 assertions.

[First capture](four-suite-closeout-attempt-1/four-suite-baseline.json) at `54fc8bdf` remains byte-for-byte intact: MCP had 3 assertion failures; root repeated those 3 and had 3 additional trait-resolution failures. Decision #1858 records the corrective scope. Optional VizAreaPreview was restored to generic selection; the canonical root loader and parameter projection now support bound MarkArea without polluting host fields or demanding standalone encodings; file-count and trait-count assertions were updated with substantive asset/projection checks. The 16-vs-32 audit counting error was also fixed with an identity-substitution regression test.

The one permitted corrective capture followed those fixes. No further full capture was run. Earlier focused/CI failures remain retained: the test-only incomplete NormalizedVizSpec fixture, a prose/dist-packing race that passed sequentially, and root generated parameter-type freshness. The latter was fixed before final proof and the corrective capture. [Corrective preflight](corrective/preflight/README.md) and [intermediate proof](corrective/README.md) preserve those boundaries. Earlier proof at 82a6b45a and bf7b9177 is historical and is not relabeled as final.

Golden accounting preserves both the m02 dashboard placeholder migration and the one m03 light/A token migration. [m03 attribution](../m03/golden-attribution.json) names the tokens for each of 12 changed files and lists 3 unchanged files. [Complete flat-vs-light/A receipt](../m03/flat-vs-light-A.json) lists 129 changed values. No pixel golden moved after m03. The legacy flat export hash remains `0cc0e991e94d1fed98fe04a1ec4e18b1d9efdfa8835bd7eaa43782eb5b66f968`.

## Advertised diff, CI and delivery boundary

[Final diff](final/proof/movers/sprint-wide-movers.json): 16 canonical and 79 public paths from c3a68d5f to the final implementation, including the root parameter schema and generated interface. [Reconnect draft](final/proof/reconnect/notice-plan.json) is prepared for cmos-dashboard, dashboard-demos, forge-demos and aquex-mcp and remains **unsent**. It names the exact implementation SHA for vendored consumers after separate review and Sprint 191 delivery. Earlier drafts are retained as superseded history, not delivery instructions.

[Observed CI](ci/observed-final.json) retains actual run/job identities, conclusions and source heads:

- pkg-compat: run [34419491052](https://github.com/kneelinghorse/OODS-Forge/actions/runs/34419491052), `502e9bf7`, success
- viz-determinism: run [34420063651](https://github.com/kneelinghorse/OODS-Forge/actions/runs/34420063651), `81fb1a96`, success
- coverage: run [34420063651](https://github.com/kneelinghorse/OODS-Forge/actions/runs/34420063651), `81fb1a96`, success

`pkg-compat` identifies the Package Compatibility workflow's actual `compat` job. Any evidence-only head difference is explicitly recorded in the CI receipt. The optional ECharts soak job is reported as skipped; it is not part of the four-suite skip population.

HC pixels remain deferred (#1851), though all six token scopes are exported. Existing palettes and contrast thresholds are unchanged; dark categorical contrast failures remain failures. Sample-payment SVGs are static per seed record and do not regenerate on form edits. The root and package source changes address the first capture's actual failures; no downstream consumer wiring or primary restart was performed.

## Re-derive the retained packet

From the s190 worktree:

```sh
node scripts/product-reality/s185-closeout.mjs --root "$PWD" --execution-head 81fb1a965ab3afd1cf918b45c6ca6aad1639f509 --review-head b5b80d9d01e1f1de1fe05d10f77e6efc08c3fcdb --manifest artifacts/product-reality/sprint-190/m06/closeout/manifest.json --check
node scripts/product-reality/s185-audit-closeout.mjs --root "$PWD" --execution-head 81fb1a965ab3afd1cf918b45c6ca6aad1639f509 --review-head b5b80d9d01e1f1de1fe05d10f77e6efc08c3fcdb --manifest artifacts/product-reality/sprint-190/m06/closeout/manifest.json --output /tmp/forge-s190-review-audit
```

Inspect [review-handoff.json](closeout/review-handoff.json), the matrix, actual screenshots, contrast rows, first-capture failures and final accounting before deciding whether to close the Active sprint.
