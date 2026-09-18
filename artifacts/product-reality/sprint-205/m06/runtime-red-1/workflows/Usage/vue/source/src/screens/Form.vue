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
              <DetailHeader id="form-form-title-1" data-oods-component="DetailHeader" as="h1" />
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <DatePicker id="form-slot-field-0-3" data-oods-component="DatePicker" help="Date the usage accumulation window began." label="Period start" :modelValue="handleChange_period_startState" @update:modelValue="setHandleChange_period_startState" @change="handleChange_period_start" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-1-5" data-oods-component="Select" help="Choose the current status." label="Status" :options="[{'value':'ok','label':'ok'},{'value':'delayed','label':'delayed'},{'value':'investigating','label':'investigating'}]" placeholder="Enter status" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="Friendly metered feature name shown in UI (ex: Analytics Seats)." label="Meter name" placeholder="Enter meter name" required :modelValue="handleChange_meter_nameState" @update:modelValue="setHandleChange_meter_nameState" @change="handleChange_meter_name" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="Quantity included in base plan before overages." label="Included quantity" placeholder="Enter included quantity" required type="number" :modelValue="handleChange_included_quantityState" @update:modelValue="setHandleChange_included_quantityState" @change="handleChange_included_quantity" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Actual quantity consumed in the active period." label="Consumed quantity" placeholder="Enter consumed quantity" required type="number" :modelValue="handleChange_consumed_quantityState" @update:modelValue="setHandleChange_consumed_quantityState" @change="handleChange_consumed_quantity" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Label for display, defaults to the unit parameter." label="Unit label" placeholder="Enter unit label" required :modelValue="handleChange_unit_labelState" @update:modelValue="setHandleChange_unit_labelState" @change="handleChange_unit_label" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Strategy for unused units (inherits rolloverStrategy parameter)." label="Rollover strategy" placeholder="Enter rollover strategy" :modelValue="handleChange_rollover_strategyState" @update:modelValue="setHandleChange_rollover_strategyState" @change="handleChange_rollover_strategy" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-7-21" data-oods-component="Input" help="Cost per additional unit expressed in minor currency units." label="Overage rate minor" placeholder="Enter overage rate minor" type="number" :modelValue="handleChange_overage_rate_minorState" @update:modelValue="setHandleChange_overage_rate_minorState" @change="handleChange_overage_rate_minor" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Forecasted overage spend derived from consumption trends." label="Projected overage minor" placeholder="Enter projected overage minor" type="number" :modelValue="handleChange_projected_overage_minorState" @update:modelValue="setHandleChange_projected_overage_minorState" @change="handleChange_projected_overage_minor" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-9-25" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" :options="[{'label':'Reading Captured','value':'reading_captured'},{'label':'Anomaly Detected','value':'anomaly_detected'},{'label':'Reset','value':'reset'}]" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
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
import { Banner, Button, DatePicker, DetailHeader, Input, Select, Stack } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  anomalies?: unknown[];
  consumedQuantity?: number;
  createdAt?: string;
  includedQuantity?: number;
  lastEvent?: 'reading_captured' | 'anomaly_detected' | 'reset';
  lastEventAt?: string;
  lastReportedAt?: string;
  meterId?: string;
  meterName?: string;
  overageRateMinor?: number;
  periodEnd?: string;
  periodStart?: string;
  projectedOverageMinor?: number;
  provider?: string;
  rolloverStrategy?: string;
  samples?: unknown[];
  status?: 'ok' | 'delayed' | 'investigating';
  subscriptionId?: string;
  trendPercent?: number;
  unitLabel?: string;
  updatedAt?: string;
  usageId?: string;
  varianceMinor?: number;
}
const generatedProps = defineProps<Props>();
const actions = generatedProps.actions;
const uiState = generatedProps.uiState;
/** Detected anomalies with context for investigation. */
const anomalies = ref<unknown[]>(generatedProps.anomalies ?? []);
/** Actual quantity consumed in the active period. */
const consumedQuantity = ref<number>(generatedProps.consumedQuantity ?? 0);
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Quantity included in base plan before overages. */
const includedQuantity = ref<number>(generatedProps.includedQuantity ?? 0);
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'reading_captured' | 'anomaly_detected' | 'reset'>(generatedProps.lastEvent ?? 'reading_captured');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Timestamp of the most recent provider usage payload. */
const lastReportedAt = ref<string>(generatedProps.lastReportedAt ?? '');
/** Provider specific meter identifier. */
const meterId = ref<string>(generatedProps.meterId ?? '');
/** Friendly metered feature name shown in UI (ex: Analytics Seats). */
const meterName = ref<string>(generatedProps.meterName ?? '');
/** Cost per additional unit expressed in minor currency units. */
const overageRateMinor = ref<number>(generatedProps.overageRateMinor ?? 0);
/** Date the usage accumulation window ends. */
const periodEnd = ref<string>(generatedProps.periodEnd ?? '');
/** Date the usage accumulation window began. */
const periodStart = ref<string>(generatedProps.periodStart ?? '');
/** Forecasted overage spend derived from consumption trends. */
const projectedOverageMinor = ref<number>(generatedProps.projectedOverageMinor ?? 0);
/** Source provider for usage data. */
const provider = ref<string>(generatedProps.provider ?? '');
/** Strategy for unused units (inherits rolloverStrategy parameter). */
const rolloverStrategy = ref<string>(generatedProps.rolloverStrategy ?? '');
/** Rolling usage measurements for charts or anomaly detection. */
const samples = ref<unknown[]>(generatedProps.samples ?? []);
/** Health of the usage feed (ok, delayed, investigating). */
const status = ref<'ok' | 'delayed' | 'investigating'>(generatedProps.status ?? 'ok');
/** Subscription the usage belongs to. */
const subscriptionId = ref<string>(generatedProps.subscriptionId ?? '');
/** Percent delta compared to previous window. */
const trendPercent = ref<number>(generatedProps.trendPercent ?? 0);
/** Label for display, defaults to the unit parameter. */
const unitLabel = ref<string>(generatedProps.unitLabel ?? '');
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');
/** Identifier for this usage record. */
const usageId = ref<string>(generatedProps.usageId ?? '');
/** Currency impact of usage variance calculated with overage rate. */
const varianceMinor = ref<number>(generatedProps.varianceMinor ?? 0);

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_consumed_quantityState = ref<string>(String(consumedQuantity.value ?? ''));
const setHandleChange_consumed_quantityState = (value: string) => { handleChange_consumed_quantityState.value = value; };
/* @oods-local-binding handleChange_consumed_quantity */ const handleChange_consumed_quantity = (value: string) => { setHandleChange_consumed_quantityState(value); };
const handleChange_included_quantityState = ref<string>(String(includedQuantity.value ?? ''));
const setHandleChange_included_quantityState = (value: string) => { handleChange_included_quantityState.value = value; };
/* @oods-local-binding handleChange_included_quantity */ const handleChange_included_quantity = (value: string) => { setHandleChange_included_quantityState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_meter_nameState = ref<string>(String(meterName.value ?? ''));
const setHandleChange_meter_nameState = (value: string) => { handleChange_meter_nameState.value = value; };
/* @oods-local-binding handleChange_meter_name */ const handleChange_meter_name = (value: string) => { setHandleChange_meter_nameState(value); };
const handleChange_overage_rate_minorState = ref<string>(String(overageRateMinor.value ?? ''));
const setHandleChange_overage_rate_minorState = (value: string) => { handleChange_overage_rate_minorState.value = value; };
/* @oods-local-binding handleChange_overage_rate_minor */ const handleChange_overage_rate_minor = (value: string) => { setHandleChange_overage_rate_minorState(value); };
const handleChange_period_startState = ref<string>(String(periodStart.value ?? ''));
const setHandleChange_period_startState = (value: string) => { handleChange_period_startState.value = value; };
/* @oods-local-binding handleChange_period_start */ const handleChange_period_start = (value: string) => { setHandleChange_period_startState(value); };
const handleChange_projected_overage_minorState = ref<string>(String(projectedOverageMinor.value ?? ''));
const setHandleChange_projected_overage_minorState = (value: string) => { handleChange_projected_overage_minorState.value = value; };
/* @oods-local-binding handleChange_projected_overage_minor */ const handleChange_projected_overage_minor = (value: string) => { setHandleChange_projected_overage_minorState(value); };
const handleChange_rollover_strategyState = ref<string>(String(rolloverStrategy.value ?? ''));
const setHandleChange_rollover_strategyState = (value: string) => { handleChange_rollover_strategyState.value = value; };
/* @oods-local-binding handleChange_rollover_strategy */ const handleChange_rollover_strategy = (value: string) => { setHandleChange_rollover_strategyState(value); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
const handleChange_unit_labelState = ref<string>(String(unitLabel.value ?? ''));
const setHandleChange_unit_labelState = (value: string) => { handleChange_unit_labelState.value = value; };
/* @oods-local-binding handleChange_unit_label */ const handleChange_unit_label = (value: string) => { setHandleChange_unit_labelState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
