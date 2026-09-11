# Component inspection — m04

All nine React A/light scenario clips in this directory were opened and visually
inspected. Captured from the existing visual fixture in pinned Linux Chromium,
not from an illustration. The component source is unchanged since 47299343.

- ArchiveEvent: separate archived/restored entries with readable timestamps, actor and reason.
- CancellationEvent: readable request timestamp, reason and code; raw snake_case code remains visible.
- StateTransitionEvent: readable draft → active transition with actor and reason.
- ColorStatePicker: native selector fits its panel; fieldset and control repeat “Color state”.
- StatusColorLegend: labelled swatches and current state are visible; this scenario explicitly enables token references. Default product output hides them.
- CommunicationDetailPanel: channels, templates, policies and conversations appear as named content; “1 conversations” needs later copy review.
- GeoFieldMappingForm: three labels and input values fit; unchecked auto-detect is visible.
- GeoResolutionBadge: “Resolution: point” is readable; the scenario frame reserves more height than this inline recipe needs.
- GeocodablePreview: resolution, lookup=false (“No”) and detected fields render without implying an actual map or geocoding result.

These are builder observations. Craft approval and classification approval remain
pending; builderSelfCertified is false. Six-theme computed-style evidence is in
react-theme/report.json and vue-theme/report.json, independent of these nine clips.

Two moved public consumer captures from the final scoped run were also inspected:
`packed/cells/Subscription/timeline/react/seeded-390.png` and
`packed/cells/User/detail/react/seeded-1440.png` (paths relative to m04).
The Subscription mobile capture fits its event cards without horizontal clipping;
its generic Created/Updated cards and the new event sections coexist. The current
seed has no state-history rows, so StateTransitionEvent correctly says “No events
recorded”; the populated transition is proved by the shared scenario, not this
packed cell. Archive and cancellation seeded data are visible. User detail shows
the Communication panel with four explicit empty collections. Existing surrounding
membership/address/preference panels are sparse, and its bottom actions have basic
browser styling. No craft-polish or populated-communication claim is inferred from
that packed capture.
