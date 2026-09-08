import { UI_WORKFLOW_STATES } from '@oods/component-contracts';
import type { UiElement, UiSchema } from '../schemas/generated.js';
import type { DesignComposeInput, DesignComposeOutput } from '../tools/design.compose.js';
import { composeObject } from '../objects/trait-composer.js';
import { loadObject } from '../objects/object-loader.js';
import { handle as validate } from '../tools/repl.validate.js';
import { createSchemaRef, describeSchemaRef } from '../tools/schema-ref.js';

const ROUTES = { list: '/', detail: '/:id', form: '/:id/edit', timeline: '/:id/timeline' } as const;

/** Assemble public compositions. Trait actions are already present on each source screen. */
export async function assembleWorkflow(
  input: DesignComposeInput,
  compose: (input: DesignComposeInput) => Promise<DesignComposeOutput>,
): Promise<DesignComposeOutput> {
  const results: DesignComposeOutput[] = [];
  for (const context of Object.keys(ROUTES) as Array<keyof typeof ROUTES>) {
    const result = await compose({ ...input, context });
    if (result.status !== 'ok') return result;
    results.push(result);
  }
  const first = results[0]!;
  if (!first.objectUsed) return { ...first, status: 'error', errors: [{ code: 'OODS-V003', message: 'workflow requires a registered object.' }] };
  const object = composeObject(loadObject(first.objectUsed.name));
  const parameters = (name: string) => object.traits.find((trait) => trait.ref.name.split('/').pop() === name)?.ref.parameters ?? {};
  const lifecycle = parameters('Stateful');
  const billing = parameters('Billable');
  const timestamps = parameters('Timestampable');
  const cancellation = parameters('Cancellable');
  const fields = first.schema.objectSchema ?? {};
  const idField = Object.keys(fields).find((field) => field === `${object.object.name.toLowerCase()}_id`)
    ?? Object.keys(fields).find((field) => field === 'id' || field.endsWith('_id'))
    ?? Object.keys(fields)[0]!;
  const screens: UiElement[] = [];
  const workflow: NonNullable<UiSchema['workflow']> = {
    object: object.object.name, screens: (Object.keys(ROUTES) as Array<keyof typeof ROUTES>).map((context) => ({ id: `${context}-screen`, context, route: ROUTES[context] })) as NonNullable<UiSchema['workflow']>['screens'], transitions: [], states: [...UI_WORKFLOW_STATES],
    data: {
      idField, traits: first.objectUsed.traits, sampleCount: 10,
      recordedEvents: Array.isArray(timestamps.recordedEvents) ? timestamps.recordedEvents.map(String) : [],
      cancellationRequiresReason: cancellation.requireReason === true,
      cancellationReasonCodes: Array.isArray(cancellation.allowedReasons) ? cancellation.allowedReasons.map(String) : [],
      lifecycleStates: Array.isArray(lifecycle.states) ? lifecycle.states.map(String) : fields.status?.enum ?? [],
      billingIntervals: Array.isArray(billing.billingIntervals) ? billing.billingIntervals.map(String) : [],
      currency: String(billing.defaultCurrency ?? 'usd'), minorUnits: Number(billing.minorUnits ?? 100),
    },
  };
  for (const [index, context] of (Object.keys(ROUTES) as Array<keyof typeof ROUTES>).entries()) {
    const source = structuredClone(results[index]!.schema.screens[0]!);
    const prefix = (node: UiElement) => { node.id = `${context}-${node.id}`; node.children?.forEach(prefix); };
    prefix(source);
    const screen: UiElement = {
      id: `${context}-screen`, component: 'Stack', route: ROUTES[context],
      ...(source.bindings ? { bindings: source.bindings } : {}),
      children: [
        ...(['loading', 'empty', 'error'] as const).map((state): UiElement => ({
          id: `${context}-${state}`, component: 'Banner', state,
          props: { title: state === 'loading' ? 'Loading' : state === 'empty' ? 'No records found' : 'Unable to load records', message: state === 'error' ? 'Try again or choose another record.' : state === 'empty' ? 'Change the filters or add a record.' : 'Loading your records.' },
        })),
        { ...source, state: 'success', bindings: undefined },
      ],
    };
    screens.push(screen);
    for (const action of Object.values(screen.bindings ?? {})) {
      const destination = {
        handleRowClick: ['detail', 'navigate'], handleEdit: ['form', 'navigate'],
        handleSubmit: ['detail', 'save'], handleCancel: ['detail', 'pending_cancellation'],
        handleViewTimeline: ['timeline', 'navigate'], handleDelete: ['list', 'archive'],
      } as const;
      const transition = destination[action as keyof typeof destination];
      if (transition) workflow.transitions.push({ action, from: context, to: transition[0], effect: transition[1] });
    }
  }
  const schema: UiSchema = { ...first.schema, screens: [screens[0]!, ...screens.slice(1)], workflow };
  let validation: DesignComposeOutput['validation'] = { status: 'skipped' };
  if (input.options?.validate !== false) {
    const result = await validate({ mode: 'full', schema, options: { checkComponents: true } });
    validation = { status: result.status, errors: result.errors, warnings: result.warnings };
  }
  const countNodes = (node: UiElement): number => 1 + (node.children ?? []).reduce((sum, child) => sum + countNodes(child), 0);
  const ref = describeSchemaRef(createSchemaRef(schema, 'compose'));
  return {
    ...first, schema, validation,
    ...(first.meta ? { meta: { ...first.meta, layoutDetected: 'workflow', slotCount: results.reduce((sum, result) => sum + (result.meta?.slotCount ?? 0), 0), nodeCount: screens.reduce((sum, screen) => sum + countNodes(screen), 0) } } : {}),
    layout: 'workflow', schemaRef: ref.ref,
    schemaRefCreatedAt: ref.createdAt, schemaRefExpiresAt: ref.expiresAt,
    selections: results.flatMap((result) => result.selections),
    warnings: results.flatMap((result) => result.warnings),
  };
}
