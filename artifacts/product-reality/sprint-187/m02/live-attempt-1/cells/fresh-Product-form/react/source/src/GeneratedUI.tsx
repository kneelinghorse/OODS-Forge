import React from 'react';
import { Button, Checkbox, ClassificationEditor, DatePicker, FormLabelGroup, Input, Select, Stack, StatusSelector } from '@oods/components-react';
import '@oods/component-styles/css';

export interface GeneratedUIActions {
  /* @oods-domain-action handleChange sha256:8d34e74d5c32a0ac604752249e369630e382e03991b58d88a9199a0add05b4a7 */
  /* @oods-domain-source sha256:7c3ae6feb9000b30f9248b6c15aa7765871a2d01e93cf9825373f138d43582d9 */
  handleChange: () => void;
  /* @oods-domain-action handleSubmit sha256:40dcacd8dc443bb231a9f4e83cdd8390bbf86979dacc3ed885912064ac94f846 */
  /* @oods-domain-source sha256:39f1e2024f9e76dc58ee38b1ae09943135d4d3f956ac63b59852fef68c598a99 */
  handleSubmit: () => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
  /** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
  activeFilters?: Record<string, unknown>[];
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Billing cadence when pricing_model indicates recurring revenue. */
  billingInterval?: string;
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** ISO currency code for the unit amount. */
  currency: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Availability state synchronized with inventory service. */
  inventoryStatus: 'in_stock' | 'low_stock' | 'backorder' | 'discontinued';
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Monetization model applied to the entity. */
  pricingModel: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Primary identifier for the product listing. */
  productId: string;
  /** Channel describing how the product is released to customers. */
  releaseChannel: 'alpha' | 'beta' | 'limited' | 'general_availability';
  /** Indicates whether access to the product requires an active subscription. */
  requiresSubscription: boolean;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** Merchandising SKU exposed to commerce systems. */
  sku: string;
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
  stateHistory?: unknown[];
  /** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
  status: string;
  /** Short merchandising description surfaced in marketing contexts. */
  summaryBlurb?: string;
  /** SLA tier associated with the product. */
  supportLevel?: 'standard' | 'premium' | 'enterprise';
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** Defines whether taxes are included in the displayed price. */
  taxBehavior: 'exclusive' | 'inclusive';
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Base unit price expressed in the smallest currency denomination. */
  unitAmountCents: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type CheckboxProps = React.ComponentPropsWithoutRef<typeof Checkbox>;
type ClassificationEditorProps = React.ComponentPropsWithoutRef<typeof ClassificationEditor>;
type DatePickerProps = React.ComponentPropsWithoutRef<typeof DatePicker>;
type FormLabelGroupProps = React.ComponentPropsWithoutRef<typeof FormLabelGroup>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusSelectorProps = React.ComponentPropsWithoutRef<typeof StatusSelector>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, activeFilters, allowedTransitions, billingInterval, categories, classificationMetadata, createdAt, currency, description, filterCount, filters, inventoryStatus, label, lastEvent, lastEventAt, page, pageSize, placeholder, pricingModel, primaryCategoryId, primaryCategoryPath, productId, releaseChannel, requiresSubscription, searchActive, searchQuery, sku, stateHistory, status, summaryBlurb, supportLevel, tagCount, tagPreview, tags, taxBehavior, totalItems, totalPages, unitAmountCents, updatedAt }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange') || typeof actions.handleChange !== 'function') { throw new Error('GeneratedUI requires actions.handleChange.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  /* @oods-domain-binding handleChange */ const handleChange = () => { actions.handleChange(); };
  const [handleChange_created_atState, setHandleChange_created_atState] = React.useState<string>(String(createdAt ?? ''));
  /* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_created_atState(event.currentTarget.value); };
  const [handleChange_currencyState, setHandleChange_currencyState] = React.useState<string>(String(currency ?? ''));
  /* @oods-local-binding handleChange_currency */ const handleChange_currency = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_currencyState(event.currentTarget.value); };
  const [handleChange_filterCountState, setHandleChange_filterCountState] = React.useState<string>(String(filterCount ?? ''));
  /* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_filterCountState(event.currentTarget.value); };
  const [handleChange_labelState, setHandleChange_labelState] = React.useState<string>(String(label ?? ''));
  /* @oods-local-binding handleChange_label */ const handleChange_label = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_labelState(event.currentTarget.value); };
  const [handleChange_last_eventState, setHandleChange_last_eventState] = React.useState<string>(String(lastEvent ?? ''));
  /* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_last_eventState(event.currentTarget.value); };
  const [handleChange_placeholderState, setHandleChange_placeholderState] = React.useState<string>(String(placeholder ?? ''));
  /* @oods-local-binding handleChange_placeholder */ const handleChange_placeholder = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_placeholderState(event.currentTarget.value); };
  const [handleChange_searchActiveState, setHandleChange_searchActiveState] = React.useState<boolean>(searchActive ?? false);
  /* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_searchActiveState(event.currentTarget.checked); };
  const [handleChange_statusState, setHandleChange_statusState] = React.useState<string>(String(status ?? ''));
  /* @oods-local-binding handleChange_status */ const handleChange_status = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_statusState(event.currentTarget.value); };
  const [handleChange_tax_behaviorState, setHandleChange_tax_behaviorState] = React.useState<string>(String(taxBehavior ?? ''));
  /* @oods-local-binding handleChange_tax_behavior */ const handleChange_tax_behavior = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_tax_behaviorState(event.currentTarget.value); };
  /* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };

  return (
    <>
      <>
        <Stack id="screen-form-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)', padding: 'var(--ref-space-inset-default)' }}>
              <Stack id="form-title-1" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <FormLabelGroup id="ve-title-26" data-oods-component="FormLabelGroup" label={label} description={description} placeholder={placeholder} />
                      <StatusSelector id="ve-title-27" data-oods-component="StatusSelector" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" value={handleChange_statusState} onChange={handleChange_status} />
                    </Stack>
              <Stack id="form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <ClassificationEditor id="slot-field-0-3" data-oods-component="ClassificationEditor" label="Supporting description used in detail and card contexts." description={description} />
                              </Stack>
                      <Stack id="form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-1-5" data-oods-component="Input" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" placeholder="Enter status" required value={handleChange_statusState} onChange={handleChange_status} />
                              </Stack>
                      <Stack id="form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <DatePicker id="slot-field-2-7" data-oods-component="DatePicker" label="Field 2" value={handleChange_created_atState} onChange={handleChange_created_at} />
                              </Stack>
                      <Stack id="form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-3-13" data-oods-component="Input" label="ISO currency code for the unit amount." placeholder="Enter currency" required value={handleChange_currencyState} onChange={handleChange_currency} />
                              </Stack>
                      <Stack id="form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Select id="slot-field-4-15" data-oods-component="Select" label="Defines whether taxes are included in the displayed price." options={[{"value":"exclusive","label":"exclusive"},{"value":"inclusive","label":"inclusive"}]} placeholder="Enter tax behavior" required value={handleChange_tax_behaviorState} onChange={handleChange_tax_behavior} />
                              </Stack>
                      <Stack id="form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Checkbox id="slot-field-5-17" data-oods-component="Checkbox" label="Field 5" checked={handleChange_searchActiveState} onChange={handleChange_searchActive} />
                              </Stack>
                      <Stack id="form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-6-19" data-oods-component="Input" label="Computed count of currently active filters." placeholder="Enter filterCount" required type="number" value={handleChange_filterCountState} onChange={handleChange_filterCount} />
                              </Stack>
                      <Stack id="form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-7-21" data-oods-component="Input" label="Human-readable display name rendered in primary surfaces." placeholder="Enter label" required value={handleChange_labelState} onChange={handleChange_label} />
                              </Stack>
                      <Stack id="form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-8-23" data-oods-component="Input" label="Hint copy surfaced in form fields when the label is empty." placeholder="Enter placeholder" value={handleChange_placeholderState} onChange={handleChange_placeholder} />
                              </Stack>
                      <Stack id="form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-9-25" data-oods-component="Input" label="Lifecycle event associated with the most recent timestamp mutation." placeholder="Enter last event" required value={handleChange_last_eventState} onChange={handleChange_last_event} />
                              </Stack>
                    </Stack>
              <Stack id="form-actions-9" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 'var(--ref-space-inset-default)' }}>
                      <Button id="form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                    </Stack>
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-form-11">
          <button type="button" data-oods-action="handleChange" onClick={() => handleChange()}>Change</button>
          <button type="button" data-oods-action="handleSubmit" onClick={() => handleSubmit()}>Submit</button>
        </div>
      </>
    </>
  );
};
