# Sprint 196 m02 — Portable bridge and executable generation

The development bundle exercised all 19 advertised tools: 17 executed passes and
two typed limits. `brand.apply` returns `OODS-N020`; `design.preview` returns
`OODS-N019`. React and Vue `code.generate` emit content-addressed source files;
`pipeline` emits an artifact; `tokens.build apply:true` exports built outputs.
The bundled bridge exposes 19 tools, matches the manifest revision and the
adapter SVG hash, and exits cleanly. The extraction tree is restored.

`e2e-host.json` is an immutable development proof at base `d0ae4bdf` with
`dirty:true`; it binds the current ledger without claiming a clean release.
`development-manifest.json` and `assembly-development.log` identify that archive.
The clean commit/CI proofs are retained separately before mission completion.

The bridge is the thirteenth package. `dependency-count-migration.json` records
245 → 283 dependencies, with installed identities and integrity values checked.
The assembler keeps declarations and dist token TS while excluding package source,
tests and brand source. Existing tracked trait TS remains runtime data under the
established boundary. The attestation records source commit/date, both targets,
reference hashes and shipped package hashes; mismatches refuse with `OODS-N015`.

Measured planning corrections: inline `brand.intake` has no canonical-source
read and stays portable. Adding a source guard would create a false dependency
and violate the required 17/2 outcome. The detached manifest records archive
byte size and SHA; the embedded manifest binds the payload without a circular
archive self-reference. Dependency aliases and optional edges are resolved using
the same production-only policy as the installer.

Focused native, adapter, readiness, bridge, documentation and ledger contracts
passed with zero skips; individual commands/results are retained in the named
JSON/log receipts. Root typechecking and frozen installation passed. Early
integration runs caught harness assumptions (pipeline has no status field;
SVG parity requires output.svg) and SBOM alias/optional-edge handling; those
were corrected before the passing extracted run.

`builderSelfCertified:false`. This mission does not certify Sprint 196 or publish
any package or distribution.
