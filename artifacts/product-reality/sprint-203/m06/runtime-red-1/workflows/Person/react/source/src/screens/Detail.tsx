import React from 'react';
import { Banner, Card, ClassificationPanel, DetailHeader, Stack, StatusTimeline, Tabs, Text } from '@oods/components-react';
import '@oods/component-styles/css';
import { formatReadOnlyValue } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleEdit: () => void;
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
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type ClassificationPanelProps = React.ComponentPropsWithoutRef<typeof ClassificationPanel>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusTimelineProps = React.ComponentPropsWithoutRef<typeof StatusTimeline>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, articleCount, articles, blurb, categories, classificationMetadata, coTalkers, description, filterCount, filters, label, name, org, page, pageSize, personId, placeholder, primaryCategoryId, primaryCategoryPath, primaryTopic, role, searchActive, searchQuery, stateHistory, status, tagCount, tagPreview, tags, topClusters, totalItems, totalPages, windowDays, xHandle }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }

  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };

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
                                              <DetailHeader id="detail-ve-header-24" data-oods-component="DetailHeader" title={name} subtitle={description} level={2} />
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
                                          <Stack id="detail-detail-tabs-9-person_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-person_id-label" data-oods-component="Text" as="strong" content="Person id" />
                                              <Text id="detail-detail-tabs-9-person_id-value" data-oods-component="Text">{formatReadOnlyValue(personId, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-primary_topic-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-primary_topic-label" data-oods-component="Text" as="strong" content="Primary topic" />
                                              <Text id="detail-detail-tabs-9-primary_topic-value" data-oods-component="Text">{formatReadOnlyValue(primaryTopic, "string", true)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-role-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-role-label" data-oods-component="Text" as="strong" content="Role" />
                                              <Text id="detail-detail-tabs-9-role-value" data-oods-component="Text">{formatReadOnlyValue(role, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-org-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-org-label" data-oods-component="Text" as="strong" content="Org" />
                                              <Text id="detail-detail-tabs-9-org-value" data-oods-component="Text">{formatReadOnlyValue(org, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-x_handle-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-x_handle-label" data-oods-component="Text" as="strong" content="X handle" />
                                              <Text id="detail-detail-tabs-9-x_handle-value" data-oods-component="Text">{formatReadOnlyValue(xHandle, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-blurb-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-blurb-label" data-oods-component="Text" as="strong" content="Blurb" />
                                              <Text id="detail-detail-tabs-9-blurb-value" data-oods-component="Text">{formatReadOnlyValue(blurb, "string", false)}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-window_days-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-window_days-label" data-oods-component="Text" as="strong" content="Window days" />
                                              <Text id="detail-detail-tabs-9-window_days-value" data-oods-component="Text">{formatReadOnlyValue(windowDays, "number", false)}</Text>
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
        </div>
      </>
    </>
  );
};
