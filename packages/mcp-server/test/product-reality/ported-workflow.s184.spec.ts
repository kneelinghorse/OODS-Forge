import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';

import { PORTED_COMPONENT_IDS } from '@oods/component-contracts';

import { preflightTargetContracts } from '../../src/codegen/target-contracts.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import { handle as generateCode } from '../../src/tools/code.generate.js';
import type { CodeGenerateOutput } from '../../src/tools/types.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const mcpServerRoot = path.join(repositoryRoot, 'packages/mcp-server');
const reactPackageRoot = path.join(repositoryRoot, 'packages/components-react');
const vuePackageRoot = path.join(repositoryRoot, 'packages/components-vue');
const reactRequire = createRequire(path.join(reactPackageRoot, 'package.json'));
const vueRequire = createRequire(path.join(vuePackageRoot, 'package.json'));
const rootRequire = createRequire(path.join(repositoryRoot, 'package.json'));

const SCHEMA_NAMES = ['subscription-list-dark', 'subscription-detail-dark'] as const;
const FRAMEWORKS = ['react', 'vue'] as const;

function savedSchema(name: typeof SCHEMA_NAMES[number]): UiSchema {
  const record = JSON.parse(readFileSync(path.join(
    repositoryRoot,
    `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`,
  ), 'utf8')) as { schema: UiSchema };
  return record.schema;
}

function reactSemanticErrors(code: string): string[] {
  const root = mkdtempSync(path.join(tmpdir(), 'oods-s184-ported-react-'));
  try {
    mkdirSync(path.join(root, 'node_modules/@oods'), { recursive: true });
    mkdirSync(path.join(root, 'node_modules/@types'), { recursive: true });
    for (const dependency of ['react', 'react-dom'] as const) {
      symlinkSync(
        path.dirname(reactRequire.resolve(`${dependency}/package.json`)),
        path.join(root, `node_modules/${dependency}`),
        'junction',
      );
      symlinkSync(
        path.dirname(reactRequire.resolve(`@types/${dependency}/package.json`)),
        path.join(root, `node_modules/@types/${dependency}`),
        'junction',
      );
    }
    symlinkSync(
      reactPackageRoot,
      path.join(root, 'node_modules/@oods/components-react'),
      'junction',
    );
    const generatedPath = path.join(root, 'GeneratedUI.tsx');
    writeFileSync(generatedPath, code);
    const program = ts.createProgram([generatedPath], {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      noEmit: true,
      skipLibCheck: false,
      strict: true,
      target: ts.ScriptTarget.ES2022,
    });
    return ts.getPreEmitDiagnostics(program)
      .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function vueStrictResult(code: string): { status: number | null; output: string } {
  const root = mkdtempSync(path.join(tmpdir(), 'oods-s184-ported-vue-'));
  try {
    mkdirSync(path.join(root, 'node_modules/@oods'), { recursive: true });
    symlinkSync(
      path.dirname(vueRequire.resolve('vue/package.json')),
      path.join(root, 'node_modules/vue'),
      'junction',
    );
    symlinkSync(
      vuePackageRoot,
      path.join(root, 'node_modules/@oods/components-vue'),
      'junction',
    );
    writeFileSync(path.join(root, 'GeneratedUI.vue'), code);
    writeFileSync(path.join(root, 'tsconfig.json'), `${JSON.stringify({
      compilerOptions: {
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        noEmit: true,
        skipLibCheck: false,
        strict: true,
        target: 'ES2022',
      },
      include: ['./GeneratedUI.vue'],
    }, null, 2)}\n`);
    const result = spawnSync(process.execPath, [
      vueRequire.resolve('vue-tsc/bin/vue-tsc.js'),
      '--noEmit',
      '--pretty',
      'false',
      '-p',
      path.join(root, 'tsconfig.json'),
    ], { cwd: mcpServerRoot, encoding: 'utf8', timeout: 120_000 });
    return {
      status: result.status,
      output: `${result.stdout}\n${result.stderr}`.trim(),
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function namedImports(source: string): Array<{ specifier: string; names: string[] }> {
  return [...source.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g)]
    .map((match) => ({
      names: match[1]!.split(',').map((name) => name.trim()).filter(Boolean),
      specifier: match[2]!,
    }));
}

describe('Sprint 184 m04 ported Subscription workflow', () => {
  const generated = new Map<string, CodeGenerateOutput>();

  beforeAll(async () => {
    for (const schemaName of SCHEMA_NAMES) {
      for (const framework of FRAMEWORKS) {
        generated.set(
          `${schemaName}/${framework}`,
          await generateCode({ framework, profile: 'build', schema: savedSchema(schemaName) }),
        );
      }
    }
  });

  it('retains the four-cell m04 proof while current live outputs remain green', () => {
    const baseline = JSON.parse(readFileSync(path.join(
      repositoryRoot,
      'artifacts/product-reality/sprint-183/m04/compilation-report.json',
    ), 'utf8')) as {
      results: Array<{
        name: string;
        targets: Record<'react' | 'vue', { disposition: string; gaps?: Array<{ code: string }> }>;
      }>;
    };
    const report = JSON.parse(readFileSync(path.join(
      repositoryRoot,
      'artifacts/product-reality/sprint-184/m04/compilation-report.json',
    ), 'utf8')) as {
      summary: { cellCount: number; greenCellCount: number; strictCompileCount: number };
      cells: Array<{ schema: string; framework: string; codeBytes: number; codeSha256: string }>;
    };

    for (const schemaName of SCHEMA_NAMES) {
      const baselineRecord = baseline.results.find(({ name }) => name === schemaName);
      expect(baselineRecord, schemaName).toBeDefined();
      for (const framework of FRAMEWORKS) {
        expect(baselineRecord!.targets[framework]).toMatchObject({ disposition: 'typed-gap' });
        expect(baselineRecord!.targets[framework].gaps).toHaveLength(5);
        expect(baselineRecord!.targets[framework].gaps!.every(({ code }) => code === 'OODS-N015'))
          .toBe(true);

        const result = generated.get(`${schemaName}/${framework}`)!;
        expect(result.status, `${schemaName}/${framework}`).toBe('ok');
        expect(result.code.length, `${schemaName}/${framework}`).toBeGreaterThan(0);
        expect(result.artifact?.files[0]?.contents.length, `${schemaName}/${framework}`)
          .toBeGreaterThan(0);
        expect(result.errors, `${schemaName}/${framework}`).toBeUndefined();
        // M04's hashes are immutable historical evidence. M06 deliberately
        // changes live emitter bytes by generating the screen action surface.
        const historicalCell = report.cells.find((cell) => (
          cell.schema === schemaName && cell.framework === framework
        ));
        expect(historicalCell).toMatchObject({
          schema: schemaName,
          framework,
          codeBytes: expect.any(Number),
          codeSha256: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        });
        expect(historicalCell!.codeBytes).toBeGreaterThan(0);
      }
    }
    expect(report.summary).toMatchObject({ cellCount: 4, greenCellCount: 4, strictCompileCount: 4 });
  });

  it('strict-checks every generated React and Vue artifact against the built packages', () => {
    for (const schemaName of SCHEMA_NAMES) {
      expect(
        reactSemanticErrors(generated.get(`${schemaName}/react`)!.code),
        `${schemaName}/react`,
      ).toEqual([]);
      expect(
        vueStrictResult(generated.get(`${schemaName}/vue`)!.code),
        `${schemaName}/vue`,
      ).toEqual({ status: 0, output: '' });
    }
  }, 120_000);

  it('resolves every emitted named import from its actual built package subpath', () => {
    for (const schemaName of SCHEMA_NAMES) {
      for (const framework of FRAMEWORKS) {
        const source = generated.get(`${schemaName}/${framework}`)!.code;
        const packageImports = namedImports(source).filter(({ specifier }) => specifier.startsWith('@oods/'));
        for (const { specifier, names } of packageImports) {
          const exports = rootRequire(specifier) as Record<string, unknown>;
          expect(rootRequire.resolve(specifier), specifier).toContain('/dist/');
          for (const name of names) expect(exports[name], `${specifier}#${name}`).toBeDefined();
        }
        const stylesSpecifier = '@oods/component-styles/css-ported';
        expect(source).toContain(`import '${stylesSpecifier}';`);
        expect(rootRequire.resolve(stylesSpecifier)).toMatch(/\/dist\/components-ported\.css$/);
      }
    }
  });

  it('records an empty current tier-three census after enumerating the pre-fix facts', () => {
    const evidence = JSON.parse(readFileSync(path.join(
      repositoryRoot,
      'artifacts/product-reality/sprint-184/m04/tier-three-census.json',
    ), 'utf8')) as {
      checkpoints: Array<{
        name: string;
        factCount: number;
        uniqueFactCount: number;
        facts: Array<{ code: string; component: string; nodeId: string }>;
      }>;
      resizeDecision: { currentTierThreeFactCount: number; decision: string };
    };
    expect(evidence.checkpoints.map(({ name, factCount, uniqueFactCount }) => ({
      name,
      factCount,
      uniqueFactCount,
    }))).toEqual([
      {
        name: 'ported-contracts-enabled-before-bounded-field-acceptance',
        factCount: 4,
        uniqueFactCount: 2,
      },
      {
        name: 'recipe-binding-enabled-before-relative-datetime-acceptance',
        factCount: 2,
        uniqueFactCount: 1,
      },
      { name: 'final', factCount: 0, uniqueFactCount: 0 },
    ]);
    expect(evidence.checkpoints.flatMap(({ facts }) => facts).every(({ code, component, nodeId }) => (
      code === 'OODS-V007' && component.length > 0 && nodeId.length > 0
    ))).toBe(true);

    const current = SCHEMA_NAMES.flatMap((schemaName) => FRAMEWORKS.flatMap((framework) => (
      preflightTargetContracts(savedSchema(schemaName), framework).issues
        .filter(({ code }) => code === 'OODS-V007')
        .map(({ code, component, nodeId }) => ({ schemaName, framework, code, component, nodeId }))
    )));
    expect(current).toEqual([]);
    expect(evidence.resizeDecision.currentTierThreeFactCount).toBe(current.length);
    expect(evidence.resizeDecision.decision).toMatch(/do not resize m05/i);
  });

  it('reads all 24 ported surface cells from the unchanged 109-row baseline denominator', () => {
    // Decision 1726 folds evidence onto existing rows; the live workflow proof above remains in force.
    const baseline = JSON.parse(readFileSync(path.join(
      repositoryRoot,
      'packages/component-contracts/registry/component-capability-baseline.v1.json',
    ), 'utf8')) as { controllingObligationDenominator: number; rows: Array<{ id: string; surfaces: Record<string, { state: string; evidence: string[] }> }> };

    expect(baseline.rows).toHaveLength(109);
    expect(baseline.controllingObligationDenominator).toBe(109);
    const rows = baseline.rows.filter(({ id }) => PORTED_COMPONENT_IDS.includes(id as typeof PORTED_COMPONENT_IDS[number]));
    expect(rows.map(({ id }) => id)).toEqual(PORTED_COMPONENT_IDS);
    const cells = rows.flatMap(row => ['react', 'vue', 'generatedConsumer'].map(surface => row.surfaces[surface]));
    expect(cells).toHaveLength(24);
    expect(cells.every(cell => cell.state === 'implemented-evidence-complete' && cell.evidence.length > 0)).toBe(true);
  });
});
