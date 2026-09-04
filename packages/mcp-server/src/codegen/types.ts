import type { UiSchema } from '../schemas/generated.js';

export type CodegenFramework = 'react' | 'vue' | 'html';

export type CodegenStyling = 'inline' | 'tokens' | 'tailwind';

export type CodegenOptions = {
  typescript: boolean;
  styling: CodegenStyling;
};

export type CodegenIssue = {
  code: string;
  message: string;
  nodeId?: string;
  component?: string;
};

export type GeneratedArtifactFile = {
  path: string;
  contents: string;
  contentHash: string;
};

export type GeneratedDependency = {
  name: string;
  version: string;
  kind: 'dependency' | 'peerDependency';
};

export type GeneratedArtifact = {
  schemaVersion: '1.0.0';
  framework: CodegenFramework;
  files: GeneratedArtifactFile[];
  dependencies: GeneratedDependency[];
  contentHash: string;
};

export type CodegenResult = {
  status: 'ok' | 'error';
  framework: CodegenFramework;
  code: string;
  fileExtension: string;
  imports: string[];
  warnings: CodegenIssue[];
  errors?: CodegenIssue[];
  meta?: {
    nodeCount?: number;
    componentCount?: number;
    unknownComponents?: string[];
  };
};

export type Emitter = (schema: UiSchema, options: CodegenOptions) => CodegenResult;
