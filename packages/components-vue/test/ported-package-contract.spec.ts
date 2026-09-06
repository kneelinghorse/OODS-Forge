import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  PORTED_COMPONENT_IDS,
  evaluateEmissionEligibility,
  portedComponentContracts,
  portedScenarios,
  type EmissionEligibilityEvidence,
} from '@oods/component-contracts';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import * as builtPorted from '../dist/ported.js';
import * as sourcePorted from '../src/ported.js';

const packageRoot = process.cwd();
const repositoryRoot = resolve(packageRoot, '../..');
const portedIds = [...PORTED_COMPONENT_IDS];

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

function declarationValueExports(source: string): Set<string> {
  const file = ts.createSourceFile('ported.d.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names = new Set<string>();
  for (const statement of file.statements) {
    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      if (statement.isTypeOnly) continue;
      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) names.add(element.name.text);
      }
      continue;
    }
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
    if (!modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
    } else if (
      (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement))
      && statement.name
    ) {
      names.add(statement.name.text);
    }
  }
  return names;
}

describe('@oods/components-vue ported package contract', () => {
  it('publishes exactly the historical eight implementation exports on the ported runtime and declaration', () => {
    expect(Object.keys(sourcePorted).sort()).toEqual([...portedIds].sort());
    expect(Object.keys(builtPorted).sort()).toEqual([...portedIds].sort());

    const declarations = declarationValueExports(readFileSync(`${packageRoot}/dist/ported.d.ts`, 'utf8'));
    expect(portedIds.filter((name) => declarations.has(name))).toEqual(portedIds);
    expect(Object.keys(portedComponentContracts)).toEqual(portedIds);
    expect(portedScenarios.map((scenario) => scenario.oodsComponentId)).toEqual(portedIds);
  });

  it('dependency-closure exposes only built, package-local ported files', () => {
    const manifest = readJson(`${packageRoot}/package.json`) as {
      exports: Record<string, unknown>;
      dependencies: Record<string, string>;
      peerDependencies: Record<string, string>;
    };
    expect(manifest.exports).toMatchObject({
      './ported': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        require: './dist/index.cjs',
      },
      './readiness-ported': { default: './evidence/vue-readiness.v1.json' },
    });
    expect(manifest.dependencies).toEqual({
      '@oods/component-contracts': '0.1.0',
      '@oods/component-styles': '0.1.0',
    });
    expect(manifest.peerDependencies).toEqual({ vue: '^3.5.0' });
    const portedCssSpecifier = '@oods/component-styles/css-ported';
    const stylesManifest = readJson(`${repositoryRoot}/packages/component-styles/package.json`) as {
      exports: Record<string, unknown>;
    };
    expect(stylesManifest.exports[`./${portedCssSpecifier.split('/').at(-1)}`]).toEqual({
      default: './dist/components.css',
    });

    const distributableText = [
      'dist/ported.js',
      'dist/ported.cjs',
      'dist/ported.d.ts',
      'package.json',
    ].map((path) => readFileSync(`${packageRoot}/${path}`, 'utf8')).join('\n');
    expect(distributableText).not.toMatch(/(?:from|require\()\s*["'](?:react|@radix-ui|@rjsf)/i);
    expect(distributableText).not.toMatch(/\b(?:workspace|file|link):/i);
    expect(distributableText).not.toContain(packageRoot);
  });

  it('publishes historical readiness rows alongside the root alias', () => {
    const readiness = readJson(`${packageRoot}/evidence/vue-readiness-ported.v1.json`) as {
      target: string;
      rows: Array<{
        componentId: string;
        state: string;
        emissionEligible: boolean;
        evidence: EmissionEligibilityEvidence;
      }>;
    };
    expect(readiness.target).toBe('vue');
    expect(readiness.rows.map((row) => row.componentId)).toEqual(portedIds);
    for (const row of readiness.rows) {
      expect(row.state).toBe('implemented-evidence-complete');
      expect(evaluateEmissionEligibility(row.evidence)).toEqual({ emissionEligible: true, incomplete: [] });
      expect(row.emissionEligible).toBe(true);
      for (const evidence of Object.values(row.evidence)) {
        expect(evidence.status).toBe('passed');
        expect(evidence.refs.length).toBeGreaterThan(0);
      }
    }
  });
});
