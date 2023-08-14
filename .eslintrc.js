const { OFF, WARN, ERROR } = {
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
  extends: ['plugin:react/recommended', 'airbnb', 'plugin:cypress/recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'prettier', 'cypress', 'jsx'],
  rules: {
    'max-len': [WARN, { code: 120, ignorePattern: '^import\\W.*', ignoreTrailingComments: true }],
    'object-curly-newline': [
      WARN,
      { ObjectPattern: { multiline: true, minProperties: 1 }, ImportDeclaration: 'always' },
    ],
    'react/prop-types': OFF, // To be done in another refactor
    'react/react-in-jsx-scope': OFF,
    'react/jsx-filename-extension': [ERROR, { extensions: ['.js', '.jsx'] }],
    'no-param-reassign': [ERROR, { props: true, ignorePropertyModificationsFor: ['draft'] }],
    'no-use-before-define': [ERROR, { functions: false }],
    'no-plusplus': [ERROR, { allowForLoopAfterthoughts: true }],
    'jest/expect-expect': OFF,
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
    'import/resolver': {
      alias: {
        map: [
          ['src', './src'],
        ],
        extensions: ['.ts', '.js', '.jsx', '.json']
      },
      node: {
        extensions: ['.ts', '.js', '.jsx', '.json'],
        paths: ['node_modules/', 'node_modules/@types', 'src/'],
      },
    },
  },
};
