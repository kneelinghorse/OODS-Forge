import recipes from './viz-recipes.v1.json';

export interface VizRecipeCapability {
  chartType: string;
  specEngine: 'vega-lite' | 'echarts';
  publicSvg: boolean;
  dashboardDrawn: true | 'excluded (#881)';
  themes: { light: boolean; dark: boolean; hc: boolean };
  brands: Array<'A' | 'B'>;
  a11yDescription: boolean;
  /** Offered codes; a resolved-operand count is a separate certification field. */
  accuracyRules: string[];
  certifyCoverage: 'certified' | 'uncertified';
  /** Actual categorical canvas grades, including failures; never exempt/unchecked. */
  contrastMeasured: Array<'light' | 'dark'>;
  chartInApp: 'placed' | 'not-placed';
  notes: string[];
}

/** Measured by the public-tool census; the contract test rejects unmeasured changes. */
export const VIZ_RECIPES: readonly VizRecipeCapability[] = recipes as VizRecipeCapability[];
