# s193-m06 — tool-truth census

Status: all mission criteria verified at implementation head `993dc8a1d9974c8dadb2a17cf1c66ad3de3185fa`. Builder self-certified: **false**. Sprint 193 remains Active pending independent review. Census head: `993dc8a1d9974c8dadb2a17cf1c66ad3de3185fa`.

## Measured scope

The canonical ledger has 27 rows: 21 auto and 6 on-demand. All rows retain the adapter description, input-schema description, claim hash, full input-schema hash, literal handler-import references, README discovery references, portable E2E source coverage, and structured caveats with a uniquely resolved file/line. Source-test tiers are **not** passing execution verdicts or consumer certification. README references are explicitly unverified discovery pointers and never promote tiers.

| Population | Product-reality imports | Contract imports | Other test imports | No handler imports |
| --- | ---: | ---: | ---: | ---: |
| Auto | 7 | 11 | 3 | 0 |
| On-demand | 0 | 1 | 1 | 4 |
| All | 7 | 12 | 4 | 4 |

The old planning shorthand 9 product-reality / 10 contract / 2 unproven mixed evidence kinds. This derivation uses the requested literal handler-import method consistently. In particular, contract-alignment.spec.ts imports viz.compose; review has lower-level test imports; dashboard/artifact/design-preview runtime references remain separate from their source-test tier. Catalog and health now also have m03 product-reality imports. No prior tool behavior was widened to improve a number. Decision #1906 records the reconciliation.

Portable E2E source calls exactly four unique registered tools: health, dashboard.render, viz.render, artifact.certify. This census did not run portable E2E. Historical README mentions are not newly verified browser/packed receipts.

## Product and documentation delta

Only health adds tool behavior: productReality.tools {entries, byTier, head}, or null plus a degraded warning for a missing/invalid ledger. Its required output schema/generated type is extended accordingly; additionalProperties:false made that necessary for the explicitly requested output. Every other tool handler, all input schemas and all adapter descriptions remain unchanged from m05 close. Catalog.list is untouched. The build copies the canonical ledger into dist/registry, so the projection is a shipped runtime asset.

The named chart/certification sentences now state all 13 SVG families and A/B + light/dark scope; high-contrast server pixels remain unsupported and the eight advanced families remain uncertified. Tool-Specs dead action-page links now point to existing grouped pages. The existing current component paragraph and test use m05's 109 framework roots / 40 interactive / 69 static measurements; historical Sprint 192 certification/classification boundaries remain explicit.

## Reproduce and inspect

- `node scripts/product-reality/s193-tool-truth.mjs --head 993dc8a1d9974c8dadb2a17cf1c66ad3de3185fa --check` reproduces the canonical bytes from current source at the recorded census head; it does not equate that head to live HEAD.
- `census.json` is the exact canonical ledger. `health-dist.json` retains the built-handler output; its runtime axis still names the m03 154-cell proof until m07 creates the final sweep.
- `scope-diff.json` enumerates the mission delta from m05 evidence commit 24d6db32e7249a1d78dbaa73dd1b8307a12bc54f.
- Contract tests reject a removed row, hand-edited tier/count/claim, and missing ledger. They prove fresh byte derivation, literal-import filtering, E2E source membership, and health output-schema validity. Existing health and narrative/link tests are also run.
- These targeted checks are not the five-suite capture; that happens once in m07.

## Sprint 194 candidates — proposed, not decided

Choices are generated from the ledger: placeholders suggest narrowing/retirement; rows without handler imports include all three choices; remaining rows suggest real consumer proof or a narrower claim. “Make real” here is a candidate to establish behavior/proof, not an assertion that all existing implementation is absent. No candidate changes scope or authorizes retirement.

| Tool | Source-test tier | Candidate choices | Reason from ledger |
| --- | --- | --- | --- |
| `tokens.build` | contract | make real / narrow | brand/theme label the returned context; copied compiled CSS includes all built scopes and is not filtered by those inputs. |
| `structuredData.fetch` | contract | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `brand.apply` | contract | make real / narrow | The verification subprocess ignores stdio and resolves both close and error without checking success; build duration is not proof of a successful build. apply writes snapshots in the artifacts run directory, not canonical brand token source. |
| `brand.intake` | contract | make real / narrow | Explicit preview-only validation: no persistence, brand creation or token application. This is an accurately documented limit. |
| `catalog.list` | product-reality | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `code.generate` | product-reality | make real / narrow | Release validation checks caller-supplied evidence envelopes and artifact-hash consistency; it does not rerun the referenced external proof. |
| `design.compose` | product-reality | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `design.preview` | unit | make real / narrow | Requires the local design-loop server in this checkout and a browser runtime; unavailable dependency returns OODS-N019. |
| `pipeline` | product-reality | make real / narrow | The generation release profile accepts caller evidence envelopes; format/hash checks do not independently execute their proof. |
| `health` | product-reality | make real / narrow | Token theme/brand fields report environment defaults, not an observed active consumer scope. |
| `registry.snapshot` | contract | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `viz.compose` | contract | narrow / retire | Deprecated field-name scaffold; it is not the real data-bound renderer or a certifiable artifact. |
| `viz.render` | product-reality | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `dashboard.render` | contract | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `artifact.certify` | unit | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `fidelity.preview` | contract | narrow / retire | The non-production branded mockup uses a hard-coded hex token table, not the canonical brand-token build. |
| `map` | contract | make real / narrow | Mappings resolve an external vocabulary to traits; no composer/codegen consumer targets the mapped external library. |
| `schema` | contract | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `object` | contract | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `repl` | product-reality | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `review` | unit | narrow / retire | The chain accepts only server-resident allow-listed fixtures. patch is a policy decision label; this label alone is not evidence of applying a patch to canonical source. |
| `diag.snapshot` | contract | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `billing.reviewKit` | none | make real / narrow / retire | No literal handler import in the scanned test sources; establish real behavior and proof before broadening claims. |
| `billing.switchFixtures` | none | make real / narrow / retire | No literal handler import in the scanned test sources; establish real behavior and proof before broadening claims. |
| `a11y.scan` | unit | make real / narrow | Source-test tier alone does not establish the full advertised behavior in a consumer; choose targeted behavior proof or a narrower claim. |
| `release.verify` | none | make real / narrow / retire | No literal handler import in the scanned test sources; establish real behavior and proof before broadening claims. |
| `release.tag` | none | make real / narrow / retire | No literal handler import in the scanned test sources; establish real behavior and proof before broadening claims. |

Final verification: 26 targeted server tests and 8 narrative/link tests passed, with zero failures or skips in those selections. MCP build passed. Fresh derivation matched every byte at the recorded head; built health returned 27 entries and the expected 7/12/4/4 tier counts. An isolated three-file copy of the built projection loaded the bundled ledger without repository source imports. These checks do not execute portable E2E or certify tool behavior.
