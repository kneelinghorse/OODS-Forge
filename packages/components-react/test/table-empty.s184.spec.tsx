/* @vitest-environment jsdom */

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Table } from '../src/index.js';

afterEach(cleanup);

describe('@oods/components-react Table empty affordance', () => {
  it('renders non-empty text spanning every declared column when rows are empty', () => {
    const { container } = render(
      <Table
        caption="Subscriptions"
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
        ]}
        rows={[]}
      />
    );

    const body = container.querySelector('tbody');
    expect(body).not.toBeNull();
    expect(body?.textContent?.trim()).toBe('No rows available.');
    expect(body?.textContent?.trim().length).toBeGreaterThan(0);
    expect(body?.querySelectorAll('tr')).toHaveLength(1);
    expect(body?.querySelector('td')?.colSpan).toBe(2);
  });
});
