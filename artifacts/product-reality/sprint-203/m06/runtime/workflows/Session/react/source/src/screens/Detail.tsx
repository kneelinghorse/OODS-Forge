import React from 'react';
import { Banner, Card, ClassificationPanel, DetailHeader, Stack, StatusTimeline, Tabs, Text } from '@oods/components-react';
import '@oods/component-styles/css';
import { formatReadOnlyValue } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
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
type ClassificationPanelProps = React.ComponentPropsWithoutRef<typeof ClassificationPanel>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusTimelineProps = React.ComponentPropsWithoutRef<typeof StatusTimeline>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, agent, allowedTransitions, captures, categories, classificationMetadata, completedAt, createdAt, description, filterCount, filters, label, lastEvent, lastEventAt, nextSteps, page, pageSize, placeholder, primaryCategoryId, primaryCategoryPath, projectId, searchActive, searchQuery, sessionId, sessionType, sprintId, startedAt, stateHistory, status, summary, tagCount, tagPreview, tags, title, totalItems, totalPages, updatedAt }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
  /* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };

  return (
    <>
      <>
        <Stack id="detail-screen" data-oods-component="Stack">
              {uiState === 'loading' && (
                <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
              )}
              {uiState === 'empty' && (
                <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
              )}
              {uiState === 'error' && (
                <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
              )}
              {uiState === 'success' && (
                <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                        <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style={{ alignItems: 'space-between', display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-stack-default)', padding: 'var(--ref-space-inset-default)' }}>
                                  <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                              <DetailHeader id="detail-ve-header-24" data-oods-component="DetailHeader" title={title} subtitle={description} level={2} />
                                              <StatusTimeline id="detail-ve-header-25" data-oods-component="StatusTimeline" showActorId showReason history={stateHistory} allowedTransitions={allowedTransitions} status={status} />
                                            </Stack>
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style={{ alignItems: 'start', display: 'grid', gap: 'var(--ref-space-cluster-default)', gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 24rem)' }}>
                                  <div data-sidebar-main>
                                    <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                      { ...{"id":"detail-detail-tab-panel-3","label":"Details"}, panel: (
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                          <Stack id="detail-slot-tab-0-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                              <Stack id="detail-pg-status-timeline-31-read-field" data-oods-component="Stack">
                                                    <Text id="detail-pg-status-timeline-31-label" data-oods-component="Text" as="strong" content="Allowed transitions" />
                                                    <Text id="detail-pg-status-timeline-31-value" data-oods-component="Text">{formatReadOnlyValue(allowedTransitions, "string[]", false)}</Text>
                                                  </Stack>
                                            </Stack>
                                          <Stack id="detail-slot-tab-2-8-read-field" data-oods-component="Stack">
                                              <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Agent" />
                                              <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{formatReadOnlyValue(agent, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-created_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-created_at-label" data-oods-component="Text" as="strong" content="Created at" />
                                              <Text id="detail-detail-tabs-9-created_at-value" data-oods-component="Text">{formatReadOnlyValue(createdAt, "datetime", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-updated_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-updated_at-label" data-oods-component="Text" as="strong" content="Updated at" />
                                              <Text id="detail-detail-tabs-9-updated_at-value" data-oods-component="Text">{formatReadOnlyValue(updatedAt, "datetime", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                              <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{formatReadOnlyValue(lastEvent, "string", true)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                              <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{formatReadOnlyValue(lastEventAt, "datetime", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-session_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-session_id-label" data-oods-component="Text" as="strong" content="Session id" />
                                              <Text id="detail-detail-tabs-9-session_id-value" data-oods-component="Text">{formatReadOnlyValue(sessionId, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-session_type-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-session_type-label" data-oods-component="Text" as="strong" content="Session type" />
                                              <Text id="detail-detail-tabs-9-session_type-value" data-oods-component="Text">{formatReadOnlyValue(sessionType, "string", true)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-summary-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-summary-label" data-oods-component="Text" as="strong" content="Summary" />
                                              <Text id="detail-detail-tabs-9-summary-value" data-oods-component="Text">{formatReadOnlyValue(summary, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-sprint_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-sprint_id-label" data-oods-component="Text" as="strong" content="Sprint id" />
                                              <Text id="detail-detail-tabs-9-sprint_id-value" data-oods-component="Text">{formatReadOnlyValue(sprintId, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-started_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-started_at-label" data-oods-component="Text" as="strong" content="Started at" />
                                              <Text id="detail-detail-tabs-9-started_at-value" data-oods-component="Text">{formatReadOnlyValue(startedAt, "datetime", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-completed_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-completed_at-label" data-oods-component="Text" as="strong" content="Completed at" />
                                              <Text id="detail-detail-tabs-9-completed_at-value" data-oods-component="Text">{formatReadOnlyValue(completedAt, "datetime", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-project_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-project_id-label" data-oods-component="Text" as="strong" content="Project id" />
                                              <Text id="detail-detail-tabs-9-project_id-value" data-oods-component="Text">{formatReadOnlyValue(projectId, "string", false)}</Text>
                                            </Stack>
                                        </Stack>
                                      ) }
                                    ]} />
                                  </div>
                                  <aside data-sidebar-aside>
                                    <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                                                  <Stack id="detail-slot-metadata-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                                                  <ClassificationPanel id="detail-ve-metadata-26" data-oods-component="ClassificationPanel">
                                                                                    <Stack id="detail-ve-metadata-26-primary_category_id-read-field" data-oods-component="Stack">
                                                                                                        <Text id="detail-ve-metadata-26-primary_category_id-label" data-oods-component="Text" as="strong" content="Primary category id" />
                                                                                                        <Text id="detail-ve-metadata-26-primary_category_id-value" data-oods-component="Text">{formatReadOnlyValue(primaryCategoryId, "string", false)}</Text>
                                                                                                      </Stack>
                                                                                    <Stack id="detail-ve-metadata-26-tags-read-field" data-oods-component="Stack">
                                                                                                        <Text id="detail-ve-metadata-26-tags-label" data-oods-component="Text" as="strong" content="Tags" />
                                                                                                        <Text id="detail-ve-metadata-26-tags-value" data-oods-component="Text">{formatReadOnlyValue(tags, "Tag[]", false)}</Text>
                                                                                                      </Stack>
                                                                                  </ClassificationPanel>
                                                                </Stack>
                                                </Stack>
                                  </aside>
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
          <button type="button" data-oods-action="handleViewTimeline" onClick={() => handleViewTimeline()}>View timeline</button>
        </div>
      </>
    </>
  );
};
