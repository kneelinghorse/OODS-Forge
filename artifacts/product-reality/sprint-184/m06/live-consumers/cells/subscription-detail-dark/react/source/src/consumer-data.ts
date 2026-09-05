import type { PageProps } from './GeneratedUI.js';

export const model: Omit<PageProps, 'actions'> = {
  "allowedTransitions": [
    "paused",
    "pending_cancellation"
  ],
  "amount": 129900,
  "billingInterval": "month",
  "cancelAtPeriodEnd": false,
  "cancellationReason": "Requested by account owner",
  "cancellationReasonCode": "customer_request",
  "cancellationRequestedAt": "2026-09-05T12:00:00.000Z",
  "createdAt": "2026-01-02T03:04:05.000Z",
  "currency": "USD",
  "currentPeriodEnd": "2026-10-01T00:00:00.000Z",
  "currentPeriodProgress": 0.42,
  "currentPeriodStart": "2026-09-01T00:00:00.000Z",
  "customerEmail": "billing@example.test",
  "customerName": "Northwind Research",
  "lastEvent": "subscription.updated",
  "lastEventAt": "2026-09-05T12:00:00.000Z",
  "lastPaymentAt": "2026-09-01T00:00:00.000Z",
  "nextPaymentDueAt": "2026-10-01T00:00:00.000Z",
  "paymentMethodType": "card",
  "paymentStatus": "succeeded",
  "planCode": "enterprise-monthly",
  "planInterval": "month",
  "planName": "Enterprise",
  "prorationAmount": 0,
  "status": "active",
  "subscriptionId": "sub-s184-001",
  "updatedAt": "2026-09-05T12:00:00.000Z"
};
