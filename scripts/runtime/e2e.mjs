#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import {
  canonicalJson,
  RUNTIME_MANIFEST_FILE,
  RUNTIME_SBOM_FILE,
  sha256,
  treeDigest,
  verifyEmbeddedManifest,
} from "./manifest.mjs";

const PROTOCOL_VERSION = "2024-11-05";
const REQUEST_TIMEOUT_MS = 120_000;
const LIFECYCLE_TIMEOUT_MS = 3_000;
const MAX_STDOUT_BYTES = 32 * 1024 * 1024;
const MAX_STDERR_BYTES = 128 * 1024;
const CONSUMER_COMMIT = "97e9aa8317bdfdf3cf6d85d81e90112c5e5789ff";
const FIXTURE_PINS = Object.freeze([
  {
    id: "twoPanel",
    fixture: "d3-preflight-dashboard.json",
    source_path: "tests/admin-app/fixtures/d3-preflight-dashboard.json",
    sha256: "c3e2c12b61e599f970070cf4af7d3262640a5e48c0cfc58616954cdb8c17d62a",
    bytes: 1145,
  },
  {
    id: "fourPanel",
    fixture: "d3-four-panel-dashboard.json",
    source_path: "tests/admin-app/fixtures/d3-four-panel-dashboard.json",
    sha256: "3901489a7e3bfa703c0a1db4b4dde9611f6ddf02edaa8dcb50dd1bb8b9a5ca04",
    bytes: 2091,
  },
  {
    id: "viz",
    fixture: "d3-viz-bar.json",
    source_path: "tests/admin-app/fixtures/d3-viz-bar.json",
    sha256: "be19ebf524bdcedb0baebec6f4a84a7076bdd563a2da3226b6d646da57464fed",
    bytes: 588,
  },
]);
const EPHEMERAL_DASHBOARD_FIELDS = [
  "specRef",
  "specRefCreatedAt",
  "specRefExpiresAt",
];

const FORBIDDEN_CHILD_ENV = [
  "NODE_OPTIONS",
  "NODE_PATH",
  "MCP_CODE_CONNECT_PATH",
  "MCP_EXTRA_TOOLS",
  "MCP_HEALTH_PORT",
  "MCP_MAPPINGS_PATH",
  "MCP_ROLE",
  "MCP_SCHEMA_REF_MAX",
  "MCP_SCHEMA_REF_TTL_MS",
  "MCP_SCHEMA_STORE_DIR",
  "MCP_SCHEMA_STORE_ROOT",
  "MCP_STRUCTURED_DATA_DIR",
  "MCP_TELEMETRY_DIR",
  "MCP_THEME",
  "MCP_TOOLSET",
  "MCP_USER",
  "OODS_NODE_PATH",
  "OODS_OTLP_ENDPOINT",
  "OODS_OTLP_HEADERS",
  "OODS_OTLP_SERVICE_NAME",
  "OTEL_PROPAGATORS",
  "OTEL_SERVICE_NAME",
  "PORT",
];

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--extract-dir" || arg === "--repo-root") {
      const value = argv[++index];
      if (!value) throw new Error(`missing value for ${arg}`);
      parsed[arg === "--extract-dir" ? "extractDir" : "repoRoot"] =
        path.resolve(value);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!parsed.extractDir || !parsed.repoRoot) {
    throw new Error("usage: e2e.mjs --extract-dir <dir> --repo-root <dir>");
  }
  return parsed;
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

function sanitizedRuntimeEnvironment(healthCanaryPort) {
  const hostileParent = {
    ...process.env,
    NODE_PATH: "/tmp/hostile-node-path",
    MCP_HEALTH_PORT: String(healthCanaryPort),
    MCP_TOOLSET: "all",
    MCP_MAPPINGS_PATH: "/tmp/hostile-mappings.json",
    OODS_OTLP_ENDPOINT: "http://127.0.0.1:9/v1/traces",
    OODS_OTLP_HEADERS: "Authorization=hostile",
  };
  const env = {
    PATH: hostileParent.PATH ?? "",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    TZ: "UTC",
    NODE_ENV: "production",
    NO_COLOR: "1",
  };
  for (const key of FORBIDDEN_CHILD_ENV) {
    assert.equal(
      env[key],
      undefined,
      `forbidden child environment key leaked: ${key}`,
    );
  }
  return env;
}

async function reserveClosedPort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object");
  const port = address.port;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function assertLoopbackPortClosed(port) {
  await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (error) => {
      socket.destroy();
      if (error) reject(error);
      else resolve();
    };
    socket.once("connect", () =>
      finish(new Error(`unexpected loopback listener on port ${port}`)),
    );
    socket.once("error", (error) => {
      if (error.code === "ECONNREFUSED") finish();
      else finish(error);
    });
    socket.setTimeout(2_000, () =>
      finish(new Error(`loopback probe timed out on port ${port}`)),
    );
  });
}

class McpClient {
  constructor({ adapterPath, cwd, env }) {
    this.nextId = 0;
    this.pending = new Map();
    this.stdoutBuffer = "";
    this.stderrBuffer = "";
    this.callCount = 0;
    this.exitInfo = null;
    this.child = spawn(process.execPath, [adapterPath], {
      cwd,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.child.stdout.setEncoding("utf8");
    this.child.stderr.setEncoding("utf8");
    this.child.stdout.on("data", (chunk) => this.handleStdout(chunk));
    this.child.stderr.on("data", (chunk) => {
      this.stderrBuffer = `${this.stderrBuffer}${chunk}`.slice(
        -MAX_STDERR_BYTES,
      );
    });
    this.exitPromise = new Promise((resolve) => {
      this.child.on("exit", (code, signal) => {
        this.exitInfo = { code, signal };
        const suffix = this.stderrBuffer
          ? `\nstderr:\n${this.stderrBuffer}`
          : "";
        this.failAll(
          new Error(`adapter exited (${code ?? signal ?? "unknown"})${suffix}`),
        );
        resolve(this.exitInfo);
      });
    });
    this.child.on("error", (error) => this.failAll(error));
  }

  handleStdout(chunk) {
    this.stdoutBuffer += chunk;
    if (Buffer.byteLength(this.stdoutBuffer) > MAX_STDOUT_BYTES) {
      this.failAll(
        new Error("adapter stdout buffer exceeded verification limit"),
      );
      this.child.kill("SIGKILL");
      return;
    }
    let newline;
    while ((newline = this.stdoutBuffer.indexOf("\n")) >= 0) {
      const line = this.stdoutBuffer.slice(0, newline).trim();
      this.stdoutBuffer = this.stdoutBuffer.slice(newline + 1);
      if (!line) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        this.failAll(
          new Error(`adapter emitted non-JSON stdout: ${line.slice(0, 200)}`),
        );
        this.child.kill("SIGKILL");
        return;
      }
      if (!message || message.jsonrpc !== "2.0") continue;
      if (message.id === undefined || message.id === null) continue;
      const pending = this.pending.get(message.id);
      if (!pending) {
        this.failAll(
          new Error(`adapter returned unknown JSON-RPC id ${message.id}`),
        );
        this.child.kill("SIGKILL");
        return;
      }
      clearTimeout(pending.timer);
      this.pending.delete(message.id);
      if (message.error)
        pending.reject(
          new Error(`JSON-RPC error: ${JSON.stringify(message.error)}`),
        );
      else pending.resolve(message.result);
    }
  }

  failAll(error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
  }

  request(method, params = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
    if (this.exitInfo)
      return Promise.reject(new Error("adapter is already closed"));
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`JSON-RPC request timed out: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(
        `${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`,
        "utf8",
        (error) => {
          if (!error) return;
          clearTimeout(timer);
          this.pending.delete(id);
          reject(error);
        },
      );
    });
  }

  notify(method, params = {}) {
    this.child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`,
      "utf8",
    );
  }

  async callTool(name, args) {
    this.callCount += 1;
    const result = await this.request("tools/call", { name, arguments: args });
    if (result?.isError) {
      throw new Error(
        `MCP tool failed: ${name}: ${result.content?.[0]?.text ?? "unknown error"}`,
      );
    }
    assert(Array.isArray(result?.content), `MCP tool content missing: ${name}`);
    assert.equal(
      result.content.length,
      1,
      `MCP tool returned unexpected content count: ${name}`,
    );
    assert.equal(
      result.content[0]?.type,
      "text",
      `MCP tool returned non-text content: ${name}`,
    );
    return JSON.parse(result.content[0].text);
  }

  async waitForExit(timeoutMs) {
    if (this.exitInfo) return this.exitInfo;
    return Promise.race([
      this.exitPromise,
      new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  }

  async closeStdinAndObserve() {
    if (this.exitInfo) return { exited: true, ...this.exitInfo };
    this.child.stdin.end();
    const result = await this.waitForExit(LIFECYCLE_TIMEOUT_MS);
    return result
      ? { exited: true, ...result }
      : { exited: false, code: null, signal: null };
  }

  async terminate(signal = "SIGTERM") {
    if (this.exitInfo)
      return {
        ...this.exitInfo,
        requestedSignal: signal,
        forcedKill: false,
        alreadyExited: true,
      };
    this.child.kill(signal);
    let result = await this.waitForExit(LIFECYCLE_TIMEOUT_MS);
    let forcedKill = false;
    if (!result) {
      forcedKill = true;
      this.child.kill("SIGKILL");
      result = await this.exitPromise;
    }
    return {
      ...result,
      requestedSignal: signal,
      forcedKill,
      alreadyExited: false,
    };
  }
}

async function loadJson(filePath) {
  return JSON.parse(await fsp.readFile(filePath, "utf8"));
}

async function loadFixtures(repoRoot) {
  const fixturesRoot = path.join(
    repoRoot,
    "packages/mcp-server/test/fixtures/portable-runtime",
  );
  const provenance = await loadJson(path.join(fixturesRoot, "provenance.json"));
  assert.equal(
    provenance.consumer_repository?.commit,
    CONSUMER_COMMIT,
    "consumer fixture commit drifted",
  );
  assert.deepEqual(
    provenance.fixtures,
    FIXTURE_PINS,
    "fixture provenance differs from the code-pinned operands",
  );
  const fixtures = {};
  for (const entry of FIXTURE_PINS) {
    const bytes = await fsp.readFile(path.join(fixturesRoot, entry.fixture));
    assert.equal(
      bytes.length,
      entry.bytes,
      `fixture byte count drifted: ${entry.fixture}`,
    );
    assert.equal(
      sha256(bytes),
      entry.sha256,
      `fixture sha256 drifted: ${entry.fixture}`,
    );
    fixtures[entry.id] = JSON.parse(bytes.toString("utf8"));
  }
  return fixtures;
}

function assertDashboard(output, label) {
  assert.equal(output.status, "ok", `${label} dashboard status must be ok`);
  assert.equal(
    typeof output.html,
    "string",
    `${label} dashboard HTML is missing`,
  );
  assert(
    output.html.startsWith("<!DOCTYPE html>"),
    `${label} dashboard HTML is not a document`,
  );
  assert.equal(
    output.outputHtmlHash,
    sha256(output.html),
    `${label} outputHtmlHash does not hash returned HTML`,
  );
  const deterministic = structuredClone(output);
  for (const field of EPHEMERAL_DASHBOARD_FIELDS) {
    assert.equal(
      typeof deterministic[field],
      "string",
      `${label} dashboard ${field} is missing`,
    );
    delete deterministic[field];
  }
  return {
    output,
    html: output.html,
    sha256: output.outputHtmlHash,
    deterministicBytes: canonicalJson(deterministic),
  };
}

function assertCertification(viz, positive, negative) {
  assert.equal(viz.status, "ok", "viz.render status must be ok");
  assert(
    viz.normalizedSpec && typeof viz.normalizedSpec === "object",
    "viz.render normalizedSpec is missing",
  );
  assert.equal(
    positive.status,
    "ok",
    "artifact.certify positive status must be ok",
  );
  assert.equal(
    positive.coverage,
    "certified",
    "artifact.certify coverage must be certified",
  );
  assert.equal(
    positive.conformant,
    true,
    "artifact.certify must be conformant",
  );
  assert.deepEqual(positive.pillars, {
    a11yEquivalence: "pass",
    determinism: "pass",
    contrast: "pass",
    accuracy: "pass",
  });
  assert.equal(
    negative.status,
    "error",
    "HTML certification must return a structured error",
  );
  assert.deepEqual(
    negative.errors?.map((error) => error.code),
    ["OODS-V126"],
  );
}

async function initializeAndList(client, expectedVersion, expectedToolNames) {
  const initialized = await client.request("initialize", {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "forge-portable-runtime-e2e", version: "0.1.0" },
  });
  assert.equal(initialized.protocolVersion, PROTOCOL_VERSION);
  assert.deepEqual(initialized.serverInfo, {
    name: "oods-foundry-adapter",
    version: expectedVersion,
  });
  client.notify("notifications/initialized");
  const listed = await client.request("tools/list", {});
  const names = listed.tools.map((tool) => tool.name);
  assert.deepEqual(
    names,
    expectedToolNames,
    "tools/list differs from extracted registry auto order",
  );
  return { initialized, names };
}

async function main() {
  assert.equal(
    process.env.NODE_PATH,
    undefined,
    "e2e harness requires NODE_PATH to be undefined",
  );
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = await fsp.realpath(args.repoRoot);
  const runtimeRoot = await fsp.realpath(args.extractDir);
  assert(
    !isInside(repoRoot, runtimeRoot),
    "extraction directory must be outside the source repository",
  );
  for (const forbidden of [".git", ".env", "cmos"]) {
    assert(
      !fs.existsSync(path.join(runtimeRoot, forbidden)),
      `forbidden runtime-root member present: ${forbidden}`,
    );
  }

  const { manifest, payload } = await verifyEmbeddedManifest(runtimeRoot);
  assert.equal(manifest.thirdPartyCount, 245);
  const sbom = await loadJson(path.join(runtimeRoot, RUNTIME_SBOM_FILE));
  assert.equal(sbom.summary.packageCount, 245);
  assert.equal(sbom.summary.integrityCount, 245);
  assert(sbom.packages.every((entry) => entry.integrity.startsWith("sha512-")));

  const adapterPackage = await loadJson(
    path.join(runtimeRoot, "packages/mcp-adapter/package.json"),
  );
  assert.equal(
    adapterPackage.version,
    "0.2.0",
    "adapter package version must be 0.2.0",
  );
  assert.equal(
    manifest.packageVersions["@oods/mcp-adapter"],
    adapterPackage.version,
  );
  const registry = await loadJson(
    path.join(runtimeRoot, "packages/mcp-server/dist/tools/registry.json"),
  );
  const expectedToolNames = registry.auto.map((name) =>
    name.replaceAll(".", "_"),
  );
  assert.equal(expectedToolNames.length, manifest.registry.autoCount);

  const fixtures = await loadFixtures(repoRoot);
  const fullTreeBefore = await treeDigest(runtimeRoot);
  const healthCanaryPort = await reserveClosedPort();
  const childEnvironment = sanitizedRuntimeEnvironment(healthCanaryPort);
  const adapterPath = path.join(runtimeRoot, "packages/mcp-adapter/index.js");
  const adapterCwd = path.join(runtimeRoot, "packages/mcp-adapter");
  const primary = new McpClient({
    adapterPath,
    cwd: adapterCwd,
    env: childEnvironment,
  });
  let stdinClose;
  let primaryTermination = null;
  let calls;
  try {
    await initializeAndList(primary, adapterPackage.version, expectedToolNames);
    const health = await primary.callTool("health", {}); // 1
    assert.equal(health.status, "ok");
    assert.deepEqual(
      {
        components: health.registry.components,
        traits: health.registry.traits,
        objects: health.registry.objects,
      },
      { components: 109, traits: 45, objects: 11 },
    );
    assert.deepEqual(health.warnings ?? [], []);
    assert.deepEqual(health.productReality.runtime, {
      cells: 154, pass: 154, typedGap: 0, fail: 0,
      head: (await loadJson(path.join(runtimeRoot, "packages/mcp-server/dist/registry/runtime-cells.v1.json"))).head,
    });
    // s194-m04: retired entries leave the live roster; health must match the shipped ledger.
    const toolLedger = await loadJson(path.join(runtimeRoot, "packages/mcp-server/dist/registry/tool-capability-ledger.v1.json"));
    assert.deepEqual(health.productReality.tools.byTier, toolLedger.summary.byTier);
    assert.equal(health.productReality.tools.entries, registry.auto.length + registry.onDemand.length);
    assert(
      isInside(runtimeRoot, path.resolve(health.schemas.storeDir)),
      "health schema store escaped extraction root",
    );

    const two = assertDashboard(
      await primary.callTool("dashboard_render", fixtures.twoPanel),
      "two-panel",
    ); // 2
    const four = assertDashboard(
      await primary.callTool("dashboard_render", fixtures.fourPanel),
      "four-panel",
    ); // 3
    const twoRepeat = assertDashboard(
      await primary.callTool("dashboard_render", fixtures.twoPanel),
      "two-panel repeat",
    ); // 4
    const fourRepeat = assertDashboard(
      await primary.callTool("dashboard_render", fixtures.fourPanel),
      "four-panel repeat",
    ); // 5
    assert.equal(
      twoRepeat.html,
      two.html,
      "two-panel HTML is not byte-deterministic",
    );
    assert.equal(
      fourRepeat.html,
      four.html,
      "four-panel HTML is not byte-deterministic",
    );
    assert.equal(
      twoRepeat.deterministicBytes,
      two.deterministicBytes,
      "two-panel deterministic response projection drifted",
    );
    assert.equal(
      fourRepeat.deterministicBytes,
      four.deterministicBytes,
      "four-panel deterministic response projection drifted",
    );
    assert.notEqual(
      twoRepeat.output.specRef,
      two.output.specRef,
      "two-panel repeat unexpectedly reused ephemeral specRef",
    );
    assert.notEqual(
      fourRepeat.output.specRef,
      four.output.specRef,
      "four-panel repeat unexpectedly reused ephemeral specRef",
    );

    const viz = await primary.callTool("viz_render", fixtures.viz); // 6
    const positive = await primary.callTool("artifact_certify", {
      spec: viz.normalizedSpec,
    }); // 7
    const negative = await primary.callTool("artifact_certify", {
      spec: { html: four.html },
    }); // 8
    assertCertification(viz, positive, negative);
    assert.equal(
      primary.callCount,
      8,
      "portable runtime E2E must execute the explicit eight tools/call sequence",
    );
    await assertLoopbackPortClosed(healthCanaryPort);
    calls = {
      primarySequenceCount: primary.callCount,
      health: {
        status: health.status,
        registry: health.registry,
        warnings: health.warnings ?? [],
      },
      dashboards: {
        twoPanelHtmlSha256: two.sha256,
        fourPanelHtmlSha256: four.sha256,
        repeatsIdentical: true,
      },
      viz: { chartType: viz.chartType, contentHash: viz.contentHash },
      certify: {
        coverage: positive.coverage,
        conformant: positive.conformant,
        pillars: positive.pillars,
        negativeCode: "OODS-V126",
      },
    };
    stdinClose = await primary.closeStdinAndObserve();
    assert.equal(
      stdinClose.exited,
      true,
      "adapter did not exit after stdin close",
    );
    assert.equal(stdinClose.code, 0, "adapter stdin-close exit was not clean");
    assert.equal(
      stdinClose.signal,
      null,
      "adapter stdin-close exit was signal-driven",
    );
    primaryTermination = { method: "stdin-close", ...stdinClose };
  } catch (error) {
    await primary.terminate("SIGTERM");
    throw error;
  }

  const restarted = new McpClient({
    adapterPath,
    cwd: adapterCwd,
    env: childEnvironment,
  });
  let restart;
  try {
    await initializeAndList(
      restarted,
      adapterPackage.version,
      expectedToolNames,
    );
    const restartHealth = await restarted.callTool("health", {});
    assert.equal(
      restartHealth.status,
      "ok",
      "restarted adapter native health call failed",
    );
    assert.equal(
      restarted.callCount,
      1,
      "restarted adapter must make exactly one native health call",
    );
    const termination = await restarted.terminate("SIGTERM");
    assert.equal(
      termination.forcedKill,
      false,
      "adapter required SIGKILL after SIGTERM",
    );
    assert(
      termination.code === 0 || termination.signal === "SIGTERM",
      `adapter SIGTERM exit was not clean: ${JSON.stringify(termination)}`,
    );
    restart = {
      initialized: true,
      nativeHealth: restartHealth.status,
      sigterm: termination,
    };
  } catch (error) {
    await restarted.terminate("SIGKILL");
    throw error;
  }

  const fullTreeAfter = await treeDigest(runtimeRoot);
  assert.equal(
    primary.callCount + restarted.callCount,
    9,
    "portable runtime E2E must make nine tools/call operations across both processes",
  );
  calls.totalAcrossProcesses = primary.callCount + restarted.callCount;
  assert.equal(
    fullTreeAfter.sha256,
    fullTreeBefore.sha256,
    "extracted runtime tree mutated during E2E",
  );
  assert.equal(
    fullTreeAfter.entryCount,
    fullTreeBefore.entryCount,
    "extracted runtime entry count mutated during E2E",
  );
  process.stdout.write(
    canonicalJson({
      status: "pass",
      manifest: {
        file: RUNTIME_MANIFEST_FILE,
        commit: manifest.commit,
        dirty: manifest.dirty,
        payloadTreeSha256: payload.sha256,
        thirdPartyCount: manifest.thirdPartyCount,
      },
      tools: { count: expectedToolNames.length, names: expectedToolNames },
      calls,
      healthPort: {
        inherited: false,
        canaryPort: healthCanaryPort,
        listenerAbsent: true,
      },
      extractionTree: {
        before: fullTreeBefore.sha256,
        after: fullTreeAfter.sha256,
        unchanged: true,
      },
      lifecycle: { stdinClose, primaryTermination, restart },
    }),
  );
}

main().catch((error) => {
  process.stderr.write(
    `runtime-e2e: ${error.stack ?? error.message ?? String(error)}\n`,
  );
  process.exitCode = 1;
});
