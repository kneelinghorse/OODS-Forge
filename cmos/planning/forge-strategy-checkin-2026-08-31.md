# Forge strategy check-in — 2026-08-31

**Status:** RATIFIED by Derek 2026-08-31/09-01 (decisions #1609/#1610, session PS-2026-09-01-001). Sequencing confirmed: s180 as committed → adoption arc. Portable-runtime arc restructured as TWO GATES: Gate 1 (pinned private bundle to named consumers — "run one for sure") AUTHORIZED; Gate 2 (license + public npm/registry publish) DEFERRED and explicitly Derek's, with the distribution UX question held open — npm is not assumed to be the adoption answer ("wondering if there's a better UX"); explored from a working gate-1 bundle. §4's npm/registry lanes are therefore gate-2 CANDIDATES, not commitments. Originally written post-s179-COMPLETE, pre-s180 planning, at Derek's request.
**Inputs:** the decided record (CMOS decisions + constraint #5 + the 2026-08-25/28 rulings) · TraceLab project `1ca2ce70` "AI Visual Design Research" (DT-R002 report of 2026-08-31, Agent-Native Landscape report of 2026-08-20, 16 docs) · a fresh web scan (2026-08-31, six new evidence entries under session `forge-strategy-checkin-2026-08-31`).
**What this memo does not do:** re-open anything Derek already ruled on. Decision points that remain his are marked ►.

---

## 1. What is already decided (do not re-litigate)

| Decision | When | Where |
|---|---|---|
| Enterprise-scale proof target = **Shopify**; sibling repo owns execution; Forge = engine behind MCP | 2026-08-25 | #1532, PS-2026-08-25-002 |
| All three Shopify-Forge ask clusters **accepted**: ingestion (charter post-s179), certify-binding (shipped in s179), portable runtime | 2026-08-28 | message-intake ruling |
| **Portable NON-hosted stdio runtime = its own arc.** Nothing hosted; stdio the sole ingress; consumers run a pinned bundle. Stopgap E2E first; known facts: `pnpm deploy` fails on unpublished `@oods/tokens`, ~11.2 MB gzip floor | 2026-08-28 | same ruling |
| **Adoption / external use is the sprint-framing lens** ("the release boundary … makes me not just drift all over with random arcs") | 2026-08-28 | Derek, near-verbatim |
| s180 committed opener: dashboard-binding fold + ingestion cluster body | 2026-08-28 | s179 memo §3 / F2 |
| Constraint #5: consumers are agents via MCP; Forge is not a hosted service | 2026-06-18, reaffirmed 2026-08-22 | constraint #5 |
| Communicate-Forge / agent-native onboarding = backlog until pulled forward | 2026-08-21 | strategic-direction record |

So: "app vs repo" was substantively answered on 2026-08-28 — Forge stays a repo-shaped engine and **ships as an installable artifact**. What was left open is the artifact's *shape* (§4) and the arc's *sequence* (§6).

## 2. Where the puck is going — the landscape, source-dated

**The machine interface is table stakes.** The July 2026 State of AI in Design Systems survey (20 OSS systems, 26–28 July): 17 of 20 ship an official MCP server; agent skills nearly universal. DT-R001's March conclusion ("no competitors expose a design system via MCP") is dead. Nobody argues about *whether* to ship a machine interface anymore.

**The frontier is evidence.** The same survey places the frontier at: (1) **validation loops** — turn "follow the system" into a *failing feedback loop*; (2) **published evals/benchmarks** (Atlassian evals, shadcn `evals.json`, Astryx nightly ledger); (3) **compiled, not hand-written, context**. Tool-gating beats prohibition — "the strongest systems restructure the task so hallucination can't happen." This is a near-verbatim description of what Forge has spent 179 sprints building: semantic composition as structural constraint, certification as the measured loop, `renderHash`/contentHash as receipts.

**Standard rails settled in the last 10 months.** DTCG hit its first stable version (2025.10, Oct 2025); Style Dictionary v4 and every DS platform implement it — Forge's 322-token DTCG pipeline sits on a settled standard. **MCP Apps** became the first official MCP extension (2026-01-26): a `ui://` HTML resource rendered in a sandboxed host iframe with bidirectional JSON-RPC — the preview-and-approve loop we once assumed we'd hand-build. **`.mcpb` bundles** became the one-click local-install norm for MCP servers (server + all deps, no Node required), alongside npm and the official MCP registry.

**Figma made up real ground — and kept its old center of gravity.** Timeline: canvas opened to third-party agents via MCP (Mar 2026) → own agent with OpenAI/Anthropic (May) → Config 2026 (Jun): Motion, shaders, Weave, agent skills + MCP-client + web search. But the agent path is gated and lossy in practice: View/Collab seats get **6 MCP calls per month** on every plan; ~85–90% styling inaccuracy without Code Connect and a 40–80h Code Connect setup; a pre-approved **client allowlist** the community says "breaks the core promise of MCP"; write-to-canvas is free-beta with "will eventually be a usage-based paid feature" and no published unit.

**New entrants prove the surface market, none carry evidence.** Claude Design (research preview 2026-04-17; imports a design system from the codebase, human edit loop). Moda ($7.5M seed, WebGPU canvas, proprietary context representation). Open Design (93.1k stars, local-first agent design harness — and still lists multiplayer canvas as a gap). v0/Lovable/Bolt keep the design-to-code workbench category growing. **None of them produce conformance evidence.** DT-R002's scan found no competitor with a failing certification loop over what was actually rendered.

## 3. The Figma read, said plainly

Derek's "still a relic" has a precise form: **Figma modernized the interface without changing the artifact.** The artifact of record is still a mutable canvas graph — pixels and frames first, semantics derived, no evidence loop; agents were bolted onto that artifact, and monetization (seats, allowlisted clients, metered writes) wraps the old center of gravity. Forge inverts it: the artifact of record is the semantic object; the render is derived; the certificate is the receipt. Where they genuinely lead — distribution (every IDE and agent client integrates Figma), multiplayer, and design-org mindshare — is exactly the layer DT-R002 says not to compete on.

The honest risk register: a big vendor could bolt a validation loop onto its agent path (Claude Design already "builds a team design system from the codebase"). The defense is not speed to a canvas — it is depth of evidence (renderHash epochs, receipts, bite-proven gates) plus the enterprise proof. That defense compounds per sprint; a canvas does not.

## 4. The portable-runtime arc now has a concrete shape (research answer, ► ratify)

The 2026 distribution norms map one-to-one onto the accepted constraints:

- **npm package lane** — for technical consumers and CI; requires publishing `@oods/*` (the known `pnpm deploy`-on-unpublished-tokens failure gets fixed by actually publishing, or by bundling).
- **`.mcpb` bundle lane** — the pinned, self-contained, no-Node install for Claude Desktop-class hosts. This IS "consumers run the pinned bundle themselves," standardized; it is also the closest true form of "binary install" short of a compiled executable, which nothing in the ecosystem requires.
- **Official MCP registry listing** — discoverability norm; costs a manifest.

Sequenced inside the arc exactly as already ruled: the consumer-vendored stopgap E2E runs first and feeds the packaging spec.

## 5. One genuinely new roadmap candidate: the MCP Apps preview surface

DT-R002 (2026-08-31, 17 verified refs) recommends **STANDARDIZE**: expose the Forge render preview as an MCP Apps `ui://` resource on the existing server — inspect the object, adjust parameters, approve/request-changes as *server tools* that update model context. Estimate 3–5 engineer-weeks under stated assumptions; mandatory text fallback keeps constraint #5 intact (nothing hosted; the host renders an iframe the server already carries). Rejected options stay rejected: BUILD (multi-quarter multiplayer canvas = table stakes done badly) and RENT (Figma delegation erodes the object model and prices are unpublished).

The report's sharpest line for us: **make the certification report the differentiating UI outcome, not the visual preview.** The preview is the carrier; the receipt is the product.

► This candidate is new scope — no existing decision covers it. It composes naturally with the portable-runtime arc (same server, one distribution moment).

## 6. Roadmap check: what changes, what doesn't (► sequencing is Derek's)

**Nothing decided needs reversing.** The landscape *strengthens* both standing bets: the Shopify proof is precisely an "evidence-grade, feedback-loop-enforced" story at enterprise scale, and the adoption lens matches a market where install friction and evidence are the two live differentiators.

Recommended sequence, stated as the reviewer's best call rather than a menu:

1. **s180 as committed** — dashboard-binding opener + ingestion cluster. It serves the proof, it was promised to an accepted consumer, and it front-runs nothing.
2. **s181-class: the adoption arc** — portable runtime (stopgap E2E → npm + `.mcpb` + registry) with the MCP Apps preview riding the same arc if ratified. This is where "communicate Forge" stops being a parked doc problem: the survey's "compiled context" norm (llms.txt, skills, evals) is the natural vehicle — ship compiled agent context *with* the bundle, and the onboarding worry mostly dissolves into the packaging work.
3. **Operational carries ride the next sprint regardless** (from the s179 close): CI-14 disposition before the next push, the due pin-SHA reconnect with the repl + dashboard-contentHash corrections, the R05 control re-author, the ledger park row, the `.d.ts` SR-22 fix.

**Watch items** (dated, cheap to re-check quarterly): Figma's usage-based write pricing when published · MCP Apps host-support matrix hardening · whether any DS platform ships a render-evidence loop (the moat-erosion tripwire) · Claude Design's trajectory from research preview.

## 7. Sources

Full citation trail: TraceLab project `1ca2ce70-e6c2-4593-aeb8-b4aa9f3fff01` — DT-R002 report (17 verified refs incl. the MCP Apps SEP, Figma developer docs, the July 2026 survey) + six dated entries under session `forge-strategy-checkin-2026-08-31` (Config 2026 recap, Figma MCP limits, DTCG stable, `.mcpb`, MCP registry norms).
