import { createRequire } from 'node:module';

import { sharedScenarios } from '@oods/component-contracts';
import * as ReactComponents from '@oods/components-react';
import * as VueComponents from '@oods/components-vue';
import { JSDOM } from 'jsdom';
import { createElement, type ComponentType, type ReactNode } from 'react';
import { renderToString as renderReact } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const requireVue = createRequire(new URL('../../../components-vue/package.json', import.meta.url));
const { h } = requireVue('vue');
const { renderToString: renderVue } = requireVue('@vue/server-renderer');

const COMPONENTS = ['DetailHeader', 'CardHeader', 'ColorSwatch', 'ColorizedBadge', 'VizAreaPreview'] as const;
type Component = (typeof COMPONENTS)[number];
type Observation = {
  markers: string[];
  headings: Array<{ level: string; text: string }>;
  visibleText: string;
  placeholderText: string | null;
  badgeStyles: Record<string, string> | null;
};

// Parity is a computed comparison. Any future exception needs a written reason
// and a companion test; this wave has no declared framework differences.
const DECLARED_DIFFERENCES: ReadonlyArray<{
  component: Component;
  field: keyof Observation;
  reason: string;
  companionTest: string;
}> = [];

function observe(html: string): Observation {
  const fragment = JSDOM.fragment(html);
  const text = (value: string | null) => (value ?? '').replace(/\s+/g, ' ').trim();
  const badge = fragment.querySelector<HTMLElement>('[data-oods-component="ColorizedBadge"]');
  return {
    markers: [...fragment.querySelectorAll('[data-oods-component]')]
      .map((element) => element.getAttribute('data-oods-component')!),
    headings: [...fragment.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .map((element) => ({ level: element.tagName.toLowerCase(), text: text(element.textContent) })),
    visibleText: text(fragment.textContent),
    placeholderText: fragment.querySelector('[data-viz-preview-placeholder]')
      ? text(fragment.querySelector('[data-viz-preview-placeholder]')!.textContent)
      : null,
    badgeStyles: badge ? Object.fromEntries([
      '--cmp-badge-background', '--cmp-badge-border', '--cmp-badge-text',
    ].map((property) => [property, badge.style.getPropertyValue(property)])) : null,
  };
}

function differences(react: Observation, vue: Observation): Array<keyof Observation> {
  return (Object.keys(react) as Array<keyof Observation>)
    .filter((field) => JSON.stringify(react[field]) !== JSON.stringify(vue[field]));
}

async function renderPair(
  component: Component,
  props: Record<string, unknown>,
  reactContent?: ReactNode,
  vueContent?: unknown,
): Promise<{ react: Observation; vue: Observation }> {
  const reactComponent = (ReactComponents as unknown as Record<string, ComponentType>)[component];
  const vueComponent = (VueComponents as Record<string, unknown>)[component];
  expect(reactComponent, `react/${component} root export`).toBeDefined();
  expect(vueComponent, `vue/${component} root export`).toBeDefined();
  const reactHtml = renderReact(createElement(reactComponent!, props, reactContent));
  const vueHtml: string = await renderVue(h(
    vueComponent, props, vueContent === undefined ? undefined : { default: () => vueContent },
  ));
  return { react: observe(reactHtml), vue: observe(vueHtml) };
}

const CASES = COMPONENTS.map((component) => ({ component, omitSlot: false }))
  .concat([{ component: 'VizAreaPreview', omitSlot: true }]);

describe('Sprint 185 computed React/Vue SSR parity', () => {
  it('starts with an empty declared-difference allowlist', () => {
    expect(DECLARED_DIFFERENCES).toEqual([]);
  });

  it.each(CASES)('compares $component SSR with omitSlot=$omitSlot', async ({ component, omitSlot }) => {
    const scenario = sharedScenarios.find((entry) => entry.oodsComponentId === component);
    expect(scenario, component).toBeDefined();
    const content = omitSlot ? undefined : scenario!.slots.default;
    const { react, vue } = await renderPair(component, { ...scenario!.props },
      content === undefined ? undefined : String(content),
      content === undefined ? undefined : String(content));
    const diff = differences(react, vue);

    expect(diff, JSON.stringify({ component, react, vue }, null, 2)).toEqual([]);
    expect(react.markers).toContain(component);
    expect(react.visibleText.length).toBeGreaterThan(0);
    if (component === 'DetailHeader') {
      expect(react.headings).toEqual([{ level: 'h1', text: 'Subscription details' }]);
      expect(react.visibleText).toContain('Pro plan');
      expect(react.visibleText).toContain('Renews monthly');
    } else if (component === 'CardHeader') {
      expect(react.headings).toEqual([{ level: 'h3', text: 'Account summary' }]);
      expect(react.visibleText).toContain('Current subscription');
    } else if (component === 'ColorSwatch') {
      expect(react.visibleText).toContain('Ocean blue');
    } else if (component === 'ColorizedBadge') {
      expect(react.visibleText).toContain('Approved');
    } else {
      expect(react.placeholderText).toBe(omitSlot ? 'Area preview (640 x 360)' : null);
      expect(react.visibleText).toBe(omitSlot
        ? 'Area preview (640 x 360)'
        : 'Authored area preview content');
    }
  });

  it.each(['DetailHeader', 'CardHeader'] as const)('preserves scalar whitespace separators in %s headings', async (component) => {
    const { react, vue } = await renderPair(component, {}, ['Alpha', ' ', 'Beta'], ['Alpha', ' ', 'Beta']);
    expect(differences(react, vue), JSON.stringify({ react, vue })).toEqual([]);
    expect(react.headings).toEqual([{ level: component === 'DetailHeader' ? 'h2' : 'h3', text: 'Alpha Beta' }]);
  });

  it.each(['DetailHeader', 'CardHeader', 'VizAreaPreview'] as const)(
    'preserves spaces between authored span children in %s',
    async (component) => {
      const { react, vue } = await renderPair(component, {}, [
        createElement('span', { key: 'alpha' }, 'Alpha'), ' ', createElement('span', { key: 'beta' }, 'Beta'),
      ], [h('span', 'Alpha'), ' ', h('span', 'Beta')]);
      expect(differences(react, vue), JSON.stringify({ react, vue })).toEqual([]);
      expect(react.visibleText).toBe('Alpha Beta');
      expect(react.headings).toEqual([]);
      expect(react.placeholderText).toBeNull();
    },
  );

  it.each(['subtle', 'solid'])('uses explicit warning tone over active status for both %s badge token surfaces', async (emphasis) => {
    const { react, vue } = await renderPair('ColorizedBadge', {
      label: 'Active with warning', status: 'active', tone: 'warning', emphasis,
    });
    expect(differences(react, vue), JSON.stringify({ react, vue })).toEqual([]);
    expect(react.badgeStyles).toEqual({
      '--cmp-badge-background': 'var(--sys-status-warning-surface)',
      '--cmp-badge-border': 'var(--sys-status-warning-border)',
      '--cmp-badge-text': 'var(--sys-status-warning-text)',
    });
  });

  it('detects drift in markers, heading levels, and visible text independently', () => {
    const control = observe('<header data-oods-component="DetailHeader"><h2>Plan</h2></header>');
    for (const [field, changed] of [
      ['markers', { ...control, markers: ['CardHeader'] }],
      ['headings', { ...control, headings: [{ level: 'h3', text: 'Plan' }] }],
      ['visibleText', { ...control, visibleText: 'Changed plan' }],
    ] as const) {
      expect(differences(control, changed)).toEqual([field]);
    }
  });
});
