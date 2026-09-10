# s192-m03 — Measured accessibility and interaction

All **72 governed roots** now carry v1.1 structured role, name strategy/target and keyboard fields beside the existing accessibility prose. `behaviors.ts` explicitly authors each root. `SharedScenario.event` is an executable trigger list; the prior prose is retained as `renderExpectation`, preserving the existing scenario assertions. Previous version-cohort tests now expect all governed roots at v1.1 while preserving their prop and slot assertions. ArchiveSummary's scenario prose now matches reviewed No/Yes output (#1884).

Each framework measures **72 axe roots**, **23 verified interactive roots**, and **49 not-applicable static roots with explicit reasons**. There are **48 executable triggers per framework, 39 keyboard and 9 pointer**. Keyboard focus traverses with Tab from a sentinel; activation, editing, selected-tab state/focus and emitted payloads are asserted. Event outcomes require exactly one emission. Every declared keyboard key has an executing trigger. Each trigger mounts a fresh fixture, preventing an earlier action from satisfying a later assertion.

Seven interactive roots have native but unwired controls (CancellationForm, ClassificationEditor, FilterPanel, PreferenceEditor, RoleAssignmentForm, TagManager, TemplatePicker). Their evidence checks native focus/value and does not claim a domain action or save. Static container roots do not claim authored child interactions. Structured semantics assert the declared target and role, plus its visible label, heading or aria-label. SearchInput's shared fixture now supplies an explicit visible label in both frameworks, and Escape-to-clear is executed. Existing tests of default/placeholder behavior remain.

React's axe filter is removed; Vue uses the same complete shared-scenario membership through its new fixture renderer. Both loops pin the exact ordered 72 ids. Every axe result has zero violations with no filtering; colour contrast remains disabled in jsdom because m04 owns browser contrast. The executing specs retain the pre-existing showcase checks in addition to the per-root loop.

## Measurements and readiness

`component-packages-final.json/.log`: **1042 passed, 0 failed, 0 skipped** (contracts 126, styles 39, React 447, Vue 430). Root typecheck and both framework builds pass. The two accessibility files each execute 77 tests, including all 72 roots. Each framework's new interaction spec executes 170 assertions.

`project-evidence.mjs` reads the actual passing JSON assertion results before writing readiness; it refuses missing, failed or skipped root results. `measured-evidence.json` retains 144 framework/root rows with declared keys, trigger counts and refs. Both readiness documents carry accessibility and interaction evidence classes for 72/72 rows, including not-applicable reasons. The readiness contract tests validate exact membership and references. Existing six emission-eligibility classes are retained.

## Mutation bites and red attempts

`mutation-bites.py/.json` and four logs retain actual source mutations:

- Remove the React Tabs ArrowRight handler: the declared ArrowRight interaction fails.
- Remove the Vue Tabs ArrowRight handler: the same interaction fails.
- Remove one scenario from each axe loop: each exact-membership assertion fails.

Each source hash is identical before mutation and after restoration; the final package run is green with every test included.

The first framework runs passed all axe scenarios but could not import the new shared DOM helper; `@testing-library/dom` is now an explicit development dependency at its already-locked version 10.4.1. The second interaction runs exposed the inaccurate SearchInput aria-label declaration; the fixture now provides an explicit visible label and the contract uses the label strategy. All attempt logs remain. `component-packages-build-race.*` records an orchestration mistake: rebuilding framework dist concurrently with package-contract tests removed declaration files while those tests read them. The rerun after the completed build passes all 1042 tests. CI builds before testing.

CI execution on the mission head is pending; m03 remains In Progress until its package gate runs green. No full-suite capture was run. The separately retained ECharts soak failure from m02 remains open for investigation before final handoff.
