# Portable runtime — Gate 1

Gate 1 is a private, non-hosted OODS Forge runtime bundle for named
consumers. Forge builds the bundle and hands over a local tarball plus its
verification files; the consumer runs it. This is not a public npm publish, a
GitHub release, an OCI image, an MCPB package, or a registry listing. Those
distribution choices remain Gate 2 work.

## Build and verify

CI uses Node 24 and pnpm 9.12.2. The supported runtime floor is Node
`>=20.11.1`, which is the highest declared floor among the twelve bundled
workspaces. Gate 1 does not run a separate Node 20.11.1 CI cell.

Build the repository before assembly:

```sh
pnpm install --frozen-lockfile
pnpm run build:tokens
pnpm run build:packages
pnpm --filter @oods/mcp-server run build
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
- `forge-runtime.manifest.json` — byte-identical to the manifest embedded at
  the bundle root.
- `runtime-sbom-lite.json` — the pnpm-lock-derived production closure, also
  present at the bundle root.

The embedded manifest cannot contain the digest of the archive that contains
that manifest: changing the digest field would change the archive and require
a new digest forever. It therefore carries `payloadTreeSha256`, which covers
the staged payload, and `archiveSha256File`, which points to
`forge-runtime.tar.gz.sha256`. It does not claim to self-contain the archive
hash. The manifest also records the source commit and source commit date, package
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
from the bundle SBOM. The resulting lock-derived and installed third-party
closure is exactly 245 packages. The repository install remains
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
unavailable, the assembler uses local macOS bsdtar to produce a usable bundle
whose manifest sets `archivePacking.determinismCertified` to `false`; that
bundle can be extracted and exercised locally, but it is not the pack-twice
certification artifact.

## Accepted consumer requirements

This is the Gate 1 disposition of the eight requirements accepted in request
`f55e6865`.

| Item                                              | Gate 1 disposition                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Pinned runtime artifact and software inventory | **Satisfied.** The private handoff includes the tarball, checked-out commit, detached SHA-256, root `LICENSE`, and `runtime-sbom-lite.json`. The SBOM-lite records the pnpm-lock v9 production closure used by this bundle; OCI is out of scope.                                                                                                                                                                                                   |
| 2. Runtime version contract                       | **Satisfied.** The manifest declares `nodeFloor` `>=20.11.1` and `ciNode` 24. CI runs Node 24; a Node 20.11.1 matrix cell is not claimed. pnpm is pinned to 9.12.2 for the build.                                                                                                                                                                                                                                                                  |
| 3. Adapter-only operation                         | **Satisfied by construction.** `packages/mcp-bridge` is not in the closure. The E2E launches only `packages/mcp-adapter`, which lazily starts the native server over stdio.                                                                                                                                                                                                                                                                        |
| 4. Runtime data and planning/token assets         | **Satisfied under the publish boundary below.** Runtime registry data, built token output, and structured data ship. Planning means the relocated compiled component schema, not `cmos/`. Brand source, named fidelity fixtures, and stories do not ship.                                                                                                                                                                                          |
| 5. Path portability                               | **Satisfied.** CI extracts below `$RUNNER_TEMP`, outside `$GITHUB_WORKSPACE`, starts from that arbitrary location, rejects developer absolute paths, and does not rely on Node walking up into the checkout for dependencies.                                                                                                                                                                                                                      |
| 6. Consumer E2E                                   | **Satisfied and extended.** The primary process initializes, derives the advertised count from the registry, then performs the exact eight-`tools/call` consumer sequence across four tool families. A restarted process makes one additional native `health` call, for nine tool calls across both processes. The E2E verifies render hashes, certification, the negative error, a closed loopback health port, and an unchanged extraction tree. |
| 7. Lifecycle, persistence, and environment        | **Satisfied with the corrections below.** Readiness is the first successful `health` `tools/call`, not `tools/list`. The E2E measures shutdown on stdin close and restart/termination behavior. Persistent writers and all 21 operational environment variables are explicit below.                                                                                                                                                                |
| 8. Freshness metadata                             | **Satisfied.** `forge-runtime.manifest.json` is a bundle-root file and an adjacent inspection copy. It is not a `health` response field. A future public distribution may expose a different Gate 2 freshness surface.                                                                                                                                                                                                                             |

## Publish boundary

The Gate 1 archive contains:

- The twelve runtime workspaces with their `package.json` and built runtime
  output: `mcp-server`, `mcp-adapter`, `tokens`, `viz-core`, `viz-render`,
  `a11y-tools`, `artifacts`, `release-utils`, `component-contracts`,
  `component-styles`, `components-react`, and `components-vue`. The component
  contracts registry ships as package data; the MCP server directly loads its
  capability baseline plus the React/Vue readiness evidence through public
  JSON subpaths. The adapter contributes only `index.js`, `sanitize-schema.js`,
  `tool-descriptions.json`, and its `package.json`.
- The production dependency closure installed for the MCP server and adapter.
- Top-level runtime registry data: `domains/`, `objects/`, `schemas/`, and
  `traits/`.
- `artifacts/structured-data/` and
  `docs/integration/stage1-entity-aliases.json`.
- Built token output under `packages/tokens/dist/`, including the compiled
  brand A/B CSS. Token source under `packages/tokens/src/` does not ship.
- Root `LICENSE`, `forge-runtime.manifest.json`, and
  `runtime-sbom-lite.json`.

The `packages/<workspace>/dist` layout is load-bearing. Production modules
resolve `REPO_ROOT` by walking up from those dist locations, so flattening a
workspace or using the adapter's adjacent fallback is unsupported. Assembly
prunes `.map`, `.d.ts`, and `.ts` files only inside `packages/*/dist`.
Tracked TypeScript assets elsewhere in the boundary remain present; in
particular, `.ts` files under `traits/` are data inputs, not build debris.

The archive never contains a `cmos/` directory, planning inputs, consumer
fixtures, consumer intake data, brand source, `stories/`, or the bridge. Three
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
| `packages/component-contracts/registry/`                                 | Component capability records used by target-aware code generation    | Included                                 |
| `packages/components-{react,vue}/evidence/`                              | Target readiness records loaded through public package subpaths      | Included                                 |
| `stories/`                                                               | Optional catalog stories facet                                       | Not shipped; that facet degrades to `[]` |
| `packages/tokens/src/`, `packages/tokens/scripts/`, `apps/explorer/src/` | Brand application, token rebuilding, and host diagnostics            | Host repository only                     |

## Tool surface and host-only calls

The default adapter advertises the 20 auto tools, in registry order:

```text
tokens.build
structuredData.fetch
brand.apply
brand.intake
catalog.list
code.generate
design.compose
pipeline
health
registry.snapshot
viz.compose
viz.render
dashboard.render
artifact.certify
fidelity.preview
map
schema
object
repl
review
```

Advertisement is not a promise that every host-repository mutation is
portable. `brand.apply`, `tokens.build`, and `fidelity.preview` are
**host-repository-only** because Gate 1 intentionally omits brand source, the
token build script/source inputs, and fidelity's named fixtures. The archive
does include compiled tokens, so render and certification calls consume the
built result. `catalog.list` remains available, but its unshipped `stories/`
facet returns an empty list.

On-demand tools are not part of the 20-tool default surface. Setting
`MCP_TOOLSET=all` advertises them, but Gate 1 does not certify their host-only
fixture and release workflows.

## E2E sequence and lifecycle

`scripts/runtime/e2e.mjs` talks to the bundled adapter using MCP stdio. It
performs `initialize`, then `tools/list`, whose count is derived from
`registry.auto` instead of duplicating a 20-name pin. The first readiness
probe is the `health` tool call because the adapter serves `tools/list` before
it lazily spawns the native server.

The primary process then makes exactly eight `tools/call` operations across
four tool families:

1. `health` once, requiring an OK registry with no warnings.
2. `dashboard_render` with the two-panel fixture and an exact repeat.
3. `dashboard_render` with the four-panel fixture and an exact repeat.
4. `viz_render` once, returning a normalized spec.
5. `artifact_certify` once with that normalized spec and once with the
   negative HTML-only operand, which must return `OODS-V126`.

That is one health call, four dashboard calls, one visualization call, and two
certification calls. The render checks require each `outputHtmlHash` to equal
the SHA-256 of its HTML. Every response must carry the three ephemeral
`specRef`, `specRefCreatedAt`, and `specRefExpiresAt` fields; the script excludes
only those fields from its deterministic response projection, then requires
the projected response, HTML bytes, and HTML hash to repeat identically. It
also requires the repeated `specRef` handles to differ. The positive
certification must pass all four pillars. The loopback health port remains
closed because `MCP_HEALTH_PORT` defaults to `0`, and the extraction tree hash
must remain unchanged during this read-only E2E.

The lifecycle checks are observations made by the E2E, not conclusions from
reading `index.js`: closing adapter stdin must end the adapter and its native
child cleanly. A fresh adapter process must start, make an additional native
`health` call, and then exit on SIGTERM without a SIGKILL fallback. This makes
nine `tools/call` operations across both processes while preserving the exact
eight-call primary consumer sequence.

## Persistence contract

The bundle supports read-only use without creating files. Calls that opt into
state changes use these real locations:

| Writer                                       | Default location and override                                                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy-governed run bundles                  | `<bundle-root>/artifacts/current-state/<UTC-date>/...`, resolved from `packages/mcp-server/dist/security/policy.json`. There is no environment override for `artifactsBase`.        |
| `schema` and schema-writing pipeline actions | `.oods/schemas` below the adapter's native-server cwd, `packages/mcp-server/`. Set `MCP_SCHEMA_STORE_ROOT` and/or `MCP_SCHEMA_STORE_DIR` to relocate it.                            |
| `map`                                        | `artifacts/structured-data/component-mappings.json`, or `MCP_MAPPINGS_PATH`; apply conflicts write below `<bundle-root>/.oods/conflicts/`.                                          |
| `tokens.build`                               | Policy run bundles plus a possible rewrite of `packages/tokens/dist` when applying a build. The source/build script required for that rewrite is intentionally host-only in Gate 1. |
| Legacy file telemetry                        | `MCP_TELEMETRY_DIR` selects a JSONL destination, but `packages/mcp-server/src/telemetry/log.ts` has zero production importers. It performs no runtime writes today.                 |

The E2E intentionally exercises none of these writers and proves that the
extracted tree is unchanged.

## Environment contract

The native server loads `<bundle-root>/.env` through dotenv when the file is
present. None of these 21 operational variables is required for the Gate 1
E2E; an absent variable uses the stated default or leaves the optional feature
disabled.

| Variable                    | Purpose / default                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `MCP_TOOLSET`               | `default` selects the 20 auto tools; `all` adds all on-demand tools.               |
| `MCP_EXTRA_TOOLS`           | Comma-separated on-demand tools added to the default surface.                      |
| `MCP_ROLE`                  | Policy role; default `designer`.                                                   |
| `MCP_USER`                  | Transcript identity; default `system`.                                             |
| `MCP_HEALTH_PORT`           | Optional loopback health listener; default `0` disables it.                        |
| `MCP_BRAND`                 | Health/token context brand; default `A`.                                           |
| `MCP_THEME`                 | Health/token context theme; default `light`.                                       |
| `MCP_CODE_CONNECT_PATH`     | Optional code-connect artifact override.                                           |
| `MCP_STRUCTURED_DATA_DIR`   | Optional structured-data root override.                                            |
| `MCP_SCHEMA_STORE_ROOT`     | Project root used by the schema store.                                             |
| `MCP_SCHEMA_STORE_DIR`      | Schema-store directory, relative to its root unless absolute.                      |
| `MCP_SCHEMA_REF_TTL_MS`     | In-memory schema/value-ref lifetime; default 30 minutes.                           |
| `MCP_SCHEMA_REF_MAX`        | Maximum in-memory schema/value refs; default 250.                                  |
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
