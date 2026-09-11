import { describe, expect, it } from 'vitest';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';
import { handle } from '../../src/tools/design.compose.js';

function collectComponents(schema: UiSchema): string[] {
  const names = new Set<string>();

  function walk(node: UiElement): void {
    names.add(node.component);
    node.children?.forEach(walk);
  }

  schema.screens.forEach(walk);
  return Array.from(names);
}

describe('slot vocabulary unification', () => {
  it('maps User list before/after extensions into concrete slots without placement warnings', async () => {
    const result = await handle({
      object: 'User',
      context: 'list',
      layout: 'list',
      options: { validate: false },
    });

    expect(result.status).toBe('ok');
    expect(result.warnings.filter((warning) => warning.code === 'OODS-V120')).toHaveLength(0);
    expect(result.selections.find((selection) => selection.slotName === 'search')?.selectedComponent).toBe('SearchInput');
    expect(result.selections.find((selection) => selection.slotName === 'toolbar-actions')?.selectedComponent).toBe('AddressSummaryBadge');

    const components = collectComponents(result.schema);
    expect(components).toContain('MessageStatusBadge');
    expect(components).toContain('AddressSummaryBadge');
    expect(components).toContain('PreferenceSummaryBadge');
    expect(components).toContain('RoleBadgeList');
    expect(components).toContain('SearchInput');
    // The one row action is bound to its collection; surplus toolbar actions stay absent.
    const visit = (node: UiElement): UiElement[] => [node, ...(node.children ?? []).flatMap(visit)];
    const row = result.schema.screens.flatMap(visit).find(node => node.collection?.source === 'rows');
    const buttons = result.schema.screens.flatMap(visit).filter(node => node.component === 'Button');
    expect(row).toBeDefined();
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toMatchObject({ collectionControl: 'open', props: { field: row!.collection!.keyField } });
  });

  it('maps Subscription list secondary billing placement without OODS-V120 warnings', async () => {
    const result = await handle({
      object: 'Subscription',
      context: 'list',
      layout: 'list',
      options: { validate: false },
    });

    expect(result.status).toBe('ok');
    expect(result.warnings.filter((warning) => warning.code === 'OODS-V120')).toHaveLength(0);
    const toolbarSelection = result.selections.find(
      (selection) => selection.slotName === 'toolbar-actions',
    );

    expect(toolbarSelection?.selectedComponent).toBe('BillingSummaryBadge');
    expect(toolbarSelection?.candidates.map((candidate) => candidate.name)).toContain('BillingSummaryBadge');

    const components = collectComponents(result.schema);
    // The one row action is bound to its collection; surplus toolbar actions stay absent.
    const visit = (node: UiElement): UiElement[] => [node, ...(node.children ?? []).flatMap(visit)];
    const row = result.schema.screens.flatMap(visit).find(node => node.collection?.source === 'rows');
    const buttons = result.schema.screens.flatMap(visit).filter(node => node.component === 'Button');
    expect(row).toBeDefined();
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toMatchObject({ collectionControl: 'open', props: { field: row!.collection!.keyField } });
    expect(components).toContain('BillingSummaryBadge');
    expect(components).toContain('StatusBadge');
    expect(components).toContain('RelativeTimestamp');
  });
});
