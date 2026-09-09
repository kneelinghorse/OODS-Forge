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
"sha256:5b4f6d81fd2b2c9ff5171999fcc2521a0e9fa5fb61404507a8b33957d2ca3137"
```
After:
```json
"sha256:3eb9801320d88f01741d9bcbb0ac10f40114bf985f2203fe34aa3b9e7933c3bd"
```

## files.src/App.vue

Before:
```json
"sha256:09259224d146483fcc9489a93e2052e0c26e22d06b42bafbfbb1373ef5d46c1d"
```
After:
```json
"sha256:725f3256cf89bbea21abee5f5e34c60b92f3cd72390a92cde5023559afd50315"
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

## files.src/screens/List.vue

Before:
```json
"sha256:5210d4e7277e7688b59239397fdf867fc96dfd4563dccdadbcc8b2b0b2b396e7"
```
After:
```json
"sha256:2d7b3c369d58a6521b1a2f5632cec3ea5ff5385a6cb14b27e7111a986ae57e97"
```

## files.src/screens/Timeline.vue

Before:
```json
"sha256:d3e199393d7de6594d6866c0255911ff67139ef89e1757a8b3f681eef456230c"
```
After:
```json
"sha256:29a25a6ba0fac593c98ce5d07e8d693f591ab045678da6c19afccf711f4d6b09"
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
