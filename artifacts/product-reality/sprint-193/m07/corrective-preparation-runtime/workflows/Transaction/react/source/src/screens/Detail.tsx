import React from 'react';
import { ArchiveSummary, Banner, CancellationSummary, Card, PriceSummary, Stack, StatusTimeline, Tabs, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleCancel: () => void;
  handleDelete: () => void;
  handleEdit: () => void;
  handleViewTimeline: () => void;
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

type ArchiveSummaryProps = React.ComponentPropsWithoutRef<typeof ArchiveSummary>;
type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type CancellationSummaryProps = React.ComponentPropsWithoutRef<typeof CancellationSummary>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type PriceSummaryProps = React.ComponentPropsWithoutRef<typeof PriceSummary>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusTimelineProps = React.ComponentPropsWithoutRef<typeof StatusTimeline>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, allowedTransitions, archiveMetadata, archiveReason, archivedAt, archivedBy, billingInterval, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, channel, createdAt, currency, isArchived, lastEvent, lastEventAt, occurredAt, organizationId, paymentMethod, paymentReference, pricingModel, restorationMetadata, restoredAt, riskScore, stateHistory, status, taxBehavior, transactionId, unitAmountCents, updatedAt, userId }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleCancel') || typeof actions.handleCancel !== 'function') { throw new Error('GeneratedUI requires actions.handleCancel.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

  /* @oods-domain-binding handleCancel */ const handleCancel = () => { actions.handleCancel(); };
  /* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
  /* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };

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
                        <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                  <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                              <StatusTimeline id="detail-ve-header-24" data-oods-component="StatusTimeline" showActorId showReason history={stateHistory} allowedTransitions={allowedTransitions} status={status} />
                                              <PriceSummary id="detail-ve-header-25" data-oods-component="PriceSummary" amount={unitAmountCents} currency={currency} model={pricingModel} interval={billingInterval} />
                                              <CancellationSummary id="detail-ve-header-26" data-oods-component="CancellationSummary" cancelAtPeriodEnd={cancelAtPeriodEnd} requestedAt={cancellationRequestedAt} reason={cancellationReason} code={cancellationReasonCode} />
                                              <ArchiveSummary id="detail-ve-header-27" data-oods-component="ArchiveSummary" isArchived={isArchived} archivedAt={archivedAt} reason={archiveReason} />
                                            </Stack>
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style={{ alignItems: 'start', display: 'grid', gap: 'var(--ref-space-cluster-default)', gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 24rem)' }}>
                                  <div data-sidebar-main>
                                    <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                      { ...{"id":"detail-detail-tab-panel-3","label":"Details"}, panel: (
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                          <StatusTimeline id="detail-slot-tab-0-4" data-oods-component="StatusTimeline" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                              <Text id="detail-pg-status-timeline-29" data-oods-component="Text" label="Status">{status}</Text>
                                              <Text id="detail-pg-status-timeline-30" data-oods-component="Text" label="Allowed transitions">{Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : ''}</Text>
                                            </StatusTimeline>
                                          <Text id="detail-slot-tab-1-6" data-oods-component="Text" label="Channel">{channel}</Text>
                                        </Stack>
                                      ) }
                                    ]} />
                                  </div>
                                  <aside data-sidebar-aside>
                                    <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }} />
                                  </aside>
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleCancel" onClick={() => handleCancel()}>Cancel subscription</button>
          <button type="button" data-oods-action="handleDelete" onClick={() => handleDelete()}>Archive</button>
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
          <button type="button" data-oods-action="handleViewTimeline" onClick={() => handleViewTimeline()}>View timeline</button>
        </div>
      </>
    </>
  );
};
