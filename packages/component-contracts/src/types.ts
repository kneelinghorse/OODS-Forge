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
] as const;

export type NucleusComponentId = (typeof NUCLEUS_COMPONENT_IDS)[number];

export type ComponentContract = {
  id: NucleusComponentId;
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
  oodsComponentId: NucleusComponentId;
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
