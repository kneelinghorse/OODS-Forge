# Strategic Position

**Status:** Historical vision snapshot — superseded for current sequencing on 2026-08-25
**Snapshot date:** 2026-05-10
**Companion to:** [overview.md](overview.md)

> **Historical vision snapshot (2026-05).** This document preserves the Position B+C / mission-graph frame as point-in-time context. It is not the current Forge forward plan, CMOS work queue, or the Shopify enterprise proof's execution plan. Current Forge sequencing lives in [roadmap/near.md](roadmap/near.md), and current mission state lives in CMOS. The Shopify proof runs in its sibling repository; Forge serves it by `cmos_message` and does not absorb that project's D1–D6 or sprint sequence.

This document captures the *why* behind the OODS-Forge plan: what we're building, what we explicitly are not, where the design system field is heading, and why the current moment is the right one to plant a flag.

---

## The Bet

We are all-in on **Position B + C** as named in the long-term planning conversation 2026-05-09:

### Position A — "Operator Engine" (contained, not the bet)
Ship V2 as drafted: agent operator workflows, Stage1 round-trip ergonomics, review/recovery, registry depth, observability. This makes Forge the best-in-class internal engine for one team operating one design system + one Stage1 partner.

**Why not just A:** Strategic ceiling is "really good private tool." Doesn't exploit the seams the field just opened.

### Position B — "The Object Catalog"
Define and publish the **OODS Object Catalog format** as a concrete artifact that A2UI hosts, Storybook MCP, Figma Code Connect, and other design tools can consume. Forge becomes the reference implementation for the layer above components.

**Position adjacent to A2UI, not competitive.** A2UI specifies a wire format that assumes a catalog exists; nobody has standardized what an *object* catalog looks like.

### Position C — "Design Intelligence Platform"
The category. Forge is one organ in a stack that observes real-world UI in the wild, canonicalizes it into evidence-backed shape families, composes those shapes into agent-operable design systems, governs their distribution across federated catalogs, and watches their behavior in production — all addressable through MCP. The aquex.ai portfolio collectively ships this.

**The category doesn't exist yet.** "Drift detection" exists; "design system observability" exists; "DS measurement tools" exist. *Reconciliation* — the bidirectional pattern of consuming evidence and emitting schema deltas with confidence — is structurally absent from the public market.

### A ⊂ B ⊂ C
These compose. A funds B funds C. The roadmap question isn't *whether* to do A vs B vs C; it's *how soon to make B/C legible* in the work itself.

---

## Open vs. Proprietary Posture

**Eventual goal:** open everything, or as much as possible.

**Current posture:** competitive area, build smart, no premature commitments.

**Mechanic:** OODS-Forge is private (`github.com/kneelinghorse/OODS-Forge`). Public predecessor `OODS-Foundry-mcp` is frozen as v1. The boundary between OODS-the-spec (likely open) and Forge-the-engine (likely commercial open-core) and aquex-the-platform (commercial) doesn't get drawn until we're working from a position of clarity. See [decision-points.md → D5](decision-points.md).

**Trigger philosophy:** Get it working, prove it works, then make sensible publication choices. We don't know enough to pre-commit. The risk of opening too early is a competitor ramps on our spec; the risk of closing too long is irrelevance. The middle path is private development, public publication of *artifacts the field can use* once they're stable.

---

## Where the Field Is Heading

Synthesis from web research 2026-05-09 (full citations in `_archive/` if needed; key sources noted inline).

### Three forces converging
1. **LLM agents need structured context, not screenshots or code dumps** — driving the MCP-server explosion across Figma, Storybook, Subframe (Q4 2025–Q1 2026).
2. **Wire formats for "agent describes UI, host renders" are arriving** — Google A2UI v0.9 (Dec 2025) is the landmark. Transport-agnostic. Stops at the catalog (catalogs are assumed to exist; nothing specifies how they're authored).
3. **Design system measurement is being rebuilt as observability** — Knapsack ($10M raise Oct 2025), Omlet, Buoy, OverlayQA, Supernova. All measuring code-side adoption. None measuring real-world usage signals back into the system.

### Standardized seams (the connectors that just arrived)
- **DTCG 2025.10** — first stable design tokens spec (Oct 28 2025). Format war over.
- **A2UI v0.9** — runtime UI wire format (Dec 2025). Catalog-shaped. MCP-compatible.
- **MCP-for-design** — Figma MCP, Storybook MCP, Subframe MCP, all live or near-live as component/design context surfaces.
- **Anthropic SKILL.md** — agent skill standard (Dec 2025). Adopted across Claude Code, Cursor, Codex, Gemini CLI.
- **Headless primitives ecosystem** — shadcn/ui consumption pattern, Radix → Base UI, react-aria, Tailwind v4. Components ship as source-you-own, not packages-you-import.

### What the standardized seams stop at
- **A2UI:** assumes a catalog exists; doesn't say how it's authored, what objects it represents, how it's reconciled with reality.
- **Every MCP design server:** exposes *components*, not *objects*. None has a tool surface that says "here is a User; here are the candidate compositions for showing one."
- **Every "DS observability" tool:** measures one direction (are we using the DS in code?). None measures the inverse (is the DS describing what the world actually builds?).
- **Code Connect / Token sync / Knapsack / Specify:** display, sync, or centralize. None reconcile bidirectionally.

### The market signal
zeroheight 2026 report:
- 8% of teams call their DS "very stable"
- 44% call it unstable
- DS buy-in dropped 42% → 32% YoY
- Gartner has DS sliding into the Trough of Disillusionment
- Only 40% of teams have automated token pipelines

**Reading:** the *current* DS approach is breaking, and the field knows it. The connectors to make a system like Forge legible to other tools just arrived. The category to plant a flag in is unclaimed.

---

## What's Underclaimed (Where Forge Plants Flags)

Five vacant categories surfaced by the field analysis, with Forge's structural advantage in each:

### 1. The Object Catalog (above the Component Catalog)
**Gap:** A2UI standardizes catalogs of components. Nobody has standardized catalogs of *objects* — User, Product, Subscription, Invoice — with their traits, presentations, evidence-refs, and relationships.
**Forge today:** schema engine treats objects as first-class. Already there.

### 2. Bidirectional Reconciliation Engine
**Gap:** "Design drift detection" exists; "design *reconciliation*" doesn't. The Stage1 → OODS pattern (observed evidence + ConfidenceDecomposition + candidate mappings + variant reconciliation) has no public peer.
**Forge today:** Stage1 write-side loop live (sprints 90–95). Already there.

### 3. Brand Overlay as Resolved Graph (Not File Swap)
**Gap:** Multi-brand is everywhere stated and nowhere modeled. A token-graph engine that resolves brand × mode × density × surface with full provenance is open territory.
**Forge today:** `brand_apply` + DTCG tokens + multi-brand presets. Halfway there.

### 4. Catalog Authoring + Provisioning for A2UI/MCP Hosts
**Gap:** A2UI says the host owns the catalog. Who *authors* the catalog from a real codebase, keeps it in sync as the codebase evolves, signs off the components an agent is allowed to call? No obvious tool.
**Forge today:** `compose → validate → render → codegen → save` pipeline plus registry/snapshot already does most of this. The reframe is: position Forge as "the A2UI catalog factory."

### 5. Bidirectional Object Catalog MCP for Design Systems
**Gap:** Today's MCP design servers primarily expose component/design context or canvas operations. They do not expose a versioned object catalog that accepts evidence-backed reconciliation deltas and updates its own schema surface.
**Forge today:** `map.apply`, `map.create`, `map.update`, and `map.delete` already mutate reconciliation state; `registry.snapshot` and catalog/object tools expose read surfaces. The public framing as a writable Object Catalog MCP with reconciliation semantics is the precise market wedge.

---

## What We Are *Not* Building

Strategic clarity by negation:

- **Not a Figma plugin.** Forge does not author inside design tools. It consumes from them (Code Connect, Storybook MCP, A2UI hosts) and emits artifacts they can use.
- **Not a prompt-to-code tool.** v0/Bolt/Lovable plateaued in 2025. Subframe explicitly bet against this. Forge produces deterministic output from schemas, not generative output from prompts.
- **Not a token CLI.** Style Dictionary 4 + DTCG 2025.10 own the encoding layer. Forge sits *above* tokens, integrating them via brand overlays.
- **Not just observability.** Knapsack, Omlet, Buoy, OverlayQA, Supernova all measure adoption. Forge does the *bidirectional* part — accepts observations, emits schema deltas. Observability vendors are downstream consumers, not competitors.
- **Not a design-to-code black box.** Forge's value is in the *catalog* (the published Object spec), not in being the only path from design to code. The catalog can be consumed by any conforming tool.
- **Not an LLM application platform.** Forge is the substrate that makes design systems legible to LLM agents via MCP. We don't build the agents.
- **Not just for one team.** Position B/C imply a published spec the field can adopt. The plan accommodates that even when current development is private.

---

## Why Now

Three reasons the moment is right despite the field being noisy:

1. **The connectors just arrived.** A2UI, DTCG stable, MCP-for-design, SKILL.md — all in the last 6 months. A year ago Forge had nothing to plug into. Now it has multiple seams.
2. **The pain is at peak.** zeroheight's 2026 numbers describe a category in disillusionment. The field is hungry for a coherent next step.
3. **The portfolio is structurally complete.** aquex.ai's organs (Stage1, concordance, OODS-Forge, semantic-federation, CMOS, agent-vitals, Aquex-mcp, TraceLab) are not aspirational — they exist in varying states of readiness. The synthesis exists; the narration does not yet.

The honest framing: the rest of the field has now built the infrastructure that lets a project like OODS-Forge make sense to other tools. The roadmap question isn't "what should we become"; it's "which of these now-standardized seams do we plug into first to be visible at the layer where we actually work."

---

## What Remains Implicit (and Should Stay That Way for Now)

Some strategic questions are deliberately not closed in this document because closing them prematurely would be more harmful than the ambiguity. They get resolved as Forge ships and as adjacent organs (concordance, semantic-federation, aquex.ai) come online:

- The exact public-vs-private boundary mechanics (D5).
- Whether the runtime/build-time line moves over the plan (implicit via D2).
- Order of fidelity-ladder rungs (boxes-and-arrows first? wireframe? IA?).
- Whether the OODS spec gets its own repo and governance structure separate from Forge.
- Whether aquex.ai positions "Design Intelligence Platform" as the category name or settles on something else after testing.
- The relationship between OODS-the-spec and Schema.org / ARIA / OOUX / other adjacent vocabularies (your TraceLab research surfaces this as an open architectural fork).

These are tracked but not forced. They resolve as they need to.

---

*Snapshot authored 2026-05-10 from the 2026-05-09 → 2026-05-10 planning conversation; superseded for current sequencing on 2026-08-25.*
