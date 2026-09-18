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
              <DetailHeader id="detail-screen-detail-13-record-title" data-oods-component="DetailHeader" :title="targetName" :level="2" />
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
                                      <Stack id="detail-detail-tabs-9-run_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-run_id-label" data-oods-component="Text" as="strong" content="Run id" />
                                          <Text id="detail-detail-tabs-9-run_id-value" data-oods-component="Text">{{ formatReadOnlyValue(runId, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-target_url-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-target_url-label" data-oods-component="Text" as="strong" content="Target url" />
                                          <Text id="detail-detail-tabs-9-target_url-value" data-oods-component="Text">{{ formatReadOnlyValue(targetUrl, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-mode-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-mode-label" data-oods-component="Text" as="strong" content="Mode" />
                                          <Text id="detail-detail-tabs-9-mode-value" data-oods-component="Text">{{ formatReadOnlyValue(mode, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-auth_type-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-auth_type-label" data-oods-component="Text" as="strong" content="Auth type" />
                                          <Text id="detail-detail-tabs-9-auth_type-value" data-oods-component="Text">{{ formatReadOnlyValue(authType, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-page_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-page_count-label" data-oods-component="Text" as="strong" content="Page count" />
                                          <Text id="detail-detail-tabs-9-page_count-value" data-oods-component="Text">{{ formatReadOnlyValue(pageCount, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-finding_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-finding_count-label" data-oods-component="Text" as="strong" content="Finding count" />
                                          <Text id="detail-detail-tabs-9-finding_count-value" data-oods-component="Text">{{ formatReadOnlyValue(findingCount, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-critical_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-critical_count-label" data-oods-component="Text" as="strong" content="Critical count" />
                                          <Text id="detail-detail-tabs-9-critical_count-value" data-oods-component="Text">{{ formatReadOnlyValue(criticalCount, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-serious_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-serious_count-label" data-oods-component="Text" as="strong" content="Serious count" />
                                          <Text id="detail-detail-tabs-9-serious_count-value" data-oods-component="Text">{{ formatReadOnlyValue(seriousCount, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-moderate_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-moderate_count-label" data-oods-component="Text" as="strong" content="Moderate count" />
                                          <Text id="detail-detail-tabs-9-moderate_count-value" data-oods-component="Text">{{ formatReadOnlyValue(moderateCount, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-minor_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-minor_count-label" data-oods-component="Text" as="strong" content="Minor count" />
                                          <Text id="detail-detail-tabs-9-minor_count-value" data-oods-component="Text">{{ formatReadOnlyValue(minorCount, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-unknown_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-unknown_count-label" data-oods-component="Text" as="strong" content="Unknown count" />
                                          <Text id="detail-detail-tabs-9-unknown_count-value" data-oods-component="Text">{{ formatReadOnlyValue(unknownCount, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-pass_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-pass_count-label" data-oods-component="Text" as="strong" content="Pass count" />
                                          <Text id="detail-detail-tabs-9-pass_count-value" data-oods-component="Text">{{ formatReadOnlyValue(passCount, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-passes_failed-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-passes_failed-label" data-oods-component="Text" as="strong" content="Passes failed" />
                                          <Text id="detail-detail-tabs-9-passes_failed-value" data-oods-component="Text">{{ formatReadOnlyValue(passesFailed, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-artifact_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-artifact_count-label" data-oods-component="Text" as="strong" content="Artifact count" />
                                          <Text id="detail-detail-tabs-9-artifact_count-value" data-oods-component="Text">{{ formatReadOnlyValue(artifactCount, "integer", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-evidence_retained-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-evidence_retained-label" data-oods-component="Text" as="strong" content="Evidence retained" />
                                          <Text id="detail-detail-tabs-9-evidence_retained-value" data-oods-component="Text">{{ formatReadOnlyValue(evidenceRetained, "boolean", false) }}</Text>
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
  /** How many artifacts the run's index lists. */
  artifactCount: number;
  /** The authentication the manifest RECORDS. Shown as recorded, never inferred: Sprint 204 measured "none" on a capture that was authenticated, which is Stage1's to correct. */
  authType: string;
  /** Findings of critical impact. */
  criticalCount: number;
  /** Whether the run kept its evidence directory (evidence_retention.retained). */
  evidenceRetained?: boolean;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** How many rule failures the run found across its pages (a11y rollup.violation_count). */
  findingCount: number;
  /** Findings of minor impact. */
  minorCount: number;
  /** The capture mode. Every run a run view reads is app; suite runs aggregate targets and carry no a11y report of their own. */
  mode: 'app' | 'suite';
  /** Findings of moderate impact. */
  moderateCount: number;
  /** Current page number (1-based). */
  page: number;
  /** How many pages the accessibility pass read. */
  pageCount: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** How many capture passes ran. */
  passCount: number;
  /** How many of those passes did not finish ok. */
  passesFailed: number;
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
  /** The capture's own id, a uuid Stage1 assigns; the directory name under out/stage1/<suite>/. */
  runId: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** Findings of serious impact. */
  seriousCount: number;
  /** What was captured, as the run names it (targets[0].name). Every run read carries exactly one target, so the subject is two fields here rather than an object of its own. */
  targetName: string;
  /** Where the capture started (targets[0].url). */
  targetUrl: string;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Findings whose impact the engine did not state. Its own bucket: never folded into minor. */
  unknownCount: number;
}

const { actions, uiState, activeFilters, artifactCount, authType, criticalCount, evidenceRetained, filterCount, filters, findingCount, minorCount, mode, moderateCount, page, pageCount, pageSize, passCount, passesFailed, provenanceAt, provenanceLocator, provenanceMethod, provenanceRecord, provenanceSource, runId, searchActive, searchQuery, seriousCount, targetName, targetUrl, totalItems, totalPages, unknownCount } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
