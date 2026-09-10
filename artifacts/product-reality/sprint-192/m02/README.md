# s192-m02 — Component gate and resolved semantic roles

Planning ruling **#1884** (Derek, 2026-09-10) adopts the measured base and authorizes correction of three stale assertions. The memo section 2 Token resolution row, decision 3 and build handoff baseline bullet now cite that ruling. The original pause record is retained as `baseline-pause.md`; its proposed correction is now accepted. Implementation session: `PS-2026-09-10-012`.

## Baseline and resolver

The unchanged `baseline-census.mjs`, `.json` and `.log` retain the exhaustive base inventory and source hashes. Both stylesheets are byte-identical to runtime `5fdf8a18` and planning head `70e41570`; the BEFORE execution head `8f8f0413` adds only planning/delivery/diagnostic evidence. The original `--check-locked` diagnostic remains deliberately red against the superseded planning numbers.

| Metric (each of six scopes) | Base | After |
| --- | ---: | ---: |
| Distinct referenced names, including nested fallbacks | 191 | 194 |
| Token-defined | 45 | 161 |
| Local declaration exists | 57 | 16 |
| No token or local declaration | 89 | 17 |
| Unresolved colour roles after evaluating fallbacks | 3 | 0 |
| Reachable system-colour fallback names | 61 | 0 |
| Non-colour unresolved names | 48 | 14 |
| Defined names among six formerly unguarded names | 0 | 6 |

`token-resolution-before.json` and `token-resolution-after.json` retain complete per-scope resolution traces. The definition is explicit: evaluate every var-bearing declaration outside forced-colors:active against that scope's token values, root locals and locals declared under the exact rule selector. Follow selected fallback branches, including nested functions and cyclic definitions. Count distinct variable names whose selected fallback path reaches a literal CSS system colour. No unrelated selector is assumed to apply; inherited applicability is separately checked in browsers. Intentional HC values from defined semantic tokens are not missing-token fallbacks. This conservative selector-aware count is **61**, independently derived; the planning 26, direct-fallback 19 and anywhere-in-chain 31 are not reachability counts.

Inventory membership does not itself imply a broken declaration: the remaining 17 optional names have resolving fallbacks. The non-colour inventory ceiling is pinned at 14 and may only decrease. The contract names the scope, file, rule and expression on failure. It also requires all six names: `--radius-md`, `--space-2`, `--space-3`, `--sys-focus-ring`, `--sys-surface-default`, `--sys-text-subtle`.

## Producer changes and attribution

106 component defaults in `packages/tokens/src/tokens/component/roles.json` are authored exclusively as `{sys.*}` semantic aliases, including panel → surface.raised, text-body → text.primary, border-default → border.subtle. Semantic geometry defaults preserve the former CSS literal dimensions. Seven drifted system names are compatibility aliases in `base/system/component-roles.json`:

| Referenced name | Semantic target |
| --- | --- |
| --sys-focus-ring | sys.focus.ring.outer |
| --sys-spacing-stack-compact | sys.space.stack.compact |
| --sys-surface-accent | sys.surface.interactive.primary.default |
| --sys-surface-default | sys.surface.canvas |
| --sys-text-default | sys.text.primary |
| --sys-text-subtle | sys.text.secondary |
| --sys-text-scale-heading-md-font-size | sys.text.size.lg |

The three unprefixed geometry names are root aliases to sys roles. ArchiveBadge's optional status fallbacks now resolve to semantic surface/text roles. `token-additive-attribution.json` records before/after SHA256 pairs for the CSS, every scope block, flat export and per-scope map: all existing declarations/values are unchanged, with 134 additive tokens. No light/dark viz-render or MCP pixel golden is modified. Root `vitest.config.ts` is byte-unchanged from `5fdf8a18`.

The actual deletion bite removes authored `cmp.surface-panel`, rebuilds tokens and runs the contract: exit 1 identifies `.oods-card` and the system-colour fallback. `deletion-bite.json` proves the source was restored byte-for-byte, and `deletion-bite-restore.log` retains the successful rebuild. A second test exercises the same missing token across all six scoped exports.

## Package gate and stale assertions

`component-packages-base.log` and `components-vue-base.log` remain red: contracts 121 passed, styles 34 passed, React 230 passed/2 failed, Vue 186 passed/1 failed. Per #1884 these three failures were stale expectations of pre-Sprint-189/191 output that had never run in a gate, not product defects:

- React `test/scenarios.spec.tsx:528`: current status now asserts `Current status: Active`.
- React `test/scenarios.spec.tsx:588` and Vue `test/scenarios.spec.ts:735`: ArchiveSummary now asserts `No` (the fixture is unarchived) and `Sep 5, 2026, 12:00 PM`, preserving the reviewed Yes/No and formatted-date behavior.

The corrected aggregate is **579 passed, 0 failed, 0 skipped** in `component-packages-corrected.json/.log`: contracts 121, styles 39, React 232, Vue 187. The fifth capture suite calls the four existing package runners with their own working directories and aggregates their real JSON reports; root-core's project selection is unchanged. CI has a blocking component-packages job. The a11y-contract job runs both test:visual scripts over all six explicit cells plus the shared styles browser spec and retains new screenshots separately from frozen Sprint 182 evidence.

Red implementation attempts are also retained: `component-packages-cwd-attempt.log` exposed package-relative fixture assumptions and led to the cwd-preserving runner; `component-packages-deletion-message-attempt.*` caught the missing expression in the resolver diagnostic, fixed before the green run; `theme-vue-stale-label.log` exposed the old Email expectation, updated to the existing required-field label Email*. No test is skipped. These are separate from the three base failures attributed by #1884.

## Browser and design-loop receipts

`theme/react` and `theme/vue` each retain six successful scope cells, screenshots and computed measurements (A/B × light/dark/hc), zero failures/skips. This m02 gate retains the existing 14-root harness; expanding it to every governed root belongs to m04. The explicit cell run does not rerun the historical platform-specific raster hashes or responsive baseline; those frozen files are untouched.

`before/` and `after/` retain Subscription detail and workflow-detail in light/A and dark/A, both frameworks, at 390/820/1440: **24 views per phase**. BEFORE Card backgrounds are browser system white/black instead of the scope's raised surface. AFTER all Cards equal computed `--sys-surface-raised`; every receipt has zero errors/overflow and computed React/Vue parity is empty. The summaries and `design-loop-capture.ts` retain the checks. Existing design-loop receipts include package hashes; the after capture ran the uncommitted m02 implementation on base head `8f8f0413`, not the base package bytes. The m02 commit binds those source changes and evidence together.

## Validation

- Four component suites: 579 passed; includes five resolver tests and the styles browser spec.
- Token brand/theme matrix and design-loop focused suite: 24 passed.
- MCP generated-application theme suite: 3 passed.
- Token validation, collision guard across six scopes, root typecheck and frozen offline install: passed.
- Six theme cells in each framework and all 24 AFTER design-loop views: passed.
- First branch CI run `34511941202` on `457dfc79`: a11y-contract job `102987957052` passed, including both six-scope runs and shared styles browser proof. The package job `102987957156` exposed missing clean-checkout prerequisites: its historical baseline-fold suite imports built MCP readiness code and uses historical Git objects. The job now builds the workspace packages and checks out full history.
- The same run's lint job `102987956921` rejected the new shadow's string type. Both authored shadow roles now use approved `$type: shadow`; the literal CSS value is preserved, avoiding composite expansion and keeping generated CSS and flat-value hashes byte-identical to the retained browser evidence. Token lint and token validation pass. `ci-*-first-failure.log` retains the failures.
- The unrelated ECharts soak job `102987957128` also failed its post-warmup heap-slope assertion (2007.575 bytes/render versus ceiling 0); no soak source or threshold is changed. The next branch run will establish its current result.
- Corrected CI run/job identities are pending; m02 remains In Progress until its package and browser gate execute green.

No full-suite capture was run; one five-suite capture is reserved for m07. Live bridge delivery remains the reviewed Sprint 191 head from m01.
