import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { Banner } from '../src/index.js';
describe('banner text parity', () => {
  it('announces plain empty-state copy as a paragraph and preserves block content in authored slots', () => {
    const plain = mount(Banner, { props: { content: 'No events yet.' } });
    expect(plain.get('p.oods-banner-body').text()).toBe('No events yet.');
    plain.unmount();
    const authored = mount(Banner, { slots: { default: '<div><p>Authored body</p></div>' } });
    expect(authored.get('div.oods-banner-body > div > p').text()).toBe('Authored body');
    authored.unmount();
  });
});
