import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../../..');
const directory = 'artifacts/product-reality/sprint-197/m06';
const read = (file: string) => readFileSync(resolve(root, directory, file));
const json = (file: string) => JSON.parse(read(file).toString());
const hash = (bytes: Buffer | string, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
const repin = resolve(root, directory, 'tracelab-repin');

describe('s197 palette sheets expose comparable pixels and an exact, unapplied consumer re-pin', () => {
  it('reproduces the index only after checking every image, identical operand and visible text', () => {
    const result = JSON.parse(execFileSync('python3', ['scripts/product-reality/s197-palette-gallery.py', '--check'], { cwd: root, encoding: 'utf8' }));
    expect(result).toEqual({ pairCount: 90, screenshotCount: 180, forgePairs: 72, tracelabPairs: 18, horizontalOverflowCount: 0 });
    expect(json('side-by-side/comparison.json').builderSelfCertified).toBe(false);
  });

  it('covers every promised screen, scope and viewport rather than treating duplicate pictures as coverage', () => {
    const pairs = json('side-by-side/comparison.json').pairs;
    const expected: string[] = [];
    for (const screen of ['Subscription-list', 'Subscription-detail', 'Subscription-form', 'Subscription-timeline', 'Subscription-workflow', 'Organization-detail'])
      for (const theme of ['light', 'dark']) for (const brand of ['A', 'B']) for (const width of [390, 820, 1440]) expected.push(`${screen}-${theme}-${brand}-${width}`);
    for (const screen of ['Home', 'Evidence', 'Mission']) for (const theme of ['light', 'dark']) for (const width of [390, 820, 1440]) expected.push(`TraceLab-${screen}-${theme}-${width}`);
    expect(pairs.map((row: any) => row.id).sort()).toEqual(expected.sort());
    expect(new Set(pairs.flatMap((row: any) => [row.before.file, row.after.file])).size).toBe(180);
  });

  it('pins the installed CSS and npm lock integrities to the actual reviewed tarball bytes', () => {
    const provenance = json('tracelab-repin/oods-provenance.json');
    const lock = json('tracelab-repin/package-lock.prepared.json');
    for (const entry of provenance.packages) {
      const name = entry.file.split('/').at(-1);
      const bytes = read(`tracelab-repin/${name}`);
      expect(bytes.length).toBe(entry.size_bytes); expect(hash(bytes)).toBe(entry.sha256);
      const key = name.startsWith('oods-tokens-') ? 'tokens' : 'tw-variants';
      expect(lock.packages[`node_modules/@oods/${key}`].integrity).toBe(`sha512-${createHash('sha512').update(bytes).digest('base64')}`);
    }
    const css = execFileSync('tar', ['-xOf', join(repin, 'oods-tokens-0.1.0.tgz'), 'package/dist/css/tokens.css']);
    expect(hash(css)).toBe(provenance.clean_install_smoke.installed_css_sha256);
    expect(hash(css)).toBe(json('side-by-side/tracelab-after.json').cssSha256);
    expect(hash(css)).not.toBe(json('side-by-side/tracelab-before.json').cssSha256);
    for (const theme of ['light', 'dark', 'hc']) expect(css.toString()).toContain(`[data-brand='A'][data-theme='${theme}']`);
    expect(provenance.clean_install_smoke.status).toBe('passed');
  });

  it('keeps every unrelated lock entry and the two original dirty reports intact', () => {
    const old = json('tracelab-repin/package-lock.before.json'), next = json('tracelab-repin/package-lock.prepared.json');
    const strip = (value: any) => { const copy = structuredClone(value); for (const key of ['tokens', 'tw-variants']) delete copy.packages[`node_modules/@oods/${key}`]; return copy; };
    const additions = json('tracelab-repin/lock-delta.json').addedBundledOptionalEntries;
    expect(Object.keys(additions).sort()).toEqual(['@emnapi/core', '@emnapi/runtime', '@emnapi/wasi-threads', '@napi-rs/wasm-runtime', '@tybys/wasm-util', 'tslib'].map(name => `node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/${name}`).sort());
    const normalized = strip(next);
    for (const [key, entry] of Object.entries(additions)) {
      expect(old.packages[key]).toBeUndefined(); expect(next.packages[key]).toEqual(entry);
      expect(entry).toMatchObject({ inBundle: true, optional: true }); delete normalized.packages[key];
    }
    expect(normalized).toEqual(strip(old));
    const before = json('tracelab-repin/source-before.json'), after = json('tracelab-repin/source-after.json');
    expect(after).toEqual(before); expect(before.status).not.toBe('');
    expect(Object.keys(before.existingModifiedFiles).sort()).toEqual(['cmos/reports/sprint-37/graph-search-e2e-validation.json', 'cmos/reports/sprint-38/semantic-edge-e2e-validation.json']);
    expect(hash(read('tracelab-repin/package-lock.before.json'))).toBe(before.frontendFiles['frontend/package-lock.json']);
    expect(hash(read('tracelab-repin/package.before.json'))).toBe(before.frontendFiles['frontend/package.json']);
  });

  it('applies the prepared sequence only to a test copy and invalidates exactly the two stale lock entries', () => {
    const temp = mkdtempSync(join(tmpdir(), 'oods-s197-repin-test-'));
    try {
      mkdirSync(join(temp, 'vendor'));
      copyFileSync(join(repin, 'package.before.json'), join(temp, 'package.json'));
      copyFileSync(join(repin, 'package-lock.before.json'), join(temp, 'package-lock.json'));
      execFileSync(process.execPath, [join(repin, 'prepare-consumer-repin.mjs'), temp]);
      const actual = JSON.parse(readFileSync(join(temp, 'package-lock.json'), 'utf8'));
      const expected = json('tracelab-repin/package-lock.before.json');
      for (const key of ['tokens', 'tw-variants']) delete expected.packages[`node_modules/@oods/${key}`];
      expect(actual).toEqual(expected);
      for (const entry of json('tracelab-repin/oods-provenance.json').packages) expect(hash(readFileSync(join(temp, entry.file)))).toBe(entry.sha256);
      const snapshot = readFileSync(join(temp, 'package-lock.json'));
      writeFileSync(join(temp, 'package.json'), '{"name":"different-consumer"}');
      expect(() => execFileSync(process.execPath, [join(repin, 'prepare-consumer-repin.mjs'), temp], { stdio: 'pipe' })).toThrow();
      expect(readFileSync(join(temp, 'package-lock.json'))).toEqual(snapshot);
    } finally { rmSync(temp, { recursive: true, force: true }); }
  });
});
