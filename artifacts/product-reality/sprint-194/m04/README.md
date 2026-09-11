# Sprint 194 m04 — Retirements and on-demand contracts

Decisions #1916, #1922 and #1923 retire the chart scaffold, grouped review, and
package release verification tool. `retired-tools.json` records the names,
reasons and before/after roster: 21 auto + 6 on-demand becomes 19 + 5 = 24.
`retirement-inventory.json` lists the exact changed files and hashes.

Retirement removes registration, fallback registry, bridge configuration, both
policy layers, adapter descriptions, public schemas/types, SDK methods, generated
API pages and active documentation. The existing retirement gate now checks the
chart scaffold across the repository. The canonical ledger's required `retired`
array is checked separately against the decision record; it is not a live row.
Review's individual schemas are removed from shipped/generated contracts; one
historical output fixture remains solely for the internal evaluator's tests.
The tested pure review evaluator, emitters and two historical helpers remain
unregistered, explicitly labelled with the retirement decision. No patch output
is invented from decision labels. Chart trait inference remains an internal
helper with its own types; the rendering tool does not consume that helper.

Five on-demand contracts validate the actual registered JSON input/output wire,
invoke real handlers, and confine receipt writes to a temporary policy root:
`a11y.scan`, `diag.snapshot`, `billing.reviewKit`, `billing.switchFixtures`, and
`release.tag`. Billing previews compare the real Stripe/Chargebee fixtures;
diagnostics counts agree with catalog.list. Tag dry-run proves the complete tag
list is unchanged and its artifact reports created:false. No test creates a tag.

The initial package-verification probe rebuilt workspace package dist files:
packTwiceCompare runs builds plus npm prepack even with apply:false. Its retained
receipt and rejected spec are discovery evidence, not proof of a read-only dry
run. That tool is retired; the final test set never invokes it. No source mutation,
tag or package publication resulted from the earlier probe. Initial helper
fixture failures and intermediate logs are retained, not reported as passing.

Final validation: 305 tests across 21 server files, 15 root narrative/registry
checks, and 26 SDK tests passed with no skips. Server and SDK builds passed.
Generated-type and API freshness checks are recorded in verification.json.
This is targeted validation; the reserved five-suite capture has not run.
The derived ledger has 24 entries: 16 product-reality, 6 contract, 2 unit, 0 none.
Every remaining on-demand entry is contract tier. Four portable E2E calls remain
until m06 expands that proof; retirement changed only its health census assertions.
