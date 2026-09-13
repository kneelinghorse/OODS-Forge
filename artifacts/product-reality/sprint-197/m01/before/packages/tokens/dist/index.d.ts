export interface TokenMeta {
  generatedAt: string;
  tool: string;
  version: string;
  platform: string;
}

export interface FlatTokenEntry {
  name?: string;
  value: unknown;
  type?: string;
  path?: string[];
  cssVariable: string;
  originalValue?: unknown;
  description?: string;
  [key: string]: unknown;
}

export type TokenTree = Record<string, unknown>;

export declare const tokens: TokenTree;
export declare const flatTokens: Record<string, FlatTokenEntry>;
export declare const cssVariables: Record<string, string>;
export declare const cssVariablesByScope: Record<'A' | 'B', Record<'light' | 'dark' | 'hc', Record<string, string>>>;
export declare const meta: Partial<TokenMeta>;
export declare const prefix: string;
declare const bundle: {
  tokens: typeof tokens;
  flatTokens: typeof flatTokens;
  cssVariables: typeof cssVariables;
  cssVariablesByScope: typeof cssVariablesByScope;
  meta: typeof meta;
  prefix: typeof prefix;
};
export default bundle;
