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

export type GeneratedArtifactActionParameter = {
  name: string;
  type: string;
};

export type GeneratedArtifactActionSource = {
  nodeId: string;
  component: string;
  event: string;
};

/**
 * A domain action the generated UI cannot implement on the consumer's behalf.
 * Every entry is a required injection point. Compatible occurrences share one
 * entry and retain every schema declaration site. Component sites are wired by
 * the generated tree; screen-root sites are invoked by a consumer-owned surface.
 */
export type GeneratedArtifactAction = {
  name: string;
  parameters: GeneratedArtifactActionParameter[];
  sources: [GeneratedArtifactActionSource, ...GeneratedArtifactActionSource[]];
};

export type GeneratedArtifact = {
  schemaVersion: '1.0.0';
  framework: CodegenFramework;
  files: GeneratedArtifactFile[];
  dependencies: GeneratedDependency[];
  actions: GeneratedArtifactAction[];
  contentHash: string;
};

export type CodegenResult = {
  status: 'ok' | 'error';
  framework: CodegenFramework;
  code: string;
  fileExtension: string;
  imports: string[];
  /** Required domain actions to include in the generated artifact contract. */
  actions?: GeneratedArtifactAction[];
  warnings: CodegenIssue[];
  errors?: CodegenIssue[];
  meta?: {
    nodeCount?: number;
    componentCount?: number;
    unknownComponents?: string[];
  };
};

export type Emitter = (schema: UiSchema, options: CodegenOptions) => CodegenResult;
