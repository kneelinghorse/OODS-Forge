import { readFileSync } from 'node:fs';
import { handle as compose } from '../../../../../packages/mcp-server/src/tools/design.compose.js';
const flatten = (schema: any): any[] => { const out: any[] = []; const walk = (n: any) => { out.push(n); n.children?.forEach(walk); }; schema.screens.forEach(walk); return out; };
for (const count of [3, 5]) {
  const result = await compose({ layout: 'detail', preferences: { tabCount: count } });
  console.log('anchors', count, flatten(result.schema).filter(n => n.meta?.label).map(n => [n.meta.label, n.id]));
}
const baseline = JSON.parse(readFileSync('artifacts/product-reality/sprint-188/m04/baseline-schemas.json', 'utf8'));
for (const row of baseline.rows) {
  const result = await compose({ object: row.object, context: row.context });
  if (row.context === 'detail') {
    for (const [name, old] of Object.entries(row.schema.objectSchema) as any) {
      const current = result.schema.objectSchema![name];
      if (JSON.stringify(current) !== JSON.stringify(old)) console.log('field', row.object, name, { old, current });
    }
  }
  const billing = flatten(result.schema).filter(n => ['BillingSummaryBadge', 'BillingAmountInput', 'BillingIntervalSelector'].includes(n.component));
  if (billing.length) console.log('billing', row.object, row.context, billing);
  if (row.object === 'Article' && row.context === 'detail') console.log('status', JSON.stringify(flatten(result.schema).filter(n => n.meta?.notes === 'pattern-group:status-timeline' || Object.values(n.props ?? {}).includes('status'))));
}
