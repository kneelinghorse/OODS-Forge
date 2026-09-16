# Intelligence objects

Sprint 203 m03 adds two alpha objects born from Hive's cohort: Person and Cluster. Authoring follows
[the object authoring guide](../../docs/authoring-objects.md), with
[the research objects](../research/README.md) and [the delivery objects](../delivery/README.md) as
precedent.

Hive is a **read-only MCP surface with no screens of any kind** — local dev only, not deployed — so
Derek reads a cohort of ~520 named people through an agent and nothing else. These are the first
screens that cohort has had. The authoritative shape is the live surface, read on 2026-09-16 through
its read tools only (`hive_overview`, `cohort_list`, `person_detail`, `clusters_top`, `articles_get`);
its three write tools (`feed_deactivate`, `index_generate`, `article_mark`) were never called. At that
read: **740 people rows, 307 active across 331 feeds, 426 articles in the 14-day window, 26
multi-person clusters**, 93 people having written in 30 days.

Forge reads Hive at authoring time and never at runtime. There is no Hive client in the server and
there is not going to be one.

[`artifacts/product-reality/sprint-203/m03/fit-read.json`](../../artifacts/product-reality/sprint-203/m03/fit-read.json)
maps every field of each surface to a reused object, a reused trait, a born field or "not modelled"
with the reason. [`reuse-proof.json`](../../artifacts/product-reality/sprint-203/m03/reuse-proof.json)
holds the four reuse questions, each answered against live values rather than field names.

## What reuses, and what does not

**Three of the four reuses the memo named are refused on measurement; one holds.**

| Question | Answer |
| --- | --- |
| `tracking_status` as `lifecycle/Stateful` | **Yes.** `active \| tracked_unfeeded \| dormant` is an ordered lifecycle of one record and Hive documents it as exactly that. The one reuse that survived. |
| A cohort member as `core/User` | **No.** `User` requires a uuid identity and a `primary_email`; Hive holds no email for any of the 740 and its `person_id` is an integer surrogate key. `User.role` is an enum of account roles (`end_user, admin, owner, billing`) while Hive's role is free text such as "Datasette; daily LLM posts". `User` also composes Authable, Preferenceable, Addressable and Communicable — authentication, preferences, addresses and a communication channel a followed person has none of. Someone you follow is not an account holder. |
| co-talkers as `core/Relationship` | **No.** `Relationship` is a stored graph edge: uuid endpoints, a required `relationship_type`, `direction` and `is_bidirectional`, its own lifecycle and an owner, and `strength` as a single string. A co-talker pair is derived per query window, symmetric, unowned, has no lifecycle, and carries **two independent counts that disagree** — Alex Volkov shares 0 entity clusters and 2 semantic ones with Simon Willison. Person carries them as a derived list instead, with the window stated. |
| Hive's article as `content/Article` | **No.** See below. |

## The article question, settled by measurement

`content/Article` is an editorial CMS record: a uuid `article_id`, a **required** `slug`, `author_id`,
`content_type` and `body_markdown`, under a publication lifecycle an editor drives. Hive's article is
an ingested external signal: an integer surrogate key, identified by its `url` with no slug,
attributed to a cohort person rather than an `author_id` (`author` was null on the sampled row), with
plain-text `content` capped at 64KB that may be truncated or **absent entirely when the source is
paywalled** — so requiring `body_markdown` would refuse a real and common row. Nineteen of its fields,
including the whole processing overlay Hive exists to produce (`summary`, `key_entities`, `sentiment`,
`subcategories`, `model_name`, `processed_at`), have nowhere to go.

Neither object is widened to swallow the other. **A distinct article object is not authored either**,
and that is a scope decision rather than a modelling one: this sprint's never-cut rule is that every
object lands with the screen that needed it, and no screen built here needs a standalone article
record. Hive's articles reach these screens as the lists `Person.articles` and `Cluster.members`
carry, which is where Derek reads them. An article object is the first candidate for the next slice if
a screen needs one.

## What each object diverges on, and why

- **Person** keeps `role` and `org` as free text and never resolves `org` to an organisation record,
  because Hive does not: `org` was null for Simon Willison on the sampled read. `blurb` is unbounded
  free text in Derek's own words. Every derived field — `article_count`, `articles`, `top_clusters`,
  `co_talkers` — is only true of a lookback, so **`window_days` travels beside them**: a count without
  its window is a claim the record does not make.
- **Cluster** declares `lens` as required, because the entity and semantic lenses answer different
  questions and disagree by design — entity is the persisted clusterer the co-talker counts are built
  from, semantic is an on-the-fly pgvector cosine at threshold 0.80 — so a cluster is only meaningful
  beside the lens that produced it. `max_similarity` and `mean_similarity` exist only on the semantic
  lens and carry no default: absent means the lens did not produce them, never a similarity of zero.
  `dominant_category` is left unconstrained because the server is authoritative and an unknown category
  is not coerced into the cohort's topic vocabulary, which is a different list serving a different
  purpose. A cluster has no lifecycle of its own, so `lifecycle/Stateful` is not composed — the same
  distinction the research objects drew for Evidence's dispositions.

`primary_topic` is declared as the eight values `cohort_list` enumerates, since that tool is the
slice-discovery authority for the cohort.

Generated fixture data is for composition and preview only.

## Public registry and composition checks

```bash
pnpm generate:objects
pnpm --filter @oods/mcp-server exec vitest run test/objects/intelligence.spec.ts
```

The object loader scans this directory recursively; rebuild the MCP server and start its next process
from the updated checkout to refresh its in-memory registry.
