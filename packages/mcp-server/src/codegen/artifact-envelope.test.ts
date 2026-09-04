import { readFileSync } from 'node:fs';

import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';

import type { GeneratedArtifact } from './types.js';
import {
  buildGeneratedArtifact,
  GENERATED_DEPENDENCY_CATALOG,
  validateGeneratedArtifact,
} from './artifact-envelope.js';

function readJson(relativeUrl: string): Record<string, unknown> {
  return JSON.parse(readFileSync(new URL(relativeUrl, import.meta.url), 'utf8')) as Record<string, unknown>;
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

describe('generated artifact envelope', () => {
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
