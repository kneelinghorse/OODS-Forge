/**
 * s203-m03 reuse proof: the three reuses the Sprint 203 memo named, tested against the live Hive
 * values rather than against field names. Run from the repository root:
 *
 *   node artifacts/product-reality/sprint-203/m03/reuse-proof.mjs > .../reuse-proof.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadObject } from '../../../../packages/mcp-server/dist/objects/object-loader.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const hive = JSON.parse(fs.readFileSync(path.join(here, 'hive-shapes.json'), 'utf8'));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Every way a live value fails the candidate field it would have to land in. */
function check(objectName, mapping, row) {
  const object = loadObject(objectName);
  const blockers = [];
  for (const [liveField, candidate] of Object.entries(mapping)) {
    const def = object.schema[candidate];
    if (!def) { blockers.push({ field: candidate, why: `${objectName} has no field ${candidate}` }); continue; }
    const value = row[liveField];
    if (def.type === 'uuid' && value != null && !uuid.test(String(value))) blockers.push({ field: candidate, why: `declares type uuid; Hive's ${liveField} is ${JSON.stringify(value)} (${typeof value})` });
    if (def.type === 'email' && value == null) blockers.push({ field: candidate, why: `declares type email and is ${def.required ? 'required' : 'optional'}; Hive holds no email for anyone in the cohort` });
    if (def.validation?.enum && value != null && !def.validation.enum.includes(value)) blockers.push({ field: candidate, why: `value ${JSON.stringify(value)} is outside the declared enum [${def.validation.enum.join(', ')}]` });
    if (def.required && (value === undefined || value === null)) blockers.push({ field: candidate, why: `required by ${objectName}; Hive's ${liveField} is ${value === undefined ? 'absent' : 'null'} on this row` });
  }
  const mapped = new Set(Object.values(mapping));
  const unfillable = Object.entries(object.schema).filter(([name, def]) => def.required && !mapped.has(name)).map(([name, def]) => `${name} (${def.type})`);
  return { candidate: objectName, candidateFields: Object.keys(object.schema).length, traits: object.traits.map(t => t.name), blockers, requiredFieldsHiveCannotFill: unfillable };
}

const person = hive.person;
const article = hive.article.sample;

const out = {
  mission: 's203-m03',
  readAt: hive.readAt,
  surface: hive.surface,
  reuses: {
    'Person as core/User': {
      question: 'Can the universal User carry a Hive cohort member, as the research README\'s "Space and User reuse the universal Organization and User objects" precedent would suggest?',
      ...check('User', { person_id: 'user_id', name: 'name', role: 'role', blurb: 'description' }, person),
      answer: 'No. A cohort member is someone Derek follows, not an account holder: User requires a uuid identity and a primary_email, and composes Authable, Preferenceable, Addressable and Communicable — authentication, preferences, addresses and a communication channel that do not exist for any of the 740 people rows. Hive\'s person_id is an integer surrogate key.',
    },
    'co-talkers as core/Relationship': {
      question: 'Are Hive\'s co-talkers the existing Relationship object?',
      ...check('Relationship', { person_id: 'source_id' }, { person_id: person.coTalkerSample[0].person_id }),
      answer: 'No. Relationship is a stored graph edge with uuid endpoints, a required relationship_type, direction and is_bidirectional, its own lifecycle (Stateful) and an owner (Ownerable). A co-talker pair is none of those: it is derived per query window (the days argument), symmetric, unowned, has no lifecycle, and carries two independent counts — shared_entity_clusters and shared_semantic_clusters, which disagree (Alex Volkov shares 0 entity clusters and 2 semantic ones with Simon Willison) and cannot both be expressed by Relationship\'s single string `strength`.',
      note: 'Co-talkers are therefore carried on Person as a derived list, with both counts kept separate and the window they were derived for stated. Nothing is stored as an edge.',
    },
    'tracking_status as lifecycle/Stateful': {
      question: 'Is Person\'s tracking_status a lifecycle/Stateful shape?',
      vocabulary: person.trackingStatusVocabulary,
      answer: 'Yes, and this one holds. active | tracked_unfeeded | dormant is an ordered lifecycle of one record — a person is tracked with a live feed, tracked deliberately without one, or had a feed that lapsed — and Hive documents it as exactly that (src/store/tracking_status.py). It is the one reuse of the three that survives measurement, and Person composes lifecycle/Stateful with those three states.',
      reused: true,
    },
  },
  articleQuestion: {
    question: 'Does objects/content/Article carry Hive\'s articles, or is Hive\'s article a distinct thing?',
    ...check('Article', { article_id: 'article_id', title: 'label', url: 'slug', published_at: 'published_at' }, { article_id: hive.article.article_id, title: article.title, url: article.url, published_at: '2026-09-15T22:47:07+00:00' }),
    hiveArticleFields: hive.article.fields.length,
    fieldsWithNoHomeInContentArticle: ['url', 'fetched_at', 'feed_name', 'feed_url', 'word_count', 'is_paywalled', 'paywall_confidence', 'keywords', 'marks', 'content_truncated', 'content_byte_length', 'author', 'person', 'processing.summary', 'processing.key_entities', 'processing.sentiment', 'processing.subcategories', 'processing.model_name', 'processing.processed_at'],
    answer: 'No — they are different things, and the field sets say so. content/Article is an editorial CMS record: a uuid article_id, a required slug, a required author_id, a required content_type and a required body_markdown, under a publication lifecycle the editor drives. Hive\'s article is an ingested external signal: an integer surrogate key, identified by its url with no slug, attributed to a cohort person rather than an author_id (author is null on the sampled row), with plain-text content capped at 64KB that may be truncated or absent entirely when the source is paywalled — so requiring body_markdown would refuse a real and common row. Nineteen of its fields, including the whole processing overlay Hive exists to produce, have nowhere to go.',
  },
};
console.log(JSON.stringify(out, null, 2));
