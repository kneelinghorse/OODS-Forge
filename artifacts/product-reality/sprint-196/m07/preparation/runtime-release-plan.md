# m07 runtime and portable execution plan

Preparation only. Root must provide the exact frozen clean implementation commit A before any build, npm pack, assembly, or sweep below runs. Runtime and release sweeps precede the single full capture under the revised ordering. The completed earlier CI run is retained separately under `../ci-historical/run-34679856153/`; it qualified source `944f4dda`, before the m05 UTC implementation.

## Verified local environment

- Build/runtime Node: `/opt/homebrew/bin/node`, v24.6.0.
- Exact floor runtime: `/Users/systemsystems/.npm/_npx/775f7a63e8b80cdc/node_modules/node/bin/node`, v20.11.1. Homebrew `node@20` is v20.19.6 and does not establish the floor.
- GNU tar is available at `/opt/homebrew/bin/gtar`; inspect the actual manifest's `archivePacking` field instead of assuming deterministic certification.
- Existing browser container: `forge-s196-playwright`, image `mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a`, `ipc=host`, loopback port19630 to container3000. Its command is `npx --yes playwright@1.56.1 run-server --host 0.0.0.0 --port 3000`.
- Set `OODS_PLAYWRIGHT_WS_ENDPOINT=ws://127.0.0.1:19630/`; `launchProofBrowser` connects with `exposeNetwork:'<loopback>'`. The sweep itself rejects non-Linux user agents or Chromium other than `141.0.7390.37`.
- Use an explicit recorded `TZ=UTC` for local m07 sweeps. Hosted release currently sets America/Chicago; both remain valid after m05's measured UTC adapter fix.

## Order and clean-head constraints

1. Root completes bounded implementation/closeout wiring and pre-freeze checks, then provides exact clean implementation commit **A**. No full capture has run yet. Assert the checkout equals A and is clean. Root may push A for the fresh UTC hosted CI run in parallel.
2. Assemble the measurement archive outside the checkout at clean A, before introducing receipt files or canonical ledger writes. `assemble.mjs --final` reads HEAD itself and rejects tracked or untracked dirt. Record exact A, payload digest, archive SHA and size; extract outside the repository. Then retain its original metadata under `m07/measurement-archive/`.
3. Run host154 and extracted-release42 sequentially at unchanged HEAD A, with product sources held fixed. Censuses also record A. Evidence and the generated canonical ledger pair may make the checkout dirty, but no implementation changes are permitted. Host packing runs five prepack builds; the host emitter bite temporarily mutates and restores `react-emitter.ts`. No other build or mutation may overlap.
4. Host154 retains dashboard4 and chart-theme48 as separate populations and executes the real emitter mutation/restore proof. Bundle42 compares product sources with manifest A before and after, overrides caller scope with exactly three objects/seven contexts/two frameworks, disallows dashboards, packs extracted packages once with `--ignore-scripts`, and checks every host/bundle artifact hash. Retain all original per-cell receipts, comparisons and tarballs.
5. Root commits the generated canonical runtime/release ledger pair, near.md and evidence as **B**. The product-head relation A→B permits only the canonical ledger pair and near.md; retained evidence is separately attributed. No arbitrary runtime, schema, component-registry or package changes may hide in that relation. Runtime/release observations remain honestly pinned to A.
6. Run the **one full five-suite capture at clean B**, retaining every capture output under `/tmp`. Native owns the full build/write hold for that capture; this agent performs no packing, assembly or shared-dist mutation until the hold is released. B is the actual capture head and is intentionally distinct from runtime/release head A.
7. While B is still clean and before importing capture output into the checkout, assemble the final proof-carry archive twice at **B**, then run E2E under Node24 and20.11.1 with distinct extractions. That archive carries the newly measured canonical ledgers. Preserve explicit A→B provenance; do not insert another commit between capture and final archive assembly.
8. Root retains capture/final-archive/E2E and review evidence as **C**. Root does not push B until A's hosted CI run finishes, because a new PR push cancels the previous run. CI receipts retain their actual synthetic merge and source/tree relation separately.
9. An archive cannot contain a release ledger whose archive SHA identifies that same archive. Final archive B faithfully serves the original measurement archive A's `bundleHead/archiveSha256` release proof. If an additional42-cell sweep against B is required, retain that result detached; continually reinserting it creates a self-hash cycle.

`isRuntimeProductPath` excludes server canonical registries, Markdown, and test files from host/bundle source equality; it does not excuse changed component registries, runtime TS, schemas, traits, objects, structured data, package manifests, policy, or lockfile. Full canonical ledger mutation and subsequent proof-only commit therefore need explicit ordering rather than a fabricated HEAD override.

## Commands after root's release

Common build sequence from the existing workflow/runbook:

```sh
pnpm install --frozen-lockfile
pnpm run build:tokens
pnpm run build:packages
pnpm --filter @oods/mcp-server run build
pnpm --filter @oods/mcp-bridge run build
```

Use fresh, named temporary directories; do not reuse a previous archive/extraction. The assembler accepts only these arguments, with no source-head override:

```sh
node scripts/runtime/assemble.mjs --out-dir "$forge_measure_out" --work-dir "$forge_measure_work" --final
mkdir -p "$forge_measure_extract"
tar -xzf "$forge_measure_out/forge-runtime.tar.gz" -C "$forge_measure_extract"
```

Host population and retained gate, using the repository root as cwd:

```sh
TZ=UTC OODS_PLAYWRIGHT_WS_ENDPOINT=ws://127.0.0.1:19630/ pnpm exec tsx scripts/product-reality/s193-runtime-cells.ts artifacts/product-reality/sprint-196/m07/runtime --workflows --dashboard-objects=Invoice,Usage
OODS_RUNTIME_REPORT="$PWD/artifacts/product-reality/sprint-196/m07/runtime/runtime-cells.v1.json" pnpm --filter @oods/mcp-server exec vitest run test/product-reality/runtime-cells.s193.spec.ts test/product-reality/workflow-runtime.s193.spec.ts
pnpm exec tsx artifacts/product-reality/sprint-195/m06/verify-runtime.ts artifacts/product-reality/sprint-196/m07/runtime
```

Clear accidental `OODS_RUNTIME_OBJECTS`, `OODS_RUNTIME_CONTEXTS`, and bundle-mode environment overrides before the host command. The six ordinary contexts plus workflow yield154canonical rows; dashboard4 does not inflate that denominator. The existing s195/m06 verifier is receipt-driven and checks48actual chart-theme scopes without old SVG-hash constants.

Extracted release population and retained gate:

```sh
TZ=UTC OODS_PLAYWRIGHT_WS_ENDPOINT=ws://127.0.0.1:19630/ pnpm exec tsx scripts/product-reality/s193-runtime-cells.ts artifacts/product-reality/sprint-196/m07/release-runtime --bundle-dir "$forge_measure_extract" --bundle-archive "$forge_measure_out/forge-runtime.tar.gz"
OODS_RELEASE_REPORT="$PWD/artifacts/product-reality/sprint-196/m07/release-runtime/release-cells.v1.json" pnpm --filter @oods/mcp-server exec vitest run test/product-reality/release-runtime.s196.spec.ts --reporter=verbose
```

Final carry archives/E2E use the same assembler arguments twice, distinct output/work/extraction directories, actual archive checksum verification and sidecar comparison. After extracting independently for each runtime:

```sh
/opt/homebrew/bin/node scripts/runtime/e2e.mjs --extract-dir "$forge_final_extract24" --repo-root "$PWD"
/Users/systemsystems/.npm/_npx/775f7a63e8b80cdc/node_modules/node/bin/node scripts/runtime/e2e.mjs --extract-dir "$forge_final_extract20" --repo-root "$PWD"
```

E2E checks30adapter calls,17executed tools plus2typed limits, bridge health/tools/run parity, lifecycle, immutable extraction, current shipped runtime154 and release42 projections, and named registry pins. The tested archive binary, detached manifest, SBOM, checksum, generated readiness attestation and both raw JSON receipts must be retained.

## Existing hosted commands and needed bounded wiring

The current `portable-runtime` matrix builds on Node24/pnpm9.12.2, assembles twice with `--final`, verifies source lockfile and sidecar equality, selects runtime Node24 or20.11.1, then runs the same `e2e.mjs --extract-dir --repo-root` command. Budget15minutes per cell. The host runtime job runs the154+dashboard command and receipt gates in the pinned image with a60minute budget. The release job assembles while clean, copies original manifest/SBOM/sidecar into its upload root, runs42from extraction, and verifies the full release spec within20minutes. These commands need no population/threshold changes.

Root's closeout producer/auditor/mover selection needs a bounded s196 branch: mission `s196-m07`, base `1d100e20`, current24tool/109component/154runtime/42release identities, five-suite accounting, explicit runtime/release implementation head A, capture/final-archive head B and review evidence head C, m05 golden qualification head, fresh runtime/release/census paths, and new advertised sources. Do not hand-edit old receipts or existing s195 history. Register fresh source keys before freezing A; the capture at B must verify the shipped canonical ledgers without a late verifier rewrite.

Expected m07 retained keys were sent to readiness: `runtime/`, `release-runtime/` (including `submitted-packages/inventory.json`, all five tarballs, raw host/bundle parity responses and per-cell gates), `measurement-archive/`, `final-archive/`, `e2e-node24.json`, `e2e-node20.json`, and separate hosted `ci/` versus earlier `ci-historical/` evidence.
