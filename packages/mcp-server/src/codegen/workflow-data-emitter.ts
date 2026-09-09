import type { UiSchema, UiElement, FieldSchemaEntry } from '../schemas/generated.js';
import { mapFieldType, snakeToCamel } from './binding-utils.js';

/** Seed every declared field; enum values and trait parameters remain the authority. */
export function workflowDataFiles(schema: UiSchema): Array<{ path: string; contents: string }> {
  const workflow = schema.workflow!;
  const fields = schema.objectSchema!;
  const { idField, lifecycleStates, billingIntervals, currency, sampleCount } = workflow.data;
  const titleField = ['plan_name', 'name', 'title', 'display_name'].find((name) => fields[name]) ?? idField;
  const seedValue = (name: string, field: FieldSchemaEntry, index: number): unknown => {
    if (name === idField) return `${workflow.object.toLowerCase()}-${String(index + 1).padStart(3, '0')}`;
    if (name === titleField) return `${workflow.object} ${String(index + 1).padStart(2, '0')}`;
    if (name === 'status' && lifecycleStates.length) return lifecycleStates[index % lifecycleStates.length];
    if (name === 'billing_interval' && billingIntervals.length) return billingIntervals[index % billingIntervals.length];
    if (name === 'last_event') return workflow.data.recordedEvents?.[index % Math.max(1, workflow.data.recordedEvents.length)] ?? 'created';
    if (name === 'currency') return currency;
    if (name === 'amount') return (index + 1) * 1900;
    if (name === 'is_archived') return index === sampleCount - 1;
    if (name === 'state_history') return [{ from: null, to: lifecycleStates[index % Math.max(1, lifecycleStates.length)] ?? 'created', at: '2026-01-01T00:00:00.000Z', reason: 'Sample record created' }];
    if (field.enum?.length) return field.enum[index % field.enum.length];
    if (field.type.endsWith('[]') || field.type === 'array') return [];
    if (field.type === 'object') return {};
    if (field.type === 'boolean') return false;
    if (field.type === 'integer' || field.type === 'number') return 0;
    if (/email/.test(name + field.type)) return `customer${index + 1}@example.com`;
    if (/(_at|_start|_end)$/.test(name) || /date|time/.test(field.type)) {
      if (name === 'archived_at') return index === sampleCount - 1 ? '2026-01-15T00:00:00.000Z' : null;
      return name.endsWith('_end') ? '2026-02-01T00:00:00.000Z' : '2026-01-01T00:00:00.000Z';
    }
    return field.type.endsWith('?') ? null : '';
  };
  const nodes = (elements: UiElement[]): UiElement[] => elements.flatMap(node => [node, ...nodes(node.children ?? [])]);
  const timeline = schema.screens.find(node => node.id === workflow.screens.find(screen => screen.context === 'timeline')?.id);
  const timelineNodes = nodes(timeline ? [timeline] : []);
  const eventCollection = timelineNodes.find(node => node.collection?.source === 'events')?.collection;
  const payment = timelineNodes.find(node => node.component === 'PaymentEventTimeline');
  const paymentSources = payment ? [
    { field: payment.props?.lastPaymentField, title: 'Last payment' },
    { field: payment.props?.nextPaymentField, title: 'Next payment' },
  ].filter(source => typeof source.field === 'string') : [];
  const records = Array.from({ length: sampleCount }, (_, index) => Object.fromEntries(
    Object.entries(fields).map(([name, field]) => [name, seedValue(name, field, index)]),
  ));
  const types = Object.entries(fields).map(([name, field]) => `  ${JSON.stringify(name)}: ${mapFieldType(field)};`).join('\n');
  const camelProps = Object.keys(fields).map((name) => `  ${snakeToCamel(name)}: record[${JSON.stringify(name)}],`).join('\n');
  return [
    { path: 'src/sample-data.ts', contents: `import type { DomainRecord } from './store';\n\nexport const sampleData: DomainRecord[] = ${JSON.stringify(records, null, 2)};\n` },
    { path: 'src/store.ts', contents: `import { chronologicalEvents, billingSummary, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';

export type DomainRecord = {
${types}
};
export const idField = ${JSON.stringify(idField)} as const;
export const titleField = ${JSON.stringify(titleField)} as const;
export const fieldTypes: Record<string, string> = ${JSON.stringify(Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.type])))};
export const traits: readonly string[] = ${JSON.stringify(workflow.data.traits.map((name) => name.split('/').pop()))};
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
${camelProps}
  };
}
export function history(record: DomainRecord): HistoryEntry[] {
  const value = (record as Record<string, unknown>).state_history;
  return Array.isArray(value) ? value.filter((entry): entry is HistoryEntry => !!entry && typeof entry === 'object' && typeof entry.to === 'string' && typeof entry.at === 'string') : [];
}
export function collectionEvents(record: DomainRecord): CollectionEvent[] {
  const values = record as Record<string, unknown>;
  const source = values[${JSON.stringify(eventCollection?.historyField ?? '')}];
  const events: CollectionEvent[] = Array.isArray(source) ? source.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object' || typeof entry.at !== 'string' || typeof entry.to !== 'string') return [];
    return [{ id: 'state-' + index, title: entry.to.replaceAll('_', ' '), at: entry.at, description: String(entry.reason ?? ''), kind: 'state' as const }];
  }) : [];
  for (const source of ${JSON.stringify(paymentSources)} as Array<{ field: string; title: string }>) {
    const at = values[source.field];
    if (typeof at === 'string') events.push({ id: 'payment-' + source.field, title: source.title, at, description: billingSummary(Number(values.amount), String(values.currency), ${workflow.data.minorUnits}, String(values.billing_interval)), kind: 'payment' });
  }
  return chronologicalEvents(events);
}
export function createStore(options: StoreOptions = {}) {
  let records = structuredClone(options.seed ?? (options.empty ? [] : sampleData));
  let fail = options.fail ?? false;
  const now = options.now ?? (() => new Date().toISOString());
  const requireTrait = (trait: string) => { if (!traits.includes(trait)) throw new Error('Object does not support ' + trait); };
  const get = (id: string) => {
    const record = records.find((entry) => String(entry[idField]) === id);
    if (!record) throw new Error('Record not found: ' + id);
    return structuredClone(record);
  };
  const save = (record: DomainRecord) => {
    const index = records.findIndex((entry) => entry[idField] === record[idField]);
    if (index < 0) throw new Error('Cannot save a missing record');
    records[index] = structuredClone(record);
    return get(String(record[idField]));
  };
  const setArchived = (id: string, archived: boolean) => {
    requireTrait('Archivable');
    const record = get(id);
    Object.assign(record, { is_archived: archived, archived_at: archived ? now() : null });
    return save(record);
  };
  return {
    get, save,
    async ready() {
      await new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, options.latency ?? 180)));
      if (fail) throw new Error('Simulated data service failure');
    },
    setFailure(value: boolean) { fail = value; },
    list(query: ListQuery = {}) {
      const search = (query.search ?? '').trim().toLowerCase();
      const filtered = records.filter((record) => {
        const values = record as Record<string, unknown>;
        return Boolean(values.is_archived) === (query.archived ?? false)
          && (!query.status || values.status === query.status)
          && (!search || Object.values(record).some((value) => String(value).toLowerCase().includes(search)));
      });
      const sort = query.sort ?? titleField;
      filtered.sort((a, b) => {
        const left = a[sort]; const right = b[sort];
        const order = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right));
        return (query.descending ? -1 : 1) * order;
      });
      const pageSize = Math.max(1, Math.floor(query.pageSize ?? 10));
      const page = Math.max(1, Math.floor(query.page ?? 1));
      return { total: filtered.length, page, pageSize, records: structuredClone(filtered.slice((page - 1) * pageSize, page * pageSize)) };
    },
    cancel(id: string, reason: string, code: string, atPeriodEnd: boolean) {
      requireTrait('Cancellable');
      const record = get(id);
      const values = record as Record<string, unknown>;
      if (values.is_archived || values.status === 'terminated' || values.status === 'pending_cancellation') throw new Error('This record cannot be cancelled in its current state');
      ${workflow.data.cancellationRequiresReason ? `if (!reason.trim()) throw new Error('Enter a cancellation reason');
      if (!code || (${JSON.stringify(workflow.data.cancellationReasonCodes ?? [])}.length > 0 && !(${JSON.stringify(workflow.data.cancellationReasonCodes ?? [])} as readonly string[]).includes(code))) throw new Error('Choose an allowed cancellation reason code');` : ''}
      const at = now();
      const entry: HistoryEntry = { from: String(values.status), to: 'pending_cancellation', at, reason: reason.trim(), code, atPeriodEnd };
      Object.assign(record, { status: 'pending_cancellation', cancellation_reason: reason.trim(), cancellation_reason_code: code, cancel_at_period_end: atPeriodEnd, cancellation_requested_at: at, state_history: [...history(record), entry], updated_at: at });
      return save(record);
    },
    archive(id: string) { return setArchived(id, true); },
    restore(id: string) { return setArchived(id, false); },
  };
}
` },
  ];
}
