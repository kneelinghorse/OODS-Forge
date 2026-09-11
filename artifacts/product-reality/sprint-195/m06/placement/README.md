# s195-m06 authored placement

Base: `22c674c548b6f3859c462e150a4601222366c25c`. This packet covers canonical chart placement, parameter projection, and actual React/Vue passive SVG consumers. Public composition, generation, census, bites, and builds have separate mission packets.

## Changes and preserved behavior

`src/registry/parameter-applier.ts` projects any supported bound canonical mark through the existing preview recipe. A bound chart contributes no standalone encoding dependencies, control fields, form controls, or list badges. Its title and description come from trait parameters. Unknown bound marks and mark/chart-type disagreement fail loudly, including when parameter schema validation is explicitly disabled.

| Canonical mark | Chart type | Preview | Authored bound contexts |
| --- | --- | --- | --- |
| MarkArea | area | VizAreaPreview | detail |
| MarkBar | bar | VizMarkPreview | detail, dashboard |
| MarkLine | line | VizLinePreview | detail, dashboard |
| MarkPoint | scatter | VizPointPreview | detail |
| MarkRect | heatmap | VizHeatmapPreview | detail |

The source trait's dashboard extension governs dashboard projection. New bar/line extensions are authored in both TS and YAML, including `regionsUsed`. Standalone mark controls stay available. MarkRect is the actual canonical heatmap identity; the memo's MarkHeatmap spelling was stale. Area defaults preserve “Payment amounts” and “Recorded sample payments in major currency units.” The existing payment-events source, fields, units, and detail-only behavior remain intact.

Five canonical TS/YAML declarations now expose `chart`, `title`, and `description`. `TraitParameter.type` admits `object`, which the pre-existing Area chart declaration already used. The coordinated schema generator owns the five parameter schemas and public declaration restrictions; this slice does not hand-edit generated schemas.

## Placement choices and provenance

**Invoice** already declares `line_items: InvoiceLineItem[]`; `src/objects/invoice/types.ts` defines each row's description and numeric amount_minor. Its bar chart uses description on x and sum(amount_minor) on y. The exact one-row sample is copied from `domains/saas-billing/examples/stripe.json` invoice.line_items: Scale plan, quantity 1, amount_minor 284000, unit_amount_minor 284000. The title, description, and y-axis explicitly retain minor currency units and describe aggregation. No currency conversion is inferred.

**Usage** already composes SaaSBillingMetered, whose `samples: UsageSample[]` is expressly documented for charts. The line binds timestamp with temporal scale and value on y. Its canonical unit stays api_calls. The existing Stripe fixture contained seat counts, and Chargebee contained run counts; neither is relabelled as API calls. Root selected clearly labelled synthetic API-call examples instead. `domains/saas-billing/examples/usage-api-calls.json` authors 1200, 1800, and 1500 API calls at June 15, 20, and 25, 2025. The declaration copies those rows exactly, uses “Example API-call usage”, and says “Synthetic API-call counts for generated example records.” There is no claim that these examples are provider observations, and no generic record-field override API was introduced.

**ECharts carry, explicitly approved by root under the memo's descope rung:** Relationship was assessed for force_graph. It declares scalar source_id/target_id, direction, and is_bidirectional, but does not declare the public NetworkInput nodes/links operand. Public graph links are directed; interpreting Relationship's direction and bidirectionality therefore needs an explicit authored transformation, not a field rename. `traits/viz` also has no authored graph/hierarchy/flow/geo Mark trait or corresponding governed preview recipe. A faithful new placement remains feasible work, requiring that operand contract and a new preview's proof loops. This mission does not invent those semantics or claim ECharts cannot be placed. The eight ECharts-primary chart types remain unplaced.

## Verification

All commands ran in the sprint worktree. `receipt.json` records commands, successful exit codes, counts, and source hashes.

- `registry-tests-final.log`: **27 passed** across the new bound-chart test, existing payment-chart test, and resolver tests. The tests cover all five mappings, context presence/absence, source immutability, unknown/mismatched marks, TS/YAML bound parameter parity, authored fields, and exact sample provenance.
- `react-tests.log`: **10 passed**. Both new previews embed freshly returned public `viz.render` SVG byte-for-byte in actual React server-rendered markup, preserve preview identity and accessible description, reject active SVG, and contain no replacement controls or placeholder when supplied real output.
- `vue-tests.log`: **10 passed**, with the equivalent actual Vue SSR checks. Vue's logged warnings are expected for the deliberate active-SVG rejection tests.
- `typecheck-final.log`: strict TypeScript 5.9 check passed for the parameter applier, five trait sources, and placement tests using the retained `tsconfig.json`.

The React/Vue implementations already satisfied the SVG contract, so this slice adds discriminating fresh-render tests without unnecessary component source changes or builds.

Initial failures are retained transparently: `registry-tests.log` exposed two test-harness assumptions (the generic registry does not resolve billing's public alias catalog, and historical Area prose differs between TS/YAML outside the new parameters). Tests now exercise the real mark resolver and direct authoritative field declarations, while public composition is checked independently by the main mission. `typecheck.log` exposed a readonly-array narrowing issue in the new chart-type guard; the guard was corrected and strict checking rerun successfully. No tests are skipped in the final focused runs.

## Placement inventory and documentation

The public-tool census now validates and executes 88 composition requests: the 11 existing public objects across every schema-declared context (including workflow) plus the dashboard layout. It inventories actual `UiElement.chart` nodes, retaining object, request context/layout, node id, preview component, chart type, source kind and data field. Every record says `evidence: composed-declaration`; the inventory does not claim to execute generated consumers.

After the root's header-preservation fix, `../viz-census/write-preserved-header.log` and `../viz-census/check.log` both pass. Exact measured placement is:

- Invoice: detail, workflow detail screen, dashboard layout — bar over line_items.
- Usage: detail, workflow detail screen, dashboard layout — line over samples.
- Subscription: detail and workflow detail screen — existing payment-events area.

That is eight declarations and three placed types. All ten remaining types receive explicit not-placed reasons in the generated registry; the eight ECharts types name approved carry #1944. The regular renderer census still has 13 types and 78 theme/brand identities: 60 rendered scopes, 18 typed-deferred HC scopes, 13 certified types, four nonconformant bubble scopes, and two negative-value accuracy controls. It preserves failures and does not broaden rendering claims.

An initial inventory collector incorrectly looked at trait `props.chart` instead of the public schema's lifted `node.chart`. The actual run exposed zero placements; the collector and its discriminating test were corrected before publication. `../viz-census/write.log` retains that initial result. `../viz-census/write-final.log` records correct placements before root preserved the primary detail header; `../viz-census/write-preserved-header.log` is the final inventory with the corrected node identities.

The Tool-Specs, current narrative, and visualization authoring guide now describe the bound record-array contract, API-call example provenance, static assets, and ECharts carry. The code.generate adapter description was updated at its authored source. API pages were generated using the normal generator and its check passes (`../viz-census/api-docs*.log`). Narrative contract: **16 passed** (`narrative-tests-final.log`). Strict checking including the inventory and its contract also passes (`typecheck-inventory-final.log`).

The HTML limitation remains explicit: isolated chart-node HTML draws the real SVG, while full Invoice/Usage detail HTML retains OODS-V007 for the existing Tabs normalization boundary. React/Vue application proof belongs to the separate runtime packet. No full HTML application proof is claimed.

The full registry contract compares exported dist with generated source. The coordinated bite restoration rebuilt core and ran that contract: **3 passed** in `../bites/attempt-2/registry/restored-contract.log`, reused here instead of repeating the expensive census. This includes the exact eight-placement inventory and the collector's discriminating public-node test.

`../viz-census/taxonomy-check-initial.log` confirms that the existing taxonomy and its document remain current after the placement registry change: 13 types, 21 patterns, eight families, 34 identities, 20 core cells, 13 surface-complete and seven typed gaps. No taxonomy regeneration or classification decision was needed.

`../verify-runtime.ts` is the bounded, read-only verifier prepared for the completed runtime output. It reuses `validateRuntimeLedger` for the canonical 154 cells and separate four dashboard cells, verifies their common run/head/browser/pack provenance, and checks 48 theme records with actual public SVG identity, named accessible images, successful certifications, and retained legacy Area generation. It reports no full HTML application claim. Its execution awaits the completed runtime population; creation of the verifier is not runtime proof.

Final post-restoration validation: **49 passed** in `../viz-census/health-taxonomy-tests.log` (28 viz-specific health checks and 21 taxonomy checks). These do not assert the separate tool-ledger health contract. The 118-line runtime verifier passes strict TypeScript checking (`../runtime-verifier-typecheck.log`). Its certification determinism check requires stability and a real render hash independently; it does not equate that intrinsic-dimension certificate render to the requested 360×200 SVG. Public SVG bytes still match their own hash and generated asset, while the browser receipt matches the mounted SVG and names its accessible image.
