import { defineComponent, h, type PropType, type VNodeChild } from 'vue';

import type {
  ComponentEmphasis,
  ComponentSize,
  ComponentTone,
  LayoutGap,
  TextElement,
} from './types.js';

const toneProp = String as PropType<ComponentTone>;
const emphasisProp = String as PropType<ComponentEmphasis>;
const sizeProp = String as PropType<ComponentSize>;

const STATUS_TONES: Readonly<Record<string, ComponentTone>> = {
  active: 'success',
  paid: 'success',
  success: 'success',
  successful: 'success',
  future: 'info',
  pending: 'info',
  pending_cancellation: 'info',
  posted: 'info',
  processing: 'info',
  trialing: 'accent',
  caution: 'warning',
  warning: 'warning',
  delinquent: 'critical',
  error: 'critical',
  failed: 'critical',
  past_due: 'critical',
  unpaid: 'critical',
};

const DOMAIN_STATUS_TONES: Readonly<Record<string, Readonly<Record<string, ComponentTone>>>> = {
  subscription: {
    future: 'info',
    trialing: 'accent',
    active: 'success',
    paused: 'neutral',
    pending_cancellation: 'info',
    past_due: 'critical',
    unpaid: 'critical',
    terminated: 'neutral',
  },
  invoice: {
    draft: 'neutral',
    posted: 'info',
    paid: 'success',
    past_due: 'critical',
    void: 'neutral',
  },
};

function normalizeStatus(status?: string): string {
  return status?.trim().toLowerCase().replace(/[\s-]+/g, '_') ?? '';
}

function resolveTone(tone?: ComponentTone, status?: string, domain?: string): ComponentTone {
  const normalizedStatus = normalizeStatus(status);
  const normalizedDomain = domain?.trim().toLowerCase() ?? '';
  return tone
    ?? DOMAIN_STATUS_TONES[normalizedDomain]?.[normalizedStatus]
    ?? STATUS_TONES[normalizedStatus]
    ?? 'neutral';
}

function tokenTone(tone: ComponentTone): ComponentTone {
  if (tone === 'positive') return 'success';
  if (tone === 'danger') return 'critical';
  return tone;
}

function statusLabel(status?: string): string {
  return normalizeStatus(status)
    .split('_')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function slotOrValue(slot: (() => VNodeChild) | undefined, value: VNodeChild): VNodeChild {
  return slot ? slot() : value;
}

export const Badge = defineComponent({
  name: 'OodsBadge',
  props: {
    content: { type: [String, Number] as PropType<string | number>, default: undefined },
    status: String,
    domain: { type: String, default: 'subscription' },
    tone: toneProp,
    emphasis: { type: emphasisProp, default: 'subtle' },
    icon: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
  },
  setup(props, { slots }) {
    return () => {
      const tone = resolveTone(props.tone, props.status, props.domain);
      const palette = tokenTone(tone);
      return h('span', {
        class: 'oods-badge',
        'data-oods-component': 'Badge',
        'data-status': props.status,
        'data-domain': props.domain,
        'data-tone': tone,
        'data-emphasis': props.emphasis,
        style: {
          '--cmp-badge-background': `var(--sys-status-${palette}-surface)`,
          '--cmp-badge-border': `var(--sys-status-${palette}-border)`,
          '--cmp-badge-text': `var(--sys-status-${palette}-text)`,
        },
      }, [
        props.icon || slots.icon
          ? h('span', { class: 'oods-badge-icon', 'aria-hidden': 'true' }, [slotOrValue(slots.icon, props.icon)])
          : null,
        slotOrValue(slots.default, props.content ?? statusLabel(props.status)),
      ]);
    };
  },
});

export const Banner = defineComponent({
  name: 'OodsBanner',
  props: {
    title: { type: String, default: '' },
    detail: { type: String, default: '' },
    content: { type: [String, Number] as PropType<string | number>, default: '' },
    status: String,
    domain: { type: String, default: 'subscription' },
    tone: toneProp,
    emphasis: { type: emphasisProp, default: 'subtle' },
    dismissLabel: String,
  },
  emits: {
    dismiss: () => true,
  },
  setup(props, { emit, slots }) {
    return () => {
      const tone = resolveTone(props.tone, props.status, props.domain);
      const palette = tokenTone(tone);
      return h('section', {
        class: 'oods-banner',
        'data-oods-component': 'Banner',
        'data-status': props.status,
        'data-domain': props.domain,
        'data-tone': tone,
        'data-emphasis': props.emphasis,
        role: tone === 'critical' || tone === 'danger' ? 'alert' : 'status',
        'aria-live': tone === 'critical' || tone === 'danger' ? 'assertive' : 'polite',
        style: {
          '--cmp-banner-background': `var(--sys-status-${palette}-surface)`,
          '--cmp-banner-border': `var(--sys-status-${palette}-border)`,
          '--cmp-banner-text': `var(--sys-status-${palette}-text)`,
        },
      }, [
        h('div', { class: 'oods-banner-content' }, [
          props.title || props.status || slots.title
            ? h('strong', { class: 'oods-banner-title' }, [
                slotOrValue(slots.title, props.title || statusLabel(props.status)),
              ])
            : null,
          props.detail ? h('p', { class: 'oods-banner-detail' }, props.detail) : null,
          slots.default || props.content
            ? h('div', { class: 'oods-banner-body' }, [slotOrValue(slots.default, props.content)])
            : null,
          slots.actions ? h('div', { class: 'oods-banner-actions' }, slots.actions()) : null,
        ]),
        props.dismissLabel
          ? h('button', {
              type: 'button',
              class: 'oods-banner-dismiss',
              'aria-label': props.dismissLabel,
              onClick: () => emit('dismiss'),
            }, [h('span', { 'aria-hidden': 'true' }, '×')])
          : null,
      ]);
    };
  },
});

export const Button = defineComponent({
  name: 'OodsButton',
  props: {
    content: { type: [String, Number] as PropType<string | number>, default: '' },
    intent: { type: String, default: 'neutral' },
    size: { type: sizeProp, default: 'md' },
    disabled: Boolean,
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
  },
  emits: {
    activate: (_event: MouseEvent) => true,
  },
  setup(props, { emit, slots }) {
    return () => h('button', {
      type: props.type,
      disabled: props.disabled,
      class: 'oods-button',
      'data-oods-component': 'Button',
      'data-intent': props.intent,
      'data-size': props.size,
      style: {
        '--cmp-button-background': 'var(--sys-surface-interactive-primary-default)',
        '--cmp-button-background-hover': 'var(--sys-surface-interactive-primary-hover)',
        '--cmp-button-background-disabled': 'var(--sys-surface-disabled)',
        '--cmp-button-border': 'var(--sys-border-subtle)',
        '--cmp-button-text': 'var(--sys-text-on-interactive)',
        '--cmp-button-text-disabled': 'var(--sys-text-disabled)',
        '--cmp-button-focus-width': 'var(--sys-focus-width, 2px)',
        '--cmp-button-focus-outer': 'var(--sys-focus-ring-outer, Highlight)',
      },
      onClick: (event: MouseEvent) => emit('activate', event),
    }, [slotOrValue(slots.default, props.content)]);
  },
});

const SAFE_CARD_ELEMENTS = new Set(['div', 'article', 'section', 'aside']);

export const Card = defineComponent({
  name: 'OodsCard',
  props: {
    elevated: Boolean,
    as: { type: String, default: 'div' },
  },
  setup(props, { slots }) {
    return () => h(SAFE_CARD_ELEMENTS.has(props.as) ? props.as : 'div', {
      class: 'oods-card',
      'data-oods-component': 'Card',
      'data-elevated': String(props.elevated),
    }, slots.default?.());
  },
});

const GAP_VALUES: Readonly<Record<string, string>> = {
  xs: 'var(--cmp-spacing-inline-xs, 0.5rem)',
  sm: 'var(--cmp-spacing-inline-sm, 0.75rem)',
  md: 'var(--cmp-spacing-stack-default, 1rem)',
  lg: 'var(--cmp-spacing-stack-lg, 1.5rem)',
};

function resolveGap(gap: LayoutGap): string {
  return GAP_VALUES[gap] ?? gap;
}

export const Grid = defineComponent({
  name: 'OodsGrid',
  props: {
    columns: { type: [Number, String] as PropType<number | string>, default: 'auto-fit' },
    minColumnWidth: { type: String, default: '16rem' },
    gap: { type: String as PropType<LayoutGap>, default: 'md' },
    align: { type: String, default: 'stretch' },
    justify: { type: String, default: 'normal' },
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: 'oods-grid',
      'data-oods-component': 'Grid',
      style: {
        '--oods-grid-columns': String(props.columns),
        '--oods-grid-min-column': props.minColumnWidth,
        '--oods-layout-gap': resolveGap(props.gap),
        '--oods-layout-align': props.align,
        '--oods-layout-justify': props.justify,
      },
    }, slots.default?.());
  },
});

export const Stack = defineComponent({
  name: 'OodsStack',
  props: {
    direction: { type: String as PropType<'row' | 'column'>, default: 'column' },
    gap: { type: String as PropType<LayoutGap>, default: 'md' },
    align: { type: String, default: 'stretch' },
    justify: { type: String, default: 'flex-start' },
    wrap: Boolean,
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: 'oods-stack',
      'data-oods-component': 'Stack',
      style: {
        '--oods-stack-direction': props.direction,
        '--oods-stack-wrap': props.wrap ? 'wrap' : 'nowrap',
        '--oods-layout-gap': resolveGap(props.gap),
        '--oods-layout-align': props.align,
        '--oods-layout-justify': props.justify,
      },
    }, slots.default?.());
  },
});

const SAFE_TEXT_ELEMENTS: ReadonlySet<string> = new Set<TextElement>([
  'span', 'p', 'strong', 'em', 'small', 'div', 'label',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

export const Text = defineComponent({
  name: 'OodsText',
  props: {
    content: { type: [String, Number] as PropType<string | number>, default: '' },
    as: { type: String as PropType<TextElement>, default: 'span' },
    size: { type: sizeProp, default: 'md' },
    weight: { type: String, default: 'normal' },
  },
  setup(props, { slots }) {
    return () => h(SAFE_TEXT_ELEMENTS.has(props.as) ? props.as : 'span', {
      class: 'oods-text',
      'data-oods-component': 'Text',
      'data-size': props.size,
      'data-weight': props.weight,
    }, [slotOrValue(slots.default, props.content)]);
  },
});
