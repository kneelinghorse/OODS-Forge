# OODS Foundry MCP

Production MCP server + toolchain for the OODS Foundry design system.

This repo turns the OODS design system into an agent-usable surface: a semantic catalog you can query, schemas you can validate and compose, governed token theming you can apply, and code you can generate — all through MCP tools.

Design system source of truth: https://github.com/kneelinghorse/OODS-Foundry
Design system Storybook: https://kneelinghorse.github.io/OODS-Foundry/

## Four capability pillars

Forge's flagship promise is generation plus governance across four pillars:
accuracy, fidelity, contract-determinism, and accessibility-by-construction.

### 1) Accuracy

- `artifact.certify` checks chart specifications for structural distortions and reports which accuracy rules were actually evaluated.
- Read the per-pillar verdict and findings rather than treating an overall status as a claim that every possible accuracy property was proved.

### 2) Fidelity

- `viz.render` and `dashboard.render` produce OODS-tokened chart and dashboard output; `fidelity.preview` exposes object manifests at progressively richer fidelities.
- `tokens.build` and `brand.apply` keep generated output tied to governed design-token and brand inputs.

### 3) Contract-determinism

- Rendered chart and dashboard payloads carry canonical content hashes, and `artifact.certify` independently checks deterministic chart compilation.
- `repl` (`action: validate`) checks UiSchema contracts, while `registry.snapshot` exposes a versioned view of registry state.

### 4) Accessibility-by-construction

- `viz.render` synthesizes accessible chart descriptions and can return a data table plus narrative from the same data it renders.
- `artifact.certify` reports accessibility-equivalence findings for chart IR; `repl` (`action: validate`) and on-demand `a11y.scan` cover UiSchema and token-contrast checks.

## Two repos, two roles

- **OODS Foundry (design system):** canonical traits, objects, components, tokens, release history.
- **OODS Foundry MCP (this repo):** MCP server + agent tooling built on top of the design system snapshot.

## Quick start

1. Read `agents.md` for the agent charter and workflow.
2. Install dependencies:
   ```bash
   corepack enable
   pnpm i
   ```
3. Build the MCP server:
   ```bash
   pnpm --filter @oods/mcp-server run build
   ```
4. Make a first MCP call (local CLI runner):
   ```bash
   pnpm exec tsx tools/oods-agent-cli/src/index.ts plan catalog.list '{}'
   ```
5. Connect an MCP client (Cursor/Claude/Desktop/etc) using `docs/mcp/Connections.md`.

## Project-level defaults (`.oodsrc`)

Drop a `.oodsrc` JSON file in your project root to set default options for `pipeline`, `design.compose`, and `code.generate`. Explicit tool params always win; a missing or invalid `.oodsrc` is silently ignored.

```json
{ "framework": "vue", "styling": "tailwind", "typescript": false }
```

Full schema and field reference: `docs/mcp/Tool-Specs.md` → "Project-level defaults".

## Cross-tool semantics

- `schemaRef` TTL: refs returned by `design.compose`, `viz.compose`, `pipeline`, and `schema.load` last 30 minutes. Persist them with `schema.save` when the workflow spans sessions or multiple review loops.
- `apply`: write-capable tools default to dry-run/preview behavior. Set `apply: true` only when you want artifacts written or heavy outputs returned. For `repl` (`action: render`), HTML/fragments are returned only when `apply: true`.
- `compact`: `pipeline` defaults to compact render output and returns `tokenCssRef` instead of inlining token CSS. `repl` (`action: render`) keeps full token CSS by default; opt into compact behavior with `output.compact: true`.
- Trait names: `catalog.list` and `map` use canonical structured-data trait names such as `Stateful` or `Priceable`. `object.list` accepts full or suffix-matched namespaced object traits such as `lifecycle/Stateful` or `Stateful`. `viz.compose` explicit traits use hyphenated viz IDs such as `mark-bar` and `encoding-position-x`.
- Override escape hatch: when `design.compose` returns a low-confidence selection or `reviewHint`, pin only that slot with `preferences.componentOverrides`, for example `{"object":"Subscription","context":"detail","preferences":{"componentOverrides":{"tab-0":"Card"}}}`.

## MCP tool surface (25 tools)

The counts and tool names below are derived from
`packages/mcp-server/src/tools/registry.json`; use that file as the generation
source whenever this hand-authored inventory is refreshed.

**Auto-registered (19 tools)** — available by default. The five action families are exposed as single action-parameter tools (`repl`, `map`, `schema`, `object`, `review`); select the operation via a top-level `action`, e.g. `repl({action:'render'})` or `map({action:'create'})`:

| Group | Tools |
|------|-------|
| Core design/runtime | `tokens.build`, `structuredData.fetch`, `repl` (`render`/`validate`), `brand.apply`, `catalog.list`, `health` |
| Composition + generation | `design.compose`, `viz.compose`, `viz.render`, `dashboard.render`, `pipeline`, `code.generate`, `fidelity.preview` |
| Mapping + schema persistence | `map` (`create`/`list`/`resolve`/`update`/`delete`), `schema` (`save`/`load`/`list`/`delete`) |
| Registry inspection | `object` (`list`/`show`), `registry.snapshot` |
| Certification | `artifact.certify` |
| Review | `review` (`resolve`/`chain`) |

**On-demand (6 tools)** — enable with `MCP_TOOLSET=all` or `MCP_EXTRA_TOOLS=...`:

| Tool | Purpose |
|------|---------|
| `a11y.scan` | Standalone WCAG contrast scan against design tokens |
| `diag.snapshot` | Diagnostics artifact bundle |
| `billing.reviewKit` | Billing provider comparison kit |
| `billing.switchFixtures` | Switch billing provider fixtures |
| `release.verify` | Package reproducibility verification (maintainer only) |
| `release.tag` | Git tag creation (maintainer only) |

Full contracts: `docs/mcp/Tool-Specs.md` and `docs/api/README.md`

## Repo layout (agent-first)

```
OODS-Foundry-mcp/
├── packages/mcp-server/     # MCP server and tool handlers
├── packages/mcp-bridge/     # HTTP bridge for remote agents
├── packages/mcp-adapter/    # MCP SDK adapter
├── artifacts/               # diagnostics, transcripts, structured data outputs
├── docs/mcp/                # MCP toolchain docs
├── docs/runbooks/           # task runbooks
├── cmos/                    # mission system (SQLite + CLI)
├── src/                     # design system source snapshot for MCP grounding
└── packages/tokens/         # DTCG tokens used by tools
```

## Common commands

```bash
pnpm storybook               # Start Storybook dev server
pnpm build:tokens             # Build design tokens
pnpm refresh:data             # Refresh structured data exports
pnpm local:pr-check           # Full local PR check (lint + tests + validation)
pnpm --filter @oods/mcp-server run build   # Build MCP server
pnpm bridge:dev               # Start MCP bridge in dev mode
```

## MCP docs

- `docs/mcp/Connections.md`
- `docs/mcp/Tool-Specs.md`
- `docs/mcp/Structured-Data-Refresh.md`
- `docs/mcp/Integration-Guides.md`
- [Regions Specification](docs/specs/regions.md)
- [Common Patterns and Modifiers](docs/patterns/index.md)
- [Modifier Purity](docs/patterns/modifier-purity.md)

## Need the design system itself?

Use the upstream repo for canonical architecture docs, release notes, and package usage:
https://github.com/kneelinghorse/OODS-Foundry

## License

[MIT](LICENSE)
