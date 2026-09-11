# s193-m03 — complete runtime population

Implementation head: `909bf5427454af14f4b98d618daa81db4c873902`.
Run: `7698d2e7-48bf-496d-aa12-2bf89e278363`.
Builder self-certified: **false**. Craft and classification approval remain pending.

`runtime-cells.v1.json` records **154 pass, 0 typed gaps, 0 fail** at one head:
11 public objects × seven contexts × React/Vue. This is a fresh sweep with one
shared pack, not a union with m02 or historical workflow receipts. All 22 workflow
cells pass, including Invoice and Plan's first packed workflow proof. The 132
single-screen cells retain the m02 isolation and runtime gates.

The existing workflow harness now runs every public object, retaining its strict
install, typecheck, build, SSR, hydration, shared CSS, mount and interaction gates.
Each passing workflow observes loading, empty, error and success on all four
screens, plus navigation, declared cancellation/archive actions, field persistence,
sample records, reload and collection controls. Every workflow retains React/Vue
accessibility trees and screenshots of all four screens at 390/820/1440.
The observer uses declared editable fields, enums and history sources. Invoice's
status control declares only All states, so status filtering is explicitly not
proven. Invoice, Plan and Usage have observed empty timeline collections without
a declared lifecycle-history/payment source; no populated-history claim is made.

The sweep exposed one product defect: UUID reference fields in generated sample
records were empty. Transaction's required user_id prevented native form submit.
The sample emitter now supplies deterministic UUID references while preserving
the existing stable primary IDs. Regression tests pin the Transaction sample and
the object-specific persistence probes. Other corrections adapt the observer to
declared variants, including stable ID headings and supplemental title fields.

`built-api-proof.json` records the rebuilt MCP health response:
`productReality.runtime = {cells:154, pass:154, typedGap:0, fail:0, head:...}`.
Catalog obligation text serves the same validated ratio; approvedRuntimeCensus
stays null. Missing, duplicated, failed or mixed-run cells, incomplete workflow
states, missing hydration and inconsistent summaries cannot become a healthy
ratio. The CI runtime job now runs the full sweep and both retained-report specs
in the digest-pinned Linux Playwright image. Hosted CI is not yet claimed.

`emitter-bite.json` records removal of actual React screen JSX: the Article card
mount fails and the retained-report Vitest spec exits 1. Byte-identical source
restoration is verified and the cell passes again using the same tarballs.

Final focused verification: **21 runtime contract tests and 30 catalog tests
passed**, with zero skipped tests in those runs; MCP build passed. The earlier
UUID/observer regression run passed 43 tests. Logs are retained in `verification/`.
The first final command named a nonexistent catalog path, so only its two runtime
files ran; the correct catalog path was then run separately and passed all 30.
No five-suite capture was run; it remains reserved for m07.

`design-loops/{Invoice,Plan,Transaction,Usage}.json` retains 16 views per newly
running workflow and identifies four visually inspected views each. Review carries
include sparse detail content, raw sample strings/timestamps, long domain forms,
Archive buttons on objects without an Archivable action claim, and inherited
Cancel subscription wording on Transaction. These findings are not craft approval.

`generated-consumer-projection.json` replaces historical claims with this sweep
for inspection: **62 complete, 47 unavailable** of 109 component obligations.
The class-enumerated movement remains 12 native gains and 11 unreached losses
(two native, nine recipes) versus the historical served ledger. All workflow
components already occurred in the single-screen population, so adding workflows
does not increase that component count. Canonical projection is refreshed in m07.

Eight earlier diagnostic roots are listed in `diagnostic-runs.json`. The first
full attempt at `00b251a7` was stopped with 19 finalized cells (5 pass, 14 fail)
after it exposed observer assumptions and the UUID sample defect. It and all
probes remain separate; none contributes a cell to this successful sweep.

Reproduce from the repository root:

```sh
pnpm exec tsx scripts/product-reality/s193-runtime-cells.ts artifacts/product-reality/sprint-193/m03-ci --workflows
OODS_RUNTIME_REPORT="$PWD/artifacts/product-reality/sprint-193/m03-ci/runtime-cells.v1.json" pnpm --filter @oods/mcp-server exec vitest run test/product-reality/runtime-cells.s193.spec.ts test/product-reality/workflow-runtime.s193.spec.ts
```

On a non-Linux host, set `OODS_PLAYWRIGHT_WS_ENDPOINT` to the pinned Linux
Playwright server. Receipts pin the recorded implementation head; later commits
that only retain evidence do not invalidate the source proof.
