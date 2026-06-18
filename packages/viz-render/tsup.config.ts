import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  platform: 'node',
  outDir: 'dist',
  sourcemap: true,
  target: 'node20',
  minify: false,
  treeshake: true,
  shims: false,
  // Externalize node_modules: vega + vega-lite are runtime deps resolved by the
  // consumer (mcp-server), not bundled into this package.
  skipNodeModulesBundle: true,
});
