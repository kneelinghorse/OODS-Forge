export const PORTED_COMPONENT_STYLE_VERSION = '1.0.0' as const;

export const PORTED_COMPONENT_STYLE_IDS = [
  'StatusBadge',
  'PriceBadge',
  'StatusTimeline',
  'AuditTimeline',
  'CancellationSummary',
  'SearchInput',
  'PaginationBar',
  'RelativeTimestamp',
] as const;

export type PortedComponentStyleId = typeof PORTED_COMPONENT_STYLE_IDS[number];
