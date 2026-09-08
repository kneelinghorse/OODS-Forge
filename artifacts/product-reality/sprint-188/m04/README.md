# s188-m04 — Billable list/form rows

Implemented under decision **1822**. The former composer blockers are resolved. This mission builds on M03 `569f5a5f`; the original blocked checkpoint is retained in `blocked-checkpoint.md`, and its failures and proposed patches remain intact. Sprint 188 remains Active. `builderSelfCertified: false`; usability requires the separate review.

## Bounded composer correction

`packages/mcp-server/src/compose/trait-recipes.json` is the component-to-directive declaration for both approved mechanisms. Its three keys are excluded from generic field selection but remain eligible for explicit trait view extensions. The collector resolves only declared directives, preferring object parameters over trait defaults, preserving authored references and never replacing authored runtime values. Mission 5 can add its five rows by declaration.

`resolved-census.json` and `billing-composition.s188.spec.ts` pin the actual diff against M03: **64/66 schemas byte-identical**, only Subscription/list and Subscription/form changed, all **132 build artifacts green**, plus both workflow artifacts green. The workflow is compared in full against M03 and permits exactly the same source placements. No OODS-V007 remains.

| Object/context | Trait | Placement | Preserved reference → concrete value |
| --- | --- | --- | --- |
| Subscription/list | Billable | BillingSummaryBadge at slot-toolbar-actions-3 | minorUnitsParameter: minorUnits → minorUnits: 100 |
| Subscription/form | Billable | BillingIntervalSelector at ve-field-0-26 | intervalsParameter: billingIntervals → intervals: monthly, yearly |
| Subscription/form | Billable | BillingAmountInput at ve-field-0-27 | minorUnitsParameter: minorUnits → minorUnits: 100 |

Workflow repeats these placements with list-/form- node prefixes. Existing form extension IDs shift 26→28 and 27→29, and the first field slot becomes the existing extension stack container. These exact structural consequences are asserted, not wildcarded. Generic Subscription/detail and amount-bearing, non-Billable Product contexts contain none of these recipes.

## Component and application evidence

All three IDs have canonical contracts, shared executable scenarios, prop-value contracts, HTML renderers, React/Vue root exports, token styles and six-class readiness rows. Integer minor-unit storage uses decimal half-up rounding. Zero remains zero; blank emits undefined; negatives emit no update and show an associated invalid-state alert. JPY with minorUnits=1 renders without decimals. Interval updates are strings restricted to the declared options.

- `parity.json`: nine computed HTML/React/Vue visible-text, accessible-name, value, option and error comparisons; empty difference allowlist, zero differences. `billing-parity-tests-final.log`: four passing tests.
- `react-tests-final.log` and `vue-tests-final.log`: 76 tests each. The resumed value tests add declared-interval update/rejection assertions: `resumed-react-value-tests.log` and `resumed-vue-value-tests.log`, six passing each. No skips.
- `export-bites/mutation-manifest.json`: six physical framework-root export deletions, exactly the corresponding family/readiness/generation cell red, opposite framework and other families green, byte-identical restoration. The implementations and exports were unchanged by the resume.
- `resolved-packed-consumers-final/report.json`: four fresh Subscription list/form cells, **32/32 applicable gates passed, zero failed/skipped**. Exact packed packages, clean installs, strict types, production build, SSR, mount, hydration, CSS and interaction. Required mounts show the three families. Both form reports observe options exactly monthly/yearly, native Home/ArrowDown selecting yearly, amount 19.99, an accessible negative error, blank and zero.
- `resolved-app-consumers-final/report.json`: **16/16 gates, 18/18 flow checks, 32/32 state observations**, 24 screenshots at 390/820/1440. The extra flow rows reject invalid Save, select yearly by keyboard, save 19.99 and reopen the record with the same amount/interval. The original edit/cancel/history/archive sequence stays green. `navigation-bite.json` records an isolated React navigation failure and exact restoration with Vue unaffected.

The real React app exposed an input/change capture race absent from standalone form proof: input capture published yearly before the select's change handler, causing React to reset it to monthly. The application emitter now uses React's single change-capture path. The failed app run remains in `resolved-app-consumers/`; the final run proves the fix with generated code only, no consumer-authored actions/components. CMOS learning 529 records the cause.

Native select arrows did not move a plain select in the macOS Playwright browsers. The passing browser runs use unmodified Linux Chromium 141.0.7390.37 via Playwright 1.56.1's loopback forwarding. `linux-browser-image.json` pins the official image digest. Reproduce with a Playwright run-server endpoint in `OODS_PLAYWRIGHT_WS_ENDPOINT`; both existing proof runners accept it. No component keyboard workaround was added.

## Historical fold and current discovery

The historical baseline-fold test previously derived the frozen Sprint 187 cohort from today's expanding nucleus. It now re-executes the historical derivation in a temporary snapshot of its original 79 hashed inputs at `cd8ee986`, using the retained declarations and checking the entire derived record against the frozen report. New families cannot demand nonexistent historical consumer evidence. Live readiness tests continue to cover the current packages. No frozen baseline, intake, reconciliation, foundation or fold evidence was edited. `resumed-contract-tests.log`: **102 tests across eight files passed, no skips**.

The live structured refresh projects only declared recipes from complete current readiness and hash-checked passing consumer mounts. Historical/custom capability overrides retain their historical projection. The CLI default was corrected to take the current projection; a negative test keeps incomplete readiness and unrelated rows at baseline state. `refresh-tests-verified.log`: **19/19 Python tests**. `refresh-final.log` uses this worktree's existing Storybook source, preserving its 14 code references. `catalog-receipt.json` shows all three families stable with HTML, React, Vue and generated-consumer evidence; frozen registry diff is empty. The named `oods-components-s188-m04.json` and token export retain this refresh even after later missions.

`post-refresh-guards.log`: 17 passing census/label/workflow tests. `workflow-census-final.log`: the expanded full-workflow diff guard passes. `resumed-workflow-capture-tests.log`: 11 passing workflow tests after the React capture fix, including strict generated React/Vue app typing. `resumed-artifact-tests.log`: 34 passing artifact/golden tests. `final-server-build.log`: server build succeeds. Earlier failed logs are retained and are not counted as passes.

## Review carry-forward

The new mobile billing controls and saved values are visible without horizontal overflow. The existing form still exposes raw amount/interval fields as well as the trait controls, and retains duplicate cancellation controls and surplus actions. These are explicit craft carries, alongside the M03 craft self-report; passing functional evidence does not certify this form as usable. No frozen evidence or saved-store record was rewritten. The serving primary checkout was not rebuilt or restarted. No full-suite capture or deployment occurred in this mission.
