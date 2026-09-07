export const COMPONENT_STYLE_VERSION = '1.0.0' as const;

export const COMPONENT_STYLE_IDS = [
  'AddressCollectionPanel', 'AddressEditor', 'AddressSummaryBadge', 'AddressValidationTimeline', 'AuditEvent',
  'AuditTimeline', 'Badge', 'Banner', 'Button', 'CancellationSummary',
  'Card', 'CardHeader', 'Checkbox', 'ClassificationBadge', 'ClassificationEditor',
  'ClassificationPanel', 'ColorSwatch', 'ColorizedBadge', 'DatePicker', 'DetailHeader',
  'FilterPanel', 'FormLabelGroup', 'Grid', 'InlineLabel', 'Input',
  'LabelCell', 'MembershipAuditTimeline', 'MembershipPanel', 'MessageEventTimeline', 'MessageStatusBadge',
  'PaginationBar', 'PreferenceEditor', 'PreferencePanel', 'PreferenceSummaryBadge', 'PreferenceTimeline',
  'PriceBadge', 'PriceSummary', 'RelativeTimestamp', 'RoleAssignmentForm', 'RoleBadgeList',
  'SearchInput', 'Select', 'Stack', 'StatusBadge', 'StatusSelector',
  'StatusTimeline', 'Table', 'Tabs', 'TagInput', 'TagManager',
  'TagPills', 'TemplatePicker', 'Text', 'Textarea', 'VizAreaPreview',
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
