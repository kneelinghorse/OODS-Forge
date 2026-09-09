# Render receipt diff

24 differences.

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
"sha256:44dd2d96a3837dd970897e58ac921a294de7ef19a3ff480a5347088b6d25a066"
```
After:
```json
"sha256:1ad736776b213d0dd315b6c10e9ff9e294ed347b5577a7467f41cfa18d34b910"
```

## errors

Before:
```json
[
  {
    "type": "console",
    "text": "In HTML, %s cannot be a descendant of <%s>.\nThis will cause a hydration error.%s <form> form \n\n  <App empty={false} fail={false} latency={180}>\n    <main className=\"workflow-app\" data-oods-workflow=\"Subscription\" data-screen=\"form\" data-selected-id=\"subscripti...\" ...>\n      <header>\n      <nav>\n      <section aria-label=\"Subscripti...\" className=\"workflow-c...\" onChangeCapture={function onChangeCapture}>\n        <label>\n>       <form onSubmit={function onSubmit}>\n          <GeneratedUI status=\"active\" stateHistory={[...]} allowedTransitions={[...]} cancelAtPeriodEnd={false} ...>\n            <OODS.Stack id=\"form-screen\" data-oods-component=\"Stack\">\n              <div ref={null} className=\"oods-stack\" data-oods-component=\"Stack\" data-direction=\"column\" ...>\n                <OODS.Stack id=\"form-scree...\" data-oods-component=\"Stack\" data-oods-state=\"success\" data-layout=\"stack\" ...>\n                  <div ref={null} className=\"oods-stack\" data-oods-component=\"Stack\" data-direction=\"column\" ...>\n                    <OODS.Stack id=\"form-form-...\" data-oods-component=\"Stack\" data-layout=\"stack\" ...>\n                      <div ref={null} className=\"oods-stack\" data-oods-component=\"Stack\" data-direction=\"column\" ...>\n                        <OODS.StatusSelector>\n                        <OODS.CancellationForm id=\"form-ve-ti...\" data-oods-component=\"Cancellati...\" reason=\"\" ...>\n>                         <form\n>                           ref={null}\n>                           className=\"oods-cancellation-form\"\n>                           data-oods-component=\"CancellationForm\"\n>                           data-form-type=\"cancellation\"\n>                           onSubmit={function onSubmit}\n>                           id=\"form-ve-title-29\"\n>                         >\n                    ...\n            ...\n      ...\n"
  },
  {
    "type": "console",
    "text": "<%s> cannot contain a nested %s.\nSee this log for the ancestor stack trace. form <form>"
  }
]
```
After:
```json
[]
```

## files.src/App.tsx

Before:
```json
"sha256:7125da0e0c5813d5d4bffb2813a22fd0415a8fa02ca4f9fb0a5ff8df3b285c07"
```
After:
```json
"sha256:323fcb74dbe121b8e16af9b34fb714b04c37ad92428bd6ee3fff10076b714b60"
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

## files.src/screens/Detail.tsx

Before:
```json
"sha256:9dd27d475f8511fdbcfa3edf78ab9619057cd726f91d0426017ab6b7599a223c"
```
After:
```json
"sha256:f48a62f6f08431ebaf42ba064e3f005b22d0f7f0e088eaa9922b6e0a8518bfee"
```

## files.src/screens/Form.tsx

Before:
```json
"sha256:1a0d7eb2c2ab7372f1db6702de35d010cc2b549306f0e3c24c006f195bf97307"
```
After:
```json
"sha256:9c1cf9b03121d04d5bcaf3aca4c0f192a30d273a39f02ce72c98401e998362bf"
```

## views.390.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Human-readable plan label shown in headers.\n    - textbox \"Human-readable plan label shown in headers.\": Team annual\n    - text: Current lifecycle status of the subscription.\n    - combobox \"Current lifecycle status of the subscription.\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - heading \"Cancellation Form\" [level=3]\n    - text: Reason Code\n    - combobox \"Reason Code\":\n      - option \"no_longer_needed\" [selected]\n      - option \"budget\"\n      - option \"duplicate\"\n    - text: Reason\n    - textbox \"Reason\": Budget changed for next year\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - checkbox \"Whether the subscription will cancel at the natural billing period end.\" [checked]\n    - text: Whether the subscription will cancel at the natural billing period end. Free-form explanation captured during cancellation workflows.\n    - textbox \"Free-form explanation captured during cancellation workflows.\": Budget changed for next year\n    - text: Timestamp when cancellation was initiated.\n    - textbox \"Timestamp when cancellation was initiated.\"\n    - text: ISO 4217 currency code used for billing.\n    - textbox \"ISO 4217 currency code used for billing.\":\n      - /placeholder: Enter currency\n      - text: usd\n    - text: Payment instrument category used for collection.\n    - combobox \"Payment instrument category used for collection.\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - text: Billing contact email address.\n    - textbox \"Billing contact email address.\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - text: Lifecycle event associated with the most recent timestamp mutation.\n    - textbox \"Lifecycle event associated with the most recent timestamp mutation.\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - text: Recurring price expressed in minor units (e.g., cents).\n    - spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"1999\"\n    - text: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - textbox \"Recurrence cadence (monthly, yearly, quarterly, etc.).\":\n      - /placeholder: Enter billing interval\n      - text: yearly\n    - button \"Save\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Change\"\n      - button \"Submit\"\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Plan name\n    - textbox \"Plan name\": Team annual\n    - text: Human-readable plan label shown in headers. Status\n    - combobox \"Status\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - paragraph: Current lifecycle status of the subscription.\n    - group:\n      - heading \"Cancellation Form\" [level=3]\n      - text: Reason Code\n      - textbox \"Reason Code\": customer_request\n      - paragraph: Structured reason code chosen from the allowedReasons parameter.\n      - text: Reason\n      - textbox \"Reason\": Budget changed for next year\n      - paragraph: Free-form explanation captured during cancellation workflows.\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - paragraph: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - paragraph: Recurring price expressed in minor units (e.g., cents).\n    - checkbox \"Cancel at period end\" [checked]\n    - text: Cancel at period end\n    - paragraph: Whether the subscription will cancel at the natural billing period end.\n    - text: Cancellation requested at\n    - textbox \"Cancellation requested at\":\n      - /placeholder: Timestamp when cancellation was initiated.\n      - text: 2026-09-08T12:00\n    - paragraph: Timestamp when cancellation was initiated.\n    - text: Currency\n    - textbox \"Currency\":\n      - /placeholder: Enter currency\n      - text: usd\n    - paragraph: ISO 4217 currency code used for billing.\n    - text: Payment method type\n    - combobox \"Payment method type\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - paragraph: Payment instrument category used for collection.\n    - text: Customer email\n    - textbox \"Customer email\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - paragraph: Billing contact email address.\n    - text: Last event\n    - textbox \"Last event\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - paragraph: Lifecycle event associated with the most recent timestamp mutation.\n    - button \"Save\"\n  - status: Changes saved in this session."
```

## views.390.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nList\nDetail\nEdit\nTimeline\nHuman-readable plan label shown in headers.\nCurrent lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave\nCancel subscription\nChange\nSubmit\n\nChanges saved in this session."
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
    "value": "no_longer_needed",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "ReasonBudget changed for next year",
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
    "name": "ISO 4217 currency code used for billing.*",
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
    "name": "Lifecycle event associated with the most recent timestamp mutation.*",
    "value": "payment_received",
    "checked": false
  },
  {
    "element": "form-slot-field-8-23",
    "name": "Recurring price expressed in minor units (e.g., cents).*",
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
    "name": "ReasonBudget changed for next year",
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
  "elementCount": 105,
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
      "element": "span",
      "text": "Free-form explanation captured during cancellation workflows.",
      "lines": [
        "Free-form explanation captured during",
        "cancellation workflows."
      ]
    },
    {
      "element": "span",
      "text": "Payment instrument category used for collection.",
      "lines": [
        "Payment instrument category used for",
        "collection."
      ]
    },
    {
      "element": "span",
      "text": "Lifecycle event associated with the most recent timestamp mutation.",
      "lines": [
        "Lifecycle event associated with the most",
        "recent timestamp mutation."
      ]
    },
    {
      "element": "span",
      "text": "Recurring price expressed in minor units (e.g., cents).",
      "lines": [
        "Recurring price expressed in minor units",
        "(e.g., cents)."
      ]
    },
    {
      "element": "span",
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
  "elementCount": 98,
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
      "element": "form-slot-field-1-5-description",
      "text": "Whether the subscription will cancel at the natural billing period end.",
      "lines": [
        "Whether the subscription will cancel at the",
        "natural billing period end."
      ]
    },
    {
      "element": "form-slot-field-3-13-description",
      "text": "Timestamp when cancellation was initiated.",
      "lines": [
        "Timestamp when cancellation was",
        "initiated."
      ]
    },
    {
      "element": "form-slot-field-5-17-description",
      "text": "Payment instrument category used for collection.",
      "lines": [
        "Payment instrument category used for",
        "collection."
      ]
    },
    {
      "element": "form-slot-field-7-21-description",
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
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-screen-form-11",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
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
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
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
    "id": "form-slot-field-1-5",
    "component": "Checkbox",
    "text": ""
  },
  {
    "id": "form-form-field-group-6",
    "component": "Stack",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-slot-field-2-7",
    "component": "Textarea",
    "text": ""
  },
  {
    "id": "form-form-field-group-12",
    "component": "Stack",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "form-slot-field-3-13",
    "component": "DatePicker",
    "text": ""
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "ISO 4217 currency code used for billing.\n*"
  },
  {
    "id": "form-slot-field-4-15",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-slot-field-5-17",
    "component": "Select",
    "text": "Enter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Billing contact email address."
  },
  {
    "id": "form-slot-field-6-19",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Lifecycle event associated with the most recent timestamp mutation.\n*"
  },
  {
    "id": "form-slot-field-7-21",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-22",
    "component": "Stack",
    "text": "Recurring price expressed in minor units (e.g., cents).\n*"
  },
  {
    "id": "form-slot-field-8-23",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-24",
    "component": "Stack",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-slot-field-9-25",
    "component": "Input",
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
    "id": "form-slot-field-1-5",
    "component": "Checkbox",
    "text": ""
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
    "id": "form-slot-field-3-13",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "Currency\n*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "form-slot-field-4-15",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "form-slot-field-5-17",
    "component": "Select",
    "text": "Enter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "form-slot-field-6-19",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Last event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-slot-field-7-21",
    "component": "Input",
    "text": ""
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
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Human-readable plan label shown in headers.\n    - textbox \"Human-readable plan label shown in headers.\": Team annual\n    - text: Current lifecycle status of the subscription.\n    - combobox \"Current lifecycle status of the subscription.\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - heading \"Cancellation Form\" [level=3]\n    - text: Reason Code\n    - combobox \"Reason Code\":\n      - option \"no_longer_needed\" [selected]\n      - option \"budget\"\n      - option \"duplicate\"\n    - text: Reason\n    - textbox \"Reason\": Budget changed for next year\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - checkbox \"Whether the subscription will cancel at the natural billing period end.\" [checked]\n    - text: Whether the subscription will cancel at the natural billing period end. Free-form explanation captured during cancellation workflows.\n    - textbox \"Free-form explanation captured during cancellation workflows.\": Budget changed for next year\n    - text: Timestamp when cancellation was initiated.\n    - textbox \"Timestamp when cancellation was initiated.\"\n    - text: ISO 4217 currency code used for billing.\n    - textbox \"ISO 4217 currency code used for billing.\":\n      - /placeholder: Enter currency\n      - text: usd\n    - text: Payment instrument category used for collection.\n    - combobox \"Payment instrument category used for collection.\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - text: Billing contact email address.\n    - textbox \"Billing contact email address.\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - text: Lifecycle event associated with the most recent timestamp mutation.\n    - textbox \"Lifecycle event associated with the most recent timestamp mutation.\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - text: Recurring price expressed in minor units (e.g., cents).\n    - spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"1999\"\n    - text: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - textbox \"Recurrence cadence (monthly, yearly, quarterly, etc.).\":\n      - /placeholder: Enter billing interval\n      - text: yearly\n    - button \"Save\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Change\"\n      - button \"Submit\"\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Plan name\n    - textbox \"Plan name\": Team annual\n    - text: Human-readable plan label shown in headers. Status\n    - combobox \"Status\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - paragraph: Current lifecycle status of the subscription.\n    - group:\n      - heading \"Cancellation Form\" [level=3]\n      - text: Reason Code\n      - textbox \"Reason Code\": customer_request\n      - paragraph: Structured reason code chosen from the allowedReasons parameter.\n      - text: Reason\n      - textbox \"Reason\": Budget changed for next year\n      - paragraph: Free-form explanation captured during cancellation workflows.\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - paragraph: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - paragraph: Recurring price expressed in minor units (e.g., cents).\n    - checkbox \"Cancel at period end\" [checked]\n    - text: Cancel at period end\n    - paragraph: Whether the subscription will cancel at the natural billing period end.\n    - text: Cancellation requested at\n    - textbox \"Cancellation requested at\":\n      - /placeholder: Timestamp when cancellation was initiated.\n      - text: 2026-09-08T12:00\n    - paragraph: Timestamp when cancellation was initiated.\n    - text: Currency\n    - textbox \"Currency\":\n      - /placeholder: Enter currency\n      - text: usd\n    - paragraph: ISO 4217 currency code used for billing.\n    - text: Payment method type\n    - combobox \"Payment method type\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - paragraph: Payment instrument category used for collection.\n    - text: Customer email\n    - textbox \"Customer email\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - paragraph: Billing contact email address.\n    - text: Last event\n    - textbox \"Last event\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - paragraph: Lifecycle event associated with the most recent timestamp mutation.\n    - button \"Save\"\n  - status: Changes saved in this session."
```

## views.820.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nHuman-readable plan label shown in headers.\nCurrent lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave\nCancel subscription\nChange\nSubmit\n\nChanges saved in this session."
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
    "value": "no_longer_needed",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "ReasonBudget changed for next year",
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
    "name": "ISO 4217 currency code used for billing.*",
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
    "name": "Lifecycle event associated with the most recent timestamp mutation.*",
    "value": "payment_received",
    "checked": false
  },
  {
    "element": "form-slot-field-8-23",
    "name": "Recurring price expressed in minor units (e.g., cents).*",
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
    "name": "ReasonBudget changed for next year",
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
  "elementCount": 106,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 99,
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
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-screen-form-11",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
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
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
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
    "id": "form-slot-field-1-5",
    "component": "Checkbox",
    "text": ""
  },
  {
    "id": "form-form-field-group-6",
    "component": "Stack",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-slot-field-2-7",
    "component": "Textarea",
    "text": ""
  },
  {
    "id": "form-form-field-group-12",
    "component": "Stack",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "form-slot-field-3-13",
    "component": "DatePicker",
    "text": ""
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "ISO 4217 currency code used for billing.\n*"
  },
  {
    "id": "form-slot-field-4-15",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-slot-field-5-17",
    "component": "Select",
    "text": "Enter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Billing contact email address."
  },
  {
    "id": "form-slot-field-6-19",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Lifecycle event associated with the most recent timestamp mutation.\n*"
  },
  {
    "id": "form-slot-field-7-21",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-22",
    "component": "Stack",
    "text": "Recurring price expressed in minor units (e.g., cents).\n*"
  },
  {
    "id": "form-slot-field-8-23",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-24",
    "component": "Stack",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-slot-field-9-25",
    "component": "Input",
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
    "id": "form-slot-field-1-5",
    "component": "Checkbox",
    "text": ""
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
    "id": "form-slot-field-3-13",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "Currency\n*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "form-slot-field-4-15",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "form-slot-field-5-17",
    "component": "Select",
    "text": "Enter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "form-slot-field-6-19",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Last event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-slot-field-7-21",
    "component": "Input",
    "text": ""
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
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Human-readable plan label shown in headers.\n    - textbox \"Human-readable plan label shown in headers.\": Team annual\n    - text: Current lifecycle status of the subscription.\n    - combobox \"Current lifecycle status of the subscription.\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - heading \"Cancellation Form\" [level=3]\n    - text: Reason Code\n    - combobox \"Reason Code\":\n      - option \"no_longer_needed\" [selected]\n      - option \"budget\"\n      - option \"duplicate\"\n    - text: Reason\n    - textbox \"Reason\": Budget changed for next year\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - checkbox \"Whether the subscription will cancel at the natural billing period end.\" [checked]\n    - text: Whether the subscription will cancel at the natural billing period end. Free-form explanation captured during cancellation workflows.\n    - textbox \"Free-form explanation captured during cancellation workflows.\": Budget changed for next year\n    - text: Timestamp when cancellation was initiated.\n    - textbox \"Timestamp when cancellation was initiated.\"\n    - text: ISO 4217 currency code used for billing.\n    - textbox \"ISO 4217 currency code used for billing.\":\n      - /placeholder: Enter currency\n      - text: usd\n    - text: Payment instrument category used for collection.\n    - combobox \"Payment instrument category used for collection.\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - text: Billing contact email address.\n    - textbox \"Billing contact email address.\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - text: Lifecycle event associated with the most recent timestamp mutation.\n    - textbox \"Lifecycle event associated with the most recent timestamp mutation.\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - text: Recurring price expressed in minor units (e.g., cents).\n    - spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"1999\"\n    - text: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - textbox \"Recurrence cadence (monthly, yearly, quarterly, etc.).\":\n      - /placeholder: Enter billing interval\n      - text: yearly\n    - button \"Save\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Change\"\n      - button \"Submit\"\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Plan name\n    - textbox \"Plan name\": Team annual\n    - text: Human-readable plan label shown in headers. Status\n    - combobox \"Status\":\n      - option \"Future\"\n      - option \"Trialing\"\n      - option \"Active\"\n      - option \"Paused\"\n      - option \"Pending Cancellation\" [selected]\n      - option \"Past Due\"\n      - option \"Unpaid\"\n      - option \"Terminated\"\n    - paragraph: Current lifecycle status of the subscription.\n    - group:\n      - heading \"Cancellation Form\" [level=3]\n      - text: Reason Code\n      - textbox \"Reason Code\": customer_request\n      - paragraph: Structured reason code chosen from the allowedReasons parameter.\n      - text: Reason\n      - textbox \"Reason\": Budget changed for next year\n      - paragraph: Free-form explanation captured during cancellation workflows.\n    - text: Billing interval\n    - combobox \"Billing interval\":\n      - option \"monthly\"\n      - option \"yearly\" [selected]\n    - paragraph: Recurrence cadence (monthly, yearly, quarterly, etc.).\n    - text: Billing amount USD\n    - textbox \"Billing amount\": \"19.99\"\n    - paragraph: Recurring price expressed in minor units (e.g., cents).\n    - checkbox \"Cancel at period end\" [checked]\n    - text: Cancel at period end\n    - paragraph: Whether the subscription will cancel at the natural billing period end.\n    - text: Cancellation requested at\n    - textbox \"Cancellation requested at\":\n      - /placeholder: Timestamp when cancellation was initiated.\n      - text: 2026-09-08T12:00\n    - paragraph: Timestamp when cancellation was initiated.\n    - text: Currency\n    - textbox \"Currency\":\n      - /placeholder: Enter currency\n      - text: usd\n    - paragraph: ISO 4217 currency code used for billing.\n    - text: Payment method type\n    - combobox \"Payment method type\":\n      - option \"Enter payment method type\" [disabled]\n      - option \"card\"\n      - option \"ach\"\n      - option \"wire\" [selected]\n      - option \"invoice\"\n      - option \"other\"\n    - paragraph: Payment instrument category used for collection.\n    - text: Customer email\n    - textbox \"Customer email\":\n      - /placeholder: Enter customer email\n      - text: customer3@example.com\n    - paragraph: Billing contact email address.\n    - text: Last event\n    - textbox \"Last event\":\n      - /placeholder: Enter last event\n      - text: payment_received\n    - paragraph: Lifecycle event associated with the most recent timestamp mutation.\n    - button \"Save\"\n  - status: Changes saved in this session."
```

## views.1440.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nHuman-readable plan label shown in headers.\nCurrent lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave\nCancel subscription\nChange\nSubmit\n\nChanges saved in this session."
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
    "value": "no_longer_needed",
    "checked": false
  },
  {
    "element": "textarea",
    "name": "ReasonBudget changed for next year",
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
    "name": "ISO 4217 currency code used for billing.*",
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
    "name": "Lifecycle event associated with the most recent timestamp mutation.*",
    "value": "payment_received",
    "checked": false
  },
  {
    "element": "form-slot-field-8-23",
    "name": "Recurring price expressed in minor units (e.g., cents).*",
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
    "name": "ReasonBudget changed for next year",
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
  "elementCount": 106,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 99,
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
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
  },
  {
    "id": "form-screen-form-11",
    "component": "Stack",
    "text": "Current lifecycle status of the subscription.\nFuture\nTrialing\nActive\nPaused\nPending Cancellation\nPast Due\nUnpaid\nTerminated\nCancellation Form\nReason Code\nno_longer_needed\nbudget\nduplicate\nReason\nBilling interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.).\nSave"
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
    "text": "Billing interval\nmonthly\nyearly\nBilling amount\nUSD\nWhether the subscription will cancel at the natural billing period end.\nFree-form explanation captured during cancellation workflows.\nTimestamp when cancellation was initiated.\nISO 4217 currency code used for billing.\n*\nPayment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\nBilling contact email address.\nLifecycle event associated with the most recent timestamp mutation.\n*\nRecurring price expressed in minor units (e.g., cents).\n*\nRecurrence cadence (monthly, yearly, quarterly, etc.)."
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
    "id": "form-slot-field-1-5",
    "component": "Checkbox",
    "text": ""
  },
  {
    "id": "form-form-field-group-6",
    "component": "Stack",
    "text": "Free-form explanation captured during cancellation workflows."
  },
  {
    "id": "form-slot-field-2-7",
    "component": "Textarea",
    "text": ""
  },
  {
    "id": "form-form-field-group-12",
    "component": "Stack",
    "text": "Timestamp when cancellation was initiated."
  },
  {
    "id": "form-slot-field-3-13",
    "component": "DatePicker",
    "text": ""
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "ISO 4217 currency code used for billing.\n*"
  },
  {
    "id": "form-slot-field-4-15",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment instrument category used for collection.\nEnter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-slot-field-5-17",
    "component": "Select",
    "text": "Enter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Billing contact email address."
  },
  {
    "id": "form-slot-field-6-19",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Lifecycle event associated with the most recent timestamp mutation.\n*"
  },
  {
    "id": "form-slot-field-7-21",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-22",
    "component": "Stack",
    "text": "Recurring price expressed in minor units (e.g., cents).\n*"
  },
  {
    "id": "form-slot-field-8-23",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-24",
    "component": "Stack",
    "text": "Recurrence cadence (monthly, yearly, quarterly, etc.)."
  },
  {
    "id": "form-slot-field-9-25",
    "component": "Input",
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
    "id": "form-slot-field-1-5",
    "component": "Checkbox",
    "text": ""
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
    "id": "form-slot-field-3-13",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-14",
    "component": "Stack",
    "text": "Currency\n*\n\nISO 4217 currency code used for billing."
  },
  {
    "id": "form-slot-field-4-15",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-16",
    "component": "Stack",
    "text": "Payment method type\nEnter payment method type\ncard\nach\nwire\ninvoice\nother\n\nPayment instrument category used for collection."
  },
  {
    "id": "form-slot-field-5-17",
    "component": "Select",
    "text": "Enter payment method type\ncard\nach\nwire\ninvoice\nother"
  },
  {
    "id": "form-form-field-group-18",
    "component": "Stack",
    "text": "Customer email\n\nBilling contact email address."
  },
  {
    "id": "form-slot-field-6-19",
    "component": "Input",
    "text": ""
  },
  {
    "id": "form-form-field-group-20",
    "component": "Stack",
    "text": "Last event\n*\n\nLifecycle event associated with the most recent timestamp mutation."
  },
  {
    "id": "form-slot-field-7-21",
    "component": "Input",
    "text": ""
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
