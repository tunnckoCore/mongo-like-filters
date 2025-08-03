import xaxa from 'eslint-config-xaxa';

// eslint.config.ts
export default xaxa({
  nextjs: false,
  stylistic: false,
  perfectionist: false,
  ignores: [
    // 'src/db/schema/auth.ts',
    // '**/components/ui/**/*',
    // '**/app/hooks/use-mobile.ts',
    // '**/app/lib/utils.ts',
  ],
  wgw: {
    complexity: 'off',
    'style/implicit-arrow-linebreak': 'off',
    'style/operator-linebreak': 'off',
    'perfectionist/sort-named-imports': 'off',
    'max-statements': 'off',
    'guard-for-in': 'off',
    'style/indent-binary-ops': 'off',
    'no-restricted-syntax': 'off',
    'max-depth': 'off',
    'style/indent': 'off',
    'style/quote-props': 'off',
    'style/quotes': 'off',
    'max-nested-callbacks': 'off',
    'import/exports-last': 'off',
    'import/extensions': 'off',
    'no-undefined': 'off',
    // super buggy... :facepalm:
    'no-use-before-define': [
      'off',
      {
        allowNamedExports: true,
        classes: true,
        functions: false,
        variables: true,
      },
    ],
    'node/no-missing-import': 'off',
    // ! SUPER DESTRUCTIVE AND DANGEROUS !!!!!!!!!!!!
    'perfectionist/sort-objects': 'off',
    'require-unicode-regexp': 'off',
    'ts/explicit-function-return-type': 'off',

    'ts/no-use-before-define': 'off',

    'unused-imports/no-unused-vars': 'off',
  },
  // unocss: true, // auto-detected if you have `unocss.config.ts` or `uno.config.ts` in the root of your project
  // typescript: true, // auto-detected if you have `typescript` in your dependencies
  // react: true, // auto-detected if you have `react` or `preact` in your dependencies
  // jsx: true, // auto-detected if you have `react` or `preact` in your dependencies
});
