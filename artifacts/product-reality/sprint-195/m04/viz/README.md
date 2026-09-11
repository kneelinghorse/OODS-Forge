# s195-m04 measured certification census

The 13 existing chart types were remeasured through the real `viz.render`, `artifact.certify`, `dashboard.render`, and `design.compose` handlers. The four scopes per type are light/dark × brand A/B: 52 exact public SVG identities, all unchanged from the before capture. Every render was repeated and its normalized SVG hash matched the certification render hash.

The registry now records the exercised certification profile and all four scoped coverage, conformance, pillar, and accuracy summaries. All 13 types are certified on the exercised profile, up from five. There are 48 true and four false conformance verdicts, with no nulls. All four false verdicts belong to `bubble_map`: `OODS-V169` detects that the current public renderer linearly scales circle diameter/radius for differing values instead of using area. The renderer has no public size-scale override. The false verdicts and exact findings remain in `viz-observations.json`; no pixels were changed to evade the finding. Spec-only ECharts remains a separate uncertified path, covered by the handler agent's receipt.

`before/provenance.json` fixes the baseline at `a10afdffe708055fa241e110eb1881bbd16c2968` and verifies that the old census registry matches that recorded commit. `verdict-migration.json` includes all 52 before/after SVG hashes, grades, and hashed source observations. It proves contrast and every unrelated registry field unchanged. The mission's explicit requirement for real new accuracy rules supersedes the generic memo nonmover list for `accuracyRules` only; that attribution is recorded in the migration receipt.

Regenerate the canonical 13-row registry with:

```sh
pnpm exec tsx scripts/product-reality/s190-viz-census.ts artifacts/product-reality/sprint-195/m04/viz --write-registry
node scripts/product-reality/s195-viz-certification-migration.mjs
```

Read-only live verification is `pnpm exec tsx scripts/product-reality/s190-viz-census.ts --check`. An explicit output path is required for captures, so running the updated census cannot overwrite historical s190 evidence by default. The census includes negative-size V168 and negative-strength V171 controls using the actual public data operand.

The physical V171 predicate bite in `../bite/` built a predicate-disabled artifact, made the full live census fail specifically for the absent V171 finding, then restored exact source bytes, rebuilt, and reran the full live census green. Its offered rule list and evaluated count stayed intact, so registry metadata alone could not account for the failure.

`verification.json` pins the source and evidence bytes. `checks.json` and the associated logs record six focused tests passed, none skipped, a successful strict census script typecheck, and a clean diff check. Builds and red/restored census commands are recorded in `../bite/accuracy-bite.json`. These are builder verification receipts, not independent certification.
