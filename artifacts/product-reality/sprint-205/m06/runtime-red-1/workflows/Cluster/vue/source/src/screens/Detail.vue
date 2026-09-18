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
                                <DetailHeader id="detail-ve-header-24" data-oods-component="DetailHeader" :title="label" :subtitle="description" :level="2" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
                      <div data-sidebar-main>
                        <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-5','label':'Details','panel':''}]">
                                    <template #panel="{ item }">
                                      <template v-if="item.id === 'detail-detail-tab-panel-5'">
                                        <Stack id="detail-detail-tab-panel-5" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                          <Stack id="detail-slot-tab-1-6-read-field" data-oods-component="Stack">
                                              <Text id="detail-slot-tab-1-6-label" data-oods-component="Text" as="strong" content="Cluster id" />
                                              <Text id="detail-slot-tab-1-6-value" data-oods-component="Text">{{ formatReadOnlyValue(clusterId, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-created_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-created_at-label" data-oods-component="Text" as="strong" content="Created at" />
                                              <Text id="detail-detail-tabs-9-created_at-value" data-oods-component="Text">{{ formatReadOnlyValue(createdAt, "datetime", false) }}</Text>
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
                                          <Stack id="detail-detail-tabs-9-lead_title-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-lead_title-label" data-oods-component="Text" as="strong" content="Lead title" />
                                              <Text id="detail-detail-tabs-9-lead_title-value" data-oods-component="Text">{{ formatReadOnlyValue(leadTitle, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-lead_url-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-lead_url-label" data-oods-component="Text" as="strong" content="Lead url" />
                                              <Text id="detail-detail-tabs-9-lead_url-value" data-oods-component="Text">{{ formatReadOnlyValue(leadUrl, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-lens-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-lens-label" data-oods-component="Text" as="strong" content="Lens" />
                                              <Text id="detail-detail-tabs-9-lens-value" data-oods-component="Text">{{ formatReadOnlyValue(lens, "string", true) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-member_people_count-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-member_people_count-label" data-oods-component="Text" as="strong" content="Member people count" />
                                              <Text id="detail-detail-tabs-9-member_people_count-value" data-oods-component="Text">{{ formatReadOnlyValue(memberPeopleCount, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-dominant_category-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-dominant_category-label" data-oods-component="Text" as="strong" content="Dominant category" />
                                              <Text id="detail-detail-tabs-9-dominant_category-value" data-oods-component="Text">{{ formatReadOnlyValue(dominantCategory, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-is_trending-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-is_trending-label" data-oods-component="Text" as="strong" content="Is trending" />
                                              <Text id="detail-detail-tabs-9-is_trending-value" data-oods-component="Text">{{ formatReadOnlyValue(isTrending, "boolean", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-window_days-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-window_days-label" data-oods-component="Text" as="strong" content="Window days" />
                                              <Text id="detail-detail-tabs-9-window_days-value" data-oods-component="Text">{{ formatReadOnlyValue(windowDays, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-max_similarity-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-max_similarity-label" data-oods-component="Text" as="strong" content="Max similarity" />
                                              <Text id="detail-detail-tabs-9-max_similarity-value" data-oods-component="Text">{{ formatReadOnlyValue(maxSimilarity, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-mean_similarity-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-mean_similarity-label" data-oods-component="Text" as="strong" content="Mean similarity" />
                                              <Text id="detail-detail-tabs-9-mean_similarity-value" data-oods-component="Text">{{ formatReadOnlyValue(meanSimilarity, "number", false) }}</Text>
                                            </Stack>
                                        </Stack>
                                      </template>
                                    </template>
                                  </Tabs>
                      </div>
                      <aside data-sidebar-aside>
                        <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                                    <Stack id="detail-slot-metadata-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                                  <ClassificationPanel id="detail-ve-metadata-25" data-oods-component="ClassificationPanel">
                                                                  <Stack id="detail-ve-metadata-25-primary_category_id-read-field" data-oods-component="Stack">
                                                                                    <Text id="detail-ve-metadata-25-primary_category_id-label" data-oods-component="Text" as="strong" content="Primary category id" />
                                                                                    <Text id="detail-ve-metadata-25-primary_category_id-value" data-oods-component="Text">{{ formatReadOnlyValue(primaryCategoryId, "string", false) }}</Text>
                                                                                  </Stack>
                                                                  <Stack id="detail-ve-metadata-25-tags-read-field" data-oods-component="Stack">
                                                                                    <Text id="detail-ve-metadata-25-tags-label" data-oods-component="Text" as="strong" content="Tags" />
                                                                                    <Text id="detail-ve-metadata-25-tags-value" data-oods-component="Text">{{ formatReadOnlyValue(tags, "Tag[]", false) }}</Text>
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
  /** Hive's identifier for the cluster, an integer surrogate key declared as a string. Present on the entity lens; the semantic lens computes clusters on the fly and does not persist one. */
  clusterId: string;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** The category most of its articles carry. Deliberately unconstrained: the server is authoritative and an unknown category is not coerced into the cohort's topic vocabulary, which is a different list serving a different purpose. */
  dominantCategory?: string;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Whether Hive marks the conversation as trending. */
  isTrending?: boolean;
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'updated';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** The title of the article that leads the conversation. */
  leadTitle: string;
  /** Where that article is. */
  leadUrl?: string;
  /** Which clusterer produced this record. Not a detail: the two lenses answer different questions and disagree by design — entity is the persisted entity-and-title-token clusterer that the co-talker counts are built from, semantic is an on-the-fly pgvector cosine at threshold 0.80 that finds two people writing about one idea in different vocabulary. A cluster is only meaningful beside the lens that produced it. */
  lens: 'entity' | 'semantic';
  /** Semantic lens only: the strongest cosine similarity in the cluster. Absent on the entity lens, where it does not exist — absence means the lens did not produce it, never a similarity of zero. */
  maxSimilarity?: number;
  /** Semantic lens only, on the same terms. */
  meanSimilarity?: number;
  /** How many articles are in the conversation. */
  memberCount?: number;
  /** How many distinct cohort members are in it — the number that makes a cluster worth reading, since Hive's default is the multi-person cluster its own signal uniquely produces. */
  memberPeopleCount?: number;
  /** The articles themselves, as {article_id, title, url, published_at, category, person_id, person_name}. */
  members?: Record<string, unknown>[];
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** The cohort members in the conversation, as {person_id, name, primary_topic, article_count_in_cluster}. primary_topic travels with each of them so a cluster that spans several slices of the cohort can be read without a second lookup. */
  people?: Record<string, unknown>[];
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
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
  /** The lookback this record was read for. Every count here is only true of a window. */
  windowDays?: number;
}

const { actions, uiState, activeFilters, categories, classificationMetadata, clusterId, createdAt, description, dominantCategory, filterCount, filters, isTrending, label, lastEvent, lastEventAt, leadTitle, leadUrl, lens, maxSimilarity, meanSimilarity, memberCount, memberPeopleCount, members, page, pageSize, people, placeholder, primaryCategoryId, primaryCategoryPath, searchActive, searchQuery, tagCount, tagPreview, tags, totalItems, totalPages, updatedAt, windowDays } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
