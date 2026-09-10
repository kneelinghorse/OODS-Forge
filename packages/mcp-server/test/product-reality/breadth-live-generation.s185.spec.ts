import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { NUCLEUS_COMPONENT_IDS } from '@oods/component-contracts';
import { describe, expect, it } from 'vitest';
import { handle as generateCode } from '../../src/tools/code.generate.js';
import type { UiSchema } from '../../src/schemas/generated.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const require = createRequire(import.meta.url);
const frameworks = ['react', 'vue'] as const;
const invalidProps = {
  DetailHeader: { title: false }, CardHeader: { supportingText: false },
  ColorSwatch: { color: 42 }, ColorizedBadge: { color: 42 }, VizAreaPreview: { width: 'wide' },
};
const schemaNames = [
  'cmos-messages-redesign', 'plan-form-dark', 'pt-shop-parts-entry-router-v1',
  'user-card-showcase', 'cmos-dashboard-redesign', 'the-academy-landing-v1',
];

describe('Sprint 185 m03 live readiness and root export generation', () => {
  it('preserves predecessor emission evidence while adding measured maturity and later roots', () => {
    for (const framework of frameworks) {
      const relativePath = `packages/components-${framework}/evidence/${framework}-readiness.v1.json`;
      const previous = JSON.parse(execFileSync('git', ['show', `b659a6ee:${relativePath}`], { cwd: root, encoding: 'utf8' }));
      const current = JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
      const previousIds = new Set(previous.rows.map((row: { componentId: string }) => row.componentId));
      expect(current.rows.map((row: { componentId: string }) => row.componentId)).toEqual(NUCLEUS_COMPONENT_IDS);
      for (const row of previous.rows) {
        const measured = current.rows.find((candidate: { componentId: string }) => candidate.componentId === row.componentId);
        // Sprint 192 adds three measurement classes; the original six remain exact.
        expect({ ...measured, evidence: Object.fromEntries(Object.keys(row.evidence).map(key => [key, measured.evidence[key]])) }).toEqual(row);
        for (const key of ['accessibility', 'interaction', 'visualThemes']) {
          expect(measured.evidence[key].status).toBe('passed');
          expect(measured.evidence[key].refs.length).toBeGreaterThan(0);
        }
      }
      // Later waves append further rows behind the same derivation; this sprint's five must be among them.
      expect(current.rows.filter((row: { componentId: string }) => !previousIds.has(row.componentId))
        .map((row: { componentId: string }) => row.componentId)).toEqual(expect.arrayContaining(Object.keys(invalidProps)));
    }
    // The unchanged HTML renderer was a Sprint 185 boundary. Later approved
    // billing recipes must not retroactively change what that mission proved.
    expect(execFileSync('git', ['diff', 'b659a6ee', 'f8d15098ba3bfd47231d489d7659027b5c9f50e3', '--', 'packages/mcp-server/src/render/component-map.ts'], { cwd: root, encoding: 'utf8' })).toBe('');
  });

  for (const framework of frameworks) {
    for (const [component, typedInvalid] of Object.entries(invalidProps)) {
      for (const [kind, props] of Object.entries({ unknown: { bogusProp: 'reject' }, typed: typedInvalid })) {
        it(`${framework}/${component}/${kind} rejects invalid props at the live build boundary`, async () => {
          // No readiness injection: implementations, exports and all evidence
          // refs must resolve before this repeats the m02 contract controls.
          const result = await generateCode({ framework, profile: 'build', schema: {
            version: '1.0', screens: [{ id: 'invalid-breadth', component, props }],
          } });
          expect(result.status).toBe('error');
          expect(result.artifact).toBeUndefined();
          expect(result.validationReceipt.checks).toContain('props-contract');
          expect(result.errors).toEqual([expect.objectContaining({ code: 'OODS-V007', component })]);
        });
      }
    }

    for (const name of schemaNames) {
      it(`${framework}/${name} generates unchanged and every emitted component import resolves`, async () => {
        const schema = JSON.parse(readFileSync(path.join(root,
          `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`), 'utf8')).schema as UiSchema;
        const before = JSON.stringify(schema);
        const result = await generateCode({ schema, framework, profile: 'build' });
        expect(result.status, JSON.stringify(result.errors)).toBe('ok');
        expect(result.artifact).toBeDefined();
        expect(result.errors ?? []).toEqual([]);
        expect(JSON.stringify(schema)).toBe(before);
        const script = framework === 'vue'
          ? result.code.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1]
          : result.code;
        expect(script).toBeTruthy();
        const source = ts.createSourceFile('generated.tsx', script!, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        const importedBreadth: string[] = [];
        for (const statement of source.statements) {
          if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
          const specifier = statement.moduleSpecifier.text;
          if (!specifier.startsWith('@oods/components-') || statement.importClause?.isTypeOnly) continue;
          const resolved = require.resolve(specifier);
          expect(resolved).toContain('/dist/');
          const exports = require(specifier) as Record<string, unknown>;
          const bindings = statement.importClause?.namedBindings;
          if (!bindings || !ts.isNamedImports(bindings)) continue;
          for (const binding of bindings.elements) {
            if (binding.isTypeOnly) continue;
            const symbol = (binding.propertyName ?? binding.name).text;
            expect(exports[symbol], `${specifier}#${symbol}`).toBeDefined();
            if (Object.hasOwn(invalidProps, symbol)) {
              expect(specifier).toBe(`@oods/components-${framework}`);
              importedBreadth.push(symbol);
            }
          }
        }
        expect(importedBreadth.length).toBeGreaterThan(0);
      });
    }
  }
});
