// Auto-generated from traits/mark-line.parameters.schema.json. Do not edit manually.

export interface MarkLineTraitParameters {
  /**
   * Curve interpolation strategy applied between data points.
   */
  curve?: 'linear' | 'monotone' | 'step';
  /**
   * Stroke width in device-independent pixels.
   */
  strokeWidth?: number;
  /**
   * Join style applied when segments meet.
   */
  join?: 'miter' | 'round' | 'bevel';
  /**
   * Adds optional point markers on line vertices.
   */
  enableMarkers?: boolean;
  /**
   * JSON-encoded Cartesian viz.render input fragment for the governed authoring recipes. Data rows remain a consumer operand.
   */
  renderIntent?: string;
  /**
   * Static SVG returned by viz.render for the authored sample; omitted until a chart is rendered.
   */
  previewSvg?: string;
}
