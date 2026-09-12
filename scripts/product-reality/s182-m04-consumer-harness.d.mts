export interface EvidenceCount {
  selected: number;
  passed: number;
}

export interface GeneratedConsumerEvidence {
  report: EvidenceCount;
}

export interface CodegenUsableLedger {
  codegenUsableCells: number;
  derivedPredicates: string[];
  withheldPredicates: string[];
  foundationV1Candidate: boolean;
  foundationV1: boolean;
}

export const canonicalJson: (value: unknown) => string;

export function packFoundationPackages(
  artifactRoot: string,
  options?: { packageSourceRoot?: string; ignoreScripts?: boolean },
): Promise<unknown[]>;

export function runPackedExportProof(options: {
  artifactRoot: string;
  tarballs: unknown[];
}): Promise<EvidenceCount>;

export function runGeneratedConsumerProof(options: {
  artifactRoot: string;
  sources: Record<"react" | "vue", string>;
  tarballs: unknown[];
}): Promise<GeneratedConsumerEvidence>;

export function verifyGeneratedSource(options: {
  framework: "react" | "vue";
  styling: "inline" | "tokens" | "tailwind";
  typescript: boolean;
  code: string;
  imports: string[];
}): unknown;

export function writeMatrixEvidence(options: {
  artifactRoot: string;
  cells: unknown[];
}): Promise<EvidenceCount>;

export function writeCodegenUsableLedger(options: {
  artifactRoot: string;
  matrixReport: EvidenceCount;
  consumerReport: EvidenceCount;
}): Promise<CodegenUsableLedger>;
