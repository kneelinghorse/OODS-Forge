#!/usr/bin/env tsx

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { validateGeneratedArtifact } from '../../packages/mcp-server/src/codegen/artifact-envelope.js';
import { preflightTargetCapabilities } from '../../packages/mcp-server/src/codegen/target-readiness.js';
import { validationReceiptIntegrityIssues } from '../../packages/mcp-server/src/codegen/validation-profile.js';
import type { GeneratedArtifact } from '../../packages/mcp-server/src/codegen/types.js';
import type { UiElement, UiSchema } from '../../packages/mcp-server/src/schemas/generated.js';
import type {
  SchemaMetadata,
  SchemaStoreIndex,
} from '../../packages/mcp-server/src/schema-store/types.js';
import { handle as codeGenerate } from '../../packages/mcp-server/src/tools/code.generate.js';
import type {
  CodeGenerateInput,
  CodeGenerateOutput,
  CodegenIssue,
} from '../../packages/mcp-server/src/tools/types.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(scriptDirectory, '../..');
const defaultEvidenceDirectory = path.join(
  defaultRepoRoot,
  'artifacts/product-reality/sprint-183/m04',
);
const defaultCorpusDirectory = path.join(defaultEvidenceDirectory, 'saved-schema-store');
const separatedS182FixturePath = path.join(
  defaultRepoRoot,
  'packages/mcp-server/test/fixtures/saved-schemas/tier1-acceptance-sub-detail.s182.json',
);

const EXPECTED_SCHEMA_COUNT = 16;
const EXIT_GATE_RECORD = {
  name: 'tier1-acceptance-sub-detail',
  schemaRef: 'compose-7d860337',
  createdAt: '2026-03-05T03:43:57.111Z',
  sha256: 'sha256:f842c3c61933caf7cf26af48e02b7a7de84c5f60fd49b8c03458821fdd55318b',
} as const;
const SEPARATED_S182_SCHEMA_REF = 's182-tier1-bounded-foundation-v1';
const TARGETS = ['react', 'vue'] as const;
const NUCLEUS_COMPONENTS = new Set([
  'Badge',
  'Banner',
  'Button',
  'Card',
  'Checkbox',
  'DatePicker',
  'Grid',
  'Input',
  'Select',
  'Stack',
  'Table',
  'Tabs',
  'Text',
  'Textarea',
]);
const FORBIDDEN_GENERATED_MARKER = /data-oods-(?:fallback|placeholder)|unsupported component|TODO implementation/i;

type Target = typeof TARGETS[number];
type CodeGenerator = (input: CodeGenerateInput) => Promise<CodeGenerateOutput>;

type SourceRecord = {
  metadata: SchemaMetadata;
  schema: UiSchema;
  raw: string;
  sha256: string;
  path: string;
};

type TypedGap = {
  code: 'OODS-N015';
  component: string;
  nodeId: string;
  target: Target;
  message: string;
};

type CompiledTargetDisposition = {
  disposition: 'compiled';
  artifact: GeneratedArtifact;
  artifactPath: string;
  artifactFileSha256: string;
  validationReceipt: CodeGenerateOutput['validationReceipt'];
};

type GapTargetDisposition = {
  disposition: 'typed-gap';
  gaps: TypedGap[];
  validationReceipt: CodeGenerateOutput['validationReceipt'];
};

type TargetDisposition = CompiledTargetDisposition | GapTargetDisposition;

type SchemaDisposition = {
  name: string;
  schemaRef: string;
  createdAt: string;
  sourceSha256: string;
  components: string[];
  targets: Record<Target, TargetDisposition>;
};

type EvidenceFile = {
  relativePath: string;
  contents: string;
};

export type SavedSchemaCorpusEvidence = {
  corpusManifest: Record<string, unknown>;
  compilationReport: Record<string, unknown>;
  breadthUnblockRanking: Record<string, unknown>;
  dispositions: SchemaDisposition[];
  files: EvidenceFile[];
};

export type SavedSchemaCorpusOptions = {
  repoRoot?: string;
  corpusDirectory?: string;
  evidenceDirectory?: string;
  separatedFixturePath?: string;
  generator?: CodeGenerator;
};

function compareCodePoint(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(contents: string | Buffer): string {
  return `sha256:${crypto.createHash('sha256').update(contents).digest('hex')}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function parseJson(raw: string, filePath: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(
      `${filePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function assertIsoDate(value: unknown, field: string, filePath: string): asserts value is string {
  assert(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${filePath} has invalid ${field}.`);
}

function parseMetadata(value: unknown, filePath: string): SchemaMetadata {
  assert(isRecord(value), `${filePath} must contain an object.`);
  assert(typeof value.name === 'string' && value.name.length > 0, `${filePath} has invalid name.`);
  assert(
    typeof value.schemaRef === 'string' && value.schemaRef.length > 0,
    `${filePath} has invalid schemaRef.`,
  );
  assert(
    typeof value.version === 'number' && Number.isInteger(value.version) && value.version > 0,
    `${filePath} has invalid version.`,
  );
  assertIsoDate(value.createdAt, 'createdAt', filePath);
  assertIsoDate(value.updatedAt, 'updatedAt', filePath);
  assert(
    Array.isArray(value.tags) && value.tags.every((tag) => typeof tag === 'string'),
    `${filePath} has invalid tags.`,
  );

  return {
    name: value.name,
    schemaRef: value.schemaRef,
    version: value.version,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    tags: [...value.tags],
    ...(typeof value.object === 'string' ? { object: value.object } : {}),
    ...(typeof value.context === 'string' ? { context: value.context } : {}),
    ...(typeof value.author === 'string' ? { author: value.author } : {}),
  };
}

function parseIndex(raw: string, filePath: string): SchemaStoreIndex {
  const value = parseJson(raw, filePath);
  assert(isRecord(value), `${filePath} must contain an object.`);
  assert(value.version === 1, `${filePath} must use schema-store index version 1.`);
  assertIsoDate(value.updatedAt, 'updatedAt', filePath);
  assert(Array.isArray(value.schemas), `${filePath} must contain a schemas array.`);
  return {
    version: 1,
    updatedAt: value.updatedAt,
    schemas: value.schemas.map((entry, index) => parseMetadata(entry, `${filePath}#/schemas/${index}`)),
  };
}

function parseSchema(value: unknown, filePath: string): UiSchema {
  assert(isRecord(value), `${filePath} has no schema object.`);
  assert(typeof value.version === 'string' && value.version.length > 0, `${filePath} schema has no version.`);
  assert(Array.isArray(value.screens) && value.screens.length > 0, `${filePath} schema has no screens.`);
  return value as unknown as UiSchema;
}

function parseSourceRecord(raw: string, filePath: string, expectedName: string): SourceRecord {
  const value = parseJson(raw, filePath);
  const metadata = parseMetadata(value, filePath);
  assert(metadata.name === expectedName, `${filePath} records name ${metadata.name}, expected ${expectedName}.`);
  assert(isRecord(value), `${filePath} must contain an object.`);
  return {
    metadata,
    schema: parseSchema(value.schema, filePath),
    raw,
    sha256: sha256(raw),
    path: filePath,
  };
}

function sameMetadata(indexMetadata: SchemaMetadata, recordMetadata: SchemaMetadata): boolean {
  return JSON.stringify(indexMetadata) === JSON.stringify(recordMetadata);
}

async function readCorpus(corpusDirectory: string): Promise<{
  index: SchemaStoreIndex;
  indexRaw: string;
  indexPath: string;
  records: SourceRecord[];
}> {
  const indexPath = path.join(corpusDirectory, '_index.json');
  const indexRaw = await fs.readFile(indexPath, 'utf8');
  const index = parseIndex(indexRaw, indexPath);
  assert(
    index.schemas.length === EXPECTED_SCHEMA_COUNT,
    `Expected ${EXPECTED_SCHEMA_COUNT} saved schemas; index contains ${index.schemas.length}.`,
  );

  const names = index.schemas.map(({ name }) => name);
  assert(new Set(names).size === names.length, 'Saved-schema index contains duplicate names.');
  const directoryEntries = (await fs.readdir(corpusDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort(compareCodePoint);
  const expectedFiles = ['_index.json', ...names.map((name) => `${name}.json`)].sort(compareCodePoint);
  assert(
    JSON.stringify(directoryEntries) === JSON.stringify(expectedFiles),
    `Saved-schema corpus files differ from the index: expected ${expectedFiles.join(', ')}; received ${directoryEntries.join(', ')}.`,
  );

  const records: SourceRecord[] = [];
  for (const metadata of index.schemas) {
    const recordPath = path.join(corpusDirectory, `${metadata.name}.json`);
    const raw = await fs.readFile(recordPath, 'utf8');
    const record = parseSourceRecord(raw, recordPath, metadata.name);
    assert(
      sameMetadata(metadata, record.metadata),
      `${recordPath} metadata does not match its index entry.`,
    );
    records.push(record);
  }
  return { index, indexRaw, indexPath, records };
}

function collectComponents(schema: UiSchema): string[] {
  const components = new Set<string>();
  const stack: UiElement[] = [...schema.screens].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    components.add(node.component);
    if (node.children) stack.push(...node.children.slice().reverse());
  }
  return [...components].sort(compareCodePoint);
}

function issueKey(issue: Pick<CodegenIssue, 'code' | 'component' | 'nodeId'>): string {
  return [issue.code, issue.component ?? '', issue.nodeId ?? ''].join('\u0000');
}

function assertReceipt(
  result: CodeGenerateOutput,
  target: Target,
  artifactContentHash?: string,
): void {
  const issues = validationReceiptIntegrityIssues(result.validationReceipt, {
    profile: 'build',
    defaulted: false,
    target: { requested: target, resolved: target, source: 'explicit' },
    ...(artifactContentHash ? { artifactContentHash } : {}),
  });
  assert(issues.length === 0, `${target} returned an invalid build receipt: ${issues.join('; ')}`);
  assert(
    result.validationReceipt.checks.includes('target-readiness'),
    `${target} omitted target-readiness from its build receipt.`,
  );
}

function typedGapsFor(
  schema: UiSchema,
  target: Target,
): TypedGap[] {
  return preflightTargetCapabilities(schema.screens, target).map((issue) => {
    assert(issue.code === 'OODS-N015', `${target} readiness returned non-typed gap ${issue.code}.`);
    assert(issue.component, `${target} readiness gap did not name a component.`);
    assert(issue.nodeId, `${target} readiness gap for ${issue.component} did not name a node.`);
    return {
      code: 'OODS-N015',
      component: issue.component,
      nodeId: issue.nodeId,
      target,
      message: issue.message,
    };
  });
}

function assertGapDisposition(
  result: CodeGenerateOutput,
  target: Target,
  expectedGaps: TypedGap[],
): GapTargetDisposition {
  assert(
    result.status === 'error',
    `${target} returned a generated artifact for unsupported ${expectedGaps[0]!.component}; typed gap required.`,
  );
  assert(result.artifact === undefined, `${target} typed-gap response must not contain an artifact.`);
  assert(result.code === '', `${target} typed-gap response leaked generated source.`);
  assert(result.imports.length === 0, `${target} typed-gap response leaked imports.`);
  assert(result.warnings.length === 0, `${target} build typed gaps must be blocking, not warnings.`);
  assertReceipt(result, target);

  const errors = result.errors ?? [];
  assert(
    errors.every((issue) => issue.code === 'OODS-N015' && issue.component && issue.nodeId),
    `${target} failed with a non-typed-gap error: ${JSON.stringify(errors)}.`,
  );
  const actualKeys = errors.map(issueKey).sort(compareCodePoint);
  const expectedKeys = expectedGaps.map(issueKey).sort(compareCodePoint);
  assert(
    JSON.stringify(actualKeys) === JSON.stringify(expectedKeys),
    `${target} typed gaps differ from target-readiness evidence.`,
  );
  return {
    disposition: 'typed-gap',
    gaps: expectedGaps,
    validationReceipt: result.validationReceipt,
  };
}

function assertCompiledDisposition(
  result: CodeGenerateOutput,
  target: Target,
  schemaComponents: string[],
  artifactPath: string,
): { disposition: CompiledTargetDisposition; artifactContents: string } {
  assert(result.status === 'ok', `${target} generation failed: ${JSON.stringify(result.errors ?? [])}`);
  assert(result.artifact !== undefined, `${target} success omitted the generated artifact.`);
  assert(result.artifact.framework === target, `${target} artifact names ${result.artifact.framework}.`);
  assert(result.code === result.artifact.files[0]?.contents, `${target} compatibility code is not the artifact source.`);
  assert(result.warnings.length === 0, `${target} build returned warnings: ${JSON.stringify(result.warnings)}.`);
  assert((result.errors ?? []).length === 0, `${target} success returned errors.`);
  assertReceipt(result, target, result.artifact.contentHash);

  const artifactIssues = validateGeneratedArtifact(result.artifact);
  assert(artifactIssues.length === 0, `${target} artifact is invalid: ${artifactIssues.join('; ')}`);
  for (const file of result.artifact.files) {
    assert(
      !FORBIDDEN_GENERATED_MARKER.test(file.contents),
      `${target} artifact ${file.path} contains a fallback, placeholder, unsupported marker, or TODO.`,
    );
  }
  for (const component of schemaComponents) {
    assert(
      result.artifact.files.some((file) => file.contents.includes(`data-oods-component="${component}"`)),
      `${target} artifact silently omitted component ${component}.`,
    );
  }

  const artifactContents = json(result.artifact);
  return {
    artifactContents,
    disposition: {
      disposition: 'compiled',
      artifact: result.artifact,
      artifactPath,
      artifactFileSha256: sha256(artifactContents),
      validationReceipt: result.validationReceipt,
    },
  };
}

async function compileTarget(
  record: SourceRecord,
  target: Target,
  generator: CodeGenerator,
  evidenceDirectory: string,
): Promise<{ disposition: TargetDisposition; artifactFile?: EvidenceFile }> {
  const input: CodeGenerateInput = {
    framework: target,
    profile: 'build',
    schema: structuredClone(record.schema),
    options: { styling: 'tokens', typescript: true },
  };
  const first = await generator(input);
  const second = await generator({ ...input, schema: structuredClone(record.schema) });
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    `${record.metadata.name}/${target} produced non-byte-identical repeated responses.`,
  );

  const expectedGaps = typedGapsFor(record.schema, target);
  if (expectedGaps.length > 0) {
    return { disposition: assertGapDisposition(first, target, expectedGaps) };
  }

  const artifactPath = path.posix.join(
    'compiled',
    record.metadata.name,
    `${target}.artifact.json`,
  );
  const compiled = assertCompiledDisposition(first, target, collectComponents(record.schema), artifactPath);
  return {
    disposition: compiled.disposition,
    artifactFile: {
      relativePath: path.relative(evidenceDirectory, path.join(evidenceDirectory, artifactPath))
        .split(path.sep)
        .join('/'),
      contents: compiled.artifactContents,
    },
  };
}

async function readSeparatedFixture(filePath: string): Promise<{
  path: string;
  sha256: string;
  schemaRef: string;
  createdAt: string;
}> {
  const raw = await fs.readFile(filePath, 'utf8');
  const record = parseSourceRecord(raw, filePath, 'tier1-acceptance-sub-detail');
  assert(
    record.metadata.schemaRef === SEPARATED_S182_SCHEMA_REF,
    `${filePath} must retain the s182 bounded fixture schemaRef.`,
  );
  return {
    path: filePath,
    sha256: record.sha256,
    schemaRef: record.metadata.schemaRef,
    createdAt: record.metadata.createdAt,
  };
}

function buildBreadthRanking(dispositions: SchemaDisposition[]): Array<Record<string, unknown>> {
  const rows = new Map<string, {
    schemaNames: Set<string>;
    nodeIds: Set<string>;
    targetGapNodes: Record<Target, number>;
  }>();
  for (const disposition of dispositions) {
    for (const target of TARGETS) {
      const targetDisposition = disposition.targets[target];
      if (targetDisposition.disposition !== 'typed-gap') continue;
      for (const gap of targetDisposition.gaps) {
        const row = rows.get(gap.component) ?? {
          schemaNames: new Set<string>(),
          nodeIds: new Set<string>(),
          targetGapNodes: { react: 0, vue: 0 },
        };
        row.schemaNames.add(disposition.name);
        row.nodeIds.add(`${disposition.name}\u0000${gap.nodeId}`);
        row.targetGapNodes[target] += 1;
        rows.set(gap.component, row);
      }
    }
  }

  return [...rows.entries()]
    .map(([component, row]) => ({
      component,
      affectedSchemaCount: row.schemaNames.size,
      nodeOccurrenceCount: row.nodeIds.size,
      targetGapNodeCount: row.targetGapNodes,
      schemas: [...row.schemaNames].sort(compareCodePoint),
    }))
    .sort((left, right) => (
      (right.affectedSchemaCount as number) - (left.affectedSchemaCount as number)
      || (right.nodeOccurrenceCount as number) - (left.nodeOccurrenceCount as number)
      || compareCodePoint(left.component as string, right.component as string)
    ))
    .map((row, index) => ({ rank: index + 1, ...row }));
}

function publicDisposition(disposition: TargetDisposition): Record<string, unknown> {
  if (disposition.disposition === 'typed-gap') {
    return {
      disposition: disposition.disposition,
      gaps: disposition.gaps,
      validationReceipt: disposition.validationReceipt,
    };
  }
  return {
    disposition: disposition.disposition,
    artifact: {
      path: disposition.artifactPath,
      fileSha256: disposition.artifactFileSha256,
      contentHash: disposition.artifact.contentHash,
      schemaVersion: disposition.artifact.schemaVersion,
      files: disposition.artifact.files.map(({ path: filePath, contentHash }) => ({
        path: filePath,
        contentHash,
      })),
      dependencies: disposition.artifact.dependencies,
      actions: disposition.artifact.actions,
    },
    validationReceipt: disposition.validationReceipt,
  };
}

export async function buildSavedSchemaCorpusEvidence(
  options: SavedSchemaCorpusOptions = {},
): Promise<SavedSchemaCorpusEvidence> {
  const repoRoot = path.resolve(options.repoRoot ?? defaultRepoRoot);
  const evidenceDirectory = path.resolve(options.evidenceDirectory ?? defaultEvidenceDirectory);
  const corpusDirectory = path.resolve(options.corpusDirectory ?? defaultCorpusDirectory);
  const fixturePath = path.resolve(options.separatedFixturePath ?? separatedS182FixturePath);
  const generator = options.generator ?? codeGenerate;
  const corpus = await readCorpus(corpusDirectory);
  const separatedFixture = await readSeparatedFixture(fixturePath);
  const exitGate = corpus.records.find(({ metadata }) => metadata.name === EXIT_GATE_RECORD.name);
  assert(exitGate, `Corpus is missing ${EXIT_GATE_RECORD.name}.`);
  assert(exitGate.metadata.schemaRef === EXIT_GATE_RECORD.schemaRef, 'Exit-gate schemaRef is not genuine.');
  assert(exitGate.metadata.createdAt === EXIT_GATE_RECORD.createdAt, 'Exit-gate creation date is not genuine.');
  assert(exitGate.sha256 === EXIT_GATE_RECORD.sha256, 'Exit-gate record bytes do not match the captured source.');

  const manifestRecords = corpus.records.map((record) => ({
    name: record.metadata.name,
    path: path.relative(repoRoot, record.path).split(path.sep).join('/'),
    sha256: record.sha256,
    schemaRef: record.metadata.schemaRef,
    version: record.metadata.version,
    createdAt: record.metadata.createdAt,
    updatedAt: record.metadata.updatedAt,
    tags: record.metadata.tags,
    ...(record.metadata.object ? { object: record.metadata.object } : {}),
    ...(record.metadata.context ? { context: record.metadata.context } : {}),
    ...(record.metadata.author ? { author: record.metadata.author } : {}),
  }));
  const corpusContentHash = sha256(JSON.stringify({
    index: sha256(corpus.indexRaw),
    records: manifestRecords.map(({ name, sha256: recordSha256 }) => ({ name, sha256: recordSha256 })),
  }));
  const corpusManifest = {
    schemaVersion: '1.0.0',
    mission: 's183-m04',
    kind: 'saved-schema-corpus-manifest',
    corpusContentHash,
    index: {
      path: path.relative(repoRoot, corpus.indexPath).split(path.sep).join('/'),
      sha256: sha256(corpus.indexRaw),
      version: corpus.index.version,
      updatedAt: corpus.index.updatedAt,
      schemaCount: corpus.index.schemas.length,
    },
    records: manifestRecords,
    exitGateSubject: {
      name: exitGate.metadata.name,
      schemaRef: exitGate.metadata.schemaRef,
      createdAt: exitGate.metadata.createdAt,
      sha256: exitGate.sha256,
      preExisting: true,
    },
    excludedShadowFixture: {
      path: path.relative(repoRoot, separatedFixture.path).split(path.sep).join('/'),
      sha256: separatedFixture.sha256,
      schemaRef: separatedFixture.schemaRef,
      createdAt: separatedFixture.createdAt,
      reason: 'The s182-authored bounded fixture is retained as a fixture and is not the Sprint-183 exit-gate subject.',
    },
  };
  const corpusManifestContents = json(corpusManifest);

  const dispositions: SchemaDisposition[] = [];
  const artifactFiles: EvidenceFile[] = [];
  for (const record of corpus.records) {
    const targets = {} as Record<Target, TargetDisposition>;
    for (const target of TARGETS) {
      const compiled = await compileTarget(record, target, generator, evidenceDirectory);
      targets[target] = compiled.disposition;
      if (compiled.artifactFile) artifactFiles.push(compiled.artifactFile);
    }
    dispositions.push({
      name: record.metadata.name,
      schemaRef: record.metadata.schemaRef,
      createdAt: record.metadata.createdAt,
      sourceSha256: record.sha256,
      components: collectComponents(record.schema),
      targets,
    });
  }

  const compiledSchemas = dispositions
    .filter(({ targets }) => TARGETS.every((target) => targets[target].disposition === 'compiled'))
    .map(({ name }) => name);
  const gapSchemas = dispositions
    .filter(({ targets }) => TARGETS.some((target) => targets[target].disposition === 'typed-gap'))
    .map(({ name }) => name);
  assert(
    compiledSchemas.length === 1 && compiledSchemas[0] === EXIT_GATE_RECORD.name,
    `Expected only ${EXIT_GATE_RECORD.name} to compile both targets; received ${compiledSchemas.join(', ')}.`,
  );
  assert(gapSchemas.length === 15, `Expected 15 typed-gap schemas; received ${gapSchemas.length}.`);

  const compilationReport = {
    schemaVersion: '1.0.0',
    mission: 's183-m04',
    kind: 'saved-schema-compilation-report',
    corpus: {
      manifestPath: 'corpus-manifest.json',
      manifestSha256: sha256(corpusManifestContents),
      corpusContentHash,
      schemaCount: dispositions.length,
    },
    invocation: {
      tool: 'code.generate',
      profile: 'build',
      profileExplicit: true,
      options: { styling: 'tokens', typescript: true },
      targets: TARGETS,
      runsPerSchemaTarget: 2,
    },
    reportingRule: 'Compiled and typed-gap dispositions remain separate by schema and target; no blended pass percentage is computed.',
    summary: {
      schemaDispositions: {
        compiledBothTargets: compiledSchemas,
        typedGap: gapSchemas,
      },
      targetDispositions: Object.fromEntries(TARGETS.map((target) => [
        target,
        {
          compiled: dispositions.filter(({ targets }) => targets[target].disposition === 'compiled').map(({ name }) => name),
          typedGap: dispositions.filter(({ targets }) => targets[target].disposition === 'typed-gap').map(({ name }) => name),
        },
      ])),
      determinism: {
        schemaTargetCases: dispositions.length * TARGETS.length,
        generatorInvocations: dispositions.length * TARGETS.length * 2,
        byteIdenticalComparisons: dispositions.length * TARGETS.length,
        mismatches: [],
      },
    },
    results: dispositions.map((disposition) => ({
      name: disposition.name,
      schemaRef: disposition.schemaRef,
      createdAt: disposition.createdAt,
      sourceSha256: disposition.sourceSha256,
      components: disposition.components,
      targets: {
        react: publicDisposition(disposition.targets.react),
        vue: publicDisposition(disposition.targets.vue),
      },
    })),
  };
  const compilationReportContents = json(compilationReport);

  const distinctComponents = new Set(dispositions.flatMap(({ components }) => components));
  const rankedComponents = buildBreadthRanking(dispositions);
  const unsupportedComponents = new Set(rankedComponents.map((row) => row.component as string));
  const eligibleComponents = [...distinctComponents]
    .filter((component) => !unsupportedComponents.has(component))
    .sort(compareCodePoint);
  assert(distinctComponents.size === 48, `Expected 48 distinct corpus components; received ${distinctComponents.size}.`);
  assert(eligibleComponents.length === 12, `Expected 12 corpus components in the runnable nucleus; received ${eligibleComponents.length}.`);
  assert(rankedComponents.length === 36, `Expected 36 typed-gap components; received ${rankedComponents.length}.`);
  assert(
    eligibleComponents.every((component) => NUCLEUS_COMPONENTS.has(component)),
    `A compiled corpus component is outside foundation-v1: ${eligibleComponents.filter((component) => !NUCLEUS_COMPONENTS.has(component)).join(', ')}.`,
  );

  const breadthUnblockRanking = {
    schemaVersion: '1.0.0',
    mission: 's183-m04',
    kind: 'saved-schema-breadth-unblock-ranking',
    source: {
      compilationReportPath: 'compilation-report.json',
      compilationReportSha256: sha256(compilationReportContents),
      corpusContentHash,
    },
    rankingRule: 'Rank unsupported components by affected saved-schema count, then node occurrence count, then component ID. Counts are derived from the vendored corpus and are not a success percentage.',
    corpusComponentInventory: {
      distinct: distinctComponents.size,
      runnableNucleusPresent: eligibleComponents,
      unsupported: rankedComponents.length,
    },
    rankedComponents,
  };

  const files: EvidenceFile[] = [
    { relativePath: 'corpus-manifest.json', contents: corpusManifestContents },
    { relativePath: 'compilation-report.json', contents: compilationReportContents },
    { relativePath: 'breadth-unblock-ranking.json', contents: json(breadthUnblockRanking) },
    ...artifactFiles.sort((left, right) => compareCodePoint(left.relativePath, right.relativePath)),
  ];
  return {
    corpusManifest,
    compilationReport,
    breadthUnblockRanking,
    dispositions,
    files,
  };
}

async function writeEvidence(evidenceDirectory: string, evidence: SavedSchemaCorpusEvidence): Promise<void> {
  for (const file of evidence.files) {
    const destination = path.join(evidenceDirectory, file.relativePath);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, file.contents, 'utf8');
  }
}

async function checkEvidence(evidenceDirectory: string, evidence: SavedSchemaCorpusEvidence): Promise<void> {
  for (const file of evidence.files) {
    const destination = path.join(evidenceDirectory, file.relativePath);
    const actual = await fs.readFile(destination, 'utf8');
    assert(actual === file.contents, `${destination} is stale; rerun with --write.`);
  }
}

async function main(): Promise<void> {
  const modes = process.argv.slice(2);
  assert(
    modes.length <= 1 && (modes.length === 0 || modes[0] === '--check' || modes[0] === '--write'),
    'Usage: pnpm exec tsx scripts/product-reality/s183-m04-saved-schema-corpus.ts [--check|--write]',
  );
  const mode = modes[0] ?? '--check';
  const evidence = await buildSavedSchemaCorpusEvidence();
  if (mode === '--write') {
    await writeEvidence(defaultEvidenceDirectory, evidence);
  } else {
    await checkEvidence(defaultEvidenceDirectory, evidence);
  }
  const compiled = evidence.dispositions.filter(({ targets }) => (
    TARGETS.every((target) => targets[target].disposition === 'compiled')
  )).length;
  process.stdout.write(
    `PASS: ${evidence.dispositions.length} saved schemas recorded; ${compiled} compiled for React and Vue; ${evidence.dispositions.length - compiled} reported typed gaps; repeated runs were byte-identical.\n`,
  );
}

const entryPoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === entryPoint) {
  main().catch((error) => {
    process.stderr.write(`s183-m04-saved-schema-corpus: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
