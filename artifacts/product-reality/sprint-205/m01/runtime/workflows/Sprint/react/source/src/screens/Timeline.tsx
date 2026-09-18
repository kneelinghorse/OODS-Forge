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
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** How many of those missions are completed, counted the same way. */
  completedMissionCount?: number;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** When the sprint ended, on the same terms. Null on 47 of 186 rows. */
  endDate?: string;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** What the sprint is for, in the author's own words. Present on all 186 rows and long free text, so it carries the same readability risk as a decision. */
  focus?: string;
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'started' | 'ended';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** How many missions the sprint carries, counted from the missions table. CMOS also declares total_missions and completed_missions columns, but they are null on 176 and 177 of 186 rows, so this object counts rather than reading a counter that is almost always blank. */
  missionCount?: number;
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** The project the sprint belongs to. A slug, never a uuid. */
  projectId: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** The sprint's identifier, treated as opaque and never parsed: the live store holds both "sprint-203" and "Sprint 22" and both are authoritative. */
  sprintId: string;
  /** When the sprint began. Null on 54 of 186 rows, and not uniformly shaped: some rows carry a date and some a full timestamp, so it is declared as text and never reformatted as if it were known to be one or the other. */
  startDate?: string;
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
  status: 'active' | 'completed' | 'archived' | 'reverted';
  /** The sprint's title, present on all 186 rows. */
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

export const GeneratedUI: React.FC<PageProps> = ({ uiState, activeFilters, allowedTransitions, completedMissionCount, createdAt, description, endDate, filterCount, filters, focus, label, lastEvent, lastEventAt, missionCount, page, pageSize, placeholder, projectId, searchActive, searchQuery, sprintId, startDate, stateHistory, status, title, totalItems, totalPages, updatedAt, events = [] }) => {
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
