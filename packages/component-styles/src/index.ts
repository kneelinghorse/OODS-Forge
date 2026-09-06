export const COMPONENT_STYLE_VERSION = '1.0.0' as const;

export const COMPONENT_STYLE_IDS = [
  'AddressCollectionPanel', 'AddressEditor', 'AddressSummaryBadge', 'AddressValidationTimeline', 'AuditEvent', 'Badge',
  'Banner', 'Button', 'Card', 'CardHeader', 'Checkbox', 'ClassificationPanel', 'ColorSwatch', 'ColorizedBadge',
  'DatePicker', 'DetailHeader', 'FilterPanel', 'Grid', 'Input', 'MembershipAuditTimeline', 'MembershipPanel',
  'MessageEventTimeline', 'MessageStatusBadge', 'PreferenceEditor', 'PreferencePanel', 'PreferenceSummaryBadge',
  'PreferenceTimeline', 'PriceSummary', 'RoleAssignmentForm', 'RoleBadgeList', 'Select', 'Stack', 'StatusSelector',
  'Table', 'Tabs', 'TagInput', 'TagManager', 'TagPills', 'TemplatePicker', 'Text', 'Textarea', 'VizAreaPreview',
] as const;

export const SUPPORTED_COMPONENT_THEME_CELLS = [
  { brand: 'A', theme: 'light' },
  { brand: 'A', theme: 'dark' },
  { brand: 'A', theme: 'hc' },
  { brand: 'B', theme: 'light' },
  { brand: 'B', theme: 'dark' },
  { brand: 'B', theme: 'hc' },
] as const;

export const COMPONENT_DATA_ATTRIBUTE = 'data-oods-component' as const;
