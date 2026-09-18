# Capture objects

Sprint 205 m02 adds three alpha objects born from real Stage1 runs: **Run**, **Finding** and **CapturedArtifact**.
Authoring follows [the object authoring guide](../../docs/authoring-objects.md), with the
[delivery objects](../delivery/README.md) as the precedent: an object is born from a direct read of real records and
lands with the screen that needed it.

The authoritative shape is Stage1's run output, read from disk: run `6e435ce7` (designsystem.digital.gov,
2026-09-17) for the fields, and every app-mode run on disk with an `a11y_report` at 2.2.0 for Run's sample records.
[`artifacts/product-reality/sprint-205/m02/fit-read.json`](../../artifacts/product-reality/sprint-205/m02/fit-read.json)
gives every field path of the manifest, the a11y report, the report index and the per-page axe evidence a
disposition — born, derived, or not modelled with the reason — and names the candidates Stage1 asked for that are
not born (Artifact, Surface, Subject, Comparison) with why. Every field's `examples` are real values, one real record
per index ([`author-objects.mjs`](../../artifacts/product-reality/sprint-205/m02/author-objects.mjs)).

At runtime Forge reads a run only through `structuredData.fetch`'s admitted run-view kinds (`design.preview`
`runPath`); it never calls Stage1 and writes nothing into a run.

## Naming

Stage1 calls its attested files "evidence". The registry keys objects by name and keeps the first file it finds for
a name, and `Evidence` is TraceLab's (`research.data`), so a second `Evidence` would silently lose. Stage1's object is
named for what its records are — a file the run wrote under the manifest's sha256 attestation — `CapturedArtifact`.

## Traits

`core/Assessable` (result state — its own visual family, never red, green or scored) and `core/Provenanced` (source,
record, locator, method, time) were authored for these screens in Sprint 205 m03. Every Finding on run 6e435ce7 is a
`violation`: Stage1 writes axe's needs-review, passing and not-applicable answers only as page counts.

These objects hold records Forge only reads. Their form and workflow contexts compose, generate and pass the runtime
sweep; whether a read-only record should offer a form at all is recorded as a finding for the next sprint
(`metadata.supportedContexts` is the mechanism, as Chunk uses it).
