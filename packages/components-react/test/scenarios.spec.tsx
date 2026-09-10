/* @vitest-environment jsdom */

import { NUCLEUS_COMPONENT_IDS, sharedScenarios } from '@oods/component-contracts';
import { cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderSharedScenario } from './scenario-fixtures.js';
import { VizAreaPreview } from '../src/index.js';

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
      const { container, rerender } = render(renderSharedScenario(scenario, { onEvent }));
      const component = container.querySelector(
        `[data-oods-component="${scenario.oodsComponentId}"]`
      );
      expect(component, `${scenario.id} canonical marker`).not.toBeNull();
      expect(container.textContent?.trim().length).toBeGreaterThan(0);

      switch (scenario.id) {
        case 'billing-cycle-progress':
          expect(screen.getByRole('progressbar').getAttribute('value')).toBe('40');
          expect(screen.getByRole('progressbar').getAttribute('aria-label')).toBe('40% complete · 18 days remaining');
          break;
        case 'billing-payment-detail':
          expect(screen.getByRole('log', { name: 'Payments' }).textContent).toContain('Payment method: card');
          expect(component?.textContent).toContain('No payment scheduled');
          expect(component?.textContent).toContain('$19.99 USD');
          break;
        case 'billing-payment-events':
          expect([...component!.querySelectorAll('time')].map((node) => node.getAttribute('datetime'))).toEqual(['2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z']);
          expect(screen.getByRole('log', { name: 'Payment events' }).textContent).toContain('$19.99 USD');
          expect(component?.textContent).not.toContain('Payment method');
          break;
        case 'billing-card-minor-units':
          expect(component?.textContent).toBe('$19.99 · monthly');
          break;
        case 'archived-row-presentation':
          expect(screen.getByRole('group', { name: 'Archived: Team subscription' }).getAttribute('aria-hidden')).toBe('false');
          expect(component?.getAttribute('data-archive-tab')).toBe('Archived');
          expect(component?.textContent).toBe('Archived');
          break;

        case 'billing-summary-minor-units':
          expect(component?.textContent?.trim()).toBe('$19.99 · monthly');
          break;
        case 'billing-amount-half-up': {
          const input = screen.getByRole('textbox', { name: 'Billing amount' });
          fireEvent.change(input, { target: { value: '19.995' } });
          expect(onEvent).toHaveBeenLastCalledWith(2000);
          expect(input.getAttribute('aria-describedby')).toContain('-currency');
          break;
        }
        case 'billing-interval-subscription': {
          const select = screen.getByRole('combobox', { name: 'Billing interval' });
          expect([...select.querySelectorAll('option')].map((option) => option.value)).toEqual(['monthly', 'yearly']);
          await user.selectOptions(select, 'yearly');
          expect(onEvent).toHaveBeenLastCalledWith('yearly');
          break;
        }
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
        case 'card-header-supporting-text': {
          expect(component?.tagName).toBe('HEADER');
          expect(screen.getByRole('heading', { level: 3, name: 'Account summary' })).toBeTruthy();
          expect(component?.querySelector('[data-oods-supporting]')?.textContent).toBe('Current subscription');
          break;
        }
        case 'classification-panel-title-and-summary': {
          expect(component?.tagName).toBe('SECTION');
          expect(component?.getAttribute('data-panel-type')).toBe('classification');
          expect(screen.getByRole('heading', { level: 3, name: 'Classification' })).toBeTruthy();
          expect(component?.querySelector('[data-panel-header] > [data-panel-subtitle]')?.textContent).toBe('Taxonomy and tags');
          expect(component?.querySelector('[data-panel-content] > [data-panel-summary]')?.textContent).toBe('Electronics > Mobile > Android');
          expect(component?.querySelector('button, a, input')).toBeNull();
          break;
        }
        case 'address-collection-panel-title-and-summary':
        case 'membership-panel-title-and-summary':
        case 'preference-panel-title-and-summary': {
          const expected = {
            'address-collection-panel-title-and-summary': { type: 'address', title: 'Addresses', subtitle: 'Billing and shipping', summary: '2 addresses on file' },
            'membership-panel-title-and-summary': { type: 'membership', title: 'Membership', subtitle: 'Roles and permissions', summary: 'Owner of 2 workspaces' },
            'preference-panel-title-and-summary': { type: 'preference', title: 'Preferences', subtitle: 'Namespace: notifications', summary: 'No preferences saved' },
          }[scenario.id];
          expect(component?.tagName).toBe('SECTION');
          expect(component?.getAttribute('data-panel-type')).toBe(expected.type);
          expect(screen.getByRole('heading', { level: 3, name: expected.title })).toBeTruthy();
          expect(component?.querySelector('[data-panel-header] > [data-panel-subtitle]')?.textContent).toBe(expected.subtitle);
          expect(component?.querySelector('[data-panel-content] > [data-panel-summary]')?.textContent).toBe(expected.summary);
          expect(component?.querySelector('button, a, input')).toBeNull();
          break;
        }
        case 'tag-manager-list-and-add-control': {
          expect(component?.tagName).toBe('FORM');
          expect(component?.getAttribute('data-form-type')).toBe('tag-manager');
          expect(screen.getByRole('heading', { level: 3, name: 'Tags' })).toBeTruthy();
          expect([...component!.querySelectorAll('[data-tag-list] > [data-tag-item]')].map(item => item.textContent)).toEqual(['alpha', 'beta']);
          const input = screen.getByRole('textbox', { name: 'Add Tag' }) as HTMLInputElement;
          expect(input.name).toBe('newTag');
          expect(input.placeholder).toBe('Type a tag');
          await user.type(input, 'gamma{Enter}');
          expect(input.value).toBe('gamma');
          expect(component!.querySelectorAll('[data-tag-item]')).toHaveLength(2);
          break;
        }
        case 'address-summary-badge-role':
        case 'message-status-badge-delivery':
        case 'preference-summary-badge-namespace-and-version': {
          const expected = {
            'address-summary-badge-role': { label: 'Billing address', status: 'billing', variant: 'address' },
            'message-status-badge-delivery': { label: 'delivered', status: 'delivered', variant: 'message' },
            'preference-summary-badge-namespace-and-version': { label: 'notifications', status: 'v3', variant: 'preference' },
          }[scenario.id];
          expect(component?.classList.contains('oods-badge')).toBe(true);
          expect(component?.querySelector('[data-oods-badge-label]')?.textContent).toBe(expected.label);
          expect(component?.getAttribute('data-badge-status')).toBe(expected.status);
          expect(component?.getAttribute('data-badge-variant')).toBe(expected.variant);
          expect(component?.getAttribute('data-status')).toBe(expected.status);
          expect(component?.hasAttribute('role')).toBe(false);
          expect(component?.querySelector('button, a, input')).toBeNull();
          break;
        }
        case 'role-badge-list-items': {
          expect(component?.tagName).toBe('SPAN');
          expect(component?.getAttribute('data-badge-variant')).toBe('session');
          expect([...component!.querySelectorAll('[data-role-badge]')].map(item => item.textContent)).toEqual(['owner', 'billing-admin']);
          expect(component?.querySelector('button, a, input')).toBeNull();
          break;
        }
        case 'tag-pills-overflow-template': {
          expect(component?.tagName).toBe('DIV');
          expect(component?.getAttribute('data-summary-type')).toBe('tag-pills');
          expect([...component!.querySelectorAll('[data-tag-pill]')].map(item => item.textContent)).toEqual(['alpha', 'beta', 'gamma']);
          // The template is substituted with the total tag count, exactly as renderTagPills does.
          expect(component?.querySelector('[data-tag-overflow]')?.textContent).toBe('+5');
          expect(component?.textContent).not.toContain('{{');
          break;
        }
        case 'address-validation-timeline-events': {
          expect(screen.getByRole('log', { name: 'Address checks' })).toBe(component);
          expect(component?.getAttribute('data-timeline-type')).toBe('address-validation');
          expect(screen.getByRole('heading', { level: 3, name: 'Address checks' })).toBeTruthy();
          const items = [...component!.querySelectorAll('[data-timeline-events] > li')];
          expect(items).toHaveLength(2);
          expect(items[0]!.querySelector('[data-timeline-label]')?.textContent).toBe('Postal code verified');
          expect(items[0]!.querySelector('time[data-timeline-time]')?.getAttribute('datetime')).toBe('2026-09-05T12:00:00Z');
          expect(items[0]!.querySelector('[data-timeline-detail]')?.textContent).toBe('Matched carrier database');
          expect(items[1]!.querySelector('[data-timeline-label]')?.textContent).toBe('Geocoded');
          expect(component?.querySelector('[data-timeline-empty]')).toBeNull();
          break;
        }
        case 'audit-event-type-and-timestamp': {
          expect(component?.tagName).toBe('ARTICLE');
          expect(component?.getAttribute('data-event-type')).toBe('audit');
          expect(component?.querySelector('time[data-event-time]')?.getAttribute('datetime')).toBe('2026-09-05T12:00:00Z');
          expect(component?.querySelector('[data-event-label]')?.textContent).toBe('user.updated');
          expect(component?.querySelector('[data-event-detail]')?.textContent).toBe('Display name changed');
          break;
        }
        case 'membership-audit-timeline-empty': {
          expect(screen.getByRole('log', { name: 'Membership history' })).toBe(component);
          expect(component?.getAttribute('data-timeline-type')).toBe('membership');
          expect(component?.querySelectorAll('[data-timeline-events] > li')).toHaveLength(1);
          expect(component?.querySelector('[data-timeline-empty]')?.textContent).toBe('No events');
          break;
        }
        case 'message-event-timeline-statuses': {
          expect(screen.getByRole('log', { name: 'Delivery' })).toBe(component);
          expect(component?.getAttribute('data-timeline-type')).toBe('message');
          expect(component?.querySelector('[data-timeline-label]')?.textContent).toBe('delivered');
          expect(component?.querySelector('time[data-timeline-time]')?.getAttribute('datetime')).toBe('2026-09-02T09:00:00Z');
          break;
        }
        case 'preference-timeline-changes': {
          expect(screen.getByRole('log', { name: 'Preference changes' })).toBe(component);
          expect(component?.getAttribute('data-timeline-type')).toBe('preference');
          expect(component?.querySelector('[data-timeline-label]')?.textContent).toBe('notifications.email');
          expect(component?.querySelector('time[data-timeline-time]')?.getAttribute('datetime')).toBe('2026-09-03T08:00:00Z');
          expect(component?.querySelector('[data-timeline-detail]')?.textContent).toBe('Enabled');
          break;
        }
        case 'address-editor-fields-and-change': {
          expect(component?.tagName).toBe('FORM');
          expect(component?.getAttribute('data-form-type')).toBe('address-editor');
          expect(screen.getByRole('heading', { level: 3, name: 'Shipping address' })).toBeTruthy();
          expect((screen.getByLabelText('Street') as HTMLInputElement).value).toBe('1 Main St');
          expect((screen.getByLabelText('Region') as HTMLInputElement).value).toBe('IL');
          expect((screen.getByLabelText('Postal Code') as HTMLInputElement).value).toBe('62701');
          fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Shelbyville' } });
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith({ street: '1 Main St', city: 'Shelbyville', region: 'IL', postalCode: '62701' });
          const submit = createEvent.submit(component!);
          fireEvent(component!, submit);
          expect(submit.defaultPrevented).toBe(true);
          break;
        }
        case 'preference-editor-namespace-and-document': {
          expect(component?.tagName).toBe('FORM');
          expect(component?.getAttribute('data-form-type')).toBe('preference-editor');
          expect(screen.getByRole('heading', { level: 3, name: 'Preferences' })).toBeTruthy();
          const namespace = screen.getByLabelText('Namespace') as HTMLSelectElement;
          expect([...namespace.options].map(option => option.textContent)).toEqual(['notifications', 'billing']);
          expect(namespace.value).toBe('billing');
          expect((screen.getByLabelText('Preference Document') as HTMLTextAreaElement).value).toBe('{"email":true}');
          expect(component?.querySelector('button')).toBeNull();
          break;
        }
        case 'role-assignment-form-roles': {
          expect(component?.tagName).toBe('FORM');
          expect(component?.getAttribute('data-form-type')).toBe('role-assignment');
          expect(screen.getByRole('heading', { level: 3, name: 'Assign role' })).toBeTruthy();
          const role = screen.getByLabelText('Role') as HTMLSelectElement;
          expect([...role.options].map(option => [option.value, option.textContent])).toEqual([['owner', 'Owner'], ['viewer', 'viewer']]);
          expect(role.value).toBe('viewer');
          expect((screen.getByLabelText('Assignee') as HTMLInputElement).value).toBe('ada@example.test');
          break;
        }
        case 'status-selector-controlled': {
          expect(component?.getAttribute('data-summary-type')).toBe('status-selector');
          const select = screen.getByLabelText('Status') as HTMLSelectElement;
          expect(select.name).toBe('status');
          expect([...select.options].map(option => option.value)).toEqual(['draft', 'active']);
          expect(select.value).toBe('active');
          await user.selectOptions(select, 'draft');
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith('draft');
          break;
        }
        case 'tag-input-typed-text': {
          expect(component?.tagName).toBe('FIELDSET');
          expect(component?.getAttribute('data-form-type')).toBe('tag-input');
          expect(component?.querySelector('legend')?.textContent).toBe('Tags');
          const input = screen.getByLabelText('Tag') as HTMLInputElement;
          expect(input.value).toBe('be');
          expect(input.placeholder).toBe('Add a tag');
          expect([...component!.querySelectorAll('[data-tag-item]')].map(item => item.textContent)).toEqual(['alpha']);
          fireEvent.change(input, { target: { value: 'beta' } });
          expect(onEvent).toHaveBeenCalledTimes(1);
          expect(onEvent).toHaveBeenCalledWith('beta');
          break;
        }
        case 'template-picker-selects': {
          expect(component?.tagName).toBe('FIELDSET');
          expect(component?.getAttribute('data-form-type')).toBe('template-picker');
          expect(component?.querySelector('legend')?.textContent).toBe('Notification template');
          const template = screen.getByLabelText('Template') as HTMLSelectElement;
          expect([...template.options].map(option => [option.value, option.textContent])).toEqual([['welcome', 'Welcome']]);
          expect(template.value).toBe('welcome');
          const channel = screen.getByLabelText('Channel') as HTMLSelectElement;
          expect([...channel.options].map(option => option.value)).toEqual(['email', 'sms']);
          expect(channel.value).toBe('sms');
          break;
        }
        case 'filter-panel-batch-mode': {
          expect(screen.getByRole('region', { name: 'Filters' })).toBe(component);
          expect(component?.getAttribute('data-filter-mode')).toBe('batch');
          expect([...component!.querySelectorAll('legend')].map(legend => legend.textContent)).toEqual(['Status', 'release_channel']);
          expect(component?.querySelectorAll('fieldset[data-collapsible="true"]')).toHaveLength(2);
          const live = component?.querySelector('[data-active-filters]');
          expect(live?.getAttribute('aria-live')).toBe('polite');
          expect(live?.querySelector('[data-filter-count]')?.textContent).toBe('1 active');
          expect(screen.getByRole('button', { name: 'Clear all' }).getAttribute('type')).toBe('button');
          expect(screen.getByRole('button', { name: 'Apply' }).getAttribute('type')).toBe('button');
          break;
        }
        case 'price-summary-terms': {
          expect(component?.tagName).toBe('SECTION');
          expect(component?.getAttribute('data-summary-type')).toBe('price');
          expect(screen.getByRole('heading', { level: 3, name: 'Price Summary' })).toBeTruthy();
          expect([...component!.querySelectorAll('[data-summary-item]')].map(item => (
            [item.querySelector('dt')?.textContent, item.querySelector('dd')?.textContent]
          ))).toEqual([['Amount', '129900'], ['Currency', 'USD'], ['Model', 'recurring'], ['Interval', 'month']]);
          expect(component?.querySelector('button, a, input')).toBeNull();
          break;
        }
        case 'detail-header-heading-level': {
          expect(component?.tagName).toBe('HEADER');
          expect(screen.getByRole('heading', { level: 1, name: 'Subscription details' })).toBeTruthy();
          expect(component?.querySelector('[data-oods-subtitle]')?.textContent).toBe('Pro plan');
          expect(component?.querySelector('[data-oods-metadata]')?.textContent).toBe('Renews monthly');
          break;
        }
        case 'color-swatch-label-and-chip': {
          expect(component?.getAttribute('data-swatch-color')).toBe('#2563eb');
          expect((component as HTMLElement).style.getPropertyValue('--oods-swatch-color')).toBe('#2563eb');
          expect(component?.querySelector('[data-oods-swatch-chip]')?.getAttribute('aria-hidden')).toBe('true');
          expect(component?.querySelector('[data-oods-swatch-label]')?.textContent).toBe('Ocean blue');
          expect(component?.querySelector('button, a, input')).toBeNull();
          break;
        }
        case 'colorized-badge-color-marker': {
          expect(component?.classList.contains('oods-badge')).toBe(true);
          expect(component?.getAttribute('data-badge-color')).toBe('#15803d');
          expect(component?.getAttribute('data-badge-status')).toBe('active');
          expect(component?.getAttribute('data-badge-variant')).toBe('colorized');
          expect(component?.getAttribute('data-tone')).toBe('success');
          expect((component as HTMLElement).style.getPropertyValue('--oods-badge-color')).toBe('#15803d');
          expect(component?.querySelector('[data-oods-badge-marker]')?.getAttribute('aria-hidden')).toBe('true');
          expect(component?.querySelector('[data-oods-badge-label]')?.textContent).toBe('Approved');
          expect(component?.querySelector('button, a, input')).toBeNull();
          break;
        }
        case 'viz-area-preview-frame-placeholder-and-slot': {
          expect(component?.getAttribute('data-viz-preview-type')).toBe('area');
          expect(component?.getAttribute('data-viz-width')).toBe('640');
          expect(component?.getAttribute('data-viz-height')).toBe('360');
          expect(component?.textContent).toBe('Authored area preview content');
          expect(component?.querySelector('[data-viz-preview-placeholder]')).toBeNull();
          rerender(<VizAreaPreview {...scenario.props} />);
          expect(container.querySelector('[data-viz-preview-placeholder]')?.textContent).toBe('Area preview (640 x 360)');
          rerender(renderSharedScenario(scenario));
          expect(container.querySelector('[data-viz-preview-placeholder]')).toBeNull();
          expect(container.textContent).toBe('Authored area preview content');
          expect(container.querySelector('svg, canvas')).toBeNull();
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
        case 'audit-timeline-transitions': {
          expect(component?.getAttribute('role')).toBe('log');
          expect(component?.querySelector('time')?.getAttribute('datetime')).toBe('2026-09-05T12:00:00Z');
          expect(component?.querySelector('.oods-timeline__label')?.textContent).toBe('Subscription created');
          break;
        }
        case 'cancellation-summary-boolean': {
          expect(component?.querySelector('dt')?.textContent).toBe('Cancel at period end');
          expect(component?.querySelector('dd')?.textContent).toBe('Yes');
          expect(component?.textContent).not.toContain('true');
          break;
        }
        case 'pagination-bar-navigation': {
          expect(component?.getAttribute('aria-label')).toBe('Pagination');
          expect(component?.querySelector('[aria-current="page"]')?.textContent).toBe('2');
          expect(component?.querySelector('[data-pagination-range]')?.textContent).toBe('Showing 26–50 of 80');
          await user.click(screen.getByRole('button', { name: 'Next page' }));
          expect(onEvent).toHaveBeenCalledExactlyOnceWith(3);
          break;
        }
        case 'price-badge-currency': {
          expect(component?.getAttribute('data-price')).toBe('true');
          expect(component?.getAttribute('data-badge-variant')).toBe('price');
          expect(component?.getAttribute('data-currency')).toBe('USD');
          expect(component?.textContent).toMatch(/\$25\.00|US\$25\.00/);
          break;
        }
        case 'relative-timestamp-fixed': {
          expect(component?.tagName).toBe('TIME');
          expect(component?.getAttribute('datetime')).toBe('2026-09-05T12:00:00.000Z');
          expect(component?.textContent).toBe('2 hours ago');
          break;
        }
        case 'search-input-clear': {
          expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('past due');
          await user.click(screen.getByRole('button', { name: 'Clear search' }));
          expect(onEvent).toHaveBeenCalledExactlyOnceWith('');
          break;
        }
        case 'status-badge-mapped': {
          expect(component?.textContent).toContain('Past Due');
          expect(component?.getAttribute('data-tone')).toBe('critical');
          expect(component?.getAttribute('title')).toContain('Renewal payment failed');
          break;
        }
        case 'status-timeline-history': {
          // The reviewed timeline names the current status; transition actions are not summary copy.
          expect(component?.querySelector('[data-timeline-current]')?.textContent).toBe('Current status: Active');
          expect(component?.querySelector('[data-timeline-empty]')?.textContent).toBe('No events');
          break;
        }
        case 'label-cell-truncation-and-description': {
          expect(component?.querySelector('[data-oods-label-cell-primary]')?.textContent).toBe('Long pr...');
          expect(component?.querySelector('[data-oods-label-cell-description]')?.textContent).toBe('Long su...');
          break;
        }
        case 'inline-label-truncation': {
          expect(component?.textContent).toBe('Long in...');
          break;
        }
        case 'form-label-group-association': {
          expect(component?.getAttribute('for')).toBe('product-name');
          expect(component?.querySelector('[data-oods-form-label]')?.textContent).toBe('Product name');
          expect(component?.querySelector('[data-oods-form-hint]')?.textContent).toBe('Name shown to customers');
          break;
        }
        case 'classification-badge-category': {
          expect(component?.querySelector('[data-oods-badge-label]')?.textContent).toBe('Electronics');
          expect(component?.getAttribute('data-badge-status')).toBe('strict');
          expect(component?.getAttribute('data-badge-variant')).toBe('classification');
          break;
        }
        case 'classification-editor-presentational-controls': {
          expect(component?.querySelector('h3')?.textContent).toBe('Product classification');
          expect((component?.querySelector('[name="category"]') as HTMLInputElement).value).toBe('Electronics');
          expect((component?.querySelector('[name="tags"]') as HTMLInputElement).value).toBe('["alpha","beta"]');
          expect((component?.querySelector('[name="mode"]') as HTMLSelectElement).value).toBe('flexible');
          break;
        }
        case 'owner-badge-principal': {
          expect(component?.textContent).toBe('user-7');
          expect(component?.getAttribute('data-badge-variant')).toBe('owner');
          break;
        }
        case 'ownership-summary-terms': {
          expect(component?.querySelector('h3')?.textContent).toBe('Ownership Summary');
          expect([...component!.querySelectorAll('dd')].map((node) => node.textContent)).toEqual(['user-7', 'person', 'administrator']);
          expect(component?.hasAttribute('role')).toBe(false);
          break;
        }
        case 'ownership-meta-inline-terms': {
          expect(component?.querySelector('[data-meta-title]')?.textContent).toBe('Ownership');
          expect([...component!.querySelectorAll('[data-meta-item]')].map((node) => node.textContent)).toEqual(['Owner Type: organization', 'Role: custodian']);
          expect(component?.hasAttribute('role')).toBe(false);
          break;
        }
        case 'tag-summary-zero-and-tags': {
          expect([...component!.querySelectorAll('dd')].map((node) => node.textContent)).toEqual(['0', 'alpha, beta']);
          break;
        }
        case 'archive-pill-false':
        case 'cancellation-badge-false': {
          expect(component?.textContent).toBe('false');
          expect(component?.getAttribute('data-badge-status')).toBe('false');
          break;
        }
        case 'archive-summary-false-and-reason': {
          // Preserve false as the human-readable Archived answer and format the associated timestamp.
          expect([...component!.querySelectorAll('dd')].map((node) => node.textContent)).toEqual(['No', 'Sep 5, 2026, 12:00 PM', 'Retention policy']);
          break;
        }
        case 'cancellation-form-presentational-controls': {
          expect(component?.querySelector<HTMLSelectElement>('select[name="reasonCode"]')?.value).toBe('budget');
          expect(component?.querySelector<HTMLTextAreaElement>('textarea[name="reason"]')?.value).toBe('Costs changed');
          break;
        }
        case 'price-card-meta-inline-terms': {
          expect([...component!.querySelectorAll('[data-meta-item]')].map((node) => node.textContent)).toEqual(['Model: flat', 'Interval: monthly']);
          break;
        }
        default:
          throw new Error(`Missing executable React assertion for ${scenario.id}`);
      }
    });
  }
});
