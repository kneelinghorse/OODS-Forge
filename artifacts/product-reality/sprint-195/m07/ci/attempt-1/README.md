# Capture C CI attempt

These are unmodified raw REST run/job inventories and completed job logs from draft PR #101 at metadata head `54def3aa88683d81f1f942558a24715c064021e9`. Actual checkout logs identify PR merge `738d9b9999f854783498135b5e846faef4538c83`; the REST merge tree equals C's full tree. C's public bytes equal then-frozen implementation `e375f4c2db9fe9644caba87690b91b8ddd71e207`.

At `observed-initial.json`, six jobs failed (typecheck, build, coverage, product-reality-consumers, portable-runtime, viz-determinism), eleven passed, two were skipped, and runtime-cells was still running. No reruns were requested. Later final snapshots, if added, keep the same original C/M identities. This is failed-attempt evidence, not the final seven-job selection.

`c-typescript-diagnostics.json` binds the exact errors to raw log lines. `c-typescript-repair-proposal.md` records the proposed narrow repair without claiming it passed. `c-checkout-verification.partial.json` binds actual checkout observations and REST merge/tree proof for completed logs available at that time. All raw filenames retain collection timestamps; the initial states have not been replaced.

Only JSON/log/Markdown evidence is retained here. No downloaded binary archive, screenshot, or tarball is included. Any later runtime archive extraction will disclose its hash and retained subset separately.
