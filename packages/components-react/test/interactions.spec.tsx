/* @vitest-environment jsdom */

import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
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

afterEach(cleanup);

describe('@oods/components-react interactions', () => {
  it('does not steal existing focus while hydrating Tabs', async () => {
    const items: TabItem[] = [
      { id: 'overview', label: 'Overview', panel: 'Summary' },
      { id: 'billing', label: 'Billing', panel: 'Invoices' },
    ];
    const tabs = <Tabs items={items} defaultSelectedId="overview" />;
    const sentinel = document.createElement('button');
    const container = document.createElement('div');
    sentinel.textContent = 'Existing focus';
    container.innerHTML = renderToString(tabs);
    document.body.append(sentinel, container);
    sentinel.focus();

    let root: Root | undefined;
    await act(async () => {
      root = hydrateRoot(container, tabs);
    });

    expect(document.activeElement).toBe(sentinel);

    await act(async () => root?.unmount());
    sentinel.remove();
    container.remove();
  });

  it('B-07 moves React Tabs selection and focus with ArrowRight', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const items: TabItem[] = [
      { id: 'overview', label: 'Overview', panel: 'Summary' },
      { id: 'disabled', label: 'Disabled', panel: 'Unavailable', disabled: true },
      { id: 'billing', label: 'Billing', panel: 'Invoices' },
    ];
    render(
      <Tabs
        items={items}
        defaultSelectedId="overview"
        ariaLabel="Account sections"
        onChange={onChange}
      />
    );

    const overview = screen.getByRole('tab', { name: 'Overview' });
    overview.focus();
    await user.keyboard('{ArrowRight}');

    const billing = screen.getByRole('tab', { name: 'Billing' });
    expect(billing.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(billing);
    expect(screen.getByRole('tabpanel').textContent).toBe('Invoices');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('billing');
  });

  it('supports Tabs ArrowLeft, Home, End, pointer activation, and controlled selection', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const items: TabItem[] = [
      { id: 'one', label: 'One', panel: 'First' },
      { id: 'two', label: 'Two', panel: 'Second', isDisabled: true },
      { id: 'three', label: 'Three', panel: 'Third' },
    ];
    const { rerender } = render(
      <Tabs items={items} selectedId="one" onUpdate={onUpdate} />
    );
    const one = screen.getByRole('tab', { name: 'One' });
    one.focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Three' }));
    expect(onUpdate).toHaveBeenLastCalledWith('three');
    expect(one.getAttribute('aria-selected')).toBe('true');

    rerender(<Tabs items={items} selectedId="three" onUpdate={onUpdate} />);
    const three = screen.getByRole('tab', { name: 'Three' });
    three.focus();
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'One' }));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(three);
    await user.click(one);
    expect(onUpdate).toHaveBeenLastCalledWith('one');
  });

  it('emits idiomatic controlled field changes and preserves native state props', () => {
    const inputUpdate = vi.fn();
    const inputChange = vi.fn();
    const { rerender } = render(
      <Input
        id="email"
        label="Email"
        value="invalid"
        onChange={inputChange}
        onValueChange={inputUpdate}
      />
    );
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    expect(inputChange).toHaveBeenCalledTimes(1);
    expect(inputUpdate).toHaveBeenCalledWith('user@example.com');

    const checkedUpdate = vi.fn();
    rerender(
      <Checkbox
        id="marketing"
        label="Product updates"
        checked={false}
        onCheckedChange={checkedUpdate}
      />
    );
    fireEvent.click(screen.getByLabelText('Product updates'));
    expect(checkedUpdate).toHaveBeenCalledWith(true);

    const selectUpdate = vi.fn();
    rerender(
      <Select
        id="plan"
        label="Plan"
        value="pro"
        options={[
          { value: 'basic', label: 'Basic' },
          { value: 'pro', label: 'Pro' },
        ]}
        onValueChange={selectUpdate}
      />
    );
    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'basic' } });
    expect(selectUpdate).toHaveBeenCalledWith('basic');

    const textareaUpdate = vi.fn();
    rerender(
      <Textarea
        id="notes"
        label="Notes"
        value="Call before renewal"
        onValueChange={textareaUpdate}
      />
    );
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Call before renewal. Confirm owner.' },
    });
    expect(textareaUpdate).toHaveBeenCalledWith('Call before renewal. Confirm owner.');

    const dateUpdate = vi.fn();
    rerender(
      <DatePicker
        id="renewal"
        label="Renewal date"
        value="2026-09-30"
        min="2026-09-01"
        max="2026-12-31"
        step={1}
        onValueChange={dateUpdate}
      />
    );
    const date = screen.getByLabelText('Renewal date') as HTMLInputElement;
    expect(date.type).toBe('date');
    fireEvent.change(date, { target: { value: '2026-10-01' } });
    expect(dateUpdate).toHaveBeenCalledWith('2026-10-01');
  });

  it('dispatches dismissal, activation, and semantic row activation once', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const onActivate = vi.fn();
    const onRowActivate = vi.fn();
    render(
      <>
        <Banner
          title="Payment failed"
          tone="critical"
          onDismiss={onDismiss}
          dismissLabel="Dismiss payment warning"
        />
        <Button onActivate={onActivate}>Save changes</Button>
        <Table
          caption="Subscriptions"
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status' },
          ]}
          rows={[{ id: 'sub-1', name: 'Acme', status: 'Active' }]}
          selectable
          onRowActivate={onRowActivate}
        />
      </>
    );

    await user.click(screen.getByRole('button', { name: 'Dismiss payment warning' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    const rowAction = screen.getByRole('button', { name: 'Acme' });
    rowAction.focus();
    await user.keyboard('{Enter}');

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onRowActivate).toHaveBeenCalledTimes(1);
    expect(onRowActivate.mock.calls[0]?.[0]).toBe('sub-1');
  });
});
