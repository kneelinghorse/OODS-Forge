<template>
  <Stack id="screen-list-9" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="list-toolbar-4" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <SearchInput id="slot-search-1" data-oods-component="SearchInput" label="The current search query string entered by the user." placeholder="Enter searchQuery" :modelValue="handleUpdate_searchQueryState" @update:modelValue="handleUpdate_searchQuery" />
            <FilterPanel id="slot-filters-2" data-oods-component="FilterPanel" :activeFilters="activeFilters" :filters="filters" />
            <Stack id="slot-toolbar-actions-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                    <PaginationBar id="ve-toolbar-actions-12" data-oods-component="PaginationBar" :page="page" :pageSize="pageSize" :totalItems="totalItems" :totalPages="totalPages" />
                    <ClassificationBadge id="ve-toolbar-actions-17" data-oods-component="ClassificationBadge" mode="{classification_mode}" :category="primaryCategoryId" />
                  </Stack>
          </Stack>
      <Stack id="list-items-5" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
            <Stack id="slot-items-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                    <LabelCell id="ve-items-10" data-oods-component="LabelCell" truncate :description="description" :label="label" />
                    <StatusBadge id="ve-items-14" data-oods-component="StatusBadge" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" tone="lifecycle" :status="status" />
                    <RelativeTimestamp id="ve-items-15" data-oods-component="RelativeTimestamp" label="Timestamp for the most recent modification, when available." :datetime="updatedAt ?? createdAt" />
                    <PriceBadge id="ve-items-16" data-oods-component="PriceBadge" :amount="unitAmountCents" :currency="currency" />
                  </Stack>
          </Stack>
      <Stack id="list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
            <PaginationBar id="slot-pagination-8" data-oods-component="PaginationBar" />
          </Stack>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-list-9">
    <button type="button" data-oods-action="handleFilter" @click="handleFilter({})">Filter</button>
    <button type="button" data-oods-action="handleRowClick" @click="handleRowClick(productId)">Open row</button>
    <button type="button" data-oods-action="handleSort" @click="handleSort('status')">Sort</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ClassificationBadge, FilterPanel, LabelCell, PaginationBar, PriceBadge, RelativeTimestamp, SearchInput, Stack, StatusBadge } from '@oods/components-vue';
import '@oods/component-styles/css';

interface GeneratedUIActions {
  /* @oods-domain-action handleFilter sha256:16ab1e92d1fca94435e207207864ab7015dc274fc62e2f211a0df55cc291ea36 */
  /* @oods-domain-source sha256:8e5f3caefc9ad5e749948c77de5f5978bb91ef33958f95a5a2be4b419cff400e */
  handleFilter: (criteria: Record<string, unknown>) => void;
  /* @oods-domain-action handleRowClick sha256:773eb5947f10b9c469abd54e200f61529df89035100d7d19eaa88adcd565efc0 */
  /* @oods-domain-source sha256:2691a39947329776a84396671cd57ad501e6855e24bc09bfe575a98e1fde4a88 */
  handleRowClick: (rowId: string) => void;
  /* @oods-domain-action handleSort sha256:757d6df84825c12c0f0cf60e76596eb7c5d0f48a6a4d4cf4186ee36063811b44 */
  /* @oods-domain-source sha256:a44f6b01c1934ac2bd84da820758bea74479e3a4ec56f169390a3d3eeaf34649 */
  handleSort: (column: string) => void;
}

interface Props {
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

const { actions, activeFilters, allowedTransitions, billingInterval, categories, classificationMetadata, createdAt, currency, description, filterCount, filters, inventoryStatus, label, lastEvent, lastEventAt, page, pageSize, placeholder, pricingModel, primaryCategoryId, primaryCategoryPath, productId, releaseChannel, requiresSubscription, searchActive, searchQuery, sku, stateHistory, status, summaryBlurb, supportLevel, tagCount, tagPreview, tags, taxBehavior, totalItems, totalPages, unitAmountCents, updatedAt } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

/* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
/* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
/* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };
const handleUpdate_searchQueryState = ref<string>(String(searchQuery ?? ''));
const setHandleUpdate_searchQueryState = (value: string) => { handleUpdate_searchQueryState.value = value; };
/* @oods-local-binding handleUpdate_searchQuery */ const handleUpdate_searchQuery = (value: string) => { setHandleUpdate_searchQueryState(value); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
