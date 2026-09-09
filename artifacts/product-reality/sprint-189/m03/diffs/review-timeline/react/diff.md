# Render receipt diff

21 differences.

## schemaHash

Before:
```json
"sha256:6aca09f3fe5d622fb23c7a4f155b590f0d80575f3e853abe8d16b5fa3094aea3"
```
After:
```json
"sha256:3fc4474ad506b05d137c7a22e8e056ea2907cd8f2b1bd906808b00fd7db86787"
```

## artifactContentHash

Before:
```json
"sha256:4d225b4b38f67b0b07e2f5e833eb79ab2d9c0185e617722a9816140edea67c4c"
```
After:
```json
"sha256:44dd2d96a3837dd970897e58ac921a294de7ef19a3ff480a5347088b6d25a066"
```

## files.src/App.tsx

Before:
```json
"sha256:de7fc175e52b25ca2e5671a5b39a339705343791f0c7fc69524d9aef410b388e"
```
After:
```json
"sha256:7125da0e0c5813d5d4bffb2813a22fd0415a8fa02ca4f9fb0a5ff8df3b285c07"
```

## files.src/actions.ts

Before:
```json
"sha256:358299998a1455f2679149c5eb40da0b9747a19283a82eaa594f49f576436fb6"
```
After:
```json
"sha256:fef067af24a8842e4a1f8af22432d1ae1aa824490fc277bfc8dee92cf88d7637"
```

## files.src/app.css

Before:
```json
"sha256:f43b46c08d98bf049ae9f72ff1822072fe725670d1b7ce47e77d75bf3863ecf1"
```
After:
```json
"sha256:9d5d28169d1dd6a30f9e89057fac0841779b2bb38b63ba03038a13061d8eb3d9"
```

## files.src/application.ts

Before:
```json
"sha256:3b26488a83aabbe088afc2e5d257bd8ffa15d8993c1a55e34f90d791cc2037c7"
```
After:
```json
"sha256:a8fae4d9a5c22e2863df338ecb073b840ffe94f254bd4fbfb5fee90252d85868"
```

## files.src/screens/List.tsx

Before:
```json
"sha256:2093ad6d9ea6c995cc2b187b9e373d6653400a375b7e3d528d35c4055e8f32cf"
```
After:
```json
"sha256:e50843da34a4bfb2a83912d17fcad45d20392a0019347408bcf99bb21749bd8d"
```

## files.src/screens/Timeline.tsx

Before:
```json
"sha256:87c7079bb4b147d533d99227bf08b266fea19a474e79518f22c617f2be95219a"
```
After:
```json
"sha256:47326f7e3bcb9c4b8f8cc9abaf71e37640bab427986da84012b201a76223dd3f"
```

## files.src/store.ts

Before:
```json
"sha256:28b00d7da7aa41fb566cf104836cca4a2b7f17e1ffda06d23c5d7b5f8a10a452"
```
After:
```json
"sha256:fe4dc1083e012f85c32d0ddd229ba1e42011beeb3464b4a199a3bf57b86094ce"
```

## views.390.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: \"1999\"\n    - log \"Payment events\":\n      - heading \"Payment events\" [level=3]\n      - paragraph: $19.99 USD · failed\n      - list:\n        - listitem:\n          - strong: Last payment\n          - time: Jan 1, 2026\n        - listitem:\n          - strong: Next payment\n          - time: Jan 1, 2026\n    - list \"Lifecycle history\":\n      - listitem:\n        - strong: active\n        - time: 2026-01-01T00:00:00.000Z\n        - paragraph: Sample record created\n      - listitem:\n        - strong: pending cancellation\n        - time: 2026-09-08T12:00:00.000Z\n        - paragraph: Budget changed for next year\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Team annual $19.99 · yearly\n    - list \"Lifecycle history\":\n      - listitem:\n        - strong: active\n        - time: Jan 1, 2026, 12:00 AM\n        - paragraph: Sample record created\n      - listitem:\n        - region \"Payment event\":\n          - strong: Last payment\n          - time: Jan 1, 2026, 12:00 AM\n          - paragraph: $19.99 · yearly\n      - listitem:\n        - region \"Payment event\":\n          - strong: Next payment\n          - time: Jan 1, 2026, 12:00 AM\n          - paragraph: $19.99 · yearly\n      - listitem:\n        - strong: pending cancellation\n        - time: Sep 8, 2026, 12:00 PM\n        - paragraph: Budget changed for next year\n  - status: Changes saved in this session."
```

## views.390.visibleText

Before:
```json
null
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nList\nDetail\nEdit\nTimeline\nTeam annual\n$19.99 · yearly\nactive\nJan 1, 2026, 12:00 AM\n\nSample record created\n\nLast payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\nNext payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\npending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year\n\nChanges saved in this session."
```

## views.390.measurements

Before:
```json
{
  "viewportWidth": 390,
  "documentWidth": 390,
  "elementCount": 46,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 390,
  "documentWidth": 390,
  "elementCount": 42,
  "overflow": [],
  "glyphWraps": []
}
```

## views.390.regions

Before:
```json
[
  {
    "id": "timeline-screen",
    "component": "Stack",
    "text": "1999\nPayment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-screen-timeline-14",
    "component": "Stack",
    "text": "1999\nPayment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-timeline-header-1",
    "component": "Stack",
    "text": "1999"
  },
  {
    "id": "timeline-slot-header-2",
    "component": "Text",
    "text": "1999"
  },
  {
    "id": "timeline-timeline-entries-13",
    "component": "Stack",
    "text": "Payment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-timeline-entry-3",
    "component": "Card",
    "text": "Payment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-slot-entry-0-4",
    "component": "PaymentEventTimeline",
    "text": "Payment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-timeline-entry-5",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-1-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-timeline-entry-7",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-2-8",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-timeline-entry-9",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-3-10",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-timeline-entry-11",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-4-12",
    "component": "Stack",
    "text": ""
  }
]
```
After:
```json
[
  {
    "id": "timeline-screen",
    "component": "Stack",
    "text": "Team annual\n$19.99 · yearly\nactive\nJan 1, 2026, 12:00 AM\n\nSample record created\n\nLast payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\nNext payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\npending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year"
  },
  {
    "id": "timeline-screen-timeline-14",
    "component": "Stack",
    "text": "Team annual\n$19.99 · yearly\nactive\nJan 1, 2026, 12:00 AM\n\nSample record created\n\nLast payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\nNext payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\npending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year"
  },
  {
    "id": "timeline-timeline-header-1",
    "component": "Stack",
    "text": "Team annual\n$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-header-1-title",
    "component": "Text",
    "text": "Team annual"
  },
  {
    "id": "timeline-timeline-header-1-billing",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-entries-13-entry-0",
    "component": "Card",
    "text": "active\nJan 1, 2026, 12:00 AM\n\nSample record created"
  },
  {
    "id": "timeline-timeline-entries-13-entry-1",
    "component": "Card",
    "text": "Last payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-slot-entry-0-4-1",
    "component": "PaymentEventTimeline",
    "text": "Last payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-entries-13-entry-2",
    "component": "Card",
    "text": "Next payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-slot-entry-0-4-2",
    "component": "PaymentEventTimeline",
    "text": "Next payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-entries-13-entry-3",
    "component": "Card",
    "text": "pending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year"
  }
]
```

## views.820.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: \"1999\"\n    - log \"Payment events\":\n      - heading \"Payment events\" [level=3]\n      - paragraph: $19.99 USD · failed\n      - list:\n        - listitem:\n          - strong: Last payment\n          - time: Jan 1, 2026\n        - listitem:\n          - strong: Next payment\n          - time: Jan 1, 2026\n    - list \"Lifecycle history\":\n      - listitem:\n        - strong: active\n        - time: 2026-01-01T00:00:00.000Z\n        - paragraph: Sample record created\n      - listitem:\n        - strong: pending cancellation\n        - time: 2026-09-08T12:00:00.000Z\n        - paragraph: Budget changed for next year\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Team annual $19.99 · yearly\n    - list \"Lifecycle history\":\n      - listitem:\n        - strong: active\n        - time: Jan 1, 2026, 12:00 AM\n        - paragraph: Sample record created\n      - listitem:\n        - region \"Payment event\":\n          - strong: Last payment\n          - time: Jan 1, 2026, 12:00 AM\n          - paragraph: $19.99 · yearly\n      - listitem:\n        - region \"Payment event\":\n          - strong: Next payment\n          - time: Jan 1, 2026, 12:00 AM\n          - paragraph: $19.99 · yearly\n      - listitem:\n        - strong: pending cancellation\n        - time: Sep 8, 2026, 12:00 PM\n        - paragraph: Budget changed for next year\n  - status: Changes saved in this session."
```

## views.820.visibleText

Before:
```json
null
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nTeam annual\n$19.99 · yearly\nactive\nJan 1, 2026, 12:00 AM\n\nSample record created\n\nLast payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\nNext payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\npending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year\n\nChanges saved in this session."
```

## views.820.measurements

Before:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 47,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 43,
  "overflow": [],
  "glyphWraps": []
}
```

## views.820.regions

Before:
```json
[
  {
    "id": "timeline-screen",
    "component": "Stack",
    "text": "1999\nPayment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-screen-timeline-14",
    "component": "Stack",
    "text": "1999\nPayment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-timeline-header-1",
    "component": "Stack",
    "text": "1999"
  },
  {
    "id": "timeline-slot-header-2",
    "component": "Text",
    "text": "1999"
  },
  {
    "id": "timeline-timeline-entries-13",
    "component": "Stack",
    "text": "Payment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-timeline-entry-3",
    "component": "Card",
    "text": "Payment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-slot-entry-0-4",
    "component": "PaymentEventTimeline",
    "text": "Payment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-timeline-entry-5",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-1-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-timeline-entry-7",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-2-8",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-timeline-entry-9",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-3-10",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-timeline-entry-11",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-4-12",
    "component": "Stack",
    "text": ""
  }
]
```
After:
```json
[
  {
    "id": "timeline-screen",
    "component": "Stack",
    "text": "Team annual\n$19.99 · yearly\nactive\nJan 1, 2026, 12:00 AM\n\nSample record created\n\nLast payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\nNext payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\npending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year"
  },
  {
    "id": "timeline-screen-timeline-14",
    "component": "Stack",
    "text": "Team annual\n$19.99 · yearly\nactive\nJan 1, 2026, 12:00 AM\n\nSample record created\n\nLast payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\nNext payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\npending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year"
  },
  {
    "id": "timeline-timeline-header-1",
    "component": "Stack",
    "text": "Team annual\n$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-header-1-title",
    "component": "Text",
    "text": "Team annual"
  },
  {
    "id": "timeline-timeline-header-1-billing",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-entries-13-entry-0",
    "component": "Card",
    "text": "active\nJan 1, 2026, 12:00 AM\n\nSample record created"
  },
  {
    "id": "timeline-timeline-entries-13-entry-1",
    "component": "Card",
    "text": "Last payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-slot-entry-0-4-1",
    "component": "PaymentEventTimeline",
    "text": "Last payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-entries-13-entry-2",
    "component": "Card",
    "text": "Next payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-slot-entry-0-4-2",
    "component": "PaymentEventTimeline",
    "text": "Next payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-entries-13-entry-3",
    "component": "Card",
    "text": "pending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year"
  }
]
```

## views.1440.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: \"1999\"\n    - log \"Payment events\":\n      - heading \"Payment events\" [level=3]\n      - paragraph: $19.99 USD · failed\n      - list:\n        - listitem:\n          - strong: Last payment\n          - time: Jan 1, 2026\n        - listitem:\n          - strong: Next payment\n          - time: Jan 1, 2026\n    - list \"Lifecycle history\":\n      - listitem:\n        - strong: active\n        - time: 2026-01-01T00:00:00.000Z\n        - paragraph: Sample record created\n      - listitem:\n        - strong: pending cancellation\n        - time: 2026-09-08T12:00:00.000Z\n        - paragraph: Budget changed for next year\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Team annual\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - text: Team annual $19.99 · yearly\n    - list \"Lifecycle history\":\n      - listitem:\n        - strong: active\n        - time: Jan 1, 2026, 12:00 AM\n        - paragraph: Sample record created\n      - listitem:\n        - region \"Payment event\":\n          - strong: Last payment\n          - time: Jan 1, 2026, 12:00 AM\n          - paragraph: $19.99 · yearly\n      - listitem:\n        - region \"Payment event\":\n          - strong: Next payment\n          - time: Jan 1, 2026, 12:00 AM\n          - paragraph: $19.99 · yearly\n      - listitem:\n        - strong: pending cancellation\n        - time: Sep 8, 2026, 12:00 PM\n        - paragraph: Budget changed for next year\n  - status: Changes saved in this session."
```

## views.1440.visibleText

Before:
```json
null
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nTeam annual\nLocal workspace\nList\nDetail\nEdit\nTimeline\nTeam annual\n$19.99 · yearly\nactive\nJan 1, 2026, 12:00 AM\n\nSample record created\n\nLast payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\nNext payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\npending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year\n\nChanges saved in this session."
```

## views.1440.measurements

Before:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 47,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 43,
  "overflow": [],
  "glyphWraps": []
}
```

## views.1440.regions

Before:
```json
[
  {
    "id": "timeline-screen",
    "component": "Stack",
    "text": "1999\nPayment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-screen-timeline-14",
    "component": "Stack",
    "text": "1999\nPayment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-timeline-header-1",
    "component": "Stack",
    "text": "1999"
  },
  {
    "id": "timeline-slot-header-2",
    "component": "Text",
    "text": "1999"
  },
  {
    "id": "timeline-timeline-entries-13",
    "component": "Stack",
    "text": "Payment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-timeline-entry-3",
    "component": "Card",
    "text": "Payment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-slot-entry-0-4",
    "component": "PaymentEventTimeline",
    "text": "Payment events\n\n$19.99 USD · failed\n\nLast payment\nJan 1, 2026\nNext payment\nJan 1, 2026"
  },
  {
    "id": "timeline-timeline-entry-5",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-1-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-timeline-entry-7",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-2-8",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-timeline-entry-9",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-3-10",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-timeline-entry-11",
    "component": "Card",
    "text": ""
  },
  {
    "id": "timeline-slot-entry-4-12",
    "component": "Stack",
    "text": ""
  }
]
```
After:
```json
[
  {
    "id": "timeline-screen",
    "component": "Stack",
    "text": "Team annual\n$19.99 · yearly\nactive\nJan 1, 2026, 12:00 AM\n\nSample record created\n\nLast payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\nNext payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\npending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year"
  },
  {
    "id": "timeline-screen-timeline-14",
    "component": "Stack",
    "text": "Team annual\n$19.99 · yearly\nactive\nJan 1, 2026, 12:00 AM\n\nSample record created\n\nLast payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\nNext payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly\n\npending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year"
  },
  {
    "id": "timeline-timeline-header-1",
    "component": "Stack",
    "text": "Team annual\n$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-header-1-title",
    "component": "Text",
    "text": "Team annual"
  },
  {
    "id": "timeline-timeline-header-1-billing",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-entries-13-entry-0",
    "component": "Card",
    "text": "active\nJan 1, 2026, 12:00 AM\n\nSample record created"
  },
  {
    "id": "timeline-timeline-entries-13-entry-1",
    "component": "Card",
    "text": "Last payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-slot-entry-0-4-1",
    "component": "PaymentEventTimeline",
    "text": "Last payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-entries-13-entry-2",
    "component": "Card",
    "text": "Next payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-slot-entry-0-4-2",
    "component": "PaymentEventTimeline",
    "text": "Next payment\nJan 1, 2026, 12:00 AM\n\n$19.99 · yearly"
  },
  {
    "id": "timeline-timeline-entries-13-entry-3",
    "component": "Card",
    "text": "pending cancellation\nSep 8, 2026, 12:00 PM\n\nBudget changed for next year"
  }
]
```
