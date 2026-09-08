<template>
  <Stack id="screen-form-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default); padding: var(--ref-space-inset-default)">
      <Stack id="form-title-1" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
            <FormLabelGroup id="ve-title-26" data-oods-component="FormLabelGroup" :label="label" :description="description" :placeholder="placeholder" />
            <StatusSelector id="ve-title-27" data-oods-component="StatusSelector" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
          </Stack>
      <Stack id="form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
            <Stack id="form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <ClassificationEditor id="slot-field-0-3" data-oods-component="ClassificationEditor" label="Supporting description used in detail and card contexts." :description="description" />
                  </Stack>
            <Stack id="form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-1-5" data-oods-component="Input" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" placeholder="Enter status" required :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                  </Stack>
            <Stack id="form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <DatePicker id="slot-field-2-7" data-oods-component="DatePicker" label="Field 2" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                  </Stack>
            <Stack id="form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-3-13" data-oods-component="Input" label="ISO currency code for the unit amount." placeholder="Enter currency" required :modelValue="handleChange_currencyState" @update:modelValue="setHandleChange_currencyState" @change="handleChange_currency" />
                  </Stack>
            <Stack id="form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Select id="slot-field-4-15" data-oods-component="Select" label="Defines whether taxes are included in the displayed price." :options="[{'value':'exclusive','label':'exclusive'},{'value':'inclusive','label':'inclusive'}]" placeholder="Enter tax behavior" required :modelValue="handleChange_tax_behaviorState" @update:modelValue="setHandleChange_tax_behaviorState" @change="handleChange_tax_behavior" />
                  </Stack>
            <Stack id="form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Checkbox id="slot-field-5-17" data-oods-component="Checkbox" label="Field 5" :modelValue="handleChange_searchActiveState" @update:modelValue="setHandleChange_searchActiveState" @change="handleChange_searchActive" />
                  </Stack>
            <Stack id="form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-6-19" data-oods-component="Input" label="Computed count of currently active filters." placeholder="Enter filterCount" required type="number" :modelValue="handleChange_filterCountState" @update:modelValue="setHandleChange_filterCountState" @change="handleChange_filterCount" />
                  </Stack>
            <Stack id="form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-7-21" data-oods-component="Input" label="Human-readable display name rendered in primary surfaces." placeholder="Enter label" required :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                  </Stack>
            <Stack id="form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-8-23" data-oods-component="Input" label="Hint copy surfaced in form fields when the label is empty." placeholder="Enter placeholder" :modelValue="handleChange_placeholderState" @update:modelValue="setHandleChange_placeholderState" @change="handleChange_placeholder" />
                  </Stack>
            <Stack id="form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-9-25" data-oods-component="Input" label="Lifecycle event associated with the most recent timestamp mutation." placeholder="Enter last event" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                  </Stack>
          </Stack>
      <Stack id="form-actions-9" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: flex-end; padding: var(--ref-space-inset-default)">
            <Button id="form-submit-10" data-oods-component="Button" content="Save" type="submit" />
          </Stack>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-form-11">
    <button type="button" data-oods-action="handleChange" @click="handleChange()">Change</button>
    <button type="button" data-oods-action="handleSubmit" @click="handleSubmit()">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Checkbox, ClassificationEditor, DatePicker, FormLabelGroup, Input, Select, Stack, StatusSelector } from '@oods/components-vue';
import '@oods/component-styles/css';

interface GeneratedUIActions {
  /* @oods-domain-action handleChange sha256:8d34e74d5c32a0ac604752249e369630e382e03991b58d88a9199a0add05b4a7 */
  /* @oods-domain-source sha256:7c3ae6feb9000b30f9248b6c15aa7765871a2d01e93cf9825373f138d43582d9 */
  handleChange: () => void;
  /* @oods-domain-action handleSubmit sha256:40dcacd8dc443bb231a9f4e83cdd8390bbf86979dacc3ed885912064ac94f846 */
  /* @oods-domain-source sha256:39f1e2024f9e76dc58ee38b1ae09943135d4d3f956ac63b59852fef68c598a99 */
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  activeFilters?: Record<string, unknown>[];
  allowedTransitions?: string[];
  billingInterval?: string;
  categories?: unknown[];
  classificationMetadata?: unknown;
  createdAt?: string;
  currency?: string;
  description?: string;
  filterCount?: number;
  filters?: Record<string, unknown>[];
  inventoryStatus?: 'in_stock' | 'low_stock' | 'backorder' | 'discontinued';
  label?: string;
  lastEvent?: string;
  lastEventAt?: string;
  page?: number;
  pageSize?: number;
  placeholder?: string;
  pricingModel?: string;
  primaryCategoryId?: string;
  primaryCategoryPath?: string;
  productId?: string;
  releaseChannel?: 'alpha' | 'beta' | 'limited' | 'general_availability';
  requiresSubscription?: boolean;
  searchActive?: boolean;
  searchQuery?: string;
  sku?: string;
  stateHistory?: unknown[];
  status?: string;
  summaryBlurb?: string;
  supportLevel?: 'standard' | 'premium' | 'enterprise';
  tagCount?: number;
  tagPreview?: string;
  tags?: unknown[];
  taxBehavior?: 'exclusive' | 'inclusive';
  totalItems?: number;
  totalPages?: number;
  unitAmountCents?: number;
  updatedAt?: string;
}
const generatedProps = defineProps<Props>();
const actions = generatedProps.actions;
/** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
const activeFilters = ref<Record<string, unknown>[]>(generatedProps.activeFilters ?? []);
/** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
const allowedTransitions = ref<string[]>(generatedProps.allowedTransitions ?? []);
/** Billing cadence when pricing_model indicates recurring revenue. */
const billingInterval = ref<string>(generatedProps.billingInterval ?? '');
/** Ordered taxonomy nodes scoped to the object. */
const categories = ref<unknown[]>(generatedProps.categories ?? []);
/** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
const classificationMetadata = ref<unknown>(generatedProps.classificationMetadata ?? '');
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** ISO currency code for the unit amount. */
const currency = ref<string>(generatedProps.currency ?? '');
/** Supporting description used in detail and card contexts. */
const description = ref<string>(generatedProps.description ?? '');
/** Computed count of currently active filters. */
const filterCount = ref<number>(generatedProps.filterCount ?? 0);
/** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
const filters = ref<Record<string, unknown>[]>(generatedProps.filters ?? []);
/** Availability state synchronized with inventory service. */
const inventoryStatus = ref<'in_stock' | 'low_stock' | 'backorder' | 'discontinued'>(generatedProps.inventoryStatus ?? 'in_stock');
/** Human-readable display name rendered in primary surfaces. */
const label = ref<string>(generatedProps.label ?? '');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<string>(generatedProps.lastEvent ?? '');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Current page number (1-based). */
const page = ref<number>(generatedProps.page ?? 0);
/** Number of items displayed per page. */
const pageSize = ref<number>(generatedProps.pageSize ?? 0);
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** Monetization model applied to the entity. */
const pricingModel = ref<string>(generatedProps.pricingModel ?? '');
/** Identifier of the canonical taxonomy node. */
const primaryCategoryId = ref<string>(generatedProps.primaryCategoryId ?? '');
/** Human-readable breadcrumb path (Electronics > Mobile > Android). */
const primaryCategoryPath = ref<string>(generatedProps.primaryCategoryPath ?? '');
/** Primary identifier for the product listing. */
const productId = ref<string>(generatedProps.productId ?? '');
/** Channel describing how the product is released to customers. */
const releaseChannel = ref<'alpha' | 'beta' | 'limited' | 'general_availability'>(generatedProps.releaseChannel ?? 'alpha');
/** Indicates whether access to the product requires an active subscription. */
const requiresSubscription = ref<boolean>(generatedProps.requiresSubscription ?? false);
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
/** Merchandising SKU exposed to commerce systems. */
const sku = ref<string>(generatedProps.sku ?? '');
/** Chronological log of state transitions. Each entry records the before/after states,
timestamp, and (when governance is enabled) the actor, reason, and transition metadata.
Rendered by StatusTimeline in the detail and timeline views.

Entry structure:
  - from: string (previous state)
  - to: string (new state)
  - timestamp: ISO 8601 datetime
  - actor_id: string (user/system who triggered the transition, optional)
  - reason: string (human-readable justification, required when requireTransitionReason is true)
  - transition_metadata: Record<string, unknown> (arbitrary context, optional)
 */
const stateHistory = ref<unknown[]>(generatedProps.stateHistory ?? []);
/** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
const status = ref<string>(generatedProps.status ?? '');
/** Short merchandising description surfaced in marketing contexts. */
const summaryBlurb = ref<string>(generatedProps.summaryBlurb ?? '');
/** SLA tier associated with the product. */
const supportLevel = ref<'standard' | 'premium' | 'enterprise'>(generatedProps.supportLevel ?? 'standard');
/** Number of canonical tags assigned to the object. */
const tagCount = ref<number>(generatedProps.tagCount ?? 0);
/** Denormalized comma-delimited preview for list renders. */
const tagPreview = ref<string>(generatedProps.tagPreview ?? '');
/** Canonical tag collection after synonym collapse. */
const tags = ref<unknown[]>(generatedProps.tags ?? []);
/** Defines whether taxes are included in the displayed price. */
const taxBehavior = ref<'exclusive' | 'inclusive'>(generatedProps.taxBehavior ?? 'exclusive');
/** Total number of items across all pages. Used to compute total page count. */
const totalItems = ref<number>(generatedProps.totalItems ?? 0);
/** Computed total number of pages (ceil(totalItems / pageSize)). */
const totalPages = ref<number>(generatedProps.totalPages ?? 0);
/** Base unit price expressed in the smallest currency denomination. */
const unitAmountCents = ref<number>(generatedProps.unitAmountCents ?? 0);
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange') || typeof actions.handleChange !== 'function') { throw new Error('GeneratedUI requires actions.handleChange.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

/* @oods-domain-binding handleChange */ const handleChange = () => { actions.handleChange(); };
const handleChange_created_atState = ref<string>(String(createdAt.value ?? ''));
const setHandleChange_created_atState = (value: string) => { handleChange_created_atState.value = value; };
/* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (value: string) => { setHandleChange_created_atState(value); };
const handleChange_currencyState = ref<string>(String(currency.value ?? ''));
const setHandleChange_currencyState = (value: string) => { handleChange_currencyState.value = value; };
/* @oods-local-binding handleChange_currency */ const handleChange_currency = (value: string) => { setHandleChange_currencyState(value); };
const handleChange_filterCountState = ref<string>(String(filterCount.value ?? ''));
const setHandleChange_filterCountState = (value: string) => { handleChange_filterCountState.value = value; };
/* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (value: string) => { setHandleChange_filterCountState(value); };
const handleChange_labelState = ref<string>(String(label.value ?? ''));
const setHandleChange_labelState = (value: string) => { handleChange_labelState.value = value; };
/* @oods-local-binding handleChange_label */ const handleChange_label = (value: string) => { setHandleChange_labelState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_placeholderState = ref<string>(String(placeholder.value ?? ''));
const setHandleChange_placeholderState = (value: string) => { handleChange_placeholderState.value = value; };
/* @oods-local-binding handleChange_placeholder */ const handleChange_placeholder = (value: string) => { setHandleChange_placeholderState(value); };
const handleChange_searchActiveState = ref<boolean>(searchActive.value ?? false);
const setHandleChange_searchActiveState = (checked: boolean) => { handleChange_searchActiveState.value = checked; };
/* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (checked: boolean) => { setHandleChange_searchActiveState(checked); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
const handleChange_tax_behaviorState = ref<string>(String(taxBehavior.value ?? ''));
const setHandleChange_tax_behaviorState = (value: string) => { handleChange_tax_behaviorState.value = value; };
/* @oods-local-binding handleChange_tax_behavior */ const handleChange_tax_behavior = (value: string) => { setHandleChange_tax_behaviorState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
