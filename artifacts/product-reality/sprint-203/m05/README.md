# s203-m05 — Context beside the design

Builder self-certified: **false**. Built on `codex/sprint-203-objects-and-context` from `b212c2cf5`
(m04 closed). This is the first cross-tool join, in the smallest honest form the roadmap asked for: no
binding table, no new client, no schema owned by anyone else.

## Forge fetches none of it, and the panel says so

The settled decision governs and was not reopened. Forge has no path to CMOS, TraceLab or Hive and does
not grow one here: a direct reader would couple the portable bundle to another product's schema and
break it for everyone who is not its author. So the caller — an agent that has already searched with
`cmos_decisions`, `cmos_context`, `tracelab_search` or Hive's read tools — hands what it found to
`design.preview`, and Forge's job is to check it, key it, store it and render it.

`context-beside-the-design.s203.spec.ts` asserts the closure directly: every `.ts` file under
`packages/mcp-server/src` is read with its comments stripped, and none imports a sqlite driver, names
`cmos.sqlite`, or calls a Hive, TraceLab or aquex surface. **Comments are stripped on purpose** — this
mission's own module names the caller's tools in its documentation, which is the opposite of reaching
for them, and a check that cannot tell those apart is worthless. It caught exactly that on its first
run, which is how the stripping got there.

## The input is `contextItems`, not `context`

A deviation from the memo's wording, for a reason worth stating. `design.preview` already has a
`context` input, and it means the **view** context — `detail`, `list`, `card` — the same thing
`object.context` and `compose.context` mean everywhere else in the tool. A second `context` meaning
something entirely different would have been a trap for every later reader. The inputs are
`contextItems` and `contextSearched`.

## What an item has to carry, and what happens when it does not

Forge cannot re-run the caller's search, so provenance is the only reason to believe an item. Each one
carries `source`, `id`, `title`, `body` or `excerpt`, the `query` that produced it, and `fetchedAt`;
`url` and `timestamp` are optional. Nothing is repaired on the way through, and a refusal writes
**nothing at all** — a half-stored panel would be worse than none, because the reader could not tell
which half.

| Refusal | Code |
| --- | --- |
| An item naming an object the composition does not show | `OODS-V207` |
| An item that cannot say where it came from, or has no content, or a malformed timestamp, or more than 200 items | `OODS-V206` |

`OODS-V205` was already taken by `action: accept`, so these are new codes rather than a reuse.

## Keyed to the object, stored on the version

Every panel is keyed to the composition's object and its Forge URN. Registry objects had no URN, so
this mission mints the obvious one from what an object already declares: **`urn:oods:object:<Name>@<version>`**.
The panel prints it, so the reader can see what the context is attached to rather than trusting that it
is attached to anything.

The result is stored on the version record beside `measurements`, which makes it durable and means it
travels with the lineage. An edit carries it onto the new version.

## Staleness means something, after I got it wrong

My first rule was "fetched before this version was composed". The real rows showed it was useless: a
caller always fetches before it calls, so the panel read **"3 items about Decision, 3 fetched before
this version"** on a perfectly current composition. Every item, every time, which is noise.

The rule now marks what is actually worth flagging: an item **gathered for an earlier version and
carried forward by an edit**, so the design has moved and the context has not. Nothing is re-dated —
each item keeps the `fetchedAt` it really carries — because the point of the mark is that the reader
sees the gap rather than having it smoothed over.

## One renderer, two surfaces

`shell.ts` gains `renderContext`, and both surfaces call it with the link callback that suits them —
the Sprint 202 pattern that already keeps `renderLineage` and `renderVersionList` honest across both.
The browser page renders each item's title as an anchor to its source; the conversation app prints the
destination as text beside the title, because it cannot open a tab from inside the host's sandbox.

**A version with no context renders nothing**, and that includes the stylesheet: the context CSS is
emitted only when there is context to style, so the page produced for every composition that has none
is byte-identical to what it produced before this existed. The spec asserts that directly. (The first
implementation emitted the CSS unconditionally and failed that assertion, which is how it got fixed.)

## Proven with real rows, on both surfaces

`context-fixture.json` holds **three real decisions from Derek's own CMOS store** — `#2161`, `#2158`
and `#2151`, the Sprint 203 decisions about the Decision object itself — read the way an agent reads
them and handed to `design.preview` as input.

- **Browser page** (`context-panel.png`, `context-page.png`): the panel beside the running Decision
  detail, three items with full provenance, the URN it is keyed to, and the honest empty state for
  TraceLab — `tracelab.evidence · "Decision object" · nothing found · searched 2026-09-16T07:03:51Z`.
  Zero console errors.
- **Conversation** (`context-in-conversation.s203.spec.ts`): the same panel in the reference host —
  Chromium, the double iframe on two origins, the spec's default CSP, the real adapter over stdio —
  with **zero console errors and zero CSP violations**. A preview with no context shows a panel that
  explains itself rather than an empty box.

## Tests

`context-beside-the-design.s203.spec.ts` — 7: stored on the version keyed to the object and shown with
provenance; the mis-keyed refusal; the two malformed refusals; context not marked stale on the version
it was gathered for; carried onto an edit's version and marked there; the page byte-identical without
context; and the closure over the whole server source.

`context-in-conversation.s203.spec.ts` — 2: the panel in the reference host with provenance and the
empty state, and the honest no-context state.

`@oods/mcp-bridge` 58/58, `@oods/mcp-server` 7,208 passed. One pin moved with the advertised schema and
is updated with its reason: `tool-specs-generator.s196` counted 125 root input properties across every
advertised tool and now counts 127, for `contextItems` and `contextSearched`. `docs:api`, `docs:tools`
and `docs:claims` regenerated through their generators; `docs:check` green; the adapter's description
check still 16/16.
