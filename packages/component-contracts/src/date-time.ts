/** A stable display policy shared by generated screens, components, and SSR. */
export function formatDateTime(value: string | number | Date | null | undefined, options: { locale?: string; timeZone?: string } = {}): string {
  if (value == null || value === '') return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat(options.locale ?? 'en-US', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: options.timeZone ?? 'UTC',
  }).format(date);
}

/** UTC datetime-local controls round-trip the same instant as deterministic displays. */
export function dateTimeInputValue(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 16) : '';
}

/** Absence stays absent; boolean summary terms use readable answers. */
export function summaryValue(value: unknown): string | undefined {
  return value == null ? undefined : typeof value === 'boolean' ? value ? 'Yes' : 'No' : String(value);
}

export interface CollectionEvent {
  id: string;
  title: string;
  at: string;
  description: string;
  kind: 'state' | 'payment';
}

/** Invalid dates cannot participate in a chronological view; ties retain source order. */
export function chronologicalEvents(events: readonly CollectionEvent[]): CollectionEvent[] {
  return events.filter(event => Number.isFinite(Date.parse(event.at)))
    .map((event, index) => ({ event, index }))
    .sort((a, b) => Date.parse(a.event.at) - Date.parse(b.event.at) || a.index - b.index)
    .map(({ event }) => event);
}

/** Format declared scalar display fields without changing the underlying record. */
export function formatReadOnlyValue(value: unknown, type: string, code = false): string {
  if (value == null || value === '') return 'Not recorded';
  if (type === 'date' || type === 'datetime') return formatDateTime(value as string | number | Date) || 'Invalid date';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(item => summaryValue(item) ?? '').join(', ') || 'None recorded';
  const text = String(value);
  return code ? text.replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()) : text;
}
