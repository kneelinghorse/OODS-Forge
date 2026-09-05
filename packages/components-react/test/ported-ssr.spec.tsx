/* @vitest-environment node */

import * as React from 'react';
import { renderToString } from 'react-dom/server';
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

describe('@oods/components-react ported server rendering', () => {
  it('server-renders every ported component without browser globals', () => {
    const components: Array<[string, React.ReactElement]> = [
      ['AuditTimeline', <AuditTimeline events={[]} />],
      ['CancellationSummary', <CancellationSummary cancelAtPeriodEnd />],
      ['PaginationBar', <PaginationBar page={1} totalPages={2} totalItems={40} />],
      ['PriceBadge', <PriceBadge amountCents={1299} currency="USD" />],
      [
        'RelativeTimestamp',
        <RelativeTimestamp
          datetime="2026-09-04T12:00:00Z"
          now="2026-09-05T12:00:00Z"
        />,
      ],
      ['SearchInput', <SearchInput id="ssr-search" />],
      ['StatusBadge', <StatusBadge status="active" />],
      ['StatusTimeline', <StatusTimeline status="active" stateHistory={[]} />],
    ];

    for (const [componentId, component] of components) {
      const html = renderToString(component);
      expect(html).toContain(`data-oods-component="${componentId}"`);
      expect(html.length).toBeGreaterThan(30);
    }
  });
});
