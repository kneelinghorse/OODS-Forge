import React from 'react';
import { ArchivedRowOverlay, Banner, BillingSummaryBadge, Button, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, StatusBadge, Tabs, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

export interface PageProps {
  rows?: Array<{ status: 'future' | 'trialing' | 'active' | 'paused' | 'pending_cancellation' | 'past_due' | 'unpaid' | 'terminated'; stateHistory?: unknown[]; allowedTransitions?: string[]; cancelAtPeriodEnd: boolean; cancellationReason?: string; cancellationReasonCode?: string; cancellationRequestedAt?: string; createdAt: string; updatedAt?: string; lastEvent: string; lastEventAt?: string; amount: number; currency: string; billingInterval?: string; paymentStatus?: 'pending' | 'succeeded' | 'failed' | 'retrying' | 'refunded'; paymentMethodType?: 'card' | 'ach' | 'wire' | 'invoice' | 'other'; prorationAmount?: number; prorationDate?: number; lastPaymentAt?: string; nextPaymentDueAt?: string; currentPeriodStart: string; currentPeriodEnd: string; currentPeriodProgress?: number; isArchived: boolean; archivedAt?: string | null; restoredAt?: string | null; archiveReason?: string; archivedBy?: string; archiveMetadata?: Record<string, unknown>; restorationMetadata?: Record<string, unknown>; subscriptionId: string; planName: string; planCode?: string; planInterval?: string; customerName?: string; customerEmail?: string }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Recurring price expressed in minor units (e.g., cents). */
  amount: number;
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
  /** Recurrence cadence (monthly, yearly, quarterly, etc.). */
  billingInterval?: string;
  /** Whether the subscription will cancel at the natural billing period end. */
  cancelAtPeriodEnd: boolean;
  /** Free-form explanation captured during cancellation workflows. */
  cancellationReason?: string;
  /** Structured reason code chosen from the allowedReasons parameter. */
  cancellationReasonCode?: string;
  /** Timestamp when cancellation was initiated. */
  cancellationRequestedAt?: string;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** ISO 4217 currency code used for billing. */
  currency: string;
  /** End timestamp of the current billing cycle. */
  currentPeriodEnd: string;
  /** Decimal progress (0-1) through the active billing cycle. */
  currentPeriodProgress?: number;
  /** Start timestamp of the current billing cycle. */
  currentPeriodStart: string;
  /** Billing contact email address. */
  customerEmail?: string;
  /** Customer or account name associated with the subscription. */
  customerName?: string;
  /** Flag indicating whether the entity is currently archived (soft-deleted). */
  isArchived: boolean;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Timestamp of the most recent successful payment. */
  lastPaymentAt?: string;
  /** Timestamp when the next payment attempt should occur. */
  nextPaymentDueAt?: string;
  /** Payment instrument category used for collection. */
  paymentMethodType?: 'card' | 'ach' | 'wire' | 'invoice' | 'other';
  /** Outcome of the most recent collection attempt. Distinct from subscription
lifecycle status — a subscription can be "active" with payment_status "retrying".
 */
  paymentStatus?: 'pending' | 'succeeded' | 'failed' | 'retrying' | 'refunded';
  /** Internal plan code or price identifier. */
  planCode?: string;
  /** Billing interval descriptor (monthly, yearly, etc.). */
  planInterval?: string;
  /** Human-readable plan label shown in headers. */
  planName: string;
  /** Prorated credit or charge in minor currency units generated by a mid-cycle
plan change. Positive values are charges; negative values are credits.
Only populated when the supportProration parameter is true.
 */
  prorationAmount?: number;
  /** Unix timestamp (epoch SECONDS) at which proration is calculated. Pinned when an
upcoming-invoice PREVIEW is requested and MUST be passed identically on commit so the
committed charge equals the previewed amount. The preview is read-only and does NOT
mutate the subscription. Stored as an integer (not a datetime) so the value round-trips
byte-identically between preview and commit — an ISO string normalization could shift it
and desync the previewed vs charged amount. Only populated when supportProration is true.
Source: docs.stripe.com/billing/subscriptions/prorations.
 */
  prorationDate?: number;
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
  /** Current lifecycle status of the subscription. */
  status: 'future' | 'trialing' | 'active' | 'paused' | 'pending_cancellation' | 'past_due' | 'unpaid' | 'terminated';
  /** Primary identifier used across billing and lifecycle systems. */
  subscriptionId: string;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

type ArchivedRowOverlayProps = React.ComponentPropsWithoutRef<typeof ArchivedRowOverlay>;
type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type BillingSummaryBadgeProps = React.ComponentPropsWithoutRef<typeof BillingSummaryBadge>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type RelativeTimestampProps = React.ComponentPropsWithoutRef<typeof RelativeTimestamp>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusBadgeProps = React.ComponentPropsWithoutRef<typeof StatusBadge>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, allowedTransitions, amount, archiveMetadata, archiveReason, archivedAt, archivedBy, billingInterval, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, createdAt, currency, currentPeriodEnd, currentPeriodProgress, currentPeriodStart, customerEmail, customerName, isArchived, lastEvent, lastEventAt, lastPaymentAt, nextPaymentDueAt, paymentMethodType, paymentStatus, planCode, planInterval, planName, prorationAmount, prorationDate, restorationMetadata, restoredAt, stateHistory, status, subscriptionId, updatedAt, rows = [], collectionQuery = {} }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handlePageChange') || typeof actions.handlePageChange !== 'function') { throw new Error('GeneratedUI requires actions.handlePageChange.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

  /* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
  /* @oods-domain-binding handlePageChange */ const handlePageChange = (page: number) => { actions.handlePageChange(page); };
  /* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
  /* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };

  return (
    <>
      <Stack id="list-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="list-screen-list-9-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="list-screen-list-9-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="list-screen-list-9-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {(uiState === 'success' || uiState === 'empty') && (
              <Stack id="list-screen-list-9-success" data-oods-component="Stack" data-oods-state={uiState === 'success' ? 'success' : undefined} data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="list-list-toolbar-4" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                <SearchInput id="list-slot-search-1" label="Search" placeholder="Search records" value={collectionQuery.search ?? ''} clearable={true} onValueChange={(search) => handleFilter({ ...collectionQuery, search })} />
                                <Select id="list-slot-filters-2" label="Status" value={collectionQuery.status ?? ''} options={[{'value': '', 'label': 'All states'}, {'value': 'future', 'label': 'future'}, {'value': 'trialing', 'label': 'trialing'}, {'value': 'active', 'label': 'active'}, {'value': 'paused', 'label': 'paused'}, {'value': 'pending_cancellation', 'label': 'pending cancellation'}, {'value': 'past_due', 'label': 'past due'}, {'value': 'unpaid', 'label': 'unpaid'}, {'value': 'terminated', 'label': 'terminated'}]} onChange={(event) => handleFilter({ ...collectionQuery, status: event.currentTarget.value })} />
                                <Select id="list-list-toolbar-4-sort" label="Sort" value={collectionQuery.descending ? 'desc' : 'asc'} options={[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]} onChange={() => handleSort('plan_name')} />
                              </Stack>
                      <Tabs id="list-list-items-5-archive-tabs" ariaLabel="Archive views" selectedId={collectionQuery.archived ? 'archived' : 'active'} items={[{ id: 'active', label: 'Active', panel: (collectionQuery.archived ? 'archived' : 'active') === 'active' ? (<><section id="list-list-items-5" data-oods-collection="rows">{rows.length === 0 ? (<Banner id="list-list-items-5-empty" data-oods-component="Banner" content="No records found." />) : (<ol aria-label="Records" className="oods-collection">{rows.map(({ status, stateHistory, allowedTransitions, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, createdAt, updatedAt, lastEvent, lastEventAt, amount, currency, billingInterval, paymentStatus, paymentMethodType, prorationAmount, prorationDate, lastPaymentAt, nextPaymentDueAt, currentPeriodStart, currentPeriodEnd, currentPeriodProgress, isArchived, archivedAt, restoredAt, archiveReason, archivedBy, archiveMetadata, restorationMetadata, subscriptionId, planName, planCode, planInterval, customerName, customerEmail }, collectionIndex) => <li key={String(subscriptionId)}><ArchivedRowOverlay id={'list-ve-items-13-' + collectionIndex} data-oods-component="ArchivedRowOverlay" separateTab showBadge tabLabel="Archived" isArchived={isArchived} label={planName}>
                                <Button id={'list-list-items-5-row-' + collectionIndex} type="button" className="oods-collection-row" data-record-id={String(subscriptionId)} onClick={() => handleRowClick(String(subscriptionId))}><Text id={'list-list-items-5-title-' + collectionIndex} data-oods-component="Text">{planName}</Text>
                                <StatusBadge id={'list-ve-items-10-' + collectionIndex} data-oods-component="StatusBadge" tone="lifecycle" status={status} />
                                <RelativeTimestamp id={'list-ve-items-11-' + collectionIndex} data-oods-component="RelativeTimestamp" datetime={updatedAt ?? createdAt} />
                                <BillingSummaryBadge id={'list-slot-toolbar-actions-3-' + collectionIndex} data-oods-component="BillingSummaryBadge" minorUnits={100} amount={amount} currency={currency} interval={billingInterval} /></Button>
                              </ArchivedRowOverlay></li>)}</ol>)}</section></>) : null }, { id: 'archived', label: 'Archived', panel: (collectionQuery.archived ? 'archived' : 'active') === 'archived' ? (<><section id="list-list-items-5" data-oods-collection="rows">{rows.length === 0 ? (<Banner id="list-list-items-5-empty" data-oods-component="Banner" content="No records found." />) : (<ol aria-label="Records" className="oods-collection">{rows.map(({ status, stateHistory, allowedTransitions, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, createdAt, updatedAt, lastEvent, lastEventAt, amount, currency, billingInterval, paymentStatus, paymentMethodType, prorationAmount, prorationDate, lastPaymentAt, nextPaymentDueAt, currentPeriodStart, currentPeriodEnd, currentPeriodProgress, isArchived, archivedAt, restoredAt, archiveReason, archivedBy, archiveMetadata, restorationMetadata, subscriptionId, planName, planCode, planInterval, customerName, customerEmail }, collectionIndex) => <li key={String(subscriptionId)}><ArchivedRowOverlay id={'list-ve-items-13-' + collectionIndex} data-oods-component="ArchivedRowOverlay" separateTab showBadge tabLabel="Archived" isArchived={isArchived} label={planName}>
                                <Button id={'list-list-items-5-row-' + collectionIndex} type="button" className="oods-collection-row" data-record-id={String(subscriptionId)} onClick={() => handleRowClick(String(subscriptionId))}><Text id={'list-list-items-5-title-' + collectionIndex} data-oods-component="Text">{planName}</Text>
                                <StatusBadge id={'list-ve-items-10-' + collectionIndex} data-oods-component="StatusBadge" tone="lifecycle" status={status} />
                                <RelativeTimestamp id={'list-ve-items-11-' + collectionIndex} data-oods-component="RelativeTimestamp" datetime={updatedAt ?? createdAt} />
                                <BillingSummaryBadge id={'list-slot-toolbar-actions-3-' + collectionIndex} data-oods-component="BillingSummaryBadge" minorUnits={100} amount={amount} currency={currency} interval={billingInterval} /></Button>
                              </ArchivedRowOverlay></li>)}</ol>)}</section></>) : null }]} onChange={(id) => handleFilter({ ...collectionQuery, archived: id === 'archived' })} />
                      <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                                <PaginationBar id="list-slot-pagination-8" page={collectionQuery.page ?? 1} pageSize={collectionQuery.pageSize ?? 10} totalItems={collectionQuery.total ?? rows.length} onPageChange={handlePageChange} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
