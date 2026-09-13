#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
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
const TOOL_FIXTURE_PINS = Object.freeze([
  {
    "tool": "health",
    "fixture": "s194-health.json",
    "sha256": "edae244bb0ec90acec8538028f5735e1591d1e9aa3bb6ee0f4cfcd3364f5ac59",
    "bytes": 60
  },
  {
    "tool": "tokens.build",
    "fixture": "s194-tokens-build.json",
    "sha256": "262634f01345c74f9fe4d09dded5fe7b85cda4ffe417161cb20d7b067ac7fb46",
    "bytes": 127
  },
  {
    "tool": "structuredData.fetch",
    "fixture": "s194-structuredData-fetch.json",
    "sha256": "25cb7457d33291a4cee539358c3673cfc305c1ba11c3eff71fd9e31efe35b437",
    "bytes": 105
  },
  {
    "tool": "brand.apply",
    "fixture": "s194-brand-apply.json",
    "sha256": "7bd21cd811cb7e11a171be6ba10383ac3c90ffc574bbe890c8174d02c7d68b47",
    "bytes": 122
  },
  {
    "tool": "brand.intake",
    "fixture": "s194-brand-intake.json",
    "sha256": "2c0d689f7e933a18cc48ebfb549b60b0112ffd7a41c61058c7359f2f445a4109",
    "bytes": 908
  },
  {
    "tool": "catalog.list",
    "fixture": "s194-catalog-list.json",
    "sha256": "1fe037984ba4864821d3545a1d2d4d828570bb25a2839d88af7dc0fc6f87428d",
    "bytes": 111
  },
  {
    "tool": "design.compose",
    "fixture": "s194-design-compose.json",
    "sha256": "0224a94436ee2a8e13a7a1b28a89aff6fcd4ff0548cc00d3bbf321e038ddee00",
    "bytes": 123
  },
  {
    "tool": "design.preview",
    "fixture": "s194-design-preview.json",
    "sha256": "b0d35ed84035b22aa164e4e26821fb4b30e7f4be2e81947dc78d0055f76c790c",
    "bytes": 123
  },
  {
    "tool": "pipeline",
    "fixture": "s194-pipeline.json",
    "sha256": "04022a6046c39f0bec88c42cf71a59afa8ed5dd39ec7909b392faa7a2b0b47cb",
    "bytes": 143
  },
  {
    "tool": "registry.snapshot",
    "fixture": "s194-registry-snapshot.json",
    "sha256": "1979a3750c28176cbcbdb56b73f2add4c650b3cde4b6ce3f3841fbff5795e3ed",
    "bytes": 71
  },
  {
    "tool": "viz.render",
    "fixture": "s194-viz-render.json",
    "sha256": "2a850687881667f403f5a554ce2baa462bcefc4dc88e4d7f3e67d8873b7b8286",
    "bytes": 809
  },
  {
    "tool": "dashboard.render",
    "fixture": "s194-dashboard-render.json",
    "sha256": "1e66463fa39c7da75b9a017dcf0d7a357b6f3a0a184f2231d64118b3e639a854",
    "bytes": 1482
  },
  {
    "tool": "artifact.certify",
    "fixture": "s194-artifact-certify.json",
    "sha256": "de6959711792d74b068724bd860effaabe73d96b29f5fd64bc2105f2a6253a91",
    "bytes": 106
  },
  {
    "tool": "code.generate",
    "fixture": "s194-code-generate.json",
    "sha256": "7257a1995526a8aaeeed8002ce592b052e6e6c417b34f918bb9fb4d992921a9a",
    "bytes": 159
  },
  {
    "tool": "fidelity.preview",
    "fixture": "s194-fidelity-preview.json",
    "sha256": "79a38181c6b593d3e14adc9bc9462493f27045167d2934ae616c87bfe8ab05dc",
    "bytes": 3777
  },
  {
    "tool": "map",
    "fixture": "s194-map.json",
    "sha256": "8d3350cc21ddf3ad1fa1658850b0e4918ba584cabe108ad5dd0b54d3c548a6c0",
    "bytes": 458
  },
  {
    "tool": "schema",
    "fixture": "s194-schema.json",
    "sha256": "0d4c4b37fbae4e653a4492cf7a1fe47905bc2c5821a188cd3c10b605afb2277f",
    "bytes": 393
  },
  {
    "tool": "object",
    "fixture": "s194-object.json",
    "sha256": "0cdd899351e9bd9a6fa3ee7a21d5a33dce16c9d2c2c44c9a482f2022e3df9e9c",
    "bytes": 135
  },
  {
    "tool": "repl",
    "fixture": "s194-repl.json",
    "sha256": "73dbeaafc7be460a95e3d63bfdb18d17a25ab373af44416a84e5e14ca5ba2fe1",
    "bytes": 193
  }
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
  "MCP_BRIDGE_PORT",
  "BRIDGE_TOKEN",
  "MCP_BRIDGE_CORS_ORIGIN",
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

export class McpClient {
  constructor({ adapterPath, cwd, env }) {
    this.nextId = 0;
    this.pending = new Map();
    this.stdoutBuffer = "";
    this.stderrBuffer = "";
    this.callCount = 0;
    this.calledTools = new Set();
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

  async callTool(name, args, expectedError) {
    this.callCount += 1;
    this.calledTools.add(name);
    const result = await this.request("tools/call", { name, arguments: args });
    if (expectedError) {
      assert.equal(result?.isError, true, `${name} must disclose the expected portable limit`);
      const error = JSON.parse(result.content?.[0]?.text ?? "{}").error;
      assert.equal(error?.code, expectedError, `${name} must preserve its native error code`);
      assert.equal(typeof error.retryable, "boolean");
      return { isError: true, ...error };
    }
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
  assert.deepEqual(provenance.s194_tool_fixtures.fixtures, TOOL_FIXTURE_PINS);
  fixtures.tools = {};
  for (const pin of TOOL_FIXTURE_PINS) {
    const bytes = await fsp.readFile(path.join(fixturesRoot, pin.fixture));
    assert.equal(bytes.length, pin.bytes, pin.fixture);
    assert.equal(sha256(bytes), pin.sha256, pin.fixture);
    fixtures.tools[pin.tool] = JSON.parse(bytes.toString('utf8'));
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

function assertGeneratedArtifact(artifact, framework) {
  assert.equal(artifact?.framework, framework);
  assert.match(artifact.contentHash, /^sha256:[a-f0-9]{64}$/);
  assert(artifact.files.length > 0);
  assert(artifact.files.some(file => /\.(?:tsx|vue)$/.test(file.path)), "real framework source must be emitted");
  for (const file of artifact.files) {
    assert(file.contents.length > 0);
    assert.equal(file.contentHash, `sha256:${sha256(file.contents)}`);
  }
}

async function proveBridge(runtimeRoot, env, manifest, expectedToolNames, input, adapterSvgHash) {
  const port = await reserveClosedPort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['dist/server.js'], {
    cwd: path.join(runtimeRoot, 'packages/mcp-bridge'),
    env: { ...env, MCP_BRIDGE_PORT: String(port), BRIDGE_TOKEN: 'portable-e2e-owned-token' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', chunk => { output = (output + chunk).slice(-32768); });
  child.stderr.on('data', chunk => { output = (output + chunk).slice(-32768); });
  const exited = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal }));
  });
  let health;
  try {
    for (const deadline = Date.now() + 15000; Date.now() < deadline;) {
      try {
        const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1000) });
        if (response.ok) { health = await response.json(); break; }
      } catch { /* Wait for the owned bridge to listen. */ }
      if (child.exitCode !== null) throw new Error(`Bundled bridge exited: ${output}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert(health, `Bundled bridge did not become ready: ${output}`);
    assert.deepEqual(health.revision, { commit: manifest.commit,
      structuredDataManifestHash: `sha256:${manifest.structuredDataManifest.sha256}` });
    const toolsResponse = await fetch(`${base}/tools`);
    assert(toolsResponse.ok);
    const tools = await toolsResponse.json();
    assert.deepEqual([...tools.tools].sort(), [...expectedToolNames].sort());
    const response = await fetch(`${base}/run`, { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-bridge-token': 'portable-e2e-owned-token' },
      body: JSON.stringify({ tool: 'viz_render', input }), signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    const rendered = await response.json();
    assert(response.ok && rendered.ok, JSON.stringify(rendered));
    assert(adapterSvgHash, 'adapter SVG proof missing');
    assert.equal(rendered.result.svgHash, adapterSvgHash);
    child.kill('SIGTERM');
    const termination = await Promise.race([exited,
      new Promise(resolve => setTimeout(() => resolve(null), LIFECYCLE_TIMEOUT_MS))]);
    assert(termination, 'bridge did not stop cleanly');
    assert(termination.code === 0 || termination.signal === 'SIGTERM');
    await assertLoopbackPortClosed(port);
    return { revision: health.revision, tools: tools.tools, svgHash: adapterSvgHash, parity: true, termination };
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    await exited;
  }
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
  assert(manifest.thirdPartyCount > 0);
  const sbom = await loadJson(path.join(runtimeRoot, RUNTIME_SBOM_FILE));
  assert.equal(sbom.summary.packageCount, manifest.thirdPartyCount);
  assert.equal(sbom.summary.integrityCount, manifest.thirdPartyCount);
  assert(sbom.packages.every((entry) => entry.integrity.startsWith("sha512-")));

  const adapterPackage = await loadJson(
    path.join(runtimeRoot, "packages/mcp-adapter/package.json"),
  );
  assert.equal(
    adapterPackage.version,
    "0.3.0",
    "adapter 0.3.0 preserves structured native errors",
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
  const scratch = path.join(runtimeRoot, '.oods/s194-e2e');
  const artifactsRoot = path.join(runtimeRoot, 'artifacts/current-state');
  assert(!fs.existsSync(scratch));
  assert(!fs.existsSync(artifactsRoot), 'E2E cleanup owns only a newly created artifact tree');
  const oodsExisted = fs.existsSync(path.join(runtimeRoot, '.oods'));
  await fsp.mkdir(scratch, { recursive: true });
  await fsp.copyFile(path.join(runtimeRoot, 'artifacts/structured-data/component-mappings.json'), path.join(scratch, 'mappings.json'));
  childEnvironment.MCP_MAPPINGS_PATH = path.join(scratch, 'mappings.json');
  childEnvironment.MCP_SCHEMA_STORE_ROOT = scratch;
  childEnvironment.MCP_SCHEMA_STORE_DIR = 'schemas';
  const state = {};
  const operand = (tool) => {
    const recipe = fixtures.tools[tool];
    const args = structuredClone(recipe.arguments);
    for (const [key, binding] of Object.entries(recipe.bindings)) {
      const [producer, field] = binding.split('.');
      assert(state[producer]?.[field] !== undefined, `Unresolved fixture binding ${binding}`);
      args[key] = state[producer][field];
    }
    return args;
  };
  assert.deepEqual(Object.keys(fixtures.tools).sort(), [...registry.auto].sort());
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
    const health = await primary.callTool("health", operand("health")); // 1
    assert.equal(health.status, "ok");
    assert.deepEqual(
      {
        components: health.registry.components,
        traits: health.registry.traits,
        objects: health.registry.objects,
      },
      { components: 109, traits: 45, objects: 18 },
    );
    assert.deepEqual(health.warnings ?? [], []);
    const builtScopes = await loadJson(path.join(runtimeRoot, 'packages/tokens/dist/css-variables-by-scope.json'));
    assert.deepEqual(health.tokens.scopes, Object.fromEntries(Object.entries(builtScopes).map(([brand, themes]) => [brand, Object.keys(themes).sort()])));
    assert.deepEqual(health.tokens.defaultScope, { brand: 'A', theme: 'light', source: 'default' });
    assert.deepEqual(health.productReality.runtime, {
      cells: 240, pass: 240, typedGap: 0, fail: 0,
      head: (await loadJson(path.join(runtimeRoot, "packages/mcp-server/dist/registry/runtime-cells.v1.json"))).head,
    });
    const releaseLedger = await loadJson(path.join(runtimeRoot, "packages/mcp-server/dist/registry/release-cells.v1.json"));
    assert.equal(releaseLedger.rows.length, 42, 'The shipped release proof must contain the full reference-app population.');
    assert(releaseLedger.rows.every(row => row.status === 'pass' && row.hashEqualToHost === true
      && row.artifactHash === row.hostArtifactHash), 'Every shipped release cell must have passed with host artifact equality.');
    assert.deepEqual(health.productReality.release, {
      bundleHead: releaseLedger.bundleHead,
      archiveSha256: releaseLedger.archiveSha256,
      apps: [...new Set(releaseLedger.rows.map(row => row.object))].sort(),
      frameworks: [...new Set(releaseLedger.rows.map(row => row.framework))].sort(),
      cells: releaseLedger.rows.length,
      pass: releaseLedger.rows.filter(row => row.status === 'pass').length,
      typedGap: releaseLedger.rows.filter(row => row.status === 'typed-gap').length,
      fail: releaseLedger.rows.filter(row => row.status === 'fail').length,
    });
    // s194-m04: retired entries leave the live roster; health must match the shipped ledger.
    const toolLedger = await loadJson(path.join(runtimeRoot, "packages/mcp-server/dist/registry/tool-capability-ledger.v1.json"));
    assert.deepEqual(health.productReality.tools.byTier, toolLedger.summary.byTier);
    assert.equal(health.productReality.tools.entries, registry.auto.length + registry.onDemand.length);
    // s195-m02: the extracted runtime carries the authored classification and
    // generated taxonomy; health must expose their reconciled Core Profile.
    const vizTaxonomy = await loadJson(path.join(runtimeRoot, 'packages/mcp-server/dist/registry/viz-taxonomy.v1.json'));
    assert.deepEqual(health.productReality.viz, vizTaxonomy.summary);
    assert.deepEqual(Object.fromEntries(['types', 'patterns', 'families', 'classified', 'coreCells'].map(key => [key, health.productReality.viz[key]])), { types: 13, patterns: 21, families: 8, classified: 34, coreCells: 20 });
    assert.equal(health.productReality.viz.coreSurfaceComplete + health.productReality.viz.typedGaps, 20);
    assert(
      isInside(runtimeRoot, path.resolve(health.schemas.storeDir)),
      "health schema store escaped extraction root",
    );

    const two = assertDashboard(
      await primary.callTool("dashboard_render", operand("dashboard.render")),
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

    const vizInput = operand("viz.render");
    vizInput.output = { ...vizInput.output, svg: true };
    const viz = await primary.callTool("viz_render", vizInput); // 6
    state.viz = viz;
    const positive = await primary.callTool("artifact_certify", operand("artifact.certify")); // 7
    const negative = await primary.callTool("artifact_certify", {
      spec: { html: four.html },
    }); // 8
    assertCertification(viz, positive, negative);
    const tokens = await primary.callTool("tokens_build", operand("tokens.build"));
    assert.equal(tokens.artifacts.length, 0);
    assert.match(tokens.preview.summary, /brand B \(dark theme\)/);
    for (const file of [...tokens.artifacts, tokens.transcriptPath, tokens.bundleIndexPath]) {
      assert(isInside(artifactsRoot, file), `Token receipt escaped extraction artifacts: ${file}`);
      assert(fs.existsSync(file));
    }
    const appliedTokens = await primary.callTool("tokens_build", { ...operand("tokens.build"), apply: true });
    assert.equal(appliedTokens.artifacts.length, 5, "portable token export must emit all five outputs");
    for (const file of appliedTokens.artifacts) {
      assert(isInside(artifactsRoot, file));
      assert((await fsp.stat(file)).size > 0);
    }
    const exportedTokens = Object.fromEntries(appliedTokens.artifacts.map(file => [path.basename(file), file]));
    assert.deepEqual(JSON.parse(await fsp.readFile(exportedTokens['tokens.dark.json'], 'utf8')),
      { cssVariables: builtScopes.B.dark, meta: { brand: 'B', theme: 'dark', scope: 'requested' } });
    for (const [exported, shipped] of [['tokens.css', 'css/tokens.css'], ['tokens.ts', 'ts/tokens.ts'], ['tokens.tailwind.json', 'tailwind/tokens.json']]) {
      assert((await fsp.readFile(exportedTokens[exported])).equals(
        await fsp.readFile(path.join(runtimeRoot, 'packages/tokens/dist', shipped))), `Export changed shipped token bytes: ${exported}`);
    }
    const data = await primary.callTool("structuredData_fetch", operand("structuredData.fetch"));
    assert.equal(data.dataset, 'components'); assert(data.etag);
    const brand = await primary.callTool("brand_apply", operand("brand.apply"), "OODS-N020");
    const intake = await primary.callTool("brand_intake", operand("brand.intake"));
    assert.equal(intake.validated, true); assert.equal(intake.preview_only, true); assert(intake.delta.dark);
    const catalog = await primary.callTool("catalog_list", operand("catalog.list"));
    assert.equal(catalog.totalCount, 109); assert.equal(catalog.returnedCount, 109);
    const composed = await primary.callTool("design_compose", operand("design.compose"));
    assert.equal(composed.status, 'ok'); assert(composed.schemaRef); state.compose = composed;
    await assertLoopbackPortClosed(4477);
    const preview = await primary.callTool("design_preview", operand("design.preview"), "OODS-N019");
    const generated = await primary.callTool("code_generate", operand("code.generate"));
    assert.equal(generated.status, 'ok');
    assertGeneratedArtifact(generated.artifact, 'react');
    const generatedVue = await primary.callTool("code_generate", { ...operand("code.generate"), framework: 'vue' });
    assert.equal(generatedVue.status, 'ok');
    assertGeneratedArtifact(generatedVue.artifact, 'vue');
    const run = await primary.callTool("pipeline", operand("pipeline"));
    assert.equal(run.error, undefined, JSON.stringify(run.error));
    assertGeneratedArtifact(run.code?.artifact, 'react');
    const snapshot = await primary.callTool("registry_snapshot", operand("registry.snapshot"));
    assert(snapshot.objects.Subscription); assert(snapshot.traits.Stateful); assert.match(snapshot.etag, /^[a-f0-9]{64}$/);
    const fidelity = await primary.callTool("fidelity_preview", operand("fidelity.preview"));
    assert.equal(fidelity.status, 'ok'); assert.equal(fidelity.fixture, '(inline)'); assert(fidelity.html.includes('Subscription'));
    const mapped = await primary.callTool("map", operand("map"));
    assert.equal(mapped.applied, true); assert(mapped.mapping.id);
    const resolved = await primary.callTool("map", fixtures.tools.map.followups[0]);
    assert.equal(resolved.mapping.id, mapped.mapping.id);
    const removedMap = await primary.callTool("map", { ...fixtures.tools.map.followups[1], id: mapped.mapping.id });
    assert.equal(removedMap.deleted.id, mapped.mapping.id);
    const saved = await primary.callTool("schema", operand("schema"));
    assert.equal(saved.version, 1);
    const loaded = await primary.callTool("schema", fixtures.tools.schema.followups[0]);
    assert.equal(loaded.version, 1); assert(loaded.schemaRef);
    const removedSchema = await primary.callTool("schema", fixtures.tools.schema.followups[1]);
    assert.equal(removedSchema.deleted, true);
    const object = await primary.callTool("object", operand("object"));
    assert.equal(object.name, 'Subscription'); assert(object.traits.length > 0); assert.deepEqual(Object.keys(object.viewExtensions), ['card']);
    const rendered = await primary.callTool("repl", operand("repl"));
    assert.equal(rendered.status, 'ok'); assert(rendered.html.startsWith('<!DOCTYPE html>'));
    assert.equal(primary.callCount, 29, '19 tools plus repeats, stores, real token export and Vue generation');
    assert.deepEqual([...primary.calledTools].sort(), [...expectedToolNames].sort());
    const outcomes = {
      'tokens.build': { outcome: 'pass', apply: true, artifacts: appliedTokens.artifacts.length, preview: tokens.preview.summary },
      'structuredData.fetch': { outcome: 'pass', etag: data.etag },
      'brand.apply': { outcome: 'typed', gap: 'portable-brand-source-absent', apply: false, ...brand },
      'brand.intake': { outcome: 'pass', envelopeHash: intake.envelopeHash },
      'catalog.list': { outcome: 'pass', count: catalog.totalCount },
      'design.compose': { outcome: 'pass', schemaHash: sha256(canonicalJson(composed.schema)) },
      'design.preview': { outcome: 'typed', gap: 'portable-design-loop-unavailable', adapterCodePreserved: true, ...preview },
      'code.generate': { outcome: 'pass', reactHash: generated.artifact.contentHash, vueHash: generatedVue.artifact.contentHash },
      pipeline: { outcome: 'pass', contentHash: run.code.artifact.contentHash },
      'registry.snapshot': { outcome: 'pass', etag: snapshot.etag },
      'fidelity.preview': { outcome: 'pass', htmlHash: sha256(fidelity.html) },
      map: { outcome: 'pass', createdResolvedDeleted: true },
      schema: { outcome: 'pass', savedLoadedDeleted: true },
      object: { outcome: 'pass', name: object.name },
      repl: { outcome: 'pass', htmlHash: sha256(rendered.html) },
      health: { outcome: 'pass', tokens: health.tokens, viz: health.productReality.viz, release: health.productReality.release },
      'dashboard.render': { outcome: 'pass', repeated: true },
      'viz.render': { outcome: 'pass', contentHash: viz.contentHash },
      'artifact.certify': { outcome: 'pass', pillars: positive.pillars, negativeCode: 'OODS-V126' },
    };
    assert.equal(Object.values(outcomes).filter(row => row.outcome === 'pass').length, 17);
    assert.equal(Object.values(outcomes).filter(row => row.outcome === 'typed').length, 2);
    const bridge = await proveBridge(runtimeRoot, childEnvironment, manifest, expectedToolNames,
      vizInput, viz.svgHash);
    await assertLoopbackPortClosed(healthCanaryPort);
    calls = {
      bridge,
      primarySequenceCount: primary.callCount,
      outcomes,
      fixturePins: TOOL_FIXTURE_PINS,
      health: {
        status: health.status,
        registry: health.registry,
        release: health.productReality.release,
        viz: health.productReality.viz,
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

  await fsp.rm(scratch, { recursive: true });
  if (!oodsExisted) await fsp.rmdir(path.join(runtimeRoot, '.oods'));
  await fsp.rm(artifactsRoot, { recursive: true });
  const fullTreeAfter = await treeDigest(runtimeRoot);
  assert.equal(
    primary.callCount + restarted.callCount,
    30,
    "portable runtime E2E must make 30 tools/call operations across both adapter processes",
  );
  calls.totalAcrossProcesses = primary.callCount + restarted.callCount;
  assert.equal(
    fullTreeAfter.sha256,
    fullTreeBefore.sha256,
    "extracted runtime tree was not restored after scoped E2E writes",
  );
  assert.equal(
    fullTreeAfter.entryCount,
    fullTreeBefore.entryCount,
    "extracted runtime entry count was not restored",
  );
  process.stdout.write(
    canonicalJson({
      status: "pass",
      nodeVersion: process.version,
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
        restoredAfterScopedWrites: true,
      },
      lifecycle: { stdinClose, primaryTermination, restart },
    }),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(
      `runtime-e2e: ${error.stack ?? error.message ?? String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
