import { canonicalize, sha256 } from '@oods/artifacts';

import type {
  CodegenFramework,
  GeneratedArtifact,
  GeneratedArtifactAction,
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
    '@oods/component-styles/css-ported',
    '@oods/components-react',
    '@oods/components-react/ported',
    'class-variance-authority',
    'react',
  ]),
  vue: new Set([
    '@oods/component-styles/css',
    '@oods/component-styles/css-ported',
    '@oods/components-vue',
    '@oods/components-vue/ported',
    'class-variance-authority',
    'vue',
  ]),
};

const EMPTY_IMPORT_SET: ReadonlySet<string> = new Set();

function dependencyCatalogEntry(name: string): DependencyCatalogEntry | undefined {
  return Object.hasOwn(GENERATED_DEPENDENCY_CATALOG, name)
    ? GENERATED_DEPENDENCY_CATALOG[name as keyof typeof GENERATED_DEPENDENCY_CATALOG]
    : undefined;
}

function frameworkPeers(framework: CodegenFramework): readonly string[] {
  return Object.hasOwn(FRAMEWORK_PEERS, framework) ? FRAMEWORK_PEERS[framework] : [];
}

function frameworkImports(framework: CodegenFramework): ReadonlySet<string> {
  return Object.hasOwn(FRAMEWORK_IMPORTS, framework)
    ? FRAMEWORK_IMPORTS[framework]
    : EMPTY_IMPORT_SET;
}

const EXACT_VERSION = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const PACKAGE_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
const CONTENT_HASH = /^sha256:[a-f0-9]{64}$/;
const JAVASCRIPT_IDENTIFIER = /^[$_\p{ID_Start}][$_\u200c\u200d\p{ID_Continue}]*$/u;

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

function actionKey(action: GeneratedArtifactAction): string {
  return action.name;
}

function actionSourceKey(source: GeneratedArtifactAction['sources'][number]): string {
  return [source.nodeId, source.event, source.component].join('\u0000');
}

function normalizedAction(action: GeneratedArtifactAction): {
  name: string;
  parameters: GeneratedArtifactAction['parameters'];
  sources: GeneratedArtifactAction['sources'][number][];
} {
  return {
    name: action.name,
    parameters: action.parameters.map((parameter) => ({ ...parameter })),
    sources: action.sources
      .map((source) => ({ ...source }))
      .sort((left, right) => compareCodePoint(actionSourceKey(left), actionSourceKey(right))),
  };
}

/** Hash-bound source marker used to couple emitted declarations to artifact metadata. */
export function generatedActionContractDigest(action: GeneratedArtifactAction): string {
  return contentHash(canonicalize(normalizedAction(action)));
}

/** Hash-bound provenance marker for one schema declaration of a domain action. */
export function generatedActionSourceDigest(
  actionName: string,
  source: GeneratedArtifactAction['sources'][number],
): string {
  return contentHash(canonicalize({ actionName, source }));
}

export function generatedActionTypeSignature(action: GeneratedArtifactAction): string {
  const parameters = action.parameters
    .map((parameter) => `${parameter.name}: ${parameter.type}`)
    .join(', ');
  return `${action.name}: (${parameters}) => void`;
}

function artifactPath(framework: CodegenFramework, fileExtension: string): string {
  return framework === 'html' ? 'index.html' : `src/GeneratedUI${fileExtension}`;
}

function resolveDependencies(
  framework: CodegenFramework,
  importSpecifiers: readonly string[],
): GeneratedDependency[] {
  const packageNames = new Set(frameworkPeers(framework));

  for (const specifier of importSpecifiers) {
    const packageName = packageNameFromSpecifier(specifier);
    if (!packageName) {
      throw new Error(`Generated import '${specifier}' is not a portable package import.`);
    }
    if (!dependencyCatalogEntry(packageName)) {
      throw new Error(`Generated import '${packageName}' has no exact dependency manifest entry.`);
    }
    if (!frameworkImports(framework).has(specifier)) {
      throw new Error(`Generated import '${specifier}' is not a supported ${framework} artifact import.`);
    }
    packageNames.add(packageName);
  }

  return [...packageNames]
    .map((name): GeneratedDependency => {
      const entry = dependencyCatalogEntry(name);
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

    const catalogEntry = dependencyCatalogEntry(dependency.name);
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
    if (!frameworkImports(artifact.framework).has(specifier)) {
      issues.push(`Generated import '${specifier}' is not supported for ${artifact.framework}.`);
    }
  }
  const expectedDependencies = new Set([
    ...emittedSpecifiers.map((specifier) => packageNameFromSpecifier(specifier)!),
    ...frameworkPeers(artifact.framework),
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

  const actionNames = new Set<string>();
  let previousActionKey = '';
  if (!Array.isArray(artifact.actions)) {
    issues.push('Generated artifact must declare its required domain actions.');
  }
  for (const action of artifact.actions ?? []) {
    const key = actionKey(action);
    if (action.name.length === 0) {
      issues.push('Generated action name must not be empty.');
    } else if (!JAVASCRIPT_IDENTIFIER.test(action.name)) {
      issues.push(`Generated action '${action.name}' is not a safe JavaScript identifier.`);
    }
    if (actionNames.has(action.name)) {
      issues.push(`Generated action '${action.name}' has more than one contract entry.`);
    }
    actionNames.add(action.name);
    if (previousActionKey && compareCodePoint(previousActionKey, key) > 0) {
      issues.push('Generated actions are not ordered by name.');
    }
    previousActionKey = key;

    const parameterNames = new Set<string>();
    for (const parameter of action.parameters) {
      if (parameter.name.length === 0) {
        issues.push(`Generated action '${action.name}' has an unnamed parameter.`);
      }
      if (parameter.type.length === 0) {
        issues.push(
          `Generated action '${action.name}' parameter '${parameter.name}' must declare a type.`,
        );
      }
      if (parameterNames.has(parameter.name)) {
        issues.push(
          `Generated action '${action.name}' duplicates parameter '${parameter.name}'.`,
        );
      }
      parameterNames.add(parameter.name);
    }

    if (action.sources.length === 0) {
      issues.push(`Generated action '${action.name}' must name at least one schema declaration source.`);
    }
    const sourceKeys = new Set<string>();
    let previousSourceKey = '';
    for (const source of action.sources) {
      const sourceKey = actionSourceKey(source);
      if (source.nodeId.length === 0) {
        issues.push(`Generated action '${action.name}' must name each declaring node.`);
      }
      if (source.component.length === 0) {
        issues.push(`Generated action '${action.name}' must name each declaring component.`);
      }
      if (source.event.length === 0) {
        issues.push(`Generated action '${action.name}' must name each declared event.`);
      }
      if (sourceKeys.has(sourceKey)) {
        issues.push(
          `Generated action '${action.name}' duplicates the ${source.nodeId}/${source.event} source.`,
        );
      }
      sourceKeys.add(sourceKey);
      if (previousSourceKey && compareCodePoint(previousSourceKey, sourceKey) > 0) {
        issues.push(
          `Generated action '${action.name}' sources are not ordered by node, event, and component.`,
        );
      }
      previousSourceKey = sourceKey;
    }
  }

  // Emitters place hash-bound markers beside generated action declarations and
  // behavior handlers. They make two otherwise source-only regressions
  // mechanically visible: deleting an action from metadata while its binding
  // remains, and restoring the former empty/TODO handler path.
  const declaredActionMarkers = new Map<string, { digest: string; contents: string }>();
  const declaredSourceMarkers = new Set<string>();
  const domainBindingMarkers = new Set<string>();
  for (const file of artifact.files) {
    const actionMarkerPattern = /\/\* @oods-domain-action ([$_\p{ID_Start}][$_\u200c\u200d\p{ID_Continue}]*) (sha256:[a-f0-9]{64}) \*\//gu;
    for (const match of file.contents.matchAll(actionMarkerPattern)) {
      const name = match[1]!;
      const digest = match[2]!;
      if (declaredActionMarkers.has(name)) {
        issues.push(`Generated action marker '${name}' is duplicated.`);
      }
      declaredActionMarkers.set(name, { digest, contents: file.contents });
    }

    const sourceMarkerPattern = /\/\* @oods-domain-source (sha256:[a-f0-9]{64}) \*\//g;
    for (const match of file.contents.matchAll(sourceMarkerPattern)) {
      const digest = match[1]!;
      if (declaredSourceMarkers.has(digest)) {
        issues.push(`Generated domain-source marker '${digest}' is duplicated.`);
      }
      declaredSourceMarkers.add(digest);
    }

    const bindingMarkerPattern = /\/\* @oods-(local|domain)-binding ([$_\p{ID_Start}][$_\u200c\u200d\p{ID_Continue}]*) \*\//gu;
    for (const match of file.contents.matchAll(bindingMarkerPattern)) {
      const kind = match[1]!;
      const name = match[2]!;
      if (kind === 'domain') domainBindingMarkers.add(name);
      const remainder = file.contents.slice((match.index ?? 0) + match[0].length);
      const line = remainder.split('\n', 1)[0] ?? '';
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const handler = line.match(new RegExp(
        `^\\s*const\\s+${escapedName}\\s*=.*?=>\\s*\\{(.*?)\\};\\s*$`,
      ));
      if (!handler) {
        issues.push(`Generated binding handler '${name}' is not a canonical executable arrow function.`);
        continue;
      }
      const body = handler[1]?.trim() ?? '';
      if (!body || /\bTODO\b/i.test(body)) {
        issues.push(`Generated binding handler '${name}' must contain executable behavior.`);
      }
    }
  }
  // HTML has no runnable binding surface. React and Vue must bind their
  // metadata to generated typed declarations and schema-source provenance.
  if (artifact.framework !== 'html') {
    for (const [name] of declaredActionMarkers) {
      if (!actionNames.has(name)) {
        issues.push(`Generated action marker '${name}' is missing from artifact actions.`);
      }
    }
    for (const action of artifact.actions ?? []) {
      const marker = declaredActionMarkers.get(action.name);
      if (!marker) {
        issues.push(`Artifact action '${action.name}' is missing its generated typed declaration.`);
        continue;
      }
      if (marker.digest !== generatedActionContractDigest(action)) {
        issues.push(`Generated action marker '${action.name}' does not match its artifact contract.`);
      }
      if (!marker.contents.includes(generatedActionTypeSignature(action))) {
        issues.push(`Generated action '${action.name}' is missing its exact typed member signature.`);
      }
    }
    for (const name of domainBindingMarkers) {
      if (!actionNames.has(name)) {
        issues.push(`Generated domain binding '${name}' is missing from artifact actions.`);
      }
    }

    const expectedSourceMarkers = new Set(
      (artifact.actions ?? []).flatMap((action) => action.sources.map(
        (source) => generatedActionSourceDigest(action.name, source),
      )),
    );
    for (const digest of declaredSourceMarkers) {
      if (!expectedSourceMarkers.has(digest)) {
        issues.push(`Generated domain-source marker '${digest}' is absent from artifact metadata.`);
      }
    }
    for (const digest of expectedSourceMarkers) {
      if (!declaredSourceMarkers.has(digest)) {
        issues.push(`Artifact domain source '${digest}' is missing from generated declarations.`);
      }
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
  actions?: readonly GeneratedArtifactAction[];
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
  const actions: GeneratedArtifactAction[] = (input.actions ?? [])
    .map((action): GeneratedArtifactAction => {
      const sources = action.sources
        .map((source) => ({ ...source }))
        .sort((left, right) => compareCodePoint(actionSourceKey(left), actionSourceKey(right)));
      return {
        name: action.name,
        parameters: action.parameters.map((parameter) => ({ ...parameter })),
        sources: [sources[0]!, ...sources.slice(1)],
      };
    })
    .sort((left, right) => compareCodePoint(actionKey(left), actionKey(right)));
  const payload: Omit<GeneratedArtifact, 'contentHash'> = {
    schemaVersion: GENERATED_ARTIFACT_SCHEMA_VERSION,
    framework: input.framework,
    files,
    dependencies,
    actions,
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
