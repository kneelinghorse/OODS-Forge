// Auto-generated from traits/mark-bar.parameters.schema.json. Do not edit manually.

export interface MarkBarTraitParameters {
  /**
   * Axis orientation used for laying out bar rectangles.
   */
  orientation: 'vertical' | 'horizontal';
  /**
   * Fractional padding between category bands (0-0.5).
   */
  bandPadding?: number;
  /**
   * Pixel radius applied to bar corners.
   */
  cornerRadius?: number;
  /**
   * Aggregation strategy when multiple series share the mark.
   */
  stacking?: 'auto' | 'normalize' | 'none';
  /**
   * JSON-encoded Cartesian viz.render input fragment for the governed authoring recipes. Data rows remain a consumer operand.
   */
  renderIntent?: string;
  /**
   * Static SVG returned by viz.render for the authored sample; omitted until a chart is rendered.
   */
  previewSvg?: string;
}
