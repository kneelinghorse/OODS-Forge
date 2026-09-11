// Auto-generated from traits/mark-point.parameters.schema.json. Do not edit manually.

export interface MarkPointTraitParameters {
  /**
   * Glyph shape rendered for each data point.
   */
  shape?: 'circle' | 'square' | 'diamond' | 'triangle';
  /**
   * Default glyph area in square pixels.
   */
  size?: number;
  /**
   * Fill strategy for glyph interior.
   */
  fill?: 'solid' | 'hollow';
  /**
   * Outline stroke width for hollow glyphs.
   */
  strokeWidth?: number;
  /**
   * Default opacity applied to each point for overplotting.
   */
  opacity?: number;
  /**
   * JSON-encoded Cartesian viz.render input fragment for the governed authoring recipes. Data rows remain a consumer operand.
   */
  renderIntent?: string;
  /**
   * Static SVG returned by viz.render for the authored sample; omitted until a chart is rendered.
   */
  previewSvg?: string;
}
