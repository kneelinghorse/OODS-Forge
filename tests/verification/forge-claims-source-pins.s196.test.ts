import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { canonicalize, sha256 } from '../../packages/artifacts/src/index.js';
import type { NormalizedVizSpec } from '@oods/viz-core';
import { RenderObject } from '../../src/components/RenderObject.js';
import { createSubscriptionObjectSpec } from '../../src/objects/subscription/object.js';
import activeSubscription from '../../src/fixtures/subscription/active.json';
import { handle as pipeline } from '../../packages/mcp-server/src/tools/pipeline.js';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { handle as render } from '../../packages/mcp-server/src/tools/repl.render.js';
import { handle as fidelity } from '../../packages/mcp-server/src/tools/fidelity.preview.js';
import { validateSchema } from '../../packages/mcp-server/src/tools/repl.utils.js';
import { evaluateEChartsDeterminism } from '../../packages/mcp-server/src/tools/certify-echarts-emit.js';
import { evaluateCategoricalRoleC } from '../../packages/mcp-server/src/tools/certify-contrast.js';
import { CVD_TYPES, MACHADO_2009_SEVERITY_100, simulateCvd } from '../../packages/mcp-server/src/tools/cvd-machado.js';
import { resolveCategoricalPalette } from '../../packages/viz-core/src/tokens/categorical-palette.js';
import { loadObject } from '../../packages/mcp-server/src/objects/object-loader.js';
import { MOBILE_DEFERRED_TYPES } from '../../packages/tokens/scripts/mobile-manifest.mjs';
import type { UiSchema } from '../../packages/mcp-server/src/schemas/generated.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const read = (file: string) => readFileSync(resolve(ROOT, file), 'utf8');
const json = (file: string) => JSON.parse(read(file));
const templates = json('scripts/docs/forge-claims.templates.json') as Record<string, Record<string, string>>;
const html = templates['docs/how-forge-works.html']!;
const readme = templates['docs/README.md']!;
const tokensCss = read('packages/tokens/dist/css/tokens.css');
const tokenConfig = createRequire(import.meta.url)(resolve(ROOT, 'packages/tokens/style-dictionary.config.cjs'));

/** Inspect executable calls, excluding comments that merely repeat a claimed count. */
function functionCalls(file: string, name: string): ts.CallExpression[] {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  let body: ts.FunctionDeclaration | undefined;
  source.forEachChild(node => { if (ts.isFunctionDeclaration(node) && node.name?.text === name) body = node; });
  if (!body) throw new Error(`Missing source function ${file}#${name}`);
  const calls: ts.CallExpression[] = [];
  const visit = (node: ts.Node) => { if (ts.isCallExpression(node)) calls.push(node); ts.forEachChild(node, visit); };
  visit(body);
  return calls;
}

function leaves(value: unknown): Array<{ type: string; value: unknown }> {
  if (!value || typeof value !== 'object') return [];
  if ('$type' in value && '$value' in value) return [{ type: String(value.$type), value: value.$value }];
  return Object.values(value).flatMap(leaves);
}

describe('authored Forge claim literals remain bound to executable sources and qualified examples (s196 m04)', () => {
  it('runs the four documented generation stages through the real pipeline', async () => {
    expect(html['generation-path']).toContain('four stages');
    expect(html['generation-path']).toContain('compose, validate, render and generate');
    const result = await pipeline({ object: 'User', context: 'card', framework: 'html', options: { renderApply: false } });
    expect(result.error).toBeUndefined();
    expect(result.pipeline.steps).toEqual(['compose', 'validate', 'render', 'codegen']);
    expect(result.pipeline.steps).toHaveLength(4);
    expect(result.render?.meta.status).toBe('ok');
    expect(result.code?.framework).toBe('html');
  });

  it('compiles or projects twice and retains independent canonical ECharts specifications', () => {
    expect(html['determinism-scope']).toContain('Two independent compiled or projected specifications');
    const certifyPath = 'packages/mcp-server/src/tools/artifact.certify.ts';
    expect(functionCalls(certifyPath, 'handle').filter(call => call.expression.getText() === 'certifyAtScope')).toHaveLength(1);
    const compiledCalls = functionCalls(certifyPath, 'certifyAtScope').filter(call => call.expression.getText() === 'toVegaLiteSpec');
    expect(compiledCalls).toHaveLength(2);
    const projectedCalls = functionCalls('packages/mcp-server/src/tools/certify-echarts-emit.ts', 'evaluateEChartsDeterminism');
    expect(projectedCalls.filter(call => call.expression.getText() === 'emitRawEChartsOption')).toHaveLength(2);
    expect(projectedCalls.filter(call => call.expression.getText() === 'projectEChartsOption')).toHaveLength(2);
    const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 'viz:treemap', name: 'Totals', data: { values: [] }, marks: [{ trait: 'MarkTreemap' }], encoding: {}, a11y: { description: 'A treemap comparing two category totals.' } } as NormalizedVizSpec;
    const result = evaluateEChartsDeterminism(spec, 'treemap', { type: 'nested', data: { name: 'Total', value: 10, children: [{ name: 'A', value: 6 }, { name: 'B', value: 4 }] } });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.stable).toBe(true);
    expect(result.firstProjected).not.toBe(result.secondProjected);
    expect(result.firstProjected).toEqual(result.secondProjected);
    expect(result.firstCanonical).toBe(canonicalize(result.firstProjected));
    expect(result.secondCanonical).toBe(canonicalize(result.secondProjected));
    expect(result.contentHash).toBe(sha256(result.firstCanonical));
    result.firstProjected.__mutationProbe = true;
    expect(result.secondProjected).not.toHaveProperty('__mutationProbe');
  });

  it('grades the documented 3:1 non-text boundary instead of accepting nearby failing paints', () => {
    expect(html['contrast-thresholds']).toContain('3:1');
    expect(html['contrast-thresholds']).toContain('WCAG 1.4.11');
    const pass = evaluateCategoricalRoleC(['#949494'], {}, '#FFFFFF');
    const fail = evaluateCategoricalRoleC(['#959595'], {}, '#FFFFFF');
    expect(pass.verdict).toBe('pass');
    expect(pass.minimumRatio).toBeGreaterThanOrEqual(3);
    expect(fail.verdict).toBe('fail');
    expect(fail.minimumRatio).toBeLessThan(3);
    expect(fail.failingPaints).toEqual(['#959595']);
    expect(read('packages/mcp-server/src/tools/certify-contrast.ts')).toContain('WCAG 1.4.11 non-text contrast');
  });

  it('uses all three Machado matrices in the categorical distinguishability evaluator', () => {
    expect(html['contrast-thresholds']).toContain('three colour-vision-deficiency simulations');
    expect([...CVD_TYPES].sort()).toEqual(['deuteran', 'protan', 'tritan']);
    expect(Object.keys(MACHADO_2009_SEVERITY_100).sort()).toEqual([...CVD_TYPES].sort());
    for (const type of CVD_TYPES) {
      expect(MACHADO_2009_SEVERITY_100[type]).toHaveLength(3);
      for (const row of MACHADO_2009_SEVERITY_100[type]) expect(row).toHaveLength(3);
      expect(simulateCvd('#FF0000', type)).toMatch(/^#[0-9A-F]{6}$/);
      expect(simulateCvd('#FF0000', type)).not.toBe('#FF0000');
    }
    const calls = functionCalls('packages/mcp-server/src/tools/certify-contrast.ts', 'minPairwiseDeltaEOverCvd');
    expect(calls.filter(call => call.expression.getText() === 'simulateCvd')).toHaveLength(2);
    let simulationLoop: ts.Node | undefined = calls.find(call => call.expression.getText() === 'simulateCvd');
    while (simulationLoop && !ts.isForOfStatement(simulationLoop)) simulationLoop = simulationLoop.parent;
    expect(simulationLoop && ts.isForOfStatement(simulationLoop) ? simulationLoop.expression.getText() : undefined).toBe('CVD_TYPES');
    expect(calls.some(call => call.expression.getText() === 'Math.min')).toBe(true);
  });

  it('exercises the documented React view engine and HTML tool renderer as distinct paths', async () => {
    expect(html['renderer-layouts']).toContain('two renderers');
    expect(html['renderer-layouts']).toContain('React <b>view engine</b>');
    expect(html['renderer-layouts']).toContain("tools' <b>HTML renderer</b>");
    const react = renderToStaticMarkup(createElement(RenderObject, { object: createSubscriptionObjectSpec(), context: 'detail', data: activeSubscription }));
    expect(react).toContain('data-view-context="detail"');
    const result = await render({ mode: 'full', apply: true, brand: 'A', schema: { version: '1.0', theme: 'light', screens: [{ id: 'screen', component: 'Stack', children: [{ id: 'text', component: 'Text', props: { content: 'Tool renderer proof' } }] }] } });
    expect(result.status).toBe('ok');
    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.html).toContain('Tool renderer proof');
    expect(result.html).toContain('data-brand="A"');
    expect(result.html).not.toContain('data-view-context="detail"');
  });

  it('accepts both deprecated fidelity aliases with the actual one-release warning', async () => {
    expect(html['fidelity-and-datasets']).toContain('brand-a/brand-b aliases remain for one release');
    for (const alias of ['brand-a', 'brand-b']) {
      const result = await fidelity({ fidelityKind: 'branded-mockup', manifest: json('packages/mcp-server/src/object-catalog/fixtures/user.json'), options: { brandOverlay: alias } });
      expect(result.errors).toEqual([]);
      expect(result.html.length).toBeGreaterThan(0);
      expect(result.warnings).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'OODS-BM-004', message: expect.stringContaining('Compatibility is limited to one release.') })]));
    }
  });

  it('describes the actual shared font families and scope-resolved overridable palette', () => {
    const scope = html['native-token-scope']!;
    expect(scope).toContain('global sans and display font stacks');
    const families = json('packages/tokens/src/tokens/base/typography.json').ref.typography.families;
    expect(Object.keys(families).sort()).toEqual(['display', 'sans']);
    expect(leaves(families).every(token => token.type === 'fontFamily')).toBe(true);
    expect(new Set(leaves(families).map(token => token.value)).size).toBe(2);
    for (const brand of ['A', 'B']) for (const theme of ['base', 'dark', 'hc']) expect(leaves(json(`packages/tokens/src/tokens/brands/${brand}/${theme}.json`)).filter(token => token.type === 'fontFamily')).toEqual([]);
    expect(scope).toContain('palette resolves by brand and theme and accepts explicit token overrides');
    const light = resolveCategoricalPalette({} as NormalizedVizSpec, { brand: 'A', theme: 'light' });
    const dark = resolveCategoricalPalette({} as NormalizedVizSpec, { brand: 'B', theme: 'dark' });
    expect(light.length).toBeGreaterThan(0);
    expect(dark).not.toEqual(light);
    const overridden = resolveCategoricalPalette({ config: { tokens: { '--oods-viz-scale-categorical-01': '#FF00FF' } } } as NormalizedVizSpec, { brand: 'A', theme: 'light' });
    expect(overridden[0]).toBe('#FF00FF');
    expect(overridden.slice(1)).toEqual(light.slice(1));
  });

  it('binds mobile output to one default scope and its explicit font/easing deferral', () => {
    expect(html['native-token-scope']).toContain('one default brand × theme and omit font stacks and easing curves');
    const dictionaries = functionCalls('packages/tokens/scripts/build.mjs', 'runBuild').filter(call => call.expression.getText() === 'dictionaryForScope');
    expect(dictionaries).toHaveLength(1);
    expect(dictionaries[0]!.arguments.map(argument => argument.getText())).toEqual(['oodsScoping.DEFAULT_SCOPE', 'nonCssPlatformConfigs()']);
    expect(tokenConfig.oodsScoping.BRAND_SCOPES.filter((scope: unknown) => JSON.stringify(scope) === JSON.stringify(tokenConfig.oodsScoping.DEFAULT_SCOPE))).toHaveLength(1);
    expect(Object.keys(MOBILE_DEFERRED_TYPES).sort()).toEqual(['cubicBezier', 'fontFamily']);
    for (const file of ['packages/tokens/dist/ios-swift/OodsTokens.swift', 'packages/tokens/dist/compose/OodsTokens.kt']) {
      const output = read(file);
      expect(output).toContain(`${MOBILE_DEFERRED_TYPES.cubicBezier} easing curves ($type cubicBezier)`);
      expect(output).toContain(`${MOBILE_DEFERRED_TYPES.fontFamily} font stacks ($type fontFamily)`);
      for (const family of leaves(json('packages/tokens/src/tokens/base/typography.json').ref.typography.families)) expect(output).not.toContain(String(family.value));
      expect(output).not.toMatch(/(?:static let|\bval)\s+\w*[Ee]asing/);
    }
  });

  it('qualifies the four-role diagram and five real object examples without inventing a namespace or prevalence census', () => {
    const architecture = readme['token-architecture']!;
    const roles = [...architecture.matchAll(/Layer \(--([a-z]+)-\*\)/g)].map(match => match[1]);
    expect(roles).toEqual(['mod', 'cmp', 'theme', 'ref']);
    expect(architecture).toContain('four design roles');
    expect(architecture).toContain('not a count of implemented token namespaces');
    expect(architecture).toContain('modifier layer is a conceptual role');
    // The qualification matters: the current generated output also has a system namespace.
    expect(/--sys-[\w-]+:/.test(tokensCss)).toBe(true);
    const quintet = readme['quintet-example']!;
    const examples = [...quintet.matchAll(/^\d+\. \*\*([A-Za-z]+)\//gm)].map(match => match[1]);
    expect(examples).toEqual(['User', 'Product', 'Transaction', 'Organization', 'Relationship']);
    expect(examples).toHaveLength(5);
    for (const name of examples) expect(loadObject(name).object.name).toBe(name);
    expect(quintet).toContain('not a measured prevalence claim');
    expect(quintet).not.toContain('100%');
  });

  it('validates the illustrative 1.0/0.92 UiSchema and rejects invalid version/confidence variants', async () => {
    const example = html['source-example-6']!;
    expect(example).toContain('Illustrative UiSchema shape');
    const tree = JSON.parse(example.match(/<pre><code>([\s\S]+)<\/code><\/pre>/)![1]) as UiSchema;
    expect(tree.version).toBe('1.0');
    expect(tree.screens[0]!.children![1]!.meta?.confidence).toBe(0.92);
    expect(validateSchema(tree)).toEqual([]);
    const badConfidence = structuredClone(tree);
    badConfidence.screens[0]!.children![1]!.meta!.confidence = 1.01;
    expect(validateSchema(badConfidence).length).toBeGreaterThan(0);
    const badVersion = { ...tree, version: '' };
    expect(validateSchema(badVersion).length).toBeGreaterThan(0);
    const actual = await compose({ object: 'User', context: 'card' });
    expect(actual.status).toBe('ok');
    expect(validateSchema(actual.schema)).toEqual([]);
  });

  it('publishes a B/dark example selector and semantic slots that exist in built CSS', () => {
    const example = html['source-example-5']!;
    const selector = example.match(/<code>([^{}]+)\s*\{/)![1]!.trim();
    expect(tokenConfig.oodsScoping.selectorsForScope({ brand: 'B', theme: 'dark' })).toContain(selector);
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blocks = [...tokensCss.matchAll(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, 'g'))].map(match => match[1]!);
    expect(blocks.length).toBeGreaterThan(0);
    const slots = [...example.matchAll(/(--[a-z-]+):/g)].map(match => match[1]);
    expect(slots).toEqual(['--theme-surface-canvas', '--theme-text-primary']);
    for (const slot of slots) expect(blocks.some(block => block.includes(`${slot}:`)), `${slot} must be emitted in the illustrated scope`).toBe(true);
  });
});
