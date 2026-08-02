/**
 * Style Dictionary configuration for the @oods/tokens package.
 * The heavy lifting (custom formats, expand config) happens inside scripts/build.mjs.
 */
const prefix = 'oods';

module.exports = {
  prefix,
  source: ['src/**/*.json'],
  preprocessors: ['tokens-studio'],
  expand: {},
  log: {
    warnings: 'warn',
    verbosity: 'info',
  },
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab', 'name/css-prefix'],
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            selector: ':root',
            outputReferences: true,
          },
        },
      ],
    },
    ts: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      buildPath: 'dist/ts/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'typescript/tokens',
          options: {
            prefix,
            banner: true,
          },
        },
      ],
    },
    tailwind: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      buildPath: 'dist/tailwind/',
      files: [
        {
          destination: 'tokens.json',
          format: 'tailwind/tokens',
          options: {
            prefix,
            indent: 2,
          },
        },
      ],
    },
    // s166 m03 mobile-platform spike: SD's NATIVE ios-swift/compose transform groups on
    // the same tokens-studio-preprocessed sources — proving the preprocessor and native
    // groups coexist on pinned SD 4.4.0 (the mobile front's one unverified blocker).
    'ios-swift': {
      transformGroup: 'ios-swift',
      buildPath: 'dist/ios-swift/',
      files: [
        {
          destination: 'OodsTokens.swift',
          format: 'ios-swift/class.swift',
          options: {
            className: 'OodsTokens',
          },
        },
      ],
    },
    compose: {
      transformGroup: 'compose',
      buildPath: 'dist/compose/',
      files: [
        {
          destination: 'OodsTokens.kt',
          format: 'compose/object',
          options: {
            className: 'OodsTokens',
            packageName: 'com.oods.tokens',
          },
        },
      ],
    },
  },
};
