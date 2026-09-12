# s196-m03 — Reference applications from the extracted bundle

Status: **local and hosted release proof passed**. The actual
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
documents the invocation and validation contract. The release-bearing archive at `415c7cc02822e64d64e2c8a9696d852d7faa2db7` is
32,480,080 bytes, SHA-256 `ae137bea431287db6e615e1e4882dbae2626044452e8c55364d042793842848c`.
`final-archive/` retains its manifest, SBOM, attestation and assembly output.
`e2e-node24.json` and `e2e-node20.json` both pass, including the served release
projection, bridge parity, clean lifecycle and unchanged extraction tree.
Full post-sweep release/portable/runtime/health/workflow contracts passed 64/64
with zero skipped; the named JSON/log receipts record the commands and results.
The earlier fixture-only run explicitly deferred its actual-42 test until this
sweep existed; the full release spec subsequently ran every test.
Hosted CI run `34677270788` passed the release job `103509303039` in 16 minutes
12 seconds (20-minute budget). Its own archive SHA is
`686e0cba2447c2ea3569dc75d0c80793e4f0f5f27add21daf8a27c69f9881d3a`,
29,804,733 bytes per the retained job stdout. Its 42 cells all pass with host
artifact equality at synthetic merge `405315b16b109aab8ff4e87f9389888c59d43668`,
run `0b7a5767-7545-41bd-bd19-6d7d64ebe835`. `ci/release/` retains the uploaded
cell tree, job log and verification. `ci/provenance.json` proves the synthetic
merge tree equals source `415c7cc0` and records its parents.
Hosted portable Node 24 and 20.11.1 jobs also passed, with full receipts under
`ci/node24/` and `ci/node20/`; these serve the earlier bootstrap ledger faithfully.

Retention correction: the first release upload omitted separate temporary
manifest/SBOM/sidecar paths in the container. The complete cell tree and raw job
stdout still establish the observed archive size/SHA and payload verification.
The workflow now copies those files into the uploaded workspace receipt folder;
`ci/upload-retention-fix.json` records a successful local byte-copy check. Hosted
confirmation of that retention-only fix is tracked for the next normal CI run.

`builderSelfCertified:false`. Nothing is published or tagged.
