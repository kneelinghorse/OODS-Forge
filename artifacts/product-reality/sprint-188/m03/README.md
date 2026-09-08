# s188-m03 — packed Subscription application proof

The final execution is [final-verified/report.json](final-verified/report.json).
Both frameworks pass all eight inherited consumer gates, the full workflow,
16 state observations each and the navigation mutation/restoration. **The builder
does not certify craft or usability.** Read the [observed defects](craft-self-report.md).

| Required evidence | Receipt |
|---|---|
| Live in-run public workflow generation | [Composition](final-verified/composition.json), [React](final-verified/react-generation.json), [Vue](final-verified/vue-generation.json) |
| Fresh exact tarball installs; no source aliases, inherited node_modules or user registry config | [Packed inventory](final-verified/submitted-packages/inventory.json), [React isolation](final-verified/react/isolation.json), [Vue isolation](final-verified/vue/isolation.json) |
| Generated files own all application code and actions | [React source hashes](final-verified/react/source-ownership.json), [Vue source hashes](final-verified/vue/source-ownership.json). Every file except the tarball-substituted manifest is byte-identical to the generated artifact |
| Eight gates per App | [React](final-verified/react/receipt.json), [Vue](final-verified/vue/receipt.json): install, strict typecheck, production build, server render, mount, hydration, shared CSS and interaction |
| Seven flow rows per framework | [React flow](final-verified/react/flow.json), [Vue flow](final-verified/vue/flow.json). Ten records are verified across the active list (9) and Archived view (1); detail ID is subscription-003; Edit seeds Subscription 03; native Save persists Team annual; cancellation appears in detail, the list StatusBadge and timeline history |
| 4 states × 4 screens × 2 targets | [React states](final-verified/react/states.json), [Vue states](final-verified/vue/states.json): **32 distinct observations**, with marker and DOM text retained |
| 24 screenshots at 390, 820, 1440px | [Screenshot directory](final-verified/screenshots/); every image's identity, hash, viewport, selected ID and layout measurement are in the report. Detail/form/timeline use the edited and cancelled record |
| Navigation mutation | [Bite](final-verified/navigation-bite.json): remove the generated React handleRowClick navigation call; only detail-navigation fails. Restore source byte-identically and rerun all seven rows green. Vue's seven rows remain green |
| Current source emits the tested artifacts | [Hash equivalence](current-artifact-equivalence.json): React 15 files, Vue 16 files, including generated SSR entry points |
| Focused regression | [40 tests](mission-final-tests.log), 3 suites, zero skips: strict generated-app compilation, public contracts, store semantics, action/import guards, 66 baseline compositions / 132 generation cells. [Server build](build-final.log) passed |

The harness is the bounded `scripts/product-reality/s188-m03-app-consumers.ts`
extension of the s184/s185 lineage. It reuses that harness's gate vocabulary,
package packer, npm isolation, exact manifest preparation, import resolution,
static server and CSS checks. It creates no consumer component, domain callback
or data model. The generated main entry mounts or hydrates based on existing
root markup; the generated `renderApp` entry produces SSR markup. The observer
only invokes that entry and checks preservation of the server-rendered root.

Re-run from the repository with an unused output directory:

```sh
pnpm exec tsx scripts/product-reality/s188-m03-app-consumers.ts /tmp/oods-s188-app-review
```

Earlier attempts and their images remain as red/repair evidence. The first Vue
SSR typecheck failed on missing Node declarations and a props index-signature
mismatch; both were fixed without skipping library checks. The first packed run
passed flow checks but visual inspection exposed the native-Save and narrow-layout
defects documented in the self-report. The final proof clicks the visible native
Save and asserts that a successful write clears the stale unsaved notice.

No full-suite capture or sprint certification was performed here. m04/m05 enrich
the screens, and m06 reruns the complete proof at the frozen implementation head.
