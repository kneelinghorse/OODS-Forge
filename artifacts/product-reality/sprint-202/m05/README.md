# s202-m05 — From the bundle into Claude Desktop and Cursor

Builder self-certified: **false**. Code and docs were committed at `71f90440a` on `codex/sprint-202-conversation-preview`. At that head:
1. the server and bridge dists were rebuilt;
2. the archive was assembled with `--final` from the clean tree;
3. its E2E and the Linux proof ran against it.

`run-bundle.sh` is the recipe. Its logs were written outside the worktree and copied here, and the receipts were committed afterwards.

## What is in the tree

### The install path

`scripts/runtime/client-configs.mjs` writes `docs/runtime/install.md` and `configs/agents/{claude-desktop,claude-code,cursor}.stdio-mcp.json`, and `--check` is fresh. Section 4 of `install.md` gains "The design preview inside the conversation":

- A client that renders MCP Apps shows `design.preview` as the running app, where the person edits, compares, accepts and requests changes. Any other client gets the text result, with links to the preview the adapter serves on 127.0.0.1.
- **Claude Desktop** renders the app from a local server only with Developer Mode on. After the runtime is replaced, it needs Reload MCP Configuration, because it keeps the tool list and the app it fetched until then.
- **Cursor** renders MCP Apps from version 2.6.
- **Claude Code** shows the text result.
- `forge` is registered directly, beside any hub entry, not behind it.
- The adapter's stderr line names the client and whether the extension was negotiated.

Section 6 and every snippet's `env` gain `OODS_MCP_APPS_UI`. Each snippet still registers exactly one server, `forge`. Every host fact comes from the Sprint 202 research (memo §2, decision 7), and nothing beyond it is claimed.

### The archive's E2E

In `scripts/runtime/e2e.mjs`, the primary client now initializes as an MCP Apps host would: protocol `2025-06-18`, with `mimeTypes` under `capabilities.extensions["io.modelcontextprotocol/ui"]`. It must see:
- the capabilities `{tools, resources, extensions}`;
- `_meta.ui.resourceUri` (and `ui/resourceUri`) on `design_preview` alone;
- `resources/list` naming exactly the shipped app under its revision URI;
- `resources/read` returning `packages/mcp-bridge/dist/preview-app/app.html` byte for byte, checked against its build manifest;
- the negotiation line on stderr.

The `design_preview` call the E2E already made also proves that `structuredContent` equals the text result plus the resource URIs, and it reads each resource through `resources/read`:
- both frameworks' compiled modules, in the inline-script form: registered on `__oodsModules`, bound to `globalThis.__oodsRuntime`, with no imports;
- their styles;
- the version record, which names the bundle head;
- the lineage list: one version, nothing accepted.

The restart client declares nothing. It must get no `_meta.ui`, and stderr must say `not advertised; preview app kept as the text result`. `OODS_MCP_APPS_UI` joins the forbidden child environment, and the call counts stay 30 and 31.

### The rest

- **The Linux proof** (`scripts/product-reality/s202-linux-preview-proof.mjs`) makes the same assertions from an extracted archive with no repository: 20 named checks and one JSON receipt.
- **The runbook** (`docs/runtime/portable-runtime.md`) now covers:
  - the MCP Apps path under the tool surface;
  - the E2E sequence;
  - `OODS_MCP_APPS_UI` in the environment contract. The contract now lists 30 variables. The table already had 29 rows under a stated 28, and the count was corrected on the same line.
- **Regenerated:** the tool capability ledger (the E2E's `callTool` line references and the README receipt pointers) and `docs/mcp/Tool-Specs.md`.
- **`hosts/README.md`** gives the receipt shape for Derek's Claude Desktop and Cursor runs. No run is claimed, and the folder holds only that README.

## Receipts

### `bundle/`: the final archive on this machine

- **The archive.** `forge-runtime.tar.gz` at `71f90440a`, `dirty: false`:
  - 55,909,078 bytes, sha256 `8236cda849fec3bc0469a8cdf7ef97231ffcb76bcc00648edb01d3780ae593f1`;
  - 315 third-party packages, unchanged since m02;
  - 20,947 payload entries, payload tree sha256 `b1318337842990ef194d72dbbb67001068a54af904eb7f5f20f0634e6918eb60`.

  See `portable-manifest.json`, `portable-archive.sha256` and `portable-assemble.log`.
- **The rebuilt dists.** `server-build.log` and `bridge-build.log` show both rebuilt at the head first. A version's head comes from the server's own `dist/build-revision.json`, and the assembler rewrites only the bridge's.
- **`e2e-host.json`** (Node v24.6.0): `status: pass`.
  - 19 tools with 19 passing outcomes and 0 typed; 30 calls in the primary process and 1 after the restart.
  - The extraction tree was restored: `f67884da…` before and after.
- **The negotiated client:**
  - capabilities `{"extensions": {"io.modelcontextprotocol/ui": {}}, "resources": {}, "tools": {}}`;
  - the app `ui://oods-forge/preview/87de86c9408e/app.html`, 2,105,938 bytes, read back equal to the shipped file;
  - stderr: `[oods-mcp-adapter] client forge-portable-runtime-e2e 0.1.0 (protocol 2025-06-18); MCP Apps io.modelcontextprotocol/ui: negotiated (mimeTypes ["text/html;profile=mcp-app"]); preview app offered on design_preview; client capability keys: extensions`.
- **Its `design_preview` call** (`cmp-5b1ebe21c0b4` v1, the fixture operand's composition):
  - resource URIs scoped `?brand=A&theme=light`;
  - React module 5,953 bytes and Vue module 9,785 bytes, with empty styles;
  - the record's head `71f90440a1e313aade684e2f575fd6ba3ec42638`;
  - lineage of one version, `accepted: null`.
- **The restart client:** stderr `[oods-mcp-adapter] client forge-portable-runtime-e2e 0.1.0 (protocol 2024-11-05); MCP Apps io.modelcontextprotocol/ui: not advertised; preview app kept as the text result; client capability keys: none`, and no tool carried `_meta`.
- **Other files.** `status.txt` records every step with exit 0 and its time. The E2E's stderr was empty and is not kept.

### `linux/`: the same archive in the pinned container

- **Environment.** Container `forge-s197-playwright`, image `mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a`, linux-arm64, Node v22.20.0 (`environment.txt`).
- **Commands**, from `run-bundle.sh`:

  ```sh
  docker exec forge-s197-playwright sh -c 'rm -rf /tmp/forge-s202 && mkdir -p /tmp/forge-s202/extract'
  docker cp <out>/forge-runtime.tar.gz forge-s197-playwright:/tmp/forge-s202/forge-runtime.tar.gz
  docker exec forge-s197-playwright sha256sum /tmp/forge-s202/forge-runtime.tar.gz
  docker exec forge-s197-playwright tar -xzf /tmp/forge-s202/forge-runtime.tar.gz -C /tmp/forge-s202/extract
  docker cp scripts/product-reality/s202-linux-preview-proof.mjs forge-s197-playwright:/tmp/forge-s202/s202-linux-preview-proof.mjs
  docker exec -w /tmp/forge-s202 forge-s197-playwright node s202-linux-preview-proof.mjs /tmp/forge-s202/extract > linux/preview-proof.json
  ```

  The digest inside the container equals the archive's (`commands.log`).
- **`preview-proof.json`**: `pass: true`, with all 20 checks true:
  - **Negotiation and listing:** the capabilities; `_meta.ui` on `design_preview` only; the negotiation line; exactly the app listed; the app read back equal to the shipped file.
  - **The tool result and its resources:** `structuredContent` equal to the text; the resource URIs; both modules in the inline-script form, with their styles; the record naming the bundle head; the lineage.
  - **Platform and lifecycle:** the bundled linux-arm64 esbuild reported as supported; a clean exit; the preview host's port closed after the exit; JSON-only stdout.
  - **The plain client:** no `_meta`, its not-advertised line, and a clean exit.
- **Its `design_preview` call** (`cmp-71945c64d4d3` v1, Subscription detail): React module 36,389 bytes, Vue module 52,792 bytes.

## Tests and gates

- **New:** `tests/verification/install-conversation.s202.test.ts` (2 tests). One checks the install section's host facts, the direct registration and the stderr line. The other checks each snippet's notes and `env`, and one server `forge` per snippet.
- **Gates for the resources from the archive:** the E2E and the Linux proof above.
- **Re-run green:**
  - root specs: `portable-runbook.s200` 7, `closeout-checklist.contract` 8;
  - mcp-server specs: `tool-truth.s193` 31, `tool-specs-generator.s196` 19, `portable-fixtures.s194` 1, `portable-claims.s196` 11;
  - generator checks: `client-configs --check`, `third-party-notices --check`, `s193-tool-truth --check`, `docs:tools`, `docs:claims` and `docs:api` with `--check`, and `docs:check`;
  - root `pnpm typecheck`;
  - the golden ledger `check`, verified at 215 entries; m05 moves no ledger pin;
  - the sealed Sprint 195–201 receipts, unchanged.

## Not done here

- The Claude Desktop and Cursor renders are Derek's runs, recorded by the review in `hosts/`. A reference-host or archive pass is not a host pass.
- Two carries from m04:
  - the `packages/mcp-adapter/test-s55-m03.js` verb check, 15/16 since the Sprint 201 base;
  - axe-core inside the conversation view.
- The frozen closeout archive and the five-suite capture are m06.
