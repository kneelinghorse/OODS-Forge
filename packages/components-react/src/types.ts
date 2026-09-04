import type * as React from 'react';

export type ComponentTone =
  | 'neutral'
  | 'info'
  | 'accent'
  | 'positive'
  | 'success'
  | 'warning'
  | 'critical'
  | 'danger';

export type ComponentEmphasis = 'subtle' | 'solid';
export type ComponentSize = 'sm' | 'md' | 'lg';
export type FieldDensity = 'compact' | 'comfortable';

export type FieldValidation = {
  readonly state: 'error' | 'warning' | 'success' | 'info';
  readonly message?: React.ReactNode;
  readonly id?: string;
};

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'content'> {
  readonly content?: React.ReactNode;
  readonly status?: string;
  readonly domain?: string;
  readonly tone?: ComponentTone;
  readonly emphasis?: ComponentEmphasis;
  readonly icon?: React.ReactNode;
  readonly iconPosition?: 'start' | 'end';
  readonly showIcon?: boolean;
}

export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'content' | 'title'> {
  readonly title?: React.ReactNode;
  readonly detail?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly content?: React.ReactNode;
  readonly status?: string;
  readonly domain?: string;
  readonly tone?: ComponentTone;
  readonly emphasis?: ComponentEmphasis;
  readonly icon?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly onDismiss?: () => void;
  readonly dismissLabel?: string;
  readonly showIcon?: boolean;
  readonly children?: React.ReactNode;
}

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'content'> {
  readonly content?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly asChild?: boolean;
  readonly intent?: 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  readonly size?: ComponentSize;
  readonly onActivate?: React.MouseEventHandler<HTMLElement>;
}

export type SafeContainerElement = 'div' | 'section' | 'article' | 'aside' | 'main';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  readonly elevated?: boolean;
  readonly as?: SafeContainerElement;
}

export interface CommonFieldProps {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly help?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly validation?: FieldValidation;
  readonly density?: FieldDensity;
  readonly requiredIndicator?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'children' | 'className' | 'style'
>;

export interface InputProps extends NativeInputProps, CommonFieldProps {
  readonly inputClassName?: string;
  readonly inputStyle?: React.CSSProperties;
  readonly onValueChange?: (value: string) => void;
  readonly onUpdate?: (value: string) => void;
}

export interface DatePickerProps extends Omit<InputProps, 'type'> {
  readonly pickerClassName?: string;
  readonly pickerStyle?: React.CSSProperties;
}

type NativeCheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type' | 'children' | 'className' | 'style'
>;

export interface CheckboxProps extends NativeCheckboxProps, CommonFieldProps {
  readonly checkboxClassName?: string;
  readonly checkboxStyle?: React.CSSProperties;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly onUpdate?: (checked: boolean) => void;
}

export type SelectOption = {
  readonly value: string;
  readonly label: React.ReactNode;
  readonly disabled?: boolean;
};

type NativeSelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'id' | 'className' | 'style'
>;

export interface SelectProps extends NativeSelectProps, CommonFieldProps {
  readonly options?: readonly SelectOption[];
  readonly selectClassName?: string;
  readonly selectStyle?: React.CSSProperties;
  readonly onValueChange?: (value: string) => void;
  readonly onUpdate?: (value: string) => void;
}

type NativeTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id' | 'children' | 'className' | 'style'
>;

export interface TextareaProps extends NativeTextareaProps, CommonFieldProps {
  readonly textareaClassName?: string;
  readonly textareaStyle?: React.CSSProperties;
  readonly onValueChange?: (value: string) => void;
  readonly onUpdate?: (value: string) => void;
}

export type LayoutGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly columns?: number | 'auto-fit';
  readonly minColumnWidth?: string;
  readonly gap?: LayoutGap;
  readonly align?: React.CSSProperties['alignItems'];
  readonly justify?: React.CSSProperties['justifyContent'];
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly direction?: 'row' | 'column';
  readonly gap?: LayoutGap;
  readonly align?: React.CSSProperties['alignItems'];
  readonly justify?: React.CSSProperties['justifyContent'];
  readonly wrap?: boolean;
}

export type TableRowData = {
  readonly id: string;
  readonly [key: string]: unknown;
};

export type TableColumn<Row extends TableRowData = TableRowData> = {
  readonly key: string;
  readonly label: React.ReactNode;
  readonly numeric?: boolean;
  readonly render?: (value: unknown, row: Row) => React.ReactNode;
};

export interface TableProps<Row extends TableRowData = TableRowData>
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children'> {
  readonly caption?: React.ReactNode;
  readonly columns?: readonly TableColumn<Row>[];
  readonly rows?: readonly Row[];
  readonly density?: FieldDensity;
  readonly selectable?: boolean;
  readonly onRowActivate?: (
    id: string,
    row: Row,
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => void;
  readonly children?: React.ReactNode;
  readonly containerClassName?: string;
  readonly containerStyle?: React.CSSProperties;
}

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export type TableCaptionProps = React.ComponentPropsWithoutRef<'caption'>;

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  readonly selectable?: boolean;
  readonly selected?: boolean;
  readonly onActivate?: (
    event: React.MouseEvent<HTMLTableRowElement> | React.KeyboardEvent<HTMLTableRowElement>
  ) => void;
}

export interface TableHeaderCellProps extends React.ComponentPropsWithoutRef<'th'> {
  readonly numeric?: boolean;
}

export interface TableCellProps extends React.ComponentPropsWithoutRef<'td'> {
  readonly numeric?: boolean;
  readonly status?: string;
  readonly statusDomain?: string;
  readonly tone?: ComponentTone;
  readonly statusEmphasis?: 'surface' | 'text';
}

export type TableCompound = React.ForwardRefExoticComponent<
  TableProps & React.RefAttributes<HTMLTableElement>
> & {
  readonly Head: React.ForwardRefExoticComponent<
    TableHeadProps & React.RefAttributes<HTMLTableSectionElement>
  >;
  readonly Body: React.ForwardRefExoticComponent<
    TableBodyProps & React.RefAttributes<HTMLTableSectionElement>
  >;
  readonly Caption: React.ForwardRefExoticComponent<
    TableCaptionProps & React.RefAttributes<HTMLTableCaptionElement>
  >;
  readonly Row: React.ForwardRefExoticComponent<
    TableRowProps & React.RefAttributes<HTMLTableRowElement>
  >;
  readonly HeaderCell: React.ForwardRefExoticComponent<
    TableHeaderCellProps & React.RefAttributes<HTMLTableCellElement>
  >;
  readonly Cell: React.ForwardRefExoticComponent<
    TableCellProps & React.RefAttributes<HTMLTableCellElement>
  >;
};

export type TabItem = {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly panel: React.ReactNode;
  readonly isDisabled?: boolean;
  readonly disabled?: boolean;
};

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  readonly items: readonly TabItem[];
  readonly selectedId?: string;
  readonly defaultSelectedId?: string;
  readonly size?: ComponentSize;
  readonly overflowLabel?: string;
  readonly ariaLabel?: string;
  readonly onChange?: (id: string) => void;
  readonly onUpdate?: (id: string) => void;
}

export type SafeTextElement =
  | 'span'
  | 'p'
  | 'strong'
  | 'em'
  | 'small'
  | 'div'
  | 'dt'
  | 'dd'
  | 'label'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'content'> {
  readonly content?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly size?: ComponentSize;
  readonly weight?: 'regular' | 'medium' | 'semibold';
  readonly as?: SafeTextElement;
}
