import React from 'react';
import { Card, ClassificationPanel, DetailHeader, FilterPanel, PriceSummary, SearchInput, Stack, StatusTimeline, Tabs, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export interface GeneratedUIActions {
  /* @oods-domain-action handleDelete sha256:221fdee3330ccb3c003961fa632660ca61b4f1713ca9b67d2612c45fe63a1f43 */
  /* @oods-domain-source sha256:74252fa49ed24d37978bced342336a0b2aac9bed23e8fa0d6d3db7f99f0fe9fc */
  handleDelete: () => void;
  /* @oods-domain-action handleEdit sha256:8d06ae954d1e16d46333996b5945dbfef37c642e52d7bc1f68ece666c760d9b2 */
  /* @oods-domain-source sha256:c0d990cc2989feb07786ba35c93b878e524cccf8ecc11583869e8f3344f87f48 */
  handleEdit: () => void;
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

type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type ClassificationPanelProps = React.ComponentPropsWithoutRef<typeof ClassificationPanel>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type FilterPanelProps = React.ComponentPropsWithoutRef<typeof FilterPanel>;
type PriceSummaryProps = React.ComponentPropsWithoutRef<typeof PriceSummary>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusTimelineProps = React.ComponentPropsWithoutRef<typeof StatusTimeline>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, activeFilters, allowedTransitions, billingInterval, categories, classificationMetadata, createdAt, currency, description, filterCount, filters, inventoryStatus, label, lastEvent, lastEventAt, page, pageSize, placeholder, pricingModel, primaryCategoryId, primaryCategoryPath, productId, releaseChannel, requiresSubscription, searchActive, searchQuery, sku, stateHistory, status, summaryBlurb, supportLevel, tagCount, tagPreview, tags, taxBehavior, totalItems, totalPages, unitAmountCents, updatedAt }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }

  /* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
  const [handleUpdate_searchQueryState, setHandleUpdate_searchQueryState] = React.useState<string>(String(searchQuery ?? ''));
  /* @oods-local-binding handleUpdate_searchQuery */ const handleUpdate_searchQuery = (value: string) => { setHandleUpdate_searchQueryState(value); };

  return (
    <>
      <>
        <Stack id="screen-detail-13" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
              <Stack id="detail-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                      <Stack id="slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <DetailHeader id="ve-header-24" data-oods-component="DetailHeader" title={label} subtitle={description} level={1} />
                                <StatusTimeline id="ve-header-25" data-oods-component="StatusTimeline" showActorId showReason history={stateHistory} allowedTransitions={allowedTransitions} status={status} />
                                <SearchInput id="ve-header-27" data-oods-component="SearchInput" label="The current search query string entered by the user." placeholder="Enter searchQuery" value={handleUpdate_searchQueryState} onUpdate={handleUpdate_searchQuery} />
                                <PriceSummary id="ve-header-29" data-oods-component="PriceSummary" amount={unitAmountCents} currency={currency} model={pricingModel} interval={billingInterval} />
                              </Stack>
                    </Stack>
              <Card id="detail-body-10" data-oods-component="Card" data-layout="sidebar" style={{ alignItems: 'start', display: 'grid', gap: 'var(--ref-space-cluster-default)', gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 24rem)' }}>
                      <div data-sidebar-main>
                        <Tabs id="detail-tabs-9" data-oods-component="Tabs" items={[
                          { ...{"id":"detail-tab-panel-3","label":"Content"}, panel: (
                            <Stack id="detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <StatusTimeline id="slot-tab-0-4" data-oods-component="StatusTimeline" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                  <Text id="pg-status-timeline-31" data-oods-component="Text" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;">{status}</Text>
                                  <Text id="pg-status-timeline-32" data-oods-component="Text" label="Materialized list of valid next states from the current status, computed from the&#10;transitionRules parameter. When transitionRules is null (open model), this contains&#10;all states except the current one. Used by StatusSelector to disable invalid options&#10;and by StatusBadge to indicate available paths.&#10;">{Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : ''}</Text>
                                </StatusTimeline>
                            </Stack>
                          ) },
                          { ...{"id":"detail-tab-panel-5","label":"Status & History"}, panel: (
                            <Stack id="detail-tab-panel-5" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <Card id="slot-tab-1-6" data-oods-component="Card" />
                            </Stack>
                          ) },
                          { ...{"id":"detail-tab-panel-7","label":"Overview"}, panel: (
                            <Stack id="detail-tab-panel-7" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <Text id="slot-tab-2-8" data-oods-component="Text" label="Timestamp recording when the entity was first created.">{createdAt}</Text>
                            </Stack>
                          ) },
                          { ...{"id":"detail-tab-panel-14","label":"Behavior"}, panel: (
                            <Stack id="detail-tab-panel-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <Card id="slot-tab-3-15" data-oods-component="Card" />
                            </Stack>
                          ) },
                          { ...{"id":"detail-tab-panel-16","label":"Billing"}, panel: (
                            <Stack id="detail-tab-panel-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <Stack id="slot-tab-4-17" data-oods-component="Stack" />
                            </Stack>
                          ) },
                          { ...{"id":"detail-tab-panel-18","label":"Settings"}, panel: (
                            <Stack id="detail-tab-panel-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <Stack id="slot-tab-5-19" data-oods-component="Stack" />
                            </Stack>
                          ) },
                          { ...{"id":"detail-tab-panel-20","label":"Pricing"}, panel: (
                            <Stack id="detail-tab-panel-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <Card id="slot-tab-6-21" data-oods-component="Card" />
                            </Stack>
                          ) },
                          { ...{"id":"detail-tab-panel-22","label":"Details"}, panel: (
                            <Stack id="detail-tab-panel-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <Card id="slot-tab-7-23" data-oods-component="Card" />
                            </Stack>
                          ) }
                        ]} />
                      </div>
                      <aside data-sidebar-aside>
                        <Stack id="detail-meta-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                                    <Stack id="slot-metadata-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                                  <ClassificationPanel id="ve-metadata-26" data-oods-component="ClassificationPanel" />
                                                  <FilterPanel id="ve-metadata-28" data-oods-component="FilterPanel" activeFilters={activeFilters} filters={filters} />
                                                </Stack>
                                  </Stack>
                      </aside>
                    </Card>
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-detail-13">
          <button type="button" data-oods-action="handleDelete" onClick={() => handleDelete()}>Delete</button>
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
        </div>
      </>
    </>
  );
};
