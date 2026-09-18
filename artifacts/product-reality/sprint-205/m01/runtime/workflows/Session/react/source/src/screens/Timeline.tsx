import React from 'react';
import { Banner, Card, Stack, StateTransitionEvent, TimelineEntryLabel } from '@oods/components-react';
import '@oods/component-styles/css';
import { chronologicalEvents, formatDateTime, type CollectionEvent } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface PageProps {
  events?: CollectionEvent[];
  uiState: GeneratedUIState;
  /** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
  activeFilters?: Record<string, unknown>[];
  /** Who held the session — an agent rather than a user: assistant, codex, claude-opus-5 and others in the live store. No existing object models the actor as a non-user agent, which is why this is a field of its own rather than Ownerable. */
  agent: string;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** What the session recorded as it ran, as {timestamp, category, content} entries. */
  captures?: Record<string, unknown>[];
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** When it closed. Present on all 499 rows in the live store, but declared optional because an open session has none. */
  completedAt?: string;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'started' | 'completed';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** What it left for next time, in the same shape. Null on 45 of 499 rows. */
  nextSteps?: Record<string, unknown>[];
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** The project the session belongs to. A slug, never a uuid. */
  projectId: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** The session's identifier, such as "PS-2026-09-16-002". */
  sessionId: string;
  /** What kind of sitting it was. The live store holds review, planning, custom, check-in and research — a classification, not a lifecycle, so it is Classifiable rather than a second state set. */
  sessionType: 'review' | 'planning' | 'custom' | 'check-in' | 'research';
  /** The sprint the session belongs to. 301 of 499 rows resolve against a sprint, none dangling, 198 null. */
  sprintId?: string;
  /** When the session opened. Present on all 499 rows. */
  startedAt: string;
  /** Chronological log of state transitions. Each entry records the before/after states,
timestamp, and (when governance is enabled) the actor, reason, and transition metadata.
Rendered by StatusTimeline in the detail and timeline views.

Entry structure:
  - from: string (previous state)
  - to: string (new state)
  - timestamp: ISO 8601 datetime
  - actor_id: string (user/system who triggered the transition, optional)
  - reason: string (human-readable justification, required when requireTransitionReason is true)
  - transition_metadata: Record<string, unknown> (arbitrary context, optional)
 */
  stateHistory?: unknown[];
  /** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
  status: 'active' | 'completed' | 'abandoned';
  /** What the session amounted to, in its own words. Present on all 499 rows and long free text. */
  summary?: string;
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** What the session was called, present on all 499 rows. */
  title: string;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StateTransitionEventProps = React.ComponentPropsWithoutRef<typeof StateTransitionEvent>;
type TimelineEntryLabelProps = React.ComponentPropsWithoutRef<typeof TimelineEntryLabel>;

export const GeneratedUI: React.FC<PageProps> = ({ uiState, activeFilters, agent, allowedTransitions, captures, categories, classificationMetadata, completedAt, createdAt, description, filterCount, filters, label, lastEvent, lastEventAt, nextSteps, page, pageSize, placeholder, primaryCategoryId, primaryCategoryPath, projectId, searchActive, searchQuery, sessionId, sessionType, sprintId, startedAt, stateHistory, status, summary, tagCount, tagPreview, tags, title, totalItems, totalPages, updatedAt, events = [] }) => {
  return (
    <>
      <Stack id="timeline-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="timeline-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="timeline-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="timeline-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {uiState === 'success' && (
              <Stack id="timeline-screen-timeline-14" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="timeline-timeline-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                <TimelineEntryLabel id="timeline-ve-entry-0-15" data-oods-component="TimelineEntryLabel" compact label={title} />
                              </Stack>
                      <section id="timeline-timeline-entries-13" data-oods-collection="events">{events.length === 0 ? (<Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" data-oods-state="empty" content="No events yet." />) : (<ol aria-label="Lifecycle history" className="oods-collection">{chronologicalEvents(events).map((collectionEvent, collectionIndex) => <li key={collectionEvent.id}><Card id={'timeline-timeline-entries-13-entry-' + collectionIndex}><strong>{collectionEvent.title}</strong><time dateTime={collectionEvent.at}>{formatDateTime(collectionEvent.at)}</time><p>{collectionEvent.description}</p></Card></li>)}</ol>)}</section>
                      <Stack id="timeline-timeline-entries-13-trait-events" data-oods-component="Stack">
                                <StateTransitionEvent id="timeline-ve-entry-0-16" data-oods-component="StateTransitionEvent" showActor showReason history={stateHistory} status={status} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
