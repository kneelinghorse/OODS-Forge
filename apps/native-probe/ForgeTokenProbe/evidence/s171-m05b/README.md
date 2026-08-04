# s171 m05b — native a11y-audit evidence (the re-plant)

Run: 2026-08-04, `xcodebuild test` (then `test-without-building` for the full-log capture),
workspace `ForgeTokenProbe.xcworkspace`, scheme `ForgeTokenProbe`, destination
`platform=iOS Simulator,name=iPhone 17 Pro,OS=26.4` (no plain "iPhone 17" simulator exists
on this machine — declared deviation from the memo's destination string). Xcode 26.4,
result bundles in the session scratchpad; all 3 UITests + 1 unit test passed.

## The plant

`ContentView.swift` renders a **programmatic `Image(uiImage:)` bitmap** (48×48,
`#C93E00` — brand A's interactive primary as emitted by the s171 colour transform),
with **no accessibility label** and **not** marked decorative. SF Symbols and
asset-catalog images derive an implicit label from their name, so only a programmatic
bitmap is a genuine label-less image. The GREEN leg opts into a label via the
`PROBE_BITMAP_LABELED=1` launch environment — the committed test demonstrates the pair
permanently.

## The datum (Apple's audit verdict on the bitmap: FLAGGED)

- **RED (unlabeled, default):** `A11Y-AUDIT-TOTAL: 4` — three pre-existing
  `Dynamic Type font sizes are unsupported` findings (fixed `.system(size:)` fonts in the
  s166 scaffold) **plus `XCUIAccessibilityAuditType(rawValue: 8): Element has no
  description`** — `performAccessibilityAudit` DOES flag a label-less bitmap.
- **GREEN (labeled):** `A11Y-AUDIT-LABELED-TOTAL: 3` — the element-description finding is
  GONE; the three Dynamic Type findings persist identically (the control that only the
  bitmap finding moved).
- **Tree pair:** `a11y-tree-unlabeled.txt` shows the 48×48 `Image` node with no label;
  `a11y-tree-labeled.txt` shows the SAME node with `label: 'Brand primary colour swatch'`.

## Files

- `audit-findings.txt` — the raw `A11Y-AUDIT-FINDING[n]` / `-LABELED[n]` lines + totals.
- `a11y-tree-unlabeled.txt` / `a11y-tree-labeled.txt` — `XCUIApplication.debugDescription`
  excerpts between the test's tree markers.
- `screenshot-unlabeled.png` / `screenshot-labeled.png` — XCTAttachment screenshots.
  **Byte-identical (sha1 e54079ce…), and that is the point:** an accessibility label has
  zero pixels. The defect and its fix are invisible to a screenshot diff and visible only
  in the accessibility tree — which is why certify-native needs the audit + tree, not VRT.
- `test-summary.txt` — the passing test-case lines from the full log.

Scope fence: evidence re-plant only. The `certify.native` tool build is mobile-walk scope.
