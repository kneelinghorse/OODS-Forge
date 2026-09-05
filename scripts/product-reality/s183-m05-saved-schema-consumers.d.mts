export const GATE_NAMES: readonly string[];

export function canonicalize(value: unknown): string;
export function extractBareImports(source: string): string[];
export function sha256(value: string | Uint8Array): string;

export function validateRunnableArtifact(options: {
  artifact: Record<string, unknown>;
  framework: 'react' | 'vue';
}): Record<string, unknown>;

export function runSavedSchemaConsumerProof(options: {
  artifactRoot: string;
  artifacts: Record<'react' | 'vue', Record<string, unknown>>;
  tarballs?: unknown[];
  provenance?: Record<string, unknown>;
  runMutations?: boolean;
}): Promise<{
  report: Record<string, unknown>;
  frameworkReports: Array<Record<string, unknown>>;
}>;
