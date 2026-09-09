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
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - group \"Cancellation details\":\n      - text: Cancellation details Reason\n      - textbox \"Reason\": Budget changed for next year\n      - text: Reason code\n      - textbox \"Reason code\": customer_request\n      - checkbox \"Cancel at period end\" [checked]\n      - text: Cancel at period end\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Pending Cancellation\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: Event\n            - time: 2026-01-01T00:00:00.000Z\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n        - listitem:\n          - article:\n            - paragraph: active → pending_cancellation\n            - time: 2026-09-08T12:00:00.000Z\n            - paragraph: active\n            - paragraph: \"Reason: Budget changed for next year\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"Yes\"\n    - term: Requested at\n    - definition:\n      - time: 2026-09-08T12:00:00.000Z\n    - term: Reason\n    - definition: Budget changed for next year\n    - term: Code\n    - definition: customer_request\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"false\"\n    - tablist \"Tabs\":\n      - tab \"Billing\" [selected]\n      - button \"More tabs\": More\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 100% complete · 0 days remaining\n        - progressbar \"100% complete · 0 days remaining\"\n        - paragraph: yearly\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem: No events\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Pending Cancellation\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: Event\n            - time: Jan 1, 2026, 12:00 AM\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n        - listitem:\n          - article:\n            - paragraph: active → pending_cancellation\n            - time: Sep 8, 2026, 12:00 PM\n            - paragraph: active\n            - paragraph: \"Reason: Budget changed for next year\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"Yes\"\n    - term: Requested at\n    - definition:\n      - time: Sep 8, 2026, 12:00 PM\n    - term: Reason\n    - definition: Budget changed for next year\n    - term: Code\n    - definition: customer_request\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"No\"\n    - tablist \"Record details\":\n      - tab \"Billing\" [selected]\n      - tab \"Details\"\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 100% complete · 0 days remaining\n        - progressbar \"100% complete · 0 days remaining\"\n        - paragraph: yearly\n      - log \"Payments\":\n        - heading \"Payments\" [level=3]\n        - paragraph: $19.99 USD · failed\n        - paragraph: \"Payment method: wire\"\n        - list:\n          - listitem:\n            - strong: Last payment\n            - time: Jan 1, 2026\n          - listitem:\n            - strong: Next payment\n            - time: Jan 1, 2026\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem:\n            - article:\n              - paragraph: Event\n              - time: Jan 1, 2026, 12:00 AM\n              - paragraph: active\n              - paragraph: \"Reason: Sample record created\"\n          - listitem:\n            - article:\n              - paragraph: active → pending_cancellation\n              - time: Sep 8, 2026, 12:00 PM\n              - paragraph: active\n              - paragraph: \"Reason: Budget changed for next year\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status: Changes saved in this session."
```

## views.390.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nList\nDetail\nEdit\nTimeline\nCancellation details\nReason\nReason code\nCancel at period end\nStatus Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse\nBilling\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events\nCancel subscription\nArchive\nEdit\nView timeline\n\nChanges saved in this session."
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nList\nDetail\nEdit\nTimeline\nStatus Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancel subscription\nArchive\nEdit\nView timeline\n\nChanges saved in this session."
```

## views.390.values

Before:
```json
[
  {
    "element": "input",
    "name": "Reason",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "input",
    "name": "Reason code",
    "value": "customer_request",
    "checked": false
  },
  {
    "element": "input",
    "name": "Cancel at period end",
    "value": "on",
    "checked": true
  }
]
```
After:
```json
[]
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
      "element": "p",
      "text": "Reason: Sample record created",
      "lines": [
        "Reason: Sample record",
        "created"
      ]
    },
    {
      "element": "p",
      "text": "Reason: Budget changed for next year",
      "lines": [
        "Reason: Budget changed for",
        "next year"
      ]
    },
    {
      "element": "dt",
      "text": "Requested at",
      "lines": [
        "R",
        "e",
        "q",
        "u",
        "e",
        "s",
        "t",
        "e",
        "d",
        "a",
        "t"
      ]
    },
    {
      "element": "time",
      "text": "2026-09-08T12:00:00.000Z",
      "lines": [
        "2",
        "0",
        "2",
        "6",
        "-",
        "0",
        "9",
        "-",
        "0",
        "8",
        "T",
        "1",
        "2",
        ":",
        "0",
        "0",
        ":",
        "0",
        "0",
        ".",
        "0",
        "0",
        "0",
        "Z"
      ]
    },
    {
      "element": "dt",
      "text": "Code",
      "lines": [
        "C",
        "o",
        "d",
        "e"
      ]
    },
    {
      "element": "dd",
      "text": "customer_request",
      "lines": [
        "c",
        "u",
        "s",
        "t",
        "o",
        "m",
        "e",
        "r",
        "_",
        "r",
        "e",
        "q",
        "u",
        "e",
        "s",
        "t"
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
  "elementCount": 100,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "p",
      "text": "Reason: Sample record created",
      "lines": [
        "Reason: Sample record",
        "created"
      ]
    },
    {
      "element": "p",
      "text": "Reason: Budget changed for next year",
      "lines": [
        "Reason: Budget changed for",
        "next year"
      ]
    },
    {
      "element": "p",
      "text": "Reason: Sample record created",
      "lines": [
        "Reason: Sample record",
        "created"
      ]
    },
    {
      "element": "p",
      "text": "active → pending_cancellation",
      "lines": [
        "active →",
        "pending_cancellation"
      ]
    },
    {
      "element": "p",
      "text": "Reason: Budget changed for next year",
      "lines": [
        "Reason: Budget changed",
        "for next year"
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
    "id": "detail-screen",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse\nBilling\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse\nBilling\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nfalse"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\nNo events"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\nNo events"
  }
]
```
After:
```json
[
  {
    "id": "detail-screen",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nNo"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-slot-tab-1-6",
    "component": "PaymentTimeline",
    "text": "Payments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  }
]
```

## views.820.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - group \"Cancellation details\":\n      - text: Cancellation details Reason\n      - textbox \"Reason\": Budget changed for next year\n      - text: Reason code\n      - textbox \"Reason code\": customer_request\n      - checkbox \"Cancel at period end\" [checked]\n      - text: Cancel at period end\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Pending Cancellation\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: Event\n            - time: 2026-01-01T00:00:00.000Z\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n        - listitem:\n          - article:\n            - paragraph: active → pending_cancellation\n            - time: 2026-09-08T12:00:00.000Z\n            - paragraph: active\n            - paragraph: \"Reason: Budget changed for next year\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"Yes\"\n    - term: Requested at\n    - definition:\n      - time: 2026-09-08T12:00:00.000Z\n    - term: Reason\n    - definition: Budget changed for next year\n    - term: Code\n    - definition: customer_request\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"false\"\n    - tablist \"Tabs\":\n      - tab \"Billing\" [selected]\n      - button \"More tabs\": More\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 100% complete · 0 days remaining\n        - progressbar \"100% complete · 0 days remaining\"\n        - paragraph: yearly\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem: No events\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Pending Cancellation\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: Event\n            - time: Jan 1, 2026, 12:00 AM\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n        - listitem:\n          - article:\n            - paragraph: active → pending_cancellation\n            - time: Sep 8, 2026, 12:00 PM\n            - paragraph: active\n            - paragraph: \"Reason: Budget changed for next year\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"Yes\"\n    - term: Requested at\n    - definition:\n      - time: Sep 8, 2026, 12:00 PM\n    - term: Reason\n    - definition: Budget changed for next year\n    - term: Code\n    - definition: customer_request\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"No\"\n    - tablist \"Record details\":\n      - tab \"Billing\" [selected]\n      - tab \"Details\"\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 100% complete · 0 days remaining\n        - progressbar \"100% complete · 0 days remaining\"\n        - paragraph: yearly\n      - log \"Payments\":\n        - heading \"Payments\" [level=3]\n        - paragraph: $19.99 USD · failed\n        - paragraph: \"Payment method: wire\"\n        - list:\n          - listitem:\n            - strong: Last payment\n            - time: Jan 1, 2026\n          - listitem:\n            - strong: Next payment\n            - time: Jan 1, 2026\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem:\n            - article:\n              - paragraph: Event\n              - time: Jan 1, 2026, 12:00 AM\n              - paragraph: active\n              - paragraph: \"Reason: Sample record created\"\n          - listitem:\n            - article:\n              - paragraph: active → pending_cancellation\n              - time: Sep 8, 2026, 12:00 PM\n              - paragraph: active\n              - paragraph: \"Reason: Budget changed for next year\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status: Changes saved in this session."
```

## views.820.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nCancellation details\nReason\nReason code\nCancel at period end\nStatus Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse\nBilling\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events\nCancel subscription\nArchive\nEdit\nView timeline\n\nChanges saved in this session."
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nStatus Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancel subscription\nArchive\nEdit\nView timeline\n\nChanges saved in this session."
```

## views.820.values

Before:
```json
[
  {
    "element": "input",
    "name": "Reason",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "input",
    "name": "Reason code",
    "value": "customer_request",
    "checked": false
  },
  {
    "element": "input",
    "name": "Cancel at period end",
    "value": "on",
    "checked": true
  }
]
```
After:
```json
[]
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
  "elementCount": 101,
  "overflow": [],
  "glyphWraps": []
}
```

## views.820.regions

Before:
```json
[
  {
    "id": "detail-screen",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse\nBilling\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse\nBilling\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nfalse"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\nNo events"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\nNo events"
  }
]
```
After:
```json
[
  {
    "id": "detail-screen",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nNo"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-slot-tab-1-6",
    "component": "PaymentTimeline",
    "text": "Payments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  }
]
```

## views.1440.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - group \"Cancellation details\":\n      - text: Cancellation details Reason\n      - textbox \"Reason\": Budget changed for next year\n      - text: Reason code\n      - textbox \"Reason code\": customer_request\n      - checkbox \"Cancel at period end\" [checked]\n      - text: Cancel at period end\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Pending Cancellation\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: Event\n            - time: 2026-01-01T00:00:00.000Z\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n        - listitem:\n          - article:\n            - paragraph: active → pending_cancellation\n            - time: 2026-09-08T12:00:00.000Z\n            - paragraph: active\n            - paragraph: \"Reason: Budget changed for next year\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"Yes\"\n    - term: Requested at\n    - definition:\n      - time: 2026-09-08T12:00:00.000Z\n    - term: Reason\n    - definition: Budget changed for next year\n    - term: Code\n    - definition: customer_request\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"false\"\n    - tablist \"Tabs\":\n      - tab \"Billing\" [selected]\n      - button \"More tabs\": More\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 100% complete · 0 days remaining\n        - progressbar \"100% complete · 0 days remaining\"\n        - paragraph: yearly\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem: No events\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Pending Cancellation\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: Event\n            - time: Jan 1, 2026, 12:00 AM\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n        - listitem:\n          - article:\n            - paragraph: active → pending_cancellation\n            - time: Sep 8, 2026, 12:00 PM\n            - paragraph: active\n            - paragraph: \"Reason: Budget changed for next year\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"Yes\"\n    - term: Requested at\n    - definition:\n      - time: Sep 8, 2026, 12:00 PM\n    - term: Reason\n    - definition: Budget changed for next year\n    - term: Code\n    - definition: customer_request\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"No\"\n    - tablist \"Record details\":\n      - tab \"Billing\" [selected]\n      - tab \"Details\"\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 100% complete · 0 days remaining\n        - progressbar \"100% complete · 0 days remaining\"\n        - paragraph: yearly\n      - log \"Payments\":\n        - heading \"Payments\" [level=3]\n        - paragraph: $19.99 USD · failed\n        - paragraph: \"Payment method: wire\"\n        - list:\n          - listitem:\n            - strong: Last payment\n            - time: Jan 1, 2026\n          - listitem:\n            - strong: Next payment\n            - time: Jan 1, 2026\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem:\n            - article:\n              - paragraph: Event\n              - time: Jan 1, 2026, 12:00 AM\n              - paragraph: active\n              - paragraph: \"Reason: Sample record created\"\n          - listitem:\n            - article:\n              - paragraph: active → pending_cancellation\n              - time: Sep 8, 2026, 12:00 PM\n              - paragraph: active\n              - paragraph: \"Reason: Budget changed for next year\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status: Changes saved in this session."
```

## views.1440.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nCancellation details\nReason\nReason code\nCancel at period end\nStatus Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse\nBilling\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events\nCancel subscription\nArchive\nEdit\nView timeline\n\nChanges saved in this session."
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nStatus Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancel subscription\nArchive\nEdit\nView timeline\n\nChanges saved in this session."
```

## views.1440.values

Before:
```json
[
  {
    "element": "input",
    "name": "Reason",
    "value": "Budget changed for next year",
    "checked": false
  },
  {
    "element": "input",
    "name": "Reason code",
    "value": "customer_request",
    "checked": false
  },
  {
    "element": "input",
    "name": "Cancel at period end",
    "value": "on",
    "checked": true
  }
]
```
After:
```json
[]
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
  "elementCount": 101,
  "overflow": [],
  "glyphWraps": []
}
```

## views.1440.regions

Before:
```json
[
  {
    "id": "detail-screen",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse\nBilling\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse\nBilling\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nfalse"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\n2026-01-01T00:00:00.000Z\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\n2026-09-08T12:00:00.000Z\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nYes\nRequested at\n2026-09-08T12:00:00.000Z\nReason\nBudget changed for next year\nCode\ncustomer_request"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nfalse"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nAudit Timeline\nNo events"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nMore\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\nNo events"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\nNo events"
  }
]
```
After:
```json
[
  {
    "id": "detail-screen",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year\n\nCancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Pending Cancellation\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nYes\nRequested at\nSep 8, 2026, 12:00 PM\nReason\nBudget changed for next year\nCode\ncustomer_request"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nNo"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly\n\nPayments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nyearly"
  },
  {
    "id": "detail-slot-tab-1-6",
    "component": "PaymentTimeline",
    "text": "Payments\n\n$19.99 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nactive → pending_cancellation\n\nSep 8, 2026, 12:00 PM\n\nactive\n\nReason: Budget changed for next year"
  }
]
```
