import { NUCLEUS_COMPONENT_IDS } from '@oods/component-contracts';
import { renderToString } from '@vue/server-renderer';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';

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

const ServerShowcase = defineComponent({
  name: 'ServerShowcase',
  setup() {
    return () => h('main', [
      h(Badge, { content: 'Past due', tone: 'critical' }),
      h(Banner, { title: 'Payment failed', tone: 'critical' }),
      h(Button, { content: 'Save changes' }),
      h(Card, {}, { default: () => 'Account summary' }),
      h(CardHeader, { title: 'Account summary', supporting: 'Current subscription' }),
      h(ColorSwatch, { color: '#2563eb', label: 'Ocean blue' }),
      h(ColorizedBadge, { label: 'Active', status: 'active', color: '#15803d' }),
      h(DetailHeader, { title: 'Subscription details', as: 'h1', subtitle: 'Pro plan' }),
      h(VizAreaPreview, { width: 320, height: 180 }),
      h(Checkbox, { id: 'marketing', label: 'Product updates' }),
      h(DatePicker, { id: 'renewal', label: 'Renewal date', value: '2026-09-30' }),
      h(Grid, {}, { default: () => [h('span', 'First'), h('span', 'Second')] }),
      h(Input, { id: 'email', label: 'Email', value: 'owner@example.com' }),
      h(Select, {
        id: 'plan',
        label: 'Plan',
        defaultValue: 'pro',
        options: [
          { value: 'basic', label: 'Basic' },
          { value: 'pro', label: 'Pro' },
        ],
      }),
      h(Stack, {}, { default: () => 'Stack content' }),
      h(Table, {
        caption: 'Subscriptions',
        columns: [{ key: 'name', label: 'Name' }],
        rows: [{ id: 'sub-1', name: 'Acme' }],
      }),
      h(Tabs, {
        ariaLabel: 'Account sections',
        items: [{ id: 'overview', label: 'Overview', panel: 'Summary' }],
      }),
      h(Text, { as: 'strong', content: 'Account owner' }),
      h(Textarea, { id: 'notes', label: 'Notes', value: 'Call before renewal' }),
    ]);
  },
});

describe('@oods/components-vue server rendering', () => {
  it('SSR-renders every nucleus component family with semantic markup', async () => {
    const html = await renderToString(h(ServerShowcase));
    for (const componentId of NUCLEUS_COMPONENT_IDS) {
      expect(html, componentId).toContain(`data-oods-component="${componentId}"`);
    }
    expect(html).toContain('<table');
    expect(html).toContain('<caption>Subscriptions</caption>');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('type="button"');
    expect(html).toContain('<option value="pro" selected>Pro</option>');
  });
});
