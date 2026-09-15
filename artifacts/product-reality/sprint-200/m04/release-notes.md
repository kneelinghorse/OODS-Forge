OODS Forge is a design-system engine you talk to through MCP: it composes screens from objects, traits and contexts, generates React and Vue applications from them, and certifies what it generated. This first runtime release is for individuals who want to try it and say what they think. It is licensed under PolyForm Noncommercial 1.0.0.

## What is in this release

- `forge-runtime.tar.gz` — the runtime: MCP server, stdio adapter, HTTP bridge, tokens, component packages, registry data and the production dependency closure (283 third-party packages). Nothing is installed from npm.
- `forge-runtime.tar.gz.sha256` — the SHA-256 of the archive.
- `forge-runtime.manifest.json` — the source commit, package versions, Node floor and payload digests.
- `runtime-sbom-lite.json` — every third-party package with its integrity hash.
- `THIRD-PARTY-NOTICES.md` — their licenses.
- `install.md` — the install steps below, in full.

## Install

1. Verify: `shasum -a 256 -c forge-runtime.tar.gz.sha256` (macOS) or `sha256sum --check forge-runtime.tar.gz.sha256` (Linux).
2. Extract: `mkdir -p ~/forge-runtime && tar -xzf forge-runtime.tar.gz -C ~/forge-runtime`. Node 20.11.1 or newer must be on the PATH.
3. Connect one client, using the absolute path of the directory you extracted into:
   - Claude Code: `claude mcp add forge -- node /path/to/forge-runtime/packages/mcp-adapter/index.js`, then `claude mcp get forge`.
   - Claude Desktop: add the `forge` server to `claude_desktop_config.json` with command `node` and that same `index.js` path.
   - Cursor: the same block in `.cursor/mcp.json`.
4. Ask the assistant to run `health`; you should see 19 tools. Then `design.compose` an intent such as "subscription detail page" and `code.generate` it for React or Vue.

`install.md` carries the exact configuration blocks for all three clients and the optional settings.

## License

PolyForm Noncommercial 1.0.0: free for personal, research, educational, nonprofit and government use. Any commercial use, including use inside a company, needs the commercial license described in `COMMERCIAL.md` inside the archive.

## Feedback

Problems, questions and "this did not read right" notes: https://github.com/kneelinghorse/OODS-Forge/issues/new/choose
