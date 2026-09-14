<template>
  <Stack id="list-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="list-screen-list-9-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="list-screen-list-9-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="list-screen-list-9-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success' || uiState === 'empty'">
        <Stack id="list-screen-list-9-success" data-oods-component="Stack" :data-oods-state="uiState === 'success' ? 'success' : undefined" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="list-list-toolbar-4" data-oods-component="Stack" data-oods-collection-toolbar="true" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <SearchInput id="list-slot-search-1" label="Search" placeholder="Search records" :value="collectionQuery.search ?? ''" :clearable="true" @value-change="handleFilter({ ...collectionQuery, search: $event })" />
                      <Select id="list-slot-filters-2" label="Status" :value="collectionQuery.status ?? ''" :options="[{'value': '', 'label': 'All states'}, {'value': 'draft', 'label': 'draft'}, {'value': 'posted', 'label': 'posted'}, {'value': 'open', 'label': 'open'}, {'value': 'processing', 'label': 'processing'}, {'value': 'past_due', 'label': 'past due'}, {'value': 'paid', 'label': 'paid'}, {'value': 'refunded', 'label': 'refunded'}, {'value': 'uncollectible', 'label': 'uncollectible'}, {'value': 'void', 'label': 'void'}]" @change="handleFilter({ ...collectionQuery, status: $event })" />
                      <Select id="list-list-toolbar-4-sort" label="Sort" :value="collectionQuery.descending ? 'desc' : 'asc'" :options="[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]" @change="handleSort('invoice_id')" />
                    </Stack>
              <section id="list-list-items-5" data-oods-collection="rows"><template v-if="rows.length === 0"><Banner id="list-list-items-5-empty" data-oods-component="Banner" content="No records found." /></template><ol v-else aria-label="Records" class="oods-collection"><li v-for="({ invoiceNumber, status, providerStatus, issuedAt, dueAt, paidAt, totalMinor, balanceMinor, currency, paymentTerms, collectionState, lastReminderAt, agingBucketDays, attemptCount, nextPaymentAttempt, memo, refundableUntil, refundPolicyUrl, totalRefundedMinor, creditMemoBalanceMinor, creditMemoType, lastRefundAt, requiresManagerApproval, notes, createdAt, updatedAt, lastEvent, lastEventAt, invoiceId, subscriptionId, provider, providerInvoiceId, billingContactName, billingContactEmail, taxMinor, discountMinor, subtotalMinor, lineItems, attachments, portalUrl, dunningStep, paymentSource }, collectionIndex) in rows" :key="String(invoiceId)"><Button :id="'list-list-items-5-row-' + collectionIndex" type="button" class="oods-collection-row" :data-record-id="String(invoiceId)" @click="handleRowClick(String(invoiceId))"><Text :id="'list-list-items-5-title-' + collectionIndex" data-oods-component="Text">{{ invoiceId }}</Text>
              <RelativeTimestamp :id="'list-slot-items-6-' + collectionIndex" data-oods-component="RelativeTimestamp" :datetime="updatedAt ?? createdAt" /></Button></li></ol></section>
              <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
                      <PaginationBar id="list-slot-pagination-8" :page="collectionQuery.page ?? 1" :pageSize="collectionQuery.pageSize ?? 10" :totalItems="collectionQuery.total ?? rows.length" @page-change="handlePageChange" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { Banner, Button, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

interface Props {
  rows?: Array<{ invoiceNumber: string; status: 'draft' | 'posted' | 'open' | 'processing' | 'past_due' | 'paid' | 'refunded' | 'uncollectible' | 'void'; providerStatus?: string; issuedAt: string; dueAt?: string; paidAt?: string; totalMinor: number; balanceMinor?: number; currency: string; paymentTerms?: 'due_upon_receipt' | 'net_15' | 'net_30' | 'net_45'; collectionState?: string; lastReminderAt?: string; agingBucketDays?: number; attemptCount?: number; nextPaymentAttempt?: string; memo?: string; refundableUntil?: string; refundPolicyUrl?: string; totalRefundedMinor?: number; creditMemoBalanceMinor?: number; creditMemoType?: 'service_failure' | 'retention_incentive' | 'goodwill'; lastRefundAt?: string; requiresManagerApproval?: boolean; notes?: string; createdAt: string; updatedAt?: string; lastEvent: 'created' | 'posted' | 'payment_initiated' | 'payment_cleared' | 'payment_failed' | 'voided' | 'written_off'; lastEventAt?: string; invoiceId: string; subscriptionId: string; provider: string; providerInvoiceId?: string; billingContactName?: string; billingContactEmail?: string; taxMinor?: number; discountMinor?: number; subtotalMinor?: number; lineItems?: unknown[]; attachments?: unknown[]; portalUrl?: string; dunningStep?: string; paymentSource?: string }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Number of days outstanding grouped for aging reports. */
  agingBucketDays?: number;
  /** Supporting documents or credit memos associated with the invoice. */
  attachments?: unknown[];
  /** Number of automatic payment attempts made on this invoice (Stripe smart-retries attempt_count). Increments on each retry in the dunning window. Source: docs.stripe.com/billing/revenue-recovery/smart-retries. */
  attemptCount?: number;
  /** Remaining amount outstanding in minor units. */
  balanceMinor?: number;
  /** Email address for the billing contact. */
  billingContactEmail?: string;
  /** Customer billing contact receiving the invoice. */
  billingContactName?: string;
  /** Dunning phase or retry program detail presented to success teams. */
  collectionState?: string;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Remaining credit memo balance that can be applied to invoices. */
  creditMemoBalanceMinor?: number;
  /** Category of credit memo tied to business justification. */
  creditMemoType?: 'service_failure' | 'retention_incentive' | 'goodwill';
  /** ISO 4217 currency for the invoice. */
  currency: string;
  /** Total discounts applied to the invoice in minor units. */
  discountMinor?: number;
  /** Payment due timestamp derived from payment terms. */
  dueAt?: string;
  /** Current dunning playbook step label (ex: reminder_1, reminder_final, collections). The structured retry window (attempt_count + next_payment_attempt) is provided by the composed SaaSBillingPayable trait; this field is the human-readable step name. */
  dunningStep?: string;
  /** Primary identifier for the invoice inside the billing domain. */
  invoiceId: string;
  /** Human readable invoice identifier presented to customers. */
  invoiceNumber: string;
  /** Timestamp when the invoice was finalized or posted. */
  issuedAt: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'created' | 'posted' | 'payment_initiated' | 'payment_cleared' | 'payment_failed' | 'voided' | 'written_off';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Timestamp when the most recent refund was issued. */
  lastRefundAt?: string;
  /** Timestamp of most recent payment reminder issued to customer. */
  lastReminderAt?: string;
  /** Normalized line items with quantity, amount_minor, and description fields. */
  lineItems?: unknown[];
  /** Internal finance note or customer visible memo. */
  memo?: string;
  /** When the next automatic payment retry is scheduled (Stripe smart-retries next_payment_attempt). Defines the open end of the retry window — modeled on the Refundable.refundable_until datetime-window precedent. Absent/null when no further attempts are scheduled (retries exhausted → invoice goes uncollectible, mirroring the subscription `unpaid` state). Source: docs.stripe.com/billing/revenue-recovery/smart-retries. */
  nextPaymentAttempt?: string;
  /** Internal commentary about refund actions or policy exceptions. */
  notes?: string;
  /** Timestamp when full payment cleared. */
  paidAt?: string;
  /** Payment method used or expected (card, ach, wire). */
  paymentSource?: string;
  /** Payment term label describing when payment is expected. */
  paymentTerms?: 'due_upon_receipt' | 'net_15' | 'net_30' | 'net_45';
  /** Link to the hosted invoice or customer billing portal. */
  portalUrl?: string;
  /** Source system providing invoice data. */
  provider: string;
  /** Native provider identifier retained for audit trails. */
  providerInvoiceId?: string;
  /** Original provider reported status or badge. */
  providerStatus?: string;
  /** Link to customer facing refund or cancellation policy. */
  refundPolicyUrl?: string;
  /** Date when refund eligibility window ends for this record. */
  refundableUntil?: string;
  /** Indicates if finance manager approval is required before issuing refund. */
  requiresManagerApproval?: boolean;
  /** Canonical invoice status after provider mapping. */
  status: 'draft' | 'posted' | 'open' | 'processing' | 'past_due' | 'paid' | 'refunded' | 'uncollectible' | 'void';
  /** Subscription identifier this invoice is associated with. */
  subscriptionId: string;
  /** Subtotal before discounts and tax in minor units. */
  subtotalMinor?: number;
  /** Tax amount collected on the invoice in minor currency units. */
  taxMinor?: number;
  /** Total amount due expressed in minor currency units. */
  totalMinor: number;
  /** Cumulative amount refunded in minor currency units. */
  totalRefundedMinor?: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

const { actions, uiState, agingBucketDays, attachments, attemptCount, balanceMinor, billingContactEmail, billingContactName, collectionState, createdAt, creditMemoBalanceMinor, creditMemoType, currency, discountMinor, dueAt, dunningStep, invoiceId, invoiceNumber, issuedAt, lastEvent, lastEventAt, lastRefundAt, lastReminderAt, lineItems, memo, nextPaymentAttempt, notes, paidAt, paymentSource, paymentTerms, portalUrl, provider, providerInvoiceId, providerStatus, refundPolicyUrl, refundableUntil, requiresManagerApproval, status, subscriptionId, subtotalMinor, taxMinor, totalMinor, totalRefundedMinor, updatedAt, rows = [], collectionQuery = {} } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handlePageChange') || typeof actions.handlePageChange !== 'function') { throw new Error('GeneratedUI requires actions.handlePageChange.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

/* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
/* @oods-domain-binding handlePageChange */ const handlePageChange = (page: number) => { actions.handlePageChange(page); };
/* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
/* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
