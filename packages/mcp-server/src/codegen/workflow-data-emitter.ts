import { chartNodes } from './chart-declaration.js';
import type { UiSchema, UiElement, FieldSchemaEntry } from '../schemas/generated.js';
import { mapFieldType, snakeToCamel } from './binding-utils.js';
import { fieldLabel } from '../compose/label-generator.js';

/** One deterministic preview policy. Authored examples/defaults and enums own domain values. */
/** A stable rotation for a seed string: the same seed always rotates the sample lists the same way; no seed leaves them as authored. */
export function sampleSeedRotation(seed: string | undefined): number {
  if (!seed) return 0;
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 1 + (hash % 9);
}

export function workflowSampleData(schema: UiSchema): { records: Array<Record<string, unknown>>; seedTable: Array<{ recordId: string; field: string; value: unknown; rule: string }> } {
  const fields = schema.objectSchema ?? {};
  const workflow = schema.workflow ?? {
    object: 'Record',
    data: { idField: Object.keys(fields).find(name => name.endsWith('_id')) ?? 'id', lifecycleStates: fields.status?.enum ?? [], billingIntervals: fields.billing_interval?.enum ?? ['monthly'], currency: 'USD', sampleCount: 1, recordedEvents: [], addressRoles: [] as string[], defaultAddressRole: 'primary', cancellationReasonCodes: [], minorUnits: 100 },
  };
  const { idField, lifecycleStates, billingIntervals, currency, sampleCount } = workflow.data;
  const seedAt = '2026-09-08T12:00:00.000Z';
  const charts = chartNodes(schema.screens).map(node => node.chart!);
  const titleField = ['plan_name', 'name', 'title', 'display_name', 'label'].find(name => fields[name]) ?? idField;
  const humanize = (value: string) => value.split(/[_-]/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  // The schema's seed rotates the deterministic lists, so a seed change alters the sample data and nothing else.
  const rotation = sampleSeedRotation(schema.seed);
  const rotate = <T>(list: T[]): T[] => [...list.slice(rotation % list.length), ...list.slice(0, rotation % list.length)];
  const labels = rotate(['Northstar', 'Harbor', 'Cedar', 'Summit', 'Orchard', 'Willow', 'Atlas', 'Meadow', 'Juniper', 'Brook']);
  const names = rotate(['Anika Bhatt', 'Milo Chen', 'Sunny Rivera', 'Ada Morgan', 'Theo Reed', 'Lena Park', 'Sam Brooks', 'Nora Patel', 'Eli Stone', 'Maya Silva']);
  const seedTable: Array<{ recordId: string; field: string; value: unknown; rule: string }> = [];
  const chart = charts.find(chart => chart.source === 'payment-events');
  const eventNames = workflow.data.recordedEvents?.length ? workflow.data.recordedEvents : fields.last_event?.enum ?? [];
  const creationEvent = eventNames.find(event => /creat|start/.test(event)) ?? eventNames[0] ?? 'created';
  const records = Array.from({ length: sampleCount }, (_, index) => {
    const rules: Record<string, string> = {};
    const label = labels[index % labels.length]!;
    const suffix = String(index + 1).padStart(3, '0');
    const seedValue = (name: string, field: FieldSchemaEntry): unknown => {
      const value = (result: unknown, rule: string) => { rules[name] = rule; return structuredClone(result); };
      const type = field.type.replace(/\?$/, '');
      const declaredChart = charts.find(chart => (chart.source === 'record-array' || chart.source === 'edge-array') && chart.dataField === name);
      if (declaredChart?.source === 'record-array' || declaredChart?.source === 'edge-array') return value(declaredChart.sampleRows, 'authored chart rows');
      if (field.examples?.length) return value(field.examples[index % field.examples.length], 'authored field example');
      if (name === idField) return value(`${workflow.object.toLowerCase()}-${suffix}`, 'stable object record key');
      if (type === 'AddressableEntry[]') return value([{ role: workflow.data.defaultAddressRole ?? workflow.data.addressRoles?.[0] ?? 'primary', address: { countryCode: 'US', addressLines: [`${100 + index} Main Street`], locality: 'Springfield', administrativeArea: 'IL', postalCode: '62701' }, isDefault: true, updatedAt: seedAt }], 'declared address role and deterministic postal address');
      if (name === 'default_address_role') return value(workflow.data.defaultAddressRole ?? workflow.data.addressRoles?.[0] ?? 'primary', 'declared address role');
      if (name === 'address_roles') return value([workflow.data.defaultAddressRole ?? workflow.data.addressRoles?.[0] ?? 'primary'], 'declared address role');
      if (field.enum?.length) return value(field.enum[index % field.enum.length], 'declared field enum');
      if (name === 'status' && lifecycleStates.length) return value(lifecycleStates[index % lifecycleStates.length], 'declared lifecycle state');
      if (name === 'billing_interval' && billingIntervals.length) return value(billingIntervals[index % billingIntervals.length], 'declared billing interval');
      if (name === 'currency') return value(currency, 'declared billing currency');
      if (name === 'is_archived') return value(index === sampleCount - 1, 'last record exercises archive view');
      if (name === titleField || /^(?:name|display_name|billing_contact_name|customer_name)$/.test(name)) return value(/name/.test(name) && name !== 'plan_name' ? names[index % names.length] : `${label} ${/plan/.test(name) ? 'Plan' : 'Workspace'}`, 'deterministic display name');
      if (name === 'amount' || name.endsWith('_minor')) return value([19, 49, 99, 149, 249][index % 5]! * (workflow.data.minorUnits ?? 100), 'tier price in declared minor units');
      if (field.default !== undefined) return value(field.default, 'declared field or trait parameter default');
      if (type === 'uuid') return value(`00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, 'deterministic UUID reference');
      if (type.endsWith('[]') || type === 'array') return value([], 'empty optional collection without authored examples');
      if (type === 'object' || type.startsWith('Record<') || /^[A-Z]/.test(type)) return value({}, 'structured document without authored default');
      if (type === 'boolean') return value(false, 'boolean default');
      if (type === 'integer' || type === 'number') return value(/count$/.test(name) ? index + 1 : 0, 'deterministic count or zero metric');
      if (/email/.test(name + type)) return value(`${names[index % names.length]!.toLowerCase().replaceAll(' ', '.')}@example.com`, 'reserved example email');
      if (name === 'timezone') return value('UTC', 'preview timezone');
      if (name === 'domain') return value(`${label.toLowerCase()}.example.com`, 'reserved example domain');
      if (type === 'url' || name.endsWith('_url')) return value(`https://${label.toLowerCase()}.example.com/${name.replace(/_url$/, '').replaceAll('_', '-')}`, 'reserved example URL');
      if (type === 'date' || type === 'datetime' || /(?:_at|_start|_end)$/.test(name)) return value(type === 'date' ? '2026-09-01' : name.endsWith('_end') ? '2026-10-01T12:00:00.000Z' : '2026-09-01T12:00:00.000Z', 'shared September preview period');
      if (name.endsWith('_id')) return value(`${name.replace(/_id$/, '').replaceAll('_', '-')}-${suffix}`, 'stable related-record key');
      if (name.endsWith('_number')) return value(`${name.replace(/_number$/, '').toUpperCase()}-2026-${suffix}`, 'readable sequential document number');
      if (name === 'status') return value('active', 'open status vocabulary preview');
      if (name === 'provider') return value('Internal billing', 'provider display name');
      if (name === 'billing_interval') return value('monthly', 'monthly cadence fallback');
      if (name.endsWith('_code')) return value(`${label.toLowerCase()}_${suffix}`, 'stable display code');
      if (name === 'unit_label') return value('seat', 'unit display label');
      if (name === 'collection_state') return value('Current', 'collection progress label');
      if (field.required) return value(humanize(name), 'human-readable required field fallback');
      return value(field.type.endsWith('?') ? null : '', 'optional absent value');
    };
    const record = Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, seedValue(name, field)]));
    for (const name of ['label', 'description']) {
      if (fields[name] && !fields[name].examples?.length && fields[name].default === undefined && name !== titleField) {
        record[name] = record[titleField];
        rules[name] = 'record title projection without placeholder text';
      }
    }
    const ended = ['ended', 'terminated', 'cancelled', 'canceled'].includes(String(record.status));
    const cancelling = ended || record.status === 'pending_cancellation';
    const interval = String(record.billing_interval ?? 'monthly');
    const months = interval === 'yearly' ? 12 : interval === 'quarterly' ? 3 : 1;
    const start = new Date(interval === 'yearly' ? '2026-03-01T12:00:00Z' : interval === 'quarterly' ? '2026-08-01T12:00:00Z' : '2026-09-01T12:00:00Z');
    if (ended) start.setUTCMonth(start.getUTCMonth() - months);
    const end = new Date(start); end.setUTCMonth(end.getUTCMonth() + months);
    const startAt = start.toISOString(), endAt = end.toISOString();
    const assign = (name: string, value: unknown, rule = 'record lifecycle and billing period at fixed seed date') => { if (Object.hasOwn(fields, name)) { record[name] = value; rules[name] = rule; } };
    for (const name of ['created_at', 'updated_at', 'last_event_at', 'last_payment_at']) assign(name, startAt);
    assign('last_event', creationEvent);
    assign('next_payment_due_at', endAt);
    assign('current_period_start', startAt); assign('current_period_end', endAt);
    assign('current_period_progress', ended ? 1 : (Date.parse(seedAt) - start.getTime()) / (end.getTime() - start.getTime()));
    assign('state_history', [{ from: null, to: record.status ?? lifecycleStates[0] ?? 'created', at: startAt, event: creationEvent, title: humanize(creationEvent), reason: 'Record created' }]);
    assign('cancel_at_period_end', record.status === 'pending_cancellation');
    // One record tells one story: the plan's interval is the billing interval, and the last
    // collection outcome agrees with the lifecycle state (`#2046` billing-cycle contradiction).
    if (fields.plan_interval && fields.billing_interval) assign('plan_interval', record.billing_interval, 'mirrors the billing interval');
    if (fields.payment_status?.enum?.length) {
      const outcomes = fields.payment_status.enum.map(String);
      const pick = (...wanted: string[]) => wanted.find(candidate => outcomes.includes(candidate));
      const outcome = ['past_due', 'unpaid'].includes(String(record.status)) ? pick('failed', 'retrying') : ['future', 'trialing'].includes(String(record.status)) ? pick('pending') : pick('succeeded', 'paid', 'pending');
      if (outcome) assign('payment_status', outcome, 'collection outcome consistent with the lifecycle state');
    }
    for (const name of Object.keys(fields).filter(name => name.startsWith('cancellation_'))) delete record[name];
    if (cancelling) {
      assign('cancellation_reason', 'Service no longer needed');
      assign('cancellation_reason_code', workflow.data.cancellationReasonCodes?.[0] ?? 'customer_request');
      assign('cancellation_requested_at', ended ? endAt : startAt);
    }
    // Line-item prices are authoritative when an object authors a chart dataset.
    const items = Array.isArray(record.line_items) ? record.line_items as Array<Record<string, unknown>> : [];
    const subtotal = items.length ? items.reduce((sum, item) => sum + Number(item.amount_minor ?? 0), 0) : Number(record.amount_minor ?? record.amount ?? record.subtotal_minor ?? record.total_minor ?? 0);
    if (fields.total_minor) {
      assign('subtotal_minor', subtotal, 'sum of authored line amounts or record price');
      assign('discount_minor', 0, 'no preview discount');
      assign('tax_minor', 0, 'no preview tax');
      assign('total_minor', subtotal, 'subtotal minus discount plus tax');
      assign('balance_minor', record.status === 'paid' ? 0 : subtotal, 'unpaid remainder of total');
    }
    if (fields.is_archived) {
      // These samples have no restoration history; active records were never archived.
      for (const name of ['archived_at', 'restored_at', 'archive_reason', 'archived_by', 'archive_metadata', 'restoration_metadata']) delete record[name];
      if (record.is_archived) {
        assign('archived_at', '2026-09-07T12:00:00.000Z', 'last record entered archive');
        assign('archive_reason', 'No longer in use', 'last record archive reason');
        assign('archived_by', 'system', 'last record archive actor');
      }
    }
    if (fields.preference_document) {
      const namespaces = Array.isArray(record.preference_namespaces) ? record.preference_namespaces.map(String) : [];
      const document = record.preference_document && typeof record.preference_document === 'object' ? record.preference_document as Record<string, unknown> : {};
      const preferences = document.preferences && typeof document.preferences === 'object' ? document.preferences as Record<string, unknown> : {};
      const metadata = { schemaVersion: record.preference_version ?? '1.0.0', lastUpdated: startAt, source: 'system', migrationApplied: [] };
      assign('preference_document', { version: metadata.schemaVersion, preferences: Object.fromEntries(namespaces.map(namespace => [namespace, preferences[namespace] ?? {}])), metadata }, 'declared preference namespaces/version with shared timestamp');
      assign('preference_metadata', metadata, 'preference document metadata');
    }
    if (chart?.source === 'payment-events') {
      record.payment_history = [0.8, 1.1, 0.9, 1].map((factor, paymentIndex) => {
        const at = new Date(String(record[chart.dateFields[0]!])); at.setUTCMonth(at.getUTCMonth() - (3 - paymentIndex));
        return { at: at.toISOString(), amount: Math.round(Number(record[chart.amountField]) * factor) };
      });
      rules.payment_history = 'four recorded payments proportional to record price';
    }
    for (const [field, value] of Object.entries(record)) seedTable.push({ recordId: String(record[idField]), field, value: structuredClone(value), rule: rules[field]! });
    return record;
  });
  return { records, seedTable };
}

export function workflowSampleRecords(schema: UiSchema): Array<Record<string, unknown>> {
  return workflowSampleData(schema).records;
}

export function workflowDataFiles(schema: UiSchema): Array<{ path: string; contents: string }> {
  const workflow = schema.workflow!;
  const fields = schema.objectSchema!;
  const { idField } = workflow.data;
  const titleField = ['plan_name', 'name', 'title', 'display_name', 'label'].find((name) => fields[name]) ?? idField;
  const records = workflowSampleRecords(schema);
  const nodes = (elements: UiElement[]): UiElement[] => elements.flatMap(node => [node, ...nodes(node.children ?? [])]);
  const declaredFilter = nodes(schema.screens).find(node => node.collectionControl === 'filter')?.props?.field;
  const filterField = typeof declaredFilter === 'string' && Object.hasOwn(fields, declaredFilter) ? declaredFilter : 'status';
  const eventNames = workflow.data.recordedEvents?.length ? workflow.data.recordedEvents : fields.last_event?.enum?.map(String) ?? [];
  const timeline = schema.screens.find(node => node.id === workflow.screens.find(screen => screen.context === 'timeline')?.id);
  const timelineNodes = nodes(timeline ? [timeline] : []);
  const eventCollection = timelineNodes.find(node => node.collection?.source === 'events')?.collection;
  const payment = timelineNodes.find(node => node.component === 'PaymentEventTimeline');
  const paymentSources = payment ? [
    { field: payment.props?.lastPaymentField, title: 'Last payment' },
    { field: payment.props?.nextPaymentField, title: 'Next payment' },
  ].filter(source => typeof source.field === 'string') : [];
  const types = Object.entries(fields).map(([name, field]) => `  ${JSON.stringify(name)}${field.required ? '' : '?'}: ${mapFieldType(field)};`).join('\n');
  const camelProps = Object.keys(fields).map((name) => `  ${snakeToCamel(name)}: record[${JSON.stringify(name)}],`).join('\n');
  return [
    { path: 'src/sample-data.ts', contents: `import type { DomainRecord } from './store';\n\nexport const sampleData: DomainRecord[] = ${JSON.stringify(records, null, 2)};\n` },
    { path: 'src/store.ts', contents: `import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';
${chartNodes(schema.screens).length ? "import { chartSvgByRecord } from './chart-assets';" : ''}

export type DomainRecord = {
${types}
${chartNodes(schema.screens).some(node => node.chart?.source === 'payment-events') ? '  payment_history: Array<{ at: string; amount: number }>;\n' : ''}};
${Object.values(fields).some(field => field.type === 'AddressableEntry[]') ? `
const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
export function collectionAddressIndex(entries: unknown[] | undefined, role?: string): number {
  const index = entries?.findIndex(value => asRecord(value).role === role) ?? -1;
  return index >= 0 ? index : entries?.length ? 0 : -1;
}
export function collectionAddress(entries: unknown[] | undefined, role?: string) {
  const entry = asRecord(entries?.[collectionAddressIndex(entries, role)]);
  const address = asRecord(entry.address);
  return { street: Array.isArray(address.addressLines) ? address.addressLines.map(String).join(', ') : '', city: String(address.locality ?? ''), region: String(address.administrativeArea ?? ''), postalCode: String(address.postalCode ?? '') };
}
export function collectionSummary(entries: unknown[] | undefined): string {
  return (entries ?? []).map(entry => { const address = collectionAddress([entry]); return [asRecord(entry).role, address.street, address.city, address.region, address.postalCode].filter(Boolean).join(', '); }).join('; ');
}
` : ''}
export const idField = ${JSON.stringify(idField)} as const;
export const titleField = ${JSON.stringify(titleField)} as const;
export const fieldLabels: Record<string, string> = ${JSON.stringify(Object.fromEntries(Object.keys(fields).map(name => [name, fieldLabel(name)])))};
export const fieldTypes: Record<string, string> = ${JSON.stringify(Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.type])))};
export const traits: readonly string[] = ${JSON.stringify(workflow.data.traits.map((name) => name.split('/').pop()))};
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { title?: string; from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
${camelProps}
${chartNodes(schema.screens).length ? `  svg: chartSvgByRecord[String(record[idField])],` : ''}
  };
}
export function history(record: DomainRecord): HistoryEntry[] {
  const value = (record as Record<string, unknown>).state_history;
  return Array.isArray(value) ? value.filter((entry): entry is HistoryEntry => !!entry && typeof entry === 'object' && typeof entry.to === 'string' && typeof entry.at === 'string') : [];
}
export function collectionEvents(record: DomainRecord): CollectionEvent[] {
  return recordCollectionEvents(record, ${JSON.stringify({ historyField: eventCollection?.historyField, payments: paymentSources, minorUnits: workflow.data.minorUnits })});
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
  // A saved edit is history: the record's state history gains an entry naming the changed fields.
  const update = (record: DomainRecord) => {
    const previous = records.find((entry) => entry[idField] === record[idField]);
    if (!previous) throw new Error('Cannot save a missing record');
    const values = record as Record<string, unknown>;
    const before = previous as Record<string, unknown>;
    const changed = Object.keys(values).filter((name) => Object.hasOwn(fieldTypes, name) && name !== 'state_history' && name !== 'updated_at' && JSON.stringify(values[name]) !== JSON.stringify(before[name]));
    if (changed.length === 0) return save(record);
    const at = now();
    const next = structuredClone(record);
    const target = next as Record<string, unknown>;
    if (Object.hasOwn(fieldTypes, 'updated_at')) target.updated_at = at;
    if (Object.hasOwn(fieldTypes, 'state_history')) {
      const status = String(target.status ?? before.status ?? '');
      const moved = changed.includes('status');
      const entry: HistoryEntry = { title: moved ? String(status).split(/[_-]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') : 'Updated', from: moved ? String(before.status ?? '') : null, to: status, at, reason: 'Edited ' + changed.map((name) => fieldLabels[name] ?? name).join(', ') };
      target.state_history = [...history(next), entry];
    }
    const events: readonly string[] = ${JSON.stringify(eventNames)};
    const updateEvent = events.find((event) => /updat|edit|profile|chang/.test(event));
    if (updateEvent && Object.hasOwn(fieldTypes, 'last_event')) { target.last_event = updateEvent; if (Object.hasOwn(fieldTypes, 'last_event_at')) target.last_event_at = at; }
    return save(next);
  };
  const setArchived = (id: string, archived: boolean) => {
    requireTrait('Archivable');
    const record = get(id);
    Object.assign(record, { is_archived: archived, archived_at: archived ? now() : null });
    return save(record);
  };
  return {
    get, save, update,
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
          && (!query.status || values${filterField === 'status' ? '.status' : `[${JSON.stringify(filterField)}]`} === query.status)
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
      const states: readonly string[] = ${JSON.stringify(workflow.data.lifecycleStates)};
      const immediate = states.includes('cancelled') && !states.includes('pending_cancellation');
      const target = immediate ? 'cancelled' : 'pending_cancellation';
      if (values.is_archived || values.status === 'terminated' || values.status === 'pending_cancellation' || (immediate && ['completed', 'cancelled', 'final'].includes(String(values.status)))) throw new Error('This record cannot be cancelled in its current state');
      ${workflow.data.cancellationRequiresReason ? `if (!reason.trim()) throw new Error('Enter a cancellation reason');
      if (!code || (${JSON.stringify(workflow.data.cancellationReasonCodes ?? [])}.length > 0 && !(${JSON.stringify(workflow.data.cancellationReasonCodes ?? [])} as readonly string[]).includes(code))) throw new Error('Choose an allowed cancellation reason code');` : ''}
      const at = now();
      const deferred = target === 'pending_cancellation' && atPeriodEnd;
      const entry: HistoryEntry = { title: target === 'cancelled' ? 'Cancelled' : 'Pending Cancellation', from: String(values.status), to: target, at, reason: reason.trim(), code, atPeriodEnd: deferred };
      Object.assign(record, { status: target, cancellation_reason: reason.trim(), cancellation_reason_code: code, cancel_at_period_end: deferred, cancellation_requested_at: at, state_history: [...history(record), entry], updated_at: at });
      return save(record);
    },
    archive(id: string) { return setArchived(id, true); },
    restore(id: string) { return setArchived(id, false); },
  };
}
` },
  ];
}
