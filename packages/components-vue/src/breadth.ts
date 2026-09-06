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
import type { AddressEditorValue, ComponentEmphasis, ComponentTone, FilterDescriptor, HeaderElement, HeaderLevel } from './types.js';

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

// Mirrors the HTML renderer's firstSerialized: blank strings are skipped,
// numbers and booleans become visible text.
function firstScalar(...values: readonly unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      if (value.trim().length > 0) return value;
      continue;
    }
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  }
  return undefined;
}

function isRecord(value: unknown): value is FilterDescriptor {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function descriptorLabel(descriptor: FilterDescriptor): string {
  return firstText(descriptor.label, descriptor.field) ?? 'Filter';
}

const PANEL_SECTION_PROPS = {
  title: String, label: String, heading: String, name: String,
  subtitle: String, description: String, metadata: String,
  summary: String, text: String, body: String, emptyMessage: String,
} as const;

// Every panel-family component mirrors renderPanelSection; only the marker,
// data-panel-type and default title differ between them.
function createPanelSection(component: string, className: string, panelType: string, defaultTitle: string) {
  return defineComponent({
    name: `Oods${component}`,
    props: PANEL_SECTION_PROPS,
    setup(props, { slots }) {
      return () => {
        const content = authoredContent(slots.default?.());
        const title = firstText(props.title, props.label, props.heading, props.name) ?? defaultTitle;
        const subtitle = firstText(props.subtitle, props.description, props.metadata);
        const fallback = firstText(props.summary, props.text, props.body, props.emptyMessage);
        return h('section', {
          class: className,
          'data-oods-component': component,
          'data-panel-type': panelType,
        }, [
          h('header', { 'data-panel-header': 'true' }, [
            h('h3', title),
            subtitle ? h('span', { 'data-panel-subtitle': 'true' }, subtitle) : null,
          ]),
          h('div', { 'data-panel-content': 'true' }, content.length
            ? content
            : fallback ? [h('span', { 'data-panel-summary': 'true' }, fallback)] : []),
        ]);
      };
    },
  });
}

export const ClassificationPanel = createPanelSection('ClassificationPanel', 'oods-classification-panel', 'classification', 'Classification');
export const AddressCollectionPanel = createPanelSection('AddressCollectionPanel', 'oods-address-collection-panel', 'address', 'Addresses');
export const MembershipPanel = createPanelSection('MembershipPanel', 'oods-membership-panel', 'membership', 'Membership');
export const PreferencePanel = createPanelSection('PreferencePanel', 'oods-preference-panel', 'preference', 'Preferences');

export const FilterPanel = defineComponent({
  name: 'OodsFilterPanel',
  props: {
    filters: { type: Array as PropType<readonly FilterDescriptor[]>, default: () => [] },
    activeFilters: { type: Array as PropType<readonly FilterDescriptor[]>, default: () => [] },
    mode: String,
    collapsible: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const mode = firstText(props.mode) ?? 'immediate';
      const descriptors = (Array.isArray(props.filters) ? props.filters : []).filter(isRecord);
      const activeCount = Array.isArray(props.activeFilters) ? props.activeFilters.length : 0;
      return h('aside', {
        class: 'oods-filter-panel',
        'data-oods-component': 'FilterPanel',
        'data-behavioral': 'filter',
        'data-filter-mode': mode,
        role: 'region',
        'aria-label': 'Filters',
      }, content.length ? content : [
        activeCount > 0
          ? h('div', { 'data-active-filters': 'true', 'aria-live': 'polite' }, [
              h('span', { 'data-filter-count': 'true' }, `${activeCount} active`),
              h('button', { type: 'button', 'data-filter-clear-all': 'true' }, 'Clear all'),
            ])
          : null,
        ...descriptors.map((descriptor, index) => h('fieldset', {
          key: index,
          'data-filter-section': 'true',
          'data-collapsible': props.collapsible ? 'true' : undefined,
        }, [h('legend', descriptorLabel(descriptor))])),
        mode === 'batch' ? h('button', { type: 'button', 'data-filter-apply': 'true' }, 'Apply') : null,
      ]);
    };
  },
});

export const PriceSummary = defineComponent({
  name: 'OodsPriceSummary',
  props: {
    title: String, label: String, heading: String, name: String,
    amount: [String, Number] as PropType<string | number>,
    amountCents: [String, Number] as PropType<string | number>,
    unitAmountCents: [String, Number] as PropType<string | number>,
    currency: String, currencyCode: String, model: String, pricingModel: String,
    interval: String, billingInterval: String,
    summary: String, text: String, description: String,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const title = firstText(props.title, props.label, props.heading, props.name) ?? 'Price Summary';
      const terms = ([
        ['Amount', firstScalar(props.amount, props.amountCents, props.unitAmountCents)],
        ['Currency', firstScalar(props.currency, props.currencyCode)],
        ['Model', firstScalar(props.model, props.pricingModel)],
        ['Interval', firstScalar(props.interval, props.billingInterval)],
      ] as Array<[string, string | undefined]>).filter((entry): entry is [string, string] => entry[1] !== undefined);
      const fallback = firstText(props.summary, props.text, props.description);
      return h('section', {
        class: 'oods-price-summary',
        'data-oods-component': 'PriceSummary',
        'data-summary-type': 'price',
      }, [
        h('h3', { 'data-summary-title': 'true' }, title),
        ...(content.length
          ? content
          : terms.length
            ? [h('dl', terms.map(([term, value]) => h('div', { key: term, 'data-summary-item': 'true' }, [h('dt', term), h('dd', value)])))]
            : fallback
              ? [h('p', { 'data-summary-fallback': 'true' }, fallback)]
              : [h('dl')]),
      ]);
    };
  },
});

// Mirrors the HTML renderer's normalizeBadgeItems for tag entries.
function normalizeTagItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const items: string[] = [];
  for (const entry of value) {
    if (entry === undefined || entry === null) continue;
    if (isRecord(entry)) {
      const text = firstScalar(entry.label, entry.name, entry.role, entry.value, entry.id);
      if (text) items.push(text);
      continue;
    }
    items.push(typeof entry === 'object' ? JSON.stringify(entry) : String(entry));
  }
  return items.filter((item) => item.length > 0);
}

export const TagManager = defineComponent({
  name: 'OodsTagManager',
  props: {
    title: String, label: String, heading: String, name: String,
    description: String, subtitle: String, hint: String,
    tags: Array as PropType<readonly unknown[]>,
    value: Array as PropType<readonly unknown[]>,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const title = firstText(props.title, props.label, props.heading, props.name) ?? 'Tag Manager';
      const subtitle = firstText(props.description, props.subtitle, props.hint);
      const items = normalizeTagItems(props.tags ?? props.value);
      return h('form', {
        class: 'oods-tag-manager',
        'data-oods-component': 'TagManager',
        'data-form-type': 'tag-manager',
        // The add control is unwired: submitting never navigates.
        onSubmit: (event: Event) => event.preventDefault(),
      }, [
        h('header', { 'data-form-header': 'true' }, [
          h('h3', title),
          subtitle ? h('span', { 'data-form-subtitle': 'true' }, subtitle) : null,
        ]),
        h('div', { 'data-form-content': 'true' }, content.length ? content : [
          h('div', { 'data-tag-list': 'true' }, items.map((tag, index) => h('span', { key: index, 'data-tag-item': 'true' }, tag))),
          h('label', { 'data-form-control': 'input' }, [
            h('span', 'Add Tag'),
            h('input', { type: 'text', name: 'newTag', placeholder: 'Type a tag' }),
          ]),
        ]),
      ]);
    };
  },
});

// Mirrors the HTML renderer's asNumber for pill limits.
function asCount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

type BadgeFamilyOptions = {
  component: string;
  className: string;
  defaultLabel: string;
  defaultVariant: string;
  labelKeys: readonly string[];
  statusKeys: readonly string[];
  extraProps: readonly string[];
};

// Every badge-family summary mirrors renderBadgePrimitive over the governed
// Badge substrate; only the marker, default label/variant and alias order differ.
function createBadgeFamily(options: BadgeFamilyOptions) {
  const props: Record<string, StringConstructor> = {
    label: String, text: String, value: String, status: String, state: String, variant: String, tone: String, emphasis: String,
  };
  for (const key of options.extraProps) props[key] = String;
  return defineComponent({
    name: `Oods${options.component}`,
    props,
    setup(componentProps, { slots }) {
      return () => {
        const record = componentProps as Record<string, unknown>;
        const content = authoredContent(slots.default?.());
        const scalar = scalarContent(content);
        const label = scalar ?? firstText(...options.labelKeys.map((key) => record[key])) ?? options.defaultLabel;
        const status = firstText(...options.statusKeys.map((key) => record[key]));
        const variant = firstText(record.variant) ?? options.defaultVariant;
        return h(Badge, {
          status, tone: record.tone as ComponentTone | undefined, emphasis: record.emphasis as ComponentEmphasis | undefined,
          class: options.className,
          'data-oods-component': options.component,
          'data-badge-status': status,
          'data-badge-variant': variant,
        }, {
          default: () => (content.length && scalar === undefined ? content : [h('span', { 'data-oods-badge-label': 'true' }, label)]),
        });
      };
    },
  });
}

export const AddressSummaryBadge = createBadgeFamily({
  component: 'AddressSummaryBadge', className: 'oods-address-summary-badge', defaultLabel: 'Address', defaultVariant: 'address',
  labelKeys: ['label', 'text', 'role', 'value'], statusKeys: ['status', 'state', 'role'], extraProps: ['role'],
});
export const MessageStatusBadge = createBadgeFamily({
  component: 'MessageStatusBadge', className: 'oods-message-status-badge', defaultLabel: 'Message', defaultVariant: 'message',
  labelKeys: ['label', 'text', 'status', 'delivery', 'value'], statusKeys: ['status', 'state', 'delivery', 'value'], extraProps: ['delivery'],
});
export const PreferenceSummaryBadge = createBadgeFamily({
  component: 'PreferenceSummaryBadge', className: 'oods-preference-summary-badge', defaultLabel: 'Preferences', defaultVariant: 'preference',
  labelKeys: ['label', 'text', 'namespace', 'value'], statusKeys: ['status', 'state', 'version'], extraProps: ['namespace', 'version'],
});

export const RoleBadgeList = defineComponent({
  name: 'OodsRoleBadgeList',
  props: {
    roles: Array as PropType<readonly unknown[]>,
    badges: Array as PropType<readonly unknown[]>,
    roleLabels: Array as PropType<readonly unknown[]>,
    value: Array as PropType<readonly unknown[]>,
    variant: String, tone: String, label: String, text: String,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const items = normalizeTagItems(props.roles ?? props.badges ?? props.roleLabels ?? props.value);
      const variant = firstText(props.variant, props.tone) ?? 'roles';
      return h('span', {
        class: 'oods-role-badge-list',
        'data-oods-component': 'RoleBadgeList',
        'data-badge-variant': variant,
      }, content.length
        ? content
        : items.length
          ? items.map((role, index) => h('span', { key: index, 'data-role-badge': 'true' }, role))
          : [firstText(props.label, props.text) ?? 'Roles']);
    };
  },
});

export const TagPills = defineComponent({
  name: 'OodsTagPills',
  props: {
    tags: Array as PropType<readonly unknown[]>,
    value: Array as PropType<readonly unknown[]>,
    maxVisible: [Number, String] as PropType<number | string>,
    overflowLabel: String,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const items = normalizeTagItems(props.tags ?? props.value);
      const limit = asCount(props.maxVisible) ?? items.length;
      const visible = items.slice(0, Math.max(0, limit));
      const overflow = items.length - visible.length;
      const template = firstText(props.overflowLabel);
      // {{ tag_count }} is the total tag count, exactly as renderTagPills substitutes it.
      const overflowText = overflow > 0
        ? template ? template.replace('{{ tag_count }}', String(items.length)) : `+${overflow}`
        : '';
      return h('div', {
        class: 'oods-tag-pills',
        'data-oods-component': 'TagPills',
        'data-summary-type': 'tag-pills',
      }, content.length ? content : [
        ...visible.map((tag, index) => h('span', { key: index, 'data-tag-pill': 'true' }, tag)),
        overflowText ? h('span', { 'data-tag-overflow': 'true' }, overflowText) : null,
      ]);
    };
  },
});

type TimelineItem = { label: string; timestamp?: string; detail?: string };

// Mirrors the HTML renderer's normalizeTimelineItems.
function normalizeTimelineItems(raw: unknown): TimelineItem[] {
  if (!Array.isArray(raw)) return [];
  const items: TimelineItem[] = [];
  for (const entry of raw) {
    if (entry === undefined || entry === null) continue;
    if (isRecord(entry)) {
      items.push({
        label: firstScalar(entry.label, entry.title, entry.event, entry.status, entry.state, entry.text, entry.name) ?? 'Event',
        timestamp: firstScalar(entry.timestamp, entry.datetime, entry.time, entry.at, entry.createdAt, entry.updatedAt),
        detail: firstScalar(entry.detail, entry.description, entry.reason, entry.message, entry.from, entry.to),
      });
      continue;
    }
    items.push({ label: typeof entry === 'object' ? JSON.stringify(entry) : String(entry) });
  }
  return items;
}

type TimelineFamilyOptions = {
  component: string;
  className: string;
  defaultTitle: string;
  timelineType: string;
  eventKeys: readonly string[];
};

// Every timeline-family log mirrors renderTimelineContainer; only the marker,
// data-timeline-type, default title and event keys differ.
function createTimelineFamily(options: TimelineFamilyOptions) {
  const props: Record<string, StringConstructor | PropType<readonly unknown[]>> = { title: String, label: String, heading: String, name: String };
  for (const key of options.eventKeys) props[key] = Array as PropType<readonly unknown[]>;
  return defineComponent({
    name: `Oods${options.component}`,
    props,
    setup(componentProps, { slots }) {
      return () => {
        const record = componentProps as Record<string, unknown>;
        const content = authoredContent(slots.default?.());
        const title = firstText(record.title, record.label, record.heading, record.name) ?? options.defaultTitle;
        const events = normalizeTimelineItems(options.eventKeys.map((key) => record[key]).find((value) => Array.isArray(value)));
        return h('div', {
          class: options.className,
          'data-oods-component': options.component,
          'data-timeline-type': options.timelineType,
          role: 'log',
          'aria-label': title,
        }, [
          h('h3', { 'data-timeline-title': 'true' }, title),
          h('ol', { 'data-timeline-events': 'true' }, content.length
            ? content
            : events.length
              ? events.map((item, index) => h('li', { key: index }, [h('article', { 'data-timeline-event': 'true' }, [
                  h('p', { 'data-timeline-label': 'true' }, item.label),
                  item.timestamp ? h('time', { 'data-timeline-time': 'true', datetime: item.timestamp }, item.timestamp) : null,
                  item.detail ? h('p', { 'data-timeline-detail': 'true' }, item.detail) : null,
                ])]))
              : [h('li', { 'data-timeline-empty': 'true' }, 'No events')]),
        ]);
      };
    },
  });
}

export const AddressValidationTimeline = createTimelineFamily({
  component: 'AddressValidationTimeline', className: 'oods-address-validation-timeline',
  defaultTitle: 'Address Validation Timeline', timelineType: 'address-validation', eventKeys: ['events', 'validations', 'history'],
});
export const MembershipAuditTimeline = createTimelineFamily({
  component: 'MembershipAuditTimeline', className: 'oods-membership-audit-timeline',
  defaultTitle: 'Membership Timeline', timelineType: 'membership', eventKeys: ['events', 'memberships', 'history'],
});
export const MessageEventTimeline = createTimelineFamily({
  component: 'MessageEventTimeline', className: 'oods-message-event-timeline',
  defaultTitle: 'Message Timeline', timelineType: 'message', eventKeys: ['events', 'messages', 'statuses'],
});
export const PreferenceTimeline = createTimelineFamily({
  component: 'PreferenceTimeline', className: 'oods-preference-timeline',
  defaultTitle: 'Preference Timeline', timelineType: 'preference', eventKeys: ['events', 'changes', 'history'],
});

export const AuditEvent = defineComponent({
  name: 'OodsAuditEvent',
  props: {
    label: String, title: String, event: String, status: String, state: String, reason: String, text: String,
    timestamp: String, datetime: String, time: String, at: String, createdAt: String, updatedAt: String,
    detail: String, description: String, message: String, from: String, to: String, code: String,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      // A lone reason is both the label and the detail, exactly as renderEventArticle shows it.
      const label = firstText(props.label, props.title, props.event, props.status, props.state, props.reason, props.text) ?? 'Audit Event';
      const timestamp = firstText(props.timestamp, props.datetime, props.time, props.at, props.createdAt, props.updatedAt);
      const detail = firstText(props.detail, props.description, props.reason, props.message, props.from, props.to, props.code);
      return h('article', {
        class: 'oods-audit-event',
        'data-oods-component': 'AuditEvent',
        'data-event-type': 'audit',
      }, content.length ? content : [
        timestamp ? h('time', { 'data-event-time': 'true', datetime: timestamp }, timestamp) : null,
        h('p', { 'data-event-label': 'true' }, label),
        detail ? h('p', { 'data-event-detail': 'true' }, detail) : null,
      ]);
    };
  },
});

type SelectChoice = { value: string; label: string };

// Mirrors the HTML renderer's normalizeSelectOptions (records read value/id/label, scalars render as text).
function normalizeSelectOptions(raw: unknown): SelectChoice[] {
  if (!Array.isArray(raw)) return [];
  const choices: SelectChoice[] = [];
  for (const entry of raw) {
    if (isRecord(entry)) {
      const text = (key: string) => (typeof entry[key] === 'string' && (entry[key] as string).length > 0 ? entry[key] as string : undefined);
      const value = text('value') ?? text('id') ?? text('label') ?? '';
      const label = text('label') ?? value;
      if (!value && !label) continue;
      choices.push({ value, label });
      continue;
    }
    if (entry === undefined || entry === null) continue;
    const value = typeof entry === 'object' ? JSON.stringify(entry) : String(entry);
    if (!value) continue;
    choices.push({ value, label: value });
  }
  return choices;
}

function selectOptionNodes(choices: SelectChoice[], selected: string | undefined): VNodeChild[] {
  return choices.length
    ? choices.map((choice, index) => h('option', { key: index, value: choice.value, selected: choice.value === selected }, choice.label))
    : [h('option', { value: '' }, 'Select...')];
}

const preventSubmit = (event: Event): void => { event.preventDefault(); };

const FORM_SHELL_PROPS = {
  title: String, label: String, heading: String, name: String, description: String, subtitle: String, hint: String,
} as const;

function formHeader(title: string, subtitle: string | undefined): VNodeChild {
  return h('header', { 'data-form-header': 'true' }, [
    h('h3', title),
    subtitle ? h('span', { 'data-form-subtitle': 'true' }, subtitle) : null,
  ]);
}

function fieldsetHeader(title: string, subtitle: string | undefined): VNodeChild[] {
  return [h('legend', title), subtitle ? h('span', { 'data-form-subtitle': 'true' }, subtitle) : null];
}

function addressRecord(form: HTMLFormElement | null): AddressEditorValue {
  const read = (name: string): string => {
    const control = form?.elements.namedItem(name);
    return control instanceof HTMLInputElement ? control.value : '';
  };
  return { street: read('street'), city: read('city'), region: read('region'), postalCode: read('postalCode') };
}

export const AddressEditor = defineComponent({
  name: 'OodsAddressEditor',
  props: {
    ...FORM_SHELL_PROPS,
    street: String, line1: String, addressLine1: String, city: String, region: String, state: String, postalCode: String, zip: String,
  },
  emits: { change: (_address: AddressEditorValue) => true },
  setup(props, { emit, slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const title = firstText(props.title, props.label, props.heading, props.name) ?? 'Address Editor';
      const subtitle = firstText(props.description, props.subtitle, props.hint);
      const publish = (event: Event) => emit('change', addressRecord((event.target as HTMLInputElement).form));
      const control = (fieldLabel: string, fieldName: string, initial: string | undefined) => h('label', { 'data-form-control': 'input' }, [
        h('span', fieldLabel),
        h('input', { type: 'text', name: fieldName, value: initial, onInput: publish }),
      ]);
      return h('form', {
        class: 'oods-address-editor',
        'data-oods-component': 'AddressEditor',
        'data-form-type': 'address-editor',
        onSubmit: preventSubmit,
      }, [
        formHeader(title, subtitle),
        h('div', { 'data-form-content': 'true' }, content.length ? content : [
          control('Street', 'street', firstText(props.street, props.line1, props.addressLine1)),
          control('City', 'city', firstText(props.city)),
          control('Region', 'region', firstText(props.region, props.state)),
          control('Postal Code', 'postalCode', firstText(props.postalCode, props.zip)),
        ]),
      ]);
    };
  },
});

export const PreferenceEditor = defineComponent({
  name: 'OodsPreferenceEditor',
  props: {
    ...FORM_SHELL_PROPS,
    namespaces: Array as PropType<readonly unknown[]>, namespace: String, document: String, json: String, value: String,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const title = firstText(props.title, props.label, props.heading, props.name) ?? 'Preference Editor';
      const subtitle = firstText(props.description, props.subtitle, props.hint);
      const choices = normalizeSelectOptions(Array.isArray(props.namespaces) ? props.namespaces : ['default']);
      const selected = firstText(props.namespace);
      return h('form', {
        class: 'oods-preference-editor',
        'data-oods-component': 'PreferenceEditor',
        'data-form-type': 'preference-editor',
        onSubmit: preventSubmit,
      }, [
        formHeader(title, subtitle),
        h('div', { 'data-form-content': 'true' }, content.length ? content : [
          h('label', { 'data-form-control': 'select' }, [h('span', 'Namespace'), h('select', { name: 'namespace', value: selected }, selectOptionNodes(choices, selected))]),
          h('label', { 'data-form-control': 'textarea' }, [h('span', 'Preference Document'), h('textarea', { name: 'preferenceDocument', value: firstScalar(props.document, props.json, props.value) ?? '' })]),
        ]),
      ]);
    };
  },
});

export const RoleAssignmentForm = defineComponent({
  name: 'OodsRoleAssignmentForm',
  props: {
    ...FORM_SHELL_PROPS,
    roles: Array as PropType<readonly unknown[]>, availableRoles: Array as PropType<readonly unknown[]>,
    role: String, defaultRoleId: String, assignee: String, member: String,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const title = firstText(props.title, props.label, props.heading, props.name) ?? 'Role Assignment';
      const subtitle = firstText(props.description, props.subtitle, props.hint);
      const choices = normalizeSelectOptions(props.roles ?? props.availableRoles ?? []);
      const selected = firstText(props.role, props.defaultRoleId);
      return h('form', {
        class: 'oods-role-assignment-form',
        'data-oods-component': 'RoleAssignmentForm',
        'data-form-type': 'role-assignment',
        onSubmit: preventSubmit,
      }, [
        formHeader(title, subtitle),
        h('div', { 'data-form-content': 'true' }, content.length ? content : [
          h('label', { 'data-form-control': 'select' }, [h('span', 'Role'), h('select', { name: 'role', value: selected }, selectOptionNodes(choices, selected))]),
          h('label', { 'data-form-control': 'input' }, [h('span', 'Assignee'), h('input', { type: 'text', name: 'assignee', value: firstText(props.assignee, props.member) })]),
        ]),
      ]);
    };
  },
});

export const StatusSelector = defineComponent({
  name: 'OodsStatusSelector',
  props: {
    label: String, title: String,
    options: Array as PropType<readonly unknown[]>, states: Array as PropType<readonly unknown[]>,
    value: String, status: String, modelValue: String,
  },
  emits: { 'update:modelValue': (_value: string) => true, change: (_value: string) => true },
  setup(props, { emit, slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const label = firstText(props.label, props.title) ?? 'Status';
      const choices = normalizeSelectOptions(props.options ?? props.states ?? ['draft', 'active', 'inactive']);
      const selected = props.modelValue ?? props.value ?? firstText(props.status);
      const onChange = (event: Event) => {
        const next = (event.target as HTMLSelectElement).value;
        emit('update:modelValue', next);
        emit('change', next);
      };
      return h('div', {
        class: 'oods-status-selector',
        'data-oods-component': 'StatusSelector',
        'data-summary-type': 'status-selector',
      }, content.length ? content : [
        h('label', { 'data-form-control': 'select' }, [
          h('span', label),
          h('select', { name: 'status', value: selected, onChange }, selectOptionNodes(choices, selected)),
        ]),
      ]);
    };
  },
});

export const TagInput = defineComponent({
  name: 'OodsTagInput',
  props: {
    ...FORM_SHELL_PROPS,
    tags: Array as PropType<readonly unknown[]>, value: String, placeholder: String, modelValue: String,
  },
  emits: { 'update:modelValue': (_value: string) => true, input: (_value: string) => true, change: (_value: string) => true },
  setup(props, { emit, slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const title = firstText(props.title, props.label, props.heading, props.name) ?? 'Tag Input';
      const subtitle = firstText(props.description, props.subtitle, props.hint);
      const items = normalizeTagItems(props.tags);
      const current = props.modelValue ?? props.value;
      const read = (event: Event) => (event.target as HTMLInputElement).value;
      return h('fieldset', {
        class: 'oods-tag-input',
        'data-oods-component': 'TagInput',
        'data-form-type': 'tag-input',
      }, [
        ...fieldsetHeader(title, subtitle),
        h('div', { 'data-form-content': 'true' }, content.length ? content : [
          h('label', { 'data-form-control': 'input' }, [
            h('span', 'Tag'),
            h('input', {
              type: 'text', name: 'tag', placeholder: firstText(props.placeholder), value: current,
              onInput: (event: Event) => { emit('update:modelValue', read(event)); emit('input', read(event)); },
              onChange: (event: Event) => emit('change', read(event)),
            }),
          ]),
          items.length ? h('div', { 'data-tag-list': 'true' }, items.map((tag, index) => h('span', { key: index, 'data-tag-item': 'true' }, tag))) : null,
        ]),
      ]);
    };
  },
});

export const TemplatePicker = defineComponent({
  name: 'OodsTemplatePicker',
  props: {
    ...FORM_SHELL_PROPS,
    templates: Array as PropType<readonly unknown[]>, options: Array as PropType<readonly unknown[]>, templateId: String, value: String,
    channels: Array as PropType<readonly unknown[]>, channel: String,
  },
  setup(props, { slots }) {
    return () => {
      const content = authoredContent(slots.default?.());
      const title = firstText(props.title, props.label, props.heading, props.name) ?? 'Template Picker';
      const subtitle = firstText(props.description, props.subtitle, props.hint);
      const templateChoices = normalizeSelectOptions(props.templates ?? props.options ?? []);
      const channelChoices = normalizeSelectOptions(props.channels ?? ['email', 'sms', 'in_app']);
      const selectedTemplate = firstText(props.templateId, props.value);
      const selectedChannel = firstText(props.channel);
      return h('fieldset', {
        class: 'oods-template-picker',
        'data-oods-component': 'TemplatePicker',
        'data-form-type': 'template-picker',
      }, [
        ...fieldsetHeader(title, subtitle),
        h('div', { 'data-form-content': 'true' }, content.length ? content : [
          h('label', { 'data-form-control': 'select' }, [h('span', 'Template'), h('select', { name: 'template', value: selectedTemplate }, selectOptionNodes(templateChoices, selectedTemplate))]),
          h('label', { 'data-form-control': 'select' }, [h('span', 'Channel'), h('select', { name: 'channel', value: selectedChannel }, selectOptionNodes(channelChoices, selectedChannel))]),
        ]),
      ]);
    };
  },
});
