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
    const tokenSet = toneOverride !== undefined
      ? getToneTokenSet(tone)
      : emphasis === 'solid'
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

// Intent, size, radius and focus are painted by @oods/component-styles from the
// cmp roles through data-intent and data-size; no utility class carries chrome.
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
        className={classes('oods-button', className)}
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
        className={classes('oods-card', className)}
        data-oods-component="Card"
        data-elevated={elevated ? 'true' : 'false'}
        {...rest}
      />
    );
  }
);
Card.displayName = 'OODS.Card';

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as = 'span',
      content,
      children,
      label,
      size = 'md',
      weight = 'regular',
      className,
      'aria-description': ariaDescription,
      ...rest
    },
    ref
  ) => {
    const Element = as;
    return (
      <Element
        ref={ref as React.Ref<never>}
        className={classes('oods-text', className)}
        data-oods-component="Text"
        data-size={size}
        data-weight={weight}
        aria-description={ariaDescription ?? label}
        {...rest}
      >
        {children ?? content}
      </Element>
    );
  }
);
Text.displayName = 'OODS.Text';
