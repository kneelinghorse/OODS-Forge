/** A stable display policy shared by generated screens, components, and SSR. */
export function formatDateTime(value: string | number | Date | null | undefined, options: { locale?: string; timeZone?: string } = {}): string {
  if (value == null || value === '') return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat(options.locale ?? 'en-US', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: options.timeZone ?? 'UTC',
  }).format(date);
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
