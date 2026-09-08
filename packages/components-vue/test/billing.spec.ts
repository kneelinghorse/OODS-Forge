import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { BillingAmountInput, BillingIntervalSelector, BillingSummaryBadge } from '../src/index.js';

describe('Billable value semantics', () => {
  it.each([[1999, 'usd', 100, '$19.99'], [0, 'usd', 100, '$0.00'], [1999, 'jpy', 1, '¥1,999']] as const)('announces minor-unit amount %s with its interval', (amount, currency, minorUnits, text) => {
    const wrapper = mount(BillingSummaryBadge, { props: { amount, currency, minorUnits, interval: 'monthly' } });
    expect(wrapper.text()).toBe(`${text} · monthly`);
    wrapper.unmount();
  });
  it('preserves integer storage, rounds half up, rejects negatives and leaves blank undefined', async () => {
    const wrapper = mount(BillingAmountInput, { props: { amount: 1234 } });
    const input = wrapper.get('input');
    for (const text of ['19.99', '1.005', '0', '']) await input.setValue(text);
    expect(wrapper.emitted('change')).toEqual([[1999], [101], [0], [undefined]]);
    await input.setValue('-1');
    expect(wrapper.emitted('change')).toHaveLength(4);
    expect(input.element.value).toBe('-1');
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(wrapper.get('[role="alert"]').text()).toBe('Enter a non-negative amount.');
    expect(input.attributes('aria-describedby')).toContain(wrapper.get('[role="alert"]').attributes('id'));
    expect(input.element.checkValidity()).toBe(false);
    wrapper.unmount();
  });
  it('shows invalid intervals without silently selecting a valid value', () => {
    const wrapper = mount(BillingIntervalSelector, { props: { interval: 'weekly', intervals: ['monthly', 'yearly'] } });
    const select = wrapper.get('select');
    expect(select.element.value).toBe('weekly');
    expect(select.attributes('aria-invalid')).toBe('true');
    expect(select.attributes('aria-describedby')).toBe(wrapper.get('[role="alert"]').attributes('id'));
    expect(wrapper.findAll('option:not([disabled])').map((option) => option.attributes('value'))).toEqual(['monthly', 'yearly']);
    wrapper.unmount();
  });
});
