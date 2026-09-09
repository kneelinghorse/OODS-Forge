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
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - search \"Search\":\n      - text: Search\n      - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n    - tablist \"Archive views\":\n      - tab \"Active\"\n      - tab \"Archived\" [selected]\n    - tabpanel \"Archived\":\n      - list \"Records\":\n        - listitem:\n          - 'group \"Archived: Subscription 10\"':\n            - 'button \"Subscription 10 Status: Trialing Jan 1, 2026, 12:00 AM $190.00 · yearly\"':\n              - text: Subscription 10 Trialing\n              - time: Jan 1, 2026, 12:00 AM\n              - text: $190.00 · yearly\n            - text: Archived\n    - navigation \"Pagination\":\n      - text: 1 record Showing 1–1 of 1\n      - button \"Previous page\" [disabled]: ‹\n      - list:\n        - listitem:\n          - button \"Page 1\": \"1\"\n      - button \"Next page\" [disabled]: ›\n      - text: Page 1 of 1\n  - status"
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - search \"Search\":\n      - text: Search\n      - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n    - tablist \"Archive views\":\n      - tab \"Active\"\n      - tab \"Archived\" [selected]\n    - tabpanel \"Archived\":\n      - list \"Records\":\n        - listitem:\n          - 'group \"Archived: Subscription 10\"':\n            - 'button \"Subscription 10 Status: Trialing Mar 1, 2026, 12:00 PM $190.00 · yearly\"':\n              - text: Subscription 10 Trialing\n              - time: Mar 1, 2026, 12:00 PM\n              - text: $190.00 · yearly\n            - text: Archived\n    - navigation \"Pagination\":\n      - text: 1 record Showing 1–1 of 1\n      - button \"Previous page\" [disabled]: ‹\n      - list:\n        - listitem:\n          - button \"Page 1\": \"1\"\n      - button \"Next page\" [disabled]: ›\n      - text: Page 1 of 1\n  - status"
```

## views.390.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscriptions\nList\nDetail\nEdit\nTimeline\nSearch\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscriptions\nList\nDetail\nEdit\nTimeline\nSearch\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
```

## views.390.measurements

Before:
```json
{
  "viewportWidth": 390,
  "documentWidth": 390,
  "elementCount": 61,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "span",
      "text": "Archived",
      "lines": [
        "Archi",
        "ved"
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
  "elementCount": 61,
  "overflow": [],
  "glyphWraps": []
}
```

## views.390.regions

Before:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
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
    "id": "list-slot-search-1",
    "component": "Input",
    "text": ""
  },
  {
    "id": "list-slot-filters-2",
    "component": "Select",
    "text": "All states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "list-list-toolbar-4-sort",
    "component": "Select",
    "text": "Name A–Z\nName Z–A"
  },
  {
    "id": "list-list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5",
    "component": "section",
    "text": "Subscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-ve-items-13-0",
    "component": "ArchivedRowOverlay",
    "text": "Subscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5-row-0",
    "component": "Button",
    "text": "Subscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-0",
    "component": "Text",
    "text": "Subscription 10"
  },
  {
    "id": "list-ve-items-10-0",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "list-ve-items-11-0",
    "component": "RelativeTimestamp",
    "text": "Jan 1, 2026, 12:00 AM"
  },
  {
    "id": "list-slot-toolbar-actions-3-0",
    "component": "BillingSummaryBadge",
    "text": "$190.00 · yearly"
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  }
]
```
After:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
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
    "id": "list-slot-search-1",
    "component": "Input",
    "text": ""
  },
  {
    "id": "list-slot-filters-2",
    "component": "Select",
    "text": "All states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "list-list-toolbar-4-sort",
    "component": "Select",
    "text": "Name A–Z\nName Z–A"
  },
  {
    "id": "list-list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5",
    "component": "section",
    "text": "Subscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-ve-items-13-0",
    "component": "ArchivedRowOverlay",
    "text": "Subscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5-row-0",
    "component": "Button",
    "text": "Subscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-0",
    "component": "Text",
    "text": "Subscription 10"
  },
  {
    "id": "list-ve-items-10-0",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "list-ve-items-11-0",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-0",
    "component": "BillingSummaryBadge",
    "text": "$190.00 · yearly"
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  }
]
```

## views.820.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - search \"Search\":\n      - text: Search\n      - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n    - tablist \"Archive views\":\n      - tab \"Active\"\n      - tab \"Archived\" [selected]\n    - tabpanel \"Archived\":\n      - list \"Records\":\n        - listitem:\n          - 'group \"Archived: Subscription 10\"':\n            - 'button \"Subscription 10 Status: Trialing Jan 1, 2026, 12:00 AM $190.00 · yearly\"':\n              - text: Subscription 10 Trialing\n              - time: Jan 1, 2026, 12:00 AM\n              - text: $190.00 · yearly\n            - text: Archived\n    - navigation \"Pagination\":\n      - text: 1 record Showing 1–1 of 1\n      - button \"Previous page\" [disabled]: ‹\n      - list:\n        - listitem:\n          - button \"Page 1\": \"1\"\n      - button \"Next page\" [disabled]: ›\n      - text: Page 1 of 1\n  - status"
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - search \"Search\":\n      - text: Search\n      - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n    - tablist \"Archive views\":\n      - tab \"Active\"\n      - tab \"Archived\" [selected]\n    - tabpanel \"Archived\":\n      - list \"Records\":\n        - listitem:\n          - 'group \"Archived: Subscription 10\"':\n            - 'button \"Subscription 10 Status: Trialing Mar 1, 2026, 12:00 PM $190.00 · yearly\"':\n              - text: Subscription 10 Trialing\n              - time: Mar 1, 2026, 12:00 PM\n              - text: $190.00 · yearly\n            - text: Archived\n    - navigation \"Pagination\":\n      - text: 1 record Showing 1–1 of 1\n      - button \"Previous page\" [disabled]: ‹\n      - list:\n        - listitem:\n          - button \"Page 1\": \"1\"\n      - button \"Next page\" [disabled]: ›\n      - text: Page 1 of 1\n  - status"
```

## views.820.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscriptions\nLocal workspace\nList\nDetail\nEdit\nTimeline\nSearch\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscriptions\nLocal workspace\nList\nDetail\nEdit\nTimeline\nSearch\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
```

## views.820.measurements

Before:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 62,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "span",
      "text": "Archived",
      "lines": [
        "Archive",
        "d"
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
  "elementCount": 62,
  "overflow": [],
  "glyphWraps": []
}
```

## views.820.regions

Before:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
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
    "id": "list-slot-search-1",
    "component": "Input",
    "text": ""
  },
  {
    "id": "list-slot-filters-2",
    "component": "Select",
    "text": "All states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "list-list-toolbar-4-sort",
    "component": "Select",
    "text": "Name A–Z\nName Z–A"
  },
  {
    "id": "list-list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5",
    "component": "section",
    "text": "Subscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-ve-items-13-0",
    "component": "ArchivedRowOverlay",
    "text": "Subscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5-row-0",
    "component": "Button",
    "text": "Subscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-0",
    "component": "Text",
    "text": "Subscription 10"
  },
  {
    "id": "list-ve-items-10-0",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "list-ve-items-11-0",
    "component": "RelativeTimestamp",
    "text": "Jan 1, 2026, 12:00 AM"
  },
  {
    "id": "list-slot-toolbar-actions-3-0",
    "component": "BillingSummaryBadge",
    "text": "$190.00 · yearly"
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  }
]
```
After:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
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
    "id": "list-slot-search-1",
    "component": "Input",
    "text": ""
  },
  {
    "id": "list-slot-filters-2",
    "component": "Select",
    "text": "All states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "list-list-toolbar-4-sort",
    "component": "Select",
    "text": "Name A–Z\nName Z–A"
  },
  {
    "id": "list-list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5",
    "component": "section",
    "text": "Subscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-ve-items-13-0",
    "component": "ArchivedRowOverlay",
    "text": "Subscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5-row-0",
    "component": "Button",
    "text": "Subscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-0",
    "component": "Text",
    "text": "Subscription 10"
  },
  {
    "id": "list-ve-items-10-0",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "list-ve-items-11-0",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-0",
    "component": "BillingSummaryBadge",
    "text": "$190.00 · yearly"
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  }
]
```

## views.1440.accessibility

Before:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - search \"Search\":\n      - text: Search\n      - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n    - tablist \"Archive views\":\n      - tab \"Active\"\n      - tab \"Archived\" [selected]\n    - tabpanel \"Archived\":\n      - list \"Records\":\n        - listitem:\n          - 'group \"Archived: Subscription 10\"':\n            - 'button \"Subscription 10 Status: Trialing Jan 1, 2026, 12:00 AM $190.00 · yearly\"':\n              - text: Subscription 10 Trialing\n              - time: Jan 1, 2026, 12:00 AM\n              - text: $190.00 · yearly\n            - text: Archived\n    - navigation \"Pagination\":\n      - text: 1 record Showing 1–1 of 1\n      - button \"Previous page\" [disabled]: ‹\n      - list:\n        - listitem:\n          - button \"Page 1\": \"1\"\n      - button \"Next page\" [disabled]: ›\n      - text: Page 1 of 1\n  - status"
```
After:
```json
"- main:\n  - paragraph: SUBSCRIPTION WORKSPACE\n  - heading \"Subscriptions\" [level=1]\n  - text: Local workspace\n  - navigation \"Workflow screens\":\n    - button \"List\"\n    - button \"Detail\"\n    - button \"Edit\"\n    - button \"Timeline\"\n  - region \"Subscription screen\":\n    - search \"Search\":\n      - text: Search\n      - searchbox \"Search\"\n    - text: Status\n    - combobox \"Status\":\n      - option \"All states\" [selected]\n      - option \"future\"\n      - option \"trialing\"\n      - option \"active\"\n      - option \"paused\"\n      - option \"pending cancellation\"\n      - option \"past due\"\n      - option \"unpaid\"\n      - option \"terminated\"\n    - text: Sort\n    - combobox \"Sort\":\n      - option \"Name A–Z\" [selected]\n      - option \"Name Z–A\"\n    - tablist \"Archive views\":\n      - tab \"Active\"\n      - tab \"Archived\" [selected]\n    - tabpanel \"Archived\":\n      - list \"Records\":\n        - listitem:\n          - 'group \"Archived: Subscription 10\"':\n            - 'button \"Subscription 10 Status: Trialing Mar 1, 2026, 12:00 PM $190.00 · yearly\"':\n              - text: Subscription 10 Trialing\n              - time: Mar 1, 2026, 12:00 PM\n              - text: $190.00 · yearly\n            - text: Archived\n    - navigation \"Pagination\":\n      - text: 1 record Showing 1–1 of 1\n      - button \"Previous page\" [disabled]: ‹\n      - list:\n        - listitem:\n          - button \"Page 1\": \"1\"\n      - button \"Next page\" [disabled]: ›\n      - text: Page 1 of 1\n  - status"
```

## views.1440.visibleText

Before:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscriptions\nLocal workspace\nList\nDetail\nEdit\nTimeline\nSearch\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
```
After:
```json
"SUBSCRIPTION WORKSPACE\n\nSubscriptions\nLocal workspace\nList\nDetail\nEdit\nTimeline\nSearch\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
```

## views.1440.measurements

Before:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 62,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "span",
      "text": "Archived",
      "lines": [
        "Archive",
        "d"
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
  "elementCount": 62,
  "overflow": [],
  "glyphWraps": []
}
```

## views.1440.regions

Before:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
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
    "id": "list-slot-search-1",
    "component": "Input",
    "text": ""
  },
  {
    "id": "list-slot-filters-2",
    "component": "Select",
    "text": "All states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "list-list-toolbar-4-sort",
    "component": "Select",
    "text": "Name A–Z\nName Z–A"
  },
  {
    "id": "list-list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5",
    "component": "section",
    "text": "Subscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-ve-items-13-0",
    "component": "ArchivedRowOverlay",
    "text": "Subscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5-row-0",
    "component": "Button",
    "text": "Subscription 10\n★\nTrialing\nJan 1, 2026, 12:00 AM\n$190.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-0",
    "component": "Text",
    "text": "Subscription 10"
  },
  {
    "id": "list-ve-items-10-0",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "list-ve-items-11-0",
    "component": "RelativeTimestamp",
    "text": "Jan 1, 2026, 12:00 AM"
  },
  {
    "id": "list-slot-toolbar-actions-3-0",
    "component": "BillingSummaryBadge",
    "text": "$190.00 · yearly"
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  }
]
```
After:
```json
[
  {
    "id": "list-screen",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived\n1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
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
    "id": "list-slot-search-1",
    "component": "Input",
    "text": ""
  },
  {
    "id": "list-slot-filters-2",
    "component": "Select",
    "text": "All states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "list-list-toolbar-4-sort",
    "component": "Select",
    "text": "Name A–Z\nName Z–A"
  },
  {
    "id": "list-list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nSubscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5",
    "component": "section",
    "text": "Subscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-ve-items-13-0",
    "component": "ArchivedRowOverlay",
    "text": "Subscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly\nArchived"
  },
  {
    "id": "list-list-items-5-row-0",
    "component": "Button",
    "text": "Subscription 10\n★\nTrialing\nMar 1, 2026, 12:00 PM\n$190.00 · yearly"
  },
  {
    "id": "list-list-items-5-title-0",
    "component": "Text",
    "text": "Subscription 10"
  },
  {
    "id": "list-ve-items-10-0",
    "component": "StatusBadge",
    "text": "★\nTrialing"
  },
  {
    "id": "list-ve-items-11-0",
    "component": "RelativeTimestamp",
    "text": "Mar 1, 2026, 12:00 PM"
  },
  {
    "id": "list-slot-toolbar-actions-3-0",
    "component": "BillingSummaryBadge",
    "text": "$190.00 · yearly"
  },
  {
    "id": "list-list-pagination-7",
    "component": "Stack",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  },
  {
    "id": "list-slot-pagination-8",
    "component": "PaginationBar",
    "text": "1 record\nShowing 1–1 of 1\n‹\n1\n›\nPage 1 of 1"
  }
]
```
