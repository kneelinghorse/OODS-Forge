import React from 'react';
import { Banner, Button, ClassificationEditor, DetailHeader, Input, Select, Stack } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleSubmit: () => void;
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

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type ClassificationEditorProps = React.ComponentPropsWithoutRef<typeof ClassificationEditor>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, categories, classificationMetadata, createdAt, decisionId, decisionText, evidence, filterCount, filters, lastEvent, lastEventAt, missionId, page, pageSize, primaryCategoryId, primaryCategoryPath, projectDomain, projectId, searchActive, searchQuery, sessionId, sprintId, supersededAt, supersededBy, supersedes, supersessionReason, supersessionStatus, tagCount, tagPreview, tags, totalItems, totalPages, updatedAt }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  const [handleChange_created_atState, setHandleChange_created_atState] = React.useState<string>(String(createdAt ?? ''));
  /* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_created_atState(event.currentTarget.value); };
  const [handleChange_filterCountState, setHandleChange_filterCountState] = React.useState<string>(String(filterCount ?? ''));
  /* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_filterCountState(event.currentTarget.value); };
  const [handleChange_last_eventState, setHandleChange_last_eventState] = React.useState<string>(String(lastEvent ?? ''));
  /* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_last_eventState(event.currentTarget.value); };
  const [handleChange_primary_category_idState, setHandleChange_primary_category_idState] = React.useState<string>(String(primaryCategoryId ?? ''));
  /* @oods-local-binding handleChange_primary_category_id */ const handleChange_primary_category_id = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_primary_category_idState(event.currentTarget.value); };
  const [handleChange_primary_category_pathState, setHandleChange_primary_category_pathState] = React.useState<string>(String(primaryCategoryPath ?? ''));
  /* @oods-local-binding handleChange_primary_category_path */ const handleChange_primary_category_path = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_primary_category_pathState(event.currentTarget.value); };
  const [handleChange_superseded_byState, setHandleChange_superseded_byState] = React.useState<string>(String(supersededBy ?? ''));
  /* @oods-local-binding handleChange_superseded_by */ const handleChange_superseded_by = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_superseded_byState(event.currentTarget.value); };
  const [handleChange_supersedesState, setHandleChange_supersedesState] = React.useState<string>(String(supersedes ?? ''));
  /* @oods-local-binding handleChange_supersedes */ const handleChange_supersedes = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_supersedesState(event.currentTarget.value); };
  const [handleChange_supersession_statusState, setHandleChange_supersession_statusState] = React.useState<string>(String(supersessionStatus ?? ''));
  /* @oods-local-binding handleChange_supersession_status */ const handleChange_supersession_status = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_supersession_statusState(event.currentTarget.value); };
  /* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };

  return (
    <>
      <Stack id="form-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="form-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="form-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="form-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {uiState === 'success' && (
              <Stack id="form-screen-form-11" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)', padding: 'var(--ref-space-inset-default)' }}>
                      <DetailHeader id="form-form-title-1" data-oods-component="DetailHeader" />
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <ClassificationEditor id="form-slot-field-0-3" data-oods-component="ClassificationEditor" label="Supersession reason" description={supersessionReason} />
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-1-5" data-oods-component="Input" help="Timestamp recording when the entity was first created." label="Created at" placeholder="Timestamp recording when the entity was first created." required type="datetime-local" value={handleChange_created_atState} onChange={handleChange_created_at} />
                                          </Stack>
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-3-13" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" value={handleChange_filterCountState} onChange={handleChange_filterCount} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-4-15" data-oods-component="Input" help="Whether this record still stands. Named apart from Stateful's `status` so an object can carry&#10;both a lifecycle and a supersession lineage.&#10;" label="Supersession status" placeholder="Enter supersession status" required value={handleChange_supersession_statusState} onChange={handleChange_supersession_status} />
                                          </Stack>
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-5-17" data-oods-component="Input" help="Identifier of the record that replaced this one. Present when the store records the forward&#10;pointer. Absent means not replaced, or not known — the two are distinguished by&#10;supersession_status, never by the pointer alone.&#10;" label="Superseded by" placeholder="Enter superseded by" value={handleChange_superseded_byState} onChange={handleChange_superseded_by} />
                                          </Stack>
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-6-19" data-oods-component="Input" help="Identifier of the record this one replaced. Present when the store records the backward&#10;pointer. Never inferred from ordering.&#10;" label="Supersedes" placeholder="Enter supersedes" value={handleChange_supersedesState} onChange={handleChange_supersedes} />
                                          </Stack>
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Select id="form-slot-field-7-21" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" options={[{"label":"Captured","value":"captured"}]} required value={handleChange_last_eventState} onChange={handleChange_last_event} />
                                          </Stack>
                                <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-8-23" data-oods-component="Input" help="Identifier of the canonical taxonomy node." label="Primary category id" placeholder="Enter primary category id" value={handleChange_primary_category_idState} onChange={handleChange_primary_category_id} />
                                          </Stack>
                                <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-9-25" data-oods-component="Input" help="Human-readable breadcrumb path (Electronics &gt; Mobile &gt; Android)." label="Primary category path" placeholder="Enter primary category path" value={handleChange_primary_category_pathState} onChange={handleChange_primary_category_path} />
                                          </Stack>
                              </Stack>
                      <Stack id="form-form-actions-9" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 'var(--ref-space-inset-default)' }}>
                                <Button id="form-form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
