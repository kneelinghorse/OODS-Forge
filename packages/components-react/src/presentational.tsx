import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import type {
  BadgeProps,
  BannerProps,
  ButtonProps,
  CardProps,
  TextProps,
} from './types.js';
import {
  getBannerToneTokenSet,
  getStatusPresentation,
  getToneTokenSet,
  resolveStatusGlyph,
} from './status.js';

const classes = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(' ');

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      content,
      status,
      domain = 'subscription',
      tone: toneOverride,
      emphasis = 'subtle',
      icon,
      iconPosition = 'start',
      showIcon,
      children,
      className,
      style,
      title,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    const presentation = status ? getStatusPresentation(domain, status) : undefined;
    const tone = toneOverride ?? presentation?.tone ?? 'neutral';
    const tokenSet = emphasis === 'solid'
      ? presentation?.badge.solid ?? getToneTokenSet(tone)
      : presentation?.badge.subtle ?? getToneTokenSet(tone);
    const resolvedContent = children ?? content ?? presentation?.label ?? status;
    const resolvedIcon = icon ?? resolveStatusGlyph(presentation?.iconName);
    const resolvedShowIcon = showIcon ?? resolvedIcon !== undefined;
    const iconNode = resolvedShowIcon && resolvedIcon ? (
      <span className="oods-badge__icon statusable-badge__icon" aria-hidden="true">
        {resolvedIcon}
      </span>
    ) : null;

    return (
      <span
        ref={ref}
        className={classes('oods-badge', 'statusable-badge', className)}
        data-oods-component="Badge"
        data-status={status}
        data-domain={domain}
        data-tone={tone}
        data-emphasis={emphasis}
        title={title ?? presentation?.description}
        aria-label={ariaLabel}
        style={{
          '--cmp-badge-background': tokenSet.background,
          '--cmp-badge-border': tokenSet.border,
          '--cmp-badge-text': tokenSet.foreground,
          '--statusable-badge-background': tokenSet.background,
          '--statusable-badge-border': tokenSet.border,
          '--statusable-badge-foreground': tokenSet.foreground,
          '--statusable-badge-icon-color': tokenSet.foreground,
          ...style,
        } as React.CSSProperties}
        {...rest}
      >
        {iconPosition === 'start' ? iconNode : null}
        <span className="oods-badge__label statusable-badge__label">{resolvedContent}</span>
        {iconPosition === 'end' ? iconNode : null}
      </span>
    );
  }
);
Badge.displayName = 'OODS.Badge';

export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      title,
      detail,
      description,
      content,
      status,
      domain = 'subscription',
      tone: toneOverride,
      emphasis = 'subtle',
      icon,
      actions,
      onDismiss,
      dismissLabel = 'Dismiss notification',
      showIcon,
      children,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const presentation = status ? getStatusPresentation(domain, status) : undefined;
    const tone = toneOverride ?? presentation?.tone ?? 'neutral';
    const tokenSet = emphasis === 'solid'
      ? presentation?.banner.solid ?? getToneTokenSet(tone)
      : presentation?.banner.subtle ?? getBannerToneTokenSet(tone);
    const heading = title ?? presentation?.label ?? status;
    const body = detail ?? description ?? children ?? content ?? presentation?.description;
    const role = tone === 'critical' || tone === 'danger' ? 'alert' : 'status';
    const resolvedIcon = icon ?? resolveStatusGlyph(presentation?.iconName);
    const resolvedShowIcon = showIcon ?? resolvedIcon !== undefined;

    return (
      <div
        ref={ref}
        role={role}
        aria-live={role === 'alert' ? 'assertive' : 'polite'}
        className={classes('oods-banner', 'statusable-banner', className)}
        data-oods-component="Banner"
        data-status={status}
        data-domain={domain}
        data-tone={tone}
        data-emphasis={emphasis}
        style={{
          '--cmp-banner-background': tokenSet.background,
          '--cmp-banner-border': tokenSet.border,
          '--cmp-banner-text': tokenSet.foreground,
          '--statusable-banner-background': tokenSet.background,
          '--statusable-banner-border': tokenSet.border,
          '--statusable-banner-foreground': tokenSet.foreground,
          '--statusable-banner-icon-color': tokenSet.foreground,
          ...style,
        } as React.CSSProperties}
        {...rest}
      >
        {resolvedShowIcon && resolvedIcon ? (
          <span className="oods-banner__icon statusable-banner__icon" aria-hidden="true">
            {resolvedIcon}
          </span>
        ) : null}
        <div className="oods-banner__content statusable-banner__content">
          {heading ? <strong className="oods-banner__title statusable-banner__title">{heading}</strong> : null}
          {body ? <p className="oods-banner__detail statusable-banner__description">{body}</p> : null}
          {actions ? <div className="oods-banner__actions statusable-banner__actions">{actions}</div> : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            className="oods-banner-dismiss oods-banner__dismiss statusable-banner__dismiss"
            aria-label={dismissLabel}
            onClick={() => onDismiss()}
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </div>
    );
  }
);
Banner.displayName = 'OODS.Banner';

const BUTTON_INTENT_CLASSES: Record<NonNullable<ButtonProps['intent']>, string> = {
  neutral: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
  primary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900',
  secondary: 'bg-slate-100 text-slate-950 hover:bg-slate-200 focus-visible:outline-slate-900',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:outline-emerald-600',
  warning: 'bg-amber-500 text-slate-900 hover:bg-amber-400 focus-visible:outline-amber-500',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600',
};

const BUTTON_SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      content,
      children,
      className,
      intent = 'neutral',
      size = 'md',
      style,
      type,
      onClick,
      onActivate,
      ...rest
    },
    ref
  ) => {
    const Component = asChild ? Slot : 'button';
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = event => {
      onClick?.(event);
      if (!event.defaultPrevented) onActivate?.(event);
    };
    const nativeProps = asChild ? {} : { type: type ?? 'button' };

    return (
      <Component
        ref={ref}
        className={classes(
          'oods-button',
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
          BUTTON_INTENT_CLASSES[intent],
          BUTTON_SIZE_CLASSES[size],
          className
        )}
        data-oods-component="Button"
        data-intent={intent}
        data-size={size}
        style={{
          '--cmp-button-background': 'var(--sys-surface-interactive-primary-default)',
          '--cmp-button-background-hover': 'var(--sys-surface-interactive-primary-hover)',
          '--cmp-button-background-disabled': 'var(--sys-surface-disabled)',
          '--cmp-button-border': 'var(--sys-border-subtle)',
          '--cmp-button-text': 'var(--sys-text-on-interactive)',
          '--cmp-button-text-disabled': 'var(--sys-text-disabled)',
          '--cmp-button-focus-width': 'var(--sys-focus-width, 2px)',
          '--cmp-button-focus-outer': 'var(--sys-focus-ring-outer, Highlight)',
          ...style,
        } as React.CSSProperties}
        onClick={handleClick}
        {...nativeProps}
        {...rest}
      >
        {children ?? content}
      </Component>
    );
  }
);
Button.displayName = 'OODS.Button';

export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ as = 'div', elevated = false, className, ...rest }, ref) => {
    const Element = as;
    return (
      <Element
        ref={ref as React.Ref<HTMLDivElement>}
        className={classes(
          'oods-card',
          'rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow dark:border-slate-800 dark:bg-slate-950',
          elevated && 'shadow-lg shadow-slate-200/50 dark:shadow-none',
          className
        )}
        data-oods-component="Card"
        data-elevated={elevated ? 'true' : 'false'}
        {...rest}
      />
    );
  }
);
Card.displayName = 'OODS.Card';

const TEXT_SIZE_CLASSES: Record<NonNullable<TextProps['size']>, string> = {
  sm: 'text-sm leading-5',
  md: 'text-base leading-6',
  lg: 'text-lg leading-7',
};

const TEXT_WEIGHT_CLASSES: Record<NonNullable<TextProps['weight']>, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as = 'span', content, children, size = 'md', weight = 'regular', className, ...rest }, ref) => {
    const Element = as;
    return (
      <Element
        ref={ref as React.Ref<never>}
        className={classes('oods-text', TEXT_SIZE_CLASSES[size], TEXT_WEIGHT_CLASSES[weight], className)}
        data-oods-component="Text"
        data-size={size}
        data-weight={weight}
        {...rest}
      >
        {children ?? content}
      </Element>
    );
  }
);
Text.displayName = 'OODS.Text';
