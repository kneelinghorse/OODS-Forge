<template>
  <Stack id="detail-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <DetailHeader id="detail-slot-header-2" data-oods-component="DetailHeader" label="Meter name">{{ meterName }}</DetailHeader>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
                      <div data-sidebar-main>
                        <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Details','panel':''}]">
                                    <template #panel="{ item }">
                                      <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                          <StatusTimeline id="detail-slot-tab-0-4" data-oods-component="StatusTimeline" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                              <Text id="detail-pg-status-timeline-22" data-oods-component="Text" label="Status">{{ status }}</Text>
                                              <Text id="detail-pg-status-timeline-23" data-oods-component="Text" label="Updated at">{{ updatedAt }}</Text>
                                            </StatusTimeline>
                                          <Text id="detail-slot-tab-1-6" data-oods-component="Text" label="Consumed quantity">{{ consumedQuantity }}</Text>
                                        </Stack>
                                      </template>
                                    </template>
                                  </Tabs>
                      </div>
                      <aside data-sidebar-aside>
                        <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)" />
                      </aside>
                    </Card>
            </Stack>
      </template>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
    <button type="button" data-oods-action="handleDelete" @click="handleDelete()">Archive</button>
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
    <button type="button" data-oods-action="handleViewTimeline" @click="handleViewTimeline()">View timeline</button>
  </div>
</template>

<script setup lang="ts">
import { Banner, Card, DetailHeader, Stack, StatusTimeline, Tabs, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleDelete: () => void;
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Detected anomalies with context for investigation. */
  anomalies?: unknown[];
  /** Actual quantity consumed in the active period. */
  consumedQuantity: number;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Quantity included in base plan before overages. */
  includedQuantity: number;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Timestamp of the most recent provider usage payload. */
  lastReportedAt: string;
  /** Provider specific meter identifier. */
  meterId: string;
  /** Friendly metered feature name shown in UI (ex: Analytics Seats). */
  meterName: string;
  /** Cost per additional unit expressed in minor currency units. */
  overageRateMinor?: number;
  /** Date the usage accumulation window ends. */
  periodEnd: string;
  /** Date the usage accumulation window began. */
  periodStart: string;
  /** Forecasted overage spend derived from consumption trends. */
  projectedOverageMinor?: number;
  /** Source provider for usage data. */
  provider: string;
  /** Strategy for unused units (inherits rolloverStrategy parameter). */
  rolloverStrategy?: string;
  /** Rolling usage measurements for charts or anomaly detection. */
  samples?: unknown[];
  /** Health of the usage feed (ok, delayed, investigating). */
  status?: 'ok' | 'delayed' | 'investigating';
  /** Subscription the usage belongs to. */
  subscriptionId: string;
  /** Percent delta compared to previous window. */
  trendPercent?: number;
  /** Label for display, defaults to the unit parameter. */
  unitLabel: string;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
  /** Identifier for this usage record. */
  usageId: string;
  /** Currency impact of usage variance calculated with overage rate. */
  varianceMinor?: number;
}

const { actions, uiState, anomalies, consumedQuantity, createdAt, includedQuantity, lastEvent, lastEventAt, lastReportedAt, meterId, meterName, overageRateMinor, periodEnd, periodStart, projectedOverageMinor, provider, rolloverStrategy, samples, status, subscriptionId, trendPercent, unitLabel, updatedAt, usageId, varianceMinor } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
