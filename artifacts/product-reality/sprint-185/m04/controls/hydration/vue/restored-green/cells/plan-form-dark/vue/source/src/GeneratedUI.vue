<template>
  <Stack id="screen-form-9" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default); padding: var(--ref-space-inset-default)">
      <DetailHeader id="form-title-1" data-oods-component="DetailHeader" as="h1" label="Human readable plan label rendered in list and detail contexts.">{{ handleChange_plan_nameState }}</DetailHeader>
      <Stack id="form-fields-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
            <Stack id="form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Textarea id="slot-field-0-3" data-oods-component="Textarea" label="Field 0" :modelValue="handleChange_plan_nameState" @update:modelValue="setHandleChange_plan_nameState" @change="handleChange_plan_name" />
                  </Stack>
            <Stack id="form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-1-5" data-oods-component="Input" label="Multiplier for interval (ex: 12 with monthly =&gt; yearly cadence)." placeholder="Enter interval count" type="number" :modelValue="handleChange_interval_countState" @update:modelValue="setHandleChange_interval_countState" @change="handleChange_interval_count" />
                  </Stack>
            <Stack id="form-field-group-10" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-2-11" data-oods-component="Input" label="ISO 4217 currency for the plan price." placeholder="Enter currency" required :modelValue="handleChange_currencyState" @update:modelValue="setHandleChange_currencyState" @change="handleChange_currency" />
                  </Stack>
            <Stack id="form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <DatePicker id="slot-field-3-13" data-oods-component="DatePicker" label="Field 3" :modelValue="handleChange_period_startState" @update:modelValue="setHandleChange_period_startState" @change="handleChange_period_start" />
                  </Stack>
            <Stack id="form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-4-15" data-oods-component="Input" label="Optional role name describing how the owner governs the entity." placeholder="Enter ownership role" :modelValue="handleChange_ownership_roleState" @update:modelValue="setHandleChange_ownership_roleState" @change="handleChange_ownership_role" />
                  </Stack>
            <Stack id="form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-5-17" data-oods-component="Input" label="Friendly metered feature name shown in UI (ex: Analytics Seats)." placeholder="Enter meter name" required :modelValue="handleChange_meter_nameState" @update:modelValue="setHandleChange_meter_nameState" @change="handleChange_meter_name" />
                  </Stack>
            <Stack id="form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-6-19" data-oods-component="Input" label="Provider specific identifier for the plan or price." placeholder="Enter plan code" required :modelValue="handleChange_plan_codeState" @update:modelValue="setHandleChange_plan_codeState" @change="handleChange_plan_code" />
                  </Stack>
            <Stack id="form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-7-21" data-oods-component="Input" label="Billing cadence name selected from supportedIntervals." placeholder="Enter billing interval" required :modelValue="handleChange_billing_intervalState" @update:modelValue="setHandleChange_billing_intervalState" @change="handleChange_billing_interval" />
                  </Stack>
            <Stack id="form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-8-23" data-oods-component="Input" label="Contract value expressed in minor currency units." placeholder="Enter amount minor" required type="number" :modelValue="handleChange_amount_minorState" @update:modelValue="setHandleChange_amount_minorState" @change="handleChange_amount_minor" />
                  </Stack>
            <Stack id="form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-9-25" data-oods-component="Input" label="Length of introductory trial period in days." placeholder="Enter trial period days" type="number" :modelValue="handleChange_trial_period_daysState" @update:modelValue="setHandleChange_trial_period_daysState" @change="handleChange_trial_period_days" />
                  </Stack>
          </Stack>
      <Stack id="form-actions-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: flex-end; padding: var(--ref-space-inset-default)">
            <Button id="slot-actions-8" data-oods-component="Button" />
          </Stack>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-form-9">
    <button type="button" data-oods-action="handleChange" @click="handleChange()">Change</button>
    <button type="button" data-oods-action="handleSubmit" @click="handleSubmit()">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, DatePicker, DetailHeader, Input, Stack, Textarea } from '@oods/components-vue';
import '@oods/component-styles/css';

interface GeneratedUIActions {
  /* @oods-domain-action handleChange sha256:a6655fe6811e486ed9442d62daf80a120c750f9545ebb50e6abc5c56b00e1efe */
  /* @oods-domain-source sha256:67d1eed6aa63390c7d8ab52e2865d84e1ce02911ca7e8f2e880199ad0fe619b9 */
  handleChange: () => void;
  /* @oods-domain-action handleSubmit sha256:3905bf2a10198af089abe0b0add2281f7202e19b7517e4263bac16fe29f2bdc7 */
  /* @oods-domain-source sha256:5fcc4ca3a861efa274c207e94029e264ff925add79793b48feb0f94f0945f01e */
  handleSubmit: () => void;
}

/** Identifiers for add-ons commonly sold with this plan. */
const addOnIds = ref<string[]>([]);
/** Contract value expressed in minor currency units. */
const amountMinor = ref<number>(0);
/** Day of month used to anchor renewals when prorating. */
const billingAnchorDay = ref<number>(0);
/** Billing cadence name selected from supportedIntervals. */
const billingInterval = ref<string>('');
/** How billing is collected (charge_automatically, send_invoice). */
const collectionMethod = ref<string>('');
/** Actual quantity consumed in the active period. */
const consumedQuantity = ref<number>(0);
/** ISO 4217 currency for the plan price. */
const currency = ref<string>('');
/** Plans that can be downgraded to from this plan. */
const downgradeTargets = ref<string[]>([]);
/** Array of feature descriptors listing entitlement tiers. */
const featureMatrix = ref<unknown[]>([]);
/** Quantity included in base plan before overages. */
const includedQuantity = ref<number>(0);
/** Multiplier for interval (ex: 12 with monthly => yearly cadence). */
const intervalCount = ref<number>(0);
/** Friendly metered feature name shown in UI (ex: Analytics Seats). */
const meterName = ref<string>('');
/** Internal commentary for packaging or finance teams. */
const notes = ref<string>('');
/** Cost per additional unit expressed in minor currency units. */
const overageRateMinor = ref<number>(0);
/** Identifier of the owning principal scoped by owner_type. */
const ownerId = ref<string>('');
/** Categorical owner type sourced from the ownerTypes parameter. */
const ownerType = ref<string>('');
/** Optional role name describing how the owner governs the entity. */
const ownershipRole = ref<string>('');
/** Timestamp recording when ownership was last transferred. */
const ownershipTransferredAt = ref<string>('');
/** Date the usage accumulation window ends. */
const periodEnd = ref<string>('');
/** Date the usage accumulation window began. */
const periodStart = ref<string>('');
/** Provider specific identifier for the plan or price. */
const planCode = ref<string>('');
/** Stable identifier for the plan within the billing domain. */
const planId = ref<string>('');
/** Human readable plan label rendered in list and detail contexts. */
const planName = ref<string>('');
/** Price strategy (flat, per_unit, tiered, package). */
const pricingModel = ref<string>('');
/** High level product family grouping for analytics and reporting. */
const productFamily = ref<string>('');
/** Forecasted overage spend derived from consumption trends. */
const projectedOverageMinor = ref<number>(0);
/** Strategy for unused units (inherits rolloverStrategy parameter). */
const rolloverStrategy = ref<string>('');
/** Rolling usage measurements for charts or anomaly detection. */
const samples = ref<unknown[]>([]);
/** Availability state of the plan (active, deprecated, private_beta). */
const status = ref<'active' | 'deprecated' | 'private_beta' | 'legacy'>('active');
/** Length of introductory trial period in days. */
const trialPeriodDays = ref<number>(0);
/** Label for display, defaults to the unit parameter. */
const unitLabel = ref<string>('');
/** Plans presented as upgrade destinations. */
const upgradeTargets = ref<string[]>([]);

const { actions } = defineProps<{ actions: GeneratedUIActions }>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange') || typeof actions.handleChange !== 'function') { throw new Error('GeneratedUI requires actions.handleChange.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

/* @oods-domain-binding handleChange */ const handleChange = () => { actions.handleChange(); };
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
