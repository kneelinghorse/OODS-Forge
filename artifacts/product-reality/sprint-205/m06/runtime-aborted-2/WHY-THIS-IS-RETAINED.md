# The second 352-cell sweep — stopped, retained

Head `3949155e7` (with the form-binding and null-example fixes). Stopped deliberately part-way, never upgraded to a
receipt: the three new objects' React workflows failed again at `detail-navigation`, waiting for record
`run-003` / `finding-003` / `capturedartifact-003`. The form and typecheck fixes held (Run's workflow now got past
strict typecheck); this was a third defect, in the sample data:

A workflow seeds 10 sample records by cycling each field's authored examples. The capture objects carry 6 real
records, so the id field cycled 6 real ids across 10 records — record 3 and record 9 had the same id, and an app
keyed by id cannot tell them apart (the harness's stable `<object>-003` key was also absent). Fixed in
`codegen/workflow-data-emitter.ts`: the id takes authored examples only when there are at least as many as sample
records; otherwise it keeps the stable key. Every other field still shows real values.

Stopped rather than run to the end because every remaining cell was running on the build without that fix; the
clean sweep follows in `../runtime/`.
