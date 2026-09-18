import React from 'react';
import { Banner, Button, ClassificationEditor, Input, Select, Stack, StatusSelector } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleSubmit: () => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Primary identifier for the article document. */
  articleId: string;
  /** Reference to the authoring user. */
  authorId: string;
  /** Markdown content rendered in CMS detail views. */
  bodyMarkdown: string;
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Editorial template driving layout and governance workflows. */
  contentType: 'knowledge_base' | 'announcement' | 'release_notes' | 'how_to';
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Summary text used in list + SEO contexts. */
  excerpt?: string;
  /** Optional Media object identifier referenced in hero slots. */
  heroMediaId?: string;
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'created' | 'scheduled' | 'published' | 'updated' | 'archived';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Locale tag determining headline, copy, and SEO metadata. */
  locale?: string;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Timestamp when the article was published live. */
  publishedAt?: string;
  /** Estimated reading time derived from body length. */
  readingTimeMinutes?: number;
  /** Canonical slug rendered in URLs and breadcrumb links. */
  slug: string;
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
  status: 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type ClassificationEditorProps = React.ComponentPropsWithoutRef<typeof ClassificationEditor>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusSelectorProps = React.ComponentPropsWithoutRef<typeof StatusSelector>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, allowedTransitions, articleId, authorId, bodyMarkdown, categories, classificationMetadata, contentType, createdAt, description, excerpt, heroMediaId, label, lastEvent, lastEventAt, locale, placeholder, primaryCategoryId, primaryCategoryPath, publishedAt, readingTimeMinutes, slug, stateHistory, status, tagCount, tagPreview, tags, updatedAt }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  const [handleChange_content_typeState, setHandleChange_content_typeState] = React.useState<string>(String(contentType ?? ''));
  /* @oods-local-binding handleChange_content_type */ const handleChange_content_type = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_content_typeState(event.currentTarget.value); };
  const [handleChange_created_atState, setHandleChange_created_atState] = React.useState<string>(String(createdAt ?? ''));
  /* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_created_atState(event.currentTarget.value); };
  const [handleChange_labelState, setHandleChange_labelState] = React.useState<string>(String(label ?? ''));
  /* @oods-local-binding handleChange_label */ const handleChange_label = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_labelState(event.currentTarget.value); };
  const [handleChange_last_eventState, setHandleChange_last_eventState] = React.useState<string>(String(lastEvent ?? ''));
  /* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_last_eventState(event.currentTarget.value); };
  const [handleChange_primary_category_pathState, setHandleChange_primary_category_pathState] = React.useState<string>(String(primaryCategoryPath ?? ''));
  /* @oods-local-binding handleChange_primary_category_path */ const handleChange_primary_category_path = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_primary_category_pathState(event.currentTarget.value); };
  const [handleChange_reading_time_minutesState, setHandleChange_reading_time_minutesState] = React.useState<string>(String(readingTimeMinutes ?? ''));
  /* @oods-local-binding handleChange_reading_time_minutes */ const handleChange_reading_time_minutes = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_reading_time_minutesState(event.currentTarget.value); };
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
                                <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" options={[{"label":"Draft","value":"draft"},{"label":"In Review","value":"in_review"},{"label":"Scheduled","value":"scheduled"},{"label":"Published","value":"published"},{"label":"Archived","value":"archived"}]} value={handleChange_statusState} onChange={handleChange_status} />
                              </Stack>
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <ClassificationEditor id="form-slot-field-0-3" data-oods-component="ClassificationEditor" label="Description" description={description} />
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-2-7" data-oods-component="Input" help="Timestamp recording when the entity was first created." label="Created at" placeholder="Timestamp recording when the entity was first created." required type="datetime-local" value={handleChange_created_atState} onChange={handleChange_created_at} />
                                          </Stack>
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Select id="form-slot-field-3-13" data-oods-component="Select" help="Editorial template driving layout and governance workflows." label="Content type" options={[{"label":"Knowledge Base","value":"knowledge_base"},{"label":"Announcement","value":"announcement"},{"label":"Release Notes","value":"release_notes"},{"label":"How To","value":"how_to"}]} required value={handleChange_content_typeState} onChange={handleChange_content_type} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-4-15" data-oods-component="Input" help="Name shown for this record." label="Name" placeholder="Enter label" required value={handleChange_labelState} onChange={handleChange_label} />
                                          </Stack>
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Select id="form-slot-field-6-19" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" options={[{"label":"Created","value":"created"},{"label":"Scheduled","value":"scheduled"},{"label":"Published","value":"published"},{"label":"Updated","value":"updated"},{"label":"Archived","value":"archived"}]} required value={handleChange_last_eventState} onChange={handleChange_last_event} />
                                          </Stack>
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-7-21" data-oods-component="Input" help="Estimated reading time derived from body length." label="Reading time minutes" placeholder="Estimated reading time derived from body length." type="number" value={handleChange_reading_time_minutesState} onChange={handleChange_reading_time_minutes} />
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
