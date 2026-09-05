import { PORTED_COMPONENT_IDS, portedScenarios } from '@oods/component-contracts';
import { renderToString } from '@vue/server-renderer';
import { defineComponent, h, type Component } from 'vue';
import { describe, expect, it } from 'vitest';

import {
  AuditTimeline,
  CancellationSummary,
  PaginationBar,
  PriceBadge,
  RelativeTimestamp,
  SearchInput,
  StatusBadge,
  StatusTimeline,
} from '../src/ported.js';

const implementations: Readonly<Record<string, Component>> = {
  AuditTimeline,
  CancellationSummary,
  PaginationBar,
  PriceBadge,
  RelativeTimestamp,
  SearchInput,
  StatusBadge,
  StatusTimeline,
};

const ServerShowcase = defineComponent({
  name: 'PortedServerShowcase',
  setup() {
    return () => h('main', portedScenarios.map((scenario) => h(
      implementations[scenario.oodsComponentId],
      { key: scenario.id, ...scenario.props },
    )));
  },
});

describe('@oods/components-vue ported server rendering', () => {
  it('SSR-renders all eight ported components from the shared nondegenerate scenarios', async () => {
    const html = await renderToString(h(ServerShowcase));
    for (const componentId of PORTED_COMPONENT_IDS) {
      expect(html, componentId).toContain(`data-oods-component="${componentId}"`);
    }
    expect(html).toContain('role="log"');
    expect(html).toContain('role="search"');
    expect(html).toContain('aria-label="Pagination"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('datetime="2026-09-05T12:00:00Z"');
    expect(html).not.toContain('<dd>true</dd>');
  });
});
