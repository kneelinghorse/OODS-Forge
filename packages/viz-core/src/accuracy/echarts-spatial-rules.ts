// s195 m04 — accuracy over the PUBLIC geo operand. The public builder declares
// coordinates, size/strength fields and colorScale; it does not forward geo.join
// for bubbles, nor expose a sizeScale. Match those actual read sites, not unused
// properties that happen to share the geo schema. No rendering or operand mutation.

import type { AccuracyRuleOutcome } from './types.js';
import { differsBeyondTolerance, type EChartsAccuracyOperand } from './echarts-types.js';

type Row = Record<string, unknown>;

function record(value: unknown): value is Row {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function branchOf(operand: EChartsAccuracyOperand): Row {
  return record(operand.branchData) ? operand.branchData : {};
}

function rowsOf(branch: Row): Row[] | undefined {
  return Array.isArray(branch.rows) && branch.rows.length > 0 && branch.rows.every(record)
    ? branch.rows
    : undefined;
}

function fieldOf(branch: Row, key: string): string | undefined {
  const field = branch[key];
  return typeof field === 'string' && field.length > 0 ? field : undefined;
}

// The bubble and route adapters accept finite numbers and parseFloat strings.
// Keep this boundary pinned against both real adapters in the proof spec: Number()
// would invent different coordinates for empty strings and reject accepted suffixes.
function numeric(value: unknown): number | undefined {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined;
}

function unresolved(subject: string): AccuracyRuleOutcome {
  return { evaluated: false, note: `${subject} could not be resolved from the public geo operand; accuracy was not evaluated.` };
}

function magnitude(operand: EChartsAccuracyOperand, fieldKey: 'sizeField' | 'strengthField'): AccuracyRuleOutcome {
  const branch = branchOf(operand);
  const rows = rowsOf(branch);
  const field = fieldOf(branch, fieldKey);
  const subject = fieldKey === 'sizeField' ? 'bubble size' : 'flow strength';
  if (!rows || !field) return unresolved(`The ${subject} field and rows`);

  const bad: string[] = [];
  let missing = false;
  rows.forEach((row, index) => {
    if (!(field in row)) {
      missing = true;
      return;
    }
    const value = numeric(row[field]);
    if (value === undefined || value < 0) bad.push(`row ${index} (${String(row[field])})`);
  });
  if (bad.length > 0) {
    return {
      evaluated: true,
      message: `artifact.certify: ${bad.length} ${operand.chartType} ${subject} value(s) in "${field}" are negative or non-finite: ${bad.slice(0, 3).join(', ')}. A drawn magnitude cannot represent these values; supply finite non-negative values.`,
    };
  }
  return missing ? unresolved(`Some ${subject} values in "${field}"`) : { evaluated: true };
}

/** OODS-V168 — size is a magnitude; accepted numeric strings follow renderer coercion. */
export function evaluateBubbleNegativeSize(operand: EChartsAccuracyOperand): AccuracyRuleOutcome {
  return magnitude(operand, 'sizeField');
}

/**
 * OODS-V169 — the public builder passes size:{field}, without a scale. The adapter
 * consequently interpolates DIAMETER linearly across the value domain; visible area
 * squares that interpolation. A constant finite domain has no relative size contrast
 * to distort. Missing/invalid magnitudes do not establish this precondition (V168
 * owns invalid values). An unrecognized sizeScale property cannot bypass this rule:
 * the public builder does not consume it either.
 */
export function evaluateBubbleRadiusScaling(operand: EChartsAccuracyOperand): AccuracyRuleOutcome {
  const branch = branchOf(operand);
  const rows = rowsOf(branch);
  const field = fieldOf(branch, 'sizeField');
  if (!rows || !field) return unresolved('The bubble size scale and values');
  const values = rows.map((row) => numeric(row[field]));
  const finite = values.filter((value): value is number => value !== undefined && value >= 0);
  const first = finite[0];
  // The adapter's degenerate-domain check is exact. Even an epsilon-sized source
  // difference expands to its full diameter range, so tolerance here would hide
  // precisely the most exaggerated size contrast.
  if (first !== undefined && finite.some((value) => first !== value)) {
    return {
      evaluated: true,
      message: `artifact.certify: bubble_map encodes varying "${field}" values with the public renderer's default linear symbol diameter (and therefore radius), not an area scale. Circle area squares that interpolation, distorting magnitude comparisons. The public geo operand currently exposes no size-scale override.`,
    };
  }
  if (finite.length !== rows.length) return unresolved(`Some bubble size values in "${field}"`);
  return { evaluated: true };
}

function coordinates(row: Row, fields: readonly string[]): number[] | undefined {
  const values = fields.map((field) => numeric(row[field]));
  return values.every((value): value is number => value !== undefined) ? values : undefined;
}

/**
 * OODS-V170 — public bubbles are point rows, not the choropleth's region join.
 * Rows at the same emitted coordinate overlap. Conflicting encoded size/colour
 * values cannot all be read there; unrelated labels, unused join keys and agreeing
 * duplicates are not conflicts. Sparse/invalid comparisons remain unevaluated.
 */
export function evaluateBubbleCoordinateConflict(operand: EChartsAccuracyOperand): AccuracyRuleOutcome {
  const branch = branchOf(operand);
  const rows = rowsOf(branch);
  const longitude = fieldOf(branch, 'longitudeField');
  const latitude = fieldOf(branch, 'latitudeField');
  const size = fieldOf(branch, 'sizeField');
  const color = fieldOf(branch, 'colorField');
  if (!rows || !longitude || !latitude) return unresolved('The bubble coordinates and rows');
  const fields = [...new Set([size, color].filter((field): field is string => field !== undefined))];
  const groups = new Map<string, Row[]>();
  let incomplete = false;
  for (const row of rows) {
    const point = coordinates(row, [longitude, latitude]);
    if (!point) {
      incomplete = true;
      continue;
    }
    const key = JSON.stringify(point);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  const conflicts: string[] = [];
  for (const [point, matches] of groups) {
    if (matches.length < 2) continue;
    for (const field of fields) {
      const categorical = field === color && branch.colorScale === 'ordinal';
      const values: Array<string | number> = [];
      for (const row of matches) {
        if (!(field in row) || row[field] === null || row[field] === undefined) {
          incomplete = true;
          continue;
        }
        const value = categorical ? String(row[field]) : numeric(row[field]);
        if (value === undefined) incomplete = true;
        else values.push(value);
      }
      const first = values[0];
      if (values.slice(1).some((value) =>
        typeof first === 'number' && typeof value === 'number'
          ? differsBeyondTolerance(first, value)
          : first !== value,
      )) conflicts.push(`${point} has conflicting "${field}" values`);
    }
  }
  if (conflicts.length > 0) {
    return {
      evaluated: true,
      message: `artifact.certify: bubble_map rows overlap at the same geographic point with conflicting encoded values: ${conflicts.slice(0, 3).join('; ')}. The public renderer draws every row at that coordinate, so one measurement can obscure another. Aggregate to one measurement per point or use distinct coordinates.`,
    };
  }
  return incomplete ? unresolved('Some bubble coordinates or duplicate-point encoded values') : { evaluated: true };
}

/** OODS-V171 — route strength controls visualMap line width and must be a magnitude. */
export function evaluateFlowMapNegativeStrength(operand: EChartsAccuracyOperand): AccuracyRuleOutcome {
  return magnitude(operand, 'strengthField');
}

/** OODS-V172 — repeated ordered endpoint coordinates overdraw one directed route. */
export function evaluateFlowMapDuplicateFlow(operand: EChartsAccuracyOperand): AccuracyRuleOutcome {
  const branch = branchOf(operand);
  const rows = rowsOf(branch);
  const fields = ['originLongitudeField', 'originLatitudeField', 'destinationLongitudeField', 'destinationLatitudeField']
    .map((key) => fieldOf(branch, key));
  if (!rows || !fields.every((field): field is string => field !== undefined)) return unresolved('The directed flow endpoints and rows');
  const counts = new Map<string, number>();
  let incomplete = false;
  for (const row of rows) {
    const endpoints = coordinates(row, fields);
    if (!endpoints) {
      incomplete = true;
      continue;
    }
    const key = JSON.stringify(endpoints);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const duplicates = [...counts].filter(([, count]) => count > 1);
  if (duplicates.length > 0) {
    return {
      evaluated: true,
      message: `artifact.certify: ${duplicates.length} flow_map directed route(s) appear more than once: ${duplicates.slice(0, 3).map(([pair, count]) => `${pair} x${count}`).join('; ')}. Identical ordered endpoints overdraw the same arc, concealing separate flows. Aggregate each directed route; reciprocal routes are distinct.`,
    };
  }
  return incomplete ? unresolved('Some directed flow endpoint coordinates') : { evaluated: true };
}
