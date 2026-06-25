import type { NormalizedVizSpec } from '../spec/normalized-viz-spec.js';
import {
  analyzeVizSpec,
  describeDataPoint,
  getEncodingBinding,
  type VizDataAnalysis,
} from './data-analysis.js';
import { formatNumeric, formatPercent } from './format.js';

export interface NarrativeResult {
  readonly status: 'ready' | 'insufficient-data';
  readonly summary: string;
  readonly keyFindings: readonly string[];
  readonly analysis: VizDataAnalysis;
}

interface NarrativeLabels {
  readonly chartLabel: string;
  readonly measureLabel?: string;
  readonly dimensionLabel?: string;
  readonly colorLabel?: string;
}

/**
 * A pre-built-analysis input for the input-shaped (non-cartesian) sources whose
 * data never flows through a NormalizedVizSpec (sprint-128 m01). Carries the
 * VizDataAnalysis plus the labels + author-override knobs the cartesian path
 * otherwise reads off the spec. All optional except the analysis.
 */
export interface AnalysisNarrativeInput {
  readonly analysis: VizDataAnalysis;
  /** Mirrors spec.name ?? spec.a11y.ariaLabel ?? spec.id — default 'This visualization'. */
  readonly chartLabel?: string;
  readonly measureLabel?: string;
  readonly dimensionLabel?: string;
  readonly colorLabel?: string;
  /** Mirrors spec.a11y.narrative (author override). */
  readonly narrative?: ProvidedNarrative;
  /** Mirrors spec.a11y.description (the fallback summary). */
  readonly fallbackSummary?: string;
}

interface ResolvedNarrativeInputs {
  readonly analysis: VizDataAnalysis;
  readonly labels: NarrativeLabels;
  readonly narrative: ProvidedNarrative | undefined;
  readonly fallbackSummary: string;
}

/**
 * Normalize the two accepted inputs to a single shape. The spec branch is
 * byte-identical to the pre-m01 behavior (same analysis, labels, author override,
 * fallback); the analysis branch supplies those from the input object.
 */
function resolveNarrativeInputs(input: NormalizedVizSpec | AnalysisNarrativeInput): ResolvedNarrativeInputs {
  if ('analysis' in input) {
    return {
      analysis: input.analysis,
      labels: {
        chartLabel: input.chartLabel ?? 'This visualization',
        measureLabel: input.measureLabel,
        dimensionLabel: input.dimensionLabel,
        colorLabel: input.colorLabel,
      },
      narrative: input.narrative,
      fallbackSummary: input.fallbackSummary ?? '',
    };
  }
  return {
    analysis: analyzeVizSpec(input),
    labels: {
      chartLabel: input.name ?? input.a11y.ariaLabel ?? input.id ?? 'This visualization',
      measureLabel: resolveFieldLabel(input, 'y'),
      dimensionLabel: resolveFieldLabel(input, 'x'),
      colorLabel: resolveFieldLabel(input, 'color'),
    },
    narrative: input.a11y.narrative,
    fallbackSummary: input.a11y.description,
  };
}

export function generateNarrativeSummary(input: NormalizedVizSpec | AnalysisNarrativeInput): NarrativeResult {
  const { analysis, labels, narrative, fallbackSummary } = resolveNarrativeInputs(input);

  const derived = deriveNarrativeFromData(analysis, labels);
  const { summary, keyFindings } = applyNarrativeOverride(narrative, derived, fallbackSummary);

  return {
    status: summary.length > 0 ? 'ready' : 'insufficient-data',
    summary,
    keyFindings,
    analysis,
  } satisfies NarrativeResult;
}

/** An author-supplied narrative override (summary and/or key findings). */
export interface ProvidedNarrative {
  readonly summary?: string;
  readonly keyFindings?: readonly string[];
}

/**
 * The author-override fallback shared by the single-chart narrative
 * (generateNarrativeSummary) and the dashboard narrative (deriveDashboardNarrative):
 * an author-supplied summary/findings WINS, else the data-derived value, else the
 * fallback summary. Extracted so both paths use ONE precedence implementation
 * (sprint-115 m04) — there is no parallel override logic to drift.
 */
export function applyNarrativeOverride(
  provided: ProvidedNarrative | undefined,
  derived: { readonly summary?: string; readonly keyFindings: readonly string[] },
  fallbackSummary: string,
): { summary: string; keyFindings: readonly string[] } {
  const providedSummary = provided?.summary?.trim();
  const providedFindings = provided?.keyFindings?.filter((finding) => finding && finding.trim() !== '') ?? [];

  const summary = (providedSummary || derived.summary || fallbackSummary).trim();
  const keyFindings = providedFindings.length > 0 ? providedFindings : derived.keyFindings;
  return { summary, keyFindings };
}

function deriveNarrativeFromData(analysis: VizDataAnalysis, labels: NarrativeLabels): {
  readonly summary?: string;
  readonly keyFindings: string[];
} {
  const summaryParts: string[] = [];
  switch (analysis.mark) {
    case 'line': {
      if (analysis.first && analysis.last) {
        const directionLabel =
          analysis.trend === 'increasing'
            ? 'rises'
            : analysis.trend === 'decreasing'
              ? 'declines'
              : 'remains relatively flat';
        summaryParts.push(
          `${labels.chartLabel} ${directionLabel} from ${formatNumeric(analysis.first.value)} (${analysis.first.label}) to ${formatNumeric(analysis.last.value)} (${analysis.last.label}).`
        );
        if (analysis.trendDelta !== undefined && analysis.first.value !== 0) {
          const percent = analysis.trendDelta / Math.max(Math.abs(analysis.first.value), 1);
          summaryParts.push(`Overall change of ${formatPercent(percent)} across the period.`);
        }
      }
      break;
    }
    case 'bar':
    case 'area': {
      if (analysis.max && analysis.min) {
        summaryParts.push(
          `${labels.chartLabel} compares ${labels.dimensionLabel ?? 'categories'}; ${analysis.max.label} leads at ${formatNumeric(analysis.max.value)} while ${analysis.min.label} is lowest at ${formatNumeric(analysis.min.value)}.`
        );
      }
      break;
    }
    case 'point': {
      if (analysis.correlation !== undefined) {
        summaryParts.push(
          `${labels.chartLabel} shows a ${describeCorrelation(analysis.correlation)} relationship between ${labels.dimensionLabel ?? 'x'} and ${labels.measureLabel ?? 'y'}.`
        );
      }
      break;
    }
    default: {
      if (analysis.total !== undefined && analysis.rowCount > 0) {
        summaryParts.push(
          `${labels.chartLabel} covers ${analysis.rowCount} data points totaling ${formatNumeric(analysis.total)} ${labels.measureLabel ?? ''}.`
        );
      }
    }
  }

  const keyFindings = buildKeyFindings(analysis, labels);
  return {
    summary: summaryParts.join(' ').trim() || undefined,
    keyFindings,
  };
}

function buildKeyFindings(analysis: VizDataAnalysis, labels: NarrativeLabels): string[] {
  const findings: string[] = [];
  if (analysis.max) {
    findings.push(`High ${labels.measureLabel ?? 'value'}: ${describeDataPoint(analysis.max, labels.measureLabel)}`);
  }
  if (analysis.min && (!analysis.max || analysis.min.label !== analysis.max.label || analysis.min.value !== analysis.max.value)) {
    findings.push(`Low ${labels.measureLabel ?? 'value'}: ${describeDataPoint(analysis.min, labels.measureLabel)}`);
  }
  if (analysis.trend && analysis.trendDelta !== undefined) {
    const percent = analysis.first && analysis.first.value !== 0 ? analysis.trendDelta / analysis.first.value : undefined;
    findings.push(
      `Trend ${analysis.trend}: ${percent !== undefined ? formatPercent(percent) : formatNumeric(analysis.trendDelta)}`
    );
  }
  if (analysis.total !== undefined) {
    findings.push(`Total ${labels.measureLabel ?? 'value'}: ${formatNumeric(analysis.total)}`);
  }
  if (analysis.colorCategories.length > 0 && labels.colorLabel) {
    findings.push(`${labels.colorLabel}: ${analysis.colorCategories.join(', ')}`);
  }
  if (analysis.correlation !== undefined) {
    findings.push(`Correlation coefficient: ${analysis.correlation}`);
  }
  if (analysis.rowCount > 0 && findings.length === 0) {
    findings.push(`${analysis.rowCount} rows analysed.`);
  }
  return findings.slice(0, 5);
}

function resolveFieldLabel(spec: NormalizedVizSpec, channel: keyof NormalizedVizSpec['encoding']): string | undefined {
  const binding = getEncodingBinding(spec, channel);
  if (!binding) {
    return undefined;
  }
  if (binding.title && binding.title.trim() !== '') {
    return binding.title;
  }
  if (binding.field && binding.field.trim() !== '') {
    return humanize(binding.field);
  }
  return undefined;
}

function humanize(value: string): string {
  const withSpaces = value
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function describeCorrelation(value: number): string {
  const magnitude = Math.abs(value);
  if (magnitude >= 0.75) {
    return value >= 0 ? 'strong positive' : 'strong negative';
  }
  if (magnitude >= 0.4) {
    return value >= 0 ? 'moderate positive' : 'moderate negative';
  }
  return value >= 0 ? 'weak positive' : 'weak negative';
}
