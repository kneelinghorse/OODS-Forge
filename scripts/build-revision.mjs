#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.argv[2];
if (!output) throw new Error('A build revision output path is required.');
const revision = {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  structuredDataManifestHash: `sha256:${createHash('sha256').update(readFileSync(path.join(root, 'artifacts/structured-data/manifest.json'))).digest('hex')}`,
};
mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
writeFileSync(output, JSON.stringify(revision, null, 2) + '\n');
