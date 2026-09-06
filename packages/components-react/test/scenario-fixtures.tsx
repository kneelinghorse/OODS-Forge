import type { SharedScenario } from '@oods/component-contracts';
import type { ReactElement } from 'react';

import type {
  AddressEditorProps, AddressValidationTimelineProps, FilterPanelProps, MessageEventTimelineProps, PreferenceEditorProps,
  PreferenceTimelineProps, RoleAssignmentFormProps, RoleBadgeListProps, StatusSelectorProps, TagInputProps, TagManagerProps,
  TagPillsProps, TemplatePickerProps,
} from '../src/index.js';

import {
  AddressCollectionPanel,
  AddressEditor,
  AddressSummaryBadge,
  AddressValidationTimeline,
  AuditEvent,
  Badge,
  Banner,
  Button,
  Card,
  CardHeader,
  Checkbox,
  ClassificationPanel,
  ColorSwatch,
  ColorizedBadge,
  DatePicker,
  DetailHeader,
  FilterPanel,
  Grid,
  Input,
  MembershipAuditTimeline,
  MembershipPanel,
  MessageEventTimeline,
  MessageStatusBadge,
  PreferenceEditor,
  PreferencePanel,
  PreferenceSummaryBadge,
  PreferenceTimeline,
  PriceSummary,
  RoleAssignmentForm,
  RoleBadgeList,
  Select,
  Stack,
  StatusSelector,
  Table,
  Tabs,
  TagInput,
  TagManager,
  TagPills,
  TemplatePicker,
  Text,
  Textarea,
  VizAreaPreview,
} from '../src/index.js';

export type SharedScenarioHandlers = {
  readonly onEvent?: (value?: unknown) => void;
};

export function renderSharedScenario(
  scenario: SharedScenario,
  handlers: SharedScenarioHandlers = {}
): ReactElement {
  const { onEvent } = handlers;
  switch (scenario.id) {
    case 'badge-status':
      return <Badge content="Past due" tone="critical" emphasis="solid" icon="!" />;
    case 'banner-dismissible':
      return (
        <Banner
          title="Payment failed"
          detail="Update the card"
          tone="critical"
          dismissLabel="Dismiss payment warning"
          onDismiss={() => onEvent?.()}
          actions={<Button>Update card</Button>}
        />
      );
    case 'button-activate':
      return <Button onActivate={event => onEvent?.(event)}>Save changes</Button>;
    case 'card-elevated-content':
      return <Card elevated>Account summary</Card>;
    case 'card-header-supporting-text':
      return <CardHeader {...scenario.props} />;
    case 'classification-panel-title-and-summary':
      return <ClassificationPanel {...scenario.props} />;
    case 'address-collection-panel-title-and-summary':
      return <AddressCollectionPanel {...scenario.props} />;
    case 'membership-panel-title-and-summary':
      return <MembershipPanel {...scenario.props} />;
    case 'preference-panel-title-and-summary':
      return <PreferencePanel {...scenario.props} />;
    case 'tag-manager-list-and-add-control':
      return <TagManager {...(scenario.props as TagManagerProps)} />;
    case 'address-summary-badge-role':
      return <AddressSummaryBadge {...scenario.props} />;
    case 'message-status-badge-delivery':
      return <MessageStatusBadge {...scenario.props} />;
    case 'preference-summary-badge-namespace-and-version':
      return <PreferenceSummaryBadge {...scenario.props} />;
    case 'role-badge-list-items':
      return <RoleBadgeList {...(scenario.props as RoleBadgeListProps)} />;
    case 'tag-pills-overflow-template':
      return <TagPills {...(scenario.props as TagPillsProps)} />;
    case 'address-validation-timeline-events':
      return <AddressValidationTimeline {...(scenario.props as AddressValidationTimelineProps)} />;
    case 'audit-event-type-and-timestamp':
      return <AuditEvent {...scenario.props} />;
    case 'membership-audit-timeline-empty':
      return <MembershipAuditTimeline {...scenario.props} />;
    case 'message-event-timeline-statuses':
      return <MessageEventTimeline {...(scenario.props as MessageEventTimelineProps)} />;
    case 'preference-timeline-changes':
      return <PreferenceTimeline {...(scenario.props as PreferenceTimelineProps)} />;
    case 'address-editor-fields-and-change':
      return <AddressEditor {...(scenario.props as AddressEditorProps)} onChange={address => onEvent?.(address)} />;
    case 'preference-editor-namespace-and-document':
      return <PreferenceEditor {...(scenario.props as PreferenceEditorProps)} />;
    case 'role-assignment-form-roles':
      return <RoleAssignmentForm {...(scenario.props as RoleAssignmentFormProps)} />;
    case 'status-selector-controlled':
      return <StatusSelector {...(scenario.props as StatusSelectorProps)} onValueChange={value => onEvent?.(value)} />;
    case 'tag-input-typed-text':
      return <TagInput {...(scenario.props as TagInputProps)} onValueChange={value => onEvent?.(value)} />;
    case 'template-picker-selects':
      return <TemplatePicker {...(scenario.props as TemplatePickerProps)} />;
    case 'filter-panel-batch-mode':
      return <FilterPanel {...(scenario.props as FilterPanelProps)} />;
    case 'price-summary-terms':
      return <PriceSummary {...scenario.props} />;
    case 'color-swatch-label-and-chip':
      return <ColorSwatch {...scenario.props} />;
    case 'colorized-badge-color-marker':
      return <ColorizedBadge {...scenario.props} />;
    case 'detail-header-heading-level':
      return <DetailHeader {...scenario.props} />;
    case 'viz-area-preview-frame-placeholder-and-slot':
      return <VizAreaPreview {...scenario.props}>{String(scenario.slots.default)}</VizAreaPreview>;
    case 'checkbox-controlled':
      return (
        <Checkbox
          id="marketing"
          label="Product updates"
          checked={false}
          onCheckedChange={checked => onEvent?.(checked)}
          required
          help="Choose whether to subscribe"
        />
      );
    case 'date-picker-bounded':
      return (
        <DatePicker
          id="renewal"
          label="Renewal date"
          value="2026-09-30"
          onValueChange={value => onEvent?.(value)}
          min="2026-09-01"
          max="2026-12-31"
          step={1}
        />
      );
    case 'grid-responsive':
      return <Grid minColumnWidth="16rem" gap="md"><Card>First card</Card><Card>Second card</Card></Grid>;
    case 'input-invalid':
      return (
        <Input
          id="email"
          label="Email"
          type="email"
          value="invalid"
          onValueChange={value => onEvent?.(value)}
          required
          help="Use a work address"
          validation={{ state: 'error', message: 'Enter a valid email' }}
        />
      );
    case 'select-controlled':
      return (
        <Select
          id="plan"
          label="Plan"
          value="pro"
          onValueChange={value => onEvent?.(value)}
          options={[
            { value: 'basic', label: 'Basic' },
            { value: 'pro', label: 'Pro' },
          ]}
        />
      );
    case 'stack-wrapped-row':
      return <Stack direction="row" gap="sm" align="center" wrap><Button>Primary</Button><Button>Secondary</Button></Stack>;
    case 'table-selectable-row':
      return (
        <Table
          caption="Subscriptions"
          columns={[{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }]}
          rows={[{ id: 'sub-1', name: 'Acme', status: 'Active' }]}
          density="compact"
          selectable
          onRowActivate={id => onEvent?.(id)}
        />
      );
    case 'tabs-keyboard':
      return (
        <Tabs
          ariaLabel="Account sections"
          defaultSelectedId="overview"
          onChange={id => onEvent?.(id)}
          items={[
            { id: 'overview', label: 'Overview', panel: 'Summary' },
            { id: 'billing', label: 'Billing', panel: 'Invoices' },
          ]}
        />
      );
    case 'text-semantic':
      return <Text as="strong" size="md" weight="semibold">Account owner</Text>;
    case 'textarea-controlled':
      return (
        <Textarea
          id="notes"
          label="Notes"
          value="Call before renewal"
          onValueChange={value => onEvent?.(value)}
          rows={4}
          help="Visible to account managers"
        />
      );
    default:
      throw new Error(`Unimplemented shared React scenario: ${scenario.id}`);
  }
}
