# s193-m02 — single-screen runtime population

Implementation head: `7abe10287a096c7314f45eb3d53462ad10d54dca`.
Run: `83a57c36-2b0b-4bad-8b4f-e671662a8524`.
Builder self-certified: **false**. No craft approval is claimed.

`runtime-cells.v1.json` records **132 pass, 0 typed gaps, 0 fail**: all 11 public
objects, six single-screen contexts, and React/Vue. Each cell composes from public
object/context input and consumes exact build-profile generation. The harness
never edits a composed or saved schema. All consumers install from the same
single pack, outside the workspace, with empty npm configuration and no source
imports, workspace aliases, or inherited node_modules. Four isolated generator
processes share only the immutable tarballs.

Every cell retains its install/isolation, strict typecheck, production build,
error-free mount, nonempty accessibility tree, 390/1440 screenshots, and context
state receipts under `cells/`. The browser is Linux Chromium 141.0.7390.37 in the
digest-pinned Playwright image recorded in `browser.json`. Lists exercise all four
declared states. Forms show seeded values and reject an emptied required native
field; this does not claim persistence. Detail views reject editable fields and
visit declared timelines.

`emitter-bite.json` records removal of the real React emitter's screen JSX. The
Article/card/react mount fails, and the actual retained-report Vitest spec exits
nonzero. Restoration is byte-identical and the same cell passes using the same
tarballs. `bite/` retains both runs and the red contract output.

The `runtime-cells` CI job runs the sweep and contract test in that pinned image
and uploads the receipts. This local proof used the same image through the
Playwright server; a hosted CI run has not yet occurred.

The new `--runtime-cells` structured-data projection replaces every historical
generated-consumer claim. `generated-consumer-projection.json` measures 62/109
complete and 47 unavailable at this head: 12 native gains and 11 losses (two
native, nine recipes) that no current single-screen cell reaches. These are
coverage changes, not implementation or classification changes. The projection
will be regenerated with the complete population in m07; `approvedRuntimeCensus`
remains null. The normal structured export was refreshed for the Taggable
placement metadata; current-sweep consumer coverage is not yet applied to it.

Corrections required by runtime evidence:

- Standalone lists now declare loading/empty/error/success. Workflows reuse those
  branches to avoid nested duplicate states. The seeded consumer model supplies
  the public success state.
- Taggable detail views use the existing read-only TagSummary. Form TagInput is
  unchanged. Historical structured snapshots stay frozen with explicit checks
  for this placement change.

Earlier diagnostics are retained separately in `../m02-probe-01`,
`../m02-probe-02`, and `../m02-attempt-01`. The last was stopped at 65 cells after
both Organization detail targets exposed the editable TagManager field. None of
these receipts contributes to the 132-cell result.

Review carry: Article/card/react at 390 has an unnamed button in the accessibility
tree. Nonempty-tree and mount gates are limited runtime checks; they do not
establish usability, complete accessibility, or craft quality.

Reproduce from the repository root:

```sh
pnpm exec tsx scripts/product-reality/s193-runtime-cells.ts artifacts/product-reality/sprint-193/m02-ci
OODS_RUNTIME_REPORT="$PWD/artifacts/product-reality/sprint-193/m02-ci/runtime-cells.v1.json" pnpm --filter @oods/mcp-server exec vitest run test/product-reality/runtime-cells.s193.spec.ts
```

On a non-Linux host, set `OODS_PLAYWRIGHT_WS_ENDPOINT` to the pinned Linux
Playwright server. Full-suite capture remains reserved for m07.
