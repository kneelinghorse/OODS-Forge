import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { workflowDataFiles } from '../../src/codegen/workflow-data-emitter.js';
import { renderMappedComponent } from '../../src/render/component-map.js';
import { billingCycle } from '@oods/component-contracts';
import * as ReactComponents from '../../../components-react/src/index.js';
import { typecheckWorkflow } from '../product-reality/workflow-typecheck.js';
const vueRequire = createRequire(new URL('../../../components-vue/package.json', import.meta.url));
const { h } = vueRequire('vue');
const { renderToString } = vueRequire('@vue/server-renderer');
const VueComponents = vueRequire('@oods/components-vue');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

describe('component carries preserve the same meaning in every target', () => {
  it.each(['StatusTimeline', 'AuditTimeline'] as const)('%s has identical two-entry labels, dates, actors and reasons in all three targets', async component => {
    const props = { ...(component === 'StatusTimeline' ? { status: 'pending_cancellation', allowedTransitions: ['active', 'terminated'] } : {}), events: [
      { from: null, to: 'active', at: '2026-09-01T12:00:00Z', reason: 'Created', actorId: 'operator-1' },
      { from: 'active', to: 'pending_cancellation', at: '2026-09-08T12:00:00Z', reason: 'Budget', actorId: 'operator-2' },
    ] };
    for (const options of [{}, { showActorId: false, showReason: false, maxVisible: 1 }]) {
      const values = { ...props, ...options };
      const html = text(renderMappedComponent({ id: 'history', component, props: values }, '')!);
      expect(text(renderToStaticMarkup(createElement(ReactComponents[component], values)))).toBe(html);
      expect(text(await renderToString(h(VueComponents[component], values)))).toBe(html);
      if (!Object.keys(options).length) { expect(html).toContain('active → pending_cancellation'); expect(html).toContain('Reason: Budget'); }
    }
  });
  it.each([1, 9])('uses the correct noun for %i records in both generated targets', async totalItems => {
    const props = { totalItems, pageSize: 10, page: 1 };
    const expected = `${totalItems} ${totalItems === 1 ? 'record' : 'records'}`;
    expect(text(renderToStaticMarkup(createElement(ReactComponents.PaginationBar, props)))).toContain(expected);
    expect(text(await renderToString(h(VueComponents.PaginationBar, props)))).toContain(expected);
  });
});

describe('ten seeded records describe plausible subscription periods', () => {
  it('enumerates every record against the declared clock, interval, lifecycle and event vocabulary', async () => {
    const { schema } = await compose({ object: 'Subscription', context: 'workflow' });
    const source = workflowDataFiles(schema).find(file => file.path === 'src/sample-data.ts')!.contents;
    const records = JSON.parse(source.slice(source.indexOf(' = ') + 3).replace(/;\s*$/, ''));
    expect(records).toHaveLength(10);
    expect(new Set(records.map((record: any) => record.subscription_id)).size).toBe(10);
    for (const record of records) {
      const expectedNext = new Date(record.last_payment_at);
      expectedNext.setUTCMonth(expectedNext.getUTCMonth() + (record.billing_interval === 'yearly' ? 12 : 1));
      expect(record.next_payment_due_at, record.subscription_id).toBe(expectedNext.toISOString());
      const cycle = billingCycle({ periodStart: record.current_period_start, periodEnd: record.current_period_end, progress: record.current_period_progress, now: '2026-09-08T12:00:00Z' });
      if (['active', 'trialing'].includes(record.status)) {
        expect(Date.parse(record.current_period_start)).toBeLessThan(Date.parse('2026-09-08T12:00:00Z'));
        expect(Date.parse(record.current_period_end)).toBeGreaterThan(Date.parse('2026-09-08T12:00:00Z'));
        expect(cycle.percent).toBeGreaterThan(0); expect(cycle.percent).toBeLessThan(100);
        expect(cycle.remainingDays).toBeGreaterThan(0);
      }
      if (record.status === 'terminated') { expect(cycle.percent).toBe(100); expect(cycle.remainingDays).toBe(0); }
      if (!['pending_cancellation', 'terminated'].includes(record.status)) expect(Object.keys(record).filter(key => key.startsWith('cancellation_'))).toEqual([]);
      expect(record.state_history.at(-1).to).toBe(record.status);
      expect(record.state_history[0].event).toBe(record.last_event);
      expect(schema.workflow!.data.recordedEvents).toContain(record.last_event);
      expect(record.state_history[0].at).toBe(record.created_at);
    }
  });
  it.each(['react', 'vue'] as const)('%s workflow accepts optional absent cancellation metadata', async framework => {
    const { schema } = await compose({ object: 'Subscription', context: 'workflow' });
    const generated = await generate({ schema, framework, profile: 'build' });
    expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
    const result = typecheckWorkflow(generated.artifact!);
    expect(result.status, result.stdout + result.stderr).toBe(0);
  }, 30_000);
});
