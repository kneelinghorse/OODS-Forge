# s202-m05 hosts: the Claude Desktop and Cursor runs

This folder holds the receipts of the two real-host runs: Forge's preview app inside a Claude Desktop conversation and inside a Cursor chat, from the extracted release archive. Derek runs them and the review records them. The builder stages nothing here and claims no run. Until the review adds receipts, this README is the only file.

The reference host (the m02, m03 and m04 receipts) proves the protocol and the sandbox under the default CSP. It is not a host pass.

## The run

1. Extract the archive and register `forge` as `docs/runtime/install.md` section 4 describes: directly, beside any existing entry such as a hub, not behind it.
2. Claude Desktop: turn Developer Mode on, then save the configuration and restart. Cursor: save `mcp.json` and reload the window.
3. In a new conversation, ask for `design.preview` with `object` set to `Subscription` and `context` set to `detail`. Then, from the app:
   - make one edit;
   - compare the new version with version 1;
   - accept one version;
   - request one change.

## Receipt shape

One folder per host, `claude-desktop/` and `cursor/`, each with a `receipt.json` and its screenshots.

| Field | What it records |
| --- | --- |
| `host`, `hostVersion`, `os` | The client, its version and the operating system. |
| `developerMode` | Claude Desktop only: whether Developer Mode was on. |
| `bundle` | `archiveSha256` and `manifestCommit` of the extracted archive. |
| `registration` | The `mcpServers.forge` entry as saved, with the extracted directory written as `/path/to/forge-runtime`. |
| `negotiation` | The adapter's line from the host's log for the `forge` server. It starts `[oods-mcp-adapter] client`, followed by the client name, its version and protocol, and whether the MCP Apps extension was negotiated and the app offered. |
| `rendered` | `true` when the running app appeared in the conversation. Otherwise `false`, with what appeared instead, for example the text result. |
| `compositionId`, `versions` | The composition and the versions the run created, as `versions.json` lists them. |
| `acts` | One entry each for `edit`, `compare`, `accept` and `requestChanges`: `true` or `false` with a one-line note. |
| `accepted` | A copy of `packages/mcp-server/.oods/compositions/<id>/accepted.json` from the extracted directory after the accept. |
| `screenshots` | File names in the same folder. |
| `recordedBy` | The review session that recorded the run. |

If a host does not render the app from a local server, record that as `rendered: false` with the negotiation line. Do not retry through a proxy or a staged page.
