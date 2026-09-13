import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadCanonicalColorTokens } from '../../scripts/tokens/canonical-colors.js';
import { evaluateGuardrail, loadGuardrails } from '../../scripts/tokens/color-guardrails.js';
// @ts-expect-error -- the pre-freeze runner is native ESM.
import { commands } from '../../scripts/product-reality/s198-prefreeze.mjs';
import { generatePaletteFiles, loadPaletteSeeds } from '../../scripts/tokens/generate-palette.js';

const root = path.resolve(import.meta.dirname, '../..');
describe('canonical guardrails protect the colors consumers receive', () => {
  it('grades all six states from canonical source and detects a reverted generator value', async () => {
    const tokens = await loadCanonicalColorTokens(root);
    expect(tokens.length).toBeGreaterThan(100);
    expect(tokens.every(token => token.source.startsWith(path.join(root, 'packages/tokens/src/')))).toBe(true);
    const map = new Map(tokens.map(token => [token.path.join('.'), token]));
    const rules = (await loadGuardrails(path.join(root, 'tools/a11y/guardrails/relative-color.csv')))
      .filter(rule => rule.checkType === 'relative-color');
    expect(rules).toHaveLength(6);
    const palette = (await loadGuardrails(path.join(root, 'tools/a11y/guardrails/relative-color.csv'))).filter(rule => rule.checkType !== 'relative-color');
    expect(palette.every(rule => rule.source?.startsWith('packages/tokens/src/'))).toBe(true);
    for (const rule of rules) {
      expect(evaluateGuardrail(rule, map).failures, rule.id).toEqual([]);
      const changed = new Map(map);
      changed.set(rule.derivedToken, { ...map.get(rule.derivedToken)!, value: map.get(rule.baseToken)!.value });
      expect(evaluateGuardrail(rule, changed).failures.length, `${rule.id} must reject indistinguishable states`).toBeGreaterThan(0);
    }
  });
  it('keeps gate entry points off the legacy tree and shares build scope selection', () => {
    const color = readFileSync(path.join(root, 'scripts/tokens/color-guardrails.ts'), 'utf8');
    const transform = readFileSync(path.join(root, 'scripts/tokens/transform.ts'), 'utf8');
    const canonical = readFileSync(path.join(root, 'scripts/tokens/canonical-colors.ts'), 'utf8');
    const enumGate = readFileSync(path.join(root, 'scripts/lint/enum-to-token.ts'), 'utf8');
    expect(enumGate).toContain('packages/tokens/src/maps/saas-billing.status-map.json');
    expect(enumGate).not.toContain("path.join(ROOT, 'tokens/");
    expect(color).toContain('loadCanonicalColorTokens(projectRoot)');
    expect(transform).toContain('packages/tokens/scripts/build.mjs');
    expect(transform).toContain("options.mode === 'check' ? ['--check']");
    const workflow = readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8').split('  tokens-validate:')[1].split('\n  tokens-governance:')[0];
    expect(workflow.indexOf('run: pnpm run build:tokens')).toBeGreaterThan(-1);
    expect(workflow.indexOf('run: pnpm run build:tokens')).toBeLessThan(workflow.indexOf('run: pnpm run tokens-validate'));

    expect(canonical).toContain('resolveScopeFiles');
    for (const source of [color, transform, canonical]) expect(source).not.toMatch(/(?:resolve|join)\(projectRoot, ['"]tokens['"]\)/);
  });
  it('keeps existing billing app imports compatible with the canonical gate manifest', () => {
    expect(readFileSync(path.join(root, 'tokens/maps/saas-billing.status-map.json'), 'utf8')).toBe(readFileSync(path.join(root, 'packages/tokens/src/maps/saas-billing.status-map.json'), 'utf8'));
  });
  it('checks readiness before the freeze and the full capture', () => {
    expect(commands[0]).toEqual(['readiness', ['pnpm', 'exec', 'tsx', 'scripts/product-reality/s196-release-readiness.ts', '--check']]);
  });
  it('derives unbranded interaction and accent fixes without changing any chart palette', async () => {
    const files = generatePaletteFiles(await loadPaletteSeeds());
    const light = JSON.parse(files.get('packages/tokens/src/tokens/themes/theme0/surface.json')!).theme.surface.interactive.primary;
    expect(light.hover.$extensions.ods.relative).toContain('calc(l - 0.10) calc(c + 0.015)');
    expect(light.pressed.$extensions.ods.relative).toContain('calc(l - 0.14) calc(c + 0.025)');
    const values = (node: any): any => node && typeof node === 'object'
      ? '$value' in node ? node.$value : Object.fromEntries(Object.entries(node).filter(([key]) => !key.startsWith('$')).map(([key, value]) => [key, values(value)])) : node;
    const frozen = JSON.parse(readFileSync(path.join(root, 'artifacts/product-reality/sprint-198/m01/golden-migration/frozen-viz.json'), 'utf8'));
    for (const [file, viz] of Object.entries(frozen)) expect(values(JSON.parse(files.get(file)!).viz), file).toEqual(viz);
  });
});
