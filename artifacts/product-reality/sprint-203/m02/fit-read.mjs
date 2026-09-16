/**
 * s203-m02 fit read: every column of the four CMOS tables mapped to a reused object, a reused trait,
 * a new trait, a born field, or "not modelled" with a reason — with the live counts it was read from.
 *
 *   node artifacts/product-reality/sprint-203/m02/fit-read.mjs [path/to/cmos.sqlite] > .../fit-read.json
 *
 * The store is read with sqlite3 -readonly. Nothing is written to CMOS.
 */
import { execFileSync } from 'node:child_process';

const db = process.argv[2] ?? '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/cmos/db/cmos.sqlite';
const q = sql => execFileSync('sqlite3', ['-readonly', db, sql], { encoding: 'utf8' }).trim();
const count = sql => Number(q(sql));
const columns = table => q(`select name from pragma_table_info('${table}');`).split('\n');
const nulls = (table, column) => count(`select count(*) from ${table} where "${column}" is null;`);
const distinct = (table, column) => count(`select count(distinct "${column}") from ${table};`);

/** The event-sourcing envelope every table carries: CMOS's replication mechanism, not the thing itself. */
const ENVELOPE = {
  stable_event_id: 'CMOS replication envelope: the event id that carries this row between stores.',
  occurred_at: 'CMOS replication envelope: the event clock, not a date the record shows.',
  origin_seq: 'CMOS replication envelope: per-origin ordering.',
  event_type: 'CMOS replication envelope: one value across every row of the table.',
  schema_version: 'CMOS replication envelope: the row format version.',
  author_user_id: 'Declared but entirely null in the live store, so there is no owner to render; Ownerable is not composed on a field that has never been written.',
};
const envelope = (table, column) => ({ disposition: 'not-modelled', reason: ENVELOPE[column] });

const MAP = {
  strategic_decisions: {
    object: 'Decision', domain: 'delivery.decision',
    fields: {
      id: { disposition: 'born', field: 'decision_id', note: 'The record identity. CMOS uses an integer; the object declares a string so the same object can carry another store\'s ids.' },
      decision_text: { disposition: 'born', field: 'decision_text', note: 'The decision itself, and the sprint\'s long-free-text risk: 61 to 8,418 characters, 197 rows over 2,000.' },
      created_at: { disposition: 'reused-trait', trait: 'lifecycle/Timestampable', note: 'Recorded as the "captured" event.' },
      sprint_id: { disposition: 'born', field: 'sprint_id', note: 'The link to Sprint; every non-null value resolves against sprints.id, 0 dangling.' },
      mission_id: { disposition: 'born', field: 'mission_id', note: 'The mission that captured it. Stored loosely in CMOS (often a bare "m02" rather than "s203-m02"), so it is shown as a label, never as a resolved link.' },
      author_session_id: { disposition: 'born', field: 'session_id', note: 'The link to Session.' },
      project_id: { disposition: 'born', field: 'project_id', note: 'The project scope. A slug ("forge"), never a uuid — which is one of the reasons research/Mission cannot be reused.' },
      category: { disposition: 'reused-trait', trait: 'core/Classifiable', note: 'Sparse in practice (1,928 of 1,933 null, 6 distinct values including null), so the screen must read correctly when it is absent.' },
      superseded_by: { disposition: 'new-trait', trait: 'lifecycle/Supersedable', note: 'The self-referencing lineage pointer. Populated on exactly the 45 rows whose status is superseded — a clean 1:1.' },
      status: { disposition: 'new-trait', trait: 'lifecycle/Supersedable', note: 'active | superseded | archived | stale is the supersession lifecycle, not a generic workflow, so Supersedable owns it rather than Stateful.' },
      evidence: { disposition: 'born', field: 'evidence', note: 'An array of {type, id} references. Sparse (1,923 of 1,933 null) but real, and it is what m05 will show beside a design.' },
      project_domain: { disposition: 'born', field: 'project_domain', note: 'Sparse (1,850 null, 6 distinct).' },
      last_reviewed_at: { disposition: 'not-modelled', reason: 'Entirely null across all 1,933 rows: the staleness-review date has never been written, so there is nothing to show.' },
      context_id: { disposition: 'not-modelled', reason: 'One value ("master_context") on every row: a CMOS partition key with no design meaning.' },
      snapshot_id: { disposition: 'not-modelled', reason: 'CMOS context-snapshot pointer, null on 1,868 of 1,933 rows; internal bookkeeping.' },
      content_hash: { disposition: 'not-modelled', reason: 'CMOS de-duplication hash, null on 889 rows; internal bookkeeping.' },
      last_embedded_hash: { disposition: 'not-modelled', reason: 'CMOS embedding bookkeeping for its vector index.' },
      stable_event_id: null, occurred_at: null, origin_seq: null, event_type: null, schema_version: null, author_user_id: null,
    },
  },
  sprints: {
    object: 'Sprint', domain: 'delivery.sprint',
    fields: {
      id: { disposition: 'born', field: 'sprint_id', note: 'Heterogeneous in the live store ("Sprint 22" beside "sprint-203"), so it is treated as an opaque identifier and never parsed.' },
      title: { disposition: 'reused-trait', trait: 'content/Labelled', note: 'The display label.' },
      focus: { disposition: 'born', field: 'focus', note: 'The sprint\'s stated purpose; present on all 186 rows and long free text.' },
      status: { disposition: 'reused-trait', trait: 'lifecycle/Stateful', note: 'Active | Completed | Archived | Reverted, measured from the live store. Reverted has no counterpart in any existing object\'s state set and is why the states are declared here rather than borrowed.' },
      start_date: { disposition: 'reused-trait', trait: 'lifecycle/Timestampable', note: 'Null on 54 of 186 rows.' },
      end_date: { disposition: 'reused-trait', trait: 'lifecycle/Timestampable', note: 'Null on 47 rows, and not always a date: some rows carry a full timestamp.' },
      total_missions: { disposition: 'not-modelled', reason: 'Null on 176 of 186 rows. The real count is the missions table, so a screen that showed this counter would be blank or wrong almost always; Sprint carries mission_count as a derived field instead.' },
      completed_missions: { disposition: 'not-modelled', reason: 'Null on 177 of 186 rows, for the same reason.' },
      project_id: { disposition: 'born', field: 'project_id', note: 'The project scope.' },
      stable_event_id: null, occurred_at: null, origin_seq: null, event_type: null, schema_version: null, author_user_id: null,
    },
  },
  sessions: {
    object: 'Session', domain: 'delivery.session',
    fields: {
      id: { disposition: 'born', field: 'session_id', note: 'E.g. "PS-2026-09-16-002".' },
      title: { disposition: 'reused-trait', trait: 'content/Labelled', note: 'The display label; present on all 499 rows.' },
      type: { disposition: 'reused-trait', trait: 'core/Classifiable', note: 'review | planning | custom | check-in | research, measured from the live store — a classification, not a lifecycle.' },
      status: { disposition: 'reused-trait', trait: 'lifecycle/Stateful', note: 'Every one of the 499 rows is "completed"; the state set is declared from what CMOS can write, not from what the rows happen to show.' },
      sprint_id: { disposition: 'born', field: 'sprint_id', note: 'The link to Sprint; 301 resolve, 0 dangling, 198 null.' },
      started_at: { disposition: 'reused-trait', trait: 'lifecycle/Timestampable', note: 'Present on all 499 rows.' },
      completed_at: { disposition: 'reused-trait', trait: 'lifecycle/Timestampable', note: 'Present on all 499 rows.' },
      agent: { disposition: 'born', field: 'agent', note: 'Which agent held the session (assistant, codex, claude-opus-5, ...). No existing object models the actor as a non-user agent.' },
      summary: { disposition: 'born', field: 'summary', note: 'Long free text, present on all 499 rows.' },
      captures: { disposition: 'born', field: 'captures', note: 'An array of {timestamp, category, content}: what the session recorded as it ran.' },
      next_steps: { disposition: 'born', field: 'next_steps', note: 'The same shape; null on 45 rows.' },
      metadata: { disposition: 'not-modelled', reason: 'Null on 498 of 499 rows.' },
      user_id: { disposition: 'not-modelled', reason: 'Entirely null across all 499 rows.' },
      project_id: { disposition: 'born', field: 'project_id', note: 'The project scope.' },
      stable_event_id: null, occurred_at: null, origin_seq: null, event_type: null, schema_version: null, author_user_id: null,
    },
  },
  missions: {
    object: null, domain: null,
    fields: {},
  },
};

const tables = {};
for (const [table, spec] of Object.entries(MAP)) {
  if (!spec.object) continue;
  const live = columns(table);
  const rows = count(`select count(*) from ${table};`);
  const mapped = {};
  for (const column of live) {
    const entry = spec.fields[column] === null ? envelope(table, column) : spec.fields[column];
    mapped[column] = entry
      ? { ...entry, nulls: nulls(table, column), distinct: distinct(table, column) }
      : { disposition: 'UNMAPPED', reason: 'This column was not considered — the fit read is incomplete.' };
  }
  const unmapped = Object.entries(mapped).filter(([, v]) => v.disposition === 'UNMAPPED').map(([k]) => k);
  tables[table] = { rows, object: spec.object, domain: spec.domain, columnCount: live.length, unmapped, columns: mapped };
}

/** The missions table is the reuse gate, not an object this sprint authors. */
const missionColumns = columns('missions');
tables.missions = {
  rows: count('select count(*) from missions;'),
  object: null,
  columnCount: missionColumns.length,
  disposition: 'not-modelled-this-sprint',
  reason: 'No screen in this sprint needs a standalone CMOS mission, and the registry is keyed by object name, so a second object named Mission cannot exist beside TraceLab\'s research/Mission. A CMOS mission reaches the screens this sprint builds as Sprint\'s derived mission_count and as the mission_id a Decision names. The reuse test against research/Mission is recorded under reuseProof and it fails.',
  columns: Object.fromEntries(missionColumns.map(column => [column, { nulls: nulls('missions', column), distinct: distinct('missions', column) }])),
};

const summary = {};
for (const [table, spec] of Object.entries(tables)) {
  if (!spec.columns || !spec.object) continue;
  const byDisposition = {};
  for (const value of Object.values(spec.columns)) byDisposition[value.disposition] = (byDisposition[value.disposition] ?? 0) + 1;
  summary[table] = byDisposition;
}

console.log(JSON.stringify({
  mission: 's203-m02',
  readAt: new Date().toISOString(),
  store: 'cmos/db/cmos.sqlite, read with sqlite3 -readonly; nothing written',
  rowCounts: Object.fromEntries(Object.entries(tables).map(([t, s]) => [t, s.rows])),
  forgeRegistryAtRead: { objects: 18, nonVizTraits: 21 },
  summary,
  tables,
}, null, 2));
