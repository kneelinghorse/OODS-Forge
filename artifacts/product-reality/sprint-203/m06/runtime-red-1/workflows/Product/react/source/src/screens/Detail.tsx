import React from 'react';
import { Banner, Card, ClassificationPanel, DetailHeader, PriceSummary, Stack, StatusTimeline, Tabs, Text } from '@oods/components-react';
import '@oods/component-styles/css';
import { formatReadOnlyValue } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
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
  billingInterval?: 'one_time' | 'month' | 'year';
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** ISO currency code for the unit amount. */
  currency: 'USD' | 'EUR' | 'GBP' | 'AUD';
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
  lastEvent: 'created' | 'spec_updated' | 'price_changed' | 'retired';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Monetization model applied to the entity. */
  pricingModel: 'one_time' | 'subscription' | 'usage_based';
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
  status: 'draft' | 'in_review' | 'active' | 'retired';
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

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type ClassificationPanelProps = React.ComponentPropsWithoutRef<typeof ClassificationPanel>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type PriceSummaryProps = React.ComponentPropsWithoutRef<typeof PriceSummary>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusTimelineProps = React.ComponentPropsWithoutRef<typeof StatusTimeline>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, billingInterval, categories, classificationMetadata, createdAt, currency, description, filterCount, filters, inventoryStatus, label, lastEvent, lastEventAt, page, pageSize, placeholder, pricingModel, primaryCategoryId, primaryCategoryPath, productId, releaseChannel, requiresSubscription, searchActive, searchQuery, sku, stateHistory, status, summaryBlurb, supportLevel, tagCount, tagPreview, tags, taxBehavior, totalItems, totalPages, unitAmountCents, updatedAt }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
  /* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };

  return (
    <>
      <>
        <Stack id="detail-screen" data-oods-component="Stack">
              {uiState === 'loading' && (
                <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
              )}
              {uiState === 'empty' && (
                <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
              )}
              {uiState === 'error' && (
                <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
              )}
              {uiState === 'success' && (
                <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                        <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style={{ alignItems: 'space-between', display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-stack-default)', padding: 'var(--ref-space-inset-default)' }}>
                                  <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                              <DetailHeader id="detail-ve-header-24" data-oods-component="DetailHeader" title={label} subtitle={description} level={2} />
                                              <StatusTimeline id="detail-ve-header-25" data-oods-component="StatusTimeline" showActorId showReason history={stateHistory} allowedTransitions={allowedTransitions} status={status} />
                                              <PriceSummary id="detail-ve-header-29" data-oods-component="PriceSummary" amount={unitAmountCents} currency={currency} model={pricingModel} interval={billingInterval} />
                                            </Stack>
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style={{ alignItems: 'start', display: 'grid', gap: 'var(--ref-space-cluster-default)', gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 24rem)' }}>
                                  <div data-sidebar-main>
                                    <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                      { ...{"id":"detail-detail-tab-panel-3","label":"Details"}, panel: (
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                          <Stack id="detail-slot-tab-0-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                              <Stack id="detail-pg-status-timeline-32-read-field" data-oods-component="Stack">
                                                    <Text id="detail-pg-status-timeline-32-label" data-oods-component="Text" as="strong" content="Allowed transitions" />
                                                    <Text id="detail-pg-status-timeline-32-value" data-oods-component="Text">{formatReadOnlyValue(allowedTransitions, "string[]", false)}</Text>
                                                  </Stack>
                                            </Stack>
                                          <Stack id="detail-slot-tab-2-8-read-field" data-oods-component="Stack">
                                              <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Created at" />
                                              <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{formatReadOnlyValue(createdAt, "datetime", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-updated_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-updated_at-label" data-oods-component="Text" as="strong" content="Updated at" />
                                              <Text id="detail-detail-tabs-9-updated_at-value" data-oods-component="Text">{formatReadOnlyValue(updatedAt, "datetime", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                              <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{formatReadOnlyValue(lastEvent, "string", true)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                              <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{formatReadOnlyValue(lastEventAt, "datetime", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-product_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-product_id-label" data-oods-component="Text" as="strong" content="Product id" />
                                              <Text id="detail-detail-tabs-9-product_id-value" data-oods-component="Text">{formatReadOnlyValue(productId, "uuid", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-sku-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-sku-label" data-oods-component="Text" as="strong" content="Sku" />
                                              <Text id="detail-detail-tabs-9-sku-value" data-oods-component="Text">{formatReadOnlyValue(sku, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-inventory_status-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-inventory_status-label" data-oods-component="Text" as="strong" content="Inventory status" />
                                              <Text id="detail-detail-tabs-9-inventory_status-value" data-oods-component="Text">{formatReadOnlyValue(inventoryStatus, "string", true)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-release_channel-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-release_channel-label" data-oods-component="Text" as="strong" content="Release channel" />
                                              <Text id="detail-detail-tabs-9-release_channel-value" data-oods-component="Text">{formatReadOnlyValue(releaseChannel, "string", true)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-requires_subscription-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-requires_subscription-label" data-oods-component="Text" as="strong" content="Requires subscription" />
                                              <Text id="detail-detail-tabs-9-requires_subscription-value" data-oods-component="Text">{formatReadOnlyValue(requiresSubscription, "boolean", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-support_level-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-support_level-label" data-oods-component="Text" as="strong" content="Support level" />
                                              <Text id="detail-detail-tabs-9-support_level-value" data-oods-component="Text">{formatReadOnlyValue(supportLevel, "string", true)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-summary_blurb-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-summary_blurb-label" data-oods-component="Text" as="strong" content="Summary blurb" />
                                              <Text id="detail-detail-tabs-9-summary_blurb-value" data-oods-component="Text">{formatReadOnlyValue(summaryBlurb, "string", false)}</Text>
                                            </Stack>
                                        </Stack>
                                      ) }
                                    ]} />
                                  </div>
                                  <aside data-sidebar-aside>
                                    <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                                                  <Stack id="detail-slot-metadata-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                                                  <ClassificationPanel id="detail-ve-metadata-26" data-oods-component="ClassificationPanel">
                                                                                    <Stack id="detail-ve-metadata-26-primary_category_id-read-field" data-oods-component="Stack">
                                                                                                        <Text id="detail-ve-metadata-26-primary_category_id-label" data-oods-component="Text" as="strong" content="Primary category id" />
                                                                                                        <Text id="detail-ve-metadata-26-primary_category_id-value" data-oods-component="Text">{formatReadOnlyValue(primaryCategoryId, "string", false)}</Text>
                                                                                                      </Stack>
                                                                                    <Stack id="detail-ve-metadata-26-tags-read-field" data-oods-component="Stack">
                                                                                                        <Text id="detail-ve-metadata-26-tags-label" data-oods-component="Text" as="strong" content="Tags" />
                                                                                                        <Text id="detail-ve-metadata-26-tags-value" data-oods-component="Text">{formatReadOnlyValue(tags, "Tag[]", false)}</Text>
                                                                                                      </Stack>
                                                                                  </ClassificationPanel>
                                                                </Stack>
                                                </Stack>
                                  </aside>
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
          <button type="button" data-oods-action="handleViewTimeline" onClick={() => handleViewTimeline()}>View timeline</button>
        </div>
      </>
    </>
  );
};
