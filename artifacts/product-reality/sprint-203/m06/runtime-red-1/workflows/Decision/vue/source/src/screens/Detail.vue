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
              <DetailHeader id="detail-screen-detail-13-record-title" data-oods-component="DetailHeader" :title="decisionId" :level="2" />
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
                      <div data-sidebar-main>
                        <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Status \x26 History','panel':''}]">
                                    <template #panel="{ item }">
                                      <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                          <Stack id="detail-slot-tab-0-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                              <Stack id="detail-pg-status-timeline-31-read-field" data-oods-component="Stack">
                                                    <Text id="detail-pg-status-timeline-31-label" data-oods-component="Text" as="strong" content="Supersession status" />
                                                    <Text id="detail-pg-status-timeline-31-value" data-oods-component="Text">{{ formatReadOnlyValue(supersessionStatus, "string", true) }}</Text>
                                                  </Stack>
                                              <Stack id="detail-pg-status-timeline-32-read-field" data-oods-component="Stack">
                                                    <Text id="detail-pg-status-timeline-32-label" data-oods-component="Text" as="strong" content="Updated at" />
                                                    <Text id="detail-pg-status-timeline-32-value" data-oods-component="Text">{{ formatReadOnlyValue(updatedAt, "datetime", false) }}</Text>
                                                  </Stack>
                                            </Stack>
                                          <Stack id="detail-slot-tab-1-6-read-field" data-oods-component="Stack">
                                              <Text id="detail-slot-tab-1-6-label" data-oods-component="Text" as="strong" content="Superseded by" />
                                              <Text id="detail-slot-tab-1-6-value" data-oods-component="Text">{{ formatReadOnlyValue(supersededBy, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-slot-tab-2-8-read-field" data-oods-component="Stack">
                                              <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Supersedes" />
                                              <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{{ formatReadOnlyValue(supersedes, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-slot-tab-3-15-read-field" data-oods-component="Stack">
                                              <Text id="detail-slot-tab-3-15-label" data-oods-component="Text" as="strong" content="Supersession reason" />
                                              <Text id="detail-slot-tab-3-15-value" data-oods-component="Text">{{ formatReadOnlyValue(supersessionReason, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-created_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-created_at-label" data-oods-component="Text" as="strong" content="Created at" />
                                              <Text id="detail-detail-tabs-9-created_at-value" data-oods-component="Text">{{ formatReadOnlyValue(createdAt, "datetime", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                              <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEvent, "string", true) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                              <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEventAt, "datetime", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-decision_text-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-decision_text-label" data-oods-component="Text" as="strong" content="Decision text" />
                                              <Text id="detail-detail-tabs-9-decision_text-value" data-oods-component="Text">{{ formatReadOnlyValue(decisionText, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-sprint_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-sprint_id-label" data-oods-component="Text" as="strong" content="Sprint id" />
                                              <Text id="detail-detail-tabs-9-sprint_id-value" data-oods-component="Text">{{ formatReadOnlyValue(sprintId, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-mission_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-mission_id-label" data-oods-component="Text" as="strong" content="Mission id" />
                                              <Text id="detail-detail-tabs-9-mission_id-value" data-oods-component="Text">{{ formatReadOnlyValue(missionId, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-session_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-session_id-label" data-oods-component="Text" as="strong" content="Session id" />
                                              <Text id="detail-detail-tabs-9-session_id-value" data-oods-component="Text">{{ formatReadOnlyValue(sessionId, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-project_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-project_id-label" data-oods-component="Text" as="strong" content="Project id" />
                                              <Text id="detail-detail-tabs-9-project_id-value" data-oods-component="Text">{{ formatReadOnlyValue(projectId, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-project_domain-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-project_domain-label" data-oods-component="Text" as="strong" content="Project domain" />
                                              <Text id="detail-detail-tabs-9-project_domain-value" data-oods-component="Text">{{ formatReadOnlyValue(projectDomain, "string", false) }}</Text>
                                            </Stack>
                                        </Stack>
                                      </template>
                                    </template>
                                  </Tabs>
                      </div>
                      <aside data-sidebar-aside>
                        <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                                    <Stack id="detail-slot-metadata-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                                  <ClassificationPanel id="detail-ve-metadata-28" data-oods-component="ClassificationPanel">
                                                                  <Stack id="detail-ve-metadata-28-primary_category_id-read-field" data-oods-component="Stack">
                                                                                    <Text id="detail-ve-metadata-28-primary_category_id-label" data-oods-component="Text" as="strong" content="Primary category id" />
                                                                                    <Text id="detail-ve-metadata-28-primary_category_id-value" data-oods-component="Text">{{ formatReadOnlyValue(primaryCategoryId, "string", false) }}</Text>
                                                                                  </Stack>
                                                                  <Stack id="detail-ve-metadata-28-tags-read-field" data-oods-component="Stack">
                                                                                    <Text id="detail-ve-metadata-28-tags-label" data-oods-component="Text" as="strong" content="Tags" />
                                                                                    <Text id="detail-ve-metadata-28-tags-value" data-oods-component="Text">{{ formatReadOnlyValue(tags, "Tag[]", false) }}</Text>
                                                                                  </Stack>
                                                                </ClassificationPanel>
                                                </Stack>
                                  </Stack>
                      </aside>
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
import { Banner, Card, ClassificationPanel, DetailHeader, Stack, Tabs, Text } from '@oods/components-vue';
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
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** The record's own identifier. CMOS assigns an integer; the object declares a string so the same shape carries another store's identifiers without coercion. */
  decisionId: string;
  /** The decision as it was written. The longest free text this registry carries: 61 to 8,418 characters in the live store, with 197 of 1,933 rows over 2,000, so every context that shows it must stay readable at 390 without hiding meaning. */
  decisionText: string;
  /** What the decision cites, as {type, id} references. Sparse (null on 1,923 rows) but real, and the rows a preview shows beside a design. */
  evidence?: Record<string, unknown>[];
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'captured';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** The mission that captured it, as CMOS stores it. Recorded loosely — often a bare "m02" rather than a fully qualified "s203-m02" — so it is shown as a label and never as a resolved link. */
  missionId?: string;
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Optional area within the project. Sparse — null on 1,850 of 1,933 rows. */
  projectDomain?: string;
  /** The project the decision belongs to. A slug such as "forge", never a uuid. */
  projectId: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** The session that recorded the decision. Null on 838 of 1,933 rows. */
  sessionId?: string;
  /** The sprint the decision was taken in. Every non-null value in the live store resolves against a sprint, none dangling. */
  sprintId?: string;
  /** When the replacement happened, when the store records it. CMOS does not, so a Decision leaves
it absent rather than borrowing the replacement's creation time.
 */
  supersededAt?: string | null;
  /** Identifier of the record that replaced this one. Present when the store records the forward
pointer. Absent means not replaced, or not known — the two are distinguished by
supersession_status, never by the pointer alone.
 */
  supersededBy?: string;
  /** Identifier of the record this one replaced. Present when the store records the backward
pointer. Never inferred from ordering.
 */
  supersedes?: string;
  /** Why the record was replaced, when the store carries a reason. */
  supersessionReason?: string;
  /** Whether this record still stands. Named apart from Stateful's `status` so an object can carry
both a lifecycle and a supersession lineage.
 */
  supersessionStatus: string;
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

const { actions, uiState, activeFilters, categories, classificationMetadata, createdAt, decisionId, decisionText, evidence, filterCount, filters, lastEvent, lastEventAt, missionId, page, pageSize, primaryCategoryId, primaryCategoryPath, projectDomain, projectId, searchActive, searchQuery, sessionId, sprintId, supersededAt, supersededBy, supersedes, supersessionReason, supersessionStatus, tagCount, tagPreview, tags, totalItems, totalPages, updatedAt } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
