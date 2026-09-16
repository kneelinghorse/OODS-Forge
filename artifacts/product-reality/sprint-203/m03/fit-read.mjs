/**
 * s203-m03 fit read: every field Hive's read-only surface returns for a person, a cluster and an
 * article, mapped to a reused object, a reused trait, a new trait, a born field, or "not modelled"
 * with a reason — beside the live counts it was read from.
 *
 *   node artifacts/product-reality/sprint-203/m03/fit-read.mjs > .../fit-read.json
 *
 * The shapes come from hive-shapes.json, captured from the live surface with read tools only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const hive = JSON.parse(fs.readFileSync(path.join(here, 'hive-shapes.json'), 'utf8'));

const MAP = {
  person: {
    object: 'Person', domain: 'intelligence.cohort',
    liveFields: ['person_id', 'name', 'primary_topic', 'tracking_status', 'role', 'org', 'x_handle', 'blurb', 'article_count', 'days', 'include_activity', 'articles', 'top_clusters', 'co_talkers'],
    fields: {
      person_id: { disposition: 'born', field: 'person_id', note: 'An integer surrogate key, declared as a string so it is never treated as arithmetic.' },
      name: { disposition: 'born', field: 'name', note: 'Present on every row; content/Labelled carries its display projection.' },
      primary_topic: { disposition: 'born', field: 'primary_topic', note: 'Declared as the eight values cohort_list enumerates, which is the slice-discovery authority: ai_research 167, design 152, ai_engineering 119, writers 85, meaning_layer 71, founders 68, other 39, product 39.' },
      tracking_status: { disposition: 'reused-trait', trait: 'lifecycle/Stateful', note: 'active | tracked_unfeeded | dormant. The one reuse of the three the memo named that survived measurement: Hive documents it as exactly this lifecycle (src/store/tracking_status.py).' },
      role: { disposition: 'born', field: 'role', note: 'Free text ("Datasette; daily LLM posts"). core/User cannot carry it: User.role is an enum of account roles (end_user, admin, owner, billing).' },
      org: { disposition: 'born', field: 'org', note: 'Free text, frequently null, and never a reference to an organisation record — so core/Organization is not composed on it.' },
      x_handle: { disposition: 'born', field: 'x_handle', note: 'Stored with the leading @.' },
      blurb: { disposition: 'born', field: 'blurb', note: 'Unbounded free text in Derek\'s own words; one of the two readability risks carried into m04.' },
      article_count: { disposition: 'born', field: 'article_count', note: 'Derived for the window, so window_days travels beside it.' },
      days: { disposition: 'born', field: 'window_days', note: 'The lookback every derived field on the record is true of. Born rather than dropped, because a count without its window is a claim the record does not make.' },
      include_activity: { disposition: 'not-modelled', reason: 'A query argument that decides whether GitHub commit rows are included, not a property of the person.' },
      articles: { disposition: 'born', field: 'articles', note: 'What they published in the window: {article_id, title, url, published_at, category}.' },
      top_clusters: { disposition: 'born', field: 'top_clusters', note: 'The conversations they appeared in, with the count of their own articles in each.' },
      co_talkers: { disposition: 'born', field: 'co_talkers', note: 'Refused as core/Relationship on measurement: Relationship needs uuid endpoints and a required relationship_type, direction and is_bidirectional, has its own lifecycle and owner, and carries strength as one string, while a co-talker pair is derived per window, symmetric, unowned and carries two independent counts that disagree.' },
    },
  },
  cluster: {
    object: 'Cluster', domain: 'intelligence.cohort',
    liveFields: ['cluster_id', 'lead_title', 'lead_url', 'member_count', 'member_people_count', 'dominant_category', 'is_trending', 'updated_at', 'people', 'members', 'lens', 'days', 'max_similarity', 'mean_similarity', 'include_activity', 'min_people'],
    fields: {
      cluster_id: { disposition: 'born', field: 'cluster_id', note: 'Entity lens only; the semantic lens computes clusters on the fly and persists none.' },
      lead_title: { disposition: 'born', field: 'lead_title', note: 'The article that leads the conversation; content/Labelled carries its display projection.' },
      lead_url: { disposition: 'born', field: 'lead_url' },
      member_count: { disposition: 'born', field: 'member_count', note: 'Articles in the conversation.' },
      member_people_count: { disposition: 'born', field: 'member_people_count', note: 'Distinct cohort members — the number that makes a cluster worth reading.' },
      dominant_category: { disposition: 'reused-trait', trait: 'core/Classifiable', note: 'Left unconstrained: the server is authoritative and an unknown category is not coerced into the cohort topic vocabulary, which is a different list serving a different purpose.' },
      is_trending: { disposition: 'born', field: 'is_trending' },
      updated_at: { disposition: 'reused-trait', trait: 'lifecycle/Timestampable', note: 'Recorded as the "updated" event. A cluster has no lifecycle of its own, so lifecycle/Stateful is not composed — the same distinction the research objects drew for Evidence\'s dispositions.' },
      people: { disposition: 'born', field: 'people', note: 'Each carries primary_topic, so a cluster spanning several slices reads without a second lookup.' },
      members: { disposition: 'born', field: 'members', note: 'The articles themselves, each attributed to its cohort person.' },
      lens: { disposition: 'born', field: 'lens', note: 'entity or semantic. Not a detail: the two lenses answer different questions and disagree by design, so a cluster is only meaningful beside the lens that produced it.' },
      days: { disposition: 'born', field: 'window_days' },
      max_similarity: { disposition: 'born', field: 'max_similarity', note: 'Semantic lens only; absent on the entity lens means the lens did not produce it, never a similarity of zero.' },
      mean_similarity: { disposition: 'born', field: 'mean_similarity', note: 'Semantic lens only, on the same terms.' },
      include_activity: { disposition: 'not-modelled', reason: 'A query argument, not a property of the cluster.' },
      min_people: { disposition: 'not-modelled', reason: 'A query argument that sets the multi-person threshold, not a property of the cluster.' },
    },
  },
  article: {
    object: null, domain: null,
    liveFields: hive.article.fields,
    fields: {},
  },
};

const tables = {};
for (const [surface, spec] of Object.entries(MAP)) {
  if (!spec.object) continue;
  const mapped = {};
  for (const field of spec.liveFields) {
    mapped[field] = spec.fields[field] ?? { disposition: 'UNMAPPED', reason: 'This field was not considered — the fit read is incomplete.' };
  }
  const unmapped = Object.entries(mapped).filter(([, v]) => v.disposition === 'UNMAPPED').map(([k]) => k);
  tables[surface] = { object: spec.object, domain: spec.domain, liveFieldCount: spec.liveFields.length, unmapped, fields: mapped };
}

tables.article = {
  object: null,
  liveFieldCount: hive.article.fields.length,
  disposition: 'not-modelled-this-sprint',
  reason: 'Hive\'s article is measurably not objects/content/Article (see reuse-proof.json: uuid article_id, and a required author_id, content_type and body_markdown that an ingested signal has no value for), so the two are not forced into one. A distinct object is not authored either, because the sprint\'s never-cut rule is that every object lands with the screen that needed it, and no screen this sprint builds needs a standalone article record: articles reach the Person and Cluster screens as those objects\' own article lists, which is where Derek reads them. It is the first candidate for the next slice if a screen needs one.',
  fields: Object.fromEntries(hive.article.fields.map(field => [field, { disposition: 'not-modelled-this-sprint' }])),
};

const summary = {};
for (const [surface, spec] of Object.entries(tables)) {
  if (!spec.object) continue;
  const byDisposition = {};
  for (const value of Object.values(spec.fields)) byDisposition[value.disposition] = (byDisposition[value.disposition] ?? 0) + 1;
  summary[surface] = byDisposition;
}

console.log(JSON.stringify({
  mission: 's203-m03',
  readAt: hive.readAt,
  surface: hive.surface,
  liveCounts: hive.freshness,
  forgeRegistryAtRead: { objects: 21, nonVizTraits: 22 },
  summary,
  surfaces: tables,
}, null, 2));
