<template>
  <Stack id="detail-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style="align-items: space-between; display: flex; flex-direction: column; gap: var(--ref-space-stack-default); padding: var(--ref-space-inset-default)">
                      <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                <DetailHeader id="detail-ve-header-22" data-oods-component="DetailHeader" :title="title" :subtitle="description" :level="2" />
                                <StatusTimeline id="detail-ve-header-23" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Details','panel':''}]">
                                <template #panel="{ item }">
                                  <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                    <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                      <Stack id="detail-slot-tab-0-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                          <Stack id="detail-pg-status-timeline-28-read-field" data-oods-component="Stack">
                                                <Text id="detail-pg-status-timeline-28-label" data-oods-component="Text" as="strong" content="Allowed transitions" />
                                                <Text id="detail-pg-status-timeline-28-value" data-oods-component="Text">{{ formatReadOnlyValue(allowedTransitions, "string[]", false) }}</Text>
                                              </Stack>
                                        </Stack>
                                      <Stack id="detail-slot-tab-1-6" data-oods-component="Stack" data-layout="stack" :fields="['start_date','end_date']" patternComponent="DateRange" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                          <Stack id="detail-pg-date-range-29-read-field" data-oods-component="Stack">
                                                <Text id="detail-pg-date-range-29-label" data-oods-component="Text" as="strong" content="Start date" />
                                                <Text id="detail-pg-date-range-29-value" data-oods-component="Text">{{ formatReadOnlyValue(startDate, "string", false) }}</Text>
                                              </Stack>
                                          <Stack id="detail-pg-date-range-30-read-field" data-oods-component="Stack">
                                                <Text id="detail-pg-date-range-30-label" data-oods-component="Text" as="strong" content="End date" />
                                                <Text id="detail-pg-date-range-30-value" data-oods-component="Text">{{ formatReadOnlyValue(endDate, "string", false) }}</Text>
                                              </Stack>
                                        </Stack>
                                      <Stack id="detail-slot-tab-3-15-read-field" data-oods-component="Stack">
                                          <Text id="detail-slot-tab-3-15-label" data-oods-component="Text" as="strong" content="Created at" />
                                          <Text id="detail-slot-tab-3-15-value" data-oods-component="Text">{{ formatReadOnlyValue(createdAt, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-updated_at-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-updated_at-label" data-oods-component="Text" as="strong" content="Updated at" />
                                          <Text id="detail-detail-tabs-9-updated_at-value" data-oods-component="Text">{{ formatReadOnlyValue(updatedAt, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                          <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEvent, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                          <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEventAt, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-sprint_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-sprint_id-label" data-oods-component="Text" as="strong" content="Sprint id" />
                                          <Text id="detail-detail-tabs-9-sprint_id-value" data-oods-component="Text">{{ formatReadOnlyValue(sprintId, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-focus-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-focus-label" data-oods-component="Text" as="strong" content="Focus" />
                                          <Text id="detail-detail-tabs-9-focus-value" data-oods-component="Text">{{ formatReadOnlyValue(focus, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-mission_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-mission_count-label" data-oods-component="Text" as="strong" content="Mission count" />
                                          <Text id="detail-detail-tabs-9-mission_count-value" data-oods-component="Text">{{ formatReadOnlyValue(missionCount, "number", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-completed_mission_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-completed_mission_count-label" data-oods-component="Text" as="strong" content="Completed mission count" />
                                          <Text id="detail-detail-tabs-9-completed_mission_count-value" data-oods-component="Text">{{ formatReadOnlyValue(completedMissionCount, "number", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-project_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-project_id-label" data-oods-component="Text" as="strong" content="Project id" />
                                          <Text id="detail-detail-tabs-9-project_id-value" data-oods-component="Text">{{ formatReadOnlyValue(projectId, "string", false) }}</Text>
                                        </Stack>
                                    </Stack>
                                  </template>
                                </template>
                              </Tabs>
                    </Card>
            </Stack>
      </template>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
    <button type="button" data-oods-action="handleViewTimeline" @click="handleViewTimeline()">View timeline</button>
  </div>
</template>

<script setup lang="ts">
import { formatReadOnlyValue } from '@oods/component-contracts';
import { Banner, Card, DetailHeader, Stack, StatusTimeline, Tabs, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

interface Props {
  actions: GeneratedUIActions;
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

const { actions, uiState, activeFilters, allowedTransitions, completedMissionCount, createdAt, description, endDate, filterCount, filters, focus, label, lastEvent, lastEventAt, missionCount, page, pageSize, placeholder, projectId, searchActive, searchQuery, sprintId, startDate, stateHistory, status, title, totalItems, totalPages, updatedAt } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
