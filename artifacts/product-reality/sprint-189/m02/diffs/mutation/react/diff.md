# Render receipt diff

14 differences.

## schemaHash

Before:
```json
"sha256:1b1fa0ec6c2430af5b3e837231f131617c97dbdad682bbf1cf80bce505b66002"
```
After:
```json
"sha256:a7fecaffd291092a8bc227965e5486a2b7e38fd24240b0e0fb8fddd3856363c9"
```

## artifactContentHash

Before:
```json
"sha256:ac671d6846ca2495505fdfaadbaf5d7198fac029c0723dd865ba5e410484d68e"
```
After:
```json
"sha256:1e69dfe1a2581db9ba3965835cf4d8d6193cb212899063bf87260ff2007c7ad9"
```

## files.src/GeneratedUI.tsx

Before:
```json
"sha256:34030d5525ce6dcb242ae9caf44875382ad105559761b50080d60e1eda87bd74"
```
After:
```json
"sha256:ecb852d92307ce975854a4a60cf0d605deb65278da43038484e5d3a694e1c084"
```

## views.390.accessibility

Before:
```json
"- search:\n  - text: Search\n  - searchbox \"Search\"\n- text: Whether the subscription will cancel at the natural billing period end.\n- combobox \"Whether the subscription will cancel at the natural billing period end.\":\n  - option \"Enter cancel at period end\" [disabled]\n- text: $19.99 · monthly Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - text: No items\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
```
After:
```json
"- search:\n  - text: Search\n  - searchbox \"Search\"\n- text: Recurring price expressed in minor units (e.g., cents).\n- spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"0\"\n- text: Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - text: No items\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
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
    "name": "Recurring price expressed in minor units (e.g., cents).*",
    "value": "0",
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
  "elementCount": 32,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "span",
      "text": "Recurring price expressed in minor units (e.g., cents).",
      "lines": [
        "Recurring price expressed",
        "in minor units (e.g., cents)."
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
    "text": "Search\nRecurring price expressed in minor units (e.g., cents).*\n•\nFUTURE\nTimestamp for the most recent modification, when available.\nNo items\n‹\n›"
  },
  {
    "id": "list-toolbar-4",
    "component": "Stack",
    "text": "Search\nRecurring price expressed in minor units (e.g., cents).*"
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
    "component": "Input",
    "text": ""
  },
  {
    "id": "slot-toolbar-actions-3",
    "component": "Stack",
    "text": ""
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
    "id": "ve-items-11",
    "component": "StatusBadge",
    "text": "•\nFUTURE"
  },
  {
    "id": "ve-items-12",
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

## views.820.accessibility

Before:
```json
"- search:\n  - text: Search\n  - searchbox \"Search\"\n- text: Whether the subscription will cancel at the natural billing period end.\n- combobox \"Whether the subscription will cancel at the natural billing period end.\":\n  - option \"Enter cancel at period end\" [disabled]\n- text: $19.99 · monthly Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - text: No items\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
```
After:
```json
"- search:\n  - text: Search\n  - searchbox \"Search\"\n- text: Recurring price expressed in minor units (e.g., cents).\n- spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"0\"\n- text: Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - text: No items\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
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
    "name": "Recurring price expressed in minor units (e.g., cents).*",
    "value": "0",
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
  "elementCount": 32,
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
    "text": "Search\nRecurring price expressed in minor units (e.g., cents).*\n•\nFUTURE\nTimestamp for the most recent modification, when available.\nNo items\n‹\n›"
  },
  {
    "id": "list-toolbar-4",
    "component": "Stack",
    "text": "Search\nRecurring price expressed in minor units (e.g., cents).*"
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
    "component": "Input",
    "text": ""
  },
  {
    "id": "slot-toolbar-actions-3",
    "component": "Stack",
    "text": ""
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
    "id": "ve-items-11",
    "component": "StatusBadge",
    "text": "•\nFUTURE"
  },
  {
    "id": "ve-items-12",
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

## views.1440.accessibility

Before:
```json
"- search:\n  - text: Search\n  - searchbox \"Search\"\n- text: Whether the subscription will cancel at the natural billing period end.\n- combobox \"Whether the subscription will cancel at the natural billing period end.\":\n  - option \"Enter cancel at period end\" [disabled]\n- text: $19.99 · monthly Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - text: No items\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
```
After:
```json
"- search:\n  - text: Search\n  - searchbox \"Search\"\n- text: Recurring price expressed in minor units (e.g., cents).\n- spinbutton \"Recurring price expressed in minor units (e.g., cents).\": \"0\"\n- text: Future\n- time: Timestamp for the most recent modification, when available.\n- navigation \"Pagination\":\n  - text: No items\n  - button \"Previous page\" [disabled]: ‹\n  - list\n  - button \"Next page\" [disabled]: ›\n- group \"Screen actions\":\n  - button \"Filter\"\n  - button \"Open row\"\n  - button \"Sort\""
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
    "name": "Recurring price expressed in minor units (e.g., cents).*",
    "value": "0",
    "checked": false
  }
]
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
    "text": "Search\nRecurring price expressed in minor units (e.g., cents).*\n•\nFUTURE\nTimestamp for the most recent modification, when available.\nNo items\n‹\n›"
  },
  {
    "id": "list-toolbar-4",
    "component": "Stack",
    "text": "Search\nRecurring price expressed in minor units (e.g., cents).*"
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
    "component": "Input",
    "text": ""
  },
  {
    "id": "slot-toolbar-actions-3",
    "component": "Stack",
    "text": ""
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
    "id": "ve-items-11",
    "component": "StatusBadge",
    "text": "•\nFUTURE"
  },
  {
    "id": "ve-items-12",
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
