# Render receipt diff

18 differences.

## schemaHash

Before:
```json
"sha256:c5683e2f15cf5b9182ee8e11cafed35571487422390d36ff73d29770d361297d"
```
After:
```json
"sha256:b2fa111047fa7bf817e518ca432a5928dc8b96e7347f07b0cf3b290296cad5d2"
```

## artifactContentHash

Before:
```json
"sha256:a1cb21f70943cf2e88bf028942cae8ef75d6375f62ae5c55a975f8ed6c8cb1d3"
```
After:
```json
"sha256:45935dcaf5f46dcdf4060e01360c1a299f3457098af8bf7bf3006a496e8c0bb2"
```

## files.src/GeneratedUI.vue

Before:
```json
"sha256:0ecd2c3a34461bfd70e9e1ac6ce335c94723d785c146dd432aca02ff63c71395"
```
After:
```json
"sha256:f704572abca9f7cfd1c36de06a6eca32c43ac8b3d7f4bc89f18b3da825a24656"
```

## views.390.accessibility

Before:
```json
"- text: Current lifecycle status of the subscription.\n- combobox \"Current lifecycle status of the subscription.\":\n  - option \"Future\" [selected]\n  - option \"Trialing\"\n  - option \"Active\"\n  - option \"Paused\"\n  - option \"Pending Cancellation\"\n  - option \"Past Due\"\n  - option \"Unpaid\"\n  - option \"Terminated\"\n- banner:\n  - heading \"Cancellation Form\" [level=3]\n- text: Reason Code\n- combobox \"Reason Code\":\n  - option \"no_longer_needed\"\n  - option \"budget\" [selected]\n  - option \"duplicate\"\n- text: Reason\n- textbox \"Reason\": Consumer cancellation reason\n- text: Billing interval\n- combobox \"Billing interval\":\n  - option \"monthly\" [selected]\n  - option \"yearly\"\n- text: Billing amount USD\n- textbox \"Billing amount\": \"19.99\"\n- checkbox \"Whether the subscription will cancel at the natural billing period end.\"\n- text: Whether the subscription will cancel at the natural billing period end. Free-form explanation captured during cancellation workflows.\n- textbox \"Free-form explanation captured during cancellation workflows.\": Consumer cancellation reason\n- text: Timestamp when cancellation was initiated.\n- textbox \"Timestamp when cancellation was initiated.\"\n- text: ISO 4217 currency code used for billing.\n- textbox \"ISO 4217 currency code used for billing.\":\n  - /placeholder: Enter currency\n  - text: usd\n- text: Payment instrument category used for collection.\n- combobox \"Payment instrument category used for collection.\":\n  - option \"Enter payment method type\" [disabled]\n  - option \"card\" [selected]\n  - option \"ach\"\n  - option \"wire\"\n  - option \"invoice\"\n  - option \"other\"\n- text: Billing contact email address.\n- textbox \"Billing contact email address.\":\n  - /placeholder: Enter customer email\n  - text: consumer@example.test\n- text: Lifecycle event associated with the most recent timestamp mutation.\n- textbox \"Lifecycle event associated with the most recent timestamp mutation.\":\n  - /placeholder: Enter last event\n  - text: Consumer last event\n- text: Recurring price expressed in minor units (e.g., cents).\n- spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"1999\"\n- text: Recurrence cadence (monthly, yearly, quarterly, etc.).\n- textbox \"Recurrence cadence (monthly, yearly, quarterly, etc.).\":\n  - /placeholder: Enter billing interval\n  - text: monthly\n- button \"Save\"\n- group \"Screen actions\":\n  - button \"Cancel subscription\"\n  - button \"Change\"\n  - button \"Submit\""
```
After:
```json
"- text: Status\n- combobox \"Status\":\n  - option \"Future\" [selected]\n  - option \"Trialing\"\n  - option \"Active\"\n  - option \"Paused\"\n  - option \"Pending Cancellation\"\n  - option \"Past Due\"\n  - option \"Unpaid\"\n  - option \"Terminated\"\n- paragraph: Current lifecycle status of the subscription.\n- group:\n  - banner:\n    - heading \"Cancellation Form\" [level=3]\n  - text: Reason Code\n  - textbox \"Reason Code\": Consumer cancellation reason code\n  - paragraph: Structured reason code chosen from the allowedReasons parameter.\n  - text: Reason\n  - textbox \"Reason\": Consumer cancellation reason\n  - paragraph: Free-form explanation captured during cancellation workflows.\n- text: Billing interval\n- combobox \"Billing interval\":\n  - option \"monthly\" [selected]\n  - option \"yearly\"\n- paragraph: Recurrence cadence (monthly, yearly, quarterly, etc.).\n- text: Billing amount USD\n- textbox \"Billing amount\": \"19.99\"\n- paragraph: Recurring price expressed in minor units (e.g., cents).\n- checkbox \"Cancel at period end\"\n- text: Cancel at period end\n- paragraph: Whether the subscription will cancel at the natural billing period end.\n- text: Cancellation requested at\n- textbox \"Cancellation requested at\":\n  - /placeholder: Timestamp when cancellation was initiated.\n  - text: 2026-09-05T12:00\n- paragraph: Timestamp when cancellation was initiated.\n- text: Currency\n- textbox \"Currency\":\n  - /placeholder: Enter currency\n  - text: usd\n- paragraph: ISO 4217 currency code used for billing.\n- text: Payment method type\n- combobox \"Payment method type\":\n  - option \"Enter payment method type\" [disabled]\n  - option \"card\" [selected]\n  - option \"ach\"\n  - option \"wire\"\n  - option \"invoice\"\n  - option \"other\"\n- paragraph: Payment instrument category used for collection.\n- text: Customer email\n- textbox \"Customer email\":\n  - /placeholder: Enter customer email\n  - text: consumer@example.test\n- paragraph: Billing contact email address.\n- text: Last event\n- textbox \"Last event\":\n  - /placeholder: Enter last event\n  - text: Consumer last event\n- paragraph: Lifecycle event associated with the most recent timestamp mutation.\n- button \"Save\""
```

## views.390.visibleText

Before:
```json
"Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave\nCancel subscriptionChangeSubmit"
```
After:
```json
"Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
```

## views.390.values

Before:
```json
[
  {
    "element": "select",
    "name": "Current lifecycle status of the subscription.FutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "future",
    "checked": false
  },
  {
    "element": "select",
    "name": "Reason Codeno_longer_neededbudgetduplicate",
    "value": "budget",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Consumer cancellation reason",
    "checked": false
  },
  {
    "element": "ve-field-0-26",
    "name": "Billing interval",
    "value": "monthly",
    "checked": false
  },
  {
    "element": "ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "slot-field-1-5",
    "name": "Whether the subscription will cancel at the natural billing period end.",
    "value": "on",
    "checked": false
  },
  {
    "element": "slot-field-2-7",
    "name": "Free-form explanation captured during cancellation workflows.",
    "value": "Consumer cancellation reason",
    "checked": false
  },
  {
    "element": "slot-field-3-13",
    "name": "Timestamp when cancellation was initiated.",
    "value": "",
    "checked": false
  },
  {
    "element": "slot-field-4-15",
    "name": "ISO 4217 currency code used for billing.",
    "value": "usd",
    "checked": false
  },
  {
    "element": "slot-field-5-17",
    "name": "Payment instrument category used for collection.",
    "value": "card",
    "checked": false
  },
  {
    "element": "slot-field-6-19",
    "name": "Billing contact email address.",
    "value": "consumer@example.test",
    "checked": false
  },
  {
    "element": "slot-field-7-21",
    "name": "Lifecycle event associated with the most recent timestamp mutation.",
    "value": "Consumer last event",
    "checked": false
  },
  {
    "element": "slot-field-8-23",
    "name": "Recurring price expressed in minor units (e.g., cents).",
    "value": "1999",
    "checked": false
  },
  {
    "element": "slot-field-9-25",
    "name": "Recurrence cadence (monthly, yearly, quarterly, etc.).",
    "value": "monthly",
    "checked": false
  }
]
```
After:
```json
[
  {
    "element": "select",
    "name": "StatusFutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "future",
    "checked": false
  },
  {
    "element": "input",
    "name": "Reason Code",
    "value": "Consumer cancellation reason code",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Consumer cancellation reason",
    "checked": false
  },
  {
    "element": "ve-field-0-26",
    "name": "Billing interval",
    "value": "monthly",
    "checked": false
  },
  {
    "element": "ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "slot-field-1-5",
    "name": "Cancel at period end",
    "value": "on",
    "checked": false
  },
  {
    "element": "slot-field-3-13",
    "name": "Cancellation requested at",
    "value": "2026-09-05T12:00",
    "checked": false
  },
  {
    "element": "slot-field-4-15",
    "name": "Currency*",
    "value": "usd",
    "checked": false
  },
  {
    "element": "slot-field-5-17",
    "name": "Payment method type",
    "value": "card",
    "checked": false
  },
  {
    "element": "slot-field-6-19",
    "name": "Customer email",
    "value": "consumer@example.test",
    "checked": false
  },
  {
    "element": "slot-field-7-21",
    "name": "Last event*",
    "value": "Consumer last event",
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
  "elementCount": 71,
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
        "Lifecycle event associated with the most recent",
        "timestamp mutation."
      ]
    },
    {
      "element": "label",
      "text": "Recurring price expressed in minor units (e.g., cents).",
      "lines": [
        "Recurring price expressed in minor units (e.g.,",
        "cents)."
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
  "elementCount": 70,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "p",
      "text": "Structured reason code chosen from the allowedReasons parameter.",
      "lines": [
        "Structured reason code chosen from the",
        "allowedReasons parameter."
      ]
    },
    {
      "element": "p",
      "text": "Free-form explanation captured during cancellation workflows.",
      "lines": [
        "Free-form explanation captured during cancellation",
        "workflows."
      ]
    },
    {
      "element": "slot-field-1-5-help",
      "text": "Whether the subscription will cancel at the natural billing period end.",
      "lines": [
        "Whether the subscription will cancel at the natural billing",
        "period end."
      ]
    },
    {
      "element": "slot-field-7-21-help",
      "text": "Lifecycle event associated with the most recent timestamp mutation.",
      "lines": [
        "Lifecycle event associated with the most recent",
        "timestamp mutation."
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
    "id": "screen-form-11",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-title-1",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "ve-title-28",
    "component": "StatusSelector",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated"
  },
  {
    "id": "ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD"
  },
  {
    "id": "slot-field-0-3",
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
    "id": "form-field-group-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-field-group-6",
    "component": "Stack",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "",
    "component": "Textarea",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-field-group-12",
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
    "id": "form-field-group-14",
    "component": "Stack",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "form-field-group-16",
    "component": "Stack",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-field-group-18",
    "component": "Stack",
    "text": "Billing contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Billing contact email address."
  },
  {
    "id": "form-field-group-20",
    "component": "Stack",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-field-group-22",
    "component": "Stack",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-field-group-24",
    "component": "Stack",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```
After:
```json
[
  {
    "id": "screen-form-11",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
  },
  {
    "id": "form-title-1",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "ve-title-28",
    "component": "StatusSelector",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription."
  },
  {
    "id": "ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "slot-field-0-3",
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
    "id": "form-field-group-4",
    "component": "Stack",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-field-group-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-field-group-12",
    "component": "Stack",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "form-field-group-14",
    "component": "Stack",
    "text": "Currency*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Currency*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "form-field-group-16",
    "component": "Stack",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "form-field-group-18",
    "component": "Stack",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "form-field-group-20",
    "component": "Stack",
    "text": "Last event*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Last event*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-field-group-22",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-field-group-24",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```

## views.820.accessibility

Before:
```json
"- text: Current lifecycle status of the subscription.\n- combobox \"Current lifecycle status of the subscription.\":\n  - option \"Future\" [selected]\n  - option \"Trialing\"\n  - option \"Active\"\n  - option \"Paused\"\n  - option \"Pending Cancellation\"\n  - option \"Past Due\"\n  - option \"Unpaid\"\n  - option \"Terminated\"\n- banner:\n  - heading \"Cancellation Form\" [level=3]\n- text: Reason Code\n- combobox \"Reason Code\":\n  - option \"no_longer_needed\"\n  - option \"budget\" [selected]\n  - option \"duplicate\"\n- text: Reason\n- textbox \"Reason\": Consumer cancellation reason\n- text: Billing interval\n- combobox \"Billing interval\":\n  - option \"monthly\" [selected]\n  - option \"yearly\"\n- text: Billing amount USD\n- textbox \"Billing amount\": \"19.99\"\n- checkbox \"Whether the subscription will cancel at the natural billing period end.\"\n- text: Whether the subscription will cancel at the natural billing period end. Free-form explanation captured during cancellation workflows.\n- textbox \"Free-form explanation captured during cancellation workflows.\": Consumer cancellation reason\n- text: Timestamp when cancellation was initiated.\n- textbox \"Timestamp when cancellation was initiated.\"\n- text: ISO 4217 currency code used for billing.\n- textbox \"ISO 4217 currency code used for billing.\":\n  - /placeholder: Enter currency\n  - text: usd\n- text: Payment instrument category used for collection.\n- combobox \"Payment instrument category used for collection.\":\n  - option \"Enter payment method type\" [disabled]\n  - option \"card\" [selected]\n  - option \"ach\"\n  - option \"wire\"\n  - option \"invoice\"\n  - option \"other\"\n- text: Billing contact email address.\n- textbox \"Billing contact email address.\":\n  - /placeholder: Enter customer email\n  - text: consumer@example.test\n- text: Lifecycle event associated with the most recent timestamp mutation.\n- textbox \"Lifecycle event associated with the most recent timestamp mutation.\":\n  - /placeholder: Enter last event\n  - text: Consumer last event\n- text: Recurring price expressed in minor units (e.g., cents).\n- spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"1999\"\n- text: Recurrence cadence (monthly, yearly, quarterly, etc.).\n- textbox \"Recurrence cadence (monthly, yearly, quarterly, etc.).\":\n  - /placeholder: Enter billing interval\n  - text: monthly\n- button \"Save\"\n- group \"Screen actions\":\n  - button \"Cancel subscription\"\n  - button \"Change\"\n  - button \"Submit\""
```
After:
```json
"- text: Status\n- combobox \"Status\":\n  - option \"Future\" [selected]\n  - option \"Trialing\"\n  - option \"Active\"\n  - option \"Paused\"\n  - option \"Pending Cancellation\"\n  - option \"Past Due\"\n  - option \"Unpaid\"\n  - option \"Terminated\"\n- paragraph: Current lifecycle status of the subscription.\n- group:\n  - banner:\n    - heading \"Cancellation Form\" [level=3]\n  - text: Reason Code\n  - textbox \"Reason Code\": Consumer cancellation reason code\n  - paragraph: Structured reason code chosen from the allowedReasons parameter.\n  - text: Reason\n  - textbox \"Reason\": Consumer cancellation reason\n  - paragraph: Free-form explanation captured during cancellation workflows.\n- text: Billing interval\n- combobox \"Billing interval\":\n  - option \"monthly\" [selected]\n  - option \"yearly\"\n- paragraph: Recurrence cadence (monthly, yearly, quarterly, etc.).\n- text: Billing amount USD\n- textbox \"Billing amount\": \"19.99\"\n- paragraph: Recurring price expressed in minor units (e.g., cents).\n- checkbox \"Cancel at period end\"\n- text: Cancel at period end\n- paragraph: Whether the subscription will cancel at the natural billing period end.\n- text: Cancellation requested at\n- textbox \"Cancellation requested at\":\n  - /placeholder: Timestamp when cancellation was initiated.\n  - text: 2026-09-05T12:00\n- paragraph: Timestamp when cancellation was initiated.\n- text: Currency\n- textbox \"Currency\":\n  - /placeholder: Enter currency\n  - text: usd\n- paragraph: ISO 4217 currency code used for billing.\n- text: Payment method type\n- combobox \"Payment method type\":\n  - option \"Enter payment method type\" [disabled]\n  - option \"card\" [selected]\n  - option \"ach\"\n  - option \"wire\"\n  - option \"invoice\"\n  - option \"other\"\n- paragraph: Payment instrument category used for collection.\n- text: Customer email\n- textbox \"Customer email\":\n  - /placeholder: Enter customer email\n  - text: consumer@example.test\n- paragraph: Billing contact email address.\n- text: Last event\n- textbox \"Last event\":\n  - /placeholder: Enter last event\n  - text: Consumer last event\n- paragraph: Lifecycle event associated with the most recent timestamp mutation.\n- button \"Save\""
```

## views.820.visibleText

Before:
```json
"Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave\nCancel subscriptionChangeSubmit"
```
After:
```json
"Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
```

## views.820.values

Before:
```json
[
  {
    "element": "select",
    "name": "Current lifecycle status of the subscription.FutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "future",
    "checked": false
  },
  {
    "element": "select",
    "name": "Reason Codeno_longer_neededbudgetduplicate",
    "value": "budget",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Consumer cancellation reason",
    "checked": false
  },
  {
    "element": "ve-field-0-26",
    "name": "Billing interval",
    "value": "monthly",
    "checked": false
  },
  {
    "element": "ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "slot-field-1-5",
    "name": "Whether the subscription will cancel at the natural billing period end.",
    "value": "on",
    "checked": false
  },
  {
    "element": "slot-field-2-7",
    "name": "Free-form explanation captured during cancellation workflows.",
    "value": "Consumer cancellation reason",
    "checked": false
  },
  {
    "element": "slot-field-3-13",
    "name": "Timestamp when cancellation was initiated.",
    "value": "",
    "checked": false
  },
  {
    "element": "slot-field-4-15",
    "name": "ISO 4217 currency code used for billing.",
    "value": "usd",
    "checked": false
  },
  {
    "element": "slot-field-5-17",
    "name": "Payment instrument category used for collection.",
    "value": "card",
    "checked": false
  },
  {
    "element": "slot-field-6-19",
    "name": "Billing contact email address.",
    "value": "consumer@example.test",
    "checked": false
  },
  {
    "element": "slot-field-7-21",
    "name": "Lifecycle event associated with the most recent timestamp mutation.",
    "value": "Consumer last event",
    "checked": false
  },
  {
    "element": "slot-field-8-23",
    "name": "Recurring price expressed in minor units (e.g., cents).",
    "value": "1999",
    "checked": false
  },
  {
    "element": "slot-field-9-25",
    "name": "Recurrence cadence (monthly, yearly, quarterly, etc.).",
    "value": "monthly",
    "checked": false
  }
]
```
After:
```json
[
  {
    "element": "select",
    "name": "StatusFutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "future",
    "checked": false
  },
  {
    "element": "input",
    "name": "Reason Code",
    "value": "Consumer cancellation reason code",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Consumer cancellation reason",
    "checked": false
  },
  {
    "element": "ve-field-0-26",
    "name": "Billing interval",
    "value": "monthly",
    "checked": false
  },
  {
    "element": "ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "slot-field-1-5",
    "name": "Cancel at period end",
    "value": "on",
    "checked": false
  },
  {
    "element": "slot-field-3-13",
    "name": "Cancellation requested at",
    "value": "2026-09-05T12:00",
    "checked": false
  },
  {
    "element": "slot-field-4-15",
    "name": "Currency*",
    "value": "usd",
    "checked": false
  },
  {
    "element": "slot-field-5-17",
    "name": "Payment method type",
    "value": "card",
    "checked": false
  },
  {
    "element": "slot-field-6-19",
    "name": "Customer email",
    "value": "consumer@example.test",
    "checked": false
  },
  {
    "element": "slot-field-7-21",
    "name": "Last event*",
    "value": "Consumer last event",
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
  "elementCount": 71,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 70,
  "overflow": [],
  "glyphWraps": []
}
```

## views.820.regions

Before:
```json
[
  {
    "id": "screen-form-11",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-title-1",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "ve-title-28",
    "component": "StatusSelector",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated"
  },
  {
    "id": "ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD"
  },
  {
    "id": "slot-field-0-3",
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
    "id": "form-field-group-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-field-group-6",
    "component": "Stack",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "",
    "component": "Textarea",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-field-group-12",
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
    "id": "form-field-group-14",
    "component": "Stack",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "form-field-group-16",
    "component": "Stack",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-field-group-18",
    "component": "Stack",
    "text": "Billing contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Billing contact email address."
  },
  {
    "id": "form-field-group-20",
    "component": "Stack",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-field-group-22",
    "component": "Stack",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-field-group-24",
    "component": "Stack",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```
After:
```json
[
  {
    "id": "screen-form-11",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
  },
  {
    "id": "form-title-1",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "ve-title-28",
    "component": "StatusSelector",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription."
  },
  {
    "id": "ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "slot-field-0-3",
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
    "id": "form-field-group-4",
    "component": "Stack",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-field-group-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-field-group-12",
    "component": "Stack",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "form-field-group-14",
    "component": "Stack",
    "text": "Currency*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Currency*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "form-field-group-16",
    "component": "Stack",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "form-field-group-18",
    "component": "Stack",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "form-field-group-20",
    "component": "Stack",
    "text": "Last event*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Last event*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-field-group-22",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-field-group-24",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```

## views.1440.accessibility

Before:
```json
"- text: Current lifecycle status of the subscription.\n- combobox \"Current lifecycle status of the subscription.\":\n  - option \"Future\" [selected]\n  - option \"Trialing\"\n  - option \"Active\"\n  - option \"Paused\"\n  - option \"Pending Cancellation\"\n  - option \"Past Due\"\n  - option \"Unpaid\"\n  - option \"Terminated\"\n- banner:\n  - heading \"Cancellation Form\" [level=3]\n- text: Reason Code\n- combobox \"Reason Code\":\n  - option \"no_longer_needed\"\n  - option \"budget\" [selected]\n  - option \"duplicate\"\n- text: Reason\n- textbox \"Reason\": Consumer cancellation reason\n- text: Billing interval\n- combobox \"Billing interval\":\n  - option \"monthly\" [selected]\n  - option \"yearly\"\n- text: Billing amount USD\n- textbox \"Billing amount\": \"19.99\"\n- checkbox \"Whether the subscription will cancel at the natural billing period end.\"\n- text: Whether the subscription will cancel at the natural billing period end. Free-form explanation captured during cancellation workflows.\n- textbox \"Free-form explanation captured during cancellation workflows.\": Consumer cancellation reason\n- text: Timestamp when cancellation was initiated.\n- textbox \"Timestamp when cancellation was initiated.\"\n- text: ISO 4217 currency code used for billing.\n- textbox \"ISO 4217 currency code used for billing.\":\n  - /placeholder: Enter currency\n  - text: usd\n- text: Payment instrument category used for collection.\n- combobox \"Payment instrument category used for collection.\":\n  - option \"Enter payment method type\" [disabled]\n  - option \"card\" [selected]\n  - option \"ach\"\n  - option \"wire\"\n  - option \"invoice\"\n  - option \"other\"\n- text: Billing contact email address.\n- textbox \"Billing contact email address.\":\n  - /placeholder: Enter customer email\n  - text: consumer@example.test\n- text: Lifecycle event associated with the most recent timestamp mutation.\n- textbox \"Lifecycle event associated with the most recent timestamp mutation.\":\n  - /placeholder: Enter last event\n  - text: Consumer last event\n- text: Recurring price expressed in minor units (e.g., cents).\n- spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"1999\"\n- text: Recurrence cadence (monthly, yearly, quarterly, etc.).\n- textbox \"Recurrence cadence (monthly, yearly, quarterly, etc.).\":\n  - /placeholder: Enter billing interval\n  - text: monthly\n- button \"Save\"\n- group \"Screen actions\":\n  - button \"Cancel subscription\"\n  - button \"Change\"\n  - button \"Submit\""
```
After:
```json
"- text: Status\n- combobox \"Status\":\n  - option \"Future\" [selected]\n  - option \"Trialing\"\n  - option \"Active\"\n  - option \"Paused\"\n  - option \"Pending Cancellation\"\n  - option \"Past Due\"\n  - option \"Unpaid\"\n  - option \"Terminated\"\n- paragraph: Current lifecycle status of the subscription.\n- group:\n  - banner:\n    - heading \"Cancellation Form\" [level=3]\n  - text: Reason Code\n  - textbox \"Reason Code\": Consumer cancellation reason code\n  - paragraph: Structured reason code chosen from the allowedReasons parameter.\n  - text: Reason\n  - textbox \"Reason\": Consumer cancellation reason\n  - paragraph: Free-form explanation captured during cancellation workflows.\n- text: Billing interval\n- combobox \"Billing interval\":\n  - option \"monthly\" [selected]\n  - option \"yearly\"\n- paragraph: Recurrence cadence (monthly, yearly, quarterly, etc.).\n- text: Billing amount USD\n- textbox \"Billing amount\": \"19.99\"\n- paragraph: Recurring price expressed in minor units (e.g., cents).\n- checkbox \"Cancel at period end\"\n- text: Cancel at period end\n- paragraph: Whether the subscription will cancel at the natural billing period end.\n- text: Cancellation requested at\n- textbox \"Cancellation requested at\":\n  - /placeholder: Timestamp when cancellation was initiated.\n  - text: 2026-09-05T12:00\n- paragraph: Timestamp when cancellation was initiated.\n- text: Currency\n- textbox \"Currency\":\n  - /placeholder: Enter currency\n  - text: usd\n- paragraph: ISO 4217 currency code used for billing.\n- text: Payment method type\n- combobox \"Payment method type\":\n  - option \"Enter payment method type\" [disabled]\n  - option \"card\" [selected]\n  - option \"ach\"\n  - option \"wire\"\n  - option \"invoice\"\n  - option \"other\"\n- paragraph: Payment instrument category used for collection.\n- text: Customer email\n- textbox \"Customer email\":\n  - /placeholder: Enter customer email\n  - text: consumer@example.test\n- paragraph: Billing contact email address.\n- text: Last event\n- textbox \"Last event\":\n  - /placeholder: Enter last event\n  - text: Consumer last event\n- paragraph: Lifecycle event associated with the most recent timestamp mutation.\n- button \"Save\""
```

## views.1440.visibleText

Before:
```json
"Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave\nCancel subscriptionChangeSubmit"
```
After:
```json
"Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
```

## views.1440.values

Before:
```json
[
  {
    "element": "select",
    "name": "Current lifecycle status of the subscription.FutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "future",
    "checked": false
  },
  {
    "element": "select",
    "name": "Reason Codeno_longer_neededbudgetduplicate",
    "value": "budget",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Consumer cancellation reason",
    "checked": false
  },
  {
    "element": "ve-field-0-26",
    "name": "Billing interval",
    "value": "monthly",
    "checked": false
  },
  {
    "element": "ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "slot-field-1-5",
    "name": "Whether the subscription will cancel at the natural billing period end.",
    "value": "on",
    "checked": false
  },
  {
    "element": "slot-field-2-7",
    "name": "Free-form explanation captured during cancellation workflows.",
    "value": "Consumer cancellation reason",
    "checked": false
  },
  {
    "element": "slot-field-3-13",
    "name": "Timestamp when cancellation was initiated.",
    "value": "",
    "checked": false
  },
  {
    "element": "slot-field-4-15",
    "name": "ISO 4217 currency code used for billing.",
    "value": "usd",
    "checked": false
  },
  {
    "element": "slot-field-5-17",
    "name": "Payment instrument category used for collection.",
    "value": "card",
    "checked": false
  },
  {
    "element": "slot-field-6-19",
    "name": "Billing contact email address.",
    "value": "consumer@example.test",
    "checked": false
  },
  {
    "element": "slot-field-7-21",
    "name": "Lifecycle event associated with the most recent timestamp mutation.",
    "value": "Consumer last event",
    "checked": false
  },
  {
    "element": "slot-field-8-23",
    "name": "Recurring price expressed in minor units (e.g., cents).",
    "value": "1999",
    "checked": false
  },
  {
    "element": "slot-field-9-25",
    "name": "Recurrence cadence (monthly, yearly, quarterly, etc.).",
    "value": "monthly",
    "checked": false
  }
]
```
After:
```json
[
  {
    "element": "select",
    "name": "StatusFutureTrialingActivePausedPending CancellationPast DueUnpaidTerminated",
    "value": "future",
    "checked": false
  },
  {
    "element": "input",
    "name": "Reason Code",
    "value": "Consumer cancellation reason code",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "Reason",
    "value": "Consumer cancellation reason",
    "checked": false
  },
  {
    "element": "ve-field-0-26",
    "name": "Billing interval",
    "value": "monthly",
    "checked": false
  },
  {
    "element": "ve-field-0-27",
    "name": "Billing amount",
    "value": "19.99",
    "checked": false
  },
  {
    "element": "slot-field-1-5",
    "name": "Cancel at period end",
    "value": "on",
    "checked": false
  },
  {
    "element": "slot-field-3-13",
    "name": "Cancellation requested at",
    "value": "2026-09-05T12:00",
    "checked": false
  },
  {
    "element": "slot-field-4-15",
    "name": "Currency*",
    "value": "usd",
    "checked": false
  },
  {
    "element": "slot-field-5-17",
    "name": "Payment method type",
    "value": "card",
    "checked": false
  },
  {
    "element": "slot-field-6-19",
    "name": "Customer email",
    "value": "consumer@example.test",
    "checked": false
  },
  {
    "element": "slot-field-7-21",
    "name": "Last event*",
    "value": "Consumer last event",
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
  "elementCount": 71,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 70,
  "overflow": [],
  "glyphWraps": []
}
```

## views.1440.regions

Before:
```json
[
  {
    "id": "screen-form-11",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-title-1",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "ve-title-28",
    "component": "StatusSelector",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated"
  },
  {
    "id": "ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason"
  },
  {
    "id": "form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\nRecurring price expressed in minor units (e.g., cents).\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD"
  },
  {
    "id": "slot-field-0-3",
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
    "id": "form-field-group-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Whether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-field-group-6",
    "component": "Stack",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "",
    "component": "Textarea",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-field-group-12",
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
    "id": "form-field-group-14",
    "component": "Stack",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "ISO 4217 currency code used for billing."
  },
  {
    "id": "form-field-group-16",
    "component": "Stack",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-field-group-18",
    "component": "Stack",
    "text": "Billing contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Billing contact email address."
  },
  {
    "id": "form-field-group-20",
    "component": "Stack",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Lifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-field-group-22",
    "component": "Stack",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "form-field-group-24",
    "component": "Stack",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```
After:
```json
[
  {
    "id": "screen-form-11",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows.\n\nBilling interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event*\n\nLifecycle event associated with the most recent timestamp mutation.\n\nSave"
  },
  {
    "id": "form-title-1",
    "component": "Stack",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription.\n\nCancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "ve-title-28",
    "component": "StatusSelector",
    "text": "Status\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\n\nCurrent lifecycle status of the subscription."
  },
  {
    "id": "ve-title-29",
    "component": "CancellationForm",
    "text": "Cancellation Form\nReason Code\n\nStructured reason code chosen from the allowedReasons parameter.\n\nReason\n\nFree-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-fields-8",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents).\n\nCancel at period end\n\nWhether the subscription will cancel at the natural billing period end.\n\nCancellation requested at\n\nTimestamp when cancellation was initiated.\n\nCurrency*\n\nISO 4217 currency code used for billing.\n\nPayment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection.\n\nCustomer email\n\nBilling contact email address.\n\nLast event*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-field-group-2",
    "component": "Stack",
    "text": "Billing interval\nmonthly\nyearly\n\nRecurrence cadence (monthly, yearly, quarterly, etc.).\n\nBilling amount\nUSD\n\nRecurring price expressed in minor units (e.g., cents)."
  },
  {
    "id": "slot-field-0-3",
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
    "id": "form-field-group-4",
    "component": "Stack",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "",
    "component": "Checkbox",
    "text": "Cancel at period end\n\nWhether the subscription will cancel at the natural billing period end."
  },
  {
    "id": "form-field-group-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-field-group-12",
    "component": "Stack",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Cancellation requested at\n\nTimestamp when cancellation was initiated."
  },
  {
    "id": "form-field-group-14",
    "component": "Stack",
    "text": "Currency*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Currency*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "form-field-group-16",
    "component": "Stack",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "",
    "component": "Select",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "form-field-group-18",
    "component": "Stack",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "form-field-group-20",
    "component": "Stack",
    "text": "Last event*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "",
    "component": "Input",
    "text": "Last event*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-field-group-22",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-field-group-24",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "form-actions-9",
    "component": "Stack",
    "text": "Save"
  },
  {
    "id": "form-submit-10",
    "component": "Button",
    "text": "Save"
  }
]
```
