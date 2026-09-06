import { NUCLEUS_COMPONENT_IDS, sharedScenarios } from '@oods/component-contracts';
import { mount } from '@vue/test-utils';
import { h, nextTick, type Component, type Slot } from 'vue';
import { describe, expect, it } from 'vitest';

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

const implementations: Readonly<Record<string, Component>> = {
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
};

function scenarioSlots(values: Readonly<Record<string, unknown>>): Record<string, Slot> {
  return Object.fromEntries(Object.entries(values).map(([name, value]) => [
    name,
    () => (Array.isArray(value)
      ? value.map((entry, index) => h('span', { key: index }, String(entry)))
      : h('span', {}, String(value))),
  ]));
}

describe('@oods/components-vue shared scenarios', () => {
  it('maps exactly one frozen nondegenerate scenario to every canonical component', () => {
    expect(sharedScenarios.map((scenario) => scenario.oodsComponentId)).toEqual(NUCLEUS_COMPONENT_IDS);
    expect(new Set(sharedScenarios.map((scenario) => scenario.id)).size).toBe(NUCLEUS_COMPONENT_IDS.length);
  });

  for (const scenario of sharedScenarios) {
    it(`${scenario.id} executes the ${scenario.oodsComponentId} contract`, async () => {
      const implementation = implementations[scenario.oodsComponentId];
      expect(implementation, scenario.id).toBeDefined();
      const wrapper = mount(implementation, {
        attachTo: document.body,
        props: scenario.id === 'badge-status'
          ? { ...scenario.props, icon: '!' }
          : scenario.props,
        slots: scenarioSlots(scenario.slots),
      });

      try {
        const component = wrapper.get(`[data-oods-component="${scenario.oodsComponentId}"]`);
        expect(component.text().trim().length, `${scenario.id} non-empty content`).toBeGreaterThan(0);

        switch (scenario.id) {
          case 'badge-status': {
            expect(component.text()).toContain('Past due');
            expect(component.attributes('data-tone')).toBe('critical');
            expect(component.get('[aria-hidden="true"]').text()).toBe('!');
            expect(component.find('button, a, input').exists()).toBe(false);
            break;
          }
          case 'banner-dismissible': {
            expect(component.attributes('role')).toBe('alert');
            expect(component.text()).toContain('Payment failed');
            expect(component.text()).toContain('Update card');
            const dismiss = component.get('button[aria-label="Dismiss payment warning"]');
            await dismiss.trigger('click');
            expect(wrapper.emitted('dismiss')).toEqual([[]]);
            break;
          }
          case 'button-activate': {
            expect(component.attributes('type')).toBe('button');
            (component.element as HTMLButtonElement).focus();
            await component.trigger('click');
            expect(wrapper.emitted('activate')).toHaveLength(1);
            expect(document.activeElement).toBe(component.element);
            break;
          }
          case 'card-elevated-content': {
            expect(component.element.tagName).toBe('DIV');
            expect(component.attributes('data-elevated')).toBe('true');
            expect(component.text()).toBe('Account summary');
            break;
          }
          case 'checkbox-controlled': {
            const checkbox = component.get('input[type="checkbox"]');
            expect((checkbox.element as HTMLInputElement).checked).toBe(false);
            expect((checkbox.element as HTMLInputElement).required).toBe(true);
            expect(component.get('label').attributes('for')).toBe('marketing');
            expect(component.get('.oods-field-required').text()).toBe('*');
            expect(component.get('.oods-field-required').attributes('aria-hidden')).toBe('true');
            expect(checkbox.attributes('aria-describedby')).toBe('marketing-help');
            expect(component.get('#marketing-help').text()).toBe('Choose whether to subscribe');
            await checkbox.setValue(true);
            expect(wrapper.emitted('change')).toEqual([[true]]);
            expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
            break;
          }
          case 'date-picker-bounded': {
            const input = component.get('input');
            expect(component.get('label').attributes('for')).toBe('renewal');
            expect((input.element as HTMLInputElement).value).toBe('2026-09-30');
            expect(input.attributes()).toMatchObject({
              type: 'date',
              min: '2026-09-01',
              max: '2026-12-31',
              step: '1',
            });
            await input.setValue('2026-10-01');
            expect(wrapper.emitted('change')).toEqual([['2026-10-01']]);
            expect(wrapper.emitted('update:modelValue')).toEqual([['2026-10-01']]);
            break;
          }
          case 'grid-responsive': {
            const originalWidth = window.innerWidth;
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 });
            window.dispatchEvent(new Event('resize'));
            await nextTick();
            expect(component.findAll(':scope > span').map((child) => child.text())).toEqual([
              'First card',
              'Second card',
            ]);
            expect(component.attributes('style')).toContain('--oods-grid-min-column: 16rem');
            expect(component.attributes('style')).toContain('--cmp-spacing-stack-default');
            expect(component.attributes('style')).toContain('--oods-layout-align: stretch');
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
            window.dispatchEvent(new Event('resize'));
            await nextTick();
            expect(component.text()).toBe('First cardSecond card');
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
            break;
          }
          case 'input-invalid': {
            const input = component.get('input');
            expect(component.get('label').attributes('for')).toBe('email');
            expect((input.element as HTMLInputElement).value).toBe('invalid');
            expect((input.element as HTMLInputElement).required).toBe(true);
            expect(input.attributes('aria-invalid')).toBe('true');
            expect(input.attributes('aria-describedby')).toBe('email-help email-validation');
            expect(component.get('#email-validation').text()).toBe('Enter a valid email');
            await input.setValue('user@example.com');
            expect(wrapper.emitted('input')).toEqual([['user@example.com']]);
            expect(wrapper.emitted('update:modelValue')).toEqual([['user@example.com']]);
            break;
          }
          case 'select-controlled': {
            const select = component.get('select');
            expect(component.get('label').attributes('for')).toBe('plan');
            expect((select.element as HTMLSelectElement).value).toBe('pro');
            expect((select.element as HTMLSelectElement).selectedOptions[0]?.textContent).toBe('Pro');
            await select.setValue('basic');
            expect(wrapper.emitted('change')).toEqual([['basic']]);
            expect(wrapper.emitted('update:modelValue')).toEqual([['basic']]);
            break;
          }
          case 'stack-wrapped-row': {
            const originalWidth = window.innerWidth;
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 });
            window.dispatchEvent(new Event('resize'));
            await nextTick();
            expect(component.findAll(':scope > span').map((child) => child.text())).toEqual([
              'Primary',
              'Secondary',
            ]);
            expect(component.attributes('style')).toContain('--oods-stack-direction: row');
            expect(component.attributes('style')).toContain('--oods-stack-wrap: wrap');
            expect(component.attributes('style')).toContain('--cmp-spacing-inline-sm');
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
            break;
          }
          case 'table-selectable-row': {
            expect(component.get('caption').text()).toBe('Subscriptions');
            expect(component.findAll('thead th').map((cell) => cell.text())).toEqual([
              'Name',
              'Status',
            ]);
            expect(component.findAll('tbody td').map((cell) => cell.text())).toEqual([
              'Acme',
              'Active',
            ]);
            const rowAction = component.get('tbody td:first-child .oods-table-row-action');
            expect(rowAction.text()).toBe('Acme');
            expect(rowAction.attributes('aria-label')).toBeUndefined();
            (rowAction.element as HTMLButtonElement).focus();
            await rowAction.trigger('keydown', { key: 'Enter' });
            // JSDOM does not synthesize a native button's default keyboard click.
            (rowAction.element as HTMLButtonElement).click();
            await nextTick();
            expect(wrapper.emitted('rowActivate')).toEqual([['sub-1']]);
            break;
          }
          case 'tabs-keyboard': {
            expect(component.get('[role="tablist"]').attributes('aria-label')).toBe('Account sections');
            const overview = component.get('[data-tab-id="overview"]');
            overview.element.focus();
            await overview.trigger('keydown', { key: 'ArrowRight' });
            await nextTick();
            const billing = component.get('[data-tab-id="billing"]');
            expect(billing.attributes('aria-selected')).toBe('true');
            expect(document.activeElement).toBe(billing.element);
            expect(component.get('[role="tabpanel"]:not([hidden])').text()).toBe('Invoices');
            expect(component.get('[role="tabpanel"][hidden]').text()).toBe('Summary');
            expect(wrapper.emitted('change')).toEqual([['billing']]);
            break;
          }
          case 'text-semantic': {
            expect(component.element.tagName).toBe('STRONG');
            expect(component.text()).toBe('Account owner');
            expect(component.attributes('data-weight')).toBe('semibold');
            break;
          }
          case 'textarea-controlled': {
            const textarea = component.get('textarea');
            expect(component.get('label').attributes('for')).toBe('notes');
            expect((textarea.element as HTMLTextAreaElement).value).toBe('Call before renewal');
            expect((textarea.element as HTMLTextAreaElement).rows).toBe(4);
            expect(textarea.attributes('aria-describedby')).toBe('notes-help');
            expect(component.get('#notes-help').text()).toBe('Visible to account managers');
            const nextValue = 'Call before renewal. Confirm owner.';
            await textarea.setValue(nextValue);
            expect(wrapper.emitted('input')).toEqual([[nextValue]]);
            expect(wrapper.emitted('update:modelValue')).toEqual([[nextValue]]);
            break;
          }
          default:
            throw new Error(`Missing executable Vue assertion for ${scenario.id}`);
        }
      } finally {
        wrapper.unmount();
      }
    });
  }
});
