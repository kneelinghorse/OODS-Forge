# Delivery objects

Sprint 203 m02 adds three alpha objects born from Derek's own CMOS store: Decision, Sprint and
Session. Authoring follows [the object authoring guide](../../docs/authoring-objects.md), and the
[research objects](../research/README.md) are the precedent this domain inherits.

The authoritative shape is the live store, read directly rather than from a specification:
`cmos/db/cmos.sqlite`, read with `sqlite3 -readonly`, at 1,933 `strategic_decisions`, 186 `sprints`,
499 `sessions` and 1,082 `missions` on 2026-09-16. Forge reads that store at authoring time and
never at runtime: there is no CMOS client in the server, and there is not going to be one — a direct
reader would couple the bundle to CMOS's schema and break it for everyone who is not Derek.

[`artifacts/product-reality/sprint-203/m02/fit-read.json`](../../artifacts/product-reality/sprint-203/m02/fit-read.json)
maps **every column of all four tables** to a reused object, a reused trait, a new trait, a born
field, or "not modelled" with the reason, beside the null and distinct counts it was read from. The
YAML models what the store writes and nothing it does not.

## What reuses, and what does not

`lifecycle/Timestampable`, `lifecycle/Stateful`, `content/Labelled`, `core/Classifiable` and the
behavioural traits carry most of it. `lifecycle/Supersedable` is the one genuinely new trait.

**research/Mission is not reused, and the refusal is measured, not preferred**
([reuse-proof.json](../../artifacts/product-reality/sprint-203/m02/reuse-proof.json)). The Sprint 203
memo assumed a CMOS mission was largely a subset of TraceLab's research mission. It is not, on four
independent counts: `Dropped` and `Deferred` have no counterpart in the research state set, and the
object's own field description forbids coercing an unknown server value; `id` and `project_id` are
declared `uuid` while not one of the 1,082 CMOS mission ids is uuid-shaped; `materialization_pending`
and `search_ready` are required TraceLab pipeline internals a CMOS mission has no value for; and 41
of the object's 53 fields are TraceLab plumbing that would render empty, while `sprint_id` — the link
that organises the whole of CMOS — has nowhere to go. It is also TraceLab's object, and widening it
would edit another team's contract.

So no CMOS mission object is authored here. The registry is keyed by object name, so a second
`Mission` could not exist beside TraceLab's in any case, and no screen in this sprint needs one: a
mission reaches these screens as `Sprint.mission_count` and as the `mission_id` a Decision names.

## What each object diverges on, and why

- **Decision** has no title. CMOS records only `decision_text`, so the record's identity is its id and
  the detail is headed by it; nothing invents a heading. `decision_text` is the longest free text this
  registry carries — 61 to 8,418 characters, with 197 of 1,933 rows over 2,000 — and it is declared
  with no `maxLength`, so no screen may truncate it into meaning it does not have.
- **Sprint** counts its missions rather than reading CMOS's `total_missions` and `completed_missions`,
  which are null on 176 and 177 of 186 rows. Its `sprint_id` is opaque and never parsed: the live
  store holds both `sprint-203` and `Sprint 22`, and both are authoritative. `start_date` and
  `end_date` are declared as text because the store holds a date on some rows and a full timestamp on
  others; reformatting either as if its shape were known would be a claim the record does not make.
- **Session** models the actor as an `agent`, not a user: the live store records `assistant`, `codex`,
  `claude-opus-5` and others, while `user_id` and `author_user_id` are null on all 499 rows, so
  `structural/Ownerable` is not composed on a field that has never been written. `session_type` is a
  classification (review, planning, custom, check-in, research), not a second lifecycle.

CMOS writes sprint and mission states capitalised and session states lowercase. The trait engine's
contract is a lowercase identifier vocabulary, so the objects declare the canonical identifier and
leave display casing to the component. That is a casing normalisation of a fully enumerated
vocabulary, not a coercion of an unknown server value.

Every column of the event-sourcing envelope — `stable_event_id`, `occurred_at`, `origin_seq`,
`event_type`, `schema_version`, `author_user_id` — is CMOS's replication mechanism rather than the
thing itself, and none of it is modelled.

Generated fixture data is for composition and preview only, exactly as it is for the research objects.

## Public registry and composition checks

```bash
pnpm generate:objects
pnpm --filter @oods/mcp-server exec vitest run test/objects/delivery.spec.ts
```

The object loader scans this directory recursively; rebuild the MCP server and start its next process
from the updated checkout to refresh its in-memory registry.
