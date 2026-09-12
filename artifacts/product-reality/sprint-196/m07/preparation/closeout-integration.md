# Sprint 196 closeout integration

This is a preparation contract, not a completed closeout or independent review. The producer and auditor use frozen Git inputs; the focused tests use isolated metadata fixtures and immutable historical raw evidence. No current runtime sweep, full five-suite capture, publication, delivery, or reconnect send was performed by these tests.

## Identities

- `manifest.implementationHead` is A: the frozen product implementation, measurement archive commit, canonical runtime154 head, release42 bundleHead, and census head.
- `executionHead` and `headRelations.carryHead` are B: the commit carrying the two measured canonical ledgers and the explicit roadmap update, the actual full five-suite capture head, final archive commit, attestation sourceHead, and fresh CI equivalence anchor.
- `reviewHead` is C: a descendant of B containing only the explicitly admitted new evidence files. Never relabel A measurements as B or C.
- Movers span `1d100e20bcc0911031192406625357638adecbe5..B`. Both old and new rename endpoints are included, tests are excluded, and the raw advertised patch uses precisely those literal file paths. The reconnect plan names candidate B and records measurementHead A.

## Manifest envelope

```json
{
  "missionId": "s196-m07",
  "implementationHead": "<A, full40hex>",
  "sources": { "<key>": "<repository-relative frozen path>" },
  "executions": [{ "id": "<unique>", "head": "<actual full40hex>", "historical": true, "evidencePaths": ["<path>"] }],
  "bindings": [{ "missionId": "s196-m01", "criterionIndex": 1, "executionIds": ["<id>"], "evidencePaths": ["<path>"] }],
  "accounting": { "capturePath": "artifacts/product-reality/sprint-196/m07/five-suite-closeout/four-suite-baseline.json" }
}
```

There must be exactly one binding for each of the 26 literal criteria from `missions.json`. A documented-limit binding adds `disposition:"documented-limit"`, actual `decisionIds`, and a nonempty `qualification`. Historical execution bytes must equal the named Git commit's bytes. Criteria or outcomes cannot be supplied directly in the manifest.

Required source keys:

```text
missions componentProof componentRetention componentLedger componentExport
reactTheme vueTheme reactMeasured vueMeasured
runtime runtimeValidation dashboardRuntime runtimePlacement
toolLedger toolProof health componentCensus schemaMovement
originalStore successorStore compatibility
registry vizCensus vizObservations patternRegistry patternCensus taxonomy taxonomyCensus
noticePlan movers moverAttribution ci prose near preFreeze
release releaseValidation measurementManifest finalManifest readinessAttestation
e2eNode20 e2eNode24 headRelations missionEvidence
```

The theme/measured component source paths stay in immutable `sprint-195/m07`; `componentProof.retained` is true and its original head is preserved. Component sourceInputs must match both the base and A. New runtime/release paths point to the m07 snapshot files, which must be byte-identical to their canonical registry files. Their raw relative reports, parity operands, screenshots, submitted packages and browser records must remain adjacent. The placement verifier reuses the existing separate 154 canonical / 4 dashboard / 48 chart-theme populations.

The head relation source should be written under `m07/closeout/`, because B's full SHA is known only after B exists:

```json
{
  "implementationHead": "<A>",
  "carryHead": "<B>",
  "executionHead": "<B>",
  "allowedLedgerPaths": [
    "packages/mcp-server/registry/release-cells.v1.json",
    "packages/mcp-server/registry/runtime-cells.v1.json"
  ],
  "excludedDocumentationPaths": ["cmos/foundational-docs/roadmap/near.md"],
  "changedPaths": ["<actual independently rederived A..B non-test public changes, sorted>"],
  "references": [{ "path": "<each canonical ledger>", "sha256": "<actual64hex>" }]
}
```

`missionEvidence` is the retained `m07/mission-evidence.json`: six mission records with hash-bound inputs. The producer/auditor also inspect actual delivery, doc/bundle/timezone mutation, placement migration and Gate2 receipts. Gate2 remains proposed; decision1952 authorizes only recorded root-private hygiene, and active constraint7 remains unchanged.

Fresh `ci` retains actual run and job-inventory hashes with `sourceEquivalence` scoped to B. Required successful job names are coverage, product-reality-consumers, component-packages, a11y-contract, portable-runtime (20.11.1), portable-runtime (24), release-runtime, runtime-cells and viz-determinism. A synthetic merge head must have actual byte-equivalence to B; the independent auditor re-runs the scoped Git comparison. Historical CI is separate and cannot satisfy this input.

The roadmap must contain exactly the heading `## Increment 15 — Sprint 196: Release proof — BUILT, REVIEW PENDING` and a Markdown link to `forge-gate2-decision-packet.md`.

## Commands after B exists

```sh
node scripts/product-reality/s185-sprint-wide-movers.mjs --sprint sprint-196 --mission s196-m07 --base 1d100e20bcc0911031192406625357638adecbe5 --head B --output artifacts/product-reality/sprint-196/m07/movers --declare
node scripts/product-reality/s185-sprint-wide-movers.mjs --sprint sprint-196 --mission s196-m07 --base 1d100e20bcc0911031192406625357638adecbe5 --head B --output artifacts/product-reality/sprint-196/m07/movers --check
node scripts/product-reality/s185-reconnect.mjs --sprint sprint-196 --mission s196-m07 --movers artifacts/product-reality/sprint-196/m07/movers/sprint-wide-movers.json --measurement-head A --output artifacts/product-reality/sprint-196/m07/closeout/reconnect
node scripts/product-reality/s185-closeout.mjs --root . --execution-head B --review-head C --manifest artifacts/product-reality/sprint-196/m07/closeout/manifest.json --output /tmp/forge-s196-closeout
node scripts/product-reality/s185-audit-closeout.mjs --root . --execution-head B --review-head C --manifest artifacts/product-reality/sprint-196/m07/closeout/manifest.json --artifacts-root /tmp/forge-s196-closeout --output /tmp/forge-s196-closeout-audit
```

Replace A/B/C with full recorded SHAs. A declaration is written once; the tool refuses replacing an existing declaration. The reconnect tool only prepares JSON and performs no sends. Its post-B output is placed under `closeout/`, an admitted evidence-addition directory. Final E2E logs should likewise use an admitted evidence directory; only the two exact bare `m07/e2e-node20.json` and `m07/e2e-node24.json` paths are admitted there by suite accounting.
