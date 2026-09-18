/**
 * s205-m01: where does the OODS-V204 recording arm still reproduce? (#2193)
 *
 * design.compose.s202's arm needed a screen where swapping one slot's component moves a body field into a
 * different region, so the version's own fieldOrder refuses that candidate (OODS-V204). Sprint 204 m02's
 * status-timeline fix removed it from Subscription/detail. This probe measures every object and context:
 * it names every field each region carries as that region's order, then tries every ranked alternative of
 * every slot, and records each swap the order refuses.
 *
 *   MCP_SCHEMA_STORE_ROOT=<tmp> pnpm exec tsx scripts/product-reality/s205-m01-v204-probe.ts <out.json>
 */
import fs from 'node:fs';
import { listObjects } from '../../packages/mcp-server/src/objects/object-loader.js';
import { fieldKeyOf, handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import type { UiElement } from '../../packages/mcp-server/src/schemas/generated.js';

const contexts = ['detail', 'list', 'form', 'card'] as const;
const rows: Array<{ object: string; context: string; swapsTried: number; refused: string[]; error?: string }> = [];
for (const object of listObjects()) for (const context of contexts) {
  try {
    const base = await compose({ object, context, options: { transient: true, validate: false } } as never);
    const screen = base.schema.screens[0];
    const fieldOrder: Record<string, string[]> = {};
    for (const region of screen?.children ?? []) {
      const present = new Set<string>();
      const walk = (node: UiElement) => { for (const child of node.children ?? []) { const key = fieldKeyOf(child); if (key) present.add(key); if (!/^slot-/.test(child.id)) walk(child); } };
      walk(region);
      if (present.size) fieldOrder[region.id] = [...present];
    }
    const refused: string[] = []; let swapsTried = 0;
    for (const selection of base.selections) {
      const ranked = [...new Set([...selection.candidates.map(c => c.name), ...(selection.alternativeCandidates ?? []).map(c => c.name)])];
      for (const name of ranked) {
        if (name === selection.selectedComponent) continue;
        swapsTried += 1;
        const outcome = await compose({ object, context, preferences: { fieldOrder, componentOverrides: { [selection.slotName]: name } }, options: { transient: true, validate: false } } as never)
          .then(() => 'composed', (error: { opiCode?: string }) => error.opiCode ?? 'error');
        if (outcome === 'OODS-V204') refused.push(`${selection.slotName} → ${name}`);
      }
    }
    rows.push({ object, context, swapsTried, refused });
  } catch (error) { rows.push({ object, context, swapsTried: 0, refused: [], error: (error as Error).message.slice(0, 160) }); }
}
const reproduces = rows.filter(row => row.refused.length);
fs.writeFileSync(process.argv[2]!, JSON.stringify({ measuredAt: new Date().toISOString(), screens: rows.length, reproduces: reproduces.map(({ object, context, refused }) => ({ object, context, refused })), rows }, null, 2) + '\n');
console.log(JSON.stringify({ screens: rows.length, errors: rows.filter(r => r.error).length, reproduces: reproduces.map(r => `${r.object}/${r.context} (${r.refused.length})`) }));
