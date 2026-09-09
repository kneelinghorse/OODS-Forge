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
"sha256:ac671d6846ca2495505fdfaadbaf5d7198fac029c0723dd865ba5e410484d68e"
```
After:
```json
"sha256:3161d8f9c88a1dd4168899b5e946291dac01a60db7e0784b23902d3de730c7bb"
```

## files.src/GeneratedUI.tsx

Before:
```json
"sha256:34030d5525ce6dcb242ae9caf44875382ad105559761b50080d60e1eda87bd74"
```
After:
```json
"sha256:218f876ab283a5be88d04c6ae595462bf2a9f33deb12308cc4f4ab4b196f52f8"
```

## views.390.accessibility

Before:
```json
"- search:\n  - text: Search\n  - searchbox \"Search\"\n- text: Whether the subscription will cancel at the natural billing period end.\n- combobox \"Whether the subscription will cancel at the natural billing period end.\":\n  - option \"Enter cancel at period end\" [disabled]\n- text: $19.99 · monthly Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - text: No items\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
```
After:
```json
"- search \"Search\":\n  - text: Search\n  - searchbox \"Search\"\n- text: Status\n- combobox \"Status\":\n  - option \"All states\" [selected]\n  - option \"future\"\n  - option \"trialing\"\n  - option \"active\"\n  - option \"paused\"\n  - option \"pending cancellation\"\n  - option \"past due\"\n  - option \"unpaid\"\n  - option \"terminated\"\n- text: Sort\n- combobox \"Sort\":\n  - option \"Name A–Z\" [selected]\n  - option \"Name Z–A\"\n- tablist \"Archive views\":\n  - tab \"Active\" [selected]\n  - tab \"Archived\"\n- tabpanel \"Active\":\n  - status:\n    - paragraph: No records found.\n- navigation \"Pagination\":\n  - text: 0 records\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n  - text: Page 1 of 1"
```

## views.390.visibleText

Before:
```json
null
```
After:
```json
"Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\n\nNo records found.\n\n0 records\n‹\n›\nPage 1 of 1"
```

## views.390.values

Before:
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
    "name": "Whether the subscription will cancel at the natural billing period end.*",
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
  "elementCount": 32,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "span",
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
  "elementCount": 37,
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
    "text": "Search\nWhether the subscription will cancel at the natural billing period end.*\nEnter cancel at period end\n$19.99 · monthly\n•\nFUTURE\nTimestamp for the most recent modification, when available.\nNo items\n‹\n›"
  },
  {
    "id": "list-toolbar-4",
    "component": "Stack",
    "text": "Search\nWhether the subscription will cancel at the natural billing period end.*\nEnter cancel at period end\n$19.99 · monthly"
  },
  {
    "id": "",
    "component": "SearchInput",
    "text": "Search"
  },
  {
    "id": "slot-search-1",
    "component": "SearchInput",
    "text": ""
  },
  {
    "id": "slot-filters-2",
    "component": "Select",
    "text": "Enter cancel at period end"
  },
  {
    "id": "slot-toolbar-actions-3",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · monthly"
  },
  {
    "id": "list-items-5",
    "component": "Stack",
    "text": "•\nFUTURE\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "slot-items-6",
    "component": "Stack",
    "text": "•\nFUTURE\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "ve-items-10",
    "component": "StatusBadge",
    "text": "•\nFUTURE"
  },
  {
    "id": "ve-items-11",
    "component": "RelativeTimestamp",
    "text": "Timestamp for the most recent modification, when available."
  },
  {
    "id": "list-pagination-7",
    "component": "Stack",
    "text": "No items\n‹\n›"
  },
  {
    "id": "slot-pagination-8",
    "component": "PaginationBar",
    "text": "No items\n‹\n›"
  }
]
```
After:
```json
[
  {
    "id": "screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\n\nNo records found.\n\n0 records\n‹\n›\nPage 1 of 1"
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
    "id": "slot-search-1",
    "component": "Input",
    "text": ""
  },
  {
    "id": "slot-filters-2",
    "component": "Select",
    "text": "All states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "list-toolbar-4-sort",
    "component": "Select",
    "text": "Name A–Z\nName Z–A"
  },
  {
    "id": "list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\n\nNo records found."
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
"- search:\n  - text: Search\n  - searchbox \"Search\"\n- text: Whether the subscription will cancel at the natural billing period end.\n- combobox \"Whether the subscription will cancel at the natural billing period end.\":\n  - option \"Enter cancel at period end\" [disabled]\n- text: $19.99 · monthly Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - text: No items\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
```
After:
```json
"- search \"Search\":\n  - text: Search\n  - searchbox \"Search\"\n- text: Status\n- combobox \"Status\":\n  - option \"All states\" [selected]\n  - option \"future\"\n  - option \"trialing\"\n  - option \"active\"\n  - option \"paused\"\n  - option \"pending cancellation\"\n  - option \"past due\"\n  - option \"unpaid\"\n  - option \"terminated\"\n- text: Sort\n- combobox \"Sort\":\n  - option \"Name A–Z\" [selected]\n  - option \"Name Z–A\"\n- tablist \"Archive views\":\n  - tab \"Active\" [selected]\n  - tab \"Archived\"\n- tabpanel \"Active\":\n  - status:\n    - paragraph: No records found.\n- navigation \"Pagination\":\n  - text: 0 records\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n  - text: Page 1 of 1"
```

## views.820.visibleText

Before:
```json
null
```
After:
```json
"Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\n\nNo records found.\n\n0 records\n‹\n›\nPage 1 of 1"
```

## views.820.values

Before:
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
    "name": "Whether the subscription will cancel at the natural billing period end.*",
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
  "elementCount": 32,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "span",
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
  "elementCount": 37,
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
    "text": "Search\nWhether the subscription will cancel at the natural billing period end.*\nEnter cancel at period end\n$19.99 · monthly\n•\nFUTURE\nTimestamp for the most recent modification, when available.\nNo items\n‹\n›"
  },
  {
    "id": "list-toolbar-4",
    "component": "Stack",
    "text": "Search\nWhether the subscription will cancel at the natural billing period end.*\nEnter cancel at period end\n$19.99 · monthly"
  },
  {
    "id": "",
    "component": "SearchInput",
    "text": "Search"
  },
  {
    "id": "slot-search-1",
    "component": "SearchInput",
    "text": ""
  },
  {
    "id": "slot-filters-2",
    "component": "Select",
    "text": "Enter cancel at period end"
  },
  {
    "id": "slot-toolbar-actions-3",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · monthly"
  },
  {
    "id": "list-items-5",
    "component": "Stack",
    "text": "•\nFUTURE\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "slot-items-6",
    "component": "Stack",
    "text": "•\nFUTURE\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "ve-items-10",
    "component": "StatusBadge",
    "text": "•\nFUTURE"
  },
  {
    "id": "ve-items-11",
    "component": "RelativeTimestamp",
    "text": "Timestamp for the most recent modification, when available."
  },
  {
    "id": "list-pagination-7",
    "component": "Stack",
    "text": "No items\n‹\n›"
  },
  {
    "id": "slot-pagination-8",
    "component": "PaginationBar",
    "text": "No items\n‹\n›"
  }
]
```
After:
```json
[
  {
    "id": "screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\n\nNo records found.\n\n0 records\n‹\n›\nPage 1 of 1"
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
    "id": "slot-search-1",
    "component": "Input",
    "text": ""
  },
  {
    "id": "slot-filters-2",
    "component": "Select",
    "text": "All states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "list-toolbar-4-sort",
    "component": "Select",
    "text": "Name A–Z\nName Z–A"
  },
  {
    "id": "list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\n\nNo records found."
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
"- search:\n  - text: Search\n  - searchbox \"Search\"\n- text: Whether the subscription will cancel at the natural billing period end.\n- combobox \"Whether the subscription will cancel at the natural billing period end.\":\n  - option \"Enter cancel at period end\" [disabled]\n- text: $19.99 · monthly Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - text: No items\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
```
After:
```json
"- search \"Search\":\n  - text: Search\n  - searchbox \"Search\"\n- text: Status\n- combobox \"Status\":\n  - option \"All states\" [selected]\n  - option \"future\"\n  - option \"trialing\"\n  - option \"active\"\n  - option \"paused\"\n  - option \"pending cancellation\"\n  - option \"past due\"\n  - option \"unpaid\"\n  - option \"terminated\"\n- text: Sort\n- combobox \"Sort\":\n  - option \"Name A–Z\" [selected]\n  - option \"Name Z–A\"\n- tablist \"Archive views\":\n  - tab \"Active\" [selected]\n  - tab \"Archived\"\n- tabpanel \"Active\":\n  - status:\n    - paragraph: No records found.\n- navigation \"Pagination\":\n  - text: 0 records\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n  - text: Page 1 of 1"
```

## views.1440.visibleText

Before:
```json
null
```
After:
```json
"Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\n\nNo records found.\n\n0 records\n‹\n›\nPage 1 of 1"
```

## views.1440.values

Before:
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
    "name": "Whether the subscription will cancel at the natural billing period end.*",
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
  "elementCount": 32,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 37,
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
    "text": "Search\nWhether the subscription will cancel at the natural billing period end.*\nEnter cancel at period end\n$19.99 · monthly\n•\nFUTURE\nTimestamp for the most recent modification, when available.\nNo items\n‹\n›"
  },
  {
    "id": "list-toolbar-4",
    "component": "Stack",
    "text": "Search\nWhether the subscription will cancel at the natural billing period end.*\nEnter cancel at period end\n$19.99 · monthly"
  },
  {
    "id": "",
    "component": "SearchInput",
    "text": "Search"
  },
  {
    "id": "slot-search-1",
    "component": "SearchInput",
    "text": ""
  },
  {
    "id": "slot-filters-2",
    "component": "Select",
    "text": "Enter cancel at period end"
  },
  {
    "id": "slot-toolbar-actions-3",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · monthly"
  },
  {
    "id": "list-items-5",
    "component": "Stack",
    "text": "•\nFUTURE\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "slot-items-6",
    "component": "Stack",
    "text": "•\nFUTURE\nTimestamp for the most recent modification, when available."
  },
  {
    "id": "ve-items-10",
    "component": "StatusBadge",
    "text": "•\nFUTURE"
  },
  {
    "id": "ve-items-11",
    "component": "RelativeTimestamp",
    "text": "Timestamp for the most recent modification, when available."
  },
  {
    "id": "list-pagination-7",
    "component": "Stack",
    "text": "No items\n‹\n›"
  },
  {
    "id": "slot-pagination-8",
    "component": "PaginationBar",
    "text": "No items\n‹\n›"
  }
]
```
After:
```json
[
  {
    "id": "screen-list-9",
    "component": "Stack",
    "text": "Search\nStatus\nAll states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated\nSort\nName A–Z\nName Z–A\nActive\nArchived\n\nNo records found.\n\n0 records\n‹\n›\nPage 1 of 1"
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
    "id": "slot-search-1",
    "component": "Input",
    "text": ""
  },
  {
    "id": "slot-filters-2",
    "component": "Select",
    "text": "All states\nfuture\ntrialing\nactive\npaused\npending cancellation\npast due\nunpaid\nterminated"
  },
  {
    "id": "list-toolbar-4-sort",
    "component": "Select",
    "text": "Name A–Z\nName Z–A"
  },
  {
    "id": "list-items-5-archive-tabs",
    "component": "Tabs",
    "text": "Active\nArchived\n\nNo records found."
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
