const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

export function formatNumeric(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const absolute = Math.abs(value);
  if (absolute >= 1000 && absolute % 1 === 0) {
    return integerFormatter.format(value);
  }
  return numberFormatter.format(value);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return percentFormatter.format(value);
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'number') {
    return formatNumeric(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export function formatDimension(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number') {
    return formatNumeric(value);
  }
  return String(value);
}

/**
 * Turn a raw field name into a human-readable label: snake_case / kebab-case /
 * camelCase collapse to spaces and only the FIRST character is capitalized
 * (sentence case, NOT full Title Case) — e.g. `total_revenue` -> `Total revenue`,
 * `grossMargin` -> `Gross margin`. Deterministic (pure string transform, no
 * locale). Shared so the accessible-table column labels, the narrative field
 * labels, and (sprint-135 m02) the synthesized axis titles / aria-labels all
 * agree; any drift between them is a screen-reader mismatch.
 */
export function humanize(value: string): string {
  const withSpaces = value
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
