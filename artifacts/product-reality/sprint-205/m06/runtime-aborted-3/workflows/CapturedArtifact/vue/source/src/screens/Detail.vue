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
              <DetailHeader id="detail-screen-detail-13-record-title" data-oods-component="DetailHeader" :title="path" :level="2" />
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Details','panel':''}]">
                                <template #panel="{ item }">
                                  <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                    <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                      <Stack id="detail-slot-tab-0-4-read-field" data-oods-component="Stack">
                                          <Text id="detail-slot-tab-0-4-label" data-oods-component="Text" as="strong" content="Source" />
                                          <Text id="detail-slot-tab-0-4-value" data-oods-component="Text">{{ formatReadOnlyValue(provenanceSource, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-slot-tab-1-6-read-field" data-oods-component="Stack">
                                          <Text id="detail-slot-tab-1-6-label" data-oods-component="Text" as="strong" content="Obtained by" />
                                          <Text id="detail-slot-tab-1-6-value" data-oods-component="Text">{{ formatReadOnlyValue(provenanceMethod, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-slot-tab-2-8-read-field" data-oods-component="Stack">
                                          <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Read from" />
                                          <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{{ formatReadOnlyValue(provenanceLocator, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-slot-tab-3-15-read-field" data-oods-component="Stack">
                                          <Text id="detail-slot-tab-3-15-label" data-oods-component="Text" as="strong" content="Record" />
                                          <Text id="detail-slot-tab-3-15-value" data-oods-component="Text">{{ formatReadOnlyValue(provenanceRecord, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-artifact_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-artifact_id-label" data-oods-component="Text" as="strong" content="Artifact id" />
                                          <Text id="detail-detail-tabs-9-artifact_id-value" data-oods-component="Text">{{ formatReadOnlyValue(artifactId, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-artifact_kind-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-artifact_kind-label" data-oods-component="Text" as="strong" content="Artifact kind" />
                                          <Text id="detail-detail-tabs-9-artifact_kind-value" data-oods-component="Text">{{ formatReadOnlyValue(artifactKind, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-description-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-description-label" data-oods-component="Text" as="strong" content="Description" />
                                          <Text id="detail-detail-tabs-9-description-value" data-oods-component="Text">{{ formatReadOnlyValue(description, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-sha256-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-sha256-label" data-oods-component="Text" as="strong" content="Sha256" />
                                          <Text id="detail-detail-tabs-9-sha256-value" data-oods-component="Text">{{ formatReadOnlyValue(sha256, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-schema_version-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-schema_version-label" data-oods-component="Text" as="strong" content="Schema version" />
                                          <Text id="detail-detail-tabs-9-schema_version-value" data-oods-component="Text">{{ formatReadOnlyValue(schemaVersion, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-bytes-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-bytes-label" data-oods-component="Text" as="strong" content="Bytes" />
                                          <Text id="detail-detail-tabs-9-bytes-value" data-oods-component="Text">{{ formatReadOnlyValue(bytes, "integer", false) }}</Text>
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
  </div>
</template>

<script setup lang="ts">
import { formatReadOnlyValue } from '@oods/component-contracts';
import { Banner, Card, DetailHeader, Stack, Tabs, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleEdit: () => void;
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
  /** The run id and the path, "<run_id>:<path>". */
  artifactId: string;
  /** What kind of artifact it is, as the run's index types it. */
  artifactKind: string;
  /** Its size. The index lists itself without one. */
  bytes?: number;
  /** What the artifact holds, in the index's words. */
  description: string;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** The file under the run's artifacts/ directory, which names the artifact. */
  path: string;
  /** When they were obtained. */
  provenanceAt: string;
  /** Where in that record the values were read. */
  provenanceLocator?: string;
  /** How the values were obtained. */
  provenanceMethod: string;
  /** Which record there. */
  provenanceRecord: string;
  /** The system that produced the record. */
  provenanceSource: string;
  /** The artifact's own schema_version. Absent on entity_catalog, style_fingerprint and stylesheet_rules, which Stage1 does not stamp. */
  schemaVersion?: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** The digest the run manifest attests for this file (manifest.hashes). All 27 on run 6e435ce7 match the bytes on disk. */
  sha256: string;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
}

const { actions, uiState, activeFilters, artifactId, artifactKind, bytes, description, filterCount, filters, page, pageSize, path, provenanceAt, provenanceLocator, provenanceMethod, provenanceRecord, provenanceSource, schemaVersion, searchActive, searchQuery, sha256, totalItems, totalPages } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
