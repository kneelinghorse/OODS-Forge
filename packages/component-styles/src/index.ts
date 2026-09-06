export const COMPONENT_STYLE_VERSION = '1.0.0' as const;

export const COMPONENT_STYLE_IDS = [
  'Badge', 'Banner', 'Button', 'Card', 'CardHeader', 'Checkbox', 'ColorSwatch',
  'ColorizedBadge', 'DatePicker', 'DetailHeader', 'Grid', 'Input', 'Select',
  'Stack', 'Table', 'Tabs', 'Text', 'Textarea', 'VizAreaPreview',
] as const;

export const SUPPORTED_COMPONENT_THEME_CELLS = [
  { brand: 'A', theme: 'light' },
  { brand: 'A', theme: 'dark' },
  { brand: 'A', theme: 'hc' },
  { brand: 'B', theme: 'light' },
  { brand: 'B', theme: 'dark' },
  { brand: 'B', theme: 'hc' },
] as const;

export const COMPONENT_DATA_ATTRIBUTE = 'data-oods-component' as const;
