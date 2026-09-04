import type { VNodeChild } from 'vue';

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
export type LayoutGap = 'xs' | 'sm' | 'md' | 'lg' | string;

export type ValidationMessage = {
  state: 'error' | 'warning' | 'success';
  message: string;
};

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type TableColumn = {
  key: string;
  label: string;
};

export type TableRecord = {
  id: string;
  [key: string]: unknown;
};

export type TabItem = {
  id: string;
  label: VNodeChild;
  panel: VNodeChild;
  disabled?: boolean;
  /** Compatibility alias for existing OODS item fixtures. */
  isDisabled?: boolean;
};

export type TextElement =
  | 'span'
  | 'p'
  | 'strong'
  | 'em'
  | 'small'
  | 'div'
  | 'label'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';
