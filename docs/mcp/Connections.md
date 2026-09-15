# Connecting to Forge from a clone

This page is the contributor path: you have cloned the repository and want an
agent client talking to the tools you are changing. If you downloaded the
runtime release instead, follow [docs/runtime/install.md](../runtime/install.md);
it needs no build and no package manager.

Two transports exist: the **stdio adapter** (the entry point every client
uses) and the **HTTP bridge** (for clients that only speak HTTP).

## Prerequisites

```bash
pnpm install --frozen-lockfile
pnpm run build:tokens
pnpm run build:packages
pnpm --filter @oods/mcp-server run build
```

The adapter starts the native server from `packages/mcp-server/dist/`, so the
server build is required for both transports; the token and package builds are
what code generation and the health tool read.

## Stdio Adapter

`packages/mcp-adapter/index.js` wraps the native server with a spec-compliant
MCP interface over stdin/stdout. No port, token or CORS configuration is
involved. The three client configurations below are the generated snippets in
`configs/agents/` (rendered by `scripts/runtime/client-configs.mjs`); in a
clone, replace the `/path/to/forge-runtime` placeholder with the absolute path
of your checkout, because the adapter entry point is the same
`packages/mcp-adapter/index.js` in both.

### Claude Desktop (stdio)

`configs/agents/claude-desktop.stdio-mcp.json` carries the block. Put it under
`mcpServers` in the Claude Desktop configuration file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": ["/absolute/path/to/OODS-Forge/packages/mcp-adapter/index.js"],
      "env": { "MCP_TOOLSET": "all" }
    }
  }
}
```

`MCP_TOOLSET=all` is the contributor default here so the on-demand diagnostic
tools are visible; users of the release get the default surface.

### Claude Code (stdio)

`configs/agents/claude-code.stdio-mcp.json` carries the equivalent block. From
the directory you work in:

```bash
claude mcp add forge -- node /absolute/path/to/OODS-Forge/packages/mcp-adapter/index.js
claude mcp get forge
```

Add `-s user` to register the server for every project and `-e MCP_TOOLSET=all`
for the full surface.

### Cursor (stdio)

`configs/agents/cursor.stdio-mcp.json` carries the block for `.cursor/mcp.json`
at the project root:

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": ["/absolute/path/to/OODS-Forge/packages/mcp-adapter/index.js"]
    }
  }
}
```

### Adapter Environment Variables

<!-- forge-claim:adapter-environment -->
| Variable | Default | Purpose |
| --- | --- | --- |
| `MCP_TOOLSET` | `default` | `default` = 19 auto tools; `all` = all 24 tools |
| `MCP_EXTRA_TOOLS` | (none) | Comma-separated on-demand tools (e.g., `a11y.scan,diag.snapshot`) |
| `MCP_ROLE` | `designer` | Role for policy enforcement (`designer` or `maintainer`) |
| `OODS_NODE_PATH` | `process.execPath` | Override the Node binary for spawning the native server |
<!-- /forge-claim:adapter-environment -->

### Adapter Features

<!-- forge-claim:adapter-features -->
- 24 tools with human-readable descriptions and typed JSON Schema input parameters
<!-- /forge-claim:adapter-features -->
- MCP annotations (readOnlyHint, destructiveHint) derived from server policy
- Dynamic tool registration from server registry.json — zero adapter changes for new tools
- Structured error messages with actionable fix guidance for server spawn failures

### Fresh-Install Smoke Check

<!-- forge-claim:fresh-install-count -->
The fresh-install smoke check installs the adapter into a clean temp directory (outside the workspace) and confirms `tools/list` returns the full enabled tool surface. With `MCP_TOOLSET=all`, that is currently 24 tools. This catches phantom dependencies and hardcoded path regressions.
<!-- /forge-claim:fresh-install-count -->

Run it locally:

```bash
pnpm install
pnpm --filter @oods/mcp-server run build
pnpm adapter:fresh-install
```

Set `KEEP_FRESH_INSTALL=1` to preserve the temp directory for debugging.

## HTTP Bridge

For clients that only support HTTP transport (OpenAI Agents, custom integrations), use the HTTP bridge:

<!-- forge-claim:bridge-default -->
```bash
# Start the bridge with the default 19 auto tools
pnpm --filter @oods/mcp-bridge run dev

# Example: add an on-demand diagnostic tool without enabling everything
MCP_EXTRA_TOOLS=diag.snapshot pnpm --filter @oods/mcp-bridge run dev
```
<!-- /forge-claim:bridge-default -->

<!-- forge-claim:bridge-port -->
The bridge defaults to port `4466`. Set `MCP_BRIDGE_PORT=<port>` to change it. Optional: export `BRIDGE_TOKEN` to enforce the `X-Bridge-Token` header.
<!-- /forge-claim:bridge-port -->

The bridge exposes `GET /health`, `GET /tools`, `POST /run`, and `/artifacts/*`.

## Claude Remote MCP

`configs/agents/claude.remote-mcp.json` contains a ready-to-drop profile. Copy the `claudeDesktopConfig` block into `~/.claude/mcp.json` (or the per-OS Claude Desktop configuration path):

<!-- forge-claim:bridge-profile-3 -->
```json
{
  "mcpServers": {
    "oods-foundry-bridge": {
      "type": "remote",
      "url": "http://127.0.0.1:4466"
    }
  }
}
```
<!-- /forge-claim:bridge-profile-3 -->

Key points:

- The bridge serves diagnostics/read tools plus apply-gated tools. `repl.render` supports both `dry-run` and `apply` modes, while write-gated tools still require an approval header when `apply: true`.
- Because Claude Desktop omits custom headers for remote servers, keep token enforcement disabled when using this profile.
- If the default port is busy, start the bridge with `MCP_BRIDGE_PORT=<port>` and update the `url` accordingly.

## OpenAI Responses/Agents

`configs/agents/openai.agents.json` captures a thin agent profile pointing to the bridge:

<!-- forge-claim:bridge-api-url -->
- Default base URL: `http://127.0.0.1:4466`
<!-- /forge-claim:bridge-api-url -->
- Function tool definition: `diag_snapshot` (maps to internal MCP tool `diag.snapshot`)
- Request template: `POST /run` with `{"tool":"diag_snapshot","input":{"apply":false}}`

Because `diag.snapshot` is on-demand, start the bridge with `MCP_EXTRA_TOOLS=diag.snapshot` or `MCP_TOOLSET=all` before using this profile.

Integrate it by:

1. Loading the JSON and registering the function schema with the Responses/Agents API.
2. Supplying a tool-calling callback that issues the documented `POST /run` request. Forward `X-Bridge-Token` when the bridge enforces tokens, and only pass `X-Bridge-Approval` when escalating to `apply: true`.
3. Keeping `apply` set to `false` for diagnostics-only runs.

Before each session, call `GET /tools` to refresh the allowlisted names; the harness logs them for reference.

## Tool Name Translation (Workbench)

Bridge `/run` accepts either:

- External bridge names (underscores, returned by `GET /tools`): `structuredData_fetch`, `repl_render`, `diag_snapshot`
- Internal MCP names (dots, accepted for backward compatibility): `structuredData.fetch`, `repl.render`, `diag.snapshot`

Recommendation for Synthesis Workbench:

- Use the exact names returned by `GET /tools` (underscore form) when calling `/run`.
- Keep existing dot-form callers temporarily; bridge maps them to the same internal MCP tools.
- For the full endpoint/header/request/response contract, use `docs/mcp/Workbench-Integration-Contract.md`.

## Smoke Harness

`tools/agents-smoke` is a minimal TypeScript CLI that exercises the bridge end-to-end:

```bash
pnpm --filter @oods/agents-smoke run
```

Behaviour:

<!-- forge-claim:smoke-defaults -->
- Reads `BRIDGE_URL`, `BRIDGE_TOKEN`, and `BRIDGE_APPROVAL` (defaults: `http://127.0.0.1:4466`, no token, no approval).
<!-- /forge-claim:smoke-defaults -->
- Checks `/health`, lists tools, then runs `diag.snapshot` with `apply:false`.
- Prints artifact paths, bundle index, and diagnostics summary to verify the toolchain.

<!-- forge-claim:smoke-tool-count -->
If you keep the default 19-tool bridge surface, either start the bridge with `MCP_EXTRA_TOOLS=diag.snapshot` or run the harness against a default tool with `--tool structuredData_fetch`.
<!-- /forge-claim:smoke-tool-count -->

When the bridge picks an ephemeral port, start the harness with `BRIDGE_URL=http://127.0.0.1:<actualPort> pnpm --filter @oods/agents-smoke run`.
<!-- forge-claim:smoke-timeout -->
The smoke harness defaults to `BRIDGE_TIMEOUT=120000` milliseconds; increase it if diagnostics collection needs a longer wait.
<!-- /forge-claim:smoke-timeout -->

Flags:

- `--tool <name>` – choose a different bridge tool (must be allowlisted).
- `--apply` – send `apply:true` plus `X-Bridge-Approval` (requires the header value in `BRIDGE_APPROVAL`).

Use the harness after any connector or policy change to confirm the bridge still returns artifacts under `artifacts/current-state/<date>/`.

For UX flow smoke (compose → generate and schemaRef workflows), run:

```bash
pnpm --filter @oods/agents-smoke exec tsx src/ux-flow-smoke.ts
```

This writes a short report to `cmos/reports/s57-m08-smoke.md` with adapter + bridge results.
