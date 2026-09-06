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
    defaultValue: string;
    required: boolean;
    options: readonly SelectOption[];
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
    items: readonly TabItem[];
    overflowLabel: string;
    ariaLabel: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { Badge, Banner, Button, Card, CardHeader, type CardHeaderProps, Checkbox, ColorSwatch, type ColorSwatchProps, ColorizedBadge, type ColorizedBadgeProps, type ComponentEmphasis, type ComponentSize, type ComponentTone, DatePicker, DetailHeader, type DetailHeaderProps, Grid, type HeaderElement, type HeaderLevel, Input, type LayoutGap, Select, type SelectOption, Stack, type TabItem, Table, TableBody, TableCaption, TableCell, type TableColumn, TableHead, TableHeaderCell, type TableRecord, TableRow, Tabs, Text, type TextElement, Textarea, type ValidationMessage, VizAreaPreview, type VizAreaPreviewProps };
