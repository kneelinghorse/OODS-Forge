import React from 'react';
import { Banner, BillingSummaryBadge, Card, DetailHeader, OwnershipSummary, Stack, Tabs, Text } from '@oods/components-react';
import '@oods/component-styles/css';
import { formatReadOnlyValue } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
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
type BillingSummaryBadgeProps = React.ComponentPropsWithoutRef<typeof BillingSummaryBadge>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type OwnershipSummaryProps = React.ComponentPropsWithoutRef<typeof OwnershipSummary>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, addOnIds, amountMinor, billingAnchorDay, billingInterval, collectionMethod, consumedQuantity, currency, downgradeTargets, featureMatrix, includedQuantity, intervalCount, meterName, notes, overageRateMinor, ownerId, ownerType, ownershipRole, ownershipTransferredAt, periodEnd, periodStart, planCode, planId, planName, pricingModel, productFamily, projectedOverageMinor, rolloverStrategy, samples, status, trialPeriodDays, unitLabel, upgradeTargets }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }

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
                        <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style={{ alignItems: 'space-between', display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-stack-default)', padding: 'var(--ref-space-inset-default)' }}>
                                  <DetailHeader id="detail-detail-header-1-record-title" data-oods-component="DetailHeader" title={planName} level={2} />
                                  <OwnershipSummary id="detail-slot-header-2" data-oods-component="OwnershipSummary" ownerId={ownerId} ownerType={ownerType} role={ownershipRole} />
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                  <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                    { ...{"id":"detail-detail-tabs-9-read-fields","label":"Details"}, panel: (
                                      <Stack id="detail-detail-tabs-9-read-fields" data-oods-component="Stack">
                                        <Stack id="detail-detail-tabs-9-plan_code-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-plan_code-label" data-oods-component="Text" as="strong" content="Plan code" />
                                            <Text id="detail-detail-tabs-9-plan_code-value" data-oods-component="Text">{formatReadOnlyValue(planCode, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-overage_rate_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-overage_rate_minor-label" data-oods-component="Text" as="strong" content="Overage rate" />
                                            <BillingSummaryBadge id="detail-detail-tabs-9-overage_rate_minor-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={overageRateMinor} currency={currency} />
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-projected_overage_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-projected_overage_minor-label" data-oods-component="Text" as="strong" content="Projected overage" />
                                            <BillingSummaryBadge id="detail-detail-tabs-9-projected_overage_minor-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={projectedOverageMinor} currency={currency} />
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-plan_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-plan_id-label" data-oods-component="Text" as="strong" content="Plan id" />
                                            <Text id="detail-detail-tabs-9-plan_id-value" data-oods-component="Text">{formatReadOnlyValue(planId, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-product_family-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-product_family-label" data-oods-component="Text" as="strong" content="Product family" />
                                            <Text id="detail-detail-tabs-9-product_family-value" data-oods-component="Text">{formatReadOnlyValue(productFamily, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-status-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-status-label" data-oods-component="Text" as="strong" content="Status" />
                                            <Text id="detail-detail-tabs-9-status-value" data-oods-component="Text">{formatReadOnlyValue(status, "string", true)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-notes-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-notes-label" data-oods-component="Text" as="strong" content="Notes" />
                                            <Text id="detail-detail-tabs-9-notes-value" data-oods-component="Text">{formatReadOnlyValue(notes, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-slot-tab-3-15-read-field" data-oods-component="Stack">
                                            <Text id="detail-slot-tab-3-15-label" data-oods-component="Text" as="strong" content="Amount" />
                                            <BillingSummaryBadge id="detail-slot-tab-3-15-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={amountMinor} currency={currency} />
                                          </Stack>
                                      </Stack>
                                    ) }
                                  ]} />
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
        </div>
      </>
    </>
  );
};
