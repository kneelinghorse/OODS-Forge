import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { handle as object } from '../../src/tools/object.js';
import { loadObject } from '../../src/objects/object-loader.js';
import { wire } from '../helpers/wire-boundary.js';

/**
 * Sprint 203 m02: the delivery objects born from Derek's own CMOS store.
 *
 * Every shape here was read from the live store, not from a specification, and the counts the
 * assertions quote are the ones the m02 fit read recorded. The point of the spec is that the
 * measured vocabularies stay the declared ones: if CMOS's sprint states or session types change,
 * this fails rather than the screens quietly drifting from the record they were born from.
 */
const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const names = ['Decision', 'Sprint', 'Session'];
const contexts = ['card', 'detail', 'form', 'inline', 'list', 'timeline'] as const;

describe('CMOS delivery objects', () => {
  it('discovers Decision, Sprint and Session without replacing the universal or research objects', async () => {
    const result = await object(wire('object', 'input', { action: 'list', domain: 'delivery' }));
    wire('object', 'output', result);
    expect((result as { objects: Array<{ name: string }> }).objects.map(entry => entry.name).sort()).toEqual([...names].sort());
    expect((result as { objects: Array<{ maturity: string }> }).objects.every(entry => entry.maturity === 'alpha')).toBe(true);
    // The universal objects and TraceLab's research objects are untouched by this domain.
    expect(loadObject('Organization').object.domain).toBe('core.account');
    expect(loadObject('Mission').object.domain).toBe('research.job');
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

  it('declares the state vocabularies CMOS actually writes, not a tidier set', () => {
    // sprints.status in the live store: Completed 179, Archived 5, Reverted 1, Active 1 (186 rows).
    // The trait engine's contract is a lowercase identifier vocabulary, so the object declares the
    // canonical identifier and leaves display casing to the component.
    const sprint = loadObject('Sprint');
    const states = sprint.traits.find(trait => trait.name === 'lifecycle/Stateful')?.parameters?.states;
    expect(states).toEqual(['active', 'completed', 'archived', 'reverted']);
    // "reverted" is the one no existing object's state set carries, and the reason these are declared.
    expect(loadObject('Subscription').traits.find(t => t.name === 'lifecycle/Stateful')?.parameters?.states).not.toContain('reverted');

    // sessions.type in the live store, across 499 rows: a classification, never a lifecycle.
    const session = loadObject('Session');
    expect(session.schema.session_type.validation?.enum).toEqual(['review', 'planning', 'custom', 'check-in', 'research']);
    expect(session.traits.some(trait => trait.name === 'core/Classifiable')).toBe(true);
  });

  it('models what the store writes and nothing it does not', () => {
    const sprint = loadObject('Sprint');
    // sprints.total_missions is null on 176 of 186 rows and completed_missions on 177, so Sprint counts
    // from the missions table instead of reading a counter that is almost always blank.
    expect(Object.keys(sprint.schema)).toContain('mission_count');
    expect(Object.keys(sprint.schema)).not.toContain('total_missions');
    expect(Object.keys(sprint.schema)).not.toContain('completed_missions');

    const decision = loadObject('Decision');
    // strategic_decisions.last_reviewed_at and author_user_id are entirely null across all 1,933 rows.
    expect(Object.keys(decision.schema)).not.toContain('last_reviewed_at');
    expect(Object.keys(decision.schema)).not.toContain('author_user_id');
    // context_id holds one value ("master_context") on every row: a partition key, not a design field.
    expect(Object.keys(decision.schema)).not.toContain('context_id');

    const session = loadObject('Session');
    // sessions.user_id and author_user_id are entirely null across all 499 rows.
    expect(Object.keys(session.schema)).not.toContain('user_id');
  });

  it('refuses research/Mission for a CMOS mission, on the four measured blockers', () => {
    const mission = loadObject('Mission');
    const states = mission.schema.status.validation?.enum ?? [];
    // Measured from the live store: CMOS writes these five mission statuses.
    for (const cmosStatus of ['Dropped', 'Deferred']) {
      expect(states, cmosStatus).not.toContain(cmosStatus.toLowerCase());
    }
    // CMOS mission and project identifiers are slugs; the research object declares uuids.
    expect(mission.schema.id.type).toBe('uuid');
    expect(mission.schema.project_id.type).toBe('uuid');
    // TraceLab pipeline internals a CMOS mission has no value for, both required.
    expect(mission.schema.materialization_pending.required).toBe(true);
    expect(mission.schema.search_ready.required).toBe(true);
    // And it is TraceLab's object: widening it to fit CMOS would edit another team's contract.
    expect(mission.metadata?.owners).toContain('TraceLab');
    // The registry is keyed by name, so a second object called Mission cannot exist beside it.
    expect(loadObject('Mission').object.name).toBe('Mission');
  });

  it('Supersedable serves both stores that already hold the shape, from opposite ends', () => {
    const trait = fs.readFileSync(path.join(root, 'traits/lifecycle/Supersedable.trait.yaml'), 'utf8');
    const decision = loadObject('Decision');
    const supersedable = decision.traits.find(t => t.name === 'lifecycle/Supersedable');

    // Consumer one, CMOS: the forward pointer beside a four-state vocabulary, as strategic_decisions writes it.
    expect(supersedable?.parameters?.recordedDirection).toBe('forward');
    expect(supersedable?.parameters?.states).toEqual(['active', 'superseded', 'archived', 'stale']);

    // Consumer two, Forge's own composition acceptances: the backward pointer, with the time it was
    // accepted. The trait must be able to express that shape without a second trait.
    const store = fs.readFileSync(path.join(root, 'packages/mcp-server/src/lib/composition-store.ts'), 'utf8');
    expect(store).toMatch(/supersedes:\s*\{\s*version:\s*number;\s*acceptedAt:\s*string\s*\}\s*\|\s*null/);
    for (const field of ['supersedes', 'superseded_by', 'superseded_at', 'supersession_status']) {
      expect(trait, field).toContain(`  ${field}:`);
    }
    expect(trait).toContain('recordedDirection');
    for (const direction of ['forward', 'backward', 'both']) expect(trait).toContain(`        - ${direction}`);

    // It is its own trait rather than a Stateful state set, and it does not collide with one: an
    // object can carry both, because Stateful owns `status` and Supersedable owns `supersession_status`.
    const stateful = fs.readFileSync(path.join(root, 'traits/lifecycle/Stateful.trait.yaml'), 'utf8');
    expect(stateful).toMatch(/^ {2}status:/m);
    expect(trait).not.toMatch(/^ {2}status:/m);
    expect(trait).toMatch(/^ {2}supersession_status:/m);
  });

  it('carries the longest free text the store holds without refusing the screen', async () => {
    // strategic_decisions.decision_text runs to 8,418 characters in the live store, 197 rows over 2,000.
    const decision = loadObject('Decision');
    expect(decision.schema.decision_text.validation?.maxLength).toBeUndefined();
    const result = await compose({ object: 'Decision', context: 'detail', options: { validate: true } });
    expect(result.status).toBe('ok');
    expect(result.validation?.errors ?? []).toEqual([]);
  }, 60_000);
});
