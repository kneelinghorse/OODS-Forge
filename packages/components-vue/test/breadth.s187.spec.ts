/* @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import { type Component } from 'vue';
import * as Components from '../src/index.js';
enableAutoUnmount(afterEach);
const mountFamily = (name: keyof typeof Components, props: Record<string, unknown> = {}, children?: string) => {
  const view = mount(Components[name] as Component, { props, ...(children === undefined ? {} : { slots: { default: children } }) });
  return view.element as HTMLElement;
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
