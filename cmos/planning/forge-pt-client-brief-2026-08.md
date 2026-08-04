# Parts Town — client conversation brief (2026-08)

**Status: DRAFT FOR DEREK'S REVIEW. Not client-ready until Derek reads it.** Written by the
s170 build session (2026-08-03) from committed artifacts only. No client contact has been made
from this session, and none should be until Derek has checked the numbers below — several are
re-derived here for the first time and one set could not be reproduced at all (§3).

**What this is for:** one document to take into the PT conversation, so the questions, the
blocker that changed, and the concrete asks are in one place instead of spread across three
memos and a decision log.

**Evidence base.** Every figure below is either (a) cited to a committed file with a path, or
(b) explicitly marked as agent-reported and unverified. Nothing is stated from memory.
The token evidence all comes from one extraction:

| | |
|---|---|
| Source file | `Parts-Town-Design-System` (Figma), version 106 |
| Extracted | **2026-07-27T18:12:44Z** — this is now over a week old |
| Tokens in the Figma file | **713** |
| In scope for conversion (color / number / text_style) | **587** |
| Converted to DTCG | **225** base + 84 across 12 mode sets |
| Committed at | `artifacts/tokens/partstown/` (`partstown.base.json`, `partstown.coverage.json`, 12 `partstown.mode.*.json`) |

---

## §1 The nine questions

Q1–Q8 are from `cmos/planning/forge-pt-design-system-decision-memo.md` (§"Open questions only
Derek can answer"). Q9 is named in that memo's risk section ("**The client-side driver to
probe**… added below") but was never numbered — it is numbered here so it does not keep getting
lost.

### Q1 — Commercial shape: fixed engagement + handoff, or ongoing retainer?
- **Current state:** open. Nothing in the repo assumes either.
- **What the answer unblocks:** how much publisher burden (semver, changelogs, migration guides,
  support windows) is acceptable. A retainer makes recurring release work fine; a fixed
  engagement means the deliverable has to be self-sufficient on handoff day.

### Q2 — PT's Figma plan tier?
- **Current state:** unknown. Assumed Enterprise but **never verified** (decision #1337 records
  it as "assumed Enterprise (verify)").
- **What the answer unblocks:** the whole ingestion pipeline. The Variables REST API and Extended
  Collections are Enterprise-only; Code Connect is Org+; plugins work on any plan. Styles-based
  extraction via plain REST works on every plan, so there is a baseline path either way — the
  tier decides whether it is the good path or the fallback.
- **Note:** the extraction already in hand (713 tokens) came from Stage1's `fig-extract` on
  supplied `.fig` files, not from the REST API, so this question does not block *having* tokens
  — it blocks a repeatable live sync.

### Q3 — PT's internal tooling: GitHub? An Artifactory-style registry?
- **Current state:** open.
- **What the answer unblocks:** delivery mechanics — npm package vs tarball vs source drop — and
  whether a private registry exists to publish `@partstown/tokens` into at all.

### Q4 — Is the SAP composable-storefront (Angular) re-platform real and near?
- **Current state:** open.
- **What the answer unblocks:** whether any component-code deliverable is worth building yet, or
  whether this is tokens + patterns + docs only. Their jQuery/JSP present suggests tokens-first.

### Q5 — Ownership on day one: PT stands up the GitHub org/npm scope, or Derek holds it in escrow?
- **Current state:** open.
- **What the answer unblocks:** repo creation, and the transfer clause in the contract. The
  handoff literature is unambiguous that client-owned is the end state; the only question is
  whether that starts now or is written down as a commitment.

### Q6 — Scope of "design system": tokens + theme + docs, or componentry too?
- **Current state:** open, and only Derek knows what was actually promised.
- **What the answer unblocks:** the single largest sizing variable in the engagement.

### Q7 — Does the Meridian Gate 5 boundary constrain reusing the parts-commerce model in a paid PT engagement?
- **Current state:** Forge's side of Gate 5 is CLOSED (package delivered 2026-07-18, accepted
  2026-07-19); only Meridian's own reconciliation remains outstanding, and that is theirs.
- **What the answer unblocks:** whether the pilot can use the parts-commerce domain model
  (which already defines ReplacementBanner / FitVerifier / SpecificationTable) or must use a
  generic commerce surface. **A fallback exists either way**, so this question is a
  nice-to-know, not a blocker. Two things are true regardless: the model is a frozen artifact,
  not registered in the live registry, so registering its objects/traits is a prerequisite for
  composing those screens through Forge tooling.

### Q8 — Does PT need mobile? *(ANSWERED)*
- **Current state:** **YES — answered by Derek 2026-08-01** (decision #1337). PT has native
  mobile and Derek holds Figma files for native iOS *and* Android.
- **What it already unblocked:** the mobile front's walk-phase gate condition (a real native
  consumer candidate) is satisfied in principle, so mobile work sequences after the crawl
  instead of being indefinitely gated. Mobile crawl items 1–3 are expected to pair with the PT
  seed once the answers to Q1–Q7 land.
- **Still worth asking in the room:** which of iOS / Android / mobile-web is actually first, and
  whether their native apps consume design tokens today at all.

### Q9 — Does PT have accessibility-compliance exposure or appetite? *(the unnumbered one)*
- **Current state:** open, and it is the question with the most commercial leverage in this list.
- **What the answer unblocks:** whether Forge's actual differentiator — generated output that
  arrives with a machine-checked accessibility verdict — is something PT buys for its own
  reasons rather than a vendor feature. PT is US e-commerce, where WCAG/ADA is a heavily
  litigated area. If the exposure is real, certified-accessible output is a line item; if it is
  not, it is a nice-to-have and should not be led with.

---

## §2 The blocker that changed

The blocker on this engagement is no longer "we have no tokens". It is **what is actually in
the file we extracted**. Three things, all checkable in the committed artifacts.

### 2a. The mode structure is effectively light-only

The extraction's base-mode policy is "use mode `Light` when present, else the first listed
value" — a heuristic, because *which Figma mode is each collection's default is not recoverable
from the extraction data* (`partstown.coverage.json` → `disclosedLimitations`). The dark mode
set that came out carries **8 token leaves** (`partstown.mode.dark.json`).
Twelve mode sets exist in total — `wireframe` (30), `desktop` (13), `tablet` (12), `dark` (8),
`ic-dark` (4), `ic-light` (4), `black` (3), `disabled` (3), `informational` (2), `success` (2),
`warning` (2), `mweb` (1) — **84 leaves across all twelve**, against 225 in the base set.

Note this is not the same as "PT's product is light-only". Dark-named *values* do exist in the
base set (`Semantics/Dark/*`, `Message/Dark/*`, `Neutral/Dark/*`). What is thin is dark as a
**mode**, which is what a theme switch would need. **Ask PT which it is.**

### 2b. Foreign token leaves — including an Apple UI kit

The Figma file carries token groups that are plainly not Parts Town's own vocabulary. The most
conspicuous is **Liquid Glass** (7 leaves: `Frost - Regular`, `Depth - Regular`, `Light Angle`,
`Opacity`, `Dispersion`, `Splay - Regular`, `Refraction`) — Apple's platform material system,
not a retail brand's.

**Provenance warning, read this before quoting a number.** A figure of "56 foreign leaves, 17 of
them Apple UI-kit" is in the decision record (#1422) as an s168 agent report. **The method
behind those two numbers was never recorded, and this session could not reproduce them.** What
follows is a fresh count with its membership stated, so Derek can check every line of it:

| classification | leaves (all 13 files) | group breakdown |
|---|---:|---|
| Apple platform-UI vocabulary | **28** | `Labels` 8 · `Liquid Glass` 7 · `Miscellaneous/Window Controls` 4 · `Accents/Indigo` 4 · `Component Fill` 1 · `Component Stroke` 1 · `Subcomponent Fill` 1 · `Subcomponent Stroke` 1 · `Vibrant Fills` 1 |
| Non-PT colour ramps | **13** | `Blue` 5 (`#1f75bb`, `#005daa`, …) · `Blurple` 4 (a blue-purple ramp, `#3946b1`/`#07117c`; "Blurple" is not PT vocabulary) · `Green` 4 |
| **clearly not PT's own** | **41** | of **309** leaves across all 13 committed files (225 base + 84 mode) |
| *ambiguous, counted separately* | *12* | *`Stacking` (Close 12 / Very Close 8 / Away 16 / Far 14) — these are NUMBERS, not colours, so this is a spacing or elevation scale and may well be PT's own. Counted here only so the total is auditable both ways.* |

Including `Stacking` the total is 53; excluding it, 41. Neither reproduces the s168 "56/17", which
is what you would expect from two different unstated methods. **Quote a number from this table
with the table attached, or quote none.** Also left out as unclassifiable: `Selected`, `Main`,
`Null`, `Page Header`, `Responsive`, and `FUNTIONAL L` (sic — the typo is in the source file).

**Why this matters commercially:** it is evidence the file has been assembled partly from
pasted-in third-party kits. That is not a criticism — it is normal — but it means a
token-inventory number quoted to PT should be "225 converted, of which ~53 are not yours",
not "225 of your tokens".

### 2c. Four tokens have no value at all

`Chrome Gradient`, `Chrome Gradient/Horizontal`, `Chrome Gradient/Vertical`, `Chrome Gradient`
(the name appears twice) resolve to nothing (`partstown.coverage.json` → `unresolved`). The
extraction's own disclosed reading is that **null-valued tokens likely mean an upstream Figma
library was not supplied to the extraction** — flagged rather than guessed. This is Ask 2 below.

---

## §3 The 13 first-wins collisions

Same path, same mode, two different values. The extraction resolves these **first-wins** and
itemizes every one — nothing was silently dropped (`partstown.coverage.json` → `collisions`).
Each row is a real question about PT's file: *which of these two is right?*

**Colour (5):**

| # | path | kept | dropped |
|---|---|---|---|
| 1 | `Neutrals/Gray 3` | `#d9d9d6` | `#e7eef0` |
| 2 | `Semantics/Dark/Progress` | `#676d6d` | `#3f63c0` |
| 3 | `States/Error Dark` | `#c93939` | `#c9395d` |
| 4 | `Parts Town Red` | `#b92b35` | `#c8102e` |
| 5 | `Primary (value)` | `#c9395d` | `#545f71` |

**Typography (8) — every one of these is a font-family or font-weight disagreement:**

| # | path | kept | dropped |
|---|---|---|---|
| 6 | `Desktop/Heading/H5` | Effra 16px **700** | Effra 16px **500** |
| 7 | `Desktop/Body/Body S Medium` | Museo Slab 12px **500** | Museo Slab 12px **700** |
| 8 | `Desktop/Label/Label S` | **Museo Slab** 12px 700 | **Effra** 12px 700 |
| 9 | `Desktop/Label/Label L` | **Museo Slab** 16px 700 | **Effra** 16px 500 |
| 10 | `Desktop/Label/Label M` | **Museo Slab** 14px 700 | **Effra** 14px 500 |
| 11 | `Desktop/Heading/H6` | Effra 14px **700** | Effra 14px **500** |
| 12 | `Desktop/Body/Body M/Body M Regular` | **Museo Slab** 14px 500 | **Effra** 14px 400 |
| 13 | `Desktop/Body/Body M/Body M Medium` | **Museo Slab** 14px 700 | **Effra** 14px 500 |

**Row 4 is the one to raise first, and the file itself says why.** The value that got *dropped*
there, `#c8102e`, is the value every OTHER "Parts Town Red" path in the extraction agrees on —
`Brand/Parts Town Red`, `Branding/Parts Town Red` and `Branding/PartsTownRed` all carry
`#c8102e` in the base set, and `Branding/Parts Town Red` carries it in the dark mode set too.
The value that *won*, `#b92b35`, appears exactly once in the whole extraction, on the bare
top-level `Parts Town Red` path. First-wins picked the outlier. That is an internal
inconsistency in their file, checkable without asking anyone — but which red is canonical is
still PT's call, not ours.

Six of the eight typography collisions are Museo Slab vs Effra on the same named style, which
suggests two eras of the type system coexisting in one file.

Three further names had to be renamed to avoid a group/leaf clash: `Primary` → `Primary (value)`,
`Chrome Gradient` → `Chrome Gradient (value)`, `Focus` → `Focus (value)`
(`leafGroupConflictsRenamed`). Worth confirming those are the same concept and not two.

---

## §4 The three asks

1. **A fresh Figma export.** The committed extraction is **2026-07-27**, file version 106. Every
   number in this brief is that snapshot. Staleness against their live file is unknown and not
   knowable from here (an explicitly disclosed limitation of the extraction). This is the
   cheapest ask and it re-bases everything else.

2. **The upstream library behind the four `Chrome Gradient` tokens.** They extracted with no
   value, and the most likely reason is a library that was not attached to the file we got. If
   it exists, we want it; if the tokens are dead, we want to be told so we can drop them.

3. **Confirmation of the Figma plan tier** (Q2). One sentence from PT settles which ingestion
   path is the real one.

**One more thing to raise, not an ask:** the 13 collisions in §3 need a decision-maker, not a
default. First-wins is a mechanical tie-break, not an opinion about which value is correct, and
one of the losers looks like their actual brand red.

---

## §5 Standing constraints (context, not questions)

Recorded so nothing in the conversation accidentally contradicts a ratified decision:

- **PT is brand-in-Forge + client-owned artifact delivery. There is no fork.** Ratified
  2026-08-01 (decision #1337, `forge-pt-design-system-decision-memo.md` Option 3).
- **PT's team never runs Forge.** They receive tokens + theme CSS + hosted Storybook + docs. The
  local-only machinery (mcp-server, bridge, certify, brand.apply) stays on Derek's machine.
- **Certification claims must stay honest.** MCP-rendered documents do not yet apply
  `data-brand`, so a "certified" render today is certified in the default skin, not PT's. Until
  the brand-aware render gap closes, certification claims about PT-*branded* output would be
  overclaims. As of s170, `artifact.certify` does return a four-pillar verdict
  (a11y-equivalence, determinism, contrast, accuracy) — real, and worth showing — but the brand
  caveat above is unchanged by that.
- **Before anything ships:** `@oods/viz-core` and `@oods/viz-render` declare MIT in
  `package.json` with no LICENSE file. That is on the s170 hygiene list; it must be closed
  before any package reaches a client.

---

## §6 What this brief deliberately does not do

- It does not contact PT. No client contact from a build session.
- It does not estimate. Move 2 ("make the brand pipeline real") is sized in the decision memo at
  2–4 focused weeks ±50%, **unvalidated** — that number is not repeated here as if it firmed up.
- It does not answer Q1–Q7. Those are Derek's, and several are commercial rather than technical.
