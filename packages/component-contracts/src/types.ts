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
  'AddressCollectionPanel',
  'AddressEditor',
  'AddressSummaryBadge',
  'AddressValidationTimeline',
  'AuditEvent',
  'AuditTimeline',
  'Badge',
  'Banner',
  'Button',
  'CancellationSummary',
  'Card',
  'CardHeader',
  'Checkbox',
  'ClassificationPanel',
  'ColorSwatch',
  'ColorizedBadge',
  'DatePicker',
  'DetailHeader',
  'FilterPanel',
  'Grid',
  'Input',
  'MembershipAuditTimeline',
  'MembershipPanel',
  'MessageEventTimeline',
  'MessageStatusBadge',
  'PaginationBar',
  'PreferenceEditor',
  'PreferencePanel',
  'PreferenceSummaryBadge',
  'PreferenceTimeline',
  'PriceBadge',
  'PriceSummary',
  'RelativeTimestamp',
  'RoleAssignmentForm',
  'RoleBadgeList',
  'SearchInput',
  'Select',
  'Stack',
  'StatusBadge',
  'StatusSelector',
  'StatusTimeline',
  'Table',
  'Tabs',
  'TagInput',
  'TagManager',
  'TagPills',
  'TemplatePicker',
  'Text',
  'Textarea',
  'VizAreaPreview',
] as const;

export type NucleusComponentId = (typeof NUCLEUS_COMPONENT_IDS)[number];

const HISTORICAL_PORTED_COMPONENT_IDS = [
  'AuditTimeline',
  'CancellationSummary',
  'PaginationBar',
  'PriceBadge',
  'RelativeTimestamp',
  'SearchInput',
  'StatusBadge',
  'StatusTimeline',
] as const satisfies readonly NucleusComponentId[];

/** @deprecated Historical compatibility cohort; all members belong to NucleusComponentId. */
export type PortedComponentId = (typeof HISTORICAL_PORTED_COMPONENT_IDS)[number];

/** @deprecated Compatibility subset derived from the canonical nucleus, not a second governed union. */
export const PORTED_COMPONENT_IDS: readonly PortedComponentId[] = NUCLEUS_COMPONENT_IDS.filter(
  (id): id is PortedComponentId => HISTORICAL_PORTED_COMPONENT_IDS.some((componentId) => componentId === id),
);

export type GovernedComponentId = NucleusComponentId;

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
