# s203-m03 — Objects born from Hive's cohort

Builder self-certified: **false**. Built on `codex/sprint-203-objects-and-context` from `54ce7a4a2`
(m02 closed). Hive was read through its **read tools only** — `hive_overview`, `cohort_list`,
`person_detail`, `clusters_top`, `articles_get`. Its three write tools (`feed_deactivate`,
`index_generate`, `article_mark`) were **never called**, and Forge gained no code path to it.

## The surface, as it actually is (2026-09-16)

Hive is a read-only MCP surface, local dev only, **with no screens of any kind** — so Derek reads a
cohort of ~520 named people through an agent and nothing else. These are the first screens that cohort
has had, which is why the memo called it the clearest whitespace in the portfolio.

**740 people rows, 307 active across 331 feeds, 426 articles in the 14-day window, 26 multi-person
clusters**, 93 people having written in 30 days. The live shapes are recorded verbatim in
[`hive-shapes.json`](hive-shapes.json); `meaning_layer` (71 people) is a topic the memo's list did not
name, and the article count is 426 rather than the 427 the memo recorded.

## The fit read

[`fit-read.json`](fit-read.json), from [`fit-read.mjs`](fit-read.mjs), maps every field of each surface
and fails its own output if one is left without a disposition.

| Surface | born | reused trait | not modelled |
| --- | --- | --- | --- |
| person (14 live fields) | 12 | 1 | 1 |
| cluster (16 live fields) | 12 | 2 | 2 |

Almost everything is genuinely born, and that is the finding rather than a shortfall: an intelligence
cohort is not a customer list. The fields that are *not* modelled are query arguments —
`include_activity`, `min_people` — which decide what a call returns rather than describing the thing.

## Three of four reuses are refused on measurement; one holds

[`reuse-proof.json`](reuse-proof.json), from [`reuse-proof.mjs`](reuse-proof.mjs), answers each against
live values rather than field names.

| Question | Answer |
| --- | --- |
| `tracking_status` as `lifecycle/Stateful` | **Reused.** `active \| tracked_unfeeded \| dormant` is an ordered lifecycle of one record, documented by Hive as exactly that. The one reuse that survived. |
| A cohort member as `core/User` | **Refused.** `user_id` is `uuid` and Hive's `person_id` is an integer surrogate key; `primary_email` is a **required** `email` and Hive holds no email for any of the 740; and `User.role` is an **enum of account roles** (`end_user, admin, owner, billing`) that free text like "Datasette; daily LLM posts" cannot be. `User` also composes Authable, Preferenceable, Addressable and Communicable. Someone you follow is not an account holder. |
| co-talkers as `core/Relationship` | **Refused.** Uuid endpoints, plus five required fields a derived pair has no value for (`relationship_id`, `target_id`, `relationship_type`, `direction`, `is_bidirectional`), plus its own lifecycle and owner. Decisively: a co-talker pair carries **two independent counts that disagree** — Alex Volkov shares 0 entity clusters and 2 semantic ones with Simon Willison — and `Relationship.strength` is a single string. |
| Hive's article as `content/Article` | **Refused.** `article_id` is `uuid` against an integer key, and `slug`, `author_id`, `content_type` and `body_markdown` are all **required** on an editorial CMS record. Hive's article is identified by `url` with no slug, attributed to a cohort person rather than an `author_id` (`author` was null on the sampled row), and its content may be **absent entirely when the source is paywalled** — requiring `body_markdown` would refuse a real and common row. Nineteen fields, including the whole processing overlay Hive exists to produce, have nowhere to go. |

### The article question, and what was done about it

Neither object is widened to swallow the other. **No distinct article object is authored either**, and
that is a scope decision rather than a modelling one: the sprint's never-cut rule is that every object
lands with the screen that needed it, and no screen this sprint builds needs a standalone article
record. Hive's articles reach these screens as the lists `Person.articles` and `Cluster.members` carry,
which is where Derek reads them. An article object is the first candidate for the next slice if a
screen needs one. `intelligence.spec.ts` asserts that no such object exists, so the decision cannot
drift into one by accident.

## What landed

`objects/intelligence/` — **Person** and **Cluster** (alpha), with
[their README](../../../../objects/intelligence/README.md) stating every divergence and its reason.

Both objects state **the window every derived count is true of** (`window_days`). Hive's counts,
article lists, cluster memberships and co-talkers are all derived for a lookback, and a count without
its window is a claim the record does not make.

**Cluster declares `lens` as required**, because the entity and semantic lenses answer different
questions and disagree by design — entity is the persisted clusterer the co-talker counts are built
from, semantic is an on-the-fly pgvector cosine at threshold 0.80. A cluster is only meaningful beside
the lens that produced it. `max_similarity` and `mean_similarity` exist only on the semantic lens and
carry no default: absent means the lens did not produce them, never a similarity of zero.

Neither object needed a new trait, and neither needed a producer fix: all twelve cells composed,
validated and generated in both frameworks on the first run. That is the m02 producer work paying off —
the Stack pattern-group contract m02 widened is what a second object born from a live record would
otherwise have hit again.

## The screens, in this mission

[`screens.json`](screens.json) and [`screens/`](screens) — the mission's screen list, each composed and
opened as the generated app actually running, in React and Vue, 8 screenshots:

| Screen | React | Vue | axe |
| --- | --- | --- | --- |
| Person / detail | 0 errors | 0 errors | none |
| Person / card | 0 errors | 0 errors | `button-name` ×1 |
| Cluster / detail | 0 errors | 0 errors | none |
| Cluster / list | 0 errors | 0 errors | none |

Both objects compose, validate and generate in **all six single-screen contexts** in both frameworks:
`intelligence.spec.ts` holds 24 of 24 generations.

## For m04, by name

`Person/card` reproduces the **`button-name`** defect m01 found on `Article/card`, `Media/card`,
`Invoice/card` and `Usage/card`. A brand-new object hitting it confirms what m01 could only suspect:
this is the **card footer template**, not those four objects. m04 fixes it once at the producer.

Two more, seen on the Person detail screenshot and not touched here:

- **The record title is doubled.** `Sunny Rivera` renders as the `h1` and again immediately below it as
  the `content/Labelled` display projection. That is the "duplicate or doubled fields" class named in
  `#2046`/`#2060`, and m04 checks for it by name.
- **`allowed_transitions` reaches the detail.** It is listed in the composer's own
  `INTERNAL_FIELD_NAMES`, yet renders as "Allowed transitions: None recorded" — so it is arriving
  through the `Stateful` view extension rather than field placement, which the internal-field filter
  does not cover.

## Census

The registry moves **21 → 23 objects** across six domains (core 6, research 7, delivery 3,
intelligence 2, content 2, saas 3), carried through `docs:claims` into `README.md` and
`docs/how-forge-works.html`. The trait library is unchanged at 47 — m03 authored no trait.

Person and Cluster support all six single-screen contexts, so the runtime roster gains **24 further
cells**: with m02's 42, the sweep at m06 moves it **240 → 306**. No sweep is run here, for the same
reason as m02: m04 changes producers, and sweeping now would move every added pin twice.

## Tests

`test/objects/intelligence.spec.ts` — 9 tests: discovery without displacing the universal, research or
delivery objects; all six contexts in both frameworks per object; the `Stateful` reuse that held; the
`User` and `Relationship` refusals with their measured blockers; the article question, including that
no competing article object exists; the two cluster lenses kept distinct; and `window_days` present on
both objects.

`docs:check` green after regenerating `docs:claims` and `docs:tools`.
