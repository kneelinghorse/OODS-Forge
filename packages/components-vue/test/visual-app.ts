import '@oods/component-styles/css';
import './visual.css';

import { createApp, defineComponent, h, ref } from 'vue';

import {
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Grid,
  Input,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
} from '../src/index.js';

const params = new URLSearchParams(window.location.search);
const brand = params.get('brand') === 'B' ? 'B' : 'A';
const themeParam = params.get('theme');
const theme = themeParam === 'dark' || themeParam === 'hc' ? themeParam : 'light';

document.documentElement.dataset.brand = brand;
document.documentElement.dataset.theme = theme;
document.documentElement.style.colorScheme = theme === 'dark' || theme === 'hc' ? 'dark' : 'light';

const VisualShowcase = defineComponent({
  name: 'VueFoundationVisualShowcase',
  setup() {
    const email = ref('invalid');
    const renewal = ref('2026-09-30');
    const plan = ref('pro');
    const marketing = ref(true);
    const notes = ref('Call before renewal');

    return () => h('main', {
      id: 'vue-foundation-showcase',
      class: 'visual-shell',
      'aria-label': 'OODS Vue foundation showcase',
    }, [
      h('header', { class: 'visual-header' }, [
        h('div', {}, [
          h(Text, { as: 'h1', size: 'lg', weight: 'semibold', content: 'Account operations' }),
          h('p', {}, 'Vue 3 component foundation · responsive and token driven'),
        ]),
        h('span', { class: 'visual-cell-label', 'data-cell-label': '' }, `${brand} · ${theme}`),
      ]),
      h(Grid, { minColumnWidth: '18rem', gap: 'lg', align: 'start' }, {
        default: () => [
          h('section', { class: 'visual-section' }, [
            h('h2', {}, 'Status and actions'),
            h(Stack, { gap: 'md' }, {
              default: () => [
                h('div', { class: 'visual-status-row' }, [
                  h(Badge, { domain: 'subscription', status: 'active', emphasis: 'subtle' }),
                  h(Badge, {
                    domain: 'invoice',
                    status: 'past_due',
                    emphasis: 'solid',
                    icon: '!',
                  }),
                ]),
                h(Banner, {
                  domain: 'invoice',
                  status: 'past_due',
                  title: 'Payment failed',
                  detail: 'Update the card to keep service active.',
                  dismissLabel: 'Dismiss payment warning',
                }, {
                  actions: () => h(Button, { content: 'Update card', intent: 'primary' }),
                }),
                h('div', { class: 'visual-actions' }, [
                  h(Button, { content: 'Save changes', intent: 'primary' }),
                  h(Button, { content: 'Unavailable', disabled: true }),
                ]),
              ],
            }),
          ]),
          h(Card, { as: 'section', elevated: true, class: 'visual-mini-card' }, {
            default: () => [
              h('h2', {}, 'Account profile'),
              h(Text, { as: 'p', content: 'Canonical native fields with associated help and errors.' }),
              h(Stack, { gap: 'md' }, {
                default: () => [
                  h(Input, {
                    id: 'visual-email',
                    label: 'Email',
                    modelValue: email.value,
                    required: true,
                    help: 'Use a work address',
                    validation: { state: 'error', message: 'Enter a valid email' },
                    'onUpdate:modelValue': (value: string) => { email.value = value; },
                  }),
                  h(DatePicker, {
                    id: 'visual-renewal',
                    label: 'Renewal date',
                    modelValue: renewal.value,
                    min: '2026-09-01',
                    max: '2026-12-31',
                    'onUpdate:modelValue': (value: string) => { renewal.value = value; },
                  }),
                  h(Select, {
                    id: 'visual-plan',
                    label: 'Plan',
                    modelValue: plan.value,
                    options: [
                      { value: 'basic', label: 'Basic' },
                      { value: 'pro', label: 'Pro' },
                      { value: 'enterprise', label: 'Enterprise' },
                    ],
                    'onUpdate:modelValue': (value: string) => { plan.value = value; },
                  }),
                  h(Textarea, {
                    id: 'visual-notes',
                    label: 'Notes',
                    modelValue: notes.value,
                    rows: 3,
                    help: 'Visible to account managers',
                    'onUpdate:modelValue': (value: string) => { notes.value = value; },
                  }),
                  h(Checkbox, {
                    id: 'visual-marketing',
                    label: 'Product updates',
                    modelValue: marketing.value,
                    required: true,
                    help: 'Choose whether to subscribe',
                    'onUpdate:modelValue': (value: boolean) => { marketing.value = value; },
                  }),
                ],
              }),
            ],
          }),
          h('section', { class: 'visual-section visual-section--wide' }, [
            h('h2', {}, 'Navigation and data'),
            h(Tabs, {
              ariaLabel: 'Account sections',
              defaultSelectedId: 'overview',
              overflowLabel: 'More sections',
              items: [
                { id: 'overview', label: 'Overview', panel: 'Account health and recent changes.' },
                { id: 'profile', label: 'Profile', panel: 'Contact and identity information.' },
                { id: 'security', label: 'Security', panel: 'Unavailable for this account.', disabled: true },
                { id: 'billing', label: 'Billing', panel: 'Invoices and payment methods.' },
                { id: 'activity', label: 'Activity', panel: 'Recent account events.' },
              ],
            }),
            h('div', { class: 'visual-table-frame' }, [
              h(Table, {
                caption: 'Subscriptions',
                density: 'compact',
                selectable: true,
                columns: [
                  { key: 'name', label: 'Name' },
                  { key: 'plan', label: 'Plan' },
                  { key: 'status', label: 'Status' },
                ],
                rows: [
                  { id: 'sub-1', name: 'Northwind', plan: 'Enterprise', status: 'Active' },
                  { id: 'sub-2', name: 'Contoso', plan: 'Pro', status: 'Past due' },
                ],
              }),
            ]),
          ]),
        ],
      }),
      h('footer', { class: 'visual-footer' }, 'Frozen component-styles CSS · no consumer source scanning'),
    ]);
  },
});

createApp(VisualShowcase).mount('#app');
requestAnimationFrame(() => requestAnimationFrame(() => {
  document.body.dataset.visualReady = 'true';
}));
