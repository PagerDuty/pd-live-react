const {
  OFF, WARN, ERROR,
} = {
  OFF: 0,
  WARN: 1,
  ERROR: 2,
};

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'airbnb',
    'plugin:cypress/recommended',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'prettier',
    'cypress',
    'jsx',
    'react-refresh',
  ],
  rules: {
    'max-len': [WARN, { code: 120, ignorePattern: '^import\\W.*', ignoreTrailingComments: true }],
    'object-curly-newline': [
      WARN,
      { ObjectPattern: { multiline: true, minProperties: 1 }, ImportDeclaration: 'always' },
    ],
    'react/prop-types': OFF, // To be done in another refactor
    // 'react/jsx-filename-extension': [ERROR, { extensions: ['.js', '.jsx'] }],
    'no-param-reassign': [ERROR, { props: true, ignorePropertyModificationsFor: ['draft'] }],
    'no-use-before-define': [ERROR, { functions: false }],
    'no-plusplus': [ERROR, { allowForLoopAfterthoughts: true }],
    'react-refresh/only-export-components': OFF, // To be done in another refactor
    'react-hooks/exhaustive-deps': OFF, // To be done in another refactor
    'react-hooks/rules-of-hooks': OFF, // To be done in another refactor
  },
  overrides: [
    {
      files: ['src/scripts/**', 'jest.config.js'],
      env: { node: true },
    },
    {
      files: ['**.test.**', '**.spec.**'],
      env: {
        node: true,
        jest: true,
      },
    },
  ],
  settings: {
    react: { version: '18.2' },
    'import/resolver': {
      alias: {
        map: [
          ['src', './src'],
        ],
        extensions: ['.ts', '.js', '.jsx', '.json'],
      },
      node: {
        extensions: ['.ts', '.js', '.jsx', '.json'],
        paths: ['node_modules/', 'node_modules/@types', 'src/'],
      },
    },
  },
};
