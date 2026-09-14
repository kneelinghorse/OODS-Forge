import React from 'react';
import { Banner, Card, Stack, StateTransitionEvent, Text, TimelineEntryLabel } from '@oods/components-react';
import '@oods/component-styles/css';
import { chronologicalEvents, formatDateTime, type CollectionEvent } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface PageProps {
  events?: CollectionEvent[];
  uiState: GeneratedUIState;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Media form factor guiding viewer presentation. */
  assetType: 'image' | 'video' | 'audio' | 'document';
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Hex-encoded checksum (SHA-256) for deduplication. */
  checksum?: string;
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Media playback duration for video/audio assets. */
  durationSeconds?: number;
  /** Size of the binary payload in bytes. */
  fileSizeBytes: number;
  /** Pixel height for images/videos when available. */
  heightPx?: number;
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Primary identifier for the media asset across services. */
  mediaId: string;
  /** IANA MIME type recorded at ingestion. */
  mimeType: string;
  /** Provider-specific path or key referencing the binary object. */
  objectKey: string;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Canonical CDN URL for public consumption. */
  sourceUrl?: string;
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
  status: string;
  /** Storage namespace (S3 bucket, GCS bucket) backing the asset. */
  storageBucket: string;
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** List of transcoding profiles generated for the asset. */
  transcodingProfiles?: string[];
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
  /** Pixel width for images/videos when available. */
  widthPx?: number;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StateTransitionEventProps = React.ComponentPropsWithoutRef<typeof StateTransitionEvent>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;
type TimelineEntryLabelProps = React.ComponentPropsWithoutRef<typeof TimelineEntryLabel>;

export const GeneratedUI: React.FC<PageProps> = ({ uiState, allowedTransitions, assetType, categories, checksum, classificationMetadata, createdAt, description, durationSeconds, fileSizeBytes, heightPx, label, lastEvent, lastEventAt, mediaId, mimeType, objectKey, placeholder, primaryCategoryId, primaryCategoryPath, sourceUrl, stateHistory, status, storageBucket, tagCount, tagPreview, tags, transcodingProfiles, updatedAt, widthPx, events = [] }) => {
  return (
    <>
      <Stack id="timeline-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="timeline-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="timeline-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="timeline-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {uiState === 'success' && (
              <Stack id="timeline-screen-timeline-14" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="timeline-timeline-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                <Text id="timeline-timeline-header-1-title" data-oods-component="Text">{label}</Text>
                              </Stack>
                      <section id="timeline-timeline-entries-13" data-oods-collection="events">{events.length === 0 ? (<Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" content="No events yet." />) : (<ol aria-label="Lifecycle history" className="oods-collection">{chronologicalEvents(events).map((collectionEvent, collectionIndex) => <li key={collectionEvent.id}><Card id={'timeline-timeline-entries-13-entry-' + collectionIndex}><TimelineEntryLabel id={'timeline-ve-entry-0-15-' + collectionIndex} data-oods-component="TimelineEntryLabel" compact label={label} /><strong>{collectionEvent.title}</strong><time dateTime={collectionEvent.at}>{formatDateTime(collectionEvent.at)}</time><p>{collectionEvent.description}</p></Card></li>)}</ol>)}</section>
                      <Stack id="timeline-timeline-entries-13-trait-events" data-oods-component="Stack">
                                <StateTransitionEvent id="timeline-ve-entry-0-16" data-oods-component="StateTransitionEvent" showActor showReason history={stateHistory} status={status} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
