import React from 'react';
import { Banner, Button, OwnerBadge, PaginationBar, SearchInput, Select, Stack, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

export interface PageProps {
  rows?: Array<{ planCode: string; planName: string; billingInterval: 'monthly' | 'quarterly' | 'annual'; intervalCount?: number; amountMinor: number; currency: string; trialPeriodDays?: number; collectionMethod?: string; billingAnchorDay?: number; pricingModel?: string; meterName: string; includedQuantity: number; consumedQuantity: number; unitLabel: string; periodStart: string; periodEnd: string; rolloverStrategy?: string; overageRateMinor?: number; projectedOverageMinor?: number; samples?: unknown[]; ownerId: string; ownerType: 'organization' | 'team' | 'user'; ownershipRole?: string; ownershipTransferredAt?: string; planId: string; productFamily: string; status: 'active' | 'deprecated' | 'private_beta' | 'legacy'; featureMatrix?: unknown[]; addOnIds?: string[]; upgradeTargets?: string[]; downgradeTargets?: string[]; notes?: string }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Identifiers for add-ons commonly sold with this plan. */
  addOnIds?: string[];
  /** Contract value expressed in minor currency units. */
  amountMinor: number;
  /** Day of month used to anchor renewals when prorating. */
  billingAnchorDay?: number;
  /** Billing cadence name selected from supportedIntervals. */
  billingInterval: 'monthly' | 'quarterly' | 'annual';
  /** How billing is collected (charge_automatically, send_invoice). */
  collectionMethod?: string;
  /** Actual quantity consumed in the active period. */
  consumedQuantity: number;
  /** ISO 4217 currency for the plan price. */
  currency: string;
  /** Plans that can be downgraded to from this plan. */
  downgradeTargets?: string[];
  /** Array of feature descriptors listing entitlement tiers. */
  featureMatrix?: unknown[];
  /** Quantity included in base plan before overages. */
  includedQuantity: number;
  /** Multiplier for interval (ex: 12 with monthly => yearly cadence). */
  intervalCount?: number;
  /** Friendly metered feature name shown in UI (ex: Analytics Seats). */
  meterName: string;
  /** Internal commentary for packaging or finance teams. */
  notes?: string;
  /** Cost per additional unit expressed in minor currency units. */
  overageRateMinor?: number;
  /** Identifier of the owning principal scoped by owner_type. */
  ownerId: string;
  /** Categorical owner type sourced from the ownerTypes parameter. */
  ownerType: 'organization' | 'team' | 'user';
  /** Optional role name describing how the owner governs the entity. */
  ownershipRole?: string;
  /** Timestamp recording when ownership was last transferred. */
  ownershipTransferredAt?: string;
  /** Date the usage accumulation window ends. */
  periodEnd: string;
  /** Date the usage accumulation window began. */
  periodStart: string;
  /** Provider specific identifier for the plan or price. */
  planCode: string;
  /** Stable identifier for the plan within the billing domain. */
  planId: string;
  /** Human readable plan label rendered in list and detail contexts. */
  planName: string;
  /** Price strategy (flat, per_unit, tiered, package). */
  pricingModel?: string;
  /** High level product family grouping for analytics and reporting. */
  productFamily: string;
  /** Forecasted overage spend derived from consumption trends. */
  projectedOverageMinor?: number;
  /** Strategy for unused units (inherits rolloverStrategy parameter). */
  rolloverStrategy?: string;
  /** Rolling usage measurements for charts or anomaly detection. */
  samples?: unknown[];
  /** Availability state of the plan (active, deprecated, private_beta). */
  status: 'active' | 'deprecated' | 'private_beta' | 'legacy';
  /** Length of introductory trial period in days. */
  trialPeriodDays?: number;
  /** Label for display, defaults to the unit parameter. */
  unitLabel: string;
  /** Plans presented as upgrade destinations. */
  upgradeTargets?: string[];
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type OwnerBadgeProps = React.ComponentPropsWithoutRef<typeof OwnerBadge>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, addOnIds, amountMinor, billingAnchorDay, billingInterval, collectionMethod, consumedQuantity, currency, downgradeTargets, featureMatrix, includedQuantity, intervalCount, meterName, notes, overageRateMinor, ownerId, ownerType, ownershipRole, ownershipTransferredAt, periodEnd, periodStart, planCode, planId, planName, pricingModel, productFamily, projectedOverageMinor, rolloverStrategy, samples, status, trialPeriodDays, unitLabel, upgradeTargets, rows = [], collectionQuery = {} }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handlePageChange') || typeof actions.handlePageChange !== 'function') { throw new Error('GeneratedUI requires actions.handlePageChange.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

  /* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
  /* @oods-domain-binding handlePageChange */ const handlePageChange = (page: number) => { actions.handlePageChange(page); };
  /* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
  /* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };

  return (
    <>
      <Stack id="list-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="list-screen-list-9-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="list-screen-list-9-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="list-screen-list-9-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {(uiState === 'success' || uiState === 'empty') && (
              <Stack id="list-screen-list-9-success" data-oods-component="Stack" data-oods-state={uiState === 'success' ? 'success' : undefined} data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="list-list-toolbar-4" data-oods-component="Stack" data-oods-collection-toolbar="true" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                <SearchInput id="list-slot-search-1" label="Search" placeholder="Search records" value={collectionQuery.search ?? ''} clearable={true} onValueChange={(search) => handleFilter({ ...collectionQuery, search })} />
                                <Select id="list-slot-filters-2" label="Status" value={collectionQuery.status ?? ''} options={[{'value': '', 'label': 'All states'}, {'value': 'active', 'label': 'active'}, {'value': 'deprecated', 'label': 'deprecated'}, {'value': 'private_beta', 'label': 'private beta'}, {'value': 'legacy', 'label': 'legacy'}]} onChange={(event) => handleFilter({ ...collectionQuery, status: event.currentTarget.value })} />
                                <Select id="list-list-toolbar-4-sort" label="Sort" value={collectionQuery.descending ? 'desc' : 'asc'} options={[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]} onChange={() => handleSort('plan_name')} />
                              </Stack>
                      <section id="list-list-items-5" data-oods-collection="rows">{rows.length === 0 ? (<Banner id="list-list-items-5-empty" data-oods-component="Banner" content="No records found." />) : (<ol aria-label="Records" className="oods-collection">{rows.map(({ planCode, planName, billingInterval, intervalCount, amountMinor, currency, trialPeriodDays, collectionMethod, billingAnchorDay, pricingModel, meterName, includedQuantity, consumedQuantity, unitLabel, periodStart, periodEnd, rolloverStrategy, overageRateMinor, projectedOverageMinor, samples, ownerId, ownerType, ownershipRole, ownershipTransferredAt, planId, productFamily, status, featureMatrix, addOnIds, upgradeTargets, downgradeTargets, notes }, collectionIndex) => <li key={String(planId)}><Button id={'list-list-items-5-row-' + collectionIndex} type="button" className="oods-collection-row" data-record-id={String(planId)} onClick={() => handleRowClick(String(planId))}><Text id={'list-list-items-5-title-' + collectionIndex} data-oods-component="Text">{planName}</Text>
                      <OwnerBadge id={'list-slot-items-6-' + collectionIndex} data-oods-component="OwnerBadge" owner={ownerId} ownerType={ownerType} /></Button></li>)}</ol>)}</section>
                      <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                                <PaginationBar id="list-slot-pagination-8" page={collectionQuery.page ?? 1} pageSize={collectionQuery.pageSize ?? 10} totalItems={collectionQuery.total ?? rows.length} onPageChange={handlePageChange} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
