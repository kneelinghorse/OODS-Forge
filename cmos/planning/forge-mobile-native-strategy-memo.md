# Mobile for the Forge platform — responsive hardening, native strategy, and an LLM mobile test sandbox

> **Status:** Planning input for Derek, 2026-08-01, session PS-2026-08-01-002. Grounded by workflow wf_ef223bd5-8b9, adversarially critiqued, corrections applied.
> **Evidence:** Section 1 is verified against the repo (branch `Forge-expansion`, 2026-08-01, file:line cited; counts re-verified in the main loop after the critique). Sections 2–3 rest on agent research: URLs are real, but **star counts, archive dates, and maintainer attributions are agent-reported — verify any figure before quoting it onward**. Anything marked *[speculative]* or *[unverified]* is synthesis, not evidence.

---

## RECOMMENDATION

**Build mobile capability INTO Forge — but only at the layers where the industry evidence says extension is cheap and durable: tokens, component specs/contracts, and the certify loop. Do NOT build a parallel native component library, and do NOT stand up a separate native design-system product.** Native UI code (SwiftUI/Compose/React Native components) should exist only as a *consumer* of Forge outputs, and only once a real native app exists to consume them.

Decision factors, in order of weight:

1. **Maintenance economics.** Every vendor that shipped a parallel native sibling of a web design system without a flagship native product starved it: Material iOS archived (agent-reported date 2025-12-11; maintenance mode since 2021), Salesforce's native token repos archived (agent-reported 2025-06-09), Fluent UI React Native in "alpha" for years, Carbon React Native near-abandoned (agent-reported 41 stars). The pattern is robust even if individual dates need verification. Derek is one person. A separate native system is two more of these.
2. **What divides cleanly vs what forks.** The consistent practitioner consensus (Danny Banks, Nathan Curtis, Spotify Encore, Booking BUI) is a token-sharing federation: tokens, naming/API contracts, a11y principles, and docs are shared; component implementations always fork per platform. Forge's architecture already *is* the shared half — DTCG tokens, a trait/object registry that can serve as the platform-agnostic spec layer, and a certify contract. That's the part worth extending.
3. **Forge's consumer model.** Forge's only consumers are agents over MCP. There is no native app today, so a "separate native app system" would be a system with zero consumers — the exact failure pattern above. If Parts Town (FRONT 1) produces a mobile need, that becomes the flagship consumer that justifies the walk/run phases here; the two fronts should be decided together.
4. **The sandbox makes "certify on native" a Forge-shaped capability.** Agent-drivable simulators, accessibility-tree extraction, and platform-native automated a11y audits are mainstream on macOS as of 2026. That means Forge's generate-and-certify loop can extend to native artifacts without Forge owning native UI code — certify becomes the bridge, not a component library.

**Which pillars extend cheaply vs need new machinery:** tokens/contract-determinism extend cheaply (Style Dictionary's predefined `ios-swift`/`compose` transform groups exist in the v4 line Forge already pins — `^4.4.0`, package.json:207 — no upgrade required; DTCG 2025.10 stable is explicitly cross-platform). Accessibility-by-construction extends at *moderate* cost — new machinery, but the a11y-tree-first pattern of the sandbox tooling matches Forge's approach exactly. Fidelity and theming need genuinely new machinery: native has no CSS-variable runtime, so the entire `data-brand`/`data-theme` mechanism must become resolved N×M static token sets, and VRT must become simulator-screenshot-based.

**Sequencing note (consumer-tied, not dogma):** responsive web is *not* currently solid. Who that hurts splits in two: the headless dashboard-HTML gap ships broken small-viewport fidelity to **agent consumers today** (a live fidelity-pillar defect); the view-context collapse, drawer, and Storybook-viewport gaps become urgent **the moment a human team — Parts Town — views Forge surfaces at phone width**. "Responsive before native" is a sequencing recommendation derived from those two consumers, not an abstract prerequisite.

---

## 1. Current responsive state and hardening list

### State (verified)

The audit finding is stark: Forge has **no breakpoint system at all** — no breakpoint tokens (`tokens/` grep: zero hits), no Tailwind `screens` customization in any of the four configs (`tailwind.config.ts:9-35` and siblings), no container queries anywhere in the codebase. Five CSS files contain width media queries, at six sites total (pagination 480px; stepper/toast/empty-state 640px; `apps/explorer/src/styles/index.css` 960px + 920px — re-counted in the main loop 2026-08-01). The rest of the responsive story is Tailwind's silent defaults.

The central defect: **view-context two-column layouts never collapse.** `src/styles/domain-contexts.css` defines all list/detail/form/chart/dashboard layouts via token-driven grid with zero width queries (its only `@media` is forced-colors at line 323). Rails have a `minmax(16rem,…)` floor (`apps/explorer/src/styles/tokens.css:309-312`), so at 375px a contextPanel keeps its 256px minimum and crushes the main column toward zero. This is arithmetic, not speculation. The contextPanel→drawer collapse is documented as done (`docs/Canonical Region Contract.md:36`, `docs/specs/regions.md:51`) but no drawer code exists.

Second CRIT: **zero mobile test coverage.** Every Playwright config, storycap capture, and Chromatic mode is pinned at desktop (1280px; `testkits/vrt/playwright.config.ts:17`, `testkits/vrt/storycap.lightdark.mjs:131`). Storybook's "320px previews" are constrained wrapper divs, not viewports (`stories/components/Pagination.stories.tsx:158`) — the published Storybook cannot evidence mobile behavior to a client.

Viz is split: LineChart/AreaChart/Scatter/Heatmap have a proven ResizeObserver pattern (`src/components/viz/LineChart.tsx:108-121`); BarChart, Sankey (900×500 defaults), Sunburst (600×600), ForceGraph (800×600), Treemap, and both spatial maps do no self-measurement — width/height are props with fixed defaults, so they only adapt if every caller passes measured sizes, and none does. Headless dashboard HTML emits a mobile viewport meta tag but a fixed 12-column grid sized against 1200px nominal width (`packages/mcp-server/src/tools/dashboard.render.html.ts:162,190,375`) — for agent-consumed output this is a fidelity-pillar gap today, before native even enters. Touch handling is absent by construction (hover→mouseover at `packages/viz-core/src/adapters/echarts-interactions.ts:182-186`; zero touch/pointer hits repo-wide), and the default Button is 40px tall (`src/components/base/Button.tsx:25-27`) — under Apple's 44px minimum, with no touch-target token or check.

### Hardening list (ordered)

1. **Breakpoint tokens in DTCG** (`tokens/`), wired into Tailwind `screens` + CSS custom media + the viz responsive-scorer (which currently has a mobile/tablet/desktop trichotomy with no px definitions and no runtime consumer — `packages/viz-core/src/patterns/responsive-scorer.ts:4-123`). Everything else keys off this.
2. **View-context collapse + contextPanel drawer** in `src/styles/domain-contexts.css` — stack two-column layouts below the breakpoint; implement the documented-but-missing drawer. Prefer container queries so views respond to their container, matching the one good in-repo pattern (Tabs' ResizeObserver overflow menu, `src/components/tabs/useOverflowMenu.ts:126-127`).
3. **Mobile test guardrails**: 375px + 768px Playwright projects with touch emulation; a viewport axis in storycap/Chromatic modes; real `viewport` parameters in Storybook stories (replacing wrapper-div fakes).
4. **Port the ResizeObserver pattern** to BarChart + the five fixed-size ECharts components; add SVG `max-width`/stacking rules to headless dashboard HTML.
5. **Touch-target token** (44px) + raise Button default or add a size check; add touch tooltip config (`triggerOn`) to the ECharts adapter.
6. **Wire or delete dead plumbing**: `RenderContext.viewport` (typed, frozen, never read — `src/types/render-context.ts:30-40`), and `resolveNetworkGridSpan`'s `viewportWidth` (an exported API option on `registerNetworkDashboardWidgets`; verified 2026-08-01 that no in-repo caller supplies it).
7. *[Unverified, cheap to check]*: audit whether `artifact.certify` has any WCAG 1.4.10 (reflow) or 2.5.5/2.5.8 (target size) rules — probably not; adding them makes responsive hardening *certifiable*, which is the Forge-native way to close this.

---

## 2. Native strategy options

**Option A — parallel native libraries (SwiftUI + Compose components).** The vendors who tried this for third parties abandoned it: Material iOS archived (https://github.com/material-components/material-components-ios), Material Android Views in maintenance mode with Google directing everyone to Compose (https://github.com/material-components/material-components-android), Salesforce native repos archived (https://github.com/salesforce-ux/design-system-ios). It survives only inside product companies with dedicated platform teams (Airbnb post-RN, Booking BUI — https://medium.com/booking-com-development/kotlin-multiplatform-in-production-two-real-world-use-cases-from-booking-com-46ffe13a773d, Spotify Encore — https://medium.com/spotify-design/reimagining-design-systems-at-spotify-2fe20fbb3552). **Reject for a solo operator.**

**Option B — React Native as the unifier.** The mainstream 2025–2026 answer for greenfield mobile at web-first orgs: Shopify's five-year retrospective is the reference (https://shopify.engineering/five-years-of-react-native-at-shopify). Caveats: public "design system as RN library" offerings are chronically under-resourced (Fluent RN perpetual alpha — https://github.com/microsoft/fluentui-react-native; Carbon RN niche — https://github.com/carbon-design-system/carbon-react-native), and the documented failure mode is brownfield hybrid embedding, not greenfield (Airbnb — https://medium.com/airbnb-engineering/sunsetting-react-native-1868ba28e30a). **If a native app materializes, this is the runtime that fits Derek's shape** (JS/TS-fluent, solo, greenfield), consuming Forge tokens via Restyle/Tamagui-style theming; Expo gives the fastest agent iteration loop. But it is an *app decision*, not a Forge-architecture decision.

**Option C — Flutter.** No web-first design system extends itself via Flutter; it shares nothing with a DOM/CSS token pipeline beyond the token source (https://docs.flutter.dev/ui/design/material). **Reject.**

**Option D — Compose Multiplatform.** iOS stable since May 2025 (https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/) but renders Material-look on iOS, lags Jetpack Compose, and is toolchain-alien to a TS monorepo. Even KMP-heavy Booking.com refuses to render its design system on iOS this way. **Reject.**

**Option E — token-sharing federation with Forge as the shared core (RECOMMENDED).** The consensus shape: shared foundations → shared tokens → shared component *specs/APIs* → per-platform implementations (Danny Banks — https://dbanks.design/blog/multi-platform/; Nathan Curtis — https://medium.com/eightshapes-llc/finding-platform-balance-in-a-design-system-47eaae48de98). Concretely for Forge:

| Forge layer | Extends to native? | Evidence |
|---|---|---|
| DTCG tokens → Style Dictionary | **Cheap.** SD ships `ios-swift`/`compose`/Flutter outputs and transforms in the v4 line Forge pins (^4.4.0) as well as v5 (https://styledictionary.com/reference/hooks/transforms/predefined/); DTCG 2025.10 stable is explicitly scoped to iOS/Android codegen (https://www.designtokens.org/tr/2025.10/format/). Caveat *[unverified]*: compatibility of the tokens-studio preprocessor with SD's native transform groups is untested (`packages/tokens/scripts/build.mjs` grep shows zero mobile formats today). |
| Contract-determinism | **Cheap conceptually.** The trait/object registry becomes the platform-agnostic spec layer — unified names/props/states/a11y contracts, exactly Banks's fix for unintentional forks (web "Alert" vs mobile "Banner"). *[This mapping is inference, but it is the strongest architectural fit in the research.]* |
| Multi-brand theming | **New machinery.** Brand/theme switching is CSS-var indirection via DOM attributes; native has no CSS-var runtime, so the pipeline must emit resolved per-brand-per-theme static sets (N×M). Nothing produces this today. Also there are no breakpoint/density/touch-target tokens to export yet (Section 1). |
| A11y-certify | **New machinery, familiar pattern.** See Section 3 — platform audits are agent-invokable and a11y-tree-first, matching certify's design. |
| Fidelity (VRT) | **New machinery.** Web VRT pipelines don't transfer; native fidelity = simulator screenshots as baselines (feasible via Section 3 tooling, but a new harness). |
| Viz | **Hardest.** The 13-type engine is ECharts/Vega in a DOM. Native paths are webview embedding or pre-rendered SVG/PNG via the existing headless pipeline — the latter fits agent consumers, but interactive native charts would be a rewrite. *[speculative]* |

Anti-goals from the evidence: pixel parity across platforms (repeatedly named as a lean-team killer), and re-implementing platform controls instead of using native ones — Ad Hoc's USMDS: "when possible, use native controls" for accessibility (https://adhoc.team/2024/08/13/us-mobile-design-system/).

---

## 3. The LLM mobile sandbox

**Verified answer: yes, an LLM can locally drive and test native mobile apps in simulators on Derek's Mac today, and it is mainstream as of 2026.** Three independent production-grade paths exist; accessibility-tree-first interaction (no vision model needed) is the dominant design — a direct match for accessibility-by-construction.

**Recommended toolchain for Derek's Mac:**

- **iOS:** XcodeBuildMCP (agent-reported: Sentry-hosted repo, 6.2k stars, 82 tools — build, run, test, simulator management, plus AXe-powered tap/swipe/type and a11y-hierarchy extraction; https://github.com/getsentry/XcodeBuildMCP; maintainer attribution unverified — the project originated with an individual maintainer). Covers the full build→drive→audit loop from one MCP server.
- **Cross-platform flows that persist as tests:** Maestro + its official MCP server (star count agent-reported and likely the main Maestro repo's, not the MCP server's; https://docs.maestro.dev/get-started/maestro-mcp). Agent inspects screen → writes YAML flow → runs → self-corrects → flow becomes a repeatable regression test. This "agent output becomes a deterministic artifact" loop is the most Forge-shaped property in the entire space.
- **If React Native is the runtime:** Expo dev-client + agent-device (agent-reported: Callstack-built, MIT, a11y snapshots, gestures, logs, network, perf; listed at https://docs.expo.dev/agents/agent-device/ — the Callstack-tool-on-Expo-docs pairing is odd, verify URL and ownership before relying) — seconds-fast edit→see loop.
- **Android:** ARM64 emulator headless (`-no-window`) + mobile-mcp (5.7k stars) or plain adb/uiautomator.

**Automated a11y audits, agent-invokable today:** iOS `performAccessibilityAudit()` (contrast, hit region, element description, text clipping, dynamic type) via a generated XCUITest or via Appium's `mobile: performAccessibilityAudit` with no test target (https://developer.apple.com/videos/play/wwdc2023/10035/, https://github.com/appium/appium-xcuitest-driver/blob/master/docs/reference/execute-methods.md). Android: Google's Accessibility Test Framework via Espresso/Robolectric (https://github.com/google/Accessibility-Test-Framework-for-Android) — build-integrated rather than live-screen; live-screen Android auditing needs commercial tooling (Deque/Evinced — unpriced here; budget a discovery call before counting on it). Hard limit on both platforms: nothing mainstream drives the actual screen readers (VoiceOver/TalkBack) under agent control — audits approximate screen-reader semantics via the a11y tree.

**How it plugs into Forge's certify loop** *[design sketch — speculative]*: a `certify.native` capability where the agent (a) installs a build on a headless simulator, (b) extracts the accessibility hierarchy — the same semantic layer VoiceOver consumes — and checks it against the trait/object registry's a11y contract (labels, roles, states present per spec), (c) invokes `performAccessibilityAudit` / ATF and normalizes the issue list into certify's report format, (d) captures screenshots as fidelity baselines against the resolved brand×theme token set. Forge certifies *artifacts and apps built from its outputs* rather than owning native components — consistent with the generate-and-certify north star and the agent-consumer model.

**Machine practicality (verified):** Xcode ~12–15 GB plus 5–8 GB per simulator runtime, 50 GB+ free recommended; Android emulator runs natively on Apple Silicon; both simulators concurrently is comfortable at 32 GB RAM, workable at 16 GB *[the concurrency figure is inference]*. CI later: macOS runners for iOS; GitHub recommends Ubuntu+KVM for Android emulators.

---

## 4. Phased plan

**Crawl — make web responsive real, and buy the two cheapest facts:**
- Hardening items 1–5 from Section 1, rough solo sizing (±50%, unvalidated): breakpoint tokens 1–2 days · view-context collapse + drawer 3–5 days (the real engineering) · mobile Playwright/VRT projects 1–2 days · viz ResizeObserver ports 2–3 days · touch targets 1 day — call it **2 weeks of focused work**. This fixes shipped defects (the dashboard-HTML fidelity gap serves agent consumers today) and directly serves Parts Town web work; the collapse/drawer item is urgent in proportion to PT actually happening.
- **Cheapest genuinely-informative first slice (a few hours):** add `ios-swift` and `compose` platform blocks to `packages/tokens/style-dictionary.config.cjs` and run the build. This directly tests the one unverified blocker (tokens-studio preprocessor vs SD native transform groups) and produces tangible Swift/Kotlin token files — the entire "tokens extend cheaply" claim, proven or falsified for ~zero cost.
- **Second slice (one afternoon):** install XcodeBuildMCP, boot a headless simulator, have an agent drive a scratch SwiftUI or Expo screen styled from the generated tokens, extract the a11y tree, and run `performAccessibilityAudit`. This is the certify-loop feasibility test end-to-end.

**Walk — only if crawl passes and a native consumer is plausible:**
- Emit resolved brand×theme static token sets (the N×M problem) from the pipeline.
- Formalize the trait/object registry as the cross-platform spec layer (names, props, states, a11y contracts) — no native component code yet.
- Prototype `certify.native` as an MCP tool over the sandbox; add Maestro flows as the persisted-test format.
- Decide the app runtime (default: React Native/Expo) — jointly with the FRONT 1 Parts Town outcome, since PT mobile is the only candidate flagship consumer visible today.

**Run — only when a real native app exists:**
- Distribute native tokens properly (SPM/Maven or generated-file handoff), native VRT baselines via simulator screenshots, CI (macOS runners for iOS are the expensive line item — GitHub-hosted macOS minutes bill at a multiple of Linux; Ubuntu+KVM for Android), and component implementations *in the app repo*, consuming Forge tokens and specs — per the no-missions-in-other-teams'-repos boundary if the app is client-owned.

Explicit stop-rule: if no native consumer materializes, stop at the end of crawl. The token outputs and sandbox knowledge keep; nothing rots, because no native component code was written — which is exactly the failure mode this plan is designed to avoid.

---

## Open questions only Derek can answer

1. **Is there a real native app on any horizon** — Parts Town mobile, or a Forge-owned app? Without one, walk/run should not start (the starved-sibling pattern). This couples FRONT 2 to FRONT 1.
2. **What does "mobile for Forge" mean for the agent consumer**: Forge *generating* native UI, or Forge *certifying* mobile apps others build from its tokens/specs? The recommendation assumes certify-first; if Derek wants generation, viz and component codegen scope grows substantially.
3. **Appetite for React Native/Expo** as his personal runtime if an app happens, vs learning SwiftUI.
4. **Machine budget**: is ~50 GB of disk for Xcode + runtimes acceptable on his Mac; is Xcode already installed and current?
5. **Which brand×theme combinations would a native target actually need** (bounds the N×M resolved-token problem)?
6. **Priority ordering**: Parts Town responsive-web hardening vs the native/sandbox spikes, if time forces a choice. The crawl phase assumes responsive-web first.