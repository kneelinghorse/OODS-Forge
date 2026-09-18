import React from 'react';
import { Banner, Button, DatePicker, Input, Select, Stack } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleSubmit: () => void;
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
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type DatePickerProps = React.ComponentPropsWithoutRef<typeof DatePicker>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, addOnIds, amountMinor, billingAnchorDay, billingInterval, collectionMethod, consumedQuantity, currency, downgradeTargets, featureMatrix, includedQuantity, intervalCount, meterName, notes, overageRateMinor, ownerId, ownerType, ownershipRole, ownershipTransferredAt, periodEnd, periodStart, planCode, planId, planName, pricingModel, productFamily, projectedOverageMinor, rolloverStrategy, samples, status, trialPeriodDays, unitLabel, upgradeTargets }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  const [handleChange_amount_minorState, setHandleChange_amount_minorState] = React.useState<string>(String(amountMinor ?? ''));
  /* @oods-local-binding handleChange_amount_minor */ const handleChange_amount_minor = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_amount_minorState(event.currentTarget.value); };
  const [handleChange_billing_intervalState, setHandleChange_billing_intervalState] = React.useState<string>(String(billingInterval ?? ''));
  /* @oods-local-binding handleChange_billing_interval */ const handleChange_billing_interval = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_billing_intervalState(event.currentTarget.value); };
  const [handleChange_currencyState, setHandleChange_currencyState] = React.useState<string>(String(currency ?? ''));
  /* @oods-local-binding handleChange_currency */ const handleChange_currency = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_currencyState(event.currentTarget.value); };
  const [handleChange_interval_countState, setHandleChange_interval_countState] = React.useState<string>(String(intervalCount ?? ''));
  /* @oods-local-binding handleChange_interval_count */ const handleChange_interval_count = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_interval_countState(event.currentTarget.value); };
  const [handleChange_meter_nameState, setHandleChange_meter_nameState] = React.useState<string>(String(meterName ?? ''));
  /* @oods-local-binding handleChange_meter_name */ const handleChange_meter_name = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_meter_nameState(event.currentTarget.value); };
  const [handleChange_ownership_roleState, setHandleChange_ownership_roleState] = React.useState<string>(String(ownershipRole ?? ''));
  /* @oods-local-binding handleChange_ownership_role */ const handleChange_ownership_role = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_ownership_roleState(event.currentTarget.value); };
  const [handleChange_period_startState, setHandleChange_period_startState] = React.useState<string>(String(periodStart ?? ''));
  /* @oods-local-binding handleChange_period_start */ const handleChange_period_start = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_period_startState(event.currentTarget.value); };
  const [handleChange_plan_codeState, setHandleChange_plan_codeState] = React.useState<string>(String(planCode ?? ''));
  /* @oods-local-binding handleChange_plan_code */ const handleChange_plan_code = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_plan_codeState(event.currentTarget.value); };
  const [handleChange_plan_nameState, setHandleChange_plan_nameState] = React.useState<string>(String(planName ?? ''));
  /* @oods-local-binding handleChange_plan_name */ const handleChange_plan_name = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_plan_nameState(event.currentTarget.value); };
  const [handleChange_trial_period_daysState, setHandleChange_trial_period_daysState] = React.useState<string>(String(trialPeriodDays ?? ''));
  /* @oods-local-binding handleChange_trial_period_days */ const handleChange_trial_period_days = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_trial_period_daysState(event.currentTarget.value); };
  /* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };

  return (
    <>
      <Stack id="form-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="form-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="form-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="form-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {uiState === 'success' && (
              <Stack id="form-screen-form-11" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)', padding: 'var(--ref-space-inset-default)' }}>
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-0-3" data-oods-component="Input" help="Human readable plan label rendered in list and detail contexts." label="Plan name" placeholder="Human readable plan label rendered in list and detail contexts." required value={handleChange_plan_nameState} onChange={handleChange_plan_name} />
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-1-5" data-oods-component="Input" help="Multiplier for interval (ex: 12 with monthly =&gt; yearly cadence)." label="Interval count" placeholder="Enter interval count" type="number" value={handleChange_interval_countState} onChange={handleChange_interval_count} />
                                          </Stack>
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-2-7" data-oods-component="Input" help="ISO 4217 currency for the plan price." label="Currency" placeholder="Enter currency" required value={handleChange_currencyState} onChange={handleChange_currency} />
                                          </Stack>
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <DatePicker id="form-slot-field-3-13" data-oods-component="DatePicker" help="Date the usage accumulation window began." label="Period start" value={handleChange_period_startState} onChange={handleChange_period_start} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-4-15" data-oods-component="Input" help="Optional role name describing how the owner governs the entity." label="Ownership role" placeholder="Enter ownership role" value={handleChange_ownership_roleState} onChange={handleChange_ownership_role} />
                                          </Stack>
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-5-17" data-oods-component="Input" help="Friendly metered feature name shown in UI (ex: Analytics Seats)." label="Meter name" placeholder="Enter meter name" required value={handleChange_meter_nameState} onChange={handleChange_meter_name} />
                                          </Stack>
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-6-19" data-oods-component="Input" help="Provider specific identifier for the plan or price." label="Plan code" placeholder="Enter plan code" required value={handleChange_plan_codeState} onChange={handleChange_plan_code} />
                                          </Stack>
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Select id="form-slot-field-7-21" data-oods-component="Select" help="Billing cadence name selected from supportedIntervals." label="Billing interval" options={[{"label":"Monthly","value":"monthly"},{"label":"Quarterly","value":"quarterly"},{"label":"Annual","value":"annual"}]} required value={handleChange_billing_intervalState} onChange={handleChange_billing_interval} />
                                          </Stack>
                                <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-8-23" data-oods-component="Input" help="Contract value expressed in minor currency units." label="Amount minor" placeholder="Enter amount minor" required type="number" value={handleChange_amount_minorState} onChange={handleChange_amount_minor} />
                                          </Stack>
                                <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-9-25" data-oods-component="Input" help="Length of introductory trial period in days." label="Trial period days" placeholder="Enter trial period days" type="number" value={handleChange_trial_period_daysState} onChange={handleChange_trial_period_days} />
                                          </Stack>
                              </Stack>
                      <Stack id="form-form-actions-9" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 'var(--ref-space-inset-default)' }}>
                                <Button id="form-form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
