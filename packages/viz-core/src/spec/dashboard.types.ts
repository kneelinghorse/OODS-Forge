// GENERATED into @oods/viz-core by scripts/types/generate.ts (generate:schema-types),
// from schemas/viz/dashboard-spec.schema.json. #681 retarget (sprint-113 m01): this
// file IS the live source of truth — do NOT edit by hand. Change the schema and
// re-run `pnpm generate:schema-types`; CI runs it with --check to catch drift.

/**
 * A dashboard panel: a chart panel (11 of the 13 viz.render chartTypes; chord and flow_map are viz.render-only, decision #881 — plus its data branch) or a kpi tile. Discriminated on `kind`.
 */
export type Panel = ChartPanel | KpiPanel;
/**
 * A chart panel — a viz.render-shaped descriptor: chartType (11 of the 13 viz.render chartTypes; chord and flow_map are viz.render-only, decision #881) + the matching data branch + encodings. Tabular types (bar/line/area/scatter/heatmap) bind a shared dataset via `datasetId` + `encodings`; treemap/sunburst take `hierarchy`; sankey takes `sankey`; force_graph takes `network`; choropleth/bubble_map take `geo`.
 */
export type ChartPanel = ChartPanel1 & {
  id: string;
  kind: 'chart';
  title?: string;
  /**
   * Optional per-panel accessibility description override (flat string, mirrors the viz.render input).
   */
  description?: string;
  /**
   * 11 of the 13 viz.render chartTypes; chord and flow_map are viz.render-only (decision #881).
   */
  chartType:
    | 'bar'
    | 'line'
    | 'area'
    | 'scatter'
    | 'heatmap'
    | 'treemap'
    | 'sunburst'
    | 'sankey'
    | 'force_graph'
    | 'choropleth'
    | 'bubble_map';
  /**
   * References a top-level dataset by id. Required for the tabular types (bar/line/area/scatter/heatmap).
   */
  datasetId?: string;
  encodings?: Encodings;
  hierarchy?: HierarchyData;
  sankey?: SankeyData;
  network?: NetworkData;
  geo?: GeoData;
  /**
   * OPTIONAL governed-measure reference (sprint-130 m03). When `resolveMeasures` is set, the resolved registry entry's governed context (displayName/unit/format/threshold/comparison) DECORATES this chart panel's a11y narrative as a leading measure finding. NARRATIVE-ONLY: unlike KpiPanel.measureRef it does NOT rewrite the chart's compute inputs (resolveMeasurePanel is KPI-typed); the chart's encodings/data branch are untouched. An UNKNOWN measureRef under resolveMeasures is a hard error (OODS-V130), mirroring the KPI path (governance consistency). Absent or flag-off === byte-identical.
   */
  measureRef?: string;
};
export type ChartPanel1 = {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
};
/**
 * An encoding binding: a bare field-name string, or an object with the field plus optional aggregate/scale/timeUnit/sort/title.
 */
export type EncodingBinding =
  | string
  | {
      field: string;
      aggregate?: 'sum' | 'count' | 'average' | 'median' | 'min' | 'max' | 'distinct';
      scale?: 'linear' | 'temporal' | 'log' | 'sqrt' | 'band' | 'point';
      timeUnit?: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';
      sort?:
        | ('none' | 'ascending' | 'descending')
        | {
            field: string;
            order: 'ascending' | 'descending';
          };
      title?: string;
    };
/**
 * Hierarchy data for treemap/sunburst panels — discriminated union on 'type' (mirrors the viz.render hierarchy branch).
 */
export type HierarchyData =
  | {
      type: 'adjacency_list';
      /**
       * @minItems 1
       */
      data: [
        {
          id: string;
          parentId: string | null;
          value: number;
          name?: string;
          [k: string]: unknown;
        },
        ...{
          id: string;
          parentId: string | null;
          value: number;
          name?: string;
          [k: string]: unknown;
        }[]
      ];
    }
  | {
      type: 'nested';
      data: HierarchyNode;
    };

/**
 * Declarative, headless dashboard IR (sprint-113 Phase-2, envelope Option C). Composes bare viz.render chart specs as panels + layout + cross-filter links + KPI tiles — the fixed 'metric overview' template (KPI row + trend + breakdown + optional geo). Chart-level specs (viz.render) are UNCHANGED; this IR sits ABOVE them.
 */
export interface DashboardSpecV01 {
  /**
   * IR version discriminant (V01 convention). A future template/shape change bumps to v0.2.
   */
  schemaVersion: 'v0.1';
  /**
   * Stable identifier for the dashboard instance.
   */
  id?: string;
  /**
   * Human-friendly dashboard title surfaced in UI + narration.
   */
  title?: string;
  /**
   * SEAM (a) cross-panel DATA-SHARING. Shared, named tabular datasets. Tabular chart panels and KPI panels reference one by `datasetId`; sharing a dataset is what makes cross-filter possible (panels filter the same dimensional space).
   *
   * @minItems 1
   */
  datasets: [Dataset, ...Dataset[]];
  /**
   * Heterogeneous panels: chart (11 of the 13 viz.render chartTypes; chord and flow_map are viz.render-only, decision #881 — plus its data branch) or kpi tiles.
   *
   * @minItems 1
   */
  panels: [Panel, ...Panel[]];
  layout?: DashboardLayout;
  /**
   * Cross-filter wiring: a selection on a source panel filters a target panel. Declared in v1 (schema-frozen) so m04 adds only a reducer, not a schema change.
   */
  links?: DashboardLink[];
  crossFilter?: CrossFilterConfig;
  /**
   * SEAM (b) partial-panel ERROR policy. 'placeholder' = render an a11y-described error panel in-place (default — don't void the dashboard); 'omit' = drop the failed panel from the layout.
   */
  onPanelError?: 'placeholder' | 'omit';
  a11y: DashboardA11YSpec;
  /**
   * SEAM (e) TOKEN strategy. One dashboard-level deferred token CSS reference (e.g. 'tokens.build'); tokens stay deferred to the consumer CSS bundle (viz.render compact posture). KPI threshold colors are NOT resolved inline.
   */
  tokenCssRef?: string;
}
/**
 * A named shared dataset. Panels reference it by id; cross-filter operates over its shared dimensional space.
 */
export interface Dataset {
  id: string;
  /**
   * Flat tabular rows (field name -> value), bounded like viz.render.
   *
   * @minItems 1
   * @maxItems 5000
   */
  rows: [
    {
      [k: string]: unknown;
    },
    ...{
      [k: string]: unknown;
    }[]
  ];
}
/**
 * Channel -> field bindings for tabular chart panels (mirrors the viz.render encodings shape).
 */
export interface Encodings {
  x?: EncodingBinding;
  y?: EncodingBinding;
  color?: EncodingBinding;
  size?: EncodingBinding;
  shape?: EncodingBinding;
  detail?: EncodingBinding;
}
/**
 * A nested-hierarchy node: a name, an optional numeric value, and optional recursive children.
 */
export interface HierarchyNode {
  name: string;
  value?: number;
  children?: HierarchyNode[];
  [k: string]: unknown;
}
/**
 * Flow data for a sankey panel — nodes plus value-weighted links (mirrors the viz.render sankey branch).
 */
export interface SankeyData {
  /**
   * @minItems 1
   */
  nodes: [
    {
      name: string;
      value?: number;
      [k: string]: unknown;
    },
    ...{
      name: string;
      value?: number;
      [k: string]: unknown;
    }[]
  ];
  /**
   * @minItems 1
   */
  links: [
    {
      source: string;
      target: string;
      value: number;
      [k: string]: unknown;
    },
    ...{
      source: string;
      target: string;
      value: number;
      [k: string]: unknown;
    }[]
  ];
}
/**
 * Network data for a force_graph panel — nodes plus directed links (mirrors the viz.render network branch). An empty links array is allowed.
 */
export interface NetworkData {
  /**
   * @minItems 1
   */
  nodes: [
    {
      id: string;
      group?: string;
      value?: number;
      [k: string]: unknown;
    },
    ...{
      id: string;
      group?: string;
      value?: number;
      [k: string]: unknown;
    }[]
  ];
  links: {
    source: string;
    target: string;
    value?: number;
    [k: string]: unknown;
  }[];
}
/**
 * Geo data for choropleth/bubble_map panels — inline geometry + per-type encoding (mirrors the viz.render geo branch). Geometry is supplied INLINE, never fetched.
 */
export interface GeoData {
  /**
   * Inline GeoJSON FeatureCollection.
   */
  geojson?: {
    [k: string]: unknown;
  };
  /**
   * Inline TopoJSON Topology (converted to a FeatureCollection).
   */
  topojson?: {
    [k: string]: unknown;
  };
  topoObjectName?: string;
  /**
   * @maxItems 5000
   */
  rows?: {
    [k: string]: unknown;
  }[];
  join?: {
    dataKey: string;
    featureProperty: string;
  };
  /**
   * Choropleth: the numeric field colouring each region. Required for choropleth.
   */
  valueField?: string;
  /**
   * Bubble map: the longitude field. Required for bubble_map.
   */
  longitudeField?: string;
  /**
   * Bubble map: the latitude field. Required for bubble_map.
   */
  latitudeField?: string;
  sizeField?: string;
  colorField?: string;
  colorScale?: 'linear' | 'quantize' | 'quantile' | 'threshold' | 'ordinal' | 'diverging';
}
/**
 * A KPI tile — the only NEW panel primitive (trend/breakdown/geo already ship as chart types). Reserves value/aggregate/comparison/threshold metadata; the actual compute is deferred to m03 (which reduces the cross-filtered dataset rows to a renderer-agnostic payload).
 */
export interface KpiPanel {
  id: string;
  kind: 'kpi';
  title?: string;
  description?: string;
  /**
   * References a top-level dataset by id.
   */
  datasetId: string;
  /**
   * The metric field aggregated into the KPI value. CELL TYPES (sprint-175, FD#1): `count` and `distinct` are defined over every NON-NULL cell of this field regardless of type — COUNT(field), never rows.length — while the numeric aggregates (sum/average/median/min/max/latest) read only cells that parse as numbers, in BOTH the row-order and `periodField` series builders. A field that HAS values but none numeric fails LOUD for a numeric aggregate (OODS-V160 at dashboard.render, routed through onPanelError) instead of returning a plausible 0; a field absent from every row has zero non-null cells and keeps the ratified value:0.
   */
  field: string;
  /**
   * Optional (v0.2, sprint-114) name of the time column. When PRESENT, the KPI metric series is built along a PARSED + SORTED period axis (via the UTC-pinned analysis/temporal.ts) instead of dataset row order: aggregate 'latest' = the max period, the sparkline is period-ordered, and comparison.basis 'window'/'prior_period' slice by DISTINCT periods (not rows). Rows with an unparseable period cell are dropped; duplicate periods keep all rows in stable order. ABSENT keeps the sparkline, aggregate 'latest', and the 'window'/'prior_period' bases on dataset row order (as in v0.1); the KPI trendDirection is reported 'flat' unless a comparison baseline resolves, because a first-vs-last read of arbitrary row order is not a real trend (sprint-149 F6b). See frozen seam (v) in $comment.
   */
  periodField?: string;
  /**
   * RESERVED (sprint-116, Phase-3 beachhead): an OPTIONAL bare governed-measure reference — a provenance/identity key (e.g. 'gm.revenue'). INERT in v1: UNREAD by computeKpi and NEVER echoed to output; field + aggregate stay the authoritative compute inputs, so an ABSENT or PRESENT measureRef yields byte-identical compute (no golden re-bake) and schemaVersion stays const 'v0.1'. Validation is string-only this sprint — NOT an inline {name,field,aggregate,role} object, and no registry/enum/$ref lookup. Reserved for the governed-measure resolver (measureRef -> field + aggregate at the mcp-server boundary) in a SUBSEQUENT gated sprint. See frozen seam (vi) in $comment.
   */
  measureRef?: string;
  /**
   * Point-in-time aggregate. Adds 'latest' (most recent value by row order, or by the explicit periodField when set) to the viz.render aggregate set, for point-in-time KPIs. CELL TYPES (sprint-175, FD#1): `count`/`distinct` accept any non-null cell; the other six read numeric cells only and raise OODS-V160 when the field has values but none of them numeric (pre-s175 they returned a silent 0).
   */
  aggregate?: 'sum' | 'count' | 'average' | 'median' | 'min' | 'max' | 'distinct' | 'latest';
  comparison?: KpiComparison;
  threshold?: KpiThreshold;
  /**
   * Optional renderer-agnostic number-format hint (e.g. 'currency', '0.0%').
   */
  format?: string;
  /**
   * Optional unit label.
   */
  unit?: string;
}
/**
 * Comparison basis for the KPI delta. stats.ts deriveTrend is first-vs-last only; this reserves prior-period / target / window bases (computation deferred to m03).
 */
export interface KpiComparison {
  basis: 'prior_period' | 'target' | 'window';
  /**
   * RESERVED (v0.2): a future sibling-baseline column name. NOT the prior_period key — under an explicit KpiPanel.periodField, prior_period/window are derived from the DISTINCT periods of the metric series itself (see frozen seam (v) in $comment). Unread in v1.
   */
  field?: string;
  /**
   * For basis 'target': the explicit target to compare against.
   */
  value?: number;
  /**
   * For basis 'window': the trailing window size.
   */
  window?: number;
}
/**
 * Threshold / anomaly metadata. SEMANTIC only (direction/value) — colors do NOT resolve inline (SEAM e: tokens deferred to the consumer CSS bundle). m03 computes the breach/anomaly flag (reusing stats.ts stddev/tukey for the outlier detector).
 */
export interface KpiThreshold {
  /**
   * Whether a breach is the value above or below the threshold.
   */
  direction?: 'above' | 'below';
  /**
   * Threshold value.
   */
  value?: number;
  /**
   * Optional anomaly detector to flag (Phase-4 narration deferred — flag only).
   */
  anomaly?: 'stddev_outlier';
}
/**
 * Optional layout hints consumed by the m02 deterministic auto-layout resolver. Absent hints -> declared panel order + KPI-row-first defaults; the resolver emits abstract {x,y,w,h} (renderer-agnostic, the client sizes the canvas).
 */
export interface DashboardLayout {
  /**
   * Grid column count.
   */
  columns?: number;
  /**
   * Per-panel grid hints (gridSpan / order). A panel without a placement uses resolver defaults.
   */
  placements?: PanelPlacement[];
}
export interface PanelPlacement {
  panelId: string;
  /**
   * How many grid columns the panel spans.
   */
  gridSpan?: number;
  /**
   * Explicit ordering hint (lower = earlier).
   */
  order?: number;
}
/**
 * A cross-filter link: a selection on the source panel filters the target panel. The predicate vocabulary reuses the SectionFilter operator grammar. m04 adds the reducer; this schema does not change.
 */
export interface DashboardLink {
  id?: string;
  /**
   * Source panel id (its selection drives the filter).
   */
  source: string;
  /**
   * Target panel id (filtered by the source selection).
   */
  target: string;
  /**
   * Dimension the source selection is on (defaults to the source panel's primary dimension).
   */
  sourceField?: string;
  /**
   * Field on the target to filter (defaults to sourceField).
   */
  targetField?: string;
  /**
   * Predicate operator (SectionFilter grammar). Defaults to 'in' for categorical/point selections.
   */
  operator?: '==' | '!=' | 'in' | 'not_in' | '>' | '>=' | '<' | '<=';
  /**
   * Per-link override of crossFilter.combine (v1 supports 'and' only).
   */
  combine?: 'and';
}
/**
 * SEAM (c) cross-source LINK combination. Default: each active source ANDs a predicate; a panel ignores its OWN source selection (skip-self). Per-link override via DashboardLink.combine.
 */
export interface CrossFilterConfig {
  /**
   * How predicates from multiple active sources combine (v1: 'and' only).
   */
  combine?: 'and';
  /**
   * When true, a panel ignores selections that originated from itself.
   */
  ignoreSelfSource?: boolean;
}
/**
 * SEAM (d) dashboard-level accessibility: a cross-panel summary + reading/focus order. The per-chart AccessibilitySpec stays per-panel; this is the dashboard envelope.
 */
export interface DashboardA11YSpec {
  /**
   * Cross-panel screen-reader summary of the whole dashboard.
   */
  description: string;
  /**
   * Short ARIA label applied to the dashboard container.
   */
  ariaLabel?: string;
  /**
   * Panel reading/focus order. 'kpi-first' surfaces the KPI row before charts (the metric-overview default); 'declared' uses panel declaration order.
   */
  readingOrder?: 'kpi-first' | 'declared';
  narrative?: {
    summary?: string;
    keyFindings?: string[];
  };
}
