# Render receipt diff

15 differences.

## artifactContentHash

Before:
```json
"sha256:1ad736776b213d0dd315b6c10e9ff9e294ed347b5577a7467f41cfa18d34b910"
```
After:
```json
"sha256:69b5dd6076d5f7a28779c9700e71d1217c539eecc52cba29b8ba211ef3322470"
```

## files.src/sample-data.ts

Before:
```json
"sha256:94e8c77058e9cf40b3c0560e2d96fc782447de291f3045ba7359abdce6682529"
```
After:
```json
"sha256:158948fec9e9aa2b84939ebdb4a0486a2833b6de5e19a27668d953c744a9f695"
```

## files.src/store.ts

Before:
```json
"sha256:fe4dc1083e012f85c32d0ddd229ba1e42011beeb3464b4a199a3bf57b86094ce"
```
After:
```json
"sha256:6e28fff21ef055e6ca3fe8514c08da6da6f50f1d237375a94d94d2c6abf3a99a"
```

## views.390.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscription 03\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Active\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: Event\n            - time: Jan 1, 2026, 12:00 AM\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"No\"\n    - term: Requested at\n    - definition: Jan 1, 2026, 12:00 AM\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"No\"\n    - tablist \"Record details\":\n      - tab \"Billing\" [selected]\n      - tab \"Details\"\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 100% complete · 0 days remaining\n        - progressbar \"100% complete · 0 days remaining\"\n        - paragraph: monthly\n      - log \"Payments\":\n        - heading \"Payments\" [level=3]\n        - paragraph: $57.00 USD · failed\n        - paragraph: \"Payment method: wire\"\n        - list:\n          - listitem:\n            - strong: Last payment\n            - time: Jan 1, 2026\n          - listitem:\n            - strong: Next payment\n            - time: Jan 1, 2026\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem:\n            - article:\n              - paragraph: Event\n              - time: Jan 1, 2026, 12:00 AM\n              - paragraph: active\n              - paragraph: \"Reason: Sample record created\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status"
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscription 03\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Active\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: billing_cycle_started\n            - time: Sep 1, 2026, 12:00 PM\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"No\"\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"No\"\n    - tablist \"Record details\":\n      - tab \"Billing\" [selected]\n      - tab \"Details\"\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 23% complete · 23 days remaining\n        - progressbar \"23% complete · 23 days remaining\"\n        - paragraph: monthly\n      - log \"Payments\":\n        - heading \"Payments\" [level=3]\n        - paragraph: $57.00 USD · failed\n        - paragraph: \"Payment method: wire\"\n        - list:\n          - listitem:\n            - strong: Last payment\n            - time: Sep 1, 2026\n          - listitem:\n            - strong: Next payment\n            - time: Oct 1, 2026\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem:\n            - article:\n              - paragraph: billing_cycle_started\n              - time: Sep 1, 2026, 12:00 PM\n              - paragraph: active\n              - paragraph: \"Reason: Sample record created\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status"
```

## views.390.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscription 03\nList\nDetail\nEdit\nTimeline\nStatus Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancel subscription\nArchive\nEdit\nView timeline"
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscription 03\nList\nDetail\nEdit\nTimeline\nStatus Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancel subscription\nArchive\nEdit\nView timeline"
```

## views.390.measurements

Before:
```json
{
  "viewportWidth": 390,
  "documentWidth": 390,
  "elementCount": 83,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "p",
      "text": "Sample record created",
      "lines": [
        "Sample record",
        "created"
      ]
    },
    {
      "element": "p",
      "text": "Sample record created",
      "lines": [
        "Sample record",
        "created"
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
  "elementCount": 80,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "p",
      "text": "Sample record created",
      "lines": [
        "Sample record",
        "created"
      ]
    },
    {
      "element": "p",
      "text": "Sample record created",
      "lines": [
        "Sample record",
        "created"
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
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nNo"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nmonthly"
  },
  {
    "id": "detail-slot-tab-1-6",
    "component": "PaymentTimeline",
    "text": "Payments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  }
]
```
After:
```json
[
  {
    "id": "detail-screen",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nNo"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nNo"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n23% complete · 23 days remaining\n\nmonthly"
  },
  {
    "id": "detail-slot-tab-1-6",
    "component": "PaymentTimeline",
    "text": "Payments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  }
]
```

## views.820.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscription 03\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Active\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: Event\n            - time: Jan 1, 2026, 12:00 AM\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"No\"\n    - term: Requested at\n    - definition: Jan 1, 2026, 12:00 AM\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"No\"\n    - tablist \"Record details\":\n      - tab \"Billing\" [selected]\n      - tab \"Details\"\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 100% complete · 0 days remaining\n        - progressbar \"100% complete · 0 days remaining\"\n        - paragraph: monthly\n      - log \"Payments\":\n        - heading \"Payments\" [level=3]\n        - paragraph: $57.00 USD · failed\n        - paragraph: \"Payment method: wire\"\n        - list:\n          - listitem:\n            - strong: Last payment\n            - time: Jan 1, 2026\n          - listitem:\n            - strong: Next payment\n            - time: Jan 1, 2026\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem:\n            - article:\n              - paragraph: Event\n              - time: Jan 1, 2026, 12:00 AM\n              - paragraph: active\n              - paragraph: \"Reason: Sample record created\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status"
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscription 03\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Active\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: billing_cycle_started\n            - time: Sep 1, 2026, 12:00 PM\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"No\"\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"No\"\n    - tablist \"Record details\":\n      - tab \"Billing\" [selected]\n      - tab \"Details\"\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 23% complete · 23 days remaining\n        - progressbar \"23% complete · 23 days remaining\"\n        - paragraph: monthly\n      - log \"Payments\":\n        - heading \"Payments\" [level=3]\n        - paragraph: $57.00 USD · failed\n        - paragraph: \"Payment method: wire\"\n        - list:\n          - listitem:\n            - strong: Last payment\n            - time: Sep 1, 2026\n          - listitem:\n            - strong: Next payment\n            - time: Oct 1, 2026\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem:\n            - article:\n              - paragraph: billing_cycle_started\n              - time: Sep 1, 2026, 12:00 PM\n              - paragraph: active\n              - paragraph: \"Reason: Sample record created\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status"
```

## views.820.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscription 03\nLocal workspace\nList\nDetail\nEdit\nTimeline\nStatus Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancel subscription\nArchive\nEdit\nView timeline"
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscription 03\nLocal workspace\nList\nDetail\nEdit\nTimeline\nStatus Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancel subscription\nArchive\nEdit\nView timeline"
```

## views.820.measurements

Before:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 84,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 81,
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
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nNo"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nmonthly"
  },
  {
    "id": "detail-slot-tab-1-6",
    "component": "PaymentTimeline",
    "text": "Payments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  }
]
```
After:
```json
[
  {
    "id": "detail-screen",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nNo"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nNo"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n23% complete · 23 days remaining\n\nmonthly"
  },
  {
    "id": "detail-slot-tab-1-6",
    "component": "PaymentTimeline",
    "text": "Payments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  }
]
```

## views.1440.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscription 03\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Active\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: Event\n            - time: Jan 1, 2026, 12:00 AM\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"No\"\n    - term: Requested at\n    - definition: Jan 1, 2026, 12:00 AM\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"No\"\n    - tablist \"Record details\":\n      - tab \"Billing\" [selected]\n      - tab \"Details\"\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 100% complete · 0 days remaining\n        - progressbar \"100% complete · 0 days remaining\"\n        - paragraph: monthly\n      - log \"Payments\":\n        - heading \"Payments\" [level=3]\n        - paragraph: $57.00 USD · failed\n        - paragraph: \"Payment method: wire\"\n        - list:\n          - listitem:\n            - strong: Last payment\n            - time: Jan 1, 2026\n          - listitem:\n            - strong: Next payment\n            - time: Jan 1, 2026\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem:\n            - article:\n              - paragraph: Event\n              - time: Jan 1, 2026, 12:00 AM\n              - paragraph: active\n              - paragraph: \"Reason: Sample record created\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status"
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscription 03\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - log \"Status Timeline\":\n      - heading \"Status Timeline\" [level=3]\n      - paragraph: \"Current status: Active\"\n      - list:\n        - listitem:\n          - article:\n            - paragraph: billing_cycle_started\n            - time: Sep 1, 2026, 12:00 PM\n            - paragraph: active\n            - paragraph: \"Reason: Sample record created\"\n    - heading \"Cancellation Summary\" [level=3]\n    - term: Cancel at period end\n    - definition: \"No\"\n    - heading \"Archive Summary\" [level=3]\n    - term: Archived\n    - definition: \"No\"\n    - tablist \"Record details\":\n      - tab \"Billing\" [selected]\n      - tab \"Details\"\n    - tabpanel \"Billing\":\n      - region \"Billing cycle\":\n        - heading \"Billing cycle\" [level=3]\n        - paragraph: 23% complete · 23 days remaining\n        - progressbar \"23% complete · 23 days remaining\"\n        - paragraph: monthly\n      - log \"Payments\":\n        - heading \"Payments\" [level=3]\n        - paragraph: $57.00 USD · failed\n        - paragraph: \"Payment method: wire\"\n        - list:\n          - listitem:\n            - strong: Last payment\n            - time: Sep 1, 2026\n          - listitem:\n            - strong: Next payment\n            - time: Oct 1, 2026\n    - complementary:\n      - log \"Audit Timeline\":\n        - heading \"Audit Timeline\" [level=3]\n        - list:\n          - listitem:\n            - article:\n              - paragraph: billing_cycle_started\n              - time: Sep 1, 2026, 12:00 PM\n              - paragraph: active\n              - paragraph: \"Reason: Sample record created\"\n    - group \"Screen actions\":\n      - button \"Cancel subscription\"\n      - button \"Archive\"\n      - button \"Edit\"\n      - button \"View timeline\"\n  - status"
```

## views.1440.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscription 03\nLocal workspace\nList\nDetail\nEdit\nTimeline\nStatus Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancel subscription\nArchive\nEdit\nView timeline"
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscription 03\nLocal workspace\nList\nDetail\nEdit\nTimeline\nStatus Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancel subscription\nArchive\nEdit\nView timeline"
```

## views.1440.measurements

Before:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 84,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 81,
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
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Active\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nNo\nRequested at\nJan 1, 2026, 12:00 AM"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nNo"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026\nAudit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nDetails\nBilling cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n100% complete · 0 days remaining\n\nmonthly"
  },
  {
    "id": "detail-slot-tab-1-6",
    "component": "PaymentTimeline",
    "text": "Payments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\n\nEvent\n\nJan 1, 2026, 12:00 AM\n\nactive\n\nReason: Sample record created"
  }
]
```
After:
```json
[
  {
    "id": "detail-screen",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-screen-detail-13",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo\nBilling\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-header-1",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-slot-header-2",
    "component": "Stack",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created\n\nCancellation Summary\nCancel at period end\nNo\nArchive Summary\nArchived\nNo"
  },
  {
    "id": "detail-ve-header-26",
    "component": "StatusTimeline",
    "text": "Status Timeline\n\nCurrent status: Active\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-ve-header-27",
    "component": "CancellationSummary",
    "text": "Cancellation Summary\nCancel at period end\nNo"
  },
  {
    "id": "detail-ve-header-28",
    "component": "ArchiveSummary",
    "text": "Archive Summary\nArchived\nNo"
  },
  {
    "id": "detail-detail-body-10",
    "component": "Card",
    "text": "Billing\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026\nAudit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-detail-tabs-9",
    "component": "Tabs",
    "text": "Billing\nDetails\nBilling cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026"
  },
  {
    "id": "detail-detail-tab-panel-3",
    "component": "Stack",
    "text": "Billing cycle\n\n23% complete · 23 days remaining\n\nmonthly\n\nPayments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026"
  },
  {
    "id": "detail-slot-tab-0-4",
    "component": "CycleProgressCard",
    "text": "Billing cycle\n\n23% complete · 23 days remaining\n\nmonthly"
  },
  {
    "id": "detail-slot-tab-1-6",
    "component": "PaymentTimeline",
    "text": "Payments\n\n$57.00 USD · failed\n\nPayment method: wire\n\nLast payment\nSep 1, 2026\nNext payment\nOct 1, 2026"
  },
  {
    "id": "detail-detail-meta-11",
    "component": "Stack",
    "text": "Audit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  },
  {
    "id": "detail-slot-metadata-12",
    "component": "AuditTimeline",
    "text": "Audit Timeline\n\nbilling_cycle_started\n\nSep 1, 2026, 12:00 PM\n\nactive\n\nReason: Sample record created"
  }
]
```
