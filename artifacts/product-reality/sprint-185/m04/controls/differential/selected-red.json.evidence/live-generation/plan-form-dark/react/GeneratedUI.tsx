import React from 'react';
import { Button, DatePicker, DetailHeader, Input, Stack, Textarea } from '@oods/components-react';
import '@oods/component-styles/css';

export interface GeneratedUIActions {
  /* @oods-domain-action handleChange sha256:a6655fe6811e486ed9442d62daf80a120c750f9545ebb50e6abc5c56b00e1efe */
  /* @oods-domain-source sha256:67d1eed6aa63390c7d8ab52e2865d84e1ce02911ca7e8f2e880199ad0fe619b9 */
  handleChange: () => void;
  /* @oods-domain-action handleSubmit sha256:3905bf2a10198af089abe0b0add2281f7202e19b7517e4263bac16fe29f2bdc7 */
  /* @oods-domain-source sha256:5fcc4ca3a861efa274c207e94029e264ff925add79793b48feb0f94f0945f01e */
  handleSubmit: () => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
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

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type DatePickerProps = React.ComponentPropsWithoutRef<typeof DatePicker>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TextareaProps = React.ComponentPropsWithoutRef<typeof Textarea>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, addOnIds, amountMinor, billingAnchorDay, billingInterval, collectionMethod, consumedQuantity, currency, downgradeTargets, featureMatrix, includedQuantity, intervalCount, meterName, notes, overageRateMinor, ownerId, ownerType, ownershipRole, ownershipTransferredAt, periodEnd, periodStart, planCode, planId, planName, pricingModel, productFamily, projectedOverageMinor, rolloverStrategy, samples, status, trialPeriodDays, unitLabel, upgradeTargets }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange') || typeof actions.handleChange !== 'function') { throw new Error('GeneratedUI requires actions.handleChange.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  /* @oods-domain-binding handleChange */ const handleChange = () => { actions.handleChange(); };
  const [handleChange_amount_minorState, setHandleChange_amount_minorState] = React.useState<string>(String(amountMinor ?? ''));
  /* @oods-local-binding handleChange_amount_minor */ const handleChange_amount_minor = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_amount_minorState(event.currentTarget.value); };
  const [handleChange_billing_intervalState, setHandleChange_billing_intervalState] = React.useState<string>(String(billingInterval ?? ''));
  /* @oods-local-binding handleChange_billing_interval */ const handleChange_billing_interval = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_billing_intervalState(event.currentTarget.value); };
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
  /* @oods-local-binding handleChange_plan_name */ const handleChange_plan_name = (event: React.ChangeEvent<HTMLTextAreaElement>) => { setHandleChange_plan_nameState(event.currentTarget.value); };
  const [handleChange_trial_period_daysState, setHandleChange_trial_period_daysState] = React.useState<string>(String(trialPeriodDays ?? ''));
  /* @oods-local-binding handleChange_trial_period_days */ const handleChange_trial_period_days = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_trial_period_daysState(event.currentTarget.value); };
  /* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };

  return (
    <>
      <>
        <Stack id="screen-form-9" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)', padding: 'var(--ref-space-inset-default)' }}>
              <DetailHeader id="form-title-1" data-oods-component="DetailHeader" as="h1" label="Human readable plan label rendered in list and detail contexts.">{handleChange_plan_nameState}</DetailHeader>
              <Stack id="form-fields-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Textarea id="slot-field-0-3" data-oods-component="Textarea" label="Field 0" value={handleChange_plan_nameState} onChange={handleChange_plan_name} />
                              </Stack>
                      <Stack id="form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-1-5" data-oods-component="Input" label="Multiplier for interval (ex: 12 with monthly =&gt; yearly cadence)." placeholder="Enter interval count" type="number" value={handleChange_interval_countState} onChange={handleChange_interval_count} />
                              </Stack>
                      <Stack id="form-field-group-10" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-2-11" data-oods-component="Input" label="ISO 4217 currency for the plan price." placeholder="Enter currency" required value={handleChange_currencyState} onChange={handleChange_currency} />
                              </Stack>
                      <Stack id="form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <DatePicker id="slot-field-3-13" data-oods-component="DatePicker" label="Field 3" value={handleChange_period_startState} onChange={handleChange_period_start} />
                              </Stack>
                      <Stack id="form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-4-15" data-oods-component="Input" label="Optional role name describing how the owner governs the entity." placeholder="Enter ownership role" value={handleChange_ownership_roleState} onChange={handleChange_ownership_role} />
                              </Stack>
                      <Stack id="form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-5-17" data-oods-component="Input" label="Friendly metered feature name shown in UI (ex: Analytics Seats)." placeholder="Enter meter name" required value={handleChange_meter_nameState} onChange={handleChange_meter_name} />
                              </Stack>
                      <Stack id="form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-6-19" data-oods-component="Input" label="Provider specific identifier for the plan or price." placeholder="Enter plan code" required value={handleChange_plan_codeState} onChange={handleChange_plan_code} />
                              </Stack>
                      <Stack id="form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-7-21" data-oods-component="Input" label="Billing cadence name selected from supportedIntervals." placeholder="Enter billing interval" required value={handleChange_billing_intervalState} onChange={handleChange_billing_interval} />
                              </Stack>
                      <Stack id="form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-8-23" data-oods-component="Input" label="Contract value expressed in minor currency units." placeholder="Enter amount minor" required type="number" value={handleChange_amount_minorState} onChange={handleChange_amount_minor} />
                              </Stack>
                      <Stack id="form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-9-25" data-oods-component="Input" label="Length of introductory trial period in days." placeholder="Enter trial period days" type="number" value={handleChange_trial_period_daysState} onChange={handleChange_trial_period_days} />
                              </Stack>
                    </Stack>
              <Stack id="form-actions-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 'var(--ref-space-inset-default)' }}>
                      <Button id="slot-actions-8" data-oods-component="Button" />
                    </Stack>
            </Stack>
        <div role="group" aria-label="Sprint 185 mutation screen actions" data-oods-screen-actions="screen-form-9">
          <button type="button" data-oods-action="handleChange" onClick={() => handleChange()}>Change</button>
          <button type="button" data-oods-action="handleSubmit" onClick={() => handleSubmit()}>Submit</button>
        </div>
      </>
    </>
  );
};
