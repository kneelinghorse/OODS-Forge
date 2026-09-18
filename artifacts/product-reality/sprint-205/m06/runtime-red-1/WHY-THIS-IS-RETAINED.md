# The first 352-cell sweep — red, retained

Head `a1c0cdd3f` (the roster carrying Run, Finding and CapturedArtifact), pinned Linux container
`forge-s197-playwright`, nothing else building. 322 cells passed; **5 failed, all React, all on the new capture
objects**, so the registry was not written (the sweep writes it only when every cell passes). Kept, never
overwritten, because this sweep is the only gate that installs, strict-typechecks and drives each generated app,
and it found two producer defects no other gate did:

1. **`Finding/form/react`, `CapturedArtifact/form/react` — "Empty required value must fail native validation".**
   `reconcileFormDetail` turns a form's title-slot `DetailHeader` into an editable `Input`, but the binding pass had
   skipped that node while it was a display header, so the `Input` had no change handler: React rendered a value
   that snapped back, uneditable, and "valid" when emptied. It surfaces on objects whose title slot no trait fills.
   **Invoice had the same latent defect** (its converted title input was never editable either); the probe emptied a
   different field there. Fixed in `compose/form-detail.ts`: the converted input gets `handleChange_<field>`.
2. **`Finding/workflow/react`, `CapturedArtifact/workflow/react` — "Every declared flow obligation must execute in
   order"** (edit-seeded-values onward). The workflow's form screen is the same composed form, with the same
   uneditable title input. Same fix.
3. **`Run/workflow/react` — strict typecheck.** `evidence_retained` is absent on four of the six real Stage1 runs,
   authored as a `null` example; the emitter wrote `null` into a field typed `boolean | undefined`. Fixed in
   `codegen/workflow-data-emitter.ts`: a `null` example on a non-nullable optional field is an omitted key.

The generation census after both fixes: 306 of the 310 existing cells unchanged; the 4 that move are Invoice's form
and workflow (React and Vue), which is fix 1 reaching Invoice. The clean sweep follows in `../runtime/`.
