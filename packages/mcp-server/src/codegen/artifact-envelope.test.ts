import { readFileSync } from 'node:fs';

import { load } from 'js-yaml';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { canonicalize, sha256 } from '@oods/artifacts';

import { getAjv } from '../lib/ajv.js';
import codeGenerateOutputSchema from '../schemas/code.generate.output.json' assert { type: 'json' };
import pipelineOutputSchema from '../schemas/pipeline.output.json' assert { type: 'json' };
import type { UiSchema } from '../schemas/generated.js';
import { handle as codeGenerate } from '../tools/code.generate.js';
import type { GeneratedArtifact, GeneratedArtifactAction } from './types.js';
import {
  buildGeneratedArtifact,
  generatedActionContractDigest,
  generatedActionSourceDigest,
  GENERATED_DEPENDENCY_CATALOG,
  validateGeneratedArtifact,
} from './artifact-envelope.js';
import {
  bindReleaseEvidence,
  createValidationReceipt,
  recordValidationChecks,
} from './validation-profile.js';

function readJson(relativeUrl: string): Record<string, unknown> {
  return JSON.parse(readFileSync(new URL(relativeUrl, import.meta.url), 'utf8')) as Record<string, unknown>;
}

function savedSubscriptionDetailSchema(): UiSchema {
  const record = JSON.parse(readFileSync(new URL(
    '../../../../artifacts/product-reality/sprint-183/m04/saved-schema-store/subscription-detail-dark.json',
    import.meta.url,
  ), 'utf8')) as { schema: UiSchema };
  return record.schema;
}

function resolvedLockVersion(importer: string, section: string, name: string): string {
  const lock = load(readFileSync(new URL('../../../../pnpm-lock.yaml', import.meta.url), 'utf8')) as {
    importers: Record<string, Record<string, Record<string, { version: string }>>>;
  };
  return lock.importers[importer]![section]![name]!.version.split('(')[0]!;
}

const reactSource = [
  "import React from 'react';",
  "import { Button } from '@oods/components-react';",
  "import '@oods/component-styles/css';",
  'export const GeneratedUI = () => <Button>Save</Button>;',
  '',
].join('\n');

const validateOutput = getAjv().compile(codeGenerateOutputSchema);
const validatePipelineOutput = getAjv().compile(pipelineOutputSchema);

function rehashArtifact(artifact: GeneratedArtifact): void {
  for (const file of artifact.files) file.contentHash = `sha256:${sha256(file.contents)}`;
  const { contentHash: _oldHash, ...payload } = artifact;
  artifact.contentHash = `sha256:${sha256(canonicalize(payload))}`;
}

function sourceWithActionContract(action: GeneratedArtifactAction): string {
  const parameters = action.parameters.map(({ name, type }) => `${name}: ${type}`).join(', ');
  const argumentsList = action.parameters.map(({ name }) => name).join(', ');
  return [
    "import React from 'react';",
    'export interface GeneratedUIActions {',
    `  /* @oods-domain-action ${action.name} ${generatedActionContractDigest(action)} */`,
    ...action.sources.map((source) => (
      `  /* @oods-domain-source ${generatedActionSourceDigest(action.name, source)} */`
    )),
    `  ${action.name}: (${parameters}) => void;`,
    '}',
    `export const GeneratedUI = ({ actions }: { actions: GeneratedUIActions }) => {`,
    `  /* @oods-domain-binding ${action.name} */ const ${action.name} = (${parameters}) => { actions.${action.name}(${argumentsList}); };`,
    '  return null;',
    '};',
    '',
  ].join('\n');
}

describe('generated artifact envelope', () => {
  it.each(['constructor', 'toString', 'valueOf', '__proto__', 'hasOwnProperty'])(
    'does not accept inherited dependency-catalog key %s',
    (packageName) => {
      expect(() => buildGeneratedArtifact({
        framework: 'react',
        code: `import '${packageName}';\n`,
        fileExtension: '.tsx',
        imports: [packageName],
      })).toThrow(`Generated import '${packageName}' has no exact dependency manifest entry.`);
    },
  );

  it('exposes action sources as a nonempty public tuple', () => {
    expectTypeOf<[]>().not.toExtend<GeneratedArtifactAction['sources']>();
    expectTypeOf<[{ nodeId: string; component: string; event: string }]>()
      .toExtend<GeneratedArtifactAction['sources']>();
  });

  it('emits a versioned file set with an exact install manifest', () => {
    const artifact = buildGeneratedArtifact({
      framework: 'react',
      code: reactSource,
      fileExtension: '.tsx',
      imports: ['react', '@oods/components-react', '@oods/component-styles/css'],
    });

    expect(artifact).toMatchObject({
      schemaVersion: '1.0.0',
      framework: 'react',
      files: [{ path: 'src/GeneratedUI.tsx', contents: reactSource }],
      dependencies: [
        { name: '@oods/component-styles', version: '0.1.0', kind: 'dependency' },
        { name: '@oods/components-react', version: '0.1.0', kind: 'dependency' },
        { name: 'react', version: '19.2.0', kind: 'peerDependency' },
        { name: 'react-dom', version: '19.2.0', kind: 'peerDependency' },
      ],
      actions: [],
    });
    expect(artifact.files[0]!.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(artifact.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(validateGeneratedArtifact(artifact)).toEqual([]);
  });

  it('normalizes Vue subpath imports and adds only the target peer', () => {
    const artifact = buildGeneratedArtifact({
      framework: 'vue',
      code: [
        '<template><Button /></template>',
        '<script setup lang="ts">',
        "import { ref } from 'vue';",
        "import { Button } from '@oods/components-vue';",
        "import '@oods/component-styles/css';",
        "import { cva } from 'class-variance-authority';",
        '</script>',
      ].join('\n'),
      fileExtension: '.vue',
      imports: ['vue', '@oods/components-vue', '@oods/component-styles/css', 'class-variance-authority'],
    });

    expect(artifact.dependencies).toEqual([
      { name: '@oods/component-styles', version: '0.1.0', kind: 'dependency' },
      { name: '@oods/components-vue', version: '0.1.0', kind: 'dependency' },
      { name: 'class-variance-authority', version: '0.7.1', kind: 'dependency' },
      { name: 'vue', version: '3.5.42', kind: 'peerDependency' },
    ]);
    expect(validateGeneratedArtifact(artifact)).toEqual([]);
  });

  it.each([
    {
      framework: 'react' as const,
      componentImport: '@oods/components-react/ported',
      styleImport: '@oods/component-styles/css-ported',
      peerNames: ['react', 'react-dom'],
      extension: '.tsx',
    },
    {
      framework: 'vue' as const,
      componentImport: '@oods/components-vue/ported',
      styleImport: '@oods/component-styles/css-ported',
      peerNames: ['vue'],
      extension: '.vue',
    },
  ])('rejects the retired $framework ported subpaths that Sprint 200 removed from the manifests', ({
    framework,
    componentImport,
    styleImport,
    extension,
  }) => {
    // The root subpaths are the only admitted package imports; a retired alias must fail
    // here, before any consumer install could fail on ERR_PACKAGE_PATH_NOT_EXPORTED.
    expect(() => buildGeneratedArtifact({
      framework,
      code: `import { StatusBadge } from '${componentImport}';\nimport '${styleImport}';\n`,
      fileExtension: extension,
      imports: [componentImport, styleImport],
    })).toThrow(/is not a supported (?:react|vue) artifact import/);
  });

  it('sorts multi-file inputs and hashes identical inputs byte-for-byte', () => {
    const first = buildGeneratedArtifact({
      framework: 'react',
      imports: ['react'],
      files: [
        { path: 'src/z-actions.ts', contents: 'export type Action = () => void;\n' },
        { path: 'src/GeneratedUI.tsx', contents: "import React from 'react';\nimport type { Action } from './z-actions';\n" },
      ],
    });
    const second = buildGeneratedArtifact({
      framework: 'react',
      imports: ['react'],
      files: [
        { path: 'src/GeneratedUI.tsx', contents: "import React from 'react';\nimport type { Action } from './z-actions';\n" },
        { path: 'src/z-actions.ts', contents: 'export type Action = () => void;\n' },
      ],
    });

    expect(first.files.map((file) => file.path)).toEqual(['src/GeneratedUI.tsx', 'src/z-actions.ts']);
    expect(Buffer.from(JSON.stringify(first))).toEqual(Buffer.from(JSON.stringify(second)));
    expect(first.files.map((file) => file.contentHash)).toEqual(second.files.map((file) => file.contentHash));
    expect(first.contentHash).toBe(second.contentHash);
    expect(first).not.toHaveProperty('generatedAt');
  });

  it('sorts and hashes required domain actions while retaining every compatible source', () => {
    const editAction: GeneratedArtifactAction = {
      name: 'handleEdit',
      parameters: [
        { name: 'payload', type: 'Record<string, unknown>' },
        { name: 'event', type: 'Event' },
      ],
      sources: [
        { nodeId: 'header', component: 'Stack', event: 'onEdit' },
        { nodeId: 'card', component: 'Card', event: 'onEdit' },
      ],
    };
    const deleteAction: GeneratedArtifactAction = {
      name: 'handleDelete',
      parameters: [{ name: 'id', type: 'string' }],
      sources: [{ nodeId: 'card', component: 'Card', event: 'onDelete' }],
    };

    const first = buildGeneratedArtifact({
      framework: 'html',
      code: '<main>Actions</main>\n',
      fileExtension: '.html',
      imports: [],
      actions: [editAction, deleteAction],
    });
    const second = buildGeneratedArtifact({
      framework: 'html',
      code: '<main>Actions</main>\n',
      fileExtension: '.html',
      imports: [],
      actions: [deleteAction, {
        ...editAction,
        sources: [editAction.sources[1]!, editAction.sources[0]],
      }],
    });

    expect(first.actions).toEqual([
      deleteAction,
      {
        ...editAction,
        sources: [
          { nodeId: 'card', component: 'Card', event: 'onEdit' },
          { nodeId: 'header', component: 'Stack', event: 'onEdit' },
        ],
      },
    ]);
    expect(first.actions[1]!.parameters.map(({ name }) => name)).toEqual(['payload', 'event']);
    expect(first.actions[1]!.sources).toHaveLength(2);
    expect(first.contentHash).toBe(second.contentHash);
    expect(Buffer.from(JSON.stringify(first))).toEqual(Buffer.from(JSON.stringify(second)));
    expect(validateGeneratedArtifact(first)).toEqual([]);

    const deleteOnly = buildGeneratedArtifact({
      framework: 'html',
      code: '<main>Actions</main>\n',
      fileExtension: '.html',
      imports: [],
      actions: [deleteAction],
    });
    const changedSource = buildGeneratedArtifact({
      framework: 'html',
      code: '<main>Actions</main>\n',
      fileExtension: '.html',
      imports: [],
      actions: [{
        ...deleteAction,
        sources: [{ ...deleteAction.sources[0]!, nodeId: 'other-card' }],
      }],
    });
    expect(changedSource.contentHash).not.toBe(deleteOnly.contentHash);
  });

  it('rejects malformed, duplicate, unordered, or hash-tampered domain actions', () => {
    const artifact = buildGeneratedArtifact({
      framework: 'html',
      code: '<main>Actions</main>\n',
      fileExtension: '.html',
      imports: [],
      actions: [
        {
          name: 'handleDelete',
          parameters: [{ name: 'id', type: 'string' }],
          sources: [{ nodeId: 'card', component: 'Card', event: 'onDelete' }],
        },
        {
          name: 'handleEdit',
          parameters: [{ name: 'payload', type: 'Record<string, unknown>' }],
          sources: [{ nodeId: 'card', component: 'Card', event: 'onEdit' }],
        },
      ],
    });

    const unordered = structuredClone(artifact);
    unordered.actions.reverse();
    expect(validateGeneratedArtifact(unordered)).toContain(
      'Generated actions are not ordered by name.',
    );

    const duplicate = structuredClone(artifact);
    duplicate.actions.push(structuredClone(duplicate.actions[0]!));
    expect(validateGeneratedArtifact(duplicate)).toContain(
      "Generated action 'handleDelete' has more than one contract entry.",
    );

    const missingType = structuredClone(artifact);
    missingType.actions[0]!.parameters[0]!.type = '';
    expect(validateGeneratedArtifact(missingType)).toContain(
      "Generated action 'handleDelete' parameter 'id' must declare a type.",
    );

    const duplicateParameter = structuredClone(artifact);
    duplicateParameter.actions[0]!.parameters.push({ name: 'id', type: 'string' });
    expect(validateGeneratedArtifact(duplicateParameter)).toContain(
      "Generated action 'handleDelete' duplicates parameter 'id'.",
    );

    const tamperedSource = structuredClone(artifact);
    tamperedSource.actions[0]!.sources[0]!.nodeId = 'mutated-card';
    expect(validateGeneratedArtifact(tamperedSource)).toContain(
      'Generated artifact has an invalid contentHash.',
    );
  });

  it('rejects hash-consistent deletion or drift in typed action declarations and provenance', () => {
    const action: GeneratedArtifactAction = {
      name: 'handleEdit',
      parameters: [{ name: 'id', type: 'string' }],
      sources: [
        { nodeId: 'card-a', component: 'Button', event: 'onActivate' },
        { nodeId: 'card-b', component: 'Button', event: 'onActivate' },
      ],
    };
    const artifact = buildGeneratedArtifact({
      framework: 'react',
      code: sourceWithActionContract(action),
      fileExtension: '.tsx',
      imports: ['react'],
      actions: [action],
    });
    expect(validateGeneratedArtifact(artifact)).toEqual([]);

    const deletedDeclaration = structuredClone(artifact);
    deletedDeclaration.files[0]!.contents = deletedDeclaration.files[0]!.contents
      .replace(/^\s*\/\* @oods-domain-(?:action|source).*\n/gm, '')
      .replace(/^\s*handleEdit:.*\n/m, '');
    rehashArtifact(deletedDeclaration);
    expect(validateGeneratedArtifact(deletedDeclaration)).toContain(
      "Artifact action 'handleEdit' is missing its generated typed declaration.",
    );

    const deletedMember = structuredClone(artifact);
    deletedMember.files[0]!.contents = deletedMember.files[0]!.contents
      .replace(/^\s*handleEdit:.*\n/m, '');
    rehashArtifact(deletedMember);
    expect(validateGeneratedArtifact(deletedMember)).toContain(
      "Generated action 'handleEdit' is missing its exact typed member signature.",
    );

    const changedSource = structuredClone(artifact);
    changedSource.actions[0]!.sources[0]!.nodeId = 'wrong-node';
    rehashArtifact(changedSource);
    expect(validateGeneratedArtifact(changedSource)).toEqual(expect.arrayContaining([
      "Generated action marker 'handleEdit' does not match its artifact contract.",
      expect.stringContaining('missing from generated declarations'),
    ]));

    const droppedSource = structuredClone(artifact);
    droppedSource.actions[0]!.sources.pop();
    rehashArtifact(droppedSource);
    expect(validateGeneratedArtifact(droppedSource)).toEqual(expect.arrayContaining([
      "Generated action marker 'handleEdit' does not match its artifact contract.",
      expect.stringContaining('absent from artifact metadata'),
    ]));

    const deletedBinding = structuredClone(artifact);
    deletedBinding.files[0]!.contents = deletedBinding.files[0]!.contents
      .replace(/^.*\/\* @oods-domain-binding handleEdit \*\/.*\n/m, '');
    rehashArtifact(deletedBinding);
    expect(validateGeneratedArtifact(deletedBinding)).toContain(
      "Artifact action 'handleEdit' is missing its generated domain binding handler.",
    );
  });

  it.each([
    { mutation: 'void body', body: 'void 0;' },
    { mutation: 'bare return', body: 'return;' },
    { mutation: 'different action', body: 'actions.handleDelete();' },
  ])('rejects a re-sealed live generated domain handler with $mutation', async ({ body }) => {
    const generated = await codeGenerate({
      framework: 'react',
      profile: 'build',
      schema: savedSubscriptionDetailSchema(),
    });
    expect(generated.status, JSON.stringify(generated.errors ?? [])).toBe('ok');
    expect(generated.artifact).toBeDefined();
    const artifact = structuredClone(generated.artifact!);
    expect(validateGeneratedArtifact(artifact)).toEqual([]);
    const sourceBefore = artifact.files[0]!.contents;
    expect(sourceBefore.split('/* @oods-domain-binding handleEdit */')).toHaveLength(2);
    artifact.files[0]!.contents = sourceBefore.replace(
      /(\/\* @oods-domain-binding handleEdit \*\/ const handleEdit = .*?=> \{).*?(\};)/,
      `$1 ${body} $2`,
    );
    expect(artifact.files[0]!.contents).not.toBe(sourceBefore);
    rehashArtifact(artifact);

    expect(validateGeneratedArtifact(artifact)).toContain(
      "Generated domain binding handler 'handleEdit' must forward to actions.handleEdit.",
    );
  });

  it('requires the closed domain-action contract on the code.generate wire', () => {
    const artifact = buildGeneratedArtifact({
      framework: 'html',
      code: '<main>Actions</main>\n',
      fileExtension: '.html',
      imports: [],
      actions: [{
        name: 'handleDelete',
        parameters: [{ name: 'id', type: 'string' }],
        sources: [{ nodeId: 'card', component: 'Card', event: 'onDelete' }],
      }],
    });
    const output = {
      status: 'ok',
      framework: 'html',
      artifact,
      code: artifact.files[0]!.contents,
      fileExtension: '.html',
      imports: [],
      warnings: [],
      validationReceipt: bindReleaseEvidence(
        recordValidationChecks(
          createValidationReceipt('build', 'html'),
          'schema-structure',
          'component-registry',
          'state-contract',
          'target-readiness',
          'normalization-fidelity',
          'binding-contract',
          'props-contract',
          'slots-contract',
          'events-contract',
          'dependency-closure',
          'fallback-policy',
        ),
        undefined,
        artifact.contentHash,
      ).receipt,
    };

    expect(validateOutput(output), JSON.stringify(validateOutput.errors ?? [])).toBe(true);

    const vacuousSuccess = structuredClone(output);
    vacuousSuccess.validationReceipt = createValidationReceipt('build', 'html');
    expect(validateOutput(vacuousSuccess)).toBe(false);
    expect(validateOutput.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ keyword: 'contains' }),
    ]));

    const weakenedPolicy = structuredClone(output);
    weakenedPolicy.validationReceipt.axes.enforcement = 'advisory';
    expect(validateOutput(weakenedPolicy)).toBe(false);
    expect(validateOutput.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ keyword: 'const' }),
    ]));

    const missingAccepted = structuredClone(output) as typeof output & {
      validationReceipt: { evidence: { accepted?: unknown[] } };
    };
    delete missingAccepted.validationReceipt.evidence.accepted;
    expect(validateOutput(missingAccepted)).toBe(false);
    expect(validateOutput.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ keyword: 'required', params: { missingProperty: 'accepted' } }),
    ]));

    const missingReceipt = structuredClone(output) as Partial<typeof output>;
    delete missingReceipt.validationReceipt;
    expect(validateOutput(missingReceipt)).toBe(false);
    expect(validateOutput.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({
        keyword: 'required',
        params: { missingProperty: 'validationReceipt' },
      }),
    ]));

    const missingActions = structuredClone(output);
    delete (missingActions.artifact as Partial<GeneratedArtifact>).actions;
    expect(validateGeneratedArtifact(missingActions.artifact as GeneratedArtifact)).toContain(
      'Generated artifact must declare its required domain actions.',
    );
    expect(validateOutput(missingActions)).toBe(false);
    expect(validateOutput.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ keyword: 'required', params: { missingProperty: 'actions' } }),
    ]));

    const openSource = structuredClone(output) as typeof output & {
      artifact: GeneratedArtifact & { actions: Array<GeneratedArtifactAction & { invented?: boolean }> };
    };
    openSource.artifact.actions[0]!.invented = true;
    expect(validateOutput(openSource)).toBe(false);
    expect(validateOutput.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ keyword: 'additionalProperties' }),
    ]));

    const invalidActionIdentifier = structuredClone(output);
    invalidActionIdentifier.artifact.actions[0]!.name = 'not-an-identifier';
    expect(validateOutput(invalidActionIdentifier)).toBe(false);
    expect(validateOutput.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ keyword: 'pattern' }),
    ]));
  });

  it('keeps code.generate and pipeline on the same required action schema', () => {
    const codeDefinitions = codeGenerateOutputSchema.$defs;
    const pipelineDefinitions = pipelineOutputSchema.$defs;

    expect(codeDefinitions.generatedArtifact.required).toContain('actions');
    expect(pipelineDefinitions.generatedArtifact.required).toContain('actions');
    expect(pipelineDefinitions.generatedArtifact.properties.actions).toEqual(
      codeDefinitions.generatedArtifact.properties.actions,
    );
    for (const definition of [
      'generatedArtifactAction',
      'generatedArtifactActionParameter',
      'generatedArtifactActionSource',
    ] as const) {
      expect(pipelineDefinitions[definition]).toEqual(codeDefinitions[definition]);
    }
  });

  it('rejects omission of the mandatory receipt from pipeline responses', () => {
    const receipt = createValidationReceipt('build', 'react');
    const output = {
      validationReceipt: receipt,
      compose: { layout: 'auto', componentCount: 0 },
      pipeline: { steps: [], duration: 1 },
    };

    expect(
      validatePipelineOutput(output),
      JSON.stringify(validatePipelineOutput.errors ?? []),
    ).toBe(true);

    const missingReceipt = structuredClone(output) as Partial<typeof output>;
    delete missingReceipt.validationReceipt;
    expect(validatePipelineOutput(missingReceipt)).toBe(false);
    expect(validatePipelineOutput.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({
        keyword: 'required',
        params: { missingProperty: 'validationReceipt' },
      }),
    ]));
  });

  it('rejects a vacuous validation receipt on a successful pipeline code payload', () => {
    const artifact = buildGeneratedArtifact({
      framework: 'html',
      code: '<main>Runnable</main>\n',
      fileExtension: '.html',
      imports: [],
    });
    const receipt = bindReleaseEvidence(
      recordValidationChecks(
        createValidationReceipt('build', 'html'),
        'schema-structure',
        'component-registry',
        'state-contract',
        'target-readiness',
        'normalization-fidelity',
        'binding-contract',
        'props-contract',
        'slots-contract',
        'events-contract',
        'dependency-closure',
        'fallback-policy',
      ),
      undefined,
      artifact.contentHash,
    ).receipt;
    const output = {
      validationReceipt: receipt,
      compose: { layout: 'auto', componentCount: 1 },
      code: {
        framework: 'html',
        styling: 'tokens',
        artifact,
        output: artifact.files[0]!.contents,
      },
      pipeline: { steps: ['compose', 'codegen'], duration: 1 },
    };

    expect(
      validatePipelineOutput(output),
      JSON.stringify(validatePipelineOutput.errors ?? []),
    ).toBe(true);

    const vacuous = structuredClone(output);
    vacuous.validationReceipt = createValidationReceipt('build', 'html');
    expect(validatePipelineOutput(vacuous)).toBe(false);
    expect(validatePipelineOutput.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ keyword: 'contains' }),
    ]));
  });

  it('rejects versionless, workspace-aliased, unordered, or undeclared dependency mutations', () => {
    const artifact = buildGeneratedArtifact({
      framework: 'react',
      code: reactSource,
      fileExtension: '.tsx',
      imports: ['react', '@oods/components-react', '@oods/component-styles/css'],
    });

    const versionless = structuredClone(artifact);
    versionless.dependencies[0]!.version = '';
    expect(validateGeneratedArtifact(versionless)).toContain(
      "Dependency '@oods/component-styles' must use an exact semantic version.",
    );

    const workspaceAlias = structuredClone(artifact);
    workspaceAlias.dependencies[0]!.version = 'workspace:*';
    expect(validateGeneratedArtifact(workspaceAlias)).toContain(
      "Dependency '@oods/component-styles' must use an exact semantic version.",
    );

    for (const version of ['^0.1.0', 'file:../component-styles']) {
      const nonExact = structuredClone(artifact);
      nonExact.dependencies[0]!.version = version;
      expect(validateGeneratedArtifact(nonExact)).toContain(
        "Dependency '@oods/component-styles' must use an exact semantic version.",
      );
    }

    const unordered = structuredClone(artifact);
    unordered.dependencies.reverse();
    expect(validateGeneratedArtifact(unordered)).toContain(
      'Generated dependencies are not ordered by kind and name.',
    );

    const undeclared = structuredClone(artifact);
    undeclared.dependencies = undeclared.dependencies.filter(({ name }) => name !== '@oods/components-react');
    expect(validateGeneratedArtifact(undeclared)).toContain(
      "Generated import '@oods/components-react' is missing from the dependency manifest.",
    );
  });

  it('rejects absolute, traversal, and backslash artifact paths', () => {
    const artifact = buildGeneratedArtifact({
      framework: 'html',
      code: '<main>Portable</main>\n',
      fileExtension: '.html',
      imports: [],
    });

    for (const path of ['/index.html', '../index.html', 'src\\index.html']) {
      const unsafe = structuredClone(artifact);
      unsafe.files[0]!.path = path;
      expect(validateGeneratedArtifact(unsafe)).toContain(
        `Generated file path '${path}' is not a safe relative POSIX path.`,
      );
    }
  });

  it('fails loud for fictional packages and repository or workspace import paths', () => {
    expect(() => buildGeneratedArtifact({
      framework: 'react',
      code: "import Widget from '@oods/fictional';\n",
      fileExtension: '.tsx',
      imports: ['@oods/fictional'],
    })).toThrow("Generated import '@oods/fictional' has no exact dependency manifest entry.");

    for (const specifier of ['@oods/component-styles/does-not-exist', '@oods/components-vue']) {
      expect(() => buildGeneratedArtifact({
        framework: 'react',
        code: `import '${specifier}';\n`,
        fileExtension: '.tsx',
        imports: [specifier],
      })).toThrow(`Generated import '${specifier}' is not a supported react artifact import.`);
    }

    for (const specifier of ['workspace:*', 'file:../../packages/components-react', '/repo/src/Button.tsx']) {
      expect(() => buildGeneratedArtifact({
        framework: 'html',
        code: '<main></main>\n',
        fileExtension: '.html',
        imports: [specifier],
      })).toThrow('is not a portable package import');
    }
  });

  it('pins the manifest catalog to package identities and lockfile resolutions', () => {
    expect(GENERATED_DEPENDENCY_CATALOG['@oods/component-styles'].version).toBe(
      readJson('../../../component-styles/package.json').version,
    );
    expect(GENERATED_DEPENDENCY_CATALOG['@oods/components-react'].version).toBe(
      readJson('../../../components-react/package.json').version,
    );
    expect(GENERATED_DEPENDENCY_CATALOG['@oods/components-vue'].version).toBe(
      readJson('../../../components-vue/package.json').version,
    );
    expect(GENERATED_DEPENDENCY_CATALOG.react.version).toBe(resolvedLockVersion('.', 'dependencies', 'react'));
    expect(GENERATED_DEPENDENCY_CATALOG['react-dom'].version).toBe(resolvedLockVersion('.', 'dependencies', 'react-dom'));
    expect(GENERATED_DEPENDENCY_CATALOG['@vue/server-renderer'].version).toBe(
      resolvedLockVersion('packages/components-vue', 'devDependencies', '@vue/server-renderer'),
    );
    expect(GENERATED_DEPENDENCY_CATALOG['@vitejs/plugin-vue'].version).toBe(
      resolvedLockVersion('packages/components-vue', 'devDependencies', '@vitejs/plugin-vue'),
    );
    expect(GENERATED_DEPENDENCY_CATALOG.vue.version).toBe(
      resolvedLockVersion('packages/components-vue', 'devDependencies', 'vue'),
    );
    expect(GENERATED_DEPENDENCY_CATALOG['class-variance-authority'].version).toBe(
      resolvedLockVersion('packages/mcp-server', 'devDependencies', 'class-variance-authority'),
    );
  });

  it('rejects a tampered file hash and artifact hash', () => {
    const artifact = buildGeneratedArtifact({
      framework: 'html',
      code: '<main>Stable</main>\n',
      fileExtension: '.html',
      imports: [],
    });
    const tampered = structuredClone(artifact) as GeneratedArtifact;
    tampered.files[0]!.contents = '<main>Mutated</main>\n';

    expect(validateGeneratedArtifact(tampered)).toEqual(expect.arrayContaining([
      "Generated file 'index.html' has an invalid contentHash.",
      'Generated artifact has an invalid contentHash.',
    ]));
  });
});
