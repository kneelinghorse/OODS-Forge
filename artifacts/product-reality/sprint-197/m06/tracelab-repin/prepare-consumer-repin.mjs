// Prepared for TraceLab to run from its own frontend checkout after review.
// Forge's build does not execute this against the original repository.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const bundle = import.meta.dirname;
const target = path.resolve(process.argv[2] ?? '.');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const provenance = read(path.join(bundle, 'oods-provenance.json'));
const manifest = read(path.join(target, 'package.json'));
const lockPath = path.join(target, 'package-lock.json'), lock = read(lockPath);
assert.equal(manifest.name, 'frontend', 'Run from the TraceLab frontend directory');
for (const entry of provenance.packages) {
  const bytes = fs.readFileSync(path.join(bundle, path.basename(entry.file)));
  assert.equal(bytes.length, entry.size_bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
}
for (const name of ['tokens', 'tw-variants']) {
  assert.equal(manifest.dependencies[`@oods/${name}`], `file:vendor/oods-${name}-0.1.0.tgz`);
  assert(lock.packages[`node_modules/@oods/${name}`], `Missing lock entry for ${name}`);
}
for (const entry of provenance.packages) fs.copyFileSync(path.join(bundle, path.basename(entry.file)), path.join(target, entry.file));
fs.copyFileSync(path.join(bundle, 'oods-provenance.json'), path.join(target, 'vendor/oods-provenance.json'));
// Same-version file tarballs otherwise retain the previous npm integrity pins.
for (const name of ['tokens', 'tw-variants']) delete lock.packages[`node_modules/@oods/${name}`];
fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
console.log('Prepared two vendor files and invalidated their two lock entries. Run the lock refresh, clean install and token gate in README.md.');
