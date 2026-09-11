import React from 'react';
import { ArchiveEvent, Banner, CancellationEvent, Card, Stack, StateTransitionEvent, Text } from '@oods/components-react';
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
  /** Structured metadata about the archival action for compliance and audit purposes.

Properties:
  - method: "manual" | "automated" | "policy" — how the archive was triggered
  - compliance_tags: string[] — regulatory labels (e.g., ["GDPR", "SOX", "HIPAA"])
  - retention_policy_id: string — reference to the retention policy that triggered archival
  - original_status: string — the Stateful status before archival
  - related_entity_count: number — count of related entities also archived (cascade)
 */
  archiveMetadata?: Record<string, unknown>;
  /** Human-readable narrative describing why the entity was archived. */
  archiveReason?: string;
  /** Timestamp for when the entity entered the archived state. */
  archivedAt?: string | null;
  /** User ID or system identifier of the actor who archived this entity.
Set to "system" for automated/policy-driven archival. Supports audit trail queries
like "show all entities archived by user X" or "show all auto-archived entities".
 */
  archivedBy?: string;
  /** Billing cadence when pricing_model indicates recurring revenue. */
  billingInterval?: string;
  /** Whether cancellation occurs at the natural period end instead of immediately. When true the entity is in a REVERSIBLE pending-cancellation state: the schedule can be undone (set back to false) any time before period end, returning the entity to active. This is distinct from a terminal cancellation (a `terminated`/canceled subscription), which is irreversible and non-reactivatable. Mirrors Stripe's cancel_at_period_end flag (docs.stripe.com/billing/subscriptions/cancel). */
  cancelAtPeriodEnd: boolean;
  /** Free-form detail describing why cancellation occurred. */
  cancellationReason?: string;
  /** Structured reason code chosen from the allowedReasons parameter. */
  cancellationReasonCode?: string;
  /** Timestamp capturing when the cancellation workflow was initiated. */
  cancellationRequestedAt?: string;
  /** Sales channel through which the transaction was initiated. */
  channel: 'online' | 'in_app' | 'point_of_sale' | 'partner';
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** ISO currency code for the unit amount. */
  currency: string;
  /** Flag indicating whether the entity is currently archived (soft-deleted). */
  isArchived: boolean;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Timestamp when the transaction occurred in the source system. */
  occurredAt: string;
  /** Tenant organization responsible for the transaction. */
  organizationId?: string;
  /** Funding source used to complete the transaction. */
  paymentMethod: 'card' | 'bank_transfer' | 'digital_wallet' | 'invoice';
  /** Provider reference code linking to the payment processor. */
  paymentReference?: string;
  /** Monetization model applied to the entity. */
  pricingModel: string;
  /** Metadata about the most recent restoration action.

Properties:
  - restored_by: string — user ID or "system"
  - restored_fields: string[] — when partial restore, which fields were restored
  - restoration_reason: string — why the entity was restored
  - restored_from_snapshot: boolean — whether restored from a point-in-time snapshot
 */
  restorationMetadata?: Record<string, unknown>;
  /** Timestamp for when the entity was most recently restored from an archived state. */
  restoredAt?: string | null;
  /** Fraud assessment score assigned during authorization. */
  riskScore?: number;
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
  /** Defines whether taxes are included in the displayed price. */
  taxBehavior: 'exclusive' | 'inclusive';
  /** Unique identifier for the transaction record. */
  transactionId: string;
  /** Base unit price expressed in the smallest currency denomination. */
  unitAmountCents: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
  /** Identifier of the user associated with the transaction. */
  userId: string;
}

type ArchiveEventProps = React.ComponentPropsWithoutRef<typeof ArchiveEvent>;
type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type CancellationEventProps = React.ComponentPropsWithoutRef<typeof CancellationEvent>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StateTransitionEventProps = React.ComponentPropsWithoutRef<typeof StateTransitionEvent>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ uiState, allowedTransitions, archiveMetadata, archiveReason, archivedAt, archivedBy, billingInterval, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, channel, createdAt, currency, isArchived, lastEvent, lastEventAt, occurredAt, organizationId, paymentMethod, paymentReference, pricingModel, restorationMetadata, restoredAt, riskScore, stateHistory, status, taxBehavior, transactionId, unitAmountCents, updatedAt, userId, events = [] }) => {
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
                                <Text id="timeline-timeline-header-1-title" data-oods-component="Text">{transactionId}</Text>
                              </Stack>
                      <section id="timeline-timeline-entries-13" data-oods-collection="events">{events.length === 0 ? (<Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" content="No events yet." />) : (<ol aria-label="Lifecycle history" className="oods-collection">{chronologicalEvents(events).map((collectionEvent, collectionIndex) => <li key={collectionEvent.id}><Card id={'timeline-timeline-entries-13-entry-' + collectionIndex}><strong>{collectionEvent.title}</strong><time dateTime={collectionEvent.at}>{formatDateTime(collectionEvent.at)}</time><p>{collectionEvent.description}</p></Card></li>)}</ol>)}</section>
                      <Stack id="timeline-timeline-entries-13-trait-events" data-oods-component="Stack">
                                <StateTransitionEvent id="timeline-ve-entry-0-15" data-oods-component="StateTransitionEvent" showActor showReason history={stateHistory} status={status} />
                                <CancellationEvent id="timeline-ve-entry-0-16" data-oods-component="CancellationEvent" timestamp={cancellationRequestedAt} reason={cancellationReason} code={cancellationReasonCode} />
                                <ArchiveEvent id="timeline-ve-entry-0-17" data-oods-component="ArchiveEvent" archivedAt={archivedAt} restoredAt={restoredAt} reason={archiveReason} archivedBy={archivedBy} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
