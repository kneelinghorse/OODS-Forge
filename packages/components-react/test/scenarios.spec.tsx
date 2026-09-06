/* @vitest-environment jsdom */

import { NUCLEUS_COMPONENT_IDS, sharedScenarios } from '@oods/component-contracts';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderSharedScenario } from './scenario-fixtures.js';

afterEach(cleanup);

describe('@oods/components-react shared scenarios', () => {
  it('maps exactly one frozen nondegenerate scenario to every canonical component', () => {
    expect(sharedScenarios.map(scenario => scenario.oodsComponentId)).toEqual(
      NUCLEUS_COMPONENT_IDS
    );
    expect(new Set(sharedScenarios.map(scenario => scenario.id)).size).toBe(NUCLEUS_COMPONENT_IDS.length);
  });

  for (const scenario of sharedScenarios) {
    it(`${scenario.id} executes the ${scenario.oodsComponentId} contract`, async () => {
      const user = userEvent.setup();
      const onEvent = vi.fn();
      const { container } = render(renderSharedScenario(scenario, { onEvent }));
      const component = container.querySelector(
        `[data-oods-component="${scenario.oodsComponentId}"]`
      );
      expect(component, `${scenario.id} canonical marker`).not.toBeNull();
      expect(container.textContent?.trim().length).toBeGreaterThan(0);

      switch (scenario.id) {
        case 'badge-status': {
          expect(component?.textContent).toContain('Past due');
          expect(component?.getAttribute('data-tone')).toBe('critical');
          expect(component?.querySelector('[aria-hidden="true"]')?.textContent).toBe('!');
          expect(component?.querySelector('button, a, input')).toBeNull();
          break;
        }
        case 'banner-dismissible': {
          expect(screen.getByRole('alert').textContent).toContain('Payment failed');
          await user.click(screen.getByRole('button', { name: 'Dismiss payment warning' }));
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(screen.getByRole('button', { name: 'Update card' })).toBeTruthy();
          break;
        }
        case 'button-activate': {
          const button = screen.getByRole('button', { name: 'Save changes' });
          expect(button.getAttribute('type')).toBe('button');
          await user.click(button);
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(document.activeElement).toBe(button);
          break;
        }
        case 'card-elevated-content': {
          expect(component?.tagName).toBe('DIV');
          expect(component?.getAttribute('data-elevated')).toBe('true');
          expect(component?.textContent).toBe('Account summary');
          break;
        }
        case 'checkbox-controlled': {
          const checkbox = screen.getByRole('checkbox', { name: 'Product updates' }) as HTMLInputElement;
          expect(checkbox.checked).toBe(false);
          expect(checkbox.required).toBe(true);
          expect(checkbox.getAttribute('aria-describedby')).toBe('marketing-description');
          expect(document.getElementById('marketing-description')?.textContent).toBe(
            'Choose whether to subscribe'
          );
          await user.click(checkbox);
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith(true);
          break;
        }
        case 'date-picker-bounded': {
          const input = screen.getByLabelText('Renewal date') as HTMLInputElement;
          expect(input.type).toBe('date');
          expect(input.value).toBe('2026-09-30');
          expect(input.min).toBe('2026-09-01');
          expect(input.max).toBe('2026-12-31');
          expect(input.step).toBe('1');
          fireEvent.change(input, { target: { value: '2026-10-01' } });
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith('2026-10-01');
          break;
        }
        case 'grid-responsive': {
          const grid = component as HTMLElement;
          expect([...grid.children].map(child => child.textContent)).toEqual([
            'First card',
            'Second card',
          ]);
          expect(grid.style.getPropertyValue('--oods-grid-columns')).toBe('auto-fit');
          expect(grid.style.getPropertyValue('--oods-grid-min-column')).toBe('16rem');
          expect(grid.style.getPropertyValue('--oods-layout-gap')).toContain('--cmp-spacing-stack-default');
          expect(grid.style.getPropertyValue('--oods-layout-align')).toBe('stretch');
          break;
        }
        case 'input-invalid': {
          const input = screen.getByRole('textbox', { name: 'Email' }) as HTMLInputElement;
          expect(input.value).toBe('invalid');
          expect(input.required).toBe(true);
          expect(input.getAttribute('aria-invalid')).toBe('true');
          expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual([
            'email-description',
            'email-validation',
          ]);
          expect(document.getElementById('email-validation')?.textContent).toBe(
            'Enter a valid email'
          );
          fireEvent.change(input, { target: { value: 'user@example.com' } });
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith('user@example.com');
          break;
        }
        case 'select-controlled': {
          const select = screen.getByLabelText('Plan') as HTMLSelectElement;
          expect(select.value).toBe('pro');
          expect(select.selectedOptions[0]?.textContent).toBe('Pro');
          await user.selectOptions(select, 'basic');
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith('basic');
          break;
        }
        case 'stack-wrapped-row': {
          const stack = component as HTMLElement;
          expect([...stack.children].map(child => child.textContent)).toEqual([
            'Primary',
            'Secondary',
          ]);
          expect(stack.getAttribute('data-direction')).toBe('row');
          expect(stack.getAttribute('data-wrap')).toBe('true');
          expect(stack.style.getPropertyValue('--oods-stack-wrap')).toBe('wrap');
          expect(stack.style.getPropertyValue('--oods-layout-gap')).toContain('--cmp-spacing-inline-sm');
          break;
        }
        case 'table-selectable-row': {
          const table = screen.getByRole('table', { name: 'Subscriptions' });
          expect([...table.querySelectorAll('th')].map(cell => cell.textContent)).toEqual([
            'Name',
            'Status',
          ]);
          expect([...table.querySelectorAll('tbody td')].map(cell => cell.textContent)).toEqual([
            'Acme',
            'Active',
          ]);
          const rowAction = screen.getByRole('button', { name: 'Acme' });
          rowAction.focus();
          await user.keyboard('{Enter}');
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith('sub-1');
          break;
        }
        case 'tabs-keyboard': {
          expect(screen.getByRole('tablist', { name: 'Account sections' })).toBeTruthy();
          const overview = screen.getByRole('tab', { name: 'Overview' });
          overview.focus();
          await user.keyboard('{ArrowRight}');
          const billing = screen.getByRole('tab', { name: 'Billing' });
          expect(billing.getAttribute('aria-selected')).toBe('true');
          expect(document.activeElement).toBe(billing);
          expect(screen.getByRole('tabpanel').textContent).toBe('Invoices');
          const panels = [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
          expect(panels).toHaveLength(2);
          expect(panels.find(panel => panel.hidden)?.textContent).toBe('');
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith('billing');
          break;
        }
        case 'text-semantic': {
          expect(component?.tagName).toBe('STRONG');
          expect(component?.textContent).toBe('Account owner');
          expect(component?.getAttribute('data-weight')).toBe('semibold');
          break;
        }
        case 'textarea-controlled': {
          const textarea = screen.getByLabelText('Notes') as HTMLTextAreaElement;
          expect(textarea.value).toBe('Call before renewal');
          expect(textarea.rows).toBe(4);
          expect(textarea.getAttribute('aria-describedby')).toBe('notes-description');
          const nextValue = 'Call before renewal. Confirm owner.';
          fireEvent.change(textarea, { target: { value: nextValue } });
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith(nextValue);
          break;
        }
        default:
          throw new Error(`Missing executable React assertion for ${scenario.id}`);
      }
    });
  }
});
