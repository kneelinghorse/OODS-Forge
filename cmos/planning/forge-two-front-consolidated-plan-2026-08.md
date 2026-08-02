# Two-front consolidated plan — Parts Town + Mobile (2026-08-01)

> Companion to `forge-pt-design-system-decision-memo.md` and `forge-mobile-native-strategy-memo.md` (both: session PS-2026-08-01-002, workflow wf_ef223bd5-8b9, critiqued + corrected). This document exists because both memos claim "now" from the same solo operator — it merges them into one ordered plan and states the couplings the individual memos can't see.

## How the fronts couple

1. **PT is the flagship consumer both fronts were missing.** Forge's north star lesson at the arc-park was "pick the certification scope to match a consumer need first" — PT is the first named human-team consumer Forge has ever had. The mobile memo's walk/run phases explicitly hang on a real native consumer existing, and PT is the only candidate; the PT memo's open question 8 now asks it.
2. **Committing to PT does NOT resume the parked correlation arc.** The park's resume trigger is narrow (an agent consumer demonstrably misled by the narrated correlation). PT work runs on different pillars: **fidelity** (the brand seam, currently a documented no-op — PT's Move 2 closes it), **responsive/fidelity** (dashboard-HTML small-viewport gap — hits agent consumers today), and potentially **a11y-certify as a purchasable deliverable** (PT is US e-commerce; WCAG/ADA exposure is open question 9). If PT ever surfaces a narrated-correlation harm, that is the arc's resume trigger firing naturally — until then the arc stays parked.
3. **The two fronts share their first infrastructure item.** Breakpoint tokens (mobile crawl item 1) are also what a PT responsive-web deliverable needs; the brand pipeline (PT Move 2) is also what native theming (N×M resolved token sets) would build on. Neither front wastes the other's work.
4. **Shared risk: the same person does everything.** PT Move 2 (2–4 wk) + mobile crawl (~2 wk) + Figma ingestion (1–2 wk, low confidence) is 5–8 weeks of focused solo work before a pilot ships. That is the honest bill; the ordering below is designed so every week ships something useful even if the engagement stalls.

## One ordered plan

| # | Item | Size (±50%) | Serves | Gate |
|---|---|---|---|---|
| 0 | FF#23 heatmap visualMap + FF#22 LayoutLayer.order fixes | days | Forge-Demos (live consumer bugs) | none — already ratified as backlog head |
| 1 | **Token-platform spike**: add `ios-swift`/`compose` blocks to the Style Dictionary config (pinned ^4.4.0), run build | hours | tests mobile's one unverified blocker; produces Swift/Kotlin token files | none — cheapest fact available |
| 2 | **PT discovery questions** (memo Q1–Q9: commercial shape, Figma tier, registry policy, re-platform timeline, scope, ownership, Gate-5 boundary, mobile need, WCAG appetite) | a conversation | everything downstream | Derek/client |
| 3 | **PT Move 2 — brand pipeline real** (brand-CSS generator, enum widening, PT brand dirs, font hook, viz-palette binding) | 2–4 wk | PT + closes the fidelity pillar's "brand seam no-op" gap → recoverable even if PT dies | can START before Q-answers; PT brand *values* need the Figma work |
| 4 | **Mobile crawl 1–3** (breakpoint tokens → view-context collapse/drawer → mobile test guardrails) | ~1.5 wk | PT web + agent dashboard-HTML fidelity | interleave with #3; breakpoint tokens first (shared) |
| 5 | **PT Move 1 — Figma → DTCG ingestion, STAGE1-FIRST** (Derek 2026-08-01: evaluate Stage1's existing Figma-scanning/drift pipeline for reuse before building anything) | eval: days; build: 1–2 wk if Stage1 doesn't cover it | PT | Stage1 eval result + Figma access + tier (Q2, assumed Enterprise) |
| 6 | **Sandbox spike**: XcodeBuildMCP + headless simulator + a11y-tree extraction + `performAccessibilityAudit` on a token-styled scratch screen | an afternoon | proves the certify-native loop end-to-end | anytime; do it as a break from #3 |
| 7 | **PT Move 3 — delivery repo + pilot surface** | 1–2 wk | PT (the visible win) | needs #3 + #5; Gate-5 fallback pilot if Q7 blocks |
| 8 | Mobile crawl 4–5 (viz ResizeObserver ports, touch targets) | ~1 wk | PT web + viz quality | after #7 unless PT demands earlier |
| 9 | Mobile **walk** (N×M resolved tokens, spec-layer formalization, certify.native prototype) | unsized | PT native mobile | **GATE OPENED 2026-08-01: Q8 = YES** (PT has native mobile; Derek holds iOS + Android Figma). Sequences after crawl + PT pilot; native component code still lives in the app repo, not Forge |

Items 0, 1, 3-start, 4-start, and 6 need nothing from PT — they are this-month work regardless. Items 2/5/7 are the engagement-shaped spine. Item 9 does not start on speculation.

## Money (what's known, what's Derek's)

- **Infrastructure is small and mostly free-tier**: GitHub org + Packages free tier; Chromatic reported free–$179/mo; zeroheight reported ~$49/editor/mo; Tokens Studio Pro reported ~EUR 17/mo — **all agent-reported, unverified; recheck before committing**. Sandbox: ~50 GB disk for Xcode + runtimes, $0 cash. Later native CI: macOS runners are the one expensive line.
- **The real cost is Derek's 5–8 focused weeks** (items 3–7). The recoverability story if PT never signs: Move 2 closes a documented Forge pillar gap; crawl fixes shipped defects; the spikes are knowledge. The only work that is PT-sunk is Figma ingestion + the delivery repo (~2–4 wk).
- **Engagement pricing, retainer vs fixed, and what PT was actually promised are Derek's domain** — the memos deliberately stop at the open-questions line. The one structural input from the research: system-level versioning + availability-priced retainer is the publisher-burden-compatible shape for a solo operator.

## What was deliberately not decided here

- Whether the engagement is tokens-only or includes componentry (Q6 — changes the delivery shape).
- The native app runtime (default lean: React Native/Expo — but it is an app decision, deferred to walk).
- Hosted-Forge-as-a-service (Option 4): phase-2 at most; real precedent exists (Supernova Relay, zeroheight MCP), and "generate-and-certify over MCP" appears to be whitespace (absence claim) — but do not let it gate the engagement.
