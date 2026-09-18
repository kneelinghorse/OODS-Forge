# The third 352-cell sweep — stopped at 141 passing, retained

Head `14d18f507` plus the `s205` ledger mode commit. 141 cells passed and the only failures were the three new
objects' React workflows, all from the HARNESS disagreeing with the app, not from the app:

- **Run / CapturedArtifact — `save-record-field`.** After saving, the app heads the record with `target_name` / `path`
  (the producers' `text.label` rule, s205-m02). The harness (`s188-m03-app-consumers.ts`) carried its own copy of the
  producers' old name list and expected the id. It now uses the producers' `authoredLabelField`.
- **Finding — "Every row must follow the declared display-field sort".** The harness expected the descending list to
  be the ascending list reversed. The app negates its comparator, so records with EQUAL display values keep their
  record order in both directions. Seeded names never repeated, so the assumption held until the records were real —
  two real findings share a title (one rule failing on two pages). The harness now expects the comparator negation.

Stopped rather than run to the end (the registry is written only when every cell passes, and there is no resume).
The three workflows were re-run alone with the fixed harness against this sweep's packed packages
(`workflow-recheck/`): **all three pass in React and Vue**. The final sweep follows in `../runtime/`.
