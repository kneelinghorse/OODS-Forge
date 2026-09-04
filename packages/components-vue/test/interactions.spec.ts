import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';

import {
  Badge,
  Banner,
  Button,
  Checkbox,
  DatePicker,
  Input,
  Select,
  Table,
  Tabs,
  Textarea,
  type TabItem,
} from '../src/index.js';

describe('@oods/components-vue interactions', () => {
  it('B-09 emits Vue update:modelValue and change for controlled fields', async () => {
    const wrapper = mount(Input, {
      props: {
        id: 'email',
        label: 'Email',
        modelValue: 'invalid',
        help: 'Use a work address',
        validation: { state: 'error', message: 'Enter a valid email' },
      },
    });

    const input = wrapper.get('input');
    await input.setValue('user@example.com');

    expect(wrapper.emitted('update:modelValue')).toEqual([['user@example.com']]);
    expect(wrapper.emitted('input')).toEqual([['user@example.com']]);
    expect(wrapper.emitted('change')).toEqual([['user@example.com']]);
  });

  it('B-10 moves Vue Tabs selection and focus with ArrowRight', async () => {
    const items: TabItem[] = [
      { id: 'overview', label: 'Overview', panel: 'Summary' },
      { id: 'disabled', label: 'Disabled', panel: 'Unavailable', disabled: true },
      { id: 'billing', label: 'Billing', panel: 'Invoices' },
    ];
    const wrapper = mount(Tabs, {
      attachTo: document.body,
      props: { items, defaultSelectedId: 'overview', ariaLabel: 'Account sections' },
    });

    const overview = wrapper.get('[data-tab-id="overview"]');
    overview.element.focus();
    await overview.trigger('keydown', { key: 'ArrowRight' });
    await nextTick();

    const billing = wrapper.get('[data-tab-id="billing"]');
    expect(billing.attributes('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(billing.element);
    expect(wrapper.get('[role="tabpanel"]:not([hidden])').text()).toBe('Invoices');
    expect(wrapper.emitted('change')).toEqual([['billing']]);

    await billing.trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    expect(document.activeElement).toBe(overview.element);
    expect(overview.attributes('aria-selected')).toBe('true');
    wrapper.unmount();
  });

  it('supports Tabs ArrowLeft, Home, End, pointer activation, and controlled updates', async () => {
    const items: TabItem[] = [
      { id: 'one', label: 'One', panel: 'First' },
      { id: 'two', label: 'Two', panel: 'Second', disabled: true },
      { id: 'three', label: 'Three', panel: 'Third' },
    ];
    const wrapper = mount(Tabs, {
      attachTo: document.body,
      props: { items, defaultSelectedId: 'one' },
    });
    const one = wrapper.get('[data-tab-id="one"]');
    const three = wrapper.get('[data-tab-id="three"]');

    await one.trigger('keydown', { key: 'End' });
    await nextTick();
    expect(document.activeElement).toBe(three.element);
    await three.trigger('keydown', { key: 'Home' });
    await nextTick();
    expect(document.activeElement).toBe(one.element);
    await one.trigger('keydown', { key: 'ArrowLeft' });
    await nextTick();
    expect(document.activeElement).toBe(three.element);
    await one.trigger('click');
    expect(one.attributes('aria-selected')).toBe('true');
    expect(wrapper.emitted('update:selectedId')?.at(-1)).toEqual(['one']);
    wrapper.unmount();

    const controlled = mount(Tabs, {
      attachTo: document.body,
      props: { items, selectedId: 'one' },
    });
    await controlled.get('[data-tab-id="one"]').trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    expect(controlled.emitted('update:selectedId')).toEqual([['three']]);
    expect(controlled.get('[data-tab-id="one"]').attributes('aria-selected')).toBe('true');
    await controlled.setProps({ selectedId: 'three' });
    expect(controlled.get('[data-tab-id="three"]').attributes('aria-selected')).toBe('true');
    controlled.unmount();
  });

  it('uses native field controls with idiomatic update and change events', async () => {
    const controlledCheckbox = mount(Checkbox, {
      props: { id: 'terms', label: 'Accept terms', checked: true },
    });
    expect((controlledCheckbox.get('input').element as HTMLInputElement).checked).toBe(true);

    const defaultCheckedCheckbox = mount(Checkbox, {
      props: { id: 'alerts', label: 'Account alerts', defaultChecked: true },
    });
    expect((defaultCheckedCheckbox.get('input').element as HTMLInputElement).checked).toBe(true);

    const checkbox = mount(Checkbox, {
      props: { id: 'marketing', label: 'Product updates', defaultChecked: false },
    });
    await checkbox.get('input').setValue(true);
    expect((checkbox.get('input').element as HTMLInputElement).checked).toBe(true);
    expect(checkbox.emitted('update:modelValue')).toEqual([[true]]);
    expect(checkbox.emitted('change')).toEqual([[true]]);

    const datePicker = mount(DatePicker, {
      props: {
        id: 'renewal',
        label: 'Renewal date',
        modelValue: '2026-09-30',
        min: '2026-09-01',
        max: '2026-12-31',
        step: 1,
      },
    });
    expect(datePicker.findComponent(Input).exists()).toBe(true);
    expect(datePicker.get('input').attributes()).toMatchObject({
      type: 'date',
      min: '2026-09-01',
      max: '2026-12-31',
      step: '1',
    });
    await datePicker.get('input').setValue('2026-10-01');
    expect(datePicker.emitted('update:modelValue')).toEqual([['2026-10-01']]);
    expect(datePicker.emitted('change')).toEqual([['2026-10-01']]);

    const select = mount(Select, {
      props: {
        id: 'plan',
        label: 'Plan',
        modelValue: 'pro',
        options: [
          { value: 'basic', label: 'Basic' },
          { value: 'pro', label: 'Pro' },
        ],
      },
    });
    await select.get('select').setValue('basic');
    expect(select.emitted('update:modelValue')).toEqual([['basic']]);
    expect(select.emitted('change')).toEqual([['basic']]);

    const textarea = mount(Textarea, {
      props: { id: 'notes', label: 'Notes', modelValue: 'Call before renewal' },
    });
    await textarea.get('textarea').setValue('Call before renewal. Confirm contact.');
    expect(textarea.emitted('update:modelValue')).toEqual([['Call before renewal. Confirm contact.']]);
    expect(textarea.emitted('change')).toEqual([['Call before renewal. Confirm contact.']]);
  });

  it('emits activation and dismissal from native buttons', async () => {
    const button = mount(Button, { props: { content: 'Save changes' } });
    expect(button.get('button').attributes('type')).toBe('button');
    await button.get('button').trigger('click');
    expect(button.emitted('activate')).toHaveLength(1);

    const banner = mount(Banner, {
      props: {
        title: 'Payment failed',
        tone: 'critical',
        dismissLabel: 'Dismiss payment warning',
      },
    });
    expect(banner.get('[role="alert"]').exists()).toBe(true);
    await banner.get('button[aria-label="Dismiss payment warning"]').trigger('click');
    expect(banner.emitted('dismiss')).toEqual([[]]);
  });

  it('resolves status and domain semantics while preserving explicit tone precedence', () => {
    const badge = mount(Badge, {
      props: { domain: 'invoice', status: 'past_due', emphasis: 'solid' },
    });
    expect(badge.text()).toBe('Past Due');
    expect(badge.attributes()).toMatchObject({
      'data-domain': 'invoice',
      'data-status': 'past_due',
      'data-tone': 'critical',
    });
    expect(badge.attributes('style')).toContain('--sys-status-critical-surface');

    const banner = mount(Banner, {
      props: { domain: 'subscription', status: 'active' },
    });
    expect(banner.attributes()).toMatchObject({
      role: 'status',
      'aria-live': 'polite',
      'data-domain': 'subscription',
      'data-status': 'active',
      'data-tone': 'success',
    });

    const overridden = mount(Banner, {
      props: { status: 'past_due', tone: 'info' },
    });
    expect(overridden.attributes('data-tone')).toBe('info');
    expect(overridden.attributes('role')).toBe('status');
  });

  it('activates selectable semantic table rows through a real button', async () => {
    const wrapper = mount(Table, {
      props: {
        caption: 'Subscriptions',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
        ],
        rows: [{ id: 'sub-1', name: 'Acme', status: 'Active' }],
        selectable: true,
      },
    });
    await wrapper.get('button[aria-label="Activate row sub-1"]').trigger('click');
    expect(wrapper.emitted('rowActivate')).toEqual([['sub-1']]);
  });
});
