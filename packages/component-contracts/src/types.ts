export const COMPONENT_CLASSIFICATIONS = [
  'native',
  'recipe',
  'alias',
  'authoring-only',
  'merged',
  'retired',
] as const;

export type ComponentClassification = (typeof COMPONENT_CLASSIFICATIONS)[number];

export const NUCLEUS_COMPONENT_IDS = [
  'Badge',
  'Banner',
  'Button',
  'Card',
  'CardHeader',
  'Checkbox',
  'ColorSwatch',
  'ColorizedBadge',
  'DatePicker',
  'DetailHeader',
  'Grid',
  'Input',
  'Select',
  'Stack',
  'Table',
  'Tabs',
  'Text',
  'Textarea',
  'VizAreaPreview',
] as const;

export type NucleusComponentId = (typeof NUCLEUS_COMPONENT_IDS)[number];

export const PORTED_COMPONENT_IDS = [
  'AuditTimeline',
  'CancellationSummary',
  'PaginationBar',
  'PriceBadge',
  'RelativeTimestamp',
  'SearchInput',
  'StatusBadge',
  'StatusTimeline',
] as const;

export type PortedComponentId = (typeof PORTED_COMPONENT_IDS)[number];
export type GovernedComponentId = NucleusComponentId | PortedComponentId;

/**
 * Cross-component workflow states understood by generated UI branches.
 *
 * These are deliberately separate from `ComponentContract.states`, which
 * describe a component's own visual or interaction states.
 */
export const UI_WORKFLOW_STATES = [
  'loading',
  'empty',
  'error',
  'success',
] as const;

export type UiWorkflowState = (typeof UI_WORKFLOW_STATES)[number];

export type ComponentContract = {
  id: GovernedComponentId;
  version: '1.0.0' | '1.1.0';
  props: readonly string[];
  slots: readonly string[];
  events: readonly string[];
  states: readonly string[];
  tokenRoles: readonly string[];
  accessibility: readonly string[];
  compatibility: string;
};

export type SharedScenario = {
  id: string;
  oodsComponentId: GovernedComponentId;
  props: Readonly<Record<string, unknown>>;
  slots: Readonly<Record<string, unknown>>;
  initialState: Readonly<Record<string, unknown>>;
  event: {
    name: string;
    trigger: string;
    expected: string;
  };
  assertions: readonly string[];
};

export type EvidenceStatus = 'passed' | 'failed' | 'missing' | 'skipped' | 'environment-blocked';

export type EvidenceResult = {
  status: EvidenceStatus;
  refs: readonly string[];
};
