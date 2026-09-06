import type { SharedScenario } from '@oods/component-contracts';
import type { ReactElement } from 'react';

import {
  Badge,
  Banner,
  Button,
  Card,
  CardHeader,
  Checkbox,
  ColorSwatch,
  ColorizedBadge,
  DatePicker,
  DetailHeader,
  Grid,
  Input,
  Select,
  Stack,
  Table,
  Tabs,
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
