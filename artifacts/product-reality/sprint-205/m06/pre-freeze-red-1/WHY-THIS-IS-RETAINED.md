# Pre-freeze part A, first pass — red at the root typecheck, retained

Every gate exit 0 except `typecheck` (exit 2): four errors in two files this sprint added — an unused helper and two
`UiSchema` casts in `test/product-reality/craft-says.ts`, and `fastify` typed from the root in
`scripts/product-reality/s205-m04-run-view.ts`, where it is the bridge's dependency. Fixed; part A re-run in full in
`../pre-freeze/`.
