# Portable runtime — Gate 1

Gate 1 is a private, non-hosted OODS Forge runtime bundle for named
consumers. Forge builds the bundle and hands over a local tarball plus its
verification files; the consumer runs it. This is not a public npm publish, a
GitHub release, an OCI image, an MCPB package, or a registry listing. Those
distribution choices remain Gate 2 work.

## Build and verify

CI uses Node 24 and pnpm 9.12.2. The supported runtime floor is Node
`>=20.11.1`, which is the highest declared floor among the thirteen bundled
workspaces. The portable-runtime CI job builds on Node 24 and runs the extracted
E2E on Node 24 and Node 20.11.1 within its 15-minute budget.

Build the repository before assembly:

```sh
pnpm install --frozen-lockfile
pnpm run build:tokens
pnpm run build:packages
pnpm --filter @oods/mcp-server run build
pnpm --filter @oods/mcp-bridge run build
```

Assemble and verify from operating-system temporary directories, outside the
checkout:

```sh
forge_repo_root=$PWD
forge_runtime_tmp=$(mktemp -d)
forge_extract_tmp=$(mktemp -d)
trap 'rm -rf "$forge_runtime_tmp" "$forge_extract_tmp"' EXIT

node scripts/runtime/assemble.mjs \
  --out-dir "$forge_runtime_tmp/out" \
  --work-dir "$forge_runtime_tmp/work"

tar -xzf "$forge_runtime_tmp/out/forge-runtime.tar.gz" \
  -C "$forge_extract_tmp"

node scripts/runtime/e2e.mjs \
  --extract-dir "$forge_extract_tmp" \
  --repo-root "$forge_repo_root"
```

`assemble.mjs` produces four inspection artifacts:

- `forge-runtime.tar.gz` — the runtime archive. It is determinism-certified
  only when `archivePacking.determinismCertified` is `true` in the manifest.
- `forge-runtime.tar.gz.sha256` — the conventional detached archive-digest
  sidecar.
- `forge-runtime.manifest.json` — the detached inspection manifest. It retains
  the embedded payload metadata and adds `archive {file, byteSize, sha256}`
  after packing.
- `runtime-sbom-lite.json` — the pnpm-lock-derived production closure, also
  present at the bundle root.

The embedded manifest cannot contain the digest of the archive that contains
that manifest: changing the digest field would change the archive and require
a new digest forever. It therefore carries `payloadTreeSha256`, which covers
the staged payload, and `archiveSha256File`, which points to
`forge-runtime.tar.gz.sha256`. The detached manifest adds the archive filename,
measured byte size and SHA-256; the embedded manifest retains only payload
metadata. Their bytes therefore differ.
The manifest also records the source commit and source commit date, package
versions, registry and structured-data pins, token-tree pin, Node floor, CI
Node version, package layout, and third-party closure count.

On Linux, verify the detached archive digest with:

```sh
cd "$forge_runtime_tmp/out"
sha256sum --check forge-runtime.tar.gz.sha256
```

The assembler creates a synthetic workspace, preserves the repository's
workspace-link policy, and performs its production-only install there with
`--no-frozen-lockfile --no-optional --config.auto-install-peers=false`; the
synthetic importer is not the repository importer. Peer requirements are
supplied by their consumers, so peer-only lockfile resolutions are excluded
from the bundle SBOM. The current lock-derived third-party closure is 283
packages, up from 245 before the bridge joined the bundle. Assembly derives this
count once from the lock and requires the installed closure, SBOM and manifest
to agree with that value. The repository install remains
`pnpm install --frozen-lockfile`, and CI hashes `pnpm-lock.yaml` before and
after both assemblies to prove the source lock did not move.

CI assembles twice into distinct output and work directories, then compares
the two detached sidecars. Both CI calls add `--final`, which rejects a dirty
source checkout; omit that flag only for an explicitly dirty development
bundle:

```sh
node scripts/runtime/assemble.mjs \
  --out-dir "$forge_runtime_tmp/out-1" \
  --work-dir "$forge_runtime_tmp/work-1" \
  --final
node scripts/runtime/assemble.mjs \
  --out-dir "$forge_runtime_tmp/out-2" \
  --work-dir "$forge_runtime_tmp/work-2" \
  --final
cmp "$forge_runtime_tmp/out-1/forge-runtime.tar.gz.sha256" \
  "$forge_runtime_tmp/out-2/forge-runtime.tar.gz.sha256"
```

The deterministic archive step is Linux/GNU-tar certified. When GNU tar is
unavailable, the assembler uses macOS bsdtar's restricted-pax format so local
pack-twice checks remain stable without unrestricted-pax `ctime` headers.
Its manifest still sets `archivePacking.determinismCertified` to `false`; that
bundle can be extracted and exercised locally, but it is not the CI
certification artifact.

## Accepted consumer requirements

This is the Gate 1 disposition of the eight requirements accepted in request
`f55e6865`.

| Item                                              | Gate 1 disposition                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Pinned runtime artifact and software inventory | **Satisfied.** The private handoff includes the tarball, checked-out commit, detached SHA-256, root `LICENSE`, and `runtime-sbom-lite.json`. The SBOM-lite records the pnpm-lock v9 production closure used by this bundle; OCI is out of scope.                                                                                                                                                                                                   |
| 2. Runtime version contract                       | **Satisfied.** The manifest declares `nodeFloor` `>=20.11.1` and `ciNode` 24. CI builds on Node 24 and exercises the extracted runtime on Node 24 and Node 20.11.1. pnpm is pinned to 9.12.2 for the build.                                                                                                                                                                                                                                                                  |
| 3. Adapter-only operation                         | **Satisfied, with an optional bridge.** The adapter lazily starts the bundled native server over stdio. `mcp-bridge` is the thirteenth package; it can independently start the same bundled server over HTTP.                                                                                                                                                                                                                                                                        |
| 4. Runtime data and planning/token assets         | **Satisfied under the publish boundary below.** Runtime registry data, built token output, and structured data ship. Planning means the relocated compiled component schema, not `cmos/`. Brand source, named fidelity fixtures, and stories do not ship.                                                                                                                                                                                          |
| 5. Path portability                               | **Satisfied.** CI extracts below `$RUNNER_TEMP`, outside `$GITHUB_WORKSPACE`, starts from that arbitrary location, rejects developer absolute paths, and does not rely on Node walking up into the checkout for dependencies.                                                                                                                                                                                                                      |
| 6. Consumer E2E                                   | **Satisfied and extended.** The primary adapter makes 29 calls across all 19 tools. Restart adds health, for 30 adapter calls. Outcomes are 17 executed passes and two typed limits. Separate bridge checks cover `/health`, `/tools`, `/run` render parity and clean shutdown. |
| 7. Lifecycle, persistence, and environment        | **Satisfied with the corrections below.** Readiness is the first successful `health` `tools/call`, not `tools/list`. The E2E measures shutdown on stdin close and restart/termination behavior. Persistent writers and 26 documented operational environment variables are explicit below.                                                                                                                                                                |
| 8. Freshness metadata                             | **Satisfied.** `forge-runtime.manifest.json` is a bundle-root file and an adjacent inspection copy. It is not a `health` response field. A future public distribution may expose a different Gate 2 freshness surface.                                                                                                                                                                                                                             |

## Publish boundary

The Gate 1 archive contains:

- The thirteen runtime workspaces with their `package.json` and built runtime
  output: `mcp-server`, `mcp-adapter`, `mcp-bridge`, `tokens`, `viz-core`, `viz-render`,
  `a11y-tools`, `artifacts`, `release-utils`, `component-contracts`,
  `component-styles`, `components-react`, and `components-vue`. The component
  contracts registry ships as package data; the MCP server directly loads its
  capability baseline plus the React/Vue readiness evidence through public
  JSON subpaths. The adapter contributes only `index.js`, `sanitize-schema.js`,
  `tool-descriptions.json`, and its `package.json`.
- The production dependency closure installed for the MCP server, adapter and bridge.
- `configs/agent/policy.json`, required by the bridge. Missing policy refuses
  startup with `BRIDGE_POLICY_MISSING`; no substitute tool roster is used.
- Top-level runtime registry data: `domains/`, `objects/`, `schemas/`, and
  `traits/`.
- `artifacts/structured-data/` and
  `docs/integration/stage1-entity-aliases.json`.
- Built token output under `packages/tokens/dist/`, including the compiled
  brand A/B CSS and the legacy `dist/ts/tokens.ts` output. Token source under
  `packages/tokens/src/` does not ship.
- `packages/mcp-server/dist/registry/readiness-attestation.v1.json`, generated
  during assembly from host-resolved React/Vue evidence references. Each reference
  records its hash and evidence class, and the attestation binds those claims to
  all shipped first-party package bytes. Generation verifies it before accepting
  readiness without host source or test files.
- Root `LICENSE`, `forge-runtime.manifest.json`, and
  `runtime-sbom-lite.json`.

The `packages/<workspace>/dist` layout is load-bearing. Production modules
resolve `REPO_ROOT` by walking up from those dist locations, so flattening a
workspace or using the adapter's adjacent fallback is unsupported. Assembly
prunes `.map`, `.test.` and source `.ts` files inside `packages/*/dist`, while
keeping `.d.ts` declarations and `dist/ts/*.ts` built token outputs.
Tracked TypeScript assets elsewhere in the boundary remain present; in
particular, `.ts` files under `traits/` are data inputs, not build debris.

The archive never contains a `cmos/` directory, planning inputs, consumer
fixtures, consumer intake data, brand source, `stories/`, source code or tests. Three
independent boundary checks make the distinction enforceable:

1. The member gate rejects every archive path rooted at `cmos/`.
2. The executable-JavaScript gate rejects a quoted `cmos` path in bundled
   `packages/*/dist/**/*.js`; a list-only smoke cannot hide a module-scope
   planning read.
3. `cmos/planning` may survive only as inert provenance text in the explicit
   allowlist: `artifacts/structured-data/manifest.json`, the dated root-level
   `artifacts/structured-data/oods-components-*.json` snapshots, both
   `traits/viz/layout-facet.trait.yaml` and its tracked `.ts` data companion,
   `packages/component-contracts/registry/component-reconciliation.proposed.v1.json`,
   and that registry's bundled data in
   `packages/component-contracts/dist/index.js` and `index.cjs`. No bundled
   code dereferences those provenance strings as filesystem paths.

The absolute-path gate rejects the exact source-repository and assembly-work
paths everywhere. It also rejects generic `/Users/`, `/home/runner/work/`, and
Windows user roots in first-party payload files and executable dependency
JavaScript. Inert third-party documentation and declarations may contain path
examples; the measured closure includes such examples in `@types/node`
declarations and the `escalade` README. The two first-party files whose job is
to carry generic redaction patterns are exempt from the generic-root check:
`packages/mcp-server/dist/security/policy.json` and
`packages/mcp-server/dist/security/redactions.json`. The E2E also asserts that
`NODE_PATH` is unset and that the extraction directory is not inside the
source repository.

### Runtime-relative roots

The runtime's root-relative reads and their Gate 1 disposition are:

| Root                                                                     | Purpose                                                              | Disposition                              |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------- |
| `domains/`                                                               | Domain-owned object and trait registry data                          | Included                                 |
| `objects/`                                                               | Canonical object registry data                                       | Included                                 |
| `schemas/`                                                               | Top-level schema registry data                                       | Included                                 |
| `traits/`                                                                | Trait registry and YAML/TypeScript data assets                       | Included                                 |
| `artifacts/structured-data/`                                             | Manifest, component/token data, aliases, mappings, and render inputs | Included                                 |
| `docs/integration/stage1-entity-aliases.json`                            | Stage 1 entity aliases                                               | Included                                 |
| `packages/tokens/dist/css/`                                              | Runtime document styling                                             | Included                                 |
| `packages/tokens/dist/tailwind/`                                         | Code-generation token mapping                                        | Included                                 |
| `packages/mcp-server/dist/schemas/`                                      | Tool wire schemas and relocated component schema                     | Included inside the server dist          |
| `packages/mcp-server/dist/security/`                                     | Server policy and redaction patterns                                 | Included inside the server dist          |
| `configs/agent/policy.json`                                               | Required bridge policy                                               | Included                                 |
| `packages/mcp-server/dist/registry/readiness-attestation.v1.json`          | Hash-bound portable React/Vue readiness                              | Generated at assembly                    |
| `packages/component-contracts/registry/`                                 | Component capability records used by target-aware code generation    | Included                                 |
| `packages/components-{react,vue}/evidence/`                              | Target readiness records loaded through public package subpaths      | Included                                 |
| `stories/`                                                               | Optional catalog stories facet                                       | Not shipped; that facet degrades to `[]` |
| `packages/tokens/src/`, `packages/tokens/scripts/`, `apps/explorer/src/` | Brand application, token rebuilding, and host diagnostics            | Host repository only                     |

## Tool surface and host-only calls

The default adapter advertises 19 auto tools in the order of `registry.auto`; five on-demand tools remain outside this default surface. The tool ledger contains 24 live entries and the three recorded retirements.

```text
tokens.build
structuredData.fetch
brand.apply
brand.intake
catalog.list
code.generate
design.compose
design.preview
pipeline
health
registry.snapshot
viz.render
dashboard.render
artifact.certify
fidelity.preview
map
schema
object
repl
```

Advertisement includes two typed portable limits. `brand.apply` requires canonical brand source, which Gate 1 omits; even its dry-run returns `OODS-N020` at the adapter wire. `brand.intake` validates inline documents entirely in memory and succeeds without canonical brand source. `tokens.build apply:true` exports five artifacts from shipped outputs without rebuilding; dry-run remains preview/transcript only. A missing portable output returns `OODS-N011` with `buildAttempted:false`. `fidelity.preview` works with inline manifests; named fixtures are host-only. The optional catalog stories facet remains empty when stories are absent.

`design.preview` requires the local design-loop server and returns retryable `OODS-N019` when it is unavailable. Adapter v0.3.0 retains structured native failures as JSON text content shaped `{error:{...native,retryable,data}}` with `isError:true`; the native code is preserved at `tools/call`. React/Vue `code.generate` and `pipeline` emit real artifacts using the assembly-time readiness attestation. Missing or tampered attestation evidence returns `OODS-N015` without an artifact. The tool ledger therefore retains two `portableLimits` rows: `brand.apply` and `design.preview`.

## E2E sequence and lifecycle

`scripts/runtime/e2e.mjs` initializes the extracted adapter and checks `tools/list` against the extracted registry. The primary adapter process makes 29 calls across all 19 advertised tools. It retains the four two/four-panel dashboard renders, positive and negative chart certification, and adds a content-pinned recipe per advertised tool. Dynamic schema/spec references bind directly to prior tool output without editing schemas. Map create/resolve/delete and schema save/load/delete prove scoped persistence. Token dry-run confirms B/dark metadata and writes only a transcript/index; an additional apply call checks all five exported artifacts against shipped outputs. Health separately checks the built scopes. A second code-generation call exercises Vue alongside React, and pipeline returns a real artifact. Brand-source absence and unavailable preview are asserted with their wire codes as the two typed limits.

Every dashboard HTML hash covers returned bytes; repeats compare deterministic response projections while excluding only the three ephemeral reference fields. Certification retains all four positive pillars and the HTML-negative OODS-V126 control. Health reports exact built scopes and a configured A/light default. The test checks token transcript paths inside the extraction artifact root and directs map/schema writes to a fresh extraction-local root. It removes only those owned roots, then requires the complete extracted tree digest to match its pre-test value.

Closing stdin must stop the adapter cleanly. A second process initializes, calls health, and exits on SIGTERM without SIGKILL. Total: 30 adapter calls across two processes. The E2E separately launches the bundled bridge on an ephemeral port, checks `/health` revision against the manifest commit and structured-data hash, checks the 19-name `/tools` roster, compares a `/run` `viz.render` svgHash to the same adapter operand, and stops the bridge and its child cleanly. Per-tool outcomes, fixture hashes, lifecycle results and restored tree hashes are retained in CI's `portable-runtime-e2e` artifact. The source-derived ledger counts literal calls; the separate E2E receipt proves execution.

## Reference applications from the bundle

The runtime-cell harness has a bundle mode for 42 fixed cells: Organization,
Subscription and User × card, detail, form, inline, list, timeline and workflow
× React and Vue. Supply both the extracted directory and its original archive;
the extraction must be outside the repository. Use the pinned Linux Playwright
browser environment required by the host runtime sweep.

```sh
pnpm exec tsx scripts/product-reality/s193-runtime-cells.ts \
  artifacts/product-reality/sprint-196/m03/bootstrap-runtime \
  --bundle-dir "$forge_extract_tmp" \
  --bundle-archive "$forge_runtime_tmp/out/forge-runtime.tar.gz"
```

Bundle mode fixes the application/context/framework scope, including workflows.
It verifies the extracted payload against the archive and checks host product
sources against the manifest's recorded commit before and after execution.
Documentation and proof-ledger updates may follow that commit; product-source
changes fail the comparison. The current checkout's HEAD never replaces the
recorded bundle identity.

One packing phase per sweep runs `npm pack --ignore-scripts` for the five
foundation packages directly from the extracted bundle: tokens,
component-contracts, component-styles, components-react and components-vue.
Every isolated consumer installs those same five tarballs. Composition and code
generation run through the bundled adapter, then the generated applications
undergo typechecking, production builds and the existing browser gates for
mounting, accessibility trees, screenshots, context states and chart themes.

For each operand, the harness retains host and bundle composition responses,
generation requests, complete generated artifacts and comparison receipts.
Composition schemas must match on the JSON wire; successful generation requires
exact `contentHash` equality with host output from the same recorded source.
An unequal artifact remains a retained failure. Passing rows bind their artifact
hash, host hash, browser gates, bundle commit and archive SHA-256.

The canonical host census is
`packages/mcp-server/registry/runtime-cells.v1.json`; a valid bundle sweep writes
`packages/mcp-server/registry/release-cells.v1.json` and retains a copy under its
receipt directory. The build copies both available ledgers into the server's
`dist/registry/`. `health.productReality.runtime` reports the host census, while
`health.productReality.release` reports the 42-cell release summary with the
executed `bundleHead` and `archiveSha256`. Those fields identify the measured
archive, even when a later bundle carries the evidence. Missing or invalid
release evidence yields `release: null` and a warning.

The first s196-m03 sweep passed all 42 cells with host artifact hash equality.
Its bootstrap archive predates the first release ledger. Recorded identity and retained evidence are
in the [m03 receipt index](../../artifacts/product-reality/sprint-196/m03/README.md);
neither a complete 42-cell result nor a hosted CI pass is claimed yet.

## Bridge entry point

From any working directory, start the bridge from its extracted package:

```sh
MCP_BRIDGE_PORT=4466 node "$forge_extract_tmp/packages/mcp-bridge/dist/server.js"
```

The bridge spawns `packages/mcp-server/dist/index.js` from the same bundle.
Its `/health` revision is stamped at assembly from the manifest source commit
and structured-data hash; runtime startup never calls git. `/artifacts/` serves
the parent of the server policy's resolved `artifactsBase`, and `/runs` reads
that exact run directory. SIGINT or SIGTERM closes both bridge and native child.

## Persistence contract

The bundle supports read-only use without creating files. Calls that opt into
state changes use these real locations:

| Writer                                       | Default location and override                                                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy-governed run bundles                  | `<bundle-root>/artifacts/current-state/<UTC-date>/...`, resolved from `packages/mcp-server/dist/security/policy.json`. There is no environment override for `artifactsBase`.        |
| `schema` and schema-writing pipeline actions | `.oods/schemas` below the adapter's native-server cwd, `packages/mcp-server/`. Set `MCP_SCHEMA_STORE_ROOT` and/or `MCP_SCHEMA_STORE_DIR` to relocate it.                            |
| `map`                                        | `artifacts/structured-data/component-mappings.json`, or `MCP_MAPPINGS_PATH`; apply conflicts write below `<bundle-root>/.oods/conflicts/`.                                          |
| `tokens.build`                               | Policy run bundles containing five artifacts copied or resolved from shipped dist outputs. Portable calls never rebuild or rewrite `packages/tokens/dist`. |
| Legacy file telemetry                        | `MCP_TELEMETRY_DIR` selects a JSONL destination, but `packages/mcp-server/src/telemetry/log.ts` has zero production importers. It performs no runtime writes today.                 |

The E2E exercises token transcript, mapping and saved-schema writers inside owned extraction roots, cleans up, and proves the complete tree is restored.

## Environment contract

The native server and bridge load `<bundle-root>/.env` through dotenv when the
file is present. None of these 26 operational variables is required for the Gate 1
E2E; an absent variable uses the stated default or leaves the optional feature
disabled.

| Variable                    | Purpose / default                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `MCP_TOOLSET`               | `default` selects the 19 auto tools; `all` adds all on-demand tools.               |
| `MCP_EXTRA_TOOLS`           | Comma-separated on-demand tools added to the default surface.                      |
| `MCP_BRIDGE_PORT`           | Loopback HTTP bridge port; default 4466, explicit 0 selects an ephemeral port. If the unset default is busy, the bridge selects an ephemeral port. |
| `BRIDGE_TOKEN`              | Optional shared token required in `X-Bridge-Token` for `/run`; unset disables this gate. |
| `MCP_BRIDGE_CORS_ORIGIN`     | Comma-separated allowed origins; default `http://localhost:6006,http://localhost:3000`. |
| `MCP_ROLE`                  | Policy role; default `designer`.                                                   |
| `MCP_USER`                  | Transcript identity; default `system`.                                             |
| `MCP_HEALTH_PORT`           | Optional loopback health listener; default `0` disables it.                        |
| `MCP_BRAND`                 | Configured default token brand metadata; default `A`.                                           |
| `MCP_THEME`                 | Health/token context theme; default `light`.                                       |
| `MCP_CODE_CONNECT_PATH`     | Optional code-connect artifact override.                                           |
| `MCP_STRUCTURED_DATA_DIR`   | Optional structured-data root override.                                            |
| `MCP_SCHEMA_STORE_ROOT`     | Project root used by the schema store.                                             |
| `MCP_SCHEMA_STORE_DIR`      | Schema-store directory, relative to its root unless absolute.                      |
| `MCP_SCHEMA_REF_TTL_MS`     | In-memory schema/value-ref lifetime; default 30 minutes.                           |
| `MCP_SCHEMA_REF_MAX`        | Maximum in-memory schema/value refs; default 250.                                  |
| `MCP_RUNTIME_CELLS_PATH`    | Optional path to a validated 154-cell runtime ledger; default is the canonical registry, then shipped dist registry. |
| `MCP_RELEASE_CELLS_PATH`    | Optional path to a validated 42-cell release ledger; default is the canonical registry, then shipped dist registry. Invalid or absent proof degrades health. |
| `MCP_MAPPINGS_PATH`         | Mapping-document path; relative values resolve from the bundle root.               |
| `MCP_TELEMETRY_DIR`         | Legacy JSONL path; its writer currently has no production importer.                |
| `OODS_NODE_PATH`            | Node executable used by the adapter; default `process.execPath`.                   |
| `OODS_TAILWIND_TOKENS_PATH` | Tailwind-token file override for code generation.                                  |
| `OODS_OTLP_ENDPOINT`        | Enables OTLP/HTTP trace export when set.                                           |
| `OODS_OTLP_SERVICE_NAME`    | OODS-specific service-name override.                                               |
| `OODS_OTLP_HEADERS`         | Comma-separated OTLP exporter headers.                                             |
| `OTEL_SERVICE_NAME`         | Standard OpenTelemetry service name; takes precedence over the OODS-specific name. |

## Private handoff

The Gate 1 delivery records the local path to `forge-runtime.tar.gz`, the
detached SHA-256 sidecar, `forge-runtime.manifest.json`, and
`runtime-sbom-lite.json`. It also records the CI-15 run URL and the commit in
the manifest. Nothing in this runbook authorizes a public publish.
