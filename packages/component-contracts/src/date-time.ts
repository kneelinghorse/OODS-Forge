import { billingSummary } from './billing.js';

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

/** Workflow apps and standalone previews project the same actual record events. */
export function recordCollectionEvents(record: Record<string, unknown>, options: { historyField?: string; payments?: Array<{ field: string; title: string }>; minorUnits?: number } = {}): CollectionEvent[] {
  const source = record[options.historyField ?? 'state_history'];
  const events: CollectionEvent[] = Array.isArray(source) ? source.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const at = entry.at ?? entry.transitioned_at;
    const state = entry.to ?? entry.to_state;
    if (typeof at !== 'string' || typeof state !== 'string') return [];
    return [{ id: 'state-' + index, title: String(entry.title ?? state.split(/[_-]/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')), at, description: String(entry.reason ?? ''), kind: 'state' as const }];
  }) : [];
  for (const source of options.payments ?? []) {
    const at = record[source.field];
    if (typeof at === 'string') events.push({ id: 'payment-' + source.field, title: source.title, at, description: billingSummary(Number(record.amount), String(record.currency), options.minorUnits ?? 100, String(record.billing_interval)), kind: 'payment' });
  }
  // A typed date has its own meaning; never invent a creation event for a period.
  for (const source of [{ field: 'created_at', title: 'Created' }, { field: 'last_event_at', title: String(record.last_event ?? 'Updated').replaceAll('_', ' ') }, { field: 'issued_at', title: 'Issued' }, { field: 'period_start', title: 'Period started' }, { field: 'ownership_transferred_at', title: 'Ownership transferred' }]) {
    const at = record[source.field];
    if (!chronologicalEvents(events).length && typeof at === 'string' && Number.isFinite(Date.parse(at))) events.push({ id: 'record-' + source.field, kind: 'state', title: source.title, at, description: '' });
  }
  return chronologicalEvents(events);
}
