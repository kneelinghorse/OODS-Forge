import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { Table } from '../src/index.js';

describe('@oods/components-vue Table empty affordance', () => {
  it('renders non-empty text spanning every declared column when rows are empty', () => {
    const wrapper = mount(Table, {
      props: {
        caption: 'Subscriptions',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
        ],
        rows: [],
      },
    });

    try {
      const body = wrapper.get('tbody');
      expect(body.text()).toBe('No rows available.');
      expect(body.text().trim().length).toBeGreaterThan(0);
      expect(body.findAll('tr')).toHaveLength(1);
      expect(body.get('td').attributes('colspan')).toBe('2');
    } finally {
      wrapper.unmount();
    }
  });
});
