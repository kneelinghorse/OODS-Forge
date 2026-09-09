# Render receipt diff

27 differences.

## schemaHash

Before:
```json
"sha256:6aca09f3fe5d622fb23c7a4f155b590f0d80575f3e853abe8d16b5fa3094aea3"
```
After:
```json
"sha256:1c047ae408a6c8724958b82eb3752e17665a8e77ee902071cd5cd46468de5f5f"
```

## artifactContentHash

Before:
```json
"sha256:5b4f6d81fd2b2c9ff5171999fcc2521a0e9fa5fb61404507a8b33957d2ca3137"
```
After:
```json
"sha256:83d27f1ddcfa33d9d3d1546fc2a920d276caca50c9b5ad3ea41619c70fef86d0"
```

## files.src/App.vue

Before:
```json
"sha256:09259224d146483fcc9489a93e2052e0c26e22d06b42bafbfbb1373ef5d46c1d"
```
After:
```json
"sha256:f2b1d285bf9dea14f1c2e8568f9d47b542abcfb9c9bfcabc1dd7bd3ed6bf8f81"
```

## files.src/actions.ts

Before:
```json
"sha256:358299998a1455f2679149c5eb40da0b9747a19283a82eaa594f49f576436fb6"
```
After:
```json
"sha256:7885a54420c4faa0f50c1926de2469fca71ade8bda029b87618003a0572ddbee"
```

## files.src/app.css

Before:
```json
"sha256:f43b46c08d98bf049ae9f72ff1822072fe725670d1b7ce47e77d75bf3863ecf1"
```
After:
```json
"sha256:142fce8b38ccc442764efa88cb15dc3e8c6293fbad34a9f787a47d5529e34dca"
```

## files.src/application.ts

Before:
```json
"sha256:3b26488a83aabbe088afc2e5d257bd8ffa15d8993c1a55e34f90d791cc2037c7"
```
After:
```json
"sha256:78caf7f46e197dff42bd50d0871b7520cd7db624381e8594adc443e882d9902c"
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
"sha256:6e28fff21ef055e6ca3fe8514c08da6da6f50f1d237375a94d94d2c6abf3a99a"
```

## views.390.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Find subscriptions\":\n    - text: Search\n    - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n  - region \"Subscription screen\":\n    - search \"Search…\":\n      - searchbox \"Search…\"\n    - text: Whether the subscription will cancel at the natural billing period end.\n    - combobox \"Whether the subscription will cancel at the natural billing period end.\":\n      - option \"Enter cancel at period end\" [disabled]\n    - text: $19.00 · monthly Future\n    - time: Timestamp for the most recent modification, when available.\n    - navigation \"Pagination\":\n      - list:\n        - listitem:\n          - button \"Previous page\" [disabled]: ‹\n        - listitem:\n          - button \"Next page\" [disabled]: ›\n      - text: 1 / 0\n    - group \"Screen actions\":\n      - button \"Filter\"\n      - button \"Open row\"\n      - button \"Sort\"\n    - tablist \"Archive views\":\n      - tab \"Active\" [selected]\n      - tab \"Archived\"\n    - tabpanel \"Active\":\n      - list:\n        - listitem:\n          - 'button \"Subscription 01 Status: Future\"':\n            - strong: Subscription 01\n            - text: Future\n        - listitem:\n          - 'button \"Subscription 02 Status: Trialing\"':\n            - strong: Subscription 02\n            - text: Trialing\n        - listitem:\n          - 'button \"Subscription 04 Status: Paused\"':\n            - strong: Subscription 04\n            - text: Paused\n        - listitem:\n          - 'button \"Subscription 05 Status: Pending Cancellation\"':\n            - strong: Subscription 05\n            - text: Pending Cancellation\n        - listitem:\n          - 'button \"Subscription 06 Status: Past Due\"':\n            - strong: Subscription 06\n            - text: Past Due\n        - listitem:\n          - 'button \"Subscription 07 Status: Unpaid\"':\n            - strong: Subscription 07\n            - text: Unpaid\n        - listitem:\n          - 'button \"Subscription 08 Status: Terminated\"':\n            - strong: Subscription 08\n            - text: Terminated\n        - listitem:\n          - 'button \"Subscription 09 Status: Future\"':\n            - strong: Subscription 09\n            - text: Future\n        - listitem:\n          - 'button \"Team annual Status: Pending Cancellation\"':\n            - strong: Team annual\n            - text: Pending Cancellation\n      - text: 9 records\n      - button \"Previous\" [disabled]\n      - button \"Next\" [disabled]\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - search \"Search\":\n      - text: Search\n      - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n    - tablist \"Archive views\":\n      - tab \"Active\" [selected]\n      - tab \"Archived\"\n    - tabpanel \"Active\":\n      - list \"Records\":\n        - listitem:\n          - 'button \"Subscription 01 Status: Future Sep 1, 2026, 12:00 PM $19.00 · monthly\"':\n            - text: Subscription 01 Future\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $19.00 · monthly\n        - listitem:\n          - 'button \"Subscription 02 Status: Trialing Mar 1, 2026, 12:00 PM $38.00 · yearly\"':\n            - text: Subscription 02 Trialing\n            - time: Mar 1, 2026, 12:00 PM\n            - text: $38.00 · yearly\n        - listitem:\n          - 'button \"Subscription 04 Status: Paused Mar 1, 2026, 12:00 PM $76.00 · yearly\"':\n            - text: Subscription 04 Paused\n            - time: Mar 1, 2026, 12:00 PM\n            - text: $76.00 · yearly\n        - listitem:\n          - 'button \"Subscription 05 Status: Pending Cancellation Sep 1, 2026, 12:00 PM $95.00 · monthly\"':\n            - text: Subscription 05 Pending Cancellation\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $95.00 · monthly\n        - listitem:\n          - 'button \"Subscription 06 Status: Past Due Mar 1, 2026, 12:00 PM $114.00 · yearly\"':\n            - text: Subscription 06 Past Due\n            - time: Mar 1, 2026, 12:00 PM\n            - text: $114.00 · yearly\n        - listitem:\n          - 'button \"Subscription 07 Status: Unpaid Sep 1, 2026, 12:00 PM $133.00 · monthly\"':\n            - text: Subscription 07 Unpaid\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $133.00 · monthly\n        - listitem:\n          - 'button \"Subscription 08 Status: Terminated Mar 1, 2025, 12:00 PM $152.00 · yearly\"':\n            - text: Subscription 08 Terminated\n            - time: Mar 1, 2025, 12:00 PM\n            - text: $152.00 · yearly\n        - listitem:\n          - 'button \"Subscription 09 Status: Future Sep 1, 2026, 12:00 PM $171.00 · monthly\"':\n            - text: Subscription 09 Future\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $171.00 · monthly\n        - listitem:\n          - 'button \"Team annual Status: Pending Cancellation Sep 8, 2026, 12:00 PM $19.99 · yearly\"':\n            - text: Team annual Pending Cancellation\n            - time: Sep 8, 2026, 12:00 PM\n            - text: $19.99 · yearly\n    - navigation \"Pagination\":\n      - text: 9 records Showing 1–9 of 9\n      - list:\n        - listitem:\n          - button \"Previous page\" [disabled]: ‹\n        - listitem:\n          - button \"Page 1\": \"1\"\n        - listitem:\n          - button \"Next page\" [disabled]: ›\n      - text: Page 1 of 1\n  - status: Changes saved in this session."
```

## views.390.visibleText

Before:
```json
null
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscriptions\nList\nDetail\nEdit\nTimeline\nSearch\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly\n9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1\n\nChanges saved in this session."
```

## views.390.values

Before:
```json
[
  {
    "element": "input",
    "name": "Search",
    "value": "",
    "checked": false
  },
  {
    "element": "select",
    "name": "StatusAll statesfuturetrialingactivepausedpending cancellationpast dueunpaidterminated",
    "value": "",
    "checked": false
  },
  {
    "element": "select",
    "name": "SortName A–ZName Z–A",
    "value": "asc",
    "checked": false
  },
  {
    "element": "list-slot-search-1",
    "name": "Search…",
    "value": "",
    "checked": false
  },
  {
    "element": "list-slot-filters-2",
    "name": "Whether the subscription will cancel at the natural billing period end.",
    "value": "",
    "checked": false
  }
]
```
After:
```json
[
  {
    "element": "list-slot-search-1",
    "name": "Search",
    "value": "",
    "checked": false
  },
  {
    "element": "list-slot-filters-2",
    "name": "Status",
    "value": "",
    "checked": false
  },
  {
    "element": "list-list-toolbar-4-sort",
    "name": "Sort",
    "value": "asc",
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
  "elementCount": 102,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "label",
      "text": "Whether the subscription will cancel at the natural billing period end.",
      "lines": [
        "Whether the subscription will cancel at the",
        "natural billing period end."
      ]
    },
    {
      "element": "list-ve-items-11",
      "text": "Timestamp for the most recent modification, when available.",
      "lines": [
        "Timestamp for the most recent modification,",
        "when available."
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
  "elementCount": 107,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "label",
      "text": "Search",
      "lines": [
        "Searc",
        "h"
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
    "id": "list-screen",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.00 · monthly\n⏲\nFuture\nTimestamp for the most recent modification, when available.\n‹\n›\n1\n/ 0"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.00 · monthly\n⏲\nFuture\nTimestamp for the most recent modification, when available.\n‹\n›\n1\n/ 0"
  },
  {
    "id": "list-list-toolbar-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.00 · monthly"
  },
  {
    "id": "",
    "component": "SearchInput",
    "text": ""
  },
  {
    "id": "",
    "component": "Select",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end"
  },
  {
    "id": "list-slot-toolbar-actions-3",
    "component": "BillingSummaryBadge",
    "text": "$19.00 · monthly"
  },
  {
    "id": "list-list-items-5",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "list-slot-items-6",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "list-ve-items-10",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "list-ve-items-11",
    "component": "RelativeTimestamp",
    "text": "Timestamp for the most recent modification, when available."
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "‹\n›\n1\n/ 0"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "‹\n›\n1\n/ 0"
  },
  {
    "id": "",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 01\n⏲\nFuture\nSubscription 02\n★\nTrialing\nSubscription 04\n⏸\nPaused\nSubscription 05\n…\nPending Cancellation\nSubscription 06\n⚠︎\nPast Due\nSubscription 07\n⨯\nUnpaid\nSubscription 08\n∅\nTerminated\nSubscription 09\n⏲\nFuture\nTeam annual\n…\nPending Cancellation\n9 records\nPrevious\nNext"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⏸\nPaused"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⚠︎\nPast Due"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⨯\nUnpaid"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "∅\nTerminated"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  }
]
```
After:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly\n9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly\n9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-list-toolbar-4",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A"
  },
  {
    "id": "",
    "component": "SearchInput",
    "text": "Search"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Status\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Sort\nName A–Z\nName Z–A"
  },
  {
    "id": "list-list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly"
  },
  {
    "id": "list-list-items-5",
    "component": "section",
    "text": "Subscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly"
  },
  {
    "id": "list-list-items-5-row-0",
    "component": "Button",
    "text": "Subscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-0",
    "component": "Text",
    "text": "Subscription 01"
  },
  {
    "id": "list-ve-items-10-0",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "list-ve-items-11-0",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-0",
    "component": "BillingSummaryBadge",
    "text": "$19.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-1",
    "component": "Button",
    "text": "Subscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-1",
    "component": "Text",
    "text": "Subscription 02"
  },
  {
    "id": "list-ve-items-10-1",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "list-ve-items-11-1",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-1",
    "component": "BillingSummaryBadge",
    "text": "$38.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-2",
    "component": "Button",
    "text": "Subscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-2",
    "component": "Text",
    "text": "Subscription 04"
  },
  {
    "id": "list-ve-items-10-2",
    "component": "StatusBadge",
    "text": "⏸\nPaused"
  },
  {
    "id": "list-ve-items-11-2",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-2",
    "component": "BillingSummaryBadge",
    "text": "$76.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-3",
    "component": "Button",
    "text": "Subscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-3",
    "component": "Text",
    "text": "Subscription 05"
  },
  {
    "id": "list-ve-items-10-3",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  },
  {
    "id": "list-ve-items-11-3",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-3",
    "component": "BillingSummaryBadge",
    "text": "$95.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-4",
    "component": "Button",
    "text": "Subscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-4",
    "component": "Text",
    "text": "Subscription 06"
  },
  {
    "id": "list-ve-items-10-4",
    "component": "StatusBadge",
    "text": "⚠︎\nPast Due"
  },
  {
    "id": "list-ve-items-11-4",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-4",
    "component": "BillingSummaryBadge",
    "text": "$114.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-5",
    "component": "Button",
    "text": "Subscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-5",
    "component": "Text",
    "text": "Subscription 07"
  },
  {
    "id": "list-ve-items-10-5",
    "component": "StatusBadge",
    "text": "⨯\nUnpaid"
  },
  {
    "id": "list-ve-items-11-5",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-5",
    "component": "BillingSummaryBadge",
    "text": "$133.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-6",
    "component": "Button",
    "text": "Subscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-6",
    "component": "Text",
    "text": "Subscription 08"
  },
  {
    "id": "list-ve-items-10-6",
    "component": "StatusBadge",
    "text": "∅\nTerminated"
  },
  {
    "id": "list-ve-items-11-6",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2025, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-6",
    "component": "BillingSummaryBadge",
    "text": "$152.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-7",
    "component": "Button",
    "text": "Subscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-7",
    "component": "Text",
    "text": "Subscription 09"
  },
  {
    "id": "list-ve-items-10-7",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "list-ve-items-11-7",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-7",
    "component": "BillingSummaryBadge",
    "text": "$171.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-8",
    "component": "Button",
    "text": "Team annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly"
  },
  {
    "id": "list-list-items-5-title-8",
    "component": "Text",
    "text": "Team annual"
  },
  {
    "id": "list-ve-items-10-8",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  },
  {
    "id": "list-ve-items-11-8",
    "component": "RelativeTimestamp",
    "text": "Sep 8, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-8",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · yearly"
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  }
]
```

## views.820.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Find subscriptions\":\n    - text: Search\n    - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n  - region \"Subscription screen\":\n    - search \"Search…\":\n      - searchbox \"Search…\"\n    - text: Whether the subscription will cancel at the natural billing period end.\n    - combobox \"Whether the subscription will cancel at the natural billing period end.\":\n      - option \"Enter cancel at period end\" [disabled]\n    - text: $19.00 · monthly Future\n    - time: Timestamp for the most recent modification, when available.\n    - navigation \"Pagination\":\n      - list:\n        - listitem:\n          - button \"Previous page\" [disabled]: ‹\n        - listitem:\n          - button \"Next page\" [disabled]: ›\n      - text: 1 / 0\n    - group \"Screen actions\":\n      - button \"Filter\"\n      - button \"Open row\"\n      - button \"Sort\"\n    - tablist \"Archive views\":\n      - tab \"Active\" [selected]\n      - tab \"Archived\"\n    - tabpanel \"Active\":\n      - list:\n        - listitem:\n          - 'button \"Subscription 01 Status: Future\"':\n            - strong: Subscription 01\n            - text: Future\n        - listitem:\n          - 'button \"Subscription 02 Status: Trialing\"':\n            - strong: Subscription 02\n            - text: Trialing\n        - listitem:\n          - 'button \"Subscription 04 Status: Paused\"':\n            - strong: Subscription 04\n            - text: Paused\n        - listitem:\n          - 'button \"Subscription 05 Status: Pending Cancellation\"':\n            - strong: Subscription 05\n            - text: Pending Cancellation\n        - listitem:\n          - 'button \"Subscription 06 Status: Past Due\"':\n            - strong: Subscription 06\n            - text: Past Due\n        - listitem:\n          - 'button \"Subscription 07 Status: Unpaid\"':\n            - strong: Subscription 07\n            - text: Unpaid\n        - listitem:\n          - 'button \"Subscription 08 Status: Terminated\"':\n            - strong: Subscription 08\n            - text: Terminated\n        - listitem:\n          - 'button \"Subscription 09 Status: Future\"':\n            - strong: Subscription 09\n            - text: Future\n        - listitem:\n          - 'button \"Team annual Status: Pending Cancellation\"':\n            - strong: Team annual\n            - text: Pending Cancellation\n      - text: 9 records\n      - button \"Previous\" [disabled]\n      - button \"Next\" [disabled]\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - search \"Search\":\n      - text: Search\n      - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n    - tablist \"Archive views\":\n      - tab \"Active\" [selected]\n      - tab \"Archived\"\n    - tabpanel \"Active\":\n      - list \"Records\":\n        - listitem:\n          - 'button \"Subscription 01 Status: Future Sep 1, 2026, 12:00 PM $19.00 · monthly\"':\n            - text: Subscription 01 Future\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $19.00 · monthly\n        - listitem:\n          - 'button \"Subscription 02 Status: Trialing Mar 1, 2026, 12:00 PM $38.00 · yearly\"':\n            - text: Subscription 02 Trialing\n            - time: Mar 1, 2026, 12:00 PM\n            - text: $38.00 · yearly\n        - listitem:\n          - 'button \"Subscription 04 Status: Paused Mar 1, 2026, 12:00 PM $76.00 · yearly\"':\n            - text: Subscription 04 Paused\n            - time: Mar 1, 2026, 12:00 PM\n            - text: $76.00 · yearly\n        - listitem:\n          - 'button \"Subscription 05 Status: Pending Cancellation Sep 1, 2026, 12:00 PM $95.00 · monthly\"':\n            - text: Subscription 05 Pending Cancellation\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $95.00 · monthly\n        - listitem:\n          - 'button \"Subscription 06 Status: Past Due Mar 1, 2026, 12:00 PM $114.00 · yearly\"':\n            - text: Subscription 06 Past Due\n            - time: Mar 1, 2026, 12:00 PM\n            - text: $114.00 · yearly\n        - listitem:\n          - 'button \"Subscription 07 Status: Unpaid Sep 1, 2026, 12:00 PM $133.00 · monthly\"':\n            - text: Subscription 07 Unpaid\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $133.00 · monthly\n        - listitem:\n          - 'button \"Subscription 08 Status: Terminated Mar 1, 2025, 12:00 PM $152.00 · yearly\"':\n            - text: Subscription 08 Terminated\n            - time: Mar 1, 2025, 12:00 PM\n            - text: $152.00 · yearly\n        - listitem:\n          - 'button \"Subscription 09 Status: Future Sep 1, 2026, 12:00 PM $171.00 · monthly\"':\n            - text: Subscription 09 Future\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $171.00 · monthly\n        - listitem:\n          - 'button \"Team annual Status: Pending Cancellation Sep 8, 2026, 12:00 PM $19.99 · yearly\"':\n            - text: Team annual Pending Cancellation\n            - time: Sep 8, 2026, 12:00 PM\n            - text: $19.99 · yearly\n    - navigation \"Pagination\":\n      - text: 9 records Showing 1–9 of 9\n      - list:\n        - listitem:\n          - button \"Previous page\" [disabled]: ‹\n        - listitem:\n          - button \"Page 1\": \"1\"\n        - listitem:\n          - button \"Next page\" [disabled]: ›\n      - text: Page 1 of 1\n  - status: Changes saved in this session."
```

## views.820.visibleText

Before:
```json
null
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscriptions\nLocal workspace\nList\nDetail\nEdit\nTimeline\nSearch\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly\n9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1\n\nChanges saved in this session."
```

## views.820.values

Before:
```json
[
  {
    "element": "input",
    "name": "Search",
    "value": "",
    "checked": false
  },
  {
    "element": "select",
    "name": "StatusAll statesfuturetrialingactivepausedpending cancellationpast dueunpaidterminated",
    "value": "",
    "checked": false
  },
  {
    "element": "select",
    "name": "SortName A–ZName Z–A",
    "value": "asc",
    "checked": false
  },
  {
    "element": "list-slot-search-1",
    "name": "Search…",
    "value": "",
    "checked": false
  },
  {
    "element": "list-slot-filters-2",
    "name": "Whether the subscription will cancel at the natural billing period end.",
    "value": "",
    "checked": false
  }
]
```
After:
```json
[
  {
    "element": "list-slot-search-1",
    "name": "Search",
    "value": "",
    "checked": false
  },
  {
    "element": "list-slot-filters-2",
    "name": "Status",
    "value": "",
    "checked": false
  },
  {
    "element": "list-list-toolbar-4-sort",
    "name": "Sort",
    "value": "asc",
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
  "elementCount": 112,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "label",
      "text": "Whether the subscription will cancel at the natural billing period end.",
      "lines": [
        "Whether the subscription will cancel at",
        "the natural billing period end."
      ]
    }
  ]
}
```
After:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 108,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "label",
      "text": "Search",
      "lines": [
        "Sear",
        "ch"
      ]
    }
  ]
}
```

## views.820.regions

Before:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.00 · monthly\n⏲\nFuture\nTimestamp for the most recent modification, when available.\n‹\n›\n1\n/ 0"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.00 · monthly\n⏲\nFuture\nTimestamp for the most recent modification, when available.\n‹\n›\n1\n/ 0"
  },
  {
    "id": "list-list-toolbar-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.00 · monthly"
  },
  {
    "id": "",
    "component": "SearchInput",
    "text": ""
  },
  {
    "id": "",
    "component": "Select",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end"
  },
  {
    "id": "list-slot-toolbar-actions-3",
    "component": "BillingSummaryBadge",
    "text": "$19.00 · monthly"
  },
  {
    "id": "list-list-items-5",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "list-slot-items-6",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "list-ve-items-10",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "list-ve-items-11",
    "component": "RelativeTimestamp",
    "text": "Timestamp for the most recent modification, when available."
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "‹\n›\n1\n/ 0"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "‹\n›\n1\n/ 0"
  },
  {
    "id": "",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 01\n⏲\nFuture\n→\nSubscription 02\n★\nTrialing\n→\nSubscription 04\n⏸\nPaused\n→\nSubscription 05\n…\nPending Cancellation\n→\nSubscription 06\n⚠︎\nPast Due\n→\nSubscription 07\n⨯\nUnpaid\n→\nSubscription 08\n∅\nTerminated\n→\nSubscription 09\n⏲\nFuture\n→\nTeam annual\n…\nPending Cancellation\n→\n9 records\nPrevious\nNext"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⏸\nPaused"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⚠︎\nPast Due"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⨯\nUnpaid"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "∅\nTerminated"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  }
]
```
After:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly\n9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly\n9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-list-toolbar-4",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A"
  },
  {
    "id": "",
    "component": "SearchInput",
    "text": "Search"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Status\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Sort\nName A–Z\nName Z–A"
  },
  {
    "id": "list-list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly"
  },
  {
    "id": "list-list-items-5",
    "component": "section",
    "text": "Subscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly"
  },
  {
    "id": "list-list-items-5-row-0",
    "component": "Button",
    "text": "Subscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-0",
    "component": "Text",
    "text": "Subscription 01"
  },
  {
    "id": "list-ve-items-10-0",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "list-ve-items-11-0",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-0",
    "component": "BillingSummaryBadge",
    "text": "$19.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-1",
    "component": "Button",
    "text": "Subscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-1",
    "component": "Text",
    "text": "Subscription 02"
  },
  {
    "id": "list-ve-items-10-1",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "list-ve-items-11-1",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-1",
    "component": "BillingSummaryBadge",
    "text": "$38.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-2",
    "component": "Button",
    "text": "Subscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-2",
    "component": "Text",
    "text": "Subscription 04"
  },
  {
    "id": "list-ve-items-10-2",
    "component": "StatusBadge",
    "text": "⏸\nPaused"
  },
  {
    "id": "list-ve-items-11-2",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-2",
    "component": "BillingSummaryBadge",
    "text": "$76.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-3",
    "component": "Button",
    "text": "Subscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-3",
    "component": "Text",
    "text": "Subscription 05"
  },
  {
    "id": "list-ve-items-10-3",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  },
  {
    "id": "list-ve-items-11-3",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-3",
    "component": "BillingSummaryBadge",
    "text": "$95.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-4",
    "component": "Button",
    "text": "Subscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-4",
    "component": "Text",
    "text": "Subscription 06"
  },
  {
    "id": "list-ve-items-10-4",
    "component": "StatusBadge",
    "text": "⚠︎\nPast Due"
  },
  {
    "id": "list-ve-items-11-4",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-4",
    "component": "BillingSummaryBadge",
    "text": "$114.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-5",
    "component": "Button",
    "text": "Subscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-5",
    "component": "Text",
    "text": "Subscription 07"
  },
  {
    "id": "list-ve-items-10-5",
    "component": "StatusBadge",
    "text": "⨯\nUnpaid"
  },
  {
    "id": "list-ve-items-11-5",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-5",
    "component": "BillingSummaryBadge",
    "text": "$133.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-6",
    "component": "Button",
    "text": "Subscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-6",
    "component": "Text",
    "text": "Subscription 08"
  },
  {
    "id": "list-ve-items-10-6",
    "component": "StatusBadge",
    "text": "∅\nTerminated"
  },
  {
    "id": "list-ve-items-11-6",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2025, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-6",
    "component": "BillingSummaryBadge",
    "text": "$152.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-7",
    "component": "Button",
    "text": "Subscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-7",
    "component": "Text",
    "text": "Subscription 09"
  },
  {
    "id": "list-ve-items-10-7",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "list-ve-items-11-7",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-7",
    "component": "BillingSummaryBadge",
    "text": "$171.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-8",
    "component": "Button",
    "text": "Team annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly"
  },
  {
    "id": "list-list-items-5-title-8",
    "component": "Text",
    "text": "Team annual"
  },
  {
    "id": "list-ve-items-10-8",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  },
  {
    "id": "list-ve-items-11-8",
    "component": "RelativeTimestamp",
    "text": "Sep 8, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-8",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · yearly"
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  }
]
```

## views.1440.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Find subscriptions\":\n    - text: Search\n    - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n  - region \"Subscription screen\":\n    - search \"Search…\":\n      - searchbox \"Search…\"\n    - text: Whether the subscription will cancel at the natural billing period end.\n    - combobox \"Whether the subscription will cancel at the natural billing period end.\":\n      - option \"Enter cancel at period end\" [disabled]\n    - text: $19.00 · monthly Future\n    - time: Timestamp for the most recent modification, when available.\n    - navigation \"Pagination\":\n      - list:\n        - listitem:\n          - button \"Previous page\" [disabled]: ‹\n        - listitem:\n          - button \"Next page\" [disabled]: ›\n      - text: 1 / 0\n    - group \"Screen actions\":\n      - button \"Filter\"\n      - button \"Open row\"\n      - button \"Sort\"\n    - tablist \"Archive views\":\n      - tab \"Active\" [selected]\n      - tab \"Archived\"\n    - tabpanel \"Active\":\n      - list:\n        - listitem:\n          - 'button \"Subscription 01 Status: Future\"':\n            - strong: Subscription 01\n            - text: Future\n        - listitem:\n          - 'button \"Subscription 02 Status: Trialing\"':\n            - strong: Subscription 02\n            - text: Trialing\n        - listitem:\n          - 'button \"Subscription 04 Status: Paused\"':\n            - strong: Subscription 04\n            - text: Paused\n        - listitem:\n          - 'button \"Subscription 05 Status: Pending Cancellation\"':\n            - strong: Subscription 05\n            - text: Pending Cancellation\n        - listitem:\n          - 'button \"Subscription 06 Status: Past Due\"':\n            - strong: Subscription 06\n            - text: Past Due\n        - listitem:\n          - 'button \"Subscription 07 Status: Unpaid\"':\n            - strong: Subscription 07\n            - text: Unpaid\n        - listitem:\n          - 'button \"Subscription 08 Status: Terminated\"':\n            - strong: Subscription 08\n            - text: Terminated\n        - listitem:\n          - 'button \"Subscription 09 Status: Future\"':\n            - strong: Subscription 09\n            - text: Future\n        - listitem:\n          - 'button \"Team annual Status: Pending Cancellation\"':\n            - strong: Team annual\n            - text: Pending Cancellation\n      - text: 9 records\n      - button \"Previous\" [disabled]\n      - button \"Next\" [disabled]\n  - status: Changes saved in this session."
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - search \"Search\":\n      - text: Search\n      - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n    - tablist \"Archive views\":\n      - tab \"Active\" [selected]\n      - tab \"Archived\"\n    - tabpanel \"Active\":\n      - list \"Records\":\n        - listitem:\n          - 'button \"Subscription 01 Status: Future Sep 1, 2026, 12:00 PM $19.00 · monthly\"':\n            - text: Subscription 01 Future\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $19.00 · monthly\n        - listitem:\n          - 'button \"Subscription 02 Status: Trialing Mar 1, 2026, 12:00 PM $38.00 · yearly\"':\n            - text: Subscription 02 Trialing\n            - time: Mar 1, 2026, 12:00 PM\n            - text: $38.00 · yearly\n        - listitem:\n          - 'button \"Subscription 04 Status: Paused Mar 1, 2026, 12:00 PM $76.00 · yearly\"':\n            - text: Subscription 04 Paused\n            - time: Mar 1, 2026, 12:00 PM\n            - text: $76.00 · yearly\n        - listitem:\n          - 'button \"Subscription 05 Status: Pending Cancellation Sep 1, 2026, 12:00 PM $95.00 · monthly\"':\n            - text: Subscription 05 Pending Cancellation\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $95.00 · monthly\n        - listitem:\n          - 'button \"Subscription 06 Status: Past Due Mar 1, 2026, 12:00 PM $114.00 · yearly\"':\n            - text: Subscription 06 Past Due\n            - time: Mar 1, 2026, 12:00 PM\n            - text: $114.00 · yearly\n        - listitem:\n          - 'button \"Subscription 07 Status: Unpaid Sep 1, 2026, 12:00 PM $133.00 · monthly\"':\n            - text: Subscription 07 Unpaid\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $133.00 · monthly\n        - listitem:\n          - 'button \"Subscription 08 Status: Terminated Mar 1, 2025, 12:00 PM $152.00 · yearly\"':\n            - text: Subscription 08 Terminated\n            - time: Mar 1, 2025, 12:00 PM\n            - text: $152.00 · yearly\n        - listitem:\n          - 'button \"Subscription 09 Status: Future Sep 1, 2026, 12:00 PM $171.00 · monthly\"':\n            - text: Subscription 09 Future\n            - time: Sep 1, 2026, 12:00 PM\n            - text: $171.00 · monthly\n        - listitem:\n          - 'button \"Team annual Status: Pending Cancellation Sep 8, 2026, 12:00 PM $19.99 · yearly\"':\n            - text: Team annual Pending Cancellation\n            - time: Sep 8, 2026, 12:00 PM\n            - text: $19.99 · yearly\n    - navigation \"Pagination\":\n      - text: 9 records Showing 1–9 of 9\n      - list:\n        - listitem:\n          - button \"Previous page\" [disabled]: ‹\n        - listitem:\n          - button \"Page 1\": \"1\"\n        - listitem:\n          - button \"Next page\" [disabled]: ›\n      - text: Page 1 of 1\n  - status: Changes saved in this session."
```

## views.1440.visibleText

Before:
```json
null
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscriptions\nLocal workspace\nList\nDetail\nEdit\nTimeline\nSearch\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly\n9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1\n\nChanges saved in this session."
```

## views.1440.values

Before:
```json
[
  {
    "element": "input",
    "name": "Search",
    "value": "",
    "checked": false
  },
  {
    "element": "select",
    "name": "StatusAll statesfuturetrialingactivepausedpending cancellationpast dueunpaidterminated",
    "value": "",
    "checked": false
  },
  {
    "element": "select",
    "name": "SortName A–ZName Z–A",
    "value": "asc",
    "checked": false
  },
  {
    "element": "list-slot-search-1",
    "name": "Search…",
    "value": "",
    "checked": false
  },
  {
    "element": "list-slot-filters-2",
    "name": "Whether the subscription will cancel at the natural billing period end.",
    "value": "",
    "checked": false
  }
]
```
After:
```json
[
  {
    "element": "list-slot-search-1",
    "name": "Search",
    "value": "",
    "checked": false
  },
  {
    "element": "list-slot-filters-2",
    "name": "Status",
    "value": "",
    "checked": false
  },
  {
    "element": "list-list-toolbar-4-sort",
    "name": "Sort",
    "value": "asc",
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
  "elementCount": 112,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "label",
      "text": "Whether the subscription will cancel at the natural billing period end.",
      "lines": [
        "Whether the subscription will cancel at the natural billing",
        "period end."
      ]
    }
  ]
}
```
After:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 108,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "label",
      "text": "Search",
      "lines": [
        "Searc",
        "h"
      ]
    }
  ]
}
```

## views.1440.regions

Before:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.00 · monthly\n⏲\nFuture\nTimestamp for the most recent modification, when available.\n‹\n›\n1\n/ 0"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.00 · monthly\n⏲\nFuture\nTimestamp for the most recent modification, when available.\n‹\n›\n1\n/ 0"
  },
  {
    "id": "list-list-toolbar-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.00 · monthly"
  },
  {
    "id": "",
    "component": "SearchInput",
    "text": ""
  },
  {
    "id": "",
    "component": "Select",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end"
  },
  {
    "id": "list-slot-toolbar-actions-3",
    "component": "BillingSummaryBadge",
    "text": "$19.00 · monthly"
  },
  {
    "id": "list-list-items-5",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "list-slot-items-6",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "list-ve-items-10",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "list-ve-items-11",
    "component": "RelativeTimestamp",
    "text": "Timestamp for the most recent modification, when available."
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "‹\n›\n1\n/ 0"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "‹\n›\n1\n/ 0"
  },
  {
    "id": "",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 01\n⏲\nFuture\n→\nSubscription 02\n★\nTrialing\n→\nSubscription 04\n⏸\nPaused\n→\nSubscription 05\n…\nPending Cancellation\n→\nSubscription 06\n⚠︎\nPast Due\n→\nSubscription 07\n⨯\nUnpaid\n→\nSubscription 08\n∅\nTerminated\n→\nSubscription 09\n⏲\nFuture\n→\nTeam annual\n…\nPending Cancellation\n→\n9 records\nPrevious\nNext"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⏸\nPaused"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⚠︎\nPast Due"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⨯\nUnpaid"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "∅\nTerminated"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  }
]
```
After:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly\n9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly\n9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-list-toolbar-4",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A"
  },
  {
    "id": "",
    "component": "SearchInput",
    "text": "Search"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Status\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "",
    "component": "Select",
    "text": "Sort\nName A–Z\nName Z–A"
  },
  {
    "id": "list-list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly"
  },
  {
    "id": "list-list-items-5",
    "component": "section",
    "text": "Subscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly\nSubscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly\nSubscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly\nSubscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly\nSubscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly\nSubscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly\nSubscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly\nSubscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly\nTeam annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly"
  },
  {
    "id": "list-list-items-5-row-0",
    "component": "Button",
    "text": "Subscription 01\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$19.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-0",
    "component": "Text",
    "text": "Subscription 01"
  },
  {
    "id": "list-ve-items-10-0",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "list-ve-items-11-0",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-0",
    "component": "BillingSummaryBadge",
    "text": "$19.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-1",
    "component": "Button",
    "text": "Subscription 02\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$38.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-1",
    "component": "Text",
    "text": "Subscription 02"
  },
  {
    "id": "list-ve-items-10-1",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "list-ve-items-11-1",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-1",
    "component": "BillingSummaryBadge",
    "text": "$38.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-2",
    "component": "Button",
    "text": "Subscription 04\n⏸\nPaused\nMar 1, 2026, 12:00 PM\n$76.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-2",
    "component": "Text",
    "text": "Subscription 04"
  },
  {
    "id": "list-ve-items-10-2",
    "component": "StatusBadge",
    "text": "⏸\nPaused"
  },
  {
    "id": "list-ve-items-11-2",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-2",
    "component": "BillingSummaryBadge",
    "text": "$76.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-3",
    "component": "Button",
    "text": "Subscription 05\n…\nPending Cancellation\nSep 1, 2026, 12:00 PM\n$95.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-3",
    "component": "Text",
    "text": "Subscription 05"
  },
  {
    "id": "list-ve-items-10-3",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  },
  {
    "id": "list-ve-items-11-3",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-3",
    "component": "BillingSummaryBadge",
    "text": "$95.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-4",
    "component": "Button",
    "text": "Subscription 06\n⚠︎\nPast Due\nMar 1, 2026, 12:00 PM\n$114.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-4",
    "component": "Text",
    "text": "Subscription 06"
  },
  {
    "id": "list-ve-items-10-4",
    "component": "StatusBadge",
    "text": "⚠︎\nPast Due"
  },
  {
    "id": "list-ve-items-11-4",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-4",
    "component": "BillingSummaryBadge",
    "text": "$114.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-5",
    "component": "Button",
    "text": "Subscription 07\n⨯\nUnpaid\nSep 1, 2026, 12:00 PM\n$133.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-5",
    "component": "Text",
    "text": "Subscription 07"
  },
  {
    "id": "list-ve-items-10-5",
    "component": "StatusBadge",
    "text": "⨯\nUnpaid"
  },
  {
    "id": "list-ve-items-11-5",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-5",
    "component": "BillingSummaryBadge",
    "text": "$133.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-6",
    "component": "Button",
    "text": "Subscription 08\n∅\nTerminated\nMar 1, 2025, 12:00 PM\n$152.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-6",
    "component": "Text",
    "text": "Subscription 08"
  },
  {
    "id": "list-ve-items-10-6",
    "component": "StatusBadge",
    "text": "∅\nTerminated"
  },
  {
    "id": "list-ve-items-11-6",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2025, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-6",
    "component": "BillingSummaryBadge",
    "text": "$152.00 · yearly"
  },
  {
    "id": "list-list-items-5-row-7",
    "component": "Button",
    "text": "Subscription 09\n⏲\nFuture\nSep 1, 2026, 12:00 PM\n$171.00 · monthly"
  },
  {
    "id": "list-list-items-5-title-7",
    "component": "Text",
    "text": "Subscription 09"
  },
  {
    "id": "list-ve-items-10-7",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "list-ve-items-11-7",
    "component": "RelativeTimestamp",
    "text": "Sep 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-7",
    "component": "BillingSummaryBadge",
    "text": "$171.00 · monthly"
  },
  {
    "id": "list-list-items-5-row-8",
    "component": "Button",
    "text": "Team annual\n…\nPending Cancellation\nSep 8, 2026, 12:00 PM\n$19.99 · yearly"
  },
  {
    "id": "list-list-items-5-title-8",
    "component": "Text",
    "text": "Team annual"
  },
  {
    "id": "list-ve-items-10-8",
    "component": "StatusBadge",
    "text": "…\nPending Cancellation"
  },
  {
    "id": "list-ve-items-11-8",
    "component": "RelativeTimestamp",
    "text": "Sep 8, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-8",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · yearly"
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "9 records\nShowing 1–9 of 9\n‹\n1\n›\nPage 1 of 1"
  }
]
```
