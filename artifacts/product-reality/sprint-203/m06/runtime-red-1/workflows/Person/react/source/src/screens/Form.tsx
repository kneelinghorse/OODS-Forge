import React from 'react';
import { Banner, Button, Checkbox, ClassificationEditor, Input, Stack, StatusSelector } from '@oods/components-react';
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
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** How many articles they published in the window this record was read for. */
  articleCount?: number;
  /** What they published in the window, as {article_id, title, url, published_at, category}. */
  articles?: Record<string, unknown>[];
  /** Why they are worth following, in Derek's own words. Unbounded free text and one of the two readability risks this sprint carries into the craft pass. */
  blurb?: string;
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Who else was in those conversations, as {person_id, name, shared_entity_clusters, shared_semantic_clusters}. Derived for the window, not a stored edge, which is why the universal Relationship object does not carry it: Relationship needs uuid endpoints, a relationship_type, a direction and an is_bidirectional flag, has its own lifecycle and an owner, and expresses strength as one string — while these are two independent counts that disagree (a person can share 0 entity clusters and 2 semantic ones with the same peer). */
  coTalkers?: Record<string, unknown>[];
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
  /** The person's name, as the cohort records it. Present on every row. */
  name: string;
  /** Where they are, when the cohort knows. Free text and frequently absent — null for Simon Willison on the sampled read — and never a reference to an organisation record. */
  org?: string;
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Hive's identifier for the person. An integer surrogate key in the store, declared as a string here so it is never treated as arithmetic and so the same shape carries another cohort's ids. */
  personId: string;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Which slice of the cohort they belong to. Measured from cohort_list, which is the slice-discovery authority: ai_research 167, design 152, ai_engineering 119, writers 85, meaning_layer 71, founders 68, other 39, product 39. */
  primaryTopic: 'ai_research' | 'design' | 'ai_engineering' | 'writers' | 'meaning_layer' | 'founders' | 'other' | 'product';
  /** What they do, in free text as the cohort records it ("Datasette; daily LLM posts"). Deliberately unconstrained: it is a description, not a membership role, which is why core/User cannot carry a cohort member — User's role is an enum of account roles (end_user, admin, owner, billing). */
  role?: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
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
  status: 'active' | 'tracked_unfeeded' | 'dormant';
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** The conversations they turned up in, as {cluster_id, lead_title, member_count, member_people_count, dominant_category, person_article_count_in_cluster}. */
  topClusters?: Record<string, unknown>[];
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** The lookback the counts and lists on this record were derived for. Every derived field here is only true of a window, so the window travels with them rather than being implied. */
  windowDays?: number;
  /** Their handle, with the leading @ as the cohort stores it. */
  xHandle?: string;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type CheckboxProps = React.ComponentPropsWithoutRef<typeof Checkbox>;
type ClassificationEditorProps = React.ComponentPropsWithoutRef<typeof ClassificationEditor>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusSelectorProps = React.ComponentPropsWithoutRef<typeof StatusSelector>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, articleCount, articles, blurb, categories, classificationMetadata, coTalkers, description, filterCount, filters, label, name, org, page, pageSize, personId, placeholder, primaryCategoryId, primaryCategoryPath, primaryTopic, role, searchActive, searchQuery, stateHistory, status, tagCount, tagPreview, tags, topClusters, totalItems, totalPages, windowDays, xHandle }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  const [handleChange_filterCountState, setHandleChange_filterCountState] = React.useState<string>(String(filterCount ?? ''));
  /* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_filterCountState(event.currentTarget.value); };
  const [handleChange_labelState, setHandleChange_labelState] = React.useState<string>(String(label ?? ''));
  /* @oods-local-binding handleChange_label */ const handleChange_label = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_labelState(event.currentTarget.value); };
  const [handleChange_primary_category_idState, setHandleChange_primary_category_idState] = React.useState<string>(String(primaryCategoryId ?? ''));
  /* @oods-local-binding handleChange_primary_category_id */ const handleChange_primary_category_id = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_primary_category_idState(event.currentTarget.value); };
  const [handleChange_primary_category_pathState, setHandleChange_primary_category_pathState] = React.useState<string>(String(primaryCategoryPath ?? ''));
  /* @oods-local-binding handleChange_primary_category_path */ const handleChange_primary_category_path = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_primary_category_pathState(event.currentTarget.value); };
  const [handleChange_roleState, setHandleChange_roleState] = React.useState<string>(String(role ?? ''));
  /* @oods-local-binding handleChange_role */ const handleChange_role = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_roleState(event.currentTarget.value); };
  const [handleChange_searchActiveState, setHandleChange_searchActiveState] = React.useState<boolean>(searchActive ?? false);
  /* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_searchActiveState(event.currentTarget.checked); };
  const [handleChange_statusState, setHandleChange_statusState] = React.useState<string>(String(status ?? ''));
  /* @oods-local-binding handleChange_status */ const handleChange_status = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_statusState(event.currentTarget.value); };
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
                      <Stack id="form-form-title-1" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" options={[{"label":"Active","value":"active"},{"label":"Tracked Unfeeded","value":"tracked_unfeeded"},{"label":"Dormant","value":"dormant"}]} value={handleChange_statusState} onChange={handleChange_status} />
                              </Stack>
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <ClassificationEditor id="form-slot-field-0-3" data-oods-component="ClassificationEditor" label="Description" description={description} />
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Checkbox id="form-slot-field-2-7" data-oods-component="Checkbox" help="Whether the search input is currently focused or has a non-empty query." label="Search Active" checked={handleChange_searchActiveState} onChange={handleChange_searchActive} />
                                          </Stack>
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-3-13" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" value={handleChange_filterCountState} onChange={handleChange_filterCount} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-4-15" data-oods-component="Input" help="What they do, in free text as the cohort records it (&quot;Datasette; daily LLM posts&quot;). Deliberately unconstrained: it is a description, not a membership role, which is why core/User cannot carry a cohort member — User's role is an enum of account roles (end_user, admin, owner, billing)." label="Role" placeholder="What they do, in free text as the cohort records it (&quot;Datasette; daily LLM posts&quot;). Deliberately unconstrained: it is a description, not a membership role, which is why core/User cannot carry a cohort member — User's role is an enum of account roles (end_user, admin, owner, billing)." value={handleChange_roleState} onChange={handleChange_role} />
                                          </Stack>
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-5-17" data-oods-component="Input" help="Name shown for this record." label="Label" placeholder="Enter label" required value={handleChange_labelState} onChange={handleChange_label} />
                                          </Stack>
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-7-21" data-oods-component="Input" help="Identifier of the canonical taxonomy node." label="Primary category id" placeholder="Enter primary category id" value={handleChange_primary_category_idState} onChange={handleChange_primary_category_id} />
                                          </Stack>
                                <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-8-23" data-oods-component="Input" help="Human-readable breadcrumb path (Electronics &gt; Mobile &gt; Android)." label="Primary category path" placeholder="Enter primary category path" value={handleChange_primary_category_pathState} onChange={handleChange_primary_category_path} />
                                          </Stack>
                                <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
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
