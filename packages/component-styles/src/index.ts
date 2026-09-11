export const COMPONENT_STYLE_VERSION = '1.0.0' as const;

export const COMPONENT_STYLE_IDS = [
  'AddressCollectionPanel', 'AddressEditor', 'AddressSummaryBadge', 'AddressValidationTimeline', 'ArchivePill',
  'ArchiveSummary', 'AuditEvent', 'AuditTimeline', 'Badge', 'Banner',
  'ArchivedRowOverlay', 'BillingSummaryBadge', 'BillingAmountInput', 'BillingIntervalSelector', 'BillingCardMeta',
  'AuditSummaryCard', 'SortIndicator', 'TimelineEntryLabel',
  'CycleProgressCard', 'PaymentTimeline', 'PaymentEventTimeline',
  'Button', 'CancellationBadge', 'CancellationForm', 'CancellationSummary', 'Card',
  'CardHeader', 'Checkbox', 'ClassificationBadge', 'ClassificationEditor', 'ClassificationPanel',
  'ColorSwatch', 'ColorizedBadge', 'DatePicker', 'DetailHeader', 'FilterPanel',
  'FormLabelGroup', 'Grid', 'InlineLabel', 'Input', 'LabelCell',
  'MembershipAuditTimeline', 'MembershipPanel', 'MessageEventTimeline', 'MessageStatusBadge', 'OwnerBadge',
  'OwnershipMeta', 'OwnershipSummary', 'PaginationBar', 'PreferenceEditor', 'PreferencePanel',
  'PreferenceSummaryBadge', 'PreferenceTimeline', 'PriceBadge', 'PriceCardMeta', 'PriceSummary',
  'RelativeTimestamp', 'RoleAssignmentForm', 'RoleBadgeList', 'SearchInput', 'Select',
  'Stack', 'StatusBadge', 'StatusSelector', 'StatusTimeline', 'Table',
  'Tabs', 'TagInput', 'TagManager', 'TagPills', 'TagSummary',
  'TemplatePicker', 'Text', 'Textarea', 'VizAreaPreview',
  'ArchiveEvent', 'CancellationEvent', 'ColorStatePicker', 'CommunicationDetailPanel', 'GeoFieldMappingForm',
  'GeoResolutionBadge', 'GeocodablePreview', 'StateTransitionEvent', 'StatusColorLegend', 'VizAreaControls',
  'VizAxisControls', 'VizAxisSummary', 'VizColorControls', 'VizColorLegendConfig', 'VizEncodingBadge',
  'VizHeatmapControls', 'VizHeatmapPreview', 'VizLineControls', 'VizLinePreview', 'VizMarkControls',
  'VizMarkPreview', 'VizOpacityControls', 'VizOpacitySummary', 'VizPointControls', 'VizPointPreview',
  'VizRoleBadge', 'VizScaleControls', 'VizScaleSummary', 'VizScatterControls', 'VizScatterPreview',
  'VizShapeControls', 'VizShapeLegend', 'VizSizeControls', 'VizSizeSummary',
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
