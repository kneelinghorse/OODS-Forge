#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
// Later waves remeasure the same immutable operands under their own mission id.
const missionId = process.argv[4] ?? 's185-m04';
const dispositionPath = 'artifacts/product-reality/sprint-184/m07/b2-repoint-disposition.json';
const dispositionBytes = fs.readFileSync(path.join(root, dispositionPath));
const disposition = JSON.parse(dispositionBytes);
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const temporaryStore = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s185-b2-'));
const previousRoot = process.env.MCP_SCHEMA_STORE_ROOT;
const previousDirectory = process.env.MCP_SCHEMA_STORE_DIR;
process.env.MCP_SCHEMA_STORE_ROOT = temporaryStore;
delete process.env.MCP_SCHEMA_STORE_DIR;
fs.mkdirSync(output, { recursive: true });

try {
  const { handle } = await import(pathToFileURL(path.join(root, 'packages/mcp-server/dist/tools/pipeline.js')).href);
  const rows = [];
  for (const historical of disposition.typedOutcomes) {
    const input = structuredClone(historical.input);
    const result = await handle(input);
    if (JSON.stringify(input) !== JSON.stringify(historical.input)) throw new Error(`Mutated input: ${historical.id}`);
    const rawPath = `${historical.id}.response.json`;
    const rawBytes = JSON.stringify(result, null, 2) + '\n';
    fs.writeFileSync(path.join(output, rawPath), rawBytes);
    rows.push({
      id: historical.id,
      input,
      inputSha256: sha256(JSON.stringify(input)),
      profile: result.validationReceipt.profile,
      error: result.error ?? null,
      codePresent: Boolean(result.code),
      savedPresent: Boolean(result.saved),
      steps: result.pipeline.steps,
      rawResponse: { path: rawPath, sha256: sha256(rawBytes) },
    });
  }
  const report = {
    schemaVersion: 1,
    missionId,
    measuredAt: new Date().toISOString(),
    root,
    head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    command: { cwd: process.cwd(), argv: process.argv },
    historicalDisposition: { path: dispositionPath, sha256: sha256(dispositionBytes) },
    loadedEntry: { path: 'packages/mcp-server/dist/tools/pipeline.js', sha256: sha256(fs.readFileSync(path.join(root, 'packages/mcp-server/dist/tools/pipeline.js'))) },
    savedStoreEntries: fs.readdirSync(temporaryStore),
    inputsUnchanged: true,
    rows,
  };
  fs.writeFileSync(path.join(output, 'measurement.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  if (previousRoot === undefined) delete process.env.MCP_SCHEMA_STORE_ROOT;
  else process.env.MCP_SCHEMA_STORE_ROOT = previousRoot;
  if (previousDirectory === undefined) delete process.env.MCP_SCHEMA_STORE_DIR;
  else process.env.MCP_SCHEMA_STORE_DIR = previousDirectory;
  fs.rmSync(temporaryStore, { recursive: true, force: true });
}
