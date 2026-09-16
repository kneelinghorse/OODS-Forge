<template>
  <Stack id="timeline-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="timeline-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="timeline-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="timeline-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="timeline-screen-timeline-14" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="timeline-timeline-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <Text id="timeline-timeline-header-1-title" data-oods-component="Text">{{ planName }}</Text>
                    </Stack>
              <section id="timeline-timeline-entries-13" data-oods-collection="events"><template v-if="events.length === 0"><Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" data-oods-state="empty" content="No events yet." /></template><ol v-else aria-label="Lifecycle history" class="oods-collection"><li v-for="(collectionEvent, collectionIndex) in chronologicalEvents(events)" :key="collectionEvent.id"><Card :id="'timeline-timeline-entries-13-entry-' + collectionIndex"><strong>{{ collectionEvent.title }}</strong><time :datetime="collectionEvent.at">{{ formatDateTime(collectionEvent.at) }}</time><p>{{ collectionEvent.description }}</p></Card></li></ol></section>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { chronologicalEvents, formatDateTime, type CollectionEvent } from '@oods/component-contracts';
import { Banner, Card, Stack, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface Props {
  events?: CollectionEvent[];
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

const { uiState, addOnIds, amountMinor, billingAnchorDay, billingInterval, collectionMethod, consumedQuantity, currency, downgradeTargets, featureMatrix, includedQuantity, intervalCount, meterName, notes, overageRateMinor, ownerId, ownerType, ownershipRole, ownershipTransferredAt, periodEnd, periodStart, planCode, planId, planName, pricingModel, productFamily, projectedOverageMinor, rolloverStrategy, samples, status, trialPeriodDays, unitLabel, upgradeTargets, events = [] } = defineProps<Props>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
