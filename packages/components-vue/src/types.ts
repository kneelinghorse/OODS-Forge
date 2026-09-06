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

export type HeaderElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type DetailHeaderProps = {
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

export type CardHeaderProps = {
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

export type ColorSwatchProps = {
  color?: string;
  value?: string;
  state?: string;
  label?: string;
};

export type ColorizedBadgeProps = {
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

export type VizAreaPreviewProps = {
  width?: number;
  height?: number;
};
