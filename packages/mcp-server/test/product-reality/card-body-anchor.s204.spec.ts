import { describe, expect, it } from 'vitest';
import { componentContracts } from '@oods/component-contracts';
import { handle as compose } from '../../src/tools/design.compose.js';
import { listObjects } from '../../src/objects/object-loader.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';

/**
 * s204-m02 (a): every card in the registry drew an empty bordered box under its header, because the
 * card template's body placeholder is a `Card` nothing fills. The s203 review ruled (#2180) that the
 * placeholder is NOT dropped — dropping it takes the anchor `componentOverrides` and `design.preview`
 * slot swaps target — but rendered as a zero-height anchor instead.
 *
 * These tests hold both halves: the box is gone, AND the anchor is still there.
 */

function walk(el: UiElement, visit: (node: UiElement) => void): void {
  visit(el);
  el.children?.forEach(child => walk(child, visit));
}

function nodes(schema: UiSchema | undefined): UiElement[] {
  const found: UiElement[] = [];
  (schema?.screens ?? []).forEach(screen => walk(screen, node => found.push(node)));
  return found;
}

const isSlot = (node: UiElement): boolean => typeof node.meta?.intent === 'string' && node.meta.intent.startsWith('slot:');
const isBare = (node: UiElement): boolean => !node.children?.length && Object.keys(node.props ?? {}).length === 0;

describe('s204-m02 (a) — an unfilled slot placeholder paints nothing, and stays where it was', () => {
  it('names every component whose contract paints both a surface and a border, so the fix cannot silently narrow', () => {
    // The producer neutralizes a hard-coded set. That set is only defensible while it equals the set
    // the CONTRACTS describe: a component that paints a surface AND a border draws a visible box when
    // empty. If a future component starts painting one, this fails and the producer set must grow with
    // it — which is the whole point of deriving the expectation here rather than restating the constant.
    const painting = Object.entries(componentContracts as Record<string, { tokenRoles?: string[] }>)
      .filter(([, contract]) => {
        const roles = contract.tokenRoles ?? [];
        return roles.some(role => role.startsWith('surface.')) && roles.some(role => role.startsWith('border.'));
      })
      .map(([name]) => name)
      .sort();
    expect(painting).toEqual(['Card']);
  });

  // Every object, but only the two contexts the defect lives in: all 95 unfilled `Card` placeholders
  // s204-m02 measured were card bodies (22) and detail tabs (73). Sweeping all eight declared contexts
  // is 184 compositions and about 50 seconds, which is the kind of cost s204-m01 spent the sprint
  // removing from the capture — so the full sweep lives in the retained harness
  // (artifacts/product-reality/sprint-204/m02/screen-readout.mjs, 44 -> 0 across 184 screens) and the
  // suite holds the invariant where it can actually regress.
  it('leaves no unfilled placeholder that paints a box, on any object, on cards or details', async () => {
    const offenders: string[] = [];
    for (const object of listObjects().map(entry => entry.name).sort()) {
      for (const context of ['card', 'detail'] as const) {
        let composed: Awaited<ReturnType<typeof compose>>;
        try { composed = await compose({ object, context }); } catch { continue; }
        for (const node of nodes(composed.schema)) {
          if (isSlot(node) && isBare(node) && node.component === 'Card') {
            offenders.push(`${object}/${context} ${node.meta?.intent}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  }, 45_000);

  it('keeps the card body anchor itself — the id and the slot identity overrides and swaps target', async () => {
    const composed = await compose({ object: 'Decision', context: 'card' });
    const body = nodes(composed.schema).find(node => node.meta?.intent === 'slot:body');

    // Present at all: dropping it is what the review refused.
    expect(body).toBeDefined();
    // The fragment anchor. A generated artifact addresses this node by id.
    expect(typeof body?.id).toBe('string');
    expect(body?.id).toMatch(/^slot-body/);
    // The slot identity. `preferences.componentOverrides` is keyed by slot NAME, and a
    // `design.preview` slot swap finds its target through this intent.
    expect(body?.meta?.intent).toBe('slot:body');
    expect(body?.meta?.label).toBe('body');
    // And it no longer paints.
    expect(body?.component).not.toBe('Card');
  });

  it('still honours a componentOverrides pin on the body slot, which is what the anchor is for', async () => {
    const pinned = await compose({
      object: 'Decision',
      context: 'card',
      preferences: { componentOverrides: { body: 'Table' } },
    });
    const body = nodes(pinned.schema).find(node => node.meta?.intent === 'slot:body');
    // The pin is respected: a Table is not a painting surface, so nothing neutralizes it, and the
    // author's explicit choice survives untouched.
    expect(body?.component).toBe('Table');
  });
});
