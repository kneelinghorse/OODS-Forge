# s195-m04 accuracy rules

Base implementation: `a10afdff`. This packet records the six added ECharts operand rules. The previous six rules retain their identities and predicates; all eight ECharts types now offer at least one accuracy rule. The four cartesian rules are unchanged, giving sixteen structural rules overall.

| Code | Rule | Positive detection and boundary |
| --- | --- | --- |
| OODS-V168 | bubble-negative-size | A carried size value cannot resolve to a finite non-negative magnitude. Numeric strings follow the adapter's `parseFloat` coercion; absent cells remain unresolved. |
| OODS-V169 | bubble-radius-scaling | At least two resolved non-negative values differ, while the public builder always supplies `size:{field}` and the adapter consequently uses linear symbol diameter. A constant domain has no relative size contrast. The public geo schema exposes no size-scale override. |
| OODS-V170 | bubble-coordinate-conflict | Rows sharing the same renderer-coerced longitude/latitude carry conflicting encoded size or color values. Agreeing duplicate points remain valid. The public bubble builder does not use the shared geo `join` property, so neither does this rule. |
| OODS-V171 | flow-map-negative-strength | A carried strength value cannot resolve to a finite non-negative magnitude, although it drives line width. Missing fields/values remain unresolved. |
| OODS-V172 | flow-map-duplicate-flow | More than one row names the same ordered origin/destination coordinate pair. Reciprocal routes and single self-loops remain valid. |
| OODS-V173 | force-graph-duplicate-link | Repeated directed `(source,target)` pairs overdraw the same relationship. Reciprocal edges, a single self-loop and an explicitly empty link list remain valid. |

All new finding messages name `artifact.certify`. V166/V167 retain the m03 pattern meanings; none are reassigned. Registration and retryability are pinned independently in the server error registry tests.

The force-graph choice supersedes the old comment claiming no invalid branch data was possible. The public renderer already warns on duplicate directed edges with V148; certification now grades that same relationship defect as V173. Public graph IR has `encoding:{}`, so optional `link.value` does not drive the adapter's width function. This rule therefore makes no negative-weight-as-width claim and no force-layout claim. Renderer behavior is unchanged.

The bubble radius rule reports a present renderer limitation. The direct adapter proof yields diameters `[6,17,28]` for values `[1,2.5,4]`: equal value increments yield unequal area increments. It is intentionally possible for valid public bubble operands to render successfully and fail accuracy. No operand or renderer was tuned to make this pass. Unlike measurement-conflict comparisons, domain variation uses exact inequality: the adapter itself distinguishes a constant domain exactly, and even a tiny numeric difference expands to the full diameter range. Applying a tolerance there would hide actual visible distortion. Numeric conflict comparisons retain the chartered relative epsilon of `1e-9`.

Unresolved coordinates, malformed rows, missing encoded fields/cells and unresolved graph endpoints return `evaluated:false` with a note. Positively resolved violations still report a finding when other rows remain unresolved. The evaluator counts resolved rules, not offered rules. An explicitly injected empty rule set reports a coverage limit without claiming the input cannot be invalid.

Verification:

- `accuracy-tests-02.log`: **111 passed, 0 skipped**, including 52 existing ECharts tests and 59 new tests. New tests cover each rule's bad/clean twin, non-finite values, string coercion, incomplete operands, tolerance boundaries, reciprocal edges/routes, collision-safe directed keys, actual adapter size/coercion behavior, purity, and replacement of each real predicate with an always-clean mutant.
- `error-registry-tests-01.log`: **26 passed, 0 skipped**, including all six distinct tool-named code definitions.
- `typecheck-01.log`: viz-core package typecheck, exit 0.
- `viz-core-build.log`: the one coordinated normal build, ESM/CJS/DTS success. Handler and census owners were notified before and after; later mutation/registry embedding builds belong to the coordinated census bite.
- `before-rule-details.json`: registered rule identities and per-type offered sets from the mission base.
- `after-rule-details.json`: rule identities, descriptions and per-type offered sets read from the newly built package exports.
- `built-rule-operands.json`: twelve bounded evaluations through built exports: six bad operands, three clean counterparts and three unresolved operands. This is rule-level evidence; public handler/census and rule-disable receipts live in the other m04 packets.

`accuracy-tests-01.log` records the first passing run. The final run followed a refinement that explicitly covers tiny-domain expansion rather than concealing it under numeric tolerance. No full test suite or visual capture was performed in this slice.
