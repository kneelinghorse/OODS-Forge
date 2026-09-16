import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { handle as object } from '../../src/tools/object.js';
import { loadObject } from '../../src/objects/object-loader.js';
import { wire } from '../helpers/wire-boundary.js';

/**
 * Sprint 203 m03: the intelligence objects born from Hive's cohort.
 *
 * Hive is a read-only MCP surface with no screens of any kind, so these are the first screens its
 * cohort has ever had. Every shape was read from the live surface and the counts these assertions
 * quote are the ones the m03 fit read recorded; if Hive's vocabularies move, this fails rather than
 * the screens drifting from the record they were born from.
 */
const names = ['Person', 'Cluster'];
const contexts = ['card', 'detail', 'form', 'inline', 'list', 'timeline'] as const;

describe('Hive intelligence objects', () => {
  it('discovers Person and Cluster without displacing the universal, research or delivery objects', async () => {
    const result = await object(wire('object', 'input', { action: 'list', domain: 'intelligence' }));
    wire('object', 'output', result);
    expect((result as { objects: Array<{ name: string }> }).objects.map(entry => entry.name).sort()).toEqual([...names].sort());
    expect((result as { objects: Array<{ maturity: string }> }).objects.every(entry => entry.maturity === 'alpha')).toBe(true);
    expect(loadObject('User').object.domain).toBe('core.identity');
    expect(loadObject('Relationship').object.domain).toBe('core.graph');
    expect(loadObject('Decision').object.domain).toBe('delivery.decision');
  });

  it.each(names)('%s composes, validates and generates every declared context in both frameworks', async name => {
    for (const context of contexts) {
      const result = await compose(wire('design.compose', 'input', { object: name, context, options: { validate: true } }));
      wire('design.compose', 'output', result);
      expect(result.status, `${name}/${context}`).toBe('ok');
      expect(result.validation?.errors ?? [], `${name}/${context}`).toEqual([]);
      for (const framework of ['react', 'vue'] as const) {
        const generated = await generate({ schema: result.schema, framework, profile: 'build' });
        expect(generated.status, `${name}/${context}/${framework}: ${JSON.stringify(generated.errors)}`).toBe('ok');
      }
    }
  }, 180_000);

  it('reuses lifecycle/Stateful for tracking_status — the one reuse of the three that survived measurement', () => {
    const person = loadObject('Person');
    const stateful = person.traits.find(trait => trait.name === 'lifecycle/Stateful');
    // Hive's own vocabulary, documented in src/store/tracking_status.py.
    expect(stateful?.parameters?.states).toEqual(['active', 'tracked_unfeeded', 'dormant']);
    expect(stateful?.parameters?.initialState).toBe('active');
  });

  it('refuses core/User for a cohort member, on the measured blockers', () => {
    const user = loadObject('User');
    // A cohort member is someone Derek follows, not an account holder.
    expect(user.schema.user_id.type).toBe('uuid');
    expect(user.schema.primary_email.type).toBe('email');
    expect(user.schema.primary_email.required).toBe(true);
    // User.role is an enum of account roles; Hive's role is free text such as "Datasette; daily LLM posts".
    expect(user.schema.role.validation?.enum).toEqual(['end_user', 'admin', 'owner', 'billing']);
    expect(loadObject('Person').schema.role.validation?.enum).toBeUndefined();
    // And User composes the account traits a followed person has none of.
    const userTraits = user.traits.map(trait => trait.name);
    for (const trait of ['core/Authable', 'core/Preferenceable', 'core/Addressable', 'core/Communicable']) {
      expect(userTraits, trait).toContain(trait);
      expect(loadObject('Person').traits.map(t => t.name), trait).not.toContain(trait);
    }
  });

  it('refuses core/Relationship for co-talkers, and keeps both counts separate instead', () => {
    const relationship = loadObject('Relationship');
    // A stored graph edge: uuid endpoints, and five fields a derived co-talker pair has no value for.
    for (const field of ['relationship_id', 'source_id', 'target_id']) expect(relationship.schema[field].type, field).toBe('uuid');
    for (const field of ['relationship_type', 'direction', 'is_bidirectional']) expect(relationship.schema[field].required, field).toBe(true);
    expect(relationship.traits.map(t => t.name)).toContain('lifecycle/Stateful');
    expect(relationship.traits.map(t => t.name)).toContain('structural/Ownerable');
    // Person carries them as a derived list instead, and the window they were derived for travels with it.
    const person = loadObject('Person');
    expect(person.schema.co_talkers.type).toBe('object[]');
    expect(person.schema.window_days).toBeDefined();
    expect(person.schema.co_talkers.description).toMatch(/shared_entity_clusters/);
    expect(person.schema.co_talkers.description).toMatch(/shared_semantic_clusters/);
  });

  it('settles the article question by measurement: Hive\'s article is not the editorial content/Article', () => {
    const article = loadObject('Article');
    // An editorial CMS record: uuid identity, and three required fields an ingested signal has no value for.
    expect(article.schema.article_id.type).toBe('uuid');
    for (const field of ['slug', 'author_id', 'content_type', 'body_markdown']) {
      expect(article.schema[field]?.required, field).toBe(true);
    }
    // Hive's article is identified by url with no slug, attributed to a cohort person rather than an
    // author_id, and its content may be absent entirely when the source is paywalled — so requiring
    // body_markdown would refuse a real and common row. Neither object is widened to swallow the other,
    // and no standalone article object is authored, because no screen this sprint builds needs one.
    expect(() => loadObject('CohortArticle')).toThrow();
    // Hive's articles reach the screens as the lists Person and Cluster carry.
    expect(loadObject('Person').schema.articles.type).toBe('object[]');
    expect(loadObject('Cluster').schema.members.type).toBe('object[]');
  });

  it('keeps the two cluster lenses distinct, because they answer different questions', () => {
    const cluster = loadObject('Cluster');
    expect(cluster.schema.lens.validation?.enum).toEqual(['entity', 'semantic']);
    expect(cluster.schema.lens.required).toBe(true);
    // The similarity scores exist only on the semantic lens; absent means the lens did not produce
    // them, never a similarity of zero, so neither is required and neither carries a default.
    for (const field of ['max_similarity', 'mean_similarity']) {
      expect(cluster.schema[field].required, field).toBe(false);
      expect(cluster.schema[field].default, field).toBeUndefined();
    }
    // A cluster has no lifecycle of its own — the distinction the research objects drew for Evidence.
    expect(cluster.traits.map(trait => trait.name)).not.toContain('lifecycle/Stateful');
  });

  it('states the window every derived count is true of', () => {
    for (const name of names) {
      const object = loadObject(name);
      expect(Object.keys(object.schema), name).toContain('window_days');
    }
  });
});
