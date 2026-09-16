<template>
  <Stack id="form-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="form-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="form-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="form-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="form-screen-form-11" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default); padding: var(--ref-space-inset-default)">
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-0-3" data-oods-component="Input" help="Human readable plan label rendered in list and detail contexts." label="Plan name" placeholder="Human readable plan label rendered in list and detail contexts." required :modelValue="handleChange_plan_nameState" @update:modelValue="setHandleChange_plan_nameState" @change="handleChange_plan_name" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-1-5" data-oods-component="Input" help="Multiplier for interval (ex: 12 with monthly =&gt; yearly cadence)." label="Interval count" placeholder="Enter interval count" type="number" :modelValue="handleChange_interval_countState" @update:modelValue="setHandleChange_interval_countState" @change="handleChange_interval_count" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="ISO 4217 currency for the plan price." label="Currency" placeholder="Enter currency" required :modelValue="handleChange_currencyState" @update:modelValue="setHandleChange_currencyState" @change="handleChange_currency" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <DatePicker id="form-slot-field-3-13" data-oods-component="DatePicker" help="Date the usage accumulation window began." label="Period start" :modelValue="handleChange_period_startState" @update:modelValue="setHandleChange_period_startState" @change="handleChange_period_start" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Optional role name describing how the owner governs the entity." label="Ownership role" placeholder="Enter ownership role" :modelValue="handleChange_ownership_roleState" @update:modelValue="setHandleChange_ownership_roleState" @change="handleChange_ownership_role" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Friendly metered feature name shown in UI (ex: Analytics Seats)." label="Meter name" placeholder="Enter meter name" required :modelValue="handleChange_meter_nameState" @update:modelValue="setHandleChange_meter_nameState" @change="handleChange_meter_name" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Provider specific identifier for the plan or price." label="Plan code" placeholder="Enter plan code" required :modelValue="handleChange_plan_codeState" @update:modelValue="setHandleChange_plan_codeState" @change="handleChange_plan_code" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-7-21" data-oods-component="Select" help="Billing cadence name selected from supportedIntervals." label="Billing interval" :options="[{'label':'Monthly','value':'monthly'},{'label':'Quarterly','value':'quarterly'},{'label':'Annual','value':'annual'}]" required :modelValue="handleChange_billing_intervalState" @update:modelValue="setHandleChange_billing_intervalState" @change="handleChange_billing_interval" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Contract value expressed in minor currency units." label="Amount minor" placeholder="Enter amount minor" required type="number" :modelValue="handleChange_amount_minorState" @update:modelValue="setHandleChange_amount_minorState" @change="handleChange_amount_minor" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Length of introductory trial period in days." label="Trial period days" placeholder="Enter trial period days" type="number" :modelValue="handleChange_trial_period_daysState" @update:modelValue="setHandleChange_trial_period_daysState" @change="handleChange_trial_period_days" />
                              </Stack>
                    </Stack>
              <Stack id="form-form-actions-9" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: flex-end; padding: var(--ref-space-inset-default)">
                      <Button id="form-form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Banner, Button, DatePicker, Input, Select, Stack } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  addOnIds?: string[];
  amountMinor?: number;
  billingAnchorDay?: number;
  billingInterval?: 'monthly' | 'quarterly' | 'annual';
  collectionMethod?: string;
  consumedQuantity?: number;
  currency?: string;
  downgradeTargets?: string[];
  featureMatrix?: unknown[];
  includedQuantity?: number;
  intervalCount?: number;
  meterName?: string;
  notes?: string;
  overageRateMinor?: number;
  ownerId?: string;
  ownerType?: 'organization' | 'team' | 'user';
  ownershipRole?: string;
  ownershipTransferredAt?: string;
  periodEnd?: string;
  periodStart?: string;
  planCode?: string;
  planId?: string;
  planName?: string;
  pricingModel?: string;
  productFamily?: string;
  projectedOverageMinor?: number;
  rolloverStrategy?: string;
  samples?: unknown[];
  status?: 'active' | 'deprecated' | 'private_beta' | 'legacy';
  trialPeriodDays?: number;
  unitLabel?: string;
  upgradeTargets?: string[];
}
const generatedProps = defineProps<Props>();
const actions = generatedProps.actions;
const uiState = generatedProps.uiState;
/** Identifiers for add-ons commonly sold with this plan. */
const addOnIds = ref<string[]>(generatedProps.addOnIds ?? []);
/** Contract value expressed in minor currency units. */
const amountMinor = ref<number>(generatedProps.amountMinor ?? 0);
/** Day of month used to anchor renewals when prorating. */
const billingAnchorDay = ref<number>(generatedProps.billingAnchorDay ?? 0);
/** Billing cadence name selected from supportedIntervals. */
const billingInterval = ref<'monthly' | 'quarterly' | 'annual'>(generatedProps.billingInterval ?? 'monthly');
/** How billing is collected (charge_automatically, send_invoice). */
const collectionMethod = ref<string>(generatedProps.collectionMethod ?? '');
/** Actual quantity consumed in the active period. */
const consumedQuantity = ref<number>(generatedProps.consumedQuantity ?? 0);
/** ISO 4217 currency for the plan price. */
const currency = ref<string>(generatedProps.currency ?? '');
/** Plans that can be downgraded to from this plan. */
const downgradeTargets = ref<string[]>(generatedProps.downgradeTargets ?? []);
/** Array of feature descriptors listing entitlement tiers. */
const featureMatrix = ref<unknown[]>(generatedProps.featureMatrix ?? []);
/** Quantity included in base plan before overages. */
const includedQuantity = ref<number>(generatedProps.includedQuantity ?? 0);
/** Multiplier for interval (ex: 12 with monthly => yearly cadence). */
const intervalCount = ref<number>(generatedProps.intervalCount ?? 0);
/** Friendly metered feature name shown in UI (ex: Analytics Seats). */
const meterName = ref<string>(generatedProps.meterName ?? '');
/** Internal commentary for packaging or finance teams. */
const notes = ref<string>(generatedProps.notes ?? '');
/** Cost per additional unit expressed in minor currency units. */
const overageRateMinor = ref<number>(generatedProps.overageRateMinor ?? 0);
/** Identifier of the owning principal scoped by owner_type. */
const ownerId = ref<string>(generatedProps.ownerId ?? '');
/** Categorical owner type sourced from the ownerTypes parameter. */
const ownerType = ref<'organization' | 'team' | 'user'>(generatedProps.ownerType ?? 'organization');
/** Optional role name describing how the owner governs the entity. */
const ownershipRole = ref<string>(generatedProps.ownershipRole ?? '');
/** Timestamp recording when ownership was last transferred. */
const ownershipTransferredAt = ref<string>(generatedProps.ownershipTransferredAt ?? '');
/** Date the usage accumulation window ends. */
const periodEnd = ref<string>(generatedProps.periodEnd ?? '');
/** Date the usage accumulation window began. */
const periodStart = ref<string>(generatedProps.periodStart ?? '');
/** Provider specific identifier for the plan or price. */
const planCode = ref<string>(generatedProps.planCode ?? '');
/** Stable identifier for the plan within the billing domain. */
const planId = ref<string>(generatedProps.planId ?? '');
/** Human readable plan label rendered in list and detail contexts. */
const planName = ref<string>(generatedProps.planName ?? '');
/** Price strategy (flat, per_unit, tiered, package). */
const pricingModel = ref<string>(generatedProps.pricingModel ?? '');
/** High level product family grouping for analytics and reporting. */
const productFamily = ref<string>(generatedProps.productFamily ?? '');
/** Forecasted overage spend derived from consumption trends. */
const projectedOverageMinor = ref<number>(generatedProps.projectedOverageMinor ?? 0);
/** Strategy for unused units (inherits rolloverStrategy parameter). */
const rolloverStrategy = ref<string>(generatedProps.rolloverStrategy ?? '');
/** Rolling usage measurements for charts or anomaly detection. */
const samples = ref<unknown[]>(generatedProps.samples ?? []);
/** Availability state of the plan (active, deprecated, private_beta). */
const status = ref<'active' | 'deprecated' | 'private_beta' | 'legacy'>(generatedProps.status ?? 'active');
/** Length of introductory trial period in days. */
const trialPeriodDays = ref<number>(generatedProps.trialPeriodDays ?? 0);
/** Label for display, defaults to the unit parameter. */
const unitLabel = ref<string>(generatedProps.unitLabel ?? '');
/** Plans presented as upgrade destinations. */
const upgradeTargets = ref<string[]>(generatedProps.upgradeTargets ?? []);

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_amount_minorState = ref<string>(String(amountMinor.value ?? ''));
const setHandleChange_amount_minorState = (value: string) => { handleChange_amount_minorState.value = value; };
/* @oods-local-binding handleChange_amount_minor */ const handleChange_amount_minor = (value: string) => { setHandleChange_amount_minorState(value); };
const handleChange_billing_intervalState = ref<string>(String(billingInterval.value ?? ''));
const setHandleChange_billing_intervalState = (value: string) => { handleChange_billing_intervalState.value = value; };
/* @oods-local-binding handleChange_billing_interval */ const handleChange_billing_interval = (value: string) => { setHandleChange_billing_intervalState(value); };
const handleChange_currencyState = ref<string>(String(currency.value ?? ''));
const setHandleChange_currencyState = (value: string) => { handleChange_currencyState.value = value; };
/* @oods-local-binding handleChange_currency */ const handleChange_currency = (value: string) => { setHandleChange_currencyState(value); };
const handleChange_interval_countState = ref<string>(String(intervalCount.value ?? ''));
const setHandleChange_interval_countState = (value: string) => { handleChange_interval_countState.value = value; };
/* @oods-local-binding handleChange_interval_count */ const handleChange_interval_count = (value: string) => { setHandleChange_interval_countState(value); };
const handleChange_meter_nameState = ref<string>(String(meterName.value ?? ''));
const setHandleChange_meter_nameState = (value: string) => { handleChange_meter_nameState.value = value; };
/* @oods-local-binding handleChange_meter_name */ const handleChange_meter_name = (value: string) => { setHandleChange_meter_nameState(value); };
const handleChange_ownership_roleState = ref<string>(String(ownershipRole.value ?? ''));
const setHandleChange_ownership_roleState = (value: string) => { handleChange_ownership_roleState.value = value; };
/* @oods-local-binding handleChange_ownership_role */ const handleChange_ownership_role = (value: string) => { setHandleChange_ownership_roleState(value); };
const handleChange_period_startState = ref<string>(String(periodStart.value ?? ''));
const setHandleChange_period_startState = (value: string) => { handleChange_period_startState.value = value; };
/* @oods-local-binding handleChange_period_start */ const handleChange_period_start = (value: string) => { setHandleChange_period_startState(value); };
const handleChange_plan_codeState = ref<string>(String(planCode.value ?? ''));
const setHandleChange_plan_codeState = (value: string) => { handleChange_plan_codeState.value = value; };
/* @oods-local-binding handleChange_plan_code */ const handleChange_plan_code = (value: string) => { setHandleChange_plan_codeState(value); };
const handleChange_plan_nameState = ref<string>(String(planName.value ?? ''));
const setHandleChange_plan_nameState = (value: string) => { handleChange_plan_nameState.value = value; };
/* @oods-local-binding handleChange_plan_name */ const handleChange_plan_name = (value: string) => { setHandleChange_plan_nameState(value); };
const handleChange_trial_period_daysState = ref<string>(String(trialPeriodDays.value ?? ''));
const setHandleChange_trial_period_daysState = (value: string) => { handleChange_trial_period_daysState.value = value; };
/* @oods-local-binding handleChange_trial_period_days */ const handleChange_trial_period_days = (value: string) => { setHandleChange_trial_period_daysState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
