<template>
  <main id="consumer-shell">
    <nav id="domain-actions" aria-label="Subscription actions">
      <button id="domain-edit" type="button" @click="actions.handleEdit">Edit subscription</button>
      <button id="domain-delete" type="button" @click="actions.handleDelete">Delete subscription</button>
    </nav>
    <GeneratedUI v-bind="model" :actions="actions" />
  </main>
</template>

<script setup lang="ts">
import GeneratedUI from './GeneratedUI.vue';

export interface ConsumerActions {
  handleEdit: () => void;
  handleDelete: () => void;
}
defineProps<{ actions: ConsumerActions }>();
const model = {
  "accountName": "Northwind Research",
  "amountMinor": 129900,
  "billingInterval": "month",
  "consumedQuantity": 37,
  "currency": "USD",
  "currentPeriodEnd": "2026-10-01T00:00:00.000Z",
  "currentPeriodStart": "2026-09-01T00:00:00.000Z",
  "includedQuantity": 50,
  "meterName": "Analytics seats",
  "periodEnd": "2026-10-01",
  "periodStart": "2026-09-01",
  "planCode": "enterprise-monthly",
  "planName": "Enterprise",
  "provider": "stripe",
  "status": "active",
  "subscriptionId": "sub-s183-001",
  "unitLabel": "seat"
};
</script>
