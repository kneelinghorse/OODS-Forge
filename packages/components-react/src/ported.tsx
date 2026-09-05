import * as React from 'react';

import { Input } from './fields.js';
import { Badge } from './presentational.js';
import { getStatusPresentation } from './status.js';
import type { BadgeProps, ComponentEmphasis, ComponentTone } from './types.js';

const classes = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(' ');

const humanize = (value: string): string =>
  value
    .split(/[_-]/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export interface StatusBadgeProps
  extends Omit<BadgeProps, 'children' | 'content' | 'status' | 'tone'> {
  readonly children?: React.ReactNode;
  readonly content?: React.ReactNode;
  readonly status?: string;
  readonly value?: string;
  readonly label?: string;
  readonly tone?: ComponentTone | 'lifecycle';
  readonly field?: string;
  readonly statusField?: string;
  readonly domainField?: string;
  readonly readOnly?: boolean;
  readonly compact?: boolean;
  readonly variant?: string;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      status,
      value,
      label,
      children,
      content,
      domain = 'subscription',
      tone,
      emphasis = 'subtle',
      showIcon = true,
      field,
      statusField,
      domainField,
      readOnly,
      compact,
      variant,
      title,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    void [field, statusField, domainField, readOnly, compact];
    const resolvedStatus = status ?? value ?? 'unknown';
    const presentation = getStatusPresentation(domain, resolvedStatus);
    return (
      <Badge
        ref={ref}
        status={resolvedStatus}
        domain={domain}
        tone={tone === 'lifecycle' ? undefined : tone}
        emphasis={variant === 'solid' ? 'solid' : emphasis}
        showIcon={showIcon}
        content={children ?? content}
        title={title ?? presentation.description}
        aria-label={ariaLabel ?? label ?? `Status: ${presentation.label}`}
        data-oods-component="StatusBadge"
        {...rest}
      />
    );
  }
);
StatusBadge.displayName = 'OODS.StatusBadge';

export interface PriceBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  readonly children?: React.ReactNode;
  readonly amountCents?: number;
  readonly unitAmountCents?: number;
  readonly amount?: number;
  readonly unitAmount?: number;
  readonly currency?: string;
  readonly currencyCode?: string;
  readonly label?: React.ReactNode;
  readonly value?: string | number;
  readonly emphasis?: ComponentEmphasis;
  readonly field?: string;
  readonly amountField?: string;
  readonly currencyField?: string;
  readonly intervalField?: string;
  readonly minorUnitsParameter?: string;
}

function formatPrice(
  amount: number | undefined,
  currency: string | undefined,
  fallback: React.ReactNode
): React.ReactNode {
  if (amount === undefined || !Number.isFinite(amount)) return fallback;
  if (!currency) return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

export const PriceBadge = React.forwardRef<HTMLSpanElement, PriceBadgeProps>(
  (
    {
      amountCents,
      unitAmountCents,
      amount,
      unitAmount,
      currency,
      currencyCode,
      label,
      value,
      children,
      emphasis = 'subtle',
      field,
      amountField,
      currencyField,
      intervalField,
      minorUnitsParameter,
      className,
      ...rest
    },
    ref
  ) => {
    void [field, amountField, currencyField, intervalField, minorUnitsParameter];
    const cents = amountCents ?? unitAmountCents;
    const resolvedAmount = cents === undefined ? amount ?? unitAmount : cents / 100;
    const resolvedCurrency = currency ?? currencyCode;
    const content = label ?? children ?? formatPrice(resolvedAmount, resolvedCurrency, value ?? 'Price');
    return (
      <Badge
        ref={ref}
        content={content}
        emphasis={emphasis}
        className={classes('oods-price-badge', className)}
        data-oods-component="PriceBadge"
        data-badge-variant="price"
        data-price="true"
        data-currency={resolvedCurrency?.toUpperCase()}
        {...rest}
      />
    );
  }
);
PriceBadge.displayName = 'OODS.PriceBadge';

export type TimelineEvent = {
  readonly id?: string;
  readonly label?: React.ReactNode;
  readonly title?: React.ReactNode;
  readonly from?: string;
  readonly to?: string;
  readonly status?: string;
  readonly state?: string;
  readonly timestamp?: string;
  readonly datetime?: string;
  readonly actor?: string;
  readonly actorId?: string;
  readonly actor_id?: string;
  readonly reason?: React.ReactNode;
  readonly detail?: React.ReactNode;
  readonly description?: React.ReactNode;
};

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function eventText(
  record: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  }
  return undefined;
}

function normalizeTimelineEvents(values: readonly unknown[]): TimelineEvent[] {
  return values.flatMap<TimelineEvent>((value, index) => {
    if (!isRecord(value)) {
      return value === undefined || value === null ? [] : [{ label: String(value) }];
    }
    const from = eventText(value, ['from']);
    const to = eventText(value, ['to']);
    return [{
      id: eventText(value, ['id']) ?? `event-${index}`,
      label: eventText(value, ['label', 'title', 'event', 'status', 'state', 'text', 'name'])
        ?? (from && to ? `${humanize(from)} → ${humanize(to)}` : undefined),
      from,
      to,
      status: eventText(value, ['status']),
      state: eventText(value, ['state']),
      timestamp: eventText(value, ['timestamp', 'datetime', 'time', 'at', 'createdAt', 'updatedAt']),
      actor: eventText(value, ['actor']),
      actorId: eventText(value, ['actorId', 'actor_id']),
      reason: eventText(value, ['reason']),
      detail: eventText(value, ['detail', 'description', 'message']),
    }];
  });
}

interface TimelineBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  readonly title?: React.ReactNode;
  readonly events?: readonly unknown[];
  readonly history?: readonly unknown[];
  readonly entries?: readonly unknown[];
  readonly stateHistory?: readonly unknown[];
  readonly showActorId?: boolean;
  readonly showReason?: boolean;
  readonly maxVisible?: number;
  readonly children?: React.ReactNode;
  readonly field?: string;
  readonly historyField?: string;
  readonly statesParameter?: string;
  readonly auditLogField?: string;
  readonly createdField?: string;
  readonly updatedField?: string;
  readonly eventField?: string;
  readonly eventTimestampField?: string;
  readonly eventOptionsParameter?: string;
  readonly showFromState?: boolean;
}

export interface StatusTimelineProps extends TimelineBaseProps {
  readonly status?: string;
  readonly allowedTransitions?: readonly string[];
}

export interface AuditTimelineProps extends TimelineBaseProps {
  readonly auditLog?: readonly unknown[];
}

type TimelinePrimitiveProps = TimelineBaseProps & {
  readonly componentId: 'AuditTimeline' | 'StatusTimeline';
  readonly defaultTitle: string;
  readonly kind: 'audit' | 'status';
  readonly source?: readonly unknown[];
  readonly status?: string;
  readonly allowedTransitions?: readonly string[];
};

const TimelinePrimitive = React.forwardRef<HTMLDivElement, TimelinePrimitiveProps>(
  (
    {
      componentId,
      defaultTitle,
      kind,
      source,
      title = defaultTitle,
      events,
      history,
      entries,
      stateHistory,
      status,
      allowedTransitions,
      showActorId = true,
      showReason = true,
      maxVisible,
      children,
      field,
      historyField,
      statesParameter,
      auditLogField,
      createdField,
      updatedField,
      eventField,
      eventTimestampField,
      eventOptionsParameter,
      showFromState,
      className,
      ...rest
    },
    ref
  ) => {
    void [
      field,
      historyField,
      statesParameter,
      auditLogField,
      createdField,
      updatedField,
      eventField,
      eventTimestampField,
      eventOptionsParameter,
      showFromState,
    ];
    const allEvents = normalizeTimelineEvents(source ?? events ?? history ?? entries ?? stateHistory ?? []);
    const visibleEvents = Number.isFinite(maxVisible)
      ? allEvents.slice(0, Math.max(0, Math.floor(maxVisible ?? 0)))
      : allEvents;
    const transitionCount = allowedTransitions?.length ?? 0;

    return (
      <div
        ref={ref}
        role="log"
        aria-label={typeof title === 'string' ? title : defaultTitle}
        className={classes('oods-timeline', `oods-${kind}-timeline`, className)}
        data-oods-component={componentId}
        data-timeline-type={kind}
        {...rest}
      >
        <h3 className="oods-timeline__title">{title}</h3>
        {kind === 'status' && status ? (
          <p className="oods-timeline__current" data-timeline-current="true">
            Current status: {humanize(status)}
            {transitionCount > 0
              ? `. ${transitionCount} transition${transitionCount === 1 ? '' : 's'} available.`
              : null}
          </p>
        ) : null}
        {children ?? (
          <ol className="oods-timeline__events">
            {visibleEvents.length === 0 ? (
              <li data-timeline-empty="true">No events</li>
            ) : visibleEvents.map((event, index) => {
              const timestamp = event.timestamp ?? event.datetime;
              const actor = event.actor ?? event.actorId ?? event.actor_id;
              const eventLabel = event.label
                ?? event.title
                ?? (event.from && event.to ? `${humanize(event.from)} → ${humanize(event.to)}` : undefined)
                ?? (event.status ? humanize(event.status) : undefined)
                ?? (event.state ? humanize(event.state) : undefined)
                ?? `Event ${index + 1}`;
              const detail = event.detail ?? event.description;
              return (
                <li key={event.id ?? `${timestamp ?? 'event'}-${index}`}>
                  <article className="oods-timeline__event" data-timeline-event="true">
                    <p className="oods-timeline__label">{eventLabel}</p>
                    {timestamp ? <time dateTime={timestamp}>{timestamp}</time> : null}
                    {showActorId && actor ? <p className="oods-timeline__actor">Actor: {actor}</p> : null}
                    {showReason && event.reason ? <p className="oods-timeline__reason">{event.reason}</p> : null}
                    {detail ? <p className="oods-timeline__detail">{detail}</p> : null}
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }
);
TimelinePrimitive.displayName = 'OODS.TimelinePrimitive';

export const StatusTimeline = React.forwardRef<HTMLDivElement, StatusTimelineProps>(
  (props, ref) => (
    <TimelinePrimitive
      ref={ref}
      componentId="StatusTimeline"
      defaultTitle="Status Timeline"
      kind="status"
      {...props}
    />
  )
);
StatusTimeline.displayName = 'OODS.StatusTimeline';

export const AuditTimeline = React.forwardRef<HTMLDivElement, AuditTimelineProps>(
  ({ auditLog, ...props }, ref) => (
    <TimelinePrimitive
      ref={ref}
      componentId="AuditTimeline"
      defaultTitle="Audit Timeline"
      kind="audit"
      source={auditLog}
      {...props}
    />
  )
);
AuditTimeline.displayName = 'OODS.AuditTimeline';

export interface CancellationSummaryProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  readonly label?: React.ReactNode;
  readonly title?: React.ReactNode;
  readonly cancelAtPeriodEnd?: boolean;
  readonly requestedAt?: string;
  readonly reason?: React.ReactNode;
  readonly code?: string;
  readonly children?: React.ReactNode;
  readonly field?: string;
  readonly cancelAtPeriodEndField?: string;
  readonly requestedAtField?: string;
  readonly reasonField?: string;
  readonly codeField?: string;
}

export const CancellationSummary = React.forwardRef<HTMLElement, CancellationSummaryProps>(
  (
    {
      label,
      title = label ?? 'Cancellation Summary',
      cancelAtPeriodEnd,
      requestedAt,
      reason,
      code,
      children,
      field,
      cancelAtPeriodEndField,
      requestedAtField,
      reasonField,
      codeField,
      className,
      ...rest
    },
    ref
  ) => {
    void [field, cancelAtPeriodEndField, requestedAtField, reasonField, codeField];
    const childValue = typeof children === 'boolean' ? (children ? 'Yes' : 'No') : children;
    return (
      <section
        ref={ref}
        className={classes('oods-cancellation-summary', className)}
        data-oods-component="CancellationSummary"
        data-summary-type="cancellation"
        data-cancellation-state={cancelAtPeriodEnd === undefined ? undefined : String(cancelAtPeriodEnd)}
        {...rest}
      >
        <h3>{title}</h3>
        <dl>
          {cancelAtPeriodEnd !== undefined ? (
            <div data-summary-item="true">
              <dt>Cancel at period end</dt>
              <dd>{cancelAtPeriodEnd ? 'Yes' : 'No'}</dd>
            </div>
          ) : null}
          {requestedAt ? (
            <div data-summary-item="true"><dt>Requested at</dt><dd>{requestedAt}</dd></div>
          ) : null}
          {reason ? (
            <div data-summary-item="true"><dt>Reason</dt><dd>{reason}</dd></div>
          ) : null}
          {code ? (
            <div data-summary-item="true"><dt>Code</dt><dd>{code}</dd></div>
          ) : null}
          {childValue !== undefined && childValue !== null ? (
            <div data-summary-item="true"><dt>{label ?? 'Cancellation'}</dt><dd>{childValue}</dd></div>
          ) : null}
        </dl>
      </section>
    );
  }
);
CancellationSummary.displayName = 'OODS.CancellationSummary';

type NativeSearchInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'children' | 'type' | 'onChange' | 'value' | 'defaultValue'
>;

export interface SearchInputProps extends NativeSearchInputProps {
  readonly label?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly clearable?: boolean;
  readonly debounceMs?: number;
  readonly debounce?: number;
  readonly minQueryLength?: number;
  readonly field?: string;
  readonly placeholderParameter?: string;
  readonly debounceParameter?: string;
  readonly minQueryLengthParameter?: string;
  readonly clearableParameter?: string;
  readonly onChange?: React.ChangeEventHandler<HTMLInputElement>;
  readonly onValueChange?: (value: string) => void;
  readonly onUpdate?: (value: string) => void;
  readonly onSearch?: (value: string) => void;
  readonly onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      id,
      label = 'Search',
      value,
      defaultValue = '',
      placeholder = 'Search…',
      clearable = true,
      debounceMs,
      debounce,
      minQueryLength = 0,
      field,
      placeholderParameter,
      debounceParameter,
      minQueryLengthParameter,
      clearableParameter,
      disabled,
      className,
      onChange,
      onValueChange,
      onUpdate,
      onSearch,
      onClear,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    void [
      field,
      placeholderParameter,
      debounceParameter,
      minQueryLengthParameter,
      clearableParameter,
    ];
    const generatedId = React.useId();
    const resolvedId = id ?? `oods-search-${generatedId.replace(/:/g, '')}`;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const currentValue = value ?? uncontrolledValue;
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const delay = Math.max(0, debounceMs ?? debounce ?? 0);

    React.useEffect(() => () => {
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    }, []);

    const publish = (nextValue: string) => {
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
      const emit = () => {
        if (nextValue.length >= minQueryLength || nextValue.length === 0) {
          onValueChange?.(nextValue);
          onUpdate?.(nextValue);
          onSearch?.(nextValue);
        }
      };
      if (delay === 0) emit();
      else timerRef.current = setTimeout(emit, delay);
    };

    const updateValue = (nextValue: string) => {
      if (value === undefined) setUncontrolledValue(nextValue);
      publish(nextValue);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
      onChange?.(event);
      if (!event.defaultPrevented) updateValue(event.currentTarget.value);
    };

    const clear = () => {
      onClear?.();
      updateValue('');
    };

    return (
      <div
        role="search"
        className={classes('oods-search-input', className)}
        data-oods-component="SearchInput"
        data-behavioral="search"
      >
        <Input
          {...rest}
          ref={ref}
          id={resolvedId}
          type="search"
          label={label}
          placeholder={placeholder}
          value={currentValue}
          disabled={disabled}
          inputClassName="oods-search-input__control"
          onChange={handleChange}
          onKeyDown={event => {
            onKeyDown?.(event);
            if (!event.defaultPrevented && event.key === 'Escape' && currentValue) clear();
          }}
        />
        {clearable && currentValue ? (
          <button
            type="button"
            className="oods-search-input__clear"
            aria-label="Clear search"
            disabled={disabled}
            onClick={clear}
          >
            ×
          </button>
        ) : null}
      </div>
    );
  }
);
SearchInput.displayName = 'OODS.SearchInput';

export interface PaginationBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'onChange'> {
  readonly page?: number;
  readonly pageSize?: number;
  readonly totalItems?: number;
  readonly totalPages?: number;
  readonly pageSizeOptions?: readonly number[];
  readonly showPageSizeSelector?: boolean;
  readonly showGotoPage?: boolean;
  readonly showItemRange?: boolean;
  readonly pageField?: string;
  readonly pageSizeField?: string;
  readonly totalItemsField?: string;
  readonly totalPagesField?: string;
  readonly pageSizeOptionsParameter?: string;
  readonly showPageSizeSelectorParameter?: string;
  readonly showGotoPageParameter?: string;
  readonly showItemRangeParameter?: string;
  readonly onPageChange?: (page: number) => void;
  readonly onPageSizeChange?: (pageSize: number) => void;
  readonly onChange?: (page: number) => void;
  readonly onUpdate?: (page: number) => void;
}

function visiblePages(page: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const candidates = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...candidates].filter(candidate => candidate >= 1 && candidate <= totalPages).sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];
  for (const candidate of pages) {
    const previous = result[result.length - 1];
    if (typeof previous === 'number' && candidate - previous > 1) result.push('ellipsis');
    result.push(candidate);
  }
  return result;
}

export const PaginationBar = React.forwardRef<HTMLElement, PaginationBarProps>(
  (
    {
      page = 1,
      pageSize = 25,
      totalItems = 0,
      totalPages: suppliedTotalPages,
      pageSizeOptions = [10, 25, 50, 100],
      showPageSizeSelector = false,
      showGotoPage = false,
      showItemRange = true,
      pageField,
      pageSizeField,
      totalItemsField,
      totalPagesField,
      pageSizeOptionsParameter,
      showPageSizeSelectorParameter,
      showGotoPageParameter,
      showItemRangeParameter,
      onPageChange,
      onPageSizeChange,
      onChange,
      onUpdate,
      className,
      'aria-label': ariaLabel = 'Pagination',
      ...rest
    },
    ref
  ) => {
    void [
      pageField,
      pageSizeField,
      totalItemsField,
      totalPagesField,
      pageSizeOptionsParameter,
      showPageSizeSelectorParameter,
      showGotoPageParameter,
      showItemRangeParameter,
    ];
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 25;
    const derivedTotalPages = safePageSize > 0 ? Math.ceil(Math.max(0, totalItems) / safePageSize) : 0;
    const totalPages = Math.max(0, Math.floor(suppliedTotalPages ?? derivedTotalPages));
    const currentPage = totalPages > 0
      ? Math.max(1, Math.min(Math.floor(page), totalPages))
      : 1;
    const goToPage = (nextPage: number) => {
      if (totalPages === 0) return;
      const target = Math.max(1, Math.min(Math.floor(nextPage), totalPages));
      if (target === currentPage) return;
      onPageChange?.(target);
      onChange?.(target);
      onUpdate?.(target);
    };
    const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
    const rangeEnd = Math.min(currentPage * safePageSize, totalItems);

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={classes('oods-pagination-bar', className)}
        data-oods-component="PaginationBar"
        data-behavioral="pagination"
        {...rest}
      >
        {showItemRange ? (
          <span data-pagination-range="true">
            {totalItems > 0 ? `Showing ${rangeStart}–${rangeEnd} of ${totalItems}` : 'No items'}
          </span>
        ) : null}
        <button
          type="button"
          aria-label="Previous page"
          data-pagination-prev="true"
          disabled={totalPages === 0 || currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          ‹
        </button>
        <ol className="oods-pagination-bar__pages">
          {visiblePages(currentPage, totalPages).map((item, index) => item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} aria-hidden="true">…</li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
                data-pagination-page={item}
                onClick={() => goToPage(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          aria-label="Next page"
          data-pagination-next="true"
          disabled={totalPages === 0 || currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          ›
        </button>
        {showPageSizeSelector ? (
          <label>
            Items per page
            <select
              aria-label="Items per page"
              value={safePageSize}
              onChange={event => onPageSizeChange?.(Number(event.currentTarget.value))}
            >
              {pageSizeOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        ) : null}
        {showGotoPage ? (
          <label>
            Go to page
            <input
              type="number"
              min={1}
              max={Math.max(1, totalPages)}
              defaultValue={currentPage}
              onKeyDown={event => {
                if (event.key === 'Enter') goToPage(Number(event.currentTarget.value));
              }}
            />
          </label>
        ) : null}
      </nav>
    );
  }
);
PaginationBar.displayName = 'OODS.PaginationBar';

export interface RelativeTimestampProps
  extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, 'children' | 'dateTime'> {
  readonly children?: React.ReactNode;
  readonly datetime?: string | number | Date;
  readonly timestamp?: string | number | Date;
  readonly value?: string | number | Date;
  readonly updatedAt?: string | number | Date;
  readonly createdAt?: string | number | Date;
  readonly relative?: React.ReactNode;
  readonly label?: React.ReactNode;
  readonly text?: React.ReactNode;
  readonly timezone?: string;
  readonly now?: string | number | Date;
  readonly field?: string;
  readonly fallbackField?: string;
  readonly timezoneParameter?: string;
}

function asDate(value: string | number | Date | undefined): Date | undefined {
  if (value === undefined) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function relativeLabel(date: Date, now: Date): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  const [unit, divisor] = units.find(([, candidate]) => Math.abs(seconds) >= candidate) ?? ['second', 1];
  return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
    Math.round(seconds / divisor),
    unit
  );
}

export const RelativeTimestamp = React.forwardRef<HTMLTimeElement, RelativeTimestampProps>(
  (
    {
      datetime,
      timestamp,
      value,
      updatedAt,
      createdAt,
      relative,
      label,
      text,
      timezone = 'UTC',
      now,
      children,
      field,
      fallbackField,
      timezoneParameter,
      title,
      className,
      ...rest
    },
    ref
  ) => {
    void [field, fallbackField, timezoneParameter];
    const childRaw = typeof children === 'string' || typeof children === 'number'
      ? children
      : undefined;
    const raw = datetime ?? timestamp ?? value ?? updatedAt ?? createdAt ?? childRaw;
    const date = asDate(raw);
    const nowDate = asDate(now) ?? new Date();
    const iso = date?.toISOString() ?? (raw === undefined ? undefined : String(raw));
    let absolute = iso;
    if (date) {
      try {
        absolute = new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: timezone,
        }).format(date);
      } catch {
        absolute = iso;
      }
    }
    const content = relative ?? label ?? text
      ?? (date ? relativeLabel(date, nowDate) : children ?? iso ?? 'Unknown time');
    return (
      <time
        ref={ref}
        dateTime={iso}
        title={title ?? absolute}
        className={classes('oods-relative-timestamp', className)}
        data-oods-component="RelativeTimestamp"
        suppressHydrationWarning
        {...rest}
      >
        {content}
      </time>
    );
  }
);
RelativeTimestamp.displayName = 'OODS.RelativeTimestamp';
