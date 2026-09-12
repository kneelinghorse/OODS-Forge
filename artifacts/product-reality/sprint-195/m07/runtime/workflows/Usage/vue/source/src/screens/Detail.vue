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
                      <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                <DetailHeader id="detail-primary-header-21" data-oods-component="DetailHeader" label="Meter name">{{ meterName }}</DetailHeader>
                                <VizLinePreview id="detail-ve-header-20" data-oods-component="VizLinePreview" :svg="svg ?? defaultChartSvg" description="Synthetic API-call counts for generated example records." :height="200" title="Example API-call usage" :width="360" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
                      <div data-sidebar-main>
                        <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Details','panel':''}]">
                                    <template #panel="{ item }">
                                      <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                          <StatusTimeline id="detail-slot-tab-0-4" data-oods-component="StatusTimeline" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                              <Text id="detail-pg-status-timeline-23" data-oods-component="Text" label="Status">{{ status }}</Text>
                                              <Text id="detail-pg-status-timeline-24" data-oods-component="Text" label="Updated at">{{ updatedAt }}</Text>
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
import { Banner, Card, DetailHeader, Stack, StatusTimeline, Tabs, Text, VizLinePreview } from '@oods/components-vue';
import '@oods/component-styles/css';
const defaultChartSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" class=\"marks\" width=\"370\" height=\"210\" viewBox=\"0 0 370 210\"><rect width=\"370\" height=\"210\" fill=\"#FDF3DE\"/><g fill=\"none\" stroke-miterlimit=\"10\" transform=\"translate(67,35)\"><g class=\"mark-group role-frame root\" role=\"graphics-object\" aria-roledescription=\"group mark container\"><g transform=\"translate(0,0)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h296v138h-296Z\"/><g><g class=\"mark-group role-axis\" aria-hidden=\"true\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-grid\" pointer-events=\"none\"><line transform=\"translate(0,138)\" x2=\"296\" y2=\"0\" stroke=\"#DAD0BA\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,100)\" x2=\"296\" y2=\"0\" stroke=\"#DAD0BA\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,61)\" x2=\"296\" y2=\"0\" stroke=\"#DAD0BA\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,23)\" x2=\"296\" y2=\"0\" stroke=\"#DAD0BA\" stroke-width=\"1\" opacity=\"1\"/></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"X-axis titled 'Recorded at' for a time scale with values from Saturday, 14 June 2025, 7:00:00 PM to Tuesday, 24 June 2025, 7:00:00 PM\"><g transform=\"translate(0.5,138.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(6,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(36,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(65,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(95,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(125,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(154,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(184,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(213,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(243,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(273,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(6.166666666666666,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">Jun 15</text><text text-anchor=\"middle\" transform=\"translate(35.766666666666666,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Mon 16</text><text text-anchor=\"middle\" transform=\"translate(65.36666666666666,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">Tue 17</text><text text-anchor=\"middle\" transform=\"translate(94.96666666666667,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Wed 18</text><text text-anchor=\"middle\" transform=\"translate(124.56666666666666,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">Thu 19</text><text text-anchor=\"middle\" transform=\"translate(154.16666666666669,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Fri 20</text><text text-anchor=\"middle\" transform=\"translate(183.76666666666668,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">Sat 21</text><text text-anchor=\"middle\" transform=\"translate(213.36666666666667,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Jun 22</text><text text-anchor=\"middle\" transform=\"translate(242.96666666666667,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">Mon 23</text><text text-anchor=\"middle\" transform=\"translate(272.56666666666666,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Tue 24</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,0)\" x2=\"296\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(148,30)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#18233C\" opacity=\"1\">Recorded at</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"Y-axis titled 'API calls' for a linear scale with values from 0 to 1,800\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(0,138)\" x2=\"-5\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,100)\" x2=\"-5\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,61)\" x2=\"-5\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,23)\" x2=\"-5\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"end\" transform=\"translate(-7,141)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">0</text><text text-anchor=\"end\" transform=\"translate(-7,102.66666666666667)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">500</text><text text-anchor=\"end\" transform=\"translate(-7,64.33333333333333)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">1,000</text><text text-anchor=\"end\" transform=\"translate(-7,25.999999999999996)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">1,500</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,138)\" x2=\"0\" y2=\"-138\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(-51,69) rotate(-90) translate(0,-2)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#18233C\" opacity=\"1\">API calls</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-line role-mark marks\" role=\"graphics-object\" aria-roledescription=\"line mark container\"><path aria-label=\"Recorded at: Jun 14, 2025; API calls: 1200\" role=\"graphics-symbol\" aria-roledescription=\"line mark\" d=\"M0,46L148,0L296,23\" stroke=\"#416CD9\" stroke-width=\"2\"/></g><g class=\"mark-group role-title\"><g transform=\"translate(-62.00000000000001,-30)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-text role-title-text\" role=\"graphics-symbol\" aria-roledescription=\"title\" aria-label=\"Title text 'Example API-call usage'\" pointer-events=\"none\"><text text-anchor=\"start\" transform=\"translate(0,19)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"24px\" font-weight=\"600\" fill=\"#18233C\" opacity=\"1\">Example API-call usage</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" display=\"none\"/></g></g></g></svg>";

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleDelete: () => void;
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

interface Props {
  svg?: string;
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

const { actions, uiState, anomalies, consumedQuantity, createdAt, includedQuantity, lastEvent, lastEventAt, lastReportedAt, meterId, meterName, overageRateMinor, periodEnd, periodStart, projectedOverageMinor, provider, rolloverStrategy, samples, status, subscriptionId, trendPercent, unitLabel, updatedAt, usageId, varianceMinor, svg } = defineProps<Props>();

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
