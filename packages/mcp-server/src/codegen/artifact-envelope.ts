import { canonicalize, sha256 } from '@oods/artifacts';

import type {
  CodegenFramework,
  GeneratedArtifact,
  GeneratedArtifactFile,
  GeneratedDependency,
} from './types.js';

export const GENERATED_ARTIFACT_SCHEMA_VERSION = '1.0.0' as const;

type DependencyCatalogEntry = Omit<GeneratedDependency, 'name'>;

/**
 * Runtime-owned dependency versions are deliberately frozen into the wire
 * contract. The alignment test beside this module forces package upgrades to
 * update generation instead of leaking a workspace range to consumers.
 */
export const GENERATED_DEPENDENCY_CATALOG = {
  '@oods/component-styles': { version: '0.1.0', kind: 'dependency' },
  '@oods/components-react': { version: '0.1.0', kind: 'dependency' },
  '@oods/components-vue': { version: '0.1.0', kind: 'dependency' },
  'class-variance-authority': { version: '0.7.1', kind: 'dependency' },
  react: { version: '19.2.0', kind: 'peerDependency' },
  'react-dom': { version: '19.2.0', kind: 'peerDependency' },
  vue: { version: '3.5.42', kind: 'peerDependency' },
} as const satisfies Record<string, DependencyCatalogEntry>;

const FRAMEWORK_PEERS: Record<CodegenFramework, readonly string[]> = {
  html: [],
  react: ['react', 'react-dom'],
  vue: ['vue'],
};

const FRAMEWORK_IMPORTS: Record<CodegenFramework, ReadonlySet<string>> = {
  html: new Set(),
  react: new Set([
    '@oods/component-styles/css',
    '@oods/components-react',
    'class-variance-authority',
    'react',
  ]),
  vue: new Set([
    '@oods/component-styles/css',
    '@oods/components-vue',
    'class-variance-authority',
    'vue',
  ]),
};

const EXACT_VERSION = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const PACKAGE_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
const CONTENT_HASH = /^sha256:[a-f0-9]{64}$/;

function compareCodePoint(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function contentHash(contents: string): string {
  return `sha256:${sha256(contents)}`;
}

function packageNameFromSpecifier(specifier: string): string | null {
  if (
    specifier.startsWith('.')
    || specifier.startsWith('/')
    || specifier.startsWith('file:')
    || specifier.startsWith('link:')
    || specifier.startsWith('workspace:')
    || specifier.startsWith('git:')
    || specifier.startsWith('http:')
    || specifier.startsWith('https:')
  ) {
    return null;
  }

  const segments = specifier.split('/');
  return specifier.startsWith('@')
    ? (segments.length >= 2 ? `${segments[0]}/${segments[1]}` : null)
    : segments[0] || null;
}

function collectBareImportSpecifiers(files: readonly GeneratedArtifactFile[]): string[] {
  const specifiers = new Set<string>();
  const importPattern = /\b(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\sfrom\s*)?['"]([^'"]+)['"]/g;

  for (const file of files) {
    for (const match of file.contents.matchAll(importPattern)) {
      const specifier = match[1];
      if (!specifier) continue;
      if (packageNameFromSpecifier(specifier)) specifiers.add(specifier);
    }
  }

  return [...specifiers].sort(compareCodePoint);
}

function canonicalPayload(artifact: Omit<GeneratedArtifact, 'contentHash'>): string {
  return canonicalize(artifact);
}

function artifactPath(framework: CodegenFramework, fileExtension: string): string {
  return framework === 'html' ? 'index.html' : `src/GeneratedUI${fileExtension}`;
}

function resolveDependencies(
  framework: CodegenFramework,
  importSpecifiers: readonly string[],
): GeneratedDependency[] {
  const packageNames = new Set(FRAMEWORK_PEERS[framework]);

  for (const specifier of importSpecifiers) {
    const packageName = packageNameFromSpecifier(specifier);
    if (!packageName) {
      throw new Error(`Generated import '${specifier}' is not a portable package import.`);
    }
    if (!GENERATED_DEPENDENCY_CATALOG[packageName as keyof typeof GENERATED_DEPENDENCY_CATALOG]) {
      throw new Error(`Generated import '${packageName}' has no exact dependency manifest entry.`);
    }
    if (!FRAMEWORK_IMPORTS[framework].has(specifier)) {
      throw new Error(`Generated import '${specifier}' is not a supported ${framework} artifact import.`);
    }
    packageNames.add(packageName);
  }

  return [...packageNames]
    .map((name): GeneratedDependency => {
      const entry = GENERATED_DEPENDENCY_CATALOG[name as keyof typeof GENERATED_DEPENDENCY_CATALOG];
      if (!entry) {
        throw new Error(`Generated import '${name}' has no exact dependency manifest entry.`);
      }
      return { name, version: entry.version, kind: entry.kind };
    })
    .sort((left, right) => compareCodePoint(`${left.kind}:${left.name}`, `${right.kind}:${right.name}`));
}

export function validateGeneratedArtifact(artifact: GeneratedArtifact): string[] {
  const issues: string[] = [];
  if (artifact.schemaVersion !== GENERATED_ARTIFACT_SCHEMA_VERSION) {
    issues.push(`Unsupported artifact schemaVersion '${artifact.schemaVersion}'.`);
  }
  if (artifact.files.length === 0) {
    issues.push('Generated artifact contains no files.');
  }

  const paths = new Set<string>();
  let previousPath = '';
  for (const file of artifact.files) {
    const segments = file.path.split('/');
    if (
      file.path.length === 0
      || file.path.startsWith('/')
      || file.path.includes('\\')
      || segments.includes('')
      || segments.includes('.')
      || segments.includes('..')
    ) {
      issues.push(`Generated file path '${file.path}' is not a safe relative POSIX path.`);
    }
    if (paths.has(file.path)) issues.push(`Generated file path '${file.path}' is duplicated.`);
    paths.add(file.path);
    if (previousPath && compareCodePoint(previousPath, file.path) > 0) {
      issues.push('Generated files are not ordered by path.');
    }
    previousPath = file.path;

    const expectedHash = contentHash(file.contents);
    if (!CONTENT_HASH.test(file.contentHash) || file.contentHash !== expectedHash) {
      issues.push(`Generated file '${file.path}' has an invalid contentHash.`);
    }
  }

  const dependencyNames = new Set<string>();
  let previousDependencyKey = '';
  for (const dependency of artifact.dependencies) {
    const key = `${dependency.kind}:${dependency.name}`;
    if (!PACKAGE_NAME.test(dependency.name)) {
      issues.push(`Dependency '${dependency.name}' is not a package name.`);
    }
    if (!EXACT_VERSION.test(dependency.version)) {
      issues.push(`Dependency '${dependency.name}' must use an exact semantic version.`);
    }
    if (dependencyNames.has(dependency.name)) {
      issues.push(`Dependency '${dependency.name}' is duplicated.`);
    }
    dependencyNames.add(dependency.name);
    if (previousDependencyKey && compareCodePoint(previousDependencyKey, key) > 0) {
      issues.push('Generated dependencies are not ordered by kind and name.');
    }
    previousDependencyKey = key;

    const catalogEntry = GENERATED_DEPENDENCY_CATALOG[
      dependency.name as keyof typeof GENERATED_DEPENDENCY_CATALOG
    ];
    if (!catalogEntry) {
      issues.push(`Dependency '${dependency.name}' is not in the generated-artifact catalog.`);
    } else if (
      dependency.version !== catalogEntry.version
      || dependency.kind !== catalogEntry.kind
    ) {
      issues.push(`Dependency '${dependency.name}' does not match its exact catalog entry.`);
    }
  }

  const emittedSpecifiers = collectBareImportSpecifiers(artifact.files);
  for (const specifier of emittedSpecifiers) {
    if (!FRAMEWORK_IMPORTS[artifact.framework].has(specifier)) {
      issues.push(`Generated import '${specifier}' is not supported for ${artifact.framework}.`);
    }
  }
  const expectedDependencies = new Set([
    ...emittedSpecifiers.map((specifier) => packageNameFromSpecifier(specifier)!),
    ...FRAMEWORK_PEERS[artifact.framework],
  ]);
  for (const name of expectedDependencies) {
    if (!dependencyNames.has(name)) {
      issues.push(`Generated import '${name}' is missing from the dependency manifest.`);
    }
  }
  for (const name of dependencyNames) {
    if (!expectedDependencies.has(name)) {
      issues.push(`Dependency '${name}' is not required by the generated artifact.`);
    }
  }

  const { contentHash: _contentHash, ...payload } = artifact;
  const expectedArtifactHash = contentHash(canonicalPayload(payload));
  if (!CONTENT_HASH.test(artifact.contentHash) || artifact.contentHash !== expectedArtifactHash) {
    issues.push('Generated artifact has an invalid contentHash.');
  }

  return issues;
}

type BuildGeneratedArtifactInput = {
  framework: CodegenFramework;
  imports: readonly string[];
} & (
  | { code: string; fileExtension: string; files?: never }
  | { files: ReadonlyArray<{ path: string; contents: string }>; code?: never; fileExtension?: never }
);

export function buildGeneratedArtifact(input: BuildGeneratedArtifactInput): GeneratedArtifact {
  const sourceFiles = input.files ?? [{
    path: artifactPath(input.framework, input.fileExtension),
    contents: input.code,
  }];
  const files: GeneratedArtifactFile[] = sourceFiles
    .map((file) => ({
      ...file,
      contentHash: contentHash(file.contents),
    }))
    .sort((left, right) => compareCodePoint(left.path, right.path));
  const dependencies = resolveDependencies(input.framework, input.imports);
  const payload: Omit<GeneratedArtifact, 'contentHash'> = {
    schemaVersion: GENERATED_ARTIFACT_SCHEMA_VERSION,
    framework: input.framework,
    files,
    dependencies,
  };
  const artifact: GeneratedArtifact = {
    ...payload,
    contentHash: contentHash(canonicalPayload(payload)),
  };
  const issues = validateGeneratedArtifact(artifact);
  if (issues.length > 0) {
    throw new Error(`Invalid generated artifact: ${issues.join(' ')}`);
  }
  return artifact;
}
