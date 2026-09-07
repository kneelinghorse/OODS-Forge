/* @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import * as React from 'react';
import { render, cleanup } from '@testing-library/react';
import * as Components from '../src/index.js';
afterEach(cleanup);
const mountFamily = (name: keyof typeof Components, props: Record<string, unknown> = {}, children?: string) => {
  const view = render(React.createElement(Components[name] as React.ComponentType, props, children));
  return view.container.firstElementChild as HTMLElement;
};

describe('Sprint 187 naming and classification semantics', () => {
  it.each(['LabelCell', 'InlineLabel'] as const)('%s preserves alias precedence, truncation edge cases and authored override', (name) => {
    const primary = (element: HTMLElement) => element.querySelector('[data-oods-label-cell-primary]')?.textContent ?? element.textContent;
    expect(primary(mountFamily(name, { value: 'Value' }))).toBe('Value');
    expect(primary(mountFamily(name, { label: ' ', text: 'Text', value: 'Value' }))).toBe('Text');
    expect(primary(mountFamily(name, { label: 'Primary', text: 'Text', maxLength: '4' }))).toBe('Pri...');
    for (const maxLength of [0, -1, 'bad', 100]) expect(primary(mountFamily(name, { label: 'Primary', maxLength }))).toBe('Primary');
    expect(primary(mountFamily(name, { label: 'Primary', maxLength: 1 }))).toBe('...');
    expect(mountFamily(name, { label: 'Primary', description: 'Hidden', maxLength: 1 }, 'Authored content').textContent).toBe('Authored content');
  });
  it('LabelCell keeps supporting aliases and defaults truncation to forty characters', () => {
    const root = mountFamily('LabelCell', { label: 'a'.repeat(50), supporting: 'Supporting', sublabel: 'Sublabel', subtitle: 'Subtitle', description: 'Description', truncate: true });
    expect(root.querySelector('[data-oods-label-cell-primary]')?.textContent).toBe('a'.repeat(39) + '...');
    expect(root.querySelector('[data-oods-label-cell-description]')?.textContent).toBe('Description');
    expect(mountFamily('LabelCell', {}).querySelector('[data-oods-label-cell-description]')).toBeNull();
  });
  it('FormLabelGroup preserves native association and hint precedence around children', () => {
    const root = mountFamily('FormLabelGroup', { htmlFor: 'primary', for: 'secondary', inputId: 'fallback', title: 'Title', text: 'Text', label: 'Label', description: 'Description', hint: 'Hint', placeholder: 'Placeholder' }, 'Child');
    expect(root.tagName).toBe('LABEL');
    expect(root.getAttribute('for')).toBe('primary');
    expect(root.textContent).toBe('LabelChildPlaceholder');
    expect(mountFamily('FormLabelGroup', { inputId: 'fallback' }).getAttribute('for')).toBe('fallback');
    expect(mountFamily('FormLabelGroup').textContent).toBe('Label');
  });
  it('ClassificationBadge exposes classification status and honors authored labels', () => {
    const root = mountFamily('ClassificationBadge', { category: 'Category', value: 'Value', state: 'State', mode: 'Mode' });
    expect(root.textContent).toBe('Category');
    expect(root.getAttribute('data-badge-status')).toBe('State');
    expect(root.getAttribute('data-badge-variant')).toBe('classification');
    expect(mountFamily('ClassificationBadge', { label: 'Label', text: 'Text' }, 'Authored').textContent).toBe('Authored');
  });
  it('ClassificationEditor labels native editable controls but prevents unwired submission', () => {
    const root = mountFamily('ClassificationEditor', { name: 'Heading', hint: 'Hint', primaryCategory: 'Category', tags: ['a'], modes: [{ value: 'strict', label: 'Strict' }, { value: 'flexible', label: 'Flexible' }], classificationMode: 'flexible' });
    expect(root.querySelector('h3')?.textContent).toBe('Heading');
    expect(root.querySelector('[data-form-subtitle]')?.textContent).toBe('Hint');
    const category = root.querySelector<HTMLInputElement>('input[name="category"]')!;
    expect(category.value).toBe('Category');
    expect(category.closest('label')?.querySelector('span')?.textContent).toBe('Category');
    expect(root.querySelector<HTMLInputElement>('input[name="tags"]')?.value).toBe('["a"]');
    const select = root.querySelector<HTMLSelectElement>('select')!;
    expect(select.value).toBe('flexible');
    category.value = 'Changed locally';
    category.dispatchEvent(new Event('input', { bubbles: true }));
    select.value = 'strict';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(category.value).toBe('Changed locally');
    expect(select.value).toBe('strict');
    const event = new Event('submit', { bubbles: true, cancelable: true });
    root.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(root.querySelector('button')).toBeNull();
    const authored = mountFamily('ClassificationEditor', {}, 'Custom controls');
    expect(authored.querySelector('input')).toBeNull();
    expect(authored.querySelector('[data-form-content]')?.textContent).toBe('Custom controls');
  });
});

describe('Sprint 187 ownership and summary semantics', () => {
  const values = (root: HTMLElement) => [...root.querySelectorAll('dd')].map((node) => node.textContent);
  it('OwnerBadge preserves principal aliases, status metadata and authored precedence', () => {
    const root = mountFamily('OwnerBadge', { owner: 'user-7', ownerType: 'person', value: 'fallback', status: 'active', state: 'inactive' });
    expect(root.textContent).toBe('user-7');
    expect(root.getAttribute('data-badge-status')).toBe('active');
    expect(mountFamily('OwnerBadge', { ownerType: 'person' }).textContent).toBe('person');
    expect(mountFamily('OwnerBadge').textContent).toBe('Owner');
    expect(mountFamily('OwnerBadge', { label: 'Label', owner: 'user-7' }, 'Authored').textContent).toBe('Authored');
  });
  it('OwnershipSummary associates owner data with terms and consumes role as data, not ARIA', () => {
    const root = mountFamily('OwnershipSummary', { name: 'By name', owner_id: 'legacy-id', ownerId: 'current-id', owner_type: 'team', ownerType: 'person', ownershipRole: 'legacy-role', role: 'custodian' });
    expect(root.querySelector('h3')?.textContent).toBe('By name');
    expect(values(root)).toEqual(['current-id', 'person', 'custodian']);
    expect(root.hasAttribute('role')).toBe(false);
    expect(values(mountFamily('OwnershipSummary', { owner_id: 'legacy', owner_type: 'team', ownershipRole: 'steward' }))).toEqual(['legacy', 'team', 'steward']);
    expect(mountFamily('OwnershipSummary', { text: 'Fallback', description: 'Ignored' }).querySelector('[data-summary-fallback]')?.textContent).toBe('Fallback');
    expect(mountFamily('OwnershipSummary').querySelector('dl')?.childNodes).toHaveLength(0);
    const authored = mountFamily('OwnershipSummary', { title: 'Owner', ownerId: 'Hidden' }, 'Authored');
    expect(authored.querySelector('h3')?.textContent).toBe('Owner');
    expect(authored.querySelector('dl')).toBeNull();
    expect(authored.textContent).toBe('OwnerAuthored');
  });
  it('OwnershipMeta keeps literal term separators and lets authored children replace its entire body', () => {
    const root = mountFamily('OwnershipMeta', { label: 'Principal', owner_type: 'team', ownershipRole: 'steward' });
    expect(root.querySelector('[data-meta-title]')?.textContent).toBe('Principal');
    expect([...root.querySelectorAll('[data-meta-item]')].map((node) => node.textContent)).toEqual(['Owner Type: team', 'Role: steward']);
    expect(root.hasAttribute('role')).toBe(false);
    expect(mountFamily('OwnershipMeta').textContent).toBe('Ownership');
    expect(mountFamily('OwnershipMeta', { title: 'Hidden', role: 'Hidden' }, 'Authored').textContent).toBe('Authored');
  });
  it('TagSummary preserves zero counts and scalar text, and shows the trait array using existing tag normalization', () => {
    expect(values(mountFamily('TagSummary', { tagCount: 0, count: 9, tags: 'alpha, beta' }))).toEqual(['0', 'alpha, beta']);
    expect(values(mountFamily('TagSummary', { count: '2', tags: ['alpha', { label: 'Beta', name: 'Ignored' }, { name: 'Gamma' }, null, 0] }))).toEqual(['2', 'alpha, Beta, Gamma, 0']);
    expect(values(mountFamily('TagSummary', { tagCount: 0, tags: [] }))).toEqual(['0']);
    expect(mountFamily('TagSummary', { tags: [], summary: 'No tags' }).querySelector('[data-summary-fallback]')?.textContent).toBe('No tags');
    const authored = mountFamily('TagSummary', { title: 'Tags', tags: ['Hidden'] }, 'Authored');
    expect(authored.textContent).toBe('TagsAuthored');
    expect(authored.querySelector('dl')).toBeNull();
  });
});
