import { BILLING_INTERVALS, recordCollectionEvents } from '@oods/component-contracts';
import type { UiElement, UiSchema } from '../schemas/generated.js';
import { snakeToCamel } from './binding-utils.js';
import { workflowSampleRecords } from './workflow-data-emitter.js';

/** Every element of a UiSchema in document order. */
export function schemaNodes(schema: UiSchema): UiElement[] {
  const nodes: UiElement[] = [];
  const visit = (node: UiElement) => { nodes.push(node); node.children?.forEach(visit); };
  schema.screens.forEach(visit);
  return nodes;
}

const camel = (name: string) => name.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());

/**
 * Fill the actual public object shape, retaining established fixture values where compatible.
 * Moved from scripts/product-reality/s185-m04-consumer-contract.ts (Sprint 201) so the served
 * preview and the design loop mount the same deterministic field model; the script re-exports it.
 */
export function deriveConsumerModel(schema: UiSchema, established: Record<string, unknown> = {}): Record<string, unknown> {
  const model = Object.fromEntries(Object.entries(schema.objectSchema ?? {}).sort(([a], [b]) => a.localeCompare(b)).map(([name, field]) => {
    const key = camel(name);
    const previous = established[key];
    let value: unknown;
    if (field.enum?.length) value = field.enum.includes(previous as string) ? previous : field.enum[0];
    else if (Object.hasOwn(established, key)) value = previous;
    else if (schemaNodes(schema).some((node) => node.component.startsWith('Billing') && node.props?.amountField === name)) value = 1999;
    else if (schemaNodes(schema).some((node) => node.component.startsWith('Billing') && node.props?.currencyField === name)) value = 'usd';
    else if (schemaNodes(schema).some((node) => node.component.startsWith('Billing') && node.props?.intervalField === name)) {
      const selector = schemaNodes(schema).find((node) => node.component === 'BillingIntervalSelector' && node.props?.intervalField === name);
      value = Array.isArray(selector?.props?.intervals) ? selector.props.intervals[0] : BILLING_INTERVALS[0];
    }
    // Exercise a non-first supported choice in the default presentational form.
    // Parameter names are not resolved here or written into the schema.
    else if (field.type === 'string' && schemaNodes(schema).some((node) => node.component === 'CancellationForm'
      && node.props?.codeField === name && node.props?.allowedReasons === undefined)) value = 'budget';
    else if (field.type === 'array' || field.type.endsWith('[]')) {
      // The fresh summary cohort must exercise a real, nonempty tag datum.
      value = schemaNodes(schema).some(node => node.component === 'AuditSummaryCard' && node.props?.auditLogField === name) ? [{ to_state: 'active', transitioned_at: '2026-09-05T12:00:00Z', actor_id: 'consumer-actor-1' }, { to_state: 'paused', transitioned_at: '2026-09-06T12:00:00Z', actor_id: 'consumer-actor-2' }] : schemaNodes(schema).some((node) => node.component === 'TagSummary' && node.props?.field === name) ? ['Consumer tag'] : [];
    }
    else if (field.type === 'object' || field.type.startsWith('Record<')) value = {};
    else if (field.type === 'integer' || field.type === 'number') value = 0;
    else if (field.type === 'boolean') value = false;
    else if (field.type === 'date') value = '2026-09-05';
    else if (field.type === 'datetime' || field.type === 'datetime?') value = '2026-09-05T12:00:00.000Z';
    else if (field.type === 'email') value = 'consumer@example.test';
    else if (field.type === 'url') value = 'https://example.test';
    else value = name.endsWith('_id') ? `consumer-${name.replace(/_/g, '-')}` : `Consumer ${name.replace(/_/g, ' ')}`;
    return [key, value];
  }));
  // Exercise actual collection content through the public consumer API.
  const sources = new Set(schemaNodes(schema).flatMap(node => node.collection ? [node.collection.source] : []));
  if (sources.has('rows')) { model.rows = [{ ...model }]; model.collectionQuery = { page: 1, pageSize: 10, total: 20 }; }
  if (sources.has('events')) model.events = [
    { id: 'consumer-event-1', kind: 'state', at: '2026-09-05T12:00:00Z', title: 'Created', description: 'Initial state' },
    { id: 'consumer-event-2', kind: 'state', at: '2026-09-06T12:00:00Z', title: 'Updated', description: 'Next state' },
  ];
  if (schemaNodes(schema).some(node => node.state)) model.uiState = 'success';
  return model;
}

export interface PreviewModelInput {
  schema: UiSchema;
  context: string;
  object?: string;
  /** The same object's workflow composition; supplies the seed records for standalone contexts. */
  workflowSchema?: UiSchema;
  /** Caller-supplied values; they win over every seeded value. */
  established?: Record<string, unknown>;
}

/**
 * The design loop's seed policy (scripts/design-loop/render.ts): a standalone preview uses the same
 * object/trait seed records as its workflow app, absence in the seed is meaningful, and generated
 * standalone components still receive rows and events through their public API.
 */
export function seedPreviewModel({ schema, context, object, workflowSchema, established = {} }: PreviewModelInput): Record<string, unknown> {
  const model = deriveConsumerModel(schema, established);
  if (Array.isArray(established.rows)) model.collectionQuery = { page: 1, pageSize: Math.max(10, established.rows.length), total: established.rows.length };
  if (workflowSchema && context !== 'workflow' && object && object !== 'Chunk') {
    const records = workflowSampleRecords(workflowSchema).filter(record => !record.is_archived);
    const rows = records.map(record => Object.fromEntries(Object.entries(record).map(([key, value]) => [snakeToCamel(key), value])));
    // Absence in the seed is meaningful (for example, an active record has no cancellation date).
    // Do not retain the consumer probe's invented values for omitted domain fields.
    for (const field of Object.keys(workflowSchema.objectSchema ?? {})) delete model[snakeToCamel(field)];
    Object.assign(model, rows[2] ?? rows[0], established);
    if (context === 'timeline' && !Object.hasOwn(established, 'events')) {
      const payment = schemaNodes(schema).find(node => node.component === 'PaymentEventTimeline');
      const payments = payment ? [{ field: payment.props?.lastPaymentField, title: 'Last payment' }, { field: payment.props?.nextPaymentField, title: 'Next payment' }].filter((entry): entry is { field: string; title: string } => typeof entry.field === 'string') : [];
      model.events = recordCollectionEvents(records[2] ?? records[0]!, { payments, minorUnits: workflowSchema.workflow?.data.minorUnits });
    }
    if (context === 'list' && !Object.hasOwn(established, 'rows')) {
      model.rows = rows;
      model.collectionQuery = { page: 1, pageSize: 10, total: records.length };
    }
  }
  return model;
}
