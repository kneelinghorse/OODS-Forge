# Render receipt diff

15 differences.

## schemaHash

Before:
```json
"sha256:a29daa17471766f999a3eaaa0f4531bcafb2ffb187f0a0113ce81eebf3688b67"
```
After:
```json
"sha256:ec17f54268f89e48b9cb1638df97fc12bf63d1e0413a1cb9598d515292f1ba79"
```

## artifactContentHash

Before:
```json
"sha256:d2085b344cde9ebf191555c5e3c914c72a2867875cce91cf330bf20be4b40d9e"
```
After:
```json
"sha256:81ed0e1d72bc1dd4c6fcc237b9b5086fcb9abebc77b58334f2b636b9811c3493"
```

## files.src/GeneratedUI.tsx

Before:
```json
"sha256:bb63ae6a6cd524d4ed8659982c39a6909d553443c302586f7d61723c77c4190c"
```
After:
```json
"sha256:a741becf21391f90d1e7523438aa32f2c4a9975bbcec663e375c67c298f2ebcd"
```

## views.390.accessibility

Before:
```json
"- text: \"0\"\n- log \"Payment events\":\n  - heading \"Payment events\" [level=3]\n  - paragraph: Invalid currency CONSUMER CURRENCY · pending\n  - list:\n    - listitem:\n      - strong: Last payment\n      - time: Sep 5, 2026\n    - listitem:\n      - strong: Next payment\n      - time: Sep 5, 2026"
```
After:
```json
"- text: Consumer plan name $19.99 · monthly\n- status:\n  - paragraph: No events yet."
```

## views.390.visibleText

Before:
```json
null
```
After:
```json
"Consumer plan name\n$19.99 · monthly\n\nNo events yet."
```

## views.390.measurements

Before:
```json
{
  "viewportWidth": 390,
  "documentWidth": 390,
  "elementCount": 24,
  "overflow": [],
  "glyphWraps": [
    {
      "element": "p",
      "text": "Invalid currency CONSUMER CURRENCY · pending",
      "lines": [
        "Invalid currency CONSUMER CURRENCY",
        "· pending"
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
  "elementCount": 9,
  "overflow": [],
  "glyphWraps": []
}
```

## views.390.regions

Before:
```json
[
  {
    "id": "screen-timeline-14",
    "component": "Stack",
    "text": "0\nPayment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "timeline-header-1",
    "component": "Stack",
    "text": "0"
  },
  {
    "id": "slot-header-2",
    "component": "Text",
    "text": "0"
  },
  {
    "id": "timeline-entries-13",
    "component": "Stack",
    "text": "Payment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "timeline-entry-3",
    "component": "Card",
    "text": "Payment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "slot-entry-0-4",
    "component": "PaymentEventTimeline",
    "text": "Payment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "timeline-entry-5",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-1-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-entry-7",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-2-8",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-entry-9",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-3-10",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-entry-11",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-4-12",
    "component": "Stack",
    "text": ""
  }
]
```
After:
```json
[
  {
    "id": "screen-timeline-14",
    "component": "Stack",
    "text": "Consumer plan name\n$19.99 · monthly\n\nNo events yet."
  },
  {
    "id": "timeline-header-1",
    "component": "Stack",
    "text": "Consumer plan name\n$19.99 · monthly"
  },
  {
    "id": "timeline-header-1-title",
    "component": "Text",
    "text": "Consumer plan name"
  },
  {
    "id": "timeline-header-1-billing",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · monthly"
  },
  {
    "id": "timeline-entries-13-empty",
    "component": "Banner",
    "text": "No events yet."
  }
]
```

## views.820.accessibility

Before:
```json
"- text: \"0\"\n- log \"Payment events\":\n  - heading \"Payment events\" [level=3]\n  - paragraph: Invalid currency CONSUMER CURRENCY · pending\n  - list:\n    - listitem:\n      - strong: Last payment\n      - time: Sep 5, 2026\n    - listitem:\n      - strong: Next payment\n      - time: Sep 5, 2026"
```
After:
```json
"- text: Consumer plan name $19.99 · monthly\n- status:\n  - paragraph: No events yet."
```

## views.820.visibleText

Before:
```json
null
```
After:
```json
"Consumer plan name\n$19.99 · monthly\n\nNo events yet."
```

## views.820.measurements

Before:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 24,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 820,
  "documentWidth": 820,
  "elementCount": 9,
  "overflow": [],
  "glyphWraps": []
}
```

## views.820.regions

Before:
```json
[
  {
    "id": "screen-timeline-14",
    "component": "Stack",
    "text": "0\nPayment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "timeline-header-1",
    "component": "Stack",
    "text": "0"
  },
  {
    "id": "slot-header-2",
    "component": "Text",
    "text": "0"
  },
  {
    "id": "timeline-entries-13",
    "component": "Stack",
    "text": "Payment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "timeline-entry-3",
    "component": "Card",
    "text": "Payment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "slot-entry-0-4",
    "component": "PaymentEventTimeline",
    "text": "Payment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "timeline-entry-5",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-1-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-entry-7",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-2-8",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-entry-9",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-3-10",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-entry-11",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-4-12",
    "component": "Stack",
    "text": ""
  }
]
```
After:
```json
[
  {
    "id": "screen-timeline-14",
    "component": "Stack",
    "text": "Consumer plan name\n$19.99 · monthly\n\nNo events yet."
  },
  {
    "id": "timeline-header-1",
    "component": "Stack",
    "text": "Consumer plan name\n$19.99 · monthly"
  },
  {
    "id": "timeline-header-1-title",
    "component": "Text",
    "text": "Consumer plan name"
  },
  {
    "id": "timeline-header-1-billing",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · monthly"
  },
  {
    "id": "timeline-entries-13-empty",
    "component": "Banner",
    "text": "No events yet."
  }
]
```

## views.1440.accessibility

Before:
```json
"- text: \"0\"\n- log \"Payment events\":\n  - heading \"Payment events\" [level=3]\n  - paragraph: Invalid currency CONSUMER CURRENCY · pending\n  - list:\n    - listitem:\n      - strong: Last payment\n      - time: Sep 5, 2026\n    - listitem:\n      - strong: Next payment\n      - time: Sep 5, 2026"
```
After:
```json
"- text: Consumer plan name $19.99 · monthly\n- status:\n  - paragraph: No events yet."
```

## views.1440.visibleText

Before:
```json
null
```
After:
```json
"Consumer plan name\n$19.99 · monthly\n\nNo events yet."
```

## views.1440.measurements

Before:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 24,
  "overflow": [],
  "glyphWraps": []
}
```
After:
```json
{
  "viewportWidth": 1440,
  "documentWidth": 1440,
  "elementCount": 9,
  "overflow": [],
  "glyphWraps": []
}
```

## views.1440.regions

Before:
```json
[
  {
    "id": "screen-timeline-14",
    "component": "Stack",
    "text": "0\nPayment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "timeline-header-1",
    "component": "Stack",
    "text": "0"
  },
  {
    "id": "slot-header-2",
    "component": "Text",
    "text": "0"
  },
  {
    "id": "timeline-entries-13",
    "component": "Stack",
    "text": "Payment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "timeline-entry-3",
    "component": "Card",
    "text": "Payment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "slot-entry-0-4",
    "component": "PaymentEventTimeline",
    "text": "Payment events\n\nInvalid currency CONSUMER CURRENCY · pending\n\nLast payment\nSep 5, 2026\nNext payment\nSep 5, 2026"
  },
  {
    "id": "timeline-entry-5",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-1-6",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-entry-7",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-2-8",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-entry-9",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-3-10",
    "component": "Stack",
    "text": ""
  },
  {
    "id": "timeline-entry-11",
    "component": "Card",
    "text": ""
  },
  {
    "id": "slot-entry-4-12",
    "component": "Stack",
    "text": ""
  }
]
```
After:
```json
[
  {
    "id": "screen-timeline-14",
    "component": "Stack",
    "text": "Consumer plan name\n$19.99 · monthly\n\nNo events yet."
  },
  {
    "id": "timeline-header-1",
    "component": "Stack",
    "text": "Consumer plan name\n$19.99 · monthly"
  },
  {
    "id": "timeline-header-1-title",
    "component": "Text",
    "text": "Consumer plan name"
  },
  {
    "id": "timeline-header-1-billing",
    "component": "BillingSummaryBadge",
    "text": "$19.99 · monthly"
  },
  {
    "id": "timeline-entries-13-empty",
    "component": "Banner",
    "text": "No events yet."
  }
]
```
