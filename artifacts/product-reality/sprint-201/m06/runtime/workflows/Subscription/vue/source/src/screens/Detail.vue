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
              <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style="align-items: space-between; display: flex; flex-direction: column; gap: var(--ref-space-stack-default); padding: var(--ref-space-inset-default)">
                      <DetailHeader id="detail-detail-header-1-record-title" data-oods-component="DetailHeader" :title="planName" :level="2" />
                      <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                <VizAreaPreview id="detail-ve-header-26" data-oods-component="VizAreaPreview" :svg="svg ?? defaultChartSvg" description="Recorded sample payments in major currency units." :height="400" title="Payment amounts" :width="720" />
                                <StatusTimeline id="detail-ve-header-27" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                                <CancellationSummary id="detail-ve-header-28" data-oods-component="CancellationSummary" :cancelAtPeriodEnd="cancelAtPeriodEnd" :requestedAt="cancellationRequestedAt" :reason="cancellationReason" :code="cancellationReasonCode" />
                                <ArchiveSummary id="detail-ve-header-29" data-oods-component="ArchiveSummary" :isArchived="isArchived" :archivedAt="archivedAt" :reason="archiveReason" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Billing','panel':''},{'id':'detail-detail-tabs-9-read-fields','label':'Details','panel':''}]">
                                <template #panel="{ item }">
                                  <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                    <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                      <CycleProgressCard id="detail-slot-tab-0-4" data-oods-component="CycleProgressCard" :progress="currentPeriodProgress" :periodStart="currentPeriodStart" :periodEnd="currentPeriodEnd" :interval="billingInterval" />
                                      <PaymentTimeline id="detail-slot-tab-1-6" data-oods-component="PaymentTimeline" :lastPayment="lastPaymentAt" :nextPayment="nextPaymentDueAt" :paymentStatus="paymentStatus" :paymentMethod="paymentMethodType" :amount="amount" :currency="currency" />
                                    </Stack>
                                  </template>
                                  <template v-if="item.id === 'detail-detail-tabs-9-read-fields'">
                                    <Stack id="detail-detail-tabs-9-read-fields" data-oods-component="Stack">
                                      <Stack id="detail-detail-tabs-9-created_at-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-created_at-label" data-oods-component="Text" as="strong" content="Created at" />
                                          <Text id="detail-detail-tabs-9-created_at-value" data-oods-component="Text">{{ formatReadOnlyValue(createdAt, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-updated_at-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-updated_at-label" data-oods-component="Text" as="strong" content="Updated at" />
                                          <Text id="detail-detail-tabs-9-updated_at-value" data-oods-component="Text">{{ formatReadOnlyValue(updatedAt, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                          <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEvent, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                          <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEventAt, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-subscription_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-subscription_id-label" data-oods-component="Text" as="strong" content="Subscription id" />
                                          <Text id="detail-detail-tabs-9-subscription_id-value" data-oods-component="Text">{{ formatReadOnlyValue(subscriptionId, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-plan_code-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-plan_code-label" data-oods-component="Text" as="strong" content="Plan code" />
                                          <Text id="detail-detail-tabs-9-plan_code-value" data-oods-component="Text">{{ formatReadOnlyValue(planCode, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-plan_interval-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-plan_interval-label" data-oods-component="Text" as="strong" content="Plan interval" />
                                          <Text id="detail-detail-tabs-9-plan_interval-value" data-oods-component="Text">{{ formatReadOnlyValue(planInterval, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-customer_name-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-customer_name-label" data-oods-component="Text" as="strong" content="Customer name" />
                                          <Text id="detail-detail-tabs-9-customer_name-value" data-oods-component="Text">{{ formatReadOnlyValue(customerName, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-customer_email-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-customer_email-label" data-oods-component="Text" as="strong" content="Customer email" />
                                          <Text id="detail-detail-tabs-9-customer_email-value" data-oods-component="Text">{{ formatReadOnlyValue(customerEmail, "email", false) }}</Text>
                                        </Stack>
                                    </Stack>
                                  </template>
                                </template>
                              </Tabs>
                    </Card>
            </Stack>
      </template>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
    <button type="button" data-oods-action="handleCancel" @click="handleCancel()">Cancel subscription</button>
    <button type="button" data-oods-action="handleDelete" @click="handleDelete()">Archive</button>
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
    <button type="button" data-oods-action="handleViewTimeline" @click="handleViewTimeline()">View timeline</button>
  </div>
</template>

<script setup lang="ts">
import { formatReadOnlyValue } from '@oods/component-contracts';
import { ArchiveSummary, Banner, CancellationSummary, Card, CycleProgressCard, DetailHeader, PaymentTimeline, Stack, StatusTimeline, Tabs, Text, VizAreaPreview } from '@oods/components-vue';
import '@oods/component-styles/css';
const defaultChartSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" class=\"marks\" width=\"730\" height=\"410\" viewBox=\"0 0 730 410\"><rect width=\"730\" height=\"410\" fill=\"#F9FAFC\"/><g fill=\"none\" stroke-miterlimit=\"10\" transform=\"translate(43,38)\"><g class=\"mark-group role-frame root\" role=\"graphics-object\" aria-roledescription=\"group mark container\"><g transform=\"translate(0,0)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h677v335h-677Z\"/><g><g class=\"mark-group role-axis\" aria-hidden=\"true\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-grid\" pointer-events=\"none\"><line transform=\"translate(0,335)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,305)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,274)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,244)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,213)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,183)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,152)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,122)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,91)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,61)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,30)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,0)\" x2=\"677\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"X-axis titled 'Date' for a utc scale with values from Monday, 01 June 2026, 12:00:00 PM UTC to Tuesday, 01 September 2026, 12:00:00 PM UTC\"><g transform=\"translate(0.5,335.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(40,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(92,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(143,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(195,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(247,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(298,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(350,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(401,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(453,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(504,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(556,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(607,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(659,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(40.47282608695652,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Jun 07</text><text text-anchor=\"middle\" transform=\"translate(91.9836956521739,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Jun 14</text><text text-anchor=\"middle\" transform=\"translate(143.4945652173913,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Jun 21</text><text text-anchor=\"middle\" transform=\"translate(195.0054347826087,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Jun 28</text><text text-anchor=\"middle\" transform=\"translate(246.5163043478261,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Jul 05</text><text text-anchor=\"middle\" transform=\"translate(298.0271739130435,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Jul 12</text><text text-anchor=\"middle\" transform=\"translate(349.5380434782608,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Jul 19</text><text text-anchor=\"middle\" transform=\"translate(401.04891304347825,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Jul 26</text><text text-anchor=\"middle\" transform=\"translate(452.5597826086956,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Aug 02</text><text text-anchor=\"middle\" transform=\"translate(504.070652173913,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Aug 09</text><text text-anchor=\"middle\" transform=\"translate(555.5815217391304,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Aug 16</text><text text-anchor=\"middle\" transform=\"translate(607.0923913043479,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Aug 23</text><text text-anchor=\"middle\" transform=\"translate(658.6032608695652,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Aug 30</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,0)\" x2=\"677\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(338.5,30)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#1A1D23\" opacity=\"1\">Date</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"Y-axis titled 'Amount' for a linear scale with values from 0 to 22\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(0,335)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,305)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,274)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,244)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,213)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,183)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,152)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,122)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,91)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,61)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,30)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,0)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"end\" transform=\"translate(-7,338)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">0</text><text text-anchor=\"end\" transform=\"translate(-7,307.54545454545456)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">2</text><text text-anchor=\"end\" transform=\"translate(-7,277.09090909090907)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">4</text><text text-anchor=\"end\" transform=\"translate(-7,246.63636363636365)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">6</text><text text-anchor=\"end\" transform=\"translate(-7,216.1818181818182)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">8</text><text text-anchor=\"end\" transform=\"translate(-7,185.72727272727272)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">10</text><text text-anchor=\"end\" transform=\"translate(-7,155.27272727272728)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">12</text><text text-anchor=\"end\" transform=\"translate(-7,124.81818181818183)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">14</text><text text-anchor=\"end\" transform=\"translate(-7,94.36363636363636)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">16</text><text text-anchor=\"end\" transform=\"translate(-7,63.90909090909089)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">18</text><text text-anchor=\"end\" transform=\"translate(-7,33.45454545454547)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">20</text><text text-anchor=\"end\" transform=\"translate(-7,3)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">22</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,335)\" x2=\"0\" y2=\"-335\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(-27,167.5) rotate(-90) translate(0,-2)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#1A1D23\" opacity=\"1\">Amount</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-area role-mark marks\" role=\"graphics-object\" aria-roledescription=\"area mark container\"><path aria-label=\"Date: Jun 01, 2026; Amount: 15.2\" role=\"graphics-symbol\" aria-roledescription=\"area mark\" d=\"M0,103.545L220.761,16.75L448.88,74.614L677,45.682L677,335L448.88,335L220.761,335L0,335Z\" fill=\"#580918\"/></g><g class=\"mark-group role-title\"><g transform=\"translate(-38,-33)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-text role-title-text\" role=\"graphics-symbol\" aria-roledescription=\"title\" aria-label=\"Title text 'Payment amounts'\" pointer-events=\"none\"><text text-anchor=\"start\" transform=\"translate(0,19)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"24px\" font-weight=\"600\" fill=\"#1A1D23\" opacity=\"1\">Payment amounts</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" display=\"none\"/></g></g></g></svg>";

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleCancel: () => void;
  handleDelete: () => void;
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

interface Props {
  svg?: string;
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Recurring price expressed in minor units (e.g., cents). */
  amount: number;
  /** Structured metadata about the archival action for compliance and audit purposes.

Properties:
  - method: "manual" | "automated" | "policy" — how the archive was triggered
  - compliance_tags: string[] — regulatory labels (e.g., ["GDPR", "SOX", "HIPAA"])
  - retention_policy_id: string — reference to the retention policy that triggered archival
  - original_status: string — the Stateful status before archival
  - related_entity_count: number — count of related entities also archived (cascade)
 */
  archiveMetadata?: Record<string, unknown>;
  /** Human-readable narrative describing why the entity was archived. */
  archiveReason?: string;
  /** Timestamp for when the entity entered the archived state. */
  archivedAt?: string | null;
  /** User ID or system identifier of the actor who archived this entity.
Set to "system" for automated/policy-driven archival. Supports audit trail queries
like "show all entities archived by user X" or "show all auto-archived entities".
 */
  archivedBy?: string;
  /** Recurrence cadence (monthly, yearly, quarterly, etc.). */
  billingInterval?: string;
  /** Whether the subscription will cancel at the natural billing period end. */
  cancelAtPeriodEnd: boolean;
  /** Free-form explanation captured during cancellation workflows. */
  cancellationReason?: string;
  /** Structured reason code chosen from the allowedReasons parameter. */
  cancellationReasonCode?: string;
  /** Timestamp when cancellation was initiated. */
  cancellationRequestedAt?: string;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** ISO 4217 currency code used for billing. */
  currency: string;
  /** End timestamp of the current billing cycle. */
  currentPeriodEnd: string;
  /** Decimal progress (0-1) through the active billing cycle. */
  currentPeriodProgress?: number;
  /** Start timestamp of the current billing cycle. */
  currentPeriodStart: string;
  /** Billing contact email address. */
  customerEmail?: string;
  /** Customer or account name associated with the subscription. */
  customerName?: string;
  /** Flag indicating whether the entity is currently archived (soft-deleted). */
  isArchived: boolean;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'billing_cycle_started' | 'billing_cycle_completed' | 'payment_received' | 'cancellation_requested';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Timestamp of the most recent successful payment. */
  lastPaymentAt?: string;
  /** Timestamp when the next payment attempt should occur. */
  nextPaymentDueAt?: string;
  /** Payment instrument category used for collection. */
  paymentMethodType?: 'card' | 'ach' | 'wire' | 'invoice' | 'other';
  /** Outcome of the most recent collection attempt. Distinct from subscription
lifecycle status — a subscription can be "active" with payment_status "retrying".
 */
  paymentStatus?: 'pending' | 'succeeded' | 'failed' | 'retrying' | 'refunded';
  /** Internal plan code or price identifier. */
  planCode?: string;
  /** Billing interval descriptor (monthly, yearly, etc.). */
  planInterval?: string;
  /** Human-readable plan label shown in headers. */
  planName: string;
  /** Prorated credit or charge in minor currency units generated by a mid-cycle
plan change. Positive values are charges; negative values are credits.
Only populated when the supportProration parameter is true.
 */
  prorationAmount?: number;
  /** Unix timestamp (epoch SECONDS) at which proration is calculated. Pinned when an
upcoming-invoice PREVIEW is requested and MUST be passed identically on commit so the
committed charge equals the previewed amount. The preview is read-only and does NOT
mutate the subscription. Stored as an integer (not a datetime) so the value round-trips
byte-identically between preview and commit — an ISO string normalization could shift it
and desync the previewed vs charged amount. Only populated when supportProration is true.
Source: docs.stripe.com/billing/subscriptions/prorations.
 */
  prorationDate?: number;
  /** Metadata about the most recent restoration action.

Properties:
  - restored_by: string — user ID or "system"
  - restored_fields: string[] — when partial restore, which fields were restored
  - restoration_reason: string — why the entity was restored
  - restored_from_snapshot: boolean — whether restored from a point-in-time snapshot
 */
  restorationMetadata?: Record<string, unknown>;
  /** Timestamp for when the entity was most recently restored from an archived state. */
  restoredAt?: string | null;
  /** Chronological log of state transitions. Each entry records the before/after states,
timestamp, and (when governance is enabled) the actor, reason, and transition metadata.
Rendered by StatusTimeline in the detail and timeline views.

Entry structure:
  - from: string (previous state)
  - to: string (new state)
  - timestamp: ISO 8601 datetime
  - actor_id: string (user/system who triggered the transition, optional)
  - reason: string (human-readable justification, required when requireTransitionReason is true)
  - transition_metadata: Record<string, unknown> (arbitrary context, optional)
 */
  stateHistory?: unknown[];
  /** Current lifecycle status of the subscription. */
  status: 'future' | 'trialing' | 'active' | 'paused' | 'pending_cancellation' | 'past_due' | 'unpaid' | 'terminated';
  /** Primary identifier used across billing and lifecycle systems. */
  subscriptionId: string;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

const { actions, uiState, allowedTransitions, amount, archiveMetadata, archiveReason, archivedAt, archivedBy, billingInterval, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, createdAt, currency, currentPeriodEnd, currentPeriodProgress, currentPeriodStart, customerEmail, customerName, isArchived, lastEvent, lastEventAt, lastPaymentAt, nextPaymentDueAt, paymentMethodType, paymentStatus, planCode, planInterval, planName, prorationAmount, prorationDate, restorationMetadata, restoredAt, stateHistory, status, subscriptionId, updatedAt, svg } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleCancel') || typeof actions.handleCancel !== 'function') { throw new Error('GeneratedUI requires actions.handleCancel.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleCancel */ const handleCancel = () => { actions.handleCancel(); };
/* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
