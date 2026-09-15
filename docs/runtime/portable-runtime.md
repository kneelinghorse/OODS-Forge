# Portable runtime

The portable runtime is the OODS Forge bundle a GitHub Release carries: one
archive with the MCP server, the stdio adapter, the HTTP bridge, the built token
and component packages, the registry data and the production dependency
closure, plus the files that verify it. Users install it by following
[install.md](install.md). This page is the contract behind that page: how the
archive is built and verified, what it contains and what it never contains, and
how the runtime behaves once extracted. It is a source-available release under
PolyForm Noncommercial 1.0.0; the license, the commercial path and the
third-party notices travel inside the archive.

## Release assets

A release carries six files:

- `forge-runtime.tar.gz`: the runtime archive.
- `forge-runtime.tar.gz.sha256`: the detached SHA-256 of the archive.
- `forge-runtime.manifest.json`: the inspection manifest (source commit, package
  versions, Node floor, payload digests, terms and brand-source digests).
- `runtime-sbom-lite.json`: the pnpm-lock-derived production closure with
  integrity hashes.
- `THIRD-PARTY-NOTICES.md`: the declared license and shipped license text of
  every package in that closure.
- `install.md`: the install steps for Claude Desktop, Claude Code and Cursor.

A release is drafted from a frozen commit and published only by the repository
owner. No npm package, `.mcpb` bundle or container image exists for this
runtime.

## Build and verify

Every gate is local. The build machine runs Node 24; the runtime floor is Node
`>=20.11.1`, the highest declared floor among the thirteen bundled workspaces,
and the manifest records both.

Build the repository before assembly:

```sh
pnpm install --frozen-lockfile
pnpm run build:tokens
pnpm run build:packages
pnpm --filter @oods/mcp-server run build
pnpm --filter @oods/mcp-bridge run build
node scripts/runtime/third-party-notices.mjs --check
node scripts/runtime/client-configs.mjs --check
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
  --work-dir "$forge_runtime_tmp/work" \
  --final

tar -xzf "$forge_runtime_tmp/out/forge-runtime.tar.gz" \
  -C "$forge_extract_tmp"

node scripts/runtime/e2e.mjs \
  --extract-dir "$forge_extract_tmp" \
  --repo-root "$forge_repo_root"
```

`--final` rejects a dirty checkout, so a release archive always names a commit
that exists. Omit it only for a development bundle; its manifest then records
`dirty: true` and the hash of the working-tree status.

`assemble.mjs` produces four inspection artifacts:

- `forge-runtime.tar.gz`: the runtime archive. It is determinism-certified only
  when `archivePacking.determinismCertified` is `true` in the manifest.
- `forge-runtime.tar.gz.sha256`: the conventional detached archive-digest
  sidecar.
- `forge-runtime.manifest.json`: the detached inspection manifest. It retains
  the embedded payload metadata and adds `archive {file, byteSize, sha256}`
  after packing.
- `runtime-sbom-lite.json`: the pnpm-lock-derived production closure, also
  present at the bundle root.

The embedded manifest cannot contain the digest of the archive that contains
that manifest: changing the digest field would change the archive and require
a new digest forever. It therefore carries `payloadTreeSha256`, which covers
the staged payload, and `archiveSha256File`, which points to
`forge-runtime.tar.gz.sha256`. The detached manifest adds the archive filename,
measured byte size and SHA-256; the embedded manifest retains only payload
metadata. Their bytes therefore differ.

The manifest also records the source commit and source commit date, package
versions, registry and structured-data pins, the built token-tree pin, the
brand-source tree digest (`brandSourceTree`), the SHA-256 of each terms file
(`terms`: `LICENSE`, `COMMERCIAL.md`, `THIRD-PARTY-NOTICES.md`), the Node
floor, the package layout and the third-party closure count. Assembly refuses
to run when `THIRD-PARTY-NOTICES.md` is stale against the lockfile.

Verify the detached archive digest with `sha256sum --check
forge-runtime.tar.gz.sha256` on Linux or `shasum -a 256 -c
forge-runtime.tar.gz.sha256` on macOS.

The assembler creates a synthetic workspace, preserves the repository's
workspace-link policy, and performs its production-only install there with
`--no-frozen-lockfile --no-optional --config.auto-install-peers=false`; the
synthetic importer is not the repository importer. Peer requirements are
supplied by their consumers, so peer-only lockfile resolutions are excluded
from the bundle SBOM. The current lock-derived third-party closure is 315
packages. Assembly derives this count once from the lock and requires the
installed closure, SBOM, notices and manifest to agree with that value. The
repository install remains `pnpm install --frozen-lockfile`, and assembly
hashes `pnpm-lock.yaml` before and after to prove the source lock did not
move.

Assembling twice into distinct output and work directories and comparing the
two detached sidecars proves the archive reproduces:

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

The deterministic archive step is certified with GNU tar (`gtar` on macOS,
`tar` on Linux). When GNU tar is unavailable, the assembler uses bsdtar's
restricted-pax format so local pack-twice checks remain stable without
unrestricted-pax `ctime` headers. Its manifest then sets
`archivePacking.determinismCertified` to `false`; that bundle can be extracted
and exercised locally, but it is not a release artifact.

## What the archive contains

- The thirteen runtime workspaces with their `package.json` and built runtime
  output: `mcp-server`, `mcp-adapter`, `mcp-bridge`, `tokens`, `viz-core`, `viz-render`,
  `a11y-tools`, `artifacts`, `release-utils`, `component-contracts`,
  `component-styles`, `components-react`, and `components-vue`. The component
  contracts registry ships as package data; the MCP server directly loads its
  capability baseline plus the React/Vue readiness evidence through public
  JSON subpaths. The adapter contributes only `index.js`, `sanitize-schema.js`,
  `mcp-apps.js`, `tool-descriptions.json`, and its `package.json`.
- The production dependency closure installed for the MCP server, adapter and bridge.
- `configs/agent/policy.json`, required by the bridge. Missing policy refuses
  startup with `BRIDGE_POLICY_MISSING`; no substitute tool roster is used.
- Top-level runtime registry data: `domains/`, `objects/`, `schemas/`, and
  `traits/`.
- `artifacts/structured-data/` and
  `docs/integration/stage1-entity-aliases.json`.
- Built token output under `packages/tokens/dist/`, including the compiled
  brand A/B CSS and the legacy `dist/ts/tokens.ts` output.
- The brand documents `brand.apply` reads: `packages/tokens/src/tokens/brands/`
  (`A` and `B`, each with `base.json`, `dark.json` and `hc.json`). No other
  token source, palette generator or token build script ships.
- `packages/mcp-server/dist/registry/readiness-attestation.v1.json`, generated
  during assembly from host-resolved React/Vue evidence references. Each reference
  records its hash and evidence class, and the attestation binds those claims to
  all shipped first-party package bytes. Generation verifies it before accepting
  readiness without host source or test files.
- The terms at the archive root: `LICENSE` (PolyForm Noncommercial 1.0.0 with
  the Required Notice), `COMMERCIAL.md` and the generated
  `THIRD-PARTY-NOTICES.md`, each byte-identical to the repository copy and
  recorded in the manifest.
- `forge-runtime.manifest.json` and `runtime-sbom-lite.json`.

The `packages/<workspace>/dist` layout is load-bearing. Production modules
resolve `REPO_ROOT` by walking up from those dist locations, so flattening a
workspace or using the adapter's adjacent fallback is unsupported. Assembly
prunes `.map`, `.test.` and source `.ts` files inside `packages/*/dist`, while
keeping `.d.ts` declarations and `dist/ts/*.ts` built token outputs.
Tracked TypeScript assets elsewhere in the boundary remain present; in
particular, `.ts` files under `traits/` are data inputs, not build debris.

## What the archive never contains

The archive never contains a `cmos/` directory, planning inputs, consumer
fixtures, intake data, `stories/`, tests, or source code beyond the brand
documents named above. Three independent boundary checks make the distinction
enforceable:

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

The runtime's root-relative reads and their disposition in the archive:

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
| `packages/tokens/src/tokens/brands/`                                     | Brand documents read by `brand.apply`                                | Included                                 |
| `packages/mcp-server/dist/schemas/`                                      | Tool wire schemas and relocated component schema                     | Included inside the server dist          |
| `packages/mcp-server/dist/security/`                                     | Server policy and redaction patterns                                 | Included inside the server dist          |
| `configs/agent/policy.json`                                               | Required bridge policy                                               | Included                                 |
| `packages/mcp-server/dist/registry/readiness-attestation.v1.json`          | Hash-bound portable React/Vue readiness                              | Generated at assembly                    |
| `packages/component-contracts/registry/`                                 | Component capability records used by target-aware code generation    | Included                                 |
| `packages/components-{react,vue}/evidence/`                              | Target readiness records loaded through public package subpaths      | Included                                 |
| `LICENSE`, `COMMERCIAL.md`, `THIRD-PARTY-NOTICES.md`                     | The terms                                                            | Included, recorded in the manifest       |
| `stories/`                                                               | Optional catalog stories facet                                       | Not shipped; that facet degrades to `[]` |
| The rest of `packages/tokens/src/`, `packages/tokens/scripts/`, `apps/explorer/src/` | Token rebuilding, palette generation and host diagnostics | Host repository only                     |

## Tool surface and portable outcomes

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

All nineteen advertised tools execute from the extracted archive. `design.preview` runs through the preview host: the bridge hosts it in-process under `/preview/`, and the stdio adapter starts one on 127.0.0.1 the first time the tool is called and stops it with the adapter. The tool returns one URL per framework; the page mounts the generated app with the prebuilt React, Vue and foundation runtimes shipped in `packages/mcp-bridge/dist/preview-runtime/`, and each artifact is compiled at request time with the bundled esbuild binary (macOS arm64 and x64, Linux x64 and arm64; `@vue/compiler-sfc` for Vue). Without a reachable host, on a platform without a bundled binary, or when the host reads another schema store root, the outcome is retryable `OODS-N021`. The adapter retains structured native failures as JSON text content shaped `{error:{...native,retryable}}` with `isError:true`, so the native code is preserved at `tools/call` and a client can tell a dependency limit from a failure.

`brand.apply` executes from the archive because the brand documents ship. `apply:false` previews the delta against the shipped brand source. `apply:true` from the archive emits the review kit under the run directory (the three applied theme snapshots, `specimens.json`, `variables.css` and `diagnostics.json`) and skips the two host-only steps, the source write and the token build; the receipt records `sourceWritten:false`, `build:null` and `portable:{sourceWrites:"skipped",tokenBuild:"skipped"}`, and the shipped brand source and built output stay byte-identical. `OODS-N020` is returned only when the brand-source directory is missing.

## E2E sequence and lifecycle

`scripts/runtime/e2e.mjs` verifies the embedded manifest, the SBOM, the terms files against the manifest and the repository copies, the shipped brand directories, and the adapter version, then initializes the extracted adapter and checks `tools/list` against the extracted registry. The primary adapter process makes 30 calls across all 19 advertised tools. `design.preview` runs against the preview host the adapter starts for it: the result names the host's port, both frameworks compile, the page and the compiled modules are fetched from that port, and the port must be closed once the adapter has exited. It retains the four twin dashboard renders, the certification positive and negative pillars, the real token export, both React and Vue generation, the saved-schema and mapping round trips, and the two `brand.apply` calls: the preview, then an apply whose review kit lands under the extraction's `artifacts/current-state/` while the brand-source digest is proven unchanged.

Every dashboard HTML hash covers returned bytes; repeats compare deterministic response projections while excluding only the three ephemeral reference fields. Certification retains all four positive pillars and the typed negative code.

Closing stdin must stop the adapter cleanly. A second process initializes, calls health, and exits on SIGTERM without SIGKILL. Total: 31 adapter calls across two processes. The E2E separately launches the bundled bridge on an owned loopback port, checks its stamped revision against the manifest, lists the same 19 tools, renders one chart through `POST /run` with the same SVG hash the adapter produced, and opens one composed screen through `design_preview`, fetching its page and compiled modules from the bridge's own port. It exercises the token transcript, mapping, saved-schema and brand review-kit writers inside owned extraction roots, cleans up, and proves the complete tree is restored.

The retained receipt of the run behind the current tool ledger is named by `portableExecution.path` in `packages/mcp-server/registry/tool-capability-ledger.v1.json`; `docs/mcp/Tool-Specs.md` renders each tool's portable outcome from it.

## Reference applications from the bundle

The runtime-cell harness has a bundle mode for 42 fixed cells: Organization,
Subscription and User × card, detail, form, inline, list, timeline and workflow
× React and Vue. Supply both the extracted directory and its original archive;
the extraction must be outside the repository. Use the pinned Linux Playwright
browser environment the host runtime sweep uses.

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

The first bundle sweep (Sprint 196 m03) passed all 42 cells with host artifact hash equality;
its recorded identity and retained evidence are in the
[m03 receipt index](../../artifacts/product-reality/sprint-196/m03/README.md).

## Bridge entry point

From any working directory, start the bridge from its extracted package:

```sh
MCP_BRIDGE_PORT=4466 node "$forge_extract_tmp/packages/mcp-bridge/dist/server.js"
```

The bridge spawns `packages/mcp-server/dist/index.js` from the same bundle.
Its `/health` revision is stamped at assembly from the manifest source commit
and structured-data hash; runtime startup never calls git. `/artifacts/` serves
the parent of the server policy's resolved `artifactsBase`, and `/runs` reads
that exact run directory. `/preview/` serves the running-app preview: `/preview/status`, `/preview/<key>?framework=react|vue&brand=A|B&theme=light|dark|hc`, the compiled module at `/preview/<key>/module.js` and the prebuilt runtimes under `/preview/runtime/`. SIGINT or SIGTERM closes both bridge and native child.

## Persistence contract

The bundle supports read-only use without creating files. Calls that opt into
state changes use these real locations:

| Writer                                       | Default location and override                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy-governed run bundles                  | `<bundle-root>/artifacts/current-state/<UTC-date>/...`, resolved from `packages/mcp-server/dist/security/policy.json`. There is no environment override for `artifactsBase`. |
| `schema` and schema-writing pipeline actions | `.oods/schemas` below the adapter's native-server cwd, `packages/mcp-server/`. Set `MCP_SCHEMA_STORE_ROOT` and/or `MCP_SCHEMA_STORE_DIR` to relocate it.            |
| `design.compose` and `design.preview`        | `.oods/compositions/<compositionId>/versions/<n>.json` beside the schema store (the same two variables relocate it): every composition version with its inputs, schema, parent, operation, head, and the artifacts, model and measurements design.preview and the running page attach; edits from the page or `design.preview` action edit record new versions here; read by the preview host. |
| `code.generate` and `repl` (`payloadMode: file`) | `.oods/payloads/<tool>-<digest>/` beside the schema store (the same two variables relocate it): the artifact files plus `artifact.json`, or `index.html` (`fragments.json` and `css.json` for fragments); the response carries only the file references. Inline is the default and unchanged. |
| `map`                                        | `artifacts/structured-data/component-mappings.json`, or `MCP_MAPPINGS_PATH`; apply conflicts write below `<bundle-root>/.oods/conflicts/`.                          |
| `tokens.build`                               | Policy run bundles containing five artifacts copied or resolved from shipped dist outputs. Portable calls never rebuild or rewrite `packages/tokens/dist`.           |
| `brand.apply`                                | Policy run bundles under `review-kit/brand.apply/` holding the applied theme snapshots, specimens, `variables.css` and diagnostics. Portable calls never rewrite `packages/tokens/src/tokens/brands` or `packages/tokens/dist`. |
| Legacy file telemetry                        | `MCP_TELEMETRY_DIR` selects a JSONL destination, but `packages/mcp-server/src/telemetry/log.ts` has zero production importers. It performs no runtime writes today.  |

## Environment contract

The native server and bridge load `<bundle-root>/.env` through dotenv when the
file is present. None of these 28 operational variables is required by the E2E;
an absent variable uses the stated default or leaves the optional feature
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
| `MCP_RUNTIME_CELLS_PATH`    | Optional path to a validated runtime-cell ledger; default is the canonical registry, then shipped dist registry. |
| `MCP_RELEASE_CELLS_PATH`    | Optional path to a validated 42-cell release ledger; default is the canonical registry, then shipped dist registry. Invalid or absent proof degrades health. |
| `MCP_MAPPINGS_PATH`         | Mapping-document path; relative values resolve from the bundle root.               |
| `MCP_TELEMETRY_DIR`         | Legacy JSONL path; its writer currently has no production importer.                |
| `MCP_BRAND_SOURCE_ROOT`     | Host-only override of the tokens package root read by `brand.apply` and `tokens.build`; unset in the bundle. |
| `OODS_NODE_PATH`            | Node executable used by the adapter; default `process.execPath`.                   |
| `OODS_PREVIEW_HOST_URL`     | Preview host the native server uses when neither the bridge nor the adapter passes one with the request; unset in the bundle. |
| `ESBUILD_BINARY_PATH`       | esbuild binary override; the preview host sets it from the shipped `@esbuild/<platform>` package when unset. |
| `OODS_TAILWIND_TOKENS_PATH` | Tailwind-token file override for code generation.                                  |
| `OODS_OTLP_ENDPOINT`        | Enables OTLP/HTTP trace export when set.                                           |
| `OODS_OTLP_SERVICE_NAME`    | OODS-specific service-name override.                                               |
| `OODS_OTLP_HEADERS`         | Comma-separated OTLP exporter headers.                                             |
| `OTEL_SERVICE_NAME`         | Standard OpenTelemetry service name; takes precedence over the OODS-specific name. |
