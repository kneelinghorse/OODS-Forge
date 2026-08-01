// s166 m04 — Stage1 fig_local_tokens → DTCG adapter v0 proof suite.
//
// Three layers, all hermetic to this repo:
//  1. UNIT — synthetic fixtures pin every conversion rule (scope skip, mode split,
//     Light-or-first base, identical-duplicate merge, first-wins collision RECORDING,
//     leaf-vs-group rename, null-unresolved, font-weight mapping).
//  2. ARTIFACT CONFORMANCE — the committed Parts Town output (the s167 brand seed's raw
//     material) parses, every leaf is a $type/$value DTCG token, and the leaf count
//     matches the committed coverage report (the report cannot silently drift from the
//     artifact it describes).
//  3. SD INGEST — the committed base set builds through the SAME machinery as the
//     packages/tokens build (style-dictionary + tokens-studio preprocessor + expand
//     typesMap + css/variables), proving "tokens.build ingests it without error".
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import StyleDictionary from 'style-dictionary';
import { register as registerSdTransforms, expandTypesMap } from '@tokens-studio/sd-transforms';
import {
  convertFigLocalTokens,
  slugifyMode,
  type DtcgNode,
  type FigLocalTokensFile,
} from '../../tools/stage1-dtcg/adapter.js';

const ARTIFACT_DIR = path.resolve(__dirname, '../../artifacts/tokens/partstown');

function figFile(tokens: FigLocalTokensFile['tokens']): FigLocalTokensFile {
  return {
    kind: 'fig_local_tokens',
    version: '1.0.0',
    generated_at: '2026-07-27T18:12:44.530Z',
    source: { file_label: 'unit-fixture', fig_version: 1 },
    tokens,
  };
}

function leaves(node: DtcgNode, prefix: string[] = []): Array<{ path: string; token: Record<string, unknown> }> {
  const found: Array<{ path: string; token: Record<string, unknown> }> = [];
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    const child = value as Record<string, unknown>;
    if (child && typeof child === 'object' && '$value' in child) {
      found.push({ path: [...prefix, key].join('/'), token: child });
    } else if (child && typeof child === 'object') {
      found.push(...leaves(child as DtcgNode, [...prefix, key]));
    }
  }
  return found;
}

describe('stage1-dtcg adapter — unit conversion rules', () => {
  it('rejects a non-fig_local_tokens input loudly', () => {
    expect(() => convertFigLocalTokens({ kind: 'something_else', tokens: [] })).toThrow(
      /Unsupported input kind/
    );
  });

  it('converts color/number/text_style and SKIPS other kinds with counts (never silently)', () => {
    const { base, report } = convertFigLocalTokens(
      figFile([
        { name: 'Brand/Red', kind: 'color', values: [{ mode: 'Light', value: '#c8102e' }] },
        { name: 'Spacing/S', kind: 'number', values: [{ mode: 'Value', value: 8 }] },
        {
          name: 'Heading/H4',
          kind: 'text_style',
          values: [{ value: { fontFamily: 'Effra', fontSize: 20, fontStyle: 'Bold' } }],
        },
        { name: 'Copy/CTA', kind: 'string', values: [{ value: 'Buy' }] },
        { name: 'Show Heart', kind: 'boolean', values: [{ value: false }] },
      ])
    );
    const found = leaves(base);
    expect(found.map((leaf) => leaf.path).sort()).toEqual(['Brand/Red', 'Heading/H4', 'Spacing/S']);
    expect(report.inScope).toBe(3);
    expect(report.converted).toBe(3);
    expect(report.skippedByKind).toEqual({ string: 1, boolean: 1 });
  });

  it('maps text_style to DTCG typography (px size, name AND numeric weight forms)', () => {
    const { base, report } = convertFigLocalTokens(
      figFile([
        {
          name: 'H1',
          kind: 'text_style',
          values: [{ value: { fontFamily: 'Museo Slab', fontSize: 32, fontStyle: '900' } }],
        },
        {
          name: 'Body',
          kind: 'text_style',
          values: [{ value: { fontFamily: 'Effra', fontSize: 16, fontStyle: 'Semibold' } }],
        },
      ])
    );
    const found = Object.fromEntries(leaves(base).map((leaf) => [leaf.path, leaf.token]));
    expect(found['H1'].$value).toEqual({
      fontFamily: 'Museo Slab',
      fontSize: '32px',
      fontWeight: 900,
      fontStyle: 'normal',
    });
    expect(found['Body'].$value).toEqual({
      fontFamily: 'Effra',
      fontSize: '16px',
      fontWeight: 600,
      fontStyle: 'normal',
    });
    expect(report.unmappedFontStyles).toEqual([]);
  });

  it('splits modes: Light (or first) becomes base, every other mode an overlay set', () => {
    const { base, modes, report } = convertFigLocalTokens(
      figFile([
        {
          name: 'Surface/Canvas',
          kind: 'color',
          values: [
            { mode: 'Wireframe', value: '#eeeeee' },
            { mode: 'Light', value: '#ffffff' },
            { mode: 'Dark', value: '#111111' },
          ],
        },
        {
          name: 'Grid/Columns',
          kind: 'number',
          // No Light mode: FIRST listed value is base (disclosed heuristic).
          values: [
            { mode: 'Desktop', value: 12 },
            { mode: 'Mobile', value: 4 },
          ],
        },
      ])
    );
    expect(leaves(base).map((leaf) => leaf.token.$value)).toEqual(['#ffffff', 12]);
    expect(leaves(modes['wireframe']).map((leaf) => leaf.token.$value)).toEqual(['#eeeeee']);
    expect(leaves(modes['dark']).map((leaf) => leaf.token.$value)).toEqual(['#111111']);
    expect(leaves(modes['mobile']).map((leaf) => leaf.token.$value)).toEqual([4]);
    expect(report.baseModeChoices).toEqual({ Light: 1, Desktop: 1 });
    expect(modes['desktop']).toBeUndefined();
  });

  it('merges identical duplicates silently-but-counted; RECORDS first-wins collisions', () => {
    const { base, report } = convertFigLocalTokens(
      figFile([
        { name: 'Neutrals/White', kind: 'color', values: [{ mode: 'Light', value: '#ffffff' }] },
        { name: 'Neutrals/White', kind: 'color', values: [{ mode: 'Light', value: '#ffffff' }] },
        { name: 'Neutrals/Gray 3', kind: 'color', values: [{ mode: 'Light', value: '#d9d9d6' }] },
        { name: 'Neutrals/Gray 3', kind: 'color', values: [{ mode: 'Light', value: '#e7eef0' }] },
      ])
    );
    expect(report.identicalDuplicatesMerged).toBe(1);
    expect(report.collisions).toEqual([
      {
        path: 'Neutrals/Gray 3',
        set: 'base',
        kept: { $type: 'color', $value: '#d9d9d6' },
        dropped: { $type: 'color', $value: '#e7eef0' },
      },
    ]);
    const found = Object.fromEntries(leaves(base).map((leaf) => [leaf.path, leaf.token]));
    expect(found['Neutrals/Gray 3'].$value).toBe('#d9d9d6');
  });

  it('renames a leaf whose name is also a group prefix (a DTCG node cannot be both)', () => {
    const { base, report } = convertFigLocalTokens(
      figFile([
        { name: 'Primary', kind: 'color', values: [{ value: '#c8102e' }] },
        { name: 'Primary/Hover', kind: 'color', values: [{ value: '#a6192e' }] },
      ])
    );
    const paths = leaves(base).map((leaf) => leaf.path).sort();
    expect(paths).toEqual(['Primary (value)', 'Primary/Hover']);
    expect(report.leafGroupConflictsRenamed).toEqual([{ name: 'Primary', renamedTo: 'Primary (value)' }]);
  });

  it('counts null-valued tokens as unresolved by name, converting nothing for them', () => {
    const { base, report } = convertFigLocalTokens(
      figFile([
        { name: 'Chrome Gradient', kind: 'color', values: [{ mode: 'Light', value: null }] },
        { name: 'Brand/Red', kind: 'color', values: [{ mode: 'Light', value: '#c8102e' }] },
      ])
    );
    expect(report.unresolved).toEqual({ count: 1, names: ['Chrome Gradient'] });
    expect(leaves(base)).toHaveLength(1);
  });

  it('sanitizes DTCG-reserved characters and slugs mode names', () => {
    const { base, modes } = convertFigLocalTokens(
      figFile([
        {
          name: 'Type/v2.5 $special',
          kind: 'number',
          values: [
            { mode: 'Light', value: 1 },
            { mode: 'IC - Light', value: 2 },
          ],
        },
      ])
    );
    expect(leaves(base)[0].path).toBe('Type/v2-5 -special');
    expect(Object.keys(modes)).toEqual(['ic-light']);
    expect(slugifyMode('IC - Light')).toBe('ic-light');
  });
});

describe('stage1-dtcg adapter — committed Parts Town artifact conformance', () => {
  const baseDoc = JSON.parse(
    readFileSync(path.join(ARTIFACT_DIR, 'partstown.base.json'), 'utf8')
  ) as DtcgNode;
  const report = JSON.parse(readFileSync(path.join(ARTIFACT_DIR, 'partstown.coverage.json'), 'utf8'));

  it('every leaf is a $type/$value DTCG token of a v0-scope type', () => {
    const found = leaves(baseDoc);
    expect(found.length).toBeGreaterThan(0);
    for (const { token } of found) {
      expect(['color', 'number', 'typography']).toContain(token.$type);
      expect(token.$value).toBeDefined();
    }
  });

  it('the coverage report matches the artifact it describes (no silent drift)', () => {
    const found = leaves(baseDoc);
    expect(found.length).toBe(report.converted);
    // v0 scope arithmetic over the 2026-07-27 extraction: everything is accounted for.
    expect(report.scopeKinds).toEqual(['color', 'number', 'text_style']);
    expect(report.inScope).toBe(587);
    expect(report.source.totalTokens).toBe(713);
    expect(report.unresolved.count).toBe(4);
    const skipped = Object.values(report.skippedByKind as Record<string, number>).reduce(
      (sum, count) => sum + count,
      0
    );
    expect(report.inScope + skipped).toBe(report.source.totalTokens);
    expect(report.disclosedLimitations.length).toBeGreaterThanOrEqual(4);
  });
});

describe('stage1-dtcg adapter — SD ingest (the tokens.build machinery accepts the output)', () => {
  it('style-dictionary + tokens-studio preprocessor builds css/variables from the base set without error', async () => {
    registerSdTransforms(StyleDictionary);
    const sd = new StyleDictionary({
      source: [path.join(ARTIFACT_DIR, 'partstown.base.json')],
      preprocessors: ['tokens-studio'],
      expand: { typesMap: expandTypesMap },
      log: { warnings: 'disabled', verbosity: 'silent' },
      platforms: {
        css: {
          transformGroup: 'tokens-studio',
          transforms: ['name/kebab'],
          files: [{ destination: 'tokens.css', format: 'css/variables' }],
        },
      },
    });
    await sd.hasInitialized;
    const outputs = await sd.formatAllPlatforms({ cache: false });
    const css = outputs.css?.[0]?.output;
    expect(typeof css).toBe('string');
    // The expand step decomposes each typography token into its parts, so the variable
    // count exceeds the leaf count; the floor pins "every token emitted something".
    const variableCount = (css as string).match(/--[\w-]+:/g)?.length ?? 0;
    expect(variableCount).toBeGreaterThanOrEqual(225);
    expect(css).toContain('#c8102e');
  });
});
