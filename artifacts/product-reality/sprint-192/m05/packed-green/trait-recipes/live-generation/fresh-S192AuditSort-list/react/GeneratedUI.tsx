import React from 'react';
import { Banner, Button, ClassificationBadge, LabelCell, PaginationBar, PriceBadge, RelativeTimestamp, SearchInput, Select, SortIndicator, Stack, StatusBadge, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export interface GeneratedUIActions {
  /* @oods-domain-action handleFilter sha256:16ab1e92d1fca94435e207207864ab7015dc274fc62e2f211a0df55cc291ea36 */
  /* @oods-domain-source sha256:8e5f3caefc9ad5e749948c77de5f5978bb91ef33958f95a5a2be4b419cff400e */
  handleFilter: (criteria: Record<string, unknown>) => void;
  /* @oods-domain-action handlePageChange sha256:78ef60870d55a6e088b4e3ef0a0961fa95794baa77ee43f37fdaee1bcc395469 */
  /* @oods-domain-source sha256:300063760dda8c519a2f55163f592f1d2a1c688624ead19adb05a6639ee54617 */
  handlePageChange: (page: number) => void;
  /* @oods-domain-action handleRowClick sha256:773eb5947f10b9c469abd54e200f61529df89035100d7d19eaa88adcd565efc0 */
  /* @oods-domain-source sha256:2691a39947329776a84396671cd57ad501e6855e24bc09bfe575a98e1fde4a88 */
  handleRowClick: (rowId: string) => void;
  /* @oods-domain-action handleSortChange sha256:d2d2e92fb41f95c436c4dfc159de4bbd6ddabb71d0acabff5afb313118e469cf */
  /* @oods-domain-source sha256:9e2b4e1e50965a4d775d5db99a73153cff43fde3a021727df73fc700f401864b */
  handleSortChange: (sort: { field: string; direction: 'asc' | 'desc'; active: boolean }) => void;
}

export interface PageProps {
  rows?: Array<{ label: string; description?: string; placeholder?: string; status: string; stateHistory?: unknown[]; allowedTransitions?: string[]; createdAt: string; updatedAt?: string; lastEvent: string; lastEventAt?: string; unitAmountCents: number; currency: string; pricingModel: string; billingInterval?: string; taxBehavior: 'exclusive' | 'inclusive'; classificationMetadata: unknown; categories?: unknown[]; primaryCategoryId?: string; primaryCategoryPath?: string; tags?: unknown[]; tagCount?: number; tagPreview?: string; searchQuery?: string; searchActive?: boolean; filters?: Record<string, unknown>[]; activeFilters?: Record<string, unknown>[]; filterCount: number; page: number; pageSize: number; totalItems?: number; totalPages?: number; auditLog: unknown[]; sortField?: string; sortDirection?: 'asc' | 'desc'; sortActive?: boolean; productId: string; sku: string; inventoryStatus: 'in_stock' | 'low_stock' | 'backorder' | 'discontinued'; releaseChannel: 'alpha' | 'beta' | 'limited' | 'general_availability'; requiresSubscription: boolean; supportLevel?: 'standard' | 'premium' | 'enterprise'; summaryBlurb?: string }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
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
  /** Audit proof records */
  auditLog: unknown[];
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
  /** Whether sorting is currently applied (sortField is non-empty). */
  sortActive?: boolean;
  /** Current sort direction. */
  sortDirection?: 'asc' | 'desc';
  /** The currently active sort field name. Empty string means no active sort. */
  sortField?: string;
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

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type ClassificationBadgeProps = React.ComponentPropsWithoutRef<typeof ClassificationBadge>;
type LabelCellProps = React.ComponentPropsWithoutRef<typeof LabelCell>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type PriceBadgeProps = React.ComponentPropsWithoutRef<typeof PriceBadge>;
type RelativeTimestampProps = React.ComponentPropsWithoutRef<typeof RelativeTimestamp>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type SortIndicatorProps = React.ComponentPropsWithoutRef<typeof SortIndicator>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusBadgeProps = React.ComponentPropsWithoutRef<typeof StatusBadge>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, activeFilters, allowedTransitions, auditLog, billingInterval, categories, classificationMetadata, createdAt, currency, description, filterCount, filters, inventoryStatus, label, lastEvent, lastEventAt, page, pageSize, placeholder, pricingModel, primaryCategoryId, primaryCategoryPath, productId, releaseChannel, requiresSubscription, searchActive, searchQuery, sku, sortActive, sortDirection, sortField, stateHistory, status, summaryBlurb, supportLevel, tagCount, tagPreview, tags, taxBehavior, totalItems, totalPages, unitAmountCents, updatedAt, rows = [], collectionQuery = {} }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handlePageChange') || typeof actions.handlePageChange !== 'function') { throw new Error('GeneratedUI requires actions.handlePageChange.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSortChange') || typeof actions.handleSortChange !== 'function') { throw new Error('GeneratedUI requires actions.handleSortChange.'); }

  /* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
  /* @oods-domain-binding handlePageChange */ const handlePageChange = (page: number) => { actions.handlePageChange(page); };
  /* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
  /* @oods-domain-binding handleSortChange */ const handleSortChange = (sort: { field: string; direction: 'asc' | 'desc'; active: boolean }) => { actions.handleSortChange(sort); };

  return (
    <>
      <Stack id="screen-list-9" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
            <Stack id="list-toolbar-4" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                    <SearchInput id="ve-search-11" label="Search" placeholder="Search records" value={collectionQuery.search ?? ''} clearable={true} onValueChange={(search) => handleFilter({ ...collectionQuery, search })} />
                    <Select id="slot-filters-2" label="Status" value={collectionQuery.status ?? ''} options={[{'value': '', 'label': 'All states'}]} onChange={(event) => handleFilter({ ...collectionQuery, status: event.currentTarget.value })} />
                    <SortIndicator id="ve-search-14" data-oods-component="SortIndicator" defaultSortDirection="asc" defaultSortField="name" sortableFields={["name"]} triStateSort sortField={sortField} sortDirection={sortDirection} data-oods-action="handleSortChange" onChange={handleSortChange} />
                  </Stack>
            <section id="list-items-5" data-oods-collection="rows">{rows.length === 0 ? (<Banner id="list-items-5-empty" data-oods-component="Banner" content="No records found." />) : (<ol aria-label="Records" className="oods-collection">{rows.map(({ label, description, placeholder, status, stateHistory, allowedTransitions, createdAt, updatedAt, lastEvent, lastEventAt, unitAmountCents, currency, pricingModel, billingInterval, taxBehavior, classificationMetadata, categories, primaryCategoryId, primaryCategoryPath, tags, tagCount, tagPreview, searchQuery, searchActive, filters, activeFilters, filterCount, page, pageSize, totalItems, totalPages, auditLog, sortField, sortDirection, sortActive, productId, sku, inventoryStatus, releaseChannel, requiresSubscription, supportLevel, summaryBlurb }, collectionIndex) => <li key={String(primaryCategoryId)}><Button id={'list-items-5-row-' + collectionIndex} type="button" className="oods-collection-row" data-record-id={String(primaryCategoryId)} onClick={() => handleRowClick(String(primaryCategoryId))}><Text id={'list-items-5-title-' + collectionIndex} data-oods-component="Text">{primaryCategoryId}</Text>
            <LabelCell id={'ve-items-10-' + collectionIndex} data-oods-component="LabelCell" truncate description={description} label={label} />
            <StatusBadge id={'ve-items-15-' + collectionIndex} data-oods-component="StatusBadge" tone="lifecycle" status={status} />
            <RelativeTimestamp id={'ve-items-16-' + collectionIndex} data-oods-component="RelativeTimestamp" datetime={updatedAt ?? createdAt} />
            <PriceBadge id={'ve-items-17-' + collectionIndex} data-oods-component="PriceBadge" amount={unitAmountCents} currency={currency} />
            <ClassificationBadge id={'ve-toolbar-actions-18-' + collectionIndex} data-oods-component="ClassificationBadge" mode="{classification_mode}" category={primaryCategoryId} /></Button></li>)}</ol>)}</section>
            <Stack id="list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                    <PaginationBar id="slot-pagination-8" page={collectionQuery.page ?? 1} pageSize={collectionQuery.pageSize ?? 10} totalItems={collectionQuery.total ?? rows.length} onPageChange={handlePageChange} />
                  </Stack>
          </Stack>
    </>
  );
};
