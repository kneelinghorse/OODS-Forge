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
  // Externalize node_modules (ajv, ajv-formats, @oods/tokens). The vendored
  // normalized-viz-spec.schema.json is a local file and is inlined by esbuild,
  // keeping the package self-contained at runtime with no JSON file dependency.
  skipNodeModulesBundle: true,
});
