# Render receipt diff

18 differences.

## schemaHash

Before:
```json
"sha256:1b1fa0ec6c2430af5b3e837231f131617c97dbdad682bbf1cf80bce505b66002"
```
After:
```json
"sha256:91240a1969a1c4633dba58b6ba9ecd0208d678964f87518300bba3e3b31bba8f"
```

## artifactContentHash

Before:
```json
"sha256:111322028b17de837f1da4a26953b812329b5a170888af916b6480daf3ac4b4a"
```
After:
```json
"sha256:8ff682c136d4ffd0cd728ba038c07a1d8194655bc40a0e76fdb2162e5a0536a7"
```

## files.src/GeneratedUI.vue

Before:
```json
"sha256:9cdae19799bfea2869771185ea4fe5effe86afac61e3780b03a9b048d94632c7"
```
After:
```json
"sha256:51f62f5af5519dbda0b3967e251687e00aa352f2d1d818fb42311ba63870309a"
```

## views.390.accessibility

Before:
```json
"- search \"Search…\":\n  - searchbox \"Search…\"\n- text: Whether the subscription will cancel at the natural billing period end.\n- combobox \"Whether the subscription will cancel at the natural billing period end.\":\n  - option \"Enter cancel at period end\" [disabled]\n- text: $19.99 · monthly Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - list:\n    - listitem:\n      - button \"Previous page\" [disabled]: ‹\n    - listitem:\n      - button \"Next page\" [disabled]: ›\n  - text: 1 / 0\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
```
After:
```json
"- search \"Search\":\n  - text: Search\n  - searchbox \"Search\"\n- text: Status\n- combobox \"Status\":\n  - option \"All states\" [selected]\n  - option \"future\"\n  - option \"trialing\"\n  - option \"active\"\n  - option \"paused\"\n  - option \"pending cancellation\"\n  - option \"past due\"\n  - option \"unpaid\"\n  - option \"terminated\"\n- text: Sort\n- combobox \"Sort\":\n  - option \"Name A–Z\" [selected]\n  - option \"Name Z–A\"\n- tablist \"Archive views\":\n  - tab \"Active\" [selected]\n  - tab \"Archived\"\n- tabpanel \"Active\":\n  - status: No records found.\n- navigation \"Pagination\":\n  - text: 0 records\n  - list:\n    - listitem:\n      - button \"Previous page\" [disabled]: ‹\n    - listitem:\n      - button \"Next page\" [disabled]: ›\n  - text: Page 1 of 1"
```

## views.390.visibleText

Before:
```json
null
```
After:
```json
"Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nNo records found.\n0 records\n‹\n›\nPage 1 of 1"
```

## views.390.values

Before:
```json
[
  {
    "element": "slot-search-1",
    "name": "Search…",
    "value": "",
    "checked": false
  },
  {
    "element": "slot-filters-2",
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
    "element": "slot-search-1",
    "name": "Search",
    "value": "",
    "checked": false
  },
  {
    "element": "slot-filters-2",
    "name": "Status",
    "value": "",
    "checked": false
  },
  {
    "element": "list-toolbar-4-sort",
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
  "elementCount": 27,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "label",
      "text": "Whether the subscription will cancel at the natural billing period end.",
      "lines": [
        "Whether the",
        "subscription will cancel",
        "at the natural billing",
        "period end."
      ]
    },
    {
      "element": "slot-toolbar-actions-3",
      "text": "$19.99 · monthly",
      "lines": [
        "$19.99 ·",
        "monthly"
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
  "elementCount": 30,
  "overflow": [],
  "glyphWraps": []
}
```

## views.390.regions

Before:
```json
[
  {
    "id": "screen-list-9",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.99 · monthly\n⏲\nFuture\nTimestamp for the most recent modification, when available.\n‹\n›\n1\n/ 0"
  },
  {
    "id": "list-toolbar-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.99 · monthly"
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
    "id": "slot-toolbar-actions-3",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · monthly"
  },
  {
    "id": "list-items-5",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "slot-items-6",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "ve-items-10",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "ve-items-11",
    "component": "RelativeTimestamp",
    "text": "Timestamp for the most recent modification, when available."
  },
  {
    "id": "list-pagination-7",
    "component": "Stack",
    "text": "‹\n›\n1\n/ 0"
  },
  {
    "id": "slot-pagination-8",
    "component": "PaginationBar",
    "text": "‹\n›\n1\n/ 0"
  }
]
```
After:
```json
[
  {
    "id": "screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nNo records found.\n0 records\n‹\n›\nPage 1 of 1"
  },
  {
    "id": "list-toolbar-4",
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
    "id": "list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nNo records found."
  },
  {
    "id": "list-items-5",
    "component": "section",
    "text": "No records found."
  },
  {
    "id": "list-items-5-empty",
    "component": "Banner",
    "text": "No records found."
  },
  {
    "id": "list-pagination-7",
    "component": "Stack",
    "text": "0 records\n‹\n›\nPage 1 of 1"
  },
  {
    "id": "slot-pagination-8",
    "component": "PaginationBar",
    "text": "0 records\n‹\n›\nPage 1 of 1"
  }
]
```

## views.820.accessibility

Before:
```json
"- search \"Search…\":\n  - searchbox \"Search…\"\n- text: Whether the subscription will cancel at the natural billing period end.\n- combobox \"Whether the subscription will cancel at the natural billing period end.\":\n  - option \"Enter cancel at period end\" [disabled]\n- text: $19.99 · monthly Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - list:\n    - listitem:\n      - button \"Previous page\" [disabled]: ‹\n    - listitem:\n      - button \"Next page\" [disabled]: ›\n  - text: 1 / 0\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
```
After:
```json
"- search \"Search\":\n  - text: Search\n  - searchbox \"Search\"\n- text: Status\n- combobox \"Status\":\n  - option \"All states\" [selected]\n  - option \"future\"\n  - option \"trialing\"\n  - option \"active\"\n  - option \"paused\"\n  - option \"pending cancellation\"\n  - option \"past due\"\n  - option \"unpaid\"\n  - option \"terminated\"\n- text: Sort\n- combobox \"Sort\":\n  - option \"Name A–Z\" [selected]\n  - option \"Name Z–A\"\n- tablist \"Archive views\":\n  - tab \"Active\" [selected]\n  - tab \"Archived\"\n- tabpanel \"Active\":\n  - status: No records found.\n- navigation \"Pagination\":\n  - text: 0 records\n  - list:\n    - listitem:\n      - button \"Previous page\" [disabled]: ‹\n    - listitem:\n      - button \"Next page\" [disabled]: ›\n  - text: Page 1 of 1"
```

## views.820.visibleText

Before:
```json
null
```
After:
```json
"Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nNo records found.\n0 records\n‹\n›\nPage 1 of 1"
```

## views.820.values

Before:
```json
[
  {
    "element": "slot-search-1",
    "name": "Search…",
    "value": "",
    "checked": false
  },
  {
    "element": "slot-filters-2",
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
    "element": "slot-search-1",
    "name": "Search",
    "value": "",
    "checked": false
  },
  {
    "element": "slot-filters-2",
    "name": "Status",
    "value": "",
    "checked": false
  },
  {
    "element": "list-toolbar-4-sort",
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
  "elementCount": 27,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "label",
      "text": "Whether the subscription will cancel at the natural billing period end.",
      "lines": [
        "Whether the subscription will cancel at the natural billing period",
        "end."
      ]
    },
    {
      "element": "slot-toolbar-actions-3",
      "text": "$19.99 · monthly",
      "lines": [
        "$19.99 ·",
        "monthly"
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
  "elementCount": 30,
  "overflow": [],
  "glyphWraps": []
}
```

## views.820.regions

Before:
```json
[
  {
    "id": "screen-list-9",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.99 · monthly\n⏲\nFuture\nTimestamp for the most recent modification, when available.\n‹\n›\n1\n/ 0"
  },
  {
    "id": "list-toolbar-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.99 · monthly"
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
    "id": "slot-toolbar-actions-3",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · monthly"
  },
  {
    "id": "list-items-5",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "slot-items-6",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "ve-items-10",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "ve-items-11",
    "component": "RelativeTimestamp",
    "text": "Timestamp for the most recent modification, when available."
  },
  {
    "id": "list-pagination-7",
    "component": "Stack",
    "text": "‹\n›\n1\n/ 0"
  },
  {
    "id": "slot-pagination-8",
    "component": "PaginationBar",
    "text": "‹\n›\n1\n/ 0"
  }
]
```
After:
```json
[
  {
    "id": "screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nNo records found.\n0 records\n‹\n›\nPage 1 of 1"
  },
  {
    "id": "list-toolbar-4",
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
    "id": "list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nNo records found."
  },
  {
    "id": "list-items-5",
    "component": "section",
    "text": "No records found."
  },
  {
    "id": "list-items-5-empty",
    "component": "Banner",
    "text": "No records found."
  },
  {
    "id": "list-pagination-7",
    "component": "Stack",
    "text": "0 records\n‹\n›\nPage 1 of 1"
  },
  {
    "id": "slot-pagination-8",
    "component": "PaginationBar",
    "text": "0 records\n‹\n›\nPage 1 of 1"
  }
]
```

## views.1440.accessibility

Before:
```json
"- search \"Search…\":\n  - searchbox \"Search…\"\n- text: Whether the subscription will cancel at the natural billing period end.\n- combobox \"Whether the subscription will cancel at the natural billing period end.\":\n  - option \"Enter cancel at period end\" [disabled]\n- text: $19.99 · monthly Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - list:\n    - listitem:\n      - button \"Previous page\" [disabled]: ‹\n    - listitem:\n      - button \"Next page\" [disabled]: ›\n  - text: 1 / 0\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
```
After:
```json
"- search \"Search\":\n  - text: Search\n  - searchbox \"Search\"\n- text: Status\n- combobox \"Status\":\n  - option \"All states\" [selected]\n  - option \"future\"\n  - option \"trialing\"\n  - option \"active\"\n  - option \"paused\"\n  - option \"pending cancellation\"\n  - option \"past due\"\n  - option \"unpaid\"\n  - option \"terminated\"\n- text: Sort\n- combobox \"Sort\":\n  - option \"Name A–Z\" [selected]\n  - option \"Name Z–A\"\n- tablist \"Archive views\":\n  - tab \"Active\" [selected]\n  - tab \"Archived\"\n- tabpanel \"Active\":\n  - status: No records found.\n- navigation \"Pagination\":\n  - text: 0 records\n  - list:\n    - listitem:\n      - button \"Previous page\" [disabled]: ‹\n    - listitem:\n      - button \"Next page\" [disabled]: ›\n  - text: Page 1 of 1"
```

## views.1440.visibleText

Before:
```json
null
```
After:
```json
"Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nNo records found.\n0 records\n‹\n›\nPage 1 of 1"
```

## views.1440.values

Before:
```json
[
  {
    "element": "slot-search-1",
    "name": "Search…",
    "value": "",
    "checked": false
  },
  {
    "element": "slot-filters-2",
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
    "element": "slot-search-1",
    "name": "Search",
    "value": "",
    "checked": false
  },
  {
    "element": "slot-filters-2",
    "name": "Status",
    "value": "",
    "checked": false
  },
  {
    "element": "list-toolbar-4-sort",
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
  "elementCount": 27,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 30,
  "overflow": [],
  "glyphWraps": []
}
```

## views.1440.regions

Before:
```json
[
  {
    "id": "screen-list-9",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.99 · monthly\n⏲\nFuture\nTimestamp for the most recent modification, when available.\n‹\n›\n1\n/ 0"
  },
  {
    "id": "list-toolbar-4",
    "component": "Stack",
    "text": "Whether the subscription will cancel at the natural billing period end.\nEnter cancel at period end\n$19.99 · monthly"
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
    "id": "slot-toolbar-actions-3",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · monthly"
  },
  {
    "id": "list-items-5",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "slot-items-6",
    "component": "Stack",
    "text": "⏲\nFuture\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "ve-items-10",
    "component": "StatusBadge",
    "text": "⏲\nFuture"
  },
  {
    "id": "ve-items-11",
    "component": "RelativeTimestamp",
    "text": "Timestamp for the most recent modification, when available."
  },
  {
    "id": "list-pagination-7",
    "component": "Stack",
    "text": "‹\n›\n1\n/ 0"
  },
  {
    "id": "slot-pagination-8",
    "component": "PaginationBar",
    "text": "‹\n›\n1\n/ 0"
  }
]
```
After:
```json
[
  {
    "id": "screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\nNo records found.\n0 records\n‹\n›\nPage 1 of 1"
  },
  {
    "id": "list-toolbar-4",
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
    "id": "list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\nNo records found."
  },
  {
    "id": "list-items-5",
    "component": "section",
    "text": "No records found."
  },
  {
    "id": "list-items-5-empty",
    "component": "Banner",
    "text": "No records found."
  },
  {
    "id": "list-pagination-7",
    "component": "Stack",
    "text": "0 records\n‹\n›\nPage 1 of 1"
  },
  {
    "id": "slot-pagination-8",
    "component": "PaginationBar",
    "text": "0 records\n‹\n›\nPage 1 of 1"
  }
]
```
