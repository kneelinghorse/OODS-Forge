// Auto-generated from traits/mark-area.parameters.schema.json. Do not edit manually.

export interface MarkAreaTraitParameters {
  /**
   * Curve interpolation strategy applied between samples.
   */
  curve?: 'linear' | 'monotone' | 'step';
  /**
   * Fill opacity used for the area band.
   */
  opacity?: number;
  /**
   * Baseline reference for filling the region.
   */
  baseline?: 'zero' | 'min';
  /**
   * Curve tension applied when smoothing.
   */
  tension?: number;
  /**
   * Read-only payment chart rendered by public viz.render during code generation. Workflow SVGs are static per seed record; consumers may replace the typed svg prop.
   */
  chart?: {
    chartType: 'area';
    source: 'payment-events';
    /**
     * @minItems 2
     */
    dateFields: [string, string, ...string[]];
    amountField: string;
    minorUnits: number;
    currencyField: string;
    brand?: 'A' | 'B';
  };
  /**
   * Static SVG returned by viz.render for the authored sample.
   */
  previewSvg?: string;
  /**
   * JSON-encoded Cartesian viz.render input fragment for the governed authoring recipes. Data rows remain a consumer operand.
   */
  renderIntent?: string;
}
