/**
 * The archive E2E's literal registry expectations, checked against the tree in seconds.
 *
 * s205-m01, from decision #2203: `scripts/runtime/e2e.mjs` asserts the frozen bundle's `health` counts
 * (objects, traits) and its runtime ledger size as literals, on purpose — the E2E proves the archive, so it
 * must not derive its expectation from the code it is testing. The cost is that a sprint which adds an object
 * or a trait leaves those literals stale until part B of the closeout, where Sprint 204 found `traits: 46`
 * against a live 47 (#2203, retained at sprint-204/m06/pre-freeze/e2e-red-1). This check runs in the
 * tripwire, so the mission that moves a count sees the stale literal the same day.
 *
 *   pnpm exec tsx scripts/product-reality/s205-e2e-expectations.ts
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { listObjects } from '../../packages/mcp-server/src/objects/object-loader.js';
import { listTraits } from '../../packages/mcp-server/src/objects/trait-loader.js';

const root = path.resolve(import.meta.dirname, '../..');
const e2e = fs.readFileSync(path.join(root, 'scripts/runtime/e2e.mjs'), 'utf8');
const registry = e2e.match(/\{ components: (\d+), traits: (\d+), objects: (\d+) \}/);
const runtime = e2e.match(/cells: (\d+), pass: (\d+), typedGap: 0, fail: 0/);
assert(registry && runtime, 'scripts/runtime/e2e.mjs no longer states its registry and runtime expectations in the shape this check reads');

const rows = (JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/registry/runtime-cells.v1.json'), 'utf8')) as { rows: unknown[] }).rows.length;
const expected = { traits: Number(registry[2]), objects: Number(registry[3]), cells: Number(runtime[1]), pass: Number(runtime[2]) };
const actual = { traits: listTraits().length, objects: listObjects().length, cells: rows, pass: rows };
assert.deepEqual(expected, actual, 'scripts/runtime/e2e.mjs expects registry counts the tree no longer has — move the literal with the mission that moved the count');
console.log(JSON.stringify({ ...actual, status: 'verified' }));
