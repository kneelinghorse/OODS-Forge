import React from 'react';
import { GeneratedUI, type GeneratedUIActions, type PageProps } from './GeneratedUI.js';

export type ConsumerActions = GeneratedUIActions;
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
} satisfies Omit<PageProps, 'actions'>;

export function App({ actions }: { actions: ConsumerActions }) {
  return (
    <main id="consumer-shell">
      <nav id="domain-actions" aria-label="Subscription actions">
        <button id="domain-edit" type="button" onClick={actions.handleEdit}>Edit subscription</button>
        <button id="domain-delete" type="button" onClick={actions.handleDelete}>Delete subscription</button>
      </nav>
      <GeneratedUI {...model} actions={actions} />
    </main>
  );
}
