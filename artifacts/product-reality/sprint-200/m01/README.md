# s200-m01 — baseline, isolated consumers, package safety

Builder self-certified: **false**. Implementation head: `ef1988f7b` on `codex/sprint-200-available`. The later evidence commit changes receipts only. The live primary checkout was not built or delivered.

## Verification

| Capture | Passed assertions | Failed assertions | Skipped | Failed files | Uncollected files |
|---|---:|---:|---:|---:|---:|
| Merged head `c344b773a` | 17,663 | 0 | 32 | 0 | 0 |
| Mission head `ef1988f7b` | 17,699 | 0 | 32 | 0 | 0 |

The counts are executions, not distinct tests. The 32 skips are the same 16 optional Stage1 cases in MCP and root. Uncollected files are failed files with zero assertion rows, and are included in failed-file counts. Both captures retain the raw Vitest JSON, command logs, setup logs and worktree checkpoints. Focused results below overlap the full suites and are not added to their totals.

- Native recovery and readiness: 34/34 focused assertions (11 recovery, 23 readiness).
- Mutation proof: removing the reinstall caused six failures and five passes; restoring the source returned all 11 recovery tests to green. The source digest and the deliberately red result are retained.
- Publication guard: 11/11, with exactly ten new approvals referencing CMOS decision #2061.
- Qualified `pnpm viz:gate artifacts/product-reality/sprint-200/m01/checks/viz-gate`: 11/11 steps, 2,671 assertions. Its build, typecheck, scale, docs, matrix and tool-truth steps all exited zero.
- Readiness `--check` passed against Sprint 200 facts. No root package edit or license-field transition was made.

## Implementation

`ensureConsumerRollup` loads the consumer's installed Rollup in a fresh Node process, allowing Rollup itself to choose the host's platform/libc binding. Only a missing `@rollup/rollup-*` module triggers recovery. The helper removes the consumer's hidden npm lockfile, that Rollup installation and its native siblings, then runs the same isolated install once with `--include=optional`. It preserves other packages and the consumer manifest, rejects Rollup borrowed from another checkout, and names the native package if the retry fails. Retry command logs are retained separately.

The helper covers the s182 and s183 consumer proofs, the s184/s185 live-consumer harness, the s188/s191 workflow harness, s193 runtime cells, and the design-loop's packed Vite consumers. The two import-only packed-export proofs do not install Vite/Rollup and need no native-loader check.

The five packages — a11y-tools, tw-variants, tokens, viz-core and viz-render — now have `private: true` and no `publishConfig`. The packet contains the five absent-to-true private approvals and five present-to-absent publication-config approvals under #2061. The sealed Sprint 196 package-shape baseline remains unchanged.

Readiness retains the same collection/rendering logic. Its default output is now Sprint 200, and the overwrite refusal covers Sprint 195 through Sprint 199. The facts diff records exactly the five changed manifest input hashes and ten approved field transitions; root metadata and the historical portable/release observations remain unchanged.

## Runner boundary correction

The existing viz gate allowed output only under Sprint 199, contradicting this sprint's sealed-receipt rule. The first invocation created an untracked `sprint-199/gate` directory; no pre-existing tracked receipt changed. Those newly created files were relocated, unmodified, to `checks/viz-gate-initial-path-diagnostic`, with a relocation record. That run is diagnostic only.

The gate's default and allowed output boundary now use Sprint 200. Seven negative cases cover every sealed sprint and path escapes. The qualified run uses the explicit m01 directory. Its eleven gate commands and chart goldens are unchanged.

## Receipts

- [Baseline accounting](capture/baseline-accounting.json) and [raw merged-head capture](capture/forge-s200-m01-baseline/four-suite-baseline.json).
- [Mission-head accounting](capture/head-accounting.json) and [raw mission-head capture](capture/forge-s200-m01-head/four-suite-baseline.json).
- [Disposition and preservation](capture/disposition.json).
- [Mutation receipt](checks/mutation-receipt.json), [restored unit tests](checks/restored.json), [publish-shape tests](checks/publish-shape.json), [qualified viz gate](checks/viz-gate/report.json).
- [Readiness field/input diff](../readiness/m01-diff.json) and [exact facts patch](../readiness/m01-facts.patch). The current Sprint 200 facts may subsequently regenerate for m03; this mission's captured version is bound to implementation head `ef1988f7b`.
