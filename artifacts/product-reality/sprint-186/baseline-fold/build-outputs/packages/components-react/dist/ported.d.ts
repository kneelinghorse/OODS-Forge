import * as React from 'react';
import { BadgeProps, ComponentTone, ComponentEmphasis } from './types.js';

interface StatusBadgeProps extends Omit<BadgeProps, 'children' | 'content' | 'status' | 'tone'> {
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
declare const StatusBadge: React.ForwardRefExoticComponent<StatusBadgeProps & React.RefAttributes<HTMLSpanElement>>;
interface PriceBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
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
declare const PriceBadge: React.ForwardRefExoticComponent<PriceBadgeProps & React.RefAttributes<HTMLSpanElement>>;
type TimelineEvent = {
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
interface TimelineBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
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
interface StatusTimelineProps extends TimelineBaseProps {
    readonly status?: string;
    readonly allowedTransitions?: readonly string[];
}
interface AuditTimelineProps extends TimelineBaseProps {
    readonly auditLog?: readonly unknown[];
}
declare const StatusTimeline: React.ForwardRefExoticComponent<StatusTimelineProps & React.RefAttributes<HTMLDivElement>>;
declare const AuditTimeline: React.ForwardRefExoticComponent<AuditTimelineProps & React.RefAttributes<HTMLDivElement>>;
interface CancellationSummaryProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'title'> {
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
declare const CancellationSummary: React.ForwardRefExoticComponent<CancellationSummaryProps & React.RefAttributes<HTMLElement>>;
type NativeSearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children' | 'type' | 'onChange' | 'value' | 'defaultValue'>;
interface SearchInputProps extends NativeSearchInputProps {
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
declare const SearchInput: React.ForwardRefExoticComponent<SearchInputProps & React.RefAttributes<HTMLInputElement>>;
interface PaginationBarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'onChange'> {
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
declare const PaginationBar: React.ForwardRefExoticComponent<PaginationBarProps & React.RefAttributes<HTMLElement>>;
interface RelativeTimestampProps extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, 'children' | 'dateTime'> {
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
declare const RelativeTimestamp: React.ForwardRefExoticComponent<RelativeTimestampProps & React.RefAttributes<HTMLTimeElement>>;

export { AuditTimeline, type AuditTimelineProps, CancellationSummary, type CancellationSummaryProps, PaginationBar, type PaginationBarProps, PriceBadge, type PriceBadgeProps, RelativeTimestamp, type RelativeTimestampProps, SearchInput, type SearchInputProps, StatusBadge, type StatusBadgeProps, StatusTimeline, type StatusTimelineProps, type TimelineEvent };
