import {
  Comment,
  Fragment,
  Text as TextNode,
  defineComponent,
  h,
  isVNode,
  type PropType,
  type VNodeChild,
} from 'vue';

import { Badge } from './primitives.js';
import type { ComponentEmphasis, ComponentTone, HeaderElement, HeaderLevel } from './types.js';

function firstText(...values: readonly unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

function headingElement(as: HeaderElement | undefined, level: HeaderLevel | undefined, fallback: 2 | 3): HeaderElement {
  if (as && /^h[1-6]$/.test(as)) return as;
  const resolvedLevel = level !== undefined && Number.isFinite(level)
    ? Math.min(6, Math.max(1, Math.trunc(level)))
    : fallback;
  return `h${resolvedLevel}` as HeaderElement;
}

function authoredContent(value: VNodeChild): VNodeChild[] {
  function flatten(child: VNodeChild): VNodeChild[] {
    if (Array.isArray(child)) return child.flatMap(flatten);
    if (child == null || typeof child === 'boolean' || (isVNode(child) && child.type === Comment)) return [];
    if (isVNode(child) && child.type === Fragment) return flatten(child.children as VNodeChild);
    return [child];
  }
  const content = flatten(value);
  // Whitespace separates authored words; only an entirely blank slot is absent.
  const meaningful = content.some((child) => {
    if (typeof child === 'string') return child.trim().length > 0;
    if (isVNode(child) && child.type === TextNode) return String(child.children ?? '').trim().length > 0;
    return true;
  });
  return meaningful ? content : [];
}

function scalarContent(content: readonly VNodeChild[]): string | undefined {
  if (!content.length) return undefined;
  if (!content.every((child) => typeof child === 'string' || typeof child === 'number' || (isVNode(child) && child.type === TextNode))) return undefined;
  return content.map((child) => String(isVNode(child) ? child.children : child)).join('');
}

export const DetailHeader = defineComponent({
  name: 'OodsDetailHeader',
  props: {
    title: String, label: String, text: String,
    subtitle: String, sublabel: String, description: String,
    metadata: String, meta: String,
    as: String as PropType<HeaderElement>,
    level: Number as PropType<HeaderLevel>,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const scalar = scalarContent(content);
      const title = scalar ?? firstText(props.title, props.label, props.text) ?? 'Details';
      const subtitle = firstText(props.subtitle, props.sublabel, props.description);
      const metadata = firstText(props.metadata, props.meta);
      return h('header', { class: 'oods-detail-header', 'data-oods-component': 'DetailHeader' },
        content.length && scalar === undefined ? content : [
          h(headingElement(props.as, props.level, 2), title),
          subtitle ? h('span', { 'data-oods-subtitle': 'true' }, subtitle) : null,
          metadata ? h('span', { 'data-oods-metadata': 'true' }, metadata) : null,
        ]);
    };
  },
});

export const CardHeader = defineComponent({
  name: 'OodsCardHeader',
  props: {
    title: String, label: String, text: String,
    supporting: String, supportingText: String, subtitle: String, description: String,
    as: String as PropType<HeaderElement>,
    level: Number as PropType<HeaderLevel>,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const scalar = scalarContent(content);
      const title = scalar ?? firstText(props.title, props.label, props.text) ?? 'Card';
      const supporting = firstText(props.supporting, props.supportingText, props.subtitle, props.description);
      return h('header', { class: 'oods-card-header', 'data-oods-component': 'CardHeader' },
        content.length && scalar === undefined ? content : [
          h(headingElement(props.as, props.level, 3), title),
          supporting ? h('span', { 'data-oods-supporting': 'true' }, supporting) : null,
        ]);
    };
  },
});

export const ColorSwatch = defineComponent({
  name: 'OodsColorSwatch',
  props: { color: String, value: String, state: String, label: String },
  setup(props, { slots }) {
    return () => {
      const color = firstText(props.color, props.value, props.state) ?? 'default';
      const content = authoredContent(slots.default?.());
      const scalar = scalarContent(content);
      const label = firstText(scalar, props.label) ?? color;
      return h('span', {
        class: 'oods-color-swatch',
        'data-oods-component': 'ColorSwatch',
        'data-summary-type': 'color-swatch',
        'data-swatch-color': color,
        style: { '--oods-swatch-color': color === 'default' ? undefined : color },
      }, [
        h('span', { 'data-oods-swatch-chip': 'true', 'aria-hidden': 'true' }),
        h('span', { 'data-oods-swatch-label': 'true' }, label),
        ...(scalar === undefined ? content : []),
      ]);
    };
  },
});

export const ColorizedBadge = defineComponent({
  name: 'OodsColorizedBadge',
  props: {
    label: String, text: String, state: String, value: String, status: String,
    color: String, hue: String, swatch: String, variant: String,
    tone: String as PropType<ComponentTone>,
    emphasis: String as PropType<ComponentEmphasis>,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const scalar = scalarContent(content);
      const label = firstText(scalar, props.label, props.text, props.state, props.value) ?? 'Color';
      const status = firstText(props.status, props.state, props.value);
      const color = firstText(props.color, props.hue, props.swatch, props.state);
      const variant = firstText(props.variant) ?? 'colorized';
      return h(Badge, {
        status, tone: props.tone, emphasis: props.emphasis,
        'data-oods-component': 'ColorizedBadge',
        'data-badge-status': status,
        'data-badge-color': color,
        'data-badge-variant': variant,
        style: { '--oods-badge-color': color },
      }, {
        icon: () => h('span', { 'data-oods-badge-marker': 'true', 'aria-hidden': 'true' }),
        default: () => [
          h('span', { 'data-oods-badge-label': 'true' }, label),
          ...(scalar === undefined ? content : []),
        ],
      });
    };
  },
});

export const VizAreaPreview = defineComponent({
  name: 'OodsVizAreaPreview',
  props: {
    width: { type: Number, default: 640 },
    height: { type: Number, default: 360 },
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      return h('div', {
        class: 'oods-viz-area-preview',
        'data-oods-component': 'VizAreaPreview',
        'data-viz-preview-type': 'area',
        'data-viz-width': props.width,
        'data-viz-height': props.height,
        style: { '--oods-viz-width': `${props.width}px`, '--oods-viz-height': `${props.height}px` },
      }, content.length ? content : [
        h('div', { 'data-viz-preview-placeholder': 'true' }, `Area preview (${props.width} x ${props.height})`),
      ]);
    };
  },
});
