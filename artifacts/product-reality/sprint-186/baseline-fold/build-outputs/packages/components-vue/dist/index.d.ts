import * as vue from 'vue';
import { VNodeChild, PropType, VNode } from 'vue';

type ComponentTone = 'neutral' | 'info' | 'accent' | 'positive' | 'success' | 'warning' | 'critical' | 'danger';
type ComponentEmphasis = 'subtle' | 'solid';
type ComponentSize = 'sm' | 'md' | 'lg';
type LayoutGap = 'xs' | 'sm' | 'md' | 'lg' | string;
type ValidationMessage = {
    state: 'error' | 'warning' | 'success';
    message: string;
};
type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};
type TableColumn = {
    key: string;
    label: string;
};
type TableRecord = {
    id: string;
    [key: string]: unknown;
};
type TabItem = {
    id: string;
    label: VNodeChild;
    panel: VNodeChild;
    disabled?: boolean;
    /** Compatibility alias for existing OODS item fixtures. */
    isDisabled?: boolean;
};
type TextElement = 'span' | 'p' | 'strong' | 'em' | 'small' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeaderElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;
type DetailHeaderProps = {
    title?: string;
    label?: string;
    text?: string;
    subtitle?: string;
    sublabel?: string;
    description?: string;
    metadata?: string;
    meta?: string;
    level?: HeaderLevel;
    as?: HeaderElement;
};
type CardHeaderProps = {
    title?: string;
    label?: string;
    text?: string;
    supporting?: string;
    supportingText?: string;
    subtitle?: string;
    description?: string;
    level?: HeaderLevel;
    as?: HeaderElement;
};
type ColorSwatchProps = {
    color?: string;
    value?: string;
    state?: string;
    label?: string;
};
type ColorizedBadgeProps = {
    label?: string;
    text?: string;
    state?: string;
    value?: string;
    status?: string;
    color?: string;
    hue?: string;
    swatch?: string;
    variant?: string;
    tone?: ComponentTone;
    emphasis?: ComponentEmphasis;
};
type VizAreaPreviewProps = {
    width?: number;
    height?: number;
};
/** renderPanelSection aliases shared by every panel-family component. */
type PanelSectionProps = {
    title?: string;
    label?: string;
    heading?: string;
    name?: string;
    subtitle?: string;
    description?: string;
    metadata?: string;
    summary?: string;
    text?: string;
    body?: string;
    emptyMessage?: string;
};
type ClassificationPanelProps = PanelSectionProps;
type AddressCollectionPanelProps = PanelSectionProps;
type MembershipPanelProps = PanelSectionProps;
type PreferencePanelProps = PanelSectionProps;
type TagManagerProps = {
    title?: string;
    label?: string;
    heading?: string;
    name?: string;
    description?: string;
    subtitle?: string;
    hint?: string;
    /** Tag entries as the HTML renderer reads them: records use label/name/role/value/id, scalars render as text. */
    tags?: readonly unknown[];
    value?: readonly unknown[];
};
/** Shared shape of the badge-family summaries over the Badge substrate. */
type BadgeFamilyProps = {
    label?: string;
    text?: string;
    value?: string;
    status?: string;
    state?: string;
    variant?: string;
    tone?: ComponentTone;
    emphasis?: ComponentEmphasis;
};
/** role is the address role that names the status; never an ARIA role. */
type AddressSummaryBadgeProps = BadgeFamilyProps & {
    role?: string;
};
type MessageStatusBadgeProps = BadgeFamilyProps & {
    delivery?: string;
};
type PreferenceSummaryBadgeProps = BadgeFamilyProps & {
    namespace?: string;
    version?: string;
};
type RoleBadgeListProps = {
    roles?: readonly unknown[];
    badges?: readonly unknown[];
    roleLabels?: readonly unknown[];
    value?: readonly unknown[];
    variant?: string;
    tone?: string;
    label?: string;
    text?: string;
};
type TagPillsProps = {
    tags?: readonly unknown[];
    value?: readonly unknown[];
    maxVisible?: number | string;
    overflowLabel?: string;
};
/** Timeline-family logs over renderTimelineContainer semantics; the event keys differ per family. */
type TimelineFamilyProps = {
    title?: string;
    label?: string;
    heading?: string;
    name?: string;
    events?: readonly unknown[];
};
type AddressValidationTimelineProps = TimelineFamilyProps & {
    validations?: readonly unknown[];
    history?: readonly unknown[];
};
type MembershipAuditTimelineProps = TimelineFamilyProps & {
    memberships?: readonly unknown[];
    history?: readonly unknown[];
};
type MessageEventTimelineProps = TimelineFamilyProps & {
    messages?: readonly unknown[];
    statuses?: readonly unknown[];
};
type PreferenceTimelineProps = TimelineFamilyProps & {
    changes?: readonly unknown[];
    history?: readonly unknown[];
};
type AuditEventProps = {
    label?: string;
    title?: string;
    event?: string;
    status?: string;
    state?: string;
    reason?: string;
    text?: string;
    timestamp?: string;
    datetime?: string;
    time?: string;
    at?: string;
    createdAt?: string;
    updatedAt?: string;
    detail?: string;
    description?: string;
    message?: string;
    from?: string;
    to?: string;
    code?: string;
};
/** renderFormContainer aliases shared by every form-family component. */
type FormShellProps = {
    title?: string;
    label?: string;
    heading?: string;
    name?: string;
    description?: string;
    subtitle?: string;
    hint?: string;
};
/** The record an AddressEditor hands its consumer on every edit. */
type AddressEditorValue = {
    street: string;
    city: string;
    region: string;
    postalCode: string;
};
type AddressEditorProps = FormShellProps & {
    street?: string;
    line1?: string;
    addressLine1?: string;
    city?: string;
    region?: string;
    state?: string;
    postalCode?: string;
    zip?: string;
};
type PreferenceEditorProps = FormShellProps & {
    namespaces?: readonly unknown[];
    namespace?: string;
    document?: string;
    json?: string;
    value?: string;
};
type RoleAssignmentFormProps = FormShellProps & {
    roles?: readonly unknown[];
    availableRoles?: readonly unknown[];
    role?: string;
    defaultRoleId?: string;
    assignee?: string;
    member?: string;
};
type StatusSelectorProps = {
    label?: string;
    title?: string;
    options?: readonly unknown[];
    states?: readonly unknown[];
    value?: string;
    status?: string;
    modelValue?: string;
};
type TagInputProps = FormShellProps & {
    tags?: readonly unknown[];
    value?: string;
    placeholder?: string;
    modelValue?: string;
};
type TemplatePickerProps = FormShellProps & {
    templates?: readonly unknown[];
    options?: readonly unknown[];
    templateId?: string;
    value?: string;
    channels?: readonly unknown[];
    channel?: string;
};
/** A saved-schema filter descriptor; the renderer reads label and field, exactly as the HTML renderer does. */
type FilterDescriptor = Readonly<Record<string, unknown>>;
type FilterPanelProps = {
    filters?: readonly FilterDescriptor[];
    activeFilters?: readonly FilterDescriptor[];
    mode?: string;
    collapsible?: boolean;
};
type PriceSummaryProps = {
    title?: string;
    label?: string;
    heading?: string;
    name?: string;
    amount?: string | number;
    amountCents?: string | number;
    unitAmountCents?: string | number;
    currency?: string;
    currencyCode?: string;
    model?: string;
    pricingModel?: string;
    interval?: string;
    billingInterval?: string;
    summary?: string;
    text?: string;
    description?: string;
};

declare const Badge: vue.DefineComponent<vue.ExtractPropTypes<{
    content: {
        type: PropType<string | number>;
        default: undefined;
    };
    status: StringConstructor;
    domain: {
        type: StringConstructor;
        default: string;
    };
    tone: PropType<ComponentTone>;
    emphasis: {
        type: PropType<ComponentEmphasis>;
        default: string;
    };
    icon: {
        type: PropType<VNodeChild>;
        default: undefined;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    content: {
        type: PropType<string | number>;
        default: undefined;
    };
    status: StringConstructor;
    domain: {
        type: StringConstructor;
        default: string;
    };
    tone: PropType<ComponentTone>;
    emphasis: {
        type: PropType<ComponentEmphasis>;
        default: string;
    };
    icon: {
        type: PropType<VNodeChild>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    content: string | number;
    domain: string;
    emphasis: ComponentEmphasis;
    icon: VNodeChild;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Banner: vue.DefineComponent<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
    detail: {
        type: StringConstructor;
        default: string;
    };
    content: {
        type: PropType<string | number>;
        default: string;
    };
    status: StringConstructor;
    domain: {
        type: StringConstructor;
        default: string;
    };
    tone: PropType<ComponentTone>;
    emphasis: {
        type: PropType<ComponentEmphasis>;
        default: string;
    };
    dismissLabel: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    dismiss: () => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
    detail: {
        type: StringConstructor;
        default: string;
    };
    content: {
        type: PropType<string | number>;
        default: string;
    };
    status: StringConstructor;
    domain: {
        type: StringConstructor;
        default: string;
    };
    tone: PropType<ComponentTone>;
    emphasis: {
        type: PropType<ComponentEmphasis>;
        default: string;
    };
    dismissLabel: StringConstructor;
}>> & Readonly<{
    onDismiss?: (() => any) | undefined;
}>, {
    content: string | number;
    domain: string;
    emphasis: ComponentEmphasis;
    title: string;
    detail: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Button: vue.DefineComponent<vue.ExtractPropTypes<{
    content: {
        type: PropType<string | number>;
        default: string;
    };
    intent: {
        type: StringConstructor;
        default: string;
    };
    size: {
        type: PropType<ComponentSize>;
        default: string;
    };
    disabled: BooleanConstructor;
    type: {
        type: PropType<"button" | "reset" | "submit">;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    activate: (_event: MouseEvent) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    content: {
        type: PropType<string | number>;
        default: string;
    };
    intent: {
        type: StringConstructor;
        default: string;
    };
    size: {
        type: PropType<ComponentSize>;
        default: string;
    };
    disabled: BooleanConstructor;
    type: {
        type: PropType<"button" | "reset" | "submit">;
        default: string;
    };
}>> & Readonly<{
    onActivate?: ((_event: MouseEvent) => any) | undefined;
}>, {
    content: string | number;
    type: "button" | "reset" | "submit";
    disabled: boolean;
    intent: string;
    size: ComponentSize;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Card: vue.DefineComponent<vue.ExtractPropTypes<{
    elevated: BooleanConstructor;
    as: {
        type: StringConstructor;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    elevated: BooleanConstructor;
    as: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    elevated: boolean;
    as: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Grid: vue.DefineComponent<vue.ExtractPropTypes<{
    columns: {
        type: PropType<string | number>;
        default: string;
    };
    minColumnWidth: {
        type: StringConstructor;
        default: string;
    };
    gap: {
        type: PropType<string>;
        default: string;
    };
    align: {
        type: StringConstructor;
        default: string;
    };
    justify: {
        type: StringConstructor;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    columns: {
        type: PropType<string | number>;
        default: string;
    };
    minColumnWidth: {
        type: StringConstructor;
        default: string;
    };
    gap: {
        type: PropType<string>;
        default: string;
    };
    align: {
        type: StringConstructor;
        default: string;
    };
    justify: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    columns: string | number;
    minColumnWidth: string;
    gap: string;
    align: string;
    justify: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Stack: vue.DefineComponent<vue.ExtractPropTypes<{
    direction: {
        type: PropType<"row" | "column">;
        default: string;
    };
    gap: {
        type: PropType<string>;
        default: string;
    };
    align: {
        type: StringConstructor;
        default: string;
    };
    justify: {
        type: StringConstructor;
        default: string;
    };
    wrap: BooleanConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    direction: {
        type: PropType<"row" | "column">;
        default: string;
    };
    gap: {
        type: PropType<string>;
        default: string;
    };
    align: {
        type: StringConstructor;
        default: string;
    };
    justify: {
        type: StringConstructor;
        default: string;
    };
    wrap: BooleanConstructor;
}>> & Readonly<{}>, {
    gap: string;
    align: string;
    justify: string;
    wrap: boolean;
    direction: "row" | "column";
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Text: vue.DefineComponent<vue.ExtractPropTypes<{
    content: {
        type: PropType<string | number>;
        default: string;
    };
    label: StringConstructor;
    as: {
        type: PropType<TextElement>;
        default: string;
    };
    size: {
        type: PropType<ComponentSize>;
        default: string;
    };
    weight: {
        type: StringConstructor;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    content: {
        type: PropType<string | number>;
        default: string;
    };
    label: StringConstructor;
    as: {
        type: PropType<TextElement>;
        default: string;
    };
    size: {
        type: PropType<ComponentSize>;
        default: string;
    };
    weight: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    content: string | number;
    size: ComponentSize;
    as: TextElement;
    weight: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

declare const DetailHeader: vue.DefineComponent<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    text: StringConstructor;
    subtitle: StringConstructor;
    sublabel: StringConstructor;
    description: StringConstructor;
    metadata: StringConstructor;
    meta: StringConstructor;
    as: PropType<HeaderElement>;
    level: PropType<HeaderLevel>;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    text: StringConstructor;
    subtitle: StringConstructor;
    sublabel: StringConstructor;
    description: StringConstructor;
    metadata: StringConstructor;
    meta: StringConstructor;
    as: PropType<HeaderElement>;
    level: PropType<HeaderLevel>;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const CardHeader: vue.DefineComponent<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    text: StringConstructor;
    supporting: StringConstructor;
    supportingText: StringConstructor;
    subtitle: StringConstructor;
    description: StringConstructor;
    as: PropType<HeaderElement>;
    level: PropType<HeaderLevel>;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    text: StringConstructor;
    supporting: StringConstructor;
    supportingText: StringConstructor;
    subtitle: StringConstructor;
    description: StringConstructor;
    as: PropType<HeaderElement>;
    level: PropType<HeaderLevel>;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ColorSwatch: vue.DefineComponent<vue.ExtractPropTypes<{
    color: StringConstructor;
    value: StringConstructor;
    state: StringConstructor;
    label: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    color: StringConstructor;
    value: StringConstructor;
    state: StringConstructor;
    label: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ColorizedBadge: vue.DefineComponent<vue.ExtractPropTypes<{
    label: StringConstructor;
    text: StringConstructor;
    state: StringConstructor;
    value: StringConstructor;
    status: StringConstructor;
    color: StringConstructor;
    hue: StringConstructor;
    swatch: StringConstructor;
    variant: StringConstructor;
    tone: PropType<ComponentTone>;
    emphasis: PropType<ComponentEmphasis>;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    label: StringConstructor;
    text: StringConstructor;
    state: StringConstructor;
    value: StringConstructor;
    status: StringConstructor;
    color: StringConstructor;
    hue: StringConstructor;
    swatch: StringConstructor;
    variant: StringConstructor;
    tone: PropType<ComponentTone>;
    emphasis: PropType<ComponentEmphasis>;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const VizAreaPreview: vue.DefineComponent<vue.ExtractPropTypes<{
    width: {
        type: NumberConstructor;
        default: number;
    };
    height: {
        type: NumberConstructor;
        default: number;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    width: {
        type: NumberConstructor;
        default: number;
    };
    height: {
        type: NumberConstructor;
        default: number;
    };
}>> & Readonly<{}>, {
    width: number;
    height: number;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const ClassificationPanel: vue.DefineComponent<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly label: StringConstructor;
    readonly heading: StringConstructor;
    readonly name: StringConstructor;
    readonly subtitle: StringConstructor;
    readonly description: StringConstructor;
    readonly metadata: StringConstructor;
    readonly summary: StringConstructor;
    readonly text: StringConstructor;
    readonly body: StringConstructor;
    readonly emptyMessage: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly label: StringConstructor;
    readonly heading: StringConstructor;
    readonly name: StringConstructor;
    readonly subtitle: StringConstructor;
    readonly description: StringConstructor;
    readonly metadata: StringConstructor;
    readonly summary: StringConstructor;
    readonly text: StringConstructor;
    readonly body: StringConstructor;
    readonly emptyMessage: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const AddressCollectionPanel: vue.DefineComponent<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly label: StringConstructor;
    readonly heading: StringConstructor;
    readonly name: StringConstructor;
    readonly subtitle: StringConstructor;
    readonly description: StringConstructor;
    readonly metadata: StringConstructor;
    readonly summary: StringConstructor;
    readonly text: StringConstructor;
    readonly body: StringConstructor;
    readonly emptyMessage: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly label: StringConstructor;
    readonly heading: StringConstructor;
    readonly name: StringConstructor;
    readonly subtitle: StringConstructor;
    readonly description: StringConstructor;
    readonly metadata: StringConstructor;
    readonly summary: StringConstructor;
    readonly text: StringConstructor;
    readonly body: StringConstructor;
    readonly emptyMessage: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const MembershipPanel: vue.DefineComponent<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly label: StringConstructor;
    readonly heading: StringConstructor;
    readonly name: StringConstructor;
    readonly subtitle: StringConstructor;
    readonly description: StringConstructor;
    readonly metadata: StringConstructor;
    readonly summary: StringConstructor;
    readonly text: StringConstructor;
    readonly body: StringConstructor;
    readonly emptyMessage: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly label: StringConstructor;
    readonly heading: StringConstructor;
    readonly name: StringConstructor;
    readonly subtitle: StringConstructor;
    readonly description: StringConstructor;
    readonly metadata: StringConstructor;
    readonly summary: StringConstructor;
    readonly text: StringConstructor;
    readonly body: StringConstructor;
    readonly emptyMessage: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const PreferencePanel: vue.DefineComponent<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly label: StringConstructor;
    readonly heading: StringConstructor;
    readonly name: StringConstructor;
    readonly subtitle: StringConstructor;
    readonly description: StringConstructor;
    readonly metadata: StringConstructor;
    readonly summary: StringConstructor;
    readonly text: StringConstructor;
    readonly body: StringConstructor;
    readonly emptyMessage: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    readonly title: StringConstructor;
    readonly label: StringConstructor;
    readonly heading: StringConstructor;
    readonly name: StringConstructor;
    readonly subtitle: StringConstructor;
    readonly description: StringConstructor;
    readonly metadata: StringConstructor;
    readonly summary: StringConstructor;
    readonly text: StringConstructor;
    readonly body: StringConstructor;
    readonly emptyMessage: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const FilterPanel: vue.DefineComponent<vue.ExtractPropTypes<{
    filters: {
        type: PropType<readonly Readonly<Record<string, unknown>>[]>;
        default: () => never[];
    };
    activeFilters: {
        type: PropType<readonly Readonly<Record<string, unknown>>[]>;
        default: () => never[];
    };
    mode: StringConstructor;
    collapsible: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    filters: {
        type: PropType<readonly Readonly<Record<string, unknown>>[]>;
        default: () => never[];
    };
    activeFilters: {
        type: PropType<readonly Readonly<Record<string, unknown>>[]>;
        default: () => never[];
    };
    mode: StringConstructor;
    collapsible: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    filters: readonly Readonly<Record<string, unknown>>[];
    activeFilters: readonly Readonly<Record<string, unknown>>[];
    collapsible: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const PriceSummary: vue.DefineComponent<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    amount: PropType<string | number>;
    amountCents: PropType<string | number>;
    unitAmountCents: PropType<string | number>;
    currency: StringConstructor;
    currencyCode: StringConstructor;
    model: StringConstructor;
    pricingModel: StringConstructor;
    interval: StringConstructor;
    billingInterval: StringConstructor;
    summary: StringConstructor;
    text: StringConstructor;
    description: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    amount: PropType<string | number>;
    amountCents: PropType<string | number>;
    unitAmountCents: PropType<string | number>;
    currency: StringConstructor;
    currencyCode: StringConstructor;
    model: StringConstructor;
    pricingModel: StringConstructor;
    interval: StringConstructor;
    billingInterval: StringConstructor;
    summary: StringConstructor;
    text: StringConstructor;
    description: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const TagManager: vue.DefineComponent<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
    tags: PropType<readonly unknown[]>;
    value: PropType<readonly unknown[]>;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
    tags: PropType<readonly unknown[]>;
    value: PropType<readonly unknown[]>;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const AddressSummaryBadge: vue.DefineComponent<vue.ExtractPropTypes<Record<string, StringConstructor>>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<Record<string, StringConstructor>>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const MessageStatusBadge: vue.DefineComponent<vue.ExtractPropTypes<Record<string, StringConstructor>>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<Record<string, StringConstructor>>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const PreferenceSummaryBadge: vue.DefineComponent<vue.ExtractPropTypes<Record<string, StringConstructor>>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<Record<string, StringConstructor>>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const RoleBadgeList: vue.DefineComponent<vue.ExtractPropTypes<{
    roles: PropType<readonly unknown[]>;
    badges: PropType<readonly unknown[]>;
    roleLabels: PropType<readonly unknown[]>;
    value: PropType<readonly unknown[]>;
    variant: StringConstructor;
    tone: StringConstructor;
    label: StringConstructor;
    text: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    roles: PropType<readonly unknown[]>;
    badges: PropType<readonly unknown[]>;
    roleLabels: PropType<readonly unknown[]>;
    value: PropType<readonly unknown[]>;
    variant: StringConstructor;
    tone: StringConstructor;
    label: StringConstructor;
    text: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const TagPills: vue.DefineComponent<vue.ExtractPropTypes<{
    tags: PropType<readonly unknown[]>;
    value: PropType<readonly unknown[]>;
    maxVisible: PropType<string | number>;
    overflowLabel: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    tags: PropType<readonly unknown[]>;
    value: PropType<readonly unknown[]>;
    maxVisible: PropType<string | number>;
    overflowLabel: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const AddressValidationTimeline: vue.DefineComponent<vue.ExtractPropTypes<Record<string, StringConstructor | PropType<readonly unknown[]>>>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<Record<string, StringConstructor | PropType<readonly unknown[]>>>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const MembershipAuditTimeline: vue.DefineComponent<vue.ExtractPropTypes<Record<string, StringConstructor | PropType<readonly unknown[]>>>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<Record<string, StringConstructor | PropType<readonly unknown[]>>>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const MessageEventTimeline: vue.DefineComponent<vue.ExtractPropTypes<Record<string, StringConstructor | PropType<readonly unknown[]>>>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<Record<string, StringConstructor | PropType<readonly unknown[]>>>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const PreferenceTimeline: vue.DefineComponent<vue.ExtractPropTypes<Record<string, StringConstructor | PropType<readonly unknown[]>>>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<Record<string, StringConstructor | PropType<readonly unknown[]>>>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const AuditEvent: vue.DefineComponent<vue.ExtractPropTypes<{
    label: StringConstructor;
    title: StringConstructor;
    event: StringConstructor;
    status: StringConstructor;
    state: StringConstructor;
    reason: StringConstructor;
    text: StringConstructor;
    timestamp: StringConstructor;
    datetime: StringConstructor;
    time: StringConstructor;
    at: StringConstructor;
    createdAt: StringConstructor;
    updatedAt: StringConstructor;
    detail: StringConstructor;
    description: StringConstructor;
    message: StringConstructor;
    from: StringConstructor;
    to: StringConstructor;
    code: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    label: StringConstructor;
    title: StringConstructor;
    event: StringConstructor;
    status: StringConstructor;
    state: StringConstructor;
    reason: StringConstructor;
    text: StringConstructor;
    timestamp: StringConstructor;
    datetime: StringConstructor;
    time: StringConstructor;
    at: StringConstructor;
    createdAt: StringConstructor;
    updatedAt: StringConstructor;
    detail: StringConstructor;
    description: StringConstructor;
    message: StringConstructor;
    from: StringConstructor;
    to: StringConstructor;
    code: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const AddressEditor: vue.DefineComponent<vue.ExtractPropTypes<{
    street: StringConstructor;
    line1: StringConstructor;
    addressLine1: StringConstructor;
    city: StringConstructor;
    region: StringConstructor;
    state: StringConstructor;
    postalCode: StringConstructor;
    zip: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    change: (_address: AddressEditorValue) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    street: StringConstructor;
    line1: StringConstructor;
    addressLine1: StringConstructor;
    city: StringConstructor;
    region: StringConstructor;
    state: StringConstructor;
    postalCode: StringConstructor;
    zip: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>> & Readonly<{
    onChange?: ((_address: AddressEditorValue) => any) | undefined;
}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const PreferenceEditor: vue.DefineComponent<vue.ExtractPropTypes<{
    namespaces: PropType<readonly unknown[]>;
    namespace: StringConstructor;
    document: StringConstructor;
    json: StringConstructor;
    value: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    namespaces: PropType<readonly unknown[]>;
    namespace: StringConstructor;
    document: StringConstructor;
    json: StringConstructor;
    value: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const RoleAssignmentForm: vue.DefineComponent<vue.ExtractPropTypes<{
    roles: PropType<readonly unknown[]>;
    availableRoles: PropType<readonly unknown[]>;
    role: StringConstructor;
    defaultRoleId: StringConstructor;
    assignee: StringConstructor;
    member: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    roles: PropType<readonly unknown[]>;
    availableRoles: PropType<readonly unknown[]>;
    role: StringConstructor;
    defaultRoleId: StringConstructor;
    assignee: StringConstructor;
    member: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const StatusSelector: vue.DefineComponent<vue.ExtractPropTypes<{
    label: StringConstructor;
    title: StringConstructor;
    options: PropType<readonly unknown[]>;
    states: PropType<readonly unknown[]>;
    value: StringConstructor;
    status: StringConstructor;
    modelValue: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (_value: string) => true;
    change: (_value: string) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    label: StringConstructor;
    title: StringConstructor;
    options: PropType<readonly unknown[]>;
    states: PropType<readonly unknown[]>;
    value: StringConstructor;
    status: StringConstructor;
    modelValue: StringConstructor;
}>> & Readonly<{
    onChange?: ((_value: string) => any) | undefined;
    "onUpdate:modelValue"?: ((_value: string) => any) | undefined;
}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const TagInput: vue.DefineComponent<vue.ExtractPropTypes<{
    tags: PropType<readonly unknown[]>;
    value: StringConstructor;
    placeholder: StringConstructor;
    modelValue: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (_value: string) => true;
    input: (_value: string) => true;
    change: (_value: string) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    tags: PropType<readonly unknown[]>;
    value: StringConstructor;
    placeholder: StringConstructor;
    modelValue: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>> & Readonly<{
    onInput?: ((_value: string) => any) | undefined;
    onChange?: ((_value: string) => any) | undefined;
    "onUpdate:modelValue"?: ((_value: string) => any) | undefined;
}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const TemplatePicker: vue.DefineComponent<vue.ExtractPropTypes<{
    templates: PropType<readonly unknown[]>;
    options: PropType<readonly unknown[]>;
    templateId: StringConstructor;
    value: StringConstructor;
    channels: PropType<readonly unknown[]>;
    channel: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    templates: PropType<readonly unknown[]>;
    options: PropType<readonly unknown[]>;
    templateId: StringConstructor;
    value: StringConstructor;
    channels: PropType<readonly unknown[]>;
    channel: StringConstructor;
    title: StringConstructor;
    label: StringConstructor;
    heading: StringConstructor;
    name: StringConstructor;
    description: StringConstructor;
    subtitle: StringConstructor;
    hint: StringConstructor;
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

declare const Input: vue.DefineComponent<vue.ExtractPropTypes<{
    type: {
        type: StringConstructor;
        default: string;
    };
    id: StringConstructor;
    label: StringConstructor;
    modelValue: StringConstructor;
    value: StringConstructor;
    defaultValue: {
        readonly type: StringConstructor;
        readonly default: "";
    };
    placeholder: StringConstructor;
    required: BooleanConstructor;
    disabled: BooleanConstructor;
    readOnly: BooleanConstructor;
    help: StringConstructor;
    validation: PropType<ValidationMessage>;
    name: StringConstructor;
    min: StringConstructor;
    max: StringConstructor;
    step: PropType<string | number>;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (_value: string) => true;
    input: (_value: string) => true;
    change: (_value: string) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    type: {
        type: StringConstructor;
        default: string;
    };
    id: StringConstructor;
    label: StringConstructor;
    modelValue: StringConstructor;
    value: StringConstructor;
    defaultValue: {
        readonly type: StringConstructor;
        readonly default: "";
    };
    placeholder: StringConstructor;
    required: BooleanConstructor;
    disabled: BooleanConstructor;
    readOnly: BooleanConstructor;
    help: StringConstructor;
    validation: PropType<ValidationMessage>;
    name: StringConstructor;
    min: StringConstructor;
    max: StringConstructor;
    step: PropType<string | number>;
}>> & Readonly<{
    onInput?: ((_value: string) => any) | undefined;
    onChange?: ((_value: string) => any) | undefined;
    "onUpdate:modelValue"?: ((_value: string) => any) | undefined;
}>, {
    type: string;
    disabled: boolean;
    defaultValue: string;
    required: boolean;
    readOnly: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const DatePicker: vue.DefineComponent<vue.ExtractPropTypes<{
    readonly id: StringConstructor;
    readonly label: StringConstructor;
    readonly modelValue: StringConstructor;
    readonly value: StringConstructor;
    readonly defaultValue: {
        readonly type: StringConstructor;
        readonly default: "";
    };
    readonly placeholder: StringConstructor;
    readonly required: BooleanConstructor;
    readonly disabled: BooleanConstructor;
    readonly readOnly: BooleanConstructor;
    readonly help: StringConstructor;
    readonly validation: PropType<ValidationMessage>;
    readonly name: StringConstructor;
    readonly min: StringConstructor;
    readonly max: StringConstructor;
    readonly step: PropType<string | number>;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (_value: string) => true;
    input: (_value: string) => true;
    change: (_value: string) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    readonly id: StringConstructor;
    readonly label: StringConstructor;
    readonly modelValue: StringConstructor;
    readonly value: StringConstructor;
    readonly defaultValue: {
        readonly type: StringConstructor;
        readonly default: "";
    };
    readonly placeholder: StringConstructor;
    readonly required: BooleanConstructor;
    readonly disabled: BooleanConstructor;
    readonly readOnly: BooleanConstructor;
    readonly help: StringConstructor;
    readonly validation: PropType<ValidationMessage>;
    readonly name: StringConstructor;
    readonly min: StringConstructor;
    readonly max: StringConstructor;
    readonly step: PropType<string | number>;
}>> & Readonly<{
    onInput?: ((_value: string) => any) | undefined;
    onChange?: ((_value: string) => any) | undefined;
    "onUpdate:modelValue"?: ((_value: string) => any) | undefined;
}>, {
    readonly disabled: boolean;
    readonly defaultValue: string;
    readonly required: boolean;
    readonly readOnly: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Textarea: vue.DefineComponent<vue.ExtractPropTypes<{
    rows: {
        type: NumberConstructor;
        default: number;
    };
    id: StringConstructor;
    label: StringConstructor;
    modelValue: StringConstructor;
    value: StringConstructor;
    defaultValue: {
        readonly type: StringConstructor;
        readonly default: "";
    };
    placeholder: StringConstructor;
    required: BooleanConstructor;
    disabled: BooleanConstructor;
    readOnly: BooleanConstructor;
    help: StringConstructor;
    validation: PropType<ValidationMessage>;
    name: StringConstructor;
    min: StringConstructor;
    max: StringConstructor;
    step: PropType<string | number>;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (_value: string) => true;
    input: (_value: string) => true;
    change: (_value: string) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    rows: {
        type: NumberConstructor;
        default: number;
    };
    id: StringConstructor;
    label: StringConstructor;
    modelValue: StringConstructor;
    value: StringConstructor;
    defaultValue: {
        readonly type: StringConstructor;
        readonly default: "";
    };
    placeholder: StringConstructor;
    required: BooleanConstructor;
    disabled: BooleanConstructor;
    readOnly: BooleanConstructor;
    help: StringConstructor;
    validation: PropType<ValidationMessage>;
    name: StringConstructor;
    min: StringConstructor;
    max: StringConstructor;
    step: PropType<string | number>;
}>> & Readonly<{
    onInput?: ((_value: string) => any) | undefined;
    onChange?: ((_value: string) => any) | undefined;
    "onUpdate:modelValue"?: ((_value: string) => any) | undefined;
}>, {
    disabled: boolean;
    defaultValue: string;
    required: boolean;
    readOnly: boolean;
    rows: number;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Select: vue.DefineComponent<vue.ExtractPropTypes<{
    id: StringConstructor;
    label: StringConstructor;
    modelValue: StringConstructor;
    value: StringConstructor;
    defaultValue: {
        type: StringConstructor;
        default: string;
    };
    placeholder: StringConstructor;
    required: BooleanConstructor;
    disabled: BooleanConstructor;
    help: StringConstructor;
    validation: PropType<ValidationMessage>;
    name: StringConstructor;
    options: {
        type: PropType<readonly SelectOption[]>;
        default: () => never[];
    };
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (_value: string) => true;
    change: (_value: string) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    id: StringConstructor;
    label: StringConstructor;
    modelValue: StringConstructor;
    value: StringConstructor;
    defaultValue: {
        type: StringConstructor;
        default: string;
    };
    placeholder: StringConstructor;
    required: BooleanConstructor;
    disabled: BooleanConstructor;
    help: StringConstructor;
    validation: PropType<ValidationMessage>;
    name: StringConstructor;
    options: {
        type: PropType<readonly SelectOption[]>;
        default: () => never[];
    };
}>> & Readonly<{
    onChange?: ((_value: string) => any) | undefined;
    "onUpdate:modelValue"?: ((_value: string) => any) | undefined;
}>, {
    disabled: boolean;
    options: readonly SelectOption[];
    defaultValue: string;
    required: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Checkbox: vue.DefineComponent<vue.ExtractPropTypes<{
    id: StringConstructor;
    label: StringConstructor;
    modelValue: {
        type: BooleanConstructor;
        default: undefined;
    };
    checked: {
        type: BooleanConstructor;
        default: undefined;
    };
    defaultChecked: BooleanConstructor;
    required: BooleanConstructor;
    disabled: BooleanConstructor;
    help: StringConstructor;
    validation: PropType<ValidationMessage>;
    name: StringConstructor;
}>, () => VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (_value: boolean) => true;
    change: (_value: boolean) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    id: StringConstructor;
    label: StringConstructor;
    modelValue: {
        type: BooleanConstructor;
        default: undefined;
    };
    checked: {
        type: BooleanConstructor;
        default: undefined;
    };
    defaultChecked: BooleanConstructor;
    required: BooleanConstructor;
    disabled: BooleanConstructor;
    help: StringConstructor;
    validation: PropType<ValidationMessage>;
    name: StringConstructor;
}>> & Readonly<{
    onChange?: ((_value: boolean) => any) | undefined;
    "onUpdate:modelValue"?: ((_value: boolean) => any) | undefined;
}>, {
    disabled: boolean;
    modelValue: boolean;
    required: boolean;
    defaultChecked: boolean;
    checked: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

declare const TableCaption: vue.DefineComponent<{}, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const TableHead: vue.DefineComponent<{}, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const TableBody: vue.DefineComponent<{}, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const TableRow: vue.DefineComponent<{}, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const TableHeaderCell: vue.DefineComponent<vue.ExtractPropTypes<{
    scope: {
        type: PropType<"col" | "row">;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    scope: {
        type: PropType<"col" | "row">;
        default: string;
    };
}>> & Readonly<{}>, {
    scope: "col" | "row";
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const TableCell: vue.DefineComponent<{}, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
declare const Table: vue.DefineComponent<vue.ExtractPropTypes<{
    caption: {
        type: StringConstructor;
        default: string;
    };
    columns: {
        type: PropType<readonly TableColumn[]>;
        default: () => never[];
    };
    rows: {
        type: PropType<readonly TableRecord[]>;
        default: () => never[];
    };
    density: {
        type: PropType<"default" | "compact">;
        default: string;
    };
    selectable: BooleanConstructor;
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    rowActivate: (_rowId: string) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    caption: {
        type: StringConstructor;
        default: string;
    };
    columns: {
        type: PropType<readonly TableColumn[]>;
        default: () => never[];
    };
    rows: {
        type: PropType<readonly TableRecord[]>;
        default: () => never[];
    };
    density: {
        type: PropType<"default" | "compact">;
        default: string;
    };
    selectable: BooleanConstructor;
}>> & Readonly<{
    onRowActivate?: ((_rowId: string) => any) | undefined;
}>, {
    caption: string;
    columns: readonly TableColumn[];
    rows: readonly TableRecord[];
    selectable: boolean;
    density: "default" | "compact";
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

declare const Tabs: vue.DefineComponent<vue.ExtractPropTypes<{
    items: {
        type: PropType<readonly TabItem[]>;
        default: () => never[];
    };
    selectedId: StringConstructor;
    defaultSelectedId: StringConstructor;
    size: {
        type: PropType<ComponentSize>;
        default: string;
    };
    overflowLabel: {
        type: StringConstructor;
        default: string;
    };
    ariaLabel: {
        type: StringConstructor;
        default: string;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:selectedId': (_id: string) => true;
    change: (_id: string) => true;
}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    items: {
        type: PropType<readonly TabItem[]>;
        default: () => never[];
    };
    selectedId: StringConstructor;
    defaultSelectedId: StringConstructor;
    size: {
        type: PropType<ComponentSize>;
        default: string;
    };
    overflowLabel: {
        type: StringConstructor;
        default: string;
    };
    ariaLabel: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onChange?: ((_id: string) => any) | undefined;
    "onUpdate:selectedId"?: ((_id: string) => any) | undefined;
}>, {
    size: ComponentSize;
    overflowLabel: string;
    items: readonly TabItem[];
    ariaLabel: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

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
    content: string | number;
    domain: string;
    emphasis: ComponentEmphasis;
    readOnly: boolean;
    compact: boolean;
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
    placeholder: string;
    defaultValue: string;
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
    page: number;
    showPageSizeSelector: boolean;
    showGotoPage: boolean;
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

export { AddressCollectionPanel, type AddressCollectionPanelProps, AddressEditor, type AddressEditorProps, type AddressEditorValue, AddressSummaryBadge, type AddressSummaryBadgeProps, AddressValidationTimeline, type AddressValidationTimelineProps, AuditEvent, type AuditEventProps, AuditTimeline, Badge, Banner, Button, CancellationSummary, type CancellationSummaryProps, Card, CardHeader, type CardHeaderProps, Checkbox, ClassificationPanel, type ClassificationPanelProps, ColorSwatch, type ColorSwatchProps, ColorizedBadge, type ColorizedBadgeProps, type ComponentEmphasis, type ComponentSize, type ComponentTone, DatePicker, DetailHeader, type DetailHeaderProps, type FilterDescriptor, FilterPanel, type FilterPanelProps, Grid, type HeaderElement, type HeaderLevel, Input, type LayoutGap, MembershipAuditTimeline, type MembershipAuditTimelineProps, MembershipPanel, type MembershipPanelProps, MessageEventTimeline, type MessageEventTimelineProps, MessageStatusBadge, type MessageStatusBadgeProps, PaginationBar, type PaginationBarProps, type PaginationItem, type PanelSectionProps, PreferenceEditor, type PreferenceEditorProps, PreferencePanel, type PreferencePanelProps, PreferenceSummaryBadge, type PreferenceSummaryBadgeProps, PreferenceTimeline, type PreferenceTimelineProps, PriceBadge, type PriceBadgeProps, PriceSummary, type PriceSummaryProps, RelativeTimestamp, type RelativeTimestampProps, RoleAssignmentForm, type RoleAssignmentFormProps, RoleBadgeList, type RoleBadgeListProps, SearchInput, type SearchInputProps, Select, type SelectOption, Stack, StatusBadge, type StatusBadgeProps, type StatusPresentation, StatusSelector, type StatusSelectorProps, StatusTimeline, type TabItem, Table, TableBody, TableCaption, TableCell, type TableColumn, TableHead, TableHeaderCell, type TableRecord, TableRow, Tabs, TagInput, type TagInputProps, TagManager, type TagManagerProps, TagPills, type TagPillsProps, TemplatePicker, type TemplatePickerProps, Text, type TextElement, Textarea, type TimelineEvent, type TimelineProps, type ValidationMessage, VizAreaPreview, type VizAreaPreviewProps };
