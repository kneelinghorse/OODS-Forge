import * as vue from 'vue';
import { PropType, VNode } from 'vue';

type ComponentTone = 'neutral' | 'info' | 'accent' | 'positive' | 'success' | 'warning' | 'critical' | 'danger';
type ComponentEmphasis = 'subtle' | 'solid';

type TimelineEvent = {
    label: string;
    timestamp?: string;
    detail?: string;
    actorId?: string;
    reason?: string;
};
type PaginationItem = {
    type: 'page' | 'ellipsis' | 'previous' | 'next';
    page?: number;
    selected: boolean;
    disabled: boolean;
    index?: number;
};
type StatusMetadata = {
    description: string;
    tone: ComponentTone;
    icon: string;
};
type StatusPresentation = StatusMetadata & {
    label: string;
};

type StatusBadgeProps = {
    content?: string | number;
    status?: string;
    value?: string;
    label?: string;
    domain?: string;
    tone?: ComponentTone | 'lifecycle';
    emphasis?: ComponentEmphasis;
    showIcon?: boolean;
    field?: string;
    statusField?: string;
    domainField?: string;
    readOnly?: boolean;
    compact?: boolean;
    variant?: string;
};
type PriceBadgeProps = {
    amountCents?: number;
    unitAmountCents?: number;
    amount?: number;
    unitAmount?: number;
    currency?: string;
    currencyCode?: string;
    label?: string;
    value?: string | number;
    emphasis?: ComponentEmphasis;
    field?: string;
    amountField?: string;
    currencyField?: string;
    intervalField?: string;
    minorUnitsParameter?: string;
};
type TimelineProps = {
    title?: string;
    source?: readonly unknown[];
    events?: readonly unknown[];
    history?: readonly unknown[];
    entries?: readonly unknown[];
    stateHistory?: readonly unknown[];
    auditLog?: readonly unknown[];
    status?: string;
    allowedTransitions?: readonly string[];
    showActorId?: boolean;
    showReason?: boolean;
    maxVisible?: number;
    field?: string;
    historyField?: string;
    statesParameter?: string;
    auditLogField?: string;
    createdField?: string;
    updatedField?: string;
    eventField?: string;
    eventTimestampField?: string;
    eventOptionsParameter?: string;
    showFromState?: boolean;
};
type CancellationSummaryProps = {
    title?: string;
    label?: string;
    cancelAtPeriodEnd?: boolean;
    requestedAt?: string;
    reason?: string;
    code?: string;
    field?: string;
    cancelAtPeriodEndField?: string;
    requestedAtField?: string;
    reasonField?: string;
    codeField?: string;
};
type SearchInputProps = {
    id?: string;
    label?: string;
    modelValue?: string;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    clearable?: boolean;
    debounceMs?: number;
    debounce?: number;
    minQueryLength?: number;
    disabled?: boolean;
    field?: string;
    placeholderParameter?: string;
    debounceParameter?: string;
    minQueryLengthParameter?: string;
    clearableParameter?: string;
};
type PaginationBarProps = {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
    pageSizeOptions?: readonly number[];
    showPageSizeSelector?: boolean;
    showGotoPage?: boolean;
    showItemRange?: boolean;
    pageField?: string;
    pageSizeField?: string;
    totalItemsField?: string;
    totalPagesField?: string;
    pageSizeOptionsParameter?: string;
    showPageSizeSelectorParameter?: string;
    showGotoPageParameter?: string;
    showItemRangeParameter?: string;
};
type RelativeTimestampProps = {
    datetime?: string;
    timestamp?: string;
    value?: string;
    updatedAt?: string;
    createdAt?: string;
    relative?: string;
    label?: string;
    text?: string;
    timezone?: string;
    now?: string | number | Date;
    field?: string;
    fallbackField?: string;
    timezoneParameter?: string;
};
declare const StatusBadge: vue.DefineComponent<vue.ExtractPropTypes<{
    content: {
        type: PropType<string | number>;
        default: undefined;
    };
    status: StringConstructor;
    value: StringConstructor;
    label: StringConstructor;
    domain: {
        type: StringConstructor;
        default: string;
    };
    tone: PropType<ComponentTone | "lifecycle">;
    emphasis: {
        type: PropType<ComponentEmphasis>;
        default: string;
    };
    showIcon: {
        type: BooleanConstructor;
        default: boolean;
    };
    field: StringConstructor;
    statusField: StringConstructor;
    domainField: StringConstructor;
    readOnly: BooleanConstructor;
    compact: BooleanConstructor;
    variant: StringConstructor;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    content: {
        type: PropType<string | number>;
        default: undefined;
    };
    status: StringConstructor;
    value: StringConstructor;
    label: StringConstructor;
    domain: {
        type: StringConstructor;
        default: string;
    };
    tone: PropType<ComponentTone | "lifecycle">;
    emphasis: {
        type: PropType<ComponentEmphasis>;
        default: string;
    };
    showIcon: {
        type: BooleanConstructor;
        default: boolean;
    };
    field: StringConstructor;
    statusField: StringConstructor;
    domainField: StringConstructor;
    readOnly: BooleanConstructor;
    compact: BooleanConstructor;
    variant: StringConstructor;
}>> & Readonly<{}>, {
    readOnly: boolean;
    compact: boolean;
    content: string | number;
    domain: string;
    emphasis: ComponentEmphasis;
    showIcon: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const PriceBadge: vue.DefineComponent<vue.ExtractPropTypes<{
    amountCents: NumberConstructor;
    unitAmountCents: NumberConstructor;
    amount: NumberConstructor;
    unitAmount: NumberConstructor;
    currency: StringConstructor;
    currencyCode: StringConstructor;
    label: StringConstructor;
    value: PropType<string | number>;
    emphasis: {
        type: PropType<ComponentEmphasis>;
        default: string;
    };
    field: StringConstructor;
    amountField: StringConstructor;
    currencyField: StringConstructor;
    intervalField: StringConstructor;
    minorUnitsParameter: StringConstructor;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    amountCents: NumberConstructor;
    unitAmountCents: NumberConstructor;
    amount: NumberConstructor;
    unitAmount: NumberConstructor;
    currency: StringConstructor;
    currencyCode: StringConstructor;
    label: StringConstructor;
    value: PropType<string | number>;
    emphasis: {
        type: PropType<ComponentEmphasis>;
        default: string;
    };
    field: StringConstructor;
    amountField: StringConstructor;
    currencyField: StringConstructor;
    intervalField: StringConstructor;
    minorUnitsParameter: StringConstructor;
}>> & Readonly<{}>, {
    emphasis: ComponentEmphasis;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const StatusTimeline: vue.DefineComponent<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly source: PropType<unknown[]>;
    readonly events: PropType<unknown[]>;
    readonly history: PropType<unknown[]>;
    readonly entries: PropType<unknown[]>;
    readonly stateHistory: PropType<unknown[]>;
    readonly auditLog: PropType<unknown[]>;
    readonly status: StringConstructor;
    readonly allowedTransitions: PropType<string[]>;
    readonly showActorId: {
        readonly type: BooleanConstructor;
        readonly default: true;
    };
    readonly showReason: {
        readonly type: BooleanConstructor;
        readonly default: true;
    };
    readonly maxVisible: NumberConstructor;
    readonly field: StringConstructor;
    readonly historyField: StringConstructor;
    readonly statesParameter: StringConstructor;
    readonly auditLogField: StringConstructor;
    readonly createdField: StringConstructor;
    readonly updatedField: StringConstructor;
    readonly eventField: StringConstructor;
    readonly eventTimestampField: StringConstructor;
    readonly eventOptionsParameter: StringConstructor;
    readonly showFromState: BooleanConstructor;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly source: PropType<unknown[]>;
    readonly events: PropType<unknown[]>;
    readonly history: PropType<unknown[]>;
    readonly entries: PropType<unknown[]>;
    readonly stateHistory: PropType<unknown[]>;
    readonly auditLog: PropType<unknown[]>;
    readonly status: StringConstructor;
    readonly allowedTransitions: PropType<string[]>;
    readonly showActorId: {
        readonly type: BooleanConstructor;
        readonly default: true;
    };
    readonly showReason: {
        readonly type: BooleanConstructor;
        readonly default: true;
    };
    readonly maxVisible: NumberConstructor;
    readonly field: StringConstructor;
    readonly historyField: StringConstructor;
    readonly statesParameter: StringConstructor;
    readonly auditLogField: StringConstructor;
    readonly createdField: StringConstructor;
    readonly updatedField: StringConstructor;
    readonly eventField: StringConstructor;
    readonly eventTimestampField: StringConstructor;
    readonly eventOptionsParameter: StringConstructor;
    readonly showFromState: BooleanConstructor;
}>> & Readonly<{}>, {
    readonly showActorId: boolean;
    readonly showReason: boolean;
    readonly showFromState: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const AuditTimeline: vue.DefineComponent<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly source: PropType<unknown[]>;
    readonly events: PropType<unknown[]>;
    readonly history: PropType<unknown[]>;
    readonly entries: PropType<unknown[]>;
    readonly stateHistory: PropType<unknown[]>;
    readonly auditLog: PropType<unknown[]>;
    readonly status: StringConstructor;
    readonly allowedTransitions: PropType<string[]>;
    readonly showActorId: {
        readonly type: BooleanConstructor;
        readonly default: true;
    };
    readonly showReason: {
        readonly type: BooleanConstructor;
        readonly default: true;
    };
    readonly maxVisible: NumberConstructor;
    readonly field: StringConstructor;
    readonly historyField: StringConstructor;
    readonly statesParameter: StringConstructor;
    readonly auditLogField: StringConstructor;
    readonly createdField: StringConstructor;
    readonly updatedField: StringConstructor;
    readonly eventField: StringConstructor;
    readonly eventTimestampField: StringConstructor;
    readonly eventOptionsParameter: StringConstructor;
    readonly showFromState: BooleanConstructor;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly source: PropType<unknown[]>;
    readonly events: PropType<unknown[]>;
    readonly history: PropType<unknown[]>;
    readonly entries: PropType<unknown[]>;
    readonly stateHistory: PropType<unknown[]>;
    readonly auditLog: PropType<unknown[]>;
    readonly status: StringConstructor;
    readonly allowedTransitions: PropType<string[]>;
    readonly showActorId: {
        readonly type: BooleanConstructor;
        readonly default: true;
    };
    readonly showReason: {
        readonly type: BooleanConstructor;
        readonly default: true;
    };
    readonly maxVisible: NumberConstructor;
    readonly field: StringConstructor;
    readonly historyField: StringConstructor;
    readonly statesParameter: StringConstructor;
    readonly auditLogField: StringConstructor;
    readonly createdField: StringConstructor;
    readonly updatedField: StringConstructor;
    readonly eventField: StringConstructor;
    readonly eventTimestampField: StringConstructor;
    readonly eventOptionsParameter: StringConstructor;
    readonly showFromState: BooleanConstructor;
}>> & Readonly<{}>, {
    readonly showActorId: boolean;
    readonly showReason: boolean;
    readonly showFromState: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const CancellationSummary: vue.DefineComponent<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    cancelAtPeriodEnd: {
        type: BooleanConstructor;
        default: undefined;
    };
    requestedAt: StringConstructor;
    reason: StringConstructor;
    code: StringConstructor;
    field: StringConstructor;
    cancelAtPeriodEndField: StringConstructor;
    requestedAtField: StringConstructor;
    reasonField: StringConstructor;
    codeField: StringConstructor;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    cancelAtPeriodEnd: {
        type: BooleanConstructor;
        default: undefined;
    };
    requestedAt: StringConstructor;
    reason: StringConstructor;
    code: StringConstructor;
    field: StringConstructor;
    cancelAtPeriodEndField: StringConstructor;
    requestedAtField: StringConstructor;
    reasonField: StringConstructor;
    codeField: StringConstructor;
}>> & Readonly<{}>, {
    cancelAtPeriodEnd: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const SearchInput: vue.DefineComponent<vue.ExtractPropTypes<{
    id: StringConstructor;
    label: StringConstructor;
    modelValue: StringConstructor;
    value: StringConstructor;
    defaultValue: {
        type: StringConstructor;
        default: string;
    };
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    clearable: {
        type: BooleanConstructor;
        default: boolean;
    };
    debounceMs: {
        type: NumberConstructor;
        default: number;
    };
    debounce: NumberConstructor;
    minQueryLength: {
        type: NumberConstructor;
        default: number;
    };
    disabled: BooleanConstructor;
    field: StringConstructor;
    placeholderParameter: StringConstructor;
    debounceParameter: StringConstructor;
    minQueryLengthParameter: StringConstructor;
    clearableParameter: StringConstructor;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (_value: string) => true;
    valueChange: (_value: string) => true;
    update: (_value: string) => true;
    input: (_value: string) => true;
    search: (_value: string) => true;
    clear: () => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    id: StringConstructor;
    label: StringConstructor;
    modelValue: StringConstructor;
    value: StringConstructor;
    defaultValue: {
        type: StringConstructor;
        default: string;
    };
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    clearable: {
        type: BooleanConstructor;
        default: boolean;
    };
    debounceMs: {
        type: NumberConstructor;
        default: number;
    };
    debounce: NumberConstructor;
    minQueryLength: {
        type: NumberConstructor;
        default: number;
    };
    disabled: BooleanConstructor;
    field: StringConstructor;
    placeholderParameter: StringConstructor;
    debounceParameter: StringConstructor;
    minQueryLengthParameter: StringConstructor;
    clearableParameter: StringConstructor;
}>> & Readonly<{
    onInput?: ((_value: string) => any) | undefined;
    onSearch?: ((_value: string) => any) | undefined;
    onClear?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((_value: string) => any) | undefined;
    onValueChange?: ((_value: string) => any) | undefined;
    onUpdate?: ((_value: string) => any) | undefined;
}>, {
    disabled: boolean;
    defaultValue: string;
    placeholder: string;
    clearable: boolean;
    debounceMs: number;
    minQueryLength: number;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const PaginationBar: vue.DefineComponent<vue.ExtractPropTypes<{
    page: {
        type: NumberConstructor;
        default: number;
    };
    pageSize: {
        type: NumberConstructor;
        default: number;
    };
    totalItems: {
        type: NumberConstructor;
        default: number;
    };
    totalPages: NumberConstructor;
    pageSizeOptions: {
        type: PropType<number[]>;
        default: () => number[];
    };
    showPageSizeSelector: BooleanConstructor;
    showGotoPage: BooleanConstructor;
    showItemRange: {
        type: BooleanConstructor;
        default: boolean;
    };
    pageField: StringConstructor;
    pageSizeField: StringConstructor;
    totalItemsField: StringConstructor;
    totalPagesField: StringConstructor;
    pageSizeOptionsParameter: StringConstructor;
    showPageSizeSelectorParameter: StringConstructor;
    showGotoPageParameter: StringConstructor;
    showItemRangeParameter: StringConstructor;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:page': (_page: number) => true;
    pageChange: (_page: number) => true;
    change: (_page: number) => true;
    update: (_page: number) => true;
    pageSizeChange: (_pageSize: number) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    page: {
        type: NumberConstructor;
        default: number;
    };
    pageSize: {
        type: NumberConstructor;
        default: number;
    };
    totalItems: {
        type: NumberConstructor;
        default: number;
    };
    totalPages: NumberConstructor;
    pageSizeOptions: {
        type: PropType<number[]>;
        default: () => number[];
    };
    showPageSizeSelector: BooleanConstructor;
    showGotoPage: BooleanConstructor;
    showItemRange: {
        type: BooleanConstructor;
        default: boolean;
    };
    pageField: StringConstructor;
    pageSizeField: StringConstructor;
    totalItemsField: StringConstructor;
    totalPagesField: StringConstructor;
    pageSizeOptionsParameter: StringConstructor;
    showPageSizeSelectorParameter: StringConstructor;
    showGotoPageParameter: StringConstructor;
    showItemRangeParameter: StringConstructor;
}>> & Readonly<{
    onChange?: ((_page: number) => any) | undefined;
    onUpdate?: ((_page: number) => any) | undefined;
    "onUpdate:page"?: ((_page: number) => any) | undefined;
    onPageChange?: ((_page: number) => any) | undefined;
    onPageSizeChange?: ((_pageSize: number) => any) | undefined;
}>, {
    showPageSizeSelector: boolean;
    showGotoPage: boolean;
    page: number;
    pageSize: number;
    totalItems: number;
    pageSizeOptions: number[];
    showItemRange: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const RelativeTimestamp: vue.DefineComponent<vue.ExtractPropTypes<{
    datetime: StringConstructor;
    timestamp: StringConstructor;
    value: StringConstructor;
    updatedAt: StringConstructor;
    createdAt: StringConstructor;
    relative: StringConstructor;
    label: StringConstructor;
    text: StringConstructor;
    timezone: StringConstructor;
    now: PropType<string | number | Date>;
    field: StringConstructor;
    fallbackField: StringConstructor;
    timezoneParameter: StringConstructor;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    datetime: StringConstructor;
    timestamp: StringConstructor;
    value: StringConstructor;
    updatedAt: StringConstructor;
    createdAt: StringConstructor;
    relative: StringConstructor;
    label: StringConstructor;
    text: StringConstructor;
    timezone: StringConstructor;
    now: PropType<string | number | Date>;
    field: StringConstructor;
    fallbackField: StringConstructor;
    timezoneParameter: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { AuditTimeline, CancellationSummary, type CancellationSummaryProps, PaginationBar, type PaginationBarProps, type PaginationItem, PriceBadge, type PriceBadgeProps, RelativeTimestamp, type RelativeTimestampProps, SearchInput, type SearchInputProps, StatusBadge, type StatusBadgeProps, type StatusPresentation, StatusTimeline, type TimelineEvent, type TimelineProps };
