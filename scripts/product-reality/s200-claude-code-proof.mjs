#!/usr/bin/env node

// Proves the Claude Code install path from docs/runtime/install.md in a clean HOME:
// register the extracted runtime with `claude mcp add`, record `claude mcp get`, then
// drive the adapter over stdio with exactly the registered command, arguments and
// environment and check the advertised tool surface. Nothing touches the real HOME.
//
//   node scripts/product-reality/s200-claude-code-proof.mjs \
//     --extract-dir <extracted bundle> --receipt-dir <directory> [--archive <forge-runtime.tar.gz>] [--mission <id>]

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { McpClient } from "../runtime/e2e.mjs";
import { sha256, sha256File, verifyEmbeddedManifest } from "../runtime/manifest.mjs";
import { ADAPTER_ENTRY, SERVER_NAME, collectInstallFacts } from "../runtime/client-configs.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PROTOCOL_VERSION = "2024-11-05";

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (["--extract-dir", "--receipt-dir", "--archive"].includes(arg)) {
      const value = argv[++index];
      if (!value) throw new Error(`missing value for ${arg}`);
      parsed[arg.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = path.resolve(value);
    } else if (arg === "--mission") {
      // The mission the receipt is recorded for (Sprint 202 reuses this proof); Sprint 200's own runs keep the default.
      parsed.mission = argv[++index];
      if (!parsed.mission) throw new Error("missing value for --mission");
    } else throw new Error(`unknown argument: ${arg}`);
  }
  if (!parsed.extractDir || !parsed.receiptDir) throw new Error("usage: --extract-dir <dir> --receipt-dir <dir> [--archive <file>] [--mission <id>]");
  return parsed;
}

function run(command, args, options) {
  const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, ...options });
  return { command: [command, ...args].join(" "), exitCode: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error?.message };
}

function redact(text, replacements) {
  let output = text;
  for (const [needle, label] of replacements) output = output.split(needle).join(label);
  return output;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const extractDir = await fs.promises.realpath(args.extractDir);
  assert(!extractDir.startsWith(REPO_ROOT + path.sep), "the extraction must live outside the repository");
  const { manifest } = await verifyEmbeddedManifest(extractDir);
  const facts = collectInstallFacts();

  const home = await fs.promises.mkdtemp(path.join(os.tmpdir(), "forge-clean-home-"));
  const project = path.join(home, "scratch-project");
  await fs.promises.mkdir(project);
  const env = { ...process.env, HOME: home, XDG_CONFIG_HOME: path.join(home, ".config"), CLAUDE_CONFIG_DIR: undefined };
  delete env.CLAUDE_CONFIG_DIR;
  delete env.NODE_PATH;
  const replacements = [[home, "<clean-home>"], [extractDir, "<forge-runtime-dir>"]];
  const adapterPath = path.join(extractDir, ADAPTER_ENTRY);

  // 1. The documented registration, verbatim from install.md with the placeholder filled in.
  const addCommand = `claude mcp add ${SERVER_NAME} -- node ${adapterPath}`;
  const added = run("claude", ["mcp", "add", SERVER_NAME, "--", "node", adapterPath], { cwd: project, env });
  assert.equal(added.exitCode, 0, `claude mcp add failed: ${added.stderr || added.stdout}`);
  // 2. The documented check.
  const got = run("claude", ["mcp", "get", SERVER_NAME], { cwd: project, env });
  assert.equal(got.exitCode, 0, `claude mcp get failed: ${got.stderr || got.stdout}`);
  assert(got.stdout.includes("Status: ✓ Connected"), `claude mcp get did not report a connection:\n${got.stdout}`);
  assert(got.stdout.includes("Type: stdio"));

  // 3. Read back exactly what Claude Code stored and drive the adapter with it.
  const stored = JSON.parse(await fs.promises.readFile(path.join(home, ".claude.json"), "utf8"));
  const registered = stored.projects?.[await fs.promises.realpath(project)]?.mcpServers?.[SERVER_NAME]
    ?? stored.projects?.[project]?.mcpServers?.[SERVER_NAME];
  assert(registered, "claude mcp add did not store a local project server entry");
  assert.deepEqual({ type: registered.type, command: registered.command, args: registered.args }, { type: "stdio", command: "node", args: [adapterPath] });
  const registeredEnv = registered.env ?? {};
  const [command, ...commandArgs] = [registered.command, ...registered.args];
  assert.equal(command, "node");
  const client = new McpClient({ adapterPath: commandArgs[0], cwd: project, env: { ...env, ...registeredEnv } });
  let initialized;
  let listed;
  let health;
  try {
    initialized = await client.request("initialize", { protocolVersion: PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: "s200-claude-code-proof", version: "1" } });
    client.notify("notifications/initialized");
    listed = await client.request("tools/list", {});
    health = await client.callTool("health", {});
  } finally {
    await client.terminate("SIGTERM");
  }
  const registry = JSON.parse(await fs.promises.readFile(path.join(extractDir, "packages/mcp-server/dist/tools/registry.json"), "utf8"));
  const expectedNames = registry.auto.map((name) => name.replaceAll(".", "_"));
  assert.deepEqual(listed.tools.map((tool) => tool.name), expectedNames, "tools/list differs from the extracted registry auto order");
  assert.equal(listed.tools.length, facts.autoTools);
  assert.equal(health.status, "ok");

  // 4. Leave nothing behind but the receipt.
  const removed = run("claude", ["mcp", "remove", SERVER_NAME], { cwd: project, env });
  assert.equal(removed.exitCode, 0, `claude mcp remove failed: ${removed.stderr || removed.stdout}`);
  const claudeVersion = run("claude", ["--version"], { env }).stdout.trim();
  await fs.promises.rm(home, { recursive: true, force: true });

  const receipt = {
    schemaVersion: "1.0.0",
    mission: args.mission ?? "s200-m04",
    kind: "claude-code-install-proof",
    builderSelfCertified: false,
    executedAt: new Date().toISOString(),
    host: { platform: process.platform, node: process.version, claudeCode: claudeVersion },
    cleanHome: { created: true, removedAfterwards: true, realHomeUntouched: true },
    bundle: {
      commit: manifest.commit,
      dirty: manifest.dirty,
      payloadTreeSha256: manifest.payloadTreeSha256,
      ...(args.archive ? { archive: path.basename(args.archive), archiveSha256: await sha256File(args.archive) } : {}),
    },
    installStep: { documented: `claude mcp add ${SERVER_NAME} -- node /path/to/forge-runtime/${ADAPTER_ENTRY}`, executed: redact(addCommand, replacements) },
    claudeMcpAdd: { exitCode: added.exitCode, stdout: redact(added.stdout.trim(), replacements) },
    claudeMcpGet: { exitCode: got.exitCode, stdout: redact(got.stdout.trim(), replacements) },
    registered: { type: registered.type, command: registered.command, args: registered.args.map((value) => redact(value, replacements)), env: registeredEnv },
    stdio: {
      protocolVersion: initialized.protocolVersion,
      serverInfo: initialized.serverInfo,
      // Sprint 202: the adapter advertises resources and the MCP Apps extension; this proof's client advertises nothing, so no tool carries _meta.ui.
      capabilities: initialized.capabilities,
      toolsListed: listed.tools.length,
      tools: listed.tools.map((tool) => tool.name),
      toolsMatchExtractedRegistry: true,
      toolsWithUiMeta: listed.tools.filter((tool) => tool._meta !== undefined).map((tool) => tool.name),
      mcpAppsReceipt: client.stderrBuffer.split("\n").find((line) => line.includes("MCP Apps")) ?? null,
      health: { status: health.status, registry: health.registry },
    },
    claudeMcpRemove: { exitCode: removed.exitCode, stdout: redact(removed.stdout.trim(), replacements) },
  };
  await fs.promises.mkdir(args.receiptDir, { recursive: true });
  const bytes = `${JSON.stringify(receipt, null, 2)}\n`;
  const receiptPath = path.join(args.receiptDir, "claude-code-proof.json");
  await fs.promises.writeFile(receiptPath, bytes, "utf8");
  process.stdout.write(`${JSON.stringify({ receipt: receiptPath, sha256: sha256(bytes), tools: listed.tools.length, connected: true })}\n`);
}

main().catch((error) => {
  process.stderr.write(`claude-code-proof: ${error.stack ?? error.message}\n`);
  process.exitCode = 1;
});
