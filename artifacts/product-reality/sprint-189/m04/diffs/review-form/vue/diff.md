# Render receipt diff

23 differences.

## schemaHash

Before:
```json
"sha256:3fc4474ad506b05d137c7a22e8e056ea2907cd8f2b1bd906808b00fd7db86787"
```
After:
```json
"sha256:1c047ae408a6c8724958b82eb3752e17665a8e77ee902071cd5cd46468de5f5f"
```

## artifactContentHash

Before:
```json
"sha256:3eb9801320d88f01741d9bcbb0ac10f40114bf985f2203fe34aa3b9e7933c3bd"
```
After:
```json
"sha256:5e86c67bd582f9b8bf8debb1c011d98e011773872348e191b34f740bc9bf3824"
```

## files.src/App.vue

Before:
```json
"sha256:725f3256cf89bbea21abee5f5e34c60b92f3cd72390a92cde5023559afd50315"
```
After:
```json
"sha256:f2b1d285bf9dea14f1c2e8568f9d47b542abcfb9c9bfcabc1dd7bd3ed6bf8f81"
```

## files.src/actions.ts

Before:
```json
"sha256:fef067af24a8842e4a1f8af22432d1ae1aa824490fc277bfc8dee92cf88d7637"
```
After:
```json
"sha256:7885a54420c4faa0f50c1926de2469fca71ade8bda029b87618003a0572ddbee"
```

## files.src/app.css

Before:
```json
"sha256:9d5d28169d1dd6a30f9e89057fac0841779b2bb38b63ba03038a13061d8eb3d9"
```
After:
```json
"sha256:142fce8b38ccc442764efa88cb15dc3e8c6293fbad34a9f787a47d5529e34dca"
```

## files.src/application.ts

Before:
```json
"sha256:a8fae4d9a5c22e2863df338ecb073b840ffe94f254bd4fbfb5fee90252d85868"
```
After:
```json
"sha256:78caf7f46e197dff42bd50d0871b7520cd7db624381e8594adc443e882d9902c"
```

## files.src/screens/Detail.vue

Before:
```json
"sha256:661c9dfd9d370492b4525a9ac0e1374b04e036048930f838bc65d980da16d95a"
```
After:
```json
"sha256:07d48b2f6d11c0c436f5fbca095cb46b574d35327205e436d6aabc74dcc5e68a"
```

## files.src/screens/Form.vue

Before:
```json
"sha256:6ea3d61b2c361ec1f0f336cb5ca4d69c9f9d7c86bfd2ae3b9b060710545d4bba"
```
After:
```json
"sha256:632a11dcff21f70149dc62d390a108a0c3d1a8a56178a49b6a373f03c9455da0"
```

## views.390.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Human-readable plan label shown in headers.\n    - textbox \"Human-readable plan label shown in headers.\": Team annual\n    - text: Current lifecycle status of the subscription.\n    - combobox \"Current lifecycle status of the subscription.\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - heading \"Cancellation Form\" [level=3]\n    - text: Reason Code\n    - combobox \"Reason Code\":\n      - option \"no_longer_needed\"\n      - option \"budget\"\n      - option \"duplicate\"\n    - text: Reason\n    - textbox \"Reason\": Budget changed for next year\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - checkbox \"Whether the subscription will cancel at the natural billing period end.\" [checked]\n    - text: Whether the subscription will cancel at the natural billing period end. Free-form explanation captured during cancellation workflows.\n    - textbox \"Free-form explanation captured during cancellation workflows.\": Budget changed for next year\n    - text: Timestamp when cancellation was initiated.\n    - textbox \"Timestamp when cancellation was initiated.\"\n    - text: ISO 4217 currency code used for billing.\n    - textbox \"ISO 4217 currency code used for billing.\":\n      - /placeholder: Enter currency\n      - text: usd\n    - text: Payment instrument category used for collection.\n    - combobox \"Payment instrument category used for collection.\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - text: Billing contact email address.\n    - textbox \"Billing contact email address.\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - text: Lifecycle event associated with the most recent timestamp mutation.\n    - textbox \"Lifecycle event associated with the most recent timestamp mutation.\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - text: Recurring price expressed in minor units (e.g., cents).\n    - spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"1999\"\n    - text: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - textbox \"Recurrence cadence (monthly, yearly, quarterly, etc.).\":\n      - /placeholder: Enter billing interval\n      - text: yearly\n    - button \"Save\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Change\"\n      - button \"Submit\"\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Plan name\n    - textbox \"Plan name\": Team annual\n    - text: Human-readable plan label shown in headers. Status\n    - combobox \"Status\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - paragraph: Current lifecycle status of the subscription.\n    - group:\n      - heading \"Cancellation Form\" [level=3]\n      - text: Reason Code\n      - textbox \"Reason Code\": customer_request\n      - paragraph: Structured reason code chosen from the allowedReasons parameter.\n      - text: Reason\n      - textbox \"Reason\": Budget changed for next year\n      - paragraph: Free-form explanation captured during cancellation workflows.\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - paragraph: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - paragraph: Recurring price expressed in minor units (e.g., cents).\n    - checkbox \"Cancel at period end\" [checked]\n    - text: Cancel at period end\n    - paragraph: Whether the subscription will cancel at the natural billing period end.\n    - text: Cancellation requested at\n    - textbox \"Cancellation requested at\":\n      - /placeholder: Timestamp when cancellation was initiated.\n      - text: 2026-09-08T12:00\n    - paragraph: Timestamp when cancellation was initiated.\n    - text: Currency\n    - textbox \"Currency\":\n      - /placeholder: Enter currency\n      - text: usd\n    - paragraph: ISO 4217 currency code used for billing.\n    - text: Payment method type\n    - combobox \"Payment method type\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - paragraph: Payment instrument category used for collection.\n    - text: Customer email\n    - textbox \"Customer email\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - paragraph: Billing contact email address.\n    - text: Last event\n    - textbox \"Last event\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - paragraph: Lifecycle event associated with the most recent timestamp mutation.\n    - button \"Save\"\n  - status: Changes saved in this session."
```

## views.390.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nList\nDetail\nEdit\nTimeline\nHuman-readable plan label shown in headers.\nCurrent lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave\nCancel subscription\nChange\nSubmit\n\nChanges saved in this session."
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nList\nDetail\nEdit\nTimeline\nPlan name\nHuman-readable plan label shown in headers.\nStatus\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave\n\nChanges saved in this session."
```

## views.390.values

Before:
```json
[
  {
    "element": "input",
    "name": "Human-readable plan label shown in headers.",
    "value": "Team annual",
    "checked": false
  },
  {
    "element": "select",
    "name": "Current lifecycle status of the subscription.FutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "pending_cancellation",
    "checked": false
  },
  {
    "element": "select",
    "name": "Reason Codeno_longer_neededbudgetduplicate",
    "value": "",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "form-ve-field-0-26",
    "name": "Billing interval",
    "value": "yearly",
    "checked": false
  },
  {
    "element": "form-ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "form-slot-field-1-5",
    "name": "Whether the subscription will cancel at the natural billing period end.",
    "value": "on",
    "checked": true
  },
  {
    "element": "form-slot-field-2-7",
    "name": "Free-form explanation captured during cancellation workflows.",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "form-slot-field-3-13",
    "name": "Timestamp when cancellation was initiated.",
    "value": "",
    "checked": false
  },
  {
    "element": "form-slot-field-4-15",
    "name": "ISO 4217 currency code used for billing.",
    "value": "usd",
    "checked": false
  },
  {
    "element": "form-slot-field-5-17",
    "name": "Payment instrument category used for collection.",
    "value": "wire",
    "checked": false
  },
  {
    "element": "form-slot-field-6-19",
    "name": "Billing contact email address.",
    "value": "customer3@example.com",
    "checked": false
  },
  {
    "element": "form-slot-field-7-21",
    "name": "Lifecycle event associated with the most recent timestamp mutation.",
    "value": "payment_received",
    "checked": false
  },
  {
    "element": "form-slot-field-8-23",
    "name": "Recurring price expressed in minor units (e.g., cents).",
    "value": "1999",
    "checked": false
  },
  {
    "element": "form-slot-field-9-25",
    "name": "Recurrence cadence (monthly, yearly, quarterly, etc.).",
    "value": "yearly",
    "checked": false
  }
]
```
After:
```json
[
  {
    "element": "plan_name",
    "name": "Plan name",
    "value": "Team annual",
    "checked": false
  },
  {
    "element": "select",
    "name": "StatusFutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "pending_cancellation",
    "checked": false
  },
  {
    "element": "input",
    "name": "Reason Code",
    "value": "customer_request",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "form-ve-field-0-26",
    "name": "Billing interval",
    "value": "yearly",
    "checked": false
  },
  {
    "element": "form-ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "form-slot-field-1-5",
    "name": "Cancel at period end",
    "value": "on",
    "checked": true
  },
  {
    "element": "form-slot-field-3-13",
    "name": "Cancellation requested at",
    "value": "2026-09-08T12:00",
    "checked": false
  },
  {
    "element": "form-slot-field-4-15",
    "name": "Currency*",
    "value": "usd",
    "checked": false
  },
  {
    "element": "form-slot-field-5-17",
    "name": "Payment method type",
    "value": "wire",
    "checked": false
  },
  {
    "element": "form-slot-field-6-19",
    "name": "Customer email",
    "value": "customer3@example.com",
    "checked": false
  },
  {
    "element": "form-slot-field-7-21",
    "name": "Last event*",
    "value": "payment_received",
    "checked": false
  }
]
```

## views.390.measurements

Before:
```json
{
  "viewportWidth": 390,
  "documentWidth": 390,
  "elementCount": 87,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "span",
      "text": "Whether the subscription will cancel at the natural billing period end.",
      "lines": [
        "Whether the subscription will cancel at",
        "the natural billing period end."
      ]
    },
    {
      "element": "label",
      "text": "Free-form explanation captured during cancellation workflows.",
      "lines": [
        "Free-form explanation captured during",
        "cancellation workflows."
      ]
    },
    {
      "element": "label",
      "text": "Payment instrument category used for collection.",
      "lines": [
        "Payment instrument category used for",
        "collection."
      ]
    },
    {
      "element": "label",
      "text": "Lifecycle event associated with the most recent timestamp mutation.",
      "lines": [
        "Lifecycle event associated with the most",
        "recent timestamp mutation."
      ]
    },
    {
      "element": "label",
      "text": "Recurring price expressed in minor units (e.g., cents).",
      "lines": [
        "Recurring price expressed in minor units",
        "(e.g., cents)."
      ]
    },
    {
      "element": "label",
      "text": "Recurrence cadence (monthly, yearly, quarterly, etc.).",
      "lines": [
        "Recurrence cadence (monthly, yearly,",
        "quarterly, etc.)."
      ]
    }
  ]
}
```
After:
```json
{
  "viewportWidth": 390,
  "documentWidth": 390,
  "elementCount": 88,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "p",
      "text": "Current lifecycle status of the subscription.",
      "lines": [
        "Current lifecycle status of the",
        "subscription."
      ]
    },
    {
      "element": "p",
      "text": "Structured reason code chosen from the allowedReasons parameter.",
      "lines": [
        "Structured reason code chosen from",
        "the allowedReasons parameter."
      ]
    },
    {
      "element": "p",
      "text": "Free-form explanation captured during cancellation workflows.",
      "lines": [
        "Free-form explanation captured",
        "during cancellation workflows."
      ]
    },
    {
      "element": "p",
      "text": "Recurrence cadence (monthly, yearly, quarterly, etc.).",
      "lines": [
        "Recurrence cadence (monthly, yearly,",
        "quarterly, etc.)."
      ]
    },
    {
      "element": "p",
      "text": "Recurring price expressed in minor units (e.g., cents).",
      "lines": [
        "Recurring price expressed in minor units",
        "(e.g., cents)."
      ]
    },
    {
      "element": "form-slot-field-1-5-help",
      "text": "Whether the subscription will cancel at the natural billing period end.",
      "lines": [
        "Whether the subscription will cancel at the",
        "natural billing period end."
      ]
    },
    {
      "element": "form-slot-field-3-13-help",
      "text": "Timestamp when cancellation was initiated.",
      "lines": [
        "Timestamp when cancellation was",
        "initiated."
      ]
    },
    {
      "element": "form-slot-field-5-17-help",
      "text": "Payment instrument category used for collection.",
      "lines": [
        "Payment instrument category used for",
        "collection."
      ]
    },
    {
      "element": "form-slot-field-7-21-help",
      "text": "Lifecycle event associated with the most recent timestamp mutation.",
      "lines": [
        "Lifecycle event associated with the most",
        "recent timestamp mutation."
      ]
    }
  ]
}
```

## views.390.regions

Before:
```json
[
  {
    "id": "form-screen",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-screen-form-11",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-form-title-1",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "form-ve-title-28",
    "component": "StatusSelector",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated"
  },
  {
    "id": "form-ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "form-form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD"
  },
  {
    "id": "form-slot-field-0-3",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD"
  },
  {
    "id": "",
    "component": "BillingIntervalSelector",
    "text": "Billing interval\nmonthly\nyearly"
  },
  {
    "id": "",
    "component": "BillingAmountInput",
    "text": "Billing amount\nUSD"
  },
  {
    "id": "form-form-field-group-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-form-field-group-6",
    "component": "Stack",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "",
    "component": "Textarea",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-form-field-group-12",
    "component": "Stack",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "DatePicker",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Billing contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Billing contact email address."
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-form-field-group-22",
    "component": "Stack",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-form-field-group-24",
    "component": "Stack",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```
After:
```json
[
  {
    "id": "form-screen",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
  },
  {
    "id": "form-screen-form-11",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
  },
  {
    "id": "form-form-title-1",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-ve-title-28",
    "component": "StatusSelector",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription."
  },
  {
    "id": "form-ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-slot-field-0-3",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "",
    "component": "BillingIntervalSelector",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "",
    "component": "BillingAmountInput",
    "text": "Billing amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-form-field-group-4",
    "component": "Stack",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-form-field-group-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-form-field-group-12",
    "component": "Stack",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "Currency\n*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Currency\n*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Last event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Last event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-form-field-group-22",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-form-field-group-24",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```

## views.820.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Human-readable plan label shown in headers.\n    - textbox \"Human-readable plan label shown in headers.\": Team annual\n    - text: Current lifecycle status of the subscription.\n    - combobox \"Current lifecycle status of the subscription.\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - heading \"Cancellation Form\" [level=3]\n    - text: Reason Code\n    - combobox \"Reason Code\":\n      - option \"no_longer_needed\"\n      - option \"budget\"\n      - option \"duplicate\"\n    - text: Reason\n    - textbox \"Reason\": Budget changed for next year\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - checkbox \"Whether the subscription will cancel at the natural billing period end.\" [checked]\n    - text: Whether the subscription will cancel at the natural billing period end. Free-form explanation captured during cancellation workflows.\n    - textbox \"Free-form explanation captured during cancellation workflows.\": Budget changed for next year\n    - text: Timestamp when cancellation was initiated.\n    - textbox \"Timestamp when cancellation was initiated.\"\n    - text: ISO 4217 currency code used for billing.\n    - textbox \"ISO 4217 currency code used for billing.\":\n      - /placeholder: Enter currency\n      - text: usd\n    - text: Payment instrument category used for collection.\n    - combobox \"Payment instrument category used for collection.\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - text: Billing contact email address.\n    - textbox \"Billing contact email address.\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - text: Lifecycle event associated with the most recent timestamp mutation.\n    - textbox \"Lifecycle event associated with the most recent timestamp mutation.\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - text: Recurring price expressed in minor units (e.g., cents).\n    - spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"1999\"\n    - text: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - textbox \"Recurrence cadence (monthly, yearly, quarterly, etc.).\":\n      - /placeholder: Enter billing interval\n      - text: yearly\n    - button \"Save\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Change\"\n      - button \"Submit\"\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Plan name\n    - textbox \"Plan name\": Team annual\n    - text: Human-readable plan label shown in headers. Status\n    - combobox \"Status\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - paragraph: Current lifecycle status of the subscription.\n    - group:\n      - heading \"Cancellation Form\" [level=3]\n      - text: Reason Code\n      - textbox \"Reason Code\": customer_request\n      - paragraph: Structured reason code chosen from the allowedReasons parameter.\n      - text: Reason\n      - textbox \"Reason\": Budget changed for next year\n      - paragraph: Free-form explanation captured during cancellation workflows.\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - paragraph: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - paragraph: Recurring price expressed in minor units (e.g., cents).\n    - checkbox \"Cancel at period end\" [checked]\n    - text: Cancel at period end\n    - paragraph: Whether the subscription will cancel at the natural billing period end.\n    - text: Cancellation requested at\n    - textbox \"Cancellation requested at\":\n      - /placeholder: Timestamp when cancellation was initiated.\n      - text: 2026-09-08T12:00\n    - paragraph: Timestamp when cancellation was initiated.\n    - text: Currency\n    - textbox \"Currency\":\n      - /placeholder: Enter currency\n      - text: usd\n    - paragraph: ISO 4217 currency code used for billing.\n    - text: Payment method type\n    - combobox \"Payment method type\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - paragraph: Payment instrument category used for collection.\n    - text: Customer email\n    - textbox \"Customer email\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - paragraph: Billing contact email address.\n    - text: Last event\n    - textbox \"Last event\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - paragraph: Lifecycle event associated with the most recent timestamp mutation.\n    - button \"Save\"\n  - status: Changes saved in this session."
```

## views.820.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nHuman-readable plan label shown in headers.\nCurrent lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave\nCancel subscription\nChange\nSubmit\n\nChanges saved in this session."
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nPlan name\nHuman-readable plan label shown in headers.\nStatus\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave\n\nChanges saved in this session."
```

## views.820.values

Before:
```json
[
  {
    "element": "input",
    "name": "Human-readable plan label shown in headers.",
    "value": "Team annual",
    "checked": false
  },
  {
    "element": "select",
    "name": "Current lifecycle status of the subscription.FutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "pending_cancellation",
    "checked": false
  },
  {
    "element": "select",
    "name": "Reason Codeno_longer_neededbudgetduplicate",
    "value": "",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "form-ve-field-0-26",
    "name": "Billing interval",
    "value": "yearly",
    "checked": false
  },
  {
    "element": "form-ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "form-slot-field-1-5",
    "name": "Whether the subscription will cancel at the natural billing period end.",
    "value": "on",
    "checked": true
  },
  {
    "element": "form-slot-field-2-7",
    "name": "Free-form explanation captured during cancellation workflows.",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "form-slot-field-3-13",
    "name": "Timestamp when cancellation was initiated.",
    "value": "",
    "checked": false
  },
  {
    "element": "form-slot-field-4-15",
    "name": "ISO 4217 currency code used for billing.",
    "value": "usd",
    "checked": false
  },
  {
    "element": "form-slot-field-5-17",
    "name": "Payment instrument category used for collection.",
    "value": "wire",
    "checked": false
  },
  {
    "element": "form-slot-field-6-19",
    "name": "Billing contact email address.",
    "value": "customer3@example.com",
    "checked": false
  },
  {
    "element": "form-slot-field-7-21",
    "name": "Lifecycle event associated with the most recent timestamp mutation.",
    "value": "payment_received",
    "checked": false
  },
  {
    "element": "form-slot-field-8-23",
    "name": "Recurring price expressed in minor units (e.g., cents).",
    "value": "1999",
    "checked": false
  },
  {
    "element": "form-slot-field-9-25",
    "name": "Recurrence cadence (monthly, yearly, quarterly, etc.).",
    "value": "yearly",
    "checked": false
  }
]
```
After:
```json
[
  {
    "element": "plan_name",
    "name": "Plan name",
    "value": "Team annual",
    "checked": false
  },
  {
    "element": "select",
    "name": "StatusFutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "pending_cancellation",
    "checked": false
  },
  {
    "element": "input",
    "name": "Reason Code",
    "value": "customer_request",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "form-ve-field-0-26",
    "name": "Billing interval",
    "value": "yearly",
    "checked": false
  },
  {
    "element": "form-ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "form-slot-field-1-5",
    "name": "Cancel at period end",
    "value": "on",
    "checked": true
  },
  {
    "element": "form-slot-field-3-13",
    "name": "Cancellation requested at",
    "value": "2026-09-08T12:00",
    "checked": false
  },
  {
    "element": "form-slot-field-4-15",
    "name": "Currency*",
    "value": "usd",
    "checked": false
  },
  {
    "element": "form-slot-field-5-17",
    "name": "Payment method type",
    "value": "wire",
    "checked": false
  },
  {
    "element": "form-slot-field-6-19",
    "name": "Customer email",
    "value": "customer3@example.com",
    "checked": false
  },
  {
    "element": "form-slot-field-7-21",
    "name": "Last event*",
    "value": "payment_received",
    "checked": false
  }
]
```

## views.820.measurements

Before:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 88,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 89,
  "overflow": [],
  "glyphWraps": []
}
```

## views.820.regions

Before:
```json
[
  {
    "id": "form-screen",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-screen-form-11",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-form-title-1",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "form-ve-title-28",
    "component": "StatusSelector",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated"
  },
  {
    "id": "form-ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "form-form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD"
  },
  {
    "id": "form-slot-field-0-3",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD"
  },
  {
    "id": "",
    "component": "BillingIntervalSelector",
    "text": "Billing interval\nmonthly\nyearly"
  },
  {
    "id": "",
    "component": "BillingAmountInput",
    "text": "Billing amount\nUSD"
  },
  {
    "id": "form-form-field-group-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-form-field-group-6",
    "component": "Stack",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "",
    "component": "Textarea",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-form-field-group-12",
    "component": "Stack",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "DatePicker",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Billing contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Billing contact email address."
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-form-field-group-22",
    "component": "Stack",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-form-field-group-24",
    "component": "Stack",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```
After:
```json
[
  {
    "id": "form-screen",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
  },
  {
    "id": "form-screen-form-11",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
  },
  {
    "id": "form-form-title-1",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-ve-title-28",
    "component": "StatusSelector",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription."
  },
  {
    "id": "form-ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-slot-field-0-3",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "",
    "component": "BillingIntervalSelector",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "",
    "component": "BillingAmountInput",
    "text": "Billing amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-form-field-group-4",
    "component": "Stack",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-form-field-group-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-form-field-group-12",
    "component": "Stack",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "Currency\n*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Currency\n*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Last event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Last event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-form-field-group-22",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-form-field-group-24",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```

## views.1440.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Human-readable plan label shown in headers.\n    - textbox \"Human-readable plan label shown in headers.\": Team annual\n    - text: Current lifecycle status of the subscription.\n    - combobox \"Current lifecycle status of the subscription.\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - heading \"Cancellation Form\" [level=3]\n    - text: Reason Code\n    - combobox \"Reason Code\":\n      - option \"no_longer_needed\"\n      - option \"budget\"\n      - option \"duplicate\"\n    - text: Reason\n    - textbox \"Reason\": Budget changed for next year\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - checkbox \"Whether the subscription will cancel at the natural billing period end.\" [checked]\n    - text: Whether the subscription will cancel at the natural billing period end. Free-form explanation captured during cancellation workflows.\n    - textbox \"Free-form explanation captured during cancellation workflows.\": Budget changed for next year\n    - text: Timestamp when cancellation was initiated.\n    - textbox \"Timestamp when cancellation was initiated.\"\n    - text: ISO 4217 currency code used for billing.\n    - textbox \"ISO 4217 currency code used for billing.\":\n      - /placeholder: Enter currency\n      - text: usd\n    - text: Payment instrument category used for collection.\n    - combobox \"Payment instrument category used for collection.\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - text: Billing contact email address.\n    - textbox \"Billing contact email address.\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - text: Lifecycle event associated with the most recent timestamp mutation.\n    - textbox \"Lifecycle event associated with the most recent timestamp mutation.\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - text: Recurring price expressed in minor units (e.g., cents).\n    - spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"1999\"\n    - text: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - textbox \"Recurrence cadence (monthly, yearly, quarterly, etc.).\":\n      - /placeholder: Enter billing interval\n      - text: yearly\n    - button \"Save\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Change\"\n      - button \"Submit\"\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Plan name\n    - textbox \"Plan name\": Team annual\n    - text: Human-readable plan label shown in headers. Status\n    - combobox \"Status\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - paragraph: Current lifecycle status of the subscription.\n    - group:\n      - heading \"Cancellation Form\" [level=3]\n      - text: Reason Code\n      - textbox \"Reason Code\": customer_request\n      - paragraph: Structured reason code chosen from the allowedReasons parameter.\n      - text: Reason\n      - textbox \"Reason\": Budget changed for next year\n      - paragraph: Free-form explanation captured during cancellation workflows.\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - paragraph: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - paragraph: Recurring price expressed in minor units (e.g., cents).\n    - checkbox \"Cancel at period end\" [checked]\n    - text: Cancel at period end\n    - paragraph: Whether the subscription will cancel at the natural billing period end.\n    - text: Cancellation requested at\n    - textbox \"Cancellation requested at\":\n      - /placeholder: Timestamp when cancellation was initiated.\n      - text: 2026-09-08T12:00\n    - paragraph: Timestamp when cancellation was initiated.\n    - text: Currency\n    - textbox \"Currency\":\n      - /placeholder: Enter currency\n      - text: usd\n    - paragraph: ISO 4217 currency code used for billing.\n    - text: Payment method type\n    - combobox \"Payment method type\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - paragraph: Payment instrument category used for collection.\n    - text: Customer email\n    - textbox \"Customer email\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - paragraph: Billing contact email address.\n    - text: Last event\n    - textbox \"Last event\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - paragraph: Lifecycle event associated with the most recent timestamp mutation.\n    - button \"Save\"\n  - status: Changes saved in this session."
```

## views.1440.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nHuman-readable plan label shown in headers.\nCurrent lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave\nCancel subscription\nChange\nSubmit\n\nChanges saved in this session."
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nPlan name\nHuman-readable plan label shown in headers.\nStatus\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave\n\nChanges saved in this session."
```

## views.1440.values

Before:
```json
[
  {
    "element": "input",
    "name": "Human-readable plan label shown in headers.",
    "value": "Team annual",
    "checked": false
  },
  {
    "element": "select",
    "name": "Current lifecycle status of the subscription.FutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "pending_cancellation",
    "checked": false
  },
  {
    "element": "select",
    "name": "Reason Codeno_longer_neededbudgetduplicate",
    "value": "",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "form-ve-field-0-26",
    "name": "Billing interval",
    "value": "yearly",
    "checked": false
  },
  {
    "element": "form-ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "form-slot-field-1-5",
    "name": "Whether the subscription will cancel at the natural billing period end.",
    "value": "on",
    "checked": true
  },
  {
    "element": "form-slot-field-2-7",
    "name": "Free-form explanation captured during cancellation workflows.",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "form-slot-field-3-13",
    "name": "Timestamp when cancellation was initiated.",
    "value": "",
    "checked": false
  },
  {
    "element": "form-slot-field-4-15",
    "name": "ISO 4217 currency code used for billing.",
    "value": "usd",
    "checked": false
  },
  {
    "element": "form-slot-field-5-17",
    "name": "Payment instrument category used for collection.",
    "value": "wire",
    "checked": false
  },
  {
    "element": "form-slot-field-6-19",
    "name": "Billing contact email address.",
    "value": "customer3@example.com",
    "checked": false
  },
  {
    "element": "form-slot-field-7-21",
    "name": "Lifecycle event associated with the most recent timestamp mutation.",
    "value": "payment_received",
    "checked": false
  },
  {
    "element": "form-slot-field-8-23",
    "name": "Recurring price expressed in minor units (e.g., cents).",
    "value": "1999",
    "checked": false
  },
  {
    "element": "form-slot-field-9-25",
    "name": "Recurrence cadence (monthly, yearly, quarterly, etc.).",
    "value": "yearly",
    "checked": false
  }
]
```
After:
```json
[
  {
    "element": "plan_name",
    "name": "Plan name",
    "value": "Team annual",
    "checked": false
  },
  {
    "element": "select",
    "name": "StatusFutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "pending_cancellation",
    "checked": false
  },
  {
    "element": "input",
    "name": "Reason Code",
    "value": "customer_request",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "form-ve-field-0-26",
    "name": "Billing interval",
    "value": "yearly",
    "checked": false
  },
  {
    "element": "form-ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "form-slot-field-1-5",
    "name": "Cancel at period end",
    "value": "on",
    "checked": true
  },
  {
    "element": "form-slot-field-3-13",
    "name": "Cancellation requested at",
    "value": "2026-09-08T12:00",
    "checked": false
  },
  {
    "element": "form-slot-field-4-15",
    "name": "Currency*",
    "value": "usd",
    "checked": false
  },
  {
    "element": "form-slot-field-5-17",
    "name": "Payment method type",
    "value": "wire",
    "checked": false
  },
  {
    "element": "form-slot-field-6-19",
    "name": "Customer email",
    "value": "customer3@example.com",
    "checked": false
  },
  {
    "element": "form-slot-field-7-21",
    "name": "Last event*",
    "value": "payment_received",
    "checked": false
  }
]
```

## views.1440.measurements

Before:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 88,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 89,
  "overflow": [],
  "glyphWraps": []
}
```

## views.1440.regions

Before:
```json
[
  {
    "id": "form-screen",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-screen-form-11",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-form-title-1",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "form-ve-title-28",
    "component": "StatusSelector",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated"
  },
  {
    "id": "form-ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "form-form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD"
  },
  {
    "id": "form-slot-field-0-3",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD"
  },
  {
    "id": "",
    "component": "BillingIntervalSelector",
    "text": "Billing interval\nmonthly\nyearly"
  },
  {
    "id": "",
    "component": "BillingAmountInput",
    "text": "Billing amount\nUSD"
  },
  {
    "id": "form-form-field-group-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-form-field-group-6",
    "component": "Stack",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "",
    "component": "Textarea",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-form-field-group-12",
    "component": "Stack",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "DatePicker",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Billing contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Billing contact email address."
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-form-field-group-22",
    "component": "Stack",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-form-field-group-24",
    "component": "Stack",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```
After:
```json
[
  {
    "id": "form-screen",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
  },
  {
    "id": "form-screen-form-11",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
  },
  {
    "id": "form-form-title-1",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-ve-title-28",
    "component": "StatusSelector",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription."
  },
  {
    "id": "form-ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency\n*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-slot-field-0-3",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "",
    "component": "BillingIntervalSelector",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "",
    "component": "BillingAmountInput",
    "text": "Billing amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-form-field-group-4",
    "component": "Stack",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-form-field-group-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-form-field-group-12",
    "component": "Stack",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "Currency\n*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Currency\n*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Last event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Last event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-form-field-group-22",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-form-field-group-24",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```
