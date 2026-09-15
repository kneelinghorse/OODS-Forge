#!/usr/bin/env node

// One template, four rendered files: docs/runtime/install.md and the three client
// config snippets under configs/agents/. Every number in the rendered text comes
// from the tool registry, the adapter manifest and the runtime manifest module,
// so the install page cannot drift from the runtime it describes.
//
//   node scripts/runtime/client-configs.mjs          # write
//   node scripts/runtime/client-configs.mjs --check  # fail when any output is stale

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  RUNTIME_ARCHIVE_FILE,
  RUNTIME_ARCHIVE_SHA256_FILE,
  PREVIEW_PLATFORMS,
  RUNTIME_MANIFEST_FILE,
  RUNTIME_PACKAGES,
  RUNTIME_SBOM_FILE,
} from "./manifest.mjs";

/** "macOS (arm64, x64) and Linux (arm64, x64)" from the shipped esbuild platform list. */
export function previewPlatformMatrix(platforms = PREVIEW_PLATFORMS) {
  const names = { darwin: "macOS", linux: "Linux", win32: "Windows" };
  const groups = new Map();
  for (const platform of platforms) {
    const [os, arch] = platform.split("-");
    if (!groups.has(os)) groups.set(os, []);
    groups.get(os).push(arch);
  }
  return [...groups.entries()].map(([os, arches]) => `${names[os] ?? os} (${arches.join(", ")})`).join(" and ");
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");

/** The one placeholder: the directory the archive was extracted into. */
export const RUNTIME_DIR_PLACEHOLDER = "/path/to/forge-runtime";
export const SERVER_NAME = "forge";
export const ADAPTER_ENTRY = "packages/mcp-adapter/index.js";
export const INSTALL_DOC = "docs/runtime/install.md";
export const CONFIG_FILES = Object.freeze({
  claudeDesktop: "configs/agents/claude-desktop.stdio-mcp.json",
  claudeCode: "configs/agents/claude-code.stdio-mcp.json",
  cursor: "configs/agents/cursor.stdio-mcp.json",
});

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relative), "utf8"));
}

function nodeFloor() {
  let floor = null;
  for (const name of RUNTIME_PACKAGES) {
    const range = readJson(`packages/${name}/package.json`).engines?.node;
    if (!range) continue;
    const match = /^>=\s*(\d+)\.(\d+)\.(\d+)$/.exec(range.trim());
    assert(match, `packages/${name}: unsupported engines.node range ${range}`);
    const tuple = match.slice(1).map(Number);
    if (!floor || tuple.some((part, index) => part !== floor[index] && part > floor[index] && tuple.slice(0, index).every((left, at) => left === floor[at]))) {
      floor = tuple;
    }
  }
  assert(floor, "no runtime package declares engines.node");
  return floor.join(".");
}

/** Everything the template renders, measured from the repository. */
export function collectInstallFacts() {
  const registry = readJson("packages/mcp-server/src/tools/registry.json");
  const adapter = readJson("packages/mcp-adapter/package.json");
  const root = readJson("package.json");
  const repositoryUrl = String(root.repository?.url ?? "").replace(/^git\+/, "").replace(/\.git$/, "");
  assert(/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(repositoryUrl), `root repository.url is not a GitHub URL: ${repositoryUrl}`);
  return {
    previewPlatforms: previewPlatformMatrix(),
    version: root.version,
    repositoryUrl,
    releasesUrl: `${repositoryUrl}/releases`,
    issuesUrl: `${repositoryUrl}/issues/new/choose`,
    autoTools: registry.auto.length,
    allTools: registry.auto.length + registry.onDemand.length,
    adapterVersion: adapter.version,
    nodeFloor: nodeFloor(),
  };
}

const serverBlock = (extra = {}) => ({
  command: "node",
  args: [`${RUNTIME_DIR_PLACEHOLDER}/${ADAPTER_ENTRY}`],
  ...extra,
});

function claudeDesktopConfig() {
  return { mcpServers: { [SERVER_NAME]: serverBlock() } };
}

function cursorConfig() {
  return { mcpServers: { [SERVER_NAME]: serverBlock() } };
}

function claudeCodeCommands() {
  return {
    add: `claude mcp add ${SERVER_NAME} -- node ${RUNTIME_DIR_PLACEHOLDER}/${ADAPTER_ENTRY}`,
    get: `claude mcp get ${SERVER_NAME}`,
    remove: `claude mcp remove ${SERVER_NAME}`,
  };
}

const ENVIRONMENT = (facts) => ({
  MCP_TOOLSET: `default (${facts.autoTools} tools) | all (${facts.allTools} tools)`,
  MCP_EXTRA_TOOLS: "comma-separated on-demand tools to add to the default surface, for example a11y.scan,diag.snapshot",
  MCP_ROLE: "designer (default) | maintainer",
  OODS_NODE_PATH: "absolute path of the Node binary the adapter should start the server with; default: the Node running the adapter",
  OODS_MCP_APPS_UI: "1 offers the design preview app to a client that did not negotiate the MCP Apps extension; default: unset, only clients that negotiated it",
});

const NOTES = (facts) => [
  `Replace ${RUNTIME_DIR_PLACEHOLDER} with the directory you extracted ${RUNTIME_ARCHIVE_FILE} into; the path must be absolute.`,
  `Node ${facts.nodeFloor} or newer must be on the PATH as node, or set OODS_NODE_PATH.`,
  `The adapter starts the bundled native server itself; nothing else needs to be built, installed or running.`,
  `Default surface: ${facts.autoTools} tools. MCP_TOOLSET=all advertises all ${facts.allTools}.`,
];

// The design preview inside the conversation (s202-m05): a client that renders MCP Apps shows design.preview as the
// running app, every other client gets the text result. Only what the Sprint 202 research recorded is stated
// (cmos/planning/forge-s202-conversation-preview-decision-memo.md §2 and decision 7).
const TEXT_FALLBACK = "otherwise the result is text with links to the preview in the browser, served by the adapter on 127.0.0.1";
const DIRECT_REGISTRATION = `Register ${SERVER_NAME} directly, beside any other entry such as an MCP hub, not behind it: the preview app reaches the conversation only when the client talks to the adapter itself or a hub passes the MCP Apps extension, the tool's _meta.ui and resources/read through.`;

export function renderConfigs(facts) {
  const desktop = {
    name: "OODS Forge — Claude Desktop (stdio)",
    summary: "Connect Claude Desktop to the OODS Forge runtime bundle through the stdio adapter.",
    transport: { type: "stdio", command: "node", args: [`${RUNTIME_DIR_PLACEHOLDER}/${ADAPTER_ENTRY}`] },
    placement: {
      macOS: "~/Library/Application Support/Claude/claude_desktop_config.json",
      windows: "%APPDATA%\\Claude\\claude_desktop_config.json",
      key: `mcpServers.${SERVER_NAME}`,
    },
    claudeDesktopConfig: claudeDesktopConfig(),
    env: ENVIRONMENT(facts),
    notes: [
      ...NOTES(facts),
      "Restart Claude Desktop after saving the file; the tools appear under the forge server.",
      `Turn on Developer Mode to see design.preview as the running app inside the conversation: Claude Desktop renders apps from a local server only with Developer Mode on; ${TEXT_FALLBACK}.`,
      DIRECT_REGISTRATION,
      "After replacing the runtime with a newer release, choose Reload MCP Configuration: Claude Desktop keeps the tool list and the preview app it fetched until then.",
    ],
  };
  const code = {
    name: "OODS Forge — Claude Code (stdio)",
    summary: "Register the OODS Forge runtime bundle with Claude Code as a local stdio MCP server.",
    transport: { type: "stdio", command: "node", args: [`${RUNTIME_DIR_PLACEHOLDER}/${ADAPTER_ENTRY}`] },
    placement: {
      scope: "local (the project you run the command in); add -s user to make it available everywhere",
      key: `mcpServers.${SERVER_NAME}`,
    },
    claudeCodeCommands: claudeCodeCommands(),
    claudeCodeConfig: { mcpServers: { [SERVER_NAME]: { type: "stdio", ...serverBlock({ env: {} }) } } },
    env: ENVIRONMENT(facts),
    notes: [
      ...NOTES(facts),
      `Pass environment with -e, for example: claude mcp add ${SERVER_NAME} -e MCP_TOOLSET=all -- node ${RUNTIME_DIR_PLACEHOLDER}/${ADAPTER_ENTRY}`,
      "Claude Code does not render MCP Apps: design.preview answers with text and links to the preview in the browser, served by the adapter on 127.0.0.1.",
    ],
  };
  const cursor = {
    name: "OODS Forge — Cursor (stdio)",
    summary: "Connect Cursor to the OODS Forge runtime bundle through the stdio adapter.",
    transport: { type: "stdio", command: "node", args: [`${RUNTIME_DIR_PLACEHOLDER}/${ADAPTER_ENTRY}`] },
    placement: { file: ".cursor/mcp.json (project) or ~/.cursor/mcp.json (all projects)", key: `mcpServers.${SERVER_NAME}` },
    cursorConfig: cursorConfig(),
    env: ENVIRONMENT(facts),
    notes: [
      ...NOTES(facts),
      "Cursor reads the file on start; reload the window after saving.",
      `Cursor 2.6 and later render MCP Apps, so design.preview can show the running app inside the chat; ${TEXT_FALLBACK}.`,
      DIRECT_REGISTRATION,
      "Reload the window after replacing the runtime with a newer release.",
    ],
  };
  return {
    [CONFIG_FILES.claudeDesktop]: `${JSON.stringify(desktop, null, 2)}\n`,
    [CONFIG_FILES.claudeCode]: `${JSON.stringify(code, null, 2)}\n`,
    [CONFIG_FILES.cursor]: `${JSON.stringify(cursor, null, 2)}\n`,
  };
}

const json = (value) => `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;

export function renderInstallDoc(facts) {
  const commands = claudeCodeCommands();
  const lines = [
    "<!-- Generated by scripts/runtime/client-configs.mjs from the tool registry, the adapter manifest and the runtime manifest module. Do not edit; run `node scripts/runtime/client-configs.mjs` and verify with `--check`. -->",
    "# Install the OODS Forge runtime",
    "",
    `This page is the user path: from a downloaded release to a working MCP server in Claude Desktop, Claude Code or Cursor. Nothing is built or installed from npm; the archive contains everything the adapter needs. Contributors who clone the repository use [docs/mcp/Connections.md](../mcp/Connections.md) instead.`,
    "",
    "## 1. What you download",
    "",
    `Every release at <${facts.releasesUrl}> carries these files:`,
    "",
    `- \`${RUNTIME_ARCHIVE_FILE}\`: the runtime (MCP server, stdio adapter, HTTP bridge, tokens, component packages, registry data and the production dependency closure).`,
    `- \`${RUNTIME_ARCHIVE_SHA256_FILE}\`: the SHA-256 of the archive.`,
    `- \`${RUNTIME_MANIFEST_FILE}\`: the source commit, package versions, Node floor and payload digests.`,
    `- \`${RUNTIME_SBOM_FILE}\`: every third-party package in the archive with its integrity hash.`,
    "- `THIRD-PARTY-NOTICES.md`: the licenses of those packages.",
    "- `install.md`: this page.",
    "",
    `Inside the archive, \`LICENSE\`, \`COMMERCIAL.md\` and \`THIRD-PARTY-NOTICES.md\` sit at the root beside the manifest. OODS Forge is licensed under PolyForm Noncommercial 1.0.0: free for personal, research, educational, nonprofit and government use; any commercial use, including use inside a company, needs the commercial license in \`COMMERCIAL.md\`.`,
    "",
    "## 2. Requirements",
    "",
    `- Node.js ${facts.nodeFloor} or newer on the PATH as \`node\` (or set \`OODS_NODE_PATH\` to a Node binary); the bundle is built and exercised on Node 24.`,
    "- macOS, Linux or Windows with a shell that can run `tar`; no package manager, no build step.",
    `- The running-app preview (\`design.preview\`) compiles generated screens with a bundled esbuild binary on ${facts.previewPlatforms}; on any other platform the other tools work and \`design.preview\` returns \`OODS-N021\` naming the platform.`,
    "- One of the clients below.",
    "",
    "## 3. Verify and extract",
    "",
    "Check the download against its digest, then extract into a directory you keep. Run these in the directory that holds the two downloaded files; the digest file names the archive by its bare file name. The archive has no top-level folder, so always extract into a directory you created for it. The commands below use `~/forge-runtime`; any absolute path works.",
    "",
    "```sh",
    `shasum -a 256 -c ${RUNTIME_ARCHIVE_SHA256_FILE}        # macOS`,
    `sha256sum --check ${RUNTIME_ARCHIVE_SHA256_FILE}        # Linux`,
    "mkdir -p ~/forge-runtime",
    `tar -xzf ${RUNTIME_ARCHIVE_FILE} -C ~/forge-runtime`,
    "```",
    "",
    "On Windows PowerShell, compare `(Get-FileHash forge-runtime.tar.gz -Algorithm SHA256).Hash` with the value in the `.sha256` file, then extract with `tar -xzf forge-runtime.tar.gz -C C:\\forge-runtime`.",
    "",
    `The extracted directory is what every configuration below calls \`${RUNTIME_DIR_PLACEHOLDER}\`. Use your absolute path (the expanded form of \`~/forge-runtime\`, or \`C:\\\\forge-runtime\` on Windows) wherever the placeholder appears. The server entry point is \`${RUNTIME_DIR_PLACEHOLDER}/${ADAPTER_ENTRY}\`; the adapter starts the bundled native server itself.`,
    "",
    "## 4. Connect a client",
    "",
    `All three clients speak to the same stdio adapter and see the same ${facts.autoTools} tools by default. The server is registered under the name \`${SERVER_NAME}\`.`,
    "",
    "### Claude Desktop",
    "",
    "Open the configuration file (create it if it does not exist):",
    "",
    "- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`",
    "- Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`",
    "",
    `Add the \`${SERVER_NAME}\` entry under \`mcpServers\` (the same block is in \`${CONFIG_FILES.claudeDesktop}\`):`,
    "",
    json(claudeDesktopConfig()),
    "",
    "Restart Claude Desktop. The tools appear under the `forge` server.",
    "",
    "### Claude Code",
    "",
    "From the project directory where you want the server available, run:",
    "",
    "```sh",
    commands.add,
    commands.get,
    "```",
    "",
    `The second command prints the registration and its status; \`Status: ✓ Connected\` means the adapter started and answered. Add \`-s user\` to the first command to register the server for every project, and \`-e MCP_TOOLSET=all\` to advertise all ${facts.allTools} tools. \`${commands.remove}\` undoes the registration. The equivalent JSON block is in \`${CONFIG_FILES.claudeCode}\`.`,
    "",
    "### Cursor",
    "",
    `Create \`.cursor/mcp.json\` in the project (or \`~/.cursor/mcp.json\` for every project) with the same block as \`${CONFIG_FILES.cursor}\`:`,
    "",
    json(cursorConfig()),
    "",
    "Reload the Cursor window. The server shows up in the MCP settings with its tools.",
    "",
    "### The design preview inside the conversation",
    "",
    "`design.preview` returns the running app of a composition. A client that renders MCP Apps shows it inside the conversation, where you edit the composition, compare two versions side by side, accept one and request changes. Any other client gets the same result as text, with links to the preview in your browser, served by the adapter on 127.0.0.1. To see it, ask for `design.preview` with `object` set to `Subscription` and `context` set to `detail`.",
    "",
    "- **Claude Desktop** renders the app from a local server only with Developer Mode on. After you replace the runtime with a newer release, choose Reload MCP Configuration: Claude Desktop keeps the tool list and the app it fetched until then.",
    "- **Cursor** renders MCP Apps from version 2.6. Reload the window after you replace the runtime.",
    "- **Claude Code** does not render MCP Apps; it shows the text result.",
    "",
    `Register \`${SERVER_NAME}\` directly, beside any other entry such as an MCP hub, not behind it. The app reaches the conversation only when the client talks to the adapter itself, or when a hub passes the MCP Apps extension (\`io.modelcontextprotocol/ui\`), the tool's \`_meta.ui\` and \`resources/read\` through to it.`,
    "",
    "When a client connects, the adapter writes one line to its standard error naming the client and whether it negotiated the extension; the client's log for the `forge` server shows whether the app was offered.",
    "",
    "## 5. First call",
    "",
    `Ask the assistant to run the \`health\` tool. A healthy answer reports \`status: ok\`, the registry counts (objects, traits, components), \`server.uptime\` in milliseconds and, under \`productReality.tools\`, the tool ledger (${facts.allTools} entries with their evidence tiers). The ${facts.autoTools} tools your client lists are the default surface, which \`health\` does not count. Then compose a screen: \`design.compose\` with an intent such as "subscription detail page", followed by \`code.generate\` for React or Vue, produces a generated application whose readiness is attested against the shipped package bytes.`,
    "",
    "## 6. Settings",
    "",
    "Environment variables are optional; every default is the documented one.",
    "",
    "| Variable | Default | Effect |",
    "| --- | --- | --- |",
    `| \`MCP_TOOLSET\` | \`default\` | \`default\` advertises ${facts.autoTools} tools; \`all\` advertises all ${facts.allTools}. |`,
    "| `MCP_EXTRA_TOOLS` | (none) | Comma-separated on-demand tools added to the default surface, for example `a11y.scan,diag.snapshot`. |",
    "| `MCP_ROLE` | `designer` | Policy role (`designer` or `maintainer`). |",
    "| `OODS_NODE_PATH` | the Node running the adapter | Node binary used to start the native server. |",
    "| `OODS_MCP_APPS_UI` | (unset) | `1` offers the preview app on `design.preview` even to a client that did not negotiate the MCP Apps extension. |",
    "",
    `Set them in the client's \`env\` block (Claude Desktop, Cursor) or with \`-e KEY=value\` on \`claude mcp add\`. The complete runtime contract, including where the bundle writes files and every other variable it reads, is in [docs/runtime/portable-runtime.md](portable-runtime.md).`,
    "",
    "## 7. Where things go",
    "",
    `Read-only use creates no files. Calls that opt into writing (\`apply: true\`, saved schemas, mappings) write under the extracted directory: \`artifacts/current-state/<date>/\` for run bundles and \`.oods/\` for saved schemas. Delete those directories to reset; the shipped files never change. To remove the runtime, remove the client entry and delete \`${RUNTIME_DIR_PLACEHOLDER}\`.`,
    "",
    "## 8. Versions and feedback",
    "",
    `This page describes runtime v${facts.version} with adapter ${facts.adapterVersion}. The manifest inside the archive names the exact source commit. Problems, questions and "this did not read right" notes go to <${facts.issuesUrl}>.`,
    "",
  ];
  return `${lines.join("\n")}`;
}

export function renderAll() {
  const facts = collectInstallFacts();
  return { [INSTALL_DOC]: renderInstallDoc(facts), ...renderConfigs(facts) };
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  try {
    const check = process.argv.includes("--check");
    const rendered = renderAll();
    const stale = [];
    for (const [relative, text] of Object.entries(rendered)) {
      const target = path.join(REPO_ROOT, relative);
      const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
      if (current === text) continue;
      if (check) stale.push(relative);
      else {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, text, "utf8");
        process.stdout.write(`wrote ${relative}\n`);
      }
    }
    if (check) {
      if (stale.length) throw new Error(`stale client configs: ${stale.join(", ")}; run node scripts/runtime/client-configs.mjs`);
      process.stdout.write(`client configs are fresh (${Object.keys(rendered).length} files).\n`);
    }
  } catch (error) {
    process.stderr.write(`client-configs: ${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
