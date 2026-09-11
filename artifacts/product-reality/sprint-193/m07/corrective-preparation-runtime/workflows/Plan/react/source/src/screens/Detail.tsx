import React from 'react';
import { Banner, Card, OwnershipSummary, Stack, Tabs, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleDelete: () => void;
  handleEdit: () => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Identifiers for add-ons commonly sold with this plan. */
  addOnIds?: string[];
  /** Contract value expressed in minor currency units. */
  amountMinor: number;
  /** Day of month used to anchor renewals when prorating. */
  billingAnchorDay?: number;
  /** Billing cadence name selected from supportedIntervals. */
  billingInterval: string;
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
  ownerType: string;
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
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type OwnershipSummaryProps = React.ComponentPropsWithoutRef<typeof OwnershipSummary>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, addOnIds, amountMinor, billingAnchorDay, billingInterval, collectionMethod, consumedQuantity, currency, downgradeTargets, featureMatrix, includedQuantity, intervalCount, meterName, notes, overageRateMinor, ownerId, ownerType, ownershipRole, ownershipTransferredAt, periodEnd, periodStart, planCode, planId, planName, pricingModel, productFamily, projectedOverageMinor, rolloverStrategy, samples, status, trialPeriodDays, unitLabel, upgradeTargets }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }

  /* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };

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
                        <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                  <OwnershipSummary id="detail-slot-header-2" data-oods-component="OwnershipSummary" ownerId={ownerId} ownerType={ownerType} role={ownershipRole} />
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style={{ alignItems: 'start', display: 'grid', gap: 'var(--ref-space-cluster-default)', gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 24rem)' }}>
                                  <div data-sidebar-main>
                                    <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                      { ...{"id":"detail-detail-tab-panel-14","label":"Details"}, panel: (
                                        <Stack id="detail-detail-tab-panel-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                          <Text id="detail-slot-tab-3-15" data-oods-component="Text" label="Amount minor">{amountMinor}</Text>
                                        </Stack>
                                      ) }
                                    ]} />
                                  </div>
                                  <aside data-sidebar-aside>
                                    <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }} />
                                  </aside>
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleDelete" onClick={() => handleDelete()}>Archive</button>
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
        </div>
      </>
    </>
  );
};
