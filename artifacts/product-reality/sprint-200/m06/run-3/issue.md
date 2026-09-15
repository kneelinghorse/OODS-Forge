### What did not read right

The README's `Overrides` bullet states a rule and then gives one worked example that contradicts it. The rule says to
use `componentOverrides` when a selection is low-confidence or carries a `reviewHint`; the example then pins the
`header` slot. On a clean first run of the very object and context the example names, `header` is a **high**-confidence
selection (0.95) with no `reviewHint`, and `DetailHeader` is not among the candidates offered for it. The slot that
actually carries the `reviewHint` is `metadata`.

So the one place the document shows me how to fix a low-confidence slot points at a slot that was not low-confidence,
and names a component that slot was not offered. I re-read the sentence three times assuming I had composed the screen
wrong.

### Which screen or document

`README.md`, section "Working with the tools", the `Overrides:` bullet. The same text is what step 3 of "The first run,
in ten minutes" sends you to: "a low-confidence slot carries a `reviewHint` (see Overrides below)".

### What you saw

The sentence:

> **Overrides**: when `design.compose` reports a low-confidence selection or a `reviewHint`, pin only that slot with
> `preferences.componentOverrides`, for example `{"object": "Subscription", "context": "detail", "preferences":
> {"componentOverrides": {"header": "DetailHeader"}}}`.

What `design.compose` returned for `{"object": "Subscription", "context": "detail"}` (no preferences), on runtime
v0.1.0 / adapter 0.3.0:

**The `header` slot — high confidence, no hint, and `DetailHeader` is not a candidate:**

```
slot: header
  selected:   VizAreaPreview
  confidence: 0.95 (high)
  intent:     page-header
  reason:     view_extension placement
  candidates: VizAreaPreview (0.95), StatusTimeline (0.95), CancellationSummary (0.95), ArchiveSummary (0.95)
  reviewHint: (none)
```

**The `metadata` slot — the one that actually carries the hint:**

```
slot: metadata
  selected:   AuditTimeline
  confidence: 0.40 (low)
  intent:     metadata-display
  reason:     1 tag match(es); tag match (metadata); 1 context match(es); 1 region match(es); 2 trait(s)
  reviewHint: Low-confidence selection for "metadata". Consider preferences.componentOverrides to pin a
              different component if needed.
  alternativeCandidates: TagSummary (0.95), TagManager (0.9)
```

It was the only one of the ten slots with a `reviewHint`. The other nine ran 0.71 to 1.00.

A second, smaller thing in the same output, in case it is the same root cause: the selection's `confidence` and the
score next to the same component in its own `candidates` list disagree. `metadata` reports `confidence: 0.40` while its
top candidate is `AuditTimeline (1.0)`; `tab-2` reports `confidence: 0.71` with candidate `Stack (1.0)`. Two numbers
with the same meaning-by-name, an order apart, and nothing in the README distinguishes them. Since the README tells me
to act on the low-confidence signal, this is the field I most need to read correctly.

### What you expected instead

Either:

1. the example pins the slot the rule just described — the one that came back with the `reviewHint` — e.g.
   `{"object": "Subscription", "context": "detail", "preferences": {"componentOverrides": {"metadata": "TagSummary"}}}`,
   using a component from that slot's own `alternativeCandidates`; or
2. if `header` / `DetailHeader` is the intended illustration, one added sentence saying overrides also work on
   high-confidence slots when you simply want a different component, and that the value need not come from the slot's
   candidate list.

Either fix makes the example teach the rule instead of arguing with it.

### Runtime version

- Runtime v0.1.0, adapter 0.3.0 (per `install.md` section 8 and `forge-runtime.manifest.json`)
- Manifest commit `723bc2195cb99fa3482cad3fbd5700d8713e9a7e`, dirty `false`
- Archive `forge-runtime.tar.gz` sha256 `338dc780cf206df5082a1796bb44f696ec57b0c0b351841b6c3446c77b2f6aa9`
- Object composed: `Subscription` 2.0.0, context `detail`, traits `lifecycle/Stateful`, `lifecycle/Cancellable`,
  `lifecycle/Timestampable`, `financial/Billable`, `lifecycle/Archivable`, `viz/MarkArea`
- Client: Claude Code, stdio adapter, default toolset (19 tools). Node v24.6.0, macOS.

Everything else in the first run matched the documentation exactly — install to seeing the rendered screen took 3 min
54 s, and steps 1 through 6 all passed on the first try.
