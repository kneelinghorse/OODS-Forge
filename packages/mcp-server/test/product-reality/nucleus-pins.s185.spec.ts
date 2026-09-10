import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { NUCLEUS_COMPONENT_IDS } from '@oods/component-contracts';
import { describe, expect, it } from 'vitest';

// Sprint 185 m01 (#1725): every live assertion about nucleus membership derives
// its expectation from NUCLEUS_COMPONENT_IDS — inside packed consumers, from the
// packed @oods/component-contracts tarball — never from a literal count or a
// hand-written id list. This spec is the grep-level invariant that keeps a
// retired literal from silently returning. The measured pin inventory
// (artifacts/product-reality/sprint-185/m01/pin-inventory.json) names every
// site, its old literal and its new derivation; the generic patterns below
// catch the same shapes anywhere in the live scope.

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const inventoryPath = 'artifacts/product-reality/sprint-185/m01/pin-inventory.json';

const FROZEN_GENERATORS = [
  'scripts/product-reality/generate-s182-m05-closeout.mjs',
  'scripts/product-reality/generate-s183-m06-closeout.mjs',
];
/** Files that name the retired shapes as data, not as assertions. */
const SELF_REFERENTIAL = [
  'packages/mcp-server/test/product-reality/nucleus-pins.s185.spec.ts',
  'scripts/product-reality/s185-m01-pin-inventory.mjs',
];
const LIVE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.mjs', '.js', '.cjs']);

type PinSite = {
  id: string;
  file: string;
  disposition: 'derive' | 'retire' | 'convert-to-history' | 'keep-as-read-only' | 'keep-as-showcase-fixture';
  oldSource: string | null;
  newSource: string | null;
};

type PinInventory = {
  sites: PinSite[];
  literalListAllowlist: Array<{ file: string; reason: string }>;
};

/** Live nucleus pins that must never come back, by shape. */
const FORBIDDEN_SHAPES: Array<{ name: string; pattern: RegExp }> = [
  { name: 'NUCLEUS_COMPONENT_IDS compared to a literal length', pattern: /NUCLEUS_COMPONENT_IDS\)\.toHaveLength\(\d+\)/ },
  { name: 'COMPONENT_STYLE_IDS compared to a literal length', pattern: /COMPONENT_STYLE_IDS\)\.toHaveLength\(\d+\)/ },
  { name: 'componentContracts keys/values compared to a literal length', pattern: /\bcomponentContracts\)\)?\.toHaveLength\(\d+\)/ },
  { name: 'sharedScenarios id set compared to a literal size', pattern: /sharedScenarios[^\n]*\)\.size\)\.toBe\(\d+\)/ },
  // The 109-row controlling denominator (#1726) is a different number and is allowed.
  { name: 'readiness rows compared to a literal count in a packed consumer', pattern: /(?:readiness|document)\.rows\.length !== (?!109\b)\d+/ },
  { name: 'readiness rows compared to a literal length', pattern: /\b\w*[Rr]eadiness(?:\[[^\]\n]+\])?\.rows\)\.toHaveLength\(\s*\d+\s*,?\s*\)/ },
  { name: 'packed readiness proof compared to literal counts', pattern: /readiness: \{ react: \d+, vue: \d+ \}/ },
  { name: 'a hand-written EXPECTED_NUCLEUS_IDS list', pattern: /EXPECTED_NUCLEUS_IDS/ },
  { name: 'the frozen generator nucleus constant', pattern: /FROZEN_NUCLEUS/ },
];

/** The alphabetical 14-family literal that used to stand in for the nucleus. */
const HAND_WRITTEN_NUCLEUS_LIST = /['"]Badge['"],\s*['"]Banner['"],\s*['"]Button['"],\s*['"]Card['"],\s*['"]Checkbox['"]/;

function walk(directory: string, output: string[]): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolutePath, output);
    else if (LIVE_EXTENSIONS.has(path.extname(entry.name))) output.push(absolutePath);
  }
}

function liveScopeFiles(): string[] {
  const files: string[] = [];
  const packagesRoot = path.join(repositoryRoot, 'packages');
  for (const packageName of readdirSync(packagesRoot)) {
    const testRoot = path.join(packagesRoot, packageName, 'test');
    try {
      if (statSync(testRoot).isDirectory()) walk(testRoot, files);
    } catch {
      // no test directory
    }
    const sourceTests: string[] = [];
    const sourceRoot = path.join(packagesRoot, packageName, 'src');
    try {
      if (statSync(sourceRoot).isDirectory()) walk(sourceRoot, sourceTests);
      files.push(...sourceTests.filter(file => /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file)));
    } catch {
      // no source directory
    }
  }
  walk(path.join(repositoryRoot, 'tests'), files);
  walk(path.join(repositoryRoot, 'scripts', 'product-reality'), files);
  return files
    .map((file) => path.relative(repositoryRoot, file))
    .filter((file) => !FROZEN_GENERATORS.includes(file) && !SELF_REFERENTIAL.includes(file))
    .sort();
}

function read(relativePath: string): string {
  return readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

const inventory = JSON.parse(read(inventoryPath)) as PinInventory;

describe('Sprint 185 m01 — every live nucleus pin derives from NUCLEUS_COMPONENT_IDS (#1725)', () => {
  it('the nucleus itself is a non-empty, unique, code-point-sorted id list', () => {
    expect(NUCLEUS_COMPONENT_IDS.length).toBeGreaterThan(0);
    expect(new Set(NUCLEUS_COMPONENT_IDS).size).toBe(NUCLEUS_COMPONENT_IDS.length);
    expect([...NUCLEUS_COMPONENT_IDS]).toEqual([...NUCLEUS_COMPONENT_IDS].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  });

  it('no retired literal from the pin inventory is present in its file, and every derivation is', () => {
    const problems: string[] = [];
    for (const site of inventory.sites) {
      if (!['derive', 'retire', 'convert-to-history'].includes(site.disposition)) continue;
      let text: string;
      try {
        text = read(site.file);
      } catch {
        continue; // a retired file may be gone entirely
      }
      if (site.oldSource && text.includes(site.oldSource.trim())) problems.push(`${site.id}: old literal still present`);
      // Sprint 186 folds the historical subset into the root. Its union-size
      // assertion still derives from the nucleus, now without double counting
      // the compatibility alias; the historical inventory stays immutable.
      const currentDerivation = site.id === 'ported-contracts-union-22'
        ? 'expect(new Set([...NUCLEUS_COMPONENT_IDS, ...PORTED_COMPONENT_IDS]).size).toBe(\n      NUCLEUS_COMPONENT_IDS.length,'
        // s192-m03/m05 version every governed contract at 1.1; the original
        // inventory remains historical, and current membership still derives.
        : site.id === 'contract-resolution-entries-14'
          ? 'expect(Object.keys(componentContracts).sort()).toEqual([...NUCLEUS_COMPONENT_IDS].sort());'
        : site.newSource;
      if (currentDerivation && !text.includes(currentDerivation.trim())) problems.push(`${site.id}: derivation missing`);
    }
    expect(problems).toEqual([]);
  });

  it('no live test or script compares nucleus membership to a literal count', () => {
    const offenders: string[] = [];
    for (const file of liveScopeFiles()) {
      const text = read(file);
      for (const shape of FORBIDDEN_SHAPES) {
        if (shape.pattern.test(text)) offenders.push(`${file}: ${shape.name}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('includes source and root tests and rejects indexed readiness counts while allowing derived membership', () => {
    const files = liveScopeFiles();
    expect(files).toContain('packages/mcp-server/src/codegen/ported-target-readiness.s184.test.ts');
    expect(files).toContain('tests/verification/how-forge-works.contract.test.ts');
    const shape = FORBIDDEN_SHAPES.find(row => row.name === 'readiness rows compared to a literal length')!;
    expect(shape.pattern.test('expect(mergedReadiness[framework].rows).toHaveLength(22)')).toBe(true);
    expect(shape.pattern.test('expect(mergedReadiness[framework].rows).toHaveLength(\n  22,\n)')).toBe(true);
    expect(shape.pattern.test('expect(mergedReadiness[framework].rows).toHaveLength(NUCLEUS_COMPONENT_IDS.length + PORTED_COMPONENT_IDS.length)')).toBe(false);
  });

  it('the hand-written 14-family list survives only in declared showcase fixtures and history scripts', () => {
    // s192 widens both live harnesses; retain the historical inventory verbatim.
    const widenedHarnesses = ['packages/components-react/test/visual-evidence.mjs', 'packages/components-vue/test/visual-evidence.mjs'];
    for (const file of widenedHarnesses) {
      expect(read(file)).toContain('NUCLEUS_COMPONENT_IDS');
      expect(HAND_WRITTEN_NUCLEUS_LIST.test(read(file))).toBe(false);
    }
    const allowlist = new Map(inventory.literalListAllowlist.filter(entry => !widenedHarnesses.includes(entry.file)).map((entry) => [entry.file, entry.reason]));
    const offenders: string[] = [];
    for (const file of liveScopeFiles()) {
      if (!HAND_WRITTEN_NUCLEUS_LIST.test(read(file))) continue;
      if (!allowlist.has(file)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
    for (const [file, reason] of allowlist) {
      expect(reason.length, file).toBeGreaterThan(0);
      expect(HAND_WRITTEN_NUCLEUS_LIST.test(read(file)), `${file} is allowlisted but carries no list`).toBe(true);
    }
  });
});
