# s188-m04 — billing list/form components, blocked checkpoint

Mission 4 is **not complete**. Mission 2 completed at `ea056ca3` under decision 1817; Mission 3 completed at `569f5a5f`. This checkpoint starts from that verified application head. It does not supersede the Mission 3 evidence or claim a usable application at the current working head.

## Implemented and verified

- BillingSummaryBadge, BillingAmountInput and BillingIntervalSelector have canonical contracts, one shared executable scenario each, prop-value contracts, HTML renderers, React/Vue root exports, token styles and six-class readiness rows.
- Money stays in integer minor units. Shared decimal arithmetic rounds half up; zero is valid, blank emits undefined, negatives emit no update and receive an associated alert. Explicit minorUnits controls formatting, including JPY/1. React/Vue updates are typed. HTML has matching static value/validation semantics; HTML alone owns no application store.
- `react-tests-final.log` and `vue-tests-final.log`: 76 tests each, zero failures/skips, covering billing values, all 67 shared component scenarios plus coverage, and package contracts. Earlier readiness-row failures remain in the first logs.
- `parity.json`: nine HTML/React/Vue cases, computed visible text and accessible names (dom-accessibility-api), values, enabled options and validation messages; empty difference allowlist and no differences. `billing-parity-tests-final.log` has four passing tests. The later `guard-tests.log` also passes these four tests, including typed codegen change-action signatures.
- `export-bites/mutation-manifest.json`: six physical root-export deletions, each with only its own generation/SSR cell and readiness row red, other five cells green, and exact source restoration. The selected package was rebuilt; the opposite target's dist and HTML stayed unchanged. This reuses the Sprint 185 mutation runner.
- `packed-consumers/`: fresh Subscription/list and Subscription/form, both frameworks, all eight existing gates passed (32/32, no skips). Exact tarballs, isolated installs, strict typing, production builds, SSR, mount, hydration, shared CSS and interaction. The browser observed list `$19.99 · monthly`, form amount `19.99`, and interval `monthly`. These observations do **not** prove that the option set is Subscription's override. This reuses the Sprint 184/185 consumer runner with value probes for the three families.
- Contracts, React, Vue and server build logs retain the checks. `server-build-final.log` is green; the earlier server log retains the readonly-array type error and its fix.

## Blocking findings

1. The mission objective says **“the composer is not changed.”** Bare list/form schemas retain `intervalsParameter: billingIntervals` but omit its resolved value and object identity. Billable declares monthly/quarterly/annual; Subscription overrides monthly/yearly. The unmodified fresh form therefore receives the wrong option set. Runtime components accept explicit `intervals`, but supplying them in consumer code would not satisfy public-input-only generation.
2. Registering the three renderers changes generic selector ranking. `baseline-schemas.json` captures all 66 schemas at `569f5a5f`; `current-schemas.json` and `composition-differences.json` show 63 unchanged, intended Subscription/list+form changes, and an unintended Subscription/detail change. Seven detail slots become billing recipes, including amount inputs for subscription_id, billing_interval and current_period_progress, and badges for last_event and plan_name. `unintended-detail-diff.json` records every changed property. These are not legitimate Billable view-extension placements.
3. The existing guards remain intact. `guard-tests.log` has 12 passed tests, one failed census assertion, and a failed workflow setup that prevents all 11 workflow tests from running. The workflow build fails closed with OODS-V007 for discarded field bindings/unsupported badge labels. These 11 setup-blocked tests are explicitly unverified, not passing or pre-existing skips.
4. `contract-tests.log` has 93 passing tests across seven files and one failed suite initialization. The historical Sprint 185 baseline-fold helper automatically includes the enlarged canonical component set and demands old generated-evidence rows for BillingAmountInput. The current baseline/intake/reconciliation files remain unchanged. This historical-cohort assumption must be corrected without rewriting frozen evidence; that suite is not green.

## Concrete amendments proposed, not applied

- `proposed-parameter-resolution.patch` resolves only the three new recipes' parameter directives into `intervals`/`minorUnits`, preferring object overrides to trait defaults and retaining the authored reference props. It changes no placement policy.
- `proposed-recipe-selection.patch` keeps the same three recipes available to explicit view-extension placement and excludes them from generic single-field fallback selection. It preserves the current generic policy for every other component.

Both patches pass `git apply --check`. Neither was applied or functionally tested. Approval to amend the mission's composer constraint is required before applying them. The original narrower asynchronous question covered the first finding; the second finding requires the selection exception too.

## Work remaining after a scope decision

Apply and test the approved correction; prove other contexts preserved; update the historical census guard only for the specifically authorized list/form placements; test Subscription's exact monthly/yearly options and native arrow-key selection in a browser; rerun fresh workflow typing and the draft bridge tests; refresh structured data and validate catalog surfaces; repeat only affected packed proofs and finalize Mission 4. No structured-data refresh or claim of correct catalog surfaces has been made at this checkpoint. The root frozen registry, saved store and serving primary checkout were not modified.

The generated application draft bridge now recognizes amountField/intervalField and parses marked amount inputs before writing the draft. It builds, but its fresh workflow runtime verification is blocked by the detail-selection preflight error above. Keep this change under review until that guard is green.

Sprint remains Active; builderSelfCertified is false. Missions 5 and 6 have not started. No full-suite capture, PR or deployment was performed for this checkpoint.
