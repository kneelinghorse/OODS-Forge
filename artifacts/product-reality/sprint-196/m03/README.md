# s196-m03 — Reference applications from the extracted bundle

Status: **local sweep passed; final bundle and hosted CI pending**. The actual
42-cell sweep passed every cell, with zero typed gaps or failures and exact host
artifact hash equality in all 42 cells. Validation reported no issues.

The bootstrap archive was assembled from frozen implementation commit
`2148c93e6ee28ea0220560ce9a327e1d05ce3d67`. It is **32,450,172 bytes**, with
SHA-256 `70bbb9d5766ffef4afde430a8c90b851359ade932950ea729bc9a93311b53558`.
It intentionally contains no release ledger: this archive is the input to the
first actual sweep, whose evidence can only be carried by a later build.

- [Bootstrap manifest](bootstrap-archive/forge-runtime.manifest.json),
  [archive digest](bootstrap-archive/forge-runtime.tar.gz.sha256) and
  [assembly log](bootstrap-archive/assembly.log).
- [Verified execution identity](bootstrap-runtime/bundle-identity.json), including
  extracted payload verification and the host source comparison against that
  recorded commit.
- Actual sweep receipts: `artifacts/product-reality/sprint-196/m03/bootstrap-runtime/`.
  This directory retains the shared five-package tarball inventory, per-cell
  browser gates, host/bundle responses and generated-artifact comparisons.
- [Independent package probe](package-probe/summary.json): pack and export-file
  survival, isolated installation, typecheck and React/Vue rendering checks.
  This probe is supporting package evidence; the completed sweep supplies the
  complete application/browser census.

The fixed scope is Organization, Subscription and User × seven contexts
(card, detail, form, inline, list, timeline, workflow) × React and Vue. The
harness uses `--bundle-dir` and `--bundle-archive` together, packs the five
foundation packages once from the extraction with lifecycle scripts disabled,
and installs those tarballs into isolated consumers. Every successful generated
artifact must have the same `contentHash` as its retained host result; mismatches
remain failures. Host product sources are checked against the recorded bundle
commit before and after the sweep.

After successful validation, the harness retained `release-cells.v1.json`,
`validation.json` and `source-after.json` under `bootstrap-runtime/`, and writes
the canonical `packages/mcp-server/registry/release-cells.v1.json`. The separate
host census is `packages/mcp-server/registry/runtime-cells.v1.json`. Builds copy
available ledgers into `dist/registry/`; `health.productReality.release` projects
the measured release counts and original `bundleHead`/`archiveSha256` provenance.
The bootstrap runtime reports `release: null` with a warning because its archive
predates that evidence.

The [portable runtime runbook](../../../../docs/runtime/portable-runtime.md#reference-applications-from-the-bundle)
documents the invocation and validation contract. The release-bearing archive, full contract results and hosted CI receipts
remain pending.
