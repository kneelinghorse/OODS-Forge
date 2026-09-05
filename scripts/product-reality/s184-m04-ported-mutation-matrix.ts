import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  PORTED_COMPONENT_IDS,
  portedScenarios,
  type PortedComponentId,
} from '@oods/component-contracts';

import {
  createTargetCapabilityPreflight,
  mergeTargetReadiness,
  type TargetReadiness,
} from '../../packages/mcp-server/src/codegen/target-readiness.js';
import type { UiSchema } from '../../packages/mcp-server/src/schemas/generated.js';
import { handle as generateCode } from '../../packages/mcp-server/src/tools/code.generate.js';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
export const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, '../..');
export const MUTATION_EVIDENCE_DIRECTORY = path.join(
  REPOSITORY_ROOT,
  'artifacts/product-reality/sprint-184/m04/mutations',
);

const FRAMEWORKS = ['react', 'vue'] as const;
type Framework = typeof FRAMEWORKS[number];
type CellState = 'green' | 'red';

type CellObservation = {
  cell: string;
  component: PortedComponentId;
  framework: Framework;
  readiness: CellState;
  readinessCodes: string[];
  readinessMessages: string[];
  generation: CellState;
  generationCodes: string[];
  generationMessages: string[];
  generatedArtifactNonempty: boolean;
};

type MutationObservation = {
  mutationId: string;
  selectedCell: string;
  targetComponent: PortedComponentId;
  targetFramework: Framework;
  sourcePath: string;
  operation: string;
  replacementCount: number;
  sourceSha256Before: string;
  virtualSourceSha256After: string;
  observations: CellObservation[];
  readinessRedCells: string[];
  generationRedCells: string[];
  crossFrameworkCell: string;
  crossFrameworkStayedGreen: boolean;
  exactIsolation: boolean;
  status: 'passed';
};

export type PortedMutationMatrixReport = {
  schemaVersion: '1.0.0';
  mission: 's184-m04';
  status: 'passed';
  claim: string;
  method: {
    seam: string;
    mutation: string;
    physicalSourceWrites: false;
    generationProfile: 'build';
  };
  dimensions: {
    components: number;
    frameworks: number;
    cells: number;
    mutations: number;
    observationsPerMutation: number;
    totalMutationCellObservations: number;
  };
  componentOrder: readonly PortedComponentId[];
  frameworkOrder: readonly Framework[];
  mutations: MutationObservation[];
  restoration: {
    observations: CellObservation[];
    greenCells: string[];
    redCells: string[];
    sourceSha256BeforeAndAfter: Record<Framework, {
      path: string;
      before: string;
      after: string;
      unchanged: boolean;
    }>;
    allCellsGreen: boolean;
    status: 'passed';
  };
  totals: {
    mutationsPassed: number;
    selectedReadinessReds: number;
    selectedGenerationReds: number;
    unselectedGreenObservations: number;
    crossFrameworkDiscriminationsPassed: number;
    restoredGreenCells: number;
  };
  assertions: {
    oneVirtualDeletionPerMutation: true;
    exactSelectedCellReadinessIsolation: true;
    exactSelectedCellGenerationIsolation: true;
    allOtherFifteenCellsStayGreen: true;
    crossFrameworkDiscrimination: true;
    restoredAllSixteenCellsGreen: true;
    onDiskPortedSourcesUnchanged: true;
  };
};

const IMPLEMENTATION_SOURCE: Readonly<Record<Framework, string>> = {
  react: path.join(REPOSITORY_ROOT, 'packages/components-react/src/ported.tsx'),
  vue: path.join(REPOSITORY_ROOT, 'packages/components-vue/src/ported.ts'),
};

function repositoryPath(absolutePath: string): string {
  return path.relative(REPOSITORY_ROOT, absolutePath).split(path.sep).join('/');
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(REPOSITORY_ROOT, relativePath), 'utf8')) as T;
}

const NUCLEUS_READINESS: Readonly<Record<Framework, TargetReadiness>> = {
  react: readJson('packages/components-react/evidence/react-readiness.v1.json'),
  vue: readJson('packages/components-vue/evidence/vue-readiness.v1.json'),
};

const PORTED_READINESS: Readonly<Record<Framework, TargetReadiness>> = {
  react: readJson('packages/components-react/evidence/react-ported-readiness.v1.json'),
  vue: readJson('packages/components-vue/evidence/vue-readiness-ported.v1.json'),
};

const MERGED_READINESS: Readonly<Record<Framework, TargetReadiness>> = {
  react: mergeTargetReadiness(NUCLEUS_READINESS.react, PORTED_READINESS.react),
  vue: mergeTargetReadiness(NUCLEUS_READINESS.vue, PORTED_READINESS.vue),
};

const SCENARIO_PROPS = new Map(
  portedScenarios.map((scenario) => [scenario.oodsComponentId, scenario.props] as const),
);

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sha256(contents: string): string {
  return createHash('sha256').update(contents).digest('hex');
}

function cellId(framework: Framework, component: PortedComponentId): string {
  return `${framework}/${component}`;
}

function schemaFor(component: PortedComponentId): UiSchema {
  const props = SCENARIO_PROPS.get(component);
  invariant(props !== undefined, `Missing shared scenario props for ${component}.`);
  return {
    version: '2026.09',
    screens: [{
      id: `s184-m04-mutation-${component}`,
      component,
      props: { ...props },
    }],
  };
}

function deleteOneNamedExport(
  source: string,
  component: PortedComponentId,
): { source: string; replacementCount: number } {
  const pattern = new RegExp(`\\bexport\\s+const\\s+${component}\\b`, 'g');
  const matches = source.match(pattern) ?? [];
  return {
    source: source.replace(pattern, `const ${component}`),
    replacementCount: matches.length,
  };
}

async function observeCells(
  targetCapabilityPreflight: ReturnType<typeof createTargetCapabilityPreflight>,
): Promise<CellObservation[]> {
  const observations: CellObservation[] = [];
  for (const framework of FRAMEWORKS) {
    for (const component of PORTED_COMPONENT_IDS) {
      const schema = schemaFor(component);
      const readinessIssues = targetCapabilityPreflight(schema.screens, framework);
      const generated = await generateCode(
        { framework, profile: 'build', schema },
        { targetCapabilityPreflight },
      );
      const generationCodes = (generated.errors ?? []).map(({ code }) => code);
      observations.push({
        cell: cellId(framework, component),
        component,
        framework,
        readiness: readinessIssues.length === 0 ? 'green' : 'red',
        readinessCodes: readinessIssues.map(({ code }) => code),
        readinessMessages: readinessIssues.map(({ message }) => message),
        generation: generated.status === 'ok' ? 'green' : 'red',
        generationCodes,
        generationMessages: (generated.errors ?? []).map(({ message }) => message),
        generatedArtifactNonempty: Boolean(
          generated.status === 'ok'
          && generated.code.length > 0
          && generated.artifact?.files.some(({ contents }) => contents.length > 0),
        ),
      });
    }
  }
  return observations;
}

function assertMutationIsolation(
  mutationId: string,
  selectedCell: string,
  observations: CellObservation[],
): void {
  invariant(observations.length === 16, `${mutationId}: expected 16 cell observations.`);
  const readinessRed = observations.filter(({ readiness }) => readiness === 'red');
  const generationRed = observations.filter(({ generation }) => generation === 'red');
  invariant(
    readinessRed.length === 1 && readinessRed[0]?.cell === selectedCell,
    `${mutationId}: readiness red set was ${JSON.stringify(readinessRed)}.`,
  );
  invariant(
    generationRed.length === 1 && generationRed[0]?.cell === selectedCell,
    `${mutationId}: generation red set was ${generationRed.map(({ cell }) => cell).join(', ')}.`,
  );
  const selected = observations.find(({ cell }) => cell === selectedCell);
  invariant(selected !== undefined, `${mutationId}: selected cell was not observed.`);
  invariant(
    selected.readinessCodes.length === 1 && selected.readinessCodes[0] === 'OODS-N015',
    `${mutationId}: selected readiness did not fail with exact OODS-N015.`,
  );
  invariant(
    selected.generationCodes.length === 1 && selected.generationCodes[0] === 'OODS-N015',
    `${mutationId}: selected generation did not fail with exact OODS-N015.`,
  );
  for (const observation of observations.filter(({ cell }) => cell !== selectedCell)) {
    invariant(observation.readinessCodes.length === 0, `${mutationId}: ${observation.cell} readiness leaked.`);
    invariant(observation.generationCodes.length === 0, `${mutationId}: ${observation.cell} generation leaked.`);
    invariant(
      observation.generatedArtifactNonempty,
      `${mutationId}: ${observation.cell} did not retain a non-empty artifact.`,
    );
  }
}

export async function createPortedMutationMatrixReport(): Promise<PortedMutationMatrixReport> {
  const sourceBefore: Record<Framework, string> = {
    react: readFileSync(IMPLEMENTATION_SOURCE.react, 'utf8'),
    vue: readFileSync(IMPLEMENTATION_SOURCE.vue, 'utf8'),
  };
  const mutations: MutationObservation[] = [];

  for (const targetFramework of FRAMEWORKS) {
    for (const targetComponent of PORTED_COMPONENT_IDS) {
      const mutationId = `${targetFramework}-${targetComponent}-export-deleted`;
      const selectedCell = cellId(targetFramework, targetComponent);
      const transformed = deleteOneNamedExport(sourceBefore[targetFramework], targetComponent);
      invariant(
        transformed.replacementCount === 1,
        `${mutationId}: expected exactly one named export declaration; found ${transformed.replacementCount}.`,
      );

      const targetCapabilityPreflight = createTargetCapabilityPreflight({
        repositoryRoot: REPOSITORY_ROOT,
        readiness: MERGED_READINESS,
        readFile: (absolutePath) => (
          absolutePath === IMPLEMENTATION_SOURCE[targetFramework]
            ? transformed.source
            : readFileSync(absolutePath, 'utf8')
        ),
      });
      const observations = await observeCells(targetCapabilityPreflight);
      assertMutationIsolation(mutationId, selectedCell, observations);

      const readinessRedCells = observations
        .filter(({ readiness }) => readiness === 'red')
        .map(({ cell }) => cell);
      const generationRedCells = observations
        .filter(({ generation }) => generation === 'red')
        .map(({ cell }) => cell);
      const crossFramework = targetFramework === 'react' ? 'vue' : 'react';
      const crossFrameworkCell = cellId(crossFramework, targetComponent);
      const crossFrameworkObservation = observations.find(({ cell }) => cell === crossFrameworkCell);
      const crossFrameworkStayedGreen = crossFrameworkObservation?.readiness === 'green'
        && crossFrameworkObservation.generation === 'green'
        && crossFrameworkObservation.generatedArtifactNonempty;
      invariant(
        crossFrameworkStayedGreen,
        `${mutationId}: counterpart ${crossFrameworkCell} did not stay fully green.`,
      );

      mutations.push({
        mutationId,
        selectedCell,
        targetComponent,
        targetFramework,
        sourcePath: repositoryPath(IMPLEMENTATION_SOURCE[targetFramework]),
        operation: `export const ${targetComponent} -> const ${targetComponent}`,
        replacementCount: transformed.replacementCount,
        sourceSha256Before: sha256(sourceBefore[targetFramework]),
        virtualSourceSha256After: sha256(transformed.source),
        observations,
        readinessRedCells,
        generationRedCells,
        crossFrameworkCell,
        crossFrameworkStayedGreen,
        exactIsolation: true,
        status: 'passed',
      });
    }
  }

  const restoredPreflight = createTargetCapabilityPreflight({
    repositoryRoot: REPOSITORY_ROOT,
    readiness: MERGED_READINESS,
  });
  const restoredObservations = await observeCells(restoredPreflight);
  const restoredRedCells = restoredObservations
    .filter(({ readiness, generation, generatedArtifactNonempty }) => (
      readiness === 'red' || generation === 'red' || !generatedArtifactNonempty
    ))
    .map(({ cell }) => cell);
  invariant(restoredObservations.length === 16, 'Restoration: expected 16 cell observations.');
  invariant(restoredRedCells.length === 0, `Restoration left red cells: ${restoredRedCells.join(', ')}.`);

  const sourceAfter: Record<Framework, string> = {
    react: readFileSync(IMPLEMENTATION_SOURCE.react, 'utf8'),
    vue: readFileSync(IMPLEMENTATION_SOURCE.vue, 'utf8'),
  };
  const sourceSha256BeforeAndAfter = Object.fromEntries(FRAMEWORKS.map((framework) => {
    const before = sha256(sourceBefore[framework]);
    const after = sha256(sourceAfter[framework]);
    invariant(before === after, `${framework} ported source changed on disk during virtual mutation run.`);
    return [framework, {
      path: repositoryPath(IMPLEMENTATION_SOURCE[framework]),
      before,
      after,
      unchanged: true,
    }];
  })) as PortedMutationMatrixReport['restoration']['sourceSha256BeforeAndAfter'];

  return {
    schemaVersion: '1.0.0',
    mission: 's184-m04',
    status: 'passed',
    claim:
      'For each of eight ported components on each of two framework targets, deleting exactly '
      + 'that named source export turns only its one readiness and build-generation cell red.',
    method: {
      seam: 'createTargetCapabilityPreflight({ readFile }) injected through code.generate dependencies',
      mutation: 'one virtual export-const deletion in the selected target ported source',
      physicalSourceWrites: false,
      generationProfile: 'build',
    },
    dimensions: {
      components: PORTED_COMPONENT_IDS.length,
      frameworks: FRAMEWORKS.length,
      cells: PORTED_COMPONENT_IDS.length * FRAMEWORKS.length,
      mutations: mutations.length,
      observationsPerMutation: PORTED_COMPONENT_IDS.length * FRAMEWORKS.length,
      totalMutationCellObservations:
        mutations.length * PORTED_COMPONENT_IDS.length * FRAMEWORKS.length,
    },
    componentOrder: PORTED_COMPONENT_IDS,
    frameworkOrder: FRAMEWORKS,
    mutations,
    restoration: {
      observations: restoredObservations,
      greenCells: restoredObservations.map(({ cell }) => cell),
      redCells: restoredRedCells,
      sourceSha256BeforeAndAfter,
      allCellsGreen: true,
      status: 'passed',
    },
    totals: {
      mutationsPassed: mutations.length,
      selectedReadinessReds: mutations.reduce(
        (total, mutation) => total + mutation.readinessRedCells.length,
        0,
      ),
      selectedGenerationReds: mutations.reduce(
        (total, mutation) => total + mutation.generationRedCells.length,
        0,
      ),
      unselectedGreenObservations: mutations.length * 15,
      crossFrameworkDiscriminationsPassed: mutations.filter(
        ({ crossFrameworkStayedGreen }) => crossFrameworkStayedGreen,
      ).length,
      restoredGreenCells: restoredObservations.length,
    },
    assertions: {
      oneVirtualDeletionPerMutation: true,
      exactSelectedCellReadinessIsolation: true,
      exactSelectedCellGenerationIsolation: true,
      allOtherFifteenCellsStayGreen: true,
      crossFrameworkDiscrimination: true,
      restoredAllSixteenCellsGreen: true,
      onDiskPortedSourcesUnchanged: true,
    },
  };
}

export function formatPortedMutationMatrixLog(report: PortedMutationMatrixReport): string {
  const lines = [
    'Sprint 184 m04 ported export mutation matrix',
    `status=${report.status}`,
    `dimensions=${report.dimensions.components}x${report.dimensions.frameworks} `
      + `mutations=${report.dimensions.mutations} cells-per-mutation=${report.dimensions.observationsPerMutation}`,
  ];
  for (const mutation of report.mutations) {
    lines.push(
      `${mutation.mutationId} selected-red=${mutation.selectedCell} other-green=15 `
      + `cross-framework-green=${mutation.crossFrameworkCell} replacement-count=${mutation.replacementCount}`,
    );
  }
  lines.push(
    `restored-green=${report.restoration.greenCells.length} restored-red=${report.restoration.redCells.length}`,
    `physical-source-writes=${report.method.physicalSourceWrites}`,
  );
  return `${lines.join('\n')}\n`;
}

export function formatPortedMutationMatrixChecksums(
  reportContents: string,
  logContents: string,
): string {
  return [
    `${sha256(reportContents)}  mutation-matrix.json`,
    `${sha256(logContents)}  mutation-matrix.log`,
    '',
  ].join('\n');
}

export async function writePortedMutationMatrixEvidence(): Promise<PortedMutationMatrixReport> {
  const report = await createPortedMutationMatrixReport();
  const reportContents = `${JSON.stringify(report, null, 2)}\n`;
  const logContents = formatPortedMutationMatrixLog(report);
  mkdirSync(MUTATION_EVIDENCE_DIRECTORY, { recursive: true });
  writeFileSync(path.join(MUTATION_EVIDENCE_DIRECTORY, 'mutation-matrix.json'), reportContents);
  writeFileSync(path.join(MUTATION_EVIDENCE_DIRECTORY, 'mutation-matrix.log'), logContents);
  writeFileSync(
    path.join(MUTATION_EVIDENCE_DIRECTORY, 'SHA256SUMS'),
    formatPortedMutationMatrixChecksums(reportContents, logContents),
  );
  return report;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : undefined;
if (invokedPath === import.meta.url) {
  const report = await writePortedMutationMatrixEvidence();
  process.stdout.write(formatPortedMutationMatrixLog(report));
}
